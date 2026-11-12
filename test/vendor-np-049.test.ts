// Modified: 2026-11-09
import test from 'node:test';
import assert from 'node:assert/strict';
import * as nP from '../vendor/nP.esm.js';
import { schematicSvgPreflight } from '../src/safe-schematic-svg';

interface MutableGlobalState {
    fList: number[];
    tList: number[];
    twoTone: unknown;
    Ro: number;
    Temp: number;
}

function preserveGlobal(): MutableGlobalState {
    return {
        fList: nP.global.fList,
        tList: nP.global.tList,
        twoTone: nP.global.twoTone,
        Ro: nP.global.Ro,
        Temp: nP.global.Temp
    };
}

function restoreGlobal(state: MutableGlobalState): void {
    nP.global.fList = state.fList;
    nP.global.tList = state.tList;
    nP.global.twoTone = state.twoTone;
    nP.global.Ro = state.Ro;
    nP.global.Temp = state.Temp;
}

test('pins the approved restricted nP 0.49.0 API', () => {
    assert.equal(nP.version, '0.49.0');
    for (const name of [
        'schematicSvg', 'schematicGraph', 'schematicTopology',
        'waveform', 'PN', 'FFT', 'invFFT', 'mod', 'demod', 'bitErrorRate'
    ] as const) assert.equal(typeof nP[name], 'function', name);
});

test('generates a safe, transferable schematic without browser APIs', () => {
    const previous = preserveGlobal();
    try {
        nP.global.fList = [1e9];
        const circuit = nP.nodal(
            [nP.R(25), 1, 2],
            [nP.C(1e-12), 2, 3],
            ['out', 1, 3]
        );
        const svg = nP.schematicSvg(circuit);
        assert.equal(schematicSvgPreflight(svg), true);
        assert.match(svg, /R1 = 25 Ω/);
        assert.match(svg, /C1 = 1e-12 F/);
        assert.doesNotThrow(() => structuredClone({
            svg,
            graph: nP.schematicGraph(circuit),
            topology: nP.schematicTopology(circuit)
        }));
    } finally {
        restoreGlobal(previous);
    }
});

test('produces transferable waveform and FFT chart tables', () => {
    const previous = preserveGlobal();
    try {
        nP.global.tList = nP.global.tGen(0, 3e-3, 4);
        nP.global.fList = [];
        const wave = nP.waveform({ shape: 'square', period: 4e-3 });
        const timeTable = wave.out('waveform');
        const frequencyTable = nP.FFT(wave.out('samples') as unknown[]).out('dBV');
        assert.doesNotThrow(() => structuredClone({ timeTable, frequencyTable }));
    } finally {
        restoreGlobal(previous);
    }
});
