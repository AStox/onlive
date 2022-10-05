export class Board {
  x: number;
  y: number;
  height: number;
  width: number;
  color: string;
  ctx: CanvasRenderingContext2D;

  constructor(
    _x: number,
    _y: number,
    _height: number,
    _width: number,
    _color: string,
    _ctx: CanvasRenderingContext2D
  ) {
    this.x = _x;
    this.y = _y;
    this.height = _height;
    this.width = _width;
    this.color = _color;
    this.ctx = _ctx;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(this.x, this.y, this.width, this.height);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.closePath();
  }
}

// export type Board = {
//   x: number;
//   y: number;
//   height: number;
//   width: number;
//   color: string;
//   draw: (ctx: CanvasRenderingContext2D) => void;
// };

// export const defaultBoard: Board = {
//   x: 0,
//   y: 0,
//   height: 500,
//   width: 500,
//   color: "#2B2118",
//   draw: (ctx: CanvasRenderingContext2D) => {},
// };
// defaultBoard.draw = (ctx: CanvasRenderingContext2D) => {
//   ctx.beginPath();
//   ctx.rect(defaultBoard.x, defaultBoard.y, defaultBoard.width, defaultBoard.height);
//   ctx.fillStyle = defaultBoard.color;
//   ctx.fill();
//   ctx.closePath();
// };
//
