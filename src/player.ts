export class Player {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  size = 6;

  constructor(_x: number, _y: number, _color: string, _ctx: CanvasRenderingContext2D) {
    this.x = _x;
    this.y = _y;
    this.color = _color;
    this.ctx = _ctx;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }
}
