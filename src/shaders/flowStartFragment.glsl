precision highp float;

varying vec2 vUv;

// uniform sampler2D u_texture;
uniform vec2 u_resolution;
uniform float u_granularity;

// void main() {
//     vec2 resolution = (u_resolution / u_granularity);
//     vec2 uv = (gl_FragCoord.xy / resolution);
//     uv = floor(uv);
//     uv = uv / u_granularity;
//     vec4 color = vec4(uv.x, uv.y, 0.0, 1.0);

//     gl_FragColor = color;
// }

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 resolution = (u_resolution / u_granularity);
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    float num = 0.2;
    vec2 seed = uv / num + num/2.0;
    float factor = 0.25;
    
    // vec4 color = vec4(uv.x + (rand(seed) * 2.0 - 1.0) * factor, uv.y + (rand(vec2(1.0) - seed) * 2.0 - 1.0) * factor, 0.0, 1.0);
    // vec4 color = vec4(uv.x, uv.y, 0.0, 1.0);
    // random

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
    if (uv.x < 0.5) {
        color = vec4(rand(seed), rand(vec2(1.0) - seed), 0.0, 0.0);
    } else {
        color = vec4(0.0, 0.0, 0.0, 0.0);
    }

    gl_FragColor = color;
}

