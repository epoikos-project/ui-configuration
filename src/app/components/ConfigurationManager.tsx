"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export type AgentType = {
  id: number;
  name: string;
  count: number;
  traits: string[];
  attributes: { name: string; value: number }[];
  model?: string;
  personality?: string[];
  objective?: string;
};

export type WorldConfigType = {
  size: [number, number];
  num_regions: number;
  total_resources: number;
};

export type Configuration = {
  id: string;
  name: string;
  agents: AgentType[];
  settings: { 
    world?: WorldConfigType;
    [key: string]: unknown;
  };
};

type Props = {
  currentAgents: AgentType[];
  currentWorldConfig: WorldConfigType;
  configName: string;
  setConfigName: (name: string) => void;
  onLoad: (config: Configuration) => void;
};

const ConfigurationManager: React.FC<Props> = ({
  currentAgents,
  currentWorldConfig,
  configName,
  setConfigName,
  onLoad
}) => {
  const [loadStatus, setLoadStatus] = useState('');
  const [configList, setConfigList] = useState<Configuration[]>([]);

  const fetchConfigurations = async () => {
    try {
      console.log("Fetching all configurations...");
      const response = await fetch(`${BASEURL}/configuration/`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched configurations:", data);
        setConfigList(data);
      } else {
        console.error("Failed to fetch configurations");
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      alert("Please provide a configuration name.");
      return;
    }
    try {
      const payload: Configuration = {
        id: Date.now().toString(),
        name: configName,
        agents: currentAgents,
        settings: {
          world: currentWorldConfig
        },
      };

      console.log("Saving configuration with payload:", payload);
      const response = await fetch(`${BASEURL}/configuration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("Save response:", data);
      setLoadStatus(data.message || "Configuration saved successfully!");
      fetchConfigurations();
    } catch (error) {
      console.error("Error saving configuration:", error);
      setLoadStatus("Error saving configuration");
    }
  };

  const handleLoadConfiguration = async (name: string) => {
    console.log("Loading configuration:", name);
    try {
      const response = await fetch(`${BASEURL}/configuration/${encodeURIComponent(name)}`);
      if (!response.ok) {
        setLoadStatus("Configuration not found");
        console.error("Configuration not found for", name);
        return;
      }
      const data = await response.json();
      console.log("Loaded configuration data:", data);
      
      // This ensures we properly handle both old and new configuration formats
      const config: Configuration = {
        id: data.id || Date.now().toString(),
        name: data.name,
        agents: data.agents || [],
        settings: data.settings || {}
      };
      
      setLoadStatus(`Configuration '${name}' loaded successfully.`);
      onLoad(config);
    } catch (error) {
      console.error("Error loading configuration:", error);
      setLoadStatus("Error loading configuration");
    }
  };

  const handleDeleteConfiguration = async (name: string) => {
    console.log("Deleting configuration:", name);
    try {
      const response = await fetch(`${BASEURL}/configuration/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log("Deletion response:", data);
      setLoadStatus(data.message || "Configuration deleted successfully!");
      fetchConfigurations();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      setLoadStatus("Error deleting configuration");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Configuration Manager
      </Typography>
      <Box display="flex" flexDirection="row" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Configuration Name"
          value={configName}
          onChange={(e) => setConfigName(e.target.value)}
          variant="outlined"
          fullWidth
        />
      </Box>
      {loadStatus && (
        <Box mb={2}>
          <Typography variant="body1" color="primary">
            {loadStatus}
          </Typography>
        </Box>
      )}
      <Box display="flex" gap={2} mb={2}>
        <Button variant="contained" onClick={handleSaveConfiguration}>
          Save Config
        </Button>
        <Button variant="contained" onClick={() => handleLoadConfiguration(configName)}>
          Load Config
        </Button>
        <Button variant="contained" color="error" onClick={() => handleDeleteConfiguration(configName)}>
          Delete Config
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Agents</TableCell>
              <TableCell>World Size</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {configList.map((config) => (
              <TableRow key={config.id}>
                <TableCell>{config.id}</TableCell>
                <TableCell>{config.name}</TableCell>
                <TableCell>{config.agents?.length || 0} types</TableCell>
                <TableCell>
                  {config.settings?.world?.size 
                    ? `${config.settings.world.size[0]}x${config.settings.world.size[1]}`
                    : 'Not defined'}
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleLoadConfiguration(config.name)}
                    sx={{ mr: 1 }}
                  >
                    Load
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => handleDeleteConfiguration(config.name)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {configList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No configurations available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained" onClick={fetchConfigurations}>
          Refresh List
        </Button>
      </Box>
    </Paper>
  );
};

export default ConfigurationManager;