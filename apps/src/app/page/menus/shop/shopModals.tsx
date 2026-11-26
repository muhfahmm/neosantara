"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ShoppingBag, Coins, Gem, Crown, Tag, PlaySquare } from "lucide-react";
import NotebookModalWrapper from "@/app/page/navigasi_menu/2_navigasi_bawah/NotebookModalWrapper";
import RootInfoModalHeader from "@/app/page/root_modals_design_menu/RootInfoModalHeader";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";
import ShopCoinsItems from "./shopCoinsItems";
import ShopGemsItems from "./shopGemsItems";
import PremiumItems from "./premiumItems";
import DiscountItems from "./discountItems";
import AdMenu from "./adMenu";

type ShopTabType = "neo" | "gems" | "premium" | "discount" | "ads";

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClick?: () => void;
  isMenuButtonHidden?: boolean;
  playerDiamonds?: number;
  countryDetail?: any;
  initialTab?: ShopTabType;
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
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<ShopTabType>(initialTab);
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
          aria-label={t('side_shop.title')}
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
                    <span>{playerKas.toLocaleString(language, { maximumFractionDigits: 0 })} NEO</span>
                  </span>
                  {/* Saldo GEMS */}
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-root-canvas px-2.5 py-1 text-cyan-300">
                    <Gem size={14} className="text-cyan-400" />
                    <span>{playerDiamonds.toLocaleString(language)} {t("side_shop.gemUnit")}</span>
                  </span>
                </div>
              }
            />

            {/* Container Body */}
            <div
              className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2.5 sm:p-4 flex flex-col gap-2.5 sm:gap-3"
              style={{
                backgroundColor: "var(--root-color-canvas)",
              }}
            >
              {/* Tab Navigasi Atas: Kategori Toko */}
              <div className="shop-tabs-bar">
                {/* 1. Item NEO (Koin) */}
                <button
                  type="button"
                  onClick={() => setActiveTab("neo")}
                  className="shop-tab-btn"
                  title={t('side_shop.coins')}
                  style={{
                    borderBottom: activeTab === "neo"
                      ? "3px solid var(--root-color-accent)"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "neo"
                      ? "color-mix(in srgb, var(--root-color-accent) 15%, transparent)"
                      : "transparent",
                    color: activeTab === "neo"
                      ? "var(--root-color-accent)"
                      : "var(--root-color-subtle)",
                  }}
                >
                  <Coins />
                  <span>{t('side_shop.coins')}</span>
                </button>

                {/* 2. Item GEMS */}
                <button
                  type="button"
                  onClick={() => setActiveTab("gems")}
                  className="shop-tab-btn"
                  title={t('side_shop.gems')}
                  style={{
                    borderBottom: activeTab === "gems"
                      ? "3px solid #06B6D4"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "gems"
                      ? "color-mix(in srgb, #06B6D4 15%, transparent)"
                      : "transparent",
                    color: activeTab === "gems"
                      ? "#38BDF8"
                      : "var(--root-color-subtle)",
                  }}
                >
                  <Gem />
                  <span>{t('side_shop.gems')}</span>
                </button>

                {/* 3. Item Premium */}
                <button
                  type="button"
                  onClick={() => setActiveTab("premium")}
                  className="shop-tab-btn"
                  title={t('side_shop.premiumItems.title')}
                  style={{
                    borderBottom: activeTab === "premium"
                      ? "3px solid #F59E0B"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "premium"
                      ? "color-mix(in srgb, #F59E0B 15%, transparent)"
                      : "transparent",
                    color: activeTab === "premium"
                      ? "#FBBF24"
                      : "var(--root-color-subtle)",
                  }}
                >
                  <Crown />
                  <span>{t('side_shop.premiumItems.title')}</span>
                </button>

                {/* 4. Item Diskon */}
                <button
                  type="button"
                  onClick={() => setActiveTab("discount")}
                  className="shop-tab-btn"
                  title={t('side_shop.discountItems.title')}
                  style={{
                    borderBottom: activeTab === "discount"
                      ? "3px solid var(--root-color-danger, #EF4444)"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "discount"
                      ? "color-mix(in srgb, var(--root-color-danger, #EF4444) 15%, transparent)"
                      : "transparent",
                    color: activeTab === "discount"
                      ? "var(--root-color-danger, #EF4444)"
                      : "var(--root-color-subtle)",
                  }}
                >
                  <Tag />
                  <span>{t('side_shop.discountItems.title')}</span>
                </button>

                {/* 5. Iklan Berhadiah */}
                <button
                  type="button"
                  onClick={() => setActiveTab("ads")}
                  className="shop-tab-btn"
                  title={t('side_shop.adItems.title')}
                  style={{
                    borderBottom: activeTab === "ads"
                      ? "3px solid #10B981"
                      : "3px solid transparent",
                    backgroundColor: activeTab === "ads"
                      ? "color-mix(in srgb, #10B981 15%, transparent)"
                      : "transparent",
                    color: activeTab === "ads"
                      ? "#34D399"
                      : "var(--root-color-subtle)",
                  }}
                >
                  <PlaySquare />
                  <span>{t('side_shop.adItems.title')}</span>
                </button>
              </div>

              {/* Area Konten Tab Aktif */}
              <div className="w-full">
                {activeTab === "neo" && <ShopCoinsItems />}
                {activeTab === "gems" && <ShopGemsItems />}
                {activeTab === "premium" && <PremiumItems />}
                {activeTab === "discount" && <DiscountItems />}
                {activeTab === "ads" && <AdMenu />}
              </div>
            </div>
          </div>
        </NotebookModalWrapper>,
        document.body
      )}
    </>
  );
}
