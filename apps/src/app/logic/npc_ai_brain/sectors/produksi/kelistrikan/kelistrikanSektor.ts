import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/1_kelistrikan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

/** Urutan prioritas: tanpa bahan bakar dulu, lalu pembangkit berbahan bakar. */
export const KELISTRIKAN_TANPA_BAHAN_BAKAR = [
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_angin",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_panas_bumi",
];
export const KELISTRIKAN_BERBAHAN_BAKAR = [
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_nuklir",
];

export const SEKTOR_KELISTRIKAN = buatSektor(
  "kelistrikan",
  "Kelistrikan",
  "produksi",
  [
    ...KELISTRIKAN_TANPA_BAHAN_BAKAR,
    ...KELISTRIKAN_BERBAHAN_BAKAR,
    "pembangkit_listrik_tenaga_hidrogen",
    "pembangkit_listrik_tenaga_gelombang_laut",
    "pembangkit_listrik_tenaga_fusi_nuklir",
  ],
  req,
);
