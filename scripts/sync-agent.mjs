// Modified: 2026-11-18
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceName = 'nP-agents/obsidian/AGENTS.md';

export async function readBundledAgent(repositoryRoot = root) {
    const directory = path.join(repositoryRoot, 'bundled-agent');
    const [content, metadataText] = await Promise.all([
        readFile(path.join(directory, 'AGENTS.md'), 'utf8'),
        readFile(path.join(directory, 'manifest.json'), 'utf8')
    ]);
    const metadata = JSON.parse(metadataText);
    assert.equal(metadata.version, 1, 'Unsupported agent manifest version');
    assert.equal(metadata.source, sourceName, 'Unexpected canonical agent source');
    assert.equal(metadata.bytes, Buffer.byteLength(content), 'Bundled agent byte count mismatch');
    assert.equal(metadata.sha256, createHash('sha256').update(content).digest('hex'),
        'Bundled agent checksum mismatch; run npm run agent:sync');
    assert.ok(content.startsWith('# nP Obsidian code-writing agent\n'), 'Invalid agent instructions');
    return {content, sha256: metadata.sha256};
}

async function main() {
    const args = process.argv.slice(2);
    const write = args.includes('--write');
    const sourceIndex = args.indexOf('--source');
    assert.ok(sourceIndex < 0 || args[sourceIndex + 1], '--source needs a Markdown file path');
    const sourcePath = sourceIndex < 0
        ? path.resolve(root, '../nP', sourceName)
        : path.resolve(args[sourceIndex + 1]);
    const content = await readFile(sourcePath, 'utf8');
    assert.ok(content.startsWith('# nP Obsidian code-writing agent\n'), 'Invalid canonical agent instructions');
    const metadata = {
        version: 1,
        source: sourceName,
        sha256: createHash('sha256').update(content).digest('hex'),
        bytes: Buffer.byteLength(content)
    };
    if (write) {
        await writeFile(path.join(root, 'bundled-agent/AGENTS.md'), content);
        await writeFile(path.join(root, 'bundled-agent/manifest.json'), `${JSON.stringify(metadata, null, 2)}\n`);
    }
    const bundled = await readBundledAgent();
    assert.equal(bundled.content, content, 'Bundled agent differs from canonical source; run npm run agent:sync');
    process.stdout.write(`Agent instructions ${write ? 'synchronized' : 'verified'} (${metadata.bytes} bytes).\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
