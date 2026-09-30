export interface ChangeIdeologyResult {
  success: boolean;
  message: string;
  newAnggaran: number;
}

export const IDEOLOGY_CHANGE_COST = 75000;

export function attemptChangeIdeology(currentAnggaran: number): ChangeIdeologyResult {
  const anggaran = Number(currentAnggaran) || 0;
  if (anggaran < IDEOLOGY_CHANGE_COST) {
    return {
      success: false,
      message: `Kas negara tidak cukup. Dibutuhkan ${IDEOLOGY_CHANGE_COST.toLocaleString('id-ID')} NEO.`,
      newAnggaran: anggaran,
    };
  }

  return {
    success: true,
    message: `Biaya ideologi berhasil dipotong ${IDEOLOGY_CHANGE_COST.toLocaleString('id-ID')} NEO.`,
    newAnggaran: anggaran - IDEOLOGY_CHANGE_COST,
  };
}
