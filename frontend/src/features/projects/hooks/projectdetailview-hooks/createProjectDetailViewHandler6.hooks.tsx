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

export function createProjectDetailViewHandler6(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { currentMarketingPkg, selectedProject, onOpenEditModal, handleSaveMarketingPackage } = getCtrl();
    const __fn: any = () => {
    return (
      <div className="space-y-6">
        {/* Top Banner with Print Button */}
        <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
              <Megaphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Digital Marketing &amp; Ads Execution Hub
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200 border border-purple-200">
                  SAAMPARK DIGITAL RETAINER
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200">
                  {currentMarketingPkg.planName} ({currentMarketingPkg.packageDuration})
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Live deliverable checklist, social media post schedule, real model shoot notes &amp; audience targeting
              </p>
            </div>
          </div>

          <a
            href={`/feature/marketing?client=${encodeURIComponent(selectedProject?.client || "")}`}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md transition-all cursor-pointer shrink-0"
          >
            <Megaphone size={15} />
            <span>Open Marketing Campaign Hub</span>
          </a>
        </div>

        {/* Performance Report 5 Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Posts Delivered</span>
            <div className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {currentMarketingPkg.performance?.postsDelivered || `${currentMarketingPkg.postersCount || 12} poster`}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Reels / Videos</span>
            <div className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {currentMarketingPkg.performance?.videosDelivered || `${currentMarketingPkg.videosCount || 2} AI Reels`}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Leads Generated</span>
            <div className="text-base font-black text-emerald-600 mt-1">
              {currentMarketingPkg.performance?.leadsGenerated ?? 16}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-center shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Reach</span>
            <div className="text-base font-black text-blue-600 mt-1">
              {currentMarketingPkg.performance?.reach ? Number(currentMarketingPkg.performance.reach).toLocaleString("en-IN") : "7,409"}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-3.5 text-center shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Followers Gained</span>
            <div className="text-base font-black text-purple-600 mt-1">
              +{currentMarketingPkg.performance?.followersGained ?? 5}
            </div>
          </div>
        </div>

        {/* Assigned Digital Marketing Campaign Team */}
        <div className="bg-white dark:bg-zinc-800/40 border border-purple-100 dark:border-purple-900/50 rounded-xl p-4 shadow-xs space-y-3 bg-gradient-to-r from-purple-50/30 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Assigned Marketing &amp; Creative Team
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                {(selectedProject.members || []).length} Members
              </span>
            </div>
            <button
              type="button"
              onClick={() => onOpenEditModal(selectedProject)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer"
            >
              <Plus size={13} />
              <span>Assign / Change Team</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(selectedProject.members || []).length === 0 ? (
              <div className="col-span-full py-3 px-4 rounded-xl border border-dashed border-purple-200 text-center text-xs text-zinc-400">
                No marketing specialists assigned yet. Click "Assign / Change Team" to add graphic designers, reel editors, or ads leads.
              </div>
            ) : (
              (selectedProject.members || []).map((m: any, idx: number) => {
                const mName = typeof m === "string" ? m : (m.name || "Specialist")
                const mRole = typeof m === "string" ? "Marketing Specialist" : (m.role || "Marketing Specialist")
                const mAvatar = (m as any).avatarUrl || (m as any).avatar || getUserAvatar(mName, undefined, mName)
                return (
                  <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <img
                      src={mAvatar}
                      alt={mName}
                      className="w-9 h-9 rounded-full object-cover border border-purple-200 dark:border-purple-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{mName}</div>
                      <div className="text-[10.5px] text-purple-600 dark:text-purple-400 font-medium truncate">{mRole}</div>
                      {m.email && <div className="text-[9.5px] text-zinc-400 font-mono truncate">{m.email}</div>}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Side-by-Side Dual Checklist Tables (Poster vs Video Reels) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Table 1: Poster / Creative Deliverables */}
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/60">
              <div className="flex items-center gap-2">
                <ImageIcon size={15} className="text-blue-600" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  POSTER &amp; CREATIVES SCHEDULE
                </h4>
              </div>
              <span className="text-[10px] font-bold text-zinc-500">
                {(currentMarketingPkg.posterSchedule || []).filter(p => p.done).length} / {(currentMarketingPkg.posterSchedule || []).length} Completed
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 text-zinc-500 font-semibold text-[10.5px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">SL</th>
                    <th className="py-2.5 px-3 w-28 text-center">Date</th>
                    <th className="py-2.5 px-3 w-14 text-center">Done</th>
                    <th className="py-2.5 px-3">Remarks / Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                  {(currentMarketingPkg.posterSchedule || []).map((item, idx) => (
                    <tr key={`p_${idx}`} className={item.done ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}>
                      <td className="py-2 px-3 text-center font-bold text-zinc-400">{item.sl}</td>
                      <td className="py-2 px-3 text-center text-zinc-700 dark:text-zinc-300">{item.date}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const sched = [...(currentMarketingPkg.posterSchedule || [])]
                            sched[idx] = { ...sched[idx], done: !sched[idx].done }
                            handleSaveMarketingPackage({ ...currentMarketingPkg, posterSchedule: sched })
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                            item.done 
                              ? "bg-emerald-600 text-white font-bold" 
                              : "border border-zinc-300 dark:border-zinc-600 hover:border-emerald-500"
                          }`}
                        >
                          {item.done && <Check size={12} strokeWidth={3} />}
                        </button>
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                        {item.remarks || "Poster"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Video & Reel Ads Deliverables */}
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/60 dark:bg-zinc-800/60">
              <div className="flex items-center gap-2">
                <Video size={15} className="text-purple-600" />
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  ADS &amp; REEL VIDEOS SCHEDULE
                </h4>
              </div>
              <span className="text-[10px] font-bold text-zinc-500">
                {(currentMarketingPkg.videoSchedule || []).filter(v => v.done).length} / {(currentMarketingPkg.videoSchedule || []).length} Completed
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 text-zinc-500 font-semibold text-[10.5px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">SL</th>
                    <th className="py-2.5 px-3 w-28 text-center">Date</th>
                    <th className="py-2.5 px-3 w-14 text-center">Done</th>
                    <th className="py-2.5 px-3">Remarks / Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
                  {(currentMarketingPkg.videoSchedule || []).map((item, idx) => (
                    <tr key={`v_${idx}`} className={item.done ? "bg-emerald-50/50 dark:bg-emerald-950/20" : ""}>
                      <td className="py-2 px-3 text-center font-bold text-zinc-400">{item.sl}</td>
                      <td className="py-2 px-3 text-center text-zinc-700 dark:text-zinc-300">{item.date}</td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const sched = [...(currentMarketingPkg.videoSchedule || [])]
                            sched[idx] = { ...sched[idx], done: !sched[idx].done }
                            handleSaveMarketingPackage({ ...currentMarketingPkg, videoSchedule: sched })
                          }}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                            item.done 
                              ? "bg-emerald-600 text-white font-bold" 
                              : "border border-zinc-300 dark:border-zinc-600 hover:border-emerald-500"
                          }`}
                        >
                          {item.done && <Check size={12} strokeWidth={3} />}
                        </button>
                      </td>
                      <td className="py-2 px-3 font-sans font-medium text-zinc-800 dark:text-zinc-200">
                        {item.remarks || "Ads - Video Reels"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Bottom Notes & Target Audience Locations Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <FileText size={14} className="text-zinc-600" />
              <span>Campaign Notes &amp; Shoot Dates</span>
            </h4>
            <div className="text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100">• Real Model Shoot: </strong>
                <span>{currentMarketingPkg.hasRealModelShoot ? `${currentMarketingPkg.modelShootDate || "23/10/2026"} ${currentMarketingPkg.modelShootNotes || "Real Model Shoot extra"}` : "None scheduled"}</span>
              </div>
              <div>
                <strong className="text-zinc-900 dark:text-zinc-100">• TOTO Ads: </strong>
                <span>{currentMarketingPkg.hasTotoAds ? (currentMarketingPkg.totoAdsNotes || "Active route") : "Optional route speaker add-on"}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-2">
            <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <MapPin size={14} className="text-rose-500" />
              <span>Target Pin Codes &amp; Audience Locations</span>
            </h4>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
              {currentMarketingPkg.targetLocations || "Amlagora 721121, Balichak 721124, Chandrakona 721402, Debra 721126, Garhbeta 721127, Ghatal 721146, Kharagpur 721123"}
            </p>
          </div>
        </div>
      </div>
    )
  };
    return __fn(...__args);
  };
}
