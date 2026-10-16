"use client"
import React, { useMemo, useState, useEffect, useRef } from "react";
import { X, ArrowRightLeft, Info, AlertTriangle } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import JualModalsMenu from "./jual/modalsKonfirmasiJual";
import MitraModalsMenu, { TradePartner } from "./mitra/mitraModalsMenu";
import ModalsKonfirmasiBeli from "./beli/modalsKonfirmasiBeli";
import { getTradeAgreementsForCountry } from '../../../../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import TawaranPembelianTable from "./tawaran_beli/TawaranPembelianTable";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate } from '@/app/logic/production_logic';
import {
  isMemberOfWTO,
  isMemberOfOPEC,
  getWTOSellPriceMultiplier,
  getWTOBuyPriceMultiplier,
  getOPECSellPriceMultiplier,
  getOPECBuyPriceMultiplier,
  applyKerjaSamaRegionalToMultiplier,
  getStrategicTradeBonusPercent,
  getKementerianPerdaganganPriceBonusPercent,
} from '@/app/page/bonus_logic';
import {
  PROTESTANT_SELL_PRICE_BONUS,
  PROTESTANT_BUY_PRICE_DISCOUNT,
} from "@/app/page/bonus_logic/agama_bonus_logic/kristen";
import { NotificationMessage } from '@/app/page/menus/inbox/logic/1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic';
import { isTradeEmbargoActive, isCountryUnderEconomicEmbargo } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import {
  calculateTradeAccess,
  getAverageNationalization,
} from "./tradeAccessLogic";
import {
  getArmsTradeProducts,
  getArmsTransferUpdate,
  getArmsUnitCount,
} from "./armsTradeLogic";
import ArmsTradeBudgetModal from "./ArmsTradeBudgetModal";
import { isArmsSaleEmbargoActive } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/2_armsSalesEmbargoLogic";
import {
  applyNpcCountrySimulationState,
  flushNpcCountrySimulation,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
  updateNpcCountrySimulationState,
} from "@/app/logic/npc_country_simulation/npcCountrySimulation";


interface AgreementData {
  no: number;
  mitra: string;
  type: string;
  status: string;
}

interface ModalCountryDetail {
  [key: string]: unknown;
  country?: string;
  nama?: string;
  region?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: ModalCountryDetail | null;
  setCountryDetail: (detail: ModalCountryDetail | ((prev: ModalCountryDetail) => ModalCountryDetail)) => void;
  currentDate?: Date;
  resetTrigger?: boolean;
  prefetchedAllCountries?: any[];
  inboxNotifications?: NotificationMessage[];
  onRemoveInboxNotification?: (notificationId: string) => void;
}

export interface TradeHistoryItem {
  tanggal: string;
  tanggalISO?: string;
  tipe: "jual" | "beli";
  kuantitas: string;
  biaya: number;
  negara: string;
}

// --- Ekspor Interface untuk Tawaran AI ---
export interface PartnerOffer {
  id: string;
  partnerName: string;
  productKey: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  validUntil?: Date | string;
  sourceNotificationId?: string;
  marketType?: "arms";
  armsDirection?: "buy_from_partner" | "sell_to_partner";
  partnerSlug?: string;
}

const DEFAULT_PRICES: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, pabrik_semikonduktor: 4000, pabrik_mesin: 10000, pabrik_besi: 10000,
  semen_beton: 300, kayu: 200, ayam_unggas: 60, sapi_perah: 200,
  sapi_potong: 180, domba_kambing: 150, padi: 80, gandum: 90, jagung: 70,
  sayur: 100, umbi: 60, kedelai: 120, kelapa_sawit: 130, kopi: 300,
  teh: 250, kakao: 350, tebu: 100, karet: 200,
  udang: 500, mutiara: 1000, ikan: 300, air_mineral: 50,
  gula: 150, roti: 200, pengolahan_daging: 250, mie_instan: 180, minyak_goreng: 220,
  susu: 160
};

const ALL_IMPORT_KEYS = [
  "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi",
  "pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu",
  "ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing",
  "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet",
  "udang", "mutiara", "ikan",
  "air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu"
];

const formatLabel = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
const TRADE_HISTORY_RETENTION_DAYS = 90;

const parseTradeHistoryDate = (item: TradeHistoryItem): Date | null => {
  const dateParts = item.tanggalISO
    ? item.tanggalISO.split("-").map(Number)
    : item.tanggal.split(".").reverse().map(Number);
  if (dateParts.length !== 3 || dateParts.some(part => !Number.isInteger(part))) return null;

  const [year, month, day] = dateParts;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

const formatTradeHistoryDate = (date: Date): string => {
  const [year, month, day] = formatDate(date).split("-");
  return `${day}.${month}.${year}`;
};

export default function PerdaganganModal({ 
  isOpen, 
  onClose, 
  countryDetail, 
  setCountryDetail, 
  currentDate, 
  resetTrigger,
  prefetchedAllCountries,
  inboxNotifications = [],
  onRemoveInboxNotification
}: ModalProps) {
  const [historyFilter, setHistoryFilter] = useState<"semua" | "jual" | "beli">("semua");
  const storedHistory = countryDetail?.tradeHistory;
  const history = useMemo(() => {
    if (!Array.isArray(storedHistory)) return [];
    const today = currentDate || new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    return storedHistory.filter((entry): entry is TradeHistoryItem => {
      if (
        !entry ||
        typeof entry !== "object" ||
        !("tanggal" in entry) ||
        typeof entry.tanggal !== "string" ||
        !("tipe" in entry) ||
        (entry.tipe !== "jual" && entry.tipe !== "beli") ||
        !("kuantitas" in entry) ||
        typeof entry.kuantitas !== "string" ||
        !("biaya" in entry) ||
        typeof entry.biaya !== "number" ||
        !("negara" in entry) ||
        typeof entry.negara !== "string"
      ) {
        return false;
      }

      const transactionDay = parseTradeHistoryDate(entry);
      if (!transactionDay) return true;
      const ageInDays = Math.floor((currentDay - transactionDay.getTime()) / (1000 * 60 * 60 * 24));
      return ageInDays < TRADE_HISTORY_RETENTION_DAYS;
    });
  }, [storedHistory, currentDate]);
  const [historyResetVersion, setHistoryResetVersion] = useState(0);
  const [metadata, setMetadata] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!Array.isArray(storedHistory) || history.length === storedHistory.length) return;
    setCountryDetail(previous => ({
      ...previous,
      tradeHistory: history
    }));
  }, [history, setCountryDetail, storedHistory]);

  useEffect(() => {
    if (!isOpen) return;
    fetchBuildingMetadata().then(data => setMetadata(data || {}));
  }, [isOpen]);

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

  // State untuk modal anak
  const [isConfirmBeliOpen, setIsConfirmBeliOpen] = useState(false);
  const [isJualOpen, setIsJualOpen] = useState(false);
  const [isMitraOpen, setIsMitraOpen] = useState(false);
  const [activeTradePartner, setActiveTradePartner] = useState<TradePartner | null>(null);
  const [activeInboxOfferId, setActiveInboxOfferId] = useState<string | null>(null);

  // --- State untuk fitur Tawaran AI ---
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isArmsOfferOpen, setIsArmsOfferOpen] = useState(false);
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [activeOfferProduct, setActiveOfferProduct] = useState<string | undefined>(undefined);
  const armsTransactionsInProgress = useRef(new Set<string>());
  const [armsBudgetShortfall, setArmsBudgetShortfall] = useState<{
    availableCash: number;
    requiredCash: number;
  } | null>(null);

  // Fungsi trigger dari Mitra
  const openBeliModals = (partner: TradePartner) => {
    if (!tradeAccess.canBuy) {
      alert(buyRestrictionMessage);
      return;
    }
    setActiveTradePartner(partner);
    setActiveOfferProduct(undefined);
    setIsMitraOpen(false);
    setIsConfirmBeliOpen(true);
  };

  const openJualModals = (partner?: TradePartner) => {
    if (!tradeAccess.canSell) {
      alert("Akses jual komoditas diblokir karena skor sentralisasi negara Anda mencapai 85 atau lebih.");
      return;
    }
    setActiveTradePartner(partner ?? null);
    setIsMitraOpen(false);
    setIsJualOpen(true);
  };

  const addHistoryEntry = (tipe: "jual" | "beli", biaya: number, kuantitas: string = "1x") => {
    const transactionDate = currentDate || new Date();
    const tanggalISO = formatDate(transactionDate);
    setCountryDetail(previous => ({
      ...previous,
      tradeHistory: [
        {
          tanggal: formatTradeHistoryDate(transactionDate),
          tanggalISO,
          tipe,
          kuantitas,
          biaya,
          negara: previous.country || previous.nama || "-"
        },
        ...(Array.isArray(previous.tradeHistory) ? previous.tradeHistory : [])
          .filter((entry): entry is TradeHistoryItem => Boolean(entry) && typeof entry === "object")
      ]
    }));
  };

  const countryName = countryDetail?.country || countryDetail?.nama || "";
  const tradeAccess = calculateTradeAccess(
    getAverageNationalization(countryDetail?.sector_nationalization),
    String(countryDetail?.ideology || ""),
    String(countryDetail?.religion || "")
  );
  const buyRestrictionMessage =
    "Negara Anda berada di bawah sanksi ekonomi terbatas. Impor komoditas tidak tersedia.";
  const handleOpenGlobalBuy = () => {
    if (!tradeAccess.canBuy) {
      alert(buyRestrictionMessage);
      return;
    }
    setActiveTradePartner(null);
    setActiveOfferProduct(undefined);
    setIsConfirmBeliOpen(true);
  };

  const effectiveHistory = useMemo(() => {
    if (!resetTrigger) return history;
    return [];
  }, [history, resetTrigger]);

  const effectiveFilter = useMemo(() => {
    if (!resetTrigger) return historyFilter;
    return "semua" as const;
  }, [historyFilter, resetTrigger]);

  const [offersResetVersion, setOffersResetVersion] = useState(0);
  const [pbbRevision, setPbbRevision] = useState(0);
  const [npcRevision, setNpcRevision] = useState(0);

  useEffect(() => {
    const refreshEmbargoState = () => setPbbRevision(revision => revision + 1);
    window.addEventListener('pbb_active_resolutions_updated', refreshEmbargoState);
    const refreshNpcState = () => setNpcRevision(revision => revision + 1);
    window.addEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcState);
    return () => {
      window.removeEventListener('pbb_active_resolutions_updated', refreshEmbargoState);
      window.removeEventListener(NPC_COUNTRY_SIMULATION_UPDATED_EVENT, refreshNpcState);
    };
  }, []);

  const handleResetHistory = () => {
    setCountryDetail(previous => ({
      ...previous,
      tradeHistory: []
    }));
    setHistoryFilter("semua");
    setPartnerOffers([]);
    setHistoryResetVersion((prev) => prev + 1);
    setOffersResetVersion((prev) => prev + 1);
  };

  useEffect(() => {
    if (!resetTrigger) return;
    handleResetHistory();
  }, [resetTrigger]);

  const allPartners = useMemo((): TradePartner[] => {
    const normalizeName = (name: string) => name.toLowerCase().trim();
    const removedPartners = new Set(
      (Array.isArray(countryDetail?.removedTradePartners) ? countryDetail.removedTradePartners : [])
        .map((name: string) => normalizeName(name))
    );
    const agreements = getTradeAgreementsForCountry(countryName);
    const registeredPartners: TradePartner[] = agreements.map((item: AgreementData) => ({
      id: item.no,
      nama_negara: item.mitra,
      region: countryDetail?.region || "Internasional",
      status_hubungan: item.status,
      jenis_perjanjian: item.type,
      total_nilai_dagang: undefined,
    }));
    const customPartners: TradePartner[] = (Array.isArray(countryDetail?.addedTradePartners)
      ? countryDetail.addedTradePartners
      : []
    ).map((name: string, index: number) => {
      const country = COUNTRIES_DATA.find(
        item => normalizeName(item.country) === normalizeName(name)
      );
      return {
        id: 1_000_000 + index,
        nama_negara: name,
        region: country?.continent || "Internasional",
        status_hubungan: "Aktif",
        jenis_perjanjian: "Bilateral",
        total_nilai_dagang: undefined,
      };
    });
    const seenPartners = new Set<string>();
    return [...registeredPartners, ...customPartners].filter(partner => {
      const key = normalizeName(partner.nama_negara);
      if (!key || removedPartners.has(key) || seenPartners.has(key)) return false;
      seenPartners.add(key);
      return true;
    });
  }, [countryDetail?.addedTradePartners, countryDetail?.region, countryDetail?.removedTradePartners, countryName]);

  const [partnersState, setPartnersState] = useState<TradePartner[]>([]);

  useEffect(() => {
    setPartnersState(allPartners);
  }, [allPartners]);

  const eligiblePartners = useMemo(
    () => partnersState.filter(partner => !isTradeEmbargoActive(countryName, partner.nama_negara)),
    [partnersState, countryName, pbbRevision]
  );

  const handleRemovePartner = (partnerId: number) => {
    const partnerToRemove = partnersState.find(partner => partner.id === partnerId);
    if (!partnerToRemove) return;
    const normalizeName = (name: string) => name.toLowerCase().trim();
    setPartnersState(previous => previous.filter(partner => partner.id !== partnerId));
    setCountryDetail(previous => {
      if (!previous) return previous;
      const addedPartners = Array.isArray(previous.addedTradePartners) ? previous.addedTradePartners : [];
      const removedPartners = Array.isArray(previous.removedTradePartners) ? previous.removedTradePartners : [];
      return {
        ...previous,
        addedTradePartners: addedPartners.filter(
          name => normalizeName(String(name)) !== normalizeName(partnerToRemove.nama_negara)
        ),
        removedTradePartners: Array.from(new Set([
          ...removedPartners.filter(
            name => normalizeName(String(name)) !== normalizeName(partnerToRemove.nama_negara)
          ),
          partnerToRemove.nama_negara
        ]))
      };
    });
  };

  // --- PERSISTENT WEEKLY TRADE OFFERS IN COUNTRY DETAIL ---
  const storedActiveOffers = useMemo((): PartnerOffer[] => {
    if (!countryDetail || !countryDetail.ai_trade_offers) return [];
    try {
      const rawOffers = typeof countryDetail.ai_trade_offers === 'string' 
        ? JSON.parse(countryDetail.ai_trade_offers) 
        : countryDetail.ai_trade_offers;
      if (!Array.isArray(rawOffers)) return [];
      
      // Filter out expired offers
      if (currentDate) {
        return rawOffers.filter((o: any) => {
          const validUntilDate = new Date(o.validUntil);
          return validUntilDate > currentDate && !isTradeEmbargoActive(countryName, o.partnerName);
        });
      }
      return rawOffers.filter((o: any) => !isTradeEmbargoActive(countryName, o.partnerName));
    } catch (e) {
      return [];
    }
  }, [countryDetail?.ai_trade_offers, currentDate, countryName, pbbRevision]);

  const inboxPurchaseOffers = useMemo((): PartnerOffer[] => {
    return inboxNotifications.flatMap(notification => {
      const tradeNotification = notification as NotificationMessage & {
        tradeType?: string;
        partnerName?: string;
        productKey?: string;
        quantity?: number;
        pricePerUnit?: number;
        totalPrice?: number;
        isHandled?: boolean;
      };
      if (
        tradeNotification.tradeType !== 'beli' ||
        tradeNotification.isHandled ||
        !tradeNotification.partnerName ||
        !tradeNotification.productKey ||
        !Number.isFinite(tradeNotification.quantity) ||
        !Number.isFinite(tradeNotification.pricePerUnit) ||
        !Number.isFinite(tradeNotification.totalPrice) ||
        isTradeEmbargoActive(countryName, tradeNotification.partnerName)
      ) {
        return [];
      }

      return [{
        id: tradeNotification.id,
        partnerName: tradeNotification.partnerName,
        productKey: tradeNotification.productKey,
        quantity: tradeNotification.quantity as number,
        pricePerUnit: tradeNotification.pricePerUnit as number,
        totalPrice: tradeNotification.totalPrice as number,
        sourceNotificationId: tradeNotification.id
      }];
    });
  }, [inboxNotifications, countryName, pbbRevision]);

  const activeOffers = useMemo(
    () => [...storedActiveOffers, ...inboxPurchaseOffers],
    [storedActiveOffers, inboxPurchaseOffers]
  );

  const storedArmsOffers = useMemo((): PartnerOffer[] => {
    try {
      const rawOffers = typeof countryDetail?.ai_arms_trade_offers === "string"
        ? JSON.parse(countryDetail.ai_arms_trade_offers)
        : countryDetail?.ai_arms_trade_offers;
      if (!Array.isArray(rawOffers)) return [];
      return rawOffers.filter((offer: PartnerOffer) => {
        const validUntil = offer.validUntil ? new Date(offer.validUntil) : null;
        const armsBuyer = offer.armsDirection === "buy_from_partner" ? countryName : offer.partnerName;
        return offer.marketType === "arms" &&
          Boolean(offer.partnerSlug) &&
          Boolean(offer.armsDirection) &&
          (!validUntil || (Number.isFinite(validUntil.getTime()) && validUntil > (currentDate || new Date()))) &&
          !isTradeEmbargoActive(countryName, offer.partnerName) &&
          !isArmsSaleEmbargoActive(
            offer.armsDirection === "buy_from_partner" ? offer.partnerName : countryName,
            armsBuyer,
          );
      });
    } catch (error) {
      console.error("Gagal membaca tawaran alutsista:", error);
      return [];
    }
  }, [countryDetail?.ai_arms_trade_offers, currentDate, countryName, npcRevision, pbbRevision]);

  useEffect(() => {
    if (!isOpen || !currentDate || !countryDetail || !prefetchedAllCountries?.length) return;
    const gameStartStr = countryDetail.game_start_date as string | undefined;
    if (!gameStartStr) return;

    const startParts = gameStartStr.split("-").map(Number);
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const currentOnlyDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const diffDays = Math.floor((currentOnlyDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return;

    const currentWeekIndex = Math.floor(diffDays / 7);
    if (currentWeekIndex <= Number(countryDetail.last_arms_trade_week ?? -1)) return;

    const normalizeSlug = (value: unknown) => String(value || "").trim().toLowerCase();
    const playerName = String(countryDetail.country || countryDetail.nama || "").trim().toLowerCase();
    const availablePartners = prefetchedAllCountries.filter((country) => {
      const name = String(country.country || country.nama || country.name_id || "").trim();
      return Boolean(country.country_slug) &&
        name &&
        name.toLowerCase() !== playerName &&
        !isTradeEmbargoActive(countryName, name);
    });
    const selectedPartners = [...availablePartners]
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2));
    const newOffers: PartnerOffer[] = [];
    const playerBudget = Math.max(0, Number(countryDetail.anggaran) || 0);

    for (const rawPartner of selectedPartners) {
      const partner = applyNpcCountrySimulationState(rawPartner);
      const partnerName = String(partner.country || partner.nama || partner.name_id || "").trim();
      const partnerSlug = normalizeSlug(partner.country_slug);
      if (!partnerName || !partnerSlug) continue;
      const partnerBudget = Math.max(0, Number(partner.anggaran) || 0);
      const candidates: PartnerOffer[] = [];

      for (const product of [...getArmsTradeProducts()].sort(() => Math.random() - 0.5)) {
        const partnerStock = getArmsUnitCount(partner, product);
        const playerStock = getArmsUnitCount(countryDetail, product);
        const maxQuantity = Math.max(1, Math.min(50, Math.floor(Math.max(partnerStock, playerStock) * 0.05)));
        const quantity = 1 + Math.floor(Math.random() * maxQuantity);
        const partnerSellPrice = Math.round(product.unitPrice * (1.1 + Math.random() * 0.15));
        const partnerBuyPrice = Math.round(product.unitPrice * (0.75 + Math.random() * 0.15));

        if (partnerStock >= quantity) {
          const totalPrice = partnerSellPrice * quantity;
          if (totalPrice <= playerBudget && !isArmsSaleEmbargoActive(partnerName, playerName)) {
            candidates.push({
              id: `arms-${Date.now()}-${partnerSlug}-${product.dataKey}-buy`,
              partnerName,
              partnerSlug,
              productKey: product.dataKey,
              quantity,
              pricePerUnit: partnerSellPrice,
              totalPrice,
              marketType: "arms",
              armsDirection: "buy_from_partner",
            });
          }
        }

        if (playerStock >= quantity) {
          const totalPrice = partnerBuyPrice * quantity;
          if (totalPrice <= partnerBudget && !isArmsSaleEmbargoActive(playerName, partnerName.toLowerCase())) {
            candidates.push({
              id: `arms-${Date.now()}-${partnerSlug}-${product.dataKey}-sell`,
              partnerName,
              partnerSlug,
              productKey: product.dataKey,
              quantity,
              pricePerUnit: partnerBuyPrice,
              totalPrice,
              marketType: "arms",
              armsDirection: "sell_to_partner",
            });
          }
        }
        if (candidates.length >= 4) break;
      }

      const chosenOffer = candidates[Math.floor(Math.random() * candidates.length)];
      if (!chosenOffer) continue;
      const validUntil = new Date(currentOnlyDate);
      validUntil.setDate(validUntil.getDate() + 30);
      newOffers.push({
        ...chosenOffer,
        validUntil: validUntil.toISOString(),
      });
    }

    setCountryDetail(previous => ({
      ...previous,
      ai_arms_trade_offers: [...storedArmsOffers, ...newOffers],
      last_arms_trade_week: currentWeekIndex,
    }));
  }, [
    isOpen,
    currentDate,
    countryDetail,
    prefetchedAllCountries,
    countryName,
    storedArmsOffers,
    setCountryDetail,
    npcRevision,
  ]);

  useEffect(() => {
    if (!isOpen || eligiblePartners.length === 0 || !currentDate || !countryDetail) {
      return;
    }

    const gameStartStr = countryDetail.game_start_date as string | undefined;
    if (!gameStartStr) return;

    // Hilangkan komponen waktu untuk perbandingan tanggal murni
    const startParts = gameStartStr.split("-").map(Number);
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const currentOnlyDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    const diffTime = currentOnlyDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Jangan munculkan apa pun di bawah 7 hari pertama
    if (diffDays < 7) {
      if (storedActiveOffers.length > 0) {
        setCountryDetail(prev => ({ ...prev, ai_trade_offers: [] }));
      }
      return;
    }

    // Tentukan nomor minggu saat ini (misal: hari ke 7-13 = minggu 1, 14-20 = minggu 2, dst)
    const currentWeekIndex = Math.floor(diffDays / 7);

    // Dapatkan minggu terakhir yang sudah pernah memicu generate tawaran
    const lastGeneratedWeek = Number(countryDetail.last_generated_week ?? -1);

    if (currentWeekIndex > lastGeneratedWeek) {
      // Waktunya generate tawaran untuk minggu ini!
      // Jumlah negara acak: 2 sampai 3
      const offerSize = 2 + Math.floor(Math.random() * 2);
      const shuffledPartners = [...eligiblePartners].sort(() => 0.5 - Math.random()).slice(0, offerSize);
      
      const newOffers: PartnerOffer[] = [];

      shuffledPartners.forEach((partner) => {
        const partnerData = prefetchedAllCountries?.find(
          c => (c.country || c.nama || "").toLowerCase().trim() === partner.nama_negara.toLowerCase().trim()
        );

        let chosenProduct: string | null = null;
        let partnerProd = 500; 

        if (partnerData) {
          const shuffledProducts = [...ALL_IMPORT_KEYS].sort(() => 0.5 - Math.random());

          for (const prodKey of shuffledProducts) {
            const pBuildingCount = Number(partnerData[prodKey] || 0);
            if (pBuildingCount === 0) continue;

            const pMeta = metadata[prodKey] || Object.values(metadata).find((m: any) => m.dataKey === prodKey);
            if (!pMeta || !pMeta.produksi) continue;

            const pBuildDateKey = `build_date_${prodKey}`;
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

            const partnerSold = Number(countryDetail?.[`partner_sold_${partner.nama_negara}_${prodKey}`]) || 0;
            const totalProd = Math.max(0, basePartnerProd - partnerSold);

            if (totalProd > 0) {
              chosenProduct = prodKey;
              partnerProd = totalProd;
              break;
            }
          }
        } else {
          chosenProduct = ALL_IMPORT_KEYS[Math.floor(Math.random() * ALL_IMPORT_KEYS.length)];
        }

        if (!chosenProduct) return;

        const basePrice = DEFAULT_PRICES[chosenProduct] || 100;
        const priceMultiplier = 0.8 + (Math.random() * 0.4);
        const pricePerUnit = Math.round(basePrice * priceMultiplier * 100) / 100;
        const quantity = Math.min(partnerProd, Math.floor(Math.random() * 500) + 10);

        // Berlaku selama 30 hari ke depan
        const validUntil = new Date(currentOnlyDate);
        validUntil.setDate(validUntil.getDate() + 30);

        newOffers.push({
          id: `offer-${Date.now()}-${partner.id}-${Math.random()}`,
          partnerName: partner.nama_negara,
          productKey: chosenProduct,
          quantity: quantity,
          pricePerUnit: pricePerUnit,
          totalPrice: pricePerUnit * quantity,
          validUntil: validUntil
        });
      });

      // Gabungkan tawaran baru dengan tawaran lama yang belum kadaluwarsa
      const mergedOffers = [...storedActiveOffers, ...newOffers];

      setCountryDetail(prev => ({
        ...prev,
        ai_trade_offers: mergedOffers,
        last_generated_week: currentWeekIndex
      }));
    }
  }, [isOpen, eligiblePartners, currentDate, prefetchedAllCountries, countryDetail, storedActiveOffers, metadata, setCountryDetail]);

  const handleAcceptArmsOffer = async (offer: PartnerOffer) => {
    if (armsTransactionsInProgress.current.has(offer.id)) return;
    armsTransactionsInProgress.current.add(offer.id);
    try {
      const isBuying = offer.armsDirection === "buy_from_partner";
      if (offer.marketType !== "arms" || !offer.partnerSlug || !offer.armsDirection) {
        alert("Format tawaran alutsista tidak valid.");
        return;
      }
      if ((isBuying && !tradeAccess.canBuy) || (!isBuying && !tradeAccess.canSell)) {
        alert(isBuying ? buyRestrictionMessage : "Akses penjualan internasional negara Anda sedang dibatasi.");
        return;
      }
      if (isTradeEmbargoActive(countryName, offer.partnerName) || isCountryUnderEconomicEmbargo(countryName)) {
        alert("Transaksi alutsista tidak dapat dilakukan selama embargo atau blokade aktif.");
        return;
      }
      const armsBuyer = isBuying ? countryName : offer.partnerName;
      const armsSeller = isBuying ? offer.partnerName : countryName;
      if (isArmsSaleEmbargoActive(armsSeller, armsBuyer)) {
        alert(`Resolusi PBB melarang penjualan alutsista kepada ${armsBuyer}.`);
        return;
      }
      if (
        !Number.isInteger(offer.quantity) ||
        offer.quantity <= 0 ||
        !Number.isFinite(offer.pricePerUnit) ||
        offer.pricePerUnit <= 0 ||
        !Number.isFinite(offer.totalPrice) ||
        offer.totalPrice <= 0
      ) {
        alert("Nilai tawaran alutsista tidak valid.");
        return;
      }

      await flushNpcCountrySimulation();
      const rawPartner = prefetchedAllCountries?.find(
        country => String(country.country_slug || "").trim().toLowerCase() === offer.partnerSlug
      );
      if (!rawPartner) {
        alert("Data negara mitra tidak ditemukan. Tawaran tidak dapat diproses.");
        return;
      }
      const partner = applyNpcCountrySimulationState(rawPartner);
      const product = getArmsTradeProducts().find(item => item.dataKey === offer.productKey);
      if (!product) {
        alert("Jenis alutsista pada tawaran tidak dikenali.");
        return;
      }

      const totalPrice = offer.quantity * offer.pricePerUnit;
      const playerBudget = Math.max(0, Number(countryDetail?.anggaran) || 0);
      const partnerBudget = Math.max(0, Number(partner.anggaran) || 0);
      if (isBuying) {
        if (getArmsUnitCount(partner, product) < offer.quantity) {
          alert("Stok alutsista mitra sudah tidak mencukupi.");
          return;
        }
        if (playerBudget < totalPrice) {
          alert("Kas negara tidak mencukupi untuk menerima tawaran ini.");
          return;
        }
      } else {
        if (getArmsUnitCount(countryDetail || {}, product) < offer.quantity) {
          alert("Stok alutsista negara Anda sudah tidak mencukupi.");
          return;
        }
        if (partnerBudget < totalPrice) {
          setArmsBudgetShortfall({
            availableCash: partnerBudget,
            requiredCash: totalPrice,
          });
          return;
        }
      }

      const partnerUpdate = {
        ...getArmsTransferUpdate(partner, product, isBuying ? -offer.quantity : offer.quantity),
        anggaran: partnerBudget + (isBuying ? totalPrice : -totalPrice),
      };
      if (!updateNpcCountrySimulationState(offer.partnerSlug, partnerUpdate)) {
        alert("Simulasi negara mitra belum siap. Coba lagi setelah data negara selesai dimuat.");
        return;
      }

      const transactionDate = currentDate || new Date();
      const dateIso = formatDate(transactionDate);
      const remainingOffers = storedArmsOffers.filter(item => item.id !== offer.id);
      setCountryDetail(previous => ({
        ...previous,
        ...getArmsTransferUpdate(previous, product, isBuying ? offer.quantity : -offer.quantity),
        anggaran: playerBudget + (isBuying ? -totalPrice : totalPrice),
        ai_arms_trade_offers: remainingOffers,
        tradeHistory: [
          {
            tanggal: formatTradeHistoryDate(transactionDate),
            tanggalISO: dateIso,
            tipe: isBuying ? "beli" : "jual",
            kuantitas: `${offer.quantity} unit ${product.label}`,
            biaya: totalPrice,
            negara: offer.partnerName,
          },
          ...(Array.isArray(previous.tradeHistory) ? previous.tradeHistory : []),
        ],
      }));
      alert(
        isBuying
          ? `Pembelian ${offer.quantity} unit ${product.label} dari ${offer.partnerName} berhasil.`
          : `Penjualan ${offer.quantity} unit ${product.label} kepada ${offer.partnerName} berhasil.`
      );
    } catch (error) {
      console.error("Gagal memproses transaksi alutsista:", error);
      alert("Transaksi alutsista gagal diproses. Silakan coba lagi.");
    } finally {
      armsTransactionsInProgress.current.delete(offer.id);
    }
  };

  // --- Fungsi Terima Tawaran ---
  const handleAcceptOffer = (offer: PartnerOffer) => {
    if (offer.marketType === "arms") {
      void handleAcceptArmsOffer(offer);
      return;
    }
    if (!tradeAccess.canBuy) {
      alert(buyRestrictionMessage);
      return;
    }
    const targetPartner = eligiblePartners.find(
      partner => partner.nama_negara.toLowerCase().trim() === offer.partnerName.toLowerCase().trim()
    ) ?? (offer.sourceNotificationId ? {
      id: Number.MAX_SAFE_INTEGER,
      nama_negara: offer.partnerName,
      region: COUNTRIES_DATA.find(
        country => country.country.toLowerCase().trim() === offer.partnerName.toLowerCase().trim()
      )?.continent || "Internasional",
      status_hubungan: "Aktif"
    } : undefined);
    if (targetPartner) {
      setActiveTradePartner(targetPartner);
      setActiveOfferProduct(offer.productKey);
      setActiveInboxOfferId(offer.sourceNotificationId ?? null);
      setIsOfferOpen(false); // Tutup tabel tawaran
      setIsConfirmBeliOpen(true); // Buka modal beli
    } else {
      alert("Mitra tidak ditemukan.");
    }
  };

  const filteredHistory = effectiveHistory.filter((item) => {
    if (effectiveFilter === "semua") return true;
    return item.tipe === effectiveFilter;
  });

  const [showWTOTradeInfoModal, setShowWTOTradeInfoModal] = useState(false);
  const userCountryName = String(countryName || "");
  const isTradeMarketBlocked = tradeAccess.status === "diblokir";
  const isWTOActive = isMemberOfWTO(userCountryName);
  const wtoSellMultiplier = applyKerjaSamaRegionalToMultiplier(
    getWTOSellPriceMultiplier(userCountryName),
    countryDetail
  );
  const wtoBuyMultiplier = applyKerjaSamaRegionalToMultiplier(
    getWTOBuyPriceMultiplier(userCountryName),
    countryDetail
  );
  const isOPECActive = isMemberOfOPEC(userCountryName);
  const opecSellMultiplier = applyKerjaSamaRegionalToMultiplier(
    getOPECSellPriceMultiplier(userCountryName, "minyak"),
    countryDetail
  );
  const opecBuyMultiplier = applyKerjaSamaRegionalToMultiplier(
    getOPECBuyPriceMultiplier(userCountryName, "minyak"),
    countryDetail
  );

  const religionStr = String(countryDetail?.religion || "").toLowerCase();
  const hasProtestantBonus = religionStr.includes("protestan");

  const strategicTradeBonusPercent = getStrategicTradeBonusPercent(countryDetail);
  const ministryTradeBonusPercent = getKementerianPerdaganganPriceBonusPercent(countryDetail);

  const activeBonusesList = useMemo(() => {
    const list: {
      id: string;
      title: string;
      category: string;
      desc: string;
      sellBonusText?: string;
      buyDiscountText?: string;
    }[] = [];

    if (isWTOActive) {
      list.push({
        id: "wto",
        title: "Organisasi Perdagangan Dunia (WTO)",
        category: "Organisasi Internasional",
        desc: "Sebagai anggota resmi WTO, negara Anda terintegrasi dalam sistem pasar bebas multilateral.",
        sellBonusText: `Harga Jual Komoditas +${Math.round((wtoSellMultiplier - 1) * 100)}%`,
        buyDiscountText: `Harga Beli Komoditas -${Math.round((1 - wtoBuyMultiplier) * 100)}%`,
      });
    }

    if (isOPECActive) {
      list.push({
        id: "opec",
        title: "Organisasi Negara Pengekspor Minyak (OPEC)",
        category: "Organisasi Regional",
        desc: "Kartel minyak global yang mengatur kuota dan meningkatkan kekuatan tawar minyak bumi.",
        sellBonusText: `Harga Jual Minyak Bumi +${Math.round((opecSellMultiplier - 1) * 100)}%`,
        buyDiscountText: `Harga Beli Minyak Bumi -${Math.round((1 - opecBuyMultiplier) * 100)}%`,
      });
    }

    if (ministryTradeBonusPercent > 0) {
      list.push({
        id: "kementerian_perdagangan",
        title: "Kementerian Perdagangan",
        category: "Kabinet Pemerintahan",
        desc: "Kebijakan diplomasi niaga dan penguatan neraca perdagangan bilateral/multilateral nasional.",
        sellBonusText: `Harga Jual Komoditas +${ministryTradeBonusPercent}%`,
        buyDiscountText: `Harga Beli Komoditas -${ministryTradeBonusPercent}%`,
      });
    }

    if (strategicTradeBonusPercent > 0) {
      list.push({
        id: "riset_diplomasi_dagang",
        title: "Riset: Diplomasi Perdagangan Strategis",
        category: "Penelitian & Riset",
        desc: "Hasil riset enkripsi negosiasi niaga dan pembukaan koridor logistik perdagangan global.",
        sellBonusText: `Harga Jual Komoditas +${strategicTradeBonusPercent}%`,
        buyDiscountText: `Harga Beli Komoditas -${strategicTradeBonusPercent}%`,
      });
    }

    if (hasProtestantBonus) {
      list.push({
        id: "agama_protestan",
        title: "Etos Kerja & Perniagaan Protestan",
        category: "Nilai Agama & Budaya",
        desc: "Karakteristik etos kewirausahaan dan perdagangan bebas yang menguntungkan perniagaan.",
        sellBonusText: `Harga Jual Komoditas +${PROTESTANT_SELL_PRICE_BONUS * 100}%`,
        buyDiscountText: `Harga Beli Komoditas -${PROTESTANT_BUY_PRICE_DISCOUNT * 100}%`,
      });
    }

    return list;
  }, [
    isWTOActive,
    wtoSellMultiplier,
    wtoBuyMultiplier,
    isOPECActive,
    opecSellMultiplier,
    opecBuyMultiplier,
    ministryTradeBonusPercent,
    strategicTradeBonusPercent,
    hasProtestantBonus,
  ]);

  if (!isOpen) return null;

  return (
    <>
      <NotebookModalWrapper onClose={onClose}>
        <div className="flex flex-col h-full overflow-hidden">

          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Pasar Perdagangan Global</h2>
              </div>
              {!isTradeMarketBlocked && (
                <button
                  type="button"
                  onClick={() => setShowWTOTradeInfoModal(true)}
                  title="Lihat Informasi Efek Harga WTO & Agama"
                  className="p-1.5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0 ml-1"
                >
                  <Info className="w-4 h-4" />
                </button>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
            {isTradeMarketBlocked ? (
              <div className="flex min-h-full flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center sm:p-8">
                <AlertTriangle className="mb-4 h-14 w-14 text-rose-400" />
                <h3 className="mb-2 text-xl font-black uppercase text-rose-400">
                  Akses Pasar Global Ditolak
                </h3>
                <p className="mb-5 max-w-lg text-sm leading-relaxed text-[#A7C4C4]">
                  Negara Anda terisolasi dari Pasar Perdagangan Global karena skor sentralisasi melewati ambang blokir.
                  Turunkan rata-rata nasionalisasi atau ubah ideologi/agama agar skor turun di bawah 85.
                </p>
                <div className="mb-5 grid w-full max-w-lg grid-cols-2 gap-2 rounded-lg border border-rose-500/20 bg-[#0A1A1A] p-3 text-left text-xs">
                  <span className="text-[#6B8A8A]">Skor sentralisasi</span>
                  <strong className="text-right text-rose-300">{tradeAccess.centralizationScore.toFixed(1)}</strong>
                  <span className="text-[#6B8A8A]">Rata-rata nasionalisasi</span>
                  <strong className="text-right text-[#E0E0E0]">{tradeAccess.averageNationalization.toFixed(1)}%</strong>
                  <span className="text-[#6B8A8A]">Modifier ideologi</span>
                  <strong className="text-right text-[#E0E0E0]">×{tradeAccess.ideologyModifier.toFixed(2)}</strong>
                  <span className="text-[#6B8A8A]">Modifier agama</span>
                  <strong className="text-right text-[#E0E0E0]">×{tradeAccess.religionModifier.toFixed(2)}</strong>
                </div>
                <ul className="w-full max-w-lg space-y-1 text-left text-xs text-[#E0E0E0]">
                  {tradeAccess.reason.map((reason) => (
                    <li key={reason} className="flex gap-2">
                      <span className="text-rose-400">✕</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-lg border border-rose-400/40 bg-rose-500/10 px-6 py-2 text-xs font-black uppercase tracking-wide text-rose-300 transition hover:bg-rose-500/20"
                >
                  Mengerti
                </button>
              </div>
            ) : (
              <>
            {tradeAccess.status === "waspada" && (
              <p className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-300">
                Tingkat sentralisasi tinggi. Hubungan dagang Anda dipantau oleh komunitas internasional.
                Tarif impor tambahan: +{Math.round(tradeAccess.importTariffModifier * 100)}%.
                Skor: {tradeAccess.centralizationScore.toFixed(1)}.
              </p>
            )}
            {tradeAccess.status === "dibatasi" && (
              <p className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs font-bold text-orange-300">
                Akses impor diblokir. Anda hanya dapat menjual komoditas; tarif ekspor tambahan:
                {" "}+{Math.round(tradeAccess.exportTariffModifier * 100)}%. Skor sentralisasi: {tradeAccess.centralizationScore.toFixed(1)}.
              </p>
            )}
            {isCountryUnderEconomicEmbargo(countryName) && (
              <p className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-bold text-rose-300">
                Embargo ekonomi PBB sedang berlaku terhadap negara Anda. Aktivitas perdagangan internasional diblokir selama resolusi aktif.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-2.5 mb-4 lg:mb-6">
              <button
                onClick={() => {
                  if (tradeAccess.status === "diblokir") {
                    alert("Akses Pasar Perdagangan Global diblokir oleh skor sentralisasi negara Anda.");
                    return;
                  }
                  setIsMitraOpen(true);
                }}
                className={`px-2 py-2 lg:py-2.5 rounded-lg border text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${isTradeMarketBlocked ? "bg-rose-950/30 border-rose-500/30 text-rose-300 cursor-not-allowed" : "bg-[#0F2424] border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] cursor-pointer"}`}
              >
                Mitra
              </button>
              <button
                onClick={() => openJualModals()}
                className={`px-2 py-2 lg:py-2.5 rounded-lg border text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${tradeAccess.canSell ? "bg-[#0F2424] border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] cursor-pointer" : "bg-rose-950/30 border-rose-500/30 text-rose-300 cursor-not-allowed"}`}
              >
                Jual
              </button>
              <button
                onClick={handleOpenGlobalBuy}
                className={`px-2 py-2 lg:py-2.5 rounded-lg border text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${tradeAccess.canBuy ? "bg-[#0F2424] border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] cursor-pointer" : "bg-orange-950/30 border-orange-500/30 text-orange-300 cursor-not-allowed"}`}
              >
                Beli
              </button>
              <button
                onClick={() => openJualModals()}
                className={`px-2 py-2 lg:py-2.5 rounded-lg border text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${tradeAccess.canSell ? "bg-[#0F2424] border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] cursor-pointer" : "bg-rose-950/30 border-rose-500/30 text-rose-300 cursor-not-allowed"}`}
              >
                Jual Semuanya
              </button>
              <button
                onClick={() => {
                  setIsOfferOpen(!isOfferOpen);
                  setIsArmsOfferOpen(false);
                }}
                className={`px-2 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${isOfferOpen ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]' : 'bg-[#0F2424] border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'}`}
              >
                Tawaran Pembelian
              </button>
              <button
                onClick={() => {
                  setIsArmsOfferOpen(!isArmsOfferOpen);
                  setIsOfferOpen(false);
                }}
                className={`px-2 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${isArmsOfferOpen ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]' : 'bg-[#0F2424] border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'}`}
              >
                Tawaran Alutsista
              </button>
            </div>

            {/* --- PERBAIKAN: Kirim currentDate ke komponen tabel agar bisa mengecek kadaluwarsa --- */}
            {isOfferOpen && (
              <TawaranPembelianTable 
                offers={activeOffers} 
                onAcceptOffer={handleAcceptOffer} 
                onClose={() => setIsOfferOpen(false)} 
                currentDate={currentDate || new Date()} 
              />
            )}
            {isArmsOfferOpen && (
              <TawaranPembelianTable
                offers={storedArmsOffers}
                onAcceptOffer={handleAcceptOffer}
                onClose={() => setIsArmsOfferOpen(false)}
                currentDate={currentDate || new Date()}
                marketType="arms"
              />
            )}

            <div className="flex items-center justify-between mb-2.5 lg:mb-3">
              <h3 className="text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-widest">Riwayat 90 Hari Terakhir</h3>
              <div className="inline-flex rounded-lg overflow-hidden border border-[#00FFAA]/30">
                <button onClick={() => setHistoryFilter(effectiveFilter === "jual" ? "semua" : "jual")} className={`px-3 lg:px-4 py-1 lg:py-1.5 text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${effectiveFilter === "jual" ? "bg-rose-600 text-white" : "bg-[#0A1A1A] text-rose-400 hover:bg-rose-950/40"}`}>Jual</button>
                <button onClick={() => setHistoryFilter(effectiveFilter === "beli" ? "semua" : "beli")} className={`px-3 lg:px-4 py-1 lg:py-1.5 text-[9px] lg:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${effectiveFilter === "beli" ? "bg-emerald-600 text-white" : "bg-[#0A1A1A] text-emerald-400 hover:bg-emerald-950/40"}`}>Beli</button>
              </div>
            </div>

            <div className="border border-[#00FFAA]/30 rounded-xl overflow-hidden bg-[#0F2424]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0A1A1A] border-b border-[#00FFAA]/20">
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Tanggal</th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Tipe</th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Kuantitas</th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Biaya</th>
                    <th className="px-3 lg:px-4 py-2 lg:py-3 text-[9px] lg:text-[10px] font-black text-[#00FFAA] uppercase tracking-wider">Negara</th>
                  </tr>
                </thead>
                <tbody className="bg-[#0F2424] divide-y divide-[#00FFAA]/10">
                  {filteredHistory.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 lg:py-8 text-center text-xs text-[#6B8A8A] font-semibold">Belum ada riwayat transaksi.</td></tr>
                  ) : (
                    filteredHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#00FFAA]/5 transition-colors">
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-semibold text-[#E0E0E0]">{item.tanggal}</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-bold uppercase"><span className={item.tipe === "jual" ? "text-rose-400" : "text-emerald-400"}>{item.tipe}</span></td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-semibold text-[#E0E0E0]">{item.kuantitas}</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-bold text-[#00FFAA]">{item.tipe === "jual" ? "+" : "-"} {item.biaya.toLocaleString("id-ID", { maximumFractionDigits: 2 })} NEO</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-semibold text-[#E0E0E0]">{item.negara}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
              </>
            )}
          </div>
        </div>
      </NotebookModalWrapper>

      <ModalsKonfirmasiBeli
        isOpen={isConfirmBeliOpen && tradeAccess.canBuy && !isTradeMarketBlocked}
        onClose={() => { setIsConfirmBeliOpen(false); setActiveTradePartner(null); setActiveOfferProduct(undefined); setActiveInboxOfferId(null); }}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        onConfirm={(biaya, kuantitas) => {
          addHistoryEntry("beli", biaya, kuantitas);
          if (activeInboxOfferId) onRemoveInboxNotification?.(activeInboxOfferId);
        }}
        partners={eligiblePartners}
        currentDate={currentDate}
        initialPartnerName={activeTradePartner?.nama_negara}
        initialProductKey={activeOfferProduct}
        prefetchedAllCountries={prefetchedAllCountries}
        partnerOffers={activeOffers}
        importTariffModifier={tradeAccess.importTariffModifier}
        canBuy={tradeAccess.canBuy}
      />

      <JualModalsMenu 
        isOpen={isJualOpen && tradeAccess.canSell && !isTradeMarketBlocked}
        onClose={() => { setIsJualOpen(false); setActiveTradePartner(null); }} 
        countryDetail={countryDetail} 
        setCountryDetail={setCountryDetail} 
        onConfirm={(biaya, kuantitas) => addHistoryEntry("jual", biaya, kuantitas)} 
        currentDate={currentDate}
        partners={eligiblePartners}
        initialPartnerName={activeTradePartner?.nama_negara}
        prefetchedAllCountries={prefetchedAllCountries}
        exportTariffModifier={tradeAccess.exportTariffModifier}
        canSell={tradeAccess.canSell}
      />

      <MitraModalsMenu 
        isOpen={isMitraOpen} 
        onClose={() => setIsMitraOpen(false)} 
        partners={eligiblePartners}
        onOpenBeli={openBeliModals}
        onOpenJual={openJualModals}
        onRemovePartner={handleRemovePartner}
        currentUserCountry={countryName}
        countryDetail={countryDetail}
        onAddPartner={(name, region) => {
          const normalizeName = (value: string) => value.toLowerCase().trim();
          setPartnersState(previous => [
            ...previous.filter(partner => normalizeName(partner.nama_negara) !== normalizeName(name)),
            {
              id: Date.now(),
              nama_negara: name,
              region: region,
              status_hubungan: "Aktif",
              total_nilai_dagang: 0,
              jenis_perjanjian: "Bilateral"
            }
          ]);
          setCountryDetail(previous => {
            if (!previous) return previous;
            const addedPartners = Array.isArray(previous.addedTradePartners) ? previous.addedTradePartners : [];
            const removedPartners = Array.isArray(previous.removedTradePartners) ? previous.removedTradePartners : [];
            return {
              ...previous,
              addedTradePartners: Array.from(new Set([
                ...addedPartners.filter((partner: string) => normalizeName(partner) !== normalizeName(name)),
                name
              ])),
              removedTradePartners: removedPartners.filter(
                (partner: string) => normalizeName(partner) !== normalizeName(name)
              )
            };
          });
        }}
      />

      {armsBudgetShortfall && (
        <ArmsTradeBudgetModal
          availableCash={armsBudgetShortfall.availableCash}
          requiredCash={armsBudgetShortfall.requiredCash}
          onClose={() => setArmsBudgetShortfall(null)}
        />
      )}

      {/* MODAL INFORMASI EFEK HARGA PERDAGANGAN (WTO & AGAMA) */}
      {showWTOTradeInfoModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
            {/* Header */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#0F2424] border border-[#00FFAA]/30 text-[#00FFAA]">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-[#00FFAA] uppercase tracking-tight leading-none">
                    Informasi Efek Harga Perdagangan Global
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                    Organisasi Internasional (WTO) & Kebijakan Agama / Ideologi
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWTOTradeInfoModal(false)}
                className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              >
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] custom-scrollbar space-y-4">
              {activeBonusesList.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/20 text-center space-y-2">
                  <p className="text-sm font-bold text-[#E0E0E0]">
                    Saat ini belum ada bonus harga perdagangan yang aktif.
                  </p>
                  <p className="text-xs text-[#6B8A8A] max-w-lg mx-auto">
                    Bergabunglah dengan Organisasi Internasional (seperti WTO atau OPEC), tingkatkan level Kementerian Perdagangan di Kabinet, lakukan riset Diplomasi Perdagangan Strategis, atau terapkan kebijakan agama terkait untuk membuka bonus harga jual & diskon harga beli komoditas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between pb-1 border-b border-[#00FFAA]/15">
                    <span className="text-xs font-black uppercase tracking-wider text-[#00FFAA]">
                      Daftar Bonus Aktif ({activeBonusesList.length})
                    </span>
                    <span className="text-[10px] font-bold text-[#6B8A8A] uppercase tracking-wider">
                      Otomatis Diterapkan pada Transaksi Jual / Beli
                    </span>
                  </div>

                  {activeBonusesList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-[#0E2A20] text-emerald-200 shadow-md space-y-2 transition-all"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                            {item.category}
                          </span>
                          <h4 className="text-sm sm:text-base font-black text-white mt-1">
                            {item.title}
                          </h4>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                          Aktif
                        </span>
                      </div>

                      <p className="text-xs text-[#C3D5D5] leading-relaxed">
                        {item.desc}
                      </p>

                      <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap gap-2 text-xs font-black">
                        {item.sellBonusText && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F2424] border border-emerald-500/40 text-emerald-300">
                            • {item.sellBonusText}
                          </span>
                        )}
                        {item.buyDiscountText && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F2424] border border-emerald-500/40 text-emerald-300">
                            • {item.buyDiscountText}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex justify-end shrink-0">
              <button
                onClick={() => setShowWTOTradeInfoModal(false)}
                className="px-6 py-2 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs uppercase tracking-wider hover:bg-[#00C282] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}