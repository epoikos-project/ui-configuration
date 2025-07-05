"use client";

import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
} from "@mui/material";
import type { Simulation } from "./types";

interface Props {
  simList: Simulation[];
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  refreshList: () => void;
}

/**
 * Table listing active simulations with metadata and actions.
 */
export default function SimulationTable({
  simList,
  onOpen,
  onDelete,
  refreshList,
}: Props) {
  return (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Active Simulations
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>World Size</TableCell>
              <TableCell>Agent Count</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {simList.map((sim) => (
              <TableRow key={sim.id}>
                <TableCell>{sim.id}</TableCell>
                <TableCell>
                  {new Date(sim.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(sim.last_used).toLocaleString()}
                </TableCell>
                <TableCell>
                  {sim.world_size
                    ? `${sim.world_size[0]} x ${sim.world_size[1]}`
                    : "-"}
                </TableCell>
                <TableCell>{sim.agent_count}</TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => onOpen(sim.id)}>
                    Open
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => onDelete(sim.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {simList.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No simulations initialized.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained" onClick={refreshList}>
          Refresh Simulations
        </Button>
      </Box>
    </Paper>
  );
}