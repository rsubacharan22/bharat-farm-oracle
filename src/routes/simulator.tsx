import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, PageHeader, RecommendationCard, Stat } from "@/components/ui-kit";
import { CROP_STAGES, PRESETS, type CropStage, type Scenario } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/simulator")({
  head: () => ({
    meta: [
      { title: "What-if Simulator — Bharat Soil Oracle" },
      { name: "description", content: "Change soil moisture, rain, crop stage and ET0 and watch the recommendation update." },
      { property: "og:title", content: "What-if Simulator — Bharat Soil Oracle" },
      { property: "og:description", content: "Change soil moisture, rain, crop stage and ET0 and watch the recommendation update." },
    ],
  }),
  component: Simulator,
});

function Slider({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono font-semibold">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[var(--primary)]" />
    </label>
  );
}

function Simulator() {
  const { scenario: s, setScenario, result: r, reset } = useScenario();
  const set = (p: Partial<Scenario>) => setScenario({ ...s, ...p });
  return (
    <>
      <PageHeader title="What-if Simulator" sub="Every change re-runs the engine and updates the Digital Twin, Advisor, Crop Health and Impact pages." />
      <div className="mb-4 flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} variant="outline" size="sm" onClick={() => set(p.s)}>
            {p.name} <span className="ml-1 text-muted-foreground">→ {p.expected}</span>
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={reset}>Reset to live demo</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Scenario inputs" className="lg:col-span-2">
          <div className="space-y-5">
            <Slider label="Soil moisture (surface)" value={s.soilMoisture} min={10} max={55} step={1} unit="%" onChange={(v) => set({ soilMoisture: v })} />
            <Slider label="Rain forecast (48 h)" value={s.rainForecast} min={0} max={50} step={1} unit="mm" onChange={(v) => set({ rainForecast: v })} />
            <Slider label="ET0" value={s.et0} min={2} max={9} step={0.1} unit="mm/day" onChange={(v) => set({ et0: v })} />
            <Slider label="Days since last irrigation" value={s.lastIrrigationDays} min={0} max={15} step={1} unit="d" onChange={(v) => set({ lastIrrigationDays: v })} />
            <div>
              <div className="mb-2 text-sm">Crop stage</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {CROP_STAGES.map((c: CropStage) => (
                  <Button key={c} variant={s.cropStage === c ? "default" : "outline"} size="sm" onClick={() => set({ cropStage: c })}>{c}</Button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Root zone" value={r.rootZone} unit="%" hint={r.soilStatus} />
            <Stat label="ETc" value={r.etc} unit="mm/d" />
            <Stat label="NDVI" value={r.ndvi} />
            <Stat label="Water saved" value={(r.waterSavedL / 1000).toFixed(0)} unit="m³" />
          </div>
        </Card>
        <div className="space-y-3">
          <RecommendationCard showReasons />
          <Link to="/twin" className="block text-sm text-primary underline">View updated Digital Twin →</Link>
        </div>
      </div>
    </>
  );
}
