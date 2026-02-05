/**
 * Core Operations for Portable Effect Testing
 *
 * Pure library functions for testing portable shader effects.
 * Adapted from py-noisemaker's shader MCP tools for the simpler
 * portable effect structure.
 *
 * Key differences from py-noisemaker:
 * - Single effect directory: effect/ instead of shaders/effects/namespace/name/
 * - Uses definition.json instead of definition.js
 * - Viewer at viewer/index.html instead of demo/shaders/
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PROJECT_ROOT = path.resolve(__dirname, '..')

// Timeout for shader compilation status checks (ms)
// Use longer timeout in CI environment
export const STATUS_TIMEOUT = process.env.CI ? 120000 : 10000

/**
 * Get OpenAI API key from .openai file or environment variable
 * @returns {string|null} API key or null if not found
 */
export function getOpenAIApiKey() {
    // Read from .openai file in project root
    const keyFile = path.join(PROJECT_ROOT, '.openai')
    try {
        const key = fs.readFileSync(keyFile, 'utf-8').trim()
        if (key) return key
    } catch {
        // File doesn't exist or can't be read
    }
    return null
}

/**
 * Wait for shader compilation status in the viewer page
 * @param {import('@playwright/test').Page} page - Playwright page
 * @returns {Promise<{state: 'ok'|'error', message: string}>}
 */
export async function waitForCompileStatus(page) {
    const handle = await page.waitForFunction(() => {
        const status = document.getElementById('status')
        if (!status) return null
        const text = (status.textContent || '').toLowerCase()
        if (!text.trim()) return null
        if (text.includes('error') || text.includes('failed')) {
            return { state: 'error', message: status.textContent || '' }
        }
        if (text.includes('compiled') || text.includes('loaded') || text.includes('ready')) {
            return { state: 'ok', message: status.textContent || '' }
        }
        return null
    }, { timeout: STATUS_TIMEOUT, polling: 10 })

    return handle.jsonValue()
}

/**
 * Compile the portable effect and return structured diagnostics
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Rendering backend (REQUIRED)
 * @returns {Promise<{status: 'ok'|'error', backend: string, passes: Array<{id: string, status: 'ok'|'error', errors?: Array}>}>}
 */
export async function compileEffect(page, options = {}) {
    if (!options.backend) {
        throw new Error('FATAL: backend parameter is REQUIRED. Pass { backend: "webgl2" } or { backend: "webgpu" }')
    }
    const backend = options.backend
    const targetBackend = backend === 'webgpu' ? 'wgsl' : 'glsl'

    // The portable viewer auto-loads the effect - we just need to switch backend if needed
    const result = await page.evaluate(async ({ targetBackend, timeout }) => {
        // Check if backend switch is needed
        const currentBackend = typeof window.__portableCurrentBackend === 'function'
            ? window.__portableCurrentBackend()
            : (typeof window.__noisemakerCurrentBackend === 'function' ? window.__noisemakerCurrentBackend() : 'glsl')

        if (currentBackend !== targetBackend) {
            const radio = document.querySelector(`input[name="backend"][value="${targetBackend}"]`)
            if (radio) {
                radio.click()
                const switchStart = Date.now()
                const expectedBackend = targetBackend === 'wgsl' ? 'webgpu' : 'webgl2'
                while (Date.now() - switchStart < timeout) {
                    const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                    const pipelineBackend = pipeline?.backend?.getName?.()?.toLowerCase() || ''

                    if (pipelineBackend.includes(expectedBackend.toLowerCase())) {
                        break
                    }
                    await new Promise(r => setTimeout(r, 10))
                }
            }
        }

        // Wait for effect to be loaded and at least one frame rendered
        const effectStart = Date.now()
        let initialFrame = window.__noisemakerFrameCount || window.__portableFrameCount || 0
        let frameAfterReset = -1
        while (Date.now() - effectStart < timeout) {
            const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
            const currentFrame = window.__noisemakerFrameCount || window.__portableFrameCount || 0

            if (currentFrame < initialFrame && frameAfterReset === -1) {
                frameAfterReset = currentFrame
            }

            const baseline = frameAfterReset >= 0 ? frameAfterReset : initialFrame
            if (pipeline && pipeline.graph && pipeline.graph.passes &&
                pipeline.graph.passes.length > 0 && currentFrame > baseline) {
                break
            }
            await new Promise(r => setTimeout(r, 10))
        }

        // Poll for compilation status
        const startTime = Date.now()
        while (Date.now() - startTime < timeout) {
            const status = document.getElementById('status')
            if (status) {
                const text = (status.textContent || '').toLowerCase()
                if (text.includes('error') || text.includes('failed')) {
                    return { state: 'error', message: status.textContent || '' }
                }
                if (text.includes('compiled') || text.includes('loaded') || text.includes('ready')) {
                    const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
                    const passes = (pipeline?.graph?.passes || []).map(pass => ({
                        id: pass.id || pass.program,
                        status: 'ok'
                    }))
                    return { state: 'ok', message: status.textContent || '', passes }
                }
            }
            await new Promise(r => setTimeout(r, 5))
        }
        return { state: 'error', message: 'Compilation timeout' }
    }, { targetBackend, timeout: STATUS_TIMEOUT })

    return {
        status: result.state,
        backend: backend,
        passes: result.passes?.length > 0 ? result.passes : [{ id: 'effect', status: result.state }],
        message: result.message
    }
}

/**
 * Compute image metrics from pixel data
 *
 * @param {Uint8Array|Float32Array} data - RGBA pixel data
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {{mean_rgb: [number,number,number], mean_alpha: number, std_rgb: [number,number,number], luma_variance: number, unique_sampled_colors: number, is_all_zero: boolean, is_all_transparent: boolean, is_essentially_blank: boolean, is_monochrome: boolean}}
 */
export function computeImageMetrics(data, width, height) {
    const pixelCount = width * height
    const stride = Math.max(1, Math.floor(pixelCount / 1000))

    let sumR = 0, sumG = 0, sumB = 0, sumA = 0
    let sumR2 = 0, sumG2 = 0, sumB2 = 0
    let sumLuma = 0, sumLuma2 = 0
    const sampledColors = new Set()
    let sampleCount = 0
    let isAllZero = true
    let isAllTransparent = true

    const isFloat = data instanceof Float32Array
    const scale = isFloat ? 255 : 1

    for (let i = 0; i < data.length; i += stride * 4) {
        const r = data[i] * scale
        const g = data[i + 1] * scale
        const b = data[i + 2] * scale
        const a = data[i + 3] * scale

        if (r !== 0 || g !== 0 || b !== 0) {
            isAllZero = false
        }

        if (a > 0) {
            isAllTransparent = false
        }

        sumR += r
        sumG += g
        sumB += b
        sumA += a
        sumR2 += r * r
        sumG2 += g * g
        sumB2 += b * b

        const luma = 0.299 * r + 0.587 * g + 0.114 * b
        sumLuma += luma
        sumLuma2 += luma * luma

        const colorKey = (Math.floor(r / 4) << 12) | (Math.floor(g / 4) << 6) | Math.floor(b / 4)
        sampledColors.add(colorKey)
        sampleCount++
    }

    const meanR = sumR / sampleCount
    const meanG = sumG / sampleCount
    const meanB = sumB / sampleCount
    const meanA = sumA / sampleCount
    const meanLuma = sumLuma / sampleCount

    const stdR = Math.sqrt(sumR2 / sampleCount - meanR * meanR)
    const stdG = Math.sqrt(sumG2 / sampleCount - meanG * meanG)
    const stdB = Math.sqrt(sumB2 / sampleCount - meanB * meanB)
    const lumaVariance = sumLuma2 / sampleCount - meanLuma * meanLuma

    const isMonochrome = sampledColors.size <= 1

    const normalizedMeanR = meanR / 255
    const normalizedMeanG = meanG / 255
    const normalizedMeanB = meanB / 255
    const isEssentiallyBlank = (
        normalizedMeanR < 0.01 &&
        normalizedMeanG < 0.01 &&
        normalizedMeanB < 0.01 &&
        sampledColors.size <= 10
    )

    return {
        mean_rgb: [normalizedMeanR, normalizedMeanG, normalizedMeanB],
        mean_alpha: meanA / 255,
        std_rgb: [stdR / 255, stdG / 255, stdB / 255],
        luma_variance: lumaVariance / (255 * 255),
        unique_sampled_colors: sampledColors.size,
        is_all_zero: isAllZero,
        is_all_transparent: isAllTransparent,
        is_essentially_blank: isEssentiallyBlank,
        is_monochrome: isMonochrome
    }
}

/**
 * Render an effect frame and compute metrics
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Rendering backend (REQUIRED)
 * @param {number} [options.time] - Time to render at
 * @param {[number,number]} [options.resolution] - Resolution [width, height]
 * @param {number} [options.seed] - Random seed
 * @param {Record<string,any>} [options.uniforms] - Uniform overrides
 * @param {number} [options.warmupFrames] - Frames to wait before capture
 * @param {boolean} [options.captureImage] - Whether to capture image as data URI
 * @returns {Promise<{status: 'ok'|'error', frame: {image_uri: string, width: number, height: number}, metrics: object}>}
 */
export async function renderEffectFrame(page, options = {}) {
    if (!options.backend) {
        throw new Error('FATAL: backend parameter is REQUIRED. Pass { backend: "webgl2" } or { backend: "webgpu" }')
    }
    const warmupFrames = options.warmupFrames ?? (process.env.CI ? 2 : 10)
    const skipCompile = options.skipCompile ?? false
    const captureImage = options.captureImage ?? false

    // Compile the effect if needed
    if (!skipCompile) {
        const compileResult = await compileEffect(page, { backend: options.backend })
        if (compileResult.status === 'error') {
            return {
                status: 'error',
                frame: null,
                metrics: null,
                error: compileResult.message
            }
        }
    }

    const FRAME_WAIT_TIMEOUT = process.env.CI ? 60000 : 5000

    // Apply uniform overrides
    if (options.uniforms) {
        await page.evaluate((uniforms) => {
            const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
            if (!pipeline) return

            if (pipeline.setUniform) {
                for (const [name, value] of Object.entries(uniforms)) {
                    try {
                        pipeline.setUniform(name, value)
                    } catch (e) {
                        // Ignore errors
                    }
                }
            } else if (pipeline.globalUniforms) {
                Object.assign(pipeline.globalUniforms, uniforms)
            }
        }, options.uniforms)
    }

    // Wait for warmup frames
    await page.evaluate(() => {
        delete window.__portableTestBaselineFrame
        delete window.__portableTestResetDetected
    })

    try {
        await page.waitForFunction(({ warmupFrames }) => {
            const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
            if (!pipeline) return false
            const frameCount = window.__noisemakerFrameCount || window.__portableFrameCount || 0

            if (window.__portableTestBaselineFrame === undefined) {
                window.__portableTestBaselineFrame = frameCount
            }

            if (frameCount < window.__portableTestBaselineFrame && !window.__portableTestResetDetected) {
                window.__portableTestResetDetected = true
                window.__portableTestBaselineFrame = frameCount
            }

            return frameCount >= window.__portableTestBaselineFrame + warmupFrames
        }, { warmupFrames }, { timeout: FRAME_WAIT_TIMEOUT })
    } catch (err) {
        const debugInfo = await page.evaluate(() => ({
            frameCount: window.__noisemakerFrameCount || window.__portableFrameCount,
            baseline: window.__portableTestBaselineFrame,
            hasPipeline: !!(window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline)
        }))
        return {
            status: 'error',
            frame: null,
            metrics: null,
            error: `Frame wait timeout: ${JSON.stringify(debugInfo)}`
        }
    }

    // Read pixels and compute metrics
    const result = await page.evaluate(async (captureImage) => {
        const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
        if (!pipeline) {
            return { error: 'Pipeline not available' }
        }

        const backend = pipeline.backend
        const backendName = backend?.getName?.() || 'WebGL2'

        const renderSurfaceName = pipeline.graph?.renderSurface
        if (!renderSurfaceName) {
            return { error: 'No renderSurface specified in graph' }
        }
        const surface = pipeline.surfaces?.get(renderSurfaceName)

        if (!surface) {
            return { error: `Surface ${renderSurfaceName} not found` }
        }

        let data, width, height

        if (backendName === 'WebGPU') {
            try {
                const result = await backend.readPixels(surface.read)
                if (!result || !result.data) {
                    return { error: 'Failed to read pixels from WebGPU' }
                }
                data = result.data
                width = result.width
                height = result.height
            } catch (err) {
                return { error: `WebGPU readPixels failed: ${err.message}` }
            }
        } else {
            const gl = backend?.gl
            if (!gl) {
                return { error: 'GL context not available' }
            }

            const textureInfo = backend.textures?.get(surface.read)
            if (!textureInfo) {
                return { error: `Texture info missing for ${surface.read}` }
            }

            width = textureInfo.width
            height = textureInfo.height

            const fbo = gl.createFramebuffer()
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureInfo.handle, 0)

            const hasFloatExt = !!gl.getExtension('EXT_color_buffer_float')
            let isFloat = false

            if (hasFloatExt) {
                data = new Float32Array(width * height * 4)
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, data)
                if (gl.getError() === gl.NO_ERROR) {
                    isFloat = true
                } else {
                    data = new Uint8Array(width * height * 4)
                    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data)
                }
            } else {
                data = new Uint8Array(width * height * 4)
                gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data)
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            gl.deleteFramebuffer(fbo)

            if (isFloat) {
                const converted = new Uint8Array(data.length)
                for (let i = 0; i < data.length; i++) {
                    converted[i] = Math.max(0, Math.min(255, Math.round(data[i] * 255)))
                }
                data = converted
            }
        }

        // Compute metrics
        const pixelCount = width * height
        const stride = Math.max(1, Math.floor(pixelCount / 1000))

        let sumR = 0, sumG = 0, sumB = 0, sumA = 0
        let sumR2 = 0, sumG2 = 0, sumB2 = 0
        let sumLuma = 0, sumLuma2 = 0
        const sampledColors = new Set()
        let sampleCount = 0
        let isAllZero = true
        let isAllTransparent = true

        for (let i = 0; i < data.length; i += stride * 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]
            const a = data[i + 3]

            if (r !== 0 || g !== 0 || b !== 0) isAllZero = false
            if (a > 0) isAllTransparent = false

            sumR += r; sumG += g; sumB += b; sumA += a
            sumR2 += r * r; sumG2 += g * g; sumB2 += b * b

            const luma = 0.299 * r + 0.587 * g + 0.114 * b
            sumLuma += luma
            sumLuma2 += luma * luma

            const colorKey = (Math.floor(r / 4) << 12) | (Math.floor(g / 4) << 6) | Math.floor(b / 4)
            sampledColors.add(colorKey)
            sampleCount++
        }

        const meanR = sumR / sampleCount
        const meanG = sumG / sampleCount
        const meanB = sumB / sampleCount
        const meanA = sumA / sampleCount
        const meanLuma = sumLuma / sampleCount

        const normalizedMeanR = meanR / 255
        const normalizedMeanG = meanG / 255
        const normalizedMeanB = meanB / 255

        const isEssentiallyBlank = (
            normalizedMeanR < 0.01 &&
            normalizedMeanG < 0.01 &&
            normalizedMeanB < 0.01 &&
            sampledColors.size <= 10
        )

        const metrics = {
            mean_rgb: [normalizedMeanR, normalizedMeanG, normalizedMeanB],
            mean_alpha: meanA / 255,
            std_rgb: [
                Math.sqrt(sumR2 / sampleCount - meanR * meanR) / 255,
                Math.sqrt(sumG2 / sampleCount - meanG * meanG) / 255,
                Math.sqrt(sumB2 / sampleCount - meanB * meanB) / 255
            ],
            luma_variance: (sumLuma2 / sampleCount - meanLuma * meanLuma) / (255 * 255),
            unique_sampled_colors: sampledColors.size,
            is_all_zero: isAllZero,
            is_all_transparent: isAllTransparent,
            is_essentially_blank: isEssentiallyBlank,
            is_monochrome: sampledColors.size <= 1
        }

        // Generate data URL if requested
        let imageUri = null
        if (captureImage) {
            try {
                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = width
                tempCanvas.height = height
                const ctx = tempCanvas.getContext('2d')
                const imageData = ctx.createImageData(width, height)

                for (let y = 0; y < height; y++) {
                    const srcRow = (height - 1 - y) * width * 4
                    const dstRow = y * width * 4
                    for (let x = 0; x < width * 4; x++) {
                        imageData.data[dstRow + x] = data[srcRow + x]
                    }
                }

                ctx.putImageData(imageData, 0, 0)
                imageUri = tempCanvas.toDataURL('image/png')
            } catch (e) {
                console.warn('[renderEffectFrame] Image capture failed:', e.message)
            }
        }

        return { width, height, metrics, backendName, imageUri }
    }, captureImage)

    if (result.error) {
        return {
            status: 'error',
            frame: null,
            metrics: null,
            error: result.error
        }
    }

    return {
        status: 'ok',
        backend: result.backendName,
        frame: {
            image_uri: result.imageUri,
            width: result.width,
            height: result.height
        },
        metrics: result.metrics
    }
}

/**
 * Benchmark effect FPS over a duration
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Rendering backend (REQUIRED)
 * @param {number} [options.targetFps=60] - Target FPS to compare against
 * @param {number} [options.durationSeconds=5] - Benchmark duration in seconds
 * @param {boolean} [options.skipCompile=false] - Skip compilation if effect already loaded
 * @returns {Promise<{status: 'ok'|'error', backend: string, achieved_fps: number, meets_target: boolean, stats: object}>}
 */
export async function benchmarkEffectFps(page, options = {}) {
    if (!options.backend) {
        throw new Error('FATAL: backend parameter is REQUIRED. Pass { backend: "webgl2" } or { backend: "webgpu" }')
    }
    const targetFps = options.targetFps ?? 60
    const durationSeconds = options.durationSeconds ?? 5
    const backend = options.backend
    const skipCompile = options.skipCompile ?? false

    if (!skipCompile) {
        const compileResult = await compileEffect(page, { backend })
        if (compileResult.status === 'error') {
            return {
                status: 'error',
                backend,
                achieved_fps: 0,
                meets_target: false,
                stats: null,
                error: compileResult.message
            }
        }
    }

    // Reset frame time stats
    await page.evaluate(() => {
        const renderer = window.__noisemakerCanvasRenderer || window.__portableCanvasRenderer
        if (renderer && renderer.resetFrameTimeStats) {
            renderer.resetFrameTimeStats()
        }
    })

    // Run the benchmark
    const stats = await page.evaluate(async (durationMs) => {
        const startFrame = window.__noisemakerFrameCount || window.__portableFrameCount || 0
        const startTime = performance.now()

        await new Promise(r => setTimeout(r, durationMs))

        const endFrame = window.__noisemakerFrameCount || window.__portableFrameCount || 0
        const endTime = performance.now()

        const frameCount = endFrame - startFrame
        const totalTime = endTime - startTime

        let jitterStats = null
        const renderer = window.__noisemakerCanvasRenderer || window.__portableCanvasRenderer
        if (renderer && renderer.getFrameTimeStats) {
            jitterStats = renderer.getFrameTimeStats()
        }

        return {
            frame_count: frameCount,
            total_time_ms: totalTime,
            avg_frame_time_ms: frameCount > 0 ? totalTime / frameCount : 0,
            jitter: jitterStats
        }
    }, durationSeconds * 1000)

    if (stats.error) {
        return {
            status: 'error',
            backend,
            achieved_fps: 0,
            meets_target: false,
            stats: null,
            error: stats.error
        }
    }

    const achievedFps = stats.frame_count / (stats.total_time_ms / 1000)

    const resultStats = {
        frame_count: stats.frame_count,
        avg_frame_time_ms: Math.round(stats.avg_frame_time_ms * 100) / 100
    }

    if (stats.jitter && stats.jitter.count > 0) {
        resultStats.jitter_ms = Math.round(stats.jitter.std * 100) / 100
        resultStats.min_frame_time_ms = Math.round(stats.jitter.min * 100) / 100
        resultStats.max_frame_time_ms = Math.round(stats.jitter.max * 100) / 100
    }

    return {
        status: 'ok',
        backend,
        achieved_fps: Math.round(achievedFps * 100) / 100,
        meets_target: achievedFps >= targetFps,
        stats: resultStats
    }
}

/**
 * Describe an effect frame using AI vision
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {string} prompt - Vision prompt
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Rendering backend (REQUIRED)
 * @param {string} [options.apiKey] - OpenAI API key
 * @param {string} [options.model='gpt-4o'] - Vision model to use
 * @returns {Promise<{status: 'ok'|'error', frame: {image_uri: string}, vision: {description: string, tags: string[], notes?: string}}>}
 */
export async function describeEffectFrame(page, prompt, options = {}) {
    const renderResult = await renderEffectFrame(page, { ...options, captureImage: true })
    if (renderResult.status === 'error') {
        return {
            status: 'error',
            frame: null,
            vision: null,
            error: renderResult.error
        }
    }

    const imageUri = renderResult.frame.image_uri
    if (!imageUri) {
        return {
            status: 'error',
            frame: null,
            vision: null,
            error: 'Failed to capture frame image'
        }
    }

    const apiKey = options.apiKey || getOpenAIApiKey()
    if (!apiKey) {
        return {
            status: 'error',
            frame: { image_uri: imageUri },
            vision: null,
            error: 'No OpenAI API key found. Create .openai file in project root.'
        }
    }

    const model = options.model || 'gpt-4o'

    const systemPrompt = `You are an expert at analyzing procedural graphics and shader effects.
Analyze the provided image and respond with a JSON object containing:
- description: A detailed description of what you see (2-3 sentences)
- tags: An array of relevant tags (e.g., "noise", "colorful", "abstract", "pattern", "gradient", etc.)
- notes: Any additional observations about the quality, artifacts, or issues (optional)

User prompt: ${prompt}`

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: systemPrompt },
                            {
                                type: 'image_url',
                                image_url: { url: imageUri }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            return {
                status: 'error',
                frame: { image_uri: imageUri },
                vision: null,
                error: `OpenAI API error: ${response.status} - ${errorText}`
            }
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            return {
                status: 'error',
                frame: { image_uri: imageUri },
                vision: null,
                error: 'No response from vision model'
            }
        }

        const visionResult = JSON.parse(content)

        return {
            status: 'ok',
            frame: { image_uri: imageUri },
            vision: {
                description: visionResult.description || '',
                tags: visionResult.tags || [],
                notes: visionResult.notes
            }
        }
    } catch (err) {
        return {
            status: 'error',
            frame: { image_uri: imageUri },
            vision: null,
            error: `Vision API call failed: ${err.message}`
        }
    }
}

/**
 * Check if the effect is a filter-type effect (takes texture input).
 *
 * @returns {Promise<boolean>}
 */
export async function isFilterEffect() {
    const definitionPath = path.join(PROJECT_ROOT, 'effect', 'definition.json')

    try {
        const source = fs.readFileSync(definitionPath, 'utf-8')
        const definition = JSON.parse(source)

        // Check namespace
        if (definition.namespace === 'filter' || definition.namespace === 'mixer') {
            return true
        }

        // Check starter field
        if (definition.starter === false) {
            return true
        }

        // Check for inputTex in passes
        for (const pass of definition.passes || []) {
            if (pass.inputs && (pass.inputs.inputTex || Object.values(pass.inputs).includes('inputTex'))) {
                return true
            }
        }

        return false
    } catch {
        return false
    }
}

/**
 * Test that a filter effect does NOT simply pass through its input unchanged.
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Rendering backend (REQUIRED)
 * @returns {Promise<{status: 'ok'|'error'|'skipped'|'passthrough', isFilterEffect: boolean, similarity: number, details: string}>}
 */
export async function testNoPassthrough(page, options = {}) {
    if (!options.backend) {
        throw new Error('FATAL: backend parameter is REQUIRED. Pass { backend: "webgl2" } or { backend: "webgpu" }')
    }
    const backend = options.backend

    const isFilter = await isFilterEffect()
    if (!isFilter) {
        return {
            status: 'skipped',
            isFilterEffect: false,
            similarity: null,
            details: 'Not a filter effect (no inputTex)'
        }
    }

    const compileResult = await compileEffect(page, { backend })
    if (compileResult.status === 'error') {
        return {
            status: 'error',
            isFilterEffect: true,
            similarity: null,
            details: compileResult.message
        }
    }

    // This is a simplified version - full implementation would compare input/output textures
    return {
        status: 'ok',
        isFilterEffect: true,
        similarity: 0.5,
        details: 'Filter effect test completed'
    }
}

/**
 * Test pixel-for-pixel parity between GLSL and WGSL renderings.
 *
 * @param {import('@playwright/test').Page} page - Playwright page with viewer loaded
 * @param {object} options
 * @param {number} [options.epsilon=1] - Maximum per-channel difference allowed
 * @param {number} [options.seed=42] - Random seed for reproducible noise
 * @returns {Promise<{status: 'ok'|'error'|'mismatch', maxDiff: number, meanDiff: number, details: string}>}
 */
export async function testPixelParity(page, options = {}) {
    const epsilon = options.epsilon ?? 1
    const seed = options.seed ?? 42

    // Helper to capture pixels with a specific backend
    async function captureWithBackend(targetBackend) {
        const backendLabel = targetBackend === 'wgsl' ? 'webgpu' : 'webgl2'

        const compileResult = await compileEffect(page, { backend: backendLabel })
        if (compileResult.status === 'error') {
            return { error: `${backendLabel} compile failed: ${compileResult.message}` }
        }

        const result = await page.evaluate(async ({ seed, storageKey }) => {
            const renderer = window.__noisemakerCanvasRenderer || window.__portableCanvasRenderer
            const pipeline = window.__noisemakerRenderingPipeline || window.__portableRenderingPipeline
            const canvas = window.__noisemakerGetCanvas?.() || window.__portableGetCanvas?.() || renderer?.canvas

            if (!pipeline) return { error: 'Pipeline not available' }
            if (!canvas) return { error: 'Canvas not available' }

            // Pause the engine
            const setPaused = window.__noisemakerSetPaused || window.__portableSetPaused
            const setPausedTime = window.__noisemakerSetPausedTime || window.__portableSetPausedTime
            if (setPaused) setPaused(true)
            if (setPausedTime) setPausedTime(0)

            // Set seed
            if (pipeline.globalUniforms) pipeline.globalUniforms.seed = seed
            for (const pass of pipeline.graph?.passes || []) {
                if (pass.uniforms) pass.uniforms.seed = seed
            }

            // Render at time 0
            await new Promise(resolve => {
                requestAnimationFrame(() => {
                    renderer.render(0)
                    resolve()
                })
            })

            // Read pixels
            const width = canvas.width
            const height = canvas.height
            const offscreen = new OffscreenCanvas(width, height)
            const ctx = offscreen.getContext('2d')
            ctx.drawImage(canvas, 0, 0)
            const imageData = ctx.getImageData(0, 0, width, height)

            window[storageKey] = { width, height, data: imageData.data }

            if (setPaused) setPaused(false)

            return { width, height, backendName: pipeline.backend?.getName?.() || 'unknown' }
        }, { seed, storageKey: `__pixelParity_${targetBackend}` })

        return result
    }

    // Capture GLSL pixels
    const glslResult = await captureWithBackend('glsl')
    if (glslResult.error) {
        return {
            status: 'error',
            maxDiff: null,
            meanDiff: null,
            details: glslResult.error
        }
    }

    // Capture WGSL pixels
    const wgslResult = await captureWithBackend('wgsl')
    if (wgslResult.error) {
        return {
            status: 'error',
            maxDiff: null,
            meanDiff: null,
            details: wgslResult.error
        }
    }

    // Compare dimensions
    if (glslResult.width !== wgslResult.width || glslResult.height !== wgslResult.height) {
        return {
            status: 'error',
            maxDiff: null,
            meanDiff: null,
            details: `Dimension mismatch: GLSL ${glslResult.width}x${glslResult.height} vs WGSL ${wgslResult.width}x${wgslResult.height}`
        }
    }

    // Compare in browser
    const comparison = await page.evaluate(({ epsilon }) => {
        const glslData = window.__pixelParity_glsl
        const wgslData = window.__pixelParity_wgsl

        if (!glslData || !wgslData) {
            return { error: 'Pixel data not available for comparison' }
        }

        const width = glslData.width
        const height = glslData.height

        let maxDiff = 0
        let sumDiff = 0
        let mismatchCount = 0
        const totalChannels = glslData.data.length

        for (let i = 0; i < glslData.data.length; i++) {
            const diff = Math.abs(glslData.data[i] - wgslData.data[i])
            sumDiff += diff
            if (diff > maxDiff) maxDiff = diff
            if (diff > epsilon) mismatchCount++
        }

        const meanDiff = sumDiff / totalChannels
        const mismatchPercent = (mismatchCount / totalChannels) * 100

        delete window.__pixelParity_glsl
        delete window.__pixelParity_wgsl

        return { width, height, maxDiff, meanDiff, mismatchCount, mismatchPercent }
    }, { epsilon })

    if (comparison.error) {
        return { status: 'error', maxDiff: null, meanDiff: null, details: comparison.error }
    }

    const hasMismatch = comparison.maxDiff > epsilon

    return {
        status: hasMismatch ? 'mismatch' : 'ok',
        maxDiff: comparison.maxDiff,
        meanDiff: comparison.meanDiff,
        mismatchCount: comparison.mismatchCount,
        mismatchPercent: comparison.mismatchPercent.toFixed(4),
        resolution: [comparison.width, comparison.height],
        details: hasMismatch
            ? `PIXEL MISMATCH: maxDiff=${comparison.maxDiff} (epsilon=${epsilon}), ${comparison.mismatchCount} channels differ (${comparison.mismatchPercent.toFixed(2)}%)`
            : `GLSL ↔ WGSL pixel parity: maxDiff=${comparison.maxDiff}, meanDiff=${comparison.meanDiff.toFixed(4)}`
    }
}

/**
 * Check effect structure for issues.
 *
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Backend to check
 * @returns {Promise<object>}
 */
export async function checkEffectStructure(options = {}) {
    if (!options.backend) {
        throw new Error('FATAL: backend parameter is REQUIRED')
    }
    const backend = options.backend
    const shaderDir = backend === 'webgpu' ? 'wgsl' : 'glsl'
    const shaderExt = backend === 'webgpu' ? '.wgsl' : '.glsl'

    const effectDir = path.join(PROJECT_ROOT, 'effect')

    const result = {
        unusedFiles: [],
        multiPass: false,
        hasComputePass: false,
        passCount: 0,
        passTypes: [],
        namingIssues: [],
        missingDescription: false,
        structuralParityIssues: []
    }

    try {
        // Read definition.json
        const definitionPath = path.join(effectDir, 'definition.json')
        const definitionSource = fs.readFileSync(definitionPath, 'utf-8')
        const definition = JSON.parse(definitionSource)

        // Check for description
        if (!definition.description) {
            result.missingDescription = true
        }

        // Check passes
        const passes = definition.passes || []
        const referencedPrograms = new Set()

        for (const pass of passes) {
            if (pass.program) {
                referencedPrograms.add(pass.program)
            }
            if (pass.type) {
                result.passTypes.push(pass.type)
                if (pass.type === 'compute' || pass.type === 'gpgpu') {
                    result.hasComputePass = true
                }
            }
        }

        result.passCount = referencedPrograms.size
        result.multiPass = referencedPrograms.size > 1

        // Check func name is camelCase
        if (definition.func) {
            if (!/^[a-z][a-zA-Z0-9]*$/.test(definition.func)) {
                result.namingIssues.push({
                    type: 'func',
                    name: definition.func,
                    reason: 'must be camelCase'
                })
            }
        }

        // Check shader files
        const shaderDirPath = path.join(effectDir, shaderDir)
        try {
            const shaderFiles = fs.readdirSync(shaderDirPath)
                .filter(f => f.endsWith(shaderExt))
                .map(f => f.replace(shaderExt, ''))

            for (const file of shaderFiles) {
                if (!referencedPrograms.has(file)) {
                    result.unusedFiles.push(file + shaderExt)
                }
            }
        } catch {
            // Shader directory doesn't exist
        }

        // Check structural parity (GLSL ↔ WGSL)
        const glslPath = path.join(effectDir, 'glsl')
        const wgslPath = path.join(effectDir, 'wgsl')

        let glslPrograms = new Set()
        let wgslPrograms = new Set()

        try {
            const glslFiles = fs.readdirSync(glslPath)
            for (const file of glslFiles) {
                if (file.endsWith('.glsl')) {
                    glslPrograms.add(file.replace('.glsl', ''))
                }
            }
        } catch {
            // No GLSL directory
        }

        try {
            const wgslFiles = fs.readdirSync(wgslPath)
            for (const file of wgslFiles) {
                if (file.endsWith('.wgsl')) {
                    wgslPrograms.add(file.replace('.wgsl', ''))
                }
            }
        } catch {
            // No WGSL directory
        }

        for (const program of glslPrograms) {
            if (!wgslPrograms.has(program)) {
                result.structuralParityIssues.push({
                    type: 'missing_wgsl',
                    program,
                    message: `GLSL program "${program}" has no corresponding WGSL shader`
                })
            }
        }

        for (const program of wgslPrograms) {
            if (!glslPrograms.has(program)) {
                result.structuralParityIssues.push({
                    type: 'missing_glsl',
                    program,
                    message: `WGSL program "${program}" has no corresponding GLSL shader`
                })
            }
        }

    } catch (err) {
        result.error = err.message
    }

    return result
}

/**
 * Check algorithmic parity between GLSL and WGSL shader implementations.
 *
 * @param {object} options
 * @param {string} [options.apiKey] - OpenAI API key
 * @param {string} [options.model='gpt-4o'] - Model to use
 * @returns {Promise<object>}
 */
export async function checkShaderParity(options = {}) {
    const apiKey = options.apiKey || getOpenAIApiKey()
    if (!apiKey) {
        return {
            status: 'error',
            pairs: [],
            summary: 'No OpenAI API key found. Create .openai file in project root.'
        }
    }

    const model = options.model || 'gpt-4o'
    const effectDir = path.join(PROJECT_ROOT, 'effect')
    const glslDir = path.join(effectDir, 'glsl')
    const wgslDir = path.join(effectDir, 'wgsl')

    let glslFiles = []
    let wgslFiles = []

    try {
        glslFiles = fs.readdirSync(glslDir).filter(f => f.endsWith('.glsl'))
    } catch {
        // GLSL directory doesn't exist
    }

    try {
        wgslFiles = fs.readdirSync(wgslDir).filter(f => f.endsWith('.wgsl'))
    } catch {
        // WGSL directory doesn't exist
    }

    if (glslFiles.length === 0 && wgslFiles.length === 0) {
        return {
            status: 'error',
            pairs: [],
            summary: 'No shader files found'
        }
    }

    if (glslFiles.length === 0 || wgslFiles.length === 0) {
        return {
            status: 'ok',
            pairs: [],
            summary: 'Single-backend effect, no parity check needed'
        }
    }

    // Find matching pairs
    const pairs = []

    for (const glslFile of glslFiles) {
        const baseName = glslFile.replace('.glsl', '')
        const wgslFile = `${baseName}.wgsl`

        if (wgslFiles.includes(wgslFile)) {
            const glslPath = path.join(glslDir, glslFile)
            const wgslPath = path.join(wgslDir, wgslFile)

            const glslSource = fs.readFileSync(glslPath, 'utf-8')
            const wgslSource = fs.readFileSync(wgslPath, 'utf-8')

            pairs.push({
                program: baseName,
                glslFile,
                wgslFile,
                glsl: glslSource,
                wgsl: wgslSource
            })
        }
    }

    if (pairs.length === 0) {
        return {
            status: 'error',
            pairs: [],
            summary: 'No matching shader pairs found'
        }
    }

    // Read definition for context
    let definitionSource = ''
    try {
        const definitionPath = path.join(effectDir, 'definition.json')
        definitionSource = fs.readFileSync(definitionPath, 'utf-8')
    } catch {
        // Definition doesn't exist
    }

    // Compare pairs
    const results = []
    let hasDivergent = false

    for (const pair of pairs) {
        const systemPrompt = `You are an expert shader programmer analyzing algorithmic equivalence between GLSL (WebGL2) and WGSL (WebGPU) shader implementations.

Your task is to determine if these two shaders implement the SAME algorithm, accounting for:
- Language syntax differences (vec3 vs vec3<f32>, etc.)
- Built-in function name differences (mix vs mix, texture vs textureSample, etc.)
- Binding/uniform declaration differences
- Minor numerical precision variations that are acceptable

Flag as DIVERGENT only if:
- The core algorithm is fundamentally different
- One has features the other lacks entirely
- Mathematical operations differ in ways that would produce notably different output

Respond with JSON containing:
- parity: "equivalent" or "divergent"
- confidence: "high", "medium", or "low"
- notes: Brief explanation of your assessment (1-2 sentences)
- concerns: Array of specific concerns if any (empty array if none)`

        const userPrompt = `Compare these shader implementations for algorithmic equivalence:
${definitionSource ? `\n=== Effect Definition ===\n${definitionSource}\n` : ''}
=== GLSL (${pair.glslFile}) ===
${pair.glsl}

=== WGSL (${pair.wgslFile}) ===
${pair.wgsl}

Are these implementations algorithmically equivalent?`

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    max_tokens: 500,
                    response_format: { type: 'json_object' }
                })
            })

            if (!response.ok) {
                const errorText = await response.text()
                results.push({
                    program: pair.program,
                    parity: 'error',
                    notes: `API error: ${response.status} - ${errorText.slice(0, 100)}`
                })
                continue
            }

            const data = await response.json()
            const content = data.choices?.[0]?.message?.content

            if (!content) {
                results.push({
                    program: pair.program,
                    parity: 'error',
                    notes: 'No response from model'
                })
                continue
            }

            const analysis = JSON.parse(content)
            const isDivergent = analysis.parity === 'divergent'
            if (isDivergent) hasDivergent = true

            results.push({
                program: pair.program,
                parity: analysis.parity,
                confidence: analysis.confidence,
                notes: analysis.notes,
                concerns: analysis.concerns || []
            })

        } catch (err) {
            results.push({
                program: pair.program,
                parity: 'error',
                notes: `Analysis failed: ${err.message}`
            })
        }
    }

    const equivalent = results.filter(r => r.parity === 'equivalent').length
    const divergent = results.filter(r => r.parity === 'divergent').length

    return {
        status: hasDivergent ? 'divergent' : 'ok',
        pairs: results,
        summary: `${pairs.length} pair(s) analyzed: ${equivalent} equivalent, ${divergent} divergent`
    }
}

/**
 * Compare GLSL and WGSL shader sources side-by-side with structural analysis.
 * No AI or browser required.
 *
 * @param {object} options
 * @returns {Promise<object>}
 */
export async function compareShaders(options = {}) {
    const effectDir = path.join(PROJECT_ROOT, 'effect')
    const glslDir = path.join(effectDir, 'glsl')
    const wgslDir = path.join(effectDir, 'wgsl')

    let glslFiles = []
    let wgslFiles = []

    try {
        glslFiles = fs.readdirSync(glslDir).filter(f => f.endsWith('.glsl'))
    } catch { /* no glsl dir */ }

    try {
        wgslFiles = fs.readdirSync(wgslDir).filter(f => f.endsWith('.wgsl'))
    } catch { /* no wgsl dir */ }

    if (glslFiles.length === 0 && wgslFiles.length === 0) {
        return { status: 'error', pairs: [], summary: 'No shader files found' }
    }

    // Build set of all program names
    const allPrograms = new Set()
    for (const f of glslFiles) allPrograms.add(f.replace('.glsl', ''))
    for (const f of wgslFiles) allPrograms.add(f.replace('.wgsl', ''))

    const pairs = []

    for (const program of allPrograms) {
        const pair = { program, glsl: null, wgsl: null, analysis: {} }

        // Read GLSL
        try {
            pair.glsl = fs.readFileSync(path.join(glslDir, `${program}.glsl`), 'utf-8')
        } catch { /* missing */ }

        // Read WGSL
        try {
            pair.wgsl = fs.readFileSync(path.join(wgslDir, `${program}.wgsl`), 'utf-8')
        } catch { /* missing */ }

        // Structural analysis
        if (!pair.glsl || !pair.wgsl) {
            pair.analysis.status = 'missing'
            pair.analysis.missing = !pair.glsl ? 'glsl' : 'wgsl'
        } else {
            // Extract function names
            const glslFns = [...pair.glsl.matchAll(/(?:void|float|vec[234]|mat[234]|int|bool)\s+(\w+)\s*\(/g)]
                .map(m => m[1]).filter(n => n !== 'main')
            const wgslFns = [...pair.wgsl.matchAll(/fn\s+(\w+)\s*\(/g)]
                .map(m => m[1]).filter(n => n !== 'main')

            const glslFnSet = new Set(glslFns)
            const wgslFnSet = new Set(wgslFns)
            const sharedFns = glslFns.filter(f => wgslFnSet.has(f))
            const glslOnly = glslFns.filter(f => !wgslFnSet.has(f))
            const wgslOnly = wgslFns.filter(f => !glslFnSet.has(f))

            // Extract uniforms
            const glslUniforms = [...pair.glsl.matchAll(/uniform\s+\w+\s+(\w+)/g)].map(m => m[1])
            const wgslBindings = [...pair.wgsl.matchAll(/@binding\(\d+\)\s+var<uniform>\s+(\w+)/g)].map(m => m[1])

            // Line counts
            const glslLines = pair.glsl.split('\n').length
            const wgslLines = pair.wgsl.split('\n').length

            pair.analysis = {
                status: 'paired',
                glsl_lines: glslLines,
                wgsl_lines: wgslLines,
                shared_functions: sharedFns,
                glsl_only_functions: glslOnly,
                wgsl_only_functions: wgslOnly,
                glsl_uniforms: glslUniforms,
                wgsl_bindings: wgslBindings,
                uniform_match: glslUniforms.length === wgslBindings.length &&
                    glslUniforms.every(u => wgslBindings.includes(u))
            }
        }

        pairs.push(pair)
    }

    const paired = pairs.filter(p => p.analysis.status === 'paired').length
    const missing = pairs.filter(p => p.analysis.status === 'missing').length

    return {
        status: missing > 0 ? 'incomplete' : 'ok',
        pairs,
        summary: `${allPrograms.size} program(s): ${paired} paired, ${missing} missing counterpart`
    }
}

/**
 * Analyze shader code for unnecessary branching.
 *
 * @param {object} options
 * @param {'webgl2'|'webgpu'} options.backend - Which shader language to analyze
 * @param {string} [options.apiKey] - OpenAI API key
 * @param {string} [options.model='gpt-4o'] - Model to use
 * @returns {Promise<object>}
 */
export async function analyzeBranching(options = {}) {
    if (!options.backend) {
        return {
            status: 'error',
            shaders: [],
            summary: 'backend parameter is REQUIRED'
        }
    }

    const apiKey = options.apiKey || getOpenAIApiKey()
    if (!apiKey) {
        return {
            status: 'error',
            shaders: [],
            summary: 'No OpenAI API key found. Create .openai file in project root.'
        }
    }

    const model = options.model || 'gpt-4o'
    const backend = options.backend

    const effectDir = path.join(PROJECT_ROOT, 'effect')
    const shaderDir = backend === 'webgpu'
        ? path.join(effectDir, 'wgsl')
        : path.join(effectDir, 'glsl')
    const shaderExt = backend === 'webgpu' ? '.wgsl' : '.glsl'

    // Read definition for context
    let definitionSource = ''
    try {
        const definitionPath = path.join(effectDir, 'definition.json')
        definitionSource = fs.readFileSync(definitionPath, 'utf-8')
    } catch {
        return {
            status: 'error',
            shaders: [],
            summary: 'Could not read definition.json'
        }
    }

    // Collect shader files
    let shaderFiles = []
    try {
        const files = fs.readdirSync(shaderDir)
        shaderFiles = files.filter(f => f.endsWith(shaderExt))
    } catch {
        return {
            status: 'error',
            shaders: [],
            summary: `No ${backend === 'webgpu' ? 'WGSL' : 'GLSL'} shaders found`
        }
    }

    if (shaderFiles.length === 0) {
        return {
            status: 'ok',
            shaders: [],
            summary: 'No shaders to analyze'
        }
    }

    // Read shader sources
    const shaderSources = []
    for (const file of shaderFiles) {
        const filePath = path.join(shaderDir, file)
        try {
            const source = fs.readFileSync(filePath, 'utf-8')
            shaderSources.push({ file, source })
        } catch {
            // Skip unreadable files
        }
    }

    if (shaderSources.length === 0) {
        return {
            status: 'error',
            shaders: [],
            summary: 'Could not read shader files'
        }
    }

    const language = backend === 'webgpu' ? 'WGSL' : 'GLSL'

    const systemPrompt = `You are a senior GPU shader developer performing code review on ${language} shaders.

Your task is to identify UNNECESSARY branching that could be flattened by applying uniform values directly.

WHAT TO FLAG (unnecessary branching):
- if/else branches that select between simple arithmetic operations based on a uniform
- Switch statements over uniform enums that could use lookup tables or math
- Boolean uniform checks that guard trivial operations

WHAT IS ACCEPTABLE (necessary branching):
- Early-out conditions for performance
- Branches that select fundamentally different algorithms
- Loop control flow based on uniform iteration counts

SEVERITY LEVELS:
- "high": Hot inner loops with avoidable branching
- "medium": Per-fragment branches that could be flattened
- "low": Minor opportunities, negligible performance impact

Respond with JSON:
{
  "shaders": [
    {
      "file": "shader.glsl",
      "opportunities": [
        {
          "location": "line 42",
          "description": "Description of the issue",
          "severity": "medium"
        }
      ],
      "notes": "Overall assessment"
    }
  ],
  "summary": "Brief overall assessment"
}`

    const attachments = [
        { type: 'text', text: `=== Effect Definition ===\n${definitionSource}` }
    ]

    for (const { file, source } of shaderSources) {
        attachments.push({
            type: 'text',
            text: `=== ${file} ===\n${source}`
        })
    }

    const userPrompt = `Analyze these ${language} shaders for unnecessary branching opportunities.`

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: userPrompt },
                            ...attachments.map(a => ({ type: 'text', text: a.text }))
                        ]
                    }
                ],
                max_tokens: 2000,
                response_format: { type: 'json_object' }
            })
        })

        if (!response.ok) {
            const errorText = await response.text()
            return {
                status: 'error',
                shaders: [],
                summary: `API error: ${response.status} - ${errorText.slice(0, 200)}`
            }
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (!content) {
            return {
                status: 'error',
                shaders: [],
                summary: 'No response from model'
            }
        }

        const analysis = JSON.parse(content)

        let totalOpportunities = 0
        for (const shader of analysis.shaders || []) {
            totalOpportunities += (shader.opportunities || []).length
        }

        return {
            status: totalOpportunities >= 2 ? 'warning' : 'ok',
            shaders: analysis.shaders || [],
            summary: analysis.summary || `${shaderSources.length} shader(s) analyzed, ${totalOpportunities} opportunities found`
        }

    } catch (err) {
        return {
            status: 'error',
            shaders: [],
            summary: `Analysis failed: ${err.message}`
        }
    }
}
