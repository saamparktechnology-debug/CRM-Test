"use client"

import * as React from "react"
import { X, Check, Users, Shield, UserCheck, Search, Percent, Sparkles, Building2 } from "lucide-react"
import { Project, ProjectType, ProjectMember, ProjectMilestone } from "../types"
import { addProject } from "../services/projectService"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { AddProjectModalSection1 } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalSection1"
import { AddProjectModalSection2 } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalSection2"
import { AddProjectModalSection3 } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalSection3"
import { createAddProjectModalHandler1 } from "@/features/projects/hooks/addprojectmodal-hooks/createAddProjectModalHandler1.hooks"


import { type AddProjectModalProps } from "@/features/projects/components/addprojectmodal-sections/AddProjectModalHelpers"
export * from "@/features/projects/components/addprojectmodal-sections/AddProjectModalHelpers"

export function AddProjectModal({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, companies } = useAuthStore()
  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, user, branches)
  }, [companies, activeCompanyId, user, branches])

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(() => {
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId
    return user?.companyId || "tech"
  })

  React.useEffect(() => {
    if (selectableCompanies.length > 0 && !selectableCompanies.some(c => c.id === selectedCompanyId || c.slug === selectedCompanyId)) {
      setSelectedCompanyId(selectableCompanies[0].id || selectableCompanies[0].slug || "tech")
    }
  }, [selectableCompanies, selectedCompanyId])

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(activeBranchId || user?.branchId || "")
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(activeSubBranchId || (user as any)?.subBranchId || "")
  const isBranchLocked = Boolean(user?.branchId && user?.role !== "Super Admin")

  const availableBranches = React.useMemo(() => {
    return (branches || []).filter((b: any) => {
      if (!b) return false
      if (!selectedCompanyId || selectedCompanyId === "all") return true
      const bComp = String(b.companyId || b.company_id || "").toLowerCase().trim()
      const selComp = String(selectedCompanyId).toLowerCase().trim()
      return bComp === selComp || (selComp === "tech" && (bComp === "1" || !bComp)) || (selComp === "consultancy" && bComp === "2")
    })
  }, [branches, selectedCompanyId])

  const availableSubBranchesForBranch = React.useMemo(() => {
    if (!selectedBranchId || !subBranches || !Array.isArray(subBranches)) return []
    const normB = String(selectedBranchId).toLowerCase().trim()
    const targetB = availableBranches.find(b => String(b.id).toLowerCase().trim() === normB || String(b.name).toLowerCase().trim() === normB)
    const bId = targetB ? String(targetB.id).toLowerCase().trim() : normB
    const bName = targetB ? String(targetB.name).toLowerCase().trim() : ""

    return subBranches.filter(sb => {
      const pId = String(sb.parentBranchId || (sb as any).branch_id || (sb as any).branchId || "").toLowerCase().trim()
      const pName = String((sb as any).branchName || (sb as any).branch_name || "").toLowerCase().trim()
      return pId === bId || (bName && (pId === bName || pName === bName)) || pName === bId
    })
  }, [selectedBranchId, subBranches, availableBranches])

  const [title, setTitle] = React.useState("")
  const [projectType, setProjectType] = React.useState<ProjectType>("Client Project")
  const [client, setClient] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [baseAmount, setBaseAmount] = React.useState<number | "">("")
  const [setupCharge, setSetupCharge] = React.useState<number | "">("")
  const [discount, setDiscount] = React.useState<number | "">("")
  const [gstRate, setGstRate] = React.useState<number>(18)
  const [labels, setLabels] = React.useState("")
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([])
  const [memberShares, setMemberShares] = React.useState<Record<string, number>>({})
  const [memberPayoutTypes, setMemberPayoutTypes] = React.useState<Record<string, "percentage" | "fixed">>({})
  const [memberAmounts, setMemberAmounts] = React.useState<Record<string, number>>({})
  const [memberSearchQuery, setMemberSearchQuery] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [availableClients, setAvailableClients] = React.useState<{ name: string; email: string }[]>([])
  const [teamMembers, setTeamMembers] = React.useState<any[]>([])

  React.useEffect(() => {
    if (isOpen) {
      setSelectedCompanyId(activeCompanyId || user?.companyId || "tech")
      setSelectedBranchId(activeBranchId || user?.branchId || "")
      // 1. Fetch team members reliably
      Promise.all([
        getUsers("all").catch(() => []),
        UserService.getTeamMembers().catch(() => []),
      ]).then(([dbUsers, apiUsers]) => {
        const combined = [
          ...(Array.isArray(dbUsers) ? dbUsers : []),
          ...(Array.isArray(apiUsers) ? apiUsers : []),
        ]
        const unique = new Map<string, any>()
        for (const u of combined) {
          if (!u) continue
          const role = (u.role || u.role_name || "").toLowerCase().trim()
          const email = String(u.email || "").toLowerCase().trim()
          const isClient = role.includes("client")
          const isAdmin = role.includes("admin") || role.includes("super") || email.includes("superadmin") || email === "saampark.official@gmail.com"
          const isInactive = u.status === "Inactive"
          const uId = String(u.id || u._id || u.email)
          if (!isClient && !isAdmin && !isInactive && !unique.has(uId.toLowerCase())) {
            unique.set(uId.toLowerCase(), {
              id: uId,
              name: u.name || u.full_name || "Team Member",
              role: u.role || u.role_name || u.department || "Developer",
              email: u.email || "",
              avatar: u.avatarUrl || u.avatar_url || u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || u.full_name || uId}`,
            })
          }
        }
        setTeamMembers(Array.from(unique.values()))
      }).catch(() => {})

      // 2. Fetch real clients
      getClients().then((cls) => {
        setAvailableClients(cls.map(c => ({ name: c.name, email: c.email || "" })))
        if (cls.length > 0) setClient(cls[0].name)
      }).catch(() => {})
    }
  }, [isOpen])

  if (!isOpen) return null

  // Computed numeric final price
  const numericComputedPrice = (typeof baseAmount === "number" && baseAmount > 0)
    ? (Math.max(0, baseAmount + (typeof setupCharge === "number" ? setupCharge : 0) - (typeof discount === "number" ? discount : 0)) +
       Math.round(Math.max(0, baseAmount + (typeof setupCharge === "number" ? setupCharge : 0) - (typeof discount === "number" ? discount : 0)) * (gstRate / 100)))
    : (parseFloat(String(price).replace(/[^0-9.]/g, "")) || 0)

  const handleToggleMember = (mem: any) => {
    const memId = String(mem.id)
    setSelectedMemberIds((prev) => {
      if (prev.includes(memId)) {
        return prev.filter((id) => id !== memId)
      } else {
        if (memberShares[memId] === undefined) {
          setMemberShares((s) => ({ ...s, [memId]: 15 }))
        }
        if (memberPayoutTypes[memId] === undefined) {
          setMemberPayoutTypes((t) => ({ ...t, [memId]: "percentage" }))
        }
        if (memberAmounts[memId] === undefined) {
          const defaultAmt = Math.round((numericComputedPrice * 15) / 100) || 5000
          setMemberAmounts((a) => ({ ...a, [memId]: defaultAmt }))
        }
        return [...prev, memId]
      }
    })
  }

  const handlePayoutTypeChange = (memId: string, type: "percentage" | "fixed") => {
    setMemberPayoutTypes((prev) => ({ ...prev, [memId]: type }))
    if (type === "fixed" && (!memberAmounts[memId] || memberAmounts[memId] === 0)) {
      const share = memberShares[memId] !== undefined ? memberShares[memId] : 15
      const computedAmt = Math.round((numericComputedPrice * share) / 100) || 5000
      setMemberAmounts((prev) => ({ ...prev, [memId]: computedAmt }))
    }
  }

  const handleAmountChange = (memId: string, amtVal: number) => {
    const clamped = isNaN(amtVal) ? 0 : Math.max(0, amtVal)
    setMemberAmounts((prev) => ({ ...prev, [memId]: clamped }))
    if (numericComputedPrice > 0) {
      const calcPct = Math.min(100, Math.round((clamped / numericComputedPrice) * 1000) / 10)
      setMemberShares((prev) => ({ ...prev, [memId]: calcPct }))
    }
  }

  const handleShareChange = (memId: string, shareVal: number) => {
    const clamped = isNaN(shareVal) ? 0 : Math.max(0, Math.min(100, shareVal))
    setMemberShares((prev) => ({
      ...prev,
      [memId]: clamped,
    }))
    if (numericComputedPrice > 0) {
      const calcAmt = Math.round((numericComputedPrice * clamped) / 100)
      setMemberAmounts((prev) => ({ ...prev, [memId]: calcAmt }))
    }
  }

  const totalAssignedSharePct = selectedMemberIds.reduce(
    (acc, mId) => acc + (memberShares[mId] !== undefined ? memberShares[mId] : 15),
    0
  )

  const handleSave: any = createAddProjectModalHandler1(() => __ctrlRef.current);

  
  __ctrl = { isOpen, onClose, onProjectAdded, user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, companies, selectableCompanies, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, isBranchLocked, availableBranches, availableSubBranchesForBranch, title, setTitle, projectType, setProjectType, client, setClient, description, setDescription, startDate, setStartDate, deadline, setDeadline, price, setPrice, baseAmount, setBaseAmount, setupCharge, setSetupCharge, discount, setDiscount, gstRate, setGstRate, labels, setLabels, selectedMemberIds, setSelectedMemberIds, memberShares, setMemberShares, memberPayoutTypes, setMemberPayoutTypes, memberAmounts, setMemberAmounts, memberSearchQuery, setMemberSearchQuery, isSubmitting, setIsSubmitting, availableClients, setAvailableClients, teamMembers, setTeamMembers, numericComputedPrice, handleToggleMember, handlePayoutTypeChange, handleAmountChange, handleShareChange, totalAssignedSharePct, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Add project
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <AddProjectModalSection1 ctrl={__ctrl} />
          <AddProjectModalSection2 ctrl={__ctrl} />

          <AddProjectModalSection3 ctrl={__ctrl} />
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
          >
            <X size={14} />
            <span>Close</span>
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(true)}
            className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
          >
            <Check size={14} />
            <span>Save & continue</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave(false)}
            className="flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Check size={14} />
            <span>Save</span>
          </button>
        </div>

      </div>
    </div>
  )
}
