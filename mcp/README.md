# Portable Effect MCP Shader Tools

MCP (Model Context Protocol) tools for testing portable shader effects. These tools enable VS Code Copilot to compile, render, analyze, and test shader effects.

## Overview

This MCP server provides testing capabilities for portable shader effects. Unlike the full noisemaker MCP tools, portable works with a **single effect at a time** - the effect in the `./effect/` directory.

## Installation

```bash
cd mcp
npm install
```

You also need Playwright installed at the project level:
```bash
cd ..
npm install playwright
```

## Configuration

Add to your VS Code settings (`settings.json`):

```json
{
  "mcp": {
    "servers": {
      "portable-shader-tools": {
        "type": "stdio",
        "command": "node",
        "args": ["/path/to/portable/mcp/server.js"]
      }
    }
  }
}
```

## Available Tools

### Browser-Based Tools

These tools launch a browser to test the shader:

| Tool | Description |
|------|-------------|
| `compileEffect` | Compile the effect and verify clean compilation |
| `renderEffectFrame` | Render a frame and check for monochrome/blank output |
| `describeEffectFrame` | Use AI vision to describe rendered output |
| `benchmarkEffectFPS` | Verify effect can sustain target framerate |
| `testUniformResponsiveness` | Verify uniform controls affect output |
| `testNoPassthrough` | Verify filter effects modify their input |
| `testPixelParity` | Compare GLSL/WGSL pixel outputs |

### On-Disk Tools

These tools analyze shader files without a browser:

| Tool | Description |
|------|-------------|
| `checkEffectStructure` | Detect unused files, naming issues |
| `checkAlgEquiv` | Compare GLSL/WGSL algorithmic equivalence |
| `analyzeBranching` | Identify unnecessary shader branching |

## Tool Parameters

### Common Parameters

- `backend`: `"webgl2"` or `"webgpu"` - Required for most tools

### Test Case Object

Many tools accept an optional `test_case` object:

```json
{
  "time": 1.5,
  "resolution": [1920, 1080],
  "seed": 42,
  "uniforms": {
    "uniformName": 0.75
  }
}
```

## Usage Examples

### Compile and Test

```
Compile the effect with webgl2 backend
```

### Render Analysis

```
Render a frame at time 0.5 and check if it's blank
```

### AI Vision Description

```
Describe what the effect looks like - is it displaying noise?
```

### Performance Testing

```
Benchmark the effect to see if it maintains 60fps
```

### Cross-Backend Parity

```
Test if GLSL and WGSL produce identical output
```

## Project Structure

```
mcp/
├── server.js           # MCP server entry point
├── browser-harness.js  # Browser session management
├── core-operations.js  # Core testing functions
├── package.json        # Dependencies
└── docs/               # Additional documentation
```

## Environment Variables

- `OPENAI_API_KEY`: Required for AI vision analysis (`describeEffectFrame`, `checkAlgEquiv`, `analyzeBranching`)

## Architecture

1. **MCP Server** (`server.js`): Exposes tools via Model Context Protocol
2. **Browser Harness** (`browser-harness.js`): Manages Playwright browser sessions
3. **Core Operations** (`core-operations.js`): Implements testing logic

Each browser-based tool:
1. Creates a fresh browser session
2. Starts an HTTP server for the project
3. Loads the viewer page
4. Runs the test
5. Cleans up browser and server
6. Returns structured results

## Differences from Noisemaker MCP Tools

| Aspect | Noisemaker | Portable |
|--------|------------|----------|
| Effects | Multiple effects with IDs | Single effect |
| Definition | `definition.js` (JavaScript) | `definition.json` (JSON) |
| Viewer | `demo/shaders/` | `viewer/` |
| Bundles | Pre-built bundles supported | Source only |
| DSL | Full DSL compilation | Not supported |

## Troubleshooting

### Browser Won't Start

Ensure Playwright is installed:
```bash
npx playwright install chromium
```

### Port Already in Use

The harness uses a random port. If you see port conflicts, check for orphaned server processes.

### AI Tools Return Errors

Verify `OPENAI_API_KEY` is set:
```bash
export OPENAI_API_KEY=your_key_here
```

## License

MIT
