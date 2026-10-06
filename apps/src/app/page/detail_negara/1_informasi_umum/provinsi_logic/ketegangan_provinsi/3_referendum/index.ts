export const PROVINCE_REFERENDUM_VOTING_DAYS = 30;

export interface ProvinceReferendum {
  status: 'pending' | 'processing' | 'failed';
  openedAt: string;
  votingEndsAt: string;
  independenceVoteShare?: number;
  crackdownIncidents?: number;
}

export interface ProvinceReferendumResult {
  independenceVoteShare: number;
  approved: boolean;
}

function formatGameDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createProvinceReferendum(openedAt: Date): ProvinceReferendum {
  if (!Number.isFinite(openedAt.getTime())) {
    throw new Error('Tanggal pembukaan referendum tidak valid.');
  }

  const votingEndsAt = new Date(openedAt);
  votingEndsAt.setDate(votingEndsAt.getDate() + PROVINCE_REFERENDUM_VOTING_DAYS);

  return {
    status: 'pending',
    openedAt: formatGameDate(openedAt),
    votingEndsAt: formatGameDate(votingEndsAt)
  };
}

export function hasProvinceReferendumEnded(referendum: ProvinceReferendum, currentDate: Date): boolean {
  if (referendum.status !== 'pending' || !Number.isFinite(currentDate.getTime())) return false;
  return formatGameDate(currentDate) >= referendum.votingEndsAt;
}

export function resolveProvinceReferendum(crackdownIncidents = 0): ProvinceReferendumResult {
  const baseVoteShare = 35 + Math.floor(Math.random() * 51);
  const independenceVoteShare = Math.min(95, baseVoteShare + Math.max(0, crackdownIncidents) * 8);
  return {
    independenceVoteShare,
    approved: independenceVoteShare > 50
  };
}
