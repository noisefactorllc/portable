@group(0) @binding(0) var<uniform> resolution: vec2<f32>;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var<uniform> speed: f32;

const TAU: f32 = 6.28318530718;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;

    // Rotate the gradient direction over time
    // time loops 0→1, so multiply by TAU for a full rotation per loop
    let angle = time * TAU * speed;
    let dir = vec2<f32>(cos(angle), sin(angle));

    // Project UV onto the rotating direction
    let t = dot(uv - 0.5, dir) + 0.5;

    // Map to a smooth color gradient
    let color = vec3<f32>(t, t * 0.6 + 0.2, 1.0 - t);
    return vec4<f32>(color, 1.0);
}
