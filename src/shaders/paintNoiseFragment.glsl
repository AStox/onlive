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
    vec2 ratio = u_flowResolution / u_resolution;

    // for every pixel of the flowTexture, check if the distance between that pixel and the current pixel is less than a certain amount
    for (float i = 0.0; i < maxFlowResolution; i++) {
        if (i >= u_flowResolution.x) break;
        for (float j = 0.0; j < maxFlowResolution; j++) {
            if (j >= u_flowResolution.y) break;

            vec2 flowUV = vec2(i / u_flowResolution.x, j / u_flowResolution.y);     // from 0 to 1
            // from 0 to 1, reads the R & G channels from the flow texture
            // reads the R & G channels from the flow texture.
            // flowUV is in flow coordinates, so we need to convert it to the uv coords of the render texture using ratio
            vec2 pos = texture2D(flowTexture, flowUV * ratio).rg;
            float radius = dist(uv, pos);
            float maxRadius = 0.005;
            float amount = 0.02;
            if (radius < maxRadius) {
                float a = pow(radius/maxRadius, 2.0);
                color = color + ((vec4(a, a, a, 1.0) - vec4(1.0)) * amount);
            }
        }
    }
    gl_FragColor = color;
}