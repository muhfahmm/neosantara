// Auto-generated tourism dataset from database_tempat_wisata.pg.sql

export interface TempatWisataItem {
  id: number;
  nama_wisata: string;
  penghasilan: number;
}

export interface CountryTourismSummary {
  country_slug: string;
  total_penghasilan: number;
  total_tempat_wisata: number;
  items: TempatWisataItem[];
}

export const TOURISM_DATA_BY_SLUG: Record<string, CountryTourismSummary> = {
  "afrika_selatan": {
    "country_slug": "afrika_selatan",
    "total_penghasilan": 272,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 1,
        "nama_wisata": "Taman Nasional Kruger",
        "penghasilan": 84
      },
      {
        "id": 2,
        "nama_wisata": "Cape Point",
        "penghasilan": 74
      },
      {
        "id": 3,
        "nama_wisata": "Meja Pegunungan",
        "penghasilan": 66
      },
      {
        "id": 4,
        "nama_wisata": "Pantai Batu Karang",
        "penghasilan": 48
      }
    ]
  },
  "aljazair": {
    "country_slug": "aljazair",
    "total_penghasilan": 146,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 5,
        "nama_wisata": "Kasbah Aljazair",
        "penghasilan": 58
      },
      {
        "id": 6,
        "nama_wisata": "Tassili n'Ajjer",
        "penghasilan": 48
      },
      {
        "id": 7,
        "nama_wisata": "Kota Timgad Kuno",
        "penghasilan": 40
      }
    ]
  },
  "angola": {
    "country_slug": "angola",
    "total_penghasilan": 74,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 8,
        "nama_wisata": "Mukungwe Falls",
        "penghasilan": 32
      },
      {
        "id": 9,
        "nama_wisata": "Taman Iona",
        "penghasilan": 22
      },
      {
        "id": 10,
        "nama_wisata": "Pulau Luanda",
        "penghasilan": 14
      },
      {
        "id": 11,
        "nama_wisata": "Belas Fortress",
        "penghasilan": 6
      }
    ]
  },
  "benin": {
    "country_slug": "benin",
    "total_penghasilan": 102,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 12,
        "nama_wisata": "Istana Kerajaan Abomey",
        "penghasilan": 48
      },
      {
        "id": 13,
        "nama_wisata": "Danau Nokoue",
        "penghasilan": 30
      },
      {
        "id": 14,
        "nama_wisata": "Taman Nasional Pendjari",
        "penghasilan": 24
      }
    ]
  },
  "botswana": {
    "country_slug": "botswana",
    "total_penghasilan": 249,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 15,
        "nama_wisata": "Delta Okavango",
        "penghasilan": 92
      },
      {
        "id": 16,
        "nama_wisata": "Taman Nasional Chobe",
        "penghasilan": 74
      },
      {
        "id": 17,
        "nama_wisata": "Mokolodi Game Reserve",
        "penghasilan": 51
      },
      {
        "id": 18,
        "nama_wisata": "Laut Pasir Kalahari",
        "penghasilan": 32
      }
    ]
  },
  "burkina_faso": {
    "country_slug": "burkina_faso",
    "total_penghasilan": 42,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 19,
        "nama_wisata": "Kaskade de Karfiguéla",
        "penghasilan": 22
      },
      {
        "id": 20,
        "nama_wisata": "Taman Nasional Arli",
        "penghasilan": 14
      },
      {
        "id": 21,
        "nama_wisata": "Pasar Ouagadougou",
        "penghasilan": 6
      }
    ]
  },
  "burundi": {
    "country_slug": "burundi",
    "total_penghasilan": 76,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 22,
        "nama_wisata": "Danau Tanganyika",
        "penghasilan": 43
      },
      {
        "id": 23,
        "nama_wisata": "Taman Nasional Kibira",
        "penghasilan": 24
      },
      {
        "id": 24,
        "nama_wisata": "Situs Kompleks Palais",
        "penghasilan": 9
      }
    ]
  },
  "cabo_verde": {
    "country_slug": "cabo_verde",
    "total_penghasilan": 136,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 25,
        "nama_wisata": "Pulau Sal",
        "penghasilan": 58
      },
      {
        "id": 26,
        "nama_wisata": "Pantai Santa Maria",
        "penghasilan": 48
      },
      {
        "id": 27,
        "nama_wisata": "Puncak Pico Telenovela",
        "penghasilan": 30
      }
    ]
  },
  "chad": {
    "country_slug": "chad",
    "total_penghasilan": 24,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 28,
        "nama_wisata": "Danau Chad",
        "penghasilan": 14
      },
      {
        "id": 29,
        "nama_wisata": "Gunung Emi Koussi",
        "penghasilan": 6
      },
      {
        "id": 30,
        "nama_wisata": "Taman Nasional Zakouma",
        "penghasilan": 4
      }
    ]
  },
  "komori": {
    "country_slug": "komori",
    "total_penghasilan": 78,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 31,
        "nama_wisata": "Pulau Grande Comore",
        "penghasilan": 37
      },
      {
        "id": 32,
        "nama_wisata": "Pantai Mitsoudje",
        "penghasilan": 24
      },
      {
        "id": 33,
        "nama_wisata": "Taman Laut Maritime",
        "penghasilan": 17
      }
    ]
  },
  "congo": {
    "country_slug": "congo",
    "total_penghasilan": 128,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 34,
        "nama_wisata": "Gorila Lembah Dzanga",
        "penghasilan": 66
      },
      {
        "id": 35,
        "nama_wisata": "Danau Lobeke",
        "penghasilan": 35
      },
      {
        "id": 36,
        "nama_wisata": "Taman Hutan Dzanga-Sangha",
        "penghasilan": 27
      }
    ]
  },
  "demokratik_kongo": {
    "country_slug": "demokratik_kongo",
    "total_penghasilan": 205,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 37,
        "nama_wisata": "Virunga National Park",
        "penghasilan": 79
      },
      {
        "id": 38,
        "nama_wisata": "Gorila Pegunungan",
        "penghasilan": 74
      },
      {
        "id": 39,
        "nama_wisata": "Air Terjun Boyoma",
        "penghasilan": 30
      },
      {
        "id": 40,
        "nama_wisata": "Taman Luar Biasa Okapi",
        "penghasilan": 22
      }
    ]
  },
  "pantai_gading": {
    "country_slug": "pantai_gading",
    "total_penghasilan": 104,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 41,
        "nama_wisata": "Taman Nasional Tai",
        "penghasilan": 48
      },
      {
        "id": 42,
        "nama_wisata": "Kastel St Jago",
        "penghasilan": 32
      },
      {
        "id": 43,
        "nama_wisata": "Pantai Grand Bassam",
        "penghasilan": 24
      }
    ]
  },
  "djibouti": {
    "country_slug": "djibouti",
    "total_penghasilan": 97,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 44,
        "nama_wisata": "Danau Asal",
        "penghasilan": 48
      },
      {
        "id": 45,
        "nama_wisata": "Gua Day Forest",
        "penghasilan": 30
      },
      {
        "id": 46,
        "nama_wisata": "Pulau Moucha",
        "penghasilan": 19
      }
    ]
  },
  "mesir": {
    "country_slug": "mesir",
    "total_penghasilan": 367,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 47,
        "nama_wisata": "Piramida Giza",
        "penghasilan": 100
      },
      {
        "id": 48,
        "nama_wisata": "Lembah Raja-Raja",
        "penghasilan": 84
      },
      {
        "id": 49,
        "nama_wisata": "Kuil Abu Simbel",
        "penghasilan": 77
      },
      {
        "id": 50,
        "nama_wisata": "Kairo Kuno",
        "penghasilan": 58
      },
      {
        "id": 51,
        "nama_wisata": "Laut Merah Dive Sites",
        "penghasilan": 48
      }
    ]
  },
  "eritrea": {
    "country_slug": "eritrea",
    "total_penghasilan": 76,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 52,
        "nama_wisata": "Pulau Dahlak",
        "penghasilan": 35
      },
      {
        "id": 53,
        "nama_wisata": "Kota Asmara Kuno",
        "penghasilan": 27
      },
      {
        "id": 54,
        "nama_wisata": "Pantai Merah",
        "penghasilan": 14
      }
    ]
  },
  "eswatini": {
    "country_slug": "eswatini",
    "total_penghasilan": 95,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 55,
        "nama_wisata": "Taman Nasional Mlilwane",
        "penghasilan": 43
      },
      {
        "id": 56,
        "nama_wisata": "Gorge Phophonyane",
        "penghasilan": 30
      },
      {
        "id": 57,
        "nama_wisata": "Taman Malolotja",
        "penghasilan": 22
      }
    ]
  },
  "ethiopia": {
    "country_slug": "ethiopia",
    "total_penghasilan": 176,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 58,
        "nama_wisata": "Addis Ababa",
        "penghasilan": 58
      },
      {
        "id": 59,
        "nama_wisata": "Danau Tana",
        "penghasilan": 48
      },
      {
        "id": 60,
        "nama_wisata": "Pegunungan Semien",
        "penghasilan": 40
      },
      {
        "id": 61,
        "nama_wisata": "Kota Aksumum Kuno",
        "penghasilan": 30
      }
    ]
  },
  "gabon": {
    "country_slug": "gabon",
    "total_penghasilan": 157,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 62,
        "nama_wisata": "Loango National Park",
        "penghasilan": 64
      },
      {
        "id": 63,
        "nama_wisata": "Ivindo National Park",
        "penghasilan": 56
      },
      {
        "id": 64,
        "nama_wisata": "Pantai Gabon",
        "penghasilan": 37
      }
    ]
  },
  "gambia": {
    "country_slug": "gambia",
    "total_penghasilan": 66,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 65,
        "nama_wisata": "Taman Nasional Kiang West",
        "penghasilan": 30
      },
      {
        "id": 66,
        "nama_wisata": "Pulau Banjul",
        "penghasilan": 22
      },
      {
        "id": 67,
        "nama_wisata": "Sungai Gambia",
        "penghasilan": 14
      }
    ]
  },
  "ghana": {
    "country_slug": "ghana",
    "total_penghasilan": 179,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 68,
        "nama_wisata": "Benteng Cape Coast",
        "penghasilan": 58
      },
      {
        "id": 69,
        "nama_wisata": "Taman Nasional Kakum",
        "penghasilan": 51
      },
      {
        "id": 70,
        "nama_wisata": "Danau Volta",
        "penghasilan": 40
      },
      {
        "id": 71,
        "nama_wisata": "Pantai Accra",
        "penghasilan": 30
      }
    ]
  },
  "guinea": {
    "country_slug": "guinea",
    "total_penghasilan": 78,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 72,
        "nama_wisata": "Pegunungan Fouta Djallon",
        "penghasilan": 37
      },
      {
        "id": 73,
        "nama_wisata": "Pulau Loos",
        "penghasilan": 24
      },
      {
        "id": 74,
        "nama_wisata": "Hutan Hujan Kindia",
        "penghasilan": 17
      }
    ]
  },
  "guinea_bissau": {
    "country_slug": "guinea_bissau",
    "total_penghasilan": 95,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 75,
        "nama_wisata": "Kepulauan Bijagos",
        "penghasilan": 48
      },
      {
        "id": 76,
        "nama_wisata": "Taman Nasional Orango",
        "penghasilan": 30
      },
      {
        "id": 77,
        "nama_wisata": "Pantai Bissau",
        "penghasilan": 17
      }
    ]
  },
  "kenya": {
    "country_slug": "kenya",
    "total_penghasilan": 309,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 78,
        "nama_wisata": "Taman Nasional Serengeti",
        "penghasilan": 95
      },
      {
        "id": 79,
        "nama_wisata": "Gunung Kenya",
        "penghasilan": 74
      },
      {
        "id": 80,
        "nama_wisata": "Pantai Mombasa",
        "penghasilan": 58
      },
      {
        "id": 81,
        "nama_wisata": "Danau Victoria",
        "penghasilan": 45
      },
      {
        "id": 82,
        "nama_wisata": "Taman Nakuru",
        "penghasilan": 37
      }
    ]
  },
  "lesotho": {
    "country_slug": "lesotho",
    "total_penghasilan": 102,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 83,
        "nama_wisata": "Pegunungan Drakensber",
        "penghasilan": 48
      },
      {
        "id": 84,
        "nama_wisata": "Air Terjun Maletsunyane",
        "penghasilan": 32
      },
      {
        "id": 85,
        "nama_wisata": "Taman Nasional Sehlabathebe",
        "penghasilan": 22
      }
    ]
  },
  "liberia": {
    "country_slug": "liberia",
    "total_penghasilan": 70,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 86,
        "nama_wisata": "Pantai Monrovia",
        "penghasilan": 32
      },
      {
        "id": 87,
        "nama_wisata": "Hutan Hujan Sapo",
        "penghasilan": 24
      },
      {
        "id": 88,
        "nama_wisata": "Pulau Bushrod",
        "penghasilan": 14
      }
    ]
  },
  "libya": {
    "country_slug": "libya",
    "total_penghasilan": 133,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 89,
        "nama_wisata": "Kota Leptis Magna",
        "penghasilan": 58
      },
      {
        "id": 90,
        "nama_wisata": "Fezzan Sahara",
        "penghasilan": 45
      },
      {
        "id": 91,
        "nama_wisata": "Pantai Tripoli",
        "penghasilan": 30
      }
    ]
  },
  "madagascar": {
    "country_slug": "madagascar",
    "total_penghasilan": 190,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 92,
        "nama_wisata": "Avenue Baobab",
        "penghasilan": 64
      },
      {
        "id": 93,
        "nama_wisata": "Taman Nasional Andasibe",
        "penghasilan": 51
      },
      {
        "id": 94,
        "nama_wisata": "Taman Nasional Tsingy",
        "penghasilan": 45
      },
      {
        "id": 95,
        "nama_wisata": "Pantai Antananarivo",
        "penghasilan": 30
      }
    ]
  },
  "malawi": {
    "country_slug": "malawi",
    "total_penghasilan": 149,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 96,
        "nama_wisata": "Danau Malawi",
        "penghasilan": 66
      },
      {
        "id": 97,
        "nama_wisata": "Taman Nasional Liwonde",
        "penghasilan": 48
      },
      {
        "id": 98,
        "nama_wisata": "Pegunungan Mulanje",
        "penghasilan": 35
      }
    ]
  },
  "mali": {
    "country_slug": "mali",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 99,
        "nama_wisata": "Kota Timbuktu",
        "penghasilan": 53
      },
      {
        "id": 100,
        "nama_wisata": "Sungai Niger",
        "penghasilan": 37
      },
      {
        "id": 101,
        "nama_wisata": "Danau Araouane",
        "penghasilan": 22
      }
    ]
  },
  "maroko": {
    "country_slug": "maroko",
    "total_penghasilan": 275,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 102,
        "nama_wisata": "Medina Fez",
        "penghasilan": 84
      },
      {
        "id": 103,
        "nama_wisata": "Atlas Berber Village",
        "penghasilan": 74
      },
      {
        "id": 104,
        "nama_wisata": "Sahara Desert",
        "penghasilan": 66
      },
      {
        "id": 105,
        "nama_wisata": "Pantai Essaouira",
        "penghasilan": 51
      }
    ]
  },
  "mauritania": {
    "country_slug": "mauritania",
    "total_penghasilan": 95,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 106,
        "nama_wisata": "Banc d'Arguin National Park",
        "penghasilan": 43
      },
      {
        "id": 107,
        "nama_wisata": "Chinguetti Kota Kuno",
        "penghasilan": 30
      },
      {
        "id": 108,
        "nama_wisata": "Gurun Sahara",
        "penghasilan": 22
      }
    ]
  },
  "mauritius": {
    "country_slug": "mauritius",
    "total_penghasilan": 209,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 109,
        "nama_wisata": "Black River Gorges",
        "penghasilan": 69
      },
      {
        "id": 110,
        "nama_wisata": "Ile aux Cerfs",
        "penghasilan": 58
      },
      {
        "id": 111,
        "nama_wisata": "Pantai Beau Bassin",
        "penghasilan": 45
      },
      {
        "id": 112,
        "nama_wisata": "Pamplemousses Garden",
        "penghasilan": 37
      }
    ]
  },
  "mozambik": {
    "country_slug": "mozambik",
    "total_penghasilan": 150,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 113,
        "nama_wisata": "Kepulauan Quirimbas",
        "penghasilan": 64
      },
      {
        "id": 114,
        "nama_wisata": "Taman Nasional Gorongosa",
        "penghasilan": 51
      },
      {
        "id": 115,
        "nama_wisata": "Pantai Beira",
        "penghasilan": 35
      }
    ]
  },
  "namibia": {
    "country_slug": "namibia",
    "total_penghasilan": 244,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 116,
        "nama_wisata": "Gurun Namib",
        "penghasilan": 79
      },
      {
        "id": 117,
        "nama_wisata": "Canyon Sesriem",
        "penghasilan": 64
      },
      {
        "id": 118,
        "nama_wisata": "Taman Nasional Etosha",
        "penghasilan": 58
      },
      {
        "id": 119,
        "nama_wisata": "Pantai Skeleton Coast",
        "penghasilan": 43
      }
    ]
  },
  "niger": {
    "country_slug": "niger",
    "total_penghasilan": 76,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 120,
        "nama_wisata": "Air Gunung Sahara",
        "penghasilan": 35
      },
      {
        "id": 121,
        "nama_wisata": "Sungai Niger",
        "penghasilan": 24
      },
      {
        "id": 122,
        "nama_wisata": "Taman Nasional W",
        "penghasilan": 17
      }
    ]
  },
  "nigeria": {
    "country_slug": "nigeria",
    "total_penghasilan": 118,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 123,
        "nama_wisata": "Taman Nasional Cross River",
        "penghasilan": 48
      },
      {
        "id": 124,
        "nama_wisata": "Pantai Lagos",
        "penghasilan": 40
      },
      {
        "id": 125,
        "nama_wisata": "Air Terjun Yankari",
        "penghasilan": 30
      }
    ]
  },
  "republik_afrika_tengah": {
    "country_slug": "republik_afrika_tengah",
    "total_penghasilan": 78,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 126,
        "nama_wisata": "Taman Nasional Bamingui-Bangoran",
        "penghasilan": 37
      },
      {
        "id": 127,
        "nama_wisata": "Sungai Ubangi",
        "penghasilan": 24
      },
      {
        "id": 128,
        "nama_wisata": "Gajah Sanctuary",
        "penghasilan": 17
      }
    ]
  },
  "senegal": {
    "country_slug": "senegal",
    "total_penghasilan": 144,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 129,
        "nama_wisata": "Pulau Goree",
        "penghasilan": 64
      },
      {
        "id": 130,
        "nama_wisata": "Taman Nasional Djoudj",
        "penghasilan": 45
      },
      {
        "id": 131,
        "nama_wisata": "Danau Retba Pink",
        "penghasilan": 35
      }
    ]
  },
  "sierra_leone": {
    "country_slug": "sierra_leone",
    "total_penghasilan": 95,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 132,
        "nama_wisata": "Pantai Freetown Peninsula",
        "penghasilan": 43
      },
      {
        "id": 133,
        "nama_wisata": "Pulau Banana",
        "penghasilan": 30
      },
      {
        "id": 134,
        "nama_wisata": "Taman Nasional Gola",
        "penghasilan": 22
      }
    ]
  },
  "somalia": {
    "country_slug": "somalia",
    "total_penghasilan": 16,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 135,
        "nama_wisata": "Pantai Mogadishu",
        "penghasilan": 11
      },
      {
        "id": 136,
        "nama_wisata": "Air Terjun Hargeisa",
        "penghasilan": 4
      },
      {
        "id": 137,
        "nama_wisata": "Gua Laas Geel",
        "penghasilan": 1
      }
    ]
  },
  "sudan": {
    "country_slug": "sudan",
    "total_penghasilan": 138,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 138,
        "nama_wisata": "Piramida Meroe",
        "penghasilan": 58
      },
      {
        "id": 139,
        "nama_wisata": "Gereja Soleb Kuno",
        "penghasilan": 45
      },
      {
        "id": 140,
        "nama_wisata": "Danau Nasser",
        "penghasilan": 35
      }
    ]
  },
  "sudan_selatan": {
    "country_slug": "sudan_selatan",
    "total_penghasilan": 39,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 141,
        "nama_wisata": "Taman Nasional Sudd",
        "penghasilan": 22
      },
      {
        "id": 142,
        "nama_wisata": "Danau Banyol",
        "penghasilan": 11
      },
      {
        "id": 143,
        "nama_wisata": "Bianyu Ponds",
        "penghasilan": 6
      }
    ]
  },
  "tanzania": {
    "country_slug": "tanzania",
    "total_penghasilan": 370,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 144,
        "nama_wisata": "Gunung Kilimanjaro",
        "penghasilan": 95
      },
      {
        "id": 145,
        "nama_wisata": "Kawah Ngorongoro",
        "penghasilan": 84
      },
      {
        "id": 146,
        "nama_wisata": "Taman Nasional Serengeti",
        "penghasilan": 79
      },
      {
        "id": 147,
        "nama_wisata": "Pantai Zanzibar",
        "penghasilan": 64
      },
      {
        "id": 148,
        "nama_wisata": "Danau Tanganyika",
        "penghasilan": 48
      }
    ]
  },
  "togo": {
    "country_slug": "togo",
    "total_penghasilan": 65,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 149,
        "nama_wisata": "Danau Volta",
        "penghasilan": 32
      },
      {
        "id": 150,
        "nama_wisata": "Monumen Independensi",
        "penghasilan": 19
      },
      {
        "id": 151,
        "nama_wisata": "Pantai Lome",
        "penghasilan": 14
      }
    ]
  },
  "tunisia": {
    "country_slug": "tunisia",
    "total_penghasilan": 221,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 152,
        "nama_wisata": "Kota Carthage Kuno",
        "penghasilan": 69
      },
      {
        "id": 153,
        "nama_wisata": "Medina Tunis",
        "penghasilan": 58
      },
      {
        "id": 154,
        "nama_wisata": "Sahara Douz",
        "penghasilan": 51
      },
      {
        "id": 155,
        "nama_wisata": "Pantai Djerba",
        "penghasilan": 43
      }
    ]
  },
  "uganda": {
    "country_slug": "uganda",
    "total_penghasilan": 272,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 156,
        "nama_wisata": "Gorila Pegunungan Bwindi",
        "penghasilan": 100
      },
      {
        "id": 157,
        "nama_wisata": "Air Terjun Murchison",
        "penghasilan": 69
      },
      {
        "id": 158,
        "nama_wisata": "Taman Nasional Queen Elizabeth",
        "penghasilan": 58
      },
      {
        "id": 159,
        "nama_wisata": "Danau Victoria",
        "penghasilan": 45
      }
    ]
  },
  "zambia": {
    "country_slug": "zambia",
    "total_penghasilan": 265,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 160,
        "nama_wisata": "Air Terjun Victoria",
        "penghasilan": 90
      },
      {
        "id": 161,
        "nama_wisata": "Taman Nasional South Luangwa",
        "penghasilan": 74
      },
      {
        "id": 162,
        "nama_wisata": "Danau Kariba",
        "penghasilan": 58
      },
      {
        "id": 163,
        "nama_wisata": "Bangweulu Wetlands",
        "penghasilan": 43
      }
    ]
  },
  "zimbabwe": {
    "country_slug": "zimbabwe",
    "total_penghasilan": 279,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 164,
        "nama_wisata": "Air Terjun Victoria",
        "penghasilan": 90
      },
      {
        "id": 165,
        "nama_wisata": "Taman Nasional Hwange",
        "penghasilan": 74
      },
      {
        "id": 166,
        "nama_wisata": "Reruntuhan Besar Zimbabwe",
        "penghasilan": 64
      },
      {
        "id": 167,
        "nama_wisata": "Danau Kariba",
        "penghasilan": 51
      }
    ]
  },
  "tanjung_verde": {
    "country_slug": "tanjung_verde",
    "total_penghasilan": 92,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 168,
        "nama_wisata": "Pulau Santo Antao",
        "penghasilan": 43
      },
      {
        "id": 169,
        "nama_wisata": "Pantai Praia",
        "penghasilan": 30
      },
      {
        "id": 170,
        "nama_wisata": "Pulau Maio",
        "penghasilan": 19
      }
    ]
  },
  "sao_tome_dan_principe": {
    "country_slug": "sao_tome_dan_principe",
    "total_penghasilan": 78,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 171,
        "nama_wisata": "Pantai Sao Tome",
        "penghasilan": 37
      },
      {
        "id": 172,
        "nama_wisata": "Pulau Principe",
        "penghasilan": 24
      },
      {
        "id": 173,
        "nama_wisata": "Pegunungan Pico Cao",
        "penghasilan": 17
      }
    ]
  },
  "seychelles": {
    "country_slug": "seychelles",
    "total_penghasilan": 232,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 174,
        "nama_wisata": "Pantai Mahe",
        "penghasilan": 74
      },
      {
        "id": 175,
        "nama_wisata": "Pulau Praslin",
        "penghasilan": 64
      },
      {
        "id": 176,
        "nama_wisata": "Laut Coral Vallée de Mai",
        "penghasilan": 51
      },
      {
        "id": 177,
        "nama_wisata": "Pulau La Digue",
        "penghasilan": 43
      }
    ]
  },
  "rwanda": {
    "country_slug": "rwanda",
    "total_penghasilan": 215,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 178,
        "nama_wisata": "Pegunungan Gorila Volcan",
        "penghasilan": 95
      },
      {
        "id": 179,
        "nama_wisata": "Taman Nasional Nyungwe",
        "penghasilan": 69
      },
      {
        "id": 180,
        "nama_wisata": "Danau Kivu",
        "penghasilan": 51
      }
    ]
  },
  "afganistan": {
    "country_slug": "afganistan",
    "total_penghasilan": 115,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 181,
        "nama_wisata": "Jam Tower",
        "penghasilan": 30
      },
      {
        "id": 182,
        "nama_wisata": "Band-e Amir",
        "penghasilan": 37
      },
      {
        "id": 183,
        "nama_wisata": "Bamiyan Buddha",
        "penghasilan": 48
      }
    ]
  },
  "arab_saudi": {
    "country_slug": "arab_saudi",
    "total_penghasilan": 337,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 184,
        "nama_wisata": "Masjid Al-Haram Mekah",
        "penghasilan": 100
      },
      {
        "id": 185,
        "nama_wisata": "Masjid Nabawi Madinah",
        "penghasilan": 95
      },
      {
        "id": 186,
        "nama_wisata": "Padang Pasir Rub Al Khali",
        "penghasilan": 58
      },
      {
        "id": 187,
        "nama_wisata": "Batu Hitam Kaaba",
        "penghasilan": 84
      }
    ]
  },
  "armenia": {
    "country_slug": "armenia",
    "total_penghasilan": 121,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 188,
        "nama_wisata": "Gereja Geghard",
        "penghasilan": 43
      },
      {
        "id": 189,
        "nama_wisata": "Danau Sevan",
        "penghasilan": 48
      },
      {
        "id": 190,
        "nama_wisata": "Kebun Binatang Yerevan",
        "penghasilan": 30
      }
    ]
  },
  "azerbaijan": {
    "country_slug": "azerbaijan",
    "total_penghasilan": 133,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 191,
        "nama_wisata": "Api Pegunungan Yanar Dag",
        "penghasilan": 45
      },
      {
        "id": 192,
        "nama_wisata": "Istana Shirvanshahs",
        "penghasilan": 37
      },
      {
        "id": 193,
        "nama_wisata": "Kota Baku Kuno",
        "penghasilan": 51
      }
    ]
  },
  "bahrain": {
    "country_slug": "bahrain",
    "total_penghasilan": 78,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 194,
        "nama_wisata": "Benteng Bahrain",
        "penghasilan": 35
      },
      {
        "id": 195,
        "nama_wisata": "Pohon Kehidupan",
        "penghasilan": 24
      },
      {
        "id": 196,
        "nama_wisata": "Pantai Al Dar",
        "penghasilan": 19
      }
    ]
  },
  "bangladesh": {
    "country_slug": "bangladesh",
    "total_penghasilan": 207,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 197,
        "nama_wisata": "Sundarbans Mangrove Forest",
        "penghasilan": 64
      },
      {
        "id": 198,
        "nama_wisata": "Taj Mahal Dekoration",
        "penghasilan": 58
      },
      {
        "id": 199,
        "nama_wisata": "Pantai Cox Bazaar",
        "penghasilan": 48
      },
      {
        "id": 200,
        "nama_wisata": "Kuil Hindu Bandarban",
        "penghasilan": 37
      }
    ]
  },
  "bhutan": {
    "country_slug": "bhutan",
    "total_penghasilan": 177,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 201,
        "nama_wisata": "Tiger's Nest Paro",
        "penghasilan": 74
      },
      {
        "id": 202,
        "nama_wisata": "Punakha Dzong",
        "penghasilan": 58
      },
      {
        "id": 203,
        "nama_wisata": "Bukit Dochula",
        "penghasilan": 45
      }
    ]
  },
  "brunei": {
    "country_slug": "brunei",
    "total_penghasilan": 136,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 204,
        "nama_wisata": "Masjid Jame Asr Hassanil",
        "penghasilan": 48
      },
      {
        "id": 205,
        "nama_wisata": "Istana Nurul Iman",
        "penghasilan": 56
      },
      {
        "id": 206,
        "nama_wisata": "Pantai Jerudong",
        "penghasilan": 32
      }
    ]
  },
  "china": {
    "country_slug": "china",
    "total_penghasilan": 428,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 207,
        "nama_wisata": "Tembok Besar China",
        "penghasilan": 100
      },
      {
        "id": 208,
        "nama_wisata": "Kota Terlarang",
        "penghasilan": 95
      },
      {
        "id": 209,
        "nama_wisata": "Tentara Terakota Xi'an",
        "penghasilan": 90
      },
      {
        "id": 210,
        "nama_wisata": "Danau West Lake",
        "penghasilan": 74
      },
      {
        "id": 211,
        "nama_wisata": "Karst Guilin",
        "penghasilan": 69
      }
    ]
  },
  "filipina": {
    "country_slug": "filipina",
    "total_penghasilan": 273,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 212,
        "nama_wisata": "Banawe Rice Terraces",
        "penghasilan": 64
      },
      {
        "id": 213,
        "nama_wisata": "Boracay Island",
        "penghasilan": 84
      },
      {
        "id": 214,
        "nama_wisata": "Taal Volcano",
        "penghasilan": 51
      },
      {
        "id": 215,
        "nama_wisata": "Coron Island",
        "penghasilan": 74
      }
    ]
  },
  "georgia": {
    "country_slug": "georgia",
    "total_penghasilan": 123,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 216,
        "nama_wisata": "Gereja Svetitskhovloba",
        "penghasilan": 40
      },
      {
        "id": 217,
        "nama_wisata": "Gunung Kazbegi",
        "penghasilan": 48
      },
      {
        "id": 218,
        "nama_wisata": "Gua Prometheus",
        "penghasilan": 35
      }
    ]
  },
  "hong_kong": {
    "country_slug": "hong_kong",
    "total_penghasilan": 279,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 219,
        "nama_wisata": "Victoria Peak",
        "penghasilan": 82
      },
      {
        "id": 220,
        "nama_wisata": "Star Ferry Crossing",
        "penghasilan": 69
      },
      {
        "id": 221,
        "nama_wisata": "Pulau Lantau Buddha",
        "penghasilan": 77
      },
      {
        "id": 222,
        "nama_wisata": "Temple Street Market",
        "penghasilan": 51
      }
    ]
  },
  "india": {
    "country_slug": "india",
    "total_penghasilan": 326,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 223,
        "nama_wisata": "Taj Mahal Agra",
        "penghasilan": 100
      },
      {
        "id": 224,
        "nama_wisata": "Varanasi Ganges",
        "penghasilan": 74
      },
      {
        "id": 225,
        "nama_wisata": "Kuil Meenakshi",
        "penghasilan": 58
      },
      {
        "id": 226,
        "nama_wisata": "Istana Gajapati",
        "penghasilan": 51
      },
      {
        "id": 227,
        "nama_wisata": "Gajapati Sanctuary",
        "penghasilan": 43
      }
    ]
  },
  "indonesia": {
    "country_slug": "indonesia",
    "total_penghasilan": 402,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 228,
        "nama_wisata": "Candi Borobudur Yogyakarta",
        "penghasilan": 95
      },
      {
        "id": 229,
        "nama_wisata": "Pulau Komodo",
        "penghasilan": 84
      },
      {
        "id": 230,
        "nama_wisata": "Danau Toba",
        "penghasilan": 69
      },
      {
        "id": 231,
        "nama_wisata": "Pulau Bali",
        "penghasilan": 90
      },
      {
        "id": 232,
        "nama_wisata": "Gunung Krakatau",
        "penghasilan": 64
      }
    ]
  },
  "irak": {
    "country_slug": "irak",
    "total_penghasilan": 123,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 233,
        "nama_wisata": "Reruntuhan Babilonia",
        "penghasilan": 48
      },
      {
        "id": 234,
        "nama_wisata": "Masjid Al-Askari",
        "penghasilan": 40
      },
      {
        "id": 235,
        "nama_wisata": "Kota Ur Kuno",
        "penghasilan": 35
      }
    ]
  },
  "iran": {
    "country_slug": "iran",
    "total_penghasilan": 204,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 236,
        "nama_wisata": "Persepolis Palace",
        "penghasilan": 64
      },
      {
        "id": 237,
        "nama_wisata": "Isfahan Blue Mosque",
        "penghasilan": 58
      },
      {
        "id": 238,
        "nama_wisata": "Danau Urmia",
        "penghasilan": 45
      },
      {
        "id": 239,
        "nama_wisata": "Kota Kerman Kuno",
        "penghasilan": 37
      }
    ]
  },
  "israel": {
    "country_slug": "israel",
    "total_penghasilan": 315,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 240,
        "nama_wisata": "Tembok Ratapan Jerusalem",
        "penghasilan": 90
      },
      {
        "id": 241,
        "nama_wisata": "Laut Mati",
        "penghasilan": 74
      },
      {
        "id": 242,
        "nama_wisata": "Gereja Makam Suci",
        "penghasilan": 82
      },
      {
        "id": 243,
        "nama_wisata": "Masada Fortress",
        "penghasilan": 69
      }
    ]
  },
  "jepang": {
    "country_slug": "jepang",
    "total_penghasilan": 435,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 244,
        "nama_wisata": "Gunung Fuji",
        "penghasilan": 95
      },
      {
        "id": 245,
        "nama_wisata": "Kuil Fushimi Inari",
        "penghasilan": 84
      },
      {
        "id": 246,
        "nama_wisata": "Tokyo Disneyland",
        "penghasilan": 100
      },
      {
        "id": 247,
        "nama_wisata": "Istana Kerajaan Jepang",
        "penghasilan": 77
      },
      {
        "id": 248,
        "nama_wisata": "Gerbang Torii Besar",
        "penghasilan": 79
      }
    ]
  },
  "kamboja": {
    "country_slug": "kamboja",
    "total_penghasilan": 201,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 249,
        "nama_wisata": "Angkor Wat Temple",
        "penghasilan": 95
      },
      {
        "id": 250,
        "nama_wisata": "Tonle Sap Lake",
        "penghasilan": 58
      },
      {
        "id": 251,
        "nama_wisata": "Sihanouk Port",
        "penghasilan": 48
      }
    ]
  },
  "kazakhstan": {
    "country_slug": "kazakhstan",
    "total_penghasilan": 149,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 252,
        "nama_wisata": "Baykonur Cosmodrome",
        "penghasilan": 58
      },
      {
        "id": 253,
        "nama_wisata": "Big Almaty Lake",
        "penghasilan": 48
      },
      {
        "id": 254,
        "nama_wisata": "Charyn Canyon",
        "penghasilan": 43
      }
    ]
  },
  "kirgizstan": {
    "country_slug": "kirgizstan",
    "total_penghasilan": 136,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 255,
        "nama_wisata": "Song Kul Lake",
        "penghasilan": 45
      },
      {
        "id": 256,
        "nama_wisata": "Issyk Kul Lake",
        "penghasilan": 56
      },
      {
        "id": 257,
        "nama_wisata": "Pasar Osh Bazaar",
        "penghasilan": 35
      }
    ]
  },
  "korea_selatan": {
    "country_slug": "korea_selatan",
    "total_penghasilan": 265,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 258,
        "nama_wisata": "Istana Gyeongbokgung",
        "penghasilan": 74
      },
      {
        "id": 259,
        "nama_wisata": "Menara Namsan Seoul",
        "penghasilan": 69
      },
      {
        "id": 260,
        "nama_wisata": "Gereja Myeongdong",
        "penghasilan": 58
      },
      {
        "id": 261,
        "nama_wisata": "Busan Tower",
        "penghasilan": 64
      }
    ]
  },
  "korea_utara": {
    "country_slug": "korea_utara",
    "total_penghasilan": 104,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 262,
        "nama_wisata": "Istana Kumsusan",
        "penghasilan": 37
      },
      {
        "id": 263,
        "nama_wisata": "Monumen Mansudae",
        "penghasilan": 45
      },
      {
        "id": 264,
        "nama_wisata": "Pasar Punggyeong",
        "penghasilan": 22
      }
    ]
  },
  "kuwait": {
    "country_slug": "kuwait",
    "total_penghasilan": 133,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 265,
        "nama_wisata": "Kuwait Towers",
        "penghasilan": 51
      },
      {
        "id": 266,
        "nama_wisata": "Pulau Failaka",
        "penghasilan": 37
      },
      {
        "id": 267,
        "nama_wisata": "Grand Mosque Kuwait",
        "penghasilan": 45
      }
    ]
  },
  "laos": {
    "country_slug": "laos",
    "total_penghasilan": 173,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 268,
        "nama_wisata": "Luang Prabang Temples",
        "penghasilan": 69
      },
      {
        "id": 269,
        "nama_wisata": "Mekong River",
        "penghasilan": 56
      },
      {
        "id": 270,
        "nama_wisata": "Kuang Si Waterfall",
        "penghasilan": 48
      }
    ]
  },
  "lebanon": {
    "country_slug": "lebanon",
    "total_penghasilan": 152,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 271,
        "nama_wisata": "Baalbek Temples",
        "penghasilan": 58
      },
      {
        "id": 272,
        "nama_wisata": "Cedar Lebanon",
        "penghasilan": 51
      },
      {
        "id": 273,
        "nama_wisata": "Sidon Sea Castle",
        "penghasilan": 43
      }
    ]
  },
  "makau": {
    "country_slug": "makau",
    "total_penghasilan": 203,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 274,
        "nama_wisata": "Wynn Macau Casino",
        "penghasilan": 84
      },
      {
        "id": 275,
        "nama_wisata": "Tower Macau",
        "penghasilan": 74
      },
      {
        "id": 276,
        "nama_wisata": "Pelabuhan Macau",
        "penghasilan": 45
      }
    ]
  },
  "malaysia": {
    "country_slug": "malaysia",
    "total_penghasilan": 291,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 277,
        "nama_wisata": "Petronas Twin Towers",
        "penghasilan": 84
      },
      {
        "id": 278,
        "nama_wisata": "Kuala Lumpur Tower",
        "penghasilan": 74
      },
      {
        "id": 279,
        "nama_wisata": "Batu Caves",
        "penghasilan": 64
      },
      {
        "id": 280,
        "nama_wisata": "Pulau Langkawi",
        "penghasilan": 69
      }
    ]
  },
  "maldives": {
    "country_slug": "maldives",
    "total_penghasilan": 285,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 281,
        "nama_wisata": "Male City Center",
        "penghasilan": 64
      },
      {
        "id": 282,
        "nama_wisata": "Coral Reef Diving",
        "penghasilan": 79
      },
      {
        "id": 283,
        "nama_wisata": "Island Resort Luxury",
        "penghasilan": 84
      },
      {
        "id": 284,
        "nama_wisata": "Banana Reef",
        "penghasilan": 58
      }
    ]
  },
  "mongolia": {
    "country_slug": "mongolia",
    "total_penghasilan": 149,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 285,
        "nama_wisata": "Gobi Desert",
        "penghasilan": 58
      },
      {
        "id": 286,
        "nama_wisata": "Gunung Khangai",
        "penghasilan": 48
      },
      {
        "id": 287,
        "nama_wisata": "Danau Khuvsgul",
        "penghasilan": 43
      }
    ]
  },
  "myanmar": {
    "country_slug": "myanmar",
    "total_penghasilan": 232,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 288,
        "nama_wisata": "Shwedagon Pagoda",
        "penghasilan": 79
      },
      {
        "id": 289,
        "nama_wisata": "Bagan Temples",
        "penghasilan": 84
      },
      {
        "id": 290,
        "nama_wisata": "Danau Inle",
        "penghasilan": 69
      }
    ]
  },
  "nepal": {
    "country_slug": "nepal",
    "total_penghasilan": 217,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 291,
        "nama_wisata": "Everest Base Camp",
        "penghasilan": 90
      },
      {
        "id": 292,
        "nama_wisata": "Kathmandu Durbar",
        "penghasilan": 69
      },
      {
        "id": 293,
        "nama_wisata": "Stupa Boudhanath",
        "penghasilan": 58
      }
    ]
  },
  "oman": {
    "country_slug": "oman",
    "total_penghasilan": 138,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 294,
        "nama_wisata": "Muscat Grand Mosque",
        "penghasilan": 53
      },
      {
        "id": 295,
        "nama_wisata": "Wadi Shab Canyon",
        "penghasilan": 48
      },
      {
        "id": 296,
        "nama_wisata": "Pantai Musandam",
        "penghasilan": 37
      }
    ]
  },
  "pakistan": {
    "country_slug": "pakistan",
    "total_penghasilan": 170,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 297,
        "nama_wisata": "Faisal Mosque Islamabad",
        "penghasilan": 64
      },
      {
        "id": 298,
        "nama_wisata": "Badshahi Mosque",
        "penghasilan": 58
      },
      {
        "id": 299,
        "nama_wisata": "Hunza Valley",
        "penghasilan": 48
      }
    ]
  },
  "palestina": {
    "country_slug": "palestina",
    "total_penghasilan": 169,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 300,
        "nama_wisata": "Gereja Natal Betlehem",
        "penghasilan": 74
      },
      {
        "id": 301,
        "nama_wisata": "Ramallah Museum",
        "penghasilan": 37
      },
      {
        "id": 302,
        "nama_wisata": "Jericho Ancient City",
        "penghasilan": 58
      }
    ]
  },
  "qatar": {
    "country_slug": "qatar",
    "total_penghasilan": 191,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 303,
        "nama_wisata": "Museum Seni Islami",
        "penghasilan": 69
      },
      {
        "id": 304,
        "nama_wisata": "Doha Corniche",
        "penghasilan": 58
      },
      {
        "id": 305,
        "nama_wisata": "Pulau Pearl",
        "penghasilan": 64
      }
    ]
  },
  "republik_timor_leste": {
    "country_slug": "republik_timor_leste",
    "total_penghasilan": 93,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 306,
        "nama_wisata": "Pantai Dili",
        "penghasilan": 32
      },
      {
        "id": 307,
        "nama_wisata": "Gunung Ramelau",
        "penghasilan": 37
      },
      {
        "id": 308,
        "nama_wisata": "Pulau Atauro",
        "penghasilan": 24
      }
    ]
  },
  "singapura": {
    "country_slug": "singapura",
    "total_penghasilan": 238,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 309,
        "nama_wisata": "Marina Bay Sands",
        "penghasilan": 90
      },
      {
        "id": 310,
        "nama_wisata": "Taman Botani",
        "penghasilan": 69
      },
      {
        "id": 311,
        "nama_wisata": "Sentosa Island",
        "penghasilan": 79
      }
    ]
  },
  "sri_lanka": {
    "country_slug": "sri_lanka",
    "total_penghasilan": 275,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 312,
        "nama_wisata": "Sigiriya Rock Fortress",
        "penghasilan": 84
      },
      {
        "id": 313,
        "nama_wisata": "Kuil Gigi Buddha",
        "penghasilan": 69
      },
      {
        "id": 314,
        "nama_wisata": "Pantai Mirissa",
        "penghasilan": 58
      },
      {
        "id": 315,
        "nama_wisata": "Gunung Adam Peak",
        "penghasilan": 64
      }
    ]
  },
  "suriah": {
    "country_slug": "suriah",
    "total_penghasilan": 120,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 316,
        "nama_wisata": "Aleppo Citadel",
        "penghasilan": 32
      },
      {
        "id": 317,
        "nama_wisata": "Palmyra Ruins",
        "penghasilan": 48
      },
      {
        "id": 318,
        "nama_wisata": "Omayyad Mosque",
        "penghasilan": 40
      }
    ]
  },
  "taiwan": {
    "country_slug": "taiwan",
    "total_penghasilan": 206,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 319,
        "nama_wisata": "Taipei 101",
        "penghasilan": 79
      },
      {
        "id": 320,
        "nama_wisata": "Danau Sun Moon",
        "penghasilan": 69
      },
      {
        "id": 321,
        "nama_wisata": "Jiufen Old Street",
        "penghasilan": 58
      }
    ]
  },
  "thailand": {
    "country_slug": "thailand",
    "total_penghasilan": 238,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 322,
        "nama_wisata": "Kuil Wat Phra Kaew",
        "penghasilan": 90
      },
      {
        "id": 323,
        "nama_wisata": "Phuket Beach",
        "penghasilan": 79
      },
      {
        "id": 324,
        "nama_wisata": "Chiang Mai Temple",
        "penghasilan": 69
      }
    ]
  },
  "turkmenistan": {
    "country_slug": "turkmenistan",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 325,
        "nama_wisata": "Masjid Arkadag",
        "penghasilan": 37
      },
      {
        "id": 326,
        "nama_wisata": "Kota Ashgabat",
        "penghasilan": 32
      },
      {
        "id": 327,
        "nama_wisata": "Gerbang Hell",
        "penghasilan": 43
      }
    ]
  },
  "uni_emirat_arab": {
    "country_slug": "uni_emirat_arab",
    "total_penghasilan": 338,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 328,
        "nama_wisata": "Burj Khalifa Dubai",
        "penghasilan": 100
      },
      {
        "id": 329,
        "nama_wisata": "Burj Al Arab Hotel",
        "penghasilan": 95
      },
      {
        "id": 330,
        "nama_wisata": "Gurun Dubai",
        "penghasilan": 74
      },
      {
        "id": 331,
        "nama_wisata": "Sheikh Zayed Mosque",
        "penghasilan": 69
      }
    ]
  },
  "uzbekistan": {
    "country_slug": "uzbekistan",
    "total_penghasilan": 155,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 332,
        "nama_wisata": "Registan Samarkand",
        "penghasilan": 64
      },
      {
        "id": 333,
        "nama_wisata": "Mausoleum Amir Timur",
        "penghasilan": 48
      },
      {
        "id": 334,
        "nama_wisata": "Pasar Bukhara Bazaar",
        "penghasilan": 43
      }
    ]
  },
  "vietnam": {
    "country_slug": "vietnam",
    "total_penghasilan": 222,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 335,
        "nama_wisata": "Teluk Ha Long",
        "penghasilan": 90
      },
      {
        "id": 336,
        "nama_wisata": "Hoi An Ancient Town",
        "penghasilan": 74
      },
      {
        "id": 337,
        "nama_wisata": "Mausoleum Ho Chi Minh",
        "penghasilan": 58
      }
    ]
  },
  "yaman": {
    "country_slug": "yaman",
    "total_penghasilan": 93,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 338,
        "nama_wisata": "Kota Sanaa Kuno",
        "penghasilan": 32
      },
      {
        "id": 339,
        "nama_wisata": "Pulau Socotra",
        "penghasilan": 37
      },
      {
        "id": 340,
        "nama_wisata": "Benteng Aden",
        "penghasilan": 24
      }
    ]
  },
  "yordania": {
    "country_slug": "yordania",
    "total_penghasilan": 238,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 341,
        "nama_wisata": "Petra Red Rose",
        "penghasilan": 95
      },
      {
        "id": 342,
        "nama_wisata": "Laut Mati Amman",
        "penghasilan": 74
      },
      {
        "id": 343,
        "nama_wisata": "Padang Wadi Rum",
        "penghasilan": 69
      }
    ]
  },
  "albania": {
    "country_slug": "albania",
    "total_penghasilan": 91,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 344,
        "nama_wisata": "Bulan Pantai Riviera",
        "penghasilan": 37
      },
      {
        "id": 345,
        "nama_wisata": "Benteng Rozafa",
        "penghasilan": 30
      },
      {
        "id": 346,
        "nama_wisata": "Pasar Berat Kota",
        "penghasilan": 24
      }
    ]
  },
  "andorra": {
    "country_slug": "andorra",
    "total_penghasilan": 158,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 347,
        "nama_wisata": "Pegunungan Pyrenees",
        "penghasilan": 64
      },
      {
        "id": 348,
        "nama_wisata": "Thermal Caldea",
        "penghasilan": 51
      },
      {
        "id": 349,
        "nama_wisata": "Danau Estany",
        "penghasilan": 43
      }
    ]
  },
  "austria": {
    "country_slug": "austria",
    "total_penghasilan": 227,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 350,
        "nama_wisata": "Schonbrunn Palace Vienna",
        "penghasilan": 84
      },
      {
        "id": 351,
        "nama_wisata": "Salzburg Mozart Home",
        "penghasilan": 74
      },
      {
        "id": 352,
        "nama_wisata": "Danube Valley",
        "penghasilan": 69
      }
    ]
  },
  "belanda": {
    "country_slug": "belanda",
    "total_penghasilan": 306,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 353,
        "nama_wisata": "Terusan Amsterdam",
        "penghasilan": 84
      },
      {
        "id": 354,
        "nama_wisata": "Taman Bunga Keukenhof",
        "penghasilan": 74
      },
      {
        "id": 355,
        "nama_wisata": "Kincir Kinderdijk",
        "penghasilan": 69
      },
      {
        "id": 356,
        "nama_wisata": "Museum Van Gogh",
        "penghasilan": 79
      }
    ]
  },
  "belarus": {
    "country_slug": "belarus",
    "total_penghasilan": 86,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 357,
        "nama_wisata": "Istana Mir",
        "penghasilan": 32
      },
      {
        "id": 358,
        "nama_wisata": "Istana Nesvizh",
        "penghasilan": 30
      },
      {
        "id": 359,
        "nama_wisata": "Hutan Belovezhskaya",
        "penghasilan": 24
      }
    ]
  },
  "belgia": {
    "country_slug": "belgia",
    "total_penghasilan": 201,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 360,
        "nama_wisata": "Grand Place Brussel",
        "penghasilan": 74
      },
      {
        "id": 361,
        "nama_wisata": "Terusan Bruges",
        "penghasilan": 69
      },
      {
        "id": 362,
        "nama_wisata": "Kastil Gravensteen",
        "penghasilan": 58
      }
    ]
  },
  "bosnia_dan_hercegovina": {
    "country_slug": "bosnia_dan_hercegovina",
    "total_penghasilan": 158,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 363,
        "nama_wisata": "Stari Most Bridge",
        "penghasilan": 64
      },
      {
        "id": 364,
        "nama_wisata": "Sarajevo Olympics",
        "penghasilan": 51
      },
      {
        "id": 365,
        "nama_wisata": "Danau Scandetija",
        "penghasilan": 43
      }
    ]
  },
  "bulgaria": {
    "country_slug": "bulgaria",
    "total_penghasilan": 170,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 366,
        "nama_wisata": "Rila Monastery",
        "penghasilan": 64
      },
      {
        "id": 367,
        "nama_wisata": "Pantai Black Sea",
        "penghasilan": 58
      },
      {
        "id": 368,
        "nama_wisata": "Kota Sofia Kuno",
        "penghasilan": 48
      }
    ]
  },
  "ceko": {
    "country_slug": "ceko",
    "total_penghasilan": 248,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 369,
        "nama_wisata": "Kastil Praga",
        "penghasilan": 90
      },
      {
        "id": 370,
        "nama_wisata": "Jembatan Charles",
        "penghasilan": 84
      },
      {
        "id": 371,
        "nama_wisata": "Jam Astronomi Kuno",
        "penghasilan": 74
      }
    ]
  },
  "denmark": {
    "country_slug": "denmark",
    "total_penghasilan": 207,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 372,
        "nama_wisata": "Taman Tivoli Copenhagen",
        "penghasilan": 74
      },
      {
        "id": 373,
        "nama_wisata": "Istana Kronborg",
        "penghasilan": 64
      },
      {
        "id": 374,
        "nama_wisata": "Lego House Billund",
        "penghasilan": 69
      }
    ]
  },
  "estonia": {
    "country_slug": "estonia",
    "total_penghasilan": 160,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 375,
        "nama_wisata": "Tallinn Old Town",
        "penghasilan": 64
      },
      {
        "id": 376,
        "nama_wisata": "Kadriorg Palace",
        "penghasilan": 53
      },
      {
        "id": 377,
        "nama_wisata": "Danau Peipus",
        "penghasilan": 43
      }
    ]
  },
  "finlandia": {
    "country_slug": "finlandia",
    "total_penghasilan": 210,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 378,
        "nama_wisata": "Aurora Borealis Lapland",
        "penghasilan": 90
      },
      {
        "id": 379,
        "nama_wisata": "Danau Saimaa",
        "penghasilan": 69
      },
      {
        "id": 380,
        "nama_wisata": "Sauna Helsinki",
        "penghasilan": 51
      }
    ]
  },
  "gibraltar": {
    "country_slug": "gibraltar",
    "total_penghasilan": 143,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 381,
        "nama_wisata": "Rock of Gibraltar",
        "penghasilan": 58
      },
      {
        "id": 382,
        "nama_wisata": "Upper Rock Reserve",
        "penghasilan": 48
      },
      {
        "id": 383,
        "nama_wisata": "Europa Point Lighthouse",
        "penghasilan": 37
      }
    ]
  },
  "hungaria": {
    "country_slug": "hungaria",
    "total_penghasilan": 196,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 384,
        "nama_wisata": "Istana Buda Budapest",
        "penghasilan": 74
      },
      {
        "id": 385,
        "nama_wisata": "Danau Thermal",
        "penghasilan": 64
      },
      {
        "id": 386,
        "nama_wisata": "Sungai Danube",
        "penghasilan": 58
      }
    ]
  },
  "inggris": {
    "country_slug": "inggris",
    "total_penghasilan": 356,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 387,
        "nama_wisata": "Big Ben Westminster",
        "penghasilan": 95
      },
      {
        "id": 388,
        "nama_wisata": "Tower Bridge London",
        "penghasilan": 90
      },
      {
        "id": 389,
        "nama_wisata": "Stonehenge",
        "penghasilan": 84
      },
      {
        "id": 390,
        "nama_wisata": "Istana Buckingham",
        "penghasilan": 87
      }
    ]
  },
  "irlandia": {
    "country_slug": "irlandia",
    "total_penghasilan": 191,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 391,
        "nama_wisata": "Cliff Moher",
        "penghasilan": 69
      },
      {
        "id": 392,
        "nama_wisata": "Trinity College Dublin",
        "penghasilan": 64
      },
      {
        "id": 393,
        "nama_wisata": "Ring of Kerry",
        "penghasilan": 58
      }
    ]
  },
  "islandia": {
    "country_slug": "islandia",
    "total_penghasilan": 207,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 394,
        "nama_wisata": "Geysir Strokkur",
        "penghasilan": 74
      },
      {
        "id": 395,
        "nama_wisata": "Waterfall Gullfoss",
        "penghasilan": 69
      },
      {
        "id": 396,
        "nama_wisata": "Golden Circle Route",
        "penghasilan": 64
      }
    ]
  },
  "italia": {
    "country_slug": "italia",
    "total_penghasilan": 438,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 397,
        "nama_wisata": "Colosseum Roma",
        "penghasilan": 100
      },
      {
        "id": 398,
        "nama_wisata": "Basilica Santo Petrus",
        "penghasilan": 95
      },
      {
        "id": 399,
        "nama_wisata": "Gondola Venezia",
        "penghasilan": 90
      },
      {
        "id": 400,
        "nama_wisata": "Menara Pisa",
        "penghasilan": 79
      },
      {
        "id": 401,
        "nama_wisata": "Lake Como",
        "penghasilan": 74
      }
    ]
  },
  "jerman": {
    "country_slug": "jerman",
    "total_penghasilan": 412,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 402,
        "nama_wisata": "Kastil Neuschwanstein",
        "penghasilan": 90
      },
      {
        "id": 403,
        "nama_wisata": "Gerbang Brandenburg",
        "penghasilan": 84
      },
      {
        "id": 404,
        "nama_wisata": "Oktoberfest Munich",
        "penghasilan": 95
      },
      {
        "id": 405,
        "nama_wisata": "Menara Berlin",
        "penghasilan": 74
      },
      {
        "id": 406,
        "nama_wisata": "Rhine Valley",
        "penghasilan": 69
      }
    ]
  },
  "kepulauan_faroe": {
    "country_slug": "kepulauan_faroe",
    "total_penghasilan": 158,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 407,
        "nama_wisata": "Faroe Waterfalls",
        "penghasilan": 64
      },
      {
        "id": 408,
        "nama_wisata": "Streymoy Island",
        "penghasilan": 51
      },
      {
        "id": 409,
        "nama_wisata": "Kollafjord",
        "penghasilan": 43
      }
    ]
  },
  "kosovo": {
    "country_slug": "kosovo",
    "total_penghasilan": 93,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 410,
        "nama_wisata": "Monastery Prizren",
        "penghasilan": 32
      },
      {
        "id": 411,
        "nama_wisata": "Rugova Canyon",
        "penghasilan": 37
      },
      {
        "id": 412,
        "nama_wisata": "Danau Liqeni i Pristhines",
        "penghasilan": 24
      }
    ]
  },
  "kroasia": {
    "country_slug": "kroasia",
    "total_penghasilan": 237,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 413,
        "nama_wisata": "Danau Plitvice",
        "penghasilan": 79
      },
      {
        "id": 414,
        "nama_wisata": "Dinding Dubrovnik",
        "penghasilan": 84
      },
      {
        "id": 415,
        "nama_wisata": "Pulau Hvar",
        "penghasilan": 74
      }
    ]
  },
  "latvia": {
    "country_slug": "latvia",
    "total_penghasilan": 154,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 416,
        "nama_wisata": "Old Town Riga",
        "penghasilan": 58
      },
      {
        "id": 417,
        "nama_wisata": "Gauja River",
        "penghasilan": 45
      },
      {
        "id": 418,
        "nama_wisata": "Rundāle Palace",
        "penghasilan": 51
      }
    ]
  },
  "liechtenstein": {
    "country_slug": "liechtenstein",
    "total_penghasilan": 96,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 419,
        "nama_wisata": "Gutenberg Castle",
        "penghasilan": 37
      },
      {
        "id": 420,
        "nama_wisata": "Rhine Valley Trail",
        "penghasilan": 32
      },
      {
        "id": 421,
        "nama_wisata": "Kapelle Steg",
        "penghasilan": 27
      }
    ]
  },
  "luksemburg": {
    "country_slug": "luksemburg",
    "total_penghasilan": 118,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 422,
        "nama_wisata": "Kastil Vianden",
        "penghasilan": 43
      },
      {
        "id": 423,
        "nama_wisata": "Lembah Echternach",
        "penghasilan": 35
      },
      {
        "id": 424,
        "nama_wisata": "Kota Kuno Luxembourg",
        "penghasilan": 40
      }
    ]
  },
  "makedonia_utara": {
    "country_slug": "makedonia_utara",
    "total_penghasilan": 155,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 425,
        "nama_wisata": "Danau Ohrid",
        "penghasilan": 64
      },
      {
        "id": 426,
        "nama_wisata": "Masjid Mustafa Pasha",
        "penghasilan": 43
      },
      {
        "id": 427,
        "nama_wisata": "Skopje Kota",
        "penghasilan": 48
      }
    ]
  },
  "malta": {
    "country_slug": "malta",
    "total_penghasilan": 191,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 428,
        "nama_wisata": "Valletta Kuno",
        "penghasilan": 69
      },
      {
        "id": 429,
        "nama_wisata": "Azur Window Gozo",
        "penghasilan": 64
      },
      {
        "id": 430,
        "nama_wisata": "Popeye Village",
        "penghasilan": 58
      }
    ]
  },
  "moldova": {
    "country_slug": "moldova",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 431,
        "nama_wisata": "Sungai Dniester",
        "penghasilan": 32
      },
      {
        "id": 432,
        "nama_wisata": "Wine Cellars",
        "penghasilan": 43
      },
      {
        "id": 433,
        "nama_wisata": "Kota Chisinau",
        "penghasilan": 37
      }
    ]
  },
  "monako": {
    "country_slug": "monako",
    "total_penghasilan": 233,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 434,
        "nama_wisata": "Kasino Monte Carlo",
        "penghasilan": 90
      },
      {
        "id": 435,
        "nama_wisata": "Istana Kerajaan",
        "penghasilan": 74
      },
      {
        "id": 436,
        "nama_wisata": "Akuarium Monako",
        "penghasilan": 69
      }
    ]
  },
  "montenegro": {
    "country_slug": "montenegro",
    "total_penghasilan": 165,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 437,
        "nama_wisata": "Teluk Kotor",
        "penghasilan": 69
      },
      {
        "id": 438,
        "nama_wisata": "Pulau Gospa od Skrpjela",
        "penghasilan": 51
      },
      {
        "id": 439,
        "nama_wisata": "Danau Skadar",
        "penghasilan": 45
      }
    ]
  },
  "norwegia": {
    "country_slug": "norwegia",
    "total_penghasilan": 343,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 440,
        "nama_wisata": "Norwegian Fjords",
        "penghasilan": 95
      },
      {
        "id": 441,
        "nama_wisata": "Geirangerfjord",
        "penghasilan": 90
      },
      {
        "id": 442,
        "nama_wisata": "Aurora Borealis",
        "penghasilan": 84
      },
      {
        "id": 443,
        "nama_wisata": "Lofoten Islands",
        "penghasilan": 74
      }
    ]
  },
  "polandia": {
    "country_slug": "polandia",
    "total_penghasilan": 184,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 444,
        "nama_wisata": "Krakow Old Town",
        "penghasilan": 69
      },
      {
        "id": 445,
        "nama_wisata": "Kastil Wawel",
        "penghasilan": 64
      },
      {
        "id": 446,
        "nama_wisata": "Danau Tatra",
        "penghasilan": 51
      }
    ]
  },
  "portugal": {
    "country_slug": "portugal",
    "total_penghasilan": 201,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 447,
        "nama_wisata": "Puri Sintra",
        "penghasilan": 74
      },
      {
        "id": 448,
        "nama_wisata": "Menara Belem Lisbon",
        "penghasilan": 69
      },
      {
        "id": 449,
        "nama_wisata": "Pantai Dorado Algarve",
        "penghasilan": 58
      }
    ]
  },
  "prancis": {
    "country_slug": "prancis",
    "total_penghasilan": 443,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 450,
        "nama_wisata": "Menara Eiffel Paris",
        "penghasilan": 100
      },
      {
        "id": 451,
        "nama_wisata": "Istana Versailles",
        "penghasilan": 95
      },
      {
        "id": 452,
        "nama_wisata": "Notre-Dame Cathedral",
        "penghasilan": 90
      },
      {
        "id": 453,
        "nama_wisata": "Museum Louvre",
        "penghasilan": 84
      },
      {
        "id": 454,
        "nama_wisata": "Arc de Triomphe",
        "penghasilan": 74
      }
    ]
  },
  "republik_rumania": {
    "country_slug": "republik_rumania",
    "total_penghasilan": 170,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 455,
        "nama_wisata": "Kastil Dracula Bran",
        "penghasilan": 64
      },
      {
        "id": 456,
        "nama_wisata": "Istana Peles",
        "penghasilan": 58
      },
      {
        "id": 457,
        "nama_wisata": "Kota Brasov",
        "penghasilan": 48
      }
    ]
  },
  "republik_serbia": {
    "country_slug": "republik_serbia",
    "total_penghasilan": 154,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 458,
        "nama_wisata": "Istana Kale Beograd",
        "penghasilan": 58
      },
      {
        "id": 459,
        "nama_wisata": "Dunaj River",
        "penghasilan": 51
      },
      {
        "id": 460,
        "nama_wisata": "Monastery Studenica",
        "penghasilan": 45
      }
    ]
  },
  "rusia": {
    "country_slug": "rusia",
    "total_penghasilan": 280,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 461,
        "nama_wisata": "Kremlin Moskwa",
        "penghasilan": 74
      },
      {
        "id": 462,
        "nama_wisata": "Istana Peterhof",
        "penghasilan": 69
      },
      {
        "id": 463,
        "nama_wisata": "Basilika St Vasily",
        "penghasilan": 79
      },
      {
        "id": 464,
        "nama_wisata": "Danau Baikal",
        "penghasilan": 58
      }
    ]
  },
  "san_marino": {
    "country_slug": "san_marino",
    "total_penghasilan": 133,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 465,
        "nama_wisata": "Istana Pertama",
        "penghasilan": 51
      },
      {
        "id": 466,
        "nama_wisata": "Kota San Marino",
        "penghasilan": 45
      },
      {
        "id": 467,
        "nama_wisata": "Menara Pertahanan",
        "penghasilan": 37
      }
    ]
  },
  "siprus": {
    "country_slug": "siprus",
    "total_penghasilan": 167,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 468,
        "nama_wisata": "Pantai Nissi",
        "penghasilan": 64
      },
      {
        "id": 469,
        "nama_wisata": "Batu Aphrodite",
        "penghasilan": 58
      },
      {
        "id": 470,
        "nama_wisata": "Kota Nicosia Kuno",
        "penghasilan": 45
      }
    ]
  },
  "slovenia": {
    "country_slug": "slovenia",
    "total_penghasilan": 175,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 471,
        "nama_wisata": "Danau Bled",
        "penghasilan": 69
      },
      {
        "id": 472,
        "nama_wisata": "Gua Postojna",
        "penghasilan": 58
      },
      {
        "id": 473,
        "nama_wisata": "Danau Bohinj",
        "penghasilan": 48
      }
    ]
  },
  "slowakia": {
    "country_slug": "slowakia",
    "total_penghasilan": 129,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 474,
        "nama_wisata": "Kastil Bratislava",
        "penghasilan": 43
      },
      {
        "id": 475,
        "nama_wisata": "Pegunungan Tatra",
        "penghasilan": 51
      },
      {
        "id": 476,
        "nama_wisata": "Danau Liptov",
        "penghasilan": 35
      }
    ]
  },
  "spanyol": {
    "country_slug": "spanyol",
    "total_penghasilan": 343,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 477,
        "nama_wisata": "Sagrada Familia Barcelona",
        "penghasilan": 95
      },
      {
        "id": 478,
        "nama_wisata": "Alhambra Granada",
        "penghasilan": 90
      },
      {
        "id": 479,
        "nama_wisata": "Prado Museum Madrid",
        "penghasilan": 84
      },
      {
        "id": 480,
        "nama_wisata": "Pantai Costa Brava",
        "penghasilan": 74
      }
    ]
  },
  "swedia": {
    "country_slug": "swedia",
    "total_penghasilan": 227,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 481,
        "nama_wisata": "Stockholm City Hall",
        "penghasilan": 74
      },
      {
        "id": 482,
        "nama_wisata": "Istana Drottningholm",
        "penghasilan": 69
      },
      {
        "id": 483,
        "nama_wisata": "Aurora Borealis",
        "penghasilan": 84
      }
    ]
  },
  "swiss": {
    "country_slug": "swiss",
    "total_penghasilan": 327,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 484,
        "nama_wisata": "Gunung Matterhorn",
        "penghasilan": 95
      },
      {
        "id": 485,
        "nama_wisata": "Lake Lucerne",
        "penghasilan": 79
      },
      {
        "id": 486,
        "nama_wisata": "Interlaken Resort",
        "penghasilan": 84
      },
      {
        "id": 487,
        "nama_wisata": "Kastil Chillon",
        "penghasilan": 69
      }
    ]
  },
  "turki": {
    "country_slug": "turki",
    "total_penghasilan": 327,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 488,
        "nama_wisata": "Masjid Biru Istanbul",
        "penghasilan": 84
      },
      {
        "id": 489,
        "nama_wisata": "Cappadocia Hot Air Balloons",
        "penghasilan": 90
      },
      {
        "id": 490,
        "nama_wisata": "Efesus Kuno",
        "penghasilan": 79
      },
      {
        "id": 491,
        "nama_wisata": "Pamukkale Terraces",
        "penghasilan": 74
      }
    ]
  },
  "ukraina": {
    "country_slug": "ukraina",
    "total_penghasilan": 128,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 492,
        "nama_wisata": "Sofiyivski Park",
        "penghasilan": 43
      },
      {
        "id": 493,
        "nama_wisata": "St Michael Monastery",
        "penghasilan": 48
      },
      {
        "id": 494,
        "nama_wisata": "Kievan Rus Museum",
        "penghasilan": 37
      }
    ]
  },
  "vatikan": {
    "country_slug": "vatikan",
    "total_penghasilan": 285,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 495,
        "nama_wisata": "Basilika Santo Petrus",
        "penghasilan": 100
      },
      {
        "id": 496,
        "nama_wisata": "Sistine Chapel",
        "penghasilan": 95
      },
      {
        "id": 497,
        "nama_wisata": "Museum Vatican",
        "penghasilan": 90
      }
    ]
  },
  "yunani": {
    "country_slug": "yunani",
    "total_penghasilan": 343,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 498,
        "nama_wisata": "Parthenon Athens",
        "penghasilan": 95
      },
      {
        "id": 499,
        "nama_wisata": "Santorini Islands",
        "penghasilan": 90
      },
      {
        "id": 500,
        "nama_wisata": "Knosos Palace Crete",
        "penghasilan": 84
      },
      {
        "id": 501,
        "nama_wisata": "Delphi Oracle",
        "penghasilan": 74
      }
    ]
  },
  "antigua_dan_barbuda": {
    "country_slug": "antigua_dan_barbuda",
    "total_penghasilan": 154,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 502,
        "nama_wisata": "Pantai Carlisle",
        "penghasilan": 58
      },
      {
        "id": 503,
        "nama_wisata": "English Harbour",
        "penghasilan": 51
      },
      {
        "id": 504,
        "nama_wisata": "Pulau Barbuda",
        "penghasilan": 45
      }
    ]
  },
  "bahama": {
    "country_slug": "bahama",
    "total_penghasilan": 317,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 505,
        "nama_wisata": "Nassau Beach Paradise",
        "penghasilan": 84
      },
      {
        "id": 506,
        "nama_wisata": "Blue Hole Andros",
        "penghasilan": 74
      },
      {
        "id": 507,
        "nama_wisata": "Exuma Cays",
        "penghasilan": 69
      },
      {
        "id": 508,
        "nama_wisata": "Atlantis Resort",
        "penghasilan": 90
      }
    ]
  },
  "barbados": {
    "country_slug": "barbados",
    "total_penghasilan": 165,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 509,
        "nama_wisata": "Pantai Carlisle",
        "penghasilan": 64
      },
      {
        "id": 510,
        "nama_wisata": "Bridgetown Historic",
        "penghasilan": 53
      },
      {
        "id": 511,
        "nama_wisata": "St Nicholas Abbey",
        "penghasilan": 48
      }
    ]
  },
  "belize": {
    "country_slug": "belize",
    "total_penghasilan": 302,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 512,
        "nama_wisata": "Great Blue Hole",
        "penghasilan": 90
      },
      {
        "id": 513,
        "nama_wisata": "Barrier Reef",
        "penghasilan": 79
      },
      {
        "id": 514,
        "nama_wisata": "Mayan Ruins Caracol",
        "penghasilan": 69
      },
      {
        "id": 515,
        "nama_wisata": "Caye Caulker",
        "penghasilan": 64
      }
    ]
  },
  "kanada": {
    "country_slug": "kanada",
    "total_penghasilan": 443,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 516,
        "nama_wisata": "Niagara Falls",
        "penghasilan": 100
      },
      {
        "id": 517,
        "nama_wisata": "Rocky Mountains",
        "penghasilan": 95
      },
      {
        "id": 518,
        "nama_wisata": "Danau Louise",
        "penghasilan": 90
      },
      {
        "id": 519,
        "nama_wisata": "Toronto CN Tower",
        "penghasilan": 84
      },
      {
        "id": 520,
        "nama_wisata": "Pulau Vancouver",
        "penghasilan": 74
      }
    ]
  },
  "dominika": {
    "country_slug": "dominika",
    "total_penghasilan": 152,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 521,
        "nama_wisata": "Boiling Lake",
        "penghasilan": 58
      },
      {
        "id": 522,
        "nama_wisata": "Trafalgar Falls",
        "penghasilan": 51
      },
      {
        "id": 523,
        "nama_wisata": "Scotts Head Pulau",
        "penghasilan": 43
      }
    ]
  },
  "dominika_republik": {
    "country_slug": "dominika_republik",
    "total_penghasilan": 227,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 524,
        "nama_wisata": "Punta Cana Beach",
        "penghasilan": 84
      },
      {
        "id": 525,
        "nama_wisata": "Santo Domingo Kuno",
        "penghasilan": 74
      },
      {
        "id": 526,
        "nama_wisata": "Saona Island",
        "penghasilan": 69
      }
    ]
  },
  "el_salvador": {
    "country_slug": "el_salvador",
    "total_penghasilan": 128,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 527,
        "nama_wisata": "Danau Ilopango",
        "penghasilan": 48
      },
      {
        "id": 528,
        "nama_wisata": "Gunung Izalco",
        "penghasilan": 43
      },
      {
        "id": 529,
        "nama_wisata": "Pantai Puerto La Libertad",
        "penghasilan": 37
      }
    ]
  },
  "grenada": {
    "country_slug": "grenada",
    "total_penghasilan": 158,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 530,
        "nama_wisata": "Grand Anse Beach",
        "penghasilan": 64
      },
      {
        "id": 531,
        "nama_wisata": "Fort George",
        "penghasilan": 51
      },
      {
        "id": 532,
        "nama_wisata": "Anise Pantai Carriacou",
        "penghasilan": 43
      }
    ]
  },
  "guatemala": {
    "country_slug": "guatemala",
    "total_penghasilan": 270,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 533,
        "nama_wisata": "Tikal Mayan Ruins",
        "penghasilan": 79
      },
      {
        "id": 534,
        "nama_wisata": "Danau Atitlan",
        "penghasilan": 74
      },
      {
        "id": 535,
        "nama_wisata": "Antigua Guatemala",
        "penghasilan": 69
      },
      {
        "id": 536,
        "nama_wisata": "Gunung Tajumulco",
        "penghasilan": 48
      }
    ]
  },
  "haiti": {
    "country_slug": "haiti",
    "total_penghasilan": 91,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 537,
        "nama_wisata": "Citadelle Laferriere",
        "penghasilan": 37
      },
      {
        "id": 538,
        "nama_wisata": "Pulau Hispaniola",
        "penghasilan": 30
      },
      {
        "id": 539,
        "nama_wisata": "Port-au-Prince Harbor",
        "penghasilan": 24
      }
    ]
  },
  "honduras": {
    "country_slug": "honduras",
    "total_penghasilan": 196,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 540,
        "nama_wisata": "Mesoamerican Reef",
        "penghasilan": 74
      },
      {
        "id": 541,
        "nama_wisata": "Copan Mayan Site",
        "penghasilan": 64
      },
      {
        "id": 542,
        "nama_wisata": "Pulau Roatan",
        "penghasilan": 58
      }
    ]
  },
  "jamaika": {
    "country_slug": "jamaika",
    "total_penghasilan": 232,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 543,
        "nama_wisata": "Dunn's River Falls",
        "penghasilan": 79
      },
      {
        "id": 544,
        "nama_wisata": "Montego Bay Resort",
        "penghasilan": 84
      },
      {
        "id": 545,
        "nama_wisata": "Blue Mountain Peaks",
        "penghasilan": 69
      }
    ]
  },
  "kuba": {
    "country_slug": "kuba",
    "total_penghasilan": 301,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 546,
        "nama_wisata": "Havana Vieja Kuno",
        "penghasilan": 84
      },
      {
        "id": 547,
        "nama_wisata": "Varadero Beach",
        "penghasilan": 79
      },
      {
        "id": 548,
        "nama_wisata": "Kota Trinidad Kuno",
        "penghasilan": 74
      },
      {
        "id": 549,
        "nama_wisata": "Gunung El Yunque",
        "penghasilan": 64
      }
    ]
  },
  "kostrika": {
    "country_slug": "kostrika",
    "total_penghasilan": 291,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 550,
        "nama_wisata": "Arenal Volcano",
        "penghasilan": 84
      },
      {
        "id": 551,
        "nama_wisata": "Manuel Antonio Park",
        "penghasilan": 74
      },
      {
        "id": 552,
        "nama_wisata": "Monteverde Cloud Forest",
        "penghasilan": 69
      },
      {
        "id": 553,
        "nama_wisata": "Nicoya Peninsula",
        "penghasilan": 64
      }
    ]
  },
  "meksiko": {
    "country_slug": "meksiko",
    "total_penghasilan": 422,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 554,
        "nama_wisata": "Chichen Itza Mayan",
        "penghasilan": 95
      },
      {
        "id": 555,
        "nama_wisata": "Cancun Beach Paradise",
        "penghasilan": 90
      },
      {
        "id": 556,
        "nama_wisata": "Teotihuacan Pyramid",
        "penghasilan": 84
      },
      {
        "id": 557,
        "nama_wisata": "Palacio Nacional Mexico City",
        "penghasilan": 79
      },
      {
        "id": 558,
        "nama_wisata": "Isla Mujeres",
        "penghasilan": 74
      }
    ]
  },
  "nikaragua": {
    "country_slug": "nikaragua",
    "total_penghasilan": 154,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 559,
        "nama_wisata": "Granada Kota Kuno",
        "penghasilan": 58
      },
      {
        "id": 560,
        "nama_wisata": "Danau Nicaragua",
        "penghasilan": 51
      },
      {
        "id": 561,
        "nama_wisata": "Corn Islands Beach",
        "penghasilan": 45
      }
    ]
  },
  "panama": {
    "country_slug": "panama",
    "total_penghasilan": 302,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 562,
        "nama_wisata": "Panama Canal",
        "penghasilan": 95
      },
      {
        "id": 563,
        "nama_wisata": "Panama City Skyline",
        "penghasilan": 74
      },
      {
        "id": 564,
        "nama_wisata": "San Blas Islands",
        "penghasilan": 69
      },
      {
        "id": 565,
        "nama_wisata": "Bocas del Toro",
        "penghasilan": 64
      }
    ]
  },
  "santo_kitts_nevis": {
    "country_slug": "santo_kitts_nevis",
    "total_penghasilan": 154,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 566,
        "nama_wisata": "Brimstone Hill Fortress",
        "penghasilan": 58
      },
      {
        "id": 567,
        "nama_wisata": "Frigate Bay Beach",
        "penghasilan": 51
      },
      {
        "id": 568,
        "nama_wisata": "Nevis Peak",
        "penghasilan": 45
      }
    ]
  },
  "santo_lucia": {
    "country_slug": "santo_lucia",
    "total_penghasilan": 206,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 569,
        "nama_wisata": "Pitons Twin Mountain",
        "penghasilan": 84
      },
      {
        "id": 570,
        "nama_wisata": "Sulphur Springs",
        "penghasilan": 64
      },
      {
        "id": 571,
        "nama_wisata": "Marigot Bay",
        "penghasilan": 58
      }
    ]
  },
  "santo_vincent_grenadines": {
    "country_slug": "santo_vincent_grenadines",
    "total_penghasilan": 165,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 572,
        "nama_wisata": "Tobago Cays Marine Park",
        "penghasilan": 69
      },
      {
        "id": 573,
        "nama_wisata": "Black Sand Beach",
        "penghasilan": 51
      },
      {
        "id": 574,
        "nama_wisata": "Bequia Island",
        "penghasilan": 45
      }
    ]
  },
  "trinidat_tobago": {
    "country_slug": "trinidat_tobago",
    "total_penghasilan": 173,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 575,
        "nama_wisata": "Pitch Lake",
        "penghasilan": 64
      },
      {
        "id": 576,
        "nama_wisata": "Tobago Coral Reef",
        "penghasilan": 58
      },
      {
        "id": 577,
        "nama_wisata": "Port of Spain Harbor",
        "penghasilan": 51
      }
    ]
  },
  "turks_caicos": {
    "country_slug": "turks_caicos",
    "total_penghasilan": 222,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 578,
        "nama_wisata": "Grace Bay Beach",
        "penghasilan": 90
      },
      {
        "id": 579,
        "nama_wisata": "Smith Reef Diving",
        "penghasilan": 74
      },
      {
        "id": 580,
        "nama_wisata": "Middle Caicos",
        "penghasilan": 58
      }
    ]
  },
  "america_serikat": {
    "country_slug": "america_serikat",
    "total_penghasilan": 469,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 581,
        "nama_wisata": "Statue of Liberty",
        "penghasilan": 100
      },
      {
        "id": 582,
        "nama_wisata": "Grand Canyon",
        "penghasilan": 95
      },
      {
        "id": 583,
        "nama_wisata": "Yellowstone Park",
        "penghasilan": 90
      },
      {
        "id": 584,
        "nama_wisata": "Disney World Orlando",
        "penghasilan": 100
      },
      {
        "id": 585,
        "nama_wisata": "Golden Gate Bridge",
        "penghasilan": 84
      }
    ]
  },
  "kepulauan_virgin": {
    "country_slug": "kepulauan_virgin",
    "total_penghasilan": 191,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 586,
        "nama_wisata": "Coral Reef Diving",
        "penghasilan": 69
      },
      {
        "id": 587,
        "nama_wisata": "Magen Bay Beach",
        "penghasilan": 64
      },
      {
        "id": 588,
        "nama_wisata": "St Thomas Harbor",
        "penghasilan": 58
      }
    ]
  },
  "guadeloupe": {
    "country_slug": "guadeloupe",
    "total_penghasilan": 173,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 589,
        "nama_wisata": "Pitons Waterfall",
        "penghasilan": 64
      },
      {
        "id": 590,
        "nama_wisata": "Les Saintes Island",
        "penghasilan": 58
      },
      {
        "id": 591,
        "nama_wisata": "Basse-Terre Beach",
        "penghasilan": 51
      }
    ]
  },
  "martinique": {
    "country_slug": "martinique",
    "total_penghasilan": 178,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 592,
        "nama_wisata": "Mont Pelee Volcano",
        "penghasilan": 69
      },
      {
        "id": 593,
        "nama_wisata": "Diamond Falls",
        "penghasilan": 58
      },
      {
        "id": 594,
        "nama_wisata": "Fort-de-France Harbor",
        "penghasilan": 51
      }
    ]
  },
  "australia": {
    "country_slug": "australia",
    "total_penghasilan": 448,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 595,
        "nama_wisata": "Great Barrier Reef",
        "penghasilan": 100
      },
      {
        "id": 596,
        "nama_wisata": "Uluru Ayers Rock",
        "penghasilan": 95
      },
      {
        "id": 597,
        "nama_wisata": "Sydney Opera House",
        "penghasilan": 90
      },
      {
        "id": 598,
        "nama_wisata": "Blue Mountains",
        "penghasilan": 84
      },
      {
        "id": 599,
        "nama_wisata": "Pantai Bondi",
        "penghasilan": 79
      }
    ]
  },
  "kiribati": {
    "country_slug": "kiribati",
    "total_penghasilan": 96,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 600,
        "nama_wisata": "Tarawa Atoll",
        "penghasilan": 37
      },
      {
        "id": 601,
        "nama_wisata": "Christmas Island Beach",
        "penghasilan": 32
      },
      {
        "id": 602,
        "nama_wisata": "Phoenix Island",
        "penghasilan": 27
      }
    ]
  },
  "tuvalu": {
    "country_slug": "tuvalu",
    "total_penghasilan": 58,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 603,
        "nama_wisata": "Funafuti Atoll",
        "penghasilan": 22
      },
      {
        "id": 604,
        "nama_wisata": "Pulau Nanumea",
        "penghasilan": 17
      },
      {
        "id": 605,
        "nama_wisata": "Lagoon Tuvalu",
        "penghasilan": 19
      }
    ]
  },
  "mikronesia": {
    "country_slug": "mikronesia",
    "total_penghasilan": 175,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 606,
        "nama_wisata": "Truk Lagoon Diving",
        "penghasilan": 69
      },
      {
        "id": 607,
        "nama_wisata": "Pohnpei Island",
        "penghasilan": 58
      },
      {
        "id": 608,
        "nama_wisata": "Kosrae Island",
        "penghasilan": 48
      }
    ]
  },
  "fiji": {
    "country_slug": "fiji",
    "total_penghasilan": 291,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 609,
        "nama_wisata": "Nadi Beach Resort",
        "penghasilan": 84
      },
      {
        "id": 610,
        "nama_wisata": "Coral Reef Diving",
        "penghasilan": 74
      },
      {
        "id": 611,
        "nama_wisata": "Malolo Island",
        "penghasilan": 69
      },
      {
        "id": 612,
        "nama_wisata": "Yanuca Island",
        "penghasilan": 64
      }
    ]
  },
  "vanuatu": {
    "country_slug": "vanuatu",
    "total_penghasilan": 178,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 613,
        "nama_wisata": "Mount Yasur Volcano",
        "penghasilan": 69
      },
      {
        "id": 614,
        "nama_wisata": "Efate Island",
        "penghasilan": 58
      },
      {
        "id": 615,
        "nama_wisata": "Port Vila Harbor",
        "penghasilan": 51
      }
    ]
  },
  "marshall": {
    "country_slug": "marshall",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 616,
        "nama_wisata": "Majuro Atoll",
        "penghasilan": 43
      },
      {
        "id": 617,
        "nama_wisata": "Kwajalein Island",
        "penghasilan": 37
      },
      {
        "id": 618,
        "nama_wisata": "Arno Atoll",
        "penghasilan": 32
      }
    ]
  },
  "papua_nugini": {
    "country_slug": "papua_nugini",
    "total_penghasilan": 144,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 619,
        "nama_wisata": "Port Moresby City",
        "penghasilan": 48
      },
      {
        "id": 620,
        "nama_wisata": "Madang Diving",
        "penghasilan": 53
      },
      {
        "id": 621,
        "nama_wisata": "Sepik River",
        "penghasilan": 43
      }
    ]
  },
  "nauru": {
    "country_slug": "nauru",
    "total_penghasilan": 81,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 622,
        "nama_wisata": "Anibare Bay",
        "penghasilan": 22
      },
      {
        "id": 623,
        "nama_wisata": "Buada Lagoon",
        "penghasilan": 27
      },
      {
        "id": 624,
        "nama_wisata": "Japanese War Sites",
        "penghasilan": 32
      }
    ]
  },
  "negara_neuzelandi": {
    "country_slug": "negara_neuzelandi",
    "total_penghasilan": 348,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 625,
        "nama_wisata": "Milford Sound",
        "penghasilan": 95
      },
      {
        "id": 626,
        "nama_wisata": "Hobbiton Movie Set",
        "penghasilan": 90
      },
      {
        "id": 627,
        "nama_wisata": "Danau Taupo",
        "penghasilan": 84
      },
      {
        "id": 628,
        "nama_wisata": "Fjords Fiordland",
        "penghasilan": 79
      }
    ]
  },
  "muanui": {
    "country_slug": "muanui",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 629,
        "nama_wisata": "Avarua White Sand",
        "penghasilan": 43
      },
      {
        "id": 630,
        "nama_wisata": "Cook Islands National Museum",
        "penghasilan": 32
      },
      {
        "id": 631,
        "nama_wisata": "Pulau Aitutaki",
        "penghasilan": 37
      }
    ]
  },
  "nusantara": {
    "country_slug": "nusantara",
    "total_penghasilan": 96,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 632,
        "nama_wisata": "Avarua Town",
        "penghasilan": 37
      },
      {
        "id": 633,
        "nama_wisata": "Rarotonga Lagoon",
        "penghasilan": 32
      },
      {
        "id": 634,
        "nama_wisata": "Te Rua Manga Peak",
        "penghasilan": 27
      }
    ]
  },
  "palau": {
    "country_slug": "palau",
    "total_penghasilan": 206,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 635,
        "nama_wisata": "Rock Islands",
        "penghasilan": 84
      },
      {
        "id": 636,
        "nama_wisata": "Jellyfish Lake",
        "penghasilan": 74
      },
      {
        "id": 637,
        "nama_wisata": "Peleliu Island War Site",
        "penghasilan": 48
      }
    ]
  },
  "samoa": {
    "country_slug": "samoa",
    "total_penghasilan": 128,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 638,
        "nama_wisata": "Apia Beach",
        "penghasilan": 48
      },
      {
        "id": 639,
        "nama_wisata": "Robert Louis Stevenson Museum",
        "penghasilan": 37
      },
      {
        "id": 640,
        "nama_wisata": "Pulau Upolu",
        "penghasilan": 43
      }
    ]
  },
  "kepulauan_solomon": {
    "country_slug": "kepulauan_solomon",
    "total_penghasilan": 96,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 641,
        "nama_wisata": "Honiara City",
        "penghasilan": 37
      },
      {
        "id": 642,
        "nama_wisata": "Shortland Islands",
        "penghasilan": 32
      },
      {
        "id": 643,
        "nama_wisata": "Marovo Lagoon",
        "penghasilan": 27
      }
    ]
  },
  "tonga": {
    "country_slug": "tonga",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 644,
        "nama_wisata": "Pantai Nuku'alofa",
        "penghasilan": 43
      },
      {
        "id": 645,
        "nama_wisata": "Vavau Island",
        "penghasilan": 37
      },
      {
        "id": 646,
        "nama_wisata": "Ha'apai Group",
        "penghasilan": 32
      }
    ]
  },
  "argentina": {
    "country_slug": "argentina",
    "total_penghasilan": 353,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 647,
        "nama_wisata": "Iguazu Falls",
        "penghasilan": 100
      },
      {
        "id": 648,
        "nama_wisata": "Tango Buenos Aires",
        "penghasilan": 90
      },
      {
        "id": 649,
        "nama_wisata": "Gunung Aconcagua",
        "penghasilan": 84
      },
      {
        "id": 650,
        "nama_wisata": "Danau Bariloche",
        "penghasilan": 79
      }
    ]
  },
  "besar": {
    "country_slug": "besar",
    "total_penghasilan": 178,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 651,
        "nama_wisata": "Gunung Roraima",
        "penghasilan": 58
      },
      {
        "id": 652,
        "nama_wisata": "Orinoco River",
        "penghasilan": 51
      },
      {
        "id": 653,
        "nama_wisata": "Angel Falls",
        "penghasilan": 69
      }
    ]
  },
  "peru": {
    "country_slug": "peru",
    "total_penghasilan": 337,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 654,
        "nama_wisata": "Machu Picchu",
        "penghasilan": 100
      },
      {
        "id": 655,
        "nama_wisata": "Danau Titicaca",
        "penghasilan": 84
      },
      {
        "id": 656,
        "nama_wisata": "Nazca Lines",
        "penghasilan": 79
      },
      {
        "id": 657,
        "nama_wisata": "Lima Colonial",
        "penghasilan": 74
      }
    ]
  },
  "dinasti": {
    "country_slug": "dinasti",
    "total_penghasilan": 194,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 658,
        "nama_wisata": "Salar de Uyuni",
        "penghasilan": 74
      },
      {
        "id": 659,
        "nama_wisata": "Danau Titicaca",
        "penghasilan": 69
      },
      {
        "id": 660,
        "nama_wisata": "La Paz City",
        "penghasilan": 51
      }
    ]
  },
  "ekuador": {
    "country_slug": "ekuador",
    "total_penghasilan": 333,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 661,
        "nama_wisata": "Pulau Galapagos",
        "penghasilan": 95
      },
      {
        "id": 662,
        "nama_wisata": "Machu Picchu Area",
        "penghasilan": 90
      },
      {
        "id": 663,
        "nama_wisata": "Amazon River",
        "penghasilan": 79
      },
      {
        "id": 664,
        "nama_wisata": "Quito Historic Center",
        "penghasilan": 69
      }
    ]
  },
  "fiji_prancis": {
    "country_slug": "fiji_prancis",
    "total_penghasilan": 359,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 665,
        "nama_wisata": "Tahiti Beach Paradise",
        "penghasilan": 95
      },
      {
        "id": 666,
        "nama_wisata": "Bora Bora Lagoon",
        "penghasilan": 100
      },
      {
        "id": 667,
        "nama_wisata": "Moorea Island",
        "penghasilan": 90
      },
      {
        "id": 668,
        "nama_wisata": "Coral Gardens",
        "penghasilan": 74
      }
    ]
  },
  "brasil": {
    "country_slug": "brasil",
    "total_penghasilan": 448,
    "total_tempat_wisata": 5,
    "items": [
      {
        "id": 669,
        "nama_wisata": "Christ the Redeemer Rio",
        "penghasilan": 100
      },
      {
        "id": 670,
        "nama_wisata": "Niagara Air Iguazu",
        "penghasilan": 95
      },
      {
        "id": 671,
        "nama_wisata": "Amazon Rainforest",
        "penghasilan": 90
      },
      {
        "id": 672,
        "nama_wisata": "Pantai Copacabana",
        "penghasilan": 84
      },
      {
        "id": 673,
        "nama_wisata": "Pantai Bahia",
        "penghasilan": 79
      }
    ]
  },
  "chili": {
    "country_slug": "chili",
    "total_penghasilan": 333,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 674,
        "nama_wisata": "Atacama Desert",
        "penghasilan": 84
      },
      {
        "id": 675,
        "nama_wisata": "Torres del Paine",
        "penghasilan": 90
      },
      {
        "id": 676,
        "nama_wisata": "Moai Pulau Easter",
        "penghasilan": 95
      },
      {
        "id": 677,
        "nama_wisata": "Danau Chungara",
        "penghasilan": 64
      }
    ]
  },
  "kolombia": {
    "country_slug": "kolombia",
    "total_penghasilan": 306,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 678,
        "nama_wisata": "Cartagena Kuno",
        "penghasilan": 84
      },
      {
        "id": 679,
        "nama_wisata": "Cafe Region",
        "penghasilan": 74
      },
      {
        "id": 680,
        "nama_wisata": "Salto Angel Waterfall",
        "penghasilan": 79
      },
      {
        "id": 681,
        "nama_wisata": "Tayrona National Park",
        "penghasilan": 69
      }
    ]
  },
  "guyana": {
    "country_slug": "guyana",
    "total_penghasilan": 165,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 682,
        "nama_wisata": "Kaieteur Falls",
        "penghasilan": 64
      },
      {
        "id": 683,
        "nama_wisata": "Georgetown Harbor",
        "penghasilan": 48
      },
      {
        "id": 684,
        "nama_wisata": "Rainforest Jungle",
        "penghasilan": 53
      }
    ]
  },
  "suriname": {
    "country_slug": "suriname",
    "total_penghasilan": 112,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 685,
        "nama_wisata": "Paramaribo Fort Zeelandia",
        "penghasilan": 43
      },
      {
        "id": 686,
        "nama_wisata": "Corantijn River",
        "penghasilan": 37
      },
      {
        "id": 687,
        "nama_wisata": "Jungle Interior",
        "penghasilan": 32
      }
    ]
  },
  "uruguay": {
    "country_slug": "uruguay",
    "total_penghasilan": 222,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 688,
        "nama_wisata": "Punta del Este Resort",
        "penghasilan": 79
      },
      {
        "id": 689,
        "nama_wisata": "Colonia del Sacramento",
        "penghasilan": 74
      },
      {
        "id": 690,
        "nama_wisata": "Montevideo Rambla",
        "penghasilan": 69
      }
    ]
  },
  "venezuela": {
    "country_slug": "venezuela",
    "total_penghasilan": 217,
    "total_tempat_wisata": 3,
    "items": [
      {
        "id": 691,
        "nama_wisata": "Angel Falls",
        "penghasilan": 84
      },
      {
        "id": 692,
        "nama_wisata": "Los Roques National Park",
        "penghasilan": 69
      },
      {
        "id": 693,
        "nama_wisata": "Margarita Island Beach",
        "penghasilan": 64
      }
    ]
  },
  "bermuda": {
    "country_slug": "bermuda",
    "total_penghasilan": 223,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 694,
        "nama_wisata": "Pantai Horseshoe Bay",
        "penghasilan": 74
      },
      {
        "id": 695,
        "nama_wisata": "Gua Kristal Bermuda",
        "penghasilan": 58
      },
      {
        "id": 696,
        "nama_wisata": "Benteng St George Kuno",
        "penghasilan": 48
      },
      {
        "id": 697,
        "nama_wisata": "Royal Naval Dockyard",
        "penghasilan": 43
      }
    ]
  },
  "curacao": {
    "country_slug": "curacao",
    "total_penghasilan": 212,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 698,
        "nama_wisata": "Handelskade Willemstad",
        "penghasilan": 69
      },
      {
        "id": 699,
        "nama_wisata": "Pantai Kenepa Grandi",
        "penghasilan": 58
      },
      {
        "id": 700,
        "nama_wisata": "Taman Nasional Shete Boka",
        "penghasilan": 48
      },
      {
        "id": 701,
        "nama_wisata": "Gua Hato Kuno",
        "penghasilan": 37
      }
    ]
  },
  "greenland": {
    "country_slug": "greenland",
    "total_penghasilan": 268,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 702,
        "nama_wisata": "Ilulissat Icefjord",
        "penghasilan": 84
      },
      {
        "id": 703,
        "nama_wisata": "Disko Bay Glacier",
        "penghasilan": 69
      },
      {
        "id": 704,
        "nama_wisata": "Nuuk National Museum",
        "penghasilan": 51
      },
      {
        "id": 705,
        "nama_wisata": "Aurora Borealis Greenland",
        "penghasilan": 64
      }
    ]
  },
  "guam": {
    "country_slug": "guam",
    "total_penghasilan": 214,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 706,
        "nama_wisata": "Pantai Tumon Bay",
        "penghasilan": 74
      },
      {
        "id": 707,
        "nama_wisata": "Puntan Dos Amantes",
        "penghasilan": 58
      },
      {
        "id": 708,
        "nama_wisata": "Ritidian Point Reserve",
        "penghasilan": 45
      },
      {
        "id": 709,
        "nama_wisata": "Benteng Nuestra Senora",
        "penghasilan": 37
      }
    ]
  },
  "kamerun": {
    "country_slug": "kamerun",
    "total_penghasilan": 213,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 710,
        "nama_wisata": "Taman Nasional Waza",
        "penghasilan": 58
      },
      {
        "id": 711,
        "nama_wisata": "Gunung Kamerun",
        "penghasilan": 64
      },
      {
        "id": 712,
        "nama_wisata": "Air Terjun Lobe",
        "penghasilan": 48
      },
      {
        "id": 713,
        "nama_wisata": "Pantai Kribi Beach",
        "penghasilan": 43
      }
    ]
  },
  "lithuania": {
    "country_slug": "lithuania",
    "total_penghasilan": 265,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 714,
        "nama_wisata": "Kastil Danau Trakai",
        "penghasilan": 74
      },
      {
        "id": 715,
        "nama_wisata": "Kota Kuno Vilnius",
        "penghasilan": 69
      },
      {
        "id": 716,
        "nama_wisata": "Bukit Salib Siauliai",
        "penghasilan": 64
      },
      {
        "id": 717,
        "nama_wisata": "Semenanjung Curonian Spit",
        "penghasilan": 58
      }
    ]
  },
  "paraguay": {
    "country_slug": "paraguay",
    "total_penghasilan": 213,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 718,
        "nama_wisata": "Dam Itaipu Hydroelectric",
        "penghasilan": 64
      },
      {
        "id": 719,
        "nama_wisata": "Reruntuhan Jesuit Trinidad",
        "penghasilan": 58
      },
      {
        "id": 720,
        "nama_wisata": "Istana de los Lopez",
        "penghasilan": 48
      },
      {
        "id": 721,
        "nama_wisata": "Taman Nasional Ybycui",
        "penghasilan": 43
      }
    ]
  },
  "puerto_rico": {
    "country_slug": "puerto_rico",
    "total_penghasilan": 291,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 722,
        "nama_wisata": "Benteng El Morro San Juan",
        "penghasilan": 84
      },
      {
        "id": 723,
        "nama_wisata": "Hutan Hujan El Yunque",
        "penghasilan": 74
      },
      {
        "id": 724,
        "nama_wisata": "Teluk Bioluminescent Mosquito",
        "penghasilan": 69
      },
      {
        "id": 725,
        "nama_wisata": "Pantai Flamenco Culebra",
        "penghasilan": 64
      }
    ]
  },
  "tajikistan": {
    "country_slug": "tajikistan",
    "total_penghasilan": 215,
    "total_tempat_wisata": 4,
    "items": [
      {
        "id": 726,
        "nama_wisata": "Pegunungan Pamir Highway",
        "penghasilan": 69
      },
      {
        "id": 727,
        "nama_wisata": "Danau Iskanderkul",
        "penghasilan": 58
      },
      {
        "id": 728,
        "nama_wisata": "Lembah Wakhan",
        "penghasilan": 48
      },
      {
        "id": 729,
        "nama_wisata": "Benteng Hissar Kuno",
        "penghasilan": 40
      }
    ]
  }
};

export const TOURISM_ALIAS_MAP: Record<string, string> = {
  "amerika_serikat": "america_serikat",
  "us": "america_serikat",
  "usa": "america_serikat",
  "brazil": "brasil",
  "chile": "chili",
  "bolivia": "dinasti",
  "costa_rica": "kostrika",
  "komoro": "komori",
  "republik_demokratik_kongo": "demokratik_kongo",
  "saint_lucia": "santo_lucia",
  "saint_kitts_dan_nevis": "santo_kitts_nevis",
  "saint_vincent_dan_grenadine": "santo_vincent_grenadines",
  "saint_vincent_dan_grenadines": "santo_vincent_grenadines",
  "selandia_baru": "negara_neuzelandi",
  "new_zealand": "negara_neuzelandi",
  "trinidad_dan_tobago": "trinidat_tobago",
  "trinidad_&_tobago": "trinidat_tobago",
  "cape_verde": "cabo_verde",
  "tanjung_verde": "cabo_verde",
  "afghanistan": "afganistan",
  "algeria": "aljazair",
  "egypt": "mesir",
  "japan": "jepang",
  "south_korea": "korea_selatan",
  "north_korea": "korea_utara",
  "united_kingdom": "inggris",
  "germany": "jerman",
  "france": "prancis",
  "spain": "spanyol",
  "italy": "italia",
  "netherlands": "belanda",
  "russia": "rusia",
  "china": "china",
  "indonesia": "indonesia",
  "thailand": "thailand",
  "vietnam": "vietnam",
  "philippines": "filipina",
  "singapore": "singapura",
  "malaysia": "malaysia",
  "saudi_arabia": "arab_saudi",
  "turkey": "turki",
  "greece": "yunani",
  "madagaskar": "madagascar",
  "tahiti": "fiji_prancis",
  "polinesia_prancis": "fiji_prancis",
  "french_polynesia": "fiji_prancis",
  "republik_dominika": "dominika_republik",
  "kongo": "congo",
  "republic_of_the_congo": "congo",
  "solomon": "kepulauan_solomon",
  "solomon_islands": "kepulauan_solomon",
  "cook_islands": "muanui",
  "kepulauan_cook": "muanui",
  "turks_and_caicos": "turks_caicos",
  "turks_dan_caicos": "turks_caicos",
  "virgin_islands": "kepulauan_virgin"
};

export const normalizeCountrySlug = (countryNameOrSlug: any): string => {
  if (!countryNameOrSlug) return '';
  const raw = String(countryNameOrSlug).toLowerCase().trim();
  const clean = raw.replace(/[\s-]+/g, '_').replace(/['"]/g, '');
  if (TOURISM_DATA_BY_SLUG[clean]) return clean;
  if (TOURISM_ALIAS_MAP[clean]) return TOURISM_ALIAS_MAP[clean];
  return clean;
};

export const getTourismSummary = (country: any): CountryTourismSummary => {
  if (!country) return { country_slug: '', total_penghasilan: 0, total_tempat_wisata: 0, items: [] };

  let raw = '';
  if (typeof country === 'string') {
    raw = country;
  } else if (typeof country === 'object') {
    raw = country.country_slug || country.slug || country.country || country.name_id || country.nama_negara || country.country_name || country.name || '';
  }

  const slug = normalizeCountrySlug(raw);
  if (TOURISM_DATA_BY_SLUG[slug]) {
    return TOURISM_DATA_BY_SLUG[slug];
  }

  // Secondary check try matching by words
  for (const key of Object.keys(TOURISM_DATA_BY_SLUG)) {
    if (slug.includes(key) || key.includes(slug)) {
      return TOURISM_DATA_BY_SLUG[key];
    }
  }

  return { country_slug: slug, total_penghasilan: 0, total_tempat_wisata: 0, items: [] };
};

export const getTourismTotalIncome = (country: any): number => {
  return getTourismSummary(country).total_penghasilan;
};

export const getTourismItemCount = (country: any): number => {
  return getTourismSummary(country).total_tempat_wisata;
};
