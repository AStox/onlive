import { randomInt } from "./utils";
import config from "./config.json";
import { Erosion, FlowMap } from "./erosion";

export enum objectType {
  player = "PLAYER",
  interest = "INTEREST",
}

export class Tile {
  elevation: number;
  moisture: number;
  temperature: number;
  terrain: string;

  constructor(_elevation: number) {
    this.elevation = _elevation;
    this.moisture = 0;
    this.temperature = 0;
    this.terrain = "GRASS";
  }
}
export class TerrainMap {
  x: number;
  y: number;
  height: number;
  width: number;
  pixelSize: number;
  map: Tile[];
  flowCount =
    config.EROSION_SIM_COUNT > 0
      ? config.EROSION_SIM_COUNT
      : config.EROSION_SIM_COUNT_MOD * config.MAP_SIZE;

  constructor(_x: number, _y: number, _height: number, _width: number) {
    this.x = _x;
    this.y = _y;
    this.height = _height;
    this.width = _width;
    this.pixelSize = config.PIXEL_SIZE;
    this.map = [];
    this.generate();
  }

  normalize(max: number, min: number, value: number) {
    return (value - min) / (max - min);
  }

  generate() {
    const perlin = new PerlinNoise();
    let max = 0;
    let min = 0;
    for (let y = 0; y < this.width; y += 1) {
      for (let x = 0; x < this.height; x += 1) {
        let noise = perlin.noise(x, y, config.MAP_SIZE / 2, 8, 2, 0.75);
        // let noise = (Noise2D(x * 0.1, y * 0.1) + 1) / 2;
        if (noise > max) {
          max = noise;
        } else if (noise < min) {
          min = noise;
        }
        this.map[y * this.width + x] = new Tile(noise);
      }
    }
    for (let y = 0; y < this.width; y++) {
      for (let x = 0; x < this.height; x++) {
        const noise = this.map[y * this.width + x].elevation;
        this.map[y * this.width + x].elevation = this.normalize(max, min, noise);
      }
    }
    // console.log("length", this.map.length);

    // const e = new Erosion(this.width);

    // const seaLevel = 0.1;
    // e.erosionRadius = 10;
    // let erosion = e.erode(this.map, this.flowCount, seaLevel);

    // e.erosionRadius = 2;
    // erosion = e.erode(erosion.map, this.flowCount / 2, seaLevel);
  }

  // noiseMod() applies a circular filter over the noise to darken the edges and makes an island
  noiseMod(x: number, y: number, fallOff: number, power: number, radius: number) {
    const dist = Math.pow(Math.pow(x - radius, power) + Math.pow(y - radius, power), 1 / power);
    return dist > fallOff * radius ? 1 - (dist - fallOff * radius) / (radius * 1) : 1;
  }
}

export class PerlinNoise {
  gradients: { [key: string]: { x: number; y: number } };
  nodesize: number;
  lacunarity: number; // how much the nodeSize increases each octave
  persistence: number; // how much the amplitude decreases each octave

  constructor() {
    this.gradients = {};
  }

  noise(
    x: number,
    y: number,
    nodeSize: number,
    octaves: number,
    lacunarity: number,
    persistence: number
  ) {
    let value = 0;
    for (let i = 0; i < octaves; i++) {
      value += this.octave(x, y, nodeSize / Math.pow(lacunarity, i)) * Math.pow(persistence, i + 1);
    }
    return value;
  }

  octave(x: number, y: number, nodeSize: number) {
    this.nodesize = nodeSize;
    let x0 = x - (x % nodeSize);
    let x1 = x0 + nodeSize;
    let y0 = y - (y % nodeSize);
    let y1 = y0 + nodeSize;
    let dx = (x - x0) / nodeSize;
    let dy = (y - y0) / nodeSize;
    let d00 = this.dot_prod_grid(x0, y0, x, y);
    let d10 = this.dot_prod_grid(x1, y0, x, y);
    let d01 = this.dot_prod_grid(x0, y1, x, y);
    let d11 = this.dot_prod_grid(x1, y1, x, y);

    let top = this.interp(dx, d00, d10);
    let bottom = this.interp(dx, d01, d11);
    let value = this.interp(dy, top, bottom);
    return value;
  }

  random_unit_vector() {
    return { x: (-1) ** randomInt(1, 10), y: (-1) ** randomInt(1, 10) };
  }

  getOrCreateGradient(x: number, y: number) {
    let key = `${x}-${y}`;
    if (!this.gradients[key]?.x) {
      this.gradients[key] = this.random_unit_vector();
    }
    return this.gradients[key];
  }

  dot_prod_grid(x: number, y: number, vert_x: number, vert_y: number) {
    let g_vect = this.getOrCreateGradient(x, y);
    let d_vect = { x: x - vert_x, y: y - vert_y };
    let value = d_vect.x * g_vect.x + d_vect.y * g_vect.y;

    return value;
  }

  smootherstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }
  interp(x: number, a: number, b: number) {
    return a + this.smootherstep(x) * (b - a);
  }
}
