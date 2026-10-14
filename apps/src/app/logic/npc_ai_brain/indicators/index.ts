/**
 * index.ts — Registri 9 indikator otak AI.
 */
import type { IndikatorId } from "../types/alertTypes";
import type { IndikatorOtak } from "../core/brainContext";

import { OTAK_PAJAK } from "./1_pajak";
import { OTAK_HARGA } from "./2_harga";
import { OTAK_PANGAN } from "./3_pangan";
import { OTAK_LISTRIK } from "./4_listrik";
import { OTAK_HUNIAN } from "./5_hunian";
import { OTAK_LAYANAN_PUBLIK } from "./6_layanan_publik";
import { OTAK_KETERBUKAAN } from "./7_keterbukaan";
import { OTAK_SISTEM_EKONOMI } from "./8_sistem_ekonomi";
import { OTAK_SUBSIDI } from "./9_subsidi";

export const SEMUA_OTAK_INDIKATOR: IndikatorOtak[] = [
  OTAK_PAJAK,
  OTAK_HARGA,
  OTAK_PANGAN,
  OTAK_LISTRIK,
  OTAK_HUNIAN,
  OTAK_LAYANAN_PUBLIK,
  OTAK_KETERBUKAAN,
  OTAK_SISTEM_EKONOMI,
  OTAK_SUBSIDI,
];

export const MAP_OTAK_INDIKATOR: Record<IndikatorId, IndikatorOtak> = {
  pajak: OTAK_PAJAK,
  harga: OTAK_HARGA,
  pangan: OTAK_PANGAN,
  listrik: OTAK_LISTRIK,
  hunian: OTAK_HUNIAN,
  layananPublik: OTAK_LAYANAN_PUBLIK,
  keterbukaan: OTAK_KETERBUKAAN,
  sistemEkonomi: OTAK_SISTEM_EKONOMI,
  subsidi: OTAK_SUBSIDI,
};
