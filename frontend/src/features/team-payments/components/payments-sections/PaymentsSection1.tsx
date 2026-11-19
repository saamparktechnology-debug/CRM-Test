"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Search, 
  RefreshCw, 
  Send, 
  Trash2, 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Shield, 
  Edit, 
  Plus, 
  Lock, 
  Filter,
  Download,
  Printer,
  Sparkles,
  Layers,
  FolderGit2,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Receipt
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { 
  TeamMemberPayoutProfile, 
  TeamPayoutRecord, 
  TeamPayrollKPIs,
  TeamMemberBankingInfo,
  ProjectUserEarningsRecord,
  CustomPaymentAdjustment,
  PayoutType
} from "@/features/team/types"
import { 
  getTeamPayoutProfiles, 
  getPayoutRecords, 
  updateMemberBankingDetails, 
  deletePayoutRecord, 
  sendTeamPaymentReceiptEmail,
  getProjectWiseUserEarnings,
  getCustomAdjustments,
  updateCustomAdjustmentStatus,
  deleteCustomAdjustment,
  recordTeamPayout
} from "@/features/team/services/teamPaymentService"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { EditMemberBankingModal } from "@/features/team/components/EditMemberBankingModal"
import { TeamPaymentReceiptModal } from "@/features/team/components/TeamPaymentReceiptModal"
import { MemberPayoutLedgerModal } from "@/features/team/components/MemberPayoutLedgerModal"
import { DisburseProjectShareModal } from "@/features/team/components/DisburseProjectShareModal"
import { AddCustomAdjustmentModal } from "@/features/team/components/AddCustomAdjustmentModal"
import { Button } from "@/components/ui/Button"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { exportToExcel } from "@/lib/exportUtils"

export function PaymentsSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, selectedBranchId, isSingleBranchAdmin, setSelectedBranchId, branches, availableSubBranches, selectedSubBranchId, setSelectedSubBranchId, handleExportExcel, canAddPayout, setIsAddAdjustmentOpen, loadData, isSuperAdmin, isCompanyAdmin, displayKpis, filteredProjectEarnings, setActiveTab, activeTab, profiles, projectEarnings, records, customAdjustments, searchQuery, setSearchQuery, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[999999] px-4 py-3 bg-zinc-900 text-white text-xs font-semibold rounded-2xl shadow-2xl border border-zinc-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <CreditCard size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Teams Payments & Payroll Hub</span>
              </h1>
              <p className="text-xs text-zinc-500">
                Staff compensation, project milestone shares, banking/UPI details, universal payout history & custom allowances.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Branch Selector */}
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

          <Button size="sm" variant="secondary" onClick={handleExportExcel} leftIcon={<Download size={13} />}>
            Export Excel
          </Button>

          {canAddPayout && (
            <Button size="sm" onClick={() => setIsAddAdjustmentOpen(true)} leftIcon={<Sparkles size={13} />} className="bg-amber-600 hover:bg-amber-700 text-white font-bold">
              + Custom Allowance
            </Button>
          )}

          <Button size="sm" variant="secondary" onClick={() => loadData(true)} leftIcon={<RefreshCw size={13} />}>
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Liability */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              {isSuperAdmin || isCompanyAdmin ? "Total Monthly Payroll" : "My Monthly Earnings"}
            </div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ₹{(displayKpis.totalMonthlyPayroll || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-zinc-500 font-semibold mt-1">
              {displayKpis.teamMembersOnPayroll} {displayKpis.teamMembersOnPayroll === 1 ? "Active Record" : "Active Staff"}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <CreditCard size={22} />
          </div>
        </div>

        {/* Total Paid */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Paid This Month</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{(displayKpis.totalPaidThisMonth || 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              {(displayKpis as any).paidMembersCount ?? displayKpis.fullyPaidMembers ?? 0} Settled
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
        </div>

        {/* Outstanding Need to Pay */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Need To Pay / Outstanding</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ₹{((displayKpis as any).totalNeedToPay ?? displayKpis.remainingNeedToPay ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {(displayKpis as any).pendingMembersCount ?? displayKpis.pendingMembers ?? 0} Payouts Pending
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle size={22} />
          </div>
        </div>

        {/* Project Shares Disbursed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Project Shares Disbursed</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
              ₹{((displayKpis as any).totalProjectDisbursements ?? displayKpis.projectEarningsPending ?? 0).toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
              {filteredProjectEarnings.length} Project Milestone Links
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <FolderGit2 size={22} />
          </div>
        </div>
      </div>

      {/* 4-Tab Navigation Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl w-full sm:w-fit border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs overflow-x-auto">
          {/* Tab 1 */}
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "directory"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <User size={14} />
            <span>Team Members & Banking ({profiles.length})</span>
          </button>

          {/* Tab 2 */}
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "projects"
                ? "bg-white dark:bg-zinc-900 text-purple-800 dark:text-purple-300 shadow-sm border border-purple-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <FolderGit2 size={14} />
            <span>Project-Wise Payments ({projectEarnings.length})</span>
          </button>

          {/* Tab 3 */}
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "history"
                ? "bg-white dark:bg-zinc-900 text-blue-800 dark:text-blue-300 shadow-sm border border-blue-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Receipt size={14} />
            <span>All Payment History ({records.length})</span>
          </button>

          {/* Tab 4 */}
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-white dark:bg-zinc-900 text-amber-800 dark:text-amber-300 shadow-sm border border-amber-500/20"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Sparkles size={14} />
            <span>Custom Section ({customAdjustments.length})</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder={
                activeTab === "projects" ? "Search project, client, member..." :
                activeTab === "custom" ? "Search category, member..." :
                "Search member, role, bank, UPI..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:outline-hidden w-64"
            />
          </div>

          {activeTab === "directory" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-hidden"
            >
              <option value="all">All Payout Statuses</option>
              <option value="Need to Pay">⚠️ Need to Pay</option>
              <option value="Paid">✅ Paid</option>
              <option value="Partial">🟡 Partial</option>
            </select>
          )}

          {activeTab === "history" && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-hidden"
            >
              <option value="all">All Payout Categories</option>
              <option value="Salary">Monthly Salary</option>
              <option value="Subscription">Subscription Commission</option>
              <option value="Project">Project Share</option>
              <option value="Allowance">Custom Allowance / Bonus</option>
            </select>
          )}
        </div>
      </div>
    </>
  );
}
