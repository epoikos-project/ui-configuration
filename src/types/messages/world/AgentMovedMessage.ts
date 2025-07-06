import { WorldBaseMessage } from "./WorldBaseMessage";

export interface AgentMovedMessage extends WorldBaseMessage {
  new_location: [number, number];
  start_location: [number, number];
  destination: [number, number];
  num_steps: number;
  new_energy_level: number;
}
