#!/usr/bin/env node

/**
 * GitHub Pages Deployment Verification Script
 * Verifies that the Vite build output is compatible with GitHub Pages.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
let pass = 0;
let fail = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✓ ${name}`);
    pass++;
  } else {
    console.log(`✗ ${name}`);
    fail++;
  }
}

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

console.log('🔍 GitHub Pages Deployment Verification\n');

// Source checks
test('index.html exists', exists('index.html'));
test('public/404.html exists (SPA redirect)', exists('public/404.html'));
test('public/favicon.svg exists', exists('public/favicon.svg'));

// index.html content checks
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
test('index.html has lang attribute', indexHtml.includes('lang='));
test('index.html has viewport meta', indexHtml.includes('viewport'));
test('index.html has SPA redirect script', indexHtml.includes('replaceState'));

// Build output checks
if (fs.existsSync(dist)) {
  test('dist/index.html exists', fs.existsSync(path.join(dist, 'index.html')));
  test('dist/assets exists', fs.existsSync(path.join(dist, 'assets')));

  const distHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

  // Check referenced assets exist
  const assetRefs = [...distHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter(
      (url) =>
        !url.startsWith('http') &&
        !url.startsWith('//') &&
        !url.startsWith('#') &&
        !url.startsWith('data:') &&
        !url.startsWith('blob:')
    );

  let allAssetsExist = true;
  for (const ref of assetRefs) {
    const assetPath = path.join(dist, ref.startsWith('/') ? ref.slice(1) : ref);
    if (!fs.existsSync(assetPath)) {
      console.log(`  ✗ Missing asset: ${ref}`);
      allAssetsExist = false;
    }
  }
  test('All referenced assets exist in dist/', allAssetsExist);
  test('404.html copied to dist/', fs.existsSync(path.join(dist, '404.html')));
} else {
  console.log('⚠ dist/ not found. Run `npm run build` first.');
}

// GitHub Actions check
test('GitHub Actions workflow exists', exists('.github/workflows'));

console.log(`\n${'='.repeat(40)}`);
console.log(`✓ Passed: ${pass}  ✗ Failed: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
