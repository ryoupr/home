#!/usr/bin/env node

/**
 * GitHub Pages Compatibility Verification Script
 *
 * Verifies that the site is compatible with GitHub Pages deployment:
 * - index.html exists at root
 * - All paths are relative
 * - Generated CSS exists
 * - All referenced files exist
 */

const fs = require('fs');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkIndexHtml() {
  log('\n📄 Checking index.html...', 'blue');

  if (!checkFileExists('index.html')) {
    log('❌ index.html not found at root directory', 'red');
    return false;
  }

  log('✅ index.html exists at root', 'green');
  return true;
}

function checkRelativePaths() {
  log('\n🔗 Checking for relative paths...', 'blue');

  const indexContent = fs.readFileSync('index.html', 'utf-8');

  // Check for absolute paths (excluding external URLs)
  const absolutePathPattern = /(?:href|src)=["']\/(?!\/)[^"']*["']/g;
  const matches = indexContent.match(absolutePathPattern);

  if (matches && matches.length > 0) {
    log('⚠️  Found absolute paths (should be relative):', 'yellow');
    matches.forEach((match) => log(`   ${match}`, 'yellow'));
    return false;
  }

  log('✅ All paths are relative', 'green');
  return true;
}

function checkGeneratedCSS() {
  log('\n🎨 Checking generated Tailwind CSS...', 'blue');

  const cssPath = 'css/output.css';

  if (!checkFileExists(cssPath)) {
    log(`❌ ${cssPath} not found`, 'red');
    log('   Run: npm run build', 'yellow');
    return false;
  }

  const stats = fs.statSync(cssPath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  log(`✅ ${cssPath} exists (${sizeKB} KB)`, 'green');
  return true;
}

function checkReferencedFiles() {
  log('\n📦 Checking referenced files...', 'blue');

  const indexContent = fs.readFileSync('index.html', 'utf-8');

  // Extract all src and href attributes (excluding external URLs)
  const srcPattern = /(?:src|href)=["']([^"']+)["']/g;
  const matches = [...indexContent.matchAll(srcPattern)];

  const localFiles = matches
    .map((match) => match[1])
    .filter(
      (url) =>
        !url.startsWith('http') &&
        !url.startsWith('//') &&
        !url.startsWith('#') &&
        !url.startsWith('mailto:')
    );

  let allExist = true;
  const missingFiles = [];

  localFiles.forEach((file) => {
    if (!checkFileExists(file)) {
      missingFiles.push(file);
      allExist = false;
    }
  });

  if (!allExist) {
    log('❌ Missing referenced files:', 'red');
    missingFiles.forEach((file) => log(`   ${file}`, 'red'));
    return false;
  }

  log(`✅ All ${localFiles.length} referenced files exist`, 'green');
  return true;
}

function checkMinifiedAssets() {
  log('\n⚡ Checking minified assets...', 'blue');

  const indexContent = fs.readFileSync('index.html', 'utf-8');

  // Check if using minified JS files
  const usesMinifiedJS = indexContent.includes('.min.js');

  if (!usesMinifiedJS) {
    log('⚠️  Not using minified JavaScript files', 'yellow');
    log('   For production, use: cp index.prod.html index.html', 'yellow');
    return false;
  }

  log('✅ Using minified assets', 'green');
  return true;
}

function checkRequiredDirectories() {
  log('\n📁 Checking required directories...', 'blue');

  const requiredDirs = ['css', 'js', 'images'];
  let allExist = true;

  requiredDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      log(`❌ Directory not found: ${dir}`, 'red');
      allExist = false;
    } else {
      log(`✅ ${dir}/ exists`, 'green');
    }
  });

  return allExist;
}

function main() {
  log('='.repeat(60), 'blue');
  log('GitHub Pages Compatibility Check', 'blue');
  log('='.repeat(60), 'blue');

  const checks = [
    { name: 'index.html at root', fn: checkIndexHtml },
    { name: 'Required directories', fn: checkRequiredDirectories },
    { name: 'Relative paths', fn: checkRelativePaths },
    { name: 'Generated CSS', fn: checkGeneratedCSS },
    { name: 'Referenced files', fn: checkReferencedFiles },
    { name: 'Minified assets', fn: checkMinifiedAssets },
  ];

  const results = checks.map((check) => ({
    name: check.name,
    passed: check.fn(),
  }));

  // Summary
  log('\n' + '='.repeat(60), 'blue');
  log('Summary', 'blue');
  log('='.repeat(60), 'blue');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
  });

  log('\n' + '-'.repeat(60));

  if (passed === total) {
    log(`\n🎉 All checks passed! (${passed}/${total})`, 'green');
    log('✅ Site is ready for GitHub Pages deployment', 'green');
    process.exit(0);
  } else {
    log(
      `\n⚠️  ${total - passed} check(s) failed (${passed}/${total})`,
      'yellow'
    );
    log('Please fix the issues above before deploying', 'yellow');
    process.exit(1);
  }
}

main();
