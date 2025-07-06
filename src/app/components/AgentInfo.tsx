import { Card, CardHeader, CardContent, Typography, Box } from "@mui/material";
import { useAgent } from "../hooks/useAgent";
import { RelationshipGraph } from "./RelationshipGraph";

export function AgentInfo() {
  const { agent } = useAgent();

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardHeader title={`Agent ${agent.name}`} subheader={`ID: ${agent.id}`} />
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="body2">Model: {agent.model}</Typography>
        <Typography variant="body2">Hunger: {agent.hunger}</Typography>
        <Typography variant="body2">Energy: {agent.energy_level}</Typography>
        <Typography variant="body2">
          Coordinates: <strong>{agent.x_coord}, {agent.y_coord}</strong>
        </Typography>
        <Typography variant="body2">
          Visibility Range: {agent.visibility_range}
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Relationships:
        </Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <RelationshipGraph />
        </Box>
      </CardContent>
    </Card>
  );
}