import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { queryDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

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

async function loadCategoryMetadata(baseDir: string): Promise<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {};
  const databaseRows = await queryDb<Array<{
    source_file: string;
    file_order: number;
    entry_key: string;
    entry_order: number;
    metadata: Record<string, unknown>;
  }>>(
    'SELECT source_file, file_order, entry_key, entry_order, metadata FROM database_building_metadata ORDER BY file_order, entry_order'
  );
  const metadataByFile = new Map<string, Record<string, unknown>>();
  databaseRows.forEach(row => {
    const fileMetadata = metadataByFile.get(row.source_file) ?? {};
    fileMetadata[row.entry_key] = row.metadata;
    metadataByFile.set(row.source_file, fileMetadata);
  });
  
  // Load organized category metadata in source order.
  const categoryFiles: Array<string | { path: string; sourceFile?: string }> = [
    // Produksi (Production)
    {
      path: '1_pembangunan/1_produksi/1_sektor_listrik_nasional',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/1_sektor_listrik_nasional/1_metadata_listrik.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/2_sektor_mineral_kritis',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/2_sektor_mineral_kritis/2_metadata_ekstraksi.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/3_manufaktur',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/3_manufaktur/3_metadata_manufaktur.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/4_sektor_peternakan',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/4_sektor_peternakan/4_metadata_peternakan.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/5_sektor_agrikultur',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/5_sektor_agrikultur/5_metadata_agrikultur.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/6_sektor_perikanan',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/6_sektor_perikanan/6_metadata_perikanan.pg.sql',
    },
    {
      path: '1_pembangunan/1_produksi/7_sektor_olahan_pangan',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/1_produksi/7_sektor_olahan_pangan/7_metadata_olahan_pangan.pg.sql',
    },
    // Tempat Umum (Public Places)
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/1_infrastruktur',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/1_infrastruktur/metadata_infrastruktur.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/2_pendidikan',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/2_pendidikan/metadata_pendidikan.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/3_kesehatan/metadata_kesehatan.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/4_hukum',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/4_hukum/metadata_hukum.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/5_olahraga/metadata_olahraga.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/1_Layanan Publik/6_komersial/metadata_komersial.pg.sql',
    },
    {
      path: '1_pembangunan/2_tempat_umum/2_hunian_permukiman',
      sourceFile: 'json/semua_fitur_negara/1_pembangunan/2_tempat_umum/2_hunian_permukiman/metadata_hunian.pg.sql',
    },
    // Pertahanan (Defense)
    {
      path: '2_pertahanan/1_armada_militer',
      sourceFile: 'json/semua_fitur_negara/2_pertahanan/1_armada_militer/metadata_armada_militer.pg.sql',
    },
    {
      path: '2_pertahanan/3_manajemen_pertahanan',
      sourceFile: 'json/semua_fitur_negara/2_pertahanan/3_manajemen_pertahanan/metadata_manajemen.pg.sql',
    },
  ];
  
  for (const entry of categoryFiles) {
    const category = typeof entry === 'string' ? { path: entry } : entry;
    if (category.sourceFile) {
      const databaseMetadata = metadataByFile.get(category.sourceFile);
      if (!databaseMetadata) {
        throw new Error(`No database metadata rows found for ${category.sourceFile}`);
      }
      Object.assign(metadata, databaseMetadata);
      continue;
    }

    try {
      const fullPath = path.join(baseDir, category.path);
      const content = await fs.readFile(fullPath, 'utf8');
      const data: unknown = JSON.parse(content);
      if (!isRecord(data)) {
        throw new Error(`Invalid category metadata in ${category.path}`);
      }
      Object.assign(metadata, data);
      console.log('[building-metadata] loaded category file:', category.path);
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        continue;
      }
      throw error;
    }
  }
  
  return metadata;
}

export async function GET() {
  try {
    let base = path.join(process.cwd(), 'json', 'semua_fitur_negara');
    // In dev server process.cwd() may be apps/; try parent folder as fallback
    try {
      await fs.access(base);
    } catch {
      const alt = path.join(process.cwd(), '..', 'json', 'semua_fitur_negara');
      try {
        await fs.access(alt);
        base = alt;
      } catch {
        throw new Error(`Cannot locate json/semua_fitur_negara at ${base} or ${alt}`);
      }
    }
    
    console.log('[building-metadata] using base path:', base);
    
    const metadata = await loadCategoryMetadata(base);
    if (Object.keys(metadata).length > 0) {
      console.log('[building-metadata] loaded category metadata:', Object.keys(metadata).length, 'items');
      return NextResponse.json(metadata, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      });
    }
    
    // Fallback: parse TS files if category JSON not available
    console.log('[building-metadata] category files not found, falling back to TS parsing');
    const tsFiles = await readAllTsFiles(base);
    const fallbackMetadata: Record<string, {
      biaya_pembangunan?: number;
      produksi?: number;
      satuan?: string;
    }> = {};
    
    const dataKeyRegex = /dataKey\s*:\s*"([^\"]+)"/g;
    for (const f of tsFiles) {
      const content = await fs.readFile(f, 'utf8');
      let m: RegExpExecArray | null;
      while ((m = dataKeyRegex.exec(content)) !== null) {
        const dataKey = m[1];
        const idx = m.index;
        const start = content.lastIndexOf('{', idx);
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

    return NextResponse.json(fallbackMetadata, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err) {
    console.error('[building-metadata] error', err);
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  }
}
