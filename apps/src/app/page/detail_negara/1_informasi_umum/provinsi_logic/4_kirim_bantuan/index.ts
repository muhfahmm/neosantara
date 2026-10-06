import { HandHeart } from 'lucide-react';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../provinceActionTypes';

function sendProvinceAid({
  targetCountry,
  provinceTension,
  adjustProvinceTension
}: ProvinceActionContext): ProvinceActionResult {
  if (!Number.isFinite(provinceTension) || !adjustProvinceTension) {
    throw new Error('Data ketegangan provinsi tidak tersedia; bantuan tidak dapat diproses.');
  }
  if (Number(provinceTension) <= 0) {
    throw new Error(`${targetCountry} sudah berada pada ketegangan minimum.`);
  }

  const tensionReduction = 1 + Math.floor(Math.random() * 25);
  const actualReduction = Math.min(Math.max(0, Number(provinceTension)), tensionReduction);
  adjustProvinceTension(-actualReduction);
  return {
    succeeded: true,
    message: `Bantuan berhasil dikirim ke ${targetCountry}. Ketegangan turun ${actualReduction} poin.`
  };
}

const action: ProvinceAction = {
  id: 'kirim_bantuan',
  label: 'Kirim Bantuan',
  description: 'Mengurangi ketegangan provinsi secara acak sebanyak 1–25 poin.',
  icon: HandHeart,
  onConfirm: sendProvinceAid
};

export default action;
