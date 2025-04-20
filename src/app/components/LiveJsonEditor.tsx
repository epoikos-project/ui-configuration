// components/LiveJsonEditor.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

import type { AgentType } from "./AgentConfigForm";

export type WorldConfigState = {
  size: [number, number];
  num_regions: number;
  total_resources: number;
};

type Props = {
  agents: AgentType[];
  setAgents: (a: AgentType[]) => void;
  world: WorldConfigState;
  // optional: let users tweak the world JSON too
  setWorld?: (w: WorldConfigState) => void;
};

const LiveJsonEditor: React.FC<Props> = ({
  agents,
  setAgents,
  world,
  setWorld,
}) => {
  /** A single object that matches what `saveUnifiedConfiguration`
   *  ultimately POSTs to the backend (minus name/id). */
  const composeJson = () => ({ agents, settings: { world } });

  const [jsonText, setJsonText] = useState(() =>
    JSON.stringify(composeJson(), null, 2)
  );
  const [error, setError] = useState<string | null>(null);

  // Whenever either slice of state changes, regenerate JSON
  useEffect(() => {
    setJsonText(JSON.stringify(composeJson(), null, 2));
  }, [agents, world]);

  /** Apply button – lets power users paste in only the `agents`
   *  array OR the full object. World config is optional on parse. */
  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);

      // Accept both shapes:
      //  1) { agents: [...], settings: { world: {...} } }
      //  2)  [ ...agentsArray ]
      const newAgents = Array.isArray(parsed) ? parsed : parsed.agents;
      if (!Array.isArray(newAgents)) throw new Error("No agents[] found");
      setAgents(newAgents);

      if (!Array.isArray(parsed) && parsed.settings?.world && setWorld) {
        setWorld(parsed.settings.world as WorldConfigState);
      }
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6">Live JSON Preview / Editor</Typography>

      <TextField
        fullWidth
        multiline
        minRows={10}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        variant="outlined"
        sx={{ mt: 2, fontFamily: "monospace" }}
      />

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      <Box display="flex" justifyContent="center" mt={2}>
        <Button variant="contained" onClick={handleApply}>
          Apply JSON
        </Button>
      </Box>
    </Paper>
  );
};

export default LiveJsonEditor;
