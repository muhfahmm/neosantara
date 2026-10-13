// detail path: c:\EM\apps\src\app\page\map_system\map-system.tsx
'use client';

import React, { memo, startTransition, useCallback, useState, useEffect, useRef } from 'react';
import {
    Play, Pause, Settings, Palmtree, Shield, Crosshair
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';
import countryPaths from './country-paths.json';
import { mergeClaimedTerritories } from './world-map-geometry';
import { SimulationTimeManager, createSimulationCalendar } from '../time_controllers';
import { handleGameRestart } from '../time_controllers';
import dynamic from 'next/dynamic';
import useKeyboardShortcuts from '../keyword';
import { subMenuItems } from '../navigasi_menu/navigationData';

const GameMenuModal = dynamic(() => import('../navbar/GameMenuModal').then(m => m.GameMenuModal), { ssr: false });
const TopNav = dynamic(() => import('../navigasi_menu/1_navigasi_atas/TopNav'), { ssr: false });
const ConfirmRestartModal = dynamic(() => import('../navbar/ConfirmRestartModal').then(m => m.ConfirmRestartModal), { ssr: false });
const ModalsPeringatanPeringkat = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsPeringatanPeringkat').then(m => m.ModalsPeringatanPeringkat), { ssr: false });
const ModalsKudeta = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta'), { ssr: false });
type KudetaType = import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta').KudetaType;
const ModalsAnnexedGameOver = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsAnnexedGameOver'), { ssr: false });
const DiplomacyTracking = dynamic(() => import('../menus/tracking-modals/tracking'), { ssr: false });
const ResultModal = dynamic(() => import('./warResultModal'), { ssr: false });

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
import { buildCapitalPoint } from '../path_logic/path-war';
import { estimateTravelTime } from '../path_logic/time_logic';
import { applyWarLossesToUserArmada } from '../detail_negara/3_operasi_militer/1_serang_negara/war_algoritm/battleEngine';
import { getArmadaPowerSummary } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/armadaLogic';
import { convertBarakToSoldiers } from '../navigasi_menu/2_navigasi_bawah/6_pertahanan/4_armada/logic/1_barak_logic';
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import {
    hasActiveNationalization,
    syncNationalizationDiplomacyRelations,
} from '../navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic';
import { calculateDailyMaterialProduction } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic';
import { getDaysElapsed } from '@/app/logic/production_logic';
import {
    flushNpcCountrySimulation,
    getNpcCountrySimulationSnapshot,
    restoreNpcCountrySimulationState,
    applyNpcCountrySimulationState,
    useNpcCountrySimulation,
    clearActiveNpcCountrySimulationState,
} from '@/app/logic/npcCountrySimulation';
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
const BottomLeftPenelitianIcon = dynamic(() => import('../menus/penelitian/penelitianModals'), { ssr: false });
const BottomLeftMissionIcon = dynamic(() => import('../menus/mission/missionModals'), { ssr: false });
import { NotificationMessage, getKepuasanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getPeringkatWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/2_peringkat/peringkatLogic';
import { getKesejahteraanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanLogic';
import { getTradeAgreementsForCountry } from '../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { getEmbassiesForCountry } from '../../../../../json/database_kedutaan_besar/embassyRegistry';
import { getRelationValue, setNonAggressionPactHistory, setRelationModifier, setRelationSanctionModifiers, setRelationSourceValue, setSimulationDate } from '../../../../../json/database_hubungan_antar_negara/relationsRegistry';
import type { NonAggressionPactPeriod } from '../../../../../json/database_hubungan_antar_negara/relationsRegistry';
import { setEconomicSanctionCounts } from '../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic';
import { playerHasEmbassyWith, playerHasEmbassyOrTradePartners } from '../detail_negara/1_informasi_umum/1_kedutaan_besar/logic/kedutaanBesarLogic';
import { areSameWarCountry, getWarCountryIdentity } from '../detail_negara/3_operasi_militer/1_serang_negara/warCountryIdentity';
import { generateAITradeBeliNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/2_beli/tradeBeliLogic';
import { generateAITradeJualNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/1_jual/tradeJualLogic';
import { generateTradeRelationOfferNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/3_hubungan_dagang/tradeRelationLogic';
import { checkAndGenerateEmbassyOffers, createEmbassyOfferNotification } from '../menus/inbox/logic/4_notifikasi_kedubes/1_penawaran_kedutaan_besar';
import { generateBencanaAlamNotification } from '../menus/inbox/logic/6_notifikasi_bencana/1_bencana_alam/bencanaLogic';
import { generateKeamananNotification } from '../menus/inbox/logic/14_notifikasi_keamanan/keamananLogic';
import { generateWabahPenyakitNotification } from '../menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/wabahLogic';
import { generateSpionaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/1_spionase/spionaseLogic';
import { generateSabotaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/2_sabotase/sabotaseLogic';
import {
    generateDiserangNotification,
    getAttackChancePercentFromRelation,
} from '../menus/inbox/logic/2_notifikasi_pertahanan/3_diserang/diserangLogic';
import { generatePemberontakanNotification, calculateSeparatismeRiskPercent } from '../menus/inbox/logic/2_notifikasi_pertahanan/4_pemberontakan/pemberontakanLogic';
import { getDefenseAllianceOfferChancePercent } from '../bonus_logic/penelitian_bonus_logic/3_riset_diplomasi_intelijen/3_Aliansi Pertahanan';
import { applyDoktrinPertahananDiriBonus, applyWarCasualtyToPopulation } from '../bonus_logic';
import { generateICBMNotification, generateProgramNuklirSelesaiNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/5_icbm/icbmLogic';
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
    getEligibleUNMemberCountries,
    normalizeElectionState,
    tickSecurityCouncilElectionSchedule,
} from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logika_anggota_tidak_tetap/securityCouncilElection';
import { calculateLayananPublikScore } from '@/app/logic/kepuasanCalculator';
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
import { generateResourceLootNews } from '../menus/news/logic/3_berita_pengambilan_sda/beritaPengambilanSDALogic';
import { generateDiplomacyNews } from '../menus/news/logic/4_diplomasi/diplomasiNewsLogic';
import {
    generateEconomicCrisisNotification,
    generateEconomyNews,
} from '../menus/news/logic/5_ekonomi_keuangan/ekonomiKeuanganNewsLogic';
import { generateMilitaryAchievementNews } from '../menus/news/logic/6_pencapaian_militer/pencapaianMiliterNewsLogic';
import { generateWorldNewsEvents } from '../menus/news/logic/worldNewsLogic';
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
} from '@/../../json/database_organisasi_internasional';
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

type AnnexedTerritoryEntry = { attackerCountry?: string; attackerIso?: string };
type AnnexedTerritories = Record<string, AnnexedTerritoryEntry>;

function getCapitalFlagsForCurrentTerritories() {
    const annexedCountries = typeof window === 'undefined'
        ? {}
        : ((window as Window & { neosantara_annexed_countries?: AnnexedTerritories })
            .neosantara_annexed_countries || {});
    const normalizeKey = (value: unknown) =>
        String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    return CAPITALS_DATA.map(capital => {
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

        return attackerIso ? { ...capital, iso: attackerIso.toLowerCase() } : capital;
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

const MapCanvasView = memo(function MapCanvasView({
    containerRef,
    interactionDisabled,
    onClick,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onWheel,
}: {
    containerRef: React.RefObject<HTMLDivElement | null>;
    interactionDisabled: boolean;
    onClick: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onPointerDown: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLCanvasElement>) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
    onWheel: () => void;
}) {
    return (
        <div ref={containerRef} className={`fixed top-20 inset-x-0 bottom-0 z-0 ${interactionDisabled ? 'pointer-events-none' : ''}`}>
            <canvas
                id="map-canvas"
                className="w-full h-full block cursor-grab"
                onClick={onClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={onPointerLeave}
                onWheel={onWheel}
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
    }, []);
    const [playerNetBalanceAdjustment, setPlayerNetBalanceAdjustment] = useState<number>(0);
    const [playerNetPopulationChange, setPlayerNetPopulationChange] = useState<number>(0);
    const [playerDailyBirths, setPlayerDailyBirths] = useState<number>(0);
    const [playerDailyDeaths, setPlayerDailyDeaths] = useState<number>(0);
    const [isPaused, setIsPaused] = useState(true);
    const isPausedRef = useRef(isPaused);
    const warPauseStateRef = useRef<{ wasPaused: boolean } | null>(null);
    const [speed, setSpeed] = useState(1);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

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
    useNpcCountrySimulation(currentDate, countryDetail?.country_slug, metadata);

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

        setNonAggressionPactHistory(history);
        const historySignature = JSON.stringify(history);
        if (historySignature !== pactHistorySignatureRef.current) {
            pactHistorySignatureRef.current = historySignature;
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
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPresidentMenuOpen, setIsPresidentMenuOpen] = useState(false);
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
    const [autoBuildEmbassyState, setAutoBuildEmbassyState] = useState(false);
    const [requireEmbassyModalOpen, setRequireEmbassyModalOpen] = useState(false);
    const [requireEmbassyPartner, setRequireEmbassyPartner] = useState<string | null>(null);
    const [playerDetailModalOpen, setPlayerDetailModalOpen] = useState(false);
    const [inboxModalOpen, setInboxModalOpen] = useState(false);
    const [giftModalOpen, setGiftModalOpen] = useState(false);
    const [newsModalOpen, setNewsModalOpen] = useState(false);

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

        updateDiplomacyMapColors();
        window.addEventListener('country_relations_updated', updateDiplomacyMapColors);
        window.addEventListener('world_map_features_ready', updateDiplomacyMapColors);
        return () => {
            window.removeEventListener('country_relations_updated', updateDiplomacyMapColors);
            window.removeEventListener('world_map_features_ready', updateDiplomacyMapColors);
        };
    }, [isDiplomacyMapActive, selectedCountry?.country, countryDetail?.country, countryDetail?.nama_negara, countryDetail?.name, currentDate]);

    const handleTopNavSelect = (view: 'map' | 'diplomacy') => {
        setIsDiplomacyMapActive(view === 'diplomacy');
    };
    const [newsList, setNewsList] = useState<NewsItemData[]>([]);
    const lastObservedNewsResetDateRef = useRef<string | null>(null);

    const isMapFocusedRef = useRef(false);

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
        onOpenTopUp: () => {
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
            router.push('/page/topup_page');
        },
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
                setInboxModalOpen(true);
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
                setIsPresidentMenuOpen(true);
            }
        },
        onTogglePlayPause: () => {
            if (calendarRef.current) {
                const newPaused = calendarRef.current.controls.handlePlayPauseClick(isPaused);
                setIsPaused(newPaused);
                if (timeManagerRef.current) {
                    timeManagerRef.current.setPaused(newPaused);
                }
            }
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
        attackerColor: string
    ) => {
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
        const annexationInfo = { attackerCountry, attackerIso };
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

    // Territory changes are runtime-only and are restored from an explicitly loaded save.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).neosantara_country_color_overrides = {};
            (window as any).neosantara_annexed_countries = {};
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
        };
        window.addEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
        return () => window.removeEventListener('map_territory_color_updated', syncTerritoryColorOverrides);
    }, []);

    // Listener custom event ketika pemain berhasil meminta negara sekutu menyerang negara target
    useEffect(() => {
        const handleRequestedInvasion = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (!detail) return;

            const { attackerCountry, targetCountry, amount } = detail;

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
                isNpcWar: true,
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

            // 1. Berita Invasi Deklarasi Perang
            const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
            const newNewsItems: NewsItemData[] = [invNews];

            // 2. Berita Lanjutan: Aneksasi (60%) atau Rampasan SDA (40%)
            const outcomeRoll = Math.random();
            if (outcomeRoll < 0.60) {
                const attackerColor = getCountryColor(attackerCountry);
                const { news: annexationNews } = generateAnnexationNews(
                    attackerCountry,
                    attackerIso,
                    attackerColor,
                    targetCountry,
                    targetIso,
                    dateStr
                );
                newNewsItems.push(annexationNews);

                recordAnnexedTerritory(targetCountry, targetIso, attackerCountry, attackerIso, attackerColor);
            } else {
                const lootNews = generateResourceLootNews(
                    attackerCountry,
                    attackerIso,
                    targetCountry,
                    targetIso,
                    10000000,
                    { emas: 250, minyak_bumi: 500, beras: 1000 },
                    dateStr
                );
                newNewsItems.push(lootNews);
            }

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

            const { actionType, targetCountry } = detail;
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
                if (hasActiveGlobalWarBan()) {
                    setNotifications(prev => [{
                        id: `notif-war-ban-player-block-${Date.now()}`,
                        title: '🕊️ SERANGAN DIBLOKIR OLEH RESOLUSI PBB',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                        message: `Aksi militer terhadap ${targetCountry} dibatalkan karena larangan perang global masih berlaku.`,
                        timestamp: dateStr,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    }, ...prev]);
                    return;
                }

                const hasInvasionMandate = hasActiveApprovedInvasionResolution(attackerCountry, targetCountry);
                if (!hasInvasionMandate) {
                    const reason = hasActiveApprovedInvasionResolutionForDifferentTarget(attackerCountry, targetCountry)
                        ? 'wrong_military_target'
                        : 'missing_military_resolution';
                    const expelledOrganizations = expelCountryFromUNOrganizations(attackerCountry);
                    if (expelledOrganizations.length > 0) {
                        setNotifications(prev => [{
                            id: `notif-organization-expulsion-${Date.now()}`,
                            title: '🚫 KEANGGOTAAN ORGANISASI PBB DICABUT',
                            sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                            message: `${attackerCountry} dikeluarkan dari ${expelledOrganizations.join(', ')} karena menyerang ${targetCountry} tanpa resolusi invasi yang disetujui.`,
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
                // 1. Potong armada penyerang pemain sebesar 25% (kemenangan perang)
                let userLossText = '';
                if (countryDetail) {
                    const { updatedDetail: detailAfterWin, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.25);
                    setCountryDetail(detailAfterWin);
                    userLossText = lossSummaryText;
                }

                // 2. Berita Invasi
                const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
                newNewsItems.push(invNews);

                // 3. Berita Aneksasi — Gunakan warna PEMAIN di peta (#10b981 hijau),
                // BUKAN getCountryColor() yang mengembalikan warna benua (misal Asia=#a855f7 ungu)
                // yang bisa sama persis dengan warna asli negara target.
                const attackerColor = '#10b981';
                const { news: annexationNews } = generateAnnexationNews(
                    attackerCountry,
                    attackerIso,
                    attackerColor,
                    targetCountry,
                    targetIso,
                    dateStr
                );
                newNewsItems.push(annexationNews);

                recordAnnexedTerritory(targetCountry, targetIso, attackerCountry, attackerIso, attackerColor);

                // 4. Gabungkan statistik (populasi, kas negara, kepuasan, kesejahteraan, seluruh bangunan & sisa militer target setelah kalah >50%) dari negara target ke user
                const targetRelPath = Object.entries(countryPaths as Record<string, string>).find(
                    ([name]) => name.toLowerCase().trim() === targetCountry.toLowerCase().trim()
                )?.[1];

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
                    title: `🚩 ANEKSASI WILAYAH BERHASIL`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: `Pasukan militer Anda telah sukses merebut dan memperluas wilayah kedaulatan ${attackerCountry} dengan mencaplok seluruh teritorial ${targetCountry}!${lossNote} Peta dunia telah diperbarui.`,
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
                    const { updatedDetail: detailAfterWin, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.25);
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
                    const { updatedDetail, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, lossRate);
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

            // Tambahkan ke Berita & Update Geopolitik
            setNewsList(prev => [...newNewsItems, ...prev]);
        };

        window.addEventListener('trigger_player_attack', handlePlayerAttack);

        return () => {
            window.removeEventListener('trigger_requested_invasion', handleRequestedInvasion);
            window.removeEventListener('trigger_player_attack', handlePlayerAttack);
        };
    }, [currentDate, countryDetail]);

    const [penelitianModalOpen, setPenelitianModalOpen] = useState(false);
    const [missionModalOpen, setMissionModalOpen] = useState(false);
    const [playerDiamonds, setPlayerDiamonds] = useState<number>(150);

    // Sinkronisasi saldo diamond dari localStorage saat client mounted & realtime event
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const loadSaveStr = sessionStorage.getItem('presiden_simulator_load_save');
            if (!loadSaveStr) {
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
    const [npcWarQueue, setNpcWarQueue] = useState<Array<{
        attacker: string;
        target: string;
        isNpcWar?: boolean;
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
            if (!isPlayerAttacker && !hasApprovedInvasionMandate) {
                const violationReason = hasActiveGlobalWarBan()
                    ? 'war_ban'
                    : hasActiveApprovedInvasionResolutionForDifferentTarget(detail.attacker, detail.target)
                        ? 'wrong_military_target'
                        : 'missing_military_resolution';
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
            }

            if (playerCountryName && areSameWarCountry(
                detail.attacker,
                playerCountryName,
                detail.attackerCountryDetail?.iso,
                selectedCountry?.iso || countryDetail?.iso
            )) {
                setMilitaryAttackRelation(detail.attacker, detail.target, 1);
                if (
                    !hasActiveGlobalWarBan() &&
                    !hasActiveApprovedInvasionResolution(detail.attacker, detail.target)
                ) {
                    const relationPenaltySummary = applyInvasionRelationPenalty(detail.attacker, detail.target);
                    setNotifications(previous => [{
                        id: `notif-unapproved-invasion-relations-${Date.now()}`,
                        title: '📉 HUBUNGAN DIPLOMATIK MEMBURUK',
                        sender: 'Kementerian Luar Negeri',
                        message: `Hubungan diplomatik ${detail.attacker} dengan negara-negara lain menurun karena menyerang ${detail.target} tanpa mandat Resolusi Invasi PBB. ${relationPenaltySummary}`,
                        timestamp: currentDate.toISOString().slice(0, 10),
                        type: 'peringkat',
                        value: 30,
                        isRead: false,
                    }, ...previous]);
                }
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
                forceSources.forEach(profile => {
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

            const attackerPowerSummary = getArmadaPowerSummary(attackerDetailData);
            const targetPowerSummary = getArmadaPowerSummary(targetDetailData);

            setActiveWarAnimation({
                ...detail,
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
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
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
        type?: 'success' | 'error' | 'info';
        persistent?: boolean;
        openInboxOnClose?: boolean;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Keep war results visible until the player closes them.
    useEffect(() => {
        if (!resultModal.isOpen || resultModal.persistent) return;

        const timer = setTimeout(() => {
            setResultModal(prev => ({ ...prev, isOpen: false }));
            setInboxModalOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [resultModal.isOpen, resultModal.persistent]);

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
            setNotifications(prev => [...pending, ...prev]);
            const generatedNews: NewsItemData[] = [];
            for (const notification of pending) {
                const candidates: Array<NewsItemData | null> = [
                    generateDiplomacyNews(notification),
                    generateEconomyNews(notification),
                    generateMilitaryAchievementNews(notification),
                ];
                for (const item of candidates) {
                    if (item) generatedNews.push(item);
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
    }, [countryDetail?.pending_notifications, setCountryDetail]);

    useEffect(() => {
        if (!countryDetail) return;
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

    // --- MONTHLY NOTIFICATIONS GENERATOR (25% CHANCE PER BULAN ~ 3-5 EVENT / TAHUN) ---
    useEffect(() => {
        if (!currentDate || !countryDetail) return;

        const yearStr = currentDate.getFullYear();
        const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${yearStr}-${monthStr}-${dayStr}`;

        const currentYearMonth = `${yearStr}-${monthStr}`;
        const lastCheckedYearMonth = countryDetail.last_checked_notification_month;

        if (!lastCheckedYearMonth) {
            setCountryDetail((prev: any) => ({
                ...prev,
                last_checked_notification_month: currentYearMonth
            }));
            return;
        }

        if (lastCheckedYearMonth !== currentYearMonth) {
            const userCountryName = countryDetail.country || countryDetail.nama || "Indonesia";
            const worldNewsResult = generateWorldNewsEvents(
                COUNTRIES_DATA,
                userCountryName,
                Number(countryDetail.world_news_country_cursor) || 0,
                currentDateStr,
            );
            if (worldNewsResult.news.length > 0) {
                setNewsList(previous => {
                    const existingIds = new Set(previous.map(item => item.id));
                    return [
                        ...worldNewsResult.news.filter(item => !existingIds.has(item.id)),
                        ...previous,
                    ];
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

            // 1. Penawaran Transaksi Ekspor / Impor (25% per bulan ~ 3-5x/tahun)
            if (Math.random() < 0.25) {
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

            // 2. Penawaran Kedutaan Besar (25% per bulan)
            if (Math.random() < 0.25) {
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

            // 3. Penawaran Hubungan Dagang Bilateral (Membutuhkan Kedutaan Besar, 25% per bulan)
            if (Math.random() < 0.25) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateTradeRelationOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 4. Bencana Alam & Wabah Penyakit (25% per bulan standard; 20% untuk anggota WMO karena -5% risiko bencana)
            const wmoDisasterModifier = getWMODisasterRiskModifier(userCountryName, countryDetail);
            const disasterBaseChance = Math.max(0, 0.25 + wmoDisasterModifier / 100);
            if (Math.random() < disasterBaseChance) {
                const whoPandemicModifier = getWHOPandemicRiskModifier(userCountryName, countryDetail);
                const disasterSelectionChance = Math.max(0, Math.min(1, 0.60 - whoPandemicModifier / 100));
                const isBencana = Math.random() < disasterSelectionChance;
                const remainingDisasterRisk = applyKementerianLingkunganHidupDisasterRiskReduction(
                    1,
                    countryDetail
                );
                if (isBencana && Math.random() < remainingDisasterRisk) {
                    const disaster = generateBencanaAlamNotification(userCountryName, currentDateStr, countryDetail);
                    newNotifsToAdd.push(disaster);
                    setCountryDetail((prev: any) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            jumlah_penduduk: Math.max(0, (Number(prev.jumlah_penduduk) || 0) - disaster.korban),
                            active_disaster_effects: [
                                ...(Array.isArray(prev.active_disaster_effects) ? prev.active_disaster_effects : []),
                                {
                                    id: disaster.id,
                                    eventName: disaster.eventName,
                                    category: disaster.category,
                                    korban: disaster.korban,
                                    startDate: currentDateStr,
                                    durationDays: 30,
                                    healthMultiplier: 0.9
                                }
                            ]
                        };
                    });
                } else if (!isBencana) {
                    const currentPopulation = Number(countryDetail?.jumlah_penduduk);
                    const outbreak = generateWabahPenyakitNotification(
                        userCountryName,
                        currentDateStr,
                        Number.isFinite(currentPopulation) && currentPopulation > 0
                            ? currentPopulation
                            : undefined
                    );
                    newNotifsToAdd.push(outbreak);
                    setCountryDetail((prev: any) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            active_outbreaks: [
                                ...(Array.isArray(prev.active_outbreaks) ? prev.active_outbreaks : []),
                                {
                                    id: outbreak.id,
                                    eventName: outbreak.eventName,
                                    category: outbreak.category,
                                    korban: outbreak.korban,
                                    perkiraanKematian: outbreak.perkiraanKematian,
                                    durationDays: outbreak.durationDays,
                                    startDate: currentDateStr,
                                }
                            ]
                        };
                    });
                }
            }

            // Risiko keamanan mengikuti rata-rata kekurangan fasilitas kesehatan dan hukum.
            const healthAndLawScore = (
                calculateKesehatanScore(countryDetail) +
                calculatePenegakanHukumScore(countryDetail)
            ) / 2;
            const securityRiskPercent = 100 - healthAndLawScore;
            if (securityRiskPercent > 0 && Math.random() * 100 < securityRiskPercent) {
                newNotifsToAdd.push(
                    generateKeamananNotification(userCountryName, currentDateStr, securityRiskPercent),
                );
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
                    newNotifsToAdd.push(generatePemberontakanNotification('Papua Barat', currentDateStr, separatismeRisk));
                } else if (defRoll < 0.35) {
                    newNotifsToAdd.push(generateSpionaseNotification(randomPartner, currentDateStr));
                } else if (defRoll < 0.65) {
                    newNotifsToAdd.push(generateSabotaseNotification(randomPartner, currentDateStr));
                } else {
                    newNotifsToAdd.push(generateICBMNotification(randomPartner, 'Jakarta', currentDateStr));
                }
            }

            // Check all international countries for attack pool
            const potentialAttackers = internationalPool.filter(
                p => p.trim().toLowerCase() !== userCountryName.trim().toLowerCase()
            );
            if (potentialAttackers.length > 0) {
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

            // 5B. Penawaran Pakta Non-Agresi Bilateral (Membutuhkan Kedutaan Besar, 25% per bulan ~ 3-5x/tahun)
            if (Math.random() < 0.25) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateNonAggressionOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5C. Peluang dasar 25% per bulan, ditambah bonus riset Aliansi Pertahanan.
            const defenseAllianceOfferChance = getDefenseAllianceOfferChancePercent(countryDetail);
            if (Math.random() * 100 < defenseAllianceOfferChance) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateDefenseAllianceOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5D. Penawaran Kontrak Penelitian Joint-R&D (Membutuhkan Kedutaan Besar, 25% per bulan ~ 3-5x/tahun)
            if (Math.random() < 0.25) {
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

            // 5H. Evaluasi Berita Perang / Invasi / Aneksasi / Rampasan SDA Geopolitik (35% per bulan ~ 4-5x/tahun)
            if (Math.random() < 0.35) {
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
            const totalHousingCap = (Number(countryDetail?.rumah_subsidi) || 0) * (Number(metadata?.rumah_subsidi?.kapasitas) || DEFAULT_HUNIAN_CAPACITIES.rumah_subsidi) +
                (Number(countryDetail?.apartemen) || 0) * (Number(metadata?.apartemen?.kapasitas) || DEFAULT_HUNIAN_CAPACITIES.apartemen) +
                (Number(countryDetail?.mansion) || 0) * (Number(metadata?.mansion?.kapasitas) || DEFAULT_HUNIAN_CAPACITIES.mansion);
            const totalPop = Number(countryDetail?.jumlah_penduduk) || 0;
            const housingShortage = Math.max(0, totalPop - totalHousingCap);
            const housingSatisfaction = totalPop > 0
                ? (totalHousingCap <= 0 ? 1 : Math.min(100, Math.max(1, Math.round((Math.min(totalHousingCap / totalPop, 1)) * 100))))
                : 50;

            if (housingShortage > 0 || housingSatisfaction <= 20) {
                const percentageMet = totalPop > 0 ? (totalHousingCap / totalPop) * 100 : 0;
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

            if (newNotifsToAdd.length > 0) {
                setNotifications(prev => [...newNotifsToAdd, ...prev]);
            }

            setCountryDetail((prev: any) => ({
                ...prev,
                last_checked_notification_month: currentYearMonth,
                world_news_country_cursor: worldNewsResult.nextCursor,
                last_notified_listrik_step: currentListrikStep
            }));
        }
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
        isSaveModalOpen ||
        isPresidentMenuOpen ||
        isRestartConfirmOpen ||
        countryDetailModalOpen ||
        playerDetailModalOpen ||
        inboxModalOpen ||
        giftModalOpen ||
        newsModalOpen ||
        !nonModalMenus.includes(activeMenu);

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
    const hasInitRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const isMapPointerDownRef = useRef(false);
    const lastMapInteractionAtRef = useRef(0);
    const pendingDateRef = useRef<Date | null>(null);
    const dateCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const schedulePendingDateCommit = useCallback(() => {
        if (!pendingDateRef.current || isMapPointerDownRef.current) return;
        if (dateCommitTimerRef.current !== null) clearTimeout(dateCommitTimerRef.current);
        const elapsedSinceInteraction = Date.now() - lastMapInteractionAtRef.current;
        const delay = Math.max(0, 180 - elapsedSinceInteraction);
        dateCommitTimerRef.current = setTimeout(() => {
            dateCommitTimerRef.current = null;
            if (isMapPointerDownRef.current || !pendingDateRef.current) return;
            const pendingDate = pendingDateRef.current;
            pendingDateRef.current = null;
            startTransition(() => setCurrentDate(pendingDate));
        }, delay);
    }, []);

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
                } catch {}
            }
        }
        lastCountryDetailStateRef.current = serialized;
    }, [countryDetail]);

    // Initialize high-performance simulation clock on mount
    useEffect(() => {
        let lastDateKey = '';
        const manager = new SimulationTimeManager(
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
                        lastDateKey = dateKey;
                        pendingDateRef.current = newDate;
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

        // Assign manager to ref immediately after construction
        timeManagerRef.current = manager;
        if (typeof window !== 'undefined') {
            (window as Window & { neosantara_time_controller?: SimulationTimeManager }).neosantara_time_controller = manager;
        }

        // Create calendar system with factory
        const calendarSystem = createSimulationCalendar(manager);
        calendarRef.current = calendarSystem;

        // Check if there is a save to load to restore the date
        if (typeof window !== 'undefined') {
            clearExpelledOrganizationCountries();
            clearAllOrganizationMembershipData();
            const loadSaveStr = sessionStorage.getItem('presiden_simulator_load_save');
            const newGameMarker = localStorage.getItem('presiden_simulator_new_game');
            // Reset data misi dan diamond ke tingkat awal setiap kali permainan dimulai atau halaman direfresh
            // kecuali jika ada data save yang sedang dimuat (presiden_simulator_load_save).
            if (!loadSaveStr || newGameMarker === '1') {
                clearMissionProgressData();
                localStorage.setItem('player_diamonds', '150');
                setPlayerDiamonds(150);
                window.dispatchEvent(new CustomEvent('player_diamonds_updated', { detail: { diamonds: 150 } }));
            }

            if (newGameMarker === '1') {
                clearActiveResolutionsForSession();
                clearActiveSecurityCouncilItems();
                clearReportedInvasionViolations();
                localStorage.removeItem('hutangModalLoanSources');
                localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
                localStorage.removeItem('pbb_active_resolutions_v4');
                localStorage.removeItem('pbb_active_keamanan_v4');
                localStorage.removeItem('pbb_reported_war_ban_violations_v1');
                clearActiveNpcCountrySimulationState();
                (window as any).neosantara_annexed_countries = {};
                (window as any).neosantara_country_color_overrides = {};
                localStorage.removeItem('presiden_simulator_new_game');
            }
            if (loadSaveStr) {
                try {
                    const savedState = JSON.parse(loadSaveStr);
                    if (savedState.game_date) {
                        manager.setCurrentDate(new Date(savedState.game_date));
                    }
                } catch (err) {
                    console.error("Failed to restore date from save:", err);
                }
            }
        }

        setCurrentDate(manager.getCurrentDate());

        return () => {
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
                        setCountryColorOverrides(restoredOverrides);
                        (window as any).neosantara_country_color_overrides = restoredOverrides;
                        (window as any).neosantara_annexed_countries = restoredAnnexed;
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
                    if (isNewGame || !loadSaveStr) {
                        expelCountryFromOrganizations(chosen.country);
                        clearMissionProgressData();
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

    const prevBudgetUpdateDateRef = useRef<string | null>(null);
    const skipPopulationMetricsRefreshRef = useRef(false);

    // ✅ NEW: Initialize population metrics when countryDetail first loads
    useEffect(() => {
        if (!countryDetail) return;
        if (skipPopulationMetricsRefreshRef.current) {
            skipPopulationMetricsRefreshRef.current = false;
            return;
        }

        // Calculate initial population metrics untuk display
        const populationMetrics = calculateDailyPopulationChange(
            countryDetail,
            selectedCountry?.country,
            metadata,
            currentDate
        );
        setPlayerNetPopulationChange(populationMetrics.netDailyChange);
        setPlayerDailyBirths(populationMetrics.dailyBirths);
        setPlayerDailyDeaths(populationMetrics.dailyDeaths);

        logger.log('PopulationInit', 'Initial population metrics calculated', {
            populasi: countryDetail.jumlah_penduduk,
            netChange: populationMetrics.netDailyChange,
        });
    }, [countryDetail?.jumlah_penduduk, countryDetail?.active_outbreaks, countryDetail?.active_disaster_effects, selectedCountry?.country, metadata]);

    useEffect(() => {
        if (!countryDetail || !currentDate) return;

        let cancelled = false;
        let idleCallbackId: number | null = null;
        let fallbackTimerId: number | null = null;
        const runDailyTick = () => {
            if (cancelled) return;

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const currentDateStr = `${year}-${month}-${day}`;
            const managerDate = timeManagerRef.current?.getCurrentDate();
            if (managerDate) {
                const managerDateStr = [
                    managerDate.getFullYear(),
                    String(managerDate.getMonth() + 1).padStart(2, '0'),
                    String(managerDate.getDate()).padStart(2, '0'),
                ].join('-');
                if (managerDateStr !== currentDateStr) return;
            }

            if (prevBudgetUpdateDateRef.current === null) {
                prevBudgetUpdateDateRef.current = currentDateStr;
                return;
            }

            if (prevBudgetUpdateDateRef.current === currentDateStr) return;

            const lastDate = prevBudgetUpdateDateRef.current;
            prevBudgetUpdateDateRef.current = currentDateStr;

            // Calculate economy updates
            const playerCountryName = selectedCountry?.country || countryDetail.country || countryDetail.nama_negara || '';
            const netBalance = calculateNetBalanceWithEconomicEmbargo(countryDetail, playerCountryName);

            const populationMetrics = calculateDailyPopulationChange(
                countryDetail,
                selectedCountry?.country,
                metadata,
                currentDateStr
            );

            // Store net population change for display in Navbar
            setPlayerNetPopulationChange(populationMetrics.netDailyChange);
            setPlayerDailyBirths(populationMetrics.dailyBirths);
            setPlayerDailyDeaths(populationMetrics.dailyDeaths);

            // ✅ Only calculate material production if metadata is loaded
            let updates: Record<string, any> = {};
            if (metadata && Object.keys(metadata).length > 0) {
                const result = calculateDailyMaterialProduction(
                    countryDetail,
                    metadata,
                    currentDateStr,
                    resourceKey => getEconomicEmbargoProductionMultiplier(playerCountryName, resourceKey),
                    lastDate
                );
                updates = result.hasUpdates ? result.updates : {};
            }

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

            skipPopulationMetricsRefreshRef.current = true;
            startTransition(() => setCountryDetail((prev: any) => {
                if (!prev) return prev;

                const populationUpdates = updateDailyPopulation(
                    prev,
                    populationMetrics,
                    selectedCountry?.country,
                    metadata,
                    currentDateStr
                );
                const previousCrisisTiers = prev.population_crisis_tiers;
                const currentCrisisTiers = {
                    pangan: populationMetrics.foodTier,
                    hunian: populationMetrics.housingTier,
                    overpopulasi: populationMetrics.overpopulationTier,
                    kesehatan: populationMetrics.healthTier,
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

                // --- HITUNG PENURUNAN PERINGKAT BERDASARKAN KEPUASAN (menggunakan peringkatCalculator) ---
                const keterbukaanScore = calculateKeterbukaanScore(prev);
                const ratingResult = calculatePresidentRating({
                    currentRating: prev.presidentRating ?? 50,
                    ratingMonthCounter: prev.rating_month_counter ?? 0,
                    lastRatingThreshold: prev.last_rating_threshold ?? 12,
                    monthsPassed,
                    currentKepuasan: nextKepuasan,
                    keterbukaanScore,
                    lowSectorCount,
                    additionalDecay: sectorDeficitPenaltyThisTick,
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
                const playerCountryName = String(prev?.country || prev?.nama_negara || prev?.name || '').trim();
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

                const nextBudget = (Number(prev.anggaran) || 0) + netBalance -
                    (Number(prev.minister_recruitment_expense_pending) || 0);

                return {
                    ...prev,
                    ...updates,
                    ...populationUpdates,
                    anggaran: nextBudget,
                    minister_recruitment_expense_pending: 0,
                    satisfaction: prev.satisfaction, // Preserve satisfaction scores
                    programNuklirActive: nextProgramNuklirActive,
                    population_crisis_tiers: currentCrisisTiers,
                    pending_notifications: [...diplomacyCompletionNotifications, ...nextPendingNotifications, ...newCrisisNotifications],
                    active_outbreaks: (Array.isArray(prev.active_outbreaks) ? prev.active_outbreaks : []).filter((event: any) => {
                        const elapsed = Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${String(event.startDate || '').slice(0, 10)}T00:00:00Z`);
                        return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < (Number(event.durationDays) || 0) * 86_400_000;
                    }),
                    active_disaster_effects: (Array.isArray(prev.active_disaster_effects) ? prev.active_disaster_effects : []).filter((event: any) => {
                        const elapsed = Date.parse(`${currentDateStr}T00:00:00Z`) - Date.parse(`${String(event.startDate || '').slice(0, 10)}T00:00:00Z`);
                        return Number.isFinite(elapsed) && elapsed >= 0 && elapsed < (Number(event.durationDays) || 30) * 86_400_000;
                    }),
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
            }));
        };

        const idleWindow = window as Window & {
            requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
            cancelIdleCallback?: (callbackId: number) => void;
        };
        if (idleWindow.requestIdleCallback) {
            idleCallbackId = idleWindow.requestIdleCallback(runDailyTick, { timeout: 300 });
        } else {
            fallbackTimerId = window.setTimeout(runDailyTick, 50);
        }

        return () => {
            cancelled = true;
            if (idleCallbackId !== null) idleWindow.cancelIdleCallback?.(idleCallbackId);
            if (fallbackTimerId !== null) window.clearTimeout(fallbackTimerId);
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
                // Reset country color overrides dan data aneksasi saat restart game
                clearActiveNpcCountrySimulationState();
                (window as any).neosantara_country_color_overrides = {};
                (window as any).neosantara_annexed_countries = {};
            }
            handleGameRestart({
                timeManager: timeManagerRef.current,
                setIsPaused,
                setSpeed,
                setCountryDetail, // Add this to reset production data
                reloadStats: () => loadCountryStats(selectedCountry.country, selectedCountry.capital),
                skipConfirm: true
            });
            setPlayerNetBalanceAdjustment(0);
            setPlayerNetPopulationChange(0);
            setPresidentRating(50);
            setKesejahteraan(50);
            // 🔥 Reset semua notifikasi dan early warning flags agar tidak terbawa ke game baru
            setNotifications([]);
            setHasShownEarlyWarning({ kepuasan: false, peringkat: false, kesejahteraan: false });
            setHasShownRatingWarning(false);
            // Reset country color overrides
            setCountryColorOverrides({});
            // Toggle resetTrigger to signal all modals to reset
            setResetTrigger(prev => !prev);
        }
    };

    // Open save dialog with default name suggestions
    const openSaveModal = () => {
        if (!selectedCountry) return;
        const defaultName = calendarRef.current?.calendar.formatSaveName(selectedCountry.country)
            || `Simulasi ${selectedCountry.country} - ${timeManagerRef.current?.getFormattedDate() || 'Hari Ini'}`;
        setSaveNameInput(defaultName);
        setIsSaveModalOpen(true);
    };

    // Save game progress handler
    const handleSaveGame = async () => {
        if (!selectedCountry) return;

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
            };
            const response = await fetch('/api/game-save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
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

            setToastMessage('Permainan berhasil disimpan!');
            setIsSaveModalOpen(false);
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
        const initMap = async () => {
            if (hasInitRef.current) return;
            hasInitRef.current = true;

            try {
                const [wasmModule, geojsonResponse] = await Promise.all([
                    import('../../../wasm/map-engine-rs/map_engine_rs'),
                    fetch('/world.geojson', { cache: 'force-cache' })
                ]);
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

                try {
                    await wasmModule.default(); // Initialize WASM module first
                } catch (wasmErr) {
                    console.warn("WASM module init notice:", wasmErr);
                }
                wasmModuleRef.current = wasmModule;

                // After init, the exported functions are available on the module
                const { start_map_engine, set_selected_country_on_map, set_map_horizontal_wrap } = wasmModule;

                const mapCanvasEl = document.getElementById('map-canvas') as HTMLCanvasElement | null;
                const mapCtx = mapCanvasEl?.getContext('2d');
                if (mapCanvasEl && mapCtx) {
                    let fillCount = 0;
                    let realFillStyle: string | CanvasGradient | CanvasPattern = '#000';
                    let cachedFeatures: any[] | null = null;
                    let cachedOverrides: Record<string, string> | null = null;
                    let cachedAnnexedCountries: Record<string, any> | null = null;
                    let annexedFeatureColors: Array<string | undefined> = [];
                    const normalizeCountryKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const originalFill = mapCtx.fill.bind(mapCtx);
                    const originalFillRect = mapCtx.fillRect.bind(mapCtx);
                    mapCtx.fill = ((...args: Parameters<typeof mapCtx.fill>) => {
                        fillCount++;
                        originalFill(...args);
                    }) as typeof mapCtx.fill;
                    mapCtx.fillRect = ((...args: Parameters<typeof mapCtx.fillRect>) => {
                        fillCount = 0;
                        originalFillRect(...args);
                    }) as typeof mapCtx.fillRect;
                    Object.defineProperty(mapCtx, 'fillStyle', {
                        configurable: true,
                        get: () => realFillStyle,
                        set: (value: string | CanvasGradient | CanvasPattern) => {
                            realFillStyle = value;
                            const features = (window as any).neosantara_world_geojson_features;
                            const overrides = (window as any).neosantara_country_color_overrides || EMPTY_COUNTRY_OVERRIDES;
                            const annexedCountries = (window as any).neosantara_annexed_countries || EMPTY_ANNEXED_COUNTRIES;

                            if (
                                features &&
                                (features !== cachedFeatures ||
                                    overrides !== cachedOverrides ||
                                    annexedCountries !== cachedAnnexedCountries)
                            ) {
                                const annexedKeys = new Set(
                                    Object.entries(annexedCountries)
                                        .filter(([, info]) =>
                                            typeof info === 'object' &&
                                            info !== null &&
                                            'attackerCountry' in info
                                        )
                                        .map(([key]) => normalizeCountryKey(key))
                                );
                                const validOverrides = Object.entries(overrides)
                                    .filter(([key]) => annexedKeys.has(normalizeCountryKey(key)))
                                    .map(([key, color]) => [normalizeCountryKey(key), color] as const);

                                annexedFeatureColors = features.map((feature: { properties?: Record<string, unknown> }) => {
                                    const properties = feature?.properties;
                                    if (!properties) return undefined;
                                    const featureKeys = new Set([
                                        properties.ISO_A2,
                                        properties.ISO_A2_EH,
                                        properties.ISO_A3,
                                        properties.ISO_A3_EH,
                                        `iso_${properties.ISO_A2 || properties.ISO_A2_EH || ''}`,
                                        `iso_${properties.ISO_A3 || properties.ISO_A3_EH || ''}`,
                                        properties.NAME,
                                        properties.ADMIN,
                                        properties.NAME_LONG,
                                        properties.GEOUNIT,
                                        properties.NAME_ID,
                                        properties.NAME_EN,
                                        properties.NAME_IND
                                    ].filter((key): key is string => typeof key === 'string' && key.length > 0)
                                        .map(normalizeCountryKey));
                                    return validOverrides.find(([key]) => featureKeys.has(key))?.[1];
                                });
                                cachedFeatures = features;
                                cachedOverrides = overrides;
                                cachedAnnexedCountries = annexedCountries;
                            }

                            if (
                                typeof value === 'string' &&
                                value !== '#10b981' &&
                                value !== '#1e3a8a' &&
                                value !== '#fbbf24' &&
                                value !== 'white' &&
                                !(window as any).neosantara_diplomacy_map_active &&
                                features &&
                                fillCount < features.length
                            ) {
                                const annexedColor = annexedFeatureColors[fillCount];
                                if (annexedColor) realFillStyle = annexedColor;
                            }
                            if (
                                typeof value === 'string' &&
                                value !== '#1e3a8a' &&
                                value !== '#fbbf24' &&
                                value !== 'white' &&
                                (window as any).neosantara_diplomacy_map_active
                            ) {
                                const diplomacyColor =
                                    (window as any).neosantara_diplomacy_map_feature_colors?.[fillCount];
                                if (diplomacyColor) realFillStyle = diplomacyColor;
                            }
                            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(mapCtx), 'fillStyle')
                                ?.set?.call(mapCtx, realFillStyle);
                        }
                    });

                }

                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    COUNTRIES_DATA,
                    CAPITALS_DATA
                );
                set_map_horizontal_wrap(true);
                wasmModule.set_capitals_on_map(getCapitalFlagsForCurrentTerritories());

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
        initMap();
    }, []);

    const mapClickContextRef = useRef({ interactionDisabled: false, playerCountryName: '' });
    mapClickContextRef.current = {
        interactionDisabled: isMapInteractionDisabled,
        playerCountryName: selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || '',
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

        try {
            const wasmModule = wasmModuleRef.current;
            const clickedCountry = wasmModule?.get_country_at_on_map?.(x, y);
            const countryName = clickedCountry?.country || clickedCountry?.name || clickedCountry?.country_name;

            if (!countryName) return;

            const playerCountryName = mapClickContextRef.current.playerCountryName;
            const isPlayer = playerCountryName && countryName.toLowerCase().trim() === playerCountryName.toLowerCase().trim();

            if (isPlayer) {
                setPlayerDetailModalOpen(true);
            } else {
                setCountryDetailModalName(countryName);
                setCountryDetailModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to read clicked country from map:', error);
        }
    }, []);

    const handleCanvasPointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
        if (mapClickContextRef.current.interactionDisabled) return;
        isMapPointerDownRef.current = true;
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

    const handleCanvasPointerUp = useCallback(() => {
        isMapPointerDownRef.current = false;
        lastMapInteractionAtRef.current = Date.now();
        schedulePendingDateCommit();
    }, [schedulePendingDateCommit]);

    const handleCanvasPointerLeave = useCallback(() => {
        if (!isMapPointerDownRef.current) return;
        isMapPointerDownRef.current = false;
        lastMapInteractionAtRef.current = Date.now();
        schedulePendingDateCommit();
    }, [schedulePendingDateCommit]);

    const handleCanvasWheel = useCallback(() => {
        markMapInteraction();
        schedulePendingDateCommit();
    }, [markMapInteraction, schedulePendingDateCommit]);

    return (
        <main className="fixed inset-0 bg-[#070b14] overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_0%,transparent_100%)] pointer-events-none" />

            {/* Status Bar / Navbar */}
            <Navbar
                selectedCountry={selectedCountry}
                countryDetail={countryDetail}
                metadata={metadata}
                netBalanceAdjustment={playerNetBalanceAdjustment}
                netPopulationChange={playerNetPopulationChange}
                dailyBirths={playerDailyBirths}
                dailyDeaths={playerDailyDeaths}
                presidentRating={presidentRating}
                kesejahteraan={countryDetail?.kesejahteraan !== undefined ? Math.round(Number(countryDetail.kesejahteraan)) : kesejahteraan}
                onOpenGameMenu={() => setIsPresidentMenuOpen(true)}
                onOpenSaveModal={openSaveModal}
                onOpenRestartConfirm={() => setIsRestartConfirmOpen(true)}
                onOpenKepuasan={() => setActiveMenu("Dashboard:Kepuasan")}
                onOpenKesejahteraan={() => {
                    setKesejahteraanDeepLink(true);
                    setActiveMenu("Dashboard:Populasi:Overview");
                }}
                diamond={playerDiamonds}
                onOpenTopUp={() => {
                    router.push('/page/topup_page');
                }}
            />            {/* Top Left Icon - Inbox */}
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
                    setInboxModalOpen(true);
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setPenelitianModalOpen(false);
                    setMissionModalOpen(false);
                    setActiveMenu("");
                    // Mark all notifications as read when opening inbox
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
                isOpen={inboxModalOpen}
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
                        setResultModal({
                            isOpen: true,
                            title: 'Referendum Tidak Lagi Berlangsung',
                            message: `Referendum ${targetCountry} sudah selesai atau tidak lagi aktif. Tidak ada tindakan yang dilakukan.`,
                            type: 'info'
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
                    setResultModal({
                        isOpen: true,
                        title: 'Massa Dibubarkan dengan Kekerasan',
                        message: `Operasi di ${targetCountry} menyebabkan ${casualties.toLocaleString('id-ID', { maximumFractionDigits: 2 })} korban jiwa. Ketegangan naik ${tensionIncrease} poin menjadi ${nextTension}/100.${currentReferendum?.status === 'pending'
                            ? ' Penindakan ini memperkuat dukungan kemerdekaan dalam referendum yang sedang berlangsung.'
                            : startedReferendum
                                ? ` Ketegangan mencapai 100; referendum kemerdekaan dimulai dan berlangsung hingga ${newReferendum?.votingEndsAt}.`
                                : ''}`,
                        type: 'error'
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
                onActionClick={(notif) => {
                    // Intersep jika ini tawaran transaksi dagang AI
                    const tNotif = notif as any;
                    if (
                        (tNotif.tradeType === 'jual' || tNotif.tradeType === 'beli') &&
                        isTradeEmbargoActive(countryDetail?.country || countryDetail?.nama_negara || '', tNotif.partnerName || '')
                    ) {
                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Diblokir oleh Embargo PBB',
                            message: `Perdagangan dengan ${tNotif.partnerName || 'negara terkait'} tidak dapat dilakukan selama embargo ekonomi PBB masih berlaku.`,
                            type: 'error'
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        return;
                    }

                    if (tNotif.tradeType === 'jual') {
                        // AI Ingin Membeli Produk User (Jual): Tambah Kas, Kurangi Stok User
                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        if (myStock < tNotif.quantity) {
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Menyelesaikan Ekspor',
                                message: `Stok ${tNotif.productKey} Anda tidak mencukupi (${myStock} unit dari ${tNotif.quantity} unit yang dibutuhkan).`,
                                type: 'error'
                            });
                            return;
                        }

                        const budget = Number(countryDetail?.anggaran || 0);
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget + tNotif.totalPrice,
                            [tNotif.productKey]: myStock - tNotif.quantity,
                            [`total_sold_${tNotif.productKey}`]: Number(prev?.[`total_sold_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Ekspor Berhasil',
                            message: `Berhasil mengekspor ${tNotif.quantity} unit ${tNotif.productKey} ke ${tNotif.partnerName} senilai +${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO!`,
                            type: 'success'
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        return;
                    }

                    if (tNotif.tradeType === 'beli') {
                        // AI Menjual ke User (Beli): Kurangi Kas, Tambah Stok User
                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < tNotif.totalPrice) {
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Menyelesaikan Impor',
                                message: `Anggaran negara tidak mencukupi untuk melakukan impor ini. (${budget.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO tersedia dari ${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO).`,
                                type: 'error'
                            });
                            return;
                        }

                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - tNotif.totalPrice,
                            [tNotif.productKey]: myStock + tNotif.quantity,
                            [`total_bought_${tNotif.productKey}`]: Number(prev?.[`total_bought_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        setResultModal({
                            isOpen: true,
                            title: 'Transaksi Impor Berhasil',
                            message: `Berhasil mengimpor ${tNotif.quantity} unit ${tNotif.productKey} dari ${tNotif.partnerName} senilai -${tNotif.totalPrice.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO!`,
                            type: 'success'
                        });
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        return;
                    }

                    if (tNotif.tradeType === 'penawaran_kedutaan_besar') {
                        const partner = tNotif.partnerCountry;
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
                        if (isTradeEmbargoActive(playerCountryName, partner)) {
                            setInboxModalOpen(false);
                            setResultModal({
                                isOpen: true,
                                title: 'Ratifikasi Diblokir oleh Embargo PBB',
                                message: `Perjanjian dagang dengan ${partner} tidak dapat diratifikasi selama embargo ekonomi PBB masih berlaku.`,
                                type: 'error'
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
                                type: 'error'
                            });
                            return;
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
                            message: `Berhasil meratifikasi Perjanjian Hubungan Dagang bilateral dengan ${partner}! Sektor perdagangan aktif dibuka.`,
                            type: 'success'
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
                                type: 'error'
                            });
                            return;
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
                            message: `Berhasil meratifikasi Pakta Non-Agresi Bilateral dengan ${partner}! Perdamaian wilayah tetap terjaga.`,
                            type: 'success'
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
                                type: 'error'
                            });
                            return;
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
                            message: `Berhasil membentuk Aliansi Pertahanan Militer Bersama dengan ${partner}! Bantuan pertahanan dijamin.`,
                            type: 'success'
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
                                type: 'error'
                            });
                            return;
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
                            message: `Berhasil meratifikasi Kontrak Penelitian Joint-R&D dengan ${partner}! Durasi seluruh penelitian nasional berkurang 0,1% per negara mitra.`,
                            type: 'success'
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

                    if (tNotif.tradeType === 'program_nuklir_dimulai' || tNotif.tradeType === 'program_nuklir_selesai') {
                        setInboxModalOpen(false);
                        setActiveMenu("Pertahanan");
                        return;
                    }

                    if (tNotif.tradeType === 'spionase' || tNotif.tradeType === 'sabotase' || tNotif.tradeType === 'diserang' || tNotif.tradeType === 'pemberontakan' || tNotif.tradeType === 'icbm') {
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
                                    attackerCountry,
                                    targetCountry,
                                    notification: tNotif,
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
                        setResultModal({
                            isOpen: true,
                            title: tNotif.tradeType === 'diserang' ? 'Merespon Serangan Militer' : 'Operasi Pertahanan Berhasil',
                            message: `Operasi penanganan "${tNotif.title}" sukses dilaksanakan oleh divisi pertahanan & intelijen nasional!`,
                            type: 'success'
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'keamanan' || tNotif.tradeType === 'bencana_alam' || tNotif.tradeType === 'wabah_penyakit') {
                        const isPoliceIncident = tNotif.tradeType === 'keamanan' ||
                            (tNotif.tradeType === 'bencana_alam' && tNotif.eventType === 'police');
                        const cost = Number((isPoliceIncident ? tNotif.responseCost : undefined) ?? tNotif.bantuanCost ?? 0);
                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < cost) {
                            setResultModal({
                                isOpen: true,
                                title: isPoliceIncident ? 'Operasi Kepolisian Gagal' : 'Gagal Menyalurkan Bantuan',
                                message: `Anggaran negara tidak mencukupi untuk ${isPoliceIncident ? 'mendanai operasi kepolisian' : 'menyalurkan bantuan'} (${budget.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO dari ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO).`,
                                type: 'error'
                            });
                            return;
                        }

                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - cost,
                            tingkat_keamanan: isPoliceIncident
                                ? Math.min(100, Number(prev?.tingkat_keamanan || 0) + 2)
                                : prev?.tingkat_keamanan,
                            kepuasan_masyarakat: Math.min(100, Number(prev?.kepuasan_masyarakat || 50) + (isPoliceIncident ? 1 : 2)),
                            indeks_kesejahteraan: Math.min(100, Number(prev?.indeks_kesejahteraan || 50) + (isPoliceIncident ? 1 : 2))
                        }));

                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true } : n));
                        setResultModal({
                            isOpen: true,
                            title: isPoliceIncident ? 'Operasi Kepolisian Berhasil' : 'Bantuan Darurat Disalurkan',
                            message: isPoliceIncident
                                ? `Operasi kepolisian berhasil didanai sebesar ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO. Tingkat keamanan, kepuasan, dan kesejahteraan meningkat.`
                                : `Berhasil menyalurkan bantuan sebesar ${cost.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO! Kepuasan & Kesejahteraan masyarakat meningkat +2.0%.`,
                            type: 'success'
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
                    if (tNotif.tradeType === 'penawaran_pakta_non_agresi' || tNotif.tradeType === 'penawaran_aliansi_pertahanan' || tNotif.tradeType === 'penawaran_kontrak_penelitian') {
                        if (tNotif.isHandled) {
                            setInboxModalOpen(false);
                            setCountryDetailModalName(tNotif.partnerCountry);
                            setCountryDetailModalOpen(true);
                            return;
                        }
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true, status: 'rejected' } : n));
                        return;
                    }

                    const specialNotifTypes = ['jual', 'beli', 'penawaran_kedutaan_besar', 'penawaran_hubungan_dagang', 'bencana_alam', 'wabah_penyakit', 'keamanan', 'spionase', 'sabotase', 'diserang', 'pemberontakan', 'icbm'];
                    if (specialNotifTypes.includes(tNotif.tradeType)) {
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
                onClearNews={() => setNewsList([])}
            />
            <BottomLeftPenelitianIcon
                onClick={() => {
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
                        }}
                        attackerPower={activeWarAnimation.attackerPower ?? 0}
                        targetPower={activeWarAnimation.targetPower ?? 0}
                        isUserDefender={activeWarAnimation.isPbbCoalition ? isUserDefender : activeWarAnimation.isNpcWar ? false : isUserDefender}
                        isNpcWar={activeWarAnimation.isNpcWar === true}
                        isPbbCoalition={activeWarAnimation.isPbbCoalition === true}
                        onClose={() => {
                            setActiveWarAnimation(null);
                            npcWarQueueRunningRef.current = false;
                            resumeGameTimeAfterWar();
                        }}
                        onResolve={({ action, result }) => {
                            if (isUserDefender) {
                                if (result === 'lose') {
                                    // 1. Potong armada pertahanan 75%
                                    const { updatedDetail: detailAfterLoss, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.75);

                                    // 2. Acak persentase (80% Dirampas, 20% Dianeksasi)
                                    const roll = Math.random() * 100;
                                    const isAnnexed = roll >= 80;

                                    if (isAnnexed) {
                                        // Peluang 20%: DIANEKSASI (GAME OVER)
                                        setCountryDetail(detailAfterLoss);
                                        setAnnexedModalData({
                                            isOpen: true,
                                            countryName: countryDetail?.country || countryDetail?.nama_negara || 'Indonesia',
                                            attackerCountry: activeWarAnimation.attacker,
                                        });
                                    } else {
                                        // Peluang 80%: DIRAMPAS HASIL PRODUKSI (BERTAHAN / LOOTED)
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
                                            message: `Pertahanan negara Anda gagal menahan agresi militer dari ${activeWarAnimation.attacker}. Negara berhasil menepis aneksasi total (peluang selamat 80%), namun seluruh stok hasil produksi (Mineral, Manufaktur, Peternakan, Agrikultur, Perikanan, Olahan Pangan) dirampas habis hingga 0. Dampak populasi: ${lostPopulation.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jiwa (${lossPercent}% populasi), serta kerugian armada 75%: ${lossSummaryText}.`,
                                            type: 'error',
                                        });
                                    }
                                } else {
                                    // Pertahanan Berhasil! (User Win - potong armada user sebesar 25%)
                                    const { updatedDetail: detailAfterWin, lossSummaryText } = applyWarLossesToUserArmada(countryDetail, 0.25);
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
                                        message: `Pasukan pertahanan nasional sukses memukul mundur agresi militer dari ${activeWarAnimation.attacker}! Armada pertahanan mengalami kerugian tempur sebesar 25%: ${lossSummaryText}.`,
                                        type: 'success',
                                        persistent: true,
                                        openInboxOnClose: false,
                                    });
                                }
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
                                !activeWarAnimation.isPlayerCoalitionProposer
                            ) {
                                setActiveWarAnimation(null);
                                npcWarQueueRunningRef.current = false;
                                resumeGameTimeAfterWar();
                                return;
                            }

                            if (mappedAction !== 'aneksasi') {
                                setMilitaryAttackRelation(activeWarAnimation.attacker, activeWarAnimation.target, 25);
                            }

                            window.dispatchEvent(
                                new CustomEvent('trigger_player_attack', {
                                    detail: {
                                        actionType: mappedAction,
                                        targetCountry: activeWarAnimation.target,
                                        warResult: result,
                                    },
                                })
                            );
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
                onClick={handleCanvasCountryClick}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerLeave}
                onWheel={handleCanvasWheel}
            />

            <DiplomacyTracking />

            {!(countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen) && (
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
            />

            {/* Premium Floating Time Controller Widget */}
            <div className="fixed bottom-3 right-3 lg:bottom-5 lg:right-5 xl:bottom-8 xl:right-8 z-40 flex flex-col w-[220px] lg:w-[250px] xl:w-[320px] transition-all">
                {/* Upper Card */}
                <div className="bg-[#0F2424]/90 backdrop-blur-md rounded-t-xl xl:rounded-t-2xl px-3.5 lg:px-4 xl:px-6 pt-3 lg:pt-4 xl:pt-5 pb-7 lg:pb-8 xl:pb-10 border-t border-x border-[#00FFAA]/30 flex flex-col relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2 xl:mb-3.5">
                        {/* Settings gear inside container */}
                        <div className="flex items-center gap-1.5 xl:gap-2">
                            <div className="flex items-center justify-center w-6 h-6 xl:w-8 xl:h-8 rounded-md xl:rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/30 relative">
                                <Settings
                                    className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#00FFAA]"
                                    style={{ animation: 'spin 8s linear infinite' }}
                                />
                            </div>
                        </div>

                        {/* Calendar date label */}
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[8px] xl:text-[9px] font-black text-[#6B8A8A] tracking-wider xl:tracking-widest uppercase mb-0.5 xl:mb-1">SIMULATION CALENDAR</span>
                            <span ref={dateTextRef} className="text-xs lg:text-sm xl:text-lg font-black text-[#E0E0E0] tracking-tight">
                                -
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
                                if (!calendarRef.current) return;
                                const newPaused = calendarRef.current.controls.handlePlayPauseClick(isPaused);
                                setIsPaused(newPaused);
                                if (timeManagerRef.current) {
                                    timeManagerRef.current.setPaused(newPaused);
                                }
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
                setCountryDetail={setCountryDetail}
                currentDate={currentDate}
                playerNetBalanceAdjustment={playerNetBalanceAdjustment}
                adjustPlayerNetBalance={(delta: number) => setPlayerNetBalanceAdjustment((prev) => prev + delta)}
                autoBuildEmbassy={autoBuildEmbassyState}
                onClose={() => {
                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
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

            {/* Custom Premium Save Modal */}
            {isSaveModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <div className="bg-[#FAF6EE] rounded-2xl p-6 border-4 border-[#C4B49C] shadow-2xl w-full max-w-md relative overflow-hidden flex flex-col font-sans">
                        {/* Parchment radial gradient background */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.02)_0%,transparent_100%)] pointer-events-none" />

                        <div className="flex items-center justify-between mb-4 border-b-2 border-[#C4B49C]/30 pb-3 z-10">
                            <span className="text-[12px] font-black text-[#8b7e66] tracking-widest uppercase">SIMPAN PERMAINAN</span>
                            <button
                                onClick={() => setIsSaveModalOpen(false)}
                                className="text-[#8b7e66] hover:text-[#5c3c10] font-black text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 bg-[#e4dac3]/40 border border-[#bfae93]/50 p-3.5 rounded-xl">
                                {selectedCountry && (
                                    <img
                                        src={`https://flagcdn.com/w80/${selectedCountry.iso.toLowerCase()}.png`}
                                        className="w-8 h-5 rounded-sm object-cover border border-black/10 shadow-sm"
                                        alt="flag"
                                    />
                                )}
                                <div className="flex flex-col leading-tight">
                                    <span className="text-[11px] font-black text-[#5c3c10] uppercase">NEGARA SIMULASI</span>
                                    <span className="text-[13px] font-black text-[#2e261a] uppercase">{selectedCountry?.country}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-[#8b7e66] tracking-wider uppercase">NAMA SAVE FILE</label>
                                <input
                                    type="text"
                                    value={saveNameInput}
                                    onChange={(e) => setSaveNameInput(e.target.value)}
                                    className="w-full bg-[#FAF6EE] border-2 border-[#C4B49C] rounded-xl px-4 py-3 text-[#2e261a] font-bold placeholder-[#8b7e66]/50 focus:outline-none focus:border-[#5c3c10] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] text-sm"
                                    placeholder="Masukkan nama save..."
                                    maxLength={100}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#8b7e66] font-bold border-t border-[#C4B49C]/30 pt-3 mt-1">
                                <span>Kalender: {calendarRef.current?.display.getDateLabel() || (timeManagerRef.current?.getFormattedDate() || '-')}</span>
                                <span>Kas: {countryDetail?.anggaran ? `${countryDetail.anggaran} NEO` : '-'}</span>
                            </div>

                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() => setIsSaveModalOpen(false)}
                                    className="flex-1 py-3 px-4 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] font-black text-xs uppercase hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer text-center"
                                    disabled={isSaving}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSaveGame}
                                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] text-[#5c3c10] border-2 border-[#1e2f3d]/10 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:brightness-110 active:scale-98 font-black text-xs uppercase transition-all cursor-pointer text-center"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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

            <ResultModal
                isOpen={resultModal.isOpen}
                title={resultModal.title}
                message={resultModal.message}
                type={resultModal.type}
                onClose={() => {
                    setResultModal(prev => ({ ...prev, isOpen: false }));
                    if (resultModal.openInboxOnClose !== false) setInboxModalOpen(true);
                }}
            />
        </main>
    );
}
