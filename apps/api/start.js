const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

const candidates = ['dist/main.js', 'dist/src/main.js', 'dist/apps/api/src/main.js'];
const entry = candidates.find((candidate) => existsSync(resolve(__dirname, candidate)));

if (!entry) {
  console.error(`Cannot find API build entry. Tried: ${candidates.join(', ')}`);
  process.exit(1);
}

require(resolve(__dirname, entry));
