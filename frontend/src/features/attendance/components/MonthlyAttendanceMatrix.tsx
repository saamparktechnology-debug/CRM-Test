"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ChevronLeft, ChevronRight, Search, Download, Filter, 
  Calendar, CheckCircle2, Clock, AlertCircle, XCircle, 
  PlaneTakeoff, Sparkles, Coffee, RefreshCw, UserCheck, 
  Building2, MapPin, Eye, FileSpreadsheet
} from "lucide-react"
import { useAuthStore, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { fetchModuleDataFromDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { LeaveService } from "@/services/hrService"
import { getUsers, getUserAvatar } from "../../users/services/userService"
import { TimeCardRecord } from "@/features/team-timecards"
import { EmployeeMonthlyAttendance, DayPunchDetail, AttendanceDayStatus } from "../types"
import AttendanceTypeLegend from "./AttendanceTypeLegend"
import AttendanceSummaryCards from "./AttendanceSummaryCards"
import DayPunchModal from "./DayPunchModal"
import { Button } from "@/components/ui/Button"
import { MonthlyAttendanceMatrixSection1 } from "@/features/attendance/components/monthlyattendancematrix-sections/MonthlyAttendanceMatrixSection1"


// Common Indian / Corporate Public Holidays (month is 0-indexed)
import { STANDARD_HOLIDAYS } from "@/features/attendance/components/monthlyattendancematrix-sections/MonthlyAttendanceMatrixHelpers"
export * from "@/features/attendance/components/monthlyattendancematrix-sections/MonthlyAttendanceMatrixHelpers"

export default function MonthlyAttendanceMatrix() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches } = useAuthStore()
  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin"

  // Date Navigation State
  const today = new Date()
  const [selectedYear, setSelectedYear] = React.useState<number>(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = React.useState<number>(today.getMonth()) // 0 = Jan, 10 = Nov

  // Data State
  const [isLoading, setIsLoading] = React.useState<boolean>(true)
  const [teamMembers, setTeamMembers] = React.useState<any[]>([])
  const [timecards, setTimecards] = React.useState<TimeCardRecord[]>([])
  const [approvedLeaves, setApprovedLeaves] = React.useState<any[]>([])
  
  // Filter & Search State
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [branchFilter, setBranchFilter] = React.useState<string>("all")
  
  // Modal State
  const [selectedCell, setSelectedCell] = React.useState<{
    employee: EmployeeMonthlyAttendance
    detail: DayPunchDetail
  } | null>(null)

  // Month Navigation helpers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(prev => prev + 1)
    } else {
      setSelectedMonth(prev => prev + 1)
    }
  }

  const handleCurrentMonth = () => {
    setSelectedYear(today.getFullYear())
    setSelectedMonth(today.getMonth())
  }

  // Helper to match employee with active company
  const matchEmployeeToCompany = React.useCallback((emp: any, targetCompId?: string) => {
    if (!targetCompId || targetCompId === "all" || targetCompId === "group" || targetCompId === "saampark-group") return true
    const canonTarget = getCanonicalCompanyId(targetCompId)
    
    // Super Admin belongs to all companies
    if (emp.role === "Super Admin" || emp.email?.toLowerCase().trim() === "saampark.official@gmail.com") {
      return true
    }

    // Direct companyId
    const empComp = getCanonicalCompanyId(emp.companyId || (emp as any).company_id)
    if (empComp && empComp === canonTarget) return true

    // Assigned companyIds list
    const rawCompIds = emp.companyIds || (emp as any).company_ids
    let userCompIds: string[] = []
    if (Array.isArray(rawCompIds)) {
      userCompIds = rawCompIds
    } else if (typeof rawCompIds === "string") {
      try { userCompIds = JSON.parse(rawCompIds) } catch { userCompIds = [rawCompIds] }
    }
    if (userCompIds.some(id => getCanonicalCompanyId(id) === canonTarget)) return true

    // Company name
    if (emp.companyName) {
      const compNameCanon = getCanonicalCompanyId(emp.companyName)
      if (compNameCanon && compNameCanon === canonTarget) return true
    }

    return false
  }, [])

  // Load Data
  const loadAttendanceData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersList, storedCards, leaveRequests] = await Promise.all([
        getUsers("all").catch(() => []),
        fetchModuleDataFromDB<TimeCardRecord[]>("timecards", [], "all").catch(() => []),
        LeaveService.getRequests().catch(() => [])
      ])

      // Only staff/employees (exclude Clients from attendance)
      const staffUsers = (usersList || []).filter(u => u && u.role !== "Clients" && !String(u.role || "").toLowerCase().includes("client"))
      setTeamMembers(staffUsers)

      // Purge fake mock emails and auto-generated dummy baseline cards
      const DEMO_EMAILS = new Set(["hiisupriya@gmail.com", "priya@saampark.com", "rohan@saampark.com", "anand@saampark.com", "kavita@saampark.com"])
      const realCards = filterGlobalDeletedItems(storedCards || []).filter(c => {
        if (!c || !c.memberEmail) return false
        const email = c.memberEmail.toLowerCase().trim()
        if (DEMO_EMAILS.has(email)) return false
        if (c.id && (c.id.endsWith("_yest") || c.id.endsWith("_today"))) return false
        if (c.notes && c.notes.includes("traffic transit delay")) return false
        return true
      })
      setTimecards(realCards)

      // Filter only approved leaves
      const approvedOnly = (leaveRequests || []).filter(
        (l: any) => (l.status || "").toLowerCase().trim() === "approved"
      )
      setApprovedLeaves(approvedOnly)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadAttendanceData()
  }, [loadAttendanceData])

  // Reload when company changes or events fire
  React.useEffect(() => {
    const handleSync = () => loadAttendanceData()
    window.addEventListener("saampark_company_switched", handleSync)
    window.addEventListener("saampark_data_synced", handleSync)
    return () => {
      window.removeEventListener("saampark_company_switched", handleSync)
      window.removeEventListener("saampark_data_synced", handleSync)
    }
  }, [loadAttendanceData])

  // Calculate days in the selected month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString("en-IN", { month: "long" })
  const monthDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  // Format YYYY-MM-DD
  const formatDateStr = (day: number) => {
    const m = String(selectedMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    return `${selectedYear}-${m}-${d}`
  }

  // Check if a date is a public holiday
  const checkHoliday = (day: number) => {
    const m = String(selectedMonth + 1).padStart(2, "0")
    const d = String(day).padStart(2, "0")
    const key = `${m}-${d}`
    return STANDARD_HOLIDAYS[key] || null
  }

  // Build the attendance matrix per employee
  const employeeMatrix: EmployeeMonthlyAttendance[] = React.useMemo(() => {
    const effectiveCompanyId = activeCompanyId && activeCompanyId !== "all" ? activeCompanyId : undefined

    // Filter staff employees by company & branch
    const filteredEmployees = teamMembers.filter(emp => {
      // 1. Exclude Clients
      const isClient = emp.role === "Clients" || String(emp.role || "").toLowerCase().includes("client")
      if (isClient) return false

      // Non-admin privacy isolation: regular team members / users can ONLY see their own attendance row
      if (!isAdmin && user) {
        const uEmail = (user.email || "").toLowerCase().trim()
        const uId = String(user.id || "").trim()
        const empEmail = (emp.email || "").toLowerCase().trim()
        const empId = String(emp.id || "").trim()
        const isSelf = (uEmail && empEmail === uEmail) || (uId && empId === uId)
        if (!isSelf) return false
      }

      // 2. Company check
      if (!matchEmployeeToCompany(emp, effectiveCompanyId)) {
        return false
      }

      // 3. Branch check
      const effBranch = branchFilter !== "all" ? branchFilter : (activeBranchId && activeBranchId !== "all" ? activeBranchId : "all")
      if (effBranch !== "all") {
        const bTarget = String(effBranch).toLowerCase().trim()
        const empBId = String(emp.branchId || emp.branch_id || "").toLowerCase().trim()
        const empBName = String(emp.branchName || emp.branch_name || "").toLowerCase().trim()
        const isGlobalStaff = emp.role === "Super Admin" || (!empBId && emp.role === "Admin")
        if (!isGlobalStaff && empBId !== bTarget && empBName !== bTarget && !empBName.includes(bTarget)) {
          return false
        }
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = (emp.name || "").toLowerCase().includes(q)
        const matchEmail = (emp.email || "").toLowerCase().includes(q)
        const matchRole = (emp.role || "").toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchRole) return false
      }

      return true
    })

    const todayDateStr = today.toISOString().split("T")[0]
    const todayTime = today.getTime()

    return filteredEmployees.map(emp => {
      const empEmail = (emp.email || "").toLowerCase().trim()
      const empId = String(emp.id || "")
      const empName = (emp.name || "").toLowerCase().trim()

      let totalWorkedSecs = 0
      let totalPresent = 0
      let totalHalfDays = 0
      let totalLate = 0
      let totalLeaves = 0
      let totalAbsents = 0
      let totalDaysOff = 0
      let totalHolidays = 0

      const dailyDetails: Record<number, DayPunchDetail> = {}

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = formatDateStr(day)
        const currentDateObj = new Date(selectedYear, selectedMonth, day)
        const dayOfWeekIdx = currentDateObj.getDay()
        const dayOfWeekShort = currentDateObj.toLocaleDateString("en-US", { weekday: "narrow" }) // M, T, W...
        const isSunday = dayOfWeekIdx === 0
        const isPastDate = currentDateObj.getTime() < todayTime && dateStr !== todayDateStr
        const isToday = dateStr === todayDateStr
        const isFutureDate = currentDateObj.getTime() > todayTime && !isToday

        const holidayName = checkHoliday(day)
        const isHoliday = Boolean(holidayName)

        // 1. Check if employee has an approved leave on this date
        const matchingLeave = approvedLeaves.find(l => {
          const lEmail = (l.employeeEmail || "").toLowerCase().trim()
          const lName = (l.employee || "").toLowerCase().trim()
          const lId = String(l.employeeId || "")
          const isUserMatch = lEmail === empEmail || (empId && lId === empId) || (empName && lName === empName)
          if (!isUserMatch) return false

          const fromStr = (l.from || "").split("T")[0]
          const toStr = (l.to || fromStr).split("T")[0]
          return dateStr >= fromStr && dateStr <= toStr
        })

        // 2. Check if employee has a real timecard punch on this date
        const matchingCard = timecards.find(tc => {
          const tcEmail = (tc.memberEmail || "").toLowerCase().trim()
          const tcId = String(tc.userId || "")
          const isUserMatch = tcEmail === empEmail || (empId && tcId === empId)
          return isUserMatch && tc.inDate === dateStr
        })

        // Determine Status
        let status: AttendanceDayStatus = "Upcoming"
        let punchIn = matchingCard?.inTime
        let punchOut = matchingCard?.outTime
        let breakMins = matchingCard?.breakDurationMins || 0
        let workedSeconds = matchingCard?.durationSecs || 0
        let workMode = matchingCard?.workMode || "Office"
        let notes = matchingCard?.notes

        if (matchingLeave) {
          // Approved Leave takes precedence
          if (matchingLeave.isHalfDay) {
            status = "Half Day"
            totalHalfDays += 1
          } else {
            status = "On Leave"
            totalLeaves += 1
          }
        } else if (matchingCard) {
          // Worked Punch
          workedSeconds = matchingCard.durationSecs || 0
          totalWorkedSecs += workedSeconds

          // Check if late (punched in after 09:45 AM)
          let isLate = false
          if (matchingCard.inTime) {
            const match = matchingCard.inTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
            if (match) {
              let h = parseInt(match[1], 10)
              const m = parseInt(match[2], 10)
              const ampm = match[3]?.toUpperCase()
              if (ampm === "PM" && h < 12) h += 12
              if (ampm === "AM" && h === 12) h = 0
              if (h > 9 || (h === 9 && m > 45)) isLate = true
            }
          }

          if (matchingCard.status === "Late" || isLate) {
            status = "Late"
            totalLate += 1
            totalPresent += 1
          } else if (matchingCard.status === "Half Day" || (workedSeconds > 0 && workedSeconds < 25200)) { // < 7 hrs
            status = "Half Day"
            totalHalfDays += 1
          } else {
            status = "Present"
            totalPresent += 1
          }
        } else if (isHoliday) {
          status = "Holiday"
          totalHolidays += 1
        } else if (isSunday) {
          status = "Day Off"
          totalDaysOff += 1
        } else if (isPastDate) {
          status = "Absent"
          totalAbsents += 1
        } else {
          status = "Upcoming"
        }

        dailyDetails[day] = {
          dateStr,
          dayNumber: day,
          dayOfWeek: dayOfWeekShort,
          isSunday,
          isHoliday,
          holidayName: holidayName || undefined,
          status,
          punchIn,
          punchOut,
          breakMins,
          workedSeconds,
          workMode,
          notes,
          timecardId: matchingCard?.id,
          leaveInfo: matchingLeave ? {
            id: matchingLeave.id,
            type: matchingLeave.type || "Casual Leave",
            reason: matchingLeave.reason,
            isHalfDay: matchingLeave.isHalfDay,
            approvedBy: matchingLeave.reviewedBy || "Admin"
          } : undefined
        }
      }

      return {
        employeeId: empId,
        name: emp.name || "Employee",
        email: emp.email || "",
        role: emp.role || "Team Member",
        avatar: emp.avatar || emp.avatarUrl || getUserAvatar(emp.name, undefined, emp.name),
        department: emp.department || emp.designation || "Engineering",
        branchName: emp.branchName || "HQ",
        companyId: emp.companyId,
        dailyDetails,
        totalWorkedSeconds: totalWorkedSecs,
        totalPresent,
        totalHalfDays,
        totalLate,
        totalLeaves,
        totalAbsents,
        totalDaysOff,
        totalHolidays
      }
    })
  }, [teamMembers, approvedLeaves, timecards, selectedMonth, selectedYear, activeCompanyId, branchFilter, searchQuery, daysInMonth, isAdmin, user])

  // Monthly KPI Aggregates
  const totalEmployeesCount = employeeMatrix.length
  const todayDayNumber = selectedMonth === today.getMonth() && selectedYear === today.getFullYear() ? today.getDate() : null
  
  let presentTodayCount = 0
  let onLeaveTodayCount = 0
  let lateTodayCount = 0
  let halfDayTodayCount = 0
  let cumulativeMonthSecs = 0

  employeeMatrix.forEach(emp => {
    cumulativeMonthSecs += emp.totalWorkedSeconds
    if (todayDayNumber && emp.dailyDetails[todayDayNumber]) {
      const todayStatus = emp.dailyDetails[todayDayNumber].status
      if (todayStatus === "Present") presentTodayCount += 1
      if (todayStatus === "On Leave") onLeaveTodayCount += 1
      if (todayStatus === "Late") lateTodayCount += 1
      if (todayStatus === "Half Day") halfDayTodayCount += 1
    }
  })

  // Format Total Working Hours (e.g. 1,480 hrs)
  const formatTotalHours = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  // Export Monthly Matrix as CSV
  const handleExportCSV = () => {
    try {
      const header = ["Employee Name", "Email", "Role", "Branch", ...monthDaysArray.map(d => `Day ${d}`), "Total Hours", "Present Days", "Half Days", "Late", "Leaves", "Absents"]
      const rows = employeeMatrix.map(emp => {
        const daysStatus = monthDaysArray.map(d => emp.dailyDetails[d]?.status || "-")
        return [
          `"${emp.name}"`,
          `"${emp.email}"`,
          `"${emp.role || ''}"`,
          `"${emp.branchName || ''}"`,
          ...daysStatus.map(s => `"${s}"`),
          `"${formatTotalHours(emp.totalWorkedSeconds)}"`,
          emp.totalPresent,
          emp.totalHalfDays,
          emp.totalLate,
          emp.totalLeaves,
          emp.totalAbsents
        ].join(",")
      })

      const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows].join("\n")
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `Attendance_Sheet_${monthName}_${selectedYear}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err: any) {
      alert("Failed to export attendance CSV: " + err.message)
    }
  }

  // Render Status Icon for a Matrix Cell
  const renderCellIcon = (detail: DayPunchDetail) => {
    switch (detail.status) {
      case "Present":
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center transition-transform hover:scale-110">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        )
      case "Half Day":
        return (
          <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center transition-transform hover:scale-110">
            <Clock className="w-3.5 h-3.5" />
          </div>
        )
      case "Late":
        return (
          <div className="w-6 h-6 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center transition-transform hover:scale-110">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
        )
      case "On Leave":
        return (
          <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center transition-transform hover:scale-110 shadow-2xs">
            <PlaneTakeoff className="w-3.5 h-3.5" />
          </div>
        )
      case "Holiday":
        return (
          <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center transition-transform hover:scale-110">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )
      case "Day Off":
        return (
          <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800/70 text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center">
            <Coffee className="w-3 h-3" />
          </div>
        )
      case "Absent":
        return (
          <div className="w-6 h-6 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 flex items-center justify-center transition-transform hover:scale-110">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        )
      default:
        return (
          <div className="w-6 h-6 flex items-center justify-center text-zinc-300 dark:text-zinc-600 font-bold text-xs">
            •
          </div>
        )
    }
  }

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, isAdmin, today, selectedYear, setSelectedYear, selectedMonth, setSelectedMonth, isLoading, setIsLoading, teamMembers, setTeamMembers, timecards, setTimecards, approvedLeaves, setApprovedLeaves, searchQuery, setSearchQuery, branchFilter, setBranchFilter, selectedCell, setSelectedCell, handlePrevMonth, handleNextMonth, handleCurrentMonth, matchEmployeeToCompany, loadAttendanceData, daysInMonth, monthName, monthDaysArray, formatDateStr, checkHoliday, employeeMatrix, totalEmployeesCount, todayDayNumber, presentTodayCount, onLeaveTodayCount, lateTodayCount, halfDayTodayCount, cumulativeMonthSecs, formatTotalHours, handleExportCSV, renderCellIcon };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <MonthlyAttendanceMatrixSection1 ctrl={__ctrl} />

      {/* Interactive Punch & Work Record Modal */}
      {selectedCell && (
        <DayPunchModal
          isOpen={Boolean(selectedCell)}
          onClose={() => setSelectedCell(null)}
          employee={selectedCell.employee}
          detail={selectedCell.detail}
          onUpdatePunch={() => {
            loadAttendanceData()
          }}
        />
      )}
    </div>
  )
}

