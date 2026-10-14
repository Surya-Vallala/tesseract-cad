#!/bin/bash
# Installs the debuggable test APK on the emulator and drives the app through Chrome DevTools (ci/cdp-test.mjs).
set -x
mkdir -p out
adb install -r out/test.apk > out/install.txt 2>&1
adb logcat -c
adb shell am start -W -n co.tesseractstudio.cad/.MainActivity
sleep 12
PID=$(adb shell pidof co.tesseractstudio.cad | tr -d '\r')
echo "pid=$PID" > out/emu.txt
adb shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*' >> out/emu.txt || true
SOCK=$(adb shell cat /proc/net/unix | grep -o 'webview_devtools_remote_[0-9]*' | head -1 | tr -d '\r')
adb forward tcp:9222 localabstract:${SOCK:-webview_devtools_remote_$PID}
timeout 600 node ci/cdp-test.mjs > out/cdp-test.json 2> out/cdp-test.err || echo "cdp test failed" >> out/emu.txt
adb exec-out screencap -p > out/shot-last.png
adb logcat -d -v brief TesseractCAD:V chromium:V cr_*:V AndroidRuntime:E ActivityManager:I '*:S' > out/logcat.txt
true
