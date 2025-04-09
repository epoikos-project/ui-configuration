"use client"

import {
  wsconnect, // Funktion zum Herstellen einer Verbindung zu einem NATS-Server
  NatsConnection, // Typ für die NATS-Verbindung
} from "@nats-io/nats-core";

import {
  useEffect, // React-Hook für Nebenwirkungen
  useState, // React-Hook für Zustandsverwaltung
} from "react";

import { EventBus } from "./game/EventBus"; // Import des Event-Busses für die Kommunikation zwischen React und Phaser

export default function NatsSubscriber() {
  const [nats, setNats] = useState<NatsConnection>(); // Zustand für die NATS-Verbindung

  useEffect(() => {
    // Effekt, der beim Laden der Komponente ausgeführt wird
    (async () => {
      try {
        // Verbindung zum NATS-Server herstellen
        const nc = await wsconnect({
          servers: ["ws://localhost:8443"], // WebSocket-Server-URL
        });

        // Abonnement für ein bestimmtes Thema erstellen
        const sub = nc.subscribe("simulation.>");
        (async () => {
          for await (const m of sub) {
            EventBus.emit("message", m); 
          }
          console.log("subscription closed");
        })();

        setNats(nc); // Verbindung im Zustand speichern
        console.log("connected to NATS");
      } catch (error) {
        console.error("Error connecting to NATS:", error);
      }
    })();

    // Cleanup-Funktion, die beim Entfernen der Komponente ausgeführt wird
    return () => {
      nats?.drain(); // Verbindung schließen
      console.log("closed NATS connection");
    };
  }, []); // Leeres Abhängigkeitsarray: Effekt wird nur einmal ausgeführt

  return (
    <>
      {nats ? (
        <h1>Connected to {nats?.getServer()}</h1> // Verbindungsstatus anzeigen
      ) : (
        <h1>Connecting to NATS...</h1> // Ladeanzeige
      )}
    </>
  );
}