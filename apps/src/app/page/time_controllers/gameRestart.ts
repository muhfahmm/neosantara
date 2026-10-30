import { SimulationTimeManager } from './timeManager';
import { clearActiveResolutionsForSession } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';
import { clearActiveSecurityCouncilItems } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { clearReportedInvasionViolations } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import { clearExpelledOrganizationCountries } from '@/../../json/14_database_organisasi_internasional';
import { clearAllOrganizationMembershipData } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic';
import { clearActiveNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { clearAllRelationModifiers } from '../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { clearPendingAiNews, clearStoredAiNews } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';

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

    // Clear active PBB resolutions, election, missions, debt, research & annexed countries state on restart
    if (typeof window !== 'undefined') {
        localStorage.removeItem('dailyRewardData');
        localStorage.removeItem('player_diamonds');
        localStorage.removeItem('deployed_units_config');
        localStorage.removeItem('user_country');
        localStorage.removeItem('hutangModalLoanSources');
        localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
        localStorage.removeItem('presiden_simulator_active_mission');
        localStorage.removeItem('presiden_simulator_claimable_missions');
        localStorage.removeItem('presiden_simulator_mission_completions');
        localStorage.removeItem('presiden_simulator_mission_building_progress');
        localStorage.removeItem('presiden_simulator_mission_pool');
        localStorage.removeItem('neosantara_pbb_security_council_election');
        localStorage.removeItem('pbb_active_resolutions_v4');
        localStorage.removeItem('pbb_active_keamanan_v4');
        localStorage.removeItem('pbb_reported_war_ban_violations_v1');
        localStorage.removeItem('neosantara_expelled_organization_countries');
        localStorage.removeItem('neosantara_org_applications');

        // Hapus semua storage keanggotaan organisasi per negara, penelitian, covert op, dsb
        try {
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith('neosantara_joined_orgs_') ||
                    key.startsWith('research_') ||
                    key.startsWith('covert_op_') ||
                    key.startsWith('neosantara_country_religion_')
                )) {
                    localStorage.removeItem(key);
                }
            }
        } catch (e) { }

        // Hapus session storage terkait sesi game berjalan
        try {
            sessionStorage.removeItem('presiden_simulator_load_save');
            sessionStorage.removeItem('programNuklirActive');
            sessionStorage.removeItem('program_nuklir_modal_open');
            sessionStorage.removeItem('icbm_detail_open');
            sessionStorage.removeItem('perang_nuklir_detail_open');
            localStorage.removeItem('programNuklirActive');
            localStorage.removeItem('icbmBuildTask');
        } catch (e) { }

        window.dispatchEvent(new CustomEvent('daily_reward_reset'));
        clearActiveResolutionsForSession();
        clearActiveSecurityCouncilItems();
        clearReportedInvasionViolations();
        clearExpelledOrganizationCountries();
        clearAllOrganizationMembershipData();
        clearActiveNpcCountrySimulationState();
        clearAllRelationModifiers();
        clearPendingAiNews();
        clearStoredAiNews();

        try {
            (window as any).neosantara_annexed_countries = {};
            (window as any).neosantara_country_color_overrides = {};
            (window as any).neosantara_city_owner = {};
            (window as any).neosantara_diplomacy_map_colors = {};
            (window as any).neosantara_is_paused = true;
            window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
            window.dispatchEvent(new CustomEvent('map_territory_color_updated'));
            window.dispatchEvent(new CustomEvent('country_relations_updated'));
            window.dispatchEvent(new CustomEvent('reset_penelitian_selection'));
            window.dispatchEvent(new CustomEvent('mission_active_updated', { detail: { cardId: null } }));
            window.dispatchEvent(new CustomEvent('mission_claimable_updated', { detail: { claimableList: [] } }));
        } catch (e) { }
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
            delete reset.programNuklirActive;
            delete reset.icbmBuildTask;
            if (Array.isArray(reset.ongoingConstructions)) {
                reset.ongoingConstructions = reset.ongoingConstructions.filter((c: any) => c.buildingKey !== 'program_nuklir');
            }

            console.log('[gameRestart] Production, nuclear and ICBM state reset to initial');
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
