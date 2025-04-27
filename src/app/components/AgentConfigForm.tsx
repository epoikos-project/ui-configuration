"use client";

import React, { useState } from "react";
import {
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Edit, FileCopy, Delete } from "@mui/icons-material";

export type AgentType = {
  id: number;
  name: string;
  count: number;
  model: string;
  personality?: string[];
  objective?: string;
  attributes: Attribute[];
};

type DistributionSpec =
  | { type: "fixed"; value: number }
  | { type: "normal"; mean: number; stddev: number }
  | { type: "binomial"; trials: number; probability: number }
  | { type: "beta"; alpha: number; beta: number }
  | { type: "dirichlet"; alphas: number[] };

type Attribute = {
  name: string;
  spec: DistributionSpec;
};

type Props = {
  agents: AgentType[];
  setAgents: (agents: AgentType[]) => void;
};

const AgentConfigForm: React.FC<Props> = ({ agents, setAgents }) => {
  const MANDATORY: readonly string[] = ["hunger"];
  const [editing, setEditing] = useState<AgentType | null>(null);
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);
  const [model, setModel] = useState("");
  const [objective, setObjective] = useState("");
  const [personality, setPersonality] = useState<string[]>([""]);
  const [attributes, setAttributes] = useState<Attribute[]>(() =>
    MANDATORY.map((n) => ({ name: n, spec: { type: "fixed", value: 0 } }))
  );
  const [errors, setErrors] = useState<string[]>([]);

  const reset = () => {
    setEditing(null);
    setName("");
    setCount(1);
    setModel("");
    setObjective("");
    setPersonality([""]);
    setAttributes(
      MANDATORY.map((n) => ({
        name: n,
        spec: { type: "fixed", value: 0 },
      }))
    );
    setErrors([]);
  };

  const handleEdit = (a: AgentType) => {
    setEditing(a);
    setName(a.name);
    setCount(a.count);
    setModel(a.model ?? "");
    setObjective(a.objective ?? "");
    setPersonality(a.personality ?? [""]);
    setAttributes(
            a.attributes.map((at) =>
              // if it already has spec, keep it; otherwise wrap value
              'spec' in at
                ? (at as Attribute)
                : ({ name: at.name, spec: { type: 'fixed', value: (at as any).value } })
            )
          );
  };

  const validateForm = () => {
        const e: string[] = [];
        if (!name.trim()) e.push("Name required");
        MANDATORY.forEach((m) => {
          if (!attributes.some((at) => at.name === m)) e.push(`Missing ${m}`);
        });
        return e;
      };
  
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
  
    // validateForm uses name + attributes from state
    const errs = validateForm();
    if (errs.length) {
      setErrors(errs);
      return;
    }
  
    // expand into 'count' concrete agents
    const newOnes: AgentType[] = [];
    for (let i = 0; i < count; i++) {
      newOnes.push({
        id: Date.now() + i,
        name,
        count: 1,
        model: model || undefined,
        objective: objective || undefined,
        personality: personality.filter((p) => p.trim()),
        attributes: attributes.map((attr) => ({
          name: attr.name,
          value: sampleAttr(attr.spec),
        })),
      });
    }
  
    setAgents(
      editing
        ? agents.map((a) => (a.id === editing.id ? newOnes[0] : a))
        : [...agents, ...newOnes]
    );
    reset();
  };

  const changeAttrName = (i: number, v: string) =>
    setAttributes((a) => {
      const x = [...a];
      x[i].name = v;
      return x;
    });

  const changeAttrSpec = (i: number, spec: DistributionSpec) =>
    setAttributes((atts) => {
      const next = [...atts];
      next[i].spec = spec;
      return next;
    });

  // Data generators
  const makeNormalData = (μ: number, σ: number) => {
    const POINTS = 30;
    // If stddev is zero or negative, just return a single spike at the mean
    if (σ <= 0) {
      return [{ x: μ, y: 1 }];
    }
  
    const data: { x: number; y: number }[] = [];
    const start = μ - 3 * σ;
    const end = μ + 3 * σ;
    const step = (end - start) / POINTS;
  
    for (let i = 0; i <= POINTS; i++) {
      const x = start + i * step;
      const y =
        (1 / (Math.sqrt(2 * Math.PI) * σ)) *
        Math.exp(-((x - μ) ** 2) / (2 * σ * σ));
      data.push({ x, y });
    }
    return data;
  };  
  const makeBinomialData = (n: number, p: number) => {
    const data: { x: number; y: number }[] = [];
    const C = (n: number, k: number) => {
      let res = 1;
      for (let i = 1; i <= k; i++) res = (res * (n - i + 1)) / i;
      return res;
    };
    for (let k = 0; k <= n; k++) {
      const y = C(n, k) * p ** k * (1 - p) ** (n - k);
      data.push({ x: k, y });
    }
    return data;
  };
  const makeBetaData = (α: number, β: number) => {
    const data: { x: number; y: number }[] = [];
    const B = (α: number, β: number) =>
      Math.exp(Math.lgamma(α) + Math.lgamma(β) - Math.lgamma(α + β));
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const y = (t ** (α - 1) * (1 - t) ** (β - 1)) / B(α, β);
      data.push({ x: t, y });
    }
    return data;
  };

  const sampleAttr = (spec: DistributionSpec): number => {
      switch (spec.type) {
          case "fixed":
            return spec.value;
          case "normal": {
            // Box–Muller
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
            return spec.mean + spec.stddev * z;
          }
          case "binomial": {
            let c = 0;
            for (let i = 0; i < spec.trials; i++) {
              if (Math.random() < spec.probability) c++;
            }
            return c;
          }
          case "beta": {
            // very naive Beta via two Gamma(α,1)/Gamma(β,1) draws
            const gamma = (shape: number) => {
              // Marsaglia & Tsang
              if (shape < 1) {
                const d = shape + (2 / 3);
                const c = 1 / Math.sqrt(9 * d);
                while (true) {
                  let x = 0, v = 0;
                  do {
                    x = Math.random() * 2 - 1;
                    v = Math.random() * 2 - 1;
                  } while (x * x + v * v > 1);
                  const n = x * Math.sqrt(-2 * Math.log(x * x + v * v) / (x * x + v * v));
                  const delta = 1 + c * n;
                  if (delta > 0 && Math.log(Math.random()) < 0.5 * n * n + d - d * delta + d * Math.log(delta))
                    return d * delta * Math.pow(Math.random(), 1 / shape);
                }
              } else {
                const d = shape - (1 / 3);
                const c = 1 / Math.sqrt(9 * d);
                while (true) {
                  let x = 0, v = 0;
                  do {
                    x = Math.random() * 2 - 1;
                    v = Math.random() * 2 - 1;
                  } while (x * x + v * v > 1);
                  const n = x * Math.sqrt(-2 * Math.log(x * x + v * v) / (x * x + v * v));
                  const delta = 1 + c * n;
                  if (delta > 0 && Math.log(Math.random()) < 0.5 * n * n + d - d * delta + d * Math.log(delta))
                    return d * delta;
                }
              }
            };
            const g1 = gamma(spec.alpha);
            const g2 = gamma(spec.beta);
            return g1 / (g1 + g2);
          }
          case "dirichlet":
            // not supported as a single numeric attribute—fall back to equal share
            return 1 / spec.alphas.length;
        }
      };

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
        {/* Agent name, count, model, objective, personality */}
        <TextField
          fullWidth
          required
          margin="normal"
          label="Agent Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Count"
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
        />
        <Box mt={2}>
          <Typography variant="subtitle1">Model</Typography>
          <Select
            fullWidth
            value={model}
            onChange={(e) => setModel(e.target.value as string)}
          >
            <MenuItem value="llama-3.1-8b-instruct">llama-3.1-8b-instruct</MenuItem>
            <MenuItem value="llama-3.3-70b-instruct">llama-3.3-70b-instruct</MenuItem>
          </Select>
        </Box>
        <TextField
          fullWidth
          margin="normal"
          label="Objective"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />
        <Box mt={2}>
          <Typography variant="subtitle1">Personality</Typography>
          {personality.map((p, i) => (
            <Box key={i} display="flex" gap={1} mt={1}>
              <TextField
                fullWidth
                label={`Trait ${i + 1}`}
                value={p}
                onChange={(e) =>
                  setPersonality((ps) =>
                    ps.map((t, idx) => (idx === i ? e.target.value : t))
                  )
                }
              />
              <Button
                variant="outlined"
                color="error"
                onClick={() => setPersonality((ps) => ps.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button variant="contained" sx={{ mt: 1 }} onClick={() => setPersonality((ps) => [...ps, ""])}>
            Add Trait
          </Button>
        </Box>

        {/* Attributes with distributions */}
        <Box mt={2}>
          <Typography variant="subtitle1">Attributes</Typography>
          {attributes.map((attr, i) => (
            <Paper key={i} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <TextField
                  label="Name"
                  value={attr.name}
                  disabled={MANDATORY.includes(attr.name)}
                  onChange={(e) => changeAttrName(i, e.target.value)}
                />
                <FormControl sx={{ minWidth: 140 }}>
                  <InputLabel>Distribution</InputLabel>
                  <Select
                    label="Distribution"
                    value={attr.spec.type}
                    onChange={(e) => {
                      const type = e.target.value as DistributionSpec["type"];
                      let spec: DistributionSpec;
                      switch (type) {
                        case "fixed":
                          spec = { type, value: 0 };
                          break;
                        case "normal":
                          spec = { type, mean: 0, stddev: 1 };
                          break;
                        case "binomial":
                          spec = { type, trials: 10, probability: 0.5 };
                          break;
                        case "beta":
                          spec = { type, alpha: 2, beta: 2 };
                          break;
                        case "dirichlet":
                          spec = { type, alphas: [1, 1, 1] };
                          break;
                      }
                      changeAttrSpec(i, spec);
                    }}
                  >
                    <MenuItem value="fixed">Fixed</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="binomial">Binomial</MenuItem>
                  </Select>
                </FormControl>

                {/* Fixed */}
                {attr.spec.type === "fixed" && (
                  <TextField
                    label="Value"
                    type="number"
                    sx={{ width: 100 }}
                    value={attr.spec.value}
                    onChange={(e) =>
                      changeAttrSpec(i, { ...attr.spec, value: +e.target.value })
                    }
                  />
                )}

                {/* Normal */}
                {attr.spec.type === "normal" && (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 260,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {(() => {
                      const { mean: μ, stddev: σ } = attr.spec;
                      const data = makeNormalData(μ, σ);
                      return (
                        <LineChart
                          key={`${μ}-${σ}`}
                          width={240}
                          height={120}
                          data={data}
                        >
                          <XAxis
                            type="number"
                            dataKey="x"
                            domain={[μ - 3 * σ, μ + 3 * σ]}
                            tickCount={5}
                          />
                          <YAxis tickCount={4} />
                          <Line
                            type="monotone"
                            dataKey="y"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      );
                    })()}
                    <Typography variant="caption">
                      Mean (μ): {attr.spec.mean.toFixed(1)}
                    </Typography>
                    <Slider
                      value={attr.spec.mean}
                      min={0}
                      max={100}
                      step={0.5}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          mean: val as number,
                        })
                      }
                    />
                    <Typography variant="caption">
                      StdDev (σ): {attr.spec.stddev.toFixed(1)}
                    </Typography>
                    <Slider
                      value={attr.spec.stddev}
                      min={0}
                      max={50}
                      step={0.5}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          stddev: val as number,
                        })
                      }
                    />
                  </Box>
                )}

                {/* Binomial */}
                {attr.spec.type === "binomial" && (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 260,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {(() => {
                      const { trials: n, probability: p } = attr.spec;
                      const data = makeBinomialData(n, p);
                      return (
                        <BarChart width={240} height={120} data={data}>
                          <XAxis dataKey="x" tickCount={n + 1} />
                          <YAxis tickCount={4} />
                          <Bar dataKey="y" />
                        </BarChart>
                      );
                    })()}
                    <Typography variant="caption">
                      Trials (n): {attr.spec.trials}
                    </Typography>
                    <Slider
                      value={attr.spec.trials}
                      min={1}
                      max={50}
                      step={1}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          trials: val as number,
                        })
                      }
                    />
                    <Typography variant="caption">
                      p: {attr.spec.probability.toFixed(2)}
                    </Typography>
                    <Slider
                      value={attr.spec.probability}
                      min={0}
                      max={1}
                      step={0.01}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          probability: val as number,
                        })
                      }
                    />
                  </Box>
                )}

                {/* Beta */}
                {attr.spec.type === "beta" && (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 260,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {(() => {
                      const { alpha: α, beta: β } = attr.spec;
                      const data = makeBetaData(α, β);
                      return (
                        <LineChart width={240} height={120} data={data}>
                          <XAxis dataKey="x" tickCount={5} />
                          <YAxis tickCount={4} />
                          <Line
                            type="monotone"
                            dataKey="y"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                          />
                        </LineChart>
                      );
                    })()}
                    <Typography variant="caption">
                      α: {attr.spec.alpha.toFixed(1)}
                    </Typography>
                    <Slider
                      value={attr.spec.alpha}
                      min={0.5}
                      max={10}
                      step={0.1}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          alpha: val as number,
                        })
                      }
                    />
                    <Typography variant="caption">
                      β: {attr.spec.beta.toFixed(1)}
                    </Typography>
                    <Slider
                      value={attr.spec.beta}
                      min={0.5}
                      max={10}
                      step={0.1}
                      valueLabelDisplay="auto"
                      sx={{ width: 240 }}
                      onChange={(_, val) =>
                        changeAttrSpec(i, {
                          ...attr.spec,
                          beta: val as number,
                        })
                      }
                    />
                  </Box>
                )}

                {/* Dirichlet (params only) */}
                {attr.spec.type === "dirichlet" && (
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 260,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="caption">
                      Alphas: {attr.spec.alphas.join(", ")}
                    </Typography>
                    <Box display="flex" gap={1}>
                      {attr.spec.alphas.map((a, idx) => (
                        <TextField
                          key={idx}
                          label={`α${idx + 1}`}
                          type="number"
                          size="small"
                          value={a}
                          onChange={(e) => {
                            const newAlphas = [...attr.spec.alphas];
                            newAlphas[idx] = +e.target.value;
                            changeAttrSpec(i, {
                              ...attr.spec,
                              alphas: newAlphas,
                            });
                          }}
                        />
                      ))}
                      <Button
                        onClick={() =>
                          changeAttrSpec(i, {
                            ...attr.spec,
                            alphas: [...attr.spec.alphas, 1],
                          })
                        }
                      >
                        + α
                      </Button>
                      <Button
                        color="error"
                        onClick={() =>
                          changeAttrSpec(i, {
                            ...attr.spec,
                            alphas: attr.spec.alphas.slice(0, -1),
                          })
                        }
                        disabled={attr.spec.alphas.length <= 2}
                      >
                        – α
                      </Button>
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      (Dirichlet preview not shown)
                    </Typography>
                  </Box>
                )}

                {/* Remove attribute */}
                {!MANDATORY.includes(attr.name) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      setAttributes((atts) => atts.filter((_, idx) => idx !== i))
                    }
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Paper>
          ))}

          <Button
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() =>
              setAttributes((atts) => [
                ...atts,
                { name: "", spec: { type: "fixed", value: 0 } },
              ])
            }
          >
            Add Attribute
          </Button>
        </Box>

        {/* Reset / Add Agent */}
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={reset}>
            Reset
          </Button>
          <Button variant="contained" type="submit">
            {editing ? "Update Agent" : "Add Agent"}
          </Button>
        </Box>

        {/* Agent Types List */}
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
                  <IconButton
                    onClick={() =>
                      setAgents([
                        ...agents,
                        { ...a, id: Date.now(), name: `${a.name} (Copy)` },
                      ])
                    }
                  >
                    <FileCopy />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      setAgents(agents.filter((x) => x.id !== a.id))
                    }
                  >
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
