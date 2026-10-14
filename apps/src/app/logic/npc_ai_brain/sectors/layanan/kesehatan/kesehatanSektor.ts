import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/3_kesehatan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const TARGET_RASIO_KESEHATAN = 0.00004;

export const SEKTOR_KESEHATAN = buatSektor(
  "kesehatan",
  "Kesehatan",
  "layanan",
  ["rumah_sakit_besar", "rumah_sakit_kecil", "pusat_diagnostik"],
  req,
);
