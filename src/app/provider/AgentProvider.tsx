import { Agent } from "@/types/Agent";
import { createContext, JSX, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscription } from "../hooks/useSubscription";
import { AgentMovedMessage } from "@/types/messages/world/AgentMovedMessage";

export const AgentContext = createContext<{
  agent: Agent;
  update: (agents: Agent) => void;
}>({
  agent: null as unknown as Agent,
  update: () => {},
});

export function AgentProvider({
  children,
  agent,
}: {
  children: React.ReactNode;
  agent: Agent;
}): JSX.Element {
  const [ag, setAgent] = useState<Agent>(agent);

  const { simulation } = useSimulation();

  useEffect(() => {
    setAgent(agent);
  }, [agent]);

  useSubscription(
    `simulation.${simulation.id}.agent.${agent.id}.moved`,
    (msg) => {
      const data: AgentMovedMessage = msg.json();
      setAgent((a) => ({
        ...a,
        x_coord: data.new_location[0],
        y_coord: data.new_location[1],
      }));
    }
  );

  return (
    <AgentContext.Provider value={{ agent: ag, update: setAgent }}>
      {children}
    </AgentContext.Provider>
  );
}
