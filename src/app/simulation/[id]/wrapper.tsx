"use client";

import dynamic from "next/dynamic";
import { SimProps } from "./app";

const AppWithoutSSR = dynamic(() => import("./app"), { ssr: false });
const NatsSubscriber = dynamic(() => import("../../components/NatsProvider"), {
  ssr: false,
});

export default function Wrapper(props: SimProps) {
  const { world, simulation, agents } = props;
  return (
    <>
      <NatsSubscriber>
        <div id="app">
          <h1>Simulation: {simulation.id}</h1>

          <h2>Running: {simulation.running.toString()} </h2>

          <h3>
            World Size: {world.size_x} x {world.size_y}
          </h3>
          <h3>World ID: {world.id}</h3>
          <h3>Agents: {agents.length}</h3>
        </div>
        <AppWithoutSSR {...props} />
      </NatsSubscriber>
    </>
  );
}
