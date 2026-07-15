// Modified: 2026-07-14
export const NPJS_CHANNEL = 'np-rf-analysis-npjs';

export type NpJsRenderer = 'lineChart' | 'lineTable' | 'smithChart';
export const NPJS_STYLE_METHODS = [
    'setTxtChartTitleStyle', 'setChartBackgroundStyle', 'setPlotBorderStyle',
    'setTxtXAxisTitleStyle', 'setTxtXAxisNumbersStyle', 'setXAxisLineStyle',
    'setXGridLineStyle', 'setTxtYAxisTitleStyle', 'setTxtYAxisNumbersStyle',
    'setYAxisLineStyle', 'setYGridLineStyle', 'setTxtChartLabelsStyle',
    'setTxtTableTitleStyle', 'setTableBackgroundStyle', 'setTableBorderStyle',
    'setTxtTableHeadersStyle', 'setTxtTableDataStyle', 'setUnitCircleStyle',
    'setSmithGridStyle'
] as const;
export type NpJsStyleMethod = typeof NPJS_STYLE_METHODS[number];

export interface NpJsRenderMessage {
    type: 'render';
    renderer: NpJsRenderer;
    mount: string;
    options: Record<string, unknown>;
}

export interface NpJsStatusMessage {
    type: 'status';
    status: 'running' | 'complete';
}

export interface NpJsConsoleMessage {
    type: 'console';
    level: 'log' | 'warn' | 'error';
    text: string;
}

export interface NpJsErrorMessage {
    type: 'error';
    message: string;
}

export interface NpJsStyleMessage {
    type: 'style';
    mount: string;
    method: NpJsStyleMethod;
    args: unknown[];
}

export interface NpJsTextMessage {
    type: 'text';
    mount: string;
    text: string;
}

export type NpJsWorkerMessage =
    | NpJsRenderMessage
    | NpJsStatusMessage
    | NpJsConsoleMessage
    | NpJsErrorMessage
    | NpJsStyleMessage
    | NpJsTextMessage;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeMountKey(value: unknown, index: number): string {
    if (typeof value !== 'string') return `output-${index}`;

    const trimmed = value.trim();
    if (trimmed.length === 0) return `output-${index}`;
    if (trimmed.startsWith('#') && trimmed.length > 1) return trimmed.slice(1);
    return trimmed;
}

export function isNpJsWorkerMessage(value: unknown): value is NpJsWorkerMessage {
    if (!isRecord(value) || typeof value.type !== 'string') return false;

    if (value.type === 'render') {
        return (value.renderer === 'lineChart' || value.renderer === 'lineTable' || value.renderer === 'smithChart')
            && typeof value.mount === 'string'
            && value.mount.length <= 256
            && isRecord(value.options);
    }

    if (value.type === 'status') {
        return value.status === 'running' || value.status === 'complete';
    }

    if (value.type === 'console') {
        return (value.level === 'log' || value.level === 'warn' || value.level === 'error')
            && typeof value.text === 'string'
            && value.text.length <= 10000;
    }

    if (value.type === 'error') {
        return typeof value.message === 'string' && value.message.length <= 20000;
    }

    if (value.type === 'style') {
        return typeof value.mount === 'string'
            && value.mount.length <= 256
            && typeof value.method === 'string'
            && NPJS_STYLE_METHODS.includes(value.method as NpJsStyleMethod)
            && Array.isArray(value.args)
            && value.args.length <= 10;
    }

    if (value.type === 'text') {
        return typeof value.mount === 'string'
            && value.mount.length <= 256
            && typeof value.text === 'string'
            && value.text.length <= 200000;
    }

    return false;
}
