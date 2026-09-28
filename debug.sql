SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE DATABASE IF NOT EXISTS db_presiden_simulator;
USE db_presiden_simulator;

DROP TABLE IF EXISTS `database_profiles_negara`;
CREATE TABLE `database_profiles_negara` (
  `id` int(11) NOT NULL,
  `country_slug` varchar(100) NOT NULL,
  `name_id` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `capital` varchar(100) NOT NULL,
  `lon` decimal(9,6) NOT NULL,
  `lat` decimal(9,6) NOT NULL,
  `flag` varchar(10) NOT NULL,
  `jumlah_penduduk` bigint(20) NOT NULL,
  `anggaran` bigint(20) NOT NULL,
  `pendapatan_nasional` bigint(20) NOT NULL,
  `religion` varchar(100) NOT NULL,
  `ideology` varchar(100) NOT NULL,
  `un_vote` int(11) NOT NULL,
  `reputasi_diplomatik` varchar(100) NOT NULL,
  `pengaruh_global` int(11) NOT NULL,
  `peringkat_diplomasi` int(11) NOT NULL,
  `sikap` varchar(100) NOT NULL,
  `kekuatan_lunak` int(11) NOT NULL,
  `kekuatan_keras` int(11) NOT NULL,
  `prestise_diplomatik` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `database_profiles_negara` (`id`, `country_slug`, `name_id`, `name_en`, `capital`, `lon`, `lat`, `flag`, `jumlah_penduduk`, `anggaran`, `pendapatan_nasional`, `religion`, `ideology`, `un_vote`, `reputasi_diplomatik`, `pengaruh_global`, `peringkat_diplomasi`, `sikap`, `kekuatan_lunak`, `kekuatan_keras`, `prestise_diplomatik`) VALUES
(1, 'afrika_selatan', 'Afrika Selatan', 'South Africa', 'Pretoria', '28.180000', '-25.740000', '🇿🇦', 63100945, 3938, 11251, 'Protestan', 'Demokrasi', 188, 'Netral', 0, 100, 'Netral', 34, 7, 57),
(2, 'aljazair', 'Aljazair', 'Algeria', 'Algiers', '3.080000', '36.730000', '🇩🇿', 46700000, 2334, 6667, 'Islam', 'Nasionalisme', 84, 'Netral', 0, 100, 'Netral', 5, 14, 57),
(3, 'angola', 'Angola', 'Angola', 'Luanda', '13.230000', '-8.830000', '🇦🇴', 36749906, 826, 2361, 'Katolik', 'Demokrasi', 155, 'Netral', 0, 100, 'Netral', 37, 6, 57),
(4, 'benin', 'Benin', 'Benin', 'Porto-Novo', '2.250000', '9.500000', '🇧🇯', 14462724, 185, 528, 'Katolik', 'Demokrasi', 62, 'Netral', 0, 100, 'Netral', 1, 31, 57),
(5, 'botswana', 'Botswana', 'Botswana', 'Gaborone', '24.000000', '-22.000000', '🇧🇼', 2675352, 194, 556, 'Protestan', 'Demokrasi', 48, 'Netral', 0, 100, 'Netral', 13, 15, 57),
(6, 'burkina_faso', 'Burkina faso', 'Burkina Faso', 'Ouagadougou', '-2.000000', '13.000000', '🇧🇫', 23548781, 175, 500, 'Islam', 'Nasionalisme', 46, 'Netral', 0, 100, 'Netral', 15, 7, 57),
(7, 'burundi', 'Burundi', 'Burundi', 'Gitega', '30.000000', '-3.500000', '🇧🇮', 13238559, 34, 97, 'Katolik', 'Nasionalisme', 37, 'Netral', 0, 100, 'Netral', 9, 23, 57),
(8, 'chad', 'Chad', 'Chad', 'N''Djamena', '19.000000', '15.000000', '🇹🇩', 19319064, 117, 333, 'Islam', 'Nasionalisme', 58, 'Netral', 0, 100, 'Netral', 7, 23, 57),
(9, 'djibouti', 'Djibouti', 'Djibouti', 'Djibouti', '43.000000', '11.500000', '🇩🇯', 1168722, 39, 111, 'Islam', 'Nasionalisme', 13, 'Netral', 0, 100, 'Netral', 10, 3, 57),
(10, 'eritrea', 'Eritrea', 'Eritrea', 'Asmara', '39.000000', '15.000000', '🇪🇷', 3748901, 24, 69, 'Kristen Ortodoks', 'Nasionalisme', 47, 'Netral', 0, 100, 'Netral', 27, 6, 57),
(11, 'eswatini', 'Eswatini', 'Eswatini', 'Lobamba', '31.500000', '-26.500000', '🇸🇿', 1210822, 44, 125, 'Protestan', 'Monarki', 60, 'Netral', 0, 100, 'Netral', 19, 23, 57),
(12, 'ethiopia', 'Ethiopia', 'Ethiopia', 'Addis Ababa', '38.000000', '8.000000', '🇪🇹', 126527060, 1507, 4306, 'Kristen Ortodoks', 'Demokrasi', 70, 'Netral', 0, 100, 'Netral', 1, 14, 57),
(13, 'gabon', 'Gabon', 'Gabon', 'Libreville', '11.750000', '-1.000000', '🇬🇦', 2436566, 194, 556, 'Katolik', 'Nasionalisme', 73, 'Netral', 0, 100, 'Netral', 20, 13, 57),
(14, 'gambia', 'Gambia', 'Gambia', 'Banjul', '-16.566667', '13.466667', '🇬🇲', 2773168, 21, 61, 'Islam', 'Demokrasi', 116, 'Netral', 0, 100, 'Netral', 40, 17, 57),
(15, 'ghana', 'Ghana', 'Ghana', 'Accra', '-2.000000', '8.000000', '🇬🇭', 34121985, 739, 2111, 'Protestan', 'Demokrasi', 125, 'Netral', 0, 100, 'Netral', 17, 21, 57),
(16, 'guinea', 'Guinea', 'Guinea', 'Conakry', '-10.000000', '11.000000', '🇬🇳', 14754785, 175, 500, 'Islam', 'Nasionalisme', 49, 'Netral', 0, 100, 'Netral', 18, 5, 57),
(17, 'guinea_bissau', 'Guinea bissau', 'Guinea-Bissau', 'Bissau', '-15.000000', '12.000000', '🇬🇼', 2201541, 18, 50, 'Islam', 'Demokrasi', 100, 'Netral', 0, 100, 'Netral', 28, 30, 57),
(18, 'kamerun', 'Kamerun', 'Cameroon', 'Yaoundé', '12.000000', '6.000000', '🇨🇲', 28647293, 438, 1250, 'Katolik', 'Nasionalisme', 138, 'Netral', 0, 100, 'Netral', 26, 19, 57),
(19, 'kenya', 'Kenya', 'Kenya', 'Nairobi', '38.000000', '1.000000', '🇰🇪', 55100586, 1070, 3056, 'Protestan', 'Demokrasi', 169, 'Netral', 0, 100, 'Netral', 31, 18, 57),
(20, 'komoro', 'Komoro', 'Comoros', 'Moroni', '44.250000', '-12.166667', '🇰🇲', 852075, 13, 36, 'Islam', 'Demokrasi', 61, 'Netral', 0, 100, 'Netral', 24, 27, 57),
(21, 'kongo', 'Kongo', 'Republic of the Congo', 'Brazzaville', '15.000000', '-1.000000', '🇨🇬', 6332961, 146, 417, 'Katolik', 'Nasionalisme', 53, 'Netral', 0, 100, 'Netral', 15, 11, 57),
(22, 'lesotho', 'Lesotho', 'Lesotho', 'Maseru', '28.500000', '-29.500000', '🇱🇸', 2330318, 24, 69, 'Katolik', 'Monarki', 115, 'Netral', 0, 100, 'Netral', 36, 23, 57),
(23, 'liberia', 'Liberia', 'Liberia', 'Monrovia', '-9.500000', '6.500000', '🇱🇷', 5418377, 39, 111, 'Protestan', 'Demokrasi', 93, 'Netral', 0, 100, 'Netral', 39, 8, 57),
(24, 'libya', 'Libya', 'Libya', 'Tripoli', '13.100000', '32.530000', '🇱🇾', 6888388, 408, 1167, 'Islam', 'Nasionalisme', 108, 'Netral', 0, 100, 'Netral', 17, 23, 57),
(25, 'madagaskar', 'Madagaskar', 'Madagascar', 'Antananarivo', '47.310000', '-18.550000', '🇲🇬', 30325732, 146, 417, 'Protestan', 'Demokrasi', 87, 'Netral', 0, 100, 'Netral', 29, 3, 57),
(26, 'malawi', 'Malawi', 'Malawi', 'Lilongwe', '33.470000', '-13.590000', '🇲🇼', 20931751, 117, 333, 'Protestan', 'Demokrasi', 35, 'Netral', 0, 100, 'Netral', 3, 20, 57),
(27, 'mali', 'Mali', 'Mali', 'Bamako', '-8.000000', '12.390000', '🇲🇱', 23293698, 175, 500, 'Islam', 'Nasionalisme', 106, 'Netral', 0, 100, 'Netral', 17, 24, 57),
(28, 'maroko', 'Maroko', 'Morocco', 'Rabat', '-5.000000', '32.000000', '🇲🇦', 37840044, 1313, 3750, 'Islam', 'Monarki', 109, 'Netral', 0, 100, 'Netral', 5, 28, 57),
(29, 'mauritania', 'Mauritania', 'Mauritania', 'Nouakchott', '-12.000000', '20.000000', '🇲🇷', 4862989, 97, 278, 'Islam', 'Konservatisme', 124, 'Netral', 0, 100, 'Netral', 17, 40, 57),
(30, 'mauritius', 'Mauritius', 'Mauritius', 'Port Louis', '57.550000', '-20.283333', '🇲🇺', 1262523, 136, 389, 'Hindu', 'Demokrasi', 69, 'Netral', 0, 100, 'Netral', 13, 33, 57),
(31, 'mesir', 'Mesir', 'Egypt', 'Cairo', '31.230000', '30.040000', '🇪🇬', 112716598, 3841, 10973, 'Islam', 'Nasionalisme', 159, 'Netral', 0, 100, 'Netral', 6, 34, 57),
(32, 'mozambik', 'Mozambik', 'Mozambique', 'Maputo', '35.000000', '-18.250000', '🇲🇿', 34631766, 175, 500, 'Katolik', 'Demokrasi', 85, 'Netral', 0, 100, 'Netral', 12, 28, 57),
(33, 'namibia', 'Namibia', 'Namibia', 'Windhoek', '17.000000', '-22.000000', '🇳🇦', 3022401, 126, 361, 'Protestan', 'Demokrasi', 28, 'Netral', 0, 100, 'Netral', 7, 25, 57),
(34, 'niger', 'Niger', 'Niger', 'Niamey', '8.000000', '16.000000', '🇳🇪', 27202843, 146, 417, 'Islam', 'Nasionalisme', 30, 'Netral', 0, 100, 'Netral', 18, 5, 57),
(35, 'nigeria', 'Nigeria', 'Nigeria', 'Abuja', '8.000000', '10.000000', '🇳🇬', 227882945, 4618, 13196, 'Islam', 'Demokrasi', 175, 'Netral', 0, 100, 'Netral', 37, 1, 57),
(36, 'pantai_gading', 'Pantai gading', 'Ivory Coast', 'Yamoussoukro', '-5.000000', '8.000000', '🇨🇮', 31934230, 681, 1945, 'Islam', 'Demokrasi', 51, 'Netral', 0, 100, 'Netral', 12, 1, 57),
(37, 'republik_afrika_tengah', 'Republik afrika tengah', 'Central African Republic', 'Bangui', '21.000000', '7.000000', '🇨🇫', 5742315, 24, 69, 'Protestan', 'Nasionalisme', 66, 'Netral', 0, 100, 'Netral', 23, 20, 57),
(38, 'republik_demokratik_kongo', 'Republik demokratik kongo', 'DR Congo', 'Kinshasa', '25.000000', '0.000000', '🇨🇩', 105789731, 603, 1722, 'Katolik', 'Demokrasi', 136, 'Netral', 0, 100, 'Netral', 25, 19, 57),
(39, 'republik_sudan', 'Republik sudan', 'Sudan', 'Khartoum', '30.000000', '15.000000', '🇸🇩', 50448963, 243, 694, 'Islam', 'Nasionalisme', 95, 'Netral', 0, 100, 'Netral', 7, 34, 57),
(40, 'republik_tanzania', 'Republik tanzania', 'Tanzania', 'Dodoma', '35.000000', '-6.000000', '🇹🇿', 67438106, 729, 2084, 'Katolik', 'Demokrasi', 178, 'Netral', 0, 100, 'Netral', 40, 11, 57),
(41, 'republik_uganda', 'Republik uganda', 'Uganda', 'Kampala', '32.000000', '1.000000', '🇺🇬', 49283041, 486, 1389, 'Katolik', 'Nasionalisme', 101, 'Netral', 0, 100, 'Netral', 20, 10, 57),
(42, 'republik_zambia', 'Republik zambia', 'Zambia', 'Lusaka', '30.000000', '-15.000000', '🇿🇲', 20569737, 272, 778, 'Protestan', 'Demokrasi', 25, 'Netral', 0, 100, 'Netral', 1, 13, 57),
(43, 'republik_zimbabwe', 'Republik zimbabwe', 'Zimbabwe', 'Harare', '30.000000', '-20.000000', '🇿🇼', 16665409, 194, 556, 'Protestan', 'Nasionalisme', 36, 'Netral', 0, 100, 'Netral', 2, 24, 57),
(44, 'rwanda', 'Rwanda', 'Rwanda', 'Kigali', '30.000000', '-2.000000', '🇷🇼', 14094683, 126, 361, 'Katolik', 'Nasionalisme', 50, 'Netral', 0, 100, 'Netral', 12, 15, 57),
(45, 'sao_tome_dan_principe', 'Sao tome dan principe', 'Sao Tome and Principe', 'São Tomé', '7.000000', '1.000000', '🇸🇹', 231856, 10, 17, 'Katolik', 'Demokrasi', 86, 'Netral', 0, 100, 'Netral', 37, 38, 57),
(46, 'senegal', 'Senegal', 'Senegal', 'Dakar', '-14.000000', '14.000000', '🇸🇳', 18501984, 272, 778, 'Islam', 'Demokrasi', 119, 'Netral', 0, 100, 'Netral', 34, 5, 57),
(47, 'seychelles', 'Seychelles', 'Seychelles', 'Victoria', '55.666667', '-4.583333', '🇸🇨', 120600, 19, 56, 'Katolik', 'Demokrasi', 6, 'Netral', 0, 100, 'Netral', 2, 27, 57),
(48, 'sierra_leone', 'Sierra leone', 'Sierra Leone', 'Freetown', '-11.500000', '8.500000', '🇸🇱', 8791092, 39, 111, 'Islam', 'Demokrasi', 91, 'Netral', 0, 100, 'Netral', 40, 3, 57),
(49, 'somalia', 'Somalia', 'Somalia', 'Mogadishu', '49.000000', '10.000000', '🇸🇴', 18143378, 78, 222, 'Islam', 'Konservatisme', 98, 'Netral', 0, 100, 'Netral', 35, 10, 57),
(50, 'sudan_selatan', 'Sudan selatan', 'South Sudan', 'Juba', '30.000000', '7.000000', '🇸🇸', 11943408, 49, 139, 'Katolik', 'Nasionalisme', 92, 'Netral', 0, 100, 'Netral', 24, 28, 57),
(51, 'tanjung_verde', 'Tanjung verde', 'Cape Verde', 'Praia', '-24.000000', '16.000000', '🇨🇻', 524877, 97, 278, 'Katolik', 'Demokrasi', 97, 'Netral', 0, 100, 'Netral', 38, 30, 57),
(52, 'togo', 'Togo', 'Togo', 'Lomé', '1.166667', '8.000000', '🇹🇬', 9515236, 88, 250, 'Katolik', 'Nasionalisme', 122, 'Netral', 0, 100, 'Netral', 35, 17, 57),
(53, 'tunisia', 'Tunisia', 'Tunisia', 'Tunis', '9.000000', '34.000000', '🇹🇳', 12458223, 457, 1306, 'Islam', 'Nasionalisme', 59, 'Netral', 0, 100, 'Netral', 1, 26, 57),
(54, 'afganistan', 'Afganistan', 'Afghanistan', 'Kabul', '69.160000', '34.540000', '🇦🇫', 42239854, 146, 417, 'Islam', 'Konservatisme', 126, 'Netral', 0, 100, 'Netral', 25, 22, 57),
(55, 'arab_saudi', 'Arab Saudi', 'Saudi Arabia', 'Riyadh', '46.670000', '24.710000', '🇸🇦', 35300280, 10793, 30836, 'Islam', 'Monarki', 163, 'Netral', 0, 100, 'Netral', 13, 23, 57),
(56, 'armenia', 'Armenia', 'Armenia', 'Yerevan', '44.510000', '40.190000', '🇦🇲', 2963234, 214, 611, 'Kristen Ortodoks', 'Demokrasi', 152, 'Netral', 0, 100, 'Netral', 30, 11, 57),
(57, 'azerbaijan', 'Azerbaijan', 'Azerbaijan', 'Baku', '47.500000', '40.500000', '🇦🇿', 10145212, 535, 1528, 'Islam', 'Nasionalisme', 140, 'Netral', 0, 100, 'Netral', 13, 40, 57),
(58, 'bahrain', 'Bahrain', 'Bahrain', 'Manama', '50.550000', '26.000000', '🇧🇭', 1569446, 428, 1222, 'Islam', 'Monarki', 96, 'Netral', 0, 100, 'Netral', 27, 14, 57),
(59, 'bangladesh', 'Bangladesh', 'Bangladesh', 'Dhaka', '90.000000', '24.000000', '🇧🇩', 173562364, 4473, 12779, 'Islam', 'Demokrasi', 118, 'Netral', 0, 100, 'Netral', 7, 15, 57),
(60, 'bhutan', 'Bhutan', 'Bhutan', 'Thimphu', '90.500000', '27.500000', '🇧🇹', 787941, 27, 78, 'Buddha', 'Monarki', 149, 'Netral', 0, 100, 'Netral', 37, 33, 57),
(61, 'brunei', 'Brunei', 'Brunei', 'Bandar Seri Begawan', '114.940000', '4.890000', '🇧🇳', 455858, 146, 417, 'Islam', 'Monarki', 114, 'Netral', 0, 100, 'Netral', 33, 22, 57),
(62, 'china', 'China', 'China', 'Beijing', '116.400000', '39.900000', '🇨🇳', 1408280000, 180167, 514763, 'Ateisme', 'Komunisme', 201, 'Netral', 0, 100, 'Netral', 3, 30, 57),
(63, 'filipina', 'Filipina', 'Philippines', 'Manila', '120.980000', '14.590000', '🇵🇭', 115843670, 4230, 12084, 'Katolik', 'Demokrasi', 139, 'Netral', 0, 100, 'Netral', 8, 21, 57),
(64, 'georgia', 'Georgia', 'Georgia', 'Tbilisi', '43.500000', '42.000000', '🇬🇪', 3728282, 243, 694, 'Kristen Ortodoks', 'Demokrasi', 127, 'Netral', 0, 100, 'Netral', 18, 32, 57),
(65, 'hong_kong', 'Hong kong', 'Hong Kong', 'City of Victoria', '114.188000', '22.267000', '🇭🇰', 7524100, 97, 278, 'Buddha', 'Kapitalisme', 27, 'Netral', 0, 100, 'Netral', 1, 20, 57),
(66, 'india', 'India', 'India', 'New Delhi', '77.200000', '28.610000', '🇮🇳', 1450935791, 38309, 109453, 'Hindu', 'Demokrasi', 204, 'Netral', 0, 100, 'Netral', 15, 33, 57),
(67, 'indonesia', 'Indonesia', 'Indonesia', 'Jakarta', '106.840000', '-6.200000', '🇮🇩', 284438782, 13807, 39448, 'Islam', 'Demokrasi', 128, 'Unggul', 78, 12, 'Netral', 8, 7, 57),
(68, 'irak', 'Irak', 'Iraq', 'Baghdad', '44.360000', '33.310000', '🇮🇶', 46042014, 2606, 7445, 'Islam', 'Demokrasi', 132, 'Netral', 0, 100, 'Netral', 22, 7, 57),
(69, 'iran', 'Iran', 'Iran', 'Tehran', '51.380000', '35.680000', '🇮🇷', 91567738, 3598, 10279, 'Islam', 'Konservatisme', 191, 'Netral', 0, 100, 'Netral', 14, 38, 57),
(70, 'israel', 'Israel', 'Israel', 'Tel Aviv', '34.780000', '32.080000', 'ðŸ‡®ðŸ‡±', 9954000, 5056, 14446, 'Yahudi', 'Demokrasi', 199, 'Netral', 0, 100, 'Netral', 37, 17, 57),
(71, 'jepang', 'Jepang', 'Japan', 'Tokyo', '139.650000', '35.670000', '🇯🇵', 123753041, 39962, 114176, 'Shinto', 'Demokrasi', 207, 'Netral', 0, 100, 'Netral', 39, 19, 57),
(72, 'kamboja', 'Kamboja', 'Cambodia', 'Phnom Penh', '104.910000', '11.550000', '🇰🇭', 17638801, 292, 833, 'Buddha', 'Nasionalisme', 166, 'Netral', 0, 100, 'Netral', 28, 29, 57),
(73, 'kazakhstan', 'Kazakhstan', 'Kazakhstan', 'Astana', '68.000000', '48.000000', '🇰🇿', 20330000, 2528, 7223, 'Islam', 'Nasionalisme', 187, 'Netral', 0, 100, 'Netral', 38, 20, 57),
(74, 'kirgizstan', 'Kirgizstan', 'Kyrgyzstan', 'Bishkek', '75.000000', '41.000000', '🇰🇬', 7186000, 117, 333, 'Islam', 'Nasionalisme', 19, 'Netral', 0, 100, 'Netral', 15, 2, 57),
(75, 'korea_selatan', 'Korea Selatan', 'South Korea', 'Seoul', '126.970000', '37.560000', '🇰🇷', 51717590, 17112, 48893, 'Ateisme', 'Demokrasi', 185, 'Netral', 0, 100, 'Netral', 33, 29, 57),
(76, 'korea_utara', 'Korea Utara', 'North Korea', 'Pyongyang', '125.750000', '39.030000', '🇰🇵', 26498823, 175, 500, 'Ateisme', 'Komunisme', 56, 'Netral', 0, 100, 'Netral', 7, 37, 57),
(77, 'kuwait', 'Kuwait', 'Kuwait', 'Kuwait City', '47.970000', '29.370000', '🇰🇼', 4934507, 1507, 4306, 'Islam', 'Monarki', 157, 'Netral', 0, 100, 'Netral', 36, 6, 57),
(78, 'laos', 'Laos', 'Laos', 'Vientiane', '102.630000', '17.970000', '🇱🇦', 7633779, 146, 417, 'Buddha', 'Komunisme', 21, 'Netral', 0, 100, 'Netral', 2, 14, 57),
(79, 'lebanon', 'Lebanon', 'Lebanon', 'Beirut', '35.833333', '33.833333', '🇱🇧', 5805962, 175, 500, 'Islam', 'Demokrasi', 183, 'Netral', 0, 100, 'Netral', 38, 37, 57),
(80, 'makau', 'Makau', 'Macau', 'N/A', '113.550000', '22.166667', '🇲🇴', 704149, 97, 278, 'Buddha', 'Kapitalisme', 8, 'Netral', 0, 100, 'Netral', 21, 2, 57),
(81, 'malaysia', 'Malaysia', 'Malaysia', 'Kuala Lumpur', '101.680000', '3.130000', '🇲🇾', 34308525, 3889, 11112, 'Islam', 'Demokrasi', 141, 'Netral', 0, 100, 'Netral', 6, 27, 57),
(82, 'maldives', 'Maldives', 'Maldives', 'Malé', '73.300000', '4.100000', '🇲🇻', 521021, 63, 181, 'Islam', 'Demokrasi', 145, 'Netral', 0, 100, 'Netral', 36, 27, 57),
(83, 'mongolia', 'Mongolia', 'Mongolia', 'Ulan Bator', '105.000000', '46.000000', '🇲🇳', 3475540, 175, 500, 'Buddha', 'Demokrasi', 134, 'Netral', 0, 100, 'Netral', 34, 15, 57),
(84, 'myanmar', 'Myanmar', 'Myanmar', 'Naypyidaw', '96.070000', '19.760000', '🇲🇲', 54577997, 583, 1667, 'Buddha', 'Nasionalisme', 55, 'Netral', 0, 100, 'Netral', 15, 2, 57),
(85, 'nepal', 'Nepal', 'Nepal', 'Kathmandu', '84.000000', '28.000000', '🇳🇵', 29651054, 389, 1111, 'Hindu', 'Demokrasi', 89, 'Netral', 0, 100, 'Netral', 17, 14, 57),
(86, 'oman', 'Oman', 'Oman', 'Muscat', '57.000000', '21.000000', '🇴🇲', 5281538, 1021, 2917, 'Islam', 'Monarki', 165, 'Netral', 0, 100, 'Netral', 32, 19, 57),
(87, 'pakistan', 'Pakistan', 'Pakistan', 'Islamabad', '73.040000', '33.680000', '🇵🇰', 251269164, 3306, 9445, 'Islam', 'Konservatisme', 180, 'Netral', 0, 100, 'Netral', 30, 4, 57),
(88, 'palestina', 'Palestina', 'Palestine', 'Yerusalem', '35.210000', '31.770000', 'ðŸ‡µðŸ‡¸', 5495000, 194, 556, 'Islam', 'Nasionalisme', 40, 'Netral', 0, 100, 'Netral', 22, 9, 57),
(89, 'qatar', 'Qatar', 'Qatar', 'Doha', '51.530000', '25.280000', '🇶🇦', 3115000, 2139, 6112, 'Islam', 'Monarki', 182, 'Netral', 0, 100, 'Netral', 36, 19, 57),
(90, 'republik_timor_leste', 'Republik timor leste', 'Timor-Leste', 'Dili', '125.916667', '-8.833333', '🇹🇱', 1360596, 19, 56, 'Katolik', 'Demokrasi', 33, 'Netral', 0, 100, 'Netral', 29, 27, 57),
(91, 'singapura', 'Singapura', 'Singapore', 'Singapore', '103.810000', '1.350000', '🇸🇬', 6036860, 4862, 13890, 'Buddha', 'Kapitalisme', 148, 'Netral', 0, 100, 'Netral', 12, 26, 57),
(92, 'sri_lanka', 'Sri lanka', 'Sri Lanka', 'Colombo', '81.000000', '7.000000', '🇱🇰', 23103000, 729, 2084, 'Buddha', 'Demokrasi', 158, 'Netral', 0, 100, 'Netral', 15, 36, 57),
(93, 'suriah', 'Suriah', 'Syria', 'Damascus', '38.000000', '35.000000', '🇸🇾', 24672760, 117, 333, 'Islam', 'Konservatisme', 65, 'Netral', 0, 100, 'Netral', 13, 21, 57),
(94, 'taiwan', 'Taiwan', 'Taiwan', 'Taipei', '121.000000', '23.500000', '🇹🇼', 23400220, 7681, 21946, 'Buddha', 'Demokrasi', 75, 'Netral', 0, 100, 'Netral', 14, 27, 57),
(95, 'tajikistan', 'Tajikistan', 'Tajikistan', 'Dushanbe', '71.000000', '39.000000', '🇹🇯', 10590927, 117, 333, 'Islam', 'Nasionalisme', 177, 'Netral', 0, 100, 'Netral', 33, 36, 57),
(96, 'thailand', 'Thailand', 'Thailand', 'Bangkok', '100.500000', '13.750000', '🇹🇭', 71801279, 4959, 14168, 'Buddha', 'Monarki', 154, 'Netral', 0, 100, 'Netral', 29, 2, 57),
(97, 'turkmenistan', 'Turkmenistan', 'Turkmenistan', 'Ashgabat', '60.000000', '40.000000', '🇹🇲', 7494498, 438, 1250, 'Islam', 'Nasionalisme', 133, 'Netral', 0, 100, 'Netral', 25, 22, 57),
(98, 'uni_emirat_arab', 'Uni emirat arab', 'United Arab Emirates', 'Abu Dhabi', '54.370000', '24.450000', '🇦🇪', 10032000, 4959, 14168, 'Islam', 'Monarki', 193, 'Netral', 0, 100, 'Netral', 32, 29, 57),
(99, 'uzbekistan', 'Uzbekistan', 'Uzbekistan', 'Tashkent', '64.000000', '41.000000', '🇺🇿', 36361859, 875, 2500, 'Islam', 'Nasionalisme', 80, 'Netral', 0, 100, 'Netral', 18, 3, 57),
(100, 'vietnam', 'Vietnam', 'Vietnam', 'Hanoi', '105.830000', '21.020000', '🇻🇳', 101343800, 4181, 11945, 'Ateisme', 'Komunisme', 76, 'Netral', 0, 100, 'Netral', 10, 3, 57),
(101, 'yaman', 'Yaman', 'Yemen', 'Sana''a', '48.000000', '15.000000', '🇾🇪', 34449825, 214, 611, 'Islam', 'Nasionalisme', 111, 'Netral', 0, 100, 'Netral', 30, 8, 57),
(102, 'yordania', 'Yordania', 'Jordan', 'Amman', '36.000000', '31.000000', '🇯🇴', 11552876, 457, 1306, 'Islam', 'Monarki', 82, 'Netral', 0, 100, 'Netral', 7, 26, 57),
(103, 'albania', 'Albania', 'Albania', 'Tirana', '19.810000', '41.320000', '🇦🇱', 2402113, 214, 611, 'Islam', 'Demokrasi', 77, 'Netral', 0, 100, 'Netral', 25, 9, 57),
(104, 'andorra', 'Andorra', 'Andorra', 'Andorra la Vella', '1.520000', '42.500000', '🇦🇩', 80856, 97, 278, 'Katolik', 'Demokrasi', 11, 'Netral', 0, 100, 'Netral', 4, 12, 57),
(105, 'austria', 'Austria', 'Austria', 'Vienna', '16.370000', '48.200000', '🇦🇹', 9132383, 4959, 14168, 'Katolik', 'Demokrasi', 192, 'Netral', 0, 100, 'Netral', 28, 34, 57),
(106, 'belanda', 'Belanda', 'Netherlands', 'Amsterdam', '4.900000', '52.360000', '🇳🇱', 17947684, 10598, 30280, 'Ateisme', 'Demokrasi', 196, 'Netral', 0, 100, 'Netral', 36, 22, 57),
(107, 'belarus', 'Belarus', 'Belarus', 'Minsk', '28.000000', '53.000000', '🇧🇾', 9109280, 681, 1945, 'Kristen Ortodoks', 'Nasionalisme', 102, 'Netral', 0, 100, 'Netral', 1, 39, 57),
(108, 'belgia', 'Belgia', 'Belgium', 'Brussels', '4.350000', '50.850000', '🇧🇪', 11832047, 6077, 17362, 'Katolik', 'Demokrasi', 189, 'Netral', 0, 100, 'Netral', 39, 2, 57),
(109, 'bosnia_dan_hercegovina', 'Bosnia dan hercegovina', 'Bosnia and Herzegovina', 'Sarajevo', '18.000000', '44.000000', '🇧🇦', 3210847, 233, 667, 'Islam', 'Demokrasi', 144, 'Netral', 0, 100, 'Netral', 39, 15, 57),
(110, 'bulgaria', 'Bulgaria', 'Bulgaria', 'Sofia', '25.000000', '43.000000', '🇧🇬', 6445481, 1021, 2917, 'Kristen Ortodoks', 'Demokrasi', 42, 'Netral', 0, 100, 'Netral', 2, 11, 57),
(111, 'ceko', 'Ceko', 'Czechia', 'Prague', '15.500000', '49.750000', '🇨🇿', 10882341, 3209, 9167, 'Ateisme', 'Demokrasi', 26, 'Netral', 0, 100, 'Netral', 2, 26, 57),
(112, 'denmark', 'Denmark', 'Denmark', 'Copenhagen', '12.560000', '55.670000', '🇩🇰', 5977412, 3986, 11390, 'Protestan', 'Demokrasi', 184, 'Netral', 0, 100, 'Netral', 32, 20, 57),
(113, 'estonia', 'Estonia', 'Estonia', 'Tallinn', '26.000000', '59.000000', '🇪🇪', 1366250, 389, 1111, 'Ateisme', 'Demokrasi', 168, 'Netral', 0, 100, 'Netral', 38, 21, 57),
(114, 'finlandia', 'Finlandia', 'Finland', 'Helsinki', '24.930000', '60.160000', '🇫🇮', 5617310, 2917, 8334, 'Protestan', 'Demokrasi', 156, 'Netral', 0, 100, 'Netral', 22, 6, 57),
(115, 'gibraltar', 'Gibraltar', 'Gibraltar', 'Gibraltar', '-5.350000', '36.133333', '🇬🇮', 32688, 97, 278, 'Katolik', 'Demokrasi', 23, 'Netral', 0, 100, 'Netral', 13, 16, 57),
(116, 'hungaria', 'Hungaria', 'Hungary', 'Budapest', '20.000000', '47.000000', '🇭🇺', 9599744, 2042, 5834, 'Katolik', 'Nasionalisme', 94, 'Netral', 0, 100, 'Netral', 1, 16, 57),
(117, 'inggris', 'Inggris', 'United Kingdom', 'London', '-0.120000', '51.500000', '🇬🇧', 68265209, 34030, 97230, 'Protestan', 'Demokrasi', 181, 'Netral', 0, 100, 'Netral', 3, 29, 57),
(118, 'irlandia', 'Irlandia', 'Ireland', 'Dublin', '-8.000000', '53.000000', '🇮🇪', 5308039, 5153, 14723, 'Katolik', 'Demokrasi', 153, 'Netral', 0, 100, 'Netral', 29, 5, 57),
(119, 'islandia', 'Islandia', 'Iceland', 'Reykjavik', '-18.000000', '65.000000', '🇮🇸', 383726, 292, 833, 'Protestan', 'Demokrasi', 103, 'Netral', 0, 100, 'Netral', 29, 18, 57),
(120, 'italia', 'Italia', 'Italy', 'Rome', '12.490000', '41.900000', '🇮🇹', 58927633, 22655, 64727, 'Katolik', 'Demokrasi', 146, 'Netral', 0, 100, 'Netral', 5, 22, 57),
(121, 'jerman', 'Jerman', 'Germany', 'Berlin', '13.400000', '52.520000', '🇩🇪', 83510950, 44629, 127510, 'Protestan', 'Demokrasi', 197, 'Netral', 0, 100, 'Netral', 30, 18, 57),
(122, 'kepulauan_faroe', 'Kepulauan faroe', 'Faroe Islands', 'Tórshavn', '-7.000000', '62.000000', '🇫🇴', 54176, 97, 278, 'Protestan', 'Demokrasi', 18, 'Netral', 0, 100, 'Netral', 9, 16, 57),
(123, 'kosovo', 'Kosovo', 'Kosovo', 'Pristina', '21.166667', '42.666667', '🇽🇰', 1585566, 97, 278, 'Islam', 'Demokrasi', 7, 'Netral', 0, 100, 'Netral', 17, 3, 57),
(124, 'kroasia', 'Kroasia', 'Croatia', 'Zagreb', '15.500000', '45.166667', '🇭🇷', 3855641, 758, 2167, 'Katolik', 'Demokrasi', 129, 'Netral', 0, 100, 'Netral', 35, 2, 57),
(125, 'latvia', 'Latvia', 'Latvia', 'Riga', '25.000000', '57.000000', '🇱🇻', 1871882, 418, 1195, 'Protestan', 'Demokrasi', 164, 'Netral', 0, 100, 'Netral', 37, 17, 57),
(126, 'liechtenstein', 'Liechtenstein', 'Liechtenstein', 'Vaduz', '9.310000', '47.080000', '🇱🇮', 39939, 97, 278, 'Katolik', 'Monarki', 20, 'Netral', 0, 100, 'Netral', 1, 28, 57),
(127, 'lithuania', 'Lithuania', 'Lithuania', 'Vilnius', '25.190000', '54.410000', '🇱🇹', 2897430, 739, 2111, 'Katolik', 'Demokrasi', 174, 'Netral', 0, 100, 'Netral', 31, 33, 57),
(128, 'luksemburg', 'Luksemburg', 'Luxembourg', 'Luxembourg', '6.070000', '49.360000', '🇱🇺', 668606, 846, 2417, 'Katolik', 'Demokrasi', 67, 'Netral', 0, 100, 'Netral', 20, 2, 57),
(129, 'makedonia_utara', 'Makedonia utara', 'North Macedonia', 'Skopje', '22.000000', '41.833333', '🇲🇰', 1811000, 136, 389, 'Kristen Ortodoks', 'Demokrasi', 172, 'Netral', 0, 100, 'Netral', 32, 37, 57),
(130, 'malta', 'Malta', 'Malta', 'Valletta', '14.300000', '35.530000', '🇲🇹', 542051, 194, 556, 'Katolik', 'Demokrasi', 121, 'Netral', 0, 100, 'Netral', 17, 39, 57),
(131, 'moldova', 'Moldova', 'Moldova', 'Chișinău', '29.000000', '47.000000', '🇲🇩', 2435000, 156, 444, 'Kristen Ortodoks', 'Demokrasi', 38, 'Netral', 0, 100, 'Netral', 15, 7, 57),
(132, 'monako', 'Monako', 'Monaco', 'Monaco', '7.400000', '43.733333', '🇲🇨', 38423, 97, 278, 'Katolik', 'Monarki', 88, 'Netral', 0, 100, 'Netral', 29, 24, 57),
(133, 'montenegro', 'Montenegro', 'Montenegro', 'Podgorica', '19.300000', '42.500000', '🇲🇪', 623633, 68, 194, 'Kristen Ortodoks', 'Demokrasi', 104, 'Netral', 0, 100, 'Netral', 21, 34, 57),
(134, 'norwegia', 'Norwegia', 'Norway', 'Oslo', '10.750000', '59.910000', '🇳🇴', 5550203, 5639, 16112, 'Protestan', 'Demokrasi', 161, 'Netral', 0, 100, 'Netral', 10, 31, 57),
(135, 'polandia', 'Polandia', 'Poland', 'Warsaw', '21.010000', '52.220000', '🇵🇱', 36497495, 8167, 23335, 'Katolik', 'Demokrasi', 200, 'Netral', 0, 100, 'Netral', 39, 23, 57),
(136, 'portugal', 'Portugal', 'Portugal', 'Lisbon', '-9.130000', '38.720000', '🇵🇹', 10639726, 2722, 7778, 'Katolik', 'Demokrasi', 194, 'Netral', 0, 100, 'Netral', 36, 30, 57),
(137, 'prancis', 'Prancis', 'France', 'Paris', '2.000000', '46.000000', '🇫🇷', 68401997, 30433, 86951, 'Katolik', 'Demokrasi', 202, 'Netral', 0, 100, 'Netral', 14, 37, 57),
(138, 'republik_rumania', 'Republik rumania', 'Romania', 'Bucharest', '25.000000', '46.000000', '🇷🇴', 19053815, 3403, 9723, 'Kristen Ortodoks', 'Demokrasi', 143, 'Netral', 0, 100, 'Netral', 33, 6, 57),
(139, 'republik_serbia', 'Republik serbia', 'Serbia', 'Belgrade', '21.000000', '44.000000', '🇷🇸', 6586000, 661, 1889, 'Kristen Ortodoks', 'Demokrasi', 167, 'Netral', 0, 100, 'Netral', 29, 30, 57),
(140, 'rusia', 'Rusia', 'Russia', 'Moscow', '37.610000', '55.750000', '🇷🇺', 146150789, 19640, 56116, 'Kristen Ortodoks', 'Nasionalisme', 150, 'Netral', 0, 100, 'Netral', 2, 12, 57),
(141, 'san_marino', 'San marino', 'San Marino', 'City of San Marino', '12.416667', '43.766667', '🇸🇲', 33642, 97, 278, 'Katolik', 'Demokrasi', 31, 'Netral', 0, 100, 'Netral', 6, 30, 57),
(142, 'siprus', 'Siprus', 'Cyprus', 'Nicosia', '33.000000', '35.000000', '🇨🇾', 936000, 292, 833, 'Kristen Ortodoks', 'Demokrasi', 131, 'Netral', 0, 100, 'Netral', 36, 15, 57),
(143, 'slovenia', 'Slovenia', 'Slovenia', 'Ljubljana', '14.816667', '46.116667', '🇸🇮', 2117072, 632, 1806, 'Katolik', 'Demokrasi', 78, 'Netral', 0, 100, 'Netral', 10, 31, 57),
(144, 'slowakia', 'Slowakia', 'Slovakia', 'Bratislava', '19.500000', '48.666667', '🇸🇰', 5460185, 1264, 3611, 'Katolik', 'Demokrasi', 176, 'Netral', 0, 100, 'Netral', 13, 38, 57),
(145, 'spanyol', 'Spanyol', 'Spain', 'Madrid', '-3.700000', '40.410000', '🇪🇸', 48797875, 15362, 43892, 'Katolik', 'Demokrasi', 135, 'Netral', 0, 100, 'Netral', 8, 2, 57),
(146, 'swedia', 'Swedia', 'Sweden', 'Stockholm', '18.060000', '59.320000', '🇸🇪', 10551707, 5834, 16668, 'Protestan', 'Demokrasi', 90, 'Netral', 0, 100, 'Netral', 3, 2, 57),
(147, 'swiss', 'Swiss', 'Switzerland', 'Bern', '8.000000', '47.000000', '🇨🇭', 9048900, 8848, 25280, 'Katolik', 'Demokrasi', 198, 'Netral', 0, 100, 'Netral', 25, 30, 57),
(148, 'turki', 'Turki', 'Turkiye', 'Ankara', '32.850000', '39.930000', '🇹🇷', 85664944, 97, 278, 'Islam', 'Konservatisme', 83, 'Netral', 0, 100, 'Netral', 35, 28, 57),
(149, 'ukraina', 'Ukraina', 'Ukraine', 'Kyiv', '30.520000', '50.450000', '🇺🇦', 37000000, 1556, 4445, 'Kristen Ortodoks', 'Demokrasi', 205, 'Netral', 0, 100, 'Netral', 36, 39, 57),
(150, 'vatikan', 'Vatikan', 'Vatican City', 'Vatican City', '12.450000', '41.900000', '🇻🇦', 882, 97, 278, 'Katolik', 'Monarki', 34, 'Netral', 0, 100, 'Netral', 17, 24, 57),
(151, 'yunani', 'Yunani', 'Greece', 'Athens', '22.000000', '39.000000', '🇬🇷', 10413982, 2236, 6389, 'Kristen Ortodoks', 'Demokrasi', 179, 'Netral', 0, 100, 'Netral', 27, 28, 57),
(152, 'amerika_serikat', 'Amerika Serikat', 'United States', 'Washington, D.C.', '-77.030000', '38.900000', '🇺🇸', 340110988, 280022, 800064, 'Protestan', 'Demokrasi', 203, 'Netral', 0, 100, 'Netral', 25, 15, 57),
(153, 'antigua_dan_barbuda', 'Antigua dan Barbuda', 'Antigua and Barbuda', 'Saint John''s', '-61.840000', '17.110000', '🇦🇬', 94298, 97, 278, 'Protestan', 'Demokrasi', 12, 'Netral', 0, 100, 'Netral', 14, 3, 57),
(154, 'bahama', 'Bahama', 'Bahamas', 'Nassau', '-76.000000', '24.250000', '🇧🇸', 412628, 136, 389, 'Protestan', 'Demokrasi', 170, 'Netral', 0, 100, 'Netral', 37, 36, 57),
(155, 'barbados', 'Barbados', 'Barbados', 'Bridgetown', '-59.533333', '13.166667', '🇧🇧', 282623, 53, 153, 'Protestan', 'Demokrasi', 10, 'Netral', 0, 100, 'Netral', 4, 9, 57),
(156, 'belize', 'Belize', 'Belize', 'Belmopan', '-88.750000', '17.250000', '🇧🇿', 410825, 24, 69, 'Katolik', 'Demokrasi', 15, 'Netral', 0, 100, 'Netral', 5, 29, 57),
(157, 'bermuda', 'Bermuda', 'Bermuda', 'Hamilton', '-64.750000', '32.333333', '🇧🇲', 64636, 97, 278, 'Protestan', 'Demokrasi', 22, 'Netral', 0, 100, 'Netral', 5, 22, 57),
(158, 'costa_rica', 'Costa rica', 'Costa Rica', 'San José', '-84.000000', '10.000000', '🇨🇷', 5129910, 681, 1945, 'Katolik', 'Demokrasi', 72, 'Netral', 0, 100, 'Netral', 4, 23, 57),
(159, 'curacao', 'Curacao', 'Curaçao', 'Willemstad', '-68.933333', '12.116667', '🇨🇼', 155826, 97, 278, 'Katolik', 'Demokrasi', 16, 'Netral', 0, 100, 'Netral', 27, 6, 57),
(160, 'dominika', 'Dominika', 'Dominica', 'Roseau', '-61.333333', '15.416667', '🇩🇲', 73040, 97, 278, 'Katolik', 'Demokrasi', 54, 'Netral', 0, 100, 'Netral', 21, 18, 57),
(161, 'el_salvador', 'El salvador', 'El Salvador', 'San Salvador', '-88.916667', '13.833333', '🇸🇻', 6338193, 311, 889, 'Katolik', 'Nasionalisme', 79, 'Netral', 0, 100, 'Netral', 26, 5, 57),
(162, 'greenland', 'Greenland', 'Greenland', 'Nuuk', '-40.000000', '72.000000', '🇬🇱', 56583, 97, 278, 'Protestan', 'Demokrasi', 43, 'Netral', 0, 100, 'Netral', 6, 33, 57),
(163, 'grenada', 'Grenada', 'Grenada', 'St. George''s', '-61.666667', '12.116667', '🇬🇩', 126183, 97, 278, 'Katolik', 'Demokrasi', 63, 'Netral', 0, 100, 'Netral', 23, 18, 57),
(164, 'guatemala', 'Guatemala', 'Guatemala', 'Guatemala City', '-90.250000', '15.500000', '🇬🇹', 18406359, 924, 2639, 'Katolik', 'Demokrasi', 142, 'Netral', 0, 100, 'Netral', 31, 5, 57),
(165, 'haiti', 'Haiti', 'Haiti', 'Port-au-Prince', '-72.416667', '19.000000', '🇭🇹', 11724763, 97, 278, 'Katolik', 'Demokrasi', 105, 'Netral', 0, 100, 'Netral', 32, 15, 57),
(166, 'honduras', 'Honduras', 'Honduras', 'Tegucigalpa', '-86.500000', '15.000000', '🇭🇳', 10593798, 311, 889, 'Katolik', 'Demokrasi', 137, 'Netral', 0, 100, 'Netral', 35, 12, 57),
(167, 'jamaika', 'Jamaika', 'Jamaica', 'Kingston', '-77.500000', '18.250000', '🇯🇲', 2825544, 175, 500, 'Protestan', 'Demokrasi', 57, 'Netral', 0, 100, 'Netral', 4, 27, 57),
(168, 'kanada', 'Kanada', 'Canada', 'Ottawa', '-75.690000', '45.420000', '🇨🇦', 41288599, 21780, 62227, 'Katolik', 'Liberalisme', 160, 'Netral', 0, 100, 'Netral', 1, 18, 57),
(169, 'kuba', 'Kuba', 'Cuba', 'Havana', '-80.000000', '21.500000', '🇨🇺', 11097000, 1021, 2917, 'Katolik', 'Komunisme', 171, 'Netral', 0, 100, 'Netral', 39, 9, 57),
(170, 'meksiko', 'Meksiko', 'Mexico', 'Mexico City', '-102.000000', '23.000000', '🇲🇽', 130861007, 17404, 49726, 'Katolik', 'Demokrasi', 186, 'Netral', 0, 100, 'Netral', 17, 21, 57),
(171, 'nikaragua', 'Nikaragua', 'Nicaragua', 'Managua', '-85.000000', '13.000000', '🇳🇮', 6948392, 165, 472, 'Katolik', 'Sosialisme', 162, 'Netral', 0, 100, 'Netral', 38, 19, 57),
(172, 'panama', 'Panama', 'Panama', 'Panama City', '-80.000000', '9.000000', '🇵🇦', 4515577, 739, 2111, 'Katolik', 'Demokrasi', 120, 'Netral', 0, 100, 'Netral', 30, 15, 57),
(173, 'puerto_rico', 'Puerto rico', 'Puerto Rico', 'San Juan', '-66.500000', '18.250000', '🇵🇷', 3203295, 97, 278, 'Katolik', 'Demokrasi', 117, 'Netral', 0, 100, 'Netral', 36, 15, 57),
(174, 'republik_dominika', 'Republik dominika', 'Dominican Republic', 'Santo Domingo', '-70.666667', '19.000000', '🇩🇴', 11332972, 1070, 3056, 'Katolik', 'Demokrasi', 45, 'Netral', 0, 100, 'Netral', 8, 7, 57),
(175, 'saint_kitts_dan_nevis', 'Saint kitts dan nevis', 'Saint Kitts and Nevis', 'Basseterre', '-62.750000', '17.333333', '🇰🇳', 47657, 97, 278, 'Protestan', 'Demokrasi', 64, 'Netral', 0, 100, 'Netral', 16, 35, 57),
(176, 'saint_lucia', 'Saint lucia', 'Saint Lucia', 'Castries', '-60.966667', '13.883333', '🇱🇨', 180251, 97, 278, 'Katolik', 'Demokrasi', 17, 'Netral', 0, 100, 'Netral', 2, 19, 57),
(177, 'saint_vincent_dan_grenadine', 'Saint vincent dan grenadine', 'Saint Vincent and the Grenadines', 'Kingstown', '-61.200000', '13.250000', '🇻🇨', 103698, 97, 278, 'Protestan', 'Demokrasi', 110, 'Netral', 0, 100, 'Netral', 23, 39, 57),
(178, 'trinidad_dan_tobago', 'Trinidad dan tobago', 'Trinidad and Tobago', 'Port of Spain', '-61.000000', '11.000000', '🇹🇹', 1534937, 243, 694, 'Protestan', 'Demokrasi', 123, 'Netral', 0, 100, 'Netral', 22, 28, 57),
(179, 'australia', 'Australia', 'Australia', 'Canberra', '149.130000', '-35.280000', '🇦🇺', 27204809, 16724, 47782, 'Ateisme', 'Demokrasi', 112, 'Netral', 0, 100, 'Netral', 6, 21, 57),
(180, 'fiji', 'Fiji', 'Fiji', 'Suva', '175.000000', '-18.000000', '🇫🇯', 936375, 49, 139, 'Protestan', 'Demokrasi', 113, 'Netral', 0, 100, 'Netral', 37, 16, 57),
(181, 'guam', 'Guam', 'Guam', 'Hagåtña', '144.783333', '13.466667', '🇬🇺', 171774, 97, 278, 'Katolik', 'Demokrasi', 151, 'Netral', 0, 100, 'Netral', 32, 33, 57),
(182, 'kiribati', 'Kiribati', 'Kiribati', 'South Tarawa', '173.000000', '1.416667', '🇰🇮', 131232, 10, 15, 'Katolik', 'Demokrasi', 2, 'Netral', 0, 100, 'Netral', 3, 18, 57),
(183, 'marshall', 'Marshall', 'Marshall Islands', 'Majuro', '168.000000', '9.000000', '🇲🇭', 37548, 10, 15, 'Protestan', 'Demokrasi', 4, 'Netral', 0, 100, 'Netral', 22, 2, 57),
(184, 'mikronesia', 'Mikronesia', 'Micronesia', 'Palikir', '158.250000', '6.916667', '🇫🇲', 113131, 10, 15, 'Katolik', 'Demokrasi', 14, 'Netral', 0, 100, 'Netral', 9, 29, 57),
(185, 'nauru', 'Nauru', 'Nauru', 'Yaren', '166.916667', '-0.533333', '🇳🇷', 12511, 10, 15, 'Protestan', 'Demokrasi', 52, 'Netral', 0, 100, 'Netral', 23, 36, 57),
(186, 'palau', 'Palau', 'Palau', 'Ngerulmud', '134.500000', '7.500000', '🇵🇼', 17727, 10, 15, 'Katolik', 'Demokrasi', 44, 'Netral', 0, 100, 'Netral', 34, 21, 57),
(187, 'papua_nugini', 'Papua nugini', 'Papua New Guinea', 'Port Moresby', '147.000000', '-6.000000', '🇵🇬', 10329931, 292, 833, 'Protestan', 'Demokrasi', 130, 'Netral', 0, 100, 'Netral', 36, 6, 57),
(188, 'samoa', 'Samoa', 'Samoa', 'Apia', '-172.333333', '-13.583333', '🇼🇸', 225681, 10, 25, 'Protestan', 'Demokrasi', 9, 'Netral', 0, 100, 'Netral', 2, 35, 57),
(189, 'samoa_amerika', 'Samoa amerika', 'American Samoa', 'Pago Pago', '-170.000000', '-14.333333', '🇦🇸', 43914, 97, 278, 'Protestan', 'Demokrasi', 24, 'Netral', 0, 100, 'Netral', 21, 3, 57),
(190, 'selandia_baru', 'Selandia baru', 'New Zealand', 'Wellington', '174.770000', '-41.280000', '🇳🇿', 5213944, 2431, 6945, 'Ateisme', 'Demokrasi', 107, 'Netral', 0, 100, 'Netral', 4, 27, 57),
(191, 'tahiti', 'Tahiti', 'French Polynesia', 'Papeetē', '-140.000000', '-15.000000', '🇵🇫', 279287, 97, 278, 'Protestan', 'Demokrasi', 81, 'Netral', 0, 100, 'Netral', 14, 37, 57),
(192, 'tonga', 'Tonga', 'Tonga', 'Nuku''alofa', '-175.000000', '-20.000000', '🇹🇴', 107773, 10, 15, 'Protestan', 'Monarki', 5, 'Netral', 0, 100, 'Netral', 5, 18, 57),
(193, 'tuvalu', 'Tuvalu', 'Tuvalu', 'Funafuti', '178.000000', '-8.000000', '🇹🇻', 11396, 10, 15, 'Protestan', 'Demokrasi', 29, 'Netral', 0, 100, 'Netral', 27, 27, 57),
(194, 'vanuatu', 'Vanuatu', 'Vanuatu', 'Port Vila', '167.000000', '-16.000000', '🇻🇺', 334506, 10, 28, 'Protestan', 'Demokrasi', 1, 'Netral', 0, 100, 'Netral', 4, 10, 57),
(195, 'argentina', 'Argentina', 'Argentina', 'Buenos Aires', '-58.380000', '-34.600000', '🇦🇷', 45696159, 6223, 17779, 'Katolik', 'Demokrasi', 190, 'Netral', 0, 100, 'Netral', 23, 22, 57),
(196, 'bolivia', 'Bolivia', 'Bolivia', 'Sucre', '-65.000000', '-17.000000', '🇧🇴', 12388571, 428, 1222, 'Katolik', 'Sosialisme', 68, 'Netral', 0, 100, 'Netral', 16, 9, 57),
(197, 'brazil', 'Brazil', 'Brazil', 'Brasília', '-47.880000', '-15.790000', '🇧🇷', 212812405, 22655, 64727, 'Katolik', 'Demokrasi', 206, 'Netral', 0, 100, 'Netral', 33, 28, 57),
(198, 'chile', 'Chile', 'Chile', 'Santiago', '-71.000000', '-30.000000', '🇨🇱', 19764771, 3257, 9306, 'Katolik', 'Demokrasi', 147, 'Netral', 0, 100, 'Netral', 26, 4, 57),
(199, 'ekuador', 'Ekuador', 'Ecuador', 'Quito', '-77.500000', '-2.000000', '🇪🇨', 17980083, 1118, 3195, 'Katolik', 'Demokrasi', 32, 'Netral', 0, 100, 'Netral', 3, 4, 57),
(200, 'guiana_prancis', 'Guiana prancis', 'French Guiana', 'Cayenne', '-53.000000', '4.000000', '🇬🇫', 294436, 97, 278, 'Katolik', 'Demokrasi', 39, 'Netral', 0, 100, 'Netral', 3, 35, 57),
(201, 'guyana', 'Guyana', 'Guyana', 'Georgetown', '-59.000000', '5.000000', '🇬🇾', 831087, 146, 417, 'Protestan', 'Demokrasi', 74, 'Netral', 0, 100, 'Netral', 5, 39, 57),
(202, 'kolombia', 'Kolombia', 'Colombia', 'Bogotá', '-72.000000', '4.000000', '🇨🇴', 52886363, 3306, 9445, 'Katolik', 'Demokrasi', 173, 'Netral', 0, 100, 'Netral', 27, 15, 57),
(203, 'paraguay', 'Paraguay', 'Paraguay', 'Asunción', '-58.000000', '-23.000000', '🇵🇾', 6929153, 428, 1222, 'Katolik', 'Konservatisme', 71, 'Netral', 0, 100, 'Netral', 17, 6, 57),
(204, 'peru', 'Peru', 'Peru', 'Lima', '-76.000000', '-10.000000', '🇵🇪', 34352720, 2528, 7223, 'Katolik', 'Demokrasi', 41, 'Netral', 0, 100, 'Netral', 2, 11, 57),
(205, 'suriname', 'Suriname', 'Suriname', 'Paramaribo', '-56.000000', '4.000000', '🇸🇷', 634431, 34, 97, 'Protestan', 'Demokrasi', 3, 'Netral', 0, 100, 'Netral', 1, 4, 57),
(206, 'uruguay', 'Uruguay', 'Uruguay', 'Montevideo', '-56.000000', '-33.000000', '🇺🇾', 3499451, 700, 2000, 'Ateisme', 'Demokrasi', 99, 'Netral', 0, 100, 'Netral', 8, 29, 57),
(207, 'venezuela', 'Venezuela', 'Venezuela', 'Caracas', '-66.000000', '8.000000', '🇻🇪', 28405543, 924, 2639, 'Katolik', 'Sosialisme', 195, 'Netral', 0, 100, 'Netral', 40, 34, 57);

DROP TABLE IF EXISTS `database_sektor_mineral_kritis`;
CREATE TABLE `database_sektor_mineral_kritis` (
  `id` int(11) NOT NULL,
  `country` varchar(100) NOT NULL,
  `country_slug` varchar(100) NOT NULL,
  `bijih_besi` int(11) NOT NULL DEFAULT 0,
  `litium` int(11) NOT NULL DEFAULT 0,
  `logam_tanah_jarang` int(11) NOT NULL DEFAULT 0,
  `emas` int(11) NOT NULL DEFAULT 0,
  `batu_bara` int(11) NOT NULL DEFAULT 0,
  `minyak_bumi` int(11) NOT NULL DEFAULT 0,
  `gas_alam` int(11) NOT NULL DEFAULT 0,
  `uranium` int(11) NOT NULL DEFAULT 0,
  `garam` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `database_sektor_mineral_kritis` (`id`, `country`, `country_slug`, `bijih_besi`, `litium`, `logam_tanah_jarang`, `emas`, `batu_bara`, `minyak_bumi`, `gas_alam`, `uranium`, `garam`) VALUES
(1, 'Afrika Selatan', 'afrika_selatan', 62, 2, 2, 16, 17, 13, 6, 4, 8),
(2, 'Aljazair', 'aljazair', 62, 0, 0, 16, 0, 13, 6, 4, 0),
(3, 'Angola', 'angola', 50, 2, 2, 12, 0, 11, 5, 3, 6),
(4, 'Benin', 'benin', 38, 0, 0, 8, 0, 0, 0, 0, 0),
(5, 'Botswana', 'botswana', 20, 0, 0, 17, 8, 0, 0, 0, 0),
(6, 'Burkina faso', 'burkina_faso', 0, 0, 0, 8, 0, 0, 0, 0, 0),
(7, 'Burundi', 'burundi', 0, 0, 0, 5, 0, 0, 0, 0, 0),
(8, 'Chad', 'chad', 0, 0, 0, 5, 0, 8, 4, 0, 0),
(9, 'Djibouti', 'djibouti', 0, 0, 0, 9, 0, 0, 0, 0, 4),
(10, 'Eritrea', 'eritrea', 25, 0, 0, 6, 0, 0, 0, 2, 0),
(11, 'Eswatini', 'eswatini', 20, 0, 0, 11, 8, 0, 0, 0, 0),
(12, 'Ethiopia', 'ethiopia', 88, 0, 0, 8, 23, 0, 0, 0, 0),
(13, 'Gabon', 'gabon', 20, 0, 0, 16, 0, 6, 4, 2, 0),
(14, 'Gambia', 'gambia', 0, 0, 0, 7, 0, 0, 0, 0, 0),
(15, 'Ghana', 'ghana', 50, 0, 0, 12, 0, 0, 0, 0, 0),
(16, 'Guinea', 'guinea', 38, 0, 0, 9, 0, 0, 0, 0, 0),
(17, 'Guinea bissau', 'guinea_bissau', 0, 0, 0, 8, 0, 0, 0, 0, 0),
(18, 'Kamerun', 'kamerun', 50, 0, 0, 11, 0, 11, 5, 0, 0),
(19, 'Kenya', 'kenya', 0, 0, 0, 12, 0, 0, 0, 0, 8),
(20, 'Komoro', 'komoro', 0, 0, 0, 9, 0, 0, 0, 0, 0),
(21, 'Kongo', 'kongo', 25, 2, 2, 12, 8, 6, 4, 2, 0),
(22, 'Lesotho', 'lesotho', 0, 0, 0, 9, 0, 0, 0, 0, 0),
(23, 'Liberia', 'liberia', 25, 0, 0, 5, 0, 0, 0, 0, 0),
(24, 'Libya', 'libya', 0, 0, 0, 11, 0, 6, 4, 0, 0),
(25, 'Madagaskar', 'madagaskar', 50, 0, 0, 6, 0, 0, 0, 0, 0),
(26, 'Malawi', 'malawi', 38, 0, 0, 5, 10, 0, 0, 2, 0),
(27, 'Mali', 'mali', 0, 0, 0, 5, 0, 0, 0, 0, 0),
(28, 'Maroko', 'maroko', 50, 0, 0, 11, 0, 0, 0, 3, 6),
(29, 'Mauritania', 'mauritania', 25, 0, 0, 7, 0, 0, 0, 0, 4),
(30, 'Mauritius', 'mauritius', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(31, 'Mesir', 'mesir', 88, 4, 0, 12, 23, 19, 9, 5, 0),
(32, 'Mozambik', 'mozambik', 50, 0, 0, 5, 13, 11, 5, 3, 0),
(33, 'Namibia', 'namibia', 25, 0, 2, 11, 0, 0, 0, 2, 0),
(34, 'Niger', 'niger', 0, 0, 0, 5, 13, 0, 0, 3, 0),
(35, 'Nigeria', 'nigeria', 112, 4, 0, 11, 30, 24, 11, 7, 0),
(36, 'Pantai gading', 'pantai_gading', 50, 0, 0, 13, 0, 0, 0, 0, 0),
(37, 'Republik afrika tengah', 'republik_afrika_tengah', 0, 0, 0, 4, 0, 0, 0, 2, 0),
(38, 'Republik demokratik kongo', 'republik_demokratik_kongo', 75, 3, 3, 5, 20, 16, 8, 4, 0),
(39, 'Republik sudan', 'republik_sudan', 62, 0, 0, 5, 0, 13, 6, 4, 0),
(40, 'Republik tanzania', 'republik_tanzania', 62, 0, 0, 8, 0, 0, 0, 0, 0),
(41, 'Republik uganda', 'republik_uganda', 62, 0, 0, 8, 0, 0, 0, 0, 0),
(42, 'Republik zambia', 'republik_zambia', 38, 0, 0, 8, 10, 0, 0, 2, 0),
(43, 'Republik zimbabwe', 'republik_zimbabwe', 38, 2, 2, 8, 10, 8, 4, 2, 0),
(44, 'Rwanda', 'rwanda', 38, 0, 0, 9, 0, 0, 0, 0, 0),
(45, 'Sao tome dan principe', 'sao_tome_dan_principe', 0, 0, 0, 7, 0, 0, 0, 0, 0),
(46, 'Senegal', 'senegal', 38, 0, 0, 8, 0, 0, 0, 0, 4),
(47, 'Seychelles', 'seychelles', 0, 0, 0, 21, 0, 0, 0, 0, 0),
(48, 'Sierra leone', 'sierra_leone', 25, 0, 0, 5, 0, 0, 0, 2, 0),
(49, 'Somalia', 'somalia', 38, 0, 0, 5, 0, 0, 0, 2, 0),
(50, 'Sudan selatan', 'sudan_selatan', 0, 0, 0, 6, 0, 8, 4, 0, 0),
(51, 'Tanjung verde', 'tanjung_verde', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(52, 'Togo', 'togo', 25, 0, 0, 9, 0, 0, 0, 0, 0),
(53, 'Tunisia', 'tunisia', 38, 0, 0, 11, 0, 8, 4, 2, 4),
(54, 'Afganistan', 'afganistan', 62, 2, 2, 5, 17, 13, 6, 4, 8),
(55, 'Arab Saudi', 'arab_saudi', 50, 2, 2, 22, 0, 11, 5, 0, 0),
(56, 'Armenia', 'armenia', 25, 0, 0, 13, 0, 0, 0, 2, 0),
(57, 'Azerbaijan', 'azerbaijan', 0, 0, 0, 16, 0, 8, 4, 0, 0),
(58, 'Bahrain', 'bahrain', 0, 0, 0, 21, 0, 6, 4, 0, 0),
(59, 'Bangladesh', 'bangladesh', 0, 0, 0, 12, 27, 21, 10, 0, 0),
(60, 'Bhutan', 'bhutan', 20, 0, 0, 13, 8, 0, 0, 0, 0),
(61, 'Brunei', 'brunei', 0, 0, 0, 20, 0, 6, 4, 0, 0),
(62, 'China', 'china', 150, 9, 9, 16, 50, 48, 22, 14, 27),
(63, 'Filipina', 'filipina', 88, 0, 0, 12, 23, 19, 9, 5, 0),
(64, 'Georgia', 'georgia', 25, 0, 0, 15, 8, 0, 0, 0, 0),
(65, 'Hong kong', 'hong_kong', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(66, 'India', 'india', 150, 9, 0, 13, 50, 48, 22, 14, 0),
(67, 'Indonesia', 'indonesia', 125, 5, 5, 12, 33, 27, 12, 8, 15),
(68, 'Irak', 'irak', 62, 0, 0, 11, 0, 13, 6, 4, 8),
(69, 'Iran', 'iran', 75, 3, 3, 12, 20, 16, 8, 4, 9),
(70, 'Israel', 'israel', 0, 0, 0, 22, 0, 0, 4, 2, 4),
(71, 'Jepang', 'jepang', 88, 4, 4, 23, 23, 19, 9, 0, 0),
(72, 'Kamboja', 'kamboja', 38, 0, 0, 8, 0, 0, 0, 0, 0),
(73, 'Kazakhstan', 'kazakhstan', 38, 2, 2, 16, 10, 8, 4, 2, 4),
(74, 'Kirgizstan', 'kirgizstan', 25, 0, 2, 9, 8, 6, 4, 2, 0),
(75, 'Korea Selatan', 'korea_selatan', 62, 0, 0, 23, 17, 0, 0, 0, 0),
(76, 'Korea Utara', 'korea_utara', 50, 0, 2, 5, 13, 11, 5, 3, 0),
(77, 'Kuwait', 'kuwait', 0, 0, 0, 20, 0, 6, 4, 0, 0),
(78, 'Laos', 'laos', 25, 0, 0, 9, 8, 0, 0, 0, 0),
(79, 'Lebanon', 'lebanon', 25, 0, 0, 8, 0, 0, 0, 0, 0),
(80, 'Makau', 'makau', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(81, 'Malaysia', 'malaysia', 50, 0, 0, 15, 13, 11, 5, 0, 0),
(82, 'Maldives', 'maldives', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(83, 'Mongolia', 'mongolia', 25, 2, 2, 13, 8, 6, 4, 2, 4),
(84, 'Myanmar', 'myanmar', 62, 0, 0, 6, 17, 13, 6, 0, 0),
(85, 'Nepal', 'nepal', 0, 0, 0, 9, 13, 0, 0, 0, 0),
(86, 'Oman', 'oman', 25, 0, 0, 20, 0, 6, 4, 0, 0),
(87, 'Pakistan', 'pakistan', 112, 4, 4, 9, 30, 24, 11, 7, 14),
(88, 'Palestina', 'palestina', 0, 0, 0, 8, 0, 0, 0, 0, 0),
(89, 'Qatar', 'qatar', 0, 0, 0, 23, 0, 6, 4, 0, 0),
(90, 'Republik timor leste', 'republik_timor_leste', 0, 0, 0, 9, 0, 6, 4, 0, 0),
(91, 'Singapura', 'singapura', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(92, 'Sri lanka', 'sri_lanka', 38, 0, 0, 12, 0, 0, 0, 0, 0),
(93, 'Suriah', 'suriah', 38, 0, 0, 5, 0, 8, 4, 0, 0),
(94, 'Taiwan', 'taiwan', 50, 0, 0, 23, 13, 0, 5, 0, 0),
(95, 'Tajikistan', 'tajikistan', 25, 0, 0, 9, 8, 6, 4, 2, 0),
(96, 'Thailand', 'thailand', 62, 0, 0, 17, 17, 13, 6, 0, 8),
(97, 'Turkmenistan', 'turkmenistan', 25, 0, 0, 12, 0, 6, 4, 0, 0),
(98, 'Uni emirat arab', 'uni_emirat_arab', 0, 0, 0, 24, 0, 6, 4, 0, 0),
(99, 'Uzbekistan', 'uzbekistan', 50, 0, 0, 12, 13, 11, 5, 3, 0),
(100, 'Vietnam', 'vietnam', 75, 0, 3, 12, 20, 16, 8, 4, 9),
(101, 'Yaman', 'yaman', 0, 0, 0, 6, 0, 11, 5, 0, 6),
(102, 'Yordania', 'yordania', 38, 0, 0, 12, 0, 0, 0, 0, 4),
(103, 'Albania', 'albania', 25, 0, 0, 15, 8, 6, 4, 2, 4),
(104, 'Andorra', 'andorra', 20, 0, 0, 23, 0, 0, 0, 0, 0),
(105, 'Austria', 'austria', 0, 0, 0, 22, 0, 0, 0, 0, 0),
(106, 'Belanda', 'belanda', 0, 0, 0, 22, 0, 8, 4, 0, 0),
(107, 'Belarus', 'belarus', 25, 0, 0, 16, 8, 6, 4, 0, 4),
(108, 'Belgia', 'belgia', 0, 0, 0, 22, 10, 0, 0, 0, 0),
(109, 'Bosnia dan hercegovina', 'bosnia_dan_hercegovina', 25, 0, 0, 12, 8, 0, 0, 0, 0),
(110, 'Bulgaria', 'bulgaria', 25, 0, 0, 16, 8, 0, 0, 0, 0),
(111, 'Ceko', 'ceko', 38, 0, 0, 20, 10, 0, 0, 2, 0),
(112, 'Denmark', 'denmark', 0, 0, 0, 22, 0, 6, 4, 0, 0),
(113, 'Estonia', 'estonia', 0, 0, 0, 19, 8, 0, 0, 2, 0),
(114, 'Finlandia', 'finlandia', 25, 2, 0, 22, 0, 0, 0, 0, 0),
(115, 'Gibraltar', 'gibraltar', 0, 0, 0, 19, 0, 0, 0, 0, 0),
(116, 'Hungaria', 'hungaria', 0, 0, 0, 20, 8, 0, 0, 0, 0),
(117, 'Inggris', 'inggris', 62, 0, 0, 22, 17, 13, 6, 4, 8),
(118, 'Irlandia', 'irlandia', 25, 0, 0, 22, 0, 0, 0, 0, 0),
(119, 'Islandia', 'islandia', 0, 0, 0, 22, 0, 0, 0, 0, 0),
(120, 'Italia', 'italia', 62, 0, 0, 20, 0, 13, 6, 0, 0),
(121, 'Jerman', 'jerman', 75, 3, 0, 23, 20, 16, 8, 0, 9),
(122, 'Kepulauan faroe', 'kepulauan_faroe', 0, 0, 0, 20, 0, 0, 0, 0, 0),
(123, 'Kosovo', 'kosovo', 20, 0, 0, 12, 8, 0, 0, 0, 0),
(124, 'Kroasia', 'kroasia', 0, 0, 0, 20, 0, 0, 4, 0, 0),
(125, 'Latvia', 'latvia', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(126, 'Liechtenstein', 'liechtenstein', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(127, 'Lithuania', 'lithuania', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(128, 'Luksemburg', 'luksemburg', 20, 0, 0, 23, 0, 0, 0, 0, 0),
(129, 'Makedonia utara', 'makedonia_utara', 20, 0, 0, 13, 0, 0, 0, 0, 0),
(130, 'Malta', 'malta', 0, 0, 0, 19, 0, 0, 0, 0, 0),
(131, 'Moldova', 'moldova', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(132, 'Monako', 'monako', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(133, 'Montenegro', 'montenegro', 20, 0, 0, 16, 8, 0, 0, 0, 0),
(134, 'Norwegia', 'norwegia', 25, 0, 0, 22, 8, 6, 4, 0, 0),
(135, 'Polandia', 'polandia', 50, 0, 0, 19, 13, 11, 5, 3, 6),
(136, 'Portugal', 'portugal', 38, 0, 0, 20, 10, 0, 0, 2, 0),
(137, 'Prancis', 'prancis', 62, 2, 2, 23, 17, 13, 6, 4, 8),
(138, 'Republik rumania', 'republik_rumania', 38, 0, 0, 15, 10, 8, 4, 0, 0),
(139, 'Republik serbia', 'republik_serbia', 25, 0, 0, 16, 8, 0, 0, 0, 0),
(140, 'Rusia', 'rusia', 88, 4, 4, 17, 23, 19, 9, 5, 10),
(141, 'San marino', 'san_marino', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(142, 'Siprus', 'siprus', 0, 0, 0, 20, 0, 0, 0, 0, 0),
(143, 'Slovenia', 'slovenia', 20, 0, 0, 18, 8, 0, 0, 2, 0),
(144, 'Slowakia', 'slowakia', 25, 0, 0, 21, 8, 0, 0, 0, 0),
(145, 'Spanyol', 'spanyol', 62, 2, 2, 19, 17, 13, 6, 4, 8),
(146, 'Swedia', 'swedia', 38, 2, 0, 22, 0, 0, 0, 2, 0),
(147, 'Swiss', 'swiss', 25, 0, 0, 22, 0, 0, 0, 0, 4),
(148, 'Turki', 'turki', 75, 3, 0, 15, 20, 16, 8, 4, 9),
(149, 'Ukraina', 'ukraina', 50, 2, 2, 13, 13, 11, 5, 3, 6),
(150, 'Vatikan', 'vatikan', 0, 0, 0, 20, 0, 0, 0, 0, 0),
(151, 'Yunani', 'yunani', 38, 0, 0, 19, 10, 0, 0, 0, 4),
(152, 'Amerika Serikat', 'amerika_serikat', 125, 5, 5, 24, 33, 27, 12, 8, 15),
(153, 'Antigua dan Barbuda', 'antigua_dan_barbuda', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(154, 'Bahama', 'bahama', 0, 0, 0, 21, 0, 0, 0, 0, 0),
(155, 'Barbados', 'barbados', 0, 0, 0, 20, 0, 0, 0, 0, 0),
(156, 'Belize', 'belize', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(157, 'Bermuda', 'bermuda', 0, 0, 0, 23, 0, 0, 0, 0, 0),
(158, 'Costa rica', 'costa_rica', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(159, 'Curacao', 'curacao', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(160, 'Dominika', 'dominika', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(161, 'El salvador', 'el_salvador', 0, 0, 0, 13, 0, 0, 0, 0, 0),
(162, 'Greenland', 'greenland', 20, 0, 2, 20, 0, 6, 4, 2, 0),
(163, 'Grenada', 'grenada', 0, 0, 0, 17, 0, 0, 0, 0, 0),
(164, 'Guatemala', 'guatemala', 38, 0, 0, 12, 0, 8, 4, 0, 0),
(165, 'Haiti', 'haiti', 0, 0, 0, 5, 0, 0, 0, 0, 0),
(166, 'Honduras', 'honduras', 38, 0, 0, 9, 0, 0, 0, 0, 0),
(167, 'Jamaika', 'jamaika', 25, 0, 0, 13, 0, 6, 4, 0, 0),
(168, 'Kanada', 'kanada', 50, 2, 2, 21, 13, 11, 5, 3, 6),
(169, 'Kuba', 'kuba', 25, 0, 0, 11, 0, 6, 4, 0, 4),
(170, 'Meksiko', 'meksiko', 88, 4, 4, 15, 23, 19, 9, 5, 10),
(171, 'Nikaragua', 'nikaragua', 25, 0, 0, 8, 0, 0, 0, 0, 0),
(172, 'Panama', 'panama', 25, 0, 0, 16, 0, 0, 0, 0, 0),
(173, 'Puerto rico', 'puerto_rico', 0, 0, 0, 20, 0, 0, 0, 0, 0),
(174, 'Republik dominika', 'republik_dominika', 38, 0, 0, 15, 0, 0, 0, 0, 4),
(175, 'Saint kitts dan nevis', 'saint_kitts_dan_nevis', 0, 0, 0, 21, 0, 0, 0, 0, 0),
(176, 'Saint lucia', 'saint_lucia', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(177, 'Saint vincent dan grenadine', 'saint_vincent_dan_grenadine', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(178, 'Trinidad dan tobago', 'trinidad_dan_tobago', 20, 0, 0, 16, 0, 6, 4, 0, 0),
(179, 'Australia', 'australia', 50, 2, 2, 22, 13, 11, 5, 3, 6),
(180, 'Fiji', 'fiji', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(181, 'Guam', 'guam', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(182, 'Kiribati', 'kiribati', 0, 0, 0, 8, 0, 0, 0, 0, 0),
(183, 'Marshall', 'marshall', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(184, 'Mikronesia', 'mikronesia', 0, 0, 0, 8, 0, 0, 0, 0, 0),
(185, 'Nauru', 'nauru', 0, 0, 0, 13, 0, 0, 0, 0, 0),
(186, 'Palau', 'palau', 0, 0, 0, 15, 0, 0, 0, 0, 0),
(187, 'Papua nugini', 'papua_nugini', 38, 0, 0, 7, 0, 8, 4, 0, 0),
(188, 'Samoa', 'samoa', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(189, 'Samoa amerika', 'samoa_amerika', 0, 0, 0, 16, 0, 0, 0, 0, 0),
(190, 'Selandia baru', 'selandia_baru', 25, 0, 0, 22, 8, 6, 4, 0, 0),
(191, 'Tahiti', 'tahiti', 0, 0, 0, 18, 0, 0, 0, 0, 0),
(192, 'Tonga', 'tonga', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(193, 'Tuvalu', 'tuvalu', 0, 0, 0, 12, 0, 0, 0, 0, 0),
(194, 'Vanuatu', 'vanuatu', 0, 0, 0, 10, 0, 0, 0, 0, 0),
(195, 'Argentina', 'argentina', 62, 2, 2, 15, 17, 13, 6, 4, 0),
(196, 'Bolivia', 'bolivia', 38, 2, 0, 12, 10, 8, 4, 0, 4),
(197, 'Brazil', 'brazil', 112, 4, 4, 16, 30, 24, 11, 7, 0),
(198, 'Chile', 'chile', 38, 2, 2, 18, 10, 8, 4, 0, 4),
(199, 'Ekuador', 'ekuador', 38, 0, 0, 12, 0, 8, 4, 0, 0),
(200, 'Guiana prancis', 'guiana_prancis', 20, 0, 0, 19, 0, 0, 0, 0, 0),
(201, 'Guyana', 'guyana', 20, 0, 0, 16, 0, 6, 4, 0, 0),
(202, 'Kolombia', 'kolombia', 62, 0, 0, 15, 17, 13, 6, 4, 8),
(203, 'Paraguay', 'paraguay', 25, 0, 0, 12, 0, 0, 0, 0, 0),
(204, 'Peru', 'peru', 50, 2, 0, 16, 13, 11, 5, 3, 0),
(205, 'Suriname', 'suriname', 20, 0, 0, 12, 0, 6, 4, 0, 0),
(206, 'Uruguay', 'uruguay', 25, 0, 0, 20, 0, 0, 0, 0, 0),
(207, 'Venezuela', 'venezuela', 50, 2, 2, 7, 13, 11, 5, 0, 0);

-- ========================================================
-- DATABASE ALOKASI & KEBIJAKAN SUBSIDI (207 NEGARA)
-- File: d:\project-sendiri\em\json\database_alokasi_subsidi\database_alokasi_subsidi.sql
-- Description: Menyimpan status aktif (true/false) 18 kartu subsidi untuk 207 negara
-- ========================================================

DROP TABLE IF EXISTS database_alokasi_subsidi;
CREATE TABLE IF NOT EXISTS database_alokasi_subsidi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    country_id INT NOT NULL,
    country_slug VARCHAR(100) NOT NULL UNIQUE,
    country_name VARCHAR(100) NOT NULL,
    iso VARCHAR(10) NOT NULL,
    sub_bbm BOOLEAN NOT NULL DEFAULT true,
    sub_listrik BOOLEAN NOT NULL DEFAULT true,
    sub_lpg BOOLEAN NOT NULL DEFAULT true,
    sub_pdam BOOLEAN NOT NULL DEFAULT true,
    sub_pupuk BOOLEAN NOT NULL DEFAULT true,
    sub_sembako BOOLEAN NOT NULL DEFAULT true,
    sub_bantuan_pangan BOOLEAN NOT NULL DEFAULT true,
    sub_pendidikan BOOLEAN NOT NULL DEFAULT true,
    sub_bpjs BOOLEAN NOT NULL DEFAULT true,
    sub_vaksin BOOLEAN NOT NULL DEFAULT false,
    sub_transport_publik BOOLEAN NOT NULL DEFAULT true,
    sub_perumahan BOOLEAN NOT NULL DEFAULT true,
    sub_ev BOOLEAN NOT NULL DEFAULT false,
    sub_kur BOOLEAN NOT NULL DEFAULT true,
    sub_pajak_umkm BOOLEAN NOT NULL DEFAULT true,
    sub_blt BOOLEAN NOT NULL DEFAULT true,
    sub_pensiun BOOLEAN NOT NULL DEFAULT true,
    sub_bencana BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO database_alokasi_subsidi 
(country_id, country_slug, country_name, iso, sub_bbm, sub_listrik, sub_lpg, sub_pdam, sub_pupuk, sub_sembako, sub_bantuan_pangan, sub_pendidikan, sub_bpjs, sub_vaksin, sub_transport_publik, sub_perumahan, sub_ev, sub_kur, sub_pajak_umkm, sub_blt, sub_pensiun, sub_bencana) 
VALUES
(1, 'afrika_selatan', 'Afrika Selatan', 'za', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(2, 'aljazair', 'Aljazair', 'dz', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(3, 'angola', 'Angola', 'ao', true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, false, true),
(4, 'benin', 'Benin', 'bj', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(5, 'botswana', 'Botswana', 'bw', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(6, 'burkina_faso', 'Burkina faso', 'bf', true, true, true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true),
(7, 'burundi', 'Burundi', 'bi', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(8, 'chad', 'Chad', 'td', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(9, 'djibouti', 'Djibouti', 'dj', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(10, 'eritrea', 'Eritrea', 'er', true, true, true, false, true, true, true, true, true, false, true, true, false, true, false, true, true, true),
(11, 'eswatini', 'Eswatini', 'sz', true, false, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(12, 'ethiopia', 'Ethiopia', 'et', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(13, 'gabon', 'Gabon', 'ga', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(14, 'gambia', 'Gambia', 'gm', true, true, true, true, true, true, false, true, true, false, true, true, false, false, true, false, true, false),
(15, 'ghana', 'Ghana', 'gh', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(16, 'guinea', 'Guinea', 'gn', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(17, 'guinea_bissau', 'Guinea bissau', 'gw', false, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true, true),
(18, 'kamerun', 'Kamerun', 'cm', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(19, 'kenya', 'Kenya', 'ke', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(20, 'komoro', 'Komoro', 'km', true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true),
(21, 'kongo', 'Kongo', 'cg', true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true, true),
(22, 'lesotho', 'Lesotho', 'ls', true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
(23, 'liberia', 'Liberia', 'lr', true, true, true, true, true, true, true, true, false, false, true, true, false, false, true, false, true, true),
(24, 'libya', 'Libya', 'ly', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(25, 'madagaskar', 'Madagaskar', 'mg', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(26, 'malawi', 'Malawi', 'mw', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(27, 'mali', 'Mali', 'ml', true, true, true, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true),
(28, 'maroko', 'Maroko', 'ma', true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false),
(29, 'mauritania', 'Mauritania', 'mr', true, true, true, true, true, false, true, true, true, false, true, true, true, false, true, false, false, true),
(30, 'mauritius', 'Mauritius', 'mu', true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true),
(31, 'mesir', 'Mesir', 'eg', true, true, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(32, 'mozambik', 'Mozambik', 'mz', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(33, 'namibia', 'Namibia', 'na', true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, false, true),
(34, 'niger', 'Niger', 'ne', true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
(35, 'nigeria', 'Nigeria', 'ng', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(36, 'pantai_gading', 'Pantai gading', 'ci', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(37, 'republik_afrika_tengah', 'Republik afrika tengah', 'cf', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(38, 'republik_demokratik_kongo', 'Republik demokratik kongo', 'cd', true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true, true),
(39, 'republik_sudan', 'Republik sudan', 'sd', true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, false, true),
(40, 'republik_tanzania', 'Republik tanzania', 'tz', true, true, true, true, true, true, true, true, false, true, true, true, false, false, true, false, true, true),
(41, 'republik_uganda', 'Republik uganda', 'ug', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(42, 'republik_zambia', 'Republik zambia', 'zm', true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true),
(43, 'republik_zimbabwe', 'Republik zimbabwe', 'zw', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(44, 'rwanda', 'Rwanda', 'rw', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(45, 'sao_tome_dan_principe', 'Sao tome dan principe', 'st', true, true, true, true, true, true, true, false, true, false, true, true, false, false, true, false, true, true),
(46, 'senegal', 'Senegal', 'sn', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(47, 'seychelles', 'Seychelles', 'sc', true, true, true, false, true, true, true, true, true, false, true, true, false, true, false, true, true, true),
(48, 'sierra_leone', 'Sierra leone', 'sl', true, true, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(49, 'somalia', 'Somalia', 'so', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(50, 'sudan_selatan', 'Sudan selatan', 'sd', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(51, 'tanjung_verde', 'Tanjung verde', 'cv', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(52, 'togo', 'Togo', 'tg', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(53, 'tunisia', 'Tunisia', 'tn', true, true, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(54, 'afganistan', 'Afganistan', 'af', false, true, true, true, true, true, true, true, true, true, true, false, true, false, true, false, true, true),
(55, 'arab_saudi', 'Arab Saudi', 'sa', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(56, 'armenia', 'Armenia', 'am', true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
(57, 'azerbaijan', 'Azerbaijan', 'az', true, true, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(58, 'bahrain', 'Bahrain', 'bh', true, true, true, true, true, true, true, false, true, false, true, true, true, true, true, true, true, true),
(59, 'bangladesh', 'Bangladesh', 'bd', true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false),
(60, 'bhutan', 'Bhutan', 'bt', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(61, 'brunei', 'Brunei', 'bn', true, true, true, true, true, false, true, true, true, true, true, true, false, false, true, false, false, true),
(62, 'china', 'China', 'cn', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(63, 'filipina', 'Filipina', 'ph', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(64, 'georgia', 'Georgia', 'ge', true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, false, true),
(65, 'hong_kong', 'Hong kong', 'hk', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(66, 'india', 'India', 'in', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(67, 'indonesia', 'Indonesia', 'id', true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true),
(68, 'irak', 'Irak', 'iq', true, false, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true),
(69, 'iran', 'Iran', 'ir', true, true, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(70, 'israel', 'Israel', 'il', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(71, 'jepang', 'Jepang', 'jp', true, true, true, true, true, true, true, false, true, true, true, true, true, false, true, false, true, true),
(72, 'kamboja', 'Kamboja', 'kh', true, true, true, true, true, false, true, true, true, true, true, true, false, true, true, true, false, true),
(73, 'kazakhstan', 'Kazakhstan', 'kz', true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true),
(74, 'kirgizstan', 'Kirgizstan', 'kg', false, true, true, true, true, true, true, true, true, false, true, false, false, false, true, false, true, true),
(75, 'korea_selatan', 'Korea Selatan', 'kr', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(76, 'korea_utara', 'Korea Utara', 'kp', true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false),
(77, 'kuwait', 'Kuwait', 'kw', true, true, false, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(78, 'laos', 'Laos', 'la', true, false, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(79, 'lebanon', 'Lebanon', 'lb', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(80, 'makau', 'Makau', 'mo', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(81, 'malaysia', 'Malaysia', 'my', true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true),
(82, 'maldives', 'Maldives', 'mv', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(83, 'mongolia', 'Mongolia', 'mn', true, true, true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true),
(84, 'myanmar', 'Myanmar', 'mm', true, true, true, true, true, true, false, true, true, false, true, true, true, true, true, true, true, false),
(85, 'nepal', 'Nepal', 'np', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(86, 'oman', 'Oman', 'om', true, true, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(87, 'pakistan', 'Pakistan', 'pk', true, true, true, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true),
(88, 'palestina', 'Palestina', 'ps', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(89, 'qatar', 'Qatar', 'qa', true, true, true, true, true, true, true, true, true, false, false, true, false, false, true, false, true, true),
(90, 'republik_timor_leste', 'Republik timor leste', 'tl', true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, false),
(91, 'singapura', 'Singapura', 'sg', true, false, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(92, 'sri_lanka', 'Sri lanka', 'lk', true, true, true, true, true, true, false, true, true, false, true, true, false, true, true, true, true, false),
(93, 'suriah', 'Suriah', 'sy', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(94, 'taiwan', 'Taiwan', 'cn-tw', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(95, 'tajikistan', 'Tajikistan', 'tj', true, true, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(96, 'thailand', 'Thailand', 'th', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(97, 'turkmenistan', 'Turkmenistan', 'tm', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(98, 'uni_emirat_arab', 'Uni emirat arab', 'ae', true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true),
(99, 'uzbekistan', 'Uzbekistan', 'uz', true, true, true, true, true, false, true, true, true, true, true, true, false, false, true, false, false, true),
(100, 'vietnam', 'Vietnam', 'vn', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(101, 'yaman', 'Yaman', 'ye', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(102, 'yordania', 'Yordania', 'jo', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(103, 'albania', 'Albania', 'al', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(104, 'andorra', 'Andorra', 'ad', true, true, true, true, true, true, false, true, true, false, true, true, true, true, true, true, true, false),
(105, 'austria', 'Austria', 'at', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(106, 'belanda', 'Belanda', 'nl', true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true),
(107, 'belarus', 'Belarus', 'by', true, true, true, false, true, true, true, true, true, false, true, true, false, true, false, true, true, true),
(108, 'belgia', 'Belgia', 'be', true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
(109, 'bosnia_dan_hercegovina', 'Bosnia dan hercegovina', 'ba', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(110, 'bulgaria', 'Bulgaria', 'bg', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(111, 'ceko', 'Ceko', 'cz', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(112, 'denmark', 'Denmark', 'dk', true, true, true, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true),
(113, 'estonia', 'Estonia', 'ee', true, true, false, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true),
(114, 'finlandia', 'Finlandia', 'fi', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(115, 'gibraltar', 'Gibraltar', 'gi', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(116, 'hungaria', 'Hungaria', 'hu', true, true, true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, false),
(117, 'inggris', 'Inggris', 'gb', true, true, true, false, true, true, true, true, true, false, true, true, false, false, false, false, true, true),
(118, 'irlandia', 'Irlandia', 'ie', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(119, 'islandia', 'Islandia', 'is', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(120, 'italia', 'Italia', 'it', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(121, 'jerman', 'Jerman', 'de', true, true, true, true, true, true, false, true, true, false, true, true, false, true, true, true, true, false),
(122, 'kepulauan_faroe', 'Kepulauan faroe', 'fo', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(123, 'kosovo', 'Kosovo', 'xk', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(124, 'kroasia', 'Kroasia', 'hr', true, true, true, true, false, true, true, true, true, true, true, true, false, false, true, false, true, true),
(125, 'latvia', 'Latvia', 'lv', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(126, 'liechtenstein', 'Liechtenstein', 'li', true, true, true, true, true, true, false, true, true, false, true, true, false, true, true, true, true, false),
(127, 'lithuania', 'Lithuania', 'lt', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(128, 'luksemburg', 'Luksemburg', 'lu', true, true, true, true, false, true, true, true, true, false, true, true, true, true, true, true, true, true),
(129, 'makedonia_utara', 'Makedonia utara', 'mk', true, false, true, true, true, true, true, true, true, true, true, true, false, false, true, false, true, true),
(130, 'malta', 'Malta', 'mt', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(131, 'moldova', 'Moldova', 'md', false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true),
(132, 'monako', 'Monako', 'mc', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(133, 'montenegro', 'Montenegro', 'me', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(134, 'norwegia', 'Norwegia', 'no', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(135, 'polandia', 'Polandia', 'pl', true, false, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(136, 'portugal', 'Portugal', 'pt', false, true, true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true),
(137, 'prancis', 'Prancis', 'fr', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(138, 'republik_rumania', 'Republik rumania', 'ro', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(139, 'republik_serbia', 'Republik serbia', 'rs', true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true),
(140, 'rusia', 'Rusia', 'ru', true, true, true, false, true, true, true, true, true, true, true, true, true, false, false, false, true, true),
(141, 'san_marino', 'San marino', 'sm', true, true, true, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true),
(142, 'siprus', 'Siprus', 'cy', true, true, true, true, true, true, true, true, true, false, true, true, true, false, true, false, true, true),
(143, 'slovenia', 'Slovenia', 'si', true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true),
(144, 'slowakia', 'Slowakia', 'sk', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(145, 'spanyol', 'Spanyol', 'es', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(146, 'swedia', 'Swedia', 'se', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(147, 'swiss', 'Swiss', 'ch', false, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true, true),
(148, 'turki', 'Turki', 'tr', true, false, true, true, true, true, true, true, true, false, true, true, true, false, true, false, true, true),
(149, 'ukraina', 'Ukraina', 'ua', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(150, 'vatikan', 'Vatikan', 'va', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(151, 'yunani', 'Yunani', 'gr', true, true, true, true, true, true, true, true, true, false, true, true, false, false, true, false, true, true),
(152, 'amerika_serikat', 'Amerika Serikat', 'us', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(153, 'antigua_dan_barbuda', 'Antigua dan Barbuda', 'ag', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(154, 'bahama', 'Bahama', 'bs', true, true, true, true, true, true, true, true, false, true, true, true, false, false, true, false, true, true),
(155, 'barbados', 'Barbados', 'bb', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(156, 'belize', 'Belize', 'bz', true, false, true, true, true, true, true, true, true, false, true, true, false, false, true, false, true, true),
(157, 'bermuda', 'Bermuda', 'bm', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(158, 'costa_rica', 'Costa rica', 'cr', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(159, 'curacao', 'Curacao', 'cw', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(160, 'dominika', 'Dominika', 'dm', true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false),
(161, 'el_salvador', 'El salvador', 'sv', true, true, true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true),
(162, 'greenland', 'Greenland', 'gl', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(163, 'grenada', 'Grenada', 'gd', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(164, 'guatemala', 'Guatemala', 'gt', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(165, 'haiti', 'Haiti', 'ht', true, true, true, true, true, true, true, true, false, true, true, true, false, true, true, true, true, true),
(166, 'honduras', 'Honduras', 'hn', true, true, true, true, true, true, true, false, true, false, true, true, false, true, true, true, true, true),
(167, 'jamaika', 'Jamaika', 'jm', true, true, true, true, true, true, true, true, false, false, true, true, false, true, true, true, true, true),
(168, 'kanada', 'Kanada', 'ca', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(169, 'kuba', 'Kuba', 'cu', true, true, true, false, true, true, true, true, true, false, true, true, true, true, false, true, true, true),
(170, 'meksiko', 'Meksiko', 'mx', true, true, true, false, true, true, true, true, true, false, true, true, false, true, false, true, true, true),
(171, 'nikaragua', 'Nikaragua', 'ni', true, true, false, true, true, true, true, true, true, false, true, true, false, false, true, false, true, true),
(172, 'panama', 'Panama', 'pa', true, true, true, true, true, true, false, true, true, true, true, true, false, false, true, false, true, false),
(173, 'puerto_rico', 'Puerto rico', 'pr', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(174, 'republik_dominika', 'Republik dominika', 'do', true, true, true, true, true, true, true, false, true, true, true, true, false, true, true, true, true, true),
(175, 'saint_kitts_dan_nevis', 'Saint kitts dan nevis', 'kn', true, false, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(176, 'saint_lucia', 'Saint lucia', 'lc', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(177, 'saint_vincent_dan_grenadine', 'Saint vincent dan grenadine', 'vc', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(178, 'trinidad_dan_tobago', 'Trinidad dan tobago', 'tt', true, true, true, false, true, true, true, true, true, false, true, true, false, true, false, true, true, true),
(179, 'australia', 'Australia', 'au', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(180, 'fiji', 'Fiji', 'fj', true, true, true, true, true, true, true, true, true, false, false, true, true, true, true, true, true, true),
(181, 'guam', 'Guam', 'gu', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(182, 'kiribati', 'Kiribati', 'ki', true, true, true, true, true, true, true, true, true, true, false, true, false, true, true, true, true, true),
(183, 'marshall', 'Marshall', 'mh', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(184, 'mikronesia', 'Mikronesia', 'fm', true, false, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(185, 'nauru', 'Nauru', 'nr', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(186, 'palau', 'Palau', 'pw', true, true, true, true, true, true, true, false, true, false, true, true, true, true, true, true, true, true),
(187, 'papua_nugini', 'Papua nugini', 'pg', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(188, 'samoa', 'Samoa', 'ws', true, true, true, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true),
(189, 'samoa_amerika', 'Samoa amerika', 'ws', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(190, 'selandia_baru', 'Selandia baru', 'nz', true, true, true, true, true, true, false, true, true, true, true, true, false, true, true, true, true, false),
(191, 'tahiti', 'Tahiti', 'pf', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(192, 'tonga', 'Tonga', 'to', true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true),
(193, 'tuvalu', 'Tuvalu', 'tv', true, true, true, true, true, true, true, true, true, false, false, true, false, true, true, true, true, true),
(194, 'vanuatu', 'Vanuatu', 'vu', true, true, true, true, false, true, true, true, true, false, true, true, false, true, true, true, true, true),
(195, 'argentina', 'Argentina', 'ar', true, true, false, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(196, 'bolivia', 'Bolivia', 'bo', true, true, true, true, true, true, true, true, true, true, true, true, false, true, true, true, true, true),
(197, 'brazil', 'Brazil', 'br', true, true, true, true, true, true, false, true, true, false, true, true, false, true, true, true, true, false),
(198, 'chile', 'Chile', 'cl', false, true, true, true, true, true, true, true, true, false, true, false, false, true, true, true, true, true),
(199, 'ekuador', 'Ekuador', 'ec', true, true, true, true, true, false, true, true, true, false, true, true, false, true, true, true, false, true),
(200, 'guiana_prancis', 'Guiana prancis', 'gf', true, true, true, true, false, true, true, true, true, false, true, true, false, false, true, false, true, true),
(201, 'guyana', 'Guyana', 'gy', true, true, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(202, 'kolombia', 'Kolombia', 'co', true, true, true, true, true, true, true, true, true, false, true, true, false, true, true, true, true, true),
(203, 'paraguay', 'Paraguay', 'py', true, true, true, true, false, true, true, true, true, true, true, true, false, true, true, true, true, true),
(204, 'peru', 'Peru', 'pe', true, true, false, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true),
(205, 'suriname', 'Suriname', 'sr', true, true, true, false, true, true, true, true, true, true, true, true, false, true, false, true, true, true),
(206, 'uruguay', 'Uruguay', 'uy', true, true, true, true, true, true, false, true, true, false, true, true, false, true, true, true, true, false),
(207, 'venezuela', 'Venezuela', 've', true, true, false, true, true, true, true, true, true, false, true, true, true, true, true, true, true, true);

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
(75, 'Korea Selatan', 'korea_selatan', 6, 6, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
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
(117, 'Inggris', 'inggris', 5, 6, 6, 6, 6, 6, 5, 6, 6, 5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 5), -- Maju
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
(137, 'Prancis', 'prancis', 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
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
(179, 'Australia', 'australia', 6, 5, 6, 6, 6, 5, 6, 6, 6, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6), -- Maju
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

-- Database Pajak Negara SQL Export
-- Total 207 Negara

DROP TABLE IF EXISTS database_pajak_negara;
CREATE TABLE IF NOT EXISTS database_pajak_negara (
    id INT PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    country_slug VARCHAR(100) NOT NULL,
    tarif_ppn INT NOT NULL,
    tarif_korporasi INT NOT NULL,
    tarif_penghasilan INT NOT NULL,
    tarif_bea_cukai INT NOT NULL,
    tarif_lingkungan INT NOT NULL
);

INSERT INTO database_pajak_negara (
    id, country, country_slug, tarif_ppn, tarif_korporasi, tarif_penghasilan, tarif_bea_cukai, tarif_lingkungan
) VALUES
    (1, 'Afrika Selatan', 'afrika_selatan', 15, 27, 45, 5, 0),
    (2, 'Aljazair', 'aljazair', 19, 26, 40, 8, 2),
    (3, 'Angola', 'angola', 14, 35, 17, 6, 1),
    (4, 'Benin', 'benin', 18, 30, 35, 5, 0),
    (5, 'Botswana', 'botswana', 14, 22, 25, 6, 1),
    (6, 'Burkina Faso', 'burkina_faso', 18, 28, 40, 5, 0),
    (7, 'Burundi', 'burundi', 18, 32, 38, 8, 0),
    (8, 'Chad', 'chad', 18, 35, 35, 7, 1),
    (9, 'Djibouti', 'djibouti', 10, 25, 30, 8, 0),
    (10, 'Eritrea', 'eritrea', 10, 30, 35, 5, 0),
    (11, 'Eswatini', 'eswatini', 14, 28, 32, 5, 0),
    (12, 'Ethiopia', 'ethiopia', 15, 30, 36, 5, 1),
    (13, 'Gabon', 'gabon', 18, 35, 40, 8, 2),
    (14, 'Gambia', 'gambia', 15, 28, 32, 5, 0),
    (15, 'Ghana', 'ghana', 15, 25, 35, 5, 1),
    (16, 'Guinea', 'guinea', 18, 32, 40, 5, 0),
    (17, 'Guinea Bissau', 'guinea_bissau', 10, 30, 35, 5, 0),
    (18, 'Kamerun', 'kamerun', 19, 30, 38, 6, 0),
    (19, 'Kenya', 'kenya', 16, 30, 33, 5, 1),
    (20, 'Komoro', 'komoro', 10, 25, 35, 5, 0),
    (21, 'Kongo', 'kongo', 16, 37, 40, 8, 1),
    (22, 'Lesotho', 'lesotho', 14, 25, 32, 8, 0),
    (23, 'Liberia', 'liberia', 10, 25, 30, 5, 0),
    (24, 'Libya', 'libya', 0, 20, 25, 5, 0),
    (25, 'Madagaskar', 'madagaskar', 20, 20, 35, 5, 0),
    (26, 'Malawi', 'malawi', 17, 30, 38, 5, 0),
    (27, 'Mali', 'mali', 18, 30, 40, 5, 0),
    (28, 'Maroko', 'maroko', 20, 26, 45, 6, 2),
    (29, 'Mauritania', 'mauritania', 14, 25, 40, 5, 0),
    (30, 'Mauritius', 'mauritius', 15, 17, 30, 8, 1),
    (31, 'Mesir', 'mesir', 14, 25, 33, 8, 2),
    (32, 'Mozambik', 'mozambik', 17, 32, 40, 5, 0),
    (33, 'Namibia', 'namibia', 15, 37, 37, 6, 1),
    (34, 'Niger', 'niger', 19, 28, 40, 5, 0),
    (35, 'Nigeria', 'nigeria', 8, 30, 32, 5, 1),
    (36, 'Pantai Gading', 'pantai_gading', 18, 27, 45, 5, 0),
    (37, 'Republik Afrika Tengah', 'republik_afrika_tengah', 19, 35, 50, 8, 1),
    (38, 'Republik Demokratik Kongo', 'republik_demokratik_kongo', 16, 37, 40, 9, 1),
    (39, 'Republik Sudan', 'republik_sudan', 17, 29, 32, 5, 1),
    (40, 'Republik Tanzania', 'republik_tanzania', 18, 30, 35, 5, 1),
    (41, 'Republik Uganda', 'republik_uganda', 18, 30, 35, 5, 1),
    (42, 'Republik Zambia', 'republik_zambia', 16, 35, 38, 5, 1),
    (43, 'Republik Zimbabwe', 'republik_zimbabwe', 15, 26, 42, 7, 1),
    (44, 'Rwanda', 'rwanda', 18, 30, 35, 5, 0),
    (45, 'Sao Tome Dan Principe', 'sao_tome_dan_principe', 15, 27, 30, 5, 0),
    (46, 'Senegal', 'senegal', 18, 30, 40, 5, 0),
    (47, 'Seychelles', 'seychelles', 0, 20, 15, 0, 0),
    (48, 'Sierra Leone', 'sierra_leone', 15, 30, 40, 5, 0),
    (49, 'Somalia', 'somalia', 16, 25, 30, 5, 0),
    (50, 'Sudan Selatan', 'sudan_selatan', 5, 30, 25, 8, 0),
    (51, 'Tanjung Verde', 'tanjung_verde', 15, 22, 33, 4, 1),
    (52, 'Togo', 'togo', 18, 30, 36, 5, 0),
    (53, 'Tunisia', 'tunisia', 18, 25, 35, 6, 1),
    (54, 'Afganistan', 'afganistan', 10, 20, 25, 5, 0),
    (55, 'Arab Saudi', 'arab_saudi', 15, 20, 0, 5, 0),
    (56, 'Armenia', 'armenia', 20, 18, 23, 5, 0),
    (57, 'Azerbaijan', 'azerbaijan', 18, 20, 32, 5, 0),
    (58, 'Bahrain', 'bahrain', 10, 0, 0, 5, 0),
    (59, 'Bangladesh', 'bangladesh', 15, 28, 30, 5, 1),
    (60, 'Bhutan', 'bhutan', 15, 10, 30, 10, 2),
    (61, 'Brunei', 'brunei', 0, 25, 0, 5, 0),
    (62, 'China', 'china', 13, 25, 45, 5, 2),
    (63, 'Filipina', 'filipina', 12, 30, 35, 5, 1),
    (64, 'Georgia', 'georgia', 18, 15, 20, 5, 0),
    (65, 'Hong Kong', 'hong_kong', 0, 17, 15, 0, 0),
    (66, 'India', 'india', 18, 25, 42, 8, 1),
    (67, 'Indonesia', 'indonesia', 11, 22, 30, 5, 1),
    (68, 'Irak', 'irak', 10, 20, 30, 5, 0),
    (69, 'Iran', 'iran', 9, 25, 35, 5, 0),
    (70, 'Israel', 'israel', 17, 21, 50, 8, 2),
    (71, 'Jepang', 'jepang', 10, 23, 10, 3, 1),
    (72, 'Kamboja', 'kamboja', 10, 20, 20, 5, 0),
    (73, 'Kazakhstan', 'kazakhstan', 12, 20, 10, 5, 0),
    (74, 'Kirgizstan', 'kirgizstan', 12, 10, 10, 5, 0),
    (75, 'Korea Selatan', 'korea_selatan', 10, 25, 45, 4, 1),
    (76, 'Korea Utara', 'korea_utara', 15, 50, 40, 10, 0),
    (77, 'Kuwait', 'kuwait', 0, 15, 0, 4, 0),
    (78, 'Laos', 'laos', 10, 24, 20, 5, 0),
    (79, 'Lebanon', 'lebanon', 10, 17, 23, 5, 0),
    (80, 'Makau', 'makau', 0, 12, 12, 0, 0),
    (81, 'Malaysia', 'malaysia', 0, 24, 33, 5, 0),
    (82, 'Maldives', 'maldives', 8, 0, 0, 5, 1),
    (83, 'Mongolia', 'mongolia', 10, 10, 10, 5, 0),
    (84, 'Myanmar', 'myanmar', 5, 25, 25, 5, 0),
    (85, 'Nepal', 'nepal', 13, 25, 30, 5, 0),
    (86, 'Oman', 'oman', 5, 20, 0, 5, 0),
    (87, 'Pakistan', 'pakistan', 17, 29, 35, 5, 0),
    (88, 'Palestina', 'palestina', 16, 20, 25, 5, 0),
    (89, 'Qatar', 'qatar', 0, 10, 0, 5, 0),
    (90, 'Republik Timor Leste', 'republik_timor_leste', 5, 10, 12, 5, 0),
    (91, 'Singapura', 'singapura', 8, 17, 22, 0, 0),
    (92, 'Sri Lanka', 'sri_lanka', 15, 28, 36, 5, 0),
    (93, 'Suriah', 'suriah', 10, 22, 23, 5, 0),
    (94, 'Taiwan', 'taiwan', 5, 20, 40, 5, 1),
    (95, 'Tajikistan', 'tajikistan', 20, 25, 13, 5, 0),
    (96, 'Thailand', 'thailand', 7, 20, 35, 5, 0),
    (97, 'Turkmenistan', 'turkmenistan', 18, 20, 10, 5, 0),
    (98, 'Uni Emirat Arab', 'uni_emirat_arab', 5, 0, 0, 5, 0),
    (99, 'Uzbekistan', 'uzbekistan', 20, 20, 13, 5, 0),
    (100, 'Vietnam', 'vietnam', 10, 20, 35, 5, 0),
    (101, 'Yaman', 'yaman', 5, 20, 20, 5, 0),
    (102, 'Yordania', 'yordania', 16, 20, 28, 5, 0),
    (103, 'Albania', 'albania', 20, 15, 23, 5, 0),
    (104, 'Andorra', 'andorra', 5, 10, 24, 0, 0),
    (105, 'Austria', 'austria', 20, 25, 55, 0, 1),
    (106, 'Belanda', 'belanda', 21, 19, 50, 0, 1),
    (107, 'Belarus', 'belarus', 20, 18, 30, 5, 0),
    (108, 'Belgia', 'belgia', 21, 25, 50, 0, 1),
    (109, 'Bosnia Dan Hercegovina', 'bosnia_dan_hercegovina', 17, 20, 38, 5, 0),
    (110, 'Bulgaria', 'bulgaria', 20, 10, 32, 5, 0),
    (111, 'Ceko', 'ceko', 21, 19, 33, 0, 0),
    (112, 'Denmark', 'denmark', 25, 22, 56, 0, 2),
    (113, 'Estonia', 'estonia', 20, 20, 42, 0, 0),
    (114, 'Finlandia', 'finlandia', 24, 20, 52, 0, 2),
    (115, 'Gibraltar', 'gibraltar', 15, 10, 25, 0, 0),
    (116, 'Hungaria', 'hungaria', 27, 19, 15, 0, 0),
    (117, 'Inggris', 'inggris', 20, 25, 45, 0, 0),
    (118, 'Irlandia', 'irlandia', 23, 15, 48, 0, 0),
    (119, 'Islandia', 'islandia', 24, 20, 46, 0, 2),
    (120, 'Italia', 'italia', 22, 24, 43, 0, 1),
    (121, 'Jerman', 'jerman', 19, 32, 52, 0, 1),
    (122, 'Kepulauan Faroe', 'kepulauan_faroe', 0, 20, 38, 0, 0),
    (123, 'Kosovo', 'kosovo', 18, 10, 20, 5, 0),
    (124, 'Kroasia', 'kroasia', 25, 18, 37, 0, 0),
    (125, 'Latvia', 'latvia', 21, 20, 42, 0, 0),
    (126, 'Liechtenstein', 'liechtenstein', 8, 13, 20, 0, 0),
    (127, 'Lithuania', 'lithuania', 21, 20, 32, 0, 0),
    (128, 'Luksemburg', 'luksemburg', 17, 17, 45, 0, 0),
    (129, 'Makedonia Utara', 'makedonia_utara', 18, 10, 18, 5, 0),
    (130, 'Malta', 'malta', 18, 35, 35, 0, 0),
    (131, 'Moldova', 'moldova', 20, 12, 18, 5, 0),
    (132, 'Monako', 'monako', 20, 33, 0, 0, 0),
    (133, 'Montenegro', 'montenegro', 21, 15, 18, 5, 0),
    (134, 'Norwegia', 'norwegia', 25, 22, 50, 0, 2),
    (135, 'Polandia', 'polandia', 23, 19, 32, 0, 0),
    (136, 'Portugal', 'portugal', 23, 22, 48, 0, 1),
    (137, 'Prancis', 'prancis', 20, 25, 45, 0, 1),
    (138, 'Republik Rumania', 'republik_rumania', 19, 16, 38, 0, 0),
    (139, 'Republik Serbia', 'republik_serbia', 20, 15, 17, 5, 0),
    (140, 'Rusia', 'rusia', 20, 20, 15, 5, 0),
    (141, 'San Marino', 'san_marino', 17, 17, 43, 0, 0),
    (142, 'Siprus', 'siprus', 19, 13, 32, 0, 0),
    (143, 'Slovenia', 'slovenia', 22, 19, 50, 0, 1),
    (144, 'Slowakia', 'slowakia', 20, 21, 32, 0, 0),
    (145, 'Spanyol', 'spanyol', 21, 25, 45, 0, 1),
    (146, 'Swedia', 'swedia', 25, 21, 57, 0, 2),
    (147, 'Swiss', 'swiss', 8, 16, 42, 0, 1),
    (148, 'Turki', 'turki', 18, 22, 32, 10, 1),
    (149, 'Ukraina', 'ukraina', 20, 18, 18, 5, 0),
    (150, 'Vatikan', 'vatikan', 22, 27, 50, 0, 0),
    (151, 'Yunani', 'yunani', 24, 22, 44, 0, 1),
    (152, 'Amerika Serikat', 'amerika_serikat', 0, 21, 37, 3, 0),
    (153, 'Antigua Dan Barbuda', 'antigua_dan_barbuda', 15, 25, 0, 5, 0),
    (154, 'Bahama', 'bahama', 8, 0, 0, 10, 0),
    (155, 'Barbados', 'barbados', 18, 25, 33, 5, 0),
    (156, 'Belize', 'belize', 13, 25, 25, 5, 0),
    (157, 'Bermuda', 'bermuda', 5, 1, 0, 15, 0),
    (158, 'Costa Rica', 'costa_rica', 13, 30, 25, 5, 1),
    (159, 'Curacao', 'curacao', 6, 35, 50, 3, 0),
    (160, 'Dominika', 'dominika', 15, 25, 32, 5, 0),
    (161, 'El Salvador', 'el_salvador', 13, 30, 30, 5, 0),
    (162, 'Greenland', 'greenland', 0, 19, 41, 0, 0),
    (163, 'Grenada', 'grenada', 15, 25, 33, 5, 0),
    (164, 'Guatemala', 'guatemala', 12, 25, 37, 5, 0),
    (165, 'Haiti', 'haiti', 10, 30, 30, 5, 0),
    (166, 'Honduras', 'honduras', 15, 25, 32, 5, 0),
    (167, 'Jamaika', 'jamaika', 15, 25, 33, 5, 0),
    (168, 'Kanada', 'kanada', 5, 27, 54, 0, 1),
    (169, 'Kuba', 'kuba', 5, 50, 50, 20, 0),
    (170, 'Meksiko', 'meksiko', 16, 30, 35, 5, 1),
    (171, 'Nikaragua', 'nikaragua', 15, 30, 30, 5, 0),
    (172, 'Panama', 'panama', 7, 25, 0, 5, 0),
    (173, 'Puerto Rico', 'puerto_rico', 0, 38, 37, 0, 0),
    (174, 'Republik Dominika', 'republik_dominika', 18, 28, 32, 5, 0),
    (175, 'Saint Kitts Dan Nevis', 'saint_kitts_dan_nevis', 17, 25, 0, 5, 0),
    (176, 'Saint Lucia', 'saint_lucia', 15, 25, 33, 5, 0),
    (177, 'Saint Vincent Dan Grenadine', 'saint_vincent_dan_grenadine', 15, 25, 33, 5, 0),
    (178, 'Trinidad Dan Tobago', 'trinidad_dan_tobago', 13, 25, 35, 5, 0),
    (179, 'Australia', 'australia', 10, 30, 47, 0, 1),
    (180, 'Fiji', 'fiji', 9, 20, 32, 5, 0),
    (181, 'Guam', 'guam', 4, 37, 37, 0, 0),
    (182, 'Kiribati', 'kiribati', 0, 25, 30, 5, 0),
    (183, 'Marshall', 'marshall', 0, 35, 35, 5, 0),
    (184, 'Mikronesia', 'mikronesia', 5, 35, 35, 5, 0),
    (185, 'Nauru', 'nauru', 0, 0, 0, 5, 0),
    (186, 'Palau', 'palau', 0, 35, 35, 0, 0),
    (187, 'Papua Nugini', 'papua_nugini', 10, 30, 42, 5, 0),
    (188, 'Samoa', 'samoa', 15, 27, 30, 5, 0),
    (189, 'Samoa Amerika', 'samoa_amerika', 4, 37, 37, 0, 0),
    (190, 'Selandia Baru', 'selandia_baru', 15, 28, 47, 0, 0),
    (191, 'Tahiti', 'tahiti', 6, 27, 45, 0, 0),
    (192, 'Tuvalu', 'tuvalu', 0, 20, 30, 10, 0),
    (193, 'Tonga', 'tonga', 15, 25, 30, 5, 0),
    (194, 'Vanuatu', 'vanuatu', 0, 25, 0, 5, 0),
    (195, 'Argentina', 'argentina', 21, 35, 45, 5, 0),
    (196, 'Bolivia', 'bolivia', 13, 28, 37, 5, 0),
    (197, 'Brazil', 'brazil', 17, 34, 28, 5, 1),
    (198, 'Chile', 'chile', 19, 27, 40, 6, 1),
    (199, 'Ekuador', 'ekuador', 15, 25, 37, 5, 0),
    (200, 'Guiana Prancis', 'guiana_prancis', 20, 25, 45, 0, 1),
    (201, 'Guyana', 'guyana', 14, 25, 34, 5, 0),
    (202, 'Kolombia', 'kolombia', 19, 35, 37, 5, 0),
    (203, 'Paraguay', 'paraguay', 10, 25, 25, 5, 0),
    (204, 'Peru', 'peru', 18, 30, 30, 5, 0),
    (205, 'Suriname', 'suriname', 10, 25, 36, 5, 0),
    (206, 'Uruguay', 'uruguay', 22, 25, 36, 0, 0),
    (207, 'Venezuela', 'venezuela', 16, 34, 37, 5, 0);
