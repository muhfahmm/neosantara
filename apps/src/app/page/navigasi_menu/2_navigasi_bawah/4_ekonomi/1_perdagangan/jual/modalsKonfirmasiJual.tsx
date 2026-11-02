"use client"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Send, Plus, Minus } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate } from '@/app/logic/production_logic';
import { TradePartner } from "../mitra/mitraModalsMenu";
import { countryPaths } from '@/app/page/map_system/mapDataAssets';
import PilihItemModal from "../PilihItemModal";
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { isTradeEmbargoActive } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import {
  applyProtestantTradePrice,
  PROTESTANT_SELL_PRICE_BONUS
} from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import {
  applyKerjaSamaRegionalToMultiplier,
  isMemberOfWTO,
  getWTOSellPriceMultiplier,
  getOPECSellPriceMultiplier,
  getStrategicTradeBonusPercent,
  getKementerianPerdaganganPriceBonusPercent,
  getKementerianPerdaganganSellPriceMultiplier,
} from "@/app/page/bonus_logic";
import {
  getTradeProductNationalizationSector,
  getTradeProductStateProfitSharePercent,
  NATIONALIZATION_SECTORS,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/nationalizationLogic";
import { getMaterialStock } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import {
  applyNpcCountrySimulationState,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
  updateNpcCountrySimulationState,
} from "@/app/logic/npc_country_simulation/npcCountrySimulation";
import {
  getArmsTradeProducts,
  getArmsTransferUpdate,
  getArmsUnitCount,
} from "../armsTradeLogic";
import ArmsTradeBudgetModal from "../ArmsTradeBudgetModal";
import { isArmsSaleEmbargoActive } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/2_armsSalesEmbargoLogic";
import {
  createDailyMarketPriceFactors,
  getCandlesForAllRanges,
  getStoredPriceHistory,
  getTradeMarketPrices,
  PRICE_TIME_RANGES,
  updateTradePriceHistory,
  type PriceTimeRange,
} from "../priceHistoryLogic";
import { recordTrade } from "../tradeVolumeLedger";
import CandlestickChart from "../CandlestickChart";

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints) + " ";
};

const formatTradePrice = (price: number) => String(Math.round(price));

import {
  hasUraniumBuilding, hasBatubaraBuilding, hasMinyakBumiBuilding, hasGasAlamBuilding,
  hasGaramBuilding, hasLitiumBuilding, hasLogamTanahJarangBuilding, hasBijihBesiBuilding,
  hasSemikonduktorBuilding, hasPabrikMesinBuilding, hasPabrikBesiBuilding, hasSemenBetonBuilding,
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
  "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
  "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
  "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
  "udang", "mutiara", "ikan",
  "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
];

const CATEGORY_MAP: Record<string, string[]> = {
  'Mineral Kritis': ["uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  'Manufaktur': ["pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu"],
  'Peternakan': ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  'Agrikultur': ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  'Perikanan': ["udang", "mutiara", "ikan"],
  'Olahan Pangan': ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"]
};

const getArmsCategoryMap = (): Record<string, string[]> => {
  const products = getArmsTradeProducts();
  return {
    "Alutsista Darat": products.filter(product => product.groupId === "darat").map(product => product.dataKey),
    "Alutsista Laut": products.filter(product => product.groupId === "laut").map(product => product.dataKey),
    "Alutsista Udara": products.filter(product => product.groupId === "udara").map(product => product.dataKey),
  };
};

const isArmsProduct = (productKey: string) =>
  getArmsTradeProducts().some(product => product.dataKey === productKey);
const EMPTY_PRICE_CANDLES = Object.freeze([]);

interface JualModalsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  onConfirm: (biaya: number, kuantitas: string) => void;
  currentDate?: Date;
  partners: TradePartner[];
  initialPartnerName?: string;
  initialProductKey?: string;
  initialQuantity?: number;
  prefetchedAllCountries?: any[];
  exportTariffModifier?: number;
  canSell?: boolean;
}

export default function JualModalsMenu({
  isOpen,
  onClose,
  countryDetail,
  setCountryDetail,
  onConfirm,
  currentDate,
  partners,
  initialPartnerName,
  initialProductKey,
  initialQuantity,
  prefetchedAllCountries,
  exportTariffModifier = 0,
  canSell = true,
}: JualModalsMenuProps) {
  const [metadata, setMetadata] = useState<MetadataMap>({});
  const [loadingMetadata, setLoadingMetadata] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [armsBudgetShortfall, setArmsBudgetShortfall] = useState<{
    availableCash: number;
    requiredCash: number;
  } | null>(null);
  const [partnerData, setPartnerData] = useState<Record<string, any> | null>(null);
  const partnerStartDateRef = useRef<string | null>(null);

  useEffect(() => {
    const refreshPartnerState = () => {
      setPartnerData(current =>
        current ? applyNpcCountrySimulationState(current) : current
      );
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshPartnerState);
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshPartnerState);
  }, []);

  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  const marketPrices = useMemo(() => getTradeMarketPrices(countryDetail), [countryDetail]);
  const [timeRange, setTimeRange] = useState<PriceTimeRange>('1d');
  const simulationDateKey = currentDate
    ? currentDate.getFullYear() * 10_000 + (currentDate.getMonth() + 1) * 100 + currentDate.getDate()
    : null;
  const simulationDate = useMemo(() => {
    if (simulationDateKey === null) return null;
    const year = Math.floor(simulationDateKey / 10_000);
    const month = Math.floor(simulationDateKey / 100) % 100;
    const day = simulationDateKey % 100;
    return new Date(year, month - 1, day);
  }, [simulationDateKey]);

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
      setPartnerData(applyNpcCountrySimulationState(matched));
      if (!partnerStartDateRef.current) partnerStartDateRef.current = simulationDate ? formatDate(simulationDate) : formatDate(new Date());
      return;
    }
    const pathEntry = (countryPaths as Record<string, string>)[name];
    if (!pathEntry) { setPartnerData(null); return; }
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/country-data?path=${encodeURIComponent(pathEntry)}`);
        if (!res.ok) { setPartnerData(null); return; }
        const json = applyNpcCountrySimulationState(await res.json());
        setPartnerData(json || null);
        if (!partnerStartDateRef.current) partnerStartDateRef.current = simulationDate ? formatDate(simulationDate) : formatDate(new Date());
      } catch (e) { console.error('Failed to fetch partner country data', e); setPartnerData(null); }
    };
    fetchData();
  }, [selectedCountry, partners, simulationDate, prefetchedAllCountries]);

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
    if (isArmsProduct(selectedProduct)) {
      return getArmsUnitCount(countryDetail || {}, getArmsTradeProducts().find(product => product.dataKey === selectedProduct)!);
    }
    return getMaterialStock(countryDetail, selectedProduct);
  }, [selectedProduct, countryDetail]);

  const partnerProduction = useMemo(() => {
    if (!selectedProduct || !partnerData) return 0;
    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === selectedProduct);
    if (armsProduct) return getArmsUnitCount(partnerData, armsProduct);
    const pBuildingCount = Number(partnerData[selectedProduct] || 0);
    if (pBuildingCount === 0) return 0;
    const pMeta = findMeta(selectedProduct);
    if (!pMeta || !pMeta.produksi || !simulationDate) return 0;
    const pBuildDateKey = `build_date_${selectedProduct}`;
    const pBuildDate = partnerData[pBuildDateKey] as string | undefined;
    const currentDateStr = formatDate(simulationDate);
    let pFinalBuildDate: string;
    if (typeof pBuildDate === 'string' && pBuildDate) pFinalBuildDate = pBuildDate;
    else pFinalBuildDate = partnerStartDateRef.current || formatDate(new Date(new Date(simulationDate).setDate(simulationDate.getDate() - 30)));
    return calculateProductionIncrement(pMeta.produksi, pBuildingCount, pFinalBuildDate, currentDateStr);
  }, [selectedProduct, simulationDate, partnerData, findMeta]);

  const checkMap: Record<string, (data: Record<string, any> | null) => boolean> = {
    uranium: hasUraniumBuilding, batu_bara: hasBatubaraBuilding, minyak_bumi: hasMinyakBumiBuilding,
    gas_alam: hasGasAlamBuilding, garam: hasGaramBuilding, litium: hasLitiumBuilding,
    logam_tanah_jarang: hasLogamTanahJarangBuilding, bijih_besi: hasBijihBesiBuilding,
    pabrik_semikonduktor: hasSemikonduktorBuilding, pabrik_mesin: hasPabrikMesinBuilding,
    pabrik_besi: hasPabrikBesiBuilding,
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
      const initialArmsProduct = initialProductKey
        ? getArmsTradeProducts().find(product => product.dataKey === initialProductKey)
        : undefined;
      const firstAvailable = initialArmsProduct && getArmsUnitCount(countryDetail || {}, initialArmsProduct) > 0
        ? initialArmsProduct.dataKey
        : getFirstAvailableProduct();
      setSelectedProduct(firstAvailable);
      if (initialPartnerName && !selectedCountry) setSelectedCountry(initialPartnerName);
      else if (partners.length > 0 && !selectedCountry) setSelectedCountry(partners[0].nama_negara);
      setQuantity(
        typeof initialQuantity === "number" &&
          Number.isInteger(initialQuantity) &&
          initialQuantity > 0
          ? initialQuantity
          : 1,
      );
    }
  }, [isOpen, partners, initialPartnerName, initialProductKey, initialQuantity, countryDetail]);

  useEffect(() => {
    if (isOpen && selectedProduct) {
      const checkFn = checkMap[selectedProduct];
      const isDisabled = checkFn ? !checkFn(partnerData) : false;
      if (isDisabled) setSelectedProduct(getFirstAvailableProduct());
    }
  }, [partnerData, selectedProduct, isOpen]);

  // --- DATA KATEGORI PRODUK (TERBARU) ---
  const groupedProductItems = useMemo(() => {
    const commodityGroups = Object.entries(CATEGORY_MAP).map(([category, keys]) => ({
      category,
      items: keys.map(key => ({
        label: formatLabel(key),
        value: key,
        disabled: checkMap[key] ? !checkMap[key](partnerData) : false
      }))
    }));
    const armsGroups = Object.entries(getArmsCategoryMap()).map(([category, keys]) => ({
      category,
      items: keys.map(key => {
        const product = getArmsTradeProducts().find(item => item.dataKey === key)!;
        return {
          label: product.label,
          value: key,
          disabled: getArmsUnitCount(countryDetail || {}, product) <= 0,
        };
      }),
    }));
    return [...commodityGroups, ...armsGroups];
  }, [partnerData, countryDetail]);

  const countryItems = useMemo(() => {
    return partners.map(p => ({
      label: p.nama_negara,
      value: p.nama_negara,
      disabled: false
    }));
  }, [partners]);

  const effectiveSelectedCountry = selectedCountry || partners[0]?.nama_negara || "";
  const currentPrice = useMemo(() => {
    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === selectedProduct);
    return armsProduct
      ? Math.round(armsProduct.unitPrice * 0.85)
      : Math.round(marketPrices[selectedProduct] || 0);
  }, [marketPrices, selectedProduct]);
  const userCountryName = countryDetail?.country || countryDetail?.nama || "";
  const isWTOActive = isMemberOfWTO(userCountryName);
  const wtoSellMultiplier = applyKerjaSamaRegionalToMultiplier(
    getWTOSellPriceMultiplier(userCountryName),
    countryDetail
  );
  
  const opecSellMultiplier = applyKerjaSamaRegionalToMultiplier(
    getOPECSellPriceMultiplier(userCountryName, selectedProduct),
    countryDetail
  );
  const isOPECActive = opecSellMultiplier > 1;

  const protestantPrice = applyProtestantTradePrice(currentPrice, countryDetail?.religion, "sell");
  const hasProtestantBonus = protestantPrice > currentPrice;
  const protestantMultiplier = hasProtestantBonus ? (1 + PROTESTANT_SELL_PRICE_BONUS) : 1.0;

  const strategicTradeBonusPercent = getStrategicTradeBonusPercent(countryDetail);
  const strategicSellBonus = strategicTradeBonusPercent > 0 ? (strategicTradeBonusPercent / 100) : 0;
  
  const ministrySellMultiplier = getKementerianPerdaganganSellPriceMultiplier(countryDetail);
  const combinedSellMultiplier = (wtoSellMultiplier - 1) + (protestantMultiplier - 1) + (opecSellMultiplier - 1) + strategicSellBonus + (ministrySellMultiplier - 1);
  const priceBeforeExportTariff = Math.round(currentPrice * (1 + combinedSellMultiplier));
  const exportTariffRate = Math.min(1, Math.max(0, exportTariffModifier));
  const grossTotalPrice = priceBeforeExportTariff * quantity;
  const exportTariffCost = Math.round(grossTotalPrice * exportTariffRate);
  const totalPrice = grossTotalPrice - exportTariffCost;
  const pricePerUnit = Math.round(totalPrice / Math.max(1, quantity));
  const hasTradeBonus = combinedSellMultiplier > 0;
  const nationalizationSector = getTradeProductNationalizationSector(selectedProduct);
  const stateProfitSharePercent = getTradeProductStateProfitSharePercent(countryDetail, selectedProduct);
  const stateProfitIncome = Math.round(totalPrice * stateProfitSharePercent / 100);
  const nationalizationSectorName = NATIONALIZATION_SECTORS.find(
    (sector) => sector.id === nationalizationSector
  )?.name;

  const playerCountryName = String(countryDetail?.country || countryDetail?.nama || '');
  const selectedChartArmsProduct = useMemo(
    () => getArmsTradeProducts().find(product => product.dataKey === selectedProduct),
    [selectedProduct],
  );
  const chartCurrentPrice = selectedChartArmsProduct
    ? selectedChartArmsProduct.unitPrice
    : marketPrices[selectedProduct] || 0;

  useEffect(() => {
    if (!countryDetail || !simulationDate) return;
    const randomFactors = createDailyMarketPriceFactors(simulationDate);
    setCountryDetail((previous: Record<string, unknown>) => updateTradePriceHistory(previous, {
      country: String(previous.country || previous.nama || ''),
      commodity: selectedProduct,
      currentDate: simulationDate,
      randomFactors,
      ...(selectedChartArmsProduct ? { currentPrice: chartCurrentPrice } : {}),
    }));
  }, [countryDetail, simulationDate, selectedProduct, chartCurrentPrice, selectedChartArmsProduct, setCountryDetail]);

  const effectiveDetail = useMemo(() => {
    if (!countryDetail || !simulationDate) return countryDetail;
    const randomFactors = createDailyMarketPriceFactors(simulationDate);
    return updateTradePriceHistory(countryDetail, {
      country: playerCountryName,
      commodity: selectedProduct,
      currentDate: simulationDate,
      randomFactors,
      ...(selectedChartArmsProduct ? { currentPrice: chartCurrentPrice } : {}),
    });
  }, [countryDetail, simulationDate, playerCountryName, selectedProduct, chartCurrentPrice, selectedChartArmsProduct]);

  const hourlyCandles = getStoredPriceHistory(
    effectiveDetail,
    playerCountryName,
    selectedProduct,
  )?.candles || EMPTY_PRICE_CANDLES;
  const ohlcSeriesByRange = useMemo(
    () => simulationDate ? getCandlesForAllRanges(hourlyCandles, simulationDate) : null,
    [simulationDate, hourlyCandles],
  );
  const ohlcSeries = ohlcSeriesByRange?.[timeRange] || [];

  if (!isOpen) return null;

  const handleConfirm = () => {
    const tradeDate = currentDate || new Date();
    if (!canSell) {
      alert("Akses jual komoditas diblokir karena skor sentralisasi negara Anda mencapai 85 atau lebih.");
      return;
    }
    const detail = countryDetail ?? {};
    const currentBudget = typeof detail.anggaran === "number" ? detail.anggaran : 0;
    const ownCountryName = String(detail.country || detail.nama || '');
    if (isTradeEmbargoActive(ownCountryName, effectiveSelectedCountry)) {
      alert(`Perdagangan dengan ${effectiveSelectedCountry} diblokir oleh embargo ekonomi PBB yang sedang berlaku.`);
      return;
    }

    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === selectedProduct);
    if (armsProduct) {
      if (isArmsSaleEmbargoActive(ownCountryName, effectiveSelectedCountry)) {
        alert(`Resolusi PBB melarang penjualan alutsista kepada ${effectiveSelectedCountry}.`);
        return;
      }
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > stockAvailable) {
        alert(`Stok alutsista Anda tidak mencukupi. Tersedia ${stockAvailable.toLocaleString("id-ID")} unit.`);
        return;
      }
      if (!partnerData) {
        alert("Data negara mitra belum tersedia untuk menyelesaikan transaksi alutsista.");
        return;
      }
      const partnerSlug = String(partnerData?.country_slug || "").trim().toLowerCase();
      if (!partnerSlug) {
        alert("Data negara mitra belum tersedia untuk menyelesaikan transaksi alutsista.");
        return;
      }
      const livePartner = applyNpcCountrySimulationState(partnerData);
      const partnerBudget = Math.max(0, Number(livePartner.anggaran) || 0);
      const transactionTotal = pricePerUnit * quantity;
      if (partnerBudget < transactionTotal) {
        setArmsBudgetShortfall({
          availableCash: partnerBudget,
          requiredCash: transactionTotal,
        });
        return;
      }
      if (!updateNpcCountrySimulationState(partnerSlug, {
        ...getArmsTransferUpdate(livePartner, armsProduct, quantity),
        anggaran: partnerBudget - transactionTotal,
      })) {
        alert("Simulasi negara mitra belum siap. Coba lagi setelah data negara selesai dimuat.");
        return;
      }
      setCountryDetail(recordTrade({
        ...detail,
        ...getArmsTransferUpdate(detail, armsProduct, -quantity),
        anggaran: currentBudget + transactionTotal,
      }, {
        commodity: selectedProduct,
        quantity,
        side: 'sell',
        day: Math.floor(Date.UTC(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate()) / 86_400_000),
        hour: tradeDate.getUTCHours(),
        counterparty: effectiveSelectedCountry,
      }));
      onConfirm(transactionTotal, `${quantity} unit`);
      alert(`Berhasil menjual ${quantity} unit ${armsProduct.label} kepada ${effectiveSelectedCountry}.`);
      onClose();
      return;
    }

    if (quantity > stockAvailable) {
      alert(`Stok Anda tidak mencukupi! Stok tersedia hanya ${stockAvailable.toLocaleString("id-ID", { maximumFractionDigits: 2 })} unit.`);
      return;
    }
    const totalPendapatan = Math.round(pricePerUnit * quantity * stateProfitSharePercent / 100);
    const soldKey = `total_sold_${selectedProduct}`;
    const currentSold = Number(detail[soldKey]) || 0;
    const inventoryKey = `inventory_${selectedProduct}`;
    const currentInventory = getMaterialStock(detail, selectedProduct);
    const newInventory = Math.max(0, currentInventory - quantity);
    const accumulatedKey = `accumulated_${selectedProduct}`;
    setCountryDetail(recordTrade({
      ...detail,
      anggaran: currentBudget + totalPendapatan,
      [soldKey]: currentSold + quantity,
      [inventoryKey]: newInventory,
      [accumulatedKey]: newInventory,
    }, {
      commodity: selectedProduct,
      quantity,
      side: 'sell',
      day: Math.floor(Date.UTC(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate()) / 86_400_000),
      hour: tradeDate.getUTCHours(),
      counterparty: effectiveSelectedCountry,
    }));
    onConfirm(totalPendapatan, `${quantity}x Satuan`);
    alert(`Berhasil menjual ${quantity} ${formatLabel(selectedProduct)} ke ${effectiveSelectedCountry}. Bagian APBN (${stateProfitSharePercent}%) sebesar ${formatTradePrice(totalPendapatan)} NEO telah ditambahkan.`);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <NotebookModalWrapper onClose={onClose} zIndexClass="z-[70]">
          <div className="flex h-full min-w-0 flex-col overflow-hidden">
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-rose-500/30 shrink-0">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />
                </div>
                <h2 className={rootModalTypography.title}>Jual Komoditas</h2>
              </div>
              <RootModalCloseButton onClick={onClose} />
            </div>

            <div className="root-no-scrollbar-glow min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-2 relative z-10 space-y-4 bg-[#0F2424] neon-scrollbar [overflow-anchor:none]">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Produk:</label>
                  <button onClick={() => setIsProductPickerOpen(true)} className="w-full px-4 py-3 rounded-md bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-sm font-bold flex items-center justify-between hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer">
                    <span>{getArmsTradeProducts().find(product => product.dataKey === selectedProduct)?.label || formatLabel(selectedProduct)}</span>
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

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center pt-1 pb-0">
                  <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">{isArmsProduct(selectedProduct) ? "Unit Alutsista Mitra:" : `Bangunan ${formatLabel(selectedProduct)} (Mitra):`}</span>
                  <span className="text-sm font-black text-[#E0E0E0]">{(isArmsProduct(selectedProduct)
                    ? getArmsUnitCount(partnerData || {}, getArmsTradeProducts().find(product => product.dataKey === selectedProduct)!)
                    : Number(partnerData?.[selectedProduct] || 0)
                  ).toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span></span>
                </div>
                {!isArmsProduct(selectedProduct) && (
                  <div className="flex justify-between items-center pt-0 pb-1">
                    <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Produksi Mitra (Total):</span>
                    <span className="text-sm font-black text-[#E0E0E0]">{(stockAvailable > 0 ? partnerProduction : 0).toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span></span>
                  </div>
                )}
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
                <div className="flex items-center gap-1.5">
                  {hasTradeBonus && (
                    <span className="text-sm font-bold text-rose-400 line-through opacity-80">
                      {formatTradePrice(currentPrice)}
                    </span>
                  )}
                  <span className="text-lg font-black text-[#00FFAA]">{formatTradePrice(pricePerUnit)}</span>
                  <span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">NEO</span>
                </div>
              </div>
              {hasTradeBonus && (
                <div className="flex justify-end gap-1.5 flex-wrap">
                  {hasProtestantBonus && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                      Bonus Agama Protestan: +{PROTESTANT_SELL_PRICE_BONUS * 100}%
                    </span>
                  )}
                  {isWTOActive && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                      Bonus Organisasi WTO: +{Math.round((wtoSellMultiplier - 1) * 100)}%
                    </span>
                  )}
                  {isOPECActive && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                      Bonus Organisasi OPEC: +{Math.round((opecSellMultiplier - 1) * 100)}%
                    </span>
                  )}
                  {strategicTradeBonusPercent > 0 && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                      Bonus Riset Diplomasi Dagang: +{strategicTradeBonusPercent}%
                    </span>
                  )}
                  {getKementerianPerdaganganPriceBonusPercent(countryDetail) > 0 && (
                    <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                      Bonus Kementerian Perdagangan: +{getKementerianPerdaganganPriceBonusPercent(countryDetail)}%
                    </span>
                  )}
                </div>
              )}
              {exportTariffCost > 0 && (
                <div className="flex justify-between items-center text-xs text-amber-300">
                  <span>Tarif ekspor tambahan ({Math.round(exportTariffRate * 100)}%)</span>
                  <span>-{formatTradePrice(exportTariffCost)} NEO</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-2 mt-1">
                <span className="text-[#E0E0E0] font-bold text-sm tracking-wide">Nilai setelah tarif ekspor :</span>
                <div className="flex items-center gap-1.5"><span className="text-lg font-black text-[#00FFAA]">{formatTradePrice(totalPrice)}</span><span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">NEO</span></div>
              </div>
              {nationalizationSectorName && (
                <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-[#6B8A8A]">{nationalizationSectorName} · bagian negara {stateProfitSharePercent}%</span>
                    <strong className="text-emerald-400">{formatTradePrice(stateProfitIncome)} NEO ke APBN</strong>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-[#00FFAA]/20 mt-2 w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[#00FFAA] font-bold text-sm tracking-wide">Grafik Harga Historis (Candlestick)</div>
                  <div className="flex gap-1.5">
                    {PRICE_TIME_RANGES.map(({ label, value }) => (
                      <button key={value} onClick={() => setTimeRange(value)} className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${timeRange === value ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]' : 'bg-[#0A1A1A] text-[#6B8A8A] border-[#00FFAA]/20 hover:text-[#00FFAA]'}`}>{label}</button>
                    ))}
                  </div>
                </div>
                <CandlestickChart series={ohlcSeries} timeRange={timeRange} currentPrice={chartCurrentPrice} />
              </div>
            </div>

            <div className="px-5 py-4 pb-8 border-t border-[#00FFAA]/20 flex gap-3 bg-[#0A1A1A] relative z-10">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Batal</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Jual</button>
            </div>
          </div>
        </NotebookModalWrapper>
      )}

      {/* MODAL PRODUK - Kirim groupedProductItems */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Pilih Komoditas atau Alutsista"
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
      {armsBudgetShortfall && (
        <ArmsTradeBudgetModal
          availableCash={armsBudgetShortfall.availableCash}
          requiredCash={armsBudgetShortfall.requiredCash}
          onClose={() => setArmsBudgetShortfall(null)}
        />
      )}
    </>
  );
}