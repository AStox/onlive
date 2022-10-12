import { Interest } from "./interest";
import { Map, objectType } from "./map";
import { Coords, dist, normalize, pixelCoords } from "./utils";
import config from "./config.json";

export class Player {
  MAX_SPEED: number;
  position: Coords;
  color: string;
  ctx: CanvasRenderingContext2D;
  size = config.PIXEL_SIZE;
  // currentDestination: {x: number, y: number}
  currentInterest: Interest | null;
  working: boolean;

  constructor(_position: Coords, _color: string, _ctx: CanvasRenderingContext2D) {
    this.position = _position;
    this.color = _color;
    this.ctx = _ctx;
    this.MAX_SPEED = 5;
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
    if (!this.currentInterest) {
      this.move(interests);
    }
    if (this.currentInterest) {
      this.work(this.currentInterest, map);
    }
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

  move(interests: Interest[]) {
    let newX = 0;
    let newY = 0;
    interests.forEach((interest) => {
      // TODO: be drawn to paths

      // TODO: create path

      // move player based on interest locations
      newX +=
        (190 / dist(this.position, interest.position) ** 2) *
        normalize(interest.position.x - this.position.x, interest.position.y - this.position.y).x;
      newY +=
        (190 / dist(this.position, interest.position) ** 2) *
        normalize(interest.position.x - this.position.x, interest.position.y - this.position.y).y;
    });
    const finalMove = normalize(newX, newY);
    // console.log(finalMoves);
    // if (newX && newY) {
    this.position.x += finalMove.x * this.MAX_SPEED;
    this.position.y += finalMove.y * this.MAX_SPEED;
    // }
  }

  work(interest: Interest, map: Map) {
    map.remove(objectType.interest, interest);
  }

  settle() {}
}
