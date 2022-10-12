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
  color: string;
  players: Player[];
  areas = [] as Area[];
  ctx: CanvasRenderingContext2D;

  constructor(
    _x: number,
    _y: number,
    _height: number,
    _width: number,
    _color: string,
    _ctx: CanvasRenderingContext2D,
    _players?: Player[],
    _interests?: Interest[]
  ) {
    this.x = _x;
    this.y = _y;
    this.height = _height;
    this.width = _width;
    this.color = _color;
    this.players = _players;
    this.ctx = _ctx;
  }

  tick() {
    this.draw();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  remove(type: objectType, object: Player | Interest) {
    if (type == objectType.interest) {
      (object as Interest).area.interests = (object as Interest).area.interests.filter(
        (interest) => object !== interest
      );
    } else if (type == objectType.player) {
      this.players = this.players.filter((player) => object !== player);
    }
  }
}
