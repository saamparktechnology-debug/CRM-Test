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

export function DashboardSection1({ ctrl }: { ctrl: any }) {
  const { currentCompanyObj, currentBranchObj, user, realUsers, liveProjects, liveOrders, isClockedIn, clockOut, clockIn, formatTime, secondsElapsed, activeTasksCount, liveTasks, totalInvoicedSum, liveInvoices, totalDueSum, invoicesWithDueCount, openProjectsCount, completedProjectsCount, holdProjectsCount, averageProjectProgression, totalProjectsCount, fullyPaidInvoices, fullyPaidReceivedSum, partiallyPaidInvoices, partialReceivedSum, incomeVsExpenseData, totalReceivedSum, totalExpenseSum } = ctrl;
  return (
    <>
      {/* --- DASHBOARD HEADER & ACTIVE COMPANY/BRANCH BADGE --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <span className="text-base">{currentCompanyObj.logo || "🏢"}</span>
            <span className="font-bold">{currentCompanyObj.name}</span>
            {currentBranchObj ? (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold flex items-center gap-1">
                <MapPin size={11} /> {currentBranchObj.name} ({currentBranchObj.city || "Branch"})
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-semibold">
                🏢 All Branches / Main HQ
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {(user?.role as string) === "Super Admin" ? "Super Admin Executive Dashboard" : `${currentCompanyObj.name} Admin Dashboard`}
          </h1>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            Active Accounts: <strong className="text-foreground">{realUsers.length}</strong>
          </span>
          <span className="text-muted-foreground">
            Projects: <strong className="text-foreground">{liveProjects.length}</strong>
          </span>
          <span className="text-muted-foreground">
            Orders: <strong className="text-foreground">{liveOrders.length}</strong>
          </span>
        </div>
      </div>

      {/* --- ROW 1: KPI CARDS ROW --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KPICard 
          icon={Clock} 
          colorClass={isClockedIn ? "bg-emerald-500" : "bg-pink-500"} 
          value={
            <button 
              onClick={() => isClockedIn ? clockOut() : clockIn()}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 w-fit ml-auto transition-all cursor-pointer btn-3d ${
                isClockedIn 
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/25" 
                  : "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-pink-600 shadow-pink-500/25"
              }`}
            >
              <Monitor size={14}/> 
              {isClockedIn ? "Clock Out" : "Clock In"}
            </button>
          } 
          label="" 
          subtextNode={
            <div className="mt-2 text-xs">
              {isClockedIn ? (
                <p className="text-emerald-600 font-mono font-medium flex items-center justify-end gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {formatTime(secondsElapsed)}
                </p>
              ) : (
                <p className="text-muted-foreground">You are currently clocked out</p>
              )}
            </div>
          }
        />
        <KPICard 
          icon={Grid} 
          colorClass="bg-blue-500" 
          value={`${activeTasksCount} Open`} 
          label="Active Tasks" 
          subtextNode={
            <div className="mt-1 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 pill-badge-3d">
                {liveTasks.length} Total Assigned
              </span>
            </div>
          }
        />
        <KPICard 
          icon={Calendar} 
          colorClass="bg-indigo-500" 
          value={`₹${totalInvoicedSum.toLocaleString("en-IN")}`} 
          label="Total Invoiced" 
          subtextNode={
            <div className="mt-1 flex items-center justify-end">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 pill-badge-3d">
                {liveInvoices.length} Invoices
              </span>
            </div>
          }
        />
        <KPICard 
          icon={PieChart} 
          colorClass="bg-rose-500" 
          value={`₹${totalDueSum.toLocaleString("en-IN")}`} 
          label="Balance Due" 
          subtextNode={
            <div className="mt-1 flex items-center justify-end">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 pill-badge-3d shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                {invoicesWithDueCount} {invoicesWithDueCount === 1 ? "Invoice Due" : "Invoices Due"}
              </span>
            </div>
          }
        />
      </div>

      {/* --- ROW 2: REAL DYNAMIC OVERVIEWS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Projects Overview (Calculated from Real Database) */}
        <Widget title="Projects Overview" icon={Grid} className="flex flex-col">
          <div className="flex justify-around items-center py-6 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-500">{openProjectsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">In Progress</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-500">{completedProjectsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-500">{holdProjectsCount}</p>
              <p className="text-xs text-muted-foreground mt-1">On Hold</p>
            </div>
          </div>
          <div className="mt-auto pt-6">
            <div className="h-6 w-full rounded-full border border-emerald-500 p-0.5 relative flex items-center">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${averageProjectProgression}%` }} 
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-300/50 rounded-full" 
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs text-emerald-700 dark:text-emerald-300 font-bold z-10 pointer-events-none">
                Average Progression: {averageProjectProgression}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 mt-6 pt-4 border-t border-border/40 gap-4 text-xs">
            <div className="text-center border-r border-border/40">
               <p className="text-lg font-bold text-foreground">{totalProjectsCount}</p>
               <p className="text-[11px] text-muted-foreground mt-0.5">Total Company Projects</p>
            </div>
            <div className="text-center">
               <p className="text-lg font-bold text-blue-600">{liveOrders.length}</p>
               <p className="text-[11px] text-muted-foreground mt-0.5">Sales Orders</p>
            </div>
          </div>
        </Widget>

        {/* Invoice Overview (Calculated from Real Database) */}
        <Widget title="Invoice & Billing Overview" icon={FileText}>
          <div className="space-y-4 pt-2">
            {[
              { 
                label: "Fully Paid", 
                count: fullyPaidInvoices.length, 
                color: "bg-emerald-500", 
                text: "text-emerald-600 dark:text-emerald-400", 
                percent: totalInvoicedSum > 0 ? Math.min(100, Math.round((fullyPaidReceivedSum / totalInvoicedSum) * 100)) : 0, 
                amount: `₹${fullyPaidReceivedSum.toLocaleString("en-IN")}` 
              },
              { 
                label: "Partially Paid", 
                count: partiallyPaidInvoices.length, 
                color: "bg-amber-500", 
                text: "text-amber-600 dark:text-amber-400", 
                percent: totalInvoicedSum > 0 ? Math.min(100, Math.round((partialReceivedSum / totalInvoicedSum) * 100)) : 0, 
                amount: `₹${partialReceivedSum.toLocaleString("en-IN")}` 
              },
              { 
                label: "Outstanding Due", 
                count: invoicesWithDueCount, 
                color: "bg-rose-500", 
                text: "text-rose-600 dark:text-rose-400", 
                percent: totalInvoicedSum > 0 ? Math.min(100, Math.round((totalDueSum / totalInvoicedSum) * 100)) : 0, 
                amount: `₹${totalDueSum.toLocaleString("en-IN")}` 
              },
            ].map((inv, i) => (
              <div key={i} className="flex items-center text-sm">
                <span className={`w-7 font-black text-center text-xs py-0.5 rounded-md ${inv.text} bg-slate-100 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/60 pill-badge-3d shrink-0`}>
                  {inv.count}
                </span>
                <span className="w-28 ml-2.5 text-slate-700 dark:text-zinc-300 font-bold text-xs truncate">{inv.label}</span>
                <div className="flex-1 mx-3 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden bar-groove-3d">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${Math.max(inv.count > 0 ? 5 : 0, inv.percent)}%` }} 
                    transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }} 
                    className={`h-full rounded-full ${inv.color} bar-fill-3d`} 
                  />
                </div>
                <span className="text-right text-xs text-slate-900 dark:text-white font-black font-mono shrink-0">{inv.amount}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-end mt-auto pt-6 border-t border-border/40 text-xs">
            <div>
              <p className="text-muted-foreground font-semibold text-[11px]">Total Invoiced</p>
              <p className="font-black text-sm text-slate-900 dark:text-white">₹{totalInvoicedSum.toLocaleString("en-IN")}</p>
              <p className="text-[10.5px] text-slate-400 font-medium">{liveInvoices.length} Invoices Issued</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground font-semibold text-[11px]">Outstanding Due</p>
              <p className="font-black text-sm text-rose-600 dark:text-rose-400">₹{totalDueSum.toLocaleString("en-IN")}</p>
              <p className="text-[10.5px] text-rose-500 font-bold">
                {invoicesWithDueCount} {invoicesWithDueCount === 1 ? "Invoice" : "Invoices"} with Due
              </p>
            </div>
          </div>
        </Widget>

        {/* Income vs Expenses (Calculated from Real Database) */}
        <Widget title="Revenue vs Expenses" icon={TrendingUp}>
           <div className="flex mt-2 items-center gap-6">
             <DonutChart data={incomeVsExpenseData} size={130} strokeWidth={14} />
             <div className="flex-1 space-y-3 text-xs">
               <div>
                 <p className="font-semibold text-foreground mb-1">Total Revenue Collected</p>
                 <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                   <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
                   ₹{totalReceivedSum.toLocaleString("en-IN")}
                 </div>
               </div>
               <div>
                 <p className="font-semibold text-foreground mb-1">Logged Expenses</p>
                 <div className="flex items-center gap-1.5 font-bold text-pink-600 text-sm">
                   <span className="w-2.5 h-2.5 rounded-full bg-pink-500"/>
                   ₹{totalExpenseSum.toLocaleString("en-IN")}
                 </div>
               </div>
             </div>
           </div>
           
           <div className="mt-auto pt-4 border-t border-border/40 text-xs flex justify-between">
             <span className="text-muted-foreground">Net Margin</span>
             <span className={`font-bold ${totalReceivedSum >= totalExpenseSum ? "text-emerald-600" : "text-rose-500"}`}>
               ₹{(totalReceivedSum - totalExpenseSum).toLocaleString("en-IN")}
             </span>
           </div>
        </Widget>
      </div>
    </>
  );
}
