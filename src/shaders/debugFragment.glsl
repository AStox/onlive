#version 300 es

// precision highp float;

// out vec4 fragColor;

// uniform sampler2D u_texture;
// uniform vec2 u_resolution;

// void main() {
//     vec2 uv = (gl_FragCoord.xy / u_resolution);
//     vec4 color = texture(u_texture, uv);
//     // color = vec4(1.0, 2.0, 0.0, 1.0);

//     color = vec4(1.0, 0.0, 0.0, 1.0);
//     fragColor = color;
// }

precision highp float;
precision highp int;

in vec2 vUv;

out vec4 color;

void main()
{
    color = vec4(1.0, 0.0, 0.0, 1.0);
}