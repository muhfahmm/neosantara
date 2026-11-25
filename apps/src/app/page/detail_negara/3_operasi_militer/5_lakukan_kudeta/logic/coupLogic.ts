import { getRelationValue, setRelationModifier } from '../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { updateNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';
import { calculateCoupSuccessChance, rollCoupAttempt, type CoupChanceBreakdown } from './coupChanceCalculator';

type CountryDetailUpdater = (
  updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null
) => void;

interface ExecuteCoupInput {
  playerCountryName: string;
  targetCountryName: string;
  targetCountrySlug: string;
  playerIdeology: string;
  playerCountryDetail?: Record<string, unknown> | null;
  targetCountryDetail?: Record<string, unknown> | null;
  targetSatisfactionScore?: number;
  updatePlayerCountryDetail?: CountryDetailUpdater;
  updateTargetCountryDetail?: CountryDetailUpdater;
  deterministicRoll?: number; // Optional untuk testing
}

export type ExecuteCoupResult =
  | { success: true; relationIncrease: number; chanceBreakdown: CoupChanceBreakdown }
  | { success: false; reason: string; chanceBreakdown?: CoupChanceBreakdown };

const normalizeCountryName = (value: unknown) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]/g, '');

export function executeCoup({
  playerCountryName,
  targetCountryName,
  targetCountrySlug,
  playerIdeology,
  playerCountryDetail,
  targetCountryDetail,
  targetSatisfactionScore,
  updatePlayerCountryDetail,
  updateTargetCountryDetail,
  deterministicRoll,
}: ExecuteCoupInput): ExecuteCoupResult {
  if (!playerCountryName || !targetCountryName || !targetCountrySlug || !playerIdeology) {
    return { success: false, reason: 'Data negara atau ideologi tidak lengkap; kudeta tidak dijalankan.' };
  }
  if (normalizeCountryName(playerCountryName) === normalizeCountryName(targetCountryName)) {
    return { success: false, reason: 'Kudeta terhadap negara sendiri tidak dapat dilakukan.' };
  }
  if (!updatePlayerCountryDetail) {
    return { success: false, reason: 'Pembaruan data negara tidak tersedia; kudeta tidak dijalankan.' };
  }

  const relationBefore = getRelationValue(playerCountryName, targetCountryName);

  // Hitung persentase peluang sukses kudeta berdasarkan 5 faktor
  const chanceBreakdown = calculateCoupSuccessChance({
    playerCountryDetail,
    targetCountryDetail,
    targetSatisfactionScore,
    relationValue: relationBefore,
  });

  const isSuccess = rollCoupAttempt(chanceBreakdown.totalChance, deterministicRoll);

  // Jika gagal, kudeta digagalkan oleh pihak intelijen/pemerintah target
  if (!isSuccess) {
    // Hubungan diplomatik memburuk akibat percobaan kudeta yang terbongkar
    const relationPenalty = -30;
    setRelationModifier(playerCountryName, targetCountryName, relationPenalty);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('country_relations_updated'));
    }

    return {
      success: false,
      reason: `Operasi kudeta di ${targetCountryName} digagalkan oleh aparat keamanan dan kontra-intelijen setempat (Peluang: ${chanceBreakdown.totalChance}%). Hubungan diplomatik merosot tajam.`,
      chanceBreakdown,
    };
  }

  // Jika berhasil, perbarui status negara target menjadi boneka (puppet)
  if (!updateNpcCountrySimulationState(targetCountrySlug, {
    ideology: playerIdeology,
    isPuppet: true,
  })) {
    return { success: false, reason: 'Status negara target tidak dapat disimpan ke simulasi.', chanceBreakdown };
  }

  updateTargetCountryDetail?.(previous => previous
    ? { ...previous, ideology: playerIdeology, isPuppet: true }
    : previous
  );

  const requestedIncrease = relationBefore > 80 ? 10 : 80;
  const relationIncrease = Math.min(requestedIncrease, 100 - relationBefore);
  if (relationIncrease > 0) {
    setRelationModifier(playerCountryName, targetCountryName, relationIncrease);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('country_relations_updated'));
    }
  }

  const targetKey = normalizeCountryName(targetCountryName);
  updatePlayerCountryDetail(previous => {
    if (!previous) return previous;

    const alliances = Array.isArray(previous.defenseAlliances)
      ? previous.defenseAlliances.filter((partner): partner is string => typeof partner === 'string')
      : [];
    const hasAlliance = alliances.some(partner => normalizeCountryName(partner) === targetKey);

    const embassies = Array.isArray(previous.embassies) ? previous.embassies : [];
    const hasEmbassy = embassies.some(embassy => {
      if (typeof embassy === 'string') return normalizeCountryName(embassy) === targetKey;
      if (!embassy || typeof embassy !== 'object') return false;
      const record = embassy as Record<string, unknown>;
      return normalizeCountryName(record.mitra || record.nama_negara) === targetKey;
    });
    const removedEmbassies = Array.isArray(previous.removedEmbassies)
      ? previous.removedEmbassies.filter(
        (partner): partner is string =>
          typeof partner === 'string' && normalizeCountryName(partner) !== targetKey
      )
      : [];

    return {
      ...previous,
      defenseAlliances: hasAlliance ? alliances : [...alliances, targetCountryName],
      embassies: hasEmbassy
        ? embassies
        : [...embassies, { mitra: targetCountryName, type: 'Kedutaan Besar', status: 'Aktif' }],
      removedEmbassies,
    };
  });

  return { success: true, relationIncrease, chanceBreakdown };
}
