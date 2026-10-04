export interface AnnexationNewsData {
  id: string;
  type: 'aneksasi';
  attackerCountry: string;
  attackerIso: string;
  attackerColor: string;
  targetCountry: string;
  targetIso: string;
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
}

export interface MapStateUpdatePayload {
  targetCountry: string;
  newColor: string;
  attackerCountry: string;
}

/**
 * Memproses hasil perang berupa pencaplokan wilayah (aneksasi) penuh.
 * Menghasilkan teks berita dan payload untuk memperbarui warna wilayah target pada peta.
 */
export function generateAnnexationNews(
  attackerCountry: string,
  attackerIso: string,
  attackerColor: string,
  targetCountry: string,
  targetIso: string,
  dateStr: string
): { news: AnnexationNewsData; mapPayload: MapStateUpdatePayload } {
  const timestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const headline = `🚩 ANEKSASI WILAYAH: ${targetCountry} Sepenuhnya Jatuh ke Tangan ${attackerCountry}!`;
  const content = `Kemenangan mutlak! Pertahanan ${targetCountry} telah runtuh total. Militer ${attackerCountry} mengumumkan penguasaan penuh atas seluruh kedaulatan wilayah ${targetCountry}. Peta politik dunia resmi berubah seiring terintegrasinya wilayah target ke dalam kekuasaan ${attackerCountry}!

⚠️ Peta Diperbarui: Warna wilayah ${targetCountry} telah disesuaikan dengan warna ${attackerCountry}! Refresh halaman untuk melihat perubahan visual di peta.`;

  const news: AnnexationNewsData = {
    id: `news-aneksasi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: 'aneksasi',
    attackerCountry,
    attackerIso,
    attackerColor,
    targetCountry,
    targetIso,
    headline,
    content,
    timestamp,
    dateStr
  };

  const mapPayload: MapStateUpdatePayload = {
    targetCountry,
    newColor: attackerColor,
    attackerCountry
  };

  return { news, mapPayload };
}

/**
 * Logika pembaruan state pada sistem peta (map).
 * Mengubah warna wilayah negara target secara otomatis agar sama persis dengan warna negara penyerang.
 */
export function updateMapTerritoryColor(
  currentMapState: Record<string, string>,
  payload: MapStateUpdatePayload
): Record<string, string> {
  const updatedMapState = { ...currentMapState };
  updatedMapState[payload.targetCountry] = payload.newColor;

  if (typeof window !== 'undefined') {
    const existing = (window as any).neosantara_country_color_overrides || {};
    const updated = {
      ...existing,
      [payload.targetCountry]: payload.newColor,
      [payload.targetCountry.toLowerCase()]: payload.newColor
    };
    (window as any).neosantara_country_color_overrides = updated;
    try {
      localStorage.setItem('neosantara_country_color_overrides', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to sync country color overrides to localStorage:', e);
    }

    const existingAnnexed = (window as any).neosantara_annexed_countries || {};
    const updatedAnnexed = {
      ...existingAnnexed,
      [payload.targetCountry]: { attackerCountry: payload.attackerCountry },
      [payload.targetCountry.toLowerCase()]: { attackerCountry: payload.attackerCountry }
    };
    (window as any).neosantara_annexed_countries = updatedAnnexed;

    window.dispatchEvent(
      new CustomEvent('map_territory_color_updated', {
        detail: payload
      })
    );
  }

  return updatedMapState;
}
