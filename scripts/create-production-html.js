/**
 * Production HTML Generator
 * Creates index.html that references minified CSS and JS files
 */

const fs = require('fs');
const path = require('path');

/**
 * Update HTML file to reference minified assets
 */
function createProductionHTML() {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    console.error('Error: index.html not found');
    process.exit(1);
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Replace CSS reference (output.css is already minified by Tailwind)
  // No change needed as build script already minifies it
  
  // Replace JS references with minified versions
  html = html.replace(/src="(js\/[^"]+)\.js"/g, 'src="$1.min.js"');
  
  // Create production HTML file
  const prodHtmlPath = path.join(__dirname, '..', 'index.prod.html');
  fs.writeFileSync(prodHtmlPath, html, 'utf8');
  
  console.log('✓ Created index.prod.html with minified asset references');
  console.log('\nTo use in production:');
  console.log('1. Run: npm run build:all');
  console.log('2. Replace index.html with index.prod.html');
  console.log('3. Deploy to GitHub Pages');
}

// Run production HTML generation
createProductionHTML();
