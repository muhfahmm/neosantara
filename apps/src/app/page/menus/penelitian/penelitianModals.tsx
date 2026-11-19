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
        className="side-floating-btn side-btn-penelitian"
      >
        <img
          src="/images/game/interface/menu/research.svg"
          alt=""
          aria-hidden="true"
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
          width={72}
          height={72}
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
