"use client"

import * as React from "react"
import { X, Check, Paperclip, Mic, HelpCircle, Trash2, Plus, Tag } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "../types"
import { taskService } from "../services/taskService"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"

import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { EditTaskModalSection1 } from "@/features/tasks/components/edittaskmodal-sections/EditTaskModalSection1"


import { type EditTaskModalProps } from "@/features/tasks/components/edittaskmodal-sections/EditTaskModalHelpers"
export * from "@/features/tasks/components/edittaskmodal-sections/EditTaskModalHelpers"

export function EditTaskModal({ isOpen, task, onClose, onTaskUpdated, onDeleteTask }: EditTaskModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  const canDeleteTask = canPerformAction(user, "Tasks", "delete")

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
        const targetComp = (task?.companyId || activeCompanyId || user?.companyId || "").toLowerCase().trim()
        const targetBranch = task?.branchId || activeBranchId || user?.branchId

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
      })
    }
  }, [isOpen, user, task, activeCompanyId, activeBranchId, branches])

  React.useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      
      // Parse relatedTo string to array
      if (task.relatedTo && task.relatedTo !== "-") {
        const parts = task.relatedTo.split(/,\s*/).filter(Boolean)
        setSelectedRelatedTo(parts)
      } else {
        setSelectedRelatedTo([])
      }

      setPoints(task.points || "1 Point")
      setAssignedTo(task.assignedTo || "")
      setStatus(task.status || "To do")
      setPriority(task.priority || "Priority")
      setMilestone(task.milestone || "New")
      setLabels((task.labels || []).join(", "))
      setStartDate(task.startDate || "")
      setDeadline(task.deadline || "")
      setIsRecurring(!!task.isRecurring)
    }
  }, [task])

  if (!isOpen || !task) return null

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a task title.")
      return
    }

    setIsSubmitting(true)
    try {
      const parsedLabels = labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)

      let priorityIcon: "up" | "exclamation" | "down" | "none" = task.priorityIcon || "none"
      if (priority === "High") priorityIcon = "up"
      else if (priority === "Urgent") priorityIcon = "exclamation"
      else if (priority === "Low") priorityIcon = "down"

      const finalRelatedTo = selectedRelatedTo.length > 0 ? selectedRelatedTo.join(", ") : undefined

      const updated = await taskService.updateTask(task.id, {
        title,
        description,
        relatedTo: finalRelatedTo,
        points,
        assignedTo,
        assignedToAvatar: getUserAvatar(assignedTo, allUsers, assignedTo),
        status,
        milestone: milestone || "New",
        priority: priority === "Priority" ? "Normal" : (priority as TaskPriority),
        priorityIcon,
        labels: parsedLabels,
        startDate: startDate || "-",
        deadline: deadline || "30-06-2026",
        isRecurring,
        branchId: task.branchId || activeBranchId || user?.branchId || undefined,
        branchName: task.branchName || user?.branchName || undefined,
        subBranchId: task.subBranchId || activeSubBranchId || (user as any)?.subBranchId || undefined,
        subBranchName: task.subBranchName || undefined,
        companyId: task.companyId || activeCompanyId || user?.companyId || "tech",
      })

      onTaskUpdated(updated)
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  
  __ctrl = { isOpen, task, onClose, onTaskUpdated, onDeleteTask, user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, canPerformAction, canDeleteTask, teamMembers, setTeamMembers, allUsers, setAllUsers, title, setTitle, description, setDescription, selectedRelatedTo, setSelectedRelatedTo, customRelatedInput, setCustomRelatedInput, availableRelatedOptions, setAvailableRelatedOptions, points, setPoints, assignedTo, setAssignedTo, status, setStatus, priority, setPriority, milestone, setMilestone, labels, setLabels, startDate, setStartDate, deadline, setDeadline, isRecurring, setIsRecurring, isSubmitting, setIsSubmitting, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        <EditTaskModalSection1 ctrl={__ctrl} />

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {canDeleteTask && onDeleteTask && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTask(task.id)
                  onClose()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                title="Delete Task"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            )}

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
              onClick={handleSave}
              className="flex items-center gap-1 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm font-semibold"
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
