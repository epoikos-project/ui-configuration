import { Msg, Subscription } from "@nats-io/nats-core";
import { useNats } from "./useNats";
import { useRef, useEffect } from "react";

type MsgHandler<T> = (this: T, msg: Msg) => unknown | Promise<unknown>;

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

  async function subscribe<T>(
    subject: string,
    handler: MsgHandler<T>,
    thisArg?: T,
  ): Promise<() => unknown> {
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
  }

  return subscribe;
}

export type SubscribeFunction<T> = (
  subject: string,
  handler: MsgHandler<T>,
  thisArg?: T,
) => Promise<() => unknown>;
