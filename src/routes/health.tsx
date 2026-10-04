import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, PageHeader, Stat } from "@/components/ui-kit";
import { ndviSeries, plotZones } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";

export const Route = createFileRoute("/health")({
  head: () => ({
    meta: [
      { title: "Crop Health — Bharat Soil Oracle" },
      { name: "description", content: "Simulated satellite vegetation index and in-plot stress zones." },
      { property: "og:title", content: "Crop Health — Bharat Soil Oracle" },
      { property: "og:description", content: "Simulated satellite vegetation index and in-plot stress zones." },
    ],
  }),
  component: Health,
});

function Health() {
  const { scenario: s, result: r } = useScenario();
  const zones = plotZones(r.ndvi, r.depletion);
  const stressed = zones.filter((z) => z.ndvi < 0.45).length;
  const stressIdx = Math.round(Math.max(0, r.depletion - r.mad * 0.6) * 100);
  return (
    <>
      <PageHeader title="Crop Health" sub="Simulated Sentinel-2 style indicators (10 m pixels, deterministic) — not a live satellite feed." />
      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Plot NDVI" value={r.ndvi} />
        <Stat label="Water-stress index" value={stressIdx} unit="/100" />
        <Stat label="Stressed zones" value={stressed} unit={`/ ${zones.length}`} />
        <Stat label="Crop stage" value={<span className="text-xl">{s.cropStage}</span>} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Plot map · NDVI zones">
          <div className="grid grid-cols-8 gap-0.5 rounded-md border p-1">
            {zones.map((z, i) => (
              <div
                key={i}
                title={`NDVI ${z.ndvi.toFixed(2)}`}
                className="aspect-square rounded-sm"
                style={{ background: `color-mix(in oklch, var(--primary) ${Math.round(z.ndvi * 110)}%, var(--warning))` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>West (lower slope)</span><span>Low NDVI ← → High NDVI</span><span>East (upper slope)</span>
          </div>
        </Card>
        <Card title="NDVI trend — 10 weeks">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={ndviSeries(s, r.ndvi)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis domain={[0, 1]} fontSize={11} />
                <Tooltip />
                <Line dataKey="ndvi" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  );
}
