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

import {
  USERS_CACHE_TTL_MS,
  getUsersCacheState,
  setUsersCacheState,
  invalidateUsersCache,
  isRootSuperAdminEmail,
  DEFAULT_SYSTEM_ACCOUNTS,
  getDeletedUserEmailsAsync,
  isUserDeleted,
} from "./userCacheAndCascade.service"

export async function getStoredUserAccountsAsync(): Promise<UserItem[]> {
  return getUsers("all");
}

/** @deprecated Use getStoredUserAccountsAsync() */
export function getStoredUserAccounts(): UserItem[] {
  console.warn("[userService] getStoredUserAccounts() is deprecated — use getStoredUserAccountsAsync() (async).");
  return DEFAULT_SYSTEM_ACCOUNTS;
}

// Helper: save user accounts to MySQL only (master 'all' company scope + sync company scopes)
export async function saveUserAccounts(accounts: UserItem[]): Promise<void> {
  await Promise.all([
    saveModuleDataToDB("users", accounts, "all"),
    saveModuleDataToDB("users", accounts, "tech"),
    saveModuleDataToDB("users", accounts, "consultancy"),
    saveModuleDataToDB("users", accounts, "digital")
  ]);
  // Bust users cache so next read always fetches fresh data after a write
  invalidateUsersCache();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_data_synced"));
  }
}

// Helper: check if an email is already registered
export async function isEmailRegistered(email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  if (isUserDeleted(normEmail)) return false;
  const accounts = await getStoredUserAccountsAsync();
  return accounts.some((acc) => acc.email.toLowerCase().trim() === normEmail);
}



export async function getUsers(companyId?: string): Promise<UserItem[]> {
  const mapRoleName = (r?: string, rId?: number): UserRole => {
    if (rId === 1) return "Super Admin";
    if (rId === 2) return "Admin";
    if (rId === 3) return "Teams";
    if (rId === 4) return "Clients";
    if (!r) return "Teams";
    const lower = r.toLowerCase();
    if (lower.includes("super")) return "Super Admin";
    if (lower.includes("admin")) return "Admin";
    if (lower.includes("client")) return "Clients";
    return "Teams";
  };

  // 1. Fetch master user records from MySQL app_data DB ('users', 'all')
  const dbUsersBase = await fetchModuleDataFromDB<UserItem[]>("users", [], "all").catch(() => []);
  
  const isSuperAdminEmail = (email: string) => {
    const e = email.toLowerCase().trim();
    return e === "saampark.official@gmail.com";
  };

  const deletedEmails = (await getDeletedUserEmailsAsync()).map((e) => e.toLowerCase().trim());

  const userMap = new Map<string, UserItem>();
  
  // Collect existing IDs and emails in dbUsersBase to prevent default accounts from overwriting user changes
  const existingDbIds = (Array.isArray(dbUsersBase) ? dbUsersBase : []).map(u => String(u.id || '').toLowerCase().trim());
  const existingDbEmails = (Array.isArray(dbUsersBase) ? dbUsersBase : []).map(u => (u.email || '').toLowerCase().trim());
  const existingDbPrevEmails = (Array.isArray(dbUsersBase) ? dbUsersBase : []).flatMap(u => Array.isArray(u.previousEmails) ? u.previousEmails.map(pe => (pe || '').toLowerCase().trim()) : []);

  // 1. Seed base default accounts ONLY IF they haven't been modified/registered in the database or deleted
  for (const sysAcc of DEFAULT_SYSTEM_ACCOUNTS) {
    const sysId = String(sysAcc.id || '').toLowerCase().trim();
    const sysEmail = sysAcc.email.toLowerCase().trim();
    if (!existingDbIds.includes(sysId) && !existingDbEmails.includes(sysEmail) && !existingDbPrevEmails.includes(sysEmail)) {
      if (!deletedEmails.includes(sysEmail) && !isGlobalItemDeleted(sysId, undefined, "users") && !isGlobalItemDeleted(sysEmail, undefined, "users")) {
        userMap.set(sysEmail, sysAcc);
      }
    }
  }

  // 2. Merge master database accounts
  const mergeUserIntoMap = (u: UserItem) => {
    if (!u || !u.email) return;
    const eNorm = u.email.toLowerCase().trim();
    // 🛡️ PRIMARY ROOT SUPER ADMIN IMMUTABILITY:
    // saampark.official@gmail.com must ALWAYS be Super Admin, no one can demote it
    if (isRootSuperAdminEmail(eNorm)) {
      u.role = "Super Admin";
    }

    // Clean previousEmails on u so the active email is NEVER in its own history
    let currentPrev = Array.isArray(u.previousEmails)
      ? u.previousEmails.map((pe) => (pe || "").toLowerCase().trim())
      : (u.previousEmail ? [(u.previousEmail || "").toLowerCase().trim()] : []);

    currentPrev = currentPrev.filter((pe) => pe && pe !== eNorm);
    u.previousEmails = currentPrev.length > 0 ? currentPrev : undefined;
    u.previousEmail = currentPrev.length > 0 ? currentPrev[currentPrev.length - 1] : undefined;

    // Remove obsolete previous emails from userMap
    currentPrev.forEach((pe) => {
      userMap.delete(pe);
    });

    // If this user was transferred from an old email (like hiisupriya@gmail.com -> new email)
    // find if userMap has an entry with matching ID or matching previous email and remove it
    for (const [key, existing] of Array.from(userMap.entries())) {
      const existingId = String(existing.id || "").toLowerCase().trim();
      const targetId = String(u.id || "").toLowerCase().trim();
      const existingEmail = (existing.email || "").toLowerCase().trim();
      if (
        (targetId && existingId === targetId) ||
        (existingEmail && currentPrev.includes(existingEmail))
      ) {
        userMap.delete(key);
      }
    }

    userMap.set(eNorm, u);
  };

  for (const u of (Array.isArray(dbUsersBase) ? dbUsersBase : [])) {
    mergeUserIntoMap(u);
  }

  let dbUsers = Array.from(userMap.values());

  // Ensure currently logged-in user exists in dbUsers with their active current email
  try {
    const { useAuthStore } = require("@/store/useAuthStore");
    const currentUser = useAuthStore.getState().user;
    if (currentUser && currentUser.email) {
      const curEmail = currentUser.email.toLowerCase().trim();
      if (!deletedEmails.includes(curEmail)) {
        const idx = dbUsers.findIndex((u) => u.email.toLowerCase().trim() === curEmail);
        if (idx < 0) {
          dbUsers.unshift({
            id: String(currentUser.id || `usr_${Date.now()}`),
            name: currentUser.name || "User Account",
            email: curEmail,
            role: currentUser.role || "Super Admin",
            companyId: currentUser.companyId || "tech",
            companyIds: currentUser.companyIds || (currentUser.companyId ? [currentUser.companyId] : ["tech"]),
            companyName: "SAAMPARK Group",
            status: "Active",
            department: currentUser.department || "Executive",
            phone: currentUser.phone || "",
            password: "123456",
            lastLogin: "Active Session",
            joinedDate: new Date().toISOString().split("T")[0],
          });
        }
      }
    }
  } catch {}

  // 2. Merge with live backend /users database table if available
  // Use cache if data is fresh and same scope requested — avoids repeated API hits
  const cacheKey = companyId || "all";
  const now = Date.now();
  const cacheValid = getUsersCacheState().data !== null && (now - getUsersCacheState().time) < USERS_CACHE_TTL_MS && getUsersCacheState().key === cacheKey;

  if (cacheValid) {
    return getUsersCacheState().data!;
  }

  try {
    const res = await api.get("/users?company_id=all&branch_id=all&sub_branch_id=all");
    const rawData = Array.isArray(res) ? res : res?.data?.users || res?.data || [];
    if (Array.isArray(rawData) && rawData.length > 0) {
      rawData.forEach((u: any) => {
        const emailNorm = (u.email || "").toLowerCase().trim();
        const rawIdStr = String(u.id || "").toLowerCase().trim();
        if (emailNorm) {
          const existingIdx = dbUsers.findIndex((du) => 
            (rawIdStr && String(du.id).toLowerCase().trim() === rawIdStr) ||
            du.email.toLowerCase().trim() === emailNorm ||
            (Array.isArray(du.previousEmails) && du.previousEmails.map(e => e.toLowerCase().trim()).includes(emailNorm))
          );
          const existingItem = existingIdx >= 0 ? dbUsers[existingIdx] : null;
          const mappedRole = mapRoleName(u.role_name || u.role, u.role_id);
          const finalRole = mappedRole || existingItem?.role || "Teams";

          let permObj: any = null;
          if (typeof u.permissions === "string") {
            try { permObj = JSON.parse(u.permissions); } catch {}
          } else if (u.permissions && typeof u.permissions === "object") {
            permObj = u.permissions;
          }

          if (permObj) {
            const userIdStr = String(u.id);
            if (Array.isArray(permObj.allowedModules)) {
              usePermissionStore.getState().setUserPermissions(userIdStr, permObj.allowedModules);
              usePermissionStore.getState().setUserPermissions(emailNorm, permObj.allowedModules);
            }
            if (permObj.actionMatrix && typeof permObj.actionMatrix === "object") {
              usePermissionStore.getState().setUserAllModuleActions(userIdStr, permObj.actionMatrix);
              usePermissionStore.getState().setUserAllModuleActions(emailNorm, permObj.actionMatrix);
            }
          }

          let parsedCompanyIds: string[] = [];
          if (existingItem?.companyIds && existingItem.companyIds.length > 0) {
            parsedCompanyIds = existingItem.companyIds;
          } else if (u.company_ids) {
            try { parsedCompanyIds = JSON.parse(u.company_ids); } catch { parsedCompanyIds = [u.company_ids]; }
          }
          if (!Array.isArray(parsedCompanyIds) || parsedCompanyIds.length === 0) {
            parsedCompanyIds = [u.company_id || "tech"];
          }

          // If this account was already updated with a new primary email, keep the new primary email!
          const preservedEmail = existingItem?.email || emailNorm;
          const isRootSuper = isRootSuperAdminEmail(preservedEmail);
          const effectiveRole: UserRole = isRootSuper ? "Super Admin" : (mappedRole || existingItem?.role || finalRole);

          const liveName = u.full_name || u.name || u.first_name || (u.email ? undefined : undefined);
          const livePhone = (u.phone !== undefined && u.phone !== null && u.phone !== "") ? u.phone : undefined;
          const liveDept = (u.department && u.department !== "General") ? u.department : undefined;

          const item: UserItem = {
            id: String(u.id || existingItem?.id || `usr_${Math.random()}`),
            name: liveName || existingItem?.name || u.email || "User Account",
            email: preservedEmail,
            username: u.username || existingItem?.username || undefined,
            role: effectiveRole,
            companyId: u.company_id || parsedCompanyIds[0] || "tech",
            companyIds: parsedCompanyIds,
            companyName:
              u.company_name ||
              (parsedCompanyIds.includes("digital") && parsedCompanyIds.includes("tech")
                ? "SAAMPARK Group (Multiple)"
                : u.company_id === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology"),
            branchId: u.branch_id || u.branchId || existingItem?.branchId || undefined,
            branchIds: u.branch_ids ? (() => { try { return JSON.parse(u.branch_ids) } catch { return [u.branch_ids] } })() : existingItem?.branchIds,
            branchName: u.branch_name || u.branchName || existingItem?.branchName || undefined,
            avatarUrl: u.avatar || u.avatarUrl || u.avatar_url || existingItem?.avatarUrl || undefined,
            status: u.status === "inactive" || u.is_active === false ? "Inactive" : "Active",
            department: u.department || existingItem?.department || "General",
            phone: livePhone || existingItem?.phone || "",
            password: existingItem?.password || (u as any)?.password || undefined,
            lastLogin: u.last_login || existingItem?.lastLogin || "Active session",
            joinedDate: u.created_at ? u.created_at.split("T")[0] : existingItem?.joinedDate || new Date().toISOString().split("T")[0],
            allowedModules: permObj?.allowedModules || existingItem?.allowedModules,
            kycStatus: u.kyc_status || u.kycStatus || existingItem?.kycStatus || "Pending",
            kycData: u.kyc_data ? (() => { try { return typeof u.kyc_data === 'string' ? JSON.parse(u.kyc_data) : u.kyc_data } catch { return undefined } })() : existingItem?.kycData,
            previousEmails: existingItem?.previousEmails,
            previousEmail: existingItem?.previousEmail,
          };

          if (existingIdx >= 0 && existingItem) {
            dbUsers[existingIdx] = {
              ...existingItem,
              ...item,
              email: preservedEmail,
              id: String(existingItem.id || u.id),
              name: liveName || existingItem.name || item.name,
              username: u.username || item.username || existingItem.username || undefined,
              avatarUrl: u.avatar || u.avatarUrl || u.avatar_url || existingItem.avatarUrl || item.avatarUrl,
              companyIds: (item.companyIds && item.companyIds.length > 0) ? item.companyIds : ((existingItem.companyIds && existingItem.companyIds.length > 0) ? existingItem.companyIds : parsedCompanyIds),
              companyId: item.companyId || existingItem.companyId || parsedCompanyIds[0] || "tech",
              companyName: item.companyName || existingItem.companyName,
              branchId: (u.branch_id || u.branchId !== undefined) ? (u.branch_id || u.branchId) : (existingItem.branchId !== undefined ? existingItem.branchId : item.branchId),
              branchIds: (u.branch_ids ? (() => { try { return JSON.parse(u.branch_ids) } catch { return [u.branch_ids] } })() : (item.branchIds !== undefined ? item.branchIds : existingItem.branchIds)),
              branchName: (u.branch_name || u.branchName) || existingItem.branchName || item.branchName,
              department: liveDept || u.department || existingItem.department || item.department,
              role: isRootSuper ? "Super Admin" : (mappedRole || item.role || existingItem.role || finalRole),
              status: (u.status ? (u.status === "inactive" || u.is_active === false ? "Inactive" : "Active") : (existingItem.status || item.status)),
              phone: livePhone || existingItem.phone || item.phone,
              password: existingItem.password || item.password || undefined,
              permissions: permObj || item.permissions || existingItem.permissions,
              allowedModules: permObj?.allowedModules || item.allowedModules || existingItem.allowedModules,
              kycStatus: u.kyc_status || u.kycStatus || existingItem.kycStatus || item.kycStatus,
              kycData: item.kycData || existingItem.kycData,
              previousEmails: existingItem.previousEmails,
              previousEmail: existingItem.previousEmail,
            };
          } else {
            dbUsers.push(item);
          }
        }
      });
    }
  } catch (err) {
    console.warn("Live API /users read warning:", err);
  }

  // Keep usePermissionStore synchronized with all dbUsers permissions
  dbUsers.forEach((u) => {
    const userIdStr = String(u.id);
    const emailNorm = (u.email || "").toLowerCase().trim();
    let permObj: any = u.permissions;
    if (typeof permObj === "string") {
      try { permObj = JSON.parse(permObj); } catch {}
    }
    const allowed = u.allowedModules || (permObj && Array.isArray(permObj.allowedModules) ? permObj.allowedModules : undefined);
    const actions = (permObj && permObj.actionMatrix) || undefined;

    if (allowed && Array.isArray(allowed)) {
      usePermissionStore.getState().setUserPermissions(userIdStr, allowed);
      if (emailNorm) usePermissionStore.getState().setUserPermissions(emailNorm, allowed);
    }
    if (actions && typeof actions === "object") {
      usePermissionStore.getState().setUserAllModuleActions(userIdStr, actions);
      if (emailNorm) usePermissionStore.getState().setUserAllModuleActions(emailNorm, actions);
    }
  });

  // 3. Collect all obsolete transferred emails across all active users
  const obsoleteEmailsSet = new Set<string>();
  dbUsers.forEach((u) => {
    const currentEmail = (u.email || "").toLowerCase().trim();
    if (Array.isArray(u.previousEmails)) {
      u.previousEmails.forEach((pe) => {
        if (pe) {
          const peNorm = pe.toLowerCase().trim();
          if (peNorm !== currentEmail) {
            obsoleteEmailsSet.add(peNorm);
          }
        }
      });
    }
    if (u.previousEmail) {
      const peNorm = u.previousEmail.toLowerCase().trim();
      if (peNorm !== currentEmail) {
        obsoleteEmailsSet.add(peNorm);
      }
    }
  });

  // Filter out hidden master admin account and any obsolete transferred emails or deleted users
  const activeValidUsers = dbUsers.filter((u) => {
    const emailNorm = (u.email || "").toLowerCase().trim();
    const uId = String(u.id || "").toLowerCase().trim();
    if (!emailNorm) return false;
    if (obsoleteEmailsSet.has(emailNorm)) return false;
    if (deletedEmails.includes(emailNorm)) return false;
    if (isGlobalItemDeleted(uId, undefined, "users") || isGlobalItemDeleted(emailNorm, undefined, "users")) return false;
    return true;
  });

  // Strictly enforce 1:1 email uniqueness
  const uniqueUsersMap = new Map<string, UserItem>();
  activeValidUsers.forEach((u) => {
    const emailNorm = (u.email || "").toLowerCase().trim();
    if (!uniqueUsersMap.has(emailNorm)) {
      uniqueUsersMap.set(emailNorm, u);
    } else {
      const existing = uniqueUsersMap.get(emailNorm)!;
      uniqueUsersMap.set(emailNorm, {
        ...existing,
        ...u,
        role: u.role || existing.role,
        companyIds: (u.companyIds && u.companyIds.length > 0) ? u.companyIds : existing.companyIds,
      });
    }
  });

  const cleanUsers = Array.from(uniqueUsersMap.values());
  // Do NOT silently overwrite app_data on a GET read operation to prevent losing accounts

  const targetComp = companyId ? String(companyId).toLowerCase().trim() : "all";
  const result = (targetComp === "all")
    ? cleanUsers
    : cleanUsers.filter((u) => {
        const uCompIds = (u.companyIds && u.companyIds.length > 0)
          ? u.companyIds.map(id => String(id).toLowerCase().trim())
          : [String(u.companyId || "tech").toLowerCase().trim()];
        if (u.companyName) {
          uCompIds.push(String(u.companyName).toLowerCase().trim());
        }

        return uCompIds.includes(targetComp) || 
               uCompIds.some(id => isMatchingCompany({ id, slug: id } as any, targetComp)) ||
               isMatchingCompany({ id: u.companyId, slug: u.companyId } as any, targetComp);
      });

  // Store filtered result in cache for this exact cacheKey
  setUsersCacheState(result, Date.now(), cacheKey);

  return result;
}

