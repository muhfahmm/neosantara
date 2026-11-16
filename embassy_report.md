# Laporan Audit & Perbaikan Konsistensi Kedutaan Besar Antar Negara

## 1. Ringkasan Audit

- **Tanggal Audit**: 16 November 2026
- **Sumber Data**: `json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql` dan `apps/src/app/page/map_system/map-data.ts` (`COUNTRIES_DATA`)
- **Total Negara di Game**: 212 negara
- **Total Baris Kedutaan Awal**: 3152 baris
- **Total Pasangan Terarah (A -> B)**: 3152
- **Jumlah Pasangan Simetris Awal**: 138 pasang (276 baris timbal-balik)
- **Jumlah Pasangan Asimetris (Hanya di 1 negara)**: 2876 baris
- **Kedutaan ke Diri Sendiri (Self-embassy)**: 0
- **Duplikat Baris**: 0
- **Nama Negara Tak Dikenal / Di Luar COUNTRIES_DATA**: 0

### 10 Negara Paling Banyak Kekurangan Balasan Kedutaan

| No | Negara | Slug | Jumlah Kekurangan Balasan Kedutaan |
|---|---|---|---|
| 1 | Amerika Serikat | `amerika_serikat` | 110 |
| 2 | Antigua dan Barbuda | `antigua_dan_barbuda` | 110 |
| 3 | Albania | `albania` | 103 |
| 4 | Arab Saudi | `arab_saudi` | 102 |
| 5 | Brazil | `brazil` | 101 |
| 6 | Brunei | `brunei` | 101 |
| 7 | Afganistan | `afganistan` | 101 |
| 8 | Barbados | `barbados` | 99 |
| 9 | Angola | `angola` | 97 |
| 10 | Bolivia | `bolivia` | 97 |

## 2. Daftar Anomali

- **Kedutaan ke diri sendiri**: Tidak ditemukan (0).
- **Nama negara tak dikenal / di luar daftar**: Tidak ditemukan (0). Seluruh 212 slug pemilik dan 52 negara mitra terpetakan 100% secara valid ke `COUNTRIES_DATA`.
- **Duplikat baris**: Tidak ditemukan (0).
- **Wilayah dependensi / aneksasi**: Hubungan kedutaan awal diatur pada tingkat entitas negara berdaulat resmi di peta (`COUNTRIES_DATA`). Pemain yang menganeksasi wilayah akan mengelola kedutaan secara terpisah lewat `autoRemovedEmbassies` dan `removedEmbassies` saat runtime tanpa merusak seed awal.

## 3. Ringkasan Per Negara: Jumlah Kedutaan Sebelum & Sesudah Perbaikan

| No | Negara | Slug | Sebelum | Ditambahkan | Sesudah |
|---|---|---|---|---|---|
| 1 | Afganistan | `afganistan` | 14 | +101 | 115 |
| 2 | Afrika Selatan | `afrika_selatan` | 19 | +97 | 116 |
| 3 | Albania | `albania` | 14 | +103 | 117 |
| 4 | Aljazair | `aljazair` | 20 | +86 | 106 |
| 5 | Amerika Serikat | `amerika_serikat` | 16 | +110 | 126 |
| 6 | Andorra | `andorra` | 11 | +87 | 98 |
| 7 | Angola | `angola` | 12 | +97 | 109 |
| 8 | Antigua dan Barbuda | `antigua_dan_barbuda` | 14 | +110 | 124 |
| 9 | Arab Saudi | `arab_saudi` | 16 | +102 | 118 |
| 10 | Argentina | `argentina` | 12 | +95 | 107 |
| 11 | Armenia | `armenia` | 12 | +90 | 102 |
| 12 | Australia | `australia` | 20 | +91 | 111 |
| 13 | Austria | `austria` | 19 | +82 | 101 |
| 14 | Azerbaijan | `azerbaijan` | 17 | +92 | 109 |
| 15 | Bahama | `bahama` | 13 | +86 | 99 |
| 16 | Bahrain | `bahrain` | 20 | +90 | 110 |
| 17 | Bangladesh | `bangladesh` | 20 | +90 | 110 |
| 18 | Barbados | `barbados` | 20 | +99 | 119 |
| 19 | Belanda | `belanda` | 19 | +93 | 112 |
| 20 | Belarus | `belarus` | 14 | +95 | 109 |
| 21 | Belgia | `belgia` | 11 | +91 | 102 |
| 22 | Belize | `belize` | 20 | +96 | 116 |
| 23 | Benin | `benin` | 14 | +96 | 110 |
| 24 | Bermuda | `bermuda` | 14 | +87 | 101 |
| 25 | Bhutan | `bhutan` | 11 | +83 | 94 |
| 26 | Bolivia | `bolivia` | 11 | +97 | 108 |
| 27 | Bonaire, Sint Eustatius dan Saba | `bonaire_sint_eustatius_dan_saba` | 10 | +0 | 10 |
| 28 | Bosnia dan Hercegovina | `bosnia_dan_hercegovina` | 14 | +95 | 109 |
| 29 | Botswana | `botswana` | 18 | +90 | 108 |
| 30 | Brazil | `brazil` | 17 | +101 | 118 |
| 31 | Brunei | `brunei` | 18 | +101 | 119 |
| 32 | Bulgaria | `bulgaria` | 20 | +4 | 24 |
| 33 | Burkina faso | `burkina_faso` | 19 | +0 | 19 |
| 34 | Burundi | `burundi` | 10 | +0 | 10 |
| 35 | Ceko | `ceko` | 18 | +0 | 18 |
| 36 | Chad | `chad` | 14 | +0 | 14 |
| 37 | Chile | `chile` | 16 | +0 | 16 |
| 38 | China | `china` | 17 | +0 | 17 |
| 39 | Costa rica | `costa_rica` | 17 | +0 | 17 |
| 40 | Curacao | `curacao` | 11 | +1 | 12 |
| 41 | Denmark | `denmark` | 12 | +0 | 12 |
| 42 | Djibouti | `djibouti` | 16 | +0 | 16 |
| 43 | Dominika | `dominika` | 19 | +0 | 19 |
| 44 | Ekuador | `ekuador` | 10 | +0 | 10 |
| 45 | El salvador | `el_salvador` | 11 | +0 | 11 |
| 46 | Eritrea | `eritrea` | 15 | +0 | 15 |
| 47 | Estonia | `estonia` | 15 | +0 | 15 |
| 48 | Eswatini | `eswatini` | 12 | +0 | 12 |
| 49 | Ethiopia | `ethiopia` | 20 | +0 | 20 |
| 50 | Fiji | `fiji` | 15 | +0 | 15 |
| 51 | Filipina | `filipina` | 15 | +0 | 15 |
| 52 | Finlandia | `finlandia` | 17 | +0 | 17 |
| 53 | Gabon | `gabon` | 15 | +0 | 15 |
| 54 | Gambia | `gambia` | 13 | +0 | 13 |
| 55 | Georgia | `georgia` | 11 | +0 | 11 |
| 56 | Ghana | `ghana` | 14 | +0 | 14 |
| 57 | Gibraltar | `gibraltar` | 10 | +0 | 10 |
| 58 | Greenland | `greenland` | 20 | +0 | 20 |
| 59 | Grenada | `grenada` | 20 | +0 | 20 |
| 60 | Guadeloupe | `guadeloupe` | 10 | +0 | 10 |
| 61 | Guam | `guam` | 16 | +0 | 16 |
| 62 | Guatemala | `guatemala` | 13 | +0 | 13 |
| 63 | Guiana prancis | `guiana_prancis` | 15 | +0 | 15 |
| 64 | Guinea | `guinea` | 10 | +0 | 10 |
| 65 | Guinea bissau | `guinea_bissau` | 20 | +0 | 20 |
| 66 | Guyana | `guyana` | 18 | +0 | 18 |
| 67 | Haiti | `haiti` | 13 | +2 | 15 |
| 68 | Honduras | `honduras` | 11 | +0 | 11 |
| 69 | Hong kong | `hong_kong` | 14 | +0 | 14 |
| 70 | Hungaria | `hungaria` | 15 | +0 | 15 |
| 71 | India | `india` | 19 | +2 | 21 |
| 72 | Indonesia | `indonesia` | 15 | +0 | 15 |
| 73 | Inggris | `inggris` | 18 | +1 | 19 |
| 74 | Irak | `irak` | 14 | +0 | 14 |
| 75 | Iran | `iran` | 20 | +0 | 20 |
| 76 | Irlandia | `irlandia` | 15 | +0 | 15 |
| 77 | Islandia | `islandia` | 10 | +0 | 10 |
| 78 | Israel | `israel` | 11 | +0 | 11 |
| 79 | Italia | `italia` | 12 | +0 | 12 |
| 80 | Jamaika | `jamaika` | 10 | +2 | 12 |
| 81 | Jepang | `jepang` | 13 | +0 | 13 |
| 82 | Jerman | `jerman` | 10 | +0 | 10 |
| 83 | Kamboja | `kamboja` | 18 | +0 | 18 |
| 84 | Kamerun | `kamerun` | 16 | +0 | 16 |
| 85 | Kanada | `kanada` | 14 | +2 | 16 |
| 86 | Kazakhstan | `kazakhstan` | 11 | +0 | 11 |
| 87 | Kenya | `kenya` | 16 | +2 | 18 |
| 88 | Kepulauan faroe | `kepulauan_faroe` | 17 | +0 | 17 |
| 89 | Kirgizstan | `kirgizstan` | 12 | +0 | 12 |
| 90 | Kiribati | `kiribati` | 10 | +0 | 10 |
| 91 | Kolombia | `kolombia` | 11 | +1 | 12 |
| 92 | Komoro | `komoro` | 20 | +2 | 22 |
| 93 | Kongo | `kongo` | 16 | +0 | 16 |
| 94 | Korea selatan | `korea_selatan` | 15 | +0 | 15 |
| 95 | Korea utara | `korea_utara` | 12 | +0 | 12 |
| 96 | Kosovo | `kosovo` | 10 | +0 | 10 |
| 97 | Kroasia | `kroasia` | 16 | +0 | 16 |
| 98 | Kuba | `kuba` | 18 | +2 | 20 |
| 99 | Kuwait | `kuwait` | 20 | +0 | 20 |
| 100 | Laos | `laos` | 19 | +0 | 19 |
| 101 | Latvia | `latvia` | 16 | +0 | 16 |
| 102 | Lebanon | `lebanon` | 10 | +0 | 10 |
| 103 | Lesotho | `lesotho` | 12 | +0 | 12 |
| 104 | Liberia | `liberia` | 12 | +0 | 12 |
| 105 | Libya | `libya` | 16 | +0 | 16 |
| 106 | Liechtenstein | `liechtenstein` | 12 | +0 | 12 |
| 107 | Lithuania | `lithuania` | 11 | +0 | 11 |
| 108 | Luksemburg | `luksemburg` | 17 | +0 | 17 |
| 109 | Madagaskar | `madagaskar` | 13 | +2 | 15 |
| 110 | Makau | `makau` | 14 | +0 | 14 |
| 111 | Makedonia utara | `makedonia_utara` | 15 | +0 | 15 |
| 112 | Malawi | `malawi` | 16 | +0 | 16 |
| 113 | Malaysia | `malaysia` | 19 | +0 | 19 |
| 114 | Maldives | `maldives` | 20 | +0 | 20 |
| 115 | Mali | `mali` | 19 | +0 | 19 |
| 116 | Malta | `malta` | 20 | +0 | 20 |
| 117 | Maroko | `maroko` | 16 | +0 | 16 |
| 118 | Marshall | `marshall` | 12 | +0 | 12 |
| 119 | Martinique | `martinique` | 10 | +0 | 10 |
| 120 | Mauritania | `mauritania` | 10 | +0 | 10 |
| 121 | Mauritius | `mauritius` | 14 | +2 | 16 |
| 122 | Mayotte | `mayotte` | 10 | +0 | 10 |
| 123 | Meksiko | `meksiko` | 10 | +2 | 12 |
| 124 | Mesir | `mesir` | 10 | +0 | 10 |
| 125 | Mikronesia | `mikronesia` | 20 | +0 | 20 |
| 126 | Moldova | `moldova` | 10 | +0 | 10 |
| 127 | Monako | `monako` | 12 | +0 | 12 |
| 128 | Mongolia | `mongolia` | 16 | +0 | 16 |
| 129 | Montenegro | `montenegro` | 14 | +0 | 14 |
| 130 | Mozambik | `mozambik` | 17 | +1 | 18 |
| 131 | Myanmar | `myanmar` | 12 | +0 | 12 |
| 132 | Namibia | `namibia` | 20 | +0 | 20 |
| 133 | Nauru | `nauru` | 14 | +0 | 14 |
| 134 | Nepal | `nepal` | 14 | +0 | 14 |
| 135 | Niger | `niger` | 14 | +0 | 14 |
| 136 | Nigeria | `nigeria` | 16 | +0 | 16 |
| 137 | Nikaragua | `nikaragua` | 10 | +0 | 10 |
| 138 | Norwegia | `norwegia` | 15 | +0 | 15 |
| 139 | Oman | `oman` | 11 | +0 | 11 |
| 140 | Pakistan | `pakistan` | 20 | +0 | 20 |
| 141 | Palau | `palau` | 18 | +0 | 18 |
| 142 | Palestina | `palestina` | 17 | +0 | 17 |
| 143 | Panama | `panama` | 15 | +1 | 16 |
| 144 | Pantai gading | `pantai_gading` | 15 | +0 | 15 |
| 145 | Papua nugini | `papua_nugini` | 20 | +0 | 20 |
| 146 | Paraguay | `paraguay` | 11 | +0 | 11 |
| 147 | Peru | `peru` | 13 | +0 | 13 |
| 148 | Polandia | `polandia` | 15 | +0 | 15 |
| 149 | Portugal | `portugal` | 14 | +0 | 14 |
| 150 | Prancis | `prancis` | 10 | +5 | 15 |
| 151 | Puerto rico | `puerto_rico` | 18 | +0 | 18 |
| 152 | Qatar | `qatar` | 19 | +0 | 19 |
| 153 | Republik Afrika Tengah | `republik_afrika_tengah` | 12 | +0 | 12 |
| 154 | Republik demokratik kongo | `republik_demokratik_kongo` | 14 | +0 | 14 |
| 155 | Republik dominika | `republik_dominika` | 18 | +2 | 20 |
| 156 | Republik rumania | `republik_rumania` | 17 | +0 | 17 |
| 157 | Republik serbia | `republik_serbia` | 11 | +0 | 11 |
| 158 | Republik sudan | `republik_sudan` | 17 | +0 | 17 |
| 159 | Republik tanzania | `republik_tanzania` | 15 | +2 | 17 |
| 160 | Republik timor leste | `republik_timor_leste` | 15 | +0 | 15 |
| 161 | Republik uganda | `republik_uganda` | 17 | +0 | 17 |
| 162 | Republik zambia | `republik_zambia` | 20 | +0 | 20 |
| 163 | Republik zimbabwe | `republik_zimbabwe` | 16 | +0 | 16 |
| 164 | Reunion | `reunion` | 10 | +0 | 10 |
| 165 | Rusia | `rusia` | 18 | +0 | 18 |
| 166 | Rwanda | `rwanda` | 19 | +0 | 19 |
| 167 | Saint Kitts dan Nevis | `saint_kitts_dan_nevis` | 13 | +0 | 13 |
| 168 | Saint lucia | `saint_lucia` | 19 | +0 | 19 |
| 169 | Saint Vincent dan Grenadine | `saint_vincent_dan_grenadine` | 18 | +0 | 18 |
| 170 | Samoa | `samoa` | 17 | +0 | 17 |
| 171 | Samoa amerika | `samoa_amerika` | 18 | +0 | 18 |
| 172 | San marino | `san_marino` | 14 | +0 | 14 |
| 173 | Sao Tome dan Principe | `sao_tome_dan_principe` | 20 | +0 | 20 |
| 174 | Selandia baru | `selandia_baru` | 14 | +0 | 14 |
| 175 | Senegal | `senegal` | 17 | +0 | 17 |
| 176 | Seychelles | `seychelles` | 11 | +2 | 13 |
| 177 | Sierra leone | `sierra_leone` | 18 | +0 | 18 |
| 178 | Singapura | `singapura` | 19 | +0 | 19 |
| 179 | Siprus | `siprus` | 11 | +0 | 11 |
| 180 | Slovenia | `slovenia` | 14 | +0 | 14 |
| 181 | Slowakia | `slowakia` | 15 | +0 | 15 |
| 182 | Somalia | `somalia` | 14 | +0 | 14 |
| 183 | Spanyol | `spanyol` | 15 | +0 | 15 |
| 184 | Sri lanka | `sri_lanka` | 14 | +0 | 14 |
| 185 | Sudan selatan | `sudan_selatan` | 10 | +0 | 10 |
| 186 | Suriah | `suriah` | 17 | +0 | 17 |
| 187 | Suriname | `suriname` | 20 | +0 | 20 |
| 188 | Swedia | `swedia` | 15 | +0 | 15 |
| 189 | Swiss | `swiss` | 10 | +0 | 10 |
| 190 | Tahiti | `tahiti` | 14 | +0 | 14 |
| 191 | Taiwan | `taiwan` | 19 | +0 | 19 |
| 192 | Tajikistan | `tajikistan` | 14 | +0 | 14 |
| 193 | Tanjung verde | `tanjung_verde` | 12 | +0 | 12 |
| 194 | Thailand | `thailand` | 10 | +0 | 10 |
| 195 | Togo | `togo` | 14 | +0 | 14 |
| 196 | Tonga | `tonga` | 16 | +0 | 16 |
| 197 | Trinidad dan tobago | `trinidad_dan_tobago` | 13 | +1 | 14 |
| 198 | Tunisia | `tunisia` | 10 | +0 | 10 |
| 199 | Turki | `turki` | 19 | +0 | 19 |
| 200 | Turkmenistan | `turkmenistan` | 19 | +0 | 19 |
| 201 | Tuvalu | `tuvalu` | 20 | +0 | 20 |
| 202 | Ukraina | `ukraina` | 11 | +0 | 11 |
| 203 | Uni Emirat Arab | `uni_emirat_arab` | 13 | +0 | 13 |
| 204 | Uruguay | `uruguay` | 10 | +0 | 10 |
| 205 | Uzbekistan | `uzbekistan` | 16 | +0 | 16 |
| 206 | Vanuatu | `vanuatu` | 13 | +0 | 13 |
| 207 | Vatikan | `vatikan` | 12 | +0 | 12 |
| 208 | Venezuela | `venezuela` | 16 | +2 | 18 |
| 209 | Vietnam | `vietnam` | 11 | +0 | 11 |
| 210 | Yaman | `yaman` | 18 | +0 | 18 |
| 211 | Yordania | `yordania` | 13 | +0 | 13 |
| 212 | Yunani | `yunani` | 18 | +0 | 18 |

## 4. Perubahan yang Diterapkan

- **Total baris ditambahkan**: 2876 baris baru (simetri penuh timbal-balik).
- **Total baris akhir**: 6028 baris (3.014 pasangan simetris sempurna).
- **Lokasi file data**: `json/6_database_kedutaan_besar/database_kedutaan_besar.pg.sql` dan disinkronkan ke `json/root.pg.sql`.
- **Skrip Migrasi Idempoten**: `scripts/fix-embassy-symmetry.mjs` (menggunakan pengecekan pasangan terarah eksisting sebelum menyisipkan, idempoten saat dijalankan berulang kali).

## 5. Tabel Lengkap Pasangan Asimetris yang Diperbaiki

Tabel berikut memuat 2876 relasi yang sebelumnya hanya ada satu arah dan ditambahkan pasangan timbal-baliknya:

| No | Negara A (Punya Kedutaan) | Negara B (Belum Punya Balasan) | Sumber Awal (Baris) | Tindakan |
|---|---|---|---|---|
| 1 | Afganistan | Aljazair | Baris 823 | Ditambahkan balasan (simetri) |
| 2 | Afganistan | Argentina | Baris 825 | Ditambahkan balasan (simetri) |
| 3 | Afganistan | Armenia | Baris 826 | Ditambahkan balasan (simetri) |
| 4 | Afganistan | Bermuda | Baris 832 | Ditambahkan balasan (simetri) |
| 5 | Afganistan | Bolivia | Baris 833 | Ditambahkan balasan (simetri) |
| 6 | Afganistan | Bosnia dan Hercegovina | Baris 834 | Ditambahkan balasan (simetri) |
| 7 | Afrika Selatan | Albania | Baris 14 | Ditambahkan balasan (simetri) |
| 8 | Afrika Selatan | Angola | Baris 16 | Ditambahkan balasan (simetri) |
| 9 | Afrika Selatan | Argentina | Baris 19 | Ditambahkan balasan (simetri) |
| 10 | Afrika Selatan | Austria | Baris 21 | Ditambahkan balasan (simetri) |
| 11 | Afrika Selatan | Belarus | Baris 25 | Ditambahkan balasan (simetri) |
| 12 | Afrika Selatan | Belize | Baris 26 | Ditambahkan balasan (simetri) |
| 13 | Afrika Selatan | Bhutan | Baris 28 | Ditambahkan balasan (simetri) |
| 14 | Afrika Selatan | Bolivia | Baris 29 | Ditambahkan balasan (simetri) |
| 15 | Afrika Selatan | Botswana | Baris 30 | Ditambahkan balasan (simetri) |
| 16 | Afrika Selatan | Brazil | Baris 31 | Ditambahkan balasan (simetri) |
| 17 | Afrika Selatan | Brunei | Baris 32 | Ditambahkan balasan (simetri) |
| 18 | Albania | Antigua dan Barbuda | Baris 1586 | Ditambahkan balasan (simetri) |
| 19 | Albania | Argentina | Baris 1587 | Ditambahkan balasan (simetri) |
| 20 | Albania | Austria | Baris 1589 | Ditambahkan balasan (simetri) |
| 21 | Albania | Bahrain | Baris 1591 | Ditambahkan balasan (simetri) |
| 22 | Albania | Barbados | Baris 1592 | Ditambahkan balasan (simetri) |
| 23 | Albania | Belgia | Baris 1593 | Ditambahkan balasan (simetri) |
| 24 | Aljazair | Afrika Selatan | Baris 33 | Ditambahkan balasan (simetri) |
| 25 | Aljazair | Argentina | Baris 37 | Ditambahkan balasan (simetri) |
| 26 | Aljazair | Australia | Baris 38 | Ditambahkan balasan (simetri) |
| 27 | Aljazair | Bahrain | Baris 40 | Ditambahkan balasan (simetri) |
| 28 | Aljazair | Barbados | Baris 42 | Ditambahkan balasan (simetri) |
| 29 | Aljazair | Bosnia dan Hercegovina | Baris 48 | Ditambahkan balasan (simetri) |
| 30 | Aljazair | Bulgaria | Baris 52 | Ditambahkan balasan (simetri) |
| 31 | Amerika Serikat | Andorra | Baris 2285 | Ditambahkan balasan (simetri) |
| 32 | Amerika Serikat | Angola | Baris 2286 | Ditambahkan balasan (simetri) |
| 33 | Amerika Serikat | Armenia | Baris 2288 | Ditambahkan balasan (simetri) |
| 34 | Amerika Serikat | Bahama | Baris 2290 | Ditambahkan balasan (simetri) |
| 35 | Amerika Serikat | Barbados | Baris 2292 | Ditambahkan balasan (simetri) |
| 36 | Amerika Serikat | Belarus | Baris 2293 | Ditambahkan balasan (simetri) |
| 37 | Amerika Serikat | Bulgaria | Baris 2298 | Ditambahkan balasan (simetri) |
| 38 | Andorra | Afganistan | Baris 1596 | Ditambahkan balasan (simetri) |
| 39 | Andorra | Aljazair | Baris 1598 | Ditambahkan balasan (simetri) |
| 40 | Andorra | Bhutan | Baris 1603 | Ditambahkan balasan (simetri) |
| 41 | Andorra | Brunei | Baris 1606 | Ditambahkan balasan (simetri) |
| 42 | Angola | Afganistan | Baris 53 | Ditambahkan balasan (simetri) |
| 43 | Angola | Argentina | Baris 56 | Ditambahkan balasan (simetri) |
| 44 | Angola | Bahama | Baris 58 | Ditambahkan balasan (simetri) |
| 45 | Angola | Benin | Baris 61 | Ditambahkan balasan (simetri) |
| 46 | Angola | Bermuda | Baris 62 | Ditambahkan balasan (simetri) |
| 47 | Angola | Bolivia | Baris 63 | Ditambahkan balasan (simetri) |
| 48 | Antigua dan Barbuda | Angola | Baris 2301 | Ditambahkan balasan (simetri) |
| 49 | Antigua dan Barbuda | Armenia | Baris 2302 | Ditambahkan balasan (simetri) |
| 50 | Antigua dan Barbuda | Belanda | Baris 2306 | Ditambahkan balasan (simetri) |
| 51 | Antigua dan Barbuda | Bermuda | Baris 2308 | Ditambahkan balasan (simetri) |
| 52 | Antigua dan Barbuda | Bhutan | Baris 2309 | Ditambahkan balasan (simetri) |
| 53 | Antigua dan Barbuda | Botswana | Baris 2310 | Ditambahkan balasan (simetri) |
| 54 | Antigua dan Barbuda | Brazil | Baris 2311 | Ditambahkan balasan (simetri) |
| 55 | Arab Saudi | Albania | Baris 838 | Ditambahkan balasan (simetri) |
| 56 | Arab Saudi | Armenia | Baris 840 | Ditambahkan balasan (simetri) |
| 57 | Arab Saudi | Bahama | Baris 841 | Ditambahkan balasan (simetri) |
| 58 | Arab Saudi | Bahrain | Baris 842 | Ditambahkan balasan (simetri) |
| 59 | Arab Saudi | Belgia | Baris 844 | Ditambahkan balasan (simetri) |
| 60 | Arab Saudi | Bosnia dan Hercegovina | Baris 848 | Ditambahkan balasan (simetri) |
| 61 | Arab Saudi | Botswana | Baris 849 | Ditambahkan balasan (simetri) |
| 62 | Arab Saudi | Brunei | Baris 850 | Ditambahkan balasan (simetri) |
| 63 | Argentina | Arab Saudi | Baris 2951 | Ditambahkan balasan (simetri) |
| 64 | Argentina | Armenia | Baris 2952 | Ditambahkan balasan (simetri) |
| 65 | Argentina | Bangladesh | Baris 2954 | Ditambahkan balasan (simetri) |
| 66 | Argentina | Belgia | Baris 2956 | Ditambahkan balasan (simetri) |
| 67 | Armenia | Aljazair | Baris 853 | Ditambahkan balasan (simetri) |
| 68 | Armenia | Andorra | Baris 854 | Ditambahkan balasan (simetri) |
| 69 | Armenia | Bahama | Baris 857 | Ditambahkan balasan (simetri) |
| 70 | Armenia | Belize | Baris 860 | Ditambahkan balasan (simetri) |
| 71 | Armenia | Bermuda | Baris 861 | Ditambahkan balasan (simetri) |
| 72 | Armenia | Bosnia dan Hercegovina | Baris 862 | Ditambahkan balasan (simetri) |
| 73 | Australia | Afganistan | Baris 2694 | Ditambahkan balasan (simetri) |
| 74 | Australia | Albania | Baris 2696 | Ditambahkan balasan (simetri) |
| 75 | Australia | Amerika Serikat | Baris 2697 | Ditambahkan balasan (simetri) |
| 76 | Australia | Andorra | Baris 2698 | Ditambahkan balasan (simetri) |
| 77 | Australia | Angola | Baris 2699 | Ditambahkan balasan (simetri) |
| 78 | Australia | Antigua dan Barbuda | Baris 2700 | Ditambahkan balasan (simetri) |
| 79 | Australia | Arab Saudi | Baris 2701 | Ditambahkan balasan (simetri) |
| 80 | Australia | Argentina | Baris 2702 | Ditambahkan balasan (simetri) |
| 81 | Australia | Benin | Baris 2707 | Ditambahkan balasan (simetri) |
| 82 | Australia | Bolivia | Baris 2709 | Ditambahkan balasan (simetri) |
| 83 | Australia | Bosnia dan Hercegovina | Baris 2710 | Ditambahkan balasan (simetri) |
| 84 | Australia | Botswana | Baris 2711 | Ditambahkan balasan (simetri) |
| 85 | Australia | Brunei | Baris 2712 | Ditambahkan balasan (simetri) |
| 86 | Austria | Amerika Serikat | Baris 1609 | Ditambahkan balasan (simetri) |
| 87 | Austria | Angola | Baris 1611 | Ditambahkan balasan (simetri) |
| 88 | Austria | Antigua dan Barbuda | Baris 1612 | Ditambahkan balasan (simetri) |
| 89 | Austria | Arab Saudi | Baris 1613 | Ditambahkan balasan (simetri) |
| 90 | Austria | Australia | Baris 1614 | Ditambahkan balasan (simetri) |
| 91 | Austria | Bahrain | Baris 1615 | Ditambahkan balasan (simetri) |
| 92 | Austria | Belgia | Baris 1617 | Ditambahkan balasan (simetri) |
| 93 | Austria | Bhutan | Baris 1620 | Ditambahkan balasan (simetri) |
| 94 | Austria | Botswana | Baris 1622 | Ditambahkan balasan (simetri) |
| 95 | Austria | Brazil | Baris 1623 | Ditambahkan balasan (simetri) |
| 96 | Azerbaijan | Afganistan | Baris 864 | Ditambahkan balasan (simetri) |
| 97 | Azerbaijan | Angola | Baris 868 | Ditambahkan balasan (simetri) |
| 98 | Azerbaijan | Bahama | Baris 872 | Ditambahkan balasan (simetri) |
| 99 | Azerbaijan | Bangladesh | Baris 874 | Ditambahkan balasan (simetri) |
| 100 | Azerbaijan | Barbados | Baris 875 | Ditambahkan balasan (simetri) |
| 101 | Azerbaijan | Bolivia | Baris 879 | Ditambahkan balasan (simetri) |
| 102 | Azerbaijan | Bulgaria | Baris 880 | Ditambahkan balasan (simetri) |
| 103 | Bahama | Afganistan | Baris 2313 | Ditambahkan balasan (simetri) |
| 104 | Bahama | Aljazair | Baris 2314 | Ditambahkan balasan (simetri) |
| 105 | Bahama | Argentina | Baris 2315 | Ditambahkan balasan (simetri) |
| 106 | Bahama | Austria | Baris 2317 | Ditambahkan balasan (simetri) |
| 107 | Bahama | Belanda | Baris 2319 | Ditambahkan balasan (simetri) |
| 108 | Bahama | Benin | Baris 2321 | Ditambahkan balasan (simetri) |
| 109 | Bahama | Brazil | Baris 2323 | Ditambahkan balasan (simetri) |
| 110 | Bahama | Brunei | Baris 2324 | Ditambahkan balasan (simetri) |
| 111 | Bahrain | Andorra | Baris 883 | Ditambahkan balasan (simetri) |
| 112 | Bahrain | Angola | Baris 884 | Ditambahkan balasan (simetri) |
| 113 | Bahrain | Antigua dan Barbuda | Baris 885 | Ditambahkan balasan (simetri) |
| 114 | Bahrain | Argentina | Baris 886 | Ditambahkan balasan (simetri) |
| 115 | Bahrain | Bahama | Baris 890 | Ditambahkan balasan (simetri) |
| 116 | Bahrain | Belanda | Baris 892 | Ditambahkan balasan (simetri) |
| 117 | Bahrain | Bermuda | Baris 895 | Ditambahkan balasan (simetri) |
| 118 | Bahrain | Bhutan | Baris 896 | Ditambahkan balasan (simetri) |
| 119 | Bangladesh | Afganistan | Baris 901 | Ditambahkan balasan (simetri) |
| 120 | Bangladesh | Andorra | Baris 905 | Ditambahkan balasan (simetri) |
| 121 | Bangladesh | Angola | Baris 906 | Ditambahkan balasan (simetri) |
| 122 | Bangladesh | Arab Saudi | Baris 908 | Ditambahkan balasan (simetri) |
| 123 | Bangladesh | Armenia | Baris 909 | Ditambahkan balasan (simetri) |
| 124 | Bangladesh | Australia | Baris 910 | Ditambahkan balasan (simetri) |
| 125 | Bangladesh | Bahama | Baris 912 | Ditambahkan balasan (simetri) |
| 126 | Bangladesh | Bahrain | Baris 913 | Ditambahkan balasan (simetri) |
| 127 | Bangladesh | Belgia | Baris 915 | Ditambahkan balasan (simetri) |
| 128 | Bangladesh | Benin | Baris 916 | Ditambahkan balasan (simetri) |
| 129 | Bangladesh | Bolivia | Baris 917 | Ditambahkan balasan (simetri) |
| 130 | Bangladesh | Bosnia dan Hercegovina | Baris 918 | Ditambahkan balasan (simetri) |
| 131 | Barbados | Armenia | Baris 2332 | Ditambahkan balasan (simetri) |
| 132 | Barbados | Austria | Baris 2333 | Ditambahkan balasan (simetri) |
| 133 | Barbados | Bangladesh | Baris 2336 | Ditambahkan balasan (simetri) |
| 134 | Barbados | Belarus | Baris 2337 | Ditambahkan balasan (simetri) |
| 135 | Barbados | Botswana | Baris 2343 | Ditambahkan balasan (simetri) |
| 136 | Barbados | Brunei | Baris 2345 | Ditambahkan balasan (simetri) |
| 137 | Belanda | Afrika Selatan | Baris 1627 | Ditambahkan balasan (simetri) |
| 138 | Belanda | Amerika Serikat | Baris 1629 | Ditambahkan balasan (simetri) |
| 139 | Belanda | Andorra | Baris 1630 | Ditambahkan balasan (simetri) |
| 140 | Belanda | Angola | Baris 1631 | Ditambahkan balasan (simetri) |
| 141 | Belanda | Arab Saudi | Baris 1632 | Ditambahkan balasan (simetri) |
| 142 | Belanda | Armenia | Baris 1633 | Ditambahkan balasan (simetri) |
| 143 | Belanda | Austria | Baris 1635 | Ditambahkan balasan (simetri) |
| 144 | Belanda | Bolivia | Baris 1642 | Ditambahkan balasan (simetri) |
| 145 | Belanda | Brazil | Baris 1644 | Ditambahkan balasan (simetri) |
| 146 | Belarus | Albania | Baris 1646 | Ditambahkan balasan (simetri) |
| 147 | Belarus | Arab Saudi | Baris 1648 | Ditambahkan balasan (simetri) |
| 148 | Belarus | Argentina | Baris 1649 | Ditambahkan balasan (simetri) |
| 149 | Belarus | Bahrain | Baris 1652 | Ditambahkan balasan (simetri) |
| 150 | Belgia | Andorra | Baris 1660 | Ditambahkan balasan (simetri) |
| 151 | Belgia | Antigua dan Barbuda | Baris 1661 | Ditambahkan balasan (simetri) |
| 152 | Belgia | Belanda | Baris 1665 | Ditambahkan balasan (simetri) |
| 153 | Belize | Afganistan | Baris 2346 | Ditambahkan balasan (simetri) |
| 154 | Belize | Albania | Baris 2347 | Ditambahkan balasan (simetri) |
| 155 | Belize | Argentina | Baris 2352 | Ditambahkan balasan (simetri) |
| 156 | Belize | Australia | Baris 2353 | Ditambahkan balasan (simetri) |
| 157 | Belize | Bahrain | Baris 2355 | Ditambahkan balasan (simetri) |
| 158 | Belize | Bangladesh | Baris 2356 | Ditambahkan balasan (simetri) |
| 159 | Belize | Belgia | Baris 2360 | Ditambahkan balasan (simetri) |
| 160 | Belize | Botswana | Baris 2363 | Ditambahkan balasan (simetri) |
| 161 | Belize | Brazil | Baris 2364 | Ditambahkan balasan (simetri) |
| 162 | Benin | Albania | Baris 66 | Ditambahkan balasan (simetri) |
| 163 | Benin | Belgia | Baris 74 | Ditambahkan balasan (simetri) |
| 164 | Bermuda | Afrika Selatan | Baris 2366 | Ditambahkan balasan (simetri) |
| 165 | Bermuda | Amerika Serikat | Baris 2369 | Ditambahkan balasan (simetri) |
| 166 | Bermuda | Andorra | Baris 2370 | Ditambahkan balasan (simetri) |
| 167 | Bermuda | Arab Saudi | Baris 2371 | Ditambahkan balasan (simetri) |
| 168 | Bermuda | Azerbaijan | Baris 2374 | Ditambahkan balasan (simetri) |
| 169 | Bermuda | Bahama | Baris 2375 | Ditambahkan balasan (simetri) |
| 170 | Bermuda | Bolivia | Baris 2377 | Ditambahkan balasan (simetri) |
| 171 | Bermuda | Brunei | Baris 2379 | Ditambahkan balasan (simetri) |
| 172 | Bhutan | Albania | Baris 921 | Ditambahkan balasan (simetri) |
| 173 | Bhutan | Bahama | Baris 926 | Ditambahkan balasan (simetri) |
| 174 | Bhutan | Bangladesh | Baris 927 | Ditambahkan balasan (simetri) |
| 175 | Bhutan | Botswana | Baris 929 | Ditambahkan balasan (simetri) |
| 176 | Bolivia | Andorra | Baris 2964 | Ditambahkan balasan (simetri) |
| 177 | Bolivia | Botswana | Baris 2972 | Ditambahkan balasan (simetri) |
| 178 | Bolivia | Bulgaria | Baris 2973 | Ditambahkan balasan (simetri) |
| 179 | Bonaire, Sint Eustatius dan Saba | Amerika Serikat | Baris 3178 | Ditambahkan balasan (simetri) |
| 180 | Bonaire, Sint Eustatius dan Saba | Belanda | Baris 3177 | Ditambahkan balasan (simetri) |
| 181 | Bonaire, Sint Eustatius dan Saba | Brazil | Baris 3185 | Ditambahkan balasan (simetri) |
| 182 | Bonaire, Sint Eustatius dan Saba | Curacao | Baris 3181 | Ditambahkan balasan (simetri) |
| 183 | Bonaire, Sint Eustatius dan Saba | Jamaika | Baris 3184 | Ditambahkan balasan (simetri) |
| 184 | Bonaire, Sint Eustatius dan Saba | Kolombia | Baris 3180 | Ditambahkan balasan (simetri) |
| 185 | Bonaire, Sint Eustatius dan Saba | Panama | Baris 3183 | Ditambahkan balasan (simetri) |
| 186 | Bonaire, Sint Eustatius dan Saba | Prancis | Baris 3186 | Ditambahkan balasan (simetri) |
| 187 | Bonaire, Sint Eustatius dan Saba | Republik dominika | Baris 3182 | Ditambahkan balasan (simetri) |
| 188 | Bonaire, Sint Eustatius dan Saba | Venezuela | Baris 3179 | Ditambahkan balasan (simetri) |
| 189 | Bosnia dan Hercegovina | Albania | Baris 1670 | Ditambahkan balasan (simetri) |
| 190 | Bosnia dan Hercegovina | Azerbaijan | Baris 1674 | Ditambahkan balasan (simetri) |
| 191 | Bosnia dan Hercegovina | Bahama | Baris 1675 | Ditambahkan balasan (simetri) |
| 192 | Bosnia dan Hercegovina | Bahrain | Baris 1676 | Ditambahkan balasan (simetri) |
| 193 | Bosnia dan Hercegovina | Barbados | Baris 1677 | Ditambahkan balasan (simetri) |
| 194 | Bosnia dan Hercegovina | Belgia | Baris 1679 | Ditambahkan balasan (simetri) |
| 195 | Bosnia dan Hercegovina | Benin | Baris 1680 | Ditambahkan balasan (simetri) |
| 196 | Bosnia dan Hercegovina | Bhutan | Baris 1681 | Ditambahkan balasan (simetri) |
| 197 | Bosnia dan Hercegovina | Brazil | Baris 1683 | Ditambahkan balasan (simetri) |
| 198 | Botswana | Albania | Baris 80 | Ditambahkan balasan (simetri) |
| 199 | Botswana | Azerbaijan | Baris 86 | Ditambahkan balasan (simetri) |
| 200 | Botswana | Bahama | Baris 87 | Ditambahkan balasan (simetri) |
| 201 | Botswana | Belanda | Baris 89 | Ditambahkan balasan (simetri) |
| 202 | Botswana | Bermuda | Baris 92 | Ditambahkan balasan (simetri) |
| 203 | Botswana | Bosnia dan Hercegovina | Baris 93 | Ditambahkan balasan (simetri) |
| 204 | Brazil | Afganistan | Baris 2974 | Ditambahkan balasan (simetri) |
| 205 | Brazil | Amerika Serikat | Baris 2977 | Ditambahkan balasan (simetri) |
| 206 | Brazil | Arab Saudi | Baris 2979 | Ditambahkan balasan (simetri) |
| 207 | Brazil | Armenia | Baris 2980 | Ditambahkan balasan (simetri) |
| 208 | Brazil | Australia | Baris 2981 | Ditambahkan balasan (simetri) |
| 209 | Brazil | Bangladesh | Baris 2983 | Ditambahkan balasan (simetri) |
| 210 | Brunei | Afganistan | Baris 932 | Ditambahkan balasan (simetri) |
| 211 | Brunei | Albania | Baris 933 | Ditambahkan balasan (simetri) |
| 212 | Brunei | Amerika Serikat | Baris 935 | Ditambahkan balasan (simetri) |
| 213 | Brunei | Angola | Baris 936 | Ditambahkan balasan (simetri) |
| 214 | Brunei | Antigua dan Barbuda | Baris 937 | Ditambahkan balasan (simetri) |
| 215 | Brunei | Armenia | Baris 939 | Ditambahkan balasan (simetri) |
| 216 | Brunei | Azerbaijan | Baris 941 | Ditambahkan balasan (simetri) |
| 217 | Brunei | Benin | Baris 946 | Ditambahkan balasan (simetri) |
| 218 | Brunei | Brazil | Baris 948 | Ditambahkan balasan (simetri) |
| 219 | Bulgaria | Albania | Baris 1684 | Ditambahkan balasan (simetri) |
| 220 | Bulgaria | Andorra | Baris 1685 | Ditambahkan balasan (simetri) |
| 221 | Bulgaria | Armenia | Baris 1689 | Ditambahkan balasan (simetri) |
| 222 | Bulgaria | Barbados | Baris 1694 | Ditambahkan balasan (simetri) |
| 223 | Bulgaria | Belanda | Baris 1695 | Ditambahkan balasan (simetri) |
| 224 | Bulgaria | Bosnia dan Hercegovina | Baris 1700 | Ditambahkan balasan (simetri) |
| 225 | Burkina faso | Afganistan | Baris 97 | Ditambahkan balasan (simetri) |
| 226 | Burkina faso | Afrika Selatan | Baris 98 | Ditambahkan balasan (simetri) |
| 227 | Burkina faso | Albania | Baris 99 | Ditambahkan balasan (simetri) |
| 228 | Burkina faso | Aljazair | Baris 100 | Ditambahkan balasan (simetri) |
| 229 | Burkina faso | Angola | Baris 101 | Ditambahkan balasan (simetri) |
| 230 | Burkina faso | Arab Saudi | Baris 102 | Ditambahkan balasan (simetri) |
| 231 | Burkina faso | Argentina | Baris 103 | Ditambahkan balasan (simetri) |
| 232 | Burkina faso | Australia | Baris 104 | Ditambahkan balasan (simetri) |
| 233 | Burkina faso | Austria | Baris 105 | Ditambahkan balasan (simetri) |
| 234 | Burkina faso | Azerbaijan | Baris 106 | Ditambahkan balasan (simetri) |
| 235 | Burkina faso | Bahrain | Baris 107 | Ditambahkan balasan (simetri) |
| 236 | Burkina faso | Bangladesh | Baris 108 | Ditambahkan balasan (simetri) |
| 237 | Burkina faso | Belanda | Baris 109 | Ditambahkan balasan (simetri) |
| 238 | Burkina faso | Belarus | Baris 110 | Ditambahkan balasan (simetri) |
| 239 | Burkina faso | Belize | Baris 111 | Ditambahkan balasan (simetri) |
| 240 | Burkina faso | Benin | Baris 112 | Ditambahkan balasan (simetri) |
| 241 | Burkina faso | Bermuda | Baris 113 | Ditambahkan balasan (simetri) |
| 242 | Burkina faso | Bolivia | Baris 114 | Ditambahkan balasan (simetri) |
| 243 | Burkina faso | Botswana | Baris 115 | Ditambahkan balasan (simetri) |
| 244 | Burundi | Afganistan | Baris 116 | Ditambahkan balasan (simetri) |
| 245 | Burundi | Afrika Selatan | Baris 117 | Ditambahkan balasan (simetri) |
| 246 | Burundi | Albania | Baris 118 | Ditambahkan balasan (simetri) |
| 247 | Burundi | Aljazair | Baris 119 | Ditambahkan balasan (simetri) |
| 248 | Burundi | Amerika Serikat | Baris 120 | Ditambahkan balasan (simetri) |
| 249 | Burundi | Andorra | Baris 121 | Ditambahkan balasan (simetri) |
| 250 | Burundi | Angola | Baris 122 | Ditambahkan balasan (simetri) |
| 251 | Burundi | Argentina | Baris 123 | Ditambahkan balasan (simetri) |
| 252 | Burundi | Australia | Baris 124 | Ditambahkan balasan (simetri) |
| 253 | Burundi | Azerbaijan | Baris 125 | Ditambahkan balasan (simetri) |
| 254 | Ceko | Afrika Selatan | Baris 1704 | Ditambahkan balasan (simetri) |
| 255 | Ceko | Aljazair | Baris 1705 | Ditambahkan balasan (simetri) |
| 256 | Ceko | Amerika Serikat | Baris 1706 | Ditambahkan balasan (simetri) |
| 257 | Ceko | Arab Saudi | Baris 1707 | Ditambahkan balasan (simetri) |
| 258 | Ceko | Armenia | Baris 1708 | Ditambahkan balasan (simetri) |
| 259 | Ceko | Australia | Baris 1709 | Ditambahkan balasan (simetri) |
| 260 | Ceko | Austria | Baris 1710 | Ditambahkan balasan (simetri) |
| 261 | Ceko | Bahama | Baris 1711 | Ditambahkan balasan (simetri) |
| 262 | Ceko | Bahrain | Baris 1712 | Ditambahkan balasan (simetri) |
| 263 | Ceko | Bangladesh | Baris 1713 | Ditambahkan balasan (simetri) |
| 264 | Ceko | Belanda | Baris 1714 | Ditambahkan balasan (simetri) |
| 265 | Ceko | Belarus | Baris 1715 | Ditambahkan balasan (simetri) |
| 266 | Ceko | Belgia | Baris 1716 | Ditambahkan balasan (simetri) |
| 267 | Ceko | Bermuda | Baris 1717 | Ditambahkan balasan (simetri) |
| 268 | Ceko | Bhutan | Baris 1718 | Ditambahkan balasan (simetri) |
| 269 | Ceko | Bosnia dan Hercegovina | Baris 1719 | Ditambahkan balasan (simetri) |
| 270 | Ceko | Botswana | Baris 1720 | Ditambahkan balasan (simetri) |
| 271 | Ceko | Brazil | Baris 1721 | Ditambahkan balasan (simetri) |
| 272 | Chad | Albania | Baris 126 | Ditambahkan balasan (simetri) |
| 273 | Chad | Angola | Baris 127 | Ditambahkan balasan (simetri) |
| 274 | Chad | Argentina | Baris 128 | Ditambahkan balasan (simetri) |
| 275 | Chad | Armenia | Baris 129 | Ditambahkan balasan (simetri) |
| 276 | Chad | Australia | Baris 130 | Ditambahkan balasan (simetri) |
| 277 | Chad | Azerbaijan | Baris 131 | Ditambahkan balasan (simetri) |
| 278 | Chad | Bahama | Baris 132 | Ditambahkan balasan (simetri) |
| 279 | Chad | Bahrain | Baris 133 | Ditambahkan balasan (simetri) |
| 280 | Chad | Belanda | Baris 134 | Ditambahkan balasan (simetri) |
| 281 | Chad | Belarus | Baris 135 | Ditambahkan balasan (simetri) |
| 282 | Chad | Belgia | Baris 136 | Ditambahkan balasan (simetri) |
| 283 | Chad | Bhutan | Baris 137 | Ditambahkan balasan (simetri) |
| 284 | Chad | Bosnia dan Hercegovina | Baris 138 | Ditambahkan balasan (simetri) |
| 285 | Chad | Botswana | Baris 139 | Ditambahkan balasan (simetri) |
| 286 | Chile | Afrika Selatan | Baris 2991 | Ditambahkan balasan (simetri) |
| 287 | Chile | Albania | Baris 2992 | Ditambahkan balasan (simetri) |
| 288 | Chile | Andorra | Baris 2993 | Ditambahkan balasan (simetri) |
| 289 | Chile | Angola | Baris 2994 | Ditambahkan balasan (simetri) |
| 290 | Chile | Bahrain | Baris 2995 | Ditambahkan balasan (simetri) |
| 291 | Chile | Bangladesh | Baris 2996 | Ditambahkan balasan (simetri) |
| 292 | Chile | Belarus | Baris 2997 | Ditambahkan balasan (simetri) |
| 293 | Chile | Belgia | Baris 2998 | Ditambahkan balasan (simetri) |
| 294 | Chile | Belize | Baris 2999 | Ditambahkan balasan (simetri) |
| 295 | Chile | Benin | Baris 3000 | Ditambahkan balasan (simetri) |
| 296 | Chile | Bermuda | Baris 3001 | Ditambahkan balasan (simetri) |
| 297 | Chile | Bhutan | Baris 3002 | Ditambahkan balasan (simetri) |
| 298 | Chile | Bolivia | Baris 3003 | Ditambahkan balasan (simetri) |
| 299 | Chile | Bosnia dan Hercegovina | Baris 3004 | Ditambahkan balasan (simetri) |
| 300 | Chile | Botswana | Baris 3005 | Ditambahkan balasan (simetri) |
| 301 | Chile | Brunei | Baris 3006 | Ditambahkan balasan (simetri) |
| 302 | China | Afganistan | Baris 950 | Ditambahkan balasan (simetri) |
| 303 | China | Afrika Selatan | Baris 951 | Ditambahkan balasan (simetri) |
| 304 | China | Aljazair | Baris 952 | Ditambahkan balasan (simetri) |
| 305 | China | Amerika Serikat | Baris 953 | Ditambahkan balasan (simetri) |
| 306 | China | Andorra | Baris 954 | Ditambahkan balasan (simetri) |
| 307 | China | Angola | Baris 955 | Ditambahkan balasan (simetri) |
| 308 | China | Armenia | Baris 956 | Ditambahkan balasan (simetri) |
| 309 | China | Australia | Baris 957 | Ditambahkan balasan (simetri) |
| 310 | China | Austria | Baris 958 | Ditambahkan balasan (simetri) |
| 311 | China | Azerbaijan | Baris 959 | Ditambahkan balasan (simetri) |
| 312 | China | Barbados | Baris 960 | Ditambahkan balasan (simetri) |
| 313 | China | Belanda | Baris 961 | Ditambahkan balasan (simetri) |
| 314 | China | Belarus | Baris 962 | Ditambahkan balasan (simetri) |
| 315 | China | Belgia | Baris 963 | Ditambahkan balasan (simetri) |
| 316 | China | Benin | Baris 964 | Ditambahkan balasan (simetri) |
| 317 | China | Brazil | Baris 965 | Ditambahkan balasan (simetri) |
| 318 | China | Brunei | Baris 966 | Ditambahkan balasan (simetri) |
| 319 | Costa rica | Afganistan | Baris 2380 | Ditambahkan balasan (simetri) |
| 320 | Costa rica | Afrika Selatan | Baris 2381 | Ditambahkan balasan (simetri) |
| 321 | Costa rica | Amerika Serikat | Baris 2382 | Ditambahkan balasan (simetri) |
| 322 | Costa rica | Angola | Baris 2383 | Ditambahkan balasan (simetri) |
| 323 | Costa rica | Antigua dan Barbuda | Baris 2384 | Ditambahkan balasan (simetri) |
| 324 | Costa rica | Armenia | Baris 2385 | Ditambahkan balasan (simetri) |
| 325 | Costa rica | Australia | Baris 2386 | Ditambahkan balasan (simetri) |
| 326 | Costa rica | Bahrain | Baris 2387 | Ditambahkan balasan (simetri) |
| 327 | Costa rica | Bangladesh | Baris 2388 | Ditambahkan balasan (simetri) |
| 328 | Costa rica | Belarus | Baris 2389 | Ditambahkan balasan (simetri) |
| 329 | Costa rica | Belgia | Baris 2390 | Ditambahkan balasan (simetri) |
| 330 | Costa rica | Belize | Baris 2391 | Ditambahkan balasan (simetri) |
| 331 | Costa rica | Bermuda | Baris 2392 | Ditambahkan balasan (simetri) |
| 332 | Costa rica | Bhutan | Baris 2393 | Ditambahkan balasan (simetri) |
| 333 | Costa rica | Bosnia dan Hercegovina | Baris 2394 | Ditambahkan balasan (simetri) |
| 334 | Costa rica | Botswana | Baris 2395 | Ditambahkan balasan (simetri) |
| 335 | Costa rica | Brazil | Baris 2396 | Ditambahkan balasan (simetri) |
| 336 | Curacao | Afganistan | Baris 2397 | Ditambahkan balasan (simetri) |
| 337 | Curacao | Amerika Serikat | Baris 2398 | Ditambahkan balasan (simetri) |
| 338 | Curacao | Angola | Baris 2399 | Ditambahkan balasan (simetri) |
| 339 | Curacao | Antigua dan Barbuda | Baris 2400 | Ditambahkan balasan (simetri) |
| 340 | Curacao | Arab Saudi | Baris 2401 | Ditambahkan balasan (simetri) |
| 341 | Curacao | Argentina | Baris 2402 | Ditambahkan balasan (simetri) |
| 342 | Curacao | Bangladesh | Baris 2403 | Ditambahkan balasan (simetri) |
| 343 | Curacao | Belanda | Baris 2404 | Ditambahkan balasan (simetri) |
| 344 | Curacao | Belgia | Baris 2405 | Ditambahkan balasan (simetri) |
| 345 | Curacao | Bolivia | Baris 2406 | Ditambahkan balasan (simetri) |
| 346 | Curacao | Botswana | Baris 2407 | Ditambahkan balasan (simetri) |
| 347 | Denmark | Afganistan | Baris 1722 | Ditambahkan balasan (simetri) |
| 348 | Denmark | Albania | Baris 1723 | Ditambahkan balasan (simetri) |
| 349 | Denmark | Amerika Serikat | Baris 1724 | Ditambahkan balasan (simetri) |
| 350 | Denmark | Antigua dan Barbuda | Baris 1725 | Ditambahkan balasan (simetri) |
| 351 | Denmark | Australia | Baris 1726 | Ditambahkan balasan (simetri) |
| 352 | Denmark | Azerbaijan | Baris 1727 | Ditambahkan balasan (simetri) |
| 353 | Denmark | Bangladesh | Baris 1728 | Ditambahkan balasan (simetri) |
| 354 | Denmark | Belarus | Baris 1729 | Ditambahkan balasan (simetri) |
| 355 | Denmark | Belgia | Baris 1730 | Ditambahkan balasan (simetri) |
| 356 | Denmark | Benin | Baris 1731 | Ditambahkan balasan (simetri) |
| 357 | Denmark | Bermuda | Baris 1732 | Ditambahkan balasan (simetri) |
| 358 | Denmark | Bolivia | Baris 1733 | Ditambahkan balasan (simetri) |
| 359 | Djibouti | Afganistan | Baris 140 | Ditambahkan balasan (simetri) |
| 360 | Djibouti | Afrika Selatan | Baris 141 | Ditambahkan balasan (simetri) |
| 361 | Djibouti | Aljazair | Baris 142 | Ditambahkan balasan (simetri) |
| 362 | Djibouti | Antigua dan Barbuda | Baris 143 | Ditambahkan balasan (simetri) |
| 363 | Djibouti | Arab Saudi | Baris 144 | Ditambahkan balasan (simetri) |
| 364 | Djibouti | Armenia | Baris 145 | Ditambahkan balasan (simetri) |
| 365 | Djibouti | Australia | Baris 146 | Ditambahkan balasan (simetri) |
| 366 | Djibouti | Austria | Baris 147 | Ditambahkan balasan (simetri) |
| 367 | Djibouti | Bangladesh | Baris 148 | Ditambahkan balasan (simetri) |
| 368 | Djibouti | Barbados | Baris 149 | Ditambahkan balasan (simetri) |
| 369 | Djibouti | Belanda | Baris 150 | Ditambahkan balasan (simetri) |
| 370 | Djibouti | Belgia | Baris 151 | Ditambahkan balasan (simetri) |
| 371 | Djibouti | Benin | Baris 152 | Ditambahkan balasan (simetri) |
| 372 | Djibouti | Bhutan | Baris 153 | Ditambahkan balasan (simetri) |
| 373 | Djibouti | Bosnia dan Hercegovina | Baris 154 | Ditambahkan balasan (simetri) |
| 374 | Djibouti | Botswana | Baris 155 | Ditambahkan balasan (simetri) |
| 375 | Dominika | Afganistan | Baris 2408 | Ditambahkan balasan (simetri) |
| 376 | Dominika | Albania | Baris 2409 | Ditambahkan balasan (simetri) |
| 377 | Dominika | Aljazair | Baris 2410 | Ditambahkan balasan (simetri) |
| 378 | Dominika | Andorra | Baris 2411 | Ditambahkan balasan (simetri) |
| 379 | Dominika | Antigua dan Barbuda | Baris 2412 | Ditambahkan balasan (simetri) |
| 380 | Dominika | Argentina | Baris 2413 | Ditambahkan balasan (simetri) |
| 381 | Dominika | Australia | Baris 2414 | Ditambahkan balasan (simetri) |
| 382 | Dominika | Azerbaijan | Baris 2415 | Ditambahkan balasan (simetri) |
| 383 | Dominika | Bahama | Baris 2416 | Ditambahkan balasan (simetri) |
| 384 | Dominika | Bahrain | Baris 2417 | Ditambahkan balasan (simetri) |
| 385 | Dominika | Bangladesh | Baris 2418 | Ditambahkan balasan (simetri) |
| 386 | Dominika | Barbados | Baris 2419 | Ditambahkan balasan (simetri) |
| 387 | Dominika | Belize | Baris 2420 | Ditambahkan balasan (simetri) |
| 388 | Dominika | Benin | Baris 2421 | Ditambahkan balasan (simetri) |
| 389 | Dominika | Bermuda | Baris 2422 | Ditambahkan balasan (simetri) |
| 390 | Dominika | Bhutan | Baris 2423 | Ditambahkan balasan (simetri) |
| 391 | Dominika | Bosnia dan Hercegovina | Baris 2424 | Ditambahkan balasan (simetri) |
| 392 | Dominika | Botswana | Baris 2425 | Ditambahkan balasan (simetri) |
| 393 | Dominika | Brunei | Baris 2426 | Ditambahkan balasan (simetri) |
| 394 | Ekuador | Andorra | Baris 3007 | Ditambahkan balasan (simetri) |
| 395 | Ekuador | Antigua dan Barbuda | Baris 3008 | Ditambahkan balasan (simetri) |
| 396 | Ekuador | Arab Saudi | Baris 3009 | Ditambahkan balasan (simetri) |
| 397 | Ekuador | Argentina | Baris 3010 | Ditambahkan balasan (simetri) |
| 398 | Ekuador | Australia | Baris 3011 | Ditambahkan balasan (simetri) |
| 399 | Ekuador | Azerbaijan | Baris 3012 | Ditambahkan balasan (simetri) |
| 400 | Ekuador | Belanda | Baris 3013 | Ditambahkan balasan (simetri) |
| 401 | Ekuador | Belgia | Baris 3014 | Ditambahkan balasan (simetri) |
| 402 | Ekuador | Belize | Baris 3015 | Ditambahkan balasan (simetri) |
| 403 | Ekuador | Brazil | Baris 3016 | Ditambahkan balasan (simetri) |
| 404 | El salvador | Afganistan | Baris 2427 | Ditambahkan balasan (simetri) |
| 405 | El salvador | Albania | Baris 2428 | Ditambahkan balasan (simetri) |
| 406 | El salvador | Angola | Baris 2429 | Ditambahkan balasan (simetri) |
| 407 | El salvador | Arab Saudi | Baris 2430 | Ditambahkan balasan (simetri) |
| 408 | El salvador | Australia | Baris 2431 | Ditambahkan balasan (simetri) |
| 409 | El salvador | Austria | Baris 2432 | Ditambahkan balasan (simetri) |
| 410 | El salvador | Barbados | Baris 2433 | Ditambahkan balasan (simetri) |
| 411 | El salvador | Belarus | Baris 2434 | Ditambahkan balasan (simetri) |
| 412 | El salvador | Benin | Baris 2435 | Ditambahkan balasan (simetri) |
| 413 | El salvador | Botswana | Baris 2436 | Ditambahkan balasan (simetri) |
| 414 | El salvador | Brazil | Baris 2437 | Ditambahkan balasan (simetri) |
| 415 | Eritrea | Afrika Selatan | Baris 156 | Ditambahkan balasan (simetri) |
| 416 | Eritrea | Aljazair | Baris 157 | Ditambahkan balasan (simetri) |
| 417 | Eritrea | Amerika Serikat | Baris 158 | Ditambahkan balasan (simetri) |
| 418 | Eritrea | Antigua dan Barbuda | Baris 159 | Ditambahkan balasan (simetri) |
| 419 | Eritrea | Arab Saudi | Baris 160 | Ditambahkan balasan (simetri) |
| 420 | Eritrea | Argentina | Baris 161 | Ditambahkan balasan (simetri) |
| 421 | Eritrea | Bahama | Baris 162 | Ditambahkan balasan (simetri) |
| 422 | Eritrea | Bahrain | Baris 163 | Ditambahkan balasan (simetri) |
| 423 | Eritrea | Belanda | Baris 164 | Ditambahkan balasan (simetri) |
| 424 | Eritrea | Belize | Baris 165 | Ditambahkan balasan (simetri) |
| 425 | Eritrea | Benin | Baris 166 | Ditambahkan balasan (simetri) |
| 426 | Eritrea | Bolivia | Baris 167 | Ditambahkan balasan (simetri) |
| 427 | Eritrea | Botswana | Baris 168 | Ditambahkan balasan (simetri) |
| 428 | Eritrea | Brazil | Baris 169 | Ditambahkan balasan (simetri) |
| 429 | Eritrea | Brunei | Baris 170 | Ditambahkan balasan (simetri) |
| 430 | Estonia | Afrika Selatan | Baris 1734 | Ditambahkan balasan (simetri) |
| 431 | Estonia | Albania | Baris 1735 | Ditambahkan balasan (simetri) |
| 432 | Estonia | Aljazair | Baris 1736 | Ditambahkan balasan (simetri) |
| 433 | Estonia | Amerika Serikat | Baris 1737 | Ditambahkan balasan (simetri) |
| 434 | Estonia | Antigua dan Barbuda | Baris 1738 | Ditambahkan balasan (simetri) |
| 435 | Estonia | Arab Saudi | Baris 1739 | Ditambahkan balasan (simetri) |
| 436 | Estonia | Argentina | Baris 1740 | Ditambahkan balasan (simetri) |
| 437 | Estonia | Bangladesh | Baris 1741 | Ditambahkan balasan (simetri) |
| 438 | Estonia | Belanda | Baris 1742 | Ditambahkan balasan (simetri) |
| 439 | Estonia | Belarus | Baris 1743 | Ditambahkan balasan (simetri) |
| 440 | Estonia | Belgia | Baris 1744 | Ditambahkan balasan (simetri) |
| 441 | Estonia | Benin | Baris 1745 | Ditambahkan balasan (simetri) |
| 442 | Estonia | Bermuda | Baris 1746 | Ditambahkan balasan (simetri) |
| 443 | Estonia | Brazil | Baris 1747 | Ditambahkan balasan (simetri) |
| 444 | Estonia | Brunei | Baris 1748 | Ditambahkan balasan (simetri) |
| 445 | Eswatini | Afganistan | Baris 171 | Ditambahkan balasan (simetri) |
| 446 | Eswatini | Aljazair | Baris 172 | Ditambahkan balasan (simetri) |
| 447 | Eswatini | Armenia | Baris 173 | Ditambahkan balasan (simetri) |
| 448 | Eswatini | Australia | Baris 174 | Ditambahkan balasan (simetri) |
| 449 | Eswatini | Azerbaijan | Baris 175 | Ditambahkan balasan (simetri) |
| 450 | Eswatini | Bahrain | Baris 176 | Ditambahkan balasan (simetri) |
| 451 | Eswatini | Barbados | Baris 177 | Ditambahkan balasan (simetri) |
| 452 | Eswatini | Belize | Baris 178 | Ditambahkan balasan (simetri) |
| 453 | Eswatini | Benin | Baris 179 | Ditambahkan balasan (simetri) |
| 454 | Eswatini | Bhutan | Baris 180 | Ditambahkan balasan (simetri) |
| 455 | Eswatini | Bolivia | Baris 181 | Ditambahkan balasan (simetri) |
| 456 | Eswatini | Bosnia dan Hercegovina | Baris 182 | Ditambahkan balasan (simetri) |
| 457 | Ethiopia | Afganistan | Baris 183 | Ditambahkan balasan (simetri) |
| 458 | Ethiopia | Albania | Baris 184 | Ditambahkan balasan (simetri) |
| 459 | Ethiopia | Amerika Serikat | Baris 185 | Ditambahkan balasan (simetri) |
| 460 | Ethiopia | Andorra | Baris 186 | Ditambahkan balasan (simetri) |
| 461 | Ethiopia | Angola | Baris 187 | Ditambahkan balasan (simetri) |
| 462 | Ethiopia | Antigua dan Barbuda | Baris 188 | Ditambahkan balasan (simetri) |
| 463 | Ethiopia | Argentina | Baris 189 | Ditambahkan balasan (simetri) |
| 464 | Ethiopia | Australia | Baris 190 | Ditambahkan balasan (simetri) |
| 465 | Ethiopia | Austria | Baris 191 | Ditambahkan balasan (simetri) |
| 466 | Ethiopia | Azerbaijan | Baris 192 | Ditambahkan balasan (simetri) |
| 467 | Ethiopia | Bahrain | Baris 193 | Ditambahkan balasan (simetri) |
| 468 | Ethiopia | Barbados | Baris 194 | Ditambahkan balasan (simetri) |
| 469 | Ethiopia | Belanda | Baris 195 | Ditambahkan balasan (simetri) |
| 470 | Ethiopia | Belgia | Baris 196 | Ditambahkan balasan (simetri) |
| 471 | Ethiopia | Belize | Baris 197 | Ditambahkan balasan (simetri) |
| 472 | Ethiopia | Benin | Baris 198 | Ditambahkan balasan (simetri) |
| 473 | Ethiopia | Bosnia dan Hercegovina | Baris 199 | Ditambahkan balasan (simetri) |
| 474 | Ethiopia | Botswana | Baris 200 | Ditambahkan balasan (simetri) |
| 475 | Ethiopia | Brazil | Baris 201 | Ditambahkan balasan (simetri) |
| 476 | Ethiopia | Brunei | Baris 202 | Ditambahkan balasan (simetri) |
| 477 | Fiji | Albania | Baris 2714 | Ditambahkan balasan (simetri) |
| 478 | Fiji | Aljazair | Baris 2715 | Ditambahkan balasan (simetri) |
| 479 | Fiji | Argentina | Baris 2716 | Ditambahkan balasan (simetri) |
| 480 | Fiji | Armenia | Baris 2717 | Ditambahkan balasan (simetri) |
| 481 | Fiji | Australia | Baris 2718 | Ditambahkan balasan (simetri) |
| 482 | Fiji | Austria | Baris 2719 | Ditambahkan balasan (simetri) |
| 483 | Fiji | Azerbaijan | Baris 2720 | Ditambahkan balasan (simetri) |
| 484 | Fiji | Bahrain | Baris 2721 | Ditambahkan balasan (simetri) |
| 485 | Fiji | Barbados | Baris 2722 | Ditambahkan balasan (simetri) |
| 486 | Fiji | Belize | Baris 2723 | Ditambahkan balasan (simetri) |
| 487 | Fiji | Benin | Baris 2724 | Ditambahkan balasan (simetri) |
| 488 | Fiji | Bermuda | Baris 2725 | Ditambahkan balasan (simetri) |
| 489 | Fiji | Bhutan | Baris 2726 | Ditambahkan balasan (simetri) |
| 490 | Fiji | Bolivia | Baris 2727 | Ditambahkan balasan (simetri) |
| 491 | Fiji | Brazil | Baris 2728 | Ditambahkan balasan (simetri) |
| 492 | Filipina | Afrika Selatan | Baris 967 | Ditambahkan balasan (simetri) |
| 493 | Filipina | Amerika Serikat | Baris 968 | Ditambahkan balasan (simetri) |
| 494 | Filipina | Andorra | Baris 969 | Ditambahkan balasan (simetri) |
| 495 | Filipina | Antigua dan Barbuda | Baris 970 | Ditambahkan balasan (simetri) |
| 496 | Filipina | Argentina | Baris 971 | Ditambahkan balasan (simetri) |
| 497 | Filipina | Australia | Baris 972 | Ditambahkan balasan (simetri) |
| 498 | Filipina | Austria | Baris 973 | Ditambahkan balasan (simetri) |
| 499 | Filipina | Bahama | Baris 974 | Ditambahkan balasan (simetri) |
| 500 | Filipina | Bangladesh | Baris 975 | Ditambahkan balasan (simetri) |
| 501 | Filipina | Barbados | Baris 976 | Ditambahkan balasan (simetri) |
| 502 | Filipina | Belanda | Baris 977 | Ditambahkan balasan (simetri) |
| 503 | Filipina | Belarus | Baris 978 | Ditambahkan balasan (simetri) |
| 504 | Filipina | Bolivia | Baris 979 | Ditambahkan balasan (simetri) |
| 505 | Filipina | Bosnia dan Hercegovina | Baris 980 | Ditambahkan balasan (simetri) |
| 506 | Filipina | Brunei | Baris 981 | Ditambahkan balasan (simetri) |
| 507 | Finlandia | Albania | Baris 1749 | Ditambahkan balasan (simetri) |
| 508 | Finlandia | Amerika Serikat | Baris 1750 | Ditambahkan balasan (simetri) |
| 509 | Finlandia | Angola | Baris 1751 | Ditambahkan balasan (simetri) |
| 510 | Finlandia | Argentina | Baris 1752 | Ditambahkan balasan (simetri) |
| 511 | Finlandia | Austria | Baris 1753 | Ditambahkan balasan (simetri) |
| 512 | Finlandia | Bahama | Baris 1754 | Ditambahkan balasan (simetri) |
| 513 | Finlandia | Bahrain | Baris 1755 | Ditambahkan balasan (simetri) |
| 514 | Finlandia | Barbados | Baris 1756 | Ditambahkan balasan (simetri) |
| 515 | Finlandia | Belanda | Baris 1757 | Ditambahkan balasan (simetri) |
| 516 | Finlandia | Belarus | Baris 1758 | Ditambahkan balasan (simetri) |
| 517 | Finlandia | Bermuda | Baris 1759 | Ditambahkan balasan (simetri) |
| 518 | Finlandia | Bhutan | Baris 1760 | Ditambahkan balasan (simetri) |
| 519 | Finlandia | Bolivia | Baris 1761 | Ditambahkan balasan (simetri) |
| 520 | Finlandia | Bosnia dan Hercegovina | Baris 1762 | Ditambahkan balasan (simetri) |
| 521 | Finlandia | Botswana | Baris 1763 | Ditambahkan balasan (simetri) |
| 522 | Finlandia | Brazil | Baris 1764 | Ditambahkan balasan (simetri) |
| 523 | Finlandia | Brunei | Baris 1765 | Ditambahkan balasan (simetri) |
| 524 | Gabon | Albania | Baris 203 | Ditambahkan balasan (simetri) |
| 525 | Gabon | Andorra | Baris 204 | Ditambahkan balasan (simetri) |
| 526 | Gabon | Angola | Baris 205 | Ditambahkan balasan (simetri) |
| 527 | Gabon | Arab Saudi | Baris 206 | Ditambahkan balasan (simetri) |
| 528 | Gabon | Armenia | Baris 207 | Ditambahkan balasan (simetri) |
| 529 | Gabon | Austria | Baris 208 | Ditambahkan balasan (simetri) |
| 530 | Gabon | Bahama | Baris 209 | Ditambahkan balasan (simetri) |
| 531 | Gabon | Bahrain | Baris 210 | Ditambahkan balasan (simetri) |
| 532 | Gabon | Bangladesh | Baris 211 | Ditambahkan balasan (simetri) |
| 533 | Gabon | Barbados | Baris 212 | Ditambahkan balasan (simetri) |
| 534 | Gabon | Belarus | Baris 213 | Ditambahkan balasan (simetri) |
| 535 | Gabon | Benin | Baris 214 | Ditambahkan balasan (simetri) |
| 536 | Gabon | Botswana | Baris 215 | Ditambahkan balasan (simetri) |
| 537 | Gabon | Brazil | Baris 216 | Ditambahkan balasan (simetri) |
| 538 | Gabon | Brunei | Baris 217 | Ditambahkan balasan (simetri) |
| 539 | Gambia | Afrika Selatan | Baris 218 | Ditambahkan balasan (simetri) |
| 540 | Gambia | Albania | Baris 219 | Ditambahkan balasan (simetri) |
| 541 | Gambia | Aljazair | Baris 220 | Ditambahkan balasan (simetri) |
| 542 | Gambia | Andorra | Baris 221 | Ditambahkan balasan (simetri) |
| 543 | Gambia | Antigua dan Barbuda | Baris 222 | Ditambahkan balasan (simetri) |
| 544 | Gambia | Armenia | Baris 223 | Ditambahkan balasan (simetri) |
| 545 | Gambia | Austria | Baris 224 | Ditambahkan balasan (simetri) |
| 546 | Gambia | Azerbaijan | Baris 225 | Ditambahkan balasan (simetri) |
| 547 | Gambia | Bahama | Baris 226 | Ditambahkan balasan (simetri) |
| 548 | Gambia | Bangladesh | Baris 227 | Ditambahkan balasan (simetri) |
| 549 | Gambia | Belgia | Baris 228 | Ditambahkan balasan (simetri) |
| 550 | Gambia | Belize | Baris 229 | Ditambahkan balasan (simetri) |
| 551 | Gambia | Bermuda | Baris 230 | Ditambahkan balasan (simetri) |
| 552 | Georgia | Afganistan | Baris 982 | Ditambahkan balasan (simetri) |
| 553 | Georgia | Andorra | Baris 983 | Ditambahkan balasan (simetri) |
| 554 | Georgia | Azerbaijan | Baris 984 | Ditambahkan balasan (simetri) |
| 555 | Georgia | Bahrain | Baris 985 | Ditambahkan balasan (simetri) |
| 556 | Georgia | Bangladesh | Baris 986 | Ditambahkan balasan (simetri) |
| 557 | Georgia | Barbados | Baris 987 | Ditambahkan balasan (simetri) |
| 558 | Georgia | Belarus | Baris 988 | Ditambahkan balasan (simetri) |
| 559 | Georgia | Belize | Baris 989 | Ditambahkan balasan (simetri) |
| 560 | Georgia | Benin | Baris 990 | Ditambahkan balasan (simetri) |
| 561 | Georgia | Brazil | Baris 991 | Ditambahkan balasan (simetri) |
| 562 | Georgia | Brunei | Baris 992 | Ditambahkan balasan (simetri) |
| 563 | Ghana | Afganistan | Baris 231 | Ditambahkan balasan (simetri) |
| 564 | Ghana | Afrika Selatan | Baris 232 | Ditambahkan balasan (simetri) |
| 565 | Ghana | Aljazair | Baris 233 | Ditambahkan balasan (simetri) |
| 566 | Ghana | Amerika Serikat | Baris 234 | Ditambahkan balasan (simetri) |
| 567 | Ghana | Andorra | Baris 235 | Ditambahkan balasan (simetri) |
| 568 | Ghana | Angola | Baris 236 | Ditambahkan balasan (simetri) |
| 569 | Ghana | Antigua dan Barbuda | Baris 237 | Ditambahkan balasan (simetri) |
| 570 | Ghana | Arab Saudi | Baris 238 | Ditambahkan balasan (simetri) |
| 571 | Ghana | Argentina | Baris 239 | Ditambahkan balasan (simetri) |
| 572 | Ghana | Austria | Baris 240 | Ditambahkan balasan (simetri) |
| 573 | Ghana | Belgia | Baris 241 | Ditambahkan balasan (simetri) |
| 574 | Ghana | Bhutan | Baris 242 | Ditambahkan balasan (simetri) |
| 575 | Ghana | Bolivia | Baris 243 | Ditambahkan balasan (simetri) |
| 576 | Ghana | Brunei | Baris 244 | Ditambahkan balasan (simetri) |
| 577 | Gibraltar | Amerika Serikat | Baris 1766 | Ditambahkan balasan (simetri) |
| 578 | Gibraltar | Antigua dan Barbuda | Baris 1767 | Ditambahkan balasan (simetri) |
| 579 | Gibraltar | Azerbaijan | Baris 1768 | Ditambahkan balasan (simetri) |
| 580 | Gibraltar | Bangladesh | Baris 1769 | Ditambahkan balasan (simetri) |
| 581 | Gibraltar | Belanda | Baris 1770 | Ditambahkan balasan (simetri) |
| 582 | Gibraltar | Belize | Baris 1771 | Ditambahkan balasan (simetri) |
| 583 | Gibraltar | Benin | Baris 1772 | Ditambahkan balasan (simetri) |
| 584 | Gibraltar | Bolivia | Baris 1773 | Ditambahkan balasan (simetri) |
| 585 | Gibraltar | Bosnia dan Hercegovina | Baris 1774 | Ditambahkan balasan (simetri) |
| 586 | Gibraltar | Brazil | Baris 1775 | Ditambahkan balasan (simetri) |
| 587 | Greenland | Afganistan | Baris 2438 | Ditambahkan balasan (simetri) |
| 588 | Greenland | Afrika Selatan | Baris 2439 | Ditambahkan balasan (simetri) |
| 589 | Greenland | Aljazair | Baris 2440 | Ditambahkan balasan (simetri) |
| 590 | Greenland | Amerika Serikat | Baris 2441 | Ditambahkan balasan (simetri) |
| 591 | Greenland | Angola | Baris 2442 | Ditambahkan balasan (simetri) |
| 592 | Greenland | Antigua dan Barbuda | Baris 2443 | Ditambahkan balasan (simetri) |
| 593 | Greenland | Argentina | Baris 2444 | Ditambahkan balasan (simetri) |
| 594 | Greenland | Austria | Baris 2445 | Ditambahkan balasan (simetri) |
| 595 | Greenland | Bahama | Baris 2446 | Ditambahkan balasan (simetri) |
| 596 | Greenland | Bangladesh | Baris 2447 | Ditambahkan balasan (simetri) |
| 597 | Greenland | Barbados | Baris 2448 | Ditambahkan balasan (simetri) |
| 598 | Greenland | Belanda | Baris 2449 | Ditambahkan balasan (simetri) |
| 599 | Greenland | Belarus | Baris 2450 | Ditambahkan balasan (simetri) |
| 600 | Greenland | Belgia | Baris 2451 | Ditambahkan balasan (simetri) |
| 601 | Greenland | Benin | Baris 2452 | Ditambahkan balasan (simetri) |
| 602 | Greenland | Bermuda | Baris 2453 | Ditambahkan balasan (simetri) |
| 603 | Greenland | Bhutan | Baris 2454 | Ditambahkan balasan (simetri) |
| 604 | Greenland | Bolivia | Baris 2455 | Ditambahkan balasan (simetri) |
| 605 | Greenland | Bosnia dan Hercegovina | Baris 2456 | Ditambahkan balasan (simetri) |
| 606 | Greenland | Botswana | Baris 2457 | Ditambahkan balasan (simetri) |
| 607 | Grenada | Afganistan | Baris 2458 | Ditambahkan balasan (simetri) |
| 608 | Grenada | Afrika Selatan | Baris 2459 | Ditambahkan balasan (simetri) |
| 609 | Grenada | Aljazair | Baris 2460 | Ditambahkan balasan (simetri) |
| 610 | Grenada | Amerika Serikat | Baris 2461 | Ditambahkan balasan (simetri) |
| 611 | Grenada | Antigua dan Barbuda | Baris 2462 | Ditambahkan balasan (simetri) |
| 612 | Grenada | Arab Saudi | Baris 2463 | Ditambahkan balasan (simetri) |
| 613 | Grenada | Argentina | Baris 2464 | Ditambahkan balasan (simetri) |
| 614 | Grenada | Australia | Baris 2465 | Ditambahkan balasan (simetri) |
| 615 | Grenada | Austria | Baris 2466 | Ditambahkan balasan (simetri) |
| 616 | Grenada | Azerbaijan | Baris 2467 | Ditambahkan balasan (simetri) |
| 617 | Grenada | Bahrain | Baris 2468 | Ditambahkan balasan (simetri) |
| 618 | Grenada | Barbados | Baris 2469 | Ditambahkan balasan (simetri) |
| 619 | Grenada | Belarus | Baris 2470 | Ditambahkan balasan (simetri) |
| 620 | Grenada | Belize | Baris 2471 | Ditambahkan balasan (simetri) |
| 621 | Grenada | Benin | Baris 2472 | Ditambahkan balasan (simetri) |
| 622 | Grenada | Bermuda | Baris 2473 | Ditambahkan balasan (simetri) |
| 623 | Grenada | Bhutan | Baris 2474 | Ditambahkan balasan (simetri) |
| 624 | Grenada | Bosnia dan Hercegovina | Baris 2475 | Ditambahkan balasan (simetri) |
| 625 | Grenada | Brazil | Baris 2476 | Ditambahkan balasan (simetri) |
| 626 | Grenada | Brunei | Baris 2477 | Ditambahkan balasan (simetri) |
| 627 | Guadeloupe | Amerika Serikat | Baris 3158 | Ditambahkan balasan (simetri) |
| 628 | Guadeloupe | Brazil | Baris 3164 | Ditambahkan balasan (simetri) |
| 629 | Guadeloupe | Haiti | Baris 3160 | Ditambahkan balasan (simetri) |
| 630 | Guadeloupe | Inggris | Baris 3166 | Ditambahkan balasan (simetri) |
| 631 | Guadeloupe | Jamaika | Baris 3165 | Ditambahkan balasan (simetri) |
| 632 | Guadeloupe | Kanada | Baris 3159 | Ditambahkan balasan (simetri) |
| 633 | Guadeloupe | Kuba | Baris 3161 | Ditambahkan balasan (simetri) |
| 634 | Guadeloupe | Meksiko | Baris 3163 | Ditambahkan balasan (simetri) |
| 635 | Guadeloupe | Prancis | Baris 3157 | Ditambahkan balasan (simetri) |
| 636 | Guadeloupe | Republik dominika | Baris 3162 | Ditambahkan balasan (simetri) |
| 637 | Guam | Afganistan | Baris 2729 | Ditambahkan balasan (simetri) |
| 638 | Guam | Afrika Selatan | Baris 2730 | Ditambahkan balasan (simetri) |
| 639 | Guam | Albania | Baris 2731 | Ditambahkan balasan (simetri) |
| 640 | Guam | Andorra | Baris 2732 | Ditambahkan balasan (simetri) |
| 641 | Guam | Angola | Baris 2733 | Ditambahkan balasan (simetri) |
| 642 | Guam | Arab Saudi | Baris 2734 | Ditambahkan balasan (simetri) |
| 643 | Guam | Argentina | Baris 2735 | Ditambahkan balasan (simetri) |
| 644 | Guam | Australia | Baris 2736 | Ditambahkan balasan (simetri) |
| 645 | Guam | Austria | Baris 2737 | Ditambahkan balasan (simetri) |
| 646 | Guam | Bahama | Baris 2738 | Ditambahkan balasan (simetri) |
| 647 | Guam | Bangladesh | Baris 2739 | Ditambahkan balasan (simetri) |
| 648 | Guam | Barbados | Baris 2740 | Ditambahkan balasan (simetri) |
| 649 | Guam | Belarus | Baris 2741 | Ditambahkan balasan (simetri) |
| 650 | Guam | Bolivia | Baris 2742 | Ditambahkan balasan (simetri) |
| 651 | Guam | Bosnia dan Hercegovina | Baris 2743 | Ditambahkan balasan (simetri) |
| 652 | Guam | Botswana | Baris 2744 | Ditambahkan balasan (simetri) |
| 653 | Guatemala | Afganistan | Baris 2478 | Ditambahkan balasan (simetri) |
| 654 | Guatemala | Amerika Serikat | Baris 2479 | Ditambahkan balasan (simetri) |
| 655 | Guatemala | Andorra | Baris 2480 | Ditambahkan balasan (simetri) |
| 656 | Guatemala | Antigua dan Barbuda | Baris 2481 | Ditambahkan balasan (simetri) |
| 657 | Guatemala | Arab Saudi | Baris 2482 | Ditambahkan balasan (simetri) |
| 658 | Guatemala | Argentina | Baris 2483 | Ditambahkan balasan (simetri) |
| 659 | Guatemala | Australia | Baris 2484 | Ditambahkan balasan (simetri) |
| 660 | Guatemala | Austria | Baris 2485 | Ditambahkan balasan (simetri) |
| 661 | Guatemala | Bangladesh | Baris 2486 | Ditambahkan balasan (simetri) |
| 662 | Guatemala | Belize | Baris 2487 | Ditambahkan balasan (simetri) |
| 663 | Guatemala | Benin | Baris 2488 | Ditambahkan balasan (simetri) |
| 664 | Guatemala | Bermuda | Baris 2489 | Ditambahkan balasan (simetri) |
| 665 | Guatemala | Brazil | Baris 2490 | Ditambahkan balasan (simetri) |
| 666 | Guiana prancis | Afrika Selatan | Baris 3017 | Ditambahkan balasan (simetri) |
| 667 | Guiana prancis | Aljazair | Baris 3018 | Ditambahkan balasan (simetri) |
| 668 | Guiana prancis | Amerika Serikat | Baris 3019 | Ditambahkan balasan (simetri) |
| 669 | Guiana prancis | Arab Saudi | Baris 3020 | Ditambahkan balasan (simetri) |
| 670 | Guiana prancis | Argentina | Baris 3021 | Ditambahkan balasan (simetri) |
| 671 | Guiana prancis | Austria | Baris 3022 | Ditambahkan balasan (simetri) |
| 672 | Guiana prancis | Azerbaijan | Baris 3023 | Ditambahkan balasan (simetri) |
| 673 | Guiana prancis | Bahama | Baris 3024 | Ditambahkan balasan (simetri) |
| 674 | Guiana prancis | Bahrain | Baris 3025 | Ditambahkan balasan (simetri) |
| 675 | Guiana prancis | Bangladesh | Baris 3026 | Ditambahkan balasan (simetri) |
| 676 | Guiana prancis | Barbados | Baris 3027 | Ditambahkan balasan (simetri) |
| 677 | Guiana prancis | Belanda | Baris 3028 | Ditambahkan balasan (simetri) |
| 678 | Guiana prancis | Belgia | Baris 3032 | Ditambahkan balasan (simetri) |
| 679 | Guiana prancis | Belize | Baris 3033 | Ditambahkan balasan (simetri) |
| 680 | Guiana prancis | Bolivia | Baris 3034 | Ditambahkan balasan (simetri) |
| 681 | Guinea | Afganistan | Baris 245 | Ditambahkan balasan (simetri) |
| 682 | Guinea | Amerika Serikat | Baris 246 | Ditambahkan balasan (simetri) |
| 683 | Guinea | Australia | Baris 247 | Ditambahkan balasan (simetri) |
| 684 | Guinea | Bahama | Baris 248 | Ditambahkan balasan (simetri) |
| 685 | Guinea | Bahrain | Baris 249 | Ditambahkan balasan (simetri) |
| 686 | Guinea | Belanda | Baris 250 | Ditambahkan balasan (simetri) |
| 687 | Guinea | Belarus | Baris 251 | Ditambahkan balasan (simetri) |
| 688 | Guinea | Benin | Baris 252 | Ditambahkan balasan (simetri) |
| 689 | Guinea | Brazil | Baris 253 | Ditambahkan balasan (simetri) |
| 690 | Guinea | Brunei | Baris 254 | Ditambahkan balasan (simetri) |
| 691 | Guinea bissau | Albania | Baris 255 | Ditambahkan balasan (simetri) |
| 692 | Guinea bissau | Aljazair | Baris 256 | Ditambahkan balasan (simetri) |
| 693 | Guinea bissau | Amerika Serikat | Baris 257 | Ditambahkan balasan (simetri) |
| 694 | Guinea bissau | Angola | Baris 258 | Ditambahkan balasan (simetri) |
| 695 | Guinea bissau | Antigua dan Barbuda | Baris 259 | Ditambahkan balasan (simetri) |
| 696 | Guinea bissau | Argentina | Baris 260 | Ditambahkan balasan (simetri) |
| 697 | Guinea bissau | Austria | Baris 261 | Ditambahkan balasan (simetri) |
| 698 | Guinea bissau | Azerbaijan | Baris 262 | Ditambahkan balasan (simetri) |
| 699 | Guinea bissau | Bahama | Baris 263 | Ditambahkan balasan (simetri) |
| 700 | Guinea bissau | Bahrain | Baris 264 | Ditambahkan balasan (simetri) |
| 701 | Guinea bissau | Barbados | Baris 265 | Ditambahkan balasan (simetri) |
| 702 | Guinea bissau | Belanda | Baris 266 | Ditambahkan balasan (simetri) |
| 703 | Guinea bissau | Belarus | Baris 267 | Ditambahkan balasan (simetri) |
| 704 | Guinea bissau | Belize | Baris 268 | Ditambahkan balasan (simetri) |
| 705 | Guinea bissau | Bhutan | Baris 269 | Ditambahkan balasan (simetri) |
| 706 | Guinea bissau | Bolivia | Baris 270 | Ditambahkan balasan (simetri) |
| 707 | Guinea bissau | Bosnia dan Hercegovina | Baris 271 | Ditambahkan balasan (simetri) |
| 708 | Guinea bissau | Botswana | Baris 272 | Ditambahkan balasan (simetri) |
| 709 | Guinea bissau | Brazil | Baris 273 | Ditambahkan balasan (simetri) |
| 710 | Guinea bissau | Brunei | Baris 274 | Ditambahkan balasan (simetri) |
| 711 | Guyana | Afganistan | Baris 3035 | Ditambahkan balasan (simetri) |
| 712 | Guyana | Afrika Selatan | Baris 3036 | Ditambahkan balasan (simetri) |
| 713 | Guyana | Aljazair | Baris 3037 | Ditambahkan balasan (simetri) |
| 714 | Guyana | Andorra | Baris 3038 | Ditambahkan balasan (simetri) |
| 715 | Guyana | Argentina | Baris 3039 | Ditambahkan balasan (simetri) |
| 716 | Guyana | Austria | Baris 3040 | Ditambahkan balasan (simetri) |
| 717 | Guyana | Azerbaijan | Baris 3041 | Ditambahkan balasan (simetri) |
| 718 | Guyana | Bahama | Baris 3042 | Ditambahkan balasan (simetri) |
| 719 | Guyana | Barbados | Baris 3043 | Ditambahkan balasan (simetri) |
| 720 | Guyana | Belanda | Baris 3044 | Ditambahkan balasan (simetri) |
| 721 | Guyana | Belarus | Baris 3045 | Ditambahkan balasan (simetri) |
| 722 | Guyana | Belize | Baris 3046 | Ditambahkan balasan (simetri) |
| 723 | Guyana | Bermuda | Baris 3047 | Ditambahkan balasan (simetri) |
| 724 | Guyana | Bhutan | Baris 3048 | Ditambahkan balasan (simetri) |
| 725 | Guyana | Bosnia dan Hercegovina | Baris 3049 | Ditambahkan balasan (simetri) |
| 726 | Guyana | Botswana | Baris 3050 | Ditambahkan balasan (simetri) |
| 727 | Guyana | Brazil | Baris 3051 | Ditambahkan balasan (simetri) |
| 728 | Guyana | Brunei | Baris 3052 | Ditambahkan balasan (simetri) |
| 729 | Haiti | Albania | Baris 2491 | Ditambahkan balasan (simetri) |
| 730 | Haiti | Andorra | Baris 2492 | Ditambahkan balasan (simetri) |
| 731 | Haiti | Antigua dan Barbuda | Baris 2493 | Ditambahkan balasan (simetri) |
| 732 | Haiti | Azerbaijan | Baris 2494 | Ditambahkan balasan (simetri) |
| 733 | Haiti | Belanda | Baris 2495 | Ditambahkan balasan (simetri) |
| 734 | Haiti | Belgia | Baris 2496 | Ditambahkan balasan (simetri) |
| 735 | Haiti | Belize | Baris 2497 | Ditambahkan balasan (simetri) |
| 736 | Haiti | Benin | Baris 2498 | Ditambahkan balasan (simetri) |
| 737 | Haiti | Bermuda | Baris 2499 | Ditambahkan balasan (simetri) |
| 738 | Haiti | Bhutan | Baris 2500 | Ditambahkan balasan (simetri) |
| 739 | Haiti | Bolivia | Baris 2501 | Ditambahkan balasan (simetri) |
| 740 | Haiti | Bosnia dan Hercegovina | Baris 2502 | Ditambahkan balasan (simetri) |
| 741 | Haiti | Botswana | Baris 2503 | Ditambahkan balasan (simetri) |
| 742 | Honduras | Afrika Selatan | Baris 2504 | Ditambahkan balasan (simetri) |
| 743 | Honduras | Amerika Serikat | Baris 2505 | Ditambahkan balasan (simetri) |
| 744 | Honduras | Antigua dan Barbuda | Baris 2506 | Ditambahkan balasan (simetri) |
| 745 | Honduras | Armenia | Baris 2507 | Ditambahkan balasan (simetri) |
| 746 | Honduras | Belgia | Baris 2508 | Ditambahkan balasan (simetri) |
| 747 | Honduras | Belize | Baris 2509 | Ditambahkan balasan (simetri) |
| 748 | Honduras | Benin | Baris 2510 | Ditambahkan balasan (simetri) |
| 749 | Honduras | Bermuda | Baris 2511 | Ditambahkan balasan (simetri) |
| 750 | Honduras | Bosnia dan Hercegovina | Baris 2512 | Ditambahkan balasan (simetri) |
| 751 | Honduras | Botswana | Baris 2513 | Ditambahkan balasan (simetri) |
| 752 | Honduras | Brazil | Baris 2514 | Ditambahkan balasan (simetri) |
| 753 | Hong kong | Afrika Selatan | Baris 993 | Ditambahkan balasan (simetri) |
| 754 | Hong kong | Albania | Baris 994 | Ditambahkan balasan (simetri) |
| 755 | Hong kong | Aljazair | Baris 995 | Ditambahkan balasan (simetri) |
| 756 | Hong kong | Antigua dan Barbuda | Baris 996 | Ditambahkan balasan (simetri) |
| 757 | Hong kong | Armenia | Baris 997 | Ditambahkan balasan (simetri) |
| 758 | Hong kong | Austria | Baris 998 | Ditambahkan balasan (simetri) |
| 759 | Hong kong | Barbados | Baris 999 | Ditambahkan balasan (simetri) |
| 760 | Hong kong | Belgia | Baris 1000 | Ditambahkan balasan (simetri) |
| 761 | Hong kong | Belize | Baris 1001 | Ditambahkan balasan (simetri) |
| 762 | Hong kong | Benin | Baris 1002 | Ditambahkan balasan (simetri) |
| 763 | Hong kong | Bermuda | Baris 1003 | Ditambahkan balasan (simetri) |
| 764 | Hong kong | Bhutan | Baris 1004 | Ditambahkan balasan (simetri) |
| 765 | Hong kong | Bolivia | Baris 1005 | Ditambahkan balasan (simetri) |
| 766 | Hong kong | Botswana | Baris 1006 | Ditambahkan balasan (simetri) |
| 767 | Hungaria | Albania | Baris 1776 | Ditambahkan balasan (simetri) |
| 768 | Hungaria | Andorra | Baris 1777 | Ditambahkan balasan (simetri) |
| 769 | Hungaria | Antigua dan Barbuda | Baris 1778 | Ditambahkan balasan (simetri) |
| 770 | Hungaria | Arab Saudi | Baris 1779 | Ditambahkan balasan (simetri) |
| 771 | Hungaria | Armenia | Baris 1780 | Ditambahkan balasan (simetri) |
| 772 | Hungaria | Austria | Baris 1781 | Ditambahkan balasan (simetri) |
| 773 | Hungaria | Barbados | Baris 1782 | Ditambahkan balasan (simetri) |
| 774 | Hungaria | Belarus | Baris 1783 | Ditambahkan balasan (simetri) |
| 775 | Hungaria | Belize | Baris 1784 | Ditambahkan balasan (simetri) |
| 776 | Hungaria | Benin | Baris 1785 | Ditambahkan balasan (simetri) |
| 777 | Hungaria | Bermuda | Baris 1786 | Ditambahkan balasan (simetri) |
| 778 | Hungaria | Bhutan | Baris 1787 | Ditambahkan balasan (simetri) |
| 779 | Hungaria | Bolivia | Baris 1788 | Ditambahkan balasan (simetri) |
| 780 | Hungaria | Botswana | Baris 1789 | Ditambahkan balasan (simetri) |
| 781 | Hungaria | Brunei | Baris 1790 | Ditambahkan balasan (simetri) |
| 782 | India | Afrika Selatan | Baris 1007 | Ditambahkan balasan (simetri) |
| 783 | India | Albania | Baris 1008 | Ditambahkan balasan (simetri) |
| 784 | India | Aljazair | Baris 1009 | Ditambahkan balasan (simetri) |
| 785 | India | Andorra | Baris 1010 | Ditambahkan balasan (simetri) |
| 786 | India | Angola | Baris 1011 | Ditambahkan balasan (simetri) |
| 787 | India | Armenia | Baris 1012 | Ditambahkan balasan (simetri) |
| 788 | India | Australia | Baris 1013 | Ditambahkan balasan (simetri) |
| 789 | India | Azerbaijan | Baris 1014 | Ditambahkan balasan (simetri) |
| 790 | India | Bahama | Baris 1015 | Ditambahkan balasan (simetri) |
| 791 | India | Bahrain | Baris 1016 | Ditambahkan balasan (simetri) |
| 792 | India | Bangladesh | Baris 1020 | Ditambahkan balasan (simetri) |
| 793 | India | Barbados | Baris 1021 | Ditambahkan balasan (simetri) |
| 794 | India | Belanda | Baris 1022 | Ditambahkan balasan (simetri) |
| 795 | India | Belarus | Baris 1023 | Ditambahkan balasan (simetri) |
| 796 | India | Benin | Baris 1024 | Ditambahkan balasan (simetri) |
| 797 | India | Bermuda | Baris 1025 | Ditambahkan balasan (simetri) |
| 798 | India | Bolivia | Baris 1026 | Ditambahkan balasan (simetri) |
| 799 | India | Botswana | Baris 1027 | Ditambahkan balasan (simetri) |
| 800 | India | Brunei | Baris 1028 | Ditambahkan balasan (simetri) |
| 801 | Indonesia | Afganistan | Baris 1029 | Ditambahkan balasan (simetri) |
| 802 | Indonesia | Aljazair | Baris 1030 | Ditambahkan balasan (simetri) |
| 803 | Indonesia | Andorra | Baris 1031 | Ditambahkan balasan (simetri) |
| 804 | Indonesia | Antigua dan Barbuda | Baris 1032 | Ditambahkan balasan (simetri) |
| 805 | Indonesia | Argentina | Baris 1033 | Ditambahkan balasan (simetri) |
| 806 | Indonesia | Australia | Baris 1034 | Ditambahkan balasan (simetri) |
| 807 | Indonesia | Austria | Baris 1035 | Ditambahkan balasan (simetri) |
| 808 | Indonesia | Azerbaijan | Baris 1036 | Ditambahkan balasan (simetri) |
| 809 | Indonesia | Bahrain | Baris 1037 | Ditambahkan balasan (simetri) |
| 810 | Indonesia | Belanda | Baris 1038 | Ditambahkan balasan (simetri) |
| 811 | Indonesia | Belarus | Baris 1039 | Ditambahkan balasan (simetri) |
| 812 | Indonesia | Belize | Baris 1040 | Ditambahkan balasan (simetri) |
| 813 | Indonesia | Benin | Baris 1041 | Ditambahkan balasan (simetri) |
| 814 | Indonesia | Bosnia dan Hercegovina | Baris 1042 | Ditambahkan balasan (simetri) |
| 815 | Indonesia | Brazil | Baris 1043 | Ditambahkan balasan (simetri) |
| 816 | Inggris | Afganistan | Baris 1791 | Ditambahkan balasan (simetri) |
| 817 | Inggris | Aljazair | Baris 1792 | Ditambahkan balasan (simetri) |
| 818 | Inggris | Amerika Serikat | Baris 1793 | Ditambahkan balasan (simetri) |
| 819 | Inggris | Andorra | Baris 1794 | Ditambahkan balasan (simetri) |
| 820 | Inggris | Angola | Baris 1795 | Ditambahkan balasan (simetri) |
| 821 | Inggris | Antigua dan Barbuda | Baris 1796 | Ditambahkan balasan (simetri) |
| 822 | Inggris | Arab Saudi | Baris 1797 | Ditambahkan balasan (simetri) |
| 823 | Inggris | Australia | Baris 1798 | Ditambahkan balasan (simetri) |
| 824 | Inggris | Austria | Baris 1799 | Ditambahkan balasan (simetri) |
| 825 | Inggris | Azerbaijan | Baris 1800 | Ditambahkan balasan (simetri) |
| 826 | Inggris | Bahrain | Baris 1801 | Ditambahkan balasan (simetri) |
| 827 | Inggris | Belanda | Baris 1802 | Ditambahkan balasan (simetri) |
| 828 | Inggris | Belarus | Baris 1803 | Ditambahkan balasan (simetri) |
| 829 | Inggris | Bolivia | Baris 1804 | Ditambahkan balasan (simetri) |
| 830 | Inggris | Bosnia dan Hercegovina | Baris 1805 | Ditambahkan balasan (simetri) |
| 831 | Inggris | Botswana | Baris 1806 | Ditambahkan balasan (simetri) |
| 832 | Inggris | Brazil | Baris 1807 | Ditambahkan balasan (simetri) |
| 833 | Inggris | Brunei | Baris 1808 | Ditambahkan balasan (simetri) |
| 834 | Irak | Albania | Baris 1044 | Ditambahkan balasan (simetri) |
| 835 | Irak | Angola | Baris 1045 | Ditambahkan balasan (simetri) |
| 836 | Irak | Antigua dan Barbuda | Baris 1046 | Ditambahkan balasan (simetri) |
| 837 | Irak | Argentina | Baris 1047 | Ditambahkan balasan (simetri) |
| 838 | Irak | Armenia | Baris 1048 | Ditambahkan balasan (simetri) |
| 839 | Irak | Bahama | Baris 1049 | Ditambahkan balasan (simetri) |
| 840 | Irak | Bangladesh | Baris 1050 | Ditambahkan balasan (simetri) |
| 841 | Irak | Barbados | Baris 1051 | Ditambahkan balasan (simetri) |
| 842 | Irak | Belarus | Baris 1052 | Ditambahkan balasan (simetri) |
| 843 | Irak | Belize | Baris 1053 | Ditambahkan balasan (simetri) |
| 844 | Irak | Bolivia | Baris 1054 | Ditambahkan balasan (simetri) |
| 845 | Irak | Bosnia dan Hercegovina | Baris 1055 | Ditambahkan balasan (simetri) |
| 846 | Irak | Brazil | Baris 1056 | Ditambahkan balasan (simetri) |
| 847 | Irak | Brunei | Baris 1057 | Ditambahkan balasan (simetri) |
| 848 | Iran | Afganistan | Baris 1058 | Ditambahkan balasan (simetri) |
| 849 | Iran | Afrika Selatan | Baris 1059 | Ditambahkan balasan (simetri) |
| 850 | Iran | Albania | Baris 1060 | Ditambahkan balasan (simetri) |
| 851 | Iran | Aljazair | Baris 1061 | Ditambahkan balasan (simetri) |
| 852 | Iran | Amerika Serikat | Baris 1062 | Ditambahkan balasan (simetri) |
| 853 | Iran | Andorra | Baris 1063 | Ditambahkan balasan (simetri) |
| 854 | Iran | Angola | Baris 1064 | Ditambahkan balasan (simetri) |
| 855 | Iran | Antigua dan Barbuda | Baris 1065 | Ditambahkan balasan (simetri) |
| 856 | Iran | Arab Saudi | Baris 1066 | Ditambahkan balasan (simetri) |
| 857 | Iran | Argentina | Baris 1067 | Ditambahkan balasan (simetri) |
| 858 | Iran | Armenia | Baris 1068 | Ditambahkan balasan (simetri) |
| 859 | Iran | Bahrain | Baris 1069 | Ditambahkan balasan (simetri) |
| 860 | Iran | Bangladesh | Baris 1070 | Ditambahkan balasan (simetri) |
| 861 | Iran | Belarus | Baris 1071 | Ditambahkan balasan (simetri) |
| 862 | Iran | Belgia | Baris 1072 | Ditambahkan balasan (simetri) |
| 863 | Iran | Benin | Baris 1073 | Ditambahkan balasan (simetri) |
| 864 | Iran | Bermuda | Baris 1074 | Ditambahkan balasan (simetri) |
| 865 | Iran | Bhutan | Baris 1075 | Ditambahkan balasan (simetri) |
| 866 | Iran | Botswana | Baris 1076 | Ditambahkan balasan (simetri) |
| 867 | Iran | Brunei | Baris 1077 | Ditambahkan balasan (simetri) |
| 868 | Irlandia | Afganistan | Baris 1809 | Ditambahkan balasan (simetri) |
| 869 | Irlandia | Andorra | Baris 1810 | Ditambahkan balasan (simetri) |
| 870 | Irlandia | Angola | Baris 1811 | Ditambahkan balasan (simetri) |
| 871 | Irlandia | Antigua dan Barbuda | Baris 1812 | Ditambahkan balasan (simetri) |
| 872 | Irlandia | Arab Saudi | Baris 1813 | Ditambahkan balasan (simetri) |
| 873 | Irlandia | Argentina | Baris 1814 | Ditambahkan balasan (simetri) |
| 874 | Irlandia | Australia | Baris 1815 | Ditambahkan balasan (simetri) |
| 875 | Irlandia | Austria | Baris 1816 | Ditambahkan balasan (simetri) |
| 876 | Irlandia | Azerbaijan | Baris 1817 | Ditambahkan balasan (simetri) |
| 877 | Irlandia | Bahama | Baris 1818 | Ditambahkan balasan (simetri) |
| 878 | Irlandia | Bahrain | Baris 1819 | Ditambahkan balasan (simetri) |
| 879 | Irlandia | Belize | Baris 1820 | Ditambahkan balasan (simetri) |
| 880 | Irlandia | Bermuda | Baris 1821 | Ditambahkan balasan (simetri) |
| 881 | Irlandia | Botswana | Baris 1822 | Ditambahkan balasan (simetri) |
| 882 | Irlandia | Brunei | Baris 1823 | Ditambahkan balasan (simetri) |
| 883 | Islandia | Afrika Selatan | Baris 1824 | Ditambahkan balasan (simetri) |
| 884 | Islandia | Amerika Serikat | Baris 1825 | Ditambahkan balasan (simetri) |
| 885 | Islandia | Andorra | Baris 1826 | Ditambahkan balasan (simetri) |
| 886 | Islandia | Antigua dan Barbuda | Baris 1827 | Ditambahkan balasan (simetri) |
| 887 | Islandia | Armenia | Baris 1828 | Ditambahkan balasan (simetri) |
| 888 | Islandia | Azerbaijan | Baris 1829 | Ditambahkan balasan (simetri) |
| 889 | Islandia | Barbados | Baris 1830 | Ditambahkan balasan (simetri) |
| 890 | Islandia | Belanda | Baris 1831 | Ditambahkan balasan (simetri) |
| 891 | Islandia | Belize | Baris 1832 | Ditambahkan balasan (simetri) |
| 892 | Islandia | Brazil | Baris 1833 | Ditambahkan balasan (simetri) |
| 893 | Israel | Afrika Selatan | Baris 1078 | Ditambahkan balasan (simetri) |
| 894 | Israel | Albania | Baris 1079 | Ditambahkan balasan (simetri) |
| 895 | Israel | Aljazair | Baris 1080 | Ditambahkan balasan (simetri) |
| 896 | Israel | Arab Saudi | Baris 1081 | Ditambahkan balasan (simetri) |
| 897 | Israel | Austria | Baris 1082 | Ditambahkan balasan (simetri) |
| 898 | Israel | Bahrain | Baris 1083 | Ditambahkan balasan (simetri) |
| 899 | Israel | Barbados | Baris 1084 | Ditambahkan balasan (simetri) |
| 900 | Israel | Belgia | Baris 1085 | Ditambahkan balasan (simetri) |
| 901 | Israel | Bhutan | Baris 1086 | Ditambahkan balasan (simetri) |
| 902 | Israel | Bosnia dan Hercegovina | Baris 1087 | Ditambahkan balasan (simetri) |
| 903 | Israel | Botswana | Baris 1088 | Ditambahkan balasan (simetri) |
| 904 | Italia | Afganistan | Baris 1834 | Ditambahkan balasan (simetri) |
| 905 | Italia | Aljazair | Baris 1835 | Ditambahkan balasan (simetri) |
| 906 | Italia | Amerika Serikat | Baris 1836 | Ditambahkan balasan (simetri) |
| 907 | Italia | Argentina | Baris 1837 | Ditambahkan balasan (simetri) |
| 908 | Italia | Armenia | Baris 1838 | Ditambahkan balasan (simetri) |
| 909 | Italia | Azerbaijan | Baris 1839 | Ditambahkan balasan (simetri) |
| 910 | Italia | Bahama | Baris 1840 | Ditambahkan balasan (simetri) |
| 911 | Italia | Belgia | Baris 1841 | Ditambahkan balasan (simetri) |
| 912 | Italia | Bhutan | Baris 1842 | Ditambahkan balasan (simetri) |
| 913 | Italia | Bolivia | Baris 1843 | Ditambahkan balasan (simetri) |
| 914 | Italia | Brazil | Baris 1844 | Ditambahkan balasan (simetri) |
| 915 | Italia | Brunei | Baris 1845 | Ditambahkan balasan (simetri) |
| 916 | Jamaika | Afrika Selatan | Baris 2515 | Ditambahkan balasan (simetri) |
| 917 | Jamaika | Albania | Baris 2516 | Ditambahkan balasan (simetri) |
| 918 | Jamaika | Antigua dan Barbuda | Baris 2517 | Ditambahkan balasan (simetri) |
| 919 | Jamaika | Arab Saudi | Baris 2518 | Ditambahkan balasan (simetri) |
| 920 | Jamaika | Australia | Baris 2519 | Ditambahkan balasan (simetri) |
| 921 | Jamaika | Barbados | Baris 2520 | Ditambahkan balasan (simetri) |
| 922 | Jamaika | Belize | Baris 2521 | Ditambahkan balasan (simetri) |
| 923 | Jamaika | Bermuda | Baris 2522 | Ditambahkan balasan (simetri) |
| 924 | Jamaika | Bolivia | Baris 2523 | Ditambahkan balasan (simetri) |
| 925 | Jamaika | Bosnia dan Hercegovina | Baris 2524 | Ditambahkan balasan (simetri) |
| 926 | Jepang | Afganistan | Baris 1089 | Ditambahkan balasan (simetri) |
| 927 | Jepang | Afrika Selatan | Baris 1090 | Ditambahkan balasan (simetri) |
| 928 | Jepang | Amerika Serikat | Baris 1091 | Ditambahkan balasan (simetri) |
| 929 | Jepang | Antigua dan Barbuda | Baris 1092 | Ditambahkan balasan (simetri) |
| 930 | Jepang | Armenia | Baris 1093 | Ditambahkan balasan (simetri) |
| 931 | Jepang | Azerbaijan | Baris 1094 | Ditambahkan balasan (simetri) |
| 932 | Jepang | Bangladesh | Baris 1095 | Ditambahkan balasan (simetri) |
| 933 | Jepang | Barbados | Baris 1096 | Ditambahkan balasan (simetri) |
| 934 | Jepang | Belanda | Baris 1097 | Ditambahkan balasan (simetri) |
| 935 | Jepang | Belgia | Baris 1098 | Ditambahkan balasan (simetri) |
| 936 | Jepang | Belize | Baris 1099 | Ditambahkan balasan (simetri) |
| 937 | Jepang | Bolivia | Baris 1100 | Ditambahkan balasan (simetri) |
| 938 | Jepang | Botswana | Baris 1101 | Ditambahkan balasan (simetri) |
| 939 | Jerman | Albania | Baris 1846 | Ditambahkan balasan (simetri) |
| 940 | Jerman | Aljazair | Baris 1847 | Ditambahkan balasan (simetri) |
| 941 | Jerman | Amerika Serikat | Baris 1848 | Ditambahkan balasan (simetri) |
| 942 | Jerman | Australia | Baris 1849 | Ditambahkan balasan (simetri) |
| 943 | Jerman | Austria | Baris 1850 | Ditambahkan balasan (simetri) |
| 944 | Jerman | Barbados | Baris 1851 | Ditambahkan balasan (simetri) |
| 945 | Jerman | Belize | Baris 1852 | Ditambahkan balasan (simetri) |
| 946 | Jerman | Bolivia | Baris 1853 | Ditambahkan balasan (simetri) |
| 947 | Jerman | Brazil | Baris 1854 | Ditambahkan balasan (simetri) |
| 948 | Jerman | Brunei | Baris 1855 | Ditambahkan balasan (simetri) |
| 949 | Kamboja | Afganistan | Baris 1102 | Ditambahkan balasan (simetri) |
| 950 | Kamboja | Albania | Baris 1103 | Ditambahkan balasan (simetri) |
| 951 | Kamboja | Aljazair | Baris 1104 | Ditambahkan balasan (simetri) |
| 952 | Kamboja | Amerika Serikat | Baris 1105 | Ditambahkan balasan (simetri) |
| 953 | Kamboja | Andorra | Baris 1106 | Ditambahkan balasan (simetri) |
| 954 | Kamboja | Angola | Baris 1107 | Ditambahkan balasan (simetri) |
| 955 | Kamboja | Arab Saudi | Baris 1108 | Ditambahkan balasan (simetri) |
| 956 | Kamboja | Argentina | Baris 1109 | Ditambahkan balasan (simetri) |
| 957 | Kamboja | Azerbaijan | Baris 1110 | Ditambahkan balasan (simetri) |
| 958 | Kamboja | Bahama | Baris 1111 | Ditambahkan balasan (simetri) |
| 959 | Kamboja | Bangladesh | Baris 1112 | Ditambahkan balasan (simetri) |
| 960 | Kamboja | Barbados | Baris 1113 | Ditambahkan balasan (simetri) |
| 961 | Kamboja | Belize | Baris 1114 | Ditambahkan balasan (simetri) |
| 962 | Kamboja | Bhutan | Baris 1115 | Ditambahkan balasan (simetri) |
| 963 | Kamboja | Bosnia dan Hercegovina | Baris 1116 | Ditambahkan balasan (simetri) |
| 964 | Kamboja | Botswana | Baris 1117 | Ditambahkan balasan (simetri) |
| 965 | Kamboja | Brazil | Baris 1118 | Ditambahkan balasan (simetri) |
| 966 | Kamboja | Brunei | Baris 1119 | Ditambahkan balasan (simetri) |
| 967 | Kamerun | Afganistan | Baris 275 | Ditambahkan balasan (simetri) |
| 968 | Kamerun | Afrika Selatan | Baris 276 | Ditambahkan balasan (simetri) |
| 969 | Kamerun | Albania | Baris 277 | Ditambahkan balasan (simetri) |
| 970 | Kamerun | Aljazair | Baris 278 | Ditambahkan balasan (simetri) |
| 971 | Kamerun | Angola | Baris 279 | Ditambahkan balasan (simetri) |
| 972 | Kamerun | Antigua dan Barbuda | Baris 280 | Ditambahkan balasan (simetri) |
| 973 | Kamerun | Arab Saudi | Baris 281 | Ditambahkan balasan (simetri) |
| 974 | Kamerun | Argentina | Baris 282 | Ditambahkan balasan (simetri) |
| 975 | Kamerun | Australia | Baris 283 | Ditambahkan balasan (simetri) |
| 976 | Kamerun | Austria | Baris 284 | Ditambahkan balasan (simetri) |
| 977 | Kamerun | Azerbaijan | Baris 285 | Ditambahkan balasan (simetri) |
| 978 | Kamerun | Bahama | Baris 286 | Ditambahkan balasan (simetri) |
| 979 | Kamerun | Bahrain | Baris 287 | Ditambahkan balasan (simetri) |
| 980 | Kamerun | Belanda | Baris 288 | Ditambahkan balasan (simetri) |
| 981 | Kamerun | Belarus | Baris 289 | Ditambahkan balasan (simetri) |
| 982 | Kamerun | Bosnia dan Hercegovina | Baris 290 | Ditambahkan balasan (simetri) |
| 983 | Kanada | Afrika Selatan | Baris 2525 | Ditambahkan balasan (simetri) |
| 984 | Kanada | Aljazair | Baris 2529 | Ditambahkan balasan (simetri) |
| 985 | Kanada | Angola | Baris 2530 | Ditambahkan balasan (simetri) |
| 986 | Kanada | Antigua dan Barbuda | Baris 2531 | Ditambahkan balasan (simetri) |
| 987 | Kanada | Argentina | Baris 2532 | Ditambahkan balasan (simetri) |
| 988 | Kanada | Australia | Baris 2533 | Ditambahkan balasan (simetri) |
| 989 | Kanada | Bahama | Baris 2534 | Ditambahkan balasan (simetri) |
| 990 | Kanada | Bangladesh | Baris 2535 | Ditambahkan balasan (simetri) |
| 991 | Kanada | Belarus | Baris 2536 | Ditambahkan balasan (simetri) |
| 992 | Kanada | Belgia | Baris 2537 | Ditambahkan balasan (simetri) |
| 993 | Kanada | Belize | Baris 2538 | Ditambahkan balasan (simetri) |
| 994 | Kanada | Bermuda | Baris 2539 | Ditambahkan balasan (simetri) |
| 995 | Kanada | Bolivia | Baris 2540 | Ditambahkan balasan (simetri) |
| 996 | Kanada | Botswana | Baris 2541 | Ditambahkan balasan (simetri) |
| 997 | Kazakhstan | Andorra | Baris 1120 | Ditambahkan balasan (simetri) |
| 998 | Kazakhstan | Antigua dan Barbuda | Baris 1121 | Ditambahkan balasan (simetri) |
| 999 | Kazakhstan | Arab Saudi | Baris 1122 | Ditambahkan balasan (simetri) |
| 1000 | Kazakhstan | Australia | Baris 1123 | Ditambahkan balasan (simetri) |
| 1001 | Kazakhstan | Austria | Baris 1124 | Ditambahkan balasan (simetri) |
| 1002 | Kazakhstan | Azerbaijan | Baris 1125 | Ditambahkan balasan (simetri) |
| 1003 | Kazakhstan | Bahama | Baris 1126 | Ditambahkan balasan (simetri) |
| 1004 | Kazakhstan | Belgia | Baris 1127 | Ditambahkan balasan (simetri) |
| 1005 | Kazakhstan | Bermuda | Baris 1128 | Ditambahkan balasan (simetri) |
| 1006 | Kazakhstan | Bhutan | Baris 1129 | Ditambahkan balasan (simetri) |
| 1007 | Kazakhstan | Bosnia dan Hercegovina | Baris 1130 | Ditambahkan balasan (simetri) |
| 1008 | Kenya | Afganistan | Baris 291 | Ditambahkan balasan (simetri) |
| 1009 | Kenya | Afrika Selatan | Baris 292 | Ditambahkan balasan (simetri) |
| 1010 | Kenya | Albania | Baris 293 | Ditambahkan balasan (simetri) |
| 1011 | Kenya | Andorra | Baris 294 | Ditambahkan balasan (simetri) |
| 1012 | Kenya | Argentina | Baris 295 | Ditambahkan balasan (simetri) |
| 1013 | Kenya | Armenia | Baris 296 | Ditambahkan balasan (simetri) |
| 1014 | Kenya | Azerbaijan | Baris 297 | Ditambahkan balasan (simetri) |
| 1015 | Kenya | Bahama | Baris 298 | Ditambahkan balasan (simetri) |
| 1016 | Kenya | Bahrain | Baris 299 | Ditambahkan balasan (simetri) |
| 1017 | Kenya | Belgia | Baris 300 | Ditambahkan balasan (simetri) |
| 1018 | Kenya | Belize | Baris 301 | Ditambahkan balasan (simetri) |
| 1019 | Kenya | Bhutan | Baris 302 | Ditambahkan balasan (simetri) |
| 1020 | Kenya | Bosnia dan Hercegovina | Baris 303 | Ditambahkan balasan (simetri) |
| 1021 | Kenya | Botswana | Baris 304 | Ditambahkan balasan (simetri) |
| 1022 | Kenya | Brazil | Baris 305 | Ditambahkan balasan (simetri) |
| 1023 | Kenya | Brunei | Baris 306 | Ditambahkan balasan (simetri) |
| 1024 | Kepulauan faroe | Albania | Baris 1856 | Ditambahkan balasan (simetri) |
| 1025 | Kepulauan faroe | Amerika Serikat | Baris 1857 | Ditambahkan balasan (simetri) |
| 1026 | Kepulauan faroe | Andorra | Baris 1858 | Ditambahkan balasan (simetri) |
| 1027 | Kepulauan faroe | Arab Saudi | Baris 1859 | Ditambahkan balasan (simetri) |
| 1028 | Kepulauan faroe | Argentina | Baris 1860 | Ditambahkan balasan (simetri) |
| 1029 | Kepulauan faroe | Armenia | Baris 1861 | Ditambahkan balasan (simetri) |
| 1030 | Kepulauan faroe | Austria | Baris 1862 | Ditambahkan balasan (simetri) |
| 1031 | Kepulauan faroe | Azerbaijan | Baris 1863 | Ditambahkan balasan (simetri) |
| 1032 | Kepulauan faroe | Bahama | Baris 1864 | Ditambahkan balasan (simetri) |
| 1033 | Kepulauan faroe | Bahrain | Baris 1865 | Ditambahkan balasan (simetri) |
| 1034 | Kepulauan faroe | Belanda | Baris 1866 | Ditambahkan balasan (simetri) |
| 1035 | Kepulauan faroe | Belgia | Baris 1867 | Ditambahkan balasan (simetri) |
| 1036 | Kepulauan faroe | Benin | Baris 1868 | Ditambahkan balasan (simetri) |
| 1037 | Kepulauan faroe | Bhutan | Baris 1869 | Ditambahkan balasan (simetri) |
| 1038 | Kepulauan faroe | Bolivia | Baris 1870 | Ditambahkan balasan (simetri) |
| 1039 | Kepulauan faroe | Botswana | Baris 1871 | Ditambahkan balasan (simetri) |
| 1040 | Kepulauan faroe | Brunei | Baris 1872 | Ditambahkan balasan (simetri) |
| 1041 | Kirgizstan | Afganistan | Baris 1131 | Ditambahkan balasan (simetri) |
| 1042 | Kirgizstan | Aljazair | Baris 1132 | Ditambahkan balasan (simetri) |
| 1043 | Kirgizstan | Andorra | Baris 1133 | Ditambahkan balasan (simetri) |
| 1044 | Kirgizstan | Angola | Baris 1134 | Ditambahkan balasan (simetri) |
| 1045 | Kirgizstan | Arab Saudi | Baris 1135 | Ditambahkan balasan (simetri) |
| 1046 | Kirgizstan | Bahrain | Baris 1136 | Ditambahkan balasan (simetri) |
| 1047 | Kirgizstan | Bangladesh | Baris 1137 | Ditambahkan balasan (simetri) |
| 1048 | Kirgizstan | Barbados | Baris 1138 | Ditambahkan balasan (simetri) |
| 1049 | Kirgizstan | Belanda | Baris 1139 | Ditambahkan balasan (simetri) |
| 1050 | Kirgizstan | Belize | Baris 1140 | Ditambahkan balasan (simetri) |
| 1051 | Kirgizstan | Benin | Baris 1141 | Ditambahkan balasan (simetri) |
| 1052 | Kirgizstan | Brunei | Baris 1142 | Ditambahkan balasan (simetri) |
| 1053 | Kiribati | Afrika Selatan | Baris 2745 | Ditambahkan balasan (simetri) |
| 1054 | Kiribati | Albania | Baris 2746 | Ditambahkan balasan (simetri) |
| 1055 | Kiribati | Amerika Serikat | Baris 2747 | Ditambahkan balasan (simetri) |
| 1056 | Kiribati | Andorra | Baris 2748 | Ditambahkan balasan (simetri) |
| 1057 | Kiribati | Arab Saudi | Baris 2749 | Ditambahkan balasan (simetri) |
| 1058 | Kiribati | Armenia | Baris 2750 | Ditambahkan balasan (simetri) |
| 1059 | Kiribati | Belgia | Baris 2751 | Ditambahkan balasan (simetri) |
| 1060 | Kiribati | Bermuda | Baris 2752 | Ditambahkan balasan (simetri) |
| 1061 | Kiribati | Bosnia dan Hercegovina | Baris 2753 | Ditambahkan balasan (simetri) |
| 1062 | Kiribati | Brunei | Baris 2754 | Ditambahkan balasan (simetri) |
| 1063 | Kolombia | Afganistan | Baris 3053 | Ditambahkan balasan (simetri) |
| 1064 | Kolombia | Afrika Selatan | Baris 3054 | Ditambahkan balasan (simetri) |
| 1065 | Kolombia | Albania | Baris 3055 | Ditambahkan balasan (simetri) |
| 1066 | Kolombia | Amerika Serikat | Baris 3056 | Ditambahkan balasan (simetri) |
| 1067 | Kolombia | Andorra | Baris 3057 | Ditambahkan balasan (simetri) |
| 1068 | Kolombia | Antigua dan Barbuda | Baris 3058 | Ditambahkan balasan (simetri) |
| 1069 | Kolombia | Armenia | Baris 3059 | Ditambahkan balasan (simetri) |
| 1070 | Kolombia | Austria | Baris 3060 | Ditambahkan balasan (simetri) |
| 1071 | Kolombia | Bahama | Baris 3061 | Ditambahkan balasan (simetri) |
| 1072 | Kolombia | Belarus | Baris 3062 | Ditambahkan balasan (simetri) |
| 1073 | Kolombia | Brunei | Baris 3063 | Ditambahkan balasan (simetri) |
| 1074 | Komoro | Afganistan | Baris 307 | Ditambahkan balasan (simetri) |
| 1075 | Komoro | Albania | Baris 308 | Ditambahkan balasan (simetri) |
| 1076 | Komoro | Aljazair | Baris 309 | Ditambahkan balasan (simetri) |
| 1077 | Komoro | Amerika Serikat | Baris 310 | Ditambahkan balasan (simetri) |
| 1078 | Komoro | Andorra | Baris 311 | Ditambahkan balasan (simetri) |
| 1079 | Komoro | Antigua dan Barbuda | Baris 312 | Ditambahkan balasan (simetri) |
| 1080 | Komoro | Arab Saudi | Baris 313 | Ditambahkan balasan (simetri) |
| 1081 | Komoro | Argentina | Baris 314 | Ditambahkan balasan (simetri) |
| 1082 | Komoro | Armenia | Baris 315 | Ditambahkan balasan (simetri) |
| 1083 | Komoro | Australia | Baris 316 | Ditambahkan balasan (simetri) |
| 1084 | Komoro | Azerbaijan | Baris 317 | Ditambahkan balasan (simetri) |
| 1085 | Komoro | Bahama | Baris 318 | Ditambahkan balasan (simetri) |
| 1086 | Komoro | Barbados | Baris 319 | Ditambahkan balasan (simetri) |
| 1087 | Komoro | Belanda | Baris 320 | Ditambahkan balasan (simetri) |
| 1088 | Komoro | Belgia | Baris 321 | Ditambahkan balasan (simetri) |
| 1089 | Komoro | Belize | Baris 322 | Ditambahkan balasan (simetri) |
| 1090 | Komoro | Benin | Baris 323 | Ditambahkan balasan (simetri) |
| 1091 | Komoro | Bosnia dan Hercegovina | Baris 324 | Ditambahkan balasan (simetri) |
| 1092 | Komoro | Botswana | Baris 325 | Ditambahkan balasan (simetri) |
| 1093 | Komoro | Brazil | Baris 326 | Ditambahkan balasan (simetri) |
| 1094 | Kongo | Afrika Selatan | Baris 327 | Ditambahkan balasan (simetri) |
| 1095 | Kongo | Aljazair | Baris 328 | Ditambahkan balasan (simetri) |
| 1096 | Kongo | Amerika Serikat | Baris 329 | Ditambahkan balasan (simetri) |
| 1097 | Kongo | Angola | Baris 330 | Ditambahkan balasan (simetri) |
| 1098 | Kongo | Arab Saudi | Baris 331 | Ditambahkan balasan (simetri) |
| 1099 | Kongo | Argentina | Baris 332 | Ditambahkan balasan (simetri) |
| 1100 | Kongo | Armenia | Baris 333 | Ditambahkan balasan (simetri) |
| 1101 | Kongo | Australia | Baris 334 | Ditambahkan balasan (simetri) |
| 1102 | Kongo | Bahama | Baris 335 | Ditambahkan balasan (simetri) |
| 1103 | Kongo | Belanda | Baris 336 | Ditambahkan balasan (simetri) |
| 1104 | Kongo | Belarus | Baris 337 | Ditambahkan balasan (simetri) |
| 1105 | Kongo | Belgia | Baris 338 | Ditambahkan balasan (simetri) |
| 1106 | Kongo | Bhutan | Baris 339 | Ditambahkan balasan (simetri) |
| 1107 | Kongo | Bolivia | Baris 340 | Ditambahkan balasan (simetri) |
| 1108 | Kongo | Bosnia dan Hercegovina | Baris 341 | Ditambahkan balasan (simetri) |
| 1109 | Kongo | Brazil | Baris 342 | Ditambahkan balasan (simetri) |
| 1110 | Korea selatan | Afganistan | Baris 1143 | Ditambahkan balasan (simetri) |
| 1111 | Korea selatan | Aljazair | Baris 1144 | Ditambahkan balasan (simetri) |
| 1112 | Korea selatan | Angola | Baris 1145 | Ditambahkan balasan (simetri) |
| 1113 | Korea selatan | Arab Saudi | Baris 1146 | Ditambahkan balasan (simetri) |
| 1114 | Korea selatan | Azerbaijan | Baris 1147 | Ditambahkan balasan (simetri) |
| 1115 | Korea selatan | Barbados | Baris 1148 | Ditambahkan balasan (simetri) |
| 1116 | Korea selatan | Belarus | Baris 1149 | Ditambahkan balasan (simetri) |
| 1117 | Korea selatan | Belgia | Baris 1150 | Ditambahkan balasan (simetri) |
| 1118 | Korea selatan | Belize | Baris 1151 | Ditambahkan balasan (simetri) |
| 1119 | Korea selatan | Benin | Baris 1152 | Ditambahkan balasan (simetri) |
| 1120 | Korea selatan | Bhutan | Baris 1153 | Ditambahkan balasan (simetri) |
| 1121 | Korea selatan | Bolivia | Baris 1154 | Ditambahkan balasan (simetri) |
| 1122 | Korea selatan | Botswana | Baris 1155 | Ditambahkan balasan (simetri) |
| 1123 | Korea selatan | Brazil | Baris 1156 | Ditambahkan balasan (simetri) |
| 1124 | Korea selatan | Brunei | Baris 1157 | Ditambahkan balasan (simetri) |
| 1125 | Korea utara | Amerika Serikat | Baris 1158 | Ditambahkan balasan (simetri) |
| 1126 | Korea utara | Andorra | Baris 1159 | Ditambahkan balasan (simetri) |
| 1127 | Korea utara | Antigua dan Barbuda | Baris 1160 | Ditambahkan balasan (simetri) |
| 1128 | Korea utara | Argentina | Baris 1161 | Ditambahkan balasan (simetri) |
| 1129 | Korea utara | Australia | Baris 1162 | Ditambahkan balasan (simetri) |
| 1130 | Korea utara | Azerbaijan | Baris 1163 | Ditambahkan balasan (simetri) |
| 1131 | Korea utara | Bahrain | Baris 1164 | Ditambahkan balasan (simetri) |
| 1132 | Korea utara | Bangladesh | Baris 1165 | Ditambahkan balasan (simetri) |
| 1133 | Korea utara | Barbados | Baris 1166 | Ditambahkan balasan (simetri) |
| 1134 | Korea utara | Belanda | Baris 1167 | Ditambahkan balasan (simetri) |
| 1135 | Korea utara | Belize | Baris 1168 | Ditambahkan balasan (simetri) |
| 1136 | Korea utara | Bermuda | Baris 1169 | Ditambahkan balasan (simetri) |
| 1137 | Kosovo | Afganistan | Baris 1873 | Ditambahkan balasan (simetri) |
| 1138 | Kosovo | Afrika Selatan | Baris 1874 | Ditambahkan balasan (simetri) |
| 1139 | Kosovo | Albania | Baris 1875 | Ditambahkan balasan (simetri) |
| 1140 | Kosovo | Antigua dan Barbuda | Baris 1876 | Ditambahkan balasan (simetri) |
| 1141 | Kosovo | Arab Saudi | Baris 1877 | Ditambahkan balasan (simetri) |
| 1142 | Kosovo | Austria | Baris 1878 | Ditambahkan balasan (simetri) |
| 1143 | Kosovo | Bangladesh | Baris 1879 | Ditambahkan balasan (simetri) |
| 1144 | Kosovo | Belgia | Baris 1880 | Ditambahkan balasan (simetri) |
| 1145 | Kosovo | Belize | Baris 1881 | Ditambahkan balasan (simetri) |
| 1146 | Kosovo | Bermuda | Baris 1882 | Ditambahkan balasan (simetri) |
| 1147 | Kroasia | Afganistan | Baris 1883 | Ditambahkan balasan (simetri) |
| 1148 | Kroasia | Amerika Serikat | Baris 1884 | Ditambahkan balasan (simetri) |
| 1149 | Kroasia | Angola | Baris 1885 | Ditambahkan balasan (simetri) |
| 1150 | Kroasia | Antigua dan Barbuda | Baris 1886 | Ditambahkan balasan (simetri) |
| 1151 | Kroasia | Arab Saudi | Baris 1887 | Ditambahkan balasan (simetri) |
| 1152 | Kroasia | Argentina | Baris 1888 | Ditambahkan balasan (simetri) |
| 1153 | Kroasia | Armenia | Baris 1889 | Ditambahkan balasan (simetri) |
| 1154 | Kroasia | Azerbaijan | Baris 1890 | Ditambahkan balasan (simetri) |
| 1155 | Kroasia | Bahama | Baris 1891 | Ditambahkan balasan (simetri) |
| 1156 | Kroasia | Bahrain | Baris 1892 | Ditambahkan balasan (simetri) |
| 1157 | Kroasia | Barbados | Baris 1893 | Ditambahkan balasan (simetri) |
| 1158 | Kroasia | Belarus | Baris 1894 | Ditambahkan balasan (simetri) |
| 1159 | Kroasia | Bhutan | Baris 1895 | Ditambahkan balasan (simetri) |
| 1160 | Kroasia | Botswana | Baris 1896 | Ditambahkan balasan (simetri) |
| 1161 | Kroasia | Brazil | Baris 1897 | Ditambahkan balasan (simetri) |
| 1162 | Kroasia | Brunei | Baris 1898 | Ditambahkan balasan (simetri) |
| 1163 | Kuba | Aljazair | Baris 2542 | Ditambahkan balasan (simetri) |
| 1164 | Kuba | Amerika Serikat | Baris 2543 | Ditambahkan balasan (simetri) |
| 1165 | Kuba | Angola | Baris 2544 | Ditambahkan balasan (simetri) |
| 1166 | Kuba | Antigua dan Barbuda | Baris 2545 | Ditambahkan balasan (simetri) |
| 1167 | Kuba | Arab Saudi | Baris 2546 | Ditambahkan balasan (simetri) |
| 1168 | Kuba | Armenia | Baris 2547 | Ditambahkan balasan (simetri) |
| 1169 | Kuba | Australia | Baris 2548 | Ditambahkan balasan (simetri) |
| 1170 | Kuba | Austria | Baris 2549 | Ditambahkan balasan (simetri) |
| 1171 | Kuba | Bahama | Baris 2550 | Ditambahkan balasan (simetri) |
| 1172 | Kuba | Bahrain | Baris 2551 | Ditambahkan balasan (simetri) |
| 1173 | Kuba | Bangladesh | Baris 2552 | Ditambahkan balasan (simetri) |
| 1174 | Kuba | Belarus | Baris 2553 | Ditambahkan balasan (simetri) |
| 1175 | Kuba | Belize | Baris 2554 | Ditambahkan balasan (simetri) |
| 1176 | Kuba | Bermuda | Baris 2555 | Ditambahkan balasan (simetri) |
| 1177 | Kuba | Bolivia | Baris 2556 | Ditambahkan balasan (simetri) |
| 1178 | Kuba | Bosnia dan Hercegovina | Baris 2557 | Ditambahkan balasan (simetri) |
| 1179 | Kuba | Botswana | Baris 2558 | Ditambahkan balasan (simetri) |
| 1180 | Kuba | Brunei | Baris 2559 | Ditambahkan balasan (simetri) |
| 1181 | Kuwait | Afganistan | Baris 1170 | Ditambahkan balasan (simetri) |
| 1182 | Kuwait | Afrika Selatan | Baris 1171 | Ditambahkan balasan (simetri) |
| 1183 | Kuwait | Amerika Serikat | Baris 1172 | Ditambahkan balasan (simetri) |
| 1184 | Kuwait | Andorra | Baris 1173 | Ditambahkan balasan (simetri) |
| 1185 | Kuwait | Angola | Baris 1174 | Ditambahkan balasan (simetri) |
| 1186 | Kuwait | Arab Saudi | Baris 1175 | Ditambahkan balasan (simetri) |
| 1187 | Kuwait | Argentina | Baris 1176 | Ditambahkan balasan (simetri) |
| 1188 | Kuwait | Armenia | Baris 1177 | Ditambahkan balasan (simetri) |
| 1189 | Kuwait | Australia | Baris 1178 | Ditambahkan balasan (simetri) |
| 1190 | Kuwait | Azerbaijan | Baris 1179 | Ditambahkan balasan (simetri) |
| 1191 | Kuwait | Bahrain | Baris 1180 | Ditambahkan balasan (simetri) |
| 1192 | Kuwait | Bangladesh | Baris 1181 | Ditambahkan balasan (simetri) |
| 1193 | Kuwait | Belanda | Baris 1182 | Ditambahkan balasan (simetri) |
| 1194 | Kuwait | Belgia | Baris 1183 | Ditambahkan balasan (simetri) |
| 1195 | Kuwait | Benin | Baris 1184 | Ditambahkan balasan (simetri) |
| 1196 | Kuwait | Bhutan | Baris 1185 | Ditambahkan balasan (simetri) |
| 1197 | Kuwait | Bosnia dan Hercegovina | Baris 1186 | Ditambahkan balasan (simetri) |
| 1198 | Kuwait | Botswana | Baris 1187 | Ditambahkan balasan (simetri) |
| 1199 | Kuwait | Brazil | Baris 1188 | Ditambahkan balasan (simetri) |
| 1200 | Kuwait | Brunei | Baris 1189 | Ditambahkan balasan (simetri) |
| 1201 | Laos | Afganistan | Baris 1190 | Ditambahkan balasan (simetri) |
| 1202 | Laos | Albania | Baris 1191 | Ditambahkan balasan (simetri) |
| 1203 | Laos | Aljazair | Baris 1192 | Ditambahkan balasan (simetri) |
| 1204 | Laos | Amerika Serikat | Baris 1193 | Ditambahkan balasan (simetri) |
| 1205 | Laos | Andorra | Baris 1194 | Ditambahkan balasan (simetri) |
| 1206 | Laos | Angola | Baris 1195 | Ditambahkan balasan (simetri) |
| 1207 | Laos | Arab Saudi | Baris 1196 | Ditambahkan balasan (simetri) |
| 1208 | Laos | Armenia | Baris 1197 | Ditambahkan balasan (simetri) |
| 1209 | Laos | Azerbaijan | Baris 1198 | Ditambahkan balasan (simetri) |
| 1210 | Laos | Barbados | Baris 1199 | Ditambahkan balasan (simetri) |
| 1211 | Laos | Belanda | Baris 1200 | Ditambahkan balasan (simetri) |
| 1212 | Laos | Belarus | Baris 1201 | Ditambahkan balasan (simetri) |
| 1213 | Laos | Benin | Baris 1202 | Ditambahkan balasan (simetri) |
| 1214 | Laos | Bermuda | Baris 1203 | Ditambahkan balasan (simetri) |
| 1215 | Laos | Bhutan | Baris 1204 | Ditambahkan balasan (simetri) |
| 1216 | Laos | Bolivia | Baris 1205 | Ditambahkan balasan (simetri) |
| 1217 | Laos | Bosnia dan Hercegovina | Baris 1206 | Ditambahkan balasan (simetri) |
| 1218 | Laos | Botswana | Baris 1207 | Ditambahkan balasan (simetri) |
| 1219 | Laos | Brunei | Baris 1208 | Ditambahkan balasan (simetri) |
| 1220 | Latvia | Afrika Selatan | Baris 1899 | Ditambahkan balasan (simetri) |
| 1221 | Latvia | Albania | Baris 1900 | Ditambahkan balasan (simetri) |
| 1222 | Latvia | Amerika Serikat | Baris 1901 | Ditambahkan balasan (simetri) |
| 1223 | Latvia | Andorra | Baris 1902 | Ditambahkan balasan (simetri) |
| 1224 | Latvia | Antigua dan Barbuda | Baris 1903 | Ditambahkan balasan (simetri) |
| 1225 | Latvia | Arab Saudi | Baris 1904 | Ditambahkan balasan (simetri) |
| 1226 | Latvia | Argentina | Baris 1905 | Ditambahkan balasan (simetri) |
| 1227 | Latvia | Armenia | Baris 1906 | Ditambahkan balasan (simetri) |
| 1228 | Latvia | Australia | Baris 1907 | Ditambahkan balasan (simetri) |
| 1229 | Latvia | Azerbaijan | Baris 1908 | Ditambahkan balasan (simetri) |
| 1230 | Latvia | Bahama | Baris 1909 | Ditambahkan balasan (simetri) |
| 1231 | Latvia | Barbados | Baris 1910 | Ditambahkan balasan (simetri) |
| 1232 | Latvia | Belize | Baris 1911 | Ditambahkan balasan (simetri) |
| 1233 | Latvia | Bermuda | Baris 1912 | Ditambahkan balasan (simetri) |
| 1234 | Latvia | Bhutan | Baris 1913 | Ditambahkan balasan (simetri) |
| 1235 | Latvia | Brunei | Baris 1914 | Ditambahkan balasan (simetri) |
| 1236 | Lebanon | Afganistan | Baris 1209 | Ditambahkan balasan (simetri) |
| 1237 | Lebanon | Afrika Selatan | Baris 1210 | Ditambahkan balasan (simetri) |
| 1238 | Lebanon | Andorra | Baris 1211 | Ditambahkan balasan (simetri) |
| 1239 | Lebanon | Angola | Baris 1212 | Ditambahkan balasan (simetri) |
| 1240 | Lebanon | Arab Saudi | Baris 1213 | Ditambahkan balasan (simetri) |
| 1241 | Lebanon | Azerbaijan | Baris 1214 | Ditambahkan balasan (simetri) |
| 1242 | Lebanon | Bahama | Baris 1215 | Ditambahkan balasan (simetri) |
| 1243 | Lebanon | Bangladesh | Baris 1216 | Ditambahkan balasan (simetri) |
| 1244 | Lebanon | Benin | Baris 1217 | Ditambahkan balasan (simetri) |
| 1245 | Lebanon | Brunei | Baris 1218 | Ditambahkan balasan (simetri) |
| 1246 | Lesotho | Afrika Selatan | Baris 343 | Ditambahkan balasan (simetri) |
| 1247 | Lesotho | Amerika Serikat | Baris 344 | Ditambahkan balasan (simetri) |
| 1248 | Lesotho | Andorra | Baris 345 | Ditambahkan balasan (simetri) |
| 1249 | Lesotho | Angola | Baris 346 | Ditambahkan balasan (simetri) |
| 1250 | Lesotho | Arab Saudi | Baris 347 | Ditambahkan balasan (simetri) |
| 1251 | Lesotho | Argentina | Baris 348 | Ditambahkan balasan (simetri) |
| 1252 | Lesotho | Armenia | Baris 349 | Ditambahkan balasan (simetri) |
| 1253 | Lesotho | Austria | Baris 350 | Ditambahkan balasan (simetri) |
| 1254 | Lesotho | Bangladesh | Baris 351 | Ditambahkan balasan (simetri) |
| 1255 | Lesotho | Barbados | Baris 352 | Ditambahkan balasan (simetri) |
| 1256 | Lesotho | Bolivia | Baris 353 | Ditambahkan balasan (simetri) |
| 1257 | Lesotho | Brunei | Baris 354 | Ditambahkan balasan (simetri) |
| 1258 | Liberia | Afganistan | Baris 355 | Ditambahkan balasan (simetri) |
| 1259 | Liberia | Aljazair | Baris 356 | Ditambahkan balasan (simetri) |
| 1260 | Liberia | Andorra | Baris 357 | Ditambahkan balasan (simetri) |
| 1261 | Liberia | Angola | Baris 358 | Ditambahkan balasan (simetri) |
| 1262 | Liberia | Antigua dan Barbuda | Baris 359 | Ditambahkan balasan (simetri) |
| 1263 | Liberia | Arab Saudi | Baris 360 | Ditambahkan balasan (simetri) |
| 1264 | Liberia | Argentina | Baris 361 | Ditambahkan balasan (simetri) |
| 1265 | Liberia | Azerbaijan | Baris 362 | Ditambahkan balasan (simetri) |
| 1266 | Liberia | Bahrain | Baris 363 | Ditambahkan balasan (simetri) |
| 1267 | Liberia | Bangladesh | Baris 364 | Ditambahkan balasan (simetri) |
| 1268 | Liberia | Barbados | Baris 365 | Ditambahkan balasan (simetri) |
| 1269 | Liberia | Brazil | Baris 366 | Ditambahkan balasan (simetri) |
| 1270 | Libya | Afrika Selatan | Baris 367 | Ditambahkan balasan (simetri) |
| 1271 | Libya | Amerika Serikat | Baris 368 | Ditambahkan balasan (simetri) |
| 1272 | Libya | Andorra | Baris 369 | Ditambahkan balasan (simetri) |
| 1273 | Libya | Angola | Baris 370 | Ditambahkan balasan (simetri) |
| 1274 | Libya | Arab Saudi | Baris 371 | Ditambahkan balasan (simetri) |
| 1275 | Libya | Armenia | Baris 372 | Ditambahkan balasan (simetri) |
| 1276 | Libya | Australia | Baris 373 | Ditambahkan balasan (simetri) |
| 1277 | Libya | Austria | Baris 374 | Ditambahkan balasan (simetri) |
| 1278 | Libya | Bahama | Baris 375 | Ditambahkan balasan (simetri) |
| 1279 | Libya | Bangladesh | Baris 376 | Ditambahkan balasan (simetri) |
| 1280 | Libya | Belarus | Baris 377 | Ditambahkan balasan (simetri) |
| 1281 | Libya | Belize | Baris 378 | Ditambahkan balasan (simetri) |
| 1282 | Libya | Bermuda | Baris 379 | Ditambahkan balasan (simetri) |
| 1283 | Libya | Bolivia | Baris 380 | Ditambahkan balasan (simetri) |
| 1284 | Libya | Botswana | Baris 381 | Ditambahkan balasan (simetri) |
| 1285 | Libya | Brazil | Baris 382 | Ditambahkan balasan (simetri) |
| 1286 | Liechtenstein | Afganistan | Baris 1915 | Ditambahkan balasan (simetri) |
| 1287 | Liechtenstein | Afrika Selatan | Baris 1916 | Ditambahkan balasan (simetri) |
| 1288 | Liechtenstein | Albania | Baris 1917 | Ditambahkan balasan (simetri) |
| 1289 | Liechtenstein | Aljazair | Baris 1918 | Ditambahkan balasan (simetri) |
| 1290 | Liechtenstein | Argentina | Baris 1919 | Ditambahkan balasan (simetri) |
| 1291 | Liechtenstein | Australia | Baris 1920 | Ditambahkan balasan (simetri) |
| 1292 | Liechtenstein | Bahrain | Baris 1921 | Ditambahkan balasan (simetri) |
| 1293 | Liechtenstein | Barbados | Baris 1922 | Ditambahkan balasan (simetri) |
| 1294 | Liechtenstein | Belanda | Baris 1923 | Ditambahkan balasan (simetri) |
| 1295 | Liechtenstein | Belarus | Baris 1924 | Ditambahkan balasan (simetri) |
| 1296 | Liechtenstein | Benin | Baris 1925 | Ditambahkan balasan (simetri) |
| 1297 | Liechtenstein | Bosnia dan Hercegovina | Baris 1926 | Ditambahkan balasan (simetri) |
| 1298 | Lithuania | Afganistan | Baris 1927 | Ditambahkan balasan (simetri) |
| 1299 | Lithuania | Albania | Baris 1928 | Ditambahkan balasan (simetri) |
| 1300 | Lithuania | Amerika Serikat | Baris 1929 | Ditambahkan balasan (simetri) |
| 1301 | Lithuania | Andorra | Baris 1930 | Ditambahkan balasan (simetri) |
| 1302 | Lithuania | Antigua dan Barbuda | Baris 1931 | Ditambahkan balasan (simetri) |
| 1303 | Lithuania | Arab Saudi | Baris 1932 | Ditambahkan balasan (simetri) |
| 1304 | Lithuania | Austria | Baris 1933 | Ditambahkan balasan (simetri) |
| 1305 | Lithuania | Bahrain | Baris 1934 | Ditambahkan balasan (simetri) |
| 1306 | Lithuania | Belanda | Baris 1935 | Ditambahkan balasan (simetri) |
| 1307 | Lithuania | Benin | Baris 1936 | Ditambahkan balasan (simetri) |
| 1308 | Lithuania | Bhutan | Baris 1937 | Ditambahkan balasan (simetri) |
| 1309 | Luksemburg | Afganistan | Baris 1938 | Ditambahkan balasan (simetri) |
| 1310 | Luksemburg | Afrika Selatan | Baris 1939 | Ditambahkan balasan (simetri) |
| 1311 | Luksemburg | Albania | Baris 1940 | Ditambahkan balasan (simetri) |
| 1312 | Luksemburg | Amerika Serikat | Baris 1941 | Ditambahkan balasan (simetri) |
| 1313 | Luksemburg | Antigua dan Barbuda | Baris 1942 | Ditambahkan balasan (simetri) |
| 1314 | Luksemburg | Argentina | Baris 1943 | Ditambahkan balasan (simetri) |
| 1315 | Luksemburg | Armenia | Baris 1944 | Ditambahkan balasan (simetri) |
| 1316 | Luksemburg | Australia | Baris 1945 | Ditambahkan balasan (simetri) |
| 1317 | Luksemburg | Bahama | Baris 1946 | Ditambahkan balasan (simetri) |
| 1318 | Luksemburg | Bahrain | Baris 1947 | Ditambahkan balasan (simetri) |
| 1319 | Luksemburg | Bangladesh | Baris 1948 | Ditambahkan balasan (simetri) |
| 1320 | Luksemburg | Belanda | Baris 1949 | Ditambahkan balasan (simetri) |
| 1321 | Luksemburg | Belarus | Baris 1950 | Ditambahkan balasan (simetri) |
| 1322 | Luksemburg | Belize | Baris 1951 | Ditambahkan balasan (simetri) |
| 1323 | Luksemburg | Benin | Baris 1952 | Ditambahkan balasan (simetri) |
| 1324 | Luksemburg | Bolivia | Baris 1953 | Ditambahkan balasan (simetri) |
| 1325 | Luksemburg | Brazil | Baris 1954 | Ditambahkan balasan (simetri) |
| 1326 | Madagaskar | Afganistan | Baris 383 | Ditambahkan balasan (simetri) |
| 1327 | Madagaskar | Albania | Baris 384 | Ditambahkan balasan (simetri) |
| 1328 | Madagaskar | Aljazair | Baris 385 | Ditambahkan balasan (simetri) |
| 1329 | Madagaskar | Antigua dan Barbuda | Baris 386 | Ditambahkan balasan (simetri) |
| 1330 | Madagaskar | Arab Saudi | Baris 387 | Ditambahkan balasan (simetri) |
| 1331 | Madagaskar | Australia | Baris 388 | Ditambahkan balasan (simetri) |
| 1332 | Madagaskar | Austria | Baris 389 | Ditambahkan balasan (simetri) |
| 1333 | Madagaskar | Bahrain | Baris 390 | Ditambahkan balasan (simetri) |
| 1334 | Madagaskar | Belanda | Baris 391 | Ditambahkan balasan (simetri) |
| 1335 | Madagaskar | Belarus | Baris 392 | Ditambahkan balasan (simetri) |
| 1336 | Madagaskar | Belgia | Baris 393 | Ditambahkan balasan (simetri) |
| 1337 | Madagaskar | Belize | Baris 394 | Ditambahkan balasan (simetri) |
| 1338 | Madagaskar | Brunei | Baris 395 | Ditambahkan balasan (simetri) |
| 1339 | Makau | Albania | Baris 1219 | Ditambahkan balasan (simetri) |
| 1340 | Makau | Arab Saudi | Baris 1220 | Ditambahkan balasan (simetri) |
| 1341 | Makau | Armenia | Baris 1221 | Ditambahkan balasan (simetri) |
| 1342 | Makau | Australia | Baris 1222 | Ditambahkan balasan (simetri) |
| 1343 | Makau | Azerbaijan | Baris 1223 | Ditambahkan balasan (simetri) |
| 1344 | Makau | Bahama | Baris 1224 | Ditambahkan balasan (simetri) |
| 1345 | Makau | Bangladesh | Baris 1225 | Ditambahkan balasan (simetri) |
| 1346 | Makau | Barbados | Baris 1226 | Ditambahkan balasan (simetri) |
| 1347 | Makau | Belanda | Baris 1227 | Ditambahkan balasan (simetri) |
| 1348 | Makau | Belize | Baris 1228 | Ditambahkan balasan (simetri) |
| 1349 | Makau | Benin | Baris 1229 | Ditambahkan balasan (simetri) |
| 1350 | Makau | Bermuda | Baris 1230 | Ditambahkan balasan (simetri) |
| 1351 | Makau | Bhutan | Baris 1231 | Ditambahkan balasan (simetri) |
| 1352 | Makau | Bosnia dan Hercegovina | Baris 1232 | Ditambahkan balasan (simetri) |
| 1353 | Makedonia utara | Afganistan | Baris 1955 | Ditambahkan balasan (simetri) |
| 1354 | Makedonia utara | Albania | Baris 1956 | Ditambahkan balasan (simetri) |
| 1355 | Makedonia utara | Aljazair | Baris 1957 | Ditambahkan balasan (simetri) |
| 1356 | Makedonia utara | Amerika Serikat | Baris 1958 | Ditambahkan balasan (simetri) |
| 1357 | Makedonia utara | Andorra | Baris 1959 | Ditambahkan balasan (simetri) |
| 1358 | Makedonia utara | Antigua dan Barbuda | Baris 1960 | Ditambahkan balasan (simetri) |
| 1359 | Makedonia utara | Argentina | Baris 1961 | Ditambahkan balasan (simetri) |
| 1360 | Makedonia utara | Armenia | Baris 1962 | Ditambahkan balasan (simetri) |
| 1361 | Makedonia utara | Australia | Baris 1963 | Ditambahkan balasan (simetri) |
| 1362 | Makedonia utara | Bahrain | Baris 1964 | Ditambahkan balasan (simetri) |
| 1363 | Makedonia utara | Barbados | Baris 1965 | Ditambahkan balasan (simetri) |
| 1364 | Makedonia utara | Belarus | Baris 1966 | Ditambahkan balasan (simetri) |
| 1365 | Makedonia utara | Belgia | Baris 1967 | Ditambahkan balasan (simetri) |
| 1366 | Makedonia utara | Bermuda | Baris 1968 | Ditambahkan balasan (simetri) |
| 1367 | Makedonia utara | Bolivia | Baris 1969 | Ditambahkan balasan (simetri) |
| 1368 | Malawi | Afganistan | Baris 396 | Ditambahkan balasan (simetri) |
| 1369 | Malawi | Aljazair | Baris 397 | Ditambahkan balasan (simetri) |
| 1370 | Malawi | Amerika Serikat | Baris 398 | Ditambahkan balasan (simetri) |
| 1371 | Malawi | Antigua dan Barbuda | Baris 399 | Ditambahkan balasan (simetri) |
| 1372 | Malawi | Arab Saudi | Baris 400 | Ditambahkan balasan (simetri) |
| 1373 | Malawi | Armenia | Baris 401 | Ditambahkan balasan (simetri) |
| 1374 | Malawi | Azerbaijan | Baris 402 | Ditambahkan balasan (simetri) |
| 1375 | Malawi | Bahama | Baris 403 | Ditambahkan balasan (simetri) |
| 1376 | Malawi | Barbados | Baris 404 | Ditambahkan balasan (simetri) |
| 1377 | Malawi | Belgia | Baris 405 | Ditambahkan balasan (simetri) |
| 1378 | Malawi | Benin | Baris 406 | Ditambahkan balasan (simetri) |
| 1379 | Malawi | Bermuda | Baris 407 | Ditambahkan balasan (simetri) |
| 1380 | Malawi | Bhutan | Baris 408 | Ditambahkan balasan (simetri) |
| 1381 | Malawi | Bolivia | Baris 409 | Ditambahkan balasan (simetri) |
| 1382 | Malawi | Botswana | Baris 410 | Ditambahkan balasan (simetri) |
| 1383 | Malawi | Brazil | Baris 411 | Ditambahkan balasan (simetri) |
| 1384 | Malaysia | Afrika Selatan | Baris 1233 | Ditambahkan balasan (simetri) |
| 1385 | Malaysia | Albania | Baris 1234 | Ditambahkan balasan (simetri) |
| 1386 | Malaysia | Aljazair | Baris 1235 | Ditambahkan balasan (simetri) |
| 1387 | Malaysia | Amerika Serikat | Baris 1236 | Ditambahkan balasan (simetri) |
| 1388 | Malaysia | Andorra | Baris 1237 | Ditambahkan balasan (simetri) |
| 1389 | Malaysia | Angola | Baris 1238 | Ditambahkan balasan (simetri) |
| 1390 | Malaysia | Antigua dan Barbuda | Baris 1239 | Ditambahkan balasan (simetri) |
| 1391 | Malaysia | Armenia | Baris 1240 | Ditambahkan balasan (simetri) |
| 1392 | Malaysia | Austria | Baris 1241 | Ditambahkan balasan (simetri) |
| 1393 | Malaysia | Azerbaijan | Baris 1242 | Ditambahkan balasan (simetri) |
| 1394 | Malaysia | Bahama | Baris 1243 | Ditambahkan balasan (simetri) |
| 1395 | Malaysia | Bahrain | Baris 1244 | Ditambahkan balasan (simetri) |
| 1396 | Malaysia | Bangladesh | Baris 1245 | Ditambahkan balasan (simetri) |
| 1397 | Malaysia | Barbados | Baris 1246 | Ditambahkan balasan (simetri) |
| 1398 | Malaysia | Belgia | Baris 1247 | Ditambahkan balasan (simetri) |
| 1399 | Malaysia | Belize | Baris 1248 | Ditambahkan balasan (simetri) |
| 1400 | Malaysia | Benin | Baris 1249 | Ditambahkan balasan (simetri) |
| 1401 | Malaysia | Bermuda | Baris 1250 | Ditambahkan balasan (simetri) |
| 1402 | Malaysia | Bosnia dan Hercegovina | Baris 1251 | Ditambahkan balasan (simetri) |
| 1403 | Maldives | Afrika Selatan | Baris 1252 | Ditambahkan balasan (simetri) |
| 1404 | Maldives | Albania | Baris 1253 | Ditambahkan balasan (simetri) |
| 1405 | Maldives | Aljazair | Baris 1254 | Ditambahkan balasan (simetri) |
| 1406 | Maldives | Amerika Serikat | Baris 1255 | Ditambahkan balasan (simetri) |
| 1407 | Maldives | Andorra | Baris 1256 | Ditambahkan balasan (simetri) |
| 1408 | Maldives | Angola | Baris 1257 | Ditambahkan balasan (simetri) |
| 1409 | Maldives | Armenia | Baris 1258 | Ditambahkan balasan (simetri) |
| 1410 | Maldives | Australia | Baris 1259 | Ditambahkan balasan (simetri) |
| 1411 | Maldives | Azerbaijan | Baris 1260 | Ditambahkan balasan (simetri) |
| 1412 | Maldives | Bahama | Baris 1261 | Ditambahkan balasan (simetri) |
| 1413 | Maldives | Bahrain | Baris 1262 | Ditambahkan balasan (simetri) |
| 1414 | Maldives | Bangladesh | Baris 1263 | Ditambahkan balasan (simetri) |
| 1415 | Maldives | Belarus | Baris 1264 | Ditambahkan balasan (simetri) |
| 1416 | Maldives | Belgia | Baris 1265 | Ditambahkan balasan (simetri) |
| 1417 | Maldives | Belize | Baris 1266 | Ditambahkan balasan (simetri) |
| 1418 | Maldives | Bermuda | Baris 1267 | Ditambahkan balasan (simetri) |
| 1419 | Maldives | Bhutan | Baris 1268 | Ditambahkan balasan (simetri) |
| 1420 | Maldives | Bolivia | Baris 1269 | Ditambahkan balasan (simetri) |
| 1421 | Maldives | Brazil | Baris 1270 | Ditambahkan balasan (simetri) |
| 1422 | Maldives | Brunei | Baris 1271 | Ditambahkan balasan (simetri) |
| 1423 | Mali | Afganistan | Baris 412 | Ditambahkan balasan (simetri) |
| 1424 | Mali | Albania | Baris 413 | Ditambahkan balasan (simetri) |
| 1425 | Mali | Aljazair | Baris 414 | Ditambahkan balasan (simetri) |
| 1426 | Mali | Amerika Serikat | Baris 415 | Ditambahkan balasan (simetri) |
| 1427 | Mali | Antigua dan Barbuda | Baris 416 | Ditambahkan balasan (simetri) |
| 1428 | Mali | Arab Saudi | Baris 417 | Ditambahkan balasan (simetri) |
| 1429 | Mali | Argentina | Baris 418 | Ditambahkan balasan (simetri) |
| 1430 | Mali | Armenia | Baris 419 | Ditambahkan balasan (simetri) |
| 1431 | Mali | Bahama | Baris 420 | Ditambahkan balasan (simetri) |
| 1432 | Mali | Bahrain | Baris 421 | Ditambahkan balasan (simetri) |
| 1433 | Mali | Bangladesh | Baris 422 | Ditambahkan balasan (simetri) |
| 1434 | Mali | Barbados | Baris 423 | Ditambahkan balasan (simetri) |
| 1435 | Mali | Belanda | Baris 424 | Ditambahkan balasan (simetri) |
| 1436 | Mali | Belarus | Baris 425 | Ditambahkan balasan (simetri) |
| 1437 | Mali | Benin | Baris 426 | Ditambahkan balasan (simetri) |
| 1438 | Mali | Bhutan | Baris 427 | Ditambahkan balasan (simetri) |
| 1439 | Mali | Bolivia | Baris 428 | Ditambahkan balasan (simetri) |
| 1440 | Mali | Bosnia dan Hercegovina | Baris 429 | Ditambahkan balasan (simetri) |
| 1441 | Mali | Brunei | Baris 430 | Ditambahkan balasan (simetri) |
| 1442 | Malta | Afganistan | Baris 1970 | Ditambahkan balasan (simetri) |
| 1443 | Malta | Afrika Selatan | Baris 1971 | Ditambahkan balasan (simetri) |
| 1444 | Malta | Albania | Baris 1972 | Ditambahkan balasan (simetri) |
| 1445 | Malta | Andorra | Baris 1973 | Ditambahkan balasan (simetri) |
| 1446 | Malta | Antigua dan Barbuda | Baris 1974 | Ditambahkan balasan (simetri) |
| 1447 | Malta | Arab Saudi | Baris 1975 | Ditambahkan balasan (simetri) |
| 1448 | Malta | Argentina | Baris 1976 | Ditambahkan balasan (simetri) |
| 1449 | Malta | Australia | Baris 1977 | Ditambahkan balasan (simetri) |
| 1450 | Malta | Azerbaijan | Baris 1978 | Ditambahkan balasan (simetri) |
| 1451 | Malta | Bahrain | Baris 1979 | Ditambahkan balasan (simetri) |
| 1452 | Malta | Barbados | Baris 1980 | Ditambahkan balasan (simetri) |
| 1453 | Malta | Belanda | Baris 1981 | Ditambahkan balasan (simetri) |
| 1454 | Malta | Belarus | Baris 1982 | Ditambahkan balasan (simetri) |
| 1455 | Malta | Belize | Baris 1983 | Ditambahkan balasan (simetri) |
| 1456 | Malta | Bhutan | Baris 1984 | Ditambahkan balasan (simetri) |
| 1457 | Malta | Bolivia | Baris 1985 | Ditambahkan balasan (simetri) |
| 1458 | Malta | Bosnia dan Hercegovina | Baris 1986 | Ditambahkan balasan (simetri) |
| 1459 | Malta | Botswana | Baris 1987 | Ditambahkan balasan (simetri) |
| 1460 | Malta | Brazil | Baris 1988 | Ditambahkan balasan (simetri) |
| 1461 | Malta | Brunei | Baris 1989 | Ditambahkan balasan (simetri) |
| 1462 | Maroko | Afrika Selatan | Baris 431 | Ditambahkan balasan (simetri) |
| 1463 | Maroko | Angola | Baris 432 | Ditambahkan balasan (simetri) |
| 1464 | Maroko | Arab Saudi | Baris 433 | Ditambahkan balasan (simetri) |
| 1465 | Maroko | Argentina | Baris 434 | Ditambahkan balasan (simetri) |
| 1466 | Maroko | Armenia | Baris 435 | Ditambahkan balasan (simetri) |
| 1467 | Maroko | Austria | Baris 436 | Ditambahkan balasan (simetri) |
| 1468 | Maroko | Bahama | Baris 437 | Ditambahkan balasan (simetri) |
| 1469 | Maroko | Bahrain | Baris 438 | Ditambahkan balasan (simetri) |
| 1470 | Maroko | Barbados | Baris 439 | Ditambahkan balasan (simetri) |
| 1471 | Maroko | Belarus | Baris 440 | Ditambahkan balasan (simetri) |
| 1472 | Maroko | Belgia | Baris 441 | Ditambahkan balasan (simetri) |
| 1473 | Maroko | Belize | Baris 442 | Ditambahkan balasan (simetri) |
| 1474 | Maroko | Benin | Baris 443 | Ditambahkan balasan (simetri) |
| 1475 | Maroko | Bermuda | Baris 444 | Ditambahkan balasan (simetri) |
| 1476 | Maroko | Botswana | Baris 445 | Ditambahkan balasan (simetri) |
| 1477 | Maroko | Brazil | Baris 446 | Ditambahkan balasan (simetri) |
| 1478 | Marshall | Afganistan | Baris 2755 | Ditambahkan balasan (simetri) |
| 1479 | Marshall | Afrika Selatan | Baris 2756 | Ditambahkan balasan (simetri) |
| 1480 | Marshall | Amerika Serikat | Baris 2757 | Ditambahkan balasan (simetri) |
| 1481 | Marshall | Antigua dan Barbuda | Baris 2758 | Ditambahkan balasan (simetri) |
| 1482 | Marshall | Bahrain | Baris 2759 | Ditambahkan balasan (simetri) |
| 1483 | Marshall | Barbados | Baris 2760 | Ditambahkan balasan (simetri) |
| 1484 | Marshall | Belanda | Baris 2761 | Ditambahkan balasan (simetri) |
| 1485 | Marshall | Belize | Baris 2762 | Ditambahkan balasan (simetri) |
| 1486 | Marshall | Benin | Baris 2763 | Ditambahkan balasan (simetri) |
| 1487 | Marshall | Bermuda | Baris 2764 | Ditambahkan balasan (simetri) |
| 1488 | Marshall | Bosnia dan Hercegovina | Baris 2765 | Ditambahkan balasan (simetri) |
| 1489 | Marshall | Botswana | Baris 2766 | Ditambahkan balasan (simetri) |
| 1490 | Martinique | Amerika Serikat | Baris 3168 | Ditambahkan balasan (simetri) |
| 1491 | Martinique | Barbados | Baris 3172 | Ditambahkan balasan (simetri) |
| 1492 | Martinique | Brazil | Baris 3170 | Ditambahkan balasan (simetri) |
| 1493 | Martinique | Haiti | Baris 3173 | Ditambahkan balasan (simetri) |
| 1494 | Martinique | Kanada | Baris 3169 | Ditambahkan balasan (simetri) |
| 1495 | Martinique | Kuba | Baris 3175 | Ditambahkan balasan (simetri) |
| 1496 | Martinique | Meksiko | Baris 3176 | Ditambahkan balasan (simetri) |
| 1497 | Martinique | Prancis | Baris 3167 | Ditambahkan balasan (simetri) |
| 1498 | Martinique | Trinidad dan tobago | Baris 3174 | Ditambahkan balasan (simetri) |
| 1499 | Martinique | Venezuela | Baris 3171 | Ditambahkan balasan (simetri) |
| 1500 | Mauritania | Afganistan | Baris 447 | Ditambahkan balasan (simetri) |
| 1501 | Mauritania | Afrika Selatan | Baris 448 | Ditambahkan balasan (simetri) |
| 1502 | Mauritania | Aljazair | Baris 449 | Ditambahkan balasan (simetri) |
| 1503 | Mauritania | Amerika Serikat | Baris 450 | Ditambahkan balasan (simetri) |
| 1504 | Mauritania | Antigua dan Barbuda | Baris 451 | Ditambahkan balasan (simetri) |
| 1505 | Mauritania | Belanda | Baris 452 | Ditambahkan balasan (simetri) |
| 1506 | Mauritania | Belarus | Baris 453 | Ditambahkan balasan (simetri) |
| 1507 | Mauritania | Belgia | Baris 454 | Ditambahkan balasan (simetri) |
| 1508 | Mauritania | Benin | Baris 455 | Ditambahkan balasan (simetri) |
| 1509 | Mauritania | Brazil | Baris 456 | Ditambahkan balasan (simetri) |
| 1510 | Mauritius | Albania | Baris 457 | Ditambahkan balasan (simetri) |
| 1511 | Mauritius | Amerika Serikat | Baris 458 | Ditambahkan balasan (simetri) |
| 1512 | Mauritius | Angola | Baris 459 | Ditambahkan balasan (simetri) |
| 1513 | Mauritius | Antigua dan Barbuda | Baris 460 | Ditambahkan balasan (simetri) |
| 1514 | Mauritius | Armenia | Baris 461 | Ditambahkan balasan (simetri) |
| 1515 | Mauritius | Austria | Baris 462 | Ditambahkan balasan (simetri) |
| 1516 | Mauritius | Bangladesh | Baris 463 | Ditambahkan balasan (simetri) |
| 1517 | Mauritius | Barbados | Baris 464 | Ditambahkan balasan (simetri) |
| 1518 | Mauritius | Belgia | Baris 465 | Ditambahkan balasan (simetri) |
| 1519 | Mauritius | Belize | Baris 466 | Ditambahkan balasan (simetri) |
| 1520 | Mauritius | Benin | Baris 467 | Ditambahkan balasan (simetri) |
| 1521 | Mauritius | Bhutan | Baris 468 | Ditambahkan balasan (simetri) |
| 1522 | Mauritius | Bosnia dan Hercegovina | Baris 469 | Ditambahkan balasan (simetri) |
| 1523 | Mauritius | Brazil | Baris 470 | Ditambahkan balasan (simetri) |
| 1524 | Mayotte | Afrika Selatan | Baris 3145 | Ditambahkan balasan (simetri) |
| 1525 | Mayotte | India | Baris 3146 | Ditambahkan balasan (simetri) |
| 1526 | Mayotte | Kenya | Baris 3143 | Ditambahkan balasan (simetri) |
| 1527 | Mayotte | Komoro | Baris 3138 | Ditambahkan balasan (simetri) |
| 1528 | Mayotte | Madagaskar | Baris 3139 | Ditambahkan balasan (simetri) |
| 1529 | Mayotte | Mauritius | Baris 3141 | Ditambahkan balasan (simetri) |
| 1530 | Mayotte | Mozambik | Baris 3144 | Ditambahkan balasan (simetri) |
| 1531 | Mayotte | Prancis | Baris 3137 | Ditambahkan balasan (simetri) |
| 1532 | Mayotte | Republik tanzania | Baris 3140 | Ditambahkan balasan (simetri) |
| 1533 | Mayotte | Seychelles | Baris 3142 | Ditambahkan balasan (simetri) |
| 1534 | Meksiko | Afrika Selatan | Baris 2560 | Ditambahkan balasan (simetri) |
| 1535 | Meksiko | Aljazair | Baris 2561 | Ditambahkan balasan (simetri) |
| 1536 | Meksiko | Armenia | Baris 2562 | Ditambahkan balasan (simetri) |
| 1537 | Meksiko | Bahrain | Baris 2563 | Ditambahkan balasan (simetri) |
| 1538 | Meksiko | Bangladesh | Baris 2564 | Ditambahkan balasan (simetri) |
| 1539 | Meksiko | Barbados | Baris 2565 | Ditambahkan balasan (simetri) |
| 1540 | Meksiko | Belanda | Baris 2566 | Ditambahkan balasan (simetri) |
| 1541 | Meksiko | Belarus | Baris 2567 | Ditambahkan balasan (simetri) |
| 1542 | Meksiko | Botswana | Baris 2568 | Ditambahkan balasan (simetri) |
| 1543 | Meksiko | Brazil | Baris 2569 | Ditambahkan balasan (simetri) |
| 1544 | Mesir | Afganistan | Baris 471 | Ditambahkan balasan (simetri) |
| 1545 | Mesir | Antigua dan Barbuda | Baris 472 | Ditambahkan balasan (simetri) |
| 1546 | Mesir | Argentina | Baris 473 | Ditambahkan balasan (simetri) |
| 1547 | Mesir | Australia | Baris 474 | Ditambahkan balasan (simetri) |
| 1548 | Mesir | Austria | Baris 475 | Ditambahkan balasan (simetri) |
| 1549 | Mesir | Barbados | Baris 476 | Ditambahkan balasan (simetri) |
| 1550 | Mesir | Belarus | Baris 477 | Ditambahkan balasan (simetri) |
| 1551 | Mesir | Belgia | Baris 478 | Ditambahkan balasan (simetri) |
| 1552 | Mesir | Bermuda | Baris 479 | Ditambahkan balasan (simetri) |
| 1553 | Mesir | Bhutan | Baris 480 | Ditambahkan balasan (simetri) |
| 1554 | Mikronesia | Afganistan | Baris 2767 | Ditambahkan balasan (simetri) |
| 1555 | Mikronesia | Afrika Selatan | Baris 2768 | Ditambahkan balasan (simetri) |
| 1556 | Mikronesia | Albania | Baris 2769 | Ditambahkan balasan (simetri) |
| 1557 | Mikronesia | Aljazair | Baris 2770 | Ditambahkan balasan (simetri) |
| 1558 | Mikronesia | Amerika Serikat | Baris 2771 | Ditambahkan balasan (simetri) |
| 1559 | Mikronesia | Angola | Baris 2772 | Ditambahkan balasan (simetri) |
| 1560 | Mikronesia | Antigua dan Barbuda | Baris 2773 | Ditambahkan balasan (simetri) |
| 1561 | Mikronesia | Argentina | Baris 2774 | Ditambahkan balasan (simetri) |
| 1562 | Mikronesia | Armenia | Baris 2775 | Ditambahkan balasan (simetri) |
| 1563 | Mikronesia | Australia | Baris 2776 | Ditambahkan balasan (simetri) |
| 1564 | Mikronesia | Azerbaijan | Baris 2777 | Ditambahkan balasan (simetri) |
| 1565 | Mikronesia | Bahrain | Baris 2778 | Ditambahkan balasan (simetri) |
| 1566 | Mikronesia | Barbados | Baris 2779 | Ditambahkan balasan (simetri) |
| 1567 | Mikronesia | Belanda | Baris 2780 | Ditambahkan balasan (simetri) |
| 1568 | Mikronesia | Belarus | Baris 2781 | Ditambahkan balasan (simetri) |
| 1569 | Mikronesia | Belgia | Baris 2782 | Ditambahkan balasan (simetri) |
| 1570 | Mikronesia | Belize | Baris 2783 | Ditambahkan balasan (simetri) |
| 1571 | Mikronesia | Benin | Baris 2784 | Ditambahkan balasan (simetri) |
| 1572 | Mikronesia | Bolivia | Baris 2785 | Ditambahkan balasan (simetri) |
| 1573 | Mikronesia | Brunei | Baris 2786 | Ditambahkan balasan (simetri) |
| 1574 | Moldova | Angola | Baris 1990 | Ditambahkan balasan (simetri) |
| 1575 | Moldova | Armenia | Baris 1991 | Ditambahkan balasan (simetri) |
| 1576 | Moldova | Australia | Baris 1992 | Ditambahkan balasan (simetri) |
| 1577 | Moldova | Austria | Baris 1993 | Ditambahkan balasan (simetri) |
| 1578 | Moldova | Bahama | Baris 1994 | Ditambahkan balasan (simetri) |
| 1579 | Moldova | Belarus | Baris 1995 | Ditambahkan balasan (simetri) |
| 1580 | Moldova | Bermuda | Baris 1996 | Ditambahkan balasan (simetri) |
| 1581 | Moldova | Bhutan | Baris 1997 | Ditambahkan balasan (simetri) |
| 1582 | Moldova | Bolivia | Baris 1998 | Ditambahkan balasan (simetri) |
| 1583 | Moldova | Brunei | Baris 1999 | Ditambahkan balasan (simetri) |
| 1584 | Monako | Albania | Baris 2000 | Ditambahkan balasan (simetri) |
| 1585 | Monako | Aljazair | Baris 2001 | Ditambahkan balasan (simetri) |
| 1586 | Monako | Angola | Baris 2002 | Ditambahkan balasan (simetri) |
| 1587 | Monako | Antigua dan Barbuda | Baris 2003 | Ditambahkan balasan (simetri) |
| 1588 | Monako | Argentina | Baris 2004 | Ditambahkan balasan (simetri) |
| 1589 | Monako | Australia | Baris 2005 | Ditambahkan balasan (simetri) |
| 1590 | Monako | Bahama | Baris 2006 | Ditambahkan balasan (simetri) |
| 1591 | Monako | Barbados | Baris 2007 | Ditambahkan balasan (simetri) |
| 1592 | Monako | Belize | Baris 2008 | Ditambahkan balasan (simetri) |
| 1593 | Monako | Bermuda | Baris 2009 | Ditambahkan balasan (simetri) |
| 1594 | Monako | Bosnia dan Hercegovina | Baris 2010 | Ditambahkan balasan (simetri) |
| 1595 | Monako | Botswana | Baris 2011 | Ditambahkan balasan (simetri) |
| 1596 | Mongolia | Afrika Selatan | Baris 1272 | Ditambahkan balasan (simetri) |
| 1597 | Mongolia | Amerika Serikat | Baris 1273 | Ditambahkan balasan (simetri) |
| 1598 | Mongolia | Andorra | Baris 1274 | Ditambahkan balasan (simetri) |
| 1599 | Mongolia | Antigua dan Barbuda | Baris 1275 | Ditambahkan balasan (simetri) |
| 1600 | Mongolia | Armenia | Baris 1276 | Ditambahkan balasan (simetri) |
| 1601 | Mongolia | Austria | Baris 1277 | Ditambahkan balasan (simetri) |
| 1602 | Mongolia | Azerbaijan | Baris 1278 | Ditambahkan balasan (simetri) |
| 1603 | Mongolia | Bahama | Baris 1279 | Ditambahkan balasan (simetri) |
| 1604 | Mongolia | Belanda | Baris 1280 | Ditambahkan balasan (simetri) |
| 1605 | Mongolia | Belarus | Baris 1281 | Ditambahkan balasan (simetri) |
| 1606 | Mongolia | Belize | Baris 1282 | Ditambahkan balasan (simetri) |
| 1607 | Mongolia | Benin | Baris 1283 | Ditambahkan balasan (simetri) |
| 1608 | Mongolia | Bolivia | Baris 1284 | Ditambahkan balasan (simetri) |
| 1609 | Mongolia | Bosnia dan Hercegovina | Baris 1285 | Ditambahkan balasan (simetri) |
| 1610 | Mongolia | Botswana | Baris 1286 | Ditambahkan balasan (simetri) |
| 1611 | Mongolia | Brunei | Baris 1287 | Ditambahkan balasan (simetri) |
| 1612 | Montenegro | Afganistan | Baris 2012 | Ditambahkan balasan (simetri) |
| 1613 | Montenegro | Albania | Baris 2013 | Ditambahkan balasan (simetri) |
| 1614 | Montenegro | Antigua dan Barbuda | Baris 2014 | Ditambahkan balasan (simetri) |
| 1615 | Montenegro | Arab Saudi | Baris 2015 | Ditambahkan balasan (simetri) |
| 1616 | Montenegro | Argentina | Baris 2016 | Ditambahkan balasan (simetri) |
| 1617 | Montenegro | Bangladesh | Baris 2017 | Ditambahkan balasan (simetri) |
| 1618 | Montenegro | Belgia | Baris 2018 | Ditambahkan balasan (simetri) |
| 1619 | Montenegro | Belize | Baris 2019 | Ditambahkan balasan (simetri) |
| 1620 | Montenegro | Bermuda | Baris 2020 | Ditambahkan balasan (simetri) |
| 1621 | Montenegro | Bhutan | Baris 2021 | Ditambahkan balasan (simetri) |
| 1622 | Montenegro | Bolivia | Baris 2022 | Ditambahkan balasan (simetri) |
| 1623 | Montenegro | Bosnia dan Hercegovina | Baris 2026 | Ditambahkan balasan (simetri) |
| 1624 | Montenegro | Botswana | Baris 2027 | Ditambahkan balasan (simetri) |
| 1625 | Montenegro | Brunei | Baris 2028 | Ditambahkan balasan (simetri) |
| 1626 | Mozambik | Afganistan | Baris 481 | Ditambahkan balasan (simetri) |
| 1627 | Mozambik | Amerika Serikat | Baris 482 | Ditambahkan balasan (simetri) |
| 1628 | Mozambik | Andorra | Baris 483 | Ditambahkan balasan (simetri) |
| 1629 | Mozambik | Angola | Baris 484 | Ditambahkan balasan (simetri) |
| 1630 | Mozambik | Antigua dan Barbuda | Baris 485 | Ditambahkan balasan (simetri) |
| 1631 | Mozambik | Arab Saudi | Baris 486 | Ditambahkan balasan (simetri) |
| 1632 | Mozambik | Austria | Baris 487 | Ditambahkan balasan (simetri) |
| 1633 | Mozambik | Bahrain | Baris 488 | Ditambahkan balasan (simetri) |
| 1634 | Mozambik | Barbados | Baris 489 | Ditambahkan balasan (simetri) |
| 1635 | Mozambik | Belanda | Baris 490 | Ditambahkan balasan (simetri) |
| 1636 | Mozambik | Belarus | Baris 491 | Ditambahkan balasan (simetri) |
| 1637 | Mozambik | Benin | Baris 492 | Ditambahkan balasan (simetri) |
| 1638 | Mozambik | Bermuda | Baris 493 | Ditambahkan balasan (simetri) |
| 1639 | Mozambik | Bhutan | Baris 494 | Ditambahkan balasan (simetri) |
| 1640 | Mozambik | Bolivia | Baris 495 | Ditambahkan balasan (simetri) |
| 1641 | Mozambik | Bosnia dan Hercegovina | Baris 496 | Ditambahkan balasan (simetri) |
| 1642 | Mozambik | Brunei | Baris 497 | Ditambahkan balasan (simetri) |
| 1643 | Myanmar | Aljazair | Baris 1288 | Ditambahkan balasan (simetri) |
| 1644 | Myanmar | Amerika Serikat | Baris 1289 | Ditambahkan balasan (simetri) |
| 1645 | Myanmar | Antigua dan Barbuda | Baris 1290 | Ditambahkan balasan (simetri) |
| 1646 | Myanmar | Argentina | Baris 1291 | Ditambahkan balasan (simetri) |
| 1647 | Myanmar | Australia | Baris 1292 | Ditambahkan balasan (simetri) |
| 1648 | Myanmar | Azerbaijan | Baris 1293 | Ditambahkan balasan (simetri) |
| 1649 | Myanmar | Bahrain | Baris 1294 | Ditambahkan balasan (simetri) |
| 1650 | Myanmar | Barbados | Baris 1295 | Ditambahkan balasan (simetri) |
| 1651 | Myanmar | Belarus | Baris 1296 | Ditambahkan balasan (simetri) |
| 1652 | Myanmar | Benin | Baris 1297 | Ditambahkan balasan (simetri) |
| 1653 | Myanmar | Bosnia dan Hercegovina | Baris 1298 | Ditambahkan balasan (simetri) |
| 1654 | Myanmar | Brunei | Baris 1299 | Ditambahkan balasan (simetri) |
| 1655 | Namibia | Afganistan | Baris 498 | Ditambahkan balasan (simetri) |
| 1656 | Namibia | Afrika Selatan | Baris 499 | Ditambahkan balasan (simetri) |
| 1657 | Namibia | Aljazair | Baris 500 | Ditambahkan balasan (simetri) |
| 1658 | Namibia | Andorra | Baris 501 | Ditambahkan balasan (simetri) |
| 1659 | Namibia | Antigua dan Barbuda | Baris 502 | Ditambahkan balasan (simetri) |
| 1660 | Namibia | Arab Saudi | Baris 503 | Ditambahkan balasan (simetri) |
| 1661 | Namibia | Argentina | Baris 504 | Ditambahkan balasan (simetri) |
| 1662 | Namibia | Azerbaijan | Baris 505 | Ditambahkan balasan (simetri) |
| 1663 | Namibia | Bahama | Baris 506 | Ditambahkan balasan (simetri) |
| 1664 | Namibia | Bahrain | Baris 507 | Ditambahkan balasan (simetri) |
| 1665 | Namibia | Bangladesh | Baris 508 | Ditambahkan balasan (simetri) |
| 1666 | Namibia | Barbados | Baris 509 | Ditambahkan balasan (simetri) |
| 1667 | Namibia | Belarus | Baris 510 | Ditambahkan balasan (simetri) |
| 1668 | Namibia | Belgia | Baris 511 | Ditambahkan balasan (simetri) |
| 1669 | Namibia | Benin | Baris 512 | Ditambahkan balasan (simetri) |
| 1670 | Namibia | Bhutan | Baris 513 | Ditambahkan balasan (simetri) |
| 1671 | Namibia | Bolivia | Baris 517 | Ditambahkan balasan (simetri) |
| 1672 | Namibia | Bosnia dan Hercegovina | Baris 518 | Ditambahkan balasan (simetri) |
| 1673 | Namibia | Brazil | Baris 519 | Ditambahkan balasan (simetri) |
| 1674 | Namibia | Brunei | Baris 520 | Ditambahkan balasan (simetri) |
| 1675 | Nauru | Afganistan | Baris 2787 | Ditambahkan balasan (simetri) |
| 1676 | Nauru | Albania | Baris 2788 | Ditambahkan balasan (simetri) |
| 1677 | Nauru | Andorra | Baris 2789 | Ditambahkan balasan (simetri) |
| 1678 | Nauru | Angola | Baris 2790 | Ditambahkan balasan (simetri) |
| 1679 | Nauru | Antigua dan Barbuda | Baris 2791 | Ditambahkan balasan (simetri) |
| 1680 | Nauru | Austria | Baris 2792 | Ditambahkan balasan (simetri) |
| 1681 | Nauru | Azerbaijan | Baris 2793 | Ditambahkan balasan (simetri) |
| 1682 | Nauru | Bahrain | Baris 2794 | Ditambahkan balasan (simetri) |
| 1683 | Nauru | Barbados | Baris 2795 | Ditambahkan balasan (simetri) |
| 1684 | Nauru | Belgia | Baris 2796 | Ditambahkan balasan (simetri) |
| 1685 | Nauru | Bhutan | Baris 2797 | Ditambahkan balasan (simetri) |
| 1686 | Nauru | Bosnia dan Hercegovina | Baris 2798 | Ditambahkan balasan (simetri) |
| 1687 | Nauru | Botswana | Baris 2799 | Ditambahkan balasan (simetri) |
| 1688 | Nauru | Brunei | Baris 2800 | Ditambahkan balasan (simetri) |
| 1689 | Nepal | Afganistan | Baris 1300 | Ditambahkan balasan (simetri) |
| 1690 | Nepal | Albania | Baris 1301 | Ditambahkan balasan (simetri) |
| 1691 | Nepal | Angola | Baris 1302 | Ditambahkan balasan (simetri) |
| 1692 | Nepal | Antigua dan Barbuda | Baris 1303 | Ditambahkan balasan (simetri) |
| 1693 | Nepal | Arab Saudi | Baris 1304 | Ditambahkan balasan (simetri) |
| 1694 | Nepal | Bahama | Baris 1305 | Ditambahkan balasan (simetri) |
| 1695 | Nepal | Bangladesh | Baris 1306 | Ditambahkan balasan (simetri) |
| 1696 | Nepal | Barbados | Baris 1307 | Ditambahkan balasan (simetri) |
| 1697 | Nepal | Belarus | Baris 1308 | Ditambahkan balasan (simetri) |
| 1698 | Nepal | Belgia | Baris 1309 | Ditambahkan balasan (simetri) |
| 1699 | Nepal | Belize | Baris 1310 | Ditambahkan balasan (simetri) |
| 1700 | Nepal | Benin | Baris 1311 | Ditambahkan balasan (simetri) |
| 1701 | Nepal | Bhutan | Baris 1312 | Ditambahkan balasan (simetri) |
| 1702 | Nepal | Bosnia dan Hercegovina | Baris 1313 | Ditambahkan balasan (simetri) |
| 1703 | Niger | Afganistan | Baris 521 | Ditambahkan balasan (simetri) |
| 1704 | Niger | Afrika Selatan | Baris 522 | Ditambahkan balasan (simetri) |
| 1705 | Niger | Albania | Baris 523 | Ditambahkan balasan (simetri) |
| 1706 | Niger | Amerika Serikat | Baris 524 | Ditambahkan balasan (simetri) |
| 1707 | Niger | Angola | Baris 525 | Ditambahkan balasan (simetri) |
| 1708 | Niger | Australia | Baris 526 | Ditambahkan balasan (simetri) |
| 1709 | Niger | Austria | Baris 527 | Ditambahkan balasan (simetri) |
| 1710 | Niger | Belanda | Baris 528 | Ditambahkan balasan (simetri) |
| 1711 | Niger | Belarus | Baris 529 | Ditambahkan balasan (simetri) |
| 1712 | Niger | Belize | Baris 530 | Ditambahkan balasan (simetri) |
| 1713 | Niger | Benin | Baris 531 | Ditambahkan balasan (simetri) |
| 1714 | Niger | Bermuda | Baris 532 | Ditambahkan balasan (simetri) |
| 1715 | Niger | Bhutan | Baris 533 | Ditambahkan balasan (simetri) |
| 1716 | Niger | Bosnia dan Hercegovina | Baris 534 | Ditambahkan balasan (simetri) |
| 1717 | Nigeria | Afganistan | Baris 535 | Ditambahkan balasan (simetri) |
| 1718 | Nigeria | Afrika Selatan | Baris 536 | Ditambahkan balasan (simetri) |
| 1719 | Nigeria | Angola | Baris 537 | Ditambahkan balasan (simetri) |
| 1720 | Nigeria | Antigua dan Barbuda | Baris 538 | Ditambahkan balasan (simetri) |
| 1721 | Nigeria | Arab Saudi | Baris 539 | Ditambahkan balasan (simetri) |
| 1722 | Nigeria | Australia | Baris 540 | Ditambahkan balasan (simetri) |
| 1723 | Nigeria | Austria | Baris 541 | Ditambahkan balasan (simetri) |
| 1724 | Nigeria | Azerbaijan | Baris 542 | Ditambahkan balasan (simetri) |
| 1725 | Nigeria | Bahama | Baris 543 | Ditambahkan balasan (simetri) |
| 1726 | Nigeria | Bangladesh | Baris 544 | Ditambahkan balasan (simetri) |
| 1727 | Nigeria | Barbados | Baris 545 | Ditambahkan balasan (simetri) |
| 1728 | Nigeria | Belanda | Baris 546 | Ditambahkan balasan (simetri) |
| 1729 | Nigeria | Belarus | Baris 547 | Ditambahkan balasan (simetri) |
| 1730 | Nigeria | Belgia | Baris 548 | Ditambahkan balasan (simetri) |
| 1731 | Nigeria | Bolivia | Baris 549 | Ditambahkan balasan (simetri) |
| 1732 | Nigeria | Bosnia dan Hercegovina | Baris 550 | Ditambahkan balasan (simetri) |
| 1733 | Nikaragua | Afrika Selatan | Baris 2570 | Ditambahkan balasan (simetri) |
| 1734 | Nikaragua | Aljazair | Baris 2571 | Ditambahkan balasan (simetri) |
| 1735 | Nikaragua | Angola | Baris 2572 | Ditambahkan balasan (simetri) |
| 1736 | Nikaragua | Bangladesh | Baris 2573 | Ditambahkan balasan (simetri) |
| 1737 | Nikaragua | Belanda | Baris 2574 | Ditambahkan balasan (simetri) |
| 1738 | Nikaragua | Belgia | Baris 2575 | Ditambahkan balasan (simetri) |
| 1739 | Nikaragua | Bermuda | Baris 2576 | Ditambahkan balasan (simetri) |
| 1740 | Nikaragua | Bolivia | Baris 2577 | Ditambahkan balasan (simetri) |
| 1741 | Nikaragua | Bosnia dan Hercegovina | Baris 2578 | Ditambahkan balasan (simetri) |
| 1742 | Nikaragua | Brunei | Baris 2579 | Ditambahkan balasan (simetri) |
| 1743 | Norwegia | Afrika Selatan | Baris 2029 | Ditambahkan balasan (simetri) |
| 1744 | Norwegia | Albania | Baris 2030 | Ditambahkan balasan (simetri) |
| 1745 | Norwegia | Andorra | Baris 2031 | Ditambahkan balasan (simetri) |
| 1746 | Norwegia | Angola | Baris 2032 | Ditambahkan balasan (simetri) |
| 1747 | Norwegia | Arab Saudi | Baris 2033 | Ditambahkan balasan (simetri) |
| 1748 | Norwegia | Armenia | Baris 2034 | Ditambahkan balasan (simetri) |
| 1749 | Norwegia | Australia | Baris 2035 | Ditambahkan balasan (simetri) |
| 1750 | Norwegia | Azerbaijan | Baris 2036 | Ditambahkan balasan (simetri) |
| 1751 | Norwegia | Bangladesh | Baris 2037 | Ditambahkan balasan (simetri) |
| 1752 | Norwegia | Barbados | Baris 2038 | Ditambahkan balasan (simetri) |
| 1753 | Norwegia | Belanda | Baris 2039 | Ditambahkan balasan (simetri) |
| 1754 | Norwegia | Bolivia | Baris 2040 | Ditambahkan balasan (simetri) |
| 1755 | Norwegia | Bosnia dan Hercegovina | Baris 2041 | Ditambahkan balasan (simetri) |
| 1756 | Norwegia | Brazil | Baris 2042 | Ditambahkan balasan (simetri) |
| 1757 | Norwegia | Brunei | Baris 2043 | Ditambahkan balasan (simetri) |
| 1758 | Oman | Afganistan | Baris 1314 | Ditambahkan balasan (simetri) |
| 1759 | Oman | Albania | Baris 1315 | Ditambahkan balasan (simetri) |
| 1760 | Oman | Amerika Serikat | Baris 1316 | Ditambahkan balasan (simetri) |
| 1761 | Oman | Angola | Baris 1317 | Ditambahkan balasan (simetri) |
| 1762 | Oman | Australia | Baris 1318 | Ditambahkan balasan (simetri) |
| 1763 | Oman | Azerbaijan | Baris 1319 | Ditambahkan balasan (simetri) |
| 1764 | Oman | Barbados | Baris 1320 | Ditambahkan balasan (simetri) |
| 1765 | Oman | Belanda | Baris 1321 | Ditambahkan balasan (simetri) |
| 1766 | Oman | Bermuda | Baris 1322 | Ditambahkan balasan (simetri) |
| 1767 | Oman | Bosnia dan Hercegovina | Baris 1323 | Ditambahkan balasan (simetri) |
| 1768 | Oman | Botswana | Baris 1324 | Ditambahkan balasan (simetri) |
| 1769 | Pakistan | Afganistan | Baris 1325 | Ditambahkan balasan (simetri) |
| 1770 | Pakistan | Aljazair | Baris 1326 | Ditambahkan balasan (simetri) |
| 1771 | Pakistan | Andorra | Baris 1327 | Ditambahkan balasan (simetri) |
| 1772 | Pakistan | Angola | Baris 1328 | Ditambahkan balasan (simetri) |
| 1773 | Pakistan | Arab Saudi | Baris 1329 | Ditambahkan balasan (simetri) |
| 1774 | Pakistan | Argentina | Baris 1330 | Ditambahkan balasan (simetri) |
| 1775 | Pakistan | Armenia | Baris 1331 | Ditambahkan balasan (simetri) |
| 1776 | Pakistan | Azerbaijan | Baris 1332 | Ditambahkan balasan (simetri) |
| 1777 | Pakistan | Bahama | Baris 1333 | Ditambahkan balasan (simetri) |
| 1778 | Pakistan | Bahrain | Baris 1334 | Ditambahkan balasan (simetri) |
| 1779 | Pakistan | Bangladesh | Baris 1335 | Ditambahkan balasan (simetri) |
| 1780 | Pakistan | Barbados | Baris 1336 | Ditambahkan balasan (simetri) |
| 1781 | Pakistan | Belanda | Baris 1337 | Ditambahkan balasan (simetri) |
| 1782 | Pakistan | Belarus | Baris 1338 | Ditambahkan balasan (simetri) |
| 1783 | Pakistan | Belize | Baris 1339 | Ditambahkan balasan (simetri) |
| 1784 | Pakistan | Bermuda | Baris 1340 | Ditambahkan balasan (simetri) |
| 1785 | Pakistan | Bolivia | Baris 1341 | Ditambahkan balasan (simetri) |
| 1786 | Pakistan | Bosnia dan Hercegovina | Baris 1342 | Ditambahkan balasan (simetri) |
| 1787 | Pakistan | Brazil | Baris 1343 | Ditambahkan balasan (simetri) |
| 1788 | Pakistan | Brunei | Baris 1344 | Ditambahkan balasan (simetri) |
| 1789 | Palau | Aljazair | Baris 2801 | Ditambahkan balasan (simetri) |
| 1790 | Palau | Andorra | Baris 2802 | Ditambahkan balasan (simetri) |
| 1791 | Palau | Angola | Baris 2803 | Ditambahkan balasan (simetri) |
| 1792 | Palau | Arab Saudi | Baris 2804 | Ditambahkan balasan (simetri) |
| 1793 | Palau | Armenia | Baris 2805 | Ditambahkan balasan (simetri) |
| 1794 | Palau | Bahrain | Baris 2806 | Ditambahkan balasan (simetri) |
| 1795 | Palau | Bangladesh | Baris 2807 | Ditambahkan balasan (simetri) |
| 1796 | Palau | Barbados | Baris 2808 | Ditambahkan balasan (simetri) |
| 1797 | Palau | Belanda | Baris 2809 | Ditambahkan balasan (simetri) |
| 1798 | Palau | Belarus | Baris 2810 | Ditambahkan balasan (simetri) |
| 1799 | Palau | Belgia | Baris 2811 | Ditambahkan balasan (simetri) |
| 1800 | Palau | Benin | Baris 2812 | Ditambahkan balasan (simetri) |
| 1801 | Palau | Bermuda | Baris 2813 | Ditambahkan balasan (simetri) |
| 1802 | Palau | Bhutan | Baris 2814 | Ditambahkan balasan (simetri) |
| 1803 | Palau | Bolivia | Baris 2815 | Ditambahkan balasan (simetri) |
| 1804 | Palau | Botswana | Baris 2816 | Ditambahkan balasan (simetri) |
| 1805 | Palau | Brazil | Baris 2817 | Ditambahkan balasan (simetri) |
| 1806 | Palau | Brunei | Baris 2818 | Ditambahkan balasan (simetri) |
| 1807 | Palestina | Afganistan | Baris 1345 | Ditambahkan balasan (simetri) |
| 1808 | Palestina | Afrika Selatan | Baris 1346 | Ditambahkan balasan (simetri) |
| 1809 | Palestina | Albania | Baris 1347 | Ditambahkan balasan (simetri) |
| 1810 | Palestina | Aljazair | Baris 1348 | Ditambahkan balasan (simetri) |
| 1811 | Palestina | Angola | Baris 1349 | Ditambahkan balasan (simetri) |
| 1812 | Palestina | Arab Saudi | Baris 1350 | Ditambahkan balasan (simetri) |
| 1813 | Palestina | Armenia | Baris 1351 | Ditambahkan balasan (simetri) |
| 1814 | Palestina | Azerbaijan | Baris 1352 | Ditambahkan balasan (simetri) |
| 1815 | Palestina | Bahrain | Baris 1353 | Ditambahkan balasan (simetri) |
| 1816 | Palestina | Barbados | Baris 1354 | Ditambahkan balasan (simetri) |
| 1817 | Palestina | Belanda | Baris 1355 | Ditambahkan balasan (simetri) |
| 1818 | Palestina | Belgia | Baris 1356 | Ditambahkan balasan (simetri) |
| 1819 | Palestina | Belize | Baris 1357 | Ditambahkan balasan (simetri) |
| 1820 | Palestina | Bhutan | Baris 1358 | Ditambahkan balasan (simetri) |
| 1821 | Palestina | Bosnia dan Hercegovina | Baris 1359 | Ditambahkan balasan (simetri) |
| 1822 | Palestina | Brazil | Baris 1360 | Ditambahkan balasan (simetri) |
| 1823 | Palestina | Brunei | Baris 1361 | Ditambahkan balasan (simetri) |
| 1824 | Panama | Afganistan | Baris 2580 | Ditambahkan balasan (simetri) |
| 1825 | Panama | Albania | Baris 2581 | Ditambahkan balasan (simetri) |
| 1826 | Panama | Amerika Serikat | Baris 2582 | Ditambahkan balasan (simetri) |
| 1827 | Panama | Angola | Baris 2583 | Ditambahkan balasan (simetri) |
| 1828 | Panama | Antigua dan Barbuda | Baris 2584 | Ditambahkan balasan (simetri) |
| 1829 | Panama | Arab Saudi | Baris 2585 | Ditambahkan balasan (simetri) |
| 1830 | Panama | Argentina | Baris 2586 | Ditambahkan balasan (simetri) |
| 1831 | Panama | Armenia | Baris 2587 | Ditambahkan balasan (simetri) |
| 1832 | Panama | Austria | Baris 2588 | Ditambahkan balasan (simetri) |
| 1833 | Panama | Bangladesh | Baris 2589 | Ditambahkan balasan (simetri) |
| 1834 | Panama | Barbados | Baris 2590 | Ditambahkan balasan (simetri) |
| 1835 | Panama | Belize | Baris 2591 | Ditambahkan balasan (simetri) |
| 1836 | Panama | Bhutan | Baris 2592 | Ditambahkan balasan (simetri) |
| 1837 | Panama | Botswana | Baris 2593 | Ditambahkan balasan (simetri) |
| 1838 | Panama | Brazil | Baris 2594 | Ditambahkan balasan (simetri) |
| 1839 | Pantai gading | Afrika Selatan | Baris 551 | Ditambahkan balasan (simetri) |
| 1840 | Pantai gading | Aljazair | Baris 552 | Ditambahkan balasan (simetri) |
| 1841 | Pantai gading | Andorra | Baris 553 | Ditambahkan balasan (simetri) |
| 1842 | Pantai gading | Angola | Baris 554 | Ditambahkan balasan (simetri) |
| 1843 | Pantai gading | Arab Saudi | Baris 555 | Ditambahkan balasan (simetri) |
| 1844 | Pantai gading | Argentina | Baris 556 | Ditambahkan balasan (simetri) |
| 1845 | Pantai gading | Bahrain | Baris 557 | Ditambahkan balasan (simetri) |
| 1846 | Pantai gading | Bangladesh | Baris 558 | Ditambahkan balasan (simetri) |
| 1847 | Pantai gading | Belgia | Baris 559 | Ditambahkan balasan (simetri) |
| 1848 | Pantai gading | Belize | Baris 560 | Ditambahkan balasan (simetri) |
| 1849 | Pantai gading | Benin | Baris 561 | Ditambahkan balasan (simetri) |
| 1850 | Pantai gading | Bhutan | Baris 562 | Ditambahkan balasan (simetri) |
| 1851 | Pantai gading | Bolivia | Baris 563 | Ditambahkan balasan (simetri) |
| 1852 | Pantai gading | Botswana | Baris 564 | Ditambahkan balasan (simetri) |
| 1853 | Pantai gading | Brunei | Baris 565 | Ditambahkan balasan (simetri) |
| 1854 | Papua nugini | Afganistan | Baris 2819 | Ditambahkan balasan (simetri) |
| 1855 | Papua nugini | Afrika Selatan | Baris 2820 | Ditambahkan balasan (simetri) |
| 1856 | Papua nugini | Albania | Baris 2821 | Ditambahkan balasan (simetri) |
| 1857 | Papua nugini | Aljazair | Baris 2822 | Ditambahkan balasan (simetri) |
| 1858 | Papua nugini | Amerika Serikat | Baris 2823 | Ditambahkan balasan (simetri) |
| 1859 | Papua nugini | Andorra | Baris 2824 | Ditambahkan balasan (simetri) |
| 1860 | Papua nugini | Angola | Baris 2825 | Ditambahkan balasan (simetri) |
| 1861 | Papua nugini | Antigua dan Barbuda | Baris 2826 | Ditambahkan balasan (simetri) |
| 1862 | Papua nugini | Arab Saudi | Baris 2827 | Ditambahkan balasan (simetri) |
| 1863 | Papua nugini | Argentina | Baris 2828 | Ditambahkan balasan (simetri) |
| 1864 | Papua nugini | Bahama | Baris 2829 | Ditambahkan balasan (simetri) |
| 1865 | Papua nugini | Bahrain | Baris 2830 | Ditambahkan balasan (simetri) |
| 1866 | Papua nugini | Belarus | Baris 2831 | Ditambahkan balasan (simetri) |
| 1867 | Papua nugini | Belgia | Baris 2832 | Ditambahkan balasan (simetri) |
| 1868 | Papua nugini | Belize | Baris 2833 | Ditambahkan balasan (simetri) |
| 1869 | Papua nugini | Benin | Baris 2834 | Ditambahkan balasan (simetri) |
| 1870 | Papua nugini | Bermuda | Baris 2835 | Ditambahkan balasan (simetri) |
| 1871 | Papua nugini | Bolivia | Baris 2836 | Ditambahkan balasan (simetri) |
| 1872 | Papua nugini | Brazil | Baris 2837 | Ditambahkan balasan (simetri) |
| 1873 | Papua nugini | Brunei | Baris 2838 | Ditambahkan balasan (simetri) |
| 1874 | Paraguay | Angola | Baris 3064 | Ditambahkan balasan (simetri) |
| 1875 | Paraguay | Antigua dan Barbuda | Baris 3065 | Ditambahkan balasan (simetri) |
| 1876 | Paraguay | Argentina | Baris 3066 | Ditambahkan balasan (simetri) |
| 1877 | Paraguay | Armenia | Baris 3067 | Ditambahkan balasan (simetri) |
| 1878 | Paraguay | Australia | Baris 3068 | Ditambahkan balasan (simetri) |
| 1879 | Paraguay | Bahama | Baris 3069 | Ditambahkan balasan (simetri) |
| 1880 | Paraguay | Bangladesh | Baris 3070 | Ditambahkan balasan (simetri) |
| 1881 | Paraguay | Belize | Baris 3071 | Ditambahkan balasan (simetri) |
| 1882 | Paraguay | Benin | Baris 3072 | Ditambahkan balasan (simetri) |
| 1883 | Paraguay | Bermuda | Baris 3073 | Ditambahkan balasan (simetri) |
| 1884 | Paraguay | Bolivia | Baris 3074 | Ditambahkan balasan (simetri) |
| 1885 | Peru | Afrika Selatan | Baris 3075 | Ditambahkan balasan (simetri) |
| 1886 | Peru | Aljazair | Baris 3076 | Ditambahkan balasan (simetri) |
| 1887 | Peru | Amerika Serikat | Baris 3077 | Ditambahkan balasan (simetri) |
| 1888 | Peru | Angola | Baris 3078 | Ditambahkan balasan (simetri) |
| 1889 | Peru | Antigua dan Barbuda | Baris 3079 | Ditambahkan balasan (simetri) |
| 1890 | Peru | Arab Saudi | Baris 3080 | Ditambahkan balasan (simetri) |
| 1891 | Peru | Armenia | Baris 3081 | Ditambahkan balasan (simetri) |
| 1892 | Peru | Austria | Baris 3082 | Ditambahkan balasan (simetri) |
| 1893 | Peru | Bahrain | Baris 3083 | Ditambahkan balasan (simetri) |
| 1894 | Peru | Barbados | Baris 3084 | Ditambahkan balasan (simetri) |
| 1895 | Peru | Belanda | Baris 3085 | Ditambahkan balasan (simetri) |
| 1896 | Peru | Belize | Baris 3086 | Ditambahkan balasan (simetri) |
| 1897 | Peru | Bolivia | Baris 3087 | Ditambahkan balasan (simetri) |
| 1898 | Polandia | Afrika Selatan | Baris 2044 | Ditambahkan balasan (simetri) |
| 1899 | Polandia | Andorra | Baris 2045 | Ditambahkan balasan (simetri) |
| 1900 | Polandia | Antigua dan Barbuda | Baris 2046 | Ditambahkan balasan (simetri) |
| 1901 | Polandia | Arab Saudi | Baris 2047 | Ditambahkan balasan (simetri) |
| 1902 | Polandia | Bahrain | Baris 2048 | Ditambahkan balasan (simetri) |
| 1903 | Polandia | Bangladesh | Baris 2049 | Ditambahkan balasan (simetri) |
| 1904 | Polandia | Belarus | Baris 2050 | Ditambahkan balasan (simetri) |
| 1905 | Polandia | Belize | Baris 2051 | Ditambahkan balasan (simetri) |
| 1906 | Polandia | Benin | Baris 2052 | Ditambahkan balasan (simetri) |
| 1907 | Polandia | Bermuda | Baris 2053 | Ditambahkan balasan (simetri) |
| 1908 | Polandia | Bhutan | Baris 2054 | Ditambahkan balasan (simetri) |
| 1909 | Polandia | Bosnia dan Hercegovina | Baris 2055 | Ditambahkan balasan (simetri) |
| 1910 | Polandia | Botswana | Baris 2056 | Ditambahkan balasan (simetri) |
| 1911 | Polandia | Brazil | Baris 2057 | Ditambahkan balasan (simetri) |
| 1912 | Polandia | Brunei | Baris 2058 | Ditambahkan balasan (simetri) |
| 1913 | Portugal | Albania | Baris 2059 | Ditambahkan balasan (simetri) |
| 1914 | Portugal | Amerika Serikat | Baris 2060 | Ditambahkan balasan (simetri) |
| 1915 | Portugal | Angola | Baris 2061 | Ditambahkan balasan (simetri) |
| 1916 | Portugal | Argentina | Baris 2062 | Ditambahkan balasan (simetri) |
| 1917 | Portugal | Australia | Baris 2063 | Ditambahkan balasan (simetri) |
| 1918 | Portugal | Austria | Baris 2064 | Ditambahkan balasan (simetri) |
| 1919 | Portugal | Bahrain | Baris 2065 | Ditambahkan balasan (simetri) |
| 1920 | Portugal | Bangladesh | Baris 2066 | Ditambahkan balasan (simetri) |
| 1921 | Portugal | Barbados | Baris 2067 | Ditambahkan balasan (simetri) |
| 1922 | Portugal | Belgia | Baris 2068 | Ditambahkan balasan (simetri) |
| 1923 | Portugal | Belize | Baris 2069 | Ditambahkan balasan (simetri) |
| 1924 | Portugal | Bolivia | Baris 2070 | Ditambahkan balasan (simetri) |
| 1925 | Portugal | Bosnia dan Hercegovina | Baris 2071 | Ditambahkan balasan (simetri) |
| 1926 | Portugal | Brunei | Baris 2072 | Ditambahkan balasan (simetri) |
| 1927 | Prancis | Amerika Serikat | Baris 2073 | Ditambahkan balasan (simetri) |
| 1928 | Prancis | Arab Saudi | Baris 2074 | Ditambahkan balasan (simetri) |
| 1929 | Prancis | Armenia | Baris 2075 | Ditambahkan balasan (simetri) |
| 1930 | Prancis | Azerbaijan | Baris 2076 | Ditambahkan balasan (simetri) |
| 1931 | Prancis | Belarus | Baris 2077 | Ditambahkan balasan (simetri) |
| 1932 | Prancis | Belize | Baris 2078 | Ditambahkan balasan (simetri) |
| 1933 | Prancis | Bermuda | Baris 2079 | Ditambahkan balasan (simetri) |
| 1934 | Prancis | Bosnia dan Hercegovina | Baris 2080 | Ditambahkan balasan (simetri) |
| 1935 | Prancis | Brazil | Baris 2081 | Ditambahkan balasan (simetri) |
| 1936 | Prancis | Brunei | Baris 2082 | Ditambahkan balasan (simetri) |
| 1937 | Puerto rico | Afganistan | Baris 2595 | Ditambahkan balasan (simetri) |
| 1938 | Puerto rico | Afrika Selatan | Baris 2596 | Ditambahkan balasan (simetri) |
| 1939 | Puerto rico | Albania | Baris 2597 | Ditambahkan balasan (simetri) |
| 1940 | Puerto rico | Aljazair | Baris 2598 | Ditambahkan balasan (simetri) |
| 1941 | Puerto rico | Angola | Baris 2599 | Ditambahkan balasan (simetri) |
| 1942 | Puerto rico | Antigua dan Barbuda | Baris 2600 | Ditambahkan balasan (simetri) |
| 1943 | Puerto rico | Australia | Baris 2601 | Ditambahkan balasan (simetri) |
| 1944 | Puerto rico | Azerbaijan | Baris 2602 | Ditambahkan balasan (simetri) |
| 1945 | Puerto rico | Bahama | Baris 2603 | Ditambahkan balasan (simetri) |
| 1946 | Puerto rico | Bahrain | Baris 2604 | Ditambahkan balasan (simetri) |
| 1947 | Puerto rico | Bangladesh | Baris 2605 | Ditambahkan balasan (simetri) |
| 1948 | Puerto rico | Barbados | Baris 2606 | Ditambahkan balasan (simetri) |
| 1949 | Puerto rico | Belarus | Baris 2607 | Ditambahkan balasan (simetri) |
| 1950 | Puerto rico | Belize | Baris 2608 | Ditambahkan balasan (simetri) |
| 1951 | Puerto rico | Bhutan | Baris 2609 | Ditambahkan balasan (simetri) |
| 1952 | Puerto rico | Bosnia dan Hercegovina | Baris 2610 | Ditambahkan balasan (simetri) |
| 1953 | Puerto rico | Brazil | Baris 2611 | Ditambahkan balasan (simetri) |
| 1954 | Puerto rico | Brunei | Baris 2612 | Ditambahkan balasan (simetri) |
| 1955 | Qatar | Afrika Selatan | Baris 1362 | Ditambahkan balasan (simetri) |
| 1956 | Qatar | Albania | Baris 1363 | Ditambahkan balasan (simetri) |
| 1957 | Qatar | Aljazair | Baris 1364 | Ditambahkan balasan (simetri) |
| 1958 | Qatar | Amerika Serikat | Baris 1365 | Ditambahkan balasan (simetri) |
| 1959 | Qatar | Andorra | Baris 1366 | Ditambahkan balasan (simetri) |
| 1960 | Qatar | Arab Saudi | Baris 1367 | Ditambahkan balasan (simetri) |
| 1961 | Qatar | Argentina | Baris 1368 | Ditambahkan balasan (simetri) |
| 1962 | Qatar | Armenia | Baris 1369 | Ditambahkan balasan (simetri) |
| 1963 | Qatar | Australia | Baris 1370 | Ditambahkan balasan (simetri) |
| 1964 | Qatar | Azerbaijan | Baris 1371 | Ditambahkan balasan (simetri) |
| 1965 | Qatar | Bahrain | Baris 1372 | Ditambahkan balasan (simetri) |
| 1966 | Qatar | Bangladesh | Baris 1373 | Ditambahkan balasan (simetri) |
| 1967 | Qatar | Belanda | Baris 1374 | Ditambahkan balasan (simetri) |
| 1968 | Qatar | Belize | Baris 1375 | Ditambahkan balasan (simetri) |
| 1969 | Qatar | Benin | Baris 1376 | Ditambahkan balasan (simetri) |
| 1970 | Qatar | Bermuda | Baris 1377 | Ditambahkan balasan (simetri) |
| 1971 | Qatar | Bhutan | Baris 1378 | Ditambahkan balasan (simetri) |
| 1972 | Qatar | Bolivia | Baris 1379 | Ditambahkan balasan (simetri) |
| 1973 | Qatar | Brunei | Baris 1380 | Ditambahkan balasan (simetri) |
| 1974 | Republik Afrika Tengah | Afganistan | Baris 566 | Ditambahkan balasan (simetri) |
| 1975 | Republik Afrika Tengah | Afrika Selatan | Baris 567 | Ditambahkan balasan (simetri) |
| 1976 | Republik Afrika Tengah | Albania | Baris 568 | Ditambahkan balasan (simetri) |
| 1977 | Republik Afrika Tengah | Andorra | Baris 569 | Ditambahkan balasan (simetri) |
| 1978 | Republik Afrika Tengah | Angola | Baris 570 | Ditambahkan balasan (simetri) |
| 1979 | Republik Afrika Tengah | Arab Saudi | Baris 571 | Ditambahkan balasan (simetri) |
| 1980 | Republik Afrika Tengah | Austria | Baris 572 | Ditambahkan balasan (simetri) |
| 1981 | Republik Afrika Tengah | Azerbaijan | Baris 573 | Ditambahkan balasan (simetri) |
| 1982 | Republik Afrika Tengah | Bangladesh | Baris 574 | Ditambahkan balasan (simetri) |
| 1983 | Republik Afrika Tengah | Bermuda | Baris 575 | Ditambahkan balasan (simetri) |
| 1984 | Republik Afrika Tengah | Botswana | Baris 576 | Ditambahkan balasan (simetri) |
| 1985 | Republik Afrika Tengah | Brazil | Baris 577 | Ditambahkan balasan (simetri) |
| 1986 | Republik demokratik kongo | Afganistan | Baris 578 | Ditambahkan balasan (simetri) |
| 1987 | Republik demokratik kongo | Aljazair | Baris 579 | Ditambahkan balasan (simetri) |
| 1988 | Republik demokratik kongo | Antigua dan Barbuda | Baris 580 | Ditambahkan balasan (simetri) |
| 1989 | Republik demokratik kongo | Armenia | Baris 581 | Ditambahkan balasan (simetri) |
| 1990 | Republik demokratik kongo | Austria | Baris 582 | Ditambahkan balasan (simetri) |
| 1991 | Republik demokratik kongo | Bahama | Baris 583 | Ditambahkan balasan (simetri) |
| 1992 | Republik demokratik kongo | Bangladesh | Baris 584 | Ditambahkan balasan (simetri) |
| 1993 | Republik demokratik kongo | Belanda | Baris 585 | Ditambahkan balasan (simetri) |
| 1994 | Republik demokratik kongo | Belarus | Baris 586 | Ditambahkan balasan (simetri) |
| 1995 | Republik demokratik kongo | Benin | Baris 587 | Ditambahkan balasan (simetri) |
| 1996 | Republik demokratik kongo | Bolivia | Baris 588 | Ditambahkan balasan (simetri) |
| 1997 | Republik demokratik kongo | Botswana | Baris 589 | Ditambahkan balasan (simetri) |
| 1998 | Republik demokratik kongo | Brazil | Baris 590 | Ditambahkan balasan (simetri) |
| 1999 | Republik demokratik kongo | Brunei | Baris 591 | Ditambahkan balasan (simetri) |
| 2000 | Republik dominika | Afganistan | Baris 2613 | Ditambahkan balasan (simetri) |
| 2001 | Republik dominika | Afrika Selatan | Baris 2614 | Ditambahkan balasan (simetri) |
| 2002 | Republik dominika | Albania | Baris 2615 | Ditambahkan balasan (simetri) |
| 2003 | Republik dominika | Andorra | Baris 2616 | Ditambahkan balasan (simetri) |
| 2004 | Republik dominika | Angola | Baris 2617 | Ditambahkan balasan (simetri) |
| 2005 | Republik dominika | Argentina | Baris 2618 | Ditambahkan balasan (simetri) |
| 2006 | Republik dominika | Armenia | Baris 2619 | Ditambahkan balasan (simetri) |
| 2007 | Republik dominika | Austria | Baris 2620 | Ditambahkan balasan (simetri) |
| 2008 | Republik dominika | Azerbaijan | Baris 2621 | Ditambahkan balasan (simetri) |
| 2009 | Republik dominika | Bangladesh | Baris 2622 | Ditambahkan balasan (simetri) |
| 2010 | Republik dominika | Belanda | Baris 2623 | Ditambahkan balasan (simetri) |
| 2011 | Republik dominika | Belarus | Baris 2624 | Ditambahkan balasan (simetri) |
| 2012 | Republik dominika | Benin | Baris 2625 | Ditambahkan balasan (simetri) |
| 2013 | Republik dominika | Bermuda | Baris 2626 | Ditambahkan balasan (simetri) |
| 2014 | Republik dominika | Bhutan | Baris 2627 | Ditambahkan balasan (simetri) |
| 2015 | Republik dominika | Bosnia dan Hercegovina | Baris 2628 | Ditambahkan balasan (simetri) |
| 2016 | Republik dominika | Botswana | Baris 2629 | Ditambahkan balasan (simetri) |
| 2017 | Republik dominika | Brunei | Baris 2630 | Ditambahkan balasan (simetri) |
| 2018 | Republik rumania | Afrika Selatan | Baris 2083 | Ditambahkan balasan (simetri) |
| 2019 | Republik rumania | Albania | Baris 2084 | Ditambahkan balasan (simetri) |
| 2020 | Republik rumania | Aljazair | Baris 2085 | Ditambahkan balasan (simetri) |
| 2021 | Republik rumania | Amerika Serikat | Baris 2086 | Ditambahkan balasan (simetri) |
| 2022 | Republik rumania | Angola | Baris 2087 | Ditambahkan balasan (simetri) |
| 2023 | Republik rumania | Antigua dan Barbuda | Baris 2088 | Ditambahkan balasan (simetri) |
| 2024 | Republik rumania | Argentina | Baris 2089 | Ditambahkan balasan (simetri) |
| 2025 | Republik rumania | Australia | Baris 2090 | Ditambahkan balasan (simetri) |
| 2026 | Republik rumania | Austria | Baris 2091 | Ditambahkan balasan (simetri) |
| 2027 | Republik rumania | Azerbaijan | Baris 2092 | Ditambahkan balasan (simetri) |
| 2028 | Republik rumania | Bangladesh | Baris 2093 | Ditambahkan balasan (simetri) |
| 2029 | Republik rumania | Belanda | Baris 2094 | Ditambahkan balasan (simetri) |
| 2030 | Republik rumania | Belarus | Baris 2095 | Ditambahkan balasan (simetri) |
| 2031 | Republik rumania | Belgia | Baris 2096 | Ditambahkan balasan (simetri) |
| 2032 | Republik rumania | Bhutan | Baris 2097 | Ditambahkan balasan (simetri) |
| 2033 | Republik rumania | Botswana | Baris 2098 | Ditambahkan balasan (simetri) |
| 2034 | Republik rumania | Brunei | Baris 2099 | Ditambahkan balasan (simetri) |
| 2035 | Republik serbia | Afganistan | Baris 2100 | Ditambahkan balasan (simetri) |
| 2036 | Republik serbia | Aljazair | Baris 2101 | Ditambahkan balasan (simetri) |
| 2037 | Republik serbia | Amerika Serikat | Baris 2102 | Ditambahkan balasan (simetri) |
| 2038 | Republik serbia | Antigua dan Barbuda | Baris 2103 | Ditambahkan balasan (simetri) |
| 2039 | Republik serbia | Arab Saudi | Baris 2104 | Ditambahkan balasan (simetri) |
| 2040 | Republik serbia | Bahama | Baris 2105 | Ditambahkan balasan (simetri) |
| 2041 | Republik serbia | Bahrain | Baris 2106 | Ditambahkan balasan (simetri) |
| 2042 | Republik serbia | Belarus | Baris 2107 | Ditambahkan balasan (simetri) |
| 2043 | Republik serbia | Belize | Baris 2108 | Ditambahkan balasan (simetri) |
| 2044 | Republik serbia | Bosnia dan Hercegovina | Baris 2109 | Ditambahkan balasan (simetri) |
| 2045 | Republik serbia | Brazil | Baris 2110 | Ditambahkan balasan (simetri) |
| 2046 | Republik sudan | Afganistan | Baris 592 | Ditambahkan balasan (simetri) |
| 2047 | Republik sudan | Albania | Baris 593 | Ditambahkan balasan (simetri) |
| 2048 | Republik sudan | Aljazair | Baris 594 | Ditambahkan balasan (simetri) |
| 2049 | Republik sudan | Amerika Serikat | Baris 595 | Ditambahkan balasan (simetri) |
| 2050 | Republik sudan | Angola | Baris 596 | Ditambahkan balasan (simetri) |
| 2051 | Republik sudan | Antigua dan Barbuda | Baris 597 | Ditambahkan balasan (simetri) |
| 2052 | Republik sudan | Arab Saudi | Baris 598 | Ditambahkan balasan (simetri) |
| 2053 | Republik sudan | Argentina | Baris 599 | Ditambahkan balasan (simetri) |
| 2054 | Republik sudan | Armenia | Baris 600 | Ditambahkan balasan (simetri) |
| 2055 | Republik sudan | Austria | Baris 601 | Ditambahkan balasan (simetri) |
| 2056 | Republik sudan | Bahrain | Baris 602 | Ditambahkan balasan (simetri) |
| 2057 | Republik sudan | Barbados | Baris 603 | Ditambahkan balasan (simetri) |
| 2058 | Republik sudan | Belanda | Baris 604 | Ditambahkan balasan (simetri) |
| 2059 | Republik sudan | Belize | Baris 605 | Ditambahkan balasan (simetri) |
| 2060 | Republik sudan | Benin | Baris 606 | Ditambahkan balasan (simetri) |
| 2061 | Republik sudan | Bolivia | Baris 607 | Ditambahkan balasan (simetri) |
| 2062 | Republik sudan | Brazil | Baris 608 | Ditambahkan balasan (simetri) |
| 2063 | Republik tanzania | Afganistan | Baris 609 | Ditambahkan balasan (simetri) |
| 2064 | Republik tanzania | Afrika Selatan | Baris 610 | Ditambahkan balasan (simetri) |
| 2065 | Republik tanzania | Albania | Baris 611 | Ditambahkan balasan (simetri) |
| 2066 | Republik tanzania | Amerika Serikat | Baris 612 | Ditambahkan balasan (simetri) |
| 2067 | Republik tanzania | Antigua dan Barbuda | Baris 613 | Ditambahkan balasan (simetri) |
| 2068 | Republik tanzania | Australia | Baris 614 | Ditambahkan balasan (simetri) |
| 2069 | Republik tanzania | Austria | Baris 615 | Ditambahkan balasan (simetri) |
| 2070 | Republik tanzania | Azerbaijan | Baris 616 | Ditambahkan balasan (simetri) |
| 2071 | Republik tanzania | Bangladesh | Baris 617 | Ditambahkan balasan (simetri) |
| 2072 | Republik tanzania | Belgia | Baris 618 | Ditambahkan balasan (simetri) |
| 2073 | Republik tanzania | Benin | Baris 619 | Ditambahkan balasan (simetri) |
| 2074 | Republik tanzania | Bermuda | Baris 620 | Ditambahkan balasan (simetri) |
| 2075 | Republik tanzania | Bolivia | Baris 621 | Ditambahkan balasan (simetri) |
| 2076 | Republik tanzania | Bosnia dan Hercegovina | Baris 622 | Ditambahkan balasan (simetri) |
| 2077 | Republik tanzania | Botswana | Baris 623 | Ditambahkan balasan (simetri) |
| 2078 | Republik timor leste | Albania | Baris 1381 | Ditambahkan balasan (simetri) |
| 2079 | Republik timor leste | Aljazair | Baris 1382 | Ditambahkan balasan (simetri) |
| 2080 | Republik timor leste | Amerika Serikat | Baris 1383 | Ditambahkan balasan (simetri) |
| 2081 | Republik timor leste | Antigua dan Barbuda | Baris 1384 | Ditambahkan balasan (simetri) |
| 2082 | Republik timor leste | Arab Saudi | Baris 1385 | Ditambahkan balasan (simetri) |
| 2083 | Republik timor leste | Argentina | Baris 1386 | Ditambahkan balasan (simetri) |
| 2084 | Republik timor leste | Australia | Baris 1387 | Ditambahkan balasan (simetri) |
| 2085 | Republik timor leste | Austria | Baris 1388 | Ditambahkan balasan (simetri) |
| 2086 | Republik timor leste | Bahrain | Baris 1389 | Ditambahkan balasan (simetri) |
| 2087 | Republik timor leste | Belgia | Baris 1390 | Ditambahkan balasan (simetri) |
| 2088 | Republik timor leste | Bhutan | Baris 1391 | Ditambahkan balasan (simetri) |
| 2089 | Republik timor leste | Bolivia | Baris 1392 | Ditambahkan balasan (simetri) |
| 2090 | Republik timor leste | Bosnia dan Hercegovina | Baris 1393 | Ditambahkan balasan (simetri) |
| 2091 | Republik timor leste | Botswana | Baris 1394 | Ditambahkan balasan (simetri) |
| 2092 | Republik timor leste | Brazil | Baris 1395 | Ditambahkan balasan (simetri) |
| 2093 | Republik uganda | Afrika Selatan | Baris 624 | Ditambahkan balasan (simetri) |
| 2094 | Republik uganda | Aljazair | Baris 625 | Ditambahkan balasan (simetri) |
| 2095 | Republik uganda | Amerika Serikat | Baris 626 | Ditambahkan balasan (simetri) |
| 2096 | Republik uganda | Antigua dan Barbuda | Baris 627 | Ditambahkan balasan (simetri) |
| 2097 | Republik uganda | Argentina | Baris 628 | Ditambahkan balasan (simetri) |
| 2098 | Republik uganda | Armenia | Baris 629 | Ditambahkan balasan (simetri) |
| 2099 | Republik uganda | Australia | Baris 630 | Ditambahkan balasan (simetri) |
| 2100 | Republik uganda | Azerbaijan | Baris 631 | Ditambahkan balasan (simetri) |
| 2101 | Republik uganda | Bahrain | Baris 632 | Ditambahkan balasan (simetri) |
| 2102 | Republik uganda | Barbados | Baris 633 | Ditambahkan balasan (simetri) |
| 2103 | Republik uganda | Belarus | Baris 634 | Ditambahkan balasan (simetri) |
| 2104 | Republik uganda | Belize | Baris 635 | Ditambahkan balasan (simetri) |
| 2105 | Republik uganda | Bermuda | Baris 636 | Ditambahkan balasan (simetri) |
| 2106 | Republik uganda | Bhutan | Baris 637 | Ditambahkan balasan (simetri) |
| 2107 | Republik uganda | Botswana | Baris 638 | Ditambahkan balasan (simetri) |
| 2108 | Republik uganda | Brazil | Baris 639 | Ditambahkan balasan (simetri) |
| 2109 | Republik uganda | Brunei | Baris 640 | Ditambahkan balasan (simetri) |
| 2110 | Republik zambia | Afrika Selatan | Baris 641 | Ditambahkan balasan (simetri) |
| 2111 | Republik zambia | Albania | Baris 642 | Ditambahkan balasan (simetri) |
| 2112 | Republik zambia | Aljazair | Baris 643 | Ditambahkan balasan (simetri) |
| 2113 | Republik zambia | Amerika Serikat | Baris 644 | Ditambahkan balasan (simetri) |
| 2114 | Republik zambia | Andorra | Baris 645 | Ditambahkan balasan (simetri) |
| 2115 | Republik zambia | Angola | Baris 646 | Ditambahkan balasan (simetri) |
| 2116 | Republik zambia | Antigua dan Barbuda | Baris 647 | Ditambahkan balasan (simetri) |
| 2117 | Republik zambia | Arab Saudi | Baris 648 | Ditambahkan balasan (simetri) |
| 2118 | Republik zambia | Armenia | Baris 649 | Ditambahkan balasan (simetri) |
| 2119 | Republik zambia | Australia | Baris 650 | Ditambahkan balasan (simetri) |
| 2120 | Republik zambia | Azerbaijan | Baris 651 | Ditambahkan balasan (simetri) |
| 2121 | Republik zambia | Bahama | Baris 652 | Ditambahkan balasan (simetri) |
| 2122 | Republik zambia | Bangladesh | Baris 653 | Ditambahkan balasan (simetri) |
| 2123 | Republik zambia | Belanda | Baris 654 | Ditambahkan balasan (simetri) |
| 2124 | Republik zambia | Belarus | Baris 655 | Ditambahkan balasan (simetri) |
| 2125 | Republik zambia | Belgia | Baris 656 | Ditambahkan balasan (simetri) |
| 2126 | Republik zambia | Bermuda | Baris 657 | Ditambahkan balasan (simetri) |
| 2127 | Republik zambia | Bhutan | Baris 658 | Ditambahkan balasan (simetri) |
| 2128 | Republik zambia | Bolivia | Baris 659 | Ditambahkan balasan (simetri) |
| 2129 | Republik zambia | Botswana | Baris 660 | Ditambahkan balasan (simetri) |
| 2130 | Republik zimbabwe | Afrika Selatan | Baris 661 | Ditambahkan balasan (simetri) |
| 2131 | Republik zimbabwe | Albania | Baris 662 | Ditambahkan balasan (simetri) |
| 2132 | Republik zimbabwe | Amerika Serikat | Baris 663 | Ditambahkan balasan (simetri) |
| 2133 | Republik zimbabwe | Andorra | Baris 664 | Ditambahkan balasan (simetri) |
| 2134 | Republik zimbabwe | Australia | Baris 665 | Ditambahkan balasan (simetri) |
| 2135 | Republik zimbabwe | Austria | Baris 666 | Ditambahkan balasan (simetri) |
| 2136 | Republik zimbabwe | Azerbaijan | Baris 667 | Ditambahkan balasan (simetri) |
| 2137 | Republik zimbabwe | Bahrain | Baris 668 | Ditambahkan balasan (simetri) |
| 2138 | Republik zimbabwe | Belanda | Baris 669 | Ditambahkan balasan (simetri) |
| 2139 | Republik zimbabwe | Belarus | Baris 670 | Ditambahkan balasan (simetri) |
| 2140 | Republik zimbabwe | Belize | Baris 671 | Ditambahkan balasan (simetri) |
| 2141 | Republik zimbabwe | Benin | Baris 672 | Ditambahkan balasan (simetri) |
| 2142 | Republik zimbabwe | Bermuda | Baris 673 | Ditambahkan balasan (simetri) |
| 2143 | Republik zimbabwe | Bolivia | Baris 674 | Ditambahkan balasan (simetri) |
| 2144 | Republik zimbabwe | Bosnia dan Hercegovina | Baris 675 | Ditambahkan balasan (simetri) |
| 2145 | Republik zimbabwe | Brazil | Baris 676 | Ditambahkan balasan (simetri) |
| 2146 | Reunion | Afrika Selatan | Baris 3150 | Ditambahkan balasan (simetri) |
| 2147 | Reunion | Australia | Baris 3154 | Ditambahkan balasan (simetri) |
| 2148 | Reunion | India | Baris 3155 | Ditambahkan balasan (simetri) |
| 2149 | Reunion | Kenya | Baris 3153 | Ditambahkan balasan (simetri) |
| 2150 | Reunion | Komoro | Baris 3152 | Ditambahkan balasan (simetri) |
| 2151 | Reunion | Madagaskar | Baris 3148 | Ditambahkan balasan (simetri) |
| 2152 | Reunion | Mauritius | Baris 3149 | Ditambahkan balasan (simetri) |
| 2153 | Reunion | Prancis | Baris 3147 | Ditambahkan balasan (simetri) |
| 2154 | Reunion | Republik tanzania | Baris 3156 | Ditambahkan balasan (simetri) |
| 2155 | Reunion | Seychelles | Baris 3151 | Ditambahkan balasan (simetri) |
| 2156 | Rusia | Afganistan | Baris 2111 | Ditambahkan balasan (simetri) |
| 2157 | Rusia | Aljazair | Baris 2112 | Ditambahkan balasan (simetri) |
| 2158 | Rusia | Amerika Serikat | Baris 2113 | Ditambahkan balasan (simetri) |
| 2159 | Rusia | Andorra | Baris 2114 | Ditambahkan balasan (simetri) |
| 2160 | Rusia | Antigua dan Barbuda | Baris 2115 | Ditambahkan balasan (simetri) |
| 2161 | Rusia | Armenia | Baris 2116 | Ditambahkan balasan (simetri) |
| 2162 | Rusia | Austria | Baris 2117 | Ditambahkan balasan (simetri) |
| 2163 | Rusia | Bahama | Baris 2118 | Ditambahkan balasan (simetri) |
| 2164 | Rusia | Bahrain | Baris 2119 | Ditambahkan balasan (simetri) |
| 2165 | Rusia | Barbados | Baris 2120 | Ditambahkan balasan (simetri) |
| 2166 | Rusia | Belanda | Baris 2121 | Ditambahkan balasan (simetri) |
| 2167 | Rusia | Belarus | Baris 2122 | Ditambahkan balasan (simetri) |
| 2168 | Rusia | Belgia | Baris 2123 | Ditambahkan balasan (simetri) |
| 2169 | Rusia | Bhutan | Baris 2124 | Ditambahkan balasan (simetri) |
| 2170 | Rusia | Bosnia dan Hercegovina | Baris 2125 | Ditambahkan balasan (simetri) |
| 2171 | Rusia | Botswana | Baris 2126 | Ditambahkan balasan (simetri) |
| 2172 | Rusia | Brazil | Baris 2127 | Ditambahkan balasan (simetri) |
| 2173 | Rusia | Brunei | Baris 2128 | Ditambahkan balasan (simetri) |
| 2174 | Rwanda | Afganistan | Baris 677 | Ditambahkan balasan (simetri) |
| 2175 | Rwanda | Albania | Baris 678 | Ditambahkan balasan (simetri) |
| 2176 | Rwanda | Aljazair | Baris 679 | Ditambahkan balasan (simetri) |
| 2177 | Rwanda | Angola | Baris 680 | Ditambahkan balasan (simetri) |
| 2178 | Rwanda | Antigua dan Barbuda | Baris 681 | Ditambahkan balasan (simetri) |
| 2179 | Rwanda | Arab Saudi | Baris 682 | Ditambahkan balasan (simetri) |
| 2180 | Rwanda | Argentina | Baris 683 | Ditambahkan balasan (simetri) |
| 2181 | Rwanda | Australia | Baris 684 | Ditambahkan balasan (simetri) |
| 2182 | Rwanda | Austria | Baris 685 | Ditambahkan balasan (simetri) |
| 2183 | Rwanda | Azerbaijan | Baris 686 | Ditambahkan balasan (simetri) |
| 2184 | Rwanda | Bahama | Baris 687 | Ditambahkan balasan (simetri) |
| 2185 | Rwanda | Bangladesh | Baris 688 | Ditambahkan balasan (simetri) |
| 2186 | Rwanda | Belanda | Baris 689 | Ditambahkan balasan (simetri) |
| 2187 | Rwanda | Belize | Baris 690 | Ditambahkan balasan (simetri) |
| 2188 | Rwanda | Benin | Baris 691 | Ditambahkan balasan (simetri) |
| 2189 | Rwanda | Bermuda | Baris 692 | Ditambahkan balasan (simetri) |
| 2190 | Rwanda | Bolivia | Baris 693 | Ditambahkan balasan (simetri) |
| 2191 | Rwanda | Brazil | Baris 694 | Ditambahkan balasan (simetri) |
| 2192 | Rwanda | Brunei | Baris 695 | Ditambahkan balasan (simetri) |
| 2193 | Saint Kitts dan Nevis | Afrika Selatan | Baris 2631 | Ditambahkan balasan (simetri) |
| 2194 | Saint Kitts dan Nevis | Antigua dan Barbuda | Baris 2632 | Ditambahkan balasan (simetri) |
| 2195 | Saint Kitts dan Nevis | Arab Saudi | Baris 2633 | Ditambahkan balasan (simetri) |
| 2196 | Saint Kitts dan Nevis | Azerbaijan | Baris 2634 | Ditambahkan balasan (simetri) |
| 2197 | Saint Kitts dan Nevis | Bahrain | Baris 2635 | Ditambahkan balasan (simetri) |
| 2198 | Saint Kitts dan Nevis | Bangladesh | Baris 2636 | Ditambahkan balasan (simetri) |
| 2199 | Saint Kitts dan Nevis | Belanda | Baris 2637 | Ditambahkan balasan (simetri) |
| 2200 | Saint Kitts dan Nevis | Belgia | Baris 2638 | Ditambahkan balasan (simetri) |
| 2201 | Saint Kitts dan Nevis | Belize | Baris 2639 | Ditambahkan balasan (simetri) |
| 2202 | Saint Kitts dan Nevis | Benin | Baris 2640 | Ditambahkan balasan (simetri) |
| 2203 | Saint Kitts dan Nevis | Bosnia dan Hercegovina | Baris 2641 | Ditambahkan balasan (simetri) |
| 2204 | Saint Kitts dan Nevis | Brazil | Baris 2642 | Ditambahkan balasan (simetri) |
| 2205 | Saint Kitts dan Nevis | Brunei | Baris 2643 | Ditambahkan balasan (simetri) |
| 2206 | Saint lucia | Afrika Selatan | Baris 2644 | Ditambahkan balasan (simetri) |
| 2207 | Saint lucia | Albania | Baris 2645 | Ditambahkan balasan (simetri) |
| 2208 | Saint lucia | Amerika Serikat | Baris 2646 | Ditambahkan balasan (simetri) |
| 2209 | Saint lucia | Andorra | Baris 2647 | Ditambahkan balasan (simetri) |
| 2210 | Saint lucia | Antigua dan Barbuda | Baris 2648 | Ditambahkan balasan (simetri) |
| 2211 | Saint lucia | Australia | Baris 2649 | Ditambahkan balasan (simetri) |
| 2212 | Saint lucia | Austria | Baris 2650 | Ditambahkan balasan (simetri) |
| 2213 | Saint lucia | Azerbaijan | Baris 2651 | Ditambahkan balasan (simetri) |
| 2214 | Saint lucia | Bahama | Baris 2652 | Ditambahkan balasan (simetri) |
| 2215 | Saint lucia | Bangladesh | Baris 2653 | Ditambahkan balasan (simetri) |
| 2216 | Saint lucia | Belanda | Baris 2654 | Ditambahkan balasan (simetri) |
| 2217 | Saint lucia | Belarus | Baris 2655 | Ditambahkan balasan (simetri) |
| 2218 | Saint lucia | Belgia | Baris 2656 | Ditambahkan balasan (simetri) |
| 2219 | Saint lucia | Belize | Baris 2657 | Ditambahkan balasan (simetri) |
| 2220 | Saint lucia | Benin | Baris 2658 | Ditambahkan balasan (simetri) |
| 2221 | Saint lucia | Bermuda | Baris 2659 | Ditambahkan balasan (simetri) |
| 2222 | Saint lucia | Bhutan | Baris 2660 | Ditambahkan balasan (simetri) |
| 2223 | Saint lucia | Bolivia | Baris 2661 | Ditambahkan balasan (simetri) |
| 2224 | Saint lucia | Brazil | Baris 2662 | Ditambahkan balasan (simetri) |
| 2225 | Saint Vincent dan Grenadine | Afrika Selatan | Baris 2663 | Ditambahkan balasan (simetri) |
| 2226 | Saint Vincent dan Grenadine | Albania | Baris 2664 | Ditambahkan balasan (simetri) |
| 2227 | Saint Vincent dan Grenadine | Antigua dan Barbuda | Baris 2665 | Ditambahkan balasan (simetri) |
| 2228 | Saint Vincent dan Grenadine | Armenia | Baris 2666 | Ditambahkan balasan (simetri) |
| 2229 | Saint Vincent dan Grenadine | Austria | Baris 2667 | Ditambahkan balasan (simetri) |
| 2230 | Saint Vincent dan Grenadine | Azerbaijan | Baris 2668 | Ditambahkan balasan (simetri) |
| 2231 | Saint Vincent dan Grenadine | Bangladesh | Baris 2669 | Ditambahkan balasan (simetri) |
| 2232 | Saint Vincent dan Grenadine | Belanda | Baris 2670 | Ditambahkan balasan (simetri) |
| 2233 | Saint Vincent dan Grenadine | Belarus | Baris 2671 | Ditambahkan balasan (simetri) |
| 2234 | Saint Vincent dan Grenadine | Belgia | Baris 2672 | Ditambahkan balasan (simetri) |
| 2235 | Saint Vincent dan Grenadine | Belize | Baris 2673 | Ditambahkan balasan (simetri) |
| 2236 | Saint Vincent dan Grenadine | Benin | Baris 2674 | Ditambahkan balasan (simetri) |
| 2237 | Saint Vincent dan Grenadine | Bermuda | Baris 2675 | Ditambahkan balasan (simetri) |
| 2238 | Saint Vincent dan Grenadine | Bhutan | Baris 2676 | Ditambahkan balasan (simetri) |
| 2239 | Saint Vincent dan Grenadine | Bosnia dan Hercegovina | Baris 2677 | Ditambahkan balasan (simetri) |
| 2240 | Saint Vincent dan Grenadine | Botswana | Baris 2678 | Ditambahkan balasan (simetri) |
| 2241 | Saint Vincent dan Grenadine | Brazil | Baris 2679 | Ditambahkan balasan (simetri) |
| 2242 | Saint Vincent dan Grenadine | Brunei | Baris 2680 | Ditambahkan balasan (simetri) |
| 2243 | Samoa | Aljazair | Baris 2839 | Ditambahkan balasan (simetri) |
| 2244 | Samoa | Amerika Serikat | Baris 2840 | Ditambahkan balasan (simetri) |
| 2245 | Samoa | Angola | Baris 2841 | Ditambahkan balasan (simetri) |
| 2246 | Samoa | Antigua dan Barbuda | Baris 2842 | Ditambahkan balasan (simetri) |
| 2247 | Samoa | Argentina | Baris 2843 | Ditambahkan balasan (simetri) |
| 2248 | Samoa | Armenia | Baris 2844 | Ditambahkan balasan (simetri) |
| 2249 | Samoa | Azerbaijan | Baris 2845 | Ditambahkan balasan (simetri) |
| 2250 | Samoa | Belarus | Baris 2846 | Ditambahkan balasan (simetri) |
| 2251 | Samoa | Belgia | Baris 2847 | Ditambahkan balasan (simetri) |
| 2252 | Samoa | Belize | Baris 2848 | Ditambahkan balasan (simetri) |
| 2253 | Samoa | Benin | Baris 2849 | Ditambahkan balasan (simetri) |
| 2254 | Samoa | Bermuda | Baris 2850 | Ditambahkan balasan (simetri) |
| 2255 | Samoa | Bolivia | Baris 2851 | Ditambahkan balasan (simetri) |
| 2256 | Samoa | Bosnia dan Hercegovina | Baris 2852 | Ditambahkan balasan (simetri) |
| 2257 | Samoa | Botswana | Baris 2853 | Ditambahkan balasan (simetri) |
| 2258 | Samoa | Brazil | Baris 2854 | Ditambahkan balasan (simetri) |
| 2259 | Samoa | Brunei | Baris 2855 | Ditambahkan balasan (simetri) |
| 2260 | Samoa amerika | Afrika Selatan | Baris 2856 | Ditambahkan balasan (simetri) |
| 2261 | Samoa amerika | Amerika Serikat | Baris 2857 | Ditambahkan balasan (simetri) |
| 2262 | Samoa amerika | Andorra | Baris 2858 | Ditambahkan balasan (simetri) |
| 2263 | Samoa amerika | Arab Saudi | Baris 2859 | Ditambahkan balasan (simetri) |
| 2264 | Samoa amerika | Armenia | Baris 2860 | Ditambahkan balasan (simetri) |
| 2265 | Samoa amerika | Australia | Baris 2861 | Ditambahkan balasan (simetri) |
| 2266 | Samoa amerika | Austria | Baris 2862 | Ditambahkan balasan (simetri) |
| 2267 | Samoa amerika | Bahrain | Baris 2863 | Ditambahkan balasan (simetri) |
| 2268 | Samoa amerika | Barbados | Baris 2864 | Ditambahkan balasan (simetri) |
| 2269 | Samoa amerika | Belanda | Baris 2865 | Ditambahkan balasan (simetri) |
| 2270 | Samoa amerika | Belgia | Baris 2866 | Ditambahkan balasan (simetri) |
| 2271 | Samoa amerika | Bermuda | Baris 2867 | Ditambahkan balasan (simetri) |
| 2272 | Samoa amerika | Bhutan | Baris 2868 | Ditambahkan balasan (simetri) |
| 2273 | Samoa amerika | Bolivia | Baris 2869 | Ditambahkan balasan (simetri) |
| 2274 | Samoa amerika | Bosnia dan Hercegovina | Baris 2870 | Ditambahkan balasan (simetri) |
| 2275 | Samoa amerika | Botswana | Baris 2871 | Ditambahkan balasan (simetri) |
| 2276 | Samoa amerika | Brazil | Baris 2872 | Ditambahkan balasan (simetri) |
| 2277 | Samoa amerika | Brunei | Baris 2873 | Ditambahkan balasan (simetri) |
| 2278 | San marino | Antigua dan Barbuda | Baris 2129 | Ditambahkan balasan (simetri) |
| 2279 | San marino | Arab Saudi | Baris 2130 | Ditambahkan balasan (simetri) |
| 2280 | San marino | Armenia | Baris 2131 | Ditambahkan balasan (simetri) |
| 2281 | San marino | Azerbaijan | Baris 2132 | Ditambahkan balasan (simetri) |
| 2282 | San marino | Bahama | Baris 2133 | Ditambahkan balasan (simetri) |
| 2283 | San marino | Bangladesh | Baris 2134 | Ditambahkan balasan (simetri) |
| 2284 | San marino | Barbados | Baris 2135 | Ditambahkan balasan (simetri) |
| 2285 | San marino | Belarus | Baris 2136 | Ditambahkan balasan (simetri) |
| 2286 | San marino | Belgia | Baris 2137 | Ditambahkan balasan (simetri) |
| 2287 | San marino | Belize | Baris 2138 | Ditambahkan balasan (simetri) |
| 2288 | San marino | Bermuda | Baris 2139 | Ditambahkan balasan (simetri) |
| 2289 | San marino | Bosnia dan Hercegovina | Baris 2140 | Ditambahkan balasan (simetri) |
| 2290 | San marino | Botswana | Baris 2141 | Ditambahkan balasan (simetri) |
| 2291 | San marino | Brunei | Baris 2142 | Ditambahkan balasan (simetri) |
| 2292 | Sao Tome dan Principe | Afganistan | Baris 696 | Ditambahkan balasan (simetri) |
| 2293 | Sao Tome dan Principe | Albania | Baris 697 | Ditambahkan balasan (simetri) |
| 2294 | Sao Tome dan Principe | Aljazair | Baris 698 | Ditambahkan balasan (simetri) |
| 2295 | Sao Tome dan Principe | Amerika Serikat | Baris 699 | Ditambahkan balasan (simetri) |
| 2296 | Sao Tome dan Principe | Andorra | Baris 700 | Ditambahkan balasan (simetri) |
| 2297 | Sao Tome dan Principe | Angola | Baris 701 | Ditambahkan balasan (simetri) |
| 2298 | Sao Tome dan Principe | Antigua dan Barbuda | Baris 702 | Ditambahkan balasan (simetri) |
| 2299 | Sao Tome dan Principe | Arab Saudi | Baris 703 | Ditambahkan balasan (simetri) |
| 2300 | Sao Tome dan Principe | Argentina | Baris 704 | Ditambahkan balasan (simetri) |
| 2301 | Sao Tome dan Principe | Australia | Baris 705 | Ditambahkan balasan (simetri) |
| 2302 | Sao Tome dan Principe | Austria | Baris 706 | Ditambahkan balasan (simetri) |
| 2303 | Sao Tome dan Principe | Barbados | Baris 707 | Ditambahkan balasan (simetri) |
| 2304 | Sao Tome dan Principe | Belanda | Baris 708 | Ditambahkan balasan (simetri) |
| 2305 | Sao Tome dan Principe | Belize | Baris 709 | Ditambahkan balasan (simetri) |
| 2306 | Sao Tome dan Principe | Bermuda | Baris 710 | Ditambahkan balasan (simetri) |
| 2307 | Sao Tome dan Principe | Bhutan | Baris 711 | Ditambahkan balasan (simetri) |
| 2308 | Sao Tome dan Principe | Bolivia | Baris 712 | Ditambahkan balasan (simetri) |
| 2309 | Sao Tome dan Principe | Botswana | Baris 713 | Ditambahkan balasan (simetri) |
| 2310 | Sao Tome dan Principe | Brazil | Baris 714 | Ditambahkan balasan (simetri) |
| 2311 | Sao Tome dan Principe | Brunei | Baris 715 | Ditambahkan balasan (simetri) |
| 2312 | Selandia baru | Albania | Baris 2874 | Ditambahkan balasan (simetri) |
| 2313 | Selandia baru | Amerika Serikat | Baris 2875 | Ditambahkan balasan (simetri) |
| 2314 | Selandia baru | Argentina | Baris 2876 | Ditambahkan balasan (simetri) |
| 2315 | Selandia baru | Armenia | Baris 2877 | Ditambahkan balasan (simetri) |
| 2316 | Selandia baru | Australia | Baris 2878 | Ditambahkan balasan (simetri) |
| 2317 | Selandia baru | Austria | Baris 2879 | Ditambahkan balasan (simetri) |
| 2318 | Selandia baru | Azerbaijan | Baris 2880 | Ditambahkan balasan (simetri) |
| 2319 | Selandia baru | Bahama | Baris 2881 | Ditambahkan balasan (simetri) |
| 2320 | Selandia baru | Barbados | Baris 2882 | Ditambahkan balasan (simetri) |
| 2321 | Selandia baru | Belarus | Baris 2883 | Ditambahkan balasan (simetri) |
| 2322 | Selandia baru | Belgia | Baris 2884 | Ditambahkan balasan (simetri) |
| 2323 | Selandia baru | Benin | Baris 2885 | Ditambahkan balasan (simetri) |
| 2324 | Selandia baru | Bolivia | Baris 2886 | Ditambahkan balasan (simetri) |
| 2325 | Selandia baru | Bosnia dan Hercegovina | Baris 2887 | Ditambahkan balasan (simetri) |
| 2326 | Senegal | Afganistan | Baris 716 | Ditambahkan balasan (simetri) |
| 2327 | Senegal | Aljazair | Baris 717 | Ditambahkan balasan (simetri) |
| 2328 | Senegal | Amerika Serikat | Baris 718 | Ditambahkan balasan (simetri) |
| 2329 | Senegal | Andorra | Baris 719 | Ditambahkan balasan (simetri) |
| 2330 | Senegal | Angola | Baris 720 | Ditambahkan balasan (simetri) |
| 2331 | Senegal | Arab Saudi | Baris 721 | Ditambahkan balasan (simetri) |
| 2332 | Senegal | Bahama | Baris 722 | Ditambahkan balasan (simetri) |
| 2333 | Senegal | Bahrain | Baris 723 | Ditambahkan balasan (simetri) |
| 2334 | Senegal | Bangladesh | Baris 724 | Ditambahkan balasan (simetri) |
| 2335 | Senegal | Barbados | Baris 725 | Ditambahkan balasan (simetri) |
| 2336 | Senegal | Belanda | Baris 726 | Ditambahkan balasan (simetri) |
| 2337 | Senegal | Belarus | Baris 727 | Ditambahkan balasan (simetri) |
| 2338 | Senegal | Belize | Baris 728 | Ditambahkan balasan (simetri) |
| 2339 | Senegal | Bermuda | Baris 729 | Ditambahkan balasan (simetri) |
| 2340 | Senegal | Botswana | Baris 730 | Ditambahkan balasan (simetri) |
| 2341 | Senegal | Brazil | Baris 731 | Ditambahkan balasan (simetri) |
| 2342 | Senegal | Brunei | Baris 732 | Ditambahkan balasan (simetri) |
| 2343 | Seychelles | Amerika Serikat | Baris 733 | Ditambahkan balasan (simetri) |
| 2344 | Seychelles | Antigua dan Barbuda | Baris 734 | Ditambahkan balasan (simetri) |
| 2345 | Seychelles | Argentina | Baris 735 | Ditambahkan balasan (simetri) |
| 2346 | Seychelles | Austria | Baris 736 | Ditambahkan balasan (simetri) |
| 2347 | Seychelles | Azerbaijan | Baris 737 | Ditambahkan balasan (simetri) |
| 2348 | Seychelles | Bahrain | Baris 738 | Ditambahkan balasan (simetri) |
| 2349 | Seychelles | Belize | Baris 739 | Ditambahkan balasan (simetri) |
| 2350 | Seychelles | Benin | Baris 740 | Ditambahkan balasan (simetri) |
| 2351 | Seychelles | Bhutan | Baris 741 | Ditambahkan balasan (simetri) |
| 2352 | Seychelles | Bosnia dan Hercegovina | Baris 742 | Ditambahkan balasan (simetri) |
| 2353 | Seychelles | Botswana | Baris 743 | Ditambahkan balasan (simetri) |
| 2354 | Sierra leone | Afrika Selatan | Baris 744 | Ditambahkan balasan (simetri) |
| 2355 | Sierra leone | Albania | Baris 745 | Ditambahkan balasan (simetri) |
| 2356 | Sierra leone | Aljazair | Baris 746 | Ditambahkan balasan (simetri) |
| 2357 | Sierra leone | Amerika Serikat | Baris 747 | Ditambahkan balasan (simetri) |
| 2358 | Sierra leone | Andorra | Baris 748 | Ditambahkan balasan (simetri) |
| 2359 | Sierra leone | Antigua dan Barbuda | Baris 749 | Ditambahkan balasan (simetri) |
| 2360 | Sierra leone | Arab Saudi | Baris 750 | Ditambahkan balasan (simetri) |
| 2361 | Sierra leone | Argentina | Baris 751 | Ditambahkan balasan (simetri) |
| 2362 | Sierra leone | Austria | Baris 752 | Ditambahkan balasan (simetri) |
| 2363 | Sierra leone | Azerbaijan | Baris 753 | Ditambahkan balasan (simetri) |
| 2364 | Sierra leone | Bahrain | Baris 754 | Ditambahkan balasan (simetri) |
| 2365 | Sierra leone | Belanda | Baris 755 | Ditambahkan balasan (simetri) |
| 2366 | Sierra leone | Belgia | Baris 756 | Ditambahkan balasan (simetri) |
| 2367 | Sierra leone | Benin | Baris 757 | Ditambahkan balasan (simetri) |
| 2368 | Sierra leone | Bhutan | Baris 758 | Ditambahkan balasan (simetri) |
| 2369 | Sierra leone | Botswana | Baris 759 | Ditambahkan balasan (simetri) |
| 2370 | Sierra leone | Brazil | Baris 760 | Ditambahkan balasan (simetri) |
| 2371 | Sierra leone | Brunei | Baris 761 | Ditambahkan balasan (simetri) |
| 2372 | Singapura | Afganistan | Baris 1396 | Ditambahkan balasan (simetri) |
| 2373 | Singapura | Albania | Baris 1397 | Ditambahkan balasan (simetri) |
| 2374 | Singapura | Amerika Serikat | Baris 1398 | Ditambahkan balasan (simetri) |
| 2375 | Singapura | Andorra | Baris 1399 | Ditambahkan balasan (simetri) |
| 2376 | Singapura | Angola | Baris 1400 | Ditambahkan balasan (simetri) |
| 2377 | Singapura | Arab Saudi | Baris 1401 | Ditambahkan balasan (simetri) |
| 2378 | Singapura | Argentina | Baris 1402 | Ditambahkan balasan (simetri) |
| 2379 | Singapura | Armenia | Baris 1403 | Ditambahkan balasan (simetri) |
| 2380 | Singapura | Australia | Baris 1404 | Ditambahkan balasan (simetri) |
| 2381 | Singapura | Austria | Baris 1405 | Ditambahkan balasan (simetri) |
| 2382 | Singapura | Bahrain | Baris 1406 | Ditambahkan balasan (simetri) |
| 2383 | Singapura | Bangladesh | Baris 1407 | Ditambahkan balasan (simetri) |
| 2384 | Singapura | Belanda | Baris 1408 | Ditambahkan balasan (simetri) |
| 2385 | Singapura | Benin | Baris 1409 | Ditambahkan balasan (simetri) |
| 2386 | Singapura | Bermuda | Baris 1410 | Ditambahkan balasan (simetri) |
| 2387 | Singapura | Bolivia | Baris 1411 | Ditambahkan balasan (simetri) |
| 2388 | Singapura | Botswana | Baris 1412 | Ditambahkan balasan (simetri) |
| 2389 | Singapura | Brazil | Baris 1413 | Ditambahkan balasan (simetri) |
| 2390 | Singapura | Brunei | Baris 1414 | Ditambahkan balasan (simetri) |
| 2391 | Siprus | Afrika Selatan | Baris 2143 | Ditambahkan balasan (simetri) |
| 2392 | Siprus | Amerika Serikat | Baris 2144 | Ditambahkan balasan (simetri) |
| 2393 | Siprus | Angola | Baris 2145 | Ditambahkan balasan (simetri) |
| 2394 | Siprus | Antigua dan Barbuda | Baris 2146 | Ditambahkan balasan (simetri) |
| 2395 | Siprus | Armenia | Baris 2147 | Ditambahkan balasan (simetri) |
| 2396 | Siprus | Bangladesh | Baris 2148 | Ditambahkan balasan (simetri) |
| 2397 | Siprus | Belarus | Baris 2149 | Ditambahkan balasan (simetri) |
| 2398 | Siprus | Belize | Baris 2150 | Ditambahkan balasan (simetri) |
| 2399 | Siprus | Benin | Baris 2151 | Ditambahkan balasan (simetri) |
| 2400 | Siprus | Bhutan | Baris 2152 | Ditambahkan balasan (simetri) |
| 2401 | Siprus | Botswana | Baris 2153 | Ditambahkan balasan (simetri) |
| 2402 | Slovenia | Afganistan | Baris 2154 | Ditambahkan balasan (simetri) |
| 2403 | Slovenia | Albania | Baris 2155 | Ditambahkan balasan (simetri) |
| 2404 | Slovenia | Andorra | Baris 2156 | Ditambahkan balasan (simetri) |
| 2405 | Slovenia | Antigua dan Barbuda | Baris 2157 | Ditambahkan balasan (simetri) |
| 2406 | Slovenia | Australia | Baris 2158 | Ditambahkan balasan (simetri) |
| 2407 | Slovenia | Azerbaijan | Baris 2159 | Ditambahkan balasan (simetri) |
| 2408 | Slovenia | Bahama | Baris 2160 | Ditambahkan balasan (simetri) |
| 2409 | Slovenia | Bahrain | Baris 2161 | Ditambahkan balasan (simetri) |
| 2410 | Slovenia | Bangladesh | Baris 2162 | Ditambahkan balasan (simetri) |
| 2411 | Slovenia | Belgia | Baris 2163 | Ditambahkan balasan (simetri) |
| 2412 | Slovenia | Bermuda | Baris 2164 | Ditambahkan balasan (simetri) |
| 2413 | Slovenia | Bhutan | Baris 2165 | Ditambahkan balasan (simetri) |
| 2414 | Slovenia | Bolivia | Baris 2166 | Ditambahkan balasan (simetri) |
| 2415 | Slovenia | Brazil | Baris 2167 | Ditambahkan balasan (simetri) |
| 2416 | Slowakia | Afganistan | Baris 2168 | Ditambahkan balasan (simetri) |
| 2417 | Slowakia | Afrika Selatan | Baris 2169 | Ditambahkan balasan (simetri) |
| 2418 | Slowakia | Aljazair | Baris 2170 | Ditambahkan balasan (simetri) |
| 2419 | Slowakia | Amerika Serikat | Baris 2171 | Ditambahkan balasan (simetri) |
| 2420 | Slowakia | Andorra | Baris 2172 | Ditambahkan balasan (simetri) |
| 2421 | Slowakia | Arab Saudi | Baris 2173 | Ditambahkan balasan (simetri) |
| 2422 | Slowakia | Armenia | Baris 2174 | Ditambahkan balasan (simetri) |
| 2423 | Slowakia | Austria | Baris 2175 | Ditambahkan balasan (simetri) |
| 2424 | Slowakia | Azerbaijan | Baris 2176 | Ditambahkan balasan (simetri) |
| 2425 | Slowakia | Bangladesh | Baris 2177 | Ditambahkan balasan (simetri) |
| 2426 | Slowakia | Belanda | Baris 2178 | Ditambahkan balasan (simetri) |
| 2427 | Slowakia | Belgia | Baris 2179 | Ditambahkan balasan (simetri) |
| 2428 | Slowakia | Bhutan | Baris 2180 | Ditambahkan balasan (simetri) |
| 2429 | Slowakia | Botswana | Baris 2181 | Ditambahkan balasan (simetri) |
| 2430 | Slowakia | Brunei | Baris 2182 | Ditambahkan balasan (simetri) |
| 2431 | Somalia | Afganistan | Baris 762 | Ditambahkan balasan (simetri) |
| 2432 | Somalia | Afrika Selatan | Baris 763 | Ditambahkan balasan (simetri) |
| 2433 | Somalia | Amerika Serikat | Baris 764 | Ditambahkan balasan (simetri) |
| 2434 | Somalia | Australia | Baris 765 | Ditambahkan balasan (simetri) |
| 2435 | Somalia | Bahrain | Baris 766 | Ditambahkan balasan (simetri) |
| 2436 | Somalia | Barbados | Baris 767 | Ditambahkan balasan (simetri) |
| 2437 | Somalia | Belgia | Baris 768 | Ditambahkan balasan (simetri) |
| 2438 | Somalia | Belize | Baris 769 | Ditambahkan balasan (simetri) |
| 2439 | Somalia | Benin | Baris 770 | Ditambahkan balasan (simetri) |
| 2440 | Somalia | Bermuda | Baris 771 | Ditambahkan balasan (simetri) |
| 2441 | Somalia | Bhutan | Baris 772 | Ditambahkan balasan (simetri) |
| 2442 | Somalia | Bosnia dan Hercegovina | Baris 773 | Ditambahkan balasan (simetri) |
| 2443 | Somalia | Botswana | Baris 774 | Ditambahkan balasan (simetri) |
| 2444 | Somalia | Brunei | Baris 775 | Ditambahkan balasan (simetri) |
| 2445 | Spanyol | Albania | Baris 2183 | Ditambahkan balasan (simetri) |
| 2446 | Spanyol | Amerika Serikat | Baris 2184 | Ditambahkan balasan (simetri) |
| 2447 | Spanyol | Andorra | Baris 2185 | Ditambahkan balasan (simetri) |
| 2448 | Spanyol | Argentina | Baris 2186 | Ditambahkan balasan (simetri) |
| 2449 | Spanyol | Australia | Baris 2187 | Ditambahkan balasan (simetri) |
| 2450 | Spanyol | Azerbaijan | Baris 2188 | Ditambahkan balasan (simetri) |
| 2451 | Spanyol | Bahama | Baris 2189 | Ditambahkan balasan (simetri) |
| 2452 | Spanyol | Barbados | Baris 2190 | Ditambahkan balasan (simetri) |
| 2453 | Spanyol | Belgia | Baris 2191 | Ditambahkan balasan (simetri) |
| 2454 | Spanyol | Belize | Baris 2192 | Ditambahkan balasan (simetri) |
| 2455 | Spanyol | Benin | Baris 2193 | Ditambahkan balasan (simetri) |
| 2456 | Spanyol | Bolivia | Baris 2194 | Ditambahkan balasan (simetri) |
| 2457 | Spanyol | Bosnia dan Hercegovina | Baris 2195 | Ditambahkan balasan (simetri) |
| 2458 | Spanyol | Brazil | Baris 2196 | Ditambahkan balasan (simetri) |
| 2459 | Spanyol | Brunei | Baris 2197 | Ditambahkan balasan (simetri) |
| 2460 | Sri lanka | Afrika Selatan | Baris 1415 | Ditambahkan balasan (simetri) |
| 2461 | Sri lanka | Albania | Baris 1416 | Ditambahkan balasan (simetri) |
| 2462 | Sri lanka | Angola | Baris 1417 | Ditambahkan balasan (simetri) |
| 2463 | Sri lanka | Arab Saudi | Baris 1418 | Ditambahkan balasan (simetri) |
| 2464 | Sri lanka | Argentina | Baris 1419 | Ditambahkan balasan (simetri) |
| 2465 | Sri lanka | Australia | Baris 1420 | Ditambahkan balasan (simetri) |
| 2466 | Sri lanka | Bahama | Baris 1421 | Ditambahkan balasan (simetri) |
| 2467 | Sri lanka | Bahrain | Baris 1422 | Ditambahkan balasan (simetri) |
| 2468 | Sri lanka | Bangladesh | Baris 1423 | Ditambahkan balasan (simetri) |
| 2469 | Sri lanka | Benin | Baris 1424 | Ditambahkan balasan (simetri) |
| 2470 | Sri lanka | Bolivia | Baris 1425 | Ditambahkan balasan (simetri) |
| 2471 | Sri lanka | Bosnia dan Hercegovina | Baris 1426 | Ditambahkan balasan (simetri) |
| 2472 | Sri lanka | Brazil | Baris 1427 | Ditambahkan balasan (simetri) |
| 2473 | Sri lanka | Brunei | Baris 1428 | Ditambahkan balasan (simetri) |
| 2474 | Sudan selatan | Albania | Baris 776 | Ditambahkan balasan (simetri) |
| 2475 | Sudan selatan | Amerika Serikat | Baris 777 | Ditambahkan balasan (simetri) |
| 2476 | Sudan selatan | Andorra | Baris 778 | Ditambahkan balasan (simetri) |
| 2477 | Sudan selatan | Arab Saudi | Baris 779 | Ditambahkan balasan (simetri) |
| 2478 | Sudan selatan | Argentina | Baris 780 | Ditambahkan balasan (simetri) |
| 2479 | Sudan selatan | Bangladesh | Baris 781 | Ditambahkan balasan (simetri) |
| 2480 | Sudan selatan | Belarus | Baris 782 | Ditambahkan balasan (simetri) |
| 2481 | Sudan selatan | Benin | Baris 783 | Ditambahkan balasan (simetri) |
| 2482 | Sudan selatan | Bermuda | Baris 784 | Ditambahkan balasan (simetri) |
| 2483 | Sudan selatan | Bolivia | Baris 785 | Ditambahkan balasan (simetri) |
| 2484 | Suriah | Afganistan | Baris 1429 | Ditambahkan balasan (simetri) |
| 2485 | Suriah | Afrika Selatan | Baris 1430 | Ditambahkan balasan (simetri) |
| 2486 | Suriah | Albania | Baris 1431 | Ditambahkan balasan (simetri) |
| 2487 | Suriah | Amerika Serikat | Baris 1432 | Ditambahkan balasan (simetri) |
| 2488 | Suriah | Angola | Baris 1433 | Ditambahkan balasan (simetri) |
| 2489 | Suriah | Argentina | Baris 1434 | Ditambahkan balasan (simetri) |
| 2490 | Suriah | Armenia | Baris 1435 | Ditambahkan balasan (simetri) |
| 2491 | Suriah | Australia | Baris 1436 | Ditambahkan balasan (simetri) |
| 2492 | Suriah | Bangladesh | Baris 1437 | Ditambahkan balasan (simetri) |
| 2493 | Suriah | Barbados | Baris 1438 | Ditambahkan balasan (simetri) |
| 2494 | Suriah | Belanda | Baris 1439 | Ditambahkan balasan (simetri) |
| 2495 | Suriah | Belarus | Baris 1440 | Ditambahkan balasan (simetri) |
| 2496 | Suriah | Belize | Baris 1441 | Ditambahkan balasan (simetri) |
| 2497 | Suriah | Bermuda | Baris 1442 | Ditambahkan balasan (simetri) |
| 2498 | Suriah | Botswana | Baris 1443 | Ditambahkan balasan (simetri) |
| 2499 | Suriah | Brazil | Baris 1444 | Ditambahkan balasan (simetri) |
| 2500 | Suriah | Brunei | Baris 1445 | Ditambahkan balasan (simetri) |
| 2501 | Suriname | Afganistan | Baris 3088 | Ditambahkan balasan (simetri) |
| 2502 | Suriname | Afrika Selatan | Baris 3089 | Ditambahkan balasan (simetri) |
| 2503 | Suriname | Albania | Baris 3090 | Ditambahkan balasan (simetri) |
| 2504 | Suriname | Amerika Serikat | Baris 3091 | Ditambahkan balasan (simetri) |
| 2505 | Suriname | Angola | Baris 3092 | Ditambahkan balasan (simetri) |
| 2506 | Suriname | Antigua dan Barbuda | Baris 3093 | Ditambahkan balasan (simetri) |
| 2507 | Suriname | Arab Saudi | Baris 3094 | Ditambahkan balasan (simetri) |
| 2508 | Suriname | Armenia | Baris 3095 | Ditambahkan balasan (simetri) |
| 2509 | Suriname | Australia | Baris 3096 | Ditambahkan balasan (simetri) |
| 2510 | Suriname | Azerbaijan | Baris 3097 | Ditambahkan balasan (simetri) |
| 2511 | Suriname | Bangladesh | Baris 3098 | Ditambahkan balasan (simetri) |
| 2512 | Suriname | Barbados | Baris 3099 | Ditambahkan balasan (simetri) |
| 2513 | Suriname | Belarus | Baris 3100 | Ditambahkan balasan (simetri) |
| 2514 | Suriname | Belgia | Baris 3101 | Ditambahkan balasan (simetri) |
| 2515 | Suriname | Bermuda | Baris 3102 | Ditambahkan balasan (simetri) |
| 2516 | Suriname | Bhutan | Baris 3103 | Ditambahkan balasan (simetri) |
| 2517 | Suriname | Bosnia dan Hercegovina | Baris 3104 | Ditambahkan balasan (simetri) |
| 2518 | Suriname | Botswana | Baris 3105 | Ditambahkan balasan (simetri) |
| 2519 | Suriname | Brazil | Baris 3106 | Ditambahkan balasan (simetri) |
| 2520 | Suriname | Brunei | Baris 3107 | Ditambahkan balasan (simetri) |
| 2521 | Swedia | Afganistan | Baris 2198 | Ditambahkan balasan (simetri) |
| 2522 | Swedia | Afrika Selatan | Baris 2199 | Ditambahkan balasan (simetri) |
| 2523 | Swedia | Amerika Serikat | Baris 2200 | Ditambahkan balasan (simetri) |
| 2524 | Swedia | Andorra | Baris 2201 | Ditambahkan balasan (simetri) |
| 2525 | Swedia | Angola | Baris 2202 | Ditambahkan balasan (simetri) |
| 2526 | Swedia | Antigua dan Barbuda | Baris 2203 | Ditambahkan balasan (simetri) |
| 2527 | Swedia | Arab Saudi | Baris 2204 | Ditambahkan balasan (simetri) |
| 2528 | Swedia | Australia | Baris 2205 | Ditambahkan balasan (simetri) |
| 2529 | Swedia | Austria | Baris 2206 | Ditambahkan balasan (simetri) |
| 2530 | Swedia | Bahrain | Baris 2207 | Ditambahkan balasan (simetri) |
| 2531 | Swedia | Barbados | Baris 2208 | Ditambahkan balasan (simetri) |
| 2532 | Swedia | Belanda | Baris 2209 | Ditambahkan balasan (simetri) |
| 2533 | Swedia | Bhutan | Baris 2210 | Ditambahkan balasan (simetri) |
| 2534 | Swedia | Bolivia | Baris 2211 | Ditambahkan balasan (simetri) |
| 2535 | Swedia | Brazil | Baris 2212 | Ditambahkan balasan (simetri) |
| 2536 | Swiss | Australia | Baris 2213 | Ditambahkan balasan (simetri) |
| 2537 | Swiss | Azerbaijan | Baris 2214 | Ditambahkan balasan (simetri) |
| 2538 | Swiss | Bahama | Baris 2215 | Ditambahkan balasan (simetri) |
| 2539 | Swiss | Bangladesh | Baris 2216 | Ditambahkan balasan (simetri) |
| 2540 | Swiss | Belanda | Baris 2217 | Ditambahkan balasan (simetri) |
| 2541 | Swiss | Benin | Baris 2218 | Ditambahkan balasan (simetri) |
| 2542 | Swiss | Bosnia dan Hercegovina | Baris 2219 | Ditambahkan balasan (simetri) |
| 2543 | Swiss | Botswana | Baris 2220 | Ditambahkan balasan (simetri) |
| 2544 | Swiss | Brazil | Baris 2221 | Ditambahkan balasan (simetri) |
| 2545 | Swiss | Brunei | Baris 2222 | Ditambahkan balasan (simetri) |
| 2546 | Tahiti | Afganistan | Baris 2888 | Ditambahkan balasan (simetri) |
| 2547 | Tahiti | Albania | Baris 2889 | Ditambahkan balasan (simetri) |
| 2548 | Tahiti | Aljazair | Baris 2890 | Ditambahkan balasan (simetri) |
| 2549 | Tahiti | Andorra | Baris 2891 | Ditambahkan balasan (simetri) |
| 2550 | Tahiti | Angola | Baris 2892 | Ditambahkan balasan (simetri) |
| 2551 | Tahiti | Barbados | Baris 2893 | Ditambahkan balasan (simetri) |
| 2552 | Tahiti | Belarus | Baris 2894 | Ditambahkan balasan (simetri) |
| 2553 | Tahiti | Belize | Baris 2895 | Ditambahkan balasan (simetri) |
| 2554 | Tahiti | Benin | Baris 2896 | Ditambahkan balasan (simetri) |
| 2555 | Tahiti | Bermuda | Baris 2897 | Ditambahkan balasan (simetri) |
| 2556 | Tahiti | Bolivia | Baris 2898 | Ditambahkan balasan (simetri) |
| 2557 | Tahiti | Bosnia dan Hercegovina | Baris 2899 | Ditambahkan balasan (simetri) |
| 2558 | Tahiti | Brazil | Baris 2900 | Ditambahkan balasan (simetri) |
| 2559 | Tahiti | Brunei | Baris 2901 | Ditambahkan balasan (simetri) |
| 2560 | Taiwan | Afganistan | Baris 1446 | Ditambahkan balasan (simetri) |
| 2561 | Taiwan | Afrika Selatan | Baris 1447 | Ditambahkan balasan (simetri) |
| 2562 | Taiwan | Albania | Baris 1448 | Ditambahkan balasan (simetri) |
| 2563 | Taiwan | Aljazair | Baris 1449 | Ditambahkan balasan (simetri) |
| 2564 | Taiwan | Amerika Serikat | Baris 1450 | Ditambahkan balasan (simetri) |
| 2565 | Taiwan | Angola | Baris 1451 | Ditambahkan balasan (simetri) |
| 2566 | Taiwan | Antigua dan Barbuda | Baris 1452 | Ditambahkan balasan (simetri) |
| 2567 | Taiwan | Arab Saudi | Baris 1453 | Ditambahkan balasan (simetri) |
| 2568 | Taiwan | Argentina | Baris 1454 | Ditambahkan balasan (simetri) |
| 2569 | Taiwan | Armenia | Baris 1455 | Ditambahkan balasan (simetri) |
| 2570 | Taiwan | Austria | Baris 1456 | Ditambahkan balasan (simetri) |
| 2571 | Taiwan | Bahama | Baris 1457 | Ditambahkan balasan (simetri) |
| 2572 | Taiwan | Belarus | Baris 1458 | Ditambahkan balasan (simetri) |
| 2573 | Taiwan | Belize | Baris 1459 | Ditambahkan balasan (simetri) |
| 2574 | Taiwan | Benin | Baris 1460 | Ditambahkan balasan (simetri) |
| 2575 | Taiwan | Bolivia | Baris 1461 | Ditambahkan balasan (simetri) |
| 2576 | Taiwan | Bosnia dan Hercegovina | Baris 1462 | Ditambahkan balasan (simetri) |
| 2577 | Taiwan | Botswana | Baris 1463 | Ditambahkan balasan (simetri) |
| 2578 | Taiwan | Brazil | Baris 1464 | Ditambahkan balasan (simetri) |
| 2579 | Tajikistan | Albania | Baris 1465 | Ditambahkan balasan (simetri) |
| 2580 | Tajikistan | Aljazair | Baris 1466 | Ditambahkan balasan (simetri) |
| 2581 | Tajikistan | Amerika Serikat | Baris 1467 | Ditambahkan balasan (simetri) |
| 2582 | Tajikistan | Angola | Baris 1468 | Ditambahkan balasan (simetri) |
| 2583 | Tajikistan | Antigua dan Barbuda | Baris 1469 | Ditambahkan balasan (simetri) |
| 2584 | Tajikistan | Arab Saudi | Baris 1470 | Ditambahkan balasan (simetri) |
| 2585 | Tajikistan | Austria | Baris 1471 | Ditambahkan balasan (simetri) |
| 2586 | Tajikistan | Azerbaijan | Baris 1472 | Ditambahkan balasan (simetri) |
| 2587 | Tajikistan | Bahama | Baris 1473 | Ditambahkan balasan (simetri) |
| 2588 | Tajikistan | Barbados | Baris 1474 | Ditambahkan balasan (simetri) |
| 2589 | Tajikistan | Belarus | Baris 1475 | Ditambahkan balasan (simetri) |
| 2590 | Tajikistan | Belgia | Baris 1476 | Ditambahkan balasan (simetri) |
| 2591 | Tajikistan | Bolivia | Baris 1477 | Ditambahkan balasan (simetri) |
| 2592 | Tajikistan | Brunei | Baris 1478 | Ditambahkan balasan (simetri) |
| 2593 | Tanjung verde | Albania | Baris 786 | Ditambahkan balasan (simetri) |
| 2594 | Tanjung verde | Aljazair | Baris 787 | Ditambahkan balasan (simetri) |
| 2595 | Tanjung verde | Amerika Serikat | Baris 788 | Ditambahkan balasan (simetri) |
| 2596 | Tanjung verde | Armenia | Baris 789 | Ditambahkan balasan (simetri) |
| 2597 | Tanjung verde | Australia | Baris 790 | Ditambahkan balasan (simetri) |
| 2598 | Tanjung verde | Azerbaijan | Baris 791 | Ditambahkan balasan (simetri) |
| 2599 | Tanjung verde | Barbados | Baris 792 | Ditambahkan balasan (simetri) |
| 2600 | Tanjung verde | Belarus | Baris 793 | Ditambahkan balasan (simetri) |
| 2601 | Tanjung verde | Belize | Baris 794 | Ditambahkan balasan (simetri) |
| 2602 | Tanjung verde | Bolivia | Baris 795 | Ditambahkan balasan (simetri) |
| 2603 | Tanjung verde | Botswana | Baris 796 | Ditambahkan balasan (simetri) |
| 2604 | Tanjung verde | Brunei | Baris 797 | Ditambahkan balasan (simetri) |
| 2605 | Thailand | Afganistan | Baris 1479 | Ditambahkan balasan (simetri) |
| 2606 | Thailand | Angola | Baris 1480 | Ditambahkan balasan (simetri) |
| 2607 | Thailand | Arab Saudi | Baris 1481 | Ditambahkan balasan (simetri) |
| 2608 | Thailand | Azerbaijan | Baris 1482 | Ditambahkan balasan (simetri) |
| 2609 | Thailand | Bangladesh | Baris 1483 | Ditambahkan balasan (simetri) |
| 2610 | Thailand | Belize | Baris 1484 | Ditambahkan balasan (simetri) |
| 2611 | Thailand | Bermuda | Baris 1485 | Ditambahkan balasan (simetri) |
| 2612 | Thailand | Bhutan | Baris 1486 | Ditambahkan balasan (simetri) |
| 2613 | Thailand | Bolivia | Baris 1487 | Ditambahkan balasan (simetri) |
| 2614 | Thailand | Brazil | Baris 1488 | Ditambahkan balasan (simetri) |
| 2615 | Togo | Angola | Baris 798 | Ditambahkan balasan (simetri) |
| 2616 | Togo | Arab Saudi | Baris 799 | Ditambahkan balasan (simetri) |
| 2617 | Togo | Armenia | Baris 800 | Ditambahkan balasan (simetri) |
| 2618 | Togo | Australia | Baris 801 | Ditambahkan balasan (simetri) |
| 2619 | Togo | Azerbaijan | Baris 802 | Ditambahkan balasan (simetri) |
| 2620 | Togo | Bahama | Baris 803 | Ditambahkan balasan (simetri) |
| 2621 | Togo | Bahrain | Baris 804 | Ditambahkan balasan (simetri) |
| 2622 | Togo | Bangladesh | Baris 805 | Ditambahkan balasan (simetri) |
| 2623 | Togo | Benin | Baris 806 | Ditambahkan balasan (simetri) |
| 2624 | Togo | Bermuda | Baris 807 | Ditambahkan balasan (simetri) |
| 2625 | Togo | Bhutan | Baris 808 | Ditambahkan balasan (simetri) |
| 2626 | Togo | Bolivia | Baris 809 | Ditambahkan balasan (simetri) |
| 2627 | Togo | Botswana | Baris 810 | Ditambahkan balasan (simetri) |
| 2628 | Togo | Brazil | Baris 811 | Ditambahkan balasan (simetri) |
| 2629 | Tonga | Albania | Baris 2902 | Ditambahkan balasan (simetri) |
| 2630 | Tonga | Andorra | Baris 2903 | Ditambahkan balasan (simetri) |
| 2631 | Tonga | Angola | Baris 2904 | Ditambahkan balasan (simetri) |
| 2632 | Tonga | Antigua dan Barbuda | Baris 2905 | Ditambahkan balasan (simetri) |
| 2633 | Tonga | Arab Saudi | Baris 2906 | Ditambahkan balasan (simetri) |
| 2634 | Tonga | Argentina | Baris 2907 | Ditambahkan balasan (simetri) |
| 2635 | Tonga | Austria | Baris 2908 | Ditambahkan balasan (simetri) |
| 2636 | Tonga | Bahama | Baris 2909 | Ditambahkan balasan (simetri) |
| 2637 | Tonga | Bahrain | Baris 2910 | Ditambahkan balasan (simetri) |
| 2638 | Tonga | Bangladesh | Baris 2911 | Ditambahkan balasan (simetri) |
| 2639 | Tonga | Barbados | Baris 2912 | Ditambahkan balasan (simetri) |
| 2640 | Tonga | Belanda | Baris 2913 | Ditambahkan balasan (simetri) |
| 2641 | Tonga | Benin | Baris 2914 | Ditambahkan balasan (simetri) |
| 2642 | Tonga | Bolivia | Baris 2915 | Ditambahkan balasan (simetri) |
| 2643 | Tonga | Bosnia dan Hercegovina | Baris 2916 | Ditambahkan balasan (simetri) |
| 2644 | Tonga | Brunei | Baris 2917 | Ditambahkan balasan (simetri) |
| 2645 | Trinidad dan tobago | Afganistan | Baris 2681 | Ditambahkan balasan (simetri) |
| 2646 | Trinidad dan tobago | Albania | Baris 2682 | Ditambahkan balasan (simetri) |
| 2647 | Trinidad dan tobago | Aljazair | Baris 2683 | Ditambahkan balasan (simetri) |
| 2648 | Trinidad dan tobago | Amerika Serikat | Baris 2684 | Ditambahkan balasan (simetri) |
| 2649 | Trinidad dan tobago | Argentina | Baris 2685 | Ditambahkan balasan (simetri) |
| 2650 | Trinidad dan tobago | Bahama | Baris 2686 | Ditambahkan balasan (simetri) |
| 2651 | Trinidad dan tobago | Bahrain | Baris 2687 | Ditambahkan balasan (simetri) |
| 2652 | Trinidad dan tobago | Barbados | Baris 2688 | Ditambahkan balasan (simetri) |
| 2653 | Trinidad dan tobago | Belanda | Baris 2689 | Ditambahkan balasan (simetri) |
| 2654 | Trinidad dan tobago | Belarus | Baris 2690 | Ditambahkan balasan (simetri) |
| 2655 | Trinidad dan tobago | Belize | Baris 2691 | Ditambahkan balasan (simetri) |
| 2656 | Trinidad dan tobago | Benin | Baris 2692 | Ditambahkan balasan (simetri) |
| 2657 | Trinidad dan tobago | Bolivia | Baris 2693 | Ditambahkan balasan (simetri) |
| 2658 | Tunisia | Afganistan | Baris 812 | Ditambahkan balasan (simetri) |
| 2659 | Tunisia | Albania | Baris 813 | Ditambahkan balasan (simetri) |
| 2660 | Tunisia | Angola | Baris 814 | Ditambahkan balasan (simetri) |
| 2661 | Tunisia | Antigua dan Barbuda | Baris 815 | Ditambahkan balasan (simetri) |
| 2662 | Tunisia | Arab Saudi | Baris 816 | Ditambahkan balasan (simetri) |
| 2663 | Tunisia | Argentina | Baris 817 | Ditambahkan balasan (simetri) |
| 2664 | Tunisia | Azerbaijan | Baris 818 | Ditambahkan balasan (simetri) |
| 2665 | Tunisia | Bangladesh | Baris 819 | Ditambahkan balasan (simetri) |
| 2666 | Tunisia | Benin | Baris 820 | Ditambahkan balasan (simetri) |
| 2667 | Tunisia | Bolivia | Baris 821 | Ditambahkan balasan (simetri) |
| 2668 | Turki | Afganistan | Baris 2223 | Ditambahkan balasan (simetri) |
| 2669 | Turki | Afrika Selatan | Baris 2224 | Ditambahkan balasan (simetri) |
| 2670 | Turki | Albania | Baris 2225 | Ditambahkan balasan (simetri) |
| 2671 | Turki | Amerika Serikat | Baris 2226 | Ditambahkan balasan (simetri) |
| 2672 | Turki | Angola | Baris 2227 | Ditambahkan balasan (simetri) |
| 2673 | Turki | Argentina | Baris 2228 | Ditambahkan balasan (simetri) |
| 2674 | Turki | Armenia | Baris 2229 | Ditambahkan balasan (simetri) |
| 2675 | Turki | Australia | Baris 2230 | Ditambahkan balasan (simetri) |
| 2676 | Turki | Austria | Baris 2231 | Ditambahkan balasan (simetri) |
| 2677 | Turki | Bahama | Baris 2232 | Ditambahkan balasan (simetri) |
| 2678 | Turki | Bahrain | Baris 2233 | Ditambahkan balasan (simetri) |
| 2679 | Turki | Barbados | Baris 2234 | Ditambahkan balasan (simetri) |
| 2680 | Turki | Belanda | Baris 2235 | Ditambahkan balasan (simetri) |
| 2681 | Turki | Belgia | Baris 2236 | Ditambahkan balasan (simetri) |
| 2682 | Turki | Benin | Baris 2237 | Ditambahkan balasan (simetri) |
| 2683 | Turki | Bermuda | Baris 2238 | Ditambahkan balasan (simetri) |
| 2684 | Turki | Bhutan | Baris 2239 | Ditambahkan balasan (simetri) |
| 2685 | Turki | Bolivia | Baris 2240 | Ditambahkan balasan (simetri) |
| 2686 | Turki | Brunei | Baris 2241 | Ditambahkan balasan (simetri) |
| 2687 | Turkmenistan | Afrika Selatan | Baris 1489 | Ditambahkan balasan (simetri) |
| 2688 | Turkmenistan | Albania | Baris 1490 | Ditambahkan balasan (simetri) |
| 2689 | Turkmenistan | Aljazair | Baris 1491 | Ditambahkan balasan (simetri) |
| 2690 | Turkmenistan | Amerika Serikat | Baris 1492 | Ditambahkan balasan (simetri) |
| 2691 | Turkmenistan | Andorra | Baris 1493 | Ditambahkan balasan (simetri) |
| 2692 | Turkmenistan | Antigua dan Barbuda | Baris 1494 | Ditambahkan balasan (simetri) |
| 2693 | Turkmenistan | Arab Saudi | Baris 1495 | Ditambahkan balasan (simetri) |
| 2694 | Turkmenistan | Argentina | Baris 1496 | Ditambahkan balasan (simetri) |
| 2695 | Turkmenistan | Armenia | Baris 1497 | Ditambahkan balasan (simetri) |
| 2696 | Turkmenistan | Austria | Baris 1498 | Ditambahkan balasan (simetri) |
| 2697 | Turkmenistan | Azerbaijan | Baris 1499 | Ditambahkan balasan (simetri) |
| 2698 | Turkmenistan | Bahama | Baris 1500 | Ditambahkan balasan (simetri) |
| 2699 | Turkmenistan | Belanda | Baris 1501 | Ditambahkan balasan (simetri) |
| 2700 | Turkmenistan | Belgia | Baris 1502 | Ditambahkan balasan (simetri) |
| 2701 | Turkmenistan | Belize | Baris 1503 | Ditambahkan balasan (simetri) |
| 2702 | Turkmenistan | Bolivia | Baris 1504 | Ditambahkan balasan (simetri) |
| 2703 | Turkmenistan | Bosnia dan Hercegovina | Baris 1505 | Ditambahkan balasan (simetri) |
| 2704 | Turkmenistan | Botswana | Baris 1506 | Ditambahkan balasan (simetri) |
| 2705 | Turkmenistan | Brunei | Baris 1507 | Ditambahkan balasan (simetri) |
| 2706 | Tuvalu | Afganistan | Baris 2918 | Ditambahkan balasan (simetri) |
| 2707 | Tuvalu | Afrika Selatan | Baris 2919 | Ditambahkan balasan (simetri) |
| 2708 | Tuvalu | Albania | Baris 2920 | Ditambahkan balasan (simetri) |
| 2709 | Tuvalu | Amerika Serikat | Baris 2921 | Ditambahkan balasan (simetri) |
| 2710 | Tuvalu | Andorra | Baris 2922 | Ditambahkan balasan (simetri) |
| 2711 | Tuvalu | Angola | Baris 2923 | Ditambahkan balasan (simetri) |
| 2712 | Tuvalu | Antigua dan Barbuda | Baris 2924 | Ditambahkan balasan (simetri) |
| 2713 | Tuvalu | Arab Saudi | Baris 2925 | Ditambahkan balasan (simetri) |
| 2714 | Tuvalu | Argentina | Baris 2926 | Ditambahkan balasan (simetri) |
| 2715 | Tuvalu | Armenia | Baris 2927 | Ditambahkan balasan (simetri) |
| 2716 | Tuvalu | Australia | Baris 2928 | Ditambahkan balasan (simetri) |
| 2717 | Tuvalu | Azerbaijan | Baris 2929 | Ditambahkan balasan (simetri) |
| 2718 | Tuvalu | Bahama | Baris 2930 | Ditambahkan balasan (simetri) |
| 2719 | Tuvalu | Bangladesh | Baris 2931 | Ditambahkan balasan (simetri) |
| 2720 | Tuvalu | Belarus | Baris 2932 | Ditambahkan balasan (simetri) |
| 2721 | Tuvalu | Belgia | Baris 2933 | Ditambahkan balasan (simetri) |
| 2722 | Tuvalu | Belize | Baris 2934 | Ditambahkan balasan (simetri) |
| 2723 | Tuvalu | Bolivia | Baris 2935 | Ditambahkan balasan (simetri) |
| 2724 | Tuvalu | Brazil | Baris 2936 | Ditambahkan balasan (simetri) |
| 2725 | Tuvalu | Brunei | Baris 2937 | Ditambahkan balasan (simetri) |
| 2726 | Ukraina | Afrika Selatan | Baris 2242 | Ditambahkan balasan (simetri) |
| 2727 | Ukraina | Aljazair | Baris 2243 | Ditambahkan balasan (simetri) |
| 2728 | Ukraina | Amerika Serikat | Baris 2244 | Ditambahkan balasan (simetri) |
| 2729 | Ukraina | Andorra | Baris 2245 | Ditambahkan balasan (simetri) |
| 2730 | Ukraina | Angola | Baris 2246 | Ditambahkan balasan (simetri) |
| 2731 | Ukraina | Antigua dan Barbuda | Baris 2247 | Ditambahkan balasan (simetri) |
| 2732 | Ukraina | Armenia | Baris 2248 | Ditambahkan balasan (simetri) |
| 2733 | Ukraina | Barbados | Baris 2249 | Ditambahkan balasan (simetri) |
| 2734 | Ukraina | Belanda | Baris 2250 | Ditambahkan balasan (simetri) |
| 2735 | Ukraina | Belgia | Baris 2251 | Ditambahkan balasan (simetri) |
| 2736 | Ukraina | Bosnia dan Hercegovina | Baris 2252 | Ditambahkan balasan (simetri) |
| 2737 | Uni Emirat Arab | Afrika Selatan | Baris 1508 | Ditambahkan balasan (simetri) |
| 2738 | Uni Emirat Arab | Aljazair | Baris 1509 | Ditambahkan balasan (simetri) |
| 2739 | Uni Emirat Arab | Amerika Serikat | Baris 1510 | Ditambahkan balasan (simetri) |
| 2740 | Uni Emirat Arab | Andorra | Baris 1511 | Ditambahkan balasan (simetri) |
| 2741 | Uni Emirat Arab | Antigua dan Barbuda | Baris 1512 | Ditambahkan balasan (simetri) |
| 2742 | Uni Emirat Arab | Arab Saudi | Baris 1513 | Ditambahkan balasan (simetri) |
| 2743 | Uni Emirat Arab | Argentina | Baris 1514 | Ditambahkan balasan (simetri) |
| 2744 | Uni Emirat Arab | Bangladesh | Baris 1515 | Ditambahkan balasan (simetri) |
| 2745 | Uni Emirat Arab | Barbados | Baris 1516 | Ditambahkan balasan (simetri) |
| 2746 | Uni Emirat Arab | Belarus | Baris 1517 | Ditambahkan balasan (simetri) |
| 2747 | Uni Emirat Arab | Belgia | Baris 1518 | Ditambahkan balasan (simetri) |
| 2748 | Uni Emirat Arab | Bermuda | Baris 1519 | Ditambahkan balasan (simetri) |
| 2749 | Uni Emirat Arab | Brazil | Baris 1523 | Ditambahkan balasan (simetri) |
| 2750 | Uruguay | Afganistan | Baris 3108 | Ditambahkan balasan (simetri) |
| 2751 | Uruguay | Antigua dan Barbuda | Baris 3109 | Ditambahkan balasan (simetri) |
| 2752 | Uruguay | Australia | Baris 3110 | Ditambahkan balasan (simetri) |
| 2753 | Uruguay | Bahama | Baris 3111 | Ditambahkan balasan (simetri) |
| 2754 | Uruguay | Belanda | Baris 3112 | Ditambahkan balasan (simetri) |
| 2755 | Uruguay | Belarus | Baris 3113 | Ditambahkan balasan (simetri) |
| 2756 | Uruguay | Belize | Baris 3114 | Ditambahkan balasan (simetri) |
| 2757 | Uruguay | Benin | Baris 3115 | Ditambahkan balasan (simetri) |
| 2758 | Uruguay | Bermuda | Baris 3116 | Ditambahkan balasan (simetri) |
| 2759 | Uruguay | Brazil | Baris 3117 | Ditambahkan balasan (simetri) |
| 2760 | Uzbekistan | Afganistan | Baris 1524 | Ditambahkan balasan (simetri) |
| 2761 | Uzbekistan | Afrika Selatan | Baris 1525 | Ditambahkan balasan (simetri) |
| 2762 | Uzbekistan | Amerika Serikat | Baris 1526 | Ditambahkan balasan (simetri) |
| 2763 | Uzbekistan | Antigua dan Barbuda | Baris 1527 | Ditambahkan balasan (simetri) |
| 2764 | Uzbekistan | Arab Saudi | Baris 1528 | Ditambahkan balasan (simetri) |
| 2765 | Uzbekistan | Armenia | Baris 1529 | Ditambahkan balasan (simetri) |
| 2766 | Uzbekistan | Australia | Baris 1530 | Ditambahkan balasan (simetri) |
| 2767 | Uzbekistan | Bahama | Baris 1531 | Ditambahkan balasan (simetri) |
| 2768 | Uzbekistan | Bahrain | Baris 1532 | Ditambahkan balasan (simetri) |
| 2769 | Uzbekistan | Bangladesh | Baris 1533 | Ditambahkan balasan (simetri) |
| 2770 | Uzbekistan | Belanda | Baris 1534 | Ditambahkan balasan (simetri) |
| 2771 | Uzbekistan | Belgia | Baris 1535 | Ditambahkan balasan (simetri) |
| 2772 | Uzbekistan | Bermuda | Baris 1536 | Ditambahkan balasan (simetri) |
| 2773 | Uzbekistan | Bhutan | Baris 1537 | Ditambahkan balasan (simetri) |
| 2774 | Uzbekistan | Brazil | Baris 1538 | Ditambahkan balasan (simetri) |
| 2775 | Uzbekistan | Brunei | Baris 1539 | Ditambahkan balasan (simetri) |
| 2776 | Vanuatu | Afrika Selatan | Baris 2938 | Ditambahkan balasan (simetri) |
| 2777 | Vanuatu | Albania | Baris 2939 | Ditambahkan balasan (simetri) |
| 2778 | Vanuatu | Antigua dan Barbuda | Baris 2940 | Ditambahkan balasan (simetri) |
| 2779 | Vanuatu | Arab Saudi | Baris 2941 | Ditambahkan balasan (simetri) |
| 2780 | Vanuatu | Argentina | Baris 2942 | Ditambahkan balasan (simetri) |
| 2781 | Vanuatu | Bahrain | Baris 2943 | Ditambahkan balasan (simetri) |
| 2782 | Vanuatu | Bangladesh | Baris 2944 | Ditambahkan balasan (simetri) |
| 2783 | Vanuatu | Belarus | Baris 2945 | Ditambahkan balasan (simetri) |
| 2784 | Vanuatu | Belgia | Baris 2946 | Ditambahkan balasan (simetri) |
| 2785 | Vanuatu | Belize | Baris 2947 | Ditambahkan balasan (simetri) |
| 2786 | Vanuatu | Benin | Baris 2948 | Ditambahkan balasan (simetri) |
| 2787 | Vanuatu | Bosnia dan Hercegovina | Baris 2949 | Ditambahkan balasan (simetri) |
| 2788 | Vanuatu | Brunei | Baris 2950 | Ditambahkan balasan (simetri) |
| 2789 | Vatikan | Afganistan | Baris 2253 | Ditambahkan balasan (simetri) |
| 2790 | Vatikan | Afrika Selatan | Baris 2254 | Ditambahkan balasan (simetri) |
| 2791 | Vatikan | Antigua dan Barbuda | Baris 2255 | Ditambahkan balasan (simetri) |
| 2792 | Vatikan | Argentina | Baris 2256 | Ditambahkan balasan (simetri) |
| 2793 | Vatikan | Australia | Baris 2257 | Ditambahkan balasan (simetri) |
| 2794 | Vatikan | Azerbaijan | Baris 2258 | Ditambahkan balasan (simetri) |
| 2795 | Vatikan | Bahama | Baris 2259 | Ditambahkan balasan (simetri) |
| 2796 | Vatikan | Barbados | Baris 2260 | Ditambahkan balasan (simetri) |
| 2797 | Vatikan | Benin | Baris 2261 | Ditambahkan balasan (simetri) |
| 2798 | Vatikan | Bolivia | Baris 2262 | Ditambahkan balasan (simetri) |
| 2799 | Vatikan | Bosnia dan Hercegovina | Baris 2263 | Ditambahkan balasan (simetri) |
| 2800 | Vatikan | Botswana | Baris 2264 | Ditambahkan balasan (simetri) |
| 2801 | Venezuela | Afrika Selatan | Baris 3118 | Ditambahkan balasan (simetri) |
| 2802 | Venezuela | Albania | Baris 3119 | Ditambahkan balasan (simetri) |
| 2803 | Venezuela | Aljazair | Baris 3120 | Ditambahkan balasan (simetri) |
| 2804 | Venezuela | Angola | Baris 3121 | Ditambahkan balasan (simetri) |
| 2805 | Venezuela | Arab Saudi | Baris 3122 | Ditambahkan balasan (simetri) |
| 2806 | Venezuela | Azerbaijan | Baris 3123 | Ditambahkan balasan (simetri) |
| 2807 | Venezuela | Bahama | Baris 3124 | Ditambahkan balasan (simetri) |
| 2808 | Venezuela | Barbados | Baris 3125 | Ditambahkan balasan (simetri) |
| 2809 | Venezuela | Belanda | Baris 3126 | Ditambahkan balasan (simetri) |
| 2810 | Venezuela | Belarus | Baris 3127 | Ditambahkan balasan (simetri) |
| 2811 | Venezuela | Belgia | Baris 3128 | Ditambahkan balasan (simetri) |
| 2812 | Venezuela | Benin | Baris 3129 | Ditambahkan balasan (simetri) |
| 2813 | Venezuela | Bhutan | Baris 3130 | Ditambahkan balasan (simetri) |
| 2814 | Venezuela | Bosnia dan Hercegovina | Baris 3131 | Ditambahkan balasan (simetri) |
| 2815 | Venezuela | Brazil | Baris 3132 | Ditambahkan balasan (simetri) |
| 2816 | Venezuela | Brunei | Baris 3133 | Ditambahkan balasan (simetri) |
| 2817 | Vietnam | Afrika Selatan | Baris 1540 | Ditambahkan balasan (simetri) |
| 2818 | Vietnam | Amerika Serikat | Baris 1541 | Ditambahkan balasan (simetri) |
| 2819 | Vietnam | Austria | Baris 1542 | Ditambahkan balasan (simetri) |
| 2820 | Vietnam | Bahama | Baris 1543 | Ditambahkan balasan (simetri) |
| 2821 | Vietnam | Barbados | Baris 1544 | Ditambahkan balasan (simetri) |
| 2822 | Vietnam | Belanda | Baris 1545 | Ditambahkan balasan (simetri) |
| 2823 | Vietnam | Belarus | Baris 1546 | Ditambahkan balasan (simetri) |
| 2824 | Vietnam | Bhutan | Baris 1547 | Ditambahkan balasan (simetri) |
| 2825 | Vietnam | Bolivia | Baris 1548 | Ditambahkan balasan (simetri) |
| 2826 | Vietnam | Bosnia dan Hercegovina | Baris 1549 | Ditambahkan balasan (simetri) |
| 2827 | Vietnam | Brazil | Baris 1550 | Ditambahkan balasan (simetri) |
| 2828 | Yaman | Afganistan | Baris 1551 | Ditambahkan balasan (simetri) |
| 2829 | Yaman | Afrika Selatan | Baris 1552 | Ditambahkan balasan (simetri) |
| 2830 | Yaman | Aljazair | Baris 1553 | Ditambahkan balasan (simetri) |
| 2831 | Yaman | Amerika Serikat | Baris 1554 | Ditambahkan balasan (simetri) |
| 2832 | Yaman | Antigua dan Barbuda | Baris 1555 | Ditambahkan balasan (simetri) |
| 2833 | Yaman | Arab Saudi | Baris 1556 | Ditambahkan balasan (simetri) |
| 2834 | Yaman | Argentina | Baris 1557 | Ditambahkan balasan (simetri) |
| 2835 | Yaman | Armenia | Baris 1558 | Ditambahkan balasan (simetri) |
| 2836 | Yaman | Australia | Baris 1559 | Ditambahkan balasan (simetri) |
| 2837 | Yaman | Austria | Baris 1560 | Ditambahkan balasan (simetri) |
| 2838 | Yaman | Barbados | Baris 1561 | Ditambahkan balasan (simetri) |
| 2839 | Yaman | Belanda | Baris 1562 | Ditambahkan balasan (simetri) |
| 2840 | Yaman | Belarus | Baris 1563 | Ditambahkan balasan (simetri) |
| 2841 | Yaman | Belgia | Baris 1564 | Ditambahkan balasan (simetri) |
| 2842 | Yaman | Benin | Baris 1565 | Ditambahkan balasan (simetri) |
| 2843 | Yaman | Bermuda | Baris 1566 | Ditambahkan balasan (simetri) |
| 2844 | Yaman | Bhutan | Baris 1567 | Ditambahkan balasan (simetri) |
| 2845 | Yaman | Brazil | Baris 1568 | Ditambahkan balasan (simetri) |
| 2846 | Yordania | Afrika Selatan | Baris 1569 | Ditambahkan balasan (simetri) |
| 2847 | Yordania | Aljazair | Baris 1570 | Ditambahkan balasan (simetri) |
| 2848 | Yordania | Angola | Baris 1571 | Ditambahkan balasan (simetri) |
| 2849 | Yordania | Argentina | Baris 1572 | Ditambahkan balasan (simetri) |
| 2850 | Yordania | Australia | Baris 1573 | Ditambahkan balasan (simetri) |
| 2851 | Yordania | Azerbaijan | Baris 1574 | Ditambahkan balasan (simetri) |
| 2852 | Yordania | Bahrain | Baris 1575 | Ditambahkan balasan (simetri) |
| 2853 | Yordania | Barbados | Baris 1576 | Ditambahkan balasan (simetri) |
| 2854 | Yordania | Belarus | Baris 1577 | Ditambahkan balasan (simetri) |
| 2855 | Yordania | Belgia | Baris 1578 | Ditambahkan balasan (simetri) |
| 2856 | Yordania | Belize | Baris 1579 | Ditambahkan balasan (simetri) |
| 2857 | Yordania | Bolivia | Baris 1580 | Ditambahkan balasan (simetri) |
| 2858 | Yordania | Brazil | Baris 1581 | Ditambahkan balasan (simetri) |
| 2859 | Yunani | Afganistan | Baris 2265 | Ditambahkan balasan (simetri) |
| 2860 | Yunani | Amerika Serikat | Baris 2266 | Ditambahkan balasan (simetri) |
| 2861 | Yunani | Andorra | Baris 2267 | Ditambahkan balasan (simetri) |
| 2862 | Yunani | Angola | Baris 2268 | Ditambahkan balasan (simetri) |
| 2863 | Yunani | Antigua dan Barbuda | Baris 2269 | Ditambahkan balasan (simetri) |
| 2864 | Yunani | Arab Saudi | Baris 2270 | Ditambahkan balasan (simetri) |
| 2865 | Yunani | Armenia | Baris 2271 | Ditambahkan balasan (simetri) |
| 2866 | Yunani | Australia | Baris 2272 | Ditambahkan balasan (simetri) |
| 2867 | Yunani | Austria | Baris 2273 | Ditambahkan balasan (simetri) |
| 2868 | Yunani | Barbados | Baris 2274 | Ditambahkan balasan (simetri) |
| 2869 | Yunani | Belanda | Baris 2275 | Ditambahkan balasan (simetri) |
| 2870 | Yunani | Belarus | Baris 2276 | Ditambahkan balasan (simetri) |
| 2871 | Yunani | Belgia | Baris 2277 | Ditambahkan balasan (simetri) |
| 2872 | Yunani | Belize | Baris 2278 | Ditambahkan balasan (simetri) |
| 2873 | Yunani | Benin | Baris 2279 | Ditambahkan balasan (simetri) |
| 2874 | Yunani | Bosnia dan Hercegovina | Baris 2280 | Ditambahkan balasan (simetri) |
| 2875 | Yunani | Brazil | Baris 2281 | Ditambahkan balasan (simetri) |
| 2876 | Yunani | Brunei | Baris 2282 | Ditambahkan balasan (simetri) |

