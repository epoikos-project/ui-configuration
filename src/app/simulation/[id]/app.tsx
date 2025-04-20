"use client";
import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserSimulation } from "./game/PhaserSimulation";
import { Simulation } from "@/types/Simulation";
import { World } from "@/types/World";
import { Agent } from "@/types/Agent";
import { Button, FormControlLabel, Switch } from "@mui/material";

export interface SimProps {
  world: World;
  simulation: Simulation;
  agents: Agent[];
}
function App(props: SimProps) {
  //  References to the PhaserGame component (game and scene are exposed)
  const phaserRef = useRef<IRefPhaserGame | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);

  return (
    <div id="app">
      <FormControlLabel
        control={
          <Switch
            checked={debugEnabled}
            onChange={() => {
              if (!debugEnabled) {
                phaserRef.current.scene.enableDebug();
              } else {
                phaserRef.current.scene.disableDebug();
              }
              setDebugEnabled(!debugEnabled);
            }}
          />
        }
        label="Debug Mode"
      />
      <Button
        onClick={() => {
          phaserRef.current.scene.resetCamera();
        }}
      >
        Reset Camera
      </Button>
      <PhaserSimulation ref={phaserRef} {...props} />
    </div>
  );
}

export default App;
