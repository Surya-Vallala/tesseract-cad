#!/bin/bash
# Google's apksigner checks the release APK signed outside GitHub.
SDK=${ANDROID_HOME:-/usr/local/lib/android/sdk}; BT=$SDK/build-tools/36.0.0
mkdir -p out
for f in signed/*.apk; do
  { echo "== $f"; "$BT/apksigner" verify --verbose --print-certs --min-sdk-version 26 "$f" && echo "VERIFY OK" || echo "VERIFY FAILED";
    "$BT/zipalign" -c -p 4 "$f" && echo "ALIGN OK" || echo "ALIGN FAILED";
    "$BT/aapt2" dump badging "$f" | head -4; } >> out/verify.txt 2>&1
done
cat out/verify.txt
