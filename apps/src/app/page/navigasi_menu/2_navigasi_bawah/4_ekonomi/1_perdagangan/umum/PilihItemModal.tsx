"use client"
import React from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Handshake, PackageSearch } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";
import { getLocalizedCountryName } from "@/app/logic/countryNameLogic";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

// Definisikan tipe data agar modal bisa menerima format Flat ataupun Grouped
type Item = { label: string; value: string; disabled?: boolean };
type CategoryGroup = { category: string; items: Item[] };

interface PilihItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Item[] | CategoryGroup[]; // <-- Terima kedua format
  onSelect: (value: string) => void;
  selectedValue?: string;
}


export default function PilihItemModal({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  onSelect, 
  selectedValue 
}: PilihItemModalProps) {
  const { language, t } = useLanguage();
  if (!isOpen || typeof document === "undefined") return null;

  // Cek tipe data: Apakah ini array Grouped (memiliki properti 'category')?
  const isGrouped = data.length > 0 && 'category' in data[0];
  const HeaderIcon = title === "Pilih Negara Mitra" ? Handshake : PackageSearch;
  const translatedTitle = title === "Pilih Negara Mitra"
    ? t("navigation_economy_trade.transaction.choosePartner")
    : title === "Pilih Komoditas atau Alutsista"
      ? t("navigation_economy_trade.transaction.chooseProduct")
      : title;
  const categoryKeys: Record<string, string> = {
    "Mineral Kritis": "criticalMinerals",
    "Manufaktur": "manufacturing",
    "Peternakan": "livestock",
    "Agrikultur": "agriculture",
    "Perikanan": "fishery",
    "Olahan Pangan": "foodProcessing",
    "Alutsista Darat": "landArms",
    "Alutsista Laut": "navalArms",
    "Alutsista Udara": "airArms",
  };
  const translatedProduct = (item: Item, category: string) => {
    const isArms = category.startsWith("Alutsista");
    const translationKey = `navigation_economy_trade.transaction.${isArms ? "armsProducts" : "products"}.${item.value}`;
    const translated = t(translationKey);
    return translated.startsWith("navigation_economy_trade.") ? item.label : translated;
  };

  return createPortal(
    <NotebookModalWrapper
      zIndexClass="z-[100000001]"
      onClose={onClose}
    >
      <div className="flex h-full min-w-0 flex-col overflow-hidden">
        <RootInfoModalHeader
          title={translatedTitle}
          onClose={onClose}
          size="standard"
          icon={<HeaderIcon aria-hidden="true" />}
        />

        {/* BODY - Grid Card */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-2 bg-root-surface relative z-10 neon-scrollbar">
          
          {/* RENDER UNTUK DATA BERKATEGORI (PRODUK) */}
          {isGrouped ? (
            (data as CategoryGroup[]).map((group, groupIndex) => (
              <div key={groupIndex} className="mb-8 last:mb-0">
                {/* Judul Kategori */}
                <div className="col-span-full text-[12px] font-black text-root-accent uppercase tracking-wider mb-3 border-b border-root-accent/20 pb-2">
                  {categoryKeys[group.category]
                    ? t(`navigation_economy_trade.transaction.categories.${categoryKeys[group.category]}`)
                    : group.category}
                </div>
                
                {/* Grid Item per Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const isSelected = selectedValue === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        disabled={item.disabled}
                        onClick={() => {
                          if (!item.disabled) {
                            onSelect(item.value);
                            onClose();
                          }
                        }}
                        className={`group flex items-center justify-between px-4 py-3 rounded-md border transition-all duration-200 w-full text-left
                          ${item.disabled 
                            ? 'bg-root-canvas/40 border-root-subtle/20 cursor-not-allowed opacity-50'
                            : 'cursor-pointer ' + (isSelected 
                              ? 'bg-root-accent border-root-accent text-root-canvas font-bold'
                              : 'bg-root-canvas border-root-accent/20 hover:border-root-accent hover:bg-root-accent/10 text-root-text'
                            )
                          }
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-root-canvas' : 'text-root-text'}`}>
                            {translatedProduct(item, group.category)}
                          </span>
                          {item.disabled && (
                            <span className="text-[10px] text-rose-400 font-bold uppercase">{t("navigation_economy_trade.transaction.unavailable")}</span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] text-root-canvas font-extrabold uppercase">{t("navigation_economy_trade.transaction.selected")}</span>
                          )}
                        </div>
                        {!item.disabled && (
                          <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-root-canvas' : 'text-root-accent'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            /* RENDER UNTUK DATA FLAT (NEGARA) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data as Item[]).map((item) => {
                const isSelected = selectedValue === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => { if (!item.disabled) { onSelect(item.value); onClose(); } }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-md border transition-all duration-200 w-full text-left
                      ${item.disabled 
                        ? 'bg-root-canvas/40 border-root-subtle/20 cursor-not-allowed opacity-50'
                        : 'cursor-pointer ' + (isSelected 
                          ? 'bg-root-accent border-root-accent text-root-canvas font-bold'
                          : 'bg-root-canvas border-root-accent/20 hover:border-root-accent hover:bg-root-accent/10 text-root-text'
                        )
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === item.label.toLowerCase().trim());
                        const iso = matched?.iso;
                        if (!iso || iso.length !== 2) {
                          return (
                            <div className="w-8 h-5 rounded-sm bg-root-surface border border-root-accent/20 flex-shrink-0" />
                          );
                        }
                        return (
                          <div className="w-8 h-5 rounded-sm overflow-hidden border border-root-accent/30 flex-shrink-0 bg-root-surface relative">
                            <img
                              src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
                              alt={item.label}
                              className="w-full h-full object-cover absolute inset-0"
                            />
                          </div>
                        );
                      })()}
                      <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-root-canvas' : 'text-root-text'}`}>{getLocalizedCountryName(item.label, language)}</span>
                    </div>
                    {!item.disabled && (
                      <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-root-canvas' : 'text-root-accent'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </NotebookModalWrapper>,
    document.body,
  );
}