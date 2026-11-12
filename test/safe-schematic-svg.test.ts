// Modified: 2026-11-09
import test from 'node:test';
import assert from 'node:assert/strict';
import { schematicSvgPreflight } from '../src/safe-schematic-svg';

test('accepts generated self-contained schematic SVG text', () => {
    assert.equal(schematicSvgPreflight(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0 H10"/></svg>'
    ), true);
});

test('rejects executable, external, styled, and oversized schematic SVG text', () => {
    for (const svg of [
        '<svg><script>alert(1)</script></svg>',
        '<svg><foreignObject><div>unsafe</div></foreignObject></svg>',
        '<svg><image href="https://example.com/a.svg"/></svg>',
        '<svg><path onload="alert(1)"/></svg>',
        '<svg><path style="fill:url(https://example.com/a)"/></svg>',
        '<!DOCTYPE svg><svg></svg>',
        `<svg>${'x'.repeat(1_000_001)}</svg>`
    ]) assert.equal(schematicSvgPreflight(svg), false, svg.slice(0, 80));
});
