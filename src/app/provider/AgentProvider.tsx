import { Agent } from "@/types/Agent";
import { createContext, JSX, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscription } from "../hooks/useSubscription";
import { AgentMovedMessage } from "@/types/messages/world/AgentMovedMessage";
import { AgentDeadMessage } from "../../types/messages/world/AgentDeadMessage";
import { ResourceHarvestedMessage } from "../../types/messages/world/ResourceHarvestedMessage";
import { getAgent, moveAgent } from "../simulation/[id]/actions";

export const AgentContext = createContext<{
  agent: Agent;
  update: (agents: Agent) => void;
  refresh: () => void;
  moveTo: (x: number, y: number) => void;
}>({
  agent: null as unknown as Agent,
  update: () => {},
  refresh: () => {},
  moveTo: () => {},
});

export function AgentProvider({
  children,
  agentId,
  initialAgent = {} as Agent,
}: {
  children: React.ReactNode;
  agentId: string;
  initialAgent?: Agent;
}): JSX.Element {
  const [ag, setAgent] = useState<Agent>(initialAgent);
  const { simulation } = useSimulation();

  console.log("AgentProvider initialized with agent:", agentId);

  useEffect(() => {
    getAgent(simulation.id, agentId).then((data) => {
      console.log("Agent data refreshed:", data);
      setAgent(data);
    });
  }, [agentId, simulation.id]);

  const refresh = () => {
    getAgent(simulation.id, ag.id).then((data) => {
      console.log("Agent data refreshed:", data);
      setAgent(data);
    });
  };

  useSubscription(
    `simulation.${simulation.id}.agent.${agentId}.moved`,
    (msg) => {
      console.log("Agent moved:", msg);
      const data: AgentMovedMessage = msg.json();
      setAgent((a) => ({
        ...a,
        x_coord: data.new_location[0],
        y_coord: data.new_location[1],
        energy_level: data.new_energy_level,
      }));
    }
  );

  useSubscription(`simulation.${simulation.id}.resource.*.harvested`, (msg) => {
    console.log("Resource harvested:", msg);
    const data: ResourceHarvestedMessage = msg.json();
    if (data.harvester_id === agentId) {
      setAgent((a) => ({
        ...a,
        energy_level: data.new_energy_level,
      }));
    }
  });

  useSubscription(
    `simulation.${simulation.id}.agent.${agentId}.dead`,
    (msg) => {
      console.log("Agent died:", msg);
      const data: AgentDeadMessage = msg.json();
      setAgent((a) => ({
        ...a,
        dead: true,
      }));
    }
  );

  return (
    <AgentContext.Provider
      value={{
        agent: ag ?? initialAgent,
        update: setAgent,
        refresh,
        moveTo: (x, y) => moveAgent(simulation.id, ag.id, x, y),
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}
