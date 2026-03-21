# Writing Shaders

This guide covers writing compatible fragment shaders for portable effects. The format supports two shader languages:

- **GLSL** (OpenGL Shading Language) - targets WebGL2 via GLSL ES 3.0
- **WGSL** (WebGPU Shading Language) - targets WebGPU

Both languages can express the same effects. Providing shaders in both languages ensures your effect runs on the widest range of platforms.

---

## Shader Requirements

### GLSL

1. Use GLSL ES 3.0 (`#version 300 es`)
2. Declare `precision highp float;` and `precision highp int;` if needed
3. Compute texture coordinates from `gl_FragCoord.xy / resolution`
4. Use `out vec4 fragColor;` for output
5. Implement `void main()`

### WGSL

1. No version or precision directives needed
2. Declare uniforms with `@group(0) @binding(N) var<uniform>`
3. Use `@builtin(position)` for fragment position (replaces `gl_FragCoord`)
4. Return `vec4<f32>` from the entry point via `@location(0)`
5. Implement `@fragment fn main(...) -> @location(0) vec4<f32>`

---

## Minimal Shader Templates

### GLSL

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec3 color = vec3(uv, 0.5);
    fragColor = vec4(color, 1.0);
}
```

### WGSL

```wgsl
@group(0) @binding(0) var<uniform> resolution: vec2<f32>;
@group(0) @binding(2) var<uniform> time: f32;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;
    let color = vec3<f32>(uv, 0.5);
    return vec4<f32>(color, 1.0);
}
```

Key differences in the WGSL version:

- Each uniform gets an explicit `@group(0) @binding(N)` decorator
- The entry point is `@fragment fn main(...)` returning a value instead of writing to `fragColor`
- Fragment position comes from `@builtin(position)`, not `gl_FragCoord`
- The Y axis is flipped: `resolution.y - position.y` matches WebGL's bottom-left origin
- Types are explicit: `vec2<f32>`, `f32`, `i32` instead of `vec2`, `float`, `int`

---

## Built-in Uniforms

These uniforms are always available to your shader. Only declare the ones you need.

| Uniform | GLSL Type | WGSL Type | Description |
|---------|-----------|-----------|-------------|
| `resolution` | `vec2` | `vec2<f32>` | Canvas size in pixels |
| `aspect` | `float` | `f32` | Width / height |
| `time` | `float` | `f32` | Normalized time 0.0-1.0 |
| `frame` | `int` | `i32` | Current frame number |

In GLSL, declare these as regular uniforms (e.g., `uniform vec2 resolution;`).

In WGSL, each uniform gets an explicit `@group(0) @binding(N)` annotation. Binding numbers must be unique within the shader but do not need to follow a fixed scheme. A common convention is `resolution` at 0, `aspect` at 1, `time` at 2, with effect-specific uniforms continuing from 3, but you can skip unused bindings.

---

## Using Time

`time` cycles from 0.0 to 1.0 over the loop duration (default 10 seconds).

### GLSL

```glsl
#define TAU 6.28318530718

void main() {
    float wave = sin(time * TAU);           // One full cycle per loop
    float fast = sin(time * TAU * 4.0);     // 4x speed
}
```

### WGSL

```wgsl
const TAU: f32 = 6.28318530718;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let wave = sin(time * TAU);           // One full cycle per loop
    let fast = sin(time * TAU * 4.0);     // 4x speed
    // ...
}
```

Note: WGSL uses `const` for compile-time constants instead of `#define`.

---

## Using Resolution

### GLSL

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / resolution;                  // Normalized 0-1
    vec2 px = gl_FragCoord.xy;                               // Pixel coordinates
    vec2 centered = (uv - 0.5) * vec2(aspect, 1.0);         // Centered, aspect-corrected
}
```

### WGSL

```wgsl
@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;   // Normalized 0-1 (Y-flipped)
    let px = position.xy;                                                       // Pixel coordinates
    let centered = (uv - 0.5) * vec2<f32>(aspect, 1.0);                        // Centered, aspect-corrected
    // ...
}
```

---

## Texture Coordinates

### GLSL

Use `gl_FragCoord.xy / resolution` to get normalized coordinates (0,0 at bottom-left, 1,1 at top-right):

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / resolution - 0.5;  // Center at origin
    uv.x *= aspect;                                 // Aspect correction
}
```

### WGSL

WGSL uses `@builtin(position)` which provides pixel coordinates with the origin at the **top-left**. To match WebGL's bottom-left origin, flip the Y axis:

```wgsl
@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    var uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;
    uv = uv - 0.5;               // Center at origin
    uv.x = uv.x * aspect;        // Aspect correction
    // ...
}
```

The Y-flip (`resolution.y - position.y`) ensures visual parity between GLSL and WGSL versions of the same starter effect. For filter effects that sample an input texture, do NOT flip — use `position.xy / resolution` directly, since input textures are already in screen space.

---

## Starter Effects

Starter effects generate imagery procedurally without texture input.

### GLSL

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float scale;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution * scale;
    float pattern = sin(uv.x * 10.0) * sin(uv.y * 10.0);
    pattern = pattern * 0.5 + 0.5;
    fragColor = vec4(vec3(pattern), 1.0);
}
```

### WGSL

```wgsl
@group(0) @binding(0) var<uniform> resolution: vec2<f32>;
@group(0) @binding(1) var<uniform> aspect: f32;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var<uniform> scale: f32;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = vec2<f32>(position.x, resolution.y - position.y) / resolution * scale;
    let pattern = sin(uv.x * 10.0) * sin(uv.y * 10.0) * 0.5 + 0.5;
    return vec4<f32>(vec3<f32>(pattern), 1.0);
}
```

---

## Filter Effects

Filter effects process an input texture. The key difference is how textures are sampled.

### GLSL

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D inputTex;
uniform float amount;

out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 color = texture(inputTex, uv);
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(color.rgb, vec3(gray), amount);
    fragColor = color;
}
```

### WGSL

WGSL requires separate sampler and texture bindings:

```wgsl
@group(0) @binding(0) var<uniform> resolution: vec2<f32>;
@group(0) @binding(1) var<uniform> aspect: f32;
@group(0) @binding(2) var<uniform> time: f32;
@group(0) @binding(3) var<uniform> amount: f32;
@group(0) @binding(4) var inputSampler: sampler;
@group(0) @binding(5) var inputTex: texture_2d<f32>;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = position.xy / resolution;
    var color = textureSample(inputTex, inputSampler, uv);
    let gray = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));
    color = vec4<f32>(mix(color.rgb, vec3<f32>(gray), amount), color.a);
    return color;
}
```

Key differences in the WGSL filter version:

- GLSL uses `texture(sampler2D, uv)` while WGSL uses `textureSample(texture_2d, sampler, uv)`
- WGSL requires separate `sampler` and `texture_2d` bindings (GLSL combines them into `sampler2D`)
- Binding numbers are flexible; place the sampler and texture at any unused binding indices

---

## Common Patterns

### Noise Functions

#### GLSL

```glsl
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
```

#### WGSL

```wgsl
fn hash(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2<f32>(12.9898, 78.233))) * 43758.5453);
}

fn noise(p: vec2<f32>) -> f32 {
    let i = floor(p);
    var f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    let a = hash(i);
    let b = hash(i + vec2<f32>(1.0, 0.0));
    let c = hash(i + vec2<f32>(0.0, 1.0));
    let d = hash(i + vec2<f32>(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
```

### Color Palettes

Cosine palette technique (Inigo Quilez):

#### GLSL

```glsl
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}
```

#### WGSL

```wgsl
fn palette(t: f32, a: vec3<f32>, b: vec3<f32>, c: vec3<f32>, d: vec3<f32>) -> vec3<f32> {
    return a + b * cos(6.28318 * (c * t + d));
}
```

### Polar Coordinates

#### GLSL

```glsl
void main() {
    vec2 uv = gl_FragCoord.xy / resolution - 0.5;
    uv.x *= aspect;
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
}
```

#### WGSL

```wgsl
@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    var uv = vec2<f32>(position.x, resolution.y - position.y) / resolution - 0.5;
    uv.x = uv.x * aspect;
    let r = length(uv);
    let theta = atan2(uv.y, uv.x);
    // ...
}
```

Note: GLSL uses `atan(y, x)` while WGSL uses `atan2(y, x)`.

---

## Animation Techniques

### Smooth Looping

#### GLSL

```glsl
#define TAU 6.28318530718

void main() {
    float t = time * TAU;
    vec2 uv = gl_FragCoord.xy / resolution;
    uv += vec2(sin(t), cos(t)) * 0.1;
}
```

#### WGSL

```wgsl
const TAU: f32 = 6.28318530718;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let t = time * TAU;
    var uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;
    uv = uv + vec2<f32>(sin(t), cos(t)) * 0.1;
    // ...
}
```

### Directional Movement

#### GLSL

```glsl
uniform float time;
uniform vec2 resolution;
uniform float speed;
uniform vec2 direction;

void main() {
    vec2 uv = fract(gl_FragCoord.xy / resolution + direction * time * speed);
}
```

#### WGSL

```wgsl
@group(0) @binding(3) var<uniform> speed: f32;
@group(0) @binding(4) var<uniform> direction: vec2<f32>;

@fragment
fn main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    var uv = vec2<f32>(position.x, resolution.y - position.y) / resolution;
    uv = fract(uv + direction * time * speed);
    // ...
}
```

---

## Multi-Pass Effects

For effects requiring multiple passes, create separate shader files per language:

```
effect/
├── glsl/
│   ├── pass1.glsl
│   └── pass2.glsl
├── wgsl/
│   ├── pass1.wgsl
│   └── pass2.wgsl
└── definition.json
```

Configure passes in `definition.json` (language-agnostic - the runtime selects the correct directory):

```json
"passes": [
  {
    "name": "horizontal",
    "program": "pass1",
    "inputs": { "inputTex": "inputTex" },
    "outputs": { "fragColor": "tempTex" }
  },
  {
    "name": "vertical",
    "program": "pass2",
    "inputs": { "inputTex": "tempTex" },
    "outputs": { "fragColor": "outputTex" }
  }
],
"textures": {
  "tempTex": {}
}
```

---

## Performance Tips

These apply to both GLSL and WGSL:

### 1. Avoid Branches in Loops

```glsl
// Prefer step/mix over if-statements inside loops
float mask = step(threshold, value);
result += mask * something;
```

### 2. Use Built-in Functions

Both languages provide `clamp`, `mix`, `step`, `smoothstep`, `fract`, `floor`, `abs`, and many more. Prefer these over manual implementations.

### 3. Limit Texture Samples

Each `texture()` / `textureSample()` call is expensive. Minimize samples per pixel.

### 4. Use Constants

```glsl
// GLSL
#define TAU 6.28318530718
```

```wgsl
// WGSL
const TAU: f32 = 6.28318530718;
```

---

## Debugging

### Visualize Values

Output intermediate values as colors to debug visually.

#### GLSL

```glsl
fragColor = vec4(vec3(someValue), 1.0);          // Float as grayscale
fragColor = vec4(someVec2, 0.0, 1.0);            // vec2 as RG
fragColor = vec4(gl_FragCoord.xy / resolution, 0.0, 1.0);  // UV coordinates
```

#### WGSL

```wgsl
return vec4<f32>(vec3<f32>(someValue), 1.0);      // Float as grayscale
return vec4<f32>(someVec2, 0.0, 1.0);             // vec2 as RG
return vec4<f32>(uv, 0.0, 1.0);                   // UV coordinates
```

### WGSL-Specific Pitfalls

- **Modulo behavior:** WGSL `%` uses truncation division, not floored division. For GLSL-like `mod()` behavior with negative values, use `((x % n) + n) % n`.
- **No swizzle assignment:** You cannot write `uv.x *= aspect;` in WGSL. Instead write `uv.x = uv.x * aspect;`.
- **Immutable by default:** `let` bindings are immutable. Use `var` when you need to reassign.

---

## Interoperability

For maximum compatibility, provide both GLSL and WGSL versions of each effect:

```
effect/
├── glsl/
│   └── myeffect.glsl
├── wgsl/
│   └── myeffect.wgsl
└── definition.json
```

The `definition.json` references programs by name (e.g., `"program": "myeffect"`). The runtime picks `glsl/myeffect.glsl` or `wgsl/myeffect.wgsl` depending on the graphics backend.

When porting between languages, pay attention to:

- **Y-axis origin:** GLSL (bottom-left) vs WGSL (top-left) - flip with `resolution.y - position.y`
- **Uniform bindings:** WGSL requires explicit `@group` and `@binding` annotations
- **Texture sampling:** WGSL needs separate `sampler` and `texture_2d` bindings
- **Function syntax:** `fn name(param: type) -> returnType` instead of `returnType name(type param)`
- **Type names:** `f32`, `i32`, `vec2<f32>` instead of `float`, `int`, `vec2`
