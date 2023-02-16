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
    for (float y = 0.0; y < maxFlowResolution; y++) {
        if (y >= u_flowResolution.y) break;

        float flowY = y / u_flowResolution.y; // from 0 to 1
        // from 0 to 1, reads the R & G channels from the flow texture
        // reads the R & G channels from the flow texture.
        // flowUV is in flow coordinates, so we need to convert it to the uv coords of the render texture using ratio
        vec2 pos = texture2D(flowTexture, vec2(0.0, flowY * ratio.y)).rg;
        float radius = dist(uv, pos);
        float maxRadius = 0.005;
        float amount = 0.2;
        if (radius < maxRadius) {
            float a = pow(radius/maxRadius, 2.0);
            color = color + ((vec4(a, a, a, 1.0) - vec4(1.0)) * amount);
        }
    }
    gl_FragColor = color;
}