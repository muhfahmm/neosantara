const COUNTRY_NAMES = [
  "afganistan", "afrika selatan", "albania", "aljazair", "amerika serikat", "andorra", "angola",
  "antigua dan barbuda", "arab saudi", "argentina", "armenia", "australia", "austria", "azerbaijan",
  "bahama", "bahrain", "bangladesh", "barbados", "belanda", "belarus", "belgia", "belize", "benin",
  "bermuda", "bhutan", "bolivia", "bonaire sint eustatius dan saba", "bosnia dan hercegovina",
  "botswana", "brazil", "brunei", "bulgaria", "burkina faso", "burundi", "ceko", "chad", "chile",
  "china", "costa rica", "curacao", "denmark", "djibouti", "dominika", "ekuador", "el salvador",
  "eritrea", "estonia", "eswatini", "ethiopia", "fiji", "filipina", "finlandia", "gabon", "gambia",
  "georgia", "ghana", "gibraltar", "greenland", "grenada", "guadeloupe", "guam", "guatemala",
  "guiana prancis", "guinea", "guinea bissau", "guyana", "haiti", "honduras", "hong kong", "hungaria",
  "india", "indonesia", "inggris", "irak", "iran", "irlandia", "islandia", "israel", "italia",
  "jamaika", "jepang", "jerman", "kamboja", "kamerun", "kanada", "kazakhstan", "kenya",
  "kepulauan faroe", "kirgizstan", "kiribati", "kolombia", "komoro", "kongo", "korea selatan",
  "korea utara", "kosovo", "kroasia", "kuba", "kuwait", "laos", "latvia", "lebanon", "lesotho",
  "liberia", "libya", "liechtenstein", "lithuania", "luksemburg", "madagaskar", "makau",
  "makedonia utara", "malawi", "malaysia", "maldives", "mali", "malta", "maroko", "marshall",
  "martinique", "mauritania", "mauritius", "mayotte", "meksiko", "mesir", "mikronesia", "moldova",
  "monako", "mongolia", "montenegro", "mozambik", "myanmar", "namibia", "nauru", "nepal", "niger",
  "nigeria", "nikaragua", "norwegia", "oman", "pakistan", "palau", "palestina", "panama",
  "pantai gading", "papua nugini", "paraguay", "peru", "polandia", "portugal", "prancis",
  "puerto rico", "qatar", "republik afrika tengah", "republik demokratik kongo", "republik dominika",
  "republik rumania", "republik serbia", "republik sudan", "republik tanzania", "republik timor leste",
  "republik uganda", "republik zambia", "republik zimbabwe", "reunion", "rusia", "rwanda",
  "saint kitts dan nevis", "saint lucia", "saint vincent dan grenadine", "samoa", "samoa amerika",
  "san marino", "sao tome dan principe", "selandia baru", "senegal", "seychelles", "sierra leone",
  "singapura", "siprus", "slovenia", "slowakia", "somalia", "spanyol", "sri lanka", "sudan selatan",
  "suriah", "suriname", "swedia", "swiss", "tahiti", "taiwan", "tajikistan", "tanjung verde",
  "thailand", "togo", "tonga", "trinidad dan tobago", "tunisia", "turki", "turkmenistan", "tuvalu",
  "ukraina", "uni emirat arab", "uruguay", "uzbekistan", "vanuatu", "vatikan", "venezuela", "vietnam",
  "yaman", "yordania", "yunani",
] as const;

const LANDLOCKED_NAMES = new Set<string>([
  "afganistan",
  "andorra",
  "armenia",
  "austria",
  "azerbaijan",
  "belarus",
  "bhutan",
  "bolivia",
  "botswana",
  "burkina faso",
  "burundi",
  "ceko",
  "chad",
  "eswatini",
  "ethiopia",
  "hungaria",
  "kazakhstan",
  "kirgizstan",
  "laos",
  "lesotho",
  "liechtenstein",
  "luksemburg",
  "malawi",
  "mali",
  "moldova",
  "mongolia",
  "nepal",
  "niger",
  "makedonia utara",
  "paraguay",
  "republik afrika tengah",
  "republik serbia",
  "rwanda",
  "san marino",
  "slowakia",
  "sudan selatan",
  "swiss",
  "tajikistan",
  "turkmenistan",
  "republik uganda",
  "uzbekistan",
  "vatikan",
  "republik zambia",
  "republik zimbabwe",
  "kosovo",
]);

const COUNTRY_ALIASES: Record<string, string> = {
  "afghanistan": "afganistan",
  "south africa": "afrika selatan",
  "algeria": "aljazair",
  "united states": "amerika serikat",
  "united states of america": "amerika serikat",
  "bosnia and herzegovina": "bosnia dan hercegovina",
  "czechia": "ceko",
  "czech republic": "ceko",
  "belarus": "belarus",
  "denmark": "denmark",
  "dominica": "dominika",
  "ecuador": "ekuador",
  "el salvador": "el salvador",
  "united kingdom": "inggris",
  "great britain": "inggris",
  "iraq": "irak",
  "ireland": "irlandia",
  "iceland": "islandia",
  "japan": "jepang",
  "germany": "jerman",
  "cambodia": "kamboja",
  "cameroon": "kamerun",
  "netherlands": "belanda",
  "kyrgyzstan": "kirgizstan",
  "north korea": "korea utara",
  "south korea": "korea selatan",
  "lao people's democratic republic": "laos",
  "macau": "makau",
  "north macedonia": "makedonia utara",
  "marshall islands": "marshall",
  "micronesia": "mikronesia",
  "myanmar (burma)": "myanmar",
  "nicaragua": "nikaragua",
  "ivory coast": "pantai gading",
  "cote d ivoire": "pantai gading",
  "papua new guinea": "papua nugini",
  "poland": "polandia",
  "france": "prancis",
  "central african republic": "republik afrika tengah",
  "democratic republic of the congo": "republik demokratik kongo",
  "dominican republic": "republik dominika",
  "romania": "republik rumania",
  "serbia": "republik serbia",
  "south sudan": "sudan selatan",
  "switzerland": "swiss",
  "cape verde": "tanjung verde",
  "turkey": "turki",
  "united arab emirates": "uni emirat arab",
  "vatican city": "vatikan",
  "uganda": "republik uganda",
  "zambia": "republik zambia",
  "zimbabwe": "republik zimbabwe",
  "yemen": "yaman",
  "greece": "yunani",
};

function normalizeCountryName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const COUNTRY_MAP_ACCESS = new Map<string, "land" | "sea">(
  COUNTRY_NAMES.map((name) => [name, LANDLOCKED_NAMES.has(name) ? "land" : "sea"]),
);

if (COUNTRY_NAMES.length !== 212 || COUNTRY_MAP_ACCESS.size !== 212) {
  throw new Error("Katalog akses laut harus memuat 212 negara/nama wilayah yang unik.");
}

export function getCountryMapAccess(name: string): "land" | "sea" {
  const normalized = normalizeCountryName(name);
  const canonicalName = COUNTRY_ALIASES[normalized] ?? normalized;
  return COUNTRY_MAP_ACCESS.get(canonicalName) ?? "land";
}

export function shouldUseSeaWarMap(attackerName: string, targetName: string): boolean {
  return getCountryMapAccess(attackerName) === "sea" && getCountryMapAccess(targetName) === "sea";
}

export function getCountryMapAccessCatalog(): ReadonlyArray<{ name: string; access: "land" | "sea" }> {
  return COUNTRY_NAMES.map((name) => ({
    name,
    access: LANDLOCKED_NAMES.has(name) ? "land" : "sea",
  }));
}
