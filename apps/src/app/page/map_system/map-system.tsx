// detail path: c:\EM\apps\src\app\page\map_system\map-system.tsx
'use client';

import React, { memo, startTransition, useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
    Play, Pause, Settings, Palmtree, Shield, Crosshair, Globe, Calendar, ArrowLeft, Plus, RotateCw
} from 'lucide-react';
import Link from 'next/link';
import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';
import MAJOR_CITIES_DATA from './major_cities.json';
import { getMapDisplaySettings, type MapDisplaySettings } from '../navbar/settings/mapSettingsLogic';
import countryPaths from './country-paths.json';
import { mergeClaimedTerritories } from './world-map-geometry';
import { initializeSimulationClock, SimulationTimeManager, createSimulationCalendar } from '../time_controllers';
import { handleGameRestart } from '../time_controllers';
import dynamic from 'next/dynamic';
import useKeyboardShortcuts from '../keyword';
import { subMenuItems } from '../navigasi_menu/navigationData';
import {
    canAcceptTradeDeal,
    getTradeRejectionDescription,
} from '../menus/inbox/logic/3_notifikasi_perdagangan/tradeValidationLogic';
import {
    calculateTradeAccess,
    getAverageNationalization,
} from '../navigasi_menu/2_navigasi_bawah/4_ekonomi/1_perdagangan/tradeAccessLogic';

const GameMenuModal = dynamic(() => import('../navbar/GameMenuModal').then(m => m.GameMenuModal), { ssr: false });
const TopNav = dynamic(() => import('../navigasi_menu/1_navigasi_atas/TopNav'), { ssr: false });
const ConfirmRestartModal = dynamic(() => import('../navbar/ConfirmRestartModal').then(m => m.ConfirmRestartModal), { ssr: false });
const ModalsPeringatanPeringkat = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsPeringatanPeringkat').then(m => m.ModalsPeringatanPeringkat), { ssr: false });
const ModalsKudeta = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta'), { ssr: false });
type KudetaType = import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta').KudetaType;
const ModalsAnnexedGameOver = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsAnnexedGameOver'), { ssr: false });
const DiplomacyTracking = dynamic(() => import('../menus/tracking-modals/tracking'), { ssr: false });
const ResultModal = dynamic(() => import('./warResultModal'), { ssr: false });
const TradeRejectionModal = dynamic(() => import('../menus/inbox/logic/3_notifikasi_perdagangan/tradeRejectionModal'), { ssr: false });
const ClosedTradeRejectionModal = dynamic(() => import('../menus/inbox/logic/3_notifikasi_perdagangan/ClosedTradeRejectionModal'), { ssr: false });

export function lootUserProductionInventory(countryDetail: any, currentDateStr: string): { updatedDetail: any; lootedSummaryText: string } {
    if (!countryDetail) return { updatedDetail: countryDetail, lootedSummaryText: '' };

    const nextDetail = JSON.parse(JSON.stringify(countryDetail));

    const PRODUCTION_KEYS = [
        // Mineral & Energi
        "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi",
        // Manufaktur
        "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
        // Peternakan
        "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
        // Agrikultur
        "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
        // Perikanan
        "udang", "mutiara", "ikan",
        // Olahan Pangan
        "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"
    ];

    PRODUCTION_KEYS.forEach((key) => {
        // Reset build date ke tanggal hari ini agar akumulasi stok produksi harian kembali ke 0
        nextDetail[`build_date_${key}`] = currentDateStr;

        if (typeof nextDetail[`stok_${key}`] === 'number') nextDetail[`stok_${key}`] = 0;
        if (typeof nextDetail[`stock_${key}`] === 'number') nextDetail[`stock_${key}`] = 0;
        if (typeof nextDetail[`${key}_stok`] === 'number') nextDetail[`${key}_stok`] = 0;
        if (typeof nextDetail[`${key}_stock`] === 'number') nextDetail[`${key}_stock`] = 0;
        if (typeof nextDetail[`${key}_amount`] === 'number') nextDetail[`${key}_amount`] = 0;
        if (nextDetail.stok && typeof nextDetail.stok === 'object') nextDetail.stok[key] = 0;
        if (nextDetail.stock && typeof nextDetail.stock === 'object') nextDetail.stock[key] = 0;
        if (nextDetail.produksi && typeof nextDetail.produksi === 'object') nextDetail.produksi[key] = 0;
    });

    return {
        updatedDetail: nextDetail,
        lootedSummaryText: "Seluruh stok hasil produksi (Mineral & Energi, Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan) telah habis dirampas oleh musuh."
    };
}
const RequireEmbassyModal = dynamic(() => import('./RequireEmbassyModal').then(m => m.RequireEmbassyModal), { ssr: false });
import { Navbar } from '../navbar/Navbar';
const BottomNav = dynamic(() => import('../navigasi_menu/2_navigasi_bawah/BottomNav'), { ssr: false });
const ModalsManager = dynamic(() => import('../navigasi_menu/2_navigasi_bawah/ModalsManager'), { ssr: false });
import { calculateDailyPopulationChange, updateDailyPopulation } from '@/app/logic/populations_logic/population_logic';
import { logger } from '../../../lib/logger';
const CountryDetailModal = dynamic(() => import('../detail_negara/detail_negara').then(m => m.CountryDetailModal), { ssr: false });
const NegaraUserModal = dynamic(() => import('./negara_user'), { ssr: false });
const WarMap = dynamic(() => import('../path_logic/path-war'), { ssr: false });
const DialogTerbukaMenu = dynamic(() => import('../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/2_dialog_terbuka/DialogTerbukaMenu'), { ssr: false });
import { buildCapitalPoint } from '../path_logic/path-war';
import { estimateTravelTime } from '../path_logic/time_logic';
import { applyWarLossesToUserArmada } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';
import { getArmadaPowerSummary } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { setCountryProfileSummaries, type CountryProfileSummary } from '@/lib/countryProfileSummaryRegistry';
import {
    hasActiveNationalization,
    syncNationalizationDiplomacyRelations,
} from '../navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic';
import { calculateDailyMaterialProduction } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic';
import { getDaysElapsed } from '@/app/logic/production_logic';
import {
    calculatePlayerDailyMaterialsInRust,
    flushNpcCountrySimulation,
    getNpcCountrySimulationSnapshot,
    restoreNpcCountrySimulationState,
    applyNpcCountrySimulationState,
    useNpcCountrySimulation,
    clearActiveNpcCountrySimulationState,
    updateNpcCountrySimulationState,
    NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
} from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { setCurrentGameDateString } from '@/app/logic/gameSessionState';
import {
    calculateKepuasan,
    calculateKeterbukaanScore,
    calculateKesehatanScore,
    calculatePenegakanHukumScore,
    countLowSatisfactionSectors,
    createSatisfactionSectorBaseline,
    LOW_SECTOR_DECAY_INTERVAL_MONTHS,
    LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL,
    LOW_SECTOR_DECAY_POINTS_PER_SECTOR,
} from '@/app/logic/kepuasanCalculator';
import { calculatePresidentRating, getMonthsDifference } from '@/app/logic/peringkatCalculator';
import { calculateKesejahteraan, calculateKesejahteraanDecay } from '@/app/logic/kesejahteraanCalculator';
const TopLeftIcon = dynamic(() => import('../menus/inbox/inboxModals'), { ssr: false });
const TopRightGiftIcon = dynamic(() => import('../menus/reward/rewardModals'), { ssr: false });
const TopRightNewsIcon = dynamic(() => import('../menus/news/newsModals'), { ssr: false });
import {
    acknowledgeAiNews,
    clearPendingAiNews,
    clearStoredAiNews,
    takePendingAiNews,
    type AiNewsItem,
} from '@/app/logic/npc_ai_brain/core/aiNewsBridge';
const BottomLeftPenelitianIcon = dynamic(() => import('../menus/penelitian/penelitianModals'), { ssr: false });
const BottomLeftMissionIcon = dynamic(() => import('../menus/mission/missionModals'), { ssr: false });
import { NotificationMessage, getKepuasanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { isNonActionableUpdateNotification } from '../menus/inbox/logic/automaticChangeNotification';
import { getPeringkatWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/2_peringkat/peringkatLogic';
import { getKesejahteraanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanLogic';
import { getTradeAgreementsForCountry } from '../../../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
import { getEmbassiesForCountry } from '../../../../../json/6_database_kedutaan_besar/embassyRegistry';
import { getRelationValue, setNonAggressionPactHistory, setRelationModifier, setRelationSanctionModifiers, setRelationSourceValue, setSimulationDate } from '../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import type { NonAggressionPactPeriod } from '../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { setEconomicSanctionCounts } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import { playerHasEmbassyWith, playerHasEmbassyOrTradePartners } from '../detail_negara/1_informasi_umum/1_kedutaan_besar/logic/kedutaanBesarLogic';
import { areSameWarCountry, getWarCountryIdentity } from '../detail_negara/3_operasi_militer/1_serang_negara/warCountryIdentity';
import { generateAITradeBeliNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/2_beli/tradeBeliLogic';
import { generateAITradeJualNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/1_jual/tradeJualLogic';
import { generateTradeRelationOfferNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/3_hubungan_dagang/tradeRelationLogic';
import { checkAndGenerateEmbassyOffers, createEmbassyOfferNotification } from '../menus/inbox/logic/4_notifikasi_kedubes/1_penawaran_kedutaan_besar';
import { executeAparatOperation } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/1_bubarkan_dengan_aparat/bubarkanAparatLogic';
import type { DetailOpsiBubarkan } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/1_bubarkan_dengan_aparat/opsiBubarkanMassaConfig';
import type { DemonstrasiNotification } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/demonstrasiEkonomiLogic';
const MenuBubarkanMassaModal = dynamic(() => import('../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/1_bubarkan_dengan_aparat/MenuBubarkanMassaModal'), { ssr: false });
const HasilBubarkanMassaModal = dynamic(() => import('../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/1_bubarkan_dengan_aparat/HasilBubarkanMassaModal'), { ssr: false });
import { startDialogTerbuka } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/2_dialog_terbuka/dialogTerbukaLogic';
import { executePenuhiTuntutan } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/3_penuhi_tuntutan/penuhiTuntutanLogic';
import { executeAbaikanDemo, calculateDailyIgnoredDemoPenalties } from '../menus/inbox/logic/7_notifikasi_ekonomi/demo_logic/4_abaikan_demo/abaikanDemoLogic';
import { generateBencanaAlamNotification } from '../menus/inbox/logic/6_notifikasi_bencana/1_bencana_alam/bencanaLogic';
import { generateKeamananNotification } from '../menus/inbox/logic/14_notifikasi_keamanan/keamananLogic';
import {
    EPIDEMIC_BASE_CHANCE_PERCENT,
    generateWabahPenyakitNotification,
    canPandemicOccur,
    canEpidemicOccur,
    PANDEMIC_BASE_CHANCE_PERCENT,
    getPandemicBaseChancePercentByYear,
    handleMedicalAssistance,
    deactivateOutbreak,
    applyOutbreakPopulationLoss,
} from '../menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/wabahLogic';
import { getDaysDifference } from '../menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/outbreakManagement';
import { generateSpionaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/1_spionase/spionaseLogic';
import { generateSabotaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/2_sabotase/sabotaseLogic';
import {
    generateDiserangNotification,
    getAttackChancePercentFromRelation,
} from '../menus/inbox/logic/2_notifikasi_pertahanan/3_diserang/diserangLogic';
import { generatePemberontakanNotification, calculateSeparatismeRiskPercent } from '../menus/inbox/logic/2_notifikasi_pertahanan/4_pemberontakan/pemberontakanLogic';
import { getDefenseAllianceOfferChancePercent } from '../bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/3_Aliansi Pertahanan';
import { applyDoktrinPertahananDiriBonus, applyWarCasualtyToPopulation } from '../bonus_logic';
import { generateICBMNotification, generateProgramNuklirSelesaiNotification, generateUjicobaNuklirAINotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/5_icbm/icbmLogic';
import { isNegaraNuklirBawaan, getNegaraNuklirBaseIcbm } from '@/app/logic/npc_ai_brain/military/nuclearControllerAI';
import { getRealisticTargetLocationName } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/modals_menu/5_ujicoba_icbm/ujicobaIcbmLogic';
import { terbitkanBeritaAI } from '@/app/logic/npc_ai_brain/core/aiNewsBridge';
import { generateListrikDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/1_kelistrikan/listrikDefisitLogic';
import { generateHunianDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/2_hunian/hunianDefisitLogic';
import { generatePanganDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/3_pangan/panganDefisitLogic';
import { generateTempatUmumDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/4_tempat_umum/tempatUmumDefisitLogic';
import { generateNonAggressionOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/1_pakta_non_agresi/nonAggressionLogic';
import { generateDefenseAllianceOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/2_aliansi_pertahanan/defenseAllianceLogic';
import { generateResearchContractOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/3_kontrak_penelitian/researchContractLogic';
import { generateHubunganPanasNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/4_hubungan_panas/hubunganPanasLogic';
import {
    evaluateAIResolusiPBBTrigger,
    generateAIResolusiPBBNotification
} from '../menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBLogic';
import { evaluateAIKeamananPBBTrigger } from '../menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/2_keamanan/keamananPBBLogic';
import {
    clearActiveResolutionsForSession,
    loadActiveResolutions,
    saveActiveResolutions,
    tickPBBResolutions,
    spawnAIResolutionFromTrigger
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';
import { clearActiveSecurityCouncilItems, tickPBBSecurityCouncil, spawnAISecurityCouncilFromTrigger } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { initCountryIsoFromDatabase, getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';
import {
    getWHOPandemicRiskModifier,
    getWMODisasterRiskModifier,
    applyKementerianLingkunganHidupDisasterRiskReduction,
} from '../bonus_logic';
import { checkAndProcessOrgApplications } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic';
import { fetchAllCountryProfilesFromDb } from '@/../../json/semua_fitur_negara/0_profiles';
import {
    createInitialElectionState,
    expelCountryFromSecurityCouncil,
    getEligibleUNMemberCountries,
    normalizeElectionState,
    tickSecurityCouncilElectionSchedule,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection';
import { calculateLayananPublikScore, calculateHunianScore } from '@/app/logic/kepuasanCalculator';
import { applyTotalHousingCapacityBonus } from '../bonus_logic';
import { getCountryConsumptionBreakdown } from '../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic';
import { getKelistrikanFuelRequirements } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/1_kelistrikan/fuelLogic';
import { getMaterialStock } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic';
import { generateInvasionNews, evaluateAnnualHotRelationsInvasion, getCountryColor } from '../menus/news/logic/1_berita_invasi/beritaInvasiLogic';
import { generateAnnexationNews, updateMapTerritoryColor } from '../menus/news/logic/2_berita_aneksasi/beritaAneksasiLogic';
import { hasActiveGlobalWarBan, submitWarBanViolationSanctions } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/1_warBanLogic';
import {
    hasActiveApprovedInvasionResolution,
    hasActiveApprovedInvasionResolutionForDifferentTarget
} from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/4_resolusiInvasiLogic';
import { calculateNetBalanceWithEconomicEmbargo, getEconomicEmbargoProductionMultiplier } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import {
    clearReportedInvasionViolations,
    isTradeEmbargoActive,
    submitInvasionViolationSanctions
} from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import {
    getCountryIcbmCount,
    consumeCountryIcbm,
    launchIcbmWarStrike,
    applyIcbmMilitaryDamageToNpc
} from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/5_icbm/modals_menu/3_perang_nuklir/icbmWarLogic';
import { generateResourceLootNews } from '../menus/news/logic/3_berita_pengambilan_sda/beritaPengambilanSDALogic';
import { generateDiplomacyNews } from '../menus/news/logic/4_diplomasi/diplomasiNewsLogic';
import {
    generateEconomicCrisisNotification,
    generateEconomyNews,
} from '../menus/news/logic/5_ekonomi_keuangan/ekonomiKeuanganNewsLogic';
import { generateMilitaryAchievementNews } from '../menus/news/logic/6_pencapaian_militer/pencapaianMiliterNewsLogic';
import { generateWorldNewsEvents } from '../menus/news/logic/worldNewsLogic';
import { generateWorldNewsEventsInRust } from '../menus/news/rust/newsWorkerClient';
import { selectDailyNotificationsInRust } from '../menus/inbox/rust/inboxWorkerClient';
import { NewsItemData } from '../menus/news/newsModals';
import {
    createSecurityCouncilInvasionNews,
    type SecurityCouncilInvasionOperation,
} from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/1_invasiMiliterGabunganLogic';
import {
    clearMissionProgressData,
    type MissionNavigationTarget
} from '../menus/mission/missionModals';
import { calculateFoodCoverageByGroup } from '../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic';
import {
    clearExpelledOrganizationCountries,
    expelCountryFromOrganizations,
    expelCountryFromUNOrganizations
} from '@/../../json/14_database_organisasi_internasional';
import { clearAllOrganizationMembershipData } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic';
import {
    PROVINCE_ACTION_EVENT,
    type ProvinceActionEventDetail
} from '../detail_negara/1_informasi_umum/provinsi_logic/provinceActionTypes';
import {
    ANNEXED_AGGREGATE_KEYS,
    releaseAnnexedProvince,
    type AnnexedContribution
} from '../detail_negara/1_informasi_umum/provinsi_logic/1_informasi_umum/1_beri_kemerdekaan';
import {
    createProvinceReferendum,
    hasProvinceReferendumEnded,
    resolveProvinceReferendum,
    type ProvinceReferendum
} from '../detail_negara/1_informasi_umum/provinsi_logic/ketegangan_provinsi/3_referendum';

type AnnexedTerritoryEntry = { attackerCountry?: string; attackerIso?: string; isPbbOccupied?: boolean };
type AnnexedTerritories = Record<string, AnnexedTerritoryEntry>;
type MapCity = {
    country: string;
    capital: string;
    lat: number;
    lng: number;
    iso: string;
    city_id?: string;
    country_iso?: string;
    color?: string;
    owner_country?: string;
    is_major_city?: boolean;
};
type CityOwnerEntry = {
    cell?: [number, number][];
    cityId: string;
    cityName: string;
    countryIso: string;
    ownerCountry: string;
    ownerIso: string;
    ownerColor: string;
    lat: number;
    lng: number;
    isCapital: boolean;
};
type CityOwnerStore = Record<string, CityOwnerEntry>;

const normalizeMapKey = (value: unknown) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const getCityOwnerId = (countryIso: string, cityName: string) =>
    `${countryIso.toLowerCase()}:${normalizeMapKey(cityName)}`;

const getCurrentCityOwner = (city: MapCity) => {
    if (typeof window === 'undefined') return city.country;
    const cityOwners = (window as Window & {
        neosantara_city_owner?: CityOwnerStore;
    }).neosantara_city_owner || {};
    return cityOwners[getCityOwnerId(city.iso, city.capital)]?.ownerCountry || city.country;
};

const getMapCities = () => {
    const cities = [
        ...(CAPITALS_DATA as MapCity[]),
        ...(MAJOR_CITIES_DATA as MapCity[]),
    ];
    const seen = new Set<string>();
    return cities.filter(city => {
        const id = getCityOwnerId(city.iso, city.capital);
        if (!city.iso || !city.capital || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
};

function resolveWarTargetCity(
    targetCountry: string,
    targetCityId?: string,
    targetCityName?: string,
    chooseForAi = false
): CityOwnerEntry | null {
    const allCities = getMapCities();
    const cities = allCities.filter(city =>
        normalizeMapKey(getCurrentCityOwner(city)) === normalizeMapKey(targetCountry)
    );
    if (cities.length === 0) return null;

    const requestedCity = cities.find(city =>
        getCityOwnerId(city.iso, city.capital) === targetCityId ||
        normalizeMapKey(city.capital) === normalizeMapKey(targetCityName)
    );
    const city = requestedCity ||
        (chooseForAi
            ? cities[Math.floor(Math.random() * cities.length)]
            : cities.find(candidate =>
                (CAPITALS_DATA as MapCity[]).some(capital =>
                    getCityOwnerId(capital.iso, capital.capital) === getCityOwnerId(candidate.iso, candidate.capital)
                )
            )) ||
        cities[0];
    const isCapital = (CAPITALS_DATA as MapCity[]).some(capital =>
        normalizeMapKey(capital.country) === normalizeMapKey(targetCountry) &&
        getCityOwnerId(capital.iso, capital.capital) === getCityOwnerId(city.iso, city.capital)
    );

    return {
        cityId: getCityOwnerId(city.iso, city.capital),
        cityName: city.capital,
        countryIso: city.iso.toLowerCase(),
        ownerCountry: targetCountry,
        ownerIso: city.iso.toLowerCase(),
        ownerColor: city.color || '#2e7d32',
        lat: city.lat,
        lng: city.lng,
        isCapital,
    };
}

// Cache data geometri poligon provinsi resmi per cityId
let cachedCityProvinceCells: Record<string, [number, number][]> | null = null;
if (typeof window !== 'undefined') {
    fetch('/city_province_cells.json')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && typeof data === 'object') {
                cachedCityProvinceCells = data;
            }
        })
        .catch(err => console.warn('Pemuatan polygon provinsi notice:', err));
}

// Wilayah provinsi: gunakan batas geometri poligon provinsi resmi jika tersedia,
// atau sel Voronoi kota di dalam negaranya sebagai fallback.
function computeCityRegionCell(city: { cityId: string; countryIso: string; lat: number; lng: number }): [number, number][] {
    if (cachedCityProvinceCells && cachedCityProvinceCells[city.cityId]) {
        return cachedCityProvinceCells[city.cityId];
    }
    const k = Math.max(Math.cos(city.lat * Math.PI / 180), 0.25);
    const toXY = (lng: number, lat: number): [number, number] => [(lng - city.lng) * k, lat - city.lat];
    const half = 60;
    let poly: [number, number][] = [[-half, -half], [half, -half], [half, half], [-half, half]];
    const siblings = getMapCities().filter(other =>
        other.iso.toLowerCase() === city.countryIso.toLowerCase() &&
        getCityOwnerId(other.iso, other.capital) !== city.cityId
    );
    for (const other of siblings) {
        const [ox, oy] = toXY(other.lng, other.lat);
        const nx = ox;
        const ny = oy;
        const c = (ox * ox + oy * oy) / 2;
        const next: [number, number][] = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i];
            const b = poly[(i + 1) % poly.length];
            const da = a[0] * nx + a[1] * ny - c;
            const db = b[0] * nx + b[1] * ny - c;
            if (da <= 0) next.push(a);
            if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
                const t = da / (da - db);
                next.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
            }
        }
        poly = next;
        if (poly.length < 3) return [];
    }
    return poly.map(([x, y]) => [city.lng + x / k, city.lat + y]);
}

function getCapitalFlagsForCurrentTerritories(settingsOverride?: MapDisplaySettings) {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const customCapitalName = typeof window !== 'undefined'
        ? (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital
        : undefined;
    const cityOwners = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_city_owner?: CityOwnerStore }).neosantara_city_owner || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const settings = settingsOverride || getMapDisplaySettings();
    let citiesPool: MapCity[] = [];
    if (settings.showCapitals) {
        citiesPool = citiesPool.concat(CAPITALS_DATA as MapCity[]);
    }
    if (settings.showMajorCities) {
        citiesPool = citiesPool.concat(MAJOR_CITIES_DATA as MapCity[]);
    }

    // Cari nama negara asal dari customCapitalName (misal jika Baotou -> negara 'china')
    let targetCountryKey: string | null = null;
    if (customCapitalName) {
        const found = citiesPool.find(c => normalizeKey(c.capital) === normalizeKey(customCapitalName));
        if (found) {
            targetCountryKey = normalizeKey(found.country);
        }
    }

    return citiesPool.map(item => {
        let capital = { ...item };
        if (customCapitalName && targetCountryKey) {
            if (normalizeKey(capital.country) === targetCountryKey) {
                const isTargetCapital = normalizeKey(capital.capital) === normalizeKey(customCapitalName);
                if (isTargetCapital) {
                    capital = { ...capital, is_capital: true, is_major_city: false } as any;
                } else {
                    capital = { ...capital, is_capital: false, is_major_city: true } as any;
                }
            }
        }

        capital = {
            ...capital,
            city_id: getCityOwnerId(capital.iso, capital.capital),
            country_iso: capital.iso,
        };
        const cityOwner = cityOwners[getCityOwnerId(capital.iso, capital.capital)];
        if (cityOwner) {
            const canonicalOwnerIso = COUNTRIES_DATA.find(country =>
                normalizeKey(country.country) === normalizeKey(cityOwner.ownerCountry)
            )?.iso;
            const ownerIso = canonicalOwnerIso ||
                (cityOwner.ownerIso.length === 2 ? cityOwner.ownerIso : capital.iso);
            capital = {
                ...capital,
                iso: ownerIso.toLowerCase(),
                owner_country: cityOwner.ownerCountry,
            };
        }

        const capitalKeys = new Set([
            normalizeKey(capital.country),
            normalizeKey(capital.iso),
            normalizeKey(`iso_${capital.iso}`)
        ]);
        const annexation = Object.entries(annexedCountries).find(([key]) =>
            capitalKeys.has(normalizeKey(key))
        )?.[1];
        if (!annexation?.attackerCountry) return capital;

        const attackerIso = COUNTRIES_DATA.find(country =>
            normalizeKey(country.country) === normalizeKey(annexation.attackerCountry)
        )?.iso || (
                annexation.attackerIso?.trim().length === 2
                    ? annexation.attackerIso
                    : undefined
            );

        return attackerIso
            ? {
                ...capital,
                iso: attackerIso.toLowerCase(),
                owner_country: annexation.attackerCountry,
            }
            : capital;
    });
}

function hasAnnexedTerritories(countryName: string): boolean {
    if (typeof window === 'undefined') return false;

    const territories = (window as Window & {
        neosantara_annexed_countries?: AnnexedTerritories;
    }).neosantara_annexed_countries || {};
    return Object.values(territories).some(territory =>
        areSameWarCountry(territory.attackerCountry, countryName)
    );
}

interface Country {
    id: number;
    country: string;
    capital: string;
    iso: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lng?: number;
    continent: string;
    color?: string;
}

const EMPTY_COUNTRY_OVERRIDES: Record<string, string> = {};
const EMPTY_ANNEXED_COUNTRIES: Record<string, unknown> = {};
const MAP_INTERACTION_IDLE_MS = 600;

const MapCanvasView = memo(function MapCanvasView({
    containerRef,
    interactionDisabled,
    isSelectingTarget,
    onClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onWheel,
    onContextMenu,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    interactionDisabled: boolean;
    isSelectingTarget?: boolean;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: () => void;
    onPointerLeave: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onWheel: () => void;
    onContextMenu: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}) {
    // Custom target reticle cursor SVG encoded
    const targetCursorSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#FF4D4D" stroke-width="2.5" opacity="0.9"/>
            <circle cx="18" cy="18" r="6" fill="none" stroke="#FF4D4D" stroke-width="2" opacity="0.95"/>
            <circle cx="18" cy="18" r="2" fill="#FF4D4D"/>
            <line x1="18" y1="0" x2="18" y2="8" stroke="#FF4D4D" stroke-width="2.5"/>
            <line x1="18" y1="28" x2="18" y2="36" stroke="#FF4D4D" stroke-width="2.5"/>
            <line x1="0" y1="18" x2="8" y2="18" stroke="#FF4D4D" stroke-width="2.5"/>
            <line x1="28" y1="18" x2="36" y2="18" stroke="#FF4D4D" stroke-width="2.5"/>
        </svg>`
    );
    const targetCursorStyle = `url("data:image/svg+xml,${targetCursorSvg}") 18 18, crosshair`;

    return (
        <div
            ref={containerRef}
            className={`fixed top-20 inset-x-0 bottom-0 z-0 ${interactionDisabled && !isSelectingTarget ? 'pointer-events-none' : ''}`}
        >
            <canvas
                id="map-canvas"
                style={isSelectingTarget ? { cursor: targetCursorStyle } : undefined}
                className={`w-full h-full block ${isSelectingTarget ? '' : 'cursor-grab'}`}
                onClick={onClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerLeave}
                onWheel={onWheel}
                onContextMenu={onContextMenu}
                onMouseLeave={event => {
                    const mouseUp = new MouseEvent('mouseup', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                    });
                    event.currentTarget.dispatchEvent(mouseUp);
                }}
            />
        </div>
    );
});

function applyUniformRelationPenalty(attackerCountry: string, minimum: number, maximum: number): number {
    const penalty = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    const attackerIdentity = getWarCountryIdentity(attackerCountry);

    COUNTRIES_DATA.forEach(country => {
        if (getWarCountryIdentity(country.country, country.iso) !== attackerIdentity) {
            setRelationModifier(attackerCountry, country.country, -penalty);
        }
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('country_relations_updated'));
    }

    return penalty;
}

function applyInvasionRelationPenalty(attackerCountry: string, targetCountry: string): string {
    const attackerIdentity = getWarCountryIdentity(attackerCountry);
    const targetIdentity = getWarCountryIdentity(targetCountry);
    const penaltyRanges = [
        { minimumRelation: 0, maximumRelation: 25, minimumPenalty: 5, maximumPenalty: 10 },
        { minimumRelation: 26, maximumRelation: 40, minimumPenalty: 10, maximumPenalty: 15 },
        { minimumRelation: 41, maximumRelation: 65, minimumPenalty: 15, maximumPenalty: 20 },
        { minimumRelation: 66, maximumRelation: 80, minimumPenalty: 20, maximumPenalty: 25 },
        { minimumRelation: 81, maximumRelation: 100, minimumPenalty: 25, maximumPenalty: 30 },
    ];
    let affectedCountries = 0;

    COUNTRIES_DATA.forEach(country => {
        const countryIdentity = getWarCountryIdentity(country.country, country.iso);
        if (countryIdentity === attackerIdentity || countryIdentity === targetIdentity) return;

        const relation = getRelationValue(attackerCountry, country.country);
        const range = penaltyRanges.find(
            candidate => relation >= candidate.minimumRelation && relation <= candidate.maximumRelation
        );
        if (!range) return;

        const penalty = Math.floor(
            Math.random() * (range.maximumPenalty - range.minimumPenalty + 1)
        ) + range.minimumPenalty;
        setRelationModifier(attackerCountry, country.country, -penalty);
        affectedCountries += 1;
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('country_relations_updated'));
    }

    return `${affectedCountries} negara lain terdampak: hubungan 0–25 turun 5–10 poin, 26–40 turun 10–15 poin, 41–65 turun 15–20 poin, 66–80 turun 20–25 poin, dan 81–100 turun 25–30 poin.`;
}

function setMilitaryAttackRelation(
    attackerCountry: string,
    targetCountry: string,
    relationValue: 1 | 25
): void {
    const canonicalCountryName = (name: string) => {
        const identity = getWarCountryIdentity(name);
        return COUNTRIES_DATA.find(country => country.iso.toLowerCase() === identity)?.country || name;
    };
    setRelationSourceValue(
        canonicalCountryName(attackerCountry),
        canonicalCountryName(targetCountry),
        'military-attack',
        relationValue
    );
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('country_relations_updated'));
    }
}

export default function MapPage() {
    const router = useRouter();
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countryDetail, setCountryDetail] = useState<any>(null);
    const [metadata, setMetadata] = useState<Record<string, any>>({});

    useEffect(() => {
        if (countryDetail && typeof window !== 'undefined') {
            (window as any).neosantara_player_country_detail = countryDetail;
        }
    }, [countryDetail]);

    useEffect(() => {
        const handleAidArrival = (event: Event) => {
            const detail = (event as CustomEvent<{ id?: string; resourceKey?: string; amount?: number; senderCountry?: string }>).detail;
            const resourceKey = String(detail?.resourceKey || '');
            const amount = Number(detail?.amount) || 0;
            if (!detail?.id || !resourceKey || amount < 5000) return;

            setCountryDetail((previous: any) => {
                if (!previous || Array.isArray(previous.receivedAidDeliveryIds) && previous.receivedAidDeliveryIds.includes(detail.id)) return previous;
                const inventory = { ...(previous.inventory || {}) };
                inventory[resourceKey] = (Number(inventory[resourceKey]) || 0) + amount;
                return {
                    ...previous,
                    inventory,
                    receivedAidDeliveryIds: [...(Array.isArray(previous.receivedAidDeliveryIds) ? previous.receivedAidDeliveryIds : []), detail.id],
                    pending_notifications: [{
                        id: `aid-arrived-${detail.id}`,
                        title: 'Bantuan Sekutu Tiba',
                        sender: detail.senderCountry || 'Sekutu',
                        message: `Konvoi bantuan tiba: +${amount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${resourceKey.replaceAll('_', ' ')} telah ditambahkan ke inventaris nasional.`,
                        timestamp: new Date().toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 0,
                        isRead: false,
                    }, ...(Array.isArray(previous.pending_notifications) ? previous.pending_notifications : [])],
                };
            });
        };
        window.addEventListener('neosantara_aid_arrived', handleAidArrival);
        return () => window.removeEventListener('neosantara_aid_arrived', handleAidArrival);
    }, []);

    useEffect(() => {
        initCountryIsoFromDatabase().catch(err => console.error("Failed to init country ISO from DB:", err));
        fetchBuildingMetadata()
            .then(data => setMetadata(data || {}))
            .catch(err => console.error("Failed to load metadata in MapPage:", err));
        fetch('/api/country-data?summary=true')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((summaries: CountryProfileSummary[]) => {
                if (!Array.isArray(summaries)) throw new Error('Country summary response is not an array');
                setCountryProfileSummaries(summaries);
            })
            .catch(error => console.error('Failed to preload country profile summaries:', error));
    }, []);
    const [playerNetBalanceAdjustment, setPlayerNetBalanceAdjustment] = useState<number>(0);
    const [isPaused, setIsPaused] = useState(true);
    const isPausedRef = useRef(isPaused);
    const warPauseStateRef = useRef<{ wasPaused: boolean } | null>(null);
    const dialogPauseStateRef = useRef<{ wasPaused: boolean } | null>(null);
    const [isDialogTerbukaOpen, setIsDialogTerbukaOpen] = useState(false);
    const [speed, setSpeed] = useState(1);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const currentDateRef = useRef(currentDate);
    currentDateRef.current = currentDate;

    useEffect(() => {
        isPausedRef.current = isPaused;
        if (typeof window !== 'undefined') {
            (window as any).neosantara_is_paused = isPaused;
        }
    }, [isPaused]);
    const pactHistorySignatureRef = useRef('');
    const autoRemovedEmbassyRef = useRef<{ playerCountry: string; countries: Set<string> } | null>(null);
    const simulationDateString = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, '0'),
        String(currentDate.getDate()).padStart(2, '0'),
    ].join('-');
    useNpcCountrySimulation(currentDate, countryDetail?.country_slug, metadata, isPaused);

    useEffect(() => {
        const refreshNpcCountryDetail = () => {
            setCountryDetail((previous: Record<string, unknown> | null) => {
                if (!previous) return previous;
                const updated = applyNpcCountrySimulationState(previous);
                return updated === previous ? previous : updated;
            });
        };
        window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcCountryDetail);
        return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcCountryDetail);
    }, []);

    useEffect(() => {
        setSimulationDate(currentDate);
        const playerCountry = String(countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || '').trim();
        const activePartners: string[] = Array.isArray(countryDetail?.nonAggressionPacts)
            ? countryDetail.nonAggressionPacts.filter((partner: unknown): partner is string => typeof partner === 'string')
            : [];
        const savedHistory: unknown[] = Array.isArray(countryDetail?.nonAggressionPactHistory)
            ? countryDetail.nonAggressionPactHistory
            : [];
        const history = savedHistory.filter((period: unknown): period is NonAggressionPactPeriod => {
            if (!period || typeof period !== 'object') return false;
            const candidate = period as Partial<NonAggressionPactPeriod>;
            return typeof candidate.country === 'string' &&
                typeof candidate.partner === 'string' &&
                typeof candidate.startDate === 'string';
        });

        activePartners.forEach(partner => {
            const hasActiveHistory = history.some(period =>
                period.country.toLowerCase().trim() === playerCountry.toLowerCase() &&
                period.partner.toLowerCase().trim() === partner.toLowerCase().trim() &&
                !period.endDate
            );
            if (!hasActiveHistory && playerCountry) {
                // Legacy saves have no signing date; treat those pacts as active since the game began.
                history.push({ country: playerCountry, partner, startDate: '2026-01-01' });
            }
        });

        const historySignature = JSON.stringify(history);
        if (historySignature !== pactHistorySignatureRef.current) {
            pactHistorySignatureRef.current = historySignature;
            setNonAggressionPactHistory(history);
            window.dispatchEvent(new CustomEvent('country_relations_updated'));
        }
    }, [countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name, countryDetail?.nonAggressionPacts, countryDetail?.nonAggressionPactHistory, currentDate, simulationDateString]);

    useEffect(() => {
        const playerCountry = String(
            selectedCountry?.country ||
            countryDetail?.country ||
            countryDetail?.nama_negara ||
            countryDetail?.name ||
            ''
        ).trim();
        if (!playerCountry || !countryDetail) return;

        void syncNationalizationDiplomacyRelations(
            playerCountry,
            countryDetail.sector_nationalization,
            countryDetail.nationalization_diplomacy_month_counter
        ).catch((error) => {
            console.error('Gagal memperbarui dampak hubungan nasionalisasi:', error);
        });
    }, [
        selectedCountry?.country,
        countryDetail?.country,
        countryDetail?.nama_negara,
        countryDetail?.name,
        countryDetail?.sector_nationalization,
        countryDetail?.nationalization_diplomacy_month_counter,
    ]);

    useEffect(() => {
        if (!countryDetail) {
            setEconomicSanctionCounts({});
            return;
        }
        const sanctions = countryDetail.economicSanctions;
        setEconomicSanctionCounts(
            sanctions && typeof sanctions === 'object' && !Array.isArray(sanctions) ? sanctions : {}
        );
    }, [countryDetail?.economicSanctions]);

    useEffect(() => {
        const playerCountry = String(countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || '').trim();
        const sanctions = countryDetail?.relationSanctionModifiers;
        setRelationSanctionModifiers(
            playerCountry,
            sanctions && typeof sanctions === 'object' && !Array.isArray(sanctions) ? sanctions : {}
        );
    }, [countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name, countryDetail?.relationSanctionModifiers]);

    useEffect(() => {
        if (!countryDetail) {
            autoRemovedEmbassyRef.current = null;
            return;
        }
        const playerCountry = String(countryDetail.country || countryDetail.nama_negara || countryDetail.name || '').trim();
        const autoRemoved: string[] = Array.isArray(countryDetail.autoRemovedEmbassies)
            ? countryDetail.autoRemovedEmbassies.map((entry: unknown) => {
                if (entry && typeof entry === 'object' && 'id' in entry) {
                    return String((entry as { id: unknown }).id);
                }
                return String(entry || '').toLowerCase().trim();
            })
            : [];
        const previous = autoRemovedEmbassyRef.current;
        if (!previous || previous.playerCountry !== playerCountry) {
            autoRemovedEmbassyRef.current = { playerCountry, countries: new Set(autoRemoved) };
            return;
        }
        const newlyRemoved = autoRemoved.filter(name => name && !previous.countries.has(name));
        if (newlyRemoved.length > 0) {
            setPlayerNetBalanceAdjustment(value => value + newlyRemoved.length * 10);
            newlyRemoved.forEach(name => previous.countries.add(name));
        }
    }, [countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name, countryDetail?.autoRemovedEmbassies]);

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveNameInput, setSaveNameInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [existingSaveFiles, setExistingSaveFiles] = useState<any[]>([]);
    const [isLoadingExistingSaves, setIsLoadingExistingSaves] = useState(false);
    const [selectedSaveIdToOverwrite, setSelectedSaveIdToOverwrite] = useState<number | null>(null);
    const [isCreatingNewSaveSlot, setIsCreatingNewSaveSlot] = useState(false);
    const [saveToOverwriteConfirm, setSaveToOverwriteConfirm] = useState<any | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPresidentMenuOpen, setIsPresidentMenuOpen] = useState(false);
    const [isMapSettingsModalOpen, setIsMapSettingsModalOpen] = useState(false);
    const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('Peta Taktis');

    const [isDiplomacyMapActive, setIsDiplomacyMapActive] = useState(false);
    const [resetTrigger, setResetTrigger] = useState(false);
    const [productionDeepLink, setProductionDeepLink] = useState<{ tab: string; key: string } | null>(null);
    const [tempatUmumDeepLink, setTempatUmumDeepLink] = useState<string | null>(null);
    const [kesejahteraanDeepLink, setKesejahteraanDeepLink] = useState<boolean>(false);
    const [kesejahteraanInitialTab, setKesejahteraanInitialTab] = useState<"statistik" | "naikkan">("statistik");
    const [countryDetailModalOpen, setCountryDetailModalOpen] = useState(false);
    const [countryDetailModalName, setCountryDetailModalName] = useState<string | null>(null);
    const [countryDetailModalCity, setCountryDetailModalCity] = useState<string | null>(null);
    const [countryDetailModalCityId, setCountryDetailModalCityId] = useState<string | null>(null);
    const [aiConstructionNavigation, setAiConstructionNavigation] = useState<{
        countryName: string;
        buildingKey?: string;
        targetTab?: string;
    } | null>(null);
    const [autoBuildEmbassyState, setAutoBuildEmbassyState] = useState(false);
    const [requireEmbassyModalOpen, setRequireEmbassyModalOpen] = useState(false);
    const [requireEmbassyPartner, setRequireEmbassyPartner] = useState<string | null>(null);
    const [playerDetailModalOpen, setPlayerDetailModalOpen] = useState(false);
    const [inboxModalOpen, setInboxModalOpen] = useState(false);
    const [aparatConfirmState, setAparatConfirmState] = useState<{
        isOpen: boolean;
        notification: any | null;
    }>({
        isOpen: false,
        notification: null,
    });
    const [hasilBubarkanState, setHasilBubarkanState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
        casualties?: number;
        deadCount?: number;
        injuredCount?: number;
        remainingMassa?: number;
        actionName?: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success',
    });
    const [giftModalOpen, setGiftModalOpen] = useState(false);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [tradeRejectionState, setTradeRejectionState] = useState<{
        isOpen: boolean;
        partnerCountry: string;
        tradeType: 'jual' | 'beli';
        reason?: 'closed_system' | 'high_centralization';
        ekonomiNegara?: string;
    }>({
        isOpen: false,
        partnerCountry: '',
        tradeType: 'jual',
    });
    const [closedTradeRejectionState, setClosedTradeRejectionState] = useState<{
        isOpen: boolean;
        partnerCountry: string;
        centralizationScore: number;
        averageNationalization: number;
        ideologyModifier: number;
        religionModifier: number;
        reasons: string[];
    }>({
        isOpen: false,
        partnerCountry: '',
        centralizationScore: 0,
        averageNationalization: 0,
        ideologyModifier: 1,
        religionModifier: 1,
        reasons: [],
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const gameWindow = window as any;
        const normalizeKey = (value: unknown) =>
            String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const updateDiplomacyMapColors = () => {
            gameWindow.neosantara_diplomacy_map_active = isDiplomacyMapActive;
            if (!isDiplomacyMapActive) {
                gameWindow.neosantara_diplomacy_map_colors = {};
                return;
            }

            const features = gameWindow.neosantara_world_geojson_features;
            if (!Array.isArray(features)) return;

            const playerCountryName = String(
                selectedCountry?.country ||
                countryDetail?.country ||
                countryDetail?.nama_negara ||
                countryDetail?.name ||
                ''
            ).trim();
            const colors: Record<string, string> = {};
            const featureColors: Array<string | undefined> = [];
            const colorForRelation = (relation: number) => {
                if (relation <= 25) return '#f87171';
                if (relation <= 40) return '#fb7185';
                if (relation <= 65) return '#facc15';
                if (relation <= 80) return '#4ade80';
                return '#00FFAA';
            };

            features.forEach((feature: { properties?: Record<string, unknown> }) => {
                const properties = feature.properties;
                if (!properties) {
                    featureColors.push(undefined);
                    return;
                }

                const isoKeys = [
                    properties.ISO_A2,
                    properties.ISO_A2_EH,
                    properties.ISO_A3,
                    properties.ISO_A3_EH,
                ].map(normalizeKey).filter(Boolean);
                const nameKeys = [
                    properties.NAME,
                    properties.ADMIN,
                    properties.NAME_LONG,
                    properties.GEOUNIT,
                    properties.NAME_ID,
                    properties.NAME_EN,
                    properties.NAME_IND,
                ].map(normalizeKey).filter(Boolean);
                const country = COUNTRIES_DATA.find(candidate => {
                    const countryIso = normalizeKey(candidate.iso);
                    const countryName = normalizeKey(candidate.country);
                    return isoKeys.includes(countryIso) ||
                        nameKeys.includes(countryName) ||
                        nameKeys.some(name => name.length > 4 && countryName.length > 4 &&
                            (name.includes(countryName) || countryName.includes(name)));
                });

                if (!country) {
                    featureColors.push(undefined);
                    return;
                }

                const relation = getRelationValue(playerCountryName, country.country, currentDate);
                const color = colorForRelation(relation);
                featureColors.push(color);
                [...isoKeys, ...nameKeys].forEach(key => {
                    colors[key] = color;
                });
            });

            gameWindow.neosantara_diplomacy_map_colors = colors;
            gameWindow.neosantara_diplomacy_map_feature_colors = featureColors;
        };

        const runColorsChanged = () => {
            updateDiplomacyMapColors();
            window.dispatchEvent(new Event('map_feature_colors_dirty'));
        };
        // Gabungkan burst event (notifikasi inbox/berita) menjadi satu pekerjaan saat browser idle
        let scheduled = false;
        let rafId = 0;
        let idleId: number | null = null;
        const notifyColorsChanged = () => {
            if (scheduled) return;
            scheduled = true;
            rafId = requestAnimationFrame(() => {
                const run = () => {
                    scheduled = false;
                    idleId = null;
                    runColorsChanged();
                };
                const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, o?: { timeout: number }) => number);
                if (ric) idleId = ric(run, { timeout: 300 });
                else setTimeout(run, 0);
            });
        };
        runColorsChanged();
        window.addEventListener('country_relations_updated', notifyColorsChanged);
        window.addEventListener('world_map_features_ready', notifyColorsChanged);
        window.addEventListener('map_territory_color_updated', notifyColorsChanged);
        window.addEventListener('annexation_completed', notifyColorsChanged);
        return () => {
            cancelAnimationFrame(rafId);
            const cic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
            if (idleId !== null && cic) cic(idleId);
            window.removeEventListener('country_relations_updated', notifyColorsChanged);
            window.removeEventListener('world_map_features_ready', notifyColorsChanged);
            window.removeEventListener('map_territory_color_updated', notifyColorsChanged);
            window.removeEventListener('annexation_completed', notifyColorsChanged);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDiplomacyMapActive, selectedCountry?.country, countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name, isDiplomacyMapActive ? simulationDateString.slice(0, 7) : '']);

    const handleTopNavSelect = (view: 'map' | 'diplomacy') => {
        setIsDiplomacyMapActive(view === 'diplomacy');
    };
    const openInbox = useCallback(() => {
        setHasilBubarkanState(prev => ({ ...prev, isOpen: false }));
        setInboxModalOpen(true);
    }, []);
    const [newsList, setNewsListRaw] = useState<NewsItemData[]>([]);
    const setNewsList = useCallback((action: React.SetStateAction<NewsItemData[]>) => {
        startTransition(() => setNewsListRaw(action));
    }, []);
    const lastObservedNewsResetDateRef = useRef<string | null>(null);

    const isMapFocusedRef = useRef(false);

    const openGameMenu = useCallback(() => {
        setActiveMenu('Peta Taktis');
        setCountryDetailModalOpen(false);
        setPlayerDetailModalOpen(false);
        setInboxModalOpen(false);
        setGiftModalOpen(false);
        setNewsModalOpen(false);
        setPenelitianModalOpen(false);
        setMissionModalOpen(false);
        setIsSaveModalOpen(false);
        setIsRestartConfirmOpen(false);
        setIsPresidentMenuOpen(true);
    }, []);

    const handleFocusHome = useCallback(() => {
        // 1. Tutup semua modal overlay yang sedang terbuka agar peta terlihat jelas
        setIsPresidentMenuOpen(false);
        setCountryDetailModalOpen(false);
        setPlayerDetailModalOpen(false);
        setInboxModalOpen(false);
        setGiftModalOpen(false);
        setNewsModalOpen(false);
        setPenelitianModalOpen(false);
        setMissionModalOpen(false);
        setIsSaveModalOpen(false);
        setIsRestartConfirmOpen(false);
        setActiveMenu('Peta Taktis');

        // 2. Dapatkan ISO negara player
        let iso = selectedCountry?.iso;
        if (!iso) {
            const rawName = (countryDetail?.country || countryDetail?.nama_negara || '').toLowerCase().trim();
            const found = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === rawName);
            if (found) iso = found.iso;
        }
        if (!iso && typeof window !== 'undefined') {
            const param = new URLSearchParams(window.location.search).get('country');
            if (param) {
                const found = COUNTRIES_DATA.find(
                    c => c.country.toLowerCase() === param.toLowerCase() || c.iso.toLowerCase() === param.toLowerCase()
                );
                if (found) iso = found.iso;
            }
        }

        // 3. Toggle Zoom: Jika sudah ter-fokus, kembalikan zoom ke default (overview). Jika belum, fokus ke negara player.
        if (isMapFocusedRef.current) {
            const mapCanvas = document.getElementById('map-canvas');
            if (mapCanvas) {
                // Trigger event wheel untuk mereset scale dan offset kembali ke default (1.0)
                mapCanvas.dispatchEvent(new WheelEvent('wheel', {
                    deltaY: 50000,
                    clientX: window.innerWidth / 2,
                    clientY: window.innerHeight / 2,
                    bubbles: true,
                }));
            }
            isMapFocusedRef.current = false;
        } else if (iso && wasmModuleRef.current?.set_selected_country_on_map) {
            try {
                wasmModuleRef.current.set_selected_country_on_map(iso, true);
                isMapFocusedRef.current = true;
            } catch (err) {
                console.error("Gagal melakukan zoom/pan ke negara player:", err);
            }
        }
    }, [selectedCountry, countryDetail, setActiveMenu]);

    useEffect(() => {
        const onFocusEvent = () => handleFocusHome();
        window.addEventListener('focus_home_country', onFocusEvent);
        return () => {
            window.removeEventListener('focus_home_country', onFocusEvent);
        };
    }, [handleFocusHome]);

    // 🎮 Integrasi Keyboard Shortcuts Neosantara
    useKeyboardShortcuts({
        onFocusHome: handleFocusHome,
        onOpenMission: () => {
            setMissionModalOpen(true);
            setPenelitianModalOpen(false);
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setIsPresidentMenuOpen(false);
            setActiveMenu('');
        },
        onMenuSelect: (target) => {
            // Tutup paksa modal overlay yang sedang terbuka saat membuka menu baru
            setIsPresidentMenuOpen(false);
            setCountryDetailModalOpen(false);
            setPlayerDetailModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setIsSaveModalOpen(false);
            setIsRestartConfirmOpen(false);
            setMissionModalOpen(false);

            // Tentukan menuId jika target adalah array (siklus sub-tab dengan huruf yang sama)
            let menuId: string;
            if (Array.isArray(target)) {
                const currentIndex = target.indexOf(activeMenu);
                if (currentIndex >= 0) {
                    menuId = target[(currentIndex + 1) % target.length];
                } else {
                    menuId = target[0];
                }
            } else {
                menuId = target;
            }

            if (menuId === 'Menu:Penelitian' || menuId === 'penelitian') {
                setInboxModalOpen(false);
                setPenelitianModalOpen(true);
                setMissionModalOpen(false);
                setActiveMenu("");
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('reset_penelitian_selection'));
                }
            } else if (menuId === 'inbox' || menuId === 'Menu:Inbox') {
                setPenelitianModalOpen(false);
                setMissionModalOpen(false);
                openInbox();
                setActiveMenu("");
            } else {
                setPenelitianModalOpen(false);
                setMissionModalOpen(false);
                setInboxModalOpen(false);
                if (activeMenu === menuId) {
                    setActiveMenu("");
                    setTimeout(() => setActiveMenu(menuId), 0);
                } else {
                    setActiveMenu(menuId);
                }
            }
        },
        onCloseAllModals: () => {
            // M -> Tutup paksa semua modal & kembali ke map utama
            setIsPresidentMenuOpen(false);
            setCountryDetailModalOpen(false);
            setPlayerDetailModalOpen(false);
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setPenelitianModalOpen(false);
            setMissionModalOpen(false);
            setIsSaveModalOpen(false);
            setIsRestartConfirmOpen(false);

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('close_all_game_modals'));
            }

            setActiveMenu('Peta Taktis');
        },
        onCloseMenu: () => {
            if (missionModalOpen) {
                setMissionModalOpen(false);
            } else if (penelitianModalOpen) {
                setPenelitianModalOpen(false);
            } else if (isPresidentMenuOpen) {
                setIsPresidentMenuOpen(false);
            } else if (activeMenu && activeMenu !== 'Peta Taktis') {
                setActiveMenu('Peta Taktis');
            } else if (countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || isSaveModalOpen || isRestartConfirmOpen) {
                setCountryDetailModalOpen(false);
                setPlayerDetailModalOpen(false);
                setInboxModalOpen(false);
                setGiftModalOpen(false);
                setNewsModalOpen(false);
                setIsSaveModalOpen(false);
                setIsRestartConfirmOpen(false);
            } else {
                openGameMenu();
            }
        },
        onTogglePlayPause: () => {
            const nextPaused = !isPausedRef.current;
            isPausedRef.current = nextPaused;
            if (typeof window !== 'undefined') {
                (window as any).neosantara_is_paused = nextPaused;
            }
            if (calendarRef.current) {
                calendarRef.current.controls.handlePlayPauseClick(!nextPaused);
            }
            if (timeManagerRef.current) {
                timeManagerRef.current.setPaused(nextPaused);
                if (pendingDateRef.current) {
                    schedulePendingDateCommit(true);
                } else {
                    const cur = timeManagerRef.current.getCurrentDate();
                    setCurrentDate(cur);
                }
            }
            setIsPaused(nextPaused);
        },
        onTimeSpeedChange: (delta) => {
            if (calendarRef.current) {
                const newSpeed = delta > 0
                    ? calendarRef.current.controls.handleSpeedClick()
                    : Math.max(1, speed - 1);
                setSpeed(newSpeed);
                if (timeManagerRef.current) {
                    timeManagerRef.current.setSpeed(newSpeed);
                }
            }
        },
    });

    // State untuk tracking perubahan warna negara akibat aneksasi
    // Format: { "NamaNegara": "WarnaHex", ... }
    // Contoh: { "Afganistan": "#E8C303" } berarti Afganistan sudah dianeksasi dan warnanya diubah ke kuning
    const [countryColorOverrides, setCountryColorOverrides] = useState<Record<string, string>>({});
    const annexedContributionRef = useRef<Record<string, AnnexedContribution>>({});

    const recordAnnexedTerritory = (
        targetCountry: string,
        targetIso: string,
        attackerCountry: string,
        attackerIso: string,
        attackerColor: string,
        isPbbOccupied: boolean = false
    ) => {
        const annexationInfo = { attackerCountry, attackerIso, isPbbOccupied };
        const targetNorm = targetCountry.toLowerCase().trim();
        const mapCountry = COUNTRIES_DATA.find(
            country => country.country.toLowerCase().trim() === targetNorm
        ) || COUNTRIES_DATA.find(
            country => country.iso.toLowerCase() === targetIso.toLowerCase()
        );
        const targetIsoNorm = (mapCountry?.iso || targetIso).toLowerCase();
        const targetAliases = new Set([
            targetNorm,
            targetIsoNorm,
            `iso_${targetIsoNorm}`
        ]);
        const overrideUpdates: Record<string, string> = {
            [targetCountry]: attackerColor,
            [targetNorm]: attackerColor,
            [targetIsoNorm]: attackerColor,
            [`iso_${targetIsoNorm}`]: attackerColor
        };
        if (targetNorm === 'mongolia') {
            overrideUpdates.mongolia = attackerColor;
            overrideUpdates.mn = attackerColor;
            overrideUpdates.iso_mn = attackerColor;
        }

        setCountryDetail((previous: Record<string, unknown> | null) => {
            if (!previous) return previous;
            const normalizeCountryName = (name: unknown) => String(name || '').toLowerCase().trim();
            const matchesTarget = (name: unknown) => targetAliases.has(normalizeCountryName(name));
            const embassies = Array.isArray(previous.embassies) ? previous.embassies : [];
            const removedEmbassies = Array.isArray(previous.removedEmbassies) ? previous.removedEmbassies : [];
            const constructions = Array.isArray(previous.ongoingEmbassyConstructions)
                ? previous.ongoingEmbassyConstructions
                : [];
            return {
                ...previous,
                embassies: embassies.filter((embassy: unknown) => {
                    const partner = typeof embassy === 'string'
                        ? embassy
                        : typeof embassy === 'object' && embassy !== null && 'mitra' in embassy
                            ? (embassy as { mitra?: unknown }).mitra
                            : '';
                    return !matchesTarget(partner);
                }),
                ongoingEmbassyConstructions: constructions.filter(
                    (construction: { targetCountry?: unknown }) => !matchesTarget(construction.targetCountry)
                ),
                removedEmbassies: Array.from(new Set([
                    ...removedEmbassies.filter((name: unknown) => !matchesTarget(name)),
                    targetCountry
                ]))
            };
        });

        if (typeof window === 'undefined') return;

        const nextOverrides = {
            ...((window as any).neosantara_country_color_overrides || {}),
            ...overrideUpdates
        };
        const previousAnnexed = (window as any).neosantara_annexed_countries || {};
        const nextAnnexed = {
            ...previousAnnexed,
            [targetCountry]: annexationInfo,
            [targetNorm]: annexationInfo,
            [targetIsoNorm]: annexationInfo,
            [`iso_${targetIsoNorm}`]: annexationInfo
        };
        const normalizedTargetCountry = targetCountry.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedTerritoryKeys = new Set<string>();
        const returnedTerritories: string[] = [];
        const returnedToCountries = new Set<string>();
        Object.entries(previousAnnexed).forEach(([key, info]: [string, any]) => {
            if (
                !info?.returnedToCountry ||
                info?.returnedToColor !== '#10b981' ||
                info?.attackerCountry?.toLowerCase().replace(/[^a-z0-9]/g, '') !== normalizedTargetCountry
            ) {
                return;
            }

            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const territory = COUNTRIES_DATA.find(country =>
                country.country.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey ||
                country.iso.toLowerCase() === normalizedKey ||
                `iso${country.iso.toLowerCase()}` === normalizedKey
            );
            if (!territory || normalizedTerritoryKeys.has(territory.country.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                return;
            }

            const territoryNorm = territory.country.toLowerCase().replace(/[^a-z0-9]/g, '');
            const territoryIsoNorm = territory.iso.toLowerCase();
            const territoryAliases = new Set([territoryNorm, territoryIsoNorm, `iso${territoryIsoNorm}`]);
            normalizedTerritoryKeys.add(territoryNorm);
            returnedTerritories.push(territory.country);
            returnedToCountries.add(info.returnedToCountry);

            Object.entries(previousAnnexed).forEach(([alias, aliasInfo]: [string, any]) => {
                if (
                    territoryAliases.has(alias.toLowerCase().replace(/[^a-z0-9]/g, '')) &&
                    aliasInfo?.attackerCountry?.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedTargetCountry
                ) {
                    const { returnedToCountry, returnedToIso, ...reclaimedInfo } = aliasInfo;
                    nextAnnexed[alias] = {
                        ...reclaimedInfo,
                        attackerCountry: returnedToCountry,
                        attackerIso: returnedToIso,
                    };
                }
            });

            [
                territory.country,
                territoryNorm,
                territoryIsoNorm,
                `iso_${territoryIsoNorm}`,
            ].forEach(alias => {
                nextAnnexed[alias] = {
                    attackerCountry: info.returnedToCountry,
                    attackerIso: info.returnedToIso,
                };
                overrideUpdates[alias] = info.returnedToColor;
                nextOverrides[alias] = info.returnedToColor;
            });
            Object.keys(nextOverrides).forEach(alias => {
                if (territoryAliases.has(alias.toLowerCase().replace(/[^a-z0-9]/g, ''))) {
                    overrideUpdates[alias] = info.returnedToColor;
                    nextOverrides[alias] = info.returnedToColor;
                }
            });
        });

        setCountryColorOverrides(previous => ({ ...previous, ...overrideUpdates }));
        (window as any).neosantara_country_color_overrides = nextOverrides;
        (window as any).neosantara_annexed_countries = nextAnnexed;
        mapFeatureColorSyncRef.current();
        window.dispatchEvent(new CustomEvent('map_territory_color_updated', {
            detail: {
                targetCountry,
                newColor: attackerColor,
                attackerCountry,
                returnedTerritories,
                returnedToCountries: Array.from(returnedToCountries),
            }
        }));
    };

    const recordCityCapture = (
        city: CityOwnerEntry,
        targetCountry: string,
        attackerCountry: string,
        attackerIso: string,
        attackerColor: string,
        isPbbOccupied = false
    ) => {
        if (typeof window === 'undefined' || !city.cityId) {
            console.error('[CityAnnexation] Cannot record city ownership without a browser and city ID.', city);
            return false;
        }

        const previousOwners = (window as Window & {
            neosantara_city_owner?: CityOwnerStore;
        }).neosantara_city_owner || {};
        const targetCitiesBeforeCapture = getMapCities().filter(candidate =>
            normalizeMapKey(getCurrentCityOwner(candidate)) === normalizeMapKey(targetCountry)
        );
        const nextOwners: CityOwnerStore = {
            ...previousOwners,
            [city.cityId]: {
                ...city,
                cell: computeCityRegionCell(city),
                ownerCountry: attackerCountry,
                ownerIso: attackerIso.toLowerCase(),
                ownerColor: attackerColor,
            },
        };
        (window as Window & { neosantara_city_owner?: CityOwnerStore }).neosantara_city_owner = nextOwners;
        console.info('[CityAnnexation][4-store] Ownership stored', nextOwners[city.cityId], {
            wasmReady: Boolean(wasmModuleRef.current),
        });
        wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
        wasmModuleRef.current?.set_city_ownership_on_map(Object.values(nextOwners));
        mapFeatureColorSyncRef.current();

        const hasRemainingTargetCities = targetCitiesBeforeCapture.some(candidate => {
            const cityId = getCityOwnerId(candidate.iso, candidate.capital);
            return normalizeMapKey(nextOwners[cityId]?.ownerCountry || candidate.country) ===
                normalizeMapKey(targetCountry);
        });
        const countryCollapsed = city.isCapital ||
            (targetCitiesBeforeCapture.length > 0 && !hasRemainingTargetCities);

        window.dispatchEvent(new CustomEvent('map_territory_color_updated', {
            detail: {
                targetCountry,
                targetCityId: city.cityId,
                targetCityName: city.cityName,
                attackerCountry,
                attackerIso,
                ownerColor: attackerColor,
            },
        }));

        if (countryCollapsed) {
            const targetIso = COUNTRIES_DATA.find(country =>
                normalizeMapKey(country.country) === normalizeMapKey(targetCountry)
            )?.iso || city.countryIso;
            recordAnnexedTerritory(
                targetCountry,
                targetIso,
                attackerCountry,
                attackerIso,
                attackerColor,
                isPbbOccupied
            );
        }

        return countryCollapsed;
    };

    // Territory changes are runtime-only and are restored from an explicitly loaded save.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).neosantara_country_color_overrides = {};
            (window as any).neosantara_annexed_countries = {};
            (window as any).neosantara_city_owner = {};
        }
    }, []);

    // Sinkronkan override ke window agar dibaca hook canvas
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).neosantara_country_color_overrides = countryColorOverrides;
        }
    }, [countryColorOverrides]);

    useEffect(() => {
        const syncTerritoryColorOverrides = () => {
            const overrides = (window as any).neosantara_country_color_overrides;
            if (overrides && typeof overrides === 'object') {
                setCountryColorOverrides({ ...overrides });
            }
            wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
            const cityOwners = (window as Window & {
                neosantara_city_owner?: CityOwnerStore;
            }).neosantara_city_owner || {};
            wasmModuleRef.current?.set_city_ownership_on_map(Object.values(cityOwners));
        };
        const handleCapitalChanged = (e: Event) => {
            const newCap = (e as CustomEvent<{ newCapital?: string }>)?.detail?.newCapital;
            if (newCap && typeof window !== 'undefined') {
                (window as Window & { neosantara_player_capital?: string }).neosantara_player_capital = newCap;
            }
            wasmModuleRef.current?.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
        };
        window.addEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
        window.addEventListener('neosantara_capital_changed', handleCapitalChanged);
        return () => {
            window.removeEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
            window.removeEventListener('neosantara_capital_changed', handleCapitalChanged);
        };
    }, []);

    // Listener custom event ketika pemain berhasil meminta negara sekutu menyerang negara target
    useEffect(() => {
        const handleRequestedInvasion = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (!detail) return;

            const { attackerCountry, targetCountry, targetCityId, targetCityName, amount } = detail;

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            if (areSameWarCountry(attackerCountry, targetCountry)) {
                setNotifications(prev => [{
                    id: `notif-self-invasion-block-${Date.now()}`,
                    title: 'Serangan Sekutu Dibatalkan',
                    sender: 'Kementerian Pertahanan',
                    message: `Serangan dibatalkan karena ${attackerCountry} dan ${targetCountry} adalah negara yang sama.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 0,
                    isRead: false,
                }, ...prev]);
                return;
            }
            const attackerIso = getIsoForCountryName(attackerCountry) || 'un';
            const targetIso = getIsoForCountryName(targetCountry) || 'un';
            if (typeof targetCityId !== 'string' || typeof targetCityName !== 'string') {
                console.error('[RequestedInvasion] Target city was not provided.', detail);
                setNotifications(prev => [{
                    id: `notif-requested-invasion-no-city-${Date.now()}`,
                    title: '📍 KOTA TARGET BELUM DIPILIH',
                    sender: 'Kementerian Pertahanan',
                    message: `Permintaan serangan ${attackerCountry} terhadap ${targetCountry} dibatalkan karena kota target belum dipilih.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 0,
                    isRead: false,
                }, ...prev]);
                return;
            }
            const requestedTargetCity = resolveWarTargetCity(
                targetCountry,
                targetCityId,
                targetCityName
            );
            if (!requestedTargetCity || requestedTargetCity.cityId !== targetCityId) {
                console.error('[RequestedInvasion] Selected target city is unavailable for the selected country.', {
                    attackerCountry,
                    targetCountry,
                    targetCityId,
                    targetCityName,
                    resolvedCityId: requestedTargetCity?.cityId,
                });
                setNotifications(prev => [{
                    id: `notif-requested-invasion-invalid-city-${Date.now()}`,
                    title: '📍 KOTA TARGET TIDAK VALID',
                    sender: 'Kementerian Pertahanan',
                    message: `Serangan ${attackerCountry} terhadap ${targetCountry} dibatalkan karena ${targetCityName} sudah tidak dimiliki negara target atau tidak tersedia pada data peta. Pilih kota target yang masih valid.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 0,
                    isRead: false,
                }, ...prev]);
                return;
            }

            const paymentAmount = Math.max(0, Number(amount) || 0);
            const acceptanceChance = Math.min(100, Math.floor((paymentAmount / 100000) * 100));
            if (Math.random() * 100 >= acceptanceChance) {
                setNotifications(prev => [{
                    id: `notif-requested-invasion-declined-${Date.now()}`,
                    title: '📩 PERMINTAAN SERANGAN DITOLAK',
                    sender: `Kementerian Luar Negeri — ${attackerCountry}`,
                    message: `${attackerCountry} menolak permintaan serangan terhadap ${targetCountry}. Peluang persetujuan dari tawaran ${paymentAmount.toLocaleString('id-ID')} NEO adalah ${acceptanceChance}%.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 0,
                    isRead: false,
                }, ...prev]);
                return;
            }

            const warBanActive = hasActiveGlobalWarBan();
            const hasInvasionMandate = hasActiveApprovedInvasionResolution(attackerCountry, targetCountry);
            if (warBanActive) {
                if (Math.random() >= 0.2) {
                    setNotifications(prev => [{
                        id: `notif-war-ban-block-${Date.now()}`,
                        title: '🕊️ SERANGAN DIBATALKAN OLEH RESOLUSI PBB',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                        message: `Rencana serangan ${attackerCountry} terhadap ${targetCountry} diblokir karena larangan perang global masih berlaku.`,
                        timestamp: dateStr,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...prev]);
                    return;
                }
            }
            if (warBanActive) {
                const sanctionsNotifications = submitWarBanViolationSanctions(attackerCountry, targetCountry, dateStr);
                setNotifications(prev => [...sanctionsNotifications, ...prev]);
            }

            setNpcWarQueue(previous => [...previous, {
                attacker: attackerCountry,
                target: targetCountry,
                isNpcWar: !areSameWarCountry(
                    targetCountry,
                    selectedCountry?.country || countryDetail?.country || ''
                ),
                requestedInvasion: true,
                targetCityId: requestedTargetCity?.cityId,
                targetCityName: requestedTargetCity?.cityName,
                targetCityLat: requestedTargetCity?.lat,
                targetCityLng: requestedTargetCity?.lng,
                targetCityCountryIso: requestedTargetCity?.countryIso,
                targetCityIsCapital: requestedTargetCity?.isCapital,
                resolutionViolationAuthorized: !hasInvasionMandate,
            }]);
            const travelEstimate = estimateTravelTime(attackerCountry, targetCountry);
            if (travelEstimate) {
                const arrivalDate = new Date(currentDate);
                arrivalDate.setHours(0, 0, 0, 0);
                arrivalDate.setDate(arrivalDate.getDate() + travelEstimate.days);
                window.dispatchEvent(new CustomEvent('requested_invasion_arrival_scheduled', {
                    detail: {
                        attackerCountry,
                        targetCountry,
                        arrivalDate: [
                            arrivalDate.getFullYear(),
                            String(arrivalDate.getMonth() + 1).padStart(2, '0'),
                            String(arrivalDate.getDate()).padStart(2, '0'),
                        ].join('-'),
                    },
                }));
            }

            // Berita deklarasi perang dibuat saat serangan diluncurkan; wilayah berubah setelah hasil perang.
            const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
            const newNewsItems: NewsItemData[] = [invNews];

            // Tambahkan ke daftar Berita & Update Geopolitik
            setNewsList(prev => [...newNewsItems, ...prev]);

            // Tambahkan Notifikasi Pertahanan / Geopolitik ke Inbox Player
            const notifMsg: NotificationMessage = {
                id: `notif-req-inv-${Date.now()}`,
                title: `⚔️ OPERASI SERANGAN SEKUTU DILUNCURKAN`,
                sender: `Kementerian Pertahanan & Sekutu (${attackerCountry})`,
                message: `Permintaan serangan diterima! Angkatan Bersenjata ${attackerCountry} sedang bergerak menuju ${targetCountry} setelah menerima tawaran ${paymentAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO. Peluang persetujuan: ${acceptanceChance}%.`,
                timestamp: dateStr,
                type: 'peringkat',
                value: 100,
                isRead: false
            };

            setNotifications(prev => [notifMsg, ...prev]);
        };

        window.addEventListener('trigger_requested_invasion', handleRequestedInvasion);

        const handlePlayerAttack = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (!detail) return;

            const { actionType, targetCountry, isPbbCoalition } = detail;
            console.info('[CityAnnexation][2-event] trigger_player_attack received', detail);
            const attackerCountry = countryDetail?.country || 'China';
            const attackerIso = (countryDetail?.iso || 'cn').toLowerCase();
            if (areSameWarCountry(attackerCountry, targetCountry, attackerIso, getIsoForCountryName(targetCountry))) {
                setNotifications(prev => [{
                    id: `notif-self-attack-block-${Date.now()}`,
                    title: 'Serangan Dibatalkan',
                    sender: 'Kementerian Pertahanan',
                    message: `Serangan dibatalkan karena ${targetCountry} adalah negara Anda sendiri.`,
                    timestamp: currentDate.toISOString().slice(0, 10),
                    type: 'peringkat',
                    value: 0,
                    isRead: false,
                }, ...prev]);
                return;
            }
            const targetIso = getIsoForCountryName(targetCountry) || 'un';

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            const newNewsItems: NewsItemData[] = [];

            const isInvasionAction = actionType === 'aneksasi' || actionType === 'jarah';
            if (isInvasionAction) {
                // Perang sudah dimenangkan; larangan PBB/sanksi sudah diproses saat perang dimulai
                // (handleStartWarAnimation). Jangan membatalkan hasil aneksasi di sini.
                if (hasActiveGlobalWarBan()) {
                    console.warn('[CityAnnexation][3-handler] Global war ban active; war already fought, applying result.');
                }

                const hasInvasionMandate = hasActiveApprovedInvasionResolution(attackerCountry, targetCountry);
                if (!hasInvasionMandate) {
                    const reason = hasActiveApprovedInvasionResolutionForDifferentTarget(attackerCountry, targetCountry)
                        ? 'wrong_military_target'
                        : 'missing_military_resolution';
                    const expelledOrganizations = expelCountryFromOrganizations(attackerCountry);
                    if (expelledOrganizations.length > 0) {
                        setNotifications(prev => [{
                            id: `notif-organization-expulsion-${Date.now()}`,
                            title: '🚫 KEANGGOTAAN ORGANISASI INTERNASIONAL DICABUT',
                            sender: 'Sekretariat Perserikatan Bangsa-Bangsa & Komunitas Global',
                            message: `${attackerCountry} dikeluarkan secara tidak hormat dari organisasi internasional (${expelledOrganizations.join(', ')}) karena menyerang ${targetCountry} tanpa resolusi invasi yang disetujui.`,
                            timestamp: dateStr,
                            type: 'peringkat',
                            value: 100,
                            isRead: false
                        }, ...prev]);
                    }
                    const revokedCouncilMember = expelCountryFromSecurityCouncil(attackerCountry);
                    if (revokedCouncilMember) {
                        setNotifications(prev => [{
                            id: `notif-dk-pbb-expulsion-${Date.now()}`,
                            title: '🏛️ KURSI ANGGOTA TIDAK TETAP DK PBB DICABUT',
                            sender: 'Presidensi Dewan Keamanan PBB',
                            message: `Status ${attackerCountry} sebagai Anggota Tidak Tetap Dewan Keamanan PBB resmi DICABUT seketika akibat melancarkan agresi militer terhadap ${targetCountry} tanpa mandat resolusi PBB. Hak suara istimewa di DK PBB dibatalkan!`,
                            timestamp: dateStr,
                            type: 'peringkat',
                            value: 100,
                            isRead: false
                        }, ...prev]);
                    }
                    const sanctionsNotifications = submitInvasionViolationSanctions(
                        attackerCountry,
                        targetCountry,
                        dateStr,
                        reason
                    );
                    if (sanctionsNotifications.length > 0) {
                        setNotifications(prev => [...sanctionsNotifications, ...prev]);
                    }
                }
            }

            if (actionType === 'aneksasi') {
                const targetCity = resolveWarTargetCity(
                    targetCountry,
                    detail.targetCityId,
                    detail.targetCityName
                );
                if (!targetCity) {
                    console.error('[CityAnnexation] No mapped target city; annexation was cancelled.', {
                        targetCountry,
                        targetCityId: detail.targetCityId,
                        targetCityName: detail.targetCityName,
                    });
                    setNotifications(prev => [{
                        id: `notif-player-annex-no-city-${Date.now()}`,
                        title: 'Aneksasi Kota Dibatalkan',
                        sender: 'Markas Besar Angkatan Bersenjata',
                        message: `Kota target di ${targetCountry} tidak ditemukan pada data peta. Tidak ada wilayah yang diubah.`,
                        timestamp: dateStr,
                        type: 'peringkat',
                        value: 0,
                        isRead: false,
                    }, ...prev]);
                    return;
                }

                // 1. Potong armada penyerang pemain sebesar 25% (kemenangan perang)
                let userLossText = '';
                if (countryDetail) {
                    const { updatedDetail: detailAfterWin, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.25, true);
                    setCountryDetail(detailAfterWin);
                    userLossText = lossSummaryText;
                }

                // 2. Berita Invasi
                const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
                newNewsItems.push(invNews);

                // User annexation warna wilayah hijau terang #00C853
                const attackerColor = '#00C853';
                console.info('[CityAnnexation][3-handler] Aneksasi handler reached; resolved target city', {
                    attackerCountry,
                    targetCountry,
                    requestedCityId: detail.targetCityId,
                    requestedCityName: detail.targetCityName,
                    resolvedCityId: targetCity.cityId,
                    resolvedCityName: targetCity.cityName,
                });
                if (detail.targetCityId && targetCity.cityId !== detail.targetCityId) {
                    console.warn('[CityAnnexation][3-handler] Requested city did not match resolved city (fallback used).');
                }
                const { news: annexationNews } = generateAnnexationNews(
                    attackerCountry,
                    attackerIso,
                    attackerColor,
                    detail.targetCityName
                        ? `${detail.targetCityName}, ${targetCountry}`
                        : targetCountry,
                    targetIso,
                    dateStr
                );
                newNewsItems.push(annexationNews);

                const countryCollapsed = recordCityCapture(
                    targetCity,
                    targetCountry,
                    attackerCountry,
                    attackerIso,
                    attackerColor,
                    isPbbCoalition
                );

                // 4. Gabungkan statistik (populasi, kas negara, kepuasan, kesejahteraan, seluruh bangunan & sisa militer target setelah kalah >50%) dari negara target ke user
                const targetRelPath = countryCollapsed
                    ? Object.entries(countryPaths as Record<string, string>).find(
                        ([name]) => name.toLowerCase().trim() === targetCountry.toLowerCase().trim()
                    )?.[1]
                    : undefined;

                const mergeTargetDataToUser = async () => {
                    let targetData: any = null;
                    if (targetRelPath) {
                        try {
                            const res = await fetch(`/api/country-data?path=${encodeURIComponent(targetRelPath)}`);
                            const data = await res.json();
                            if (!data?.error) targetData = applyNpcCountrySimulationState(data);
                        } catch (e) {
                            console.error("Gagal mengambil data target country untuk aneksasi:", e);
                        }
                    }

                    if (targetData && setCountryDetail) {
                        const targetNetBal = calculateNetBalanceWithEconomicEmbargo(targetData, targetCountry);
                        annexedContributionRef.current[targetCountry.toLowerCase().trim()] = {
                            targetData,
                            netBalance: targetNetBal
                        };
                        setCountryDetail((prev: any) => {
                            if (!prev) return prev;
                            const prevPop = Number(prev.jumlah_penduduk || prev.populasi || 0);
                            const targetPop = Number(targetData.jumlah_penduduk || targetData.populasi || 0);

                            const prevAnggaran = Number(prev.anggaran || 0);
                            const targetAnggaran = Number(targetData.anggaran || 0);

                            const prevKepuasan = Number(prev.kepuasan || prev.kepuasan_masyarakat || 75);
                            const targetKepuasan = Number(targetData.kepuasan || targetData.kepuasan_masyarakat || 70);

                            const prevKesejahteraan = Number(prev.kesejahteraan || prev.kesejahteraan_masyarakat || 75);
                            const targetKesejahteraan = Number(targetData.kesejahteraan || targetData.kesejahteraan_masyarakat || 70);

                            // Hitung rerata tertimbang kepuasan & kesejahteraan berdasarkan proporsi populasi
                            const totalPop = prevPop + targetPop;
                            const newKepuasan = totalPop > 0
                                ? Math.round(((prevKepuasan * prevPop) + (targetKepuasan * targetPop)) / totalPop)
                                : prevKepuasan;
                            const newKesejahteraan = totalPop > 0
                                ? Math.round(((prevKesejahteraan * prevPop) + (targetKesejahteraan * targetPop)) / totalPop)
                                : prevKesejahteraan;

                            const aggregatedFields: Record<string, number> = {};
                            ANNEXED_AGGREGATE_KEYS.forEach(key => {
                                const prevVal = Number(prev[key] ?? prev?.armada?.[key] ?? prev?.pertahanan?.[key] ?? 0);
                                let targetVal = Number(targetData[key] ?? targetData?.armada?.[key] ?? targetData?.pertahanan?.[key] ?? 0);
                                // Sisa unit militer dari target yang kalah dipotong >50% (75% gugur dalam perang, 25% tersisa dirampas)
                                const isMilitaryUnit = [
                                    'pasukan_infanteri', 'tank_tempur_utama', 'apc_ifv', 'artileri_berat',
                                    'sistem_peluncur_roket', 'pertahanan_udara_mobile', 'kendaraan_taktis',
                                    'kapal_induk', 'kapal_induk_nuklir', 'kapal_destroyer', 'kapal_korvet',
                                    'kapal_selam_nuklir', 'kapal_selam_regular', 'kapal_ranjau', 'kapal_logistik',
                                    'jet_tempur_siluman', 'jet_tempur_interceptor', 'pesawat_pengebom',
                                    'helikopter_serang', 'pesawat_pengintai', 'drone_intai_uav', 'drone_kamikaze', 'pesawat_angkut'
                                ].includes(key);

                                if (isMilitaryUnit && targetVal > 0) {
                                    targetVal = Math.round(targetVal * 0.25);
                                }

                                if (targetVal > 0 || prevVal > 0) {
                                    aggregatedFields[key] = prevVal + targetVal;
                                }
                            });
                            const weightedAverageFields: Record<string, number> = {};
                            ['harapan_hidup', 'indeks_kesehatan', 'indeks_korupsi', 'indeks_keamanan'].forEach(key => {
                                const prevValue = Number(prev[key]);
                                const targetValue = Number(targetData[key]);
                                if (Number.isFinite(prevValue) && Number.isFinite(targetValue) && totalPop > 0) {
                                    weightedAverageFields[key] = Math.round(((prevValue * prevPop) + (targetValue * targetPop)) / totalPop);
                                }
                            });
                            const normalizePartnerName = (name: unknown) => String(name || '').toLowerCase().trim();
                            const addedTradePartners = Array.isArray(prev.addedTradePartners) ? prev.addedTradePartners : [];
                            const removedTradePartners = Array.isArray(prev.removedTradePartners) ? prev.removedTradePartners : [];

                            return {
                                ...prev,
                                ...aggregatedFields,
                                ...weightedAverageFields,
                                addedTradePartners: addedTradePartners.filter(
                                    (partner: string) => normalizePartnerName(partner) !== normalizePartnerName(targetCountry)
                                ),
                                removedTradePartners: Array.from(new Set([
                                    ...removedTradePartners.filter(
                                        (partner: string) => normalizePartnerName(partner) !== normalizePartnerName(targetCountry)
                                    ),
                                    targetCountry
                                ])),
                                jumlah_penduduk: totalPop,
                                populasi: totalPop,
                                anggaran: prevAnggaran + targetAnggaran,
                                kepuasan: newKepuasan,
                                kepuasan_masyarakat: newKepuasan,
                                kesejahteraan: newKesejahteraan,
                                kesejahteraan_masyarakat: newKesejahteraan
                            };
                        });

                        // Tambahkan Net Balance (pertumbuhan harian / +) dari target country ke adjustment net balance user
                        if (targetNetBal > 0) {
                            setPlayerNetBalanceAdjustment(prev => prev + targetNetBal);
                        }
                    }
                };
                mergeTargetDataToUser();

                // Notifikasi Inbox User
                const lossNote = (userLossText && userLossText !== 'Tidak ada kerugian unit')
                    ? ` Kerugian tempur armada Anda (25%): ${userLossText}.`
                    : '';
                const notifMsg: NotificationMessage = {
                    id: `notif-player-annex-${Date.now()}`,
                    title: `🚩 KOTA BERHASIL DITAKLUKKAN`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: targetCity
                        ? `Pasukan ${attackerCountry} berhasil menaklukkan Kota ${targetCity.cityName} di ${targetCountry}. ${countryCollapsed ? `Ibu kota atau seluruh kota yang terdata telah jatuh; ${targetCountry} kini runtuh dan dianeksasi penuh.` : `Kota lain di ${targetCountry} tetap berada di bawah kepemilikan semula.`}${lossNote} Wilayah taklukan ditandai hijau terang pada peta.`
                        : `Aneksasi ${targetCountry} tidak dapat diterapkan karena kota target tidak ditemukan pada data peta.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 100,
                    isRead: false
                };
                setNotifications(prev => [notifMsg, ...prev]);

            } else if (actionType === 'jarah') {
                // Potong armada pemain sebesar 25% (kemenangan operasi penjarahan)
                let userLossText = '';
                if (countryDetail) {
                    const { updatedDetail: detailAfterWin, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.25, true);
                    setCountryDetail(detailAfterWin);
                    userLossText = lossSummaryText;
                }

                const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
                const lootNews = generateResourceLootNews(
                    attackerCountry,
                    attackerIso,
                    targetCountry,
                    targetIso,
                    25000000,
                    { emas: 500, minyak_bumi: 1000, beras: 2000 },
                    dateStr
                );
                newNewsItems.push(invNews, lootNews);

                const lossNote = (userLossText && userLossText !== 'Tidak ada kerugian unit')
                    ? ` Kerugian tempur armada Anda (25%): ${userLossText}.`
                    : '';
                const notifMsg: NotificationMessage = {
                    id: `notif-player-loot-${Date.now()}`,
                    title: `💰 OPERASI PENJARAHAN BERHASIL`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: `Operasi penjarahan atas ${targetCountry} berhasil dilancarkan! Sumber daya alam dan rampasan perang senilai 25.000.000 NEO telah diamankan.${lossNote}`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 80,
                    isRead: false
                };
                setNotifications(prev => [notifMsg, ...prev]);

            } else if (actionType === 'mundur') {
                // Cek apakah mundur dalam keadaan menang atau kalah terpukul mundur
                const isVictoryRetreat = detail?.warResult === 'win';
                const lossRate = isVictoryRetreat ? 0.25 : 0.75;
                const lossPctStr = isVictoryRetreat ? '25%' : '75%';

                if (countryDetail) {
                    const { updatedDetail, lossSummaryText } = applyWarLossesToUserArmada(
                        countryDetail,
                        lossRate,
                        isVictoryRetreat,
                    );
                    setCountryDetail(updatedDetail);

                    if (lossSummaryText && lossSummaryText !== 'Tidak ada kerugian unit') {
                        setNotifications(prev => [{
                            id: `notif-war-losses-${Date.now()}`,
                            title: `💥 KERUGIAN PASUKAN PERTEMPURAN (${lossPctStr})`,
                            sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                            message: isVictoryRetreat
                                ? `Pasukan ditarik mundur setelah memenangkan pertempuran di ${targetCountry}! Kerugian tempur taktis sebesar ${lossPctStr}: ${lossSummaryText}. Data armada telah diperbarui.`
                                : `Pasukan terpukul mundur dari ${targetCountry}! Kerugian tempur sebesar ${lossPctStr} dari unit yang dikerahkan: ${lossSummaryText}. Data armada di Pertahanan & Keamanan telah diperbarui.`,
                            timestamp: dateStr,
                            type: 'peringkat',
                            value: isVictoryRetreat ? 25 : 75,
                            isRead: false
                        }, ...prev]);
                    }
                }

                const relationPenalty = applyUniformRelationPenalty(attackerCountry, 1, 5);
                setNotifications(prev => [{
                    id: `notif-retreat-relations-${Date.now()}`,
                    title: '📉 HUBUNGAN DIPLOMATIK MENURUN',
                    sender: 'Kementerian Luar Negeri',
                    message: `Hubungan diplomatik ${attackerCountry} dengan negara-negara lain turun ${relationPenalty} poin setelah operasi militer terhadap ${targetCountry}.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: relationPenalty,
                    isRead: false
                }, ...prev]);

                const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
                newNewsItems.push(invNews);

                const notifMsg: NotificationMessage = {
                    id: `notif-player-[#00FFAA]-${Date.now()}`,
                    title: `🏳️ PASUKAN DITARIK MUNDUR`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: `Operasi agresi terhadap ${targetCountry} disudahi. Pasukan ditarik mundur ke markas utama tanpa aneksasi wilayah.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 50,
                    isRead: false
                };
                setNotifications(prev => [notifMsg, ...prev]);
            }

            if (actionType === 'aneksasi' || actionType === 'jarah') {
                window.dispatchEvent(new CustomEvent('military_operation_resolved', {
                    detail: { targetCountry, actionType },
                }));
            }

            // Tambahkan ke Berita & Update Geopolitik
            setNewsList(prev => [...newNewsItems, ...prev]);
        };

        window.addEventListener('trigger_player_attack', handlePlayerAttack);

        return () => {
            window.removeEventListener('trigger_requested_invasion', handleRequestedInvasion);
            window.removeEventListener('trigger_player_attack', handlePlayerAttack);
        };
    }, [currentDate, countryDetail]);

    // ICBM Target Selection Mode & Efek Keclap Putih
    const [isSelectingIcbmTarget, setIsSelectingIcbmTarget] = useState(false);
    const [icbmFlashEffect, setIcbmFlashEffect] = useState<{
        x: number;
        y: number;
        visible: boolean;
        targetName?: string;
    } | null>(null);

    useEffect(() => {
        const handleStartSelection = (event: any) => {
            setIsSelectingIcbmTarget(Boolean(event.detail?.active));
        };

        const handleExplosionFlash = (event: any) => {
            const detail = event.detail;
            if (detail) {
                setIcbmFlashEffect({
                    x: detail.x,
                    y: detail.y,
                    visible: true,
                    targetName: detail.targetName,
                });

                // Efek kilatan keclap putih berlangsung cepat lalu memudar
                setTimeout(() => {
                    setIcbmFlashEffect(prev => (prev ? { ...prev, visible: false } : null));
                }, 1200);

                setTimeout(() => {
                    setIcbmFlashEffect(null);
                }, 2000);
            }
        };

        window.addEventListener('start_icbm_target_selection', handleStartSelection);
        window.addEventListener('trigger_icbm_explosion_flash', handleExplosionFlash);

        const handleIcbmLaunched = (event: any) => {
            const detail = event?.detail;
            const playerCountryName = selectedCountry?.country ||
                countryDetail?.country ||
                countryDetail?.nama_negara ||
                countryDetail?.name_id ||
                'Indonesia';

            // The defense action belongs only to an incoming strike against the player.
            if (!detail?.attackerCountry || !detail?.targetCountry || !areSameWarCountry(detail.targetCountry, playerCountryName, detail.targetIso, countryDetail?.iso)) {
                return;
            }

            const target = COUNTRIES_DATA.find((country) =>
                areSameWarCountry(country.country, detail.targetCountry, country.iso, detail.targetIso)
            );
            const targetCity = target?.capital || detail.targetCountry;
            const dateStr = detail.currentDate || (currentDate ? currentDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

            setNotifications((previous) => [
                generateICBMNotification(detail.attackerCountry, targetCity, dateStr),
                ...previous,
            ]);
        };

        const handleIcbmStrikeArrived = (event: any) => {
            const detail = event?.detail;
            if (detail && detail.senderCountry && detail.targetCountry) {
                // Ketika selesai penyerangan dengan ICBM, hubungan bilateral kedua negara berubah ke 20 secara default
                setRelationSourceValue(detail.senderCountry, detail.targetCountry, 'icbm-strike', 20);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('country_relations_updated'));
                }

                // ── LOGIKA SERANGAN BALASAN (COUNTER-ATTACK) ──
                // Jika serangan ICBM ini diluncurkan terlebih dahulu oleh USER:
                const playerCountryName = selectedCountry?.country ||
                    countryDetail?.country ||
                    countryDetail?.nama_negara ||
                    countryDetail?.name_id ||
                    'Indonesia';

                const isUserAttacker = detail.isPlayerAttacker === true ||
                    areSameWarCountry(detail.senderCountry, playerCountryName, undefined, countryDetail?.iso);

                const isUserTarget = areSameWarCountry(detail.targetCountry, playerCountryName, undefined, countryDetail?.iso);

                // ── PENGURANGAN KEKUATAN MILITER AKIBAT LEDAKAN ICBM ──
                // 1. Jika user yang menyerang target: target kehilangan 30% kekuatan militernya
                if (isUserAttacker && !isUserTarget) {
                    const victimCountry = detail.targetCountry;
                    const victimIso = detail.targetIso;
                    const { reducedCount, losses } = applyIcbmMilitaryDamageToNpc(victimCountry, victimIso);

                    setNotifications(previous => [{
                        id: `notif-icbm-impact-${Date.now()}-${Math.random()}`,
                        title: '💥 DAMPAK HANTAMAN NUKLIR ICBM!',
                        sender: `Pusat Komando Strategis Nuklir`,
                        message: `Hulu ledak ICBM kita berhasil menghancurkan infrastruktur pertahanan dan memangkas 30% kekuatan militer ${victimCountry}!`,
                        timestamp: currentDate ? currentDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 20,
                        isRead: false,
                    }, ...previous]);

                    setResultModal({
                        isOpen: true,
                        title: `💥 Hantaman Nuklir Sukses — 30% Militer ${victimCountry} Musnah!`,
                        message: `Hulu ledak ICBM kita berhasil meledak di sasaran strategis ${victimCountry}. Ledakan nuklir melumpuhkan 30% kekuatan armada pertahanan militer musuh. Rincian unit alutsista musuh yang dihancurkan dirinci di bawah:`,
                        losses,
                        type: 'success',
                        persistent: true,

                    });
                }

                // 2. Jika user yang menjadi target serangan ICBM: user kehilangan 15% kekuatan militernya
                if (isUserTarget) {
                    let userLosses: Array<{ unitKey: string; quantity: number }> = [];
                    if (setCountryDetail) {
                        setCountryDetail((prev: any) => {
                            if (!prev) return prev;
                            const { updatedDetail, lossSummaryText, losses } = applyWarLossesToUserArmada(prev, 0.15);
                            userLosses = losses;
                            return updatedDetail;
                        });
                    }

                    setNotifications(previous => [{
                        id: `notif-user-icbm-damage-${Date.now()}-${Math.random()}`,
                        title: '☢️ KERUSAKAN MILITER AKIBAT HANTAMAN ICBM!',
                        sender: `Markas Besar Angkatan Bersenjata`,
                        message: `PERINGATAN DARURAT! Ledakan hulu ledak ICBM musuh (${detail.senderCountry}) meluluhlantakkan pangkalan militer kita. Negara kehilangan 15% kekuatan militer pertahanan nasional!`,
                        timestamp: currentDate ? currentDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 50,
                        isRead: false,
                    }, ...previous]);

                    setResultModal({
                        isOpen: true,
                        title: '☢️ Negara Terkena Ledakan Rudal ICBM Musuh!',
                        message: `PERINGATAN TERTINGGI! Hulu ledak ICBM dari ${detail.senderCountry} berhasil menghantam wilayah nasional. Sebanyak 15% dari seluruh armada kekuatan militer kita hancur lebur. Rincian kerugian alutsista dirinci di bawah:`,
                        losses: userLosses,
                        type: 'error',
                        persistent: true,

                    });
                }

                if (isUserAttacker) {
                    const victimCountry = detail.targetCountry;
                    const victimIso = detail.targetIso;
                    const targetHasIcbmStock = getCountryIcbmCount(victimCountry, victimIso) > 0;
                    const roll = Math.random();

                    // Peluang 50% untuk serangan balasan
                    const willCounterAttack = roll < 0.50;

                    if (willCounterAttack) {
                        const dateString = currentDate ? currentDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);

                        if (targetHasIcbmStock) {
                            // 1. Serangan Balasan Menggunakan ICBM (Peluang 50% jika target memiliki ICBM)
                            consumeCountryIcbm(victimCountry, victimIso);
                            launchIcbmWarStrike({
                                attackerCountry: victimCountry,
                                targetCountry: playerCountryName,
                                attackerIso: victimIso,
                                targetIso: countryDetail?.iso,
                                currentDate: dateString,
                                isPlayerAttacker: false,
                            });

                            setNotifications(previous => [{
                                id: `notif-icbm-retaliation-${Date.now()}-${Math.random()}`,
                                title: '🚨 SERANGAN BALASAN ICBM DILUNCURKAN!',
                                sender: `Kementerian Pertahanan & Radar Dini Nasional`,
                                message: `PERINGATAN DARURAT NUKLIR! ${victimCountry} tidak tinggal diam setelah diserang. Mereka mendeteksi peluncuran dan langsung membalas meluncurkan rudal balistik ICBM strategis menuju ibukota ${playerCountryName}!`,
                                timestamp: dateString,
                                type: 'peringkat',
                                value: 10,
                                isRead: false,
                            }, ...previous]);
                        } else {
                            // 2. Jika tidak ada ICBM, peluang 50% berubah menjadi Invasi Konvensional Biasa.
                            // Masih terikat dengan sanksi dan embargo PBB jika tidak memiliki resolusi resmi dari PBB.
                            setNotifications(previous => [{
                                id: `notif-invasion-retaliation-${Date.now()}-${Math.random()}`,
                                title: '⚔️ SERANGAN BALASAN: OPERASI INVASI DILUNCURKAN!',
                                sender: `Markas Besar Intelijen Militer`,
                                message: `DARURAT PERANG! Merespons agresi rudal ICBM kita, angkatan bersenjata ${victimCountry} memobilisasi seluruh armada darat, laut, dan udara untuk melancarkan serangan invasi militer balasan ke ${playerCountryName}!`,
                                timestamp: dateString,
                                type: 'peringkat',
                                value: 10,
                                isRead: false,
                            }, ...previous]);

                            // Jalankan invasi melalui antrean perang map-system (memeriksa resolusi resmi PBB, sanksi pelanggaran, dan embargo)
                            window.dispatchEvent(new CustomEvent('start_war_animation', {
                                detail: {
                                    attacker: victimCountry,
                                    target: playerCountryName,
                                    isNpcWar: false, // Targetnya adalah pemain!
                                    resolutionViolationAuthorized: false,
                                },
                            }));
                        }
                    }
                }
            }
        };

        window.addEventListener('neosantara_icbm_strike_arrived', handleIcbmStrikeArrived);
        window.addEventListener('neosantara_icbm_launched', handleIcbmLaunched);

        return () => {
            window.removeEventListener('start_icbm_target_selection', handleStartSelection);
            window.removeEventListener('trigger_icbm_explosion_flash', handleExplosionFlash);
            window.removeEventListener('neosantara_icbm_strike_arrived', handleIcbmStrikeArrived);
            window.removeEventListener('neosantara_icbm_launched', handleIcbmLaunched);
        };
    }, [currentDate, countryDetail, selectedCountry?.country]);

    const [penelitianModalOpen, setPenelitianModalOpen] = useState(false);
    const [missionModalOpen, setMissionModalOpen] = useState(false);
    const [playerDiamonds, setPlayerDiamonds] = useState<number>(150);

    // Sinkronisasi saldo diamond dari localStorage saat client mounted & realtime event
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loadSaveStr = sessionStorage.getItem('presiden_simulator_load_save');
            const newGameMarker = localStorage.getItem('presiden_simulator_new_game');
            if (newGameMarker === '1') {
                localStorage.setItem('player_diamonds', '150');
                setPlayerDiamonds(150);
            }

            const syncDiamonds = () => {
                const saved = localStorage.getItem('player_diamonds');
                if (saved !== null) {
                    const parsed = parseInt(saved, 10);
                    if (!isNaN(parsed)) {
                        setPlayerDiamonds(parsed);
                        return;
                    }
                }
                setPlayerDiamonds(150);
            };

            if (loadSaveStr) {
                syncDiamonds();
            }

            const handleDiamondsUpdated = (e: any) => {
                if (e.detail?.diamonds !== undefined) {
                    setPlayerDiamonds(Number(e.detail.diamonds));
                } else {
                    syncDiamonds();
                }
            };

            window.addEventListener('player_diamonds_updated', handleDiamondsUpdated);
            window.addEventListener('storage', syncDiamonds);
            return () => {
                window.removeEventListener('player_diamonds_updated', handleDiamondsUpdated);
                window.removeEventListener('storage', syncDiamonds);
            };
        }
    }, []);
    const [activeWarAnimation, setActiveWarAnimation] = useState<any>(null);
    const [isWarAnalysisActive, setIsWarAnalysisActive] = useState(false);
    const handleWarAnalysisVisibilityChange = useCallback((isVisible: boolean) => {
        setIsWarAnalysisActive(isVisible);
    }, []);
    const [npcWarQueue, setNpcWarQueue] = useState<Array<{
        attacker: string;
        target: string;
        targetCityId?: string;
        targetCityName?: string;
        targetCityLat?: number;
        targetCityLng?: number;
        targetCityCountryIso?: string;
        targetCityIsCapital?: boolean;
        isNpcWar?: boolean;
        requestedInvasion?: boolean;
        isPbbCoalition?: boolean;
        isPlayerCoalitionProposer?: boolean;
        resolutionViolationAuthorized?: boolean;
        coalitionParticipants?: Array<{ name: string; iso: string }>;
    }>>([]);

    const npcWarQueueRunningRef = useRef(false);

    useEffect(() => {
        const handleStartWarAnimation = async (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (typeof detail?.attacker !== 'string' || !detail.attacker.trim() ||
                typeof detail?.target !== 'string' || !detail.target.trim()) {
                console.error('[WarAnimation] Invalid attacker or target name', detail);
                return;
            }
            if (areSameWarCountry(
                detail.attacker,
                detail.target,
                detail.attackerCountryDetail?.iso,
                detail.targetCountryDetail?.iso
            )) {
                console.error('[WarAnimation] Blocked attack targeting the attacker country itself', {
                    attacker: detail.attacker,
                    target: detail.target,
                });
                return;
            }
            const playerCountryName = selectedCountry?.country ||
                countryDetail?.country ||
                countryDetail?.nama_negara ||
                countryDetail?.name_id;
            const isPlayerAttacker = Boolean(playerCountryName) && areSameWarCountry(
                detail.attacker,
                playerCountryName || '',
                detail.attackerCountryDetail?.iso,
                selectedCountry?.iso || countryDetail?.iso
            );
            const isPlayerDefender = Boolean(playerCountryName) && areSameWarCountry(
                detail.target,
                playerCountryName || '',
                detail.targetCountryDetail?.iso,
                selectedCountry?.iso || countryDetail?.iso
            );
            const isNpcWar = !isPlayerAttacker && !isPlayerDefender;
            const targetCity = resolveWarTargetCity(
                detail.target,
                detail.targetCityId,
                detail.targetCityName,
                isNpcWar || isPlayerDefender
            );

            const hasApprovedInvasionMandate = hasActiveApprovedInvasionResolution(
                detail.attacker,
                detail.target
            );
            const resolutionViolationAuthorized = detail.resolutionViolationAuthorized === true;
            if (
                !isPlayerAttacker &&
                !hasApprovedInvasionMandate &&
                !resolutionViolationAuthorized &&
                Math.random() >= 0.25
            ) {
                npcWarQueueRunningRef.current = false;
                setNotifications(previous => [{
                    id: `notif-war-no-mandate-${Date.now()}`,
                    title: '🕊️ RENCANA SERANGAN TANPA MANDAT DIBATALKAN',
                    sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                    message: `Serangan ${detail.attacker} terhadap ${detail.target} tidak jadi diluncurkan. Serangan tanpa mandat hanya memiliki peluang 25%; upaya ini dibatalkan sebelum konflik dimulai.`,
                    timestamp: currentDate.toISOString().slice(0, 10),
                    type: 'peringkat',
                    value: 100,
                    isRead: false,
                }, ...previous]);
                return;
            }
            if (!hasApprovedInvasionMandate) {
                const violationReason = hasActiveGlobalWarBan()
                    ? 'war_ban'
                    : hasActiveApprovedInvasionResolutionForDifferentTarget(detail.attacker, detail.target)
                        ? 'wrong_military_target'
                        : 'missing_military_resolution';

                // 1. Sanksi PBB Resmi (Embargo Ekonomi & Sanksi Dewan Keamanan)
                const violationNotifications = violationReason === 'war_ban'
                    ? submitWarBanViolationSanctions(
                        detail.attacker,
                        detail.target,
                        currentDate.toISOString().slice(0, 10)
                    )
                    : submitInvasionViolationSanctions(
                        detail.attacker,
                        detail.target,
                        currentDate.toISOString().slice(0, 10),
                        violationReason
                    );
                if (violationNotifications.length > 0) {
                    setNotifications(previous => [...violationNotifications, ...previous]);
                }

                // 2. Pencabutan Keanggotaan Organisasi Internasional & Seluruh Organisasi PBB
                const expelledOrganizations = expelCountryFromOrganizations(detail.attacker);
                if (expelledOrganizations.length > 0) {
                    setNotifications(previous => [{
                        id: `notif-organization-expulsion-${Date.now()}-${Math.random()}`,
                        title: '🚫 KEANGGOTAAN ORGANISASI INTERNASIONAL DICABUT',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa & Komunitas Global',
                        message: `${detail.attacker} dikeluarkan secara tidak hormat dari organisasi internasional (${expelledOrganizations.join(', ')}) karena memaksa melancarkan invasi militer terhadap ${detail.target} tanpa mandat Resolusi Invasi PBB.`,
                        timestamp: currentDate.toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...previous]);
                }

                // 3. Pencabutan Kursi Anggota Tidak Tetap Dewan Keamanan PBB
                const revokedCouncilMember = expelCountryFromSecurityCouncil(detail.attacker);
                if (revokedCouncilMember) {
                    setNotifications(previous => [{
                        id: `notif-dk-pbb-expulsion-${Date.now()}-${Math.random()}`,
                        title: '🏛️ KURSI ANGGOTA TIDAK TETAP DK PBB DICABUT',
                        sender: 'Presidensi Dewan Keamanan PBB',
                        message: `Status ${detail.attacker} sebagai Anggota Tidak Tetap Dewan Keamanan PBB resmi DICABUT seketika akibat melancarkan agresi militer ilegal terhadap ${detail.target} tanpa mandat resolusi PBB. Hak suara istimewa dan pengaruh di DK PBB dibatalkan!`,
                        timestamp: currentDate.toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...previous]);
                }

                // 3. Sanksi Hubungan Diplomatik Bertubi-tubi: Hubungan dengan SELURUH negara dunia hancur lebur
                const relationPenaltySummary = applyInvasionRelationPenalty(detail.attacker, detail.target);
                setNotifications(previous => [{
                    id: `notif-unapproved-invasion-relations-${Date.now()}-${Math.random()}`,
                    title: '💥 KECAMAN INTERNASIONAL & SANKSI BERTUBI-TUBI',
                    sender: 'Kementerian Luar Negeri & Komunitas Internasional',
                    message: `${detail.attacker} dijatuhi sanksi bertubi-tubi dan kecaman keras oleh komunitas global karena memaksakan agresi militer terhadap ${detail.target} saat resolusi invasi ditolak/tanpa mandat PBB. Hubungan diplomatik dengan seluruh negara dunia memburuk drastis! ${relationPenaltySummary}`,
                    timestamp: currentDate.toISOString().slice(0, 10),
                    type: 'peringkat',
                    value: 30,
                    isRead: false,
                }, ...previous]);
            }

            if (playerCountryName && areSameWarCountry(
                detail.attacker,
                playerCountryName,
                detail.attackerCountryDetail?.iso,
                selectedCountry?.iso || countryDetail?.iso
            )) {
                setMilitaryAttackRelation(detail.attacker, detail.target, 1);
            }

            const COUNTRY_NAME_ALIASES: Record<string, string> = {
                brasil: 'brazil',
                tiongkok: 'china',
            };
            const normalizeCountryName = (name: unknown) => {
                const normalized = String(name || '')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase()
                    .replace(/[^a-z0-9]/g, '');
                return COUNTRY_NAME_ALIASES[normalized] ?? normalized;
            };
            const getCountryLookupKeys = (countryName: string): Set<string> => {
                const keys = new Set([normalizeCountryName(countryName)]);
                const matchedPaths = Object.entries(countryPaths as Record<string, string>)
                    .filter(([name]) => normalizeCountryName(name) === normalizeCountryName(countryName))
                    .map(([, relativePath]) => relativePath);

                matchedPaths.forEach((relativePath) => {
                    const filename = relativePath.split(/[\\/]/).pop() || '';
                    const withoutExtension = filename.replace(/\.ts$/i, '');
                    keys.add(normalizeCountryName(withoutExtension.replace(/^\d+_/, '')));
                });

                return keys;
            };
            const userCountryNames = [
                countryDetail?.country,
                countryDetail?.nama_negara,
                countryDetail?.name_id,
                countryDetail?.name_en,
                countryDetail?.country_slug,
                selectedCountry?.country,
            ].map(normalizeCountryName).filter(Boolean);
            const findCountryDetail = (countryName: string, countries: any[]) => {
                const lookupKeys = getCountryLookupKeys(countryName);
                return countries.find((country: any) => {
                    const countryKeys = [
                        country?.country,
                        country?.nama_negara,
                        country?.name_id,
                        country?.name_en,
                        country?.country_slug,
                    ].map(normalizeCountryName);
                    const filename = String(country?.__fileName || '').split(/[\\/]/).pop() || '';
                    countryKeys.push(normalizeCountryName(filename.replace(/\.ts$/i, '').replace(/^\d+_/, '')));
                    return countryKeys.some((key) => key && lookupKeys.has(key));
                });
            };

            const isCountryRecord = (value: unknown): value is Record<string, any> =>
                Boolean(value && typeof value === 'object' && !Array.isArray(value));
            const resolveProvidedCountry = (countryName: string, provided: unknown) => {
                if (!isCountryRecord(provided)) return null;
                const candidateNames = [
                    provided.country,
                    provided.nama_negara,
                    provided.name_id,
                    provided.name_en,
                    provided.country_slug,
                ].map(normalizeCountryName).filter(Boolean);

                if (candidateNames.length === 0) {
                    return applyNpcCountrySimulationState({ ...provided, country: countryName });
                }
                const lookupKeys = getCountryLookupKeys(countryName);
                if (candidateNames.some((name) => lookupKeys.has(name))) {
                    return applyNpcCountrySimulationState(provided);
                }
                return applyNpcCountrySimulationState({ ...provided, country: countryName });
            };

            let countries: any[] | null = null;
            const resolveCountryDetail = (countryName: string, provided?: unknown) => {
                const suppliedDetail = resolveProvidedCountry(countryName, provided);
                if (suppliedDetail) return suppliedDetail;

                const normalizedName = normalizeCountryName(countryName);
                if (userCountryNames.includes(normalizedName) && countryDetail) {
                    return countryDetail;
                }

                if (!countries) return null;
                const countryRecord = findCountryDetail(countryName, countries);
                if (!countryRecord) return null;

                return applyNpcCountrySimulationState({
                    ...countryRecord,
                });
            };

            let attackerDetailData = resolveCountryDetail(detail.attacker, detail.attackerCountryDetail);
            let targetDetailData = resolveCountryDetail(detail.target, detail.targetCountryDetail);
            if (!attackerDetailData || !targetDetailData || detail.isPbbCoalition) {
                try {
                    const response = await fetch('/api/country-data?all=true');
                    if (response.ok) {
                        const data: unknown = await response.json();
                        if (Array.isArray(data)) {
                            countries = data;
                            attackerDetailData = attackerDetailData || resolveCountryDetail(detail.attacker, detail.attackerCountryDetail);
                            targetDetailData = targetDetailData || resolveCountryDetail(detail.target, detail.targetCountryDetail);
                        }
                    }
                } catch (error) {
                    console.warn('[WarAnimation] Unable to load country military data from API', error);
                }
            }

            if (!attackerDetailData) {
                attackerDetailData = applyNpcCountrySimulationState({
                    country: detail.attacker,
                    nama_negara: detail.attacker,
                    kekuatanMiliter: Number(detail.playerPower ?? detail.attackerPower ?? 75),
                });
            }
            if (!targetDetailData) {
                targetDetailData = applyNpcCountrySimulationState({
                    country: detail.target,
                    nama_negara: detail.target,
                    kekuatanMiliter: Number(detail.targetPower ?? 50),
                });
            }

            if (detail.isPbbCoalition && Array.isArray(detail.coalitionParticipants)) {
                const coalitionProfiles = detail.coalitionParticipants
                    .map((participant: { name: string; iso: string }) =>
                        resolveCountryDetail(participant.name, undefined)
                    )
                    .filter((profile: Record<string, unknown> | null): profile is Record<string, unknown> => Boolean(profile));
                const forceSources = coalitionProfiles.length > 0
                    ? coalitionProfiles
                    : attackerDetailData
                        ? [attackerDetailData]
                        : [];
                if (forceSources.length !== detail.coalitionParticipants.length) {
                    console.warn('[PBBMilitaryOperation] Some participant force data could not be resolved', {
                        expected: detail.coalitionParticipants.length,
                        resolved: forceSources.length,
                    });
                }

                const coalitionArmada: Record<string, Record<string, number>> = {
                    darat: {},
                    laut: {},
                    udara: {},
                };
                let coalitionPower = 0;
                forceSources.forEach((profile: Record<string, unknown>) => {
                    const profileSummary = getArmadaPowerSummary(profile);
                    profileSummary.breakdown.forEach(unit => {
                        coalitionArmada[unit.groupId] ??= {};
                        coalitionArmada[unit.groupId][unit.dataKey] =
                            (coalitionArmada[unit.groupId][unit.dataKey] || 0) + Math.round(unit.quantity * 0.1);
                        coalitionPower += unit.totalPower * 0.1;
                    });

                    const profileArmada = profile.armada && typeof profile.armada === 'object'
                        ? profile.armada as Record<string, unknown>
                        : profile;
                    const groundForces = profileArmada.darat && typeof profileArmada.darat === 'object'
                        ? profileArmada.darat as Record<string, unknown>
                        : {};
                    const infantry = Number(
                        groundForces.pasukan_infanteri ??
                        profileArmada.pasukan_infanteri ??
                        profile.pasukan_infanteri
                    ) || convertBarakToSoldiers(Number(
                        groundForces.barak ??
                        profileArmada.barak ??
                        profile.barak ??
                        0
                    ));
                    if (infantry > 0) {
                        coalitionArmada.darat.pasukan_infanteri =
                            (coalitionArmada.darat.pasukan_infanteri || 0) + Math.round(infantry * 0.1);
                    }
                });

                attackerDetailData = {
                    ...attackerDetailData,
                    armada: coalitionArmada,
                    pbbCoalitionPower: Math.round(coalitionPower),
                    pbbCoalitionParticipants: detail.coalitionParticipants.map(
                        (participant: { name: string }) => participant.name
                    ),
                };
            }

            setIsPresidentMenuOpen(false);
            setCountryDetailModalOpen(false);
            setCountryDetailModalName(null);
            setCountryDetailModalCity(null);
            setCountryDetailModalCityId(null);
            setAiConstructionNavigation(null);
            setAutoBuildEmbassyState(false);
            setRequireEmbassyModalOpen(false);
            setRequireEmbassyPartner(null);
            setPlayerDetailModalOpen(false);
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setPenelitianModalOpen(false);
            setMissionModalOpen(false);
            setIsSaveModalOpen(false);
            setIsRestartConfirmOpen(false);
            setAparatConfirmState({ isOpen: false, notification: null });
            setHasilBubarkanState(previous => ({ ...previous, isOpen: false }));
            setTradeRejectionState(previous => ({ ...previous, isOpen: false }));
            setClosedTradeRejectionState(previous => ({ ...previous, isOpen: false }));
            setIsRatingWarningOpen(false);
            setIsKudetaOpen(false);
            setAnnexedModalData(previous => ({ ...previous, isOpen: false }));
            setResultModal(previous => ({ ...previous, isOpen: false }));
            setIsDialogTerbukaOpen(false);
            const pauseState = dialogPauseStateRef.current;
            dialogPauseStateRef.current = null;
            if (pauseState && !pauseState.wasPaused) {
                isPausedRef.current = false;
                setIsPaused(false);
                timeManagerRef.current?.setPaused(false);
            }

            const attackerPowerSummary = getArmadaPowerSummary(attackerDetailData);
            const targetPowerSummary = getArmadaPowerSummary(targetDetailData);

            setIsWarAnalysisActive(false);
            setActiveWarAnimation({
                ...detail,
                isNpcWar,
                targetCityId: targetCity?.cityId,
                targetCityName: targetCity?.cityName,
                targetCityLat: targetCity?.lat,
                targetCityLng: targetCity?.lng,
                targetCityCountryIso: targetCity?.countryIso,
                targetCityIsCapital: targetCity?.isCapital,
                attackerCountryDetail: attackerDetailData,
                targetCountryDetail: targetDetailData,
                attackerPower: Number(attackerDetailData.pbbCoalitionPower) || attackerPowerSummary.totals.totalPower,
                targetPower: targetPowerSummary.totals.totalPower
            });
        };
        const handlePauseGameTime = (event: Event) => {
            const source = (event as CustomEvent<{ source?: string }>).detail?.source;
            if (source === 'war' && !warPauseStateRef.current) {
                warPauseStateRef.current = { wasPaused: isPausedRef.current };
            }
            setIsPaused(true);
            if (timeManagerRef.current) {
                timeManagerRef.current.setPaused(true);
            }
        };
        const handlePbbMilitaryOperation = (event: Event) => {
            const operation = (event as CustomEvent<SecurityCouncilInvasionOperation>).detail;
            if (
                !operation?.resolutionId ||
                !operation.proposer?.name ||
                !operation.target?.name ||
                !Array.isArray(operation.participants)
            ) {
                console.error('[PBBMilitaryOperation] Invalid approved operation', operation);
                return;
            }

            setNewsList(previous => {
                const news = createSecurityCouncilInvasionNews(operation);
                return [news, ...previous.filter(item => item.id !== news.id)];
            });

            const playerCountryName = selectedCountry?.country ||
                countryDetail?.country ||
                countryDetail?.nama_negara ||
                countryDetail?.name_id ||
                '';
            const targetsPlayer = Boolean(playerCountryName) && areSameWarCountry(
                operation.target.name,
                playerCountryName,
                operation.target.iso,
                selectedCountry?.iso || countryDetail?.iso
            );
            const operationForces = [
                operation.proposer,
                ...operation.participants,
            ].filter((participant, index, forces) =>
                participant?.name &&
                !areSameWarCountry(participant.name, operation.target.name, participant.iso, operation.target.iso) &&
                forces.findIndex(candidate =>
                    candidate?.name &&
                    areSameWarCountry(candidate.name, participant.name, candidate.iso, participant.iso)
                ) === index
            );
            const attacks = [{
                attacker: operation.proposer.name,
                target: operation.target.name,
                isNpcWar: !targetsPlayer,
                isPbbCoalition: true,
                isPlayerCoalitionProposer: Boolean(playerCountryName) && areSameWarCountry(
                    operation.proposer.name,
                    playerCountryName,
                    operation.proposer.iso,
                    selectedCountry?.iso || countryDetail?.iso
                ),
                coalitionParticipants: operationForces,
            }];

            setNpcWarQueue(previous => [...previous, ...attacks]);
        };
        window.addEventListener('start_war_animation', handleStartWarAnimation);
        window.addEventListener('start_pbb_military_operation', handlePbbMilitaryOperation);
        window.addEventListener('pause_game_time', handlePauseGameTime);
        return () => {
            window.removeEventListener('start_war_animation', handleStartWarAnimation);
            window.removeEventListener('start_pbb_military_operation', handlePbbMilitaryOperation);
            window.removeEventListener('pause_game_time', handlePauseGameTime);
        };
    }, [countryDetail, selectedCountry?.country]);

    useEffect(() => {
        if (activeWarAnimation || npcWarQueue.length === 0 || npcWarQueueRunningRef.current) return;

        const [nextWar, ...remainingWars] = npcWarQueue;
        if (!nextWar) return;
        npcWarQueueRunningRef.current = true;
        setNpcWarQueue(remainingWars);
        window.dispatchEvent(new CustomEvent('start_war_animation', {
            detail: { ...nextWar, isNpcWar: nextWar.isNpcWar ?? true },
        }));
    }, [activeWarAnimation, npcWarQueue]);

    const [presidentRating, setPresidentRating] = useState<number>(50);
    const [kesejahteraan, setKesejahteraan] = useState<number>(50);
    const [notifications, setNotificationsRaw] = useState<NotificationMessage[]>([]);
    const notificationDateRef = useRef('');
    notificationDateRef.current = simulationDateString;
    // Gerbang pusat semua notifikasi inbox:
    // - 30% hari kosong (0 notif), 50% dapat 1 notif, 20% dapat 2 notif per hari simulasi
    // - Tidak ada notifikasi otomatis baru saat game paused.
    // - Notifikasi hasil aksi langsung pemain dikecualikan dari batas.
    const dailyQuotaRef = useRef<{ date: string; quota: number }>({ date: '', quota: 0 });
    const setNotifications = useCallback((action: React.SetStateAction<NotificationMessage[]>) => {
        startTransition(() => setNotificationsRaw(prev => {
            const next = typeof action === 'function'
                ? (action as (value: NotificationMessage[]) => NotificationMessage[])(prev)
                : action;
            const isExempt = (n: NotificationMessage) =>
                /player|user|province|requested|self-|aid-|demo|demonstrasi|subsidi|harga|pajak/i.test(String(n.id)) ||
                (n as any).tradeType === 'demonstrasi_rakyat' ||
                (n as any).tradeType === 'kebijakan_subsidi' ||
                (n as any).tradeType === 'harga_barang_pokok' ||
                (n as any).tradeType === 'perubahan_pajak';
            const isPausedNow = isPausedRef.current ||
                (typeof window !== 'undefined' && Boolean((window as any).neosantara_is_paused));
            const today = notificationDateRef.current;
            // Tentukan kuota untuk hari ini jika belum ada (diundi sekali per hari)

            // logika persentase kemunculan notifikasi di inbox
            if (dailyQuotaRef.current.date !== today) {
                const roll = Math.random();
                // 40% → 0 notif, 50% → 1 notif, 10% → 2 notif
                const maxForDay = roll < 0.40 ? 0 : roll < 0.90 ? 1 : 2;
                dailyQuotaRef.current = { date: today, quota: maxForDay };
            }

            const alreadySent = prev.filter(n => !isExempt(n) && n.timestamp === today).length;
            let quota = Math.max(0, dailyQuotaRef.current.quota - alreadySent);
            const prevIds = new Set(prev.map(n => n.id));
            const result: NotificationMessage[] = [];
            for (const n of next) {
                if (!n || prevIds.has(n.id) || isExempt(n)) {
                    result.push(n);
                    continue;
                }
                if (isPausedNow || quota <= 0) continue;
                quota -= 1;
                result.push(n);
            }
            return result.length === next.length ? next : result;
        }));
    }, []);

    const [annexedModalData, setAnnexedModalData] = useState<{
        isOpen: boolean;
        countryName: string;
        attackerCountry: string;
    }>({
        isOpen: false,
        countryName: '',
        attackerCountry: '',
    });
    const processedReferendumsRef = useRef(new Set<string>());
    const electionScheduleTickRef = useRef<string | null>(null);
    useEffect(() => {
        const handleProvinceAction = async (event: Event) => {
            const detail = (event as CustomEvent<ProvinceActionEventDetail>).detail;
            if (!detail?.actionLabel || !detail.targetCountry || !detail.occupyingCountry) return;

            const timestamp = currentDate.toISOString().slice(0, 10);
            if (detail.actionId === 'beri_kemerdekaan') {
                try {
                    const message = await releaseAnnexedProvince({
                        detail,
                        contributionCache: annexedContributionRef.current,
                        updateCountryDetail: setCountryDetail,
                        adjustPlayerNetBalance: delta => setPlayerNetBalanceAdjustment(previous => previous + delta),
                        updateCountryColorOverrides: setCountryColorOverrides
                    });
                    setNotifications(previous => [{
                        id: `province-independence-${Date.now()}`,
                        title: detail.triggeredByReferendum
                            ? '🗳️ REFERENDUM KEMERDEKAAN DISETUJUI'
                            : '🏳️ KEMERDEKAAN PROVINSI DIPULIHKAN',
                        sender: `Pemerintah ${detail.occupyingCountry}`,
                        message: detail.triggeredByReferendum
                            ? `${detail.actionMessage || 'Mayoritas warga memilih merdeka.'} ${message}`
                            : message,
                        timestamp,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...previous]);
                    return;
                } catch (error) {
                    console.error(`Failed to restore ${detail.targetCountry} independence:`, error);
                    if (detail.triggeredByReferendum) {
                        setCountryDetail((previous: Record<string, unknown> | null) => {
                            if (!previous) return previous;
                            const referendums = previous.provinceReferendums && typeof previous.provinceReferendums === 'object'
                                ? previous.provinceReferendums as Record<string, ProvinceReferendum>
                                : {};
                            const referendumEntry = Object.keys(referendums).find(
                                name => name.toLowerCase().trim() === detail.targetCountry.toLowerCase().trim()
                            );
                            if (!referendumEntry) return previous;
                            return {
                                ...previous,
                                provinceReferendums: {
                                    ...referendums,
                                    [referendumEntry]: {
                                        ...referendums[referendumEntry],
                                        status: 'failed'
                                    }
                                }
                            };
                        });
                    }
                    setNotifications(previous => [{
                        id: `province-independence-failed-${Date.now()}`,
                        title: '❌ PEMULIHAN KEMERDEKAAN GAGAL',
                        sender: `Pemerintah ${detail.occupyingCountry}`,
                        message: `Kemerdekaan ${detail.targetCountry} belum diproses: ${error instanceof Error ? error.message : 'Terjadi kesalahan saat memulihkan data wilayah.'}`,
                        timestamp,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...previous]);
                    return;
                }
                return;
            }

            setNotifications(previous => [{
                id: `province-action-${detail.actionId}-${Date.now()}`,
                title: detail.actionId === 'referendum_dimulai'
                    ? '🗳️ REFERENDUM KEMERDEKAAN DIMULAI'
                    : detail.actionId === 'referendum_ditolak'
                        ? '📊 REFERENDUM MENOLAK KEMERDEKAAN'
                        : detail.actionSucceeded === false
                            ? `❌ ${detail.actionLabel.toUpperCase()} GAGAL`
                            : `🏛️ ${detail.actionLabel.toUpperCase()} ${detail.actionMessage ? 'SELESAI' : 'DICATAT'}`,
                sender: `Pemerintah ${detail.occupyingCountry}`,
                message: detail.actionMessage ||
                    `Aksi "${detail.actionLabel}" untuk Provinsi ${detail.targetCountry} telah dikonfirmasi dan dicatat.`,
                timestamp,
                type: 'peringkat',
                value: 100,
                isRead: false,
                provinceIncident: detail.provinceIncident
            }, ...previous]);
        };

        window.addEventListener(PROVINCE_ACTION_EVENT, handleProvinceAction);
        return () => window.removeEventListener(PROVINCE_ACTION_EVENT, handleProvinceAction);
    }, [currentDate]);

    useEffect(() => {
        if (!countryDetail || !Number.isFinite(currentDate.getTime())) return;
        const referendums = countryDetail.provinceReferendums;
        if (!referendums || typeof referendums !== 'object') return;

        Object.entries(referendums as Record<string, ProvinceReferendum>).forEach(([targetCountry, referendum]) => {
            if (!hasProvinceReferendumEnded(referendum, currentDate)) return;
            const referendumKey = `${targetCountry.toLowerCase().trim()}-${referendum.openedAt}`;
            if (processedReferendumsRef.current.has(referendumKey)) return;
            processedReferendumsRef.current.add(referendumKey);

            const result = resolveProvinceReferendum(referendum.crackdownIncidents);
            setCountryDetail((previous: Record<string, unknown> | null) => {
                if (!previous) return previous;
                const currentReferendums = previous.provinceReferendums && typeof previous.provinceReferendums === 'object'
                    ? previous.provinceReferendums as Record<string, ProvinceReferendum>
                    : {};
                const currentEntry = Object.keys(currentReferendums).find(
                    name => name.toLowerCase().trim() === targetCountry.toLowerCase().trim()
                );
                if (!currentEntry || !hasProvinceReferendumEnded(currentReferendums[currentEntry], currentDate)) {
                    return previous;
                }

                if (result.approved) {
                    return {
                        ...previous,
                        provinceReferendums: {
                            ...currentReferendums,
                            [currentEntry]: {
                                ...currentReferendums[currentEntry],
                                status: 'processing',
                                independenceVoteShare: result.independenceVoteShare
                            }
                        }
                    };
                }

                const nextReferendums = { ...currentReferendums };
                delete nextReferendums[currentEntry];
                const tensions = previous.provinceTensions && typeof previous.provinceTensions === 'object'
                    ? previous.provinceTensions as Record<string, unknown>
                    : {};
                const tensionEntry = Object.keys(tensions).find(
                    name => name.toLowerCase().trim() === targetCountry.toLowerCase().trim()
                ) || targetCountry;
                return {
                    ...previous,
                    provinceReferendums: nextReferendums,
                    provinceTensions: { ...tensions, [tensionEntry]: 70 }
                };
            });

            if (result.approved) {
                window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, {
                    detail: {
                        actionId: 'beri_kemerdekaan',
                        actionLabel: 'Referendum Kemerdekaan',
                        targetCountry,
                        occupyingCountry: countryDetail.country || countryDetail.nama || 'Negara Pemain',
                        actionSucceeded: true,
                        actionMessage: `Referendum selesai: ${result.independenceVoteShare}% warga ${targetCountry} memilih kemerdekaan.`,
                        triggeredByReferendum: true,
                        referendumVoteShare: result.independenceVoteShare
                    } satisfies ProvinceActionEventDetail
                }));
            } else {
                window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, {
                    detail: {
                        actionId: 'referendum_ditolak',
                        actionLabel: 'Hasil Referendum',
                        targetCountry,
                        occupyingCountry: countryDetail.country || countryDetail.nama || 'Negara Pemain',
                        actionSucceeded: true,
                        actionMessage: `Referendum selesai: ${result.independenceVoteShare}% warga ${targetCountry} memilih kemerdekaan, sehingga usulan tidak disetujui. Wilayah tetap menjadi provinsi dan ketegangan turun menjadi 70.`
                    } satisfies ProvinceActionEventDetail
                }));
            }
        });
    }, [countryDetail, currentDate]);
    const [resultModal, setResultModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        losses?: Array<{ unitKey: string; quantity: number }>;
        type?: 'success' | 'error' | 'info';
        persistent?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Confirmation & war result modals remain visible until the player closes them manually.

    // Track triggers to prevent spamming notifications on every tick when index is in warning zone
    const [hasShownEarlyWarning, setHasShownEarlyWarning] = useState<{
        kepuasan: boolean;
        peringkat: boolean;
        kesejahteraan: boolean;
    }>({ kepuasan: false, peringkat: false, kesejahteraan: false });

    // Sync presidentRating state to countryDetail so simulation ticks always use the newest rating
    useEffect(() => {
        if (!countryDetail) return;
        if (countryDetail.presidentRating !== presidentRating) {
            setCountryDetail((prev: any) => {
                if (!prev || prev.presidentRating === presidentRating) return prev;
                return { ...prev, presidentRating };
            });
        }
    }, [presidentRating, countryDetail?.presidentRating]);

    const [isRatingWarningOpen, setIsRatingWarningOpen] = useState(false);
    const [hasShownRatingWarning, setHasShownRatingWarning] = useState(false);
    const [warningType, setWarningType] = useState<"peringkat" | "kepuasan" | "kesejahteraan">("peringkat");
    const [warningValue, setWarningValue] = useState<number>(50);

    const [isKudetaOpen, setIsKudetaOpen] = useState(false);
    const [kudetaType, setKudetaType] = useState<KudetaType>("peringkat");
    const [kudetaValue, setKudetaValue] = useState<number>(1);
    // Tampilkan modal peringatan ketika peringkat, kepuasan, atau kesejahteraan turun ke 10 atau kurang
    // Serta trigger notifikasi peringatan dini di inbox saat mencapai threshold (25-20-15)
    useEffect(() => {
        if (isPausedRef.current || (typeof window !== "undefined" && (window as any).neosantara_is_paused)) {
            return;
        }

        const kepuasanVal = countryDetail?.kepuasan ?? 50;
        const kesejahteraanVal = countryDetail?.kesejahteraan ?? 50;

        // Formatting date inline
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;

        // 1. EARLY WARNING INBOX NOTIFICATIONS
        const nextEarlyWarning = { ...hasShownEarlyWarning };
        let hasNotificationUpdates = false;
        const newNotifs: NotificationMessage[] = [];

        // Kepuasan early warning (threshold <= 25, modal limit <= 10)
        if (kepuasanVal <= 25 && kepuasanVal > 10) {
            if (!hasShownEarlyWarning.kepuasan) {
                newNotifs.push(getKepuasanWarningMessage(kepuasanVal, currentDateStr));
                nextEarlyWarning.kepuasan = true;
                hasNotificationUpdates = true;
            }
        } else if (kepuasanVal > 25) {
            if (hasShownEarlyWarning.kepuasan) {
                nextEarlyWarning.kepuasan = false;
                hasNotificationUpdates = true;
            }
        }

        // Peringkat early warning (threshold <= 20, modal limit <= 10)
        if (presidentRating <= 20 && presidentRating > 10) {
            if (!hasShownEarlyWarning.peringkat) {
                newNotifs.push(getPeringkatWarningMessage(presidentRating, currentDateStr));
                nextEarlyWarning.peringkat = true;
                hasNotificationUpdates = true;
            }
        } else if (presidentRating > 20) {
            if (hasShownEarlyWarning.peringkat) {
                nextEarlyWarning.peringkat = false;
                hasNotificationUpdates = true;
            }
        }

        // Kesejahteraan early warning (threshold <= 15, modal limit <= 10)
        if (kesejahteraanVal <= 15 && kesejahteraanVal > 10) {
            if (!hasShownEarlyWarning.kesejahteraan) {
                newNotifs.push(getKesejahteraanWarningMessage(kesejahteraanVal, currentDateStr));
                nextEarlyWarning.kesejahteraan = true;
                hasNotificationUpdates = true;
            }
        } else if (kesejahteraanVal > 15) {
            if (hasShownEarlyWarning.kesejahteraan) {
                nextEarlyWarning.kesejahteraan = false;
                hasNotificationUpdates = true;
            }
        }

        if (hasNotificationUpdates) {
            setHasShownEarlyWarning(nextEarlyWarning);
            if (newNotifs.length > 0) {
                setNotifications(prev => [
                    ...newNotifs,
                    ...prev
                ]);
            }
        }

        // 2. CRITICAL MODAL WARNINGS & KUDETA (GAME OVER)
        let triggerWarning = false;
        let type: "peringkat" | "kepuasan" | "kesejahteraan" = "peringkat";
        let value = 50;

        // Cek Kudeta terlebih dahulu (titik didih di angka <= 1)
        if (presidentRating <= 1 || kepuasanVal <= 1 || kesejahteraanVal <= 1) {
            let kType: KudetaType = "peringkat";
            let kVal = presidentRating;
            if (kepuasanVal <= 1) {
                kType = "kepuasan";
                kVal = Math.round(kepuasanVal);
            } else if (kesejahteraanVal <= 1) {
                kType = "kesejahteraan";
                kVal = Math.round(kesejahteraanVal);
            }

            setKudetaType(kType);
            setKudetaValue(kVal);
            setIsKudetaOpen(true);
            setIsPaused(true);
            if (timeManagerRef.current) {
                timeManagerRef.current.setPaused(true);
            }
            return;
        }

        if (presidentRating <= 10) {
            triggerWarning = true;
            type = "peringkat";
            value = presidentRating;
        } else if (kepuasanVal <= 10) {
            triggerWarning = true;
            type = "kepuasan";
            value = Math.round(kepuasanVal);
        } else if (kesejahteraanVal <= 10) {
            triggerWarning = true;
            type = "kesejahteraan";
            value = Math.round(kesejahteraanVal);
        }

        if (triggerWarning) {
            if (!hasShownRatingWarning) {
                setWarningType(type);
                setWarningValue(value);
                setIsRatingWarningOpen(true);
                setHasShownRatingWarning(true);

                // 🔥 HENTIKAN PAKSA SIMULATION CALENDAR / CLOCK
                setIsPaused(true);
                if (timeManagerRef.current) {
                    timeManagerRef.current.setPaused(true);
                }
            }
        } else {
            // Reset trigger jika semua indikator sudah aman di atas 10
            setHasShownRatingWarning(false);
        }
    }, [presidentRating, countryDetail?.kepuasan, countryDetail?.kesejahteraan, hasShownRatingWarning, hasShownEarlyWarning, currentDate]);

    // 🔥 Sync pending notifications from modals into inbox
    useEffect(() => {
        if (Array.isArray(countryDetail?.pending_notifications) && countryDetail.pending_notifications.length > 0) {
            const pending = countryDetail.pending_notifications;
            const inboxNotifications = pending.filter(
                (notification: unknown) => !isNonActionableUpdateNotification(notification),
            );
            if (inboxNotifications.length > 0) {
                setNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const uniqueNew: NotificationMessage[] = [];
                    for (const notif of inboxNotifications) {
                        if (!notif || !notif.id || existingIds.has(notif.id)) continue;
                        existingIds.add(notif.id);
                        uniqueNew.push(notif);
                    }
                    return uniqueNew.length > 0 ? [...uniqueNew, ...prev] : prev;
                });
            }
            const generatedNews: NewsItemData[] = [];
            const notificationCountry = String(
                countryDetail.country ||
                countryDetail.nama_negara ||
                countryDetail.nama ||
                selectedCountry?.country ||
                '',
            );
            for (const notification of pending) {
                const candidates: Array<NewsItemData | null> = [
                    generateDiplomacyNews(notification),
                    generateEconomyNews(notification),
                    generateMilitaryAchievementNews(notification),
                ];
                for (const item of candidates) {
                    if (item) generatedNews.push({ ...item, countryName: notificationCountry });
                }
            }
            if (generatedNews.length > 0) {
                setNewsList(previous => {
                    const existingIds = new Set(previous.map(item => item.id));
                    return [
                        ...generatedNews.filter(item => !existingIds.has(item.id)),
                        ...previous,
                    ];
                });
            }
            setCountryDetail((prev: any) => ({
                ...prev,
                pending_notifications: []
            }));
        }
    }, [countryDetail?.pending_notifications, countryDetail?.country, countryDetail?.nama_negara, countryDetail?.nama, selectedCountry?.country, setCountryDetail]);

    // Sinkronisasi Berita dari Pembangunan & Aksi AI NPC ke daftar Berita & Update Geopolitik
    useEffect(() => {
        const handleAiNewsUpdated = (e: Event) => {
            // Jika game sedang paused, jangan masukkan berita baru
            const isPaused = isPausedRef.current || (typeof window !== "undefined" && Boolean((window as any).neosantara_is_paused));
            if (isPaused) return;

            const detail = (e as CustomEvent)?.detail as NewsItemData | undefined;
            if (!detail || !detail.id) return;
            acknowledgeAiNews(detail.id);
            setNewsList(prev => {
                if (prev.some(item => item.id === detail.id)) return prev;
                return [detail, ...prev];
            });
        };

        if (typeof window !== "undefined") {
            window.addEventListener("neosantara:ai-news-updated", handleAiNewsUpdated);
            clearStoredAiNews();
            const pending = takePendingAiNews();
            if (pending.length > 0) {
                setNewsList(previous => {
                    const existingIds = new Set(previous.map(item => item.id));
                    const additions = pending.filter(item => !existingIds.has(item.id));
                    return additions.length > 0 ? [...additions, ...previous] : previous;
                });
            }
        }

        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("neosantara:ai-news-updated", handleAiNewsUpdated);
            }
        };
    }, []);

    useEffect(() => {
        if (!countryDetail) return;
        if (isPausedRef.current || (typeof window !== "undefined" && (window as any).neosantara_is_paused)) {
            return;
        }
        const budget = Number(countryDetail.anggaran) || 0;
        const crisisActive = Boolean(countryDetail.economic_crisis_active);

        if (budget < 0 && !crisisActive) {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;
            setCountryDetail((prev: Record<string, unknown> | null) => {
                if (!prev || (Number(prev.anggaran) || 0) >= 0 || prev.economic_crisis_active) return prev;
                const eventNumber = (Number(prev.economic_crisis_event_count) || 0) + 1;
                const crisisNotification = generateEconomicCrisisNotification(
                    String(prev.country || prev.nama || selectedCountry?.country || 'negara'),
                    Number(prev.anggaran) || 0,
                    dateStr,
                    eventNumber,
                );
                return {
                    ...prev,
                    economic_crisis_active: true,
                    economic_crisis_event_count: eventNumber,
                    pending_notifications: [crisisNotification, ...(Array.isArray(prev.pending_notifications) ? prev.pending_notifications : [])],
                };
            });
        } else if (budget >= 0 && crisisActive) {
            setCountryDetail((prev: Record<string, unknown> | null) => (
                prev && (Number(prev.anggaran) || 0) >= 0 && prev.economic_crisis_active
                    ? { ...prev, economic_crisis_active: false }
                    : prev
            ));
        }
    }, [countryDetail?.anggaran, countryDetail?.economic_crisis_active, currentDate, selectedCountry?.country, setCountryDetail]);

    // --- TIMED WEEKLY TRADE OFFER NOTIFICATIONS (1-2 PER WEEK) ---
    useEffect(() => {
        if (!currentDate || !countryDetail) return;
        const gameStartStr = countryDetail.game_start_date as string | undefined;
        if (!gameStartStr) return;

        // Hitung selisih hari simulasi kalender
        const startParts = gameStartStr.split("-").map(Number);
        const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        const currentOnlyDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const diffDays = Math.round((currentOnlyDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return;

        // Cari index hari dalam seminggu (misal hari ke 3 dan 6 memicu)
        const dayInWeek = diffDays % 7;
        const currentWeekIndex = Math.floor(diffDays / 7);

        // Track last notification sent days to prevent duplicate sends on the same day
        const globalLastSentDay = Number(countryDetail.last_trade_notification_day ?? -1);
        if (diffDays === globalLastSentDay) return;

    }, [currentDate, countryDetail, setCountryDetail]);

    // Clear the previous year's inbox and news when simulation time rolls into January 1.
    useEffect(() => {
        if (!currentDate) return;

        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentDay = currentDate.getDate();
        const currentDateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        const previousDateKey = lastObservedNewsResetDateRef.current;
        lastObservedNewsResetDateRef.current = currentDateKey;

        if (
            !previousDateKey ||
            currentMonth !== 0 ||
            currentDay !== 1 ||
            Number(previousDateKey.slice(0, 4)) >= currentYear
        ) {
            return;
        }

        setNotifications([]);
        setNewsList([]);
        setCountryDetail((previous: Record<string, unknown> | null) => (
            previous && Array.isArray(previous.pending_notifications) && previous.pending_notifications.length > 0
                ? { ...previous, pending_notifications: [] }
                : previous
        ));
    }, [currentDate, setCountryDetail]);

    const lastProcessedNotificationMonthRef = useRef<string | null>(null);
    const lastProcessedNotificationDateRef = useRef<string | null>(null);

    // --- MONTHLY NOTIFICATIONS GENERATOR (25% CHANCE PER BULAN ~ 3-5 EVENT / TAHUN) ---
    useEffect(() => {
        if (!currentDate || !countryDetail) return;

        const yearStr = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${yearStr}-${monthStr}-${dayStr}`;

        // ===== CHANGE TO DAILY CHECK (tidak monthly) =====
        const lastCheckedDate = countryDetail.last_checked_notification_date;

        // Check both state AND ref untuk prevent duplicate notifications across reloads
        if (lastCheckedDate === currentDateStr && lastProcessedNotificationDateRef.current === currentDateStr) {
            return; // Already checked today (both persisted state and in-memory ref match)
        }

        // Catat tanggal awal permainan jika belum ada
        if (!countryDetail.game_start_date) {
            setCountryDetail((prev: any) => (prev ? { ...prev, game_start_date: currentDateStr } : prev));
            // Jangan langsung spawn/spam event di hari pertama game dimulai
            return;
        }

        // Cek apakah minimal 1 hari sudah berlalu sejak hari pertama game dimulai
        const startDiff = getDaysDifference(countryDetail.game_start_date, currentDateStr);
        if (startDiff < 1) {
            return;
        }

        if (isPausedRef.current || (typeof window !== "undefined" && (window as any).neosantara_is_paused)) {
            return;
        }

        let idleCallbackId: number | null = null;
        let fallbackTimerId: number | null = null;
        const runNotificationGenerator = async () => {
            if (lastProcessedNotificationDateRef.current === currentDateStr) return;
            lastProcessedNotificationMonthRef.current = currentDateStr;
            lastProcessedNotificationDateRef.current = currentDateStr;

            const userCountryName = countryDetail.country || countryDetail.nama || "Indonesia";
            let worldNewsResult;
            try {
                worldNewsResult = await generateWorldNewsEventsInRust(
                    COUNTRIES_DATA,
                    userCountryName,
                    Number(countryDetail.world_news_country_cursor) || 0,
                    currentDateStr,
                );
            } catch (error) {
                console.error('Rust world news generation failed; using TypeScript fallback:', error);
                worldNewsResult = generateWorldNewsEvents(
                    COUNTRIES_DATA,
                    userCountryName,
                    Number(countryDetail.world_news_country_cursor) || 0,
                    currentDateStr,
                );
            }

            const currentNotificationDate = notificationDateRef.current;
            const interactionStarted = Boolean(
                (window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active
            ) || isTimeControllerHoveredRef.current;
            if (currentNotificationDate !== currentDateStr || interactionStarted) {
                if (lastProcessedNotificationDateRef.current === currentDateStr) {
                    lastProcessedNotificationDateRef.current = null;
                }
                if (currentNotificationDate === currentDateStr && interactionStarted) {
                    scheduleNotificationGenerator();
                }
                return;
            }
            if (worldNewsResult.news.length > 0) {
                setNewsList(previous => {
                    const existingIds = new Set(previous.map(item => item.id));
                    const uniqueNews = worldNewsResult.news.filter(item => !existingIds.has(item.id));
                    return uniqueNews.length > 0 ? [...uniqueNews, ...previous] : previous;
                });
            }

            const playerEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
            const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
            const addedTradePartners = Array.isArray(countryDetail?.addedTradePartners) ? countryDetail.addedTradePartners : [];
            const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];
            const normalizePartnerName = (name: string) => name.toLowerCase().trim();

            const staticPartners = getTradeAgreementsForCountry(userCountryName).map(c => c.mitra);
            const allTradePartners = Array.from(new Set([
                ...staticPartners.filter(p => !removedTradePartners.some(
                    (removed: string) => normalizePartnerName(removed) === normalizePartnerName(p)
                )),
                ...addedTradePartners.filter((partner: string) => !removedTradePartners.some(
                    (removed: string) => normalizePartnerName(removed) === normalizePartnerName(partner)
                ))
            ]));

            const internationalPool = [
                'Jepang', 'Amerika Serikat', 'Jerman', 'Inggris', 'Prancis', 'China',
                'Korea Selatan', 'Australia', 'Rusia', 'Arab Saudi', 'Kanada', 'Brasil',
                'India', 'Turki', 'Meksiko', 'Singapura', 'Malaysia', 'Thailand', 'Vietnam'
            ];

            const staticEmbassyPartners = getEmbassiesForCountry(userCountryName);
            const activeEmbassies = Array.from(new Set([
                ...staticEmbassyPartners.filter(p => !removedEmbassies.includes(p)),
                ...playerEmbassies.map((e: any) => typeof e === 'string' ? e : e.mitra || e.nama_negara || '')
            ])).filter(Boolean);

            const embassyPartnerPool = activeEmbassies.length > 0 ? activeEmbassies : internationalPool;

            const newNotifsToAdd: any[] = [];

            // 1. Penawaran Transaksi Ekspor / Impor (2% daily chance)
            if (Math.random() < 0.02) {
                const partnerName = allTradePartners.length > 0
                    ? allTradePartners[Math.floor(Math.random() * allTradePartners.length)]
                    : internationalPool[Math.floor(Math.random() * internationalPool.length)];
                const premiumProducts = ["uranium", "pabrik_semikonduktor", "logam_tanah_jarang", "pabrik_mesin", "pabrik_besi", "litium"];
                const productKey = premiumProducts[Math.floor(Math.random() * premiumProducts.length)];
                const quantity = Math.floor(Math.random() * 300) + 20;
                const prices: Record<string, number> = {
                    uranium: 8000, pabrik_semikonduktor: 4000, logam_tanah_jarang: 5000, pabrik_mesin: 10000, pabrik_besi: 10000, litium: 3000
                };
                const basePrice = prices[productKey] || 100;
                const pricePerUnit = Math.round(basePrice * (0.85 + Math.random() * 0.3) * 100) / 100;

                if (Math.random() > 0.5) {
                    newNotifsToAdd.push(generateAITradeJualNotification(partnerName, productKey, quantity, pricePerUnit, currentDateStr));
                } else {
                    newNotifsToAdd.push(generateAITradeBeliNotification(partnerName, productKey, quantity, pricePerUnit, currentDateStr));
                }
            }

            // 2. Penawaran Kedutaan Besar (2% daily chance)
            if (Math.random() < 0.02) {
                const embassyNotif = checkAndGenerateEmbassyOffers(
                    userCountryName,
                    notifications,
                    currentDateStr,
                    true,
                    playerEmbassies,
                    removedEmbassies
                );
                if (embassyNotif) {
                    newNotifsToAdd.push(embassyNotif);
                } else {
                    const randomPartner = internationalPool[Math.floor(Math.random() * internationalPool.length)];
                    newNotifsToAdd.push(createEmbassyOfferNotification(randomPartner, userCountryName, currentDateStr));
                }
            }

            // 3. Penawaran Hubungan Dagang Bilateral (2% daily chance)
            if (Math.random() < 0.02) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateTradeRelationOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 🎲 RANDOMISASI BENCANA ALAM & WABAH (Sangat Tidak Terduga & Sulit Ditebak)
            // Menggunakan jitter acak, ambang batas dinamis, dan faktor kejutan musiman
            const surpriseJitter = (Math.random() - 0.5) * 0.15; // Jitter tak terduga ±7.5%
            const wmoDisasterModifier = getWMODisasterRiskModifier(userCountryName, countryDetail);
            const disasterBaseChance = Math.max(0.05, 0.22 + wmoDisasterModifier / 100 + surpriseJitter);
            const disasterOccurrenceChance = disasterBaseChance * (0.45 + Math.random() * 0.35); // 0.45x - 0.80x fluktuasi

            let pendingDisasterEffect: any = null;
            let pendingDisasterCasualties = 0;
            if (Math.random() < disasterOccurrenceChance) {
                const remainingDisasterRisk = applyKementerianLingkunganHidupDisasterRiskReduction(
                    1,
                    countryDetail
                );
                if (Math.random() < remainingDisasterRisk) {
                    const disaster = generateBencanaAlamNotification(userCountryName, currentDateStr, countryDetail);
                    newNotifsToAdd.push(disaster);
                    pendingDisasterCasualties = disaster.korban;
                    pendingDisasterEffect = {
                        id: disaster.id,
                        eventName: disaster.eventName,
                        category: disaster.category,
                        korban: disaster.korban,
                        startDate: currentDateStr,
                        durationDays: 30,
                        healthMultiplier: 0.9,
                        isHandled: false
                    };
                }
            }

            // 🎲 WABAH & PANDEMI: Anomali acak, faktor resistensi & variabilitas tidak tertebak
            const whoPandemicModifier = getWHOPandemicRiskModifier(userCountryName, countryDetail);
            const randomOutbreakNoise = (Math.random() - 0.5) * 12; // Fluktuasi risiko ±6%
            const currentYearPandemicBase = getPandemicBaseChancePercentByYear(countryDetail, currentDateStr);
            const dynamicPandemicChance = Math.max(5, currentYearPandemicBase + whoPandemicModifier + randomOutbreakNoise);

            // ===== GRACE PERIOD: Jangan spawn outbreak di 30 hari pertama game =====
            const gameStartStr = countryDetail?.game_start_date as string | undefined;
            let daysSinceGameStart = 365 * 10; // Default: jauh di masa depan (no grace period)
            if (gameStartStr) {
                daysSinceGameStart = getDaysDifference(gameStartStr, currentDateStr);
            } else if (countryDetail?.game_start_year) {
                const gameStartDate = new Date(Number(countryDetail.game_start_year), 0, 1);
                const currentDate = new Date(currentDateStr);
                daysSinceGameStart = Math.floor((currentDate.getTime() - gameStartDate.getTime()) / (1000 * 60 * 60 * 24));
            }

            const isInGracePeriod = daysSinceGameStart < 30;
            const epidemicBaseForDaily = isInGracePeriod ? 1 : 25; // 25% base untuk daily = ~1x per 4 hari, atau ~7x per bulan (match dengan 1-5x per tahun frequency)
            const dynamicEpidemicChance = Math.max(10, epidemicBaseForDaily + whoPandemicModifier + randomOutbreakNoise);
            const outbreakRoll = Math.random() * 100;
            let nextPandemicSchedule: { year: number; hit: boolean; day: number; fired?: boolean } | undefined;

            // Ambang acak ganda agar probabilitas tidak berpola tetap
            // Pandemi: diundi SEKALI per tahun dengan persentase siklus (30/35/40/45/50%),
            // lalu dijadwalkan pada hari acak di tahun tersebut (bukan diundi tiap hari).
            const pandemicYear = currentDate.getFullYear();
            const dayOfYear = Math.floor(
                (new Date(pandemicYear, currentDate.getMonth(), currentDate.getDate()).getTime() -
                    new Date(pandemicYear, 0, 1).getTime()) / 86400000
            );
            let pandemicSchedule = countryDetail?.pandemic_schedule as
                { year: number; hit: boolean; day: number; fired?: boolean } | undefined;
            if (!pandemicSchedule || pandemicSchedule.year !== pandemicYear) {
                const yearlyChance = Math.min(100, Math.max(0, currentYearPandemicBase + whoPandemicModifier));
                // Jadwalkan paling cepat 30 hari setelah hari ini/tahun baru agar tidak langsung muncul di bulan pertama
                const minDay = Math.max(30, dayOfYear + 30);
                const remainingDaysInYear = Math.max(1, 350 - minDay);
                pandemicSchedule = {
                    year: pandemicYear,
                    hit: Math.random() * 100 < yearlyChance,
                    day: minDay + Math.floor(Math.random() * remainingDaysInYear),
                    fired: false,
                };
            }
            let isPandemicHit = !isInGracePeriod && pandemicSchedule.hit &&
                !pandemicSchedule.fired && dayOfYear >= pandemicSchedule.day;
            nextPandemicSchedule = pandemicSchedule;
            let isEpidemicHit = !isPandemicHit && outbreakRoll < (dynamicEpidemicChance * (0.75 + Math.random() * 0.5));

            // 🔒 APPLY FREQUENCY CONTROLS
            // Pandemi: 0-1 kali setahun
            if (isPandemicHit && !canPandemicOccur(countryDetail, currentDateStr)) {
                isPandemicHit = false;
            }
            if (isPandemicHit && nextPandemicSchedule) {
                nextPandemicSchedule = { ...nextPandemicSchedule, fired: true };
            }

            // Epidemi: 1-5 kali setahun dengan minimum 2 minggu spacing
            if (isEpidemicHit && !canEpidemicOccur(countryDetail, currentDateStr)) {
                isEpidemicHit = false;
            }

            const outbreakType = isPandemicHit ? 'pandemi' : isEpidemicHit ? 'epidemi' : null;
            let pendingOutbreakEffect: any = null;
            let pendingOutbreakPopulationLoss = 0;
            let pendingConsecutiveOutbreakBoost = 0;

            if (outbreakType) {
                const currentPopulation = Number(countryDetail?.jumlah_penduduk);
                const outbreak = generateWabahPenyakitNotification(
                    userCountryName,
                    currentDateStr,
                    Number.isFinite(currentPopulation) && currentPopulation > 0
                        ? currentPopulation
                        : undefined,
                    outbreakType
                );
                newNotifsToAdd.push(outbreak);

                // 💀 APPLY POPULATION LOSS IMMEDIATELY
                // Populasi langsung berkurang sebesar perkiraanKematian (tidak bertahap)
                const populationAfterOutbreak = applyOutbreakPopulationLoss(currentPopulation, outbreak);
                pendingOutbreakPopulationLoss = Math.max(0, currentPopulation - populationAfterOutbreak);
                pendingConsecutiveOutbreakBoost = outbreakType === 'pandemi' ? 2 : 1;
                pendingOutbreakEffect = {
                    id: outbreak.id,
                    eventName: outbreak.eventName,
                    category: outbreak.category,
                    korban: outbreak.korban,
                    perkiraanKematian: outbreak.perkiraanKematian,
                    durationDays: outbreak.durationDays,
                    startDate: currentDateStr,
                    isHandled: false
                };
            }

            // Risiko keamanan mengikuti rata-rata kekurangan fasilitas kesehatan dan hukum.
            const healthAndLawScore = (
                calculateKesehatanScore(countryDetail) +
                calculatePenegakanHukumScore(countryDetail)
            ) / 2;
            const securityRiskPercent = 100 - healthAndLawScore;

            // ── FIX: notifikasi kepolisian sebelumnya muncul tiap hari karena peluangnya
            // langsung = securityRiskPercent% (bisa 50–100%), tanpa cooldown & tanpa grace.
            // Sekarang: flat 2%/hari (selaras dengan notifikasi lain), hanya saat risiko
            // benar-benar berarti (>= 20%), dan ada jeda minimal 14 hari antar-notifikasi.
            const SECURITY_COOLDOWN_DAYS = 14;
            const SECURITY_DAILY_CHANCE_PERCENT = 2;
            const SECURITY_MIN_RISK_PERCENT = 20;

            const lastSecurityNotifDate = typeof countryDetail?.last_keamanan_notification_date === 'string'
                ? countryDetail.last_keamanan_notification_date
                : null;
            const daysSinceLastSecurityNotif = lastSecurityNotifDate
                ? getDaysDifference(lastSecurityNotifDate, currentDateStr)
                : Number.POSITIVE_INFINITY;
            let nextKeamananNotificationDate: string | null = lastSecurityNotifDate;

            if (
                !isInGracePeriod &&
                securityRiskPercent >= SECURITY_MIN_RISK_PERCENT &&
                daysSinceLastSecurityNotif >= SECURITY_COOLDOWN_DAYS &&
                Math.random() * 100 < SECURITY_DAILY_CHANCE_PERCENT
            ) {
                newNotifsToAdd.push(
                    generateKeamananNotification(userCountryName, currentDateStr, securityRiskPercent),
                );
                nextKeamananNotificationDate = currentDateStr;
            }

            // 5. Notifikasi Pertahanan & Intelijen (Spionase, Sabotase, Diserang, Pemberontakan, ICBM)
            const separatismeRisk = calculateSeparatismeRiskPercent(countryDetail);
            const isSeparatismeTriggered = separatismeRisk > 0 && (Math.random() * 100 < separatismeRisk);
            const defensePartners = internationalPool.filter(
                partner => partner.trim().toLowerCase() !== userCountryName.trim().toLowerCase()
            );

            if (isSeparatismeTriggered || (defensePartners.length > 0 && Math.random() < 0.25)) {
                const defRoll = Math.random();
                const randomPartner = defensePartners[Math.floor(Math.random() * defensePartners.length)];
                if (isSeparatismeTriggered) {
                    newNotifsToAdd.push(generatePemberontakanNotification(userCountryName, currentDateStr, separatismeRisk));
                } else if (defRoll < 0.35) {
                    newNotifsToAdd.push(generateSpionaseNotification(randomPartner, currentDateStr));
                } else if (defRoll < 0.65) {
                    newNotifsToAdd.push(generateSabotaseNotification(randomPartner, currentDateStr));
                }
            }

            // 5.1 Simulasi Uji Coba Nuklir / ICBM Negara Lain (2% daily chance)
            // Mengevaluasi negara-negara lain di dunia yang telah memiliki Program Nuklir atau ICBM
            if (Math.random() < 0.02) {
                const simSnapshot = getNpcCountrySimulationSnapshot();
                const defaultNuclearNames = ['Amerika Serikat', 'Rusia', 'China', 'Korea Utara', 'India'];
                const userNorm = userCountryName.trim().toLowerCase();

                // Kumpulkan kandidat negara pemilik nuklir / ICBM selain negara pemain
                const candidateNuclearCountries: Array<{
                    name: string;
                    slug: string;
                    icbmCount: number;
                    isDefault: boolean;
                }> = [];

                // 1. Masukkan negara superpower default nuklir yang bukan pemain
                defaultNuclearNames.forEach(name => {
                    if (name.trim().toLowerCase() !== userNorm) {
                        const slug = name.toLowerCase().replace(/\s+/g, '_');
                        const baseIcbm = getNegaraNuklirBaseIcbm(slug, name);
                        const npcData = simSnapshot?.countries?.[slug];
                        const currentIcbm = Number(npcData?.icbm_jumlah ?? baseIcbm);
                        candidateNuclearCountries.push({
                            name,
                            slug,
                            icbmCount: Math.max(0, currentIcbm),
                            isDefault: true,
                        });
                    }
                });

                // 2. Masukkan negara NPC lain yang mengembangkan program nuklir atau memiliki ICBM di snapshot
                if (simSnapshot?.countries) {
                    Object.entries(simSnapshot.countries).forEach(([cSlug, cData]: [string, any]) => {
                        const cName = String(cData?.nama_negara || cData?.country || cData?.name_id || cSlug);
                        if (
                            cSlug !== simSnapshot.playerCountrySlug &&
                            cName.trim().toLowerCase() !== userNorm &&
                            !candidateNuclearCountries.some(c => c.slug === cSlug)
                        ) {
                            const hasActiveNuclear = Boolean(cData?.programNuklirActive);
                            const icbmNum = Number(cData?.icbm_jumlah ?? 0);
                            const hasIcbm = Boolean(cData?.icbm_status) || icbmNum > 0;
                            if (hasActiveNuclear || hasIcbm) {
                                candidateNuclearCountries.push({
                                    name: cName,
                                    slug: cSlug,
                                    icbmCount: Math.max(0, icbmNum),
                                    isDefault: isNegaraNuklirBawaan(cSlug, cName),
                                });
                            }
                        }
                    });
                }

                if (candidateNuclearCountries.length > 0) {
                    const chosenTester = candidateNuclearCountries[Math.floor(Math.random() * candidateNuclearCountries.length)];
                    const targetLoc = getRealisticTargetLocationName(chosenTester.name, chosenTester.name);
                    const targetLocationName = targetLoc.realisticName;

                    // Kurangi 1 ICBM jika negara memiliki stok ICBM
                    let remainingCount = chosenTester.icbmCount;
                    if (remainingCount > 0) {
                        remainingCount -= 1;
                        updateNpcCountrySimulationState(chosenTester.slug, {
                            icbm_jumlah: remainingCount,
                            icbm_status: remainingCount > 0,
                        });
                    }

                    // Tambahkan notifikasi uji coba nuklir ke Inbox
                    newNotifsToAdd.push(
                        generateUjicobaNuklirAINotification(
                            chosenTester.name,
                            targetLocationName,
                            remainingCount,
                            currentDateStr
                        )
                    );

                    // Siarkan berita geopolitik uji coba nuklir / rudal balistik
                    terbitkanBeritaAI({
                        id: `news-ujicoba-${chosenTester.slug}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                        type: 'update_geopolitik',
                        category: 'pencapaian_militer',
                        headline: `💥 ${chosenTester.name} Menggelar Uji Coba Rudal Balistik Nuklir!`,
                        content: `Otoritas militer ${chosenTester.name} berhasil meluncurkan dan menguji coba sistem rudal strategis berkemampuan nuklir di ${targetLocationName}. Radar pertahanan internasional mencatat lintasan balistik sukses terkonfirmasi, memicu kewaspadaan tinggi di kawasan regional.`,
                        timestamp: currentDateStr,
                        dateStr: currentDateStr,
                        countryName: chosenTester.name,
                        countrySlug: chosenTester.slug,
                        constructionSection: 'militer',
                    });
                }
            }

            // Check all international countries for attack pool
            const potentialAttackers = internationalPool.filter(
                p => p.trim().toLowerCase() !== userCountryName.trim().toLowerCase()
            );

            // === INVASION YEARLY GATE (siklus 10/20/30/40/50%) ===
            // Probabilitas invasi meningkat tiap tahun, sama seperti pandemi.
            // Undian dilakukan SEKALI per tahun; jika lolos, invasi dijadwalkan pada hari acak.
            const INVASION_YEARLY_CYCLE = [10, 20, 30, 40, 50]; // %
            const invasionYear = currentDate.getFullYear();
            let invasionYearlyGatePassed = false;
            {
                const gameStartStr2 = countryDetail?.game_start_date as string | undefined;
                let gameStartYear2 = invasionYear;
                if (gameStartStr2) {
                    gameStartYear2 = parseInt(gameStartStr2.split('-')[0], 10) || invasionYear;
                } else if (countryDetail?.game_start_year) {
                    gameStartYear2 = Number(countryDetail.game_start_year);
                }
                const yearIndex2 = Math.max(0, invasionYear - gameStartYear2);
                const cycleIdx = yearIndex2 % INVASION_YEARLY_CYCLE.length;
                const yearlyChance = INVASION_YEARLY_CYCLE[cycleIdx];

                let invSchedule = countryDetail?.invasion_schedule as
                    { year: number; hit: boolean; day: number; fired?: boolean } | undefined;
                if (!invSchedule || invSchedule.year !== invasionYear) {
                    invSchedule = {
                        year: invasionYear,
                        hit: Math.random() * 100 < yearlyChance,
                        day: 7 + Math.floor(Math.random() * 350),
                        fired: false,
                    };
                }
                const dayOfYearInv = Math.floor(
                    (new Date(invasionYear, currentDate.getMonth(), currentDate.getDate()).getTime() -
                        new Date(invasionYear, 0, 1).getTime()) / 86400000
                );
                invasionYearlyGatePassed = !isInGracePeriod &&
                    invSchedule.hit && !invSchedule.fired && dayOfYearInv >= invSchedule.day;
                // Simpan jadwal ke countryDetail (akan di-persist bersama last_checked_notification_date)
                (countryDetail as any).__invasionSchedulePending = invSchedule;
            }

            if (potentialAttackers.length > 0 && invasionYearlyGatePassed) {
                // Find countries with lowest relations or pick random
                const attackerScores = potentialAttackers.map(attacker => ({
                    attacker,
                    score: getRelationValue(userCountryName, attacker, currentDateStr)
                })).sort((a, b) => a.score - b.score);

                // Pick from top 3 worst relation countries or random if relations are fine
                const criticalAttackers = attackerScores.filter(item => item.score < 25);
                const chosenAttackerObj = criticalAttackers.length > 0
                    ? criticalAttackers[Math.floor(Math.random() * criticalAttackers.length)]
                    : attackerScores[Math.floor(Math.random() * attackerScores.length)];

                const attackerCountry = chosenAttackerObj.attacker;
                const relationScore = chosenAttackerObj.score;

                // Base chance follows relation (relation <= 10 yields up to 80% chance)
                let baseChance = getAttackChancePercentFromRelation(relationScore);
                if (relationScore <= 10) {
                    baseChance = Math.max(baseChance, 80);
                } else if (relationScore <= 20) {
                    baseChance = Math.max(baseChance, 50);
                }

                const attackChancePercent = applyDoktrinPertahananDiriBonus(baseChance, countryDetail);

                if (Math.random() * 100 < attackChancePercent) {
                    // Tandai jadwal invasi sebagai sudah dieksekusi
                    if ((countryDetail as any).__invasionSchedulePending) {
                        (countryDetail as any).__invasionSchedulePending = {
                            ...(countryDetail as any).__invasionSchedulePending,
                            fired: true,
                        };
                    }
                    const userHasAnnexedTerritories = hasAnnexedTerritories(userCountryName);
                    const attackNotification = generateDiserangNotification(
                        attackerCountry,
                        currentDateStr,
                        userHasAnnexedTerritories
                    );
                    const hasApprovedInvasionResolution = hasActiveApprovedInvasionResolution(
                        attackerCountry,
                        userCountryName
                    );
                    if (hasApprovedInvasionResolution) {
                        if (Math.random() < 0.95) {
                            newNotifsToAdd.push(attackNotification);
                            window.dispatchEvent(new CustomEvent('start_war_animation', {
                                detail: {
                                    attacker: attackerCountry,
                                    target: userCountryName,
                                    targetCountryDetail: countryDetail,
                                }
                            }));
                        }
                    } else {
                        if (Math.random() < 0.25) {
                            newNotifsToAdd.push(generateDiserangNotification(
                                attackerCountry,
                                currentDateStr,
                                userHasAnnexedTerritories,
                                'invasi'
                            ));
                            window.dispatchEvent(new CustomEvent('start_war_animation', {
                                detail: {
                                    attacker: attackerCountry,
                                    target: userCountryName,
                                    targetCountryDetail: countryDetail,
                                    resolutionViolationAuthorized: true,
                                }
                            }));
                        } else {
                            const activeResolutions = loadActiveResolutions();
                            const pendingInvasionResolution = activeResolutions.find(item =>
                                item.type === 'military_invasion' &&
                                item.status === 'voting' &&
                                areSameWarCountry(item.proposer.name, attackerCountry) &&
                                areSameWarCountry(item.target.name, userCountryName)
                            );
                            if (pendingInvasionResolution) {
                                if (pendingInvasionResolution.aiInvasionAttackChance === undefined) {
                                    saveActiveResolutions(activeResolutions.map(item =>
                                        item.id === pendingInvasionResolution.id
                                            ? { ...item, aiInvasionAttackChance: attackChancePercent }
                                            : item
                                    ));
                                }
                            } else {
                                const invasionProposal = generateAIResolusiPBBNotification(
                                    attackerCountry,
                                    userCountryName,
                                    relationScore,
                                    currentDateStr,
                                    'military_invasion'
                                );
                                invasionProposal.aiInvasionAttackChance = attackChancePercent;
                                newNotifsToAdd.push(invasionProposal);
                                spawnAIResolutionFromTrigger(invasionProposal, currentDateStr);
                            }
                        }
                    }
                }
            }

            // 5B. Penawaran Pakta Non-Agresi Bilateral (2% daily chance)
            if (Math.random() < 0.02) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateNonAggressionOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5C. Peluang dasar 25% per bulan, ditambah bonus riset Aliansi Pertahanan.
            const defenseAllianceOfferChance = getDefenseAllianceOfferChancePercent(countryDetail);
            if (Math.random() * 100 < defenseAllianceOfferChance) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateDefenseAllianceOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5D. Penawaran Kontrak Penelitian Joint-R&D (2% daily chance)
            if (Math.random() < 0.02) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateResearchContractOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5E. Notifikasi Hubungan Panas / Memburuk (Setiap bulan jika skor hubungan <= 20, 15, 10, 5, 1)
            internationalPool.forEach(partner => {
                const relScore = getRelationValue(userCountryName, partner, currentDateStr);
                if (relScore <= 20) {
                    newNotifsToAdd.push(generateHubunganPanasNotification(partner, relScore, currentDateStr));
                }
            });

            // 5F & 5G. Usulan Resolusi PBB & Dewan Keamanan PBB oleh AI.
            // Satu kali undian per bulan agar presisi:
            //  - 10% keduanya muncul bersamaan
            //  - 15% hanya Resolusi PBB
            //  - 15% hanya Dewan Keamanan PBB
            //  - 60% tidak ada
            // => masing-masing tetap tepat 25% per bulan (~3-5x/tahun).
            const pbbRoll = Math.random();
            const triggerRes = pbbRoll < 0.25; // 0.00-0.10 (bersamaan) + 0.10-0.25 (hanya Resolusi)
            const triggerSec = pbbRoll < 0.10 || (pbbRoll >= 0.25 && pbbRoll < 0.40); // 0.00-0.10 (bersamaan) + 0.25-0.40 (hanya DK)

            if (triggerRes) {
                const aiResNotif = evaluateAIResolusiPBBTrigger(
                    internationalPool,
                    userCountryName,
                    (c1, c2) => getRelationValue(c1, c2, currentDateStr),
                    currentDateStr
                );
                if (aiResNotif) {
                    newNotifsToAdd.push(aiResNotif);
                    spawnAIResolutionFromTrigger(aiResNotif, currentDateStr);
                }
            }

            if (triggerSec) {
                const aiSecNotif = evaluateAIKeamananPBBTrigger(
                    internationalPool,
                    userCountryName,
                    (c1, c2) => getRelationValue(c1, c2, currentDateStr),
                    currentDateStr
                );
                if (aiSecNotif) {
                    newNotifsToAdd.push(aiSecNotif);
                    spawnAISecurityCouncilFromTrigger(aiSecNotif, currentDateStr);
                }
            }

            // 5H. Evaluasi Berita Perang / Invasi / Aneksasi / Rampasan SDA Geopolitik (2% daily chance)
            if (Math.random() < 0.02) {
                const proposedInvasions = evaluateAnnualHotRelationsInvasion(currentDateStr, userCountryName);
                const warBanActive = hasActiveGlobalWarBan();
                const authorizedInvasions = proposedInvasions.filter(invasion =>
                    hasActiveApprovedInvasionResolution(invasion.attackerCountry, invasion.targetCountry)
                );
                const violationInvasions = proposedInvasions.filter(invasion =>
                    !hasActiveApprovedInvasionResolution(invasion.attackerCountry, invasion.targetCountry) &&
                    Math.random() < 0.25
                );
                const possibleInvasions = [...authorizedInvasions, ...violationInvasions];
                const annualInvasions = warBanActive
                    ? possibleInvasions.filter(() => Math.random() < 0.2)
                    : possibleInvasions;

                if (annualInvasions.length > 0) {
                    setNpcWarQueue(previous => [
                        ...previous,
                        ...annualInvasions.map(invasion => ({
                            attacker: invasion.attackerCountry,
                            target: invasion.targetCountry,
                            resolutionViolationAuthorized: !hasActiveApprovedInvasionResolution(
                                invasion.attackerCountry,
                                invasion.targetCountry
                            ),
                        })),
                    ]);
                }

                const cancelledUnauthorizedCount = proposedInvasions.length -
                    authorizedInvasions.length -
                    violationInvasions.length;
                if (cancelledUnauthorizedCount > 0) {
                    newNotifsToAdd.push({
                        id: `notif-npc-war-no-mandate-${currentDateStr}`,
                        title: '🕊️ SERANGAN TANPA MANDAT DIBATALKAN',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                        message: `${cancelledUnauthorizedCount} rencana konflik AI tanpa mandat dibatalkan. Peluang serangan tanpa resolusi adalah 25%; pelanggaran yang lolos akan diajukan untuk sanksi dan embargo.`,
                        timestamp: currentDateStr,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    });
                }

                if (warBanActive && annualInvasions.length < possibleInvasions.length) {
                    newNotifsToAdd.push({
                        id: `notif-war-ban-ai-block-${currentDateStr}`,
                        title: '🕊️ LARANGAN PERANG PBB MENGHENTIKAN SERANGAN',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                        message: `${possibleInvasions.length - annualInvasions.length} rencana serangan negara AI dibatalkan. Larangan perang aktif; hanya 20% dari rencana yang lolos pemeriksaan mandat/peluang pelanggaran dapat berjalan.`,
                        timestamp: currentDateStr,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    });
                }

                if (annualInvasions.length > 0) {
                    const generatedNewsItems: NewsItemData[] = [];
                    annualInvasions.forEach(inv => {
                        newNotifsToAdd.push({
                            id: `notif-npc-war-${currentDateStr}-${inv.attackerIso}-${inv.targetIso}`,
                            title: '⚔️ PERANG ANTARNEGARA',
                            sender: `Kementerian Luar Negeri — ${inv.attackerCountry}`,
                            message: `${inv.attackerCountry} melancarkan serangan terhadap ${inv.targetCountry}. Pergerakan pasukan terlihat pada peta dan perkembangan konflik akan diberitakan.`,
                            timestamp: currentDateStr,
                            type: 'peringkat',
                            value: 50,
                            isRead: false,
                        });

                        const hasInvasionMandate = hasActiveApprovedInvasionResolution(inv.attackerCountry, inv.targetCountry);
                        if (warBanActive || !hasInvasionMandate) {
                            const reason = warBanActive
                                ? 'war_ban'
                                : hasActiveApprovedInvasionResolutionForDifferentTarget(inv.attackerCountry, inv.targetCountry)
                                    ? 'wrong_military_target'
                                    : 'missing_military_resolution';
                            const expelledOrganizations = expelCountryFromOrganizations(inv.attackerCountry);
                            if (expelledOrganizations.length > 0) {
                                newNotifsToAdd.push({
                                    id: `notif-org-expulsion-ai-${currentDateStr}-${inv.attackerIso}`,
                                    title: '🚫 KEANGGOTAAN ORGANISASI INTERNASIONAL DICABUT',
                                    sender: 'Sekretariat Perserikatan Bangsa-Bangsa & Komunitas Global',
                                    message: `${inv.attackerCountry} dikeluarkan secara tidak hormat dari organisasi internasional (${expelledOrganizations.join(', ')}) karena menyerang ${inv.targetCountry} tanpa mandat Resolusi Invasi PBB.`,
                                    timestamp: currentDateStr,
                                    type: 'peringkat',
                                    value: 100,
                                    isRead: false
                                });
                            }
                            const revokedCouncilMember = expelCountryFromSecurityCouncil(inv.attackerCountry);
                            if (revokedCouncilMember) {
                                newNotifsToAdd.push({
                                    id: `notif-dk-expulsion-ai-${currentDateStr}-${inv.attackerIso}`,
                                    title: '🏛️ KURSI ANGGOTA TIDAK TETAP DK PBB DICABUT',
                                    sender: 'Presidensi Dewan Keamanan PBB',
                                    message: `Status ${inv.attackerCountry} sebagai Anggota Tidak Tetap Dewan Keamanan PBB resmi DICABUT seketika akibat melancarkan agresi militer terhadap ${inv.targetCountry} tanpa mandat resolusi PBB. Hak suara istimewa di DK PBB dibatalkan!`,
                                    timestamp: currentDateStr,
                                    type: 'peringkat',
                                    value: 100,
                                    isRead: false
                                });
                            }
                            const sanctionsNotifications = warBanActive
                                ? submitWarBanViolationSanctions(inv.attackerCountry, inv.targetCountry, currentDateStr)
                                : submitInvasionViolationSanctions(
                                    inv.attackerCountry,
                                    inv.targetCountry,
                                    currentDateStr,
                                    reason
                                );
                            newNotifsToAdd.push(...sanctionsNotifications);
                        }
                        generatedNewsItems.push(inv);

                        const outcomeRoll = Math.random();
                        if (outcomeRoll < 0.50) {
                            // Dapatkan warna asli negara penyerang
                            const attackerColor = getCountryColor(inv.attackerCountry);

                            const { news: annexationNews } = generateAnnexationNews(
                                inv.attackerCountry,
                                inv.attackerIso,
                                attackerColor, // Gunakan warna asli penyerang, bukan hardcoded
                                inv.targetCountry,
                                inv.targetIso,
                                currentDateStr
                            );
                            generatedNewsItems.push(annexationNews);

                            recordAnnexedTerritory(
                                inv.targetCountry,
                                inv.targetIso,
                                inv.attackerCountry,
                                inv.attackerIso,
                                attackerColor
                            );

                            console.log(`🚩 ANEKSASI: ${inv.attackerCountry} (${attackerColor}) menganeksasi ${inv.targetCountry}`);
                        } else {
                            const lootNews = generateResourceLootNews(
                                inv.attackerCountry,
                                inv.attackerIso,
                                inv.targetCountry,
                                inv.targetIso,
                                5000000,
                                { emas: 100, minyak_bumi: 250, beras: 500 },
                                currentDateStr
                            );
                            generatedNewsItems.push(lootNews);
                        }
                    });

                    setNewsList(prev => [...generatedNewsItems, ...prev]);
                }
            }

            // 6. Notifikasi Defisit Listrik Grid Nasional (Kelipatan -5%: -5, -10, -15, ...)
            const sourceKeys = [
                "pembangkit_listrik_tenaga_nuklir",
                "pembangkit_listrik_tenaga_air",
                "pembangkit_listrik_tenaga_surya",
                "pembangkit_listrik_tenaga_uap",
                "pembangkit_listrik_tenaga_gas",
                "pembangkit_listrik_tenaga_angin"
            ];
            let totalElectricityProd = 0;
            sourceKeys.forEach(k => {
                const count = Number(countryDetail?.[k]) || 0;
                const bMeta = metadata?.[k];
                const unitProd = Number(bMeta?.produksi) || 0;
                let isFuelDeficit = false;
                if (count > 0) {
                    const fuelReqs = getKelistrikanFuelRequirements(k);
                    for (const req of fuelReqs) {
                        const stock = getMaterialStock(countryDetail, req.resourceKey);
                        if (stock < req.amount * count) {
                            isFuelDeficit = true;
                            break;
                        }
                    }
                }
                if (!isFuelDeficit) {
                    totalElectricityProd += count * unitProd;
                }
            });
            const totalElectricityCons = getCountryConsumptionBreakdown(countryDetail, metadata).totalAllBreakdownConsumption;
            let currentListrikStep = countryDetail?.last_notified_listrik_step || 0;

            if (totalElectricityCons > 0 && totalElectricityProd < totalElectricityCons) {
                const deficitMW = totalElectricityCons - totalElectricityProd;
                const deficitPct = (deficitMW / totalElectricityCons) * 100;
                const deficitStep = Math.floor(deficitPct / 5) * 5;

                if (deficitStep >= 5 && deficitStep !== currentListrikStep) {
                    newNotifsToAdd.push(generateListrikDefisitNotification(
                        totalElectricityProd,
                        totalElectricityCons,
                        deficitMW,
                        deficitPct,
                        deficitStep,
                        currentDateStr
                    ));
                    currentListrikStep = deficitStep;
                }
            } else if (totalElectricityProd >= totalElectricityCons) {
                currentListrikStep = 0;
            }

            // 7. Notifikasi Defisit Hunian Permukiman (Setiap Bulan)
            const DEFAULT_HUNIAN_CAPACITIES: Record<string, number> = {
                rumah_subsidi: 5,
                apartemen: 6000,
                mansion: 10,
            };
            const findHousingMeta = (key: string) => {
                if (!metadata) return undefined;
                if (metadata[key]) return metadata[key];
                for (const k of Object.keys(metadata)) {
                    const entry = metadata[k];
                    if (!entry) continue;
                    if (entry.dataKey === key || k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
                }
                return undefined;
            };

            let totalHousingCap = 0;
            const hunianBuildingKeys = ["rumah_subsidi", "apartemen", "mansion"] as const;
            hunianBuildingKeys.forEach((key) => {
                const count = Number(countryDetail?.[key]) || 0;
                const bMeta = findHousingMeta(key);
                const baseCap = Number(bMeta?.kapasitas) || DEFAULT_HUNIAN_CAPACITIES[key] || 0;
                const effectiveCap = applyTotalHousingCapacityBonus(baseCap, countryDetail);
                totalHousingCap += count * effectiveCap;
            });

            const totalPop = Number(countryDetail?.jumlah_penduduk) || 0;
            const housingShortage = Math.max(0, totalPop - totalHousingCap);
            // Sinkronkan indeks kepuasan perumahan dengan formula resmi HunianPermukimanModal / calculateHunianScore
            const housingSatisfaction = totalPop > 0
                ? (totalHousingCap <= 0 ? 1 : Math.min(100, Math.max(1, Math.round((Math.min(totalHousingCap / totalPop, 1)) * 100))))
                : (countryDetail?.satisfaction?.housing !== undefined ? Number(countryDetail.satisfaction.housing) : 100);

            // Hanya memicu notifikasi defisit hunian jika benar-benar terjadi krisis/kekurangan nyata (defisit > 0 DAN kepuasan perumahan di bawah ambang waspada)
            if (housingShortage > 0 && housingSatisfaction < 100 && (housingSatisfaction <= 40 || housingShortage >= 1000)) {
                const percentageMet = totalPop > 0 ? Math.min(100, (totalHousingCap / totalPop) * 100) : 0;
                newNotifsToAdd.push(generateHunianDefisitNotification(
                    totalHousingCap,
                    totalPop,
                    housingShortage,
                    percentageMet,
                    housingSatisfaction,
                    currentDateStr
                ));
            }

            // 8. Notifikasi defisit kategori pangan inti (diperiksa setiap bulan)
            const foodCoverageGroups = calculateFoodCoverageByGroup(countryDetail, metadata);
            const deficitFoodCategories = foodCoverageGroups
                .filter(group => group.coverage < 0.95)
                .map(group => group.label);
            const weightedFoodCoverage = foodCoverageGroups.reduce(
                (sum, group) => sum + group.coverage * group.weight,
                0
            );

            if (deficitFoodCategories.length >= 2 || weightedFoodCoverage < 0.85 || foodCoverageGroups.some(group => group.coverage < 0.7)) {
                newNotifsToAdd.push(generatePanganDefisitNotification(
                    deficitFoodCategories.length,
                    foodCoverageGroups.length,
                    deficitFoodCategories,
                    currentDateStr
                ));
            }

            // 9. Notifikasi Defisit Tempat Umum & Layanan Publik (Setiap bulan jika skor <= 20)
            const tempatUmumScore = calculateLayananPublikScore(countryDetail);
            if (tempatUmumScore <= 20) {
                newNotifsToAdd.push(generateTempatUmumDefisitNotification(
                    tempatUmumScore,
                    totalPop,
                    currentDateStr
                ));
            }

            // Ambil maks 2 notifikasi berbeda jenis dari generator; kuota aktual ditentukan
            // oleh gerbang pusat (0/1/2 berdasarkan undian 30/50/20%).
            const MAX_GENERATOR_CAP = 2;
            let cappedNotifs: any[];
            try {
                cappedNotifs = await selectDailyNotificationsInRust(
                    newNotifsToAdd,
                    Math.floor(Math.random() * 0x1_0000_0000),
                    MAX_GENERATOR_CAP,
                );
            } catch (error) {
                console.error('Rust inbox selection failed; using TypeScript fallback:', error);
                const shuffledNotifs = newNotifsToAdd
                    .filter(n => n && n.id)
                    .sort(() => Math.random() - 0.5);
                const usedKinds = new Set<string>();
                cappedNotifs = [];
                for (const notification of shuffledNotifs) {
                    const kind = String(notification.tradeType || notification.type || notification.title);
                    if (usedKinds.has(kind)) continue;
                    usedKinds.add(kind);
                    cappedNotifs.push(notification);
                    if (cappedNotifs.length >= MAX_GENERATOR_CAP) break;
                }
            }

            if (cappedNotifs.length > 0) {
                setNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const uniqueNew: NotificationMessage[] = [];
                    for (const notif of cappedNotifs) {
                        if (!notif || !notif.id || existingIds.has(notif.id)) continue;
                        existingIds.add(notif.id);
                        uniqueNew.push(notif);
                    }
                    return uniqueNew.length > 0 ? [...uniqueNew, ...prev] : prev;
                });
            }

            setCountryDetail((prev: any) => {
                if (!prev) return prev;
                const currentPop = Number(prev.jumlah_penduduk || 0);
                const totalCasualties = pendingDisasterCasualties + pendingOutbreakPopulationLoss;
                const nextPop = totalCasualties > 0 ? Math.max(0, currentPop - totalCasualties) : currentPop;

                const prevDisasters = Array.isArray(prev.active_disaster_effects) ? prev.active_disaster_effects : [];
                const nextDisasters = pendingDisasterEffect ? [...prevDisasters, pendingDisasterEffect] : prevDisasters;

                const prevOutbreaks = Array.isArray(prev.active_outbreaks) ? prev.active_outbreaks : [];
                const nextOutbreaks = pendingOutbreakEffect ? [...prevOutbreaks, pendingOutbreakEffect] : prevOutbreaks;

                const prevConsecutive = Number(prev.consecutive_outbreak_count || 0);
                const nextConsecutive = prevConsecutive + pendingConsecutiveOutbreakBoost;

                return {
                    ...prev,
                    jumlah_penduduk: nextPop,
                    active_disaster_effects: nextDisasters,
                    active_outbreaks: nextOutbreaks,
                    consecutive_outbreak_count: nextConsecutive,
                    last_checked_notification_date: currentDateStr,
                    ...(nextPandemicSchedule ? { pandemic_schedule: nextPandemicSchedule } : {}),
                    ...((countryDetail as any).__invasionSchedulePending
                        ? { invasion_schedule: (countryDetail as any).__invasionSchedulePending }
                        : {}),
                    world_news_country_cursor: worldNewsResult.nextCursor,
                    last_notified_listrik_step: currentListrikStep
                };
            });
        };

        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
            cancelIdleCallback?: (id: number) => void;
        };
        const interactionActive = () =>
            Boolean((window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active) ||
            isTimeControllerHoveredRef.current;
        const cancelNotificationGenerator = () => {
            if (idleCallbackId !== null) {
                idleWindow.cancelIdleCallback?.(idleCallbackId);
                idleCallbackId = null;
            }
            if (fallbackTimerId !== null) {
                window.clearTimeout(fallbackTimerId);
                fallbackTimerId = null;
            }
        };
        const scheduleNotificationGenerator = () => {
            cancelNotificationGenerator();
            if (interactionActive()) return;
            if (idleWindow.requestIdleCallback) {
                idleCallbackId = idleWindow.requestIdleCallback(() => {
                    idleCallbackId = null;
                    if (!interactionActive()) void runNotificationGenerator().catch(error => {
                        console.error('Daily inbox/news generator failed:', error);
                    });
                }, { timeout: 1000 });
            } else {
                fallbackTimerId = window.setTimeout(() => {
                    fallbackTimerId = null;
                    if (!interactionActive()) void runNotificationGenerator().catch(error => {
                        console.error('Daily inbox/news generator failed:', error);
                    });
                }, 250);
            }
        };
        const pauseNotificationGenerator = () => cancelNotificationGenerator();
        window.addEventListener('neosantara:map-pan-started', pauseNotificationGenerator);
        window.addEventListener('neosantara:time-controller-hovered', pauseNotificationGenerator);
        window.addEventListener('neosantara:map-pan-ended', scheduleNotificationGenerator);
        window.addEventListener('neosantara:time-controller-idle', scheduleNotificationGenerator);
        scheduleNotificationGenerator();
        return () => {
            cancelNotificationGenerator();
            window.removeEventListener('neosantara:map-pan-started', pauseNotificationGenerator);
            window.removeEventListener('neosantara:time-controller-hovered', pauseNotificationGenerator);
            window.removeEventListener('neosantara:map-pan-ended', scheduleNotificationGenerator);
            window.removeEventListener('neosantara:time-controller-idle', scheduleNotificationGenerator);
        };
    }, [currentDate, countryDetail, notifications, metadata, setCountryDetail]);

    const nonModalMenus = [
        "",
        "Peta Taktis",
        "Kepuasan",
        "Populasi",
        "ProduksiKonsumsi",
        "Ekonomi",
        "Pembangunan",
        "Pertahanan",
        "Geopolitik",
        "Sosial & Budaya",
        "Kementerian"
    ];
    const isMapInteractionDisabled =
        !isSelectingIcbmTarget && (
            isSaveModalOpen ||
            isPresidentMenuOpen ||
            isRestartConfirmOpen ||
            countryDetailModalOpen ||
            playerDetailModalOpen ||
            inboxModalOpen ||
            giftModalOpen ||
            newsModalOpen ||
            !nonModalMenus.includes(activeMenu)
        );

    const dateTextRef = useRef<HTMLSpanElement | null>(null);
    const progressBarRef = useRef<HTMLDivElement | null>(null);
    const timeManagerRef = useRef<SimulationTimeManager | null>(null);
    const calendarRef = useRef<any>(null);
    const resumeGameTimeAfterWar = () => {
        const pauseState = warPauseStateRef.current;
        warPauseStateRef.current = null;
        if (!pauseState || pauseState.wasPaused) return;

        isPausedRef.current = false;
        setIsPaused(false);
        timeManagerRef.current?.setPaused(false);
    };
    const wasmModuleRef = useRef<any>(null);
    const mapFeatureColorSyncRef = useRef<() => void>(() => {});
    const hasInitRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const isMapPointerDownRef = useRef(false);
    const isTimeControllerHoveredRef = useRef(false);
    const playerDailyTickInFlightRef = useRef(false);
    const playerDailyTickRerunRef = useRef(false);
    const playerDailyTickRunnerRef = useRef<() => void>(() => {});
    const lastMapInteractionAtRef = useRef(0);
    const pendingDateRef = useRef<Date | null>(null);
    const pendingDateTimingRef = useRef<{
        dateKey: string;
        tickAt: number;
        commitStartedAt: number | null;
        source: 'clock' | 'date-commit';
        rustDateMs: number;
    } | null>(null);
    const longTaskEntriesRef = useRef<PerformanceEntry[]>([]);
    const dateCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (typeof PerformanceObserver === 'undefined' ||
            !PerformanceObserver.supportedEntryTypes?.includes('longtask')) return;

        const observer = new PerformanceObserver(list => {
            const now = performance.now();
            longTaskEntriesRef.current = [
                ...longTaskEntriesRef.current,
                ...list.getEntries(),
            ].filter(entry => entry.startTime + entry.duration > now - 30_000);
        });
        observer.observe({ entryTypes: ['longtask'] });

        return () => observer.disconnect();
    }, []);

    const schedulePendingDateCommit = useCallback((force = false) => {
        if (!pendingDateRef.current) return;
        if (dateCommitTimerRef.current !== null) {
            clearTimeout(dateCommitTimerRef.current);
            dateCommitTimerRef.current = null;
        }

        const commit = () => {
            dateCommitTimerRef.current = null;
            if (!pendingDateRef.current) return;
            const pendingDate = pendingDateRef.current;
            pendingDateRef.current = null;
            const dateKey = `${pendingDate.getFullYear()}-${pendingDate.getMonth()}-${pendingDate.getDate()}`;
            const pendingTiming = pendingDateTimingRef.current;
            if (pendingTiming?.dateKey === dateKey) {
                pendingTiming.commitStartedAt = performance.now();
            }
            startTransition(() => setCurrentDate(pendingDate));
        };

        commit();
    }, []);

    useEffect(() => {
        const timing = pendingDateTimingRef.current;
        if (!timing || timing.commitStartedAt === null) return;

        const dateKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}-${currentDate.getDate()}`;
        if (timing.dateKey !== dateKey) return;

        let secondFrame = 0;
        const firstFrame = requestAnimationFrame(() => {
            secondFrame = requestAnimationFrame((paintedAt) => {
                if (pendingDateTimingRef.current !== timing) return;
                pendingDateTimingRef.current = null;

                const timingData = {
                    date: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`,
                    tickToPaintMs: paintedAt - timing.tickAt,
                    commitMs: paintedAt - timing.commitStartedAt!,
                    queuedMs: timing.commitStartedAt! - timing.tickAt,
                    speed: timeManagerRef.current?.getSpeed() ?? 1,
                    source: timing.source,
                    rustDateMs: timing.rustDateMs,
                    longTaskMs: longTaskEntriesRef.current.reduce((total, entry) => {
                        const overlap = Math.max(
                            0,
                            Math.min(paintedAt, entry.startTime + entry.duration) -
                                Math.max(timing.tickAt, entry.startTime),
                        );
                        return total + overlap;
                    }, 0),
                    playerPresent: Boolean(countryDetail?.country_slug),
                };
                longTaskEntriesRef.current = longTaskEntriesRef.current.filter(
                    entry => entry.startTime + entry.duration > timing.tickAt,
                );
                void fetch('/api/simulation-date-timing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(timingData),
                    keepalive: true,
                }).then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                }).catch(error => {
                    console.error('Gagal mengirim log timing pergantian tanggal ke terminal server:', error);
                });
            });
        });

        return () => {
            cancelAnimationFrame(firstFrame);
            if (secondFrame !== 0) cancelAnimationFrame(secondFrame);
        };
    }, [currentDate, countryDetail?.country_slug]);

    const markMapInteraction = useCallback(() => {
        lastMapInteractionAtRef.current = Date.now();
        if (dateCommitTimerRef.current !== null) {
            clearTimeout(dateCommitTimerRef.current);
            dateCommitTimerRef.current = null;
        }
    }, []);

    useEffect(() => {
        const handleGlobalMouseUp = (e: MouseEvent) => {
            // Hindari memproses event hasil dispatch kita sendiri untuk mencegah loop tak terbatas
            if (e.target && (e.target as HTMLElement).id === 'map-canvas') return;

            const canvas = document.getElementById('map-canvas');
            if (canvas) {
                const event = new MouseEvent('mouseup', {
                    bubbles: false, // Set false agar tidak memicu bubble up ke window lagi
                    cancelable: true,
                    view: window,
                });
                canvas.dispatchEvent(event);
            }
        };

        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    // Hide BottomNav when inbox, gift, or news modal is opened — and show it again when they all close
    const notifModalMountedRef = React.useRef(false);
    useEffect(() => {
        if (!notifModalMountedRef.current) {
            notifModalMountedRef.current = true;
            return; // skip initial mount
        }
        if (inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen || missionModalOpen) {
            window.dispatchEvent(new Event('hide_strategy_modal'));
        } else {
            window.dispatchEvent(new Event('show_strategy_modal'));
        }
    }, [inboxModalOpen, giftModalOpen, newsModalOpen, penelitianModalOpen, missionModalOpen]);

    // Close inbox, gift, news, and penelitian modals if a navigation menu modal is opened
    useEffect(() => {
        if (!nonModalMenus.includes(activeMenu)) {
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setPenelitianModalOpen(false);
            setMissionModalOpen(false);
        }
    }, [activeMenu]);

    // Deteksi aksi user / perubahan pembangunan / kebijakan / anggaran negara saat misi sedang aktif
    const lastCountryDetailStateRef = React.useRef<string>('');
    useEffect(() => {
        if (!countryDetail) return;
        const serialized = JSON.stringify({
            anggaran: countryDetail.anggaran,
            ongoingConstructions: countryDetail.ongoingConstructions?.length || 0,
            populasi: countryDetail.populasi,
            produksi: countryDetail.produksi,
            kebijakan: countryDetail.kebijakan,
            armada: countryDetail.armada,
            fasilitas: countryDetail.fasilitas,
        });

        if (lastCountryDetailStateRef.current && lastCountryDetailStateRef.current !== serialized) {
            // Ada tindakan pembangunan, pelaksanaan event, alokasi anggaran, atau perubahan negara
            const activeMission = typeof window !== 'undefined' ? localStorage.getItem('presiden_simulator_active_mission') : null;
            if (activeMission) {
                try {
                    // Cek apakah misi aktif merupakan salah satu misi produksi dengan kuantitas khusus (0/5, dst.)
                    // Jika iya, biarkan recordBuildingProgress yang memvalidasi target terpenuhi
                    const rawProgressMap = localStorage.getItem('presiden_simulator_mission_building_progress');
                    const bMap = rawProgressMap ? JSON.parse(rawProgressMap) : {};
                    const curProgress = Number(bMap[activeMission]) || 0;

                    const rawCompletions = localStorage.getItem('presiden_simulator_mission_completions');
                    const compMap = rawCompletions ? JSON.parse(rawCompletions) : {};
                    const completionCount = Number(compMap[activeMission]) || 0;
                    const requiredTarget = 5 * (completionCount + 1);

                    const productionMissionIds = [
                        'tambang_emas', 'tambang_uranium', 'tambang_batu_bara', 'kilang_minyak_bumi',
                        'kilang_gas_alam', 'tambang_garam', 'tambang_litium', 'tambang_ltj', 'tambang_bijih_besi',
                        'pabrik_semikonduktor', 'pabrik_mesin', 'pabrik_besi', 'pabrik_semen_beton', 'pabrik_kayu',
                        'peternakan_ayam', 'peternakan_sapi_perah', 'peternakan_sapi_potong', 'peternakan_domba',
                        'sawah_padi', 'ladang_gandum', 'ladang_jagung', 'kebun_sayur', 'ladang_umbi',
                        'ladang_kedelai', 'kebun_sawit', 'kebun_kopi', 'kebun_teh', 'kebun_kakao', 'kebun_tebu', 'kebun_karet',
                        'tambak_udang', 'budidaya_mutiara', 'perikanan_ikan',
                        'pabrik_air_mineral', 'pabrik_gula', 'pabrik_roti', 'pabrik_daging', 'pabrik_mie_instan',
                        'pabrik_minyak_goreng', 'pabrik_susu', 'pabrik_beras'
                    ];

                    const isProductionBuildingMission = productionMissionIds.includes(activeMission);

                    // Jika ini misi pembangunan produksi dan target belum tercapai (misal belum mencapai 5), jangan tandai claimable
                    if (!isProductionBuildingMission || curProgress >= requiredTarget) {
                        const rawList = localStorage.getItem('presiden_simulator_claimable_missions');
                        const list: string[] = rawList ? JSON.parse(rawList) : [];
                        if (!list.includes(activeMission)) {
                            list.push(activeMission);
                            localStorage.setItem('presiden_simulator_claimable_missions', JSON.stringify(list));
                            window.dispatchEvent(new CustomEvent('mission_claimable_updated', { detail: { cardId: activeMission, claimableList: list } }));
                        }
                    }
                } catch { }
            }
        }
        lastCountryDetailStateRef.current = serialized;
    }, [countryDetail]);

    // Initialize high-performance simulation clock on mount
    useEffect(() => {
        let disposed = false;
        let manager: SimulationTimeManager | null = null;

        const initializeClock = async () => {
            await initializeSimulationClock();
            if (disposed) return;

            let lastDateKey = '';
            const timeManager = new SimulationTimeManager(
                (formattedDate) => {
                    if (dateTextRef.current) {
                        dateTextRef.current.textContent = formattedDate;
                    }
                    // Update React state HANYA saat tanggal (hari) benar-benar berganti
                    // untuk mencegah re-render React berlebihan & frame drop pada canvas map
                    const activeManager = timeManagerRef.current;
                    if (activeManager) {
                        const newDate = activeManager.getCurrentDate();
                        const dateKey = `${newDate.getFullYear()}-${newDate.getMonth()}-${newDate.getDate()}`;
                        if (dateKey !== lastDateKey) {
                            // Update lastDateKey SETELAH menyimpan pending date agar tidak terlewat
                            // jika schedulePendingDateCommit ditunda karena interaksi peta
                            pendingDateRef.current = newDate;
                            pendingDateTimingRef.current = !activeManager.getIsPaused()
                                ? {
                                    dateKey,
                                    tickAt: performance.now(),
                                    commitStartedAt: null,
                                    source: 'clock',
                                    rustDateMs: activeManager.getLastRustDateCalculationMs(),
                                }
                                : null;
                            lastDateKey = dateKey;
                            schedulePendingDateCommit();
                        }
                    }
                },
                (progress) => {
                    if (progressBarRef.current) {
                        progressBarRef.current.style.transform = `scaleX(${progress / 100})`;
                    }
                }
            );
            manager = timeManager;

            // Assign manager to ref immediately after construction
            timeManagerRef.current = timeManager;
            if (typeof window !== 'undefined') {
                (window as Window & { neosantara_time_controller?: SimulationTimeManager }).neosantara_time_controller = timeManager;
            }

            // Create calendar system with factory
            const calendarSystem = createSimulationCalendar(timeManager);
            calendarRef.current = calendarSystem;

            // Check if there is a save to load to restore the date
            if (typeof window !== 'undefined') {
                const loadSaveStr = sessionStorage.getItem('presiden_simulator_load_save');
                const newGameMarker = localStorage.getItem('presiden_simulator_new_game');
                // Reset hanya saat pemain benar-benar memulai game baru. Navigasi ke dialog lalu kembali
                // tidak boleh menghapus progress sesi yang masih berjalan.
                if (newGameMarker === '1') {
                    clearMissionProgressData();
                    localStorage.setItem('player_diamonds', '150');
                    setPlayerDiamonds(150);
                    window.dispatchEvent(new CustomEvent('player_diamonds_updated', { detail: { diamonds: 150 } }));
                }

                if (newGameMarker === '1') {
                    clearExpelledOrganizationCountries();
                    clearAllOrganizationMembershipData();
                    clearActiveResolutionsForSession();
                    clearActiveSecurityCouncilItems();
                    clearReportedInvasionViolations();
                    localStorage.removeItem('hutangModalLoanSources');
                    localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
                    localStorage.removeItem('pbb_active_resolutions_v4');
                    localStorage.removeItem('pbb_active_keamanan_v4');
                    localStorage.removeItem('pbb_reported_war_ban_violations_v1');
                    localStorage.removeItem('programNuklirActive');
                    localStorage.removeItem('icbmBuildTask');
                    try {
                        sessionStorage.removeItem('programNuklirActive');
                        sessionStorage.removeItem('program_nuklir_modal_open');
                        sessionStorage.removeItem('icbm_detail_open');
                        sessionStorage.removeItem('perang_nuklir_detail_open');
                        sessionStorage.removeItem('presiden_simulator_load_save');
                    } catch (e) { }
                    clearActiveNpcCountrySimulationState();
                    (window as any).neosantara_annexed_countries = {};
                    (window as any).neosantara_country_color_overrides = {};
                    localStorage.removeItem('presiden_simulator_new_game');
                }
                if (loadSaveStr) {
                    try {
                        const savedState = JSON.parse(loadSaveStr);
                        if (savedState.game_date) {
                            timeManager.setCurrentDate(new Date(savedState.game_date));
                        }
                    } catch (err) {
                        console.error("Failed to restore date from save:", err);
                    }
                }
            }

            setCurrentDate(timeManager.getCurrentDate());
        };

        void initializeClock().catch((error: unknown) => {
            console.error('Failed to initialize Rust simulation clock:', error);
        });

        return () => {
            disposed = true;
            if (!manager) {
                if (dateCommitTimerRef.current !== null) {
                    clearTimeout(dateCommitTimerRef.current);
                    dateCommitTimerRef.current = null;
                }
                return;
            }

            if (typeof window !== 'undefined') {
                const runtimeWindow = window as Window & { neosantara_time_controller?: SimulationTimeManager };
                if (runtimeWindow.neosantara_time_controller === manager) {
                    delete runtimeWindow.neosantara_time_controller;
                }
            }
            manager.destroy();
            if (dateCommitTimerRef.current !== null) {
                clearTimeout(dateCommitTimerRef.current);
                dateCommitTimerRef.current = null;
            }
        };
    }, [markMapInteraction]);

    // Get Flag emoji helper
    const getFlagEmoji = (iso: string) => {
        if (!iso || iso.length !== 2) return null;
        const codePoints = iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    const loadDefaultPrices = async (countryName: string) => {
        try {
            const res = await fetch(`/api/price-data?country=${encodeURIComponent(countryName)}`);
            const data = await res.json();
            return data?.prices || null;
        } catch (e) {
            console.warn(`Failed to load default prices for ${countryName}:`, e);
            return null;
        }
    };

    const religionCacheKey = (countrySlug: string) =>
        `neosantara_country_religion_${countrySlug.trim().toLowerCase()}`;

    const cacheDatabaseReligion = (countrySlug: string, religion: string) => {
        if (typeof window === 'undefined' || !countrySlug || !religion) return;
        try {
            localStorage.setItem(religionCacheKey(countrySlug), religion);
        } catch (error) {
            console.error('Gagal menyimpan cache agama negara:', error);
        }
    };

    // Reusable function to load stats for a country
    const loadCountryStats = async (countryName: string, capitalName: string) => {
        const relPath = Object.entries(countryPaths).find(
            ([name]) => name.toLowerCase() === countryName.toLowerCase()
        )?.[1];

        if (!relPath) return;

        try {
            const res = await fetch(`/api/country-data?path=${relPath}`);
            const mergedData = applyNpcCountrySimulationState(await res.json());
            const {
                pabrik_mesin_mobil: legacyCarMachineCount,
                pabrik_mesin_motor: legacyMotorMachineCount,
                mobil: legacyCarFactoryCount,
                sepeda_motor: legacyMotorFactoryCount,
                ...countryData
            } = mergedData;

            if (mergedData?.error) {
                console.warn(`Country data load error for ${countryName}:`, mergedData.error);
                return;
            }

            if (mergedData.country_slug && mergedData.religion) {
                cacheDatabaseReligion(mergedData.country_slug, mergedData.religion);
            }

            const defaultPrices = await loadDefaultPrices(countryName);

            setCountryDetail({
                ...countryData,
                country: countryName,
                capital: mergedData.capital || capitalName,
                jumlah_penduduk: mergedData.jumlah_penduduk || 0,
                anggaran: mergedData.anggaran || 0,
                religion: mergedData.religion || '-',
                ideology: mergedData.ideology || '-',
                un_vote: mergedData.un_vote || 0,
                kepuasan: mergedData.kepuasan ?? 50,
                harga: defaultPrices || mergedData?.harga || {},
                price_rice: defaultPrices?.harga_beras ?? mergedData?.harga?.harga_beras,
                price_fuel: defaultPrices?.harga_minyak_goreng ?? mergedData?.harga?.harga_bbm,
                // Preserve satisfaction field if it exists
                satisfaction: mergedData.satisfaction || {},
                // Tax fields
                income_tax: mergedData.pajak?.penghasilan?.tarif ?? mergedData.income_tax,
                corporate: mergedData.pajak?.korporasi?.tarif ?? mergedData.corporate,
                ppn: mergedData.pajak?.ppn?.tarif ?? mergedData.ppn,
                cigarette_tax: mergedData.pajak?.bea_cukai?.tarif ?? mergedData.cigarette_tax,
                environment_tax: mergedData.pajak?.lingkungan?.tarif ?? mergedData.environment_tax,
                // Production/Extraction fields (ensure they're set from data files)
                emas: mergedData.emas ?? 0,
                uranium: mergedData.uranium ?? 0,
                batu_bara: mergedData.batu_bara ?? 0,
                minyak_bumi: mergedData.minyak_bumi ?? 0,
                gas_alam: mergedData.gas_alam ?? 0,
                garam: mergedData.garam ?? 0,
                litium: mergedData.litium ?? 0,
                logam_tanah_jarang: mergedData.logam_tanah_jarang ?? 0,
                bijih_besi: mergedData.bijih_besi ?? 0,
                // Building fields - Kelistrikan
                pembangkit_listrik_tenaga_nuklir: mergedData.pembangkit_listrik_tenaga_nuklir ?? 0,
                pembangkit_listrik_tenaga_air: mergedData.pembangkit_listrik_tenaga_air ?? 0,
                pembangkit_listrik_tenaga_surya: mergedData.pembangkit_listrik_tenaga_surya ?? 0,
                pembangkit_listrik_tenaga_uap: mergedData.pembangkit_listrik_tenaga_uap ?? 0,
                pembangkit_listrik_tenaga_gas: mergedData.pembangkit_listrik_tenaga_gas ?? 0,
                pembangkit_listrik_tenaga_angin: mergedData.pembangkit_listrik_tenaga_angin ?? 0,
                // Building fields - Manufaktur
                pabrik_semikonduktor: countryData.pabrik_semikonduktor ?? countryData.semikonduktor ?? 0,
                pabrik_besi: countryData.pabrik_besi ?? 0,
                pabrik_mesin: Number(countryData.pabrik_mesin
                    ?? (Number(legacyCarMachineCount ?? legacyCarFactoryCount ?? 0)
                        + Number(legacyMotorMachineCount ?? legacyMotorFactoryCount ?? 0))),
                semen_beton: countryData.semen_beton ?? 0,
                kayu: countryData.kayu ?? 0,
                // Building fields - Peternakan
                ayam_unggas: mergedData.ayam_unggas ?? 0,
                sapi_perah: mergedData.sapi_perah ?? 0,
                sapi_potong: mergedData.sapi_potong ?? 0,
                domba_kambing: mergedData.domba_kambing ?? 0,
                // Building fields - Agrikultur
                padi: mergedData.padi ?? 0,
                jagung: mergedData.jagung ?? 0,
                kedelai: mergedData.kedelai ?? 0,
                tebu: mergedData.tebu ?? 0,
                kelapa_sawit: mergedData.kelapa_sawit ?? 0,
                cokelat: mergedData.cokelat ?? 0,
                kopi: mergedData.kopi ?? 0,
                // Building fields - Perikanan
                udang: mergedData.udang ?? 0,
                mutiara: mergedData.mutiara ?? 0,
                ikan: mergedData.ikan ?? 0,
                // Building fields - Olahan Pangan
                air_mineral: mergedData.air_mineral ?? 0,
                gula: mergedData.gula ?? 0,
                roti: mergedData.roti ?? 0,
                pengolahan_daging: mergedData.pengolahan_daging ?? 0,
                mie_instan: mergedData.mie_instan ?? 0,
                minyak_goreng: mergedData.minyak_goreng ?? 0,
                susu: mergedData.susu ?? 0,
                // Ongoing constructions array
                ongoingConstructions: mergedData.ongoingConstructions || [],
                kesejahteraan_bonus: mergedData.kesejahteraan_bonus ?? 0,
                kesejahteraan_decay: mergedData.kesejahteraan_decay ?? 0,
            });
        } catch (e) {
            console.error("Failed to load country data:", e);
        }
    };

    // Client-side query param extraction & profile fetching
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loadSaveStr = sessionStorage.getItem('presiden_simulator_load_save');
            const isNewGame = localStorage.getItem('presiden_simulator_new_game') === '1';
            const returningFromDialog = sessionStorage.getItem('presiden_simulator_returning_from_dialog') === '1';
            sessionStorage.removeItem('presiden_simulator_returning_from_dialog');
            if (loadSaveStr) {
                void (async () => {
                    try {
                        const savedState = JSON.parse(loadSaveStr);
                        const savedCountryName = String(savedState.country_name || '');
                        const chosen = COUNTRIES_DATA.find(
                            c => c.country.toLowerCase() === savedCountryName.toLowerCase()
                        );
                        if (!chosen) return;

                        setSelectedCountry(chosen);
                        const savedDetail = savedState.countryDetail && typeof savedState.countryDetail === 'object'
                            ? savedState.countryDetail
                            : {};
                        const {
                            __neosantara_game_session: savedSessionState,
                            pabrik_mesin_mobil: legacyCarMachineCount,
                            pabrik_mesin_motor: legacyMotorMachineCount,
                            mobil: legacyCarFactoryCount,
                            sepeda_motor: legacyMotorFactoryCount,
                            inventory_pabrik_mesin_mobil: legacyCarMachineInventory,
                            inventory_pabrik_mesin_motor: legacyMotorMachineInventory,
                            ...savedCountryDetail
                        } = savedDetail;
                        const sessionState = savedSessionState && typeof savedSessionState === 'object'
                            ? savedSessionState
                            : {};
                        restoreNpcCountrySimulationState(sessionState.npcSimulation ?? null);
                        const restoredOverrides = sessionState.countryColorOverrides
                            || savedState.countryColorOverrides
                            || {};
                        const restoredAnnexed = sessionState.annexedCountries || {};
                        const restoredCityOwners = sessionState.cityOwner || {};
                        setCountryColorOverrides(restoredOverrides);
                        (window as any).neosantara_country_color_overrides = restoredOverrides;
                        (window as any).neosantara_annexed_countries = restoredAnnexed;
                        (window as any).neosantara_city_owner = restoredCityOwners;
                        window.dispatchEvent(new CustomEvent('map_territory_color_updated'));
                        let databaseReligion = '';
                        let databaseSlug = '';
                        let databaseSectorNationalization: Record<string, unknown> = {};
                        const relPath = Object.entries(countryPaths as Record<string, string>).find(
                            ([name]) => name.toLowerCase() === chosen.country.toLowerCase()
                        )?.[1];

                        if (!relPath) {
                            console.error(`Jalur profil ${chosen.country} tidak ditemukan; agama dari database tidak dapat dimuat.`);
                        } else {
                            try {
                                const response = await fetch(`/api/country-data?path=${encodeURIComponent(relPath)}`);
                                if (!response.ok) {
                                    throw new Error(`HTTP ${response.status}`);
                                }
                                const profile = await response.json();
                                if (profile?.error) throw new Error(profile.error);
                                databaseReligion = typeof profile?.religion === 'string' ? profile.religion : '';
                                databaseSlug = typeof profile?.country_slug === 'string' ? profile.country_slug : '';
                                if (
                                    profile?.sector_nationalization &&
                                    typeof profile.sector_nationalization === 'object' &&
                                    !Array.isArray(profile.sector_nationalization)
                                ) {
                                    databaseSectorNationalization = profile.sector_nationalization;
                                }
                                if (databaseSlug && databaseReligion) {
                                    cacheDatabaseReligion(databaseSlug, databaseReligion);
                                }
                            } catch (error) {
                                console.error(`Gagal memuat agama ${chosen.country} dari database:`, error);
                            }
                        }

                        let cachedReligion = '';
                        const cacheSlug = databaseSlug || String(savedDetail.country_slug || savedCountryName);
                        try {
                            cachedReligion = localStorage.getItem(religionCacheKey(cacheSlug)) || '';
                        } catch (error) {
                            console.error('Gagal membaca cache agama negara:', error);
                        }

                        const restoredDetail: any = {
                            capital: savedState.capital || chosen.capital,
                            jumlah_penduduk: Number(savedState.jumlah_penduduk),
                            anggaran: Number(savedState.anggaran),
                            ideology: savedState.ideology || '-',
                            un_vote: Number(savedState.un_vote),
                            kepuasan: Number(savedState.kepuasan) || 50,
                            ...savedCountryDetail,
                            pabrik_mesin: Number(savedCountryDetail.pabrik_mesin
                                ?? (Number(legacyCarMachineCount ?? legacyCarFactoryCount ?? 0)
                                    + Number(legacyMotorMachineCount ?? legacyMotorFactoryCount ?? 0))),
                            inventory_pabrik_mesin: Number(savedCountryDetail.inventory_pabrik_mesin ?? 0)
                                + Number(legacyCarMachineInventory ?? 0)
                                + Number(legacyMotorMachineInventory ?? 0),
                            ...(databaseSlug ? { country_slug: databaseSlug } : {}),
                            sector_nationalization: {
                                ...databaseSectorNationalization,
                                ...(savedCountryDetail.sector_nationalization &&
                                    typeof savedCountryDetail.sector_nationalization === 'object' &&
                                    !Array.isArray(savedCountryDetail.sector_nationalization)
                                    ? savedCountryDetail.sector_nationalization
                                    : {}),
                            },
                            religion: databaseReligion || cachedReligion || savedDetail.religion || savedState.religion || '-',
                        };

                        await syncNationalizationDiplomacyRelations(
                            String(restoredDetail.country || restoredDetail.nama_negara || savedCountryName),
                            restoredDetail.sector_nationalization,
                            restoredDetail.nationalization_diplomacy_month_counter
                        );
                        setCountryDetail(restoredDetail);
                        if (restoredDetail.presidentRating !== undefined) {
                            setPresidentRating(Number(restoredDetail.presidentRating));
                        }
                        if (restoredDetail.kesejahteraan !== undefined) {
                            setKesejahteraan(Number(restoredDetail.kesejahteraan));
                        }
                        if (Array.isArray(restoredDetail.notifications)) {
                            setNotifications(restoredDetail.notifications);
                        }

                        if (restoredDetail.playerDiamonds !== undefined) {
                            const dia = Number(restoredDetail.playerDiamonds);
                            setPlayerDiamonds(dia);
                            localStorage.setItem('player_diamonds', dia.toString());
                        }
                        if (restoredDetail.missionCompletions !== undefined) {
                            if (restoredDetail.missionCompletions) {
                                localStorage.setItem('presiden_simulator_mission_completions', restoredDetail.missionCompletions);
                            } else {
                                localStorage.removeItem('presiden_simulator_mission_completions');
                            }
                            window.dispatchEvent(new CustomEvent('mission_completions_updated'));
                        }
                        if (restoredDetail.activeMissionId !== undefined) {
                            if (restoredDetail.activeMissionId) {
                                localStorage.setItem('presiden_simulator_active_mission', restoredDetail.activeMissionId);
                            } else {
                                localStorage.removeItem('presiden_simulator_active_mission');
                            }
                            window.dispatchEvent(new CustomEvent('mission_active_updated', { detail: { cardId: restoredDetail.activeMissionId } }));
                        }
                        if (restoredDetail.claimableMissions !== undefined) {
                            if (restoredDetail.claimableMissions) {
                                localStorage.setItem('presiden_simulator_claimable_missions', restoredDetail.claimableMissions);
                            } else {
                                localStorage.removeItem('presiden_simulator_claimable_missions');
                            }
                            window.dispatchEvent(new CustomEvent('mission_claimable_updated', { detail: { claimableList: restoredDetail.claimableMissions ? JSON.parse(restoredDetail.claimableMissions) : [] } }));
                        }

                        sessionStorage.removeItem('presiden_simulator_load_save');
                    } catch (error) {
                        console.error('Gagal memulihkan data save:', error);
                    }
                })();
                return;
            }

            const params = new URLSearchParams(window.location.search);
            const countryParam = params.get('country');

            if (countryParam) {
                const chosen = COUNTRIES_DATA.find(
                    c => c.country.toLowerCase() === countryParam.toLowerCase()
                );

                if (chosen) {
                    setSelectedCountry(chosen);
                    loadCountryStats(chosen.country, chosen.capital);
                    if (isNewGame || (!loadSaveStr && !returningFromDialog)) {
                        expelCountryFromOrganizations(chosen.country);
                        clearMissionProgressData();
                        clearActiveNpcCountrySimulationState();
                        localStorage.removeItem('programNuklirActive');
                        localStorage.removeItem('icbmBuildTask');
                        try {
                            sessionStorage.removeItem('programNuklirActive');
                            sessionStorage.removeItem('program_nuklir_modal_open');
                            sessionStorage.removeItem('icbm_detail_open');
                            sessionStorage.removeItem('perang_nuklir_detail_open');
                        } catch (e) { }
                        localStorage.setItem('player_diamonds', '150');
                        setPlayerDiamonds(150);
                        window.dispatchEvent(new CustomEvent('player_diamonds_updated', { detail: { diamonds: 150 } }));
                    }
                }
            }
        }
    }, []);

    // Update accumulated production every time date changes
    useEffect(() => {
        if (!currentDate) return;

        // Format date inline (can't import formatDate here due to path issues)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;
        if (typeof window !== 'undefined') {
            setCurrentGameDateString(currentDateStr);
            const userCountryName = String(countryDetail?.country || countryDetail?.nama || '');
            if (userCountryName) {
                checkAndProcessOrgApplications(userCountryName, currentDateStr);
            }
        }

        const isGamePaused = isPausedRef.current || (typeof window !== 'undefined' && (window as any).neosantara_is_paused);
        if (isGamePaused) return;

        if (countryDetail && !countryDetail.pbbSecurityCouncilElection) {
            const initialElectionState = createInitialElectionState(currentDate.getFullYear());
            try {
                localStorage.setItem(
                    "neosantara_pbb_security_council_election",
                    JSON.stringify(initialElectionState)
                );
                setCountryDetail((previous: Record<string, unknown> | null) => previous
                    ? { ...previous, pbbSecurityCouncilElection: initialElectionState }
                    : previous
                );
            } catch (storageError) {
                console.error("Gagal menginisialisasi jadwal pemilihan Dewan Keamanan:", storageError);
            }
        }

        if (
            countryDetail?.pbbSecurityCouncilElection &&
            currentDate.getMonth() === 5 &&
            currentDate.getDate() <= 30
        ) {
            const electionYear = currentDate.getFullYear();
            const electionState = normalizeElectionState(
                countryDetail.pbbSecurityCouncilElection,
                electionYear
            );
            if (electionState.year === electionYear) {
                const dueStage = currentDate.getDate() >= 30
                    ? 4
                    : currentDate.getDate() >= 25
                        ? 3
                        : currentDate.getDate() >= 15
                            ? 2
                            : 1;
                const tickKey = `${currentDateStr}-${electionState.scheduleStage}`;
                if (electionState.scheduleStage < dueStage && electionScheduleTickRef.current !== tickKey) {
                    electionScheduleTickRef.current = tickKey;
                    fetchAllCountryProfilesFromDb()
                        .then(profiles => {
                            const electionCountries = getEligibleUNMemberCountries(profiles);
                            const profiledVoters = electionCountries.filter(country => country.profile).length;
                            if (electionCountries.length !== 193 || profiledVoters !== 193) {
                                const warningId = `pbb-security-election-data-${electionYear}`;
                                console.error(
                                    `Pemilihan DK PBB ${electionYear} tidak dapat dijadwalkan: ${profiledVoters}/193 profil anggota tersedia.`
                                );
                                setNotifications(previous => previous.some(notification => notification.id === warningId)
                                    ? previous
                                    : [{
                                        id: warningId,
                                        title: "⚠️ DATA PEMILIHAN DK PBB BELUM LENGKAP",
                                        sender: "Sekretariat Majelis Umum Perserikatan Bangsa-Bangsa",
                                        message: `Agenda pemilihan tahunan memerlukan data profil untuk seluruh 193 negara anggota. Saat ini tersedia ${profiledVoters} profil yang cocok; jadwal pemungutan suara belum dapat diproses.`,
                                        timestamp: currentDateStr,
                                        type: "peringkat",
                                        value: 0,
                                        isRead: false,
                                    }, ...previous]);
                                return;
                            }

                            const result = tickSecurityCouncilElectionSchedule(
                                currentDateStr,
                                electionState,
                                profiles
                            );
                            if (!result) return;
                            if (result.error) {
                                console.error(`Agenda pemilihan DK PBB ${electionYear}: ${result.error}`);
                                const warningId = `pbb-security-election-schedule-${electionYear}-${electionState.scheduleStage + 1}`;
                                setNotifications(previous => previous.some(notification => notification.id === warningId)
                                    ? previous
                                    : [{
                                        id: warningId,
                                        title: "⚠️ AGENDA PEMILIHAN DK PBB TERTUNDA",
                                        sender: "Sekretariat Majelis Umum Perserikatan Bangsa-Bangsa",
                                        message: result.error || "Tahapan pemilihan belum dapat diproses.",
                                        timestamp: currentDateStr,
                                        type: "peringkat",
                                        value: 0,
                                        isRead: false,
                                    }, ...previous]);
                                return;
                            }

                            try {
                                localStorage.setItem(
                                    "neosantara_pbb_security_council_election",
                                    JSON.stringify(result.state)
                                );
                            } catch (storageError) {
                                console.error("Gagal menyimpan jadwal pemilihan Dewan Keamanan:", storageError);
                                return;
                            }
                            setCountryDetail((previous: Record<string, unknown> | null) => previous
                                ? { ...previous, pbbSecurityCouncilElection: result.state }
                                : previous
                            );
                            setNotifications(previous => {
                                const knownIds = new Set(previous.map(notification => notification.id));
                                const newNotifications = result.notifications.filter(notification => !knownIds.has(notification.id));
                                return [...newNotifications, ...previous];
                            });
                            window.dispatchEvent(new CustomEvent("pbb_security_council_election_updated"));
                            window.dispatchEvent(new CustomEvent("pbb_security_council_election_roster_updated"));
                        })
                        .catch(error => {
                            console.error("Gagal memproses jadwal pemilihan Dewan Keamanan PBB:", error);
                            const warningId = `pbb-security-election-load-${electionYear}`;
                            setNotifications(previous => previous.some(notification => notification.id === warningId)
                                ? previous
                                : [{
                                    id: warningId,
                                    title: "⚠️ JADWAL PEMILIHAN DK PBB GAGAL DIMUAT",
                                    sender: "Sekretariat Majelis Umum Perserikatan Bangsa-Bangsa",
                                    message: "Data negara gagal dimuat sehingga agenda pemilihan bulan Juni belum dapat diproses.",
                                    timestamp: currentDateStr,
                                    type: "peringkat",
                                    value: 0,
                                    isRead: false,
                                }, ...previous]);
                        });
                }
            }
        }

        // Tick PBB resolutions and Security Council countdown & AI 206 country voting logic
        if (typeof tickPBBResolutions === 'function') {
            const updatedResolutions = tickPBBResolutions(currentDateStr, (newNotif) => {
                setNotifications((prev: any[]) => [newNotif, ...prev]);
            }, selectedCountry?.country);
            const decidedInvasions = updatedResolutions.filter(item =>
                item.aiInvasionAttackChance !== undefined &&
                item.status !== 'voting' &&
                !item.aiInvasionDecisionProcessed
            );

            if (decidedInvasions.length > 0) {
                const decidedIds = new Set(decidedInvasions.map(item => item.id));
                saveActiveResolutions(updatedResolutions.map(item =>
                    decidedIds.has(item.id)
                        ? { ...item, aiInvasionDecisionProcessed: true }
                        : item
                ));

                decidedInvasions.forEach(item => {
                    const isApproved = item.status === 'passed';
                    const resolutionViolationAuthorized = !isApproved && Math.random() < 0.25;
                    const willInvade = (isApproved && Math.random() < 0.95) || resolutionViolationAuthorized;
                    const targetHasAnnexedTerritories = hasAnnexedTerritories(item.target.name);

                    if (willInvade) {
                        const attackNotification = generateDiserangNotification(
                            item.proposer.name,
                            currentDateStr,
                            targetHasAnnexedTerritories,
                            'invasi'
                        );
                        setNotifications(previous => [
                            attackNotification,
                            ...previous
                        ]);
                        window.dispatchEvent(new CustomEvent('start_war_animation', {
                            detail: {
                                attacker: item.proposer.name,
                                target: item.target.name,
                                targetCountryDetail: countryDetail,
                                resolutionViolationAuthorized,
                            }
                        }));
                    } else {
                        setNotifications(previous => [{
                            id: `ai-invasion-decision-${item.id}`,
                            title: isApproved
                                ? '🏛️ RESOLUSI INVASI DISETUJUI, SERANGAN DIBATALKAN'
                                : '🕊️ NEGARA AI MENGHORMATI KEPUTUSAN PBB',
                            sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                            message: isApproved
                                ? `Resolusi invasi ${item.proposer.name} terhadap ${item.target.name} disetujui, tetapi negara tersebut tidak melanjutkan serangan.`
                                : `Resolusi invasi ${item.proposer.name} terhadap ${item.target.name} ditolak. Negara tersebut mengurungkan niat menyerang setelah peluang pelanggaran tanpa mandat sebesar 25% tidak berhasil.`,
                            timestamp: currentDateStr,
                            type: 'peringkat',
                            value: 0,
                            isRead: false,
                        }, ...previous]);
                    }
                });
            }
        }
        if (typeof tickPBBSecurityCouncil === 'function') {
            tickPBBSecurityCouncil(currentDateStr, (newNotif) => {
                setNotifications((prev: any[]) => [newNotif, ...prev]);
            }, selectedCountry?.country);
        }

        if (!countryDetail) return;

        // Auto-set build dates for buildings that don't have one
        // Set to TODAY's date so production starts at 0 from now
        const resourceKeys = [
            "pembangkit_listrik_tenaga_nuklir", "pembangkit_listrik_tenaga_air", "pembangkit_listrik_tenaga_surya",
            "pembangkit_listrik_tenaga_uap", "pembangkit_listrik_tenaga_gas", "pembangkit_listrik_tenaga_angin",
            "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium",
            "logam_tanah_jarang", "bijih_besi",
            "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
            "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
            "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao",
            "tebu", "karet",
            "udang", "mutiara", "ikan",
            "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
        ];

        let hasChanges = false;
        const updatedDetail = { ...countryDetail };

        for (const resourceKey of resourceKeys) {
            const buildingCount = Number(countryDetail[resourceKey]) || 0;
            const buildDateKey = `build_date_${resourceKey}`;
            const buildDate = countryDetail[buildDateKey];

            // If building exists but no build date, auto-set to TODAY so production = 0
            // This ensures legacy buildings without build dates start from 0
            if (buildingCount > 0 && !buildDate) {
                updatedDetail[buildDateKey] = currentDateStr; // Set to TODAY, not game start
                hasChanges = true;
                logger.log('AutoSetBuildDate', `${resourceKey}: Auto-set to today ${currentDateStr}`);
            }
        }

        if (hasChanges) {
            logger.log('MapPage', 'Auto-setting missing build dates for existing buildings to TODAY');
            setCountryDetail(updatedDetail);
        }
    }, [currentDate, countryDetail, selectedCountry?.country]);

    // Log population metrics when the active country or its metadata is initialized.
    useEffect(() => {
        if (!countryDetail) return;

        const populationMetrics = calculateDailyPopulationChange(
            countryDetail,
            selectedCountry?.country,
            metadata,
            currentDateRef.current
        );
        logger.log('PopulationInit', 'Initial population metrics calculated', {
            populasi: countryDetail.jumlah_penduduk,
            netChange: populationMetrics.netDailyChange,
        });
    }, [countryDetail?.country_slug, selectedCountry?.country, metadata]);

    useEffect(() => {
        if (!countryDetail || !currentDate) return;

        const runDailyTick = async () => {
            if (playerDailyTickInFlightRef.current) {
                playerDailyTickRerunRef.current = true;
                return;
            }
            playerDailyTickInFlightRef.current = true;
            try {
                await runDailyTickWork();
            } catch (error) {
                console.error('Player daily simulation failed:', error);
            } finally {
                playerDailyTickInFlightRef.current = false;
                if (playerDailyTickRerunRef.current) {
                    playerDailyTickRerunRef.current = false;
                    window.setTimeout(() => playerDailyTickRunnerRef.current(), 0);
                }
            }
        };
        playerDailyTickRunnerRef.current = runDailyTick;

        const runDailyTickWork = async () => {
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const currentDateStr = `${year}-${month}-${day}`;

            const lastDate = typeof countryDetail.last_daily_tick_date === 'string'
                ? countryDetail.last_daily_tick_date.slice(0, 10)
                : null;
            if (!lastDate) {
                // Persist the baseline so remounts cannot skip the next calendar tick.
                setCountryDetail((prev: any) => prev && {
                    ...prev,
                    last_daily_tick_date: currentDateStr,
                });
                return;
            }

            if (lastDate >= currentDateStr) return;

            // Calculate economy updates
            const playerCountryName = selectedCountry?.country || countryDetail.country || countryDetail.nama_negara || '';
            const materialUpdatesPromise = metadata && Object.keys(metadata).length > 0
                ? calculatePlayerDailyMaterialsInRust(
                    { ...countryDetail, name_id: playerCountryName },
                    metadata,
                    currentDateStr,
                    lastDate,
                )
                : Promise.resolve({});
            // Store net population change for display in Navbar
            let updates: Record<string, any>;
            try {
                updates = await materialUpdatesPromise;
            } catch (error) {
                console.error('Rust daily material simulation failed; using TypeScript fallback:', error);
                updates = calculateDailyMaterialProduction(
                    countryDetail,
                    metadata,
                    currentDateStr,
                    resourceKey => getEconomicEmbargoProductionMultiplier(playerCountryName, resourceKey),
                    lastDate,
                ).updates;
            }

            const populationMetrics = calculateDailyPopulationChange(
                countryDetail,
                selectedCountry?.country,
                metadata,
                currentDateStr
            );

            // Also deduct fuel consumption for power plants daily!
            const daysPassed = lastDate ? getDaysElapsed(lastDate, currentDateStr) : 0;
            if (daysPassed > 0) {
                const electricityFuelBuildings = [
                    "pembangkit_listrik_tenaga_gas",
                    "pembangkit_listrik_tenaga_nuklir",
                    "pembangkit_listrik_tenaga_uap",
                ];

                const dailyCons: Record<string, number> = {
                    gas_alam: 0,
                    uranium: 0,
                    batu_bara: 0,
                    minyak_bumi: 0,
                };

                electricityFuelBuildings.forEach((buildingKey) => {
                    const count = Number(countryDetail[buildingKey]) || 0;
                    if (count === 0) return;
                    switch (buildingKey) {
                        case "pembangkit_listrik_tenaga_gas":
                            dailyCons.gas_alam += 2 * count;
                            break;
                        case "pembangkit_listrik_tenaga_nuklir":
                            dailyCons.uranium += 1 * count;
                            break;
                        case "pembangkit_listrik_tenaga_uap":
                            dailyCons.batu_bara += 50 * count;
                            dailyCons.minyak_bumi += 5 * count;
                            break;
                    }
                });

                // Deduct the consumption from updates
                for (const [fuelKey, consPerDay] of Object.entries(dailyCons)) {
                    if (consPerDay > 0) {
                        const inventoryKey = `inventory_${fuelKey}`;
                        const currentVal = updates[inventoryKey] !== undefined ? updates[inventoryKey] : (Number(countryDetail[inventoryKey]) || 0);
                        updates[inventoryKey] = Math.max(0, currentVal - (consPerDay * daysPassed));
                    }
                }
            }

            setCountryDetail((prev: any) => {
                if (
                    !prev ||
                    (typeof prev.last_daily_tick_date === 'string' &&
                        prev.last_daily_tick_date.slice(0, 10) >= currentDateStr)
                ) return prev;

                const currentPlayerCountryName = String(prev?.country || prev?.nama_negara || prev?.name || selectedCountry?.country || '').trim();

                // Step-by-step compounding day-by-day:
                // Hari 1: default populasi misal 10, pertumbuhan 5 -> 10 + 5 = 15
                // Hari 2: pertumbuhan 4 -> 15 + 4 = 19, dst.
                // Begitu juga kas negara: saldo awal + netto hari 1 -> saldo hari 2, dst.
                let simPop = Math.max(0, Number(prev.jumlah_penduduk) || 10_000_000);
                let simBudget = Number(prev.anggaran) || 0;
                let accumulatedBirths = Number(prev.accumulated_births) || 0;
                let accumulatedDeaths = Number(prev.accumulated_deaths) || 0;

                const advanceOneDay = (dStr: string) => {
                    const d = new Date(`${dStr}T00:00:00.000Z`);
                    d.setUTCDate(d.getUTCDate() + 1);
                    return d.toISOString().slice(0, 10);
                };

                const intermediateCountry = { ...prev };
                let simDate = lastDate;
                let latestMetrics = populationMetrics;

                while (simDate < currentDateStr) {
                    const stepFromDate = simDate;
                    const stepToDate = advanceOneDay(simDate);

                    intermediateCountry.jumlah_penduduk = simPop;
                    intermediateCountry.anggaran = simBudget;

                    const stepMetrics = calculateDailyPopulationChange(
                        intermediateCountry,
                        selectedCountry?.country,
                        metadata,
                        stepFromDate
                    );
                    latestMetrics = stepMetrics;

                    const stepNetBalance = calculateNetBalanceWithEconomicEmbargo(
                        intermediateCountry,
                        currentPlayerCountryName
                    );

                    simPop = Math.max(0, Math.floor(simPop + stepMetrics.netDailyChange));
                    accumulatedBirths += stepMetrics.dailyBirths;
                    accumulatedDeaths += stepMetrics.dailyDeaths;
                    simBudget = simBudget + stepNetBalance;

                    simDate = stepToDate;
                }

                simBudget = simBudget - (Number(prev.minister_recruitment_expense_pending) || 0);

                const populationUpdates = {
                    jumlah_penduduk: simPop,
                    accumulated_births: accumulatedBirths,
                    accumulated_deaths: accumulatedDeaths,
                    laju_pertumbuhan: latestMetrics.netDailyChange,
                    food_supply_ratio: latestMetrics.foodRatio,
                    food_deficit_tier: latestMetrics.foodTier,
                    housing_fulfillment: latestMetrics.housingFulfillment,
                    housing_deficit_tier: latestMetrics.housingTier,
                    overpop_tier: latestMetrics.overpopulationTier,
                    health_tier: latestMetrics.healthTier,
                    population_status: latestMetrics.populationStatus.label,
                };
                const previousCrisisTiers = prev.population_crisis_tiers;
                const currentCrisisTiers = {
                    pangan: latestMetrics.foodTier,
                    hunian: latestMetrics.housingTier,
                    overpopulasi: latestMetrics.overpopulationTier,
                    kesehatan: latestMetrics.healthTier,
                };
                const crisisLabels: Record<string, string> = {
                    pangan: 'Krisis pangan / Food crisis',
                    hunian: 'Krisis hunian / Housing crisis',
                    overpopulasi: 'Overpopulasi / Overpopulation',
                    kesehatan: 'Krisis kesehatan / Health crisis',
                };
                const newCrisisNotifications = previousCrisisTiers
                    ? Object.entries(currentCrisisTiers)
                        .filter(([key, tier]) => tier >= 2 && tier > Number(previousCrisisTiers[key] ?? tier))
                        .map(([key, tier]) => ({
                            id: `population-crisis-${key}-${currentDateStr}-${tier}`,
                            title: `${populationMetrics.populationStatus.label} / ${populationMetrics.populationStatus.labelEn}`,
                            sender: 'Kementerian Kependudukan / Ministry of Population',
                            message: `${crisisLabels[key]} memburuk ke Tier ${tier}. Pertumbuhan bersih: ${populationMetrics.netDailyChange.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jiwa/hari. / Worsened to Tier ${tier}. Net growth: ${populationMetrics.netDailyChange.toLocaleString('en-US')} people/day.`,
                            timestamp: currentDateStr,
                            type: 'kesejahteraan' as const,
                            value: tier,
                            isRead: false,
                            tradeType: 'population_crisis',
                            factor: key,
                        }))
                    : [];
                let currentCompletedBoost = 0;
                let currentCompletedKesejahteraanBoost = 0;
                let currentOngoing = prev.ongoingConstructions || [];

                const currentCompletedEvents = currentOngoing.filter((c: any) => {
                    if (c.type !== "event") return false;
                    return c.endDate <= currentDateStr;
                });

                if (currentCompletedEvents.length > 0) {
                    console.log('[MapPage Tick] Completed events found:', currentCompletedEvents);
                    currentCompletedEvents.forEach((c: any) => {
                        if (c.category === "Kesejahteraan") {
                            currentCompletedKesejahteraanBoost += Number(c.boost) || 0;
                            console.log('[MapPage Tick] Kesejahteraan event completed!', { name: c.name, boost: c.boost });
                        } else {
                            currentCompletedBoost += Number(c.boost) || 0;
                            console.log('[MapPage Tick] Kepuasan event completed!', { name: c.name, boost: c.boost });
                        }
                    });
                    const completedIds = currentCompletedEvents.map((c: any) => c.id);
                    currentOngoing = currentOngoing.filter((c: any) => !completedIds.includes(c.id));
                }

                // 🔥 HITUNG SELESAINYA PEMBANGUNAN PROGRAM NUKLIR
                const completedNuclearBuilds = currentOngoing.filter((c: any) => c.buildingKey === "program_nuklir" && c.endDate <= currentDateStr);
                let nextProgramNuklirActive = Boolean(prev.programNuklirActive);
                let nextPendingNotifications = Array.isArray(prev.pending_notifications) ? [...prev.pending_notifications] : [];

                if (completedNuclearBuilds.length > 0 && !nextProgramNuklirActive) {
                    nextProgramNuklirActive = true;
                    const completedNuclearIds = completedNuclearBuilds.map((c: any) => c.id);
                    currentOngoing = currentOngoing.filter((c: any) => !completedNuclearIds.includes(c.id));
                    const userCountry = prev?.country || prev?.nama || "Indonesia";
                    const completeNotif = generateProgramNuklirSelesaiNotification(userCountry, currentDateStr);
                    nextPendingNotifications.unshift(completeNotif);
                }

                // 🔥 HITUNG SELESAINYA PEMBANGUNAN RUDAL ICBM PEMAIN (BERTAHAP PER UNIT)
                let nextIcbmTask = prev.icbmBuildTask || null;
                let nextIcbmJumlah = Number(prev.icbm_jumlah || 0);
                let nextIcbmStatus = Boolean(prev.icbm_status);
                if (nextIcbmTask && nextIcbmTask.startDate && nextIcbmTask.endDate) {
                    const totalTaskQty = Math.max(1, Number(nextIcbmTask.quantity) || 1);
                    const taskStartDate = new Date(`${nextIcbmTask.startDate}T00:00:00`);
                    const taskEndDate = new Date(`${nextIcbmTask.endDate}T00:00:00`);
                    const currDateObj = new Date(`${currentDateStr}T00:00:00`);

                    const totalDays = Math.max(1, Math.round((taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24)));
                    const daysPerUnit = Math.max(1, Math.round(totalDays / totalTaskQty));

                    // Hitung berapa unit yang seharusnya sudah selesai sampai currentDateStr
                    let finishedUnits = 0;
                    for (let i = 0; i < totalTaskQty; i++) {
                        const unitDueDate = new Date(taskStartDate);
                        unitDueDate.setDate(unitDueDate.getDate() + daysPerUnit * (i + 1));
                        if (unitDueDate <= currDateObj) {
                            finishedUnits++;
                        }
                    }

                    const prevDeliveredUnits = Number(nextIcbmTask.deliveredUnits || 0);
                    const newlyFinished = Math.max(0, finishedUnits - prevDeliveredUnits);

                    if (newlyFinished > 0) {
                        nextIcbmJumlah += newlyFinished;
                        nextIcbmStatus = true;
                        const newDelivered = prevDeliveredUnits + newlyFinished;
                        const isAllDone = newDelivered >= totalTaskQty;

                        nextIcbmTask = {
                            ...nextIcbmTask,
                            deliveredUnits: newDelivered,
                            completed: isAllDone,
                        };

                        const userCountry = prev?.country || prev?.nama || "Indonesia";
                        const icbmSelesaiNotif = {
                            id: `icbm-done-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                            title: `🚀 PERAKITAN SELESAI: ${newlyFinished} Rudal ICBM Siap Tempur!`,
                            sender: `Komando Strategis Nuklir Nasional`,
                            message: `KABAR STRATEGIS KENEGARAAN! Perakitan ${newlyFinished} unit Rudal Balistik Antar-Benua (ICBM) milik negara ${userCountry} telah rampung dan siap siaga di pangkalan militer! Total stok ICBM aktif: ${nextIcbmJumlah} unit.`,
                            timestamp: currentDateStr,
                            type: 'peringkat',
                            value: 100,
                            isRead: false,
                            tradeType: 'icbm_selesai',
                            effectText: `${newlyFinished} Unit Rudal ICBM Siap Tempur Ditambahkan ke Arsenal`,
                            isHandled: true,
                        };
                        nextPendingNotifications.unshift(icbmSelesaiNotif);
                    }
                }

                const monthsPassed = lastDate ? getMonthsDifference(lastDate, currentDateStr) : 0;
                const nationalizationDiplomacyMonthCounter =
                    Math.max(0, Math.floor(Number(prev.nationalization_diplomacy_month_counter) || 0)) +
                    (hasActiveNationalization(prev.sector_nationalization) ? Math.max(0, monthsPassed) : 0);
                const lowSectorCount = countLowSatisfactionSectors(prev, metadata);
                const previousSectorDeficitMonths = Math.max(0, Number(prev.sector_deficit_month_counter) || 0);
                const sectorDeficitMonths = lowSectorCount > 0
                    ? previousSectorDeficitMonths + monthsPassed
                    : 0;
                const sectorDeficitPeriods = lowSectorCount > 0
                    ? Math.floor(sectorDeficitMonths / LOW_SECTOR_DECAY_INTERVAL_MONTHS)
                    : 0;
                const sectorDeficitMonthCounter = lowSectorCount > 0
                    ? sectorDeficitMonths % LOW_SECTOR_DECAY_INTERVAL_MONTHS
                    : 0;
                const sectorDeficitPenaltyPerPeriod = Math.min(
                    LOW_SECTOR_DECAY_MAX_POINTS_PER_INTERVAL,
                    lowSectorCount * LOW_SECTOR_DECAY_POINTS_PER_SECTOR,
                );
                const sectorDeficitPenaltyThisTick = sectorDeficitPeriods * sectorDeficitPenaltyPerPeriod;
                const accumulatedSectorPenalty = lowSectorCount > 0
                    ? Math.max(0, Number(prev.sector_deficit_kepuasan_penalty) || 0) +
                    sectorDeficitPenaltyThisTick
                    : 0;
                const nextKepuasan = Math.max(
                    0,
                    Math.min(
                        100,
                        parseFloat(
                            (
                                (prev.kepuasan ?? 50) +
                                currentCompletedBoost -
                                sectorDeficitPenaltyThisTick
                            ).toFixed(1),
                        ),
                    ),
                );

                // --- FILTER BENCANA & WABAH SERTA DETEKSI EVENT KEDALUWARSA TANPA BANTUAN ---
                const rawOutbreaks = Array.isArray(prev.active_outbreaks) ? prev.active_outbreaks : [];
                const rawDisasters = Array.isArray(prev.active_disaster_effects) ? prev.active_disaster_effects : [];

                let unhandledExpiredDisastersCount = 0;
                const nextActiveOutbreaks = rawOutbreaks.filter((event: any) => {
                    const elapsed = Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${String(event.startDate || '').slice(0, 10)}T00:00:00Z`);
                    const isStillActive = Number.isFinite(elapsed) && elapsed >= 0 && elapsed < (Number(event.durationDays) || 0) * 86_400_000;
                    if (!isStillActive) {
                        const notif = notifications.find((n: any) => n.id === event.id);
                        const isHandled = event.isHandled || notif?.isHandled;
                        const isRejected = event.isRejected;
                        if (!isHandled && !isRejected) {
                            unhandledExpiredDisastersCount++;
                        }
                    }
                    return isStillActive;
                });

                const nextActiveDisasters = rawDisasters.filter((event: any) => {
                    const elapsed = Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${String(event.startDate || '').slice(0, 10)}T00:00:00Z`);
                    const isStillActive = Number.isFinite(elapsed) && elapsed >= 0 && elapsed < (Number(event.durationDays) || 30) * 86_400_000;
                    if (!isStillActive) {
                        const notif = notifications.find((n: any) => n.id === event.id);
                        const isHandled = event.isHandled || notif?.isHandled;
                        const isRejected = event.isRejected;
                        if (!isHandled && !isRejected) {
                            unhandledExpiredDisastersCount++;
                        }
                    }
                    return isStillActive;
                });

                // Setiap krisis yang dibiarkan selesai memberi satu penalti peringkat.
                const unhandledDisasterPenalty = unhandledExpiredDisastersCount;

                // --- HITUNG PENURUNAN PERINGKAT BERDASARKAN KEPUASAN (menggunakan peringkatCalculator) ---
                // Cek apakah ada bencana alam, epidemi, atau pandemi aktif yang belum diatasi dan sudah melebihi 1 bulan (>= 30 hari)
                const isCrisisUnhandledAndPastOneMonth = (event: any) => {
                    if (event?.isHandled) return false;
                    const notif = notifications.find((n: any) => n.id === event.id);
                    if (notif?.isHandled) return false;
                    const startDateStr = String(event.startDate || '').slice(0, 10);
                    if (!startDateStr) return false;
                    const elapsedDays = Math.max(0, (Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${startDateStr}T00:00:00Z`)) / 86_400_000);
                    return elapsedDays >= 30;
                };

                const hasUnhandledCrisis = nextActiveOutbreaks.some(isCrisisUnhandledAndPastOneMonth) ||
                    nextActiveDisasters.some(isCrisisUnhandledAndPastOneMonth);

                const keterbukaanScore = calculateKeterbukaanScore(prev);
                const ratingResult = calculatePresidentRating({
                    currentRating: prev.presidentRating ?? 50,
                    ratingMonthCounter: prev.rating_month_counter ?? 0,
                    lastRatingThreshold: prev.last_rating_threshold ?? 1.0,
                    monthsPassed,
                    currentKepuasan: nextKepuasan,
                    keterbukaanScore,
                    lowSectorCount,
                    hasUnhandledPopulationCrisis: hasUnhandledCrisis,
                    additionalDecay: sectorDeficitPenaltyThisTick + unhandledDisasterPenalty,
                    currentCompletedBoost: currentCompletedBoost,
                    countryDetail: prev,
                    lastDate,
                    currentDate: currentDateStr,
                });

                if (ratingResult.nextRating !== (prev.presidentRating ?? 50) || currentCompletedBoost > 0) {
                    setPresidentRating(ratingResult.nextRating);
                }

                // --- HITUNG PENURUNAN KESEJAHTERAAN BERDASARKAN KEPUASAN ---
                // Tambahkan boost bantuan sosial kesejahteraan ke score dasar sebelum dikurangi decay
                const baseKesejahteraan = Math.min(100, (prev.kesejahteraan ?? 50) + currentCompletedKesejahteraanBoost);
                const decayResult = calculateKesejahteraanDecay({
                    currentKesejahteraan: baseKesejahteraan,
                    kesejahteraanMonthCounter: prev.kesejahteraan_month_counter ?? 0,
                    lastKesejahteraanThreshold: prev.last_kesejahteraan_threshold ?? 12,
                    monthsPassed,
                    currentKepuasan: nextKepuasan,
                    keterbukaanScore,
                    lowSectorCount,
                    additionalDecay: sectorDeficitPenaltyThisTick,
                });

                const nextKesejahteraan = decayResult.nextKesejahteraan;
                if (nextKesejahteraan !== (prev.kesejahteraan ?? 50)) {
                    setKesejahteraan(nextKesejahteraan);
                }

                const nextKesejahteraanBonus = (prev.kesejahteraan_bonus ?? 0) + currentCompletedKesejahteraanBoost;
                const nextKesejahteraanDecay = (prev.kesejahteraan_decay ?? 0) + decayResult.decayThisTick;

                const existingEmbassyConstructions = Array.isArray(prev?.ongoingEmbassyConstructions) ? prev.ongoingEmbassyConstructions : [];
                const completedEmbassyConstructions = existingEmbassyConstructions.filter((c: any) => c.endDate <= currentDateStr);

                let nextOngoingEmbassyConstructions = existingEmbassyConstructions;
                let nextEmbassies = Array.isArray(prev?.embassies) ? [...prev.embassies] : [];
                let nextRemovedEmbassies = Array.isArray(prev?.removedEmbassies) ? [...prev.removedEmbassies] : [];
                const playerCountryName = currentPlayerCountryName;
                const previousAutoRemovedEmbassies = Array.isArray(prev?.autoRemovedEmbassies)
                    ? [...prev.autoRemovedEmbassies]
                    : [];

                if (completedEmbassyConstructions.length > 0) {
                    const completedTargetCountries = completedEmbassyConstructions.map((c: any) => c.targetCountry);
                    const normalizeCountryName = (name: unknown) => String(name || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]/g, '');
                    const completedTargetNames = new Set(completedTargetCountries.map(normalizeCountryName));
                    nextOngoingEmbassyConstructions = existingEmbassyConstructions.filter((c: any) => !completedTargetCountries.includes(c.targetCountry));
                    nextRemovedEmbassies = nextRemovedEmbassies.filter(
                        (name: string) => !completedTargetNames.has(normalizeCountryName(name))
                    );

                    completedEmbassyConstructions.forEach((c: any) => {
                        if (!nextEmbassies.some((emb: any) => {
                            const embassyCountry = typeof emb === 'string' ? emb : emb.mitra || emb.nama_negara;
                            return normalizeCountryName(embassyCountry) === normalizeCountryName(c.targetCountry);
                        })) {
                            nextEmbassies.push({
                                id: Date.now() + Math.random(),
                                mitra: c.targetCountry,
                                type: 'Kedutaan Besar',
                                status: 'Aktif',
                                continent: c.continent || 'Asia',
                                builtAt: currentDateStr,
                            });
                        }
                    });
                }

                const ongoingPactRatifications = Array.isArray(prev?.ongoingNonAggressionPactRatifications)
                    ? prev.ongoingNonAggressionPactRatifications
                    : [];
                const hasEmbassyForPact = (targetCountry: unknown) => playerHasEmbassyOrTradePartners(
                    String(targetCountry || ''),
                    playerCountryName,
                    nextEmbassies,
                    nextRemovedEmbassies,
                    Array.isArray(prev?.removedTradePartners) ? prev.removedTradePartners : []
                );
                const validPactRatifications = ongoingPactRatifications.filter((pact: any) => hasEmbassyForPact(pact.targetCountry));
                const completedPactRatifications = validPactRatifications.filter((p: any) => p.endDate <= currentDateStr);
                const nextOngoingPactRatifications = validPactRatifications.filter((p: any) => p.endDate > currentDateStr);
                const ongoingDiplomacyRatifications = Array.isArray(prev?.ongoingDiplomacyRatifications)
                    ? prev.ongoingDiplomacyRatifications
                    : [];
                const validDiplomacyRatifications = ongoingDiplomacyRatifications.filter(
                    (ratification: any) => hasEmbassyForPact(ratification.targetCountry)
                );
                const completedDiplomacyRatifications = validDiplomacyRatifications.filter(
                    (ratification: any) => ratification.endDate <= currentDateStr
                );
                const nextOngoingDiplomacyRatifications = validDiplomacyRatifications.filter(
                    (ratification: any) => ratification.endDate > currentDateStr
                );
                const existingPacts = Array.isArray(prev?.nonAggressionPacts) ? prev.nonAggressionPacts : [];
                const nextPacts = Array.from(new Set([...existingPacts, ...completedPactRatifications.map((p: any) => p.targetCountry)]));
                const existingPactHistory = Array.isArray(prev?.nonAggressionPactHistory) ? prev.nonAggressionPactHistory : [];
                const nextPactHistory = completedPactRatifications.reduce((history: any[], pact: any) => {
                    const exists = history.some((period: any) => String(period.partner || '').toLowerCase().trim() === String(pact.targetCountry || '').toLowerCase().trim() && !period.endDate);
                    return exists ? history : [...history, { country: playerCountryName, partner: pact.targetCountry, startDate: currentDateStr }];
                }, existingPactHistory);
                const diplomacyCompletionNotifications = [
                    ...completedEmbassyConstructions.map((construction: any) => ({
                        id: `embassy-completed-${construction.id || construction.targetCountry}-${currentDateStr}`,
                        title: 'Pembangunan Kedutaan Selesai',
                        sender: 'Kementerian Luar Negeri',
                        message: `Kedutaan Besar di ${construction.targetCountry} telah selesai dibangun dan kini aktif.`,
                        timestamp: currentDateStr,
                        type: 'peringkat' as const,
                        value: 0,
                        isRead: false,
                    })),
                    ...completedPactRatifications.map((pact: any) => ({
                        id: `pact-ratified-${pact.id || pact.targetCountry}-${currentDateStr}`,
                        title: 'Pakta Non-Agresi Resmi Berlaku',
                        sender: 'Kementerian Luar Negeri',
                        message: `Masa ratifikasi telah selesai. Pakta Non-Agresi dengan ${pact.targetCountry} kini resmi berlaku.`,
                        timestamp: String(pact.endDate || currentDateStr),
                        diplomacyArrivalDate: String(pact.endDate || currentDateStr),
                        diplomacyArrivalDays: Number(pact.durationDays) || 0,
                        type: 'peringkat' as const,
                        value: 0,
                        isRead: false,
                    })),
                    ...completedDiplomacyRatifications.map((ratification: any) => ({
                        id: `diplomacy-ratified-${ratification.id || ratification.targetCountry}-${currentDateStr}`,
                        title: ratification.kind === 'defense-alliance'
                            ? 'Aliansi Pertahanan Resmi Berlaku'
                            : ratification.kind === 'trade-agreement'
                                ? 'Perjanjian Dagang Resmi Berlaku'
                                : 'Kontrak Penelitian Resmi Berlaku',
                        sender: 'Kementerian Luar Negeri',
                        message: `Masa ratifikasi telah selesai. ${ratification.kind === 'defense-alliance'
                            ? 'Aliansi Pertahanan'
                            : ratification.kind === 'trade-agreement'
                                ? 'Perjanjian Dagang'
                                : 'Kontrak Penelitian'} dengan ${ratification.targetCountry} kini resmi berlaku.`,
                        timestamp: String(ratification.endDate || currentDateStr),
                        diplomacyArrivalDate: String(ratification.endDate || currentDateStr),
                        diplomacyArrivalDays: Number(ratification.durationDays) || 0,
                        type: 'peringkat' as const,
                        value: 0,
                        isRead: false,
                    })),
                ];

                const normalizeCountryName = (name: unknown) => String(name || '')
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '');
                const embassiesBelowRelationThreshold = nextEmbassies.filter((embassy: any) => {
                    const embassyCountry = typeof embassy === 'string' ? embassy : embassy?.mitra || embassy?.nama_negara;
                    return embassyCountry &&
                        getRelationValue(playerCountryName, embassyCountry, currentDateStr) <= 40;
                });
                if (embassiesBelowRelationThreshold.length > 0) {
                    const autoRemovedNames = embassiesBelowRelationThreshold.map((embassy: any) =>
                        typeof embassy === 'string' ? embassy : embassy.mitra || embassy.nama_negara
                    );
                    const autoRemovedEvents = embassiesBelowRelationThreshold.map((embassy: any, index: number) => ({
                        id: `${normalizeCountryName(autoRemovedNames[index])}:${String(embassy?.builtAt || 'legacy')}:${currentDateStr}:${String(embassy?.id || '')}`,
                        country: autoRemovedNames[index],
                        date: currentDateStr,
                    }));
                    const normalizedRemovedNames = new Set(autoRemovedNames.map(normalizeCountryName));
                    nextEmbassies = nextEmbassies.filter((embassy: any) => {
                        const embassyCountry = typeof embassy === 'string' ? embassy : embassy?.mitra || embassy?.nama_negara;
                        return !normalizedRemovedNames.has(normalizeCountryName(embassyCountry));
                    });
                    nextRemovedEmbassies = Array.from(new Set([...nextRemovedEmbassies, ...autoRemovedNames]));
                    const existingAutoRemovedIds = new Set(previousAutoRemovedEmbassies.map((entry: any) =>
                        entry && typeof entry === 'object' && 'id' in entry
                            ? String(entry.id)
                            : String(entry || '').toLowerCase().trim()
                    ));
                    previousAutoRemovedEmbassies.push(
                        ...autoRemovedEvents.filter((event: { id: string }) => !existingAutoRemovedIds.has(event.id))
                    );
                }

                const updatedCountry = {
                    ...prev,
                    ...updates,
                    ...populationUpdates,
                    anggaran: simBudget,
                    last_daily_tick_date: currentDateStr,
                    minister_recruitment_expense_pending: 0,
                    satisfaction: prev.satisfaction, // Preserve satisfaction scores
                    programNuklirActive: nextProgramNuklirActive,
                    icbm_jumlah: nextIcbmJumlah,
                    icbm_status: nextIcbmStatus,
                    icbmBuildTask: nextIcbmTask,
                    population_crisis_tiers: currentCrisisTiers,
                    pending_notifications: [...diplomacyCompletionNotifications, ...nextPendingNotifications, ...newCrisisNotifications],
                    active_outbreaks: nextActiveOutbreaks,
                    active_disaster_effects: nextActiveDisasters,
                    ongoingConstructions: currentOngoing,
                    ongoingEmbassyConstructions: nextOngoingEmbassyConstructions,
                    ongoingNonAggressionPactRatifications: nextOngoingPactRatifications,
                    ongoingDiplomacyRatifications: nextOngoingDiplomacyRatifications,
                    nonAggressionPacts: nextPacts,
                    nonAggressionPactHistory: nextPactHistory,
                    defenseAlliances: Array.from(new Set([
                        ...(Array.isArray(prev?.defenseAlliances) ? prev.defenseAlliances : []),
                        ...completedDiplomacyRatifications
                            .filter((ratification: any) => ratification.kind === 'defense-alliance')
                            .map((ratification: any) => ratification.targetCountry),
                    ])),
                    addedTradePartners: Array.from(new Set([
                        ...(Array.isArray(prev?.addedTradePartners) ? prev.addedTradePartners : []),
                        ...completedDiplomacyRatifications
                            .filter((ratification: any) => ratification.kind === 'trade-agreement')
                            .map((ratification: any) => ratification.targetCountry),
                    ])),
                    researchContracts: Array.from(new Set([
                        ...(Array.isArray(prev?.researchContracts) ? prev.researchContracts : []),
                        ...completedDiplomacyRatifications
                            .filter((ratification: any) => ratification.kind === 'research-contract')
                            .map((ratification: any) => ratification.targetCountry),
                    ])),
                    nationalization_diplomacy_month_counter: nationalizationDiplomacyMonthCounter,
                    embassies: nextEmbassies,
                    removedEmbassies: nextRemovedEmbassies,
                    autoRemovedEmbassies: previousAutoRemovedEmbassies,
                    kepuasan: nextKepuasan,
                    sector_deficit_month_counter: sectorDeficitMonthCounter,
                    sector_deficit_kepuasan_penalty: accumulatedSectorPenalty,
                    presidentRating: ratingResult.presidentRating,
                    rating_month_counter: ratingResult.rating_month_counter,
                    last_rating_threshold: ratingResult.last_rating_threshold,
                    kesejahteraan: nextKesejahteraan,
                    kesejahteraan_bonus: nextKesejahteraanBonus,
                    kesejahteraan_decay: nextKesejahteraanDecay,
                    kesejahteraan_month_counter: decayResult.kesejahteraan_month_counter,
                    last_kesejahteraan_threshold: decayResult.last_kesejahteraan_threshold,
                };
                if (typeof window !== 'undefined') {
                    (window as any).neosantara_player_country_detail = updatedCountry;
                }
                return updatedCountry;
            });

            // ⏳ Hitung mundur durasi notifikasi wabah (pandemi/epidemi), bencana alam, serta demonstrasi rakyat setiap pergantian hari
            let demoKepuasanDelta = 0;
            let demoRatingDelta = 0;

            setNotifications((prevNotifications) => {
                let hasChanges = false;
                let ignoredCount = 0;

                const nextNotifications = prevNotifications.map((notif: any) => {
                    // 1. Evaluasi demonstrasi rakyat
                    if (notif.tradeType === 'demonstrasi_rakyat') {
                        if (notif.demo_status === 'ignored' || notif.demo_status === 'aktif' || !notif.demo_status) {
                            ignoredCount++;
                        }
                    }

                    // 2. Evaluasi wabah dan bencana alam
                    if (notif.tradeType === 'wabah_penyakit' || notif.tradeType === 'bencana_alam') {
                        const totalDuration = Number(notif.durationDays) || (notif.tradeType === 'bencana_alam' ? 30 : 14);
                        const start = notif.startDate || notif.timestamp;
                        let remaining: number;
                        if (start) {
                            const elapsedMs = Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${String(start).slice(0, 10)}T00:00:00Z`);
                            const elapsedDays = Math.max(0, Math.floor(elapsedMs / 86_400_000));
                            remaining = Math.max(0, totalDuration - elapsedDays);
                        } else if (typeof notif.remainingDurationDays === 'number') {
                            remaining = Math.max(0, notif.remainingDurationDays - 1);
                        } else {
                            remaining = Math.max(0, totalDuration - 1);
                        }

                        if (notif.remainingDurationDays !== remaining) {
                            hasChanges = true;
                            return {
                                ...notif,
                                remainingDurationDays: remaining,
                            };
                        }
                    }
                    return notif;
                });

                if (ignoredCount > 0) {
                    const ignoredPenalties = calculateDailyIgnoredDemoPenalties(ignoredCount);
                    demoKepuasanDelta -= ignoredPenalties.dailyKepuasanPenalty;
                    demoRatingDelta -= ignoredPenalties.dailyRatingPenalty;
                }

                if (demoKepuasanDelta !== 0 || demoRatingDelta !== 0) {
                    setCountryDetail((prev: any) => {
                        if (!prev) return prev;
                        const currentK = Number(prev.kepuasan ?? 50);
                        const nextK = Math.max(0, Math.min(100, currentK + demoKepuasanDelta));
                        return { ...prev, kepuasan: nextK };
                    });

                    if (demoRatingDelta !== 0) {
                        setPresidentRating((prev: number) => Math.max(0, Math.min(100, prev + demoRatingDelta)));
                    }
                }

                return hasChanges ? nextNotifications : prevNotifications;
            });
        };

        // Jalankan segera agar sinkron instan dengan tanggal kalender baru bahkan saat peta digeser
        playerDailyTickRunnerRef.current();
        return () => {
            if (playerDailyTickRunnerRef.current === runDailyTick) {
                playerDailyTickRunnerRef.current = () => {};
            }
        };
    }, [currentDate, countryDetail, metadata, selectedCountry?.country]);

    // ─── Auto-refresh kepuasan di navbar ────────────────────────────────
    // Hitung ulang kepuasan setiap kali countryDetail atau metadata berubah
    // sehingga nilai di navbar selalu up-to-date tanpa harus buka modal
    useEffect(() => {
        if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return;

        if (!countryDetail.satisfaction_sector_baseline) {
            setCountryDetail((prev: any) => {
                if (!prev || prev.satisfaction_sector_baseline) return prev;
                return {
                    ...prev,
                    satisfaction_sector_baseline: createSatisfactionSectorBaseline(prev, metadata),
                };
            });
            return;
        }

        const newKepuasan = calculateKepuasan(countryDetail, metadata);

        // Hanya update jika berubah signifikan (> 0.1) untuk mencegah infinite loop
        const currentKepuasan = countryDetail?.kepuasan ?? 50;
        if (Math.abs(currentKepuasan - newKepuasan) < 0.1) return;

        setCountryDetail((prev: any) => {
            if (!prev) return prev;
            return { ...prev, kepuasan: newKepuasan };
        });
    }, [countryDetail, metadata]);

    // ─── Auto-refresh kesejahteraan di navbar ────────────────────────────────
    // Hitung ulang indeks kesejahteraan setiap kali fasilitas/detail negara berubah
    useEffect(() => {
        if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return;

        const kesejahteraanResult = calculateKesejahteraan(
            countryDetail,
            metadata,
            countryDetail?.kesejahteraan
        );

        // Hanya update jika berubah signifikan (> 1 poin) untuk mencegah infinite loop
        const currentKesejahteraan = countryDetail?.kesejahteraan ?? 50;
        if (Math.abs(currentKesejahteraan - kesejahteraanResult.overallScore) < 1) return;

        setCountryDetail((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                kesejahteraan: kesejahteraanResult.overallScore,
                kesejahteraanTrend: kesejahteraanResult.trend,
            };
        });

        setKesejahteraan(kesejahteraanResult.overallScore);
    }, [countryDetail, metadata]);

    const handleRestart = () => {
        if (selectedCountry) {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('hutangModalLoanSources');
                window.localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
                clearMissionProgressData();
                window.localStorage.setItem('player_diamonds', '150');
                setPlayerDiamonds(150);
                clearActiveNpcCountrySimulationState();
                (window as any).neosantara_country_color_overrides = {};
                (window as any).neosantara_annexed_countries = {};
            }
            handleGameRestart({
                timeManager: timeManagerRef.current,
                setIsPaused,
                setSpeed,
                setCountryDetail,
                reloadStats: () => loadCountryStats(selectedCountry.country, selectedCountry.capital),
                skipConfirm: true
            });
            setPlayerNetBalanceAdjustment(0);
            setPresidentRating(50);
            setKesejahteraan(50);
            // Reset semua notifikasi, warning flags, dan deep links
            setNotifications([]);
            setNewsList([]);
            lastObservedNewsResetDateRef.current = null;
            setHasShownEarlyWarning({ kepuasan: false, peringkat: false, kesejahteraan: false });
            setHasShownRatingWarning(false);
            setProductionDeepLink(null);
            setTempatUmumDeepLink(null);
            setKesejahteraanDeepLink(false);
            setAiConstructionNavigation(null);
            setCountryColorOverrides({});
            // Reset status tampilan modal detail
            setCountryDetailModalOpen(false);
            setPlayerDetailModalOpen(false);
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setPenelitianModalOpen(false);
            setMissionModalOpen(false);
            setActiveMenu('Peta Taktis');
            // Toggle resetTrigger to signal all modals to reset
            setResetTrigger(prev => !prev);
        }
    };

    // Open save dialog with existing slots check
    const openSaveModal = async () => {
        if (!selectedCountry) return;
        const defaultName = calendarRef.current?.calendar.formatSaveName(selectedCountry.country)
            || `Simulasi ${selectedCountry.country} - ${timeManagerRef.current?.getFormattedDate() || 'Hari Ini'}`;
        setSaveNameInput(defaultName);
        setSelectedSaveIdToOverwrite(null);
        setIsCreatingNewSaveSlot(false);
        setIsSaveModalOpen(true);

        setIsLoadingExistingSaves(true);
        try {
            const res = await fetch('/api/game-save');
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : [];
                setExistingSaveFiles(list);
                // Jika belum ada save sama sekali, langsung ke form input baru
                if (list.length === 0) {
                    setIsCreatingNewSaveSlot(true);
                }
            } else {
                setExistingSaveFiles([]);
                setIsCreatingNewSaveSlot(true);
            }
        } catch {
            setExistingSaveFiles([]);
            setIsCreatingNewSaveSlot(true);
        } finally {
            setIsLoadingExistingSaves(false);
        }
    };

    // Save game progress handler (supports new slot or overwrite)
    const handleSaveGame = async (targetSaveId?: number | null) => {
        if (!selectedCountry) return;

        const saveIdToUse = targetSaveId !== undefined ? targetSaveId : selectedSaveIdToOverwrite;

        const timeManager = timeManagerRef.current;
        const wasPaused = timeManager?.getIsPaused() ?? true;
        timeManager?.setPaused(true);
        setIsPaused(true);
        setIsSaving(true);
        try {
            const saveName = saveNameInput.trim()
                || (calendarRef.current?.calendar.formatSaveName(selectedCountry.country)
                    || `Simulasi ${selectedCountry.country} - ${timeManagerRef.current?.getFormattedDate() || 'Hari Ini'}`);
            const gameDate = timeManager?.getCurrentDate().toISOString() || new Date().toISOString();

            await flushNpcCountrySimulation();
            const sessionState = {
                npcSimulation: getNpcCountrySimulationSnapshot(),
                countryColorOverrides: (window as any).neosantara_country_color_overrides || countryColorOverrides,
                annexedCountries: (window as any).neosantara_annexed_countries || {},
                cityOwner: (window as any).neosantara_city_owner || {},
            };
            const response = await fetch('/api/game-save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    saveId: saveIdToUse,
                    saveName,
                    countryName: selectedCountry.country,
                    countryIso: selectedCountry.iso,
                    gameDate,
                    capital: countryDetail?.capital || selectedCountry.capital,
                    jumlahPenduduk: countryDetail?.jumlah_penduduk || 0,
                    anggaran: countryDetail?.anggaran || 0,
                    ideology: countryDetail?.ideology || '-',
                    religion: countryDetail?.religion || '-',
                    unVote: countryDetail?.un_vote || 0,
                    kepuasan: countryDetail?.kepuasan ?? 50,
                    countryDetail: {
                        ...countryDetail,
                        presidentRating: presidentRating,
                        playerDiamonds: playerDiamonds,
                        missionCompletions: typeof window !== 'undefined' ? localStorage.getItem('presiden_simulator_mission_completions') : null,
                        activeMissionId: typeof window !== 'undefined' ? localStorage.getItem('presiden_simulator_active_mission') : null,
                        claimableMissions: typeof window !== 'undefined' ? localStorage.getItem('presiden_simulator_claimable_missions') : null,
                        __neosantara_game_session: sessionState,
                    }, // Save entire countryDetail with all production data and president rating
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Gagal menyimpan permainan');
            }

            setToastMessage(saveIdToUse ? 'Data simpanan berhasil diperbarui!' : 'Permainan berhasil disimpan!');
            setIsSaveModalOpen(false);
            setIsCreatingNewSaveSlot(false);
            setSelectedSaveIdToOverwrite(null);
            setTimeout(() => setToastMessage(null), 3000);
        } catch (error: any) {
            console.error('Error saving game:', error);
            alert(`Terjadi kesalahan: ${error.message || 'Gagal menyimpan permainan.'}`);
        } finally {
            timeManager?.setPaused(wasPaused);
            setIsPaused(wasPaused);
            setIsSaving(false);
        }
    };

    // Initial map canvas and WASM initialization hook
    useEffect(() => {
        let featureColorSyncTimer: number | null = null;

        const initMap = async () => {
            if (hasInitRef.current) return;
            hasInitRef.current = true;

            try {
                const [wasmModule, geojsonResponse] = await Promise.all([
                    import('../../../wasm/map-engine-rs/map_engine_rs'),
                    fetch('/world.geojson', { cache: 'force-cache' })
                ]);
                await wasmModule.default();
                if (!geojsonResponse.ok) {
                    throw new Error(`Gagal memuat data peta: HTTP ${geojsonResponse.status}`);
                }
                let rawGeojsonStr = await geojsonResponse.text();
                const geojsonObj = JSON.parse(rawGeojsonStr);
                if (!Array.isArray(geojsonObj.features)) {
                    throw new Error('Format GeoJSON peta tidak valid.');
                }
                const drawableFeatures = mergeClaimedTerritories(
                    geojsonObj.features.filter((feature: { geometry?: unknown }) => feature.geometry)
                );
                geojsonObj.features = drawableFeatures;
                rawGeojsonStr = JSON.stringify(geojsonObj);

                if (typeof window !== 'undefined') {
                    (window as any).neosantara_world_geojson_features = drawableFeatures;
                    window.dispatchEvent(new Event('world_map_features_ready'));
                }

                wasmModuleRef.current = wasmModule;

                // After init, the exported functions are available on the module
                const { start_map_engine, set_selected_country_on_map, set_map_horizontal_wrap } = wasmModule;

                const normalizeCountryKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
                // Warna override (aneksasi / diplomasi) dihitung di JS hanya saat data berubah,
                // lalu dikirim ke engine WASM. Tidak ada lagi hook di setiap fillStyle.
                let lastColorSignature = '';
                const syncFeatureColors = () => {
                    const w = window as any;
                    const features = w.neosantara_world_geojson_features;
                    if (!Array.isArray(features)) return;
                    const diplomacyActive = Boolean(w.neosantara_diplomacy_map_active);
                    const overrides = w.neosantara_country_color_overrides || EMPTY_COUNTRY_OVERRIDES;
                    const annexedCountries = w.neosantara_annexed_countries || EMPTY_ANNEXED_COUNTRIES;
                    const annexedKeys = new Set(
                        Object.entries(annexedCountries)
                            .filter(([, info]) => typeof info === 'object' && info !== null && 'attackerCountry' in (info as object))
                            .map(([key]) => normalizeCountryKey(key))
                    );
                    const validOverrides = Object.entries(overrides as Record<string, string>)
                        .filter(([key]) => annexedKeys.has(normalizeCountryKey(key)))
                        .map(([key, color]) => [normalizeCountryKey(key), color] as const);

                    const getFeatureOverrideColor = (feature: { properties?: Record<string, unknown> }) => {
                        const properties = feature?.properties;
                        if (!properties || validOverrides.length === 0) return null;
                        const featureKeys = new Set([
                            properties.ISO_A2, properties.ISO_A2_EH, properties.ISO_A3, properties.ISO_A3_EH,
                            `iso_${properties.ISO_A2 || properties.ISO_A2_EH || ''}`,
                            `iso_${properties.ISO_A3 || properties.ISO_A3_EH || ''}`,
                            properties.NAME, properties.ADMIN, properties.NAME_LONG, properties.GEOUNIT,
                            properties.NAME_ID, properties.NAME_EN, properties.NAME_IND
                        ].filter((key): key is string => typeof key === 'string' && key.length > 0)
                            .map(normalizeCountryKey));
                        return validOverrides.find(([key]) => featureKeys.has(key))?.[1] ?? null;
                    };

                    let colors: Array<string | null>;
                    if (diplomacyActive) {
                        const src: Array<string | undefined> = w.neosantara_diplomacy_map_feature_colors || [];
                        colors = features.map((feature: { properties?: Record<string, unknown> }, i: number) => {
                            // Jika negara ini adalah wilayah aneksasi pemain, SELALU gunakan warna aneksasi (hijau)
                            const overrideColor = getFeatureOverrideColor(feature);
                            if (overrideColor) return overrideColor;
                            return src[i] ?? null;
                        });
                    } else {
                        colors = features.map((feature: { properties?: Record<string, unknown> }) => {
                            return getFeatureOverrideColor(feature);
                        });
                    }
                    const signature = `${diplomacyActive ? 1 : 0}|${colors.join(',')}`;
                    if (signature === lastColorSignature) return; // tidak berubah: hindari redraw WASM
                    lastColorSignature = signature;
                    wasmModule.set_feature_colors_on_map(colors, diplomacyActive);
                };
                mapFeatureColorSyncRef.current = syncFeatureColors;

                let featureColorsPending = false;
                const scheduleFeatureColorSync = () => {
                    featureColorsPending = true;
                    if (
                        (window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active ||
                        isTimeControllerHoveredRef.current
                    ) {
                        return;
                    }
                    if (featureColorSyncTimer !== null) {
                        window.clearTimeout(featureColorSyncTimer);
                    }
                    featureColorSyncTimer = window.setTimeout(() => {
                        featureColorSyncTimer = null;
                        if ((window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active) {
                            return;
                        }
                        if (isTimeControllerHoveredRef.current) return;
                        if (!featureColorsPending) return;
                        featureColorsPending = false;
                        syncFeatureColors();
                    }, MAP_INTERACTION_IDLE_MS);
                };
                const resumeFeatureColorSync = () => {
                    if (featureColorsPending) scheduleFeatureColorSync();
                };

                // Hook context setTransform sebelum start_map_engine untuk menangkap kamera WASM secara presisi (bebas dari gangguan last_copy dan throttle)
                const canvasEl = document.getElementById('map-canvas') as HTMLCanvasElement | null;
                if (canvasEl) {
                    const originalGetContext = canvasEl.getContext.bind(canvasEl);
                    const ctx2d = originalGetContext('2d') as CanvasRenderingContext2D | null;
                    if (ctx2d) {
                        const origSetTransform = ctx2d.setTransform.bind(ctx2d);
                        (ctx2d as any).__origSetTransform = origSetTransform;
                        ctx2d.setTransform = function (a: any, b?: any, c?: any, d?: any, e?: any, f?: any) {
                            if (typeof a === 'number' && typeof d === 'number' && typeof e === 'number' && typeof f === 'number') {
                                // Jika a !== 1.0 atau e !== 0 atau f !== 0 (bukan reset transform untuk clearRect)
                                if (a > 0.05 && b === 0 && c === 0) {
                                    const prevCam = (window as any).__neosantara_map_camera;
                                    const changed = !prevCam || prevCam.scale !== a || prevCam.offsetX !== e || prevCam.offsetY !== f;
                                    (window as any).__neosantara_map_camera = {
                                        scale: a,
                                        offsetX: e,
                                        offsetY: f,
                                        time: performance.now(),
                                    };
                                    if (changed && !(window as any).__neosantara_cam_notify) {
                                        (window as any).__neosantara_cam_notify = true;
                                        queueMicrotask(() => {
                                            (window as any).__neosantara_cam_notify = false;
                                            window.dispatchEvent(new Event('neosantara_map_camera'));
                                        });
                                    }
                                }
                            }
                            return origSetTransform.apply(this, arguments as any);
                        };
                    }
                }

                const allMapCities = [...CAPITALS_DATA, ...(MAJOR_CITIES_DATA as typeof CAPITALS_DATA)];
                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    allMapCities
                );
                set_map_horizontal_wrap(true);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());
                const initialCityOwners = (window as Window & {
                    neosantara_city_owner?: CityOwnerStore;
                }).neosantara_city_owner || {};
                wasmModule.set_city_ownership_on_map(Object.values(initialCityOwners));

                // Muat batas provinsi putus-putus ke dalam map engine secara asynchronous
                fetch(`/provinces_lines.geojson?v=${Date.now()}`)
                    .then(res => res.ok ? res.text() : null)
                    .then(provText => {
                        if (provText && wasmModule.set_provinces_on_map) {
                            wasmModule.set_provinces_on_map(provText);
                        }
                    })
                    .catch(err => console.warn('Pemuatan garis provinsi notice:', err));

                syncFeatureColors();
                
                // Sinkronkan setting tampilan peta awal ke engine
                const initialMapSettings = getMapDisplaySettings();
                wasmModule.set_show_province_borders_on_map?.(initialMapSettings.showProvinceBorders);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories(initialMapSettings));

                // Listener ketika user mengubah preferensi tampilan peta
                const handleMapSettingsChange = (e: Event) => {
                    const nextSettings = (e as CustomEvent)?.detail as MapDisplaySettings;
                    if (!nextSettings) return;
                    wasmModule.set_show_province_borders_on_map?.(nextSettings.showProvinceBorders);
                    wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories(nextSettings));
                };
                window.addEventListener('neosantara_map_settings_changed', handleMapSettingsChange);

                window.addEventListener('map_feature_colors_dirty', scheduleFeatureColorSync);
                window.addEventListener('map_territory_color_updated', scheduleFeatureColorSync);
                window.addEventListener('neosantara:map-pan-ended', resumeFeatureColorSync);
                window.addEventListener('neosantara:time-controller-idle', resumeFeatureColorSync);

                // Highlight and center player country if present
                if (typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    const countryParam = params.get('country');
                    if (countryParam) {
                        const chosen = COUNTRIES_DATA.find(
                            c => c.country.toLowerCase() === countryParam.toLowerCase()
                        );
                        if (chosen) {
                            // Delay slightly to ensure map engine is initialized and ready to render
                            setTimeout(() => {
                                try {
                                    set_selected_country_on_map(chosen.iso, true);
                                } catch (err) {
                                    console.error("Failed to highlight player country:", err);
                                }
                            }, 100);
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to start map engine:", e);
            }
        };
        void initMap();
    }, []);

    const mapClickContextRef = useRef({ interactionDisabled: false, playerCountryName: '', isSelectingIcbmTarget: false });
    mapClickContextRef.current = {
        interactionDisabled: isMapInteractionDisabled,
        playerCountryName: selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || '',
        isSelectingIcbmTarget,
    };

    const handleCanvasCountryClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        if (mapClickContextRef.current.interactionDisabled) return;

        // Only open modal if it was a click (not a drag)
        if (isDraggingRef.current) {
            isDraggingRef.current = false;
            return;
        }

        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // JIKA SEDANG DALAM MODE PEMILIHAN TEMPAT ICBM:
        if (mapClickContextRef.current.isSelectingIcbmTarget) {
            try {
                const wasmModule = wasmModuleRef.current;
                const clickedCountry = wasmModule?.get_country_at_on_map?.(x, y);
                const countryName = clickedCountry?.selected_city_owner || clickedCountry?.country || clickedCountry?.name || clickedCountry?.country_name || "Perairan Samudra";

                // Kirim event pemilihan target ICBM ke modal
                window.dispatchEvent(
                    new CustomEvent('icbm_target_selected', {
                        detail: {
                            locationName: countryName,
                            x,
                            y,
                        },
                    })
                );
                setIsSelectingIcbmTarget(false);
                return;
            } catch (err) {
                console.error("Error choosing ICBM target:", err);
            }
        }

        try {
            const wasmModule = wasmModuleRef.current;
            const clickedCountry = wasmModule?.get_country_at_on_map?.(x, y);
            const countryName = clickedCountry?.selected_city_owner || clickedCountry?.country || clickedCountry?.name || clickedCountry?.country_name;

            if (!countryName) return;

            const playerCountryName = mapClickContextRef.current.playerCountryName;

            // Kota hasil taklukan: buka detail kota asal (mis. Erdenet/Mongolia) dengan penguasa baru,
            // bukan detail negara penguasa, agar nama kota tetap dan bendera mengikuti penguasa.
            const clickedCityId: string | undefined = clickedCountry?.selected_city_id;
            const capturedCity = clickedCityId
                ? ((window as Window & { neosantara_city_owner?: CityOwnerStore }).neosantara_city_owner || {})[clickedCityId]
                : undefined;
            if (capturedCity) {
                const originalCountry = COUNTRIES_DATA.find(
                    country => country.iso.toLowerCase() === capturedCity.countryIso.toLowerCase()
                )?.country;
                console.info('[CityAnnexation][6-click] Captured city clicked', {
                    cityId: clickedCityId,
                    owner: capturedCity.ownerCountry,
                    originalCountry,
                });
                if (originalCountry && normalizeMapKey(originalCountry) !== normalizeMapKey(capturedCity.ownerCountry)) {
                    setCountryDetailModalName(originalCountry);
                    setCountryDetailModalCity(capturedCity.cityName);
                    setCountryDetailModalCityId(capturedCity.cityId);
                    setAiConstructionNavigation(null);
                    setCountryDetailModalOpen(true);
                    return;
                }
            }
            const isPlayer = playerCountryName && countryName.toLowerCase().trim() === playerCountryName.toLowerCase().trim();

            if (isPlayer) {
                setPlayerDetailModalOpen(true);
            } else {
                const clickedCity = clickedCountry?.selected_city || clickedCountry?.capital || null;
                setCountryDetailModalName(countryName);
                setCountryDetailModalCity(clickedCity);
                setCountryDetailModalCityId(clickedCountry?.selected_city_id || null);
                setAiConstructionNavigation(null);
                setCountryDetailModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to read clicked country from map:', error);
        }
    }, []);

    const signalMapPanEnded = useCallback(() => {
        if (typeof window === 'undefined') return;
        (window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active = false;
        window.dispatchEvent(new Event('neosantara:map-pan-ended'));
    }, []);

    const handleCanvasPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (
            mapClickContextRef.current.interactionDisabled ||
            !event.isPrimary ||
            (event.button !== 0 && event.button !== 2)
        ) return;
        isMapPointerDownRef.current = true;
        window.dispatchEvent(new Event('neosantara:map-pan-started'));
        if (dateCommitTimerRef.current !== null) {
            clearTimeout(dateCommitTimerRef.current);
            dateCommitTimerRef.current = null;
        }
        (window as Window & { neosantara_map_pan_active?: boolean }).neosantara_map_pan_active = true;
        markMapInteraction();
        dragStartRef.current = { x: event.clientX, y: event.clientY };
        isDraggingRef.current = false;
    }, [markMapInteraction]);

    const handleCanvasPointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (mapClickContextRef.current.interactionDisabled) return;
        if (!isMapPointerDownRef.current || event.buttons === 0 || isDraggingRef.current) return;
        const dx = Math.abs(event.clientX - dragStartRef.current.x);
        const dy = Math.abs(event.clientY - dragStartRef.current.y);
        // Ignore click handling once the pointer has moved far enough to pan.
        if (dx > 5 || dy > 5) {
            isDraggingRef.current = true;
            isMapFocusedRef.current = false;
        }
    }, []);

    const finishMapPointerInteraction = useCallback(() => {
        if (!isMapPointerDownRef.current) return;
        isMapPointerDownRef.current = false;
        signalMapPanEnded();
        lastMapInteractionAtRef.current = Date.now();
        schedulePendingDateCommit();
    }, [schedulePendingDateCommit, signalMapPanEnded]);

    useEffect(() => {
        window.addEventListener('pointerup', finishMapPointerInteraction);
        window.addEventListener('pointercancel', finishMapPointerInteraction);
        return () => {
            window.removeEventListener('pointerup', finishMapPointerInteraction);
            window.removeEventListener('pointercancel', finishMapPointerInteraction);
        };
    }, [finishMapPointerInteraction]);

    const handleCanvasPointerUp = useCallback(() => {
        finishMapPointerInteraction();
    }, [finishMapPointerInteraction]);

    const handleCanvasPointerLeave = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isMapPointerDownRef.current) return;
        if (event.buttons !== 0) return;
        finishMapPointerInteraction();
    }, [finishMapPointerInteraction]);

    const handleCanvasWheel = useCallback(() => {
        markMapInteraction();
        schedulePendingDateCommit();
    }, [markMapInteraction, schedulePendingDateCommit]);

    const handleCanvasContextMenu = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
        event.preventDefault();
    }, []);

    const executeAparatOption = (
        targetNotif: DemonstrasiNotification | null,
        selectedOption: DetailOpsiBubarkan,
        onReport?: (report: {
            title: string;
            message: string;
            type: 'success' | 'error' | 'info';
            casualties?: number;
            deadCount?: number;
            injuredCount?: number;
            remainingMassa?: number;
            actionName?: string;
        }) => void,
    ) => {
        const showReport = (report: {
            title: string;
            message: string;
            type: 'success' | 'error' | 'info';
            casualties?: number;
            deadCount?: number;
            injuredCount?: number;
            remainingMassa?: number;
            actionName?: string;
        }) => {
            if (onReport) {
                onReport(report);
            } else {
                setHasilBubarkanState({ isOpen: true, ...report });
            }
        };

        if (!targetNotif) {
            showReport({
                title: 'Demonstrasi Tidak Ditemukan',
                message: 'Tidak ada demonstrasi aktif yang dapat dibubarkan.',
                type: 'error',
            });
            return;
        }

        const currentBudget = Number(countryDetail?.anggaran || 0);
        const currentTingkatKeamanan = Number(countryDetail?.tingkat_keamanan || 50);
        const currentPopulasi = Number(countryDetail?.jumlah_penduduk || countryDetail?.populasi || 50000000);
        const playerCountry = String(countryDetail?.country || countryDetail?.nama_negara || countryDetail?.nama || 'Indonesia');

        const op = executeAparatOperation({
            notification: targetNotif,
            currentBudget,
            tingkatKeamanan: currentTingkatKeamanan,
            populasi: currentPopulasi,
            currentDateStr: simulationDateString,
            playerCountry,
            selectedOption,
        });

        if (!op.canProceed || !op.result) {
            showReport({
                title: 'Anggaran Tidak Cukup',
                message: op.errorMessage || 'Anggaran tidak mencukupi.',
                type: 'error',
                actionName: selectedOption.title,
            });
            return;
        }

        const res = op.result;

        setCountryDetail((prev: Record<string, unknown> | null) => {
            if (!prev) return prev;
            const prevPop = Number(prev.jumlah_penduduk || prev.populasi || currentPopulasi);
            const nextPop = Math.max(0, prevPop - res.casualties);
            const prevKepuasan = Number(prev.kepuasan || prev.kepuasan_masyarakat || 50);
            const nextKepuasan = Math.max(0, prevKepuasan - res.kepuasanPenalty);

            return {
                ...prev,
                anggaran: Math.max(0, currentBudget - res.cost),
                jumlah_penduduk: nextPop,
                populasi: nextPop,
                kepuasan: nextKepuasan,
                kepuasan_masyarakat: nextKepuasan,
                ham_violation_count: (Number(prev.ham_violation_count) || 0) + 1,
                pending_notifications: [
                    ...res.extraNotifications,
                    ...(Array.isArray(prev.pending_notifications) ? prev.pending_notifications : []),
                ],
            };
        });

        setPresidentRating((prev: number) => Math.max(0, prev - res.ratingPenalty));

        if (res.affectedCountries.length > 0) {
            res.affectedCountries.forEach((country) => {
                setRelationModifier(playerCountry, country, -20);
            });
        }

        setNotifications((prev) => {
            const updated = prev.map((notification) =>
                notification.id === targetNotif.id
                    ? { ...notification, ...(res.updatedNotification || {}), isHandled: true }
                    : notification
            );
            return [...res.extraNotifications, ...updated];
        });

        showReport({
            title: res.resultModal.title,
            message: res.resultModal.message,
            type: res.resultModal.type,
            casualties: res.casualties,
            deadCount: res.deadCount,
            injuredCount: res.injuredCount,
            remainingMassa: res.updatedNotification?.demonstratorCount,
            actionName: selectedOption.title,
        });
    };

    return (
        <main className="fixed inset-0 bg-[#070b14] overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_0%,transparent_100%)] pointer-events-none" />

            {/* Status Bar / Navbar */}
            {!isDialogTerbukaOpen && (
                <>
                    <Navbar
                        selectedCountry={selectedCountry}
                        countryDetail={countryDetail}
                        metadata={metadata}
                        netBalanceAdjustment={playerNetBalanceAdjustment}
                        currentDate={currentDate}
                        presidentRating={presidentRating}
                        kesejahteraan={countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : kesejahteraan}
                        onOpenGameMenu={openGameMenu}
                        onOpenSaveModal={openSaveModal}
                        onOpenRestartConfirm={() => setIsRestartConfirmOpen(true)}
                        onOpenKepuasan={() => setActiveMenu("Dashboard:Kepuasan")}
                        onOpenKesejahteraan={() => {
                            setKesejahteraanDeepLink(true);
                            setActiveMenu("Dashboard:Populasi:Overview");
                        }}
                        onOpenPopulasi={() => {
                            setKesejahteraanDeepLink(false);
                            setActiveMenu("Dashboard:Populasi:Overview");
                        }}
                    />
                    {/* Top Left Icon - Inbox */}
                    <TopLeftIcon
                        userCountryName={String(
                            countryDetail?.country ||
                            countryDetail?.nama_negara ||
                            countryDetail?.name_id ||
                            countryDetail?.name_en ||
                            selectedCountry?.country ||
                            'Indonesia'
                        )}
                onClick={() => {
                    setCountryDetailModalOpen(false);
                    openInbox();
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                    // Mark all notifications as read when opening inbox
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
                isOpen={inboxModalOpen}
                isWarAnalysisActive={isWarAnalysisActive}
                onClose={() => setInboxModalOpen(false)}
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                onCrackdownClick={(notif) => {
                    const incident = notif.provinceIncident;
                    if (!incident || incident.handled) return;

                    const targetCountry = incident.targetCountry;
                    const normalizedTarget = targetCountry.toLowerCase().trim();
                    const referendums = countryDetail?.provinceReferendums;
                    const referendumEntry = referendums && typeof referendums === 'object'
                        ? Object.keys(referendums).find(name => name.toLowerCase().trim() === normalizedTarget)
                        : undefined;
                    const currentReferendum = referendumEntry
                        ? (referendums as Record<string, ProvinceReferendum>)[referendumEntry]
                        : undefined;
                    if (incident.kind === 'referendum' && currentReferendum?.status !== 'pending') {
                        setNotifications(previous => previous.map(item => item.id === notif.id
                            ? { ...item, provinceIncident: { ...incident, handled: true } }
                            : item
                        ));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Referendum Tidak Lagi Berlangsung',
                            message: `Referendum ${targetCountry} sudah selesai atau tidak lagi aktif. Tidak ada tindakan yang dilakukan.`,
                            type: 'info',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    const provinceData = annexedContributionRef.current[normalizedTarget]?.targetData;
                    const provincePopulation = Number(provinceData?.jumlah_penduduk || provinceData?.populasi || 0);
                    const maximumCasualties = provincePopulation > 0
                        ? Math.max(1, Math.min(200, Math.floor(provincePopulation * 0.0005)))
                        : 200;
                    const casualties = Math.min(10 + Math.floor(Math.random() * 191), maximumCasualties);
                    const contribution = annexedContributionRef.current[normalizedTarget];
                    if (contribution && provincePopulation > 0) {
                        const remainingProvincePopulation = Math.max(0, provincePopulation - casualties);
                        annexedContributionRef.current[normalizedTarget] = {
                            ...contribution,
                            targetData: {
                                ...contribution.targetData,
                                jumlah_penduduk: remainingProvincePopulation,
                                populasi: remainingProvincePopulation
                            }
                        };
                    }
                    const tensionIncrease = 10 + Math.floor(Math.random() * 16);
                    const existingTensions = countryDetail?.provinceTensions;
                    const tensionEntry = existingTensions && typeof existingTensions === 'object'
                        ? Object.keys(existingTensions).find(name => name.toLowerCase().trim() === normalizedTarget)
                        : undefined;
                    const currentTension = Number(tensionEntry ? (existingTensions as Record<string, unknown>)[tensionEntry] : 25);
                    const nextTension = Math.min(100, (Number.isFinite(currentTension) ? currentTension : 25) + tensionIncrease);
                    const startedReferendum = nextTension >= 100 && currentReferendum?.status !== 'pending';
                    const newReferendum = startedReferendum ? createProvinceReferendum(currentDate) : null;

                    setCountryDetail((previous: Record<string, unknown> | null) => {
                        if (!previous) return previous;
                        const tensions = previous.provinceTensions && typeof previous.provinceTensions === 'object'
                            ? previous.provinceTensions as Record<string, unknown>
                            : {};
                        const savedTensionEntry = Object.keys(tensions).find(name => name.toLowerCase().trim() === normalizedTarget) || targetCountry;
                        const savedTension = Number(tensions[savedTensionEntry]);
                        const updatedTension = Math.min(100, (Number.isFinite(savedTension) ? savedTension : 25) + tensionIncrease);
                        const savedReferendums = previous.provinceReferendums && typeof previous.provinceReferendums === 'object'
                            ? previous.provinceReferendums as Record<string, ProvinceReferendum>
                            : {};
                        const savedReferendumEntry = Object.keys(savedReferendums).find(name => name.toLowerCase().trim() === normalizedTarget);
                        const nextReferendums = { ...savedReferendums };
                        if (savedReferendumEntry && savedReferendums[savedReferendumEntry].status === 'pending') {
                            nextReferendums[savedReferendumEntry] = {
                                ...savedReferendums[savedReferendumEntry],
                                crackdownIncidents: (savedReferendums[savedReferendumEntry].crackdownIncidents || 0) + 1
                            };
                        } else if (newReferendum) {
                            nextReferendums[targetCountry] = { ...newReferendum, crackdownIncidents: 1 };
                        }
                        const rawPopulation = previous.jumlah_penduduk ?? previous.populasi;
                        const previousPopulation = Number(rawPopulation);
                        const hasPopulationTotal = Number.isFinite(previousPopulation) && previousPopulation > 0;
                        const remainingPopulation = hasPopulationTotal ? Math.max(0, previousPopulation - casualties) : previousPopulation;
                        const previousCasualties = previous.provinceCasualties && typeof previous.provinceCasualties === 'object'
                            ? previous.provinceCasualties as Record<string, number>
                            : {};
                        const casualtyEntry = Object.keys(previousCasualties).find(name => name.toLowerCase().trim() === normalizedTarget) || targetCountry;

                        return {
                            ...previous,
                            ...(hasPopulationTotal ? {
                                jumlah_penduduk: remainingPopulation,
                                populasi: remainingPopulation
                            } : {}),
                            provinceTensions: { ...tensions, [savedTensionEntry]: updatedTension },
                            provinceReferendums: nextReferendums,
                            provinceCasualties: {
                                ...previousCasualties,
                                [casualtyEntry]: (previousCasualties[casualtyEntry] || 0) + casualties
                            }
                        };
                    });
                    setNotifications(previous => previous.map(item => item.id === notif.id
                        ? {
                            ...item,
                            message: `${item.message} Pasukan membubarkan massa dengan kekerasan: ${casualties.toLocaleString('id-ID', { maximumFractionDigits: 2 })} korban jiwa tercatat dan ketegangan naik ${tensionIncrease} poin menjadi ${nextTension}/100.`,
                            provinceIncident: { ...incident, handled: true }
                        }
                        : item
                    ));
                    setInboxModalOpen(false);
                    setResultModal({
                        isOpen: true,
                        title: 'Massa Dibubarkan dengan Kekerasan',
                        message: `Operasi di ${targetCountry} menyebabkan ${casualties.toLocaleString('id-ID', { maximumFractionDigits: 2 })} korban jiwa. Ketegangan naik ${tensionIncrease} poin menjadi ${nextTension}/100.${currentReferendum?.status === 'pending'
                            ? ' Penindakan ini memperkuat dukungan kemerdekaan dalam referendum yang sedang berlangsung.'
                            : startedReferendum
                                ? ` Ketegangan mencapai 100; referendum kemerdekaan dimulai dan berlangsung hingga ${newReferendum?.votingEndsAt}.`
                                : ''}`,
                        type: 'error',
                        persistent: true,
                        // modal decoupled
                    });
                    if (startedReferendum && newReferendum) {
                        window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, {
                            detail: {
                                actionId: 'referendum_dimulai',
                                actionLabel: 'Referendum Kemerdekaan',
                                targetCountry,
                                occupyingCountry: countryDetail?.country || countryDetail?.nama || 'Negara Pemain',
                                actionSucceeded: true,
                                actionMessage: `Setelah pembubaran massa yang menelan korban jiwa, ketegangan ${targetCountry} mencapai 100. Referendum kemerdekaan dimulai hingga ${newReferendum.votingEndsAt}.`,
                                provinceIncident: { kind: 'referendum', targetCountry }
                            } satisfies ProvinceActionEventDetail
                        }));
                    }
                }}
                onActionClick={(notif, actionType) => {
                    const tNotif = notif as any;

                    // Intersep aksi demonstrasi rakyat jika ada
                    if (tNotif.tradeType === 'demonstrasi_rakyat') {
                        if (actionType === 'hard_power') {
                            setInboxModalOpen(false);
                            setAparatConfirmState({
                                isOpen: true,
                                notification: tNotif,
                            });
                            return;
                        } else if (actionType === 'dialog') {
                            sessionStorage.setItem('dialog-terbuka-notification', JSON.stringify({ selected: tNotif, notifications: notifications.filter((item: any) => item.tradeType === 'demonstrasi_rakyat') }));
                            const result = startDialogTerbuka(tNotif);
                            setInboxModalOpen(false);
                            const updatedNotifications = result.updatedNotification
                                ? notifications.map(notification =>
                                    notification.id === notif.id
                                        ? { ...notification, ...result.updatedNotification }
                                        : notification
                                )
                                : notifications;
                            if (result.updatedNotification) {
                                setNotifications(updatedNotifications);
                            }
                            setActiveMenu('Peta Taktis');

                            // Pause waktu simulasi persis seperti sistem perang
                            if (!dialogPauseStateRef.current) {
                                dialogPauseStateRef.current = { wasPaused: isPausedRef.current };
                            }
                            setIsPaused(true);
                            if (timeManagerRef.current) {
                                timeManagerRef.current.setPaused(true);
                            }

                            // Buka overlay dialog terbuka in-page (tanpa unmount map-system)
                            setIsDialogTerbukaOpen(true);
                            return;
                        } else if (actionType === 'fulfill') {
                            const result = executePenuhiTuntutan(tNotif);
                            setPresidentRating((prev: number) => Math.min(100, prev + result.presidentRatingBonus));
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, ...(result.updatedNotification || {}), isHandled: true } : n));
                            setInboxModalOpen(false);
                            setActiveMenu(result.targetMenuId);
                            return;
                        } else if (actionType === 'ignore') {
                            const result = executeAbaikanDemo(tNotif);
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, ...(result.updatedNotification || {}) } : n));
                            setInboxModalOpen(false);
                            return;
                        }
                    }

                    // Intersep jika ini tawaran transaksi dagang AI
                    if (
                        (tNotif.tradeType === 'jual' || tNotif.tradeType === 'beli') &&
                        isTradeEmbargoActive(countryDetail?.country || countryDetail?.nama_negara || '', tNotif.partnerName || '')
                    ) {
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Diblokir oleh Embargo PBB',
                            message: `Perdagangan dengan ${tNotif.partnerName || 'negara terkait'} tidak dapat dilakukan selama embargo ekonomi PBB masih berlaku.`,
                            type: 'error',
                            persistent: true,
                            // modal decoupled
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        return;
                    }

                    if (tNotif.tradeType === 'jual') {
                        // ✅ CHECK 1: Apakah negara terisolasi karena sistem ekonomi tertutup (skor sentralisasi >= 85)?
                        const userTradeAccess = calculateTradeAccess(
                            getAverageNationalization(countryDetail?.sector_nationalization),
                            String(countryDetail?.ideology || ''),
                            String(countryDetail?.religion || '')
                        );
                        if (userTradeAccess.status === 'diblokir' || !userTradeAccess.canSell) {
                            setInboxModalOpen(false);
                            setClosedTradeRejectionState({
                                isOpen: true,
                                partnerCountry: tNotif.partnerName || 'Mitra Dagang',
                                centralizationScore: userTradeAccess.centralizationScore,
                                averageNationalization: userTradeAccess.averageNationalization,
                                ideologyModifier: userTradeAccess.ideologyModifier,
                                religionModifier: userTradeAccess.religionModifier,
                                reasons: userTradeAccess.reason,
                            });
                            return;
                        }

                        // ✅ CHECK 2: EKONOMI TERBUKA?
                        const { isAllowed, reason, ekonomiNegara } = canAcceptTradeDeal(countryDetail);
                        if (!isAllowed) {
                            setInboxModalOpen(false);
                            setTradeRejectionState({
                                isOpen: true,
                                partnerCountry: tNotif.partnerName || 'Mitra Dagang',
                                tradeType: 'jual',
                                reason: reason as any,
                                ekonomiNegara,
                            });
                            return;
                        }

                        // AI Ingin Membeli Produk User (Jual): Tambah Kas, Kurangi Stok User
                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        if (myStock < tNotif.quantity) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Menyelesaikan Ekspor',
                                message: `Stok ${tNotif.productKey} Anda tidak mencukupi (${myStock} unit dari ${tNotif.quantity} unit yang dibutuhkan).`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        const budget = Number(countryDetail?.anggaran || 0);
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        if (tNotif.partnerName) {
                            setRelationModifier(playerCountryName, tNotif.partnerName, 5);
                        }
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget + tNotif.totalPrice,
                            [tNotif.productKey]: myStock - tNotif.quantity,
                            [`total_sold_${tNotif.productKey}`]: Number(prev?.[`total_sold_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Ekspor Berhasil',
                            message: `Berhasil mengekspor ${tNotif.quantity} unit ${tNotif.productKey} ke ${tNotif.partnerName} senilai +${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO! Hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        return;
                    }

                    if (tNotif.tradeType === 'beli') {
                        // ✅ CHECK 1: Apakah negara terisolasi karena sistem ekonomi tertutup (skor sentralisasi >= 85 atau canBuy false)?
                        const userTradeAccess = calculateTradeAccess(
                            getAverageNationalization(countryDetail?.sector_nationalization),
                            String(countryDetail?.ideology || ''),
                            String(countryDetail?.religion || '')
                        );
                        if (userTradeAccess.status === 'diblokir' || !userTradeAccess.canBuy) {
                            setInboxModalOpen(false);
                            setClosedTradeRejectionState({
                                isOpen: true,
                                partnerCountry: tNotif.partnerName || 'Mitra Dagang',
                                centralizationScore: userTradeAccess.centralizationScore,
                                averageNationalization: userTradeAccess.averageNationalization,
                                ideologyModifier: userTradeAccess.ideologyModifier,
                                religionModifier: userTradeAccess.religionModifier,
                                reasons: userTradeAccess.reason,
                            });
                            return;
                        }

                        // ✅ CHECK 2: EKONOMI TERBUKA?
                        const { isAllowed, reason, ekonomiNegara } = canAcceptTradeDeal(countryDetail);
                        if (!isAllowed) {
                            setInboxModalOpen(false);
                            setTradeRejectionState({
                                isOpen: true,
                                partnerCountry: tNotif.partnerName || 'Mitra Dagang',
                                tradeType: 'beli',
                                reason: reason as any,
                                ekonomiNegara,
                            });
                            return;
                        }

                        // AI Menjual ke User (Beli): Kurangi Kas, Tambah Stok User
                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < tNotif.totalPrice) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Menyelesaikan Impor',
                                message: `Anggaran negara tidak mencukupi untuk melakukan impor ini. (${budget.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO tersedia dari ${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO).`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        if (tNotif.partnerName) {
                            setRelationModifier(playerCountryName, tNotif.partnerName, 5);
                        }
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - tNotif.totalPrice,
                            [tNotif.productKey]: myStock + tNotif.quantity,
                            [`total_bought_${tNotif.productKey}`]: Number(prev?.[`total_bought_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Impor Berhasil',
                            message: `Berhasil mengimpor ${tNotif.quantity} unit ${tNotif.productKey} dari ${tNotif.partnerName} senilai -${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO! Hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_kedutaan_besar') {
                        const partner = tNotif.partnerCountry;
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        if (partner) {
                            setRelationModifier(playerCountryName, partner, 5);
                        }
                        // Buka Detail Negara mitra dan otomatis munculkan modal konfirmasi bangun kedutaan
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        setAutoBuildEmbassyState(true);
                        setCountryDetailModalName(partner);
                        setCountryDetailModalOpen(true);
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_hubungan_dagang') {
                        const partner = tNotif.partnerCountry;
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';

                        // ✅ CHECK: Apakah negara menganut sistem tertutup (skor sentralisasi >= 85)?
                        const userTradeAccess = calculateTradeAccess(
                            getAverageNationalization(countryDetail?.sector_nationalization),
                            String(countryDetail?.ideology || ''),
                            String(countryDetail?.religion || '')
                        );
                        if (userTradeAccess.status === 'diblokir') {
                            setInboxModalOpen(false);
                            setClosedTradeRejectionState({
                                isOpen: true,
                                partnerCountry: partner || 'Mitra Dagang',
                                centralizationScore: userTradeAccess.centralizationScore,
                                averageNationalization: userTradeAccess.averageNationalization,
                                ideologyModifier: userTradeAccess.ideologyModifier,
                                religionModifier: userTradeAccess.religionModifier,
                                reasons: userTradeAccess.reason,
                            });
                            return;
                        }

                        if (isTradeEmbargoActive(playerCountryName, partner)) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Ratifikasi Diblokir oleh Embargo PBB',
                                message: `Perjanjian dagang dengan ${partner} tidak dapat diratifikasi selama embargo ekonomi PBB masih berlaku.`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }
                        const playerEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
                        const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
                        const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

                        const hasEmbassy = playerHasEmbassyOrTradePartners(partner, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
                        if (!hasEmbassy) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Ratifikasi Perjanjian Dagang Gagal',
                                message: `Gagal meratifikasi Perjanjian Hubungan Dagang! Anda belum membangun Kedutaan Besar di ${partner}. Bangun Kedutaan Besar terlebih dahulu di menu Detail Negara ${partner}.`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        if (partner) {
                            setRelationModifier(playerCountryName, partner, 5);
                        }
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            addedTradePartners: Array.from(new Set([...(prev?.addedTradePartners || []), partner]))
                        }));
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'accepted' } : n));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Perjanjian Hubungan Dagang Resmi',
                            message: `Berhasil meratifikasi Perjanjian Hubungan Dagang bilateral dengan ${partner}! Sektor perdagangan aktif dibuka dan hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_pakta_non_agresi') {
                        const partner = tNotif.partnerCountry;
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        const playerEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
                        const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
                        const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

                        const hasEmbassy = playerHasEmbassyOrTradePartners(partner, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
                        if (!hasEmbassy) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Ratifikasi Pakta Non-Agresi Gagal',
                                message: `Gagal meratifikasi Pakta Non-Agresi! Anda belum membangun Kedutaan Besar di ${partner}. Bangun Kedutaan Besar terlebih dahulu di menu Detail Negara ${partner}.`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        if (partner) {
                            setRelationModifier(playerCountryName, partner, 5);
                        }
                        setCountryDetail((prev: Record<string, unknown> | null) => {
                            const history = Array.isArray(prev?.nonAggressionPactHistory)
                                ? prev.nonAggressionPactHistory as NonAggressionPactPeriod[]
                                : [];
                            const country = String(prev?.country || prev?.nama_negara || prev?.name || playerCountryName);
                            const pacts = Array.isArray(prev?.nonAggressionPacts)
                                ? prev.nonAggressionPacts.filter((activePartner): activePartner is string => typeof activePartner === 'string')
                                : [];
                            const hasActiveHistory = history.some(period =>
                                String(period.country || '').toLowerCase().trim() === String(country).toLowerCase().trim() &&
                                String(period.partner || '').toLowerCase().trim() === partner.toLowerCase().trim() &&
                                !period.endDate
                            );
                            return {
                                ...(prev || {}),
                                nonAggressionPacts: Array.from(new Set([...pacts, partner])),
                                nonAggressionPactHistory: hasActiveHistory
                                    ? history
                                    : [...history, { country, partner, startDate: simulationDateString }],
                            };
                        });
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'accepted' } : n));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Pakta Non-Agresi Ratifikasi',
                            message: `Berhasil meratifikasi Pakta Non-Agresi Bilateral dengan ${partner}! Perdamaian wilayah tetap terjaga dan hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_aliansi_pertahanan') {
                        const partner = tNotif.partnerCountry;
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        const playerEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
                        const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
                        const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

                        const hasEmbassy = playerHasEmbassyOrTradePartners(partner, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
                        if (!hasEmbassy) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Pembentukan Aliansi Pertahanan Gagal',
                                message: `Gagal membentuk Aliansi Pertahanan! Anda belum membangun Kedutaan Besar di ${partner}. Bangun Kedutaan Besar terlebih dahulu di menu Detail Negara ${partner}.`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        if (partner) {
                            setRelationModifier(playerCountryName, partner, 5);
                        }
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            defenseAlliances: Array.from(new Set([...(prev?.defenseAlliances || []), partner]))
                        }));
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'accepted' } : n));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Aliansi Pertahanan Dibentuk',
                            message: `Berhasil membentuk Aliansi Pertahanan Militer Bersama dengan ${partner}! Bantuan pertahanan dijamin dan hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_kontrak_penelitian') {
                        const partner = tNotif.partnerCountry;
                        const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                        const playerEmbassies = Array.isArray(countryDetail?.embassies) ? countryDetail.embassies : [];
                        const removedEmbassies = Array.isArray(countryDetail?.removedEmbassies) ? countryDetail.removedEmbassies : [];
                        const removedTradePartners = Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [];

                        const hasEmbassy = playerHasEmbassyOrTradePartners(partner, playerCountryName, playerEmbassies, removedEmbassies, removedTradePartners);
                        if (!hasEmbassy) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Ratifikasi Kontrak Penelitian Gagal',
                                message: `Gagal meratifikasi Kontrak Penelitian Joint-R&D! Anda belum membangun Kedutaan Besar di ${partner}. Bangun Kedutaan Besar terlebih dahulu di menu Detail Negara ${partner}.`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        if (partner) {
                            setRelationModifier(playerCountryName, partner, 5);
                        }
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            researchContracts: Array.from(new Set([...(prev?.researchContracts || []), partner]))
                        }));
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'accepted' } : n));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Kontrak Penelitian Joint-R&D',
                            message: `Berhasil meratifikasi Kontrak Penelitian Joint-R&D dengan ${partner}! Durasi seluruh penelitian nasional berkurang 0,1% per negara mitra dan hubungan bilateral meningkat +5 poin.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'hubungan_panas') {
                        const partner = tNotif.partnerCountry;
                        setInboxModalOpen(false);
                        setCountryDetailModalName(partner);
                        setCountryDetailModalOpen(true);
                        return;
                    }

                    if (tNotif.tradeType === 'usulan_resolusi_pbb' || tNotif.tradeType === 'usulan_keamanan_pbb') {
                        setInboxModalOpen(false);
                        setActiveMenu("Menu:PBB");
                        return;
                    }

                    if (
                        tNotif.tradeType === 'program_nuklir_dimulai' ||
                        tNotif.tradeType === 'program_nuklir_selesai' ||
                        tNotif.tradeType === 'ujicoba_nuklir'
                    ) {
                        setInboxModalOpen(false);
                        setActiveMenu("Pertahanan");
                        return;
                    }

                    // ── LOGIKA KHUSUS PEMBERONTAKAN ──
                    if (tNotif.tradeType === 'pemberontakan') {
                        // Ambil biaya dari notifikasi (gambar menunjukkan 25000 EM)
                        const cost = Number(tNotif.responseCost ?? tNotif.bantuanCost ?? 25000);
                        const budget = Number(countryDetail?.anggaran || 0);

                        // Cek apakah anggaran cukup
                        if (budget < cost) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Mengirim Pasukan',
                                message: `Anggaran negara tidak mencukupi untuk mengirim pasukan pengamanan (Tersedia: ${budget.toLocaleString('id-ID')} NEO, Dibutuhkan: ${cost.toLocaleString('id-ID')} NEO).`,
                                type: 'error',
                                persistent: true,
                            });
                            return;
                        }

                        // 1. Potong anggaran negara
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - cost,
                        }));

                        // 2. Naikkan Peringkat Presiden +2 Poin
                        setPresidentRating((prev: number) => Math.min(100, prev + 2));

                        // 3. Tandai notifikasi sebagai selesai ditangani
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'handled' } : n));

                        // 4. Tampilkan Modal Sukses
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Pemberontakan Berhasil Ditumpas!',
                            message: `Pasukan pengamanan berhasil dikirim dan meredam pemberontakan. Anggaran terpotong sebesar ${cost.toLocaleString('id-ID')} NEO, dan Peringkat Presiden Anda naik +2 poin!`,
                            type: 'success',
                            persistent: true,
                        });
                        return;
                    }

                    // ── LOGIKA NOTIFIKASI PERTAHANAN LAINNYA (Spionase, Sabotase, Diserang, ICBM) ──
                    if (tNotif.tradeType === 'spionase' || tNotif.tradeType === 'sabotase' || tNotif.tradeType === 'diserang' || tNotif.tradeType === 'icbm') {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true } : n));

                        if (tNotif.tradeType === 'diserang' && typeof window !== 'undefined') {
                            const attackerCountry = tNotif.enemyCountry || tNotif.partnerCountry;
                            const targetCountry = countryDetail?.country ||
                                countryDetail?.nama_negara ||
                                countryDetail?.name_id ||
                                countryDetail?.name_en ||
                                selectedCountry?.country;

                            if (typeof attackerCountry !== 'string' || !attackerCountry.trim() ||
                                typeof targetCountry !== 'string' || !targetCountry.trim()) {
                                console.error('[WarAnimation] Attack notification has no valid country names', {
                                    attackerCountry, targetCountry, notification: tNotif,
                                });
                                return;
                            }

                            window.dispatchEvent(new CustomEvent('start_war_animation', {
                                detail: {
                                    attacker: attackerCountry,
                                    target: targetCountry,
                                    targetCountryDetail: countryDetail,
                                }
                            }));
                        }

                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: tNotif.tradeType === 'diserang' ? 'Merespon Serangan Militer' : 'Operasi Pertahanan Berhasil',
                            message: `Operasi penanganan "${tNotif.title}" sukses dilaksanakan oleh divisi pertahanan & intelijen nasional!`,
                            type: 'success',
                            persistent: true,
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'keamanan' || tNotif.tradeType === 'bencana_alam' || tNotif.tradeType === 'wabah_penyakit') {
                        const isPoliceIncident = tNotif.tradeType === 'keamanan' ||
                            (tNotif.tradeType === 'bencana_alam' && tNotif.eventType === 'police');
                        let cost = Number((isPoliceIncident ? tNotif.responseCost : undefined) ?? tNotif.bantuanCost ?? 0);

                        // Format medical cost for wabah_penyakit (remove last 3 digits)
                        if (tNotif.tradeType === 'wabah_penyakit') {
                            cost = Math.floor(cost / 1000);
                        }

                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < cost) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: isPoliceIncident ? 'Operasi Kepolisian Gagal' : 'Gagal Menyalurkan Bantuan',
                                message: `Anggaran negara tidak mencukupi untuk ${isPoliceIncident ? 'mendanai operasi kepolisian' : 'menyalurkan bantuan'} (${budget.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO dari ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO).`,
                                type: 'error',
                                persistent: true,
                                // modal decoupled
                            });
                            return;
                        }

                        const currentPresidentRating = Number(presidentRating ?? countryDetail?.presidentRating ?? 50);
                        const isDisasterOrOutbreak = tNotif.tradeType === 'bencana_alam' || tNotif.tradeType === 'wabah_penyakit';
                        const nextPresidentRating = isDisasterOrOutbreak
                            ? Math.min(100, currentPresidentRating + 5)
                            : isPoliceIncident
                                ? Math.min(100, currentPresidentRating + 2)
                                : currentPresidentRating;

                        if (isDisasterOrOutbreak || isPoliceIncident) {
                            setPresidentRating(nextPresidentRating);
                        }

                        // Restore populasi yang hilang dari outbreak
                        let populationToRestore = 0;
                        if (tNotif.tradeType === 'wabah_penyakit') {
                            // Cari outbreak yang ditangani
                            const activeOutbreak = Array.isArray(countryDetail?.active_outbreaks)
                                ? countryDetail.active_outbreaks.find((o: any) => o.id === notif.id)
                                : null;

                            if (activeOutbreak) {
                                // Restore semua korban yang hilang karena bantuan medis diberikan
                                populationToRestore = activeOutbreak.perkiraanKematian || 0;
                            }
                        }

                        setCountryDetail((prev: any) => {
                            let updatedPrev = {
                                ...prev,
                                anggaran: budget - cost,
                                presidentRating: nextPresidentRating,
                                tingkat_keamanan: isPoliceIncident
                                    ? Math.min(100, Number(prev?.tingkat_keamanan || 0) + 2)
                                    : prev?.tingkat_keamanan,
                                kepuasan_masyarakat: Math.min(100, Number(prev?.kepuasan_masyarakat || 50) + (isPoliceIncident ? 1 : 2)),
                                indeks_kesejahteraan: Math.min(100, Number(prev?.indeks_kesejahteraan || 50) + (isPoliceIncident ? 1 : 2)),
                                active_outbreaks: Array.isArray(prev?.active_outbreaks)
                                    ? prev.active_outbreaks.map((o: any) => o.id === notif.id ? { ...o, isHandled: true } : o)
                                    : prev?.active_outbreaks,
                                active_disaster_effects: Array.isArray(prev?.active_disaster_effects)
                                    ? prev.active_disaster_effects.map((d: any) => d.id === notif.id ? { ...d, isHandled: true } : d)
                                    : prev?.active_disaster_effects,
                            };

                            // Restore populasi - tambahkan kembali semua perkiraanKematian
                            if (populationToRestore > 0 && tNotif.tradeType === 'wabah_penyakit') {
                                updatedPrev.jumlah_penduduk = Number(prev?.jumlah_penduduk || 0) + populationToRestore;
                            }

                            return updatedPrev;
                        });

                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true } : n));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: isPoliceIncident ? 'Operasi Kepolisian Berhasil' : 'Bantuan Darurat Disalurkan',
                            message: isPoliceIncident
                                ? `Operasi kepolisian berhasil didanai sebesar ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO. Peringkat Presiden naik +2 poin, serta tingkat keamanan, kepuasan, dan kesejahteraan meningkat.`
                                : `Berhasil menyalurkan bantuan sebesar ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO! ${populationToRestore > 0 ? `${populationToRestore.toLocaleString('id-ID')} jiwa selamat. ` : ''}Peringkat Presiden naik +5 poin, serta Kepuasan & Kesejahteraan masyarakat meningkat.`,
                            type: 'success',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    // Handle notification action click (secondary/informational actions)
                    if (notif.type === 'kepuasan') {
                        setActiveMenu("Sosial & Budaya");
                    } else if (notif.type === 'peringkat') {
                        setActiveMenu("Sosial & Budaya"); // Pidato kenegaraan / program bantuan
                    } else if (notif.type === 'kesejahteraan') {
                        setKesejahteraanDeepLink(true);
                        setActiveMenu("Dashboard:Populasi:Overview");
                    }
                    setInboxModalOpen(false);
                }}
                onRedirectClick={(notif) => {
                    const tNotif = notif as any;
                    const playerCountryName = countryDetail?.country || countryDetail?.nama_negara || countryDetail?.name || 'Indonesia';
                    const offerPartner = tNotif.partnerCountry || tNotif.partnerName;

                    if (tNotif.tradeType === 'penawaran_pakta_non_agresi' || tNotif.tradeType === 'penawaran_aliansi_pertahanan' || tNotif.tradeType === 'penawaran_kontrak_penelitian') {
                        if (tNotif.isHandled) {
                            setInboxModalOpen(false);
                            setCountryDetailModalName(tNotif.partnerCountry);
                            setCountryDetailModalOpen(true);
                            return;
                        }
                        if (offerPartner) {
                            setRelationModifier(playerCountryName, offerPartner, -2);
                        }
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'rejected' } : n));
                        return;
                    }

                    const internationalOfferTypes = ['jual', 'beli', 'penawaran_kedutaan_besar', 'penawaran_hubungan_dagang'];
                    if (internationalOfferTypes.includes(tNotif.tradeType)) {
                        if (offerPartner) {
                            setRelationModifier(playerCountryName, offerPartner, -2);
                        }
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        return;
                    }

                    if (tNotif.tradeType === 'bencana_alam' || tNotif.tradeType === 'wabah_penyakit') {
                        // Tolak / Abaikan Bencana atau Wabah: Turunkan peringkat presiden 4 poin
                        const currentP = Number(countryDetail?.presidentRating ?? 50);
                        const nextP = Math.max(0, currentP - 4);
                        setPresidentRating(nextP);
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            presidentRating: nextP,
                            active_outbreaks: Array.isArray(prev?.active_outbreaks)
                                ? prev.active_outbreaks.map((o: any) => o.id === notif.id ? { ...o, isRejected: true } : o)
                                : prev?.active_outbreaks,
                            active_disaster_effects: Array.isArray(prev?.active_disaster_effects)
                                ? prev.active_disaster_effects.map((d: any) => d.id === notif.id ? { ...d, isRejected: true } : d)
                                : prev?.active_disaster_effects,
                        }));
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        setResultModal({
                            isOpen: true,
                            title: 'Bantuan Bencana Ditolak',
                            message: `Anda menolak memberikan bantuan untuk penanganan "${tNotif.title}". Peringkat Presiden turun -4 poin akibat respon publik yang negatif.`,
                            type: 'error',
                            persistent: true,
                            // modal decoupled
                        });
                        return;
                    }

                    const otherSpecialNotifTypes = ['keamanan', 'spionase', 'sabotase', 'diserang', 'pemberontakan', 'icbm'];
                    if (otherSpecialNotifTypes.includes(tNotif.tradeType)) {
                        // Tolak / Abaikan Notifikasi: Hapus notifikasi dari feed
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        return;
                    }

                    //  Redirect langsung ke menu yang relevan dengan tab yang tepat
                    if (notif.type === 'kepuasan' || notif.type === 'peringkat') {
                        // → Kepuasan Rakyat, tab "Naikkan Peringkat"
                        setActiveMenu("Action:NaikkanKepuasan");
                    } else if (notif.type === 'kesejahteraan') {
                        // → Indeks Kesejahteraan, tab "Naikkan Kesejahteraan"
                        setKesejahteraanInitialTab("naikkan"); //  Set tab ke Naikkan dulu
                        setKesejahteraanDeepLink(true);
                        setActiveMenu("Dashboard:Populasi:Overview");
                    }
                    setInboxModalOpen(false);
                }}
            />

            {/* Top Right Icons - Gift and News */}
            <TopRightGiftIcon
                onClick={() => {
                    setCountryDetailModalOpen(false);
                    setGiftModalOpen(true);
                    setInboxModalOpen(false);
                    setNewsModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                }}
                isOpen={giftModalOpen}
                onClose={() => setGiftModalOpen(false)}
                canClaimReward={Boolean(countryDetail)}
                onClaimReward={(resourceKey, amount) => {
                    setCountryDetail((previous: Record<string, unknown> | null) => previous
                        ? {
                            ...previous,
                            [`inventory_${resourceKey}`]:
                                (Number(previous[`inventory_${resourceKey}`]) || 0) + amount,
                        }
                        : previous
                    );
                }}
            />
            <TopRightNewsIcon
                onClick={() => {
                    setCountryDetailModalOpen(false);
                    setNewsModalOpen(true);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                }}
                isOpen={newsModalOpen}
                onClose={() => setNewsModalOpen(false)}
                newsList={newsList}
                onClearNews={() => {
                    setNewsList([]);
                    clearPendingAiNews();
                    clearStoredAiNews();
                }}
                onOpenAiConstruction={(news: AiNewsItem) => {
                    const targetCountry = news.countryName;
                    if (!targetCountry) return;
                    const buildingKey = news.buildingKey;
                    const targetTab = news.targetTab || news.indicatorKey;
                    setAiConstructionNavigation({ countryName: targetCountry, buildingKey, targetTab });
                    setCountryDetailModalName(targetCountry);
                    setCountryDetailModalOpen(true);
                    setNewsModalOpen(false);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                }}
                onOpenNewsCountry={(countryName) => {
                    setAiConstructionNavigation(null);
                    setCountryDetailModalName(countryName);
                    setCountryDetailModalOpen(true);
                    setNewsModalOpen(false);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                }}
            />
            <BottomLeftPenelitianIcon
                onClick={() => {
                    setCountryDetailModalOpen(false);
                    setPenelitianModalOpen(true);
                    setMissionModalOpen(false);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setActiveMenu("");
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('reset_penelitian_selection'));
                    }
                }}
                isOpen={penelitianModalOpen}
                onClose={() => setPenelitianModalOpen(false)}
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail}
                currentDate={currentDate}
            />
            <BottomLeftMissionIcon
                onClick={() => {
                    setCountryDetailModalOpen(false);
                    setMissionModalOpen(true);
                    setPenelitianModalOpen(false);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setActiveMenu("");
                }}
                isOpen={missionModalOpen}
                onClose={() => setMissionModalOpen(false)}
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail}
                onStartMission={(destination: MissionNavigationTarget) => {
                    setMissionModalOpen(false);
                    setInboxModalOpen(false);
                    setNewsModalOpen(false);
                    setPenelitianModalOpen(false);

                    if (destination.menuId === 'Menu:Penelitian') {
                        setActiveMenu("");
                        setPenelitianModalOpen(true);
                        window.dispatchEvent(new CustomEvent('reset_penelitian_selection'));
                        return;
                    }

                    if (destination.menuId === 'Menu:Hadiah') {
                        setActiveMenu("");
                        setGiftModalOpen(true);
                        return;
                    }

                    if (destination.productionDeepLink) {
                        setProductionDeepLink(destination.productionDeepLink);
                    }

                    if (destination.tempatUmumTab) {
                        setTempatUmumDeepLink(destination.tempatUmumTab);
                    }

                    if (destination.openWelfareActions) {
                        setKesejahteraanDeepLink(true);
                        setKesejahteraanInitialTab("naikkan");
                    }

                    setActiveMenu(destination.menuId);
                }}
            />

                    {/* Tombol Pintas Fokus ke Negara Sendiri (F) */}
                    <button
                        onClick={handleFocusHome}
                        title="🎯 Fokus & Zoom ke Negara Sendiri (F)"
                        className="fixed bottom-3 lg:bottom-4 xl:bottom-6 2xl:bottom-12 left-18 lg:left-20 xl:left-22 2xl:left-26 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
                    >
                        <Crosshair className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
                    </button>
                </>
            )}


            {activeWarAnimation && (() => {
                const userCountryName = countryDetail?.country || countryDetail?.nama_negara || '';
                const isUserDefender = areSameWarCountry(
                    activeWarAnimation.target,
                    userCountryName,
                    activeWarAnimation.targetCountryDetail?.iso,
                    countryDetail?.iso
                );

                return (
                    <WarMap
                        isOpen={!!activeWarAnimation}
                        attacker={{
                            ...(activeWarAnimation.attackerCountryDetail || (areSameWarCountry(activeWarAnimation.attacker, userCountryName, undefined, countryDetail?.iso) ? countryDetail : {})),
                            ...(buildCapitalPoint(activeWarAnimation.attacker) || { country: activeWarAnimation.attacker, capital: activeWarAnimation.attacker, lat: 0, lng: 0 }),
                        }}
                        target={{
                            ...(activeWarAnimation.targetCountryDetail || (areSameWarCountry(activeWarAnimation.target, userCountryName, activeWarAnimation.targetCountryDetail?.iso, countryDetail?.iso) ? countryDetail : {})),
                            ...(buildCapitalPoint(activeWarAnimation.target) || { country: activeWarAnimation.target, capital: activeWarAnimation.target, lat: 0, lng: 0 }),
                            ...(activeWarAnimation.targetCityId ? {
                                cityId: activeWarAnimation.targetCityId,
                                cityName: activeWarAnimation.targetCityName,
                                cityIsCapital: activeWarAnimation.targetCityIsCapital,
                                lat: activeWarAnimation.targetCityLat,
                                lng: activeWarAnimation.targetCityLng,
                            } : {}),
                        }}
                        attackerPower={activeWarAnimation.attackerPower ?? 0}
                        targetPower={activeWarAnimation.targetPower ?? 0}
                        isUserDefender={activeWarAnimation.isPbbCoalition ? isUserDefender : activeWarAnimation.isNpcWar ? false : isUserDefender}
                        isNpcWar={activeWarAnimation.isNpcWar === true}
                        isPbbCoalition={activeWarAnimation.isPbbCoalition === true}
                        onAnalysisVisibilityChange={handleWarAnalysisVisibilityChange}
                        onAutoResolve={result => {
                            if (result !== 'win') return;
                            const targetCity = resolveWarTargetCity(
                                activeWarAnimation.target,
                                activeWarAnimation.targetCityId,
                                activeWarAnimation.targetCityName
                            );
                            if (!targetCity) {
                                console.error('[CityAnnexation] AI victory has no mapped target city.', activeWarAnimation);
                                return;
                            }
                            recordCityCapture(
                                targetCity,
                                activeWarAnimation.target,
                                activeWarAnimation.attacker,
                                getIsoForCountryName(activeWarAnimation.attacker) || 'un',
                                getCountryColor(activeWarAnimation.attacker),
                                activeWarAnimation.isPbbCoalition === true
                            );
                            if (activeWarAnimation.requestedInvasion === true) {
                                const { news } = generateAnnexationNews(
                                    activeWarAnimation.attacker,
                                    getIsoForCountryName(activeWarAnimation.attacker) || 'un',
                                    getCountryColor(activeWarAnimation.attacker),
                                    activeWarAnimation.target,
                                    getIsoForCountryName(activeWarAnimation.target) || 'un',
                                    currentDate.toISOString().slice(0, 10),
                                    targetCity.cityName
                                );
                                setNewsList(previous => [news, ...previous]);
                            }
                        }}
                        onClose={() => {
                            setIsWarAnalysisActive(false);
                            setActiveWarAnimation(null);
                            npcWarQueueRunningRef.current = false;
                            resumeGameTimeAfterWar();
                        }}
                        onResolve={({ action, result }) => {
                            if (isUserDefender) {
                                if (result === 'lose') {
                                    // 1. Potong armada pertahanan 75%
                                    const { updatedDetail: detailAfterLoss, lossSummaryText, losses } = applyWarLossesToUserArmada(countryDetail, 0.75);
                                    const targetCity = resolveWarTargetCity(
                                        activeWarAnimation.target,
                                        activeWarAnimation.targetCityId,
                                        activeWarAnimation.targetCityName
                                    );
                                    const attackerIso = getIsoForCountryName(activeWarAnimation.attacker) || 'un';
                                    const cityOwnerColor = getCountryColor(activeWarAnimation.attacker);
                                    const countryCollapsed = targetCity
                                        ? recordCityCapture(
                                            targetCity,
                                            activeWarAnimation.target,
                                            activeWarAnimation.attacker,
                                            attackerIso,
                                            cityOwnerColor,
                                            activeWarAnimation.isPbbCoalition === true
                                        )
                                        : false;

                                    if (countryCollapsed) {
                                        setCountryDetail(detailAfterLoss);
                                        setAnnexedModalData({
                                            isOpen: true,
                                            countryName: countryDetail?.country || countryDetail?.nama_negara || 'Indonesia',
                                            attackerCountry: activeWarAnimation.attacker,
                                        });
                                    } else {
                                        const currentDateStr = currentDate.toISOString().slice(0, 10);
                                        const { updatedDetail: detailAfterLoot } = lootUserProductionInventory(detailAfterLoss, currentDateStr);

                                        // 3. Potong populasi (Base 5.0%, dikurangi 2% s.d. 15% berdasarkan level riset Perlindungan Sipil Perang)
                                        const { updatedPopulation, lostPopulation, lossPercent } = applyWarCasualtyToPopulation(detailAfterLoot, 5.0);
                                        detailAfterLoot.populasi = updatedPopulation;
                                        if (detailAfterLoot.population !== undefined) detailAfterLoot.population = updatedPopulation;

                                        setCountryDetail(detailAfterLoot);

                                        setNotifications((prev: any[]) => [
                                            {
                                                id: `war-loot-${Date.now()}`,
                                                title: '⚠️ PRODUKSI DIRAMPAS & KORBAN POPULASI (80%)',
                                                sender: `Markas Besar Angkatan Bersenjata (${countryDetail?.country || countryDetail?.nama_negara || 'Indonesia'})`,
                                                message: `Pertahanan gagal membendung agresi ${activeWarAnimation.attacker}! Musuh merampas habis seluruh stok produksi (Mineral, Manufaktur, Peternakan, Agrikultur, Perikanan, dan Olahan Pangan) hingga kembali 0. Korban perang: ${lostPopulation.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jiwa (${lossPercent}% populasi). Kerugian armada: ${lossSummaryText}.`,
                                                type: 'kepuasan',
                                                value: 80,
                                                isRead: false,
                                            },
                                            ...prev,
                                        ]);

                                        setResultModal({
                                            isOpen: true,
                                            title: 'Pertahanan Gagal — Produksi Dirampas!',
                                            message: `Pertahanan negara Anda gagal menahan agresi militer dari ${activeWarAnimation.attacker}. Negara berhasil menepis aneksasi total (peluang selamat 80%), namun seluruh stok hasil produksi (Mineral, Manufaktur, Peternakan, Agrikultur, Perikanan, Olahan Pangan) dirampas habis hingga 0. Dampak populasi: ${lostPopulation.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jiwa (${lossPercent}% populasi). Kerugian alutsista dirinci di bawah.`,
                                            losses,
                                            type: 'error',
                                        });
                                    }
                                } else {
                                    // Pertahanan Berhasil! (User Win - potong armada user sebesar 25%)
                                    const { updatedDetail: detailAfterWin, lossSummaryText, losses } = applyWarLossesToUserArmada(countryDetail, 0.25, true);
                                    setCountryDetail(detailAfterWin);

                                    setNotifications((prev: any[]) => [
                                        {
                                            id: `war-win-${Date.now()}`,
                                            title: 'Pertahanan Berhasil!',
                                            sender: 'Kementerian Pertahanan',
                                            message: `Pasukan pertahanan nasional berhasil memukul mundur agresi militer dari ${activeWarAnimation.attacker}! Kerugian tempur armada pertahanan (25%): ${lossSummaryText}.`,
                                            type: 'kepuasan',
                                            value: 0,
                                            isRead: false,
                                        },
                                        ...prev,
                                    ]);
                                    setResultModal({
                                        isOpen: true,
                                        title: 'Pertahanan Berhasil!',
                                        message: `Pasukan pertahanan nasional sukses memukul mundur agresi militer dari ${activeWarAnimation.attacker}! Kerugian tempur armada pertahanan sebesar 25%.`,
                                        losses,
                                        type: 'success',
                                        persistent: true,

                                    });
                                }
                                setIsWarAnalysisActive(false);
                                setActiveWarAnimation(null);
                                npcWarQueueRunningRef.current = false;
                                resumeGameTimeAfterWar();
                                return;
                            }

                            let mappedAction: 'aneksasi' | 'jarah' | 'mundur' = 'mundur';
                            if (action === 'annex') mappedAction = 'aneksasi';
                            else if (action === 'loot') mappedAction = 'jarah';
                            else mappedAction = 'mundur';

                            if (
                                activeWarAnimation.isPbbCoalition &&
                                activeWarAnimation.isNpcWar === true
                            ) {
                                if (result === 'win') {
                                    const targetCity = resolveWarTargetCity(
                                        activeWarAnimation.target,
                                        activeWarAnimation.targetCityId,
                                        activeWarAnimation.targetCityName
                                    );
                                    if (targetCity) {
                                        recordCityCapture(
                                            targetCity,
                                            activeWarAnimation.target,
                                            activeWarAnimation.attacker,
                                            getIsoForCountryName(activeWarAnimation.attacker) || 'un',
                                            getCountryColor(activeWarAnimation.attacker),
                                            true
                                        );
                                    }
                                }
                                setIsWarAnalysisActive(false);
                                setActiveWarAnimation(null);
                                npcWarQueueRunningRef.current = false;
                                resumeGameTimeAfterWar();
                                return;
                            }

                            setMilitaryAttackRelation(activeWarAnimation.attacker, activeWarAnimation.target, 25);

                            window.dispatchEvent(
                                new CustomEvent('trigger_player_attack', {
                                    detail: {
                                        actionType: mappedAction,
                                        targetCountry: activeWarAnimation.target,
                                        targetCityId: activeWarAnimation.targetCityId,
                                        targetCityName: activeWarAnimation.targetCityName,
                                        warResult: result,
                                        isPbbCoalition: activeWarAnimation.isPbbCoalition ?? false,
                                    },
                                })
                            );
                            setIsWarAnalysisActive(false);
                            setActiveWarAnimation(null);
                            resumeGameTimeAfterWar();
                        }}
                    />
                );
            })()}

            {/* Shifted Canvas Container */}
            <MapCanvasView
                containerRef={containerRef}
                interactionDisabled={isMapInteractionDisabled}
                isSelectingTarget={isSelectingIcbmTarget}
                onClick={handleCanvasCountryClick}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerLeave}
                onWheel={handleCanvasWheel}
                onContextMenu={handleCanvasContextMenu}
            />

            {/* Efek Keclap Putih Uji Coba ICBM di Koordinat Sasaran */}
            {icbmFlashEffect && (
                <div className="fixed top-20 inset-x-0 bottom-0 pointer-events-none z-30 overflow-hidden">
                    {/* Flash cahaya putih terang global sekilas */}
                    <div
                        className={`absolute inset-0 bg-white transition-opacity duration-700 ${icbmFlashEffect.visible ? 'opacity-85' : 'opacity-0'
                            }`}
                    />

                    {/* Titik Ledakan Keclap Putih Fokus di Koordinat Target */}
                    <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        style={{
                            left: `${icbmFlashEffect.x}px`,
                            top: `${icbmFlashEffect.y}px`,
                        }}
                    >
                        {/* Lingkaran ledakan putih berkilau */}
                        <div
                            className={`rounded-full bg-white shadow-[0_0_100px_40px_rgba(255,255,255,0.95)] transition-all duration-1000 ${icbmFlashEffect.visible ? 'w-48 h-48 opacity-100 scale-125' : 'w-72 h-72 opacity-0 scale-150'
                                }`}
                        />
                        {/* Gelombang kejut ring putih */}
                        <div
                            className={`absolute inset-0 rounded-full border-4 border-white shadow-[0_0_50px_#ffffff] transition-all duration-1000 ${icbmFlashEffect.visible ? 'scale-150 opacity-100' : 'scale-[3.5] opacity-0'
                                }`}
                        />
                        {/* Label lokasi target */}
                        {icbmFlashEffect.targetName && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-10 whitespace-nowrap bg-black/80 border border-white/60 text-white font-black text-xs px-3 py-1 rounded-full shadow-lg tracking-wider uppercase animate-bounce">
                                💥 Titik Dampak: {icbmFlashEffect.targetName}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isDialogTerbukaOpen && (
                <DiplomacyTracking
                    isWarActive={!!activeWarAnimation}
                    onOpen={() => setCountryDetailModalOpen(false)}
                />
            )}

            {!isDialogTerbukaOpen && !(countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen) && (
                <>
                    {!Object.values(subMenuItems).flat().some((item: { id: string }) => activeMenu.startsWith(item.id)) && (
                        <TopNav
                            activeView={isDiplomacyMapActive ? 'diplomacy' : 'map'}
                            onSelect={handleTopNavSelect}
                        />
                    )}
                    <BottomNav
                        activeMenu={activeMenu}
                        setActiveMenu={setActiveMenu}
                        countryDetail={countryDetail}
                        isDetailModalOpen={countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen}
                    />
                </>
            )}

            <ModalsManager
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                countryDetail={countryDetail}
                metadata={metadata}
                setCountryDetail={setCountryDetail}
                selectedCountry={selectedCountry}
                currentDate={currentDate}
                resetTrigger={resetTrigger}
                productionDeepLink={productionDeepLink}
                setProductionDeepLink={setProductionDeepLink}
                tempatUmumDeepLink={tempatUmumDeepLink}
                setTempatUmumDeepLink={setTempatUmumDeepLink}
                kesejahteraanDeepLink={kesejahteraanDeepLink}
                setKesejahteraanDeepLink={setKesejahteraanDeepLink}
                kesejahteraanInitialTab={kesejahteraanInitialTab}
                setKesejahteraanInitialTab={setKesejahteraanInitialTab}
                onOpenCountryDetail={(targetCountry: string) => {
                    setCountryDetailModalName(targetCountry);
                    setCountryDetailModalOpen(true);
                }}
                onOpenPlayerDetail={() => {
                    setPlayerDetailModalOpen(true);
                }}
                presidentRating={presidentRating}
                setPresidentRating={setPresidentRating}
                notifications={notifications}
                onRemoveNotification={(notificationId) => {
                    setNotifications(previous => previous.filter(notification => notification.id !== notificationId));
                }}
                onOpenInbox={openInbox}
            />

            {/* Premium Floating Time Controller Widget */}
            <div
                className={`fixed bottom-3 right-3 lg:bottom-5 lg:right-5 xl:bottom-8 xl:right-8 z-40 flex flex-col w-[220px] lg:w-[250px] xl:w-[320px] transition-all ${isDialogTerbukaOpen ? 'hidden pointer-events-none' : ''}`}
                onPointerEnter={() => {
                    isTimeControllerHoveredRef.current = true;
                    window.dispatchEvent(new Event('neosantara:time-controller-hovered'));
                    if (dateCommitTimerRef.current !== null) {
                        clearTimeout(dateCommitTimerRef.current);
                        dateCommitTimerRef.current = null;
                    }
                }}
                onPointerLeave={() => {
                    isTimeControllerHoveredRef.current = false;
                    lastMapInteractionAtRef.current = Date.now();
                    window.dispatchEvent(new Event('neosantara:time-controller-idle'));
                    schedulePendingDateCommit();
                }}
            >
                {/* Upper Card */}
                <div className="bg-[#0F2424]/90 backdrop-blur-md rounded-t-xl xl:rounded-t-2xl px-3.5 lg:px-4 xl:px-6 pt-3 lg:pt-4 xl:pt-5 pb-7 lg:pb-8 xl:pb-10 border-t border-x border-[#00FFAA]/30 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-end mb-2 xl:mb-3.5">
                        {/* Calendar date label */}
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[8px] xl:text-[9px] font-black text-[#6B8A8A] tracking-wider xl:tracking-widest uppercase mb-0.5 xl:mb-1">SIMULATION CALENDAR</span>
                            <span ref={dateTextRef} className="text-xs lg:text-sm xl:text-lg font-black text-[#E0E0E0] tracking-tight">
                                {timeManagerRef.current?.getFormattedDate() || calendarRef.current?.display.getDisplayDate() || '-'}
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar Hijau */}
                    <div className="w-full bg-[#0A1A1A] h-1.5 rounded-full overflow-hidden border border-[#00FFAA]/20">
                        <div
                            ref={progressBarRef}
                            className="bg-[#00FFAA] h-full w-full origin-left scale-x-0 transition-none rounded-full shadow-[0_0_8px_#00FFAA] will-change-transform"
                        />
                    </div>

                </div>

                {/* Lower Dark Card with buttons */}
                <div className="bg-[#0A1A1A] rounded-b-xl xl:rounded-b-2xl border-b border-x border-[#00FFAA]/30 h-10 lg:h-11 xl:h-14 relative flex items-center justify-between">
                    <div className="absolute inset-x-3 lg:inset-x-4 xl:inset-x-6 -top-4.5 lg:-top-5 xl:-top-7 flex items-center justify-between">
                        {/* 1. Play/Pause button */}
                        <button
                            onClick={() => {
                                const nextPaused = !isPausedRef.current;
                                isPausedRef.current = nextPaused;
                                if (typeof window !== 'undefined') {
                                    (window as any).neosantara_is_paused = nextPaused;
                                }
                                if (calendarRef.current) {
                                    calendarRef.current.controls.handlePlayPauseClick(!nextPaused);
                                }
                                if (timeManagerRef.current) {
                                    timeManagerRef.current.setPaused(nextPaused);
                                    if (pendingDateRef.current) {
                                        schedulePendingDateCommit(true);
                                    } else {
                                        const cur = timeManagerRef.current.getCurrentDate();
                                        setCurrentDate(cur);
                                    }
                                }
                                setIsPaused(nextPaused);
                            }}
                            title={calendarRef.current?.calendar.getPauseButtonTitle(isPaused) || (isPaused ? "Mulai Waktu" : "Jeda Waktu")}
                            className="w-9 h-9 lg:w-10 lg:h-10 xl:w-14 xl:h-14 rounded-full bg-[#00FFAA] text-[#0A1A1A] border-2 xl:border-4 border-[#0A1A1A] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all z-20 group"
                        >
                            {isPaused ? (
                                <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 fill-[#0A1A1A] text-[#0A1A1A] translate-x-0.5 transition-transform group-hover:scale-110" />
                            ) : (
                                <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 fill-[#0A1A1A] text-[#0A1A1A] transition-transform group-hover:scale-110" />
                            )}
                        </button>

                        {/* 2. Speed Selector button */}
                        <button
                            onClick={() => {
                                if (!calendarRef.current) return;
                                const newSpeed = calendarRef.current.controls.handleSpeedClick();
                                setSpeed(newSpeed);
                                if (timeManagerRef.current) {
                                    timeManagerRef.current.setSpeed(newSpeed);
                                }
                            }}
                            title={calendarRef.current?.calendar.getSpeedButtonTitle() || `Ubah Kecepatan: ${speed}x`}
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] flex items-center justify-center cursor-pointer transition-all z-20 text-[10px] xl:text-[12px] font-black uppercase tracking-tighter"
                        >
                            {calendarRef.current?.display.getSpeedLabel() || `×${speed}`}
                        </button>

                        {/* 3. Holiday button */}
                        <button
                            onClick={() => {
                                if (calendarRef.current) {
                                    calendarRef.current.controls.handleHolidayClick();
                                } else {
                                    alert("Mode Liburan Presiden diaktifkan! Rakyat menikmati waktu istirahat.");
                                }
                            }}
                            title="Liburan Negara"
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] flex items-center justify-center cursor-pointer transition-all z-20"
                        >
                            <Palmtree className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5" />
                        </button>

                        {/* 4. Military/General button */}
                        <button
                            onClick={() => {
                                if (calendarRef.current) {
                                    calendarRef.current.controls.handleMilitaryClick();
                                } else {
                                    alert("Informasi Kepresidenan & Hubungan Militer Aktif.");
                                }
                            }}
                            title="Militer & Keamanan Negara"
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] flex items-center justify-center cursor-pointer transition-all z-20"
                        >
                            <Shield className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5" />
                        </button>
                    </div>
                </div>
            </div>

            <CountryDetailModal
                isOpen={countryDetailModalOpen}
                countryName={countryDetailModalName}
                countryDetail={countryDetail}
                metadata={metadata}
                setCountryDetail={setCountryDetail}
                currentDate={currentDate}
                playerNetBalanceAdjustment={playerNetBalanceAdjustment}
                adjustPlayerNetBalance={(delta: number) => setPlayerNetBalanceAdjustment((prev) => prev + delta)}
                autoBuildEmbassy={autoBuildEmbassyState}
                initialDevelopingBuildingKey={
                    aiConstructionNavigation &&
                        aiConstructionNavigation.countryName.toLowerCase() === countryDetailModalName?.toLowerCase()
                        ? aiConstructionNavigation.buildingKey
                        : undefined
                }
                initialDevelopingTab={
                    aiConstructionNavigation &&
                        aiConstructionNavigation.countryName.toLowerCase() === countryDetailModalName?.toLowerCase()
                        ? aiConstructionNavigation.targetTab
                        : undefined
                }
                selectedCity={countryDetailModalCity}
                selectedCityId={countryDetailModalCityId}
                onClose={() => {
                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
                    setCountryDetailModalCity(null);
                    setCountryDetailModalCityId(null);
                    setAiConstructionNavigation(null);
                    setAutoBuildEmbassyState(false);
                }}
            />

            {/* Modal Informasi Kedutaan Besar Diperlukan */}
            <RequireEmbassyModal
                isOpen={requireEmbassyModalOpen}
                partnerName={requireEmbassyPartner}
                onClose={() => {
                    setRequireEmbassyModalOpen(false);
                    setRequireEmbassyPartner(null);
                }}
                onProceedToDetail={(partner) => {
                    setRequireEmbassyModalOpen(false);
                    setRequireEmbassyPartner(null);
                    setCountryDetailModalName(partner);
                    setCountryDetailModalOpen(true);
                }}
            />

            {/* Modal DETAIL NEGARA USER (Prototipe) */}
            <NegaraUserModal
                isOpen={playerDetailModalOpen}
                onClose={() => setPlayerDetailModalOpen(false)}
                selectedCountry={selectedCountry}
                countryDetail={countryDetail}
            />

            {/* Modal Simpan Permainan - Notebook Style (Identik dengan Muat Permainan) */}
            {isSaveModalOpen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999999] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent font-sans select-none">
                    {/* Notebook-style Game Menu Frame — Green Theme */}
                    <div className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] shadow-2xl relative flex flex-col p-4 pl-12 overflow-hidden">
                        {/* Silver Binder Spine on the Left */}
                        <div className="absolute left-3.5 top-6 bottom-6 w-2.5 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
                        <div className="absolute left-[10px] top-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
                        <div className="absolute left-[10px] bottom-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />

                        {/* Notebook Rings binding the paper */}
                        <div className="absolute left-[26px] top-12 bottom-12 flex flex-col justify-between items-center py-6 pointer-events-none z-30">
                            {[...Array(11)].map((_, i) => (
                                <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
                                </div>
                            ))}
                        </div>

                        {/* Main Panel Sheet — Green Theme */}
                        <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative p-8 flex flex-col overflow-hidden">
                            {/* Subtle radial glow */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

                            {/* Decorative Elegant Divider at the Top */}
                            <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mb-4 shrink-0">
                                <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                                <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                                <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                            </div>

                            {/* Header: Title + Back/New Button */}
                            <div className="flex items-center justify-between border-b border-[#00FFAA]/20 pb-3 mb-4 shrink-0 text-left">
                                <div className="flex items-center gap-2">
                                    {isCreatingNewSaveSlot && existingSaveFiles.length > 0 && (
                                        <button
                                            onClick={() => setIsCreatingNewSaveSlot(false)}
                                            className="p-1 rounded hover:bg-[#00FFAA]/10 text-[#6B8A8A] hover:text-[#00FFAA] cursor-pointer transition-all"
                                            title="Kembali ke Daftar Simpanan"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                    )}
                                    <span className="font-extrabold text-[14px] text-[#00FFAA] uppercase tracking-wider">
                                        {isCreatingNewSaveSlot ? 'BUAT SIMPANAN BARU' : 'SIMPAN PERMAINAN'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!isCreatingNewSaveSlot && (
                                        <button
                                            onClick={() => {
                                                const defaultName = calendarRef.current?.calendar.formatSaveName(selectedCountry?.country || 'Negara')
                                                    || `Simulasi ${selectedCountry?.country || 'Negara'} - ${timeManagerRef.current?.getFormattedDate() || 'Hari Ini'}`;
                                                setSaveNameInput(defaultName);
                                                setSelectedSaveIdToOverwrite(null);
                                                setIsCreatingNewSaveSlot(true);
                                            }}
                                            className="flex items-center gap-1.5 py-1.5 px-3 rounded bg-[#00FFAA]/15 hover:bg-[#00FFAA]/25 border border-[#00FFAA]/40 text-[#00FFAA] font-extrabold text-[11px] tracking-wider uppercase transition-all cursor-pointer shadow-sm hover:shadow-[0_0_10px_rgba(0,255,170,0.2)] active:scale-95"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Slot Baru</span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setIsSaveModalOpen(false);
                                            setIsCreatingNewSaveSlot(false);
                                            setSelectedSaveIdToOverwrite(null);
                                            setSaveToOverwriteConfirm(null);
                                        }}
                                        className="p-1 rounded hover:bg-rose-500/10 text-[#6B8A8A] hover:text-rose-400 font-black text-sm cursor-pointer transition-all ml-1"
                                        title="Tutup"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* View 1: List Save File untuk ditimpa atau buat baru */}
                            {!isCreatingNewSaveSlot ? (
                                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                                        {isLoadingExistingSaves ? (
                                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-[#6B8A8A] font-bold text-xs">
                                                <div className="w-5 h-5 rounded-full border-2 border-[#00FFAA]/20 border-t-[#00FFAA] animate-spin" />
                                                <span>Memuat data simpanan...</span>
                                            </div>
                                        ) : existingSaveFiles.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-center gap-2">
                                                <span className="text-[#6B8A8A] text-xs font-bold uppercase tracking-wider">TIDAK ADA DATA SIMPANAN</span>
                                                <p className="text-[#6B8A8A]/70 text-[10px] max-w-[220px]">Belum ada simpanan sebelumnya. Klik "Slot Baru" di atas untuk menyimpan progres saat ini.</p>
                                            </div>
                                        ) : (
                                            existingSaveFiles.map((save) => (
                                                <div
                                                    key={save.id}
                                                    className="group relative flex items-center justify-between p-3 rounded-lg border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 bg-[#0A1A1A] hover:bg-[#00FFAA]/5 transition-all text-left gap-3"
                                                >
                                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                                        <img
                                                            src={`https://flagcdn.com/w80/${save.country_iso?.toLowerCase() || 'un'}.png`}
                                                            className="w-8 h-5 rounded-sm object-cover border border-[#00FFAA]/20 shadow-sm shrink-0 mt-0.5"
                                                            alt="flag"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                                                            }}
                                                        />
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className="text-[12px] font-black text-[#E0E0E0] group-hover:text-[#00FFAA] truncate leading-tight transition-colors">
                                                                {save.save_name}
                                                            </span>
                                                            <div className="flex items-center gap-2.5 text-[9px] text-[#6B8A8A] font-bold mt-1">
                                                                <span className="flex items-center gap-1 truncate">
                                                                    <Globe className="w-2.5 h-2.5 text-[#00FFAA]/60" />
                                                                    {save.country_name}
                                                                </span>
                                                                <span className="flex items-center gap-1 shrink-0">
                                                                    <Calendar className="w-2.5 h-2.5 text-[#00FFAA]/60" />
                                                                    {new Date(save.game_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => setSaveToOverwriteConfirm(save)}
                                                        disabled={isSaving}
                                                        className="py-1.5 px-3.5 rounded bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/35 border border-amber-500/40 hover:border-amber-500/70 text-amber-400 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow shrink-0 active:scale-95 disabled:opacity-50"
                                                    >
                                                        Timpa
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer action */}
                                    <div className="pt-3 mt-2 border-t border-[#00FFAA]/15 flex items-center justify-between">
                                        <span className="text-[10px] text-[#6B8A8A]">
                                            Pilih slot untuk diperbarui atau buat slot baru.
                                        </span>
                                        <button
                                            onClick={() => setIsSaveModalOpen(false)}
                                            className="bg-[#0A1A1A] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-2 px-5 text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[11px] tracking-wider uppercase transition-all cursor-pointer"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* View 2: Form Buat Slot Simpanan Baru */
                                <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                    <div className="space-y-4">
                                        {/* Info Card Negara Saat Ini */}
                                        <div className="flex items-center gap-3 bg-[#0A1A1A] border border-[#00FFAA]/25 p-3 rounded-lg">
                                            {selectedCountry && (
                                                <img
                                                    src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`}
                                                    className="w-9 h-6 rounded-sm object-cover border border-[#00FFAA]/30 shadow-sm"
                                                    alt="flag"
                                                />
                                            )}
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-[9px] font-black text-[#6B8A8A] uppercase tracking-wider">NEGARA SIMULASI</span>
                                                <span className="text-[13px] font-black text-[#00FFAA] uppercase tracking-wide">{selectedCountry?.country}</span>
                                            </div>
                                        </div>

                                        {/* Input Nama Save File */}
                                        <div className="space-y-1.5 text-left">
                                            <label className="text-[10px] font-black text-[#6B8A8A] tracking-wider uppercase">
                                                NAMA SIMPANAN BARU
                                            </label>
                                            <input
                                                type="text"
                                                value={saveNameInput}
                                                onChange={(e) => setSaveNameInput(e.target.value)}
                                                className="w-full bg-[#0A1A1A] border border-[#00FFAA]/30 focus:border-[#00FFAA] rounded-lg px-3.5 py-2.5 text-[#E0E0E0] font-bold text-xs focus:outline-none transition-all shadow-inner focus:shadow-[0_0_12px_rgba(0,255,170,0.15)]"
                                                placeholder="Masukkan nama save..."
                                                maxLength={100}
                                                autoFocus
                                            />
                                        </div>

                                        {/* Metadata Ringkas */}
                                        <div className="bg-[#0A1A1A]/60 border border-[#00FFAA]/15 rounded-lg p-3 grid grid-cols-2 gap-2 text-left">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-[#6B8A8A] font-bold uppercase">Kalender Permainan</span>
                                                <span className="text-[11px] text-[#E0E0E0] font-extrabold truncate">
                                                    📅 {calendarRef.current?.display.getDateLabel() || (timeManagerRef.current?.getFormattedDate() || '-')}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-[#6B8A8A] font-bold uppercase">Kas Negara</span>
                                                <span className="text-[11px] text-[#E0E0E0] font-extrabold truncate">
                                                    💰 {countryDetail?.anggaran ? `${countryDetail.anggaran} NEO` : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-[#00FFAA]/15 grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                if (existingSaveFiles.length > 0) {
                                                    setIsCreatingNewSaveSlot(false);
                                                } else {
                                                    setIsSaveModalOpen(false);
                                                }
                                            }}
                                            disabled={isSaving}
                                            className="bg-[#0A1A1A] hover:bg-[#00FFAA]/10 active:bg-[#00FFAA]/20 border border-[#00FFAA]/30 hover:border-[#00FFAA]/60 rounded py-2.5 text-[#E0E0E0] hover:text-[#00FFAA] font-extrabold text-[12px] tracking-wider uppercase transition-all cursor-pointer"
                                        >
                                            {existingSaveFiles.length > 0 ? 'Kembali' : 'Batal'}
                                        </button>
                                        <button
                                            onClick={() => handleSaveGame(null)}
                                            disabled={isSaving}
                                            className="bg-[#00FFAA]/20 hover:bg-[#00FFAA]/30 active:bg-[#00FFAA]/40 border border-[#00FFAA]/60 hover:border-[#00FFAA] rounded py-2.5 text-[#00FFAA] font-extrabold text-[12px] tracking-wider uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(0,255,170,0.15)] disabled:opacity-50"
                                        >
                                            {isSaving ? 'Menyimpan...' : 'Simpan Baru'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* In-Modal Confirmation Dialog untuk Timpa Save File (Gaya Cyberpunk Green) */}
                            {saveToOverwriteConfirm && (
                                <div className="absolute inset-0 bg-transparent z-50 flex items-center justify-center p-6 text-center animate-fadeIn">
                                    <div className="bg-[#0A1A1A] border-2 border-amber-500/60 rounded-xl p-5 w-full max-w-sm shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-4">
                                        <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
                                            <RotateCw className="w-5 h-5 animate-spin-slow" />
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">KONFIRMASI TIMPA</span>
                                            <h4 className="text-[13px] font-extrabold text-[#E0E0E0] leading-tight">
                                                Perbarui "{saveToOverwriteConfirm.save_name}"?
                                            </h4>
                                            <p className="text-[10px] text-[#6B8A8A] max-w-[240px] mx-auto pt-1">
                                                Progres permainan saat ini akan menimpa slot ini secara permanen.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <button
                                                onClick={() => setSaveToOverwriteConfirm(null)}
                                                disabled={isSaving}
                                                className="bg-[#0F2424] hover:bg-[#00FFAA]/10 border border-[#00FFAA]/30 rounded py-2 text-[#E0E0E0] font-bold text-xs uppercase cursor-pointer transition-all"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const targetSave = saveToOverwriteConfirm;
                                                    setSaveNameInput(targetSave.save_name);
                                                    setSaveToOverwriteConfirm(null);
                                                    handleSaveGame(targetSave.id);
                                                }}
                                                disabled={isSaving}
                                                className="bg-amber-500/25 hover:bg-amber-500/40 border border-amber-500 rounded py-2 text-amber-300 font-extrabold text-xs uppercase cursor-pointer transition-all shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                                            >
                                                {isSaving ? 'Menyimpan...' : 'Ya, Timpa'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Ink Stamp at the Bottom Right — Green Theme */}
                            <div className="absolute bottom-4 right-6 border-2 border-dashed border-[#00FFAA]/30 text-[#00FFAA]/40 px-3 py-1 font-mono text-[9px] font-black uppercase tracking-wider rounded rotate-[-4deg] pointer-events-none select-none">
                                PRESIDEN EXEC. 16FA-923
                            </div>

                            {/* Decorative Elegant Divider at the Bottom */}
                            <div className="flex items-center justify-center gap-1.5 text-[#00FFAA]/40 mt-3 shrink-0">
                                <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
                                <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
                                <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Custom Toast Alert */}
            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl border border-emerald-400 flex items-center gap-2 animate-bounce">
                    <span className="text-base">✓</span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Tropico Game Menu Modal */}
            <GameMenuModal
                isOpen={isPresidentMenuOpen}
                onClose={() => setIsPresidentMenuOpen(false)}
                onSaveGameClick={openSaveModal}
                onRestartClick={() => setIsRestartConfirmOpen(true)}
            />




            {/* Confirm Restart Modal */}
            <ConfirmRestartModal
                isOpen={isRestartConfirmOpen}
                onClose={() => setIsRestartConfirmOpen(false)}
                onConfirm={handleRestart}
            />

            {/* Peringatan Peringkat Kritis Modal */}
            <ModalsPeringatanPeringkat
                isOpen={isRatingWarningOpen}
                onClose={() => setIsRatingWarningOpen(false)}
                currentRating={presidentRating}
                warningType={warningType}
                currentValue={warningValue}
            />

            {/* Modals Kudeta (Game Over) */}
            <ModalsKudeta
                isOpen={isKudetaOpen}
                kudetaType={kudetaType}
                currentValue={kudetaValue}
                countryName={selectedCountry?.country}
                onRestart={() => {
                    handleRestart();
                    setIsKudetaOpen(false);
                }}
            />

            {/* Modals Annexed Game Over */}
            <ModalsAnnexedGameOver
                isOpen={annexedModalData.isOpen}
                countryName={annexedModalData.countryName || selectedCountry?.country || countryDetail?.country}
                attackerCountry={annexedModalData.attackerCountry}
                onRestart={() => {
                    handleRestart();
                    setAnnexedModalData(prev => ({ ...prev, isOpen: false }));
                }}
            />

            {/* Modal Hasil Perang & Pertempuran Militer */}
            <ResultModal
                isOpen={resultModal.isOpen}
                title={resultModal.title}
                message={resultModal.message}
                losses={resultModal.losses}
                type={resultModal.type}
                onClose={() => {
                    setResultModal(prev => ({ ...prev, isOpen: false }));
                }}
            />

            {/* Modal Khusus Hasil Pembubaran Massa Demo (Hard Power / Aparat) */}
            <HasilBubarkanMassaModal
                isOpen={hasilBubarkanState.isOpen}
                title={hasilBubarkanState.title}
                message={hasilBubarkanState.message}
                type={hasilBubarkanState.type}
                casualties={hasilBubarkanState.casualties}
                deadCount={hasilBubarkanState.deadCount}
                injuredCount={hasilBubarkanState.injuredCount}
                remainingMassa={hasilBubarkanState.remainingMassa}
                actionName={hasilBubarkanState.actionName}
                onClose={() => {
                    setHasilBubarkanState(prev => ({ ...prev, isOpen: false }));
                }}
            />

            <TradeRejectionModal
                isOpen={tradeRejectionState.isOpen}
                onClose={() => {
                    setTradeRejectionState(prev => ({ ...prev, isOpen: false }));
                }}
                partnerCountry={tradeRejectionState.partnerCountry}
                tradeType={tradeRejectionState.tradeType}
                reason={tradeRejectionState.reason}
                customReason={tradeRejectionState.ekonomiNegara}
            />

            <ClosedTradeRejectionModal
                isOpen={closedTradeRejectionState.isOpen}
                onClose={() => {
                    setClosedTradeRejectionState(prev => ({ ...prev, isOpen: false }));
                }}
                partnerCountry={closedTradeRejectionState.partnerCountry}
                centralizationScore={closedTradeRejectionState.centralizationScore}
                averageNationalization={closedTradeRejectionState.averageNationalization}
                ideologyModifier={closedTradeRejectionState.ideologyModifier}
                religionModifier={closedTradeRejectionState.religionModifier}
                reasons={closedTradeRejectionState.reasons}
            />

            {/* Modal Menu Pilihan Bubarkan Massa */}
            <MenuBubarkanMassaModal
                isOpen={aparatConfirmState.isOpen}
                currentBudget={Number(countryDetail?.anggaran || 0)}
                onClose={() => {
                    setAparatConfirmState({ isOpen: false, notification: null });
                    if (!isDialogTerbukaOpen) {
                        setInboxModalOpen(true);
                    }
                }}
                onSelectOption={(selectedOption: DetailOpsiBubarkan) => {
                    const targetNotif = aparatConfirmState.notification;
                    setAparatConfirmState({ isOpen: false, notification: null });
                    executeAparatOption(targetNotif, selectedOption);
                }}
            />

            {/* Overlay Forum Dialog Terbuka (Paling depan dari seluruh UI: Navbar, BottomNav, dll.) */}
            {isDialogTerbukaOpen && (
                <div className="fixed inset-0 z-[99999999] overflow-hidden bg-[#081014]">
                    <DialogTerbukaMenu
                        currentBudget={Number(countryDetail?.anggaran || 0)}
                        countryDetail={countryDetail}
                        setCountryDetail={setCountryDetail}
                        onExecuteBubarkanOption={(option, onResult) => {
                            const demoNotif = notifications.find((item): item is NotificationMessage & DemonstrasiNotification =>
                                'tradeType' in item &&
                                item.tradeType === 'demonstrasi_rakyat' &&
                                !item.isHandled
                            ) || null;
                            executeAparatOption(demoNotif, option, onResult);
                        }}
                        onClose={() => {
                            setIsDialogTerbukaOpen(false);
                            if (dateTextRef.current && timeManagerRef.current) {
                                dateTextRef.current.textContent = timeManagerRef.current.getFormattedDate();
                            }
                            const pauseState = dialogPauseStateRef.current;
                            dialogPauseStateRef.current = null;
                            if (pauseState && !pauseState.wasPaused) {
                                isPausedRef.current = false;
                                setIsPaused(false);
                                timeManagerRef.current?.setPaused(false);
                            }
                        }}
                    />
                </div>
            )}
        </main>
    );
}
