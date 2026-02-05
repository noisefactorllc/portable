#!/usr/bin/env node
/**
 * MCP Server for Portable Effect Testing
 *
 * This MCP server exposes portable effect testing capabilities as tools that can be
 * used by VS Code Copilot coding agent. It provides:
 *
 * BROWSER-BASED TOOLS (require browser session):
 * - compileEffect: Compile the effect and verify it compiles cleanly
 * - renderEffectFrame: Render a frame and check for monochrome/blank output
 * - describeEffectFrame: Use AI vision to describe rendered output
 * - benchmarkEffectFPS: Verify shader can sustain target framerate
 * - testUniformResponsiveness: Verify uniform controls affect output
 * - testNoPassthrough: Verify filter effects modify their input
 * - testPixelParity: Compare GLSL and WGSL outputs
 *
 * ON-DISK TOOLS (no browser required):
 * - checkEffectStructure: Detect unused files, naming issues
 * - checkAlgEquiv: Compare GLSL/WGSL algorithmic equivalence
 * - analyzeBranching: Identify unnecessary shader branching
 *
 * Each browser-based tool invocation:
 * 1. Creates a fresh browser session
 * 2. Loads the viewer and configures the backend
 * 3. Runs the test
 * 4. Tears down the browser session
 * 5. Returns structured results
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

import {
    BrowserSession,
    checkEffectStructureOnDisk,
    checkAlgEquivOnDisk,
    analyzeBranchingOnDisk,
    compareShadersOnDisk,
    gracePeriod
} from './browser-harness.js'

const server = new Server(
    {
        name: 'portable-shader-tools',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
)

/**
 * Tool definitions.
 *
 * Portable effects work with a single effect at a time,
 * so tools don't need effect_id parameters - they test the
 * effect in the ./effect directory.
 */
const TOOLS = [
    // =========================================================================
    // BROWSER-BASED TOOLS
    // =========================================================================
    {
        name: 'compileEffect',
        description: 'Compile the portable effect and verify it compiles cleanly. Returns detailed pass-level diagnostics.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend to use (required)'
                }
            },
            required: ['backend']
        }
    },
    {
        name: 'renderEffectFrame',
        description: 'Render a single frame of the portable effect and analyze if the output is monochrome/blank. Returns image metrics.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend to use (required)'
                },
                test_case: {
                    type: 'object',
                    description: 'Optional test configuration',
                    properties: {
                        time: { type: 'number', description: 'Time value to render at' },
                        resolution: {
                            type: 'array',
                            items: { type: 'number' },
                            minItems: 2,
                            maxItems: 2,
                            description: 'Resolution [width, height]'
                        },
                        seed: { type: 'number', description: 'Random seed' },
                        uniforms: {
                            type: 'object',
                            additionalProperties: true,
                            description: 'Uniform overrides'
                        }
                    }
                }
            },
            required: ['backend']
        }
    },
    {
        name: 'describeEffectFrame',
        description: 'Render a frame and get an AI vision description. Uses OpenAI GPT-4 Vision to analyze the rendered output.',
        inputSchema: {
            type: 'object',
            properties: {
                prompt: {
                    type: 'string',
                    description: 'Vision prompt - what to analyze or look for in the image'
                },
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend to use (required)'
                },
                test_case: {
                    type: 'object',
                    description: 'Optional test configuration',
                    properties: {
                        time: { type: 'number' },
                        resolution: { type: 'array', items: { type: 'number' }, minItems: 2, maxItems: 2 },
                        seed: { type: 'number' },
                        uniforms: { type: 'object', additionalProperties: true }
                    }
                }
            },
            required: ['prompt', 'backend']
        }
    },
    {
        name: 'benchmarkEffectFPS',
        description: 'Benchmark the portable effect to verify it can sustain a target framerate. Runs for a specified duration and measures frame times.',
        inputSchema: {
            type: 'object',
            properties: {
                target_fps: {
                    type: 'number',
                    default: 60,
                    description: 'Target FPS to achieve'
                },
                duration_seconds: {
                    type: 'number',
                    default: 5,
                    description: 'Duration of benchmark in seconds'
                },
                resolution: {
                    type: 'array',
                    items: { type: 'number' },
                    minItems: 2,
                    maxItems: 2,
                    description: 'Resolution [width, height]'
                },
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend (required)'
                }
            },
            required: ['target_fps', 'backend']
        }
    },
    {
        name: 'testUniformResponsiveness',
        description: 'Test that uniform controls affect shader output. Renders with default values, then with modified values, and checks if output differs.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend (required)'
                }
            },
            required: ['backend']
        }
    },
    {
        name: 'testNoPassthrough',
        description: 'Test that filter effect does NOT pass through input unchanged. Passthrough/no-op/placeholder shaders are STRICTLY FORBIDDEN. Compares input and output textures. Fails if textures are >99% similar.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Rendering backend (required)'
                }
            },
            required: ['backend']
        }
    },
    {
        name: 'testPixelParity',
        description: 'Test pixel-for-pixel parity between GLSL (WebGL2) and WGSL (WebGPU) shader outputs. Renders at frame 0 with both backends and compares pixels. Fails if pixel values differ beyond epsilon tolerance.',
        inputSchema: {
            type: 'object',
            properties: {
                epsilon: {
                    type: 'number',
                    default: 1,
                    description: 'Maximum per-channel pixel difference allowed (0-255 scale). Default: 1'
                },
                seed: {
                    type: 'number',
                    default: 42,
                    description: 'Random seed for reproducible noise generation'
                }
            },
            required: []
        }
    },

    // =========================================================================
    // ON-DISK TOOLS (no browser required)
    // =========================================================================
    {
        name: 'checkEffectStructure',
        description: 'Check effect structure on disk for unused files, broken references, naming issues. Does NOT require a browser.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Backend to check (affects which shader directory is scanned)'
                }
            },
            required: ['backend']
        }
    },
    {
        name: 'checkAlgEquiv',
        description: 'Check algorithmic equivalence between GLSL and WGSL shader implementations using AI. Only flags truly divergent algorithms, not language-specific syntax differences. Does NOT require a browser.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'compareShaders',
        description: 'Compare GLSL and WGSL shader sources side-by-side. Returns both sources with structural analysis: shared/divergent functions, uniform matching, line counts. No browser or API key required.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'analyzeBranching',
        description: 'Analyze shader code for unnecessary branching that could be flattened. Uses AI to identify opportunities to reduce conditional branching. Does NOT require a browser.',
        inputSchema: {
            type: 'object',
            properties: {
                backend: {
                    type: 'string',
                    enum: ['webgl2', 'webgpu'],
                    description: 'Which shader language to analyze (required)'
                }
            },
            required: ['backend']
        }
    }
]

/**
 * Run a browser-based test.
 */
async function runBrowserTest(args, testFn) {
    const backend = args.backend

    if (!backend) {
        throw new Error('backend parameter is required')
    }

    // Setup: Create fresh browser session
    const session = new BrowserSession({ backend, headless: true })

    try {
        await session.setup()

        // Run the test
        const result = await testFn(session, args)

        // Grace period
        await gracePeriod()

        return {
            backend,
            result
        }

    } finally {
        // Teardown: Close browser session
        await session.teardown()
    }
}

/**
 * Handle list tools request
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS }
})

/**
 * Handle tool call request
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    try {
        let result

        switch (name) {
            // =================================================================
            // BROWSER-BASED TOOLS
            // =================================================================

            case 'compileEffect': {
                result = await runBrowserTest(args, async (session) => {
                    return await session.compileEffect()
                })
                break
            }

            case 'renderEffectFrame': {
                const testCase = args.test_case || {}
                result = await runBrowserTest(args, async (session) => {
                    return await session.renderEffectFrame({
                        time: testCase.time,
                        resolution: testCase.resolution,
                        seed: testCase.seed,
                        uniforms: testCase.uniforms
                    })
                })
                break
            }

            case 'describeEffectFrame': {
                const testCase = args.test_case || {}
                result = await runBrowserTest(args, async (session) => {
                    return await session.describeEffectFrame(args.prompt, {
                        time: testCase.time,
                        resolution: testCase.resolution,
                        seed: testCase.seed,
                        uniforms: testCase.uniforms
                    })
                })
                break
            }

            case 'benchmarkEffectFPS': {
                result = await runBrowserTest(args, async (session) => {
                    return await session.benchmarkEffectFps({
                        targetFps: args.target_fps,
                        durationSeconds: args.duration_seconds,
                        resolution: args.resolution
                    })
                })
                break
            }

            case 'testUniformResponsiveness': {
                result = await runBrowserTest(args, async (session) => {
                    return await session.testUniformResponsiveness()
                })
                break
            }

            case 'testNoPassthrough': {
                result = await runBrowserTest(args, async (session) => {
                    return await session.testNoPassthrough()
                })
                break
            }

            case 'testPixelParity': {
                const epsilon = args.epsilon ?? 1
                const seed = args.seed ?? 42

                // This test needs BOTH backends
                const session = new BrowserSession({ backend: 'webgl2', headless: true })

                try {
                    await session.setup()

                    const parityResult = await session.testPixelParity({ epsilon, seed })

                    result = {
                        epsilon,
                        seed,
                        result: parityResult
                    }

                } finally {
                    await session.teardown()
                }
                break
            }

            // =================================================================
            // ON-DISK TOOLS (no browser required)
            // =================================================================

            case 'checkEffectStructure': {
                const backend = args.backend

                if (!backend) {
                    throw new Error('backend parameter is required')
                }

                const structureResult = await checkEffectStructureOnDisk({ backend })

                result = {
                    backend,
                    result: structureResult
                }
                break
            }

            case 'checkAlgEquiv': {
                const algResult = await checkAlgEquivOnDisk({})

                result = {
                    result: algResult
                }
                break
            }

            case 'compareShaders': {
                const compareResult = await compareShadersOnDisk({})

                result = {
                    result: compareResult
                }
                break
            }

            case 'analyzeBranching': {
                const backend = args.backend

                if (!backend) {
                    throw new Error('backend parameter is required')
                }

                const branchingResult = await analyzeBranchingOnDisk({ backend })

                result = {
                    backend,
                    result: branchingResult
                }
                break
            }

            default:
                throw new Error(`Unknown tool: ${name}`)
        }

        return {
            content: [{
                type: 'text',
                text: JSON.stringify(result, null, 2)
            }]
        }

    } catch (error) {
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    status: 'error',
                    error: error.message || String(error)
                }, null, 2)
            }],
            isError: true
        }
    }
})

/**
 * Start the server
 */
async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
    console.error('Portable Shader Tools MCP server v1.0.0 running on stdio')
}

main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
