-- Database Level Kabinet (207 negara)
-- Level 1-6 disesuaikan dengan status pembangunan negara:
--   Maju        : level dasar 5-6 (high income / HDI sangat tinggi)
--   Berkembang  : level dasar 3-4 (middle income)
--   Miskin      : level dasar 1-2 (low income / negara rapuh)
-- Tiap kementerian punya variasi +-1 dari level dasar; kementerian militer +1 untuk kekuatan militer besar,
-- pariwisata +1 untuk negara tujuan wisata (tetap dibatasi dalam rentang statusnya).

DROP TABLE IF EXISTS `database_level_kabinet`;
CREATE TABLE IF NOT EXISTS `database_level_kabinet` (
  `id` INT PRIMARY KEY,
  `country` VARCHAR(100) NOT NULL,
  `country_slug` VARCHAR(100) NOT NULL,
  `kem_infrastruktur` INT DEFAULT 0,
  `kem_pendidikan` INT DEFAULT 0,
  `kem_sains` INT DEFAULT 0,
  `kem_kesehatan` INT DEFAULT 0,
  `kem_olahraga` INT DEFAULT 0,
  `kem_kehakiman` INT DEFAULT 0,
  `kem_luar_negeri` INT DEFAULT 0,
  `kem_kebudayaan` INT DEFAULT 0,
  `kem_pariwisata` INT DEFAULT 0,
  `kem_lingkungan` INT DEFAULT 0,
  `kem_perumahan` INT DEFAULT 0,
  `kem_pembangunan` INT DEFAULT 0,
  `kem_perdagangan` INT DEFAULT 0,
  `kem_keuangan` INT DEFAULT 0,
  `keamanan_pertahanan` INT DEFAULT 0,
  `keamanan_dinas_keamanan` INT DEFAULT 0,
  `keamanan_polisi` INT DEFAULT 0,
  `keamanan_garda_nasional` INT DEFAULT 0,
  `keamanan_komandan_angkatan_darat` INT DEFAULT 0,
  `keamanan_komandan_armada` INT DEFAULT 0,
  `layanan_darurat` INT DEFAULT 0,
  `layanan_bank_sentral` INT DEFAULT 0
);

INSERT INTO `database_level_kabinet` (
  `id`, `country`, `country_slug`, `kem_infrastruktur`, `kem_pendidikan`, `kem_sains`, `kem_kesehatan`, `kem_olahraga`, `kem_kehakiman`, `kem_luar_negeri`, `kem_kebudayaan`, `kem_pariwisata`, `kem_lingkungan`, `kem_perumahan`, `kem_pembangunan`, `kem_perdagangan`, `kem_keuangan`, `keamanan_pertahanan`, `keamanan_dinas_keamanan`, `keamanan_polisi`, `keamanan_garda_nasional`, `keamanan_komandan_angkatan_darat`, `keamanan_komandan_armada`, `layanan_darurat`, `layanan_bank_sentral`
) VALUES
(1, 'Afrika Selatan', 'afrika_selatan', 3, 4, 4, 5, 3, 4, 4, 4, 5, 4, 4, 5, 5, 4, 4, 4, 3, 5, 4, 5, 4, 4), -- Berkembang
(2, 'Aljazair', 'aljazair', 4, 4, 5, 5, 5, 5, 4, 3, 4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 4, 4, 4, 4), -- Berkembang
(3, 'Angola', 'angola', 2, 3, 4, 3, 3, 4, 3, 3, 4, 3, 3, 2, 3, 2, 2, 3, 4, 2, 3, 3, 3, 3), -- Berkembang
(4, 'Benin', 'benin', 3, 2, 2, 2, 3, 3, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 2, 1, 2, 2, 2, 2), -- Miskin
(5, 'Botswana', 'botswana', 4, 5, 4, 4, 4, 5, 5, 4, 5, 5, 4, 5, 3, 4, 5, 4, 4, 5, 5, 5, 4, 3), -- Berkembang
(6, 'Burkina faso', 'burkina_faso', 2, 2, 1, 2, 2, 2, 1, 1, 2, 3, 1, 3, 2, 2, 3, 3, 2, 2, 1, 2, 2, 3), -- Miskin
(7, 'Burundi', 'burundi', 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 2), -- Miskin
(8, 'Chad', 'chad', 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1), -- Miskin
(9, 'Djibouti', 'djibouti', 3, 1, 2, 3, 2, 3, 1, 2, 3, 1, 2, 3, 2, 3, 1, 3, 2, 2, 2, 1, 2, 2), -- Miskin
(10, 'Eritrea', 'eritrea', 1, 1, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 2, 2, 1, 1, 2, 2, 1, 2, 1), -- Miskin
(11, 'Eswatini', 'eswatini', 2, 3, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 4, 2, 3, 4, 3, 2, 3, 3), -- Berkembang
(12, 'Ethiopia', 'ethiopia', 2, 3, 2, 2, 2, 1, 2, 3, 3, 2, 1, 1, 1, 1, 2, 2, 3, 2, 3, 2, 2, 2), -- Miskin
(13, 'Gabon', 'gabon', 5, 4, 4, 4, 5, 5, 4, 5, 4, 5, 4, 5, 4, 4, 4, 3, 4, 4, 5, 5, 3, 5), -- Berkembang
(14, 'Gambia', 'gambia', 2, 3, 2, 2, 2, 2, 1, 2, 1, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 2), -- Miskin
(15, 'Ghana', 'ghana', 3, 4, 3, 3, 3, 2, 2, 3, 3, 3, 3, 4, 3, 4, 3, 3, 4, 3, 3, 3, 4, 3), -- Berkembang
(16, 'Guinea', 'guinea', 2, 1, 3, 2, 3, 2, 3, 3, 3, 2, 3, 3, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2), -- Miskin
(17, 'Guinea bissau', 'guinea_bissau', 1, 2, 1, 3, 3, 3, 3, 2, 3, 2, 1, 2, 2, 1, 2, 3, 1, 2, 3, 2, 2, 3), -- Miskin
(18, 'Kamerun', 'kamerun', 3, 4, 3, 3, 2, 3, 2, 3, 3, 3, 2, 3, 4, 2, 3, 3, 3, 4, 2, 3, 2, 3), -- Berkembang
(19, 'Kenya', 'kenya', 3, 3, 4, 4, 4, 4, 2, 3, 2, 3, 2, 4, 3, 4, 3, 2, 3, 3, 3, 2, 3, 2), -- Berkembang
(20, 'Komoro', 'komoro', 3, 2, 3, 2, 2, 2, 2, 2, 3, 1, 2, 3, 2, 2, 2, 1, 3, 1, 2, 2, 3, 2), -- Miskin
(21, 'Kongo', 'kongo', 3, 3, 3, 4, 3, 4, 3, 2, 4, 3, 3, 3, 4, 3, 4, 3, 2, 3, 3, 2, 3, 4), -- Berkembang
(22, 'Lesotho', 'lesotho', 2, 3, 2, 1, 2, 2, 3, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 3, 3, 3, 3, 2), -- Miskin
(23, 'Liberia', 'liberia', 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 1), -- Miskin
(24, 'Libya', 'libya', 3, 3, 3, 3, 2, 3, 3, 2, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 2, 3, 3), -- Berkembang
(25, 'Madagaskar', 'madagaskar', 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1), -- Miskin
(26, 'Malawi', 'malawi', 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 2), -- Miskin
(27, 'Mali', 'mali', 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 1, 1), -- Miskin
(28, 'Maroko', 'maroko', 2, 3, 4, 3, 2, 4, 3, 2, 4, 2, 4, 4, 2, 3, 3, 3, 3, 2, 2, 2, 2, 3), -- Berkembang
(29, 'Mauritania', 'mauritania', 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 1, 2, 2, 3, 2, 3, 1, 1, 3), -- Miskin
(30, 'Mauritius', 'mauritius', 4, 4, 5, 3, 4, 5, 4, 3, 5, 4, 4, 5, 4, 5, 4, 4, 5, 4, 3, 5, 4, 3), -- Berkembang
(31, 'Mesir', 'mesir', 2, 3, 3, 2, 2, 3, 2, 4, 4, 2, 4, 3, 4, 4, 4, 3, 2, 4, 4, 4, 3, 2), -- Berkembang
(32, 'Mozambik', 'mozambik', 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2), -- Miskin
(33, 'Namibia', 'namibia', 3, 3, 3, 3, 3, 3, 2, 4, 2, 2, 2, 3, 3, 4, 3, 2, 3, 2, 4, 4, 3, 3), -- Berkembang
(34, 'Niger', 'niger', 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1), -- Miskin
(35, 'Nigeria', 'nigeria', 3, 3, 3, 3, 2, 3, 3, 4, 2, 3, 3, 2, 2, 3, 2, 2, 4, 3, 2, 2, 3, 4), -- Berkembang
(36, 'Pantai gading', 'pantai_gading', 3, 4, 2, 2, 4, 3, 4, 4, 3, 4, 3, 2, 4, 4, 3, 4, 3, 4, 4, 4, 4, 3), -- Berkembang
(37, 'Republik afrika tengah', 'republik_afrika_tengah', 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1), -- Miskin
(38, 'Republik demokratik kongo', 'republik_demokratik_kongo', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1), -- Miskin
(39, 'Republik sudan', 'republik_sudan', 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1), -- Miskin
(40, 'Republik tanzania', 'republik_tanzania', 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2), -- Miskin
(41, 'Republik uganda', 'republik_uganda', 1, 2, 1, 3, 2, 1, 2, 2, 3, 2, 3, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2), -- Miskin
(42, 'Republik zambia', 'republik_zambia', 3, 2, 3, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 2, 2, 3, 2, 2, 1, 2, 1), -- Miskin
(43, 'Republik zimbabwe', 'republik_zimbabwe', 1, 2, 2, 2, 2, 2, 1, 2, 1, 2, 2, 2, 2, 3, 2, 2, 3, 3, 2, 2, 3, 2), -- Miskin
(44, 'Rwanda', 'rwanda', 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 2, 2, 3, 3, 1, 2, 1, 2, 2, 3, 2, 1), -- Miskin
(45, 'Sao tome dan principe', 'sao_tome_dan_principe', 1, 1, 1, 2, 1, 2, 2, 3, 2, 2, 2, 3, 1, 1, 2, 1, 2, 1, 1, 3, 3, 2), -- Miskin
(46, 'Senegal', 'senegal', 2, 2, 1, 2, 1, 2, 3, 1, 3, 3, 2, 3, 1, 2, 2, 3, 2, 1, 2, 2, 3, 2), -- Miskin
(47, 'Seychelles', 'seychelles', 5, 4, 5, 5, 5, 5, 4, 6, 6, 6, 5, 6, 6, 5, 5, 6, 5, 5, 5, 5, 5, 6), -- Maju
(48, 'Sierra leone', 'sierra_leone', 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1), -- Miskin
(49, 'Somalia', 'somalia', 2, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1), -- Miskin
(50, 'Sudan selatan', 'sudan_selatan', 1, 1, 1, 1, 1, 2, 1, 2, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 2), -- Miskin
(51, 'Tanjung verde', 'tanjung_verde', 3, 2, 3, 3, 3, 3, 2, 3, 3, 4, 4, 4, 2, 3, 3, 3, 2, 4, 3, 2, 4, 3), -- Berkembang
(52, 'Togo', 'togo', 3, 2, 3, 2, 3, 2, 1, 2, 3, 1, 2, 1, 2, 2, 3, 2, 2, 3, 2, 3, 3, 2), -- Miskin
(53, 'Tunisia', 'tunisia', 3, 3, 3, 2, 3, 4, 3, 2, 2, 3, 2, 3, 2, 4, 3, 3, 3, 3, 3, 2, 3, 2), -- Berkembang
(54, 'Afganistan', 'afganistan', 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 1, 1, 1, 2, 1), -- Miskin
(55, 'Arab Saudi', 'arab_saudi', 6, 5, 6, 5, 5, 6, 6, 4, 5, 6, 6, 5, 5, 4, 6, 6, 4, 6, 6, 6, 5, 6), -- Maju
(56, 'Armenia', 'armenia', 4, 3, 3, 4, 3, 4, 2, 4, 3, 3, 3, 3, 4, 4, 3, 3, 3, 2, 4, 3, 3, 3), -- Berkembang
(57, 'Azerbaijan', 'azerbaijan', 4, 3, 4, 5, 4, 5, 4, 4, 5, 4, 5, 4, 5, 5, 4, 5, 3, 4, 4, 5, 4, 3), -- Berkembang
(58, 'Bahrain', 'bahrain', 6, 6, 6, 5, 5, 5, 5, 6, 5, 5, 4, 5, 5, 5, 5, 6, 5, 6, 5, 5, 5, 5), -- Maju
(59, 'Bangladesh', 'bangladesh', 3, 3, 3, 2, 3, 3, 3, 3, 3, 4, 4, 3, 3, 3, 3, 4, 4, 3, 2, 2, 3, 2), -- Berkembang
(60, 'Bhutan', 'bhutan', 2, 3, 3, 3, 3, 4, 2, 3, 4, 4, 3, 2, 2, 4, 4, 3, 4, 4, 4, 3, 3, 3), -- Berkembang
(61, 'Brunei', 'brunei', 4, 5, 4, 4, 6, 5, 5, 5, 5, 5, 5, 5, 5, 6, 5, 5, 5, 5, 5, 5, 5, 6), -- Maju
(62, 'China', 'china', 3, 5, 4, 3, 5, 4, 4, 4, 3, 4, 3, 5, 5, 3, 5, 3, 3, 4, 4, 5, 4, 3), -- Berkembang
(63, 'Filipina', 'filipina', 4, 3, 3, 4, 2, 3, 2, 3, 4, 3, 3, 3, 2, 3, 3, 4, 4, 3, 3, 2, 2, 2), -- Berkembang
(64, 'Georgia', 'georgia', 4, 5, 3, 4, 4, 3, 3, 3, 3, 4, 3, 4, 3, 5, 3, 4, 5, 3, 5, 4, 3, 4), -- Berkembang
(65, 'Hong kong', 'hong_kong', 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 5, 6, 6), -- Maju
(66, 'India', 'india', 4, 2, 3, 4, 3, 4, 4, 4, 3, 3, 3, 3, 4, 2, 4, 4, 4, 3, 4, 4, 3, 4), -- Berkembang
(67, 'Indonesia', 'indonesia', 4, 3, 2, 3, 2, 3, 3, 4, 4, 3, 2, 3, 4, 3, 3, 4, 3, 2, 2, 3, 3, 4), -- Berkembang
(68, 'Irak', 'irak', 2, 3, 3, 2, 3, 2, 2, 3, 2, 2, 3, 3, 4, 4, 3, 3, 3, 2, 2, 4, 2, 4), -- Berkembang
(69, 'Iran', 'iran', 3, 3, 2, 2, 2, 4, 2, 2, 3, 3, 3, 2, 3, 4, 4, 4, 4, 4, 4, 4, 4, 3), -- Berkembang
(70, 'Israel', 'israel', 5, 6, 5, 6, 6, 5, 5, 6, 6, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(71, 'Jepang', 'jepang', 6, 6, 5, 6, 6, 5, 6, 6, 5, 5, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(72, 'Kamboja', 'kamboja', 1, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 3, 3, 1, 2, 1, 2, 1, 2, 2, 1), -- Miskin
(73, 'Kazakhstan', 'kazakhstan', 4, 3, 4, 5, 5, 5, 4, 4, 5, 3, 4, 4, 4, 3, 4, 5, 4, 5, 3, 3, 4, 5), -- Berkembang
(74, 'Kirgizstan', 'kirgizstan', 2, 2, 2, 2, 3, 3, 2, 2, 2, 1, 2, 1, 3, 2, 2, 2, 2, 3, 2, 3, 1, 2), -- Miskin
(75, 'Korea Selatan', 'korea_selatan', 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(76, 'Korea Utara', 'korea_utara', 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 1, 1), -- Miskin
(77, 'Kuwait', 'kuwait', 6, 6, 6, 5, 5, 4, 5, 5, 6, 5, 5, 5, 4, 5, 4, 5, 6, 5, 4, 4, 5, 5), -- Maju
(78, 'Laos', 'laos', 2, 2, 2, 3, 2, 2, 1, 1, 2, 2, 2, 2, 1, 3, 3, 1, 1, 2, 3, 2, 3, 3), -- Miskin
(79, 'Lebanon', 'lebanon', 1, 2, 2, 1, 2, 1, 2, 2, 3, 2, 2, 1, 2, 2, 2, 3, 2, 1, 2, 2, 2, 2), -- Miskin
(80, 'Makau', 'makau', 6, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 5, 6, 6, 5, 6, 5, 5, 6), -- Maju
(81, 'Malaysia', 'malaysia', 4, 4, 4, 5, 3, 5, 4, 3, 5, 3, 4, 4, 4, 4, 3, 5, 3, 4, 4, 3, 3, 4), -- Berkembang
(82, 'Maldives', 'maldives', 3, 4, 4, 4, 3, 3, 4, 4, 5, 4, 5, 4, 5, 4, 3, 5, 3, 4, 5, 4, 3, 5), -- Berkembang
(83, 'Mongolia', 'mongolia', 3, 3, 3, 3, 3, 4, 2, 3, 3, 3, 4, 3, 4, 2, 4, 2, 4, 3, 3, 3, 3, 4), -- Berkembang
(84, 'Myanmar', 'myanmar', 2, 1, 2, 1, 2, 2, 2, 1, 2, 1, 1, 1, 2, 2, 1, 2, 2, 1, 1, 1, 1, 1), -- Miskin
(85, 'Nepal', 'nepal', 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 2, 3, 3, 3, 2, 2, 3, 2, 2, 2, 2, 1), -- Miskin
(86, 'Oman', 'oman', 5, 5, 5, 5, 5, 5, 5, 5, 6, 5, 5, 6, 4, 5, 5, 5, 4, 5, 6, 5, 5, 5), -- Maju
(87, 'Pakistan', 'pakistan', 2, 2, 2, 3, 1, 2, 2, 2, 3, 1, 2, 3, 2, 2, 3, 2, 2, 3, 3, 3, 2, 1), -- Miskin
(88, 'Palestina', 'palestina', 2, 2, 2, 1, 2, 2, 1, 2, 3, 3, 2, 1, 2, 2, 2, 2, 3, 2, 2, 2, 2, 2), -- Miskin
(89, 'Qatar', 'qatar', 6, 6, 5, 6, 5, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6), -- Maju
(90, 'Republik timor leste', 'republik_timor_leste', 2, 2, 3, 2, 2, 1, 2, 3, 2, 2, 2, 1, 1, 3, 3, 1, 3, 2, 1, 3, 3, 1), -- Miskin
(91, 'Singapura', 'singapura', 5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 5), -- Maju
(92, 'Sri lanka', 'sri_lanka', 3, 4, 3, 3, 4, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 4, 3, 3, 3, 2, 3), -- Berkembang
(93, 'Suriah', 'suriah', 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1), -- Miskin
(94, 'Taiwan', 'taiwan', 5, 5, 6, 6, 6, 5, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(95, 'Tajikistan', 'tajikistan', 2, 2, 2, 3, 2, 2, 1, 3, 1, 2, 1, 3, 2, 3, 3, 3, 3, 2, 1, 1, 2, 2), -- Miskin
(96, 'Thailand', 'thailand', 5, 3, 4, 3, 5, 4, 4, 4, 5, 5, 5, 5, 5, 3, 4, 5, 4, 5, 5, 3, 4, 4), -- Berkembang
(97, 'Turkmenistan', 'turkmenistan', 3, 3, 4, 4, 2, 4, 4, 3, 2, 3, 2, 2, 3, 2, 4, 3, 3, 3, 4, 2, 3, 4), -- Berkembang
(98, 'Uni emirat arab', 'uni_emirat_arab', 6, 5, 6, 6, 6, 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6), -- Maju
(99, 'Uzbekistan', 'uzbekistan', 3, 2, 4, 3, 3, 3, 3, 4, 4, 3, 2, 2, 4, 3, 3, 3, 4, 2, 3, 3, 3, 2), -- Berkembang
(100, 'Vietnam', 'vietnam', 3, 2, 3, 4, 3, 4, 3, 4, 4, 2, 3, 4, 2, 4, 3, 3, 3, 3, 3, 3, 3, 3), -- Berkembang
(101, 'Yaman', 'yaman', 1, 1, 2, 1, 2, 1, 1, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1), -- Miskin
(102, 'Yordania', 'yordania', 3, 4, 3, 2, 3, 4, 2, 3, 2, 3, 3, 3, 3, 3, 3, 2, 3, 4, 4, 3, 4, 3), -- Berkembang
(103, 'Albania', 'albania', 4, 4, 4, 4, 3, 3, 3, 4, 3, 4, 3, 4, 4, 3, 4, 4, 4, 5, 4, 3, 4, 4), -- Berkembang
(104, 'Andorra', 'andorra', 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6), -- Maju
(105, 'Austria', 'austria', 6, 6, 6, 5, 6, 5, 6, 5, 6, 6, 6, 6, 5, 6, 5, 6, 6, 5, 6, 6, 6, 6), -- Maju
(106, 'Belanda', 'belanda', 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6), -- Maju
(107, 'Belarus', 'belarus', 5, 4, 4, 4, 4, 4, 4, 3, 4, 4, 5, 5, 4, 4, 4, 3, 5, 5, 4, 3, 5, 3), -- Berkembang
(108, 'Belgia', 'belgia', 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(109, 'Bosnia dan hercegovina', 'bosnia_dan_hercegovina', 2, 3, 4, 3, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 4, 2, 3, 2, 4, 2, 3, 2), -- Berkembang
(110, 'Bulgaria', 'bulgaria', 4, 3, 4, 4, 4, 4, 5, 4, 3, 4, 4, 5, 3, 4, 4, 3, 4, 4, 5, 4, 4, 5), -- Berkembang
(111, 'Ceko', 'ceko', 6, 5, 5, 6, 5, 5, 6, 4, 5, 5, 4, 5, 4, 6, 5, 6, 6, 4, 6, 4, 6, 5), -- Maju
(112, 'Denmark', 'denmark', 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 5, 6, 5, 6, 6), -- Maju
(113, 'Estonia', 'estonia', 6, 6, 6, 5, 5, 4, 6, 5, 5, 5, 5, 5, 6, 4, 5, 4, 5, 4, 5, 5, 5, 6), -- Maju
(114, 'Finlandia', 'finlandia', 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6, 6, 6, 5), -- Maju
(115, 'Gibraltar', 'gibraltar', 4, 5, 4, 5, 6, 5, 5, 5, 6, 5, 6, 4, 5, 5, 4, 6, 5, 4, 5, 5, 4, 5), -- Maju
(116, 'Hungaria', 'hungaria', 5, 5, 4, 4, 6, 5, 6, 6, 5, 6, 5, 5, 5, 5, 4, 4, 5, 4, 6, 4, 5, 5), -- Maju
(117, 'Inggris', 'inggris', 5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 5), -- Maju
(118, 'Irlandia', 'irlandia', 6, 6, 6, 6, 5, 6, 6, 5, 5, 5, 5, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6), -- Maju
(119, 'Islandia', 'islandia', 5, 5, 6, 5, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6), -- Maju
(120, 'Italia', 'italia', 4, 5, 6, 5, 5, 5, 5, 5, 6, 5, 6, 6, 5, 5, 6, 4, 6, 5, 6, 6, 6, 5), -- Maju
(121, 'Jerman', 'jerman', 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5), -- Maju
(122, 'Kepulauan faroe', 'kepulauan_faroe', 5, 5, 4, 4, 5, 6, 6, 5, 5, 4, 5, 5, 4, 5, 5, 4, 6, 6, 4, 6, 5, 6), -- Maju
(123, 'Kosovo', 'kosovo', 3, 4, 4, 3, 3, 3, 3, 3, 3, 2, 3, 2, 4, 3, 2, 3, 3, 3, 4, 3, 3, 3), -- Berkembang
(124, 'Kroasia', 'kroasia', 6, 4, 5, 4, 4, 4, 6, 5, 6, 6, 5, 4, 6, 6, 6, 5, 5, 4, 5, 5, 6, 5), -- Maju
(125, 'Latvia', 'latvia', 5, 4, 4, 5, 5, 4, 4, 5, 5, 5, 4, 5, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5), -- Maju
(126, 'Liechtenstein', 'liechtenstein', 5, 6, 6, 5, 6, 5, 6, 6, 6, 6, 5, 6, 5, 6, 5, 6, 6, 6, 6, 5, 6, 6), -- Maju
(127, 'Lithuania', 'lithuania', 4, 5, 4, 5, 6, 6, 5, 6, 4, 5, 5, 5, 4, 4, 4, 6, 4, 5, 4, 5, 5, 5), -- Maju
(128, 'Luksemburg', 'luksemburg', 5, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(129, 'Makedonia utara', 'makedonia_utara', 3, 4, 2, 2, 4, 4, 2, 4, 4, 3, 3, 3, 3, 2, 4, 3, 4, 3, 3, 3, 2, 4), -- Berkembang
(130, 'Malta', 'malta', 5, 5, 5, 5, 6, 5, 6, 5, 6, 5, 4, 5, 5, 5, 4, 4, 5, 5, 5, 4, 4, 6), -- Maju
(131, 'Moldova', 'moldova', 3, 3, 3, 4, 3, 3, 2, 4, 4, 3, 3, 3, 2, 3, 4, 3, 4, 3, 2, 3, 3, 3), -- Berkembang
(132, 'Monako', 'monako', 6, 6, 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6), -- Maju
(133, 'Montenegro', 'montenegro', 4, 5, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 5, 3, 5, 4, 5, 4, 4, 4, 4, 4), -- Berkembang
(134, 'Norwegia', 'norwegia', 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6), -- Maju
(135, 'Polandia', 'polandia', 6, 4, 6, 5, 5, 4, 5, 5, 5, 6, 4, 4, 5, 5, 6, 4, 5, 4, 5, 5, 5, 5), -- Maju
(136, 'Portugal', 'portugal', 6, 5, 6, 6, 6, 5, 5, 5, 6, 5, 5, 6, 6, 5, 6, 4, 5, 5, 5, 6, 5, 5), -- Maju
(137, 'Prancis', 'prancis', 5, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(138, 'Republik rumania', 'republik_rumania', 4, 4, 4, 4, 4, 3, 4, 3, 4, 5, 4, 4, 4, 4, 4, 3, 4, 4, 3, 5, 4, 3), -- Berkembang
(139, 'Republik serbia', 'republik_serbia', 4, 5, 3, 3, 4, 5, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 3, 4, 4, 4, 5, 4), -- Berkembang
(140, 'Rusia', 'rusia', 5, 5, 4, 4, 5, 5, 4, 4, 5, 4, 4, 4, 4, 4, 5, 4, 4, 5, 4, 5, 4, 4), -- Berkembang
(141, 'San marino', 'san_marino', 4, 4, 5, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5, 5, 4, 5, 4, 4, 6, 5, 6, 5), -- Maju
(142, 'Siprus', 'siprus', 5, 6, 5, 5, 6, 4, 6, 5, 6, 5, 5, 5, 6, 5, 6, 6, 5, 5, 5, 4, 4, 5), -- Maju
(143, 'Slovenia', 'slovenia', 5, 5, 5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 5, 6, 5, 4, 5, 4, 5, 4, 4, 5), -- Maju
(144, 'Slowakia', 'slowakia', 5, 5, 6, 5, 6, 5, 5, 5, 5, 5, 5, 6, 4, 6, 5, 6, 5, 5, 6, 4, 6, 6), -- Maju
(145, 'Spanyol', 'spanyol', 5, 6, 5, 6, 6, 5, 5, 5, 6, 5, 5, 5, 5, 4, 4, 5, 6, 5, 4, 4, 4, 6), -- Maju
(146, 'Swedia', 'swedia', 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6), -- Maju
(147, 'Swiss', 'swiss', 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 5, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6), -- Maju
(148, 'Turki', 'turki', 3, 4, 4, 4, 3, 5, 4, 4, 5, 3, 3, 4, 3, 4, 5, 4, 3, 5, 5, 5, 3, 5), -- Berkembang
(149, 'Ukraina', 'ukraina', 3, 4, 3, 3, 3, 2, 3, 3, 4, 4, 3, 4, 2, 3, 4, 3, 3, 3, 3, 4, 3, 2), -- Berkembang
(150, 'Vatikan', 'vatikan', 5, 4, 6, 6, 5, 6, 5, 5, 5, 5, 4, 6, 6, 6, 5, 6, 5, 5, 4, 6, 5, 6), -- Maju
(151, 'Yunani', 'yunani', 5, 4, 5, 5, 5, 5, 4, 6, 5, 6, 5, 5, 4, 5, 5, 5, 6, 5, 6, 5, 6, 4), -- Maju
(152, 'Amerika Serikat', 'amerika_serikat', 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 5, 6), -- Maju
(153, 'Antigua dan Barbuda', 'antigua_dan_barbuda', 5, 4, 4, 3, 3, 4, 5, 4, 5, 4, 3, 4, 4, 4, 4, 4, 4, 3, 5, 3, 4, 5), -- Berkembang
(154, 'Bahama', 'bahama', 6, 5, 5, 6, 4, 5, 5, 5, 6, 5, 5, 5, 6, 4, 6, 5, 6, 5, 4, 6, 5, 6), -- Maju
(155, 'Barbados', 'barbados', 5, 4, 5, 5, 4, 5, 6, 6, 6, 6, 5, 4, 6, 5, 5, 5, 4, 6, 5, 4, 6, 5), -- Maju
(156, 'Belize', 'belize', 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 3, 4, 3, 3), -- Berkembang
(157, 'Bermuda', 'bermuda', 5, 6, 5, 6, 6, 6, 6, 5, 5, 6, 5, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(158, 'Costa rica', 'costa_rica', 5, 5, 4, 4, 4, 4, 4, 5, 5, 5, 4, 4, 5, 3, 5, 3, 4, 4, 4, 5, 4, 3), -- Berkembang
(159, 'Curacao', 'curacao', 5, 5, 4, 5, 5, 5, 5, 5, 5, 6, 5, 6, 5, 4, 4, 5, 6, 5, 5, 4, 5, 6), -- Maju
(160, 'Dominika', 'dominika', 3, 3, 3, 3, 3, 4, 3, 2, 4, 3, 2, 2, 3, 4, 4, 4, 3, 4, 3, 3, 3, 2), -- Berkembang
(161, 'El salvador', 'el_salvador', 4, 2, 2, 4, 3, 4, 3, 4, 4, 3, 3, 4, 4, 3, 4, 3, 3, 3, 3, 4, 4, 4), -- Berkembang
(162, 'Greenland', 'greenland', 5, 6, 6, 6, 5, 5, 4, 5, 5, 6, 4, 4, 6, 6, 5, 5, 4, 6, 5, 5, 5, 6), -- Maju
(163, 'Grenada', 'grenada', 3, 5, 3, 5, 5, 5, 5, 5, 5, 5, 4, 5, 3, 4, 3, 4, 5, 5, 5, 5, 4, 4), -- Berkembang
(164, 'Guatemala', 'guatemala', 3, 4, 4, 3, 2, 3, 3, 3, 3, 2, 4, 4, 3, 3, 4, 4, 3, 3, 3, 3, 2, 3), -- Berkembang
(165, 'Haiti', 'haiti', 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1), -- Miskin
(166, 'Honduras', 'honduras', 2, 2, 3, 1, 3, 3, 3, 3, 3, 2, 2, 2, 3, 1, 2, 2, 1, 2, 1, 3, 1, 3), -- Miskin
(167, 'Jamaika', 'jamaika', 3, 4, 3, 3, 3, 3, 4, 2, 4, 3, 3, 3, 4, 4, 3, 3, 4, 3, 3, 2, 3, 4), -- Berkembang
(168, 'Kanada', 'kanada', 6, 5, 5, 6, 5, 5, 6, 6, 5, 6, 6, 5, 6, 5, 5, 6, 6, 6, 6, 6, 6, 5), -- Maju
(169, 'Kuba', 'kuba', 4, 2, 2, 4, 4, 3, 3, 2, 3, 3, 3, 4, 3, 3, 4, 3, 4, 3, 3, 2, 3, 2), -- Berkembang
(170, 'Meksiko', 'meksiko', 3, 3, 4, 4, 4, 4, 4, 4, 5, 4, 3, 4, 5, 3, 3, 3, 5, 4, 5, 3, 4, 5), -- Berkembang
(171, 'Nikaragua', 'nikaragua', 1, 2, 3, 1, 2, 2, 3, 2, 3, 3, 2, 3, 2, 2, 2, 3, 2, 1, 2, 2, 2, 1), -- Miskin
(172, 'Panama', 'panama', 3, 5, 4, 5, 5, 4, 3, 4, 5, 4, 5, 4, 4, 4, 4, 3, 4, 3, 4, 3, 4, 4), -- Berkembang
(173, 'Puerto rico', 'puerto_rico', 6, 6, 5, 5, 4, 4, 5, 6, 6, 5, 6, 5, 5, 5, 4, 5, 6, 4, 6, 6, 5, 4), -- Maju
(174, 'Republik dominika', 'republik_dominika', 4, 3, 3, 4, 4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 4, 4, 5, 3, 4, 4, 4, 5), -- Berkembang
(175, 'Saint kitts dan nevis', 'saint_kitts_dan_nevis', 5, 5, 6, 5, 5, 6, 5, 6, 4, 5, 5, 5, 5, 4, 5, 5, 5, 6, 6, 5, 6, 6), -- Maju
(176, 'Saint lucia', 'saint_lucia', 4, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 5, 3, 4, 4, 4, 5, 4, 4, 4, 4, 4), -- Berkembang
(177, 'Saint vincent dan grenadine', 'saint_vincent_dan_grenadine', 4, 3, 4, 4, 5, 4, 5, 3, 5, 4, 5, 3, 4, 5, 4, 4, 4, 5, 5, 4, 4, 4), -- Berkembang
(178, 'Trinidad dan tobago', 'trinidad_dan_tobago', 3, 4, 4, 5, 4, 3, 4, 4, 4, 4, 3, 5, 3, 5, 4, 5, 4, 4, 4, 5, 4, 4), -- Berkembang
(179, 'Australia', 'australia', 7, 5, 7, 6, 6, 6, 6, 7, 6, 4, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
(180, 'Fiji', 'fiji', 3, 3, 4, 3, 3, 2, 2, 3, 4, 3, 3, 3, 3, 2, 2, 4, 3, 3, 3, 2, 3, 2), -- Berkembang
(181, 'Guam', 'guam', 4, 4, 6, 4, 5, 5, 5, 5, 4, 6, 5, 6, 4, 6, 5, 4, 4, 5, 4, 4, 6, 5), -- Maju
(182, 'Kiribati', 'kiribati', 2, 2, 2, 3, 2, 2, 2, 1, 2, 3, 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 3, 1), -- Miskin
(183, 'Marshall', 'marshall', 3, 3, 4, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 2, 2, 2, 3, 4, 3, 3), -- Berkembang
(184, 'Mikronesia', 'mikronesia', 2, 2, 2, 2, 1, 2, 2, 2, 2, 3, 2, 1, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2), -- Miskin
(185, 'Nauru', 'nauru', 2, 2, 3, 2, 2, 3, 3, 3, 4, 3, 4, 2, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3), -- Berkembang
(186, 'Palau', 'palau', 4, 3, 4, 3, 4, 5, 3, 4, 5, 5, 3, 4, 4, 3, 4, 4, 4, 4, 5, 3, 3, 4), -- Berkembang
(187, 'Papua nugini', 'papua_nugini', 1, 3, 1, 3, 1, 1, 2, 2, 1, 2, 2, 2, 2, 1, 1, 2, 3, 3, 3, 2, 2, 1), -- Miskin
(188, 'Samoa', 'samoa', 4, 2, 3, 3, 4, 3, 2, 3, 3, 2, 2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 2), -- Berkembang
(189, 'Samoa amerika', 'samoa_amerika', 4, 4, 4, 4, 4, 5, 5, 4, 3, 5, 4, 5, 4, 4, 5, 4, 4, 5, 5, 5, 3, 4), -- Berkembang
(190, 'Selandia baru', 'selandia_baru', 5, 6, 6, 6, 6, 6, 6, 5, 5, 6, 6, 6, 6, 6, 5, 5, 6, 6, 6, 5, 6, 6), -- Maju
(191, 'Tahiti', 'tahiti', 5, 5, 4, 4, 5, 5, 5, 5, 5, 4, 4, 6, 6, 4, 5, 6, 5, 4, 4, 5, 6, 5), -- Maju
(192, 'Tonga', 'tonga', 2, 2, 3, 3, 3, 2, 3, 4, 4, 2, 4, 3, 3, 3, 3, 3, 4, 3, 3, 2, 2, 4), -- Berkembang
(193, 'Tuvalu', 'tuvalu', 3, 3, 3, 4, 2, 4, 3, 2, 3, 4, 3, 3, 3, 2, 3, 3, 4, 2, 4, 4, 3, 3), -- Berkembang
(194, 'Vanuatu', 'vanuatu', 2, 3, 3, 3, 2, 3, 3, 1, 2, 2, 1, 2, 3, 3, 2, 2, 2, 1, 2, 3, 2, 2), -- Miskin
(195, 'Argentina', 'argentina', 4, 4, 3, 4, 3, 4, 5, 3, 4, 4, 4, 4, 4, 5, 4, 4, 4, 5, 4, 4, 3, 4), -- Berkembang
(196, 'Bolivia', 'bolivia', 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 4, 3, 3), -- Berkembang
(197, 'Brazil', 'brazil', 4, 3, 4, 4, 4, 4, 5, 4, 4, 3, 5, 5, 3, 4, 5, 4, 5, 5, 5, 5, 5, 4), -- Berkembang
(198, 'Chile', 'chile', 5, 4, 5, 6, 6, 4, 4, 5, 5, 5, 6, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5), -- Maju
(199, 'Ekuador', 'ekuador', 3, 2, 3, 3, 2, 2, 4, 4, 3, 3, 3, 3, 3, 2, 3, 3, 4, 3, 3, 3, 4, 3), -- Berkembang
(200, 'Guiana prancis', 'guiana_prancis', 5, 5, 4, 6, 6, 5, 5, 5, 5, 6, 4, 4, 6, 5, 4, 5, 5, 5, 6, 5, 5, 5), -- Maju
(201, 'Guyana', 'guyana', 4, 5, 4, 4, 5, 5, 4, 3, 4, 4, 3, 4, 4, 4, 4, 5, 4, 4, 4, 5, 3, 4), -- Berkembang
(202, 'Kolombia', 'kolombia', 3, 4, 4, 4, 4, 4, 4, 4, 5, 4, 4, 3, 4, 4, 4, 4, 5, 4, 4, 3, 5, 4), -- Berkembang
(203, 'Paraguay', 'paraguay', 4, 3, 3, 3, 4, 3, 4, 3, 2, 2, 3, 4, 3, 3, 2, 3, 3, 3, 3, 3, 3, 3), -- Berkembang
(204, 'Peru', 'peru', 5, 5, 4, 4, 3, 4, 5, 3, 4, 4, 4, 4, 5, 4, 4, 4, 4, 4, 4, 4, 4, 5), -- Berkembang
(205, 'Suriname', 'suriname', 4, 3, 3, 4, 3, 2, 3, 3, 3, 2, 3, 3, 3, 4, 3, 3, 3, 3, 3, 3, 3, 2), -- Berkembang
(206, 'Uruguay', 'uruguay', 4, 5, 5, 6, 5, 5, 5, 5, 5, 6, 6, 6, 4, 5, 5, 6, 6, 4, 5, 6, 5, 6), -- Maju
(207, 'Venezuela', 'venezuela', 1, 1, 3, 1, 2, 2, 2, 2, 1, 2, 2, 1, 2, 1, 2, 3, 3, 2, 1, 2, 2, 2); -- Miskin