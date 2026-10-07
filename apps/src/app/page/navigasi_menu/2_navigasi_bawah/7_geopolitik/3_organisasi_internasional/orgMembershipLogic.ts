import { getDaysElapsed, formatDate } from "@/app/logic/production_logic";
import { clearExpelledOrganizationCountries, ORGANIZATION_MEMBERSHIP_UPDATED_EVENT } from "@/../../json/database_organisasi_internasional/organizationMembers";

export interface OrgApplication {
  orgName: string;
  countryName: string;
  submissionDate: string; // YYYY-MM-DD
  status: "pending" | "accepted" | "rejected";
  approvalRate: number; // Persentase kelulusan (misal 75%)
  evaluatedDate?: string;
}

const APPLICATIONS_KEY = "neosantara_org_applications_v1";
const JOINED_ORGS_KEY = "neosantara_user_joined_orgs_v1";
export const ORG_APPLICATION_UPDATED_EVENT = "neosantara_org_application_updated";

export function clearAllOrganizationMembershipData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(APPLICATIONS_KEY);
    localStorage.removeItem("neosantara_expelled_organization_countries");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(JOINED_ORGS_KEY) || key.startsWith("neosantara_user_joined_orgs") || key.includes("expelled_organization")) {
        localStorage.removeItem(key);
      }
    });
    clearExpelledOrganizationCountries();
    window.dispatchEvent(new CustomEvent(ORG_APPLICATION_UPDATED_EVENT));
    window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to clear organization membership data:", e);
  }
}

if (typeof window !== "undefined") {
  // Menghapus data anggota PBB & Regional di LocalStorage saat user merefresh halaman atau menutup tab
  window.addEventListener("beforeunload", () => {
    clearAllOrganizationMembershipData();
  });
}

function normalizeKey(str: string): string {
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

export function getOrgApplications(): Record<string, OrgApplication> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(APPLICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to read org applications:", e);
    return {};
  }
}

export function saveOrgApplications(apps: Record<string, OrgApplication>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent(ORG_APPLICATION_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to save org applications:", e);
  }
}

export function getUserJoinedOrgs(countryName: string): Set<string> {
  if (typeof window === "undefined" || !countryName) return new Set();
  try {
    const raw = localStorage.getItem(`${JOINED_ORGS_KEY}_${normalizeKey(countryName)}`);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(normalizeKey) : []);
  } catch (e) {
    return new Set();
  }
}

export function isUserJoinedOrg(countryName: string, orgName: string): boolean {
  if (!countryName || !orgName) return false;
  const joinedSet = getUserJoinedOrgs(countryName);
  return joinedSet.has(normalizeKey(orgName));
}

export function addUserJoinedOrg(countryName: string, orgName: string): void {
  if (typeof window === "undefined" || !countryName || !orgName) return;
  const joinedSet = getUserJoinedOrgs(countryName);
  joinedSet.add(normalizeKey(orgName));
  try {
    localStorage.setItem(
      `${JOINED_ORGS_KEY}_${normalizeKey(countryName)}`,
      JSON.stringify([...joinedSet])
    );
    window.dispatchEvent(new CustomEvent(ORGANIZATION_MEMBERSHIP_UPDATED_EVENT));
  } catch (e) {
    console.error("Failed to add user joined org:", e);
  }
}

export function submitOrgApplication(
  countryName: string,
  orgName: string,
  currentDateStr: string,
  customApprovalRate?: number
): OrgApplication {
  const apps = getOrgApplications();
  const key = `${normalizeKey(countryName)}_${normalizeKey(orgName)}`;
  
  // Persentase penerimaan acak antara 65% - 90% jika tidak ditentukan
  const approvalRate = customApprovalRate ?? (Math.floor(Math.random() * 26) + 65);

  const newApp: OrgApplication = {
    orgName,
    countryName,
    submissionDate: currentDateStr || formatDate(new Date()),
    status: "pending",
    approvalRate,
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
  return apps[key];
}

/**
 * Memproses semua permohonan keanggotaan yang sedang berjalan.
 * Jika sudah berlalu 30 hari sejak tanggal pengajuan:
 * - Dihitung peluang penerimaan sesuai approvalRate (%).
 * - Jika diterima: status -> 'accepted', org ditambahkan ke joinedOrgs.
 * - Jika ditolak: status -> 'rejected'.
 */
export function checkAndProcessOrgApplications(
  countryName: string,
  currentDateStr: string,
  addNotificationCallback?: (notif: any) => void
): void {
  if (!countryName || !currentDateStr) return;
  const apps = getOrgApplications();
  let updated = false;

  Object.entries(apps).forEach(([key, app]) => {
    if (app.status !== "pending") return;
    if (normalizeKey(app.countryName) !== normalizeKey(countryName)) return;

    const daysElapsed = getDaysElapsed(app.submissionDate, currentDateStr);

    if (daysElapsed >= 30) {
      const roll = Math.floor(Math.random() * 100) + 1;
      const isAccepted = roll <= app.approvalRate;

      if (isAccepted) {
        app.status = "accepted";
        app.evaluatedDate = currentDateStr;
        addUserJoinedOrg(countryName, app.orgName);

        if (addNotificationCallback) {
          addNotificationCallback({
            id: `org_acc_${Date.now()}_${Math.random()}`,
            title: `Keanggotaan ${app.orgName} DITERIMA!`,
            desc: `Selamat! Permohonan keanggotaan ${countryName} di ${app.orgName} resmi DITERIMA oleh sidang dewan anggota (Peluang Penerimaan: ${app.approvalRate}%). Seluruh bonus keanggotaan kini telah aktif!`,
            date: currentDateStr,
            category: "geopolitik",
            type: "info",
            read: false,
          });
        }
      } else {
        app.status = "rejected";
        app.evaluatedDate = currentDateStr;

        if (addNotificationCallback) {
          addNotificationCallback({
            id: `org_rej_${Date.now()}_${Math.random()}`,
            title: `Keanggotaan ${app.orgName} DITOLAK`,
            desc: `Permohonan keanggotaan ${countryName} di ${app.orgName} DITOLAK oleh sidang dewan anggota (Peluang Penerimaan: ${app.approvalRate}%). Anda dapat mengajukan permohonan kembali di kemudian hari.`,
            date: currentDateStr,
            category: "geopolitik",
            type: "warning",
            read: false,
          });
        }
      }
      updated = true;
    }
  });

  if (updated) {
    saveOrgApplications(apps);
  }
}
