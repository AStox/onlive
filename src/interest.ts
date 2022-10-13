import { Coords, pixelCoords } from "./utils";
import { Map } from "./map";
import { Area } from "./area";
import config from "./config.json";

export type InterestType = {
  type: string;
  name: string;
  color: string;
};

export const interestTypes: { [key: string]: InterestType } = {
  tree: { type: "TREE", name: "Tree", color: "#1B998B" },
  berryBush: { type: "BERRY_BUSH", name: "Berry Bush", color: "#EE2E31" },
  stone: { type: "STONE", name: "Stone", color: "#809BCE" },
  vegetable: { type: "VEGETABLE", name: "vegetable", color: "#9381FF" },
  herb: { type: "HERB", name: "herb", color: "#5B8E7D" },
};

export class Interest {
  position: Coords;
  color: string;
  weight: number;
  ctx: CanvasRenderingContext2D;
  area: Area;
  size = config.PIXEL_SIZE;
  type: InterestType;

  constructor(
    _position: Coords,
    _color: string,
    _weight: number,
    _ctx: CanvasRenderingContext2D,
    _type: InterestType,
    _area?: Area
  ) {
    this.position = _position;
    this.color = _color;
    this.weight = _weight;
    this.ctx = _ctx;
    this.type = _type;
    this.area = _area;
  }

  static randomInterestType() {
    const enumValues = Object.keys(interestTypes);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    const randomEnumValue = enumValues[randomIndex];
    console.log(interestTypes[randomEnumValue]);
    return interestTypes[randomEnumValue];
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
