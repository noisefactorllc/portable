#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float speed;

out vec4 fragColor;

#define TAU 6.28318530718

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    // Rotate the gradient direction over time
    // time loops 0→1, so multiply by TAU for a full rotation per loop
    float angle = time * TAU * speed;
    vec2 dir = vec2(cos(angle), sin(angle));

    // Project UV onto the rotating direction
    float t = dot(uv - 0.5, dir) + 0.5;

    // Map to a smooth color gradient
    vec3 color = vec3(t, t * 0.6 + 0.2, 1.0 - t);
    fragColor = vec4(color, 1.0);
}
