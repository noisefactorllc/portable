# Portable Effects Format Specification

**Version 1.1 — 3D volume effects**

This document defines the complete specification for portable shader effects in the Noisemaker ecosystem.

## Multi-effect workspace envelope

`workspace.mjs` defines workspace version 1, an enclosing JSON format independent
of the individual effect format version above. Individual effect packages keep
their original files and definitions. This is a data contract; consumers still
need compiler and renderer validation before accepting an edited composition.

| Field | Required value or meaning |
| --- | --- |
| `format` | `"noisefactor-workspace"` |
| `version` | `1` |
| `id` | Stable workspace identity |
| `revision` | Nonnegative safe integer; starts at 0 |
| `effects` | Array of `{ id, files }` portable packages |
| `assets` | Workspace-level encoded file map |
| `composition` | `{ dsl, effectIds }`: program and authored dependencies |

Each effect carries `definition.json` and at least one GLSL or WGSL shader.
A complete two-effect fixture is in
[`fixtures/two-effect-workspace.json`](../fixtures/two-effect-workspace.json).
Every file entry maps a relative path to `{ "encoding": "utf8", "data": "..." }`
or `{ "encoding": "base64", "data": "..." }`. Definitions and shaders use UTF-8;
binary assets use canonical padded base64. File paths cannot be absolute, use
backslashes, contain control characters or colons, or contain empty, dot,
parent, or prototype-related segments. Effect file paths are relative to that
effect's package; workspace asset paths are relative to the workspace asset
collection. Asset resolution is the consumer's responsibility: this format
does not rewrite shader source or fetch external resources.

Workspace and effect IDs are stable strings of 1–128 ASCII letters, digits,
underscores, or hyphens, starting with a letter or digit. IDs do not change when
display names change. Each effect registers in `user` using its definition's
`func` (or `name` if `func` is absent); duplicate IDs or function names are
rejected rather than silently renamed. Parameters retain their declarations
and defaults in `definition.json`; composition values are expressed in the DSL,
so there is no second parameter-value map to reconcile.

`composition.effectIds` explicitly lists the authored effect dependencies.
It must contain unique IDs present in `effects`. Unused authored effects may
remain in the workspace. Consumers use the Noisemaker compiler to discover DSL
dependencies and check them against this list; envelope validation alone does
not claim that the list matches the DSL. Built-in effects are resolved by the
consumer's pinned Noisemaker version. The DSL must be nonempty. Unknown envelope
fields or versions are rejected to prevent unsupported data being discarded.

The browser-compatible module exports:

- `parseWorkspace(json)` and `serializeWorkspace(workspace)`: validate and
  round-trip the complete envelope, preserving effect files and assets.
- `importSingleEffect(files, { workspaceId, effectId, dsl? })`: wrap a legacy
  map of UTF-8 file contents at revision 0. It uses `defaultProgram` when no DSL
  is supplied; packages without a default require explicit DSL. ZIP extraction
  and binary legacy-file decoding belong to the importer.
- `exportEffect(workspace, effectId)`: return a detached encoded file map for
  that individual package. Workspace assets are not implicitly copied into an
  individual export; a consumer must resolve or reject external dependencies.
- `replaceEffect(workspace, effectId, files, { expectedRevision })`: produce a
  detached candidate at the next revision. It preserves the other effects,
  assets, and composition, rejects a stale revision or changed DSL function
  identity, and never mutates the original workspace.

The consumer compiles and renders a candidate before committing it to history.
After asynchronous validation, it compares the current revision again before
commit. Failure or a revision conflict retains the previous valid workspace.
Undo and redo restore content through new monotonically increasing revisions;
they must not reuse an old revision and thereby make a stale result applicable.
These transaction and history behaviors belong to the consumer, not the file
codec. A structurally valid file is not a rendered acceptance result.

---

## File Structure

A portable effect is a directory or ZIP archive containing:

```
effect-name/
├── definition.json           # REQUIRED: Effect metadata
├── glsl/                     # At least one of glsl/ or wgsl/ REQUIRED
│   ├── main.glsl             # Primary fragment shader
│   └── *.glsl                # Additional shaders (multi-pass)
├── wgsl/                     # At least one of glsl/ or wgsl/ REQUIRED
│   ├── main.wgsl             # Primary fragment shader
│   └── *.wgsl                # Additional shaders (multi-pass)
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
      "type": "color",
      "default": [1.0, 0.5, 0.0],
      "uniform": "baseColor"
    }
  },
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": {},
      "outputs": { "color": "outputTex" }
    }
  ]
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
| `description` | string | `""` | Human-readable description |
| `starter` | boolean | inferred | Whether effect can start a chain; infer from pipeline input bindings when omitted |
| `tags` | string[] | `[]` | Categorization tags |
| `globals` | object | `{}` | Parameter definitions |
| `passes` | array | auto | Rendering pass configuration |
| `textures` | object | `{}` | Internal texture definitions |
| `defaultProgram` | string | | Example DSL program for this effect |
| `paramAliases` | object | | Legacy parameter names mapped to current parameter names |
| `outputTex3d` | string/null | | Internal volume atlas exposed to the next effect, or `inputTex3d` for passthrough; legacy `null` means absent |
| `outputGeo` | string/null | | Internal geometry texture exposed to the next effect, or `inputGeo` for passthrough; legacy `null` means absent |
| `uniformLayout` | object/array | | Explicit WGSL uniform-buffer field layout, when required by the shader |
| `uniformLayouts` | object | | Program-name to WGSL uniform layout mapping for multi-pass shaders |

---

## The `starter` Field

Portable effects can generate or process 2D images and 3D volumes, or render
3D volumes into images. All register in `user`; `starter` describes whether
an effect can begin a chain, independently of its output dimensions.

The `starter` field determines which type:

- **`starter: true`** - Effect generates imagery from scratch (no input required). These are called "synths" in Noisedeck.
- **`starter: false`** - Effect requires input from a previous effect in the chain.

### Starter Effects

```json
{
  "starter": true,
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": {},
      "outputs": { "color": "outputTex" }
    }
  ]
}
```

DSL usage:
```
search user, filter

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
      "inputs": { "inputTex": "inputTex" },
      "outputs": { "color": "outputTex" }
    }
  ]
}
```

DSL usage:
```
search synth, user

noise().myFilter().write(o0)
```

---

## Tags

Tags help categorize effects for searchability:

| Tag | Description |
|-----|-------------|
| `3d` | 3D volumetric effects |
| `antialiasing` | Edge smoothing |
| `audio` | Audio-reactive effects |
| `blur` | Blurs |
| `color` | Color manipulation |
| `distort` | Input distortion |
| `edges` | Accentuate or isolate edges |
| `fractal` | Fractals |
| `geometric` | Shapes |
| `lens` | Camera lens effects |
| `pattern` | Repeating patterns |
| `pixel` | Pixelated effects |
| `midi` | MIDI-reactive effects |
| `noise` | Noise-based effects |
| `sim` | Simulations with temporal state |
| `text` | Text effects |
| `transform` | Moves/rotates |
| `util` | Utility functions |

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
  "outputs": { "color": "outputTex" }
}]
```

**Filter effect (single pass):**
```json
"passes": [{
  "name": "render",
  "program": "main",
  "inputs": { "inputTex": "inputTex" },
  "outputs": { "color": "outputTex" }
}]
```

### Multi-Pass Definition

```json
"passes": [
  {
    "name": "blur_h",
    "program": "blur",
    "inputs": { "inputTex": "inputTex" },
    "outputs": { "color": "tempTex" }
  },
  {
    "name": "blur_v",
    "program": "blur",
    "inputs": { "inputTex": "tempTex" },
    "outputs": { "color": "outputTex" }
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
| `viewport` | object | No | Pass width and height; use atlas dimensions for volume passes |
| `drawBuffers` | integer | No | Number of color attachments for a multi-output pass |
| `type` | string | No | `render` (default) or `compute`; state updates use the runtime's compute pass contract |

### Special Texture Names

| Name | Description |
|------|-------------|
| `inputTex` | Pipeline input texture (from previous effect in chain) |
| `outputTex` | Pipeline output texture (to next effect in chain) |
| `inputTex3d` | Upstream 3D volume atlas |
| `inputGeo` | Upstream geometry texture; its meaning depends on the preceding stage |
| `outputTex3d` | Direct 3D output binding; an internal texture plus the top-level `outputTex3d` field is preferred when declaring its dimensions |

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
Dimensions also accept `screen`, `auto`, percentages such as `"50%"`,
`{ "scale": 0.5 }`, and `{ "screenDivide": "zoom", "default": 1 }`.
Parameter dimensions use `{ "param": "volumeSize" }` with optional
`multiply`, `power`, `paramDefault`, and final computed `default` values.

### Volume textures and geometry

Noisemaker's existing 3D effects store an N³ volume in an N × N² RGBA atlas.
Voxel `(x, y, z)` occupies texel `(x, y + z * N)`. Use integer texel reads;
this is data addressing, not image UV mapping. WGSL volume writers use native
pixel coordinates without the screen-space Y flip used by 2D image shaders.

Declare both texture dimensions and the pass viewport. A volume does not
inherit the canvas resolution:

```json
{
  "name": "My Volume",
  "func": "myVolume",
  "starter": true,
  "globals": {
    "volumeSize": { "type": "int", "default": 64, "uniform": "volumeSize" }
  },
  "textures": {
    "volume": {
      "width": { "param": "volumeSize", "default": 64 },
      "height": { "param": "volumeSize", "power": 2, "default": 4096 },
      "format": "rgba16f"
    },
    "geometry": {
      "width": { "param": "volumeSize", "default": 64 },
      "height": { "param": "volumeSize", "power": 2, "default": 4096 },
      "format": "rgba16f"
    }
  },
  "passes": [{
    "name": "fill", "program": "fill", "drawBuffers": 2,
    "viewport": {
      "width": { "param": "volumeSize", "default": 64 },
      "height": { "param": "volumeSize", "power": 2, "default": 4096 }
    },
    "inputs": {},
    "outputs": { "color": "volume", "geoOut": "geometry" }
  }],
  "outputTex3d": "volume",
  "outputGeo": "geometry",
  "defaultProgram": "search user, render\nmyVolume().render3d().write(o0)\nrender(o0)"
}
```

For a volume **filter**, read `inputTex3d`, write an explicitly sized atlas,
and expose it through `outputTex3d`. Use `outputGeo: "inputGeo"` when geometry
is unchanged; passthrough does not require an unused shader sampler. The
runtime inherits `volumeSize` from the upstream generator. Consumers must
preserve missing defaults and must not write UI defaults over that inherited
value after compilation.

For a volume **renderer**, read `inputTex3d` (and `inputGeo` when needed),
write `outputTex`, and expose a screen-sized geometry target through
`outputGeo`. It stores encoded normals in RGB and depth in A. Set
`outputTex3d: "inputTex3d"` to retain the upstream volume.

The built-in `render3d` and `renderLit3d` threshold the atlas's red channel
and use RGB for color. Upstream volume geometry can separately carry density
in A and encoded normals in RGB. A renderer using that independent density
must explicitly implement that interpretation; merely changing an RGB palette
does not change the built-in renderers' threshold convention. Geometry from a
volume generator is an atlas; geometry from a renderer is a screen image.

Existing generators support cubic resolutions such as 16, 32, 64, and 128,
subject to the device's maximum texture dimension. A wide rectangular world
needs its own addressing and storage scheme; it is not a larger `volumeSize`
for the existing cubic filters. All textures remain RGBA. Do not allocate
user surfaces `o0`–`o7` as internal effect storage.

### Programs and compatibility

`defaultProgram` is a complete DSL program, including `search user` and any
built-in namespaces it uses. A 3D filter or renderer needs an upstream volume
in this program. The viewer loads those built-in dependencies before compiling.
A volume starter without a default program gets a `render3d()` preview;
filters must provide their input program.

The viewer accepts `?effect=../examples/portableBlock3d/` to preview another
package directory. Existing 2D packages keep their directory and ZIP layout.
Older consumers that discard the 3D metadata cannot run these packages
correctly; they need the consumer changes described below.

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

When a portable effect is loaded, it's registered in the `user` namespace under these keys:

1. `user.{func}` - Dot-separated name (e.g., `user.plasmaWave`)
2. `user/{func}` - Slash-separated ID (e.g., `user/plasmaWave`)

The DSL's `search` directive controls which namespaces are searched:

```
search user, synth, filter

plasmaWave().blur().write(o0)

render(o0)
```

### Consumer Contract

Consumer apps (noisedeck, polymorphic, foundry, sharing's embed page, etc.) MUST
wrap portable effect data in an `Effect` class instance before passing it to
`registerEffect`. The runtime pipeline relies on identity checks against
`Effect.prototype` (e.g. `effectDef.asyncInit === Effect.prototype.asyncInit`) to
decide which lifecycle hooks to run. Plain object literals fail those guards and
cause runtime errors such as `TypeError: t.asyncInit is not a function`.

The correct pattern:

```js
import { CanvasRenderer, Effect, mergeIntoEnums, registerStarterOps } from './noisemaker/bundle.js'

const instance = new Effect({
    name: effectData.name,
    namespace: 'user',
    func: effectData.func,
    description: effectData.description,
    tags: effectData.tags,
    globals: effectData.globals,
    passes: effectData.passes,
    textures: effectData.textures,
    outputTex3d: effectData.outputTex3d,
    outputGeo: effectData.outputGeo,
    uniformLayout: effectData.uniformLayout,
    uniformLayouts: effectData.uniformLayouts,
    defaultProgram: effectData.defaultProgram,
    paramAliases: effectData.paramAliases
})
instance.shaders = effectData.shaders  // attached after construction
const pipelineInputs = ['inputTex', 'inputTex3d', 'inputGeo', 'src',
    'o0', 'o1', 'o2', 'o3', 'o4', 'o5', 'o6', 'o7']
instance.starter = effectData.starter ?? !(instance.passes || []).some(pass =>
    Object.values(pass.inputs || {}).some(input => pipelineInputs.includes(input)))

const choices = CanvasRenderer.prototype.registerEffectWithRuntime({
    namespace: 'user', name: instance.func, instance
})
if (choices && Object.keys(choices).length) await mergeIntoEnums(choices)
if (instance.starter) registerStarterOps([`user.${instance.func}`])
```

The `shaders` object is attached after construction because the `Effect`
constructor does not accept it as config — it's runtime data the pipeline
reads directly off the registered instance.

Use the runtime registration method to retain parameter aliases, uniform names,
and sanitized choice names. Consumers that require namespace-only registry
entries must also preserve any existing bare-name entry around this call, as
Foundry does.

Preserve the same declarative fields when saving workspaces, importing shared
effects, re-sharing them, and exporting ZIPs. Preserve **both** shader languages,
including WGSL-only packages. Register parameter choice enums before compiling;
an explicit `enum` or `enumPath` takes precedence over a generated choice path.
Keep effects in the `user` namespace. If `starter` is omitted, infer it from
pipeline input bindings rather than the effect's position in a sample program.

---

## Validation

A valid portable effect MUST have:

1. A `definition.json` with at least `name` or `func`
2. At least one shader file in `glsl/` or `wgsl/` (or both)
3. Program names in `passes` must match shader filenames in each provided directory

A valid portable effect SHOULD have:

- Both `glsl/` and `wgsl/` shaders for full cross-backend interoperability
- A meaningful `description`
- Appropriate `tags` for searchability
- Correct `starter` field matching the effect type
- Parameter `min`/`max` ranges for UI sliders

---

## Example: Complete Starter Effect

### definition.json

```json
{
  "name": "Flowing Terrain",
  "func": "flowingTerrain",
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
      "type": "color",
      "default": [0.1, 0.4, 0.2]
    },
    "color2": {
      "type": "color",
      "default": [0.9, 0.9, 0.95]
    }
  },
  "defaultProgram": "search user\nflowingTerrain(speed: 0.8, scale: 5.0, height: 0.5).write(o0)\nrender(o0)",
  "passes": [
    {
      "name": "render",
      "program": "main",
      "inputs": {},
      "outputs": { "color": "outputTex" }
    }
  ]
}
```

The `defaultProgram` field contains an example DSL program that demonstrates the effect with good parameter values. Applications use this as the initial program when the effect is loaded.

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
