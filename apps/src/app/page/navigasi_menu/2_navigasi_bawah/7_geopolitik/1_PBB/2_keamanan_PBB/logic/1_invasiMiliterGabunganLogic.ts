import { isCountryAnnexed } from "../../pbbVotingEligibility";
import { getIsoForCountryName } from "../../pbbCountryIso";
import {
  getCouncilRoster,
  PERMANENT_SECURITY_COUNCIL_MEMBERS,
} from "../logika_anggota_tidak_tetap/securityCouncilElection";

export interface SecurityCouncilInvasionParticipant {
  name: string;
  iso: string;
  role: "Anggota Tetap" | "Anggota Tidak Tetap";
}

export interface SecurityCouncilInvasionOperation {
  resolutionId: string;
  proposer: { name: string; iso: string };
  target: { name: string; iso: string };
  participants: SecurityCouncilInvasionParticipant[];
  dateStr: string;
}

export interface SecurityCouncilInvasionNews extends SecurityCouncilInvasionOperation {
  id: string;
  type: "invasi_gabungan_pbb";
  category: "operasi_militer";
  countryName?: string;
  headline: string;
  content: string;
  timestamp: string;
}

export function getSecurityCouncilInvasionParticipants(
  targetName: string,
  targetIso: string
): SecurityCouncilInvasionParticipant[] {
  const permanentIsos = new Set(
    PERMANENT_SECURITY_COUNCIL_MEMBERS.map(member => member.iso.toLowerCase())
  );
  const excludedTargetIso = (targetIso || getIsoForCountryName(targetName)).toLowerCase();
  const seenIsos = new Set<string>();

  return getCouncilRoster()
    .filter(member => {
      const iso = member.iso.toLowerCase();
      const normalizedName = member.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const normalizedTarget = targetName.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (iso === excludedTargetIso || normalizedName === normalizedTarget) return false;
      if (seenIsos.has(iso) || isCountryAnnexed(member.name, member.iso)) return false;
      seenIsos.add(iso);
      return true;
    })
    .map(member => ({
      name: member.name,
      iso: member.iso,
      role: permanentIsos.has(member.iso.toLowerCase())
        ? "Anggota Tetap"
        : "Anggota Tidak Tetap",
    }));
}

export function createSecurityCouncilInvasionNews(
  operation: SecurityCouncilInvasionOperation
): SecurityCouncilInvasionNews {
  return {
    ...operation,
    id: `news-pbb-operation-${operation.resolutionId}`,
    type: "invasi_gabungan_pbb",
    category: "operasi_militer",
    headline: `⚔️ OPERASI GABUNGAN PBB: ${operation.target.name} menjadi target`,
    content: `Dewan Keamanan PBB menyetujui resolusi yang diajukan ${operation.proposer.name}. Pasukan anggota tetap dan tidak tetap Dewan Keamanan bergerak menuju ${operation.target.name}. Klik berita ini untuk melihat negara yang berpartisipasi.`,
    timestamp: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
