/**
 * logic Kriminalitas
 * Menghitung tingkat kriminalitas berdasarkan infrastruktur pengamanan dan penegakan hukum.
 * Semakin banyak bangunan polisi/keamanan, tingkat kriminalitas rasionya semakin kecil, sehingga faktor pengali kematian semakin kecil.
 */

export interface KriminalitasCalculationResult {
  populasi: number;
  tingkatKriminalitas: number; // Persentase kriminalitas dasar
  totalBangunanPolisi: number; // Jumlah pos polisi, armada polisi, akademi polisi
  idealPolisi: number;
  polisiRatio: number;
  crimeFactor: number; // Pengali kematian (semakin kecil jika bangunan semakin banyak)
}

import {
  applyKementerianKehakimanCrimeReduction,
  applyPolisiCrimeReduction,
} from "@/app/page/bonus_logic";

export function calculateKriminalitasLogic(
  countryDetail: any,
  populasi: number
): KriminalitasCalculationResult {
  const baseKriminalitas = countryDetail?.tingkat_kriminalitas ?? 5;

  // Bangunan polisi & keamanan
  const posPolisi = Number(countryDetail?.pos_polisi ?? 0);
  const armadaPolisi = Number(countryDetail?.armada_mobil_polisi ?? 0);
  const akademiPolisi = Number(countryDetail?.akademi_polisi ?? 0);

  const totalBangunanPolisi = posPolisi + armadaPolisi + akademiPolisi;

  // Kebutuhan ideal polisi per populasi (misal 1 per 40.000 jiwa)
  const idealPolisi = Math.ceil(populasi / 40000) || 1;

  // Rasio ketersediaan polisi (maksimal 1)
  const polisiRatio = Math.min(1, totalBangunanPolisi / idealPolisi);

  // Kriminalitas efektif menurun jika polisi melimpah
  // Jika rasio = 1 (ideal), kriminalitas berkurang hingga 50% dari base.
  const rawAdjusted = Math.max(0.1, baseKriminalitas * (1.0 - 0.5 * polisiRatio));
  // Penurunan tingkat kriminalitas dari Kementerian Kehakiman dan Departemen Keamanan (Polisi)
  const kehakimanAdjusted = applyKementerianKehakimanCrimeReduction(rawAdjusted, countryDetail);
  const adjustedKriminalitas = applyPolisiCrimeReduction(kehakimanAdjusted, countryDetail);

  // Faktor pengali kematian akibat kejahatan: 1 + (adjustedKriminalitas * 0.02)
  // Semakin banyak bangunan -> polisiRatio naik -> adjustedKriminalitas turun -> crimeFactor turun (semakin kecil)
  const crimeFactor = 1 + (adjustedKriminalitas * 0.02);

  return {
    populasi,
    tingkatKriminalitas: adjustedKriminalitas,
    totalBangunanPolisi,
    idealPolisi,
    polisiRatio,
    crimeFactor,
  };
}
