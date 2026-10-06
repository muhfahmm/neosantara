'use client';

import ProvinsiActionGrid from './ProvinsiActionGrid';
import lootProvince from './2_operasi_militer/1_jarah_provinsi';
import intimidateProvince from './2_operasi_militer/2_intimidasi';
import deployMercenaries from './2_operasi_militer/3_kirim_tentara_bayaran';

interface ProvinsiOperasiMiliterProps {
  countryName: string;
  occupyingCountry: string;
}

export default function ProvinsiOperasiMiliter({ countryName, occupyingCountry }: ProvinsiOperasiMiliterProps) {
  return (
    <ProvinsiActionGrid
      targetCountry={countryName}
      occupyingCountry={occupyingCountry}
      actions={[lootProvince, intimidateProvince, deployMercenaries]}
    />
  );
}
