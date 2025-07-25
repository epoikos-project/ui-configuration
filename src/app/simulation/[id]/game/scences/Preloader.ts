import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    //  A simple progress bar. This is the outline of the bar.
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

    //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
    this.load.on("progress", (progress: number) => {
      //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
      bar.width = 4 + 460 * progress;
    });

    EventBus.emit("preloading-started", this);
  }

  preload() {
    this.load.spritesheet("fluffy", "../fluffy.png", {
      frameWidth: 16,
      frameHeight: 20,
    });
    this.load.image("tiles", "../muddy-ground.png");
    this.load.image("resource", "../resource.png");
    this.load.image("resource-harvested", "../resource-harvested.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.

    this.scene.start("Home", {
      props: this.data.get("props"),
      nats: this.data.get("nats"),
      subscribe: this.data.get("subscribe"),
    });
  }
}
