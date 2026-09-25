import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

async function readAllTsFiles(dir: string, files: string[] = []) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await readAllTsFiles(full, files);
    } else if (/\.ts$/.test(e.name)) {
      files.push(full);
    }
  }
  return files;
}

async function loadJsonCategoryFiles(baseDir: string): Promise<Record<string, any>> {
  const metadata: Record<string, any> = {};
  
  // Try to load from organized category JSON files first
  const categoryFiles = [
    // Produksi (Production)
    '1_pembangunan/1_produksi/1_sektor_listrik_nasional/1_metadata_listrik.json',
    '1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.json',
    '1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.json',
    '1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.json',
    '1_pembangunan/1_produksi/5_sektor_agrikultur/5_metadata_agrikultur.json',
    '1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.json',
    '1_pembangunan/1_produksi/7_sektor_olahan_pangan/7_metadata_olahan_pangan.json',
    // Tempat Umum (Public Places)
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/1_infrastruktur/metadata_infrastruktur.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/2_pendidikan/metadata_pendidikan.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/4_hukum/metadata_hukum.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.json',
    '1_pembangunan/2_tempat_umum/1_Layanan Publik/7_hiburan/metadata_hiburan.json',
    '1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.json',
    // Pertahanan (Defense)
    '2_pertahanan/1_armada_militer/metadata_armada_militer.json',
    '2_pertahanan/2_armada_polisi/metadata_armada_polisi.json',
    '2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.json',
    '2_pertahanan/1_serang_negara/metadata_serang_negara.json',
    '2_pertahanan/2_intelijen/metadata_intelijen.json',
    '2_pertahanan/3_wilayah_direbut/metadata_wilayah_direbut.json',
    '2_pertahanan/4_armada/metadata_armada.json',
    '2_pertahanan/5_icbm/metadata_icbm.json'
  ];
  
  for (const catFile of categoryFiles) {
    try {
      const fullPath = path.join(baseDir, catFile);
      const content = await fs.readFile(fullPath, 'utf8');
      const data = JSON.parse(content);
      Object.assign(metadata, data);
      console.log('[building-metadata] loaded category file:', catFile);
    } catch (e) {
      // silently skip if not found
    }
  }
  
  return metadata;
}

let cachedBuildingMetadata: Record<string, any> | null = null;

export async function GET() {
  if (cachedBuildingMetadata) {
    return NextResponse.json(cachedBuildingMetadata);
  }

  try {
    let base = path.join(process.cwd(), 'json', 'semua_fitur_negara');
    // In dev server process.cwd() may be apps/; try parent folder as fallback
    try {
      await fs.access(base);
    } catch (e) {
      const alt = path.join(process.cwd(), '..', 'json', 'semua_fitur_negara');
      try {
        await fs.access(alt);
        base = alt;
      } catch (e2) {
        throw new Error(`Cannot locate json/semua_fitur_negara at ${base} or ${alt}`);
      }
    }
    
    console.log('[building-metadata] using base path:', base);
    
    // Try to load from organized category JSON files first
    const metadata = await loadJsonCategoryFiles(base);
    if (Object.keys(metadata).length > 0) {
      console.log('[building-metadata] loaded from category files:', Object.keys(metadata).length, 'items');
      cachedBuildingMetadata = metadata;
      return NextResponse.json(cachedBuildingMetadata);
    }
    
    // Fallback: parse TS files if category JSON not available
    console.log('[building-metadata] category files not found, falling back to TS parsing');
    const tsFiles = await readAllTsFiles(base);
    const fallbackMetadata: Record<string, any> = {};
    
    const dataKeyRegex = /dataKey\s*:\s*"([^\"]+)"/g;
    for (const f of tsFiles) {
      const content = await fs.readFile(f, 'utf8');
      let m: RegExpExecArray | null;
      while ((m = dataKeyRegex.exec(content)) !== null) {
        const dataKey = m[1];
        const idx = m.index;
        let start = content.lastIndexOf('{', idx);
        if (start === -1) continue;
        let depth = 0;
        let end = -1;
        for (let i = start; i < content.length; i++) {
          const ch = content[i];
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) { end = i; break; }
          }
        }
        if (end === -1) continue;
        const objText = content.slice(start, end + 1);
        const biayaMatch = /biaya_pembangunan\s*:\s*([0-9.]+)/.exec(objText);
        const produksiMatch = /produksi\s*:\s*([0-9.]+)/.exec(objText);
        const satuanMatch = /satuan\s*:\s*"([^\"]+)"/.exec(objText);
        fallbackMetadata[dataKey] = fallbackMetadata[dataKey] || {};
        if (biayaMatch) fallbackMetadata[dataKey].biaya_pembangunan = Number(biayaMatch[1]);
        if (produksiMatch) fallbackMetadata[dataKey].produksi = Number(produksiMatch[1]);
        if (satuanMatch) fallbackMetadata[dataKey].satuan = satuanMatch[1];
      }
    }

    cachedBuildingMetadata = fallbackMetadata;
    return NextResponse.json(cachedBuildingMetadata);
  } catch (err) {
    console.error('[building-metadata] error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
