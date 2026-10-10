import { Church } from 'lucide-react';
import { getMissionarySuccessChancePercent } from '@/app/page/bonus_logic';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../../provinceActionTypes';

type ProvinceReligionOverrides = Record<string, string>;

function getReligionOverrides(): ProvinceReligionOverrides {
  if (typeof window === 'undefined') return {};
  return (window as Window & {
    neosantara_province_religion_overrides?: ProvinceReligionOverrides;
  }).neosantara_province_religion_overrides || {};
}

export function getProvinceReligionOverride(countryName: string): string | undefined {
  const normalizedCountry = countryName.toLowerCase().trim();
  return Object.entries(getReligionOverrides()).find(
    ([name]) => name.toLowerCase().trim() === normalizedCountry
  )?.[1];
}

async function assignMissionaries({
  targetCountry,
  playerReligion,
  updateTargetReligion,
  playerCountryDetail,
  provinceTension,
  adjustProvinceTension
}: ProvinceActionContext): Promise<ProvinceActionResult> {
  const religion = String(playerReligion || '').trim();
  if (!religion || religion === '-' || religion.toLowerCase() === 'belum tersedia') {
    throw new Error('Agama negara pemain belum tersedia.');
  }
  if (!updateTargetReligion) {
    throw new Error('Data agama provinsi tidak dapat diperbarui.');
  }

  const successChance = getMissionarySuccessChancePercent(playerCountryDetail);
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
        ? `Penugasan misionaris di ${targetCountry} gagal karena ditolak warga. Ketegangan meningkat ${tensionIncrease} poin. Tingkat keberhasilan misi ini adalah ${successChance}%.`
        : `Penugasan misionaris di ${targetCountry} gagal karena ditolak warga. Ketegangan sudah maksimum. Tingkat keberhasilan misi ini adalah ${successChance}%.`
    };
  }

  await updateTargetReligion(religion);
  if (typeof window !== 'undefined') {
    const gameWindow = window as Window & {
      neosantara_province_religion_overrides?: ProvinceReligionOverrides;
    };
    gameWindow.neosantara_province_religion_overrides = {
      ...getReligionOverrides(),
      [targetCountry]: religion
    };
  }

  return {
    succeeded: true,
    successChance,
    message: `Penugasan misionaris berhasil. Agama ${targetCountry} sekarang mengikuti agama negara Anda: ${religion}.`
  };
}

const action: ProvinceAction = {
  id: 'tugaskan_misionaris',
  label: 'Tugaskan Misionaris',
  description: 'Mengubah agama mayoritas wilayah ini agar sama dengan agama negara Anda. Penelitian Misi Keagamaan Internasional meningkatkan peluang keberhasilan.',
  icon: Church,
  onConfirm: assignMissionaries
};

export default action;
