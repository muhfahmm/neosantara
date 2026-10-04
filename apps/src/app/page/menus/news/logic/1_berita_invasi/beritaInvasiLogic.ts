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

  const continent = country?.continent;
  switch (continent) {
    case 'Asia': return '#a855f7';
    case 'Africa': return '#eab308';
    case 'Europe': return '#3b82f6';
    case 'North America': return '#22c55e';
    case 'South America': return '#f97316';
    case 'Oceania': return '#ec4899';
    case 'Antarctica': return '#cbd5e1';
    default: break;
  }

  // Fallback map if country name is formatted differently
  if (['rusia', 'russia'].includes(normalizedName)) return '#3b82f6'; // Europe
  if (['china', 'tiongkok'].includes(normalizedName)) return '#a855f7'; // Asia

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

// Daftar wilayah teritorial kecil / pulau dependen tanpa kekuatan militer mandiri (Non-Aggressors / Wilayah Tanpa Militer)
const NON_AGGRESSORS = new Set([
  'guadeloupe', 'martinique', 'mayotte', 'reunion', 'bonaire, sint eustatius dan saba',
  'curacao', 'bermuda', 'gibraltar', 'greenland', 'grenada', 'guam', 'samoa amerika',
  'puerto rico', 'tahiti', 'kepulauan faroe', 'san marino', 'vatikan', 'liechtenstein',
  'monako', 'andorra', 'samoa', 'marshall', 'nauru', 'palau', 'tuvalu', 'kiribati',
  'mikronesia', 'tonga', 'vanuatu', 'semenanjung gaza', 'sao tome dan principe',
  'antigua dan barbuda', 'saint kitts dan nevis', 'saint lucia', 'saint vincent dan grenadine'
]);

/**
 * Memeriksa apakah suatu negara memiliki kapasitas militer yang cukup untuk menjadi penyerang.
 * Syarat: Bukan wilayah teritorial kecil tanpa militer mandiri (Non-Aggressors).
 */
export function isMilitaryStrong(countryObj: typeof COUNTRIES_DATA[0]): boolean {
  const norm = countryObj.country.toLowerCase().trim();
  return !NON_AGGRESSORS.has(norm);
}

/**
 * Logika evaluasi persentase kemunculan invasi:
 * Menyeleksi negara-negara acak berdaulat yang memiliki militer kuat dan tingkat hubungan sangat panas (skor 1 - 20).
 * Membangkitkan 1 hingga 2 kejadian invasi acak secara murni dari data negara simulasi.
 */
export function evaluateAnnualHotRelationsInvasion(
  dateStr: string,
  userCountryName?: string
): InvasionNewsData[] {
  const playerCountry = (userCountryName || 'Indonesia').toLowerCase().trim();

  // Filter negara valid yang bukan player
  const validCountries = COUNTRIES_DATA.filter(
    c => c.country.toLowerCase().trim() !== playerCountry
  );

  if (validCountries.length < 2) return [];

  // Filter kandidat penyerang yang memiliki militer kuat
  const strongAttackers = validCountries.filter(c => isMilitaryStrong(c));

  if (strongAttackers.length === 0) return [];

  // Cari pasangan negara dengan tingkat hubungan panas (skor 1 - 20)
  const hotPairs: { attacker: string; target: string; score: number }[] = [];

  for (let i = 0; i < validCountries.length; i++) {
    for (let j = i + 1; j < validCountries.length; j++) {
      const c1 = validCountries[i];
      const c2 = validCountries[j];

      const relVal = getRelationValue(c1.country, c2.country);

      if (relVal >= 1 && relVal <= 20) {
        const c1Strong = isMilitaryStrong(c1);
        const c2Strong = isMilitaryStrong(c2);

        if (!c1Strong && !c2Strong) continue; // Dua negara tanpa militer tidak bisa saling serang

        let attacker: string;
        let target: string;

        if (c1Strong && !c2Strong) {
          attacker = c1.country;
          target = c2.country;
        } else if (!c1Strong && c2Strong) {
          attacker = c2.country;
          target = c1.country;
        } else {
          // Dua-duanya militer kuat, pilih acak salah satu sebagai penyerang
          [attacker, target] = Math.random() > 0.5 ? [c1.country, c2.country] : [c2.country, c1.country];
        }

        hotPairs.push({ attacker, target, score: relVal });
      }
    }
  }

  // Jika belum ada pasangan ber-skor 1-20 di DB, pilih secara acak dari semua penyerang militer kuat
  if (hotPairs.length === 0) {
    const shuffledAttackers = [...strongAttackers].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(3, shuffledAttackers.length); i++) {
      const attackerObj = shuffledAttackers[i];
      const attacker = attackerObj.country;

      // Target diutamakan dari benua yang sama (atau target mana pun di dunia kecuali penyerang sendiri)
      const sameContinentTargets = validCountries.filter(c =>
        c.country.toLowerCase().trim() !== attacker.toLowerCase().trim() &&
        c.continent === attackerObj.continent
      );

      const targetPool = (sameContinentTargets.length > 0 && Math.random() < 0.7)
        ? sameContinentTargets
        : validCountries.filter(c => c.country.toLowerCase().trim() !== attacker.toLowerCase().trim());

      if (targetPool.length > 0) {
        const randomTarget = targetPool[Math.floor(Math.random() * targetPool.length)].country;
        hotPairs.push({
          attacker,
          target: randomTarget,
          score: Math.floor(Math.random() * 20) + 1 // Skor hubungan panas (1-20)
        });
      }
    }
  }

  // Acak urutan pasangan
  const shuffledPairs = [...hotPairs].sort(() => Math.random() - 0.5);

  // Hasilkan 1 hingga 2 kali invasi acak per trigger
  const invasionCount = Math.min(Math.floor(Math.random() * 2) + 1, shuffledPairs.length);

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
