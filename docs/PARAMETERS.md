# Defining Parameters (Globals)

Parameters expose shader uniforms to the user interface and DSL. They're defined in the `globals` object of definition.json.

---

## Basic Structure

```json
"globals": {
  "parameterName": {
    "type": "float",
    "default": 1.0,
    "uniform": "parameterName",
    "min": 0.0,
    "max": 10.0
  }
}
```

The key (`parameterName`) is used in DSL programs. The `uniform` field specifies the GLSL uniform name (defaults to the key if omitted).

---

## Supported Types

| Type | GLSL Type | Default Format | UI Control |
|------|-----------|----------------|------------|
| `float` | `float` | `1.0` | Slider |
| `int` | `int` | `4` | Slider (integer steps) |
| `boolean` | `bool` | `true` | Toggle |
| `vec2` | `vec2` | `[0.5, 0.5]` | Dual sliders |
| `vec3` | `vec3` | `[1.0, 0.0, 0.5]` | Triple slider |
| `color` | `vec3` | `[1.0, 0.0, 0.5]` | Color picker (hex in DSL) |

---

## Parameter Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | **Yes** | Data type (see above) |
| `default` | varies | **Yes** | Default value |
| `uniform` | string | No | GLSL uniform name (defaults to key) |
| `min` | number | No | Minimum slider value (float/int only) |
| `max` | number | No | Maximum slider value (float/int only, default 100) |
| `step` | number | No | Slider step increment (float/int only) |
| `choices` | object | No | Enum choices for dropdown (int only) |

---

## Float Parameters

```json
"amplitude": {
  "type": "float",
  "default": 1.0,
  "min": 0.0,
  "max": 2.0,
  "step": 0.01
}
```

GLSL:
```glsl
uniform float amplitude;
```

DSL:
```
myEffect(amplitude: 1.5)
```

---

## Integer Parameters

```json
"octaves": {
  "type": "int",
  "default": 4,
  "min": 1,
  "max": 8
}
```

GLSL:
```glsl
uniform int octaves;
```

DSL:
```
myEffect(octaves: 6)
```

---

## Boolean Parameters

```json
"invert": {
  "type": "boolean",
  "default": false
}
```

GLSL:
```glsl
uniform bool invert;
```

DSL:
```
myEffect(invert: true)
```

---

## Vector Parameters

### vec2

```json
"offset": {
  "type": "vec2",
  "default": [0.5, 0.5]
}
```

GLSL:
```glsl
uniform vec2 offset;
```

DSL:
```
myEffect(offset: vec2(0.5, 0.25))
```

### vec3

```json
"lightDirection": {
  "type": "vec3",
  "default": [1.0, 0.5, 0.0]
}
```

GLSL:
```glsl
uniform vec3 lightDirection;
```

DSL:
```
myEffect(lightDirection: vec3(1.0, 0.5, 0.0))
```

### vec3 (Color)

```json
"tint": {
  "type": "color",
  "default": [1.0, 0.5, 0.0]
}
```

GLSL:
```glsl
uniform vec3 tint;
```

DSL (color params use hex formatting):
```
tint(color: #ff8040)
```

---

## Choice/Enum Parameters

For dropdown selections: 

**Note:** choice names MUST:
* Not begin with a number
* Not contain a hyphen ( - )
* Not contain spaces or special characters

```json
"blendMode": {
  "type": "int",
  "default": 0,
  "choices": {
    "normal": 0,
    "multiply": 1,
    "screen": 2,
    "overlay": 3,
    "add": 4
  }
}
```

GLSL:
```glsl
uniform int blendMode;

void main() {
    if (blendMode == 0) { /* normal */ }
    else if (blendMode == 1) { /* multiply */ }
    // ...
}
```

DSL:
```
myEffect(blendMode: multiply)
```

---

## Uniform Name Mapping

The `uniform` property allows different names in DSL vs GLSL:

```json
"globals": {
  "speed": {
    "type": "float",
    "default": 1.0,
    "uniform": "u_speed"
  }
}
```

- DSL uses: `myEffect(speed: 2.0)`
- GLSL uses: `uniform float u_speed;`

If `uniform` is omitted, the parameter key is used as the uniform name (`speed`, in this example).

---

## Built-in Uniforms

These uniforms are automatically provided by the runtime and should NOT be defined in `globals`:

| Uniform | Type | Description |
|---------|------|-------------|
| `resolution` | `vec2` | Canvas size in pixels |
| `time` | `float` | Normalized time 0.0–1.0 over loop duration |
| `frame` | `int` | Current frame number |
| `aspect` | `float` | Width / height ratio |

### Using Time

```glsl
#define TAU 6.28318530718

uniform float time;

void main() {
    // time goes 0.0 → 1.0 over the loop duration
    float t = time * TAU;  // Full cycle per loop
    float wave = sin(t);
}
```

### Texture Samplers

For filter effects, the input texture is bound to a sampler:

```glsl
uniform vec2 resolution;
uniform sampler2D inputTex;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 color = texture(inputTex, uv);
}
```

---

## UI Properties

The `ui` object controls how a parameter appears in the application UI:

- `ui.label` - Display label for the control (defaults to the parameter key)
- `ui.category` - Group name for organizing related parameters

```json
"scaleX": {
  "type": "float",
  "default": 75,
  "min": 1,
  "max": 100,
  "ui": {
    "label": "horiz scale",
    "category": "transform"
  }
},
"speed": {
  "type": "float",
  "default": 1.0,
  "min": 0.0,
  "max": 2.0,
  "ui": {
    "label": "speed",
    "category": "animation"
  }
}
```

Parameters with the same `category` value are grouped together. Parameters without a category appear ungrouped or in a `general` category.

---

## Best Practices

### 1. Always Specify Ranges For Int and Float Params

```json
"scale": {
  "type": "float",
  "default": 1.0,
  "min": 0.1,
  "max": 10.0
}
```

Without `min`/`max`, slider controls default to 0-100 which may not be appropriate for your parameter.

### 2. Use Sensible Defaults

Defaults should produce a visible, interesting result out of the box.

### 3. Match Uniform Names

Keep parameter keys and uniform names identical unless you have a reason to differ:

```json
"scale": {
  "type": "float",
  "default": 2.0
}
```

```glsl
uniform float scale;  // Matches the parameter key
```

### 4. Document Parameters

Use the optional `description` field:

```json
"lacunarity": {
  "type": "float",
  "default": 2.0,
  "min": 1.0,
  "max": 4.0,
  "description": "Frequency multiplier between octaves"
}
```

### 5. Group Related Parameters

Use `ui.category` to organize complex effects:

```json
"scale": { "type": "float", "default": 3.0, "ui": { "category": "noise" } },
"octaves": { "type": "int", "default": 5, "ui": { "category": "noise" } },
"speed": { "type": "float", "default": 0.5, "ui": { "category": "animation" } }
```

---

## Complete Example

```json
{
  "name": "Fractal Noise",
  "func": "fractalNoise",
  "starter": true,
  "globals": {
    "scale": {
      "type": "float",
      "default": 3.0,
      "min": 0.5,
      "max": 20.0,
      "description": "Base frequency scale",
      "ui": { "category": "noise" }
    },
    "octaves": {
      "type": "int",
      "default": 5,
      "min": 1,
      "max": 10,
      "description": "Number of noise layers",
      "ui": { "category": "noise" }
    },
    "lacunarity": {
      "type": "float",
      "default": 2.0,
      "min": 1.0,
      "max": 4.0,
      "description": "Frequency multiplier per octave",
      "ui": { "category": "noise" }
    },
    "persistence": {
      "type": "float",
      "default": 0.5,
      "min": 0.0,
      "max": 1.0,
      "description": "Amplitude decay per octave",
      "ui": { "category": "noise" }
    },
    "speed": {
      "type": "float",
      "default": 0.5,
      "min": 0.0,
      "max": 2.0,
      "description": "Animation speed",
      "ui": { "category": "animation" }
    },
    "color1": {
      "type": "color",
      "default": [0.0, 0.0, 0.2],
      "description": "Dark color",
      "ui": { "category": "color", "label": "dark color" }
    },
    "color2": {
      "type": "color",
      "default": [1.0, 0.8, 0.4],
      "description": "Light color",
      "ui": { "category": "color", "label": "light color" }
    }
  },
  "defaultProgram": "search user\nfractalNoise(scale: 5.0, octaves: 6).write(o0)\nrender(o0)",
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
