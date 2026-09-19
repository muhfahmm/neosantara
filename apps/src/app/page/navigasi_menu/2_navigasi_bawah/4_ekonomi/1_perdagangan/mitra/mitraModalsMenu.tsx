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
          <div className="bg-[#FAF6EE] border-2 sm:border-3 border-[#C4B49C] rounded-2xl overflow-hidden w-full max-w-3xl lg:max-w-[920px] xl:max-w-[1020px] 2xl:max-w-5xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.03)_0%,transparent_100%)] pointer-events-none" />
            <div className="px-6 py-5 border-b-2 border-[#C4B49C]/30 flex items-center justify-between bg-[#FAF6EE] relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#5c3c10]/10 rounded-xl border border-[#5c3c10]/20">
                  <Handshake className="h-6 w-6 text-[#5c3c10]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#5c3c10] tracking-tight uppercase">Mitra Dagang Global</h2>
                  <p className="text-[10px] text-[#8b7e66] font-semibold">Jalin hubungan dagang dengan negara-negara di seluruh dunia</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 sm:p-2.5 rounded-xl border-2 border-[#C4B49C] bg-transparent text-[#8b7e66] hover:text-[#5c3c10] hover:bg-black/5 active:bg-black/10 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 relative z-10 no-scrollbar">
              {partners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-[#8b7e66]">
                  <Globe className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm font-bold">Belum ada hubungan dagang</p>
                  <p className="text-xs">Jalin hubungan dagang dengan negara lain melalui menu Jual/Beli.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partners.map((partner, idx) => (
                    <div 
                      key={idx}
                      className="bg-white/70 border border-[#C4B49C]/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:shadow-md hover:border-[#5c3c10]/50"
                    >
                      <div className="flex-1 flex items-center gap-3">
                        {/* Flag Image Rendering (Pinjaman & Hutang style) */}
                        {(() => {
                          const matched = COUNTRIES_DATA.find(c => c.country.toLowerCase().trim() === partner.nama_negara.toLowerCase().trim());
                          const iso = matched?.iso;
                          if (!iso || iso.length !== 2) {
                            return (
                              <div className="w-8 h-5 rounded-sm bg-[#e4dac3] border border-[#5c3c10]/20 flex-shrink-0 shadow-sm" />
                            );
                          }
                          return (
                            <div className="w-8 h-5 rounded-sm overflow-hidden border border-[#5c3c10]/20 flex-shrink-0 shadow-sm bg-[#e4dac3] relative">
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
                            <h4 className="text-sm font-black text-[#5c3c10] uppercase">{partner.nama_negara}</h4>
                            {partner.jenis_perjanjian && (
                              <span className="px-2 py-0.5 bg-blue-600/10 text-blue-700 border border-blue-600/20 rounded-full text-[8px] font-bold uppercase tracking-wider">
                                {partner.jenis_perjanjian}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider
                              ${partner.status_hubungan === 'Aktif' ? 'bg-emerald-600/10 text-emerald-700 border border-emerald-600/20' : 
                                partner.status_hubungan === 'Pasif' ? 'bg-amber-600/10 text-amber-700 border border-amber-600/20' : 
                                'bg-gray-300/30 text-[#8b7e66]'}`}>
                              {partner.status_hubungan}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8b7e66] font-semibold flex items-center gap-1">
                            {partner.region}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {partner.total_nilai_dagang !== undefined && (
                          <div className="text-right">
                            <p className="text-[9px] text-[#8b7e66] uppercase">Nilai Dagang</p>
                            <p className="text-xs font-black text-[#5c3c10]">{partner.total_nilai_dagang.toLocaleString('id-ID')} EM</p>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          {/* --- PERBAIKAN: Tambahkan cursor-pointer --- */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveTarget(partner);
                              setIsRemoveConfirmOpen(true);
                            }}
                            className="px-3 py-2 rounded-lg border-2 border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Putus Hubungan
                          </button>
                          <ChevronRight className="h-4 w-4 text-[#C4B49C] group-hover:text-[#5c3c10] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* TAMBAHAN BUTTON TAMBAH MITRA */}
                  <button
                    onClick={() => setIsTambahOpen(true)}
                    className="bg-white/70 border-2 border-dashed border-[#C4B49C]/60 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-center gap-3 transition-all hover:border-[#5c3c10] hover:bg-[#FAF6EE] hover:shadow-md cursor-pointer min-h-[80px]"
                  >
                    <div className="p-2 rounded-full bg-[#5c3c10]/10 border border-[#5c3c10]/20">
                      <Plus className="h-6 w-6 text-[#5c3c10]" />
                    </div>
                    <span className="text-sm font-black text-[#5c3c10] uppercase tracking-wider">Tambah Mitra</span>
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