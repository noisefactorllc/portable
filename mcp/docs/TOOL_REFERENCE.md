# Portable Effect MCP Tool Reference

Complete reference for all MCP shader testing tools.

---

## compileEffect

**Description:** Compile the portable effect and verify it compiles cleanly.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Rendering backend |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "passes": [
      {
        "name": "pass0",
        "compiled": true,
        "errors": []
      }
    ],
    "errors": []
  }
}
```

**Example:**
```
Compile the effect with webgpu to check for errors
```

---

## renderEffectFrame

**Description:** Render a single frame and analyze if output is monochrome/blank.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Rendering backend |
| `test_case` | object | No | Test configuration |
| `test_case.time` | number | No | Time value to render at |
| `test_case.resolution` | [number, number] | No | Resolution [width, height] |
| `test_case.seed` | number | No | Random seed |
| `test_case.uniforms` | object | No | Uniform overrides |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "metrics": {
      "isMonochrome": false,
      "isBlank": false,
      "avgBrightness": 0.45,
      "colorVariance": 0.15,
      "uniqueColors": 50000
    }
  }
}
```

**Example:**
```
Render a frame at time 2.0 and check if it shows visual content
```

---

## describeEffectFrame

**Description:** Render a frame and get an AI vision description using GPT-4 Vision.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | string | Yes | What to analyze in the image |
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Rendering backend |
| `test_case` | object | No | Test configuration |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass",
    "description": "The image shows flowing organic patterns..."
  }
}
```

**Example:**
```
Describe what visual patterns the effect creates
```

**Note:** Requires `OPENAI_API_KEY` environment variable.

---

## benchmarkEffectFPS

**Description:** Benchmark shader to verify it can sustain target framerate.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | - | Rendering backend |
| `target_fps` | number | Yes | 60 | Target FPS |
| `duration_seconds` | number | No | 5 | Benchmark duration |
| `resolution` | [number, number] | No | [1920, 1080] | Resolution |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "targetFps": 60,
    "actualFps": 58.5,
    "avgFrameTime": 17.1,
    "minFrameTime": 15.2,
    "maxFrameTime": 25.3,
    "framesRendered": 293
  }
}
```

**Example:**
```
Benchmark the effect for 10 seconds at 4K resolution
```

---

## testUniformResponsiveness

**Description:** Test that uniform controls affect shader output.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Rendering backend |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "uniforms": [
      {
        "name": "intensity",
        "responsive": true,
        "similarity": 0.45
      }
    ],
    "unresponsiveCount": 0
  }
}
```

**Example:**
```
Test if all uniform sliders actually change the output
```

---

## testNoPassthrough

**Description:** Test that filter effect does NOT pass through input unchanged.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Rendering backend |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "similarity": 0.15,
    "isPassthrough": false
  }
}
```

**Note:** Fails if input/output similarity > 99%. Only meaningful for filter-type effects.

**Example:**
```
Verify the blur filter actually modifies the input
```

---

## testPixelParity

**Description:** Test pixel-for-pixel parity between GLSL and WGSL outputs.

**Parameters:**
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `epsilon` | number | No | 1 | Max per-channel difference (0-255) |
| `seed` | number | No | 42 | Random seed |

**Returns:**
```json
{
  "epsilon": 1,
  "seed": 42,
  "result": {
    "status": "pass" | "fail",
    "maxDifference": 0,
    "avgDifference": 0,
    "mismatchedPixels": 0,
    "totalPixels": 2073600
  }
}
```

**Example:**
```
Check if GLSL and WGSL produce identical pixels
```

---

## checkEffectStructure

**Description:** Check effect structure on disk for unused files and naming issues. No browser required.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Backend to check |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "fail",
    "issues": [
      {
        "type": "unused_file",
        "file": "old-shader.glsl",
        "message": "File not referenced in definition.json"
      }
    ]
  }
}
```

**Example:**
```
Check for unused shader files in the webgl2 directory
```

---

## checkAlgEquiv

**Description:** Check algorithmic equivalence between GLSL and WGSL using AI. No browser required.

**Parameters:** None

**Returns:**
```json
{
  "result": {
    "status": "pass" | "fail",
    "passes": [
      {
        "name": "pass0",
        "equivalent": true,
        "differences": [],
        "notes": "Both implementations use same algorithm"
      }
    ]
  }
}
```

**Note:** Requires `OPENAI_API_KEY` environment variable.

**Example:**
```
Check if GLSL and WGSL shaders are algorithmically equivalent
```

---

## analyzeBranching

**Description:** Analyze shader code for unnecessary branching. No browser required.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `backend` | `"webgl2"` \| `"webgpu"` | Yes | Shader language to analyze |

**Returns:**
```json
{
  "backend": "webgl2",
  "result": {
    "status": "pass" | "info",
    "branches": [
      {
        "line": 45,
        "type": "if",
        "flattenable": true,
        "reason": "Condition depends only on uniforms"
      }
    ],
    "flattenableCount": 2
  }
}
```

**Note:** Requires `OPENAI_API_KEY` environment variable.

**Example:**
```
Find if statements that could be replaced with math
```
