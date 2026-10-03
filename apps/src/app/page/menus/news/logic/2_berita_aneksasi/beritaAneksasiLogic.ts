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
  const content = `Kemenangan mutlak! Pertahanan ${targetCountry} telah runtuh total. Militer ${attackerCountry} mengumumkan penguasaan penuh atas seluruh kedaulatan wilayah ${targetCountry}. Peta politik dunia resmi berubah seiring terintegrasinya wilayah target ke dalam kekuasaan ${attackerCountry}!`;

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

  // Sync ke window event jika menggunakan custom event listener pada Map Engine
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('map_territory_color_updated', {
        detail: payload
      })
    );
  }

  return updatedMapState;
}
