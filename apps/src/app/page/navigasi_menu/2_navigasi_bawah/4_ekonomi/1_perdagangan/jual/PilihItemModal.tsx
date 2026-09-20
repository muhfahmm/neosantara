"use client"
import React from "react";
import { X, ChevronRight } from "lucide-react";

import { COUNTRIES_DATA } from "../../../../../map_system/map-data";

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
  if (!isOpen) return null;

  // Cek tipe data: Apakah ini array Grouped (memiliki properti 'category')?
  const isGrouped = data.length > 0 && 'category' in data[0];

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
      {/* ------- MODAL UTAMA ------- */}
      <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10">
          <h2 className="text-2xl font-bold text-[#00FFAA] tracking-tight uppercase">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#00FFAA] hover:bg-[#00FFAA] hover:text-[#0A1A1A] transition-all cursor-pointer font-black text-xs uppercase flex items-center gap-1.5"
          >
            <span className="text-[10px] font-black uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* BODY - Grid Card */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0F2424] relative z-10 no-scrollbar">
          
          {/* RENDER UNTUK DATA BERKATEGORI (PRODUK) */}
          {isGrouped ? (
            (data as CategoryGroup[]).map((group, groupIndex) => (
              <div key={groupIndex} className="mb-8 last:mb-0">
                {/* Judul Kategori */}
                <div className="col-span-full text-[12px] font-black text-[#00FFAA] uppercase tracking-wider mb-3 border-b border-[#00FFAA]/20 pb-2">
                  {group.category}
                </div>
                
                {/* Grid Item per Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item) => {
                    const isSelected = selectedValue === item.value;
                    return (
                      <button
                        key={item.value}
                        disabled={item.disabled}
                        onClick={() => {
                          if (!item.disabled) {
                            onSelect(item.value);
                            onClose();
                          }
                        }}
                        className={`group flex items-center justify-between p-5 rounded-xl border transition-all duration-200 w-full text-left
                          ${item.disabled 
                            ? 'bg-[#0A1A1A]/40 border-[#6B8A8A]/20 cursor-not-allowed opacity-50' 
                            : 'cursor-pointer ' + (isSelected 
                              ? 'bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-bold' 
                              : 'bg-[#0A1A1A] border-[#00FFAA]/20 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 text-[#E0E0E0]'
                            )
                          }
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-[#0A1A1A]' : 'text-[#E0E0E0]'}`}>
                            {item.label}
                          </span>
                          {item.disabled && (
                            <span className="text-[10px] text-rose-400 font-bold uppercase">Tidak Tersedia</span>
                          )}
                          {isSelected && (
                            <span className="text-[10px] text-[#0A1A1A] font-extrabold uppercase">Terpilih</span>
                          )}
                        </div>
                        {!item.disabled && (
                          <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-[#0A1A1A]' : 'text-[#00FFAA]'}`} />
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
                    disabled={item.disabled}
                    onClick={() => { if (!item.disabled) { onSelect(item.value); onClose(); } }}
                    className={`group flex items-center justify-between p-5 rounded-xl border transition-all duration-200 w-full text-left
                      ${item.disabled 
                        ? 'bg-[#0A1A1A]/40 border-[#6B8A8A]/20 cursor-not-allowed opacity-50' 
                        : 'cursor-pointer ' + (isSelected 
                          ? 'bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-bold' 
                          : 'bg-[#0A1A1A] border-[#00FFAA]/20 hover:border-[#00FFAA] hover:bg-[#00FFAA]/10 text-[#E0E0E0]'
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
                            <div className="w-8 h-5 rounded-sm bg-[#0F2424] border border-[#00FFAA]/20 flex-shrink-0" />
                          );
                        }
                        return (
                          <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#00FFAA]/30 flex-shrink-0 bg-[#0F2424] relative">
                            <img
                              src={`https://flagcdn.com/w80/${iso.toLowerCase()}.png`}
                              alt={item.label}
                              className="w-full h-full object-cover absolute inset-0"
                            />
                          </div>
                        );
                      })()}
                      <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-[#0A1A1A]' : 'text-[#E0E0E0]'}`}>{item.label}</span>
                    </div>
                    {!item.disabled && (
                      <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-[#0A1A1A]' : 'text-[#00FFAA]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}