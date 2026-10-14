import * as req from "@/app/page/navigasi_menu/2_navigasi_bawah/5_pembangunan/2_tempat_umum/construction_support/2_pendidikan/requirements";
import { buatSektor } from "../../../core/sectorBuilder";

export const TARGET_RASIO_PENDIDIKAN = 0.0001;

export const SEKTOR_PENDIDIKAN = buatSektor(
  "pendidikan",
  "Pendidikan",
  "layanan",
  ["prasekolah", "dasar", "menengah", "lanjutan", "universitas", "lembaga_pendidikan", "laboratorium", "observatorium", "pusat_penelitian", "pusat_pengembangan"],
  req,
);
