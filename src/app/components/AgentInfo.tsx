"use client";

import { Paper, Typography } from "@mui/material";
import { useAgent } from "../hooks/useAgent";
import { RelationshipGraph } from "./RelationshipGraph";

export function AgentInfo() {
  const { agent } = useAgent();
  console.log(agent);
  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        paddingX: 5,
        backgroundColor: "#103014",
        color: "#fff",
        borderRadius: 0,
      }}
    >
      <Typography variant="h5"> Agent {agent.name}</Typography>
      <Typography variant="body1">ID: {agent.id}</Typography>

      <Typography variant="body1">Model: {agent.model}</Typography>
      <Typography variant="body1">Hunger: {agent.hunger}</Typography>
      <Typography variant="body1">
        Coordinates: (
        <b>
          {agent.x_coord}, {agent.y_coord}
        </b>
        )
      </Typography>
      <Typography variant="body1">
        Visibility Range: {agent.visibility_range}
      </Typography>
      <hr style={{ marginTop: 5, marginBottom: 5 }} />
      <Typography variant="h6">Relationships:</Typography>
      <RelationshipGraph />
    </Paper>
  );
}
