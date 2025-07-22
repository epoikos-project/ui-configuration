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
import { Resource } from "../../../../../types/Resource";
import { ResourceHarvestedMessage } from "@/types/messages/world/ResourceHarvestedMessage";
import { ResourceGrownMessage } from "@/types/messages/world/ResourceGrownMessage";
import { ActionLog } from "@/types/ActionLog";

export class Home extends Scene {
  camera!: Phaser.Cameras.Scene2D.Camera;
  background!: Phaser.GameObjects.Image;
  gameText!: Phaser.GameObjects.Text;

  tilemap!: Phaser.Tilemaps.Tilemap;

  simulation!: Simulation;
  world!: World;
  agents!: Agent[];
  resources!: Resource[];
  subscribe!: SubscribeFunction<Home>;

  agentContainers: { id: string; container: Phaser.GameObjects.Container }[] =
    [];

  private gridEngine!: GridEngine;
  playerSprite!: Phaser.GameObjects.Sprite;

  debugGraphics!: Phaser.GameObjects.Graphics;

  cameraIsFollowingSprite = false;

  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

  selectedAgentId = "";

  agentMessageDots: Record<string, Phaser.GameObjects.Text> = {};

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

  updateTileIndex(x: number, y: number, index: number) {
    const tile = this.tilemap.getTileAt(x, y);
    if (tile) {
      const newTile = new Phaser.Tilemaps.Tile(
        this.tilemap.layer,
        index,
        tile.x,
        tile.y,
        tile.width,
        tile.height,
        tile.baseWidth,
        tile.baseHeight
      );
      this.tilemap.putTileAt(newTile, tile.x, tile.y);
    }
  }

  resourceHarvestedHandler(message: Msg) {
    const parsed = message.json<ResourceHarvestedMessage>();
    this.updateTileIndex(parsed.location[0], parsed.location[1], 9);
    // show green "finished" dots for the harvesting agent
    this.showMessageDots(parsed.harvester_id, "finished", "#00ff00");
  }

  resourceGrownHandler(message: Msg) {
    const parsed = message.json<ResourceGrownMessage>();
    this.updateTileIndex(parsed.location[0], parsed.location[1], 8);
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
      x: agent.new_location[0],
      y: agent.new_location[1],
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
      collides: false,
    });
    return agentSprite;
  }

  resetCamera() {
    this.resetAgentSelection();
    this.cameras.main.setZoom(1);
    console.log(this.game.config.width, this.game.config.height);
    this.cameras.main.centerOn(
      0.5 * (this.game.context.canvas.width as number),
      0.5 * (this.game.context.canvas.height as number)
    );
  }

  resetAgentSelection() {
    this.selectedAgentId = "";
    this.cameraIsFollowingSprite = false;
    this.cameras.main.stopFollow();
    this.agentContainers.forEach((agent) => {
      (agent.container.getAt(1) as Phaser.GameObjects.Text).setVisible(false);
    });
  }

  /**
   * Show animated dots above the agent when a message is received/sent.
   */
  /**
   * Show animated label+dots above the agent (e.g. speaking, harvesting, waiting, finished).
   * @param agentId id of the agent
   * @param label   text label to prefix the dots (no label = dots only)
   * @param color   hex color code for the text
   */
  showMessageDots(agentId: string, label = "", color = "#ffffff") {
    if (this.agentMessageDots[agentId]) {
      return;
    }
    const found = this.agentContainers.find((a) => a.id === agentId);
    if (!found) {
      return;
    }
    // initial text with first frame
    const initial = label ? `${label}.` : ".";
    const dotsText = this.add
      .text(0, -24, initial, { fontSize: "18px", color })
      .setOrigin(0.5, 0.5);
    found.container.add(dotsText);
    this.agentMessageDots[agentId] = dotsText;
    let frame = 0;
    const frames = label ? [
      `${label}.`,
      `${label}..`,
      `${label}...`,
    ] : [".", "..", "..."];
    const interval = this.time.addEvent({
      delay: 400,
      repeat: 4,
      callback: () => {
        dotsText.setText(frames[frame % frames.length]);
        frame++;
      },
    });
    this.time.delayedCall(2000, () => {
      found.container.remove(dotsText, true);
      delete this.agentMessageDots[agentId];
      interval.remove(false);
    });
  }

  createSprite(
    agent: Pick<Agent, "id" | "name">
  ): [Phaser.GameObjects.Sprite, Phaser.GameObjects.Container] {
    const agentSprite = this.add.sprite(0, 0, "fluffy");
    agentSprite.setTint(Phaser.Display.Color.RandomRGB().color);
    agentSprite.setInteractive();
    agentSprite.name = agent.name;
    const text: Phaser.GameObjects.Text = this.add
      .text(
        agentSprite.width * 0.5,
        agentSprite.height * 0.5 - 15,
        agentSprite.name
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
      this.resetAgentSelection();

      this.cameras.main.startFollow(container, true);
      this.cameraIsFollowingSprite = true;
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
    const { world, agents, simulation, resources } = data.props;
    this.world = world;
    this.simulation = simulation;
    this.agents = agents;
    this.subscribe = data.subscribe;
    this.resources = resources;
  }

  create() {
    const tiles = [7, 7, 7, 6, 6, 6, 0, 0, 0, 1, 1, 2, 3, 4, 5];
    const mapData = [];

    for (let y = 0; y < this.world.size_y; y++) {
      const row = [];

      for (let x = 0; x < this.world.size_x; x++) {
        //  Scatter the tiles so we get more mud and less stones
        let tileIndex = 0;
        const resource = this.resources.find(
          (value) => value.x_coord === x && value.y_coord === y
        );
        if (resource != null) {
          if (resource.available) {
            tileIndex = 8;
          } else {
            tileIndex = 9;
          }
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
      8
    );
    const resourceHarvestedTileset = this.tilemap.addTilesetImage(
      "resource-harvested",
      "resource-harvested",
      16,
      16,
      0,
      0,
      9
    );

    assert(tileset);
    assert(wallTileset);
    assert(resourceHarvestedTileset);

    this.tilemap.createLayer(
      0,
      [tileset, wallTileset, resourceHarvestedTileset],
      0,
      0
    );

    this.tilemap.layer.data.forEach((row) =>
      row.forEach((tile) => {
        if (tile.index === 8 || tile.index === 9) {
          console.log(tile.index);
          // tile.properties = { ge_collide: true };
          // tile.setCollision(true);
        }
      })
    );

    this.playerSprite = this.add.sprite(0, 0, "fluffy");
    const mapWidth = this.tilemap.widthInPixels;
    const mapHeight = this.tilemap.heightInPixels;
    this.cameras.main.centerOn(mapWidth / 2, mapHeight / 2);
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
          collides: false,
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
        deltaY: number
      ) => {
        const cam = this.cameras.main;

        // Adjust zoom factor based on wheel direction
        const zoomSpeed = 0.01;
        cam.zoom -= deltaY * zoomSpeed;

        cam.zoom = Phaser.Math.Clamp(cam.zoom, 0.5, 3);
      }
    );

    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.placed`,
      this.agentCreateHandler,
      this
    );
    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.moved`,
      this.agentMoveHandler,
      this
    );
    this.subscribe(
      `simulation.${this.simulation.id}.resource.*.harvested`,
      this.resourceHarvestedHandler,
      this
    );
    this.subscribe(
      `simulation.${this.simulation.id}.resource.*.grown`,
      this.resourceGrownHandler,
      this
    );
    // subscribe to all communication channels to trigger message dots
    // communication -> speaking indicator
    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.communication`,
      (msg: Msg) => {
        const parts = msg.subject.split(".");
        const agentId = parts[3];
        this.showMessageDots(agentId, "speaking");
      },
      this
    );
    // actions -> harvesting or waiting indicator
    this.subscribe(
      `simulation.${this.simulation.id}.agent.*.action`,
      (msg: Msg) => {
        let payload: ActionLog;
        try {
          payload = msg.json();
        } catch {
          return;
        }
        const action = payload.action.toLowerCase();
        if (action.startsWith("harvest")) {
          this.showMessageDots(payload.agent_id, "harvesting");
        } else if (action.includes("waiting")) {
          this.showMessageDots(payload.agent_id, "waiting");
        }
      },
      this
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
