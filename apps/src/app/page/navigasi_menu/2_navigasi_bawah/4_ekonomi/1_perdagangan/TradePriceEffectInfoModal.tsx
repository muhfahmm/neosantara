"use client";

import { ArrowRightLeft } from "lucide-react";
import NotebookModalWrapper from "../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

export interface TradePriceBonus {
  id: string;
  title: string;
  category: string;
  desc: string;
  sellBonusText?: string;
  buyDiscountText?: string;
}

interface TradePriceEffectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  bonuses: TradePriceBonus[];
}

export default function TradePriceEffectInfoModal({
  isOpen,
  onClose,
  bonuses,
}: TradePriceEffectInfoModalProps) {
  if (!isOpen) return null;

  return (
    <NotebookModalWrapper
      compact
      maxWidthClass="max-w-2xl"
      onClose={onClose}
      zIndexClass="z-[200]"
    >
      <div className="flex min-w-0 flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/20 flex items-center justify-between bg-root-canvas relative z-10 gap-2 shrink-0 rounded-t-2xl">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-1.5 rounded-lg bg-root-surface border border-root-accent/30 shrink-0">
              <ArrowRightLeft className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div className="min-w-0">
              <h2 className={rootModalTypography.title}>
                Informasi Efek Harga Perdagangan
              </h2>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="root-no-scrollbar-glow overflow-y-auto p-4 sm:p-5 bg-root-surface neon-scrollbar space-y-3">
          {bonuses.length === 0 ? (
            <div className="p-4 rounded-xl bg-root-canvas border border-root-accent/20 text-center space-y-2">
              <p className={`${rootModalTypography.body} break-words`}>
                Belum ada bonus harga perdagangan yang aktif.
              </p>
              <p className={`${rootModalTypography.body} ${rootModalTypography.muted} mx-auto max-w-lg break-words`}>
                Bergabunglah dengan WTO atau OPEC, tingkatkan Kementerian Perdagangan, riset Diplomasi Dagang, atau terapkan agama terkait.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-root-accent/15">
                <span className="text-[10px] font-black uppercase tracking-wider text-root-accent">
                  Daftar Bonus Aktif ({bonuses.length})
                </span>
              </div>

              {bonuses.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-emerald-500/40 bg-[#0E2A20] text-emerald-200 shadow-sm space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 tracking-wider">
                        {item.category}
                      </span>
                      <h4 className="mt-0.5 min-w-0 break-words text-xs font-black text-white">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <p className="min-w-0 break-words text-[10px] leading-snug text-[#C3D5D5]">
                    {item.desc}
                  </p>

                  <div className="pt-1.5 border-t border-emerald-500/20 flex flex-wrap gap-1.5 text-[10px] font-black">
                    {item.sellBonusText && (
                      <span className="inline-flex min-w-0 max-w-full items-center break-words px-2 py-0.5 rounded bg-root-surface border border-emerald-500/40 text-emerald-300">
                        • {item.sellBonusText}
                      </span>
                    )}
                    {item.buyDiscountText && (
                      <span className="inline-flex min-w-0 max-w-full items-center break-words px-2 py-0.5 rounded bg-root-surface border border-emerald-500/40 text-emerald-300">
                        • {item.buyDiscountText}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </NotebookModalWrapper>
  );
}