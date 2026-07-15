// Modified: 2026-07-15
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type NPortRfAnalysisPlugin from './main';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function boundedNumber(value: string, minimum: number, maximum: number): number | null {
    const number = Number(value);
    if (!Number.isFinite(number) || number < minimum || number > maximum) return null;
    return number;
}

export class NPortRfAnalysisSettingTab extends PluginSettingTab {
    constructor(app: App, private readonly nportPlugin: NPortRfAnalysisPlugin) {
        super(app, nportPlugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'nPort RF Analysis' });

        new Setting(containerEl)
            .setName('Saved-result maximum age')
            .setDesc('Successful npjs results older than this many days are removed automatically.')
            .addText((text) => {
                text.inputEl.type = 'number';
                text.inputEl.min = '1';
                text.inputEl.max = '3650';
                text.setValue(String(this.nportPlugin.npjsSettings.maxAgeDays));
                text.onChange(async (value) => {
                    const days = boundedNumber(value, 1, 3650);
                    if (days === null) return;
                    await this.nportPlugin.updateSettings({ maxAgeDays: days });
                });
            });

        new Setting(containerEl)
            .setName('Saved-result storage limit')
            .setDesc('Oldest results are removed first when saved results exceed this many megabytes.')
            .addText((text) => {
                text.inputEl.type = 'number';
                text.inputEl.min = '1';
                text.inputEl.max = '1024';
                text.setValue(String(this.nportPlugin.npjsSettings.maxStorageMb));
                text.onChange(async (value) => {
                    const megabytes = boundedNumber(value, 1, 1024);
                    if (megabytes === null) return;
                    await this.nportPlugin.updateSettings({ maxStorageMb: megabytes });
                    refreshStorage();
                });
            });

        new Setting(containerEl)
            .setName('Clear saved results when Obsidian quits')
            .setDesc('Optional session-only mode. Quit cleanup is best effort and cannot run after a crash or forced shutdown.')
            .addToggle((toggle) => toggle
                .setValue(this.nportPlugin.npjsSettings.clearOnQuit)
                .onChange(async (value) => {
                    await this.nportPlugin.updateSettings({ clearOnQuit: value });
                }));

        const storageSetting = new Setting(containerEl)
            .setName('Saved-result storage')
            .addButton((button) => button
                .setButtonText('Clear saved results')
                .onClick(async () => {
                    const count = await this.nportPlugin.clearAllSnapshots();
                    refreshStorage();
                    new Notice(count === 1
                        ? 'Cleared 1 saved nPort RF Analysis result.'
                        : `Cleared ${count} saved nPort RF Analysis results.`);
                }));

        const refreshStorage = (): void => {
            const summary = this.nportPlugin.getSnapshotStorageSummary();
            storageSetting.setDesc(
                `${summary.count} saved result${summary.count === 1 ? '' : 's'}, approximately ${formatBytes(summary.bytes)}.`
            );
        };
        refreshStorage();
    }
}
