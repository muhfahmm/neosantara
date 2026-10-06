import { HandHeart } from 'lucide-react';
import type { ProvinceAction } from '../provinceActionTypes';

const action: ProvinceAction = {
  id: 'kirim_bantuan',
  label: 'Kirim Bantuan',
  description: 'Mencatat pengiriman bantuan ke wilayah ini.',
  icon: HandHeart
};

export default action;
