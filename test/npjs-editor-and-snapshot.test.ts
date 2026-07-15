// Modified: 2026-07-15
import test from 'node:test';
import assert from 'node:assert/strict';
import { isInsideNpJsFence } from '../src/npjs-paste';
import {
    createSnapshotKey,
    isNpJsSnapshot,
    parsePluginData,
    serializePluginData
} from '../src/npjs-snapshot';

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

test('creates stable source-specific snapshot keys', () => {
    const first = createSnapshotKey('note.md', 'nP.R();');
    assert.equal(first, createSnapshotKey('note.md', 'nP.R();'));
    assert.notEqual(first, createSnapshotKey('note.md', 'nP.C();'));
    assert.notEqual(first, createSnapshotKey('other.md', 'nP.R();'));
});

test('loads only validated render snapshots from plugin data', () => {
    const valid = {
        version: 1,
        savedAt: '2026-07-15T00:00:00.000Z',
        messages: [{
            type: 'render',
            renderer: 'lineChart',
            mount: 'chart',
            options: { inputTable: [[['x', 'y'], [1, 2]]] }
        }]
    };
    assert.equal(isNpJsSnapshot(valid), true);
    assert.equal(isNpJsSnapshot({ ...valid, messages: [{ type: 'error', message: 'no' }] }), false);

    const parsed = parsePluginData({ snapshots: { valid, invalid: { version: 2 } } });
    assert.deepEqual(Object.keys(parsed.snapshots), ['valid']);
});

test('preserves non-finite RF values through JSON plugin storage', () => {
    const data = {
        snapshots: {
            rf: {
                version: 1 as const,
                savedAt: '2026-07-15T00:00:00.000Z',
                messages: [{
                    type: 'render' as const,
                    renderer: 'lineChart' as const,
                    mount: 'chart',
                    options: { inputTable: [[['x', 'y'], [1, -Infinity], [2, NaN]]] }
                }]
            }
        }
    };
    const stored = JSON.parse(JSON.stringify(serializePluginData(data)));
    const restored = parsePluginData(stored);
    const message = restored.snapshots.rf?.messages[0];
    assert.equal(message?.type, 'render');
    if (message?.type !== 'render') return;
    const table = message.options.inputTable as unknown[][][];
    assert.equal(table[0]?.[1]?.[1], -Infinity);
    assert.equal(Number.isNaN(table[0]?.[2]?.[1]), true);
});
