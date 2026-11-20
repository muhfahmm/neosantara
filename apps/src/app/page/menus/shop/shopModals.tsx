"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ShoppingBag, Coins, Gem } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import ShopCoinsItems from "./shopCoinsItems";
import ShopGemsItems from "./shopGemsItems";
import PremiumItems from "./premiumItems";
import DiscountItems from "./discountItems";
import AdMenu from "./adMenu";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClick?: () => void;
  isMenuButtonHidden?: boolean;
  playerDiamonds?: number;
  countryDetail?: any;
  initialTab?: "neo" | "gems";
}

export default function ShopModal({
  isOpen,
  onClose,
  onClick,
  isMenuButtonHidden = false,
  playerDiamonds = 500,
  countryDetail,
  initialTab = "neo",
}: ShopModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"neo" | "gems">(initialTab);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const playerKas = Number(countryDetail?.anggaran ?? 0);

  return (
    <>
      {/* Tombol Menu Samping Shop */}
      {mounted && !isMenuButtonHidden && typeof document !== "undefined" && createPortal(
        <button
          type="button"
          onClick={onClick}
          title={t('side_shop.title')}
          className="side-floating-btn side-btn-shop"
        >
          <Image
            src="/images/game/interface/menu/shop.svg"
            alt="Shop"
            aria-hidden="true"
            onError={(event) => {
              // Fallback jika aset svg lokal gagal render
              event.currentTarget.style.display = "none";
            }}
            width={72}
            height={72}
          />
        </button>,
        document.body
      )}

      {/* Modal Halaman Shop */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <NotebookModalWrapper onClose={onClose} zIndexClass="z-[100000]">
          <div className="root-modal-util-b74379da23 font-sans w-full h-full flex flex-col min-h-0 pointer-events-auto">
            {/* Header Modal */}
            <RootInfoModalHeader
              title={t('side_shop.title')}
              onClose={onClose}
              icon={<ShoppingBag />}
              size="standard"
              actions={
                <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-bold">
                  {/* Saldo NEO */}
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-root-accent/30 bg-root-canvas px-2.5 py-1 text-root-accent">
                    <Coins size={14} className="text-amber-400" />
                    <span>{playerKas.toLocaleString("id-ID", { maximumFractionDigits: 0 })} NEO</span>
                  </span>
                  {/* Saldo GEMS */}
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-root-canvas px-2.5 py-1 text-cyan-300">
                    <Gem size={14} className="text-cyan-400" />
                    <span>{playerDiamonds.toLocaleString("id-ID")} Gems</span>
                  </span>
                </div>
              }
            />

            {/* Container Body */}
            <div
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 sm:p-5 flex flex-col gap-4"
              style={{
                backgroundColor: "var(--root-color-canvas)",
              }}
            >
              {/* Tab Navigasi Atas: NEO vs GEMS */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderBottom: "1px solid color-mix(in srgb, var(--root-color-accent) 25%, transparent)",
                  paddingBottom: "0.25rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("neo")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    borderRadius: "var(--root-radius-card, 0.5rem) var(--root-radius-card, 0.5rem) 0 0",
                    border: "none",
                    borderBottom: activeTab === "neo"
                      ? "3px solid var(--root-color-accent)"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "neo"
                      ? "color-mix(in srgb, var(--root-color-accent) 15%, transparent)"
                      : "transparent",
                    color: activeTab === "neo"
                      ? "var(--root-color-accent)"
                      : "var(--root-color-subtle)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Coins size={16} />
                  <span>{t('side_shop.coins')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("gems")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    borderRadius: "var(--root-radius-card, 0.5rem) var(--root-radius-card, 0.5rem) 0 0",
                    border: "none",
                    borderBottom: activeTab === "gems"
                      ? "3px solid #06B6D4"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "gems"
                      ? "color-mix(in srgb, #06B6D4 15%, transparent)"
                      : "transparent",
                    color: activeTab === "gems"
                      ? "#38BDF8"
                      : "var(--root-color-subtle)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Gem size={16} />
                  <span>{t('side_shop.gems')}</span>
                </button>
              </div>

              {/* Area Konten Tab Aktif */}
              <div className="w-full">
                {activeTab === "neo" ? <ShopCoinsItems /> : <ShopGemsItems />}
              </div>

              {/* Section Menu Tambahan: Premium, Diskon, & Iklan */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  marginTop: "0.5rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--root-color-subtle)",
                  }}
                >
                  {t('side_shop.premium')}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  <PremiumItems />
                  <DiscountItems />
                  <AdMenu />
                </div>
              </div>
            </div>
          </div>
        </NotebookModalWrapper>,
        document.body
      )}
    </>
  );
}
