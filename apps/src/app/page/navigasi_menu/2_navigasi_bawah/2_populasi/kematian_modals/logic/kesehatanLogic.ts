/**
 * logic Fasilitas Kesehatan
 * Menghitung rincian kesehatan berdasarkan jumlah bangunan medis.
 * Semakin banyak bangunan kesehatan, rasionya semakin besar, dan sisa kekurangan fasilitas kesehatan semakin kecil (nilai/faktor pengali kematian semakin kecil).
 */

export interface KesehatanCalculationResult {
  populasi: number;
  jumlahRumahSakit: number; // Rumah sakit gabungan atau rs besar
  totalBangunanMedis: number; // Semua jenis bangunan kesehatan
  idealKesehatan: number;
  kesehatanRatio: number; // total / ideal
  healthFactor: number; // Pengali kematian (semakin kecil jika bangunan semakin banyak)
}

export function calculateKesehatanLogic(
  countryDetail: any,
  populasi: number
): KesehatanCalculationResult {
  // Ambil data dasar rumah sakit bawaan negara
  const baseRumahSakit = Number(countryDetail?.jumlah_rumah_sakit ?? 0);

  // Bangunan kesehatan tambahan yang ada di Tempat Umum & Layanan Publik (SERVICE_GROUPS: kesehatan)
  const rsBesar = Number(countryDetail?.rumah_sakit_besar ?? 0);
  const rsKecil = Number(countryDetail?.rumah_sakit_kecil ?? 0);
  const pusatDiagnostik = Number(countryDetail?.pusat_diagnostik ?? 0);

  const totalBangunanMedis = baseRumahSakit + rsBesar + rsKecil + pusatDiagnostik;

  // Ideal bangunan kesehatan (1 per 25.000 jiwa sesuai target layanan publik)
  const idealKesehatan = Math.ceil(populasi / 25000) || 1;

  // Rasio bangunan kesehatan (maksimal 1)
  const kesehatanRatio = Math.min(1, totalBangunanMedis / idealKesehatan);

  // Faktor pengali kematian akibat kesehatan (healthFactor):
  // Ketika kesehatanRatio mendekati 1 (banyak bangunan), healthFactor mengecil ke 0.70 (kematian sangat rendah).
  // Ketika kesehatanRatio mendekati 0 (sedikit bangunan), healthFactor membesar ke 1.30 (kematian tinggi).
  const healthFactor = Math.max(0.70, 1.30 - (0.6 * kesehatanRatio));

  return {
    populasi,
    jumlahRumahSakit: baseRumahSakit + rsBesar + rsKecil,
    totalBangunanMedis,
    idealKesehatan,
    kesehatanRatio,
    healthFactor,
  };
}
