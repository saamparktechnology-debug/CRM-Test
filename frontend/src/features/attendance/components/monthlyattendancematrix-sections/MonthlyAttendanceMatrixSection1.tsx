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
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { TimeCardRecord } from "@/features/team-timecards"
import { EmployeeMonthlyAttendance, DayPunchDetail, AttendanceDayStatus } from "@/features/attendance/types"
import AttendanceTypeLegend from "@/features/attendance/components/AttendanceTypeLegend"
import AttendanceSummaryCards from "@/features/attendance/components/AttendanceSummaryCards"
import DayPunchModal from "@/features/attendance/components/DayPunchModal"
import { Button } from "@/components/ui/Button"
import { STANDARD_HOLIDAYS } from "@/features/attendance/components/monthlyattendancematrix-sections/MonthlyAttendanceMatrixHelpers"

export function MonthlyAttendanceMatrixSection1({ ctrl }: { ctrl: any }) {
  const { handlePrevMonth, monthName, selectedYear, handleNextMonth, handleCurrentMonth, handleExportCSV, totalEmployeesCount, presentTodayCount, onLeaveTodayCount, lateTodayCount, halfDayTodayCount, formatTotalHours, cumulativeMonthSecs, searchQuery, setSearchQuery, branches, branchFilter, setBranchFilter, loadAttendanceData, isLoading, monthDaysArray, formatDateStr, today, selectedMonth, employeeMatrix, daysInMonth, setSelectedCell, renderCellIcon } = ctrl;
  return (
    <>
      {/* Top Header & Month Navigator */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Monthly Attendance Sheet
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Live Matrix
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time monthly attendance matrix synchronized with timecard punches and approved leave records.
          </p>
        </div>

        {/* Month Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 min-w-[130px] text-center select-none">
              {monthName} {selectedYear}
            </div>
            <button
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="outline"
            onClick={handleCurrentMonth}
            className="text-xs h-9 px-3 border-zinc-200 dark:border-zinc-700"
          >
            Today
          </Button>

          <Button
            onClick={handleExportCSV}
            className="text-xs h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <AttendanceSummaryCards
        totalEmployees={totalEmployeesCount}
        presentToday={presentTodayCount}
        onLeaveToday={onLeaveTodayCount}
        lateToday={lateTodayCount}
        halfDayToday={halfDayTodayCount}
        monthTotalHours={formatTotalHours(cumulativeMonthSecs)}
      />

      {/* Attendance Status Legend */}
      <AttendanceTypeLegend />

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search employee by name, email..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {branches && branches.length > 0 && (
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
            >
              <option value="all">All Branches</option>
              {branches.map((b: any) => (
                <option key={b.id || b.name} value={b.name || b.id}>
                  {b.name || b.branch_name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadAttendanceData}
            title="Refresh Data"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Master Monthly Grid Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-zinc-50/80 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                {/* Frozen Employee Column */}
                <th className="sticky left-0 z-20 bg-zinc-50 dark:bg-zinc-850 px-4 py-3.5 font-bold min-w-[200px] sm:min-w-[240px] border-r border-zinc-200 dark:border-zinc-800 shadow-xs">
                  Employee Details
                </th>

                {/* Day Columns 1..daysInMonth */}
                {monthDaysArray.map((day) => {
                  const dateStr = formatDateStr(day)
                  const isToday = dateStr === today.toISOString().split("T")[0]
                  const currentDateObj = new Date(selectedYear, selectedMonth, day)
                  const isSunday = currentDateObj.getDay() === 0
                  const dayName = currentDateObj.toLocaleDateString("en-US", { weekday: "narrow" })

                  return (
                    <th
                      key={day}
                      className={`text-center py-2 px-1 min-w-[36px] max-w-[40px] border-r border-zinc-200 dark:border-zinc-800 select-none ${
                        isToday 
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold" 
                          : isSunday 
                            ? "bg-zinc-100/70 dark:bg-zinc-800/40 text-zinc-400" 
                            : ""
                      }`}
                    >
                      <div className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500">
                        {dayName}
                      </div>
                      <div className={`text-xs font-bold mt-0.5 ${isToday ? "text-indigo-600 dark:text-indigo-400" : ""}`}>
                        {day}
                      </div>
                    </th>
                  )
                })}

                {/* Summary Total Columns */}
                <th className="text-center px-3 py-3.5 font-bold bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 min-w-[85px]">
                  Total Hrs
                </th>
                <th className="text-center px-2 py-3.5 font-bold bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 text-emerald-600 min-w-[55px]">
                  Present
                </th>
                <th className="text-center px-2 py-3.5 font-bold bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 text-blue-600 min-w-[55px]">
                  Half Day
                </th>
                <th className="text-center px-2 py-3.5 font-bold bg-zinc-50 dark:bg-zinc-850 border-r border-zinc-200 dark:border-zinc-800 text-orange-600 min-w-[50px]">
                  Late
                </th>
                <th className="text-center px-2 py-3.5 font-bold bg-zinc-50 dark:bg-zinc-850 text-purple-600 min-w-[55px]">
                  Leaves
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {employeeMatrix.length === 0 ? (
                <tr>
                  <td colSpan={daysInMonth + 6} className="text-center py-12 text-zinc-400">
                    No team members found matching the selected filters.
                  </td>
                </tr>
              ) : (
                employeeMatrix.map((emp) => (
                  <tr 
                    key={emp.employeeId || emp.email}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    {/* Frozen Employee Column */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-zinc-900 px-4 py-2.5 border-r border-zinc-200 dark:border-zinc-800 shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden shadow-2xs">
                          {emp.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                          ) : (
                            emp.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate text-xs" title={emp.name}>
                            {emp.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate" title={emp.email}>
                            {emp.role || emp.department || "Team Member"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells (1..daysInMonth) */}
                    {monthDaysArray.map((day) => {
                      const detail = emp.dailyDetails[day]
                      if (!detail) return <td key={day} className="border-r border-zinc-200 dark:border-zinc-800 text-center" />

                      const isSunday = detail.isSunday
                      const dateStr = detail.dateStr
                      const isToday = dateStr === today.toISOString().split("T")[0]

                      return (
                        <td
                          key={day}
                          onClick={() => setSelectedCell({ employee: emp, detail })}
                          title={`${emp.name} - ${dateStr}: ${detail.status} ${detail.punchIn ? `(${detail.punchIn} - ${detail.punchOut || 'Active'})` : ''}`}
                          className={`text-center py-1.5 px-0.5 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer transition-colors ${
                            isToday 
                              ? "bg-indigo-50/40 dark:bg-indigo-950/20" 
                              : isSunday 
                                ? "bg-zinc-50 dark:bg-zinc-900/60" 
                                : ""
                          } hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40`}
                        >
                          <div className="flex items-center justify-center">
                            {renderCellIcon(detail)}
                          </div>
                        </td>
                      )
                    })}

                    {/* Summary Columns */}
                    <td className="text-center px-2 py-2.5 font-bold text-zinc-900 dark:text-zinc-100 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-850/30 text-xs">
                      {formatTotalHours(emp.totalWorkedSeconds)}
                    </td>
                    <td className="text-center px-2 py-2.5 font-bold text-emerald-600 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-850/30 text-xs">
                      {emp.totalPresent}
                    </td>
                    <td className="text-center px-2 py-2.5 font-bold text-blue-600 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-850/30 text-xs">
                      {emp.totalHalfDays}
                    </td>
                    <td className="text-center px-2 py-2.5 font-bold text-orange-600 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-850/30 text-xs">
                      {emp.totalLate}
                    </td>
                    <td className="text-center px-2 py-2.5 font-bold text-purple-600 bg-zinc-50/30 dark:bg-zinc-850/30 text-xs">
                      {emp.totalLeaves}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
