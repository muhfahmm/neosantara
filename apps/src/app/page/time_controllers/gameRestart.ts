import { gameStateStorage } from '@/app/logic/gameStateStorage';
import { SimulationTimeManager } from './timeManager';
import { clearActiveResolutionsForSession } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';
import { clearActiveSecurityCouncilItems } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { clearReportedInvasionViolations } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import { clearExpelledOrganizationCountries } from '@/../../json/14_database_organisasi_internasional';
import { clearAllOrganizationMembershipData } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic';
import { clearActiveNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { clearAllRelationModifiers } from '../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { clearPendingAiNews, clearStoredAiNews } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';
import { clearPendingGameSave } from '@/app/logic/pendingGameSave';

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
        gameStateStorage.removeItem('dailyRewardData');
        gameStateStorage.removeItem('player_diamonds');
        gameStateStorage.removeItem('deployed_units_config');
        gameStateStorage.removeItem('user_country');
        gameStateStorage.removeItem('hutangModalLoanSources');
        gameStateStorage.removeItem('hutangModalLoanSourcesLastRefresh');
        gameStateStorage.removeItem('presiden_simulator_active_mission');
        gameStateStorage.removeItem('presiden_simulator_claimable_missions');
        gameStateStorage.removeItem('presiden_simulator_mission_completions');
        gameStateStorage.removeItem('presiden_simulator_mission_building_progress');
        gameStateStorage.removeItem('presiden_simulator_mission_pool');
        gameStateStorage.removeItem('neosantara_pbb_security_council_election');
        gameStateStorage.removeItem('pbb_active_resolutions_v4');
        gameStateStorage.removeItem('pbb_active_keamanan_v4');
        gameStateStorage.removeItem('pbb_reported_war_ban_violations_v1');
        gameStateStorage.removeItem('neosantara_expelled_organization_countries');
        gameStateStorage.removeItem('neosantara_org_applications');
        gameStateStorage.removeItem('neosantara_achievements_state');
        gameStateStorage.removeItem('neosantara_player_xp');
        gameStateStorage.removeItem('requested_attack_requests_v1');
        gameStateStorage.removeItem('tradeMarketPrices');
        gameStateStorage.removeItem('pbb_security_council_election_state_v1');
        gameStateStorage.removeItem('pbb_war_sanction_history_v1');

        // Hapus semua storage keanggotaan organisasi per negara, penelitian, covert op, dsb
        try {
            for (let i = gameStateStorage.length - 1; i >= 0; i--) {
                const key = gameStateStorage.key(i);
                if (key && (
                    key.startsWith('neosantara_joined_orgs_') ||
                    key.startsWith('research_') ||
                    key.startsWith('covert_op_') ||
                    key.startsWith('neosantara_country_religion_') ||
                    key.startsWith('pbb_active_') ||
                    key.startsWith('presiden_simulator_') ||
                    key.startsWith('requested_attack_')
                )) {
                    gameStateStorage.removeItem(key);
                }
            }
        } catch (e) { }

        // Hapus session storage terkait sesi game berjalan
        try {
            void clearPendingGameSave().catch(error => {
                console.error('Gagal membersihkan save sementara:', error);
            });
            sessionStorage.removeItem('programNuklirActive');
            sessionStorage.removeItem('program_nuklir_modal_open');
            sessionStorage.removeItem('icbm_detail_open');
            sessionStorage.removeItem('perang_nuklir_detail_open');
            sessionStorage.removeItem('presiden_simulator_load_save');
            gameStateStorage.removeItem('programNuklirActive');
            gameStateStorage.removeItem('icbmBuildTask');
            gameStateStorage.removeItem('neosantara_covert_personnel');
            window.dispatchEvent(new CustomEvent('neosantara_covert_personnel_updated', { detail: { mataMata: 0, penyabot: 0 } }));
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
            (window as any).__neosantara_active_sync_save = null;
            window.dispatchEvent(new CustomEvent('pbb_active_resolutions_updated'));
            window.dispatchEvent(new CustomEvent('map_territory_color_updated'));
            window.dispatchEvent(new CustomEvent('country_relations_updated'));
            window.dispatchEvent(new CustomEvent('reset_penelitian_selection'));
            window.dispatchEvent(new CustomEvent('achievements_state_updated', { detail: { claimed: {}, milestones: {}, baselines: {} } }));
            window.dispatchEvent(new CustomEvent('player_xp_updated', { detail: { xp: 0, added: 0 } }));
            window.dispatchEvent(new CustomEvent('mission_active_updated', { detail: { cardId: null } }));
            window.dispatchEvent(new CustomEvent('mission_claimable_updated', { detail: { claimableList: [] } }));
        } catch (e) { }
    }

    // 2. Reset production data (accumulated production, build dates, and custom progress)
    if (options.setCountryDetail) {
        options.setCountryDetail((prev: any) => {
            if (!prev) return prev;

            const reset: any = { ...prev };

            // Bersihkan field akumulasi waktu, tanggal bangun, dan kustom harga
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
            delete reset.provinceTensions;
            delete reset.provinceReferendums;
            delete reset.provinceCasualties;
            delete reset.ongoingConstructions;

            console.log('[gameRestart] State simulasi internal direset ke kondisi bersih');
            return reset;
        });
    }

    // 3. Re-fetch baseline default statistics & buildings from the database via backend API
    // Memulihkan seluruh jumlah bangunan dan atribut negara ke nilai murni dari database master
    options.reloadStats()
        .then(() => {
            console.log("Game progress restarted successfully. All buildings and data restored to database defaults.");
        })
        .catch((err) => {
            console.error("Failed to reload country default stats on restart:", err);
        });
}
