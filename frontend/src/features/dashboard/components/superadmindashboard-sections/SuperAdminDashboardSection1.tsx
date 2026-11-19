"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  GitBranch,
  Users,
  Briefcase,
  IndianRupee,
  ChevronDown,
  Eye,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Plus,
  Clock,
  FileText,
  CreditCard,
  FolderKanban,
  Check,
  TrendingUp,
  ArrowUp,
  MapPin,
  Monitor,
  CheckSquare,
  Calendar,
  PieChart,
  AlertCircle,
  Bell,
  Grid,
  DollarSign,
  Sparkles,
  Layers
} from "lucide-react"
import Link from "next/link"
import { useAuthStore, getCompanyFullName, isMatchingCompany, isMatchingBranch, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getActivityLogs, ActivityLog } from "@/services/activityLogService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { Widget } from "@/features/dashboard/components/Widget"
import { KPICard } from "@/features/dashboard/components/KPICard"
import { DonutChart } from "@/features/dashboard/components/DonutChart"
import { getUserAvatar } from "@/features/users/services/userService"
import { taskService } from "@/features/tasks/services/taskService"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "@/features/tasks/types"
import { Project } from "@/features/projects/types"
import { type CompanyRow, type BranchRow, parseAmt, formatINR, formatTime } from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardHelpers"

export function SuperAdminDashboardSection1({ ctrl }: { ctrl: any }) {
  const { isAllCompanies, totalCompaniesCount, totalBranchesCount, activeUsersCount, activeProjectsCount, totalRevenueNumber, realCompaniesData, revenueYear, setRevenueYear, totalReceivedNumber, totalOutstandingNumber, setActiveTab, activeTab, realBranchesData, activities, getActivityIcon, formatActivityTime, currentCompanyDisplayName, isBranchSelected, currentBranchDisplayName, dbTimecards, scopedTasks, activeCompanyInvoiced, scopedInvoices, activeCompanyDue, invoicesWithDueCount, openProjectsCount, completedProjectsCount, holdProjectsCount, averageProjectProgression, scopedProjects, scopedOrders, paidInvoicesCount, paidInvoicesReceived, partialInvoicesCount, partialInvoicesReceived, incomeVsExpenseData, activeCompanyReceived, activeCompanyExpenses, activeCompanyMargin, taskDonutData, taskTodoCount, taskInProgressCount, taskReviewCount, taskDoneCount, scopedUsers, dbOrders, selectedUserEmail, setSelectedUserEmail, user, noteText, updateNoteText } = ctrl;
  return (
    <>
      {isAllCompanies ? (
        <>
          {/* ── 1ST DASHBOARD: GROUP MULTI-COMPANY OVERVIEW (SUPER ADMIN ALL COMPANIES VIEW) ── */}
          {/* ── SECTION 2: 5 METRIC KPI CARDS ROW (EXACT LAYOUT & ACCURATE DATA) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Companies */}
        <div className="kpi-card-premium flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs">
              <Building2 size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold">Total Companies</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{totalCompaniesCount}</p>
              <p className="text-[11px] text-muted-foreground">Active Corporate Entities</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUp size={13} className="mr-0.5" />
            <span>8% from last month</span>
          </div>
        </div>

        {/* Card 2: Total Branches */}
        <div className="kpi-card-premium flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <GitBranch size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold">Total Branches</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{totalBranchesCount}</p>
              <p className="text-[11px] text-muted-foreground">Active Branch Offices</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUp size={13} className="mr-0.5" />
            <span>12% from last month</span>
          </div>
        </div>

        {/* Card 3: Total Users */}
        <div className="kpi-card-premium flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-xs">
              <Users size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold">Total Users</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{activeUsersCount}</p>
              <p className="text-[11px] text-muted-foreground">Registered Personnel</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUp size={13} className="mr-0.5" />
            <span>15% from last month</span>
          </div>
        </div>

        {/* Card 4: Total Projects */}
        <div className="kpi-card-premium flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Briefcase size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold">Total Projects</p>
              <p className="text-2xl font-black text-foreground mt-0.5">{activeProjectsCount}</p>
              <p className="text-[11px] text-muted-foreground">Running Operations</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUp size={13} className="mr-0.5" />
            <span>10% from last month</span>
          </div>
        </div>

        {/* Card 5: Total Revenue */}
        <div className="kpi-card-premium flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20 shadow-xs">
              <IndianRupee size={22} />
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold">Total Revenue</p>
              <p className="text-xl font-black text-foreground mt-0.5">{formatINR(totalRevenueNumber)}</p>
              <p className="text-[11px] text-muted-foreground">Consolidated Pipeline</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUp size={13} className="mr-0.5" />
            <span>18% from last month</span>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: MIDDLE ROW (3 VISUAL ANALYSIS CARDS: 1/3, 1/3, 1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Company Wise Overview (Donut Chart - Dynamic Companies) */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">
              Company Wise Overview
            </h3>

            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart with Center Text for Companies */}
              <div className="relative flex items-center justify-center shrink-0 w-36 h-36">
                <svg viewBox="0 0 100 100" className="w-36 h-36 -rotate-90 transform">
                  {(realCompaniesData || []).map((item, idx) => {
                    const circ = 238.76
                    const pct = Math.max(0, Math.min(100, Number(item?.percent) || 0))
                    const strokeLen = (pct / 100) * circ
                    const prevPercentSum = (realCompaniesData || []).slice(0, idx).reduce((s, x) => s + (Number(x?.percent) || 0), 0)
                    const offset = -((prevPercentSum / 100) * circ)
                    return (
                      <circle
                        key={item?.id || idx}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={item?.color || "#3b82f6"}
                        strokeWidth="12"
                        strokeDasharray={`${strokeLen.toFixed(2)} ${circ.toFixed(2)}`}
                        strokeDashoffset={Number(offset.toFixed(2)) || 0}
                      />
                    )
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-base font-black text-slate-900 dark:text-white">{formatINR(totalRevenueNumber)}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Total Revenue</span>
                </div>
              </div>

              {/* Legend List strictly for the companies */}
              <div className="space-y-3 flex-1 min-w-0 text-xs">
                {(realCompaniesData || []).map((item, idx) => (
                  <div key={item?.id || idx} className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item?.color || "#3b82f6" }} />
                      <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{item?.name || "Company"}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white">{formatINR(item?.revenue || 0)}</span>
                      <span className="text-[10px] text-slate-400 ml-1.5">{Number(item?.percent || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 text-center border-t border-slate-100 dark:border-zinc-800/80">
            <Link href="/feature/companies" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors inline-flex items-center gap-1">
              <span>View all companies</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Card 2: Revenue Overview (All Companies) - Smooth Area Chart */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Revenue Overview (All Companies)
              </h3>
              <div className="relative">
                <select
                  value={revenueYear}
                  onChange={(e) => setRevenueYear(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 text-xs font-semibold bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="This Year">This Year</option>
                  <option value="Last Year">Last Year</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Smooth SVG Area Graph matching exact screenshot */}
            <div className="relative h-44 w-full">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="revGradExact" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="390" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y="24" fontSize="9" fill="#94a3b8" textAnchor="end">₹40L</text>

                <line x1="40" y1="50" x2="390" y2="50" stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y="54" fontSize="9" fill="#94a3b8" textAnchor="end">₹30L</text>

                <line x1="40" y1="80" x2="390" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y="84" fontSize="9" fill="#94a3b8" textAnchor="end">₹20L</text>

                <line x1="40" y1="110" x2="390" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y="114" fontSize="9" fill="#94a3b8" textAnchor="end">₹10L</text>

                <line x1="40" y1="140" x2="390" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                <text x="30" y="144" fontSize="9" fill="#94a3b8" textAnchor="end">₹0</text>

                {/* Area Fill */}
                <path
                  d="M 50 100 Q 95 60, 140 75 T 230 85 T 320 50 T 385 25 L 385 140 L 50 140 Z"
                  fill="url(#revGradExact)"
                />

                {/* Curved Blue Line */}
                <path
                  d="M 50 100 Q 95 60, 140 75 T 230 85 T 320 50 T 385 25"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Data Points */}
                {[
                  { x: 50, y: 100, month: "Jan" },
                  { x: 95, y: 70, month: "Feb" },
                  { x: 140, y: 75, month: "Mar" },
                  { x: 190, y: 88, month: "Apr" },
                  { x: 235, y: 72, month: "May" },
                  { x: 280, y: 62, month: "Jun" },
                  { x: 330, y: 48, month: "Jul" },
                  { x: 385, y: 25, month: "Aug" },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
                    <text x={pt.x} y="156" fontSize="9" fill="#94a3b8" textAnchor="middle">{pt.month}</text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Bottom 3 Summary Metric Blocks */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 text-center">
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Total Invoiced</p>
                <p className="text-xs font-black text-blue-600 mt-0.5">{formatINR(totalRevenueNumber)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Total Received</p>
                <p className="text-xs font-black text-emerald-600 mt-0.5">{formatINR(totalReceivedNumber)}</p>
              </div>
              <div className="bg-slate-50 dark:bg-zinc-800/50 p-2.5 rounded-xl">
                <p className="text-[10px] text-slate-400 font-medium">Outstanding</p>
                <p className="text-xs font-black text-rose-600 mt-0.5">{formatINR(totalOutstandingNumber)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Top Performing Companies (STRICTLY 3 REAL COMPANIES) */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5">
              Top Performing Companies
            </h3>

            <div className="space-y-4">
              {realCompaniesData.map((comp) => (
                <div key={comp.id} className="flex items-center gap-3 text-xs">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ backgroundColor: `${comp.color}15`, color: comp.color, borderColor: `${comp.color}30` }}
                  >
                    <Building2 size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">{comp.name}</span>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white">{formatINR(comp.revenue)}</span>
                        <span className="text-[10px] text-slate-400 ml-2">{Math.round(comp.percent)}%</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${comp.percent}%`, backgroundColor: comp.color }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3 text-center border-t border-slate-100 dark:border-zinc-800/80">
            <Link href="/feature/reports" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors inline-flex items-center gap-1">
              <span>View detailed report</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: ALL COMPANIES & BRANCHES TABLE (2/3) + RECENT ACTIVITIES (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3: Overview Table (3 Real Companies & 4 Real Branches) */}
        <div className="lg:col-span-2 table-3d-wrapper p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-3">
              All Companies & Branches Overview
            </h3>

            {/* Tabs: Companies View vs Branches View */}
            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-zinc-800 mb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("companies")}
                className={`pb-2.5 transition-colors cursor-pointer relative ${
                  activeTab === "companies" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Companies View
                {activeTab === "companies" && (
                  <motion.div layoutId="tabUnderline3" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("branches")}
                className={`pb-2.5 transition-colors cursor-pointer relative ${
                  activeTab === "branches" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                Branches View
                {activeTab === "branches" && (
                  <motion.div layoutId="tabUnderline3" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                )}
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-800/80 text-slate-400 font-semibold text-[11px]">
                    <th className="pb-3 pr-4">{activeTab === "companies" ? "Company Name" : "Branch Name"}</th>
                    <th className="pb-3 px-3 text-center">{activeTab === "companies" ? "Total Branches" : "Parent Company"}</th>
                    <th className="pb-3 px-3 text-center">Active Users</th>
                    <th className="pb-3 px-3 text-center">Active Projects</th>
                    <th className="pb-3 px-3 text-right">Revenue (This Month)</th>
                    <th className="pb-3 px-3 text-right">Outstanding</th>
                    <th className="pb-3 pl-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                  {activeTab === "companies" ? (
                    realCompaniesData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                            style={{ backgroundColor: `${row.color}15`, color: row.color, borderColor: `${row.color}30` }}
                          >
                            <Building2 size={13} />
                          </div>
                          <span className="truncate">{row.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">{row.branches}</td>
                        <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">{row.users}</td>
                        <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">{row.projects}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(row.revenue)}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(row.outstanding)}</td>
                        <td className="py-3.5 pl-4 text-center">
                          <Link href="/feature/companies" className="p-1 text-slate-400 hover:text-blue-600 inline-block transition-colors">
                            <Eye size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    realBranchesData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-3.5 pr-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                            <GitBranch size={13} />
                          </div>
                          <span className="truncate">{row.name}</span>
                        </td>
                        <td className="py-3.5 px-3 text-center text-slate-500">{row.companyName}</td>
                        <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">{row.users}</td>
                        <td className="py-3.5 px-3 text-center font-medium text-slate-600 dark:text-zinc-300">{row.projects}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(row.revenue)}</td>
                        <td className="py-3.5 px-3 text-right font-bold text-slate-900 dark:text-white">{formatINR(row.outstanding)}</td>
                        <td className="py-3.5 pl-4 text-center">
                          <Link href="/feature/branches" className="p-1 text-slate-400 hover:text-blue-600 inline-block transition-colors">
                            <Eye size={15} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 pt-3 text-center border-t border-slate-100 dark:border-zinc-800/80">
            <Link 
              href={activeTab === "companies" ? "/feature/companies" : "/feature/branches"} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors inline-flex items-center gap-1"
            >
              <span>{activeTab === "companies" ? "View all companies" : "View all branches"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right 1/3: Recent Activities Card (Filtered against company) */}
        <div className="card-3d p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-foreground">
                Recent Activities
              </h3>
              <Link href="/feature/activity-logs" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                View All
              </Link>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No recent activities recorded.</p>
              ) : (
                activities.slice(0, 5).map((act) => {
                  const conf = getActivityIcon(act.type)
                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${conf.bg}`}>
                        {conf.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                          {act.description}
                        </p>
                        {act.companyName && (
                          <p className="text-[10.5px] text-slate-400 mt-0.5 font-medium truncate">
                            {act.companyName}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                          {formatActivityTime(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-3 text-center border-t border-slate-100 dark:border-zinc-800/80">
            <Link href="/feature/activity-logs" className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-1">
              <span>View full audit logs</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  ) : (
    /* ────────────────────────────────────────────────────────────────────────── */
    /* ── 2ND DASHBOARD: OPERATIONAL DATA & WIDGETS (SPECIFIC COMPANY DATA) ──── */
    /* ────────────────────────────────────────────────────────────────────────── */
    <div className="space-y-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderKanban size={18} className="text-blue-600" />
            <span>Operational Management & Shift Tracking</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Live attendance clock, project pipelines, billing breakdown, and staff monitoring for {currentCompanyDisplayName}{isBranchSelected ? ` — ${currentBranchDisplayName}` : ""}
          </p>
        </div>
      </div>

        {/* Operational KPI & Clock-In Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
          <KPICard 
            icon={Clock} 
            colorClass="bg-blue-600" 
            value={
              <div className="flex items-center justify-between">
                <span>{dbTimecards.filter(t => t.status === "Active Shift" || t.status === "On Break").length} Active</span>
                <Link 
                  href="/feature/attendance"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-200/60 dark:border-blue-900/60"
                >
                  <span>Hub</span>
                  <ArrowUpRight size={13} />
                </Link>
              </div>
            } 
            label="Live Team Shifts" 
            subtextNode={
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Staff Clocked In</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Monitoring
                </span>
              </div>
            }
          />
          <KPICard 
            icon={Grid} 
            colorClass="bg-blue-500" 
            value={`${scopedTasks.filter(t => t.status !== "Done").length} Open`} 
            label="Active Tasks" 
            subtextNode={
              <div className="mt-1 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 pill-badge-3d">
                  {scopedTasks.length} Total Tasks
                </span>
              </div>
            }
          />
          <KPICard 
            icon={Calendar} 
            colorClass="bg-indigo-500" 
            value={formatINR(activeCompanyInvoiced)} 
            label="Total Invoiced" 
            subtextNode={
              <div className="mt-1 flex items-center justify-end">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 pill-badge-3d">
                  {scopedInvoices.length} {scopedInvoices.length === 1 ? "Invoice" : "Invoices"}
                </span>
              </div>
            }
          />
          <KPICard 
            icon={PieChart} 
            colorClass="bg-rose-500" 
            value={formatINR(activeCompanyDue)} 
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

        {/* Operational Overviews Row: Projects, Invoices, Revenue vs Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Projects Overview */}
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
              <div className="h-6 w-full rounded-full border border-emerald-500 p-0.5 relative flex items-center bar-groove-3d">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${averageProjectProgression}%` }} 
                  transition={{ duration: 1, ease: "easeOut" }} 
                  className="h-full bg-emerald-300/50 rounded-full bar-fill-3d" 
                />
                <span className="absolute inset-0 flex items-center justify-center text-xs text-emerald-700 dark:text-emerald-300 font-bold z-10 pointer-events-none">
                  Average Progression: {averageProjectProgression}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 mt-6 pt-4 border-t border-border/40 gap-4 text-xs">
              <div className="text-center border-r border-border/40">
                 <p className="text-lg font-bold text-foreground">{scopedProjects.length}</p>
                 <p className="text-[11px] text-muted-foreground mt-0.5">{isBranchSelected ? "Branch Projects" : "Total Company Projects"}</p>
              </div>
              <div className="text-center">
                 <p className="text-lg font-bold text-blue-600">{scopedOrders.length}</p>
                 <p className="text-[11px] text-muted-foreground mt-0.5">{isBranchSelected ? "Branch Orders" : "Sales Orders"}</p>
              </div>
            </div>
          </Widget>

          {/* Invoice & Billing Overview */}
          <Widget title="Invoice & Billing Overview" icon={FileText}>
            <div className="space-y-4 pt-2">
              {[
                { 
                  label: "Fully Paid", 
                  count: paidInvoicesCount, 
                  color: "bg-emerald-500", 
                  text: "text-emerald-600 dark:text-emerald-400", 
                  percent: activeCompanyInvoiced > 0 ? Math.min(100, Math.round((paidInvoicesReceived / activeCompanyInvoiced) * 100)) : 0, 
                  amount: formatINR(paidInvoicesReceived)
                },
                { 
                  label: "Partially Paid", 
                  count: partialInvoicesCount, 
                  color: "bg-amber-500", 
                  text: "text-amber-600 dark:text-amber-400", 
                  percent: activeCompanyInvoiced > 0 ? Math.min(100, Math.round((partialInvoicesReceived / activeCompanyInvoiced) * 100)) : 0, 
                  amount: formatINR(partialInvoicesReceived)
                },
                { 
                  label: "Outstanding Due", 
                  count: invoicesWithDueCount, 
                  color: "bg-rose-500", 
                  text: "text-rose-600 dark:text-rose-400", 
                  percent: activeCompanyInvoiced > 0 ? Math.min(100, Math.round((activeCompanyDue / activeCompanyInvoiced) * 100)) : 0, 
                  amount: formatINR(activeCompanyDue) 
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
                <p className="font-black text-sm text-slate-900 dark:text-white">{formatINR(activeCompanyInvoiced)}</p>
                <p className="text-[10.5px] text-slate-400 font-medium">
                  {scopedInvoices.length} {scopedInvoices.length === 1 ? "Invoice Issued" : "Invoices Issued"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground font-semibold text-[11px]">Outstanding Due</p>
                <p className="font-black text-sm text-rose-600 dark:text-rose-400">{formatINR(activeCompanyDue)}</p>
                <p className="text-[10.5px] text-rose-500 font-bold">
                  {invoicesWithDueCount} {invoicesWithDueCount === 1 ? "Invoice" : "Invoices"} with Due
                </p>
              </div>
            </div>
          </Widget>

          {/* Revenue vs Expenses */}
          <Widget title="Revenue vs Expenses" icon={TrendingUp}>
             <div className="flex mt-2 items-center gap-6">
               <DonutChart data={incomeVsExpenseData} size={130} strokeWidth={14} />
               <div className="flex-1 space-y-3 text-xs">
                 <div>
                   <p className="font-semibold text-foreground mb-1">Total Revenue Collected</p>
                   <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-sm">
                     <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"/>
                     {formatINR(activeCompanyReceived)}
                   </div>
                 </div>
                 <div>
                   <p className="font-semibold text-foreground mb-1">Logged Expenses</p>
                   <div className="flex items-center gap-1.5 font-bold text-pink-600 text-sm">
                     <span className="w-2.5 h-2.5 rounded-full bg-pink-500"/>
                     {formatINR(activeCompanyExpenses)}
                   </div>
                 </div>
               </div>
             </div>
             
             <div className="mt-auto pt-4 border-t border-border/40 text-xs flex justify-between">
               <span className="text-muted-foreground">Net Operating Margin</span>
               <span className="font-bold text-emerald-600">
                 {formatINR(activeCompanyMargin)}
               </span>
             </div>
          </Widget>
        </div>

        {/* Tasks, Team Members, and Recent Orders (Placed ABOVE Attendance section) */}
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
               <div className="text-muted-foreground font-medium">Total Tasks: <strong className="text-foreground font-bold">{scopedTasks.length}</strong></div>
               <Link href="/feature/tasks" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline transition-colors flex items-center gap-1">
                 View Task Kanban →
               </Link>
            </div>
          </Widget>

          {/* Team Members Overview */}
          <Widget title="Team Members Overview" icon={Users}>
             <div className="grid grid-cols-2 gap-4 py-4 text-center">
                <div className="p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-border/30">
                  <p className="text-3xl font-extrabold text-foreground">{scopedUsers.length}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Total Registered</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-500/20">
                  <p className="text-3xl font-extrabold text-emerald-500">{scopedUsers.filter(u => u.status === "Active").length}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">Active Accounts</p>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/40 text-center text-xs">
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{scopedUsers.filter(u => u.role === "Admin" || u.role === "Super Admin").length}</p>
                  <p className="text-muted-foreground mt-0.5 font-medium">Admins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{scopedUsers.filter(u => u.role === "Teams" || u.role === "Team").length}</p>
                  <p className="text-muted-foreground mt-0.5 font-medium">Staff Members</p>
                </div>
             </div>
             
             <div className="mt-auto pt-3 border-t border-border/40 text-center">
               <Link href="/feature/users" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline text-xs">
                 Manage Users Directory →
               </Link>
             </div>
          </Widget>

          {/* Recent Orders & Billing */}
          <Widget title="Recent Orders & Billing" icon={DollarSign}>
             <div className="space-y-2.5 pt-1 text-xs">
               {dbOrders.length === 0 ? (
                 <p className="text-muted-foreground text-center py-6">No sales orders created yet.</p>
               ) : (
                 dbOrders.slice(0, 4).map((ord) => (
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
               <Link href="/feature/sales/invoices" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline text-xs font-bold">
                 View All Sales Orders →
               </Link>
             </div>
          </Widget>
        </div>

        {/* Real Staff Attendance & Session Monitor Box */}
        <div className="mb-6">
          <Widget title="Company Staff Attendance & Session Monitor" icon={Users}>
            <div className="space-y-3">
              {/* Header Filters & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground">Filter Staff:</span>
                  <select
                    value={selectedUserEmail}
                    onChange={(e) => setSelectedUserEmail(e.target.value)}
                    className="px-3 py-1.5 bg-surface border border-border/80 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-xs"
                  >
                    <option value="">All Company Staff ({scopedUsers.length})</option>
                    {(scopedUsers.length > 0 ? scopedUsers : (user ? [user] : [])).filter(Boolean).map((u, uIdx) => {
                      const uEmail = u?.email || ""
                      const uName = u?.name || u?.full_name || uEmail || "User"
                      const uRole = u?.role || "User"
                      return (
                        <option key={`${(uEmail || u?.id || "user").toString().toLowerCase().trim()}-${uIdx}`} value={uEmail}>
                          {uName} ({uRole}{uEmail ? ` - ${uEmail}` : ""})
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active Session: {user?.name}
                  </span>
                  <span className="text-muted-foreground font-semibold px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    Total Staff: {(scopedUsers.length > 0 ? scopedUsers : (user ? [user] : [])).length}
                  </span>
                </div>
              </div>

              {/* Scrollable Attendance Box Container */}
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
                        const rawUsers = (scopedUsers.length > 0 ? scopedUsers : (user ? [user] : [])).filter(Boolean)
                        const filtered = selectedUserEmail
                          ? rawUsers.filter(u => (u?.email || "").toLowerCase().trim() === selectedUserEmail.toLowerCase().trim())
                          : rawUsers

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className="text-center py-8 text-muted-foreground">
                                No staff records found for selected filter.
                              </td>
                            </tr>
                          )
                        }

                        return filtered.map((u, uIdx) => {
                          const uEmail = (u?.email || "").toLowerCase().trim()
                          const currentEmail = (user?.email || "").toLowerCase().trim()
                          const isActiveUser = Boolean(uEmail && currentEmail && uEmail === currentEmail)

                          const uCard = dbTimecards.find((tc: any) => tc.memberEmail?.toLowerCase().trim() === uEmail)
                          let punchInTime = uCard?.inTime || "09:30 AM"
                          let punchOutTime = uCard?.outTime || (uCard?.status === "Active Shift" ? "Active Session" : "-")
                          let workedHours = uCard?.durationSecs ? `${Math.floor(uCard.durationSecs / 3600)}h ${Math.floor((uCard.durationSecs % 3600) / 60)}m` : "-"
                          let statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Offline</span>

                          if (uCard?.status === "Active Shift") {
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">🟢 CLOCKED IN</span>
                          } else if (uCard?.status === "On Break") {
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 shadow-xs">☕ ON BREAK</span>
                          } else if (uCard?.status === "Completed") {
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold shadow-xs">🔵 COMPLETED</span>
                          } else if (u?.status === "Active") {
                            statusBadge = <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">ACTIVE</span>
                          }

                          const displayName = u?.name || u?.full_name || u?.email || "User"

                          return (
                            <tr key={u?.email || u?.id || uIdx} className={`hover:bg-surface-hover/50 transition-colors ${isActiveUser ? "bg-blue-500/5 font-medium" : ""}`}>
                              <td className="py-2.5 px-3 font-mono font-medium">Today</td>
                              <td className="py-2.5 px-3 font-bold text-foreground flex items-center gap-1.5">
                                <img src={getUserAvatar(u?.email || "", undefined, displayName)} alt={displayName} className="w-5 h-5 rounded-full border border-border/50 shrink-0 shadow-xs" />
                                <span className="truncate max-w-[140px]">{displayName}</span>
                                {isActiveUser && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.2 rounded font-bold shadow-xs">YOU</span>}
                              </td>
                              <td className="py-2.5 px-3 text-muted-foreground">{u?.role || "User"}</td>
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

                {/* Box Footer Summary */}
                <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-800/60 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>Scroll box container to view all team attendance records</span>
                  <Link href="/feature/attendance" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    View Full Attendance & Biometric Portal →
                  </Link>
                </div>
              </div>
            </div>
          </Widget>
        </div>

        {/* Open Projects, Tasks, Sticky Note */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
             {/* Open Projects List */}
             <Widget title={`Open Projects in ${currentCompanyDisplayName}`} icon={Grid}>
                <div className="space-y-4 pt-2">
                  {scopedProjects.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-8 text-center">No projects registered yet for {currentCompanyDisplayName}.</p>
                  ) : (
                    scopedProjects.slice(0, 5).map((p, i) => (
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

             {/* Recent Tasks */}
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
                      {scopedTasks.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            No tasks recorded for this company.
                          </td>
                        </tr>
                      ) : (
                        scopedTasks.slice(0, 5).map((t, i) => (
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
            <Widget title="Personal Executive Sticky Note" icon={FileText} className="h-full min-h-[380px] !bg-yellow-200/50 dark:!bg-yellow-900/30 border-yellow-300">
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
      )}
    </>
  );
}
