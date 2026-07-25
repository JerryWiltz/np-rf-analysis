// Modified: 2026-07-25
import { App, normalizePath, Notice, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import type NPortRfAnalysisPlugin from './main';
import {
    DOCUMENTATION_URL,
    ISSUE_TRACKER_URL,
    NP_EXAMPLE,
    NPJS_EXAMPLE
} from './help-content';
import {
    LEARNING_GUIDE_ASSETS,
    LEARNING_GUIDE_FOLDER,
    LEARNING_GUIDE_LESSONS,
    LEARNING_GUIDE_START
} from './learning-guide';

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

async function copyExample(source: string, label: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(source);
        new Notice(`Copied ${label} example.`);
    } catch (error) {
        console.error(`nPort RF Analysis could not copy the ${label} example.`, error);
        new Notice(`Could not copy the ${label} example.`);
    }
}

function openExternalUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
}

async function createLearningGuide(app: App): Promise<void> {
    const folderPath = normalizePath(LEARNING_GUIDE_FOLDER);
    const existingFolder = app.vault.getAbstractFileByPath(folderPath);
    if (existingFolder && !(existingFolder instanceof TFolder)) {
        new Notice(`Could not create ${folderPath} because that path is already in use.`);
        return;
    }
    const imagesPath = normalizePath(`${folderPath}/Images`);
    const existingImages = app.vault.getAbstractFileByPath(imagesPath);
    if (existingImages && !(existingImages instanceof TFolder)) {
        new Notice(`Could not create ${imagesPath} because that path is already in use.`);
        return;
    }

    try {
        if (!existingFolder) await app.vault.createFolder(folderPath);
        if (!existingImages) await app.vault.createFolder(imagesPath);

        let created = 0;
        for (const lesson of LEARNING_GUIDE_LESSONS) {
            const lessonPath = normalizePath(`${folderPath}/${lesson.path}`);
            if (app.vault.getAbstractFileByPath(lessonPath)) continue;
            await app.vault.create(lessonPath, lesson.content);
            created += 1;
        }
        for (const [filename, content] of Object.entries(LEARNING_GUIDE_ASSETS)) {
            const imagePath = normalizePath(`${imagesPath}/${filename}`);
            if (app.vault.getAbstractFileByPath(imagePath)) continue;
            await app.vault.create(imagePath, content);
            created += 1;
        }

        const startPath = normalizePath(`${folderPath}/${LEARNING_GUIDE_START}`);
        const start = app.vault.getAbstractFileByPath(startPath);
        if (!(start instanceof TFile)) {
            new Notice(`Could not open ${startPath} because that path is already in use.`);
            return;
        }
        await app.workspace.getLeaf(false).openFile(start);
        const result = created === 0
            ? `Opened the existing ${folderPath} learning guide.`
            : `Created ${created} learning guide ${created === 1 ? 'file' : 'files'} in ${folderPath}.`;
        new Notice(`${result} Close settings to view it.`);
    } catch (error) {
        console.error('nPort RF Analysis could not create the learning guide.', error);
        new Notice('Could not create the learning guide.');
    }
}

export class NPortRfAnalysisSettingTab extends PluginSettingTab {
    constructor(app: App, private readonly nportPlugin: NPortRfAnalysisPlugin) {
        super(app, nportPlugin);
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName('Help and documentation')
            .setHeading();

        const quickStart = createFragment();
        quickStart.createDiv({
            text: 'Use an npjs code block to run nP JavaScript after selecting Run.'
        });
        quickStart.createDiv({
            text: 'Use an np code block for validated JSON that renders automatically in Reading view.'
        });
        new Setting(containerEl)
            .setName('Quick start')
            .setDesc(quickStart);

        new Setting(containerEl)
            .setName('JavaScript example')
            .setDesc('Copy a complete npjs example to paste into a Markdown note.')
            .addButton((button) => button
                .setButtonText('Copy npjs example')
                .onClick(() => copyExample(NPJS_EXAMPLE, 'npjs')));

        new Setting(containerEl)
            .setName('Declarative JSON example')
            .setDesc('Copy a complete np example to paste into a Markdown note.')
            .addButton((button) => button
                .setButtonText('Copy np example')
                .onClick(() => copyExample(NP_EXAMPLE, 'np')));

        new Setting(containerEl)
            .setName('Learning guide')
            .setDesc(`Create ${LEARNING_GUIDE_FOLDER} with self-contained lessons, examples, and diagrams, then open the first lesson. Existing files are preserved.`)
            .addButton((button) => button
                .setButtonText('Create learning guide')
                .onClick(() => createLearningGuide(this.app)));

        new Setting(containerEl)
            .setName('Documentation')
            .setDesc('Read the complete usage and security documentation.')
            .addButton((button) => button
                .setButtonText('Open documentation')
                .onClick(() => openExternalUrl(DOCUMENTATION_URL)));

        new Setting(containerEl)
            .setName('Support and feedback')
            .setDesc('Ask a question, report a bug, or request a feature without sharing sensitive vault contents.')
            .addButton((button) => button
                .setButtonText('Report an issue')
                .onClick(() => openExternalUrl(ISSUE_TRACKER_URL)));

        new Setting(containerEl)
            .setName('Saved results')
            .setHeading();

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
