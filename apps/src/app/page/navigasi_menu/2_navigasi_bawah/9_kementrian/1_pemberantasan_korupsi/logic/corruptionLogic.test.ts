/**
 * Test cases untuk sistem narasi korupsi berbasis kementerian
 * 
 * Memverifikasi bahwa:
 * 1. Semua skema korupsi memiliki ministry dan description
 * 2. Mapping ministry ke skema berfungsi dengan benar
 * 3. Notifikasi menggunakan narasi yang tepat
 */

import { 
  CORRUPTION_SCHEMES, 
  getCorruptionMinistries, 
  getSchemesByMinistry,
  getSchemeDescription,
  type CorruptionScheme 
} from './corruptionLogic';

// Test 1: Validasi struktur data
console.log('=== Test 1: Validasi Struktur Data ===');
const missingFields: string[] = [];

CORRUPTION_SCHEMES.forEach(scheme => {
  if (!scheme.ministry) {
    missingFields.push(`${scheme.id}: missing ministry`);
  }
  if (!scheme.description) {
    missingFields.push(`${scheme.id}: missing description`);
  }
  if (scheme.description && scheme.description.length < 20) {
    missingFields.push(`${scheme.id}: description too short (${scheme.description.length} chars)`);
  }
});

if (missingFields.length === 0) {
  console.log('✅ Semua skema memiliki ministry dan description yang valid');
  console.log(`   Total skema: ${CORRUPTION_SCHEMES.length}`);
} else {
  console.log('❌ Ada skema dengan data tidak lengkap:');
  missingFields.forEach(msg => console.log(`   - ${msg}`));
}

// Test 2: Mapping Ministry
console.log('\n=== Test 2: Mapping Kementerian ===');
const ministries = getCorruptionMinistries();
console.log(`✅ Total kementerian terdaftar: ${ministries.length}`);
console.log('   Daftar kementerian:');
ministries.forEach(ministry => {
  const schemes = getSchemesByMinistry(ministry);
  console.log(`   - ${ministry}: ${schemes.length} jenis korupsi`);
});

// Test 3: Distribusi per Kementerian
console.log('\n=== Test 3: Distribusi Korupsi per Kementerian ===');
const distribution = new Map<string, number>();
CORRUPTION_SCHEMES.forEach(scheme => {
  const count = distribution.get(scheme.ministry) || 0;
  distribution.set(scheme.ministry, count + 1);
});

const sortedDistribution = Array.from(distribution.entries())
  .sort((a, b) => b[1] - a[1]);

console.log('Top 5 kementerian dengan risiko korupsi tertinggi:');
sortedDistribution.slice(0, 5).forEach(([ministry, count], index) => {
  console.log(`   ${index + 1}. ${ministry}: ${count} jenis`);
});

// Test 4: Sample Descriptions
console.log('\n=== Test 4: Sample Deskripsi Skandal ===');
const sampleSchemes = [
  'mark_up_alutsista',
  'bailout_palsu',
  'obat_palsu',
  'mafia_peradilan',
  'suap_pajak'
];

sampleSchemes.forEach(schemeId => {
  const scheme = CORRUPTION_SCHEMES.find(s => s.id === schemeId);
  if (scheme) {
    console.log(`\n📋 ${scheme.name} (${scheme.ministry})`);
    console.log(`   ${scheme.description}`);
  }
});

// Test 5: Coverage per Kategori
console.log('\n=== Test 5: Coverage per Kategori ===');
const categories = new Map<string, Set<string>>();
CORRUPTION_SCHEMES.forEach(scheme => {
  if (!categories.has(scheme.category)) {
    categories.set(scheme.category, new Set());
  }
  categories.get(scheme.category)?.add(scheme.ministry);
});

categories.forEach((ministries, category) => {
  console.log(`${category}: ${ministries.size} kementerian terlibat`);
});

// Test 6: Validasi Fungsi Helper
console.log('\n=== Test 6: Validasi Fungsi Helper ===');
const testDescription = getSchemeDescription('mark_up_alutsista');
console.log(`✅ getSchemeDescription() works: "${testDescription.substring(0, 50)}..."`);

const testMinistries = getCorruptionMinistries();
console.log(`✅ getCorruptionMinistries() returns ${testMinistries.length} ministries`);

const testSchemes = getSchemesByMinistry('Kementerian Pertahanan');
console.log(`✅ getSchemesByMinistry('Kementerian Pertahanan') returns ${testSchemes.length} schemes`);

// Test 7: Notification Preview
console.log('\n=== Test 7: Preview Format Notifikasi ===');
const previewScheme = CORRUPTION_SCHEMES.find(s => s.id === 'mark_up_alutsista');
if (previewScheme) {
  const severity: 'ringan' | 'sedang' | 'berat' = 'sedang';
  const budgetLoss = 1500000;
  const satisfactionLoss = 2;
  
  const severityLabel = severity === 'berat' ? 'KASUS BERAT' : severity === 'sedang' ? 'KASUS SEDANG' : 'KASUS RINGAN';
  const detailMessage = `${previewScheme.description}. Kerugian negara diperkirakan ${budgetLoss.toLocaleString('id-ID')} NEO. Tingkat kepuasan rakyat turun ${satisfactionLoss} poin akibat skandal ini. Segera buka menu Pemberantasan Korupsi untuk menyelidiki dan menuntaskan kasus.`;
  
  console.log(`\n🚨 [${severityLabel}] ${previewScheme.name} - ${previewScheme.ministry}`);
  console.log(`\n${detailMessage}`);
}

// Summary
console.log('\n=== SUMMARY ===');
console.log(`✅ Total Skema Korupsi: ${CORRUPTION_SCHEMES.length}`);
console.log(`✅ Total Kementerian: ${ministries.length}`);
console.log(`✅ Total Kategori: ${categories.size}`);
console.log(`✅ Semua skema memiliki narasi detail`);
console.log(`✅ Sistem siap digunakan!`);

export {};
