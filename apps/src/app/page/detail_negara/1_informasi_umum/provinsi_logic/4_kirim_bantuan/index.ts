import { HandHeart } from 'lucide-react';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../provinceActionTypes';

function sendProvinceAid({
  targetCountry,
  aidCategory,
  aidItemLabel,
  provinceTension,
  adjustProvinceTension
}: ProvinceActionContext): ProvinceActionResult {
  if (!aidCategory || !aidItemLabel) {
    throw new Error('Pilih jenis bantuan sebelum mengirim bantuan.');
  }
  if (!Number.isFinite(provinceTension) || !adjustProvinceTension) {
    throw new Error('Data ketegangan provinsi tidak tersedia; bantuan tidak dapat diproses.');
  }

  const tensionReduction = 1 + Math.floor(Math.random() * 25);
  const actualReduction = Math.min(Math.max(0, Number(provinceTension)), tensionReduction);
  adjustProvinceTension(-actualReduction);
  return {
    succeeded: true,
    message: actualReduction > 0
      ? `Bantuan ${aidCategory} berupa ${aidItemLabel} berhasil dikirim ke ${targetCountry}. Ketegangan turun ${actualReduction} poin.`
      : `Bantuan ${aidCategory} berupa ${aidItemLabel} berhasil dikirim ke ${targetCountry}. Ketegangan tetap 0 karena sudah mencapai minimum.`
  };
}

const action: ProvinceAction = {
  id: 'kirim_bantuan',
  label: 'Kirim Bantuan',
  description: 'Pilih bantuan dari sektor produksi provinsi. Bantuan mengurangi ketegangan hingga 25 poin dan tetap dapat dikirim saat ketegangan 0.',
  icon: HandHeart,
  onConfirm: sendProvinceAid
};

export default action;
