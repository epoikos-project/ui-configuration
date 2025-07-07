"use client";

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import type { ResourceConfig } from "./LiveJsonEditor";

type Props = {
  resources: ResourceConfig[];
  setResources: (r: ResourceConfig[]) => void;
};

export default function ResourceConfigForm({ resources, setResources }: Props) {
  const [editing, setEditing] = useState<ResourceConfig | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(0);
  const [minAgents, setMinAgents] = useState(1);
  const [miningTime, setMiningTime] = useState(1);
  const [energyYield, setEnergyYield] = useState(0);

  const reset = () => {
    setEditing(null);
    setName("");
    setCount(0);
    setMinAgents(1);
    setMiningTime(1);
    setEnergyYield(0);
  };

  const handleEdit = (r: ResourceConfig) => {
    setEditing(r);
    setName(r.name);
    setCount(r.count);
    setMinAgents(r.minAgents);
    setMiningTime(r.miningTime);
    setEnergyYield(r.energyYield);
  };

  const handleRemove = (i: number) => {
    setResources(resources.filter((_, idx) => idx !== i));
    reset();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cfg: ResourceConfig = { name, count, minAgents, miningTime, energyYield };
    if (editing) {
      setResources(resources.map((r) => (r === editing ? cfg : r)));
    } else {
      setResources([...resources, cfg]);
    }
    reset();
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Resource Settings
      </Typography>
      <List>
        {resources.map((r, i) => (
          <ListItem
            key={i}
            secondaryAction={
              <>
                <IconButton edge="end" onClick={() => handleEdit(r)}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" onClick={() => handleRemove(i)}>
                  <Delete />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={r.name}
              secondary={`Count: ${r.count}, Agents: ${r.minAgents}, Time: ${r.miningTime}, Yield: ${r.energyYield}`}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Box component="form" onSubmit={submit} display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={2}>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField
          label="Count"
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 0)}
          required
        />
        <TextField
          label="Agents Req."
          type="number"
          value={minAgents}
          onChange={(e) => setMinAgents(parseInt(e.target.value) || 1)}
          required
        />
        <TextField
          label="Time To Mine"
          type="number"
          value={miningTime}
          onChange={(e) => setMiningTime(parseInt(e.target.value) || 1)}
          required
        />
        <TextField
          label="Energy Yield"
          type="number"
          value={energyYield}
          onChange={(e) => setEnergyYield(parseInt(e.target.value) || 0)}
          required
        />
        <Button type="submit" variant="contained" sx={{ gridColumn: 'span 5' }}>
          {editing ? 'Update Resource' : 'Add Resource'}
        </Button>
      </Box>
    </Paper>
  );
}