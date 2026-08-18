// Modified: 2026-08-18
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

test('vendored nP 0.0.48 exposes seriesTee and both mtee call forms', () => {
    const previousFrequencyList = nP.global.fList;
    const previousReferenceImpedance = nP.global.Ro;

    try {
        nP.global.fList = [1e9];
        nP.global.Ro = 50;

        assert.equal(nP.version, '0.0.48');
        assert.equal(nP.seriesTee().out('s11mag')[1]?.[0], 1e9);

        const parameters = [
            0.030 * 0.0254,
            0.020 * 0.0254,
            0.025 * 0.0254,
            0.025 * 0.0254,
            0.0000125 * 0.0254,
            10,
            0,
            0,
            0
        ] as const;
        const positional = nP.mtee(...parameters).out('s11Re', 's11Im');
        const optionsObject = nP.mtee({
            commonWidth: parameters[0],
            branch1Width: parameters[1],
            branch2Width: parameters[2],
            Height: parameters[3],
            Thickness: parameters[4],
            er: parameters[5],
            rho: parameters[6],
            tand: parameters[7],
            roughnessRms: parameters[8]
        }).out('s11Re', 's11Im');

        assert.deepEqual(optionsObject, positional);
    } finally {
        nP.global.fList = previousFrequencyList;
        nP.global.Ro = previousReferenceImpedance;
    }
});
