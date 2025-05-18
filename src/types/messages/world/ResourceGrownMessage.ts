import { WorldBaseMessage } from "./WorldBaseMessage";

export interface ResourceGrownMessage extends WorldBaseMessage {
  location: [number, number];
}
