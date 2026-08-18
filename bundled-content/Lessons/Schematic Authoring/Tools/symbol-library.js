'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([A-Za-z_:][-A-Za-z0-9_:.]*)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function parseSymbol(source, filename = 'symbol.svg') {
  const withoutNamespace = source.replace('http://www.w3.org/2000/svg', '');
  if (/<script|<foreignObject|\son[a-z]+\s*=|xlink:href|https?:\/\//i.test(withoutNamespace)) {
    throw new Error(`unsafe canonical symbol: ${filename}`);
  }
  for (const required of ['<svg', '</svg>', '<title', '<desc', 'viewBox=']) {
    if (!source.includes(required)) throw new Error(`${filename} is missing ${required}`);
  }

  const labelGroup = /<g\b[^>]*font-family="[^"]+"[^>]*>[\s\S]*?<\/g>/i.exec(source);
  if (!labelGroup) throw new Error(`${filename} has no label and terminal group`);
  const background = /<rect\b[^>]*width="100%"[^>]*height="100%"[^>]*\/>/i.exec(source);
  if (!background || background.index > labelGroup.index) {
    throw new Error(`${filename} has no canonical white background before its geometry`);
  }
  const geometryStart = background.index + background[0].length;
  const geometry = source.slice(geometryStart, labelGroup.index).trim();
  if (!geometry) throw new Error(`${filename} has no component geometry`);

  const portNumbers = [...labelGroup[0].matchAll(/>\s*Port\s+([1-9][0-9]*)\s*<\/text>/g)]
    .map(match => Number(match[1]));
  if (!portNumbers.length) throw new Error(`${filename} has no public port labels`);
  const expectedNumbers = Array.from({length: portNumbers.length}, (_, index) => index + 1);
  if (portNumbers.some((number, index) => number !== expectedNumbers[index])) {
    throw new Error(`${filename} port labels must appear once in constructor order`);
  }

  const circles = [...labelGroup[0].matchAll(/<circle\b[^>]*\/>/g)].map(match => {
    const attributes = parseAttributes(match[0]);
    return {x: Number(attributes.cx), y: Number(attributes.cy), radius: Number(attributes.r)};
  }).filter(circle => [circle.x, circle.y, circle.radius].every(Number.isFinite));
  const terminalRadius = Math.max(...circles.map(circle => circle.radius));
  const terminals = circles.filter(circle => circle.radius === terminalRadius);
  if (terminals.length !== portNumbers.length) {
    throw new Error(`${filename} has ${portNumbers.length} port labels but ${terminals.length} terminal dots`);
  }

  return {
    filename,
    sourceHash: sha256(source),
    geometry,
    geometryHash: sha256(geometry),
    ports: Object.fromEntries(terminals.map((terminal, index) => [index + 1, {
      x: terminal.x,
      y: terminal.y
    }]))
  };
}

function readCanonicalSymbol(symbolRoot, filename) {
  if (path.basename(filename) !== filename || !filename.endsWith('.svg')) {
    throw new Error(`invalid symbol filename: ${filename}`);
  }
  const sourcePath = path.join(symbolRoot, filename);
  if (!fs.existsSync(sourcePath)) throw new Error(`canonical symbol not found: ${filename}`);
  return parseSymbol(fs.readFileSync(sourcePath, 'utf8'), filename);
}

function listCanonicalSymbols(symbolRoot) {
  return fs.readdirSync(symbolRoot)
    .filter(filename => filename.endsWith('.svg'))
    .sort()
    .map(filename => readCanonicalSymbol(symbolRoot, filename));
}

function resolveSchematicPaths(toolDirectory) {
  const resourceRoot = path.resolve(toolDirectory, '..');
  const bundledSymbolRoot = path.join(resourceRoot, 'Symbols');
  if (fs.existsSync(bundledSymbolRoot)) {
    return {symbolRoot: bundledSymbolRoot, vaultRoot: path.resolve(resourceRoot, '..')};
  }
  const vaultRoot = resourceRoot;
  return {
    symbolRoot: path.join(vaultRoot, 'Images', 'Symbol Library SVG'),
    vaultRoot
  };
}

function transformedPoint(point, anchor, placement, rotation) {
  const radians = rotation * Math.PI / 180;
  const dx = point.x - anchor[0];
  const dy = point.y - anchor[1];
  return [
    Math.round((placement[0] + dx * Math.cos(radians) - dy * Math.sin(radians)) * 1e9) / 1e9,
    Math.round((placement[1] + dx * Math.sin(radians) + dy * Math.cos(radians)) * 1e9) / 1e9
  ];
}

module.exports = {
  listCanonicalSymbols,
  parseSymbol,
  readCanonicalSymbol,
  resolveSchematicPaths,
  sha256,
  transformedPoint
};
