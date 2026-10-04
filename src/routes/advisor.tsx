import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, RecommendationCard } from "@/components/ui-kit";
import { FARM } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";

export const Route = createFileRoute("/advisor")({
  head: () => ({
    meta: [
      { title: "Irrigation Advisor — Bharat Soil Oracle" },
      { name: "description", content: "Explainable, rule-based irrigation decision with water, pump runtime and energy." },
      { property: "og:title", content: "Irrigation Advisor — Bharat Soil Oracle" },
      { property: "og:description", content: "Explainable, rule-based irrigation decision with water, pump runtime and energy." },
    ],
  }),
  component: Advisor,
});

function Advisor() {
  const { scenario: s, result: r } = useScenario();
  const rows: [string, string][] = [
    ["Surface soil moisture", `${s.soilMoisture}%`],
    ["Root-zone moisture", `${r.rootZone}%`],
    ["Crop stage", s.cropStage],
    ["ET0", `${s.et0} mm/day`],
    ["Crop water demand (ETc)", `${r.etc} mm/day`],
    ["Rainfall forecast (48 h)", `${s.rainForecast} mm`],
    ["Last irrigation", `${s.lastIrrigationDays} days ago`],
  ];
  const out: [string, string][] = [
    ["Recommendation", r.decision],
    ["Timing", r.timing],
    ["Water required", `${r.netMm} mm net · ${(r.waterL / 1000).toFixed(1)} m³`],
    ["Pump runtime", `${r.pumpHours} h`],
    ["Estimated energy", `${r.energyKwh} kWh (₹${r.costInr})`],
    ["Confidence", `${r.confidence}%`],
  ];
  return (
    <>
      <PageHeader title="Irrigation Advisor" sub="Deterministic rule engine — no AI model makes this decision. Every step is shown below." />
      <div className="grid gap-4 lg:grid-cols-3">
        <RecommendationCard showReasons />
        <Card title="Engine inputs"><KV rows={rows} /></Card>
        <Card title="Engine outputs"><KV rows={out} /></Card>
        <Card title="Decision rules (evaluated top-down)" className="lg:col-span-3">
          <ol className="list-decimal space-y-1.5 pl-5 text-sm">
            <li><b>WAIT</b> if root-zone ≥ 95% of field capacity (45%).</li>
            <li><b>SKIP — RAIN EXPECTED</b> if forecast ≥ 10 mm, effective rain (80%) ≥ 2 × ETc, and depletion &lt; 85%.</li>
            <li><b>IRRIGATE NOW</b> if depletion ≥ stage MAD (Initial 50%, Vegetative 55%, Flowering 40%, Maturity 65%).</li>
            <li><b>IRRIGATE SOON</b> if days-to-stress ≤ 2 (usable water ÷ ETc).</li>
            <li>Otherwise <b>WAIT</b>.</li>
          </ol>
          <div className="mt-3 grid gap-1 font-mono text-xs text-muted-foreground">
            <div>ETc = ET0 × Kc(stage)</div>
            <div>Depletion = (FC − θroot) ÷ (FC − WP)</div>
            <div>Net mm = min(35, (FC − θroot) × rootDepth − effective rain) · Gross = Net ÷ 0.9</div>
            <div>Water (L) = Gross mm × {FARM.areaM2} m² · Pump h = m³ ÷ 30 · kWh = h × 3.7 kW</div>
          </div>
        </Card>
      </div>
    </>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="divide-y text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4 py-2">
          <dt className="text-muted-foreground">{k}</dt>
          <dd className="text-right font-mono font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
