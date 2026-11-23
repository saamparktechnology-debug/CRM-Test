"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function SubscriptionsSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { isAddSubModalOpen, setIsAddSubModalOpen, setSelectedSubModelTab, selectedSubModelTab, handleCreateSubscriptionSubmit, setSubTaxType, subTaxType, dailyLateFeeInput, setDailyLateFeeInput, assignedTeamMemberEmail, setAssignedTeamMemberEmail, teamMembers, teamSharePctInput, setTeamSharePctInput, setIsCustomClient, isCustomClient, clientSearchQuery, setClientSearchQuery, newClientName, setNewClientName, availableClients, customClientEmail, setCustomClientEmail, customClientPhone, setCustomClientPhone, customClientCompany, setCustomClientCompany, setIsCustomPackage, isCustomPackage, selectedPackageId, setSelectedPackageId, customPackageName, setCustomPackageName, customPackagePrice, setCustomPackagePrice, customPackageCycle, setCustomPackageCycle, customDeliverablesText, setCustomDeliverablesText, regularPlanName, setRegularPlanName, regularAmount, setRegularAmount, regularCycle, setRegularCycle, customDaysCount, setCustomDaysCount, regularStartDate, setRegularStartDate, regularNextDate, setRegularNextDate, emiPlanName, setEmiPlanName, emiTotalAmount, setEmiTotalAmount, emiDownPayment, setEmiDownPayment, isEmiCustomTenure, emiTenureMonths, setIsEmiCustomTenure, setEmiTenureMonths } = ctrl;
  return (
    <>
      {isAddSubModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-teal-900/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Create New Subscription Plan
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Choose between Package Wise, Regular Retainer, or EMI Subscription
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* 3 Model Selector Tabs inside Modal */}
              <div className="px-6 pt-4 pb-2 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubModelTab("package")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      selectedSubModelTab === "package"
                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                        : "bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="text-xs">📦 Option 1</div>
                    <div className="text-[11px] opacity-90">Package Wise</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSubModelTab("regular")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      selectedSubModelTab === "regular"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="text-xs">🔁 Option 2</div>
                    <div className="text-[11px] opacity-90">Regular Retainer</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSubModelTab("emi")}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      selectedSubModelTab === "emi"
                        ? "bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-500/20"
                        : "bg-white dark:bg-zinc-850 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="text-xs">💳 Option 3</div>
                    <div className="text-[11px] opacity-90">EMI Subscription</div>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleCreateSubscriptionSubmit} className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                {/* Tax Configuration (GST vs Non-GST) & Overdue Late Fee */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                      Subscription Tax Configuration:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSubTaxType("gst")}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center gap-0.5 transition-all cursor-pointer ${
                          subTaxType === "gst"
                            ? "bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-200 ring-2 ring-teal-500/20 font-bold"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        }`}
                      >
                        <span className="text-xs">🏢 GST Tax Plan</span>
                        <span className="text-[9.5px] opacity-75">18% GST Applicable</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubTaxType("nongst")}
                        className={`p-2 rounded-xl border flex flex-col items-center text-center gap-0.5 transition-all cursor-pointer ${
                          subTaxType === "nongst"
                            ? "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-800 dark:text-blue-200 ring-2 ring-blue-500/20 font-bold"
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        }`}
                      >
                        <span className="text-xs">📄 Non-GST Plan</span>
                        <span className="text-[9.5px] opacity-75">0% GST / Pure Service</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                        Overdue Daily Late Fee / Added Charge (₹/day)
                      </label>
                      <span className="text-[9px] text-zinc-400">Charged each day past due</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 (e.g. 50 / day)"
                        value={dailyLateFeeInput === "" ? "" : dailyLateFeeInput}
                        onChange={(e) => setDailyLateFeeInput(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Assign Managing Team Member & Revenue Share Commission (%) */}
                <div className="p-3 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/30 dark:to-blue-950/20 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                    <User size={13} />
                    <span>Assign Managing Team Member & Revenue Share (%)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Managing Team Member (Only Team)
                      </label>
                      <select
                        value={assignedTeamMemberEmail}
                        onChange={(e) => setAssignedTeamMemberEmail(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-medium text-xs"
                      >
                        <option value="">-- No Member Assigned --</option>
                        {teamMembers.map(m => (
                          <option key={m.email} value={m.email}>
                            {m.name} ({m.role || 'Team'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Team Member Revenue Share (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          placeholder="10"
                          value={teamSharePctInput === "" ? "" : teamSharePctInput}
                          onChange={(e) => setTeamSharePctInput(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-full px-2.5 pr-7 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs focus:outline-hidden"
                        />
                        <span className="absolute right-2.5 top-1.5 text-zinc-400 font-bold text-xs">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Selection (Shared for all 3) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-600 dark:text-zinc-400 font-semibold">
                      Subscriber Client *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomClient(!isCustomClient)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
                    >
                      {isCustomClient ? "Select Existing Client" : "+ Custom Client Entry"}
                    </button>
                  </div>

                  {!isCustomClient ? (
                    <div className="space-y-1.5">
                      {/* Search Filter Input */}
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-2.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search client by name, company, email..."
                          value={clientSearchQuery}
                          onChange={(e) => setClientSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-8 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:outline-hidden"
                        />
                        {clientSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setClientSearchQuery("")}
                            className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Filtered Dropdown */}
                      <select
                        value={newClientName}
                        onChange={(e) => {
                          setNewClientName(e.target.value)
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-medium text-xs"
                      >
                        {availableClients
                          .filter(c => {
                            if (!clientSearchQuery.trim()) return true
                            const q = clientSearchQuery.toLowerCase().trim()
                            return c.name.toLowerCase().includes(q) ||
                              (c.company && c.company.toLowerCase().includes(q)) ||
                              (c.email && c.email.toLowerCase().includes(q))
                          })
                          .map(c => (
                            <option key={c.name} value={c.name}>
                              {c.name} {c.company ? `(${c.company})` : ''} {c.email ? `• ${c.email}` : ''}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700">
                      <input
                        type="text"
                        required
                        placeholder="Client Full Name *"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="email"
                          placeholder="Client Email"
                          value={customClientEmail}
                          onChange={(e) => setCustomClientEmail(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Client Phone"
                          value={customClientPhone}
                          onChange={(e) => setCustomClientPhone(e.target.value)}
                          className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Company / Business Name"
                        value={customClientCompany}
                        onChange={(e) => setCustomClientCompany(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* ── TAB A: PACKAGE WISE FORM ── */}
                {selectedSubModelTab === "package" && (
                  <div className="space-y-3 p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-200/60 dark:border-purple-900/40">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-purple-900 dark:text-purple-200 text-xs">
                        Package Selection & Deliverables
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsCustomPackage(!isCustomPackage)}
                        className="text-[11px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                      >
                        {isCustomPackage ? "Choose Ready Preset" : "+ Custom Package Entry"}
                      </button>
                    </div>

                    {!isCustomPackage ? (
                      <div className="space-y-2">
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                          Select Pre-Configured Package:
                        </label>
                        <select
                          value={selectedPackageId}
                          onChange={(e) => setSelectedPackageId(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        >
                          {PRESET_PACKAGE_TIERS.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ₹{p.price.toLocaleString("en-IN")}/{p.billingCycle.toLowerCase()} ({p.category})
                            </option>
                          ))}
                        </select>

                        {/* Deliverables preview */}
                        {(() => {
                          const p = PRESET_PACKAGE_TIERS.find(t => t.id === selectedPackageId) || PRESET_PACKAGE_TIERS[0]
                          return (
                            <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                              <div className="font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                                Included Inclusions & Deliverables:
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                {p.deliverables.map((d, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[10.5px] text-zinc-600 dark:text-zinc-400">
                                    <Check size={11} className="text-emerald-500 shrink-0" />
                                    <span className="truncate">{d}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Custom Package Title *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. VIP Dedicated Engineering & Cloud Retainer"
                            value={customPackageName}
                            onChange={(e) => setCustomPackageName(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              Package Price (₹) *
                            </label>
                            <input
                              type="number"
                              required
                              value={customPackagePrice}
                              onChange={(e) => setCustomPackagePrice(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                              Billing Interval
                            </label>
                            <select
                              value={customPackageCycle}
                              onChange={(e) => setCustomPackageCycle(e.target.value as BillingCycle)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                            >
                              {(masterBundle?.options?.["billing_cycle"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                            Deliverables Checklist (1 item per line):
                          </label>
                          <textarea
                            rows={3}
                            value={customDeliverablesText}
                            onChange={(e) => setCustomDeliverablesText(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB B: REGULAR RETAINER FORM ── */}
                {selectedSubModelTab === "regular" && (
                  <div className="space-y-3 p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs">
                      Regular Recurring Retainer Details
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Subscription / Retainer Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AWS Cloud Server & ERP Maintenance Retainer"
                        value={regularPlanName}
                        onChange={(e) => setRegularPlanName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Recurring Amount (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={regularAmount}
                          onChange={(e) => setRegularAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Billing Interval
                        </label>
                        <select
                          value={regularCycle}
                          onChange={(e) => setRegularCycle(e.target.value as BillingCycle)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        >
                          {(masterBundle?.options?.["billing_unit"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                        </select>
                      </div>
                    </div>

                    {regularCycle === "Custom Days" && (
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Interval Duration in Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={customDaysCount}
                          onChange={(e) => setCustomDaysCount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          1st Payment Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={regularStartDate}
                          onChange={(e) => setRegularStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Next Billing Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={regularNextDate}
                          onChange={(e) => setRegularNextDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-medium"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB C: EMI SUBSCRIPTION FORM ── */}
                {selectedSubModelTab === "emi" && (
                  <div className="space-y-3 p-4 bg-teal-50/40 dark:bg-teal-950/20 rounded-2xl border border-teal-200/60 dark:border-teal-900/40">
                    <h4 className="font-bold text-teal-900 dark:text-teal-200 text-xs">
                      EMI Subscription Tenure & Breakdown
                    </h4>

                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                        Subscription Product / Service Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Enterprise Full-Stack ERP on 6M EMI"
                        value={emiPlanName}
                        onChange={(e) => setEmiPlanName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Total Value (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          value={emiTotalAmount}
                          onChange={(e) => setEmiTotalAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Down Payment (₹)
                        </label>
                        <input
                          type="number"
                          value={emiDownPayment}
                          onChange={(e) => setEmiDownPayment(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                          Tenure (Months)
                        </label>
                        <select
                          value={isEmiCustomTenure ? "custom" : String(emiTenureMonths)}
                          onChange={(e) => {
                            const val = e.target.value
                            if (val === "custom") {
                              setIsEmiCustomTenure(true)
                            } else {
                              setIsEmiCustomTenure(false)
                              setEmiTenureMonths(Number(val))
                            }
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold cursor-pointer"
                        >
                          {(masterBundle?.options?.["duration_offer"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                        </select>
                        {isEmiCustomTenure && (
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={emiTenureMonths}
                            onChange={(e) => setEmiTenureMonths(Math.max(1, Number(e.target.value)))}
                            placeholder="Custom months..."
                            className="mt-1.5 w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-teal-300 dark:border-teal-700 rounded-xl text-xs font-bold text-right"
                          />
                        )}
                      </div>
                    </div>

                    {/* Calculated EMI Preview Card */}
                    {(() => {
                      const total = parseInt(emiTotalAmount.replace(/[^0-9]/g, "")) || 0
                      const down = parseInt(emiDownPayment.replace(/[^0-9]/g, "")) || 0
                      const bal = Math.max(0, total - down)
                      const monthly = Math.round(bal / Math.max(1, emiTenureMonths))
                      return (
                        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase">Computed Monthly EMI</div>
                            <div className="text-base font-black text-teal-600 dark:text-teal-400">
                              ₹{monthly.toLocaleString("en-IN")} / month
                            </div>
                          </div>
                          <div className="text-right text-[11px] text-zinc-500">
                            <div>Tenure: <strong>{emiTenureMonths} Installments</strong></div>
                            <div>Financed Balance: <strong>₹{bal.toLocaleString("en-IN")}</strong></div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddSubModalOpen(false)}
                    className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <CreditCard size={14} className="mr-1.5" />
                    Create Subscription
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
    </>
  );
}
