"use client"
import { Utensils } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";

const KEYS = ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"];

export default function OlahanPanganTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Olahan Pangan" Icon={Utensils} isElectricityTab={false} />;
}
