"use client";

import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
} from "@mui/material";

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

function TabPanel(
  props: React.PropsWithChildren<{ value: number; index: number }>
) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

const ConfigurationManager: React.FC<Props> = ({
  currentAgents,
  currentWorldConfig,
  configName,
  setConfigName,
  onLoad,
}) => {
  const [loadStatus, setLoadStatus] = useState("");
  const [configList, setConfigList] = useState<Configuration[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [simList, setSimList] = useState<{ id: string }[]>([]);
  const [tab, setTab] = useState(0);

  const fetchConfigurations = async () => {
    try {
      const response = await fetch(`${BASEURL}/configuration/`);
      if (response.ok) {
        const data = await response.json();
        setConfigList(data);
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
    }
  };

  const fetchSimulations = async () => {
    try {
      const response = await fetch(`${BASEURL}/simulation/`);
      if (response.ok) {
        const data = await response.json();
        setSimList(data);
      }
    } catch (error) {
      console.error("Error fetching simulations:", error);
    }
  };

  const fetchAvailableModels = async () => {
    try {
      const r = await fetch(`${BASEURL}/configuration/models`);
      if (!r.ok) throw new Error("fetch failed");
      setAvailableModels(await r.json());
    } catch (e) {
      console.error("Failed to fetch available models", e);
      return [];
    }
  };

  useEffect(() => {
    fetchConfigurations();
    fetchSimulations();
    fetchAvailableModels();
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
          world: currentWorldConfig,
        },
      };

      const response = await fetch(`${BASEURL}/configuration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setLoadStatus(data.message || "Configuration saved successfully!");
      fetchConfigurations();
    } catch (error) {
      console.error("Error saving configuration:", error);
      setLoadStatus("Error saving configuration");
    }
  };

  const handleLoadConfiguration = async (name: string) => {
    try {
      const response = await fetch(
        `${BASEURL}/configuration/${encodeURIComponent(name)}`
      );
      if (!response.ok) {
        setLoadStatus("Configuration not found");
        return;
      }
      const data = await response.json();
      const config: Configuration = {
        id: data.id || Date.now().toString(),
        name: data.name,
        agents: data.agents || [],
        settings: data.settings || {},
      };
      setLoadStatus(`Configuration '${name}' loaded successfully.`);
      onLoad(config);
    } catch (error) {
      setLoadStatus("Error loading configuration");
    }
  };

  const handleDeleteConfiguration = async (name: string) => {
    try {
      const response = await fetch(
        `${BASEURL}/configuration/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      setLoadStatus(data.message || "Configuration deleted successfully!");
      fetchConfigurations();
    } catch (error) {
      setLoadStatus("Error deleting configuration");
    }
  };

  const handleCreateConfiguration = async (name: string) => {
    if (!name.trim()) {
      alert(
        "Please provide a configuration name before creating a simulation."
      );
      return;
    }
    try {
      const response = await fetch(
        `${BASEURL}/orchestrator/initialize/${encodeURIComponent(name)}`,
        { method: "POST" }
      );
      if (!response.ok)
        throw new Error(response.statusText || "Initialization failed");
      const data = await response.json();
      const simId = data.id || data.simulation_id;
      if (!simId) throw new Error("No simulation ID returned");
      setLoadStatus(`Simulation initialized (ID: ${simId}).`);
      window.open(`/simulation/${simId}`, "_blank");
    } catch (error) {
      setLoadStatus("Error creating simulation");
    }
  };

  const handleDeleteSimulation = async (id: string) => {
    try {
      const response = await fetch(
        `${BASEURL}/simulation/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      setLoadStatus(data.message || "Simulation deleted successfully!");
      fetchSimulations();
    } catch (error) {
      setLoadStatus("Error deleting simulation");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Configuration Manager
      </Typography>
      <Box display="flex" flexDirection="row" alignItems="flex-start" gap={2}>
        <Box sx={{ flex: 1 }}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            gap={2}
            mb={2}
          >
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
            <Button
              variant="contained"
              onClick={() => handleLoadConfiguration(configName)}
            >
              Load Config
            </Button>
            <Button
              variant="contained"
              onClick={() => handleCreateConfiguration(configName)}
            >
              Create Simulation
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteConfiguration(configName)}
            >
              Delete Config
            </Button>
          </Box>
        </Box>
        <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="fullWidth"
              sx={{ mb: 2 }}
            >
              <Tab label="Configurations" />
              <Tab label="Simulations" />
            </Tabs>

            {/* Configurations Tab */}
            <TabPanel value={tab} index={0}>
              <Typography variant="h6" gutterBottom>
                Saved Configurations
              </Typography>
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
                        <TableCell>
                          {config.agents?.length || 0} types
                        </TableCell>
                        <TableCell>
                          {config.settings?.world?.size
                            ? `${config.settings.world.size[0]}x${config.settings.world.size[1]}`
                            : "Not defined"}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              handleCreateConfiguration(config.name)
                            }
                            sx={{ mr: 1 }}
                          >
                            Create
                          </Button>
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
                            onClick={() =>
                              handleDeleteConfiguration(config.name)
                            }
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
            </TabPanel>

            {/* Simulations Tab */}
            <TabPanel value={tab} index={1}>
              <Typography variant="h6" gutterBottom>
                Active Simulations
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {simList.map((sim) => (
                      <TableRow key={sim.id}>
                        <TableCell>{sim.id}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              window.open(`/simulation/${sim.id}`, "_blank")
                            }
                            sx={{ mr: 1 }}
                          >
                            Open
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteSimulation(sim.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {simList.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No simulations initialized.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box mt={2} display="flex" justifyContent="center">
                <Button variant="contained" onClick={fetchSimulations}>
                  Refresh Simulations
                </Button>
              </Box>
            </TabPanel>
          </Paper>
        </Box>
      </Box>
    </Paper>
  );
};

export default ConfigurationManager;
