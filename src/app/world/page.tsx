"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Define a type for our world (as we expect from the GET endpoint)
type WorldRecord = {
  id: string;
  simulation_id: string;
  size: [number, number];
  num_regions: number;
  total_resources: number;
};

const WorldPage: React.FC = () => {
  // Form fields
  const [simulationId, setSimulationId] = useState("");
  const [numRegions, setNumRegions] = useState(4);
  const [totalResources, setTotalResources] = useState(25);
  const [worldWidth, setWorldWidth] = useState(25);
  const [worldHeight, setWorldHeight] = useState(25);
  const [responseMessage, setResponseMessage] = useState("");

  // List of worlds for the simulation (fetched from backend)
  const [worldList, setWorldList] = useState<WorldRecord[]>([]);

  // Function to create a world via POST request
  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationId.trim()) {
      alert("Simulation ID is required.");
      return;
    }
    const url = `${BASEURL}/simulation/${encodeURIComponent(simulationId)}/world`;
    const payload = {
      simulation_id: simulationId,
      size: [worldWidth, worldHeight],
      num_regions: numRegions,
      total_resources: totalResources,
    };
    console.log("Creating world with payload:", payload);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("World creation response:", data);
      setResponseMessage(data.message || "World created successfully!");
      // After creation, refresh the list of worlds.
      fetchWorlds();
    } catch (error) {
      console.error("Error creating world:", error);
      setResponseMessage("Error creating world");
    }
  };

  // Function to fetch available worlds.
  // We assume a GET endpoint exists at:
  // GET /simulation/{simulation_id}/world returning an array of world records.
  const fetchWorlds = async () => {
    if (!simulationId.trim()) {
      console.warn("Simulation ID is empty – cannot fetch worlds.");
      return;
    }
    const url = `${BASEURL}/simulation/${encodeURIComponent(simulationId)}/world`;
    try {
      console.log("Fetching worlds for simulation:", simulationId);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched world records:", data);
        setWorldList(data);
      } else {
        console.error("Failed to fetch worlds");
      }
    } catch (error) {
      console.error("Error fetching worlds:", error);
    }
  };

  // Function to delete a world.
  // We assume a DELETE endpoint exists at:
  // DELETE /simulation/{simulation_id}/world/{world_id}
  const handleDeleteWorld = async (worldId: string) => {
    if (!simulationId.trim()) {
      alert("Simulation ID is required.");
      return;
    }
    const url = `${BASEURL}/simulation/${encodeURIComponent(simulationId)}/world/${encodeURIComponent(worldId)}`;
    try {
      console.log("Deleting world with id:", worldId);
      const response = await fetch(url, { method: "DELETE" });
      const data = await response.json();
      console.log("Deletion response:", data);
      setResponseMessage(data.message);
      fetchWorlds();
    } catch (error) {
      console.error("Error deleting world:", error);
      setResponseMessage("Error deleting world");
    }
  };

  // Theme for MUI
  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create World
          </Typography>
          <form onSubmit={handleCreateWorld}>
            <TextField
              fullWidth
              label="Simulation ID"
              value={simulationId}
              onChange={(e) => setSimulationId(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Number of Regions"
              type="number"
              value={numRegions}
              onChange={(e) => setNumRegions(parseInt(e.target.value) || 0)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Total Resources"
              type="number"
              value={totalResources}
              onChange={(e) => setTotalResources(parseInt(e.target.value) || 0)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="World Width"
              type="number"
              value={worldWidth}
              onChange={(e) => setWorldWidth(parseInt(e.target.value) || 0)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="World Height"
              type="number"
              value={worldHeight}
              onChange={(e) => setWorldHeight(parseInt(e.target.value) || 0)}
              margin="normal"
              required
            />
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="contained" type="submit">
                Create World
              </Button>
            </Box>
          </form>
          {responseMessage && (
            <Box mt={2}>
              <Typography variant="h6" color="primary" align="center">
                {responseMessage}
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Table of available worlds */}
        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Available Worlds for Simulation "{simulationId || 'N/A'}"
          </Typography>
          <Box display="flex" justifyContent="center" mb={2}>
            <Button variant="contained" onClick={fetchWorlds}>
              Refresh Worlds List
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Regions</TableCell>
                  <TableCell>Resources</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {worldList.map((world) => (
                  <TableRow key={world.id}>
                    <TableCell>{world.id}</TableCell>
                    <TableCell>{world.size[0]}x{world.size[1]}</TableCell>
                    <TableCell>{world.num_regions}</TableCell>
                    <TableCell>{world.total_resources}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleDeleteWorld(world.id)}
                      >
                        Delete
                      </Button>
                      {/* Optionally, add a Load/Edit button if needed */}
                    </TableCell>
                  </TableRow>
                ))}
                {worldList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No worlds available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default dynamic(() => Promise.resolve(WorldPage), { ssr: false });
