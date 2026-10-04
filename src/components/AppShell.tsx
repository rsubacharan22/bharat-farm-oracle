import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Droplets, Gauge, Layers, Leaf, SlidersHorizontal, Sprout } from "lucide-react";
import { FARM } from "@/lib/engine";

const NAV = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/twin", label: "Digital Twin", icon: Layers },
  { to: "/advisor", label: "Irrigation Advisor", icon: Droplets },
  { to: "/health", label: "Crop Health", icon: Leaf },
  { to: "/impact", label: "Impact", icon: Activity },
  { to: "/simulator", label: "What-if Simulator", icon: SlidersHorizontal },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="border-b bg-sidebar md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sprout className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight">Bharat Soil Oracle</div>
            <div className="text-[11px] text-muted-foreground">Plot Digital Twin OS</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:pb-0">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent font-medium text-primary" }}
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden px-4 pt-6 text-[11px] text-muted-foreground md:block">
          <div className="font-medium text-foreground">{FARM.name}</div>
          <div>{FARM.location}</div>
          <div className="mt-3 rounded border border-warning/50 bg-warning/10 p-2 text-foreground">
            Prototype: all sensor, weather and satellite data is deterministic simulation. No live IoT connected.
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
