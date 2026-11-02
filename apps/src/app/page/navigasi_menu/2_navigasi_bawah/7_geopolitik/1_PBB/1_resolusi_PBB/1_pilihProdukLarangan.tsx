"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Check, Package } from "lucide-react";
import NotebookModalWrapper from "../../../NotebookModalWrapper";
import RootModalCloseButton from "@/app/page/root_modals_design_menu/RootModalCloseButton";
import { rootModalTypography } from "@/app/page/root_modals_design_menu/rootModalTypography";
import {
  formatProductionProductName,
  PRODUCTION_BAN_CATEGORIES,
} from "./logic/productionBanCatalog";

interface PilihProdukLaranganProps {
  isOpen: boolean;
  selectedProductKey: string | null;
  onClose: () => void;
  onSelect: (productKey: string) => void;
}

export default function PilihProdukLarangan({
  isOpen,
  selectedProductKey,
  onClose,
  onSelect,
}: PilihProdukLaranganProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(PRODUCTION_BAN_CATEGORIES[0].id);

  if (!isOpen || typeof document === "undefined") return null;

  const activeCategory = PRODUCTION_BAN_CATEGORIES.find(category => category.id === activeCategoryId)
    || PRODUCTION_BAN_CATEGORIES[0];

  return createPortal(
    <NotebookModalWrapper onClose={onClose} zIndexClass="z-[220]">
      <div className="flex h-full flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#00FFAA]/30 flex items-center justify-between bg-[#0A1A1A] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-[#0F2424] rounded-xl border border-[#00FFAA]/30">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-[#00FFAA]" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>Pilih Produk yang Dilarang</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#6B8A8A] mt-1">Pilih satu produk dari sektor produksi negara.</p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="flex-1 flex min-h-0">
          <nav className="w-40 sm:w-48 lg:w-52 border-r border-[#00FFAA]/20 bg-[#0A1A1A] p-2 sm:p-3 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar shrink-0">
            {PRODUCTION_BAN_CATEGORIES.map(category => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  activeCategory.id === category.id
                    ? "bg-[#00FFAA] border-[#00FFAA] text-[#0A1A1A] font-black shadow-md"
                    : "bg-[#0F2424] border-[#00FFAA]/20 text-[#E0E0E0] hover:border-[#00FFAA]/50 hover:text-[#00FFAA]"
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{category.label}</span>
                <span className="text-[10px] font-black">{category.products.length}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-sm sm:text-base font-black text-[#E0E0E0] uppercase tracking-wider">{activeCategory.label}</h4>
              <span className="text-[10px] font-bold text-[#6B8A8A] uppercase">{activeCategory.products.length} produk</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategory.products.map(productKey => {
                const isSelected = selectedProductKey === productKey;
                return (
                  <button
                    type="button"
                    key={productKey}
                    onClick={() => onSelect(productKey)}
                    className={`min-h-20 p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "border-[#00FFAA] bg-[#00FFAA]/15 text-[#00FFAA] shadow-[0_0_12px_rgba(0,255,170,0.18)]"
                        : "border-[#00FFAA]/20 bg-[#0A1A1A] text-[#E0E0E0] hover:border-[#00FFAA]/60 hover:bg-[#00FFAA]/5"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{formatProductionProductName(productKey)}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#00FFAA]" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 border-t border-[#00FFAA]/20 bg-[#0A1A1A] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#00FFAA]/30 bg-[#00FFAA]/10 text-[#00FFAA] hover:bg-[#00FFAA]/20 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Resolusi
          </button>
          {selectedProductKey && (
            <span className="text-right text-[10px] sm:text-xs font-bold text-[#00FFAA]">
              Dipilih: {formatProductionProductName(selectedProductKey)}
            </span>
          )}
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}
