// Modified: 2026-07-15
import * as nPModule from '../vendor/nP.esm.js';
import {
    NPJS_STYLE_METHODS,
    normalizeMountKey,
    type NpJsRenderer,
    type NpJsWorkerMessage
} from './npjs-protocol';

interface RunRequest {
    type: 'run';
    source: string;
}

type AsyncExecutor = (...args: unknown[]) => Promise<unknown>;
type AsyncFunctionConstructor = new (...args: string[]) => AsyncExecutor;
interface NpJsWorkerScope {
    onmessage: ((event: MessageEvent<RunRequest>) => void) | null;
    postMessage(message: NpJsWorkerMessage): void;
}

const workerScope = self as unknown as NpJsWorkerScope;
const AsyncFunction = Object.getPrototypeOf(async function () { return undefined; }).constructor as AsyncFunctionConstructor;

function send(message: NpJsWorkerMessage): void {
    workerScope.postMessage(message);
}

function errorMessage(error: unknown): string {
    if (error instanceof Error) return error.stack ?? error.message;
    return String(error);
}

function consoleText(values: unknown[]): string {
    return values.map((value) => {
        if (typeof value === 'string') return value;
        try {
            return JSON.stringify(value);
        } catch {
            return String(value);
        }
    }).join(' ');
}

function blockNetworkAndStorageApis(): void {
    const blocked = (): never => {
        throw new Error('Network, storage, and nested worker APIs are disabled in npjs blocks.');
    };

    const blockedNames = [
        'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'WebTransport',
        'importScripts', 'Worker', 'SharedWorker', 'BroadcastChannel',
        'indexedDB', 'caches'
    ];

    for (const name of blockedNames) {
        try {
            Object.defineProperty(globalThis, name, {
                configurable: false,
                enumerable: false,
                value: blocked,
                writable: false
            });
        } catch {
            // The sandboxed runner's Content Security Policy remains the primary network boundary.
        }
    }
}

function createChartProxy(renderer: NpJsRenderer, nextIndex: () => number): (options?: Record<string, unknown>) => Record<string, (...args: unknown[]) => void> {
    return (options: Record<string, unknown> = {}): Record<string, (...args: unknown[]) => void> => {
        if (typeof options !== 'object' || options === null || Array.isArray(options)) {
            throw new Error(`nP.${renderer}() requires an options object.`);
        }

        const index = nextIndex();
        const mount = normalizeMountKey(options.mount, index);
        const renderOptions: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(options)) {
            if (key !== 'mount') renderOptions[key] = value;
        }

        try {
            send({ type: 'render', renderer, mount, options: renderOptions });
        } catch (error) {
            throw new Error(`nP.${renderer}() options must contain worker-transferable data: ${errorMessage(error)}`);
        }

        const api: Record<string, (...args: unknown[]) => void> = {};
        for (const method of NPJS_STYLE_METHODS) {
            api[method] = (...args: unknown[]): void => {
                send({ type: 'style', mount, method, args });
            };
        }
        return api;
    };
}

function createTextDocument(): { getElementById(id: string): { textContent: string } } {
    return Object.freeze({
        getElementById(id: string): { textContent: string } {
            if (typeof id !== 'string' || id.length === 0 || id.length > 256) {
                throw new Error('document.getElementById() requires a short, non-empty text identifier.');
            }

            let value = '';
            return {
                get textContent(): string {
                    return value;
                },
                set textContent(text: string) {
                    value = String(text);
                    send({ type: 'text', mount: id, text: value });
                }
            };
        }
    });
}

async function execute(source: string): Promise<void> {
    let renderIndex = 0;
    const nextIndex = (): number => ++renderIndex;
    const nP = {
        ...nPModule,
        lineChart: createChartProxy('lineChart', nextIndex),
        lineTable: createChartProxy('lineTable', nextIndex),
        smithChart: createChartProxy('smithChart', nextIndex)
    };
    const previousGlobal = {
        fList: nPModule.global.fList,
        Ro: nPModule.global.Ro,
        Temp: nPModule.global.Temp
    };
    const safeConsole = {
        log: (...values: unknown[]) => send({ type: 'console', level: 'log', text: consoleText(values) }),
        warn: (...values: unknown[]) => send({ type: 'console', level: 'warn', text: consoleText(values) }),
        error: (...values: unknown[]) => send({ type: 'console', level: 'error', text: consoleText(values) })
    };
    const blockedConstructor = (): never => {
        throw new Error('Dynamic code constructors are disabled inside npjs blocks.');
    };
    const textDocument = createTextDocument();

    try {
        const run = new AsyncFunction(
            'nP', 'console', 'require', 'process', 'module', 'exports',
            'app', 'window', 'document', 'Function', 'eval',
            source
        );
        await run(
            nP, safeConsole, undefined, undefined, undefined, undefined,
            undefined, undefined, textDocument, blockedConstructor, blockedConstructor
        );
    } finally {
        nPModule.global.fList = previousGlobal.fList;
        nPModule.global.Ro = previousGlobal.Ro;
        nPModule.global.Temp = previousGlobal.Temp;
    }
}

blockNetworkAndStorageApis();

workerScope.onmessage = (event: MessageEvent<RunRequest>): void => {
    const request = event.data;
    if (!request || request.type !== 'run' || typeof request.source !== 'string') return;

    send({ type: 'status', status: 'running' });
    void execute(request.source)
        .then(() => send({ type: 'status', status: 'complete' }))
        .catch((error: unknown) => send({ type: 'error', message: errorMessage(error) }));
};
