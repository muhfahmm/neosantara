/**
 * Schema & Model Type Definition untuk Tabel SQL `database_sektor_mineral_kritis`
 * 
 * CATATAN: Data tidak lagi disimpan secara statis di TypeScript.
 * Seluruh data mineral kritis 207 negara dikelola langsung melalui database SQL
 * (`database_sektor_mineral_kritis.sql` & database MySQL server).
 */

export interface SektorMineralKritisRow {
  id: number;
  country: string;
  country_slug: string;
  bijih_besi: number;
  litium: number;
  logam_tanah_jarang: number;
  emas: number;
  batu_bara: number;
  minyak_bumi: number;
  gas_alam: number;
  uranium: number;
  garam: number;
}

export const TABLE_SEKTOR_MINERAL_KRITIS = 'database_sektor_mineral_kritis';
