"use client";

import { useDebugLogs } from "@/app/provider/DebugLogsProvider";
import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";

interface LogEntry {
  timestamp: number;
  subject: string;
  payload: string;
}

export default function NatsDebugLog() {
  const logs = useDebugLogs();

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardHeader title="Log" />
      <CardContent sx={{ flex: 1, overflowY: "auto" }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          This will show all incoming NATS messages for this simulation.
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
