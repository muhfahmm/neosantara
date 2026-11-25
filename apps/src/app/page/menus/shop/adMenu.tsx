"use client";

import React from "react";
import { PlaySquare } from "lucide-react";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

export default function AdMenu() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0.625rem 0.75rem",
        borderRadius: "var(--root-radius-card, 0.5rem)",
        backgroundColor: "var(--root-color-surface)",
        border: "1px solid color-mix(in srgb, #10B981 25%, transparent)",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
          <div
            style={{
              width: "1.875rem",
              height: "1.875rem",
              borderRadius: "0.45rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "color-mix(in srgb, #10B981 15%, transparent)",
              color: "#34D399",
              flexShrink: 0,
            }}
          >
            <PlaySquare size={16} />
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--root-color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {t("side_shop.adItems.title")}
          </span>
        </div>

        <span
          style={{
            fontSize: "0.5625rem",
            fontWeight: 700,
            padding: "0.15rem 0.4rem",
            borderRadius: "9999px",
            backgroundColor: "color-mix(in srgb, var(--root-color-muted) 15%, transparent)",
            color: "var(--root-color-muted)",
            border: "1px solid color-mix(in srgb, var(--root-color-muted) 25%, transparent)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {t("side_shop.inDevelopment")}
        </span>
      </div>

      <p
        style={{
          margin: 0,
          fontSize: "0.625rem",
          color: "var(--root-color-subtle)",
          fontWeight: 600,
          lineHeight: 1.3,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {t("side_shop.adItems.description")}
      </p>
    </div>
  );
}
