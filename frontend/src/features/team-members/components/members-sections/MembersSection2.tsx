"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, Mail, X, ExternalLink, CheckCircle2, 
  Briefcase, CheckSquare, Clock, Phone, User, Shield, Building2, Eye,
  DollarSign, Percent, Sparkles, RefreshCw, Lock, Layers, Trash2, Pencil,
  CreditCard, Calendar, FolderKanban, Check, ChevronRight
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getUsers, getUserAvatar, deleteUser } from "@/features/users/services/userService"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, calculateTeamRevenueShare } from "@/features/subscriptions/types"
import { getProjectWiseUserEarnings, getTeamBankingMap, updateMemberBankingDetails } from "@/features/team/services/teamPaymentService"
import { ProjectUserEarningsRecord, TeamMemberBankingInfo } from "@/features/team/types"
import { AddTeamMemberModal } from "@/features/team/components/AddTeamMemberModal"
import { EditTeamMemberModal } from "@/features/team/components/EditTeamMemberModal"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { type TeamMember } from "@/features/team-members/components/members-sections/MembersHelpers"

export function MembersSection2({ ctrl }: { ctrl: any }) {
  const { toastMessage, selectedBranchId, isSingleBranchAdmin, setSelectedBranchId, branches, availableSubBranches, selectedSubBranchId, setSelectedSubBranchId, canAddMember, setIsAddMemberOpen, loadData, members, freeCount, busyCount, columns, isLoading } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[999999] bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-zinc-700"
          >
            <Sparkles size={16} className="text-blue-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <User size={18} />
            </div>
            <span>Team Members & Workload Hub</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Directory of company, branch, and sub-branch staff with active deliverables, revenue share rates, and instant compensation payouts.
          </p>
        </div>

        {/* Branch & Sub-Branch Scoping Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Branch Filter Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
            <Building2 size={13} className="text-zinc-400 shrink-0" />
            <select
              value={selectedBranchId}
              disabled={isSingleBranchAdmin}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-transparent font-bold text-zinc-800 dark:text-zinc-200 focus:outline-hidden cursor-pointer disabled:cursor-not-allowed text-xs"
            >
              {!isSingleBranchAdmin && (
                <>
                  <option value="all">🏢 All Branches & HQ</option>
                  <option value="hq">🏢 Central Office / HQ</option>
                </>
              )}
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  📍 {b.name} ({b.code || 'Branch'})
                </option>
              ))}
            </select>
            {isSingleBranchAdmin && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold ml-1 flex items-center gap-0.5" title="Branch is locked to your assigned branch">
                <Lock size={10} />
              </span>
            )}
          </div>

          {/* Sub-Branch Filter Selector */}
          {availableSubBranches.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs">
              <Layers size={13} className="text-purple-500 shrink-0" />
              <select
                value={selectedSubBranchId}
                onChange={(e) => setSelectedSubBranchId(e.target.value)}
                className="bg-transparent font-bold text-purple-900 dark:text-purple-200 focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="all">🌐 All Sub-Branches</option>
                {availableSubBranches.map(sb => (
                  <option key={sb.id} value={sb.id}>
                    🏢 {sb.name} ({sb.code || 'Sub-Branch'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {canAddMember && (
            <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={() => setIsAddMemberOpen(true)}>
              Add Member
            </Button>
          )}

          <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={13} />} onClick={() => loadData()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Team Size</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{members.length} Members</h3>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-xl">
            <User size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Currently Available</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{freeCount} Ready for Projects</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Occupied with Deliverables</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{busyCount} In Progress</h3>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={members}
        searchKey="name"
        isLoading={isLoading}
      />

      {/* Slide-over Profile Drawer */}
    </>
  );
}
