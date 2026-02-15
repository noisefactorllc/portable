import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

async function test() {
  // Start server
  console.log('Starting server from:', projectRoot);
  const server = spawn('npx', ['serve', '-l', `tcp://127.0.0.1:4173`], {
    cwd: projectRoot,
    stdio: ['ignore', 'pipe', 'pipe']
  });
  
  server.stdout.on('data', d => console.log('SERVER:', d.toString()));
  server.stderr.on('data', d => console.log('SERVER ERR:', d.toString()));
  
  // Wait for server to be ready on port 4173
  await new Promise((resolve, reject) => {
    let ready = false;
    server.stdout.on('data', d => {
      const output = d.toString();
      if (output.includes('4173') && !ready) {
        ready = true;
        setTimeout(resolve, 500);
      }
    });
    setTimeout(() => {
      if (!ready) reject(new Error('Server did not start on correct port'));
    }, 10000);
  });
  
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  console.log('Navigating to viewer...');
  try {
    await page.goto('http://127.0.0.1:4173/viewer/index.html', { 
      waitUntil: 'networkidle', 
      timeout: 15000 
    });
    console.log('Navigated. Waiting 2s for effect to compile...');
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('Checking globals...');
    const result = await page.evaluate(() => {
      return {
        hasRenderer: !!window.__portableCanvasRenderer,
        hasPipeline: !!window.__portableRenderingPipeline,
        hasCurrentBackend: typeof window.__portableCurrentBackend === 'function',
        pipelineType: typeof window.__portableRenderingPipeline,
        rendererPipeline: window.__portableCanvasRenderer?.pipeline ? 'exists' : 'null'
      };
    });
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.log('Error:', err.message);
  }
  
  await browser.close();
  server.kill();
  process.exit(0);
}

test();
