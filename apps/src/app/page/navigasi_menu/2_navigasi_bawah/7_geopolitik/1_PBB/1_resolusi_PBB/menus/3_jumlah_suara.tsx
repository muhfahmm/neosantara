"use client"
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Users } from "lucide-react";
import NotebookModalWrapper from "../../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";

interface CountryOption {
  id: number;
  name: string;
  iso: string;
  continent: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  countries: CountryOption[];
  renderFlag: (iso: string | undefined, altName: string, size?: "sm" | "md") => React.ReactElement | null;
}

export default function CountryListModal({
  isOpen,
  onClose,
  title,
  countries,
  renderFlag
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[200]">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] relative z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>{title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">
                {countries.length} negara terdaftar
              </p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0F2424] relative z-10 custom-scrollbar flex flex-col items-center">
          <div className="w-full">
            {countries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#6B8A8A] font-medium text-lg">Belum ada negara dalam daftar ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {countries.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-[#00FFAA]/20 bg-[#0A1A1A] hover:border-[#00FFAA]/50 transition-all w-full"
                  >
                    {renderFlag(c.iso, c.name)}
                    <span className="text-sm font-semibold text-[#E0E0E0]">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}