#!/bin/bash
# Bundles the parse worker (worker-src.js + dxf-parser.js + libredwg-web) into out/cad-worker.js.
# out/libredwg-web.wasm is the npm package's wasm with initial memory patched to 256 MB (patchmem.mjs).
set -e
cd /home/claude/dwgtest
npx esbuild worker-src.js --bundle --format=esm --minify --platform=browser --external:module --outfile=out/cad-worker.js
