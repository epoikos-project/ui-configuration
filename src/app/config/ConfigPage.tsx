"use client";

import React from "react";
import { Container, Box, Typography, Button } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";

import { useConfigManager } from "./useConfigManager";
import ConfigTable from "./ConfigTable";
import SimulationTable from "./SimulationTable";
import ConfigDialog from "./ConfigDialog";

const theme = createTheme({ colorSchemes: { dark: true } });

/**
 * Page component tying together config management and simulation actions.
 */
export default function ConfigPage() {
  const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
  const {
    availableModels,
    configList,
    simList,
    statusMessage,
    editingConfig,
    isDialogOpen,
    openDialog,
    closeDialog,
    saveConfig,
    launchConfig,
    deleteConfig,
    openSimulation,
    deleteSimulation,
    fetchConfigurations,
    fetchSimulations,
  } = useConfigManager(BASEURL);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Typography variant="h4" align="center" sx={{ mt: 4 }} gutterBottom>
          EPOIKOS Simulation Configuration
        </Typography>
        {statusMessage && (
          <Box mb={2}>
            <Typography color="primary">{statusMessage}</Typography>
          </Box>
        )}
        <Box mb={2} display="flex" justifyContent="flex-start">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openDialog()}
          >
            Add Configuration
          </Button>
        </Box>
        <ConfigTable
          configList={configList}
          onLaunch={launchConfig}
          onEdit={openDialog}
          onDelete={deleteConfig}
          refreshList={fetchConfigurations}
        />
        <SimulationTable
          simList={simList}
          onOpen={openSimulation}
          onDelete={deleteSimulation}
          refreshList={fetchSimulations}
        />
        <ConfigDialog
          open={isDialogOpen}
          availableModels={availableModels}
          editingConfig={editingConfig}
          onClose={closeDialog}
          onSave={saveConfig}
        />
      </Container>
    </ThemeProvider>
  );
}
