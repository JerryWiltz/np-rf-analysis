// Modified: 2026-11-18
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { agentInstructionsHash, installAgentInstructions } from '../src/agent-instructions';

if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', {value: webcrypto});
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = '.obsidian/plugins/np-rf-analysis';
const destination = `${directory}/AGENTS.md`;
const marker = `${directory}/AGENTS.sha256`;
const instructions = '# New bundled agent\n';
const checksum = createHash('sha256').update(instructions).digest('hex');

function memoryAdapter(entries: Array<[string, string]> = []) {
    const files = new Map(entries);
    const writes: string[] = [];
    return {
        files, writes,
        async exists(target: string) { return files.has(target); },
        async read(target: string) { assert.ok(files.has(target)); return files.get(target)!; },
        async write(target: string, text: string) { writes.push(target); files.set(target, text); }
    };
}

test('creates and reloads the matching agent without changing root instructions', async () => {
    const adapter = memoryAdapter([['AGENTS.md', '# Existing vault agent']]);
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'created');
    assert.equal(adapter.files.get(destination), instructions);
    assert.equal(adapter.files.get(marker), checksum);
    assert.equal(adapter.files.get('AGENTS.md'), '# Existing vault agent');
    adapter.writes.length = 0;
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'unchanged');
    assert.deepEqual(adapter.writes, []);
});

test('updates a previous bundled copy but preserves edited and untracked copies', async () => {
    const old = '# Older bundle\n';
    const adapter = memoryAdapter([[destination, old], [marker, await agentInstructionsHash(old)]]);
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'updated');
    adapter.files.set(destination, '# User edits\n');
    adapter.writes.length = 0;
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'preserved');
    assert.equal(adapter.files.get(destination), '# User edits\n');
    assert.deepEqual(adapter.writes, []);
    adapter.files.delete(marker);
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'preserved');
});

test('supports configuration paths and rejects traversal or a corrupt payload before writing', async () => {
    const adapter = memoryAdapter();
    assert.equal(await installAgentInstructions(adapter, '.custom/plugins/np-rf-analysis', instructions, checksum), 'created');
    for (const invalid of ['', '.', '../outside/plugins/x', '/tmp/plugins/x', '.obsidian/../plugins/x', 'C:/plugins/x', '.obsidian/plugins']) {
        await assert.rejects(installAgentInstructions(adapter, invalid, instructions, checksum));
    }
    await assert.rejects(installAgentInstructions(adapter, directory, instructions, '0'.repeat(64)), /checksum/);
    assert.ok(adapter.writes.every((target) => target.startsWith('.custom/plugins/np-rf-analysis/')));
});

test('repairs a missing ownership marker only when existing text exactly matches', async () => {
    const adapter = memoryAdapter([[destination, instructions]]);
    assert.equal(await installAgentInstructions(adapter, directory, instructions, checksum), 'unchanged');
    assert.deepEqual(adapter.writes, [marker]);
});

test('surfaces adapter failures to the plugin startup handler', async () => {
    const adapter = memoryAdapter();
    adapter.write = async () => { throw new Error('Read only'); };
    await assert.rejects(installAgentInstructions(adapter, directory, instructions, checksum), /Read only/);
});

test('build validation requires only the checked copy and detects changed or missing agent assets', async () => {
    const modulePath = pathToFileURL(path.join(root, 'scripts/sync-agent.mjs')).href;
    const {readBundledAgent} = await import(modulePath);
    const bundled = await readBundledAgent();
    const fixture = await mkdtemp(path.join(tmpdir(), 'np-agent-build-'));
    try {
        await mkdir(path.join(fixture, 'bundled-agent'));
        for (const name of ['AGENTS.md', 'manifest.json']) {
            await copyFile(path.join(root, 'bundled-agent', name), path.join(fixture, 'bundled-agent', name));
        }
        assert.equal((await readBundledAgent(fixture)).content, bundled.content);
        await writeFile(path.join(fixture, 'bundled-agent/AGENTS.md'), `${bundled.content}changed`);
        await assert.rejects(readBundledAgent(fixture), /mismatch/);
        await rm(path.join(fixture, 'bundled-agent/AGENTS.md'));
        await assert.rejects(readBundledAgent(fixture), /ENOENT/);
        const metadataPath = path.join(fixture, 'bundled-agent/manifest.json');
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as {source: string};
        assert.equal(metadata.source, 'nP-agents/obsidian/AGENTS.md');
    } finally {
        await rm(fixture, {recursive: true, force: true});
    }
});
