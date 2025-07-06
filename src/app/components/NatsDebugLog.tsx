"use client";

import { useState, useEffect } from "react";
import type { Msg } from "nats.ws";
import { useSubscribe } from "@/app/hooks/useSubscribe";
import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";

interface LogEntry {
  timestamp: number;
  subject: string;
  payload: string;
}

export default function NatsDebugLog({ simId }: { simId: string }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const subscribe = useSubscribe();

  useEffect(() => {
    let unsub = () => {};
    subscribe(`simulation.${simId}.>`, (msg: Msg) => {
      let payloadStr: string;
      try {
        payloadStr = JSON.stringify(msg.json(), null, 2);
      } catch {
        payloadStr = msg.string();
      }
      setLogs((prev) => [
        { timestamp: Date.now(), subject: msg.subject, payload: payloadStr },
        ...prev,
      ]);
    })
      .then((u) => {
        unsub = u as () => void;
      })
      .catch((err) => console.error("Debug log subscribe failed:", err));

    return () => unsub();
  }, [simId, subscribe]);

  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title="Log" />
      <CardContent sx={{ maxHeight: 300, overflowY: "auto" }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No Logs yet. This will show all incoming NATS messages for this simulation.
        </Typography>
        {logs.map((l, i) => (
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
      </CardContent>
    </Card>
  );
}
