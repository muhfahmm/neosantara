import {
    getScopedKey,
    setActiveUserScope,
    purgeUserRuntimeState,
} from './scopedStorage';

export type GameStateSnapshot = Record<string, string>;

const NON_GAME_STORAGE_KEYS = new Set([
    'app_language',
    'neosantara_theme',
    'neosantara_map_display_settings',
    'neosantara_music_volume',
    'neosantara_sfx_volume',
]);

const gameState = new Map<string, string>();
let activeUserId: string | null = null;
const migratedKeys = new Set<string>();

function isGameStateKey(key: string): boolean {
    const normalizedKey = key.toLowerCase();
    return !NON_GAME_STORAGE_KEYS.has(key) &&
        !normalizedKey.startsWith('firebase:') &&
        !normalizedKey.includes('auth') &&
        !normalizedKey.includes('token');
}

/**
 * Pindahkan data localStorage lama ke gameState di memori tanpa langsung menghapusnya.
 * Data di localStorage baru dibersihkan secara aman setelah server PostgreSQL mengonfirmasi
 * bahwa save/sinkronisasi berhasil disimpan.
 */
function migrateLegacyGameState(): void {
    if (typeof window === 'undefined') return;

    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
        const key = window.localStorage.key(index);
        if (!key || !isGameStateKey(key)) continue;
        const value = window.localStorage.getItem(key);
        if (value !== null) {
            gameState.set(key, value);
            migratedKeys.add(key);
        }
    }
}

/**
 * Panggil setelah proses simpan ke PostgreSQL berhasil (status 200 OK).
 * Membersihkan data lama di localStorage secara aman.
 */
export function purgeMigratedLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
        migratedKeys.forEach(key => {
            window.localStorage.removeItem(key);
        });
        migratedKeys.clear();
    } catch (e) {
        console.warn('Gagal membersihkan cache localStorage lawas:', e);
    }
}

export const gameStateStorage = {
    get length(): number {
        return gameState.size;
    },

    key(index: number): string | null {
        return [...gameState.keys()][index] ?? null;
    },

    keys(): string[] {
        return [...gameState.keys()];
    },

    getItem(key: string): string | null {
        return gameState.get(String(key)) ?? null;
    },

    setItem(key: string, value: string): void {
        gameState.set(String(key), String(value));
    },

    removeItem(key: string): void {
        gameState.delete(String(key));
    },

    clear(): void {
        gameState.clear();
    },

    snapshot(): GameStateSnapshot {
        return Object.fromEntries(gameState);
    },

    restore(snapshot: GameStateSnapshot): void {
        gameState.clear();
        Object.entries(snapshot).forEach(([key, value]) => {
            if (isGameStateKey(key) && typeof value === 'string') {
                gameState.set(key, value);
            }
        });
    },

    /**
     * Reset ke baseline baru ketika memuat save game tanpa snapshot
     */
    resetToBaseline(): void {
        gameState.clear();
        gameState.set('player_diamonds', '500');
        gameState.set('neosantara_player_xp', '0');
    },
};

export function setGameStateActiveUser(userId: string | null): void {
    if (activeUserId !== userId) {
        gameStateStorage.clear();
        purgeUserRuntimeState();
        setActiveUserScope(userId);
    }
    activeUserId = userId;
}

migrateLegacyGameState();
