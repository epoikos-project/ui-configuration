import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
} from "@mui/material";
import { useAgent } from "../hooks/useAgent";
import { useSimulation } from "../hooks/useSimulation";
import { RelationshipGraph } from "./RelationshipGraph";
import { useEffect, useState } from "react";
import { useAgentLogs } from "@/app/provider/AgentLogsProvider";

export function AgentInfo() {
  const { agent, refresh, moveTo } = useAgent();
  const { simulation } = useSimulation();
  const [moveToCoords, setMoveToCoords] = useState({
    x: agent.x_coord,
    y: agent.y_coord,
  });

  const [tab, setTab] = useState(0);
  // Only show logs relevant to this agent: actions where agent is actor, messages where agent is sender or recipient
  const { messages: rawMessages, actions: rawActions } = useAgentLogs(agent.id);
  const messageLogs = rawMessages.filter(
    (l) => l.agent_id === agent.id || l.to_agent_id === agent.id
  );
  const actionLogs = rawActions.filter((l) => l.agent_id === agent.id);

  useEffect(() => {
    if (agent.id !== "") {
      refresh();
    }
  }, []);


  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <CardHeader title={`Agent ${agent.name}`} subheader={`ID: ${agent.id}`} />
      <CardContent
        sx={{
          flex: 1,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <Typography variant="body2">Model: {agent.model}</Typography>
        <Typography variant="body2">
          Status: {agent.dead ? (
            <span style={{ color: '#ff0000', fontWeight: 'bold' }}>Dead ☠️</span>
          ) : (
            <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Alive ✓</span>
          )}
        </Typography>
        <Typography variant="body2">Hunger: {agent.hunger}</Typography>
        <Typography variant="body2">Energy: {agent.energy_level}</Typography>
        <Typography variant="body2">
          Coordinates:{" "}
          <strong>
            {agent.x_coord}, {agent.y_coord}
          </strong>
        </Typography>
        <Typography variant="body2">
          Visibility Range: {agent.visibility_range}
        </Typography>
        <Box display={"flex"} mt={2} gap={1}>
          <TextField
            id="outlined-basic"
            label="X Coordinate"
            variant="outlined"
            value={moveToCoords.x}
            size="small"
            disabled={agent.dead}
            onChange={(e) =>
              setMoveToCoords({ ...moveToCoords, x: Number(e.target.value) })
            }
          />
          <TextField
            id="outlined-basic"
            label="Y Coordinate"
            variant="outlined"
            value={moveToCoords.y}
            size="small"
            disabled={agent.dead}
            onChange={(e) =>
              setMoveToCoords({ ...moveToCoords, y: Number(e.target.value) })
            }
          />
          <Button
            variant="contained"
            color="primary"
            disabled={agent.dead}
            onClick={() => {
              moveTo(moveToCoords.x, moveToCoords.y);
            }}
          >
            Move
          </Button>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="Messages" />
            <Tab label="Actions" />
            <Tab label="Relationships" />
          </Tabs>
        </Box>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            mt: 1,
            overflow: "hidden",
          }}
        >
          {tab === 0 && (
            <Box sx={{maxHeight: '33vh', overflow: 'auto' }}>
              {messageLogs.map((l, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(l.created_at).toLocaleTimeString()} — {l.subject}{" "}
                    | From {l.agent_id} - To {l.to_agent_id} | Tick {l.tick}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      mb: 1,
                    }}
                  >
                    {l.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{maxHeight: '33vh', overflow: 'auto' }}>
              {actionLogs.map((l, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(l.created_at).toLocaleTimeString()} — {l.subject}{" "}
                    | {l.tick}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "monospace",
                      mb: 1,
                    }}
                  >
                    {l.action}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          {tab === 2 && (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <RelationshipGraph />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
