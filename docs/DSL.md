# Polymorphic DSL

The Polymorphic DSL (Domain-Specific Language) is used to compose effects into visual programs.

---

## Basic Structure

Every DSL program starts with a `search` directive, followed by effect chains:

```
search {namespaces}
{effect chains}
render({output})
```

The `search` directive is required. The `render()` directive is optional. If omitted, no output is displayed.

### Example

```
search user, synth, filter

noise(xScale: 50, yScale: 50)
  .blur(radiusX: 5, radiusY: 5)
  .write(o0)

render(o0)
```

---

## Search Directive

The `search` directive declares which namespaces to look up effects from:

```
search user, synth, filter, classicNoisedeck
```

For portable effects, always include `user`:

```
search user

myEffect().write(o0)

render(o0)
```

### Available Namespaces

| Namespace | Description |
|-----------|-------------|
| `user` | User-created portable effects |
| `synth` | 2D generators (starters) |
| `filter` | 2D image processors |
| `mixer` | Blend/composite effects |
| `points` | Particle systems |
| `render` | Utility effects |
| `synth3d` | 3D volumetric generators |
| `filter3d` | 3D volumetric processors |
| `classicNoisedeck` | Legacy Noisedeck effects |

---

## Effect Chains

Effects are chained together with `.` (dot):

```
search synth, filter

noise().blur().adjust().write(o0)
```

### Starter Effects

Starter effects begin a chain (they generate imagery):

```
search synth

noise().write(o0)
```

### Filter Effects

Filter effects must follow another effect:

```
search synth, filter

noise().blur().write(o0)
```

### Mixer Effects

Mixer effects combine the current chain with a second source via the `tex:` parameter:

```
search synth, mixer, filter

noise().write(o0)
gradient().blendMode(tex: read(o0)).write(o1)

render(o1)
```

---

## Parameters

Pass parameters to effects using `name: value` syntax:

```
noise(xScale: 50, yScale: 50, octaves: 5, speed: 1)
```

### Parameter Types

| Type | Syntax | Example |
|------|--------|---------|
| Number | `value` | `xScale: 50` |
| Boolean | `true`/`false` | `invert: true` |
| Enum | `name` | `mode: multiply` |
| Color | `#rrggbb` | `color: #ff6600` |
| Array | `[values]` | `offset: [0.5, 0.3]` |

### Color Syntax

```
solid(color: #ff6600)              // Hex color
```

---

## Output Buffers

Write chains to output buffers with `.write()`:

```
noise().write(o0)     // Write to buffer 0
gradient().write(o1)  // Write to buffer 1
```

Available buffers: `o0` through `o7`

### Reading from Buffers

Use `read()` to reference a buffer:

```
search synth, filter

noise().write(o0)
read(o0).blur(radiusX: 10, radiusY: 10).write(o1)

render(o1)
```

---

## Render Directive

The `render()` directive specifies which buffer to display:

```
render(o0)
```

---

## Using Portable Effects

### Basic Usage

```
search user

myEffect().write(o0)

render(o0)
```

### With Parameters

```
search user

flowingTerrain(
  speed: 0.8,
  scale: 5.0,
  color1: #1a472a,
  color2: #f0f0f5
).write(o0)

render(o0)
```

### In a Chain

If your effect is a filter:

```
search user, synth

noise().myFilter(strength: 0.5).write(o0)

render(o0)
```

### Combined with Library Effects

```
search user, synth, filter

myEffect(scale: 3.0)
  .blur(radiusX: 3, radiusY: 3)
  .adjust(saturation: 1.5)
  .write(o0)

render(o0)
```

---

## Multiline Formatting

Chains can span multiple lines for readability:

```
search user, synth, filter

fractalNoise(
  xScale: 50,
  octaves: 6,
  lacunarity: 2.1,
  persistence: 0.5
)
  .palette(
    index: santaCruz,
    offset: 30
  )
  .blur(radiusX: 2, radiusY: 2)
  .write(o0)

render(o0)
```

---

## Multiple Chains

Create complex compositions with multiple chains:

```
search synth, filter, mixer

// Background pattern
cell(scale: 50)
  .write(o0)

// Blend cells and noise with pattternMix
noise(xScale: 50, yScale: 50)
  .palette(index: brushedMetal)
  .patternMix(tex: read(o0))
  .write(o1)

render(o1)
```

---

## Comments

Use `//` for comments:

```
search synth

// Main pattern
noise(xScale: 50, yScale: 50).write(o0)

// Final output
render(o0)
```

---

## Common Patterns

### Simple Starter

```
search user

myStarter().write(o0)

render(o0)
```

### Filter Chain

```
search user, synth

noise()
  .myFilter(param: 1.0)
  .write(o0)

render(o0)
```

### Layer Composition

```
search user, synth, mixer

effect2().write(o0)

effect1()
  .alphaMask(tex: read(o0))
  .write(o1)

render(o1)
```

### Feedback Loop

```
search synth, filter, render

loopBegin(alpha: 50)
  .noise(blend: 0.05)
  .blur(radiusX: 1, radiusY: 1)
  .loopEnd()
  .write(o0)

render(o0)
```

---

## Error Messages

Common DSL errors and solutions:

### "Illegal chain structure"

A non-starter effect can't begin a chain. It needs input from another effect.

```
// Wrong - myFilter is not a starter
myFilter().write(o0)

// Correct - chain from a starter
noise().myFilter().write(o0)
```

### "Unknown effect"

The effect isn't found in the searched namespaces.

```
// Wrong - missing 'user' namespace
search synth
myEffect().write(o0)

// Correct
search user, synth
myEffect().write(o0)
```

---

## Best Practices

1. **Always include `user` for portable effects**
   ```
   search user, synth, filter
   ```

2. **Use descriptive parameter names**
   ```
   myEffect(speed: 1, complexity: 3)
   ```

3. **Break complex chains across lines**
   ```
   effect()
     .filter1()
     .filter2()
     .write(o0)
   ```

4. **Comment your compositions**
   ```
   // Background layer
   noise().write(o0)
   
   // Foreground
   pattern().write(o1)
   ```

5. **Test effects in isolation first**
   ```
   search user
   myEffect().write(o0)
   render(o0)
   ```
