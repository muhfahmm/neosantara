// detail path: c:\EM\apps\src\app\page\map_system\map-system.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Navbar } from '../navbar/Navbar';
import BottomNav from '../navigasi_menu/2_navigasi_bawah/BottomNav';
import ModalsManager from '../navigasi_menu/2_navigasi_bawah/ModalsManager';
import { calculateCountryNetBalance } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateDailyPopulationChange, updateDailyPopulation } from '@/app/logic/populations_logic/population_logic';
import { logger } from '../../../lib/logger';
const CountryDetailModal = dynamic(() => import('../detail_negara/detail_negara').then(m => m.CountryDetailModal), { ssr: false });
const NegaraUserModal = dynamic(() => import('./negara_user'), { ssr: false });
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateDailyMaterialProduction } from '../navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic';
import { getDaysElapsed } from '@/app/logic/production_logic';
import { calculateKepuasan } from '@/app/logic/kepuasanCalculator';
import { calculatePresidentRating, getMonthsDifference } from '@/app/logic/peringkatCalculator';
import { calculateKesejahteraan, calculateKesejahteraanDecay } from '@/app/logic/kesejahteraanCalculator';
const TopLeftIcon = dynamic(() => import('./menu_notifikasi/inbox/inboxModals'), { ssr: false });
const TopRightGiftIcon = dynamic(() => import('./menu_notifikasi/reward/rewardModals'), { ssr: false });
const TopRightNewsIcon = dynamic(() => import('./menu_notifikasi/news/newsModals'), { ssr: false });
import { NotificationMessage, getKepuasanWarningMessage } from './menu_notifikasi/inbox/logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { getPeringkatWarningMessage } from './menu_notifikasi/inbox/logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/2_peringkat/peringkatLogic';
import { getKesejahteraanWarningMessage } from './menu_notifikasi/inbox/logic/1_notifikasi_pokok/1_kepuasan_dan_peringkat/3_kesejahteraan/kesejahteraanLogic';
import { getTradeAgreementsForCountry } from '../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { generateAITradeBeliNotification } from './menu_notifikasi/inbox/logic/1_notifikasi_pokok/4_perdagangan/2_beli/tradeBeliLogic';
import { generateAITradeJualNotification } from './menu_notifikasi/inbox/logic/1_notifikasi_pokok/4_perdagangan/1_jual/tradeJualLogic';

interface Country {
    id: number;
    country: string;
    capital: string;
    iso: string;
    latitude: number;
    longitude: number;
    continent: string;
}

export default function MapPage() {
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const [countryDetail, setCountryDetail] = useState<any>(null);
    const [metadata, setMetadata] = useState<Record<string, any>>({});

    useEffect(() => {
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
    const [playerDetailModalOpen, setPlayerDetailModalOpen] = useState(false);
    const [inboxModalOpen, setInboxModalOpen] = useState(false);
    const [giftModalOpen, setGiftModalOpen] = useState(false);
    const [newsModalOpen, setNewsModalOpen] = useState(false);
    const [presidentRating, setPresidentRating] = useState<number>(50);
    const [kesejahteraan, setKesejahteraan] = useState<number>(50);
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

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

        // Pemicu: 1-2 kali per minggu (hari ke-2 dan hari ke-5 di setiap minggu)
        if (dayInWeek === 2 || dayInWeek === 5) {
            const myCountry = countryDetail.country || countryDetail.nama || "";
            const partners = getTradeAgreementsForCountry(myCountry);
            if (partners.length === 0) return;

            // Ambil partner acak
            const targetPartner = partners[Math.floor(Math.random() * partners.length)];
            const partnerName = targetPartner.mitra;

            // Cari produk yang paling menguntungkan (misal Uranium, Semikonduktor, Logam Tanah Jarang)
            const premiumProducts = ["uranium", "semikonduktor", "logam_tanah_jarang", "mobil", "litium"];
            const productKey = premiumProducts[Math.floor(Math.random() * premiumProducts.length)];

            // Generate random trade quantities and competitive prices
            const quantity = Math.floor(Math.random() * 300) + 20;
            const prices: Record<string, number> = {
                uranium: 8000, semikonduktor: 4000, logam_tanah_jarang: 5000, mobil: 15000, litium: 3000
            };
            const basePrice = prices[productKey] || 100;
            const pricePerUnit = Math.round(basePrice * (0.85 + Math.random() * 0.3) * 100) / 100;

            const yearStr = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(currentDate.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            // Selang-seling tipe tawaran: Jual (AI beli dari User) atau Beli (AI jual ke User)
            const isAIBuying = Math.random() > 0.5;
            let newNotif: any;

            if (isAIBuying) {
                // AI Ingin Membeli Produk User (Jual)
                newNotif = generateAITradeJualNotification(partnerName, productKey, quantity, pricePerUnit, dateStr);
            } else {
                // AI Ingin Menjual Produk ke User (Beli)
                newNotif = generateAITradeBeliNotification(partnerName, productKey, quantity, pricePerUnit, dateStr);
            }

            setNotifications(prev => [newNotif, ...prev]);
            setCountryDetail((prev: any) => ({
                ...prev,
                last_trade_notification_day: diffDays
            }));
        }
    }, [currentDate, countryDetail, setCountryDetail]);

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

    // Close navigation menu modals if inbox, gift, or news modal is opened
    useEffect(() => {
        if (inboxModalOpen || giftModalOpen || newsModalOpen) {
            setActiveMenu("Peta Taktis");
        }
    }, [inboxModalOpen, giftModalOpen, newsModalOpen]);

    // Close inbox, gift, and news modals if a navigation menu modal is opened
    useEffect(() => {
        if (!nonModalMenus.includes(activeMenu)) {
            setInboxModalOpen(false);
            setGiftModalOpen(false);
            setNewsModalOpen(false);
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
                if (timeManagerRef.current) {
                    const newDate = timeManagerRef.current.getCurrentDate();
                    console.log('[MapPage Callback] Date changed:', {
                        formatted: formattedDate,
                        newDate: newDate.toDateString(),
                        timestamp: Date.now()
                    });
                    setCurrentDate(newDate);
                }
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
            const loadSaveStr = localStorage.getItem('presiden_simulator_load_save');
            const newGameMarker = localStorage.getItem('presiden_simulator_new_game');
            if (newGameMarker === '1') {
                localStorage.removeItem('hutangModalLoanSources');
                localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
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
                semikonduktor: mergedData.semikonduktor ?? 0,
                mobil: mergedData.mobil ?? 0,
                sepeda_motor: mergedData.sepeda_motor ?? 0,
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
        if (!countryDetail || !currentDate) return;

        // Format date inline (can't import formatDate here due to path issues)
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const currentDateStr = `${year}-${month}-${day}`;
        logger.log('MapPage', 'Date changed to:', currentDateStr);

        // Auto-set build dates for buildings that don't have one
        // Set to TODAY's date so production starts at 0 from now
        const resourceKeys = [
            "pembangkit_listrik_tenaga_nuklir", "pembangkit_listrik_tenaga_air", "pembangkit_listrik_tenaga_surya",
            "pembangkit_listrik_tenaga_uap", "pembangkit_listrik_tenaga_gas", "pembangkit_listrik_tenaga_angin",
            "emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium",
            "logam_tanah_jarang", "bijih_besi",
            "semikonduktor", "mobil", "sepeda_motor", "semen_beton", "kayu",
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
    }, [currentDate, countryDetail]);

    const prevBudgetUpdateDateRef = useRef<string | null>(null);

    // ✅ NEW: Initialize population metrics when countryDetail first loads
    useEffect(() => {
        if (!countryDetail) return;

        // Calculate initial population metrics untuk display
        const populationMetrics = calculateDailyPopulationChange(countryDetail, selectedCountry?.country);
        setPlayerNetPopulationChange(populationMetrics.netDailyChange);
        setPlayerDailyBirths(populationMetrics.dailyBirths);
        setPlayerDailyDeaths(populationMetrics.dailyDeaths);

        logger.log('PopulationInit', 'Initial population metrics calculated', {
            populasi: countryDetail.jumlah_penduduk,
            netChange: populationMetrics.netDailyChange,
        });
    }, [countryDetail?.jumlah_penduduk, selectedCountry?.country]); // Track jumlah_penduduk & country changes

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
        const netBalance = calculateCountryNetBalance(countryDetail);

        // ✅ ALWAYS calculate population updates (doesn't depend on metadata)
        const populationMetrics = calculateDailyPopulationChange(countryDetail, selectedCountry?.country);
        const populationUpdates = updateDailyPopulation(countryDetail, populationMetrics);

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
                currentDateStr
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

            const nextKepuasan = Math.min(100, parseFloat(((prev.kepuasan ?? 50) + currentCompletedBoost).toFixed(1)));

            // --- HITUNG PENURUNAN PERINGKAT BERDASARKAN KEPUASAN (menggunakan peringkatCalculator) ---
            const monthsPassed = lastDate ? getMonthsDifference(lastDate, currentDateStr) : 0;

            const ratingResult = calculatePresidentRating({
                currentRating: prev.presidentRating ?? 50,
                ratingMonthCounter: prev.rating_month_counter ?? 0,
                lastRatingThreshold: prev.last_rating_threshold ?? 12,
                monthsPassed,
                currentKepuasan: nextKepuasan,
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
            });

            const nextKesejahteraan = decayResult.nextKesejahteraan;
            if (nextKesejahteraan !== (prev.kesejahteraan ?? 50)) {
                setKesejahteraan(nextKesejahteraan);
            }

            const nextKesejahteraanBonus = (prev.kesejahteraan_bonus ?? 0) + currentCompletedKesejahteraanBoost;
            const nextKesejahteraanDecay = (prev.kesejahteraan_decay ?? 0) + decayResult.decayThisTick;

            return {
                ...prev,
                ...updates,
                ...populationUpdates,  // Apply population changes
                anggaran: (Number(prev.anggaran) || 0) + netBalance,
                satisfaction: prev.satisfaction, // Preserve satisfaction scores
                ongoingConstructions: currentOngoing,
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
    }, [
        // Hanya track field-field yang benar-benar mempengaruhi kepuasan
        countryDetail?.ppn,
        countryDetail?.corporate,
        countryDetail?.income_tax,
        countryDetail?.cigarette_tax,
        countryDetail?.environment_tax,
        countryDetail?.harga,
        countryDetail?.subsidyActive,
        countryDetail?.jumlah_penduduk,
        countryDetail?.rumah_subsidi,
        countryDetail?.apartemen,
        countryDetail?.mansion,
        countryDetail?.pembangkit_listrik_tenaga_nuklir,
        countryDetail?.pembangkit_listrik_tenaga_air,
        countryDetail?.pembangkit_listrik_tenaga_surya,
        countryDetail?.pembangkit_listrik_tenaga_uap,
        countryDetail?.pembangkit_listrik_tenaga_gas,
        countryDetail?.pembangkit_listrik_tenaga_angin,
        // Sektor pangan — accumulated inventory
        countryDetail?.accumulated_padi,
        countryDetail?.accumulated_jagung,
        countryDetail?.accumulated_kedelai,
        countryDetail?.accumulated_ayam_unggas,
        countryDetail?.accumulated_sapi_perah,
        countryDetail?.accumulated_sapi_potong,
        countryDetail?.accumulated_ikan,
        countryDetail?.accumulated_udang,
        // Tempat Umum & Layanan Publik keys
        countryDetail?.jalur_sepeda, countryDetail?.jalan_raya, countryDetail?.terminal_bus, countryDetail?.stasiun_kereta_api, countryDetail?.kereta_bawah_tanah, countryDetail?.pelabuhan, countryDetail?.bandara, countryDetail?.helipad,
        countryDetail?.prasekolah, countryDetail?.dasar, countryDetail?.menengah, countryDetail?.lanjutan, countryDetail?.universitas, countryDetail?.lembaga_pendidikan, countryDetail?.laboratorium, countryDetail?.observatorium, countryDetail?.pusat_penelitian, countryDetail?.pusat_pengembangan, countryDetail?.literasi,
        countryDetail?.rumah_sakit_besar, countryDetail?.rumah_sakit_kecil, countryDetail?.pusat_diagnostik, countryDetail?.harapan_hidup, countryDetail?.indeks_kesehatan,
        countryDetail?.pusat_bantuan_hukum, countryDetail?.pengadilan, countryDetail?.kejaksaan, countryDetail?.pos_polisi, countryDetail?.armada_mobil_polisi, countryDetail?.akademi_polisi, countryDetail?.indeks_korupsi, countryDetail?.indeks_keamanan,
        countryDetail?.kolam_renang, countryDetail?.sirkuit_balap, countryDetail?.stadion, countryDetail?.stadion_internasional, countryDetail?.gym, countryDetail?.golf, countryDetail?.esports, countryDetail?.gokart, countryDetail?.bioskop, countryDetail?.teater,
        countryDetail?.mall, countryDetail?.hotel, countryDetail?.pusat_grosir_tekstil,
        metadata,
    ]);

    // ─── Auto-refresh kesejahteraan di navbar ────────────────────────────────
    // Hitung ulang indeks kesejahteraan setiap kali field pendidikan, kesehatan, atau tempat umum berubah
    // Kesejahteraan otomatis naik/turun berdasarkan fasilitas yang dimiliki
    useEffect(() => {
        if (!countryDetail || !metadata || Object.keys(metadata).length === 0) return;

        // Ambil logic constants & helper
        const FOOD_CONSUMPTION_PER_CAPITA = require('@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic').FOOD_CONSUMPTION_PER_CAPITA;
        const calculateProduction = require('@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/2_industri_pangan/logic/produksiKonsumsiLogic').calculateProduction;

        const kesejahteraanResult = calculateKesejahteraan(
            countryDetail,
            metadata,
            FOOD_CONSUMPTION_PER_CAPITA,
            calculateProduction,
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
    }, [
        // Sektor Pendidikan
        countryDetail?.prasekolah,
        countryDetail?.dasar,
        countryDetail?.menengah,
        countryDetail?.lanjutan,
        countryDetail?.universitas,
        countryDetail?.lembaga_pendidikan,
        countryDetail?.laboratorium,
        countryDetail?.observatorium,
        countryDetail?.pusat_penelitian,
        countryDetail?.pusat_pengembangan,
        countryDetail?.literasi,

        // Sektor Kesehatan
        countryDetail?.rumah_sakit_besar,
        countryDetail?.rumah_sakit_kecil,
        countryDetail?.pusat_diagnostik,
        countryDetail?.harapan_hidup,
        countryDetail?.indeks_kesehatan,

        // Sektor Tempat Umum
        countryDetail?.jalur_sepeda,
        countryDetail?.jalan_raya,
        countryDetail?.terminal_bus,
        countryDetail?.stasiun_kereta_api,
        countryDetail?.kereta_bawah_tanah,
        countryDetail?.pelabuhan,
        countryDetail?.bandara,
        countryDetail?.helipad,
        countryDetail?.kolam_renang,
        countryDetail?.sirkuit_balap,
        countryDetail?.stadion,
        countryDetail?.stadion_internasional,
        countryDetail?.gym,
        countryDetail?.golf,
        countryDetail?.esports,
        countryDetail?.gokart,
        countryDetail?.bioskop,
        countryDetail?.teater,
        countryDetail?.mall,
        countryDetail?.hotel,
        countryDetail?.pusat_grosir_tekstil,

        // Populasi untuk rasio kalkulasi
        countryDetail?.jumlah_penduduk,

        // Bonus kesejahteraan
        countryDetail?.kesejahteraan_bonus,

        metadata,
    ]);

    const handleRestart = () => {
        if (selectedCountry) {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('hutangModalLoanSources');
                window.localStorage.removeItem('hutangModalLoanSourcesLastRefresh');
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
                const [wasmModule, { WORLD_GEOJSON }] = await Promise.all([
                    import('../../../wasm/map-engine-rs/map_engine_rs'),
                    import('./world-geojson')
                ]);
                await wasmModule.default(); // Initialize WASM module first
                wasmModuleRef.current = wasmModule;

                // After init, the exported functions are available on the module
                const { start_map_engine, set_selected_country_on_map } = wasmModule;

                await start_map_engine(
                    "map-canvas",
                    WORLD_GEOJSON,
                    COUNTRIES_DATA,
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
                    // Mark all notifications as read when opening inbox
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                }}
                isOpen={inboxModalOpen}
                onClose={() => setInboxModalOpen(false)}
                notifications={notifications}
                onClearAll={() => setNotifications([])}
                onActionClick={(notif) => {
                    // Intersep jika ini tawaran transaksi dagang AI
                    const tNotif = notif as any;
                    if (tNotif.tradeType === 'jual') {
                        // AI Ingin Membeli Produk User (Jual): Tambah Kas, Kurangi Stok User
                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        if (myStock < tNotif.quantity) {
                            alert(`Gagal menyetujui transaksi! Stok ${tNotif.productKey} Anda hanya ${myStock} unit.`);
                            return;
                        }

                        const budget = Number(countryDetail?.anggaran || 0);
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget + tNotif.totalPrice,
                            [tNotif.productKey]: myStock - tNotif.quantity,
                            [`total_sold_${tNotif.productKey}`]: Number(prev?.[`total_sold_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        alert(`Berhasil mengekspor ${tNotif.quantity} unit ${tNotif.productKey} ke ${tNotif.partnerName} senilai ${tNotif.totalPrice.toLocaleString('id-ID')} EM!`);
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
                        return;
                    }

                    if (tNotif.tradeType === 'beli') {
                        // AI Menjual ke User (Beli): Kurangi Kas, Tambah Stok User
                        const budget = Number(countryDetail?.anggaran || 0);
                        if (budget < tNotif.totalPrice) {
                            alert(`Gagal menyetujui transaksi! Anggaran negara tidak mencukupi.`);
                            return;
                        }

                        const myStock = Number(countryDetail?.[tNotif.productKey] || 0);
                        setCountryDetail((prev: any) => ({
                            ...prev,
                            anggaran: budget - tNotif.totalPrice,
                            [tNotif.productKey]: myStock + tNotif.quantity,
                            [`total_bought_${tNotif.productKey}`]: Number(prev?.[`total_bought_${tNotif.productKey}`] || 0) + tNotif.quantity
                        }));

                        alert(`Berhasil mengimpor ${tNotif.quantity} unit ${tNotif.productKey} dari ${tNotif.partnerName} senilai ${tNotif.totalPrice.toLocaleString('id-ID')} EM!`);
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        setInboxModalOpen(false);
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
                    if (tNotif.tradeType === 'jual' || tNotif.tradeType === 'beli') {
                        // Tolak Tawaran: Hapus notifikasi dari feed
                        setNotifications(prev => prev.filter(n => n.id !== notif.id));
                        alert("Penawaran ditolak.");
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
                }}
                isOpen={giftModalOpen}
                onClose={() => setGiftModalOpen(false)}
            />
            <TopRightNewsIcon
                onClick={() => {
                    setNewsModalOpen(true);
                    setInboxModalOpen(false);
                    setGiftModalOpen(false);
                }}
                isOpen={newsModalOpen}
                onClose={() => setNewsModalOpen(false)}
            />

            {/* Shifted Canvas Container */}
            <div className={`fixed top-20 inset-x-0 bottom-0 z-0 ${isMapInteractionDisabled ? 'pointer-events-none' : ''}`}>
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

            <BottomNav
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                countryDetail={countryDetail}
                isDetailModalOpen={countryDetailModalOpen || playerDetailModalOpen}
            />

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

            {/* Premium Floating Skeuomorphic Time Controller Widget */}
            <div className="fixed bottom-3 right-3 lg:bottom-5 lg:right-5 xl:bottom-8 xl:right-8 z-40 flex flex-col w-[220px] lg:w-[250px] xl:w-[320px] transition-all">
                {/* Upper Parchment Card */}
                <div className="bg-[#FAF6EE] rounded-t-xl xl:rounded-t-2xl px-3.5 lg:px-4 xl:px-6 pt-3 lg:pt-4 xl:pt-5 pb-7 lg:pb-8 xl:pb-10 border-t-2 border-x-2 border-[#C4B49C] shadow-md flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.01)_0%,transparent_100%)] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-2 xl:mb-3.5">
                        {/* Gold gear inside metallic slot */}
                        <div className="flex items-center gap-1.5 xl:gap-2">
                            <div className="flex items-center justify-center w-6 h-6 xl:w-8 xl:h-8 rounded-md xl:rounded-lg bg-gradient-to-b from-[#e5d7ba] to-[#c7b79a] border border-[#a8987b] shadow-xs xl:shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative">
                                <Settings 
                                    className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#5c3c10]" 
                                    style={{ animation: 'spin 8s linear infinite' }}
                                />
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-2 xl:w-1.5 xl:h-3 bg-slate-400 border border-slate-500 rounded-2xs" />
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-2 xl:w-1.5 xl:h-3 bg-slate-400 border border-slate-500 rounded-2xs" />
                            </div>
                        </div>

                        {/* Calendar date label */}
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[8px] xl:text-[9px] font-black text-[#8b7e66] tracking-wider xl:tracking-widest uppercase mb-0.5 xl:mb-1">SIMULATION CALENDAR</span>
                            <span ref={dateTextRef} className="text-xs lg:text-sm xl:text-lg font-black text-[#2e261a] tracking-tight">
                                -
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar slot */}
                    <div className="w-full h-2 xl:h-3 bg-[#e4dac3] rounded-full border border-[#bfae93] shadow-inner overflow-hidden relative">
                        <div 
                            ref={progressBarRef}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-75 shadow-xs" 
                            style={{ width: '0%' }}
                        />
                    </div>
                </div>

                {/* Lower Slate Blue Card with overlapping gold buttons */}
                <div className="bg-[#1e2f3d] rounded-b-xl xl:rounded-b-2xl border-b-2 xl:border-b-4 border-x-2 border-[#15202a] shadow-xl h-10 lg:h-11 xl:h-14 relative flex items-center justify-between">
                    <div className="absolute inset-x-3 lg:inset-x-4 xl:inset-x-6 -top-4.5 lg:-top-5 xl:-top-7 flex items-center justify-between">
                        {/* 1. Play/Pause gold button */}
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
                            className="w-9 h-9 lg:w-10 lg:h-10 xl:w-14 xl:h-14 rounded-full bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] border-2 xl:border-4 border-[#1e2f3d] shadow-md xl:shadow-[0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer hover:brightness-110 hover:scale-105 active:scale-95 transition-all z-20 group"
                        >
                            {isPaused ? (
                                <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 fill-[#5c3c10] text-[#5c3c10] translate-x-0.5 transition-transform group-hover:scale-110" />
                            ) : (
                                <Pause className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 fill-[#5c3c10] text-[#5c3c10] transition-transform group-hover:scale-110" />
                            )}
                        </button>

                        {/* 2. Gold Speed Selector button */}
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
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] border xl:border-2 border-[#1e2f3d] shadow-sm flex items-center justify-center cursor-pointer hover:brightness-110 hover:scale-105 active:scale-95 transition-all z-20 text-[10px] xl:text-[12px] font-black text-[#5c3c10] uppercase tracking-tighter"
                        >
                            {calendarRef.current?.display.getSpeedLabel() || `×${speed}`}
                        </button>

                        {/* 3. Gold Holiday button */}
                        <button 
                            onClick={() => {
                                if (calendarRef.current) {
                                    calendarRef.current.controls.handleHolidayClick();
                                } else {
                                    alert("Mode Liburan Presiden diaktifkan! Rakyat menikmati waktu istirahat.");
                                }
                            }}
                            title="Liburan Negara"
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] border xl:border-2 border-[#1e2f3d] shadow-sm flex items-center justify-center cursor-pointer hover:brightness-110 hover:scale-105 active:scale-95 transition-all z-20"
                        >
                            <Palmtree className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#5c3c10]" />
                        </button>

                        {/* 4. Gold Military/General button */}
                        <button 
                            onClick={() => {
                                if (calendarRef.current) {
                                    calendarRef.current.controls.handleMilitaryClick();
                                } else {
                                    alert("Informasi Kepresidenan & Hubungan Militer Aktif.");
                                }
                            }}
                            title="Militer & Keamanan Negara"
                            className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-b from-[#ffe07d] via-[#fcae1e] to-[#c77a00] border xl:border-2 border-[#1e2f3d] shadow-sm flex items-center justify-center cursor-pointer hover:brightness-110 hover:scale-105 active:scale-95 transition-all z-20"
                        >
                            <Shield className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 text-[#5c3c10]" />
                        </button>
                    </div>

                    {/* Skeuomorphic silver bottom tray frame */}
                    <div className="absolute -bottom-2 -inset-x-2.5 h-4 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 border border-slate-500 rounded-b-xl pointer-events-none shadow-md flex items-center justify-between px-1">
                        {/* Left beveled corner accent */}
                        <div className="w-4 h-3 bg-slate-300 border-r border-slate-500 transform -skew-x-12 rounded-bl-md" />
                        {/* Right beveled corner accent */}
                        <div className="w-4 h-3 bg-slate-300 border-l border-slate-500 transform skew-x-12 rounded-br-md" />
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
                onClose={() => {
                    setCountryDetailModalOpen(false);
                    setCountryDetailModalName(null);
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
                                <span>Kas: {countryDetail?.anggaran ? `${countryDetail.anggaran} EM` : '-'}</span>
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

        </main>
    );
}