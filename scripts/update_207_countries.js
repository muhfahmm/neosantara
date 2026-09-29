const fs = require('fs');
const path = require('path');

const targetList = [
  { name: 'Amerika Serikat', net: 1200 },
  { name: 'China', net: 1190 },
  { name: 'Jerman', net: 1180 },
  { name: 'Jepang', net: 1170 },
  { name: 'Inggris', net: 1160 },
  { name: 'India', net: 1150 },
  { name: 'Prancis', net: 1140 },
  { name: 'Italia', net: 1130 },
  { name: 'Rusia', net: 1120 },
  { name: 'Brazil', net: 1110 },
  { name: 'Kanada', net: 1100 },
  { name: 'Australia', net: 1090 },
  { name: 'Meksiko', net: 1080 },
  { name: 'Spanyol', net: 1070 },
  { name: 'Korea Selatan', net: 1060 },
  { name: 'Turki', net: 1050 },
  { name: 'Indonesia', net: 1040 },
  { name: 'Belanda', net: 1030 },
  { name: 'Arab Saudi', net: 1020 },
  { name: 'Swiss', net: 1010 },
  { name: 'Polandia', net: 1000 },
  { name: 'Taiwan', net: 990 },
  { name: 'Irlandia', net: 980 },
  { name: 'Belgia', net: 970 },
  { name: 'Swedia', net: 960 },
  { name: 'Israel', net: 950 },
  { name: 'Argentina', net: 940 },
  { name: 'Singapura', net: 930 },
  { name: 'Austria', net: 920 },
  { name: 'Uni Emirat Arab', net: 910 },
  { name: 'Norwegia', net: 900 },
  { name: 'Thailand', net: 897 },
  { name: 'Kolombia', net: 894 },
  { name: 'Vietnam', net: 891 },
  { name: 'Malaysia', net: 888 },
  { name: 'Filipina', net: 885 },
  { name: 'Bangladesh', net: 882 },
  { name: 'Denmark', net: 879 },
  { name: 'Republik Rumania', net: 876 },
  { name: 'Afrika Selatan', net: 873 },
  { name: 'Pakistan', net: 870 },
  { name: 'Hong Kong', net: 867 },
  { name: 'Ceko', net: 864 },
  { name: 'Mesir', net: 861 },
  { name: 'Chile', net: 858 },
  { name: 'Peru', net: 855 },
  { name: 'Portugal', net: 852 },
  { name: 'Nigeria', net: 849 },
  { name: 'Kazakhstan', net: 846 },
  { name: 'Finlandia', net: 843 },
  { name: 'Aljazair', net: 840 },
  { name: 'Yunani', net: 837 },
  { name: 'Iran', net: 834 },
  { name: 'Selandia Baru', net: 831 },
  { name: 'Hungaria', net: 828 },
  { name: 'Irak', net: 825 },
  { name: 'Ukraina', net: 822 },
  { name: 'Qatar', net: 819 },
  { name: 'Maroko', net: 816 },
  { name: 'Uzbekistan', net: 813 },
  { name: 'Kuwait', net: 810 },
  { name: 'Slowakia', net: 807 },
  { name: 'Angola', net: 804 },
  { name: 'Bulgaria', net: 801 },
  { name: 'Kenya', net: 798 },
  { name: 'Ekuador', net: 795 },
  { name: 'Republik Dominika', net: 792 },
  { name: 'Puerto Rico', net: 789 },
  { name: 'Guatemala', net: 786 },
  { name: 'Republik Demokratik Kongo', net: 783 },
  { name: 'Ethiopia', net: 780 },
  { name: 'Ghana', net: 777 },
  { name: 'Oman', net: 774 },
  { name: 'Kroasia', net: 771 },
  { name: 'Pantai Gading', net: 768 },
  { name: 'Republik Serbia', net: 765 },
  { name: 'Venezuela', net: 762 },
  { name: 'Luksemburg', net: 759 },
  { name: 'Costa Rica', net: 756 },
  { name: 'Kuba', net: 753 },
  { name: 'Lithuania', net: 750 },
  { name: 'Belarus', net: 747 },
  { name: 'Sri Lanka', net: 744 },
  { name: 'Uruguay', net: 741 },
  { name: 'Panama', net: 738 },
  { name: 'Republik Tanzania', net: 735 },
  { name: 'Slovenia', net: 732 },
  { name: 'Myanmar', net: 729 },
  { name: 'Turkmenistan', net: 726 },
  { name: 'Bolivia', net: 723 },
  { name: 'Azerbaijan', net: 720 },
  { name: 'Republik Uganda', net: 717 },
  { name: 'Kamerun', net: 714 },
  { name: 'Yordania', net: 711 },
  { name: 'Tunisia', net: 708 },
  { name: 'Paraguay', net: 705 },
  { name: 'Suriah', net: 702 },
  { name: 'Republik Zimbabwe', net: 699 },
  { name: 'Makau', net: 696 },
  { name: 'Latvia', net: 693 },
  { name: 'Libya', net: 690 },
  { name: 'Kamboja', net: 687 },
  { name: 'Estonia', net: 684 },
  { name: 'Bahrain', net: 681 },
  { name: 'Nepal', net: 678 },
  { name: 'Siprus', net: 675 },
  { name: 'Republik Sudan', net: 672 },
  { name: 'Islandia', net: 669 },
  { name: 'Georgia', net: 666 },
  { name: 'Honduras', net: 663 },
  { name: 'Republik Zambia', net: 660 },
  { name: 'Senegal', net: 657 },
  { name: 'El Salvador', net: 654 },
  { name: 'Haiti', net: 651 },
  { name: 'Bosnia dan Herzegovina', net: 648 },
  { name: 'Lebanon', net: 645 },
  { name: 'Papua Nugini', net: 642 },
  { name: 'Guyana', net: 639 },
  { name: 'Mali', net: 636 },
  { name: 'Albania', net: 633 },
  { name: 'Burkina Faso', net: 630 },
  { name: 'Armenia', net: 627 },
  { name: 'Malta', net: 624 },
  { name: 'Guinea', net: 621 },
  { name: 'Mongolia', net: 618 },
  { name: 'Benin', net: 615 },
  { name: 'Trinidad dan Tobago', net: 612 },
  { name: 'Chad', net: 609 },
  { name: 'Niger', net: 606 },
  { name: 'Nikaragua', net: 603 },
  { name: 'Kirgizstan', net: 400 },
  { name: 'Gabon', net: 395 },
  { name: 'Mozambik', net: 390 },
  { name: 'Jamaika', net: 385 },
  { name: 'Botswana', net: 380 },
  { name: 'Moldova', net: 375 },
  { name: 'Makedonia Utara', net: 370 },
  { name: 'Madagaskar', net: 365 },
  { name: 'Tajikistan', net: 360 },
  { name: 'Afganistan', net: 355 },
  { name: 'Laos', net: 350 },
  { name: 'Malawi', net: 345 },
  { name: 'Rwanda', net: 340 },
  { name: 'Namibia', net: 335 },
  { name: 'Korea Utara', net: 330 },
  { name: 'Mauritius', net: 325 },
  { name: 'Bahama', net: 320 },
  { name: 'Kongo', net: 315 },
  { name: 'Brunei', net: 310 },
  { name: 'Palestina', net: 305 },
  { name: 'Mauritania', net: 300 },
  { name: 'Somalia', net: 295 },
  { name: 'Kosovo', net: 290 },
  { name: 'Togo', net: 285 },
  { name: 'Monako', net: 280 },
  { name: 'Montenegro', net: 275 },
  { name: 'Liechtenstein', net: 270 },
  { name: 'Bermuda', net: 265 },
  { name: 'Barbados', net: 260 },
  { name: 'Sierra Leone', net: 255 },
  { name: 'Burundi', net: 250 },
  { name: 'Maldives', net: 245 },
  { name: 'Yaman', net: 240 },
  { name: 'Guam', net: 235 },
  { name: 'Fiji', net: 230 },
  { name: 'Tahiti', net: 225 },
  { name: 'Sudan Selatan', net: 220 },
  { name: 'Suriname', net: 215 },
  { name: 'Eswatini', net: 210 },
  { name: 'Guiana Prancis', net: 205 },
  { name: 'Liberia', net: 200 },
  { name: 'Andorra', net: 195 },
  { name: 'Djibouti', net: 190 },
  { name: 'Kepulauan Faroe', net: 185 },
  { name: 'Bhutan', net: 180 },
  { name: 'Curacao', net: 175 },
  { name: 'Republik Afrika Tengah', net: 170 },
  { name: 'Belize', net: 165 },
  { name: 'Tanjung Verde', net: 160 },
  { name: 'Greenland', net: 155 },
  { name: 'Guinea Bissau', net: 150 },
  { name: 'Lesotho', net: 145 },
  { name: 'Gambia', net: 140 },
  { name: 'Saint Lucia', net: 135 },
  { name: 'San Marino', net: 130 },
  { name: 'Antigua dan Barbuda', net: 125 },
  { name: 'Gibraltar', net: 120 },
  { name: 'Seychelles', net: 115 },
  { name: 'Republik Timor Leste', net: 110 },
  { name: 'Eritrea', net: 105 },
  { name: 'Komoro', net: 100 },
  { name: 'Grenada', net: 95 },
  { name: 'Vanuatu', net: 90 },
  { name: 'Samoa', net: 85 },
  { name: 'Saint Vincent dan Grenadine', net: 80 },
  { name: 'Sao Tome dan Principe', net: 75 },
  { name: 'Saint Kitts dan Nevis', net: 70 },
  { name: 'Samoa Amerika', net: 65 },
  { name: 'Dominika', net: 60 },
  { name: 'Tonga', net: 55 },
  { name: 'Mikronesia', net: 50 },
  { name: 'Kiribati', net: 45 },
  { name: 'Palau', net: 40 },
  { name: 'Marshall', net: 35 },
  { name: 'Nauru', net: 30 },
  { name: 'Tuvalu', net: 25 },
  { name: 'Vatikan', net: 20 }
];

const SQL_PAJAK_PATH = path.join(__dirname, '../json/database_pajak_negara/database_pajak_negara.sql');
const SQL_KABINET_PATH = path.join(__dirname, '../json/database_level_kabinet/database_level_kabinet.sql');

const sqlPajak = fs.readFileSync(SQL_PAJAK_PATH, 'utf-8');
const sqlKabinet = fs.readFileSync(SQL_KABINET_PATH, 'utf-8');

const rowPajakRegex = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/g;
let m;
const pajakMap = new Map();
while ((m = rowPajakRegex.exec(sqlPajak)) !== null) {
  pajakMap.set(m[3], {
    id: parseInt(m[1]),
    country: m[2],
    slug: m[3],
    ppn: parseInt(m[4]),
    korporasi: parseInt(m[5]),
    penghasilan: parseInt(m[6]),
    bea_cukai: parseInt(m[7]),
    lingkungan: parseInt(m[8]),
  });
}

const rowKabinetRegex = /\(\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,([\d\s,]+)\)/g;
const kabinetMap = new Map();
while ((m = rowKabinetRegex.exec(sqlKabinet)) !== null) {
  const levels = m[4].split(',').map(x => parseInt(x.trim()));
  kabinetMap.set(m[3], {
    id: parseInt(m[1]),
    country: m[2],
    slug: m[3],
    levels
  });
}

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

targetList.forEach(target => {
  let matchedSlug = null;
  for (const [slug, item] of pajakMap.entries()) {
    if (norm(item.country) === norm(target.name) || norm(slug) === norm(target.name)) {
      matchedSlug = slug;
      break;
    }
  }
  if (!matchedSlug && norm(target.name).includes('bosnia')) matchedSlug = 'bosnia_dan_hercegovina';
  if (!matchedSlug) return;

  const pItem = pajakMap.get(matchedSlug);

  // Cost estimate: Kabinet 220, Subsidy 180 = 400 Total Cost
  // Target Net = Tax - 400 => Tax Sum = (Target Net + 400) / 10
  let targetTaxRateSum = Math.round((target.net + 400) / 10);
  
  let remaining = targetTaxRateSum;
  let ppn = Math.min(60, Math.floor(remaining * 0.25));
  remaining -= ppn;
  let korporasi = Math.min(60, Math.floor(remaining * 0.30));
  remaining -= korporasi;
  let penghasilan = Math.min(60, Math.floor(remaining * 0.30));
  remaining -= penghasilan;
  let bea_cukai = Math.min(40, Math.floor(remaining * 0.65));
  remaining -= bea_cukai;
  let lingkungan = Math.max(0, remaining);

  if (lingkungan > 60) {
    let excess = lingkungan - 60;
    lingkungan = 60;
    ppn += excess;
  }

  pItem.ppn = ppn;
  pItem.korporasi = korporasi;
  pItem.penghasilan = penghasilan;
  pItem.bea_cukai = bea_cukai;
  pItem.lingkungan = lingkungan;

  pajakMap.set(matchedSlug, pItem);
});

// Re-generate SQL Pajak Content
let newPajakSql = `DROP TABLE IF EXISTS database_pajak_negara;
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
`;

const pajakArray = Array.from(pajakMap.values()).sort((a, b) => a.id - b.id);
const pajakLines = pajakArray.map(item => 
  `    (${item.id}, '${item.country}', '${item.slug}', ${item.ppn}, ${item.korporasi}, ${item.penghasilan}, ${item.bea_cukai}, ${item.lingkungan})`
);

newPajakSql += pajakLines.join(',\n') + ';\n';
fs.writeFileSync(SQL_PAJAK_PATH, newPajakSql, 'utf-8');
console.log('✅ Success write updated database_pajak_negara.sql');
