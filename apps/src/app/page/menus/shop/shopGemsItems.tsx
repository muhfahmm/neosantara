"use client";

import React from "react";
import { Gem } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export interface GemShopPackage {
  id: string;
  nameKey: "gem_pkg_1" | "gem_pkg_2" | "gem_pkg_3" | "gem_pkg_4" | "gem_pkg_5" | "gem_pkg_6";
  gemAmount: number;
  bonusGems?: number;
  idrPrice: number;
  badge?: string;
  badgeKey?: "popular" | "bestValue";
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const GEM_PACKAGES: GemShopPackage[] = [
  {
    id: "gem_pkg_1",
    nameKey: "gem_pkg_1",
    gemAmount: 100,
    idrPrice: 15_000,
  },
  {
    id: "gem_pkg_2",
    nameKey: "gem_pkg_2",
    gemAmount: 300,
    bonusGems: 30,
    idrPrice: 45_000,
    badge: "+10%",
  },
  {
    id: "gem_pkg_3",
    nameKey: "gem_pkg_3",
    gemAmount: 750,
    bonusGems: 150,
    idrPrice: 99_000,
    badgeKey: "popular",
    isPopular: true,
  },
  {
    id: "gem_pkg_4",
    nameKey: "gem_pkg_4",
    gemAmount: 1_800,
    bonusGems: 450,
    idrPrice: 219_000,
    badge: "+25%",
  },
  {
    id: "gem_pkg_5",
    nameKey: "gem_pkg_5",
    gemAmount: 4_000,
    bonusGems: 1_200,
    idrPrice: 449_000,
    badge: "+30%",
  },
  {
    id: "gem_pkg_6",
    nameKey: "gem_pkg_6",
    gemAmount: 10_000,
    bonusGems: 4_000,
    idrPrice: 999_000,
    badgeKey: "bestValue",
    isBestValue: true,
  },
];

interface ShopGemsItemsProps {
  onBuy?: (pkg: GemShopPackage) => void;
}

export default function ShopGemsItems({ onBuy }: ShopGemsItemsProps) {
  const { t, language } = useLanguage();

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5"
    >
      {GEM_PACKAGES.map((pkg) => {
        const totalGems = pkg.gemAmount + (pkg.bonusGems || 0);

        return (
          <div
            key={pkg.id}
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "0.5rem 0.625rem",
              borderRadius: "var(--root-radius-card, 0.5rem)",
              backgroundColor: "var(--root-color-surface)",
              border: pkg.isBestValue
                ? "1.5px solid #F59E0B"
                : pkg.isPopular
                ? "1.5px solid #06B6D4"
                : "1px solid color-mix(in srgb, #06B6D4 20%, transparent)",
              boxShadow: pkg.isBestValue
                ? "0 4px 14px rgba(245, 158, 11, 0.15)"
                : pkg.isPopular
                ? "0 4px 14px rgba(6, 182, 212, 0.15)"
                : "none",
            }}
          >
            {/* Badge */}
            {pkg.badge && (
              <div
                style={{
                  position: "absolute",
                  top: "-0.45rem",
                  right: "0.5rem",
                  fontSize: "0.5625rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "9999px",
                  backgroundColor: pkg.isBestValue
                    ? "#F59E0B"
                    : pkg.isPopular
                    ? "#06B6D4"
                    : "#059669",
                  color: pkg.isBestValue || pkg.isPopular ? "#0F172A" : "#FFFFFF",
                }}
              >
                {pkg.badgeKey ? t(`side_shop.badges.${pkg.badgeKey}`) : pkg.badge}
              </div>
            )}

            {/* Konten Atas: Ikon, Nama, dan Nominal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                <div
                  style={{
                    width: "1.875rem",
                    height: "1.875rem",
                    borderRadius: "0.45rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "color-mix(in srgb, #06B6D4 15%, transparent)",
                    border: "1px solid color-mix(in srgb, #06B6D4 30%, transparent)",
                    color: "#38BDF8",
                    flexShrink: 0,
                  }}
                >
                  <Gem size={16} className="text-cyan-400" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--root-color-text)",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      lineHeight: 1.2,
                    }}
                    title={t(`side_shop.gemPackages.${pkg.nameKey}`)}
                  >
                    {t(`side_shop.gemPackages.${pkg.nameKey}`)}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      color: "var(--root-color-subtle)",
                      fontWeight: 600,
                      lineHeight: 1.1,
                      display: "block",
                    }}
                  >
                    {t("side_shop.gemBalance")}
                  </span>
                </div>
              </div>

              {/* Nominal Angka Utama */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  padding: "0.25rem 0.45rem",
                  borderRadius: "0.45rem",
                  backgroundColor: "var(--root-color-canvas)",
                  border: "1px solid color-mix(in srgb, #06B6D4 15%, transparent)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "#38BDF8",
                    letterSpacing: "-0.01em",
                  }}
                >
                  +{totalGems.toLocaleString(language)}
                </span>
                <span
                  style={{
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    color: "var(--root-color-subtle)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {t("side_shop.gemUnit")}
                </span>
              </div>
            </div>

            {/* Tombol Pembelian */}
            <div
              style={{
                marginTop: "0.5rem",
                paddingTop: "0.45rem",
                borderTop: "1px solid color-mix(in srgb, #06B6D4 12%, transparent)",
              }}
            >
              <button
                type="button"
                onClick={() => onBuy?.(pkg)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: "0.375rem 0.5rem",
                  borderRadius: "0.45rem",
                  backgroundColor: "#0EA5E9",
                  border: "1px solid #38BDF8",
                  color: "#FFFFFF",
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Rp {pkg.idrPrice.toLocaleString("id-ID")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
