# Writing GLSL Shaders

This guide covers writing compatible GLSL fragment shaders for portable effects.

---

## Shader Requirements

All shaders must:

1. Use GLSL ES 3.0 (`#version 300 es`)
2. Declare `precision highp float;`
3. Use `in vec2 vUv;` for texture coordinates
4. Use `out vec4 fragColor;` for output
5. Implement `void main()`

---

## Minimal Shader Template

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 uv = vUv;
    vec3 color = vec3(uv, 0.5);
    fragColor = vec4(color, 1.0);
}
```

---

## Built-in Uniforms

These uniforms are always available:

| Uniform | Type | Description |
|---------|------|-------------|
| `resolution` | `vec2` | Canvas size in pixels |
| `time` | `float` | Normalized time 0.0–1.0 |
| `frame` | `int` | Current frame number |
| `aspectRatio` | `float` | Width / height |
| `mouse` | `vec4` | Mouse state (xy: position, zw: click) |

### Using Time

`time` cycles from 0.0 to 1.0 over the loop duration (default 8 seconds).

```glsl
#define TAU 6.28318530718

void main() {
    // One full sine wave per loop
    float wave = sin(time * TAU);
    
    // Speed up/slow down with multiplier
    float fastWave = sin(time * TAU * 4.0);  // 4x speed
}
```

### Using Resolution

```glsl
void main() {
    // Normalized coordinates (0-1)
    vec2 uv = vUv;
    
    // Pixel coordinates
    vec2 px = gl_FragCoord.xy;
    
    // Centered, aspect-corrected coordinates
    vec2 centered = (vUv - 0.5) * vec2(aspectRatio, 1.0);
}
```

---

## Texture Coordinates

The `vUv` varying provides normalized coordinates:

- Origin: bottom-left (0, 0)
- Top-right: (1, 1)
- Center: (0.5, 0.5)

### Centering Coordinates

```glsl
void main() {
    // Center at origin, range -0.5 to 0.5
    vec2 uv = vUv - 0.5;
    
    // With aspect ratio correction
    uv.x *= aspectRatio;
    
    // Now (0,0) is center, coordinates are square
}
```

### Scaling and Tiling

```glsl
uniform float scale;

void main() {
    vec2 uv = vUv * scale;  // Tile the space
    uv = fract(uv);         // Repeat pattern
}
```

---

## Starter Effects (synth)

Starter effects generate imagery without input. No texture sampling required.

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float scale;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 uv = vUv * scale;
    
    // Generate pattern procedurally
    float pattern = sin(uv.x * 10.0) * sin(uv.y * 10.0);
    pattern = pattern * 0.5 + 0.5;
    
    vec3 color = vec3(pattern);
    fragColor = vec4(color, 1.0);
}
```

---

## Filter Effects

Filter effects process an input texture:

```glsl
#version 300 es
precision highp float;

uniform vec2 resolution;
uniform sampler2D inputTex;
uniform float amount;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec4 color = texture(inputTex, vUv);
    
    // Apply effect (e.g., desaturate)
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(color.rgb, vec3(gray), amount);
    
    fragColor = color;
}
```

The `inputTex` sampler receives the previous effect's output.

---

## Common Patterns

### Noise Functions

```glsl
// Simple hash-based noise
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// Value noise
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);  // Smoothstep
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

// FBM (Fractal Brownian Motion)
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}
```

### Color Palettes

```glsl
// Cosine palette (Inigo Quilez technique)
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    float t = vUv.x;
    vec3 color = palette(t,
        vec3(0.5), vec3(0.5),
        vec3(1.0), vec3(0.0, 0.33, 0.67)
    );
    fragColor = vec4(color, 1.0);
}
```

### Polar Coordinates

```glsl
void main() {
    vec2 uv = vUv - 0.5;
    uv.x *= aspectRatio;
    
    float r = length(uv);
    float theta = atan(uv.y, uv.x);
    
    // Now use r (radius) and theta (angle)
}
```

### Domain Warping

```glsl
void main() {
    vec2 uv = vUv * 4.0;
    
    // Warp the domain
    float n1 = noise(uv + time);
    float n2 = noise(uv + n1);
    float n3 = noise(uv + n2);
    
    vec3 color = vec3(n3);
    fragColor = vec4(color, 1.0);
}
```

---

## Animation Techniques

### Smooth Looping

```glsl
#define TAU 6.28318530718

void main() {
    // time: 0→1, use sin/cos for smooth loops
    float t = time * TAU;
    
    vec2 uv = vUv;
    uv += vec2(sin(t), cos(t)) * 0.1;
    
    // Pattern will loop seamlessly
}
```

### Speed Control

```glsl
uniform float speed;

void main() {
    float t = time * speed;
    // ...
}
```

### Directional Movement

```glsl
uniform float speed;
uniform vec2 direction;

void main() {
    vec2 uv = vUv + direction * time * speed;
    uv = fract(uv);  // Wrap for seamless tiling
}
```

---

## Multi-Pass Effects

For effects requiring multiple passes, create separate shader files:

```
glsl/
├── pass1.glsl    # First pass
└── pass2.glsl    # Second pass
```

Configure passes in definition.json:

```json
"passes": [
  {
    "name": "horizontal",
    "program": "pass1",
    "inputs": { "inputTex": "source" },
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

### 1. Avoid Branches in Loops

```glsl
// BAD
for (int i = 0; i < 100; i++) {
    if (someCondition) {
        // ...
    }
}

// BETTER
for (int i = 0; i < 100; i++) {
    float mask = step(threshold, value);
    result += mask * something;
}
```

### 2. Use Built-in Functions

```glsl
// Use clamp, mix, step, smoothstep
float v = clamp(x, 0.0, 1.0);
float v = mix(a, b, t);
float v = smoothstep(0.0, 1.0, x);
```

### 3. Limit Texture Samples

Each `texture()` call is expensive. Minimize samples per pixel.

### 4. Use Constants

```glsl
#define TAU 6.28318530718
#define PI 3.14159265359
#define SQRT2 1.41421356237
```

---

## Debugging

### Visualize Values

```glsl
// Output a float as grayscale
fragColor = vec4(vec3(someValue), 1.0);

// Output vec2 as RG
fragColor = vec4(someVec2, 0.0, 1.0);

// Output normalized direction
fragColor = vec4(normalize(someVec3) * 0.5 + 0.5, 1.0);
```

### Check Coordinate Space

```glsl
// Visualize UV coordinates
fragColor = vec4(vUv, 0.0, 1.0);

// Visualize centered coordinates
vec2 c = vUv - 0.5;
fragColor = vec4(c + 0.5, 0.0, 1.0);
```

---

## Complete Example

```glsl
#version 300 es
precision highp float;

#define TAU 6.28318530718

uniform vec2 resolution;
uniform float time;
uniform float aspectRatio;

uniform float scale;
uniform float speed;
uniform int octaves;
uniform vec3 color1;
uniform vec3 color2;

in vec2 vUv;
out vec4 fragColor;

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

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < octaves; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    
    return value;
}

void main() {
    vec2 uv = vUv * scale;
    uv.x *= aspectRatio;
    
    // Animate
    float t = time * TAU * speed;
    uv += vec2(sin(t), cos(t)) * 0.5;
    
    // Generate noise
    float n = fbm(uv);
    
    // Apply colors
    vec3 color = mix(color1, color2, n);
    
    fragColor = vec4(color, 1.0);
}
```
