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

export function ReportsSection5({ ctrl }: { ctrl: any }) {
  const { activeTab, totalSubBranchGrossVolume, subBranchReportData, totalCompanyRetainedFromSubBranches, totalPartnerPayoutAccrued, totalPartnerPayoutRealized } = ctrl;
  return (
    <>
      {/* ── TAB: SUB-BRANCH REVENUE SHARE (% WISE) ────────────────────────── */}
      {activeTab === "sub_branches" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Summary Hero Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sub-Branch Gross */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>Sub-Branch Invoiced (Gross)</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Receipt size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">
                ₹{totalSubBranchGrossVolume.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Across {subBranchReportData.length} registered percentage partner hubs
              </p>
            </div>

            {/* Company Retained Net Share */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>Company Retained Share</span>
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <Building2 size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                ₹{totalCompanyRetainedFromSubBranches.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Company retainage (Operating Branch share)
              </p>
            </div>

            {/* Partner Payouts Accrued */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>Partner Payouts (Accrued)</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                  <Percent size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                ₹{totalPartnerPayoutAccrued.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total commission/share earned by sub-branches
              </p>
            </div>

            {/* Realized Cash Payouts */}
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                <span>Partner Share Realized</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalPartnerPayoutRealized.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Commission realized from collected customer payments
              </p>
            </div>
          </div>

          {/* Sub-Branch Breakdown Cards & Interactive Table */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="text-base">🌿</span>
                  <span>Sub-Branch Performance & Percentage Settlement Breakdown</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Real-time ledger tracking gross billings, percentage agreements, company retention, and partner commissions.
                </p>
              </div>
            </div>

            {subBranchReportData.length === 0 ? (
              <div className="py-12 text-center bg-surface-hover/30 rounded-2xl border border-dashed border-border p-6 space-y-2">
                <p className="font-bold text-xs text-foreground">No Sub-Branches configured yet.</p>
                <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                  Go to <strong>Settings &gt; Company Entities &amp; Branch Hubs</strong> to add your first percentage-based franchise or partner sub-branch.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border/80">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                      <th className="py-3 px-3.5">Sub-Branch & Hub</th>
                      <th className="py-3 px-3.5">Parent Operating Branch</th>
                      <th className="py-3 px-3.5">Partner / Franchisee</th>
                      <th className="py-3 px-3.5 text-center">Revenue Split Agreement</th>
                      <th className="py-3 px-3.5 text-center">Bills</th>
                      <th className="py-3 px-3.5 text-right">Gross Invoiced</th>
                      <th className="py-3 px-3.5 text-right">Company Retained</th>
                      <th className="py-3 px-3.5 text-right">Partner Share</th>
                      <th className="py-3 px-3.5 text-right">Realized Cash Payout</th>
                      <th className="py-3 px-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-medium">
                    {subBranchReportData.map((sb) => (
                      <tr key={sb.id} className="hover:bg-surface-hover/60 transition-colors">
                        {/* Sub-Branch */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="text-emerald-500">🌿</span>
                              <span>{sb.name}</span>
                            </span>
                            {sb.code && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                Code: {sb.code}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Parent Branch */}
                        <td className="py-3.5 px-3.5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-semibold">
                            <Building2 size={11} className="text-blue-500 shrink-0" />
                            <span>{sb.parentBranchName}</span>
                          </span>
                        </td>

                        {/* Partner Contact */}
                        <td className="py-3.5 px-3.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-foreground">{sb.partnerName || "Primary Partner"}</span>
                            {sb.partnerPhone && (
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {sb.partnerPhone}
                              </span>
                            )}
                            {sb.bankDetails?.upiId && (
                              <span className="font-mono text-[9.5px] text-emerald-600 dark:text-emerald-400">
                                UPI: {sb.bankDetails.upiId}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Split Bar & Percentage */}
                        <td className="py-3.5 px-3.5">
                          <div className="space-y-1 w-44 mx-auto">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-emerald-600 dark:text-emerald-400">
                                🪙 {sb.sharePct}% Partner
                              </span>
                              <span className="text-blue-600 dark:text-blue-400">
                                {sb.companySharePct}% Co.
                              </span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800">
                              <div
                                style={{ width: `${sb.sharePct}%` }}
                                className="bg-emerald-500 h-full"
                              />
                              <div
                                style={{ width: `${sb.companySharePct}%` }}
                                className="bg-blue-600 h-full"
                              />
                            </div>
                          </div>
                        </td>

                        {/* Bills Count */}
                        <td className="py-3.5 px-3.5 text-center font-mono font-bold text-foreground">
                          {sb.invoicesCount}
                        </td>

                        {/* Gross Invoiced */}
                        <td className="py-3.5 px-3.5 text-right font-mono font-black text-foreground">
                          ₹{sb.totalInvoicedGross.toLocaleString("en-IN")}
                        </td>

                        {/* Company Retained */}
                        <td className="py-3.5 px-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                          ₹{sb.companyRetainedGross.toLocaleString("en-IN")}
                        </td>

                        {/* Partner Total Accrued */}
                        <td className="py-3.5 px-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          ₹{sb.partnerEarnedGross.toLocaleString("en-IN")}
                        </td>

                        {/* Partner Realized Payout */}
                        <td className="py-3.5 px-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{sb.partnerEarnedRealized.toLocaleString("en-IN")}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3.5 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                              sb.status === "Active"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                                : "bg-zinc-500/10 text-zinc-500"
                            }`}
                          >
                            {sb.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
