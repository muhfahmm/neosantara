// Path: d:\project-sendiri\em\apps\src\app\page\navigasi_menu\2_navigasi_bawah\4_ekonomi\8_kebijakan_subsidi\tab_menu\3_pangan\PanganTab.tsx
"use client";

import React from "react";
import { SubsidyItem } from "../../logic/logikaSubsidi";
import SubsidyCardGrid from "../common/SubsidyCardGrid";

interface Props {
  items: SubsidyItem[];
  toggleSubsidy: (id: string) => void;
  onOpenDetail?: (item: SubsidyItem) => void;
}

export default function PanganTab({ items, toggleSubsidy, onOpenDetail }: Props) {
  const filtered = items.filter((i) => i.category === "Pangan");
  return <SubsidyCardGrid items={filtered} toggleSubsidy={toggleSubsidy} onOpenDetail={onOpenDetail} />;
}
