// Modified: 2026-07-25
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    DOCUMENTATION_URL,
    ISSUE_TRACKER_URL,
    NP_EXAMPLE,
    NPJS_EXAMPLE
} from '../src/help-content';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const learningGuidePath = path.join(repositoryRoot, 'learning-guide');

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

test('bundles the complete learning guide without its AGENTS file', async () => {
    const files = (await readdir(learningGuidePath, { withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)
        .sort();
    assert.equal(files.length, 10);
    assert.equal(files.includes('AGENTS.md'), false);
    assert.equal(files.includes('1 "Hello, nPort".md'), true);
    assert.equal(files.includes('200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md'), true);

    const start = await readFile(path.join(learningGuidePath, '1 "Hello, nPort".md'), 'utf8');
    assert.match(start, /^<!-- Modified: 2026-07-17 -->/);
    assert.match(start, /```npjs\nconsole\.log\("Hello, nPort!"\);\n```/);
});

test('creates the bundled lessons in the Getting Started folder', async () => {
    const source = await readFile(path.join(repositoryRoot, 'src/learning-guide.ts'), 'utf8');
    assert.match(source, /LEARNING_GUIDE_FOLDER = 'Getting Started'/);
    assert.doesNotMatch(source, /LEARNING_GUIDE_FOLDER = '1 Learning nP'/);
});

test('bundles every referenced SVG as a safe self-contained guide asset', async () => {
    const lessonFiles = (await readdir(learningGuidePath))
        .filter((filename) => filename.endsWith('.md'));
    const lessonText = (await Promise.all(lessonFiles.map((filename) =>
        readFile(path.join(learningGuidePath, filename), 'utf8')))).join('\n');
    assert.doesNotMatch(lessonText, /!\[\[Images\//);

    const references = [...lessonText.matchAll(
        /!\[\[Getting Started\/Images\/([^|\]]+\.svg)(?:\\?\|[0-9]+)?\]\]/g
    )].map((match) => match[1]!);
    const imagesPath = path.join(learningGuidePath, 'Images');
    const images = (await readdir(imagesPath)).sort();
    assert.deepEqual([...new Set(references)].sort(), images);

    for (const filename of images) {
        const svg = await readFile(path.join(imagesPath, filename), 'utf8');
        assert.match(svg, /<svg\b/);
        assert.doesNotMatch(svg, /<script\b|<foreignObject\b|on[a-z]+\s*=|<image\b[^>]*href=/i);
    }
});
