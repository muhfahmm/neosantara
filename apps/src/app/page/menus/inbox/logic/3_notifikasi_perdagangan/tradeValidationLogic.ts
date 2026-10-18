/**
 * tradeValidationLogic.ts
 * Logika validasi untuk penawaran perdagangan
 * - Check apakah negara memiliki sistem ekonomi yang cukup terbuka
 * - Tentukan reason penolakan jika ada
 */

/**
 * CEK APAKAH NEGARA DAPAT MELAKUKAN PERDAGANGAN GLOBAL
 * Kriteria:
 * - sistem_ekonomi_val >= 60 (Ekonomi Campuran atau lebih terbuka)
 * - Atau: rata-rata sentralisasi ekonomi < 85
 */
export function canAcceptTradeDeal(countryDetail: any): {
  isAllowed: boolean;
  reason?: 'closed_system' | 'high_centralization';
  ekonomiNegara?: string;
} {
  if (!countryDetail) {
    return { isAllowed: false, reason: 'closed_system' };
  }

  // Check nilai sistem ekonomi (0-100, di atas 60 = terbuka)
  const ekonomiVal = Number(countryDetail.sistem_ekonomi_val ?? 50);
  const ekonomiName = countryDetail.sistem_ekonomi_name || 'Ekonomi Campuran';

  // Jika ekonomi terpusat penuh (< 60), tolak perdagangan
  if (ekonomiVal < 60) {
    return {
      isAllowed: false,
      reason: 'closed_system',
      ekonomiNegara: ekonomiName,
    };
  }

  // Check rata-rata sentralisasi sektor
  const sectorCentralization = getSectorCentralizationAverage(countryDetail);
  if (sectorCentralization > 85) {
    return {
      isAllowed: false,
      reason: 'high_centralization',
      ekonomiNegara: ekonomiName,
    };
  }

  // Ekonomi cukup terbuka untuk perdagangan
  return {
    isAllowed: true,
    ekonomiNegara: ekonomiName,
  };
}

/**
 * HITUNG RATA-RATA SENTRALISASI SEKTOR EKONOMI
 * Dari sector_nationalization atau policy_* fields
 */
export function getSectorCentralizationAverage(countryDetail: any): number {
  if (!countryDetail) return 50;

  // Cek field sector_nationalization (jika ada)
  const sectorNat = countryDetail.sector_nationalization;
  if (sectorNat && typeof sectorNat === 'object') {
    const values = Object.values(sectorNat).filter(
      (v) => typeof v === 'number'
    ) as number[];
    if (values.length > 0) {
      return values.reduce((a, b) => a + b, 0) / values.length;
    }
  }

  // Fallback: hitung dari policy_* fields (A=Terpusat/100, B=Pasar/0)
  const policyFields = [
    'policy_price_control',
    'policy_strategic_ownership',
    'policy_trade_policy',
    'policy_labor_regulation',
    'policy_land_property_rights',
    'policy_labor_unions_rights',
    'policy_monetary_banking',
  ];

  let totalCentralization = 0;
  let count = 0;

  for (const field of policyFields) {
    const value = countryDetail[field];
    if (value === 'A') {
      totalCentralization += 100;
      count++;
    } else if (value === 'B') {
      totalCentralization += 0;
      count++;
    }
  }

  if (count === 0) return 50; // Default jika tidak ada data

  return totalCentralization / count;
}

/**
 * GET DESKRIPSI PENOLAKAN BERDASARKAN REASON
 */
export function getTradeRejectionDescription(
  reason: 'closed_system' | 'high_centralization',
  ekonomiName: string
): {
  title: string;
  mainMessage: string;
  reasons: string[];
  solutions: string[];
} {
  if (reason === 'closed_system') {
    return {
      title: 'SISTEM EKONOMI TERTUTUP',
      mainMessage: `Negara Anda menganut sistem ekonomi "${ekonomiName}" yang terlalu terpusat untuk melakukan perdagangan global.`,
      reasons: [
        'Sistem ekonomi terlalu terpusat (nilai < 60)',
        'Kontrol pemerintah atas sektor ekonomi terlalu kuat',
        'Kebijakan proteksionisme mencegah akses pasar internasional',
      ],
      solutions: [
        'Ubah sistem ekonomi ke Ekonomi Campuran atau lebih terbuka',
        'Kurangi sentralisasi dengan privatisasi beberapa sektor strategis',
        'Terapkan kebijakan Free Trade untuk membuka pasar internasional',
      ],
    };
  }

  // high_centralization
  return {
    title: 'SENTRALISASI EKONOMI TERLALU TINGGI',
    mainMessage: `Meski sistem ekonomi adalah "${ekonomiName}", rata-rata sentralisasi sektor masih terlalu tinggi (> 85) untuk perdagangan global.`,
    reasons: [
      'Sentralisasi sektor ekonomi melebihi ambang batas (85)',
      'Terlalu banyak sektor dikontrol langsung oleh pemerintah',
      'Kebijakan ekonomi masih dominan ke arah terpusat',
    ],
    solutions: [
      'Kurangi sentralisasi di sektor: manufaktur, perdagangan, perbankan',
      'Buka kepemilikan properti untuk investasi swasta',
      'Liberalisasi kebijakan moneter dan perbankan',
    ],
  };
}
