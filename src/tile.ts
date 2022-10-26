import p5 from "p5";
import { Coords } from "./utils";
import { Map } from "./map";

export class Tile {
  s: p5;
  map: Map;
  coords: Coords;
  color: p5.Color;
  terrain: string;
  elevation: number;
  contents: any[];

  constructor(
    _s: p5,
    _map: Map,
    _coords: Coords,
    _color: p5.Color,
    _terrain: string,
    _elevation: number
  ) {
    this.s = _s;
    this.map = _map;
    this.coords = _coords;
    this.color = _color;
    this.terrain = _terrain;
    this.elevation = _elevation;
    this.contents = [];
  }

  tick() {}

  draw(viewCoords: Coords) {
    this.s.fill(this.color);
    this.s.rect(
      viewCoords.x * this.map.pixelSize,
      viewCoords.y * this.map.pixelSize,
      this.map.pixelSize,
      this.map.pixelSize
    );
    this.contents.forEach((contents) => {
      console.log("sdf");
      this.s.fill(contents.color);
      this.s.rect(
        viewCoords.x * this.map.pixelSize,
        viewCoords.y * this.map.pixelSize,
        this.map.pixelSize,
        this.map.pixelSize
      );
    });
  }
}
