import { useContext } from "react";
import { NatsContext } from "../provider/NatsProvider";

export const useNats = () => {
  const context = useContext(NatsContext);
  if (!context) {
    throw new Error("useNats must be used within a NatsProvider");
  }
  return context.connection;
};
