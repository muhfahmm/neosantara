'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Gem,
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ShieldCheck,
  Crown,
  Info,
} from 'lucide-react';

// =====================================================================
// DATA PAKET
// =====================================================================
export interface TopUpPackage {
  id: string;
  diamondAmount: number;
  bonusMultiplier: number;
  vipPoints: number;
  priceRupiah: number;
  label?: string;
  popular?: boolean;
  bestValue?: boolean;
  tier: 'starter' | 'standard' | 'elite' | 'sovereign';
  gemTier: 'small' | 'medium' | 'large' | 'chest' | 'chest_double' | 'vault';
}

export const TOP_UP_PACKAGES: TopUpPackage[] = [
  {
    id: 'pack_600',
    diamondAmount: 600,
    bonusMultiplier: 2,
    vipPoints: 100,
    priceRupiah: 15999,
    tier: 'starter',
    gemTier: 'small',
  },
  {
    id: 'pack_3940',
    diamondAmount: 3940,
    bonusMultiplier: 2,
    vipPoints: 500,
    priceRupiah: 79999,
    tier: 'standard',
    gemTier: 'medium',
  },
  {
    id: 'pack_8250',
    diamondAmount: 8250,
    bonusMultiplier: 2,
    vipPoints: 1000,
    priceRupiah: 159000,
    popular: true,
    tier: 'standard',
    gemTier: 'large',
  },
  {
    id: 'pack_17250',
    diamondAmount: 17250,
    bonusMultiplier: 2,
    vipPoints: 2000,
    priceRupiah: 329000,
    bestValue: true,
    tier: 'elite',
    gemTier: 'chest',
  },
  {
    id: 'pack_45000',
    diamondAmount: 45000,
    bonusMultiplier: 2,
    vipPoints: 5000,
    priceRupiah: 790000,
    tier: 'elite',
    gemTier: 'chest_double',
  },
  {
    id: 'pack_93750',
    diamondAmount: 93750,
    bonusMultiplier: 2,
    vipPoints: 10000,
    priceRupiah: 1590000,
    tier: 'sovereign',
    gemTier: 'vault',
  },
];

export interface SubscriptionPlan {
  id: string;
  dailyDiamonds: number;
  daysCount: number;
  vipPoints: number;
  priceRupiah: number;
  period: 'minggu' | 'bulan';
}

export const SUBSCRIPTION_PLAN: SubscriptionPlan = {
  id: 'sub_weekly',
  dailyDiamonds: 600,
  daysCount: 7,
  vipPoints: 200,
  priceRupiah: 29999,
  period: 'minggu',
};

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDiamonds: number;
  onTopUpSuccess: (addedDiamonds: number, packageName: string) => void;
  currentVipProgress?: number;
  currentVipMax?: number;
  currentVipLevel?: number;
}

// =====================================================================
// VISUAL DIAMOND (Emoji based)
// =====================================================================
function DiamondVisual({ tier }: { tier: TopUpPackage['gemTier'] }) {
  const config: Record<TopUpPackage['gemTier'], { emoji: string }> = {
    small: { emoji: '💎' },
    medium: { emoji: '💎' },
    large: { emoji: '💎' },
    chest: { emoji: '📦' },
    chest_double: { emoji: '📦' },
    vault: { emoji: '🏦' },
  };

  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
      <span className="text-3xl sm:text-4xl drop-shadow-[0_2px_4px_rgba(255,50,50,0.4)]">
        {config[tier].emoji}
      </span>
    </div>
  );
}

// =====================================================================
// KOMPONEN UTAMA
// =====================================================================
export default function TopUpModal({
  isOpen,
  onClose,
  currentDiamonds,
  onTopUpSuccess,
  currentVipProgress = 200,
  currentVipMax = 1000,
  currentVipLevel = 0,
}: TopUpModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage>(TOP_UP_PACKAGES[2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; name: string } | null>(null);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const totalDiamonds = selectedPackage.diamondAmount * selectedPackage.bonusMultiplier;
  const vipPercent = Math.min(100, (currentVipProgress / currentVipMax) * 100);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTopUpSuccess(totalDiamonds, selectedPackage.id);
      setSuccessInfo({
        amount: totalDiamonds,
        name: `Paket ${selectedPackage.diamondAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Diamond`,
      });
    }, 1000);
  };

  const handleFinish = () => {
    setSuccessInfo(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl"
      >
        {/* ═══════════════ HEADER ═══════════════ */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0 text-[#00FFAA]">
              <Gem className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                Pusat Top Up Diamond
              </h2>
              <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5 hidden sm:block">
                Tingkatkan kedaulatan, percepat proyek, dan buka fasilitas eksklusif negara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#0F2424] border border-[#00FFAA]/40 px-2.5 sm:px-3 py-1 rounded-xl shadow-inner">
              <Gem className="w-3.5 h-3.5 text-[#00FFAA]" />
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black text-[#6B8A8A] uppercase tracking-wider leading-none">Saldo</span>
                <span className="text-xs sm:text-sm font-black text-[#00FFAA] leading-tight">
                  {currentDiamonds.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
            >
              <span className="text-xs font-semibold uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════ BODY ═══════════════ */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar flex flex-col gap-5">
          {successInfo ? (
            /* SUCCESS STATE */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-10 my-auto">
              <div className="w-20 h-20 rounded-full bg-[#00FFAA]/10 border-2 border-[#00FFAA] flex items-center justify-center text-[#00FFAA] mb-4 shadow-[0_0_30px_rgba(0,255,170,0.3)]">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#00FFAA] uppercase tracking-wider mb-2">
                Top Up Berhasil!
              </h3>
              <p className="text-sm text-[#A0B0B0] max-w-md mb-4 font-medium">
                Transaksi pembelian <strong className="text-white">{successInfo.name}</strong> telah diverifikasi.
              </p>
              <div className="bg-[#0F2424] border border-[#00FFAA]/30 px-6 py-4 rounded-2xl flex items-center gap-3 mb-6">
                <Gem className="w-7 h-7 text-[#00FFAA]" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest block">Diamond Diterima</span>
                  <span className="text-2xl font-black text-[#00FFAA]">+{successInfo.amount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Diamond</span>
                </div>
              </div>
              <button
                onClick={handleFinish}
                className="px-8 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#00FFAA]/80 shadow-[0_0_20px_rgba(0,255,170,0.3)] cursor-pointer transition-all"
              >
                Selesai & Kembali ke Game
              </button>
            </div>
          ) : (
            <>
              {/* ═══════════════ VIP BANNER ═══════════════ */}
              <div className="relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-[#0F2424] via-[#0d2a28] to-[#0F2424] border border-[#00FFAA]/25 shrink-0">
                {/* VIP badge */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-amber-300/60 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                    <Crown className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">VIP</span>
                    <span className="text-sm font-black text-white leading-none">- {currentVipLevel}</span>
                  </div>
                </div>

                {/* VIP Progress bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#6B8A8A]">
                      {currentVipProgress.toLocaleString('id-ID', { maximumFractionDigits: 2 })} / {currentVipMax.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] font-bold text-[#00FFAA]">{vipPercent.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00FFAA] to-emerald-400 transition-all"
                      style={{ width: `${vipPercent}%` }}
                    />
                  </div>
                </div>

                {/* Promo text */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#00FFAA] animate-pulse" />
                  <span className="text-[10px] font-bold text-[#E0E0E0] whitespace-nowrap">
                    Gandakan bonus pada pembelian pertama Anda
                  </span>
                </div>
              </div>

              {/* ═══════════════ GRID PAKET + SUBSCRIPTION ═══════════════ */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                {/* Paket Grid (3 kolom × 2 baris) */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TOP_UP_PACKAGES.map((pkg) => {
                      const isSelected = selectedPackage.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg)}
                          className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[#00FFAA] shadow-[0_0_20px_rgba(0,255,170,0.3)]'
                              : 'border-[#00FFAA]/20 hover:border-[#00FFAA]/50'
                          }`}
                        >
                          {/* x2 BADGE */}
                          {pkg.bonusMultiplier > 1 && (
                            <div className="absolute top-0 right-0 z-10 bg-gradient-to-br from-rose-500 to-rose-700 text-white text-[10px] font-black px-2 py-0.5 rounded-bl-lg shadow-md border-l border-b border-rose-900">
                              x{pkg.bonusMultiplier}
                            </div>
                          )}

                          {/* POPULAR / BEST BADGES */}
                          {pkg.popular && (
                            <div className="absolute top-0 left-0 z-10 bg-[#00FFAA] text-[#0A1A1A] text-[9px] font-black px-2 py-0.5 rounded-br-lg shadow uppercase tracking-wider">
                              Most Popular
                            </div>
                          )}
                          {pkg.bestValue && (
                            <div className="absolute top-0 left-0 z-10 bg-amber-400 text-[#0A1A1A] text-[9px] font-black px-2 py-0.5 rounded-br-lg shadow uppercase tracking-wider">
                              Best
                            </div>
                          )}

                          {/* BAGIAN ATAS: GEM + AMOUNT */}
                          <div className="flex-1 bg-gradient-to-b from-[#F0E5CC] to-[#E5D4B0] p-3 pt-6 flex flex-col items-center justify-center gap-2 min-h-[130px]">
                            <DiamondVisual tier={pkg.gemTier} />

                            <div className="flex items-center gap-1 text-[#3D2911]">
                              <Gem className="w-3.5 h-3.5 text-rose-600 fill-rose-500" />
                              <span className="text-sm sm:text-base font-black">
                                {pkg.diamondAmount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>

                          {/* BAGIAN BAWAH: VIP POINTS + HARGA */}
                          <div className="bg-gradient-to-b from-[#3A6B7C] to-[#254B5A] p-2 flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1 text-white">
                              <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />
                              <span className="text-[10px] font-black">
                                +{pkg.vipPoints.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`w-full py-1.5 rounded-md text-[10px] sm:text-xs font-black transition-all border ${
                                isSelected
                                  ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-[#3D2911] border-amber-300 shadow-[0_2px_0_rgba(120,60,0,0.5)]'
                                  : 'bg-gradient-to-b from-amber-500 to-amber-700 text-white border-amber-800/50 group-hover:from-amber-400 group-hover:to-amber-600'
                              }`}
                            >
                              {pkg.priceRupiah.toLocaleString('id-ID', { maximumFractionDigits: 2 })}Rp
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subscription card */}
                <div className="lg:col-span-1">
                  <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border-2 border-[#00FFAA]/40 bg-gradient-to-b from-[#F0E5CC] to-[#E5D4B0]">
                    <div className="bg-[#254B5A] py-2 px-3 flex items-center justify-between">
                      <span className="text-[11px] font-black text-white uppercase tracking-wider">
                        Langganan
                      </span>
                      <button
                        onClick={() => setShowSubscriptionInfo(v => !v)}
                        className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                        title="Info langganan"
                      >
                        <Info className="w-3 h-3 text-white" />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-between p-3 gap-3 text-center">
                      <div className="flex items-center gap-1.5 text-[#3D2911] mt-2">
                        <Gem className="w-4 h-4 text-rose-600 fill-rose-500" />
                        <span className="text-base font-black">
                          {SUBSCRIPTION_PLAN.dailyDiamonds.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <p className="text-[9px] font-bold text-[#5C3C10] leading-snug">
                        Setiap hari karena masuk game {SUBSCRIPTION_PLAN.daysCount} hari
                      </p>

                      <div className="text-4xl my-1">🎁</div>

                      <p className="text-[8px] text-[#6B4A20] font-semibold leading-tight px-1">
                        Langganan akan diperpanjang otomatis. Batalkan kapan saja di Google Play.
                      </p>

                      <div className="flex items-center gap-1 text-[#3D2911]">
                        <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                        <span className="text-[11px] font-black">
                          +{SUBSCRIPTION_PLAN.vipPoints.toLocaleString('id-ID', { maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="w-full py-2 rounded-md text-[10px] sm:text-xs font-black bg-gradient-to-b from-amber-400 to-amber-600 text-[#3D2911] border border-amber-300 shadow-[0_2px_0_rgba(120,60,0,0.5)] hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer"
                      >
                        {SUBSCRIPTION_PLAN.priceRupiah.toLocaleString('id-ID', { maximumFractionDigits: 2 })}Rp/{SUBSCRIPTION_PLAN.period}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══════════════ RINGKASAN & TOMBOL BAYAR ═══════════════ */}
              <div className="mt-auto pt-4 border-t border-[#00FFAA]/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F2424]/50 p-4 rounded-2xl border border-[#00FFAA]/30">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 text-[#00FFAA] shrink-0">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider block">
                      Ringkasan Pembelian
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-black text-white">
                        {totalDiamonds.toLocaleString('id-ID', { maximumFractionDigits: 2 })} Diamonds
                      </span>
                      <span className="text-xs text-[#00FFAA] font-bold">
                        (Rp {selectedPackage.priceRupiah.toLocaleString('id-ID', { maximumFractionDigits: 2 })})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessing}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/90 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,170,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0A1A1A] border-t-transparent rounded-full animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-[#0A1A1A]" />
                        <span>Bayar Sekarang (Rp {selectedPackage.priceRupiah.toLocaleString('id-ID', { maximumFractionDigits: 2 })})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}