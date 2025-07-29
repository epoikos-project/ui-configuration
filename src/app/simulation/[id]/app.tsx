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
// no longer need useTheme; layout uses flex to fit exactly without scroll
import NatsDebugLog from "@/app/components/NatsDebugLog";
import { GlobalRelationshipGraph } from "@/app/components/GlobalRelationshipGraph";
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
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
            onClick={() => {
              phaserRef.current!.scene!.downloadFullMap();
            }}
          >
            Download Map
          </Button>

          <Button
            color="inherit"
            onClick={() => phaserRef.current!.scene!.resetCamera()}
          >
            Reset Camera
          </Button>
          <Button
            color="inherit"
            onClick={() => {
              phaserRef.current!.scene!.resetAgentSelection();
              setSelectedAgent(undefined);
            }}
          >
            Deselect Agent
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: "2rem",
          boxSizing: "border-box",
        }}
      >
        <Grid container spacing={2} sx={{ height: "100%" }}>
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
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Card
              sx={{
                flex: 1,
                height: "67%",
                display: "flex",
                flexDirection: "column",
                alignItems: selectedAgent ? "stretch" : "center",
                justifyContent: selectedAgent ? "flex-start" : "center",
              }}
            >
              {selectedAgent ? (
                <AgentProvider
                  agentId={selectedAgent.id}
                  initialAgent={selectedAgent}
                >
                  <AgentInfo />
                </AgentProvider>
              ) : (
                <CardContent sx={{ width: "100%", textAlign: "center" }}>
                  <Typography>No agent selected</Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
          <Grid container size={12} sx={{ height: "70%" }}>
            <Grid size={12} sx={{ height: "100%" }}>
              <Box sx={{ height: "100%" }}>
                <GlobalRelationshipGraph />
              </Box>
            </Grid>
            <Grid size={12} sx={{ height: "100%" }}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {debugEnabled && <NatsDebugLog />}
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default App;
