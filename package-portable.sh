#!/bin/bash

# Portable Effect - ZIP Packaging Script
# Creates a distribution-ready effect ZIP

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

OUTPUT_FILE="effect.zip"
TEMP_FILE=".effect.zip.partial"

echo "Packaging effect..."

# Archive into a temporary file and replace the output only after a
# successful run, so a failure (missing effect directory, missing zip,
# interrupted write) preserves an existing effect.zip instead of destroying
# it — matching package-portable.mjs.
echo "  → Creating ZIP archive..."
rm -f "$TEMP_FILE"
trap 'rm -f "$TEMP_FILE"' EXIT

cd effect
zip -r "../$TEMP_FILE" . -x "*.DS_Store" -x "__MACOSX/*"
cd ..
mv "$TEMP_FILE" "$OUTPUT_FILE"
trap - EXIT

# Show result
FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
echo ""
echo "Effect packaged: $OUTPUT_FILE ($FILE_SIZE)"
echo ""
echo "Contents:"
unzip -l "$OUTPUT_FILE"
echo ""
echo "To import: Open Noisedeck → file → import effect from zip → Select $OUTPUT_FILE"
