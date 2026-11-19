"use client"

import * as React from "react"
import { X, Check, Paperclip, Mic, HelpCircle, Plus, Tag, Building, MapPin } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "../types"
import { taskService } from "../services/taskService"

import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"

import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { AddTaskModalSection1 } from "@/features/tasks/components/addtaskmodal-sections/AddTaskModalSection1"
import { createAddTaskModalHandler1 } from "@/features/tasks/hooks/addtaskmodal-hooks/createAddTaskModalHandler1.hooks"


import { type AddTaskModalProps } from "@/features/tasks/components/addtaskmodal-sections/AddTaskModalHelpers"
export * from "@/features/tasks/components/addtaskmodal-sections/AddTaskModalHelpers"

export function AddTaskModal({ isOpen, onClose, onTaskAdded, onSelectTask }: AddTaskModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const isSuperOrAdmin = user?.role === "Super Admin" || user?.role === "Admin"

  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, user, branches, subBranches)
  }, [companies, activeCompanyId, user, branches, subBranches])

  const isBranchLocked = Boolean(user?.branchId && user?.role !== "Super Admin")

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(() => {
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId
    return user?.companyId || "tech"
  })
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(
    user?.branchId || activeBranchId || ""
  )
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(
    user?.subBranchId || activeSubBranchId || ""
  )

  const availableBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    const targetComp = selectedCompanyId || activeCompanyId || user?.companyId || "tech"
    if (targetComp && targetComp !== "all") {
      return branches.filter((b) =>
        isMatchingCompany({ id: b.companyId || (b as any).company_id, slug: b.companyId } as any, targetComp)
      )
    }
    return branches
  }, [branches, selectedCompanyId, activeCompanyId, user?.companyId])

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

  const handleCompanyChange = (cId: string) => {
    setSelectedCompanyId(cId)
    if (!isBranchLocked) {
      setSelectedBranchId("")
      setSelectedSubBranchId("")
    }
  }

  const handleBranchChange = (bId: string) => {
    setSelectedBranchId(bId)
    setSelectedSubBranchId("")
  }

  const [teamMembers, setTeamMembers] = React.useState<{ id: string; name: string; role?: string }[]>([])
  const [allUsers, setAllUsers] = React.useState<UserItem[]>([])
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [selectedRelatedTo, setSelectedRelatedTo] = React.useState<string[]>([])
  const [customRelatedInput, setCustomRelatedInput] = React.useState("")
  const [availableRelatedOptions, setAvailableRelatedOptions] = React.useState<string[]>([
    "Website Development",
    "Software Development",
    "Android/iOS",
    "Digital Marketing",
    "Domain & Hosting",
  ])
  const [points, setPoints] = React.useState("1 Point")
  const [assignedTo, setAssignedTo] = React.useState("")
  const [status, setStatus] = React.useState<TaskStatus>("To do")
  const [priority, setPriority] = React.useState<TaskPriority | "Priority">("Priority")
  const [milestone, setMilestone] = React.useState("New")
  const [labels, setLabels] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  const [dueTime, setDueTime] = React.useState("")
  const [sourceType, setSourceType] = React.useState<"direct" | "leads" | "projects">("direct")
  const [isRecurring, setIsRecurring] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      // 1. Fetch available projects and leads for Related To multi-select
      Promise.all([
        import("@/features/projects/services/projectService").then(m => m.getProjects()).catch(() => []),
        import("@/features/leads/services/leadService").then(m => m.getLeads()).catch(() => []),
      ]).then(([projs, lds]) => {
        const extraOptions: string[] = []
        if (Array.isArray(projs)) {
          projs.forEach(p => { if (p.title) extraOptions.push(`Project: ${p.title}`) })
        }
        if (Array.isArray(lds)) {
          lds.forEach(l => { if (l.name) extraOptions.push(`Lead: ${l.name}`) })
        }
        setAvailableRelatedOptions(prev => {
          const set = new Set(prev)
          extraOptions.forEach(opt => set.add(opt))
          return Array.from(set)
        })
      })

      // 2. Fetch users strictly scoped to the active company and branch
      getUsers("all").then((list) => {
        setAllUsers(list || [])
        const targetComp = (activeCompanyId || user?.companyId || "").toLowerCase().trim()
        const targetBranch = activeBranchId || user?.branchId

        let filtered = list || []

        // Filter by Company
        if (targetComp && targetComp !== "all") {
          filtered = filtered.filter((u) => {
            const uCompIds = (u.companyIds && u.companyIds.length > 0)
              ? u.companyIds.map(id => String(id).toLowerCase().trim())
              : [String(u.companyId || "tech").toLowerCase().trim()]
            return uCompIds.includes(targetComp)
          })
        }

        // Filter by Branch
        if (targetBranch) {
          const targetBranchObj = branches.find(b => b.id === targetBranch || b.name.toLowerCase() === targetBranch.toLowerCase())
          const targetBranchId = String(targetBranchObj?.id || targetBranch).toLowerCase().trim()
          const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

          filtered = filtered.filter((u) => {
            const uBranchIds = (u.branchIds && u.branchIds.length > 0)
              ? u.branchIds.map(id => String(id).toLowerCase().trim())
              : (u.branchId ? [String(u.branchId).toLowerCase().trim()] : [])
            const uBranchName = String(u.branchName || "").toLowerCase().trim()

            return (
              uBranchIds.includes(targetBranchId) ||
              (targetBranchName && uBranchIds.includes(targetBranchName)) ||
              String(u.branchId || "").toLowerCase().trim() === targetBranchId ||
              (targetBranchName && (uBranchName === targetBranchName || String(u.branchId || "").toLowerCase().trim() === targetBranchName))
            )
          })
        }

        // Strictly team members only — Super Admin and Admin excluded
        const members = filtered
          .filter((u) => {
            const r = (u.role || "").toLowerCase().trim()
            return !r.includes("admin") && !r.includes("super") && !r.includes("client") && r !== "owner" && u.status !== "Inactive"
          })
          .map((u) => ({ id: u.id, name: u.name, role: u.role }))

        setTeamMembers(members)
        if (members.length > 0) {
          setAssignedTo((prev) => (prev && members.some(m => m.name === prev) ? prev : members[0].name))
        } else {
          setAssignedTo("")
        }
      })
    }
  }, [isOpen, user, activeCompanyId, activeBranchId, branches])

  if (!isOpen) return null

  const handleSave: any = createAddTaskModalHandler1(() => __ctrlRef.current);

  
  __ctrl = { isOpen, onClose, onTaskAdded, onSelectTask, user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, isSuperOrAdmin, selectableCompanies, isBranchLocked, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, availableBranches, availableSubBranchesForBranch, handleCompanyChange, handleBranchChange, teamMembers, setTeamMembers, allUsers, setAllUsers, title, setTitle, description, setDescription, selectedRelatedTo, setSelectedRelatedTo, customRelatedInput, setCustomRelatedInput, availableRelatedOptions, setAvailableRelatedOptions, points, setPoints, assignedTo, setAssignedTo, status, setStatus, priority, setPriority, milestone, setMilestone, labels, setLabels, startDate, setStartDate, deadline, setDeadline, dueTime, setDueTime, sourceType, setSourceType, isRecurring, setIsRecurring, isSubmitting, setIsSubmitting, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header (Screenshot 3 Match) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">Add task</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body (Screenshot 3 Match) */}
        <AddTaskModalSection1 ctrl={__ctrl} />

        {/* Footer (Screenshot 3 Match) */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert("Upload file clicked")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full hover:bg-zinc-50 transition-colors"
            >
              <Paperclip size={13} />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Voice dictation clicked")}
              className="p-2 text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 rounded-full transition-colors"
              title="Voice note"
            >
              <Mic size={14} />
            </button>
          </div>

          {/* Right Save Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <X size={14} />
              <span>Close</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(true)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors shadow-sm font-semibold"
            >
              <Check size={14} />
              <span>Save & show</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="flex items-center gap-1 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm font-semibold"
            >
              <Check size={14} />
              <span>Save</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
