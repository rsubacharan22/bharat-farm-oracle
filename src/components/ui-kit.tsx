import type { ReactNode } from "react";
import type { Decision } from "@/lib/engine";
import { useScenario } from "@/lib/scenario";
import { cn } from "@/lib/utils";

export function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
    </div>
  );
}

export function Card({ title, children, className, right }: { title?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={cn("rounded-lg border bg-card p-4", className)}>
      {title && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, unit, hint }: { label: string; value: ReactNode; unit?: string; hint?: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-2xl font-semibold">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function decisionTone(d: Decision) {
  if (d === "IRRIGATE NOW") return "bg-destructive text-destructive-foreground";
  if (d === "IRRIGATE SOON") return "bg-warning text-warning-foreground";
  if (d === "SKIP — RAIN EXPECTED") return "bg-water text-water-foreground";
  return "bg-primary text-primary-foreground";
}

export function ConfidenceBar({ value }: { value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Confidence</span>
        <span className="font-mono text-foreground">{value}%</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function RecommendationCard({ showReasons = false }: { showReasons?: boolean }) {
  const { result: r } = useScenario();
  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className={cn("px-4 py-3", decisionTone(r.decision))}>
        <div className="text-xs uppercase tracking-wider opacity-80">Recommendation</div>
        <div className="text-2xl font-bold tracking-tight">{r.decision}</div>
        <div className="text-sm opacity-90">{r.timing}</div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Mini label="Water" value={(r.waterL / 1000).toFixed(1)} unit="m³" />
          <Mini label="Pump" value={r.pumpHours} unit="h" />
          <Mini label="Energy" value={r.energyKwh} unit="kWh" />
        </div>
        <ConfidenceBar value={r.confidence} />
        {showReasons && (
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            {r.reasons.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Mini({ label, value, unit }: { label: string; value: ReactNode; unit: string }) {
  return (
    <div className="rounded-md bg-muted p-2">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-lg font-semibold">
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export function EstimateBadge() {
  return (
    <span className="rounded border border-warning/50 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-foreground">
      Prototype scenario estimate
    </span>
  );
}
