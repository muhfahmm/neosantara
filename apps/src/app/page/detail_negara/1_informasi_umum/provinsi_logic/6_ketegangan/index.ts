import {
  PROVINCE_ACTION_EVENT,
  type ProvinceActionEventDetail
} from '../provinceActionTypes';
import { resolveProvinceRebellion } from './1_pemberontakan';
import { resolveProvinceDemonstration } from './2_demonstrasi';
import { createProvinceReferendum } from './3_referendum';

interface ProvinceTensionContext {
  targetCountry: string;
  occupyingCountry: string;
  currentTension: number;
  delta: number;
  currentDate: Date;
  updatePlayerCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
}

function dispatchAction(detail: ProvinceActionEventDetail): void {
  window.dispatchEvent(new CustomEvent(PROVINCE_ACTION_EVENT, { detail }));
}

export function applyProvinceTensionChange({
  targetCountry,
  occupyingCountry,
  currentTension,
  delta,
  currentDate,
  updatePlayerCountryDetail
}: ProvinceTensionContext): number {
  if (!Number.isFinite(currentTension) || !Number.isFinite(delta)) {
    throw new Error('Data ketegangan provinsi tidak valid.');
  }

  const startingTension = Math.min(100, Math.max(0, currentTension));
  const adjustedTension = Math.min(100, Math.max(0, startingTension + delta));
  let finalTension = adjustedTension;
  let rebellionOccurred = false;
  let rebellionTensionIncrease = 0;
  let referendumRequired = false;
  let referendum: ReturnType<typeof createProvinceReferendum> | null = null;
  const normalizedTarget = targetCountry.toLowerCase().trim();

  if (delta > 0) {
    const demonstration = resolveProvinceDemonstration(adjustedTension);
    if (demonstration.occurred) {
      dispatchAction({
        actionId: 'demonstrasi',
        actionLabel: 'Demonstrasi',
        targetCountry,
        occupyingCountry,
        actionSucceeded: true,
        actionMessage: `Warga ${targetCountry} menggelar demonstrasi. Ketegangan berada di ${adjustedTension} dan peluang demonstrasi pada tingkat ini ${demonstration.chance}%.`,
        provinceIncident: { kind: 'demonstration', targetCountry }
      });
    }

    const rebellion = resolveProvinceRebellion(adjustedTension);
    if (rebellion.occurred) {
      rebellionOccurred = true;
      rebellionTensionIncrease = rebellion.tensionIncrease;
      referendumRequired = rebellion.referendumRequired;
      finalTension = Math.min(100, adjustedTension + rebellion.tensionIncrease);
    }
    if (startingTension < 100 && finalTension >= 100) {
      referendumRequired = true;
      referendum = createProvinceReferendum(currentDate);
    }
  }

  updatePlayerCountryDetail(previous => {
    if (!previous) return previous;
    const tensions = previous.provinceTensions && typeof previous.provinceTensions === 'object'
      ? previous.provinceTensions as Record<string, unknown>
      : {};
    const matchingEntry = Object.entries(tensions).find(
      ([name]) => name.toLowerCase().trim() === normalizedTarget
    );
    const nextTensions = { ...tensions };
    if (matchingEntry && matchingEntry[0] !== targetCountry) {
      delete nextTensions[matchingEntry[0]];
    }
    const referendums = previous.provinceReferendums && typeof previous.provinceReferendums === 'object'
      ? previous.provinceReferendums as Record<string, unknown>
      : {};
    const matchingReferendum = Object.keys(referendums).find(
      name => name.toLowerCase().trim() === normalizedTarget
    );
    const nextReferendums = { ...referendums };
    if (matchingReferendum && matchingReferendum !== targetCountry) {
      delete nextReferendums[matchingReferendum];
    }
    if (referendum) nextReferendums[targetCountry] = referendum;
    return {
      ...previous,
      provinceTensions: {
        ...nextTensions,
        [targetCountry]: finalTension
      },
      provinceReferendums: nextReferendums
    };
  });

  if (delta > 0 && referendumRequired && referendum) {
    dispatchAction({
      actionId: 'referendum_dimulai',
      actionLabel: 'Referendum Kemerdekaan',
      targetCountry,
      occupyingCountry,
      actionSucceeded: true,
      actionMessage: `Ketegangan ${targetCountry} mencapai 100. Referendum kemerdekaan dimulai dan pemungutan suara berlangsung hingga ${referendum.votingEndsAt}.`,
      provinceIncident: { kind: 'referendum', targetCountry }
    });
  } else if (delta > 0 && rebellionOccurred) {
    dispatchAction({
      actionId: 'pemberontakan',
      actionLabel: 'Pemberontakan',
      targetCountry,
      occupyingCountry,
      actionSucceeded: true,
      actionMessage: `Warga ${targetCountry} memberontak. Ketegangan meningkat ${rebellionTensionIncrease} poin dan kini mencapai ${finalTension}.`
    });
  }

  return finalTension;
}
