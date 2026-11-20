"use client";

import React from "react";
import { Coins } from "lucide-react";

export interface CoinShopPackage {
  id: string;
  name: string;
  neoAmount: number;
  bonusNeo?: number;
  idrPrice: number;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const COIN_PACKAGES: CoinShopPackage[] = [
  {
    id: "coin_pkg_1",
    name: "Dana Taktis",
    neoAmount: 50_000,
    idrPrice: 15_000,
  },
  {
    id: "coin_pkg_2",
    name: "Subsidi Proyek",
    neoAmount: 150_000,
    bonusNeo: 15_000,
    idrPrice: 39_000,
    badge: "+10%",
  },
  {
    id: "coin_pkg_3",
    name: "Anggaran Pembangunan",
    neoAmount: 400_000,
    bonusNeo: 60_000,
    idrPrice: 89_000,
    badge: "Populer",
    isPopular: true,
  },
  {
    id: "coin_pkg_4",
    name: "Kas Cadangan Nasional",
    neoAmount: 1_000_000,
    bonusNeo: 200_000,
    idrPrice: 199_000,
    badge: "+20%",
  },
  {
    id: "coin_pkg_5",
    name: "Obligasi Negara",
    neoAmount: 2_500_000,
    bonusNeo: 625_000,
    idrPrice: 399_000,
    badge: "+25%",
  },
  {
    id: "coin_pkg_6",
    name: "Bank Sentral Darurat",
    neoAmount: 7_000_000,
    bonusNeo: 2_450_000,
    idrPrice: 899_000,
    badge: "Terbaik",
    isBestValue: true,
  },
];

interface ShopCoinsItemsProps {
  onBuy?: (pkg: CoinShopPackage) => void;
}

export default function ShopCoinsItems({ onBuy }: ShopCoinsItemsProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "0.75rem",
      }}
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
              padding: "0.875rem",
              borderRadius: "var(--root-radius-card, 0.75rem)",
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
                    ? "var(--root-color-accent)"
                    : "#059669",
                  color: pkg.isBestValue || pkg.isPopular ? "#0F172A" : "#FFFFFF",
                }}
              >
                {pkg.badge}
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
                    backgroundColor: "color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--root-color-accent) 30%, transparent)",
                    color: "var(--root-color-accent)",
                    flexShrink: 0,
                  }}
                >
                  <Coins size={20} className="text-amber-400" />
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
                    {pkg.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--root-color-subtle)",
                      fontWeight: 600,
                    }}
                  >
                    Kas Negara
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
                  border: "1px solid color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                }}
              >
                <span
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 900,
                    color: "var(--root-color-accent)",
                  }}
                >
                  +{totalNeo.toLocaleString("id-ID")}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    color: "var(--root-color-subtle)",
                  }}
                >
                  NEO
                </span>
              </div>
            </div>

            {/* Tombol Pembelian */}
            <div
              style={{
                marginTop: "0.75rem",
                paddingTop: "0.625rem",
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
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--root-color-accent)",
                  border: "1px solid var(--root-color-accent)",
                  color: "#0F172A",
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
