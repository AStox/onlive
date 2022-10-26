import p5 from "p5";
import { Board } from "./board";
import { Map } from "./map";
import { Player } from "./player";
import { Interest } from "./interest";
import {
  Coords,
  currentPixelSize,
  perlinNoise,
  pixelCoords,
  randomInt,
  randomNoise,
} from "./utils";
import { Area } from "./area";
import config from "./config.json";

const CANVAS_SIZE = config.CANVAS_SIZE;
const TRANSLATTION_AMOUNT = config.TRANSLATTION_AMOUNT;
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.setAttribute("width", `${CANVAS_SIZE}`);
canvas.setAttribute("height", `${CANVAS_SIZE}`);
const noise = document.getElementById("noise") as HTMLCanvasElement;
noise.setAttribute("width", `${CANVAS_SIZE}`);
noise.setAttribute("height", `${CANVAS_SIZE}`);
// canvas.addEventListener("click", function () {}, false);

let paused = false;

document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    paused = !paused;
  }
});

function zoomIn() {
  ctx.translate(-CANVAS_SIZE / 2, -CANVAS_SIZE / 2);
  ctx.scale(2, 2);
}

function zoomOut() {
  ctx.scale(0.5, 0.5);
  ctx.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
}

function translate(amount: Coords) {
  ctx.translate(amount.x, amount.y);
}
const ctx = canvas.getContext("2d");
// zoomIn();
// zoomIn();

const sketch = (s: p5) => {
  let map: Map;

  s.setup = function () {
    s.createCanvas(1000, 1000);
    const mapSize = config.MAP_SIZE;
    map = new Map(0, 0, mapSize, mapSize, "#2B2118", "black", s);
    const player: Player = new Player({ x: s.width / 2, y: s.height / 2 }, "#F7F3E3", s);
    const players = [player];
    // const area1 = Area.randomArea(0, s.width, 0, s.height, 50, s.height, s);
    // const area2 = Area.randomArea(0, s.width, 0, s.height, 50, s.height, s);
    // const area3 = Area.randomArea(0, s.width, 0, s.height, 50, s.height, s);
    // map.areas = [area1, area2, area3];
    map.players = players;
  };

  s.draw = function () {
    if (!paused) {
      s.background(120);
      s.frameRate(24);
      s.circle(s.random(0, s.width), s.random(0, s.height), 25);
      map.tick();
      map.players.forEach((player) => player.tick(map));
      // map.areas.forEach((area) => area.tick());
      // displayGrid();
    }
  };

  let translation = { x: 0, y: 0 };
  s.keyPressed = function () {
    if (s.keyCode === 187) {
      map.zoomIn();
    } else if (s.keyCode === 189) {
      map.zoomOut();
    } else if (s.keyCode === s.UP_ARROW) {
      translation.y += (-1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.DOWN_ARROW) {
      translation.y += (1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.LEFT_ARROW) {
      translation.x += (-1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.RIGHT_ARROW) {
      translation.x += (1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    }
    map.translate(translation);
    map.draw();
  };

  s.keyReleased = function () {
    if (s.keyCode === s.UP_ARROW) {
      translation.y += (1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.DOWN_ARROW) {
      translation.y += (-1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.LEFT_ARROW) {
      translation.x += (1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    } else if (s.keyCode === s.RIGHT_ARROW) {
      translation.x += (-1 * config.TRANSLATTION_AMOUNT * config.PIXEL_SIZE) / map.pixelSize;
    }
    map.translate(translation);
    map.draw();
  };

  function tick() {
    // draw();
  }
  setInterval(tick, 200);

  // function displ
};
new p5(sketch);

// TODO: pixelize it! Use real positions in the background but draw functions should use a utility function to pixelize rects and force them to a small grid

// NOTES: Map = full game board. This may eventually become infinite? Or just very large, but it represent the whole game space. Players are not allowed outside this space
// NOTES: Max Influence Distance = the maximum distance than any object can exert any influence on a player.
// NOTES: Gridcells = A square whose width/length are equal to the max influence distance. Thus we can be sure that a collection of 9 gridcells,
//  making a square surrounding the player will always contain all of the objects capable of influencing the player in the center gridcell.
// NOTES: Viewbox = the players viewbox. Can be scaled and translated around the map freely.
