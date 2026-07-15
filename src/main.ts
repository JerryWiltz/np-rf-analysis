// Modified: 2026-07-15
import { Notice, Plugin, TFile } from 'obsidian';
import { npJsPlainTextPasteExtension } from './npjs-paste';
import { NpJsRenderChild } from './npjs-render-child';
import {
    DEFAULT_NPJS_SETTINGS,
    applySnapshotLimits,
    createSnapshotKeyFromIdentity,
    entryFromSnapshot,
    parsePluginData,
    pruneSnapshotsForMarkdown,
    removeSnapshotsForPath,
    renameSnapshotsForPath,
    resolveSnapshotIdentity,
    serializePluginData,
    snapshotFromEntry,
    snapshotStorageBytes,
    type NpJsPluginData,
    type NpJsSettings,
    type NpJsSnapshot,
    type NpJsSnapshotIdentity
} from './npjs-snapshot';
import { NPortRfAnalysisSettingTab } from './settings';
import { NpRenderChild } from './render-child';

const PRUNE_DELAY_MS = 750;
const LIMIT_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export interface SnapshotStorageSummary {
    count: number;
    bytes: number;
}

export default class NPortRfAnalysisPlugin extends Plugin {
    private pluginData: NpJsPluginData = {
        settings: { ...DEFAULT_NPJS_SETTINGS },
        snapshots: {}
    };
    private saveQueue: Promise<void> = Promise.resolve();
    private readonly pruneTimers = new Map<string, number>();

    get npjsSettings(): Readonly<NpJsSettings> {
        return this.pluginData.settings;
    }

    async onload(): Promise<void> {
        this.pluginData = parsePluginData(await this.loadData());

        this.registerEditorExtension(npJsPlainTextPasteExtension);
        this.addSettingTab(new NPortRfAnalysisSettingTab(this.app, this));
        this.addCommand({
            id: 'clear-saved-results',
            name: 'Clear saved results',
            callback: async () => {
                const count = await this.clearAllSnapshots();
                new Notice(count === 1
                    ? 'Cleared 1 saved nPort RF Analysis result.'
                    : `Cleared ${count} saved nPort RF Analysis results.`);
            }
        });

        this.registerMarkdownCodeBlockProcessor('np', (source, el, context) => {
            context.addChild(new NpRenderChild(el, source));
        });

        this.registerMarkdownCodeBlockProcessor('npjs', async (source, el, context) => {
            const lineStart = context.getSectionInfo(el)?.lineStart;
            const identity = await this.resolveIdentity(context.sourcePath, source, lineStart);
            const key = createSnapshotKeyFromIdentity(identity);
            context.addChild(new NpJsRenderChild(el, source, {
                get: () => snapshotFromEntry(this.pluginData.snapshots[key]),
                save: (snapshot) => this.saveSnapshot(identity, snapshot),
                remove: () => this.removeSnapshot(key)
            }));
        });

        this.registerEvent(this.app.vault.on('modify', (file) => {
            if (file instanceof TFile && file.extension.toLowerCase() === 'md') {
                this.schedulePrune(file);
            }
        }));
        this.registerEvent(this.app.vault.on('delete', (file) => {
            this.cancelScheduledPrune(file.path);
            void this.removeSnapshotsForFile(file.path);
        }));
        this.registerEvent(this.app.vault.on('rename', (file, oldPath) => {
            this.cancelScheduledPrune(oldPath);
            void this.renameSnapshots(oldPath, file.path).then(() => {
                if (file instanceof TFile && file.extension.toLowerCase() === 'md') {
                    this.schedulePrune(file);
                }
            });
        }));
        this.registerEvent(this.app.workspace.on('quit', (tasks) => {
            if (this.pluginData.settings.clearOnQuit) {
                tasks.addPromise(this.clearAllSnapshots().then(() => undefined));
            }
        }));

        this.registerInterval(window.setInterval(() => {
            void this.enforceSnapshotLimits();
        }, LIMIT_CHECK_INTERVAL_MS));
        this.app.workspace.onLayoutReady(() => {
            void this.cleanupStoredSnapshots();
        });
        this.register(() => {
            for (const timer of this.pruneTimers.values()) window.clearTimeout(timer);
            this.pruneTimers.clear();
        });
    }

    getSnapshotStorageSummary(): SnapshotStorageSummary {
        return {
            count: Object.keys(this.pluginData.snapshots).length,
            bytes: snapshotStorageBytes(this.pluginData.snapshots)
        };
    }

    updateSettings(settings: Partial<NpJsSettings>): Promise<void> {
        return this.mutatePluginData(() => {
            this.pluginData.settings = { ...this.pluginData.settings, ...settings };
            applySnapshotLimits(this.pluginData);
            return true;
        });
    }

    async clearAllSnapshots(): Promise<number> {
        let count = 0;
        await this.mutatePluginData(() => {
            count = Object.keys(this.pluginData.snapshots).length;
            if (count === 0) return false;
            this.pluginData.snapshots = {};
            return true;
        });
        return count;
    }

    private async resolveIdentity(
        sourcePath: string,
        source: string,
        lineStart?: number
    ): Promise<NpJsSnapshotIdentity> {
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(file instanceof TFile)) {
            return resolveSnapshotIdentity(sourcePath, source, source, lineStart);
        }
        try {
            const markdown = await this.app.vault.cachedRead(file);
            return resolveSnapshotIdentity(sourcePath, source, markdown, lineStart);
        } catch (error) {
            console.error('nPort RF Analysis could not resolve the npjs block identity.', error);
            return resolveSnapshotIdentity(sourcePath, source, source, lineStart);
        }
    }

    private saveSnapshot(identity: NpJsSnapshotIdentity, snapshot: NpJsSnapshot): Promise<void> {
        const key = createSnapshotKeyFromIdentity(identity);
        return this.mutatePluginData(() => {
            this.pluginData.snapshots[key] = entryFromSnapshot(identity, snapshot);
            applySnapshotLimits(this.pluginData);
            return true;
        }).then(() => {
            if (!this.pluginData.snapshots[key]) {
                throw new Error('The result exceeds the configured saved-result storage limit.');
            }
        });
    }

    private removeSnapshot(key: string): Promise<void> {
        return this.mutatePluginData(() => {
            if (!this.pluginData.snapshots[key]) return false;
            delete this.pluginData.snapshots[key];
            return true;
        });
    }

    private removeSnapshotsForFile(sourcePath: string): Promise<void> {
        return this.mutatePluginData(() => removeSnapshotsForPath(this.pluginData, sourcePath) > 0);
    }

    private renameSnapshots(oldPath: string, newPath: string): Promise<void> {
        return this.mutatePluginData(() => renameSnapshotsForPath(this.pluginData, oldPath, newPath) > 0);
    }

    private schedulePrune(file: TFile): void {
        this.cancelScheduledPrune(file.path);
        const timer = window.setTimeout(() => {
            this.pruneTimers.delete(file.path);
            void this.pruneMarkdownFile(file);
        }, PRUNE_DELAY_MS);
        this.pruneTimers.set(file.path, timer);
    }

    private cancelScheduledPrune(sourcePath: string): void {
        const timer = this.pruneTimers.get(sourcePath);
        if (timer !== undefined) window.clearTimeout(timer);
        this.pruneTimers.delete(sourcePath);
    }

    private async pruneMarkdownFile(file: TFile): Promise<void> {
        try {
            const markdown = await this.app.vault.cachedRead(file);
            await this.mutatePluginData(() =>
                pruneSnapshotsForMarkdown(this.pluginData, file.path, markdown) > 0
            );
        } catch (error) {
            console.error(`nPort RF Analysis could not prune saved results for ${file.path}.`, error);
        }
    }

    private enforceSnapshotLimits(): Promise<void> {
        return this.mutatePluginData(() => applySnapshotLimits(this.pluginData).length > 0);
    }

    private async cleanupStoredSnapshots(): Promise<void> {
        const sourcePaths = new Set(
            Object.values(this.pluginData.snapshots).map((snapshot) => snapshot.sourcePath)
        );
        const markdownByPath = new Map<string, string | null>();
        for (const sourcePath of sourcePaths) {
            const file = this.app.vault.getAbstractFileByPath(sourcePath);
            if (!(file instanceof TFile) || file.extension.toLowerCase() !== 'md') {
                markdownByPath.set(sourcePath, null);
                continue;
            }
            try {
                markdownByPath.set(sourcePath, await this.app.vault.cachedRead(file));
            } catch {
                markdownByPath.set(sourcePath, null);
            }
        }

        await this.mutatePluginData(() => {
            for (const [sourcePath, markdown] of markdownByPath) {
                if (markdown === null) removeSnapshotsForPath(this.pluginData, sourcePath);
                else pruneSnapshotsForMarkdown(this.pluginData, sourcePath, markdown);
            }
            applySnapshotLimits(this.pluginData);
            return true;
        });
    }

    private mutatePluginData(mutation: () => boolean): Promise<void> {
        const operation = this.saveQueue
            .catch(() => undefined)
            .then(async () => {
                if (!mutation()) return;
                await this.saveData(serializePluginData(this.pluginData));
            });
        this.saveQueue = operation;
        return operation;
    }
}
