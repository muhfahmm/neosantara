"use client"
import { Utensils } from "lucide-react";
import BaseProduksiGrid from "../BaseProduksiGrid";
import { PRODUCTION_BAN_CATEGORIES } from "../../../7_geopolitik/1_PBB/1_resolusi_PBB/logic/productionBanCatalog";

const KEYS = [...PRODUCTION_BAN_CATEGORIES[5].products];

export default function OlahanPanganTab(props: any) {
  return <BaseProduksiGrid {...props} keys={KEYS} title="Olahan Pangan" Icon={Utensils} isElectricityTab={false} />;
}
