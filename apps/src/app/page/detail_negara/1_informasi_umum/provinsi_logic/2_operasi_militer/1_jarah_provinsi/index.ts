import { Coins } from 'lucide-react';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../../provinceActionTypes';

function lootProvince({
  targetCountry,
  provinceTension,
  adjustProvinceTension
}: ProvinceActionContext): ProvinceActionResult {
  if (!Number.isFinite(provinceTension) || !adjustProvinceTension) {
    throw new Error('Data ketegangan provinsi tidak tersedia.');
  }

  const requestedIncrease = 10 + Math.floor(Math.random() * 21);
  const actualIncrease = Math.min(100 - Number(provinceTension), requestedIncrease);
  adjustProvinceTension(actualIncrease);

  return {
    succeeded: true,
    message: actualIncrease > 0
      ? `Penjarahan ${targetCountry} berhasil. Ketegangan meningkat ${actualIncrease} poin.`
      : `Penjarahan ${targetCountry} tercatat, tetapi ketegangan sudah maksimum.`
  };
}

const action: ProvinceAction = {
  id: 'jarah_provinsi',
  label: 'Jarah Provinsi',
  description: 'Menjarah provinsi dan meningkatkan ketegangan secara acak 10–30 poin.',
  icon: Coins,
  onConfirm: lootProvince
};

export default action;
