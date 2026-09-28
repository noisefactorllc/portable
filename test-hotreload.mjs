/**
 * Viewer Hot-Reload Test
 *
 * Verifies the viewer's hot-reload polling watches shader files, not just
 * definition.json, and that ETag-only dev servers (like `npx serve`) drive
 * reloads. The shader and definition responses are served with request
 * interception so the shipped files are never modified; the "edit" is a
 * simulated validator change plus an updated shader body.
 *
 * Checks:
 *  1. Loading succeeds and the poll is stable while nothing changes.
 *  2. A shader validator (ETag) change triggers "Shader changes detected,
 *     reloading..." and the effect compiles again.
 *  3. No reload loop: the status settles back to Loaded and stays there.
 */

import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fail the whole test if it takes longer than 60s
setTimeout(() => {
    console.error('Test timed out after 60 seconds');
    process.exit(1);
}, 60000).unref();

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.wgsl': 'text/plain',
    '.glsl': 'text/plain'
};

function startServer() {
    return new Promise((resolve) => {
        const server = createServer((req, res) => {
            let filePath = join(__dirname, req.url);

            try {
                const stat = statSync(filePath);
                if (stat.isDirectory()) {
                    filePath = join(filePath, 'index.html');
                }

                const ext = extname(filePath);
                const contentType = mimeTypes[ext] || 'application/octet-stream';
                const content = readFileSync(filePath);

                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            } catch (err) {
                res.writeHead(404);
                res.end('Not found');
            }
        });

        server.listen(0, () => {
            const port = server.address().port;
            console.log(`Server running at http://localhost:${port}/`);
            resolve({ server, port });
        });
    });
}

(async () => {
    const { server, port } = await startServer();
    const errors = [];
    let expectLoadError = false;
    let shaderEtag = '"glsl-v1"';
    let shaderBody = null;

    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        page.on('pageerror', (error) => {
            errors.push(error.message);
            console.error('Page error:', error.message);
        });
        page.on('console', (msg) => {
            const text = msg.text();
            if (msg.type() === 'error') {
                if (/WebGL Error 3744[0-9]/.test(text)) return;
                if (/Failed to load resource/.test(text)) return;
                // The deliberate compile-error probe surfaces via the
                // renderer's GLSL diagnostics and the viewer's error path;
                // it is asserted via the status element instead.
                if (expectLoadError && /Effect load error|\[GLSL (compile error|source)\]/.test(text)) return;
                errors.push(text);
                console.error('Console error:', text);
            }
        });

        // Serve the shipped definition.json with a stable validator.
        const definition = JSON.parse(readFileSync(join(__dirname, 'effect', 'definition.json'), 'utf8'));
        await page.route('**/effect/definition.json', (route) => {
            const headers = { 'Content-Type': 'application/json', 'ETag': '"definition-v1"' };
            if (route.request().method() === 'HEAD') {
                route.fulfill({ status: 200, headers, body: '' });
            } else {
                route.fulfill({ status: 200, headers, body: JSON.stringify(definition) });
            }
        });

        // Serve the GLSL shader with a controllable ETag. WGSL passes through
        // to the static server (validator null there, must stay stable).
        await page.route('**/effect/glsl/gradientSweep.glsl', (route) => {
            const headers = { 'Content-Type': 'text/plain', 'ETag': shaderEtag };
            if (route.request().method() === 'HEAD') {
                route.fulfill({ status: 200, headers, body: '' });
            } else {
                let body = shaderBody;
                if (body === null) {
                    body = readFileSync(join(__dirname, 'effect', 'glsl', 'gradientSweep.glsl'), 'utf8');
                    shaderBody = body;
                }
                route.fulfill({ status: 200, headers, body });
            }
        });

        console.log('Loading viewer...');
        await page.goto(`http://localhost:${port}/viewer/`, { waitUntil: 'networkidle' });

        await page.waitForFunction(() => {
            const el = document.getElementById('status');
            return el && el.className === 'success';
        }, { timeout: 20000 });
        const initial = await page.textContent('#status');
        console.log('Initial:', initial);
        if (!/Loaded/.test(initial)) errors.push(`Initial status not Loaded: ${initial}`);

        // Let several poll ticks run with no changes: the poll must be stable
        // (rebasing + unchanged validator) and not reload.
        await page.waitForTimeout(2500);
        const settled = await page.textContent('#status');
        if (settled !== initial) errors.push(`Poll tick changed status without an edit: ${settled}`);
        console.log('Stable after 2.5s:', settled);

        // Simulate a shader edit: bump the ETag the poll compares and change
        // the shader body semantically (a constant red instead of the
        // gradient). The reload must re-fetch and compile the new body.
        shaderEtag = '"glsl-v2"';
        shaderBody = shaderBody.replace(
            'vec3 color = vec3(t, t * 0.6 + 0.2, 1.0 - t);',
            'vec3 color = vec3(1.0, 0.0, 0.0);');
        if (!shaderBody.includes('vec3(1.0, 0.0, 0.0)')) {
            errors.push('Semantic shader edit did not apply (fixture mismatch)');
        }

        await page.waitForFunction(() => {
            const el = document.getElementById('status');
            return el && /Shader changes/.test(el.textContent || '');
        }, { timeout: 8000 });
        console.log('Reload trigger observed:', await page.textContent('#status'));

        // The reload must compile the NEW body and settle back to Loaded...
        await page.waitForFunction(() => {
            const el = document.getElementById('status');
            return el && el.className === 'success' && /Loaded/.test(el.textContent || '');
        }, { timeout: 30000 });
        console.log('Reloaded:', await page.textContent('#status'));

        // ...and stay there (no reload loop).
        const after = await page.textContent('#status');
        await page.waitForTimeout(5000);
        const later = await page.textContent('#status');
        if (later !== after) errors.push(`Status changed after reload (reload loop?): ${later}`);

        // A broken shader body must surface as an error after a reload,
        // proving the poll re-fetches and compiles the edited source.
        shaderEtag = '"glsl-v3"';
        shaderBody = 'precision highp float;\nthis is not valid glsl';
        expectLoadError = true;
        await page.waitForFunction(() => {
            const el = document.getElementById('status');
            return el && el.className === 'error';
        }, { timeout: 12000 });
        console.log('Compile-error probe observed:', await page.textContent('#status'));

        // Restoring a valid shader body must recover to Loaded.
        shaderEtag = '"glsl-v4"';
        shaderBody = readFileSync(join(__dirname, 'effect', 'glsl', 'gradientSweep.glsl'), 'utf8');
        await page.waitForFunction(() => {
            const el = document.getElementById('status');
            return el && el.className === 'success' && /Loaded/.test(el.textContent || '');
        }, { timeout: 30000 });
        expectLoadError = false;
        console.log('Recovered:', await page.textContent('#status'));

        await browser.close();
    } catch (err) {
        errors.push(err.message);
    } finally {
        server.close();
    }

    if (errors.length > 0) {
        console.error('\nFAILED:');
        errors.forEach(err => console.error('  -', err));
        process.exit(1);
    }

    console.log('\nAll hot-reload checks passed');
    process.exit(0);
})();
