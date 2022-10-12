import { Coords, pixelCoords } from "./utils";
import { Map } from "./map";
import { Area } from "./area";
import config from "./config.json";

export class Interest {
  position: Coords;
  color: string;
  weight: number;
  ctx: CanvasRenderingContext2D;
  area: Area;
  size = config.PIXEL_SIZE;

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
    const coords = { x: this.position.x - this.size / 2, y: this.position.y - this.size / 2 };
    this.ctx.rect(pixelCoords(coords).x, pixelCoords(coords).y, this.size, this.size);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }
}
