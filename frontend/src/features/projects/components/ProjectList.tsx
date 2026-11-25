import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  FileSpreadsheet,
  Printer,
  Search,
  ArrowDown,
  Layout,
  Pencil,
  X,
  User,
  MapPin,
  Info,
  Receipt,
  Megaphone,
  Clock,
} from "lucide-react"
import { Project } from "../types"
import { ProjectFiltersDropdown } from "./ProjectFiltersDropdown"
import { ProjectCompletionModal } from "./ProjectCompletionModal"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getUserAvatar } from "@/features/users/services/userService"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { formatDisplayDate } from "@/lib/utils"
import { ProjectListSection1 } from "@/features/projects/components/projectlist-sections/ProjectListSection1"
import { ProjectListSection2 } from "@/features/projects/components/projectlist-sections/ProjectListSection2"


import { type ProjectListProps } from "@/features/projects/components/projectlist-sections/ProjectListHelpers"
export * from "@/features/projects/components/projectlist-sections/ProjectListHelpers"

export function ProjectList({
  projects,
  hasMarketingAccess,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProject,
  onSelectProjectDetail,
}: ProjectListProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user } = useAuthStore()
  const { canPerformAction, canAccessModule, isModuleAllowed } = usePermissionStore()

  const isSuperAdmin = (user?.role || "").toLowerCase().includes("super")
  const isMarketingAllowed = isSuperAdmin || (hasMarketingAccess !== undefined ? hasMarketingAccess : (typeof canAccessModule === 'function' ? canAccessModule(user, "Digital Marketing") : (typeof isModuleAllowed === 'function' ? isModuleAllowed(user, "Digital Marketing") : true)))

  const canAddProject = typeof canPerformAction === 'function' ? canPerformAction(user, "Projects", "add") : true
  const canEditProject = typeof canPerformAction === 'function' ? canPerformAction(user, "Projects", "edit") : true
  const canDeleteProject = typeof canPerformAction === 'function' ? canPerformAction(user, "Projects", "delete") : true

  const [activeFilter, setActiveFilter] = React.useState("All projects")

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const filterParam = params.get("filter") || params.get("status")
    if (filterParam) {
      setActiveFilter(filterParam)
    }
  }, [])
  const [categoryFilter, setCategoryFilter] = React.useState<"all" | "software" | "marketing">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = React.useState(false)
  const [completionProject, setCompletionProject] = React.useState<Project | null>(null)

  const isMarketingProject = (p: any) => {
    if (!p) return false
    const cat = String(p.category || "").toLowerCase()
    const pTitle = String(p.title || "").toLowerCase()
    const isTech = cat.includes("website") || cat.includes("software") || cat.includes("app") || cat.includes("android") || cat.includes("ios") || pTitle.includes("cab booking") || pTitle.includes("website") || pTitle.includes("app")
    if (isTech) return false
    const pLabels = Array.isArray(p.labels) ? p.labels : []
    return p.projectType === "Digital Marketing Campaign" ||
      Boolean(p.marketingPackage?.enabled) ||
      pLabels.includes("Digital Marketing") ||
      cat.includes("marketing")
  }

  const softwareProjectsCount = (Array.isArray(projects) ? projects : []).filter(p => !isMarketingProject(p)).length
  const marketingProjectsCount = (Array.isArray(projects) ? projects : []).filter(p => isMarketingProject(p)).length

  // Filtering projects based on active filter pill / dropdown & search query
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p) => {
    if (!p) return false
    const q = (searchQuery || "").toLowerCase().trim()
    const pTitle = String(p.title || "").toLowerCase()
    const pClient = String(p.client || "").toLowerCase()
    const pId = String(p.id || "").toLowerCase()

    const matchesSearch = !q || pTitle.includes(q) || pClient.includes(q) || pId.includes(q)
    const pLabels = Array.isArray(p.labels) ? p.labels : []

    const isMarketing = isMarketingProject(p)
    if (categoryFilter === "software" && isMarketing) return false
    if (categoryFilter === "marketing" && !isMarketing) return false

    if (activeFilter === "Unassigned") return matchesSearch && (p.status === "Unassigned" || !Array.isArray(p.members) || p.members.length === 0)
    if (activeFilter === "Digital Marketing") {
      return matchesSearch && isMarketing
    }
    if (activeFilter === "Completed") return matchesSearch && (p.status === "Completed" || p.status === "Finished")
    if (activeFilter === "High Priority") return matchesSearch && (pLabels.includes("Urgent") || pLabels.includes("High"))
    if (activeFilter === "Open projects") return matchesSearch && (p.status === "Open" || p.status === "In Progress" || p.status === "Payment Pending")
    if (activeFilter === "Upcoming") return matchesSearch && (p.status === "Open" || p.status === "Hold" || p.status === "Payment Pending")

    return matchesSearch
  })

  // Excel Export
  const handleExportExcel = () => {
    exportToExcel({
      filename: "SAAMPARK_Projects",
      title: "Projects Report",
      subtitle: activeFilter || "All Projects",
      headers: ["#", "Title", "Client", "Price", "Start Date", "Deadline", "Progress", "Status"],
      rows: filteredProjects.map((p, idx) => [
        idx + 1,
        p.title,
        p.client,
        p.price,
        p.startDate,
        p.deadline,
        `${p.progress}%`,
        p.status,
      ]),
    })
  }

  // Print Action (PDF Report)
  const handlePrint = () => {
    printPDFReport({
      title: "Projects Report",
      subtitle: activeFilter || "All Projects",
      headers: ["#", "Title", "Client", "Price", "Start Date", "Deadline", "Progress", "Status"],
      rows: filteredProjects.map((p, idx) => [
        idx + 1,
        p.title,
        p.client,
        p.price,
        p.startDate,
        p.deadline,
        `${p.progress}%`,
        p.status,
      ]),
    })
  }

  
  __ctrl = { projects, hasMarketingAccess, onOpenAddModal, onOpenEditModal, onDeleteProject, onSelectProjectDetail, user, canPerformAction, canAccessModule, isModuleAllowed, isSuperAdmin, isMarketingAllowed, canAddProject, canEditProject, canDeleteProject, activeFilter, setActiveFilter, categoryFilter, setCategoryFilter, searchQuery, setSearchQuery, isFiltersDropdownOpen, setIsFiltersDropdownOpen, completionProject, setCompletionProject, isMarketingProject, softwareProjectsCount, marketingProjectsCount, filteredProjects, handleExportExcel, handlePrint };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-4">
      <ProjectListSection2 ctrl={__ctrl} />

      {/* ---------------- MAIN DATA TABLE (Image 1) ---------------- */}
      <div className="table-3d-wrapper rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-bold bg-muted/40 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <ArrowDown size={12} className="text-zinc-500" />
                    <span>Client</span>
                  </div>
                </th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Assigned Team</th>
                <th className="py-3 px-4">Start date</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4 w-32">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <ProjectListSection1 ctrl={__ctrl} />
          </table>
        </div>
      </div>

      {/* DUAL CONFIRMATION PROJECT COMPLETION MODAL */}
      {completionProject && (
        <ProjectCompletionModal
          isOpen={Boolean(completionProject)}
          project={completionProject}
          onClose={() => setCompletionProject(null)}
          onConfirmComplete={async (completedData) => {
            const { updateProject } = await import("../services/projectService")
            const { sendProjectCompletionEmailNotification } = await import("@/services/emailNotificationService")

            const updated = await updateProject(completionProject.id, {
              status: "Completed",
              progress: 100,
              completedAt: new Date().toISOString(),
              countdownStartDate: completedData.countdownStartDate,
              countdownEndDate: completedData.countdownEndDate,
              planDuration: completedData.planDuration,
              planType: completedData.planType as any,
              firstPostDate: completedData.firstPostDate,
              clientEmail: completedData.clientEmail,
            })

            completionProject.status = "Completed"
            completionProject.progress = 100
            ;(completionProject as any).countdownEndDate = completedData.countdownEndDate
            ;(completionProject as any).countdownStartDate = completedData.countdownStartDate
            ;(completionProject as any).firstPostDate = completedData.firstPostDate

            if (completedData.notifyClient && completedData.clientEmail) {
              await sendProjectCompletionEmailNotification(
                updated,
                completedData.clientEmail,
                completionProject.client,
                {
                  planType: completedData.planType,
                  countdownDuration: completedData.planDuration,
                  countdownStartDate: completedData.countdownStartDate,
                  countdownEndDate: completedData.countdownEndDate,
                  countdownNotice: completedData.planType === "digital_marketing"
                    ? (completedData.firstPostDate 
                        ? `Campaign timeline started from 1st post on ${completedData.firstPostDate} and expires on ${completedData.countdownEndDate}.`
                        : "Campaign countdown paused until first creative post goes live.")
                    : `Your service & hosting countdown started today (${new Date().toLocaleDateString("en-IN")}) and remains active until ${completedData.countdownEndDate}.`,
                }
              )
            }
          }}
        />
      )}

    </div>
  )
}
