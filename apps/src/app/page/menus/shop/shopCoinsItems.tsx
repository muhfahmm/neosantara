"use client";

import React from "react";
import { Coins } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export interface CoinShopPackage {
  id: string;
  nameKey: "coin_pkg_1" | "coin_pkg_2" | "coin_pkg_3" | "coin_pkg_4" | "coin_pkg_5" | "coin_pkg_6";
  neoAmount: number;
  bonusNeo?: number;
  idrPrice: number;
  badge?: string;
  badgeKey?: "popular" | "bestValue";
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const COIN_PACKAGES: CoinShopPackage[] = [
  {
    id: "coin_pkg_1",
    nameKey: "coin_pkg_1",
    neoAmount: 50_000,
    idrPrice: 15_000,
  },
  {
    id: "coin_pkg_2",
    nameKey: "coin_pkg_2",
    neoAmount: 150_000,
    bonusNeo: 15_000,
    idrPrice: 39_000,
    badge: "+10%",
  },
  {
    id: "coin_pkg_3",
    nameKey: "coin_pkg_3",
    neoAmount: 400_000,
    bonusNeo: 60_000,
    idrPrice: 89_000,
    badgeKey: "popular",
    isPopular: true,
  },
  {
    id: "coin_pkg_4",
    nameKey: "coin_pkg_4",
    neoAmount: 1_000_000,
    bonusNeo: 200_000,
    idrPrice: 199_000,
    badge: "+20%",
  },
  {
    id: "coin_pkg_5",
    nameKey: "coin_pkg_5",
    neoAmount: 2_500_000,
    bonusNeo: 625_000,
    idrPrice: 399_000,
    badge: "+25%",
  },
  {
    id: "coin_pkg_6",
    nameKey: "coin_pkg_6",
    neoAmount: 7_000_000,
    bonusNeo: 2_450_000,
    idrPrice: 899_000,
    badgeKey: "bestValue",
    isBestValue: true,
  },
];

interface ShopCoinsItemsProps {
  onBuy?: (pkg: CoinShopPackage) => void;
}

export default function ShopCoinsItems({ onBuy }: ShopCoinsItemsProps) {
  const { t, language } = useLanguage();

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5"
    >
      {COIN_PACKAGES.map((pkg) => {
        const totalNeo = pkg.neoAmount + (pkg.bonusNeo || 0);

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
                ? "1.5px solid var(--root-color-accent)"
                : "1px solid color-mix(in srgb, var(--root-color-accent) 20%, transparent)",
              boxShadow: pkg.isBestValue
                ? "0 4px 14px rgba(245, 158, 11, 0.15)"
                : pkg.isPopular
                ? "0 4px 14px rgba(0, 255, 170, 0.12)"
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
                    ? "var(--root-color-accent)"
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
                    backgroundColor: "color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--root-color-accent) 30%, transparent)",
                    color: "var(--root-color-accent)",
                    flexShrink: 0,
                  }}
                >
                  <Coins size={16} className="text-amber-400" />
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
                    title={t(`side_shop.coinPackages.${pkg.nameKey}`)}
                  >
                    {t(`side_shop.coinPackages.${pkg.nameKey}`)}
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
                    {t("side_shop.neoBalance")}
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
                  border: "1px solid color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    color: "var(--root-color-accent)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  +{totalNeo.toLocaleString(language)}
                </span>
                <span
                  style={{
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    color: "var(--root-color-subtle)",
                    letterSpacing: "0.02em",
                  }}
                >
                  NEO
                </span>
              </div>
            </div>

            {/* Tombol Pembelian */}
            <div
              style={{
                marginTop: "0.5rem",
                paddingTop: "0.45rem",
                borderTop: "1px solid color-mix(in srgb, var(--root-color-accent) 12%, transparent)",
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
                  backgroundColor: "var(--root-color-accent)",
                  border: "1px solid var(--root-color-accent)",
                  color: "#0F172A",
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
