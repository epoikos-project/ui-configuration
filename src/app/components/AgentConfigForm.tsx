"use client";

import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Paper, List,
  ListItem, ListItemText, IconButton, Divider, Select, MenuItem
} from "@mui/material";
import { Edit, FileCopy, Delete } from "@mui/icons-material";

type Attribute = { name: string; value: number };

export type AgentType = {
  id: number;
  name: string;
  count: number;
  model?: string;
  personality?: string[];
  objective?: string;
  attributes: Attribute[];
};

const MANDATORY: readonly string[] = ["hunger"];

type Props = {
  agents: AgentType[];
  setAgents: (agents: AgentType[]) => void;
};

const AgentConfigForm: React.FC<Props> = ({ agents, setAgents }) => {
  const [editing, setEditing] = useState<AgentType | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);
  const [model, setModel] = useState("");
  const [objective, setObjective] = useState("");
  const [personality, setPersonality] = useState<string[]>([""]);
  const [attributes, setAttributes] = useState<Attribute[]>(
    MANDATORY.map((n) => ({ name: n, value: 0 }))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const reset = () => {
    setEditing(null);
    setName("");
    setCount(1);
    setModel("");
    setObjective("");
    setPersonality([""]);
    setAttributes(MANDATORY.map((n) => ({ name: n, value: 0 })));
    setErrors([]);
  };

  const handleEdit = (a: AgentType) => {
    setEditing(a);
    setName(a.name);
    setCount(a.count);
    setModel(a.model ?? "");
    setObjective(a.objective ?? "");
    setPersonality(a.personality ?? [""]);
    setAttributes(a.attributes);
  };

  const validate = (a: AgentType) => {
    const e: string[] = [];
    if (!a.name.trim()) e.push("Name required");
    MANDATORY.forEach((m) => {
      if (!a.attributes.some((at) => at.name === m)) e.push(`Missing ${m}`);
    });
    return e;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: AgentType = {
      id: editing ? editing.id : Date.now(),
      name,
      count,
      model: model || undefined,
      objective: objective || undefined,
      personality: personality.filter((p) => p.trim()),
      attributes,
    };
    const errs = validate(next);
    if (errs.length) {
      setErrors(errs);
      return;
    }
    setAgents(
      editing ? agents.map((a) => (a.id === next.id ? next : a)) : [...agents, next]
    );
    reset();
  };

  const changeAttrName = (i: number, v: string) =>
    setAttributes((a) => {
      const x = [...a];
      x[i].name = v;
      return x;
    });
  const changeAttrVal = (i: number, v: number) =>
    setAttributes((a) => {
      const x = [...a];
      x[i].value = v;
      return x;
    });

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6">
        {editing ? "Edit Agent Type" : "Add Agent Type"}
      </Typography>

      {errors.length > 0 && (
        <Box mb={2}>
          {errors.map((e, idx) => (
            <Typography key={idx} color="error">
              {e}
            </Typography>
          ))}
        </Box>
      )}

      <form onSubmit={submit}>
        <TextField fullWidth required margin="normal" label="Agent Name" value={name}
          onChange={(e) => setName(e.target.value)} />
        <TextField fullWidth margin="normal" label="Count" type="number" value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)} />
        <Box mt={2}>
          <Typography variant="subtitle1">Model</Typography>
          <Select fullWidth value={model}
            onChange={(e) => setModel(e.target.value as string)}>
            <MenuItem value="llama-3.1-8b-instruct">llama-3.1-8b-instruct</MenuItem>
            <MenuItem value="llama-3.3-70b-instruct">llama-3.3-70b-instruct</MenuItem>
          </Select>
        </Box>
        <TextField fullWidth margin="normal" label="Objective" value={objective}
          onChange={(e) => setObjective(e.target.value)} />

        <Box mt={2}>
          <Typography variant="subtitle1">Personality</Typography>
          {personality.map((p, i) => (
            <Box key={i} display="flex" gap={1} mt={1}>
              <TextField fullWidth label={`Trait ${i + 1}`} value={p}
                onChange={(e) =>
                  setPersonality((ps) =>
                    ps.map((t, idx) => (idx === i ? e.target.value : t))
                  )
                } />
              <Button variant="outlined" color="error"
                onClick={() => setPersonality((ps) => ps.filter((_, idx) => idx !== i))}>
                Remove
              </Button>
            </Box>
          ))}
          <Button variant="contained" sx={{ mt: 1 }}
            onClick={() => setPersonality((ps) => [...ps, ""])}>
            Add Trait
          </Button>
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle1">Attributes</Typography>
          {attributes.map((attr, i) => (
            <Box key={i} display="flex" gap={1} mt={1}>
              <TextField fullWidth label="Name" value={attr.name}
                disabled={MANDATORY.includes(attr.name)}
                onChange={(e) => changeAttrName(i, e.target.value)} />
              <TextField label="Value" type="number" value={attr.value}
                onChange={(e) => changeAttrVal(i, parseInt(e.target.value) || 0)} />
              {!MANDATORY.includes(attr.name) && (
                <Button variant="outlined" color="error"
                  onClick={() => setAttributes((a) => a.filter((_, idx) => idx !== i))}>
                  Remove
                </Button>
              )}
            </Box>
          ))}
          <Button variant="contained" sx={{ mt: 1 }}
            onClick={() => setAttributes((a) => [...a, { name: "", value: 0 }])}>
            Add Attribute
          </Button>
        </Box>

        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={reset}>Reset</Button>
          <Button variant="contained" type="submit">
            {editing ? "Update Agent" : "Add Agent"}
          </Button>
        </Box>

        <Box mt={2}>
          <Typography variant="h6">Agent Types List</Typography>
          <List>
            {agents.map((a) => (
              <div key={a.id}>
                <ListItem>
                  <ListItemText primary={`${a.count}x ${a.name}`} />
                  <IconButton onClick={() => handleEdit(a)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() =>
                    setAgents([...agents, { ...a, id: Date.now(), name: `${a.name} (Copy)` }])}>
                    <FileCopy />
                  </IconButton>
                  <IconButton onClick={() => setAgents(agents.filter((x) => x.id !== a.id))}>
                    <Delete />
                  </IconButton>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Box>
      </form>
    </Paper>
  );
};

export default AgentConfigForm;
