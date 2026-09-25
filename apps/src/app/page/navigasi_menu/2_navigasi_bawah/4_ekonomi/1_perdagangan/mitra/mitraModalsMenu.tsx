// mitra/mitraModalsMenu.tsx

"use client"

import React, { useState } from "react";
import { X, Handshake, ChevronRight, Globe, Plus } from "lucide-react";
import MitraDetailModals from "./mitraDetailModals";
import ConfirmRemoveTradeModal from "./ConfirmRemoveTradeModal";
import TambahMitraBaru from "./tambahMitraBaru";
import { COUNTRIES_DATA } from "../../../../../map_system/map-data";

export interface TradePartner {
  id: number;
  nama_negara: string;
  region: string;
  status_hubungan: string; 
  total_nilai_dagang?: number;
  jenis_perjanjian?: string; 
}

interface MitraModalsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  partners: TradePartner[];
  onOpenBeli?: (partner: TradePartner) => void;
  onOpenJual?: (partner: TradePartner) => void;
  onRemovePartner?: (partnerId: number) => void;
  onAddPartner?: (countryName: string, region: string) => void;
  currentUserCountry?: string;
}

export default function MitraModalsMenu({ 
  isOpen, 
  onClose, 
  partners,
  onOpenBeli,
  onOpenJual,
  onRemovePartner,
  onAddPartner,
  currentUserCountry = "Amerika serikat"
}: MitraModalsMenuProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<TradePartner | null>(null);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TradePartner | null>(null);
  const [isTambahOpen, setIsTambahOpen] = useState(false);

  const getFlagEmoji = (countryName: string) => {
    const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === countryName.toLowerCase().trim());
    if (!matched || !matched.iso) return "";
    const codePoints = matched.iso.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  if (!isOpen) return null;

  const handleBeli = (partner: TradePartner) => {
    setIsDetailOpen(false);
    if (onOpenBeli) onOpenBeli(partner);
  };

  const handleJual = (partner: TradePartner) => {
    setIsDetailOpen(false);
    if (onOpenJual) onOpenJual(partner);
  };

  return (
    <>
      <MitraDetailModals
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        partner={selectedPartner}
        onBeli={handleBeli}
        onJual={handleJual}
      />

      {!isDetailOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 bg-transparent pointer-events-none">
          <div className="bg-[#0F2424] border border-[#00FFAA]/30 rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto">
            <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/20 flex items-center justify-between bg-[#0A1A1A] relative z-10 gap-2 shrink-0 rounded-t-2xl">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 bg-[#0F2424] rounded-lg border border-[#00FFAA]/30 shrink-0">
                  <Handshake className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-bold text-[#00FFAA] tracking-tight leading-none uppercase">Mitra Dagang Global</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 lg:p-2 rounded-xl border border-[#00FFAA]/30 bg-[#0F2424] text-[#6B8A8A] hover:text-[#00FFAA] hover:border-[#00FFAA] transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm">
                <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
              {partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#6B8A8A]">
                  <Globe className="h-12 w-12 mb-3 opacity-30 text-[#00FFAA]" />
                  <p className="text-sm font-bold text-[#E0E0E0]">Belum ada hubungan dagang</p>
                  <p className="text-xs text-[#6B8A8A]">Jalin hubungan dagang dengan negara lain melalui menu Jual/Beli.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partners.map((partner, idx) => (
                    <div 
                      key={idx}
                      className="bg-[#0A1A1A] border border-[#00FFAA]/20 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#00FFAA]/50"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        {/* Flag Image Rendering */}
                        {(() => {
                          const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === partner.nama_negara.toLowerCase().trim());
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
                                alt={partner.nama_negara}
                                className="w-full h-full object-cover absolute inset-0"
                              />
                            </div>
                          );
                        })()}
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-black text-[#E0E0E0] uppercase">{partner.nama_negara}</h4>
                            {partner.jenis_perjanjian && (
                              <span className="px-2 py-0.5 bg-[#00FFAA]/10 text-[#00FFAA] border border-[#00FFAA]/30 rounded-full text-[8px] font-bold uppercase tracking-wider">
                                {partner.jenis_perjanjian}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                              ${partner.status_hubungan === 'Aktif' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' : 
                                partner.status_hubungan === 'Pasif' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30' : 
                                'bg-[#0F2424] text-[#6B8A8A] border border-[#6B8A8A]/30'}`}>
                              {partner.status_hubungan}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#6B8A8A] font-semibold flex items-center gap-1">
                            {partner.region}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {partner.total_nilai_dagang !== undefined && (
                          <div className="text-right">
                            <p className="text-[9px] text-[#6B8A8A] uppercase">Nilai Dagang</p>
                            <p className="text-xs font-black text-[#00FFAA]">{partner.total_nilai_dagang.toLocaleString('id-ID')} EM</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveTarget(partner);
                              setIsRemoveConfirmOpen(true);
                            }}
                            className="px-3 py-2 rounded-lg border border-rose-500/40 text-rose-400 bg-rose-950/30 hover:bg-rose-600 hover:text-white text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Putus Hubungan
                          </button>
                          <ChevronRight className="h-4 w-4 text-[#6B8A8A] group-hover:text-[#00FFAA] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* BUTTON TAMBAH MITRA */}
                  <button
                    onClick={() => setIsTambahOpen(true)}
                    className="bg-[#0A1A1A] border border-dashed border-[#00FFAA]/30 hover:border-[#00FFAA] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-center gap-3 transition-all hover:bg-[#00FFAA]/5 cursor-pointer min-h-[80px]"
                  >
                    <div className="p-2 rounded-full bg-[#00FFAA]/10 border border-[#00FFAA]/30">
                      <Plus className="h-6 w-6 text-[#00FFAA]" />
                    </div>
                    <span className="text-sm font-black text-[#00FFAA] uppercase tracking-wider">Tambah Mitra</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <ConfirmRemoveTradeModal
        isOpen={isRemoveConfirmOpen}
        partnerName={removeTarget?.nama_negara || null}
        onClose={() => { setIsRemoveConfirmOpen(false); setRemoveTarget(null); }}
        onConfirm={() => {
          if (removeTarget && onRemovePartner) onRemovePartner(removeTarget.id);
          setIsRemoveConfirmOpen(false);
          setRemoveTarget(null);
        }}
      />

      <TambahMitraBaru
        isOpen={isTambahOpen}
        onClose={() => setIsTambahOpen(false)}
        currentUserCountry={currentUserCountry}
        partners={partners}
        onAddPartner={(name, region) => {
          if (onAddPartner) onAddPartner(name, region);
          setIsTambahOpen(false);
        }}
      />
    </>
  );
}