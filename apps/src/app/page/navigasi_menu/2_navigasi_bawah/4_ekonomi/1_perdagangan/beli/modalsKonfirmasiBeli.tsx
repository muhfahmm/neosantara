// beli/beliModalsKonfirmasiBeli.tsx

"use client"
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Plus, Minus, ShoppingCart } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { TradePartner } from "../mitra/mitraModalsMenu";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate, normalizePartnerBuildDates } from '@/app/logic/production_logic';
import { countryPaths } from '@/app/page/map_system/mapDataAssets';
import { COUNTRIES_DATA } from "@/app/page/map_system/map-data";
import { isTradeEmbargoActive } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import {
  applyProtestantTradePrice,
  PROTESTANT_BUY_PRICE_DISCOUNT
} from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import {
  applyKerjaSamaRegionalToMultiplier,
  isMemberOfWTO,
  getWTOBuyPriceMultiplier,
  getOPECBuyPriceMultiplier,
  getStrategicTradeBonusPercent,
  getKementerianPerdaganganPriceBonusPercent,
  getKementerianPerdaganganBuyPriceMultiplier,
} from "@/app/page/bonus_logic";
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
} from "../umum/armsTradeLogic";
import { isArmsSaleEmbargoActive } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/2_armsSalesEmbargoLogic";
import {
  createDailyMarketPriceFactors,
  getCandlesForAllRanges,
  getStoredPriceHistory,
  getTradeMarketPrices,
  PRICE_TIME_RANGES,
  updateTradePriceHistory,
  type PriceTimeRange,
} from "../umum/priceHistoryLogic";
import { recordTrade } from "../umum/tradeVolumeLedger";
import CandlestickChart from "../umum/CandlestickChart";

const getFlagEmoji = (countryName: string) => {
  const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
  if (!matched || !matched.iso) return "";
  const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints) + " ";
};

const formatTradePrice = (price: number) => String(Math.round(price));
const EMPTY_PRICE_CANDLES = Object.freeze([]);

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
  hasPabrikMesinBuilding,
  hasPabrikBesiBuilding,
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
import PilihItemModal from "../umum/PilihItemModal";

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
  "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
  "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
  "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
  "udang", "mutiara", "ikan",
  "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
];

// --- DEFINISI KATEGORI UNTUK PRODUK BELI ---
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
  initialQuantity?: number;
  prefetchedAllCountries?: any[];
  partnerOffers?: any[];
  importTariffModifier?: number;
  canBuy?: boolean;
}

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
  initialQuantity,
  prefetchedAllCountries,
  partnerOffers = [],
  importTariffModifier = 0,
  canBuy = true,
}: ModalsKonfirmasiBeliProps) {
  const [metadata, setMetadata] = useState<MetadataMap>({});
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [partnerOfferPriceOverrides, setPartnerOfferPriceOverrides] = useState<Record<string, number>>({});

  const [partnerDataRaw, setPartnerDataRaw] = useState<Record<string, any> | null>(null);
  const partnerStartDateRef = useRef<string | null>(null);

  useEffect(() => {
    const refreshPartnerState = () => {
      setPartnerDataRaw(current =>
        current ? applyNpcCountrySimulationState(current) : current
      );
    };
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshPartnerState);
    return () => window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshPartnerState);
  }, []);
  const lastCountryRef = useRef<string>("");
  const isInitialized = useRef(false);

  // --- STATE UNTUK MODAL PICKER BARU ---
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);

  // --- STATE UNTUK MARKET PRICES, CHART, TIME RANGE ---
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
        partnerStartDateRef.current = simulationDate ? formatDate(simulationDate) : formatDate(new Date());
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
        const json = applyNpcCountrySimulationState(await res.json());
        setPartnerDataRaw(json || null);
        if (!partnerStartDateRef.current) {
          partnerStartDateRef.current = simulationDate ? formatDate(simulationDate) : formatDate(new Date());
        }
      } catch (e) {
        console.error('Failed to fetch partner country data', e);
        setPartnerDataRaw(null);
      }
    };

    fetchData();
  }, [isOpen, targetCountry, simulationDate, prefetchedAllCountries]);

  // Initialize game_start_date in countryDetail if not present to have a persistent simulation start date
  useEffect(() => {
    if (isOpen && countryDetail && !countryDetail.game_start_date && simulationDate) {
      setCountryDetail(prev => {
        if (!prev) return prev;
        if (prev.game_start_date) return prev;
        return {
          ...prev,
          game_start_date: formatDate(simulationDate)
        };
      });
    }
  }, [isOpen, countryDetail, simulationDate, setCountryDetail]);

  const partnerData = useMemo(() => {
    if (!partnerDataRaw) return null;
    const gameStartDate = (countryDetail?.game_start_date as string) || (simulationDate ? formatDate(simulationDate) : formatDate(new Date()));
    return normalizePartnerBuildDates(partnerDataRaw, ALL_IMPORT_KEYS, new Date(gameStartDate));
  }, [partnerDataRaw, countryDetail?.game_start_date, simulationDate]);

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
    pabrik_semikonduktor: hasSemikonduktorBuilding,
    pabrik_mesin: hasPabrikMesinBuilding,
    pabrik_besi: hasPabrikBesiBuilding,
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
    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === key);
    if (armsProduct) return getArmsUnitCount(partnerData, armsProduct) > 0;
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
          disabled: getArmsUnitCount(partnerData || {}, product) <= 0,
        };
      }),
    }));
    return [...commodityGroups, ...armsGroups];
  }, [partnerData]);

  const countryItems = useMemo(() => {
    return partners.map(p => ({
      label: p.nama_negara,
      value: p.nama_negara,
      disabled: false
    }));
  }, [partners]);

  const effectiveSelectedProduct = selectedProduct || (partnerData ? getFirstAvailableProduct() : "");
  const selectedChartArmsProduct = useMemo(
    () => getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct),
    [effectiveSelectedProduct],
  );
  const chartCurrentPrice = selectedChartArmsProduct
    ? selectedChartArmsProduct.unitPrice
    : marketPrices[effectiveSelectedProduct] || 0;

  useEffect(() => {
    if (!countryDetail || !simulationDate) return;
    const randomFactors = createDailyMarketPriceFactors(simulationDate);
    setCountryDetail(previous => updateTradePriceHistory(previous, {
      country: String(previous.country || previous.nama || ''),
      commodity: effectiveSelectedProduct,
      currentDate: simulationDate,
      randomFactors,
      ...(selectedChartArmsProduct ? { currentPrice: chartCurrentPrice } : {}),
    }));
  }, [countryDetail, simulationDate, effectiveSelectedProduct, chartCurrentPrice, selectedChartArmsProduct, setCountryDetail]);
  const effectiveSelectedCountry = selectedCountry || partners[0]?.nama_negara || "";

  const stockAvailable = useMemo(() => {
    if (!effectiveSelectedProduct) return 0;
    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct);
    if (armsProduct) return getArmsUnitCount(countryDetail || {}, armsProduct);
    return getMaterialStock(countryDetail, effectiveSelectedProduct);
  }, [effectiveSelectedProduct, countryDetail]);

  const partnerProduction = useMemo(() => {
    if (!effectiveSelectedProduct || !partnerData) return 0;
    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct);
    if (armsProduct) return getArmsUnitCount(partnerData, armsProduct);
    const pBuildingCount = Number(partnerData[effectiveSelectedProduct] || 0);
    if (pBuildingCount === 0) return 0;

    const pMeta = findMeta(effectiveSelectedProduct);
    if (!pMeta || !pMeta.produksi || !simulationDate) return 0;

    const pBuildDateKey = `build_date_${effectiveSelectedProduct}`;
    const pBuildDate = partnerData[pBuildDateKey] as string | undefined;
    const currentDateStr = formatDate(simulationDate);
    let pFinalBuildDate: string;
    if (typeof pBuildDate === 'string' && pBuildDate) {
      pFinalBuildDate = pBuildDate;
    } else {
      const thirtyDaysAgo = new Date(simulationDate);
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
  }, [effectiveSelectedProduct, simulationDate, partnerData, findMeta, countryDetail, targetCountry]);

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

    let initialQty = typeof initialQuantity === "number" &&
      Number.isInteger(initialQuantity) &&
      initialQuantity > 0
      ? initialQuantity
      : 1;
    if (initialPartnerName && targetProduct && partnerOffers.length > 0) {
      const matchedOffer = partnerOffers.find(
        o => o.partnerName.toLowerCase().trim() === initialPartnerName.toLowerCase().trim() &&
          o.productKey === targetProduct
      );
      if (matchedOffer) {
        if (initialQuantity === undefined) initialQty = matchedOffer.quantity;
        // Dan set harga pasar untuk produk ini agar sesuai dengan tawaran
        setPartnerOfferPriceOverrides(previous => ({
          ...previous,
          [targetProduct]: matchedOffer.pricePerUnit,
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

    const currentDateStr = formatDate(simulationDate || new Date());
    setCountryDetail((prev) => {
      if (!prev) return prev;
      if (Number(prev[selectedProduct] || 0) <= 0) return prev;
      if (typeof prev[buildDateKey] === 'string' && prev[buildDateKey]) return prev;
      return {
        ...prev,
        [buildDateKey]: currentDateStr,
      };
    });
  }, [isOpen, selectedProduct, countryDetail, simulationDate, setCountryDetail]);

  const playerCountryName = String(countryDetail?.country || countryDetail?.nama || '');
  const effectiveDetail = useMemo(() => {
    if (!countryDetail || !simulationDate) return countryDetail;
    const randomFactors = createDailyMarketPriceFactors(simulationDate);
    return updateTradePriceHistory(countryDetail, {
      country: playerCountryName,
      commodity: effectiveSelectedProduct,
      currentDate: simulationDate,
      randomFactors,
      ...(selectedChartArmsProduct ? { currentPrice: chartCurrentPrice } : {}),
    });
  }, [countryDetail, simulationDate, playerCountryName, effectiveSelectedProduct, chartCurrentPrice, selectedChartArmsProduct]);

  const hourlyCandles = getStoredPriceHistory(
    effectiveDetail,
    playerCountryName,
    effectiveSelectedProduct,
  )?.candles || EMPTY_PRICE_CANDLES;
  const ohlcSeriesByRange = useMemo(
    () => simulationDate ? getCandlesForAllRanges(hourlyCandles, simulationDate) : null,
    [simulationDate, hourlyCandles],
  );
  const ohlcSeries = ohlcSeriesByRange?.[timeRange] || [];

  if (!isOpen) return null;

  const currentMeta = findMeta(effectiveSelectedProduct);

  // HARGA DINAMIS PASAR
  const selectedArmsProduct = getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct);
  const currentPrice = selectedArmsProduct
    ? Math.round(selectedArmsProduct.unitPrice * 1.15)
    : marketPrices[effectiveSelectedProduct] || 0;
  const partnerOfferPrice = partnerOfferPriceOverrides[effectiveSelectedProduct];
  // FAKTOR BELI (MISAL 2x HARGA PASAR)
  const BUY_FACTOR = 2;
  const originalPricePerUnit = selectedArmsProduct
    ? currentPrice
    : Math.round((partnerOfferPrice || currentPrice) * BUY_FACTOR);
  
  const userCountryName = String(countryDetail?.country || countryDetail?.nama || "");
  const isWTOActive = isMemberOfWTO(userCountryName);
  const wtoBuyMultiplier = applyKerjaSamaRegionalToMultiplier(
    getWTOBuyPriceMultiplier(userCountryName),
    countryDetail
  );

  const opecBuyMultiplier = applyKerjaSamaRegionalToMultiplier(
    getOPECBuyPriceMultiplier(userCountryName, effectiveSelectedProduct),
    countryDetail
  );
  const isOPECActive = opecBuyMultiplier < 1;
  
  const protestantPrice = applyProtestantTradePrice(originalPricePerUnit, countryDetail?.religion, "buy");
  const hasProtestantDiscount = protestantPrice < originalPricePerUnit;
  const protestantMultiplier = hasProtestantDiscount ? (1 - PROTESTANT_BUY_PRICE_DISCOUNT) : 1.0;

  const strategicTradeBonusPercent = getStrategicTradeBonusPercent(countryDetail);
  const strategicBuyMultiplier = strategicTradeBonusPercent > 0 ? (1 - strategicTradeBonusPercent / 100) : 1.0;
  
  // Combine discount factors (additive deduction: -10% + -5% + -20% = -35%)
  const ministryBuyMultiplier = getKementerianPerdaganganBuyPriceMultiplier(countryDetail);
  const totalDiscountFraction = (1 - wtoBuyMultiplier) + (1 - protestantMultiplier) + (1 - opecBuyMultiplier) + (1 - strategicBuyMultiplier) + (1 - ministryBuyMultiplier);
  const combinedBuyMultiplier = Math.max(0.1, 1 - totalDiscountFraction);
  const basePricePerUnit = Math.round(originalPricePerUnit * combinedBuyMultiplier);
  const baseTotalPrice = basePricePerUnit * quantity;
  const importTariffCost = Math.round(baseTotalPrice * Math.max(0, importTariffModifier));
  const totalPrice = baseTotalPrice + importTariffCost;
  const pricePerUnit = Math.round(totalPrice / Math.max(1, quantity));
  const hasTradeDiscount = totalDiscountFraction > 0;

  const handleConfirm = () => {
    const tradeDate = currentDate || new Date();
    if (!canBuy) {
      alert("Negara Anda di bawah sanksi ekonomi terbatas. Impor komoditas tidak tersedia.");
      return;
    }
    const detail = countryDetail ?? {};
    const currentBudget = typeof detail.anggaran === "number" ? detail.anggaran : 0;
    const ownCountryName = String(detail.country || detail.nama || '');
    if (isTradeEmbargoActive(ownCountryName, targetCountry)) {
      alert(`Perdagangan dengan ${targetCountry} diblokir oleh embargo ekonomi PBB yang sedang berlaku.`);
      return;
    }

    const armsProduct = getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct);
    if (armsProduct) {
      if (isArmsSaleEmbargoActive(targetCountry, ownCountryName)) {
        alert(`Resolusi PBB melarang penjualan alutsista kepada ${ownCountryName}.`);
        return;
      }
      if (!Number.isInteger(quantity) || quantity <= 0 || quantity > partnerProduction) {
        alert(`Stok alutsista mitra tidak mencukupi. Tersedia ${partnerProduction.toLocaleString("id-ID")} unit.`);
        return;
      }
      if (currentBudget < totalPrice) {
        alert(`Kas negara tidak mencukupi. Dibutuhkan ${formatTradePrice(totalPrice)} NEO.`);
        return;
      }
      const partnerSlug = String(partnerData?.country_slug || "").trim().toLowerCase();
      if (!partnerSlug) {
        alert("Data negara mitra belum tersedia untuk menyelesaikan transaksi alutsista.");
        return;
      }
      const livePartner = applyNpcCountrySimulationState(partnerData || {});
      const partnerBudget = Math.max(0, Number(livePartner.anggaran) || 0);
      if (getArmsUnitCount(livePartner, armsProduct) < quantity) {
        alert("Stok alutsista mitra sudah berubah dan tidak lagi mencukupi.");
        return;
      }
      if (!updateNpcCountrySimulationState(partnerSlug, {
        ...getArmsTransferUpdate(livePartner, armsProduct, -quantity),
        anggaran: partnerBudget + totalPrice,
      })) {
        alert("Simulasi negara mitra belum siap. Coba lagi setelah data negara selesai dimuat.");
        return;
      }
      setCountryDetail(recordTrade({
        ...detail,
        ...getArmsTransferUpdate(detail, armsProduct, quantity),
        anggaran: currentBudget - totalPrice,
      }, {
        commodity: effectiveSelectedProduct,
        quantity,
        side: 'buy',
        day: Math.floor(Date.UTC(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate()) / 86_400_000),
        hour: tradeDate.getUTCHours(),
        counterparty: targetCountry,
      }));
      onConfirm(totalPrice, `${quantity} unit`);
      alert(`Berhasil membeli ${quantity} unit ${armsProduct.label} dari ${targetCountry}.`);
      onClose();
      return;
    }

    // Cek apakah ini transaksi dari tawaran AI yang valid
    const matchedOffer = partnerOffers?.find(
      o => o.partnerName.toLowerCase().trim() === targetCountry.toLowerCase().trim() &&
        o.productKey === effectiveSelectedProduct &&
        o.quantity === quantity
    );

    if (!matchedOffer && quantity > partnerProduction) {
      alert(`Stok mitra tidak mencukupi! Stok tersedia hanya ${partnerProduction.toLocaleString("id-ID", { maximumFractionDigits: 2 })} unit.`);
      return;
    }

    if (currentBudget < totalPrice) {
      alert(`Kas Negara tidak mencukupi! Butuh ${formatTradePrice(totalPrice)} NEO.`);
      return;
    }

    const boughtKey = `total_bought_${effectiveSelectedProduct}`;
    const currentBought = Number(detail[boughtKey]) || 0;

    const partnerSoldKey = `partner_sold_${targetCountry}_${effectiveSelectedProduct}`;
    const currentPartnerSold = Number(detail[partnerSoldKey]) || 0;

    const inventoryKey = `inventory_${effectiveSelectedProduct}`;
    const currentInventory = getMaterialStock(detail, effectiveSelectedProduct);
    const newInventory = currentInventory + quantity;
    const accumulatedKey = `accumulated_${effectiveSelectedProduct}`;

    setCountryDetail(recordTrade({
      ...detail,
      anggaran: currentBudget - totalPrice,
      [boughtKey]: currentBought + quantity,
      [partnerSoldKey]: currentPartnerSold + quantity,
      [inventoryKey]: newInventory,
      [accumulatedKey]: newInventory
    }, {
      commodity: effectiveSelectedProduct,
      quantity,
      side: 'buy',
      day: Math.floor(Date.UTC(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate()) / 86_400_000),
      hour: tradeDate.getUTCHours(),
      counterparty: targetCountry,
    }));

    onConfirm(totalPrice, `${quantity}x Satuan`);
    alert(`Berhasil membeli ${quantity} ${formatLabel(effectiveSelectedProduct)} dari ${targetCountry}.`);
    onClose();
  };

  return (
    <NotebookModalWrapper
      onClose={onClose}
      zIndexClass="z-[70]"
      isHidden={isProductPickerOpen || isCountryPickerOpen}
    >
      <>
      <div className="flex h-full min-w-0 flex-col overflow-hidden">

        {/* HEADER */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-emerald-500/30 shrink-0">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
            </div>
            <h2 className={rootModalTypography.title}>Beli Komoditas</h2>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="root-no-scrollbar-glow min-h-0 flex-1 overflow-y-auto px-5 pt-5 pb-2 relative z-10 space-y-4 bg-[#0F2424] neon-scrollbar [overflow-anchor:none]">

          {/* --- INPUT CARD PRODUK & NEGARA --- */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Produk:</label>
              <button
                onClick={() => setIsProductPickerOpen(true)}
                className="w-full px-4 py-3 rounded-md bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-sm font-bold flex items-center justify-between hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
              >
                <span>{getArmsTradeProducts().find(product => product.dataKey === effectiveSelectedProduct)?.label || formatLabel(effectiveSelectedProduct)}</span>
                <span className="text-[10px] opacity-70 uppercase tracking-wider">Ubah</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Negara:</label>
              <button
                onClick={() => setIsCountryPickerOpen(true)}
                className="w-full px-4 py-3 rounded-md bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-sm font-bold flex items-center justify-between hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"
              >
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
              <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">{isArmsProduct(effectiveSelectedProduct) ? "Unit Alutsista Mitra:" : `Bangunan ${formatLabel(effectiveSelectedProduct)} (Mitra):`}</span>
              <span className="text-sm font-black text-[#E0E0E0]">
                {(isArmsProduct(effectiveSelectedProduct) ? partnerProduction : Number(partnerData?.[effectiveSelectedProduct] || 0)).toLocaleString('id-ID', { maximumFractionDigits: 2 })} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span>
              </span>
            </div>
            <div className="flex justify-between items-center pt-0 pb-1">
              <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Produksi Mitra (Total):</span>
              <span className="text-sm font-black text-[#E0E0E0]">
                {(() => {
                  const matchedOffer = partnerOffers?.find(
                    o => o.partnerName.toLowerCase().trim() === targetCountry.toLowerCase().trim() &&
                      o.productKey === effectiveSelectedProduct
                  );
                  const displayValue = matchedOffer ? Math.max(matchedOffer.quantity, partnerProduction) : partnerProduction;
                  return displayValue.toLocaleString('id-ID', { maximumFractionDigits: 2 });
                })()} <span className="text-[10px] text-[#6B8A8A] font-bold">Unit</span>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <label className="text-[#E0E0E0] font-bold text-sm tracking-wide">Kuantitas:</label>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"><Minus className="h-3.5 w-3.5" /></button>
              <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} className="w-16 px-2 py-1.5 text-center rounded bg-[#0A1A1A] text-[#00FFAA] text-sm font-bold border border-[#00FFAA]/30 focus:outline-none focus:border-[#00FFAA]" />
              <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer"><Plus className="h-3.5 w-3.5" /></button>
              <button onClick={() => setQuantity(quantity + 1000)} className="px-2.5 py-1.5 rounded bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] text-[10px] font-bold hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer uppercase tracking-wide">+1k</button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-[#00FFAA]/20">
            <span className="text-[#6B8A8A] font-bold text-sm tracking-wide">Harga / unit:</span>
            <div className="flex items-center gap-1.5">
              {hasTradeDiscount && (
                <span className="text-sm font-bold text-rose-400 line-through">
                  {formatTradePrice(originalPricePerUnit)}
                </span>
              )}
              <span className="text-lg font-black text-[#00FFAA]">{formatTradePrice(pricePerUnit)}</span>
              <span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">NEO</span>
            </div>
          </div>
          {hasTradeDiscount && (
            <div className="flex justify-end gap-1.5 flex-wrap">
              {hasProtestantDiscount && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Agama Protestan: Diskon beli {PROTESTANT_BUY_PRICE_DISCOUNT * 100}%
                </span>
              )}
              {isWTOActive && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Organisasi WTO: Diskon beli {Math.round((1 - wtoBuyMultiplier) * 100)}%
                </span>
              )}
              {isOPECActive && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Organisasi OPEC: Diskon beli {Math.round((1 - opecBuyMultiplier) * 100)}%
                </span>
              )}
              {strategicTradeBonusPercent > 0 && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Riset Diplomasi Dagang: Diskon beli {strategicTradeBonusPercent}%
                </span>
              )}
              {getKementerianPerdaganganPriceBonusPercent(countryDetail) > 0 && (
                <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-400">
                  Bonus Kementerian Perdagangan: Diskon beli {getKementerianPerdaganganPriceBonusPercent(countryDetail)}%
                </span>
              )}
            </div>
          )}

          {importTariffCost > 0 && (
            <div className="flex justify-between items-center text-xs text-amber-300">
              <span>Tarif impor tambahan ({Math.round(importTariffModifier * 100)}%)</span>
              <span>{formatTradePrice(importTariffCost)} NEO</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t border-[#00FFAA]/20 pt-2 mt-1">
            <span className="text-[#E0E0E0] font-bold text-sm tracking-wide">Total Pembelian :</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-[#00FFAA]">{formatTradePrice(totalPrice)}</span>
              <span className="text-[10px] text-[#6B8A8A] font-bold mt-0.5">NEO</span>
            </div>
          </div>
          {/* CHART CANDLESTICK HARGA BELI */}
          <div className="pt-3 border-t border-[#00FFAA]/20 mt-2 w-full">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[#00FFAA] font-bold text-sm tracking-wide">Grafik Harga Historis (Candlestick)</div>
              <div className="flex gap-1.5">
                {PRICE_TIME_RANGES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setTimeRange(value)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors cursor-pointer ${timeRange === value
                        ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]'
                        : 'bg-[#0A1A1A] text-[#6B8A8A] border-[#00FFAA]/20 hover:text-[#00FFAA]'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <CandlestickChart series={ohlcSeries} timeRange={timeRange} currentPrice={chartCurrentPrice} />
          </div>
        </div>

        <div className="px-5 py-4 pb-8 border-t border-[#00FFAA]/20 flex gap-3 bg-[#0A1A1A] relative z-10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Batal</button>
          <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[#0A1A1A] text-xs font-black uppercase tracking-wide transition-all cursor-pointer">Beli</button>
        </div>
      </div>

      {/* --- MODAL PILIH PRODUK (Mengirim groupedProductItems) --- */}
      <PilihItemModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        title="Pilih Komoditas atau Alutsista"
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
      </>
    </NotebookModalWrapper>
  );
}