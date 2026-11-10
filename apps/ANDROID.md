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

Connect one physical Android phone with USB debugging enabled, then run:

```powershell
npm run tauri:android:dev
```

The command installs and opens the app directly on the connected phone. It
does not start an emulator or open Android Studio. If more than one physical
phone is connected, disconnect all but the intended phone before running it.
The command runs in the terminal where it was started; it does not open a
separate terminal window.

### Connect wirelessly

On Android 11 or later, connect the phone and computer to the same Wi-Fi
network, then enable **Developer options > Wireless debugging** on the phone.
Choose **Pair device with pairing code** and use the pairing address and port
shown in that pairing dialog:

```powershell
adb pair <phone-ip>:<pairing-port>
```

Enter the pairing code when ADB prompts for it. Then return to the main
**Wireless debugging** screen and use the separate IP address and port shown
there to connect:

```powershell
adb connect <phone-ip>:<wireless-debugging-port>
adb devices -l
```

Confirm the phone appears with status `device`, then run
`npm run tauri:android:dev`. The emulator may remain open; when a physical
phone is connected, the launcher selects it with `ANDROID_SERIAL` so the
Tauri CLI does not mistake the wireless ADB serial for an emulator profile.

To use an emulator intentionally, pass its profile:

```powershell
npm run tauri:android:dev -- --emulator Medium_Phone_API_37.0 --host 192.168.137.1
```

An already running emulator is used only when explicitly selected with
`--emulator`. If no phone is connected and no emulator is explicitly selected,
the command exits with instructions instead of opening an emulator.

Android defaults to a production frontend without HMR, preventing code changes
from reloading a running simulation. The frontend is built when the command
starts, so restart the command after changing frontend code. To opt into
development with Fast Refresh, pass `--hot`:

```powershell
npm run tauri:android:dev -- --hot --host 192.168.137.1
```

Fast Refresh may reload the running simulation when files change. Successful
`GET /api/... 200` lines are normal data requests and can still appear in the
terminal; they do not mean the page reloaded.

For a physical phone, keep it on the same Wi-Fi network as the computer, or use
USB debugging with ADB reverse. Check the connected device before running:

```powershell
adb devices -l
npm run tauri:android:dev -- --host 192.168.137.1
```

The command starts the Next.js and Python servers on the computer. Traffic
stays on your local network; the app is not published to the internet.
Allow the development server through Windows Firewall if prompted. Android
Studio can be opened intentionally instead with:

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