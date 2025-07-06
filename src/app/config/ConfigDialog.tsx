"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Button,
  TextField,
} from "@mui/material";
import AgentConfigForm from "../components/AgentConfigForm";
import WorldConfig from "../components/WorldConfig";
import LiveJsonEditor from "../components/LiveJsonEditor";
import type { UnifiedConfig, AgentType } from "./types";

interface Props {
  open: boolean;
  editingConfig: UnifiedConfig | null;
  availableModels: { id: string; name: string }[];
  onClose: () => void;
  onSave: (
    name: string,
    agents: AgentType[],
    world: UnifiedConfig["settings"]["world"]
  ) => void;
}

function TabPanel(
  props: React.PropsWithChildren<{ value: number; index: number }>
) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

/**
 * Dialog for creating or editing a configuration, reusing the same form tabs.
 */
export default function ConfigDialog({
  open,
  editingConfig,
  availableModels,
  onClose,
  onSave,
}: Props) {
  const DEFAULT_WORLD = {
    size: [25, 25] as [number, number],
    num_regions: 4,
    total_resources: 25,
  };
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [agents, setAgents] = useState<AgentType[]>([]);
  const [worldWidth, setWorldWidth] = useState(25);
  const [worldHeight, setWorldHeight] = useState(25);
  const [numRegions, setNumRegions] = useState(4);
  const [totalResources, setTotalResources] = useState(25);

  // Initialize or reset form fields when dialog opens or editingConfig changes
  useEffect(() => {
    if (editingConfig) {
      setName(editingConfig.name);
      setAgents(editingConfig.agents);
      setWorldWidth(editingConfig.settings.world.size[0]);
      setWorldHeight(editingConfig.settings.world.size[1]);
      setNumRegions(editingConfig.settings.world.num_regions);
      setTotalResources(editingConfig.settings.world.total_resources);
    } else {
      setName("");
      setAgents([]);
      setWorldWidth(DEFAULT_WORLD.size[0]);
      setWorldHeight(DEFAULT_WORLD.size[1]);
      setNumRegions(DEFAULT_WORLD.num_regions);
      setTotalResources(DEFAULT_WORLD.total_resources);
    }
    setTab(0);
  }, [editingConfig]);

  const worldState = {
    size: [worldWidth, worldHeight] as [number, number],
    num_regions: numRegions,
    total_resources: totalResources,
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingConfig ? "Edit Configuration" : "Add New Configuration"}
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          <Tab label="Agents" />
          <Tab label="World" />
          <Tab label="Preview" />
        </Tabs>
        <TabPanel value={tab} index={0}>
          <AgentConfigForm
            agents={agents}
            setAgents={setAgents}
            availableModels={availableModels}
          />
        </TabPanel>
        <TabPanel value={tab} index={1}>
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
        <TabPanel value={tab} index={2}>
          <LiveJsonEditor
            agents={agents}
            setAgents={setAgents}
            world={worldState}
            setWorld={(w) => {
              setWorldWidth(w.size[0]);
              setWorldHeight(w.size[1]);
              setNumRegions(w.num_regions);
              setTotalResources(w.total_resources);
            }}
          />
        </TabPanel>
        <Box mt={2} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Configuration Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() => onSave(name, agents, worldState)}
          >
            {editingConfig ? "Update Configuration" : "Save Configuration"}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
