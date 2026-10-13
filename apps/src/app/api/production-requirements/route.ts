import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  mapActiveTabToRequirementsFolder,
  parseRequirementsFile,
  findBuildingRequirements,
} from '../../page/navigasi_menu/2_navigasi_bawah/5_pembangunan/1_produksi/construction_support/indexRequirements';

async function resolveRequirementsBasePath(): Promise<string> {
  const candidate = path.join(process.cwd(), 'src', 'app', 'page', 'navigasi_menu', '2_navigasi_bawah', '5_pembangunan', '1_produksi', 'construction_support', '1_produksi');
  try {
    await fs.access(candidate);
    return candidate;
  } catch {
    const alt = path.join(process.cwd(), 'apps', 'src', 'app', 'page', 'navigasi_menu', '2_navigasi_bawah', '5_pembangunan', '1_produksi', 'construction_support', '1_produksi');
    await fs.access(alt);
    return alt;
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category')?.trim() || '';
    const buildingKey = url.searchParams.get('buildingKey')?.trim() || '';

    const folder = mapActiveTabToRequirementsFolder(category);
    if (!folder) {
      return NextResponse.json({ error: 'Kategori requirements tidak ditemukan' }, { status: 400 });
    }

    const basePath = await resolveRequirementsBasePath();
    const filePath = path.join(basePath, folder, 'requirements.txt');
    const content = await fs.readFile(filePath, 'utf8');
    const allEntries = parseRequirementsFile(content, category);

    if (buildingKey) {
      const building = findBuildingRequirements(allEntries, buildingKey);
      if (!building) {
        return NextResponse.json({ error: 'Bangunan tidak ditemukan dalam requirements' }, { status: 404 });
      }
      return NextResponse.json({ requirements: building.requirements });
    }

    return NextResponse.json({ requirements: allEntries });
  } catch (error) {
    console.error('[production-requirements] error', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
