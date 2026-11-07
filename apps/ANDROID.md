# Android development (local, no domain)

Android development uses the same local Next.js app and Python dialog API as
`npm run dev`. The Android app connects to the development server on your
computer over the local network; no public domain or hosting is needed.

## Prerequisites

- Node.js dependencies installed with `npm install` from the repository root.
- Android Studio with the Android SDK, NDK, and a compatible JDK installed.
- Rust Android targets installed for the device/emulator architectures.
- An Android emulator, or a phone connected over USB with USB debugging enabled.

Initialize the Android project once from the repository root:

```powershell
npm run tauri:android:prepare
```

Run on an Android device or emulator:

```powershell
npm run tauri:android:dev
```

On Windows, Tauri automatically selects a network address for the development
server. Tauri's optional device argument is for an Android emulator name, not
the serial shown by `adb devices`. To test on a physical phone, close running
emulators, confirm the phone is the only connected device, and omit the device
argument:

```powershell
adb devices -l
npm run tauri:android:dev
```

The command starts the Next.js and Python servers on the computer. Traffic
stays on your local network; the app is not published to the internet.
For a physical phone, keep it on the same Wi-Fi network as the computer and
allow the development server through Windows Firewall if prompted. Android
Studio can be opened instead with:

```powershell
npm run tauri:android:dev -- --open
```

The app's `/api` requests go through the Next.js server; the Python API remains
bound to the computer and does not need to be exposed separately.

Use JDK 21 for Android builds with the project's Gradle version. If Android
Studio's bundled Java is newer, install JDK 21 and set it in the PowerShell
session before running the Tauri command:

```powershell
$env:JAVA_HOME = "C:\path\to\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
java -version
```

## Development APK limitation

This mode is for local development and testing. The Android app depends on the
computer's development server being running and reachable on the same network;
it is not an offline or standalone APK and will not work when that server is
stopped. The current app also has server-side Next.js API routes and local data
access, so a distributable APK needs those services and their data storage
ported or bundled for Android before `tauri android build` can produce a
standalone app. A domain is not required for either local development or a
future standalone APK.