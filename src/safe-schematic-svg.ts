// Modified: 2026-11-09
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const MAX_SCHEMATIC_SVG_LENGTH = 1_000_000;
const ALLOWED_ELEMENTS = new Set([
    'svg', 'g', 'path', 'rect', 'circle', 'line', 'polyline', 'polygon',
    'ellipse', 'text', 'title', 'desc'
]);
const ALLOWED_ATTRIBUTES = new Set([
    'xmlns', 'viewBox', 'role', 'aria-label', 'aria-labelledby', 'id',
    'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
    'width', 'height', 'd', 'points', 'transform', 'fill', 'stroke',
    'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'text-anchor',
    'dominant-baseline', 'font-family', 'font-size', 'opacity',
    'data-schematic-dot'
]);

export function schematicSvgPreflight(svg: string): boolean {
    if (svg.length === 0 || svg.length > MAX_SCHEMATIC_SVG_LENGTH) return false;
    if (!/^\s*<svg(?:\s|>)/.test(svg)) return false;
    return !/<!DOCTYPE|<!ENTITY|<\?xml|<script|<foreignObject|\son[a-z]+\s*=|\s(?:href|style)\s*=|url\s*\(/i.test(svg);
}

function safeAttribute(name: string, value: string): boolean {
    if (!ALLOWED_ATTRIBUTES.has(name) || value.length > 10_000) return false;
    if ([...value].some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 && code !== 9 && code !== 10 && code !== 13;
    })) return false;
    if (/javascript:|data:|url\s*\(/i.test(value)) return false;
    return name !== 'xmlns' || value === SVG_NAMESPACE;
}

function copySvgNode(source: Element, document: Document): SVGElement {
    const name = source.localName;
    if (source.namespaceURI !== SVG_NAMESPACE || !ALLOWED_ELEMENTS.has(name)) {
        throw new Error(`Schematic SVG contains an unsupported element: ${name}.`);
    }

    const target = document.createElementNS(SVG_NAMESPACE, name);
    for (const attribute of Array.from(source.attributes)) {
        if (!safeAttribute(attribute.name, attribute.value)) {
            throw new Error(`Schematic SVG contains an unsupported attribute: ${attribute.name}.`);
        }
        target.setAttribute(attribute.name, attribute.value);
    }

    for (const child of Array.from(source.childNodes)) {
        if (child.nodeType === 1) {
            target.appendChild(copySvgNode(child as Element, document));
        } else if (child.nodeType === 3) {
            target.appendChild(document.createTextNode(child.textContent ?? ''));
        } else if (child.nodeType !== 8) {
            throw new Error('Schematic SVG contains an unsupported node type.');
        }
    }
    return target;
}

export function createSafeSchematicSvg(svg: string, document: Document): SVGElement {
    if (!schematicSvgPreflight(svg)) throw new Error('Schematic SVG failed its safety preflight.');
    const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (parsed.querySelector('parsererror') || parsed.documentElement.localName !== 'svg') {
        throw new Error('Schematic SVG is not valid XML.');
    }
    return copySvgNode(parsed.documentElement, document);
}
