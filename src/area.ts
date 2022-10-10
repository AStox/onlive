import { Interest } from "./interest";
import { randomInt } from "./utils";

export class Area {
  x: number;
  y: number;
  r: number;
  interests: Interest[];
  ctx: CanvasRenderingContext2D;

  constructor(_x: number, _y: number, _r: number, _ctx: CanvasRenderingContext2D) {
    this.x = _x;
    this.y = _y;
    this.r = _r;
    this.ctx = _ctx;
  }

  static randomArea(
    xMin: number,
    xMax: number,
    yMin: number,
    yMax: number,
    rMin: number,
    rMax: number,
    _ctx: CanvasRenderingContext2D
  ) {
    return new Area(randomInt(xMin, xMax), randomInt(yMin, yMax), randomInt(rMin, rMax), _ctx);
  }

  tick() {
    this.draw();
  }

  generateInterest() {
    if (Math.random() > 0.95) {
      this.interests.push(
        new Interest(
          {
            x: randomInt(this.x - this.r, this.x + this.r),
            y: randomInt(this.y - this.r, this.y + this.r),
          },
          "#A8763E",
          2,
          this.ctx
        )
      );
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.ctx.strokeStyle = "black";
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
