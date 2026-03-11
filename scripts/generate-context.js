#!/usr/bin/env node
/**
 * generate-context.js
 * Generates pseudo-kit-context.json — a machine-readable LLM context pack
 * listing all pseudo-html-kit components with their props, slots, and layer.
 *
 * Usage:
 *   node scripts/generate-context.js
 *   node scripts/generate-context.js --out path/to/output.json
 *
 * Output: pseudo-kit-context.json at repo root (or --out path)
 *
 * Parsing strategy:
 *   - Reads the JSDoc comment block at the top of each component .html file
 *   - Extracts @component, @layer, @prop, @slot tags
 *   - Extracts the first <template> block as the usage example
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT        = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMPONENTS  = join(ROOT, 'src/pseudo-assets/components');
const LAYERS      = ['atoms', 'molecules', 'organisms'];

// ── Parsers ───────────────────────────────────────────────────────────────────

/**
 * Extract the first JSDoc comment block from HTML source.
 * @param {string} src
 * @returns {string}
 */
function extractJsDoc(src) {
  const m = src.match(/^<!--([\s\S]*?)-->/);
  return m ? m[1] : '';
}

/**
 * Parse a @prop tag line into a prop descriptor.
 * Format: @prop {type} [name] - description
 *         @prop {type} name - description    (required)
 * @param {string} line
 * @returns {{ name: string, type: string, required: boolean, values?: string[], default?: string, description: string }|null}
 */
function parseProp(line) {
  // Match: @prop {type} [name='default'] - desc  OR  @prop {type} name - desc
  const m = line.match(/@prop\s+\{([^}]+)\}\s+(\[([^\]]+)\]|(\S+))\s*(?:-\s*(.+))?/);
  if (!m) return null;

  const type     = m[1].trim();
  const optional = !!m[3]; // wrapped in []
  const raw      = (m[3] || m[4] || '').trim();

  // Split name='default'
  const eqIdx   = raw.indexOf('=');
  const name     = eqIdx >= 0 ? raw.slice(0, eqIdx).replace(/'/g, '') : raw;
  const defVal   = eqIdx >= 0 ? raw.slice(eqIdx + 1).replace(/'/g, '').replace(/\\/g, '') : undefined;

  // Extract union values from type: 'a'|'b'|'c'
  let values;
  if (type.includes("'") || type.includes('|')) {
    values = type.split('|').map(v => v.trim().replace(/'/g, ''));
  }

  const prop = {
    name:     name || raw,
    type:     type.replace(/'/g, '').replace(/\|/g, ' | '),
    required: !optional,
    description: (m[5] || '').trim(),
  };
  if (defVal !== undefined) prop.default = defVal;
  if (values)               prop.values  = values;
  return prop;
}

/**
 * Parse a @slot tag line.
 * Format: @slot name - description
 * @param {string} line
 * @returns {{ name: string, description: string }|null}
 */
function parseSlot(line) {
  const m = line.match(/@slot\s+(\S+)\s*(?:-\s*(.+))?/);
  if (!m) return null;
  return { name: m[1].trim(), description: (m[2] || '').trim() };
}

/**
 * Extract the inner HTML of the first <template> block.
 * Trimmed and limited to 600 chars for compactness.
 * @param {string} src
 * @returns {string}
 */
function extractExample(src) {
  const m = src.match(/<template>([\s\S]*?)<\/template>/i);
  if (!m) return '';
  const inner = m[1].trim();
  return inner.length > 600 ? inner.slice(0, 600) + '\n  …' : inner;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const components = [];

for (const layer of LAYERS) {
  const dir = join(COMPONENTS, layer);
  const files = readdirSync(dir).filter(f => f.endsWith('.html')).sort();

  for (const file of files) {
    const src    = readFileSync(join(dir, file), 'utf8');
    const jsdoc  = extractJsDoc(src);
    const lines  = jsdoc.split('\n').map(l => l.replace(/^\s*\*?\s?/, '').trim()).filter(Boolean);

    // @component name (fall back to file stem)
    const compTag  = lines.find(l => l.startsWith('@component'));
    const name     = compTag ? compTag.replace('@component', '').trim() : basename(file, '.html');

    // @layer (from jsdoc or from directory)
    const layerTag = lines.find(l => l.startsWith('@layer'));
    const layerVal = layerTag ? layerTag.replace('@layer', '').trim() : layer;

    const props = lines
      .filter(l => l.startsWith('@prop'))
      .map(parseProp)
      .filter(Boolean);

    const slots = lines
      .filter(l => l.startsWith('@slot'))
      .map(parseSlot)
      .filter(Boolean);

    const example = extractExample(src);

    components.push({ name, layer: layerVal, file: `${layer}/${file}`, props, slots, example });
  }
}

// ── Output ────────────────────────────────────────────────────────────────────

const outArg = process.argv.indexOf('--out');
const outPath = outArg >= 0 ? process.argv[outArg + 1] : join(ROOT, 'pseudo-kit-context.json');

const pkg     = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const context = {
  version:    pkg.version,
  generated:  new Date().toISOString().slice(0, 10),
  description: 'pseudo-html-kit component API reference — props, slots, layers. Use this file to configure AI autocomplete or validate component usage.',
  total:      components.length,
  components,
};

writeFileSync(outPath, JSON.stringify(context, null, 2) + '\n', 'utf8');
console.log(`✅ pseudo-kit-context.json written → ${outPath}`);
console.log(`   ${components.length} components across ${LAYERS.length} layers`);
console.log(`   atoms: ${components.filter(c => c.layer === 'atoms').length}`);
console.log(`   molecules: ${components.filter(c => c.layer === 'molecules').length}`);
console.log(`   organisms: ${components.filter(c => c.layer === 'organisms').length}`);
