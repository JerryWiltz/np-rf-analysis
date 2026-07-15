// Modified: 2026-07-14
import test from 'node:test';
import assert from 'node:assert/strict';
import { isNpJsWorkerMessage, normalizeMountKey } from '../src/npjs-protocol';
import { createRunnerDocument } from '../src/npjs-runner-document';

test('normalizes existing nP mount selectors without changing source code', () => {
    assert.equal(normalizeMountKey('#chartDiv', 1), 'chartDiv');
    assert.equal(normalizeMountKey('#testXYDiv', 2), 'testXYDiv');
    assert.equal(normalizeMountKey(undefined, 3), 'output-3');
});

test('accepts only expected worker messages', () => {
    assert.equal(isNpJsWorkerMessage({
        type: 'render',
        renderer: 'lineChart',
        mount: 'chartDiv',
        options: { inputTable: [[['x', 'y'], [1, 2]]] }
    }), true);
    assert.equal(isNpJsWorkerMessage({
        type: 'render',
        renderer: 'html',
        mount: 'chartDiv',
        options: {}
    }), false);
    assert.equal(isNpJsWorkerMessage({ type: 'error', message: 42 }), false);
    assert.equal(isNpJsWorkerMessage({
        type: 'style',
        mount: 'tableDiv',
        method: 'setTxtTableTitleStyle',
        args: [{ fill: 'red' }]
    }), true);
    assert.equal(isNpJsWorkerMessage({
        type: 'style',
        mount: 'tableDiv',
        method: 'remove',
        args: []
    }), false);
    assert.equal(isNpJsWorkerMessage({
        type: 'text',
        mount: 'realMatrix',
        text: 'Result'
    }), true);
});

test('builds a closed sandbox runner document without interpolating executable markup', () => {
    const document = createRunnerDocument('postMessage("</script><script>bad()</script>")');

    assert.match(document, /Content-Security-Policy/);
    assert.match(document, /connect-src 'none'/);
    assert.match(document, /script-src 'unsafe-inline' 'unsafe-eval' blob:/);
    assert.match(document, /sandbox|worker-src blob:/);
    assert.equal((document.match(/<script>/g) ?? []).length, 1);
    assert.equal((document.match(/<\/script>/g) ?? []).length, 1);
    assert.equal(document.includes('<script>bad()</script>'), false);
});
