// Modified: 2026-07-15
import { Plugin } from 'obsidian';
import { npJsPlainTextPasteExtension } from './npjs-paste';
import { NpJsRenderChild } from './npjs-render-child';
import {
    createSnapshotKey,
    parsePluginData,
    serializePluginData,
    type NpJsPluginData,
    type NpJsSnapshot
} from './npjs-snapshot';
import { NpRenderChild } from './render-child';

export default class NPortRfAnalysisPlugin extends Plugin {
    private pluginData: NpJsPluginData = { snapshots: {} };
    private saveQueue: Promise<void> = Promise.resolve();

    async onload(): Promise<void> {
        this.pluginData = parsePluginData(await this.loadData());
        this.registerEditorExtension(npJsPlainTextPasteExtension);

        this.registerMarkdownCodeBlockProcessor('np', (source, el, context) => {
            context.addChild(new NpRenderChild(el, source));
        });

        this.registerMarkdownCodeBlockProcessor('npjs', (source, el, context) => {
            const key = createSnapshotKey(context.sourcePath, source);
            context.addChild(new NpJsRenderChild(el, source, {
                get: () => this.pluginData.snapshots[key],
                save: (snapshot) => this.saveSnapshot(key, snapshot),
                remove: () => this.removeSnapshot(key)
            }));
        });
    }

    private saveSnapshot(key: string, snapshot: NpJsSnapshot): Promise<void> {
        this.pluginData.snapshots[key] = snapshot;
        return this.persistPluginData();
    }

    private removeSnapshot(key: string): Promise<void> {
        delete this.pluginData.snapshots[key];
        return this.persistPluginData();
    }

    private persistPluginData(): Promise<void> {
        const save = this.saveQueue
            .catch(() => undefined)
            .then(() => this.saveData(serializePluginData(this.pluginData)));
        this.saveQueue = save;
        return save;
    }
}
