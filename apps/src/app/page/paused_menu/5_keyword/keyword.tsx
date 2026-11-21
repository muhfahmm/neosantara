'use client';

import React, { useState } from 'react';
import { Command, Search } from 'lucide-react';
import PausedMenuFrame from '../../root_modals_design_menu/rootFrameMenu';
import { PausedMenuHeader } from '../../root_modals_design_menu/PausedMenuHeader';
import { GAME_SHORTCUTS, type ShortcutDefinition } from './index';
import { useLanguage } from '../terjemahan_paused_menu/languageLogic';

interface KeywordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeywordModal({ isOpen, onClose }: KeywordModalProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');

  if (!isOpen) return null;

  const categoryKeys: Array<{ key: string; idName: string; label: string }> = [
    { key: 'all', idName: 'Semua', label: t('paused_menu.keyboardModal.categories.all') || t('paused_menu.keyboardModal.categoryAll') || 'Semua' },
    { key: 'mainMenu', idName: 'Menu Utama', label: t('paused_menu.keyboardModal.categories.mainMenu') || 'Menu Utama' },
    { key: 'subMenu', idName: 'Sub Menu (Angka)', label: t('paused_menu.keyboardModal.categories.subMenu') || 'Sub Menu (Angka)' },
    { key: 'quickMenu', idName: 'Menu Cepat', label: t('paused_menu.keyboardModal.categories.quickMenu') || 'Menu Cepat' },
    { key: 'timeController', idName: 'Time Controller', label: t('paused_menu.keyboardModal.categories.timeController') || 'Time Controller' },
    { key: 'panelNavigation', idName: 'Navigasi Panel', label: t('paused_menu.keyboardModal.categories.panelNavigation') || 'Navigasi Panel' },
    { key: 'zoomMap', idName: 'Zoom & Map', label: t('paused_menu.keyboardModal.categories.zoomMap') || 'Zoom & Map' },
  ];

  const getLocalizedCategory = (cat: string) => {
    switch (cat) {
      case 'Menu Utama':
        return t('paused_menu.keyboardModal.categories.mainMenu') || cat;
      case 'Sub Menu (Angka)':
        return t('paused_menu.keyboardModal.categories.subMenu') || cat;
      case 'Menu Cepat':
        return t('paused_menu.keyboardModal.categories.quickMenu') || cat;
      case 'Time Controller':
        return t('paused_menu.keyboardModal.categories.timeController') || cat;
      case 'Navigasi Panel':
        return t('paused_menu.keyboardModal.categories.panelNavigation') || cat;
      case 'Zoom & Map':
        return t('paused_menu.keyboardModal.categories.zoomMap') || cat;
      default:
        return cat;
    }
  };

  const getLocalizedDescription = (item: ShortcutDefinition) => {
    if (item.id) {
      const translated = t(`paused_menu.keyboardModal.shortcuts.${item.id}`);
      if (translated && !translated.startsWith('paused_menu.keyboardModal.shortcuts.')) {
        return translated;
      }
    }
    return item.description;
  };

  const allShortcuts: ShortcutDefinition[] = Object.values(GAME_SHORTCUTS);
  const query = searchQuery.toLowerCase().trim();

  const selectedCategoryObj = categoryKeys.find((c) => c.key === selectedCategoryKey);
  const selectedCategoryName = selectedCategoryObj ? selectedCategoryObj.idName : 'Semua';

  const filteredShortcuts = allShortcuts.filter((item) => {
    const matchesCategory = selectedCategoryKey === 'all' || item.category === selectedCategoryName;
    const localizedDesc = getLocalizedDescription(item);
    const localizedCat = getLocalizedCategory(item.category);
    const matchesQuery =
      !query ||
      item.label.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      localizedDesc.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      localizedCat.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <PausedMenuFrame zIndexClass="z-[999999999]">
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden p-4 text-root-text custom-scrollbar sm:p-8">
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
          <PausedMenuHeader
            title={t('paused_menu.keyboardModal.title')}
            onBack={onClose}
            backLabel={t('paused_menu.keyboardModal.backLabel')}
          />

          <div className="mb-4 flex shrink-0 flex-col gap-3 border-b border-root-accent/15 pb-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-root-accent/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('paused_menu.keyboardModal.searchPlaceholder')}
                aria-label={t('paused_menu.keyboardModal.searchAria')}
                className="w-full rounded-lg border border-root-accent/30 bg-root-canvas py-2 pl-8 pr-4 text-xs font-bold text-root-text shadow-inner placeholder:text-root-subtle focus:border-root-accent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label={t('paused_menu.keyboardModal.clearSearchAria')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-root-subtle hover:text-root-accent"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {categoryKeys.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCategoryKey(cat.key)}
                  aria-pressed={selectedCategoryKey === cat.key}
                  className={`cursor-pointer whitespace-nowrap rounded border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${
                    selectedCategoryKey === cat.key
                      ? 'border-root-accent bg-root-accent text-root-canvas shadow-[0_0_10px_rgba(0,255,170,0.3)]'
                      : 'border-root-accent/20 bg-root-canvas text-root-subtle hover:border-root-accent/40 hover:text-root-accent'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {filteredShortcuts.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Command className="h-10 w-10 text-root-subtle/50" />
                <span className="text-xs font-bold uppercase tracking-wider text-root-subtle">
                  {t('paused_menu.keyboardModal.emptyTitle') || 'Tidak ada shortcut ditemukan'}
                </span>
                <p className="text-[10px] text-root-subtle/70">
                  {t('paused_menu.keyboardModal.emptyDesc') || 'Coba ubah kata kunci pencarian atau kategori filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                {filteredShortcuts.map((item, index) => (
                  <div
                    key={`${item.category}-${item.label}-${index}`}
                    className="group flex items-center justify-between rounded-lg border border-root-accent/20 bg-root-canvas p-3 shadow-sm transition-all hover:border-root-accent/50"
                  >
                    <span className="min-w-0 flex-1 text-xs font-bold leading-tight text-root-text transition-colors group-hover:text-root-accent">
                      {getLocalizedDescription(item)}
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