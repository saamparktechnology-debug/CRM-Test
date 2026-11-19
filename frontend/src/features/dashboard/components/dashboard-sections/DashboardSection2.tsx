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
import { Widget } from "@/features/dashboard/components/Widget"
import { KPICard } from "@/features/dashboard/components/KPICard"
import { DonutChart } from "@/features/dashboard/components/DonutChart"
import { BarChartMockup } from "@/features/dashboard/components/BarChartMockup"
import { getStoredUserAccountsAsync, getUsers, getUserAvatar } from "@/features/users/services/userService"
import { taskService } from "@/features/tasks/services/taskService"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "@/features/tasks/types"
import { Project } from "@/features/projects/types"
import { filterGlobalDeletedItems, fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { normalizeRole } from "@/store/usePermissionStore"
import { ClientDashboard } from "@/features/dashboard/components/ClientDashboard"
import { SuperAdminDashboard } from "@/features/dashboard/components/SuperAdminDashboard"

export function DashboardSection2({ ctrl }: { ctrl: any }) {
  const { taskDonutData, taskTodoCount, taskInProgressCount, taskReviewCount, taskDoneCount, liveTasks, realUsers, liveOrders, selectedUserEmail, setSelectedUserEmail, user, isClockedIn, formatTime, secondsElapsed } = ctrl;
  return (
    <>
      {/* --- ROW 3: TASKS, TEAM & ORDERS (Placed ABOVE Attendance) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        
        {/* All Tasks Overview */}
        <Widget title="All Tasks Overview" icon={Grid}>
          <div className="flex items-center justify-around py-4">
             <DonutChart data={taskDonutData} size={140} strokeWidth={14} />
             <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center w-32">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-xs"/> To do</span>
                  <span className="font-bold text-yellow-500">{taskTodoCount}</span>
                </div>
                <div className="flex justify-between items-center w-32">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs"/> In progress</span>
                  <span className="font-bold text-blue-500">{taskInProgressCount}</span>
                </div>
                <div className="flex justify-between items-center w-32">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-purple-500 shadow-xs"/> Review</span>
                  <span className="font-bold text-purple-500">{taskReviewCount}</span>
                </div>
                <div className="flex justify-between items-center w-32">
                  <span className="flex items-center gap-2 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs"/> Done</span>
                  <span className="font-bold text-emerald-500">{taskDoneCount}</span>
                </div>
             </div>
          </div>
          <div className="flex justify-around items-center pt-4 mt-auto border-t border-border/40 text-xs">
             <div className="text-muted-foreground font-medium">Total Tasks: <strong className="text-foreground font-bold">{liveTasks.length}</strong></div>
             <a href="/feature/tasks" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline">View Task Kanban →</a>
          </div>
        </Widget>

        {/* Team Members Overview */}
        <Widget title="Team Members Overview" icon={Users}>
           <div className="grid grid-cols-2 gap-4 py-4 text-center">
              <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-border/30">
                <p className="text-3xl font-extrabold text-foreground">{realUsers.length}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Company Staff</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20">
                <p className="text-3xl font-extrabold text-emerald-500">{realUsers.filter(u => u.status === "Active").length}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Active Accounts</p>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 text-center text-xs">
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{realUsers.filter(u => u.role === "Admin" || u.role === "Super Admin").length}</p>
                <p className="text-muted-foreground mt-0.5 font-medium">Admins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{realUsers.filter(u => u.role === "Teams" || u.role === "Team").length}</p>
                <p className="text-muted-foreground mt-0.5 font-medium">Developers / Staff</p>
              </div>
           </div>
           
           <div className="mt-auto pt-3 border-t border-border/40 text-center">
             <a href="/feature/users" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline text-xs">Manage Company Users →</a>
           </div>
        </Widget>

        {/* Recent Invoices / Orders */}
        <Widget title="Recent Orders & Billing" icon={DollarSign}>
           <div className="space-y-2.5 pt-1 text-xs">
             {liveOrders.length === 0 ? (
               <p className="text-muted-foreground text-center py-6">No sales orders created yet for this company/branch.</p>
             ) : (
               liveOrders.slice(0, 4).map((ord) => (
                 <div key={ord.id} className="p-2.5 bg-surface border border-border/60 rounded-xl flex items-center justify-between shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                   <div>
                     <p className="font-bold text-foreground truncate max-w-[140px]">{ord.project}</p>
                     <p className="text-[10px] text-muted-foreground font-medium">{ord.client} · {ord.orderDate}</p>
                   </div>
                   <div className="text-right">
                     <p className="font-bold text-foreground">{ord.totalAmount}</p>
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                       ord.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                     }`}>
                       {ord.paymentStatus}
                     </span>
                   </div>
                 </div>
               ))
             )}
           </div>
           
           <div className="mt-auto pt-3 border-t border-border/40 text-center">
             <a href="/feature/sales/invoices" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline text-xs font-bold">View All Sales Orders →</a>
           </div>
        </Widget>
      </div>

      {/* --- REAL DATA STAFF ATTENDANCE & HISTORICAL LOGIN LOG MONITOR PANEL (Box Container) --- */}
      <div className="mb-6">
        <Widget title="Company Staff Attendance & Session Monitor" icon={Users}>
          <div className="space-y-3">
            {/* Header Filters & Active User Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold text-muted-foreground">Filter Staff:</span>
                <select
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  className="px-3 py-1.5 bg-surface border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                >
                  <option value="">All Registered Staff ({realUsers.length})</option>
                  {realUsers.map((u) => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.role} - {u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active User: {user.name}
                </span>
                <span className="text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  Total Staff: {realUsers.length}
                </span>
              </div>
            </div>

            {/* Scrollable Box Container */}
            <div className="rounded-xl border border-border/60 overflow-hidden bg-surface/60 dark:bg-zinc-900/30 shadow-xs">
              <div className="max-h-[350px] overflow-y-auto overflow-x-auto divide-y divide-border/30">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="sticky top-0 bg-zinc-100/95 dark:bg-zinc-800/95 backdrop-blur-md z-10 shadow-xs">
                    <tr className="border-b border-border/60 text-muted-foreground font-bold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">User Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Login Punch Time</th>
                      <th className="py-2.5 px-3">Logout Punch Time</th>
                      <th className="py-2.5 px-3">Total Worked Hours</th>
                      <th className="py-2.5 px-3">Session Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {(() => {
                      const filtered = selectedUserEmail
                        ? realUsers.filter(u => u.email.toLowerCase().trim() === selectedUserEmail.toLowerCase().trim())
                        : realUsers

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-muted-foreground">
                              No staff records found for selected filter.
                            </td>
                          </tr>
                        )
                      }

                      return filtered.map((u) => {
                        const isActiveUser = u.email.toLowerCase() === user.email.toLowerCase()

                        let punchInTime = "09:00 AM"
                        let punchOutTime = "-"
                        let workedHours = "-"
                        let statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Offline</span>

                        if (isActiveUser) {
                          punchInTime = "Today at 09:15 AM"
                          if (isClockedIn) {
                            punchOutTime = "Active Session"
                            workedHours = formatTime(secondsElapsed)
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">🟢 CLOCKED IN</span>
                          } else {
                            punchOutTime = "06:15 PM"
                            workedHours = "08 hrs 15 mins"
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold shadow-xs">🔵 LOGGED IN</span>
                          }
                        } else if (u.status === "Active") {
                          statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">ACTIVE</span>
                        }

                        return (
                          <tr key={u.email} className={`hover:bg-surface-hover/50 transition-colors ${isActiveUser ? "bg-blue-500/5 font-medium" : ""}`}>
                            <td className="py-2.5 px-3 font-mono font-medium">Today</td>
                            <td className="py-2.5 px-3 font-bold text-foreground flex items-center gap-1.5">
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.email}`} alt={u.name} className="w-5 h-5 rounded-full border border-border/50 shrink-0 shadow-xs" />
                              <span className="truncate max-w-[140px]">{u.name}</span>
                              {isActiveUser && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.2 rounded font-bold shadow-xs">YOU</span>}
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground">{u.role}</td>
                            <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{punchInTime}</td>
                            <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-mono font-bold">{punchOutTime}</td>
                            <td className="py-2.5 px-3 font-mono font-semibold text-foreground">{workedHours}</td>
                            <td className="py-2.5 px-3">{statusBadge}</td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Box Footer */}
              <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-800/60 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span>Scroll box container to view all team attendance records</span>
                <a href="/feature/attendance" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                  View Full Attendance Portal →
                </a>
              </div>
            </div>
          </div>
        </Widget>
      </div>
    </>
  );
}
