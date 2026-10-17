/**
 * 9_subsidi.ts — Otak indikator ALOKASI & KEBIJAKAN SUBSIDI.
 * Skor = calculateSubsidySatisfaction.
 * Variabel yang diubah: country.subsidy_states (id subsidi -> boolean true/false).
 * AI mengaktifkan subsidi yang memberi approval dampak tertinggi atau menonaktifkan subsidi
 * bila anggaran defisit krisis, dengan memperhatikan risiko demo.
 */
import {
  INITIAL_SUBSIDY_ITEMS,
  calculateSubsidySummary,
  type SubsidyItem,
} from "../../../../../../json/5_database_kebijakan_subsidi/index";
import { calculateSubsidySatisfaction } from "@/app/logic/kepuasanCalculator";
import type { AlertCandidate, NpcAlert } from "../types/alertTypes";
import { COOLDOWN_HARI } from "../types/alertTypes";
import {
  type BrainContext,
  type BrainResult,
  type IndikatorOtak,
  TAHAN,
  bolehBertindak,
  nilaiAngka,
  sedangCooldown,
  setCooldown,
} from "../core/brainContext";
import { buatKandidat, cekSkorTurun } from "../core/alertFactory";

const COOLDOWN_SUBSIDI_HARI = 7;

export function cekAlertSubsidi(ctx: BrainContext): AlertCandidate[] {
  const out: AlertCandidate[] = [];
  const c = cekSkorTurun(
    ctx,
    "subsidi",
    ["subsidy_states"],
    "Alokasi subsidi kurang memadai untuk perlindungan rakyat",
  );
  if (c) out.push(c);

  // Cek ketidakcocokan: Anggaran negara minus/defisit berat namun subsidi berbiaya sangat tinggi
  const anggaran = nilaiAngka(ctx.country.anggaran);
  const states = (ctx.country.subsidy_states || {}) as Record<string, boolean>;
  const activeItems = INITIAL_SUBSIDY_ITEMS.map((item) => ({
    ...item,
    isSubsidized: states[item.id] ?? item.isSubsidized,
  }));
  const summary = calculateSubsidySummary(activeItems);

  if (anggaran < 0 && summary.totalCost > 150) {
    out.push(
      buatKandidat(
        ctx,
        "subsidi",
        "KETIDAKCOCOKAN",
        "TINGGI",
        `Anggaran negara defisit (${anggaran.toLocaleString("id-ID")}), beban total subsidi terlalu tinggi (${summary.totalCost} M/hari)`,
        ["subsidy_states", "anggaran"],
      ),
    );
  }

  return out;
}

export function otakSubsidi(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Subsidi waspada tapi skor tidak menurun — tahan");
  if (sedangCooldown(ctx, "subsidi.kebijakan")) {
    return TAHAN("Kebijakan subsidi baru diubah — menunggu hasil (cooldown)");
  }

  const currentStates = { ...(ctx.country.subsidy_states || {}) } as Record<string, boolean>;
  const anggaran = nilaiAngka(ctx.country.anggaran);

  // KASUS 1: KETIDAKCOCOKAN (Anggaran minus tapi beban subsidi terlalu besar)
  // AI mematikan subsidi non-kritis (demo risk Rendah / Sedang) untuk menyelamatkan fiskal negara
  if (alert.jenis === "KETIDAKCOCOKAN" && anggaran < 0) {
    const nonKritis = INITIAL_SUBSIDY_ITEMS.filter((item) => {
      const isAktif = currentStates[item.id] ?? item.isSubsidized;
      return isAktif && (item.demoRiskIfDisabled === "Rendah" || item.demoRiskIfDisabled === "Sedang");
    }).sort((a, b) => b.budgetCost - a.budgetCost); // Matikan yang paling boros dulu

    if (nonKritis.length > 0) {
      const itemToDisable = nonKritis[0];
      currentStates[itemToDisable.id] = false;
      ctx.country.subsidy_states = currentStates;
      setCooldown(ctx, "subsidi.kebijakan", COOLDOWN_SUBSIDI_HARI);
      return {
        diubah: true,
        ringkasan: `Efisiensi fiskal: Nonaktifkan ${itemToDisable.name} (hemat ${itemToDisable.budgetCost} M/hari)`,
        variabelDiubah: [`subsidy_states.${itemToDisable.id}`],
      };
    }
  }

  // KASUS 2: SKOR SUBSIDI TURUN ATAU KRISIS
  // AI mengaktifkan subsidi yang belum aktif dengan rasio approvalImpact terhadap budgetCost tertinggi
  const inactiveItems = INITIAL_SUBSIDY_ITEMS.filter((item) => {
    const isAktif = currentStates[item.id] ?? item.isSubsidized;
    return !isAktif;
  }).sort((a, b) => {
    // Utamakan yang risiko demo Tinggi/Kritis atau rasio kepuasan/biaya tinggi
    const ratioA = a.approvalImpact / Math.max(1, a.budgetCost);
    const ratioB = b.approvalImpact / Math.max(1, b.budgetCost);
    return ratioB - ratioA;
  });

  if (inactiveItems.length === 0) {
    return TAHAN("Seluruh subsidi sudah aktif", "semua program subsidi telah berjalan");
  }

  // Pilih 1 atau 2 subsidi yang paling efektif
  const countToEnable = alert.tingkat === "KRITIS" ? Math.min(2, inactiveItems.length) : 1;
  const activated: SubsidyItem[] = [];

  for (let i = 0; i < countToEnable; i++) {
    const item = inactiveItems[i];
    // Jangan aktifkan jika anggaran negara sangat minus dan biayanya terlalu besar kecuali krisis parah
    if (anggaran < -50000 && item.budgetCost > 30 && alert.tingkat !== "KRITIS") {
      continue;
    }
    currentStates[item.id] = true;
    activated.push(item);
  }

  if (activated.length === 0) {
    return TAHAN("Biaya aktivasi subsidi baru melebihi batas toleransi kas negara", "anggaran tidak memadai");
  }

  ctx.country.subsidy_states = currentStates;
  setCooldown(ctx, "subsidi.kebijakan", COOLDOWN_HARI[alert.tingkat]);

  const names = activated.map((it) => it.name).join(", ");
  return {
    diubah: true,
    ringkasan: `Aktifkan subsidi: ${names}`,
    variabelDiubah: activated.map((it) => `subsidy_states.${it.id}`),
  };
}

export const OTAK_SUBSIDI: IndikatorOtak = {
  id: "subsidi",
  cek: cekAlertSubsidi,
  otak: otakSubsidi,
};
