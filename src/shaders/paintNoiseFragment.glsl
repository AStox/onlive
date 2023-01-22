precision highp float;

uniform sampler2D noiseTexture;
uniform sampler2D flowTexture;
uniform sampler2D alteredNoiseTexture;
uniform vec2 u_resolution;

float dist(vec2 vect1, vec2 vect2) {
    return sqrt(pow(vect2.x - vect1.x, 2.0) + pow(vect2.y - vect1.y, 2.0));
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution);
    vec4 color = texture2D(alteredNoiseTexture, uv);

    float startX = texture2D(flowTexture, vec2(0.0,0.0)).r;
    float startY = texture2D(flowTexture, vec2(0.0,0.0)).g;

    float x0 = startX;
    float y0 = startY;
    float x1 = x0 + 5.0 / u_resolution.x;
    float y1 = y0 + 5.0 / u_resolution.y;

    float radius = dist(gl_FragCoord.xy / u_resolution, vec2(startX, startY));
    float maxRadius = 0.01;
    float amount = 0.05;
    if (radius < maxRadius) {
        float a = pow(radius/maxRadius, 2.0);
        color = color + ((vec4(a, a, a, 1.0) - vec4(1.0)) * amount);
    }
    gl_FragColor = color;
}