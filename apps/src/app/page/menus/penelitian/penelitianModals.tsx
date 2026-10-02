'use client';

import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import PenelitianSelectionModal, { SelectionCategoryKey } from './penelitianSelectionModal';
import PenelitianPageModal, { CategoryKey } from './penelitianPageMenu';

interface BottomLeftPenelitianIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  countryDetail?: any;
  setCountryDetail?: (detail: any) => void;
}

export default function BottomLeftPenelitianIcon({
  onClick,
  isOpen = false,
  onClose,
  countryDetail,
  setCountryDetail,
}: BottomLeftPenelitianIconProps) {
  const [selectedFocus, setSelectedFocus] = useState<SelectionCategoryKey | null>(null);

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
        className="fixed bottom-3 lg:bottom-4 xl:bottom-6 2xl:bottom-12 left-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <FlaskConical className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
      </button>

      {/* Modal 1: Selection Modal 3 Pilihan (Ekonomi, Militer, Diplomasi) */}
      {isOpen && selectedFocus === null && (
        <PenelitianSelectionModal
          isOpen={isOpen}
          onClose={handleCloseAll}
          onSelectCategory={handleSelectCategory}
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
        />
      )}
    </>
  );
}