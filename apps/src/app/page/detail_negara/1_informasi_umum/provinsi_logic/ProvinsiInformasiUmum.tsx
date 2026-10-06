'use client';

import ProvinsiActionGrid from './ProvinsiActionGrid';
import liberateProvince from './1_beri_kemerdekaan';
import assignMissionaries from './2_tugaskan_misionaris';
import requireTaxes from './3_wajibkan_pajak';
import sendAid from './4_kirim_bantuan';
import instillIdeology from './5_tanamkan_ideologi';

interface ProvinsiInformasiUmumProps {
  countryName: string;
  occupyingCountry: string;
  playerReligion?: string;
  targetReligion?: string;
  updateTargetReligion?: (religion: string) => void;
  playerIdeology?: string;
  targetIdeology?: string;
  updateTargetIdeology?: (ideology: string) => void;
  provinceBudget?: number;
  provinceNetBalance?: number;
  provinceTension?: number;
  currentDate?: Date;
  provinceData?: Record<string, unknown> | null;
  playerCountryDetail?: Record<string, unknown> | null;
  taxedProvinces?: string[];
  updatePlayerCountryDetail?: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
  adjustPlayerNetBalance?: (delta: number) => void;
}

export default function ProvinsiInformasiUmum({
  countryName,
  occupyingCountry,
  playerReligion,
  targetReligion,
  updateTargetReligion,
  playerIdeology,
  targetIdeology,
  updateTargetIdeology,
  provinceBudget,
  provinceNetBalance,
  provinceTension,
  currentDate,
  provinceData,
  playerCountryDetail,
  taxedProvinces,
  updatePlayerCountryDetail,
  adjustPlayerNetBalance
}: ProvinsiInformasiUmumProps) {
  return (
    <ProvinsiActionGrid
      targetCountry={countryName}
      occupyingCountry={occupyingCountry}
      playerReligion={playerReligion}
      targetReligion={targetReligion}
      updateTargetReligion={updateTargetReligion}
      playerIdeology={playerIdeology}
      targetIdeology={targetIdeology}
      updateTargetIdeology={updateTargetIdeology}
      provinceBudget={provinceBudget}
      provinceNetBalance={provinceNetBalance}
      provinceTension={provinceTension}
      currentDate={currentDate}
      provinceData={provinceData}
      playerCountryDetail={playerCountryDetail}
      taxedProvinces={taxedProvinces}
      updatePlayerCountryDetail={updatePlayerCountryDetail}
      adjustPlayerNetBalance={adjustPlayerNetBalance}
      actions={[liberateProvince, assignMissionaries, requireTaxes, sendAid, instillIdeology]}
    />
  );
}
