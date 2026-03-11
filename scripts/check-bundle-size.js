#!/usr/bin/env node
/**
 * check-bundle-size.js
 * Validates that pseudo-kit-client.js stays within the v1.0.0 performance budget.
 *
 * Budget: pseudo-kit-client.js ≤ 12 KB gzip
 *
 * Usage:
 *   node scripts/check-bundle-size.js
 *
 * Exit code 0 = all checks pass
 * Exit code 1 = at least one file exceeds its budget
 */

import { readFileSync } from 'node:fs';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Readable, Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const CHECKS = [
  { file: 'src/client/pseudo-kit-client.js', budgetKb: 12, label: 'pseudo-kit-client.js' },
  { file: 'src/server/pseudo-kit-server.js', budgetKb: 6,  label: 'pseudo-kit-server.js' },
];

let failed = 0;

for (const { file, budgetKb, label } of CHECKS) {
  const fullPath = join(ROOT, file);
  let raw;
  try {
    raw = readFileSync(fullPath);
  } catch {
    console.warn(`⚠  SKIP  ${label} — file not found at ${file}`);
    continue;
  }

  const compressed = gzipSync(raw, { level: 9 });
  const rawKb   = (raw.length        / 1024).toFixed(1);
  const gzipKb  = (compressed.length / 1024).toFixed(1);
  const pass    = compressed.length / 1024 <= budgetKb;

  const icon   = pass ? '✅' : '❌';
  const status = pass ? 'PASS' : 'FAIL';
  console.log(`${icon} ${status}  ${label}  raw: ${rawKb} KB  gzip: ${gzipKb} KB  budget: ≤ ${budgetKb} KB`);

  if (!pass) {
    console.error(`   ↳ Exceeds budget by ${(compressed.length / 1024 - budgetKb).toFixed(1)} KB`);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
} else {
  console.log('\nAll bundle size checks passed.');
}
