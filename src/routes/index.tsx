import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, EstimateBadge, PageHeader, RecommendationCard, Stat } from "@/components/ui-kit";
import { FARM, moistureHistory } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bharat Soil Oracle" },
      { name: "description", content: "Plot-level soil, weather and irrigation overview for Indian smallholder farms." },
      { property: "og:title", content: "Dashboard — Bharat Soil Oracle" },
      { property: "og:description", content: "Plot-level soil, weather and irrigation overview for Indian smallholder farms." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { scenario: s, result: r } = useScenario();
  const hist = moistureHistory(s);
  const irrigating = r.decision.startsWith("IRRIGATE");
  return (
    <>
      <PageHeader title={FARM.name} sub={`${FARM.location} · ${FARM.crop} · ${FARM.areaAcre} acre (${FARM.areaM2} m²)`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-4 lg:col-span-2 xl:grid-cols-4">
          <Stat label="Surface soil moisture" value={s.soilMoisture} unit="% VWC" hint="0–15 cm sensor" />
          <Stat label="Root-zone moisture" value={r.rootZone} unit="% VWC" hint={r.soilStatus} />
          <Stat label="Crop stage" value={<span className="text-xl">{s.cropStage}</span>} hint={`Kc ${r.kc}`} />
          <Stat label="Temperature" value={s.temperature} unit="°C" />
          <Stat label="Rain forecast (48 h)" value={s.rainForecast} unit="mm" />
          <Stat label="Irrigation status" value={<span className="text-xl">{irrigating ? "Required" : "Pump off"}</span>} hint={`Last: ${s.lastIrrigationDays} d ago`} />
          <Stat label="Water impact" value={(r.waterSavedL / 1000).toFixed(0)} unit="m³ saved" hint="vs calendar flood" />
          <Stat label="Energy impact" value={r.energySavedKwh} unit="kWh saved" hint="per irrigation cycle" />
        </div>
        <RecommendationCard />
        <Card title="Soil moisture — last 14 days" className="lg:col-span-3" right={<span className="text-[11px] text-muted-foreground">Simulated sensor series</span>}>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={hist}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis domain={[10, 55]} fontSize={11} unit="%" />
                <Tooltip />
                <ReferenceLine y={45} stroke="var(--water)" strokeDasharray="4 4" label={{ value: "Field capacity", fontSize: 10 }} />
                <ReferenceLine y={45 - r.mad * 30} stroke="var(--destructive)" strokeDasharray="4 4" label={{ value: "Stress threshold", fontSize: 10 }} />
                <Area dataKey="root" name="Root zone" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
                <Area dataKey="surface" name="Surface" stroke="var(--chart-2)" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="mt-4"><EstimateBadge /></div>
    </>
  );
}
