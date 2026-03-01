import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const effectDir = join(__dirname, 'effect');

let errors = [];

function assert(condition, message) {
    if (!condition) {
        errors.push(message);
        console.error('  FAIL:', message);
    } else {
        console.log('  OK:', message);
    }
}

// Load and parse definition.json
console.log('Validating definition.json...');
const defPath = join(effectDir, 'definition.json');

let def;
try {
    def = JSON.parse(readFileSync(defPath, 'utf-8'));
    console.log('  OK: definition.json loaded');
} catch (e) {
    console.error('  FAIL: could not load definition.json:', e.message);
    process.exit(1);
}

// Required fields (at least one of name or func)
assert(def.name || def.func, 'has "name" or "func" field');
if (def.func) {
    assert(typeof def.func === 'string', '"func" is a string');
    assert(!/\s/.test(def.func), '"func" has no spaces');
}
if (def.name) {
    assert(typeof def.name === 'string', '"name" is a string');
}

// Optional field types
if (def.namespace !== undefined) {
    assert(typeof def.namespace === 'string', '"namespace" is a string');
}
if (def.description !== undefined) {
    assert(typeof def.description === 'string', '"description" is a string');
}
if (def.starter !== undefined) {
    assert(typeof def.starter === 'boolean', '"starter" is a boolean');
}
if (def.tags !== undefined) {
    assert(Array.isArray(def.tags), '"tags" is an array');
    if (Array.isArray(def.tags)) {
        assert(def.tags.every(t => typeof t === 'string'), 'all tags are strings');
    }
}

// Validate globals (parameters)
const validParamTypes = ['float', 'int', 'boolean', 'vec2', 'vec3', 'vec4'];
if (def.globals) {
    assert(typeof def.globals === 'object', '"globals" is an object');
    for (const [name, spec] of Object.entries(def.globals)) {
        if (spec.type) {
            assert(validParamTypes.includes(spec.type), `global "${name}" has valid type "${spec.type}"`);
        }
        if (spec.min !== undefined && spec.max !== undefined) {
            assert(spec.min <= spec.max, `global "${name}" min <= max`);
        }
        if (spec.default !== undefined && spec.min !== undefined && spec.max !== undefined) {
            const defaults = Array.isArray(spec.default) ? spec.default : [spec.default];
            for (const val of defaults) {
                assert(val >= spec.min && val <= spec.max,
                    `global "${name}" default component (${val}) within [${spec.min}, ${spec.max}]`);
            }
        }
    }
}

// Validate passes and shader files
if (def.passes) {
    assert(Array.isArray(def.passes), '"passes" is an array');
    for (const pass of def.passes) {
        assert(pass.name, `pass has a "name" field`);
        assert(pass.program, `pass "${pass.name}" has a "program" field`);

        if (pass.program) {
            const glslPath = join(effectDir, 'glsl', `${pass.program}.glsl`);
            const wgslPath = join(effectDir, 'wgsl', `${pass.program}.wgsl`);
            const hasGlsl = existsSync(glslPath);
            const hasWgsl = existsSync(wgslPath);
            assert(hasGlsl || hasWgsl,
                `pass "${pass.name}" program "${pass.program}" has a shader file`);
        }
    }
}

// Summary
console.log('');
if (errors.length > 0) {
    console.error(`FAILED: ${errors.length} error(s)`);
    process.exit(1);
}
console.log('All definition checks passed');
