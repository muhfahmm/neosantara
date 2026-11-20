import type { NotificationMessage } from "../1_notifikasi_kepuasan_dan_peringkat/1_kepuasan/kepuasanLogic";
import type {
  OrgApplication,
  OrgApplicationResolution,
  OrganizationApplicationType,
} from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";
import { createInboxNotificationText, getDefaultInboxText } from "../notificationMessage";

export interface OrganizationMembershipNotification extends NotificationMessage {
  tradeType: "keanggotaan_organisasi_pbb" | "keanggotaan_organisasi_regional";
  organizationType: OrganizationApplicationType;
  organizationName: string;
  countryName: string;
  outcome: OrgApplicationResolution;
  approvalRate: number;
  category: "Organisasi PBB" | "Organisasi Regional";
  categoryKey: string;
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
  const categoryKey = organizationType === "pbb"
    ? "side_inbox.dynamicNotifications.organization.unCategory"
    : "side_inbox.dynamicNotifications.organization.regionalCategory";
  const titleKey = isAccepted
    ? "side_inbox.dynamicNotifications.organization.acceptedTitle"
    : "side_inbox.dynamicNotifications.organization.rejectedTitle";
  const titleParams = { organization: application.orgName };
  const messageKey = isAccepted
    ? "side_inbox.dynamicNotifications.organization.acceptedMessage"
    : "side_inbox.dynamicNotifications.organization.rejectedMessage";
  const messageParams = {
    country: application.countryName,
    organization: application.orgName,
  };

  return {
    id: `org-membership-${organizationType}-${toIdPart(application.countryName)}-${toIdPart(application.orgName)}-${evaluatedDate}`,
    title: getDefaultInboxText(titleKey, titleParams),
    titleKey,
    titleParams,
    sender: getDefaultInboxText("side_inbox.dynamicNotifications.organization.sender", {
      organization: application.orgName,
    }),
    senderKey: "side_inbox.dynamicNotifications.organization.sender",
    senderParams: { organization: application.orgName },
    ...createInboxNotificationText(messageKey, messageParams),
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
    category: organizationType === "pbb" ? "Organisasi PBB" : "Organisasi Regional",
    categoryKey,
  };
}
