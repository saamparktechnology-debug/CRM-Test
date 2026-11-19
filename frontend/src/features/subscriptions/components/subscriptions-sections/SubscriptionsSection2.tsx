"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, CreditCard, RefreshCw, X, Send, 
  CheckCircle2, DollarSign, Clock, AlertCircle, Sparkles, 
  Calendar, Layers, FileText, ChevronRight, Package, Check,
  QrCode, Building2, ShieldCheck, ArrowUpRight, User, Percent, Pencil, Search, Bell
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { 
  Subscription, 
  BillingCycle, 
  SubscriptionKPIs, 
  SubscriptionType, 
  PRESET_PACKAGE_TIERS,
  PackageTier,
  calculateOverdueDetails
} from "@/features/subscriptions/types"
import { 
  getSubscriptions, 
  addSubscription, 
  deleteSubscription, 
  renewSubscription, 
  sendSubscriptionReminder, 
  updateSubscription,
  calculateNextCycleDate,
  generateSubscriptionInvoice,
  checkAndSendSubscriptionOverdueReminders
} from "@/features/subscriptions/services/subscriptionService"
import { SubscriptionList } from "@/features/subscriptions/components/SubscriptionList"
import { RenewSubscriptionModal } from "@/features/subscriptions/components/RenewSubscriptionModal"
import { RenewReceiptModal, RenewReceiptData } from "@/features/subscriptions/components/RenewReceiptModal"
import { EditSubscriptionModal } from "@/features/subscriptions/components/EditSubscriptionModal"
import { ClientSubscriptionLedgerModal } from "@/features/subscriptions/components/ClientSubscriptionLedgerModal"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient } from "@/lib/clientScopeUtils"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export function SubscriptionsSection2({ ctrl }: { ctrl: any }) {
  const { toastMessage, isClient, activeCompanyId, tabFilteredSubscriptions, kpis, overdueCount, handleAutoRemindOverdue, isSendingOverdueReminders, canAddSubscription, setIsAddSubModalOpen } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[99999] bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 border border-zinc-700"
          >
            <Sparkles size={16} className="text-teal-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CreditCard size={20} />
            </div>
            <span>{isClient ? "My Recurring Subscriptions" : "Recurring Subscription Hub"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isClient
              ? "View and manage your active service retainers, monthly packages, and renew subscriptions online."
              : `Manage Package Wise subscriptions, Regular retainers, and EMI subscriptions for ${activeCompanyId === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology"}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={() => {
              exportToExcel({
                filename: "subscriptions_register",
                title: "Subscriptions & Recurring Retainers Portfolio",
                subtitle: `Portfolio Register (${tabFilteredSubscriptions.length} Subscriptions)`,
                headers: ["Plan Name", "Model", "Client", "Billing Cycle", "Amount (INR)", "Start Date", "Next Renewal", "Branch", "Status"],
                rows: tabFilteredSubscriptions.map((s: Subscription) => [
                  s.planName,
                  s.subscriptionType === "package" ? "Package Wise" : s.subscriptionType === "emi" ? "EMI Subscription" : "Regular Retainer",
                  s.clientName,
                  s.billingCycle,
                  s.amount,
                  s.startDate,
                  s.nextBillingDate,
                  s.branchName || "-",
                  s.status,
                ]),
              })
            }}
          >
            Export Excel
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileText size={14} />}
            onClick={() => {
              printPDFReport({
                title: "Subscriptions & Recurring Retainers Audit Report",
                subtitle: `Active Subscriptions Directory (${tabFilteredSubscriptions.length} Records)`,
                metaItems: [
                  { label: "Total MRR", value: `₹${kpis.totalMRR.toLocaleString("en-IN")}/mo` },
                  { label: "ARR Run-Rate", value: `₹${kpis.totalARR.toLocaleString("en-IN")}` },
                ],
                headers: ["Plan Name", "Model", "Client", "Billing Cycle", "Amount", "Start Date", "Next Renewal", "Branch", "Status"],
                rows: tabFilteredSubscriptions.map((s: Subscription) => [
                  s.planName,
                  s.subscriptionType === "package" ? "Package" : s.subscriptionType === "emi" ? "EMI" : "Retainer",
                  s.clientName,
                  s.billingCycle,
                  s.amount,
                  s.startDate,
                  s.nextBillingDate,
                  s.branchName || "-",
                  s.status,
                ]),
              })
            }}
          >
            PDF Print
          </Button>

          {overdueCount > 0 && !isClient && (
            <button
              type="button"
              onClick={handleAutoRemindOverdue}
              disabled={isSendingOverdueReminders}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Bell size={13} className={isSendingOverdueReminders ? "animate-bounce" : ""} />
              <span>{isSendingOverdueReminders ? "Dispatching..." : `Auto Remind Overdue (${overdueCount})`}</span>
            </button>
          )}

          {canAddSubscription && !isClient && (
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsAddSubModalOpen(true)}>
              New Subscription
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Monthly MRR</div>
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ₹{kpis.totalMRR.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
              {kpis.activeSubscriptionsCount} Active Subscriptions
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <RefreshCw size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Annualized ARR</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
              ₹{kpis.totalARR.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">
              Recurring Run Rate
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Model Breakdown</div>
            <div className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1 space-y-0.5">
              <div>📦 {kpis.packageSubscriptionsCount} Packages</div>
              <div>🔁 {kpis.regularSubscriptionsCount} Regular • 💳 {kpis.emiSubscriptionsCount} EMI</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Layers size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Upcoming Renewals</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ₹{kpis.renewalsDueThisMonthAmount.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
              {kpis.renewalsDueThisMonthCount} Subscriptions Due
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>
      </div>
    </>
  );
}
