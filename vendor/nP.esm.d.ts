// Modified: 2026-11-09
export interface NPort {
    out(...outputs: string[]): Array<Array<string | number>>;
}

export interface GlobalContext {
    fList: number[];
    tList: number[];
    twoTone: unknown;
    Ro: number;
    Temp: number;
    fGen(start: number, stop: number, points: number): number[];
    tGen(start: number, stop: number, points: number): number[];
}

export interface GlobalSettings extends GlobalContext {
    (): GlobalContext;
    (context: GlobalContext): GlobalContext;
}

export const global: GlobalSettings;
export const version: string;

export function R(...args: number[]): NPort;
export function L(...args: number[]): NPort;
export function C(...args: number[]): NPort;
export function seR(...args: number[]): NPort;
export function seL(...args: number[]): NPort;
export function seC(...args: number[]): NPort;
export function paR(...args: number[]): NPort;
export function paL(...args: number[]): NPort;
export function paC(...args: number[]): NPort;
export function Tee(...args: number[]): NPort;
export function seriesTee(): NPort;
export function Open(...args: number[]): NPort;
export function Short(...args: number[]): NPort;
export function Load(...args: number[]): NPort;
export function Tlin(...args: number[]): NPort;
export interface MteeOptions {
    fList?: number[];
    commonWidth?: number;
    branch1Width?: number;
    branch2Width?: number;
    height?: number;
    Height?: number;
    thickness?: number;
    Thickness?: number;
    relativePermittivity?: number;
    er?: number;
    rho?: number;
    resistivity?: number;
    lossTangent?: number;
    tand?: number;
    roughnessRms?: number;
    temperature?: number;
}
export function mtee(
    options?: MteeOptions
): NPort;
export function nodal(...connections: Array<Array<NPort | string | number>>): NPort;

export interface OutputObject {
    out(...outputs: unknown[]): unknown;
    [key: string]: unknown;
}

export function waveform(options?: Record<string, unknown>): OutputObject;
export function PN(options?: Record<string, unknown>): OutputObject;
export function FFT(samples: unknown[]): OutputObject & unknown[];
export function invFFT(spectrum: unknown[]): OutputObject & unknown[];
export function mod(options?: Record<string, unknown>): OutputObject;
export function demod(input: unknown, options?: Record<string, unknown>): OutputObject;
export function bitErrorRate(...args: unknown[]): unknown;

export function schematic(circuit: unknown, options?: Record<string, unknown>): unknown;
export function schematicSvg(circuit: unknown, options?: Record<string, unknown>): string;
export function schematicGraph(circuit: unknown, options?: Record<string, unknown>): unknown;
export function schematicTopology(circuit: unknown, options?: Record<string, unknown>): unknown;

export function lineChart(options: Record<string, unknown>): unknown;
export function lineTable(options: Record<string, unknown>): unknown;
export function smithChart(options: Record<string, unknown>): unknown;
