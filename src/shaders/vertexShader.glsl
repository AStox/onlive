attribute vec2 a_position;
varying vec2 vUv;
uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2 then from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    vUv = a_position;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}