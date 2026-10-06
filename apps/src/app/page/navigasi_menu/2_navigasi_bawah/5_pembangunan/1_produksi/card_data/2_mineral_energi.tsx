"use client"
import { Gem } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = ["emas", ...PRODUCTION_BAN_CATEGORIES[0].products];

export default function MineralEnergiTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Mineral & Energi" Icon={Gem} isElectricityTab={false} />;
}
