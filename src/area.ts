import { Interest, InterestType, interestTypes } from "./interest";
import { dist, randomInt } from "./utils";

export class Area {
  x: number;
  y: number;
  r: number;
  interests = [] as Interest[];
  ctx: CanvasRenderingContext2D;
  interestType: InterestType;

  constructor(
    _x: number,
    _y: number,
    _r: number,
    _ctx: CanvasRenderingContext2D,
    _type: InterestType
  ) {
    this.x = _x;
    this.y = _y;
    this.r = _r;
    this.ctx = _ctx;
    this.interestType = _type;
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
    return new Area(
      randomInt(xMin, xMax),
      randomInt(yMin, yMax),
      randomInt(rMin, rMax),
      _ctx,
      Interest.randomInterestType()
    );
  }

  tick() {
    if (Math.random() > 0.9) {
      this.generateInterest();
    }
    this.interests.forEach((interest) => interest.tick());
    // this.draw();
  }

  generateInterest() {
    const x = randomInt(this.x - this.r, this.x + this.r);
    const y = randomInt(this.y - this.r, this.y + this.r);
    if (dist({ x, y }, { x: this.x, y: this.y }) <= this.r) {
      this.interests.push(
        new Interest(
          this.ctx,
          {
            x,
            y,
          },
          this.interestType.color,
          1,
          this.interestType,
          this
        )
      );
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
    this.ctx.closePath();
  }
}
