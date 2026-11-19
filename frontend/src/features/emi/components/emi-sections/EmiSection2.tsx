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

export function EmiSection2({ ctrl }: { ctrl: any }) {
  const { isLoading, filteredInstallments, isClient, setSelectedForDetail, canDeleteEMI, handleDeleteContract, setClientPayingInstallment, setRecordingPayment, handleSendReminder } = ctrl;
  return (
    <>
      {isLoading ? (
        <ThreeDotLoader text="Loading EMI milestone contracts..." fullScreen={false} />
      ) : filteredInstallments.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto text-xl font-bold">
            💳
          </div>
          <h3 className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">No EMI Milestone Contracts Found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {isClient
              ? "You do not have any active installment or EMI payment plans at this moment."
              : "Create custom part-payment contracts or milestone installments using the 'New EMI Contract' button above."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInstallments.map((item) => {
            const progress = item.totalContractValue > 0
              ? Math.min(100, Math.round((item.totalPaid / item.totalContractValue) * 100))
              : 0
            const nextPending = item.schedule.find(s => s.status !== "Paid")

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs hover:border-teal-500/30 transition-all space-y-4"
              >
                {/* Contract Summary Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-base border border-teal-500/20 shrink-0">
                      💳
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                          {item.projectTitle}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                            : item.status === "Overdue"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">{item.clientName}</span>
                        {item.clientCompany && item.clientCompany !== item.clientName && (
                          <span>• {item.clientCompany}</span>
                        )}
                        <span>• Contract ID: {item.id}</span>
                      </p>
                    </div>
                  </div>

                  {/* Financial Stats & Progress */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-400 font-bold uppercase">Total Contract</div>
                      <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                        ₹{item.totalContractValue.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Total Paid</div>
                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ₹{item.totalPaid.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase">Balance Due</div>
                      <div className="text-sm font-black text-rose-600 dark:text-rose-400">
                        ₹{item.remainingBalance.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedForDetail(item)}
                      className="text-xs"
                    >
                      View Schedule ({item.schedule.length})
                    </Button>

                    {canDeleteEMI && !isClient && (
                      <button
                        type="button"
                        onClick={() => handleDeleteContract(item.id, item.projectTitle)}
                        className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors border border-transparent hover:border-rose-200 dark:hover:border-rose-800"
                        title="Delete EMI Contract"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-zinc-500">
                    <span>Payment Milestone Progress: <strong>{progress}%</strong></span>
                    <span>
                      {item.schedule.filter(s => s.status === "Paid").length} of {item.totalInstallments} Milestones Cleared
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full transition-all duration-500 rounded-full ${
                        progress === 100
                          ? "bg-emerald-500"
                          : progress > 50
                            ? "bg-teal-500"
                            : "bg-blue-500"
                      }`}
                    />
                  </div>
                </div>

                {/* Schedule Grid Pill View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  {item.schedule.map((sched) => {
                    const isPaid = sched.status === "Paid"
                    const isOverdue = sched.status === "Overdue"

                    return (
                      <div
                        key={sched.installmentNumber}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 transition-all ${
                          isPaid
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200"
                            : isOverdue
                              ? "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 animate-pulse"
                              : "bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">
                            Part #{sched.installmentNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-bold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                              : isOverdue
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                          }`}>
                            {sched.status}
                          </span>
                        </div>

                        <div>
                          <div className="text-sm font-black">
                            {sched.formattedAmount}
                          </div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                            <Calendar size={11} />
                            <span>Due: {sched.dueDate}</span>
                          </div>
                        </div>

                        {/* Action buttons on each milestone */}
                        {!isPaid && (
                          <div className="pt-1 border-t border-zinc-200/60 dark:border-zinc-700/40 flex items-center gap-1.5">
                            {/* Client Pay Now Button */}
                            {isClient ? (
                              <button
                                type="button"
                                onClick={() => setClientPayingInstallment({ installment: item, scheduleItem: sched })}
                                className="w-full py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10.5px] flex items-center justify-center gap-1 shadow-2xs cursor-pointer transition-colors"
                              >
                                <CreditCard size={12} />
                                <span>Pay Now</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => setRecordingPayment({ installment: item, scheduleItem: sched })}
                                  className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10.5px] flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Check size={11} />
                                  <span>Record Paid</span>
                                </button>
                                {item.clientEmail && (
                                  <button
                                    type="button"
                                    onClick={() => handleSendReminder(item.id, sched.installmentNumber)}
                                    className="p-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 text-[10px] cursor-pointer"
                                    title="Send Email Reminder"
                                  >
                                    <Send size={11} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  );
}
