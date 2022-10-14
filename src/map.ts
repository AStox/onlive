import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import { randomInt } from "./utils";

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

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
  }

  tick() {
    this.draw();
    this.passageOfTime();
    console.log(this.day ? "daytime" : "nightime", this.time);
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.day ? this.dayColor : this.nightColor;
    this.ctx.fill();
    this.ctx.closePath();
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
