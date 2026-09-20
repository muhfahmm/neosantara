// Compatibility module for Database Mitra Perdagangan

export interface TradeAgreement {
  no: number;
  mitra: string;
  type: string;
  status: string;
}

export function getTradeAgreementsForCountry(countryName?: string): TradeAgreement[] {
  return [
    { no: 1, mitra: "Indonesia", type: "Perdagangan", status: "Aktif" },
    { no: 2, mitra: "Singapura", type: "Perdagangan", status: "Aktif" },
    { no: 3, mitra: "Malaysia", type: "Perdagangan", status: "Aktif" }
  ];
}

export default getTradeAgreementsForCountry;
