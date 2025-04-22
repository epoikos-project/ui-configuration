import { useContext } from "react";
import { AgentsContext } from "../provider/AgentsProvider";

export const useAgents = () => {
  const context = useContext(AgentsContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
