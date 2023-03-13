#version 300 es

in vec2 a_position;
out vec2 vUv;
uniform vec2 u_resolution;

void main() {
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // convert from 0->1 to 0->2 then from 0->2 to -1->+1 (clip space)
    vec2 clipSpace = zeroToOne * 2.0 - 1.0;

    vUv = a_position;
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}

// precision highp float;
// precision highp int;

// uniform mat4 MVP;

// // uniform vec2 resolution;
// in vec2 position;
// in vec2 texcoord;
// out vec2 vUv;

// // layout(location = POSITION_LOCATION) in vec2 position;
// // layout(location = TEXCOORD_LOCATION) in vec2 texcoord;

// // out vec2 v_st;

// void main()
// {
//     // vec2 zeroToOne = position / resolution;
//     // vec2 clipSpace = zeroToOne * 2.0 - 1.0;

//     vUv = texcoord;
//     // vUv = ((position + vec2(1.0))/2.0) * resolution;
//     gl_Position = vec4(position, 0, 1);
//     // gl_Position = MVP * vec4(position, 0.0, 1.0);
// }

// // TODO replace position with the old position coords and try again