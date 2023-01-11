precision highp float;

varying vec2 vUv;

uniform sampler2D u_texture;
uniform vec2 u_resolution;

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    vec4 color = texture2D(u_texture, uv);
    // color = vec4(1.0, 0.0, 0.0, 1.0);

    gl_FragColor = color;
}