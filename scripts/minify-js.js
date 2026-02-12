/**
 * JavaScript Minification Script
 * Minifies all JavaScript files in the js/ directory using terser.
 *
 * Note: This project uses Vite for production builds which handles
 * minification automatically. This script is for standalone JS files
 * outside the Vite pipeline (e.g. js/ directory).
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

/**
 * Recursively find all .js files in a directory
 * @param {string} dir - Directory to search
 * @param {string[]} fileList - Accumulated list of files
 * @returns {string[]} List of JavaScript file paths
 */
function findJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJSFiles(filePath, fileList);
    } else if (file.endsWith('.js') && !file.endsWith('.min.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

/**
 * Minify all JavaScript files in the js/ directory
 */
async function minifyAllJS() {
  const jsDir = path.join(__dirname, '..', 'js');

  if (!fs.existsSync(jsDir)) {
    console.error('Error: js/ directory not found');
    process.exit(1);
  }

  const jsFiles = findJSFiles(jsDir);
  console.log(`Found ${jsFiles.length} JavaScript files to minify`);

  let successCount = 0;
  let errorCount = 0;

  for (const filePath of jsFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const result = await minify(code, { sourceMap: false });

      if (!result.code) {
        throw new Error('Minification produced empty output');
      }

      const minFilePath = filePath.replace(/\.js$/, '.min.js');
      fs.writeFileSync(minFilePath, result.code, 'utf8');

      const originalSize = Buffer.byteLength(code, 'utf8');
      const minifiedSize = Buffer.byteLength(result.code, 'utf8');
      const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

      console.log(
        `✓ ${path.relative(process.cwd(), filePath)} → ${path.basename(minFilePath)} (${savings}% smaller)`
      );
      successCount++;
    } catch (error) {
      console.error(`✗ Error minifying ${filePath}:`, error.message);
      errorCount++;
    }
  }

  console.log(
    `\nMinification complete: ${successCount} succeeded, ${errorCount} failed`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

minifyAllJS();
