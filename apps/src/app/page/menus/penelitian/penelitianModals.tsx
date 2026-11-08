'use client';

import React, { useState, useEffect } from 'react';
import { useViewportMode } from '@/app/hooks/useViewportMode';
import PenelitianSelectionModal, { SelectionCategoryKey } from './penelitianSelectionModal';
import PenelitianPageModal, { CategoryKey } from './penelitianPageMenu';

import { generateResearchChangeNotification } from '../inbox/logic/11_notifikasi_penelitian/researchChangeLogic';

interface BottomLeftPenelitianIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
  currentDate?: Date;
}

export default function BottomLeftPenelitianIcon({
  onClick,
  isOpen = false,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
}: BottomLeftPenelitianIconProps) {
  const [selectedFocus, setSelectedFocus] = useState<SelectionCategoryKey | null>(null);
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  useEffect(() => {
    if (!isOpen) {
      setSelectedFocus(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleResetFocus = () => {
      setSelectedFocus(null);
    };
    window.addEventListener('reset_penelitian_selection', handleResetFocus);
    window.addEventListener('open_penelitian_modal', handleResetFocus);
    return () => {
      window.removeEventListener('reset_penelitian_selection', handleResetFocus);
      window.removeEventListener('open_penelitian_modal', handleResetFocus);
    };
  }, []);

  const handleCloseAll = () => {
    setSelectedFocus(null);
    if (onClose) onClose();
  };

  const handleSelectCategory = (category: SelectionCategoryKey) => {
    setSelectedFocus(category);
  };

  return (
    <>
      {/* Icon Tombol Kiri Bawah */}
      <button
        onClick={onClick}
        title="Penelitian - Riset dan Teknologi"
        style={{
          bottom: isLandscapePhone ? 'calc(var(--safe-bottom) + 0.5rem)' : isPortraitPhone ? 'calc(var(--safe-bottom) + 4.5rem)' : undefined,
          left: isLandscapePhone ? 'calc(var(--safe-left) + 3.5rem)' : isPortraitPhone ? 'calc(var(--safe-left) + 0.5rem)' : undefined,
        }}
        className={`fixed z-[100] flex cursor-pointer items-center justify-center transition-transform group hover:scale-110 active:scale-95 ${
          isLandscapePhone
            ? 'h-11 w-11 rounded-xl border border-root-accent/40 bg-root-surface/90 shadow-lg'
            : isPortraitPhone
            ? 'h-11 w-11 rounded-xl border border-root-accent/40 bg-root-surface/90 shadow-lg'
            : 'bottom-3 left-7 h-12 w-12 lg:bottom-4 lg:h-14 lg:w-14 xl:bottom-6 xl:h-16 xl:w-16 2xl:bottom-12'
        }`}
      >
        <img
          src="/images/game/interface/menu/research.svg"
          alt=""
          aria-hidden="true"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
          width={72}
          height={72}
          className={`object-contain brightness-125 saturate-150 drop-shadow-[0_0_6px_rgba(0,255,170,0.55)] ${
            isLandscapePhone
              ? 'h-11 w-11'
              : isPortraitPhone
              ? 'h-11 w-11'
              : 'h-14 w-14 lg:h-16 lg:w-16 xl:h-[4.5rem] xl:w-[4.5rem]'
          }`}
        />
      </button>

      {/* Modal 1: Selection Modal 3 Pilihan (Ekonomi, Militer, Diplomasi) */}
      {isOpen && selectedFocus === null && (
        <PenelitianSelectionModal
          isOpen={isOpen}
          onClose={handleCloseAll}
          onSelectCategory={handleSelectCategory}
          religion={countryDetail?.religion || countryDetail?.agama_utama || countryDetail?.agama}
          countryDetail={countryDetail}
        />
      )}

      {/* Modal 2: Page Utama Penelitian (Di Redirect setelah memilih Kategori) */}
      {isOpen && selectedFocus !== null && (
        <PenelitianPageModal
          isOpen={isOpen}
          onClose={handleCloseAll}
          onBackToSelection={() => setSelectedFocus(null)}
          initialCategory={selectedFocus}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
        />
      )}
    </>
  );
}
