// beli/beliModalsKonfirmasiBeli.tsx

"use client"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import { TradePartner } from "../mitra/mitraModalsMenu";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate, normalizePartnerBuildDates } from '@/app/logic/production_logic';
import countryPaths from '@/app/page/map_system/country-paths.json';
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints) + " ";
};

import { 
  hasUraniumBuilding, 
  hasBatubaraBuilding, 
  hasMinyakBumiBuilding,
  hasGasAlamBuilding,
  hasGaramBuilding,
  hasLitiumBuilding,
  hasLogamTanahJarangBuilding,
  hasBijihBesiBuilding,
  hasSemikonduktorBuilding,
  hasMobilBuilding,
  hasSepedaMotorBuilding,
  hasSemenBetonBuilding,
  hasKayuBuilding,
  hasAyamUnggasBuilding,
  hasSapiPerahBuilding,
  hasSapiPotongBuilding,
  hasDombaKambingBuilding,
  hasPadiBuilding,
  hasGandumBuilding,
  hasJagungBuilding,
  hasUmbiBuilding,
  hasKedelaiBuilding,
  hasKelapaSawitBuilding,
  hasTehBuilding,
  hasKopiBuilding,
  hasKakaoBuilding,
  hasTebuBuilding,
  hasSayurBuilding,
  hasKaretBuilding,
  hasUdangBuilding,
  hasIkanBuilding,
  hasMutiaraBuilding,
  hasAirMineralBuilding,
  hasGulaBuilding,
  hasRotiBuilding,
  hasPengolahanDagingBuilding,
  hasMieInstanBuilding,
  hasMinyakGorengBuilding,
  hasSusuBuilding
} from "./index";

// --- IMPORT MODAL PICKER BARU ---
import PilihItemModal from "./PilihItemModal";

interface CountryDetail {
  [key: string]: unknown;
  anggaran?: number;
}

interface MetadataEntry {
  dataKey?: string;
  biaya_pembangunan?: number;
  produksi?: number;
  satuan?: string;
}

type MetadataMap = Record<string, MetadataEntry>;

const ALL_IMPORT_KEYS = [
  "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang",
  "semikonduktor", "mobil", "sepeda_motor", "semen_beton", "kayu",
  "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
  "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
  "udang", "mutiara", "ikan",
  "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
];

// --- DEFINISI KATEGORI UNTUK PRODUK BELI ---
const CATEGORY_MAP: Record<string, string[]> = {
  'Mineral Kritis': ["uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  'Manufaktur': ["semikonduktor", "mobil", "sepeda_motor", "semen_beton", "kayu"],
  'Peternakan': ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  'Agrikultur': ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  'Perikanan': ["udang", "mutiara", "ikan"],
  'Olahan Pangan': ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"]
};

interface ModalsKonfirmasiBeliProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (biaya: number, kuantitas: string) => void;
  countryDetail: CountryDetail | null;
  setCountryDetail: (detail: CountryDetail | ((prev: CountryDetail) => CountryDetail)) => void;
  partners: TradePartner[];
  currentDate?: Date;
  initialPartnerName?: string;
  initialProductKey?: string;
  prefetchedAllCountries?: any[];
  partnerOffers?: any[];
}

// --- HARGA DEFAULT PASAR (BERLAKU UNTUK BELI) ---
const DEFAULT_PRICES: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000,
  semikonduktor: 4000, mobil: 15000, sepeda_motor: 5000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160
};

// --- HELPER TANGGAL UNTUK CHART ---
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  return new Date(year, month + 1, 0).getDate();
};

const getDaysInLastMonths = (endDate: Date, count: number) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    const d = new Date(endDate);
    d.setMonth(d.getMonth() - i);
    total += getDaysInMonth(d);
  }
  return total;
};

const isLeapYear = (date: Date) => {
  const year = date.getFullYear();
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// --- GENERATE DATA CANDLESTICK (OHLC) UNTUK HARGA BELI ---
const generateCandleData = (
  endDate: Date,
  timeRange: string,
  currentPrice: number,
  volatility: number = 0.04,
  trend: number = 0.001
) => {
  const MS_PER_HOUR = 3600000;
  const MS_PER_DAY = 86400000;

  let points = 0;
  let intervalMs = MS_PER_DAY;

  switch (timeRange) {
    case '1d': points = 24; intervalMs = MS_PER_HOUR; break;
    case '1w': points = 7; intervalMs = MS_PER_DAY; break;
    case '1m': points = getDaysInMonth(endDate); intervalMs = MS_PER_DAY; break;
    case '6m': points = getDaysInLastMonths(endDate, 6); intervalMs = MS_PER_DAY; break;
    case '1y': points = isLeapYear(endDate) ? 366 : 365; intervalMs = MS_PER_DAY; break;
    default: points = 24; intervalMs = MS_PER_HOUR;
  }

  if (points <= 0) return [];
  const data = [];
  const times: Date[] = [];

  for (let i = 0; i < points; i++) {
    if (timeRange === '1d') {
      const start = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      times.push(new Date(start.getTime() + i * intervalMs));
    } else {
      times.push(new Date(endDate.getTime() - (points - i) * intervalMs));
    }
  }

  let prevClose = currentPrice;
  for (let i = points - 1; i >= 0; i--) {
    const open = prevClose;
    const change = (Math.random() - 0.5) * volatility * open + trend * open;
    let close = Math.max(open + change, currentPrice * 0.5);
    close = Math.round(close * 100) / 100;

    const shadowTop = Math.random() * volatility * open * 0.6;
    const shadowBottom = Math.random() * volatility * open * 0.6;
    
    const high = Math.max(open, close) + shadowTop;
    const low = Math.min(open, close) - shadowBottom;

    data.push({
      time: times[i],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: close
    });

    prevClose = close;
  }

  return data.reverse();
};

export default function ModalsKonfirmasiBeli({ 
  isOpen, 
  onClose, 
  onConfirm, 
  countryDetail, 
  setCountryDetail, 
  partners,
  currentDate,
  initialPartnerName,
  initialProductKey,
  prefetchedAllCountries,
  partnerOffers = []
}: ModalsKonfirmasiBeliProps) {
  const [metadata, setMetadata] = useState<MetadataMap>({});
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  
  const [partnerDataRaw, setPartnerDataRaw] = useState<Record<string, any> | null>(null);
  const partnerStartDateRef = useRef<string | null>(null);
  const lastCountryRef = useRef<string>("");
  const isInitialized = useRef(false);

  // --- STATE UNTUK MODAL PICKER BARU ---
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  // --- STATE UNTUK MARKET PRICES, CHART, TIME RANGE ---
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [ohlcSeries, setOhlcSeries] = useState<Record<string, {time: Date; open: number; high: number; low: number; close: number}[]>>({});
  const prevDateRef = useRef<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1d');

  // ===========================
  // PERBAIKAN: Pindahkan formatLabel KE ATAS sebelum dipakai useMemo
  // ===========================
  const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

  const targetCountry = selectedCountry || partners[0]?.nama_negara || "";

  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then((data) => setMetadata(data || {}));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPartnerDataRaw(null);
      return;
    }

    if (!targetCountry) {
      setPartnerDataRaw(null);
      return;
    }

    if (lastCountryRef.current !== targetCountry) {
      partnerStartDateRef.current = null;
      lastCountryRef.current = targetCountry;
    }

    // Check if we already have it in prefetchedAllCountries to show immediately!
    const matched = prefetchedAllCountries?.find(c => {
      const cName = (c.name_id || c.name_en || c.nama || c.country || '').toLowerCase().trim();
      return cName === targetCountry.toLowerCase().trim();
    });

    if (matched) {
      setPartnerDataRaw(matched);
      if (!partnerStartDateRef.current) {
        partnerStartDateRef.current = currentDate ? formatDate(currentDate) : formatDate(new Date());
      }
      return;
    }

    const pathEntry = (countryPaths as Record<string, string>)[targetCountry];
    if (!pathEntry) {
      setPartnerDataRaw(null);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/country-data?path=${encodeURIComponent(pathEntry)}`);
        if (!res.ok) {
          setPartnerDataRaw(null);
          return;
        }
        const json = await res.json();
        setPartnerDataRaw(json || null);
        if (!partnerStartDateRef.current) {
          partnerStartDateRef.current = currentDate ? formatDate(currentDate) : formatDate(new Date());
        }
      } catch (e) {
        console.error('Failed to fetch partner country data', e);
        setPartnerDataRaw(null);
      }
    };

    fetchData();
  }, [isOpen, targetCountry, currentDate, prefetchedAllCountries]);

  // Initialize game_start_date in countryDetail if not present to have a persistent simulation start date
  useEffect(() => {
    if (isOpen && countryDetail && !countryDetail.game_start_date && currentDate) {
      setCountryDetail(prev => {
        if (!prev) return prev;
        if (prev.game_start_date) return prev;
        return {
          ...prev,
          game_start_date: formatDate(currentDate)
        };
      });
    }
  }, [isOpen, countryDetail, currentDate, setCountryDetail]);

  const partnerData = useMemo(() => {
    if (!partnerDataRaw) return null;
    const gameStartDate = (countryDetail?.game_start_date as string) || (currentDate ? formatDate(currentDate) : formatDate(new Date()));
    return normalizePartnerBuildDates(partnerDataRaw, ALL_IMPORT_KEYS, new Date(gameStartDate));
  }, [partnerDataRaw, countryDetail?.game_start_date, currentDate]);

  // --- EFEK UPDATE HARGA PASAR SETIAP HARI ---
  useEffect(() => {
    if (!currentDate) return;
    const currentDateStr = formatDate(currentDate);
    const prevDateStr = prevDateRef.current;

    if (prevDateStr === currentDateStr) return;

    setMarketPrices(prev => {
      const newPrices = { ...prev };
      for (const key of ALL_IMPORT_KEYS) {
        const oldPrice = newPrices[key] || DEFAULT_PRICES[key] || 100;
        const volatility = 0.05;
        const change = (Math.random() - 0.5) * volatility * oldPrice;
        const newPrice = Math.max(oldPrice + change, oldPrice * 0.5);
        newPrices[key] = Math.round(newPrice * 100) / 100;
      }
      return newPrices;
    });

    prevDateRef.current = currentDateStr;
  }, [currentDate]);

  const findMeta = useCallback((key: string) => {
    if (!metadata) return undefined;
    if (metadata[key]) return metadata[key];
    for (const k of Object.keys(metadata)) {
      const entry = metadata[k];
      if (!entry) continue;
      if (entry.dataKey === key) return entry;
      if (k.endsWith(`_${key}`) || k === `1_${key}`) return entry;
    }
    return undefined;
  }, [metadata]);

  const checkMap: Record<string, (data: Record<string, any> | null) => boolean> = {
    uranium: hasUraniumBuilding,
    batu_bara: hasBatubaraBuilding,
    minyak_bumi: hasMinyakBumiBuilding,
    gas_alam: hasGasAlamBuilding,
    garam: hasGaramBuilding,
    litium: hasLitiumBuilding,
    logam_tanah_jarang: hasLogamTanahJarangBuilding,
    bijih_besi: hasBijihBesiBuilding,
    semikonduktor: hasSemikonduktorBuilding,
    mobil: hasMobilBuilding,
    sepeda_motor: hasSepedaMotorBuilding,
    semen_beton: hasSemenBetonBuilding,
    kayu: hasKayuBuilding,
    ayam_unggas: hasAyamUnggasBuilding,
    sapi_perah: hasSapiPerahBuilding,
    sapi_potong: hasSapiPotongBuilding,
    domba_kambing: hasDombaKambingBuilding,
    padi: hasPadiBuilding,
    gandum: hasGandumBuilding,
    jagung: hasJagungBuilding,
    umbi: hasUmbiBuilding,
    kedelai: hasKedelaiBuilding,
    kelapa_sawit: hasKelapaSawitBuilding,
    teh: hasTehBuilding,
    kopi: hasKopiBuilding,
    kakao: hasKakaoBuilding,
    tebu: hasTebuBuilding,
    sayur: hasSayurBuilding,
    karet: hasKaretBuilding,
    udang: hasUdangBuilding,
    ikan: hasIkanBuilding,
    mutiara: hasMutiaraBuilding,
    air_mineral: hasAirMineralBuilding,
    gula: hasGulaBuilding,
    roti: hasRotiBuilding,
    pengolahan_daging: hasPengolahanDagingBuilding,
    mie_instan: hasMieInstanBuilding,
    minyak_goreng: hasMinyakGorengBuilding,
    susu: hasSusuBuilding,
  };

  const getFirstAvailableProduct = (): string => {
    if (!partnerData) return ALL_IMPORT_KEYS[0];
    return ALL_IMPORT_KEYS.find((key) => {
      const checkFn = checkMap[key];
      if (checkFn) {
        return checkFn(partnerData);
      }
      return true;
    }) || ALL_IMPORT_KEYS[0];
  };

  const isProductAvailable = (key: string): boolean => {
    if (!partnerData) return false;
    const checkFn = checkMap[key];
    if (checkFn) {
      return checkFn(partnerData);
    }
    return true;
  };

  // ===========================
  // DATA KATEGORI PRODUK (SUDAH BISA MENGAKSES formatLabel)
  // ===========================
  const groupedProductItems = useMemo(() => {
    return Object.entries(CATEGORY_MAP).map(([category, keys]) => ({
      category,
      items: keys.map(key => ({
        label: formatLabel(key),
        value: key,
        disabled: checkMap[key] ? !checkMap[key](partnerData) : false
      }))
    }));
  }, [partnerData]);

  const countryItems = useMemo(() => {
    return partners.map(p => ({
      label: p.nama_negara,
      value: p.nama_negara,
      disabled: false
    }));
  }, [partners]);

  const effectiveSelectedProduct = selectedProduct || (partnerData ? getFirstAvailableProduct() : "");
  const effectiveSelectedCountry = selectedCountry || partners[0]?.nama_negara || "";

  const stockAvailable = useMemo(() => {
    if (!effectiveSelectedProduct) return 0;
    const buildingCount = Number(countryDetail?.[effectiveSelectedProduct]) || 0;
    if (buildingCount === 0) return 0;

    const bMeta = findMeta(effectiveSelectedProduct);
    if (!bMeta || !bMeta.produksi || !currentDate) return 0;

    const buildDateKey = `build_date_${effectiveSelectedProduct}`;
    const buildDateRaw = countryDetail?.[buildDateKey];
    const currentDateStr = formatDate(currentDate);
    let finalBuildDate: string;
    if (typeof buildDateRaw === 'string' && buildDateRaw) {
      finalBuildDate = buildDateRaw;
    } else {
      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      finalBuildDate = formatDate(yesterday);
    }

    const baseProduction = calculateProductionIncrement(
      bMeta.produksi,
      buildingCount,
      finalBuildDate,
      currentDateStr
    );

    const soldCount = Number(countryDetail?.[`total_sold_${effectiveSelectedProduct}`]) || 0;
    const boughtCount = Number(countryDetail?.[`total_bought_${effectiveSelectedProduct}`]) || 0;
    return Math.max(0, baseProduction + boughtCount - soldCount);
  }, [effectiveSelectedProduct, currentDate, countryDetail, findMeta]);

  const partnerProduction = useMemo(() => {
    if (!effectiveSelectedProduct || !partnerData) return 0;
    const pBuildingCount = Number(partnerData[effectiveSelectedProduct] || 0);
    if (pBuildingCount === 0) return 0;

    const pMeta = findMeta(effectiveSelectedProduct);
    if (!pMeta || !pMeta.produksi || !currentDate) return 0;

    const pBuildDateKey = `build_date_${effectiveSelectedProduct}`;
    const pBuildDate = partnerData[pBuildDateKey] as string | undefined;
    const currentDateStr = formatDate(currentDate);
    let pFinalBuildDate: string;
    if (typeof pBuildDate === 'string' && pBuildDate) {
      pFinalBuildDate = pBuildDate;
    } else {
      const thirtyDaysAgo = new Date(currentDate);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      pFinalBuildDate = formatDate(thirtyDaysAgo);
    }

    const basePartnerProd = calculateProductionIncrement(
      pMeta.produksi,
      pBuildingCount,
      pFinalBuildDate,
      currentDateStr
    );

    const partnerSold = Number(countryDetail?.[`partner_sold_${targetCountry}_${effectiveSelectedProduct}`]) || 0;
    return Math.max(0, basePartnerProd - partnerSold);
  }, [effectiveSelectedProduct, currentDate, partnerData, findMeta, countryDetail, targetCountry]);

  // --- EFEK INISIALISASI PRODUK DAN NEGARA ---
  useEffect(() => {
    if (!isOpen) {
      isInitialized.current = false;
      return;
    }

    if (!partnerData) return;

    let targetProduct = selectedProduct;
    if (initialProductKey && isProductAvailable(initialProductKey)) {
      targetProduct = initialProductKey;
    } else if (!isProductAvailable(selectedProduct)) {
      targetProduct = getFirstAvailableProduct();
    }

    let initialQty = 1;
    if (initialPartnerName && targetProduct && partnerOffers.length > 0) {
      const matchedOffer = partnerOffers.find(
        o => o.partnerName.toLowerCase().trim() === initialPartnerName.toLowerCase().trim() &&
             o.productKey === targetProduct
      );
      if (matchedOffer) {
        initialQty = matchedOffer.quantity;
        // Dan set harga pasar untuk produk ini agar sesuai dengan tawaran
        setMarketPrices(prev => ({
          ...prev,
          [targetProduct]: matchedOffer.pricePerUnit
        }));
      }
    }
    
    if (targetProduct !== selectedProduct) {
      setSelectedProduct(targetProduct);
      setQuantity(initialQty);
    } else if (initialQty !== quantity && initialQty !== 1) {
      setQuantity(initialQty);
    }

    if (initialPartnerName && !selectedCountry) {
      setSelectedCountry(initialPartnerName);
    } else if (partners.length > 0 && !selectedCountry) {
      setSelectedCountry(partners[0].nama_negara);
    }

    isInitialized.current = true;
  }, [isOpen, partners, partnerData, selectedCountry, selectedProduct, initialPartnerName, initialProductKey, partnerOffers]);

  useEffect(() => {
    if (!isOpen || !selectedProduct || !countryDetail) return;

    const buildingCount = Number(countryDetail[selectedProduct] || 0);
    if (buildingCount <= 0) return;

    const buildDateKey = `build_date_${selectedProduct}`;
    const existingBuildDate = countryDetail[buildDateKey];
    if (typeof existingBuildDate === 'string' && existingBuildDate) return;

    const currentDateStr = formatDate(currentDate || new Date());
    setCountryDetail((prev) => {
      if (!prev) return prev;
      if (Number(prev[selectedProduct] || 0) <= 0) return prev;
      if (typeof prev[buildDateKey] === 'string' && prev[buildDateKey]) return prev;
      return {
        ...prev,
        [buildDateKey]: currentDateStr,
      };
    });
  }, [isOpen, selectedProduct, countryDetail, currentDate, setCountryDetail]);

  // --- EFEK UPDATE CHART SAAT PRODUK/RANGE ATAU HARGA BERUBAH ---
  const seriesKey = `${effectiveSelectedProduct}-${timeRange}`;
  useEffect(() => {
    if (!effectiveSelectedProduct || !currentDate || !marketPrices[effectiveSelectedProduct]) return;
    const buyPrice = marketPrices[effectiveSelectedProduct]; // Harga beli unit dasar mengikuti pasar
    const newSeries = generateCandleData(currentDate, timeRange, buyPrice, 0.04, 0.001);
    setOhlcSeries(prev => ({ ...prev, [seriesKey]: newSeries }));
  }, [effectiveSelectedProduct, timeRange, currentDate, marketPrices, seriesKey]);

  if (!isOpen) return null;

  const currentMeta = findMeta(effectiveSelectedProduct);

  // HARGA DINAMIS PASAR
  const currentPrice = marketPrices[effectiveSelectedProduct] || 0;
  // FAKTOR BELI (MISAL 2x HARGA PASAR)
  const BUY_FACTOR = 2;
  const totalPrice = currentPrice * BUY_FACTOR * quantity;

  // --- RENDER CANDLESTICK CHART ---
  const renderCandlestickChart = () => {
    const series = ohlcSeries[seriesKey];
    if (!series || series.length < 2) {
      return <div className="text-xs text-[#8b7e66] text-center py-4">Tidak ada data harga</div>;
    }

    const width = 800;
    const height = 220;
    const padding = { top: 10, bottom: 20, left: 50, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    series.forEach(d => {
      minPrice = Math.min(minPrice, d.low);
      maxPrice = Math.max(maxPrice, d.high);
    });
    const rangeBuffer = (maxPrice - minPrice) * 0.05;
    const yMin = Math.max(0, minPrice - rangeBuffer);
    const yMax = maxPrice + rangeBuffer;
    const priceRange = yMax - yMin || 1;

    const xScale = (index: number) => padding.left + (index / (series.length - 1)) * chartWidth;
    const yScale = (price: number) => padding.top + chartHeight - ((price - yMin) / priceRange) * chartHeight;

    const candleWidth = Math.max(3, (chartWidth / series.length) * 0.6);
    const halfCandleWidth = candleWidth / 2;

    const formatXLabel = (index: number) => {
      const date = series[index].time;
      if (timeRange === '1d') return date.getHours() + ':' + String(date.getMinutes()).padStart(2, '0');
      if (timeRange === '1w') return date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
      <div className="w-full flex justify-center">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" className="max-w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + chartHeight * (1 - ratio);
            return (
              <line key={ratio} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
            );
          })}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#C4B49C" strokeWidth="1" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#C4B49C" strokeWidth="1" />
          <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" fontSize="9" fill="#8b7e66">{yMax.toFixed(0)}</text>
          <text x={padding.left - 6} y={height - padding.bottom + 4} textAnchor="end" fontSize="9" fill="#8b7e66">{yMin.toFixed(0)}</text>
          <text x={padding.left} y={height - 2} textAnchor="middle" fontSize="9" fill="#8b7e66">{formatXLabel(0)}</text>
          <text x={width - padding.right} y={height - 2} textAnchor="middle" fontSize="9" fill="#8b7e66">{formatXLabel(series.length - 1)}</text>

          {series.map((d, i) => {
            const x = xScale(i);
            const yHigh = yScale(d.high);
            const yLow = yScale(d.low);
            const yOpen = yScale(d.open);
            const yClose = yScale(d.close);
            const isGreen = d.close >= d.open;
            const color = isGreen ? "#26a69a" : "#ef5350";
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));

            return (
              <g key={i}>
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                <rect x={x - halfCandleWidth} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} />
              </g>
            );
          })}

          {/* Indikator harga saat ini */}
          <line x1={padding.left} y1={yScale(currentPrice)} x2={width - padding.right} y2={yScale(currentPrice)} stroke="#c77a00" strokeDasharray="4 4" strokeWidth="1.5" />
          <circle cx={width - padding.right} cy={yScale(currentPrice)} r="5" fill="#c77a00" stroke="#FAF6EE" strokeWidth="2" />
          <text x={width - padding.right + 5} y={yScale(currentPrice) + 3} fontSize="9" fill="#c77a00" fontWeight="bold">
            {currentPrice.toLocaleString("id-ID")} EM
          </text>
        </svg>
      </div>
    );
  };

  const handleConfirm = () => {
    const detail = countryDetail ?? {};
    const currentBudget = typeof detail.anggaran === "number" ? detail.anggaran : 0;

    // Cek apakah ini transaksi dari tawaran AI yang valid
    const matchedOffer = partnerOffers?.find(
      o => o.partnerName.toLowerCase().trim() === targetCountry.toLowerCase().trim() &&
           o.productKey === effectiveSelectedProduct &&
           o.quantity === quantity
    );

    if (!matchedOffer && quantity > partnerProduction) {
      alert(`Stok mitra tidak mencukupi! Stok tersedia hanya ${partnerProduction.toLocaleString("id-ID")} unit.`);
      return;
    }

    if (currentBudget < totalPrice) {
      alert(`Kas Negara tidak mencukupi! Butuh ${totalPrice.toLocaleString("id-ID")} EM.`);
      return;
    }

    const boughtKey = `total_bought_${effectiveSelectedProduct}`;
    const currentBought = Number(detail[boughtKey]) || 0;

    const partnerSoldKey = `partner_sold_${targetCountry}_${effectiveSelectedProduct}`;
    const currentPartnerSold = Number(detail[partnerSoldKey]) || 0;

    // Simpan juga accumulatedKey untuk kecocokan kode lama
    const accumulatedKey = `accumulated_${effectiveSelectedProduct}`;

    setCountryDetail({ 
      ...detail, 
      anggaran: currentBudget - totalPrice,
      [boughtKey]: currentBought + quantity,
      [partnerSoldKey]: currentPartnerSold + quantity,
      [accumulatedKey]: stockAvailable + quantity
    });

    onConfirm(totalPrice, `${quantity}x Satuan`);
    alert(`Berhasil membeli ${quantity} ${formatLabel(effectiveSelectedProduct)} dari ${targetCountry}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.02)_0%,transparent_100%)] pointer-events-none" />
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600/10 rounded-xl border border-emerald-600/20">
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
            </div>
            <h2 className="text-lg font-bold text-[#5c3c10] tracking-tight uppercase">Beli Komoditas</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 relative z-10 space-y-4">
          
          {/* --- INPUT CARD PRODUK & NEGARA (MENGGANTIKAN SELECT) --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[#5c3c10] font-bold text-sm tracking-wide">Produk:</label>
              <button
                onClick={() => setIsProductPickerOpen(true)}
                className="w-full px-4 py-3 rounded-md bg-[#3b7d7d] text-white text-sm font-bold flex items-center justify-between hover:bg-[#2e6363] transition-all shadow-sm cursor-pointer"
              >
                <span>{formatLabel(effectiveSelectedProduct)}</span>
                <span className="text-[10px] opacity-70 uppercase tracking-wider">Ubah</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#5c3c10] font-bold text-sm tracking-wide">Negara:</label>
              <button
                onClick={() => setIsCountryPickerOpen(true)}
                className="w-full px-4 py-3 rounded-md bg-[#3b7d7d] text-white text-sm font-bold flex items-center justify-between hover:bg-[#2e6363] transition-all shadow-sm cursor-pointer"
              >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === effectiveSelectedCountry.toLowerCase().trim());
                      const iso = matched?.iso;
                      if (!iso || iso.length !== 2) {
                        return (
                          <div className="w-8 h-5 rounded-sm bg-[#FAF6EE]/20 border border-[#FAF6EE]/30 flex-shrink-0 shadow-sm" />
                        );
                      }
                      return (
                        <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#FAF6EE]/30 flex-shrink-0 shadow-sm bg-[#FAF6EE] relative">
                          <img
                            src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
                            alt={effectiveSelectedCountry}
                            className="w-full h-full object-cover absolute inset-0"
                          />
                        </div>
                      );
                    })()}
                    <span>{effectiveSelectedCountry}</span>
                  </span>
                 <span className="text-[10px] opacity-70 uppercase tracking-wider">Ubah</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 pb-1 border-b border-[#C4B49C]/10">
            <span className="text-[#5c3c10] font-bold text-sm tracking-wide">Stok Tersedia (Anda):</span>
            <span className="text-sm font-black text-[#2e261a]">
              {stockAvailable.toLocaleString("id-ID")} <span className="text-[10px] text-[#8b7e66] font-bold">Unit</span>
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center pt-1 pb-0">
              <span className="text-[#5c3c10] font-bold text-sm tracking-wide">Bangunan {formatLabel(effectiveSelectedProduct)} (Mitra):</span>
              <span className="text-sm font-black text-[#2e261a]">
                {Number(partnerData?.[effectiveSelectedProduct] || 0).toLocaleString('id-ID')} <span className="text-[10px] text-[#8b7e66] font-bold">Unit</span>
              </span>
            </div>
            <div className="flex justify-between items-center pt-0 pb-1">
              <span className="text-[#5c3c10] font-bold text-sm tracking-wide">Produksi Mitra (Total):</span>
              <span className="text-sm font-black text-[#2e261a]">
                {(() => {
                  const matchedOffer = partnerOffers?.find(
                    o => o.partnerName.toLowerCase().trim() === targetCountry.toLowerCase().trim() &&
                         o.productKey === effectiveSelectedProduct
                  );
                  const displayValue = matchedOffer ? Math.max(matchedOffer.quantity, partnerProduction) : partnerProduction;
                  return displayValue.toLocaleString('id-ID');
                })()} <span className="text-[10px] text-[#8b7e66] font-bold">Unit</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="text-[#5c3c10] font-bold text-sm tracking-wide">Kuantitas:</label>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded bg-[#3b7d7d] text-white hover:bg-[#2e6363] shadow-sm"><Minus className="h-3.5 w-3.5" /></button>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-16 px-2 py-1.5 text-center rounded bg-[#3b7d7d] text-white text-sm font-bold border-none focus:ring-2 focus:ring-[#c77a00]" />
              <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded bg-[#3b7d7d] text-white hover:bg-[#2e6363] shadow-sm"><Plus className="h-3.5 w-3.5" /></button>
              <button onClick={() => setQuantity(quantity + 1000)} className="px-2.5 py-1.5 rounded bg-[#3b7d7d] text-white text-[10px] font-bold hover:bg-[#2e6363] shadow-sm uppercase tracking-wide">+1k</button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#C4B49C]/20">
            <span className="text-[#5c3c10] font-bold text-sm tracking-wide">Harga / unit:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#2e261a]">{currentPrice.toLocaleString("id-ID")}</span>
              <span className="text-[10px] text-[#8b7e66] font-bold mt-0.5">EM</span>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-[#C4B49C]/20 pt-2 mt-1">
            <span className="text-[#5c3c10] font-bold text-sm tracking-wide">Total Pembelian :</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#2e261a]">{totalPrice.toLocaleString("id-ID")}</span>
              <span className="text-[10px] text-[#8b7e66] font-bold mt-0.5">EM</span>
            </div>
          </div>

          {/* CHART CANDLESTICK HARGA BELI */}
          <div className="pt-3 border-t border-[#C4B49C]/10 mt-2 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#5c3c10] font-bold text-sm tracking-wide">Grafik Harga Historis (Candlestick)</div>
              <div className="flex gap-1.5">
                {[
                  { label: '1H', value: '1d' },
                  { label: '1M', value: '1w' },
                  { label: '1B', value: '1m' },
                  { label: '6B', value: '6m' },
                  { label: '1T', value: '1y' }
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setTimeRange(value as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors ${
                      timeRange === value
                        ? 'bg-[#3b7d7d] text-white border-[#3b7d7d]'
                        : 'bg-transparent text-[#8b7e66] border-[#C4B49C] hover:bg-[#f0ebe2]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {renderCandlestickChart()}
          </div>
        </div>

        <div className="px-5 py-4 pb-8 border-t-2 border-[#C4B49C]/20 flex gap-3 bg-[#FAF6EE] relative z-10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-[#c49e6c] hover:bg-[#b08d5d] text-[#FAF6EE] text-xs font-black uppercase tracking-wide shadow-sm">Batal</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-[#3b7d7d] hover:bg-[#2e6363] text-[#FAF6EE] text-xs font-black uppercase tracking-wide shadow-sm">Beli</button>
        </div>
      </div>

      {/* --- MODAL PILIH PRODUK (Mengirim groupedProductItems) --- */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Pilih Produk Komoditas"
        data={groupedProductItems}
        selectedValue={effectiveSelectedProduct}
        onSelect={(val) => setSelectedProduct(val)}
      />

      {/* --- MODAL PILIH NEGARA (Mengirim countryItems) --- */}
      <PilihItemModal
        isOpen={isCountryPickerOpen}
        onClose={() => setIsCountryPickerOpen(false)}
        title="Pilih Negara Mitra"
        data={countryItems}
        selectedValue={effectiveSelectedCountry}
        onSelect={(val) => setSelectedCountry(val)}
      />
    </div>
  );
}