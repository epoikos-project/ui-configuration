"use client";

import React, { useState } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import { Edit, FileCopy, Delete } from '@mui/icons-material';

type Attribute = { name: string; value: number };
type AgentType = {
  id: number;
  name: string;
  count: number;
  traits: string[];
  IQ: number;
  attributes: Attribute[];
};

const MANDATORY_ATTRIBUTES = ['health', 'speed'];

const AgentConfig: React.FC = () => {
  // Initial state for attributes includes mandatory ones.
  const [agentTypes, setAgentTypes] = useState<AgentType[]>([]);
  const [editingAgent, setEditingAgent] = useState<AgentType | null>(null);
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [traits, setTraits] = useState<string[]>(['']);
  const [IQ, setIQ] = useState(100);
  const [attributes, setAttributes] = useState<Attribute[]>(
    MANDATORY_ATTRIBUTES.map(attr => ({ name: attr, value: 0 }))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setCount(1);
    setTraits(['']);
    setIQ(100);
    setAttributes(MANDATORY_ATTRIBUTES.map(attr => ({ name: attr, value: 0 })));
    setEditingAgent(null);
    setErrors([]);
  };

  const validateAgent = (agent: AgentType): string[] => {
    const errs: string[] = [];
    if (!agent.name.trim()) errs.push("Name is required.");
    MANDATORY_ATTRIBUTES.forEach(requiredAttr => {
      if (!agent.attributes.some(attr => attr.name === requiredAttr)) {
        errs.push(`Missing mandatory attribute: ${requiredAttr}`);
      }
    });
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAgent: AgentType = {
      id: editingAgent ? editingAgent.id : Date.now(),
      name,
      count,
      traits,
      IQ,
      attributes,
    };
    const validationErrors = validateAgent(newAgent);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (editingAgent) {
      setAgentTypes(agentTypes.map(agent => agent.id === editingAgent.id ? newAgent : agent));
    } else {
      setAgentTypes([...agentTypes, newAgent]);
    }
    resetForm();
  };

  const handleEdit = (agent: AgentType) => {
    setEditingAgent(agent);
    setName(agent.name);
    setCount(agent.count);
    setTraits(agent.traits);
    setIQ(agent.IQ);
    setAttributes(agent.attributes);
    setErrors([]);
  };

  const handleCopy = (agent: AgentType) => {
    const copiedAgent: AgentType = {
      ...agent,
      id: Date.now(),
      name: agent.name + ' (Copy)',
    };
    setAgentTypes([...agentTypes, copiedAgent]);
  };

  const handleDelete = (id: number) => {
    setAgentTypes(agentTypes.filter(agent => agent.id !== id));
  };

  const handleTraitChange = (index: number, value: string) => {
    const updatedTraits = [...traits];
    updatedTraits[index] = value;
    setTraits(updatedTraits);
  };

  const addTrait = () => setTraits([...traits, '']);
  const removeTrait = (index: number) => setTraits(traits.filter((_, i) => i !== index));

  const handleAttributeNameChange = (index: number, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].name = value;
    setAttributes(updatedAttributes);
  };

  const handleAttributeValueChange = (index: number, value: number) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index].value = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => setAttributes([...attributes, { name: '', value: 0 }]);
  const removeAttribute = (index: number) => {
    if (MANDATORY_ATTRIBUTES.includes(attributes[index].name)) return;
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" gutterBottom>
        Agent Configuration
      </Typography>
      <Box display="flex" flexDirection="row" gap={2}>
        <Paper elevation={3} sx={{ flex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {editingAgent ? 'Edit Agent Type' : 'Add Agent Type'}
          </Typography>
          {errors.length > 0 && (
            <Box mb={2}>
              {errors.map((error, index) => (
                <Typography key={index} color="error">
                  {error}
                </Typography>
              ))}
            </Box>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Agent Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Count"
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="IQ"
              type="number"
              value={IQ}
              onChange={(e) => setIQ(parseInt(e.target.value) || 100)}
              margin="normal"
            />
            <Box mt={2}>
              <Typography variant="subtitle1">Traits</Typography>
              {traits.map((trait, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mt={1}>
                  <TextField
                    fullWidth
                    label={`Trait ${index + 1}`}
                    value={trait}
                    onChange={(e) => handleTraitChange(index, e.target.value)}
                  />
                  <Button variant="outlined" color="error" onClick={() => removeTrait(index)}>
                    Remove
                  </Button>
                </Box>
              ))}
              <Button variant="contained" onClick={addTrait} sx={{ mt: 1 }}>
                Add Trait
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="subtitle1">Attributes</Typography>
              {attributes.map((attr, index) => (
                <Box key={index} display="flex" alignItems="center" gap={1} mt={1}>
                  <TextField
                    fullWidth
                    label="Attribute Name"
                    value={attr.name}
                    onChange={(e) => handleAttributeNameChange(index, e.target.value)}
                    disabled={MANDATORY_ATTRIBUTES.includes(attr.name)}
                  />
                  <TextField
                    label="Value"
                    type="number"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeValueChange(index, parseInt(e.target.value) || 0)
                    }
                  />
                  {!MANDATORY_ATTRIBUTES.includes(attr.name) && (
                    <Button variant="outlined" color="error" onClick={() => removeAttribute(index)}>
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button variant="contained" onClick={addAttribute} sx={{ mt: 1 }}>
                Add Attribute
              </Button>
            </Box>
            <Box mt={2} display="flex" justifyContent="space-between">
              <Button variant="outlined" onClick={resetForm}>
                Reset
              </Button>
              <Button variant="contained" type="submit">
                {editingAgent ? 'Update Agent' : 'Save Agent'}
              </Button>
            </Box>
          </form>
        </Paper>
        <Paper elevation={3} sx={{ width: 300, p: 2 }}>
          <Typography variant="h6">Agent Types</Typography>
          <List>
            {agentTypes.map((agent) => (
              <div key={agent.id}>
                <ListItem>
                  <ListItemText primary={`${agent.count}x ${agent.name}`} />
                  <IconButton onClick={() => handleEdit(agent)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleCopy(agent)}>
                    <FileCopy />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(agent.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        </Paper>
      </Box>
      <Box mt={4}>
        <Typography variant="h6">Live JSON Preview</Typography>
        <Paper elevation={2} sx={{ p: 2, backgroundColor: '#f5f5f5', overflowX: 'auto' }}>
          <pre>{JSON.stringify(agentTypes, null, 2)}</pre>
        </Paper>
      </Box>
    </Container>
  );
};

export default AgentConfig;
