#!/usr/bin/env node

/**
 * Portable Effect - ZIP Packaging Script (Node.js)
 * Creates a distribution-ready effect ZIP
 */

import { readdir, stat } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_FILE = 'effect.zip';
const EFFECT_DIR = 'effect';

async function getFileSize(filePath) {
    const stats = await stat(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

async function main() {
    console.log('Packaging effect...');
    
    const outputPath = join(__dirname, OUTPUT_FILE);
    const effectPath = join(__dirname, EFFECT_DIR);
    
    if (!existsSync(effectPath)) {
        throw new Error(`Effect directory not found: ${effectPath}`);
    }
    
    // Create ZIP
    console.log('  → Creating ZIP archive...');
    await new Promise((resolve, reject) => {
        const output = createWriteStream(outputPath);
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        output.on('close', resolve);
        archive.on('error', reject);
        
        archive.pipe(output);
        archive.directory(effectPath, false); // false = don't include parent dir
        archive.finalize();
    });
    
    // Show result
    const fileSize = await getFileSize(outputPath);
    console.log('');
    console.log(`Effect packaged: ${OUTPUT_FILE} (${fileSize})`);
    console.log('');
    console.log(`To import: Open Noisedeck → file → import effect from zip → Select ${OUTPUT_FILE}`);
}

main().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
