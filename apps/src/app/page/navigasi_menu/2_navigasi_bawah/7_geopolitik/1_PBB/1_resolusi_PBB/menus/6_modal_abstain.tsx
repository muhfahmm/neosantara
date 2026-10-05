"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, MinusCircle, Search } from "lucide-react";
import { formatBribeCost } from "../logic/resolusiPBBUILogic";

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
  onBribeCountry?: (countryIso: string, targetVote: 'yes' | 'no' | 'abstain') => void;
}

export default function ModalAbstain({
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

  // Jika pilihan user sudah sama dengan modal ini (Abstain), tidak perlu ada tombol suap
  const isUserSameAsModal = userVote === 'abstain';
  const targetBribeVote = userVote || 'yes';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="bg-[#0F2424] border border-slate-500/40 rounded-2xl overflow-hidden w-full max-w-4xl lg:max-w-[980px] xl:max-w-[1080px] 2xl:max-w-6xl h-full max-h-[calc(100vh-125px)] sm:max-h-[calc(100vh-138px)] lg:max-h-[calc(100vh-145px)] flex flex-col relative font-sans pointer-events-auto shadow-2xl shadow-slate-950/50">
        
        {/* Header Modal Abstain */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-500/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-500/10 rounded-xl border border-slate-500/30">
              <MinusCircle className="h-5 w-5 text-slate-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-300 tracking-tight leading-none uppercase flex items-center gap-2">
                Daftar Negara Abstain (Netral / Tidak Memilih)
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {resolutionTitle ? `Usulan: ${resolutionTitle} • ` : ''}Total {countries.length} Negara
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-slate-500/30 bg-[#0F2424] text-[#6B8A8A] hover:text-slate-300 hover:border-slate-500 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
          >
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">Tutup</span>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Input Pencarian */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0A1A1A]/80 border-b border-slate-500/20 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-[#6B8A8A]" />
          <input
            type="text"
            placeholder="Cari nama negara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-[#E0E0E0] placeholder-[#6B8A8A] focus:outline-none w-full"
          />
        </div>

        {/* Content Body: Grid Daftar Negara */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#6B8A8A] font-medium text-sm">Tidak ada negara yang ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                {filtered.map((c, idx) => {
                  const isProposer = c.isProposer;
                  const isTarget = c.isTarget;
                  const isUser = c.isUser;
                  const showBribeButton = !isProposer && !isTarget && !isUser && !isUserSameAsModal;

                  return (
                    <div
                      key={`${c.iso}-${c.name}`}
                      className={`flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0A1A1A] transition-all w-full ${
                        isUser
                          ? "border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 bg-cyan-950/30"
                          : isProposer
                          ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 bg-emerald-950/20"
                          : isTarget
                          ? "border-2 border-rose-500 shadow-lg shadow-rose-500/20 bg-rose-950/20"
                          : "border border-slate-500/20 hover:border-slate-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {renderFlag(c.iso, c.name, "md")}
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="text-xs font-bold text-[#E0E0E0] truncate">
                            {c.name}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400/80 uppercase tracking-wider truncate">
                            {isUser ? (
                              <span className="text-[9px] font-black uppercase text-cyan-400">
                                👤 SUARA ANDA ({c.name})
                              </span>
                            ) : isProposer ? (
                              <span className="text-[9px] font-black uppercase text-emerald-400">
                                🏛️ PENGUSUL RESOLUSI
                              </span>
                            ) : isTarget ? (
                              <span className="text-[9px] font-black uppercase text-rose-400">
                                🎯 NEGARA TARGET
                              </span>
                            ) : (
                              c.continent || 'Anggota PBB'
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {showBribeButton && onBribeCountry && (
                          <button
                            type="button"
                            title={`Suap ${c.name} (${formatBribeCost(c.name)})`}
                            onClick={() => onBribeCountry(c.iso, targetBribeVote)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <span>💰 Suap ({formatBribeCost(c.name)})</span>
                          </button>
                        )}
                        <span className="text-[10px] font-extrabold text-[#6B8A8A] bg-[#051111] px-2 py-0.5 rounded border border-[#00FFAA]/10">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
