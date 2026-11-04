'use client';

import React, { useState } from 'react';
import { ArrowLeft, Command, Search } from 'lucide-react';
import PausedMenuFrame from '../../root_modals_design_menu/rootFrameMenu';
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
    <PausedMenuFrame zIndexClass="z-[999999999]">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 text-root-text custom-scrollbar sm:p-8">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <div className="mb-4 flex shrink-0 items-center justify-center gap-1.5 text-root-accent/40">
            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
          </div>

          <header className="mb-4 flex shrink-0 items-center justify-between border-b border-root-accent/20 pb-3 text-left">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                aria-label="Kembali ke menu jeda"
                className="cursor-pointer rounded p-1 text-root-subtle transition-all hover:bg-root-accent/10 hover:text-root-accent"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-root-accent">
                Pintasan Keyboard
              </h2>
            </div>
          </header>

          <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-root-accent/15 pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-root-accent/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari tombol atau fungsi (cth: Map, Pause, Tab)..."
                aria-label="Cari pintasan keyboard"
                className="w-full rounded-lg border border-root-accent/30 bg-root-canvas py-2 pl-8 pr-4 text-xs font-bold text-root-text shadow-inner placeholder:text-root-subtle focus:border-root-accent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-root-subtle hover:text-root-accent"
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
                      ? 'border-root-accent bg-root-accent text-root-canvas shadow-[0_0_10px_rgba(0,255,170,0.3)]'
                      : 'border-root-accent/20 bg-root-canvas text-root-subtle hover:border-root-accent/40 hover:text-root-accent'
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
                <Command className="h-10 w-10 text-root-subtle/50" />
                <span className="text-xs font-bold uppercase tracking-wider text-root-subtle">
                  Tidak ada shortcut ditemukan
                </span>
                <p className="text-[10px] text-root-subtle/70">Coba ubah kata kunci pencarian atau kategori filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {filteredShortcuts.map((item, index) => (
                  <div
                    key={`${item.category}-${item.label}-${index}`}
                    className="group flex items-center justify-between rounded-lg border border-root-accent/20 bg-root-canvas p-3 shadow-sm transition-all hover:border-root-accent/50"
                  >
                    <span className="min-w-0 flex-1 text-xs font-bold leading-tight text-root-text transition-colors group-hover:text-root-accent">
                      {item.description}
                    </span>
                    <div className="ml-2 flex shrink-0 items-center gap-1">
                      <kbd className="flex h-6 min-w-[30px] items-center justify-center rounded border-2 border-root-accent/40 bg-root-surface px-2 font-mono text-[11px] font-black uppercase tracking-wider text-root-accent shadow-[0_2px_0_rgba(0,255,170,0.2)] transition-all group-hover:border-root-accent">
                        {item.label}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex shrink-0 items-center justify-center gap-1.5 text-root-accent/40">
            <div className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-root-accent/40" />
            <span className="text-[10px] tracking-widest font-black uppercase">❖ ❖ ❖</span>
            <div className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-root-accent/40" />
          </div>
        </div>
      </div>
    </PausedMenuFrame>
  );
}

export default KeywordModal;