import { AUTO, Game } from "phaser";
import { Home } from "./scences/Home";
import GridEngine from "grid-engine";
import { Boot } from "./scences/Boot";
import { Preloader } from "./scences/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: "100%",
  height: 512,
  parent: "game-container",
  backgroundColor: "#103014",
  scene: [Boot, Preloader, Home],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  plugins: {
    scene: [
      {
        key: "gridEngine",
        plugin: GridEngine,
        mapping: "gridEngine",
      },
    ],
  },
  pixelArt: true,
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
