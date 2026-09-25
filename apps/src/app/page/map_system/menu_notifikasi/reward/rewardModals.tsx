'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Gift, X, Check, Lock, Zap, RotateCcw } from 'lucide-react';

// ----------------------------------------------------------------------
// Reward data per hari (1–7)
// ----------------------------------------------------------------------
const DAILY_REWARDS = [100, 200, 300, 400, 500, 600, 1000];
const WEEKLY_BONUS = 5000; // Bonus besar jika menyelesaikan 7 hari berturut-turut

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
}

// ----------------------------------------------------------------------
// Komponen utama
// ----------------------------------------------------------------------
export default function TopRightGiftIcon({ onClick, isOpen, onClose }: TopRightGiftIconProps) {
  // --------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --------------------------------------------------------------------
  // Load & update status dari localStorage setiap kali komponen mount
  // atau hari berganti
  // --------------------------------------------------------------------
  const loadRewardStatus = useCallback(() => {
    const stored = localStorage.getItem('dailyRewardData');
    const today = getToday();

    // Default jika belum ada data
    let day = 1;
    let claimed = false;
    let lastDate: string | null = null;

    if (stored) {
      try {
        const data = JSON.parse(stored);
        day = data.currentDay ?? 1;
        lastDate = data.lastClaimDate ?? null;
        claimed = data.claimedToday ?? false;

        // Cek apakah lastClaimDate adalah hari ini
        if (lastDate === today) {
          // Sudah klaim hari ini -> claimedToday = true
          claimed = true;
        } else if (lastDate === getYesterday()) {
          // Kemarin klaim, hari ini belum klaim
          claimed = false;
          // Jika kemarin adalah hari ke-7, maka hari ini reset ke 1
          if (day === 7) {
            day = 1;
          } else {
            day = day + 1; // maju satu hari
          }
        } else {
          // Terakhir klaim lebih dari 1 hari yang lalu → reset
          day = 1;
          claimed = false;
          lastDate = null;
        }
      } catch (e) {
        // Data rusak, reset
        day = 1;
        claimed = false;
        lastDate = null;
      }
    }

    // Simpan state yang sudah diperbarui
    setCurrentDay(day);
    setClaimedToday(claimed);
    setLastClaimDate(lastDate);
    setIsLoading(false);

    // Simpan kembali ke localStorage agar konsisten
    localStorage.setItem(
      'dailyRewardData',
      JSON.stringify({
        currentDay: day,
        lastClaimDate: lastDate,
        claimedToday: claimed,
      })
    );
  }, []);

  // Panggil saat mount dan setiap kali hari berganti (deteksi midnight)
  useEffect(() => {
    loadRewardStatus();

    // Opsional: cek setiap menit untuk mendeteksi pergantian hari
    const interval = setInterval(() => {
      const stored = localStorage.getItem('dailyRewardData');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          const today = getToday();
          // Jika tanggal tersimpan berbeda dengan hari ini, reload
          if (data.lastClaimDate && data.lastClaimDate !== today) {
            loadRewardStatus();
          }
        } catch (e) {
          // ignore
        }
      }
    }, 60000); // 1 menit

    return () => clearInterval(interval);
  }, [loadRewardStatus]);

  // --------------------------------------------------------------------
  // Fungsi klaim hadiah
  // --------------------------------------------------------------------
  const handleClaim = () => {
    if (claimedToday) return; // sudah klaim hari ini

    const today = getToday();
    let newDay = currentDay;
    let newClaimed = true;
    let bonusMessage = '';

    // Tentukan reward yang didapat
    const reward = DAILY_REWARDS[currentDay - 1];

    // Jika ini hari ke-7, berikan bonus mingguan
    if (currentDay === 7) {
      bonusMessage = `🎉 Bonus Mingguan +${WEEKLY_BONUS} koin!`;
      newDay = 1; // reset ke hari 1
    } else {
      newDay = currentDay + 1;
    }

    // Update state
    setCurrentDay(newDay);
    setClaimedToday(true);
    setLastClaimDate(today);

    // Simpan ke localStorage
    localStorage.setItem(
      'dailyRewardData',
      JSON.stringify({
        currentDay: newDay,
        lastClaimDate: today,
        claimedToday: true,
      })
    );

    // Tampilkan notifikasi
    alert(`🎁 Anda mendapatkan ${reward} koin!${bonusMessage ? '\n' + bonusMessage : ''}`);
  };

  // --------------------------------------------------------------------
  // Fungsi reset (manual) – akan mengembalikan ke default
  // --------------------------------------------------------------------
  const handleReset = () => {
    const confirmReset = window.confirm(
      'Apakah Anda yakin ingin mereset semua progres hadiah harian? Data akan kembali ke hari pertama.'
    );
    if (!confirmReset) return;

    // Reset state ke default
    setCurrentDay(1);
    setClaimedToday(false);
    setLastClaimDate(null);

    // Hapus data dari localStorage
    localStorage.removeItem('dailyRewardData');

    alert('Progres hadiah harian telah direset.');
  };

  // --------------------------------------------------------------------
  // Render jika loading
  // --------------------------------------------------------------------
  if (isLoading) {
    return (
      <button
        onClick={onClick}
        title="Hadiah - Bonus dan Reward"
        className="fixed top-24 right-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-default opacity-70"
      >
        <Gift className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-[#00FFAA] animate-pulse" />
      </button>
    );
  }

  // --------------------------------------------------------------------
  // Render tombol & modal
  // --------------------------------------------------------------------
  return (
    <>
      {/* Tombol hadiah di pojok kanan atas */}
      <button
        onClick={onClick}
        title="Hadiah - Bonus dan Reward"
        className="fixed top-24 right-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <Gift className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
        {!claimedToday && (
          <span className="absolute -top-1 -right-1 bg-red-500 border border-[#0A1A1A] text-white text-[9px] font-bold rounded-full w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Modal Hadiah - Render via Portal agar sama dengan Sidang Umum PBB */}
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
              {/* Informasi hari ini */}
              <div className="w-full max-w-4xl mb-6 text-center">
                <p className="text-xs sm:text-sm text-[#6B8A8A] font-semibold">
                  Hari ke-{currentDay} dari 7
                  {claimedToday
                    ? ' ✅ Sudah diklaim hari ini'
                    : ' ⏳ Klik kotak hari ini untuk klaim!'}
                </p>
              </div>

              {/* Grid 7 hari */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 w-full max-w-4xl">
                {DAILY_REWARDS.map((reward, index) => {
                  const day = index + 1;
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
                    // Sudah diklaim
                    statusIcon = <Check className="h-5 w-5 text-emerald-400" />;
                    statusColor = 'text-emerald-400';
                    borderColor = 'border-emerald-500/50';
                    bgColor = 'bg-emerald-950/30';
                  } else if (isToday && !claimedToday) {
                    // Hari ini, bisa diklaim
                    statusIcon = <Zap className="h-5 w-5 text-[#00FFAA] animate-pulse" />;
                    statusColor = 'text-[#00FFAA]';
                    borderColor = 'border-[#00FFAA]';
                    bgColor = 'bg-[#00FFAA]/10';
                    cursor = 'cursor-pointer';
                    onClickHandler = handleClaim;
                  } else if (isFuture) {
                    // Belum terbuka
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
                      {/* Nomor hari */}
                      <span className="text-[10px] sm:text-xs font-bold text-[#6B8A8A] uppercase tracking-wider">
                        Hari {day}
                      </span>

                      {/* Reward amount */}
                      <span className="text-base sm:text-lg font-black text-[#E0E0E0] mt-1">
                        {reward}
                        <span className="text-xs font-medium text-[#6B8A8A] ml-1">koin</span>
                      </span>

                      {/* Status icon */}
                      <div className={`mt-2 ${statusColor}`}>{statusIcon}</div>

                      {/* Label tambahan untuk hari ini */}
                      {isToday && !claimedToday && (
                        <span className="absolute -top-2 -right-2 bg-[#00FFAA] text-[#0A1A1A] text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                          Klaim!
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bonus mingguan info */}
              <div className="mt-8 text-center max-w-md">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F2424] rounded-full border border-[#00FFAA]/30 text-[#00FFAA] text-xs">
                  <Zap className="h-4 w-4" />
                  <span>
                    Selesaikan 7 hari berturut-turut dan dapatkan{' '}
                    <span className="font-black text-white">+{WEEKLY_BONUS} koin</span> bonus!
                  </span>
                </div>
              </div>
            </div>

            {/* ---- FOOTER ---- */}
            <div className="p-3 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-between items-center relative z-10 shrink-0">
              {/* Tombol Reset (manual) */}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/40 text-red-400 hover:bg-red-900/60 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                title="Reset progres hadiah harian ke awal"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>

              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}