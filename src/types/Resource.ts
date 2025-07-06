export interface Resource {
  id: string;
  region_id: string;
  world_id: string;
  simulation_id: string;
  x_coord: number; // X coordinate of the resource
  y_coord: number; // Y coordinate of the resource
  available: boolean; // Resource is available for harvesting
  energy_yield: number; // Amount of energy the resource yields
  mining_time: number; // Time it takes to harvest the resource
  regrow_time: number; // Time it takes for the resource to regrow
  harvesting_area: number; // Area around the resource where agents can harvest
  required_agents: number; // Number of agents required to harvest the resource
  energy_yield_var: number; // Variance in energy yield
  regrow_var: number; // Variance in regrow time
  being_harvested: boolean; // Resource is being harvested
  start_harvest: number; // Time when harvesting started
  time_harvest: number; // Time when latest harvest was/will be finished
  harvester: string[]; // List of harvesters
}
