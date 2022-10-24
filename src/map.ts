import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import {
  Coords,
  currentPixelSize,
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
  color: number[];
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
    // console.log(this.day ? "daytime" : "nightime", this.time);
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
        if (this.tiles[`${i}-${j}`]?.color) {
          color = this.s.color(
            this.tiles[`${i}-${j}`].color[0],
            this.tiles[`${i}-${j}`].color[1],
            this.tiles[`${i}-${j}`].color[2]
          );
        } else {
          color = this.s.color("red");
        }
        this.s.fill(color);
        this.s.rect(i * this.pixelSize, j * this.pixelSize, this.pixelSize, this.pixelSize);
      }
    }
    // this.s.beginPath();
    // this.s.rect(this.x * 10, this.y * 10, this.width * 10, this.height * 10);
    // this.s.fillStyle = "black";
    // this.s.fill();
    // this.s.closePath();
    // perlinNoise(this.s, this.noise, 0, 0, this.width, this.height, 1, 10);
    // const elevationCount = this.colorScale.length;
    // const pixelSize =
    // const pixelCount = config.CANVAS_SIZE / pixelSize;
    // // x coord
    // for (let i = 0; i < pixelCount; i++) {
    //   // y coord
    //   for (let j = 0; j < pixelCount; j++) {
    //     const x = i * pixelSize;
    //     const y = j * pixelSize;
    //     const p = this.s.getImageData(x + pixelSize / 2, y + pixelSize / 2, 1, 1).data;
    //     const elevationLevel = Math.floor((p[0] / 255) * elevationCount);
    //     this.s.beginPath();
    //     const t = this.s.getTransform();
    //     let point = translatePoint({ x, y }, t, true);
    //     point = scalePoint({ x: point.x, y: point.y }, t, true);
    //     console.log(x, point.x);
    //     this.s.rect(point.x, point.y, config.PIXEL_SIZE, config.PIXEL_SIZE);
    //     this.s.fillStyle = `${this.colorScale[elevationLevel]}`;
    //     this.s.fill();
    //     this.s.closePath();
    //   }
    // }
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
    // x coord
    for (let i = 0; i < this.width; i += 1) {
      // y coord
      for (let j = 0; j < this.height; j += 1) {
        // console.log(`${i}-${j}`);
        // console.log(this.width / this.pixelSize);
        // console.log(this.width);
        this.tiles[`${i / this.pixelSize}-${j / this.pixelSize}`] = {
          color: this.perlinNoise(i, j),
          terrain: "grass",
          altitude: 0,
        };
        // console.log(this.tiles[`${i}-${j}`]);
      }
    }
  }

  perlinNoise(x: number, y: number): number[] {
    let color = [0, 0, 0];
    const levels = 4;
    const scale = 0.003;

    for (let i = 0; i < levels; i++) {
      for (let j = 0; j < 3; j++) {
        color[j] += this.s?.noise((x * scale) / (i + 1), (y * scale) / (i + 1)) * (255 / levels);
      }
    }
    // console.log(x, y, color);
    return color;
  }

  static remove(object: Interest) {
    (object as Interest).area.interests = (object as Interest).area.interests.filter(
      (interest) => object !== interest
    );
  }
}
