// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\7_sistem_ekonomi\tab_menu\2_kartu_kebijakan\KartuKebijakanTab.tsx
"use client";

import React from "react";
import { ECONOMIC_POLICIES } from "../../logic/logikaSistemEkonomi";

interface Props {
  policyChoices: Record<string, "A" | "B">;
  handlePolicyChange: (policyId: string, choice: "A" | "B") => void;
}

export default function KartuKebijakanTab({ policyChoices, handlePolicyChange }: Props) {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <p className="text-xs text-[#6B8A8A] font-semibold leading-relaxed mb-2">
        Pilih opsi kebijakan sektoral spesifik untuk menentukan pendekatan regulasi negara Anda secara terperinci.
      </p>

      {ECONOMIC_POLICIES.map((policy) => {
        const currentChoice = policyChoices[policy.id] || "A";

        return (
          <div key={policy.id} className="bg-[#0A1A1A] border border-[#00FFAA]/20 rounded-xl p-5 space-y-3">
            <div>
              <h4 className="text-sm font-black text-[#E0E0E0] uppercase tracking-wider">{policy.name}</h4>
              <p className="text-xs text-[#6B8A8A] mt-0.5">{policy.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* OPSI A (Terpusat) */}
              <button
                onClick={() => handlePolicyChange(policy.id, "A")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  currentChoice === "A"
                    ? "bg-[#00FFAA]/15 border-[#00FFAA] text-[#00FFAA]"
                    : "bg-[#0F2424] border-[#00FFAA]/15 text-[#6B8A8A] hover:border-[#00FFAA]/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">{policy.optionA.label}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {policy.optionA.type}
                  </span>
                </div>
                <p className="text-[11px] font-semibold opacity-90 leading-relaxed">{policy.optionA.effect}</p>
              </button>

              {/* OPSI B (Pasar Bebas) */}
              <button
                onClick={() => handlePolicyChange(policy.id, "B")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  currentChoice === "B"
                    ? "bg-[#00FFAA]/15 border-[#00FFAA] text-[#00FFAA]"
                    : "bg-[#0F2424] border-[#00FFAA]/15 text-[#6B8A8A] hover:border-[#00FFAA]/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xs font-black uppercase tracking-wider">{policy.optionB.label}</span>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {policy.optionB.type}
                  </span>
                </div>
                <p className="text-[11px] font-semibold opacity-90 leading-relaxed">{policy.optionB.effect}</p>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
