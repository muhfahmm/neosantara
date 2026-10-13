'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Gem,
  ArrowLeft,
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
interface TopUpPackage {
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

const TOP_UP_PACKAGES: TopUpPackage[] = [
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

export default function TopUpPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentDiamonds, setCurrentDiamonds] = useState<number>(150);
  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage>(TOP_UP_PACKAGES[2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ amount: number; name: string } | null>(null);
  const [showSubscriptionInfo, setShowSubscriptionInfo] = useState(false);

  const currentVipProgress = 200;
  const currentVipMax = 1000;
  const currentVipLevel = 0;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('player_diamonds');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) {
          setCurrentDiamonds(parsed);
        }
      }
    }
  }, []);

  const totalDiamonds = selectedPackage.diamondAmount * selectedPackage.bonusMultiplier;
  const vipPercent = Math.min(100, (currentVipProgress / currentVipMax) * 100);

  const handleProcessPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newTotal = currentDiamonds + totalDiamonds;
      setCurrentDiamonds(newTotal);
      if (typeof window !== 'undefined') {
        localStorage.setItem('player_diamonds', newTotal.toString());
      }
      setSuccessInfo({
        amount: totalDiamonds,
        name: `Paket ${selectedPackage.diamondAmount.toLocaleString('id-ID')} Diamond`,
      });
    }, 1000);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/page/map_system');
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#070b14] text-[#E0E0E0] font-sans flex flex-col relative select-none">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

      {/* ═══════════════ HEADER NAVBAR ═══════════════ */}
      <header className="sticky top-0 z-40 bg-[#0F2424]/90 backdrop-blur-md border-b border-[#00FFAA]/30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#00FFAA]/40 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-black text-xs uppercase"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl border border-[#00FFAA]/40 bg-[#0A1A1A] text-[#00FFAA]">
              <Gem className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#00FFAA] tracking-wider uppercase leading-none">
                Pusat Top Up Diamond
              </h1>
              <span className="text-[10px] text-[#6B8A8A] font-semibold hidden sm:inline-block">
                Toko Resmi Kedaulatan Negara Neosantara
              </span>
            </div>
          </div>
        </div>

        {/* Diamond Counter Badge */}
        <div className="flex items-center gap-2 bg-[#0A1A1A] border border-[#00FFAA]/40 px-3.5 py-1.5 rounded-xl shadow-inner">
          <Gem className="w-4 h-4 text-[#00FFAA]" />
          <div className="flex flex-col text-right">
            <span className="text-[8px] font-black text-[#6B8A8A] uppercase tracking-wider leading-none">
              Saldo Diamond
            </span>
            <span className="text-sm sm:text-base font-black text-[#00FFAA] leading-tight">
              {mounted ? currentDiamonds.toLocaleString('id-ID') : '150'}
            </span>
          </div>
        </div>
      </header>

      {/* ═══════════════ MAIN CONTENT CONTAINER ═══════════════ */}
      <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        {successInfo ? (
          /* SUCCESS STATE */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 sm:p-14 my-auto bg-[#0F2424]/40 border border-[#00FFAA]/30 rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-[#00FFAA]/15 border-2 border-[#00FFAA] flex items-center justify-center text-[#00FFAA] mb-5 shadow-[0_0_30px_rgba(0,255,170,0.3)]">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#00FFAA] uppercase tracking-wider mb-2">
              Top Up Berhasil!
            </h2>
            <p className="text-sm text-[#A0B0B0] max-w-md mb-6 font-medium">
              Transaksi pembelian <strong className="text-white">{successInfo.name}</strong> telah berhasil diverifikasi.
            </p>
            <div className="bg-[#0F2424] border border-[#00FFAA]/40 px-8 py-5 rounded-2xl flex items-center gap-4 mb-8 shadow-inner">
              <Gem className="w-9 h-9 text-[#00FFAA]" />
              <div className="text-left">
                <span className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-widest block">
                  Diamond Ditambahkan
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#00FFAA]">
                  +{successInfo.amount.toLocaleString('id-ID')} Diamond
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSuccessInfo(null)}
                className="px-6 py-3 rounded-xl border border-[#00FFAA]/40 bg-[#0A1A1A] text-[#00FFAA] hover:bg-[#00FFAA]/20 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Top Up Lagi
              </button>
              <button
                onClick={handleBack}
                className="px-8 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] font-black text-xs sm:text-sm uppercase tracking-wider hover:bg-[#00FFAA]/80 shadow-[0_0_20px_rgba(0,255,170,0.3)] cursor-pointer transition-all"
              >
                Kembali ke Game
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ═══════════════ VIP BANNER ═══════════════ */}
            <div className="relative flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#0F2424] via-[#0d2a28] to-[#0F2424] border border-[#00FFAA]/25 shrink-0 shadow-lg">
              <div className="flex items-center gap-2.5 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-amber-300/60 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                  <Crown className="w-5 h-5 text-white fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">VIP</span>
                  <span className="text-sm font-black text-white leading-none">- {currentVipLevel}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-[#6B8A8A]">
                    {currentVipProgress.toLocaleString('id-ID')} / {currentVipMax.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] font-bold text-[#00FFAA]">{vipPercent.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-[#0A1A1A] border border-[#00FFAA]/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00FFAA] to-emerald-400 transition-all"
                    style={{ width: `${vipPercent}%` }}
                  />
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/30 shrink-0">
                <Sparkles className="w-4 h-4 text-[#00FFAA] animate-pulse" />
                <span className="text-[11px] font-bold text-[#E0E0E0] whitespace-nowrap">
                  Gandakan bonus pada pembelian pertama Anda
                </span>
              </div>
            </div>

            {/* ═══════════════ GRID PAKET + SUBSCRIPTION ═══════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Paket Grid (3 kolom) */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {TOP_UP_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative flex flex-col rounded-2xl overflow-hidden border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[#00FFAA] shadow-[0_0_25px_rgba(0,255,170,0.35)] scale-[1.02]'
                            : 'border-[#00FFAA]/25 hover:border-[#00FFAA]/60'
                        }`}
                      >
                        {/* x2 BADGE */}
                        {pkg.bonusMultiplier > 1 && (
                          <div className="absolute top-0 right-0 z-10 bg-gradient-to-br from-rose-500 to-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-bl-lg shadow-md border-l border-b border-rose-900">
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
                        <div className="flex-1 bg-gradient-to-b from-[#F0E5CC] to-[#E5D4B0] p-4 pt-7 flex flex-col items-center justify-center gap-2.5 min-h-[140px]">
                          <DiamondVisual tier={pkg.gemTier} />

                          <div className="flex items-center gap-1.5 text-[#3D2911]">
                            <Gem className="w-4 h-4 text-rose-600 fill-rose-500" />
                            <span className="text-base sm:text-lg font-black">
                              {pkg.diamondAmount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                        {/* BAGIAN BAWAH: VIP POINTS + HARGA */}
                        <div className="bg-gradient-to-b from-[#3A6B7C] to-[#254B5A] p-2.5 flex flex-col items-center gap-2">
                          <div className="flex items-center gap-1 text-white">
                            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            <span className="text-[10px] font-black">
                              +{pkg.vipPoints.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2 rounded-lg text-xs font-black transition-all border ${
                              isSelected
                                ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-[#3D2911] border-amber-300 shadow-[0_2px_0_rgba(120,60,0,0.5)]'
                                : 'bg-gradient-to-b from-amber-500 to-amber-700 text-white border-amber-800/50 group-hover:from-amber-400 group-hover:to-amber-600'
                            }`}
                          >
                            {pkg.priceRupiah.toLocaleString('id-ID')}Rp
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Subscription card */}
              <div className="lg:col-span-1">
                <div className="relative flex flex-col h-full rounded-2xl overflow-hidden border-2 border-[#00FFAA]/40 bg-gradient-to-b from-[#F0E5CC] to-[#E5D4B0] shadow-lg">
                  <div className="bg-[#254B5A] py-2.5 px-3.5 flex items-center justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-wider">
                      Langganan
                    </span>
                    <button
                      onClick={() => setShowSubscriptionInfo(v => !v)}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                      title="Info langganan"
                    >
                      <Info className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-between p-4 gap-3 text-center">
                    <div className="flex items-center gap-1.5 text-[#3D2911] mt-2">
                      <Gem className="w-5 h-5 text-rose-600 fill-rose-500" />
                      <span className="text-lg font-black">
                        {SUBSCRIPTION_PLAN.dailyDiamonds.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <p className="text-[10px] font-bold text-[#5C3C10] leading-snug">
                      Setiap hari karena masuk game {SUBSCRIPTION_PLAN.daysCount} hari
                    </p>

                    <div className="text-5xl my-2">🎁</div>

                    <p className="text-[9px] text-[#6B4A20] font-semibold leading-tight px-1">
                      Langganan akan diperpanjang otomatis. Batalkan kapan saja di menu pengaturan.
                    </p>

                    <div className="flex items-center gap-1 text-[#3D2911]">
                      <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span className="text-xs font-black">
                        +{SUBSCRIPTION_PLAN.vipPoints.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="w-full py-2.5 rounded-lg text-xs font-black bg-gradient-to-b from-amber-400 to-amber-600 text-[#3D2911] border border-amber-300 shadow-[0_2px_0_rgba(120,60,0,0.5)] hover:from-amber-300 hover:to-amber-500 transition-all cursor-pointer"
                    >
                      {SUBSCRIPTION_PLAN.priceRupiah.toLocaleString('id-ID')}Rp/{SUBSCRIPTION_PLAN.period}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══════════════ RINGKASAN & TOMBOL BAYAR ═══════════════ */}
            <div className="mt-auto border-t border-[#00FFAA]/20 flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0F2424]/70 p-4 sm:p-5 rounded-2xl border border-[#00FFAA]/30 shadow-xl">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="p-3 rounded-xl bg-[#0A1A1A] border border-[#00FFAA]/40 text-[#00FFAA] shrink-0">
                  <Gem className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-[#6B8A8A] uppercase tracking-wider block">
                    Ringkasan Pembelian
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-black text-white">
                      {totalDiamonds.toLocaleString('id-ID')} Diamonds
                    </span>
                    <span className="text-xs sm:text-sm text-[#00FFAA] font-bold">
                      (Rp {selectedPackage.priceRupiah.toLocaleString('id-ID')})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleBack}
                  className="px-5 py-3 rounded-xl border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-[#00FFAA] text-[#0A1A1A] hover:bg-[#00FFAA]/90 font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,170,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A1A1A] border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-[#0A1A1A]" />
                      <span>Bayar Sekarang (Rp {selectedPackage.priceRupiah.toLocaleString('id-ID')})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
