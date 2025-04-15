import GridEngine, { Direction } from "grid-engine";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class Home extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;

  world_config: {
    world_data: {
      size_x: number;
      size_y: number;
    };
  };

  private gridEngine!: GridEngine;
  playerSprite: Phaser.GameObjects.Sprite;

  constructor() {
    super("Home");
  }

  messageHandler(message: any) {
    console.log("Message from NATS:", message.json().content);
    this.gridEngine.moveRandomly("fluffy");
    setTimeout(() => {
      this.gridEngine.stopMovement("fluffy");
    }, 2000);
  }

  init(data) {
    this.world_config = data.world_config;
    console.log(this.world_config.world_data.size_y);
  }

  create() {
    console.log(this.data);
    const tiles = [7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5, 8];
    const mapData = [];

    for (let y = 0; y < this.world_config.world_data.size_y; y++) {
      const row = [];

      for (let x = 0; x < this.world_config.world_data.size_x; x++) {
        //  Scatter the tiles so we get more mud and less stones
        const tileIndex = Phaser.Math.RND.weightedPick(tiles);

        row.push(tileIndex);
      }

      mapData.push(row);
    }

    console.log(mapData);

    const tilemap = this.make.tilemap({
      data: mapData,
      tileWidth: 16,
      tileHeight: 16,
    });
    const tileset = tilemap.addTilesetImage("tiles");
    const wallTileset = tilemap.addTilesetImage(
      "wall",
      "wall",
      16,
      32,
      0,
      0,
      8
    );

    wallTileset.tileProperties = [
      {
        name: "ge_collide",
        type: "bool",
        value: true,
      },
    ];

    console.log(wallTileset?.tileProperties);

    tilemap.setCollisionByProperty({ ge_collide: true });

    const layer = tilemap.createLayer(0, [tileset, wallTileset], 0, 0);
    layer.setCollision(8, true);
    this.playerSprite = this.add.sprite(0, 0, "fluffy");
    this.cameras.main.centerOn(
      0.5 * this.game.config.width,
      0.5 * this.game.config.height
    );
    const gridEngineConfig = {
      characters: [
        {
          id: "fluffy",
          sprite: this.playerSprite,
          walkingAnimationMapping: 0,
          startPosition: { x: 15, y: 15 },
        },
      ],
    };
    this.gridEngine.create(tilemap, gridEngineConfig);
    console.log(this.gridEngine.getCollisionGroups("fluffy"));
    console.log(this.gridEngine.collidesWithTiles("fluffy"));

    EventBus.emit("current-scene-ready", this);

    this.gridEngine.steppedOn("fluffy").subscribe(() => {
      console.log("stepped on", charId);
      this.gridEngine.stopMovement(charId);
    });
    this.input.on("pointerdown", (pointer) => {
      console.log("pointer" + pointer.worldX / tilemap.tileWidth);
      const pointerTileX = pointer.worldX / tilemap.tileWidth;
      const pointerTileY = pointer.worldY / tilemap.tileHeight;
      const fluffyPosition = this.gridEngine.getPosition("fluffy");

      if (
        Math.floor(pointerTileX) === fluffyPosition.x &&
        Math.floor(pointerTileY) === fluffyPosition.y
      ) {
        this.cameras.main.startFollow(this.playerSprite, true);
      } else {
        this.cameras.main.stopFollow();
      }
    });

    EventBus.on("worldMessage", this.messageHandler, this);
  }

  update() {
    const cursors = this.input.keyboard?.createCursorKeys()!;
    if (cursors.left.isDown) {
      this.gridEngine.move("fluffy", Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.gridEngine.move("fluffy", Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.gridEngine.move("fluffy", Direction.UP);
    } else if (cursors.down.isDown) {
      this.gridEngine.move("fluffy", Direction.DOWN);
    }
  }
  changeScene() {
    this.scene.start("GameOver");
  }
}
