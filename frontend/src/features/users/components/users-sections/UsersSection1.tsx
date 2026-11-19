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

export function UsersSection1({ ctrl }: { ctrl: any }) {
  const {
    canAddUser,
    handleOpenCreateModal,
    totalUsers,
    totalAdmins,
    totalTeams,
    totalClients,
    isLoading,
    visibleUsers,
    handleOpenEditModal,
    handleToggleStatus,
    handleDeleteUser,
    router,
    setSelectedUserForOverview,
    setIsOverviewModalOpen,
    isOverviewModalOpen,
    selectedUserForOverview,
    queryClient,
    isModalOpen,
    setIsModalOpen,
    handleSaveUser,
    editingUser,
    statusModalState,
    setStatusModalState,
  } = ctrl;
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UsersIcon className="text-primary" size={32} />
            Users Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, system permissions, role access, and dynamic
            module visibility across SAAMPARK Group.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
            <Download size={16} /> Export CSV
          </Button>

          {canAddUser && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreateModal}
              className="gap-2 cursor-pointer"
            >
              <UserPlus size={16} /> Add New User
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Users
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {totalUsers}
            </div>
            <div className="text-xs text-emerald-400 mt-1">Active Accounts</div>
          </div>
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <UsersIcon size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Admins & Leadership
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {totalAdmins}
            </div>
            <div className="text-xs text-purple-400 mt-1">
              Full System Access
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Teams & Users
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {totalTeams}
            </div>
            <div className="text-xs text-blue-400 mt-1">
              Teams & General Users
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-border flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Client Accounts
            </div>
            <div className="text-2xl font-bold text-foreground mt-1">
              {totalClients}
            </div>
            <div className="text-xs text-amber-400 mt-1">Portal Users</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <Briefcase size={24} />
          </div>
        </div>
      </div>

      {/* Users Table Component */}
      {isLoading ? (
        <ThreeDotLoader
          text="Loading team members & users..."
          fullScreen={false}
        />
      ) : (
        <UserList
          users={visibleUsers}
          onEdit={handleOpenEditModal}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDeleteUser}
          onManageUserModules={(targetUser) => {
            router.push(
              `/feature/permissions?tab=user-permissions&userId=${targetUser.id}`,
            );
          }}
          onViewOverview={(targetUser) => {
            setSelectedUserForOverview(targetUser);
            setIsOverviewModalOpen(true);
          }}
        />
      )}

      {/* User Account Overview & KYC Review Modal */}
      <UserOverviewModal
        isOpen={isOverviewModalOpen}
        user={selectedUserForOverview}
        onClose={() => {
          setIsOverviewModalOpen(false);
          setSelectedUserForOverview(null);
        }}
        onEdit={(targetUser) => {
          handleOpenEditModal(targetUser);
        }}
        onUserUpdated={(updatedUser) => {
          queryClient.setQueryData(USERS_QUERY_KEY, (prev: UserItem[] = []) =>
            prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          );
          setSelectedUserForOverview(updatedUser);
        }}
      />

      {/* User Create/Edit Modal with Custom Module Access */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        editingUser={editingUser}
      />

      {/* Success / Failed Status Feedback Popup Modal */}
      <AnimatePresence>
        {statusModalState.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 text-center space-y-4"
            >
              {/* Animated Glowing Status Icon */}
              <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                {statusModalState.type === "success" ? (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10">
                      <CheckCircle2 size={32} className="stroke-[2.5]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-75" />
                    <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center shadow-lg shadow-rose-500/20 relative z-10">
                      <AlertTriangle size={32} className="stroke-[2.5]" />
                    </div>
                  </>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {statusModalState.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed px-2">
                  {statusModalState.message}
                </p>
              </div>

              {/* Email Transfer Details Box (if applicable) */}
              {statusModalState.details &&
                statusModalState.details.oldEmail &&
                statusModalState.details.newEmail && (
                  <div className="p-3 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-2xl text-left text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-[11px] uppercase tracking-wider">
                      <Mail size={13} />
                      <span>Dual Login Enabled</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-zinc-500">
                        <span>Previous Email:</span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 line-through">
                          {statusModalState.details.oldEmail}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                        <span>New Primary Email:</span>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          {statusModalState.details.newEmail}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-1 border-t border-slate-200 dark:border-zinc-700">
                      💡 The user can now log in using <strong>either</strong>{" "}
                      their old or new email address with their existing
                      password.
                    </p>
                  </div>
                )}

              {/* Action Button */}
              <div className="pt-2">
                <Button
                  onClick={() =>
                    setStatusModalState({ ...statusModalState, isOpen: false })
                  }
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  Awesome, Got it
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
