#!/bin/bash
# Prepares the Android build inputs in /home/claude/apk-ci (branch apk-ci of the GitHub repo):
#   android/  native shell sources (manifest, Java, icons)    assets/www/  the web app, bundled for offline use
# GitHub Actions (ci/build.sh) compiles it with the official Android SDK and returns an unsigned, aligned APK.
set -e
cd /home/claude/dwgtest
./build.sh >/dev/null
OUT=/home/claude/apk-ci
VNAME=$(python3 -c "import json;print(json.load(open('app-version.json'))['name'])")
VCODE=$(python3 -c "import json;print(json.load(open('app-version.json'))['code'])")
rm -rf $OUT/android $OUT/assets && mkdir -p $OUT/assets/www/fonts
cp -r android $OUT/android
W=$OUT/assets/www
{
cat <<'HEAD'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#161618">
<style>body{margin:0}[hidden]{display:none!important}</style>
</head>
<body>
HEAD
cat out/tesseract-cad-tools.html
echo '</body>'; echo '</html>'
} > $W/index.html
cp out/cad-worker.js out/libredwg-web.wasm $W/
cp brand/logo-ink-dark.png brand/logo-ink-light.png $W/
cp fonts/*.woff2 fonts/fonts.css fonts/LICENSE-* $W/fonts/
printf '%s\n%s\n' "$VNAME" "$VCODE" > $OUT/version.txt
echo "prepared Android build $VNAME ($VCODE) in $OUT"; du -sh $OUT/assets
