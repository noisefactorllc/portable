/**
 * Packaging Test
 *
 * Runs the Node packager (package-portable.mjs) and verifies the produced
 * ZIP: every effect file is present, macOS junk files (.DS_Store, __MACOSX)
 * are excluded exactly as in package-portable.sh, both packaging paths agree,
 * and a missing effect directory fails cleanly without leaving output behind.
 */

import { spawnSync } from 'child_process';
import { mkdtemp, mkdir, rm, chmod, writeFile, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let errors = [];

function assert(condition, message) {
    if (!condition) {
        errors.push(message);
        console.error('  FAIL:', message);
    } else {
        console.log('  OK:', message);
    }
}

// Read entry names from the ZIP central directory (no zip64: the small
// packages this script produces stay in classic ZIP format).
function zipEntryNames(buffer) {
    const EOCD_SIGNATURE = 0x06054b50;
    const CEN_SIGNATURE = 0x02014b50;
    let eocd = -1;
    for (let i = buffer.length - 22; i >= 0; i--) {
        if (buffer.readUInt32LE(i) === EOCD_SIGNATURE) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('not a zip archive (no end-of-central-directory record)');
    const count = buffer.readUInt16LE(eocd + 10);
    let offset = buffer.readUInt32LE(eocd + 16);
    const names = [];
    for (let n = 0; n < count; n++) {
        if (buffer.readUInt32LE(offset) !== CEN_SIGNATURE) {
            throw new Error('corrupt zip central directory');
        }
        const nameLength = buffer.readUInt16LE(offset + 28);
        const extraLength = buffer.readUInt16LE(offset + 30);
        const commentLength = buffer.readUInt16LE(offset + 32);
        names.push(buffer.toString('utf8', offset + 46, offset + 46 + nameLength));
        offset += 46 + nameLength + extraLength + commentLength;
    }
    return names;
}

function runPackager(args) {
    return spawnSync(process.execPath, ['package-portable.mjs', ...args], {
        cwd: __dirname,
        encoding: 'utf8',
    });
}

async function writeTempEffect(root) {
    await mkdir(join(root, 'glsl'), { recursive: true });
    await writeFile(join(root, 'definition.json'), JSON.stringify({ name: 'Test', func: 'test' }));
    await writeFile(join(root, 'glsl/main.glsl'), 'void main() {}');
    // Junk that package-portable.sh excludes and the Node path must match.
    await writeFile(join(root, '.DS_Store'), 'junk');
    await mkdir(join(root, 'deep'), { recursive: true });
    await writeFile(join(root, 'deep/.DS_Store'), 'junk');
    await mkdir(join(root, '__MACOSX'), { recursive: true });
    await writeFile(join(root, '__MACOSX/junk'), 'junk');
}

console.log('Testing package-portable.mjs...');

// 1. Default invocation: packages ./effect into ./effect.zip. A previously
//    packaged effect.zip is preserved and put back, so running the suite
//    never destroys an existing artifact.
{
    const zipPath = join(__dirname, 'effect.zip');
    let prior = null;
    try { prior = await readFile(zipPath); } catch { prior = null; }
    const result = runPackager([]);
    assert(result.status === 0, `default packaging exits 0 (got ${result.status}: ${result.stderr?.trim()})`);
    let names = [];
    try {
        names = zipEntryNames(await readFile(zipPath));
    } catch (err) {
        assert(false, `default package readable: ${err.message}`);
    } finally {
        if (prior === null) {
            await rm(zipPath, { force: true });
        } else {
            await writeFile(zipPath, prior);
        }
    }
    for (const expected of ['definition.json', 'help.md',
        'glsl/gradientSweep.glsl', 'wgsl/gradientSweep.wgsl']) {
        assert(names.includes(expected), `default package contains ${expected}`);
    }
    assert(!names.some(name => /(^|\/)[^/]*\.DS_Store$|(^|\/)__MACOSX(\/|$)/.test(name)),
        'default package contains no macOS junk entries');
}

// 2. Explicit effect dir and output: junk is excluded, real files survive,
//    and the repo working tree is untouched.
{
    const root = await mkdtemp(join(tmpdir(), 'portable-package-'));
    try {
        const effectDir = join(root, 'effect');
        const zipPath = join(root, 'out.zip');
        await writeTempEffect(effectDir);
        const result = runPackager([effectDir, zipPath]);
        assert(result.status === 0, `custom-path packaging exits 0 (got ${result.status}: ${result.stderr?.trim()})`);
        const names = zipEntryNames(await readFile(zipPath));
        assert(names.includes('definition.json'), 'custom package contains definition.json');
        assert(names.includes('glsl/main.glsl'), 'custom package contains glsl/main.glsl');
        assert(!names.some(name => name.includes('.DS_Store') || name.includes('__MACOSX')),
            'custom package excludes .DS_Store and __MACOSX like package-portable.sh');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

// 3. A missing effect directory fails with exit code 1, reports the problem,
//    and leaves no partial output behind.
{
    const root = await mkdtemp(join(tmpdir(), 'portable-package-'));
    try {
        const zipPath = join(root, 'out.zip');
        const result = runPackager([join(root, 'missing'), zipPath]);
        assert(result.status === 1, `missing effect dir exits 1 (got ${result.status})`);
        assert(/Effect directory not found/.test(result.stderr || ''),
            'missing effect dir reports "Effect directory not found"');
        let exists = true;
        try { await readFile(zipPath); } catch { exists = false; }
        assert(!exists, 'no partial output is left behind after a failed run');
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

// 4. A pre-write failure must not delete a destination that already exists:
//    packaging onto a previous artifact preserves it when the effect
//    directory is missing.
{
    const root = await mkdtemp(join(tmpdir(), 'portable-package-'));
    try {
        const zipPath = join(root, 'out.zip');
        await writeFile(zipPath, 'prior artifact bytes');
        const result = runPackager([join(root, 'missing'), zipPath]);
        assert(result.status === 1, `pre-write failure exits 1 (got ${result.status})`);
        let priorContent = null;
        try { priorContent = await readFile(zipPath, 'utf8'); } catch { priorContent = null; }
        assert(priorContent === 'prior artifact bytes',
            `pre-write failure preserves the existing output file (got ${priorContent === null ? 'deleted file' : JSON.stringify(priorContent)})`);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

// 5. An asynchronous output-open failure must preserve an existing
//    destination: createWriteStream() opens lazily, so the failure arrives
//    after construction. A pre-existing output file the process cannot open
//    (mode 000) reproduces that window and distinguishes 'open'-event
//    tracking from eager flagging.
{
    const root = await mkdtemp(join(tmpdir(), 'portable-package-'));
    try {
        const effectDir = join(root, 'effect');
        await mkdir(join(effectDir, 'glsl'), { recursive: true });
        await writeFile(join(effectDir, 'definition.json'), JSON.stringify({ name: 'T', func: 't' }));
        await writeFile(join(effectDir, 'glsl/main.glsl'), 'void main() {}');
        const zipPath = join(root, 'out.zip');
        await writeFile(zipPath, 'prior artifact bytes');
        await chmod(zipPath, 0o000);
        const result = runPackager([effectDir, zipPath]);
        assert(result.status === 1, `open failure exits 1 (got ${result.status})`);
        assert(/EACCES|permission denied/i.test(result.stderr || ''),
            'open failure reports the stream open error');
        let priorContent = null;
        try {
            await chmod(zipPath, 0o644);
            priorContent = await readFile(zipPath, 'utf8');
        } catch { priorContent = null; }
        assert(priorContent === 'prior artifact bytes',
            `asynchronous open failure preserves the existing destination (got ${priorContent === null ? 'deleted file' : JSON.stringify(priorContent)})`);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
}

console.log('');
if (errors.length > 0) {
    console.error(`FAILED: ${errors.length} error(s)`);
    process.exit(1);
}
console.log('All packaging checks passed');
