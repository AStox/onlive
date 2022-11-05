import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import {
  Coords,
  currentPixelSize,
  grey,
  randomInt,
  randomNoise,
  scalePoint,
  transformPoint,
  translatePoint,
} from "./utils";
import config from "./config.json";
import p5 from "p5";
import { Tile } from "./tile";
import { Erosion } from "./erosion";

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

// export type Tile = {
//   color: p5.Color;
//   terrain: string;
//   altitude: number;
// };
export class Map {
  x: number;
  y: number;
  height: number;
  width: number;
  dayColor: string;
  nightColor: string;
  players: Player[];
  areas = [] as Area[];
  s: p5;
  time = 0; // 24 hour clock
  timeChangeRate = 0.25;
  day: boolean;
  noise: HTMLCanvasElement;
  // coords: { [key: string]: Tile };
  pixelSize: number;
  tiles: { [key: string]: Tile };
  translation: Coords = { x: 0, y: 0 };
  noiseMap: { [key: string]: number };
  mapArrays: { [key: string]: number }[] = [];
  mapArrayIndex = 0;
  flowCount = config.EROSION_SIM_COUNT_MOD * config.MAP_SIZE;
  // currentArray: number[];

  showFlow: boolean;
  flowMap: { x: number; y: number; sediment: number; color: number }[][];

  constructor(
    _x: number,
    _y: number,
    _height: number,
    _width: number,
    _dayColor: string,
    _nightColor: string,
    _s: p5,
    _players?: Player[],
    _interests?: Interest[]
  ) {
    this.x = _x;
    this.y = _y;
    this.height = _height;
    this.width = _width;
    this.dayColor = _dayColor;
    this.nightColor = _nightColor;
    this.players = _players;
    this.s = _s;
    this.noise = randomNoise(0, 0, this.width, this.height, 100);
    this.tiles = {} as { [key: string]: Tile };
    this.pixelSize = config.PIXEL_SIZE;
    this.showFlow = false;

    const player: Player = new Player(this.s, "#F7F3E3", this);
    const players = [player];
    this.players = players;

    this.generate(true);

    // set up player
    const tile = this.tiles[`0-0`];
    tile.contents.push(player);
    player.tile = tile;
  }

  tick() {
    this.draw();
    this.passageOfTime();
  }

  draw() {
    this.x += this.translation.x;
    this.y += this.translation.y;

    this.s.fill(
      this.s.color(getComputedStyle(document.documentElement).getPropertyValue("--grass5"))
    );
    this.s.noStroke();
    this.s.rect(0, 0, this.s.width, this.s.height);
    const pixelsPerScreenRow = this.s.width / this.pixelSize;
    const pixelsPerScreenCol = this.s.height / this.pixelSize;
    for (let y = 0; y < pixelsPerScreenRow; y++) {
      for (let x = 0; x < pixelsPerScreenCol; x++) {
        this.tiles[`${this.x + x}-${this.y + y}`]?.draw({
          x,
          y,
        });
      }
    }

    // EROSION FLOW MAP DRAW CALLS
    if (this.showFlow) {
      for (let i = 0; i < this.flowMap.length; i++) {
        for (let j = 0; j < this.flowMap[i].length; j++) {
          const flow = this.flowMap[i][j];
          if (
            flow.x > this.x &&
            flow.x < this.x + this.s.width / this.pixelSize &&
            flow.y > this.y &&
            flow.y < this.y + this.s.height / this.pixelSize
          ) {
            const color =
              // j === 0
              // ? this.s.color("green")
              // : this.s.color(flow.color * 255, flow.color * 255, flow.color * 255);
              this.s.color("red");
            this.s.fill(color);
            this.s.circle(
              (flow.x - this.x) * this.pixelSize,
              (flow.y - this.y) * this.pixelSize,
              flow.sediment * 100
            );
            this.s.fill(this.s.color("red"));
            // this.s.circle(
            //   (flow.x - this.x - 1) * this.pixelSize,
            //   (flow.y - this.y) * this.pixelSize,
            //   2
            // );
            // this.s.circle(
            //   (flow.x - this.x - 1) * this.pixelSize,
            //   (flow.y - this.y - 1) * this.pixelSize,
            //   2
            // );
            // this.s.circle(
            //   (flow.x - this.x) * this.pixelSize,
            //   (flow.y - this.y - 1) * this.pixelSize,
            //   2
            // );
          }
        }
      }
    }
  }

  passageOfTime() {
    this.time += this.timeChangeRate;
    this.time = this.time % 24;
    if (this.time > 12) {
      this.day = false;
    } else {
      this.day = true;
    }
  }

  generate(reload = false) {
    const grassColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--green-dark"
    );
    const grassColorEnd = getComputedStyle(document.documentElement).getPropertyValue("--grass1");
    const waterColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--blue-med"
    );
    const waterColorEnd = getComputedStyle(document.documentElement).getPropertyValue(
      "--blue-light"
    );
    const mountainColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--grey-dark"
    );
    const mountainColorEnd = getComputedStyle(document.documentElement).getPropertyValue(
      "--grey-light"
    );
    const colorLevels = config.MAP_COLOUR_LEVELS;
    if (reload) {
      this.noiseMap = {};
      const random1 = randomInt(this.width / 2, this.width);
      const random2 = randomInt(this.width / 2, this.width);
      for (let y = 0; y < this.width; y += 1) {
        for (let x = 0; x < this.height; x += 1) {
          this.noiseMap[`${x}-${y}`] = this.perlinNoise(
            x * this.pixelSize,
            y * this.pixelSize,
            random1,
            random2
          )[0];
          // if (i >= 555 && i <= 560 && j >= 555 && j <= 560) {
          //   this.noiseMap[this.noiseMap.length - 1] = 0;
          // }
        }
      }

      const e = new Erosion(this.s, this.width);
      // this.mapArrays.push(e.test(this.noiseMap));
      this.mapArrays.push(structuredClone(this.noiseMap));
      const erosion = e.erode(this.noiseMap, this.flowCount);
      // const erosion = e.erode(this.noiseMap, 1);
      this.mapArrays.push(erosion.map);
      // const obj: { [key: string]: number } = {};
      // Object.keys(this.noiseMap).map((key) => {
      //   obj[key] = 0;
      // });
      // this.mapArrays.push(obj);

      // this.noiseMap = erosion.map;
      this.flowMap = erosion.flowMap;

      // this.noiseMap = this.noiseMap.map((thing) => 1);
    }

    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        const noise =
          Math.floor(this.mapArrays[this.mapArrayIndex][`${x}-${y}`] * colorLevels) / colorLevels;
        // const noise = this.mapArrays[this.mapArrayIndex][`${x}-${y}`];

        let color: p5.Color;
        color = this.s.color(noise * 255, noise * 255, noise * 255);
        if (noise > 0.7) {
          color = this.s.lerpColor(
            this.s.color(mountainColorStart),
            this.s.color(mountainColorEnd),
            noise
          );
        } else if (noise > 0.4) {
          color = this.s.lerpColor(
            this.s.color(grassColorStart),
            this.s.color(grassColorEnd),
            noise
          );
        } else {
          color = this.s.lerpColor(
            this.s.color(waterColorStart),
            this.s.color(waterColorEnd),
            noise
          );
        }
        // this.tiles[`${i - this.width / 2}-${j - this.height / 2}`] = {
        //   color,
        //   terrain: "grass",
        //   altitude: 0,
        // };
        this.tiles[`${x}-${y}`] = new Tile(this.s, this, { x, y }, color, "grass", 0);
      }
    }
  }

  perlinNoise(x: number, y: number, random1: number, random2: number): number[] {
    // let color = [0, 0, 0];
    let color = 0;
    const levels = 4;
    const scale = 0.005;

    color +=
      (this.s?.noise(((x + random1) * scale) / 8, ((y + random1) * scale) / 8) * 2) / (levels + 1);
    for (let i = 0; i < levels; i++) {
      color +=
        this.s?.noise(((x + random2) * scale) / (i + 2), ((y + random2) * scale) / (i + 2)) /
        (levels + 1);
      color = Math.min(1, color);
    }
    return [color, color, color];
  }

  zoomIn() {
    const pixelsPerRow = this.s.width / this.pixelSize;
    const pixelsPerCol = this.s.height / this.pixelSize;
    this.x += Math.floor(pixelsPerRow / 4);
    this.y += Math.floor(pixelsPerCol / 4);
    this.pixelSize *= 2;
  }

  zoomOut() {
    const pixelsPerRow = this.s.width / this.pixelSize;
    const pixelsPerCol = this.s.height / this.pixelSize;
    if ((2 * this.s.width) / this.pixelSize <= this.width / 2) {
      this.x += Math.ceil(-pixelsPerRow / 2);
      this.y += Math.ceil(-pixelsPerCol / 2);
      this.pixelSize /= 2;
    }
  }

  translate(coords: Coords) {
    this.translation = coords;
  }

  switch() {
    this.mapArrayIndex += 1;
    if (this.mapArrayIndex === this.mapArrays.length) {
      this.mapArrayIndex = 0;
    }
    this.generate();
  }

  toggleFlowMap() {
    this.showFlow = !this.showFlow;
  }

  static remove(object: Interest) {
    (object as Interest).area.interests = (object as Interest).area.interests.filter(
      (interest) => object !== interest
    );
  }
}
