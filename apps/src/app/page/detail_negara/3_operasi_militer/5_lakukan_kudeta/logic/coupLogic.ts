import { getRelationValue, setRelationModifier } from '../../../../../../../../json/4_database_hubungan_antar_negara/relationsRegistry';
import { updateNpcCountrySimulationState } from '@/app/logic/npc_country_simulation/npcCountrySimulation';

type CountryDetailUpdater = (
  updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null
) => void;

interface ExecuteCoupInput {
  playerCountryName: string;
  targetCountryName: string;
  targetCountrySlug: string;
  playerIdeology: string;
  updatePlayerCountryDetail?: CountryDetailUpdater;
  updateTargetCountryDetail?: CountryDetailUpdater;
}

export type ExecuteCoupResult =
  | { success: true; relationIncrease: number }
  | { success: false; reason: string };

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
  updatePlayerCountryDetail,
  updateTargetCountryDetail,
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

  if (!updateNpcCountrySimulationState(targetCountrySlug, {
    ideology: playerIdeology,
    isPuppet: true,
  })) {
    return { success: false, reason: 'Status negara target tidak dapat disimpan ke simulasi.' };
  }

  updateTargetCountryDetail?.(previous => previous
    ? { ...previous, ideology: playerIdeology, isPuppet: true }
    : previous
  );

  const relationBefore = getRelationValue(playerCountryName, targetCountryName);
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

  return { success: true, relationIncrease };
}
