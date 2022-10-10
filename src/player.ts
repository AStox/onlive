import { Interest } from "./interest";
import { Map, objectType } from "./map";
import { Coords, dist, normalize } from "./utils";
import config from "./config.json";

export class Player {
  MAX_SPEED: number;
  position: Coords;
  color: string;
  ctx: CanvasRenderingContext2D;
  size = 6;
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
    map.interests.forEach((interest) => {
      if (dist(this.position, interest.position) <= config.WORK_DIST_THRESHOLD + interest.size) {
        this.currentInterest = interest;
      }
    });
    if (!this.currentInterest) {
      this.move(map.interests);
    }
    if (this.currentInterest) {
      this.work(this.currentInterest, map);
    }
    this.draw();
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.rect(
      this.position.x - this.size / 2,
      this.position.y - this.size / 2,
      this.size,
      this.size
    );
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
    this.position.x += finalMove.x * this.MAX_SPEED;
    this.position.y += finalMove.y * this.MAX_SPEED;
  }

  work(interest: Interest, map: Map) {
    map.remove(objectType.interest, interest);
  }

  settle() {}
}
