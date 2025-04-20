"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import AgentConfigForm from "./components/AgentConfigForm";
import LiveJsonEditor from "./components/LiveJsonEditor";
import WorldConfig from "./components/WorldConfig";
import ConfigurationManager from "./components/ConfigurationManager";
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
  /* tabs */
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (_: React.SyntheticEvent, v: number) =>
    setTabValue(v);

  /* form state */
  const [configName, setConfigName] = useState("");
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);

  /* world slice */
  const [worldWidth, setWorldWidth] = useState(25);
  const [worldHeight, setWorldHeight] = useState(25);
  const [numRegions, setNumRegions] = useState(4);
  const [totalResources, setTotalResources] = useState(25);

  /* feedback */
  const [statusMessage, setStatusMessage] = useState("");

  /* list of saved configs (for ConfigurationManager) */
  const [configList, setConfigList] = useState<UnifiedConfig[]>([]);

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

  useEffect(() => {
    fetchConfigurations();
  }, []);

  const handleLoadConfiguration = async (config: unknown) => {
    try {
      let cfg = config as UnifiedConfig | string;

      if (typeof cfg === "string") {
        const r = await fetch(
          `${BASEURL}/configuration/${encodeURIComponent(cfg)}`
        );
        if (!r.ok) throw new Error("not found");
        cfg = await r.json();
      }

      /* apply loaded data */
      setAgentTypes(cfg.agents ?? []);
      const w = cfg.settings?.world;
      if (w) {
        setWorldWidth(w.size?.[0] ?? 25);
        setWorldHeight(w.size?.[1] ?? 25);
        setNumRegions(w.num_regions ?? 4);
        setTotalResources(w.total_resources ?? 25);
      }

      setConfigName(cfg.name);
      setStatusMessage(`Loaded '${cfg.name}'`);
    } catch (e) {
      setStatusMessage("Error loading configuration");
      console.error(e);
    }
  };

  /* ------------ render ------------ */

  const worldState: WorldConfigState = {
    size: [worldWidth, worldHeight],
    num_regions: numRegions,
    total_resources: totalResources,
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

        {/* Tabs */}
        <Paper elevation={3} sx={{ mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            variant="fullWidth"
          >
            <Tab label="Agent Configuration" />
            <Tab label="World Configuration" />
          </Tabs>
        </Paper>

        {/* Agent tab */}
        {tabValue === 0 && (
          <AgentConfigForm
            agents={agentTypes}
            setAgents={setAgentTypes}
          />
        )}

        {/* World tab */}
        {tabValue === 1 && (
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
        )}

        {/* Live JSON – always visible */}
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

        {/* Save / Load / Table */}
        <ConfigurationManager
          currentAgents={agentTypes}
          currentWorldConfig={worldState}
          configName={configName}
          setConfigName={setConfigName}
          onLoad={handleLoadConfiguration}
        />
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
