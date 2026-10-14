import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/3_manufaktur/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_MANUFAKTUR = buatSektor(
  "manufaktur",
  "Manufaktur",
  "produksi",
  ["pabrik_semikonduktor", "pabrik_mesin", "pabrik_besi", "semen_beton", "kayu"],
  req,
);
