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
import { Project, ProjectMilestone, isMarketingProject } from "@/features/projects/types"
import { addOrUpdateProjectMilestone } from "@/features/projects/services/projectService"
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
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { type ProjectDetailViewProps, DONUT_COLORS } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"

export function ProjectDetailViewSection1({ ctrl }: { ctrl: any }) {
  const { activeTab, selectedProject, taskData, renderCommercialOriginDocumentsCard, isSelectedProjectMarketing, renderMilestonesView, onOpenEditModal, setActiveTab, renderDigitalMarketingView, renderInvoicesView, renderTasksListView, renderExpensesView } = ctrl;
  return (
    <>
      {activeTab === "Overview" ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left & Middle Columns (2/3 width) */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Top Row Grid: Gauge + Donut Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Gauge Card */}
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col items-center justify-between">
                    <div className="relative w-36 h-36 flex items-center justify-center my-2">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-zinc-100 dark:text-zinc-700 stroke-current"
                          strokeWidth="3.5"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-500 stroke-current"
                          strokeWidth="3.5"
                          strokeDasharray={`${selectedProject.progress}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-2xl font-bold text-zinc-700 dark:text-zinc-200">
                        {selectedProject.progress}%
                      </span>
                    </div>

                    <div className="w-full space-y-1.5 pt-4 text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
                      <div><strong className="text-zinc-700 dark:text-zinc-300">Start date:</strong> {formatDisplayDate(selectedProject.startDate)}</div>
                      <div><strong className="text-zinc-700 dark:text-zinc-300">Deadline:</strong> <span className="text-red-600 dark:text-red-400 font-bold font-mono">{selectedProject.deadline ? formatDisplayDate(selectedProject.deadline) : "-"}</span></div>
                      <div><strong className="text-zinc-700 dark:text-zinc-300">Status:</strong> {selectedProject.status}</div>
                      {(selectedProject.status === "Completed" || selectedProject.status === "Finished") && (
                        <div className="mt-2.5 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                            <Clock size={13} className="text-emerald-600" />
                            <span>{(selectedProject as any).planDuration || "Service & Hosting Plan"}</span>
                          </div>
                          {(selectedProject as any).countdownStartDate && (
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              Started: <span className="font-mono font-semibold">{formatDisplayDate((selectedProject as any).countdownStartDate)}</span>
                            </div>
                          )}
                          {(selectedProject as any).countdownEndDate ? (
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              Expires: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{formatDisplayDate((selectedProject as any).countdownEndDate)}</span>
                            </div>
                          ) : (selectedProject as any).firstPostDate ? (
                            <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                              First Post: <span className="font-mono font-semibold">{formatDisplayDate((selectedProject as any).firstPostDate)}</span>
                            </div>
                          ) : (
                            <div className="text-[11px] text-amber-600 font-medium">
                              ⏳ Awaiting First Campaign Post to Start Countdown
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Donut Chart Card */}
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={taskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {taskData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Donut Legend */}
                    <div className="flex items-center justify-center gap-3 text-[11px] pt-2 flex-wrap">
                      {taskData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-zinc-600 dark:text-zinc-300">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Total Hours Worked Card */}
                <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                      <Clock size={28} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                        {selectedProject.totalHours || 37.08}
                      </div>
                      <div className="text-xs text-zinc-400">Total hours worked</div>
                    </div>
                  </div>
                </div>

                {/* Commercial Origin Documents (Quotation & Estimate) */}
                {renderCommercialOriginDocumentsCard()}

                {/* PROJECT ARCHITECTURE SPECIFICATIONS CARD */}
                {!isSelectedProjectMarketing ? (
                  /* Technical Project Architecture Card */
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        <Code2 size={16} />
                        <span>Technical Architecture & Infrastructure</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Normal / Tech Project
                      </span>
                    </div>

                    {/* Tech Stack Pills */}
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-500 block mb-1.5">Technology Stack:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {((selectedProject as any).techStack && (selectedProject as any).techStack.length > 0
                          ? (selectedProject as any).techStack
                          : ["Next.js", "React", "Node.js", "PostgreSQL", "Tailwind CSS"]
                        ).map((tech: string) => (
                          <span
                            key={tech}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-900/60"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Git Repo & Live Domain Links */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase flex items-center gap-1">
                          <Code2 size={11} className="text-zinc-500" />
                          <span>Git Repository</span>
                        </span>
                        {(selectedProject as any).gitUrl ? (
                          <a
                            href={(selectedProject as any).gitUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{(selectedProject as any).gitUrl}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">Git repo configured via deployment</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 space-y-1">
                        <span className="text-[10px] text-zinc-400 font-semibold uppercase flex items-center gap-1">
                          <ExternalLink size={11} className="text-zinc-500" />
                          <span>Live Web Domain</span>
                        </span>
                        {(selectedProject as any).liveUrl ? (
                          <a
                            href={(selectedProject as any).liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{(selectedProject as any).liveUrl}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">Staging / Production domain</span>
                        )}
                      </div>
                    </div>

                    {/* Hosting Infrastructure */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Hosting Infrastructure:</span>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {(selectedProject as any).hostingEnvironment || "Dedicated Linux VPS (Hostinger / DigitalOcean)"}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Digital Marketing Retainer Specifications Card */
                  <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        <Megaphone size={16} />
                        <span>Campaign Deliverables & Retainer Quotas</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Digital Marketing Retainer
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="text-[10px] text-zinc-500 block">Plan Tier</span>
                        <span className="font-bold text-xs text-purple-700 dark:text-purple-300">
                          {(selectedProject as any).marketingRetainer?.planTier || (selectedProject as any).marketingPackage?.planName || "Package 02 - Grow"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="text-[10px] text-zinc-500 block">Monthly Posters</span>
                        <span className="font-black font-mono text-sm text-purple-700 dark:text-purple-300">
                          {(selectedProject as any).marketingRetainer?.postersQuota ?? (selectedProject as any).marketingPackage?.postersCount ?? 12}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
                        <span className="text-[10px] text-zinc-500 block">Monthly Reels</span>
                        <span className="font-black font-mono text-sm text-purple-700 dark:text-purple-300">
                          {(selectedProject as any).marketingRetainer?.reelsQuota ?? (selectedProject as any).marketingPackage?.reelsCount ?? 2}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                        <span className="text-[10px] text-zinc-500 block">Monthly Ad Budget</span>
                        <span className="font-black font-mono text-sm text-emerald-700 dark:text-emerald-300">
                          ₹{((selectedProject as any).marketingRetainer?.monthlyAdBudget || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Model Shoot Schedule:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {(selectedProject as any).marketingRetainer?.shootDate || "Scheduled during campaign kickoff"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60">
                        <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Target Geography:</span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {(selectedProject as any).marketingRetainer?.targetGeo || "Regional / Local commerce radius"}
                        </span>
                      </div>
                    </div>

                    {(selectedProject as any).marketingRetainer?.driveUrl && (
                      <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 font-medium">Creative Assets & Photoshoots:</span>
                        <a
                          href={(selectedProject as any).marketingRetainer.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <span>Open Google Drive</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Developer Milestones & Updates Card in Overview */}
                {renderMilestonesView()}

                {/* Project Members Card with Pro-Rata Commission Attribution */}
                {(() => {
                  const numProjTotal = parseFloat(
                    String(selectedProject.totalAmount ?? selectedProject.baseAmount ?? selectedProject.price ?? "0").replace(/[^0-9.]/g, "")
                  ) || 0

                  const effectiveClientPaid = typeof selectedProject.paidAmount === "number"
                    ? selectedProject.paidAmount
                    : (selectedProject.paymentStatus === "Paid" || selectedProject.status === "Completed"
                      ? numProjTotal
                      : (typeof selectedProject.advanceAmount === "number" ? selectedProject.advanceAmount : 0))

                  const effectiveClientDue = Math.max(0, numProjTotal - effectiveClientPaid)
                  const paidRatio = numProjTotal > 0 ? Math.min(1, effectiveClientPaid / numProjTotal) : 0
                  const isSubRetainer = isSelectedProjectMarketing || Boolean(selectedProject.subscriptionId) || String(selectedProject.title).toLowerCase().includes("package")

                  return (
                    <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                        <div>
                          <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Assigned Team Members & Pro-Rata Commission
                          </h3>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Commissions unlock pro-rata as client makes payments (e.g. 10% advance unlocks 10% commission).
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenEditModal(selectedProject)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                        >
                          <Plus size={13} />
                          <span>Manage Team</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(selectedProject.members || []).length === 0 ? (
                          <p className="text-zinc-400 text-xs py-2 text-center">No team assigned yet. Click 'Manage Team' to assign developer.</p>
                        ) : (
                          (selectedProject.members || []).map((m) => {
                            const sharePct = typeof m.sharePercentage === "number" ? m.sharePercentage : 15
                            const memberTotalPayout = m.payoutType === "fixed" && typeof m.payoutAmount === "number"
                              ? m.payoutAmount
                              : Math.round((numProjTotal * sharePct) / 100)
                            const memberEarnedPayout = Math.round(paidRatio * memberTotalPayout)
                            const memberPendingPayout = Math.max(0, memberTotalPayout - memberEarnedPayout)

                            return (
                              <div
                                key={m.id}
                                className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={(m as any).avatarUrl || m.avatar || getUserAvatar(m.name, undefined, m.name)}
                                      alt={m.name}
                                      className="w-8 h-8 rounded-full object-cover bg-surface border border-purple-200 shrink-0"
                                    />
                                    <div>
                                      <div className="font-bold text-zinc-800 dark:text-zinc-200">{m.name}</div>
                                      <div className="text-[11px] text-zinc-400">{m.role || "Developer"}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      {m.payoutType === "fixed" ? `Fixed ₹${(m.payoutAmount || 0).toLocaleString("en-IN")}` : `${sharePct}% Commission`}
                                    </span>
                                  </div>
                                </div>

                                {/* Pro-Rata Attribution Strip */}
                                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 text-[10.5px]">
                                  <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-700">
                                    <span className="text-zinc-400 block text-[9.5px]">Total Potential:</span>
                                    <span className="font-bold font-mono text-zinc-800 dark:text-zinc-200">
                                      ₹{memberTotalPayout.toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 font-semibold text-[9.5px]">
                                      <span>Earned (Pro-Rata):</span>
                                      <span className="font-bold">{(paidRatio * 100).toFixed(0)}%</span>
                                    </div>
                                    <span className="font-black font-mono text-emerald-700 dark:text-emerald-300 text-xs">
                                      ₹{memberEarnedPayout.toLocaleString("en-IN")}
                                    </span>
                                    <div className="text-[9px] text-emerald-600 dark:text-emerald-400 truncate">
                                      {effectiveClientPaid > 0 ? `On ₹${effectiveClientPaid.toLocaleString("en-IN")} advance` : "Awaiting payment"}
                                    </div>
                                  </div>
                                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                                    <span className="text-amber-700 dark:text-amber-300 block text-[9.5px] font-semibold">Pending Due:</span>
                                    <span className="font-bold font-mono text-amber-700 dark:text-amber-300 text-xs">
                                      ₹{memberPendingPayout.toLocaleString("en-IN")}
                                    </span>
                                    <div className="text-[9px] text-amber-600 dark:text-amber-400 truncate">
                                      {effectiveClientDue > 0 ? `Unlocks on ₹${effectiveClientDue.toLocaleString("en-IN")}` : "Fully settled"}
                                    </div>
                                  </div>
                                </div>

                                {isSubRetainer && (
                                  <div className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold flex items-center justify-between">
                                    <span>🔄 Retainer Recurring Payout:</span>
                                    <span className="font-mono font-bold">
                                      ₹{memberTotalPayout.toLocaleString("en-IN")} per monthly paid billing cycle
                                    </span>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })()}

              </div>

              {/* Right Column: Activity Timeline & Project In-Charge */}
              <div className="space-y-6">
                {/* ATTACHED OFFICIAL INVOICE CARD */}
                <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      <Receipt size={14} className="text-blue-600" />
                      <span>Attached Official Invoice</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("Invoices")}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      View Invoices →
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Invoice ID:</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {selectedProject.invoiceNumber || selectedProject.invoiceId || "Live Attached"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Total Invoiced:</span>
                      <span className="font-mono font-black text-zinc-900 dark:text-zinc-100 text-sm">
                        {selectedProject.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span>Client Paid / Advance:</span>
                      <span className="font-mono font-bold">
                        ₹{(typeof selectedProject.paidAmount === "number" ? selectedProject.paidAmount : (selectedProject.advanceAmount || 0)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold">
                      <span>Balance Due:</span>
                      <span className="font-mono font-bold">
                        ₹{(typeof selectedProject.dueAmount === "number" ? selectedProject.dueAmount : 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project In-Charge / Billed By */}
                <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Admin & Billing Information</h3>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-400">Billed By:</span>
                      <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
                        <img
                          src={getUserAvatar(selectedProject.billedBy || "Admin", undefined, selectedProject.billedBy || "Admin")}
                          alt={selectedProject.billedBy || "Admin"}
                          className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0"
                        />
                        <span>{selectedProject.billedBy || "Admin"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Client:</span>
                      <span className="font-bold text-blue-600">{selectedProject.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Project Value:</span>
                      <span className="font-bold text-emerald-600">{selectedProject.price}</span>
                    </div>
                    {selectedProject.advanceAmount !== undefined && selectedProject.advanceAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/60 dark:bg-emerald-950/30 px-2 py-1 rounded">
                        <span>Advance Paid:</span>
                        <span>₹{selectedProject.advanceAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    {selectedProject.dueAmount !== undefined && selectedProject.dueAmount > 0 && (
                      <div className="flex justify-between text-[11px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50/60 dark:bg-amber-950/30 px-2 py-1 rounded">
                        <span>Balance Due:</span>
                        <span>₹{selectedProject.dueAmount.toLocaleString("en-IN")} {selectedProject.installmentsCount ? `(${selectedProject.installmentsCount} Parts)` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col">
                  <h3 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Activity Timeline</h3>

                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                    {(selectedProject.activityLogs || []).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 text-xs border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                        <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {log.user.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[11px] text-zinc-500">
                            <strong className="text-zinc-800 dark:text-zinc-200">{log.user}</strong> {log.timestamp}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-600 text-white">
                              {log.action}
                            </span>
                            {log.badge && (
                              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                                {log.badge} -
                              </span>
                            )}
                            <span className="text-[11px] text-zinc-600 dark:text-zinc-400">{log.title}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (activeTab === "Digital Marketing Retainer" || activeTab === "Digital Marketing (Form 9)") ? (
            renderDigitalMarketingView()
          ) : activeTab === "Milestones" ? (
            renderMilestonesView()
          ) : activeTab === "Invoices" ? (
            renderInvoicesView()
          ) : activeTab === "Tasks List" || activeTab === "Tasks Kanban" ? (
            renderTasksListView()
          ) : activeTab === "Expenses" ? (
            renderExpensesView()
          ) : (
            <div className="p-12 text-center text-zinc-400 text-sm bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              Content for <strong className="text-zinc-700 dark:text-zinc-200">{activeTab}</strong> view will render here.
            </div>
          )}
    </>
  );
}
