'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Gift, X, Check, Lock, Zap, AlertTriangle } from 'lucide-react';
import {
  formatProductionProductName,
  PRODUCTION_BAN_CATEGORIES,
} from '../../navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog';

const DAILY_REWARD_AMOUNTS = [10_000, 15_000, 20_000, 25_000] as const;
const REWARD_DAYS = 7;
const REWARD_PRODUCTS = PRODUCTION_BAN_CATEGORIES.flatMap(category =>
  category.products.map(resourceKey => ({
    resourceKey,
    categoryLabel: category.label,
  }))
);

interface DailySdaReward {
  resourceKey: string;
  categoryLabel: string;
  amount: number;
}

const shuffle = <T,>(items: T[]): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const createWeeklyRewards = (): DailySdaReward[] => {
  const resources = shuffle(REWARD_PRODUCTS).slice(0, REWARD_DAYS);
  const amounts = shuffle([...DAILY_REWARD_AMOUNTS]);

  while (amounts.length < REWARD_DAYS) {
    const previousAmount = amounts[amounts.length - 1];
    const availableAmounts = DAILY_REWARD_AMOUNTS.filter(amount => amount !== previousAmount);
    amounts.push(availableAmounts[Math.floor(Math.random() * availableAmounts.length)]);
  }

  return resources.map((resource, index) => ({
    ...resource,
    amount: amounts[index],
  }));
};

const isWeeklyRewardSchedule = (value: unknown): value is Array<{ resourceKey: string; amount: number }> => {
  if (!Array.isArray(value) || value.length !== REWARD_DAYS) return false;

  const resourceKeys = new Set<string>();
  for (const reward of value) {
    if (
      !reward ||
      typeof reward !== 'object' ||
      !('resourceKey' in reward) ||
      !('amount' in reward) ||
      typeof reward.resourceKey !== 'string' ||
      !DAILY_REWARD_AMOUNTS.some(amount => amount === reward.amount) ||
      !REWARD_PRODUCTS.some(product => product.resourceKey === reward.resourceKey) ||
      resourceKeys.has(reward.resourceKey)
    ) {
      return false;
    }
    resourceKeys.add(reward.resourceKey);
  }

  return true;
};

const restoreWeeklyRewards = (value: unknown): DailySdaReward[] | null => {
  if (!isWeeklyRewardSchedule(value)) return null;

  return value.map(reward => ({
    ...REWARD_PRODUCTS.find(product => product.resourceKey === reward.resourceKey)!,
    amount: reward.amount,
  }));
};

const getWeekKey = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

// ----------------------------------------------------------------------
// Helper: tanggal dalam format YYYY-MM-DD
// ----------------------------------------------------------------------
const getToday = (): string => new Date().toISOString().slice(0, 10);

const getYesterday = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

// ----------------------------------------------------------------------
// Interface props
// ----------------------------------------------------------------------
interface TopRightGiftIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  canClaimReward: boolean;
  onClaimReward: (resourceKey: string, amount: number) => void;
}

interface FeedbackModalData {
  title: string;
  message: string;
  variant: 'success' | 'danger';
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
}

// ----------------------------------------------------------------------
// Komponen utama
// ----------------------------------------------------------------------
export default function TopRightGiftIcon({
  onClick,
  isOpen,
  onClose,
  canClaimReward,
  onClaimReward,
}: TopRightGiftIconProps) {
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [weeklyRewards, setWeeklyRewards] = useState<DailySdaReward[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // State untuk modal feedback (menggantikan alert)
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------------------------------------------------
  // Load & update status dari localStorage
  // --------------------------------------------------------------------
  const loadRewardStatus = useCallback(() => {
    const stored = localStorage.getItem('dailyRewardData');
    const today = getToday();

    let day = 1;
    let claimed = false;
    let lastDate: string | null = null;
    let storedData: Record<string, unknown> = {};

    if (stored) {
      try {
        const parsedData: unknown = JSON.parse(stored);
        if (!parsedData || typeof parsedData !== 'object' || Array.isArray(parsedData)) {
          throw new Error('Format data hadiah harian tidak valid.');
        }
        storedData = parsedData as Record<string, unknown>;
        day = Number(storedData.currentDay) || 1;
        lastDate = typeof storedData.lastClaimDate === 'string' ? storedData.lastClaimDate : null;
        claimed = storedData.claimedToday === true;

        if (lastDate === today) {
          claimed = true;
        } else if (lastDate === getYesterday()) {
          claimed = false;
          if (day === 7) {
            day = 1;
          } else {
            day = day + 1;
          }
        } else {
          day = 1;
          claimed = false;
          lastDate = null;
        }
      } catch (e) {
        day = 1;
        claimed = false;
        lastDate = null;
      }
    }

    const weekKey = getWeekKey(today);
    const savedWeeklyRewards = restoreWeeklyRewards(storedData.weeklyRewards);
    const rewards = storedData.weeklyRewardWeek === weekKey && savedWeeklyRewards
      ? savedWeeklyRewards
      : createWeeklyRewards();

    setCurrentDay(day);
    setClaimedToday(claimed);
    setLastClaimDate(lastDate);
    setWeeklyRewards(rewards);
    setIsLoading(false);

    localStorage.setItem(
      'dailyRewardData',
      JSON.stringify({
        currentDay: day,
        lastClaimDate: lastDate,
        claimedToday: claimed,
        weeklyRewardWeek: weekKey,
        weeklyRewards: rewards.map(({ resourceKey, amount }) => ({ resourceKey, amount })),
      })
    );
  }, []);

  useEffect(() => {
    loadRewardStatus();

    const resetRewardStatus = () => {
      localStorage.removeItem('dailyRewardData');
      loadRewardStatus();
    };

    const handlePageExit = () => {
      localStorage.removeItem('dailyRewardData');
    };

    window.addEventListener('daily_reward_reset', resetRewardStatus);
    window.addEventListener('pagehide', handlePageExit);

    const interval = setInterval(() => {
      const stored = localStorage.getItem('dailyRewardData');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const today = getToday();
          if (
            (data.lastClaimDate && data.lastClaimDate !== today) ||
            data.weeklyRewardWeek !== getWeekKey(today)
          ) {
            loadRewardStatus();
          }
        } catch (e) {
          // ignore
        }
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('daily_reward_reset', resetRewardStatus);
      window.removeEventListener('pagehide', handlePageExit);
    };
  }, [loadRewardStatus]);

  // --------------------------------------------------------------------
  // Fungsi klaim hadiah
  // --------------------------------------------------------------------
  const handleClaim = () => {
    if (claimedToday) return;
    const reward = weeklyRewards[currentDay - 1];
    if (!canClaimReward || !reward) {
      setFeedbackModal({
        title: 'Hadiah Belum Dapat Diklaim',
        message: 'Pilih atau muat negara terlebih dahulu sebelum mengklaim hadiah.',
        variant: 'danger',
      });
      return;
    }

    const today = getToday();
    let newDay = currentDay;
    const weekKey = getWeekKey(today);
    newDay = currentDay === REWARD_DAYS ? 1 : currentDay + 1;

    onClaimReward(reward.resourceKey, reward.amount);
    setCurrentDay(newDay);
    setClaimedToday(true);
    setLastClaimDate(today);

    localStorage.setItem(
      'dailyRewardData',
      JSON.stringify({
        currentDay: newDay,
        lastClaimDate: today,
        claimedToday: true,
        weeklyRewardWeek: weekKey,
        weeklyRewards: weeklyRewards.map(({ resourceKey, amount }) => ({ resourceKey, amount })),
      })
    );

    // Tampilkan modal feedback (menggantikan alert)
    setFeedbackModal({
      title: 'Hadiah Diklaim!',
      message: `Anda mendapatkan ${reward.amount.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${formatProductionProductName(reward.resourceKey)} dari sektor ${reward.categoryLabel}.`,
      variant: 'success',
    });
  };

  // --------------------------------------------------------------------
  // Render loading
  // --------------------------------------------------------------------
  if (isLoading) {
    return (
      <button
        onClick={onClick}
        title="Hadiah - Bonus dan Reward"
        className="fixed top-24 right-7 z-[100] flex h-12 w-12 cursor-default items-center justify-center opacity-70 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
      >
        <Image
          src="/images/game/interface/menu/reward.svg"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          className="h-14 w-14 object-contain animate-pulse brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]"
        />
      </button>
    );
  }

  // --------------------------------------------------------------------
  // Render utama
  // --------------------------------------------------------------------
  return (
    <>
      {/* Tombol hadiah */}
      <button
        onClick={onClick}
        title="Hadiah - Bonus dan Reward"
        className="fixed top-24 right-7 z-[100] flex h-12 w-12 cursor-pointer items-center justify-center transition-transform group hover:scale-110 lg:h-14 lg:w-14 xl:h-16 xl:w-16"
      >
        <Image
          src="/images/game/interface/menu/reward.svg"
          alt=""
          aria-hidden="true"
          width={72}
          height={72}
          className="h-14 w-14 object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]"
        />
        {!claimedToday && (
          <span className="absolute -top-1 -right-1 bg-red-500 border border-[#0A1A1A] text-white text-[9px] font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Modal Hadiah */}
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            {/* ---- HEADER ---- */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Gift className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">
                    Hadiah Harian
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 sm:p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5"
              >
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ---- BODY (GRID HARIAN) ---- */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A] relative z-10 custom-scrollbar flex flex-col items-center justify-start">
              <div className="w-full max-w-4xl mb-6 text-center">
                <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold">
                  Hari ke-{currentDay} dari 7
                  {claimedToday
                    ? ' ✅ Sudah diklaim hari ini'
                    : ' ⏳ Klik kotak hari ini untuk klaim!'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 w-full max-w-4xl">
                {Array.from({ length: 7 }, (_, index) => {
                  const day = index + 1;
                  const reward = weeklyRewards[day - 1];
                  const isPast = day < currentDay;
                  const isToday = day === currentDay;
                  const isFuture = day > currentDay;
                  const isClaimed = isPast || (isToday && claimedToday);

                  let statusIcon = null;
                  let statusColor = '';
                  let borderColor = '';
                  let bgColor = 'bg-[#0F2424]';
                  let cursor = 'cursor-default';
                  let onClickHandler = undefined;

                  if (isClaimed) {
                    statusIcon = <Check className="h-5 w-5 text-emerald-400" />;
                    statusColor = 'text-emerald-400';
                    borderColor = 'border-emerald-500/50';
                    bgColor = 'bg-emerald-950/30';
                  } else if (isToday && !claimedToday) {
                    statusIcon = <Zap className="h-5 w-5 text-[#00FFAA] animate-pulse" />;
                    statusColor = 'text-[#00FFAA]';
                    borderColor = 'border-[#00FFAA]';
                    bgColor = 'bg-[#00FFAA]/10';
                    cursor = 'cursor-pointer';
                    onClickHandler = handleClaim;
                  } else if (isFuture) {
                    statusIcon = <Lock className="h-5 w-5 text-[#6B8A8A]/50" />;
                    statusColor = 'text-[#6B8A8A]/50';
                    borderColor = 'border-[#00FFAA]/10';
                    bgColor = 'bg-[#0A1A1A]/60';
                  }

                  return (
                    <div
                      key={day}
                      onClick={onClickHandler}
                      className={`
                        relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border 
                        ${borderColor} ${bgColor} ${cursor}
                        transition-all duration-200
                        ${isToday && !claimedToday ? 'hover:scale-105 hover:shadow-[0_0_15px_rgba(0,255,170,0.2)]' : ''}
                      `}
                    >
                      <span className="text-[10px] sm:text-xs font-bold text-[#6B8A8A] uppercase tracking-wider">
                        Hari {day}
                      </span>

                      <span className="text-xs sm:text-sm font-bold text-[#E0E0E0] mt-1 whitespace-nowrap">
                        {reward?.amount.toLocaleString('id-ID', { maximumFractionDigits: 2 }) ?? '—'}
                      </span>

                      <span className="text-[9px] sm:text-[10px] text-center text-[#6B8A8A] mt-1 leading-tight">
                        {reward ? formatProductionProductName(reward.resourceKey) : 'Memuat produk'}
                      </span>

                      <div className={`mt-2 ${statusColor}`}>{statusIcon}</div>

                      {isToday && !claimedToday && (
                        <span className="absolute -top-2 -right-2 bg-[#00FFAA] text-[#0A1A1A] text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                          Klaim!
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 text-center max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F2424] rounded-full border border-[#00FFAA]/30 text-[#00FFAA] text-xs">
                  <Zap className="h-4 w-4" />
                  <span>
                    Hadiah berbeda setiap hari dan diacak setiap minggu. Nominal{' '}
                    <span className="font-black text-white">
                      10.000, 15.000, 20.000, atau 25.000
                    </span>
                    {' '}diacak untuk tiap hari.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ---- MODAL FEEDBACK ---- */}
      {mounted && feedbackModal && createPortal(
        <div className="fixed inset-0 z-[300] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl pointer-events-auto">

            {/* Header */}
            <div className="px-4 sm:px-5 py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] gap-2 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className={`p-1.5 rounded-lg border shrink-0 ${
                  feedbackModal.variant === 'success'
                    ? 'bg-[#00FFAA]/10 border-[#00FFAA]/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}>
                  {feedbackModal.variant === 'success' ? (
                    <Check className="h-4 w-4 text-[#00FFAA]" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                  )}
                </div>
                <h3 className={`text-sm sm:text-base font-bold tracking-tight leading-none uppercase ${
                  feedbackModal.variant === 'success' ? 'text-[#00FFAA]' : 'text-rose-400'
                }`}>
                  {feedbackModal.title}
                </h3>
              </div>

              <button
                onClick={() => setFeedbackModal(null)}
                className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-xs sm:text-sm text-[#E0E0E0] whitespace-pre-line leading-relaxed">
                {feedbackModal.message}
              </p>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#00FFAA]/20 bg-[#0A1A1A] flex gap-3 justify-end shrink-0 rounded-b-2xl">
              {feedbackModal.variant === 'success' ? (
                <button
                  onClick={() => setFeedbackModal(null)}
                  className="px-6 py-2.5 bg-[#00FFAA] hover:bg-[#00e699] border border-[#00FFAA] rounded-xl text-center text-[#0A1A1A] font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
                >
                  Mengerti
                </button>
              ) : (
                <>
                  <button
                    onClick={feedbackModal.onCancel ?? (() => setFeedbackModal(null))}
                    className="px-5 py-2.5 bg-[#0F2424] hover:bg-[#163535] border border-[#00FFAA]/30 rounded-xl text-center text-[#E0E0E0] font-black text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    {feedbackModal.cancelLabel ?? 'Batal'}
                  </button>
                  <button
                    onClick={feedbackModal.onConfirm ?? (() => setFeedbackModal(null))}
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 border border-rose-500 rounded-xl text-center text-white font-black text-xs tracking-wider uppercase transition-all cursor-pointer shadow-md"
                  >
                    {feedbackModal.confirmLabel ?? 'Konfirmasi'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}