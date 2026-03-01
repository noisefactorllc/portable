import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, statSync } from 'fs';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Fail the whole test if it takes longer than 30s
setTimeout(() => {
    console.error('Test timed out after 30 seconds');
    process.exit(1);
}, 30000).unref();

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
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const errors = [];
    page.on('pageerror', (error) => {
        errors.push(error.message);
        console.error('Page error:', error.message);
    });

    page.on('console', (msg) => {
        const text = msg.text();
        if (msg.type() === 'error') {
            // WebGL INVALID_OPERATION is expected in headless software renderer
            if (/WebGL Error 3744[0-9]/.test(text)) return;
            errors.push(text);
            console.error('Console error:', text);
        }
    });

    console.log('Loading viewer...');
    await page.goto(`http://localhost:${port}/viewer/`, { waitUntil: 'networkidle' });

    // Wait for effect to compile (status resolves to success or error)
    await page.waitForFunction(() => {
        const el = document.getElementById('status');
        return el && (el.className === 'success' || el.className === 'error');
    }, { timeout: 15000 });

    // Verify GLSL effect compiled successfully
    const status = await page.evaluate(() => {
        const el = document.getElementById('status');
        return { text: el?.textContent || '', className: el?.className || '' };
    });
    console.log('Status:', status.text, `(${status.className})`);

    if (status.className === 'error') {
        errors.push(`GLSL compile failed: ${status.text}`);
    } else {
        console.log('OK: GLSL effect compiled');
    }

    await browser.close();
    server.close();

    if (errors.length > 0) {
        console.error('\nFAILED:');
        errors.forEach(err => console.error('  -', err));
        process.exit(1);
    }

    console.log('\nAll viewer checks passed');
    process.exit(0);
})();
