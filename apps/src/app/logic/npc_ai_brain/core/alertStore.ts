/**
 * alertStore.ts
 * Siklus hidup alert: buat (tanpa duplikat) → aktif → ditangani → selesai (skor ≥ 66).
 * Aturan: satu alert terbuka per indikator per negara.
 */
import type {
  AlertCandidate,
  IndikatorId,
  JenisAlert,
  NpcAiBrainState,
  NpcAlert,
} from "../types/alertTypes";
import {
  BATAS_HIJAU,
  JUMLAH_ALERT_SELESAI_DISIMPAN,
  URUTAN_TINGKAT,
} from "../types/alertTypes";

const PRESEDEN_JENIS: Record<JenisAlert, number> = {
  KETIDAKCOCOKAN: 0,
  KEKURANGAN: 1,
  SKOR_TURUN: 2,
};

export function alertTerbuka(state: NpcAiBrainState, indikator: IndikatorId): NpcAlert | undefined {
  return state.alerts.find((a) => a.indikator === indikator && a.status !== "selesai");
}

/** Gabungkan beberapa kandidat satu indikator menjadi satu (jenis & tingkat terberat). */
function gabungKandidat(list: AlertCandidate[]): AlertCandidate {
  const urut = [...list].sort(
    (a, b) =>
      PRESEDEN_JENIS[a.jenis] - PRESEDEN_JENIS[b.jenis] ||
      URUTAN_TINGKAT[a.tingkat] - URUTAN_TINGKAT[b.tingkat],
  );
  const utama = urut[0];
  const tingkatTerberat = [...list].sort((a, b) => URUTAN_TINGKAT[a.tingkat] - URUTAN_TINGKAT[b.tingkat])[0].tingkat;
  return {
    ...utama,
    tingkat: tingkatTerberat,
    penyebab: Array.from(new Set(list.map((c) => c.penyebab))).join(" | "),
    variabelYangBisaDiubah: Array.from(new Set(list.flatMap((c) => c.variabelYangBisaDiubah))),
  };
}

export interface SinkronAlertInput {
  negaraId: string;
  date: string;
  candidates: AlertCandidate[];
  scores: Record<IndikatorId, number>;
  prevScores: Partial<Record<IndikatorId, number>>;
}

/**
 * Perbarui daftar alert berdasar kandidat tick ini.
 * - tidak ada duplikat (kunci: indikator)
 * - alert terbuka tanpa kandidat & skor ≥ 66  → "selesai"
 * - alert terbuka tanpa kandidat & skor < 66  → dipertahankan (krisis dikejar sampai hijau)
 */
export function sinkronkanAlert(state: NpcAiBrainState, input: SinkronAlertInput): void {
  const { negaraId, date, candidates, scores, prevScores } = input;
  const perIndikator = new Map<IndikatorId, AlertCandidate[]>();
  for (const c of candidates) {
    const arr = perIndikator.get(c.indikator) ?? [];
    arr.push(c);
    perIndikator.set(c.indikator, arr);
  }

  for (const [indikator, list] of perIndikator) {
    const merged = gabungKandidat(list);
    const existing = alertTerbuka(state, indikator);
    const skorSebelumnya = prevScores[indikator] ?? scores[indikator];
    if (existing) {
      existing.jenis = merged.jenis;
      existing.tingkat = merged.tingkat;
      existing.skorSekarang = scores[indikator];
      existing.skorSebelumnya = skorSebelumnya;
      existing.penyebab = merged.penyebab;
      existing.variabelYangBisaDiubah = merged.variabelYangBisaDiubah;
    } else {
      state.alertSeq += 1;
      state.alerts.push({
        id: `${negaraId}:${indikator}:${state.alertSeq}`,
        negaraId,
        indikator,
        jenis: merged.jenis,
        tingkat: merged.tingkat,
        skorSekarang: scores[indikator],
        skorSebelumnya,
        penyebab: merged.penyebab,
        variabelYangBisaDiubah: merged.variabelYangBisaDiubah,
        tanggalDibuat: date,
        status: "aktif",
      });
    }
  }

  for (const alert of state.alerts) {
    if (alert.status === "selesai") continue;
    const adaKandidat = perIndikator.has(alert.indikator);
    alert.skorSekarang = scores[alert.indikator];
    alert.skorSebelumnya = prevScores[alert.indikator] ?? alert.skorSebelumnya;
    if (!adaKandidat && scores[alert.indikator] >= BATAS_HIJAU) {
      alert.status = "selesai";
      delete state.blokir[alert.indikator];
    }
  }

  // Pangkas riwayat alert selesai.
  const selesai = state.alerts.filter((a) => a.status === "selesai");
  if (selesai.length > JUMLAH_ALERT_SELESAI_DISIMPAN) {
    const buang = new Set(selesai.slice(0, selesai.length - JUMLAH_ALERT_SELESAI_DISIMPAN).map((a) => a.id));
    state.alerts = state.alerts.filter((a) => !buang.has(a.id));
  }
}

/**
 * Urutan penanganan:
 *  1) KETIDAKCOCOKAN dulu (selesaikan penyebab)
 *  2) KEKURANGAN preventif pada Pangan & Listrik
 *  3) sisanya KRITIS → TINGGI → SEDANG
 */
export function urutkanAlertUntukDitangani(alerts: NpcAlert[]): NpcAlert[] {
  const bobot = (a: NpcAlert): number => {
    if (a.jenis === "KETIDAKCOCOKAN") return 0;
    if (a.jenis === "KEKURANGAN" && (a.indikator === "pangan" || a.indikator === "listrik")) return 1;
    return 2;
  };
  return alerts
    .filter((a) => a.status !== "selesai")
    .sort((a, b) => bobot(a) - bobot(b) || URUTAN_TINGKAT[a.tingkat] - URUTAN_TINGKAT[b.tingkat]);
}
