"use client";
import { useEffect, useRef, useState } from "react";
import { IRefPhaserGame, PhaserSimulation } from "./game/PhaserSimulation";
import { Simulation } from "@/types/Simulation";
import { World } from "@/types/World";
import { Agent } from "@/types/Agent";
import {
  Button,
  Card,
  FormControlLabel,
  Grid,
  Paper,
  Switch,
  Typography,
} from "@mui/material";
import { Home } from "./game/scences/Home";
import { AgentInfo } from "@/app/components/AgentInfo";
import { EventBus } from "./game/EventBus";
import { SimulationInfo } from "@/app/components/SimulationInfo";
import { useAgents } from "@/app/hooks/useAgents";
import { AgentProvider } from "@/app/provider/AgentProvider";

export interface SimProps {
  world: World;
  simulation: Simulation;
  agents: Agent[];
}
function App(props: SimProps) {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame<Home> | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);

  const { agents } = useAgents();

  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(
    undefined,
  );
  useEffect(() => {
    const listener = (agent: Agent) => {
      setSelectedAgent(agents.find((a) => a.id === agent.id));
    };
    EventBus.on("agent-selected", listener);
    return () => {
      EventBus.removeListener("agent-selected", listener);
    };
  }, [agents]);

  return (
    <div id="app">
      <SimulationInfo {...props} />
      <FormControlLabel
        control={
          <Switch
            checked={debugEnabled}
            onChange={() => {
              if (!debugEnabled) {
                phaserRef.current!.scene!.enableDebug();
              } else {
                phaserRef.current!.scene!.disableDebug();
              }
              setDebugEnabled(!debugEnabled);
            }}
          />
        }
        label="Debug Mode"
      />
      <Button
        onClick={() => {
          phaserRef.current!.scene!.resetCamera();
        }}
      >
        Reset Camera
      </Button>
      <Grid container columns={2} spacing={2}>
        <Grid sx={{ ml: 3 }}>
          <PhaserSimulation ref={phaserRef} {...props} />
        </Grid>
        <Grid>
          {selectedAgent ? (
            <AgentProvider agent={selectedAgent}>
              <AgentInfo />
            </AgentProvider>
          ) : (
            <div>No agent selected</div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
