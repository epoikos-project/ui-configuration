"use client";

import { NatsConnection, wsconnect } from "@nats-io/nats-core";
import React, { createContext, useEffect, useState } from "react";

interface NatsContextType {
  connection: NatsConnection | null;
}

export const NatsContext = createContext<NatsContextType>({ connection: null });

const NatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [connection, setConnection] = useState<NatsConnection | null>(null);

  useEffect(() => {
    let isMounted = true;

    const connectToNats = async () => {
      try {
        const nc = await wsconnect({ servers: ["ws://localhost:8443"] });
        if (isMounted) {
          setConnection(nc);
          console.log("Connected to NATS:", nc.getServer());
        }
      } catch (err) {
        console.error("Failed to connect to NATS", err);
      }
    };

    connectToNats();

    return () => {
      isMounted = false;
      connection?.drain();
      console.log("Disconnected from NATS");
    };
  }, []);

  return (
    <NatsContext.Provider value={{ connection }}>
      {children}
    </NatsContext.Provider>
  );
};

export default NatsProvider;
