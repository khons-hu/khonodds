# Khonodds for Android

A small Trusted Web Activity (TWA) package for https://market-watch-khonsu.vercel.app/. The web app is rendered by a supported installed browser, not a bundled WebView. Web changes arrive without reinstalling the APK.

## Requirements and limits

- Android 8.0 or newer and a current browser with TWA support (Chrome recommended).
- Internet required for first load and server data. This APK does not bundle the website or compiler runtimes.
- Browser storage remains in that browser's website profile. Clearing site data also removes local app data. Export backups first.
- Browser permissions control website notifications. This package adds no separate notification service or background polling.
- No tracking SDK or account system. Only Internet permission is requested by this package.
- If the browser cannot verify the site/app association, it opens a browser tab with its toolbar instead.

## Build

Install JDK 17+ and Android SDK 36 with build-tools 35.0.0. Set `ANDROID_HOME` or an untracked `local.properties` containing `sdk.dir`.

```sh
./gradlew assembleDebug
# For a release, use your own private signing properties file outside this repo:
KHONSU_SIGNING_PROPERTIES=/private/path/signing.properties ./gradlew assembleRelease
```

Properties: `storeFile`, `storePassword`, `keyAlias`, `keyPassword`. Never commit this file or the keystore. Preserve your key to update installed APKs. If using your own key, update the website's `.well-known/assetlinks.json` with its public SHA-256 certificate fingerprint.

Application ID: `dev.khonsu.khonodds`. Public signing certificate SHA-256: `CA:AE:73:CC:1D:AB:58:DC:1A:04:6C:B7:E4:B8:FB:D2:10:02:56:4E:E3:55:0B:FD:B5:06:2A:3E:B0:97:FE:E6`.

The launcher uses Google's [Android Browser Helper](https://github.com/GoogleChrome/android-browser-helper), Apache-2.0. Original project code is MIT. This is an early sideload build, not a Google Play release. Android device testing status is recorded with the APK download.
