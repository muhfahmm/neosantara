import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/6_perikanan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_PERIKANAN = buatSektor(
  "perikanan",
  "Perikanan",
  "produksi",
  ["ikan", "udang", "mutiara"],
  req,
);
