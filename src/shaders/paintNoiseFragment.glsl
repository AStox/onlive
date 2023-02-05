precision highp float;

uniform sampler2D noiseTexture;
uniform sampler2D flowTexture;
uniform sampler2D alteredNoiseTexture;
uniform vec2 u_resolution;
uniform vec2 u_flowResolution;

const float maxFlowResolution = 1000.0;

float dist(vec2 vect1, vec2 vect2) {
    return sqrt(pow(vect2.x - vect1.x, 2.0) + pow(vect2.y - vect1.y, 2.0));
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    vec4 color = texture2D(alteredNoiseTexture, uv);
    vec2 ratio = u_resolution / u_flowResolution;

    // for every pixel of the flowTexture, check if the distance between that pixel and the current pixel is less than a certain amount
    for (float i = 0.0; i < maxFlowResolution; i++) {
        if (i >= u_flowResolution.x) break;
        for (float j = 0.0; j < maxFlowResolution; j++) {
            if (j >= u_flowResolution.y) break;

            vec2 flowUV = vec2(i / u_flowResolution.x, j / u_flowResolution.y);
            vec2 pos = texture2D(flowTexture, flowUV / ratio).rg;
            float radius = dist(uv, pos);
            float maxRadius = 0.005;
            float amount = 0.02;
            if (radius < maxRadius) {
                float a = pow(radius/maxRadius, 2.0);
                color = color + ((vec4(a, a, a, 1.0) - vec4(1.0)) * amount);
                color = vec4(flowUV, 0.0, 1.0);
            }
            // color = vec4(pos, 0.0, 1.0);
            // color = texture2D(flowTexture, uv / ratio);
        }
    }
    // float posX = uv * u_flowResolution.x;
    // float posY = uv * u_flowResolution.y;



    // // float posX = texture2D(flowTexture, uv).r;
    // // float posY = texture2D(flowTexture, uv).g;

    // float radius = dist(gl_FragCoord.xy / u_resolution, vec2(posX, posY));
    // float maxRadius = 0.01;
    // float amount = 0.05;
    // if (radius < maxRadius) {
    //     float a = pow(radius/maxRadius, 2.0);
    //     color = color + ((vec4(a, a, a, 1.0) - vec4(1.0)) * amount);
    // }
    // color = vec4(, 0.0, 1.0);
    gl_FragColor = color;
}