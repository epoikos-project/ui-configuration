"use client";

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid
} from '@mui/material';

type WorldConfigProps = {
  worldWidth: number;
  setWorldWidth: (width: number) => void;
  worldHeight: number;
  setWorldHeight: (height: number) => void;
  numRegions: number;
  setNumRegions: (regions: number) => void;
  totalResources: number;
  setTotalResources: (resources: number) => void;
};

const WorldConfig: React.FC<WorldConfigProps> = ({
  worldWidth,
  setWorldWidth,
  worldHeight,
  setWorldHeight,
  numRegions,
  setNumRegions,
  totalResources,
  setTotalResources
}) => {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h5" align="center" gutterBottom>
        World Configuration
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="World Width"
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            value={worldWidth}
            onChange={(e) => setWorldWidth(parseInt(e.target.value) || 25)}
            margin="normal"
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="World Height"
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            value={worldHeight}
            onChange={(e) => setWorldHeight(parseInt(e.target.value) || 25)}
            margin="normal"
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Number of Regions"
            type="number"
            InputProps={{ inputProps: { min: 1 } }}
            value={numRegions}
            onChange={(e) => setNumRegions(parseInt(e.target.value) || 4)}
            margin="normal"
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Total Resources"
            type="number"
            InputProps={{ inputProps: { min: 0 } }}
            value={totalResources}
            onChange={(e) => setTotalResources(parseInt(e.target.value) || 25)}
            margin="normal"
            required
          />
        </Grid>
      </Grid>
      
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary">
          Configure the world dimensions, number of regions, and available resources for your simulation.
          These settings will be saved as part of your configuration.
        </Typography>
      </Box>
      
      <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant="body2" color="primary">
          World size: {worldWidth}x{worldHeight}, {numRegions} regions, {totalResources} total resources
        </Typography>
      </Box>
    </Paper>
  );
};

export default WorldConfig;