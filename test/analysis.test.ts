// Modified: 2026-07-13
import test from 'node:test';
import assert from 'node:assert/strict';
import * as nP from '../vendor/nP.esm.js';
import { runAnalysis } from '../src/analysis';
import { parseAnalysisSpec } from '../src/schema';

const example = JSON.stringify({
    frequencies: {
        start: 1e9,
        stop: 2e9,
        points: 3,
        referenceImpedance: 50
    },
    components: {
        r1: { type: 'R', value: 25 },
        l1: { type: 'L', value: 2e-9 }
    },
    nodal: [
        ['r1', 1, 2],
        ['l1', 2, 3],
        ['out', 1, 3]
    ],
    output: ['s11dB', 's21dB'],
    view: {
        type: 'line',
        title: 'Series R-L response'
    }
});

test('parses and runs a declarative nP analysis', () => {
    const previousFrequencyList = nP.global.fList;
    const spec = parseAnalysisSpec(example);
    const result = runAnalysis(spec);

    assert.deepEqual(result.inputTable[0], ['Freq', 's11dB', 's21dB']);
    assert.equal(result.inputTable.length, 4);
    assert.equal(result.inputTable[1]?.[0], 1e9);
    assert.equal(result.inputTable[3]?.[0], 2e9);
    assert.equal(nP.global.fList, previousFrequencyList);
});

test('rejects arbitrary JavaScript and unsupported components', () => {
    assert.throws(() => parseAnalysisSpec('nP.global.fList = [1e9]'), /not valid JSON/);
    assert.throws(() => parseAnalysisSpec(JSON.stringify({
        ...JSON.parse(example),
        components: { source: { type: 'eval', args: [] } }
    })), /Unsupported component type/);
});

test('rejects unknown nodal component references without leaking globals', () => {
    const previousFrequencyList = nP.global.fList;
    const spec = parseAnalysisSpec(JSON.stringify({
        ...JSON.parse(example),
        nodal: [
            ['missing', 1, 2],
            ['out', 1, 2]
        ]
    }));

    assert.throws(() => runAnalysis(spec), /unknown component/);
    assert.equal(nP.global.fList, previousFrequencyList);
});
