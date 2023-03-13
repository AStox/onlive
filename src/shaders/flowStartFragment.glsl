#version 300 es

precision highp float;

out vec4 fragColor;
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
    float columnCount = ceil(sqrt(u_resolution.y));
    vec2 resolution = (u_resolution / u_granularity);
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    float num = 8.72;
    vec2 seed = vec2(uv.x, uv.y) / num + num/2.0;
    float factor = 0.25;
    
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
    // if (uv.x < 0.5) {
    if(uv.x < 0.5) {
    //  color = vec4(uv.x + (rand(seed) * 2.0 - 1.0) * factor, uv.y + (rand(vec2(1.0) - seed) * 2.0 - 1.0) * factor, 0.0, 1.0);
    // convert uv.y an x and y coordinate. Interpret the y coordinate as the 1D array index where uv.y = index * 

        // convert 1d index uv.y to 2d x and y coordinate using the resolution
        vec2 pos = vec2(mod(gl_FragCoord.y, columnCount)/columnCount, (floor(gl_FragCoord.y / columnCount) + 0.5)/columnCount);
        // vec2 pos = gl_FragCoord.xy;
        // color = vec4(uv, 0.0, 1.0);
        // color = vec4(rand(seed), rand(100.0 * seed), 0.0, 0.0);
        color = vec4(pos.x, pos.y, 0.0, 1.0);
    } else {
        color = vec4(0.0, 0.0, 0.0, 0.0);
    }
    color = vec4(uv, 0.0, 1.0);
    // color = vec4(gl_FragCoord.xy, 0.0, 1.0);
    // vec2 pos = gl_FragCoord.xy;
    // color = vec4(pos, 0.0, 1.0);
    fragColor = color;
}

