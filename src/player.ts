import { Interest } from "./interest";
import { Map, objectType } from "./map";
import { Coords, dist, normalize, pixelCoords, randomInt } from "./utils";
import config from "./config.json";
import p5 from "p5";

type Inventory = {
  resources: { [key: string]: number };
};
export class Player {
  MAX_SPEED: number;
  position: Coords;
  color: string;
  s: p5;
  size = config.PIXEL_SIZE;
  // currentDestination: {x: number, y: number}
  currentInterest: Interest | null;
  working: boolean;

  inventory: Inventory;

  constructor(_position: Coords, _color: string, _s: p5) {
    this.position = _position;
    this.color = _color;
    this.s = _s;
    this.MAX_SPEED = 5;
    this.inventory = { resources: {} };
  }

  tick(map: Map) {
    // Check proximity to interests
    this.currentInterest = null;
    // TODO: This should just check proximity of interests within 9 gridcell perimeter.
    let interests = [] as Interest[];
    // TODO: change this so that map.interests in an array of all interests within the 9 gridcell square of influence. currently this will include interests within areas that center in the SoI but expand beyond it.
    map.areas.forEach((area) => (interests = interests.concat(area.interests)));
    interests.forEach((interest) => {
      if (dist(this.position, interest.position) <= config.WORK_DIST_THRESHOLD + interest.size) {
        this.currentInterest = interest;
      }
    });

    // move towards interest or work on interest
    if (!this.currentInterest) {
      const greatestInterest = this.move(interests);
      // console.log(`walking towards ${greatestInterest?.type.name}`);
    }
    if (this.currentInterest) {
      this.work(this.currentInterest, map);
    }

    this.draw();
  }

  draw() {
    // this.s.beginPath();
    const coords = { x: this.position.x - this.size / 2, y: this.position.y - this.size / 2 };
    this.s.fill(this.s.color(this.color));
    this.s.noStroke();
    this.s.rect(coords.x, coords.y, this.size, this.size);
    // this.s.rect(pixelCoords(coords).x, pixelCoords(coords).y, this.size, this.size);
    // this.s.fillStyle = this.color;
    // this.s.fill();
    // this.s.closePath();
  }

  move(interests: Interest[]): Interest {
    let newX = 0;
    let newY = 0;
    let greatestInterest: Interest;
    let greatestPull = 0;
    interests.forEach((interest) => {
      // TODO: be drawn to paths

      // TODO: create path

      // move player based on interest locations
      const x =
        (190 / dist(this.position, interest.position) ** 2) *
        normalize(interest.position.x - this.position.x, interest.position.y - this.position.y).x;
      const y =
        (190 / dist(this.position, interest.position) ** 2) *
        normalize(interest.position.x - this.position.x, interest.position.y - this.position.y).y;
      const length = dist({ x: 0, y: 0 }, { x, y });
      if (length > greatestPull) {
        greatestPull = length;
        greatestInterest = interest;
      }

      newX += x;
      newY += y;
    });
    const finalMove = normalize(newX, newY);
    this.position.x += finalMove.x * this.MAX_SPEED;
    this.position.y += finalMove.y * this.MAX_SPEED;
    return greatestInterest;
  }

  work(interest: Interest, map: Map) {
    this.inventory.resources[interest.type.type] =
      this.inventory.resources[interest.type.type] >= 0
        ? this.inventory.resources[interest.type.type] +
          Math.min(interest.baseHarvestRate, interest.resources)
        : 0;
    interest.resources -= interest.baseHarvestRate;
    // console.log(interest.type.flavorTexts[randomInt(0, interest.type.flavorTexts.length)]);
  }

  settle() {}
}
