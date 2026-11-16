import fs from 'node:fs';
import path from 'node:path';
import { runEmbassyAudit, loadCountriesData, parseSqlRows, normalizeSlug } from './audit-embassies.mjs';

export function generateSymmetryMigration(rootPath) {
  const countries = loadCountriesData(rootPath);
  const sqlPath = path.join(rootPath, 'json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  const existingRows = parseSqlRows(sqlContent);

  const existingPairs = new Set();
  const maxMitraNoBySlug = new Map();
  let maxId = 0;

  for (const r of existingRows) {
    if (r.id > maxId) maxId = r.id;
    const hostSlug = normalizeSlug(r.mitra_country);
    existingPairs.add(`${r.country_slug}->${hostSlug}`);

    const currMax = maxMitraNoBySlug.get(r.country_slug) || 0;
    if (r.mitra_no > currMax) {
      maxMitraNoBySlug.set(r.country_slug, r.mitra_no);
    }
  }

  const slugToCanonicalName = new Map();
  countries.forEach(c => slugToCanonicalName.set(normalizeSlug(c.country), c.country));
  existingRows.forEach(r => {
    slugToCanonicalName.set(normalizeSlug(r.mitra_country), r.mitra_country);
  });

  // Collect missing reverse pairs
  const missingAdditions = [];
  for (const pair of existingPairs) {
    const [owner, host] = pair.split('->');
    const reversePair = `${host}->${owner}`;
    if (!existingPairs.has(reversePair)) {
      missingAdditions.push({
        newOwnerSlug: host,
        newHostSlug: owner,
        newHostCountryName: slugToCanonicalName.get(owner) || owner,
      });
    }
  }

  // If already 0 additions needed, migration is idempoten (no-op)
  if (missingAdditions.length === 0) {
    console.log('Migration check: 0 missing additions. Data already 100% symmetric.');
    return {
      addedCount: 0,
      newSqlContent: sqlContent,
      addedRows: [],
    };
  }

  // Group additions by newOwnerSlug and sort deterministically
  missingAdditions.sort((a, b) => {
    const cmp = a.newOwnerSlug.localeCompare(b.newOwnerSlug);
    if (cmp !== 0) return cmp;
    return a.newHostCountryName.localeCompare(b.newHostCountryName);
  });

  let nextId = maxId;
  const addedRows = [];

  for (const item of missingAdditions) {
    nextId++;
    const nextMitraNo = (maxMitraNoBySlug.get(item.newOwnerSlug) || 0) + 1;
    maxMitraNoBySlug.set(item.newOwnerSlug, nextMitraNo);

    addedRows.push({
      id: nextId,
      country_id: nextId,
      country_slug: item.newOwnerSlug,
      mitra_no: nextMitraNo,
      mitra_country: item.newHostCountryName,
      embassy_type: 'Kedutaan Besar',
      status: 'Aktif',
    });
  }

  // Format as SQL INSERT statements in chunks of 500
  const CHUNK_SIZE = 500;
  let addedSqlChunks = '\n-- ========================================================\n';
  addedSqlChunks += `-- MIGRATION: SIMETRI KEDUTAAN BESAR (${addedRows.length} BARIS TAMBAHAN)\n`;
  addedSqlChunks += `-- Menambahkan balasan timbal-balik agar relasi A -> B <=> B -> A simetris\n`;
  addedSqlChunks += '-- ========================================================\n';

  for (let i = 0; i < addedRows.length; i += CHUNK_SIZE) {
    const chunk = addedRows.slice(i, i + CHUNK_SIZE);
    addedSqlChunks += '\nINSERT INTO database_kedutaan_besar (\n';
    addedSqlChunks += 'country_id, country_slug, mitra_no, mitra_country, embassy_type, status\n';
    addedSqlChunks += ') VALUES\n';
    const rowLines = chunk.map(r => {
      // Escape single quotes if any
      const escapedCountry = r.mitra_country.replace(/'/g, "''");
      return `(${r.id}, '${r.country_slug}', ${r.mitra_no}, '${escapedCountry}', '${r.embassy_type}', '${r.status}')`;
    });
    addedSqlChunks += rowLines.join(',\n') + ';\n';
  }

  // Append cleanly to existing sqlContent (before trailing comments or at end)
  const marker = '-- ========================================================';
  const lastMarkerIdx = sqlContent.lastIndexOf(marker);
  let newSqlContent;
  if (lastMarkerIdx !== -1) {
    newSqlContent = sqlContent.substring(0, lastMarkerIdx).trimEnd() + '\n' + addedSqlChunks + marker + '\n';
  } else {
    newSqlContent = sqlContent.trimEnd() + '\n' + addedSqlChunks;
  }

  return {
    addedCount: addedRows.length,
    newSqlContent,
    addedRows,
  };
}

export function applyMigration(rootPath) {
  const result = generateSymmetryMigration(rootPath);
  if (result.addedCount === 0) {
    console.log('No migration needed. Database already symmetric.');
    return result;
  }

  const sqlPath = path.join(rootPath, 'json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql');
  const rootSqlPath = path.join(rootPath, 'json/root.pg.sql');

  // 1. Update json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql
  fs.writeFileSync(sqlPath, result.newSqlContent, 'utf8');
  console.log(`Updated ${sqlPath} with +${result.addedCount} rows.`);

  // 2. Synchronize section in json/root.pg.sql
  if (fs.existsSync(rootSqlPath)) {
    const rootSql = fs.readFileSync(rootSqlPath, 'utf8');
    const sectionStart = rootSql.indexOf('-- SECTION: json/database_kedutaan_besar\\database_kedutaan_besar.pg.sql');
    if (sectionStart !== -1) {
      const nextSectionStart = rootSql.indexOf('-- SECTION: ', sectionStart + 50);
      const sectionEnd = nextSectionStart !== -1 ? nextSectionStart : rootSql.length;

      const newRootSql = rootSql.substring(0, sectionStart) +
        `-- SECTION: json/database_kedutaan_besar\\database_kedutaan_besar.pg.sql\n` +
        result.newSqlContent.trim() + '\n\n' +
        rootSql.substring(sectionEnd);

      fs.writeFileSync(rootSqlPath, newRootSql, 'utf8');
      console.log(`Synchronized section in ${rootSqlPath}.`);
    }
  }

  return result;
}

if (process.argv[1] && process.argv[1].endsWith('fix-embassy-symmetry.mjs')) {
  const root = process.cwd();
  console.log('Executing embassy symmetry migration...');
  const res = applyMigration(root);
  console.log('Migration finished. Total rows added:', res.addedCount);

  // Run audit to verify
  const verifyAudit = runEmbassyAudit(root);
  console.log('--- POST-MIGRATION AUDIT ---');
  console.log('Total SQL Rows:', verifyAudit.totalSqlRows);
  console.log('Directed Pairs:', verifyAudit.directedPairsCount);
  console.log('Symmetric Pairs:', verifyAudit.symmetricPairsCount);
  console.log('Asymmetric Pairs (must be 0):', verifyAudit.asymmetricPairsCount);
}
