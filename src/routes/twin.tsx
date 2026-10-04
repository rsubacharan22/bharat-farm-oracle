import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Stat } from "@/components/ui-kit";
import { FIELD_CAPACITY, WILTING_POINT, STAGE_PARAMS } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";

export const Route = createFileRoute("/twin")({
  head: () => ({
    meta: [
      { title: "Digital Twin — Bharat Soil Oracle" },
      { name: "description", content: "Live visual model of soil water, crop demand and vegetation for one plot." },
      { property: "og:title", content: "Digital Twin — Bharat Soil Oracle" },
      { property: "og:description", content: "Live visual model of soil water, crop demand and vegetation for one plot." },
    ],
  }),
  component: Twin,
});

function Layer({ label, depth, value }: { label: string; depth: string; value: number }) {
  const pct = Math.min(100, (value / 55) * 100);
  return (
    <div className="relative flex h-24 items-center border-t border-border/60 px-4" style={{ background: `color-mix(in oklch, var(--water) ${pct * 0.6}%, var(--soil))` }}>
      <div className="text-soil-foreground">
        <div className="text-xs opacity-80">{depth}</div>
        <div className="font-semibold">{label}</div>
      </div>
      <div className="ml-auto font-mono text-2xl font-semibold text-soil-foreground">{value}%</div>
    </div>
  );
}

function Twin() {
  const { scenario: s, result: r } = useScenario();
  const p = STAGE_PARAMS[s.cropStage];
  const plantH = { Initial: 20, Vegetative: 45, Flowering: 65, Maturity: 60 }[s.cropStage];
  return (
    <>
      <PageHeader title="Plot Digital Twin" sub="Fused state from soil sensors, weather, forecast, crop stage and simulated satellite indicators. Updates instantly with simulator inputs." />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card title="Soil profile cross-section" className="lg:col-span-3">
          <div className="overflow-hidden rounded-md border">
            <div className="relative h-36 bg-sky">
              <div className="absolute right-4 top-3 text-right text-xs text-foreground">
                <div>ET0 {s.et0} mm/d · {s.temperature}°C</div>
                <div>Rain 48 h: {s.rainForecast} mm</div>
              </div>
              {s.rainForecast > 0 && (
                <div className="absolute left-1/3 top-3 font-mono text-xs text-water">{"│ ".repeat(Math.min(12, Math.ceil(s.rainForecast / 2)))}</div>
              )}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around px-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {s.cropStage === "Flowering" && <div className="mb-0.5 h-2 w-2 rounded-full bg-warning" />}
                    <div className="w-1.5 rounded-t transition-all" style={{ height: plantH, background: `color-mix(in oklch, var(--primary) ${r.ndvi * 120}%, var(--warning))` }} />
                  </div>
                ))}
              </div>
            </div>
            <Layer label="Surface sensor" depth="0–15 cm" value={s.soilMoisture} />
            <Layer label="Root-zone sensor" depth="30–45 cm" value={r.rootZone} />
            <Layer label="Deep layer (modelled)" depth="60 cm" value={r.deepMoisture} />
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Field capacity {FIELD_CAPACITY}% · Wilting point {WILTING_POINT}% · Effective root depth {p.rootMm} mm
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 lg:col-span-2 content-start">
          <Stat label="Soil-water status" value={<span className="text-lg">{r.soilStatus}</span>} hint={`Depletion ${Math.round(r.depletion * 100)}% / MAD ${Math.round(r.mad * 100)}%`} />
          <Stat label="Crop stage" value={<span className="text-lg">{s.cropStage}</span>} hint={p.day} />
          <Stat label="ET0" value={s.et0} unit="mm/d" />
          <Stat label="Crop water demand" value={r.etc} unit="mm/d" hint={`Kc ${r.kc}`} />
          <Stat label="Rainfall forecast" value={s.rainForecast} unit="mm" hint={`${r.effectiveRain} mm effective`} />
          <Stat label="Vegetation (NDVI)" value={r.ndvi} hint="Simulated satellite" />
          <Stat label="Sensor confidence" value={r.sensorConfidence} unit="%" hint="2 of 2 probes healthy" />
          <Stat label="Days to stress" value={Math.max(0, r.daysToStress)} unit="d" />
          <div className="col-span-2 text-xs text-muted-foreground">Last updated: simulated snapshot · 04 Oct 2026, 05:30 IST</div>
        </div>
      </div>
    </>
  );
}
