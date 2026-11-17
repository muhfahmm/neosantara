import type { NotificationMessage } from "../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";
import type {
  OrgApplication,
  OrgApplicationResolution,
  OrganizationApplicationType,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";

export interface OrganizationMembershipNotification extends NotificationMessage {
  tradeType: "keanggotaan_organisasi_pbb" | "keanggotaan_organisasi_regional";
  organizationType: OrganizationApplicationType;
  organizationName: string;
  countryName: string;
  outcome: OrgApplicationResolution;
  approvalRate: number;
  category: "Organisasi PBB" | "Organisasi Regional";
}

function toIdPart(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

export function createOrganizationMembershipNotification(
  application: OrgApplication,
  outcome: OrgApplicationResolution,
  evaluatedDate: string,
  organizationType: OrganizationApplicationType
): OrganizationMembershipNotification {
  const isAccepted = outcome === "accepted";
  const category = organizationType === "pbb" ? "Organisasi PBB" : "Organisasi Regional";

  return {
    id: `org-membership-${organizationType}-${toIdPart(application.countryName)}-${toIdPart(application.orgName)}-${evaluatedDate}`,
    title: isAccepted
      ? `Keanggotaan ${application.orgName} Diterima`
      : `Keanggotaan ${application.orgName} Ditolak`,
    sender: `Sekretariat ${application.orgName}`,
    message: isAccepted
      ? `Permohonan ${application.countryName} untuk bergabung dengan ${application.orgName} diterima setelah 30 hari perundingan. Keanggotaan dan manfaat organisasi kini aktif.`
      : `Permohonan ${application.countryName} untuk bergabung dengan ${application.orgName} ditolak setelah 30 hari perundingan. Negara dapat mengajukan permohonan kembali di kemudian hari.`,
    timestamp: evaluatedDate,
    type: "peringkat",
    value: application.approvalRate,
    isRead: false,
    tradeType: organizationType === "pbb"
      ? "keanggotaan_organisasi_pbb"
      : "keanggotaan_organisasi_regional",
    organizationType,
    organizationName: application.orgName,
    countryName: application.countryName,
    outcome,
    approvalRate: application.approvalRate,
    category,
  };
}
