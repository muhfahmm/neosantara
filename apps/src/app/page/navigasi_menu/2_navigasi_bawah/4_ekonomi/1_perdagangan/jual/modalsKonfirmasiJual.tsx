"use client"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Send, Plus, Minus } from "lucide-react";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate } from '@/app/logic/production_logic';
import { TradePartner } from "../mitra/mitraModalsMenu";
import countryPaths from '@/app/page/map_system/country-paths.json';
import PilihItemModal from "./PilihItemModal";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints) + " ";
};

import { 
  hasUraniumBuilding, hasBatubaraBuilding, hasMinyakBumiBuilding, hasGasAlamBuilding,
  hasGaramBuilding, hasLitiumBuilding, hasLogamTanahJarangBuilding, hasBijihBesiBuilding,
  hasSemikonduktorBuilding, hasMobilBuilding, hasSepedaMotorBuilding, hasSemenBetonBuilding,
  hasKayuBuilding, hasAyamUnggasBuilding, hasSapiPerahBuilding, hasSapiPotongBuilding,
  hasDombaKambingBuilding, hasPadiBuilding, hasGandumBuilding, hasJagungBuilding,
  hasUmbiBuilding, hasKedelaiBuilding, hasKelapaSawitBuilding, hasTehBuilding,
  hasKopiBuilding, hasKakaoBuilding, hasTebuBuilding, hasSayurBuilding, hasKaretBuilding,
  hasUdangBuilding, hasIkanBuilding, hasMutiaraBuilding, hasAirMineralBuilding,
  hasGulaBuilding, hasRotiBuilding, hasPengolahanDagingBuilding, hasMieInstanBuilding,
  hasMinyakGorengBuilding, hasSusuBuilding
} from "../beli/index";

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

const ALL_JUAL_KEYS = [
  "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi",
  "semikonduktor", "mobil", "sepeda_motor", "semen_beton", "kayu",
  "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
  "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
  "udang", "mutiara", "ikan",
  "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
];

const CATEGORY_MAP: Record<string, string[]> = {
  'Mineral Kritis': ["uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  'Manufaktur': ["semikonduktor", "mobil", "sepeda_motor", "semen_beton", "kayu"],
  'Peternakan': ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  'Agrikultur': ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  'Perikanan': ["udang", "mutiara", "ikan"],
  'Olahan Pangan': ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"]
};

interface JualModalsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onConfirm: (biaya: number, kuantitas: string) => void;
  currentDate?: Date;
  partners: TradePartner[];
  initialPartnerName?: string;
  prefetchedAllCountries?: any[];
}

const DEFAULT_PRICES: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, bijih_besi: 800,
  semikonduktor: 4000, mobil: 15000, sepeda_motor: 5000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160,
};

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
const getDaysInLastMonths = (endDate: Date, count: number) => {
  let total = 0;
  for (let i = 0; i < count; i++) {
    const d = new Date(endDate);
    d.setMonth(d.getMonth() - i);
    total += getDaysInMonth(d);
  }
  return total;
};
const isLeapYear = (date: Date) => (date.getFullYear() % 4 === 0 && date.getFullYear() % 100 !== 0) || (date.getFullYear() % 400 === 0);

const generateCandleData = ( endDate: Date, timeRange: string, currentPrice: number, volatility: number = 0.04, trend: number = 0.001) => {
  const MS_PER_HOUR = 3600000;
  const MS_PER_DAY = 86400000;
  let points = 0, intervalMs = MS_PER_DAY;
  switch (timeRange) {
    case '1d': points = 24; intervalMs = MS_PER_HOUR; break;
    case '1w': points = 7; intervalMs = MS_PER_DAY; break;
    case '1m': points = getDaysInMonth(endDate); intervalMs = MS_PER_DAY; break;
    case '6m': points = getDaysInLastMonths(endDate, 6); intervalMs = MS_PER_DAY; break;
    case '1y': points = isLeapYear(endDate) ? 366 : 365; intervalMs = MS_PER_DAY; break;
    default: points = 24; intervalMs = MS_PER_HOUR;
  }
  if (points <= 0) return [];
  const data = [], times: Date[] = [];
  for (let i = 0; i < points; i++) {
    if (timeRange === '1d') {
      const start = new Date(endDate); start.setHours(0, 0, 0, 0);
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
    data.push({ time: times[i], open: Math.round(open * 100) / 100, high: Math.round(high * 100) / 100, low: Math.round(low * 100) / 100, close: close });
    prevClose = close;
  }
  return data.reverse();
};

export default function JualModalsMenu({ isOpen, onClose, countryDetail, setCountryDetail, onConfirm, currentDate, partners, initialPartnerName, prefetchedAllCountries }: JualModalsMenuProps) {
  const [metadata, setMetadata] = useState<MetadataMap>({});
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [partnerData, setPartnerData] = useState<Record<string, any> | null>(null);
  const partnerStartDateRef = useRef<string | null>(null);

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(DEFAULT_PRICES);
  const [ohlcSeries, setOhlcSeries] = useState<Record<string, {time: Date; open: number; high: number; low: number; close: number}[]>>({});
  const prevDateRef = useRef<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '6m' | '1y'>('1d');

  useEffect(() => {
    if (!isOpen) return;
    setLoadingMetadata(true);
    fetchBuildingMetadata().then((data) => setMetadata(data || {})).catch(err => console.error(err)).finally(() => setLoadingMetadata(false));
  }, [isOpen]);

  useEffect(() => {
    const name = selectedCountry || partners[0]?.nama_negara;
    if (!name) { setPartnerData(null); return; }
    const matched = prefetchedAllCountries?.find(c => {
      const cName = (c.name_id || c.name_en || c.nama || c.country || '').toLowerCase().trim();
      return cName === name.toLowerCase().trim();
    });
    if (matched) {
      setPartnerData(matched);
      if (!partnerStartDateRef.current) partnerStartDateRef.current = currentDate ? formatDate(currentDate) : formatDate(new Date());
      return;
    }
    const pathEntry = (countryPaths as Record<string, string>)[name];
    if (!pathEntry) { setPartnerData(null); return; }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/country-data?path=${encodeURIComponent(pathEntry)}`);
        if (!res.ok) { setPartnerData(null); return; }
        const json = await res.json();
        setPartnerData(json || null);
        if (!partnerStartDateRef.current) partnerStartDateRef.current = currentDate ? formatDate(currentDate) : formatDate(new Date());
      } catch (e) { console.error('Failed to fetch partner country data', e); setPartnerData(null); }
    };
    fetchData();
  }, [selectedCountry, partners, currentDate, prefetchedAllCountries]);

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

  const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());

  const stockAvailable = useMemo(() => {
    if (!selectedProduct) return 0;
    const buildingCount = Number(countryDetail?.[selectedProduct]) || 0;
    if (buildingCount === 0) return 0;
    const bMeta = findMeta(selectedProduct);
    if (!bMeta || !bMeta.produksi || !currentDate) return 0;
    const buildDateKey = `build_date_${selectedProduct}`;
    const buildDateRaw = countryDetail?.[buildDateKey];
    const currentDateStr = formatDate(currentDate);
    let finalBuildDate: string;
    if (typeof buildDateRaw === 'string' && buildDateRaw) finalBuildDate = buildDateRaw;
    else { const yesterday = new Date(currentDate); yesterday.setDate(yesterday.getDate() - 1); finalBuildDate = formatDate(yesterday); }
    const baseProduction = calculateProductionIncrement(bMeta.produksi, buildingCount, finalBuildDate, currentDateStr);
    const soldCount = Number(countryDetail?.[`total_sold_${selectedProduct}`]) || 0;
    const boughtCount = Number(countryDetail?.[`total_bought_${selectedProduct}`]) || 0;
    return Math.max(0, baseProduction + boughtCount - soldCount);
  }, [selectedProduct, currentDate, countryDetail, findMeta]);

  const partnerProduction = useMemo(() => {
    if (!selectedProduct || !partnerData) return 0;
    const pBuildingCount = Number(partnerData[selectedProduct] || 0);
    if (pBuildingCount === 0) return 0;
    const pMeta = findMeta(selectedProduct);
    if (!pMeta || !pMeta.produksi || !currentDate) return 0;
    const pBuildDateKey = `build_date_${selectedProduct}`;
    const pBuildDate = partnerData[pBuildDateKey] as string | undefined;
    const currentDateStr = formatDate(currentDate);
    let pFinalBuildDate: string;
    if (typeof pBuildDate === 'string' && pBuildDate) pFinalBuildDate = pBuildDate;
    else pFinalBuildDate = partnerStartDateRef.current || formatDate(new Date(new Date(currentDate).setDate(currentDate.getDate() - 30)));
    return calculateProductionIncrement(pMeta.produksi, pBuildingCount, pFinalBuildDate, currentDateStr);
  }, [selectedProduct, currentDate, partnerData, findMeta]);

  const checkMap: Record<string, (data: Record<string, any> | null) => boolean> = {
    uranium: hasUraniumBuilding, batu_bara: hasBatubaraBuilding, minyak_bumi: hasMinyakBumiBuilding,
    gas_alam: hasGasAlamBuilding, garam: hasGaramBuilding, litium: hasLitiumBuilding,
    logam_tanah_jarang: hasLogamTanahJarangBuilding, bijih_besi: hasBijihBesiBuilding,
    semikonduktor: hasSemikonduktorBuilding, mobil: hasMobilBuilding, sepeda_motor: hasSepedaMotorBuilding,
    semen_beton: hasSemenBetonBuilding, kayu: hasKayuBuilding, ayam_unggas: hasAyamUnggasBuilding,
    sapi_perah: hasSapiPerahBuilding, sapi_potong: hasSapiPotongBuilding, domba_kambing: hasDombaKambingBuilding,
    padi: hasPadiBuilding, gandum: hasGandumBuilding, jagung: hasJagungBuilding, umbi: hasUmbiBuilding,
    kedelai: hasKedelaiBuilding, kelapa_sawit: hasKelapaSawitBuilding, teh: hasTehBuilding,
    kopi: hasKopiBuilding, kakao: hasKakaoBuilding, tebu: hasTebuBuilding, sayur: hasSayurBuilding,
    karet: hasKaretBuilding, udang: hasUdangBuilding, ikan: hasIkanBuilding, mutiara: hasMutiaraBuilding,
    air_mineral: hasAirMineralBuilding, gula: hasGulaBuilding, roti: hasRotiBuilding,
    pengolahan_daging: hasPengolahanDagingBuilding, mie_instan: hasMieInstanBuilding, minyak_goreng: hasMinyakGorengBuilding,
    susu: hasSusuBuilding,
  };

  const getFirstAvailableProduct = (): string => {
    if (!partnerData) return ALL_JUAL_KEYS[0];
    return ALL_JUAL_KEYS.find((key) => checkMap[key] ? checkMap[key](partnerData) : true) || ALL_JUAL_KEYS[0];
  };

  useEffect(() => {
    if (isOpen && selectedProduct === "") {
      const firstAvailable = getFirstAvailableProduct();
      setSelectedProduct(firstAvailable);
      if (initialPartnerName && !selectedCountry) setSelectedCountry(initialPartnerName);
      else if (partners.length > 0 && !selectedCountry) setSelectedCountry(partners[0].nama_negara);
      setQuantity(1);
    }
  }, [isOpen, partners, initialPartnerName]);

  useEffect(() => {
    if (isOpen && selectedProduct) {
      const checkFn = checkMap[selectedProduct];
      const isDisabled = checkFn ? !checkFn(partnerData) : false;
      if (isDisabled) setSelectedProduct(getFirstAvailableProduct());
    }
  }, [partnerData, selectedProduct, isOpen]);

  // --- DATA KATEGORI PRODUK (TERBARU) ---
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

  const effectiveSelectedCountry = selectedCountry || partners[0]?.nama_negara || "";
  const seriesKey = `${selectedProduct}-${timeRange}`;
  const currentPrice = useMemo(() => marketPrices[selectedProduct] || 0, [marketPrices, selectedProduct]);
  const totalPrice = currentPrice * quantity;

  useEffect(() => {
    if (!currentDate) return;
    const currentDateStr = formatDate(currentDate);
    if (prevDateRef.current === currentDateStr) return;
    setMarketPrices(prev => {
      const newPrices = { ...prev };
      for (const key of ALL_JUAL_KEYS) {
        const oldPrice = newPrices[key] || DEFAULT_PRICES[key] || 100;
        const change = (Math.random() - 0.5) * 0.05 * oldPrice;
        newPrices[key] = Math.round(Math.max(oldPrice + change, oldPrice * 0.5) * 100) / 100;
      }
      return newPrices;
    });
    prevDateRef.current = currentDateStr;
  }, [currentDate]);

  useEffect(() => {
    if (!selectedProduct || !currentDate || currentPrice <= 0) return;
    const newSeries = generateCandleData(currentDate, timeRange, currentPrice, 0.04, 0.001);
    setOhlcSeries(prev => ({ ...prev, [seriesKey]: newSeries }));
  }, [selectedProduct, timeRange, currentDate, seriesKey, currentPrice]);

  const renderCandlestickChart = () => {
    const series = ohlcSeries[seriesKey];
    if (!series || series.length < 2) return <div className="text-xs text-[#6B8A8A] text-center py-4">Tidak ada data harga</div>;
    const width = 800, height = 220, padding = { top: 10, bottom: 20, left: 50, right: 20 };
    const chartWidth = width - padding.left - padding.right, chartHeight = height - padding.top - padding.bottom;
    let minPrice = Infinity, maxPrice = -Infinity;
    series.forEach(d => { minPrice = Math.min(minPrice, d.low); maxPrice = Math.max(maxPrice, d.high); });
    const rangeBuffer = (maxPrice - minPrice) * 0.05;
    const yMin = Math.max(0, minPrice - rangeBuffer), yMax = maxPrice + rangeBuffer, priceRange = yMax - yMin || 1;
    const xScale = (index: number) => padding.left + (index / (series.length - 1)) * chartWidth;
    const yScale = (price: number) => padding.top + chartHeight - ((price - yMin) / priceRange) * chartHeight;
    const candleWidth = Math.max(3, (chartWidth / series.length) * 0.6), halfCandleWidth = candleWidth / 2;
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
            return <line key={ratio} x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(0, 255, 170, 0.1)" strokeDasharray="4 4" />;
          })}
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="rgba(0, 255, 170, 0.2)" strokeWidth="1" />
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="rgba(0, 255, 170, 0.2)" strokeWidth="1" />
          <text x={padding.left - 6} y={padding.top + 4} textAnchor="end" fontSize="9" fill="#6B8A8A">{yMax.toFixed(0)}</text>
          <text x={padding.left - 6} y={height - padding.bottom + 4} textAnchor="end" fontSize="9" fill="#6B8A8A">{yMin.toFixed(0)}</text>
          <text x={padding.left} y={height - 2} textAnchor="middle" fontSize="9" fill="#6B8A8A">{formatXLabel(0)}</text>
          <text x={width - padding.right} y={height - 2} textAnchor="middle" fontSize="9" fill="#6B8A8A">{formatXLabel(series.length - 1)}</text>
          {series.map((d, i) => {
            const x = xScale(i), yHigh = yScale(d.high), yLow = yScale(d.low);
            const yOpen = yScale(d.open), yClose = yScale(d.close);
            const isGreen = d.close >= d.open, color = isGreen ? "#00FFAA" : "#ff4d4d";
            const bodyTop = Math.min(yOpen, yClose), bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
            return (
              <g key={i}>
                <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
                <rect x={x - halfCandleWidth} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} />
              </g>
            );
          })}
          <line x1={padding.left} y1={yScale(currentPrice)} x2={width - padding.right} y2={yScale(currentPrice)} stroke="#00FFAA" strokeDasharray="4 4" strokeWidth="1.5" />
          <circle cx={width - padding.right} cy={yScale(currentPrice)} r="5" fill="#00FFAA" stroke="#0A1A1A" strokeWidth="2" />
          <text x={width - padding.right + 5} y={yScale(currentPrice) + 3} fontSize="9" fill="#00FFAA" fontWeight="bold">{currentPrice.toLocaleString("id-ID")} EM</text>
        </svg>
      </div>
    );
  };

  if (!isOpen) return null;

  const handleConfirm = () => {
    const detail = countryDetail ?? {};
    const currentBudget = typeof detail.anggaran === "number" ? detail.anggaran : 0;
    if (quantity > stockAvailable) {
      alert(`Stok Anda tidak mencukupi! Stok tersedia hanya ${stockAvailable.toLocaleString("id-ID")} unit.`);
      return;
    }
    const totalPendapatan = currentPrice * quantity;
    const soldKey = `total_sold_${selectedProduct}`;
    const currentSold = Number(detail[soldKey]) || 0;
    const accumulatedKey = `accumulated_${selectedProduct}`;
    const currentAccumulated = Number(detail[accumulatedKey] || stockAvailable);
    const newAccumulated = Math.max(0, currentAccumulated - quantity);
    setCountryDetail({ ...detail, anggaran: currentBudget + totalPendapatan, [soldKey]: currentSold + quantity, [accumulatedKey]: newAccumulated });
    onConfirm(totalPendapatan, `${quantity}x Satuan`);
    alert(`Berhasil menjual ${quantity} ${formatLabel(selectedProduct)} ke ${effectiveSelectedCountry} dengan harga ${currentPrice.toLocaleString("id-ID")} EM/unit.`);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
            <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
              <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-950/40 rounded-xl border border-rose-500/30">
                    <Send className="h-5 w-5 text-rose-400" />
                  </div>
                  <h2 className="text-lg font-bold text-[#00FFAA] tracking-tight uppercase">Jual Komoditas</h2>
                </div>
                <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pt-5 pb-2 relative z-10 space-y-4 bg-[#0F2424] no-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Produk:</label>
                    <button onClick={() => setIsProductPickerOpen(true)} className="w-full px-4 py-3 rounded-md bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-sm font-bold flex items-center justify-between hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer">
                      <span>{formatLabel(selectedProduct)}</span>
                      <span className="text-[10px] opacity-70 uppercase tracking-wider">Ubah</span>
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Negara:</label>
                    <button onClick={() => setIsCountryPickerOpen(true)} className="w-full px-4 py-3 rounded-md bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-sm font-bold flex items-center justify-between hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer">
                      <span className="flex items-center gap-2">
                        {(() => {
                          const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === effectiveSelectedCountry.toLowerCase().trim());
                          const iso = matched?.iso;
                          if (!iso || iso.length !== 2) {
                            return (
                              <div className="w-8 h-5 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 flex-shrink-0" />
                            );
                          }
                          return (
                            <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 bg-[#0F2424] relative">
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

                <div className="flex justify-between items-center pt-1 pb-1 border-b border-[#00FFAA]/10">
                  <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Stok Tersedia (Anda):</span>
                  <span className="text-sm font-black text-[#00FFAA]">{stockAvailable.toLocaleString("id-ID")} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span></span>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center pt-1 pb-0">
                    <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Bangunan {formatLabel(selectedProduct)} (Mitra):</span>
                    <span className="text-sm font-black text-[#E0E0E0]">{Number(partnerData?.[selectedProduct] || 0).toLocaleString('id-ID')} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span></span>
                  </div>
                  <div className="flex justify-between items-center pt-0 pb-1">
                    <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Produksi Mitra (Total):</span>
                    <span className="text-sm font-black text-[#E0E0E0]">{(stockAvailable > 0 ? partnerProduction : 0).toLocaleString('id-ID')} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span></span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Kuantitas:</label>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"><Minus className="h-3.5 w-3.5" /></button>
                    <input type="number" min={1} max={stockAvailable} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-16 px-2 py-1.5 text-center rounded bg-[#0A1A1A] text-[#00FFAA] text-sm font-bold border border-[#00FFAA]/30 focus:outline-none focus:border-[#00FFAA]" />
                    <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setQuantity(quantity + 1000)} className="px-2.5 py-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-[10px] font-bold hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer uppercase tracking-wide">+1k</button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#00FFAA]/20">
                  <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Harga / unit:</span>
                  <div className="flex items-center gap-1.5"><span className="text-lg font-black text-[#00FFAA]">{currentPrice.toLocaleString("id-ID")}</span><span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">EM</span></div>
                </div>
                <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-2 mt-1">
                  <span className="text-[#E0E0E0] font-bold text-sm tracking-wide">Total Pendapatan :</span>
                  <div className="flex items-center gap-1.5"><span className="text-lg font-black text-[#00FFAA]">{totalPrice.toLocaleString("id-ID")}</span><span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">EM</span></div>
                </div>

                <div className="pt-3 border-t border-[#00FFAA]/20 mt-2 w-full">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[#00FFAA] font-bold text-sm tracking-wide">Grafik Harga Historis (Candlestick)</div>
                    <div className="flex gap-1.5">
                      {[ { label: '1H', value: '1d' }, { label: '1M', value: '1w' }, { label: '1B', value: '1m' }, { label: '6B', value: '6m' }, { label: '1T', value: '1y' } ].map(({ label, value }) => (
                        <button key={value} onClick={() => setTimeRange(value as any)} className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${timeRange === value ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]' : 'bg-[#0A1A1A] text-[#6B8A8A] border-[#00FFAA]/20 hover:text-[#00FFAA]'}`}>{label}</button>
                      ))}
                    </div>
                  </div>
                  {renderCandlestickChart()}
                </div>
              </div>

              <div className="px-5 py-4 pb-8 border-t border-[#00FFAA]/20 flex gap-3 bg-[#0A1A1A] relative z-10">
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Batal</button>
                <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Jual</button>
              </div>
            </div>
        </div>
      )}

      {/* MODAL PRODUK - Kirim groupedProductItems */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Pilih Produk Komoditas"
        data={groupedProductItems} 
        selectedValue={selectedProduct}
        onSelect={(val) => setSelectedProduct(val)}
      />

      {/* MODAL NEGARA - Kirim countryItems */}
      <PilihItemModal
        isOpen={isCountryPickerOpen}
        onClose={() => setIsCountryPickerOpen(false)}
        title="Pilih Negara Mitra"
        data={countryItems}
        selectedValue={effectiveSelectedCountry}
        onSelect={(val) => setSelectedCountry(val)}
      />
    </>
  );
}