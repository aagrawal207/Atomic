#!/bin/bash

# Atomic Extension Build Script
# This script creates distribution packages for Firefox and Chrome

# Set variables
SRC_DIR="src"
MANIFESTS_DIR="manifests"
VERSION=$(grep -o '"version": "[^"]*"' $MANIFESTS_DIR/manifest.firefox.json | cut -d'"' -f4)
DIST_DIR="dist"
FIREFOX_DIR="$DIST_DIR/firefox"
CHROME_DIR="$DIST_DIR/chrome"
SOURCE_FILES="$SRC_DIR/index.html $SRC_DIR/styles.css $SRC_DIR/script.js"
ICONS_DIR="icons"

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$FIREFOX_DIR"
mkdir -p "$CHROME_DIR"
mkdir -p "$FIREFOX_DIR/$ICONS_DIR"
mkdir -p "$CHROME_DIR/$ICONS_DIR"

# Copy common files
echo "Copying common files..."
cp $SRC_DIR/index.html "$FIREFOX_DIR/"
cp $SRC_DIR/styles.css "$FIREFOX_DIR/"
cp $SRC_DIR/script.js "$FIREFOX_DIR/"

cp $SRC_DIR/index.html "$CHROME_DIR/"
cp $SRC_DIR/styles.css "$CHROME_DIR/"

# Copy icons if they exist
if [ -d "$ICONS_DIR" ] && [ "$(ls -A $ICONS_DIR 2>/dev/null)" ]; then
  echo "Copying icons..."
  mkdir -p "$FIREFOX_DIR/$ICONS_DIR"
  mkdir -p "$CHROME_DIR/$ICONS_DIR"
  cp -v "$ICONS_DIR"/* "$FIREFOX_DIR/$ICONS_DIR/"
  cp -v "$ICONS_DIR"/* "$CHROME_DIR/$ICONS_DIR/"
else
  echo "Warning: Icons directory not found or empty. Creating placeholder..."
  mkdir -p "$ICONS_DIR"
  echo "Please add icon files (icon16.png, icon48.png, icon128.png) to the icons directory."
fi

# Copy Firefox manifest
echo "Setting up Firefox version..."
cp $MANIFESTS_DIR/manifest.firefox.json "$FIREFOX_DIR/manifest.json"

# Copy Chrome manifest and adapt script.js
echo "Setting up Chrome version..."
cp $MANIFESTS_DIR/manifest.chrome.json "$CHROME_DIR/manifest.json"

# Replace browser.storage with chrome.storage for Chrome
sed 's/browser\.storage/chrome.storage/g' $SRC_DIR/script.js > "$CHROME_DIR/script.js"

# Create ZIP files
echo "Creating distribution packages..."
cd "$DIST_DIR"

# For Firefox: zip files inside the firefox folder
echo "Creating Firefox package (zipping contents)..."
cd firefox
zip -r "../atomic-firefox-v$VERSION.zip" .
cd ..

# For Chrome: zip the entire folder
echo "Creating Chrome package (zipping folder)..."
zip -r "atomic-chrome-v$VERSION.zip" chrome

cd ..

echo "Build completed successfully!"
echo "Firefox package: $DIST_DIR/atomic-firefox-v$VERSION.zip"
echo "Chrome package: $DIST_DIR/atomic-chrome-v$VERSION.zip"
