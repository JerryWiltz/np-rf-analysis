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

export interface NpJsSnapshotStore {
    get(): NpJsSnapshot | undefined;
    save(snapshot: NpJsSnapshot): Promise<void>;
    remove(): Promise<void>;
}

export interface NpJsPluginData {
    snapshots: Record<string, NpJsSnapshot>;
}

const SPECIAL_NUMBER_KEY = '__nportRfAnalysisNumber';

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

function hashSource(source: string): string {
    let first = 0x811c9dc5;
    let second = 0x9e3779b9;
    for (let index = 0; index < source.length; index += 1) {
        const code = source.charCodeAt(index);
        first = Math.imul(first ^ code, 0x01000193);
        second = Math.imul(second ^ code, 0x85ebca6b);
    }
    return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0).toString(16).padStart(8, '0')}`;
}

export function createSnapshotKey(sourcePath: string, source: string): string {
    return `${sourcePath}:${source.length}:${hashSource(source)}`;
}

export function isNpJsSnapshot(value: unknown): value is NpJsSnapshot {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
    const record = value as Record<string, unknown>;
    if (record.version !== 1 || typeof record.savedAt !== 'string' || !Array.isArray(record.messages)) return false;

    return record.messages.every((message) => {
        if (!isNpJsWorkerMessage(message)) return false;
        return message.type === 'render'
            || message.type === 'console'
            || message.type === 'style'
            || message.type === 'text';
    });
}

export function parsePluginData(value: unknown): NpJsPluginData {
    const snapshots: Record<string, NpJsSnapshot> = {};
    const decoded = decodeValue(value);
    if (typeof decoded !== 'object' || decoded === null || Array.isArray(decoded)) return { snapshots };

    const candidate = (decoded as Record<string, unknown>).snapshots;
    if (typeof candidate !== 'object' || candidate === null || Array.isArray(candidate)) return { snapshots };

    for (const [key, snapshot] of Object.entries(candidate)) {
        if (isNpJsSnapshot(snapshot)) snapshots[key] = snapshot;
    }
    return { snapshots };
}

export function serializePluginData(data: NpJsPluginData): unknown {
    return encodeValue(data);
}
