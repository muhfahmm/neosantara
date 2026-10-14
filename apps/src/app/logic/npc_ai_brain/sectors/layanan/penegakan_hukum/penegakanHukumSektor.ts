import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/4_penegakan_hukum/requirements";
import { PENEGAKAN_HUKUM_KEYS, PENEGAKAN_HUKUM_TARGET_RATIO } from "@/app/logic/kepuasanCalculator";
import { buatSektor } from "../../../core/sectorBuilder";

export const TARGET_RASIO_PENEGAKAN_HUKUM = PENEGAKAN_HUKUM_TARGET_RATIO;

export const SEKTOR_PENEGAKAN_HUKUM = buatSektor(
  "penegakan_hukum",
  "Penegakan Hukum",
  "layanan",
  PENEGAKAN_HUKUM_KEYS,
  req,
);
