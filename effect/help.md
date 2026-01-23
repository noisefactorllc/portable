# example

Solid color fill - example portable effect

This is an example portable effect that demonstrates the portable effects format.
It simply fills the output with a solid color.

## Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| r | float | 0.5 | 0-1 | Red channel |
| g | float | 0.5 | 0-1 | Green channel |
| b | float | 0.5 | 0-1 | Blue channel |
| a | float | 1.0 | 0-1 | Alpha channel |

## Usage

```
search user

example(r: 1.0, g: 0.0, b: 0.0)
  .write(o0)

render(o0)
```
