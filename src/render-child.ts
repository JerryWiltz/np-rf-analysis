// Modified: 2026-07-15
import { MarkdownRenderChild } from 'obsidian';
import * as nP from '../vendor/nP.esm.js';
import { runAnalysis } from './analysis';
import { parseAnalysisSpec } from './schema';

export class NpRenderChild extends MarkdownRenderChild {
    constructor(containerEl: HTMLElement, private readonly source: string) {
        super(containerEl);
    }

    onload(): void {
        this.containerEl.empty();

        try {
            const spec = parseAnalysisSpec(this.source);
            const result = runAnalysis(spec);
            const mount = this.containerEl.createDiv({ cls: 'np-rf-analysis' });
            const availableWidth = this.containerEl.clientWidth || 700;
            const requestedWidth = spec.view.width ?? 700;
            const width = Math.max(320, Math.min(requestedWidth, availableWidth));
            const common = {
                inputTable: [result.inputTable],
                mount,
                title: spec.view.title ?? '',
                metricPrefix: spec.view.metricPrefix ?? 'giga',
                backgroundColor: 'transparent'
            };

            if (spec.view.type === 'line') {
                nP.lineChart({
                    ...common,
                    width,
                    height: spec.view.height ?? 450,
                    xRange: spec.view.xRange,
                    yRange: spec.view.yRange
                });
            } else if (spec.view.type === 'smith') {
                const size = Math.max(320, Math.min(width, spec.view.height ?? width));
                nP.smithChart({ ...common, width: size, height: size });
            } else {
                nP.lineTable({
                    ...common,
                    cellFill: 'var(--background-primary)',
                    cellBorderColor: 'var(--background-modifier-border)',
                    headerFill: 'var(--interactive-accent)'
                });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.containerEl.createEl('pre', {
                cls: 'np-rf-analysis-error',
                text: `nPort RF Analysis\n${message}`
            });
        }
    }

    onunload(): void {
        this.containerEl.empty();
    }
}
