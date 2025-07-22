import { WorldBaseMessage } from "./WorldBaseMessage";

export interface AgentDeadMessage extends WorldBaseMessage {
  location: [number, number];
  name: string;
  death_tick: number;
}
