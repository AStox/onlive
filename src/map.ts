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

  generate() {
    const noiseSize = 1;

    const perlin = new PerlinNoise();
    for (let y = 0; y < this.width; y += 1) {
      for (let x = 0; x < this.height; x += 1) {
        let noise = perlin.noise(x, y, config.MAP_SIZE);
        this.map[y * this.width + x] = new Tile(noise);
      }
    }

    // const e = new Erosion(this.width);

    // e.erosionRadius = 3;
    // let erosion = e.erode(this.map, this.flowCount / 2, seaLevel);

    // e.erosionRadius = 2;
    // erosion = e.erode(erosion.map, this.flowCount / 2, seaLevel);

    // for (let y = 0; y < this.width; y++) {
    //   for (let x = 0; x < this.height; x++) {
    //     const noise = this.map[y * this.width + x];
    //   }
    // }
  }

  // perlinNoise(x: number, y: number, random1: number, random2: number): number[] {
  //   // let color = [0, 0, 0];
  //   let color = 0;
  //   const levels = 2;
  //   // const scale = 0.001;

  //   // color +=
  //   //   (this.s?.noise(((x + random1) * scale) / 8, ((y + random1) * scale) / 8) * 2) / (levels + 1);
  //   for (let i = 0; i < levels; i++) {
  //     // color += this.s?.noise(x * (scale / (i + 2)), y * (scale / (i + 2)));
  //     color = Math.min(1, color);
  //   }
  //   return [color, color, color];
  // }

  // noiseMod() applies a circular filter over the noise to darken the edges and makes an island
  noiseMod(x: number, y: number, fallOff: number, power: number, radius: number) {
    const dist = Math.pow(Math.pow(x - radius, power) + Math.pow(y - radius, power), 1 / power);
    return dist > fallOff * radius ? 1 - (dist - fallOff * radius) / (radius * 1) : 1;
  }
}

// // Create a PerlinNoise class
// class PerlinNoise {
//   // Initialize an empty array to store random numbers
//   private randomNumbers: number[] = [];
//   width: number;
//   height: number;

//   constructor() {
//     this.width = config.MAP_SIZE;
//     this.height = config.MAP_SIZE;
//   }

//   // Define a random() function that generates random numbers
//   random(x: number, y: number): number {
//     // Convert the input coordinates to integers
//     x = Math.floor(x);
//     y = Math.floor(y);

//     // Calculate the 1D array index for the given coordinates
//     var index = x + y * this.width;

//     // Check if a random number has already been generated for the given coordinates
//     if (this.randomNumbers[index]) {
//       // Return the previously generated random number
//       return this.randomNumbers[index];
//     } else {
//       // Generate a new random number and store it in the array
//       this.randomNumbers[index] = Math.random();
//       return this.randomNumbers[index];
//     }
//   }

//   // Define a noise() function that calculates the Perlin noise value for a given point
//   noise(x: number, y: number, scalingFactor: number): number {
//     // Calculate the integer coordinates of the input point, scaled by the scaling factor
//     var x0 = Math.floor(x * scalingFactor);
//     var y0 = Math.floor(y * scalingFactor);

//     // Calculate the decimal part of the input coordinates, scaled by the scaling factor
//     var dx = x * scalingFactor - x0;
//     var dy = y * scalingFactor - y0;

//     // Generate random numbers for the eight points that surround the input point
//     var n00 = this.random(x0, y0);
//     var n10 = this.random(x0 + 1, y0);
//     var n01 = this.random(x0, y0 + 1);
//     var n11 = this.random(x0 + 1, y0 + 1);

//     // Interpolate the noise value for the input point
//     var i1 = this.interpolate(n00, n10, dx);
//     var i2 = this.interpolate(n01, n11, dx);
//     var n0 = this.interpolate(i1, i2, dy);

//     // // Combine multiple octaves of noise together
//     // var n = this.octave(x, y, 8);

//     // Return the combined noise value
//     return n0;
//   }

//   // Define an octave() function that combines multiple octaves of noise
//   octave(x: number, y: number, octaves: number): number {
//     // Set the initial noise value to 0
//     var n = 0;

//     // Set the initial scaling factor to 1
//     var scalingFactor = 1;

//     // Set the initial weighting factor to 1
//     var weightingFactor = 1;

//     // Loop through each octave of noise
//     for (var i = 0; i < octaves; i++) {
//       // Calculate the noise value for the current octave, scaled by the scaling factor
//       var octaveNoise = this.noise(x, y, scalingFactor) * weightingFactor;

//       // Add the octave noise value to the total noise value
//       n += octaveNoise;

//       // Increase the scaling factor for the next octave
//       scalingFactor *= 2;

//       // Decrease the weighting factor for the next octave
//       weightingFactor /= 2;
//     }

//     // Return the combined noise value
//     return n;
//   }

//   // Define an interpolate() function that performs linear interpolation
//   interpolate(a: number, b: number, x: number): number {
//     return a * (1 - x) + b * x;
//   }
// }

export class PerlinNoise {
  gradients: { [key: string]: { x: number; y: number } };
  nodesize: number;

  constructor() {
    this.gradients = {};
  }

  getOrCreateGradient(x: number, y: number) {
    let key = `${x}-${y}`;
    if (!this.gradients[key]?.x) {
      this.gradients[key] = this.random_unit_vector();
    }
    return this.gradients[key];
  }

  noise(x: number, y: number, nodeSize: number) {
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
    let value = (this.interp(dy, top, bottom) + 1) / 2;
    return value;
  }

  random_unit_vector() {
    let theta = Math.random() * 2 * Math.PI;
    return { x: Math.cos(theta), y: Math.sin(theta) };
  }

  dot_prod_grid(x: number, y: number, vert_x: number, vert_y: number) {
    // console.log("vert_xx", vert_x);
    // console.log("vert_yy", vert_y);
    var g_vect = this.getOrCreateGradient(x, y);
    var d_vect = { x: x - vert_x, y: y - vert_y };
    let g_length = Math.sqrt(g_vect.x ** 2 + g_vect.y ** 2);
    let d_length = Math.sqrt(d_vect.x ** 2 + d_vect.y ** 2);
    let value = d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    let normalized = value / (g_length * d_length);
    return normalized;
  }

  smootherstep(x: number) {
    return 6 * x ** 5 - 15 * x ** 4 + 10 * x ** 3;
  }
  interp(x: number, a: number, b: number) {
    return a + this.smootherstep(x) * (b - a);
  }
}
