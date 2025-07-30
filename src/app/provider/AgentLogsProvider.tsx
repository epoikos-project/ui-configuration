"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useAgents } from "../hooks/useAgents";
import { useSubscription } from "../hooks/useSubscription";
import { Message } from "@/types/Message";
import { ActionLog } from "@/types/ActionLog";

interface AgentLogsEntry {
  messages: Message[];
  actions: ActionLog[];
}

export type AgentLogs = Record<string, AgentLogsEntry>;

interface AgentLogsContextType {
  logs: AgentLogs;
}

const AgentLogsContext = createContext<AgentLogsContextType>({ logs: {} });

/**
 * Subscribes to all agents' communication and action topics on load,
 * accumulating logs per agent. Provides logs via context.
 */
export const AgentLogsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { simulation } = useSimulation();
  const { agents } = useAgents();
  const [logs, setLogs] = useState<AgentLogs>({});

  // Initialize with last known logs from initial agent data
  useEffect(() => {
    const initial: AgentLogs = {};
    agents.forEach((a) => {
      initial[a.id] = {
        messages: a.last_10_messages ?? [],
        actions: a.last_10_action_logs ?? [],
      };
    });
    setLogs(initial);
  }, []);

  // subscribe to all agents' action logs
  useSubscription(`simulation.${simulation.id}.agent.*.action`, (msg) => {
    let payload: ActionLog;
    try {
      payload = msg.json();
    } catch {
      return;
    }
    setLogs((prev) => {
      const entry = prev[payload.agent_id] || { messages: [], actions: [] };
      return {
        ...prev,
        [payload.agent_id]: {
          ...entry,
          actions: [payload, ...entry.actions],
        },
      };
    });
  });

  // subscribe to all agents' communication logs (both sent and received)
  useSubscription(
    `simulation.${simulation.id}.agent.*.communication`,
    (msg) => {
      let payload: Message;
      try {
        payload = msg.json();
      } catch {
        return;
      }
      // Determine which agent channel this message was received on
      const parts = msg.subject.split(".");
      const channelAgentId = parts[3];
      setLogs((prev) => {
        const entry = prev[channelAgentId] || { messages: [], actions: [] };
        // Avoid duplicate entries by message id
        if (entry.messages.some((m) => m.id === payload.id)) {
          return prev;
        }
        return {
          ...prev,
          [channelAgentId]: {
            ...entry,
            messages: [payload, ...entry.messages],
          },
        };
      });
    }
  );

  return (
    <AgentLogsContext.Provider value={{ logs }}>
      {children}
    </AgentLogsContext.Provider>
  );
};

/**
 * Hook to read accumulated logs for a given agent.
 */
export function useAgentLogs(agentId: string): AgentLogsEntry {
  const { logs } = useContext(AgentLogsContext);
  return logs[agentId] || { messages: [], actions: [] };
}
