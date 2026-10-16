'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Keyboard, X, Search, Sparkles, Command } from 'lucide-react';
import { GAME_SHORTCUTS, ShortcutDefinition } from './index';

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeywordModal({ isOpen, onClose }: KeywordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const categories = ['Semua', 'Menu Utama', 'Sub Menu (Angka)', 'Menu Cepat', 'Time Controller', 'Navigasi Panel', 'Zoom & Map'];

  const allShortcuts: ShortcutDefinition[] = Object.values(GAME_SHORTCUTS);

  const filteredShortcuts = allShortcuts.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return createPortal(
    <div
      className="fixed inset-0 z-[999999999] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-black/75 backdrop-blur-md font-sans pointer-events-none select-none"
    >
      {/* Notebook Outer Frame — Identik dengan Muat Permainan */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1A1A] border-[6px] border-[#0F2424] rounded-2xl w-full max-w-3xl lg:max-w-[940px] xl:max-w-[1040px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] shadow-2xl relative flex flex-col p-4 pl-12 pointer-events-auto overflow-hidden"
      >
        {/* Silver Binder Spine on the Left */}
        <div className="absolute left-3.5 top-6 bottom-6 w-2.5 bg-gradient-to-r from-[#2A3F3F] via-[#3D5252] to-[#1F3030] rounded-full shadow-md z-20 border border-[#0A1A1A]/80" />
        <div className="absolute left-[10px] top-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />
        <div className="absolute left-[10px] bottom-[24px] w-[18px] h-3.5 bg-[#0F2424] rounded-sm border border-[#0A1A1A] z-21 shadow" />

        {/* Notebook Rings binding the paper */}
        <div className="absolute left-[26px] top-12 bottom-12 flex flex-col justify-between items-center py-6 pointer-events-none z-30">
          {[...Array(11)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full bg-[#0A1A1A] shadow-inner border border-[#00FFAA]/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#0F2424]" />
            </div>
          ))}
        </div>

        {/* Main Panel Sheet — Green Theme */}
        <div className="flex-1 bg-[#0F2424] border-[3px] border-[#00FFAA]/20 rounded-r-xl shadow-inner relative flex flex-col overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

          {/* Header Modal */}
          <div className="px-5 sm:px-7 py-3.5 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A]/90 shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl border border-[#00FFAA]/40 bg-[#0F2424] text-[#00FFAA] shadow-[0_0_15px_rgba(0,255,170,0.2)]">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-black text-[#00FFAA] tracking-wider uppercase leading-tight flex items-center gap-2">
                  <span>Pintasan Keyboard</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00FFAA]/20 text-[#00FFAA] border border-[#00FFAA]/30">
                    Quick Keys
                  </span>
                </h2>
                <p className="text-[10px] text-[#6B8A8A] font-semibold mt-0.5">
                  Daftar tombol pintas kontrol simulasi negara Neosantara.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
              title="Tutup Modal"
            >
              <span className="text-xs font-semibold uppercase tracking-widest pl-1 hidden sm:inline">Tutup</span>
              <X className="h-4 w-4 text-[#00FFAA]" />
            </button>
          </div>

          {/* Toolbar & Filter Bar */}
          <div className="px-5 sm:px-7 py-2.5 bg-[#0A1A1A]/60 border-b border-[#00FFAA]/15 flex flex-wrap items-center justify-between gap-3 shrink-0 z-10">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#00FFAA]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tombol atau fungsi (cth: Map, Pause, Tab)..."
                className="w-full bg-[#0F2424] border border-[#00FFAA]/30 rounded-lg pl-8 pr-4 py-1.5 text-xs font-bold text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none focus:border-[#00FFAA] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B8A8A] hover:text-[#00FFAA]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-[#00FFAA] text-[#0A1A1A] border-[#00FFAA] shadow-[0_0_10px_rgba(0,255,170,0.3)]'
                      : 'bg-[#0A1A1A] text-[#6B8A8A] border-[#00FFAA]/20 hover:text-[#00FFAA] hover:border-[#00FFAA]/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content Body Grid */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar z-10">
            {filteredShortcuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <Command className="w-10 h-10 text-[#6B8A8A]/50" />
                <span className="text-xs font-bold text-[#6B8A8A] uppercase tracking-wider">
                  Tidak ada shortcut ditemukan
                </span>
                <p className="text-[10px] text-[#6B8A8A]/70">Coba ubah kata kunci pencarian atau kategori filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0A1A1A] border border-[#00FFAA]/20 hover:border-[#00FFAA]/50 transition-all shadow-sm group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#E0E0E0] group-hover:text-[#00FFAA] transition-colors leading-tight">
                        {item.description}
                      </span>
                    </div>

                    {/* Key Cap Badge */}
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <kbd className="min-w-[30px] h-6 px-2 flex items-center justify-center rounded bg-[#0F2424] border-2 border-[#00FFAA]/40 text-[#00FFAA] font-mono text-[11px] font-black uppercase tracking-wider shadow-[0_2px_0_rgba(0,255,170,0.2)] group-hover:border-[#00FFAA] transition-all">
                        {item.label}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-7 py-2.5 border-t border-[#00FFAA]/20 bg-[#0A1A1A]/90 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-1.5 text-[10px] text-[#6B8A8A] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#00FFAA]" />
              <span>Shortcut otomatis dinonaktifkan ketika sedang mengetik pesan / form input.</span>
            </div>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#00FFAA] text-[#0A1A1A] font-black text-[11px] uppercase tracking-wider hover:bg-[#00FFAA]/80 transition-all cursor-pointer shadow-md"
            >
              Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default KeywordModal;
