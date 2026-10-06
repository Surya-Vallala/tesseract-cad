#!/bin/bash
# Builds the GitHub Pages site in ./site from the app sources.
set -e
cd /home/claude/dwgtest
./build.sh >/dev/null
VER=$(date -u +%Y%m%d%H%M)
{
cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1c1b18">
<meta name="description" content="Tesseract CAD Tools — open, measure and edit DWG/DXF drawings on your phone.">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<style>body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
HEAD
cat out/tesseract-cad-tools.html
cat <<'TAIL'
<script>if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(function () {});</script>
</body>
</html>
TAIL
} > site/index.html
sed "s/__VERSION__/$VER/" sw-template.js > site/sw.js
cp out/cad-worker.js out/libredwg-web.wasm site/
cp readme-pages.md site/README.md
touch site/.nojekyll
cp /usr/share/common-licenses/GPL-3 site/LICENSE
mkdir -p site/source/src
cp src/* site/source/src/
cp worker-src.js dxf-parser.js patchmem.mjs build.sh build-pages.sh sw-template.js make-icons.py aci.txt package.json package-lock.json site/source/
echo "built site v$VER"; ls -la site
