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
    // uv = floor(uv);
    // uv = uv / u_granularity;
    // vec4 color = vec4(uv.x, uv.y, 0.0, 1.0);
    // float num = 1.0;

    // blue
    // vec4 color = vec4(0.0, 1.0, 1.0, 1.0);
    // random
    vec4 color = vec4(rand(uv), rand(vec2(1.0)-uv), rand(uv), 1.0);

    gl_FragColor = color;
}

