'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useViewportMode } from '@/app/hooks/useViewportMode';
import PenelitianSelectionModal, { SelectionCategoryKey } from './penelitianSelectionModal';
import PenelitianPageModal, { CategoryKey } from './penelitianPageMenu';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

import { generateResearchChangeNotification } from '../inbox/logic/11_notifikasi_penelitian/researchChangeLogic';

interface BottomLeftPenelitianIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
  currentDate?: Date;
  isMenuButtonHidden?: boolean;
  onResearchPageChange?: (isOpen: boolean) => void;
}

export default function BottomLeftPenelitianIcon({
  onClick,
  isOpen = false,
  onClose,
  countryDetail,
  setCountryDetail,
  currentDate,
  isMenuButtonHidden = false,
  onResearchPageChange,
}: BottomLeftPenelitianIconProps) {
  const { t } = useLanguage();
  const [selectedFocus, setSelectedFocus] = useState<SelectionCategoryKey | null>(null);
  const viewportMode = useViewportMode();
  const isLandscapePhone = viewportMode === 'landscapePhone';
  const isPortraitPhone = viewportMode === 'portraitPhone';
  const isMobile = isLandscapePhone || isPortraitPhone;

  useEffect(() => {
    if (!isOpen) {
      setSelectedFocus(null);
      onResearchPageChange?.(false);
    }
  }, [isOpen, onResearchPageChange]);

  useEffect(() => {
    const handleResetFocus = () => {
      setSelectedFocus(null);
      onResearchPageChange?.(false);
    };
    window.addEventListener('reset_penelitian_selection', handleResetFocus);
    window.addEventListener('open_penelitian_modal', handleResetFocus);
    return () => {
      window.removeEventListener('reset_penelitian_selection', handleResetFocus);
      window.removeEventListener('open_penelitian_modal', handleResetFocus);
    };
  }, [onResearchPageChange]);

  const handleCloseAll = () => {
    setSelectedFocus(null);
    onResearchPageChange?.(false);
    if (onClose) onClose();
  };

  const handleSelectCategory = (category: SelectionCategoryKey) => {
    setSelectedFocus(category);
    onResearchPageChange?.(true);
  };

  const handleBackToSelection = () => {
    setSelectedFocus(null);
    onResearchPageChange?.(false);
  };

  return (
    <>
      {!isMenuButtonHidden && typeof document !== 'undefined' && createPortal(
        <button
          onClick={onClick}
          title={t('side_penelitian.title')}
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
        </button>,
        document.body
      )}

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
          onBackToSelection={handleBackToSelection}
          initialCategory={selectedFocus}
          countryDetail={countryDetail}
          setCountryDetail={setCountryDetail}
          currentDate={currentDate}
        />
      )}
    </>
  );
}
