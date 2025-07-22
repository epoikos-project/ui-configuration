import { Agent } from "@/types/Agent";
import { createContext, JSX, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscription } from "../hooks/useSubscription";
import { AgentDeadMessage } from "@/types/messages/world/AgentDeadMessage";

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

  useEffect(() => {
    setAgents(agents);
  }, [agents]);

  useSubscription(`simulation.${simulation.id}.agent.*.placed`, (msg) => {
    const data: Agent = msg.json();
    setAgents((ag) => [...ag, data]);
  });

  useSubscription(`simulation.${simulation.id}.agent.*.dead`, (msg) => {
    const data: AgentDeadMessage = msg.json();
    setAgents((ag) =>
      ag.map((agent) =>
        agent.id === data.id ? { ...agent, dead: true } : agent
      )
    );
  });

  return (
    <AgentsContext.Provider value={{ agents: ags, update: setAgents }}>
      {children}
    </AgentsContext.Provider>
  );
}
