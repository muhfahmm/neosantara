import {
  isEligibleForAllyRequest,
  createAllyHelpRequest,
  expireAllyHelpRequest,
  BANTUAN_SEKUTU_CONFIG,
  type AllyRequestContext,
  type BantuanSekutuNotification,
} from '../src/app/page/menus/inbox/logic/15_notifikasi_bantuan_sekutu/bantuanSekutuLogic.ts';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log('=== MEMULAI TEST FITUR PERMINTAAN BANTUAN SEKUTU ===');

// 1. UJI SIMULASI 10.000 PERANG AI VS AI TANPA ALIANSI PERTAHANAN AKTIF
console.log('1. Simulasi 10.000 perang AI vs AI tanpa aliansi pertahanan aktif...');
let requestsWithoutAlliance = 0;
for (let i = 0; i < 10000; i++) {
  const context: AllyRequestContext = {
    playerCountry: 'Indonesia',
    playerIso: 'IDN',
    defenseAlliances: ['Jepang', 'Australia'], // Tidak beraliansi dengan target (Malaysia)
    attackerCountry: 'Singapura',
    attackerIso: 'SGP',
    targetCountry: 'Malaysia',
    targetIso: 'MYS',
    currentDateStr: '2026-11-06',
  };
  const notif = createAllyHelpRequest(context);
  if (notif !== null) {
    requestsWithoutAlliance++;
  }
}
assert(requestsWithoutAlliance === 0, `Harus 0 permintaan tanpa aliansi pertahanan aktif, ditemukan: ${requestsWithoutAlliance}`);
console.log('  ✅ Lolos: Tepat 0 permintaan dari 10.000 simulasi perang.');

// 2. UJI DENGAN NAP, PERJANJIAN DAGANG, ATAU ALIANSI KEDALUWARSA / BUKAN DEFENSE ALLIANCE
console.log('2. Uji tipe perjanjian non-aliansi pertahanan...');
{
  const context: AllyRequestContext = {
    playerCountry: 'Indonesia',
    playerIso: 'IDN',
    defenseAlliances: [], // Tidak ada aliansi pertahanan (misal hanya punya NAP atau Dagang)
    attackerCountry: 'China',
    targetCountry: 'Filipina',
    currentDateStr: '2026-11-06',
  };
  const notif = createAllyHelpRequest(context);
  assert(notif === null, 'Harus null jika tidak ada aliansi pertahanan aktif');
}
console.log('  ✅ Lolos: Perjanjian selain aliansi pertahanan aktif menghasilkan 0 permintaan.');

// 3. UJI ALIANSI PERTAHANAN AKTIF + TARGET DISERANG AI LAIN
console.log('3. Uji aliansi pertahanan aktif saat diserang AI lain...');
{
  const context: AllyRequestContext = {
    playerCountry: 'Indonesia',
    playerIso: 'IDN',
    defenseAlliances: ['Malaysia'],
    attackerCountry: 'Singapura',
    targetCountry: 'Malaysia',
    currentDateStr: '2026-11-06',
  };
  const notif = createAllyHelpRequest(context);
  assert(notif !== null, 'Permintaan harus dibuat saat aliansi pertahanan aktif terpenuhi');
  assert(notif?.allyCountry === 'Malaysia', 'Ally country harus Malaysia');
  assert(notif?.attackerCountry === 'Singapura', 'Attacker country harus Singapura');
  assert(notif?.priority === 'critical', 'Prioritas notifikasi harus critical');
  assert(notif?.tradeType === 'bantuan_sekutu', 'TradeType harus bantuan_sekutu');
  assert(notif?.status === 'pending', 'Status awal harus pending');
}
console.log('  ✅ Lolos: Permintaan bantuan sekutu dibuat dengan atribut yang tepat.');

// 4. UJI PEMAIN SEBAGAI PENYERANG ATAU TARGET
console.log('4. Uji pemain sebagai penyerang atau target (bukan AI vs AI)...');
{
  // Pemain sebagai penyerang
  const contextAttacker: AllyRequestContext = {
    playerCountry: 'Indonesia',
    defenseAlliances: ['Malaysia'],
    attackerCountry: 'Indonesia',
    targetCountry: 'Malaysia',
    currentDateStr: '2026-11-06',
  };
  assert(createAllyHelpRequest(contextAttacker) === null, 'Pemain sebagai penyerang harus 0 permintaan');

  // Pemain sebagai target
  const contextTarget: AllyRequestContext = {
    playerCountry: 'Indonesia',
    defenseAlliances: ['Malaysia'],
    attackerCountry: 'Singapura',
    targetCountry: 'Indonesia',
    currentDateStr: '2026-11-06',
  };
  assert(createAllyHelpRequest(contextTarget) === null, 'Pemain sebagai target harus 0 permintaan');
}
console.log('  ✅ Lolos: Pemain sebagai penyerang/target tidak memicu permintaan bantuan sekutu.');

// 5. UJI PERMINTAAN KEDUA SAAT MASIH PENDING (IDEMPOTEN) & RECHECK BERKALA
console.log('5. Uji idempoten permintaan pending dan recheck berkala...');
{
  const existingPending: BantuanSekutuNotification = {
    id: 'req-1',
    requestId: 'req-1',
    title: 'Test',
    sender: 'Test',
    message: 'Test',
    timestamp: '2026-11-06',
    type: 'peringkat',
    tradeType: 'bantuan_sekutu',
    category: 'Aliansi Pertahanan',
    priority: 'critical',
    value: 100,
    isRead: false,
    allyCountry: 'Malaysia',
    attackerCountry: 'Singapura',
    deadlineDate: '2026-11-13',
    status: 'pending',
    isHandled: false,
  };

  const context: AllyRequestContext = {
    playerCountry: 'Indonesia',
    defenseAlliances: ['Malaysia'],
    attackerCountry: 'Singapura',
    targetCountry: 'Malaysia',
    currentDateStr: '2026-11-06',
    existingRequests: [existingPending],
  };

  const notifDuplicate = createAllyHelpRequest(context);
  assert(notifDuplicate === null, 'Tidak boleh membuat permintaan baru jika masih ada yang pending');

  // Recheck berkala saat terdesak
  const contextRecheckCooldown: AllyRequestContext = {
    ...context,
    isRecheck: true,
    warProgress: 0.6, // Di atas ambang 0.5
    existingRequests: [{ ...existingPending, status: 'rejected', isHandled: true }],
    currentDateStr: '2026-11-10', // Baru 4 hari, cooldown 14 hari
  };
  assert(createAllyHelpRequest(contextRecheckCooldown) === null, 'Harus tertahan cooldown recheck');

  const contextRecheckReady: AllyRequestContext = {
    ...context,
    isRecheck: true,
    warProgress: 0.6,
    existingRequests: [{ ...existingPending, status: 'rejected', isHandled: true }],
    currentDateStr: '2026-11-25', // Sudah 19 hari (> 14 hari)
  };
  const recheckNotif = createAllyHelpRequest(contextRecheckReady, () => 0.1);
  assert(recheckNotif !== null, 'Recheck harus lolos jika syarat progres dan jeda terpenuhi');
}
console.log('  ✅ Lolos: Idempotensi pending dan recheck berkala berfungsi persis sesuai aturan.');

// 6. UJI KEDALUWARSA OTOMATIS (WAKTU HABIS, PERANG BERAKHIR, ATAU ALIANSI PUTUS)
console.log('6. Uji kedaluwarsa otomatis...');
{
  const pendingReq: BantuanSekutuNotification = {
    id: 'req-expire',
    requestId: 'req-expire',
    title: 'Test',
    sender: 'Test',
    message: 'Test',
    timestamp: '2026-11-01',
    type: 'peringkat',
    tradeType: 'bantuan_sekutu',
    category: 'Aliansi Pertahanan',
    priority: 'critical',
    value: 100,
    isRead: false,
    allyCountry: 'Malaysia',
    attackerCountry: 'Singapura',
    deadlineDate: '2026-11-08',
    status: 'pending',
    isHandled: false,
  };

  // Kasus 1: Melewati batas waktu
  const expiredByTime = expireAllyHelpRequest(pendingReq, {
    currentDateStr: '2026-11-09',
    isWarEnded: false,
    hasActiveAlliance: true,
  });
  assert(expiredByTime.status === 'expired' && expiredByTime.isHandled === true, 'Harus expired karena deadline lewat');

  // Kasus 2: Perang berakhir sebelum deadline
  const expiredByWarEnd = expireAllyHelpRequest(pendingReq, {
    currentDateStr: '2026-11-05',
    isWarEnded: true,
    hasActiveAlliance: true,
  });
  assert(expiredByWarEnd.status === 'expired' && expiredByWarEnd.isHandled === true, 'Harus expired karena perang selesai');

  // Kasus 3: Aliansi pertahanan putus sebelum dijawab
  const expiredByAllianceLost = expireAllyHelpRequest(pendingReq, {
    currentDateStr: '2026-11-05',
    isWarEnded: false,
    hasActiveAlliance: false,
  });
  assert(expiredByAllianceLost.status === 'expired' && expiredByAllianceLost.isHandled === true, 'Harus expired karena aliansi putus');
}
console.log('  ✅ Lolos: Kedaluwarsa otomatis berfungsi pada seluruh skenario pembatalan.');

// 7. VERIFIKASI NILAI KONFIGURASI
console.log('7. Verifikasi nilai konfigurasi...');
assert(BANTUAN_SEKUTU_CONFIG.firstRequestChance === 1.0, 'Peluang pertama harus 100% (1.0)');
assert(BANTUAN_SEKUTU_CONFIG.recheckCooldownDays === 14, 'Cooldown recheck harus 14 hari');
assert(BANTUAN_SEKUTU_CONFIG.desperationThreshold === 0.5, 'Ambang progres terdesak harus 0.5');
assert(BANTUAN_SEKUTU_CONFIG.deadlineDays === 7, 'Deadline harus 7 hari');
assert(BANTUAN_SEKUTU_CONFIG.relationPenaltyReject < 0, 'Penalti tolak harus bernilai negatif');
assert(BANTUAN_SEKUTU_CONFIG.relationPenaltyWithAttackerOnAccept < 0, 'Penalti terhadap agresor harus bernilai negatif');
console.log('  ✅ Lolos: Semua konfigurasi sesuai spesifikasi.');

console.log('=== SEMUA PENGUJIAN SELESAI DAN 100% SUKSES! ===');
