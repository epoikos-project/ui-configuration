import { Msg, Subscription } from "@nats-io/nats-core";
import { useNats } from "./useNats";
import { useRef, useEffect } from "react";

type MsgHandler = (this: any, msg: Msg) => void | Promise<void>;

export function useSubscribe() {
  const nc = useNats();
  const subscriptions = useRef<Subscription[]>([]);

  useEffect(() => {
    return () => {
      // Unsubscribe on cleanup
      subscriptions.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch (err) {
          console.error("Error unsubscribing:", err);
        }
      });
    };
  }, []);

  const subscribe = async (
    subject: string,
    handler: MsgHandler,
    thisArg?: any,
  ): Promise<() => void> => {
    if (!nc) {
      console.warn("NATS connection not ready.");
      return () => {};
    }

    const sub = nc.subscribe(subject);
    subscriptions.current.push(sub);

    (async () => {
      for await (const msg of sub) {
        try {
          // Bind `thisArg` if provided
          if (thisArg) {
            await handler.call(thisArg, msg);
          } else {
            await handler(msg);
          }
        } catch (err) {
          console.error(`Error handling message on '${subject}':`, err);
        }
      }
    })();

    return () => {
      try {
        sub.unsubscribe();
      } catch (err) {
        console.error("Manual unsubscribe failed:", err);
      }
    };
  };

  return subscribe;
}

export type SubscribeFunction = (
  subject: string,
  handler: MsgHandler,
  thisArg?: any,
) => Promise<() => void>;
