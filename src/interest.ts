// import { Coords, pixelCoords } from "./utils";
// import { Map } from "./map";
// import { Area } from "./area";
// import config from "./config.json";
// import { Resource, resourceTypes } from "./resource";

// export type InterestType = {
//   type: string;
//   name: string;
//   color: string;
//   resource: Resource;
//   flavorTexts: string[];
// };

// export const interestTypes: { [key: string]: InterestType } = {
//   tree: {
//     type: "TREE",
//     name: "Tree",
//     color: "#1B998B",
//     resource: resourceTypes.wood,
//     flavorTexts: [
//       "chopped log",
//       "gathered sticks",
//       "snapped a branch into smaller pieces",
//       "felled a tree",
//     ],
//   },
//   berryBush: {
//     type: "BERRY_BUSH",
//     name: "Berry Bush",
//     color: "#EE2E31",
//     resource: resourceTypes.berry,
//     flavorTexts: [
//       "picked black berries",
//       "gorged on blue berries",
//       "ate a handful of wild berries",
//       "ate strawberry berries they found",
//     ],
//   },
//   stone: {
//     type: "STONE",
//     name: "Stone",
//     color: "#809BCE",
//     resource: resourceTypes.stone,
//     flavorTexts: [
//       "gathered stones",
//       "looked at some nice rocks",
//       "picked up an interesting rock and put it in their satchel",
//       "threw a rock and a larger rock",
//     ],
//   },
//   vegetable: {
//     type: "VEGETABLE",
//     name: "vegetable",
//     color: "#9381FF",
//     resource: resourceTypes.vegetable,
//     flavorTexts: [
//       "uprooted a wild yam",
//       "found a wild carrot",
//       "tried eating a scrawny turnip",
//       "dug up some wild potatoes",
//     ],
//   },
//   herb: {
//     type: "HERB",
//     name: "herb",
//     color: "#5B8E7D",
//     resource: resourceTypes.herb,
//     flavorTexts: [
//       "picked some strong smelling leaves",
//       "stuffed a handful of pretty leaves in their satchel",
//       "carefully plucked some wild herbs",
//       "grabbed some dusty plants. Could be useful?",
//     ],
//   },
// };

// export class Interest {
//   // Basics
//   ctx: CanvasRenderingContext2D;
//   position: Coords;
//   color: string;
//   weight: number;
//   area: Area;
//   size = config.PIXEL_SIZE;
//   type: InterestType;

//   //  Resources
//   resources: number;
//   growthRate: number;
//   maxResources: number;
//   baseHarvestRate: number;
//   shouldGrow: boolean;

//   constructor(
//     _ctx: CanvasRenderingContext2D,
//     _position: Coords,
//     _color: string,
//     _weight: number,
//     _type: InterestType,
//     _area: Area,
//     _resources = 1,
//     _growthRate = 1,
//     _maxResources = 500,
//     _baseHarvestRate = 20,
//     _shouldGrow = true
//   ) {
//     this.position = _position;
//     this.color = _color;
//     this.weight = _weight;
//     this.ctx = _ctx;
//     this.type = _type;
//     this.area = _area;
//     this.resources = _resources;
//     this.growthRate = _growthRate;
//     this.maxResources = _maxResources;
//     this.baseHarvestRate = _baseHarvestRate;
//     this.shouldGrow = _shouldGrow;
//   }

//   static randomInterestType() {
//     const enumValues = Object.keys(interestTypes);
//     const randomIndex = Math.floor(Math.random() * enumValues.length);
//     const randomEnumValue = enumValues[randomIndex];
//     return interestTypes[randomEnumValue];
//   }

//   tick() {
//     if (this.resources <= 0) {
//       this.kill();
//     }
//     this.grow();
//     this.draw();
//   }

//   draw() {
//     this.ctx.beginPath();
//     const coords = { x: this.position.x - this.size / 2, y: this.position.y - this.size / 2 };
//     this.ctx.rect(pixelCoords(coords).x, pixelCoords(coords).y, this.size, this.size);
//     this.ctx.fillStyle = this.color;
//     this.ctx.fill();
//     this.ctx.closePath();
//   }

//   grow() {
//     if (this.shouldGrow) {
//       this.resources += this.growthRate;
//     }
//   }

//   kill() {
//     Map.remove(this);
//   }
// }
