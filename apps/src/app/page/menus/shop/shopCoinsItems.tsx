"use client";

import React from "react";
import { Coins, Gem, Sparkles, TrendingUp, ShieldAlert, Award } from "lucide-react";

export interface CoinShopPackage {
  id: string;
  name: string;
  neoAmount: number;
  bonusNeo?: number;
  gemsPrice: number;
  idrPrice: number;
  description: string;
  badge?: string;
  badgeColor?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const COIN_PACKAGES: CoinShopPackage[] = [
  {
    id: "coin_pkg_1",
    name: "Dana Taktis",
    neoAmount: 50_000,
    gemsPrice: 60,
    idrPrice: 15_000,
    description: "Tambahan darurat untuk belanja semen/besi cepat saat defisit.",
  },
  {
    id: "coin_pkg_2",
    name: "Subsidi Proyek",
    neoAmount: 150_000,
    bonusNeo: 15_000,
    gemsPrice: 160,
    idrPrice: 39_000,
    description: "Cukup untuk mendanai 1-2 infrastruktur industri atau pabrik.",
    badge: "+10% Bonus",
  },
  {
    id: "coin_pkg_3",
    name: "Anggaran Pembangunan",
    neoAmount: 400_000,
    bonusNeo: 60_000,
    gemsPrice: 380,
    idrPrice: 89_000,
    description: "Injeksi kas signifikan untuk mendanai proyek pangkalan militer.",
    badge: "Paling Populer",
    isPopular: true,
  },
  {
    id: "coin_pkg_4",
    name: "Kas Cadangan Nasional",
    neoAmount: 1_000_000,
    bonusNeo: 200_000,
    gemsPrice: 850,
    idrPrice: 199_000,
    description: "Modal rekrutmen massal divisi darat, alutsista tank & jet tempur.",
    badge: "+20% Ekstra",
  },
  {
    id: "coin_pkg_5",
    name: "Obligasi Negara",
    neoAmount: 2_500_000,
    bonusNeo: 625_000,
    gemsPrice: 1_900,
    idrPrice: 399_000,
    description: "Restrukturisasi ekonomi penuh, pelunasan utang, & ekspansi armada laut.",
    badge: "+25% Ekstra",
  },
  {
    id: "coin_pkg_6",
    name: "Bank Sentral Darurat",
    neoAmount: 7_000_000,
    bonusNeo: 2_450_000,
    gemsPrice: 4_800,
    idrPrice: 899_000,
    description: "Likuiditas tak terbatas untuk menghadapi perang dunia & krisis nasional.",
    badge: "Nilai Terbaik",
    isBestValue: true,
  },
];

interface ShopCoinsItemsProps {
  onBuy?: (pkg: CoinShopPackage) => void;
}

export default function ShopCoinsItems({ onBuy }: ShopCoinsItemsProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Banner / Info Ringkas */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1rem",
          borderRadius: "var(--root-radius-card, 0.75rem)",
          backgroundColor: "var(--root-color-surface)",
          border: "1px solid color-mix(in srgb, var(--root-color-accent) 25%, transparent)",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
              color: "var(--root-color-accent)",
            }}
          >
            <TrendingUp size={18} />
          </div>
          <div>
            <h4
              style={{
                fontSize: "0.8125rem",
                fontWeight: 800,
                color: "var(--root-color-text)",
                margin: 0,
              }}
            >
              Penukaran Anggaran Kas Negara (NEO)
            </h4>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--root-color-subtle)",
                margin: 0,
                fontWeight: 600,
              }}
            >
              Tukarkan Gems atau beli paket kas negara untuk mempercepat belanja & konstruksi
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.6875rem",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.375rem",
            backgroundColor: "color-mix(in srgb, var(--root-color-muted) 15%, transparent)",
            color: "var(--root-color-muted)",
            whiteSpace: "nowrap",
          }}
        >
          6 Pilihan Paket
        </span>
      </div>

      {/* Grid 6 Kartu Paket NEO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "0.875rem",
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
                padding: "1rem",
                borderRadius: "var(--root-radius-card, 0.75rem)",
                backgroundColor: "var(--root-color-surface)",
                border: pkg.isBestValue
                  ? "1.5px solid #F59E0B"
                  : pkg.isPopular
                  ? "1.5px solid var(--root-color-accent)"
                  : "1px solid color-mix(in srgb, var(--root-color-accent) 20%, transparent)",
                boxShadow: pkg.isBestValue
                  ? "0 4px 16px rgba(245, 158, 11, 0.15)"
                  : pkg.isPopular
                  ? "0 4px 16px rgba(0, 255, 170, 0.12)"
                  : "none",
                transition: "all 0.2s ease",
              }}
            >
              {/* Badge (Paling Populer / Nilai Terbaik / Bonus) */}
              {pkg.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-0.6rem",
                    right: "0.75rem",
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "9999px",
                    backgroundColor: pkg.isBestValue
                      ? "#F59E0B"
                      : pkg.isPopular
                      ? "var(--root-color-accent)"
                      : "#059669",
                    color: pkg.isBestValue || pkg.isPopular ? "#0F172A" : "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  {pkg.badge}
                </div>
              )}

              {/* Header Kartu */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
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
                    <Coins size={22} className="text-amber-400" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "0.9375rem",
                        fontWeight: 800,
                        color: "var(--root-color-text)",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {pkg.name}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--root-color-subtle)",
                        fontWeight: 600,
                      }}
                    >
                      Kas Anggaran Negara
                    </span>
                  </div>
                </div>

                {/* Nominal NEO */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.375rem",
                    padding: "0.5rem 0.625rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--root-color-canvas)",
                    border: "1px solid color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: "var(--root-color-accent)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    +{totalNeo.toLocaleString("id-ID")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--root-color-subtle)",
                    }}
                  >
                    NEO
                  </span>
                  {pkg.bonusNeo && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        color: "#10B981",
                      }}
                    >
                      (Termasuk Bonus)
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--root-color-subtle)",
                    margin: 0,
                    lineHeight: 1.4,
                    minHeight: "2rem",
                  }}
                >
                  {pkg.description}
                </p>
              </div>

              {/* Tombol Pembelian */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid color-mix(in srgb, var(--root-color-accent) 12%, transparent)",
                }}
              >
                {/* Tukar dengan Gems */}
                <button
                  type="button"
                  onClick={() => onBuy?.(pkg)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    width: "100%",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "color-mix(in srgb, #06B6D4 18%, transparent)",
                    border: "1px solid color-mix(in srgb, #06B6D4 40%, transparent)",
                    color: "#38BDF8",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Gem size={14} className="text-cyan-400" />
                  <span>Tukar {pkg.gemsPrice.toLocaleString("id-ID")} Gems</span>
                </button>

                {/* Atau Pembelian Langsung IDR */}
                <button
                  type="button"
                  onClick={() => onBuy?.(pkg)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    width: "100%",
                    padding: "0.45rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "color-mix(in srgb, var(--root-color-muted) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--root-color-muted) 20%, transparent)",
                    color: "var(--root-color-text)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>atau Rp {pkg.idrPrice.toLocaleString("id-ID")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
