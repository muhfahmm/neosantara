"use client";

import React from "react";
import { Coins } from "lucide-react";

export default function ShopCoinsItems() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--root-modal-padding-standard, 2rem)",
        minHeight: "240px",
        width: "100%",
        textAlign: "center",
        gap: "1rem",
        borderRadius: "var(--root-radius-card, 0.75rem)",
        backgroundColor: "var(--root-color-surface)",
        border: "1px solid color-mix(in srgb, var(--root-color-accent) 20%, transparent)",
      }}
    >
      <div
        style={{
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "color-mix(in srgb, var(--root-color-accent) 15%, transparent)",
          border: "1px solid color-mix(in srgb, var(--root-color-accent) 40%, transparent)",
          color: "var(--root-color-accent)",
        }}
      >
        <Coins size={32} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 800,
            color: "var(--root-color-text)",
            margin: 0,
            letterSpacing: "0.025em",
          }}
        >
          Toko NEO (Koin)
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--root-color-subtle)",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Dalam Pengembangan
        </p>
      </div>

      <span
        style={{
          display: "inline-block",
          fontSize: "0.75rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          padding: "0.25rem 0.75rem",
          borderRadius: "9999px",
          backgroundColor: "color-mix(in srgb, var(--root-color-muted) 15%, transparent)",
          color: "var(--root-color-muted)",
          border: "1px solid color-mix(in srgb, var(--root-color-muted) 30%, transparent)",
        }}
      >
        Segera Hadir
      </span>
    </div>
  );
}
