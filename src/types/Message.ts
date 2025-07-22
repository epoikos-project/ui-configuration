export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  created_at: string;
  agent_id: string;
  serial_number: number;
  tick: number;
  to_agent_id: string;
}
