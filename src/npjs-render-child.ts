// Modified: 2026-07-15
import { MarkdownRenderChild } from 'obsidian';
import * as nP from '../vendor/nP.esm.js';
import workerSource from 'npjs-worker-source';
import {
    NPJS_CHANNEL,
    isNpJsWorkerMessage,
    type NpJsRenderMessage
} from './npjs-protocol';
import { createRunnerDocument } from './npjs-runner-document';
import {
    type NpJsSnapshotMessage,
    type NpJsSnapshotStore
} from './npjs-snapshot';

interface RunnerEnvelope {
    channel: string;
    token: string;
    payload: unknown;
}

function isRunnerEnvelope(value: unknown): value is RunnerEnvelope {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value)
        && (value as Record<string, unknown>).channel === NPJS_CHANNEL
        && typeof (value as Record<string, unknown>).token === 'string';
}

function createToken(): string {
    const values = new Uint32Array(4);
    crypto.getRandomValues(values);
    return Array.from(values, (value) => value.toString(16).padStart(8, '0')).join('');
}

export class NpJsRenderChild extends MarkdownRenderChild {
    private runButton!: HTMLButtonElement;
    private stopButton!: HTMLButtonElement;
    private resetButton!: HTMLButtonElement;
    private statusEl!: HTMLSpanElement;
    private outputEl!: HTMLDivElement;
    private consoleEl!: HTMLPreElement;
    private runnerFrame: HTMLIFrameElement | null = null;
    private token: string | null = null;
    private readonly mounts = new Map<string, HTMLDivElement>();
    private readonly renderApis = new Map<string, Record<string, unknown>>();
    private readonly textMounts = new Map<string, HTMLPreElement>();
    private snapshotMessages: NpJsSnapshotMessage[] = [];

    constructor(
        containerEl: HTMLElement,
        private readonly source: string,
        private readonly snapshotStore: NpJsSnapshotStore
    ) {
        super(containerEl);
    }

    onload(): void {
        this.containerEl.empty();
        this.containerEl.addClass('np-rf-analysis', 'np-rf-analysis-js');

        const warning = this.containerEl.createDiv({
            cls: 'np-rf-analysis-warning',
            text: 'Runs verbatim JavaScript in an isolated worker. Only run code you trust.'
        });
        warning.setAttr('role', 'note');

        const toolbar = this.containerEl.createDiv({ cls: 'np-rf-analysis-toolbar' });
        this.runButton = toolbar.createEl('button', { text: 'Run', cls: 'np-rf-analysis-run' });
        this.stopButton = toolbar.createEl('button', { text: 'Stop' });
        this.resetButton = toolbar.createEl('button', { text: 'Reset' });
        for (const button of [this.runButton, this.stopButton, this.resetButton]) {
            button.setAttr('type', 'button');
        }

        this.statusEl = toolbar.createSpan({ cls: 'np-rf-analysis-status', text: 'Status: Ready' });
        this.statusEl.setAttr('aria-live', 'polite');

        this.containerEl
            .createEl('pre', { cls: 'np-rf-analysis-source' })
            .createEl('code', { text: this.source });

        this.consoleEl = this.containerEl.createEl('pre', { cls: 'np-rf-analysis-console' });
        this.consoleEl.hidden = true;
        this.outputEl = this.containerEl.createDiv({ cls: 'np-rf-analysis-output' });

        this.registerDomEvent(this.runButton, 'click', () => this.run());
        this.registerDomEvent(this.stopButton, 'click', () => this.stop());
        this.registerDomEvent(this.resetButton, 'click', () => this.reset());
        this.registerDomEvent(window, 'message', (event) => this.receive(event));
        this.setRunning(false);
        this.restoreSnapshot();
    }

    onunload(): void {
        this.destroyRunner();
        this.containerEl.empty();
    }

    private run(): void {
        this.destroyRunner();
        this.clearOutput();
        void this.snapshotStore.remove().catch((error) => this.reportSnapshotError('remove', error));
        this.token = createToken();
        this.setStatus('Starting…');
        this.setRunning(true);

        const frame = document.createElement('iframe');
        frame.className = 'np-rf-analysis-runner';
        frame.setAttribute('sandbox', 'allow-scripts');
        frame.setAttribute('title', 'Isolated nP JavaScript runner');
        frame.srcdoc = createRunnerDocument(workerSource);
        frame.addEventListener('load', () => {
            if (this.runnerFrame !== frame || !this.token) return;
            frame.contentWindow?.postMessage({
                channel: NPJS_CHANNEL,
                token: this.token,
                type: 'run',
                source: this.source
            }, '*');
        }, { once: true });
        this.runnerFrame = frame;
        this.containerEl.appendChild(frame);
    }

    private stop(): void {
        if (!this.runnerFrame) return;
        this.runnerFrame.contentWindow?.postMessage({ channel: NPJS_CHANNEL, type: 'stop' }, '*');
        this.destroyRunner();
        this.setStatus('Stopped');
        this.setRunning(false);
    }

    private reset(): void {
        this.destroyRunner();
        this.clearOutput();
        void this.snapshotStore.remove().catch((error) => this.reportSnapshotError('remove', error));
        this.setStatus('Ready');
        this.setRunning(false);
    }

    private receive(event: MessageEvent): void {
        if (!this.runnerFrame || event.source !== this.runnerFrame.contentWindow) return;
        if (!isRunnerEnvelope(event.data) || event.data.token !== this.token) return;
        if (!isNpJsWorkerMessage(event.data.payload)) return;

        const message = event.data.payload;
        if (message.type === 'render') {
            try {
                this.applySnapshotMessage(message);
                this.snapshotMessages.push(message);
            } catch (error) {
                this.finishWithError(error instanceof Error ? error.message : String(error));
            }
            return;
        }

        if (message.type === 'console') {
            this.applySnapshotMessage(message);
            this.snapshotMessages.push(message);
            return;
        }


        if (message.type === 'style') {
            this.applySnapshotMessage(message);
            this.snapshotMessages.push(message);
            return;
        }

        if (message.type === 'text') {
            this.applySnapshotMessage(message);
            this.snapshotMessages.push(message);
            return;
        }

        if (message.type === 'error') {
            this.finishWithError(message.message);
            return;
        }

        if (message.status === 'running') {
            this.setStatus('Running…');
        } else {
            this.destroyRunner();
            this.setStatus('Complete');
            this.setRunning(false);
            const snapshot = {
                version: 1 as const,
                savedAt: new Date().toISOString(),
                messages: this.snapshotMessages
            };
            void this.snapshotStore.save(snapshot)
                .then(() => {
                    if (this.snapshotMessages === snapshot.messages) {
                        this.setStatus('Complete (saved result)');
                    }
                })
                .catch((error) => this.reportSnapshotError('save', error));
        }
    }

    private applySnapshotMessage(message: NpJsSnapshotMessage): void {
        if (message.type === 'render') {
            this.render(message);
            return;
        }

        if (message.type === 'console') {
            this.consoleEl.hidden = false;
            this.consoleEl.appendText(`[${message.level}] ${message.text}\n`);
            return;
        }

        if (message.type === 'style') {
            const api = this.renderApis.get(message.mount);
            const method = api?.[message.method];
            if (typeof method === 'function') method(...message.args);
            return;
        }

        let textMount = this.textMounts.get(message.mount);
        if (!textMount) {
            textMount = this.outputEl.createEl('pre', { cls: 'np-rf-analysis-text-output' });
            this.textMounts.set(message.mount, textMount);
        }
        textMount.setText(message.text);
    }

    private restoreSnapshot(): void {
        const snapshot = this.snapshotStore.get();
        if (!snapshot) return;

        try {
            for (const message of snapshot.messages) this.applySnapshotMessage(message);
            this.snapshotMessages = snapshot.messages;
            this.setStatus('Complete (saved result)');
        } catch (error) {
            this.clearOutput();
            this.setStatus('Ready');
            void this.snapshotStore.remove().catch((removeError) => this.reportSnapshotError('remove', removeError));
            console.error('nPort RF Analysis could not restore a saved result.', error);
        }
    }

    private render(message: NpJsRenderMessage): void {
        let mount = this.mounts.get(message.mount);
        if (!mount) {
            mount = this.outputEl.createDiv({ cls: 'np-rf-analysis-render' });
            this.mounts.set(message.mount, mount);
        }

        const options = { ...message.options, mount };
        let api: unknown;
        if (message.renderer === 'lineChart') {
            api = nP.lineChart(options);
        } else if (message.renderer === 'smithChart') {
            api = nP.smithChart(options);
        } else {
            api = nP.lineTable(options);
        }
        if (typeof api === 'object' && api !== null && !Array.isArray(api)) {
            this.renderApis.set(message.mount, api as Record<string, unknown>);
        }
    }

    private finishWithError(message: string): void {
        this.destroyRunner();
        this.consoleEl.hidden = false;
        this.consoleEl.addClass('np-rf-analysis-error');
        this.consoleEl.setText(`nP JavaScript\n${message}`);
        this.setStatus('Error');
        this.setRunning(false);
    }

    private clearOutput(): void {
        this.snapshotMessages = [];
        this.mounts.clear();
        this.renderApis.clear();
        this.textMounts.clear();
        this.outputEl.empty();
        this.consoleEl.empty();
        this.consoleEl.removeClass('np-rf-analysis-error');
        this.consoleEl.hidden = true;
    }

    private destroyRunner(): void {
        this.runnerFrame?.remove();
        this.runnerFrame = null;
        this.token = null;
    }

    private setRunning(running: boolean): void {
        this.runButton.disabled = running;
        this.stopButton.disabled = !running;
    }

    private setStatus(status: string): void {
        this.statusEl.setText(`Status: ${status}`);
    }

    private reportSnapshotError(action: 'save' | 'remove', error: unknown): void {
        console.error(`nPort RF Analysis could not ${action} the saved result.`, error);
        if (action === 'save') this.setStatus('Complete (result not saved)');
    }
}
