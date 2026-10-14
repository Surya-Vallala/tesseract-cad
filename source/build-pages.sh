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
<meta name="theme-color" content="#161618">
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
TAIL
APKNAME=$(cd releases 2>/dev/null && ls *.apk 2>/dev/null | tail -1)
echo '<script>'; sed "s/__VERSION__/$VER/; s/__APK__/$APKNAME/" pages-extra.js; echo '</script>'
echo '</body>'; echo '</html>'
} > site/index.html
sed "s/__VERSION__/$VER/" sw-template.js > site/sw.js
cp out/cad-worker.js out/libredwg-web.wasm site/
cp readme-pages.md site/README.md
cp manifest.webmanifest 404.html site/
cp brand/logo-ink-dark.png brand/logo-ink-light.png site/
mkdir -p site/fonts && cp fonts/*.woff2 fonts/fonts.css fonts/LICENSE-* site/fonts/
# Android app: version.json (read by Check for updates) and the latest APK from releases/
rm -rf site/android && mkdir -p site/android
python3 make-version-json.py "$VER" > site/android/version.json
for f in releases/*.apk; do [ -e "$f" ] && cp "$f" site/android/; done
python3 make-android-page.py site/android/version.json > site/android/index.html
python3 brand/make-brand-icons.py site >/dev/null
touch site/.nojekyll
cp /usr/share/common-licenses/GPL-3 site/LICENSE
mkdir -p site/source/src
cp src/* site/source/src/
rm -rf site/source/android site/source/android-ci; cp -r android android-ci site/source/ # the Android shell (the signing key lives elsewhere and is never published)
cp app-version.json make-version-json.py make-android-page.py sign-apk.py build-android.sh publish-android.sh site/source/
cp brand/make-brand-icons.py build-worker.sh pages-extra.js manifest.webmanifest 404.html worker-src.js dxf-parser.js patchmem.mjs build.sh build-pages.sh sw-template.js make-icons.py aci.txt package.json package-lock.json site/source/
echo "built site v$VER"; ls -la site
