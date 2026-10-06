'use client';

import ProvinsiActionGrid from './ProvinsiActionGrid';
import lootProvince from './2_operasi_militer/1_jarah_provinsi';
import intimidateProvince from './2_operasi_militer/2_intimidasi';

interface ProvinsiOperasiMiliterProps {
  countryName: string;
  occupyingCountry: string;
  provinceTension: number;
  playerCountryDetail: Record<string, unknown> | null;
  updatePlayerCountryDetail: (updater: (previous: Record<string, unknown> | null) => Record<string, unknown> | null) => void;
}

export default function ProvinsiOperasiMiliter({
  countryName,
  occupyingCountry,
  provinceTension,
  playerCountryDetail,
  updatePlayerCountryDetail
}: ProvinsiOperasiMiliterProps) {
  return (
    <ProvinsiActionGrid
      targetCountry={countryName}
      occupyingCountry={occupyingCountry}
      provinceTension={provinceTension}
      playerCountryDetail={playerCountryDetail}
      updatePlayerCountryDetail={updatePlayerCountryDetail}
      actions={[lootProvince, intimidateProvince]}
    />
  );
}
