# Polymorphic DSL

The Polymorphic DSL (Domain-Specific Language) is used to compose effects into visual programs.

---

## Basic Structure

Every DSL program has three parts:

```
search {namespaces}
{effect chains}
render({outputs})
```

### Example

```
search user, synth, filter

noise(scale: 4.0)
  .blur(amount: 0.5)
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
| `classicNoisemaker` | Python noisemaker ports |

---

## Effect Chains

Effects are chained together with `.` (dot):

```
noise().blur().colorspace().write(o0)
```

### Starter Effects

Starter effects begin a chain (they generate imagery):

```
noise().write(o0)
```

### Filter Effects

Filter effects must follow another effect:

```
noise().blur().write(o0)
```

### Mixer Effects

Mixer effects combine two sources:

```
noise().write(o0)
gradient().blendMode(tex: read(o0), mode: multiply).write(o1)
render(o1)
```

---

## Parameters

Pass parameters to effects using `name: value` syntax:

```
noise(scale: 4.0, octaves: 5, speed: 0.5)
```

### Parameter Types

| Type | Syntax | Example |
|------|--------|---------|
| Number | `value` | `scale: 4.0` |
| Boolean | `true`/`false` | `invert: true` |
| Enum | `name` | `mode: multiply` |
| Color | `#rrggbb` | `color: #ff6600` |
| Array | `[values]` | `offset: [0.5, 0.3]` |

### Color Syntax

```
solid(r: 1.0, g: 0.5, b: 0.0)        // RGB components
colorize(color: #ff6600)             // Hex color
tint(color: [1.0, 0.5, 0.0])         // Array format
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
noise().write(o0)
blur(input: read(o0), amount: 0.8).write(o1)
render(o1)
```

---

## Render Directive

The `render()` directive specifies which buffer(s) to display:

```
render(o0)           // Single output
render(o0, o1)       // Multiple outputs (tiled)
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
noise().myFilter(amount: 0.5).write(o0)
render(o0)
```

### Combined with Library Effects

```
search user, synth, filter
myEffect(scale: 3.0)
  .blur(amount: 0.3)
  .colorspace(saturation: 1.5)
  .write(o0)
render(o0)
```

---

## Multiline Formatting

Chains can span multiple lines for readability:

```
search user, synth, filter

fractalNoise(
  scale: 4.0,
  octaves: 6,
  lacunarity: 2.1,
  persistence: 0.5
)
  .colorize(
    palette: rainbow,
    offset: 0.3
  )
  .blur(amount: 0.1)
  .write(o0)

render(o0)
```

---

## Multiple Chains

Create complex compositions with multiple chains:

```
search synth, filter, mixer

// Background
noise(scale: 2.0)
  .colorize(palette: sunset)
  .write(o0)

// Foreground pattern
voronoi(scale: 8.0)
  .write(o1)

// Combine them
blendMode(
  a: read(o0),
  b: read(o1),
  mode: overlay
).write(o2)

render(o2)
```

---

## Comments

Use `//` for comments:

```
search synth

// Main pattern
noise(scale: 4.0).write(o0)

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

effect1().write(o0)
effect2().write(o1)

blendMode(a: read(o0), b: read(o1), mode: add).write(o2)
render(o2)
```

### Feedback Loop

```
search synth, filter, render

loopBegin(feedback: read(o0))
  .noise(blend: 0.05)
  .blur(amount: 0.01)
  .loopEnd()
  .write(o0)

render(o0)
```

---

## Error Messages

Common DSL errors and solutions:

### "Illegal chain structure"

The effect can't start a chain. It needs input from another effect.

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

### "write() requires an input"

Every chain must begin with a starter effect.

```
// Wrong
.blur().write(o0)

// Correct
noise().blur().write(o0)
```

---

## Best Practices

1. **Always include `user` for portable effects**
   ```
   search user, synth, filter
   ```

2. **Use descriptive parameter names**
   ```
   myEffect(speed: 0.5, complexity: 3)
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
