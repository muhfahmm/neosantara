import { COUNTRIES_DATA, type CountryData } from '../page/map_system/map-data';

export type AttackDebugOptions = {
  attacker: string | 'random';
  withMandate: boolean;
  ignoreWarBan?: boolean;
  showRoute?: boolean;
};

export type AttackDebugPoint = {
  x: number;
  y: number;
};

export type AttackDebugRoute = {
  attacker: string;
  target: string;
  start: AttackDebugPoint;
  end: AttackDebugPoint;
  points: AttackDebugPoint[];
};

export type DebugNotification = {
  id: string;
  title?: string;
  sender?: string;
  message?: string;
  timestamp?: string;
  type?: string;
  tradeType?: string;
  enemyCountry?: string;
  partnerCountry?: string;
};

export type DebugNotificationSnapshot = {
  notifications: DebugNotification[];
  dailyQuota: { date: string; quota: number | null };
};

export type AttackDebugStatus = {
  runId: string;
  status: 'queued' | 'active' | 'cancelled' | 'ended';
  attacker: string;
  target: string;
  reason?: string;
};

export type AttackDebugResult = {
  runId: string;
  scenario: 'player-target' | 'ai-vs-ai';
  attacker: string;
  target: string;
  notificationReceived: boolean;
  notifications: DebugNotification[];
  dailyQuota: number | null;
  activeWarAnimation: boolean;
  queued: boolean;
  sanctionsNotifications: DebugNotification[];
  resolutionNotifications: DebugNotification[];
  cancellationReason: string | null;
  routeShown: boolean;
  analysisShown: boolean;
  resultPhaseShown: boolean;
  analysisBeforeResult: boolean;
  resultModalShown: boolean;
  warEnded: boolean;
};

export type AttackDebugCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

export type AttackDebugReport = {
  checks: AttackDebugCheck[];
  passed: number;
  failed: number;
  summary: string;
};

type CountryRecord = Record<string, unknown>;

type AttackDebugContext = {
  selectedCountry: CountryData | null;
  countryDetail: CountryRecord | null;
};

type AttackDebugWindow = Window & {
  __neosantara_debug_context?: AttackDebugContext;
  __neosantara_debug_notification_snapshot?: DebugNotificationSnapshot;
  __neosantara_debug_active_war?: boolean;
  __neosantara_map_camera?: { scale?: number; offsetX?: number; offsetY?: number };
  __neosantara_is_paused?: boolean;
};

const isDevelopment = process.env.NODE_ENV !== 'production';
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

let latestSnapshot: DebugNotificationSnapshot | null = null;
const runDetails = new Map<string, {
  attacker: string;
  target: string;
  scenario: AttackDebugResult['scenario'];
}>();
const routeShownRuns = new Set<string>();

export function configureAttackDebugContext(
  selectedCountry: CountryData | null,
  countryDetail: unknown
): void {
  if (!isDevelopment || typeof window === 'undefined') return;
  const detail = countryDetail && typeof countryDetail === 'object' && !Array.isArray(countryDetail)
    ? countryDetail as CountryRecord
    : null;
  (window as AttackDebugWindow).__neosantara_debug_context = { selectedCountry, countryDetail: detail };
}

export function publishDebugNotifications(snapshot: DebugNotificationSnapshot): void {
  if (!isDevelopment || typeof window === 'undefined') return;
  latestSnapshot = snapshot;
  (window as AttackDebugWindow).__neosantara_debug_notification_snapshot = snapshot;
  window.dispatchEvent(new CustomEvent<DebugNotificationSnapshot>(
    'neosantara_debug_notifications_changed',
    { detail: snapshot }
  ));
}

export function publishDebugNotificationState(
  notifications: readonly unknown[],
  dailyQuota: { date: string; quota: number | null }
): void {
  if (!isDevelopment || typeof window === 'undefined') return;
  const parsedNotifications = notifications.flatMap(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
    const record = value as Record<string, unknown>;
    if (typeof record.id !== 'string') return [];
    const asString = (key: string) => typeof record[key] === 'string' ? record[key] as string : undefined;
    return [{
      id: record.id,
      title: asString('title'),
      sender: asString('sender'),
      message: asString('message'),
      timestamp: asString('timestamp'),
      type: asString('type'),
      tradeType: asString('tradeType'),
      enemyCountry: asString('enemyCountry'),
      partnerCountry: asString('partnerCountry'),
    }];
  });
  publishDebugNotifications({ notifications: parsedNotifications, dailyQuota });
}

export function publishDebugWarStatus(status: AttackDebugStatus): void {
  if (!isDevelopment || typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<AttackDebugStatus>('neosantara_debug_war_status', {
    detail: status,
  }));
}

export function triggerAttackOnPlayer(options: AttackDebugOptions): string | null {
  if (!isDevelopment || typeof window === 'undefined') return null;
  if ((window as AttackDebugWindow).__neosantara_debug_active_war) {
    throw new Error('Perang lain sedang berjalan. Tunggu perang selesai sebelum menjalankan debug.');
  }

  const context = (window as AttackDebugWindow).__neosantara_debug_context;
  const playerName = context?.countryDetail?.country ||
    context?.countryDetail?.nama_negara ||
    context?.countryDetail?.name_id ||
    context?.countryDetail?.name_en ||
    context?.selectedCountry?.country;
  if (typeof playerName !== 'string' || !playerName.trim()) {
    throw new Error('Negara pemain belum tersedia; pilih negara sebelum menjalankan debug serangan.');
  }

  const eligibleCountries = COUNTRIES_DATA.filter(country =>
    normalize(country.country) !== normalize(playerName)
  );
  const requestedAttacker = options.attacker === 'random'
    ? eligibleCountries[Math.floor(Math.random() * eligibleCountries.length)]
    : COUNTRIES_DATA.find(country => normalize(country.country) === normalize(options.attacker));
  if (!requestedAttacker) {
    throw new Error(`Negara penyerang tidak ditemukan: ${options.attacker}`);
  }
  const attacker = eligibleCountries.find(country => country.iso === requestedAttacker.iso);
  if (!attacker) {
    throw new Error('Negara penyerang harus berbeda dari negara pemain.');
  }

  const runId = `attack-debug-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  runDetails.set(runId, {
    attacker: attacker.country,
    target: playerName,
    scenario: 'player-target',
  });
  const targetDetail = context?.countryDetail
    ? { ...context.countryDetail, country: playerName }
    : { country: playerName };
  const eventDetail: Record<string, unknown> = {
    attacker: attacker.country,
    target: playerName,
    targetCountryDetail: targetDetail,
    isNpcWar: true,
    __neosantaraDebugRunId: runId,
    __neosantaraDebugIgnoreWarBan: options.ignoreWarBan === true,
  };
  if (!options.withMandate) {
    eventDetail.resolutionViolationAuthorized = true;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('start_war_animation', { detail: eventDetail }));
  }, 0);
  return runId;
}

export function triggerAiVsAiDebugScenario(): string | null {
  if (!isDevelopment || typeof window === 'undefined') return null;
  if ((window as AttackDebugWindow).__neosantara_debug_active_war) {
    throw new Error('Perang lain sedang berjalan. Tunggu perang selesai sebelum menjalankan debug.');
  }

  const context = (window as AttackDebugWindow).__neosantara_debug_context;
  const playerName = context?.countryDetail?.country ||
    context?.countryDetail?.nama_negara ||
    context?.countryDetail?.name_id ||
    context?.countryDetail?.name_en ||
    context?.selectedCountry?.country;
  const eligibleCountries = COUNTRIES_DATA.filter(country =>
    normalize(country.country) !== normalize(typeof playerName === 'string' ? playerName : '')
  );
  if (eligibleCountries.length < 2) {
    throw new Error('Tidak tersedia dua negara AI untuk skenario uji.');
  }

  const attackerIndex = Math.floor(Math.random() * eligibleCountries.length);
  const targetPool = eligibleCountries.filter((_, index) => index !== attackerIndex);
  const attacker = eligibleCountries[attackerIndex];
  const target = targetPool[Math.floor(Math.random() * targetPool.length)];
  const runId = `attack-debug-ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  runDetails.set(runId, {
    attacker: attacker.country,
    target: target.country,
    scenario: 'ai-vs-ai',
  });

  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent('start_war_animation', {
      detail: {
        attacker: attacker.country,
        target: target.country,
        attackerCountryDetail: attacker,
        targetCountryDetail: target,
        isNpcWar: true,
        resolutionViolationAuthorized: true,
        __neosantaraDebugRunId: runId,
      },
    }));
  }, 0);
  return runId;
}

export function markAttackDebugRouteShown(runId: string): void {
  if (isDevelopment) routeShownRuns.add(runId);
}

export function getAttackDebugRunInfo(runId: string): { attacker: string; target: string } | null {
  return runDetails.get(runId) ?? null;
}

export function getRouteGeometry(attackerName: string, targetName: string): AttackDebugRoute | null {
  if (!isDevelopment) return null;
  const attacker = COUNTRIES_DATA.find(country => normalize(country.country) === normalize(attackerName));
  const target = COUNTRIES_DATA.find(country => normalize(country.country) === normalize(targetName));
  if (!attacker || !target ||
    typeof attacker.latitude !== 'number' || typeof attacker.longitude !== 'number' ||
    typeof target.latitude !== 'number' || typeof target.longitude !== 'number') {
    return null;
  }

  const project = (latitude: number, longitude: number): AttackDebugPoint => ({
    x: (longitude + 180) / 360,
    y: (90 - latitude) / 180,
  });
  const start = project(attacker.latitude, attacker.longitude);
  const end = project(target.latitude, target.longitude);
  const longitudeDelta = end.x - start.x;
  const wrappedDelta = longitudeDelta > 0.5
    ? longitudeDelta - 1
    : longitudeDelta < -0.5 ? longitudeDelta + 1 : longitudeDelta;
  const wrappedEnd = { x: start.x + wrappedDelta, y: end.y };
  const arc = Math.min(0.055, Math.max(0.012, Math.abs(wrappedDelta) * 0.08));
  const direction = end.y < start.y ? -1 : 1;
  const control = {
    x: (start.x + wrappedEnd.x) / 2,
    y: (start.y + wrappedEnd.y) / 2 + direction * arc,
  };
  const points = Array.from({ length: 25 }, (_, index) => {
    const t = index / 24;
    const inverse = 1 - t;
    return {
      x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * wrappedEnd.x,
      y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * wrappedEnd.y,
    };
  });
  return { attacker: attacker.country, target: target.country, start, end: wrappedEnd, points };
}

export function observeAttackOutcome(runId: string, timeoutMs = 8000): Promise<AttackDebugResult> {
  if (!isDevelopment || typeof window === 'undefined') {
    return Promise.resolve({
      runId,
      scenario: 'player-target',
      attacker: '',
      target: '',
      notificationReceived: false,
      notifications: [],
      dailyQuota: null,
      activeWarAnimation: false,
      queued: false,
      sanctionsNotifications: [],
      resolutionNotifications: [],
      cancellationReason: 'Debug tidak tersedia di production.',
      routeShown: false,
      analysisShown: false,
      resultPhaseShown: false,
      analysisBeforeResult: false,
      resultModalShown: false,
      warEnded: false,
    });
  }

  const initialSnapshot = latestSnapshot ??
    (window as AttackDebugWindow).__neosantara_debug_notification_snapshot ?? null;
  const knownIds = new Set(initialSnapshot?.notifications.map(notification => notification.id) ?? []);
  const knownResolutionIds = new Set(
    initialSnapshot?.notifications
      .filter(notification => /resolusi|sidang dewan keamanan|pbb/i.test(
        `${notification.title ?? ''} ${notification.sender ?? ''} ${notification.tradeType ?? ''}`
      ))
      .map(notification => notification.id) ?? []
  );
  const result: AttackDebugResult = {
    runId,
    scenario: runDetails.get(runId)?.scenario ?? 'player-target',
    attacker: runDetails.get(runId)?.attacker ?? '',
    target: runDetails.get(runId)?.target ?? '',
    notificationReceived: false,
    notifications: [],
    dailyQuota: initialSnapshot?.dailyQuota.quota ?? null,
    activeWarAnimation: false,
    queued: false,
    sanctionsNotifications: [],
    resolutionNotifications: [],
    cancellationReason: null,
    routeShown: routeShownRuns.has(runId),
    analysisShown: false,
    resultPhaseShown: false,
    analysisBeforeResult: false,
    resultModalShown: false,
    warEnded: false,
  };

  return new Promise(resolve => {
    const cleanups: Array<() => void> = [];
    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(timer);
      cleanups.forEach(cleanup => cleanup());
      runDetails.delete(runId);
      routeShownRuns.delete(runId);
      resolve(result);
    };

    const handleNotifications = (event: Event) => {
      const snapshot = (event as CustomEvent<DebugNotificationSnapshot>).detail;
      if (!snapshot) return;
      result.dailyQuota = snapshot.dailyQuota.quota;
      for (const notification of snapshot.notifications) {
        if (knownIds.has(notification.id)) continue;
        knownIds.add(notification.id);
        result.notifications.push(notification);
        if (notification.tradeType === 'diserang' &&
          normalize(notification.enemyCountry ?? notification.partnerCountry ?? '') === normalize(result.attacker)) {
          result.notificationReceived = true;
        }
        const notificationText = `${notification.title ?? ''} ${notification.sender ?? ''} ${notification.message ?? ''}`;
        if (normalize(notificationText).includes(normalize(result.attacker)) &&
          /sanksi|embargo|agresi ilegal|pelanggaran/i.test(notificationText)) {
          result.sanctionsNotifications.push(notification);
        }
        if (!knownResolutionIds.has(notification.id) &&
          /resolusi|sidang dewan keamanan|pbb/i.test(
            `${notification.title ?? ''} ${notification.sender ?? ''} ${notification.tradeType ?? ''}`
          )) {
          knownResolutionIds.add(notification.id);
          result.resolutionNotifications.push(notification);
        }
      }
    };
    const handleWarStatus = (event: Event) => {
      const status = (event as CustomEvent<AttackDebugStatus>).detail;
      if (!status || status.runId !== runId) return;
      result.attacker = status.attacker;
      result.target = status.target;
      if (status.status === 'active') result.activeWarAnimation = true;
      if (status.status === 'queued') result.queued = true;
      if (status.status === 'cancelled') result.cancellationReason = status.reason ?? 'Alasan tidak diberikan.';
      if (status.status === 'ended') {
        result.warEnded = true;
        finish();
      }
    };
    const handleBattlePhase = (event: Event) => {
      const detail = (event as CustomEvent<{ runId?: string; phase?: string }>).detail;
      if (detail?.runId !== runId) return;
      if (detail.phase === 'comparison') result.analysisShown = true;
      if (detail.phase === 'result') {
        result.resultPhaseShown = true;
        result.analysisBeforeResult = result.analysisShown;
      }
    };
    const handleResultModal = (event: Event) => {
      const detail = (event as CustomEvent<{ runId?: string }>).detail;
      if (detail?.runId === runId) result.resultModalShown = true;
    };

    window.addEventListener('neosantara_debug_notifications_changed', handleNotifications);
    window.addEventListener('neosantara_debug_war_status', handleWarStatus);
    window.addEventListener('neosantara_debug_battle_phase', handleBattlePhase);
    window.addEventListener('neosantara_debug_war_modal', handleResultModal);
    cleanups.push(
      () => window.removeEventListener('neosantara_debug_notifications_changed', handleNotifications),
      () => window.removeEventListener('neosantara_debug_war_status', handleWarStatus),
      () => window.removeEventListener('neosantara_debug_battle_phase', handleBattlePhase),
      () => window.removeEventListener('neosantara_debug_war_modal', handleResultModal)
    );
    const timer = window.setTimeout(finish, Math.max(0, timeoutMs));
  });
}

export function buildReport(result: AttackDebugResult): AttackDebugReport {
  if (!isDevelopment) return { checks: [], passed: 0, failed: 0, summary: 'Debug tidak tersedia di production.' };
  const check = (label: string, passed: boolean, detail: string): AttackDebugCheck => ({ label, passed, detail });
  if (result.scenario === 'ai-vs-ai') {
    const noModal = result.warEnded && !result.analysisShown &&
      !result.resultPhaseShown && !result.resultModalShown;
    const checks = [
      check(
        'AI vs AI: tidak ada modal',
        noModal,
        noModal
          ? 'Perang selesai tanpa layar analisis, layar hasil, atau modal hasil.'
          : `Selesai: ${result.warEnded}; analisis: ${result.analysisShown}; hasil: ${result.resultPhaseShown}; modal: ${result.resultModalShown}.`
      ),
      check(
        'Dampak perang diproses langsung',
        result.warEnded,
        result.warEnded ? 'Siklus animasi dan resolusi perang selesai.' : 'Perang belum selesai dalam jendela observasi.'
      ),
    ];
    const passed = checks.filter(item => item.passed).length;
    const failed = checks.length - passed;
    return {
      checks,
      passed,
      failed,
      summary: failed === 0 ? `Lulus: ${passed}/${checks.length}` : `Lulus ${passed}/${checks.length}; gagal/perlu verifikasi ${failed}.`,
    };
  }
  const checks = [
    check(
      'Notifikasi serangan masuk inbox',
      result.notificationReceived,
      result.notificationReceived ? 'Notifikasi diserang dari penyerang uji diterima.' : 'Notifikasi belum teramati.'
    ),
    check(
      'Notifikasi lolos meski kuota harian 0 (critical)',
      result.notificationReceived && result.dailyQuota === 0,
      result.dailyQuota === 0
        ? result.notificationReceived ? 'Kuota tersisa 0; tradeType diserang tetap masuk melalui pengecualian notifikasi serangan.' : 'Kuota 0, tetapi notifikasi serangan tidak teramati.'
        : `Kuota tersisa saat uji: ${result.dailyQuota ?? 'belum diketahui'}; jalankan saat kuota 0 untuk membuktikan pengecualian.`
    ),
    check(
      'Animasi perang berjalan',
      result.activeWarAnimation || result.queued,
      result.activeWarAnimation ? 'Animasi perang aktif.' : result.queued ? 'Serangan masuk antrean perang.' : result.cancellationReason ?? 'Belum teramati.'
    ),
    check(
      'Layar analisis tampil sebelum hasil',
      result.analysisShown && result.resultPhaseShown && result.analysisBeforeResult,
      result.analysisShown && result.resultPhaseShown && result.analysisBeforeResult
        ? 'Fase analisis teramati sebelum fase hasil.'
        : `Analisis: ${result.analysisShown}; hasil: ${result.resultPhaseShown}; urutan benar: ${result.analysisBeforeResult}.`
    ),
    check(
      'Tidak ada sanksi untuk AI',
      result.sanctionsNotifications.length === 0,
      result.sanctionsNotifications.length === 0
        ? 'Tidak ditemukan notifikasi sanksi untuk serangan uji.'
        : `${result.sanctionsNotifications.length} notifikasi terkait sanksi teramati.`
    ),
    check(
      'Respons PBB reaktif sesuai konfigurasi (jika ada)',
      result.resolutionNotifications.length > 0,
      result.resolutionNotifications.length > 0
        ? `${result.resolutionNotifications.length} notifikasi/resolusi PBB baru teramati.`
        : 'Tidak ada notifikasi/resolusi PBB baru yang teramati selama jendela observasi.'
    ),
    check(
      'Visualisasi rute dan tank tampil',
      result.routeShown,
      result.routeShown ? 'Rute tersedia dan animasi tank ditampilkan.' : 'Rute/tank tidak ditampilkan atau dinonaktifkan.'
    ),
  ];
  const passed = checks.filter(item => item.passed).length;
  const failed = checks.length - passed;
  return {
    checks,
    passed,
    failed,
    summary: failed === 0 ? `Lulus: ${passed}/${checks.length}` : `Lulus ${passed}/${checks.length}; gagal/perlu verifikasi ${failed}.`,
  };
}
