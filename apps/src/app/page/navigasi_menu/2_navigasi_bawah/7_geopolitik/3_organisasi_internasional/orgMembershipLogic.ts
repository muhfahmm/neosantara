import { gameStateStorage } from '@/app/logic/gameStateStorage';
import { getDaysElapsed, formatDate } from "@/app/logic/production_logic";
import {
  addActiveOrganizationMembership,
  clearActiveOrganizationMemberships,
  clearExpelledOrganizationCountries,
  getActiveOrganizationMemberships,
  ORGANIZATION_MEMBERSHIP_UPDATED_EVENT,
  replaceActiveOrganizationMemberships,
} from "@/../../json/14_database_organisasi_internasional/organizationMembers";

export interface OrgApplication {
  orgName: string;
  countryName: string;
  submissionDate: string; // YYYY-MM-DD
  status: "pending" | "accepted" | "rejected";
  approvalRate: number; // Persentase kelulusan (misal 75%)
  organizationType?: OrganizationApplicationType;
  evaluatedDate?: string;
}

export type OrganizationApplicationType = "pbb" | "regional";
export type OrgApplicationResolution = "accepted" | "rejected";

const APPLICATIONS_KEY = "neosantara_org_applications_v1";
const JOINED_ORGS_KEY = "neosantara_user_joined_orgs_v1";
export const ORG_APPLICATION_UPDATED_EVENT = "neosantara_org_application_updated";

export function clearAllOrganizationMembershipData(): void {
  if (typeof window === "undefined") return;
  try {
    clearActiveOrganizationMemberships();
    gameStateStorage.removeItem(APPLICATIONS_KEY);
    gameStateStorage.removeItem("neosantara_expelled_organization_countries");
    gameStateStorage.keys().forEach((key) => {
      if (key.startsWith(JOINED_ORGS_KEY) || key.startsWith("neosantara_user_joined_orgs") || key.includes("expelled_organization")) {
        gameStateStorage.removeItem(key);
      }
    });
    clearExpelledOrganizationCountries();
    window.dispatchEvent(new CustomEvent(ORG_APPLICATION_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to clear organization membership data:", e);
  }
}

export function clearUnpersistedOrganizationMembershipState(): void {
  if (typeof window === "undefined") return;
  clearActiveOrganizationMemberships();

  const apps = getOrgApplications();
  const remainingApps: Record<string, OrgApplication> = {};
  let removedAcceptedApplication = false;
  Object.entries(apps).forEach(([key, application]) => {
    if (application.status === "accepted") {
      removedAcceptedApplication = true;
      return;
    }
    remainingApps[key] = application;
  });
  if (removedAcceptedApplication) saveOrgApplications(remainingApps);

  try {
    for (let index = gameStateStorage.length - 1; index >= 0; index--) {
      const key = gameStateStorage.key(index);
      if (key?.startsWith(JOINED_ORGS_KEY) || key?.startsWith("neosantara_user_joined_orgs")) {
        gameStateStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Failed to clear unsaved organization memberships:", error);
  }
  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
}


function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

const PBB_ORGANIZATION_KEYS = new Set([
  "Interpol",
  "Organisasi Kesehatan Dunia (WHO)",
  "UNESCO",
  "Organisasi Perdagangan Dunia (WTO)",
  "Organisasi Buruh Internasional (ILO)",
  "Organisasi Pangan dan Pertanian (FAO)",
  "Organisasi Maritim Internasional (IMO)",
  "Organisasi Telekomunikasi Internasional (ITU)",
  "Organisasi Meteorologi Dunia (WMO)",
].map(normalizeKey));

export function getOrgApplicationType(application: OrgApplication): OrganizationApplicationType {
  if (application.organizationType === "pbb" || application.organizationType === "regional") {
    return application.organizationType;
  }
  return PBB_ORGANIZATION_KEYS.has(normalizeKey(application.orgName)) ? "pbb" : "regional";
}

export function getOrgApplications(): Record<string, OrgApplication> {
  if (typeof window === "undefined") return {};
  try {
    const raw = gameStateStorage.getItem(APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to read org applications:", e);
    return {};
  }
}

export function saveOrgApplications(apps: Record<string, OrgApplication>): void {
  if (typeof window === "undefined") return;
  try {
    gameStateStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent(ORG_APPLICATION_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to save org applications:", e);
  }
}

export function getUserJoinedOrgs(countryName: string): Set<string> {
  if (typeof window === "undefined" || !countryName) return new Set();
  return new Set(getActiveOrganizationMemberships(countryName).map(normalizeKey));
}

export function getUserJoinedOrgSnapshot(countryName: string): string[] {
  return getActiveOrganizationMemberships(countryName);
}

export function restoreUserJoinedOrgs(countryName: string, organizations: string[]): void {
  if (typeof window === "undefined" || !countryName) return;
  replaceActiveOrganizationMemberships(countryName, organizations);
  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
}

export function isUserJoinedOrg(countryName: string, orgName: string): boolean {
  if (!countryName || !orgName) return false;
  const joinedSet = getUserJoinedOrgs(countryName);
  return joinedSet.has(normalizeKey(orgName));
}

export function addUserJoinedOrg(countryName: string, orgName: string): void {
  if (typeof window === "undefined" || !countryName || !orgName) return;
  addActiveOrganizationMembership(countryName, orgName);
  window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
}

export function submitOrgApplication(
  countryName: string,
  orgName: string,
  currentDateStr: string,
  customApprovalRate?: number,
  organizationType: OrganizationApplicationType = "regional"
): OrgApplication {
  const apps = getOrgApplications();
  const key = `${normalizeKey(countryName)}_${normalizeKey(orgName)}`;
  
  // Peluang penerimaan diatur tetap 50%
  const approvalRate = customApprovalRate ?? 50;

  const newApp: OrgApplication = {
    orgName,
    countryName,
    submissionDate: currentDateStr || formatDate(new Date()),
    status: "pending",
    approvalRate,
    organizationType,
  };

  apps[key] = newApp;
  saveOrgApplications(apps);
  return newApp;
}

export function getApplicationForOrg(
  countryName: string,
  orgName: string
): OrgApplication | undefined {
  const apps = getOrgApplications();
  const key = `${normalizeKey(countryName)}_${normalizeKey(orgName)}`;
  const application = apps[key];
  if (application?.status === "accepted" && !isUserJoinedOrg(countryName, orgName)) {
    return undefined;
  }
  return application;
}

/**
 * Memproses semua permohonan keanggotaan yang sedang berjalan.
 * Jika sudah berlalu 30 hari sejak tanggal pengajuan:
 * - Dihitung peluang penerimaan sesuai approvalRate (%).
 * - Jika diterima: org ditambahkan ke keanggotaan aktif selama sesi game.
 * - Jika ditolak: status -> 'rejected'.
 */
export function checkAndProcessOrgApplications(
  countryName: string,
  currentDateStr: string,
  onResolved?: (application: OrgApplication, outcome: OrgApplicationResolution) => void
): void {
  if (!countryName || !currentDateStr) return;
  const apps = getOrgApplications();
  const resolvedApplications: Array<{
    application: OrgApplication;
    outcome: OrgApplicationResolution;
  }> = [];
  let updated = false;

  Object.entries(apps).forEach(([key, app]) => {
    if (app.status !== "pending") return;
    if (normalizeKey(app.countryName) !== normalizeKey(countryName)) return;

    const daysElapsed = getDaysElapsed(app.submissionDate, currentDateStr);

    if (daysElapsed >= 30) {
      const roll = Math.floor(Math.random() * 100) + 1;
      const isAccepted = roll <= app.approvalRate;
      const outcome: OrgApplicationResolution = isAccepted ? "accepted" : "rejected";

      if (isAccepted) {
        app.status = "accepted";
        app.evaluatedDate = currentDateStr;
        addUserJoinedOrg(countryName, app.orgName);
        resolvedApplications.push({ application: { ...app }, outcome });
        delete apps[key];
      } else {
        app.status = "rejected";
        app.evaluatedDate = currentDateStr;
        resolvedApplications.push({ application: { ...app }, outcome });
      }
      updated = true;
    }
  });

  if (updated) {
    saveOrgApplications(apps);
  }
  resolvedApplications.forEach(({ application, outcome }) => onResolved?.(application, outcome));
}
