// Modified: 2026-11-12
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    DOCUMENTATION_URL,
    ISSUE_TRACKER_URL,
    NP_EXAMPLE,
    NPJS_EXAMPLE
} from '../src/help-content';
import * as nP from '../vendor/nP.esm.js';
import { lintNpJs } from '../src/npjs-lint';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pluginContentPath = path.join(repositoryRoot, 'nPort-plugin-content');
const examplesPath = path.join(pluginContentPath, 'Examples');

function fencedBody(source: string, language: string): string {
    const opening = `\`\`\`${language}\n`;
    assert.ok(source.startsWith(opening));
    assert.ok(source.endsWith('\n```'));
    return source.slice(opening.length, -4);
}

test('provides a complete npjs Markdown example', () => {
    const body = fencedBody(NPJS_EXAMPLE, 'npjs');
    assert.match(body, /nP\.nodal\(/);
    assert.match(body, /nP\.lineChart\(/);
    assert.match(body, /mount: '#chartDiv'/);
});

test('provides a valid declarative np Markdown example', () => {
    const body = fencedBody(NP_EXAMPLE, 'np');
    const example = JSON.parse(body) as {
        output?: unknown;
        view?: { type?: unknown };
    };
    assert.deepEqual(example.output, ['s11dB', 's21dB']);
    assert.equal(example.view?.type, 'line');
});

test('uses fixed HTTPS documentation and issue tracker URLs', () => {
    assert.equal(DOCUMENTATION_URL, 'https://github.com/JerryWiltz/np-rf-analysis#readme');
    assert.equal(ISSUE_TRACKER_URL, 'https://github.com/JerryWiltz/np-rf-analysis/issues');
});

test('bundles every nP REPL example in source order in one flat Examples folder', async () => {
    const manifest = JSON.parse(await readFile(path.join(pluginContentPath, 'content-manifest.json'), 'utf8')) as {
        version: number;
        pluginVersion: string;
        releaseNotesFolder: string;
        source: { repository: string; path: string; sha256: string };
        examples: Array<{ order: number; id: string; title: string; path: string; sha256: string }>;
        files: Array<{ path: string; sha256: string }>;
    };
    assert.equal(manifest.version, 2);
    assert.equal(manifest.pluginVersion, '0.3.3');
    assert.equal(manifest.releaseNotesFolder, "What's new in version 0.3.3");
    assert.equal(manifest.source.repository, 'nP');
    assert.equal(manifest.source.path, 'docs/.vitepress/theme/replExamples.js');
    assert.match(manifest.source.sha256, /^[a-f0-9]{64}$/);
    assert.equal(manifest.examples.length, 46);
    assert.equal(manifest.files.length, 48);
    assert.equal(manifest.files.some((entry) => entry.path === 'README.md'), false,
        'the content README is maintainer documentation, not user payload');
    assert.deepEqual(manifest.examples.map((example) => example.order),
        Array.from({ length: 46 }, (_, index) => index + 1));

    const index = await readFile(path.join(examplesPath, 'Examples Home.md'), 'utf8');
    assert.match(index, /nP REPL examples/);
    for (const example of manifest.examples) {
        assert.match(example.path, /^Examples\/\d{2} .+\.md$/);
        assert.equal(example.path.slice('Examples/'.length).includes('/'), false);
        const note = await readFile(path.join(pluginContentPath, example.path), 'utf8');
        assert.match(note, new RegExp(`# ${String(example.order).padStart(2, '0')} ${example.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
        assert.match(note, new RegExp(`Generated from nP REPL example ${example.id}`));
        assert.equal([...note.matchAll(/```npjs\n/g)].length, 1);
        assert.match(note, new RegExp(`https://jerrywiltz\\.github\\.io/nP/repl\\.html#example-${example.id}`));
        const match = note.match(/```npjs\n([\s\S]*?)\n```/);
        assert.ok(match, `${example.path} must contain a runnable npjs block`);
        assert.deepEqual(lintNpJs(match[1]!, nP), [], `${example.path} should pass pinned-API lint`);
    }
    assert.ok(manifest.files.every((entry) => {
        const folder = entry.path.split('/')[0];
        return (folder === 'Examples' || folder === manifest.releaseNotesFolder)
            && !entry.path.slice(folder.length + 1).includes('/');
    }));
    for (const file of manifest.files) {
        const content = await readFile(path.join(pluginContentPath, file.path));
        assert.equal(createHash('sha256').update(content).digest('hex'), file.sha256, file.path);
    }
    assert.ok(manifest.files.some((entry) => entry.path === "What's new in version 0.3.3/What's new.md"));
    const releaseNotes = await readFile(path.join(pluginContentPath, manifest.files.find((entry) =>
        entry.path.startsWith("What's new in version "))!.path), 'utf8');
    assert.match(releaseNotes, /nP `0\.49\.0`/);
    assert.match(releaseNotes, /checks for JavaScript syntax/i);
});

test('creates versioned release notes and Examples below the nPort RF Analysis folder', async () => {
    const source = await readFile(path.join(repositoryRoot, 'src/bundled-content.ts'), 'utf8');
    assert.match(source, /EDUCATIONAL_CONTENT_ROOT = 'nPort RF Analysis'/);
    assert.match(source, /EXAMPLES_FOLDER = 'Examples'/);
    assert.match(source, /RELEASE_NOTES_FOLDER/);
    assert.doesNotMatch(source, /LESSONS_FOLDER|Getting Started/);
});

test('settings install release notes and Examples without hidden navigation or clipboard controls', async () => {
    const source = await readFile(path.join(repositoryRoot, 'src/settings.ts'), 'utf8');
    assert.match(source, /action: 'Installed'/);
    assert.match(source, /Close Settings and open this folder in Files/);
    assert.match(source, /setName\('Examples'\)/);
    assert.match(source, /setName\("What's new"\)/);
    assert.doesNotMatch(source, /LESSONS_FOLDER|setName\('Lessons'\)/);
    assert.doesNotMatch(source, /Copy npjs example|Copy np example/);
    assert.doesNotMatch(source, /openFile\(/);
});
