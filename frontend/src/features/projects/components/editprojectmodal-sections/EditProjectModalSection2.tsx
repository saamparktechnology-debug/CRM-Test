"use client"

import * as React from "react"
import { 
  X, Check, Bold, Italic, Underline, List, ListOrdered, Table, Link2, Code, Sparkles, 
  Minus, Maximize2, Users, UserCheck, Search, Percent, ExternalLink, Globe, GitBranch, 
  Server, Layers, Megaphone, Video, Image as ImageIcon, Calendar, MapPin, Receipt, 
  RefreshCw, FileText, CheckCircle2, DollarSign, Clock
} from "lucide-react"
import { Project, ProjectMember, ProjectStatus, ProjectType, isMarketingProject } from "@/features/projects/types"
import { updateProject } from "@/features/projects/services/projectService"
import { getInvoices, updateInvoice } from "@/features/invoice/services/invoiceService"
import { getUsers } from "@/features/users/services/userService"
import { UserService } from "@/services/apiServices"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { type EditProjectModalProps, toDateInputValue } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"

export function EditProjectModalSection2({ ctrl }: { ctrl: any }) {
  const { projectCategory, planTier, setPlanTier, postersQuota, setPostersQuota, reelsQuota, setReelsQuota, shootDate, setShootDate, targetGeo, setTargetGeo, monthlyAdBudget, setMonthlyAdBudget, driveUrl, setDriveUrl } = ctrl;
  return (
    <>
      {/* DEDICATED SPECIFICATIONS CARD: DIGITAL MARKETING RETAINER */}
          {projectCategory === "Digital Marketing Retainer" && (
            <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider pb-1 border-b border-purple-100 dark:border-purple-900/40">
                <Megaphone size={14} />
                <span>Digital Marketing Campaign & Retainer Quotas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                    Retainer Plan Tier
                  </label>
                  <select
                    value={planTier}
                    onChange={(e) => setPlanTier(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-semibold cursor-pointer"
                  >
                    <option value="Starter">Package 01 - Starter</option>
                    <option value="Grow">Package 02 - Grow</option>
                    <option value="Scale">Package 03 - Scale</option>
                    <option value="Enterprise">Enterprise / Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <ImageIcon size={12} className="text-purple-500" />
                    <span>Monthly Posters Quota</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={postersQuota}
                    onChange={(e) => setPostersQuota(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <Video size={12} className="text-purple-500" />
                    <span>Monthly Reels / Shorts Quota</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={reelsQuota}
                    onChange={(e) => setReelsQuota(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <Calendar size={12} className="text-zinc-400" />
                    <span>Model Shoot Date</span>
                  </label>
                  <input
                    type="date"
                    value={toDateInputValue(shootDate)}
                    onChange={(e) => setShootDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <MapPin size={12} className="text-zinc-400" />
                    <span>Target Geography & Location</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kolkata, West Bengal, 15km radius"
                    value={targetGeo}
                    onChange={(e) => setTargetGeo(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-500" />
                    <span>Monthly Ad Spend Budget (₹)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={monthlyAdBudget || ""}
                    onChange={(e) => setMonthlyAdBudget(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                    <Link2 size={12} className="text-zinc-400" />
                    <span>Creative Drive Assets URL</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Assigned Team Members & Revenue Share % Section */}
    </>
  );
}
