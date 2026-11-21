import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const suites = [
    ['test-definition.mjs', /^All definition checks passed$/m],
    ['test-package.mjs', /^All packaging checks passed$/m],
    ['test-volume-definition.mjs', /^PASS valid volume$/m],
    ['test-viewer.mjs', /^All viewer checks passed$/m],
    ['test-params.mjs', /^All parameter-control checks passed$/m],
    ['test-hotreload.mjs', /^All hot-reload checks passed$/m],
    ['test-3d.mjs', /^PASS wgsl: shape3d -> portable color filter -> render3d, inherited atlas and geometry passthrough$/m],
];

for (const [file, summary] of suites) {
    test(file, () => {
        const result = spawnSync(process.execPath, [file], {
            cwd: new URL('.', import.meta.url),
            encoding: 'utf8',
            timeout: 300000,
            maxBuffer: 16 * 1024 * 1024,
        });
        const output = `${result.stdout || ''}${result.stderr || ''}`;
        assert.ifError(result.error);
        assert.equal(result.status, 0, output);
        assert.doesNotMatch(output, /^\s*SKIP\b/m, output);
        assert.match(output, summary, 'suite must report completed checks:\n' + output);
    });
}
