import { BookOpen } from 'lucide-react';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../../provinceActionTypes';

type ProvinceIdeologyOverrides = Record<string, string>;

function getIdeologyOverrides(): ProvinceIdeologyOverrides {
  if (typeof window === 'undefined') return {};
  return (window as Window & {
    neosantara_province_ideology_overrides?: ProvinceIdeologyOverrides;
  }).neosantara_province_ideology_overrides || {};
}

export function getProvinceIdeologyOverride(countryName: string): string | undefined {
  const normalizedCountry = countryName.toLowerCase().trim();
  return Object.entries(getIdeologyOverrides()).find(
    ([name]) => name.toLowerCase().trim() === normalizedCountry
  )?.[1];
}

async function instillProvinceIdeology({
  targetCountry,
  playerIdeology,
  updateTargetIdeology,
  provinceTension,
  adjustProvinceTension
}: ProvinceActionContext): Promise<ProvinceActionResult> {
  const ideology = String(playerIdeology || '').trim();
  if (!ideology || ideology === '-' || ideology.toLowerCase() === 'belum tersedia') {
    throw new Error('Ideologi negara pemain belum tersedia.');
  }
  if (!updateTargetIdeology) {
    throw new Error('Data ideologi provinsi tidak dapat diperbarui.');
  }

  const successChance = 90;
  if (Math.random() * 100 >= successChance) {
    if (!Number.isFinite(provinceTension) || !adjustProvinceTension) {
      throw new Error('Data ketegangan provinsi tidak tersedia.');
    }
    const tensionIncrease = Math.min(100 - Number(provinceTension), 2 + Math.floor(Math.random() * 24));
    adjustProvinceTension(tensionIncrease);
    return {
      succeeded: false,
      successChance,
      message: tensionIncrease > 0
        ? `Penanaman ideologi di ${targetCountry} gagal karena ditolak warga. Ketegangan meningkat ${tensionIncrease} poin. Peluang keberhasilan misi ini ${successChance}%.`
        : `Penanaman ideologi di ${targetCountry} gagal karena ditolak warga. Ketegangan sudah maksimum. Peluang keberhasilan misi ini ${successChance}%.`
    };
  }

  await updateTargetIdeology(ideology);
  if (typeof window !== 'undefined') {
    const gameWindow = window as Window & {
      neosantara_province_ideology_overrides?: ProvinceIdeologyOverrides;
    };
    gameWindow.neosantara_province_ideology_overrides = {
      ...getIdeologyOverrides(),
      [targetCountry]: ideology
    };
  }

  return {
    succeeded: true,
    successChance,
    message: `Penanaman ideologi berhasil. Ideologi ${targetCountry} sekarang mengikuti ideologi negara Anda: ${ideology}.`
  };
}

const action: ProvinceAction = {
  id: 'tanamkan_ideologi',
  label: 'Tanamkan Ideologi',
  description: 'Menanamkan ideologi negara Anda ke provinsi ini dengan peluang keberhasilan 90%.',
  icon: BookOpen,
  onConfirm: instillProvinceIdeology
};

export default action;
