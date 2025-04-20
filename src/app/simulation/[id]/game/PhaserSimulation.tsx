import { useNats } from "@/app/hooks/useNats";
import { useSubscribe } from "@/app/hooks/useSubscribe";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import { SimProps } from "../app";
import { EventBus } from "./EventBus";
import StartGame from "./main";

export interface IRefPhaserGame<S = Phaser.Scene> {
  game: Phaser.Game | null;
  scene: S | null;
}

export interface IProps extends SimProps {
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserSimulation = forwardRef<IRefPhaserGame, IProps>(
  function PhaserGame({ currentActiveScene, ...props }, ref) {
    const game = useRef<Phaser.Game | null>(null!);
    const subscribe = useSubscribe();
    const nats = useNats();

    useLayoutEffect(() => {
      if (game.current === null) {
        game.current = StartGame("game-container");

        if (typeof ref === "function") {
          ref({ game: game.current, scene: null });
        } else if (ref) {
          ref.current = { game: game.current, scene: null };
        }
      }

      return () => {
        if (game.current) {
          game.current.destroy(true);
          if (game.current !== null) {
            game.current = null;
          }
        }
      };
    }, [ref]);

    useEffect(() => {
      EventBus.on("preloading-started", (scene_instance: Phaser.Scene) => {
        scene_instance.data.set("props", props);
        scene_instance.data.set("nats", nats);
        scene_instance.data.set("subscribe", subscribe);
      });

      EventBus.on("current-scene-ready", (scene_instance: Phaser.Scene) => {
        if (currentActiveScene && typeof currentActiveScene === "function") {
          currentActiveScene(scene_instance);
        }

        if (typeof ref === "function") {
          ref({ game: game.current, scene: scene_instance });
        } else if (ref) {
          ref.current = { game: game.current, scene: scene_instance };
        }
      });
      return () => {
        EventBus.removeListener("current-scene-ready");
      };
    }, [currentActiveScene, ref, nats, props, subscribe]);

    return <div id="game-container"></div>;
  },
);
