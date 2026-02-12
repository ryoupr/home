/**
 * Accessibility Verification Script
 * Verifies that accessibility attributes are properly implemented
 */

const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, '..', 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Test results
const results = {
  passed: [],
  failed: [],
};

// Test 1: Skip-to-content link exists
if (
  htmlContent.includes('Skip to main content') &&
  htmlContent.includes('href="#main-content"')
) {
  results.passed.push('✓ Skip-to-content link exists');
} else {
  results.failed.push('✗ Skip-to-content link is missing');
}

// Test 2: Main content has id="main-content"
if (htmlContent.includes('id="main-content"')) {
  results.passed.push('✓ Main content has id="main-content"');
} else {
  results.failed.push('✗ Main content is missing id="main-content"');
}

// Test 3: Navigation has aria-expanded attribute
if (htmlContent.includes('aria-expanded="false"')) {
  results.passed.push('✓ Navigation toggle has aria-expanded attribute');
} else {
  results.failed.push('✗ Navigation toggle is missing aria-expanded attribute');
}

// Test 4: Navigation has aria-controls attribute
if (htmlContent.includes('aria-controls="mobile-menu"')) {
  results.passed.push('✓ Navigation toggle has aria-controls attribute');
} else {
  results.failed.push('✗ Navigation toggle is missing aria-controls attribute');
}

// Test 5: Sections have aria-labelledby attributes
const sectionsWithAriaLabelledby = (
  htmlContent.match(/aria-labelledby="/g) || []
).length;
if (sectionsWithAriaLabelledby >= 3) {
  results.passed.push(
    `✓ Sections have aria-labelledby attributes (${sectionsWithAriaLabelledby} found)`
  );
} else {
  results.failed.push(
    `✗ Not enough sections with aria-labelledby (${sectionsWithAriaLabelledby} found, expected at least 3)`
  );
}

// Test 6: Focus utilities are present
const focusUtilities = (
  htmlContent.match(/focus:outline-none focus:ring-2/g) || []
).length;
if (focusUtilities >= 5) {
  results.passed.push(
    `✓ Focus utilities are present (${focusUtilities} found)`
  );
} else {
  results.failed.push(
    `✗ Not enough focus utilities (${focusUtilities} found, expected at least 5)`
  );
}

// Test 7: External links have rel="noopener noreferrer"
const externalLinksWithRel = (
  htmlContent.match(/rel="noopener noreferrer"/g) || []
).length;
const externalLinks = (htmlContent.match(/target="_blank"/g) || []).length;
if (externalLinksWithRel === externalLinks && externalLinks > 0) {
  results.passed.push(
    `✓ All external links have rel="noopener noreferrer" (${externalLinks} links)`
  );
} else {
  results.failed.push(
    `✗ Some external links are missing rel="noopener noreferrer" (${externalLinksWithRel}/${externalLinks})`
  );
}

// Test 8: Social media links have descriptive aria-labels
const socialLinksWithAriaLabel = (
  htmlContent.match(/aria-label="[^"]*"/g) || []
).filter(
  (label) =>
    label.includes('GitHub') ||
    label.includes('Twitter') ||
    label.includes('LinkedIn') ||
    label.includes('Email')
).length;
if (socialLinksWithAriaLabel >= 3) {
  results.passed.push(
    `✓ Social media links have descriptive aria-labels (${socialLinksWithAriaLabel} found)`
  );
} else {
  results.failed.push(
    `✗ Not enough social media links with aria-labels (${socialLinksWithAriaLabel} found, expected at least 3)`
  );
}

// Test 9: All images have alt text
const images = htmlContent.match(/<img[^>]*>/g) || [];
const imagesWithAlt = images.filter((img) => img.includes('alt=')).length;
if (images.length > 0 && imagesWithAlt === images.length) {
  results.passed.push(`✓ All images have alt text (${images.length} images)`);
} else {
  results.failed.push(
    `✗ Some images are missing alt text (${imagesWithAlt}/${images.length})`
  );
}

// Test 10: Semantic HTML elements are used
const semanticElements = [
  '<nav',
  '<main',
  '<section',
  '<article',
  '<header',
  '<footer',
];
const foundSemanticElements = semanticElements.filter((el) =>
  htmlContent.includes(el)
);
if (foundSemanticElements.length >= 4) {
  results.passed.push(
    `✓ Semantic HTML elements are used (${foundSemanticElements.length} types found)`
  );
} else {
  results.failed.push(
    `✗ Not enough semantic HTML elements (${foundSemanticElements.length} found, expected at least 4)`
  );
}

// Print results
console.log('\n🔍 Accessibility Verification Results\n');
console.log('='.repeat(60));

console.log('\n✅ Passed Tests:\n');
results.passed.forEach((test) => console.log(`  ${test}`));

if (results.failed.length > 0) {
  console.log('\n❌ Failed Tests:\n');
  results.failed.forEach((test) => console.log(`  ${test}`));
}

console.log('\n' + '='.repeat(60));
console.log(
  `\n📊 Summary: ${results.passed.length} passed, ${results.failed.length} failed`
);

if (results.failed.length === 0) {
  console.log('\n🎉 All accessibility tests passed!');
  process.exit(0);
} else {
  console.log(
    '\n⚠️  Some accessibility tests failed. Please review the failures above.'
  );
  process.exit(1);
}
