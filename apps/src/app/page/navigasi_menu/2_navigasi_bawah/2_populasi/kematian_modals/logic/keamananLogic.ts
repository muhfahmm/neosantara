/**
 * logic Keamanan
 * Menghitung rincian keamanan negara berdasarkan jumlah bangunan penegakan hukum.
 * Semakin banyak bangunan penegakan hukum, nilai/rasio keamanannya semakin kecil (misal mengurangi risiko ketidakamanan)
 * atau sebaliknya disesuaikan dengan logika "semakin banyak bangunan maka nilai atau rasionya semakin kecil".
 */

export interface KeamananCalculationResult {
  populasi: number;
  tingkatKeamanan: number; // Persentase keamanan asli dari data
  totalBangunanHukum: number;
  idealHukum: number;
  hukumRatio: number; // jumlahBangunan / idealBangunan
  securityFactor: number; // Semakin banyak bangunan, rasionya semakin besar, pengali (faktor risiko ke tingkat kematian) semakin kecil.
}

export function calculateKeamananLogic(
  countryDetail: any,
  populasi: number
): KeamananCalculationResult {
  // Hitung tingkat keamanan secara dinamis berdasarkan fasilitas penegakan hukum
  const posPolisi = Number(countryDetail?.pos_polisi ?? 0);
  const pengadilan = Number(countryDetail?.pengadilan ?? 0);
  const kejaksaan = Number(countryDetail?.kejaksaan ?? 0);
  const akademiPolisi = Number(countryDetail?.akademi_polisi ?? 0);
  const pusatBantuanHukum = Number(countryDetail?.pusat_bantuan_hukum ?? 0);

  const totalBangunanHukum = posPolisi + pengadilan + kejaksaan + akademiPolisi + pusatBantuanHukum;

  // Kebutuhan ideal bangunan penegakan hukum berdasarkan populasi (1 per 7.000 jiwa sesuai PENEGAKAN_HUKUM_TARGET_RATIO)
  const idealHukum = Math.ceil(populasi / 7000) || 1;

  // Rasio ketersediaan bangunan penegakan hukum terhadap ideal (maksimal 1)
  const hukumRatio = Math.min(1, totalBangunanHukum / idealHukum);

  // Hitung persentase tingkat keamanan dinamis (0-100%)
  const tingkatKeamanan = Math.min(100, Math.round(hukumRatio * 100));

  // Faktor pengali kematian akibat keamanan:
  // Jika tingkatKeamanan tinggi (misal 100%), faktor pengali mendekati 0.75 (kematian akibat keamanan sangat kecil).
  // Jika tingkatKeamanan rendah, faktor pengali naik mendekati 1.25.
  const securityFactor = Math.max(0.75, 1.25 - (0.005 * tingkatKeamanan));

  return {
    populasi,
    tingkatKeamanan,
    totalBangunanHukum,
    idealHukum,
    hukumRatio,
    securityFactor,
  };
}
