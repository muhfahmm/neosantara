This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open the `Next.js (komputer ini)` URL printed by the development server. To preview
changes on a phone or another device, connect it to the same Wi-Fi/LAN and open one
of the printed `URL untuk perangkat lain` addresses. Keep the development server
running; code and layout changes are sent to connected browsers with Fast Refresh.
If the LAN address cannot be reached, allow Node.js through the computer's private
network firewall and retry.

## Firebase Google Sign-In (Web)

1. Create a Firebase project and register a **Web app** in Firebase Console.
2. In **Authentication → Sign-in method**, enable **Google** and choose a support email.
3. In **Authentication → Settings → Authorized domains**, add `localhost` and the
   production hostname where the game will run.
4. Add `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID` to
   `apps/.env.local` using the Firebase Web app configuration. If `.env.local` does
   not exist, copy `.env.example` first.
5. Restart the Next.js server and open the paused menu's **Google / Play Games Account**
   item to test sign-in and sign-out.

The `NEXT_PUBLIC_` Firebase Web configuration is bundled into the browser and is not
a private key. Never put a Firebase service-account key in these variables or in
client code. This authenticates the player in the browser; it does not yet associate
game-save records with that account or sync saves with Google Play Games.

## Firebase Play Games Sign-In (Android Tauri)

The Play Games button uses the Android Play Games Services SDK to request a server
auth code, then exchanges it with Firebase Authentication's Play Games provider.
It is not available in a regular browser.

1. Register Android apps in Firebase for `com.presiden.simulator` and, for debug
   builds, `com.presiden.simulator.debug`. Add the SHA-1 fingerprints for the
   signing certificates. In Android Studio, open `apps/src-tauri/gen/android` and
   run the `app > Tasks > android > signingReport` Gradle task to inspect local
   signing variants.
2. In Google Play Console, configure Play Games Services for the game. Add its
   **Game Services Project ID** as `game_services_project_id` in
   `src-tauri/gen/android/app/src/main/res/values/strings.xml`.
3. Configure the Android and Game server OAuth credentials in Play Games Services.
   The Game server credential must use the same Web OAuth client ID as the Firebase
   **Play Games** sign-in provider.
4. In Firebase Authentication, enable the **Play Games** provider and enter that Web
   client ID and its client secret. Keep the secret only in Firebase Console; never
   put it in `.env.local`, Android resources, or browser code.
5. Add these values to `apps/.env.local`:
   - `NEXT_PUBLIC_FIREBASE_ANDROID_API_KEY`: `api_key.current_key` from the Firebase
     Android app configuration (it may match the Web API key).
   - `NEXT_PUBLIC_FIREBASE_ANDROID_APP_ID`: App ID from the Firebase Android app.
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase project number.
   - `NEXT_PUBLIC_FIREBASE_PLAY_GAMES_WEB_CLIENT_ID`: Game server Web OAuth client ID.
   - `NEXT_PUBLIC_PLAY_GAMES_PROJECT_ID`: Game Services Project ID from Play Console.
6. Restart Next.js and rebuild/reinstall the Android app. The manifest project ID and
   `NEXT_PUBLIC_PLAY_GAMES_PROJECT_ID` must match.

The Firebase Android App ID, Firebase project number, OAuth client ID, and Play
Games project ID are client configuration values; the OAuth client secret is not.
Signing out here signs out of Firebase on this device; Play Games platform account
selection is managed by Android. This login still does not automatically sync game
saves—save records must separately be associated with the Firebase user.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
