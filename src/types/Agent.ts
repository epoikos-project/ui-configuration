export interface Agent {
  id: string;
  collection_name: string;
  simulation_id: string;
  name: string;
  model: string;
  hunger: number;
  x_coord: number;
  y_coord: number;
  visibility_range: number;
  range_per_move: number;
}
