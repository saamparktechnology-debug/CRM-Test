import { UserItem, UserRole } from "@/features/users/types"
import { api } from "@/lib/api"
import { usePermissionStore } from "@/store/usePermissionStore"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import {
  filterGlobalDeletedItems,
  markGlobalItemDeleted,
  isGlobalItemDeleted,
  unmarkGlobalItemDeleted,
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  syncGlobalDeletedIds,
  getLocalDeletedIds,
} from "@/lib/storageSync"
import { recordActivityLog } from "@/services/activityLogService"


export const USERS_CACHE_TTL_MS = 60_000
let _usersCacheData: UserItem[] | null = null
let _usersCacheTime = 0
let _usersCacheKey = ""

export function getUsersCacheState() {
  return { data: _usersCacheData, time: _usersCacheTime, key: _usersCacheKey }
}

export function setUsersCacheState(data: UserItem[] | null, time: number, key: string) {
  _usersCacheData = data
  _usersCacheTime = time
  _usersCacheKey = key
}

export function invalidateUsersCache(): void {
  _usersCacheData = null
  _usersCacheTime = 0
  _usersCacheKey = ""
}

if (typeof window !== "undefined") {
  const bustCache = () => invalidateUsersCache()
  window.addEventListener("saampark_company_switched", bustCache)
  window.addEventListener("saampark_branch_switched", bustCache)
  window.addEventListener("saampark_subbranch_switched", bustCache)
}
export const isRootSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return e === "saampark.official@gmail.com" || e === "saampark.official";
};

// Default System User Accounts for SAAMPARK Group (used only if MySQL has no users yet)
// Default System User Accounts for SAAMPARK Group (used only for initial DB bootstrap)
export const DEFAULT_SYSTEM_ACCOUNTS: UserItem[] = [];

// Helper: get deleted user emails (synced from MySQL deleted table specifically for users module)
export async function getDeletedUserEmailsAsync(): Promise<string[]> {
  try {
    const deletedIds = await syncGlobalDeletedIds("users");
    return deletedIds.filter((id: string) => id.includes('@'));
  } catch {
    return [];
  }
}

export function getDeletedUserEmails(): string[] {
  try {
    const deleted = getLocalDeletedIds("users");
    return deleted.filter((id: string) => id.includes('@'));
  } catch {
    return [];
  }
}

// Helper: check if a specific user email has been deleted
export function isUserDeleted(email: string): boolean {
  if (!email) return false;
  const normEmail = email.toLowerCase().trim();
  return getDeletedUserEmails().includes(normEmail);
}

// Helper: mark a user email as permanently deleted (stored in MySQL via markGlobalItemDeleted)
export function markUserAsDeleted(email: string): void {
  if (!email) return;
  const normEmail = email.toLowerCase().trim();
  markGlobalItemDeleted(normEmail, "users").catch(() => {});
}

// Helper: unmark a user email as deleted
export function unmarkUserAsDeleted(email: string): void {
  if (!email) return;
  const normEmail = email.toLowerCase().trim();
  unmarkGlobalItemDeleted(normEmail);
}

// Helper: get user accounts — reads strictly from MySQL database

export function generateCompanyEmployeeId(companyId?: string, existingUsers: UserItem[] = []): string {
  const comp = String(companyId || "").toLowerCase().trim();
  const isConsultancy = comp === "consultancy" || comp === "2" || comp.includes("consult");
  const prefix = isConsultancy ? "SCS-EMP-" : "STR-EMP-";
  
  // Current 2-digit year (e.g. 2026 -> 26)
  const yearSuffix = String(new Date().getFullYear()).slice(-2);
  const patternPrefix = `${prefix}${yearSuffix}`; // e.g. "STR-EMP-26" or "SCS-EMP-26"

  // Scan existing users for highest sequence number in this company and year
  let maxSeq = 0;
  const safeUsers = Array.isArray(existingUsers) ? existingUsers : [];
  safeUsers.forEach(u => {
    if (!u) return;
    const rawEmp = String(u.employeeId || "").toUpperCase().trim();
    if (rawEmp.startsWith(patternPrefix)) {
      const seqStr = rawEmp.slice(patternPrefix.length); // get "01", "02", etc.
      const num = parseInt(seqStr, 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  const nextSeq = String(maxSeq + 1).padStart(2, "0"); // "01", "02", etc.
  return `${patternPrefix}${nextSeq}`;
}

// Helper: record a logged-in or newly created account into MySQL (Async version)

export async function cascadeUserNameChange(oldName: string, email: string, newName: string): Promise<void> {
  if (!oldName || !newName || oldName.trim().toLowerCase() === newName.trim().toLowerCase()) return;
  const oNameNorm = oldName.trim().toLowerCase();
  const emailNorm = email.toLowerCase().trim();

  // 1. Tasks
  try {
    const tasks = await fetchModuleDataFromDB<any[]>("tasks", [], "all");
    let changed = false;
    const updated = tasks.map((t) => {
      let tChanged = false;
      let assignedTo = t.assignedTo || "";
      let collaborators = t.collaborators || "";

      if (assignedTo.toLowerCase().trim() === oNameNorm || assignedTo.toLowerCase().trim() === emailNorm) {
        assignedTo = newName;
        tChanged = true;
      }
      if (collaborators && (collaborators.toLowerCase().includes(oNameNorm) || collaborators.toLowerCase().includes(emailNorm))) {
        collaborators = collaborators.replace(new RegExp(oldName, "gi"), newName);
        tChanged = true;
      }
      if (tChanged) {
        changed = true;
        return { ...t, assignedTo, collaborators };
      }
      return t;
    });
    if (changed) {
      await saveModuleDataToDB("tasks", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade tasks update warning:", err);
  }

  // 2. Leads
  try {
    const leads = await fetchModuleDataFromDB<any[]>("leads", [], "all");
    let changed = false;
    const updated = leads.map((l) => {
      let lChanged = false;
      let assignedTo = l.assignedTo || "";
      let caller = l.caller || "";
      let owner = l.owner || "";

      if (assignedTo.toLowerCase().trim() === oNameNorm || assignedTo.toLowerCase().trim() === emailNorm) {
        assignedTo = newName;
        lChanged = true;
      }
      if (caller.toLowerCase().trim() === oNameNorm || caller.toLowerCase().trim() === emailNorm) {
        caller = newName;
        lChanged = true;
      }
      if (owner.toLowerCase().trim() === oNameNorm || owner.toLowerCase().trim() === emailNorm) {
        owner = newName;
        lChanged = true;
      }
      if (lChanged) {
        changed = true;
        return { ...l, assignedTo, caller, owner };
      }
      return l;
    });
    if (changed) {
      await saveModuleDataToDB("leads", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade leads update warning:", err);
  }

  // 3. Clients
  try {
    const clients = await fetchModuleDataFromDB<any[]>("clients", [], "all");
    let changed = false;
    const updated = clients.map((c) => {
      let cChanged = false;
      let owner = c.owner || "";
      let primaryContact = c.primaryContact || "";

      if (owner.toLowerCase().trim() === oNameNorm || owner.toLowerCase().trim() === emailNorm) {
        owner = newName;
        cChanged = true;
      }
      if (primaryContact.toLowerCase().trim() === oNameNorm || primaryContact.toLowerCase().trim() === emailNorm) {
        primaryContact = newName;
        cChanged = true;
      }
      if (cChanged) {
        changed = true;
        return { ...c, owner, primaryContact };
      }
      return c;
    });
    if (changed) {
      await saveModuleDataToDB("clients", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade clients update warning:", err);
  }
}

// Helper: dynamically look up a user's real uploaded cloud avatar from the users database or active auth store
export function getUserAvatar(
  userIdentifier?: string | null,
  allUsers?: UserItem[],
  fallbackSeed?: string
): string {
  if (!userIdentifier || !userIdentifier.trim()) {
    return fallbackSeed ? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fallbackSeed)}` : "";
  }
  const norm = userIdentifier.toLowerCase().trim();

  // 1. Check current logged-in user in Auth Store
  try {
    const curUser = useAuthStore.getState().user;
    if (curUser) {
      const cEmail = (curUser.email || "").toLowerCase().trim();
      const cName = (curUser.name || "").toLowerCase().trim();
      const cId = String(curUser.id || "").toLowerCase().trim();
      if (norm === cEmail || norm === cName || norm === cId) {
        const curAv = (curUser as any).avatarUrl || curUser.avatar;
        if (curAv && curAv.trim() && !curAv.includes("dicebear")) {
          return curAv;
        }
      }
    }
  } catch {}

  // 2. Check candidate list (allUsers, or cached _usersCacheData, or DEFAULT_SYSTEM_ACCOUNTS)
  const candidateUsers: UserItem[] = (Array.isArray(allUsers) && allUsers.length > 0)
    ? allUsers
    : (_usersCacheData && _usersCacheData.length > 0)
      ? _usersCacheData
      : DEFAULT_SYSTEM_ACCOUNTS;

  if (candidateUsers.length > 0) {
    const matched = candidateUsers.find((u) => {
      const uEmail = (u.email || "").toLowerCase().trim();
      const uName = (u.name || "").toLowerCase().trim();
      const uId = String(u.id || "").toLowerCase().trim();
      return uEmail === norm || uName === norm || uId === norm;
    });

    if (matched) {
      const realAvatar = matched.avatarUrl || (matched as any).avatar;
      if (realAvatar && realAvatar.trim() && !realAvatar.includes("dicebear")) {
        return realAvatar;
      }
    }
  }

  // 3. Fallback check across DEFAULT_SYSTEM_ACCOUNTS if candidateUsers didn't include it
  const defMatched = DEFAULT_SYSTEM_ACCOUNTS.find((u) => {
    return (u.email || "").toLowerCase().trim() === norm || (u.name || "").toLowerCase().trim() === norm;
  });
  if (defMatched) {
    const defAv = defMatched.avatarUrl || (defMatched as any).avatar;
    if (defAv && defAv.trim() && !defAv.includes("dicebear")) {
      return defAv;
    }
  }

  // 4. If userIdentifier is already a real valid image URL
  if (userIdentifier.startsWith("http://") || userIdentifier.startsWith("https://") || userIdentifier.startsWith("data:")) {
    if (!userIdentifier.includes("dicebear")) {
      return userIdentifier;
    }
  }

  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(fallbackSeed || userIdentifier)}`;
}

// Cascade user avatar change across assigned Tasks, Leads, and Projects
export async function cascadeUserAvatarChange(name: string, email: string, newAvatarUrl: string): Promise<void> {
  if (!newAvatarUrl) return;
  const oNameNorm = (name || "").trim().toLowerCase();
  const emailNorm = (email || "").trim().toLowerCase();

  // 1. Tasks
  try {
    const tasks = await fetchModuleDataFromDB<any[]>("tasks", [], "all");
    let changed = false;
    const updated = tasks.map((t) => {
      const assignedTo = (t.assignedTo || "").toLowerCase().trim();
      const assignedToEmail = (t.assignedToEmail || "").toLowerCase().trim();
      if (assignedTo === oNameNorm || assignedTo === emailNorm || assignedToEmail === emailNorm) {
        changed = true;
        return { ...t, assignedToAvatar: newAvatarUrl };
      }
      return t;
    });
    if (changed) {
      await saveModuleDataToDB("tasks", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade avatar tasks warning:", err);
  }

  // 2. Leads
  try {
    const leads = await fetchModuleDataFromDB<any[]>("leads", [], "all");
    let changed = false;
    const updated = leads.map((l) => {
      const assignedTo = (l.assignedTo || "").toLowerCase().trim();
      const caller = (l.caller || "").toLowerCase().trim();
      const owner = (l.owner || "").toLowerCase().trim();
      if (assignedTo === oNameNorm || assignedTo === emailNorm || caller === oNameNorm || owner === oNameNorm) {
        changed = true;
        return { ...l, ownerAvatar: newAvatarUrl, assignedToAvatar: newAvatarUrl };
      }
      return l;
    });
    if (changed) {
      await saveModuleDataToDB("leads", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade avatar leads warning:", err);
  }

  // 3. Projects
  try {
    const projects = await fetchModuleDataFromDB<any[]>("projects", [], "all");
    let changed = false;
    const updated = projects.map((p) => {
      if (Array.isArray(p.members)) {
        let memberChanged = false;
        const updatedMembers = p.members.map((m: any) => {
          const mName = typeof m === "string" ? m : m.name;
          const mEmail = typeof m === "string" ? "" : (m.email || "");
          if ((mName && mName.toLowerCase().trim() === oNameNorm) || (mEmail && mEmail.toLowerCase().trim() === emailNorm)) {
            memberChanged = true;
            return typeof m === "string" ? { name: m, avatar: newAvatarUrl } : { ...m, avatar: newAvatarUrl, avatarUrl: newAvatarUrl };
          }
          return m;
        });
        if (memberChanged) {
          changed = true;
          return { ...p, members: updatedMembers };
        }
      }
      return p;
    });
    if (changed) {
      await saveModuleDataToDB("projects", updated, "all");
    }
  } catch (err) {
    console.warn("Cascade avatar projects warning:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_data_synced"));
  }
}

// Delete user permanently
