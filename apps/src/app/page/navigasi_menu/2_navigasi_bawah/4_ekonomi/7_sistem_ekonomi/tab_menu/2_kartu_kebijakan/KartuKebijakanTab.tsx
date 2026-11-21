// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\2_kartu_kebijakan\KartuKebijakanTab.tsx
"use client";

import React, { memo } from "react";
import { ECONOMIC_POLICIES } from "../../logic/logikaSistemEkonomi";
import { useLanguage } from "@/app/page/paused_menu/terjemahan_paused_menu/languageLogic";

interface Props {
  policyChoices: Record<string, "A" | "B">;
  handlePolicyChange: (policyId: string, choice: "A" | "B") => void;
}

interface LocalizedPolicy {
  id: string;
  name: string;
  optionA: { label: string; type: string; effect: string };
  optionB: { label: string; type: string; effect: string };
}

const PolicyCard = memo(function PolicyCard({
  policy,
  currentChoice,
  onSelect,
}: {
  policy: LocalizedPolicy;
  currentChoice: "A" | "B";
  onSelect: (policyId: string, choice: "A" | "B") => void;
}) {
  return (
    <div
      className="economic-policy-card bg-root-canvas border border-root-accent/20 rounded-xl p-3 lg:p-3.5 2xl:p-4 space-y-2"
    >
      <div>
        <h4 className="economic-policy-title text-xs lg:text-sm font-black text-root-text uppercase tracking-wider">{policy.name}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-2.5 pt-0.5">
        {/* OPSI A (Terpusat) */}
        <button
          type="button"
          onClick={() => {
            if (currentChoice !== "A") onSelect(policy.id, "A");
          }}
          className={`p-2.5 lg:p-3 rounded-xl border text-left cursor-pointer flex flex-col justify-between ${
            currentChoice === "A"
              ? "bg-root-accent/15 border-root-accent text-root-accent"
              : "bg-root-surface border-root-accent/15 text-root-muted hover:border-root-accent/60 hover:text-root-accent"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="economic-policy-option-label text-[10px] lg:text-xs font-black uppercase tracking-wider">{policy.optionA.label}</span>
            <span className="economic-policy-option-type text-[8px] lg:text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              {policy.optionA.type}
            </span>
          </div>
          <p className="economic-policy-option-effect text-[9px] lg:text-[10px] font-semibold opacity-90 leading-tight">{policy.optionA.effect}</p>
        </button>

        {/* OPSI B (Pasar Bebas) */}
        <button
          type="button"
          onClick={() => {
            if (currentChoice !== "B") onSelect(policy.id, "B");
          }}
          className={`p-2.5 lg:p-3 rounded-xl border text-left cursor-pointer flex flex-col justify-between ${
            currentChoice === "B"
              ? "bg-root-accent/15 border-root-accent text-root-accent"
              : "bg-root-surface border-root-accent/15 text-root-muted hover:border-root-accent/60 hover:text-root-accent"
          }`}
        >
          <div className="flex items-center justify-between w-full mb-1">
            <span className="economic-policy-option-label text-[10px] lg:text-xs font-black uppercase tracking-wider">{policy.optionB.label}</span>
            <span className="economic-policy-option-type text-[8px] lg:text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {policy.optionB.type}
            </span>
          </div>
          <p className="economic-policy-option-effect text-[9px] lg:text-[10px] font-semibold opacity-90 leading-tight">{policy.optionB.effect}</p>
        </button>
      </div>
    </div>
  );
});

function KartuKebijakanTabComponent({ policyChoices, handlePolicyChange }: Props) {
  const { t } = useLanguage();
  const policies: LocalizedPolicy[] = ECONOMIC_POLICIES.map((policy) => ({
    id: policy.id,
    name: t(`navigation_economy_system.policies.${policy.id}.name`),
    optionA: {
      label: t(`navigation_economy_system.policies.${policy.id}.optionA.label`),
      type: t("navigation_economy_system.spectrum.categories.centralized"),
      effect: t(`navigation_economy_system.policies.${policy.id}.optionA.effect`),
    },
    optionB: {
      label: t(`navigation_economy_system.policies.${policy.id}.optionB.label`),
      type: t("navigation_economy_system.spectrum.categories.freeMarket"),
      effect: t(`navigation_economy_system.policies.${policy.id}.optionB.effect`),
    },
  }));
  return (
    <div className="economic-policy-list space-y-2.5 lg:space-y-3.5 max-w-full">
      {policies.map((policy) => {
        const currentChoice = policyChoices[policy.id] || "A";
        return (
          <PolicyCard
            key={policy.id}
            policy={policy}
            currentChoice={currentChoice}
            onSelect={handlePolicyChange}
          />
        );
      })}
    </div>
  );
}

export default memo(KartuKebijakanTabComponent);