export interface ActionLog {
  created_at: string;
  simulation_id: string;
  id: string;
  feedback: string | null;
  tick: number;
  action: string;
  agent_id: string;
}
