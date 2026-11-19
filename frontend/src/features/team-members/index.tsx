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
import { MembersSection1 } from "@/features/team-members/components/members-sections/MembersSection1"
import { MembersSection2 } from "@/features/team-members/components/members-sections/MembersSection2"


import { type TeamMember } from "@/features/team-members/components/members-sections/MembersHelpers"
export * from "@/features/team-members/components/members-sections/MembersHelpers"

export default function TeamMembersPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { activeCompanyId, activeBranchId, branches, subBranches, user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const roleLower = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleLower.includes("super") || roleLower === "super admin"
  const isCompanyAdmin = !isSuperAdmin && (
    roleLower.includes("admin") || 
    roleLower.includes("owner") || 
    roleLower.includes("manager") ||
    roleLower === "admin"
  )
  const isSingleBranchAdmin = Boolean(
    !isSuperAdmin &&
    user?.branchId && 
    (roleLower.includes("branch admin") || roleLower.includes("branch manager") || roleLower.includes("branch"))
  )

  // Permissions
  const canAddMember = (typeof canPerformAction === 'function' ? canPerformAction(user, "Teams", "add") : true) || isSuperAdmin || isCompanyAdmin
  const canEditMember = (typeof canPerformAction === 'function' ? canPerformAction(user, "Teams", "edit") : true) || isSuperAdmin || isCompanyAdmin
  const canDeleteMember = (typeof canPerformAction === 'function' ? canPerformAction(user, "Teams", "delete") : true) || isSuperAdmin || isCompanyAdmin
  const canDisbursePayout = (typeof canPerformAction === 'function' ? canPerformAction(user, "Teams", "add") : true) || isSuperAdmin || isCompanyAdmin

  // Branch & Sub-Branch Filter Selectors
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("all")
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>("all")

  React.useEffect(() => {
    if (isSingleBranchAdmin && user?.branchId) {
      setSelectedBranchId(user.branchId)
    } else if (activeBranchId) {
      setSelectedBranchId(activeBranchId)
    } else {
      setSelectedBranchId("all")
    }
  }, [isSingleBranchAdmin, user?.branchId, activeBranchId])

  // Filter available sub-branches based on selected branch
  const availableSubBranches = React.useMemo(() => {
    if (selectedBranchId === "all") return subBranches
    return subBranches.filter(sb => sb.parentBranchId === selectedBranchId)
  }, [subBranches, selectedBranchId])

  const [members, setMembers] = React.useState<TeamMember[]>([])
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null)
  const [drawerActiveTab, setDrawerActiveTab] = React.useState<"overview" | "projects" | "subs" | "tasks" | "banking">("overview")
  const [isLoading, setIsLoading] = React.useState(true)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Modals
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false)
  const [editingMember, setEditingMember] = React.useState<TeamMember | null>(null)
  const [payingMember, setPayingMember] = React.useState<TeamMember | null>(null)

  // Inline banking edit in drawer
  const [isEditingBankingInline, setIsEditingBankingInline] = React.useState(false)
  const [inlineBankName, setInlineBankName] = React.useState("")
  const [inlineAccountNum, setInlineAccountNum] = React.useState("")
  const [inlineIfsc, setInlineIfsc] = React.useState("")
  const [inlineUpi, setInlineUpi] = React.useState("")
  const [inlineSalary, setInlineSalary] = React.useState<number | "">("")

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const comp = activeCompanyId || "tech"
      const [userRes, allTasks, allSubs, allProjEarnings, bankingMap] = await Promise.all([
        getUsers(comp).catch(() => []),
        taskService.getTasks().catch(() => []),
        getSubscriptions(comp).catch(() => []),
        getProjectWiseUserEarnings(comp, selectedBranchId, selectedSubBranchId).catch(() => []),
        getTeamBankingMap(comp).catch(() => ({})),
      ])

      if (Array.isArray(userRes)) {
        // Filter strictly to non-clients
        let rawMembers = userRes.filter((u: any) => {
          const r = (u.role || u.role_name || "").toLowerCase().trim()
          return !r.includes("client") && u.status !== "Inactive"
        })

        // Filter by Branch if selected
        if (selectedBranchId && selectedBranchId !== "all") {
          rawMembers = rawMembers.filter((u: any) => {
            const uBranch = u.branchId || u.branch_id
            const uBranchIds = u.branchIds || []
            return uBranch === selectedBranchId || uBranchIds.includes(selectedBranchId)
          })
        }

        // Filter by Sub-Branch if selected
        if (selectedSubBranchId && selectedSubBranchId !== "all") {
          rawMembers = rawMembers.filter((u: any) => {
            const uSub = u.subBranchId || u.subbranch_id || u.subbranchName || u.subbranch
            return uSub === selectedSubBranchId
          })
        }

        const live: TeamMember[] = rawMembers.map((u: any, idx: number) => {
          const mName = u.name || u.full_name || u.email || "Team Member"
          const mEmail = (u.email || "").toLowerCase().trim()
          const memberId = String(u.id || idx)

          // Filter assigned tasks that are not Done
          const memberTasks = allTasks.filter((t) => {
            const assigned = (t.assignedTo || "").toLowerCase().trim()
            const isAssigned = assigned === mName.toLowerCase().trim() || (mEmail && assigned.includes(mEmail))
            return isAssigned && t.status !== "Done"
          })

          // Filter assigned subscriptions
          const memberSubs = (Array.isArray(allSubs) ? allSubs : []).filter((s: Subscription) => {
            const byEmail = (s.assignedMemberEmail || "").toLowerCase().trim() === mEmail ||
              (Array.isArray(s.assignedMembers) && s.assignedMembers.some(em => em.toLowerCase().trim() === mEmail))
            const byName = (s.assignedMemberName || "").toLowerCase().trim() === mName.toLowerCase().trim()
            const byId = s.assignedMemberId && String(s.assignedMemberId) === memberId
            return Boolean(byEmail || byName || byId)
          })

          const totalMonthlyCommission = memberSubs.reduce((acc, sub) => {
            const calc = calculateTeamRevenueShare(sub)
            return acc + calc.monthlyRevenue
          }, 0)

          // Filter assigned projects
          const memberProjects = allProjEarnings.filter(p => 
            String(p.memberId).toLowerCase().trim() === memberId.toLowerCase().trim() ||
            (p.memberEmail && mEmail && p.memberEmail.toLowerCase().trim() === mEmail)
          )
          const totalProjectEarnings = memberProjects.reduce((acc, p) => acc + p.memberTotalEarned, 0)

          const bankMap: Record<string, TeamMemberBankingInfo> = (bankingMap as any) || {}
          const bInfo: TeamMemberBankingInfo = bankMap[memberId.toLowerCase()] || bankMap[mEmail] || {
            memberId,
            baseSalary: u.salary ? Number(u.salary) : (u.baseSalary ? Number(u.baseSalary) : 0),
            bankName: u.bankName || u.bankingInfo?.bankName || "",
            accountNumber: u.accountNumber || u.bankingInfo?.accountNumber || "",
            ifscCode: u.ifscCode || u.bankingInfo?.ifscCode || "",
            accountHolderName: u.accountHolderName || u.bankingInfo?.accountHolderName || "",
            upiId: u.upiId || u.bankingInfo?.upiId || "",
          }

          return {
            id: memberId,
            name: mName,
            avatarUrl: u.avatarUrl || u.avatar_url || u.avatar || getUserAvatar(mName, undefined, mName),
            jobTitle: u.role || u.role_name || "Technical Lead",
            email: u.email || "-",
            phone: u.phone || "+91 98765 43210",
            department: u.department || "Engineering & Delivery",
            branchId: u.branchId || u.branch_id,
            branchName: u.branchName || u.branch_name,
            subBranchId: u.subBranchId || u.subbranch_id,
            subbranchName: u.subbranchName || u.subbranch,
            companyId: u.companyId || comp,
            status: u.status === "active" || idx % 2 === 0 ? "Online" : "Offline",
            assignedTasksCount: memberTasks.length,
            activeTasks: memberTasks,
            assignedSubscriptions: memberSubs,
            totalMonthlyCommission,
            assignedProjects: memberProjects,
            totalProjectEarnings,
            bankingInfo: bInfo,
          }
        })
        setMembers(live)
      }
    } catch (err) {
      console.error("Error loading team members API:", err)
    } finally {
      setIsLoading(false)
    }
  }, [activeCompanyId, selectedBranchId, selectedSubBranchId])

  React.useEffect(() => {
    loadData()
    const handleReload = () => loadData()
    window.addEventListener("storage", handleReload)
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    window.addEventListener("saampark_subbranches_updated", handleReload)
    window.addEventListener("saampark_users_updated", handleReload)
    window.addEventListener("saampark_team_members_updated", handleReload)
    window.addEventListener("saampark_team_banking_updated", handleReload)

    return () => {
      window.removeEventListener("storage", handleReload)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
      window.removeEventListener("saampark_subbranches_updated", handleReload)
      window.removeEventListener("saampark_users_updated", handleReload)
      window.removeEventListener("saampark_team_members_updated", handleReload)
      window.removeEventListener("saampark_team_banking_updated", handleReload)
    }
  }, [loadData])

  // Delete Member Handler
  const handleDeleteMember = async (member: TeamMember) => {
    if (!canDeleteMember) {
      alert("You do not have permission to delete team members.")
      return
    }

    if (await confirmTwoStepDelete(member.name, "team member")) {
      await deleteUser(member.id || member.email, activeCompanyId || "tech")
      showToast(`🗑️ Team member "${member.name}" removed successfully.`)
      if (selectedMember?.id === member.id) {
        setSelectedMember(null)
      }
      loadData()
    }
  }

  // Open inline banking editor inside drawer
  const handleOpenInlineBanking = (member: TeamMember) => {
    setInlineBankName(member.bankingInfo?.bankName || "")
    setInlineAccountNum(member.bankingInfo?.accountNumber || "")
    setInlineIfsc(member.bankingInfo?.ifscCode || "")
    setInlineUpi(member.bankingInfo?.upiId || "")
    setInlineSalary(member.bankingInfo?.baseSalary ?? 0)
    setIsEditingBankingInline(true)
  }

  // Save inline banking inside drawer
  const handleSaveInlineBanking = async (member: TeamMember) => {
    await updateMemberBankingDetails(member.id, {
      bankName: inlineBankName.trim() || undefined,
      accountNumber: inlineAccountNum.trim() || undefined,
      ifscCode: inlineIfsc.trim() || undefined,
      upiId: inlineUpi.trim() || undefined,
      baseSalary: typeof inlineSalary === "number" ? inlineSalary : 0,
      accountHolderName: member.name,
    }, activeCompanyId || "tech")

    setIsEditingBankingInline(false)
    showToast("✅ Banking and compensation details updated!")
    loadData()
  }

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "name",
      header: "Team Member",
      cell: ({ row }) => (
        <div 
          onClick={() => {
            setSelectedMember(row.original)
            setDrawerActiveTab("overview")
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <img src={row.original.avatarUrl} alt={row.getValue("name")} className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 group-hover:ring-2 group-hover:ring-blue-500 transition-all" />
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-900 ${row.original.status === "Online" ? "bg-emerald-500" : "bg-zinc-400"}`} />
          </div>
          <div>
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <span>{row.getValue("name")}</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "jobTitle",
      header: "Role & Branch Scope",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-zinc-800 dark:text-zinc-200">{row.original.jobTitle}</div>
          <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
            <span>{row.original.department}</span>
            {row.original.branchName && (
              <span className="px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                📍 {row.original.branchName}
              </span>
            )}
            {row.original.subbranchName && (
              <span className="px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                🏢 {row.original.subbranchName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "assignedProjects",
      header: "Projects & Share",
      cell: ({ row }) => {
        const projCount = row.original.assignedProjects.length
        const totalEarned = row.original.totalProjectEarnings
        return (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
              <FolderKanban size={13} />
              <span>₹{totalEarned.toLocaleString("en-IN")} Earned</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              {projCount > 0 ? `${projCount} Assigned Project(s)` : "No Projects Assigned"}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "assignedSubscriptions",
      header: "Subscriptions Share",
      cell: ({ row }) => {
        const subsCount = row.original.assignedSubscriptions.length
        const monthlyComm = row.original.totalMonthlyCommission
        return (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <Sparkles size={12} />
              <span>₹{monthlyComm.toLocaleString("en-IN")}/mo</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              {subsCount > 0 ? `${subsCount} Managed Client Subs` : "0 Subscriptions"}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "assignedTasksCount",
      header: "Active Workload",
      cell: ({ row }) => {
        const count = row.original.assignedTasksCount
        return (
          <div>
            {count === 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                <CheckCircle2 size={12} />
                <span>Available</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                <CheckSquare size={12} />
                <span>Assigned ({count})</span>
              </span>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setSelectedMember(row.original)
              setDrawerActiveTab("overview")
            }}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
            title="View Dossier"
          >
            <Eye size={14} />
          </button>

          {canEditMember && (
            <button
              type="button"
              onClick={() => setEditingMember(row.original)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Edit Member Profile"
            >
              <Pencil size={14} />
            </button>
          )}

          {canDisbursePayout && (
            <button
              type="button"
              onClick={() => setPayingMember(row.original)}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
              title="Record / Disburse Payment"
            >
              <CreditCard size={14} />
            </button>
          )}

          {canDeleteMember && (
            <button
              type="button"
              onClick={() => handleDeleteMember(row.original)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
              title="Delete Member"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    }
  ]

  const freeCount = members.filter(m => m.assignedTasksCount === 0).length
  const busyCount = members.filter(m => m.assignedTasksCount > 0).length

  
  __ctrl = { activeCompanyId, activeBranchId, branches, subBranches, user, canPerformAction, roleLower, isSuperAdmin, isCompanyAdmin, isSingleBranchAdmin, canAddMember, canEditMember, canDeleteMember, canDisbursePayout, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, availableSubBranches, members, setMembers, selectedMember, setSelectedMember, drawerActiveTab, setDrawerActiveTab, isLoading, setIsLoading, toastMessage, setToastMessage, isAddMemberOpen, setIsAddMemberOpen, editingMember, setEditingMember, payingMember, setPayingMember, isEditingBankingInline, setIsEditingBankingInline, inlineBankName, setInlineBankName, inlineAccountNum, setInlineAccountNum, inlineIfsc, setInlineIfsc, inlineUpi, setInlineUpi, inlineSalary, setInlineSalary, showToast, loadData, handleDeleteMember, handleOpenInlineBanking, handleSaveInlineBanking, columns, freeCount, busyCount };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      
      <MembersSection2 ctrl={__ctrl} />
      <AnimatePresence>
        <MembersSection1 ctrl={__ctrl} />
      </AnimatePresence>

      {/* Add Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={() => {
          showToast("🎉 New team member added successfully!")
          loadData()
        }}
      />

      {/* Edit Member Modal */}
      <EditTeamMemberModal
        isOpen={Boolean(editingMember)}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onSuccess={() => {
          showToast("✅ Team member profile updated!")
          loadData()
        }}
      />

      {/* Record Payout Modal */}
      {payingMember && (
        <RecordPayoutModal
          isOpen={Boolean(payingMember)}
          profile={{
            id: payingMember.id,
            name: payingMember.name,
            email: payingMember.email,
            phone: payingMember.phone,
            avatarUrl: payingMember.avatarUrl,
            role: payingMember.jobTitle,
            department: payingMember.department || "Operations",
            companyId: payingMember.companyId || activeCompanyId || "tech",
            branchId: payingMember.branchId,
            branchName: payingMember.branchName,
            subBranchId: payingMember.subBranchId,
            subbranchName: payingMember.subbranchName,
            baseSalary: payingMember.bankingInfo?.baseSalary || 0,
            subscriptionCommission: payingMember.totalMonthlyCommission,
            projectEarnings: payingMember.totalProjectEarnings,
            totalDueThisMonth: (payingMember.bankingInfo?.baseSalary || 0) + payingMember.totalMonthlyCommission + payingMember.totalProjectEarnings,
            totalPaidThisMonth: 0,
            remainingNeedToPay: (payingMember.bankingInfo?.baseSalary || 0) + payingMember.totalMonthlyCommission + payingMember.totalProjectEarnings,
            payoutStatus: "Need to Pay",
            activeSubscriptionsCount: payingMember.assignedSubscriptions.length,
            activeProjectsCount: payingMember.assignedProjects.length,
            bankingInfo: payingMember.bankingInfo || {
              memberId: payingMember.id,
              baseSalary: 0,
              bankName: "",
              accountNumber: "",
              ifscCode: "",
              accountHolderName: "",
              upiId: "",
            },
          }}
          onClose={() => setPayingMember(null)}
          onSuccess={(payout) => {
            showToast(`💳 Payout voucher ${payout.id} generated for ${payout.memberName}!`)
            loadData()
          }}
        />
      )}
    </motion.div>
  )
}
