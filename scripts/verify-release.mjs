// Modified: 2026-07-22
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function read(path) {
    return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

const [packageText, manifestText, versionsText, main, renderChild, runnerDocument, worker] = await Promise.all([
    read('package.json'),
    read('manifest.json'),
    read('versions.json'),
    read('main.js'),
    read('src/npjs-render-child.ts'),
    read('src/npjs-runner-document.ts'),
    read('src/npjs-worker.ts')
]);

const packageJson = JSON.parse(packageText);
const manifest = JSON.parse(manifestText);
const versions = JSON.parse(versionsText);

assert.equal(packageJson.version, manifest.version, 'package.json and manifest.json versions must match');
assert.equal(
    versions[manifest.version],
    manifest.minAppVersion,
    'versions.json must map the current plugin version to manifest.json minAppVersion'
);
assert.equal(manifest.isDesktopOnly, true, 'mobile support must not be declared without a separate audit');

const forbiddenGeneratedPatterns = [
    ['dynamic script creation with double quotes', 'document.createElement("script")'],
    ['dynamic script creation with single quotes', "document.createElement('script')"],
    ['Obsidian script creation', 'createEl("script")'],
    ['Obsidian script creation', "createEl('script')"],
    ['legacy nP script helper', 'callCodemirror'],
    ['legacy nP script injection', 'newScript.innerHTML']
];

for (const [description, pattern] of forbiddenGeneratedPatterns) {
    assert.equal(main.includes(pattern), false, `main.js contains ${description}: ${pattern}`);
}

assert.match(renderChild, /registerDomEvent\(this\.runButton, 'click', \(\) => this\.run\(\)\)/,
    'npjs execution must remain gated by the Run button');
assert.match(renderChild, /setAttribute\('sandbox', 'allow-scripts'\)/,
    'the runner iframe must retain its sandbox');
assert.match(renderChild, /onunload\(\)[\s\S]*?this\.destroyRunner\(\)/,
    'the runner must be destroyed when its render child unloads');
assert.match(runnerDocument, /default-src 'none'/, 'the runner CSP must deny resources by default');
assert.match(runnerDocument, /connect-src 'none'/, 'the runner CSP must deny network connections');
assert.match(runnerDocument, /worker-src blob:/, 'the runner must restrict workers to its generated blob');
assert.match(runnerDocument, /worker\.terminate\(\)/, 'the disposable worker must be terminated');

for (const name of [
    'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'WebTransport',
    'importScripts', 'Worker', 'SharedWorker', 'BroadcastChannel', 'indexedDB', 'caches'
]) {
    assert.match(worker, new RegExp(`['"]${name}['"]`), `the worker must continue blocking ${name}`);
}

for (const name of ['require', 'process', 'app', 'window', 'document', 'Function', 'eval']) {
    assert.match(worker, new RegExp(`['"]${name}['"]`), `the executor boundary must account for ${name}`);
}

process.stdout.write(`Release verification passed for nPort RF Analysis ${manifest.version}.\n`);
