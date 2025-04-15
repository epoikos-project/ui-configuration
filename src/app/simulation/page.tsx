"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Container, Typography } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AgentConfigForm, { AgentType } from '../components/AgentConfigForm';
import ConfigurationManager from '../components/ConfigurationManager';

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

const Page: React.FC = () => {
  // Lift the agents state in the parent component
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);

  console.log("Page component agentTypes:", agentTypes);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" gutterBottom>
          Simulation Configuration
        </Typography>
        {/* Agent configuration form with state lifted from parent */}
        <AgentConfigForm agents={agentTypes} setAgents={setAgentTypes} />
        {/* Configuration manager: pass currentAgents and a callback to update agent list on load */}
        <ConfigurationManager
          currentAgents={agentTypes}
          onLoad={(loadedAgents: AgentType[]) => {
            console.log("Parent received loaded agents:", loadedAgents);
            setAgentTypes(loadedAgents);
          }}
        />
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(Page), { ssr: false });
// This will ensure that the component is only rendered on the client side