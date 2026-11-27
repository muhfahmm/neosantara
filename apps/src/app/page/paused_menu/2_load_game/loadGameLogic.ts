import { stagePendingGameSave } from '@/app/logic/pendingGameSave';
import { fetchWithFirebaseAuth } from '@/lib/firebaseClient';

export interface LoadGameSave {
    id: number;
    save_name: string;
    country_name: string;
    country_iso: string;
    game_date: string;
}

export async function fetchLoadableGameSaves(): Promise<LoadGameSave[]> {
    const response = await fetchWithFirebaseAuth('/api/game-save');
    if (!response.ok) {
        throw new Error('Gagal memuat save file');
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
        throw new Error('Respons daftar save tidak valid.');
    }
    return data as LoadGameSave[];
}

export async function deleteGameSave(id: number): Promise<void> {
    const response = await fetchWithFirebaseAuth(`/api/game-save?id=${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error('Gagal menghapus save file');
    }
}

export async function loadGameSave(save: LoadGameSave): Promise<void> {
    try {
        const response = await fetchWithFirebaseAuth(`/api/game-save?id=${save.id}`);
        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || 'Gagal memuat detail save game.');
        }
        await stagePendingGameSave(await response.json());
        window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
    } catch (error) {
        console.error('Gagal menyiapkan save untuk dimuat:', error);
        alert(error instanceof Error ? error.message : 'Gagal membuka save game.');
    }
}
