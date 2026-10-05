"use client"
import { Beef } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[2].products];

export default function PeternakanTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Peternakan" Icon={Beef} isElectricityTab={false} />;
}
