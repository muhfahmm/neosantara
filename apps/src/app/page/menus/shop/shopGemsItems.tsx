"use client";

import React from "react";
import { Gem, Sparkles, Zap, ShieldCheck } from "lucide-react";

export interface GemShopPackage {
  id: string;
  name: string;
  gemAmount: number;
  bonusGems?: number;
  idrPrice: number;
  description: string;
  badge?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

export const GEM_PACKAGES: GemShopPackage[] = [
  {
    id: "gem_pkg_1",
    name: "Kantong Permata",
    gemAmount: 100,
    idrPrice: 15_000,
    description: "Cukup untuk 1x percepatan instan pembangunan atau fasilitas penting.",
  },
  {
    id: "gem_pkg_2",
    name: "Tumpukan Permata",
    gemAmount: 300,
    bonusGems: 30,
    idrPrice: 45_000,
    description: "Ideal untuk 2-3x percepatan riset teknologi militer atau diplomasi.",
    badge: "+10% Bonus",
  },
  {
    id: "gem_pkg_3",
    name: "Kotak Permata",
    gemAmount: 750,
    bonusGems: 150,
    idrPrice: 99_000,
    description: "Kebutuhan ideal pemain aktif untuk percepatan beberapa proyek strategis.",
    badge: "Paling Populer",
    isPopular: true,
  },
  {
    id: "gem_pkg_4",
    name: "Peti Harta Permata",
    gemAmount: 1_800,
    bonusGems: 450,
    idrPrice: 219_000,
    description: "Cukup untuk instan pembangunan pangkalan militer atau senjata rudal.",
    badge: "+25% Bonus",
  },
  {
    id: "gem_pkg_5",
    name: "Gudang Permata",
    gemAmount: 4_000,
    bonusGems: 1_200,
    idrPrice: 449_000,
    description: "Kebutuhan ekspansi kilat, rekrutmen massal & persiapan perang dunia.",
    badge: "+30% Bonus",
  },
  {
    id: "gem_pkg_6",
    name: "Brankas Nasional",
    gemAmount: 10_000,
    bonusGems: 4_000,
    idrPrice: 999_000,
    description: "Mendanai seluruh riset teknologi dan proyek megah bangsa tanpa hambatan.",
    badge: "Nilai Terbaik",
    isBestValue: true,
  },
];

interface ShopGemsItemsProps {
  onBuy?: (pkg: GemShopPackage) => void;
}

export default function ShopGemsItems({ onBuy }: ShopGemsItemsProps) {
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
          border: "1px solid color-mix(in srgb, #06B6D4 25%, transparent)",
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
              backgroundColor: "color-mix(in srgb, #06B6D4 15%, transparent)",
              color: "#38BDF8",
            }}
          >
            <Zap size={18} />
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
              Pembelian Paket Permata (GEMS)
            </h4>
            <p
              style={{
                fontSize: "0.6875rem",
                color: "var(--root-color-subtle)",
                margin: 0,
                fontWeight: 600,
              }}
            >
              Mata uang premium untuk mempercepat waktu pembangunan & riset secara instan
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

      {/* Grid 6 Kartu Paket GEMS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "0.875rem",
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
                padding: "1rem",
                borderRadius: "var(--root-radius-card, 0.75rem)",
                backgroundColor: "var(--root-color-surface)",
                border: pkg.isBestValue
                  ? "1.5px solid #F59E0B"
                  : pkg.isPopular
                  ? "1.5px solid #06B6D4"
                  : "1px solid color-mix(in srgb, #06B6D4 20%, transparent)",
                boxShadow: pkg.isBestValue
                  ? "0 4px 16px rgba(245, 158, 11, 0.15)"
                  : pkg.isPopular
                  ? "0 4px 16px rgba(6, 182, 212, 0.15)"
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
                      ? "#06B6D4"
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
                      backgroundColor: "color-mix(in srgb, #06B6D4 15%, transparent)",
                      border: "1px solid color-mix(in srgb, #06B6D4 30%, transparent)",
                      color: "#38BDF8",
                      flexShrink: 0,
                    }}
                  >
                    <Gem size={22} className="text-cyan-400" />
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
                      Mata Uang Premium
                    </span>
                  </div>
                </div>

                {/* Nominal GEMS */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.375rem",
                    padding: "0.5rem 0.625rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--root-color-canvas)",
                    border: "1px solid color-mix(in srgb, #06B6D4 15%, transparent)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 900,
                      color: "#38BDF8",
                      letterSpacing: "0.02em",
                    }}
                  >
                    +{totalGems.toLocaleString("id-ID")}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      color: "var(--root-color-subtle)",
                    }}
                  >
                    Gems
                  </span>
                  {pkg.bonusGems && (
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
                    gap: "0.375rem",
                    width: "100%",
                    padding: "0.55rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#0EA5E9",
                    border: "1px solid #38BDF8",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>Beli Rp {pkg.idrPrice.toLocaleString("id-ID")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
