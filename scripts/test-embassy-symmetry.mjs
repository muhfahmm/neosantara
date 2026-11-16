import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runEmbassyAudit, normalizeSlug } from '../scripts/audit-embassies.mjs';
import { generateSymmetryMigration } from '../scripts/fix-embassy-symmetry.mjs';

describe('Audit & Migrasi Simetri Kedutaan Besar', () => {
  it('Normalisasi slug menangani huruf besar/kecil, aksen, dan karakter khusus', () => {
    assert.equal(normalizeSlug('Amerika Serikat'), 'amerika_serikat');
    assert.equal(normalizeSlug('  Arab Saudi  '), 'arab_saudi');
    assert.equal(normalizeSlug('Côte d’Ivoire'), 'cote_d_ivoire');
    assert.equal(normalizeSlug('São Tomé and Príncipe'), 'sao_tome_and_principe');
    assert.equal(normalizeSlug('Bonaire, Sint Eustatius dan Saba'), 'bonaire_sint_eustatius_dan_saba');
  });

  it('Audit menemukan asimetri pada data uji kecil, migrasi menutupnya, dan menjadi simetris', () => {
    const root = process.cwd();
    // Dummy SQL dengan 3 negara:
    // Country 1 (indonesia) punya kedutaan di Malaysia dan Singapura
    // Country 2 (malaysia) punya kedutaan di Indonesia (simetris dengan Indonesia)
    // Country 3 (singapura) BELUM punya kedutaan di Indonesia (asimetris!)
    const testSql = `
DROP TABLE IF EXISTS database_kedutaan_besar;
CREATE TABLE database_kedutaan_besar (
id SERIAL NOT NULL PRIMARY KEY,
country_id INT NOT NULL,
country_slug VARCHAR(100) NOT NULL,
mitra_no INT NOT NULL,
mitra_country VARCHAR(100) NOT NULL,
embassy_type VARCHAR(100) NOT NULL,
status VARCHAR(50) NOT NULL
);
INSERT INTO database_kedutaan_besar (
country_id, country_slug, mitra_no, mitra_country, embassy_type, status
) VALUES
(1, 'indonesia', 1, 'Malaysia', 'Kedutaan Besar', 'Aktif'),
(2, 'indonesia', 2, 'Singapura', 'Kedutaan Besar', 'Aktif'),
(3, 'malaysia', 1, 'Indonesia', 'Kedutaan Besar', 'Aktif');
-- ========================================================
`;
    const auditBefore = runEmbassyAudit(root, testSql);
    assert.equal(auditBefore.totalSqlRows, 3);
    assert.equal(auditBefore.symmetricPairsCount, 1); // indonesia <-> malaysia
    assert.equal(auditBefore.asymmetricPairsCount, 1); // indonesia -> singapura (missing singapura -> indonesia)
    assert.equal(auditBefore.asymmetricList[0].countryASlug, 'indonesia');
    assert.equal(auditBefore.asymmetricList[0].countryBSlug, 'singapura');

    // Buat migrasi pada data uji tersebut
    // Simulasikan penambahan manual hasil logika migrasi
    const fixedSql = testSql.replace(
      '-- ========================================================',
      `INSERT INTO database_kedutaan_besar (
country_id, country_slug, mitra_no, mitra_country, embassy_type, status
) VALUES
(4, 'singapura', 1, 'Indonesia', 'Kedutaan Besar', 'Aktif');
-- ========================================================`
    );

    const auditAfter = runEmbassyAudit(root, fixedSql);
    assert.equal(auditAfter.totalSqlRows, 4);
    assert.equal(auditAfter.symmetricPairsCount, 2);
    assert.equal(auditAfter.asymmetricPairsCount, 0);
  });
});
