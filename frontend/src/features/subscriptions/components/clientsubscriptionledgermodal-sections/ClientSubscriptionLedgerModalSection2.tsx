"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  X, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Receipt,
  Eye,
  Plus,
  RefreshCw,
  CreditCard,
  AlertTriangle
} from "lucide-react"
import { Subscription, InstallmentItem, SubscriptionStatus, calculateOverdueDetails } from "@/features/subscriptions/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getInstallments } from "@/features/subscriptions/services/subscriptionService"
import { useAuthStore } from "@/store/useAuthStore"
import { formatDisplayDate } from "@/lib/utils"
import { type ClientSubscriptionLedgerModalProps } from "@/features/subscriptions/components/clientsubscriptionledgermodal-sections/ClientSubscriptionLedgerModalHelpers"

export function ClientSubscriptionLedgerModalSection2({ ctrl }: { ctrl: any }) {
  const { isLoadingHistory, activeTab, matchedSubs, onOpenCreateSub, onClose, clientName, generatingSubId, getSubStatusBadge, handleGenInvoice, onRenewSubscription, clientInvoices, getInvoiceStatusBadge, onViewInvoice, clientInstallments } = ctrl;
  return (
    <>
      <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoadingHistory ? (
            <div className="py-12 text-center text-zinc-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw size={15} className="animate-spin text-blue-500" />
              <span>Loading complete client subscription history...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: SUBSCRIPTIONS & RETAINERS */}
              {activeTab === "subscriptions" && (
                <div className="space-y-3">
                  {matchedSubs.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="text-2xl">🔄</div>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Subscriptions Found</p>
                      <p className="text-[11px] text-zinc-500">This client does not have any active recurring plans.</p>
                      {onOpenCreateSub && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose()
                            onOpenCreateSub(clientName)
                          }}
                          className="mt-2 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs hover:bg-blue-700 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Create New Subscription</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {matchedSubs.map((sub) => {
                        const isGenerating = generatingSubId === sub.id
                        const overdueInfo = calculateOverdueDetails(sub)
                        const isNonGst = Boolean(sub.isNonGst || sub.taxType === "nongst" || sub.gstRate === 0)

                        return (
                          <div
                            key={sub.id}
                            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs transition-all ${
                              overdueInfo.isOverdue
                                ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800"
                                : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/80"
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                  {sub.planName}
                                </span>
                                {getSubStatusBadge(sub.status)}
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                                  {sub.billingCycle} Retainer
                                </span>
                                {isNonGst && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px] border border-blue-200 dark:border-blue-800">
                                    📄 0% Non-GST
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-500 flex-wrap">
                                <span>Recurring Rate: <strong className="text-zinc-800 dark:text-zinc-200">{sub.amount}</strong></span>
                                <span>•</span>
                                {overdueInfo.isOverdue ? (
                                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                    <AlertTriangle size={11} className="animate-pulse" />
                                    <span>Overdue by {overdueInfo.daysOverdue} {overdueInfo.daysOverdue === 1 ? 'day' : 'days'} (Due: {formatDisplayDate(sub.nextBillingDate)})</span>
                                    {overdueInfo.dailyLateFee > 0 && (
                                      <span className="text-[10px] font-semibold text-rose-500">
                                        • +₹{overdueInfo.accumulatedLateFee} Late Fee (₹{overdueInfo.dailyLateFee}/d)
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span>Next Billing: <strong className="text-emerald-600 dark:text-emerald-400">{formatDisplayDate(sub.nextBillingDate)}</strong></span>
                                )}
                                {sub.startDate && (
                                  <>
                                    <span>•</span>
                                    <span>Started: {formatDisplayDate(sub.startDate)}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleGenInvoice(sub)}
                                disabled={isGenerating}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all disabled:opacity-50"
                                title="Generate official tax invoice for this billing period"
                              >
                                {isGenerating ? (
                                  <>
                                    <RefreshCw size={12} className="animate-spin" />
                                    <span>Billing...</span>
                                  </>
                                ) : (
                                  <>
                                    <Receipt size={12} />
                                    <span>Generate Invoice</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => onRenewSubscription(sub)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                                title="Renew cycle and roll over billing date"
                              >
                                <RefreshCw size={12} />
                                <span>Renew</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INVOICES & BILLING LEDGER */}
              {activeTab === "invoices" && (
                <div className="space-y-3">
                  {clientInvoices.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <div className="text-2xl">📄</div>
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Invoices Found</p>
                      <p className="text-[11px] text-zinc-500">No invoices have been billed for this client yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider border-b border-zinc-200 dark:border-zinc-800">
                            <th className="py-2.5 px-3">Invoice #</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3">Invoiced</th>
                            <th className="py-2.5 px-3">Paid</th>
                            <th className="py-2.5 px-3">Balance Due</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                          {clientInvoices.map((inv) => {
                            const dueNum = parseInt(String(inv.due || "0").replace(/[^0-9]/g, "")) || 0
                            return (
                              <tr key={inv.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                                <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                  {inv.id}
                                </td>
                                <td className="py-3 px-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                  {inv.billDate ? formatDisplayDate(inv.billDate) : "N/A"}
                                </td>
                                <td className="py-3 px-3 text-zinc-800 dark:text-zinc-200 font-medium whitespace-nowrap">
                                  {inv.dueDate ? formatDisplayDate(inv.dueDate) : "N/A"}
                                </td>
                                <td className="py-3 px-3 font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                                  {inv.totalInvoiced}
                                </td>
                                <td className="py-3 px-3 font-semibold text-emerald-600 whitespace-nowrap">
                                  {inv.paymentReceived || "₹0"}
                                </td>
                                <td className="py-3 px-3 font-bold text-rose-600 whitespace-nowrap">
                                  {inv.due || "₹0"}
                                </td>
                                <td className="py-3 px-3 text-center whitespace-nowrap">
                                  {getInvoiceStatusBadge(inv.status, dueNum, inv.dueDate)}
                                </td>
                                <td className="py-3 px-3 text-right whitespace-nowrap">
                                  {onViewInvoice && (
                                    <button
                                      type="button"
                                      onClick={() => onViewInvoice(inv)}
                                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] hover:bg-blue-100 border border-blue-200 dark:border-blue-800 flex items-center gap-1 ml-auto cursor-pointer"
                                    >
                                      <Eye size={11} />
                                      <span>View</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EMI INSTALLMENTS CONTRACTS */}
              {activeTab === "installments" && (
                <div className="space-y-3">
                  {clientInstallments.map((inst) => (
                    <div
                      key={inst.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{inst.projectTitle}</h4>
                          <p className="text-[11px] text-zinc-500">Contract Total: ₹{inst.totalContractValue.toLocaleString("en-IN")}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          {inst.status}
                        </span>
                      </div>

                      {/* Schedule Mini-List */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {(inst.schedule || []).map((item) => (
                          <div
                            key={item.installmentNumber}
                            className={`p-2.5 rounded-xl border text-[11px] ${
                              item.status === "Paid"
                                ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                                : item.status === "Overdue"
                                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 animate-pulse"
                                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            }`}
                          >
                            <div className="flex justify-between font-bold">
                              <span>Inst #{item.installmentNumber}</span>
                              <span>{item.formattedAmount}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 mt-1">Due: {formatDisplayDate(item.dueDate)}</div>
                            <div className="mt-1 font-bold text-[10px] flex items-center gap-1">
                              {item.status === "Paid" ? "✅ Paid" : item.status === "Overdue" ? "⚠️ Overdue" : "⏳ Pending"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
    </>
  );
}
