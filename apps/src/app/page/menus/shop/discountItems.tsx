"use client";

import React from "react";
import { Tag } from "lucide-react";

export default function DiscountItems() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        borderRadius: "var(--root-radius-card, 0.75rem)",
        backgroundColor: "var(--root-color-surface)",
        border: "1px solid color-mix(in srgb, var(--root-color-danger, #EF4444) 25%, transparent)",
        gap: "0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "color-mix(in srgb, var(--root-color-danger, #EF4444) 15%, transparent)",
            color: "var(--root-color-danger, #EF4444)",
          }}
        >
          <Tag size={20} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 800,
              color: "var(--root-color-text)",
            }}
          >
            Item Diskon
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--root-color-subtle)",
              fontWeight: 600,
            }}
          >
            Penawaran terbatas & harga spesial
          </span>
        </div>
      </div>

      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          padding: "0.2rem 0.5rem",
          borderRadius: "9999px",
          backgroundColor: "color-mix(in srgb, var(--root-color-muted) 15%, transparent)",
          color: "var(--root-color-muted)",
          border: "1px solid color-mix(in srgb, var(--root-color-muted) 25%, transparent)",
          whiteSpace: "nowrap",
        }}
      >
        Dalam Pengembangan
      </span>
    </div>
  );
}
