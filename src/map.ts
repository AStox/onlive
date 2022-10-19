import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import {
  currentPixelSize,
  perlinNoise,
  randomInt,
  randomNoise,
  scalePoint,
  transformPoint,
  translatePoint,
} from "./utils";
import config from "./config.json";

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

export type Tile = {
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
  ctx: CanvasRenderingContext2D;
  time = 0; // 24 hour clock
  timeChangeRate = 0.25;
  day: boolean;
  noise: HTMLCanvasElement;
  coords: { [key: string]: Tile };
  colorScale: string[];

  constructor(
    _x: number,
    _y: number,
    _height: number,
    _width: number,
    _dayColor: string,
    _nightColor: string,
    _ctx: CanvasRenderingContext2D,
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
    this.ctx = _ctx;
    this.noise = randomNoise(0, 0, this.width, this.height, 100);
    this.coords = {} as { [key: string]: Tile };
    this.colorScale = [
      getComputedStyle(document.documentElement).getPropertyValue("--blue-dark"),
      getComputedStyle(document.documentElement).getPropertyValue("--blue-med"),
      getComputedStyle(document.documentElement).getPropertyValue("--blue-light"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass5"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass4"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass3"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass2"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass1"),
    ];
  }

  tick() {
    this.draw();
    this.passageOfTime();
    // console.log(this.day ? "daytime" : "nightime", this.time);
  }

  draw() {
    this.ctx.globalAlpha = 1;
    this.ctx.beginPath();
    this.ctx.rect(this.x * 10, this.y * 10, this.width * 10, this.height * 10);
    this.ctx.fillStyle = "black";
    this.ctx.fill();
    this.ctx.closePath();
    perlinNoise(this.ctx, this.noise, 0, 0, this.width, this.height, 1, 10);
    const elevationCount = this.colorScale.length;
    const pixelSize = currentPixelSize(this.ctx);
    const pixelCount = config.CANVAS_SIZE / pixelSize;
    // x coord
    for (let i = 0; i < pixelCount; i++) {
      // y coord
      for (let j = 0; j < pixelCount; j++) {
        const x = i * pixelSize;
        const y = j * pixelSize;
        const p = this.ctx.getImageData(x + pixelSize / 2, y + pixelSize / 2, 1, 1).data;

        const elevationLevel = Math.floor((p[0] / 255) * elevationCount);
        this.ctx.beginPath();
        const t = this.ctx.getTransform();
        let point = translatePoint({ x, y }, t, true);
        point = scalePoint({ x: point.x, y: point.y }, t, true);
        console.log(x, point.x);
        this.ctx.rect(point.x, point.y, config.PIXEL_SIZE, config.PIXEL_SIZE);
        this.ctx.fillStyle = `${this.colorScale[elevationLevel]}`;
        this.ctx.fill();
        this.ctx.closePath();
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

  static remove(object: Interest) {
    (object as Interest).area.interests = (object as Interest).area.interests.filter(
      (interest) => object !== interest
    );
  }
}
