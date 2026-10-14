import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/7_olahan_pangan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_OLAHAN_PANGAN = buatSektor(
  "olahan_pangan",
  "Olahan Pangan",
  "produksi",
  ["beras", "gula", "roti", "mie_instan", "minyak_goreng", "susu", "pengolahan_daging", "air_mineral"],
  req,
);
