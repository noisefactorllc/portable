import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import {
    parseWorkspace, serializeWorkspace, importSingleEffect, exportEffect,
    replaceEffect,
} from './workspace.mjs';

const legacy = Object.fromEntries(['definition.json', 'glsl/gradientSweep.glsl',
    'wgsl/gradientSweep.wgsl', 'help.md'].map(path =>
    [path, readFileSync(new URL(`./effect/${path}`, import.meta.url), 'utf8')]));
const load = () => JSON.parse(readFileSync(new URL('./fixtures/two-effect-workspace.json', import.meta.url), 'utf8'));

test('two chained effects, parameter values and binary assets survive save/reload', () => {
    const source = load();
    const restored = parseWorkspace(serializeWorkspace(source));
    assert.deepEqual(restored, source);
    assert.match(restored.composition.dsl, /gradientSweep\(speed: 2\).*tintFilter\(amount: 0.4\)/s);
    assert.deepEqual(restored.composition.effectIds, ['gradient', 'tint']);
    assert.equal(restored.assets['palette.bin'].data, 'AAECA/8=');
    restored.effects[0].files['help.md'].data = 'changed';
    assert.notEqual(source.effects[0].files['help.md'].data, 'changed');
});

test('legacy single-effect import preserves every file and its default DSL', () => {
    const result = importSingleEffect(legacy, { workspaceId: 'legacy-project', effectId: 'gradient' });
    assert.equal(result.version, 1);
    assert.equal(result.revision, 0);
    assert.equal(result.composition.dsl, JSON.parse(legacy['definition.json']).defaultProgram);
    assert.deepEqual(exportEffect(result, 'gradient'), Object.fromEntries(
        Object.entries(legacy).map(([path, data]) => [path, { encoding: 'utf8', data }])));
    assert.deepEqual(parseWorkspace(serializeWorkspace(result)), result);
});

test('legacy import needs explicit DSL when the effect has no default program', () => {
    const files = { ...legacy, 'definition.json': JSON.stringify({ func: 'gradientSweep' }) };
    assert.throws(() => importSingleEffect(files, { workspaceId: 'p', effectId: 'e' }), /composition.dsl/);
    const result = importSingleEffect(files, {
        workspaceId: 'p', effectId: 'e', dsl: 'search user\ngradientSweep().write(o0)\nrender(o0)',
    });
    assert.match(result.composition.dsl, /gradientSweep/);
});

test('targeted replacement produces a candidate without mutating the other effect or original', () => {
    const original = load();
    const before = structuredClone(original);
    const files = structuredClone(original.effects[1].files);
    files['glsl/tintFilter.glsl'].data += '\n// edited candidate\n';
    const candidate = replaceEffect(original, 'tint', files, { expectedRevision: 0 });
    assert.equal(candidate.revision, 1);
    assert.deepEqual(original, before);
    assert.deepEqual(candidate.effects[0], before.effects[0]);
    assert.deepEqual(candidate.composition, before.composition);
    assert.deepEqual(candidate.assets, before.assets);
    files['glsl/tintFilter.glsl'].data = 'later caller mutation';
    assert.match(candidate.effects[1].files['glsl/tintFilter.glsl'].data, /edited candidate/);
});

test('stale edits and unknown targets fail without mutating the workspace', () => {
    const original = load();
    const before = structuredClone(original);
    assert.throws(() => replaceEffect(original, 'tint', original.effects[1].files,
        { expectedRevision: 1 }), /revision conflict/);
    assert.throws(() => replaceEffect(original, 'missing', original.effects[1].files,
        { expectedRevision: 0 }), /unknown effect/);
    assert.throws(() => exportEffect(original, 'missing'), /unknown effect/);
    assert.deepEqual(original, before);
});

test('replacement cannot silently rename a DSL function and strand composition references', () => {
    const original = load();
    const files = structuredClone(original.effects[1].files);
    const definition = JSON.parse(files['definition.json'].data);
    definition.func = 'renamed';
    files['definition.json'].data = JSON.stringify(definition);
    assert.throws(() => replaceEffect(original, 'tint', files, { expectedRevision: 0 }), /function identity/);
});

test('unknown versions and duplicate effect IDs or function names are rejected', () => {
    for (const mutate of [
        w => { w.version = 2; },
        w => { w.format = 'some-other-format'; },
        w => { w.effects[1].id = w.effects[0].id; },
        w => { w.effects[1].files = structuredClone(w.effects[0].files); },
    ]) {
        const workspace = load();
        mutate(workspace);
        assert.throws(() => serializeWorkspace(workspace));
    }
});

test('composition dependencies must reference unique existing effect IDs', () => {
    for (const ids of [['missing'], ['gradient', 'gradient']]) {
        const workspace = load();
        workspace.composition.effectIds = ids;
        assert.throws(() => serializeWorkspace(workspace), /effectIds/);
    }
});

test('file paths cannot escape their package or use ambiguous path segments', () => {
    for (const path of ['../secret', '/absolute', 'C:/secret', 'a/../secret',
        'a//b', 'a/./b', 'a\\b', '__proto__/x', 'a\u0000b']) {
        const workspace = load();
        workspace.effects[0].files[path] = { encoding: 'utf8', data: 'bad' };
        assert.throws(() => serializeWorkspace(workspace), /path/);
    }
});

test('malformed file payloads, definitions and missing shader files fail closed', () => {
    for (const mutate of [
        w => { w.assets['palette.bin'].data = 'not base64'; },
        w => { w.effects[0].files['definition.json'].data = '{'; },
        w => { w.effects[0].files['definition.json'].encoding = 'base64'; },
        w => { delete w.effects[0].files['definition.json']; },
        w => { delete w.effects[0].files['glsl/gradientSweep.glsl']; delete w.effects[0].files['wgsl/gradientSweep.wgsl']; },
        w => { w.effects[0].files['help.md'].data = null; },
        w => { w.revision = -1; },
        w => { w.revision = Number.MAX_SAFE_INTEGER + 1; },
    ]) {
        const workspace = load();
        mutate(workspace);
        assert.throws(() => serializeWorkspace(workspace));
    }
});

test('the saved two-effect fixture renders identically after browser import and reload', { timeout: 30000 }, async () => {
    const moduleSource = readFileSync(new URL('./workspace.mjs', import.meta.url));
    const server = createServer((req, res) => {
        res.setHeader('Content-Type', req.url === '/workspace.mjs' ? 'text/javascript' : 'text/html');
        res.end(req.url === '/workspace.mjs' ? moduleSource : '<!doctype html><body></body>');
    });
    let browser;
    try {
        await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/`);
        const result = await page.evaluate(async json => {
            const codec = await import('/workspace.mjs');
            const { CanvasRenderer, Effect, mergeIntoEnums, registerStarterOps } = await import(
                'https://shaders.noisedeck.app/1/noisemaker-shaders-core.esm.js');
            const workspace = codec.parseWorkspace(json);
            async function render(workspace) {
                const canvas = document.createElement('canvas');
                canvas.width = 64; canvas.height = 64;
                document.body.appendChild(canvas);
                const renderer = new CanvasRenderer({ canvas, width: 64, height: 64,
                    basePath: 'https://shaders.noisedeck.app/1', preferWebGPU: false });
                try {
                    await renderer.loadManifest();
                    for (const effect of workspace.effects) {
                        const def = JSON.parse(effect.files['definition.json'].data);
                        const instance = new Effect({ ...def, namespace: 'user' });
                        instance.starter = def.starter;
                        instance.shaders = {};
                        for (const [path, file] of Object.entries(effect.files)) {
                            const match = path.match(/^(glsl|wgsl)\/(.+)\.(?:glsl|wgsl)$/);
                            if (match) (instance.shaders[match[2]] ??= {})[match[1]] = file.data;
                        }
                        await mergeIntoEnums(renderer.registerEffectWithRuntime({ namespace: 'user', name: def.func, instance }));
                        if (def.starter) registerStarterOps([`user.${def.func}`]);
                    }
                    await renderer.compile(workspace.composition.dsl);
                    renderer.stop();
                    renderer.render(0.25);
                    const pixels = await renderer.pipeline.backend.readPixels(renderer.pipeline.surfaces.get('o0').read);
                    return Array.from(pixels.data);
                } finally { await renderer.dispose(); canvas.remove(); }
            }
            const before = await render(workspace);
            const after = await render(codec.parseWorkspace(codec.serializeWorkspace(workspace)));
            const noTint = structuredClone(workspace);
            noTint.composition.dsl = noTint.composition.dsl.replace('amount: 0.4', 'amount: 0');
            return { before, after, noTint: await render(noTint) };
        }, serializeWorkspace(load()));
        assert.deepEqual(result.after, result.before, 'save/reload preserves exact rendered pixels');
        assert(result.before.some((v, i) => i % 4 < 3 && v > 0), 'fixture renders visible color');
        assert.notDeepEqual(result.noTint, result.before, 'the second authored effect contributes to the composition');
    } finally {
        try { await browser?.close(); }
        finally { await new Promise(resolve => server.close(resolve)); }
    }
});
