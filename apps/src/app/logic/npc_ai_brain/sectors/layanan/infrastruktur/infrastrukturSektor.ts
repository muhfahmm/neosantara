import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/1_infrastruktur/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

/** Target rasio fasilitas per penduduk — sama dengan skor Layanan Publik di kepuasanCalculator. */
export const TARGET_RASIO_INFRASTRUKTUR = 0.00005;

export const SEKTOR_INFRASTRUKTUR = buatSektor(
  "infrastruktur",
  "Infrastruktur",
  "layanan",
  ["jalur_sepeda", "jalan_raya", "terminal_bus", "stasiun_kereta_api", "kereta_bawah_tanah", "pelabuhan", "bandara", "helipad"],
  req,
);
