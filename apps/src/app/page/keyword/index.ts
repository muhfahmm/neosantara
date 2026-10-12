'use client';

import { useEffect } from 'react';

/**
 * 🎮 Sistem Keyboard Shortcuts Game Neosantara
 * Menu A - Z untuk menu utama & Angka 1 - 9 untuk sub-menu
 */

export interface ShortcutDefinition {
  key: string;
  code?: string;
  label: string;
  description: string;
  category: 'Menu Utama' | 'Sub Menu (Angka)' | 'Time Controller' | 'Navigasi Panel' | 'Zoom & Map' | 'Menu Cepat';
  action: string;
}

export const GAME_SHORTCUTS: Record<string, ShortcutDefinition> = {
  // 🔤 1. Menu Utama Huruf (A - Z)
  KEY_A: { key: 'a', label: 'A', description: '⚓ Komando Armada Militer', category: 'Menu Utama', action: 'Menu:Armada' },
  KEY_B: { key: 'b', label: 'B', description: '🏦 Pinjaman & Hutang Negara', category: 'Menu Utama', action: 'Menu:Hutang' },
  KEY_C: { key: 'c', label: 'C', description: '🏛️ Dewan Kabinet Menteri', category: 'Menu Utama', action: 'Dashboard:Kementerian' },
  KEY_D: { key: 'd', label: 'D', description: '🤝 Kedutaan Besar Bilateral', category: 'Menu Utama', action: 'Menu:KedutaanBesar' },
  KEY_E: { key: 'e', label: 'E', description: '👛 Pemasukan & Pengeluaran APBN', category: 'Menu Utama', action: 'Menu:Budget' },
  KEY_F: { key: 'f', label: 'F', description: '🎯 Fokus & Reset Zoom ke Negara Sendiri', category: 'Zoom & Map', action: 'MAP_FOCUS_HOME' },
  KEY_G: { key: 'g', label: 'G', description: '🌐 Pasar Perdagangan Global', category: 'Menu Utama', action: 'Menu:Perdagangan' },
  KEY_H: { key: 'h', label: 'H', description: '🏠 Hunian & Permukiman Warga', category: 'Menu Utama', action: 'Menu:HunianPermukiman' },
  KEY_I: { key: 'i', label: 'I', description: '📬 Inbox / Kotak Pesan Notifikasi', category: 'Menu Utama', action: 'inbox' },
  KEY_J: { key: 'j', label: 'J', description: '👁️ Operasi Intelijen & Spionase', category: 'Menu Utama', action: 'Menu:Intelijen' },
  KEY_K: { key: 'k', label: 'K', description: '😊 Statistik Kepuasan Rakyat', category: 'Menu Utama', action: 'Dashboard:Kepuasan' },
  KEY_L: { key: 'l', label: 'L', description: '⚡ Grid Kelistrikan Nasional', category: 'Menu Utama', action: 'Menu:Kelistrikan' },
  KEY_M: { key: 'm', label: 'M', description: '🗺️ Map Utama (Tutup Semua Modal)', category: 'Menu Utama', action: 'Peta Taktis' },
  KEY_N: { key: 'n', label: 'N', description: '🌍 Sidang Umum PBB', category: 'Menu Utama', action: 'Menu:PBB' },
  KEY_O: { key: 'o', label: 'O', description: '👥 Ringkasan Populasi & Demografi', category: 'Menu Utama', action: 'Dashboard:Populasi:Overview' },
  KEY_P: { key: 'p', label: 'P', description: '🏭 Produksi & Pembangunan Pabrik', category: 'Menu Utama', action: 'Menu:Produksi' },
  KEY_Q: { key: 'q', label: 'Q', description: '💡 Ideologi & Dasar Negara', category: 'Menu Utama', action: 'Menu:Ideologi' },
  KEY_R: { key: 'r', label: 'R', description: '🔬 Fokus Utama Riset & Penelitian', category: 'Menu Utama', action: 'Menu:Penelitian' },
  KEY_S: { key: 's', label: 'S', description: '💸 Kebijakan Alokasi Subsidi', category: 'Menu Utama', action: 'Menu:KebijakanSubsidi' },
  KEY_T: { key: 't', label: 'T', description: '💰 Kebijakan Tarif Perpajakan', category: 'Menu Utama', action: 'Menu:Pajak' },
  KEY_U: { key: 'u', label: 'U', description: '🏛️ Tempat Umum & Fasilitas Publik', category: 'Menu Utama', action: 'Menu:TempatUmum' },
  KEY_V: { key: 'v', label: 'V', description: '🕌 Kehidupan Beragama & Toleransi', category: 'Menu Utama', action: 'Menu:Agama' },
  KEY_W: { key: 'w', label: 'W', description: '⚔️ Operasi Militer / Serang Negara', category: 'Menu Utama', action: 'Menu:SerangNegara' },
  KEY_X: { key: 'x', label: 'X', description: '🚀 Peluncuran ICBM & Senjata Nuklir', category: 'Menu Utama', action: 'Menu:ICBM' },
  KEY_Y: { key: 'y', label: 'Y', description: '🌾 Neraca Industri & Stok Pangan', category: 'Menu Utama', action: 'Menu:IndustriPangan' },
  KEY_Z: { key: 'z', label: 'Z', description: '📊 PDB Nasional & Dunia', category: 'Menu Utama', action: 'Menu:PDB' },

  // 🔢 2. Sub Menu Angka (1 - 9)
  KEY_1: { key: '1', label: '1', description: '📈 Naikkan Kepuasan Rakyat', category: 'Sub Menu (Angka)', action: 'Action:NaikkanKepuasan' },
  KEY_2: { key: '2', label: '2', description: '🏷️ Indeks Harga Barang Pokok', category: 'Sub Menu (Angka)', action: 'Menu:Harga' },
  KEY_3: { key: '3', label: '3', description: '⚖️ Kebijakan & Sistem Ekonomi', category: 'Sub Menu (Angka)', action: 'Menu:SistemEkonomi' },
  KEY_4: { key: '4', label: '4', description: '🚩 Wilayah yang Direbut / Aneksasi', category: 'Sub Menu (Angka)', action: 'Menu:WilayahDirebut' },
  KEY_5: { key: '5', label: '5', description: '🏛️ Badan Khusus PBB', category: 'Sub Menu (Angka)', action: 'Menu:OrganisasiInternasional:organisasi_pbb' },
  KEY_6: { key: '6', label: '6', description: '🌐 Organisasi Regional Dunia', category: 'Sub Menu (Angka)', action: 'Menu:OrganisasiInternasional:organisasi_regional' },
  KEY_7: { key: '7', label: '7', description: '🤝 Hubungan Diplomatik Internasional', category: 'Sub Menu (Angka)', action: 'Menu:TingkatHubungan' },
  KEY_8: { key: '8', label: '8', description: '📜 Doktrin Keterbukaan Negara', category: 'Sub Menu (Angka)', action: 'Menu:DoktrinKeterbukaan' },
  KEY_9: { key: '9', label: '9', description: '💣 Sabotase Strategis (Intelijen)', category: 'Sub Menu (Angka)', action: 'Menu:Intelijen' },

  // ⏱️ 3. Time Controller
  TIME_TOGGLE_PAUSE: { key: ' ', code: 'Space', label: 'Space', description: '⏯️ Play / Pause Waktu', category: 'Time Controller', action: 'TIME_TOGGLE_PAUSE' },
  TIME_SPEED_SLOW: { key: 'ArrowLeft', code: 'ArrowLeft', label: '←', description: '⏪ Perlambat Waktu', category: 'Time Controller', action: 'TIME_SPEED_SLOW' },
  TIME_SPEED_FAST: { key: 'ArrowRight', code: 'ArrowRight', label: '→', description: '⏩ Percepat Waktu', category: 'Time Controller', action: 'TIME_SPEED_FAST' },

  // ❌ 4. Navigasi Panel
  NAV_CLOSE: { key: 'Escape', code: 'Escape', label: 'Esc', description: '❌ Tutup Panel Aktif', category: 'Navigasi Panel', action: 'NAV_CLOSE' },

  // ⚡ 5. Menu Cepat
  OPEN_TOP_UP: { key: 'F2', code: 'F2', label: 'F2', description: '💎 Buka menu Top Up Diamond', category: 'Menu Cepat', action: 'OPEN_TOP_UP' },
  OPEN_MISSION: { key: 'F3', code: 'F3', label: 'F3', description: '🎯 Buka Misi Presiden', category: 'Menu Cepat', action: 'OPEN_MISSION' },
};

/**
 * Memeriksa apakah user sedang mengetik di input, textarea, atau elemen editable
 */
export function isInputActive(): boolean {
  if (typeof document === 'undefined') return false;
  const active = document.activeElement;
  if (!active) return false;
  const tagName = active.tagName.toUpperCase();
  const isInput = tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
  const isEditable = active.getAttribute('contenteditable') === 'true' || (active as HTMLElement).isContentEditable;
  return isInput || isEditable;
}

export interface ShortcutHandlers {
  onMenuSelect?: (target: string) => void;
  onCloseAllModals?: () => void;
  onCloseMenu?: () => void;
  onTogglePlayPause?: () => void;
  onTimeSpeedChange?: (delta: number) => void;
  onFocusHome?: () => void;
  onOpenTopUp?: () => void;
  onOpenMission?: () => void;
}

/**
 * Dispatch Custom Event untuk Event Bus Global Neosantara
 */
export function dispatchGameShortcutEvent(action: string, data?: any) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neosantara_shortcut', { detail: { action, ...data } }));
  }
}

/**
 * Handle Keyboard Shortcut Event
 */
export function handleGameShortcut(e: KeyboardEvent, handlers: ShortcutHandlers): boolean {
  // Jika user sedang mengetik di form, jangan jalankan shortcut keyboard game
  if (isInputActive()) {
    return false;
  }

  const keyLower = e.key.toLowerCase();
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;

  // Abaikan tombol jika menggabungkan Ctrl / Alt untuk shortcut browser dasar
  if (isCtrlOrCmd) return false;

  // 1. TOMBOL M -> TUTUP PAKSA SEMUA MODAL & KEMBALI KE MAP UTAMA
  if (keyLower === 'm') {
    e.preventDefault();
    dispatchGameShortcutEvent('CLOSE_ALL_MODALS');
    handlers.onCloseAllModals?.();
    handlers.onMenuSelect?.('Peta Taktis');
    return true;
  }

  // 2. ESC -> Tutup Panel / Modal
  if (e.key === 'Escape') {
    e.preventDefault();
    dispatchGameShortcutEvent('NAV_CLOSE');
    handlers.onCloseMenu?.();
    return true;
  }

  // 3. SPACE -> Play / Pause Waktu
  if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    dispatchGameShortcutEvent('TIME_TOGGLE_PAUSE');
    handlers.onTogglePlayPause?.();
    return true;
  }

  // 4. WAKTU: ← (Slow) / → (Fast)
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    dispatchGameShortcutEvent('TIME_SPEED_SLOW');
    handlers.onTimeSpeedChange?.(-1);
    return true;
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    dispatchGameShortcutEvent('TIME_SPEED_FAST');
    handlers.onTimeSpeedChange?.(1);
    return true;
  }

  // 5. FOKUS MAP (F)
  if (keyLower === 'f') {
    e.preventDefault();
    dispatchGameShortcutEvent('MAP_FOCUS_HOME');
    handlers.onFocusHome?.();
    return true;
  }

  if (e.key === 'F2') {
    e.preventDefault();
    dispatchGameShortcutEvent('OPEN_TOP_UP');
    handlers.onOpenTopUp?.();
    return true;
  }
  if (e.key === 'F3') {
    e.preventDefault();
    dispatchGameShortcutEvent('OPEN_MISSION');
    handlers.onOpenMission?.();
    return true;
  }

  // 6. MENU UTAMA (HURUF A - Z) & SUB-MENU (ANGKA 1 - 9)
  const menuMap: Record<string, string> = {
    // Huruf A - Z
    a: 'Menu:Armada',
    b: 'Menu:Hutang',
    c: 'Dashboard:Kementerian',
    d: 'Menu:KedutaanBesar',
    e: 'Menu:Budget',
    g: 'Menu:Perdagangan',
    h: 'Menu:HunianPermukiman',
    i: 'inbox',
    j: 'Menu:Intelijen',
    k: 'Dashboard:Kepuasan',
    l: 'Menu:Kelistrikan',
    n: 'Menu:PBB',
    o: 'Dashboard:Populasi:Overview',
    p: 'Menu:Produksi',
    q: 'Menu:Ideologi',
    r: 'Menu:Penelitian',
    s: 'Menu:KebijakanSubsidi',
    t: 'Menu:Pajak',
    u: 'Menu:TempatUmum',
    v: 'Menu:Agama',
    w: 'Menu:SerangNegara',
    x: 'Menu:ICBM',
    y: 'Menu:IndustriPangan',
    z: 'Menu:PDB',

    // Angka 1 - 9 (Sub Menu yang tidak kebagian huruf)
    '1': 'Action:NaikkanKepuasan',
    '2': 'Menu:Harga',
    '3': 'Menu:SistemEkonomi',
    '4': 'Menu:WilayahDirebut',
    '5': 'Menu:OrganisasiInternasional:organisasi_pbb',
    '6': 'Menu:OrganisasiInternasional:organisasi_regional',
    '7': 'Menu:TingkatHubungan',
    '8': 'Menu:DoktrinKeterbukaan',
    '9': 'Menu:Intelijen',
  };

  if (menuMap[e.key] || menuMap[keyLower]) {
    e.preventDefault();
    const target = menuMap[e.key] || menuMap[keyLower];
    dispatchGameShortcutEvent('OPEN_MENU', { target });
    handlers.onMenuSelect?.(target);
    return true;
  }

  return false;
}

/**
 * Custom React Hook untuk Mendengarkan Shortcut Keyboard di Komponen Map & System Game
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      handleGameShortcut(e, handlers);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handlers, enabled]);
}

export default useKeyboardShortcuts;