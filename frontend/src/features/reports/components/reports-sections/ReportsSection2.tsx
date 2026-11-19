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

export function ReportsSection2({ ctrl }: { ctrl: any }) {
  const { activeTab, totalInvoicedSum, totalBillsCount, totalMRR, activeSubsCount, totalARR, totalGstInvoicedSum, totalGstBillsCount, totalGstTaxAmountSum, totalNonGstInvoicedSum, totalNonGstBillsCount, totalCollectedSum, fullyPaidCount, totalDueSum, paymentPendingCount, partiallyPaidCount, cgstCollected, sgstCollected, gstSlabs, filteredTableInvoices, invoiceSearchQuery, setInvoiceSearchQuery, invoiceSubFilter, setInvoiceSubFilter, clientMap, branchMap } = ctrl;
  return (
    <>
      {(activeTab === "revenue" || activeTab === "gst_analytics") && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top 6 Key Performance Cards (Direct Billing + Recurring Subscriptions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* Card 1: Total Bills */}
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-2 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Total Invoiced</span>
                <Receipt size={16} className="text-primary" />
              </div>
              <p className="text-xl font-black text-foreground">₹{totalInvoicedSum.toLocaleString("en-IN")}</p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
                <span className="text-primary font-bold">{totalBillsCount} Invoices</span>
                <span>Direct</span>
              </div>
            </div>

            {/* Card 2: Recurring MRR Run-Rate */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/20 dark:from-purple-950/30 dark:to-pink-950/10 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 font-bold">
                <span>Recurring MRR</span>
                <Repeat size={16} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-xl font-black text-purple-700 dark:text-purple-300">
                ₹{totalMRR.toLocaleString("en-IN")}<span className="text-[10px] font-normal text-muted-foreground">/mo</span>
              </p>
              <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-semibold pt-0.5">
                <span>{activeSubsCount} Active Subs</span>
                <span>ARR: ₹{totalARR.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Card 3: GST Bills */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/20 dark:from-indigo-950/30 dark:to-blue-950/10 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-bold">
                <span>GST Taxable</span>
                <ShieldCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-xl font-black text-indigo-700 dark:text-indigo-300">
                ₹{totalGstInvoicedSum.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-0.5">
                <span>{totalGstBillsCount} GST Bills</span>
                <span>Tax: ₹{totalGstTaxAmountSum.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Card 4: Non-GST Bills */}
            <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>Non-GST Bills</span>
                <FileText size={16} className="text-zinc-500" />
              </div>
              <p className="text-xl font-black text-zinc-800 dark:text-zinc-200">
                ₹{totalNonGstInvoicedSum.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-0.5">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{totalNonGstBillsCount} Exempt</span>
                <span>0% Tax</span>
              </div>
            </div>

            {/* Card 5: Payments Received */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/10 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                <span>Collected</span>
                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{totalCollectedSum.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                <span>{fullyPaidCount} Settled</span>
                <span>{totalInvoicedSum > 0 ? `${Math.round((totalCollectedSum / totalInvoicedSum) * 100)}%` : "100%"}</span>
              </div>
            </div>

            {/* Card 6: Payment Due */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/50 to-rose-50/20 dark:from-amber-950/30 dark:to-rose-950/10 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold">
                <span>Payment Due</span>
                <AlertCircle size={16} className="text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                ₹{totalDueSum.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-semibold pt-0.5">
                <span>{paymentPendingCount} Pending</span>
                <span className="text-rose-600 dark:text-rose-400">{partiallyPaidCount} Part</span>
              </div>
            </div>
          </div>

          {/* ── GST TAX SLAB & COMPLIANCE MATRIX ────────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Landmark size={16} className="text-indigo-600" />
                  <span>GST Tax Compliance & Slab Breakdown</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Output tax liability breakdown across standard Indian GST slabs (18%, 12%, 5%, 0%).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  CGST: ₹{cgstCollected.toLocaleString("en-IN")}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  SGST: ₹{sgstCollected.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              {/* 18% Standard GST */}
              <div className="p-3.5 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-indigo-700 dark:text-indigo-300">
                  <span>18% Standard GST</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-[10px]">
                    {gstSlabs[18]?.count || 0} Bills
                  </span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono">₹{(gstSlabs[18]?.base || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between text-indigo-600 dark:text-indigo-400">
                    <span>Tax (9%+9%):</span>
                    <strong className="font-mono">₹{(gstSlabs[18]?.tax || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-indigo-200/50 dark:border-indigo-800/50 font-bold text-zinc-900 dark:text-zinc-100">
                    <span>Gross Value:</span>
                    <span className="font-mono">₹{(gstSlabs[18]?.total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* 12% GST */}
              <div className="p-3.5 rounded-xl border border-blue-200/70 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-blue-700 dark:text-blue-300">
                  <span>12% Print / Goods GST</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[10px]">
                    {gstSlabs[12]?.count || 0} Bills
                  </span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono">₹{(gstSlabs[12]?.base || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-400">
                    <span>Tax (6%+6%):</span>
                    <strong className="font-mono">₹{(gstSlabs[12]?.tax || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-blue-200/50 dark:border-blue-800/50 font-bold text-zinc-900 dark:text-zinc-100">
                    <span>Gross Value:</span>
                    <span className="font-mono">₹{(gstSlabs[12]?.total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* 5% GST */}
              <div className="p-3.5 rounded-xl border border-teal-200/70 dark:border-teal-800/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-teal-700 dark:text-teal-300">
                  <span>5% Concessional GST</span>
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-[10px]">
                    {gstSlabs[5]?.count || 0} Bills
                  </span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono">₹{(gstSlabs[5]?.base || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between text-teal-600 dark:text-teal-400">
                    <span>Tax (2.5%+2.5%):</span>
                    <strong className="font-mono">₹{(gstSlabs[5]?.tax || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-teal-200/50 dark:border-teal-800/50 font-bold text-zinc-900 dark:text-zinc-100">
                    <span>Gross Value:</span>
                    <span className="font-mono">₹{(gstSlabs[5]?.total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* 0% Non-GST */}
              <div className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-zinc-700 dark:text-zinc-300">
                  <span>0% Non-GST / Exempt</span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[10px]">
                    {gstSlabs[0]?.count || 0} Bills
                  </span>
                </div>
                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex justify-between">
                    <span>Taxable Base:</span>
                    <strong className="text-zinc-800 dark:text-zinc-200 font-mono">₹{(gstSlabs[0]?.total || 0).toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Tax Collected:</span>
                    <strong className="font-mono">₹0</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100">
                    <span>Gross Value:</span>
                    <span className="font-mono">₹{(gstSlabs[0]?.total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── DETAILED INVOICES & BILLS EXPLORER ──────────────────────────── */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <Receipt size={16} className="text-primary" />
                  <span>Interactive Invoices & Tax Register</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Showing {filteredTableInvoices.length} matching invoices with GST tax breakdowns and live payment statuses.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search invoice, client, GSTIN, branch..."
                  value={invoiceSearchQuery}
                  onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-hover/60 border border-border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-primary text-foreground placeholder-muted-foreground"
                />
                <Search size={13} className="absolute left-2.5 top-2.5 text-muted-foreground" />
              </div>
            </div>

            {/* Sub-Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: `All Bills (${totalBillsCount})` },
                { id: "gst", label: `GST Bills (${totalGstBillsCount})` },
                { id: "non_gst", label: `Non-GST Bills (${totalNonGstBillsCount})` },
                { id: "due", label: `Payment Due (${paymentPendingCount})` },
                { id: "paid", label: `Fully Settled (${fullyPaidCount})` },
                { id: "partially_paid", label: `Part-Paid (${partiallyPaidCount})` },
              ].map((pill) => {
                const isSelected = invoiceSubFilter === pill.id
                return (
                  <button
                    key={pill.id}
                    onClick={() => setInvoiceSubFilter(pill.id as InvoiceFilterType)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-surface-hover/70 text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {pill.label}
                  </button>
                )
              })}
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-3.5">Invoice Ref</th>
                    <th className="py-3 px-3.5">Client & GSTIN</th>
                    <th className="py-3 px-3.5">Project / Item</th>
                    <th className="py-3 px-3.5">Bill Type & Rate</th>
                    <th className="py-3 px-3.5 text-right">Taxable Base</th>
                    <th className="py-3 px-3.5 text-right">GST Output Tax</th>
                    <th className="py-3 px-3.5 text-right">Gross Total</th>
                    <th className="py-3 px-3.5 text-right">Received</th>
                    <th className="py-3 px-3.5 text-right">Balance Due</th>
                    <th className="py-3 px-3.5">Branch Hub</th>
                    <th className="py-3 px-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {filteredTableInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-muted-foreground">
                        No invoices match the selected scoping and filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredTableInvoices.map((inv) => {
                      const isGst = (typeof inv.gstRate === "number" && inv.gstRate > 0) || (typeof inv.gstAmount === "number" && inv.gstAmount > 0) || Boolean(clientMap[inv.client.toLowerCase().trim()]?.gstNumber)
                      const rate = inv.gstRate || (isGst ? 18 : 0)
                      const totalNum = parseInt((inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
                      const taxNum = typeof inv.gstAmount === "number" && inv.gstAmount > 0 
                        ? inv.gstAmount 
                        : rate > 0 ? Math.round(totalNum - totalNum / (1 + rate / 100)) : 0
                      const baseNum = totalNum - taxNum
                      const clientGst = clientMap[inv.client.toLowerCase().trim()]?.gstNumber
                      const branchDisplay = inv.branchName || clientMap[inv.client.toLowerCase().trim()]?.branchName || branchMap[inv.branchId || ""] || "-"

                      const statusColors: Record<string, string> = {
                        "Fully paid": "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                        "Partially paid": "bg-amber-500/10 text-amber-600 border-amber-500/20",
                        "Payment Pending": "bg-rose-500/10 text-rose-600 border-rose-500/20",
                        "Not paid": "bg-rose-500/10 text-rose-600 border-rose-500/20",
                        Draft: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
                      }

                      return (
                        <tr key={inv.id} className="hover:bg-surface-hover/50 transition-colors">
                          {/* Invoice Ref */}
                          <td className="py-3 px-3.5">
                            <span className="font-mono font-bold text-primary block">{inv.id}</span>
                            <span className="text-[10px] text-muted-foreground">{inv.billDate || "-"}</span>
                          </td>

                          {/* Client & GSTIN */}
                          <td className="py-3 px-3.5">
                            <span className="font-bold text-foreground block">{inv.client}</span>
                            {clientGst ? (
                              <span className="font-mono text-[10.5px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                                <ShieldCheck size={11} /> {clientGst}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Unregistered Buyer</span>
                            )}
                          </td>

                          {/* Project */}
                          <td className="py-3 px-3.5 text-muted-foreground">
                            {inv.project ? (
                              <span className="font-semibold text-foreground">{inv.project}</span>
                            ) : (
                              <span className="italic text-zinc-400">-</span>
                            )}
                          </td>

                          {/* Bill Type */}
                          <td className="py-3 px-3.5">
                            {isGst ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[10.5px] border border-indigo-200 dark:border-indigo-800">
                                <span>GST ({rate}%)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[10.5px]">
                                <span>Non-GST</span>
                              </span>
                            )}
                          </td>

                          {/* Taxable Base */}
                          <td className="py-3 px-3.5 text-right font-mono font-medium text-foreground">
                            ₹{baseNum.toLocaleString("en-IN")}
                          </td>

                          {/* Tax Amount */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {taxNum > 0 ? `₹${taxNum.toLocaleString("en-IN")}` : "₹0"}
                          </td>

                          {/* Gross Total */}
                          <td className="py-3 px-3.5 text-right font-mono font-black text-foreground">
                            ₹{totalNum.toLocaleString("en-IN")}
                          </td>

                          {/* Received */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {inv.paymentReceived || "₹0"}
                          </td>

                          {/* Due */}
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                            {inv.due || "₹0"}
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
                                statusColors[inv.status] || "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              {inv.status}
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
