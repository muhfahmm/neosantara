import { Users } from 'lucide-react';
import type { ProvinceAction } from '../../provinceActionTypes';

const action: ProvinceAction = {
  id: 'kirim_tentara_bayaran',
  label: 'Kirim Tentara Bayaran',
  description: 'Mencatat penugasan tentara bayaran ke wilayah ini.',
  icon: Users
};

export default action;
