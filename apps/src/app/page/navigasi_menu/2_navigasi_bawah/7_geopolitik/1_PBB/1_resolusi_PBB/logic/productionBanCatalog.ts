export interface ProductionBanProduct {
  key: string;
  category: string;
}

export const PRODUCTION_BAN_CATEGORIES = [
  {
    id: "mineral",
    label: "Mineral & Energi",
    products: [
      "uranium", "batu_bara", "minyak_bumi", "gas_alam", "garam",
      "litium", "logam_tanah_jarang", "bijih_besi",
    ],
  },
  {
    id: "manufaktur",
    label: "Manufaktur",
    products: ["pabrik_semikonduktor", "pabrik_mesin_mobil", "pabrik_mesin_motor", "semen_beton", "kayu"],
  },
  {
    id: "peternakan",
    label: "Peternakan",
    products: ["ayam_unggas", "sapi_perah", "sapi_potong", "domba_kambing"],
  },
  {
    id: "agrikultur",
    label: "Agrikultur",
    products: [
      "padi", "gandum", "jagung", "sayur", "umbi", "kedelai", "kelapa_sawit",
      "kopi", "teh", "kakao", "tebu", "karet",
    ],
  },
  {
    id: "perikanan",
    label: "Perikanan",
    products: ["udang", "mutiara", "ikan"],
  },
  {
    id: "olahan pangan",
    label: "Olahan Pangan",
    products: ["air_mineral", "gula", "roti", "pengolahan_daging", "mie_instan", "minyak_goreng", "susu", "beras"],
  },
] as const;

export const PRODUCTION_BAN_PRODUCTS: ProductionBanProduct[] = PRODUCTION_BAN_CATEGORIES.flatMap(category =>
  category.products.map(key => ({ key, category: category.label }))
);

export function formatProductionProductName(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, character => character.toUpperCase());
}

export function getProductionBanProduct(key: string): ProductionBanProduct | undefined {
  return PRODUCTION_BAN_PRODUCTS.find(product => product.key === key);
}
