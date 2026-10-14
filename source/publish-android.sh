#!/bin/bash
# Publishes a signed, verified APK: releases/ keeps only the latest; build-pages.sh copies it to site/android/
# and writes android/version.json (version, notes, size, SHA-256) for Check for updates.
#   ./publish-android.sh path/to/signed.apk
set -e
cd /home/claude/dwgtest
APK="$1"; [ -f "$APK" ] || { echo "no APK at $APK"; exit 1; }
NAME=$(python3 -c "import json;print(json.load(open('app-version.json'))['name'])")
rm -f releases/*.apk
cp "$APK" "releases/TesseractCAD-$NAME.apk"
python3 -c "import json;d=json.load(open('app-version.json'));json.dump({k:d[k] for k in ('name','code','date','notes')},open('releases/release.json','w'),indent=2)"
./build-pages.sh >/dev/null
cat site/android/version.json
