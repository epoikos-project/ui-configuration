import { Agent } from "@/types/Agent";
import { Simulation } from "@/types/Simulation";
import { World } from "@/types/World";
import GridEngine, {
  CollisionStrategy,
  Direction,
  GridEngineConfig,
} from "grid-engine";
import { Scene } from "phaser";

import { SubscribeFunction } from "@/app/hooks/useSubscribe";
import { AgentMovedMessage } from "@/types/messages/world/AgentMovedMessage";
import { AgentPlacedMessage } from "@/types/messages/world/AgentPlacedMessage";
import { Msg } from "@nats-io/nats-core";
import assert from "assert";
import { SimProps } from "../../app";
import { EventBus } from "../EventBus";

export class Home extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.Image;
  gameText!: Phaser.GameObjects.Text;

  tilemap!: Phaser.Tilemaps.Tilemap;

  simulation!: Simulation;
  world!: World;
  agents!: Agent[];
  subscribe!: SubscribeFunction<Home>;

  agentContainers: { id: string; container: Phaser.GameObjects.Container }[] =
    [];

  private gridEngine!: GridEngine;
  playerSprite!: Phaser.GameObjects.Sprite;

  debugGraphics!: Phaser.GameObjects.Graphics;

  cameraIsFollowingSprite = false;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  selectedAgentId = "";

  constructor() {
    super("Home");
  }

  enableDebug() {
    this.debugGraphics = this.add.graphics();
    this.tilemap.renderDebug(this.debugGraphics);
  }

  disableDebug() {
    this.debugGraphics.destroy();
  }

  agentCreateHandler(message: Msg) {
    const agent = message.json<AgentPlacedMessage>();
    console.log("Agent created:", agent.id);
    // @TODO this.agents.push({id: agent.id, name: agent.name, })
    this.createAgent({
      id: agent.id,
      name: agent.name,
      x_coord: agent.location[0],
      y_coord: agent.location[1],
    });
  }

  agentMoveHandler(message: Msg) {
    const agent = message.json<AgentMovedMessage>();
    console.log("Agent moved:", agent.id);
    this.gridEngine.moveTo(agent.id, {
      x: agent.location[0],
      y: agent.location[1],
    });
  }

  createAgent(agent: Pick<Agent, "id" | "name" | "x_coord" | "y_coord">) {
    const agentSprite = this.createSprite(agent);
    this.agentContainers.push({ id: agent.id, container: agentSprite[1] });
    this.gridEngine.addCharacter({
      id: agent.id,
      sprite: agentSprite[0],
      container: agentSprite[1],
      walkingAnimationMapping: 0,
      startPosition: { x: agent.x_coord, y: agent.y_coord },
      collides: true,
    });
    return agentSprite;
  }

  resetCamera() {
    this.cameraIsFollowingSprite = false;
    this.resetAgentSelection();
    this.cameras.main.stopFollow();
    this.cameras.main.setZoom(1);
    this.cameras.main.centerOn(
      0.5 * (this.game.config.width as number),
      0.5 * (this.game.config.height as number),
    );
  }

  resetAgentSelection() {
    this.selectedAgentId = "";
    this.agentContainers.forEach((agent) => {
      (agent.container.getAt(1) as Phaser.GameObjects.Text).setVisible(false);
    });
  }

  createSprite(
    agent: Pick<Agent, "id" | "name">,
  ): [Phaser.GameObjects.Sprite, Phaser.GameObjects.Container] {
    const agentSprite = this.add.sprite(0, 0, "fluffy");
    agentSprite.setTint(Phaser.Display.Color.RandomRGB().color);
    agentSprite.setInteractive();
    agentSprite.name = agent.name;
    const text: Phaser.GameObjects.Text = this.add
      .text(
        agentSprite.width * 0.5,
        agentSprite.height * 0.5 - 15,
        agentSprite.name,
      )
      .setOrigin(0.5, 0.5);
    text.setVisible(false);
    const container = this.add.container(0, 0, [agentSprite, text]);
    agentSprite.on("pointermove", () => {
      if (!text.visible) {
        text.setVisible(true);
      }
    });

    agentSprite.on("pointerout", () => {
      if (text.visible && this.selectedAgentId !== agent.id) {
        text.setVisible(false);
      }
    });

    agentSprite.on("pointerdown", () => {
      this.cameras.main.startFollow(container, true);
      this.cameraIsFollowingSprite = true;

      this.resetAgentSelection();
      this.selectedAgentId = agent.id;
      text.setVisible(true);

      EventBus.emit("agent-selected", { id: agent.id, name: agent.name });
    });
    return [agentSprite, container];
  }

  worldToGridPosition(x: number, y: number) {
    return {
      x: Math.floor(x / this.tilemap.tileWidth),
      y: Math.floor(y / this.tilemap.tileHeight),
    };
  }

  init(data: { props: SimProps; subscribe: SubscribeFunction<Home> }) {
    const { world, agents, simulation } = data.props;
    this.world = world;
    this.simulation = simulation;
    this.agents = agents;
    this.subscribe = data.subscribe;
  }

  create() {
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
          // Debug log removed to avoid unintended console output in production.
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
      "resource",
      "resource",
      16,
      16,
      0,
      0,
      8,
    );

    assert(tileset);
    assert(wallTileset);

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
      0.5 * (this.game.config.width as number),
      0.5 * (this.game.config.height as number),
    );
    const gridEngineConfig: GridEngineConfig = {
      characters: this.agents.map((agent) => {
        const sprite = this.createSprite(agent);
        this.agentContainers.push({ id: agent.id, container: sprite[1] });
        return {
          id: agent.id,
          sprite: sprite[0],
          container: sprite[1],
          startPosition: { x: agent.x_coord, y: agent.y_coord },
          walkingAnimationMapping: 0,
          collides: true,
        };
      }),
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

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys()!;
    }

    this.input.on("pointermove", function (p) {
      if (!p.isDown) return;

      this.cameras.main.scrollX -=
        (p.x - p.prevPosition.x) / this.cameras.main.zoom;
      this.cameras.main.scrollY -=
        (p.y - p.prevPosition.y) / this.cameras.main.zoom;
    });

    this.input.on(
      "wheel",
      (
        _pointer: any,
        _gameObjects: Array<any>,
        _deltaX: number,
        deltaY: number,
      ) => {
        const cam = this.cameras.main;

        // Adjust zoom factor based on wheel direction
        const zoomSpeed = 0.01;
        cam.zoom -= deltaY * zoomSpeed;

        cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.5, 3);
      },
    );

    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.placed`,
      this.agentCreateHandler,
      this,
    );
    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.moved`,
      this.agentMoveHandler,
      this,
    );

    EventBus.emit("current-scene-ready", this);
  }

  update() {
    if (this.cursors) {
      if (this.cursors.left.isDown) {
        this.gridEngine.move("fluffy", Direction.LEFT);
      } else if (this.cursors.right.isDown) {
        this.gridEngine.move("fluffy", Direction.RIGHT);
      } else if (this.cursors.up.isDown) {
        this.gridEngine.move("fluffy", Direction.UP);
      } else if (this.cursors.down.isDown) {
        this.gridEngine.move("fluffy", Direction.DOWN);
      }
    }
  }
  changeScene() {
    this.scene.start("GameOver");
  }
}
