import { Receipt } from 'lucide-react';
import type { ProvinceAction, ProvinceActionContext, ProvinceActionResult } from '../../provinceActionTypes';

function enforceProvinceTax({
  targetCountry,
  provinceBudget,
  provinceNetBalance,
  playerCountryDetail,
  taxedProvinces,
  updatePlayerCountryDetail,
  adjustPlayerNetBalance
}: ProvinceActionContext): ProvinceActionResult {
  const normalizeName = (value: string) => value.toLowerCase().trim();
  const currentTaxedProvinces = Array.isArray(playerCountryDetail?.taxedProvinces)
    ? playerCountryDetail.taxedProvinces.filter((country): country is string => typeof country === 'string')
    : taxedProvinces || [];
  if (currentTaxedProvinces.some(country => normalizeName(country) === normalizeName(targetCountry))) {
    throw new Error(`Pajak untuk ${targetCountry} sudah diberlakukan.`);
  }
  if (!playerCountryDetail) {
    throw new Error('Data keuangan negara pemain tidak tersedia.');
  }
  if (!Number.isFinite(provinceBudget) || Number(provinceBudget) < 0) {
    throw new Error(`Data anggaran ${targetCountry} tidak valid; pajak tidak dapat diberlakukan.`);
  }
  if (!Number.isFinite(provinceNetBalance)) {
    throw new Error(`Data netto kas ${targetCountry} tidak valid; pajak tidak dapat diberlakukan.`);
  }
  if (!updatePlayerCountryDetail || !adjustPlayerNetBalance) {
    throw new Error('Data keuangan negara pemain tidak dapat diperbarui.');
  }

  const taxRevenue = Math.round(Number(provinceBudget) * 0.03);
  const netBalanceIncrease = Math.max(0, Number(provinceNetBalance)) * 0.03;

  updatePlayerCountryDetail(previous => {
    if (!previous) return previous;
    const currentTaxedProvinces = Array.isArray(previous.taxedProvinces)
      ? previous.taxedProvinces.filter((country): country is string => typeof country === 'string')
      : [];
    return {
      ...previous,
      anggaran: Number(previous.anggaran || 0) + taxRevenue,
      taxedProvinces: [...currentTaxedProvinces, targetCountry]
    };
  });
  adjustPlayerNetBalance(netBalanceIncrease);

  return {
    succeeded: true,
    message: `Pajak berhasil diberlakukan di ${targetCountry}. Anggaran bertambah ${taxRevenue.toLocaleString()} (3% anggaran provinsi) dan netto kas negara naik ${netBalanceIncrease.toLocaleString()} (3% netto kas positif provinsi).`
  };
}

const action: ProvinceAction = {
  id: 'wajibkan_pajak',
  label: 'Wajibkan Membayar Pajak',
  description: 'Memberlakukan pajak dengan tambahan 3% anggaran provinsi dan kenaikan 3% netto kas positif provinsi untuk negara Anda.',
  icon: Receipt,
  onConfirm: enforceProvinceTax
};

export default action;
