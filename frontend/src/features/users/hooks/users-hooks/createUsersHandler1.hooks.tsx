"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  UserPlus,
  ShieldCheck,
  UserCheck,
  Briefcase,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useAuthStore,
  isMatchingCompany,
  isMatchingBranch,
} from "@/store/useAuthStore";
import { UserItem, UserStatus } from "@/features/users/types";
import { recordUserAccount } from "@/features/users/services/userService";
import {
  useDeleteUserMutation,
  useUsersQuery,
  USERS_QUERY_KEY,
} from "@/features/users/hooks/useUsers";
import { useQueryClient } from "@tanstack/react-query";
import { saveModuleDataToDB } from "@/lib/storageSync";
import { UserList } from "@/features/users/components/UserList";
import { UserModal } from "@/features/users/components/UserModal";
import { UserOverviewModal } from "@/features/users/components/UserOverviewModal";
import { usePermissionStore } from "@/store/usePermissionStore";
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader";

export function createUsersHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      editingUser,
      isClientRole,
      user,
      setStatusModalState,
      queryClient,
      loadUsers,
    } = getCtrl();
    const __fn: any = async (userData: Partial<UserItem>) => {
      const isNew = !editingUser;
      let realId = editingUser?.id ? String(editingUser.id) : "";

      const oldEmail = editingUser?.email?.toLowerCase().trim() || "";
      const newEmail = userData.email?.toLowerCase().trim() || "";
      const isEmailTransfer = Boolean(
        editingUser && oldEmail && newEmail && oldEmail !== newEmail,
      );

      try {
        const { api } = await import("@/lib/api");
        const roleIdMap: Record<string, number> = {
          "Super Admin": 1,
          Admin: 2,
          Teams: 3,
          User: 3,
          Clients: 4,
        };
        let role_id = roleIdMap[userData.role || ""] || 3;
        const isTargetRootSuper =
          (userData.email &&
            (userData.email.toLowerCase().trim() ===
              "saampark.official@gmail.com" ||
              userData.email.toLowerCase().trim() === "saampark.official")) ||
          (editingUser?.email &&
            (editingUser.email.toLowerCase().trim() ===
              "saampark.official@gmail.com" ||
              editingUser.email.toLowerCase().trim() === "saampark.official"));
        if (isTargetRootSuper) {
          role_id = 1;
          userData.role = "Super Admin";
        }

        if (!editingUser && userData.email) {
          const res: any = await api
            .post("/users", {
              full_name: userData.name || "User Account",
              email: userData.email,
              password: userData.password || "Password123",
              role_id,
              role: userData.role,
              company_id:
                userData.companyId ||
                (userData.companyIds && userData.companyIds[0]) ||
                "tech",
              company_ids:
                userData.companyIds ||
                (userData.companyId ? [userData.companyId] : ["tech"]),
              branch_id: userData.branchId || null,
              branch_name: userData.branchName || null,
              department: userData.department || "General",
              phone: userData.phone || "",
              avatar_url:
                userData.avatarUrl || (userData as any).avatar || undefined,
              permissions: (userData as any).permissions,
            })
            .catch((err) => {
              console.warn("Backend user create warning:", err);
              return null;
            });

          if (res?.data?.id || res?.data?.user?.id || res?.id) {
            realId = String(res?.data?.id || res?.data?.user?.id || res?.id);
          }
        } else if (editingUser) {
          await api
            .put(`/users/${editingUser.id}`, {
              full_name: userData.name,
              email: userData.email || editingUser.email,
              old_email: oldEmail,
              oldEmail: oldEmail,
              phone: userData.phone,
              status: userData.status?.toLowerCase(),
              role_id,
              role: userData.role,
              company_id:
                userData.companyId ||
                (userData.companyIds && userData.companyIds[0]),
              company_ids: userData.companyIds,
              branch_id:
                userData.branchId !== undefined ? userData.branchId : null,
              branch_name: userData.branchName || null,
              branchId:
                userData.branchId !== undefined ? userData.branchId : null,
              branchName: userData.branchName || null,
              department: userData.department,
              avatar_url:
                userData.avatarUrl || (userData as any).avatar || undefined,
              permissions: (userData as any).permissions,
            })
            .catch((err) => console.warn("Backend user update warning:", err));
        }
      } catch (e) {
        console.warn("API sync silent fail:", e);
      }

      // Preserve previous emails history for transferred account tracking
      const currentPrev = Array.isArray(editingUser?.previousEmails)
        ? editingUser.previousEmails.map((pe: any) =>
            (pe || "").toLowerCase().trim(),
          )
        : editingUser?.previousEmail
          ? [(editingUser.previousEmail || "").toLowerCase().trim()]
          : [];

      const prevSet = new Set<string>(currentPrev);
      if (isEmailTransfer && oldEmail) {
        prevSet.add(oldEmail);
      }
      // Strict requirement: the active new email MUST NEVER exist in its own previousEmails history!
      prevSet.delete(newEmail);
      const prevEmailsList: string[] = Array.from(prevSet).filter(Boolean);

      if (isEmailTransfer && oldEmail) {
        try {
          const { unmarkGlobalItemDeleted } = await import("@/lib/storageSync");
          unmarkGlobalItemDeleted(oldEmail);
          if (newEmail) unmarkGlobalItemDeleted(newEmail);
        } catch {}
      } else if (newEmail) {
        try {
          const { unmarkGlobalItemDeleted } = await import("@/lib/storageSync");
          unmarkGlobalItemDeleted(newEmail);
        } catch {}
      }

      const { recordUserAccountAsync, saveUserAccounts, invalidateUsersCache } =
        await import("@/features/users/services/userService");
      invalidateUsersCache();
      const saved = await recordUserAccountAsync(
        {
          ...userData,
          email: newEmail,
          id: realId || userData.id || editingUser?.id,
          companyIds:
            userData.companyIds ||
            (userData.companyId ? [userData.companyId] : ["tech"]),
          permissions: (userData as any).permissions,
          previousEmails:
            prevEmailsList.length > 0 ? prevEmailsList : undefined,
          previousEmail:
            prevEmailsList.length > 0
              ? prevEmailsList[prevEmailsList.length - 1]
              : undefined,
          ...(isClientRole && user
            ? {
                clientId: user.id,
                createdById: user.id,
                createdByEmail: user.email,
                clientEmail: user.email,
              }
            : {}),
        },
        isNew,
      );

      if (!saved) {
        setStatusModalState({
          isOpen: true,
          type: "failed",
          title: "Account Save Failed",
          message:
            "Failed to record user account. Please check the provided information and try again.",
        });
        return;
      }

      // If email transferred, dispatch email notifications to both addresses
      let transferNotificationMessage = "";
      let isTransferSuccess = true;

      if (isEmailTransfer) {
        try {
          const { sendUserEmailTransferNotification } =
            await import("@/services/emailNotificationService");
          const notifRes = await sendUserEmailTransferNotification(
            userData.name || editingUser?.name || "User",
            oldEmail,
            newEmail,
            user?.name || "Administrator",
          );
          transferNotificationMessage = notifRes.message;
          isTransferSuccess = notifRes.success;
        } catch (err: any) {
          console.warn("Transfer notification failed:", err);
          transferNotificationMessage = `Account email transferred from ${oldEmail} to ${newEmail}. In-app notification delivered.`;
        }
      }

      // Show Success / Failed Status Popup Modal
      setStatusModalState({
        isOpen: true,
        type: isTransferSuccess ? "success" : "failed",
        title: isEmailTransfer
          ? "Account Email Transferred"
          : isNew
            ? "User Account Created"
            : "User Profile Updated",
        message: isEmailTransfer
          ? transferNotificationMessage
          : isNew
            ? `User "${userData.name}" has been created successfully.`
            : `User account "${userData.name || editingUser?.name}" has been updated successfully.`,
        details: isEmailTransfer ? { oldEmail, newEmail } : undefined,
      });

      // If the currently logged-in user was updated (by ID or previous/new email), update auth store immediately
      const currentUser = useAuthStore.getState().user;
      const isCurrentAccount = Boolean(
        currentUser &&
        ((currentUser.email &&
          currentUser.email.toLowerCase().trim() ===
            saved.email.toLowerCase().trim()) ||
          (oldEmail &&
            currentUser.email &&
            currentUser.email.toLowerCase().trim() === oldEmail) ||
          (currentUser.id && String(currentUser.id) === String(saved.id)) ||
          (editingUser &&
            currentUser.id &&
            String(currentUser.id) === String(editingUser.id))),
      );

      if (isCurrentAccount && currentUser) {
        useAuthStore.setState({
          user: {
            ...currentUser,
            id: saved.id || currentUser.id,
            email: saved.email,
            name: saved.name || currentUser.name,
            role: (saved.role as any) || currentUser.role,
            companyIds: saved.companyIds || currentUser.companyIds,
            companyId:
              (saved.companyIds && saved.companyIds[0]) ||
              saved.companyId ||
              currentUser.companyId,
            phone: saved.phone || currentUser.phone,
            department: saved.department || currentUser.department,
            avatar: saved.avatarUrl || currentUser.avatar,
            avatarUrl: saved.avatarUrl || currentUser.avatarUrl,
            kycStatus: saved.kycStatus || currentUser.kycStatus,
            kycData: saved.kycData || currentUser.kycData,
          },
        });
        if (saved.avatarUrl || (saved as any).avatar) {
          window.dispatchEvent(
            new CustomEvent("crm_avatar_changed", {
              detail: { avatar: saved.avatarUrl || (saved as any).avatar },
            }),
          );
        }
      }

      if (saved.status === "Inactive") {
        const inactiveEmail = saved.email.toLowerCase().trim();
        localStorage.setItem(
          "saampark_session_revoked",
          `${inactiveEmail}_inactive_${Date.now()}`,
        );
        window.dispatchEvent(
          new CustomEvent("saampark_session_revoked", {
            detail: { email: inactiveEmail, reason: "inactive" },
          }),
        );
      }

      queryClient.setQueryData(USERS_QUERY_KEY, (prev: UserItem[] = []) => {
        if (editingUser) {
          const filtered = prev.filter(
            (u: UserItem) =>
              String(u.id) !== String(editingUser.id) &&
              u.email.toLowerCase().trim() !== oldEmail &&
              u.email.toLowerCase().trim() !== newEmail,
          );
          const updatedItem: UserItem = {
            ...editingUser,
            ...saved,
            email: newEmail,
            role: userData.role || saved.role,
            branchId:
              saved.branchId !== undefined
                ? saved.branchId
                : userData.branchId !== undefined
                  ? userData.branchId
                  : editingUser.branchId,
            branchIds:
              saved.branchIds ||
              (saved.branchId
                ? [saved.branchId]
                : userData.branchId
                  ? [userData.branchId]
                  : editingUser.branchIds),
            branchName:
              saved.branchName || userData.branchName || editingUser.branchName,
            permissions: (userData as any).permissions,
            previousEmails:
              prevEmailsList.length > 0 ? prevEmailsList : undefined,
            previousEmail:
              prevEmailsList.length > 0
                ? prevEmailsList[prevEmailsList.length - 1]
                : undefined,
          };
          return [updatedItem, ...filtered];
        } else {
          return [
            saved,
            ...prev.filter(
              (u: UserItem) =>
                u.email.toLowerCase().trim() !==
                saved.email.toLowerCase().trim(),
            ),
          ];
        }
      });

      // Immediately keep usePermissionStore in sync for this user
      if (userData.permissions) {
        const permObj: any = userData.permissions;
        const targetId = String(saved.id || realId || editingUser?.id);
        const targetEmail = (userData.email || editingUser?.email || "")
          .toLowerCase()
          .trim();
        if (Array.isArray(permObj.allowedModules)) {
          usePermissionStore
            .getState()
            .setUserPermissions(targetId, permObj.allowedModules);
          if (targetEmail)
            usePermissionStore
              .getState()
              .setUserPermissions(targetEmail, permObj.allowedModules);
        }
        if (permObj.actionMatrix && typeof permObj.actionMatrix === "object") {
          usePermissionStore
            .getState()
            .setUserAllModuleActions(targetId, permObj.actionMatrix);
          if (targetEmail)
            usePermissionStore
              .getState()
              .setUserAllModuleActions(targetEmail, permObj.actionMatrix);
        }
      }

      // Immediate re-fetch from database to ensure newly created user displays cleanly
      setTimeout(() => {
        loadUsers();
      }, 150);
    };
    return __fn(...__args);
  };
}
