#!/usr/bin/env node

/**
 * Checkpoint 7 Verification Script
 * Verifies core functionality of the portfolio website
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checkpoint 7: Core Functionality Verification\n');
console.log('=' .repeat(60));

let passCount = 0;
let failCount = 0;

function test(name, condition, message = '') {
    if (condition) {
        console.log(`✓ PASS: ${name}`);
        if (message) console.log(`  → ${message}`);
        passCount++;
    } else {
        console.log(`✗ FAIL: ${name}`);
        if (message) console.log(`  → ${message}`);
        failCount++;
    }
}

// Test 1: Verify navigation scrolls smoothly to sections
console.log('\n📍 Test 1: Navigation Smooth Scroll');
console.log('-'.repeat(60));

const indexHtml = fs.readFileSync('index.html', 'utf8');
const navJs = fs.readFileSync('js/navigation.js', 'utf8');

test('Navigation element exists', 
    indexHtml.includes('<nav') && indexHtml.includes('role="navigation"'),
    'Found <nav role="navigation"> in index.html');

test('Navigation links exist',
    indexHtml.includes('href="#home"') && 
    indexHtml.includes('href="#projects"') &&
    indexHtml.includes('href="#about"') &&
    indexHtml.includes('href="#contact"'),
    'All required navigation links found');

test('Smooth scroll implementation exists',
    navJs.includes('setupSmoothScroll') && navJs.includes('behavior: \'smooth\''),
    'Found smooth scroll implementation in navigation.js');

test('Navigation class initialized',
    navJs.includes('class Navigation') && navJs.includes('new Navigation'),
    'Navigation class is defined and initialized');

// Test 2: Verify hero section displays correctly
console.log('\n🎨 Test 2: Hero Section Display');
console.log('-'.repeat(60));

test('Hero section exists',
    indexHtml.includes('id="home"'),
    'Found hero section with id="home"');

test('Developer name displayed',
    indexHtml.includes('<h1') && indexHtml.match(/<h1[^>]*>[\s\S]*?<\/h1>/),
    'Found h1 element with developer name');

test('Avatar image exists',
    (indexHtml.includes('images/hero/avatar.jpg') || indexHtml.includes('images/hero/avatar.svg')) && indexHtml.includes('alt='),
    'Found avatar image with alt text');

test('Social media links exist',
    indexHtml.includes('target="_blank"') && 
    indexHtml.includes('rel="noopener') &&
    (indexHtml.match(/target="_blank"/g) || []).length >= 3,
    'Found at least 3 external links with proper attributes');

test('CTA button exists',
    indexHtml.includes('href="#projects"') && indexHtml.includes('View My Work'),
    'Found CTA button linking to projects');

test('Gradient background applied',
    indexHtml.includes('bg-gradient-to-br') && 
    indexHtml.includes('from-blue-50') && 
    indexHtml.includes('to-indigo-100'),
    'Hero section has gradient background classes');

// Test 3: Verify project cards render with sample data
console.log('\n🎴 Test 3: Project Cards Rendering');
console.log('-'.repeat(60));

const projectsJs = fs.readFileSync('js/data/projects.js', 'utf8');
const projectCardJs = fs.readFileSync('js/components/ProjectCard.js', 'utf8');
const projectsSectionJs = fs.readFileSync('js/components/ProjectsSection.js', 'utf8');

test('Projects data file exists',
    fs.existsSync('js/data/projects.js'),
    'Found js/data/projects.js');

test('Sample projects defined',
    projectsJs.includes('const projects = [') && 
    projectsJs.includes('id:') &&
    projectsJs.includes('title:'),
    'Found projects array with sample data');

test('ProjectCard class exists',
    projectCardJs.includes('class ProjectCard') && 
    projectCardJs.includes('render()'),
    'ProjectCard class with render method found');

test('ProjectsSection class exists',
    projectsSectionJs.includes('class ProjectsSection') && 
    projectsSectionJs.includes('render()'),
    'ProjectsSection class with render method found');

test('Projects grid container exists',
    indexHtml.includes('id="projects-grid"'),
    'Found projects grid container in HTML');

test('Project cards use Tailwind classes',
    projectCardJs.includes('bg-white') && 
    projectCardJs.includes('rounded-lg') &&
    projectCardJs.includes('shadow-md'),
    'Project cards use Tailwind utility classes');

test('Project initialization in main.js',
    fs.existsSync('js/main.js') && 
    fs.readFileSync('js/main.js', 'utf8').includes('ProjectsSection'),
    'Projects section is initialized in main.js');

// Test 4: Verify responsive layout changes at breakpoints
console.log('\n📱 Test 4: Responsive Layout');
console.log('-'.repeat(60));

test('Responsive grid classes exist',
    indexHtml.includes('grid-cols-1') &&
    indexHtml.includes('md:grid-cols-2') &&
    indexHtml.includes('lg:grid-cols-3'),
    'Found responsive grid classes for mobile, tablet, and desktop');

test('Mobile layout (< 768px)',
    indexHtml.includes('grid-cols-1'),
    'Single column layout for mobile');

test('Tablet layout (768px - 1024px)',
    indexHtml.includes('md:grid-cols-2'),
    'Two column layout for tablet');

test('Desktop layout (> 1024px)',
    indexHtml.includes('lg:grid-cols-3'),
    'Three column layout for desktop');

test('Responsive navigation',
    indexHtml.includes('md:hidden') && indexHtml.includes('md:flex'),
    'Navigation has responsive classes for mobile/desktop');

test('Hamburger menu for mobile',
    indexHtml.includes('id="nav-toggle"') && 
    indexHtml.includes('id="mobile-menu"'),
    'Hamburger menu and mobile menu exist');

test('Responsive typography',
    indexHtml.includes('text-4xl') && 
    indexHtml.includes('md:text-5xl') &&
    indexHtml.includes('lg:text-6xl'),
    'Typography scales responsively');

test('Responsive images',
    indexHtml.includes('w-32') && indexHtml.includes('md:w-40'),
    'Images have responsive sizing classes');

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`✓ Passed: ${passCount}`);
console.log(`✗ Failed: ${failCount}`);

if (failCount === 0) {
    console.log('\n🎉 All tests passed! Core functionality is working correctly.');
    console.log('\n✅ Checkpoint 7 Complete');
    process.exit(0);
} else {
    console.log('\n⚠️  Some tests failed. Please review the failures above.');
    console.log('\n❌ Checkpoint 7 Incomplete');
    process.exit(1);
}
