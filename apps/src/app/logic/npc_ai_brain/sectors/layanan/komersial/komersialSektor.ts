import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/6_komersial/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const TARGET_RASIO_KOMERSIAL = 0.00002;

export const SEKTOR_KOMERSIAL = buatSektor(
  "komersial",
  "Komersial",
  "layanan",
  ["mall", "hotel", "pusat_grosir_tekstil"],
  req,
);
