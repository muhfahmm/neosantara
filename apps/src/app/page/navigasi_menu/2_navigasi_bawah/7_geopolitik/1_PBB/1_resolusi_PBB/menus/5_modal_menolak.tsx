"use client"
import { useGeopoliticsMenuTranslation } from "@/app/page/paused_menu/terjemahan_paused_menu/useGeopoliticsMenuTranslation";
import SharedModalCloseButton from '@/app/page/root_modals_design_menu/ModalCloseButton';
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ThumbsDown, Search } from "lucide-react";
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

export default function ModalMenolak({
  isOpen,
  onClose,
  resolutionTitle,
  countries,
  userVote,
  renderFlag,
  onBribeCountry
}: Props) {
  const { language, pbb } = useGeopoliticsMenuTranslation();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.continent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Jika pilihan user sudah sama dengan modal ini (Menolak), tidak perlu ada tombol suap
  const isUserSameAsModal = userVote === 'no';

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center pt-[100px] sm:pt-[110px] lg:pt-[115px] pb-[16px] sm:pb-[20px] lg:pb-[20px] px-4 sm:px-8 pointer-events-none">
      <div className="modal-responsive-shell bg-root-surface border border-rose-500/40 rounded-2xl overflow-hidden flex flex-col relative font-sans pointer-events-auto shadow-2xl shadow-rose-950/50">
        
        {/* Header Modal Menolak */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-b border-rose-500/30 flex items-center justify-between bg-root-canvas relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/30">
              <ThumbsDown className="h-5 w-5 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-rose-400 tracking-tight leading-none uppercase flex items-center gap-2">
                {pbb("vote.assembly.noTitle")}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">
                {resolutionTitle ? pbb("common.resolutionProposed", { title: resolutionTitle, count: countries.length }) : pbb("vote.totalCountries", { count: countries.length })}
              </p>
            </div>
          </div>
          <SharedModalCloseButton
            onClick={onClose}
            className="p-1.5 lg:p-2 rounded-xl border border-rose-500/30 bg-root-surface text-root-subtle hover:text-rose-400 hover:border-rose-500 transition-all cursor-pointer font-bold text-xs uppercase flex items-center gap-1 shadow-sm"
           appearance="custom">
            <span className="text-[10px] lg:text-xs font-semibold uppercase tracking-widest pl-1">{pbb("common.close")}</span>
            <X className="h-4 w-4" />
          </SharedModalCloseButton>
        </div>

        {/* Input Pencarian */}
        <div className="px-4 sm:px-6 py-2.5 bg-root-canvas/80 border-b border-rose-500/20 flex items-center gap-2 shrink-0">
          <Search className="w-4 h-4 text-root-subtle" />
          <input
            type="text"
            placeholder={pbb("common.searchCountry")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-root-text placeholder-root-subtle focus:outline-none w-full"
          />
        </div>

        {/* Content Body: Grid Daftar Negara */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-root-surface relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-root-subtle font-medium text-sm">{pbb("common.noResults")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                {filtered.map((c, idx) => {
                  const isProposer = c.isProposer;
                  const isTarget = c.isTarget;
                  const isUser = c.isUser;
                  const showBribeButton = Boolean(userVote) && !isProposer && !isTarget && !isUser && !isUserSameAsModal;

                  return (
                    <div
                      key={`${c.iso}-${c.name}`}
                      className={`flex items-center justify-between gap-2 p-3 rounded-xl bg-root-canvas transition-all w-full ${
                        isUser
                          ? "border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 bg-cyan-950/30"
                          : isTarget
                          ? "border-2 border-rose-500 shadow-lg shadow-rose-500/20 bg-rose-950/20"
                          : isProposer
                          ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 bg-emerald-950/20"
                          : "border border-rose-500/20 hover:border-rose-500/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {renderFlag(c.iso, c.name, "md")}
                        <div className="flex flex-col overflow-hidden min-w-0">
                          <span className="text-xs font-bold text-root-text truncate">
                            {c.name}
                          </span>
                          <span className="text-[9px] font-semibold text-rose-400/80 uppercase tracking-wider truncate">
                            {isUser ? (
                              <span className="text-[9px] font-black uppercase text-cyan-400">
                                {pbb("vote.playerVote", { country: c.name })}
                              </span>
                            ) : isTarget ? (
                              <span className="text-[9px] font-black uppercase text-rose-400">
                                {pbb("vote.targetCountry")}
                              </span>
                            ) : isProposer ? (
                              <span className="text-[9px] font-black uppercase text-emerald-400">
                                {pbb("common.proposerBadge")}
                              </span>
                            ) : (
                              c.continent || pbb("common.unknownContinent")
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {showBribeButton && onBribeCountry && (
                          <button
                            type="button"
                            title={pbb("vote.bribeTitle", { country: c.name, amount: formatBribeCost(c.name, language) })}
                            onClick={() => userVote && onBribeCountry(c.iso, userVote)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/30 active:scale-95 transition-all text-[10px] font-black uppercase flex items-center gap-1 cursor-pointer shadow-sm"
                          >
                            <span>{pbb("vote.bribeButton", { amount: formatBribeCost(c.name, language) })}</span>
                          </button>
                        )}
                        <span className="text-[10px] font-extrabold text-root-subtle bg-[#051111] px-2 py-0.5 rounded border border-root-accent/10">
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
