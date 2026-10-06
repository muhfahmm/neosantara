// detail path: c:\EM\apps\src\app\page\map_system\map-system.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    Play, Pause, Settings, Palmtree, Shield
} from 'lucide-react';
import Link from 'next/link';
import { COUNTRIES_DATA, CAPITALS_DATA } from './map-data';
import countryPaths from './country-paths.json';
import { SimulationTimeManager, createSimulationCalendar } from '../time_controllers';
import { handleGameRestart } from '../time_controllers';
import dynamic from 'next/dynamic';

const GameMenuModal = dynamic(() => import('../navbar/GameMenuModal').then(m => m.GameMenuModal), { ssr: false });
const ConfirmRestartModal = dynamic(() => import('../navbar/ConfirmRestartModal').then(m => m.ConfirmRestartModal), { ssr: false });
const ModalsPeringatanPeringkat = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsPeringatanPeringkat').then(m => m.ModalsPeringatanPeringkat), { ssr: false });
const ModalsKudeta = dynamic(() => import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta'), { ssr: false });
type KudetaType = import('./menu_notifikasi/notifikasi_peringatan/modalsKudeta').KudetaType;
const RequireEmbassyModal = dynamic(() => import('./RequireEmbassyModal').then(m => m.RequireEmbassyModal), { ssr: false });
import { Navbar } from '../navbar/Navbar';
import BottomNav from '../navigasi_menu/2_navigasi_bawah/BottomNav';
import ModalsManager from '../navigasi_menu/2_navigasi_bawah/ModalsManager';
import { calculateDailyPopulationChange, updateDailyPopulation } from '@/app/logic/populations_logic/population_logic';
import { logger } from '../../../lib/logger';
const CountryDetailModal = dynamic(() => import('../detail_negara/detail_negara').then(m => m.CountryDetailModal), { ssr: false });
const NegaraUserModal = dynamic(() => import('./negara_user'), { ssr: false });
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateDailyMaterialProduction } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic';
import { getDaysElapsed } from '@/app/logic/production_logic';
import { calculateKepuasan, calculateKeterbukaanScore } from '@/app/logic/kepuasanCalculator';
import { calculatePresidentRating, getMonthsDifference } from '@/app/logic/peringkatCalculator';
import { calculateKesejahteraan, calculateKesejahteraanDecay } from '@/app/logic/kesejahteraanCalculator';
const TopLeftIcon = dynamic(() => import('../menus/inbox/inboxModals'), { ssr: false });
const TopRightGiftIcon = dynamic(() => import('../menus/reward/rewardModals'), { ssr: false });
const TopRightNewsIcon = dynamic(() => import('../menus/news/newsModals'), { ssr: false });
const BottomLeftPenelitianIcon = dynamic(() => import('../menus/penelitian/penelitianModals'), { ssr: false });
import { NotificationMessage, getKepuasanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getPeringkatWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/2_peringkat/peringkatLogic';
import { getKesejahteraanWarningMessage } from '../menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanLogic';
import { getTradeAgreementsForCountry } from '../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { getEmbassiesForCountry } from '../../../../../json/database_kedutaan_besar/embassyRegistry';
import { getRelationValue, setRelationModifier } from '../../../../../json/database_hubungan_antar_negara/relationsRegistry';
import { playerHasEmbassyWith, playerHasEmbassyOrTradePartners } from '../detail_negara/1_informasi_umum/1_kedutaan_besar/logic/kedutaanBesarLogic';
import { generateAITradeBeliNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/2_beli/tradeBeliLogic';
import { generateAITradeJualNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/1_jual/tradeJualLogic';
import { generateTradeRelationOfferNotification } from '../menus/inbox/logic/3_notifikasi_perdagangan/3_hubungan_dagang/tradeRelationLogic';
import { checkAndGenerateEmbassyOffers, createEmbassyOfferNotification } from '../menus/inbox/logic/4_notifikasi_kedubes/1_penawaran_kedutaan_besar';
import { generateBencanaAlamNotification } from '../menus/inbox/logic/6_notifikasi_bencana/1_bencana_alam/bencanaLogic';
import { generateWabahPenyakitNotification } from '../menus/inbox/logic/6_notifikasi_bencana/2_wabah_penyakit/wabahLogic';
import { generateSpionaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/1_spionase/spionaseLogic';
import { generateSabotaseNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/2_sabotase/sabotaseLogic';
import { generateDiserangNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/3_diserang/diserangLogic';
import { generatePemberontakanNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/4_pemberontakan/pemberontakanLogic';
import { generateICBMNotification, generateProgramNuklirSelesaiNotification } from '../menus/inbox/logic/2_notifikasi_pertahanan/5_icbm/icbmLogic';
import { generateListrikDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/1_kelistrikan/listrikDefisitLogic';
import { generateHunianDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/2_hunian/hunianDefisitLogic';
import { generatePanganDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/3_pangan/panganDefisitLogic';
import { generateTempatUmumDefisitNotification } from '../menus/inbox/logic/8_kebutuhan_pokok_warga/4_tempat_umum/tempatUmumDefisitLogic';
import { generateNonAggressionOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/1_pakta_non_agresi/nonAggressionLogic';
import { generateDefenseAllianceOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/2_aliansi_pertahanan/defenseAllianceLogic';
import { generateResearchContractOfferNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/3_kontrak_penelitian/researchContractLogic';
import { generateHubunganPanasNotification } from '../menus/inbox/logic/5_notifikasi_geopolitik/4_hubungan_panas/hubunganPanasLogic';
import { evaluateAIResolusiPBBTrigger } from '../menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/1_resolusi/resolusiPBBLogic';
import { evaluateAIKeamananPBBTrigger } from '../menus/inbox/logic/5_notifikasi_geopolitik/5_pbb/2_keamanan/keamananPBBLogic';
import { clearActiveResolutionsForSession, tickPBBResolutions, spawnAIResolutionFromTrigger } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/resolusiPBBUILogic';
import { clearActiveSecurityCouncilItems, tickPBBSecurityCouncil, spawnAISecurityCouncilFromTrigger } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic';
import { initCountryIsoFromDatabase, getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';
import { calculateLayananPublikScore } from '@/app/logic/kepuasanCalculator';
import { getCountryConsumptionBreakdown } from '../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic';
import { getKelistrikanFuelRequirements } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/requirements_logic/1_produksi/1_kelistrikan/fuelLogic';
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
import { NewsItemData } from '../menus/news/newsModals';
import { calculateFoodCoverageByGroup } from '../navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic';
import {
    clearExpelledOrganizationCountries,
    expelCountryFromOrganizations
} from '@/../../json/database_organisasi_internasional';
import {
    PROVINCE_ACTION_EVENT,
    type ProvinceActionEventDetail
} from '../detail_negara/1_informasi_umum/provinsi_logic/provinceActionTypes';
import {
    ANNEXED_AGGREGATE_KEYS,
    releaseAnnexedProvince,
    type AnnexedContribution
} from '../detail_negara/1_informasi_umum/provinsi_logic/1_beri_kemerdekaan';
import {
    createProvinceReferendum,
    hasProvinceReferendumEnded,
    resolveProvinceReferendum,
    type ProvinceReferendum
} from '../detail_negara/1_informasi_umum/provinsi_logic/6_ketegangan/3_referendum';

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

function applyInvasionRelationPenalty(attackerCountry: string, minimum: number, maximum: number): number {
    const penalty = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
    const normalizedAttacker = attackerCountry.trim().toLowerCase();

    COUNTRIES_DATA.forEach(country => {
        if (country.country.trim().toLowerCase() !== normalizedAttacker) {
            setRelationModifier(attackerCountry, country.country, -penalty);
        }
    });

    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('country_relations_updated'));
    }

    return penalty;
}

export default function MapPage() {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countryDetail, setCountryDetail] = useState<any>(null);
    const [metadata, setMetadata] = useState<Record<string, any>>({});

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
    const [speed, setSpeed] = useState(1);
    const [currentDate, setCurrentDate] = useState<Date>(new Date());

    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [saveNameInput, setSaveNameInput] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isPresidentMenuOpen, setIsPresidentMenuOpen] = useState(false);
    const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('Peta Taktis');
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
    const [newsList, setNewsList] = useState<NewsItemData[]>([]);

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
        const targetIsoNorm = targetIso.toLowerCase();
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

        setCountryColorOverrides(previous => ({ ...previous, ...overrideUpdates }));

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

        (window as any).neosantara_country_color_overrides = nextOverrides;
        (window as any).neosantara_annexed_countries = nextAnnexed;
        try {
            localStorage.setItem('neosantara_country_color_overrides', JSON.stringify(nextOverrides));
            localStorage.setItem('neosantara_annexed_countries', JSON.stringify(nextAnnexed));
        } catch (error) {
            console.error('Failed to persist annexed territory state:', error);
        }
        window.dispatchEvent(new CustomEvent('map_territory_color_updated', {
            detail: { targetCountry, newColor: attackerColor, attackerCountry }
        }));
    };

    // Override warna aneksasi & status aneksasi hanya berlaku selama sesi: refresh => kembali ke warna/status default.
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem('neosantara_country_color_overrides');
                localStorage.removeItem('neosantara_annexed_countries');
            } catch (e) {
                console.error('Failed to clear country color overrides / annexed state:', e);
            }
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

    // Listener custom event ketika pemain berhasil meminta negara sekutu menyerang negara target
    useEffect(() => {
        const handleRequestedInvasion = (e: Event) => {
            const detail = (e as CustomEvent)?.detail;
            if (!detail) return;

            const { attackerCountry, targetCountry, amount } = detail;
            const attackerIso = getIsoForCountryName(attackerCountry) || 'un';
            const targetIso = getIsoForCountryName(targetCountry) || 'un';

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

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
            if (warBanActive || !hasInvasionMandate) {
                const reason = warBanActive
                    ? 'war_ban'
                    : hasActiveApprovedInvasionResolutionForDifferentTarget(attackerCountry, targetCountry)
                        ? 'wrong_military_target'
                        : 'missing_military_resolution';
                const sanctionsNotifications = warBanActive
                    ? submitWarBanViolationSanctions(attackerCountry, targetCountry, dateStr)
                    : submitInvasionViolationSanctions(attackerCountry, targetCountry, dateStr, reason);
                setNotifications(prev => [...sanctionsNotifications, ...prev]);
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
                message: `Permintaan serangan telah diproses! Angkatan Bersenjata ${attackerCountry} resmi melancarkan serangan terhadap ${targetCountry} setelah menerima bayaran $${Number(amount || 0).toLocaleString('id-ID')}. Berita resmi geopolitik telah diterbitkan!`,
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
                    const expelledOrganizations = expelCountryFromOrganizations(attackerCountry);
                    if (expelledOrganizations.length > 0) {
                        setNotifications(prev => [{
                            id: `notif-organization-expulsion-${Date.now()}`,
                            title: '🚫 KEANGGOTAAN ORGANISASI DICABUT',
                            sender: 'Sekretariat Organisasi Internasional',
                            message: `${attackerCountry} dikeluarkan dari ${expelledOrganizations.length} organisasi internasional karena menyerang ${targetCountry} tanpa resolusi invasi yang disetujui.`,
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
                    const relationPenalty = applyInvasionRelationPenalty(attackerCountry, 5, 10);
                    setNotifications(prev => [{
                        id: `notif-unapproved-invasion-relations-${Date.now()}`,
                        title: '📉 HUBUNGAN DIPLOMATIK MEMBURUK',
                        sender: 'Kementerian Luar Negeri',
                        message: `Hubungan diplomatik ${attackerCountry} dengan negara-negara lain turun ${relationPenalty} poin karena menyerang ${targetCountry} tanpa mandat Resolusi Invasi PBB yang sesuai.`,
                        timestamp: dateStr,
                        type: 'peringkat',
                        value: relationPenalty,
                        isRead: false
                    }, ...prev]);
                }
            }

            if (actionType === 'aneksasi') {
                // 1. Berita Invasi
                const invNews = generateInvasionNews(attackerCountry, attackerIso, targetCountry, targetIso, dateStr);
                newNewsItems.push(invNews);

                // 2. Berita Aneksasi — Gunakan warna PEMAIN di peta (#10b981 hijau),
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

                // 3. Gabungkan statistik (populasi, kas negara, kepuasan, kesejahteraan, seluruh bangunan & militer) dari negara target ke user
                const targetRelPath = Object.entries(countryPaths as Record<string, string>).find(
                    ([name]) => name.toLowerCase().trim() === targetCountry.toLowerCase().trim()
                )?.[1];

                const mergeTargetDataToUser = async () => {
                    let targetData: any = null;
                    if (targetRelPath) {
                        try {
                            const res = await fetch(`/api/country-data?path=${encodeURIComponent(targetRelPath)}`);
                            const data = await res.json();
                            if (!data?.error) targetData = data;
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
                                const targetVal = Number(targetData[key] ?? targetData?.armada?.[key] ?? targetData?.pertahanan?.[key] ?? 0);
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
                const notifMsg: NotificationMessage = {
                    id: `notif-player-annex-${Date.now()}`,
                    title: `🚩 ANEKSASI WILAYAH BERHASIL`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: `Pasukan militer Anda telah sukses merebut dan memperluas wilayah kedaulatan ${attackerCountry} dengan mencaplok seluruh teritorial ${targetCountry}! Peta dunia telah diperbarui.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 100,
                    isRead: false
                };
                setNotifications(prev => [notifMsg, ...prev]);

            } else if (actionType === 'jarah') {
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

                const notifMsg: NotificationMessage = {
                    id: `notif-player-loot-${Date.now()}`,
                    title: `💰 OPERASI PENJARAHAN BERHASIL`,
                    sender: `Markas Besar Angkatan Bersenjata (${attackerCountry})`,
                    message: `Operasi penjarahan atas ${targetCountry} berhasil dilancarkan! Sumber daya alam dan rampasan perang senilai 25.000.000 NEO telah diamankan.`,
                    timestamp: dateStr,
                    type: 'peringkat',
                    value: 80,
                    isRead: false
                };
                setNotifications(prev => [notifMsg, ...prev]);

            } else if (actionType === 'mundur') {
                // Action: mundur
                const relationPenalty = applyInvasionRelationPenalty(attackerCountry, 1, 5);
                setNotifications(prev => [{
                    id: `notif-retreat-relations-${Date.now()}`,
                    title: '📉 HUBUNGAN DIPLOMATIK MENURUN',
                    sender: 'Kementerian Luar Negeri',
                    message: `Hubungan diplomatik ${attackerCountry} dengan negara-negara lain turun ${relationPenalty} poin setelah pasukan mundur dari operasi terhadap ${targetCountry}.`,
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
                    message: `Operasi agresi terhadap ${targetCountry} dibatalkan. Pasukan ditarik mundur ke markas utama tanpa aneksasi wilayah.`,
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

    // Kamera AKTUAL dari engine WASM (ditangkap dari ctx.setTransform), sehingga overlay
    // bendera selalu presisi walau ada clamping / auto-center negara / lerp di sisi Rust.
    const cameraRef = useRef({ scale: 1.0, offsetX: 0.0, offsetY: 0.0, width: 1000, height: 600 });
    const [capitalTransform, setCapitalTransform] = useState({ scale: 1.0, offsetX: 0, offsetY: 0, width: 1000, height: 600 });

    useEffect(() => {
        let animId: number;
        const updateLoop = () => {
            const cam = cameraRef.current;
            setCapitalTransform(prev =>
                prev.scale === cam.scale && prev.offsetX === cam.offsetX && prev.offsetY === cam.offsetY &&
                prev.width === cam.width && prev.height === cam.height
                    ? prev
                    : { scale: cam.scale, offsetX: cam.offsetX, offsetY: cam.offsetY, width: cam.width, height: cam.height }
            );
            animId = requestAnimationFrame(updateLoop);
        };
        animId = requestAnimationFrame(updateLoop);
        return () => cancelAnimationFrame(animId);
    }, []);
    const [penelitianModalOpen, setPenelitianModalOpen] = useState(false);
    const [presidentRating, setPresidentRating] = useState<number>(50);
    const [kesejahteraan, setKesejahteraan] = useState<number>(50);
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const processedReferendumsRef = useRef(new Set<string>());
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
    const [resultModal, setResultModal] = useState<{ isOpen: boolean; title: string; message: string; type?: 'success' | 'error' | 'info' }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'success'
    });

    // Auto close resultModal after 3 seconds (3000ms) & reopen inboxModal
    useEffect(() => {
        if (!resultModal.isOpen) return;

        const timer = setTimeout(() => {
            setResultModal(prev => ({ ...prev, isOpen: false }));
            setInboxModalOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [resultModal.isOpen]);

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
            setCountryDetail((prev: any) => ({
                ...prev,
                pending_notifications: []
            }));
        }
    }, [countryDetail?.pending_notifications, setCountryDetail]);

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
                'Jepang', 'Amerika Serikat', 'Jerman', 'Inggris', 'Prancis', 'Tiongkok',
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
                const premiumProducts = ["uranium", "pabrik_semikonduktor", "logam_tanah_jarang", "pabrik_mesin_mobil", "litium"];
                const productKey = premiumProducts[Math.floor(Math.random() * premiumProducts.length)];
                const quantity = Math.floor(Math.random() * 300) + 20;
                const prices: Record<string, number> = {
                    uranium: 8000, pabrik_semikonduktor: 4000, logam_tanah_jarang: 5000, pabrik_mesin_mobil: 15000, litium: 3000
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

            // 4. Bencana Alam & Wabah Penyakit (25% per bulan, 60% Bencana Alam, 40% Wabah Penyakit)
            if (Math.random() < 0.25) {
                const isBencana = Math.random() < 0.60;
                if (isBencana) {
                    const disaster = generateBencanaAlamNotification(userCountryName, currentDateStr);
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
                } else {
                    const outbreak = generateWabahPenyakitNotification(userCountryName, currentDateStr);
                    const durationDays = outbreak.category.includes('Pandemi')
                        ? 60
                        : outbreak.category.includes('Mutasi')
                            ? 21
                            : outbreak.category.includes('Hewan') || outbreak.category.includes('Tumbuhan')
                                ? 14
                                : 7;
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
                                    startDate: currentDateStr,
                                    durationDays
                                }
                            ]
                        };
                    });
                }
            }

            // 5. Notifikasi Pertahanan & Intelijen (Spionase, Sabotase, Diserang, Pemberontakan, ICBM)
            if (Math.random() < 0.25) {
                const defRoll = Math.random();
                const randomPartner = internationalPool[Math.floor(Math.random() * internationalPool.length)];
                if (defRoll < 0.35) {
                    newNotifsToAdd.push(generateSpionaseNotification(randomPartner, currentDateStr));
                } else if (defRoll < 0.65) {
                    newNotifsToAdd.push(generateSabotaseNotification(randomPartner, currentDateStr));
                } else if (defRoll < 0.85) {
                    newNotifsToAdd.push(generateDiserangNotification(randomPartner, currentDateStr));
                } else if (defRoll < 0.95) {
                    newNotifsToAdd.push(generatePemberontakanNotification('Papua Barat', currentDateStr));
                } else {
                    newNotifsToAdd.push(generateICBMNotification(randomPartner, 'Jakarta', currentDateStr));
                }
            }

            // 5B. Penawaran Pakta Non-Agresi Bilateral (Membutuhkan Kedutaan Besar, 25% per bulan ~ 3-5x/tahun)
            if (Math.random() < 0.25) {
                const randomPartner = embassyPartnerPool[Math.floor(Math.random() * embassyPartnerPool.length)];
                newNotifsToAdd.push(generateNonAggressionOfferNotification(randomPartner, userCountryName, currentDateStr));
            }

            // 5C. Penawaran Aliansi Pertahanan Bilateral (Membutuhkan Kedutaan Besar, 25% per bulan ~ 3-5x/tahun)
            if (Math.random() < 0.25) {
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
                const annualInvasions = warBanActive
                    ? proposedInvasions.filter(() => Math.random() < 0.2)
                    : proposedInvasions;

                if (warBanActive && annualInvasions.length < proposedInvasions.length) {
                    newNotifsToAdd.push({
                        id: `notif-war-ban-ai-block-${currentDateStr}`,
                        title: '🕊️ LARANGAN PERANG PBB MENGHENTIKAN SERANGAN',
                        sender: 'Sekretariat Perserikatan Bangsa-Bangsa',
                        message: `${proposedInvasions.length - annualInvasions.length} rencana serangan negara AI dibatalkan. Larangan perang aktif; hanya 20% serangan AI yang biasanya terjadi dapat lolos.`,
                        timestamp: currentDateStr,
                        type: 'peringkat',
                        value: 100,
                        isRead: false
                    });
                }

                if (annualInvasions.length > 0) {
                    const generatedNewsItems: NewsItemData[] = [];
                    annualInvasions.forEach(inv => {
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
    const wasmModuleRef = useRef<any>(null);
    const hasInitRef = useRef(false);

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
        if (inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen) {
            window.dispatchEvent(new Event('hide_strategy_modal'));
        } else {
            window.dispatchEvent(new Event('show_strategy_modal'));
        }
    }, [inboxModalOpen, giftModalOpen, newsModalOpen, penelitianModalOpen]);

    // Close inbox, gift, news, and penelitian modals if a navigation menu modal is opened
    useEffect(() => {
        if (!nonModalMenus.includes(activeMenu)) {
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
            setPenelitianModalOpen(false);
        }
    }, [activeMenu]);

    // Initialize high-performance simulation clock on mount
    useEffect(() => {
        const manager = new SimulationTimeManager(
            (formattedDate) => {
                if (dateTextRef.current) {
                    dateTextRef.current.textContent = formattedDate;
                }
                // Update React state dengan tanggal baru
                const newDate = manager.getCurrentDate();
                console.log('[MapPage Callback] Date changed:', {
                    formatted: formattedDate,
                    newDate: newDate.toDateString(),
                    timestamp: Date.now()
                });
                setCurrentDate(newDate);
            },
            (progress) => {
                if (progressBarRef.current) {
                    progressBarRef.current.style.width = `${progress}%`;
                }
            }
        );

        // Assign manager to ref immediately after construction
        timeManagerRef.current = manager;

        // Create calendar system with factory
        const calendarSystem = createSimulationCalendar(manager);
        calendarRef.current = calendarSystem;

        // Check if there is a save to load to restore the date
        if (typeof window !== 'undefined') {
            clearExpelledOrganizationCountries();
            const loadSaveStr = localStorage.getItem('presiden_simulator_load_save');
            const newGameMarker = localStorage.getItem('presiden_simulator_new_game');
            if (newGameMarker === '1') {
                clearActiveResolutionsForSession();
                clearActiveSecurityCouncilItems();
                clearReportedInvasionViolations();
                localStorage.removeItem('hutangModalLoanSources');
                localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
                localStorage.removeItem('pbb_active_resolutions_v4');
                localStorage.removeItem('pbb_active_keamanan_v4');
                localStorage.removeItem('pbb_reported_war_ban_violations_v1');
                localStorage.removeItem('neosantara_country_color_overrides');
                localStorage.removeItem('neosantara_annexed_countries');
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
            manager.destroy();
        };
    }, []);

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

    // Reusable function to load stats for a country
    const loadCountryStats = async (countryName: string, capitalName: string) => {
        const relPath = Object.entries(countryPaths).find(
            ([name]) => name.toLowerCase() === countryName.toLowerCase()
        )?.[1];

        if (!relPath) return;

        try {
            const res = await fetch(`/api/country-data?path=${relPath}`);
            const mergedData = await res.json();

            if (mergedData?.error) {
                console.warn(`Country data load error for ${countryName}:`, mergedData.error);
                return;
            }

            const defaultPrices = await loadDefaultPrices(countryName);

            setCountryDetail({
                ...mergedData,
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
                pabrik_semikonduktor: mergedData.pabrik_semikonduktor ?? mergedData.semikonduktor ?? 0,
                pabrik_mesin_mobil: mergedData.pabrik_mesin_mobil ?? mergedData.mobil ?? 0,
                pabrik_mesin_motor: mergedData.pabrik_mesin_motor ?? mergedData.sepeda_motor ?? 0,
                semen_beton: mergedData.semen_beton ?? 0,
                kayu: mergedData.kayu ?? 0,
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
            const loadSaveStr = localStorage.getItem('presiden_simulator_load_save');
            if (loadSaveStr) {
                try {
                    const savedState = JSON.parse(loadSaveStr);
                    const chosen = COUNTRIES_DATA.find(
                        c => c.country.toLowerCase() === savedState.country_name.toLowerCase()
                    );
                    if (chosen) {
                        setSelectedCountry(chosen);

                        // Restore countryDetail from saved state, or use parsed countryDetail if available
                        let restoredDetail: any = {
                            capital: savedState.capital || chosen.capital,
                            jumlah_penduduk: Number(savedState.jumlah_penduduk),
                            anggaran: Number(savedState.anggaran),
                            ideology: savedState.ideology || '-',
                            religion: savedState.religion || '-',
                            un_vote: Number(savedState.un_vote),
                            kepuasan: Number(savedState.kepuasan) || 50
                        };

                        // If full countryDetail was saved (includes accumulated_* and build_date_* fields)
                        if (savedState.countryDetail && typeof savedState.countryDetail === 'object') {
                            restoredDetail = { ...restoredDetail, ...savedState.countryDetail };
                        }

                        setCountryDetail(restoredDetail);
                        if (restoredDetail.presidentRating !== undefined) {
                            setPresidentRating(Number(restoredDetail.presidentRating));
                        }
                        if (restoredDetail.kesejahteraan !== undefined) {
                            setKesejahteraan(Number(restoredDetail.kesejahteraan));
                        }

                        // Clean up saved state from localStorage so it doesn't re-apply
                        localStorage.removeItem('presiden_simulator_load_save');
                        return; // Done restoring save!
                    }
                } catch (e) {
                    console.error("Failed to parse loaded save state:", e);
                }
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
        logger.log('MapPage', 'Date changed to:', currentDateStr);
        if (typeof window !== 'undefined') {
            try { localStorage.setItem('neosantara_current_game_date', currentDateStr); } catch (e) {}
        }

        // Tick PBB resolutions and Security Council countdown & AI 206 country voting logic
        if (typeof tickPBBResolutions === 'function') {
            tickPBBResolutions(currentDateStr, (newNotif) => {
                setNotifications((prev: any[]) => [newNotif, ...prev]);
            }, selectedCountry?.country);
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
            "pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu",
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

    // ✅ NEW: Initialize population metrics when countryDetail first loads
    useEffect(() => {
        if (!countryDetail) return;

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
    }, [countryDetail?.jumlah_penduduk, countryDetail?.active_outbreaks, countryDetail?.active_disaster_effects, selectedCountry?.country, metadata, currentDate]);

    useEffect(() => {
        if (!countryDetail || !currentDate) return;

        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;

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
                resourceKey => getEconomicEmbargoProductionMultiplier(playerCountryName, resourceKey)
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

        setCountryDetail((prev: any) => {
            if (!prev) return prev;

            const currentPopulationMetrics = calculateDailyPopulationChange(
                prev,
                selectedCountry?.country,
                metadata,
                currentDateStr
            );
            const populationUpdates = updateDailyPopulation(
                prev,
                currentPopulationMetrics,
                selectedCountry?.country,
                metadata,
                currentDateStr
            );
            const previousCrisisTiers = prev.population_crisis_tiers;
            const currentCrisisTiers = {
                pangan: currentPopulationMetrics.foodTier,
                hunian: currentPopulationMetrics.housingTier,
                overpopulasi: currentPopulationMetrics.overpopulationTier,
                kesehatan: currentPopulationMetrics.healthTier,
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
                    title: `${currentPopulationMetrics.populationStatus.label} / ${currentPopulationMetrics.populationStatus.labelEn}`,
                    sender: 'Kementerian Kependudukan / Ministry of Population',
                    message: `${crisisLabels[key]} memburuk ke Tier ${tier}. Pertumbuhan bersih: ${currentPopulationMetrics.netDailyChange.toLocaleString('id-ID')} jiwa/hari. / Worsened to Tier ${tier}. Net growth: ${currentPopulationMetrics.netDailyChange.toLocaleString('en-US')} people/day.`,
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

            const nextKepuasan = Math.min(100, parseFloat(((prev.kepuasan ?? 50) + currentCompletedBoost).toFixed(1)));

            // --- HITUNG PENURUNAN PERINGKAT BERDASARKAN KEPUASAN (menggunakan peringkatCalculator) ---
            const monthsPassed = lastDate ? getMonthsDifference(lastDate, currentDateStr) : 0;

            const keterbukaanScore = calculateKeterbukaanScore(prev);
            const ratingResult = calculatePresidentRating({
                currentRating: prev.presidentRating ?? 50,
                ratingMonthCounter: prev.rating_month_counter ?? 0,
                lastRatingThreshold: prev.last_rating_threshold ?? 12,
                monthsPassed,
                currentKepuasan: nextKepuasan,
                keterbukaanScore,
                currentCompletedBoost: currentCompletedBoost,
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

            return {
                ...prev,
                ...updates,
                ...populationUpdates,
                anggaran: (Number(prev.anggaran) || 0) + netBalance,
                satisfaction: prev.satisfaction, // Preserve satisfaction scores
                programNuklirActive: nextProgramNuklirActive,
                population_crisis_tiers: currentCrisisTiers,
                pending_notifications: [...nextPendingNotifications, ...newCrisisNotifications],
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
                embassies: nextEmbassies,
                removedEmbassies: nextRemovedEmbassies,
                kepuasan: nextKepuasan,
                presidentRating: ratingResult.presidentRating,
                rating_month_counter: ratingResult.rating_month_counter,
                last_rating_threshold: ratingResult.last_rating_threshold,
                kesejahteraan: nextKesejahteraan,
                kesejahteraan_bonus: nextKesejahteraanBonus,
                kesejahteraan_decay: nextKesejahteraanDecay,
                kesejahteraan_month_counter: decayResult.kesejahteraan_month_counter,
                last_kesejahteraan_threshold: decayResult.last_kesejahteraan_threshold,
            };
        });
    }, [currentDate, countryDetail, metadata, selectedCountry?.country]);

    // ─── Auto-refresh kepuasan di navbar ────────────────────────────────
    // Hitung ulang kepuasan setiap kali countryDetail atau metadata berubah
    // sehingga nilai di navbar selalu up-to-date tanpa harus buka modal
    useEffect(() => {
        if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return;

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
                // Reset country color overrides dan data aneksasi saat restart game
                window.localStorage.removeItem('neosantara_country_color_overrides');
                window.localStorage.removeItem('neosantara_annexed_countries');
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

        setIsSaving(true);
        try {
            const saveName = saveNameInput.trim()
                || (calendarRef.current?.calendar.formatSaveName(selectedCountry.country)
                    || `Simulasi ${selectedCountry.country} - ${timeManagerRef.current?.getFormattedDate() || 'Hari Ini'}`);
            const gameDate = timeManagerRef.current ? timeManagerRef.current.getCurrentDate().toISOString() : new Date().toISOString();

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
                        presidentRating: presidentRating
                    }, // Save entire countryDetail with all production data and president rating
                    countryColorOverrides, // Simpan data aneksasi wilayah
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
            setIsSaving(false);
        }
    };

    // Initial map canvas and WASM initialization hook
    useEffect(() => {
        const initMap = async () => {
            if (hasInitRef.current) return;
            hasInitRef.current = true;

            try {
                // Ensure overrides state is clean or reads from current memory window
                let loadedColorOverrides: Record<string, string> = (typeof window !== 'undefined' ? (window as any).neosantara_country_color_overrides : {}) || {};


                const [wasmModule, { WORLD_GEOJSON }] = await Promise.all([
                    import('../../../wasm/map-engine-rs/map_engine_rs'),
                    import('./world-geojson')
                ]);
                const rawGeojsonStr = typeof WORLD_GEOJSON === 'string' ? WORLD_GEOJSON : JSON.stringify(WORLD_GEOJSON);
                const geojsonObj = typeof WORLD_GEOJSON === 'string' ? JSON.parse(WORLD_GEOJSON) : (WORLD_GEOJSON as any);

                if (typeof window !== 'undefined') {
                    try {
                        (window as any).neosantara_world_geojson_features = geojsonObj.features;
                    } catch (err) {
                        console.error("Failed to parse WORLD_GEOJSON features for map engine:", err);
                    }
                }
                await wasmModule.default(); // Initialize WASM module first
                wasmModuleRef.current = wasmModule;

                // After init, the exported functions are available on the module
                const { start_map_engine, set_selected_country_on_map } = wasmModule;

                const mapCanvasEl = document.getElementById('map-canvas') as HTMLCanvasElement | null;
                const mapCtx = mapCanvasEl?.getContext('2d');
                if (mapCanvasEl && mapCtx) {
                    // Hook fill pipeline: engine draws features in GeoJSON order, one fill() each.
                    let fillCount = 0;
                    let realFillStyle: any = '#000';
                    const origFill = mapCtx.fill.bind(mapCtx) as (...a: any[]) => void;
                    const origFillRect = mapCtx.fillRect.bind(mapCtx);
                    (mapCtx as any).fill = (...a: any[]) => { fillCount++; origFill(...a); };
                    (mapCtx as any).fillRect = (...a: any[]) => { fillCount = 0; origFillRect(a[0], a[1], a[2], a[3]); };
                    Object.defineProperty(mapCtx, 'fillStyle', {
                        configurable: true,
                        get: () => realFillStyle,
                        set: (v: any) => {
                            realFillStyle = v;
                            const w = window as any;
                            const feats = w.neosantara_world_geojson_features;
                            const overrides = w.neosantara_country_color_overrides;
                            const annexedCountries = w.neosantara_annexed_countries || {};
                            if (
                                typeof v === 'string' && feats && overrides &&
                                v !== '#10b981' && v !== '#1e3a8a' && v !== '#fbbf24' && v !== 'white' &&
                                fillCount < feats.length
                            ) {
                                const p = feats[fillCount]?.properties;
                                if (p) {
                                    const iso = String(p.ISO_A2 || p.ISO_A2_EH || '').toLowerCase();
                                    const iso3 = String(p.ISO_A3 || p.ISO_A3_EH || '').toLowerCase();
                                    const names = [p.NAME, p.ADMIN, p.NAME_LONG, p.GEOUNIT, p.NAME_ID, p.NAME_EN, p.NAME_IND]
                                        .filter(Boolean).map((s: string) => s.toLowerCase());

                                    const isAfg = iso === 'af' || names.includes('afghanistan');
                                    const isJpn = iso === 'jp' || names.includes('japan') || names.includes('jepang');
                                    const isNzl = iso === 'nz' || names.includes('new zealand') || names.includes('selandia baru');

                                    for (const [key, color] of Object.entries(overrides)) {
                                        const k = key.toLowerCase().trim();
                                        const kClean = k.replace(/[^a-z0-9]/g, '');
                                        const stillAnnexed = Object.entries(annexedCountries).some(([annexedKey, info]) =>
                                            annexedKey.toLowerCase().trim() === k &&
                                            typeof info === 'object' && info !== null && 'attackerCountry' in info
                                        );
                                        if (!stillAnnexed) continue;
                                        if (
                                            (iso && iso !== '-99' && k === iso) ||
                                            (iso3 && iso3 !== '-99' && k === iso3) ||
                                            names.some(n => n === k || (n.length > 3 && (n.includes(k) || k.includes(n)))) ||
                                            (kClean && names.some(n => n.replace(/[^a-z0-9]/g, '') === kClean)) ||
                                            (isAfg && (k === 'afganistan' || k === 'afghanistan')) ||
                                            (isJpn && (k === 'jepang' || k === 'japan')) ||
                                            (isNzl && (k === 'selandia baru' || k === 'new zealand'))
                                        ) {
                                            realFillStyle = color;
                                            break;
                                        }
                                    }
                                }
                            }
                            Object.getOwnPropertyDescriptor(Object.getPrototypeOf(mapCtx), 'fillStyle')?.set?.call(mapCtx, realFillStyle);
                        }
                    });
                }

                if (mapCanvasEl && mapCtx) {
                    const originalSetTransform = mapCtx.setTransform.bind(mapCtx) as (...args: any[]) => void;
                    (mapCtx as any).setTransform = (...args: any[]) => {
                        if (typeof args[0] === 'number') {
                            cameraRef.current.scale = args[0];
                            cameraRef.current.offsetX = args[4];
                            cameraRef.current.offsetY = args[5];
                            cameraRef.current.width = mapCanvasEl.width;
                            cameraRef.current.height = mapCanvasEl.height;
                        }
                        originalSetTransform(...args);
                    };
                }

                // Merge COUNTRIES_DATA dengan color overrides dari aneksasi
                const getCountriesDataWithOverrides = () => {
                    const currentOverrides = (typeof window !== 'undefined' ? (window as any).neosantara_country_color_overrides : {}) || loadedColorOverrides;
                    if (!currentOverrides || Object.keys(currentOverrides).length === 0) {
                        return COUNTRIES_DATA;
                    }

                    return COUNTRIES_DATA.map(country => {
                        const normalizedName = country.country.toLowerCase().trim();
                        // Cek apakah negara ini sudah dianeksasi (ada override warna)
                        for (const [targetCountry, newColor] of Object.entries(currentOverrides)) {
                            const targetNorm = targetCountry.toLowerCase().trim();
                            if (
                                targetNorm === normalizedName ||
                                (targetNorm === 'mongolia' && normalizedName === 'mongolia') ||
                                (targetNorm === 'afganistan' && (normalizedName === 'afghanistan' || normalizedName === 'afganistan'))
                            ) {
                                return { ...country, color: newColor as string };
                            }
                        }
                        return country;
                    });
                };

                const countriesWithOverrides = getCountriesDataWithOverrides();

                await start_map_engine(
                    "map-canvas",
                    rawGeojsonStr,
                    countriesWithOverrides,
                    CAPITALS_DATA
                );

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

    const dragStartRef = useRef({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Update WASM map engine dengan warna negara baru ketika countryColorOverrides berubah
    useEffect(() => {
        if (!wasmModuleRef.current) {
            return;
        }

        try {
            // Merge COUNTRIES_DATA dengan color overrides
            const countriesWithOverrides = COUNTRIES_DATA.map(country => {
                const normalizedName = country.country.toLowerCase().trim();
                // Cek apakah negara ini sudah dianeksasi (ada override warna)
                for (const [targetCountry, newColor] of Object.entries(countryColorOverrides)) {
                    if (targetCountry.toLowerCase().trim() === normalizedName) {
                        // Return country dengan warna yang sudah di-override
                        return { ...country, color: newColor };
                    }
                }
                return country;
            });

            // Update countries data di WASM engine
            const mapEngineInstance = (wasmModuleRef.current as any).MapEngine;
            if (mapEngineInstance) {
                console.log('Updating WASM map colors with overrides:', countryColorOverrides);
                // Note: Ini akan memanggil set_countries() pada instance yang aktif
                // Jika tidak ada cara langsung, kita perlu trigger re-render
                
                // Dispatch custom event untuk notify map engine
                window.dispatchEvent(new CustomEvent('map_colors_updated', {
                    detail: { countriesData: countriesWithOverrides }
                }));
            }
        } catch (error) {
            console.error('Failed to update map colors:', error);
        }
    }, [countryColorOverrides]);

    const handleCanvasCountryClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isMapInteractionDisabled) return;

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

            const playerCountryName = selectedCountry?.country || countryDetail?.country || countryDetail?.nama_negara || "";
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
    };

    const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isMapInteractionDisabled) return;
        dragStartRef.current = { x: event.clientX, y: event.clientY };
        isDraggingRef.current = false;
    };

    const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isMapInteractionDisabled) return;
        const dx = Math.abs(event.clientX - dragStartRef.current.x);
        const dy = Math.abs(event.clientY - dragStartRef.current.y);
        // If mouse moved more than 5 pixels, consider it a drag
        if (dx > 5 || dy > 5) {
            isDraggingRef.current = true;
        }
    };

    return (
        <main className="fixed inset-0 bg-[#070b14] overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.02)_0%,transparent_100%)] pointer-events-none" />

            {/* Status Bar / Navbar */}
            <Navbar
                selectedCountry={selectedCountry}
                countryDetail={countryDetail}
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
            />            {/* Top Left Icon - Inbox */}
            <TopLeftIcon
                onClick={() => {
                    setInboxModalOpen(true);
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setPenelitianModalOpen(false);
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
                            message: `${item.message} Pasukan membubarkan massa dengan kekerasan: ${casualties.toLocaleString('id-ID')} korban jiwa tercatat dan ketegangan naik ${tensionIncrease} poin menjadi ${nextTension}/100.`,
                            provinceIncident: { ...incident, handled: true }
                        }
                        : item
                    ));
                    setResultModal({
                        isOpen: true,
                        title: 'Massa Dibubarkan dengan Kekerasan',
                        message: `Operasi di ${targetCountry} menyebabkan ${casualties.toLocaleString('id-ID')} korban jiwa. Ketegangan naik ${tensionIncrease} poin menjadi ${nextTension}/100.${currentReferendum?.status === 'pending'
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
                            message: `Berhasil mengekspor ${tNotif.quantity} unit ${tNotif.productKey} ke ${tNotif.partnerName} senilai +${tNotif.totalPrice.toLocaleString('id-ID')} NEO!`,
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
                                message: `Anggaran negara tidak mencukupi untuk melakukan impor ini. (${budget.toLocaleString('id-ID')} NEO tersedia dari ${tNotif.totalPrice.toLocaleString('id-ID')} NEO).`,
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
                            message: `Berhasil mengimpor ${tNotif.quantity} unit ${tNotif.productKey} dari ${tNotif.partnerName} senilai -${tNotif.totalPrice.toLocaleString('id-ID')} NEO!`,
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

                        setCountryDetail((prev: any) => ({
                            ...prev,
                            nonAggressionPacts: Array.from(new Set([...(prev?.nonAggressionPacts || []), partner]))
                        }));
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
                            message: `Berhasil meratifikasi Kontrak Penelitian Joint-R&D dengan ${partner}! Kecepatan riset nasional meningkat +25%.`,
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
                        setResultModal({
                            isOpen: true,
                            title: 'Operasi Pertahanan Berhasil',
                            message: `Operasi penanganan "${tNotif.title}" sukses dilaksanakan oleh divisi pertahanan & intelijen nasional!`,
                            type: 'success'
                        });
                        return;
                    }

                    if (tNotif.tradeType === 'bencana_alam' || tNotif.tradeType === 'wabah_penyakit') {
                        const cost = Number(tNotif.bantuanCost || 0);
                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < cost) {
                            setResultModal({
                                isOpen: true,
                                title: 'Gagal Menyalurkan Bantuan',
                                message: `Anggaran negara tidak mencukupi untuk menyalurkan bantuan (${budget.toLocaleString('id-ID')} NEO dari ${cost.toLocaleString('id-ID')} NEO).`,
                                type: 'error'
                            });
                            return;
                        }

                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - cost,
                            kepuasan_masyarakat: Math.min(100, Number(prev?.kepuasan_masyarakat || 50) + 2.0),
                            indeks_kesejahteraan: Math.min(100, Number(prev?.indeks_kesejahteraan || 50) + 2.0)
                        }));

                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isHandled: true } : n));
                        setResultModal({
                            isOpen: true,
                            title: 'Bantuan Darurat Disalurkan',
                            message: `Berhasil menyalurkan bantuan sebesar ${cost.toLocaleString('id-ID')} NEO! Kepuasan & Kesejahteraan masyarakat meningkat +2.0%.`,
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

                    const specialNotifTypes = ['jual', 'beli', 'penawaran_kedutaan_besar', 'penawaran_hubungan_dagang', 'bencana_alam', 'wabah_penyakit', 'spionase', 'sabotase', 'diserang', 'pemberontakan', 'icbm'];
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
                    setActiveMenu("");
                }}
                isOpen={giftModalOpen}
                onClose={() => setGiftModalOpen(false)}
            />
            <TopRightNewsIcon
                onClick={() => {
                    setNewsModalOpen(true);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setPenelitianModalOpen(false);
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
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                    setNewsModalOpen(false);
                    setActiveMenu("");
                }}
                isOpen={penelitianModalOpen}
                onClose={() => setPenelitianModalOpen(false)}
                countryDetail={countryDetail}
                setCountryDetail={setCountryDetail}
            />

            {/* Shifted Canvas Container */}
            <div ref={containerRef} className={`fixed top-20 inset-x-0 bottom-0 z-0 ${isMapInteractionDisabled ? 'pointer-events-none' : ''}`}>
                <canvas
                    id="map-canvas"
                    className="w-full h-full block cursor-grab"
                    onClick={handleCanvasCountryClick}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseLeave={(e) => {
                        const event = new MouseEvent('mouseup', {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                        });
                        e.currentTarget.dispatchEvent(event);
                    }}
                />

                {/* Global FX */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_200px_rgba(0,0,0,0.6)] vignette-gradient" />
            </div>

            {!(countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen) && (
                <BottomNav
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    countryDetail={countryDetail}
                    isDetailModalOpen={countryDetailModalOpen || playerDetailModalOpen || inboxModalOpen || giftModalOpen || newsModalOpen || penelitianModalOpen}
                />
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

                    {/* Progress Bar slot */}
                    <div className="w-full h-2 xl:h-3 bg-[#0A1A1A] rounded-full border border-[#00FFAA]/20 overflow-hidden relative">
                        <div
                            ref={progressBarRef}
                            className="h-full bg-[#00FFAA] rounded-full transition-all duration-75"
                            style={{ width: '0%' }}
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
                                <span>Kalender: {calendarRef.current?.display.getCalendarInfo() || (timeManagerRef.current?.getFormattedDate() || '-')}</span>
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

            {/* Custom Result Modal (Pengganti alert peramban, Rendered via React Portal ke document.body) */}
            {typeof window !== 'undefined' && resultModal.isOpen && createPortal(
                <div className="fixed inset-0 z-[500000] flex items-center justify-center p-4 animate-fadeIn pointer-events-auto">
                    <div className="bg-[#0A1A1A] border-2 border-[#00FFAA]/40 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,170,0.25)] w-full max-w-md relative overflow-hidden flex flex-col font-sans">
                        <div className="flex items-center justify-between mb-4 border-b border-[#00FFAA]/20 pb-3">
                            <span className={`text-xs font-black tracking-widest uppercase ${resultModal.type === 'error' ? 'text-rose-400' : 'text-[#00FFAA]'}`}>
                                {resultModal.type === 'error' ? '⚠️ PERINGATAN KETIDAKSAMAAN' : '✓ INFORMASI TRANSAKSI & HASIL'}
                            </span>
                            <button
                                onClick={() => {
                                    setResultModal(prev => ({ ...prev, isOpen: false }));
                                    setInboxModalOpen(true);
                                }}
                                className="text-[#6B8A8A] hover:text-[#00FFAA] font-black text-base cursor-pointer transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <h3 className={`text-lg font-black uppercase tracking-wide mb-2 ${resultModal.type === 'error' ? 'text-rose-400' : 'text-[#E0E0E0]'}`}>
                            {resultModal.title}
                        </h3>
                        <p className="text-sm text-[#A0B0B0] leading-relaxed mb-6 font-medium">
                            {resultModal.message}
                        </p>
                        <button
                            onClick={() => {
                                setResultModal(prev => ({ ...prev, isOpen: false }));
                                setInboxModalOpen(true);
                            }}
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all ${
                                resultModal.type === 'error'
                                    ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400 hover:bg-rose-500/30'
                                    : 'bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/80 shadow-[0_0_20px_rgba(0,255,170,0.3)]'
                            }`}
                        >
                            Tutup
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </main>
    );
}