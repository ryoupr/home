#!/usr/bin/env node

/**
 * Project Structure Verification Script
 * Verifies core files and configuration of the Vite + React portfolio.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
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

function read(p) {
  return fs.readFileSync(path.join(root, p), 'utf8');
}

console.log('🔍 Project Structure Verification\n');

// Core files
test('index.html exists', exists('index.html'));
test('package.json exists', exists('package.json'));
test('vite.config.ts exists', exists('vite.config.ts'));
test('tsconfig.json exists', exists('tsconfig.json'));
test('biome.jsonc exists', exists('biome.jsonc'));

// Source structure
test('src/main.tsx exists', exists('src/main.tsx'));
test('src/app/App.tsx exists', exists('src/app/App.tsx'));
test('src/data/config.json exists', exists('src/data/config.json'));
test('src/styles/index.css exists', exists('src/styles/index.css'));

// Components
test('Components directory exists', exists('src/app/components'));
test('Pages directory exists', exists('src/app/pages'));
test('Hooks directory exists', exists('src/app/hooks'));

// Build output (if built)
if (exists('dist')) {
  test('dist/index.html exists', exists('dist/index.html'));
  test('dist/assets directory exists', exists('dist/assets'));
}

// Package.json scripts
const pkg = JSON.parse(read('package.json'));
test('dev script defined', !!pkg.scripts?.dev);
test('build script defined', !!pkg.scripts?.build);
test('React dependency present', !!pkg.dependencies?.react);
test('Vite devDependency present', !!pkg.devDependencies?.vite);

// Config validation
const config = JSON.parse(read('src/data/config.json'));
test('config.json has personal section', !!config.personal);
test('config.json has projects section', Array.isArray(config.projects));

console.log(`\n${'='.repeat(40)}`);
console.log(`✓ Passed: ${pass}  ✗ Failed: ${fail}`);
process.exit(fail > 0 ? 1 : 0);
