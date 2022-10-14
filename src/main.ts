import { Board } from "./board";
import { Map } from "./map";
import { Player } from "./player";
import { Interest } from "./interest";
import { Coords, pixelCoords, randomInt } from "./utils";
import { Area } from "./area";
import config from "./config.json";

const CANVAS_SIZE = config.CANVAS_SIZE;
const TRANSLATTION_AMOUNT = config.TRANSLATTION_AMOUNT;
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
canvas.setAttribute("width", `${CANVAS_SIZE}`);
canvas.setAttribute("height", `${CANVAS_SIZE}`);
// canvas.addEventListener("click", function () {}, false);
document.addEventListener("keydown", function (event) {
  if (event.key == "=") {
    zoomIn();
  }
  if (event.key == "-") {
    zoomOut();
  }
  if (event.key === "ArrowUp" || event.key === "w") {
    translate({ x: 0, y: TRANSLATTION_AMOUNT });
  }
  if (event.key === "ArrowLeft" || event.key === "a") {
    translate({ x: TRANSLATTION_AMOUNT, y: 0 });
  }
  if (event.key === "ArrowDown" || event.key === "s") {
    translate({ x: 0, y: -TRANSLATTION_AMOUNT });
  }
  if (event.key === "ArrowRight" || event.key === "d") {
    translate({ x: -TRANSLATTION_AMOUNT, y: 0 });
  }
});
const ctx = canvas.getContext("2d");
// zoomIn();
// zoomIn();

const map: Map = new Map(-10000, -10000, 20000, 20000, "#2B2118", ctx);
const player: Player = new Player({ x: CANVAS_SIZE / 2, y: CANVAS_SIZE / 2 }, "#F7F3E3", ctx);
const players = [player];
const area1 = Area.randomArea(0, 250, 0, 250, 50, 225, ctx);
const area2 = Area.randomArea(0, 500, 0, 500, 50, 225, ctx);
const area3 = Area.randomArea(0, 500, 0, 500, 50, 225, ctx);
map.areas = [area1, area2, area3];
map.players = players;

function tick() {
  map.tick();
  map.players.forEach((player) => player.tick(map));
  map.areas.forEach((area) => area.tick());
  displayGrid();
}
setInterval(tick, 420);

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

function displayGrid() {
  for (let i = 0; i < CANVAS_SIZE; i += config.PIXEL_SIZE) {
    ctx.beginPath();
    ctx.rect(pixelCoords({ x: i, y: 0 }).x, 0, 1, CANVAS_SIZE);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }
  for (let i = 0; i < CANVAS_SIZE; i += config.PIXEL_SIZE) {
    ctx.beginPath();
    ctx.rect(0, pixelCoords({ x: 0, y: i }).y, CANVAS_SIZE, 1);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }
}

// TODO: pixelize it! Use real positions in the background but draw functions should use a utility function to pixelize rects and force them to a small grid

// NOTES: Map = full game board. This may eventually become infinite? Or just very large, but it represent the whole game space. Players are not allowed outside this space
// NOTES: Max Influence Distance = the maximum distance than any object can exert any influence on a player.
// NOTES: Gridcells = A square whose width/length are equal to the max influence distance. Thus we can be sure that a collection of 9 gridcells,
//  making a square surrounding the player will always contain all of the objects capable of influencing the player in the center gridcell.
// NOTES: Viewbox = the players viewbox. Can be scaled and translated around the map freely.
