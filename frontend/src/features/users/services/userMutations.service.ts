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
  isRootSuperAdminEmail,
  getUserAvatar,
  cascadeUserAvatarChange,
} from "./userCacheAndCascade.service"
import { getUsers } from "./userQuery.service"
import { recordUserAccountAsync } from "./userAccountRecord.service"

export async function checkUsernameAvailabilityAsync(
  username: string,
  currentUserIdOrEmail?: string
): Promise<{ available: boolean; message: string }> {
  const raw = (username || "").toLowerCase().replace(/^@/, "").trim();
  if (!raw) {
    return { available: false, message: "Username cannot be empty." };
  }
  if (raw.length < 3 || raw.length > 30) {
    return { available: false, message: "Username must be between 3 and 30 characters." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
    return { available: false, message: "Only letters, numbers, and underscores are allowed." };
  }

  const reserved = ["admin", "superadmin", "root", "support", "help", "api", "saampark", "login", "null", "undefined"];
  if (reserved.includes(raw)) {
    return { available: false, message: "This username is reserved." };
  }

  try {
    const res: any = await api.get(
      `/auth/check-username/${encodeURIComponent(raw)}?excludeEmail=${encodeURIComponent(currentUserIdOrEmail || "")}&excludeId=${encodeURIComponent(currentUserIdOrEmail || "")}`
    );
    if (res && typeof res.available === "boolean") {
      return res;
    }
  } catch {}

  // Fallback checking against allUsers in local store
  const allUsers = await getUsers("all");
  const currentNorm = (currentUserIdOrEmail || "").toLowerCase().trim();
  const match = allUsers.find(
    (u) =>
      u.username &&
      u.username.toLowerCase().replace(/^@/, "").trim() === raw &&
      u.email.toLowerCase().trim() !== currentNorm &&
      String(u.id).toLowerCase().trim() !== currentNorm
  );

  if (match) {
    return { available: false, message: "Username is already taken." };
  }

  return { available: true, message: "Username is available!" };
}

export async function updateUserUsernameAsync(
  idOrEmail: string,
  newUsername: string
): Promise<{ success: boolean; message: string; user?: UserItem }> {
  const normUser = String(idOrEmail).toLowerCase().trim();
  const cleanUsername = (newUsername || "").toLowerCase().replace(/^@/, "").trim();

  const availability = await checkUsernameAvailabilityAsync(cleanUsername, normUser);
  if (!availability.available && availability.message !== "This is your current username.") {
    return { success: false, message: availability.message };
  }

  try {
    await api.put(`/users/${encodeURIComponent(normUser)}`, {
      username: cleanUsername,
    }).catch(() => {});
  } catch {}

  const updated = await updateUser(normUser, { username: cleanUsername });
  if (updated) {
    const { useAuthStore } = require("@/store/useAuthStore");
    const curUser = useAuthStore.getState().user;
    if (curUser && (String(curUser.id) === normUser || curUser.email?.toLowerCase().trim() === normUser)) {
      useAuthStore.setState({
        user: {
          ...curUser,
          username: cleanUsername,
        },
      });
    }
    return { success: true, message: "Username updated successfully!", user: updated };
  }

  return { success: false, message: "Failed to update username." };
}

export async function updateUser(idOrEmail: string, updates: Partial<UserItem>, companyId?: string): Promise<UserItem | null> {
  const norm = String(idOrEmail).toLowerCase().trim();
  if (!norm) return null;

  const allUsers = await getUsers("all");
  const idx = allUsers.findIndex((u) => {
    const uEmail = (u.email || "").toLowerCase().trim();
    const uId = String(u.id || "").toLowerCase().trim();
    return uEmail === norm || uId === norm;
  });

  if (idx === -1) {
    return recordUserAccountAsync({ ...updates, id: idOrEmail }, false);
  }

  const existing = allUsers[idx];
  const newAvatar = updates.avatarUrl !== undefined ? updates.avatarUrl : (updates as any).avatar;
  const updated: UserItem = {
    ...existing,
    ...updates,
    id: existing.id,
    email: updates.email || existing.email,
    password: (updates.password && updates.password.trim()) ? updates.password.trim() : existing.password,
    username: updates.username !== undefined ? updates.username : existing.username,
    branchId: updates.branchId !== undefined ? (updates.branchId || undefined) : existing.branchId,
    branchName: updates.branchName !== undefined ? (updates.branchName || undefined) : existing.branchName,
    branchIds: updates.branchIds !== undefined ? updates.branchIds : (updates.branchId ? [updates.branchId] : existing.branchIds),
    avatarUrl: newAvatar !== undefined ? newAvatar : existing.avatarUrl,
    avatar: newAvatar !== undefined ? newAvatar : (existing as any).avatar,
  };

  if (newAvatar && newAvatar !== existing.avatarUrl && newAvatar !== (existing as any).avatar) {
    cascadeUserAvatarChange(updated.name, updated.email, newAvatar).catch(() => {});
  }

  if (isRootSuperAdminEmail(existing.email) || isRootSuperAdminEmail(updated.email)) {
    updated.role = "Super Admin";
  }

  // Sync to live backend /users endpoint
  try {
    await api.put(`/users/${encodeURIComponent(existing.id || norm)}`, {
      avatar_url: newAvatar || undefined,
      avatar: newAvatar || undefined,
      avatarUrl: newAvatar || undefined,
      full_name: updated.name,
      phone: updated.phone,
      department: updated.department,
      branch_id: updated.branchId || null,
      branch_name: updated.branchName || null,
      branchName: updated.branchName || null,
      sub_branch_id: updated.subBranchId || null,
      sub_branch_name: updated.subBranchName || null,
      role: updated.role,
      role_id: updated.role === "Super Admin" ? 1 : updated.role === "Admin" ? 2 : updated.role === "Clients" ? 4 : 3,
      status: updated.status,
      permissions: updated.permissions || (updated.allowedModules ? { allowedModules: updated.allowedModules } : undefined),
      company_id: updated.companyId,
      company_ids: updated.companyIds,
      kyc_status: updated.kycStatus || undefined,
      kycStatus: updated.kycStatus || undefined,
      kyc_data: updated.kycData || undefined,
      kycData: updated.kycData || undefined,
    }).catch(() => {});
  } catch {}

  // Live update active session if current logged-in user is updated
  try {
    const curUser = useAuthStore.getState().user;
    if (curUser && (String(curUser.id) === String(existing.id) || curUser.email?.toLowerCase().trim() === norm)) {
      useAuthStore.setState({
        user: {
          ...curUser,
          ...updated,
          avatarUrl: newAvatar || updated.avatarUrl || curUser.avatarUrl,
          avatar: newAvatar || updated.avatar || curUser.avatar,
          name: updated.name || curUser.name,
        }
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("crm_avatar_changed", { detail: { avatar: newAvatar } }));
      }
    }
  } catch {}

  allUsers[idx] = updated;

  await saveModuleDataToDB("users", allUsers, "all");
  if (companyId && companyId !== "all") {
    await saveModuleDataToDB("users", allUsers, companyId);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_users_updated"));
    window.dispatchEvent(new Event("saampark_team_members_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  return updated;
}

export async function createTeamMember(memberData: Partial<UserItem>, companyId?: string): Promise<UserItem> {
  const comp = companyId || memberData.companyId || "tech";
  const newId = `usr_tm_${Date.now()}`;
  const name = memberData.name || "Team Member";
  const email = (memberData.email || `team_${Date.now()}@saampark.com`).toLowerCase().trim();
  const rawAv = memberData.avatarUrl || (memberData as any).avatar;

  const newMember: UserItem = {
    id: newId,
    name,
    email,
    phone: memberData.phone || "+91 98765 43210",
    role: (memberData.role || "Teams") as any,
    department: memberData.department || "Operations & Delivery",
    companyId: comp,
    companyIds: [comp],
    companyName: comp === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology",
    branchId: memberData.branchId,
    branchName: memberData.branchName,
    status: memberData.status || "Active",
    avatarUrl: rawAv || getUserAvatar(name, undefined, name),
    avatar: rawAv || undefined,
    joinedDate: new Date().toISOString().split("T")[0],
    lastLogin: "Never",
  };

  // Sync to live backend /users endpoint which sends welcome credentials email
  if (email && !email.includes("@saampark.com")) {
    api.post("/users", {
      full_name: name,
      email,
      password: "Password123",
      role_id: 3,
      role: "Teams",
      company_id: comp,
      company_ids: [comp],
      branch_id: memberData.branchId || null,
      department: memberData.department || "Operations & Delivery",
      phone: memberData.phone || "",
      avatar_url: rawAv || undefined,
    }).catch((err) => console.warn("Backend user create warning for team member:", err));
  }

  const allUsers = await getUsers("all");
  const nextList = [newMember, ...allUsers];

  await saveModuleDataToDB("users", nextList, "all");
  if (comp !== "all") {
    await saveModuleDataToDB("users", nextList, comp);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saampark_data_synced"));
    window.dispatchEvent(new Event("saampark_users_updated"));
    window.dispatchEvent(new Event("saampark_team_members_updated"));
    window.dispatchEvent(new Event("storage"));
  }

  return newMember;
}

/**
 * Automatically creates or ensures an active User account with role "Clients"
 * when an invoice or project is generated for a client.
 */
export async function ensureClientUserAccount(params: {
  email?: string;
  name?: string;
  phone?: string;
  companyId?: string;
}): Promise<UserItem | null> {
  const cleanEmail = (params.email || "").toLowerCase().trim();
  if (!cleanEmail || cleanEmail.includes("@example.com")) return null;

  try {
    const allUsers = await getUsers("all");
    const found = allUsers.find((u) => (u.email || "").toLowerCase().trim() === cleanEmail);
    if (found) {
      // User already exists; ensure role is "Clients" if not an admin/super admin
      const r = (found.role || "").toLowerCase();
      if (!r.includes("admin") && !r.includes("super") && found.role !== "Clients") {
        await recordUserAccountAsync({ ...found, role: "Clients" });
      }
      return found;
    }

    // Auto-create client user
    const newUser = await recordUserAccountAsync(
      {
        name: params.name?.trim() || "Client",
        email: cleanEmail,
        phone: params.phone?.trim() || "",
        role: "Clients",
        companyId: params.companyId || "tech",
        companyIds: [params.companyId || "tech"],
        status: "Active",
        department: "Client Portal",
        password: "Client@123",
        joinedDate: new Date().toISOString().split("T")[0],
      },
      true
    );

    return newUser;
  } catch (err) {
    console.warn("Could not auto-create client user account:", err);
    return null;
  }
}


export async function uploadUserAvatarMultipart(
  userId: string | number,
  file: File | Blob
): Promise<{ url?: string; user?: UserItem }> {
  const { axiosInstance, toFormData } = await import("@/lib/axios");
  const formData = toFormData({
    avatar: file,
    userId: String(userId),
  });
  const res = await axiosInstance.postForm(`/users/${encodeURIComponent(String(userId))}/avatar`, formData);
  return res.data?.data ?? res.data ?? {};
}

export async function uploadUserKycMultipart(
  userId: string | number,
  kycPayload: Record<string, any> | FormData
): Promise<any> {
  const { axiosInstance, toFormData } = await import("@/lib/axios");
  const formData = toFormData(kycPayload);
  const res = await axiosInstance.postForm(`/users/${encodeURIComponent(String(userId))}/kyc`, formData);
  return res.data?.data ?? res.data ?? {};
}
