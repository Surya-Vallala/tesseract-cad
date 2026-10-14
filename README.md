# apk-ci — Android build of Tesseract CAD

This branch holds only the inputs for the Android app build:

- `android/` — the native shell (manifest, Java, launcher icons)
- `assets/www/` — the web app bundled for offline use (generated from the app sources)
- `ci/` — build and emulator-test scripts run by `.github/workflows/android.yml`

GitHub Actions builds an unsigned release APK and a debuggable test APK, runs the test APK on an emulator,
and pushes the results to the `apk-out` branch. The release APK is signed with the Tesseract Studio release
key outside GitHub (this repository is public) and published to the website's `android/` folder.
