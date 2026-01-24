# Portable Effects Format Specification

**Version 1.0**

This document defines the complete specification for portable shader effects in the Noisemaker ecosystem.

---

## File Structure

A portable effect is a directory or ZIP archive containing:

```
effect-name/
├── definition.json          # REQUIRED: Effect metadata
├── glsl/                     # REQUIRED: GLSL shaders
│   ├── main.glsl            # Primary fragment shader
│   └── *.glsl               # Additional shaders (multi-pass)
├── wgsl/                     # OPTIONAL: WebGPU shaders
│   └── *.wgsl               # (auto-generated if not provided)
├── help.md                   # OPTIONAL: Documentation
└── dsl.txt                   # OPTIONAL: Example DSL program
```

---

## definition.json

The definition file describes the effect's identity, parameters, and rendering structure.

### Minimal Example

```json
{
  "name": "My Effect",
  "func": "myEffect"
}
```

### Complete Example

```json
{
  "name": "Plasma Wave",
  "func": "plasmaWave",
  "namespace": "synth",
  "description": "Animated plasma effect with customizable colors",
  "starter": true,
  "tags": ["noise", "animation", "color"],
  "globals": {
    "scale": {
      "type": "float",
      "default": 2.0,
      "uniform": "scale",
      "min": 0.1,
      "max": 10.0
    },
    "speed": {
      "type": "float",
      "default": 1.0,
      "uniform": "speed",
      "min": 0.0,
      "max": 5.0
    },
    "color": {
      "type": "vec3",
      "default": [1.0, 0.5, 0.0],
      "uniform": "baseColor"
    }
  },
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": {},
      "outputs": { "fragColor": "outputTex" }
    }
  ],
  "textures": {}
}
```

---

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name for the effect |
| `func` | string | DSL function name (lowercase, no spaces) |

If only one is provided, the other is inferred:
- `func` defaults to lowercase `name` with spaces removed
- `name` defaults to `func`

---

## Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `namespace` | string | `"user"` | Effect namespace (see below) |
| `description` | string | `""` | Human-readable description |
| `starter` | boolean | `false` | Whether effect can start a chain |
| `tags` | string[] | `[]` | Categorization tags |
| `globals` | object | `{}` | Parameter definitions |
| `passes` | array | auto | Rendering pass configuration |
| `textures` | object | `{}` | Internal texture definitions |
| `uniformLayout` | object | — | UI grouping hints |
| `uniformLayouts` | object | — | Multiple UI layouts |

---

## Namespaces

| Namespace | Purpose | Starter? |
|-----------|---------|----------|
| `user` | User-created effects | varies |
| `synth` | 2D generators | Yes |
| `filter` | 2D processors | No |
| `mixer` | Blend/composite operations | No |
| `synth3d` | 3D volumetric generators | Yes |
| `filter3d` | 3D volumetric processors | No |
| `points` | Agent/particle simulations | Yes |
| `render` | Rendering utilities (loops, 3D) | No |

For portable effects, `user` is the recommended namespace. The effect will be registered as `user.{func}` and accessible as `user/{func}`.

---

## The `starter` Field

The `starter` field determines whether an effect can begin a DSL chain:

- **`starter: true`** — Effect generates imagery from scratch (no input required)
- **`starter: false`** — Effect requires input from a previous effect in the chain

### Starter Effects (synth-type)

```json
{
  "starter": true,
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": {},
      "outputs": { "fragColor": "outputTex" }
    }
  ]
}
```

DSL usage:
```
myEffect().blur().write(o0)
```

### Filter Effects

```json
{
  "starter": false,
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": { "inputTex": "source" },
      "outputs": { "fragColor": "outputTex" }
    }
  ]
}
```

DSL usage:
```
noise().myFilter().write(o0)
```

---

## Tags

Tags help categorize effects for searchability:

| Tag | Description |
|-----|-------------|
| `noise` | Noise-based patterns |
| `color` | Color manipulation |
| `distort` | Spatial distortion |
| `geometric` | Geometric patterns |
| `animation` | Time-based animation |
| `transform` | Coordinate transforms |
| `blur` | Blur/smoothing effects |
| `3d` | 3D rendering techniques |
| `custom` | User-created |

You can use any tags, but these are recognized by the built-in search.

---

## Passes

The `passes` array defines the rendering pipeline. If omitted, a default single-pass structure is generated based on the `starter` field.

### Auto-Generated Passes

When `passes` is not specified:

**For starter effects (`starter: true`):**
```json
[{
  "name": "render",
  "program": "{first_shader_name}",
  "inputs": {},
  "outputs": { "fragColor": "outputTex" }
}]
```

**For filter effects (`starter: false`):**
```json
[{
  "name": "render",
  "program": "{first_shader_name}",
  "inputs": { "inputTex": "source" },
  "outputs": { "fragColor": "outputTex" }
}]
```

### Explicit Pass Definition

```json
"passes": [
  {
    "name": "blur_h",
    "program": "blur",
    "inputs": { "inputTex": "source" },
    "outputs": { "fragColor": "tempTex" }
  },
  {
    "name": "blur_v",
    "program": "blur",
    "inputs": { "inputTex": "tempTex" },
    "outputs": { "fragColor": "outputTex" }
  }
]
```

### Pass Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Unique pass identifier |
| `program` | string | Yes | Shader program name (maps to `glsl/{program}.glsl`) |
| `inputs` | object | Yes | Sampler → texture bindings |
| `outputs` | object | Yes | Fragment output → texture bindings |

### Special Texture Names

| Name | Description |
|------|-------------|
| `source` | Pipeline input texture |
| `outputTex` | Pipeline output texture |
| `inputTex` | Common sampler name for input |

---

## Textures

The `textures` object defines internal render targets for multi-pass effects:

```json
"textures": {
  "tempTex": {
    "width": 512,
    "height": 512,
    "format": "rgba8"
  }
}
```

If not specified, textures are created at the output resolution with RGBA8 format.

---

## Program Name Mapping

Shader program names map to files:

| Program Name | GLSL Path | WGSL Path |
|--------------|-----------|-----------|
| `main` | `glsl/main.glsl` | `wgsl/main.wgsl` |
| `blur` | `glsl/blur.glsl` | `wgsl/blur.wgsl` |
| `compute` | `glsl/compute.glsl` | `wgsl/compute.wgsl` |

The filename (minus directory and extension) becomes the program name.

---

## Registration

When an effect is loaded, it's registered under multiple keys for flexible lookup:

1. `{namespace}.{func}` — Full namespaced name (e.g., `user.plasmaWave`)
2. `{namespace}/{func}` — Slash-separated ID (e.g., `user/plasmaWave`)
3. `{func}` — Plain function name (e.g., `plasmaWave`)

The DSL's `search` directive controls which namespaces are searched:

```
search user, synth, filter
plasmaWave().blur().write(o0)
render(o0)
```

---

## Validation

A valid portable effect MUST have:

1. ✅ A `definition.json` with at least `name` or `func`
2. ✅ At least one `.glsl` file in the `glsl/` directory
3. ✅ Program names in `passes` must match shader filenames

A valid portable effect SHOULD have:

- 📝 A meaningful `description`
- 📝 Appropriate `tags` for searchability
- 📝 Correct `starter` field matching the effect type
- 📝 Parameter `min`/`max` ranges for UI sliders

---

## Example: Complete Starter Effect

### definition.json

```json
{
  "name": "Flowing Terrain",
  "func": "flowingTerrain",
  "namespace": "synth",
  "description": "Procedural terrain with animated flow",
  "starter": true,
  "tags": ["noise", "terrain", "3d", "animation"],
  "globals": {
    "speed": {
      "type": "float",
      "default": 0.5,
      "min": 0.0,
      "max": 2.0
    },
    "scale": {
      "type": "float",
      "default": 3.0,
      "min": 0.5,
      "max": 10.0
    },
    "height": {
      "type": "float",
      "default": 0.3,
      "min": 0.0,
      "max": 1.0
    },
    "color1": {
      "type": "vec3",
      "default": [0.1, 0.4, 0.2]
    },
    "color2": {
      "type": "vec3",
      "default": [0.9, 0.9, 0.95]
    }
  }
}
```

### glsl/main.glsl

```glsl
#version 300 es
precision highp float;

#define TAU 6.28318530718

uniform vec2 resolution;
uniform float time;

uniform float speed;
uniform float scale;
uniform float height;
uniform vec3 color1;
uniform vec3 color2;

in vec2 vUv;
out vec4 fragColor;

// Simplex noise function (abbreviated)
float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 uv = vUv * scale;
    float t = time * speed;
    
    float n = fbm(uv + vec2(t, 0.0));
    n = pow(n, 2.0) * height;
    
    vec3 color = mix(color1, color2, n);
    
    fragColor = vec4(color, 1.0);
}
```

### DSL Usage

```
search user
flowingTerrain(speed: 0.8, scale: 5.0, height: 0.5).write(o0)
render(o0)
```
