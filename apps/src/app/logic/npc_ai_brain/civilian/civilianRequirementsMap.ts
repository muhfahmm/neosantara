/**
 * civilianRequirementsMap.ts
 * Peta kebutuhan material bangunan untuk 14 sektor sipil
 * Mengimpor dari file requirements yang sudah ada di modul pembangunan.
 */

import { REQUIREMENTS as KELISTRIKAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/1_kelistrikan/requirements";
import { REQUIREMENTS as MINERAL_ENERGI_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/2_mineral_kritis/requirements";
import { REQUIREMENTS as MANUFAKTUR_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/3_manufaktur/requirements";
import { REQUIREMENTS as PETERNAKAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/4_peternakan/requirements";
import { REQUIREMENTS as AGRIKULTUR_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/5_agrikultur/requirements";
import { REQUIREMENTS as PERIKANAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/6_perikanan/requirements";
import { REQUIREMENTS as OLAHAN_PANGAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/7_olahan_pangan/requirements";

import { REQUIREMENTS as INFRASTRUKTUR_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/1_infrastruktur/requirements";
import { REQUIREMENTS as PENDIDIKAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/2_pendidikan/requirements";
import { REQUIREMENTS as KESEHATAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/3_kesehatan/requirements";
import { REQUIREMENTS as PENEGAKAN_HUKUM_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/4_penegakan_hukum/requirements";
import { REQUIREMENTS as OLAHRAGA_HIBURAN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/5_olahraga_hiburan/requirements";
import { REQUIREMENTS as KOMERSIAL_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/6_komersial/requirements";

import { REQUIREMENTS as PERUMAHAN_SUBSIDI_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/1_perumahan_subsidi/requirements";
import { REQUIREMENTS as APARTEMEN_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/2_apartement/requirements";
import { REQUIREMENTS as MANSION_REQS } from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/3_hunian/construction_support/3_mansion/requirements";

export interface RequirementItem {
  resourceKey: string;
  amount: number;
  label?: string;
}

export interface BuildingRequirementEntry {
  buildingKey: string;
  requirements: RequirementItem[];
}

export const ALL_CIVILIAN_REQUIREMENTS: BuildingRequirementEntry[] = [
  ...KELISTRIKAN_REQS,
  ...MINERAL_ENERGI_REQS,
  ...MANUFAKTUR_REQS,
  ...PETERNAKAN_REQS,
  ...AGRIKULTUR_REQS,
  ...PERIKANAN_REQS,
  ...OLAHAN_PANGAN_REQS,
  ...INFRASTRUKTUR_REQS,
  ...PENDIDIKAN_REQS,
  ...KESEHATAN_REQS,
  ...PENEGAKAN_HUKUM_REQS,
  ...OLAHRAGA_HIBURAN_REQS,
  ...KOMERSIAL_REQS,
  ...PERUMAHAN_SUBSIDI_REQS,
  ...APARTEMEN_REQS,
  ...MANSION_REQS,
];

export const REQUIREMENTS_BY_SECTOR: Record<string, BuildingRequirementEntry> = {};

for (const entry of ALL_CIVILIAN_REQUIREMENTS) {
  if (entry && entry.buildingKey) {
    REQUIREMENTS_BY_SECTOR[entry.buildingKey] = entry;
  }
}
