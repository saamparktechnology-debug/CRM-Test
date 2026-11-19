"use client"

import * as React from "react"
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

export function ReportsSection4({ ctrl }: { ctrl: any }) {
  const { activeTab, totalMRR, totalARR, activeSubsCount, packageSubs, getSubscriptionMRR, regularSubs, emiSubs, upcomingRenewalsAmount, upcomingRenewals, pastDueSubsCount, filteredTableSubscriptions, subscriptionSearchQuery, setSubscriptionSearchQuery, totalSubsCount, expiringSoonSubsCount, canceledSubsCount, subscriptionSubFilter, setSubscriptionSubFilter, clientMap, branchMap } = ctrl;
  return (
    <>
      {activeTab === "subscriptions" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 5 Key Performance Cards for Subscriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Card 1: Total MRR & ARR */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-indigo-50/20 dark:from-purple-950/30 dark:to-indigo-950/10 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold">
                <span>Monthly Recurring Revenue (MRR)</span>
                <Repeat size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                ₹{totalMRR.toLocaleString("en-IN")}<span className="text-xs font-normal text-muted-foreground">/mo</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-0.5">
                <span>ARR Run-Rate: ₹{totalARR.toLocaleString("en-IN")}</span>
                <span>{activeSubsCount} Active Subs</span>
              </div>
            </div>

            {/* Card 2: Package-Wise Subscriptions */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/20 dark:from-blue-950/30 dark:to-indigo-950/10 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                <span>Package Subscriptions</span>
                <Package size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {packageSubs.length} <span className="text-xs font-normal text-muted-foreground">Subscribers</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-blue-600 dark:text-blue-400 font-semibold pt-0.5">
                <span>Value: ₹{packageSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}/mo</span>
                <span>Tier Bundles</span>
              </div>
            </div>

            {/* Card 3: Regular Retainers */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/50 to-emerald-50/20 dark:from-teal-950/30 dark:to-emerald-950/10 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-teal-700 dark:text-teal-300 font-bold">
                <span>Regular Retainers</span>
                <RefreshCw size={16} className="text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-2xl font-black text-teal-700 dark:text-teal-300">
                {regularSubs.length} <span className="text-xs font-normal text-muted-foreground">Retainers</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-teal-600 dark:text-teal-400 font-semibold pt-0.5">
                <span>Yield: ₹{regularSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}/mo</span>
                <span>Custom Billing</span>
              </div>
            </div>

            {/* Card 4: EMI Subscriptions */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/50 to-orange-50/20 dark:from-amber-950/30 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold">
                <span>EMI Subscriptions</span>
                <Zap size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
                {emiSubs.length} <span className="text-xs font-normal text-muted-foreground">Financed</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-semibold pt-0.5">
                <span>Monthly: ₹{emiSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}</span>
                <span>Tenure Plans</span>
              </div>
            </div>

            {/* Card 5: Renewals Due (Next 30 Days) */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-2 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>30-Day Renewal Pipeline</span>
                <CalendarDays size={16} className="text-primary" />
              </div>
              <p className="text-2xl font-black text-foreground">
                ₹{upcomingRenewalsAmount.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
                <span className="text-primary font-bold">{upcomingRenewals.length} Renewals Due</span>
                <span>{pastDueSubsCount} Past Due</span>
              </div>
            </div>
          </div>

          {/* ── 3 MODEL BREAKDOWN CARDS ────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Model 1: Package-Wise Model */}
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                    📦
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Package-Wise Subscriptions</h4>
                    <span className="text-[10px] text-muted-foreground">Fixed deliverables with recurring cycles</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-bold font-mono">
                  {packageSubs.length}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Active Contracts:</span>
                  <strong className="text-foreground font-mono">{packageSubs.filter(s => s.status === "Active").length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly MRR:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-mono">
                    ₹{packageSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Model 2: Regular Retainer Model */}
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                    🔁
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">Regular Retainers</h4>
                    <span className="text-[10px] text-muted-foreground">Flexible monthly / quarterly client maintenance</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 text-xs font-bold font-mono">
                  {regularSubs.length}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Active Retainers:</span>
                  <strong className="text-foreground font-mono">{regularSubs.filter(s => s.status === "Active").length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly MRR:</span>
                  <strong className="text-teal-600 dark:text-teal-400 font-mono">
                    ₹{regularSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>

            {/* Model 3: EMI Subscription Model */}
            <div className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    💳
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-foreground">EMI Subscriptions</h4>
                    <span className="text-[10px] text-muted-foreground">Tenure installment plans (3 / 6 / 12 / 24 mo)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold font-mono">
                  {emiSubs.length}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <div className="flex justify-between">
                  <span>Active EMI Plans:</span>
                  <strong className="text-foreground font-mono">{emiSubs.filter(s => s.status === "Active").length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly EMI Collections:</span>
                  <strong className="text-amber-600 dark:text-amber-400 font-mono">
                    ₹{emiSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ── DETAILED SUBSCRIPTIONS REGISTER & AUDIT TABLE ──────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Repeat size={16} className="text-purple-600" />
                  <span>Subscriptions & Recurring Retainers Register</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredTableSubscriptions.length} subscriptions across package-wise, regular retainers, and EMI agreements.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search plan, client, company, branch..."
                  value={subscriptionSearchQuery}
                  onChange={(e) => setSubscriptionSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-hover/60 border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
            </div>

            {/* Sub-Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: `All (${totalSubsCount})` },
                { id: "package", label: `📦 Package Wise (${packageSubs.length})` },
                { id: "regular", label: `🔁 Regular Retainers (${regularSubs.length})` },
                { id: "emi", label: `💳 EMI Subscriptions (${emiSubs.length})` },
                { id: "active", label: `🟢 Active (${activeSubsCount})` },
                { id: "expiring_soon", label: `⏰ Expiring Soon (${expiringSoonSubsCount})` },
                { id: "past_due", label: `⚠️ Past Due (${pastDueSubsCount})` },
                { id: "canceled", label: `⛔ Canceled (${canceledSubsCount})` },
              ].map((pill) => {
                const isSelected = subscriptionSubFilter === pill.id
                return (
                  <button
                    key={pill.id}
                    onClick={() => setSubscriptionSubFilter(pill.id as SubscriptionFilterType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-surface-hover/70 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-3.5">Plan / Package Name</th>
                    <th className="py-3 px-3.5">Client & Company</th>
                    <th className="py-3 px-3.5">Model Type</th>
                    <th className="py-3 px-3.5">Billing Cycle</th>
                    <th className="py-3 px-3.5 text-right">Cycle Amount</th>
                    <th className="py-3 px-3.5 text-right">Monthly MRR</th>
                    <th className="py-3 px-3.5">Start Date</th>
                    <th className="py-3 px-3.5">Next Renewal</th>
                    <th className="py-3 px-3.5">Branch Hub</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {filteredTableSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-10 text-center text-muted-foreground">
                        No subscriptions match the selected scoping and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTableSubscriptions.map((sub) => {
                      const mrr = getSubscriptionMRR(sub)
                      const rawAmt = sub.numericAmount || parseInt(String(sub.amount || "0").replace(/[^0-9]/g, "")) || 0
                      const branchDisplay = sub.branchName || clientMap[(sub.clientName || "").toLowerCase().trim()]?.branchName || branchMap[sub.branchId || ""] || "-"

                      const modelBadge = sub.subscriptionType === "package" ? (
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-bold text-[10px] border border-blue-500/20">
                          📦 Package
                        </span>
                      ) : sub.subscriptionType === "emi" ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[10px] border border-amber-500/20">
                          💳 EMI Plan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-600 font-bold text-[10px] border border-teal-500/20">
                          🔁 Retainer
                        </span>
                      )

                      const statusColors: Record<string, string> = {
                        Active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        "Expiring Soon": "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        "Past Due": "bg-rose-500/10 text-rose-600 border-rose-500/20",
                        Canceled: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
                        Trial: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                      }

                      return (
                        <tr key={sub.id} className="hover:bg-surface-hover/50 transition-colors">
                          {/* Plan Name */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-foreground block">{sub.planName}</span>
                            {sub.packageCategory && (
                              <span className="text-[10px] text-muted-foreground">{sub.packageCategory}</span>
                            )}
                          </td>

                          {/* Client & Company */}
                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-foreground block">{sub.clientName}</span>
                            {sub.clientCompany ? (
                              <span className="text-[10px] text-muted-foreground">{sub.clientCompany}</span>
                            ) : sub.clientEmail ? (
                              <span className="text-[10px] text-muted-foreground font-mono">{sub.clientEmail}</span>
                            ) : null}
                          </td>

                          {/* Model Type */}
                          <td className="py-3 px-3.5">
                            {modelBadge}
                          </td>

                          {/* Billing Cycle */}
                          <td className="py-3 px-3.5 font-medium text-foreground">
                            {sub.billingCycle || "Monthly"}
                          </td>

                          {/* Cycle Amount */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-foreground">
                            ₹{rawAmt.toLocaleString("en-IN")}
                          </td>

                          {/* Monthly MRR */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                            ₹{mrr.toLocaleString("en-IN")}
                          </td>

                          {/* Start Date */}
                          <td className="py-3 px-3.5 text-muted-foreground font-mono text-[11px]">
                            {sub.startDate || "-"}
                          </td>

                          {/* Next Renewal */}
                          <td className="py-3 px-3.5">
                            <span className="font-mono font-semibold text-[11px] text-foreground block">
                              {sub.nextBillingDate || "-"}
                            </span>
                          </td>

                          {/* Branch */}
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                              <MapPin size={11} className="text-blue-500 shrink-0" />
                              <span>{branchDisplay}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10.5px] font-bold border ${
                                statusColors[sub.status] || "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {sub.status}
                            </span>
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
