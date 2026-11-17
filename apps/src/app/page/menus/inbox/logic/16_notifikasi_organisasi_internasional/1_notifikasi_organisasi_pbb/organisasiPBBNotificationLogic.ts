import type { OrgApplication, OrgApplicationResolution } from "@/app/page/navigasi_menu/2_navigasi_bawah/7_geopolitik/3_organisasi_internasional/orgMembershipLogic";
import { createOrganizationMembershipNotification } from "../organizationMembershipNotificationLogic";

export function createPBBMembershipNotification(
  application: OrgApplication,
  outcome: OrgApplicationResolution,
  evaluatedDate: string
) {
  return createOrganizationMembershipNotification(application, outcome, evaluatedDate, "pbb");
}
