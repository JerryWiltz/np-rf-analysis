// Modified: 2026-07-15
import { Transaction } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

interface Fence {
    marker: '`' | '~';
    length: number;
    npjs: boolean;
}

function openingFence(line: string): Fence | null {
    const match = /^[ \t]{0,3}(`{3,}|~{3,})[ \t]*([^ \t]*)/.exec(line);
    if (!match?.[1]) return null;
    return {
        marker: match[1][0] as '`' | '~',
        length: match[1].length,
        npjs: (match[2] ?? '').toLowerCase() === 'npjs'
    };
}

function closesFence(line: string, fence: Fence): boolean {
    const marker = fence.marker.replace('~', '\\~');
    return new RegExp(`^[ \\t]{0,3}${marker}{${fence.length},}[ \\t]*$`).test(line);
}

export function isInsideNpJsFence(document: string, offset: number): boolean {
    const boundedOffset = Math.max(0, Math.min(offset, document.length));
    const lines = document.slice(0, boundedOffset).split('\n');
    let fence: Fence | null = null;

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index] ?? '';
        if (fence) {
            if (closesFence(line, fence)) fence = null;
        } else {
            fence = openingFence(line);
        }
    }
    return fence?.npjs === true;
}

export const npJsPlainTextPasteExtension = EditorView.domEventHandlers({
    paste(event, view): boolean {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const document = view.state.doc.toString();
        const insideNpJs = view.state.selection.ranges.every((range) =>
            isInsideNpJsFence(document, range.from) && isInsideNpJsFence(document, range.to)
        );
        if (!insideNpJs) return false;

        const plainText = clipboard.getData('text/plain').replace(/\r\n?/g, '\n');
        event.preventDefault();
        view.dispatch({
            ...view.state.replaceSelection(plainText),
            annotations: Transaction.userEvent.of('input.paste'),
            scrollIntoView: true
        });
        return true;
    }
});
