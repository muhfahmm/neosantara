import { SimulationTimeManager } from './timeManager';

export interface RestartOptions {
    timeManager: SimulationTimeManager | null;
    setIsPaused: (paused: boolean) => void;
    setSpeed: (speed: number) => void;
    reloadStats: () => Promise<void>;
    setCountryDetail?: (detail: any) => void; // For resetting production data
    skipConfirm?: boolean;
}

/**
 * Handles resetting the game calendar and country statistics back to their initial values.
 */
export function handleGameRestart(options: RestartOptions): void {
    if (!options.skipConfirm) {
        const confirmRestart = window.confirm(
            "Apakah Anda yakin ingin mengatur ulang progres simulasi? Semua kemajuan waktu dan perubahan data akan dikembalikan ke awal."
        );
        if (!confirmRestart) return;
    }

    // 1. Reset Simulation Time Manager (Date, Pause, and Speed)
    if (options.timeManager) {
        options.timeManager.setPaused(true);
        options.timeManager.setSpeed(1);
        options.timeManager.resetDate();
    }
    options.setIsPaused(true);
    options.setSpeed(1);

    // Clear active PBB resolutions & annexed countries state on restart
    if (typeof window !== 'undefined') {
        try {
            localStorage.removeItem('pbb_active_resolutions_v4');
            localStorage.removeItem('pbb_active_keamanan_v4');
            localStorage.removeItem('neosantara_annexed_countries');
            localStorage.removeItem('neosantara_country_color_overrides');
            (window as any).neosantara_annexed_countries = {};
            (window as any).neosantara_country_color_overrides = {};
            window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
            window.dispatchEvent(new CustomEvent('map_territory_color_updated'));
        } catch (e) {}
    }

    // 2. Reset production data (accumulated production, build dates, and price controls)
    if (options.setCountryDetail) {
        options.setCountryDetail((prev: any) => {
            if (!prev) return prev;
            
            // Create a new object without any accumulated_* or build_date_* fields
            const reset: any = { ...prev };
            
            // Remove all production-related fields and custom price controls
            Object.keys(reset).forEach(key => {
                if (key.startsWith('accumulated_') || key.startsWith('build_date_') || key.startsWith('last_prod_date_')) {
                    delete reset[key];
                }
            });
            delete reset.harga;
            delete reset.price_rice;
            delete reset.price_fuel;
            
            console.log('[gameRestart] Production data and custom price controls cleared');
            return reset;
        });
    }

    // 3. Re-fetch baseline default statistics from the profile backend API
    // This will restore all building counts and other data to their default values from JSON files
    options.reloadStats()
        .then(() => {
            console.log("Game progress restarted successfully. All data restored to default values.");
        })
        .catch((err) => {
            console.error("Failed to reload country default stats on restart:", err);
        });
}
