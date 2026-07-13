// Modified: 2026-07-13
import { Plugin } from 'obsidian';
import { NpRenderChild } from './render-child';

export default class NpRfAnalysisPlugin extends Plugin {
    async onload(): Promise<void> {
        this.registerMarkdownCodeBlockProcessor('np', (source, el, context) => {
            context.addChild(new NpRenderChild(el, source));
        });
    }
}
