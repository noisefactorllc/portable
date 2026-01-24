# Portable Effects for Noisemaker

**The Portable Effects Format** is an open standard for sharing shader effects across the Noise Factor ecosystem.

This repository serves as the **canonical source of truth** for the Portable Effects specification.

---

## What Are Portable Effects?

Portable Effects are self-contained shader packages that work across all Noise Factor applications.

---

## Repository Structure

```
portable/
├── effect/                 # Working example effect
│   ├── definition.json     # Effect definition
│   ├── dsl.txt             # Example DSL program
│   ├── help.md             # Effect documentation
│   ├── glsl/
│   │   └── example.glsl    # WebGL shader
│   └── wgsl/
│       └── example.wgsl    # WebGPU shader
├── viewer/                 # Hot-reloading effect viewer
│   ├── index.html          # Full-page viewer with param controls
│   └── vendor/             # Noisemaker runtime (after pull)
├── docs/                   # Format specification
└── pull-noisemaker         # Script to fetch runtime
```

---

## Quick Start

### 1. Pull the Runtime (Optional)

```bash
cd portable
./pull-noisemaker
```

This fetches the latest Noisemaker runtime bundle.

### 2. Edit Your Effect

Modify files in the `effect/` directory:
- `definition.json` — Effect definition and parameters
- `glsl/example.glsl` — WebGL shader code
- `wgsl/example.wgsl` — WebGPU shader code

### 3. Test in Viewer

Open `viewer/index.html` in a browser. The viewer automatically reloads when you save changes.

### 4. Package for Distribution

Create a ZIP archive for sharing or importing into applications:

```bash
# Using bash
./package-portable.sh

# Or using Node.js
npm run package
```

This creates `effect.zip`.

### 5. Import into Noisedeck

To use your effect in Noisedeck or other Noise Factor applications:

1. Open the application
2. Go to **File Menu** → **Import Effect from ZIP...**
3. Select your `effect.zip` file
4. Your effect will be available in the effect browser

Use it in DSL programs:

```javascript
search user

example().write(o0)
render(o0)
```

---

## Example Effect

The included `effect/` directory contains a complete portable effect based on `synth.solid`:

**effect/definition.json:**
```json
{
  "name": "Example",
  "namespace": "user",
  "func": "example",
  "description": "Solid color fill - example portable effect",
  "starter": true,
  "globals": {
    "r": { "type": "float", "default": 0.5, "min": 0, "max": 1 },
    "g": { "type": "float", "default": 0.5, "min": 0, "max": 1 },
    "b": { "type": "float", "default": 0.5, "min": 0, "max": 1 },
    "a": { "type": "float", "default": 1.0, "min": 0, "max": 1 }
  },
  "passes": [{ "name": "example", "program": "example", "outputs": { "color": "outputTex" } }]
}
```

**effect/glsl/example.glsl:**
```glsl
#version 300 es
precision highp float;

uniform float r, g, b, a;
out vec4 fragColor;

void main() {
  fragColor = vec4(r * a, g * a, b * a, a);
}
```

---

## Minimal Effect

A portable effect needs only two files:

```
my-effect/
├── definition.json     # Effect metadata and parameters
└── glsl/
    └── main.glsl       # Fragment shader source
```

### definition.json

```json
{
  "name": "My Effect",
  "func": "myEffect",
  "namespace": "synth",
  "description": "A simple shader effect",
  "starter": true,
  "tags": ["noise", "custom"],
  "globals": {
    "scale": {
      "type": "float",
      "default": 1.0,
      "min": 0.1,
      "max": 10.0
    }
  }
}
```

### glsl/main.glsl

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
    vec3 color = vec3(uv, sin(time) * 0.5 + 0.5);
    fragColor = vec4(color, 1.0);
}
```

### Using Your Effect

Once loaded into any Noisemaker application, use it in DSL programs:

```
search user
myEffect(scale: 2.0).write(o0)
render(o0)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [**FORMAT.md**](docs/FORMAT.md) | Complete specification of the effect format |
| [**PARAMETERS.md**](docs/PARAMETERS.md) | Defining uniforms and UI controls |
| [**SHADERS.md**](docs/SHADERS.md) | Writing compatible GLSL shaders |
| [**DSL.md**](docs/DSL.md) | Using effects in the Polymorphic DSL |
| [**VIEWER.md**](docs/VIEWER.md) | Using the hot-reloading effect viewer |

---

## Effect Types

| Type | Namespace | Description |
|------|-----------|-------------|
| **Starter** | `synth` | Generates 2D imagery from scratch |
| **Filter** | `filter` | Transforms a 2D input texture |
| **Mixer** | `mixer` | Blends two input textures |
| **3D Starter** | `synth3d` | Generates 3D volumetric data |
| **3D Filter** | `filter3d` | Transforms 3D volumetric data |
| **Points** | `points` | Agent/particle simulations |
| **Render** | `render` | Rendering utilities (loops, 3D) |

The `starter` field in definition.json determines whether an effect can begin a DSL chain or must receive input from another effect.

---

## License

This specification is released under the MIT License.

Effects you create are your own — share them however you like.
