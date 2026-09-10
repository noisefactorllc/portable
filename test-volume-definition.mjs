import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A missing volume output used to pass validation and become an unbound texture.
const dir = await mkdtemp(join(tmpdir(), 'portable-volume-validation-'));
const validator = fileURLToPath(new URL('test-definition.mjs', import.meta.url));
try {
    await mkdir(join(dir, 'glsl'));
    await writeFile(join(dir, 'glsl', 'main.glsl'), 'void main() {}');
    const base = { name: 'Volume', func: 'volume', starter: true,
        textures: { atlas: { width: 16, height: 256, format: 'rgba16f' } },
        passes: [{ name: 'fill', program: 'main', inputs: {}, outputs: { color: 'atlas' } }],
        outputTex3d: 'atlas' };
    for (const [label, patch, expected] of [
        ['valid volume', {}, 0],
        ['legacy 2D null outputs', { outputTex3d: null, outputGeo: null }, 0],
        ['missing volume output', { outputTex3d: 'missing' }, 1],
        ['missing geometry output', { outputGeo: 'missing' }, 1],
        ['non-string volume output', { outputTex3d: true }, 1],
        ['invalid default program', { defaultProgram: {} }, 1],
        ['invalid texture dimension', { textures: { atlas: { width: 0, height: 256 } } }, 1],
        ...['screen', 'auto', '100%', '6.25%', { scale: 0.5, clamp: { min: 8, max: 512 } }, { screenDivide: 'zoom', default: 2 }]
            .map(width => [`runtime texture dimension ${JSON.stringify(width)}`, { textures: { atlas: { width } } }, 0]),
        ...['oops%', '0%', { scale: 0 }, { screenDivide: '' }, { param: 'size', multiply: 0 }]
            .map(width => [`invalid texture dimension ${JSON.stringify(width)}`, { textures: { atlas: { width } } }, 1]),
        ['input volume passthrough', { starter: false, outputTex3d: 'inputTex3d', passes: [{ name: 'filter', program: 'main', inputs: { volume: 'inputTex3d' }, outputs: { color: 'atlas' } }] }, 0],
        ['geometry passthrough without a sampler', { starter: false, outputGeo: 'inputGeo', passes: [{ name: 'filter', program: 'main', inputs: { volume: 'inputTex3d' }, outputs: { color: 'atlas' } }] }, 0]
    ]) {
        await writeFile(join(dir, 'definition.json'), JSON.stringify({ ...base, ...patch }));
        const run = spawnSync(process.execPath, [validator, dir], { encoding: 'utf8', timeout: 10000 });
        assert.equal(run.status, expected, `${label}: ${run.stdout}${run.stderr}`);
        console.log(`PASS ${label}`);
    }
} finally { await rm(dir, { recursive: true, force: true }); }
