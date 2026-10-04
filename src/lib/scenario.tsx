import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_SCENARIO, runEngine, type Result, type Scenario } from "./engine";

type Ctx = { scenario: Scenario; setScenario: (s: Scenario) => void; result: Result; reset: () => void };
const ScenarioCtx = createContext<Ctx | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario>(DEFAULT_SCENARIO);
  const result = useMemo(() => runEngine(scenario), [scenario]);
  return (
    <ScenarioCtx.Provider value={{ scenario, setScenario, result, reset: () => setScenario(DEFAULT_SCENARIO) }}>
      {children}
    </ScenarioCtx.Provider>
  );
}

export function useScenario() {
  const c = useContext(ScenarioCtx);
  if (!c) throw new Error("useScenario outside provider");
  return c;
}
