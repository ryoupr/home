#!/usr/bin/env node

/**
 * 統合検証スクリプト
 * 全ての verify スクリプトを順番に実行します。
 *
 * Usage:
 *   node scripts/verify-all.js
 *   node scripts/verify-all.js --only checkpoint
 *   node scripts/verify-all.js --only github-pages
 *   node scripts/verify-all.js --only accessibility
 */

const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS = [
  { name: 'checkpoint', file: 'verify-checkpoint.js' },
  { name: 'github-pages', file: 'verify-github-pages.js' },
  { name: 'accessibility', file: 'verify-accessibility.js' },
];

const only = process.argv[3];
const targets = only ? SCRIPTS.filter((s) => s.name === only) : SCRIPTS;

if (targets.length === 0) {
  console.error(`Unknown script: ${only}`);
  console.error(`Available: ${SCRIPTS.map((s) => s.name).join(', ')}`);
  process.exit(1);
}

let failed = false;
for (const { name, file } of targets) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${name}`);
  console.log('='.repeat(60));
  try {
    execSync(`node ${path.join(__dirname, file)}`, { stdio: 'inherit' });
  } catch (err) {
    console.error(`✗ ${name} failed:`, err.message || err);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
