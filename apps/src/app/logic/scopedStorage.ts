/**
 * Scoped Storage untuk isolasi data antar akun pengguna Google.
 * Menghindari data game, misi, diamond, atau snapshot bocor antar akun di browser atau Tauri yang sama.
 * Prefix format: `neo:{uid}:{key}`
 */

export interface ScopedStorageOptions {
    prefix?: string;
}

const GLOBAL_NON_USER_KEYS = new Set([
    'app_language',
    'neosantara_theme',
    'neosantara_map_display_settings',
    'neosantara_music_volume',
    'neosantara_sfx_volume',
]);

let currentActiveUid: string | null = null;
let sessionEpoch = 0;

export function getSessionEpoch(): number {
    return sessionEpoch;
}

export function isSessionCurrent(epoch: number): boolean {
    return epoch === sessionEpoch;
}

export function getCurrentActiveUid(): string | null {
    return currentActiveUid;
}

export function getScopedKey(key: string, explicitUid?: string | null): string {
    if (GLOBAL_NON_USER_KEYS.has(key)) {
        return key;
    }
    const uid = explicitUid ?? currentActiveUid;
    if (!uid) {
        return `neo:guest:${key}`;
    }
    return `neo:${uid}:${key}`;
}

export function isUserScopedKey(fullKey: string): boolean {
    return fullKey.startsWith('neo:');
}

/**
 * Migrasi satu kali: key lama tanpa prefix di localStorage dipindahkan ke namespace UID pertama yang login,
 * lalu key lama dihapus agar tidak bocor atau menyalin ke akun kedua.
 */
export function migrateLegacyKeysToUser(uid: string): void {
    if (typeof window === 'undefined' || !uid) return;
    const migrationFlagKey = `neo:${uid}:__legacy_migrated`;
    try {
        if (window.localStorage.getItem(migrationFlagKey) === '1') {
            return;
        }

        const keysToMove: Array<{ oldKey: string; value: string }> = [];
        for (let i = 0; i < window.localStorage.length; i++) {
            const k = window.localStorage.key(i);
            if (!k) continue;
            // Abaikan jika sudah ber-prefix neo: atau merupakan konfigurasi global non-user
            if (k.startsWith('neo:') || GLOBAL_NON_USER_KEYS.has(k) || k.startsWith('firebase:')) {
                continue;
            }
            const val = window.localStorage.getItem(k);
            if (val !== null) {
                keysToMove.push({ oldKey: k, value: val });
            }
        }

        keysToMove.forEach(({ oldKey, value }) => {
            const scopedK = `neo:${uid}:${oldKey}`;
            window.localStorage.setItem(scopedK, value);
            window.localStorage.removeItem(oldKey);
        });

        window.localStorage.setItem(migrationFlagKey, '1');
    } catch (e) {
        console.warn('Gagal memigrasikan key legacy ke user namespace:', e);
    }
}

/**
 * Membersihkan seluruh state memori runtime, window globals, dan cache modul
 * saat pengguna logout atau berganti akun.
 */
export function purgeUserRuntimeState(): void {
    if (typeof window === 'undefined') return;

    sessionEpoch += 1;

    try {
        // 1. Bersihkan window.neosantara_*
        const win = window as any;
        win.neosantara_player_country_detail = null;
        win.neosantara_player_capital = null;
        win.neosantara_player_attack = null;
        win.neosantara_annexed_countries = {};
        win.neosantara_country_color_overrides = {};
        win.neosantara_city_owner = {};
        win.neosantara_province_religion_overrides = {};
        win.neosantara_province_ideology_overrides = {};
        win.neosantara_diplomacy_map_colors = {};
        win.__neosantara_active_sync_save = null;

        // 2. Bersihkan sessionStorage active session sync
        window.sessionStorage.removeItem('neosantara_active_session_sync');
        window.sessionStorage.removeItem('presiden_simulator_load_save');
        window.sessionStorage.removeItem('presiden_simulator_new_game');
        window.sessionStorage.removeItem('presiden_simulator_returning_from_dialog');
        window.sessionStorage.removeItem('dialog-terbuka-notification');
        window.sessionStorage.removeItem('programNuklirActive');
        window.sessionStorage.removeItem('program_nuklir_modal_open');
        window.sessionStorage.removeItem('icbm_detail_open');
        window.sessionStorage.removeItem('perang_nuklir_detail_open');
    } catch (e) {
        console.warn('Error saat membersihkan user runtime state:', e);
    }
}

/**
 * Dipanggil saat pengguna login, logout, atau berganti UID akun.
 */
export function setActiveUserScope(newUid: string | null): void {
    if (currentActiveUid !== newUid) {
        purgeUserRuntimeState();
        if (newUid) {
            migrateLegacyKeysToUser(newUid);
        }
    }
    currentActiveUid = newUid;
}

/**
 * Helper pembungkus scoped localStorage
 */
export const scopedLocalStorage = {
    getItem(key: string): string | null {
        if (typeof window === 'undefined') return null;
        return window.localStorage.getItem(getScopedKey(key));
    },
    setItem(key: string, value: string): void {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem(getScopedKey(key), value);
    },
    removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        window.localStorage.removeItem(getScopedKey(key));
    },
};

/**
 * Helper pembungkus scoped sessionStorage
 */
export const scopedSessionStorage = {
    getItem(key: string): string | null {
        if (typeof window === 'undefined') return null;
        return window.sessionStorage.getItem(getScopedKey(key));
    },
    setItem(key: string, value: string): void {
        if (typeof window === 'undefined') return;
        window.sessionStorage.setItem(getScopedKey(key), value);
    },
    removeItem(key: string): void {
        if (typeof window === 'undefined') return;
        window.sessionStorage.removeItem(getScopedKey(key));
    },
};
