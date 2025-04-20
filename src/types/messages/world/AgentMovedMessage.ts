import { WorldBaseMessage } from "./WorldBaseMessage";

export interface AgentMovedMessage extends WorldBaseMessage {
  location: [number, number];
}
