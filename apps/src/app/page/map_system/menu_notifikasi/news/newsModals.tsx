'use client';

import React from 'react';
import { Newspaper, X } from 'lucide-react'; // 🔥 Tambahkan import X

interface TopRightNewsIconProps {
  onClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TopRightNewsIcon({ onClick, isOpen, onClose }: TopRightNewsIconProps) {
  return (
    <>
      <button
        onClick={onClick}
        title="Berita - Berita dan Update Negara"
        className="fixed top-36 lg:top-38 xl:top-40 right-7 z-[100] w-9 h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-[#0F2424] border border-[#00FFAA]/40 text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] shadow-[0_4px_12px_rgba(0,0,0,0.4)] flex items-center justify-center cursor-pointer transition-all group"
      >
        <Newspaper className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transition-transform group-hover:scale-110" />
      </button>

      {/* 🔥 News Modal - Ukuran dan Tema Konsisten dengan Modal Lainnya */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424]/90 backdrop-blur-md border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">

            {/* 🔥 HEADER MODAL */}
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="p-1 sm:p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0F2424] shrink-0">
                  <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Berita & Update Negara</h2>
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

            {/* 🔥 BODY MODAL */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0A1A1A]/80 relative z-10 custom-scrollbar flex flex-col items-center justify-center">
              <div className="flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto my-auto">
                <Newspaper className="h-16 w-16 text-[#00FFAA]/30" />
                <h4 className="text-lg font-bold text-[#00FFAA] uppercase">Tidak Ada Berita</h4>
                <p className="text-xs text-[#6B8A8A] leading-relaxed">
                  Belum ada berita atau update yang masuk. Pantau terus perkembangan situasi nasional dan internasional.
                </p>
              </div>
            </div>

            {/* 🔥 FOOTER MODAL */}
            <div className="p-3 bg-[#0A1A1A] border-t border-[#00FFAA]/20 flex justify-end relative z-10 shrink-0">
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}