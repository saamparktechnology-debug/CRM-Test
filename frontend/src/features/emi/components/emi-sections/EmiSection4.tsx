"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function EmiSection4({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { isAddModalOpen, setIsAddModalOpen, handleCreateEMIContract, setIsCustomClient, isCustomClient, newClientName, setNewClientName, availableClients, customClientEmail, setCustomClientEmail, customClientPhone, setCustomClientPhone, customClientCompany, setCustomClientCompany, newProjectTitle, setNewProjectTitle, newTotalValue, setNewTotalValue, newAdvancePaid, setNewAdvancePaid, newInstallmentsCount, setNewInstallmentsCount, newInterval, setNewInterval, newFirstDueDate, setNewFirstDueDate, customMilestones, setCustomMilestones } = ctrl;
  return (
    <>
      {/* ── MODAL 4: CREATE NEW EMI CONTRACT (ADMIN / STAFF) ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-r from-teal-900/10 to-emerald-900/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      Create New EMI Milestone Contract
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Set up automated part-payment schedules & milestone installment breakdown
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateEMIContract} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
                {/* Client Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-zinc-600 dark:text-zinc-400 font-semibold">
                      Contract Client *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomClient(!isCustomClient)}
                      className="text-[11px] text-teal-600 dark:text-teal-400 font-bold hover:underline"
                    >
                      {isCustomClient ? "Select Existing Client" : "+ Custom Client Entry"}
                    </button>
                  </div>

                  {!isCustomClient ? (
                    <select
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-medium"
                    >
                      {availableClients.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.company || 'Client'})</option>
                      ))}
                    </select>
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

                {/* Project / Contract Title */}
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                    Project / Milestone Contract Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Custom Multi-Vendor E-Commerce Platform"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-medium"
                  />
                </div>

                {/* Total Value & Advance Paid */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Total Contract Value (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-400 font-bold">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="60000"
                        value={newTotalValue}
                        onChange={(e) => setNewTotalValue(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Advance / Down Payment (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-zinc-400 font-bold">₹</span>
                      <input
                        type="number"
                        placeholder="10000"
                        value={newAdvancePaid}
                        onChange={(e) => setNewAdvancePaid(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Installments Count & Frequency */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      No. of Installments
                    </label>
                    <select
                      value={newInstallmentsCount}
                      onChange={(e) => setNewInstallmentsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                    >
                      {[2, 3, 4, 5, 6, 8, 10, 12, 18, 24].map(n => (
                        <option key={n} value={n}>{n} Installments</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Interval Frequency
                    </label>
                    <select
                      value={newInterval}
                      onChange={(e) => setNewInterval(e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                    >
                      {(masterBundle?.options?.["emi_frequency"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      1st Milestone Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newFirstDueDate}
                      onChange={(e) => setNewFirstDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Real-time Generated Milestone Preview Matrix */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span>Generated Milestone Matrix:</span>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400">
                      Balance: ₹{Math.max(0, (parseInt(newTotalValue.replace(/[^0-9]/g, "")) || 0) - (parseInt(newAdvancePaid.replace(/[^0-9]/g, "")) || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {customMilestones.map((m, idx) => (
                      <div key={m.num} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-[11px]">
                        <span className="font-bold text-zinc-500 w-14 shrink-0">
                          Part #{m.num}
                        </span>
                        <div className="flex-1 flex items-center gap-1.5">
                          <span className="text-zinc-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={m.amount}
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setCustomMilestones(prev => prev.map((item, i) => i === idx ? { ...item, amount: val } : item))
                            }}
                            className="w-24 px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-bold"
                          />
                        </div>
                        <input
                          type="date"
                          value={m.dueDate}
                          onChange={(e) => {
                            const val = e.target.value
                            setCustomMilestones(prev => prev.map((item, i) => i === idx ? { ...item, dueDate: val } : item))
                          }}
                          className="px-2 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
                  >
                    <Receipt size={14} className="mr-1.5" />
                    Create EMI Contract
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
