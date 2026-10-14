#!/bin/bash
# aapt2 → javac → d8 → zipalign, no Gradle. Output in out/: release-unsigned.apk (to be signed with the release key),
# test.apk (debuggable, throwaway key, for the emulator test only).
set -euo pipefail
SDK=${ANDROID_HOME:-/usr/local/lib/android/sdk}
BT=$SDK/build-tools/36.0.0
JAR=$SDK/platforms/android-36/android.jar
VNAME=$(sed -n 1p version.txt); VCODE=$(sed -n 2p version.txt)
rm -rf build out && mkdir -p build/classes build/dex out
"$BT/aapt2" compile --dir android/res -o build/res.zip
link() { "$BT/aapt2" link -o "$1" -I "$JAR" --manifest android/AndroidManifest.xml -A assets build/res.zip \
  --min-sdk-version 26 --target-sdk-version 36 --version-code "$VCODE" --version-name "$VNAME" ${2:-}; }
link build/release-base.apk
link build/test-base.apk --debug-mode
javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$JAR" -d build/classes $(find android/src -name '*.java')
"$BT/d8" --release --min-api 26 --lib "$JAR" --output build/dex $(find build/classes -name '*.class')
for v in release test; do
  cp build/$v-base.apk build/$v-unaligned.apk
  (cd build/dex && zip -q -j ../$v-unaligned.apk classes.dex)
  "$BT/zipalign" -p -f 4 build/$v-unaligned.apk out/$v-unsigned.apk
done
"$BT/zipalign" -c -p 4 out/release-unsigned.apk && echo "zipalign ok" > out/build-report.txt
unzip -v out/release-unsigned.apk > out/release-contents.txt
"$BT/aapt2" dump badging out/release-unsigned.apk >> out/build-report.txt 2>&1 || true
keytool -genkeypair -keystore build/ci-test.p12 -storetype PKCS12 -storepass citest -keypass citest -alias t \
  -keyalg RSA -keysize 2048 -validity 2 -dname CN=ci-test >/dev/null 2>&1
"$BT/apksigner" sign --ks build/ci-test.p12 --ks-pass pass:citest --out out/test.apk out/test-unsigned.apk
rm out/test-unsigned.apk
ls -la out
