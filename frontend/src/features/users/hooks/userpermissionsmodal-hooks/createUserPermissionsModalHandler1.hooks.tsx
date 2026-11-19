"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Check,
  RotateCcw,
  Save,
  Loader2,
  Search,
  Layers,
  CheckCheck,
  UserCheck,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserItem } from "@/features/users/types";
import { useAuthStore } from "@/store/useAuthStore";
import { PermissionService } from "@/services/permissionService";
import {
  CONFIGURABLE_MODULES,
  CLEAN_MODULE_CATEGORIES,
  ALL_ACTIONS,
  usePermissionStore,
  ModuleActionFlags,
  DEFAULT_ROLE_ACTION_PERMISSIONS,
} from "@/store/usePermissionStore";
import { executeWithFeedback } from "@/store/useActionFeedbackStore";
import { recordActivityLog } from "@/services/activityLogService";
import {
  ACTIONS,
  type UserPermissionsModalProps,
} from "@/features/users/components/userpermissionsmodal-sections/UserPermissionsModalHelpers";

export function createUserPermissionsModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      targetUser,
      setIsSaving,
      matrix,
      setUserAllModuleActions,
      fetchUserPermissions,
      onSaved,
      onClose,
    } = getCtrl();
    const __fn: any = async () => {
      if (!targetUser) return;
      setIsSaving(true);
      try {
        const typed: Record<string, ModuleActionFlags> = {};
        Object.keys(matrix).forEach((m) => {
          typed[m] = {
            view: !!matrix[m]?.view,
            add: !!matrix[m]?.add,
            edit: !!matrix[m]?.edit,
            delete: !!matrix[m]?.delete,
          };
        });

        const allowedModules = CONFIGURABLE_MODULES.filter((m) => {
          const flags = typed[m];
          return (
            flags && (flags.view || flags.add || flags.edit || flags.delete)
          );
        });

        await executeWithFeedback(
          async () => {
            await PermissionService.saveUserMatrix(targetUser.id, typed);
            if (targetUser.email) {
              await PermissionService.saveUserMatrix(targetUser.email, typed);
            }
            setUserAllModuleActions(targetUser.id, typed);
            usePermissionStore
              .getState()
              .setUserPermissions(targetUser.id, allowedModules);
            if (targetUser.email) {
              setUserAllModuleActions(targetUser.email, typed);
              usePermissionStore
                .getState()
                .setUserPermissions(targetUser.email, allowedModules);
            }
            await fetchUserPermissions(targetUser.id);

            // Sync with user service and persist to DB users table
            try {
              const { updateUser } =
                await import("@/features/users/services/userService");
              await updateUser(targetUser.id, {
                allowedModules,
                permissions: {
                  actionMatrix: typed,
                  allowedModules,
                },
              });
            } catch (uErr) {
              console.warn("Could not sync user object in userService:", uErr);
            }

            // Live update active auth session if targetUser is the logged in user
            try {
              const currentAuthUser = useAuthStore.getState().user;
              const isCurrent =
                currentAuthUser &&
                (String(currentAuthUser.id) === String(targetUser.id) ||
                  currentAuthUser.email?.toLowerCase().trim() ===
                    targetUser.email?.toLowerCase().trim());
              if (isCurrent) {
                useAuthStore.setState({
                  user: {
                    ...currentAuthUser,
                    allowedModules,
                    permissions: {
                      actionMatrix: typed,
                      allowedModules,
                    },
                  },
                });
              }
            } catch {}

            recordActivityLog({
              type: "permission",
              module: "Permissions",
              action: "User Permissions Overridden",
              description: `Custom permissions saved for user ${targetUser.name} (${targetUser.role || "Teams"})`,
              companyId:
                targetUser.companyId ||
                (targetUser.companyIds && targetUser.companyIds[0]),
              branchId: targetUser.branchId,
              branchName: targetUser.branchName,
              details: `User: ${targetUser.name} (${targetUser.email || targetUser.id}) • ${allowedModules.length} active module(s)`,
            }).catch(() => {});

            if (typeof window !== "undefined") {
              window.dispatchEvent(
                new CustomEvent("saampark_user_permissions_updated"),
              );
              window.dispatchEvent(new Event("saampark_users_updated"));
              window.dispatchEvent(new Event("saampark_data_synced"));
              window.dispatchEvent(new Event("storage"));
            }
          },
          {
            actionType: "update",
            successTitle: "User Permissions Saved",
            successMsg:
              "Custom permission overrides saved for " + targetUser.name + ".",
          },
        );

        onSaved?.();
        onClose();
      } finally {
        setIsSaving(false);
      }
    };
    return __fn(...__args);
  };
}
