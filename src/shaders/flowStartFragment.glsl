#version 300 es

precision highp float;

out vec4 fragColor;
uniform vec2 u_resolution;  // number of droplets
uniform float u_granularity;
uniform float u_randomOffset;

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    float columnCount = ceil(sqrt(u_resolution.y));
    vec2 resolution = (u_resolution / u_granularity);
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    float num = 8.72;
    vec2 seed = vec2(uv.x, uv.y) / num + num/2.0;
    
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

    vec4 color;
    if(uv.x < 0.5) {
        // convert 1d index uv.y to 2d x and y coordinate using the resolution
        vec2 pos = vec2(mod(gl_FragCoord.y, columnCount)/columnCount, (floor(gl_FragCoord.y / columnCount) + 0.5)/columnCount);
        color = vec4(pos.x + (rand(seed) * 2.0 - 1.0) * u_randomOffset, pos.y + (rand(vec2(1.0) - seed) * 2.0 - 1.0) * u_randomOffset, 0.0, 0.0);
    } else {
        color = vec4(0.0, 0.0, 0.0, 0.0);
    }
    fragColor = color;
}

