// Every checked-in MCP client configuration runs the vendored shade-mcp the
// same way: it lists the flat effect by its id, compiles and renders it, binds
// results to that id, and renders an authored-effect DSL program.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const root = dirname(fileURLToPath(import.meta.url));
const workspaceFolder = (value) => value.replaceAll('${workspaceFolder}', root);
const configs = {
    '.mcp.json': JSON.parse(readFileSync(`${root}/.mcp.json`, 'utf8')).mcpServers.shade,
    '.vscode/mcp.json': JSON.parse(readFileSync(`${root}/.vscode/mcp.json`, 'utf8')).servers.shade,
};

async function call(client, name, args) {
    const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 120000 });
    return { isError: !!result.isError, body: JSON.parse(result.content.find(part => part.type === 'text').text) };
}

for (const [file, server] of Object.entries(configs)) {
    test(`${file} lists, compiles, renders and composes the bundled effect`, { timeout: 240000 }, async () => {
        const env = Object.fromEntries(Object.entries(server.env).map(([key, value]) => [key, workspaceFolder(value)]));
        const transport = new StdioClientTransport({
            command: server.command,
            args: server.args.map(workspaceFolder),
            cwd: root,
            env: { ...process.env, ...env },
            stderr: 'ignore',
        });
        const client = new Client({ name: 'portable-config-test', version: '1' });
        await client.connect(transport);
        try {
            const listed = await call(client, 'listEffects', {});
            assert.deepEqual(listed.body.effects.map(e => [e.id, e.func]), [['effect', 'gradientSweep']]);

            const compiled = await call(client, 'compileEffect', { effect_id: 'effect', backend: 'webgl2' });
            assert.equal(compiled.body.status, 'ok', JSON.stringify(compiled.body));
            assert.equal(compiled.body.page_effect_id, 'effect');

            const rendered = await call(client, 'renderEffectFrame', { effect_id: 'effect', backend: 'webgl2' });
            assert.equal(rendered.body.status, 'ok', JSON.stringify(rendered.body));
            assert.ok(rendered.body.metrics.std_rgb.some(v => v > 0.01), 'the frame is not flat');

            const unknown = await call(client, 'compileEffect', { effect_id: 'user/missing', backend: 'webgl2' });
            assert.notEqual(unknown.body.status, 'ok');

            const composed = await call(client, 'runDslProgram', {
                dsl: 'search user\ngradientSweep(speed: 1).write(o0)\nrender(o0)',
                effects: 'effect', frames: [1], warmup_frames: 1, resolution: [64, 64],
            });
            assert.equal(composed.body.outcome, 'ok', JSON.stringify(composed.body).slice(0, 400));
        } finally {
            await client.close();
        }
    });
}
