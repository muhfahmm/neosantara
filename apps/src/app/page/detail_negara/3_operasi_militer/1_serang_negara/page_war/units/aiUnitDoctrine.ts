import type { UnitKind } from './unitIconProps';
import type { WarUnit } from './warUnitComposition';
import type { BattalionId, BattalionSelection, UnitSelection } from '../UnitSelectionModal';

const BATTALIONS: BattalionId[] = ['I', 'II', 'III'];

export type AiEchelonDoctrine = 'single_mass' | 'split_dual' | 'split_tri';

/**
 * Logika pemilihan doktrin formasi militer AI secara otonom:
 * Menentukan apakah AI akan menggabungkan seluruh pasukannya menjadi 1 gelombang terpusat (single mass/deathball),
 * membagi menjadi 2 formasi (vanguard & main force), atau membagi rata menjadi 3 eselon (I, II, III).
 *
 * Doktrin dievaluasi berdasarkan:
 * 1. Karakteristik & kuantitas unit (misal: infanteri & MBT dengan jumlah besar cenderung dibagi 2 atau 3 regu)
 * 2. Keseimbangan taktis serangan dan pertahanan
 */
export function generateAiUnitSelection(units: WarUnit[]): UnitSelection {
  const result: UnitSelection = {};

  units.forEach((u) => {
    const qty = u.quantity;
    if (qty <= 0) return;

    // Tentukan doktrin formasi AI:
    // - Jika jumlah unit kecil (< 5), lebih efektif dijadikan 1 pasukan pemukul terpusat.
    // - Jika jumlah unit sedang (5 - 30), AI memilih antara 1 atau 2 formasi (60% split 2, 40% 1 terpusat).
    // - Jika jumlah unit besar (> 30 seperti Infanteri, Tank, APC), AI memilih antara 2 atau 3 batalyon (split 2 atau 3).
    const rand = Math.random();
    let doctrine: AiEchelonDoctrine = 'split_tri';

    if (qty < 5) {
      doctrine = 'single_mass';
    } else if (qty < 25) {
      doctrine = rand < 0.45 ? 'single_mass' : 'split_dual';
    } else {
      if (rand < 0.25) {
        doctrine = 'single_mass'; // Serangan terpusat (Full shock assault)
      } else if (rand < 0.65) {
        doctrine = 'split_dual'; // 2 Formasi: Garda Depan (Vanguard) & Penunjang
      } else {
        doctrine = 'split_tri';  // 3 Formasi: Eselon I, II, dan III seimbang
      }
    }

    const selection: BattalionSelection = { I: 0, II: 0, III: 0 };

    switch (doctrine) {
      case 'single_mass': {
        // Pilih salah satu eselon utama (biasanya I atau II)
        const chosenBattalion = rand < 0.7 ? 'I' : 'II';
        selection[chosenBattalion] = qty;
        break;
      }
      case 'split_dual': {
        // Bagi menjadi 2 formasi (misal 60% eselon I, 40% eselon II)
        const ratio = 0.5 + (Math.random() * 0.2 - 0.1); // 0.4 - 0.6
        const part1 = Math.round(qty * ratio);
        const part2 = qty - part1;
        // Pasangkan eselon I dan II, atau I dan III
        if (rand < 0.5) {
          selection.I = part1;
          selection.II = part2;
        } else {
          selection.I = part1;
          selection.III = part2;
        }
        break;
      }
      case 'split_tri': {
        // Bagi rata ke 3 batalyon I, II, dan III seperti tombol "BAGI RATA"
        const base = Math.floor(qty / 3);
        const remainder = qty % 3;
        selection.I = base + (remainder > 0 ? 1 : 0);
        selection.II = base + (remainder > 1 ? 1 : 0);
        selection.III = base;
        break;
      }
    }

    result[u.kind] = selection;
  });

  return result;
}
