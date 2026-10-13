export interface ChangeReligionResult {
  success: boolean;
  message: string;
  newAnggaran: number;
}

export const RELIGION_CHANGE_COST = 50000;

export function attemptChangeReligion(currentAnggaran: number): ChangeReligionResult {
  const anggaran = Number(currentAnggaran) || 0;
  if (anggaran < RELIGION_CHANGE_COST) {
    return {
      success: false,
      message: `Kas negara tidak cukup. Dibutuhkan ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO.`,
      newAnggaran: anggaran,
    };
  }

  return {
    success: true,
    message: `Biaya agama berhasil dipotong ${RELIGION_CHANGE_COST.toLocaleString('id-ID', { maximumFractionDigits: 2 })} NEO.`,
    newAnggaran: anggaran - RELIGION_CHANGE_COST,
  };
}
