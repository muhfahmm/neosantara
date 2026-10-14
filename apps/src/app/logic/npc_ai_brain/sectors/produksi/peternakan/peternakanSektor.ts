import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/4_peternakan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_PETERNAKAN = buatSektor(
  "peternakan",
  "Peternakan",
  "produksi",
  ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  req,
);
