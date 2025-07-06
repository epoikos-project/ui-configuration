"use client";
import { AgentInfo } from "@/app/components/AgentInfo";
import { SimulationInfo } from "@/app/components/SimulationInfo";
import { useAgents } from "@/app/hooks/useAgents";
import { AgentProvider } from "@/app/provider/AgentProvider";
import { Agent } from "@/types/Agent";
import { Simulation } from "@/types/Simulation";
import { World } from "@/types/World";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Card,
  CardHeader,
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { startSimulation, stopSimulation, tickSimulation } from "./actions";
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
  const router = useRouter();
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
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push("/") }>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Simulation {props.simulation.id}
          </Typography>
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
            label="Debug"
            sx={{ color: "white" }}
          />
          <Button color="inherit" onClick={() => phaserRef.current!.scene!.resetCamera()}>
            Reset Camera
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          {/* Simulation info + controls */}
          <Grid size={6}>
            <SimulationInfo {...props} />

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <PhaserSimulation ref={phaserRef} {...props} />
              </CardContent>
            </Card>
          </Grid>

          {/* Agent info */}
          <Grid size={3}>
            {selectedAgent ? (
              <AgentProvider agent={selectedAgent}>
                <AgentInfo />
              </AgentProvider>
            ) : (
              <Card>
                <CardContent>
                  <Typography>No agent selected</Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Event timeline */}
          <Grid size={3}>
            <Card>
              <CardHeader title="Event Timeline" />
              <CardContent>
                {/* TODO: Insert MUI Timeline component to show events */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
