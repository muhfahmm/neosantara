/**
 * aiNewsBridge.ts
 *
 * Mengonversi setiap aksi, pembangunan, dan perubahan kebijakan yang dilakukan AI
 * menjadi berita resmi yang masuk ke sistem "Berita & Update Geopolitik".
 */

export interface AiNewsItem {
  id: string;
  type:
    | "pembangunan_sipil"
    | "ekspansi_militer"
    | "pengadaan_armada"
    | "kebijakan_negara"
    | "update_geopolitik";
  category: "diplomasi" | "ekonomi_keuangan" | "pencapaian_militer" | "operasi_militer";
  headline: string;
  content: string;
  timestamp: string;
  dateStr: string;
  countryName?: string;
  countrySlug?: string;
  buildingKey?: string;
  indicatorKey?: string;
  targetTab?: string;
  countFrom?: number;
  countTo?: number;
  completionDate?: string;
  constructionSection?: "sipil" | "militer";
}

export const AI_NEWS_UPDATED_EVENT = "neosantara:ai-news-updated";

const AI_NEWS_STORAGE_KEY = "neosantara_world_news_list";
const pendingAiNews: AiNewsItem[] = [];
const pendingAiNewsIds = new Set<string>();

const LABEL_MENU_INDIKATOR: Record<string, string> = {
  pajak: "Pajak",
  harga: "Harga Barang Pokok",
  pangan: "Produksi Pangan",
  listrik: "Statistik Kelistrikan",
  hunian: "Hunian Permukiman",
  layananPublik: "Fasilitas & Militer",
  keterbukaan: "Doktrin & Keterbukaan",
  sistemEkonomi: "Kebijakan & Sistem Ekonomi",
  subsidi: "Subsidi",
};

/**
 * Menerbitkan berita ke antrian global / window event agar otomatis muncul di menu Berita.
 * Perubahan kebijakan dan pembangunan AI tetap dieksekusi, tetapi tidak dipublikasikan sebagai berita.
 * Tidak menerbitkan notifikasi bila game sedang di-pause.
 */
export function terbitkanBeritaAI(news: AiNewsItem): void {
  if (
    news.type === "kebijakan_negara" ||
    news.type === "pembangunan_sipil" ||
    news.type === "ekspansi_militer" ||
    news.type === "pengadaan_armada"
  ) {
    return;
  }

  if (typeof window !== "undefined") {
    if (pendingAiNewsIds.has(news.id)) return;

    pendingAiNews.unshift(news);
    pendingAiNewsIds.add(news.id);

    // Broadcast custom event.
    window.dispatchEvent(
      new CustomEvent(AI_NEWS_UPDATED_EVENT, {
        detail: news,
      }),
    );
  }
}

export function takePendingAiNews(): AiNewsItem[] {
  const pending = pendingAiNews.splice(0, pendingAiNews.length);
  pendingAiNewsIds.clear();
  return pending;
}

export function acknowledgeAiNews(newsId: string): void {
  const pendingIndex = pendingAiNews.findIndex((news) => news.id === newsId);
  if (pendingIndex !== -1) {
    pendingAiNews.splice(pendingIndex, 1);
  }
  pendingAiNewsIds.delete(newsId);
}

export function clearPendingAiNews(): void {
  pendingAiNews.length = 0;
  pendingAiNewsIds.clear();
}

export function clearStoredAiNews(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(AI_NEWS_STORAGE_KEY);
  } catch (err) {
    console.warn("[AI News] Gagal menghapus daftar berita tersimpan:", err);
  }
}

/**
 * Generator berita untuk pembangunan fasilitas sipil AI.
 */
export function buatBeritaPembangunanSipil(
  negaraNama: string,
  buildingKey: string,
  sektorId: string,
  jumlah: number,
  dateStr: string,
  countFrom = 0,
  completionDate = dateStr,
  countrySlug?: string,
): AiNewsItem {
  const formatName = buildingKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatSektor = sektorId
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `news-build-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "pembangunan_sipil",
    category: "ekonomi_keuangan",
    headline: `Pembangunan Fasilitas Baru di ${negaraNama}`,
    content: `Pemerintah ${negaraNama} memulai pembangunan ${formatName} di sektor ${formatSektor}, dari ${countFrom.toLocaleString("id-ID")} menjadi ${(countFrom + jumlah).toLocaleString("id-ID")} unit. Pembangunan diperkirakan selesai pada ${completionDate}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    buildingKey,
    countFrom,
    countTo: countFrom + jumlah,
    completionDate,
    constructionSection: "sipil",
  };
}

/**
 * Generator berita untuk ekspansi infrastruktur militer AI.
 */
export function buatBeritaEkspansiMiliter(
  negaraNama: string,
  infraKey: string,
  jumlah: number,
  dateStr: string,
  countFrom = 0,
  completionDate = dateStr,
  countrySlug?: string,
): AiNewsItem {
  const formatName = infraKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    id: `news-mil-infra-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "ekspansi_militer",
    category: "pencapaian_militer",
    headline: `Penguatan Pertahanan Nasional ${negaraNama}`,
    content: `Kementerian Pertahanan ${negaraNama} memulai pembangunan ${formatName}, dari ${countFrom.toLocaleString("id-ID")} menjadi ${(countFrom + jumlah).toLocaleString("id-ID")} unit. Pembangunan diperkirakan selesai pada ${completionDate}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    buildingKey: infraKey,
    countFrom,
    countTo: countFrom + jumlah,
    completionDate,
    constructionSection: "militer",
  };
}

/**
 * Generator berita untuk pengadaan/produksi unit militer AI.
 */
export function buatBeritaRekrutmenMiliter(
  negaraNama: string,
  unitKey: string,
  jumlah: number,
  category: "darat" | "laut" | "udara",
  dateStr: string,
  countFrom = 0,
  completionDate = dateStr,
  countrySlug?: string,
): AiNewsItem {
  const formatUnit = unitKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatMatra = category.toUpperCase();

  return {
    id: `news-mil-unit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "pengadaan_armada",
    category: "pencapaian_militer",
    headline: `Peningkatan Kekuatan Armada ${formatMatra} ${negaraNama}`,
    content: `Angkatan Bersenjata ${negaraNama} memulai pembuatan ${formatUnit} matra ${formatMatra}, dari ${countFrom.toLocaleString("id-ID")} menjadi ${(countFrom + jumlah).toLocaleString("id-ID")} unit. Pembuatan diperkirakan selesai pada ${completionDate}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    buildingKey: unitKey,
    countFrom,
    countTo: countFrom + jumlah,
    completionDate,
    constructionSection: "militer",
  };
}

export function buatBeritaPembangunanIndikatorAI(
  negaraNama: string,
  buildingKey: string,
  jumlah: number,
  dateStr: string,
  completionDate: string,
  countFrom: number,
  countrySlug?: string,
): AiNewsItem {
  const formatName = buildingKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: `news-ai-build-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    type: "pembangunan_sipil",
    category: "ekonomi_keuangan",
    headline: `Pembangunan Fasilitas Baru di ${negaraNama}`,
    content: `Pemerintah ${negaraNama} memulai pembangunan ${formatName}, dari ${countFrom.toLocaleString("id-ID")} menjadi ${(countFrom + jumlah).toLocaleString("id-ID")} unit. Pembangunan diperkirakan selesai pada ${completionDate}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    buildingKey,
    countFrom,
    countTo: countFrom + jumlah,
    completionDate,
    constructionSection: "sipil",
  };
}

/**
 * Generator berita untuk perubahan kebijakan ekonomi / indikator AI (pajak, subsidi, harga).
 */
export function buatBeritaPerubahanKebijakan(
  negaraNama: string,
  indikator: string,
  deskripsi: string,
  dateStr: string,
  countrySlug?: string,
): AiNewsItem {
  const formatIndikator = LABEL_MENU_INDIKATOR[indikator] ?? indikator
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

  return {
    id: `news-policy-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "kebijakan_negara",
    category: "ekonomi_keuangan",
    headline: `Kebijakan Baru Pemerintah ${negaraNama}`,
    content: `Menanggapi kondisi pada menu ${formatIndikator}, otoritas ${negaraNama} menetapkan langkah penyesuaian: ${deskripsi}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    indicatorKey: indikator,
    targetTab: indikator,
  };
}

/**
 * Generator berita untuk aksi geopolitik / event AI (bencana, operasi darurat, diplomasi).
 */
export function buatBeritaEventAI(
  negaraNama: string,
  judulEvent: string,
  tindakan: string,
  kategori: AiNewsItem["category"],
  dateStr: string,
  countrySlug?: string,
): AiNewsItem {
  return {
    id: `news-event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: "update_geopolitik",
    category: kategori,
    headline: `Langkah Strategis ${negaraNama}: ${judulEvent}`,
    content: `Menghadapi situasi terkini, pemerintah ${negaraNama} mengambil keputusan: ${tindakan}.`,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
  };
}

/**
 * Generator berita untuk pencapaian & riset Program Nuklir negara (Player / NPC AI).
 */
export function buatBeritaProgramNuklirAI(
  negaraNama: string,
  tahap: "dimulai" | "selesai",
  dateStr: string,
  completionDate?: string,
  countrySlug?: string,
): AiNewsItem {
  const isDimulai = tahap === "dimulai";
  const headline = isDimulai
    ? `☢️ ${negaraNama} Memulai Pengembangan Program Nuklir!`
    : `⚛️ Program Nuklir ${negaraNama} Resmi Beroperasi Penuh!`;

  const content = isDimulai
    ? `Intelijen pertahanan mengonfirmasi bahwa pemerintah ${negaraNama} telah resmi mengalokasikan anggaran dan memulai riset pengayaan bahan bakar nuklir strategis. Fasilitas reaktor dan laboratorium diproyeksikan selesai pada ${completionDate || dateStr}.`
    : `Pemerintah ${negaraNama} secara resmi mengumumkan keberhasilan pengaktifan fasilitas Program Nuklir Nasional. Dengan pencapaian ini, ${negaraNama} kini masuk ke dalam jajaran negara dengan kapabilitas teknologi nuklir strategis global.`;

  return {
    id: `news-nuclear-${tahap}-${negaraNama.replace(/\s+/g, "_").toLowerCase()}-${dateStr}-${Date.now().toString(36)}`,
    type: "update_geopolitik",
    category: "pencapaian_militer",
    headline,
    content,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    completionDate,
    constructionSection: "militer",
  };
}

/**
 * Generator berita untuk perakitan & pencapaian Rudal Balistik Antar-Benua (ICBM) negara.
 */
export function buatBeritaIcbmAI(
  negaraNama: string,
  tahap: "dimulai" | "selesai",
  jumlah: number,
  dateStr: string,
  completionDate?: string,
  countrySlug?: string,
): AiNewsItem {
  const isDimulai = tahap === "dimulai";
  const headline = isDimulai
    ? `🚀 ${negaraNama} Mengembangkan ${jumlah} Rudal Balistik Antar-Benua (ICBM)!`
    : `💥 Gudang Rudal ${negaraNama} Resmi Memperoleh ${jumlah} Unit Rudal ICBM Siap Luncur!`;

  const content = isDimulai
    ? `Otoritas Komando Strategis ${negaraNama} telah menandatangani perintah produksi perakitan ${jumlah} unit Rudal Balistik Antar-Benua (ICBM). Rudal jelajah antar-benua ini diperkirakan tuntas dirakit pada ${completionDate || dateStr}.`
    : `Sebanyak ${jumlah} unit Rudal Balistik Antar-Benua (ICBM) milik ${negaraNama} telah selesai dirakit dan dinyatakan siap tempur di silo peluncuran. Hal ini menaikkan status pencegahan nuklir negara tersebut secara drastis di panggung geopolitik dunia.`;

  return {
    id: `news-icbm-${tahap}-${negaraNama.replace(/\s+/g, "_").toLowerCase()}-${dateStr}-${Date.now().toString(36)}`,
    type: "update_geopolitik",
    category: "pencapaian_militer",
    headline,
    content,
    timestamp: dateStr,
    dateStr,
    countryName: negaraNama,
    countrySlug,
    completionDate,
    countFrom: 0,
    countTo: jumlah,
    constructionSection: "militer",
  };
}
