'use client';

import { Layers } from "lucide-react";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Globe,
  Play,
  ArrowLeft,
  User,
  Building,
  Factory,
  Users,
  Coins,
  Landmark,
  HelpCircle,
  MapPin,
  TrendingUp,
  Home,
  Scale,
  Bug,
  Table,
  Banknote,
  Gem,
  Plane,
  Droplet,
  Flame,
  Mountain,
  Radiation,
  Hammer,
  Cable,
  Battery,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { COUNTRIES_DATA, CAPITALS_DATA } from '../map-data';
import countryPaths from '../country-paths.json';

// Import logika ekonomi dari folder logic agar kalkulasi sama persis
import { calculateCountryNetBalance, calculateTotalTaxIncome, calculateTotalMinistryCostPerDay } from '@/app/logic/economic_logic/treasuryUpdater';
import { calculateGoldMiningDailyProduction } from '@/app/logic/economic_logic/goldIncome';
import { KEMENTERIAN, KEAMANAN, LAYANAN } from '@/app/logic/economic_logic/departments';

// Import Debug Modal
import DebugAPBN from '../../navigasi_menu/2_navigasi_bawah/debugAPBN';

// Type untuk SDA data per negara
interface SDAData {
  emas?: boolean;
  uranium?: boolean;
  batu_bara?: boolean;
  minyak_bumi?: boolean;
  gas_alam?: boolean;
  garam?: boolean;
  litium?: boolean;
  logam_tanah_jarang?: boolean;
  bijih_besi?: boolean;
  [key: string]: boolean | undefined;
}

interface Country {
  id: number;
  country: string;
  capital: string;
  iso: string;
  latitude: number;
  longitude: number;
  continent: string;
  flag?: string;
  name_id?: string;
}

// === LOGIKA KALKULASI EKONOMI UNTUK NAVBAR (SAMA PERSIS DENGAN MODAL) ===
const LEVEL_UP_COST = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];

const calculateGoldMiningIncome = (detail: any) => {
  return calculateGoldMiningDailyProduction(detail);
};

// --- LOGIKA PARIWISATA DIHAPUS ---
// =================================================

export default function PilihNegaraPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('utama');
  const hasInitRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [wasmModule, setWasmModule] = useState<any>(null);
  const [countryDetail, setCountryDetail] = useState<any>(null);
  const isMapClickRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0 });
  // Ref untuk menyimpan ISO negara yang diklik dari peta (fix bug klik pertama)
  const pendingIsoRef = useRef<string | null>(null);

  // State untuk Modal Debug
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [isDebugAllCountries, setIsDebugAllCountries] = useState(false);

  // State SDA - data boolean sumber daya alam dari database_SDA
  const [sdaData, setSdaData] = useState<SDAData | null>(null);

  // Mapping sumber daya alam yang tersedia di database_SDA
  const resourceMap = useMemo(() => [
    { key: 'emas', icon: Gem, label: 'Emas' },
    { key: 'minyak_bumi', icon: Droplet, label: 'Minyak Bumi' },
    { key: 'gas_alam', icon: Flame, label: 'Gas Alam' },
    { key: 'batu_bara', icon: Mountain, label: 'Batu Bara' },
    { key: 'uranium', icon: Radiation, label: 'Uranium' },
    { key: 'bijih_besi', icon: Hammer, label: 'Bijih Besi' },
    { key: 'garam', icon: Cable, label: 'Garam' },
    { key: 'litium', icon: Battery, label: 'Litium' },
    { key: 'logam_tanah_jarang', icon: Sparkles, label: 'Logam Tanah Jarang' },
  ], []);

  // Gunakan sdaData sebagai sumber ketersediaan SDA
  const getCurrentSDA = sdaData;

  const getFlagEmoji = (iso: string) => {
    if (!iso || iso.length !== 2) return '🌐';
    const codePoints = iso
      .toUpperCase()
      .split('')
      .map((c) => 127397 + c.charCodeAt(0));
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

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      const canvas = document.getElementById('map-canvas-bg');
      if (canvas) {
        const event = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        canvas.dispatchEvent(event);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  useEffect(() => {
    const initMap = async () => {
      if (hasInitRef.current) return;
      hasInitRef.current = true;

      try {
        const [mod, { WORLD_GEOJSON }] = await Promise.all([
          import('../../../../wasm/map-engine-rs/map_engine_rs'),
          import('../world-geojson'),
        ]);
        await mod.default(); // Initialize WASM module

        const { start_map_engine, set_selected_country_on_map, get_country_at_on_map } = mod;

        start_map_engine('map-canvas-bg', WORLD_GEOJSON, COUNTRIES_DATA, CAPITALS_DATA);

        setWasmModule({
          start_map_engine,
          set_selected_country_on_map,
          get_country_at_on_map,
        });
      } catch (e) {
        console.error('Failed to start map engine bg:', e);
      } finally {
        setIsLoading(false);
      }
    };

    const enhancedData = COUNTRIES_DATA.map((c) => ({
      ...c,
      flag: getFlagEmoji(c.iso),
      name_id: c.country.charAt(0).toUpperCase() + c.country.slice(1),
    }));
    setCountries(enhancedData);

    initMap();
  }, []);

  const filteredCountries = useMemo(
    () =>
      countries.filter(
        (c) =>
          c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.capital.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [countries, searchQuery]
  );

  useEffect(() => {
    const selected = filteredCountries[currentIndex];

    if (!selected) {
      setCountryDetail(null);
      setSdaData(null);
      setHasInteracted(false);
      return;
    }

    if (selected && hasInteracted) {
      setCountryDetail(null);

      const loadStats = async () => {
        const relPath = Object.entries(countryPaths).find(
          ([name]) => name.toLowerCase() === selected.country.toLowerCase()
        )?.[1];

        try {
          const countryName = selected.country;
          const [resData, defaultPrices, sdaRes] = await Promise.all([
            relPath ? fetch(`/api/country-data?path=${relPath}`).then(r => r.json()).catch(() => null) : Promise.resolve(null),
            loadDefaultPrices(countryName),
            fetch(`/api/sda-data?country=${encodeURIComponent(countryName)}`).then(r => r.ok ? r.json() : null).catch(() => null)
          ]);

          setSdaData(sdaRes);

          if (resData && !resData.error) {
            setCountryDetail({
              ...resData,
              ppn: resData.pajak?.ppn?.tarif,
              corporate: resData.pajak?.korporasi?.tarif,
              income_tax: resData.pajak?.penghasilan?.tarif,
              cigarette_tax: resData.pajak?.bea_cukai?.tarif,
              environment_tax: resData.pajak?.lingkungan?.tarif,
              harga: defaultPrices || resData?.harga || {},
              price_rice: defaultPrices?.harga_beras ?? resData?.harga?.harga_beras,
              price_fuel: defaultPrices?.harga_minyak_goreng ?? resData?.harga?.harga_bbm,
              un_vote: resData.un_vote,
              reputation: resData.reputasi_diplomatik,
              kepuasan: resData.kepuasan ?? 50,
            });
          } else {
            setCountryDetail(null);
          }
        } catch (e) {
          console.error('Failed to load country data directly:', e);
          setCountryDetail(null);
        }
      };

      loadStats();

      if (wasmModule) {
        try {
          wasmModule.set_selected_country_on_map(selected.iso, true);
          isMapClickRef.current = false;
        } catch (e) {
          console.error('Failed to sync selection to map:', e);
        }
      }
    }
  }, [currentIndex, hasInteracted, filteredCountries, wasmModule]);

  const nextCountry = () => {
    if (filteredCountries.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCountries.length);
    setHasInteracted(true);
  };

  const prevCountry = () => {
    if (filteredCountries.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCountries.length) % filteredCountries.length);
    setHasInteracted(true);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!wasmModule || !wasmModule.get_country_at_on_map) return;

    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPosRef.current.x, 2) +
      Math.pow(e.clientY - dragStartPosRef.current.y, 2)
    );
    if (dragDistance > 5) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedCountry = wasmModule.get_country_at_on_map(x, y);
    if (clickedCountry && clickedCountry.iso) {
      isMapClickRef.current = true;
      const iso = clickedCountry.iso;

      // Simpan ISO di ref terlebih dahulu
      pendingIsoRef.current = iso;

      // Cari di filteredCountries dulu
      const filteredIndex = filteredCountries.findIndex(
        (c) => c.iso.toLowerCase() === iso.toLowerCase()
      );

      if (filteredIndex !== -1) {
        // Sudah ada di filtered list, langsung set
        pendingIsoRef.current = null;
        setCurrentIndex(filteredIndex);
        setHasInteracted(true);
      } else {
        // Perlu clear search dulu, biarkan useEffect handle pencarian via pendingIsoRef
        setSearchQuery('');
        setHasInteracted(true);
      }
    }
  };

  // Effect untuk menangani klik pertama / setelah search di-reset
  // Saat pendingIsoRef ada, cari country di countries (full list) dan set index
  useEffect(() => {
    if (!pendingIsoRef.current || countries.length === 0) return;
    const iso = pendingIsoRef.current;
    const fullIndex = countries.findIndex(
      (c) => c.iso.toLowerCase() === iso.toLowerCase()
    );
    if (fullIndex !== -1) {
      pendingIsoRef.current = null;
      setCurrentIndex(fullIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInteracted, countries, searchQuery]);

  const getVisibleItems = () => {
    if (filteredCountries.length === 0) return [];

    if (filteredCountries.length < 5) {
      return filteredCountries.map((item, idx) => ({
        ...item,
        offset: idx - currentIndex,
      }));
    }

    const items = [];
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + filteredCountries.length) % filteredCountries.length;
      items.push({ ...filteredCountries[index], offset: i });
    }
    return items;
  };

  // Ambil data negara yang sedang dipilih untuk kalkulasi income & outcome
  const currentCountry = hasInteracted ? filteredCountries[currentIndex] : null;

  const taxIncome = hasInteracted ? calculateTotalTaxIncome(countryDetail) : 0;
  const goldIncome = hasInteracted ? calculateGoldMiningIncome(countryDetail) : 0;
  const totalIncome = taxIncome + goldIncome;

  const ministryCostDaily = hasInteracted ? calculateTotalMinistryCostPerDay(countryDetail) : 0;

  const netBalance = hasInteracted ? calculateCountryNetBalance(countryDetail) : 0;

  return (
    <div className="relative min-h-screen bg-[#070b14] overflow-hidden font-sans">
      {/* Status Bar / Top Bar (Header) */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0A1A1A]/90 backdrop-blur-md border-b border-[#00FFAA]/20 px-2 sm:px-3 lg:px-4 xl:px-8 py-1 sm:py-1.5 xl:py-3.5 flex items-center justify-between min-h-[48px] lg:h-14 xl:h-20 overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 xl:gap-6 overflow-hidden">
          {/* Tabel 207 Negara Icon */}
          <Link
            href="/page/map_system/tabel_negara"
            className="flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA]/10 transition-all cursor-pointer shrink-0"
            title="Tabel 207 Negara"
          >
            <Table className="w-3 h-3 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
          </Link>

          <div className="flex items-center gap-1.5 lg:gap-3 xl:gap-6 shrink-0">
            <StatusItem
              icon={<MapPin className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#00FFAA]" />}
              label="IBUKOTA"
              value={hasInteracted && filteredCountries[currentIndex] ? (filteredCountries[currentIndex]?.capital || '-') : '-'}
            />
            <StatusItem
              icon={<Users className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#00FFAA]" />}
              label="POPULASI"
              value={hasInteracted && countryDetail ? (countryDetail?.jumlah_penduduk?.toLocaleString('id-ID') || '0') : '-'}
            />
            <StatusItem
              icon={<Landmark className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#00FFAA]" />}
              label="KAS NEGARA"
              value={hasInteracted && countryDetail ? `${countryDetail?.anggaran || 0} EM` : '-'}
            />

            <StatusItem
              icon={<TrendingUp className="w-3 h-3 xl:w-3.5 xl:h-3.5 text-[#00FFAA]" />}
              label="NETTO APBN"
              value={
                hasInteracted && countryDetail && Object.keys(countryDetail).length > 0
                  ? netBalance >= 0
                    ? `+ ${netBalance.toLocaleString('id-ID')}`
                    : `- ${Math.abs(netBalance).toLocaleString('id-ID')}`
                  : '-'
              }
              color={
                hasInteracted && countryDetail && Object.keys(countryDetail).length > 0
                  ? netBalance >= 0
                    ? 'text-[#00FFAA]'
                    : 'text-rose-400'
                  : 'text-[#E0E0E0]'
              }
            />

            <StatusItem icon={<Globe className="w-3.5 h-3.5 text-[#00FFAA]" />} label="TOTAL NEGARA" value="207" />
            <StatusItem
              icon={<Home className="w-3.5 h-3.5 text-[#00FFAA]" />}
              label="AGAMA MAYORITAS"
              value={hasInteracted && countryDetail ? (countryDetail?.religion || '-') : '-'}
            />
            <StatusItem
              icon={<Scale className="w-3.5 h-3.5 text-[#00FFAA]" />}
              label="IDEOLOGI"
              value={hasInteracted && countryDetail ? (countryDetail?.ideology || '-') : '-'}
            />

            {/* UN Vote Badge */}
            <div className="flex items-center gap-1.5 lg:gap-2.5 xl:gap-4 border-l border-[#00FFAA]/20 pl-2 lg:pl-3 xl:pl-6 shrink-0">
              <span className="text-[7.5px] lg:text-[8.5px] xl:text-[10px] font-black text-[#6B8A8A] tracking-widest uppercase">
                SUARA PBB
              </span>
              <div className="bg-[#0F2424] text-[#00FFAA] px-1.5 lg:px-2.5 xl:px-4 py-0.5 xl:py-1.5 rounded-lg font-black text-[9px] lg:text-[11px] xl:text-[14px] border border-[#00FFAA]/30">
                {hasInteracted && countryDetail ? (countryDetail?.un_vote || 0) : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 xl:gap-4 ml-1.5 xl:ml-4 shrink-0">
          <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 px-2 lg:px-3 xl:px-5 py-1 lg:py-1.5 xl:py-2.5 rounded-xl xl:rounded-2xl min-w-[110px] lg:min-w-[150px] xl:min-w-[200px] flex items-center">
            {hasInteracted && filteredCountries[currentIndex] ? (
              <img
                src={`https://flagcdn.com/w80/${filteredCountries[currentIndex]?.iso?.toLowerCase()}.png`}
                className="w-4.5 h-3 lg:w-5.5 lg:h-3.5 xl:w-8 xl:h-5 rounded-sm object-cover border border-[#00FFAA]/30 shrink-0"
                alt="flag"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                }}
              />
            ) : (
              <div className="w-5 h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/30 flex items-center justify-center text-xs lg:text-sm xl:text-xl shrink-0">🌐</div>
            )}
            <div className="ml-1.5 lg:ml-2 xl:ml-3 overflow-hidden">
              <Link
                href={hasInteracted && filteredCountries[currentIndex] ? `/page/map_system?country=${filteredCountries[currentIndex]?.country}` : '#'}
                onClick={(e) => {
                  if (!hasInteracted || !filteredCountries[currentIndex]) {
                    e.preventDefault();
                    return;
                  }
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('presiden_simulator_new_game', '1');
                  }
                }}
                className="flex flex-col"
              >
                <span className="text-[8.5px] lg:text-[10px] xl:text-[12px] font-black text-[#E0E0E0] tracking-tight uppercase group-hover:text-[#00FFAA] transition-colors truncate">
                  {hasInteracted && filteredCountries[currentIndex] ? filteredCountries[currentIndex]?.country : 'Select Country'}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold text-[#6B8A8A] uppercase tracking-widest truncate">
                  {hasInteracted && filteredCountries[currentIndex] ? filteredCountries[currentIndex]?.capital : 'Region Map'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A1A1A] flex items-center justify-center"
          >
            <div className="w-12 h-12 border-4 border-[#00FFAA]/20 border-t-[#00FFAA] rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 inset-x-0 bottom-0 z-0 pt-[48px] lg:pt-[56px] xl:pt-[80px]">
        <canvas
          id="map-canvas-bg"
          className="w-full h-full block cursor-pointer"
          onMouseDown={(e) => {
            dragStartPosRef.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={handleCanvasClick}
          onMouseLeave={(e) => {
            const event = new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            e.currentTarget.dispatchEvent(event);
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-end min-h-screen pb-4 sm:pb-8 lg:pb-12 pointer-events-none px-4 sm:px-6">

        {/* Tab & Search Kembali ke Tengah */}
        <div className="mb-3 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pointer-events-auto w-full max-w-lg sm:max-w-none">
          <div className="flex bg-[#0F2424]/90 backdrop-blur-md p-1 rounded-xl sm:rounded-2xl border border-[#00FFAA]/30">
            <button
              onClick={() => setActiveTab('utama')}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                activeTab === 'utama'
                  ? 'bg-[#00FFAA] text-[#0A1A1A]'
                  : 'text-[#6B8A8A] hover:text-[#E0E0E0]'
              }`}
            >
              PETA UTAMA
            </button>
            <button
              onClick={() => setActiveTab('hubungan')}
              className={`px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all cursor-pointer ${
                activeTab === 'hubungan'
                  ? 'bg-[#00FFAA] text-[#0A1A1A]'
                  : 'text-[#6B8A8A] hover:text-[#E0E0E0]'
              }`}
            >
              HUBUNGAN
            </button>
          </div>

          <div className="relative w-full sm:w-72 md:w-80">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00FFAA]" />
            <input
              type="text"
              placeholder="Cari Negara atau Ibukota..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-xl sm:rounded-2xl py-2 sm:py-2.5 pl-10 sm:pl-12 pr-4 sm:pr-6 text-[11px] sm:text-xs text-[#E0E0E0] placeholder:text-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all"
            />
          </div>
        </div>

        {/* RESOURCE MENU DENGAN BORDER BERDASARKAN DATABASE_SDA */}
        <div className="static lg:absolute lg:right-4 xl:right-6 lg:top-[64px] xl:top-[92px] z-30 flex flex-wrap items-center justify-center lg:justify-end gap-1 lg:gap-1.5 xl:gap-2 max-w-full sm:max-w-xl lg:max-w-[440px] xl:max-w-2xl pointer-events-auto p-2 lg:p-2.5 xl:p-3.5 bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-xl xl:rounded-2xl mb-2 lg:mb-0">
          
          {/* MODERN HEADER */}
          <div className="flex items-center justify-between w-full mb-1 lg:mb-2 xl:mb-3 pb-1 lg:pb-2 xl:pb-3 border-b border-[#00FFAA]/20">
            <div className="flex items-center gap-1.5 lg:gap-2 xl:gap-3">
              <div className="p-0.5 lg:p-1 xl:p-1.5 bg-[#00FFAA]/10 rounded-lg border border-[#00FFAA]/30">
                <Layers className="w-3 lg:w-3.5 xl:w-4 h-3 lg:h-3.5 xl:h-4 text-[#00FFAA]" />
              </div>
              <p className="text-[9px] lg:text-[10px] xl:text-xs font-black text-[#E0E0E0] uppercase tracking-wider leading-none">
                SUMBER DAYA ALAM
              </p>
            </div>

            {/* Badge Indikator Tersedia */}
            {hasInteracted && getCurrentSDA ? (
              <div className="flex items-center gap-1 xl:gap-1.5 bg-[#00FFAA]/10 px-1.5 lg:px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-full border border-[#00FFAA]/40">
                <span className="w-1 xl:w-1.5 h-1 xl:h-1.5 rounded-full bg-[#00FFAA] animate-pulse"></span>
                <span className="text-[7px] lg:text-[8px] xl:text-[9px] font-bold text-[#00FFAA] uppercase tracking-wide">
                  {Object.values(getCurrentSDA).filter(Boolean).length}/{resourceMap.length} Tersedia
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 xl:gap-1.5 bg-[#0A1A1A]/50 px-1.5 lg:px-2 xl:px-2.5 py-0.5 xl:py-1 rounded-full border border-[#6B8A8A]/30">
                <span className="w-1 xl:w-1.5 h-1 xl:h-1.5 rounded-full bg-[#6B8A8A]"></span>
                <span className="text-[7px] lg:text-[8px] xl:text-[9px] font-bold text-[#6B8A8A] uppercase tracking-wide">Pilih Negara</span>
              </div>
            )}
          </div>
          
          {/* LOGIKA MAPPING SDA */}
          {resourceMap.map((resource) => {
            const Icon = resource.icon;
            const sdaStatus = getCurrentSDA?.[resource.key as keyof SDAData];

            let borderClass = 'border border-[#00FFAA]/20 opacity-70';
            let dotColor = 'bg-[#6B8A8A]';
            let statusLabel: string | null = null;
            let statusColor = '';
            let cardBg = 'bg-[#0A1A1A]/60';

            if (sdaStatus === true) {
              borderClass = 'border border-[#00FFAA]';
              dotColor = 'bg-[#00FFAA]';
              statusColor = 'text-[#00FFAA]';
              cardBg = 'bg-[#0F2424]';
            } else if (sdaStatus === false) {
              borderClass = 'border border-rose-500/50';
              dotColor = 'bg-rose-500';
              statusColor = 'text-rose-400';
              cardBg = 'bg-[#0A1A1A]/60';
            }

            return (
              <div
                key={resource.key}
                className={`flex items-center gap-1 lg:gap-1.5 xl:gap-2 px-1.5 lg:px-2 xl:px-3 py-0.5 lg:py-1 xl:py-1.5 ${cardBg} backdrop-blur-md rounded-lg xl:rounded-xl text-[#E0E0E0] transition-all hover:bg-[#00FFAA] hover:text-[#0A1A1A] group cursor-pointer ${borderClass}`}
              >
                <div className={`w-1 xl:w-1.5 h-1 xl:h-1.5 rounded-full ${dotColor} shrink-0 ${sdaStatus === true ? 'animate-pulse' : ''}`} />
                <Icon className={`w-2.5 lg:w-3 xl:w-3.5 h-2.5 lg:h-3 xl:h-3.5 ${sdaStatus === true ? 'text-[#00FFAA] group-hover:text-[#0A1A1A]' : sdaStatus === false ? 'text-rose-400/60 group-hover:text-[#0A1A1A]' : 'text-[#6B8A8A] group-hover:text-[#0A1A1A]'}`} />
                <span className="text-[7px] lg:text-[8px] xl:text-[9px] font-bold uppercase tracking-wider group-hover:text-[#0A1A1A]">{resource.label}</span>
                {statusLabel && (
                  <span className={`text-[7px] xl:text-[8px] font-black ml-0.5 ${statusColor} group-hover:text-[#0A1A1A]`}>{statusLabel}</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Slider Negara */}
        <div className="relative w-full max-w-6xl flex items-center justify-center mb-2 lg:mb-4 xl:mb-8 pointer-events-auto">
          <button
            onClick={prevCountry}
            className="absolute left-0 z-30 p-1.5 lg:p-2 xl:p-2.5 rounded-full bg-[#0F2424] text-[#00FFAA] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
          </button>

          <div className="flex items-end gap-2 lg:gap-2.5 xl:gap-3 overflow-visible h-24 lg:h-28 xl:h-32 px-8 lg:px-10 xl:px-12">
            <AnimatePresence mode="popLayout">
              {getVisibleItems().map((item) => (
                <motion.div
                  key={`${item.country}-${item.offset}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  onClick={() => {
                    setCurrentIndex(
                      (prev) => (prev + item.offset + filteredCountries.length) % filteredCountries.length
                    );
                    setHasInteracted(true);
                  }}
                  animate={{
                    opacity: item.offset === 0 && hasInteracted ? 1 : Math.abs(item.offset) > 2 ? 0 : 0.5,
                    scale: item.offset === 0 && hasInteracted ? 1.15 : 0.9,
                    y: item.offset === 0 && hasInteracted ? -15 : 0,
                    zIndex: 10 - Math.abs(item.offset),
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`
                    relative w-24 lg:w-28 xl:w-36 h-20 lg:h-24 xl:h-28 rounded-xl xl:rounded-2xl p-2 lg:p-3 xl:p-4 flex flex-col items-center justify-center text-center cursor-pointer
                    ${item.offset === 0 && hasInteracted
                      ? 'bg-[#0F2424] border-2 border-[#00FFAA]'
                      : 'bg-[#0A1A1A]/80 border border-[#00FFAA]/20 hover:border-[#00FFAA]/50'
                    }
                    backdrop-blur-xl transition-all duration-300
                  `}
                >
                  <div
                    className={`w-8 lg:w-10 xl:w-12 h-5 lg:h-6.5 xl:h-8 rounded-sm mb-1 lg:mb-1.5 xl:mb-2.5 overflow-hidden border ${
                      item.offset === 0 && hasInteracted ? 'border-[#00FFAA]/50' : 'border-[#00FFAA]/20'
                    }`}
                  >
                    <img
                      src={`https://flagcdn.com/w80/${(item as any).iso}.png`}
                      alt={item.country}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://flagcdn.com/w80/un.png';
                      }}
                    />
                  </div>

                  <h3
                    className={`text-[7.5px] lg:text-[8.5px] xl:text-[9px] font-black leading-tight uppercase mb-0.5 truncate max-w-full ${
                      item.offset === 0 && hasInteracted ? 'text-[#00FFAA]' : 'text-[#E0E0E0]/70'
                    }`}
                  >
                    {item.country}
                  </h3>
                  <p
                    className={`text-[5.5px] lg:text-[6.5px] xl:text-[7px] font-bold uppercase truncate max-w-full ${
                      item.offset === 0 && hasInteracted ? 'text-[#E0E0E0]' : 'text-[#6B8A8A]'
                    }`}
                  >
                    {item.capital}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            onClick={nextCountry}
            className="absolute right-0 z-30 p-1.5 lg:p-2 xl:p-2.5 rounded-full bg-[#0F2424] text-[#00FFAA] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
          </button>
        </div>

        {/* Tombol Kembali & Mulai */}
        <div className="w-full px-4 sm:px-8 flex items-center justify-between pointer-events-auto">
          <Link
            href="/page"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#0F2424]/90 hover:bg-[#00FFAA] hover:text-[#0A1A1A] border border-[#00FFAA]/30 rounded-lg sm:rounded-xl text-[#00FFAA] font-bold tracking-widest text-[9px] sm:text-[10px] transition-all group cursor-pointer"
          >
            <div className="p-0.5 sm:p-1 bg-[#00FFAA]/10 group-hover:bg-[#0A1A1A]/20 rounded-md sm:rounded-lg">
              <ArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00FFAA] group-hover:text-[#0A1A1A]" />
            </div>
            KEMBALI
          </Link>

          <Link
            href={
              hasInteracted && filteredCountries[currentIndex]
                ? `/page/map_system?country=${filteredCountries[currentIndex]?.country}`
                : '#'
            }
            onClick={(e) => {
              if (!hasInteracted || !filteredCountries[currentIndex]) {
                e.preventDefault();
                return;
              }
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('presiden_simulator_new_game', '1');
              }
            }}
            className={`flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-2 sm:py-2.5 ${
              hasInteracted && filteredCountries[currentIndex]
                ? 'bg-[#00FFAA] text-[#0A1A1A] hover:scale-105 border border-[#00FFAA]'
                : 'bg-[#0F2424] text-[#6B8A8A] opacity-50 border border-[#00FFAA]/10 cursor-not-allowed'
            } font-black tracking-widest rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] transition-all cursor-pointer`}
            aria-disabled={!hasInteracted || !filteredCountries[currentIndex]}
          >
            MULAI SIMULASI
            <Play className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${hasInteracted && filteredCountries[currentIndex] ? 'fill-[#0A1A1A]' : 'fill-[#6B8A8A]'}`} />
          </Link>
        </div>
      </div>

      {/* Debug Modal */}
      <DebugAPBN
        isOpen={isDebugOpen}
        onClose={() => {
          setIsDebugOpen(false);
          setIsDebugAllCountries(false);
        }}
        countryName={isDebugAllCountries ? 'Semua Negara' : (hasInteracted && filteredCountries[currentIndex] ? filteredCountries[currentIndex]?.country || '-' : '-')}
        countryDetail={isDebugAllCountries ? null : countryDetail}
        taxIncome={taxIncome}
        goldIncome={goldIncome}
        ministryCost={ministryCostDaily}
        netBalance={netBalance}
        hasInteracted={hasInteracted}
        showAllCountries={isDebugAllCountries}
      />
    </div>
  );
}

function StatusItem({
  icon,
  label,
  value,
  color = 'text-[#E0E0E0]',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-4 min-w-fit">
      <div className="p-2 bg-[#0F2424] rounded-xl text-[#00FFAA] border border-[#00FFAA]/20">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-[#6B8A8A] tracking-widest uppercase leading-none mb-1.5">
          {label}
        </span>
        <span className={`text-[13px] font-black tracking-tighter uppercase leading-none ${color}`}>
          {value}
        </span>
      </div>
    </div>
  );
}