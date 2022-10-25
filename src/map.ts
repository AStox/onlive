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

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

export type Tile = {
  color: p5.Color;
  terrain: string;
  altitude: number;
};
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
  colorScale: string[];

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
    this.colorScale = [
      // getComputedStyle(document.documentElement).getPropertyValue("--blue-dark"),
      getComputedStyle(document.documentElement).getPropertyValue("--blue-med"),
      getComputedStyle(document.documentElement).getPropertyValue("--blue-light"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass5"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass4"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass3"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass2"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass1"),
    ];
    this.generate();
  }

  tick() {
    this.draw();
    this.passageOfTime();
  }

  draw() {
    this.s.fill(
      this.s.color(getComputedStyle(document.documentElement).getPropertyValue("--grass5"))
    );
    this.s.noStroke();
    this.s.rect(0, 0, this.s.width, this.s.height);
    const pixelsPerRow = this.s.width / this.pixelSize;
    const pixelsPerCol = this.s.height / this.pixelSize;
    for (let i = 0; i < pixelsPerRow; i++) {
      for (let j = 0; j < pixelsPerCol; j++) {
        let color: p5.Color;
        if (this.tiles[`${this.x + i}-${this.y + j}`]?.color) {
          color = this.tiles[`${this.x + i}-${this.y + j}`].color;
        } else {
          color = this.s.color("black");
        }
        this.s.fill(color);
        this.s.rect(i * this.pixelSize, j * this.pixelSize, this.pixelSize, this.pixelSize);
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

  generate() {
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
    const colorLevels = 25;
    // x coord
    for (let i = 0; i < this.width; i += 1) {
      // y coord
      for (let j = 0; j < this.height; j += 1) {
        const noise = Math.floor(this.perlinNoise(i, j)[0] * colorLevels) / colorLevels;
        let color: p5.Color;
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

        this.tiles[`${i - this.width / 2}-${j - this.height / 2}`] = {
          color,
          terrain: "grass",
          altitude: 0,
        };
      }
    }
  }

  perlinNoise(x: number, y: number): number[] {
    // let color = [0, 0, 0];
    let color = 0;
    const levels = 4;
    const scale = 0.05;

    color += (this.s?.noise((x * scale) / 8, (y * scale) / 8) * 2) / (levels + 1);
    for (let i = 0; i < levels; i++) {
      color += this.s?.noise((x * scale) / (i + 2), (y * scale) / (i + 2)) / (levels + 1);
      if (x === 0 && y === 0) {
        console.log("!!", color);
      }
      color = Math.min(1, color);
    }
    return [color, color, color];
  }

  zoomIn() {
    const pixelsPerRow = this.s.width / this.pixelSize;
    const pixelsPerCol = this.s.height / this.pixelSize;
    this.translate({ x: pixelsPerRow / 4, y: pixelsPerCol / 4 });
    this.pixelSize *= 2;
    // this.translate({ x: pixelsPerRow, y: pixelsPerCol });
  }

  zoomOut() {
    const pixelsPerRow = this.s.width / this.pixelSize;
    const pixelsPerCol = this.s.height / this.pixelSize;
    if ((2 * this.s.width) / this.pixelSize <= this.width / 2) {
      this.translate({ x: -pixelsPerRow / 2, y: -pixelsPerCol / 2 });
      this.pixelSize /= 2;
    }
  }

  translate(coords: Coords) {
    this.x += coords.x;
    this.y += coords.y;
  }

  static remove(object: Interest) {
    (object as Interest).area.interests = (object as Interest).area.interests.filter(
      (interest) => object !== interest
    );
  }
}
