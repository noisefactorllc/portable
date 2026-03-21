# Effect Viewer

The effect viewer is a development environment for testing portable effects locally.

---

## Features

- **Full-page canvas** - Effect renders at full viewport resolution
- **Parameter controls** - Sliders for numeric effect globals (float, int)
- **Manual reload** - Click the Reload Effect button or refresh the page after changes
- **Resize handling** - Canvas adapts to window size changes
- **Backend auto-detection** - Automatically selects WebGL or WebGPU based on available shader files
- **Backend toggle** - Switch between WebGL and WebGPU when both shader types are available

---

## Setup

### 1. Start a Local Server

The viewer loads the Noisemaker runtime from `shaders.noisedeck.app` via CDN. No local vendor setup is needed, but a local HTTP server is required (the viewer can't run from a `file://` URL).

From the project root:

```bash
npm install
npm run dev
```

Or use any static file server from the project root (e.g., `python -m http.server 8080`).

### 2. Open the Viewer

Navigate to [http://localhost:2999/viewer/](http://localhost:2999/viewer/) (or the port your server uses)

---

## Reloading Changes

After editing your effect files, click the **Reload Effect** button in the viewer or refresh the page. The viewer will:

1. Reload the effect definition
2. Reload the shader source
3. Recompile the effect
4. Preserve current parameter values

---

## Viewer Structure

```
viewer/
└── index.html              # Main viewer page
```

The Noisemaker runtime is loaded directly from the CDN at `shaders.noisedeck.app/<version>/`.

The viewer loads the effect from `/effect/definition.json` and its shaders from `/effect/glsl/` and/or `/effect/wgsl/`.

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

Edit your shader file (e.g., `effect/glsl/gradientSweep.glsl`). Make sure your shader declares uniforms matching the parameters in `definition.json`.

Click the **Reload Effect** button in the viewer to see your changes.

---

## Creating a New Effect

The viewer always loads from the `effect/` directory. To create a new effect, replace the files in place:

1. Update `effect/definition.json`:
   - Change `name`, `func`, `description`
   - Define your `globals`
   - Update `passes` to reference your shader program name
2. Replace the shader files in `effect/glsl/` and/or `effect/wgsl/` with your own
3. Make sure shader filenames match the `program` name in your `passes` array

---

## Troubleshooting

### "Failed to load effect definition"

- Ensure the local server is running
- Check that `effect/definition.json` exists and is valid JSON

### "Failed to load GLSL shader"

- Verify the shader path matches `passes[0].program` + `.glsl`
- Check for GLSL syntax errors in browser console

### Effect doesn't update

- Click the "↻ Reload Effect" button
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

The viewer loads from `/effect/` by default. To load from a different directory, modify the fetch paths in `viewer/index.html`:

```javascript
// Load effect definition from JSON
async function loadEffectDefinition() {
    const response = await fetch('/my-other-effect/definition.json', { cache: 'no-store' });
    // ...
}
```

---

*See [FORMAT.md](FORMAT.md) for the complete effect specification.*
