"use client";

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { AgentType } from './AgentConfigForm';

type Props = {
  agents: AgentType[];
  setAgents: (agents: AgentType[]) => void;
};

const LiveJsonEditor: React.FC<Props> = ({ agents, setAgents }) => {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // When the agents change, update the JSON text
  useEffect(() => {
    setJsonText(JSON.stringify(agents, null, 2));
  }, [agents]);

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must represent an array of agents");
      }
      setAgents(parsed);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 4 }}>
      <Typography variant="h6">Live JSON Editor (Agents)</Typography>
      <TextField
        fullWidth
        multiline
        minRows={8}
        maxRows={20}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        variant="outlined"
        sx={{ mt: 2, fontFamily: 'monospace' }}
      />
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      <Box display="flex" justifyContent="center" mt={2}>
        <Button variant="contained" onClick={handleApplyJson}>
          Apply JSON
        </Button>
      </Box>
    </Paper>
  );
};

export default LiveJsonEditor;
