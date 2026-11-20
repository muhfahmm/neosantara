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
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0.75rem",
      }}
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
              padding: "0.875rem",
              borderRadius: "var(--root-radius-card, 0.75rem)",
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
                  top: "-0.5rem",
                  right: "0.625rem",
                  fontSize: "0.625rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  padding: "0.15rem 0.5rem",
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: "2.25rem",
                    height: "2.25rem",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "color-mix(in srgb, #06B6D4 15%, transparent)",
                    border: "1px solid color-mix(in srgb, #06B6D4 30%, transparent)",
                    color: "#38BDF8",
                    flexShrink: 0,
                  }}
                >
                  <Gem size={20} className="text-cyan-400" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 800,
                      color: "var(--root-color-text)",
                      margin: 0,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t(`side_shop.gemPackages.${pkg.nameKey}`)}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--root-color-subtle)",
                      fontWeight: 600,
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
                  padding: "0.45rem 0.625rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--root-color-canvas)",
                  border: "1px solid color-mix(in srgb, #06B6D4 15%, transparent)",
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 900,
                    color: "#38BDF8",
                  }}
                >
                  +{totalGems.toLocaleString(language)}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    color: "var(--root-color-subtle)",
                  }}
                >
                  {t("side_shop.gemUnit")}
                </span>
              </div>
            </div>

            {/* Tombol Pembelian */}
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.625rem",
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
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#0EA5E9",
                  border: "1px solid #38BDF8",
                  color: "#FFFFFF",
                  fontSize: "0.75rem",
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
