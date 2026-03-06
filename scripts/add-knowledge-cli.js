#!/usr/bin/env node
"use strict";

// Lightweight knowledge ingestion CLI for BMAD
// Usage:
//   node scripts/add-knowledge-cli.js --description "Description" [--path <source-path>]
// Output:
//   Creates bmad/artifacts/knowledge-updates-<timestamp>.md with a concise entry

import fs from 'fs';
import path from 'path';

function pad(n) { return n < 10 ? '0' + n : '' + n; }
function nowStamp() {
  const d = new Date();
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D}_${h}${m}${s}`;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = (i + 1) < argv.length && !argv[i + 1].startsWith('--') ? argv[i + 1] : true;
      args[key] = val;
    }
  }
  return args;
}

function printUsage() {
  console.log('Usage: node scripts/add-knowledge-cli.js --description "Description" [--path <source-path>]');
}

async function main() {
  const args = parseArgs(process.argv);
  const description = args.description;
  const sourcePath = args.path || '';
  if (!description) {
    console.error('Error: --description is required.');
    printUsage();
    process.exit(2);
  }

  const timestamp = nowStamp();
  const fileName = `knowledge-updates-${timestamp}.md`;
  const dir = path.resolve('bmad', 'artifacts');
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (e) {
    // ignore
  }
  const filePath = path.join(dir, fileName);

  const header = `# Knowledge Update - ${timestamp}\n`;
  const lines = [
    header,
    '',
    'Description:',
    '',
    `- ${description}`,
    '',
    sourcePath ? `Source: ${sourcePath}` : '',
    '',
    'Notes:',
    '',
  ];
  const content = lines.filter(l => l !== undefined && l !== null).join('\n');

  await fs.promises.writeFile(filePath, content, 'utf8');
  console.log(`Knowledge update created: ${filePath}`);
}

main().catch(err => {
  console.error('Error:', err?.message || err);
  process.exit(1);
});
