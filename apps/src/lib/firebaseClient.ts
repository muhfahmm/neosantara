'use client';

import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
    browserLocalPersistence,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    setPersistence,
    signInWithPopup,
    signOut,
    type Auth,
    type Unsubscribe,
    type User,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

const androidFirebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_ANDROID_APP_ID?.trim();
const androidFirebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_ANDROID_API_KEY?.trim();
const playGamesServerClientId = process.env.NEXT_PUBLIC_FIREBASE_PLAY_GAMES_WEB_CLIENT_ID?.trim();
const playGamesProjectId = process.env.NEXT_PUBLIC_PLAY_GAMES_PROJECT_ID?.trim();

export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey?.trim() &&
    firebaseConfig.authDomain?.trim() &&
    firebaseConfig.projectId?.trim() &&
    firebaseConfig.appId?.trim()
);

export const isPlayGamesConfigured = Boolean(
    isFirebaseConfigured &&
    firebaseConfig.messagingSenderId?.trim() &&
    androidFirebaseAppId &&
    androidFirebaseApiKey &&
    playGamesServerClientId &&
    playGamesProjectId
);

export interface NativePlayGamesAuthConfig {
    firebaseApiKey: string;
    firebaseAndroidAppId: string;
    firebaseProjectId: string;
    firebaseMessagingSenderId: string;
    serverClientId: string;
    playGamesProjectId: string;
}

export function getNativePlayGamesAuthConfig(): NativePlayGamesAuthConfig {
    const { projectId, messagingSenderId } = firebaseConfig;
    const webAppId = androidFirebaseAppId;

    if (
        !projectId?.trim() ||
        !messagingSenderId?.trim() ||
        !webAppId ||
        !androidFirebaseApiKey ||
        !playGamesServerClientId ||
        !playGamesProjectId
    ) {
        throw new Error('Firebase Android and Play Games configuration is incomplete.');
    }

    return {
        firebaseApiKey: androidFirebaseApiKey,
        firebaseAndroidAppId: webAppId,
        firebaseProjectId: projectId,
        firebaseMessagingSenderId: messagingSenderId,
        serverClientId: playGamesServerClientId,
        playGamesProjectId,
    };
}

function getFirebaseAuth(): Auth {
    if (!isFirebaseConfigured) {
        throw new Error('Firebase client configuration is incomplete.');
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return getAuth(app);
}

export function observeFirebaseAuth(
    onUserChanged: (user: User | null) => void,
    onError: (error: Error) => void,
): Unsubscribe {
    try {
        return onAuthStateChanged(getFirebaseAuth(), onUserChanged, onError);
    } catch (error) {
        const authError = error instanceof Error ? error : new Error(String(error));
        queueMicrotask(() => onError(authError));
        return () => {};
    }
}

export async function signInWithGoogle(): Promise<void> {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
}

export async function signOutFromFirebase(): Promise<void> {
    await signOut(getFirebaseAuth());
}
