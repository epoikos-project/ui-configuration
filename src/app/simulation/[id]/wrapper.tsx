"use client";

import dynamic from "next/dynamic";
import { SimProps } from "./app";
import { SimulationProvider } from "@/app/provider/SimulationProvider";
import { AgentsProvider } from "@/app/provider/AgentsProvider";
import { AgentLogsProvider } from "@/app/provider/AgentLogsProvider";
import { DebugLogsProvider } from "@/app/provider/DebugLogsProvider";

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
            <AgentLogsProvider>
              <DebugLogsProvider>
                <AppWithoutSSR {...props} />
              </DebugLogsProvider>
            </AgentLogsProvider>
          </AgentsProvider>
        </SimulationProvider>
      </NatsSubscriber>
    </>
  );
}
