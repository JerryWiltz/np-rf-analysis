// Modified: 2026-07-13
import * as nP from '../vendor/nP.esm.js';
import type { AnalysisSpec, ComponentSpec, ComponentType } from './schema';

type NPort = ReturnType<typeof nP.R>;
type ComponentFactory = (...args: number[]) => NPort;

const componentFactories: Record<ComponentType, ComponentFactory> = {
    R: nP.R,
    L: nP.L,
    C: nP.C,
    seR: nP.seR,
    seL: nP.seL,
    seC: nP.seC,
    paR: nP.paR,
    paL: nP.paL,
    paC: nP.paC,
    Tee: nP.Tee,
    Open: nP.Open,
    Short: nP.Short,
    Load: nP.Load,
    Tlin: nP.Tlin
};

export interface AnalysisResult {
    inputTable: Array<Array<string | number>>;
    spec: AnalysisSpec;
}

function componentArgs(spec: ComponentSpec): number[] {
    if (spec.args) return spec.args;
    if (spec.value !== undefined) return [spec.value];
    return [];
}

export function runAnalysis(spec: AnalysisSpec): AnalysisResult {
    const previous = {
        fList: nP.global.fList,
        Ro: nP.global.Ro,
        Temp: nP.global.Temp
    };

    try {
        const { start, stop, points, referenceImpedance, temperature } = spec.frequencies;
        nP.global.fList = points === 1 ? [start] : nP.global.fGen(start, stop, points);
        if (referenceImpedance !== undefined) nP.global.Ro = referenceImpedance;
        if (temperature !== undefined) nP.global.Temp = temperature;

        const components = new Map<string, NPort>();
        for (const [name, componentSpec] of Object.entries(spec.components)) {
            const factory = componentFactories[componentSpec.type];
            components.set(name, factory(...componentArgs(componentSpec)));
        }

        const connections = spec.nodal.map((connection, index) => {
            if (connection[0] === 'out') return connection;
            const componentName = connection[0];
            if (typeof componentName !== 'string') {
                throw new Error(`nodal[${index}] must begin with a component name.`);
            }
            const component = components.get(componentName);
            if (!component) throw new Error(`nodal[${index}] references unknown component: ${componentName}`);
            return [component, ...connection.slice(1)];
        });

        const circuit = nP.nodal(...connections);
        return {
            inputTable: circuit.out(...spec.output),
            spec
        };
    } finally {
        nP.global.fList = previous.fList;
        nP.global.Ro = previous.Ro;
        nP.global.Temp = previous.Temp;
    }
}
