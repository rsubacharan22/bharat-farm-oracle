// Bharat Soil Oracle — deterministic, explainable irrigation engine.
// No ML / LLM. Every number below is a transparent rule or FAO-56 style formula.

export type CropStage = "Initial" | "Vegetative" | "Flowering" | "Maturity";
export const CROP_STAGES: CropStage[] = ["Initial", "Vegetative", "Flowering", "Maturity"];

export type Decision = "IRRIGATE NOW" | "IRRIGATE SOON" | "WAIT" | "SKIP — RAIN EXPECTED";

export interface Scenario {
  soilMoisture: number; // % VWC, surface sensor 0–15 cm
  rainForecast: number; // mm expected in next 48 h
  cropStage: CropStage;
  et0: number; // mm/day reference evapotranspiration
  lastIrrigationDays: number; // days since last irrigation
  temperature: number; // °C
}

export const FARM = {
  name: "Patil Family Plot #7",
  farmer: "Ramesh Patil",
  location: "Shirur, Pune district, Maharashtra",
  coords: "18.83° N, 74.37° E",
  crop: "Soybean (JS-335)",
  areaAcre: 1,
  areaM2: 4047,
  soil: "Medium black clay-loam",
  irrigation: "Drip (90% efficiency)",
  pump: "5 HP submersible · 3.7 kW · 30 m³/h",
};

// Soil hydraulic constants (% VWC)
export const FIELD_CAPACITY = 45;
export const WILTING_POINT = 15;
const DRIP_EFFICIENCY = 0.9;
const PUMP_KW = 3.7;
const PUMP_FLOW_M3H = 30;
const MAX_EVENT_MM = 35;
const TARIFF_INR_KWH = 6.5;
// Baseline = conventional calendar flood irrigation the farmer would otherwise do
const BASELINE_EVENT_MM = 50;
const BASELINE_EFFICIENCY = 0.6;

export const STAGE_PARAMS: Record<CropStage, { kc: number; mad: number; rootMm: number; day: string }> = {
  Initial: { kc: 0.4, mad: 0.5, rootMm: 150, day: "Day 0–20" },
  Vegetative: { kc: 0.8, mad: 0.55, rootMm: 250, day: "Day 21–45" },
  Flowering: { kc: 1.15, mad: 0.4, rootMm: 300, day: "Day 46–75" },
  Maturity: { kc: 0.6, mad: 0.65, rootMm: 350, day: "Day 76–100" },
};

export const DEFAULT_SCENARIO: Scenario = {
  soilMoisture: 33,
  rainForecast: 2,
  cropStage: "Flowering",
  et0: 5.2,
  lastIrrigationDays: 6,
  temperature: 33,
};

export const PRESETS: { name: string; expected: string; s: Partial<Scenario> }[] = [
  { name: "Scenario 1 · Dry flowering", expected: "IRRIGATE NOW", s: { soilMoisture: 22, rainForecast: 0, cropStage: "Flowering" } },
  { name: "Scenario 2 · Rain coming", expected: "SKIP — RAIN EXPECTED", s: { soilMoisture: 22, rainForecast: 20, cropStage: "Flowering" } },
  { name: "Scenario 3 · Wet soil", expected: "WAIT", s: { soilMoisture: 48, rainForecast: 0 } },
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

export interface Result {
  decision: Decision;
  timing: string;
  rootZone: number;
  deepMoisture: number;
  depletion: number; // fraction of available water used
  mad: number;
  kc: number;
  etc: number; // crop water demand mm/day
  effectiveRain: number;
  daysToStress: number;
  soilStatus: "Saturated" | "Adequate" | "Mild stress" | "Water stress" | "Severe stress";
  netMm: number;
  grossMm: number;
  waterL: number;
  pumpHours: number;
  energyKwh: number;
  costInr: number;
  baselineWaterL: number;
  baselineEnergyKwh: number;
  waterSavedL: number;
  energySavedKwh: number;
  costSavedInr: number;
  confidence: number; // 0–100
  sensorConfidence: number;
  ndvi: number;
  reasons: string[];
}

export function runEngine(s: Scenario): Result {
  const p = STAGE_PARAMS[s.cropStage];
  // Root zone (30–45 cm) lags the surface sensor: deeper soil dries slower.
  const rootZone = r1(clamp(s.soilMoisture * 0.9 + 5, 5, 55));
  const deepMoisture = r1(clamp(s.soilMoisture * 0.8 + 9, 5, 55));
  const taw = FIELD_CAPACITY - WILTING_POINT;
  const depletion = clamp((FIELD_CAPACITY - rootZone) / taw, 0, 1);
  const thresholdVwc = FIELD_CAPACITY - p.mad * taw;
  const etc = r1(s.et0 * p.kc);
  const effectiveRain = r1(s.rainForecast >= 5 ? s.rainForecast * 0.8 : 0);
  const availAboveThresholdMm = ((rootZone - thresholdVwc) / 100) * p.rootMm;
  const daysToStress = r1(availAboveThresholdMm / Math.max(etc, 0.1));
  const deficitMm = Math.max(0, ((FIELD_CAPACITY - rootZone) / 100) * p.rootMm);

  const reasons: string[] = [];
  let decision: Decision;
  let timing: string;

  reasons.push(
    `Root-zone moisture ${rootZone}% vs stress threshold ${r1(thresholdVwc)}% (${s.cropStage}: MAD ${Math.round(p.mad * 100)}% of available water).`,
  );
  reasons.push(`Crop water demand ETc = ET0 ${s.et0} × Kc ${p.kc} = ${etc} mm/day.`);

  if (rootZone >= FIELD_CAPACITY * 0.95) {
    decision = "WAIT";
    timing = "Re-check in 48 h";
    reasons.push(`Soil is at or above ~field capacity (${FIELD_CAPACITY}%); extra water would drain below roots.`);
  } else if (s.rainForecast >= 10 && effectiveRain >= 2 * etc && depletion < 0.85) {
    decision = "SKIP — RAIN EXPECTED";
    timing = "Postpone; re-evaluate after rain";
    reasons.push(
      `${s.rainForecast} mm rain forecast → ~${effectiveRain} mm effective, covering ≥2 days of crop demand.`,
    );
    reasons.push(`Depletion ${Math.round(depletion * 100)}% is below the 85% emergency limit, so the crop can safely wait.`);
  } else if (daysToStress <= 0) {
    decision = "IRRIGATE NOW";
    timing = "Today, 06:00–10:00 (low evaporation)";
    reasons.push(`Depletion ${Math.round(depletion * 100)}% already exceeds allowable ${Math.round(p.mad * 100)}%.`);
    if (s.cropStage === "Flowering") reasons.push("Flowering is the most yield-sensitive stage for soybean.");
    if (s.rainForecast < 10) reasons.push(`Only ${s.rainForecast} mm rain forecast — not enough to recover.`);
  } else if (daysToStress <= 2) {
    decision = "IRRIGATE SOON";
    timing = `Within ${Math.max(1, Math.ceil(daysToStress))} day(s), early morning`;
    reasons.push(`Crop reaches stress threshold in ~${daysToStress} day(s) at current demand.`);
  } else {
    decision = "WAIT";
    timing = `Re-check in ${Math.min(5, Math.floor(daysToStress))} day(s)`;
    reasons.push(`~${daysToStress} days of usable water remain in the root zone.`);
  }

  const irrigating = decision === "IRRIGATE NOW" || decision === "IRRIGATE SOON";
  const netMm = irrigating ? r1(Math.min(MAX_EVENT_MM, Math.max(0, deficitMm - effectiveRain))) : 0;
  const grossMm = r1(netMm / DRIP_EFFICIENCY);
  const waterL = Math.round(grossMm * FARM.areaM2);
  const pumpHours = r1(waterL / 1000 / PUMP_FLOW_M3H);
  const energyKwh = r1(pumpHours * PUMP_KW);
  const costInr = Math.round(energyKwh * TARIFF_INR_KWH);
  if (irrigating) reasons.push(`Apply ${netMm} mm net (${grossMm} mm gross at drip efficiency ${DRIP_EFFICIENCY * 100}%).`);

  const baselineWaterL = Math.round((BASELINE_EVENT_MM / BASELINE_EFFICIENCY) * FARM.areaM2 * 0.6);
  const baselineHours = baselineWaterL / 1000 / PUMP_FLOW_M3H;
  const baselineEnergyKwh = r1(baselineHours * PUMP_KW);
  const waterSavedL = Math.max(0, baselineWaterL - waterL);
  const energySavedKwh = r1(Math.max(0, baselineEnergyKwh - energyKwh));
  const costSavedInr = Math.round(energySavedKwh * TARIFF_INR_KWH);

  // Confidence: transparent penalties
  const sensorConfidence = 92;
  let conf = 94;
  const margin = Math.abs(daysToStress);
  if (margin < 0.5) conf -= 10;
  if (s.rainForecast >= 5 && s.rainForecast < 15) {
    conf -= 12;
    reasons.push("Rain forecast is in the uncertain 5–15 mm band; confidence reduced.");
  }
  if (s.lastIrrigationDays < 1 && irrigating) {
    conf -= 15;
    reasons.push("Irrigated <1 day ago — verify sensor reading before pumping.");
  }
  if (s.temperature > 38) conf -= 5;
  conf = Math.round(clamp(conf * (sensorConfidence / 100) + 8, 40, 98));

  const soilStatus: Result["soilStatus"] =
    rootZone >= FIELD_CAPACITY ? "Saturated" : depletion < p.mad * 0.6 ? "Adequate" : depletion < p.mad ? "Mild stress" : depletion < 0.8 ? "Water stress" : "Severe stress";

  const stageNdvi: Record<CropStage, number> = { Initial: 0.35, Vegetative: 0.62, Flowering: 0.74, Maturity: 0.55 };
  const ndvi = Math.round(clamp(stageNdvi[s.cropStage] - Math.max(0, depletion - p.mad) * 0.6, 0.1, 0.9) * 100) / 100;

  return {
    decision, timing, rootZone, deepMoisture, depletion, mad: p.mad, kc: p.kc, etc, effectiveRain, daysToStress,
    soilStatus, netMm, grossMm, waterL, pumpHours, energyKwh, costInr, baselineWaterL, baselineEnergyKwh,
    waterSavedL, energySavedKwh, costSavedInr, confidence: conf, sensorConfidence, ndvi, reasons,
  };
}

// Deterministic 14-day history ending at current surface moisture
export function moistureHistory(s: Scenario) {
  const out: { day: string; surface: number; root: number; rain: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const wave = Math.sin(i * 0.9) * 2.5;
    const surface = r1(clamp(s.soilMoisture + i * 0.9 + wave - (i === 6 ? 0 : 0), 10, 55));
    out.push({ day: i === 0 ? "Today" : `D-${i}`, surface, root: r1(clamp(surface * 0.9 + 5, 5, 55)), rain: i === 9 ? 12 : i === 10 ? 4 : 0 });
  }
  return out;
}

export function ndviSeries(s: Scenario, current: number) {
  return Array.from({ length: 10 }, (_, k) => {
    const i = 9 - k;
    return { week: i === 0 ? "Now" : `W-${i}`, ndvi: Math.round(clamp(current - i * 0.03 + Math.sin(i) * 0.02, 0.15, 0.9) * 100) / 100 };
  });
}

// Deterministic plot zones (simulated satellite pixels)
export function plotZones(ndvi: number, depletion: number) {
  const cells: { ndvi: number; moisture: number }[] = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 8; c++) {
      const h = Math.sin(r * 12.9898 + c * 78.233) * 43758.5453;
      const noise = h - Math.floor(h) - 0.5;
      const slope = c * 0.012; // east side slightly drier (slope)
      cells.push({ ndvi: clamp(ndvi + noise * 0.12 - slope, 0.1, 0.9), moisture: clamp(1 - depletion + noise * 0.2 - slope, 0, 1) });
    }
  return cells;
}
