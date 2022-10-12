import config from "./config.json";

export type Coords = {
  x: number;
  y: number;
};

export function pixelCoords(point: Coords) {
  const pixelSize = config.PIXEL_SIZE;
  const size = 100;
  const screenSize = 500;
  console.log(
    point.x,
    point.x / screenSize,
    point.x / (screenSize / size),
    Math.floor(point.x / (screenSize / size)),
    Math.floor(point.x / (screenSize / size)) * (screenSize / size)
  );
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
