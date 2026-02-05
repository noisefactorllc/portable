# Effect Viewer

The portable effects viewer is a hot-reloading development environment for testing effects locally.

---

## Features

- **Full-page WebGL canvas** -- Effect renders at full viewport resolution
- **Parameter controls** -- Sliders for all effect globals
- **Hot-reloading** -- Automatically reloads when files change
- **Resize handling** -- Canvas adapts to window size changes
- **Backend auto-detection** -- Automatically selects WebGL or WebGPU based on available shader files
- **Backend toggle** -- Switch between WebGL and WebGPU when both shader types are available

---

## Setup

### 1. Pull the Runtime

From the `portable/` directory:

```bash
./pull-noisemaker
```

This clones the noisemaker repository, builds the shader bundle, and copies it to `viewer/vendor/`.

### 2. Start a Local Server

```bash
python -m http.server 8080
```

Or use any static file server (e.g., `npx serve`, `php -S localhost:8080`).

### 3. Open the Viewer

Navigate to [http://localhost:8080/viewer/](http://localhost:8080/viewer/)

---

## Hot Reloading

The viewer polls for changes to `effect/definition.json` every second. When changes are detected, it:

1. Reloads the effect definition
2. Reloads the shader source
3. Recompiles the effect
4. Preserves current parameter values

Edit files and save -- the viewer updates automatically.

---

## Viewer Structure

```
viewer/
├── index.html              # Main viewer page
└── vendor/
    └── noisemaker-shaders-core.esm.js
```

The viewer loads the effect from `../effect/definition.json` and its shaders from `../effect/glsl/` and/or `../effect/wgsl/`.

---

## Modifying the Example

### Change Parameters

Edit `effect/definition.json` to add or modify parameters:

```json
{
  "globals": {
    "r": { "type": "float", "default": 0.5, "min": 0, "max": 1 },
    "brightness": { "type": "float", "default": 1.0, "min": 0, "max": 2 }
  }
}
```

### Change Shader Logic

Edit your shader file (e.g., `effect/glsl/osc2d.glsl`):

```glsl
#version 300 es
precision highp float;

uniform float r, g, b, a;
uniform float brightness;
out vec4 fragColor;

void main() {
  vec3 color = vec3(r, g, b) * brightness;
  fragColor = vec4(color * a, a);
}
```

The viewer will hot-reload your changes.

---

## Creating a New Effect

1. Copy the `effect/` directory
2. Rename to match your effect name
3. Update `definition.json`:
   - Change `name`, `func`, `description`
   - Define your `globals`
   - Update pass names
4. Write your shader in `glsl/` and/or `wgsl/` (both recommended for full interoperability)
5. Update the viewer's fetch path in `index.html` if needed

---

## Troubleshooting

### "Failed to load effect definition"

- Ensure the local server is running
- Check that `effect/definition.json` exists and is valid JSON

### "Failed to load GLSL shader"

- Verify the shader path matches `passes[0].program` + `.glsl`
- Check for GLSL syntax errors in browser console

### Effect doesn't update

- Verify hot-reload polling is working (check Network tab)
- Try clicking the "↻ Reload Effect" button
- Clear browser cache and reload

### "No shader found for program"

- Ensure at least one shader directory exists (`glsl/` or `wgsl/`)
- Verify shader filenames match the `program` name in `passes`

### WebGPU not available

- WebGPU requires a compatible browser (Chrome 113+, Edge 113+)
- Some systems may need flags enabled
- The viewer falls back to WebGL automatically if GLSL shaders are available

---

## Advanced: Loading Different Effects

To load a different effect, modify the fetch paths in `viewer/index.html`:

```javascript
// Load effect definition from JSON
async function loadEffectDefinition() {
    const response = await fetch('../my-other-effect/definition.json', { cache: 'no-store' });
    // ...
}
```

---

*See [FORMAT.md](FORMAT.md) for the complete effect specification.*
