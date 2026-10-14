/**
 * 8_sistem_ekonomi.ts — Otak indikator KEBIJAKAN & SISTEM EKONOMI.
 * Skor = calculateEconomicPolicySatisfaction. Variabel yang diubah langsung:
 * sistem_ekonomi_val (geser ±10) dan 7 kebijakan policy_* (A↔B). Tiap kandidat diuji dengan
 * fungsi skor yang sama; hanya perubahan yang BENAR-BENAR menaikkan skor yang dipilih.
 */
import { calculateEconomicPolicySatisfaction } from "@/app/logic/kepuasanCalculator";
import {
  ECONOMIC_POLICIES,
  getEconomicSystemDetails,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/4_ekonomi/7_sistem_ekonomi/logic/logikaSistemEkonomi";
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
import { cekSkorTurun } from "../core/alertFactory";

const KEBIJAKAN_KEYS = [
  "policy_price_control",
  "policy_strategic_ownership",
  "policy_trade_policy",
  "policy_labor_regulation",
  "policy_land_property_rights",
  "policy_labor_unions_rights",
  "policy_monetary_banking",
];
const LANGKAH_SISTEM = 10;
const COOLDOWN_KEBIJAKAN_EKSTRA = 20; // kebijakan struktural lebih lama sebelum dibalik lagi
const JUMLAH_PERUBAHAN: Record<string, number> = { KRITIS: 2, TINGGI: 1, SEDANG: 1 };

interface Opsi {
  variabel: string;
  nilaiBaru: string | number;
  skorBaru: number;
}

function evaluasiOpsi(ctx: BrainContext): Opsi[] {
  const opsi: Opsi[] = [];
  const sekarang = calculateEconomicPolicySatisfaction(ctx.country);

  for (const key of KEBIJAKAN_KEYS) {
    if (sedangCooldown(ctx, `ekonomi.${key}`)) continue;
    const baru = ctx.country[key] === "B" ? "A" : "B";
    const skor = calculateEconomicPolicySatisfaction({ ...ctx.country, [key]: baru });
    if (skor > sekarang) opsi.push({ variabel: key, nilaiBaru: baru, skorBaru: skor });
  }

  if (!sedangCooldown(ctx, "ekonomi.sistem_ekonomi_val")) {
    const val = nilaiAngka(ctx.country.sistem_ekonomi_val, 50);
    for (const arah of [-LANGKAH_SISTEM, LANGKAH_SISTEM]) {
      const baru = Math.max(0, Math.min(100, val + arah));
      if (baru === val) continue;
      const skor = calculateEconomicPolicySatisfaction({ ...ctx.country, sistem_ekonomi_val: baru });
      if (skor > sekarang) opsi.push({ variabel: "sistem_ekonomi_val", nilaiBaru: baru, skorBaru: skor });
    }
  }
  return opsi.sort((a, b) => b.skorBaru - a.skorBaru);
}

export function cekAlertSistemEkonomi(ctx: BrainContext): AlertCandidate[] {
  const c = cekSkorTurun(
    ctx,
    "sistemEconomi" as never === undefined ? "sistemEkonomi" : "sistemEkonomi",
    [...KEBIJAKAN_KEYS, "sistem_ekonomi_val"],
    "Kebijakan ekonomi tidak seimbang menurut preferensi rakyat",
  );
  return c ? [c] : [];
}

export function otakSistemEkonomi(ctx: BrainContext, alert: NpcAlert): BrainResult {
  if (!bolehBertindak(alert)) return TAHAN("Sistem ekonomi waspada tapi skor tidak menurun — tahan");

  const diubah: string[] = [];
  const ringkas: string[] = [];
  for (let i = 0; i < JUMLAH_PERUBAHAN[alert.tingkat]; i++) {
    const terbaik = evaluasiOpsi(ctx)[0];
    if (!terbaik) break;
    const lama = ctx.country[terbaik.variabel];
    ctx.country[terbaik.variabel] = terbaik.nilaiBaru;
    const cd = terbaik.variabel === "sistem_ekonomi_val"
      ? COOLDOWN_HARI[alert.tingkat]
      : COOLDOWN_HARI[alert.tingkat] + COOLDOWN_KEBIJAKAN_EKSTRA;
    setCooldown(ctx, `ekonomi.${terbaik.variabel}`, cd);
    diubah.push(terbaik.variabel);
    if (terbaik.variabel === "sistem_ekonomi_val") {
      const labelLama = getEconomicSystemDetails(Number(lama ?? 50)).title;
      const labelBaru = getEconomicSystemDetails(Number(terbaik.nilaiBaru)).title;
      ringkas.push(`Spektrum sistem ekonomi: ${labelLama} → ${labelBaru} (skor ${terbaik.skorBaru}/100)`);
      continue;
    }

    const policyId = terbaik.variabel.replace(/^policy_/, "");
    const policy = ECONOMIC_POLICIES.find((item) => item.id === policyId);
    if (policy) {
      const optionLama = lama === "B" ? policy.optionB.label : policy.optionA.label;
      const optionBaru = terbaik.nilaiBaru === "B" ? policy.optionB.label : policy.optionA.label;
      ringkas.push(`${policy.name}: ${optionLama} → ${optionBaru} (skor ${terbaik.skorBaru}/100)`);
    } else {
      ringkas.push(`Kebijakan ekonomi ${policyId.replace(/_/g, " ")} diperbarui (skor ${terbaik.skorBaru}/100)`);
    }
  }

  if (diubah.length === 0) {
    return TAHAN("Tidak ada perubahan kebijakan yang menaikkan skor / masih cooldown", "tidak ada opsi kebijakan yang memperbaiki skor");
  }
  return { diubah: true, ringkasan: `Ubah kebijakan: ${ringkas.join(", ")}`, variabelDiubah: diubah };
}

export const OTAK_SISTEM_EKONOMI: IndikatorOtak = {
  id: "sistemEkonomi",
  cek: cekAlertSistemEkonomi,
  otak: otakSistemEkonomi,
};
