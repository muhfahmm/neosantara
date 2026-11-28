'use client';

import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import {
    browserLocalPersistence,
    getAuth,
    GoogleAuthProvider,
    onAuthStateChanged,
    setPersistence,
    signInWithCredential,
    signInWithPopup,
    signOut,
    type Auth,
    type Unsubscribe,
    type User,
} from 'firebase/auth';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { setGameStateActiveUser } from '@/app/logic/gameStateStorage';

const desktopGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_DESKTOP_CLIENT_ID?.trim() ||
    process.env.GOOGLE_DESKTOP_CLIENT_ID?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_PLAY_GAMES_WEB_CLIENT_ID?.trim() || '';

const desktopGoogleClientSecret = process.env.NEXT_PUBLIC_GOOGLE_DESKTOP_CLIENT_SECRET?.trim() ||
    process.env.GOOGLE_DESKTOP_CLIENT_SECRET?.trim() || '';

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

    // 1. Cabang Tauri Desktop (Windows .exe / macOS / Linux)
    if (isTauri() && typeof navigator !== 'undefined' && !/android/i.test(navigator.userAgent)) {
        if (!desktopGoogleClientId) {
            throw new Error('Konfigurasi Google Desktop Client ID belum diatur. Harap set NEXT_PUBLIC_GOOGLE_DESKTOP_CLIENT_ID atau GOOGLE_DESKTOP_CLIENT_ID.');
        }

        try {
            const result = await invoke<{ idToken: string; accessToken?: string }>('google_oauth_login', {
                clientId: desktopGoogleClientId,
                clientSecret: desktopGoogleClientSecret || undefined,
            });

            if (!result || !result.idToken) {
                throw new Error('Gagal menerima token identitas dari autentikasi Google.');
            }

            const credential = GoogleAuthProvider.credential(result.idToken, result.accessToken);
            await signInWithCredential(auth, credential);
            return;
        } catch (error) {
            console.error('Desktop Google Sign-In error:', error);
            const msg = error instanceof Error ? error.message : String(error || '');
            if (msg.toLowerCase().includes('timeout') || msg.toLowerCase().includes('habis')) {
                throw new Error('Waktu login di browser telah habis (timeout 3 menit). Silakan coba lagi.');
            }
            if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('dibatalkan')) {
                throw new Error('Proses login dibatalkan oleh pengguna.');
            }
            throw new Error(`Login Google Desktop gagal: ${msg}`);
        }
    }

    // 2. Cabang Web Browser biasa (signInWithPopup standar)
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
}

export async function signOutFromFirebase(): Promise<void> {
    if (isTauri() && typeof navigator !== 'undefined' && !/android/i.test(navigator.userAgent)) {
        try {
            await invoke('google_oauth_logout');
        } catch (e) {
            console.warn('Failed to clean stored desktop token:', e);
        }
    }
    await signOut(getFirebaseAuth());
    setGameStateActiveUser(null);
}

export class AuthRequiredError extends Error {
    constructor(message: string = 'Silakan login dengan Google sebelum mengakses save game.') {
        super(message);
        this.name = 'AuthRequiredError';
    }
}

export function isAuthRequiredError(error: unknown): boolean {
    if (error instanceof AuthRequiredError) return true;
    if (typeof error === 'object' && error !== null && 'name' in error && (error as { name: string }).name === 'AuthRequiredError') return true;
    const msg = error instanceof Error ? error.message : String(error || '');
    return msg.toLowerCase().includes('login dengan google') || msg.toLowerCase().includes('sebelum mengakses save');
}

export async function checkIsUserAuthenticated(): Promise<boolean> {
    if (isTauri() && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) {
        try {
            const state = await invoke<{ uid?: string; idToken?: string }>('play_games_id_token', {
                config: getNativePlayGamesAuthConfig(),
            });
            return Boolean(state.uid && state.idToken);
        } catch {
            return false;
        }
    }
    if (!isFirebaseConfigured) return false;
    try {
        const auth = getFirebaseAuth();
        if (auth.currentUser) return true;

        // Coba pulihkan sesi Desktop Tauri jika ada token di OS Keychain
        if (isTauri() && typeof navigator !== 'undefined' && !/android/i.test(navigator.userAgent) && desktopGoogleClientId) {
            try {
                const refreshed = await invoke<{ idToken: string; accessToken?: string }>('google_oauth_refresh', {
                    clientId: desktopGoogleClientId,
                    clientSecret: desktopGoogleClientSecret || undefined,
                });
                if (refreshed && refreshed.idToken) {
                    const credential = GoogleAuthProvider.credential(refreshed.idToken, refreshed.accessToken);
                    const userCredential = await signInWithCredential(auth, credential);
                    if (userCredential?.user) {
                        setGameStateActiveUser(userCredential.user.uid);
                        return true;
                    }
                }
            } catch (e) {
                // Refresh token tidak ada atau kadaluarsa, lanjutkan ke onAuthStateChanged biasa
            }
        }

        const user = await new Promise<User | null>((resolve) => {
            const timeout = setTimeout(() => resolve(null), 1500);
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                clearTimeout(timeout);
                unsubscribe();
                resolve(currentUser);
            }, () => {
                clearTimeout(timeout);
                unsubscribe();
                resolve(null);
            });
        });
        return Boolean(user);
    } catch {
        return false;
    }
}

export async function getFirebaseAccessToken(): Promise<{ uid: string; token: string }> {
    if (isTauri() && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)) {
        const state = await invoke<{ uid?: string; idToken?: string }>('play_games_id_token', {
            config: getNativePlayGamesAuthConfig(),
        });
        if (!state.uid || !state.idToken) {
            throw new AuthRequiredError('Silakan login dengan Google sebelum mengakses save game.');
        }
        setGameStateActiveUser(state.uid);
        return { uid: state.uid, token: state.idToken };
    }

    const auth = getFirebaseAuth();
    const user = auth.currentUser ?? await new Promise<User | null>((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            unsubscribe();
            resolve(currentUser);
        }, (error) => {
            unsubscribe();
            reject(error);
        });
    });
    if (!user) {
        throw new AuthRequiredError('Silakan login dengan Google sebelum mengakses save game.');
    }
    setGameStateActiveUser(user.uid);
    return { uid: user.uid, token: await user.getIdToken() };
}

export function isGooglePopupCancellation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) return false;
    return (error as { code: string }).code === 'auth/popup-closed-by-user' ||
        (error as { code: string }).code === 'auth/cancelled-popup-request';
}

export async function fetchWithFirebaseAuth(
    input: RequestInfo | URL,
    init: RequestInit = {},
): Promise<Response> {
    const { token } = await getFirebaseAccessToken();
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
}
