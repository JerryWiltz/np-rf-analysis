#!/usr/bin/env node
'use strict';

const {listCanonicalSymbols, resolveSchematicPaths} = require('./symbol-library');

const {symbolRoot} = resolveSchematicPaths(__dirname);

try {
  const symbols = listCanonicalSymbols(symbolRoot);
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(symbols.map(symbol => ({
      filename: symbol.filename,
      sha256: symbol.sourceHash,
      geometrySha256: symbol.geometryHash,
      ports: symbol.ports
    })), null, 2)}\n`);
  } else {
    process.stdout.write(`Validated ${symbols.length} canonical symbol(s).\n`);
  }
} catch (error) {
  process.stderr.write(`validate-symbol-library: ${error.message}\n`);
  process.exit(1);
}
