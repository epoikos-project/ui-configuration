"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AgentConfigForm, { AgentType } from './components/AgentConfigForm';
import ConfigurationManager from './components/ConfigurationManager';
import LiveJsonEditor from './components/LiveJsonEditor';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const Page: React.FC = () => {
  // Lift the agents state so that it is shared and can be updated
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  console.log("Page component agentTypes:", agentTypes);
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom>
          Simulation Configuration
        </Typography>
        {/* Agent configuration form */}
        <AgentConfigForm agents={agentTypes} setAgents={setAgentTypes} />
        {/* Configuration manager */}
        <ConfigurationManager
          currentAgents={agentTypes}
          onLoad={(loadedAgents: AgentType[]) => {
            console.log("Parent received loaded agents:", loadedAgents);
            setAgentTypes(loadedAgents);
          }}
        />
        {/* Live JSON Editor to display & allow editing of current agent configuration */}
        <LiveJsonEditor agents={agentTypes} setAgents={setAgentTypes} />
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
