// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default
precision mediump float;

varying vec4 f_color;

void main() {
    gl_FragColor = f_color;
}