// Modified: 2026-07-13
export const COMPONENT_TYPES = [
    'R', 'L', 'C',
    'seR', 'seL', 'seC',
    'paR', 'paL', 'paC',
    'Tee', 'Open', 'Short', 'Load', 'Tlin'
] as const;

export type ComponentType = typeof COMPONENT_TYPES[number];
export type ViewType = 'line' | 'smith' | 'table';

export interface FrequencySpec {
    start: number;
    stop: number;
    points: number;
    referenceImpedance?: number;
    temperature?: number;
}

export interface ComponentSpec {
    type: ComponentType;
    value?: number;
    args?: number[];
}

export interface ViewSpec {
    type: ViewType;
    title?: string;
    metricPrefix?: string;
    width?: number;
    height?: number;
    xRange?: [number, number];
    yRange?: [number, number];
}

export interface AnalysisSpec {
    frequencies: FrequencySpec;
    components: Record<string, ComponentSpec>;
    nodal: Array<Array<string | number>>;
    output: string[];
    view: ViewSpec;
}

const outputPattern = /^s[1-9][1-9](?:mag|dB|ang|Re|Im)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, label: string): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new Error(`${label} must be a finite number.`);
    }
    return value;
}

function optionalNumber(value: unknown, label: string): number | undefined {
    return value === undefined ? undefined : finiteNumber(value, label);
}

function numberPair(value: unknown, label: string): [number, number] | undefined {
    if (value === undefined) return undefined;
    if (!Array.isArray(value) || value.length !== 2) {
        throw new Error(`${label} must contain exactly two numbers.`);
    }
    return [finiteNumber(value[0], `${label}[0]`), finiteNumber(value[1], `${label}[1]`)];
}

export function parseAnalysisSpec(source: string): AnalysisSpec {
    let input: unknown;
    try {
        input = JSON.parse(source);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`The np block is not valid JSON: ${message}`);
    }

    if (!isRecord(input)) throw new Error('The np block must contain a JSON object.');

    const rawFrequencies = input.frequencies;
    if (!isRecord(rawFrequencies)) throw new Error('frequencies must be an object.');

    const start = finiteNumber(rawFrequencies.start, 'frequencies.start');
    const stop = finiteNumber(rawFrequencies.stop, 'frequencies.stop');
    const points = finiteNumber(rawFrequencies.points, 'frequencies.points');
    const referenceImpedance = optionalNumber(rawFrequencies.referenceImpedance, 'frequencies.referenceImpedance');
    const temperature = optionalNumber(rawFrequencies.temperature, 'frequencies.temperature');

    if (start < 0 || stop < start) throw new Error('Frequency range must satisfy 0 <= start <= stop.');
    if (!Number.isInteger(points) || points < 1 || points > 10001) {
        throw new Error('frequencies.points must be an integer from 1 through 10001.');
    }
    if (referenceImpedance !== undefined && referenceImpedance <= 0) {
        throw new Error('frequencies.referenceImpedance must be positive.');
    }
    if (temperature !== undefined && temperature <= 0) {
        throw new Error('frequencies.temperature must be positive Kelvin.');
    }

    const rawComponents = input.components;
    if (!isRecord(rawComponents) || Object.keys(rawComponents).length === 0) {
        throw new Error('components must define at least one component.');
    }

    const components: Record<string, ComponentSpec> = {};
    for (const [name, rawComponent] of Object.entries(rawComponents)) {
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(name)) {
            throw new Error(`Invalid component name: ${name}`);
        }
        if (!isRecord(rawComponent) || typeof rawComponent.type !== 'string') {
            throw new Error(`Component ${name} must have a type.`);
        }
        if (!COMPONENT_TYPES.includes(rawComponent.type as ComponentType)) {
            throw new Error(`Unsupported component type for ${name}: ${rawComponent.type}`);
        }

        const value = optionalNumber(rawComponent.value, `components.${name}.value`);
        let args: number[] | undefined;
        if (rawComponent.args !== undefined) {
            if (!Array.isArray(rawComponent.args)) throw new Error(`components.${name}.args must be an array.`);
            args = rawComponent.args.map((argument, index) => finiteNumber(argument, `components.${name}.args[${index}]`));
        }
        if (value !== undefined && args !== undefined) {
            throw new Error(`Component ${name} must use value or args, not both.`);
        }
        components[name] = { type: rawComponent.type as ComponentType, value, args };
    }

    if (!Array.isArray(input.nodal) || input.nodal.length < 2) {
        throw new Error('nodal must contain component connections and an output connection.');
    }
    const nodal = input.nodal.map((connection, connectionIndex) => {
        if (!Array.isArray(connection) || connection.length < 2) {
            throw new Error(`nodal[${connectionIndex}] must be a connection array.`);
        }
        return connection.map((item, itemIndex) => {
            if (typeof item !== 'string' && (typeof item !== 'number' || !Number.isInteger(item))) {
                throw new Error(`nodal[${connectionIndex}][${itemIndex}] must be a name or integer node.`);
            }
            return item;
        });
    });
    const finalConnection = nodal[nodal.length - 1];
    if (!finalConnection || finalConnection[0] !== 'out') {
        throw new Error('The last nodal connection must begin with "out".');
    }

    if (!Array.isArray(input.output) || input.output.length === 0) {
        throw new Error('output must contain at least one S-parameter selector.');
    }
    const output = input.output.map((selector, index) => {
        if (typeof selector !== 'string' || !outputPattern.test(selector)) {
            throw new Error(`Invalid output selector at output[${index}]: ${String(selector)}`);
        }
        return selector;
    });

    const rawView = input.view;
    if (!isRecord(rawView)) throw new Error('view must be an object.');
    const type = rawView.type;
    if (type !== 'line' && type !== 'smith' && type !== 'table') {
        throw new Error('view.type must be "line", "smith", or "table".');
    }

    const title = rawView.title;
    const metricPrefix = rawView.metricPrefix;
    if (title !== undefined && typeof title !== 'string') throw new Error('view.title must be text.');
    if (metricPrefix !== undefined && typeof metricPrefix !== 'string') throw new Error('view.metricPrefix must be text.');

    return {
        frequencies: { start, stop, points, referenceImpedance, temperature },
        components,
        nodal,
        output,
        view: {
            type,
            title,
            metricPrefix,
            width: optionalNumber(rawView.width, 'view.width'),
            height: optionalNumber(rawView.height, 'view.height'),
            xRange: numberPair(rawView.xRange, 'view.xRange'),
            yRange: numberPair(rawView.yRange, 'view.yRange')
        }
    };
}
