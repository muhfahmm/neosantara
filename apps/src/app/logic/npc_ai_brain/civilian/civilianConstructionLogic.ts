/**
 * civilianConstructionLogic.ts
 *
 * BAGIAN 3: AI MEMBANGUN BANGUNAN SIPIL
 * 
 * Sektor yang dicakup (14 sektor):
 * - Kelistrikan, Mineral & Energi, Manufaktur, Peternakan, Agrikultur, Perikanan, Olahan Pangan
 * - Infrastruktur, Pendidikan, Kesehatan, Penegakan Hukum, Olahraga & Hiburan, Komersial
 * - Perumahan
 *
 * 4 Syarat sebelum membangun (Cek Berurutan, Gagal Satu = Batal):
 * 1. Uang (kas negara) cukup untuk biaya_pembangunan dan tidak membuat Netto APBN negatif.
 * 2. Material cukup. Bila kurang, cek bahan alternatif jika ada di stok. Bila tetap kurang, tunda dan buat alert KEKURANGAN.
 * 3. Ada lowongan kerja/penduduk yang cukup untuk bangunan tersebut.
 * 4. Listrik cukup untuk konsumsi bangunan baru (balance MW cukup).
 *
 * Prioritas membangun (dari tinggi ke rendah):
 * 1. Alert KRITIS/TINGGI dari indikator terkait (contoh: Layanan Publik 11% -> bangun Pendidikan, Kesehatan, Penegakan Hukum, Olahraga & Hiburan).
 * 2. Produksi Pangan dan Produksi Listrik (preventif, selalu hijau).
 * 3. Perumahan.
 * 4. Sektor lain yang jumlah bangunannya masih tertinggal dibanding kebutuhan penduduk.
 *
 * Aturan cerdas:
 * - Bangun bertahap (satu atau beberapa per keputusan, bukan sekaligus), sisakan cadangan kas minimum.
 * - Jangan membangun sektor yang skornya sudah hijau (66-100) kecuali preventif untuk pangan/listrik.
 * - Beri cooldown antar pembangunan di sektor yang sama.
 * - Hormati waktu_pembangunan: bangunan baru aktif setelah selesai, queue yang sedang berjalan dihitung dulu.
 */

import { findBuildingMetadata, getMaterialStock, deductBuildingMaterials } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/build_logic/build_logic";
import { calculateNetBalanceWithEconomicEmbargo } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/1_resolusi_PBB/logic/3_economicEmbargoLogic";
import { getCountryConsumptionBreakdown } from "@/app/page/navigasi_menu/2_navigasi_bawah/3_produksi_konsumsi/1_grid_nasional/consumptionLogic";
import type { BrainContext, BrainResult } from "../core/brainContext";
import { nilaiAngka, sedangCooldown, setCooldown, tambahHari } from "../core/brainContext";
import { buatKandidat } from "../core/alertFactory";
import { SEMUA_SEKTOR, cariSektorByKey } from "../sectors";
import { REQUIREMENTS_BY_SECTOR } from "@/app/logic/npc_ai_brain/civilian/civilianRequirementsMap";
import {
  buatBeritaPembangunanSipil,
  terbitkanBeritaAI,
} from "../core/aiNewsBridge";

export interface PendingConstruction {
  id: string;
  buildingKey: string;
  sektorId: string;
  jumlah: number;
  startDate: string;
  completionDate: string;
  daysRemaining: number;
}

export interface CivilianConstructionDecision {
  status: "bangun" | "tahan" | "kekurangan_material" | "dana_kurang" | "listrik_kurang" | "penduduk_kurang";
  buildingKey?: string;
  sektorId?: string;
  jumlah?: number;
  alasan: string;
}

/** Cadangan kas minimum yang wajib disisakan agar tidak pailit */
const CADANGAN_KAS_MINIMUM = 50000;
/** Cooldown per bulan (30 hari) untuk setiap pembangunan agar tidak membanjiri notifikasi */
const COOLDOWN_NEGARA_HARI = 30;
const COOLDOWN_SEKTOR_HARI = 30;

/** Peta substitusi/alternatif material bila bahan baku utama tidak cukup */
export const MATERIAL_ALTERNATIVES: Record<string, string[]> = {
  semen_beton: ["batu_bara", "kayu"],
  kayu: ["bambu", "semen_beton"],
  bijih_besi: ["tembaga", "bauksit"],
  batu_bara: ["gas_alam", "minyak_mentah"],
};

/**
 * Memperbarui dan menyelesaikan antrian pembangunan yang sudah jatuh tempo berdasarkan tanggal simulasi.
 */
export function updateCivilianConstructionQueue(ctx: BrainContext): void {
  const currentQueue: PendingConstruction[] = Array.isArray(ctx.country.ai_civilian_construction_queue)
    ? [...ctx.country.ai_civilian_construction_queue]
    : [];

  if (currentQueue.length === 0) return;

  const remainingQueue: PendingConstruction[] = [];

  for (const item of currentQueue) {
    if (item.startDate >= ctx.date) {
      remainingQueue.push(item);
      continue;
    }
    item.daysRemaining = Math.max(0, item.daysRemaining - 1);
    if (item.daysRemaining <= 0) {
      // Bangunan telah selesai dibangun, aktifkan ke country
      const prev = nilaiAngka(ctx.country[item.buildingKey]);
      ctx.country[item.buildingKey] = prev + item.jumlah;
      if (prev <= 0) ctx.country[`build_date_${item.buildingKey}`] = item.completionDate || ctx.date;
    } else {
      remainingQueue.push(item);
    }
  }

  ctx.country.ai_civilian_construction_queue = remainingQueue;
}

/**
 * Menghitung jumlah unit bangunan tertentu yang saat ini sedang dalam proses konstruksi.
 */
export function getPendingBuildingCount(ctx: BrainContext, buildingKey: string): number {
  const queue: PendingConstruction[] = Array.isArray(ctx.country.ai_civilian_construction_queue)
    ? ctx.country.ai_civilian_construction_queue
    : [];
  return queue
    .filter((q) => q.buildingKey === buildingKey)
    .reduce((sum, q) => sum + q.jumlah, 0);
}

/**
 * Evaluasi 4 syarat ketat pembangunan sipil:
 * 1. Kas cukup & Netto APBN tidak negatif
 * 2. Material cukup (atau substitusi alternatif)
 * 3. Penduduk/lowongan kerja cukup
 * 4. Listrik mencukupi konsumsi bangunan
 */
export function evaluasiSyaratPembangunan(
  ctx: BrainContext,
  buildingKey: string,
  jumlah: number,
): { lolos: boolean; alasan: string; statusGagal?: CivilianConstructionDecision["status"]; bahanKurang?: string[] } {
  const meta = findBuildingMetadata(ctx.metadata, buildingKey);
  if (!meta) {
    return { lolos: false, alasan: `Metadata untuk ${buildingKey} tidak ditemukan.` };
  }

  // --- SYARAT 1: KAS NEGARA & NETTO APBN ---
  const biayaPerUnit = nilaiAngka(meta.biaya_pembangunan);
  const totalBiaya = biayaPerUnit * jumlah;
  const kasSekarang = nilaiAngka(ctx.country.anggaran);

  if (kasSekarang - totalBiaya < CADANGAN_KAS_MINIMUM) {
    return {
      lolos: false,
      statusGagal: "dana_kurang",
      alasan: `Kas negara (${kasSekarang.toLocaleString()}) tidak cukup untuk biaya (${totalBiaya.toLocaleString()}) dengan cadangan minimum (${CADANGAN_KAS_MINIMUM.toLocaleString()}).`,
    };
  }

  const nettoAPBN = calculateNetBalanceWithEconomicEmbargo(ctx.country, ctx.negaraNama);
  if (nettoAPBN < 0) {
    return {
      lolos: false,
      statusGagal: "dana_kurang",
      alasan: `Netto APBN negara sedang defisit (${nettoAPBN.toLocaleString()}), menunda pembangunan sipil.`,
    };
  }

  // --- SYARAT 2: MATERIAL CUKUP (DENGAN ALTERNATIF) ---
  const reqEntry = REQUIREMENTS_BY_SECTOR[buildingKey];
  const requirements = reqEntry?.requirements || [];
  const bahanKurang: string[] = [];

  for (const req of requirements) {
    const butuh = (Number(req.amount) || 0) * jumlah;
    if (butuh <= 0) continue;

    let stokTersedia = getMaterialStock(ctx.country, req.resourceKey);
    if (stokTersedia < butuh) {
      // Coba cek bahan alternatif bila ada
      const alternatif = MATERIAL_ALTERNATIVES[req.resourceKey] || [];
      let terpenuhiAlternatif = false;
      for (const altKey of alternatif) {
        const altStock = getMaterialStock(ctx.country, altKey);
        if (altStock >= butuh) {
          terpenuhiAlternatif = true;
          break;
        }
      }

      if (!terpenuhiAlternatif) {
        bahanKurang.push(req.resourceKey);
      }
    }
  }

  if (bahanKurang.length > 0) {
    return {
      lolos: false,
      statusGagal: "kekurangan_material",
      bahanKurang,
      alasan: `Material kurang: ${bahanKurang.join(", ")}.`,
    };
  }

  // --- SYARAT 3: PENDUDUK / TENAGA KERJA CUKUP ---
  const populasiTotal = nilaiAngka(ctx.country.populasi || ctx.country.population);
  const pekerjaPerUnit = nilaiAngka(meta.kebutuhan_pekerja || meta.tenaga_kerja || meta.pekerja || 50);
  const totalKebutuhanPekerja = pekerjaPerUnit * jumlah;
  // Perkiraan rasio angkatan kerja tersedia minimal 5% dari total populasi
  const estimasiPekerjaTersedia = Math.max(100, Math.floor(populasiTotal * 0.05));

  if (populasiTotal > 0 && estimasiPekerjaTersedia < totalKebutuhanPekerja) {
    return {
      lolos: false,
      statusGagal: "penduduk_kurang",
      alasan: `Tenaga kerja tidak mencukupi untuk mengoperasikan ${jumlah} ${buildingKey}.`,
    };
  }

  // --- SYARAT 4: LISTRIK CUKUP UNTUK KONSUMSI BANGUNAN BARU ---
  const konsumsiListrikPerUnit = nilaiAngka(meta.konsumsi_listrik || meta.konsumsi_energi || 0);
  if (konsumsiListrikPerUnit > 0) {
    const grid = getCountryConsumptionBreakdown(ctx.country, ctx.metadata);
    const produksiMW = nilaiAngka(grid.totalProductionMW);
    const konsumsiMW = nilaiAngka(grid.totalAllBreakdownConsumption);
    const sisaMW = produksiMW - konsumsiMW;
    const butuhMW = konsumsiListrikPerUnit * jumlah;

    if (sisaMW < butuhMW) {
      return {
        lolos: false,
        statusGagal: "listrik_kurang",
        alasan: `Sisa daya listrik (${sisaMW.toFixed(1)} MW) tidak mencukupi konsumsi (${butuhMW.toFixed(1)} MW).`,
      };
    }
  }

  return { lolos: true, alasan: "Semua 4 syarat pembangunan terpenuhi." };
}

/**
 * Mengeksekusi penempatan pembangunan sipil ke dalam antrian waktu_pembangunan
 * dan memotong kas serta material secara langsung.
 */
export function jalankanPembangunanSipil(
  ctx: BrainContext,
  buildingKey: string,
  sektorId: string,
  jumlah: number,
): boolean {
  const meta = findBuildingMetadata(ctx.metadata, buildingKey);
  if (!meta) return false;

  const biayaPerUnit = nilaiAngka(meta.biaya_pembangunan);
  const totalBiaya = biayaPerUnit * jumlah;

  // Potong kas negara
  ctx.country.anggaran = Math.max(0, nilaiAngka(ctx.country.anggaran) - totalBiaya);

  // Potong material
  const reqEntry = REQUIREMENTS_BY_SECTOR[buildingKey];
  const requirements = reqEntry?.requirements || [];
  if (requirements.length > 0) {
    ctx.country = deductBuildingMaterials(ctx.country, requirements, jumlah);
  }

  // Ambil waktu pembangunan (dalam hari)
  const waktuHari = Math.max(1, Math.round(Number(meta.waktu_pembangunan) || 3));

  // Masukkan ke antrian pending
  const queue: PendingConstruction[] = Array.isArray(ctx.country.ai_civilian_construction_queue)
    ? [...ctx.country.ai_civilian_construction_queue]
    : [];

  queue.push({
    id: `${buildingKey}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    buildingKey,
    sektorId,
    jumlah,
    startDate: ctx.date,
    completionDate: tambahHari(ctx.date, waktuHari),
    daysRemaining: waktuHari,
  });

  ctx.country.ai_civilian_construction_queue = queue;

  // Pasang cooldown per sektor dan per negara (1 bulan / 30 hari)
  setCooldown(ctx, `sektor_${sektorId}`, COOLDOWN_SEKTOR_HARI);
  setCooldown(ctx, "pembangunan_sipil_negara", COOLDOWN_NEGARA_HARI);

  // Terbitkan ke Berita & Update Geopolitik
  const countFrom = nilaiAngka(ctx.country[buildingKey]) + getPendingBuildingCount(ctx, buildingKey) - jumlah;
  const berita = buatBeritaPembangunanSipil(
    ctx.negaraNama,
    buildingKey,
    sektorId,
    jumlah,
    ctx.date,
    countFrom,
    tambahHari(ctx.date, waktuHari),
    String(ctx.country.country_slug || ""),
  );
  terbitkanBeritaAI(berita);

  return true;
}

/**
 * Logika utama Pembangunan Sipil AI (BAGIAN 3)
 * Menentukan target bangunan berdasarkan urutan prioritas 1 -> 4.
 */
export function prosesPembangunanSipil(ctx: BrainContext): CivilianConstructionDecision {
  // Update antrian pembangunan yang sudah ada dulu
  updateCivilianConstructionQueue(ctx);

  // Cooldown bulanan per negara agar AI tidak membangun dan membanjiri notifikasi setiap hari
  if (sedangCooldown(ctx, "pembangunan_sipil_negara")) {
    return {
      status: "tahan",
      alasan: "Negara sedang dalam masa jeda (cooldown bulanan) antar proyek pembangunan sipil.",
    };
  }

  // Cek apakah ada pembangunan yang sedang berjalan pada hari ini (batasi 1-2 konstruksi aktif paralel per negara)
  const activeQueue: PendingConstruction[] = Array.isArray(ctx.country.ai_civilian_construction_queue)
    ? ctx.country.ai_civilian_construction_queue
    : [];

  if (activeQueue.length >= 2) {
    return {
      status: "tahan",
      alasan: `Maksimal 2 proyek konstruksi sipil paralel sedang berjalan (${activeQueue.map((q) => q.buildingKey).join(", ")}).`,
    };
  }

  // === PRIORITAS 1: ALERT KRITIS / TINGGI DARI INDIKATOR TERKAIT ===
  const alertKritisTinggi = (ctx.state.alerts || []).filter(
    (a) => (a.tingkat === "KRITIS" || a.tingkat === "TINGGI") && a.status !== "selesai",
  );

  for (const alert of alertKritisTinggi) {
    let candidateKeys: { key: string; sektorId: string }[] = [];

    if (alert.indikator === "layananPublik") {
      candidateKeys = [
        { key: "sekolah_dasar", sektorId: "pendidikan" },
        { key: "puskesmas", sektorId: "kesehatan" },
        { key: "kantor_polisi", sektorId: "penegakan_hukum" },
        { key: "taman_kota", sektorId: "olahraga_hiburan" },
        { key: "pasar_tradisional", sektorId: "komersial" },
      ];
    } else if (alert.indikator === "hunian") {
      candidateKeys = [
        { key: "rumah_subsidi", sektorId: "perumahan" },
        { key: "apartemen", sektorId: "perumahan" },
        { key: "mansion", sektorId: "perumahan" },
      ];
    } else if (alert.indikator === "pangan") {
      candidateKeys = [
        { key: "sawah_padi", sektorId: "agrikultur" },
        { key: "peternakan_ayam", sektorId: "peternakan" },
        { key: "tambak_udang", sektorId: "perikanan" },
        { key: "penggilingan_padi", sektorId: "olahan_pangan" },
      ];
    } else if (alert.indikator === "listrik") {
      candidateKeys = [
        { key: "pltu_batubara", sektorId: "kelistrikan" },
        { key: "plts_surya", sektorId: "kelistrikan" },
        { key: "pltg_gas", sektorId: "kelistrikan" },
      ];
    }

    for (const item of candidateKeys) {
      if (sedangCooldown(ctx, `sektor_${item.sektorId}`)) continue;

      // Hitung pending
      const pending = getPendingBuildingCount(ctx, item.key);
      if (pending > 0) continue; // Jangan menumpuk bangunan yang sama jika sedang dalam antrian

      const syarat = evaluasiSyaratPembangunan(ctx, item.key, 1);
      if (syarat.lolos) {
        jalankanPembangunanSipil(ctx, item.key, item.sektorId, 1);
        return {
          status: "bangun",
          buildingKey: item.key,
          sektorId: item.sektorId,
          jumlah: 1,
          alasan: `Membangun ${item.key} untuk meredakan alert ${alert.tingkat} pada indikator ${alert.indikator}.`,
        };
      } else if (syarat.statusGagal === "kekurangan_material" && syarat.bahanKurang) {
        // Laporkan alert KEKURANGAN material
        ctx.state.alerts.push(
          buatKandidat(
            ctx,
            alert.indikator,
            "KEKURANGAN",
            "TINGGI",
            `Kekurangan material ${syarat.bahanKurang.join(", ")} untuk pembangunan ${item.key}.`,
            syarat.bahanKurang,
          ) as any,
        );
      }
    }
  }

  // === PRIORITAS 2: PANGAN & LISTRIK (PREVENTIF, HARUS SELALU HIJAU) ===
  const skorPangan = ctx.scores.pangan ?? 50;
  const skorListrik = ctx.scores.listrik ?? 50;

  if (skorListrik < 75 && !sedangCooldown(ctx, "sektor_kelistrikan")) {
    const listKey = ["plts_surya", "pltu_batubara", "pltg_gas"];
    for (const key of listKey) {
      if (getPendingBuildingCount(ctx, key) === 0) {
        const syarat = evaluasiSyaratPembangunan(ctx, key, 1);
        if (syarat.lolos) {
          jalankanPembangunanSipil(ctx, key, "kelistrikan", 1);
          return {
            status: "bangun",
            buildingKey: key,
            sektorId: "kelistrikan",
            jumlah: 1,
            alasan: `Preventif menjaga stabilitas kelistrikan nasional (skor saat ini: ${skorListrik}%).`,
          };
        }
      }
    }
  }

  if (skorPangan < 75 && !sedangCooldown(ctx, "sektor_agrikultur")) {
    const listKey = ["sawah_padi", "kebun_jagung", "peternakan_ayam", "tambak_udang"];
    for (const key of listKey) {
      const sektor = cariSektorByKey(key)?.id || "agrikultur";
      if (!sedangCooldown(ctx, `sektor_${sektor}`) && getPendingBuildingCount(ctx, key) === 0) {
        const syarat = evaluasiSyaratPembangunan(ctx, key, 1);
        if (syarat.lolos) {
          jalankanPembangunanSipil(ctx, key, sektor, 1);
          return {
            status: "bangun",
            buildingKey: key,
            sektorId: sektor,
            jumlah: 1,
            alasan: `Preventif menjaga ketahanan pangan nasional (skor saat ini: ${skorPangan}%).`,
          };
        }
      }
    }
  }

  // === PRIORITAS 3: PERUMAHAN ===
  const skorHunian = ctx.scores.hunian ?? 50;
  if (skorHunian < 66 && !sedangCooldown(ctx, "sektor_perumahan")) {
    const listKey = ["rumah_subsidi", "apartemen"];
    for (const key of listKey) {
      if (getPendingBuildingCount(ctx, key) === 0) {
        const syarat = evaluasiSyaratPembangunan(ctx, key, 1);
        if (syarat.lolos) {
          jalankanPembangunanSipil(ctx, key, "perumahan", 1);
          return {
            status: "bangun",
            buildingKey: key,
            sektorId: "perumahan",
            jumlah: 1,
            alasan: `Membangun fasilitas perumahan untuk meningkatkan skor hunian (skor saat ini: ${skorHunian}%).`,
          };
        }
      }
    }
  }

  // === PRIORITAS 4: SEKTOR LAIN YANG TERTINGGAL (HANYA BILA SKOR BELUM HIJAU) ===
  for (const sektor of SEMUA_SEKTOR) {
    if (sedangCooldown(ctx, `sektor_${sektor.id}`)) continue;

    // Jangan membangun jika skor indikator terkait sudah hijau (66-100)
    if (sektor.id === "pendidikan" || sektor.id === "kesehatan" || sektor.id === "penegakan_hukum" || sektor.id === "olahraga_hiburan" || sektor.id === "komersial") {
      if ((ctx.scores.layananPublik ?? 50) >= 66) continue;
    }

    const sampleKey = sektor.keys[0];
    if (sampleKey && getPendingBuildingCount(ctx, sampleKey) === 0) {
      const syarat = evaluasiSyaratPembangunan(ctx, sampleKey, 1);
      if (syarat.lolos) {
        jalankanPembangunanSipil(ctx, sampleKey, sektor.id, 1);
        return {
          status: "bangun",
          buildingKey: sampleKey,
          sektorId: sektor.id,
          jumlah: 1,
          alasan: `Pembangunan proporsional sektor ${sektor.label}.`,
        };
      }
    }
  }

  return {
    status: "tahan",
    alasan: "Semua sektor sipil dalam kondisi stabil dan mencukupi.",
  };
}
