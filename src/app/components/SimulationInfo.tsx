import { Card, CardHeader, CardContent, CardActions, Button, Grid, Typography } from "@mui/material";
import { SimProps } from "../simulation/[id]/app";
import { useSimulation } from "../hooks/useSimulation";
import { startSimulation, stopSimulation, tickSimulation } from "../simulation/[id]/actions";

export function SimulationInfo(props: SimProps) {
  const { world, agents } = props;
  const { simulation } = useSimulation();

  return (
    <Card variant="outlined">
      <CardHeader
        title={`Simulation ${simulation.id}`}
        subheader={`Running: ${simulation.running.toString()}`}
      />  
      <CardContent>
        <Grid container spacing={1}>
          <Grid size={6}>
            <Typography variant="body2">
              <strong>Current Tick:</strong> {simulation.tick}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2">
              <strong>World Size:</strong> {world.size_x} × {world.size_y}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2">
              <strong>World ID:</strong> {world.id}
            </Typography>
          </Grid>
          <Grid size={6}>
            <Typography variant="body2">
              <strong>Agents:</strong> {agents.length}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => startSimulation(simulation.id)}
        >
          Start
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => tickSimulation(simulation.id)}
        >
          Tick Once
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => stopSimulation(simulation.id)}
        >
          Stop
        </Button>
      </CardActions>
    </Card>
  );
}
