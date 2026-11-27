import { gameStateStorage, type GameStateSnapshot } from '@/app/logic/gameStateStorage';
import { getScopedKey, getCurrentActiveUid } from '@/app/logic/scopedStorage';

const SESSION_KEY = 'presiden_simulator_load_save';
const DATABASE_NAME = 'presiden_simulator_pending_saves';
const STORE_NAME = 'saves';
const ACTIVE_SESSION_STORE = 'active_session';
const ACTIVE_SESSION_KEY = 'current_active_session';
export type GameSaveStorageSnapshot = GameStateSnapshot;

function getScopedActiveSessionKey(): string {
    const uid = getCurrentActiveUid();
    return uid ? `active_session_${uid}` : ACTIVE_SESSION_KEY;
}

function getScopedActiveSessionSyncKey(): string {
    return getScopedKey('neosantara_active_session_sync');
}

interface SaveSummary {
    id: number;
    country_name: string;
    game_date: string;
}

interface PendingSaveMetadata extends SaveSummary {
    countryName: string;
    pendingSaveId: string;
}

interface PendingSaveRecord<T> {
    id: string;
    save: T;
}

export function captureGameSaveStorage(): GameSaveStorageSnapshot {
    return gameStateStorage.snapshot();
}

export function restoreGameSaveStorage(snapshot: GameSaveStorageSnapshot): void {
    gameStateStorage.restore(snapshot);
}

function getSaveStorageSnapshot(save: unknown): GameSaveStorageSnapshot | null {
    if (typeof save !== 'object' || save === null || !('countryDetail' in save)) return null;
    const countryDetail = save.countryDetail;
    if (typeof countryDetail !== 'object' || countryDetail === null || !('__neosantara_game_session' in countryDetail)) {
        return null;
    }
    const gameSession = countryDetail.__neosantara_game_session;
    if (typeof gameSession !== 'object' || gameSession === null) {
        return null;
    }
    const snapshot = 'gameState' in gameSession ? gameSession.gameState :
        'localStorage' in gameSession ? gameSession.localStorage : null;
    if (typeof snapshot !== 'object' || snapshot === null || Array.isArray(snapshot)) return null;
    return Object.fromEntries(
        Object.entries(snapshot).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    );
}

function openDatabase(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
        return Promise.reject(new Error('IndexedDB tidak tersedia untuk memuat save game.'));
    }

    return new Promise((resolve, reject) => {
        // Gunakan open() tanpa nomor versi spesifik terlebih dahulu
        // agar browser membuka versi tertinggi yang sudah tersimpan tanpa memicu VersionError
        const initialReq = window.indexedDB.open(DATABASE_NAME);

        initialReq.onupgradeneeded = () => {
            const db = initialReq.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(ACTIVE_SESSION_STORE)) {
                db.createObjectStore(ACTIVE_SESSION_STORE, { keyPath: 'id' });
            }
        };

        initialReq.onsuccess = () => {
            const db = initialReq.result;
            // Periksa apakah kedua object store yang diperlukan sudah ada
            const hasStores = db.objectStoreNames.contains(STORE_NAME) &&
                              db.objectStoreNames.contains(ACTIVE_SESSION_STORE);
            if (hasStores) {
                resolve(db);
                return;
            }

            // Jika ada store yang belum dibuat, upgrade ke versi saat ini + 1
            const nextVersion = (db.version || 1) + 1;
            db.close();

            const upgradeReq = window.indexedDB.open(DATABASE_NAME, nextVersion);
            upgradeReq.onupgradeneeded = () => {
                const upgradedDb = upgradeReq.result;
                if (!upgradedDb.objectStoreNames.contains(STORE_NAME)) {
                    upgradedDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
                if (!upgradedDb.objectStoreNames.contains(ACTIVE_SESSION_STORE)) {
                    upgradedDb.createObjectStore(ACTIVE_SESSION_STORE, { keyPath: 'id' });
                }
            };
            upgradeReq.onsuccess = () => resolve(upgradeReq.result);
            upgradeReq.onerror = () => reject(upgradeReq.error ?? new Error('Gagal mengupgrade penyimpanan save game.'));
            upgradeReq.onblocked = () => reject(new Error('Penyimpanan save game sedang digunakan tab lain.'));
        };

        initialReq.onerror = () => {
            reject(initialReq.error ?? new Error('Gagal membuka penyimpanan save game.'));
        };
        initialReq.onblocked = () => reject(new Error('Penyimpanan save game sedang digunakan tab lain.'));
    });
}

function parsePendingMetadata(): PendingSaveMetadata | null {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const metadata: unknown = JSON.parse(raw);
    if (typeof metadata !== 'object' || metadata === null) {
        throw new Error('Informasi save yang akan dimuat tidak valid.');
    }
    if (!('pendingSaveId' in metadata) || typeof metadata.pendingSaveId !== 'string') return null;
    return metadata as PendingSaveMetadata;
}

export async function stagePendingGameSave<T extends SaveSummary>(save: T): Promise<void> {
    const pendingSaveId = `${save.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const database = await openDatabase();
    const previousPendingSave = window.sessionStorage.getItem(SESSION_KEY);
    let pendingMetadataWritten = false;

    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).put({ id: pendingSaveId, save } satisfies PendingSaveRecord<T>);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error ?? new Error('Gagal menyimpan data game sementara.'));
            transaction.onabort = () => reject(transaction.error ?? new Error('Penyimpanan data game sementara dibatalkan.'));
        });

        const metadata: PendingSaveMetadata = {
            id: save.id,
            country_name: save.country_name,
            countryName: save.country_name,
            game_date: save.game_date,
            pendingSaveId,
        };
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(metadata));
        pendingMetadataWritten = true;

        const storageSnapshot = getSaveStorageSnapshot(save);
        if (storageSnapshot && Object.keys(storageSnapshot).length > 0) {
            restoreGameSaveStorage(storageSnapshot);
        } else {
            // Save lama tidak memiliki snapshot -> reset ke baseline agar state sebelumnya tidak bocor
            gameStateStorage.resetToBaseline();
        }
    } catch (error) {
        if (pendingMetadataWritten) {
            try {
                window.sessionStorage.removeItem(SESSION_KEY);
                if (previousPendingSave !== null) {
                    window.sessionStorage.setItem(SESSION_KEY, previousPendingSave);
                }
            } catch (restoreMetadataError) {
                console.error('Gagal memulihkan penanda save sebelumnya:', restoreMetadataError);
            }
        }
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).delete(pendingSaveId);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error ?? new Error('Gagal membersihkan save sementara.'));
            transaction.onabort = () => reject(transaction.error ?? new Error('Pembersihan save sementara dibatalkan.'));
        }).catch(cleanupError => {
            console.error('Gagal membersihkan save sementara setelah proses staging gagal:', cleanupError);
        });
        throw error;
    } finally {
        database.close();
    }
}

export async function readPendingGameSave<T>(): Promise<T | null> {
    const metadata = parsePendingMetadata();
    if (!metadata) {
        const legacySave = window.sessionStorage.getItem(SESSION_KEY);
        return legacySave ? JSON.parse(legacySave) as T : null;
    }

    const database = await openDatabase();
    try {
        return await new Promise<T>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readonly');
            const request = transaction.objectStore(STORE_NAME).get(metadata.pendingSaveId);
            request.onsuccess = () => {
                const record = request.result as PendingSaveRecord<T> | undefined;
                if (!record) {
                    reject(new Error('Data save tidak ditemukan di penyimpanan sementara.'));
                    return;
                }
                resolve(record.save);
            };
            request.onerror = () => reject(request.error ?? new Error('Gagal membaca data save sementara.'));
        });
    } finally {
        database.close();
    }
}

export async function clearPendingGameSave(): Promise<void> {
    const metadata = parsePendingMetadata();
    window.sessionStorage.removeItem(SESSION_KEY);
    if (!metadata) return;

    const database = await openDatabase();
    try {
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(STORE_NAME, 'readwrite');
            transaction.objectStore(STORE_NAME).delete(metadata.pendingSaveId);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error ?? new Error('Gagal menghapus save sementara.'));
            transaction.onabort = () => reject(transaction.error ?? new Error('Penghapusan save sementara dibatalkan.'));
        });
    } finally {
        database.close();
    }
}

export async function saveActiveGameSessionSnapshot<T>(snapshot: T): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const syncKey = getScopedActiveSessionSyncKey();
        const storeKey = getScopedActiveSessionKey();
        try {
            window.sessionStorage.setItem(syncKey, JSON.stringify(snapshot));
        } catch {}

        const database = await openDatabase();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(ACTIVE_SESSION_STORE, 'readwrite');
            transaction.objectStore(ACTIVE_SESSION_STORE).put({ id: storeKey, save: snapshot });
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    } catch (e) {
        console.warn('Failed to save active session snapshot to IndexedDB:', e);
    }
}

export function readSyncActiveGameSessionSnapshot<T>(): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const syncKey = getScopedActiveSessionSyncKey();
        const raw = window.sessionStorage.getItem(syncKey);
        return raw ? JSON.parse(raw) as T : null;
    } catch {
        return null;
    }
}

export async function readActiveGameSessionSnapshot<T>(): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const syncData = readSyncActiveGameSessionSnapshot<T>();
    if (syncData) return syncData;

    try {
        const database = await openDatabase();
        const storeKey = getScopedActiveSessionKey();
        const result = await new Promise<T | null>((resolve, reject) => {
            const transaction = database.transaction(ACTIVE_SESSION_STORE, 'readonly');
            const request = transaction.objectStore(ACTIVE_SESSION_STORE).get(storeKey);
            request.onsuccess = () => {
                const record = request.result as { id: string; save: T } | undefined;
                resolve(record ? record.save : null);
            };
            request.onerror = () => reject(request.error);
        });
        database.close();
        return result;
    } catch {
        return null;
    }
}

export async function clearActiveGameSessionSnapshot(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
        const syncKey = getScopedActiveSessionSyncKey();
        window.sessionStorage.removeItem(syncKey);
    } catch {}

    try {
        const database = await openDatabase();
        const storeKey = getScopedActiveSessionKey();
        await new Promise<void>((resolve, reject) => {
            const transaction = database.transaction(ACTIVE_SESSION_STORE, 'readwrite');
            transaction.objectStore(ACTIVE_SESSION_STORE).delete(storeKey);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
        database.close();
    } catch {
        // Abaikan jika database tidak tersedia
    }
}
