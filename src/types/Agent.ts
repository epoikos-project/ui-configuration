import { ActionLog } from "./ActionLog";
import { Message } from "./Message";

export interface Agent {
  id: string;
  collection_name: string;
  simulation_id: string;
  name: string;
  model: string;
  hunger: number;
  energy_level: number;
  x_coord: number;
  y_coord: number;
  visibility_range: number;
  range_per_move: number;
  last_10_action_logs: ActionLog[];
  last_10_messages: Message[];
}
