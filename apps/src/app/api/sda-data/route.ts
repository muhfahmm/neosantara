import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const removeComments = (input: string) =>
  input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

const findLiteral = (input: string, start: number) => {
  let depth = 0;
  let inString: string | null = null;
  let escaped = false;
  const openingChar = input[start];
  const closingChar = openingChar === '[' ? ']' : openingChar === '{' ? '}' : null;
  if (!closingChar) return null;
  for (let i = start; i < input.length; i++) {
    const char = input[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (inString) {
      if (char === inString) inString = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') { inString = char; continue; }
    if (char === openingChar) { depth += 1; continue; }
    if (char === closingChar) {
      depth -= 1;
      if (depth === 0) return input.slice(start, i + 1);
    }
  }
  return null;
};

const extractObjectFromTS = (content: string): Record<string, boolean> | null => {
  const cleaned = removeComments(content);
  const constRegex = /(?:const|let|var)\s+\w+\s*=\s*[{]/g;
  let match: RegExpExecArray | null;
  while ((match = constRegex.exec(cleaned))) {
    const start = match.index + match[0].length - 1;
    const literal = findLiteral(cleaned, start);
    if (literal) {
      try {
        const result = new Function(`"use strict"; return (${literal});`)();
        if (result && typeof result === 'object' && !Array.isArray(result)) {
          return result;
        }
      } catch (_) {}
    }
  }
  return null;
};

// Map country display name -> relative SDA file path
// Uses the same country-paths.json as reference
const countryPaths: Record<string, string> = {
  'Afrika Selatan': 'afrika/1_afrika_selatan.ts',
  'Aljazair': 'afrika/2_aljazair.ts',
  'Angola': 'afrika/3_angola.ts',
  'Benin': 'afrika/4_benin.ts',
  'Botswana': 'afrika/5_botswana.ts',
  'Burkina Faso': 'afrika/6_burkina_faso.ts',
  'Burundi': 'afrika/7_burundi.ts',
  'Chad': 'afrika/8_chad.ts',
  'Djibouti': 'afrika/9_djibouti.ts',
  'Eritrea': 'afrika/10_eritrea.ts',
  'Eswatini': 'afrika/11_eswatini.ts',
  'Ethiopia': 'afrika/12_ethiopia.ts',
  'Gabon': 'afrika/13_gabon.ts',
  'Gambia': 'afrika/14_gambia.ts',
  'Ghana': 'afrika/15_ghana.ts',
  'Guinea': 'afrika/16_guinea.ts',
  'Guinea Bissau': 'afrika/17_guinea_bissau.ts',
  'Kamerun': 'afrika/18_kamerun.ts',
  'Kenya': 'afrika/19_kenya.ts',
  'Komoro': 'afrika/20_komoro.ts',
  'Kongo': 'afrika/21_kongo.ts',
  'Lesotho': 'afrika/22_lesotho.ts',
  'Liberia': 'afrika/23_liberia.ts',
  'Libya': 'afrika/24_libya.ts',
  'Madagaskar': 'afrika/25_madagaskar.ts',
  'Malawi': 'afrika/26_malawi.ts',
  'Mali': 'afrika/27_mali.ts',
  'Maroko': 'afrika/28_maroko.ts',
  'Mauritania': 'afrika/29_mauritania.ts',
  'Mauritius': 'afrika/30_mauritius.ts',
  'Mesir': 'afrika/31_mesir.ts',
  'Mozambik': 'afrika/32_mozambik.ts',
  'Namibia': 'afrika/33_namibia.ts',
  'Niger': 'afrika/34_niger.ts',
  'Nigeria': 'afrika/35_nigeria.ts',
  'Pantai Gading': 'afrika/36_pantai_gading.ts',
  'Republik Afrika Tengah': 'afrika/37_republik_afrika_tengah.ts',
  'Republik Demokratik Kongo': 'afrika/38_republik_demokratik_kongo.ts',
  'Republik Sudan': 'afrika/39_republik_sudan.ts',
  'Republik Tanzania': 'afrika/40_republik_tanzania.ts',
  'Republik Uganda': 'afrika/41_republik_uganda.ts',
  'Republik Zambia': 'afrika/42_republik_zambia.ts',
  'Republik Zimbabwe': 'afrika/43_republik_zimbabwe.ts',
  'Rwanda': 'afrika/44_rwanda.ts',
  'Sao Tome Dan Principe': 'afrika/45_sao_tome_dan_principe.ts',
  'Senegal': 'afrika/46_senegal.ts',
  'Seychelles': 'afrika/47_seychelles.ts',
  'Sierra Leone': 'afrika/48_sierra_leone.ts',
  'Somalia': 'afrika/49_somalia.ts',
  'Sudan Selatan': 'afrika/50_sudan_selatan.ts',
  'Tanjung Verde': 'afrika/51_tanjung_verde.ts',
  'Togo': 'afrika/52_togo.ts',
  'Tunisia': 'afrika/53_tunisia.ts',
  'Afganistan': 'asia/54_afganistan.ts',
  'Arab Saudi': 'asia/55_arab_saudi.ts',
  'Armenia': 'asia/56_armenia.ts',
  'Azerbaijan': 'asia/57_azerbaijan.ts',
  'Bahrain': 'asia/58_bahrain.ts',
  'Bangladesh': 'asia/59_bangladesh.ts',
  'Bhutan': 'asia/60_bhutan.ts',
  'Brunei': 'asia/61_brunei.ts',
  'China': 'asia/62_china.ts',
  'Filipina': 'asia/63_filipina.ts',
  'Georgia': 'asia/64_georgia.ts',
  'Hong Kong': 'asia/65_hong_kong.ts',
  'India': 'asia/66_india.ts',
  'Indonesia': 'asia/67_indonesia.ts',
  'Irak': 'asia/68_irak.ts',
  'Iran': 'asia/69_iran.ts',
  'Israel': 'asia/70_israel.ts',
  'Jepang': 'asia/71_jepang.ts',
  'Kamboja': 'asia/72_kamboja.ts',
  'Kazakhstan': 'asia/73_kazakhstan.ts',
  'Kirgizstan': 'asia/74_kirgizstan.ts',
  'Korea Selatan': 'asia/75_korea_selatan.ts',
  'Korea Utara': 'asia/76_korea_utara.ts',
  'Kuwait': 'asia/77_kuwait.ts',
  'Laos': 'asia/78_laos.ts',
  'Lebanon': 'asia/79_lebanon.ts',
  'Makau': 'asia/80_makau.ts',
  'Malaysia': 'asia/81_malaysia.ts',
  'Maldives': 'asia/82_maldives.ts',
  'Mongolia': 'asia/83_mongolia.ts',
  'Myanmar': 'asia/84_myanmar.ts',
  'Nepal': 'asia/85_nepal.ts',
  'Oman': 'asia/86_oman.ts',
  'Pakistan': 'asia/87_pakistan.ts',
  'Palestina': 'asia/88_palestina.ts',
  'Qatar': 'asia/89_qatar.ts',
  'Republik Timor Leste': 'asia/90_republik_timor_leste.ts',
  'Singapura': 'asia/91_singapura.ts',
  'Siprus': 'eropa/142_siprus.ts',
  'Sri Lanka': 'asia/92_sri_lanka.ts',
  'Suriah': 'asia/93_suriah.ts',
  'Taiwan': 'asia/94_taiwan.ts',
  'Tajikistan': 'asia/95_tajikistan.ts',
  'Thailand': 'asia/96_thailand.ts',
  'Turki': 'eropa/148_turki.ts',
  'Turkmenistan': 'asia/97_turkmenistan.ts',
  'Uni Emirat Arab': 'asia/98_uni_emirat_arab.ts',
  'Uzbekistan': 'asia/99_uzbekistan.ts',
  'Vietnam': 'asia/100_vietnam.ts',
  'Yaman': 'asia/101_yaman.ts',
  'Yordania': 'asia/102_yordania.ts',
  'Albania': 'eropa/103_albania.ts',
  'Andorra': 'eropa/104_andorra.ts',
  'Austria': 'eropa/105_austria.ts',
  'Belanda': 'eropa/106_belanda.ts',
  'Belarus': 'eropa/107_belarus.ts',
  'Belgia': 'eropa/108_belgia.ts',
  'Bosnia Dan Hercegovina': 'eropa/109_bosnia_dan_hercegovina.ts',
  'Bulgaria': 'eropa/110_bulgaria.ts',
  'Ceko': 'eropa/111_ceko.ts',
  'Denmark': 'eropa/112_denmark.ts',
  'Estonia': 'eropa/113_estonia.ts',
  'Finlandia': 'eropa/114_finlandia.ts',
  'Gibraltar': 'eropa/115_gibraltar.ts',
  'Hungaria': 'eropa/116_hungaria.ts',
  'Inggris': 'eropa/117_inggris.ts',
  'Irlandia': 'eropa/118_irlandia.ts',
  'Islandia': 'eropa/119_islandia.ts',
  'Italia': 'eropa/120_italia.ts',
  'Jerman': 'eropa/121_jerman.ts',
  'Kepulauan Faroe': 'eropa/122_kepulauan_faroe.ts',
  'Kosovo': 'eropa/123_kosovo.ts',
  'Kroasia': 'eropa/124_kroasia.ts',
  'Latvia': 'eropa/125_latvia.ts',
  'Liechtenstein': 'eropa/126_liechtenstein.ts',
  'Lithuania': 'eropa/127_lithuania.ts',
  'Luksemburg': 'eropa/128_luksemburg.ts',
  'Makedonia Utara': 'eropa/129_makedonia_utara.ts',
  'Malta': 'eropa/130_malta.ts',
  'Moldova': 'eropa/131_moldova.ts',
  'Monako': 'eropa/132_monako.ts',
  'Montenegro': 'eropa/133_montenegro.ts',
  'Norwegia': 'eropa/134_norwegia.ts',
  'Polandia': 'eropa/135_polandia.ts',
  'Portugal': 'eropa/136_portugal.ts',
  'Prancis': 'eropa/137_prancis.ts',
  'Republik Rumania': 'eropa/138_republik_rumania.ts',
  'Republik Serbia': 'eropa/139_republik_serbia.ts',
  'Rusia': 'eropa/140_rusia.ts',
  'San Marino': 'eropa/141_san_marino.ts',
  'Slovenia': 'eropa/143_slovenia.ts',
  'Slowakia': 'eropa/144_slowakia.ts',
  'Spanyol': 'eropa/145_spanyol.ts',
  'Swedia': 'eropa/146_swedia.ts',
  'Swiss': 'eropa/147_swiss.ts',
  'Ukraina': 'eropa/149_ukraina.ts',
  'Vatikan': 'eropa/150_vatikan.ts',
  'Yunani': 'eropa/151_yunani.ts',
  'Amerika Serikat': 'na/152_amerika_serikat.ts',
  'Antigua Dan Barbuda': 'na/153_antigua_dan_barbuda.ts',
  'Bahama': 'na/154_bahama.ts',
  'Barbados': 'na/155_barbados.ts',
  'Belize': 'na/156_belize.ts',
  'Bermuda': 'na/157_bermuda.ts',
  'Costa Rica': 'na/158_costa_rica.ts',
  'Curacao': 'na/159_curacao.ts',
  'Dominika': 'na/160_dominika.ts',
  'El Salvador': 'na/161_el_salvador.ts',
  'Greenland': 'na/162_greenland.ts',
  'Grenada': 'na/163_grenada.ts',
  'Guatemala': 'na/164_guatemala.ts',
  'Haiti': 'na/165_haiti.ts',
  'Honduras': 'na/166_honduras.ts',
  'Jamaika': 'na/167_jamaika.ts',
  'Kanada': 'na/168_kanada.ts',
  'Kuba': 'na/169_kuba.ts',
  'Meksiko': 'na/170_meksiko.ts',
  'Nikaragua': 'na/171_nikaragua.ts',
  'Panama': 'na/172_panama.ts',
  'Puerto Rico': 'na/173_puerto_rico.ts',
  'Republik Dominika': 'na/174_republik_dominika.ts',
  'Saint Kitts Dan Nevis': 'na/175_saint_kitts_dan_nevis.ts',
  'Saint Lucia': 'na/176_saint_lucia.ts',
  'Saint Vincent Dan Grenadine': 'na/177_saint_vincent_dan_grenadine.ts',
  'Trinidad Dan Tobago': 'na/178_trinidad_dan_tobago.ts',
  'Australia': 'oceania/179_australia.ts',
  'Fiji': 'oceania/180_fiji.ts',
  'Guam': 'oceania/181_guam.ts',
  'Kiribati': 'oceania/182_kiribati.ts',
  'Marshall': 'oceania/183_marshall.ts',
  'Mikronesia': 'oceania/184_mikronesia.ts',
  'Nauru': 'oceania/185_nauru.ts',
  'Palau': 'oceania/186_palau.ts',
  'Papua Nugini': 'oceania/187_papua_nugini.ts',
  'Samoa': 'oceania/188_samoa.ts',
  'Samoa Amerika': 'oceania/189_samoa_amerika.ts',
  'Selandia Baru': 'oceania/190_selandia_baru.ts',
  'Tahiti': 'oceania/191_tahiti.ts',
  'Tonga': 'oceania/192_tonga.ts',
  'Tuvalu': 'oceania/193_tuvalu.ts',
  'Vanuatu': 'oceania/194_vanuatu.ts',
  'Argentina': 'sa/195_argentina.ts',
  'Bolivia': 'sa/196_bolivia.ts',
  'Brazil': 'sa/197_brazil.ts',
  'Chile': 'sa/198_chile.ts',
  'Ekuador': 'sa/199_ekuador.ts',
  'Guiana Prancis': 'sa/200_guiana_prancis.ts',
  'Guyana': 'sa/201_guyana.ts',
  'Kolombia': 'sa/202_kolombia.ts',
  'Paraguay': 'sa/203_paraguay.ts',
  'Peru': 'sa/204_peru.ts',
  'Suriname': 'sa/205_suriname.ts',
  'Uruguay': 'sa/206_uruguay.ts',
  'Venezuela': 'sa/207_venezuela.ts',
};

const SDA_ROOT = path.join(process.cwd(), '..', 'json', 'database_SDA');

let cachedAllSDA: Record<string, any> | null = null;
const cachedSdaMap = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countryName = searchParams.get('country');

  if (!countryName) {
    if (cachedAllSDA) return NextResponse.json(cachedAllSDA);
    // Return all SDA data
    const result: Record<string, any> = {};
    for (const [name, relPath] of Object.entries(countryPaths)) {
      const filePath = path.join(SDA_ROOT, relPath);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = extractObjectFromTS(content);
        if (parsed) result[name] = parsed;
      }
    }
    cachedAllSDA = result;
    return NextResponse.json(result);
  }

  // Find by name (case-insensitive)
  const normalizedInput = countryName.trim().toLowerCase();
  const matchedKey = Object.keys(countryPaths).find(k => k.toLowerCase() === normalizedInput);

  if (!matchedKey) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  if (cachedSdaMap.has(matchedKey)) {
    return NextResponse.json(cachedSdaMap.get(matchedKey));
  }

  const relPath = countryPaths[matchedKey];
  const filePath = path.join(SDA_ROOT, relPath);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'SDA file not found' }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = extractObjectFromTS(content);

  if (!parsed) {
    return NextResponse.json({ error: 'Failed to parse SDA data' }, { status: 500 });
  }

  cachedSdaMap.set(matchedKey, parsed);
  return NextResponse.json(parsed);
}
