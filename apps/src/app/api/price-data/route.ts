import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const stripPrefix = (fileName: string) =>
  fileName.replace(/^(\d+_)/, '').replace(/\.(ts|tsx|js|json)$/i, '');

const parsePriceValues = (content: string) => {
  const cleaned = content
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  const values: Record<string, number> = {};
  const entries = cleaned.matchAll(/"(harga_[a-z_]+)"\s*:\s*(\d+)/g);
  for (const match of entries) {
    values[match[1]] = Number(match[2]);
  }

  return Object.keys(values).length > 0 ? values : null;
};

const cachedPriceDataMap = new Map<string, any>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  if (!countryName) {
    return NextResponse.json({ error: 'Country is required' }, { status: 400 });
  }

  const target = normalizeName(countryName);
  if (cachedPriceDataMap.has(target)) {
    return NextResponse.json(cachedPriceDataMap.get(target));
  }

  try {
    const currentDir = process.cwd();
    const projectRoot = currentDir.endsWith('apps') ? path.join(currentDir, '..') : currentDir;
    const priceRoot = path.join(projectRoot, 'json/database_harga_barang');

    const target = normalizeName(countryName);
    const candidates: string[] = [];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (/\.(ts|tsx|js|json)$/i.test(entry.name)) {
          const fileName = stripPrefix(entry.name);
          const normalizedFileName = normalizeName(fileName);
          if (
            normalizedFileName === target ||
            normalizedFileName.includes(target) ||
            target.includes(normalizedFileName)
          ) {
            candidates.push(fullPath);
          }
        }
      }
    };

    walk(priceRoot);

    if (candidates.length === 0) {
      const resData = { country: countryName, prices: null };
      cachedPriceDataMap.set(target, resData);
      return NextResponse.json(resData);
    }

    const filePath = candidates[0];
    const content = fs.readFileSync(filePath, 'utf8');
    const values = parsePriceValues(content);

    const resData = { country: countryName, prices: values };
    cachedPriceDataMap.set(target, resData);
    return NextResponse.json(resData);
  } catch (error) {
    console.error('Failed to read price data:', error);
    return NextResponse.json({ error: 'Failed to read price data' }, { status: 500 });
  }
}
