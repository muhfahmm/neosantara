"use client"
import React, { useMemo, useState, useEffect } from "react";
import { ArrowRightLeft, Info, AlertTriangle } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import TradeMarketBlockedModal from "./umum/TradeMarketBlockedModal";
import TradePriceEffectInfoModal from "./TradePriceEffectInfoModal";
import type { TradePriceBonus } from "./TradePriceEffectInfoModal";
import JualModalsMenu from "./jual/modalsKonfirmasiJual";
import MitraModalsMenu, { TradePartner } from "./mitra/mitraModalsMenu";
import ModalsKonfirmasiBeli from "./beli/modalsKonfirmasiBeli";
import { getTradeAgreementsForCountry } from '../../../../../../../../json/9_database_mitra_perdagangan/tradeAgreementRegistry';
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
} from "./umum/tradeAccessLogic";
import {
  getArmsTradeProducts,
  getArmsUnitCount,
} from "./umum/armsTradeLogic";
import ArmsTradeBudgetModal from "./umum/ArmsTradeBudgetModal";
import { isArmsSaleEmbargoActive } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/2_armsSalesEmbargoLogic";
import {
  applyNpcCountrySimulationState,
  NPC_COUNTRY_SIMULATION_UPDATED_EVENT,
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

function parseStoredArmsOffers(value: unknown): unknown[] | null {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error("Gagal membaca daftar tawaran alutsista saat menyelesaikan transaksi:", error);
    return null;
  }
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
  
  const [showBlockedInfoModal, setShowBlockedInfoModal] = useState(false);

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

  const [isConfirmBeliOpen, setIsConfirmBeliOpen] = useState(false);
  const [isJualOpen, setIsJualOpen] = useState(false);
  const [isMitraOpen, setIsMitraOpen] = useState(false);
  const [activeTradePartner, setActiveTradePartner] = useState<TradePartner | null>(null);
  const [activeInboxOfferId, setActiveInboxOfferId] = useState<string | null>(null);

  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isArmsOfferOpen, setIsArmsOfferOpen] = useState(false);
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [activeOfferProduct, setActiveOfferProduct] = useState<string | undefined>(undefined);
  const [activeArmsOffer, setActiveArmsOffer] = useState<PartnerOffer | null>(null);
  const [armsBudgetShortfall, setArmsBudgetShortfall] = useState<{
    availableCash: number;
    requiredCash: number;
  } | null>(null);

  const openBeliModals = (partner: TradePartner) => {
    if (!tradeAccess.canBuy) {
      alert(buyRestrictionMessage);
      return;
    }
    setActiveTradePartner(partner);
    setActiveOfferProduct(undefined);
    setActiveArmsOffer(null);
    setIsMitraOpen(false);
    setIsConfirmBeliOpen(true);
  };

  const openJualModals = (partner?: TradePartner) => {
    if (!tradeAccess.canSell) {
      alert("Akses jual komoditas diblokir karena skor sentralisasi negara Anda mencapai 85 atau lebih.");
      return;
    }
    setActiveTradePartner(partner ?? null);
    setActiveOfferProduct(undefined);
    setActiveArmsOffer(null);
    setIsMitraOpen(false);
    setIsJualOpen(true);
  };

  const addHistoryEntry = (tipe: "jual" | "beli", biaya: number, kuantitas: string = "1x") => {
    const transactionDate = currentDate || new Date();
    const tanggalISO = formatDate(transactionDate);
    setCountryDetail(previous => {
      const currentArmsOffers = activeArmsOffer
        ? parseStoredArmsOffers(previous.ai_arms_trade_offers)
        : null;
      const remainingArmsOffers = currentArmsOffers?.filter(offer => (
        !offer || typeof offer !== "object" || !("id" in offer) || offer.id !== activeArmsOffer?.id
      ));
      return {
        ...previous,
        tradeHistory: [
          {
            tanggal: formatTradeHistoryDate(transactionDate),
            tanggalISO,
            tipe,
            kuantitas,
            biaya,
            negara: previous.country || previous.nama || "-",
          },
          ...(Array.isArray(previous.tradeHistory) ? previous.tradeHistory : [])
            .filter((entry): entry is TradeHistoryItem => Boolean(entry) && typeof entry === "object"),
        ],
        ...(remainingArmsOffers ? { ai_arms_trade_offers: remainingArmsOffers } : {}),
      };
    });
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
    setActiveArmsOffer(null);
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

  const storedActiveOffers = useMemo((): PartnerOffer[] => {
    if (!countryDetail || !countryDetail.ai_trade_offers) return [];
    try {
      const rawOffers = typeof countryDetail.ai_trade_offers === 'string'
        ? JSON.parse(countryDetail.ai_trade_offers)
        : countryDetail.ai_trade_offers;
      if (!Array.isArray(rawOffers)) return [];

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

    const startParts = gameStartStr.split("-").map(Number);
    const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const currentOnlyDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    const diffTime = currentOnlyDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      if (storedActiveOffers.length > 0) {
        setCountryDetail(prev => ({ ...prev, ai_trade_offers: [] }));
      }
      return;
    }

    const currentWeekIndex = Math.floor(diffDays / 7);
    const lastGeneratedWeek = Number(countryDetail.last_generated_week ?? -1);

    if (currentWeekIndex > lastGeneratedWeek) {
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

      const mergedOffers = [...storedActiveOffers, ...newOffers];

      setCountryDetail(prev => ({
        ...prev,
        ai_trade_offers: mergedOffers,
        last_generated_week: currentWeekIndex
      }));
    }
  }, [isOpen, eligiblePartners, currentDate, prefetchedAllCountries, countryDetail, storedActiveOffers, metadata, setCountryDetail]);

  const handleOpenArmsOffer = (offer: PartnerOffer) => {
    const isBuying = offer.armsDirection === "buy_from_partner";
    if (
      offer.marketType !== "arms" ||
      !offer.partnerSlug ||
      (offer.armsDirection !== "buy_from_partner" && offer.armsDirection !== "sell_to_partner") ||
      !Number.isInteger(offer.quantity) ||
      offer.quantity <= 0 ||
      !Number.isFinite(offer.pricePerUnit) ||
      offer.pricePerUnit <= 0 ||
      !Number.isFinite(offer.totalPrice) ||
      offer.totalPrice <= 0 ||
      !getArmsTradeProducts().some(product => product.dataKey === offer.productKey)
    ) {
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

    const partner = eligiblePartners.find(
      item => item.nama_negara.toLowerCase().trim() === offer.partnerName.toLowerCase().trim(),
    ) ?? {
      id: Number.MAX_SAFE_INTEGER,
      nama_negara: offer.partnerName,
      region: COUNTRIES_DATA.find(
        country => country.country.toLowerCase().trim() === offer.partnerName.toLowerCase().trim(),
      )?.continent || "Internasional",
      status_hubungan: "Aktif",
    };

    setActiveTradePartner(partner);
    setActiveOfferProduct(offer.productKey);
    setActiveArmsOffer(offer);
    setIsArmsOfferOpen(false);
    if (isBuying) {
      setIsConfirmBeliOpen(true);
    } else {
      setIsJualOpen(true);
    }
  };

  const handleAcceptOffer = (offer: PartnerOffer) => {
    if (offer.marketType === "arms") {
      handleOpenArmsOffer(offer);
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
      setIsOfferOpen(false);
      setIsConfirmBeliOpen(true);
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
    const list: TradePriceBonus[] = [];

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
      {/* 🔥 Sembunyikan Modal Utama saat Modal Info terbuka */}
      {!showBlockedInfoModal && !showWTOTradeInfoModal && (
        <NotebookModalWrapper onClose={onClose}>
          <div className="flex flex-col h-full overflow-hidden">

            {/* HEADER */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-root-surface rounded-lg border border-root-accent/30 shrink-0">
                  <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className={rootModalTypography.title}>Pasar Perdagangan Global</h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isTradeMarketBlocked && (
                  <button
                    type="button"
                    onClick={() => setShowWTOTradeInfoModal(true)}
                    title="Lihat Informasi Efek Harga WTO & Agama"
                    aria-label="Informasi efek harga perdagangan"
                    className="p-1 rounded-full bg-root-canvas border border-root-accent/50 text-root-accent hover:bg-root-accent hover:text-root-canvas transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                )}
                {isTradeMarketBlocked && (
                  <button
                    type="button"
                    onClick={() => setShowBlockedInfoModal(true)}
                    title="Informasi Blokir Pasar"
                    className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs uppercase flex items-center justify-center shadow-sm"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                )}

                <RootModalCloseButton onClick={onClose} />
              </div>
            </div>

            <div className={`min-h-0 flex-1 bg-root-canvas/80 relative z-10 neon-scrollbar [overflow-anchor:none] ${isTradeMarketBlocked ? "overflow-hidden p-2 sm:p-3" : "overflow-y-auto p-3.5 lg:p-5 2xl:p-8"}`}>
              {isTradeMarketBlocked ? (
                <div className="flex h-full flex-col items-center justify-center rounded-xl border border-rose-500/30 bg-rose-950/20 p-1.5 text-center sm:p-2">
                  <AlertTriangle className="mb-1 h-6 w-6 text-rose-400 sm:h-7 sm:w-7" />
                  <h3 className="mb-1.5 text-sm font-black uppercase text-rose-400 sm:text-base">
                    Perdagangan Diblokir
                  </h3>
                  
                  <div className="mb-1.5 grid w-full max-w-lg grid-cols-2 gap-1">
                    <div className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-rose-500/20 bg-root-canvas px-1.5 py-1 text-left">
                      <span className="text-[7px] font-semibold text-[#DCEAEA] sm:text-[8px]">Sentralisasi</span>
                      <strong className="shrink-0 text-[9px] text-rose-300 sm:text-[10px]">{tradeAccess.centralizationScore.toFixed(1)}</strong>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-rose-500/20 bg-root-canvas px-1.5 py-1 text-left">
                      <span className="text-[7px] font-semibold text-[#DCEAEA] sm:text-[8px]">Nasionalisasi</span>
                      <strong className="shrink-0 text-[9px] text-[#F3F7F7] sm:text-[10px]">{tradeAccess.averageNationalization.toFixed(1)}%</strong>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-rose-500/20 bg-root-canvas px-1.5 py-1 text-left">
                      <span className="text-[7px] font-semibold text-[#DCEAEA] sm:text-[8px]">Ideologi</span>
                      <strong className="shrink-0 text-[9px] text-[#F3F7F7] sm:text-[10px]">×{tradeAccess.ideologyModifier.toFixed(2)}</strong>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-rose-500/20 bg-root-canvas px-1.5 py-1 text-left">
                      <span className="text-[7px] font-semibold text-[#DCEAEA] sm:text-[8px]">Agama</span>
                      <strong className="shrink-0 text-[9px] text-[#F3F7F7] sm:text-[10px]">×{tradeAccess.religionModifier.toFixed(2)}</strong>
                    </div>
                  </div>
                  <p className="text-[9px] font-medium text-[#DCEAEA] sm:text-[10px]">
                    Batas akses: skor sentralisasi di bawah 85.
                  </p>
                </div>
              ) : (
                <>
                  {tradeAccess.status === "waspada" && (
                    <p className="mb-3 min-w-0 break-words rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] font-bold text-amber-300">
                      Sentralisasi tinggi. Tarif impor: +{Math.round(tradeAccess.importTariffModifier * 100)}%. Skor: {tradeAccess.centralizationScore.toFixed(1)}.
                    </p>
                  )}
                  {tradeAccess.status === "dibatasi" && (
                    <p className="mb-3 min-w-0 break-words rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-[11px] font-bold text-orange-300">
                      Impor diblokir. Tarif ekspor: +{Math.round(tradeAccess.exportTariffModifier * 100)}%. Skor: {tradeAccess.centralizationScore.toFixed(1)}.
                    </p>
                  )}
                  {isCountryUnderEconomicEmbargo(countryName) && (
                    <p className="mb-3 min-w-0 break-words rounded-lg border border-rose-500/40 bg-rose-950/40 px-3 py-2 text-[11px] font-bold text-rose-300">
                      Embargo ekonomi PBB aktif. Perdagangan internasional diblokir.
                    </p>
                  )}

                  <div className="mb-3 flex w-full flex-nowrap items-stretch justify-between gap-1 px-[5px]">
                    <button
                      type="button"
                      onClick={() => setIsMitraOpen(true)}
                      className="min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center text-root-accent bg-root-surface border-root-accent/30 hover:bg-root-accent hover:text-root-canvas cursor-pointer sm:w-[80px] sm:text-[11px] lg:w-[110px]"
                    >
                      Mitra
                    </button>
                    <button
                      onClick={() => openJualModals()}
                      disabled={!tradeAccess.canSell}
                      className={`min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center sm:w-[80px] sm:text-[11px] lg:w-[110px] ${tradeAccess.canSell ? "bg-root-surface border-root-accent/30 hover:bg-root-accent hover:text-root-canvas text-root-accent cursor-pointer" : "bg-rose-950/30 border-rose-500/30 text-rose-300 cursor-not-allowed"}`}
                    >
                      Jual
                    </button>
                    <button
                      onClick={handleOpenGlobalBuy}
                      disabled={!tradeAccess.canBuy}
                      className={`min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center sm:w-[80px] sm:text-[11px] lg:w-[110px] ${tradeAccess.canBuy ? "bg-root-surface border-root-accent/30 hover:bg-root-accent hover:text-root-canvas text-root-accent cursor-pointer" : "bg-orange-950/30 border-orange-500/30 text-orange-300 cursor-not-allowed"}`}
                    >
                      Beli
                    </button>
                    <button
                      onClick={() => openJualModals()}
                      disabled={!tradeAccess.canSell}
                      className={`min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center sm:w-[80px] sm:text-[11px] lg:w-[110px] ${tradeAccess.canSell ? "bg-root-surface border-root-accent/30 hover:bg-root-accent hover:text-root-canvas text-root-accent cursor-pointer" : "bg-rose-950/30 border-rose-500/30 text-rose-300 cursor-not-allowed"}`}
                    >
                      Jual Semua
                    </button>
                    <button
                      onClick={() => { setIsOfferOpen(!isOfferOpen); setIsArmsOfferOpen(false); }}
                      className={`min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center sm:w-[80px] sm:text-[11px] lg:w-[110px] cursor-pointer ${isOfferOpen ? 'bg-root-accent text-root-canvas border-root-accent' : 'bg-root-surface border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas'}`}
                    >
                      Tawaran
                    </button>
                    <button
                      onClick={() => { setIsArmsOfferOpen(!isArmsOfferOpen); setIsOfferOpen(false); }}
                      className={`min-h-0 w-[48px] flex-none whitespace-nowrap rounded-md border px-1 py-1 text-center text-[8px] font-bold uppercase leading-tight tracking-normal transition-all flex items-center justify-center sm:w-[80px] sm:text-[11px] lg:w-[110px] cursor-pointer ${isArmsOfferOpen ? 'bg-root-accent text-root-canvas border-root-accent' : 'bg-root-surface border-root-accent/30 text-root-accent hover:bg-root-accent hover:text-root-canvas'}`}
                    >
                      Alutsista
                    </button>
                  </div>

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

                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-[10px] font-black text-root-accent uppercase tracking-widest">Riwayat 90 Hari</h3>
                    <div className="inline-flex rounded-md overflow-hidden border border-root-accent/30">
                      <button onClick={() => setHistoryFilter(effectiveFilter === "jual" ? "semua" : "jual")} className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${effectiveFilter === "jual" ? "bg-rose-600 text-white" : "bg-root-canvas text-rose-400 hover:bg-rose-950/40"}`}>Jual</button>
                      <button onClick={() => setHistoryFilter(effectiveFilter === "beli" ? "semua" : "beli")} className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${effectiveFilter === "beli" ? "bg-emerald-600 text-white" : "bg-root-canvas text-emerald-400 hover:bg-emerald-950/40"}`}>Beli</button>
                    </div>
                  </div>

                  <div className="border border-root-accent/20 rounded-lg overflow-hidden bg-root-surface">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-root-canvas border-b border-root-accent/20">
                          <th className="px-2 py-1.5 text-[9px] font-black text-root-accent uppercase tracking-wider">Tanggal</th>
                          <th className="px-2 py-1.5 text-[9px] font-black text-root-accent uppercase tracking-wider">Tipe</th>
                          <th className="px-2 py-1.5 text-[9px] font-black text-root-accent uppercase tracking-wider">Kuantitas</th>
                          <th className="px-2 py-1.5 text-[9px] font-black text-root-accent uppercase tracking-wider">Biaya</th>
                          <th className="px-2 py-1.5 text-[9px] font-black text-root-accent uppercase tracking-wider">Negara</th>
                        </tr>
                      </thead>
                      <tbody className="bg-root-surface divide-y divide-root-accent/10">
                        {filteredHistory.length === 0 ? (
                          <tr><td colSpan={5} className="px-2 py-4 text-center text-[11px] text-root-subtle font-semibold">Belum ada riwayat.</td></tr>
                        ) : (
                          filteredHistory.map((item, idx) => (
                            <tr key={idx} className="hover:bg-root-accent/5 transition-colors">
                              <td className="px-2 py-1.5 text-[10px] font-semibold text-root-text">{item.tanggal}</td>
                              <td className="px-2 py-1.5 text-[10px] font-bold uppercase"><span className={item.tipe === "jual" ? "text-rose-400" : "text-emerald-400"}>{item.tipe}</span></td>
                              <td className="px-2 py-1.5 text-[10px] font-semibold text-root-text">{item.kuantitas}</td>
                              <td className="px-2 py-1.5 text-[10px] font-bold text-root-accent">{item.tipe === "jual" ? "+" : "-"} {item.biaya.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td>
                              <td className="px-2 py-1.5 text-[10px] font-semibold text-root-text">{item.negara}</td>
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
      )}

      <TradeMarketBlockedModal
        isOpen={showBlockedInfoModal}
        onClose={() => setShowBlockedInfoModal(false)}
      />

      <ModalsKonfirmasiBeli
        key={`buy-${activeArmsOffer?.id ?? "manual"}`}
        isOpen={isConfirmBeliOpen && tradeAccess.canBuy && !isTradeMarketBlocked}
        onClose={() => {
          setIsConfirmBeliOpen(false);
          setActiveTradePartner(null);
          setActiveOfferProduct(undefined);
          setActiveArmsOffer(null);
          setActiveInboxOfferId(null);
        }}
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
        initialQuantity={activeArmsOffer?.quantity}
        prefetchedAllCountries={prefetchedAllCountries}
        partnerOffers={activeOffers}
        importTariffModifier={tradeAccess.importTariffModifier}
        canBuy={tradeAccess.canBuy}
      />

      <JualModalsMenu
        key={`sell-${activeArmsOffer?.id ?? "manual"}`}
        isOpen={isJualOpen && tradeAccess.canSell && !isTradeMarketBlocked}
        onClose={() => {
          setIsJualOpen(false);
          setActiveTradePartner(null);
          setActiveOfferProduct(undefined);
          setActiveArmsOffer(null);
        }}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        onConfirm={(biaya, kuantitas) => addHistoryEntry("jual", biaya, kuantitas)}
        currentDate={currentDate}
        partners={eligiblePartners}
        initialPartnerName={activeTradePartner?.nama_negara}
        initialProductKey={activeArmsOffer?.productKey}
        initialQuantity={activeArmsOffer?.quantity}
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
      <TradePriceEffectInfoModal
        isOpen={showWTOTradeInfoModal}
        onClose={() => setShowWTOTradeInfoModal(false)}
        bonuses={activeBonusesList}
      />
    </>
  );
}