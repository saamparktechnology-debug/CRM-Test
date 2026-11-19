"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Receipt, Plus, Download, Clock, AlertCircle, CheckCircle2, 
  Search, Calendar, User, Building2, ChevronRight, Send, 
  DollarSign, Sparkles, Filter, CreditCard, ArrowUpRight,
  ShieldCheck, Smartphone, QrCode, FileText, Check, X, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { InstallmentItem, InstallmentScheduleItem, InstallmentStatus, EMIKPIs } from "@/features/subscriptions/types"
import { 
  getInstallments, 
  saveInstallmentRecord, 
  recordInstallmentPayment, 
  sendInstallmentReminder,
  deleteInstallmentRecord
} from "@/features/subscriptions/services/subscriptionService"
import { ClientInstallmentDetailModal } from "@/features/subscriptions/components/ClientInstallmentDetailModal"
import { RecordInstallmentPaymentModal } from "@/features/subscriptions/components/RecordInstallmentPaymentModal"
import { getClients } from "@/features/clients/services/clientService"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient } from "@/lib/clientScopeUtils"

export function EmiSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, isClient, activeCompanyId, canAddEMI, setIsAddModalOpen, kpis, searchQuery, setSearchQuery, setStatusFilter, statusFilter } = ctrl;
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Receipt size={20} />
            </div>
            <span>{isClient ? "My EMI & Milestone Installments" : "EMI & Milestone Installment Hub"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isClient
              ? "Track your project part payments, upcoming milestone due dates, and make instant online payments."
              : `Manage client project EMIs, milestone payment schedules, down payments, and collection tracking for ${activeCompanyId === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology"}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={() => window.print()}>
            Print / Export
          </Button>

          {canAddEMI && !isClient && (
            <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsAddModalOpen(true)}>
              New EMI Contract
            </Button>
          )}
        </div>
      </div>

      {/* KPI Dashboard Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Contract Value</div>
          <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            ₹{kpis.totalContractValue.toLocaleString("en-IN")}
          </div>
          <div className="text-[10.5px] text-zinc-500 font-medium mt-0.5">
            Across {kpis.activeContractsCount} Milestone Contracts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Collected / Paid</div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{kpis.totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
            {kpis.collectionRatePercent}% Collection Rate
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Outstanding Due</div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{kpis.totalRemainingBalance.toLocaleString("en-IN")}
          </div>
          <div className="text-[10.5px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
            Remaining Balance
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Upcoming Milestones</div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
            ₹{kpis.upcomingInstallmentsDueAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-[10.5px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            {kpis.upcomingInstallmentsDueCount} Pending Installments
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Overdue Amount</div>
          <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{kpis.overdueInstallmentsAmount.toLocaleString("en-IN")}
          </div>
          <div className="text-[10.5px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">
            {kpis.overdueInstallmentsCount} Overdue Milestones
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by client, project title, or contract ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs shrink-0 overflow-x-auto">
          {[
            { id: "all", label: "All Contracts" },
            { id: "pending", label: "Pending Due" },
            { id: "overdue", label: "Overdue" },
            { id: "paid", label: "Fully Paid" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: EMI Contracts & Milestones */}
    </>
  );
}
