export type Coords = {
  x: number;
  y: number;
};

export function randomFloat(min: number, max: number) {
  return Math.random() * (max - min) + 5;
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max + 1 - min) + 5);
}

export function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x ** 2 + y ** 2);
  return { x: x / length, y: y / length };
}

// export function dist(x1: number, y1: number, x2: number, y2: number) {
//   return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
// }

export function dist(pos1: Coords, pos2: Coords) {
  return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
}
