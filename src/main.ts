import { Board } from "./board";
import { Map } from "./map";
import { Player } from "./player";
import { Interest } from "./interest";
import { randomInt } from "./utils";
import { Area } from "./area";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const BOARD_SIZE = 500;
const INTEREST_COUNT = 5;
const MAX_SPEED = 5;

const map: Map = new Map(0, 0, BOARD_SIZE, BOARD_SIZE, "#2B2118", ctx);
const player: Player = new Player({ x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 }, "#F7F3E3", ctx);
const players = [player];
const interests: Interest[] = [];
const treeArea = Area.randomArea(0, 250, 0, 250, 50, 125, ctx);
for (let i = 0; i < INTEREST_COUNT; i++) {
  interests.push(
    new Interest(
      { x: randomInt(0, BOARD_SIZE), y: randomInt(0, BOARD_SIZE) },
      "#A8763E",
      randomInt(0, 4),
      ctx,
      treeArea
    )
  );
}
map.players = players;
map.interests = interests;

function tick() {
  map.tick();
  map.players.forEach((player) => player.tick(map));
  map.interests.forEach((interest) => interest.tick());
}

setInterval(tick, 42);
