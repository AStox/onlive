import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import { perlinNoise, randomInt, randomNoise } from "./utils";
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
      getComputedStyle(document.documentElement).getPropertyValue("--grass1"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass2"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass3"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass4"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass5"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass6"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass7"),
      getComputedStyle(document.documentElement).getPropertyValue("--grass8"),
    ];
    console.log(this.colorScale);
  }

  tick() {
    this.draw();
    this.passageOfTime();
    // console.log(this.day ? "daytime" : "nightime", this.time);
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = "black";
    this.ctx.fill();
    this.ctx.closePath();
    perlinNoise(this.ctx, this.noise, 0, 0, config.CANVAS_SIZE, config.CANVAS_SIZE, 255);
    const elevationCount = this.colorScale.length;
    const pixelCount = config.CANVAS_SIZE / config.PIXEL_SIZE;
    for (let i = 0; i < pixelCount; i++) {
      // x coord
      for (let j = 0; j < pixelCount; j++) {
        // y coord
        const x = i * config.PIXEL_SIZE;
        const y = j * config.PIXEL_SIZE;
        const p = this.ctx.getImageData(x, y, 1, 1).data;
        const elevationLevel = Math.floor((p[0] / 255) * elevationCount);
        const color = elevationLevel * (255 / elevationCount);
        this.ctx.beginPath();
        this.ctx.rect(x, y, config.PIXEL_SIZE, config.PIXEL_SIZE);
        // this.ctx.fillStyle = this.day ? this.dayColor : this.nightColor;
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
