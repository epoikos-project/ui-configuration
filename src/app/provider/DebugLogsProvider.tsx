"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSimulation } from "../hooks/useSimulation";
import { useSubscribe } from "../hooks/useSubscribe";

/**
 * A single debug log entry from NATS.
 */
interface DebugLogEntry {
  timestamp: number;
  subject: string;
  payload: string;
}

/**
 * Context storing all debug messages seen this session for the current simulation.
 */
const DebugLogsContext = createContext<DebugLogEntry[]>([]);

/**
 * Subscribes once on mount to all NATS messages for the simulation and
 * accumulates them in-session. Does NOT clear on hide/show.
 */
export const DebugLogsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { simulation } = useSimulation();
  const [logs, setLogs] = useState<DebugLogEntry[]>([]);

  const subscribe = useSubscribe();
  useEffect(() => {
    let unsub = () => {};
    // Subscribe to all subjects under this simulation
    subscribe(`simulation.${simulation.id}.>`, (msg) => {
      let payloadStr: string;
      try {
        payloadStr = JSON.stringify(msg.json(), null, 2);
      } catch {
        payloadStr = msg.string();
      }
      setLogs((prev) => [
        { timestamp: Date.now(), subject: msg.subject, payload: payloadStr },
        ...prev,
      ]);
    })
      .then((u) => {
        unsub = u as () => void;
      })
      .catch((err) => console.error("Debug logs subscribe failed:", err));

    return () => unsub();
  }, [simulation.id, subscribe]);

  return (
    <DebugLogsContext.Provider value={logs}>
      {children}
    </DebugLogsContext.Provider>
  );
};

/**
 * Hook to retrieve accumulated debug logs.
 */
export function useDebugLogs(): DebugLogEntry[] {
  return useContext(DebugLogsContext);
}