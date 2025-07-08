import { useRef, useEffect, useState } from "react";
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
  CardContent,
  FormControlLabel,
  Switch,
  Button,
  Box,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import NatsDebugLog from "@/app/components/NatsDebugLog";
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
  const phaserRef = useRef<IRefPhaserGame<Home> | null>(null);
  const { agents } = useAgents();
  const [debugEnabled, setDebugEnabled] = useState(false);
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

  // Define the width for AgentInfo column
  const agentInfoWidth = { xs: 12, md: 4 }; // 1/3 on desktop, full width on mobile

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push("/")}
          >
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
          <Button
            color="inherit"
            onClick={() => phaserRef.current!.scene!.resetCamera()}
          >
            Reset Camera
          </Button>
          <Button
            color="inherit"
            onClick={() => phaserRef.current!.scene!.resetAgentSelection()}
          >
            Deselect Agent
          </Button>
        </Toolbar>
      </AppBar>
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          mt: 0,
          px: 0,
          width: "100vw",
          maxWidth: "100vw",
          display: "flex",
          flexDirection: "column",
          p: "2rem",
          boxSizing: "border-box",
        }}
      >
        <Grid container spacing={2}>
          {/* Left column */}
          <Grid
            size={{ xs: 12, md: 8 }}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Simulation Card with Fixed Size */}
            <Card
              sx={{
                mb: 2,
                width: "100%",

                mx: "auto", // center card horizontally
                minHeight: "300px", // can tweak
                boxShadow: 2,
                p: 2, // card padding
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  id="game-container"
                  sx={{
                    width: "100%",
                    height: "512px", // or a prop
                    minHeight: "300px",
                    mx: "auto",
                    backgroundColor: "#103014",
                    borderRadius: 2,
                    boxShadow: 1,
                    overflow: "hidden",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <PhaserSimulation ref={phaserRef} {...props} />
                </Box>
              </CardContent>
            </Card>
            <SimulationInfo {...props} />
          </Grid>
          {/* Right column: Agent info */}
          <Grid
            size={agentInfoWidth}
            sx={{
              display: "flex",
              flexDirection: "column",
              minWidth: 340,
              maxWidth: 420,
            }}
          >
            <Card
              sx={{
                flex: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: selectedAgent ? "stretch" : "center",
                justifyContent: selectedAgent ? "flex-start" : "center",
              }}
            >
              {selectedAgent ? (
                <AgentProvider agent={selectedAgent}>
                  <AgentInfo />
                </AgentProvider>
              ) : (
                <CardContent sx={{ width: "100%", textAlign: "center" }}>
                  <Typography>No agent selected</Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
          {debugEnabled && (
            <Grid size={8} sx={{ height: "100%" }}>
              <Box sx={{ height: "100%", minHeight: 0 }}>
                <NatsDebugLog simId={props.simulation.id} />
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
}

export default App;
