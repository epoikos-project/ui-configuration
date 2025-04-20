import GridEngine, {
  CollisionStrategy,
  Direction,
  GridEngineConfig,
} from "grid-engine";
import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { MsgHandler, SubscribeFunction } from "../../../../hooks/useSubscibe";
import { World } from "@/types/World";
import { Data } from "../Data";
import { Agent } from "@/types/Agent";
import { SimProps } from "../../app";

export class Home extends Scene {
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  gameText: Phaser.GameObjects.Text;

  tilemap: Phaser.Tilemaps.Tilemap;

  world: World;
  agents: { agent: Agent; sprite: Phaser.GameObjects.Sprite }[];
  subscribe: SubscribeFunction;

  private gridEngine!: GridEngine;
  playerSprite: Phaser.GameObjects.Sprite;

  debugGraphics: Phaser.GameObjects.Graphics;

  cameraIsFollowingSprite = false;

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

  enableDebug() {
    this.debugGraphics = this.add.graphics();
    this.tilemap.renderDebug(this.debugGraphics);
  }

  disableDebug() {
    this.debugGraphics.destroy();
  }

  agentCreateHandler(message: any) {
    const agent = message.json();
    console.log("Agent created:", agent.id);
    this.createCharacter(
      agent.id,
      agent.name,
      agent.location[0],
      agent.location[1],
    );
  }

  agentMoveHandler(message: any) {
    const agent = message.json();
    console.log("Agent moved:", agent.id);
    this.gridEngine.moveTo(agent.id, {
      x: agent.location[0],
      y: agent.location[1],
    });
  }

  createCharacter(id: string, name: string, x: number, y: number) {
    const agentSprite = this.createSprite(name);
    this.gridEngine.addCharacter({
      id: id,
      sprite: agentSprite,
      walkingAnimationMapping: 0,
      startPosition: { x: x, y: y },
      collides: true,
    });
    return agentSprite;
  }

  resetCamera() {
    this.cameraIsFollowingSprite = false;
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(
      0.5 * this.game.config.width,
      0.5 * this.game.config.height,
    );
  }

  createSprite(name: string) {
    const agentSprite = this.add.sprite(0, 0, "fluffy");
    agentSprite.setInteractive();
    agentSprite.name = name;
    agentSprite.on("pointermove", () => {
      const text = this.add.text(
        agentSprite.x - 15,
        agentSprite.y - 15,
        agentSprite.name,
      );
      agentSprite.on("pointerout", () => {
        text.destroy();
      });
    });

    agentSprite.on("pointerdown", () => {
      this.cameras.main.startFollow(agentSprite, true);
      this.cameraIsFollowingSprite = true;
    });
    return agentSprite;
  }

  worldToGridPoistion(x: number, y: number) {
    return {
      x: Math.floor(x / this.tilemap.tileWidth),
      y: Math.floor(y / this.tilemap.tileHeight),
    };
  }

  init(data: { props: SimProps; subscribe: SubscribeFunction }) {
    const { world, agents } = data.props;
    this.world = world;
    this.agents = agents.map((agent) => ({
      agent,
      sprite: this.createSprite(agent.name),
    }));
    this.subscribe = data.subscribe;
  }

  create() {
    console.log(this.world);
    const tiles = [7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5];
    const mapData = [];

    for (let y = 0; y < this.world.size_y; y++) {
      const row = [];

      for (let x = 0; x < this.world.size_x; x++) {
        //  Scatter the tiles so we get more mud and less stones
        let tileIndex = 0;
        if (
          this.world.resource_coords.findIndex(
            (value) => value[0] === x && value[1] === y,
          ) !== -1
        ) {
          console.log(x, y);
          tileIndex = 8;
        } else {
          tileIndex = Phaser.Math.RND.weightedPick(tiles);
        }

        row.push(tileIndex);
      }

      mapData.push(row);
    }

    this.tilemap = this.make.tilemap({
      data: mapData,
      tileWidth: 16,
      tileHeight: 16,
    });

    const tileset = this.tilemap.addTilesetImage("tiles");
    const wallTileset = this.tilemap.addTilesetImage(
      "wall",
      "wall",
      16,
      32,
      0,
      0,
      8,
    );

    this.tilemap.createLayer(0, [tileset, wallTileset], 0, 0);

    this.tilemap.layer.data.forEach((row) =>
      row.forEach((tile) => {
        if (tile.index === 8) {
          tile.properties = { ge_collide: true };
          tile.setCollision(true);
        }
      }),
    );

    this.playerSprite = this.add.sprite(0, 0, "fluffy");
    this.cameras.main.centerOn(
      0.5 * this.game.config.width,
      0.5 * this.game.config.height,
    );
    const gridEngineConfig: GridEngineConfig = {
      characters: this.agents.map((a) => ({
        id: a.agent.id,
        sprite: a.sprite,
        startPosition: { x: a.agent.x_coord, y: a.agent.y_coord },
        walkingAnimationMapping: 0,
        collides: true,
      })),
      characterCollisionStrategy: CollisionStrategy.BLOCK_ONE_TILE_AHEAD,
      layerOverlay: true,
    };
    this.gridEngine.create(this.tilemap, gridEngineConfig);
    this.gridEngine.addCharacter({
      id: "fluffy",
      sprite: this.playerSprite,
      walkingAnimationMapping: 0,
      startPosition: { x: 15, y: 15 },
      collides: {
        collidesWithTiles: true,
        ignoreMissingTiles: false,
      },
    });

    this.gridEngine
      .steppedOn(["fluffy"], [{ x: 15, y: 15 }])
      .subscribe((char) => {
        console.log("stepped on", char.charId);
        this.gridEngine.stopMovement(char.charId);
      });

    this.subscribe("simulation.>", this.messageHandler, this);
    this.subscribe(
      "simulation.*.agent.*.placed",
      this.agentCreateHandler,
      this,
    );
    this.subscribe("simulation.*.agent.*.moved", this.agentMoveHandler, this);

    EventBus.emit("current-scene-ready", this);
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
