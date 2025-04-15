"use client";

import dynamic from "next/dynamic";

const AppWithoutSSR = dynamic(() => import("./app"), { ssr: false });
const NatsSubscriber = dynamic(() => import("./NatsSubscriber"), {
  ssr: false,
});

export default function Wrapper({ world, sim }: any) {
  console.log(sim);
  return (
    <>
      <NatsSubscriber />
      <div id="app">
        <h1>Simulation: {sim.id}</h1>

        <h2>Running: {sim.running.toString()} </h2>

        <h3>
          World Size: {world.world_data.size_x} x {world.world_data.size_y}
        </h3>
        <h3>World ID: {world.world_data.id}</h3>
      </div>
      <AppWithoutSSR world_config={world} />
    </>
  );
}
