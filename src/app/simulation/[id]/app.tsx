"use client";
import { AgentInfo } from "@/app/components/AgentInfo";
import { SimulationInfo } from "@/app/components/SimulationInfo";
import { useAgents } from "@/app/hooks/useAgents";
import { AgentProvider } from "@/app/provider/AgentProvider";
import { Agent } from "@/types/Agent";
import { Simulation } from "@/types/Simulation";
import { World } from "@/types/World";
import { Box, Button, FormControlLabel, Grid, Switch } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { startSimulation, stopSimulation } from "./actions";
import { EventBus } from "./game/EventBus";
import { IRefPhaserGame, PhaserSimulation } from "./game/PhaserSimulation";
import { Home } from "./game/scences/Home";
import { Resource } from "../../../types/Resource";

export interface SimProps {
  world: World;
  simulation: Simulation;
  agents: Agent[];
  resources: Resource[];
}
function App(props: SimProps) {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame<Home> | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);

  const { agents } = useAgents();

  const [selectedAgent, setSelectedAgent] = useState<Agent | undefined>(
    undefined
  );
  useEffect(() => {
    const listener = (agent: Agent) => {
      setSelectedAgent(agents.find((a) => a.id === agent.id));
    };
    EventBus.on("agent-selected", listener);
    return () => {
      EventBus.removeListener("agent-selected", listener);
    };
  }, [agents, setSelectedAgent]);

  return (
    <Box id="app" sx={{ ml: 5 }}>
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
        <Grid>
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
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            startSimulation(props.simulation.id);
          }}
        >
          Start Simulation
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            stopSimulation(props.simulation.id);
          }}
          sx={{ ml: 2 }}
        >
          Stop Simulation
        </Button>
      </Box>
    </Box>
  );
}

export default App;
