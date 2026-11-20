"use client";

import React from "react";
import { PlaySquare } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export default function AdMenu() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1rem",
        borderRadius: "var(--root-radius-card, 0.75rem)",
        backgroundColor: "var(--root-color-surface)",
        border: "1px solid color-mix(in srgb, #10B981 25%, transparent)",
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
            backgroundColor: "color-mix(in srgb, #10B981 15%, transparent)",
            color: "#34D399",
          }}
        >
          <PlaySquare size={20} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 800,
              color: "var(--root-color-text)",
            }}
          >
            {t("side_shop.adItems.title")}
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--root-color-subtle)",
              fontWeight: 600,
            }}
          >
            {t("side_shop.adItems.description")}
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
        {t("side_shop.inDevelopment")}
      </span>
    </div>
  );
}
