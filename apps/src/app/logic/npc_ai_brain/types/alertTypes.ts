/**
 * alertTypes.ts
 * Tipe, spektrum skor, dan konstanta untuk sistem alert otak AI negara NPC.
 */

export type IndikatorId =
  | "pajak"
  | "harga"
  | "pangan"
  | "listrik"
  | "hunian"
  | "layananPublik"
  | "keterbukaan"
  | "sistemEkonomi"
  | "subsidi";

export const SEMUA_INDIKATOR: IndikatorId[] = [
  "pajak",
  "harga",
  "pangan",
  "listrik",
  "hunian",
  "layananPublik",
  "keterbukaan",
  "sistemEkonomi",
  "subsidi",
];

export type JenisAlert = "SKOR_TURUN" | "KEKURANGAN" | "KETIDAKCOCOKAN";
export type TingkatAlert = "KRITIS" | "TINGGI" | "SEDANG";
export type StatusAlert = "aktif" | "ditangani" | "selesai";

/** Satu objek per masalah (format persis sesuai spesifikasi). */
export interface NpcAlert {
  id: string;
  negaraId: string;
  indikator: IndikatorId;
  jenis: JenisAlert;
  tingkat: TingkatAlert;
  skorSekarang: number;
  skorSebelumnya: number;
  penyebab: string;
  variabelYangBisaDiubah: string[];
  tanggalDibuat: string;
  status: StatusAlert;
}

/** Hasil pengecekan indikator sebelum diubah menjadi alert (dedupe dilakukan alertStore). */
export interface AlertCandidate {
  indikator: IndikatorId;
  jenis: JenisAlert;
  tingkat: TingkatAlert;
  skorSekarang: number;
  penyebab: string;
  variabelYangBisaDiubah: string[];
}

/** State otak AI yang disimpan per negara NPC (country.ai_brain_state). */
export interface NpcAiBrainState {
  version: 1;
  alerts: NpcAlert[];
  prevScores: Partial<Record<IndikatorId, number>>;
  /** variabel -> tanggal (YYYY-MM-DD) cooldown berakhir */
  cooldowns: Record<string, string>;
  /** indikator -> alasan pembangunan/aksi terblokir (bahan/anggaran kurang) */
  blokir: Partial<Record<IndikatorId, string>>;
  /** komoditas yang dikecualikan karena tidak sesuai flag sumber daya */
  abaikan: string[];
  alertSeq: number;
  lastRunDate?: string;
}

// ─── Spektrum skor (sesuai UI Sektor Utama) ─────────────────────────────────
export const BATAS_HIJAU = 66;
export const BATAS_NETRAL_ATAS = 65;

/**
 * 0–25 KRITIS · 26–40 TINGGI · 41–65 SEDANG (hanya bila menurun) · ≥66 tanpa alert.
 */
export function tingkatDariSkor(skor: number, skorSebelumnya?: number): TingkatAlert | null {
  if (skor >= BATAS_HIJAU) return null;
  if (skor <= 25) return "KRITIS";
  if (skor <= 40) return "TINGGI";
  if (skorSebelumnya !== undefined && skor < skorSebelumnya) return "SEDANG";
  return null;
}

export const URUTAN_TINGKAT: Record<TingkatAlert, number> = { KRITIS: 0, TINGGI: 1, SEDANG: 2 };

/** Cooldown (hari simulasi) sebelum variabel yang sama boleh diubah lagi (minimal per bulan / 30 hari). */
export const COOLDOWN_HARI: Record<TingkatAlert, number> = { KRITIS: 15, TINGGI: 20, SEDANG: 30 };
/** Cooldown untuk perubahan struktural (pembangunan) per bulan (30 hari). */
export const COOLDOWN_BANGUN_HARI = 30;

export const JUMLAH_ALERT_SELESAI_DISIMPAN = 20;

export function buatStateKosong(): NpcAiBrainState {
  return {
    version: 1,
    alerts: [],
    prevScores: {},
    cooldowns: {},
    blokir: {},
    abaikan: [],
    alertSeq: 0,
  };
}
