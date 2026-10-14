#!/bin/bash
# Checks the published Android release on the website: version.json, the APK it names (size + SHA-256 must match), CORS.
mkdir -p out; B=https://surya-vallala.github.io/tesseract-cad/android
{
  echo "== headers version.json"; curl -sSI "$B/version.json?ci=$RANDOM" | grep -iE "^HTTP|access-control|content-type|cache-control"
  echo "== version.json"; curl -sS "$B/version.json?ci=$RANDOM" | tee /tmp/v.json
  URL=$(python3 -c "import json;print(json.load(open('/tmp/v.json'))['apk']['url'])")
  WANT=$(python3 -c "import json;d=json.load(open('/tmp/v.json'))['apk'];print(d['sha256'], d['size'])")
  curl -sSL -o /tmp/app.apk "$URL"
  GOT="$(sha256sum /tmp/app.apk | cut -d' ' -f1) $(stat -c %s /tmp/app.apk)"
  echo; echo "== apk  want: $WANT"; echo "== apk  got:  $GOT"; [ "$WANT" = "$GOT" ] && echo "APK MATCHES" || echo "APK MISMATCH"
  SDK=${ANDROID_HOME:-/usr/local/lib/android/sdk}; "$SDK/build-tools/36.0.0/apksigner" verify --print-certs /tmp/app.apk | head -3
  echo "== download page"; curl -sS "$B/" | grep -o "<h1>[^<]*</h1>\|Download the app (APK)"
} > out/live.txt 2>&1
cat out/live.txt
