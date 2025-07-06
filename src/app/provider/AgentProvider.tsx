import { Agent } from "@/types/Agent";
import { createContext, JSX, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscription } from "../hooks/useSubscription";
import { AgentMovedMessage } from "@/types/messages/world/AgentMovedMessage";
import { ResourceHarvestedMessage } from "../../types/messages/world/ResourceHarvestedMessage";
import getAgent from "../simulation/[id]/actions";

export const AgentContext = createContext<{
  agent: Agent;
  update: (agents: Agent) => void;
  refresh: () => void;
}>({
  agent: null as unknown as Agent,
  update: () => {},
  refresh: () => {},
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

  console.log("AgentProvider initialized with agent:", agent);

  useEffect(() => {
    setAgent(agent);
  }, [agent]);

  const refresh = () => {
    getAgent(simulation.id, ag.id).then((data) => {
      console.log("Agent data refreshed:", data);
      setAgent(data);
    });
  };

  useSubscription(
    `simulation.${simulation.id}.agent.${agent.id}.moved`,
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
    if (data.harvester_id === agent.id) {
      setAgent((a) => ({
        ...a,
        energy_level: data.new_energy_level,
      }));
    }
  });

  return (
    <AgentContext.Provider
      value={{ agent: ag ?? agent, update: setAgent, refresh }}
    >
      {children}
    </AgentContext.Provider>
  );
}
