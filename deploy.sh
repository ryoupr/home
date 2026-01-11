#!/bin/bash

# Save development index.html
echo "Saving development index.html..."
cp index.html index.html.dev

# Build the project
echo "Building project..."
npm run build

# Clean old assets before copying new ones
echo "Cleaning old assets..."
rm -rf assets/

# Copy dist contents to root for GitHub Pages
echo "Copying build files..."
cp -r dist/* .

# Restore development index.html
echo "Restoring development index.html..."
mv index.html.dev index.html

# Add and commit
echo "Committing changes..."
git add .
git commit -m "Deploy React app to GitHub Pages"

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main

echo "✅ Deployment complete!"
