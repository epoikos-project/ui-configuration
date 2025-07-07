import { Card, CardHeader, CardContent, Typography, Box, Tabs, Tab } from "@mui/material";
import { useAgent } from "../hooks/useAgent";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscribe } from "../hooks/useSubscribe";
import type { Msg } from "nats.ws";
import { RelationshipGraph } from "./RelationshipGraph";
import { useEffect, useState } from "react";

interface LogEntry {
  timestamp: number;
  subject: string;
  payload: string;
}

export function AgentInfo() {
  const { agent, refresh } = useAgent();
  const { simulation } = useSimulation();
  const subscribe = useSubscribe();
  const [messageLogs, setMessageLogs] = useState<LogEntry[]>([]);
  const [actionLogs, setActionLogs] = useState<LogEntry[]>([]);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (agent.id !== "") {
      refresh();
    }
  }, []);

  // Subscribe to agent message events (created, prompt, response, communication)
  useEffect(() => {
    const subjects = [
      `simulation.${simulation.id}.agent.${agent.id}.created`,
      `simulation.${simulation.id}.agent.${agent.id}.prompt`,
      `simulation.${simulation.id}.agent.${agent.id}.response`,
      `simulation.${simulation.id}.agent.${agent.id}.communication`,
      `simulation.${simulation.id}.agent.${agent.id}.moved`,
    ];
    const unsubs: (() => void)[] = [];
    for (const subject of subjects) {
      subscribe(subject, (msg: Msg) => {
        let payloadStr: string;
        try {
          payloadStr = JSON.stringify(msg.json(), null, 2);
        } catch {
          payloadStr = msg.string();
        }
        setMessageLogs((prev) => [
          { timestamp: Date.now(), subject: msg.subject, payload: payloadStr },
          ...prev,
        ]);
      })
        .then((u) => unsubs.push(u as () => void))
        .catch((err) => console.error(`Subscribe to ${subject} failed:`, err));
    }
    return () => {
      unsubs.forEach((u) => u());
    };
  }, [simulation.id, agent.id, subscribe]);

  // Subscribe to agent action events
  useEffect(() => {
    let unsub = () => {};
    subscribe(
      `simulation.${simulation.id}.agent.${agent.id}.action`,
      (msg: Msg) => {
        let payloadStr: string;
        try {
          payloadStr = JSON.stringify(msg.json(), null, 2);
        } catch {
          payloadStr = msg.string();
        }
        setActionLogs((prev) => [
          { timestamp: Date.now(), subject: msg.subject, payload: payloadStr },
          ...prev,
        ]);
      }
    )
      .then((u) => {
        unsub = u as () => void;
      })
      .catch((err) => console.error("Subscribe to actions failed:", err));
    return () => unsub();
  }, [simulation.id, agent.id, subscribe]);

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
      <CardContent sx={{ flex: 1,height: '100%', display: "flex", flexDirection: "column" }}>
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
        <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 2 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="Messages" />
            <Tab label="Actions" />
            <Tab label="Relationships" />
          </Tabs>
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", mt: 1 }}>
          {tab === 0 && (
            <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
              {messageLogs.map((l, i) => (
                <Box key={i} mb={1}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(l.timestamp).toLocaleTimeString()} — {l.subject}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", mb: 1 }}
                  >
                    {l.payload}
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
                    {new Date(l.timestamp).toLocaleTimeString()} — {l.subject}
                  </Typography>
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", mb: 1 }}
                  >
                    {l.payload}
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
