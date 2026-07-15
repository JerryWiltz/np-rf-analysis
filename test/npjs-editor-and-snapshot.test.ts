// Modified: 2026-07-15
import test from 'node:test';
import assert from 'node:assert/strict';
import { isInsideNpJsFence } from '../src/npjs-paste';
import {
    DEFAULT_NPJS_SETTINGS,
    applySnapshotLimits,
    createSnapshotKey,
    createSnapshotKeyFromIdentity,
    entryFromSnapshot,
    findNpJsFenceBlocks,
    isNpJsSnapshot,
    parsePluginData,
    pruneSnapshotsForMarkdown,
    removeSnapshotsForPath,
    renameSnapshotsForPath,
    resolveSnapshotIdentity,
    serializePluginData,
    type NpJsPluginData,
    type NpJsSnapshot,
    type NpJsSnapshotIdentity
} from '../src/npjs-snapshot';

const renderSnapshot = (savedAt = '2026-07-15T00:00:00.000Z'): NpJsSnapshot => ({
    version: 1,
    savedAt,
    messages: [{
        type: 'render',
        renderer: 'lineChart',
        mount: 'chart',
        options: { inputTable: [[['x', 'y'], [1, 2]]] }
    }]
});

const pluginData = (): NpJsPluginData => ({
    settings: { ...DEFAULT_NPJS_SETTINGS },
    snapshots: {}
});

const addSnapshot = (data: NpJsPluginData, identity: NpJsSnapshotIdentity, snapshot = renderSnapshot()): string => {
    const key = createSnapshotKeyFromIdentity(identity);
    data.snapshots[key] = entryFromSnapshot(identity, snapshot);
    return key;
};

test('detects editing positions inside npjs fences only', () => {
    const note = [
        '# Example',
        '',
        '```npjs',
        'const r1 = nP.R();',
        '```',
        '',
        '```js',
        'const ordinary = true;',
        '```'
    ].join('\n');

    assert.equal(isInsideNpJsFence(note, note.indexOf('const r1')), true);
    assert.equal(isInsideNpJsFence(note, note.indexOf('ordinary')), false);
    assert.equal(isInsideNpJsFence(note, note.indexOf('# Example')), false);
});

test('accepts tilde npjs fences and rejects positions after the closing fence', () => {
    const note = '~~~npjs\nnP.lineChart();\n~~~\nafter';
    assert.equal(isInsideNpJsFence(note, note.indexOf('nP.lineChart')), true);
    assert.equal(isInsideNpJsFence(note, note.indexOf('after')), false);
});

test('discovers npjs blocks and assigns stable occurrences to duplicate source', () => {
    const note = [
        '```npjs',
        'nP.lineChart();',
        '```',
        '```js',
        'ignored();',
        '```',
        '~~~npjs',
        'nP.lineChart();',
        '~~~'
    ].join('\n');
    const blocks = findNpJsFenceBlocks(note, 'note.md');
    assert.equal(blocks.length, 2);
    assert.equal(blocks[0]?.occurrence, 0);
    assert.equal(blocks[1]?.occurrence, 1);
    assert.equal(blocks[0]?.lineStart, 0);
    assert.equal(blocks[1]?.lineStart, 6);
});

test('creates stable source-specific and occurrence-specific snapshot keys', () => {
    const first = createSnapshotKey('note.md', 'nP.R();');
    assert.equal(first, createSnapshotKey('note.md', 'nP.R();'));
    assert.notEqual(first, createSnapshotKey('note.md', 'nP.C();'));
    assert.notEqual(first, createSnapshotKey('other.md', 'nP.R();'));
    assert.notEqual(first, createSnapshotKey('note.md', 'nP.R();', 1));
});

test('resolves duplicate block identity from its current note section', () => {
    const note = '```npjs\nnP.R();\n```\ntext\n```npjs\nnP.R();\n```';
    assert.equal(resolveSnapshotIdentity('note.md', 'nP.R();', note, 4).occurrence, 1);
});

test('loads validated entries and migrates legacy version 1 snapshots', () => {
    const valid = renderSnapshot();
    assert.equal(isNpJsSnapshot(valid), true);
    assert.equal(isNpJsSnapshot({ ...valid, messages: [{ type: 'error', message: 'no' }] }), false);

    const legacyKey = 'folder/note.md:7:1234567890abcdef';
    const parsed = parsePluginData({ snapshots: { [legacyKey]: valid, invalid: { version: 2 } } });
    const entries = Object.values(parsed.snapshots);
    assert.equal(entries.length, 1);
    assert.equal(entries[0]?.version, 2);
    assert.equal(entries[0]?.sourcePath, 'folder/note.md');
    assert.equal(entries[0]?.sourceHash, '1234567890abcdef');
    assert.deepEqual(parsed.settings, DEFAULT_NPJS_SETTINGS);
});

test('prunes edited or deleted blocks while retaining unchanged blocks', () => {
    const original = '```npjs\nnP.R();\n```\n```npjs\nnP.C();\n```';
    const changed = '```npjs\nnP.L();\n```\n```npjs\nnP.C();\n```';
    const data = pluginData();
    const blocks = findNpJsFenceBlocks(original, 'note.md');
    const resistorKey = addSnapshot(data, blocks[0]!);
    const capacitorKey = addSnapshot(data, blocks[1]!);

    assert.equal(pruneSnapshotsForMarkdown(data, 'note.md', changed), 1);
    assert.equal(data.snapshots[resistorKey], undefined);
    assert.ok(data.snapshots[capacitorKey]);
    assert.equal(removeSnapshotsForPath(data, 'note.md'), 1);
    assert.deepEqual(data.snapshots, {});
});

test('renames snapshot ownership without changing block identity', () => {
    const data = pluginData();
    const identity = resolveSnapshotIdentity('old.md', 'nP.R();', '```npjs\nnP.R();\n```', 0);
    addSnapshot(data, identity);
    assert.equal(renameSnapshotsForPath(data, 'old.md', 'new.md'), 1);
    const entry = Object.values(data.snapshots)[0];
    assert.equal(entry?.sourcePath, 'new.md');
    assert.ok(data.snapshots[createSnapshotKey('new.md', 'nP.R();')]);
});

test('removes expired snapshots and evicts oldest snapshots above the size limit', () => {
    const expiredData = pluginData();
    const oldIdentity = { sourcePath: 'old.md', sourceHash: 'old', occurrence: 0 };
    addSnapshot(expiredData, oldIdentity, renderSnapshot('2025-01-01T00:00:00.000Z'));
    assert.equal(applySnapshotLimits(expiredData, Date.parse('2026-07-15T00:00:00.000Z')).length, 1);

    const sizedData = pluginData();
    sizedData.settings.maxStorageMb = 0.001;
    const largeSnapshot = (savedAt: string): NpJsSnapshot => ({
        version: 1,
        savedAt,
        messages: [{ type: 'console', level: 'log', text: 'x'.repeat(700) }]
    });
    const oldestKey = addSnapshot(
        sizedData,
        { sourcePath: 'first.md', sourceHash: 'first', occurrence: 0 },
        largeSnapshot('2026-07-14T00:00:00.000Z')
    );
    const newestKey = addSnapshot(
        sizedData,
        { sourcePath: 'second.md', sourceHash: 'second', occurrence: 0 },
        largeSnapshot('2026-07-15T00:00:00.000Z')
    );
    applySnapshotLimits(sizedData, Date.parse('2026-07-15T01:00:00.000Z'));
    assert.equal(sizedData.snapshots[oldestKey], undefined);
    assert.ok(sizedData.snapshots[newestKey]);
});

test('preserves non-finite RF values through JSON plugin storage', () => {
    const data = pluginData();
    const identity = { sourcePath: 'rf.md', sourceHash: 'rf', occurrence: 0 };
    const snapshot: NpJsSnapshot = {
        version: 1,
        savedAt: '2026-07-15T00:00:00.000Z',
        messages: [{
            type: 'render',
            renderer: 'lineChart',
            mount: 'chart',
            options: { inputTable: [[['x', 'y'], [1, -Infinity], [2, NaN]]] }
        }]
    };
    const key = addSnapshot(data, identity, snapshot);
    const stored = JSON.parse(JSON.stringify(serializePluginData(data)));
    const restored = parsePluginData(stored);
    const message = restored.snapshots[key]?.messages[0];
    assert.equal(message?.type, 'render');
    if (message?.type !== 'render') return;
    const table = message.options.inputTable as unknown[][][];
    assert.equal(table[0]?.[1]?.[1], -Infinity);
    assert.equal(Number.isNaN(table[0]?.[2]?.[1]), true);
});
