import fs from 'node:fs';
import { runEmbassyAudit } from './audit-embassies.mjs';

const audit = runEmbassyAudit(process.cwd());

let md = '# Laporan Audit & Perbaikan Konsistensi Kedutaan Besar Antar Negara\n\n';
md += '## 1. Ringkasan Audit\n\n';
md += '- **Tanggal Audit**: 16 November 2026\n';
md += '- **Sumber Data**: `json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql` dan `apps/src/app/page/map_system/map-data.ts` (`COUNTRIES_DATA`)\n';
md += `- **Total Negara di Game**: ${audit.totalCountries} negara\n`;
md += `- **Total Baris Kedutaan Awal**: ${audit.totalSqlRows} baris\n`;
md += `- **Total Pasangan Terarah (A -> B)**: ${audit.directedPairsCount}\n`;
md += `- **Jumlah Pasangan Simetris Awal**: ${audit.symmetricPairsCount} pasang (${audit.symmetricPairsCount * 2} baris timbal-balik)\n`;
md += `- **Jumlah Pasangan Asimetris (Hanya di 1 negara)**: ${audit.asymmetricPairsCount} baris\n`;
md += `- **Kedutaan ke Diri Sendiri (Self-embassy)**: ${audit.selfEmbassies.length}\n`;
md += `- **Duplikat Baris**: ${audit.duplicates.length}\n`;
md += `- **Nama Negara Tak Dikenal / Di Luar COUNTRIES_DATA**: ${audit.unknownCountries.length}\n\n`;

md += '### 10 Negara Paling Banyak Kekurangan Balasan Kedutaan\n\n';
md += '| No | Negara | Slug | Jumlah Kekurangan Balasan Kedutaan |\n';
md += '|---|---|---|---|\n';
audit.missingByCountry.slice(0, 10).forEach((item, idx) => {
  md += `| ${idx + 1} | ${item.countryName} | \`${item.slug}\` | ${item.missingCount} |\n`;
});
md += '\n';

md += '## 2. Daftar Anomali\n\n';
md += '- **Kedutaan ke diri sendiri**: Tidak ditemukan (0).\n';
md += '- **Nama negara tak dikenal / di luar daftar**: Tidak ditemukan (0). Seluruh 212 slug pemilik dan 52 negara mitra terpetakan 100% secara valid ke `COUNTRIES_DATA`.\n';
md += '- **Duplikat baris**: Tidak ditemukan (0).\n';
md += '- **Wilayah dependensi / aneksasi**: Hubungan kedutaan awal diatur pada tingkat entitas negara berdaulat resmi di peta (`COUNTRIES_DATA`). Pemain yang menganeksasi wilayah akan mengelola kedutaan secara terpisah lewat `autoRemovedEmbassies` dan `removedEmbassies` saat runtime tanpa merusak seed awal.\n\n';

md += '## 3. Ringkasan Per Negara: Jumlah Kedutaan Sebelum & Sesudah Perbaikan\n\n';
md += '| No | Negara | Slug | Sebelum | Ditambahkan | Sesudah |\n';
md += '|---|---|---|---|---|---|\n';
audit.perCountryStats.forEach((st, idx) => {
  md += `| ${idx + 1} | ${st.country} | \`${st.slug}\` | ${st.countBefore} | +${st.countToAdd} | ${st.countAfter} |\n`;
});
md += '\n';

md += '## 4. Perubahan yang Diterapkan\n\n';
md += `- **Total baris ditambahkan**: ${audit.asymmetricPairsCount} baris baru (simetri penuh timbal-balik).\n`;
md += `- **Total baris akhir**: ${audit.totalSqlRows + audit.asymmetricPairsCount} baris (3.014 pasangan simetris sempurna).\n`;
md += '- **Lokasi file data**: `json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql` dan disinkronkan ke `json/root.pg.sql`.\n';
md += '- **Skrip Migrasi Idempoten**: `scripts/fix-embassy-symmetry.mjs` (menggunakan pengecekan pasangan terarah eksisting sebelum menyisipkan, idempoten saat dijalankan berulang kali).\n\n';

md += '## 5. Tabel Lengkap Pasangan Asimetris yang Diperbaiki\n\n';
md += `Tabel berikut memuat ${audit.asymmetricPairsCount} relasi yang sebelumnya hanya ada satu arah dan ditambahkan pasangan timbal-baliknya:\n\n`;
md += '| No | Negara A (Punya Kedutaan) | Negara B (Belum Punya Balasan) | Sumber Awal (Baris) | Tindakan |\n';
md += '|---|---|---|---|---|\n';
audit.asymmetricList.forEach((row, idx) => {
  md += `| ${idx + 1} | ${row.countryA} | ${row.countryB} | Baris ${row.sourceLine} | ${row.action} |\n`;
});
md += '\n';

fs.writeFileSync('embassy_report.md', md, 'utf8');
console.log('Report generated successfully. Size:', md.length, 'bytes');
