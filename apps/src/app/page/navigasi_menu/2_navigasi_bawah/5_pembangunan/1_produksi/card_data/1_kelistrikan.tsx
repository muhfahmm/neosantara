"use client"
import { Zap } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";

const KEYS = [
  "pembangkit_listrik_tenaga_nuklir",
  "pembangkit_listrik_tenaga_air",
  "pembangkit_listrik_tenaga_surya",
  "pembangkit_listrik_tenaga_uap",
  "pembangkit_listrik_tenaga_gas",
  "pembangkit_listrik_tenaga_angin",
  "pembangkit_listrik_tenaga_panas_bumi",
  "pembangkit_listrik_tenaga_hidrogen",
  "pembangkit_listrik_tenaga_gelombang_laut",
  "pembangkit_listrik_tenaga_fusi_nuklir",
];

export default function KelistrikanTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Kelistrikan" Icon={Zap} isElectricityTab={true} />;
}
