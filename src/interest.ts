import { Coords } from "./utils";
import { Map } from "./map";
import { Area } from "./area";

export class Interest {
  position: Coords;
  color: string;
  weight: number;
  ctx: CanvasRenderingContext2D;
  size = 6;
  area: Area;

  constructor(
    _position: Coords,
    _color: string,
    _weight: number,
    _ctx: CanvasRenderingContext2D,
    _area?: Area
  ) {
    this.position = _position;
    this.color = _color;
    this.weight = _weight;
    this.ctx = _ctx;
    this.area = _area;
  }

  tick() {
    this.draw();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(
      this.position.x - this.weight / 2,
      this.position.y - this.weight / 2,
      this.weight,
      this.weight
    );
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  kill(map: Map) {
    map.interests;
  }
}
