import test from 'node:test';
import assert from 'node:assert/strict';
import * as nP from '../vendor/nP.esm.js';
import { lintNpJs } from '../src/npjs-lint';

const api = nP as unknown as Record<string, unknown>;

test('reports unknown direct nP calls and suggests case-correct public names', () => {
    const messages = lintNpJs('nP.r(50);', api);
    assert.equal(messages.length, 1);
    assert.match(messages[0]!.message, /Did you mean nP\.R\(\)/);
    assert.equal(messages[0]!.line, 1);
});

test('accepts valid direct nP API calls and assignments', () => {
    const messages = lintNpJs('nP.global.fList = [1e9];\nvar r1 = nP.R(50);\nr1.out("s11dB");', api);
    assert.deepEqual(messages, []);
});

test('reports accidental comma expressions', () => {
    const messages = lintNpJs('nP.log(1), nP.log(2);', api);
    assert.ok(messages.some((message) => /comma|sequence/i.test(message.message)));
});

test('reports unexpected line continuations', () => {
    const messages = lintNpJs('var result = nP.R(50)\n[nP.L(1e-9)];', api);
    assert.ok(messages.some((message) => /Unexpected continuation/.test(message.message)));
});

test('reports JavaScript syntax errors without preventing execution at the caller', () => {
    const messages = lintNpJs('var = ;', api);
    assert.ok(messages.some((message) => /Parsing error/.test(message.message)));
});

test('does not mistake a locally shadowed nP identifier for the global API', () => {
    const messages = lintNpJs('function test(nP) { return nP.r(); }', api);
    assert.deepEqual(messages, []);
});
