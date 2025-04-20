"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Button,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AgentConfigForm from './components/AgentConfigForm';
import LiveJsonEditor from './components/LiveJsonEditor';
import WorldConfig from './components/WorldConfig';
import ConfigurationManager from './components/ConfigurationManager';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

// Interface for agent type
interface AgentType {
  id: number;
  name: string;
  count: number;
  model?: string;
  personality?: string[];
  objective?: string;
  attributes: { name: string; value: number }[];
}

// Interface for the unified configuration object
interface UnifiedConfig {
  id: string;
  name: string;
  agents: AgentType[];
  settings: {
    world?: {
      size: [number, number];
      num_regions: number;
      total_resources: number;
    };
    [key: string]: any;
  };
}

const Page: React.FC = () => {
  // State for the tab selection
  const [tabValue, setTabValue] = useState(0);
  // Configuration name
  const [configName, setConfigName] = useState('');
  // Agents configuration
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  // World configuration
  const [worldWidth, setWorldWidth] = useState(25);
  const [worldHeight, setWorldHeight] = useState(25);
  const [numRegions, setNumRegions] = useState(4);
  const [totalResources, setTotalResources] = useState(25);
  // Status message
  const [statusMessage, setStatusMessage] = useState('');
  // Saved configurations list
  const [configList, setConfigList] = useState<any[]>([]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Save the unified configuration
  const saveUnifiedConfiguration = async () => {
    if (!configName.trim()) {
      setStatusMessage("Please provide a configuration name.");
      return;
    }

    const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    try {
      // Check if we're updating an existing configuration
      const existingConfig = configList.find(config => config.name === configName);
      
      const payload: UnifiedConfig = {
        id: existingConfig?.id || Date.now().toString(),
        name: configName,
        agents: agentTypes,
        settings: {
          world: {
            size: [worldWidth, worldHeight],
            num_regions: numRegions,
            total_resources: totalResources
          }
        }
      };

      console.log("Saving unified configuration:", payload);
      const response = await fetch(`${BASEURL}/configuration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      console.log("Save response:", data);
      setStatusMessage(data.message || "Configuration saved successfully!");
      
      // Refresh the configuration list
      fetchConfigurations();
    } catch (error) {
      console.error("Error saving configuration:", error);
      setStatusMessage("Error saving configuration");
    }
  };

  // Fetch all configurations
  const fetchConfigurations = async () => {
    const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      console.log("Fetching all configurations...");
      const response = await fetch(`${BASEURL}/configuration/`);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched configurations:", data);
        setConfigList(data);
      } else {
        console.error("Failed to fetch configurations");
        setStatusMessage("Failed to fetch configurations");
      }
    } catch (error) {
      console.error("Error fetching configurations:", error);
      setStatusMessage("Error fetching configurations");
    }
  };
  
  // Load configuration on first mount
  useEffect(() => {
    fetchConfigurations();
  }, []);

  // Load configuration callback
  const handleLoadConfiguration = async (config: any) => {
    const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      console.log("Loading configuration:", config);
      
      // If we received just the name, fetch the full config
      if (typeof config === 'string') {
        const response = await fetch(`${BASEURL}/configuration/${encodeURIComponent(config)}`);
        if (!response.ok) {
          setStatusMessage("Configuration not found");
          return;
        }
        config = await response.json();
      }
      
      // Update agent types if present
      if (config.agents && Array.isArray(config.agents)) {
        setAgentTypes(config.agents);
      } else {
        setAgentTypes([]); // Reset if no agents
      }
      
      // Update world config if present
      if (config.settings?.world) {
        const world = config.settings.world;
        setWorldWidth(world.size?.[0] || 25);
        setWorldHeight(world.size?.[1] || 25);
        setNumRegions(world.num_regions || 4);
        setTotalResources(world.total_resources || 25);
      }
      
      // Update configuration name
      setConfigName(config.name || '');
      setStatusMessage(`Configuration '${config.name}' loaded successfully!`);
    } catch (error) {
      console.error("Error loading configuration:", error);
      setStatusMessage("Error loading configuration");
    }
  };
  
  // Delete configuration
  const handleDeleteConfiguration = async (name: string) => {
    const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      console.log("Deleting configuration:", name);
      const response = await fetch(`${BASEURL}/configuration/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log("Deletion response:", data);
      setStatusMessage(data.message || "Configuration deleted successfully!");
      fetchConfigurations();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      setStatusMessage("Error deleting configuration");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom sx={{ mt: 4 }}>
          EPOIKOS Simulation Configuration
        </Typography>
        
        {/* Tab Navigation */}
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
        
        {/* Tab Panels */}
        <div role="tabpanel" hidden={tabValue !== 0}>
          {tabValue === 0 && (
            <>
              <AgentConfigForm agents={agentTypes} setAgents={setAgentTypes} />
            </>
          )}
        </div>
        
        <div role="tabpanel" hidden={tabValue !== 1}>
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
        </div> 
        {/* Live JSON editor always visible */}
        <LiveJsonEditor agents={agentTypes} setAgents={setAgentTypes} />
        {/* Full configuration manager (save / load / table) */}
        <ConfigurationManager
          currentAgents={agentTypes}
          currentWorldConfig={{
            size: [worldWidth, worldHeight],
            num_regions: numRegions,
            total_resources: totalResources,
          }}
          configName={configName}
          setConfigName={setConfigName}
          onLoad={handleLoadConfiguration}
        />
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });