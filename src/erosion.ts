import p5 from "p5";
import { randomFloat, randomInt } from "./utils";
import config from "./config.json";

interface HeightAndGradient {
  height: number;
  gradientX: number;
  gradientY: number;
}

export interface FlowMap {
  x: number;
  y: number;
  sediment: number;
  color: number;
  depositing: boolean;
}
export class Erosion {
  s: p5;
  seed: number;
  erosionRadius = 5;
  inertia = 0.05; // At zero, water will instantly change direction to flow downhill. At 1, water will never change direction.
  sedimentCapacityFactor = 4; // Multiplier for how much sediment a droplet can carry
  minSedimentCapacity = 0.01; // Used to prevent carry capacity getting too close to zero on flatter terrain
  erodeSpeed = 0.3;
  depositSpeed = 0.3;
  evaporateSpeed = 0.01;
  gravity = 4;
  maxDropletLifetime = 30;

  initialWaterVolume = 1;
  initialSpeed = 1;

  speedMod = 1;
  erosionHeightMod = 0.01;
  maxErode = 0.005;

  // Indices and weights of erosion brush precomputed for every node
  erosionBrushIndices: number[][];
  erosionBrushWeights: number[][];

  currentSeed: number;
  currentErosionRadius: number;
  currentMapSize: number;

  flowMap: FlowMap[][];

  // Initialization creates a System.Random object and precomputes indices and weights of erosion brush
  constructor(_s: p5, mapSize: number) {
    this.s = _s;
    if (
      this.erosionBrushIndices == null ||
      this.currentErosionRadius != this.erosionRadius ||
      this.currentMapSize != mapSize
    ) {
      this.InitializeBrushIndices(mapSize, this.erosionRadius);
      this.currentErosionRadius = this.erosionRadius;
      this.currentMapSize = mapSize;
    }
  }

  erode(map: { [key: string]: number }, numIterations = 1, seaLevel = 0) {
    const mapSize = this.currentMapSize;
    this.flowMap = [];
    for (let iteration = 0; iteration < numIterations; iteration++) {
      // Create water droplet at random point on map
      let posX = randomInt(1, mapSize - 2);
      let posY = randomInt(1, mapSize - 2);
      let dirX = 0;
      let dirY = 0;
      let speed = this.initialSpeed;
      let water = this.initialWaterVolume;
      let sediment = 0;
      this.flowMap[iteration] = [];
      for (let lifetime = 0; lifetime < this.maxDropletLifetime; lifetime++) {
        let nodeX = posX;
        let nodeY = posY;
        let dropletIndex = `${nodeX}-${nodeY}`;
        // Calculate droplet's height and direction of flow with bilinear interpolation of surrounding heights
        let heightAndGradient = this.CalculateHeightAndGradient(map, mapSize, posX, posY);

        // if (heightAndGradient.height < seaLevel) {
        //   break;
        // }

        // Update the droplet's direction and position (move position 1 unit regardless of speed)
        dirX =
          dirX * (this.inertia * speed) - heightAndGradient.gradientX * (1 - this.inertia * speed);
        dirY =
          dirY * (this.inertia * speed) - heightAndGradient.gradientY * (1 - this.inertia * speed);
        // Normalize direction
        let len = Math.sqrt(dirX * dirX + dirY * dirY);
        if (len != 0) {
          dirX /= len;
          dirY /= len;
        }
        posX += dirX * this.speedMod;
        posY += dirY * this.speedMod;

        // Stop simulating droplet if it's not moving or has flowed over edge of map
        if (
          (dirX == 0 && dirY == 0) ||
          posX < 1 ||
          posX >= mapSize - 1 ||
          posY < 1 ||
          posY >= mapSize - 1 ||
          heightAndGradient.height === 0
        ) {
          break;
        }

        // Find the droplet's new height and calculate the deltaHeight
        let newHeight = this.CalculateHeightAndGradient(map, mapSize, posX, posY).height;

        let deltaHeight = newHeight - heightAndGradient.height;

        // Calculate the droplet's sediment capacity (higher when moving fast down a slope and contains lots of water)
        let sedimentCapacity = Math.max(
          -deltaHeight *
            speed *
            water *
            this.sedimentCapacityFactor *
            (heightAndGradient.height - seaLevel),
          this.minSedimentCapacity
        );
        // If carrying more sediment than capacity, or if flowing uphill:
        let newFlow: FlowMap = {
          x: posX,
          y: posY,
          sediment: sediment,
          color: heightAndGradient.height,
          depositing: true,
        };
        if (
          sediment > sedimentCapacity ||
          deltaHeight > 0 ||
          lifetime === this.maxDropletLifetime - 1 ||
          water * 1 - this.evaporateSpeed < 0.01 ||
          newHeight < seaLevel
        ) {
          // if (-deltaHeight < 0.0001) {
          // if (false) {
          // If moving uphill (deltaHeight > 0) try fill up to the current height, otherwise deposit a fraction of the excess sediment
          // let amountToDeposit = Math.min(
          //   (sediment - sedimentCapacity) * this.depositSpeed,
          //   -deltaHeight
          // );
          let amountToDeposit =
            deltaHeight > 0
              ? Math.min(deltaHeight, sediment)
              : (sediment - sedimentCapacity) * this.depositSpeed;

          if (newHeight < seaLevel) {
            amountToDeposit = sediment * this.depositSpeed;
          }
          // if (lifetime === this.maxDropletLifetime - 1) {
          //   amountToDeposit = sediment;
          // }
          sediment -= amountToDeposit;
          // Add the sediment to the four nodes of the current cell using bilinear interpolation
          // Deposition is not distributed over a radius (like erosion) so that it can fill small pits

          // map[`${nodeX}-${nodeY}`] += amountToDeposit * 0.25; //NW SE
          // map[`${nodeX - 1}-${nodeY}`] += amountToDeposit * 0.25; //NE SW
          // map[`${nodeX}-${nodeY - 1}`] += amountToDeposit * 0.25; //SW NE
          // map[`${nodeX - 1}-${nodeY - 1}`] += amountToDeposit * 0.25; // SE NW

          let radius = this.erosionRadius;
          for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
              let sqrDst = x * x + y * y;
              if (sqrDst < radius * radius) {
                let coordX = Math.floor(posX) + x;
                let coordY = Math.floor(posY) + y;

                if (coordX >= 0 && coordX < mapSize && coordY >= 0 && coordY < mapSize) {
                  let weight = 1 - Math.sqrt(sqrDst) / radius || 0;
                  const offset = `${coordX}-${coordY}`;
                  // Use erosion brush to erode from all nodes inside the droplet's erosion radius
                  // (1 / (2 * (radius - 0.3333333333333333))) is used to normalize the amount eroded/deposited to 1;
                  let deltaSediment =
                    amountToDeposit * weight * (1 / (2 * (radius - 0.3333333333333333)));

                  map[offset] =
                    map[offset] + deltaSediment > map[dropletIndex] + amountToDeposit
                      ? map[offset]
                      : map[offset] + deltaSediment;

                  sediment -= Math.max(deltaSediment, 0);
                }
              }
            }
          }
        } else {
          // Erode a fraction of the droplet's current carry capacity.
          // Clamp the erosion to the change in height so that it doesn't dig a hole in the terrain behind the droplet
          newFlow.depositing = false;

          let amountToErode = Math.min(
            Math.min(
              (sedimentCapacity - sediment) * this.erodeSpeed,
              -deltaHeight * this.erosionHeightMod
            ),
            this.maxErode * newHeight
          );
          if (config.DEBUG) {
            console.log("sedimentCapacity", sedimentCapacity);
            console.log("sediment", sediment);
            console.log(this.erodeSpeed);
          }
          let radius = this.erosionRadius;
          for (let y = -radius; y <= radius; y++) {
            for (let x = -radius; x <= radius; x++) {
              let sqrDst = x * x + y * y;
              if (sqrDst < radius * radius) {
                let coordX = Math.floor(posX) + x;
                let coordY = Math.floor(posY) + y;

                if (coordX >= 0 && coordX < mapSize && coordY >= 0 && coordY < mapSize) {
                  let weight = 1 - Math.sqrt(sqrDst) / radius || 0;
                  const offset = `${coordX}-${coordY}`;
                  // Use erosion brush to erode from all nodes inside the droplet's erosion radius
                  // (1 / (2 * (radius - 0.3333333333333333))) is used to normalize the amount eroded/deposited to 1;
                  let deltaSediment =
                    amountToErode * weight * (1 / (2 * (radius - 0.3333333333333333)));
                  // map[offset] < amountToErode * weight ? map[offset] : amountToErode * weight;
                  if (config.DEBUG) {
                    console.log(`coordX: ${coordX}, coordY: ${coordY}`);
                    console.log("amountToErode", amountToErode);
                    console.log("weight", weight);
                    console.log("deltaSediment", deltaSediment);
                  }
                  map[offset] -= deltaSediment;
                  sediment += deltaSediment;
                }
              }
            }
          }
        }

        this.flowMap[iteration][lifetime] = newFlow;

        // Update droplet's speed and water content
        if (config.DEBUG) {
          console.log("-----speed calcs------");
          console.log("speed", speed);
          console.log("deltaHeight", deltaHeight);
          console.log("this.gravity", this.gravity);
        }
        speed = Math.sqrt(speed * speed + Math.abs(deltaHeight) * this.gravity);
        if (config.DEBUG) console.log("speed", speed);
        water *= 1 - this.evaporateSpeed;
      }
    }
    return { map: map, flowMap: this.flowMap };
  }

  CalculateHeightAndGradient(
    nodes: { [key: string]: number },
    mapSize: number,
    posX: number,
    posY: number
  ) {
    let coordX = posX;
    let coordY = posY;

    // Calculate droplet's offset inside the cell (0,0) = at NW node, (1,1) = at SE node
    let x = posX - coordX;
    let y = posY - coordY;

    // Calculate heights of the four nodes of the droplet's cell
    let heightSE = nodes[`${Math.floor(coordX) + 1}-${Math.floor(coordY) + 1}`];
    let heightSW = nodes[`${Math.floor(coordX) - 1}-${Math.floor(coordY) + 1}`];
    let heightNE = nodes[`${Math.floor(coordX) + 1}-${Math.floor(coordY) - 1}`];
    let heightNW = nodes[`${Math.floor(coordX) - 1}-${Math.floor(coordY) - 1}`];
    if (config.DEBUG) {
      console.log("SE", `${Math.floor(coordX) + 1}-${Math.floor(coordY) + 1}`);
      console.log("SW", `${Math.floor(coordX) - 1}-${Math.floor(coordY) + 1}`);
      console.log("NE", `${Math.floor(coordX) + 1}-${Math.floor(coordY) - 1}`);
      console.log("NW", `${Math.floor(coordX) - 1}-${Math.floor(coordY) - 1}`);
      console.log("coordX", coordX);
      console.log("coordY", coordY);
      console.log("heightNW", heightNW);
      console.log("heightNE", heightNE);
      console.log("heightSW", heightSW);
      console.log("heightSE", heightSE);
    }

    // Calculate droplet's direction of flow with bilinear interpolation of height difference along the edges
    let gradientX = (heightNE - heightNW) * 0.5 + (heightSE - heightSW) * 0.5;
    let gradientY = (heightSW - heightNW) * 0.5 + (heightSE - heightNE) * 0.5;

    // Calculate height with bilinear interpolation of the heights of the nodes of the cell
    let height = (heightSE + heightSW + heightNE + heightNW) / 4;
    let output: HeightAndGradient = { height: height, gradientX: gradientX, gradientY: gradientY };
    return output;
  }

  InitializeBrushIndices(mapSize: number, radius: number) {
    this.erosionBrushIndices = Array(mapSize * mapSize);
    this.erosionBrushWeights = Array(mapSize * mapSize);

    let xOffsets = Array(radius * radius * 4);
    let yOffsets = Array(radius * radius * 4);
    let weights = Array(radius * radius * 4);
    let weightSum = 0;
    let addIndex = 0;

    for (let i = 0; i < this.erosionBrushIndices.length; i++) {
      let centreX = i % mapSize;
      let centreY = i / mapSize;

      if (
        centreY <= radius ||
        centreY >= mapSize - radius ||
        centreX <= radius + 1 ||
        centreX >= mapSize - radius
      ) {
        weightSum = 0;
        addIndex = 0;
        for (let y = -radius; y <= radius; y++) {
          for (let x = -radius; x <= radius; x++) {
            let sqrDst = x * x + y * y;
            if (sqrDst < radius * radius) {
              let coordX = centreX + x;
              let coordY = centreY + y;

              if (coordX >= 0 && coordX < mapSize && coordY >= 0 && coordY < mapSize) {
                let weight = 1 - Math.sqrt(sqrDst) / radius;
                weightSum += weight;
                weights[addIndex] = weight;
                xOffsets[addIndex] = x;
                yOffsets[addIndex] = y;
                addIndex++;
              }
            }
          }
        }
      }

      let numEntries = addIndex;
      this.erosionBrushIndices[i] = Array(numEntries);
      this.erosionBrushWeights[i] = Array(numEntries);

      for (let j = 0; j < numEntries; j++) {
        this.erosionBrushIndices[i][j] = (yOffsets[j] + centreY) * mapSize + xOffsets[j] + centreX;
        this.erosionBrushWeights[i][j] = weights[j] / weightSum;
      }
    }
  }
}
