precision highp float;

#define PI 3.1415926535897932384626433832795
#define maxDropletLifetime 30

varying vec2 vUv;

float seaLevel = 0.1;
float erosionRadius = 5.0;
float inertia = 0.1;
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
uniform int u_renderNoise;
uniform int u_debug;
uniform vec2 u_flowResolution;

// Function to calculate the height and gradient of a point on the map
// using bilinear interpolation of the surrounding heights
vec4 CalculateHeightAndGradient(sampler2D noiseTexture, vec2 mapSize, float posX, float posY, float dist) {
//   float dist = 5.0;
  float distX = dist / u_resolution.x;
  float distY = dist / u_resolution.y;
  // Calculate the indices of the surrounding heights
  float x0 = posX;
  float y0 = posY;
  float x1 = x0 + distX;
  float y1 = y0 + distY;

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
  float w00 = (distX - x) * (distY - y);
  float w01 = (distX - x) * y;
  float w10 = x * (distY - y);
  float w11 = x * y;

  // Interpolate the height and gradient using the weights
  float height = h00 * w00 + h01 * w01 + h10 * w10 + h11 * w11;
  float gradientX = (h00 * (distY - y) + h01 * y - h10 * (distY - y) - h11 * y) / mapSize.x;
  float gradientY = (h00 * (distX - x) + h10 * x - h01 * (distX - x) - h11 * x) / mapSize.y;

  return vec4(height, -gradientX, -gradientY, 1.0);
}

float dist(vec2 vect1, vec2 vect2) {
    return sqrt(pow(vect2.x - vect1.x, 2.0) + pow(vect2.y - vect1.y, 2.0));
}

void main() {

    // For each droplet, we create 2 pixels in the render texture. The x position of which determines what data it contains,
    // the Y position determines what droplet it is.

    // So for each pass of this shader, we check the UVs (0.0,Y) and (1.0, Y) for all the data, then when we're done and outputting
    // colour values, we check the X value of the current frag Coordinate and output the correct data based on what pixel it's outputting to.

    // x = 0.0
    // R = posX
    // G = posY
    // B = speed
    // A = water

    // x = 1.0   
    // R = dirX
    // G = dirY
    // B = sediment
    // A = deltaSediment

    float pixelIndex = gl_FragCoord.x + gl_FragCoord.y * u_resolution.x;
    vec2 uv = (gl_FragCoord.xy / u_resolution);

    // First pixel data
    float posX = texture2D(flowTexture, vec2(0.0, uv.y)).r;
    float posY = texture2D(flowTexture, vec2(0.0, uv.y)).g;
    // float speed = initialSpeed;
    float speed = texture2D(flowTexture, vec2(0.0, uv.y)).b;
    // float water = initialWaterVolume;
    float water = texture2D(flowTexture, vec2(0.0, uv.y)).a;

    // Second pixel data
    float dirX = texture2D(flowTexture, vec2(1.0, uv.y)).r;
    float dirY = texture2D(flowTexture, vec2(1.0, uv.y)).g;
    // float sediment = 0.0;
    float sediment = texture2D(flowTexture, vec2(1.0, uv.y)).b;
    // float deltaSediment = text


    float startX = posX;
    float startY = posY;

    // Calculate droplet's height and direction of flow with bilinear interpolation of surrounding heights
    float startDist = 5.0;
    vec4 heightAndGradient;
    bool flatGrad = true;
    for (int i = 0; i < 10; i++) {
        heightAndGradient = CalculateHeightAndGradient(noiseTexture, mapSize, posX, posY, startDist);
        if (heightAndGradient.y == 0.0 && heightAndGradient.z == 0.0) {
            startDist += 1.0 + heightAndGradient.x * 50.0;
        } else {
            flatGrad = false;
            break;
        }
    }
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

    // if (dist(gl_FragCoord.xy / u_resolution, vec2(startX, startY)) < 0.1) {
    //     vec2 uv = (gl_FragCoord.xy / u_resolution);
    //     // color = texture2D(noiseTexture, uv);
    // } else {
    //     color = vec4(posX, posY, 0.0, 1.0);
    // }
    // startX = gl_FragCoord.x / u_resolution.x;
    // startY = gl_FragCoord.y / u_resolution.y;
    vec4 color;
    if (uv.x < 0.5) {
        color = vec4(posX, posY, speed, water);
    } else {
        color = vec4(dirX, dirY, sediment, deltaSediment);
    }
    color = vec4(startX, startY, 0.0, 1.0);
    gl_FragColor = color;
}