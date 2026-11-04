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
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-root-accent/30 flex items-center justify-between bg-root-canvas shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-root-surface rounded-xl border border-root-accent/30">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-root-accent" />
            </div>
            <div>
              <h3 className={rootModalTypography.title}>Pilih Produk yang Dilarang</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-root-subtle mt-1">Pilih satu produk dari sektor produksi negara.</p>
            </div>
          </div>
          <RootModalCloseButton onClick={onClose} />
        </div>

        <div className="flex-1 flex min-h-0">
          <nav className="w-40 sm:w-48 lg:w-52 border-r border-root-accent/20 bg-root-canvas p-2 sm:p-3 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar shrink-0">
            {PRODUCTION_BAN_CATEGORIES.map(category => (
              <button
                type="button"
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  activeCategory.id === category.id
                    ? "bg-root-accent border-root-accent text-root-canvas font-black shadow-md"
                    : "bg-root-surface border-root-accent/20 text-root-text hover:border-root-accent/50 hover:text-root-accent"
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">{category.label}</span>
                <span className="text-[10px] font-black">{category.products.length}</span>
              </button>
            ))}
          </nav>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 custom-scrollbar">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h4 className="text-sm sm:text-base font-black text-root-text uppercase tracking-wider">{activeCategory.label}</h4>
              <span className="text-[10px] font-bold text-root-subtle uppercase">{activeCategory.products.length} produk</span>
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
                        ? "border-root-accent bg-root-accent/15 text-root-accent shadow-[0_0_12px_rgba(0,255,170,0.18)]"
                        : "border-root-accent/20 bg-root-canvas text-root-text hover:border-root-accent/60 hover:bg-root-accent/5"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold">{formatProductionProductName(productKey)}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-root-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-3 sm:py-4 border-t border-root-accent/20 bg-root-canvas shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-root-accent/30 bg-root-accent/10 text-root-accent hover:bg-root-accent/20 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Resolusi
          </button>
          {selectedProductKey && (
            <span className="text-right text-[10px] sm:text-xs font-bold text-root-accent">
              Dipilih: {formatProductionProductName(selectedProductKey)}
            </span>
          )}
        </div>
      </div>
    </NotebookModalWrapper>,
    document.body
  );
}