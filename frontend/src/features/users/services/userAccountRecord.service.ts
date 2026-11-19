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
  invalidateUsersCache,
  isRootSuperAdminEmail,
  DEFAULT_SYSTEM_ACCOUNTS,
  markUserAsDeleted,
  unmarkUserAsDeleted,
  generateCompanyEmployeeId,
  cascadeUserNameChange,
} from "./userCacheAndCascade.service"
import { saveUserAccounts, getStoredUserAccountsAsync } from "./userQuery.service"

export async function recordUserAccountAsync(user: Partial<UserItem>, isNewRegistration = false): Promise<UserItem | null> {
  const normalizedEmail = (user.email || "").toLowerCase().trim();
  if (!normalizedEmail) return null;

  // Unmark email as deleted when recording/saving an active account
  unmarkUserAsDeleted(normalizedEmail);
  if (user.id) {
    unmarkGlobalItemDeleted(String(user.id).toLowerCase().trim());
  }

  let savedAccount: UserItem | null = null;
  let existing: UserItem | undefined = undefined;

  try {
    const currentAccounts = await fetchModuleDataFromDB<UserItem[]>("users", DEFAULT_SYSTEM_ACCOUNTS, "all");
    existing = currentAccounts.find(
      (acc) =>
        (user.id && String(acc.id) === String(user.id)) ||
        acc.email.toLowerCase().trim() === normalizedEmail
    );

    const prevEmail = (existing?.email || (user as any).previousEmail || "").toLowerCase().trim();
    const prevName = existing?.name;

    const currentPrev = Array.isArray(existing?.previousEmails)
      ? existing.previousEmails.map((pe) => (pe || "").toLowerCase().trim())
      : (existing?.previousEmail ? [(existing.previousEmail || "").toLowerCase().trim()] : []);

    const prevSet = new Set<string>(currentPrev);
    if (prevEmail && prevEmail !== normalizedEmail) {
      prevSet.add(prevEmail);
    }
    if ((user as any)?.previousEmails && Array.isArray((user as any).previousEmails)) {
      (user as any).previousEmails.forEach((pe: string) => {
        if (pe) {
          const peNorm = pe.toLowerCase().trim();
          if (peNorm !== normalizedEmail) prevSet.add(peNorm);
        }
      });
    }
    // Strict requirement: the active primary email MUST NEVER exist in its own previousEmails history!
    prevSet.delete(normalizedEmail);
    const prevEmailsList = Array.from(prevSet).filter(Boolean);

    const effCompId = user.companyId !== undefined ? user.companyId : (existing?.companyId || "tech");
    let resolvedCompName = user.companyName;
    if (!resolvedCompName) {
      if (user.companyId === undefined && existing?.companyName) {
        resolvedCompName = existing.companyName;
      } else {
        if (typeof window !== "undefined") {
          try {
            const { useAuthStore } = require("@/store/useAuthStore");
            const cObj = useAuthStore.getState().companies.find((c: any) => c.id?.toLowerCase() === effCompId.toLowerCase());
            if (cObj) resolvedCompName = cObj.brand_name || cObj.name;
          } catch {}
        }
        if (!resolvedCompName) {
          if (effCompId === "print") resolvedCompName = "Print Space India";
          else if (effCompId === "digital") resolvedCompName = "SAAMPARK Digital Marketing";
          else resolvedCompName = "SAAMPARK Technology";
        }
      }
    }

    const effBranchId = user.branchId !== undefined ? (user.branchId || undefined) : (existing?.branchId || undefined);
    let resolvedBranchName = user.branchName;
    if (!resolvedBranchName && effBranchId) {
      if (typeof window !== "undefined") {
        try {
          const { useAuthStore } = require("@/store/useAuthStore");
          const bObj = useAuthStore.getState().branches.find((b: any) => b.id === effBranchId || b.name.toLowerCase() === effBranchId.toLowerCase());
          if (bObj) resolvedBranchName = bObj.name;
        } catch {}
      }
    }

    // Build the account object safely preserving existing role and properties
    const mergedAccount: UserItem = {
      id: user.id || existing?.id || `usr_${Date.now()}`,
      name: user.name !== undefined ? user.name : (existing?.name || "User Account"),
      email: normalizedEmail,
      username: user.username !== undefined ? (user.username ? user.username.toLowerCase().trim() : undefined) : existing?.username,
      role: isRootSuperAdminEmail(normalizedEmail) ? "Super Admin" : (user.role !== undefined ? user.role : (existing?.role || "Teams")),
      companyId: effCompId,
      companyIds: user.companyIds !== undefined ? user.companyIds : (existing?.companyIds || (effCompId ? [effCompId] : ["tech"])),
      companyName: resolvedCompName,
      branchId: effBranchId,
      branchIds: user.branchIds !== undefined ? (user.branchIds || undefined) : (effBranchId ? [effBranchId] : (existing?.branchIds || undefined)),
      branchName: resolvedBranchName || (effBranchId ? existing?.branchName : undefined),
      avatarUrl: user.avatarUrl !== undefined ? user.avatarUrl : (existing?.avatarUrl || (user as any)?.avatar || existing?.avatar || undefined),
      avatar: (user as any)?.avatar !== undefined ? (user as any)?.avatar : (existing?.avatar || user.avatarUrl || existing?.avatarUrl || undefined),
      status: user.status !== undefined ? user.status : (existing?.status || "Active"),
      department: user.department !== undefined ? user.department : (existing?.department || "General"),
      phone: user.phone !== undefined ? user.phone : (existing?.phone || ""),
      password: (user.password && user.password.trim()) ? user.password.trim() : (existing?.password || "Password123"),
      lastLogin: user.lastLogin !== undefined ? user.lastLogin : (existing?.lastLogin || "Just now"),
      joinedDate: user.joinedDate !== undefined ? user.joinedDate : (existing?.joinedDate || new Date().toISOString().split("T")[0]),
      employeeId: user.employeeId !== undefined && user.employeeId !== "" ? user.employeeId : (existing?.employeeId || generateCompanyEmployeeId(effCompId, currentAccounts)),
      designation: user.designation !== undefined ? user.designation : existing?.designation,
      ctc: user.ctc !== undefined ? user.ctc : (existing as any)?.ctc,
      salary: user.salary !== undefined ? user.salary : (existing as any)?.salary,
      subBranchId: user.subBranchId !== undefined ? user.subBranchId : existing?.subBranchId,
      subBranchName: user.subBranchName !== undefined ? user.subBranchName : existing?.subBranchName,
      // 🛡️ KYC Reset Fix: A newly added or re-registered user must ALWAYS start with Pending KYC, never inherit from deleted account!
      kycStatus: isNewRegistration 
        ? (user.kycStatus || "Pending") 
        : (user.kycStatus !== undefined ? user.kycStatus : (existing?.kycStatus || "Pending")),
      kycData: isNewRegistration 
        ? (user.kycData || undefined) 
        : (user.kycData !== undefined ? user.kycData : existing?.kycData),
      bloodGroup: user.bloodGroup !== undefined ? user.bloodGroup : existing?.bloodGroup,
      emergencyContact: user.emergencyContact !== undefined ? user.emergencyContact : existing?.emergencyContact,
      address: user.address !== undefined ? user.address : existing?.address,
      offerLetterSentAt: user.offerLetterSentAt !== undefined ? user.offerLetterSentAt : existing?.offerLetterSentAt,
      idCardIssuedAt: user.idCardIssuedAt !== undefined ? user.idCardIssuedAt : existing?.idCardIssuedAt,
      previousEmails: prevEmailsList.length > 0 ? prevEmailsList : undefined,
      previousEmail: prevEmailsList.length > 0 ? prevEmailsList[prevEmailsList.length - 1] : undefined,
    };

    savedAccount = mergedAccount;

    // Strict 1:1 Email Uniqueness: Remove all other rows matching this ID or this email or previous email
    const cleaned = currentAccounts.filter((acc) => {
      const accId = String(acc.id || "").toLowerCase().trim();
      const targetId = String(user.id || "").toLowerCase().trim();
      const accEmail = (acc.email || "").toLowerCase().trim();
      if (targetId && accId === targetId) return false;
      if (accEmail === normalizedEmail) return false;
      if (prevEmailsList.includes(accEmail)) return false;
      return true;
    });

    if (prevName && prevName.trim() !== mergedAccount.name.trim()) {
      cascadeUserNameChange(prevName, normalizedEmail, mergedAccount.name).catch(() => {});
    }

    const updatedList = [mergedAccount, ...cleaned];
    await saveUserAccounts(updatedList);

    // ── CRITICAL FIX: also clean old/new email from company-specific scopes ──
    // getUsers() reads from "tech" and "digital" too; ghost records there cause duplicates.
    const scopesToClean = ["tech", "consultancy", "digital"];
    for (const scope of scopesToClean) {
      try {
        const scopeAccounts = await fetchModuleDataFromDB<UserItem[]>("users", [], scope);
        if (!Array.isArray(scopeAccounts) || scopeAccounts.length === 0) continue;
        const targetId = String(user.id || "").toLowerCase().trim();
        const scopeCleaned = scopeAccounts.filter((acc) => {
          const accId = String(acc.id || "").toLowerCase().trim();
          const accEmail = (acc.email || "").toLowerCase().trim();
          if (targetId && accId === targetId) return false;
          if (accEmail === normalizedEmail) return false;
          if (prevEmail && accEmail === prevEmail) return false;
          return true;
        });
        if (scopeCleaned.length !== scopeAccounts.length) {
          await saveModuleDataToDB("users", scopeCleaned, scope);
        }
      } catch {}
    }
  } catch (err) {
    console.warn("recordUserAccountAsync error:", err);
  }

  if (savedAccount) {
    if (isNewRegistration || !existing) {
      recordActivityLog({
        type: "user",
        module: "Users",
        action: "User Account Registered",
        description: `New user account "${savedAccount.name}" (${savedAccount.role}) registered`,
        companyId: savedAccount.companyId,
        branchId: savedAccount.branchId,
        branchName: savedAccount.branchName,
        details: `Email: ${savedAccount.email} | Role: ${savedAccount.role} | Department: ${savedAccount.department || "General"}`
      }).catch(() => {});
    } else if (existing) {
      recordActivityLog({
        type: "user",
        module: "Users",
        action: "User Account Updated",
        description: `User account "${savedAccount.name}" profile details updated`,
        companyId: savedAccount.companyId,
        branchId: savedAccount.branchId,
        branchName: savedAccount.branchName,
        details: `Email: ${savedAccount.email} | Role: ${savedAccount.role}`
      }).catch(() => {});
    }
  }

  invalidateUsersCache();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_data_synced"));
  }
  return savedAccount;
}


// Helper: record user account (sync wrapper)
export function recordUserAccount(user: Partial<UserItem>, isNewRegistration = false): UserItem | null {
  const normalizedEmail = (user.email || "").toLowerCase().trim();
  if (!normalizedEmail) return null;

  unmarkUserAsDeleted(normalizedEmail);
  if (user.id) {
    unmarkGlobalItemDeleted(String(user.id).toLowerCase().trim());
  }

  recordUserAccountAsync(user, isNewRegistration).catch(() => {});

  return {
    id: user.id || `usr_${Date.now()}`,
    name: user.name || "User Account",
    email: normalizedEmail,
    employeeId: user.employeeId || (user.id ? `SP-EMP-${String(user.id).replace(/[^0-9]/g, "").slice(-4).padStart(4, "0") || "0041"}` : `SP-EMP-${String(Date.now()).slice(-4)}`),
    role: user.role !== undefined ? user.role : "Teams",
    companyId: user.companyId || "tech",
    companyIds: user.companyIds || (user.companyId ? [user.companyId] : ["tech"]),
    companyName: user.companyName || "SAAMPARK Technology",
    status: user.status || "Active",
    department: user.department || "General",
    designation: user.designation,
    phone: user.phone || "",
    password: user.password !== undefined ? user.password : "Password123",
    lastLogin: user.lastLogin || "Just now",
    joinedDate: user.joinedDate || new Date().toISOString().split("T")[0],
    kycStatus: user.kycStatus,
    kycData: user.kycData,
    bloodGroup: user.bloodGroup,
    emergencyContact: user.emergencyContact,
    address: user.address,
    permissions: (user as any).permissions,
    allowedModules: (user as any).allowedModules,
  };
}


export async function deleteUser(id: string, email?: string): Promise<boolean> {
  const normEmail = email ? email.toLowerCase().trim() : (id.includes("@") ? id.toLowerCase().trim() : "");

  // 1. Mark as deleted in MySQL deleted_items table & local cache
  await markGlobalItemDeleted(id, "users");
  if (normEmail) {
    await markGlobalItemDeleted(normEmail, "users");
    markUserAsDeleted(normEmail);
  }

  // 2. Call backend REST API delete endpoint
  try {
    await api.delete(`/users/${encodeURIComponent(id)}`);
  } catch (err) {
    console.warn("Backend user delete API call warning:", err);
  }

  // 3. Remove user from app_data master list under 'all' company scope
  const currentAccounts = await getStoredUserAccountsAsync();
  const filtered = currentAccounts.filter((acc) => {
    const accEmail = (acc.email || "").toLowerCase().trim();
    const accId = String(acc.id || "").toLowerCase().trim();
    const targetId = String(id).toLowerCase().trim();
    return accId !== targetId && (!normEmail || accEmail !== normEmail);
  });

  await saveModuleDataToDB("users", filtered, "all");

  // ── CRITICAL FIX: also remove from all company-specific scopes ──
  const scopesToClean = ["tech", "digital", "infotech", "fashion", "consultancy", "jewellers"];
  for (const scope of scopesToClean) {
    try {
      const scopeAccounts = await fetchModuleDataFromDB<any[]>("users", [], scope);
      if (!Array.isArray(scopeAccounts) || scopeAccounts.length === 0) continue;
      const targetId = String(id).toLowerCase().trim();
      const scopeFiltered = scopeAccounts.filter((acc) => {
        const accEmail = (acc.email || "").toLowerCase().trim();
        const accId = String(acc.id || "").toLowerCase().trim();
        return accId !== targetId && (!normEmail || accEmail !== normEmail);
      });
      if (scopeFiltered.length !== scopeAccounts.length) {
        await saveModuleDataToDB("users", scopeFiltered, scope);
      }
    } catch {}
  }

  // Bust users cache so next read immediately sees the deletion
  invalidateUsersCache();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_data_synced"));

    // Instantly log out if current tab belongs to deleted user
    try {
      const { useAuthStore } = require("@/store/useAuthStore");
      const state = useAuthStore.getState();
      if (
        state.user &&
        (String(state.user.id) === String(id) ||
          (state.user.email && state.user.email.toLowerCase().trim() === normEmail))
      ) {
        state.logout();
      }
    } catch (err) {
      console.warn("Session logout trigger error:", err);
    }
  }

  const deletedUser = currentAccounts.find((acc) => {
    const accEmail = (acc.email || "").toLowerCase().trim();
    const accId = String(acc.id || "").toLowerCase().trim();
    const targetId = String(id).toLowerCase().trim();
    return accId === targetId || (normEmail && accEmail === normEmail);
  });

  recordActivityLog({
    type: "user",
    module: "Users",
    action: "User Account Deleted",
    description: `User account "${deletedUser?.name || id}" (${deletedUser?.email || normEmail || 'N/A'}) deleted`,
    companyId: deletedUser?.companyId,
    branchId: deletedUser?.branchId,
    branchName: deletedUser?.branchName,
    details: `Role: ${deletedUser?.role || "Teams"}`
  }).catch(() => {});

  return true;
}


// ── Users Cache Functions ────────────────────────────────────────────────────

