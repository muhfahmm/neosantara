import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/1_produksi/5_agrikultur/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const SEKTOR_AGRIKULTUR = buatSektor(
  "agrikultur",
  "Agrikultur",
  "produksi",
  ["padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit", "kopi", "teh", "kakao", "tebu", "karet"],
  req,
);
