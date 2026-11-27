import { gameStateStorage, type GameStateSnapshot } from '@/app/logic/gameStateStorage';

const SESSION_KEY = 'presiden_simulator_load_save';
const DATABASE_NAME = 'presiden_simulator_pending_saves';
const DATABASE_VERSION = 1;
const STORE_NAME = 'saves';
export type GameSaveStorageSnapshot = GameStateSnapshot;

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
        const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Gagal membuka penyimpanan save game.'));
        request.onblocked = () => reject(new Error('Penyimpanan save game sedang digunakan tab lain.'));
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
