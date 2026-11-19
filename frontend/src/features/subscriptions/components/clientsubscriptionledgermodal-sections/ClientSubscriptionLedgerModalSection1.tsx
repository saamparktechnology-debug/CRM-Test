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

export function ClientSubscriptionLedgerModalSection1({ ctrl }: { ctrl: any }) {
  const { clientName, metrics, onClose, setActiveTab, activeTab, matchedSubs, clientInvoices, clientInstallments } = ctrl;
  return (
    <>
      {/* Modal Header & Client Profile */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-900/10 via-zinc-50 to-teal-900/10 dark:from-blue-950/40 dark:via-zinc-900 dark:to-teal-950/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {clientName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {clientName}
                  </h2>
                  {metrics.company && metrics.company !== clientName && (
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs border border-zinc-200 dark:border-zinc-700">
                      🏢 {metrics.company}
                    </span>
                  )}
                  {metrics.branchName && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800">
                      📍 {metrics.branchName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex-wrap">
                  {metrics.email && metrics.email !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-blue-500" />
                      <span>{metrics.email}</span>
                    </span>
                  )}
                  {metrics.phone && metrics.phone !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} className="text-emerald-500" />
                      <span>{metrics.phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-zinc-400">Total Billed</div>
              <div className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                ₹{metrics.totalInvoiced.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">All Invoices & Retainers</div>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Total Paid</span>
                <CheckCircle2 size={12} />
              </div>
              <div className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{metrics.totalPaid.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Settled Ledger</div>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-800/80 rounded-2xl border border-amber-200 dark:border-amber-900/60 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Current Due</span>
                <Clock size={12} />
              </div>
              <div className="text-sm sm:text-base font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                ₹{metrics.totalDue.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">Pending Payment</div>
            </div>

            <div className={`p-3 rounded-2xl border shadow-2xs transition-all ${
              metrics.overdueInvoicesAmount > 0
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800"
                : "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/80"
            }`}>
              <div className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>Overdue Due</span>
                <AlertTriangle size={12} />
              </div>
              <div className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                ₹{metrics.overdueInvoicesAmount.toLocaleString("en-IN")}
              </div>
              <div className="text-[10px] text-rose-500 font-semibold mt-0.5">
                {metrics.overdueInvoicesCount > 0 ? `${metrics.overdueInvoicesCount} Overdue Cycles` : "No Overdue"}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-b border-zinc-200 dark:border-zinc-700 pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("subscriptions")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "subscriptions"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <RefreshCw size={13} />
              <span>Subscriptions & Retainers ({matchedSubs.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("invoices")}
              className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "invoices"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <Receipt size={13} />
              <span>Invoices & Billing History ({clientInvoices.length})</span>
            </button>

            {clientInstallments.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("installments")}
                className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "installments"
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                <CreditCard size={13} />
                <span>EMI Contracts ({clientInstallments.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
    </>
  );
}
