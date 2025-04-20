export interface World {
  id: string;
  simulation_id: string;
  size_x: number;
  size_y: number;
  base_energy_cost: number;
  resource_coords: number[][];
}
