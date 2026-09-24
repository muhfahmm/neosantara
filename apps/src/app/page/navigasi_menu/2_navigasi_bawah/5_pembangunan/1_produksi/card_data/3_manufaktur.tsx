"use client"
import { Factory } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";

const KEYS = ["pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu"];

export default function ManufakturTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Manufaktur" Icon={Factory} isElectricityTab={false} />;
}
