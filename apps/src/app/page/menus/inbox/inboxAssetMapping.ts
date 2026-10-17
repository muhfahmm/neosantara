// Mapping asset gambar untuk notifikasi inbox berdasarkan tradeType, eventName, atau title

export function getInboxNotificationImage(notif: any): string | null {
  if (!notif) return null;

  const tradeType = notif.tradeType || notif.type;
  const eventName = notif.eventName || notif.title || '';
  const lowerName = String(eventName).toLowerCase();

  // 1. Kebutuhan Pokok Warga & Demografi
  if (tradeType === 'defisit_listrik') {
    return '/images/game/inbox_assets/1_kebutuhan_pokok_warga_demografi/defisit listrik.svg';
  }
  if (tradeType === 'defisit_hunian') {
    return '/images/game/inbox_assets/1_kebutuhan_pokok_warga_demografi/defisit hunian.svg';
  }
  if (tradeType === 'defisit_pangan') {
    return '/images/game/inbox_assets/1_kebutuhan_pokok_warga_demografi/defisit pangan.svg';
  }
  if (tradeType === 'defisit_populasi') {
    return '/images/game/inbox_assets/1_kebutuhan_pokok_warga_demografi/defisit populasi.svg';
  }
  if (tradeType === 'defisit_tempat_umum') {
    return '/images/game/inbox_assets/1_kebutuhan_pokok_warga_demografi/defisit tempat umum.svg';
  }

  // 2. Hubungan Internasional & Diplomasi
  if (tradeType === 'hubungan_panas') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/Hubungan Panas.svg';
  }
  if (tradeType === 'penawaran_aliansi_pertahanan') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/Penawaran Aliansi Pertahanan.svg';
  }
  if (tradeType === 'penawaran_kontrak_penelitian') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/Penawaran Kontrak Penelitian.svg';
  }
  if (tradeType === 'penawaran_pakta_non_agresi') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/Penawaran Pakta Non-Agresi.svg';
  }
  if (tradeType === 'penawaran_kedutaan_besar') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/tawaran kedubes.svg';
  }
  if (tradeType === 'penawaran_hubungan_dagang') {
    return '/images/game/inbox_assets/2_hubungan_internasional_diplomasi/tawaran perdagangan.svg';
  }

  // 3. Organisasi Internasional & PBB
  if (tradeType === 'usulan_resolusi_pbb') {
    return '/images/game/inbox_assets/3_organisasi_internasional_pbb/usulan_resolusi_pbb.svg';
  }
  if (tradeType === 'usulan_keamanan_pbb') {
    return '/images/game/inbox_assets/3_organisasi_internasional_pbb/usulan_keamanan_pbb.svg';
  }

  // 4. Perdagangan Komoditas Bilateral
  if (tradeType === 'jual') {
    return '/images/game/inbox_assets/4_perdagangan_komoditas_bilateral/jual.svg';
  }
  if (tradeType === 'beli') {
    return '/images/game/inbox_assets/4_perdagangan_komoditas_bilateral/beli.svg';
  }

  // 5. Keamanan, Militer & Pertahanan
  if (tradeType === 'diserang') {
    return '/images/game/inbox_assets/5_keamanan_militer_pertahanan/invasi militer.svg';
  }
  if (tradeType === 'keamanan' || (notif.eventType === 'police')) {
    return '/images/game/inbox_assets/5_keamanan_militer_pertahanan/kriminalitas.svg';
  }
  if (tradeType === 'sabotase') {
    return '/images/game/inbox_assets/5_keamanan_militer_pertahanan/sabotase industri.svg';
  }
  if (tradeType === 'pemberontakan') {
    return '/images/game/inbox_assets/5_keamanan_militer_pertahanan/sparatisme.svg';
  }
  if (tradeType === 'spionase') {
    return '/images/game/inbox_assets/5_keamanan_militer_pertahanan/spionase.svg';
  }

  // 6. Program Nuklir
  if (tradeType === 'program_nuklir_dimulai') {
    return '/images/game/inbox_assets/6_program_nuklir/program_nuklir_dimulai.svg';
  }
  if (tradeType === 'program_nuklir_selesai' || tradeType === 'icbm') {
    return '/images/game/inbox_assets/6_program_nuklir/program_nuklir_selesai.svg';
  }

  // 7. Bencana Alam & Lingkungan
  if (tradeType === 'bencana_alam') {
    // 7.1 Geologi
    if (lowerName.includes('gempa bumi besar')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/7_bencana_geologi/Gempa Bumi Besar.svg';
    if (lowerName.includes('gempa')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/7_bencana_geologi/Gempa Bumi Ringan.svg';
    if (lowerName.includes('gunung')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/7_bencana_geologi/Letusan Gunung Berapi.svg';
    if (lowerName.includes('tsunami')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/7_bencana_geologi/Tsunami.svg';
    if (lowerName.includes('longsor')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/7_bencana_geologi/Tanah Longsor.svg';

    // 7.2 Hidrometeorologi
    if (lowerName.includes('banjir bandang')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Banjir Bandang.svg';
    if (lowerName.includes('banjir')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Banjir Besar.svg';
    if (lowerName.includes('kekeringan')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Kekeringan Panjang.svg';
    if (lowerName.includes('badai')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Badai Tropis.svg';
    if (lowerName.includes('siklon')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Siklon Tropis.svg';
    if (lowerName.includes('puting beliung') && !lowerName.includes('laut')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Angin Puting Beliung.svg';
    if (lowerName.includes('hujan es')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Hujan Es Ekstrem.svg';

    // 7.3 Kebakaran
    if (lowerName.includes('kebakaran hutan')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/9_bencana_kebakaran/Kebakaran Hutan.svg';
    if (lowerName.includes('gambut')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/9_bencana_kebakaran/Kebakaran Lahan Gambut.svg';
    if (lowerName.includes('kebakaran industri')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/9_bencana_kebakaran/Kebakaran Industri.svg';
    if (lowerName.includes('permukiman padat') || lowerName.includes('kebakaran')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/9_bencana_kebakaran/Kebakaran Permukiman Padat.svg';

    // 7.4 Laut & Pesisir
    if (lowerName.includes('abrasi')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/10_bencana_laut_pesisir/Abrasi Pantai.svg';
    if (lowerName.includes('kenaikan air laut') || lowerName.includes('rob')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/10_bencana_laut_pesisir/Kenaikan Air Laut (Banjir Rob).svg';
    if (lowerName.includes('puting beliung laut')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/10_bencana_laut_pesisir/Puting Beliung Laut.svg';

    // 7.5 Krisis Kesehatan Lingkungan
    if (lowerName.includes('keracunan') && lowerName.includes('air')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/11_krisis_kesehatan_lingkungan/Keracunan Air Bersih.svg';
    if (lowerName.includes('keracunan') && lowerName.includes('pangan')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/11_krisis_kesehatan_lingkungan/Keracunan Massal Pangan.svg';
    if (lowerName.includes('limbah') || lowerName.includes('b3')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/11_krisis_kesehatan_lingkungan/Krisis Limbah B3.svg';
    if (lowerName.includes('polusi')) return '/images/game/inbox_assets/7_bencana_alam_lingkungan/11_krisis_kesehatan_lingkungan/Polusi Udara Ekstrem.svg';

    return '/images/game/inbox_assets/7_bencana_alam_lingkungan/8_bencana_hidrometeorologi/Banjir Besar.svg';
  }

  // 8. Wabah Penyakit & Epidemi
  if (tradeType === 'wabah_penyakit') {
    // 8.1 Penyakit Menular
    if (lowerName.includes('campak')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Campak.svg';
    if (lowerName.includes('berdarah') || lowerName.includes('dbd')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Demam Berdarah (DBD).svg';
    if (lowerName.includes('difteri')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Difteri.svg';
    if (lowerName.includes('hepatitis')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Hepatitis A.svg';
    if (lowerName.includes('kolera')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Kolera.svg';
    if (lowerName.includes('malaria')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Malaria.svg';
    if (lowerName.includes('polio')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Polio.svg';
    if (lowerName.includes('rabies')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Rabies.svg';
    if (lowerName.includes('tifus')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Tifus.svg';
    if (lowerName.includes('tuberkulosis') || lowerName.includes('tbc')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Tuberkulosis (TBC).svg';

    // 8.2 Hewan & Tumbuhan
    if (lowerName.includes('flu babi') || lowerName.includes('asf')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Flu Babi Afrika (ASF).svg';
    if (lowerName.includes('flu burung') || lowerName.includes('h5n1')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Flu Burung (H5N1).svg';
    if (lowerName.includes('tikus')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Hama Tikus Massal.svg';
    if (lowerName.includes('wereng')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Hama Wereng Padi.svg';
    if (lowerName.includes('ganoderma') || lowerName.includes('sawit')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Jamur Ganoderma (Kelapa Sawit).svg';
    if (lowerName.includes('pisang')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Layu Bakteri Pisang.svg';
    if (lowerName.includes('pmk') || lowerName.includes('mulut & kuku') || lowerName.includes('mulut dan kuku')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Penyakit Mulut & Kuku (PMK).svg';
    if (lowerName.includes('tungro')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/13_penyakit_hewan_tumbuhan/Virus Tungro.svg';

    // 8.3 Mutasi Genetik & Superbug
    if (lowerName.includes('autoimun')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/14_penyakit_baru_mutasi_genetik/Penyakit Autoimun Massal.svg';
    if (lowerName.includes('candida') || lowerName.includes('auris')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/14_penyakit_baru_mutasi_genetik/Wabah Jamur Mematikan (Candida Auris).svg';
    if (lowerName.includes('superbug')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/14_penyakit_baru_mutasi_genetik/Wabah Superbug Resistant.svg';

    // 8.4 Pandemi Global
    if (lowerName.includes('zombie')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Virus Zombie (Bio-Lab Outbreak).svg';
    if (lowerName.includes('flu spanyol')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Mutasi Flu Spanyol Rekayasa.svg';
    if (lowerName.includes('cacar monyet') || lowerName.includes('mpox')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Pandemi Cacar Monyet (Mpox).svg';
    if (lowerName.includes('hiv') || lowerName.includes('aids')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Pandemi HIV_AIDS Varian Baru.svg';
    if (lowerName.includes('corona') || lowerName.includes('covid')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Pandemi Virus Corona Mutasi.svg';
    if (lowerName.includes('pathogen x') || lowerName.includes('virus baru')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Pandemi Virus Baru (Pathogen X).svg';
    if (lowerName.includes('influenza') || lowerName.includes('pandemi')) return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/15_pandemi_global/Pandemi Influenza Global.svg';

    return '/images/game/inbox_assets/8_wabah_penyakit_epidemi/12_wabah_penyakit_menular/Wabah Demam Berdarah (DBD).svg';
  }

  // Notifikasi Kebijakan / Sosial
  if (tradeType === 'perubahan_pajak' || tradeType === 'harga_barang_pokok' || tradeType === 'kebijakan_subsidi' || tradeType === 'perubahan_sistem_ekonomi') {
    return '/images/game/inbox_assets/4_perdagangan_komoditas_bilateral/jual.svg';
  }

  return null;
}
