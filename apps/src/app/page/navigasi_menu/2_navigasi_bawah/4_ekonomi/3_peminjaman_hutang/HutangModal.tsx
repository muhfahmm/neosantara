"use client"
import React, { useState, useEffect, useRef } from "react";
import { X, CreditCard, ArrowRight, AlertCircle } from "lucide-react";
import { COUNTRIES_DATA } from "../../../../map_system/map-data";

// 🔥 IMPOR TAB TERPISAH
import NegaraLain from "./tab_menu/1_negara_lain";
import LembagaDunia from "./tab_menu/2_lembaga_dunia";
import Riwayat from "./tab_menu/3_riwayat";

// 🔥 IMPOR UTILITAS TAB
import { LoanRecord, renderFlag } from "./tab_menu/utils";
import { processDueLoans } from "./tab_menu/logic/loanRepaymentLogic";

// 🔥 IMPOR MODAL KONFIRMASI PINJAMAN
import KonfirmasiPinjamanModalNegaraLain from "./tab_menu/1_negara_lain/konfirmasiPinjamanModals";
import KonfirmasiPinjamanModalLembagaDunia from "./tab_menu/2_lembaga_dunia/konfirmasiPinjamanModals";
import KonfirmasiPinjamanModalRiwayat from "./tab_menu/3_riwayat/modals_menu/konfirmasiPinjamanModals";

// 🔥 IMPOR MODAL BAYAR HUTANG
import BayarHutangModal from "./tab_menu/3_riwayat/modals_menu/BayarHutangModal";
import PenaltyInfoModal from "./tab_menu/3_riwayat/modals_menu/PenaltyInfoModal";
import GeneralPenaltyModal from "./tab_menu/3_riwayat/modals_menu/GeneralPenaltyModal";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryDetail: any;
  setCountryDetail: (detail: any) => void;
  currentDate?: Date;
  resetTrigger?: boolean;
}

const LOAN_STORAGE_KEY = "hutangModalLoanSources";
const LOAN_STORAGE_REFRESH_KEY = "hutangModalLoanSourcesLastRefresh";
const LOAN_TERMS = [90, 120, 180, 240, 360];
const MIN_INTEREST = 2.0;
const MAX_INTEREST = 7.5;
const MIN_LOAN = 10_000;
const MAX_LOAN = 100_000;
const LOAN_STEP = 5_000;
const RANDOM_LOAN_COUNT = 10;

const getFlagEmoji = (iso: string) => {
  const cleaned = String(iso || "").trim().toUpperCase().replace(/[^A-Z]/g, "");
  if (cleaned.length !== 2) return null;
  const codePoints = cleaned.split("").map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const formatCountryName = (name: string) => {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const randomInterest = () => Number((MIN_INTEREST + Math.random() * (MAX_INTEREST - MIN_INTEREST)).toFixed(1));
const randomLoan = () => Math.floor(Math.random() * ((MAX_LOAN - MIN_LOAN) / LOAN_STEP + 1)) * LOAN_STEP + MIN_LOAN;
const randomTerm = () => LOAN_TERMS[Math.floor(Math.random() * LOAN_TERMS.length)];

const shuffleArray = (array: any[]) => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const generateLoanSources = () => {
  const validCountries = COUNTRIES_DATA.filter((country) => country.country && country.iso && country.iso.length === 2);

  const loanSources = validCountries.map((country, index) => ({
    id: country.id ?? index,
    name: formatCountryName(country.country),
    iso: country.iso.toLowerCase(),
    flag: getFlagEmoji(country.iso || country.iso?.toString()),
    interest: randomInterest(),
    maxLoan: randomLoan(),
    term: randomTerm(),
  }));

  return shuffleArray(loanSources).slice(0, RANDOM_LOAN_COUNT);
};

// Lembaga Multilateral
// 🔥 DEFINISIKAN TIPE DATA PINJAMAN

export default function HutangModal({ isOpen, onClose, countryDetail, setCountryDetail, currentDate, resetTrigger }: ModalProps) {
  const [activeTab, setActiveTab] = useState<"bilateral" | "multilateral" | "history">("bilateral");
  const [loanSources, setLoanSources] = useState<any[]>([]);
  const initialLoanLoadRef = useRef(true);

  // State untuk menampung data pinjaman yang diklik sebelum konfirmasi
  const [pendingLoan, setPendingLoan] = useState<any>(null);

  // 🔥 STATE BARU: Untuk modal pembayaran manual
  const [pendingPaymentLoan, setPendingPaymentLoan] = useState<LoanRecord | null>(null);
  // STATE: untuk menampilkan detail denda
  const [penaltyInfoLoan, setPenaltyInfoLoan] = useState<LoanRecord | null>(null);
  // STATE: general penalty modal open from header
  const [isGeneralPenaltyOpen, setIsGeneralPenaltyOpen] = useState(false);

  const parseIdDate = (dateString: string) => {
    const parts = String(dateString).split("/").map((part) => Number(part));
    if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
      return new Date(dateString);
    }
    const [day, month, year] = parts;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  };

  const formatIdDate = (date: Date) => {
    return date.toLocaleDateString("id-ID");
  };

  const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  useEffect(() => {
    if (!isOpen || !currentDate || !countryDetail) return;

    const riwayatPinjaman: LoanRecord[] = Array.isArray(countryDetail?.pinjamanList) ? countryDetail.pinjamanList : [];
    if (riwayatPinjaman.length === 0) return;

    const initialCash = Number(countryDetail.anggaran) || 0;

    // Urutkan hutang berdasarkan tanggal jatuh tempo paling dekat
    const sortedLoans = [...riwayatPinjaman].sort((a, b) => {
      const dateA = parseIdDate(a.returnDate);
      const dateB = parseIdDate(b.returnDate);
      return dateA.getTime() - dateB.getTime();
    });

    const { nextLoanList, availableCash, updatedTotalHutang, updated } = processDueLoans(
      sortedLoans,
      currentDate instanceof Date ? new Date(currentDate) : new Date(currentDate),
      initialCash
    );

    if (!updated) return;

    setCountryDetail({
      ...countryDetail,
      anggaran: Math.max(0, availableCash),
      totalHutang: Math.max(0, updatedTotalHutang),
      pinjamanList: nextLoanList,
    });
  }, [isOpen, currentDate, countryDetail, setCountryDetail]);

  // 🔥 FUNGSI BAYAR MANUAL SEBELUM JATUH TEMPO
  const handleManualPaymentConfirm = () => {
    if (!pendingPaymentLoan) return;

    const loan = pendingPaymentLoan;
    const paymentAmount = Math.min(kasNegara, loan.totalRepayment);

    // Hitung data baru
    const newPaidAmount = (loan.paidAmount || 0) + paymentAmount;
    const newTotalRepayment = loan.totalRepayment - paymentAmount;
    const newAnggaran = kasNegara - paymentAmount;

    let newPinjamanList = [...riwayatPinjaman];
    
    if (newTotalRepayment <= 0) {
      // 🔥 Jika lunas, jangan hapus. Ubah status jadi "Lunas" & set totalRepayment 0
      const index = newPinjamanList.findIndex((l: LoanRecord) => l.id === loan.id);
      if (index !== -1) {
        newPinjamanList[index] = {
          ...loan,
          status: "Lunas",
          paidAmount: newPaidAmount,
          totalRepayment: 0,
        };
      }
    } else {
      // 🔥 Jika bayar sebagian, update datanya
      const index = newPinjamanList.findIndex((l: LoanRecord) => l.id === loan.id);
      if (index !== -1) {
        newPinjamanList[index] = {
          ...loan,
          paidAmount: newPaidAmount,
          totalRepayment: newTotalRepayment,
        };
      }
    }

    // Total hutang baru (hanya dari pinjaman Aktif)
    const newTotalHutang = newPinjamanList
      .filter((l: LoanRecord) => l.status !== "Lunas")
      .reduce((sum, l) => sum + (l.totalRepayment || 0), 0);

    setCountryDetail({
      ...countryDetail,
      anggaran: Math.max(0, newAnggaran),
      totalHutang: Math.max(0, newTotalHutang),
      pinjamanList: newPinjamanList,
    });

    // Tutup modal
    setPendingPaymentLoan(null);
  };

  useEffect(() => {
    const loadLoanSources = () => {
      if (typeof window === "undefined") return;

      const isLoanSourceValid = (item: any) => {
        return (
          item &&
          typeof item.iso === "string" &&
          item.iso.length === 2 &&
          typeof item.flag === "string" &&
          item.flag.length > 0 &&
          typeof item.name === "string" &&
          typeof item.interest === "number" &&
          typeof item.maxLoan === "number" &&
          typeof item.term === "number"
        );
      };

      const enrichItemIso = (item: any) => {
        if (item && item.iso) return item;
        const matched = COUNTRIES_DATA.find(
          (c) => c.country && c.country.toLowerCase() === (item.name || "").toLowerCase()
        );
        return {
          ...item,
          iso: matched?.iso ? matched.iso.toLowerCase() : ""
        };
      };

      try {
        const storedSources = window.localStorage.getItem(LOAN_STORAGE_KEY);
        const storedRefresh = window.localStorage.getItem(LOAN_STORAGE_REFRESH_KEY);
        const now = currentDate instanceof Date ? currentDate : new Date();

        if (storedSources && storedRefresh) {
          const lastRefresh = new Date(storedRefresh);
          if (
            !Number.isNaN(lastRefresh.getTime()) &&
            lastRefresh.getFullYear() === now.getFullYear() &&
            lastRefresh.getMonth() === now.getMonth()
          ) {
            const parsedSources = JSON.parse(storedSources);
            if (Array.isArray(parsedSources) && parsedSources.length === RANDOM_LOAN_COUNT) {
              const enrichedSources = parsedSources.map(enrichItemIso);
              if (enrichedSources.every(isLoanSourceValid)) {
                setLoanSources(enrichedSources);
                window.localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(enrichedSources));
                return;
              }
            }
          }
        }
      } catch (err) {
        console.warn("Gagal memuat sumber pinjaman dari localStorage:", err);
      }

      const generatedSources = generateLoanSources();
      setLoanSources(generatedSources);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LOAN_STORAGE_KEY, JSON.stringify(generatedSources));
        window.localStorage.setItem(LOAN_STORAGE_REFRESH_KEY, (currentDate instanceof Date ? currentDate : new Date()).toISOString());
      }
    };

    loadLoanSources();
    initialLoanLoadRef.current = false;
  }, [resetTrigger, currentDate]);

  if (!isOpen) return null;

  const kasNegara = countryDetail?.anggaran || 0;
  const totalHutang = countryDetail?.totalHutang || 0;
  const riwayatPinjaman: LoanRecord[] = Array.isArray(countryDetail?.pinjamanList) ? countryDetail.pinjamanList : [];

  const simulatedGDP = 500_000; 
  const debtRatio = Math.min(100, Math.round((totalHutang / simulatedGDP) * 100));

  // Logika Peminjaman
  const confirmBorrow = () => {
    if (!pendingLoan) return;
    const source = pendingLoan;
    const now = currentDate instanceof Date ? new Date(currentDate) : new Date();
    const isMultilateral = source.type === "multilateral";

    const borrowAmount = isMultilateral ? Number(source.requestedAmount || source.maxLoan) : source.maxLoan;
    const borrowTerm = isMultilateral ? Number(source.requestedTerm || source.term) : source.term;
    const totalYangHarusDibayar = borrowAmount + borrowAmount * (source.interest / 100);
    const returnDate = formatIdDate(addDays(now, borrowTerm));

    const newLoanRecord: LoanRecord = {
      id: Date.now(),
      source: source.name,
      iso: source.iso || null,
      amount: borrowAmount,
      interest: source.interest,
      term: borrowTerm,
      type: isMultilateral ? "multilateral" : "bilateral",
      status: "Aktif",
      totalRepayment: totalYangHarusDibayar,
      paidAmount: 0,
      accumulatedPenalty: 0,
      missedMonths: 0,
      date: formatIdDate(now),
      returnDate: returnDate,
    };

    const nextCooldowns = {
      ...(countryDetail?.loanCooldowns || {}),
      ...(isMultilateral ? { [source.id]: now.toISOString() } : {}),
    };

    setCountryDetail({
      ...countryDetail,
      anggaran: kasNegara + borrowAmount,
      totalHutang: totalHutang + totalYangHarusDibayar,
      pinjamanList: [newLoanRecord, ...riwayatPinjaman],
      loanCooldowns: nextCooldowns,
    });

    setPendingLoan(null);
  };

  const cancelBorrow = () => setPendingLoan(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
        
        {/* Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />

        {/* Header */}
        <div className="px-8 py-6 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                <CreditCard className="h-6 w-6 text-[#5c3c10]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#5c3c10] tracking-tight leading-none uppercase">Pinjaman & Hutang</h2>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#FAF6EE]/40 relative z-10 no-scrollbar">
          
          {/* Section 1: Peringatan dan Monitoring Ekonomi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="col-span-2 bg-gradient-to-br from-[#e4dac3]/30 to-[#C4B49C]/20 border-2 border-[#C4B49C]/40 p-5 rounded-2xl shadow-sm">
              <h4 className="text-[10px] text-[#8b7e66] font-black uppercase tracking-wider mb-2">Rasio Hutang terhadap PDB</h4>
              <div className="flex justify-between items-end mb-3">
                <span className="text-3xl font-black text-[#5c3c10]">{debtRatio}%</span>
                <span className="text-xs font-bold text-[#8b7e66]">Batas Aman: 60%</span>
              </div>
              <div className="h-3 bg-[#C4B49C]/30 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    debtRatio > 80 ? "bg-red-600" : debtRatio > 60 ? "bg-amber-600" : "bg-emerald-600"
                  }`}
                  style={{ width: `${debtRatio}%` }}
                />
              </div>
            </div>

            <div className="bg-[#e4dac3]/20 border border-[#C4B49C]/30 p-5 rounded-2xl shadow-sm flex flex-col justify-center">
              <div className="flex justify-between text-sm font-bold text-[#5c3c10] py-1 border-b border-[#C4B49C]/20">
                <span>Kas Negara</span>
                <span className="text-emerald-700">{kasNegara.toLocaleString("id-ID")} EM</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#5c3c10] py-1 mt-2">
                <span>Total Beban Hutang</span>
                <span className="text-red-700">{totalHutang.toLocaleString("id-ID")} EM</span>
              </div>
            </div>
          </div>

          {/* Section 2: Tabs Peminjaman */}
          <div className="bg-[#e4dac3]/40 p-1.5 rounded-xl border border-[#C4B49C]/40 inline-flex mb-6 shadow-sm">
            <button
              onClick={() => setActiveTab("bilateral")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "bilateral" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"
              }`}
            >Negara Lain</button>
            <button
              onClick={() => setActiveTab("multilateral")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "multilateral" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"
              }`}
            >Lembaga Dunia</button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "history" ? "bg-[#5c3c10] text-[#FAF6EE] shadow-md shadow-[#5c3c10]/20" : "text-[#8b7e66] hover:text-[#5c3c10]"
              }`}
            >Riwayat</button>
          </div>

          {/* Section 3: Content based on Tab */}
          {activeTab === "bilateral" && (
            <NegaraLain
              loanSources={loanSources}
              renderFlag={renderFlag}
              setPendingLoan={setPendingLoan}
            />
          )}

          {activeTab === "multilateral" && (
            <LembagaDunia
              setPendingLoan={setPendingLoan}
              loanCooldowns={countryDetail?.loanCooldowns}
              currentDate={currentDate}
            />
          )}
          {activeTab === "history" && (
            <Riwayat
              loanHistory={riwayatPinjaman}
              kasNegara={kasNegara}
              setPendingPaymentLoan={setPendingPaymentLoan}
              // supply setter so Riwayat can open penalty info modal
              setPenaltyInfoLoan={setPenaltyInfoLoan}
              setGeneralPenaltyOpen={setIsGeneralPenaltyOpen}
            />
          )}
          {activeTab !== "multilateral" && (
            <></>
          )}

        </div>

        {/* 🔥 RENDER MODAL BAYAR HUTANG */}
        {pendingPaymentLoan && (
          <BayarHutangModal
            isOpen={!!pendingPaymentLoan}
            onClose={() => setPendingPaymentLoan(null)}
            onConfirm={handleManualPaymentConfirm}
            loanSource={pendingPaymentLoan.source}
            paymentAmount={Math.min(kasNegara, pendingPaymentLoan.totalRepayment)}
            currentMoney={kasNegara}
            iso={pendingPaymentLoan.iso} 
          />
        )}

        {/* Penalty info modal */}
        <PenaltyInfoModal
          isOpen={!!penaltyInfoLoan}
          onClose={() => setPenaltyInfoLoan(null)}
          loan={penaltyInfoLoan}
        />

        {/* General penalty explanation modal (header info) */}
        <GeneralPenaltyModal
          isOpen={isGeneralPenaltyOpen}
          onClose={() => setIsGeneralPenaltyOpen(false)}
        />

        {/* Modal Konfirmasi Peminjaman Baru */}
        {pendingLoan && activeTab === "bilateral" && (
          <KonfirmasiPinjamanModalNegaraLain
            isOpen={!!pendingLoan}
            onClose={cancelBorrow}
            onConfirm={confirmBorrow}
            loanSource={pendingLoan.name}
            iso={pendingLoan.iso}
            maxLoan={pendingLoan.maxLoan}
            interest={pendingLoan.interest}
            term={pendingLoan.term}
            totalPayment={pendingLoan.maxLoan + (pendingLoan.maxLoan * (pendingLoan.interest / 100))}
            currentMoney={kasNegara}
          />
        )}

        {pendingLoan && activeTab === "multilateral" && (
          <KonfirmasiPinjamanModalLembagaDunia
            isOpen={!!pendingLoan}
            onClose={cancelBorrow}
            onConfirm={confirmBorrow}
            loanSource={pendingLoan.name}
            iso={pendingLoan.iso}
            maxLoan={pendingLoan.maxLoan}
            interest={pendingLoan.interest}
            term={pendingLoan.term}
            totalPayment={pendingLoan.maxLoan + (pendingLoan.maxLoan * (pendingLoan.interest / 100))}
            currentMoney={kasNegara}
          />
        )}

        {pendingLoan && activeTab === "history" && (
          <KonfirmasiPinjamanModalRiwayat
            isOpen={!!pendingLoan}
            onClose={cancelBorrow}
            onConfirm={confirmBorrow}
            loanSource={pendingLoan.name}
            iso={pendingLoan.iso}
            maxLoan={pendingLoan.maxLoan}
            interest={pendingLoan.interest}
            term={pendingLoan.term}
            totalPayment={pendingLoan.maxLoan + (pendingLoan.maxLoan * (pendingLoan.interest / 100))}
            currentMoney={kasNegara}
          />
        )}

      </div>
    </div>
  );
}