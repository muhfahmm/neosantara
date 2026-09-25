// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\2_energi\EnergiTab.tsx
"use client";

import React from "react";
import { SubsidyItem } from "../../logic/logikaSubsidi";
import SubsidyCardGrid from "../common/SubsidyCardGrid";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
  onOpenDetail?: (item: SubsidyItem) => void;
}

export default function EnergiTab({ items, toggleSubsidy, onOpenDetail }: Props) {
  const filtered = items.filter((i) => i.category === "Energi");
  return <SubsidyCardGrid items={filtered} toggleSubsidy={toggleSubsidy} onOpenDetail={onOpenDetail} />;
}
