'use client';

import React, { useState } from 'react';
import { ArrowLeft, Command, Search } from 'lucide-react';
import NotebookModalWrapper from '../../navigasi_menu/2_navigasi_bawah/NotebookModalWrapper';
import { GAME_SHORTCUTS, type ShortcutDefinition } from './index';

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeywordModal({ isOpen, onClose }: KeywordModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  if (!isOpen) return null;

  const categories = ['Semua', 'Menu Utama', 'Sub Menu (Angka)', 'Menu Cepat', 'Time Controller', 'Navigasi Panel', 'Zoom & Map'];
  const allShortcuts: ShortcutDefinition[] = Object.values(GAME_SHORTCUTS);
  const query = searchQuery.toLowerCase().trim();

  const filteredShortcuts = allShortcuts.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesQuery =
      !query ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <NotebookModalWrapper zIndexClass="z-[999999999]">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 text-[#E0E0E0] custom-scrollbar sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,170,0.03)_0%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="mb-4 flex shrink-0 items-center justify-center gap-1.5 text-[#00FFAA]/40">
            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
          </div>

          <header className="mb-4 flex shrink-0 items-center justify-between border-b border-[#00FFAA]/20 pb-3 text-left">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Kembali ke menu jeda"
                className="cursor-pointer rounded p-1 text-[#6B8A8A] transition-all hover:bg-[#00FFAA]/10 hover:text-[#00FFAA]"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#00FFAA]">
                Pintasan Keyboard
              </h2>
            </div>
          </header>

          <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-[#00FFAA]/15 pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#00FFAA]/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari tombol atau fungsi (cth: Map, Pause, Tab)..."
                aria-label="Cari pintasan keyboard"
                className="w-full rounded-lg border border-[#00FFAA]/30 bg-[#0A1A1A] py-2 pl-8 pr-4 text-xs font-bold text-[#E0E0E0] shadow-inner placeholder:text-[#6B8A8A] focus:border-[#00FFAA] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B8A8A] hover:text-[#00FFAA]"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  aria-pressed={selectedCategory === category}
                  className={`cursor-pointer whitespace-nowrap rounded border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                    selectedCategory === category
                      ? 'border-[#00FFAA] bg-[#00FFAA] text-[#0A1A1A] shadow-[0_0_10px_rgba(0,255,170,0.3)]'
                      : 'border-[#00FFAA]/20 bg-[#0A1A1A] text-[#6B8A8A] hover:border-[#00FFAA]/40 hover:text-[#00FFAA]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {filteredShortcuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Command className="h-10 w-10 text-[#6B8A8A]/50" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B8A8A]">
                  Tidak ada shortcut ditemukan
                </span>
                <p className="text-[10px] text-[#6B8A8A]/70">Coba ubah kata kunci pencarian atau kategori filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {filteredShortcuts.map((item, index) => (
                  <div
                    key={`${item.category}-${item.label}-${index}`}
                    className="group flex items-center justify-between rounded-lg border border-[#00FFAA]/20 bg-[#0A1A1A] p-3 shadow-sm transition-all hover:border-[#00FFAA]/50"
                  >
                    <span className="min-w-0 flex-1 text-xs font-bold leading-tight text-[#E0E0E0] transition-colors group-hover:text-[#00FFAA]">
                      {item.description}
                    </span>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      <kbd className="flex h-6 min-w-[30px] items-center justify-center rounded border-2 border-[#00FFAA]/40 bg-[#0F2424] px-2 font-mono text-[11px] font-black uppercase tracking-wider text-[#00FFAA] shadow-[0_2px_0_rgba(0,255,170,0.2)] transition-all group-hover:border-[#00FFAA]">
                        {item.label}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-center gap-1.5 text-[#00FFAA]/40">
            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#00FFAA]/40" />
            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#00FFAA]/40" />
          </div>
        </div>
      </div>
    </NotebookModalWrapper>
  );
}

export default KeywordModal;
