import p5 from "p5";
import { Coords } from "./utils";
import { Map } from "./map";

export class Tile {
  map: Map;
  coords: Coords;
  color: number[];
  terrain: string;
  elevation: number;
  contents: any[];
  viewCoords: Coords;

  constructor(_map: Map, _coords: Coords, _color: number[], _terrain: string, _elevation: number) {
    this.map = _map;
    this.coords = _coords;
    this.color = _color;
    this.terrain = _terrain;
    this.elevation = _elevation;
    this.contents = [];
  }

  tick() {}

  draw(viewCoords: Coords) {
    // this.viewCoords = viewCoords;
    // this.s.fill(this.color);
    // this.s.rect(
    //   viewCoords.x * this.map.pixelSize,
    //   viewCoords.y * this.map.pixelSize,
    //   this.map.pixelSize,
    //   this.map.pixelSize
    // );
    // this.contents.forEach((contents) => {
    //   contents.draw();
    //   //   this.s.fill(contents.color);
    //   //   this.s.rect(
    //   //     viewCoords.x * this.map.pixelSize,
    //   //     viewCoords.y * this.map.pixelSize,
    //   //     this.map.pixelSize,
    //   //     this.map.pixelSize
    //   //   );
    // });
  }
}
