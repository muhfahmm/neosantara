import { stagePendingGameSave } from '@/app/logic/pendingGameSave';

export interface LoadGameSave {
    id: number;
    save_name: string;
    country_name: string;
    country_iso: string;
    game_date: string;
}

export async function fetchLoadableGameSaves(): Promise<LoadGameSave[]> {
    const response = await fetch('/api/game-save');
    if (!response.ok) {
        throw new Error('Gagal memuat save file');
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? data as LoadGameSave[] : [];
}

export async function deleteGameSave(id: number): Promise<void> {
    const response = await fetch(`/api/game-save?id=${id}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error('Gagal menghapus save file');
    }
}

export async function loadGameSave(save: LoadGameSave): Promise<void> {
    try {
        await stagePendingGameSave(save);
        window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
    } catch (error) {
        console.error('Gagal menyiapkan save untuk dimuat:', error);
        alert('Gagal membuka save. Pastikan penyimpanan browser tersedia, lalu coba lagi.');
    }
}
