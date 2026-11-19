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

export function SubscriptionsSection3({ ctrl }: { ctrl: any }) {
  const { setActiveTab, activeTab, visibleSubscriptions, kpis, isClient, setSelectedSubModelTab, setIsCustomPackage, setIsAddSubModalOpen, setSelectedPackageId, isLoading, tabFilteredSubscriptions, handleDeleteSubscription, setRenewingSubscription, setEditingSubscription, handleSendReminder, handleToggleAutoRenew, setClientPayingSub, handleGenerateSubscriptionInvoice, handleViewRenewReceipt, setSelectedLedgerClient, setSelectedLedgerEmail, canEditSubscription, canDeleteSubscription } = ctrl;
  return (
    <>
      {/* 3 Options Navigation Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl w-full sm:w-fit border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs overflow-x-auto">
        {/* Option 1: All Subscriptions */}
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "all"
              ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <span>All Subscriptions</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
            {visibleSubscriptions.length}
          </span>
        </button>

        {/* Option 2: Package Wise */}
        <button
          type="button"
          onClick={() => setActiveTab("package")}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "package"
              ? "bg-white dark:bg-zinc-900 text-purple-800 dark:text-purple-300 shadow-sm border border-purple-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <span>📦 Package Wise</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "package"
              ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
          }`}>
            {kpis.packageSubscriptionsCount}
          </span>
        </button>

        {/* Option 3: Regular Subscriptions */}
        <button
          type="button"
          onClick={() => setActiveTab("regular")}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "regular"
              ? "bg-white dark:bg-zinc-900 text-blue-800 dark:text-blue-300 shadow-sm border border-blue-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <span>🔁 Regular</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "regular"
              ? "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
          }`}>
            {kpis.regularSubscriptionsCount}
          </span>
        </button>

        {/* Option 4: EMI Subscriptions */}
        <button
          type="button"
          onClick={() => setActiveTab("emi")}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "emi"
              ? "bg-white dark:bg-zinc-900 text-teal-800 dark:text-teal-300 shadow-sm border border-teal-500/20"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <span>💳 EMI Subscription</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === "emi"
              ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
              : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
          }`}>
            {kpis.emiSubscriptionsCount}
          </span>
        </button>
      </div>

      {/* Package Tier Showcase Banner when "Package" tab is selected */}
      {activeTab === "package" && !isClient && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Available Pre-Configured Packages (Click to assign):
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedSubModelTab("package")
                setIsCustomPackage(true)
                setIsAddSubModalOpen(true)
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              + Create Custom Package Entry
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_PACKAGE_TIERS.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      {pkg.category}
                    </span>
                    {pkg.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-1">
                    {pkg.name}
                  </h4>
                  <div className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1.5">
                    ₹{pkg.price.toLocaleString("en-IN")}
                    <span className="text-xs text-zinc-400 font-normal"> / {pkg.billingCycle.toLowerCase()}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">
                    {pkg.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  {pkg.deliverables.slice(0, 3).map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{d}</span>
                    </div>
                  ))}
                  {pkg.deliverables.length > 3 && (
                    <div className="text-[10px] text-zinc-400 font-semibold pl-4">
                      +{pkg.deliverables.length - 3} more deliverables
                    </div>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full text-xs font-bold"
                  onClick={() => {
                    setSelectedSubModelTab("package")
                    setSelectedPackageId(pkg.id)
                    setIsCustomPackage(false)
                    setIsAddSubModalOpen(true)
                  }}
                >
                  Assign to Client
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Subscriptions List Component */}
      {isLoading ? (
        <ThreeDotLoader text="Loading subscriptions..." fullScreen={false} />
      ) : (
        <SubscriptionList
          subscriptions={tabFilteredSubscriptions}
          onDelete={handleDeleteSubscription}
          onOpenRenewModal={(sub) => setRenewingSubscription(sub)}
          onOpenEditModal={(sub) => setEditingSubscription(sub)}
          onSendReminder={handleSendReminder}
          onToggleAutoRenew={handleToggleAutoRenew}
          onClientPayNow={(sub) => setClientPayingSub(sub)}
          onGenerateInvoice={handleGenerateSubscriptionInvoice}
          onViewReceipt={handleViewRenewReceipt}
          onSelectClient={(cName, sub) => {
            setSelectedLedgerClient(cName)
            setSelectedLedgerEmail(sub.clientEmail)
          }}
          canEdit={canEditSubscription}
          canDelete={canDeleteSubscription}
        />
      )}
    </>
  );
}
