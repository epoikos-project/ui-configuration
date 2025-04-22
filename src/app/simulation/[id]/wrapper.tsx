"use client";

import dynamic from "next/dynamic";
import { SimProps } from "./app";
import { SimulationProvider } from "@/app/provider/SimulationProvider";
import { AgentsProvider } from "@/app/provider/AgentsProvider";

const AppWithoutSSR = dynamic(() => import("./app"), { ssr: false });
const NatsSubscriber = dynamic(() => import("../../provider/NatsProvider"), {
  ssr: false,
});

export default function Wrapper(props: SimProps) {
  return (
    <>
      <NatsSubscriber>
        <SimulationProvider simulation={props.simulation}>
          <AgentsProvider agents={props.agents}>
            <AppWithoutSSR {...props} />
          </AgentsProvider>
        </SimulationProvider>
      </NatsSubscriber>
    </>
  );
}
