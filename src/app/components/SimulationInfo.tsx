import { useState } from "react";
import { SimProps } from "../simulation/[id]/app";
import { useSubscription } from "../hooks/useSubscription";
import { useSimulation } from "../hooks/useSimulation";

export function SimulationInfo(props: SimProps) {
  const { world, agents } = props;
  const { simulation } = useSimulation();

  return (
    <div >
      <h1>Simulation: {simulation.id}</h1>

      <h2>Running: {simulation.running.toString()} </h2>
      <h3>Current Tick: {simulation.tick}</h3>
      <h3>
        World Size: {world.size_x} x {world.size_y}
      </h3>
      <h3>World ID: {world.id}</h3>
      <h3>Agents: {agents.length}</h3>
    </div>
  )
}
