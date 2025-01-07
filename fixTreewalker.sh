#!/bin/bash

# File path to the JSON file
jsonFilePath="./node_modules/@rollup/pluginutils/node_modules/estree-walker/package.json"

# Create the new exports structure
newExports='{
  "./package.json": "./package.json",
  ".": {
    "types": "./types/index.d.ts",
    "import": "./src/index.js",
    "require": "./src/index.js"
  }
}'

# Check if the JSON file exists
if [ -f "$jsonFilePath" ]; then
  # Update the 'exports' section in the JSON file using jq
  jq --argjson exports "$newExports" '.exports = $exports' "$jsonFilePath" > "${jsonFilePath}.tmp" && mv "${jsonFilePath}.tmp" "$jsonFilePath"
  echo "Updated 'exports' section in $jsonFilePath"
else
  echo "File not found: $jsonFilePath"
  exit 1
fi
