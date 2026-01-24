# osc2d

2D oscillator pattern

## Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| oscType | member | oscType.sine | - | Oscillator waveform type |
| frequency | int | 1 | 1-32 | Number of bands across the image |
| speed | float | 4 | 0-10 | Animation speed |
| rotation | float | 0 | -180-180 | Rotation angle in degrees |
| seed | int | 0 | 0-1000 | Seed for noise modes |

## Oscillator Types

- `oscType.sine` - Smooth sine wave
- `oscType.linear` - Triangle wave
- `oscType.sawtooth` - Sawtooth wave (rising)
- `oscType.sawtoothInv` - Inverted sawtooth (falling)
- `oscType.square` - Square wave
- `oscType.noise1d` - Scrolling 1D noise
- `oscType.noise2d` - Two-stage periodic noise

## Usage

```
search synth

osc2d(oscType: oscType.sine, frequency: 4, speed: 2.0, rotation: 0, seed: 0)
  .write(o0)

render(o0)
```
