import { COUNTRIES_DATA } from '@/app/page/map_system/map-data';
import { getRelationValue } from '@/../../json/database_hubungan_antar_negara/relationsRegistry';
import { getIsoForCountryName } from '@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/1_PBB/pbbCountryIso';

/**
 * Mendapatkan warna negara dari COUNTRIES_DATA berdasarkan nama negara.
 * Warna ini akan digunakan untuk mengubah warna wilayah yang dianeksasi.
 */
export function getCountryColor(countryName: string): string {
  const normalizedName = countryName.toLowerCase().trim();
  const country = COUNTRIES_DATA.find(
    c => c.country.toLowerCase().trim() === normalizedName
  );

  // Warna harus sama dengan warna benua negara penyerang (palet sama dengan map engine)
  switch (country?.continent) {
    case 'Asia': return '#a855f7';
    case 'Africa': return '#eab308';
    case 'Europe': return '#3b82f6';
    case 'North America': return '#22c55e';
    case 'South America': return '#f97316';
    case 'Oceania': return '#ec4899';
    case 'Antarctica': return '#cbd5e1';
    default: break;
  }

  console.warn(`Continent color not found for country: ${countryName}, using default`);
  return '#475569';
}

export interface InvasionNewsData {
  id: string;
  type: 'invasi';
  attackerCountry: string;
  attackerIso: string;
  targetCountry: string;
  targetIso: string;
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

/**
 * Menghasilkan data berita ketika sebuah negara NPC mendeklarasikan invasi terhadap negara NPC lainnya.
 */
export function generateInvasionNews(
  attackerCountry: string,
  attackerIso: string,
  targetCountry: string,
  targetIso: string,
  dateStr: string
): InvasionNewsData {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const headline = `⚔️ DEKLARASI PERANG: ${attackerCountry} Menginvasi ${targetCountry}!`;
  const content = `Ketegangan militer mencapai puncaknya! Angkatan Bersenjata ${attackerCountry} secara resmi menerobos perbatasan dan melancarkan invasi militer berskala besar terhadap ${targetCountry}. Pasukan garda depan saat ini sedang melakukan pertempuran sengit di berbagai wilayah perbatasan!`;

  return {
    id: `news-invasi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'invasi',
    attackerCountry,
    attackerIso,
    targetCountry,
    targetIso,
    headline,
    content,
    timestamp,
    dateStr
  };
}

/**
 * Logika evaluasi persentase kemunculan invasi:
 * Menyeleksi negara-negara acak yang memiliki tingkat hubungan sangat panas (skor 1 - 20).
 * Membangkitkan 1 hingga 3 kejadian invasi acak secara murni dari data negara simulasi.
 */
export function evaluateAnnualHotRelationsInvasion(
  dateStr: string,
  userCountryName?: string
): InvasionNewsData[] {
  const playerCountry = (userCountryName || 'Indonesia').toLowerCase().trim();
  const validCountries = COUNTRIES_DATA
    .filter(c => c.country.toLowerCase().trim() !== playerCountry)
    .map(c => c.country);

  if (validCountries.length < 2) return [];

  // Cari pasangan negara dengan tingkat hubungan panas (skor 1 - 20)
  const hotPairs: { attacker: string; target: string; score: number }[] = [];

  for (let i = 0; i < validCountries.length; i++) {
    for (let j = i + 1; j < validCountries.length; j++) {
      const c1 = validCountries[i];
      const c2 = validCountries[j];
      const relVal = getRelationValue(c1, c2);

      if (relVal >= 1 && relVal <= 20) {
        const [attacker, target] = Math.random() > 0.5 ? [c1, c2] : [c2, c1];
        hotPairs.push({ attacker, target, score: relVal });
      }
    }
  }

  // Jika belum ada pasangan ber-skor 1-20 di DB, pilih pasangan acak dinamis dari COUNTRIES_DATA
  if (hotPairs.length === 0) {
    const shuffled = [...validCountries].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(4, Math.floor(shuffled.length / 2)); i++) {
      hotPairs.push({
        attacker: shuffled[i * 2],
        target: shuffled[i * 2 + 1],
        score: Math.floor(Math.random() * 20) + 1
      });
    }
  }

  // Acak urutan pasangan
  const shuffledPairs = [...hotPairs].sort(() => Math.random() - 0.5);

  // Hasilkan 1 hingga 3 kali invasi acak per trigger
  const invasionCount = Math.min(Math.floor(Math.random() * 3) + 1, shuffledPairs.length);

  const newInvasions: InvasionNewsData[] = [];

  for (let k = 0; k < invasionCount; k++) {
    const pair = shuffledPairs[k];
    const attackerIso = getIsoForCountryName(pair.attacker) || 'un';
    const targetIso = getIsoForCountryName(pair.target) || 'un';

    const news = generateInvasionNews(
      pair.attacker,
      attackerIso,
      pair.target,
      targetIso,
      dateStr
    );
    newInvasions.push(news);
  }

  return newInvasions;
}
