import { WorldBaseMessage } from "./WorldBaseMessage";

export interface ResourceHarvestedMessage extends WorldBaseMessage {
  harvester_id: string;
  location: [number, number];
  start_tick: number;
  end_tick: number;
}
