# Portable Effects Format Specification

**Version 1.0**

This document defines the complete specification for portable shader effects in the Noisemaker ecosystem.

---

## File Structure

A portable effect is a directory or ZIP archive containing:

```
effect-name/
├── definition.json          # REQUIRED: Effect metadata
├── glsl/                     # At least one of glsl/ or wgsl/ REQUIRED
│   ├── main.glsl            # Primary fragment shader
│   └── *.glsl               # Additional shaders (multi-pass)
├── wgsl/                     # At least one of glsl/ or wgsl/ REQUIRED
│   ├── main.wgsl            # Primary fragment shader
│   └── *.wgsl               # Additional shaders (multi-pass)
└── help.md                   # OPTIONAL: Documentation
```

> **Recommendation:** Provide both GLSL and WGSL shaders for full interoperability across all Noise Factor applications. Effects with only one shader language will only work on the corresponding backend (WebGL or WebGPU).

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
  "namespace": "user",
  "description": "Animated plasma effect with customizable colors",
  "starter": true,
  "tags": ["noise", "color"],
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
| `func` | string | DSL function name (camelCase, no spaces) |

At least one of `name` or `func` must be provided. If `func` is omitted, the `name` value is used as the function name, so it should be a valid identifier. It is recommended to always provide `func` explicitly.

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
| `defaultProgram` | string | | Example DSL program for this effect |

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

- **`starter: true`** - Effect generates imagery from scratch (no input required)
- **`starter: false`** - Effect requires input from a previous effect in the chain

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
| `color` | Color manipulation |
| `distort` | Input distortion |
| `edges` | Accentuate or isolate texture edges |
| `geometric` | Shapes |
| `lens` | Emulated camera lens effects |
| `noise` | Noise-based patterns |
| `transform` | Moves stuff around |
| `util` | Utility function |
| `sim` | Simulations with temporal state |
| `3d` | 3D volumetric effects |
| `audio` | Audio-reactive effects |

These tags are recognized by the built-in search. You can use any tags, but only these will appear as filter options.

---

## Passes

The `passes` array defines the rendering pipeline. If omitted, a default single-pass structure is generated from the shader files.

It is recommended to always provide explicit passes, especially for filter effects that need `inputs`.

**Starter effect (single pass):**
```json
"passes": [{
  "name": "render",
  "program": "main",
  "inputs": {},
  "outputs": { "fragColor": "outputTex" }
}]
```

**Filter effect (single pass):**
```json
"passes": [{
  "name": "render",
  "program": "main",
  "inputs": { "inputTex": "source" },
  "outputs": { "fragColor": "outputTex" }
}]
```

### Multi-Pass Definition

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
| `program` | string | Yes | Shader program name (maps to `glsl/{program}.glsl` and/or `wgsl/{program}.wgsl`) |
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

Shader program names map to files in available shader directories:

| Program Name | GLSL Path | WGSL Path |
|--------------|-----------|-----------|
| `main` | `glsl/main.glsl` | `wgsl/main.wgsl` |
| `blur` | `glsl/blur.glsl` | `wgsl/blur.wgsl` |
| `compute` | `glsl/compute.glsl` | `wgsl/compute.wgsl` |

The filename (minus directory and extension) becomes the program name.

An effect must provide at least one shader directory. If both are provided, each program name must have a corresponding file in both directories.

---

## Registration

When an effect is loaded, it's registered under multiple keys for flexible lookup:

1. `{namespace}.{func}` - Full namespaced name (e.g., `user.plasmaWave`)
2. `{namespace}/{func}` - Slash-separated ID (e.g., `user/plasmaWave`)
3. `{func}` - Plain function name (e.g., `plasmaWave`)

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
2. ✅ At least one shader file in `glsl/` or `wgsl/` (or both)
3. ✅ Program names in `passes` must match shader filenames in each provided directory

A valid portable effect SHOULD have:

- 📝 Both `glsl/` and `wgsl/` shaders for full cross-backend interoperability
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
  "namespace": "user",
  "description": "Procedural terrain with animated flow",
  "starter": true,
  "tags": ["noise", "3d"],
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
  },
  "defaultProgram": "search user\nflowingTerrain(speed: 0.8, scale: 5.0, height: 0.5).write(o0)\nrender(o0)"
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
    vec2 uv = gl_FragCoord.xy / resolution * scale;
    float t = time * speed;
    
    float n = fbm(uv + vec2(t, 0.0));
    n = pow(n, 2.0) * height;
    
    vec3 color = mix(color1, color2, n);
    
    fragColor = vec4(color, 1.0);
}
```

The `defaultProgram` field contains an example DSL program that demonstrates the effect with good parameter values. Applications use this as the initial program when the effect is loaded.
