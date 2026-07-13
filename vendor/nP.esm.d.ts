// Modified: 2026-07-13
export interface NPort {
    out(...outputs: string[]): Array<Array<string | number>>;
}

export interface GlobalSettings {
    fList: number[];
    Ro: number;
    Temp: number;
    fGen(start: number, stop: number, points: number): number[];
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
export function Open(...args: number[]): NPort;
export function Short(...args: number[]): NPort;
export function Load(...args: number[]): NPort;
export function Tlin(...args: number[]): NPort;
export function nodal(...connections: Array<Array<NPort | string | number>>): NPort;

export function lineChart(options: Record<string, unknown>): unknown;
export function lineTable(options: Record<string, unknown>): unknown;
export function smithChart(options: Record<string, unknown>): unknown;
