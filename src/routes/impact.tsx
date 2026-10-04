import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EstimateBadge, PageHeader, Stat } from "@/components/ui-kit";
import { useScenario } from "@/lib/scenario";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — Bharat Soil Oracle" },
      { name: "description", content: "Model-estimated water, pump energy and cost per irrigation cycle versus calendar flooding." },
      { property: "og:title", content: "Impact — Bharat Soil Oracle" },
      { property: "og:description", content: "Model-estimated water, pump energy and cost per irrigation cycle versus calendar flooding." },
    ],
  }),
  component: Impact,
});

function Impact() {
  const { result: r } = useScenario();
  const data = [
    { metric: "Water (m³)", Baseline: Math.round(r.baselineWaterL / 1000), Oracle: Math.round(r.waterL / 1000) },
    { metric: "Energy (kWh)", Baseline: r.baselineEnergyKwh, Oracle: r.energyKwh },
  ];
  return (
    <>
      <PageHeader title="Impact" sub="Per irrigation cycle, comparing the Oracle recommendation to the farmer's conventional calendar flood irrigation." />
      <div className="mb-4 rounded-md border border-warning/50 bg-warning/10 p-3 text-sm">
        <b>Prototype scenario estimate.</b> Figures come from the model formulas and simulated inputs; they are not experimentally validated savings.
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Water required" value={(r.waterL / 1000).toFixed(1)} unit="m³" />
        <Stat label="Water saved" value={(r.waterSavedL / 1000).toFixed(1)} unit="m³" />
        <Stat label="Pump runtime" value={r.pumpHours} unit="h" />
        <Stat label="Energy consumed" value={r.energyKwh} unit="kWh" />
        <Stat label="Energy saved" value={r.energySavedKwh} unit="kWh" hint={`≈ ${(r.energySavedKwh * 0.71).toFixed(1)} kg CO₂ (0.71 kg/kWh grid)`} />
        <Stat label="Estimated cost" value={`₹${r.costInr}`} hint={`₹${r.costSavedInr} saved @ ₹6.5/kWh`} />
      </div>
      <Card title="Baseline vs Oracle" className="mt-4" right={<EstimateBadge />}>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="metric" fontSize={12} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Baseline" fill="var(--muted-foreground)" />
              <Bar dataKey="Oracle" fill="var(--primary)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Baseline: 50 mm calendar flood event at 60% efficiency over ~60% of the plot. Oracle: drip at 90% efficiency, only when rules require.</p>
      </Card>
    </>
  );
}
