import { useContext } from "react";
import { AgentContext } from "../provider/AgentProvider";

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
};
