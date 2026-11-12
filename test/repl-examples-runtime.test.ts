// Modified: 2026-11-12
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as nPModule from '../vendor/nP.esm.js';
import { NPJS_STYLE_METHODS, normalizeMountKey } from '../src/npjs-protocol';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bundledContentRoot = path.join(repositoryRoot, 'nPort-plugin-content');
const asyncFunctionPrototype = Object.getPrototypeOf(async function () { return undefined; }) as {
    constructor: new (...args: string[]) => (...args: unknown[]) => Promise<unknown>;
};
const AsyncFunction = asyncFunctionPrototype.constructor;

function createChartProxy(): (options?: Record<string, unknown>) => Record<string, (...args: unknown[]) => void> {
    return (options: Record<string, unknown> = {}): Record<string, (...args: unknown[]) => void> => {
        assert.equal(typeof options, 'object');
        return Object.fromEntries(NPJS_STYLE_METHODS.map((method) => [method, () => undefined]));
    };
}

function createSchematicProxy(): (circuit: unknown, options?: Record<string, unknown>) => Record<string, unknown> {
    return (circuit: unknown, options: Record<string, unknown> = {}): Record<string, unknown> => {
        assert.equal(typeof options, 'object');
        const renderOptions = { ...options };
        const mount = normalizeMountKey(renderOptions.mount, 1);
        delete renderOptions.mount;
        return {
            mount,
            svg: nPModule.schematicSvg(circuit, renderOptions),
            graph: nPModule.schematicGraph(circuit, renderOptions),
            topology: nPModule.schematicTopology(circuit, renderOptions)
        };
    };
}

test('executes all numbered REPL examples through the plugin nP worker adapters', async () => {
    const manifest = JSON.parse(await readFile(path.join(bundledContentRoot, 'content-manifest.json'), 'utf8')) as {
        examples: Array<{ path: string; title: string }>;
    };
    const failures: string[] = [];

    for (const example of manifest.examples) {
        const note = await readFile(path.join(bundledContentRoot, example.path), 'utf8');
        const match = note.match(/```npjs\n([\s\S]*?)\n```/);
        assert.ok(match, `${example.path} must contain one npjs block`);
        const source = match[1]!;
        const messages: unknown[] = [];
        const previousGlobal = {
            fList: nPModule.global.fList,
            tList: nPModule.global.tList,
            twoTone: nPModule.global.twoTone,
            Ro: nPModule.global.Ro,
            Temp: nPModule.global.Temp
        };
        const safeConsole = {
            log: (...values: unknown[]) => messages.push(['log', ...values]),
            warn: (...values: unknown[]) => messages.push(['warn', ...values]),
            error: (...values: unknown[]) => messages.push(['error', ...values])
        };
        const nP = {
            ...nPModule,
            log: (...values: unknown[]) => safeConsole.log(...values),
            lineChart: createChartProxy(),
            lineTable: createChartProxy(),
            smithChart: createChartProxy(),
            schematic: createSchematicProxy()
        };
        let textOutput = '';
        const documentShim = {
            getElementById: (_id: string) => ({
                get textContent(): string { return textOutput; },
                set textContent(value: string) { textOutput = String(value); }
            })
        };
        const blocked = (): never => { throw new Error('Dynamic code construction is disabled.'); };

        try {
            const execute = new AsyncFunction(
                'nP', 'console', 'require', 'process', 'module', 'exports',
                'app', 'window', 'document', 'Function', 'eval', source
            );
            await execute(
                nP, safeConsole, undefined, undefined, undefined, undefined,
                undefined, undefined, documentShim, blocked, blocked
            );
        } catch (error) {
            failures.push(`${example.path} (${example.title}): ${error instanceof Error ? error.stack : String(error)}`);
        } finally {
            nPModule.global.fList = previousGlobal.fList;
            nPModule.global.tList = previousGlobal.tList;
            nPModule.global.twoTone = previousGlobal.twoTone;
            nPModule.global.Ro = previousGlobal.Ro;
            nPModule.global.Temp = previousGlobal.Temp;
        }
    }

    assert.deepEqual(failures, []);
});
