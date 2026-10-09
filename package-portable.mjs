#!/usr/bin/env node

/**
 * Portable Effect - ZIP Packaging Script (Node.js)
 * Creates a distribution-ready effect ZIP
 *
 * Usage: node package-portable.mjs [effectDir] [outputFile]
 * With no arguments it packages ./effect into ./effect.zip, matching
 * `npm run package`.
 */

import { rm, stat } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_FILE = 'effect.zip';
const EFFECT_DIR = 'effect';

const [effectArg, outputArg] = process.argv.slice(2);
const effectPath = resolve(effectArg ?? join(__dirname, EFFECT_DIR));
const outputPath = resolve(outputArg ?? join(__dirname, OUTPUT_FILE));

// Same exclusions as package-portable.sh (-x "*.DS_Store" -x "__MACOSX/*"):
// macOS resource junk must not ship inside a portable package regardless of
// which packaging script produced it.
const JUNK_PATTERN = /(^|\/)[^/]*\.DS_Store$|(^|\/)__MACOSX(\/|$)/;

function skipJunk(entry) {
    return JUNK_PATTERN.test(entry.name) ? false : entry;
}

async function getFileSize(filePath) {
    const stats = await stat(filePath);
    const bytes = stats.size;
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

async function main() {
    console.log('Packaging effect...');

    if (!existsSync(effectPath)) {
        throw new Error(`Effect directory not found: ${effectPath}`);
    }

    // Create ZIP
    console.log('  → Creating ZIP archive...');
    await new Promise((resolvePromise, reject) => {
        const output = createWriteStream(outputPath);
        const archive = new ZipArchive({ zlib: { level: 9 } });

        output.on('close', resolvePromise);
        // Without this a write failure (e.g. ENOSPC) escapes as an unhandled
        // stream error instead of the clean failure path below.
        output.on('error', reject);
        archive.on('error', reject);

        archive.pipe(output);
        archive.directory(effectPath, false, skipJunk); // false = don't include parent dir
        archive.finalize().catch(reject);
    });

    // Show result
    const fileSize = await getFileSize(outputPath);
    console.log('');
    console.log(`Effect packaged: ${outputPath} (${fileSize})`);
    console.log('');
    console.log(`To import: Open Noisedeck → file → import effect from zip → Select ${outputPath}`);
}

main().catch(async err => {
    // Never leave a truncated ZIP behind: importers would accept a partial
    // archive only to fail later on its missing entries.
    await rm(outputPath, { force: true }).catch(() => {});
    console.error('Error:', err.message);
    process.exit(1);
});
