/**
 * Browser Harness for Portable Effect Testing
 *
 * Provides explicit setup/teardown lifecycle for browser-based shader testing.
 * Each tool invocation follows this pattern:
 *
 * 1. Setup: Launch browser, open fresh page, load viewer
 * 2. Configure: Set backend (webgl2 or webgpu)
 * 3. Main loop: Run the specific test
 * 4. Teardown: Close page, close browser, clean up resources
 *
 * Adapted from py-noisemaker's shader MCP tools for portable effects.
 */

import { chromium } from '@playwright/test'
import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import {
    compileEffect,
    renderEffectFrame,
    benchmarkEffectFps,
    describeEffectFrame,
    checkEffectStructure,
    checkShaderParity,
    analyzeBranching,
    compareShaders,
    testNoPassthrough,
    testPixelParity,
    isFilterEffect,
    STATUS_TIMEOUT
} from './core-operations.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

/** Grace period between tests (ms) */
const GRACE_PERIOD_MS = 125

/**
 * Shared HTTP server management.
 */
let sharedServerProcess = null
let sharedServerRefCount = 0
const SERVER_HOST = '127.0.0.1'
const SERVER_PORT = 4173

/**
 * Start the shared HTTP server if not already running.
 */
async function acquireServer() {
    if (sharedServerRefCount > 0) {
        sharedServerRefCount++
        return
    }

    return new Promise((resolve, reject) => {
        // Use a simple HTTP server to serve the viewer
        // We'll use npx serve for simplicity
        sharedServerProcess = spawn('npx', ['serve', '-l', `tcp://${SERVER_HOST}:${SERVER_PORT}`], {
            cwd: PROJECT_ROOT,
            env: {
                ...process.env
            },
            stdio: ['ignore', 'pipe', 'pipe']
        })

        let started = false

        sharedServerProcess.stdout.on('data', (data) => {
            const output = data.toString()
            if ((output.includes('Serving') || output.includes('listening')) && !started) {
                started = true
            }
        })

        sharedServerProcess.stderr.on('data', () => {
            // Server logs to stderr
        })

        sharedServerProcess.on('error', (err) => {
            reject(new Error(`Failed to start server: ${err.message}`))
        })

        // Give server time to start
        setTimeout(() => {
            sharedServerRefCount++
            resolve()
        }, 2000)
    })
}

/**
 * Release the shared HTTP server reference.
 */
function releaseServer() {
    sharedServerRefCount--
    if (sharedServerRefCount <= 0 && sharedServerProcess) {
        sharedServerProcess.kill('SIGTERM')
        sharedServerProcess.unref()
        sharedServerProcess = null
        sharedServerRefCount = 0
    }
}

/**
 * Launch browser options for WebGPU support.
 */
function getBrowserLaunchOptions(headless) {
    return {
        headless,
        args: [
            '--enable-unsafe-webgpu',
            '--enable-features=Vulkan',
            '--enable-webgpu-developer-features',
            '--disable-gpu-sandbox',
            process.platform === 'darwin' ? '--use-angle=metal' : '--use-angle=vulkan',
        ]
    }
}

/**
 * Browser Session - manages a single browser/page lifecycle.
 */
export class BrowserSession {
    constructor(options = {}) {
        this.options = {
            host: options.host || SERVER_HOST,
            port: options.port || SERVER_PORT,
            headless: options.headless !== false,
            backend: options.backend || 'webgl2',
            ...options
        }

        this.browser = null
        this.context = null
        this.page = null
        this.baseUrl = `http://${this.options.host}:${this.options.port}`
        this.consoleMessages = []
        this._isSetup = false
    }

    /**
     * Setup: Launch browser, open page, load viewer, configure backend.
     */
    async setup() {
        if (this._isSetup) {
            throw new Error('Session already set up. Call teardown() first.')
        }

        // Ensure HTTP server is running
        await acquireServer()

        // Launch browser
        this.browser = await chromium.launch(getBrowserLaunchOptions(this.options.headless))

        const viewportSize = process.env.CI ? { width: 256, height: 256 } : { width: 1280, height: 720 }
        this.context = await this.browser.newContext({
            viewport: viewportSize,
            ignoreHTTPSErrors: true
        })

        this.page = await this.context.newPage()
        this.page.setDefaultTimeout(STATUS_TIMEOUT)
        this.page.setDefaultNavigationTimeout(STATUS_TIMEOUT)

        // Capture console messages
        this.consoleMessages = []
        this.page.on('console', msg => {
            const text = msg.text()
            if (text.includes('Error') || text.includes('error') || text.includes('warning') ||
                msg.type() === 'error' || msg.type() === 'warning') {
                this.consoleMessages.push({ type: msg.type(), text })
            }
        })

        this.page.on('pageerror', error => {
            this.consoleMessages.push({ type: 'pageerror', text: error.message })
        })

        // Navigate to viewer page
        const viewerUrl = `${this.baseUrl}/viewer/index.html`
        await this.page.goto(viewerUrl, { waitUntil: 'networkidle' })

        // Wait for app to be ready
        await this.page.waitForFunction(() => {
            // Check for noisemaker or portable pipeline
            const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
            return !!pipeline
        }, { timeout: STATUS_TIMEOUT })

        // Configure backend
        await this._setBackend(this.options.backend)

        this._isSetup = true
    }

    /**
     * Teardown: Close page, close browser, release resources.
     */
    async teardown() {
        if (this.page) {
            await this.page.close().catch(() => {})
            this.page = null
        }

        if (this.context) {
            await this.context.close().catch(() => {})
            this.context = null
        }

        if (this.browser) {
            await this.browser.close().catch(() => {})
            this.browser = null
        }

        releaseServer()
        this.consoleMessages = []
        this._isSetup = false
    }

    /**
     * Set the rendering backend.
     */
    async _setBackend(backend) {
        const targetBackend = backend === 'webgpu' ? 'wgsl' : 'glsl'

        await this.page.evaluate(async ({ targetBackend, timeout }) => {
            const currentBackend = typeof window.__noisemakerCurrentBackend === 'function'
                ? window.__noisemakerCurrentBackend()
                : (typeof window.__portableCurrentBackend === 'function' ? window.__portableCurrentBackend() : 'glsl')

            if (currentBackend !== targetBackend) {
                const radio = document.querySelector(`input[name="backend"][value="${targetBackend}"]`)
                if (radio) {
                    radio.click()
                    const switchStart = Date.now()
                    while (Date.now() - switchStart < timeout) {
                        const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                        const pipelineBackend = pipeline?.backend?.getName?.()?.toLowerCase() || ''
                        const expectedBackend = targetBackend === 'wgsl' ? 'webgpu' : 'webgl2'

                        if (pipelineBackend.includes(expectedBackend.toLowerCase())) {
                            break
                        }
                        await new Promise(r => setTimeout(r, 10))
                    }
                }
            }
        }, { targetBackend, timeout: STATUS_TIMEOUT })
    }

    /**
     * Clear console messages.
     */
    clearConsoleMessages() {
        this.consoleMessages = []
    }

    /**
     * Get console messages.
     */
    getConsoleMessages() {
        return this.consoleMessages || []
    }

    // =========================================================================
    // Core test operations
    // =========================================================================

    /**
     * Compile the effect.
     */
    async compileEffect() {
        this.clearConsoleMessages()
        const result = await compileEffect(this.page, { backend: this.options.backend })
        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }
        return result
    }

    /**
     * Render an effect frame and compute metrics.
     */
    async renderEffectFrame(options = {}) {
        this.clearConsoleMessages()
        const result = await renderEffectFrame(this.page, {
            backend: this.options.backend,
            ...options
        })
        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }
        return result
    }

    /**
     * Benchmark effect FPS.
     */
    async benchmarkEffectFps(options = {}) {
        // Benchmarks MUST run in headed mode for accurate GPU timing
        if (this.options.headless) {
            const headedBrowser = await chromium.launch(getBrowserLaunchOptions(false))

            try {
                const context = await headedBrowser.newContext({
                    viewport: { width: 1280, height: 720 },
                    ignoreHTTPSErrors: true
                })
                const page = await context.newPage()
                page.setDefaultTimeout(STATUS_TIMEOUT)

                const consoleMessages = []
                page.on('console', msg => {
                    const text = msg.text()
                    if (text.includes('Error') || text.includes('error') ||
                        msg.type() === 'error' || msg.type() === 'warning') {
                        consoleMessages.push({ type: msg.type(), text })
                    }
                })

                await page.goto(`${this.baseUrl}/viewer/index.html`, { waitUntil: 'networkidle' })
                await page.waitForFunction(() => {
                    const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                    return !!pipeline
                }, { timeout: STATUS_TIMEOUT })

                const result = await benchmarkEffectFps(page, {
                    backend: this.options.backend,
                    ...options
                })

                if (consoleMessages.length > 0) {
                    result.console_errors = consoleMessages.map(m => m.text)
                }

                return result
            } finally {
                await headedBrowser.close()
            }
        }

        this.clearConsoleMessages()
        const result = await benchmarkEffectFps(this.page, {
            backend: this.options.backend,
            ...options
        })

        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }

        return result
    }

    /**
     * Describe effect frame with AI vision.
     */
    async describeEffectFrame(prompt, options = {}) {
        this.clearConsoleMessages()
        const result = await describeEffectFrame(this.page, prompt, {
            backend: this.options.backend,
            ...options
        })

        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }

        return result
    }

    /**
     * Test uniform responsiveness.
     */
    async testUniformResponsiveness(options = {}) {
        this.clearConsoleMessages()

        const compileResult = await this.compileEffect()
        if (compileResult.status === 'error') {
            return { status: 'error', tested_uniforms: [], details: compileResult.message }
        }

        // Read effect definition to get globals
        const effectDir = path.join(PROJECT_ROOT, 'effect')
        const definitionPath = path.join(effectDir, 'definition.json')

        let definition
        try {
            const source = await import('fs').then(fs => fs.readFileSync(definitionPath, 'utf-8'))
            definition = JSON.parse(source)
        } catch {
            return { status: 'error', tested_uniforms: [], details: 'Could not read definition.json' }
        }

        const globals = definition.globals || {}
        const testableUniforms = []

        for (const [name, spec] of Object.entries(globals)) {
            if (!spec.uniform) continue
            if (spec.type === 'boolean' || spec.type === 'button') continue
            if (typeof spec.min === 'number' && typeof spec.max === 'number' && spec.min !== spec.max) {
                testableUniforms.push({ name, uniformName: spec.uniform, spec })
            }
        }

        if (testableUniforms.length === 0) {
            return { status: 'skipped', tested_uniforms: [], details: 'No testable numeric uniforms' }
        }

        // Pause animation
        await this.page.evaluate(() => {
            const setPaused = window.__noisemakerSetPaused || window.__portableSetPaused
            const setPausedTime = window.__noisemakerSetPausedTime || window.__portableSetPausedTime
            if (setPaused) setPaused(true)
            if (setPausedTime) setPausedTime(0)
        })

        // Test uniforms
        const testedUniforms = []
        let anyResponded = false

        for (const { name, uniformName, spec } of testableUniforms) {
            const defaultVal = spec.default ?? spec.min
            const range = spec.max - spec.min
            let testVal = defaultVal === spec.min
                ? spec.min + range * 0.75
                : spec.min + range * 0.25

            if (spec.type === 'int') {
                testVal = Math.round(testVal)
            }

            // Capture baseline
            const baseMetrics = await this.page.evaluate(() => {
                const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                const renderer = window.__noisemakerCanvasRenderer || window.__portableCanvasRenderer
                if (!renderer || !pipeline) return null

                renderer.render(0)

                const canvas = renderer.canvas
                const gl = pipeline.backend?.gl
                if (!gl) return null

                const width = canvas.width
                const height = canvas.height
                const pixels = new Uint8Array(width * height * 4)

                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

                const pixelCount = width * height
                let sumR = 0, sumG = 0, sumB = 0
                for (let i = 0; i < pixels.length; i += 4) {
                    sumR += pixels[i] / 255
                    sumG += pixels[i + 1] / 255
                    sumB += pixels[i + 2] / 255
                }

                return {
                    mean_rgb: [sumR / pixelCount, sumG / pixelCount, sumB / pixelCount]
                }
            })

            if (!baseMetrics) {
                testedUniforms.push(`${name}:?`)
                continue
            }

            // Apply test value
            await this.page.evaluate(({ uniformName, testVal }) => {
                const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                if (!pipeline) return

                if (pipeline.setUniform) {
                    pipeline.setUniform(uniformName, testVal)
                } else if (pipeline.globalUniforms) {
                    pipeline.globalUniforms[uniformName] = testVal
                }
            }, { uniformName, testVal })

            // Capture test metrics
            const testMetrics = await this.page.evaluate(() => {
                const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                const renderer = window.__noisemakerCanvasRenderer || window.__portableCanvasRenderer
                if (!renderer || !pipeline) return null

                renderer.render(0)

                const canvas = renderer.canvas
                const gl = pipeline.backend?.gl
                if (!gl) return null

                const width = canvas.width
                const height = canvas.height
                const pixels = new Uint8Array(width * height * 4)

                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

                const pixelCount = width * height
                let sumR = 0, sumG = 0, sumB = 0
                for (let i = 0; i < pixels.length; i += 4) {
                    sumR += pixels[i] / 255
                    sumG += pixels[i + 1] / 255
                    sumB += pixels[i + 2] / 255
                }

                return {
                    mean_rgb: [sumR / pixelCount, sumG / pixelCount, sumB / pixelCount]
                }
            })

            if (testMetrics) {
                const baseLuma = (baseMetrics.mean_rgb[0] + baseMetrics.mean_rgb[1] + baseMetrics.mean_rgb[2]) / 3
                const testLuma = (testMetrics.mean_rgb[0] + testMetrics.mean_rgb[1] + testMetrics.mean_rgb[2]) / 3
                const lumaDiff = Math.abs(testLuma - baseLuma)

                if (lumaDiff > 0.002) {
                    anyResponded = true
                    testedUniforms.push(`${name}:✓`)
                } else {
                    testedUniforms.push(`${name}:✗`)
                }
            } else {
                testedUniforms.push(`${name}:?`)
            }

            // Restore default
            await this.page.evaluate(({ uniformName, defaultVal }) => {
                const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                if (!pipeline) return

                if (pipeline.setUniform) {
                    pipeline.setUniform(uniformName, defaultVal)
                } else if (pipeline.globalUniforms) {
                    pipeline.globalUniforms[uniformName] = defaultVal
                }
            }, { uniformName, defaultVal })
        }

        // Resume animation
        await this.page.evaluate(() => {
            const setPaused = window.__noisemakerSetPaused || window.__portableSetPaused
            if (setPaused) setPaused(false)
        })

        return {
            status: anyResponded ? 'ok' : 'error',
            tested_uniforms: testedUniforms,
            details: anyResponded ? 'Uniforms affect output' : 'No uniforms affected output'
        }
    }

    /**
     * Test that a filter effect does NOT pass through input unchanged.
     */
    async testNoPassthrough(options = {}) {
        this.clearConsoleMessages()
        const result = await testNoPassthrough(this.page, {
            backend: this.options.backend,
            ...options
        })

        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }

        return result
    }

    /**
     * Test pixel parity between GLSL and WGSL.
     */
    async testPixelParity(options = {}) {
        this.clearConsoleMessages()
        const result = await testPixelParity(this.page, options)

        if (this.consoleMessages.length > 0) {
            result.console_errors = this.consoleMessages.map(m => m.text)
        }

        return result
    }

    /**
     * Check if the effect is a filter-type effect.
     */
    async isFilterEffect() {
        return await isFilterEffect()
    }
}

// =========================================================================
// On-disk tools (no browser required)
// =========================================================================

/**
 * Check effect structure for issues.
 */
export async function checkEffectStructureOnDisk(options = {}) {
    return await checkEffectStructure(options)
}

/**
 * Check algorithmic parity between GLSL and WGSL.
 */
export async function checkAlgEquivOnDisk(options = {}) {
    return await checkShaderParity(options)
}

/**
 * Compare GLSL and WGSL shader sources.
 */
export async function compareShadersOnDisk(options = {}) {
    return await compareShaders(options)
}

/**
 * Analyze shader code for unnecessary branching.
 */
export async function analyzeBranchingOnDisk(options = {}) {
    return await analyzeBranching(options)
}

/**
 * Wait for a grace period between tests.
 */
export async function gracePeriod() {
    await new Promise(r => setTimeout(r, GRACE_PERIOD_MS))
}

// =========================================================================
// Legacy exports for backward compatibility
// =========================================================================

/**
 * @deprecated Use BrowserSession instead
 */
export class BrowserHarness extends BrowserSession {
    constructor(options = {}) {
        super(options)
    }

    async init() {
        await this.setup()
    }

    async close() {
        await this.teardown()
    }

    async checkEffectStructure(options = {}) {
        return await checkEffectStructureOnDisk({
            backend: this.options.backend,
            ...options
        })
    }

    async checkShaderParity(options = {}) {
        return await checkAlgEquivOnDisk(options)
    }
}

/**
 * @deprecated Use new BrowserSession() and call setup() instead
 */
export async function createBrowserHarness(options = {}) {
    const harness = new BrowserHarness(options)
    await harness.init()
    return harness
}
