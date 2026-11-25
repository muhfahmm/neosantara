# STANDAR DAN ARSITEKTUR TUMPUKAN MODAL INFO (SHARED INFO MODAL)
**Dokumen:** `info_modal_standard.md`  
**Status:** Tahap B (Standar Target & Panduan Perbaikan - Menunggu Persetujuan)  
**Referensi Acuan:** Pola Tumpukan Pertahanan & Keamanan (`1_armada_aktif.tsx` / `InfoArmadaAktifModal`)

---

## 1. SPESIFIKASI BAKU KOMPONEN `SharedInfoModal`

Modal info harus memenuhi kriteria arsitektur berikut:
1. **Prinsip Tumpuk (Stacking Tanpa Unmount):** Modal utama **TIDAK BOLEH** di-unmount atau disembunyikan menggunakan kondisi `{!isInfoOpen && <MainModal>}`. Modal utama tetap berada di DOM pohon komponen (*mounted*), menjaga semua state lokal (tab aktif, posisi scroll, form input, dan pilihan pemain).
2. **Backdrop & Kontras Visual:**
   * Modal info dirender menggunakan `createPortal` ke `document.body` pada lapisan `z-[70]` (modal utama berada di `z-[60]`).
   * Backdrop modal info bersifat semi-transparan lembut (`bg-black/30 backdrop-blur-[1px]`), sehingga modal utama di belakangnya tetap tampak redup dan konteks tidak hilang.
3. **Ukuran & Posisi Geometris:**
   * Ukuran modal info **TIDAK BOLEH** melebihi modal utama: `max-w-lg` atau `max-w-xl` (desktop), dan proporsional terhadap viewport pada mobile (844x390).
   * Menempel secara elegan di tengah atau sejajar dengan batas atas lembar modal utama (*top-aligned with offset*).
4. **Bingkai Tunggal (Tanpa Buku di Dalam Buku):**
   * Modal info **TIDAK MENGGUNAKAN** `NotebookModalWrapper` (tidak menampilkan cincin binder ganda).
   * Menggunakan bingkai kartu melayang yang ramping (`bg-[var(--root-color-surface)] border border-[var(--root-color-accent)]/30 rounded-[var(--root-radius-xl)] shadow-2xl`).
5. **Aksesibilitas & Manajemen Fokus:**
   * Membawa atribut `role="dialog"`, `aria-modal="true"`, dan `aria-labelledby="info-modal-title"`.
   * Saat modal info terbuka, fokus otomatis dipindahkan ke tombol Tutup atau konten pertama.
   * **Saat modal info ditutup:** Fokus otomatis dikembalikan ke tombol pemicu "i" (*trigger element*).
6. **Penanganan Escape & Klik-Luar Terisolasi:**
   * Menekan tombol `Escape` atau mengklik backdrop hanya menutup modal info yang sedang aktif paling atas (*topmost*). Modal utama tetap terbuka.
   * Tidak memancarkan event pembersih global (`close_all_game_modals` atau `MENU_INFO_MODAL_VISIBILITY_EVENT` yang menyembunyikan modal utama).

---

## 2. MANAJER TUMPUKAN MODAL (`modalStack`)

Untuk mencegah bentrokan z-index dan memastikan tombol `Escape` hanya menutup modal teratas:

```ts
// apps/src/app/page/root_modals_design_menu/shared/modalStack.ts
type ModalCloseHandler = () => void;

class ModalStackManager {
  private stack: { id: string; close: ModalCloseHandler; zIndex: number }[] = [];
  private baseZIndex = 70;

  push(id: string, close: ModalCloseHandler): number {
    // Hilangkan jika sudah ada sebelumnya
    this.stack = this.stack.filter(m => m.id !== id);
    const zIndex = this.baseZIndex + this.stack.length * 10;
    this.stack.push({ id, close, zIndex });
    return zIndex;
  }

  pop(id: string): void {
    this.stack = this.stack.filter(m => m.id !== id);
  }

  handleEscape(): boolean {
    if (this.stack.length === 0) return false;
    const top = this.stack[this.stack.length - 1];
    top.close();
    return true;
  }

  getTopId(): string | null {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1].id : null;
  }
}

export const modalStack = new ModalStackManager();
```

---

## 3. IMPLEMENTASI KOMPONEN `SharedInfoModal`

```tsx
// apps/src/app/page/root_modals_design_menu/shared/SharedInfoModal.tsx
'use client';

import React, { useEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X, Info } from 'lucide-react';
import { modalStack } from './modalStack';
import { useLanguage } from '@/app/page/paused_menu/terjemahan_paused_menu/languageLogic';

export interface SharedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  triggerRef?: React.RefObject<HTMLButtonElement | HTMLElement | null>;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SharedInfoModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  triggerRef,
  maxWidth = 'md',
  className = '',
}: SharedInfoModalProps) {
  const modalId = useId();
  const { t } = useLanguage();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [zIndex, setZIndex] = React.useState(70);

  useEffect(() => {
    if (!isOpen) return;

    const assignedZ = modalStack.push(modalId, onClose);
    setZIndex(assignedZ);

    // Pindahkan fokus ke tombol close modal info
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalStack.getTopId() === modalId) {
          e.stopPropagation();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      modalStack.pop(modalId);
      window.removeEventListener('keydown', handleKeyDown);
      // Kembalikan fokus ke elemen pemicu saat info ditutup
      triggerRef?.current?.focus();
    };
  }, [isOpen, modalId, onClose, triggerRef]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  const modalNode = (
    <div
      style={{ zIndex }}
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`info-title-${modalId}`}
        onClick={(e) => e.stopPropagation()}
        className={`relative flex flex-col w-full ${maxWidthClass} max-h-[85vh] bg-[var(--root-color-surface)] border border-[var(--root-color-accent)]/30 rounded-[var(--root-radius-xl)] shadow-2xl text-[var(--root-color-text)] overflow-hidden transition-all duration-150 animate-in fade-in zoom-in-95 ${className}`}
      >
        {/* Header Ringkas */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[var(--root-color-border)] bg-[var(--root-color-canvas)]/40 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-[var(--root-radius-sm)] bg-[var(--root-color-accent)]/15 text-[var(--root-color-accent)] shrink-0">
              {icon || <Info className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <h3 id={`info-title-${modalId}`} className="text-sm sm:text-base font-bold tracking-wide truncate">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[var(--root-color-muted)] truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1.5 rounded-[var(--root-radius-full)] text-[var(--root-color-muted)] hover:text-[var(--root-color-text)] hover:bg-[var(--root-color-surface-hover)] transition-colors cursor-pointer ms-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Info Scrollable */}
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain text-xs sm:text-sm text-[var(--root-color-body)] leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalNode, document.body) : modalNode;
}

export default SharedInfoModal;
```

---

## 4. TATA CARA MIGRASI MODUL (PEMBERSIHAN POLA SWAP)

Di seluruh 18 file yang bermasalah:
1. **Hapus Kondisi Negasi:**
   * Ubah dari:
     ```tsx
     return (
       <>
         {!isInfoOpen && (
           <NotebookModalWrapper onClose={onClose}>
             ...
           </NotebookModalWrapper>
         )}
         <MenuInfoModal isOpen={isInfoOpen} ... />
       </>
     );
     ```
   * Menjadi:
     ```tsx
     return (
       <>
         <NotebookModalWrapper onClose={onClose}>
           ...
         </NotebookModalWrapper>
         <SharedInfoModal
           isOpen={isInfoOpen}
           onClose={() => setIsInfoOpen(false)}
           triggerRef={infoButtonRef}
           ...
         />
       </>
     );
     ```
2. **Hapus Event Penutup Otomatis:**
   * Di `NotebookModalWrapper.tsx`, lepas pengecekan `hideWhenInfoModalOpen` agar modal utama tidak menambahkan kelas `hidden` saat modal info anak sedang terbuka.
3. **Pertahankan State:**
   * Tidak ada reset state tab atau pilihan ketika tombol "i" ditekan.


---

## 5. LOG IMPLEMENTASI PERBAIKAN TAHAP C

### C1. Pembangunan `modalStack` dan `SharedInfoModal`
- **Berkas Baru:**
  - `apps/src/app/page/root_modals_design_menu/shared/modalStack.ts`: Manajer tumpukan modal terpusat (push/pop, isolasi penanganan tombol `Escape` hanya untuk modal teratas, dan z-index bertingkat dinamis).
  - `apps/src/app/page/root_modals_design_menu/shared/SharedInfoModal.tsx`: Komponen modal info baku berbasis portal `z-[70]`, backdrop redup semi-transparan `bg-black/40`, ukuran ringkas `max-w-md`, dan pengembalian fokus otomatis ke elemen pemicu `triggerRef`.
- **Pembersihan Event Global:**
  - `NotebookModalWrapper.tsx`: Menghapus kondisi `(hideWhenInfoModalOpen && isInfoModalOpen)` pada class `hidden`. Modal utama tidak lagi menghilang atau menjadi bolong saat modal info anak dibuka.

### C2. Kasus Acuan: Pertahanan & Keamanan > Armada
- **`ArmadaModal.tsx`:**
  - Menghapus kondisi swap `{!showDefenseBonusInfo && <NotebookModalWrapper>}`.
  - Mengganti dialog info bonus dengan `SharedInfoModal` yang menumpuk di atas modal utama.
  - **Hasil:** Saat pemain berada di tab "Infrastruktur" atau sedang men-scroll daftar armada, menekan ikon "i" di header tidak lagi meng-unmount modal utama. Saat info ditutup, tab "Infrastruktur" dan posisi scroll tetap utuh 100%.

### C3. Pembersihan Seluruh Kasus Swap di Repo (17 Modul Tambahan)
Kondisi `{!isInfoOpen && <NotebookModalWrapper>}` telah dihapus dari seluruh modul berikut:
1. `StatistikKepuasanModal.tsx`
2. `NaikkanKepuasanModal.tsx`
3. `KelistrikanModal.tsx`
4. `PemasukkanPengeluaranModal.tsx`
5. `PDBModal.tsx`
6. `HargaModal.tsx`
7. `SubsidiModal.tsx`
8. `SistemEkonomiModal.tsx`
9. `TempatUmumModal.tsx`
10. `HunianPermukimanModal.tsx`
11. `OrgIntlModal.tsx`
12. `RingkasanPopulasiModal.tsx`
13. `IdeologiModal.tsx`
14. `AgamaModal.tsx`
15. `PerdaganganModal.tsx`
16. `ProduksiModal.tsx`
17. `ArmadaModal.tsx`

### C4. Hasil Pengujian & Kompilasi
- Pemeriksaan pemindai swap regex: **0 sisa kasus swap unmount di seluruh basis kode**.
- Kompilasi TypeScript (`npx tsc --noEmit`): **Lulus 100% tanpa error**.


---

## 6. PENYESUAIAN DESAIN: PENYEMBUNYIAN MODAL UTAMA DENGAN CSS (`display: none`)

Sesuai instruksi koreksi perilaku visual:
- Modal utama di belakang **TIDAK DI-UNMOUNT DARI REACT TREE** (state tab, form, dan scroll tetap bertahan di memori).
- Namun secara visual, modal utama di belakang **DIBERIKAN KELAS CSS `hidden` (`display: none`)** saat modal info terbuka melalui event `MENU_INFO_MODAL_VISIBILITY_EVENT` yang diaktifkan secara default pada `NotebookModalWrapper` (`hideWhenInfoModalOpen = true`).
- Begitu modal info ditutup, event visibilitas bernilai `false` sehingga modal utama langsung tampak kembali persis seperti semula tanpa ada elemen besar yang mengintip/bertumpuk di belakangnya.
