import { Area } from "./area";
import { Interest } from "./interest";
import { Player } from "./player";
import {
  Coords,
  currentPixelSize,
  grey,
  randomInt,
  randomNoise,
  scalePoint,
  transformPoint,
  translatePoint,
} from "./utils";
import config from "./config.json";
import p5 from "p5";
import { Tile } from "./tile";
import { Erosion, FlowMap } from "./erosion";

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

// export type Tile = {
//   color: p5.Color;
//   terrain: string;
//   altitude: number;
// };
export class Map {
  x: number;
  y: number;
  height: number;
  width: number;
  dayColor: string;
  nightColor: string;
  players: Player[];
  areas = [] as Area[];
  // s: p5;
  time = 0; // 24 hour clock
  timeChangeRate = 0.25;
  day: boolean;
  noise: HTMLCanvasElement;
  // coords: { [key: string]: Tile };
  pixelSize: number;
  tiles: { [key: string]: Tile };
  translation: Coords = { x: 0, y: 0 };
  noiseMap: { [key: string]: number };
  mapArrays: { [key: string]: number }[] = [];
  mapArrayIndex = 0;
  flowCount =
    config.EROSION_SIM_COUNT > 0
      ? config.EROSION_SIM_COUNT
      : config.EROSION_SIM_COUNT_MOD * config.MAP_SIZE;
  totalFlowCount = 0;
  // currentArray: number[];

  showFlow: boolean;
  flowMap: FlowMap[][];

  constructor(
    _x: number,
    _y: number,
    _height: number,
    _width: number,
    _dayColor: string,
    _nightColor: string,
    // _s: p5,
    _players?: Player[],
    _interests?: Interest[]
  ) {
    this.x = _x;
    this.y = _y;
    this.height = _height;
    this.width = _width;
    this.dayColor = _dayColor;
    this.nightColor = _nightColor;
    this.players = _players;
    // this.s = _s;
    this.noise = randomNoise(0, 0, this.width, this.height, 100);
    this.tiles = {} as { [key: string]: Tile };
    this.pixelSize = config.PIXEL_SIZE;
    this.showFlow = false;

    // const player: Player = new Player(this.s, "#F7F3E3", this);
    // const players = [player];
    // this.players = players;

    this.generate(true, true);

    // set up player
    // const tile = this.tiles[`0-0`];
    // tile.contents.push(player);
    // player.tile = tile;
  }

  tick() {
    this.draw();
  }

  draw(redraw = true) {
    // this.x += this.translation.x;
    // this.y += this.translation.y;
    // this.generate(false, redraw);
    // const erodeColor = getComputedStyle(document.documentElement).getPropertyValue("--red-med");
    // const depositColor = getComputedStyle(document.documentElement).getPropertyValue(
    //   "--yellow-green-dark"
    // );
    // this.s.fill(
    //   this.s.color(getComputedStyle(document.documentElement).getPropertyValue("--grass5"))
    // );
    // this.s.noStroke();
    // this.s.rect(0, 0, this.s.width, this.s.height);
    // const pixelsPerScreenRow = this.s.width / this.pixelSize;
    // const pixelsPerScreenCol = this.s.height / this.pixelSize;
    // for (let y = 0; y < pixelsPerScreenRow; y++) {
    //   for (let x = 0; x < pixelsPerScreenCol; x++) {
    //     this.tiles[`${this.x + x}-${this.y + y}`]?.draw({
    //       x,
    //       y,
    //     });
    //   }
    // }
    // // EROSION FLOW MAP DRAW CALLS
    // if (this.showFlow) {
    //   const increment = this.flowMap.length > 100 ? 50 : 1;
    //   for (let i = 0; i < this.flowMap.length; i += increment) {
    //     for (let j = 0; j < this.flowMap[i].length; j++) {
    //       const flow = this.flowMap[i][j];
    //       if (
    //         flow.x > this.x &&
    //         flow.x < this.x + this.s.width / this.pixelSize &&
    //         flow.y > this.y &&
    //         flow.y < this.y + this.s.height / this.pixelSize
    //       ) {
    //         const color =
    //           // j === 0
    //           // ? this.s.color("green")
    //           // : this.s.color(flow.color * 255, flow.color * 255, flow.color * 255);
    //           this.s.color("red");
    //         this.s.fill(flow.depositing ? depositColor : erodeColor);
    //         this.s.circle(
    //           (flow.x - this.x) * this.pixelSize,
    //           (flow.y - this.y) * this.pixelSize,
    //           flow.sediment * 1000
    //         );
    //         this.s.fill(flow.depositing ? depositColor : erodeColor);
    //         // this.s.circle(
    //         //   (flow.x - this.x - 1) * this.pixelSize,
    //         //   (flow.y - this.y) * this.pixelSize,
    //         //   2
    //         // );
    //         // this.s.circle(
    //         //   (flow.x - this.x - 1) * this.pixelSize,
    //         //   (flow.y - this.y - 1) * this.pixelSize,
    //         //   2
    //         // );
    //         // this.s.circle(
    //         //   (flow.x - this.x) * this.pixelSize,
    //         //   (flow.y - this.y - 1) * this.pixelSize,
    //         //   2
    //         // );
    //       }
    //     }
    //   }
    // }
  }

  generate(regenerateNoiseMap = false, regenerateFlow = false) {
    const grassColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--green-dark"
    );
    const grassColorEnd = getComputedStyle(document.documentElement).getPropertyValue("--grass1");
    const waterColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--blue-dark"
    );
    const waterColorEnd = getComputedStyle(document.documentElement).getPropertyValue(
      "--blue-light"
    );
    const mountainColorStart = getComputedStyle(document.documentElement).getPropertyValue(
      "--grey-dark"
    );
    const mountainColorEnd = getComputedStyle(document.documentElement).getPropertyValue(
      "--grey-light"
    );
    const colorLevels = config.MAP_COLOUR_LEVELS;
    const seaLevel = 0.25;
    const random1 = randomInt(this.width / 2, this.width);
    const random2 = randomInt(this.width / 2, this.width);
    const noiseSize = 35;
    // const noiseSize = config.NOISE_SIZE
    if (regenerateNoiseMap) {
      console.log("regenerating noise map");
      this.noiseMap = {};
      for (let y = 0; y < this.width; y += 1) {
        for (let x = 0; x < this.height; x += 1) {
          const radius = config.MAP_SIZE / 2;
          const power = 2;
          const fallOff = 0.4;

          // noiseMod() applies a circular filter over the noise to darken the edges and makes an island
          const noiseMod = (x: number, y: number, fallOff: number, power: number) => {
            const dist = Math.pow(
              Math.pow(x - radius, power) + Math.pow(y - radius, power),
              1 / power
            );
            return dist > fallOff * radius ? 1 - (dist - fallOff * radius) / (radius * 1) : 1;
          };

          let noise =
            this.perlinNoise(x * noiseSize, y * noiseSize, random1, random2)[0] *
            noiseMod(x, y, fallOff, power);

          // let testMod = Math.pow(
          //   Math.pow(x - radius, power) + Math.pow(y - radius, power),
          //   1 / power
          // );
          // if (testMod > fallOff * radius) {
          //   testMod = (testMod - fallOff * radius) / (radius * 1);
          // } else {
          //   testMod = 0;
          // }
          // noise = testMod;

          this.noiseMap[`${x}-${y}`] = noise;
        }
      }
    }

    if (regenerateFlow) {
      console.log("regenerating flow map");
      const e = new Erosion(this.width);
      e.erosionRadius = 3;
      // e.inertia = 0.05;
      let erosion = e.erode(this.noiseMap, this.flowCount / 2, seaLevel);
      e.erosionRadius = 2;
      // e.inertia = 0.001;
      erosion = e.erode(erosion.map, this.flowCount / 2, seaLevel);
      this.totalFlowCount += this.flowCount;
      this.mapArrays.push(erosion.map);
      this.mapArrays.push(structuredClone(this.noiseMap));
      console.log("number of flows:", this.totalFlowCount);

      this.flowMap = erosion.flowMap;
    }

    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        const noise =
          Math.floor(this.mapArrays[this.mapArrayIndex][`${x}-${y}`] * colorLevels) / colorLevels;
        // const noise = this.mapArrays[this.mapArrayIndex][`${x}-${y}`];

        // let color: p5.Color;
        // color = this.s.color("black");
        // color = this.s.color(noise * 255, noise * 255, noise * 255);
        // if (Math.floor(noise * 500) % 25 === 0) {
        //   color = this.s.color("white");
        // }
        // if (noise > 0.8) {
        //   color = this.s.lerpColor(
        //     this.s.color(mountainColorStart),
        //     this.s.color(mountainColorEnd),
        //     noise
        //   );
        // } else if (noise > seaLevel) {
        //   color = this.s.lerpColor(
        //     this.s.color(grassColorStart),
        //     this.s.color(grassColorEnd),
        //     noise
        //   );
        // } else {
        //   color = this.s.lerpColor(
        //     this.s.color(waterColorStart),
        //     this.s.color(waterColorEnd),
        //     noise
        //   );
        // }
        // this.tiles[`${i - this.width / 2}-${j - this.height / 2}`] = {
        //   color,
        //   terrain: "grass",
        //   altitude: 0,
        // };
        this.tiles[`${x}-${y}`] = new Tile(this, { x, y }, [noise, noise, noise], "grass", 0);
      }
    }
  }

  perlinNoise(x: number, y: number, random1: number, random2: number): number[] {
    // let color = [0, 0, 0];
    let color = 0;
    const levels = 1;
    const scale = 0.001;

    // color +=
    //   (this.s?.noise(((x + random1) * scale) / 8, ((y + random1) * scale) / 8) * 2) / (levels + 1);
    for (let i = 0; i < levels; i++) {
      // color += this.s?.noise(x * (scale / (i + 2)), y * (scale / (i + 2)));
      color = Math.min(1, color);
    }
    return [color, color, color];
  }

  zoomIn() {
    // const pixelsPerRow = this.s.width / this.pixelSize;
    // const pixelsPerCol = this.s.height / this.pixelSize;
    // this.x += Math.floor(pixelsPerRow / 4);
    // this.y += Math.floor(pixelsPerCol / 4);
    // this.pixelSize *= 2;
  }

  zoomOut() {
    // const pixelsPerRow = this.s.width / this.pixelSize;
    // const pixelsPerCol = this.s.height / this.pixelSize;
    // this.x += Math.ceil(-pixelsPerRow / 2);
    // this.y += Math.ceil(-pixelsPerCol / 2);
    // this.pixelSize /= 2;
  }

  translate(coords: Coords) {
    this.translation = coords;
  }

  switch() {
    this.mapArrayIndex += 1;
    if (this.mapArrayIndex === this.mapArrays.length) {
      this.mapArrayIndex = 0;
    }
    this.generate();
  }

  toggleFlowMap() {
    this.showFlow = !this.showFlow;
  }

  static remove(object: Interest) {
    (object as Interest).area.interests = (object as Interest).area.interests.filter(
      (interest) => object !== interest
    );
  }
}
