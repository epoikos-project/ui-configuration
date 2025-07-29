import { Simulation } from "@/types/Simulation";
import { createContext, JSX, useEffect, useState } from "react";
import { useSubscription } from "../hooks/useSubscription";

export const SimulationContext = createContext<{
  simulation: Simulation;
  update: (sim: Simulation) => void;
}>({
  simulation: null as unknown as Simulation,
  update: () => {},
});

export function SimulationProvider({
  children,
  simulation,
}: {
  children: React.ReactNode;
  simulation: Simulation;
}): JSX.Element {
  const [sim, setSim] = useState<Simulation>(simulation);

  useEffect(() => {
    setSim(simulation);
  }, [simulation.id]);

  useSubscription(`simulation.${simulation.id}.tick`, (msg) => {
    const data: { tick: number } = msg.json();
    setSim((s) => ({ ...s, tick: data.tick }));
  });
  useSubscription(`simulation.${simulation.id}.stopped`, () => {
    setSim((s) => ({ ...s, running: false }));
  });
  useSubscription(`simulation.${simulation.id}.started`, () => {
    setSim((s) => ({ ...s, running: true }));
  });

  return (
    <SimulationContext.Provider value={{ simulation: sim, update: setSim }}>
      {children}
    </SimulationContext.Provider>
  );
}
