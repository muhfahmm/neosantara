import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/5_olahraga_hiburan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const TARGET_RASIO_OLAHRAGA_HIBURAN = 0.00008;

export const SEKTOR_OLAHRAGA_HIBURAN = buatSektor(
  "olahraga_hiburan",
  "Olahraga & Hiburan",
  "layanan",
  ["kolam_renang", "sirkuit_balap", "stadion", "stadion_internasional", "gym", "golf", "esports", "gokart", "bioskop", "teater"],
  req,
);
