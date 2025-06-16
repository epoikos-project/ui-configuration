"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import AgentConfigForm from "./components/AgentConfigForm";
import WorldConfig from "./components/WorldConfig";
import LiveJsonEditor from "./components/LiveJsonEditor";

function TabPanel(props: React.PropsWithChildren<{ value: number; index: number }>) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}
import type { WorldConfigState } from "./components/LiveJsonEditor";

const theme = createTheme({
  colorSchemes: { dark: true },
});

/* ---------- local types ---------- */

interface AgentType {
  id: number;
  name: string;
  count: number;
  traits?: string[];                     //  <- added to match ConfigurationManager
  model?: string;
  personality?: string[];
  objective?: string;
  attributes: { name: string; value: number }[];
}

interface UnifiedConfig {
  id: string;
  name: string;
  agents: AgentType[];
  settings: { world: WorldConfigState };
}

/* ---------- component ---------- */

const Page: React.FC = () => {
  /* form state (for Add Config dialog) */
  const [configName, setConfigName] = useState("");
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);

  /* world slice */
  const [worldWidth, setWorldWidth] = useState(25);
  const [worldHeight, setWorldHeight] = useState(25);
  const [numRegions, setNumRegions] = useState(4);
  const [totalResources, setTotalResources] = useState(25);

  /* feedback */
  const [statusMessage, setStatusMessage] = useState("");

  /* list of saved configs */
  const [configList, setConfigList] = useState<UnifiedConfig[]>([]);
  /* list of active simulations */
  const [simList, setSimList] = useState<{ id: string }[]>([]);
  /* dialog open state */
  const [openAdd, setOpenAdd] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);

  const BASEURL =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  /* ------------ data helpers ------------ */

  const fetchConfigurations = async () => {
    try {
      const r = await fetch(`${BASEURL}/configuration/`);
      if (!r.ok) throw new Error("fetch failed");
      setConfigList(await r.json());
    } catch (e) {
      setStatusMessage("Failed to fetch configurations");
      console.error(e);
    }
  };

  const fetchSimulations = async () => {
    try {
      const r = await fetch(`${BASEURL}/simulation/`);
      if (!r.ok) throw new Error("fetch failed");
      setSimList(await r.json());
    } catch (e) {
      console.error("Failed to fetch simulations", e);
    }
  };

  useEffect(() => {
    fetchConfigurations();
    fetchSimulations();
  }, []);


  /* ------------ render ------------ */

  const worldState: WorldConfigState = {
    size: [worldWidth, worldHeight],
    num_regions: numRegions,
    total_resources: totalResources,
  };

  const handleOpenConfigDialog = () => {
    setConfigName("");
    setAgentTypes([]);
    setWorldWidth(25);
    setWorldHeight(25);
    setNumRegions(4);
    setTotalResources(25);
    setStatusMessage("");
    setOpenAdd(true);
  };

  const handleCloseConfigDialog = () => {
    setOpenAdd(false);
  };

  const handleSaveConfig = async () => {
    if (!configName.trim()) {
      alert("Please provide a configuration name.");
      return;
    }
    try {
      const payload: UnifiedConfig = {
        id: Date.now().toString(),
        name: configName,
        agents: agentTypes,
        settings: { world: worldState },
      };

      const r = await fetch(`${BASEURL}/configuration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(r.statusText);
      await fetchConfigurations();
      setStatusMessage(`Configuration '${configName}' saved.`);
      setOpenAdd(false);
    } catch (e) {
      console.error("Error saving configuration:", e);
      setStatusMessage("Error saving configuration");
    }
  };

  const handleLaunchConfig = async (name: string) => {
    try {
      const r = await fetch(
        `${BASEURL}/orchestrator/initialize/${encodeURIComponent(name)}`,
        { method: 'POST' }
      );
      if (!r.ok) throw new Error(r.statusText);
      const data = await r.json();
      const simId = data.simulation_id || data.id;
      if (!simId) throw new Error('No simulation ID returned');
      await fetchSimulations();
      window.open(`/simulation/${simId}`, '_blank');
    } catch (e) {
      console.error("Failed to launch simulation:", e);
      setStatusMessage("Error launching simulation");
    }
  };

  const handleOpenSimulation = (id: string) => {
    window.open(`/simulation/${id}`, '_blank');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" sx={{ mt: 4 }} gutterBottom>
          EPOIKOS Simulation Configuration
        </Typography>

        {statusMessage && (
          <Typography align="center" color="primary" sx={{ mb: 2 }}>
            {statusMessage}
          </Typography>
        )}

        {/* Saved Configurations Table */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Saved Configurations</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenConfigDialog}
          >
            Add Config
          </Button>
        </Box>
        <Paper sx={{ mb: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Launch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configList.map((cfg) => (
                  <TableRow key={cfg.id}>
                    <TableCell>{cfg.id}</TableCell>
                    <TableCell>{cfg.name}</TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => handleLaunchConfig(cfg.name)}>
                        Launch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {configList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No configurations available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Active Simulations Table */}
        <Typography variant="h5" gutterBottom>
          Active Simulations
        </Typography>
        <Paper>
          <TableContainer>
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
                      <Button size="small" onClick={() => handleOpenSimulation(sim.id)}>
                        Open
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
        </Paper>

        {/* Add Config Dialog */}
        <Dialog open={openAdd} onClose={handleCloseConfigDialog} maxWidth="md" fullWidth>
          <DialogTitle>Add New Configuration</DialogTitle>
          <DialogContent dividers>
            <Tabs value={dialogTab} onChange={(_, v) => setDialogTab(v)} variant="fullWidth">
              <Tab label="Agents" />
              <Tab label="World" />
              <Tab label="Preview" />
            </Tabs>
            <TabPanel value={dialogTab} index={0}>
              <AgentConfigForm agents={agentTypes} setAgents={setAgentTypes} />
            </TabPanel>
            <TabPanel value={dialogTab} index={1}>
              <WorldConfig
                worldWidth={worldWidth}
                setWorldWidth={setWorldWidth}
                worldHeight={worldHeight}
                setWorldHeight={setWorldHeight}
                numRegions={numRegions}
                setNumRegions={setNumRegions}
                totalResources={totalResources}
                setTotalResources={setTotalResources}
              />
            </TabPanel>
            <TabPanel value={dialogTab} index={2}>
              <LiveJsonEditor
                agents={agentTypes}
                setAgents={setAgentTypes}
                world={worldState}
                setWorld={(w) => {
                  setWorldWidth(w.size[0]);
                  setWorldHeight(w.size[1]);
                  setNumRegions(w.num_regions);
                  setTotalResources(w.total_resources);
                }}
              />
            </TabPanel>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Configuration Name"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleSaveConfig}>
                Save Configuration
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfigDialog}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
