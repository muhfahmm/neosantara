import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/2_mineral_kritis/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_MINERAL_ENERGI = buatSektor(
  "mineral_energi",
  "Mineral & Energi",
  "produksi",
  ["emas", "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam", "litium", "logam_tanah_jarang", "bijih_besi"],
  req,
);
