#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  readCanonicalSymbol,
  resolveSchematicPaths,
  sha256,
  transformedPoint
} = require('./symbol-library');

const {symbolRoot} = resolveSchematicPaths(__dirname);

function error(message) {
  process.stderr.write(`validate-schematic: ${message}\n`);
  process.exitCode = 1;
}

function decodeXml(value) {
  return value.replaceAll('&quot;', '"').replaceAll('&apos;', "'")
    .replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
}

function onGrid(point, grid) {
  return Array.isArray(point) && point.length === 2 &&
    point.every(number => Number.isFinite(number) && number % grid === 0);
}

function distanceToSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (!dx && !dy) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  const projection = ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) /
    (dx * dx + dy * dy);
  const amount = Math.max(0, Math.min(1, projection));
  return Math.hypot(
    point[0] - (start[0] + amount * dx),
    point[1] - (start[1] + amount * dy)
  );
}

function attributeNumber(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]+)"`));
  return match ? Number(match[1]) : NaN;
}

function segmentIntersectsRectangle(start, end, rectangle) {
  if (start[1] === end[1]) {
    const left = Math.min(start[0], end[0]);
    const right = Math.max(start[0], end[0]);
    return start[1] >= rectangle.top && start[1] <= rectangle.bottom &&
      right >= rectangle.left && left <= rectangle.right;
  }
  if (start[0] === end[0]) {
    const top = Math.min(start[1], end[1]);
    const bottom = Math.max(start[1], end[1]);
    return start[0] >= rectangle.left && start[0] <= rectangle.right &&
      bottom >= rectangle.top && top <= rectangle.bottom;
  }
  return false;
}

function validate(file) {
  const svg = fs.readFileSync(file, 'utf8');
  const withoutNamespace = svg.replace('http://www.w3.org/2000/svg', '');
  if (/<script|<foreignObject|\son[a-z]+=|xlink:href|https?:\/\//i.test(withoutNamespace)) {
    error('SVG contains executable or external content');
  }
  for (const required of ['<svg', '</svg>', '<title', '<desc', 'viewBox=',
    'id="circuit-description"']) {
    if (!svg.includes(required)) error(`missing ${required}`);
  }
  const viewBox = svg.match(/viewBox="([^"]+)"/);
  if (viewBox) {
    const values = viewBox[1].trim().split(/\s+/).map(Number);
    if (values.length !== 4 || values.some(number => !Number.isFinite(number)) ||
        values[2] <= 0 || values[3] <= 0 || values[2] % 20 || values[3] % 20) {
      error('viewBox width and height must be positive multiples of 20');
    }
  }
  const metadata = svg.match(/<metadata id="circuit-description">([\s\S]*?)<\/metadata>/);
  if (!metadata) return;
  let circuit;
  try {
    circuit = JSON.parse(decodeXml(metadata[1]));
  } catch (parseError) {
    error(`invalid embedded circuit description: ${parseError.message}`);
    return;
  }
  if (circuit.layout !== undefined) {
    const expectedAxis = circuit.viewBox[0] + circuit.viewBox[2] / 2;
    if (!circuit.layout || !Number.isFinite(circuit.layout.centerAxisX) ||
        typeof circuit.layout.centerReference !== 'string' ||
        !circuit.layout.centerReference.trim()) {
      error('layout needs a finite centerAxisX and non-empty centerReference');
    } else if (circuit.layout.centerAxisX !== expectedAxis) {
      error(`electrical center ${circuit.layout.centerReference} is not on the viewBox y-axis`);
    }
  }
  const groups = [...svg.matchAll(/<g data-component-id="([^"]+)"\s+data-symbol-source="([^"]+)"\s+data-symbol-sha256="([a-f0-9]{64})"\s+data-symbol-geometry-sha256="([a-f0-9]{64})"[^>]*>[\s\S]*?<!-- canonical-geometry-start -->\s*([\s\S]*?)\s*<!-- canonical-geometry-end -->/g)];
  if (groups.length !== circuit.components.length) {
    error(`expected ${circuit.components.length} canonical components, found ${groups.length}`);
  }
  for (const component of circuit.components) {
    if (!onGrid(component.at, 20)) error(`${component.id} placement is off the 20-unit grid`);
    if ((component.rotation || 0) % 90) error(`${component.id} rotation is not a multiple of 90`);
    const group = groups.find(match => match[1] === component.id);
    if (!group) {
      error(`missing canonical component group ${component.id}`);
      continue;
    }
    if (group[2] !== component.symbol) error(`${component.id} symbol source differs from metadata`);
    let canonical;
    try {
      canonical = readCanonicalSymbol(symbolRoot, component.symbol);
    } catch (readError) {
      error(`${component.id} ${readError.message}`);
      continue;
    }
    if (canonical.sourceHash !== group[3]) error(`${component.id} canonical symbol provenance is stale`);
    if (canonical.geometryHash !== group[4]) error(`${component.id} canonical geometry provenance is stale`);
    if (sha256(group[5].trim()) !== canonical.geometryHash) {
      error(`${component.id} embedded geometry differs from its canonical symbol`);
    }
    if ((component.connections || []).length !== Object.keys(canonical.ports).length) {
      error(`${component.id} does not describe every canonical constructor port`);
    }
    const sourceAnchor = component.sourceAnchor || [canonical.ports[1].x, canonical.ports[1].y];
    const seenPorts = new Set();
    for (const connection of component.connections || []) {
      if (!Array.isArray(connection.at) || connection.at.length !== 2 ||
          connection.at.some(number => !Number.isFinite(number))) {
        error(`${component.id} node ${connection.node} has invalid coordinates`);
      }
      if (!onGrid(connection.labelAt, 10)) error(`${component.id} node label ${connection.node} is off grid`);
      if (seenPorts.has(connection.port)) error(`${component.id} repeats constructor port ${connection.port}`);
      seenPorts.add(connection.port);
      const canonicalPort = canonical.ports[connection.port];
      if (!canonicalPort) {
        error(`${component.id} has no canonical constructor port ${connection.port}`);
      } else {
        const expected = transformedPoint(
          canonicalPort,
          sourceAnchor,
          component.at,
          component.rotation || 0
        );
        if (connection.at[0] !== expected[0] || connection.at[1] !== expected[1]) {
          error(`${component.id} port ${connection.port} does not land on canonical coordinates`);
        }
      }
      for (const attribute of ['data-node-dot', 'data-node-circle', 'data-node-label']) {
        if (!svg.includes(`${attribute}="${connection.node}"`)) {
          error(`${component.id} node ${connection.node} is missing ${attribute}`);
        }
      }
    }
  }
  for (const [index, wire] of (circuit.wires || []).entries()) {
    for (const point of wire.points || []) {
      if (!Array.isArray(point) || point.length !== 2 ||
          point.some(number => !Number.isFinite(number))) {
        error(`wire ${index + 1} has invalid coordinates`);
      }
    }
    for (let pointIndex = 1; pointIndex < (wire.points || []).length; pointIndex += 1) {
      const start = wire.points[pointIndex - 1];
      const end = wire.points[pointIndex];
      if (Array.isArray(start) && Array.isArray(end) &&
          start[0] !== end[0] && start[1] !== end[1]) {
        error(`wire ${index + 1} contains a diagonal segment`);
      }
    }
  }
  const wireSegments = (circuit.wires || []).flatMap((wire, wireIndex) =>
    (wire.points || []).slice(1).map((end, pointIndex) => ({
      start: wire.points[pointIndex],
      end,
      wire: wireIndex + 1
    })));
  for (const [index, terminal] of (circuit.terminals || []).entries()) {
    if (!onGrid(terminal.at, 20)) {
      error(`external terminal ${index + 1} is off the 20-unit grid`);
    }
    const tag = svg.match(new RegExp(
      `<circle\\b[^>]*data-external-terminal="${index + 1}"[^>]*>`
    ));
    if (!tag || attributeNumber(tag[0], 'cx') !== terminal.at[0] ||
        attributeNumber(tag[0], 'cy') !== terminal.at[1] ||
        attributeNumber(tag[0], 'r') !== 4) {
      error(`external terminal ${index + 1} differs from its metadata position`);
    }
  }
  const nodeConnections = new Map();
  for (const component of circuit.components || []) {
    for (const connection of component.connections || []) {
      if (!nodeConnections.has(connection.node)) nodeConnections.set(connection.node, connection);
    }
  }
  for (const [node, connection] of nodeConnections) {
    const circleMatch = svg.match(new RegExp(
      `<circle\\b[^>]*data-node-circle="${node}"[^>]*>`
    ));
    if (!circleMatch) continue;
    const rendered = [
      attributeNumber(circleMatch[0], 'cx'),
      attributeNumber(circleMatch[0], 'cy')
    ];
    const radius = attributeNumber(circleMatch[0], 'r');
    if (rendered.some(number => !Number.isFinite(number)) || !Number.isFinite(radius)) {
      error(`node ${node} circle has invalid rendered geometry`);
      continue;
    }
    if (rendered[0] !== connection.labelAt[0] || rendered[1] !== connection.labelAt[1]) {
      error(`node ${node} circle differs from its metadata label position`);
    }
    if (radius !== 12) error(`node ${node} circle radius must be 12`);
    const requiredClearance = radius + 8;
    for (const segment of wireSegments) {
      if (distanceToSegment(rendered, segment.start, segment.end) < requiredClearance) {
        error(`node ${node} circle is too close to wire ${segment.wire}; ` +
          `keep its edge at least 8 units from every wire`);
      }
    }
  }
  const textTags = [...svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)];
  for (const textMatch of textTags) {
    const attributes = textMatch[1];
    if (/\bdata-node-label=/.test(attributes)) continue;
    const x = attributeNumber(attributes, 'x');
    const y = attributeNumber(attributes, 'y');
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    const content = decodeXml(textMatch[2].replace(/<[^>]+>/g, '')).trim();
    if (!content) continue;
    const anchorMatch = attributes.match(/\btext-anchor="([^"]+)"/);
    const anchor = anchorMatch ? anchorMatch[1] : 'start';
    const width = content.length * 7.5;
    let left = x;
    if (anchor === 'middle') left -= width / 2;
    if (anchor === 'end') left -= width;
    const rectangle = {
      left: left - 4,
      right: left + width + 4,
      top: y - 18,
      bottom: y + 8
    };
    for (const segment of wireSegments) {
      if (segmentIntersectsRectangle(segment.start, segment.end, rectangle)) {
        error(`text "${content}" is too close to wire ${segment.wire}; ` +
          'keep text clear of every wire');
      }
    }
  }
  for (const [index, label] of (circuit.labels || []).entries()) {
    if (!onGrid(label.at, 10)) error(`label ${index + 1} is off the 10-unit grid`);
  }
}

const files = process.argv.slice(2);
if (!files.length || files.includes('--help')) {
  process.stdout.write('Usage: node schematics/validate-schematic.js SCHEMATIC.svg [...]\n');
  process.exit(files.includes('--help') ? 0 : 1);
}
for (const filename of files) validate(path.resolve(filename));
if (!process.exitCode) process.stdout.write(`Validated ${files.length} schematic(s).\n`);
