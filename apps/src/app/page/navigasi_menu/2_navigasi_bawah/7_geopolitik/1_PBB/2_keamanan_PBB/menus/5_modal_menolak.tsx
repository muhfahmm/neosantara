"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ThumbsDown, Search } from "lucide-react";
import { formatBribeCost } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/2_keamanan_PBB/logic/keamananPBBUILogic";

interface CountryOption {
  id: number;
  name: string;
  iso: string;
  continent: string;
  isProposer?: boolean;
  isTarget?: boolean;
  isUser?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resolutionTitle?: string;
  countries: CountryOption[];
  userVote?: 'yes' | 'no' | 'abstain' | null;
  renderFlag: (iso: string | undefined, altName: string, size?: "sm" | "md") => React.ReactElement | null;
  onBribeCountry?: (countryIso: string, targetVote: 'yes' | 'no' | 'abstain' | 'veto') => void;
}

export default function ModalMenolak({
  isOpen,
  onClose,
  resolutionTitle,
  countries,
  userVote,
  renderFlag,
  onBribeCountry
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.continent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isUserSameAsModal = userVote === 'no';
  const targetBribeVote = userVote || 'yes';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-[#1A0F0F] border border-rose-500/40 rounded-2xl overflow-hidden w-full max-w-4xl lg:max-w-[980px] xl:max-w-[1080px] 2xl:max-w-6xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl shadow-rose-950/50">
        
        {/* Header Modal Menolak */}
        <div className="px-4 sm:px-6 py-3 border-b border-rose-500/30 flex items-center justify-between bg-[#140A0A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/30">
              <ThumbsDown className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-rose-400 tracking-tight leading-none uppercase flex items-center gap-2">
                Daftar Anggota DK PBB Menolak
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8A6B6B] mt-1">
                {resolutionTitle ? `Usulan: ${resolutionTitle} • ` : ''}Total {countries.length} Anggota DK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-[#1A0F0F] text-[#8A6B6B] hover:text-rose-400 hover:border-rose-500 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#140A0A]/80 border-b border-rose-500/20 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-[#8A6B6B]" />
          <input
            type="text"
            placeholder="Cari nama negara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-[#E0E0E0] placeholder-[#8A6B6B] focus:outline-none w-full"
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#1A0F0F] relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#8A6B6B] font-medium text-sm">Tidak ada negara yang ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                {filtered.map((country, index) => {
                  const borderStyle = country.isProposer
                    ? "border-2 border-emerald-400 shadow-md shadow-emerald-500/20 bg-[#140A0A]"
                    : country.isTarget
                    ? "border-2 border-rose-500 shadow-md shadow-rose-500/20 bg-[#140A0A]"
                    : country.isUser
                    ? "border-2 border-cyan-400 shadow-md shadow-cyan-500/20 bg-[#140A0A]"
                    : "border border-rose-500/20 bg-[#140A0A]/60 hover:border-rose-500/40 hover:bg-[#140A0A]";

                  return (
                    <div
                      key={`${country.iso}-${index}`}
                      className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-all ${borderStyle}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[11px] font-black text-rose-400/80 w-6 text-right shrink-0">
                          #{index + 1}
                        </span>
                        {renderFlag(country.iso, country.name, "md")}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-xs font-bold text-[#E0E0E0] truncate">
                              {country.name}
                            </h4>
                            {country.isProposer && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                                Pengusul
                              </span>
                            )}
                            {country.isTarget && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/40">
                                Target
                              </span>
                            )}
                            {country.isUser && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                                👤 Suara Anda
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#8A6B6B] font-medium">
                            {country.continent}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Suap (Disembunyikan jika vote negara sama dengan vote user) */}
                      {!isUserSameAsModal && !country.isUser && (
                        <button
                          onClick={() => onBribeCountry && onBribeCountry(country.iso, targetBribeVote)}
                          className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-400 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          💸 Suap (${formatBribeCost(country.name)})
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-2.5 bg-[#140A0A] border-t border-rose-500/20 flex items-center justify-between text-[11px] font-bold text-[#8A6B6B] shrink-0">
          <span>Dewan Keamanan PBB • {countries.length} Suara Menolak</span>
          <span className="text-rose-400 uppercase">Status: Menolak Usulan</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
