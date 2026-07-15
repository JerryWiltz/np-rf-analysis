// Modified: 2026-07-14
import { NPJS_CHANNEL } from './npjs-protocol';

export function createRunnerDocument(workerSource: string): string {
    const encodedWorkerSource = JSON.stringify(workerSource).replaceAll('<', '\\u003c');
    const encodedChannel = JSON.stringify(NPJS_CHANNEL);
    return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; img-src data: blob:"></head><body><script>(() => {
        const channel = ${encodedChannel};
        const source = ${encodedWorkerSource};
        let worker;
        let workerUrl;
        const dispose = () => {
            if (worker) worker.terminate();
            if (workerUrl) URL.revokeObjectURL(workerUrl);
            worker = undefined;
            workerUrl = undefined;
        };
        addEventListener('message', (event) => {
            if (event.source !== parent || !event.data || event.data.channel !== channel) return;
            const message = event.data;
            if (message.type === 'stop') {
                dispose();
                return;
            }
            if (message.type !== 'run' || typeof message.source !== 'string' || typeof message.token !== 'string') return;
            dispose();
            workerUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
            worker = new Worker(workerUrl);
            worker.onmessage = (workerEvent) => {
                parent.postMessage({ channel, token: message.token, payload: workerEvent.data }, '*');
                if (workerEvent.data && (workerEvent.data.type === 'error' || (workerEvent.data.type === 'status' && workerEvent.data.status === 'complete'))) {
                    queueMicrotask(dispose);
                }
            };
            worker.onerror = (workerError) => {
                parent.postMessage({ channel, token: message.token, payload: { type: 'error', message: workerError.message || 'The npjs worker failed.' } }, '*');
                dispose();
            };
            worker.postMessage({ type: 'run', source: message.source });
        });
    })();</script></body></html>`;
}
