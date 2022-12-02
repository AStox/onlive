import p5 from "p5";
import config from "./config.json";

export type Coords = {
  x: number;
  y: number;
};

export function pixelCoords(point: Coords) {
  const pixelSize = config.PIXEL_SIZE;
  const size = 100;
  const screenSize = 500;
  let x = Math.floor(point.x / (screenSize / size)) * (screenSize / size);
  let y = (Math.floor(point.y / (screenSize / size)) * screenSize) / size;
  x = Math.floor(point.x / pixelSize) * pixelSize;
  y = Math.floor(point.y / pixelSize) * pixelSize;
  return { x, y } as Coords;
  // 5.5/10 => floor(0.55)
  // floor(5.5) => 5/10

  // floor(55.2) => 55/100
  // 55.2/(size/10) => floor(5.52) => 55/100
}

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + 5;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function normalize(x: number, y: number): { x: number; y: number } {
  if (x === 0 && y === 0) {
    return { x: 0, y: 0 };
  }
  const length = Math.sqrt(x ** 2 + y ** 2);
  return { x: x / length, y: y / length };
}

// export function dist(x1: number, y1: number, x2: number, y2: number) {
//   return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
// }

export function dist(pos1: Coords, pos2: Coords) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
}

/* Following canvas-based Perlin generation code originates from
 * iron_wallaby's code at: http://www.ozoneasylum.com/30982
 */
export function randomNoise(x: number, y: number, width: number, height: number, alpha: number) {
  x = x || 0;
  y = y || 0;
  width = width;
  height = height;
  alpha = alpha;
  const canvas = document.getElementById("noise") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(x, y, width, height);
  const random = Math.random;
  const pixels = imageData.data;
  const n = pixels.length;
  let i = 0;
  while (i < n) {
    pixels[i++] = pixels[i++] = pixels[i++] = (random() * 256) | 0;
    pixels[i++] = alpha;
  }
  ctx.putImageData(imageData, x, y);
  return canvas;
}

export function perlinNoise(
  ctx: CanvasRenderingContext2D,
  noise: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  alpha: number,
  startSize: number
) {
  noise = noise || randomNoise(x, y, width, height, alpha);
  ctx.save();

  /* Scale random iterations onto the canvas to generate Perlin noise. */
  for (let size = startSize; size <= width; size *= 2) {
    // let x = (Math.random() * (width - size)) | 0,
    // y = (Math.random() * (height - size)) | 0;
    ctx.globalAlpha = startSize / size;
    ctx.drawImage(noise, x, y, size, size, -width / 2, -height / 2, width, height);
  }

  ctx.restore();
  // return canvas;
}

export function transformPoint(point: Coords, matrix: DOMMatrix, flip = false) {
  const mod = flip ? -1 : 1;
  return {
    x: (1 / matrix.a) * point.x + matrix.c * point.y + matrix.e * mod,
    y: matrix.b * point.x + (1 / matrix.d) * point.y + matrix.f * mod,
  };
}

export function translatePoint(point: Coords, matrix: DOMMatrix, flip = false) {
  const mod = flip ? -1 : 1;
  return {
    x: point.x + matrix.e * mod,
    y: point.y + matrix.f * mod,
  };
}

export function scalePoint(point: Coords, matrix: DOMMatrix, flip = false) {
  return flip
    ? {
        x: (1 / matrix.a) * point.x,
        y: (1 / matrix.d) * point.y,
      }
    : {
        x: matrix.a * point.x,
        y: matrix.d * point.y,
      };
}

export function currentPixelSize(ctx: CanvasRenderingContext2D) {
  const t = ctx.getTransform();
  const pixelSize = scalePoint({ x: config.PIXEL_SIZE, y: config.PIXEL_SIZE }, t).x;
  return pixelSize;
}

export function grey(s: p5, num: number) {
  return s.color(num, num, num);
}

export function readFile(file: string) {
  let rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status == 0) {
        var allText = rawFile.responseText;
        alert(allText);
      }
    }
  };
  rawFile.send(null);
}
