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
}

export default function ProvinsiInformasiUmum({ countryName, occupyingCountry }: ProvinsiInformasiUmumProps) {
  return (
    <ProvinsiActionGrid
      targetCountry={countryName}
      occupyingCountry={occupyingCountry}
      actions={[liberateProvince, assignMissionaries, requireTaxes, sendAid, instillIdeology]}
    />
  );
}
