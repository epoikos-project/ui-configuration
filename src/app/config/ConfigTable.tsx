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
import type { UnifiedConfig } from "./types";

interface Props {
  configList: UnifiedConfig[];
  onLaunch: (name: string) => void;
  onEdit: (cfg: UnifiedConfig) => void;
  onDelete: (name: string) => void;
  refreshList: () => void;
}

/**
 * Table listing saved configurations with actions.
 */
export default function ConfigTable({
  configList,
  onLaunch,
  onEdit,
  onDelete,
  refreshList,
}: Props) {
  return (
    <Paper sx={{ mb: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Saved Configurations
      </Typography>
      <TableContainer>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Created</TableCell>
            <TableCell>Last Used</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
          <TableBody>
            {configList.map((cfg) => (
              <TableRow key={cfg.id}>
                <TableCell>{cfg.id}</TableCell>
                <TableCell>{cfg.name}</TableCell>
                <TableCell>
                  {new Date(cfg.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(cfg.last_used).toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <Button size="small" onClick={() => onLaunch(cfg.name)}>
                    Launch
                  </Button>
                  <Button size="small" sx={{ ml: 1 }} onClick={() => onEdit(cfg)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => onDelete(cfg.name)}
                  >
                    Delete
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
      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained" onClick={refreshList}>
          Refresh Configurations
        </Button>
      </Box>
    </Paper>
  );
}