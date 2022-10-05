import { Board } from "./board";
import { Player } from "./player";
import { Interest } from "./interest";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const BOARD_SIZE = 500;
const INTEREST_COUNT = 5;

const board: Board = new Board(0, 0, BOARD_SIZE, BOARD_SIZE, "red", ctx);
const player: Player = new Player(BOARD_SIZE / 2, BOARD_SIZE / 2, "#F7F3E3", ctx);
const interests = [];
for (let i = 0; i < INTEREST_COUNT; i++) {
  const interest: Interest = new Player(250, 250, "#F7F3E3", ctx);
}

function draw() {
  board.draw();
  player.draw();
}
setInterval(draw, 42);

// const svg = document.querySelector("svg");

// const boardWidth = 1000;
// const boardHeight = 1000;
// const boardColor = "#2B2118";

// const interests = [
//   {
//     x: 200,
//     y: 100,
//   },
//   {
//     x: 600,
//     y: 900,
//   },
//   {
//     x: 300,
//     y: 900,
//   },
// ];

// const player1 = {
//   spawn: { x: 500, y: 500 },
// };

// const DELTA_T = 2;

// SetBoard(boardWidth, boardHeight, boardColor);
// player1.elementID = spawnPlayer(player1);
// const interestsElements = spawnInterests(interests);
// interests.forEach((interest, i) => (interest.elementID = interestsElements[i]));

// drawPlayer(playerLocation(DELTA_T, player1), player1);

// function playerLocation(DELTA_T, player) {
//   if (DELTA_T === 0) {
//     return player.spawn;
//   }
//   const pull = { x: 0, y: 0 };
//   const strength = 0.1;
//   interests.forEach((interest, i) => {
//     pull.x += (interest.x - playerLocation(DELTA_T - 1, player).x) * strength;
//     pull.y += (interest.y - playerLocation(DELTA_T - 1, player).y) * strength;
//   });
//   const x = player.spawn.x + pull.x * DELTA_T;
//   const y = player.spawn.y + pull.y * DELTA_T;
//   console.log(x, y);
//   return { x: x, y: y };
// }

// function spawnPlayer(player) {
//   svg.innerHTML += `<circle id="player1" cx="${player.spawn.x}" cy="${player.spawn.y}" r="6" fill="#F7F3E3" />`;
//   return "#player1";
// }

// function drawPlayer(location, player) {
//   document.querySelector(player.elementID).setAttribute("cx", location.x);
//   document.querySelector(player.elementID).setAttribute("cy", location.y);
// }

// function spawnInterests(interests) {
//   const output = [];
//   interests.forEach((interest, i) => {
//     svg.innerHTML += `<circle id="interest${i}" cx="${interest.x}" cy="${interest.y}" r="6" fill="#A8763E" />`;
//     output.push(`#interest${i}`);
//   });
//   return output;
// }

// function SetBoard(boardWidth, boardHeight, boardColor) {
//   svg.setAttribute("width", `${boardWidth}px`);
//   svg.setAttribute("height", `${boardHeight}px`);
//   svg.innerHTML += `<rect x="0" y="0" width="${boardWidth}" height="${boardHeight}" fill="${boardColor}"></rect>`;
// }
