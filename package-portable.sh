#!/bin/bash

# Portable Effect - ZIP Packaging Script
# Creates a distribution-ready effect ZIP

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_FILE="effect.zip"
TEMP_DIR="effect"

echo "Packaging effect..."

# Clean up any existing output
rm -f "$OUTPUT_FILE"

# Create ZIP directly from effect directory
echo "  → Creating ZIP archive..."
cd effect
zip -r "../$OUTPUT_FILE" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..

# Show result
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo ""
echo "Effect packaged: $OUTPUT_FILE ($FILE_SIZE)"
echo ""
echo "Contents:"
unzip -l "$OUTPUT_FILE"
echo ""
echo "To import: Open Noisedeck → file → import effect from zip → Select $OUTPUT_FILE"
