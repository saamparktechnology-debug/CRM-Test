"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckSquare, Clock, Calendar, DollarSign, Plus, Edit2, 
  Trash2, Download, Search, CheckCircle2, MoreHorizontal,
  FileText, PieChart, Users, AlertCircle, TrendingUp, Bell, Grid, Briefcase, Monitor,
  ShieldCheck, Lock, Unlock, PhoneCall, Check, ExternalLink, UserCheck, Building2, MapPin
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useTimerStore } from "@/store/useTimerStore"
import { Button } from "@/components/ui/Button"
import { Widget } from "./components/Widget"
import { KPICard } from "./components/KPICard"
import { DonutChart } from "./components/DonutChart"
import { BarChartMockup } from "./components/BarChartMockup"
import { getStoredUserAccountsAsync, getUsers, getUserAvatar } from "../users/services/userService"
import { taskService } from "../tasks/services/taskService"
import { getProjects } from "../projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "../tasks/types"
import { Project } from "../projects/types"
import { filterGlobalDeletedItems, fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { normalizeRole } from "@/store/usePermissionStore"
import { ClientDashboard } from "./components/ClientDashboard"
import { SuperAdminDashboard } from "./components/SuperAdminDashboard"
import { DashboardSection1 } from "@/features/dashboard/components/dashboard-sections/DashboardSection1"
import { DashboardSection2 } from "@/features/dashboard/components/dashboard-sections/DashboardSection2"
import { createDashboardAction20 } from "@/features/dashboard/hooks/dashboard-hooks/createDashboardAction20.hooks"
import { runDashboardEffect50 } from "@/features/dashboard/hooks/dashboard-hooks/runDashboardEffect50.hooks"




export default function DashboardMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { activeCompanyId, activeBranchId, activeSubBranchId, companies, branches, subBranches, user } = useAuthStore()
  if (!user) return null

  // If logged in as Client, display dedicated Client Portal Dashboard
  if (user.role === "Clients" || (user.role as string) === "Client") {
    return <ClientDashboard />
  }

  // Super Admin & Admin Dashboard matching master visual blueprint
  if (user.role === "Super Admin" || user.role === "Admin") {
    return <SuperAdminDashboard />
  }

  const { 
    isClockedIn, 
    isOnBreak, 
    workMode, 
    secondsElapsed, 
    clockIn, 
    clockOut, 
    startBreak, 
    endBreak, 
    setWorkMode, 
    tick 
  } = useTimerStore()

  // Real-time tick effect for team member shift
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isClockedIn) {
      interval = setInterval(() => tick(), 1000)
    }
    return () => clearInterval(interval)
  }, [isClockedIn, tick])

  // Real registered users list from user management service
  const [realUsers, setRealUsers] = React.useState<any[]>([])
  const [selectedUserEmail, setSelectedUserEmail] = React.useState<string>("")
  
  // Interactive state for To-do and Notes (persisted in localStorage)
  const [todos, setTodos] = React.useState<{ id: number; text: string; done: boolean }[]>([])
  const [newTodo, setNewTodo] = React.useState("")
  const [noteText, setNoteText] = React.useState("")
  const [activeTasksCount, setActiveTasksCount] = React.useState<number>(0)

  const [liveTasks, setLiveTasks] = React.useState<Task[]>([])
  const [liveProjects, setLiveProjects] = React.useState<Project[]>([])
  const [liveLeads, setLiveLeads] = React.useState<any[]>([])
  const [liveInvoices, setLiveInvoices] = React.useState<InvoiceItem[]>([])
  const [liveOrders, setLiveOrders] = React.useState<OrderItem[]>([])
  const [liveExpenses, setLiveExpenses] = React.useState<any[]>([])

  const targetComp = activeCompanyId || user.companyId || "tech"
  const targetBranch = activeBranchId || user.branchId || null
  const targetSubBranch = activeSubBranchId || user.subBranchId || null

  const refreshLiveDashboard: any = createDashboardAction20(() => __ctrlRef.current);

  React.useEffect(() => runDashboardEffect50(() => __ctrlRef.current), [refreshLiveDashboard]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const userKey = user?.email ? user.email.toLowerCase().trim() : "default"
      const savedTodos = localStorage.getItem(`saampark_todos_${userKey}`)
      if (savedTodos) {
        try { setTodos(JSON.parse(savedTodos)) } catch {}
      } else {
        setTodos([
          { id: 1, text: "Set roles and permissions for team members", done: false },
          { id: 2, text: "Setup notifications for tasks", done: false },
          { id: 3, text: "Discuss project deliverables with team", done: false },
        ])
      }

      const savedNote = localStorage.getItem(`saampark_sticky_note_${userKey}`)
      if (savedNote !== null) {
        setNoteText(savedNote)
      } else {
        setNoteText("My quick notes here...")
      }
    }
  }, [user])

  // Save todos to localStorage when updated
  const updateTodos = (newTodos: typeof todos) => {
    setTodos(newTodos)
    if (typeof window !== "undefined" && user?.email) {
      const userKey = user.email.toLowerCase().trim()
      localStorage.setItem(`saampark_todos_${userKey}`, JSON.stringify(newTodos))
    }
  }

  // Save note to localStorage when updated
  const updateNoteText = (text: string) => {
    setNoteText(text)
    if (typeof window !== "undefined" && user?.email) {
      const userKey = user.email.toLowerCase().trim()
      localStorage.setItem(`saampark_sticky_note_${userKey}`, text)
    }
  }

  // Timer tick interval
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isClockedIn) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isClockedIn, tick])

  // Format seconds to HH:MM:SS
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0")
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  const normRole = normalizeRole(user.role)
  const currentCompanyObj = companies.find(c => c.id === targetComp || c.slug === targetComp) || companies[0] || { name: "SAAMPARK Technology", logo: "💻" }
  const currentBranchObj = branches.find(b => b.id === targetBranch)

  // Find currently selected user object for attendance history
  const selectedUserObj = realUsers.find((u) => u.email === selectedUserEmail) || realUsers[0] || user

  // =========================================================================
  // DYNAMIC METRICS CALCULATION (FOR ACTIVE COMPANY & BRANCH)
  // =========================================================================
  const openProjectsCount = liveProjects.filter(p => String(p.status) === "In Progress" || String(p.status) === "Open" || String(p.status) === "Pending").length
  const completedProjectsCount = liveProjects.filter(p => String(p.status) === "Completed" || String(p.status) === "Finished" || (p.progress || 0) >= 100).length
  const holdProjectsCount = liveProjects.filter(p => String(p.status) === "Hold" || String(p.status) === "On Hold").length
  const totalProjectsCount = liveProjects.length
  const averageProjectProgression = totalProjectsCount > 0 
    ? Math.round(liveProjects.reduce((acc, p) => acc + (p.progress || 0), 0) / totalProjectsCount) 
    : 0

  // Invoice breakdown
  const fullyPaidInvoices = liveInvoices.filter(i => {
    const s = String(i.status || "").toLowerCase().trim()
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
    const due = parseInt(String(i.due || "0").replace(/[^0-9]/g, "")) || 0
    return s === "fully paid" || s === "paid" || (due === 0 && rec > 0)
  })

  const partiallyPaidInvoices = liveInvoices.filter(i => {
    const s = String(i.status || "").toLowerCase().trim()
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
    const due = parseInt(String(i.due || "0").replace(/[^0-9]/g, "")) || 0
    if (s === "partially paid" || s === "partial" || s === "advance received") return true
    return rec > 0 && due > 0 && s !== "fully paid" && s !== "paid"
  })

  const unpaidInvoices = liveInvoices.filter(i => {
    const s = String(i.status || "").toLowerCase().trim()
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
    const due = parseInt(String(i.due || "0").replace(/[^0-9]/g, "")) || 0
    if (s === "not paid" || s === "payment pending" || s === "draft" || s === "unpaid" || s === "pending") return true
    return rec === 0 && due > 0 && !partiallyPaidInvoices.some(p => p.id === i.id) && !fullyPaidInvoices.some(p => p.id === i.id)
  })

  // All invoices with outstanding balance due
  const invoicesWithDue = liveInvoices.filter(i => (parseInt(String(i.due || "0").replace(/[^0-9]/g, "")) || 0) > 0)
  const invoicesWithDueCount = invoicesWithDue.length

  const totalInvoicedSum = liveInvoices.reduce((sum, i) => {
    const num = i.baseAmount || parseInt(String(i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
    return sum + num
  }, 0)

  const totalReceivedSum = liveInvoices.reduce((sum, i) => {
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
    if (rec > 0) return sum + rec
    const st = String(i.status || "").toLowerCase()
    if (st === "fully paid" || st === "paid") {
      return sum + (i.baseAmount || parseInt(String(i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0)
    }
    return sum
  }, 0)

  const fullyPaidReceivedSum = fullyPaidInvoices.reduce((sum, i) => {
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || parseInt(String(i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
    return sum + rec
  }, 0)

  const partialReceivedSum = partiallyPaidInvoices.reduce((sum, i) => {
    const rec = parseInt(String(i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
    return sum + rec
  }, 0)

  const totalDueSum = liveInvoices.reduce((sum, i) => {
    const num = parseInt(String(i.due || "0").replace(/[^0-9]/g, "")) || 0
    return sum + num
  }, 0)

  // Expense breakdown
  const totalExpenseSum = liveExpenses.reduce((sum, e) => {
    const num = e.amountNum || parseInt(String(e.amount || "0").replace(/[^0-9]/g, "")) || 0
    return sum + num
  }, 0)

  // Task status distribution
  const taskTodoCount = liveTasks.filter(t => String(t.status) === "To do" || String(t.status) === "Pending").length
  const taskInProgressCount = liveTasks.filter(t => String(t.status) === "In progress" || String(t.status) === "In Progress").length
  const taskReviewCount = liveTasks.filter(t => String(t.status) === "Review").length
  const taskDoneCount = liveTasks.filter(t => String(t.status) === "Done" || String(t.status) === "Completed").length

  const taskDonutData = [
    { label: "To do", value: taskTodoCount || 1, color: "#eab308" },
    { label: "In progress", value: taskInProgressCount || 0, color: "#3b82f6" },
    { label: "Review", value: taskReviewCount || 0, color: "#a855f7" },
    { label: "Done", value: taskDoneCount || 0, color: "#10b981" },
  ]

  const incomeVsExpenseData = [
    { label: "Revenue Collected", value: Math.max(1, totalReceivedSum), color: "#10b981" },
    { label: "Expenses Incurred", value: Math.max(0, totalExpenseSum), color: "#ec4899" },
  ]

  // =========================================================================
  // 1. CLIENT DASHBOARD VIEW (Rendered for Clients)
  // =========================================================================
  if (normRole === 'Clients') {
    const clientProjects = liveProjects.filter((p) => {
      const clientName = (p.client || "").toLowerCase().trim()
      const userName = (user.name || "").toLowerCase().trim()
      const userEmail = (user.email || "").toLowerCase().trim()
      return clientName === userName || clientName.includes(userName) || (userEmail && clientName.includes(userEmail))
    })

    const completedProjects = clientProjects.filter(p => (p.progress || 0) >= 100 || p.status === "Completed")

    return (
      <div className="space-y-6 pb-12 bg-background/50 min-h-screen p-4 sm:px-8 sm:py-6">
        {/* ── HEADER & COMPANY SCOPE BANNER ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <span className="text-base">{currentCompanyObj.logo || "🏢"}</span>
              <span>{currentCompanyObj.name}</span>
              {currentBranchObj && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                  <MapPin size={11} className="text-primary shrink-0" />
                  <span>{currentBranchObj.name}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your projects, invoices, support tickets, and communications for {currentCompanyObj.name}.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/feature/tickets">
              <Button variant="outline" size="sm" leftIcon={<AlertCircle size={14} />}>
                My Tickets
              </Button>
            </a>
            <a href="/feature/messages">
              <Button variant="primary" size="sm" leftIcon={<Bell size={14} />}>
                Message Team
              </Button>
            </a>
          </div>
        </div>

        {/* ── KPI CARDS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard icon={Grid} colorClass="bg-blue-500" value={`${clientProjects.length} Projects`} label="My Active Projects" />
          <KPICard icon={CheckCircle2} colorClass="bg-emerald-500" value={`${completedProjects.length} Done`} label="Completed Milestones" />
          <KPICard icon={AlertCircle} colorClass="bg-amber-500" value={`${liveInvoices.length} Invoices`} label="Billing Invoices" />
          <KPICard icon={FileText} colorClass="bg-indigo-500" value={`₹${totalReceivedSum.toLocaleString("en-IN")}`} label="Paid Total" />
        </div>

        {/* ── PROJECTS + QUICK ACTIONS ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Widget title="My Projects & Delivery Progress" icon={Grid} className="lg:col-span-2">
            <div className="space-y-4 pt-2">
              {clientProjects.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-xs">
                  <Grid size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p>No projects are currently assigned to your account in {currentCompanyObj.name}.</p>
                  <p className="mt-1">Contact your project manager to get started.</p>
                </div>
              ) : (
                clientProjects.slice(0, 5).map((p, i) => {
                  const pct = Math.min(100, Math.max(0, p.progress || 0))
                  const statusColor = pct >= 100 ? "bg-emerald-600" : pct >= 60 ? "bg-blue-600" : "bg-amber-500"
                  const badgeColor = pct >= 100 ? "bg-emerald-100 text-emerald-700" : pct >= 60 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  return (
                    <motion.div key={p.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      className="p-4 bg-surface border border-border/80 rounded-xl space-y-3 hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-foreground truncate">{p.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.client && <span>Client: <strong className="text-foreground">{p.client}</strong> · </span>}
                            {p.deadline && <span>Due: {p.deadline}</span>}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full shrink-0 ${badgeColor}`}>
                          {pct >= 100 ? "Completed" : `${pct}% Done`}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                          className={`h-full rounded-full ${statusColor}`} />
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </Widget>

          {/* Quick Actions */}
          <Widget title="Quick Actions" icon={TrendingUp}>
            <div className="space-y-2 pt-1">
              {[
                { label: "View My Projects", href: "/feature/projects", color: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-900/50", icon: Grid },
                { label: "My Support Tickets", href: "/feature/tickets", color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/50", icon: AlertCircle },
                { label: "Message Team", href: "/feature/messages", color: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200/50 dark:border-indigo-900/50", icon: Bell },
                { label: "View Invoices & Orders", href: "/feature/sales", color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-900/50", icon: DollarSign },
              ].map(({ label, href, color, icon: Icon }) => (
                <a key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:scale-[1.01] cursor-pointer ${color}`}>
                  <Icon size={14} />
                  {label}
                </a>
              ))}
            </div>
          </Widget>
        </div>
      </div>
    )
  }

  // =========================================================================
  // 2. STAFF / TEAM MEMBER DASHBOARD VIEW (Rendered for Teams)
  // =========================================================================
  if (normRole === 'Teams') {
    const normName = (user?.name || "").toLowerCase().trim()
    const normEmail = (user?.email || "").toLowerCase().trim()

    const myTasks = liveTasks.filter((t) => {
      const assigned = (t.assignedTo || "").toLowerCase().trim()
      const collab = (t.collaborators || "").toLowerCase().trim()
      return (
        assigned === normName ||
        assigned === normEmail ||
        (normName && assigned.includes(normName)) ||
        (collab && normName && collab.includes(normName))
      )
    })

    const myProjects = liveProjects.filter((p) => {
      const members = p.members || []
      return members.some((m: any) => {
        const mName = (m.name || "").toLowerCase().trim()
        const mEmail = (m.email || "").toLowerCase().trim()
        return mName === normName || mEmail === normEmail || (normName && mName.includes(normName))
      })
    })

    const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })

    return (
      <div className="space-y-6 pb-12 bg-background/50 min-h-screen p-4 sm:px-8 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
              <span className="text-base">{currentCompanyObj.logo || "🏢"}</span>
              <span>{currentCompanyObj.name}</span>
              {currentBranchObj && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                  <MapPin size={11} className="text-primary shrink-0" />
                  <span>{currentBranchObj.name}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hello, {user.name}! 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Your tasks, shift tracker, and project updates for {currentCompanyObj.name}.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <a href="/feature/tasks">
              <Button variant="outline" size="sm" leftIcon={<CheckSquare size={14} />}>My Tasks</Button>
            </a>
            <a href="/feature/messages">
              <Button variant="primary" size="sm" leftIcon={<Bell size={14} />}>Messages</Button>
            </a>
          </div>
        </div>

        {/* Shift Clock & KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isOnBreak ? "bg-amber-500 animate-ping" : (isClockedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400")
                }`} />
                <span className="text-xs font-bold text-foreground">
                  {isOnBreak ? "On Break ☕" : (isClockedIn ? "Active Shift 🟢" : "Shift Punch Card")}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                {workMode || "Office"}
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black font-mono text-foreground tracking-tight">
                {isClockedIn ? formatTime(secondsElapsed) : "00:00:00"}
              </div>
              {isClockedIn && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Net Working Time
                </span>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {!isClockedIn && (
                <div className="flex gap-1">
                  {(["Office", "Work From Home", "Field / Client Visit"] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setWorkMode(mode)}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer truncate ${
                        workMode === mode
                          ? "bg-blue-600 text-white border-blue-500 shadow-2xs"
                          : "bg-surface-subtle text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {mode === "Office" ? "🏢 Office" : mode === "Work From Home" ? "🏠 WFH" : "🚗 Field"}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                {isClockedIn && (
                  <button
                    type="button"
                    onClick={() => isOnBreak ? endBreak() : startBreak()}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isOnBreak
                        ? "bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-2xs"
                        : "bg-surface-subtle text-foreground border-border hover:bg-surface hover:border-slate-300"
                    }`}
                  >
                    {isOnBreak ? "▶️ Resume" : "☕ Break"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    const now = new Date()
                    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    const dateStr = now.toISOString().split("T")[0]
                    const compId = currentCompanyObj.id || "tech"

                    if (!isClockedIn) {
                      clockIn(workMode)
                      const stored = await fetchModuleDataFromDB<any[]>("timecards", [], "all").catch(() => [])
                      const newCard = {
                        id: `tc_${Date.now()}`,
                        userId: String(user.id),
                        memberName: user.name,
                        memberEmail: user.email,
                        memberRole: user.role,
                        memberAvatar: user.avatar || (user as any).avatarUrl,
                        companyId: compId,
                        branchName: currentBranchObj?.name || "Main HQ",
                        workMode: workMode || "Office",
                        inDate: dateStr,
                        inTime: timeStr,
                        durationSecs: 0,
                        status: "Active Shift",
                        notes: `Clocked in from team dashboard (${workMode})`
                      }
                      await saveModuleDataToDB("timecards", [newCard, ...stored], "all").catch(() => {})
                    } else {
                      clockOut()
                      const stored = await fetchModuleDataFromDB<any[]>("timecards", [], "all").catch(() => [])
                      const normEmail = user.email.toLowerCase().trim()
                      const updated = stored.map((tc: any) => {
                        if (tc.memberEmail?.toLowerCase().trim() === normEmail && (tc.status === "Active Shift" || tc.status === "On Break")) {
                          return {
                            ...tc,
                            outDate: dateStr,
                            outTime: timeStr,
                            durationSecs: secondsElapsed > 0 ? secondsElapsed : 28800,
                            status: "Completed",
                            notes: "Clocked out normally"
                          }
                        }
                        return tc
                      })
                      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
                    }
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-2xs ${
                    isClockedIn
                      ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                  }`}
                >
                  {isClockedIn ? "⏹️ Punch Out" : "▶️ Punch In Now"}
                </button>
              </div>
            </div>
          </div>

          <KPICard icon={CheckSquare} colorClass="bg-blue-500" value={`${myTasks.length} Tasks`} label="My Assigned Tasks" />
          <KPICard icon={Grid} colorClass="bg-indigo-500" value={`${myProjects.length} Projects`} label="My Active Projects" />
          <KPICard icon={CheckCircle2} colorClass="bg-emerald-500" value={`${myTasks.filter(t => t.status === "Done").length} Completed`} label="Tasks Finished" />
        </div>

        {/* Assigned Projects */}
        <Widget title="My Assigned Projects" icon={Grid}>
          <div className="space-y-3 pt-1">
            {myProjects.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">No projects assigned yet in this company/branch.</p>
            ) : (
              myProjects.map((p) => (
                <div key={p.id} className="p-3 bg-surface border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-foreground">{p.title}</h4>
                    <p className="text-[11px] text-muted-foreground">Client: {p.client} · Deadline: {p.deadline}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {p.progress}% Done
                  </span>
                </div>
              ))
            )}
          </div>
        </Widget>
      </div>
    )
  }

  // =========================================================================
  // 3. COMPANY ADMIN / SUPER ADMIN DASHBOARD VIEW (100% DYNAMIC & ISOLATED)
  // =========================================================================
  
  __ctrl = { activeCompanyId, activeBranchId, activeSubBranchId, companies, branches, subBranches, user, isClockedIn, isOnBreak, workMode, secondsElapsed, clockIn, clockOut, startBreak, endBreak, setWorkMode, tick, realUsers, setRealUsers, selectedUserEmail, setSelectedUserEmail, todos, setTodos, newTodo, setNewTodo, noteText, setNoteText, activeTasksCount, setActiveTasksCount, liveTasks, setLiveTasks, liveProjects, setLiveProjects, liveLeads, setLiveLeads, liveInvoices, setLiveInvoices, liveOrders, setLiveOrders, liveExpenses, setLiveExpenses, targetComp, targetBranch, targetSubBranch, refreshLiveDashboard, updateTodos, updateNoteText, formatTime, normRole, currentCompanyObj, currentBranchObj, selectedUserObj, openProjectsCount, completedProjectsCount, holdProjectsCount, totalProjectsCount, averageProjectProgression, fullyPaidInvoices, partiallyPaidInvoices, unpaidInvoices, invoicesWithDue, invoicesWithDueCount, totalInvoicedSum, totalReceivedSum, fullyPaidReceivedSum, partialReceivedSum, totalDueSum, totalExpenseSum, taskTodoCount, taskInProgressCount, taskReviewCount, taskDoneCount, taskDonutData, incomeVsExpenseData };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-6 pb-12 bg-background/50 min-h-screen -mx-4 -mt-4 p-4 sm:px-8 sm:py-6 rounded-tl-xl">
      
      <DashboardSection1 ctrl={__ctrl} />

      <DashboardSection2 ctrl={__ctrl} />

      {/* --- ROW 4: OPEN PROJECTS, TASKS, STICKY NOTE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
           {/* Open Projects List */}
           <Widget title={`Open Projects in ${currentCompanyObj.name}`} icon={Grid}>
              <div className="space-y-4 pt-2">
                {liveProjects.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">No projects registered yet for {currentCompanyObj.name}.</p>
                ) : (
                  liveProjects.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} className="border-b border-border/40 pb-4 last:border-0 group">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold text-foreground">{p.title}</p>
                        <p className="text-xs font-bold text-blue-600">{p.progress || 0}%</p>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${p.progress || 0}%` }}
                          transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                          className="h-full bg-blue-500 rounded-full" 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Client: {p.client} | Deadline: {p.deadline}</p>
                    </div>
                  ))
                )}
              </div>
           </Widget>

           {/* My Tasks */}
           <Widget title="Recent Tasks" icon={CheckSquare}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] text-muted-foreground border-b border-border/40 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Assigned To</th>
                      <th className="px-3 py-2 text-right">Deadline</th>
                      <th className="px-3 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {liveTasks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-muted-foreground">
                          No tasks recorded for this company.
                        </td>
                      </tr>
                    ) : (
                      liveTasks.slice(0, 5).map((t, i) => (
                        <tr key={t.id || i} className="hover:bg-surface-hover/20 transition-colors">
                          <td className="px-3 py-2.5 font-bold text-foreground">{t.title}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <img
                                src={getUserAvatar(t.assignedTo, undefined, t.assignedTo)}
                                alt={t.assignedTo || "User"}
                                className="w-5 h-5 rounded-full border border-border object-cover shrink-0"
                              />
                              <span className="font-medium text-foreground">{t.assignedTo || "Unassigned"}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">{t.deadline || "-"}</td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded text-white ${
                              t.status === "Done" ? "bg-emerald-500" : "bg-blue-500"
                            }`}>
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
           </Widget>
        </div>

        {/* Sticky Note */}
        <div className="space-y-6">
          <Widget title="Personal Sticky Note" icon={FileText} className="h-full min-h-[380px] !bg-yellow-200/50 dark:!bg-yellow-900/30 border-yellow-300">
            <textarea 
              value={noteText}
              onChange={e => updateNoteText(e.target.value)}
              className="w-full h-full bg-transparent text-yellow-900 dark:text-yellow-100 border-none rounded-none p-0 text-xs focus:outline-none focus:ring-0 resize-none leading-relaxed font-sans"
              placeholder="My quick scratchpad notes..."
            />
          </Widget>
        </div>
        
      </div>

    </div>
  )
}
