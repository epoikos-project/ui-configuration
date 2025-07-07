"use client";

import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

import type { AgentType } from "./AgentConfigForm";

/**
 * Slice of state kept in Page for world settings
 */
export interface ResourceConfig {
  name: string;
  count: number;
  minAgents: number;
  miningTime: number;
  energyYield: number;
}

export type WorldConfigState = {
  size: [number, number];
  num_regions: number;
  total_resources: number;
  resources?: ResourceConfig[];
};

type Props = {
  agents: AgentType[];
  setAgents: (a: AgentType[]) => void;
  world: WorldConfigState;
  /** Optional – if supplied, the user can paste new world settings in JSON */
  setWorld?: (w: WorldConfigState) => void;
  /** Optional – if supplied, sync resource configs in JSON */
  resources?: ResourceConfig[];
  setResources?: (r: ResourceConfig[]) => void;
};

const LiveJsonEditor: React.FC<Props> = ({
  agents,
  setAgents,
  world,
  setWorld,
}) => {
  /** Shape that mirrors what /configuration expects (minus id & name) */
  const compose = () => ({
    agents,
    settings: { world: { ...world, resources: resources ?? [] } },
  });

  const [jsonText, setJsonText] = useState(
    JSON.stringify(compose(), null, 2)
  );
  const [error, setError] = useState<string | null>(null);

  /* keep preview in sync whenever state changes */
  useEffect(() => {
    setJsonText(JSON.stringify(compose(), null, 2));
  }, [agents, world]);

  const handleApply = () => {
    try {
      const parsed = JSON.parse(jsonText);

      // Accept either the full object or just agents[]
      const newAgents = Array.isArray(parsed) ? parsed : parsed.agents;
      if (!Array.isArray(newAgents)) throw new Error("No agents[] array found");
      setAgents(newAgents);

      if (
        !Array.isArray(parsed) &&
        parsed.settings?.world &&
        setWorld !== undefined
      ) {
        setWorld(parsed.settings.world as WorldConfigState);
      }
      if (
        !Array.isArray(parsed) &&
        parsed.settings?.world?.resources &&
        setResources !== undefined
      ) {
        setResources(parsed.settings.world.resources as ResourceConfig[]);
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

      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained" onClick={handleApply}>
          Apply JSON
        </Button>
      </Box>
    </Paper>
  );
};

export default LiveJsonEditor;
