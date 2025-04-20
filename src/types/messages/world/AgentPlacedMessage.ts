import { WorldBaseMessage } from "./WorldBaseMessage";

export interface AgentPlacedMessage extends WorldBaseMessage {
  location: [number, number];
  name: string;
}
