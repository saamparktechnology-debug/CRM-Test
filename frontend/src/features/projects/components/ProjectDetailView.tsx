"use client"

import * as React from "react"
import {
  ArrowLeft,
  Star,
  Clock,
  Settings,
  Zap,
  Play,
  Pause,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Mail,
  X,
  MoreVertical,
  Layers,
  CheckCircle2,
  Code2,
  Database,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  FileText,
  Printer,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Check,
  User as UserIcon,
  Trash2,
  Download,
  CreditCard,
  Briefcase,
  Megaphone,
  Video,
  Image as ImageIcon,
  CheckSquare,
  Eye,
  FileCheck,
  Users,
  MapPin,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Project, ProjectMilestone, isMarketingProject } from "../types"
import { addOrUpdateProjectMilestone } from "../services/projectService"
import { useAuthStore } from "@/store/useAuthStore"
import { getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, addInvoice, generateInvoiceNumber, updateInvoiceStatus, InvoiceItem, InvoiceStatus } from "@/features/invoice/services/invoiceService"
import { taskService } from "@/features/tasks/services/taskService"
import { Task, TaskPriority, TaskStatus, getTaskCountdownChip } from "@/features/tasks/types"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { printPDFReport, exportToExcel } from "@/lib/exportUtils"
import { formatDisplayDate } from "@/lib/utils"
import { OfficialQuotationDocument } from "@/features/quotations/components/OfficialQuotationDocument"
import { OfficialEstimateDocument } from "@/features/estimates/components/OfficialEstimateDocument"
import { ProjectCompletionModal } from "./ProjectCompletionModal"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { ProjectDetailViewSection1 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection1"
import { ProjectDetailViewSection2 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection2"
import { ProjectDetailViewSection3 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection3"
import { ProjectDetailViewSection4 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection4"
import { ProjectDetailViewSection5 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection5"
import { ProjectDetailViewSection6 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection6"
import { createProjectDetailViewHandler1 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler1.hooks"
import { createProjectDetailViewHandler2 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler2.hooks"
import { createProjectDetailViewHandler3 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler3.hooks"
import { createProjectDetailViewHandler4 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler4.hooks"
import { createProjectDetailViewHandler5 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler5.hooks"
import { createProjectDetailViewHandler6 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler6.hooks"


import { type ProjectDetailViewProps, DONUT_COLORS } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"
export * from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"
import { createProjectDetailViewAction20 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction20.hooks"
import { createProjectDetailViewAction21 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction21.hooks"
import { createProjectDetailViewAction22 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction22.hooks"
import { computeProjectDetailViewMemo50 } from "@/features/projects/hooks/projectdetailview-hooks/computeProjectDetailViewMemo50.hooks"
import { createProjectDetailViewFn51 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewFn51.hooks"
import { createProjectDetailViewFn52 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewFn52.hooks"
import { createProjectDetailViewFn53 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewFn53.hooks"



export function ProjectDetailView({
  projects,
  selectedProject,
  initialTab = "Overview",
  hasMarketingAccess,
  onSelectProject,
  onBackToTable,
  onOpenEditModal,
}: ProjectDetailViewProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user } = useAuthStore()

  const roleNorm = String(user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleNorm === "super admin" || roleNorm.includes("super")
  const isAdmin = roleNorm === "super admin" || roleNorm === "admin" || roleNorm.includes("admin")
  const isClient = roleNorm === "clients" || roleNorm === "client" || roleNorm.includes("client")
  const isMarketingAllowed = isSuperAdmin || (hasMarketingAccess !== undefined ? hasMarketingAccess : true)

  const isAssignedTeamMember = React.useMemo(() => {
    if (!user || !selectedProject) return false
    const uId = String(user.id || "").toLowerCase().trim()
    const uEmail = (user.email || "").toLowerCase().trim()
    const uName = (user.name || "").toLowerCase().trim()

    const creatorId = String((selectedProject as any).createdById || "").toLowerCase().trim()
    const creatorEmail = String((selectedProject as any).createdByEmail || "").toLowerCase().trim()
    if (uId && creatorId === uId) return true
    if (uEmail && creatorEmail === uEmail) return true

    const members = Array.isArray(selectedProject.members) ? selectedProject.members : []
    const isMember = members.some((m: any) => {
      if (!m) return false
      const mId = String(typeof m === "string" ? "" : m.id || "").toLowerCase().trim()
      const mEmail = String(typeof m === "string" ? "" : m.email || "").toLowerCase().trim()
      const mName = String(typeof m === "string" ? m : m.name || "").toLowerCase().trim()
      return (uId && mId === uId) || (uEmail && mEmail === uEmail) || (uName && mName === uName)
    })
    if (isMember) return true

    const lead = String((selectedProject as any).lead || (selectedProject as any).developer || "").toLowerCase().trim()
    if (uName && (lead === uName || lead.includes(uName))) return true

    return false
  }, [user, selectedProject])

  const isSelectedProjectMarketing = isMarketingProject(selectedProject)
  const canManageProgress = isAdmin || isAssignedTeamMember
  const [activeTab, setActiveTab] = React.useState(() => {
    if (initialTab && initialTab !== "Overview") {
      if ((initialTab === "Digital Marketing Retainer" || initialTab === "Digital Marketing (Form 9)") && (!isMarketingAllowed || !isSelectedProjectMarketing)) return "Overview"
      return initialTab === "Digital Marketing (Form 9)" ? "Digital Marketing Retainer" : initialTab
    }
    if (isMarketingAllowed && isSelectedProjectMarketing) {
      return "Digital Marketing Retainer"
    }
    return "Overview"
  })
  const [isStarred, setIsStarred] = React.useState(selectedProject.starred || false)
  const [isTimerRunning, setIsTimerRunning] = React.useState(false)
  const [timerSeconds, setTimerSeconds] = React.useState(0)
  const [leftSearch, setLeftSearch] = React.useState("")
  const [leftFilter, setLeftFilter] = React.useState("All")
  const [currentPage, setCurrentPage] = React.useState(1)

  // Developer / Team Member Progress Update State
  const [isUpdateProgressModalOpen, setIsUpdateProgressModalOpen] = React.useState(false)
  const [progressValue, setProgressValue] = React.useState<number>(selectedProject.progress || 0)
  const [statusValue, setStatusValue] = React.useState<string>(selectedProject.status || "Open")
  const [progressLogNote, setProgressLogNote] = React.useState<string>("")
  const [isSavingProgress, setIsSavingProgress] = React.useState(false)

  React.useEffect(() => {
    if (selectedProject) {
      setProgressValue(selectedProject.progress || 0)
      setStatusValue(selectedProject.status || "Open")
    }
  }, [selectedProject])

  const handleSaveProgress: any = createProjectDetailViewAction20(() => __ctrlRef.current);

  // Developer Milestone Add/Update State
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = React.useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = React.useState<string | null>(null)
  const [msTitle, setMsTitle] = React.useState("")
  const [msStage, setMsStage] = React.useState<ProjectMilestone["stage"]>("Frontend")
  const [msStatus, setMsStatus] = React.useState<ProjectMilestone["status"]>("Completed")
  const [msNotes, setMsNotes] = React.useState("")
  const [msCredentials, setMsCredentials] = React.useState("")
  const [isSavingMilestone, setIsSavingMilestone] = React.useState(false)

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, "0")
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0")
    const secs = (totalSec % 60).toString().padStart(2, "0")
    return `${hrs}:${mins}:${secs}`
  }

  // Left sidebar filtering
  const filteredProjects = (Array.isArray(projects) ? projects : []).filter((p) => {
    if (!p) return false
    const q = (leftSearch || "").toLowerCase().trim()
    const pTitle = String(p.title || "").toLowerCase()
    const pClient = String(p.client || "").toLowerCase()
    const matchesSearch = !q || pTitle.includes(q) || pClient.includes(q)
    const pLabels = Array.isArray(p.labels) ? p.labels : []
    if (leftFilter === "Completed") return matchesSearch && p.status === "Completed"
    if (leftFilter === "High Priority") return matchesSearch && pLabels.includes("Urgent")
    return matchesSearch
  })

  // Chart data for task breakdown
  const taskData = [
    { name: "To do", value: selectedProject.taskBreakdown?.todo || 2, color: DONUT_COLORS.todo },
    { name: "In progress", value: selectedProject.taskBreakdown?.inProgress || 4, color: DONUT_COLORS.inProgress },
    { name: "Review", value: selectedProject.taskBreakdown?.review || 1, color: DONUT_COLORS.review },
    { name: "Done", value: selectedProject.taskBreakdown?.done || 3, color: DONUT_COLORS.done },
  ]

  const navTabs: any = React.useMemo(() => computeProjectDetailViewMemo50({ isClient, isSelectedProjectMarketing, isMarketingAllowed, isAdmin }), [isClient, isAdmin, isMarketingAllowed, isSelectedProjectMarketing]);

  // Commercial Origin Documents & Form 9 State
  const [viewingQuotation, setViewingQuotation] = React.useState<any | null>(null)
  const [viewingEstimate, setViewingEstimate] = React.useState<any | null>(null)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = React.useState(false)
  const [allQuotations, setAllQuotations] = React.useState<any[]>([])
  const [allEstimates, setAllEstimates] = React.useState<any[]>([])
  const [marketingPkgLocal, setMarketingPkgLocal] = React.useState<DigitalMarketingPackage | null>(null)
  const [isSavingMarketingPkg, setIsSavingMarketingPkg] = React.useState(false)

  const loadLinkedDocs = React.useCallback(async () => {
    try {
      const [quotes, ests] = await Promise.all([
        fetchModuleDataFromDB<any[]>("quotations", [], selectedProject.companyId || "all").catch(() => []),
        fetchModuleDataFromDB<any[]>("estimates", [], selectedProject.companyId || "all").catch(() => []),
      ])
      setAllQuotations(quotes || [])
      setAllEstimates(ests || [])
    } catch (err) {
      console.warn("Failed to load linked documents:", err)
    }
  }, [selectedProject.companyId])

  React.useEffect(() => {
    loadLinkedDocs()
  }, [loadLinkedDocs])

  const linkedQuotation = React.useMemo(() => {
    if (selectedProject.quotationData) return selectedProject.quotationData
    if (selectedProject.quotationId) {
      const m = allQuotations.find(q => q.id === selectedProject.quotationId || q.number === selectedProject.quotationId)
      if (m) return m
    }
    if (selectedProject.quotationNumber) {
      const m = allQuotations.find(q => q.number === selectedProject.quotationNumber || q.id === selectedProject.quotationNumber)
      if (m) return m
    }
    const pLabels = Array.isArray(selectedProject.labels) ? selectedProject.labels : []
    const matchFromLabel = allQuotations.find(q => pLabels.includes(q.number) || selectedProject.title?.includes(q.number) || selectedProject.description?.includes(q.number))
    if (matchFromLabel) return matchFromLabel
    const matchByClient = allQuotations.find(q => (q.customer || q.client) && (q.customer?.toLowerCase().trim() === selectedProject.client?.toLowerCase().trim()))
    return matchByClient || null
  }, [selectedProject, allQuotations])

  const linkedEstimate = React.useMemo(() => {
    if (selectedProject.estimateData) return selectedProject.estimateData
    if (selectedProject.estimateId) {
      const m = allEstimates.find(e => e.id === selectedProject.estimateId || e.estimateNumber === selectedProject.estimateId)
      if (m) return m
    }
    if (selectedProject.estimateNumber) {
      const m = allEstimates.find(e => e.estimateNumber === selectedProject.estimateNumber || e.id === selectedProject.estimateNumber)
      if (m) return m
    }
    const pLabels = Array.isArray(selectedProject.labels) ? selectedProject.labels : []
    const matchFromLabel = allEstimates.find(e => pLabels.includes(e.estimateNumber) || selectedProject.title?.includes(e.estimateNumber) || selectedProject.description?.includes(e.estimateNumber))
    if (matchFromLabel) return matchFromLabel
    const matchByClient = allEstimates.find(e => e.client && (e.client.toLowerCase().trim() === selectedProject.client?.toLowerCase().trim()))
    return matchByClient || null
  }, [selectedProject, allEstimates])

  // Active Marketing Package
  const currentMarketingPkg = React.useMemo<DigitalMarketingPackage>(() => {
    if (marketingPkgLocal) return marketingPkgLocal
    if (selectedProject.marketingPackage) return selectedProject.marketingPackage
    if (linkedQuotation?.marketingPackage?.enabled) return linkedQuotation.marketingPackage
    if (linkedEstimate?.marketingPackage?.enabled) return linkedEstimate.marketingPackage
    return createDefaultMarketingPackage(selectedProject.title?.includes("Grow") ? selectedProject.title : "Grow - 2")
  }, [marketingPkgLocal, selectedProject, linkedQuotation, linkedEstimate])

  const handleSaveMarketingPackage: any = createProjectDetailViewFn51(() => __ctrlRef.current);

  // Initial Tab Sync
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab, selectedProject.id])

  // Invoices Sub-Module State
  const [projectInvoices, setProjectInvoices] = React.useState<InvoiceItem[]>([])
  const [isLoadingInvoices, setIsLoadingInvoices] = React.useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false)
  const [invAmount, setInvAmount] = React.useState("")
  const [invDate, setInvDate] = React.useState(new Date().toISOString().split("T")[0])
  const [invDueDate, setInvDueDate] = React.useState(selectedProject.deadline || "")
  const [invDescription, setInvDescription] = React.useState("")
  const [invGstRate, setInvGstRate] = React.useState(18)
  const [invStatus, setInvStatus] = React.useState<InvoiceStatus>("Payment Pending")
  const [isSavingInvoice, setIsSavingInvoice] = React.useState(false)

  // Tasks Sub-Module State
  const [projectTasks, setProjectTasks] = React.useState<Task[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = React.useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false)
  const [taskTitle, setTaskTitle] = React.useState("")
  const [taskDeadline, setTaskDeadline] = React.useState("")
  const [taskPriority, setTaskPriority] = React.useState<TaskPriority>("Normal")
  const [taskAssignedTo, setTaskAssignedTo] = React.useState("")
  const [isSavingTask, setIsSavingTask] = React.useState(false)

  // Expenses Sub-Module State
  const [projectExpenses, setProjectExpenses] = React.useState<any[]>([])
  const [isLoadingExpenses, setIsLoadingExpenses] = React.useState(false)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = React.useState(false)
  const [expTitle, setExpTitle] = React.useState("")
  const [expAmount, setExpAmount] = React.useState("")
  const [expCategory, setExpCategory] = React.useState("Direct Project Supply")
  const [expPayee, setExpPayee] = React.useState("")
  const [isSavingExpense, setIsSavingExpense] = React.useState(false)

  // ---------------- DATA LOADERS ----------------
  const loadProjectInvoices = React.useCallback(async () => {
    setIsLoadingInvoices(true)
    try {
      const comp = selectedProject.companyId || "tech"
      const all = await getInvoices(comp)
      const projTitleNorm = (selectedProject.title || "").toLowerCase().trim()
      const projIdNorm = (selectedProject.id || "").toLowerCase().trim()
      const clientNorm = (selectedProject.client || "").toLowerCase().trim()

      const matched = all.filter(inv => {
        const invProj = (inv.project || "").toLowerCase().trim()
        const invClient = (inv.client || "").toLowerCase().trim()
        return invProj === projTitleNorm || invProj === projIdNorm || (invClient === clientNorm && (invProj.includes(projTitleNorm) || !invProj))
      })
      setProjectInvoices(matched)
    } catch (err) {
      console.warn("Failed to load project invoices:", err)
    } finally {
      setIsLoadingInvoices(false)
    }
  }, [selectedProject.id, selectedProject.title, selectedProject.client, selectedProject.companyId])

  const loadProjectTasks = React.useCallback(async () => {
    setIsLoadingTasks(true)
    try {
      const comp = selectedProject.companyId || "tech"
      const all = await taskService.getTasks(comp)
      const projTitleNorm = (selectedProject.title || "").toLowerCase().trim()
      const projIdNorm = (selectedProject.id || "").toLowerCase().trim()

      const matched = all.filter(t => {
        const rel = (t.relatedTo || "").toLowerCase().trim()
        const pName = (t.projectName || "").toLowerCase().trim()
        const sId = (t.sourceId || "").toLowerCase().trim()
        return rel === projTitleNorm || pName === projTitleNorm || sId === projIdNorm
      })
      setProjectTasks(matched)
    } catch (err) {
      console.warn("Failed to load project tasks:", err)
    } finally {
      setIsLoadingTasks(false)
    }
  }, [selectedProject.id, selectedProject.title, selectedProject.companyId])

  const loadProjectExpenses = React.useCallback(async () => {
    setIsLoadingExpenses(true)
    try {
      const comp = selectedProject.companyId || "tech"
      const allExp = await fetchModuleDataFromDB<any[]>("expenses", [], comp).catch(() => [])
      const clean = filterGlobalDeletedItems(Array.isArray(allExp) ? allExp : [])
      const projTitleNorm = (selectedProject.title || "").toLowerCase().trim()
      const projIdNorm = (selectedProject.id || "").toLowerCase().trim()

      const matched = clean.filter(e => {
        const pId = (e.projectId || "").toLowerCase().trim()
        const pName = (e.projectName || "").toLowerCase().trim()
        return pId === projIdNorm || pName === projTitleNorm
      })
      setProjectExpenses(matched)
    } catch (err) {
      console.warn("Failed to load project expenses:", err)
    } finally {
      setIsLoadingExpenses(false)
    }
  }, [selectedProject.id, selectedProject.title, selectedProject.companyId])

  React.useEffect(() => {
    if (activeTab === "Invoices") {
      loadProjectInvoices()
    } else if (activeTab === "Tasks List" || activeTab === "Tasks Kanban") {
      loadProjectTasks()
    } else if (activeTab === "Expenses") {
      loadProjectExpenses()
    }
  }, [activeTab, loadProjectInvoices, loadProjectTasks, loadProjectExpenses])

  // ---------------- PROJECT -> INVOICE HANDLERS ----------------
  const handleOpenGenerateInvoice = () => {
    const rawDue = selectedProject.dueAmount !== undefined && selectedProject.dueAmount > 0
      ? String(selectedProject.dueAmount)
      : selectedProject.price.replace(/[^0-9]/g, "")
    setInvAmount(rawDue || "10000")
    setInvDate(new Date().toISOString().split("T")[0])
    setInvDueDate(selectedProject.deadline || "")
    setInvDescription(`Milestone Deliverable / Project Billing for "${selectedProject.title}"`)
    setInvGstRate(18)
    setInvStatus("Payment Pending")
    setIsInvoiceModalOpen(true)
  }

  const handleSaveProjectInvoice: any = createProjectDetailViewAction21(() => __ctrlRef.current);

  const handlePrintProjectInvoice = (inv: InvoiceItem) => {
    printPDFReport({
      title: `Tax Invoice - ${inv.id}`,
      subtitle: `Project: ${inv.project} | Client: ${inv.client}`,
      headers: ["Invoice #", "Bill Date", "Due Date", "Total Amount", "Paid", "Balance Due", "Status"],
      rows: [[inv.id, inv.billDate, inv.dueDate, inv.totalInvoiced, inv.paymentReceived, inv.due, inv.status]],
    })
  }

  const handleUpdateInvoiceRowStatus = async (invId: string, status: InvoiceStatus) => {
    try {
      const comp = selectedProject.companyId || "tech"
      await updateInvoiceStatus(invId, status, undefined, undefined, comp)
      await loadProjectInvoices()
    } catch (err) {
      console.error("Failed to update invoice status:", err)
    }
  }

  // ---------------- PROJECT -> TASK HANDLERS ----------------
  const handleSaveProjectTask: any = createProjectDetailViewFn52(() => __ctrlRef.current);

  const handleUpdateTaskRowStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const comp = selectedProject.companyId || "tech"
      await taskService.updateTask(taskId, { status: newStatus }, comp)
      await loadProjectTasks()
    } catch (err) {
      console.error("Failed to update task status:", err)
    }
  }

  // ---------------- PROJECT -> EXPENSE HANDLERS ----------------
  const handleSaveProjectExpense: any = createProjectDetailViewAction22(() => __ctrlRef.current);

  const handleSaveMilestone: any = createProjectDetailViewFn53(() => __ctrlRef.current);

  const openAddMilestone = (stagePreset?: ProjectMilestone["stage"]) => {
    setEditingMilestoneId(null)
    setMsStage(stagePreset || "Frontend")
    setMsTitle(stagePreset === "Frontend" ? "Frontend Done & UI Finalized" : stagePreset === "Backend" ? "Backend API & Database Done" : stagePreset === "Credentials" ? "Server & DB Credentials" : "")
    setMsStatus("Completed")
    setMsNotes("")
    setMsCredentials("")
    setIsMilestoneModalOpen(true)
  }

  const openEditMilestone = (ms: ProjectMilestone) => {
    setEditingMilestoneId(ms.id)
    setMsTitle(ms.title)
    setMsStage(ms.stage)
    setMsStatus(ms.status)
    setMsNotes(ms.notes || "")
    setMsCredentials(ms.credentials || "")
    setIsMilestoneModalOpen(true)
  }

  // Render Milestones List Component
  const renderMilestonesView: any = createProjectDetailViewHandler1(() => __ctrlRef.current);

  // ---------------- RENDER INVOICES TAB ----------------
  const renderInvoicesView: any = createProjectDetailViewHandler2(() => __ctrlRef.current);

  // ---------------- RENDER TASKS TAB ----------------
  const renderTasksListView: any = createProjectDetailViewHandler3(() => __ctrlRef.current);

  // ---------------- RENDER EXPENSES TAB ----------------
  const renderExpensesView: any = createProjectDetailViewHandler4(() => __ctrlRef.current);

  // Render Originating Commercial Documents (Quotation & Estimate)
  const renderCommercialOriginDocumentsCard: any = createProjectDetailViewHandler5(() => __ctrlRef.current);

  // Render Digital Marketing Workspace (Form No - 9)
  const renderDigitalMarketingView: any = createProjectDetailViewHandler6(() => __ctrlRef.current);

  
  __ctrl = { projects, selectedProject, initialTab, hasMarketingAccess, onSelectProject, onBackToTable, onOpenEditModal, user, roleNorm, isSuperAdmin, isAdmin, isClient, isMarketingAllowed, isAssignedTeamMember, isSelectedProjectMarketing, canManageProgress, activeTab, setActiveTab, isStarred, setIsStarred, isTimerRunning, setIsTimerRunning, timerSeconds, setTimerSeconds, leftSearch, setLeftSearch, leftFilter, setLeftFilter, currentPage, setCurrentPage, isUpdateProgressModalOpen, setIsUpdateProgressModalOpen, progressValue, setProgressValue, statusValue, setStatusValue, progressLogNote, setProgressLogNote, isSavingProgress, setIsSavingProgress, handleSaveProgress, isMilestoneModalOpen, setIsMilestoneModalOpen, editingMilestoneId, setEditingMilestoneId, msTitle, setMsTitle, msStage, setMsStage, msStatus, setMsStatus, msNotes, setMsNotes, msCredentials, setMsCredentials, isSavingMilestone, setIsSavingMilestone, formatTimer, filteredProjects, taskData, navTabs, viewingQuotation, setViewingQuotation, viewingEstimate, setViewingEstimate, isCompletionModalOpen, setIsCompletionModalOpen, allQuotations, setAllQuotations, allEstimates, setAllEstimates, marketingPkgLocal, setMarketingPkgLocal, isSavingMarketingPkg, setIsSavingMarketingPkg, loadLinkedDocs, linkedQuotation, linkedEstimate, currentMarketingPkg, handleSaveMarketingPackage, projectInvoices, setProjectInvoices, isLoadingInvoices, setIsLoadingInvoices, isInvoiceModalOpen, setIsInvoiceModalOpen, invAmount, setInvAmount, invDate, setInvDate, invDueDate, setInvDueDate, invDescription, setInvDescription, invGstRate, setInvGstRate, invStatus, setInvStatus, isSavingInvoice, setIsSavingInvoice, projectTasks, setProjectTasks, isLoadingTasks, setIsLoadingTasks, isTaskModalOpen, setIsTaskModalOpen, taskTitle, setTaskTitle, taskDeadline, setTaskDeadline, taskPriority, setTaskPriority, taskAssignedTo, setTaskAssignedTo, isSavingTask, setIsSavingTask, projectExpenses, setProjectExpenses, isLoadingExpenses, setIsLoadingExpenses, isExpenseModalOpen, setIsExpenseModalOpen, expTitle, setExpTitle, expAmount, setExpAmount, expCategory, setExpCategory, expPayee, setExpPayee, isSavingExpense, setIsSavingExpense, loadProjectInvoices, loadProjectTasks, loadProjectExpenses, handleOpenGenerateInvoice, handleSaveProjectInvoice, handlePrintProjectInvoice, handleUpdateInvoiceRowStatus, handleSaveProjectTask, handleUpdateTaskRowStatus, handleSaveProjectExpense, handleSaveMilestone, openAddMilestone, openEditMilestone, renderMilestonesView, renderInvoicesView, renderTasksListView, renderExpensesView, renderCommercialOriginDocumentsCard, renderDigitalMarketingView };
  __ctrlRef.current = __ctrl;
return (
    <div className="flex flex-col lg:flex-row gap-4 min-h-[85vh] bg-zinc-50 dark:bg-zinc-950 p-1 rounded-xl">
      
      <ProjectDetailViewSection3 ctrl={__ctrl} />
      <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
        
        <ProjectDetailViewSection2 ctrl={__ctrl} />
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <ProjectDetailViewSection1 ctrl={__ctrl} />
        </div>

      </div>

      <ProjectDetailViewSection4 ctrl={__ctrl} />

      <ProjectDetailViewSection5 ctrl={__ctrl} />

      <ProjectDetailViewSection6 ctrl={__ctrl} />

    </div>
  )
}
