import { Receipt } from 'lucide-react';
import type { ProvinceAction } from '../provinceActionTypes';

const action: ProvinceAction = {
  id: 'wajibkan_pajak',
  label: 'Wajibkan Membayar Pajak',
  description: 'Mencatat kebijakan kewajiban pajak untuk wilayah ini.',
  icon: Receipt
};

export default action;
