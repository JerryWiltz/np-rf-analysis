#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const {
  readCanonicalSymbol,
  resolveSchematicPaths,
  transformedPoint
} = require('./symbol-library');

const {symbolRoot, vaultRoot} = resolveSchematicPaths(__dirname);

function fail(message) {
  process.stderr.write(`compose-schematic: ${message}\n`);
  process.exit(1);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function readDescription(inputPath) {
  const source = inputPath === '-'
    ? fs.readFileSync(0, 'utf8')
    : fs.readFileSync(path.resolve(inputPath), 'utf8');
  try {
    return JSON.parse(source);
  } catch (error) {
    fail(`invalid JSON description: ${error.message}`);
  }
}

function numberPair(value, name) {
  if (!Array.isArray(value) || value.length !== 2 ||
      value.some(number => !Number.isFinite(number))) {
    fail(`${name} must contain two finite numbers`);
  }
  return value;
}

function pointOnGrid(point, grid, name) {
  numberPair(point, name);
  if (point.some(number => number % grid !== 0)) {
    fail(`${name} must use the ${grid}-unit grid`);
  }
}

function canonicalSymbol(filename) {
  try {
    return readCanonicalSymbol(symbolRoot, filename);
  } catch (error) {
    fail(error.message);
  }
}

function validateDescription(circuit) {
  if (!circuit || typeof circuit !== 'object') fail('description must be an object');
  if (!circuit.title || !circuit.description) fail('title and description are required');
  if (!Array.isArray(circuit.viewBox) || circuit.viewBox.length !== 4 ||
      circuit.viewBox.some(number => !Number.isFinite(number))) {
    fail('viewBox must contain four finite numbers');
  }
  const [, , width, height] = circuit.viewBox;
  if (width <= 0 || height <= 0 || width % 20 || height % 20) {
    fail('viewBox width and height must be positive multiples of 20');
  }
  if (circuit.layout !== undefined) {
    if (!circuit.layout || typeof circuit.layout !== 'object' ||
        !Number.isFinite(circuit.layout.centerAxisX) ||
        typeof circuit.layout.centerReference !== 'string' ||
        !circuit.layout.centerReference.trim()) {
      fail('layout needs a finite centerAxisX and non-empty centerReference');
    }
    const expectedAxis = circuit.viewBox[0] + width / 2;
    if (circuit.layout.centerAxisX !== expectedAxis) {
      fail(`layout centerAxisX must equal the viewBox y-axis at ${expectedAxis}`);
    }
  }
  if (!Array.isArray(circuit.components) || !circuit.components.length) {
    fail('at least one component is required');
  }
  const nodes = new Map();
  for (const [index, component] of circuit.components.entries()) {
    if (!component.id || !component.symbol) fail(`component ${index} needs id and symbol`);
    pointOnGrid(component.at, 20, `${component.id}.at`);
    const canonical = canonicalSymbol(component.symbol);
    const portOne = canonical.ports[1];
    const sourceAnchor = component.sourceAnchor || [portOne.x, portOne.y];
    numberPair(sourceAnchor, `${component.id}.sourceAnchor`);
    const rotation = component.rotation || 0;
    if (!Number.isFinite(rotation) || rotation % 90) {
      fail(`${component.id}.rotation must be a multiple of 90`);
    }
    if (!Array.isArray(component.connections) ||
        component.connections.length !== Object.keys(canonical.ports).length) {
      fail(`${component.id}.connections must describe every constructor port exactly once`);
    }
    const ports = new Set();
    for (const connection of component.connections) {
      if (!Number.isInteger(connection.port) || connection.port < 1) {
        fail(`${component.id} has an invalid constructor port`);
      }
      if (ports.has(connection.port)) fail(`${component.id} repeats port ${connection.port}`);
      ports.add(connection.port);
      if (!Number.isInteger(connection.node) || connection.node < 1) {
        fail(`${component.id} port ${connection.port} has an invalid node`);
      }
      numberPair(connection.at, `${component.id} port ${connection.port}`);
      pointOnGrid(connection.labelAt, 10, `${component.id} node ${connection.node} label`);
      const sourcePort = canonical.ports[connection.port];
      if (!sourcePort) fail(`${component.id} has no constructor port ${connection.port}`);
      const expected = transformedPoint(sourcePort, sourceAnchor, component.at, rotation);
      if (connection.at[0] !== expected[0] || connection.at[1] !== expected[1]) {
        fail(`${component.id} port ${connection.port} must be at [${expected.join(', ')}]`);
      }
      const prior = nodes.get(connection.node);
      if (prior && (prior.at[0] !== connection.at[0] || prior.at[1] !== connection.at[1])) {
        fail(`node ${connection.node} is assigned to more than one coordinate`);
      }
      if (prior && (prior.labelAt[0] !== connection.labelAt[0] ||
          prior.labelAt[1] !== connection.labelAt[1])) {
        fail(`node ${connection.node} is assigned more than one label coordinate`);
      }
      nodes.set(connection.node, {at: connection.at, labelAt: connection.labelAt});
    }
  }
  for (const [index, wire] of (circuit.wires || []).entries()) {
    if (!Array.isArray(wire.points) || wire.points.length < 2) {
      fail(`wire ${index} needs at least two points`);
    }
    wire.points.forEach((point, pointIndex) =>
      numberPair(point, `wire ${index} point ${pointIndex}`));
    for (let pointIndex = 1; pointIndex < wire.points.length; pointIndex += 1) {
      const previous = wire.points[pointIndex - 1];
      const current = wire.points[pointIndex];
      if (previous[0] !== current[0] && previous[1] !== current[1]) {
        fail(`wire ${index} contains a diagonal segment`);
      }
    }
  }
  for (const [index, terminal] of (circuit.terminals || []).entries()) {
    pointOnGrid(terminal.at, 20, `terminal ${index + 1}`);
  }
  for (const [index, label] of (circuit.labels || []).entries()) {
    if (typeof label.text !== 'string') fail(`label ${index} needs text`);
    pointOnGrid(label.at, 10, `label ${index}`);
  }
}

function pathData(points) {
  return points.map((point, index) =>
    `${index ? 'L' : 'M'}${point[0]} ${point[1]}`).join(' ');
}

function compose(circuit) {
  validateDescription(circuit);
  const metadata = escapeXml(JSON.stringify(circuit));
  const componentSvg = circuit.components.map(component => {
    const canonical = canonicalSymbol(component.symbol);
    const [x, y] = component.at;
    const portOne = canonical.ports[1];
    const [anchorX, anchorY] = component.sourceAnchor || [portOne.x, portOne.y];
    const rotation = component.rotation || 0;
    return `    <!-- ${escapeXml(component.id)} from ${escapeXml(component.symbol)} -->\n` +
      `    <g data-component-id="${escapeXml(component.id)}" ` +
      `data-symbol-source="${escapeXml(component.symbol)}" ` +
      `data-symbol-sha256="${canonical.sourceHash}" ` +
      `data-symbol-geometry-sha256="${canonical.geometryHash}" ` +
      `transform="translate(${x} ${y}) rotate(${rotation}) translate(${-anchorX} ${-anchorY})">\n` +
      `      <!-- canonical-geometry-start -->\n${canonical.geometry}\n` +
      `      <!-- canonical-geometry-end -->\n    </g>`;
  }).join('\n');
  const wireSvg = (circuit.wires || []).map((wire, index) =>
    `    <path data-wire="${index + 1}" d="${pathData(wire.points)}"/>`).join('\n');
  const terminalSvg = (circuit.terminals || []).map((terminal, index) =>
    `    <circle data-external-terminal="${index + 1}" cx="${terminal.at[0]}" ` +
    `cy="${terminal.at[1]}" r="4" fill="#202020"/>`).join('\n');
  const connections = [...new Map(circuit.components.flatMap(component =>
    component.connections.map(connection => [connection.node, connection]))).values()];
  const nodeSvg = connections.map(connection =>
    `    <circle data-node-dot="${connection.node}" cx="${connection.at[0]}" ` +
    `cy="${connection.at[1]}" r="4" fill="#202020"/>\n` +
    `    <circle data-node-circle="${connection.node}" cx="${connection.labelAt[0]}" ` +
    `cy="${connection.labelAt[1]}" r="12" fill="#ffffff"/>`).join('\n');
  const nodeText = connections.map(connection =>
    `    <text data-node-label="${connection.node}" x="${connection.labelAt[0]}" ` +
    `y="${connection.labelAt[1] + 5}" text-anchor="middle">${connection.node}</text>`).join('\n');
  const labels = (circuit.labels || []).map(label =>
    `    <text x="${label.at[0]}" y="${label.at[1]}" ` +
    `text-anchor="${escapeXml(label.anchor || 'start')}">${escapeXml(label.text)}</text>`).join('\n');
  const [minX, minY, width, height] = circuit.viewBox;
  return `<svg xmlns="http://www.w3.org/2000/svg"\n` +
    `     viewBox="${minX} ${minY} ${width} ${height}"\n` +
    `     role="img" aria-labelledby="title description">\n` +
    `  <title id="title">${escapeXml(circuit.title)}</title>\n` +
    `  <desc id="description">${escapeXml(circuit.description)}</desc>\n` +
    `  <metadata id="circuit-description">${metadata}</metadata>\n` +
    `  <rect width="100%" height="100%" fill="#ffffff"/>\n` +
    `  <g fill="none" stroke="#202020" stroke-width="2" ` +
    `stroke-linecap="round" stroke-linejoin="round">\n${wireSvg}\n${terminalSvg}\n${componentSvg}\n${nodeSvg}\n  </g>\n` +
    `  <g fill="#202020" font-family="Arial, Helvetica, sans-serif" font-size="14">\n` +
    `${labels}\n${nodeText}\n  </g>\n</svg>\n`;
}

function runCli() {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath || process.argv.includes('--help')) {
    process.stdout.write('Usage: node schematics/compose-schematic.js DESCRIPTION.json OUTPUT.svg\n');
    process.exit(inputPath === '--help' ? 0 : 1);
  }
  const output = path.resolve(outputPath);
  const relative = path.relative(vaultRoot, output);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    fail('output must be inside the current vault');
  }
  fs.writeFileSync(output, compose(readDescription(inputPath)), 'utf8');
  process.stdout.write(`${relative}\n`);
}

module.exports = {compose, validateDescription};

if (require.main === module) runCli();
