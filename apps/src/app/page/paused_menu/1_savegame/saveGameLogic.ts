export interface GameSaveRecord {
    id: number;
    save_name: string;
    country_name: string;
    country_iso?: string;
    game_date: string;
}

export async function fetchGameSaves(): Promise<GameSaveRecord[]> {
    const response = await fetch('/api/game-save');
    if (!response.ok) {
        throw new Error('Gagal memuat save file');
    }

    const data: unknown = await response.json();
    return Array.isArray(data) ? data as GameSaveRecord[] : [];
}

export async function saveGameToDatabase(payload: Record<string, unknown>): Promise<void> {
    const response = await fetch('/api/game-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan permainan');
    }
}
