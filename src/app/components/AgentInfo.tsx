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
import { useSubscription } from "../hooks/useSubscription";
import { Agent } from "../../types/Agent";
import { Message } from "../../types/Message";
import { ActionLog } from "../../types/ActionLog";

interface LogEntry {
  timestamp: number;
  subject: string;
  payload: string;
}

export function AgentInfo() {
  const { agent, refresh, moveTo } = useAgent();
  const { simulation } = useSimulation();
  const [moveToCoords, setMoveToCoords] = useState({
    x: agent.x_coord,
    y: agent.y_coord,
  });
  const [messageLogs, setMessageLogs] = useState<Message[]>(
    agent.last_10_messages || []
  );
  const [actionLogs, setActionLogs] = useState<ActionLog[]>(
    agent.last_10_action_logs || []
  );
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (agent.id !== "") {
      refresh();
    }
  }, []);

  useEffect(() => {
    setMoveToCoords({ x: agent.x_coord, y: agent.y_coord });
    setMessageLogs(agent.last_10_messages || []);
    setActionLogs(agent.last_10_action_logs || []);
  }, [agent]);

  useSubscription(
    `simulation.${simulation.id}.agent.${agent.id}.action`,
    (msg) => {
      console.log("Action log received:", msg);
      let payload: ActionLog;
      try {
        payload = msg.json();
      } catch {}
      setActionLogs((prev) => [payload, ...prev]);
    }
  );

  useSubscription(
    `simulation.${simulation.id}.agent.${agent.id}.communication`,
    (msg) => {
      let payload: Message;
      try {
        payload = msg.json();
      } catch {}
      setMessageLogs((prev) => [payload, ...prev]);
    }
  );

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
        }}
      >
        <Typography variant="body2">Model: {agent.model}</Typography>
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
            onChange={(e) =>
              setMoveToCoords({ ...moveToCoords, y: Number(e.target.value) })
            }
          />
          <Button
            variant="contained"
            color="primary"
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
          }}
        >
          {tab === 0 && (
            <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
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
            <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
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
