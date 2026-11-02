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

export function loadGameSave(save: LoadGameSave): void {
    sessionStorage.setItem('presiden_simulator_load_save', JSON.stringify(save));
    window.location.href = `/page/map_system?country=${encodeURIComponent(save.country_name)}`;
}
