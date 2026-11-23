"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion } from "framer-motion"
import { 
  BarChart3, Download, Calendar, Filter, TrendingUp, Users, 
  DollarSign, CheckSquare, Target, PieChart, ArrowUpRight, ArrowDownRight, FileText,
  Receipt, ShieldCheck, AlertCircle, Building2, MapPin, Search, CheckCircle2, Clock, Landmark, Percent, Layers,
  Megaphone, Video, Image as ImageIcon, Sparkles, Printer
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, SubBranch, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, InvoiceItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { getPayments, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems, isGlobalItemDeleted } from "@/lib/storageSync"
import { getClients } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getLeads } from "@/features/leads/services/leadService"
import { Lead } from "@/features/leads/types"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, BillingCycle } from "@/features/subscriptions/types"
import { getProjects } from "@/features/projects/services/projectService"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { Repeat, Package, Zap, CalendarDays, RefreshCw } from "lucide-react"
import { resolveExportScope, exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { type ReportTab, type InvoiceFilterType, type SubscriptionFilterType } from "@/features/reports/components/reports-sections/ReportsHelpers"

export function ReportsSection3({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { activeTab, marketingKPIs, marketingSearchQuery, setMarketingSearchQuery, marketingPlanFilter, setMarketingPlanFilter, targetComp, scopedMarketingCampaigns, setViewingForm9Pkg } = ctrl;
  return (
    <>
      {activeTab === "digital_marketing" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 5 Key Performance Cards for Digital Marketing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Active Retainers & Revenue */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/60 to-indigo-50/30 dark:from-purple-950/40 dark:to-indigo-950/20 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold">
                <span>Active Campaigns</span>
                <Megaphone size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                {marketingKPIs.activeCount} <span className="text-xs font-normal text-muted-foreground">/ {marketingKPIs.campaignsCount} total</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-0.5">
                <span>Contract Billing: ₹{marketingKPIs.totalRevenue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Card 2: Poster & Creatives Delivery Progress */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-cyan-50/30 dark:from-blue-950/40 dark:to-cyan-950/20 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                <span>Posters &amp; Creatives</span>
                <ImageIcon size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {marketingKPIs.totalPostersDone} <span className="text-xs font-normal text-muted-foreground">/ {marketingKPIs.totalPostersScheduled} completed</span>
              </p>
              <div className="w-full bg-blue-100 dark:bg-blue-900/40 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${marketingKPIs.totalPostersScheduled > 0 ? Math.min(100, Math.round((marketingKPIs.totalPostersDone / marketingKPIs.totalPostersScheduled) * 100)) : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold text-right">
                {marketingKPIs.totalPostersScheduled > 0 ? Math.round((marketingKPIs.totalPostersDone / marketingKPIs.totalPostersScheduled) * 100) : 0}% delivery rate
              </div>
            </div>

            {/* Card 3: AI Video Reels Delivery Progress */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/60 to-rose-50/30 dark:from-pink-950/40 dark:to-rose-950/20 border border-pink-200/80 dark:border-pink-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-pink-700 dark:text-pink-300 font-bold">
                <span>AI Reels &amp; Videos</span>
                <Video size={16} className="text-pink-600 dark:text-pink-400" />
              </div>
              <p className="text-2xl font-black text-pink-700 dark:text-pink-300">
                {marketingKPIs.totalVideosDone} <span className="text-xs font-normal text-muted-foreground">/ {marketingKPIs.totalVideosScheduled} completed</span>
              </p>
              <div className="w-full bg-pink-100 dark:bg-pink-900/40 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className="bg-pink-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${marketingKPIs.totalVideosScheduled > 0 ? Math.min(100, Math.round((marketingKPIs.totalVideosDone / marketingKPIs.totalVideosScheduled) * 100)) : 0}%` }}
                />
              </div>
              <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold text-right">
                {marketingKPIs.totalVideosScheduled > 0 ? Math.round((marketingKPIs.totalVideosDone / marketingKPIs.totalVideosScheduled) * 100) : 0}% delivery rate
              </div>
            </div>

            {/* Card 4: Performance Impact (Reach & Leads) */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/30 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                <span>Campaign Leads</span>
                <Target size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                {marketingKPIs.totalLeads} <span className="text-xs font-normal text-muted-foreground">qualified leads</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                <span>Reach: {marketingKPIs.totalReach.toLocaleString("en-IN")}</span>
                <span>+{marketingKPIs.totalFollowers} Followers</span>
              </div>
            </div>

            {/* Card 5: Creative Team & Specialists */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold">
                <span>Marketing Team</span>
                <Users size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                {marketingKPIs.teamWorkload.length} <span className="text-xs font-normal text-muted-foreground">specialists assigned</span>
              </p>
              <div className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold pt-0.5">
                <span>Multi-Disciplinary Squad</span>
              </div>
            </div>
          </div>

          {/* Assigned Marketing Team Workload Section */}
          {marketingKPIs.teamWorkload.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-purple-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Assigned Marketing Squad &amp; Workload Distribution
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">
                  {marketingKPIs.teamWorkload.length} active specialists
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {marketingKPIs.teamWorkload.map((member) => (
                  <div key={member.id} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-purple-200 dark:border-purple-800 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs text-foreground truncate">{member.name}</div>
                      <div className="text-[10px] text-purple-600 dark:text-purple-400 font-medium truncate">{member.role}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        <strong className="text-foreground">{member.count}</strong> campaigns assigned
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campaigns Ledger Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-xs overflow-hidden">
            {/* Table Control Header */}
            <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search client or campaign..."
                    value={marketingSearchQuery}
                    onChange={(e) => setMarketingSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-border bg-surface text-foreground w-48 sm:w-60 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Plan Filter */}
                <select
                  value={marketingPlanFilter}
                  onChange={(e) => setMarketingPlanFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl border border-border bg-surface text-foreground cursor-pointer focus:outline-none"
                >
                  <option value="all">All Growth Plans</option>
                {(masterBundle?.options?.["marketing_package"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download size={13} />}
                  onClick={() => {
                    exportToExcel({
                      filename: "Digital_Marketing_Campaigns_Report",
                      title: "Digital Marketing & Ads Report (Form No - 9)",
                      subtitle: `Scope: ${targetComp}`,
                      headers: ["#", "Campaign Title", "Client", "Plan", "Duration", "Posters Target", "Reels Target", "Value", "Status"],
                      rows: scopedMarketingCampaigns.map((p, idx) => [
                        idx + 1,
                        p.title,
                        p.client,
                        (p as any).marketingPackage?.planName || "Grow Plan",
                        (p as any).marketingPackage?.packageDuration || "1 month",
                        (p as any).marketingPackage?.postersCount || 12,
                        (p as any).marketingPackage?.videosCount || 2,
                        p.price || p.totalAmount || "₹0",
                        p.status || "Active",
                      ]),
                    })
                  }}
                  className="text-xs font-bold"
                >
                  Excel
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Printer size={13} />}
                  onClick={() => {
                    printPDFReport({
                      title: "Digital Marketing Execution Report (Form No - 9)",
                      subtitle: "Official Deliverables & Campaign Status",
                      headers: ["#", "Campaign Title", "Client", "Plan", "Duration", "Posters", "Reels", "Value", "Status"],
                      rows: scopedMarketingCampaigns.map((p, idx) => [
                        idx + 1,
                        p.title,
                        p.client,
                        (p as any).marketingPackage?.planName || "Grow Plan",
                        (p as any).marketingPackage?.packageDuration || "1 month",
                        `${(p as any).marketingPackage?.postersCount || 12} Posters`,
                        `${(p as any).marketingPackage?.videosCount || 2} Reels`,
                        p.price || p.totalAmount || "₹0",
                        p.status || "Active",
                      ]),
                    })
                  }}
                  className="text-xs font-bold"
                >
                  Print PDF
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-bold text-[10.5px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 w-10 text-center">#</th>
                    <th className="py-3 px-3.5">Campaign &amp; Client</th>
                    <th className="py-3 px-3.5">Marketing Retainer Plan</th>
                    <th className="py-3 px-3.5">Duration</th>
                    <th className="py-3 px-3.5">Posters Progress</th>
                    <th className="py-3 px-3.5">Video Reels</th>
                    <th className="py-3 px-3.5">Assigned Squad</th>
                    <th className="py-3 px-3.5 text-right">Value</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                    <th className="py-3 px-3.5 text-center">Retainer Contract</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scopedMarketingCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-muted-foreground">
                        No digital marketing campaigns found matching selected filters.
                      </td>
                    </tr>
                  ) : (
                    scopedMarketingCampaigns.map((p, idx) => {
                      const pkg = (p as any).marketingPackage
                      const pSched = Array.isArray(pkg?.posterSchedule) ? pkg.posterSchedule : []
                      const vSched = Array.isArray(pkg?.videoSchedule) ? pkg.videoSchedule : []
                      const postersDone = pSched.filter((it: any) => it.done).length
                      const postersTotal = pSched.length > 0 ? pSched.length : (pkg?.postersCount || 12)
                      const videosDone = vSched.filter((it: any) => it.done).length
                      const videosTotal = vSched.length > 0 ? vSched.length : (pkg?.videosCount || 2)
                      const members = Array.isArray(p.members) ? p.members : []

                      return (
                        <tr key={p.id || idx} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-3.5 text-center font-bold text-muted-foreground font-mono">{idx + 1}</td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-foreground text-xs">{p.title}</div>
                            <div className="text-[11px] text-muted-foreground">{p.client}</div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10.5px]">
                              <Megaphone size={10} />
                              <span>{pkg?.planName || "Grow - 2"}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-[11px] font-mono">
                            <div>{pkg?.packageDuration || "1 month"}</div>
                            {pkg?.startDate && (
                              <div className="text-[10px] text-muted-foreground">{pkg.startDate} → {pkg.expireDate || "Ongoing"}</div>
                            )}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[11px]">{postersDone} / {postersTotal}</span>
                              <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, Math.round((postersDone / postersTotal) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-[11px]">{videosDone} / {videosTotal}</span>
                              <div className="w-14 bg-muted rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-pink-600 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, Math.round((videosDone / videosTotal) * 100))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            {members.length === 0 ? (
                              <span className="text-muted-foreground text-[10px]">Unassigned</span>
                            ) : (
                              <div className="flex -space-x-2 overflow-hidden hover:space-x-1 transition-all py-0.5">
                                {members.slice(0, 4).map((m: any, mIdx: number) => {
                                  const mName = typeof m === "string" ? m : (m.name || "Specialist")
                                  const mRole = typeof m === "string" ? "Marketing Specialist" : (m.role || "Marketing Specialist")
                                  const mAvatar = (m as any).avatarUrl || (m as any).avatar || getUserAvatar(mName, undefined, mName)
                                  return (
                                    <img
                                      key={mIdx}
                                      src={mAvatar}
                                      alt={mName}
                                      title={`${mName} (${mRole})`}
                                      className="w-7 h-7 rounded-full object-cover border-2 border-surface shrink-0"
                                    />
                                  )
                                })}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-foreground font-mono">
                            {p.price || p.totalAmount || "₹0"}
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              p.status === "Completed"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200"
                                : "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200"
                            }`}>
                              {p.status || "Active"}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-center">
                            {pkg ? (
                              <button
                                type="button"
                                onClick={() => setViewingForm9Pkg({ pkg, clientName: p.client, clientPhone: p.clientPhone, clientAddress: p.clientAddress })}
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10.5px] border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                              >
                                View Sheet
                              </button>
                            ) : (
                              <span className="text-muted-foreground text-[10px]">-</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
