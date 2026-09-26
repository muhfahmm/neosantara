/**
 * Schema & Model Type Definition untuk Tabel SQL `database_sektor_listrik_nasional`
 * 
 * CATATAN: Data tidak lagi disimpan secara statis di TypeScript.
 * Seluruh data kelistrikan 207 negara dikelola langsung melalui database SQL
 * (`database_sektor_listrik_nasional.sql` & database MySQL server).
 */

export interface SektorListrikNasionalRow {
  id: number;
  country: string;
  country_slug: string;
  pembangkit_listrik_tenaga_gas: number;
  pembangkit_listrik_tenaga_air: number;
  pembangkit_listrik_tenaga_nuklir: number;
  pembangkit_listrik_tenaga_surya: number;
  pembangkit_listrik_tenaga_uap: number;
  pembangkit_listrik_tenaga_angin: number;
}

export const TABLE_SEKTOR_LISTRIK_NASIONAL = 'database_sektor_listrik_nasional';
