"use client";
import { useRef } from "react";
import { IRefPhaserGame, PhaserSimulation } from "./game/PhaserSimulation";

interface IProps {
  world_config: {
    world_data: {
      size_x: number;
      size_y: number;
    };
  };
}
function App({ world_config }: IProps) {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  return (
    <div id="app">
      <PhaserSimulation ref={phaserRef} world_config={world_config} />
    </div>
  );
}

export default App;
