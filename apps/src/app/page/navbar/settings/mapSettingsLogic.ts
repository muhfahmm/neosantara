/**
 * Logika Pengaturan Tampilan Geometri Peta (Map Display Settings)
 * Mengontrol mode tampilan peta:
 * 1. Batas Antar-Negara Saja (Clean / Polos tanpa garis kota/provinsi)
 * 2. Batas Provinsi / Kota Lengkap dengan Titik Kotanya
 * 3. Tampilkan / Sembunyikan Pin Kota-Kota Besar
 */

export interface MapDisplaySettings {
    showProvinceBorders: boolean; // Menampilkan garis batas kota / provinsi
    showMajorCities: boolean;     // Menampilkan pin & nama kota besar
    showCapitals: boolean;        // Menampilkan ibukota negara
}

export const DEFAULT_MAP_DISPLAY_SETTINGS: MapDisplaySettings = {
    showProvinceBorders: true,
    showMajorCities: true,
    showCapitals: true,
};

const STORAGE_KEY = 'neosantara_map_display_settings';

export function getMapDisplaySettings(): MapDisplaySettings {
    if (typeof window === 'undefined') return DEFAULT_MAP_DISPLAY_SETTINGS;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...DEFAULT_MAP_DISPLAY_SETTINGS, ...JSON.parse(saved) };
        }
    } catch {
        // Fallback default
    }
    return DEFAULT_MAP_DISPLAY_SETTINGS;
}

export function saveMapDisplaySettings(settings: MapDisplaySettings): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        // Kirim custom event agar modul canvas map langsung bereaksi instan tanpa reload
        window.dispatchEvent(new CustomEvent('neosantara_map_settings_changed', { detail: settings }));
    } catch (err) {
        console.error('Gagal menyimpan pengaturan peta:', err);
    }
}

