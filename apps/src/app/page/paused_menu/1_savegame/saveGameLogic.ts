import { fetchWithFirebaseAuth } from '@/lib/firebaseClient';

export interface GameSaveRecord {
    id: number;
    save_name: string;
    country_name: string;
    country_iso?: string;
    game_date: string;
    version?: number;
    schema_version?: string;
    updated_at?: string;
}

export async function fetchGameSaves(): Promise<GameSaveRecord[]> {
    const response = await fetchWithFirebaseAuth('/api/game-save');
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Gagal memuat save file');
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
        throw new Error('Respons daftar save tidak valid.');
    }
    return data as GameSaveRecord[];
}

export async function saveGameToDatabase(payload: Record<string, unknown>): Promise<void> {
    const response = await fetchWithFirebaseAuth('/api/game-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan permainan');
    }
}
