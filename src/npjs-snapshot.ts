// Modified: 2026-07-15
import {
    isNpJsWorkerMessage,
    type NpJsConsoleMessage,
    type NpJsRenderMessage,
    type NpJsStyleMessage,
    type NpJsTextMessage
} from './npjs-protocol';

export type NpJsSnapshotMessage =
    | NpJsRenderMessage
    | NpJsConsoleMessage
    | NpJsStyleMessage
    | NpJsTextMessage;

export interface NpJsSnapshot {
    version: 1;
    savedAt: string;
    messages: NpJsSnapshotMessage[];
}

export interface NpJsSnapshotIdentity {
    sourcePath: string;
    sourceHash: string;
    occurrence: number;
}

export interface NpJsSnapshotEntry {
    version: 2;
    sourcePath: string;
    sourceHash: string;
    occurrence: number;
    savedAt: string;
    messages: NpJsSnapshotMessage[];
}

export interface NpJsSnapshotStore {
    get(): NpJsSnapshot | undefined;
    save(snapshot: NpJsSnapshot): Promise<void>;
    remove(): Promise<void>;
}

export interface NpJsSettings {
    maxAgeDays: number;
    maxStorageMb: number;
    clearOnQuit: boolean;
}

export interface NpJsPluginData {
    settings: NpJsSettings;
    snapshots: Record<string, NpJsSnapshotEntry>;
}

export interface NpJsFenceBlock extends NpJsSnapshotIdentity {
    source: string;
    lineStart: number;
    lineEnd: number;
}

export const DEFAULT_NPJS_SETTINGS: Readonly<NpJsSettings> = Object.freeze({
    maxAgeDays: 30,
    maxStorageMb: 25,
    clearOnQuit: false
});

const SPECIAL_NUMBER_KEY = '__nportRfAnalysisNumber';
const LEGACY_KEY_PATTERN = /^(.*):(\d+):([0-9a-f]{16})$/;

interface Fence {
    marker: '`' | '~';
    length: number;
    npjs: boolean;
    lineStart: number;
    content: string[];
}

function encodeValue(value: unknown): unknown {
    if (typeof value === 'number' && !Number.isFinite(value)) {
        return { [SPECIAL_NUMBER_KEY]: String(value) };
    }
    if (Array.isArray(value)) return value.map(encodeValue);
    if (typeof value !== 'object' || value === null) return value;

    return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [key, encodeValue(child)])
    );
}

function decodeValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(decodeValue);
    if (typeof value !== 'object' || value === null) return value;

    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 1 && keys[0] === SPECIAL_NUMBER_KEY) {
        if (record[SPECIAL_NUMBER_KEY] === 'Infinity') return Infinity;
        if (record[SPECIAL_NUMBER_KEY] === '-Infinity') return -Infinity;
        if (record[SPECIAL_NUMBER_KEY] === 'NaN') return NaN;
    }

    return Object.fromEntries(
        Object.entries(record).map(([key, child]) => [key, decodeValue(child)])
    );
}

function normalizedSource(source: string): string {
    const normalized = source.replace(/\r\n?/g, '\n');
    return normalized.endsWith('\n') ? normalized.slice(0, -1) : normalized;
}

export function hashSnapshotSource(source: string): string {
    const normalized = normalizedSource(source);
    let first = 0x811c9dc5;
    let second = 0x9e3779b9;
    for (let index = 0; index < normalized.length; index += 1) {
        const code = normalized.charCodeAt(index);
        first = Math.imul(first ^ code, 0x01000193);
        second = Math.imul(second ^ code, 0x85ebca6b);
    }
    return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
}

export function createSnapshotKeyFromIdentity(identity: NpJsSnapshotIdentity): string {
    return JSON.stringify([identity.sourcePath, identity.sourceHash, identity.occurrence]);
}

export function createSnapshotKey(sourcePath: string, source: string, occurrence = 0): string {
    return createSnapshotKeyFromIdentity({
        sourcePath,
        sourceHash: hashSnapshotSource(source),
        occurrence
    });
}

function openingFence(line: string, lineStart: number): Fence | null {
    const match = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*([^ \t]*)/.exec(line);
    if (!match?.[1]) return null;
    return {
        marker: match[1][0] as '`' | '~',
        length: match[1].length,
        npjs: (match[2] ?? '').toLowerCase() === 'npjs',
        lineStart,
        content: []
    };
}

function closesFence(line: string, fence: Fence): boolean {
    const marker = fence.marker.replace('~', '\\~');
    return new RegExp(`^[ \\t]{0,3}${marker}{${fence.length},}[ \\t]*$`).test(line);
}

export function findNpJsFenceBlocks(markdown: string, sourcePath: string): NpJsFenceBlock[] {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const blocks: NpJsFenceBlock[] = [];
    const occurrences = new Map<string, number>();
    let fence: Fence | null = null;

    const finishFence = (lineEnd: number): void => {
        if (!fence?.npjs) return;
        const source = fence.content.join('\n');
        const sourceHash = hashSnapshotSource(source);
        const occurrence = occurrences.get(sourceHash) ?? 0;
        occurrences.set(sourceHash, occurrence + 1);
        blocks.push({
            sourcePath,
            sourceHash,
            occurrence,
            source,
            lineStart: fence.lineStart,
            lineEnd
        });
    };

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
        const line = lines[lineIndex] ?? '';
        if (fence) {
            if (closesFence(line, fence)) {
                finishFence(lineIndex);
                fence = null;
            } else if (fence.npjs) {
                fence.content.push(line);
            }
        } else {
            fence = openingFence(line, lineIndex);
        }
    }

    if (fence) finishFence(lines.length - 1);
    return blocks;
}

export function resolveSnapshotIdentity(
    sourcePath: string,
    source: string,
    markdown: string,
    lineStart?: number
): NpJsSnapshotIdentity {
    const sourceHash = hashSnapshotSource(source);
    const matches = findNpJsFenceBlocks(markdown, sourcePath)
        .filter((block) => block.sourceHash === sourceHash);
    const sectionMatch = lineStart === undefined
        ? undefined
        : matches.find((block) => lineStart >= block.lineStart && lineStart <= block.lineEnd);
    return sectionMatch ?? matches[0] ?? { sourcePath, sourceHash, occurrence: 0 };
}

export function isNpJsSnapshot(value: unknown): value is NpJsSnapshot {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    if (record.version !== 1 || typeof record.savedAt !== 'string' || !Array.isArray(record.messages)) return false;
    return hasValidSnapshotMessages(record.messages);
}

export function isNpJsSnapshotEntry(value: unknown): value is NpJsSnapshotEntry {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    return record.version === 2
        && typeof record.sourcePath === 'string'
        && typeof record.sourceHash === 'string'
        && typeof record.occurrence === 'number'
        && Number.isInteger(record.occurrence)
        && record.occurrence >= 0
        && typeof record.savedAt === 'string'
        && Array.isArray(record.messages)
        && hasValidSnapshotMessages(record.messages);
}

function hasValidSnapshotMessages(messages: unknown[]): boolean {
    return messages.every((message) => {
        if (!isNpJsWorkerMessage(message)) return false;
        return message.type === 'render'
            || message.type === 'console'
            || message.type === 'style'
            || message.type === 'text';
    });
}

function numberSetting(value: unknown, fallback: number, minimum: number, maximum: number): number {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.min(maximum, Math.max(minimum, value))
        : fallback;
}

function parseSettings(value: unknown): NpJsSettings {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { ...DEFAULT_NPJS_SETTINGS };
    }
    const record = value as Record<string, unknown>;
    return {
        maxAgeDays: numberSetting(record.maxAgeDays, DEFAULT_NPJS_SETTINGS.maxAgeDays, 1, 3650),
        maxStorageMb: numberSetting(record.maxStorageMb, DEFAULT_NPJS_SETTINGS.maxStorageMb, 1, 1024),
        clearOnQuit: typeof record.clearOnQuit === 'boolean'
            ? record.clearOnQuit
            : DEFAULT_NPJS_SETTINGS.clearOnQuit
    };
}

function legacyEntry(key: string, value: unknown): NpJsSnapshotEntry | null {
    if (!isNpJsSnapshot(value)) return null;
    const match = LEGACY_KEY_PATTERN.exec(key);
    if (!match?.[1] || !match[3]) return null;
    return {
        version: 2,
        sourcePath: match[1],
        sourceHash: match[3],
        occurrence: 0,
        savedAt: value.savedAt,
        messages: value.messages
    };
}

export function parsePluginData(value: unknown): NpJsPluginData {
    const decoded = decodeValue(value);
    if (typeof decoded !== 'object' || decoded === null || Array.isArray(decoded)) {
        return { settings: { ...DEFAULT_NPJS_SETTINGS }, snapshots: {} };
    }

    const record = decoded as Record<string, unknown>;
    const settings = parseSettings(record.settings);
    const snapshots: Record<string, NpJsSnapshotEntry> = {};
    const candidate = record.snapshots;
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) {
        return { settings, snapshots };
    }

    for (const [key, snapshot] of Object.entries(candidate)) {
        const entry = isNpJsSnapshotEntry(snapshot) ? snapshot : legacyEntry(key, snapshot);
        if (!entry) continue;
        snapshots[createSnapshotKeyFromIdentity(entry)] = entry;
    }
    return { settings, snapshots };
}

export function serializePluginData(data: NpJsPluginData): unknown {
    return encodeValue(data);
}

export function snapshotFromEntry(entry: NpJsSnapshotEntry | undefined): NpJsSnapshot | undefined {
    if (!entry) return undefined;
    return { version: 1, savedAt: entry.savedAt, messages: entry.messages };
}

export function entryFromSnapshot(identity: NpJsSnapshotIdentity, snapshot: NpJsSnapshot): NpJsSnapshotEntry {
    return {
        version: 2,
        ...identity,
        savedAt: snapshot.savedAt,
        messages: snapshot.messages
    };
}

export function pruneSnapshotsForMarkdown(data: NpJsPluginData, sourcePath: string, markdown: string): number {
    const validKeys = new Set(
        findNpJsFenceBlocks(markdown, sourcePath).map(createSnapshotKeyFromIdentity)
    );
    let removed = 0;
    for (const [key, snapshot] of Object.entries(data.snapshots)) {
        if (snapshot.sourcePath === sourcePath && !validKeys.has(key)) {
            delete data.snapshots[key];
            removed += 1;
        }
    }
    return removed;
}

export function removeSnapshotsForPath(data: NpJsPluginData, sourcePath: string): number {
    let removed = 0;
    for (const [key, snapshot] of Object.entries(data.snapshots)) {
        if (snapshot.sourcePath === sourcePath) {
            delete data.snapshots[key];
            removed += 1;
        }
    }
    return removed;
}

export function renameSnapshotsForPath(data: NpJsPluginData, oldPath: string, newPath: string): number {
    const moving = Object.entries(data.snapshots)
        .filter(([, snapshot]) => snapshot.sourcePath === oldPath);
    for (const [key] of moving) delete data.snapshots[key];

    for (const [, snapshot] of moving) {
        const renamed = { ...snapshot, sourcePath: newPath };
        const newKey = createSnapshotKeyFromIdentity(renamed);
        const existing = data.snapshots[newKey];
        if (!existing || existing.savedAt < renamed.savedAt) data.snapshots[newKey] = renamed;
    }
    return moving.length;
}

function encodedBytes(value: unknown): number {
    return new TextEncoder().encode(JSON.stringify(encodeValue(value))).byteLength;
}

export function snapshotStorageBytes(snapshots: Record<string, NpJsSnapshotEntry>): number {
    return Object.entries(snapshots)
        .reduce((total, [key, snapshot]) => total + encodedBytes({ [key]: snapshot }), 0);
}

export function applySnapshotLimits(data: NpJsPluginData, now = Date.now()): string[] {
    const removed: string[] = [];
    const oldestAllowed = now - data.settings.maxAgeDays * 24 * 60 * 60 * 1000;

    for (const [key, snapshot] of Object.entries(data.snapshots)) {
        const savedAt = Date.parse(snapshot.savedAt);
        if (!Number.isFinite(savedAt) || savedAt < oldestAllowed) {
            delete data.snapshots[key];
            removed.push(key);
        }
    }

    const maximumBytes = data.settings.maxStorageMb * 1024 * 1024;
    const oldestFirst = Object.entries(data.snapshots)
        .sort(([, left], [, right]) => Date.parse(left.savedAt) - Date.parse(right.savedAt));
    let bytes = snapshotStorageBytes(data.snapshots);
    for (const [key] of oldestFirst) {
        if (bytes <= maximumBytes) break;
        delete data.snapshots[key];
        removed.push(key);
        bytes = snapshotStorageBytes(data.snapshots);
    }
    return removed;
}
