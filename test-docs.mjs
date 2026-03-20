/**
 * Documentation Accuracy Test
 *
 * Extracts JSON and DSL examples from the markdown docs and validates them
 * against the known noisemaker runtime conventions.
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// =========================================================================
// Known-good values from the noisemaker runtime
// =========================================================================

const VALID_PARAM_TYPES = ['float', 'int', 'boolean', 'vec2', 'vec3', 'vec4', 'color']

const VALID_TAGS = [
    'color', 'distort', 'edges', 'geometric', 'lens',
    'noise', 'transform', 'util', 'sim', '3d', 'audio'
]

const VALID_NAMESPACES = [
    'user', 'synth', 'filter', 'mixer', 'synth3d',
    'filter3d', 'points', 'render', 'classicNoisedeck', 'classicNoisemaker'
]

const BUILTIN_UNIFORMS = ['resolution', 'time', 'aspect', 'frame', 'deltaTime']
const REMOVED_UNIFORMS = ['mouse', 'aspectRatio']

const DEPRECATED_PATTERNS = [
    { pattern: /vUv/g, message: 'references vUv (should use gl_FragCoord.xy / resolution)' },
    { pattern: /aspectRatio/g, message: 'references aspectRatio (should be aspect)' },
    { pattern: /uniform\s+vec4\s+mouse/g, message: 'declares mouse uniform (not implemented)' },
    { pattern: /uniformLayout/g, message: 'references uniformLayout (use ui.category per parameter)' },
    { pattern: / -- /g, message: 'contains double-dash separator' },
]

// =========================================================================
// Test infrastructure
// =========================================================================

let totalErrors = 0
let totalChecks = 0
let currentFile = ''

function check(condition, message) {
    totalChecks++
    if (!condition) {
        totalErrors++
        console.error(`  FAIL [${currentFile}]: ${message}`)
        return false
    }
    return true
}

function info(message) {
    console.log(`  ${message}`)
}

// =========================================================================
// Extract code blocks from markdown
// =========================================================================

function extractCodeBlocks(markdown, language) {
    const blocks = []
    // Match fenced code blocks: ```language ... ```
    // Also match blocks inside template literals (escaped backticks)
    const raw = markdown
        .replace(/\\`\\`\\`(\w*)\n/g, '```$1\n')
        .replace(/\\`\\`\\`/g, '```')

    const regex = new RegExp('```' + language + '\\s*\\n([\\s\\S]*?)```', 'g')
    let match
    while ((match = regex.exec(raw)) !== null) {
        blocks.push(match[1].trim())
    }
    return blocks
}

// =========================================================================
// Validate a JSON definition example
// =========================================================================

function validateDefinitionJson(json, label) {
    let obj
    try {
        obj = JSON.parse(json)
    } catch (e) {
        // Not all JSON blocks are definitions (could be globals snippets, etc.)
        return
    }

    // Only validate objects that look like effect definitions (have name or func)
    if (!obj.name && !obj.func && !obj.globals && !obj.passes) return

    info(`Checking JSON example: ${label}`)

    // Check namespace
    if (obj.namespace) {
        check(VALID_NAMESPACES.includes(obj.namespace),
            `namespace "${obj.namespace}" is valid (${label})`)
        if (obj.namespace !== 'user' && obj.func) {
            // Examples in portable docs should use 'user' namespace
            check(obj.namespace === 'user',
                `example uses "user" namespace, not "${obj.namespace}" (${label})`)
        }
    }

    // Check tags
    if (obj.tags && Array.isArray(obj.tags)) {
        for (const tag of obj.tags) {
            check(VALID_TAGS.includes(tag),
                `tag "${tag}" is a recognized tag (${label})`)
        }
    }

    // Check globals
    if (obj.globals && typeof obj.globals === 'object') {
        for (const [name, spec] of Object.entries(obj.globals)) {
            if (spec.type) {
                check(VALID_PARAM_TYPES.includes(spec.type),
                    `param "${name}" type "${spec.type}" is valid (${label})`)
            }

            // Color type should use vec3 default
            if (spec.type === 'color' && Array.isArray(spec.default)) {
                check(spec.default.length === 3,
                    `color param "${name}" default has 3 components, not ${spec.default.length} (${label})`)
            }

            // Check min/max only on float/int
            if (spec.min !== undefined || spec.max !== undefined) {
                check(spec.type === 'float' || spec.type === 'int',
                    `min/max on param "${name}" (type should be float or int, got "${spec.type}") (${label})`)
            }
        }
    }

    // Check passes structure
    if (obj.passes && Array.isArray(obj.passes)) {
        for (const pass of obj.passes) {
            if (pass.name) {
                check(typeof pass.program === 'string',
                    `pass "${pass.name}" has a program field (${label})`)
            }
            if (pass.outputs) {
                const outputKeys = Object.keys(pass.outputs)
                for (const key of outputKeys) {
                    check(key === 'fragColor' || key === 'color',
                        `pass output key "${key}" is valid (expected "fragColor" or "color") (${label})`)
                }
            }
        }
    }

    // Check for uniformLayout (should not be present - use ui.category instead)
    if (obj.uniformLayout) {
        check(false, `has uniformLayout (should use ui.category per parameter instead) (${label})`)
    }
}

// =========================================================================
// Validate GLSL shader examples
// =========================================================================

function validateGlslBlock(glsl, label) {
    // Check for deprecated vUv usage
    if (/\bvUv\b/.test(glsl)) {
        check(false, `GLSL uses vUv (should use gl_FragCoord.xy / resolution) (${label})`)
    }

    // Check for deprecated aspectRatio
    if (/\baspectRatio\b/.test(glsl)) {
        check(false, `GLSL uses aspectRatio (should be aspect) (${label})`)
    }

    // Check for mouse uniform
    if (/uniform\s+vec4\s+mouse/.test(glsl)) {
        check(false, `GLSL declares mouse uniform (not implemented in runtime) (${label})`)
    }
}

// =========================================================================
// Validate DSL examples
// =========================================================================

function validateDslBlock(dsl, label) {
    const lines = dsl.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'))

    // Check search directive (skip template placeholders like {namespaces})
    const searchLine = lines.find(l => l.startsWith('search '))
    if (searchLine && !searchLine.includes('{')) {
        const namespaces = searchLine.replace('search ', '').split(',').map(s => s.trim())
        for (const ns of namespaces) {
            check(VALID_NAMESPACES.includes(ns),
                `DSL search namespace "${ns}" is valid (${label})`)
        }
    }

    // Check for deprecated param names in built-in effects
    // Match effect call and its params (up to the closing paren or next chained call)
    const effectCallRegex = /\b(\w+)\s*\(([^)]*)\)/g
    let callMatch
    while ((callMatch = effectCallRegex.exec(dsl)) !== null) {
        const effectName = callMatch[1]
        const params = callMatch[2]

        if (effectName === 'blur') {
            check(!/\bamount\s*:/.test(params),
                `blur() does not use deprecated "amount" param (use radiusX/radiusY) (${label})`)
        }
        if (effectName === 'noise') {
            check(!/\bscale\s*:/.test(params),
                `noise() does not use deprecated "scale" param (use xScale/yScale) (${label})`)
        }
        if (effectName === 'chromaticAberration') {
            check(!/\baberrationAmt\s*:/.test(params),
                `chromaticAberration() does not use deprecated "aberrationAmt" param (use aberration) (${label})`)
        }
        if (effectName === 'pattern') {
            check(!/\bpatternType\s*:/.test(params),
                `pattern() does not use deprecated "patternType" param (use type) (${label})`)
        }
    }

    // Check for render(o0, o1) - multi-output not supported
    if (/render\s*\([^)]*,/.test(dsl)) {
        check(false, `render() with multiple outputs is not supported (${label})`)
    }
}

// =========================================================================
// Scan markdown for deprecated patterns
// =========================================================================

function checkDeprecatedPatterns(content, filename) {
    // Skip code blocks for some checks (vUv in WGSL examples is fine)
    // But check prose and GLSL blocks
    for (const { pattern, message } of DEPRECATED_PATTERNS) {
        pattern.lastIndex = 0
        const matches = content.match(pattern)
        if (matches) {
            check(false, `${message} (${matches.length} occurrence(s))`)
        }
    }
}

// =========================================================================
// Check built-in uniforms table
// =========================================================================

function checkBuiltinUniforms(content, filename) {
    for (const removed of REMOVED_UNIFORMS) {
        // Check if it appears in a table row (| uniform | ...) or as a documented uniform
        const tablePattern = new RegExp(`\\|\\s*\`${removed}\`\\s*\\|`, 'g')
        if (tablePattern.test(content)) {
            check(false, `documents removed uniform "${removed}" in a table`)
        }
    }
}

// =========================================================================
// Main
// =========================================================================

console.log('Validating documentation accuracy...\n')

const docsDir = join(__dirname, 'docs')
const docFiles = readdirSync(docsDir).filter(f => f.endsWith('.md'))

// Also check README.md
const allFiles = [
    { path: join(__dirname, 'README.md'), name: 'README.md' },
    ...docFiles.map(f => ({ path: join(docsDir, f), name: `docs/${f}` }))
]

for (const { path, name } of allFiles) {
    currentFile = name
    console.log(`\n--- ${name} ---`)

    const content = readFileSync(path, 'utf-8')

    // Check for deprecated patterns in prose
    checkDeprecatedPatterns(content, name)

    // Check built-in uniforms tables
    checkBuiltinUniforms(content, name)

    // Extract and validate JSON blocks
    const jsonBlocks = extractCodeBlocks(content, 'json')
    for (let i = 0; i < jsonBlocks.length; i++) {
        validateDefinitionJson(jsonBlocks[i], `${name} JSON block ${i + 1}`)
    }

    // Extract and validate GLSL blocks
    const glslBlocks = extractCodeBlocks(content, 'glsl')
    for (let i = 0; i < glslBlocks.length; i++) {
        validateGlslBlock(glslBlocks[i], `${name} GLSL block ${i + 1}`)
    }

    // Extract and validate DSL blocks (unmarked code blocks that look like DSL)
    const plainBlocks = extractCodeBlocks(content, '')
    for (let i = 0; i < plainBlocks.length; i++) {
        const block = plainBlocks[i]
        // Heuristic: DSL blocks start with "search" or contain ".write(o"
        if (/^search\s/m.test(block) || /\.write\(o\d\)/.test(block)) {
            validateDslBlock(block, `${name} DSL block ${i + 1}`)
        }
    }
}

// =========================================================================
// Summary
// =========================================================================

console.log('\n===========================')
if (totalErrors > 0) {
    console.error(`FAILED: ${totalErrors} error(s) out of ${totalChecks} checks`)
    process.exit(1)
} else {
    console.log(`PASSED: ${totalChecks} checks, 0 errors`)
}
