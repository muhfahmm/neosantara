"use client"
import React, { useMemo, useState, useEffect } from "react";
import { X, ArrowRightLeft, Info } from "lucide-react";
import JualModalsMenu from "./jual/modalsKonfirmasiJual";
import MitraModalsMenu, { TradePartner } from "./mitra/mitraModalsMenu";
import ModalsKonfirmasiBeli from "./beli/modalsKonfirmasiBeli";
import { getTradeAgreementsForCountry } from '../../../../../../../../json/database_mitra_perdagangan/tradeAgreementRegistry';
import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import TawaranPembelianTable from "./tawaran_beli/TawaranPembelianTable";
import { fetchBuildingMetadata } from '@/lib/buildingMetadata';
import { calculateProductionIncrement, formatDate } from '@/app/logic/production_logic';
import { isCountryUnderEconomicEmbargo, isTradeEmbargoActive } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbWarSanctions';
import { isMemberOfWTO } from '@/app/page/bonus_logic';


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
  validUntil: Date;
}

const DEFAULT_PRICES: Record<string, number> = {
  uranium: 8000, batu_bara: 100, minyak_bumi: 150, gas_alam: 120, garam: 50,
  litium: 3000, logam_tanah_jarang: 5000, pabrik_semikonduktor: 4000, pabrik_mesin_mobil: 15000, pabrik_mesin_motor: 5000,
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
  "pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu",
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
  prefetchedAllCountries 
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

  // --- State untuk fitur Tawaran AI ---
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [partnerOffers, setPartnerOffers] = useState<PartnerOffer[]>([]);
  const [activeOfferProduct, setActiveOfferProduct] = useState<string | undefined>(undefined);

  // Fungsi trigger dari Mitra
  const openBeliModals = (partner: TradePartner) => {
    setActiveTradePartner(partner);
    setActiveOfferProduct(undefined);
    setIsMitraOpen(false);
    setIsConfirmBeliOpen(true);
  };

  const openJualModals = (partner: TradePartner) => {
    setActiveTradePartner(partner);
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

  useEffect(() => {
    const refreshEmbargoState = () => setPbbRevision(revision => revision + 1);
    window.addEventListener('pbb_active_resolutions_updated', refreshEmbargoState);
    return () => window.removeEventListener('pbb_active_resolutions_updated', refreshEmbargoState);
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
  const activeOffers = useMemo((): PartnerOffer[] => {
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
      if (activeOffers.length > 0) {
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
      const mergedOffers = [...activeOffers, ...newOffers];

      setCountryDetail(prev => ({
        ...prev,
        ai_trade_offers: mergedOffers,
        last_generated_week: currentWeekIndex
      }));
    }
  }, [isOpen, eligiblePartners, currentDate, prefetchedAllCountries, countryDetail, activeOffers, metadata, setCountryDetail]);

  // --- Fungsi Terima Tawaran ---
  const handleAcceptOffer = (offer: PartnerOffer) => {
    const targetPartner = eligiblePartners.find(p => p.nama_negara === offer.partnerName);
    if (targetPartner) {
      setActiveTradePartner(targetPartner);
      setActiveOfferProduct(offer.productKey);
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
  const isWTOActive = isMemberOfWTO(String(countryName));

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
        <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

          {/* HEADER */}
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Pasar Perdagangan Global</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowWTOTradeInfoModal(true)}
                title="Lihat Informasi Efek Harga WTO & Agama"
                className="p-1.5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/50 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer shadow-md flex items-center justify-center shrink-0 ml-1"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
              <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 lg:p-5 2xl:p-8 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar">
            <p className="text-[10px] lg:text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-3.5 lg:mb-5 2xl:mb-6">
              Kelola aktivitas jual dan beli komoditas nasional untuk mengoptimalkan pendapatan dan kebutuhan anggaran belanja negara.
            </p>
            {isCountryUnderEconomicEmbargo(countryName) && (
              <p className="mb-4 rounded-lg border border-rose-500/40 bg-rose-950/40 px-4 py-3 text-xs font-bold text-rose-300">
                Embargo ekonomi PBB sedang berlaku terhadap negara Anda. Aktivitas perdagangan internasional diblokir selama resolusi aktif.
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 lg:gap-2.5 mb-4 lg:mb-6">
              <button
                onClick={() => setIsMitraOpen(true)}
                className="px-2 py-2 lg:py-2.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px]"
              >
                Mitra
              </button>
              <button
                onClick={() => setIsJualOpen(true)}
                className="px-2 py-2 lg:py-2.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px]"
              >
                Jual
              </button>
              <button
                onClick={() => { setActiveTradePartner(null); setActiveOfferProduct(undefined); setIsConfirmBeliOpen(true); }}
                className="px-2 py-2 lg:py-2.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px]"
              >
                Beli
              </button>
              <button
                onClick={() => setIsJualOpen(true)}
                className="px-2 py-2 lg:py-2.5 rounded-lg bg-[#0F2424] border border-[#00FFAA]/30 hover:bg-[#00FFAA] hover:text-[#0A1A1A] text-[#00FFAA] text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px]"
              >
                Jual Semuanya
              </button>
              <button
                onClick={() => setIsOfferOpen(!isOfferOpen)}
                className={`px-2 py-2 lg:py-2.5 rounded-lg text-[10px] lg:text-[11px] xl:text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border flex items-center justify-center text-center leading-tight min-h-[38px] lg:min-h-[42px] ${isOfferOpen ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA]' : 'bg-[#0F2424] border-[#00FFAA]/30 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A]'}`}
              >
                Tawaran Pembelian
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
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-bold text-[#00FFAA]">{item.tipe === "jual" ? "+" : "-"} {item.biaya.toLocaleString("id-ID")} NEO</td>
                        <td className="px-3 lg:px-4 py-2 lg:py-3 text-[11px] lg:text-xs font-semibold text-[#E0E0E0]">{item.negara}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ModalsKonfirmasiBeli
        isOpen={isConfirmBeliOpen}
        onClose={() => { setIsConfirmBeliOpen(false); setActiveTradePartner(null); setActiveOfferProduct(undefined); }}
        countryDetail={countryDetail}
        setCountryDetail={setCountryDetail}
        onConfirm={(biaya, kuantitas) => addHistoryEntry("beli", biaya, kuantitas)}
        partners={eligiblePartners}
        currentDate={currentDate}
        initialPartnerName={activeTradePartner?.nama_negara}
        initialProductKey={activeOfferProduct}
        prefetchedAllCountries={prefetchedAllCountries}
        partnerOffers={activeOffers}
      />

      <JualModalsMenu 
        isOpen={isJualOpen} 
        onClose={() => { setIsJualOpen(false); setActiveTradePartner(null); }} 
        countryDetail={countryDetail} 
        setCountryDetail={setCountryDetail} 
        onConfirm={(biaya, kuantitas) => addHistoryEntry("jual", biaya, kuantitas)} 
        currentDate={currentDate}
        partners={eligiblePartners}
        initialPartnerName={activeTradePartner?.nama_negara}
        prefetchedAllCountries={prefetchedAllCountries}
      />

      <MitraModalsMenu 
        isOpen={isMitraOpen} 
        onClose={() => setIsMitraOpen(false)} 
        partners={eligiblePartners}
        onOpenBeli={openBeliModals}
        onOpenJual={openJualModals}
        onRemovePartner={handleRemovePartner}
        currentUserCountry={countryName}
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
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0F2424] custom-scrollbar space-y-6">
              {/* Card Status Keanggotaan WTO */}
              <div className={`p-5 rounded-2xl border ${
                isWTOActive
                  ? 'bg-[#0E2A20] border-emerald-500/50 text-emerald-300'
                  : 'bg-[#0A1A1A] border-[#00FFAA]/20 text-[#C3D5D5]'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#00FFAA]">
                    Keanggotaan Organisasi Perdagangan Dunia (WTO)
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isWTOActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}>
                    {isWTOActive ? 'Aktif (Anggota WTO)' : 'Tidak Aktif'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-[#C3D5D5]">
                  {isWTOActive ? (
                    <span>
                      ✅ Sebagai anggota resmi WTO, negara Anda mendapatkan keuntungan insentif harga perdagangan global:
                      <br /><strong className="text-emerald-400">• Harga Jual Komoditas: +15%</strong> (Pendapatan ekspor lebih tinggi)
                      <br /><strong className="text-emerald-400">• Harga Beli Komoditas: -10%</strong> (Penghematan belanja impor)
                    </span>
                  ) : (
                    <span>
                      ⚠️ Negara Anda saat ini <strong className="text-rose-400">bukan anggota WTO</strong>. Harga jual dan beli di Pasar Perdagangan Global berlaku tarif standar normal (tanpa diskon impor atau bonus ekspor).
                    </span>
                  )}
                </p>
              </div>

              {/* Rincian Aturan Efek Harga */}
              <div className="p-5 rounded-2xl bg-[#0A1A1A] border border-[#00FFAA]/30 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#00FFAA]">
                  Panduan Pengaruh Organisasi & Kebijakan Terhadap Harga
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20 space-y-2">
                    <p className="font-extrabold text-[#00FFAA] uppercase">1. Pengaruh WTO (Pasar Bebas)</p>
                    <p className="text-[#C3D5D5] leading-relaxed">
                      • <strong className="text-[#00FFAA]">Harga Jual (+15%):</strong> Menaikkan hasil keuntungan penjualan komoditas ekspor nasional ke pasar internasional.
                      <br />• <strong className="text-[#00FFAA]">Harga Beli (-10%):</strong> Memotong beban biaya impor komoditas dari mitra dagang dunia.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0F2424] border border-[#00FFAA]/20 space-y-2">
                    <p className="font-extrabold text-[#00FFAA] uppercase">2. Pengaruh Kebijakan Nasional / Agama</p>
                    <p className="text-[#C3D5D5] leading-relaxed">
                      • <strong className="text-[#00FFAA]">Bonus Produksi & Perdagangan:</strong> Agama dan ideologi tertentu memberikan bonus pengganda produksi yang mempengaruhi total ketersediaan stok perdagangan nasional.
                    </p>
                  </div>
                </div>
              </div>
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