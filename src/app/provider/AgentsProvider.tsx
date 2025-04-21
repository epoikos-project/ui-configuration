import { Agent } from "@/types/Agent";
import { createContext, JSX, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscription } from "../hooks/useSubscription";

export const AgentsContext = createContext<{
  agents: Agent[];
  update: (agents: Agent[]) => void;
}>({
  agents: null as unknown as Agent[],
  update: () => {},
});

export function AgentsProvider({
  children,
  agents,
}: {
  children: React.ReactNode;
  agents: Agent[];
}): JSX.Element {
  const [ags, setAgents] = useState<Agent[]>(agents);

  const { simulation } = useSimulation();

  useSubscription(`simulation.${simulation.id}.agent.*.placed`, (msg) => {
    const data: Agent = msg.json();
    setAgents((ag) => [...ag, data]);
  });

  return (
    <AgentsContext.Provider value={{ agents: ags, update: setAgents }}>
      {children}
    </AgentsContext.Provider>
  );
}
