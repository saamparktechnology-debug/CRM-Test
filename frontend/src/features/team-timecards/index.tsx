"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Clock, Plus, Search, Calendar, CheckCircle2, AlertCircle, 
  Users, Monitor, Building2, MapPin, X, Trash2, Edit2, Play, Square,
  Filter, Download, ChevronDown, Coffee, Briefcase, Home, Navigation,
  Printer, ShieldCheck, Check, Sparkles, AlertTriangle, ArrowUpRight
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, getCompanyFullName, isMatchingCompany } from "@/store/useAuthStore"
import { useTimerStore, WorkMode } from "@/store/useTimerStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import MonthlyAttendanceMatrix from "@/features/attendance/components/MonthlyAttendanceMatrix"
import { TimecardsSection1 } from "@/features/team-timecards/components/timecards-sections/TimecardsSection1"
import { createTimecardsHandler1 } from "@/features/team-timecards/hooks/timecards-hooks/createTimecardsHandler1.hooks"


import { type TimeCardRecord } from "@/features/team-timecards/components/timecards-sections/TimecardsHelpers"
export * from "@/features/team-timecards/components/timecards-sections/TimecardsHelpers"

export default function AttendanceTimecardsPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, branches, subBranches, activeCompanyId, activeBranchId } = useAuthStore()
  const roleNorm = (user?.role || "").toLowerCase().trim()
  const isAdmin = roleNorm === "super admin" || roleNorm === "admin" || roleNorm.includes("admin") || roleNorm.includes("hr")

  const { 
    isClockedIn, 
    isOnBreak, 
    clockInTime, 
    clockInDate, 
    clockInTimeString,
    workMode,
    breakStartTime,
    breakSeconds,
    secondsElapsed, 
    clockIn, 
    clockOut, 
    startBreak, 
    endBreak, 
    setWorkMode,
    tick 
  } = useTimerStore()

  const [viewLayout, setViewLayout] = React.useState<"daily" | "matrix">("daily")
  const [activeTab, setActiveTab] = React.useState<"all" | "clocked_in" | "today" | "late" | "breaks">("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedMemberFilter, setSelectedMemberFilter] = React.useState("all")
  const [selectedDateFilter, setSelectedDateFilter] = React.useState<string>("")
  const [timecards, setTimecards] = React.useState<TimeCardRecord[]>([])
  const [teamMembers, setTeamMembers] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Manual Add / Edit Modal State
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [editingCardId, setEditingCardId] = React.useState<string | null>(null)
  const [selectedWorkMode, setSelectedWorkMode] = React.useState<WorkMode>("Office")
  const [manualForm, setManualForm] = React.useState({
    memberEmail: "",
    date: new Date().toISOString().split("T")[0],
    inTime: "09:30",
    outTime: "18:30",
    workMode: "Office" as WorkMode,
    breakMins: 45,
    status: "Completed" as TimeCardRecord["status"],
    notes: ""
  })

  // Timer tick effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isClockedIn) {
      interval = setInterval(() => tick(), 1000)
    }
    return () => clearInterval(interval)
  }, [isClockedIn, tick])

  // Load team members and timecard records
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Fetch real users (filter out clients for staff timecards)
      const rawUsers = await getUsers("all").catch(() => [])
      const staffList = (rawUsers || []).filter(u => u && u.role !== "Clients" && !String(u.role || "").toLowerCase().includes("client"))
      setTeamMembers(staffList)

      // 2. Fetch timecards from DB & purge obsolete demo seed emails and fake auto-generated cards
      const DEMO_EMAILS = new Set(["hiisupriya@gmail.com", "priya@saampark.com", "rohan@saampark.com", "anand@saampark.com", "kavita@saampark.com"])
      const stored = await fetchModuleDataFromDB<TimeCardRecord[]>("timecards", [], "all").catch(() => [])
      let cleanCards = filterGlobalDeletedItems(stored || []).filter(c => {
        if (!c || !c.memberEmail) return false
        const email = c.memberEmail.toLowerCase().trim()
        if (DEMO_EMAILS.has(email)) return false
        // Purge previously auto-generated fake mock cards
        if (c.id && (c.id.endsWith("_yest") || c.id.endsWith("_today"))) return false
        if (c.notes && c.notes.includes("traffic transit delay")) return false
        return true
      })

      setTimecards(cleanCards)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  React.useEffect(() => {
    setSelectedMemberFilter("all")
  }, [activeCompanyId])

  React.useEffect(() => {
    const handleSwitch = () => {
      setSelectedMemberFilter("all")
      loadData()
    }
    window.addEventListener("saampark_company_switched", handleSwitch)
    window.addEventListener("saampark_data_synced", handleSwitch)
    window.addEventListener("storage", handleSwitch)
    return () => {
      window.removeEventListener("saampark_company_switched", handleSwitch)
      window.removeEventListener("saampark_data_synced", handleSwitch)
      window.removeEventListener("storage", handleSwitch)
    }
  }, [loadData])

  // Handle Team Member Punch In / Punch Out
  const handleUserClockToggle = async () => {
    if (!user) return
    const now = new Date()
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    const dateStr = now.toISOString().split("T")[0]
    const effectiveCompanyId = (activeCompanyId && activeCompanyId !== "all") ? activeCompanyId : (user.companyId || "tech")

    // Check if punch in is late (after 09:45 AM)
    const isLatePunch = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 45)

    if (!isClockedIn) {
      // Clock In
      clockIn(selectedWorkMode)
      const newCard: TimeCardRecord = {
        id: `tc_${Date.now()}`,
        userId: String(user.id),
        memberName: user.name,
        memberEmail: user.email,
        memberRole: user.role,
        memberAvatar: user.avatar || (user as any).avatarUrl || getUserAvatar(user.name, undefined, user.name),
        companyId: effectiveCompanyId,
        branchName: (user as any).branchName || "Main HQ",
        workMode: selectedWorkMode,
        inDate: dateStr,
        inTime: timeStr,
        breakDurationMins: 0,
        durationSecs: 0,
        status: isLatePunch ? "Late" : "Active Shift",
        isVerified: false,
        notes: `Clocked in via portal (${selectedWorkMode})`
      }
      const updated = [newCard, ...timecards]
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    } else {
      // Clock Out
      clockOut()
      const userEmailNorm = user.email.toLowerCase().trim()
      const breakMins = Math.round(breakSeconds / 60)
      const updated = timecards.map(tc => {
        if (tc.memberEmail.toLowerCase().trim() === userEmailNorm && (tc.status === "Active Shift" || tc.status === "Late" || tc.status === "On Break")) {
          const finalDuration = secondsElapsed > 0 ? secondsElapsed : 28800
          const finalStatus: TimeCardRecord["status"] = finalDuration > 32400 ? "Overtime" : (finalDuration < 14400 ? "Half Day" : (tc.status === "Late" ? "Late" : "Completed"))
          return {
            ...tc,
            outDate: dateStr,
            outTime: timeStr,
            breakDurationMins: breakMins,
            durationSecs: finalDuration,
            status: finalStatus,
            notes: tc.notes ? `${tc.notes} | Clocked out at ${timeStr}` : `Clocked out at ${timeStr}`
          }
        }
        return tc
      })
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    }
  }

  // Handle Break Toggle for Team Member
  const handleBreakToggle = async () => {
    if (!user || !isClockedIn) return
    const userEmailNorm = user.email.toLowerCase().trim()
    if (!isOnBreak) {
      startBreak()
      const updated = timecards.map(tc => {
        if (tc.memberEmail.toLowerCase().trim() === userEmailNorm && tc.status === "Active Shift") {
          return { ...tc, status: "On Break" as const }
        }
        return tc
      })
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    } else {
      endBreak()
      const updated = timecards.map(tc => {
        if (tc.memberEmail.toLowerCase().trim() === userEmailNorm && tc.status === "On Break") {
          return { ...tc, status: "Active Shift" as const }
        }
        return tc
      })
      setTimecards(updated)
      await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
    }
  }

  // Handle Manual Add or Edit Timecard
  const handleManualAddSubmit: any = createTimecardsHandler1(() => __ctrlRef.current);

  // Open Edit Modal for a Record
  const handleEditTimecard = (tc: TimeCardRecord) => {
    setEditingCardId(tc.id)
    setManualForm({
      memberEmail: tc.memberEmail,
      date: tc.inDate || new Date().toISOString().split("T")[0],
      inTime: tc.inTime || "09:30",
      outTime: tc.outTime || "18:30",
      workMode: tc.workMode || "Office",
      breakMins: tc.breakDurationMins || 45,
      status: tc.status,
      notes: tc.notes || ""
    })
    setIsAddModalOpen(true)
  }

  // Verify / Approve Timecard Record
  const handleVerifyTimecard = async (id: string) => {
    const updated = timecards.map(tc => tc.id === id ? { ...tc, isVerified: true } : tc)
    setTimecards(updated)
    await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
  }

  // Delete a timecard record
  const handleDeleteTimecard = async (id: string) => {
    if (!confirm("Are you sure you want to remove this attendance record?")) return
    const updated = timecards.filter(tc => tc.id !== id)
    setTimecards(updated)
    await saveModuleDataToDB("timecards", updated, "all").catch(() => {})
  }

  // Export Attendance to CSV
  const handleExportCSV = () => {
    const headers = ["Employee Name", "Email", "Role", "Date", "Work Mode", "Punch In", "Punch Out", "Break (Mins)", "Net Duration (Hrs)", "Status", "Notes"]
    const rows = filteredTimecards.map(tc => [
      `"${tc.memberName}"`,
      `"${tc.memberEmail}"`,
      `"${tc.memberRole || 'Teams'}"`,
      `"${tc.inDate}"`,
      `"${tc.workMode || 'Office'}"`,
      `"${tc.inTime}"`,
      `"${tc.outTime || 'Active'}"`,
      tc.breakDurationMins || 0,
      (tc.durationSecs / 3600).toFixed(2),
      `"${tc.status}"`,
      `"${tc.notes || ''}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Saampark_Attendance_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Scoped Team Members (STRICTLY by active company & privacy role)
  const scopedTeamMembers = React.useMemo(() => {
    let list = teamMembers
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter(m => {
        if (Array.isArray(m.companyIds) && m.companyIds.length > 0) {
          return m.companyIds.some((cid: any) => isMatchingCompany({ id: cid, slug: cid } as any, activeCompanyId))
        }
        if (typeof m.companyIds === "string") {
          try {
            const parsed = JSON.parse(m.companyIds)
            if (Array.isArray(parsed)) {
              return parsed.some((cid: any) => isMatchingCompany({ id: cid, slug: cid } as any, activeCompanyId))
            }
          } catch {}
        }
        const cId = m.companyId || m.company_id || m.company
        if (!cId) return false
        return isMatchingCompany({ id: cId, slug: cId } as any, activeCompanyId)
      })
    }

    // Privacy isolation: non-admins only see themselves in member lists
    if (!isAdmin && user) {
      const uEmail = (user.email || "").toLowerCase().trim()
      const uId = String(user.id || "").trim()
      list = list.filter(m => {
        const mEmail = (m.email || "").toLowerCase().trim()
        const mId = String(m.id || "").trim()
        return (uEmail && mEmail === uEmail) || (uId && mId === uId)
      })
    }

    return list
  }, [teamMembers, activeCompanyId, isAdmin, user])

  // Company Scoped Timecards for stats & aggregate KPIs (with privacy isolation)
  const companyScopedTimecards = React.useMemo(() => {
    let list = timecards
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter(tc => {
        const tcComp = tc.companyId || (tc as any).company_id || (tc as any).company
        if (!tcComp) return false
        return isMatchingCompany({ id: tcComp, slug: tcComp } as any, activeCompanyId)
      })
    }

    // Privacy isolation: regular users only see their own attendance timecards
    if (!isAdmin && user) {
      const uEmail = (user.email || "").toLowerCase().trim()
      const uId = String(user.id || "").trim()
      list = list.filter(tc => {
        const tcEmail = (tc.memberEmail || "").toLowerCase().trim()
        const tcUserId = String(tc.userId || "").trim()
        return (uEmail && tcEmail === uEmail) || (uId && tcUserId === uId)
      })
    }

    return list
  }, [timecards, activeCompanyId, isAdmin, user])

  // Filtered Timecards (with member & tab filters applied on top of company scope)
  const todayStr = new Date().toISOString().split("T")[0]
  const filteredTimecards = React.useMemo(() => {
    return companyScopedTimecards.filter(tc => {
      // 1. Member filter
      if (selectedMemberFilter !== "all") {
        if (tc.memberEmail.toLowerCase() !== selectedMemberFilter.toLowerCase()) return false
      }

      // 2. Date filter
      if (selectedDateFilter && tc.inDate !== selectedDateFilter) {
        return false
      }

      // 3. Tab filter
      if (activeTab === "clocked_in" && tc.status !== "Active Shift") return false
      if (activeTab === "today" && tc.inDate !== todayStr) return false
      if (activeTab === "late" && tc.status !== "Late") return false
      if (activeTab === "breaks" && tc.status !== "On Break") return false

      // 4. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          tc.memberName.toLowerCase().includes(q) ||
          tc.memberEmail.toLowerCase().includes(q) ||
          (tc.memberRole && tc.memberRole.toLowerCase().includes(q)) ||
          (tc.workMode && tc.workMode.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [companyScopedTimecards, selectedMemberFilter, selectedDateFilter, activeTab, searchQuery, todayStr])

  // Aggregate Stats (CALCULATED ON REAL COMPANY SCOPED CARDS)
  const activeClockedInCount = companyScopedTimecards.filter(tc => tc.status === "Active Shift" || tc.status === "On Break").length
  const todayPresentCount = companyScopedTimecards.filter(tc => tc.inDate === todayStr).length
  const lateArrivalsCount = companyScopedTimecards.filter(tc => tc.status === "Late" || (tc.inDate === todayStr && tc.inTime > "09:45")).length
  const onBreakCount = companyScopedTimecards.filter(tc => tc.status === "On Break").length
  const totalCompletedHours = Math.round(companyScopedTimecards.reduce((acc, tc) => acc + (tc.durationSecs || 0), 0) / 3600)

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    return `${h}h ${m.toString().padStart(2, "0")}m`
  }

  const formatLiveSeconds = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, "0")
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, "0")
    const s = (secs % 60).toString().padStart(2, "0")
    return `${h}:${m}:${s}`
  }

  const isTeamMember = user?.role === "Teams"
  const isAdminOrSuper = user?.role === "Super Admin" || user?.role === "Admin"

  
  __ctrl = { user, companies, branches, subBranches, activeCompanyId, activeBranchId, roleNorm, isAdmin, isClockedIn, isOnBreak, clockInTime, clockInDate, clockInTimeString, workMode, breakStartTime, breakSeconds, secondsElapsed, clockIn, clockOut, startBreak, endBreak, setWorkMode, tick, viewLayout, setViewLayout, activeTab, setActiveTab, searchQuery, setSearchQuery, selectedMemberFilter, setSelectedMemberFilter, selectedDateFilter, setSelectedDateFilter, timecards, setTimecards, teamMembers, setTeamMembers, isLoading, setIsLoading, isAddModalOpen, setIsAddModalOpen, editingCardId, setEditingCardId, selectedWorkMode, setSelectedWorkMode, manualForm, setManualForm, loadData, handleUserClockToggle, handleBreakToggle, handleManualAddSubmit, handleEditTimecard, handleVerifyTimecard, handleDeleteTimecard, handleExportCSV, scopedTeamMembers, companyScopedTimecards, todayStr, filteredTimecards, activeClockedInCount, todayPresentCount, lateArrivalsCount, onBreakCount, totalCompletedHours, formatDuration, formatLiveSeconds, isTeamMember, isAdminOrSuper };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-6 max-w-[1550px] mx-auto p-4 sm:p-6 pb-24 font-sans">
      {/* ── VIEW SWITCHER (Monthly Matrix vs Daily Shift Logs) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2.5 sm:px-4 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          <button
            onClick={() => setViewLayout("daily")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewLayout === "daily"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Daily Shift Logs & Punch Clock</span>
          </button>

          <button
            onClick={() => setViewLayout("matrix")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewLayout === "matrix"
                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Attendance Sheet (Matrix)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Leave & Bio-Punch Sync</span>
        </div>
      </div>

      <TimecardsSection1 ctrl={__ctrl} />
    </div>
  )
}
