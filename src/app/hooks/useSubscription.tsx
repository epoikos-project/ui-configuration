import { useEffect } from "react";
import { Msg } from "@nats-io/nats-core";
import { useNats } from "./useNats";

export const useSubscription = (
  subject: string,
  onMessage: (msg: Msg) => void,
) => {
  const nc = useNats();

  useEffect(() => {
    if (!nc) return;

    const subscribe = async () => {
      const sub = nc.subscribe(subject);
      try {
        for await (const m of sub) {
          onMessage(m);
        }
        console.log(`Subscription to "${subject}" closed`);
      } catch (err) {
        console.error(`Error in subscription to "${subject}":`, err);
      }
    };

    subscribe();

    return () => {
      // No direct way to unsubscribe in @nats-io/nats-core yet,
      // but we could drain the connection or filter messages manually.
    };
  }, [nc, subject]);
};
