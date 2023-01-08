precision highp float;

#define PI 3.1415926535897932384626433832795
#define maxDropletLifetime 30

varying vec2 vUv;

float seaLevel = 0.1;
float erosionRadius = 5.0;
float inertia = 0.01;
float sedimentCapacityFactor = 4.0;
float minSedimentCapacity = 0.01;
float erodeSpeed = 1.3;
float depositSpeed = 0.3;
float evaporateSpeed = 0.01;
float gravity = 4.0;
float initialWaterVolume = 1.0;
float initialSpeed = 1.0;
float erosionHeightMod = 0.01;
uniform sampler2D noiseTexture;
uniform sampler2D flowTexture;
uniform vec2 mapSize;
uniform vec2 u_resolution;
uniform vec2 randomPos;
uniform int u_debug;

// Function to calculate the height and gradient of a point on the map
// using bilinear interpolation of the surrounding heights
vec4 CalculateHeightAndGradient(sampler2D noiseTexture, vec2 mapSize, float posX, float posY) {
  // Calculate the indices of the surrounding heights
  float x0 = posX;
  float y0 = posY;
  float x1 = x0 + 5.0 / u_resolution.x;
  float y1 = y0 + 5.0 / u_resolution.y;

  // Clamp the indices to the edge of the map
  x0 = clamp(x0, 0.0, u_resolution.x - 0.001);
  y0 = clamp(y0, 0.0, u_resolution.y - 0.001);
  x1 = clamp(x1, 0.0, u_resolution.x - 0.001);
  y1 = clamp(y1, 0.0, u_resolution.y - 0.001);

  // Calculate the heights of the surrounding points
  float h00 = texture2D(noiseTexture, vec2(x0,y0)).r;
  float h01 = texture2D(noiseTexture, vec2(x0,y1)).r;
  float h10 = texture2D(noiseTexture, vec2(x1,y0)).r;
  float h11 = texture2D(noiseTexture, vec2(x1,y1)).r;

  // Calculate the weights for the surrounding heights
  float x = posX - float(x0);
  float y = posY - float(y0);
  float w00 = (1.0 - x) * (1.0 - y);
  float w01 = (1.0 - x) * y;
  float w10 = x * (1.0 - y);
  float w11 = x * y;

  // Interpolate the height and gradient using the weights
  float height = h00 * w00 + h01 * w01 + h10 * w10 + h11 * w11;
  float gradientX = (h00 * (1.0 - y) + h01 * y - h10 * (1.0 - y) - h11 * y) / mapSize.x;
  float gradientY = (h00 * (1.0 - x) + h10 * x - h01 * (1.0 - x) - h11 * x) / mapSize.y;

  return vec4(height, gradientX, gradientY, 1.0);
}

float dist(vec2 vect1, vec2 vect2) {
    return sqrt(pow(vect2.x - vect1.x, 2.0) + pow(vect2.y - vect1.y, 2.0));
}

void main() {
    // Set the output color to black
    vec4 color = vec4(0.0,0.0,0.0,1.0);
    // color = vec4(gl_FragCoord.xy / u_resolution, 0.0, 1.0);

    // Loop over the specified number of iterations
    // Create water droplet at random point on map
    // if randomPos is negative, use the colour of 0,0 as the position
    float startX = 0.0;
    float startY = 0.0;
    if (randomPos.x < 0.0 ) {
        startX = texture2D(flowTexture, vec2(0.0,0.0)).r;
        startY = texture2D(flowTexture, vec2(0.0,0.0)).g;
    } else {
        startX = randomPos.x / u_resolution.x;
        startY = randomPos.y / u_resolution.y;
    }
    float posX = startX;
    float posY = startY;

    float dirX = 0.0;
    float dirY = 0.0;
    float speed = initialSpeed;
    float water = initialWaterVolume;
    float sediment = 0.0;

    // Loop over the lifetime of the droplet
    // for (int lifetime = 0; lifetime < maxDropletLifetime; lifetime++) {
        // int nodeX = int(posX);
        // int nodeY = int(posY);
        // int dropletIndex = nodeX + nodeY * int(mapSize.x);

        // Calculate droplet's height and direction of flow with bilinear interpolation of surrounding heights
        vec4 heightAndGradient = CalculateHeightAndGradient(noiseTexture, mapSize, posX, posY);
        float height = heightAndGradient.x;
        float gradientX = heightAndGradient.y;
        float gradientY = heightAndGradient.z;

        // Update the droplet's direction and position (move position 1 unit regardless of speed)
        dirX = dirX * (inertia * speed) - gradientX * (1.0 - inertia * speed);
        dirY = dirY * (inertia * speed) - gradientY * (1.0 - inertia * speed);

        // Normalize direction
        float len = sqrt(dirX * dirX + dirY * dirY);
        if (len != 0.0) {
            dirX = (dirX * 5.0) / (len * u_resolution.x);
            dirY = (dirY * 5.0) / (len * u_resolution.y);
        }
        posX += dirX;
        posY += dirY;

        // Stop simulating droplet if it's not moving or has flowed over edge of map
        // if ((dirX == 0.0 && dirY == 0.0) || posX < 0.0 || posX > u_resolution.x - 1.0 || posY < 0.0 || posY > u_resolution.y - 1.0) {
        // if pos
        //     break;
        // }
        

        // Calculate the droplet's carrying capacity
        float sedimentCapacity = max(water * sedimentCapacityFactor, minSedimentCapacity);

        // Calculate the amount of sediment that the droplet will pick up or drop off
        float deltaSediment = 0.0;
        if (height < seaLevel) {
            // Droplet is in water, so it picks up sediment
            deltaSediment = (sedimentCapacity - sediment) * erodeSpeed;
            deltaSediment = min(deltaSediment, (seaLevel - height) * sedimentCapacity * erosionHeightMod);
            sediment += deltaSediment;
        } else {
            // Droplet is not in water, so it drops off sediment
            deltaSediment = sediment * depositSpeed;
            sediment -= deltaSediment;
        }

        // Update the height of the current node based on the sediment being picked up or dropped off
        float deltaHeight = deltaSediment * (water / sedimentCapacity);
        height += deltaHeight;

        // Update the water volume of the droplet
        water -= deltaSediment * (1.0 / sedimentCapacity);

        // Evaporate some of the water from the droplet
        water *= (1.0 - evaporateSpeed);

        // Increase the speed of the droplet based on the slope of the terrain
        speed += sqrt(gradientX * gradientX + gradientY * gradientY) * gravity * water * sedimentCapacity;

        // Update the output color to show the height of the current node
        // if (gl_FragCoord.x == startX && gl_FragCoord.y == startY) { 
        if (dist(gl_FragCoord.xy / u_resolution, vec2(startX, startY)) < 0.1) {
            vec2 uv = (gl_FragCoord.xy / u_resolution);
            color = texture2D(noiseTexture, uv);
        } else {
            color = vec4(posX, posY, 0.0, 1.0);
        }
        // color = vec4(startX, startY, 0, 1.0);
    // }

    if (u_debug > 0) {
        float x0 = posX;
        float y0 = posY;
        float x1 = x0 + 5.0 / u_resolution.x;
        float y1 = y0 + 5.0 / u_resolution.y;

        // Clamp the indices to the edge of the map
        // x0 = clamp(x0, 0.0, u_resolution.x - 0.001);
        // y0 = clamp(y0, 0.0, u_resolution.y - 0.001);
        // x1 = clamp(x1, 0.0, u_resolution.x - 0.001);
        // y1 = clamp(y1, 0.0, u_resolution.y - 0.001);

        // Calculate the heights of the surrounding points
        vec2 uv = (gl_FragCoord.xy / u_resolution);
        color = texture2D(noiseTexture, uv);

        if (dist(gl_FragCoord.xy / u_resolution, vec2(startX, startY)) < 0.1) {
            float h00 = texture2D(noiseTexture, vec2(x0,y0)).r;
            float h01 = texture2D(noiseTexture, vec2(x0,y1)).r;
            float h10 = texture2D(noiseTexture, vec2(x1,y0)).r;
            float h11 = texture2D(noiseTexture, vec2(x1,y1)).r;

            // draw the four quadrants being used for gradient calculation
            if ((gl_FragCoord.xy / u_resolution).x > startX) {
                if ((gl_FragCoord.xy / u_resolution).y > startY) {
                    color = vec4(h11, h11, h11, 1.0);
                } else {
                    color = vec4(h01, h01, h01, 1.0);
                }
            } else {
                if ((gl_FragCoord.xy / u_resolution).y > startY) {
                    color = vec4(h10, h10, h10, 1.0);
                } else {
                    color = vec4(h00, h00, h00, 1.0);
                }
            }
        }
        if ((gl_FragCoord.xy / u_resolution).x < 0.1 && (gl_FragCoord.xy / u_resolution).y < 0.1) {
            if (gradientX == 0.0) {
                color = vec4(1.0, 0.0, 0.0, 1.0);
            }
        }
        if ((gl_FragCoord.xy / u_resolution).x < 0.2 && (gl_FragCoord.xy / u_resolution).x > 0.1 && (gl_FragCoord.xy / u_resolution).y < 0.1) {
            if (gradientY == 0.0) {
                color = vec4(1.0, 0.0, 0.0, 1.0);
            }
        }
    }

    gl_FragColor = color;
}