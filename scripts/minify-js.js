/**
 * JavaScript Minification Script
 * Minifies all JavaScript files in the js/ directory
 * Creates minified versions with .min.js extension
 */

const fs = require('fs');
const path = require('path');

/**
 * Simple JavaScript minifier
 * Removes comments, unnecessary whitespace, and line breaks
 * @param {string} code - JavaScript code to minify
 * @returns {string} Minified JavaScript code
 */
function minifyJS(code) {
  return (
    code
      // Remove single-line comments
      .replace(/\/\/.*$/gm, '')
      // Remove multi-line comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove leading/trailing whitespace from lines
      .replace(/^\s+|\s+$/gm, '')
      // Replace multiple spaces with single space
      .replace(/\s+/g, ' ')
      // Remove spaces around operators and punctuation
      .replace(/\s*([{}();,:])\s*/g, '$1')
      // Remove line breaks
      .replace(/\n/g, '')
  );
}

/**
 * Recursively find all .js files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Accumulated list of files
 * @returns {string[]} List of JavaScript file paths
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Minify all JavaScript files in the js/ directory
 */
function minifyAllJS() {
  const jsDir = path.join(__dirname, '..', 'js');

  if (!fs.existsSync(jsDir)) {
    console.error('Error: js/ directory not found');
    process.exit(1);
  }

  const jsFiles = findJSFiles(jsDir);

  console.log(`Found ${jsFiles.length} JavaScript files to minify`);

  let successCount = 0;
  let errorCount = 0;

  jsFiles.forEach((filePath) => {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const minified = minifyJS(code);

      const minFilePath = filePath.replace(/\.js$/, '.min.js');
      fs.writeFileSync(minFilePath, minified, 'utf8');

      const originalSize = Buffer.byteLength(code, 'utf8');
      const minifiedSize = Buffer.byteLength(minified, 'utf8');
      const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

      console.log(
        `✓ ${path.relative(process.cwd(), filePath)} → ${path.basename(minFilePath)} (${savings}% smaller)`
      );
      successCount++;
    } catch (error) {
      console.error(`✗ Error minifying ${filePath}:`, error.message);
      errorCount++;
    }
  });

  console.log(
    `\nMinification complete: ${successCount} succeeded, ${errorCount} failed`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run minification
minifyAllJS();
