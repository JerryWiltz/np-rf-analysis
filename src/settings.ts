// Modified: 2026-08-18
import { App, normalizePath, Notice, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import type NPortRfAnalysisPlugin from './main';
import { DOCUMENTATION_URL, ISSUE_TRACKER_URL } from './help-content';
import {
    EDUCATIONAL_CONTENT_FILES,
    EDUCATIONAL_CONTENT_ROOT,
    EXAMPLES_FOLDER,
    LESSONS_FOLDER
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

function openExternalUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
}

async function ensureFolder(app: App, folderPath: string): Promise<void> {
    const segments = normalizePath(folderPath).split('/');
    for (let index = 1; index <= segments.length; index += 1) {
        const currentPath = segments.slice(0, index).join('/');
        const existing = app.vault.getAbstractFileByPath(currentPath);
        if (existing && !(existing instanceof TFolder)) {
            throw new Error(`${currentPath} is already in use by a file.`);
        }
        if (!existing) await app.vault.createFolder(currentPath);
    }
}

interface EducationalCollectionStatus {
    action: string;
    complete: boolean;
    description: string;
}

function educationalCollectionStatus(
    app: App,
    collectionFolder: string,
    pluralLabel: string
): EducationalCollectionStatus {
    const collectionPrefix = `${collectionFolder}/`;
    const relativePaths = Object.keys(EDUCATIONAL_CONTENT_FILES)
        .filter((relativePath) => relativePath.startsWith(collectionPrefix));
    const collectionPath = normalizePath(`${EDUCATIONAL_CONTENT_ROOT}/${collectionFolder}`);
    const collectionExists = app.vault.getAbstractFileByPath(collectionPath) instanceof TFolder;
    const installed = relativePaths.filter((relativePath) =>
        app.vault.getAbstractFileByPath(normalizePath(
            `${EDUCATIONAL_CONTENT_ROOT}/${relativePath}`
        )) instanceof TFile).length;
    const total = relativePaths.length;

    if (installed === total && total > 0) {
        return {
            action: 'Installed',
            complete: true,
            description: `${collectionPath} is complete: ${installed} of ${total} bundled files are installed. Close Settings and open this folder in Files.`
        };
    }
    if (collectionExists) {
        return {
            action: 'Add missing files',
            complete: false,
            description: `${collectionPath} is incomplete: ${installed} of ${total} bundled files are installed. Existing files will not be overwritten.`
        };
    }
    return {
        action: `Install ${pluralLabel}`,
        complete: false,
        description: `Install ${total} bundled files in ${collectionPath}. Existing files will not be overwritten.`
    };
}

async function installEducationalCollection(
    app: App,
    collectionFolder: string,
    label: string
): Promise<boolean> {
    const collectionPrefix = `${collectionFolder}/`;
    const files = Object.entries(EDUCATIONAL_CONTENT_FILES)
        .filter(([relativePath]) => relativePath.startsWith(collectionPrefix));
    const collectionPath = normalizePath(`${EDUCATIONAL_CONTENT_ROOT}/${collectionFolder}`);
    try {
        await ensureFolder(app, collectionPath);

        const folders = [...new Set(files.map(([relativePath]) => {
            const destination = normalizePath(`${EDUCATIONAL_CONTENT_ROOT}/${relativePath}`);
            return destination.slice(0, destination.lastIndexOf('/'));
        }))].sort((left, right) => left.split('/').length - right.split('/').length);
        for (const folder of folders) await ensureFolder(app, folder);

        let created = 0;
        for (const [relativePath, content] of files) {
            const destination = normalizePath(`${EDUCATIONAL_CONTENT_ROOT}/${relativePath}`);
            if (app.vault.getAbstractFileByPath(destination)) continue;
            await app.vault.create(destination, content);
            created += 1;
        }

        const result = created === 0
            ? `${collectionPath} is already complete.`
            : `Created ${created} ${label} ${created === 1 ? 'file' : 'files'} in ${collectionPath}.`;
        new Notice(result);
        return true;
    } catch (error) {
        console.error(`nPort RF Analysis could not install ${label}.`, error);
        new Notice(`Could not install ${label}.`);
        return false;
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
            .setName('Bundled content')
            .setHeading();

        const lessonsStatus = educationalCollectionStatus(
            this.app, LESSONS_FOLDER, 'lessons'
        );
        const lessonsSetting = new Setting(containerEl)
            .setName('Lessons')
            .setDesc(lessonsStatus.description)
            .addButton((button) => button
                .setButtonText(lessonsStatus.action)
                .setDisabled(lessonsStatus.complete)
                .onClick(async () => {
                    const installed = await installEducationalCollection(
                        this.app, LESSONS_FOLDER, 'lesson'
                    );
                    if (!installed) return;
                    const status = educationalCollectionStatus(
                        this.app, LESSONS_FOLDER, 'lessons'
                    );
                    lessonsSetting.setDesc(status.description);
                    button.setButtonText(status.action);
                    button.setDisabled(status.complete);
                }));

        const examplesStatus = educationalCollectionStatus(
            this.app, EXAMPLES_FOLDER, 'examples'
        );
        const examplesSetting = new Setting(containerEl)
            .setName('Examples')
            .setDesc(examplesStatus.description)
            .addButton((button) => button
                .setButtonText(examplesStatus.action)
                .setDisabled(examplesStatus.complete)
                .onClick(async () => {
                    const installed = await installEducationalCollection(
                        this.app, EXAMPLES_FOLDER, 'example'
                    );
                    if (!installed) return;
                    const status = educationalCollectionStatus(
                        this.app, EXAMPLES_FOLDER, 'examples'
                    );
                    examplesSetting.setDesc(status.description);
                    button.setButtonText(status.action);
                    button.setDisabled(status.complete);
                }));

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
