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

export function EmiSection3({ ctrl }: { ctrl: any }) {
  const { selectedForDetail, setSelectedForDetail, handleSendReminder, setRecordingPayment, recordingPayment, handleRecordPaymentConfirm, clientPayingInstallment, setClientPayingInstallment, setClientPayMethod, clientPayMethod, handleClientPayNowSubmit, isClientPayProcessing } = ctrl;
  return (
    <>
      {/* ── MODAL 1: CLIENT INSTALLMENT DETAIL MODAL ── */}
      <ClientInstallmentDetailModal
        isOpen={Boolean(selectedForDetail)}
        installment={selectedForDetail}
        onClose={() => setSelectedForDetail(null)}
        onSendReminder={handleSendReminder}
        onRecordPayment={(inst, sched) => {
          setRecordingPayment({ installment: inst, scheduleItem: sched })
        }}
      />

      {/* ── MODAL 2: RECORD PAYMENT MODAL (ADMIN / STAFF) ── */}
      <RecordInstallmentPaymentModal
        isOpen={Boolean(recordingPayment)}
        installment={recordingPayment?.installment || null}
        scheduleItem={recordingPayment?.scheduleItem || null}
        onClose={() => setRecordingPayment(null)}
        onConfirm={handleRecordPaymentConfirm}
      />

      {/* ── MODAL 3: INTERACTIVE "PAY NOW" MODAL FOR CLIENTS ── */}
      <AnimatePresence>
        {clientPayingInstallment && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    💳
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Pay Installment Online</h3>
                    <p className="text-[11px] text-teal-100">
                      Part #{clientPayingInstallment.scheduleItem.installmentNumber} of {clientPayingInstallment.installment.projectTitle}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClientPayingInstallment(null)}
                  className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Amount Due Card */}
                <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/40 text-center">
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                    Amount Payable
                  </div>
                  <div className="text-3xl font-black text-teal-900 dark:text-teal-100 mt-1">
                    {clientPayingInstallment.scheduleItem.formattedAmount}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Due Date: {clientPayingInstallment.scheduleItem.dueDate}
                  </div>
                </div>

                {/* Select Payment Method */}
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Select Payment Gateway / Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setClientPayMethod("upi")}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        clientPayMethod === "upi"
                          ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <QrCode size={18} />
                      <span className="text-[10.5px]">UPI QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientPayMethod("card")}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        clientPayMethod === "card"
                          ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[10.5px]">Card / NetBanking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientPayMethod("bank")}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        clientPayMethod === "bank"
                          ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <Building2 size={18} />
                      <span className="text-[10.5px]">Bank NEFT/IMPS</span>
                    </button>
                  </div>
                </div>

                {/* Method Specific Display */}
                {clientPayMethod === "upi" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-xs border border-zinc-200 flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=saamparktechnology@icici%26pn=SAAMPARK%20GROUP%26am=${clientPayingInstallment.scheduleItem.amount}%26cu=INR`} 
                        alt="UPI QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Scan with any UPI App (GPay, PhonePe, Paytm)
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono">
                      UPI ID: saamparktechnology@icici
                    </div>
                  </div>
                )}

                {clientPayMethod === "bank" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bank Name:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">ICICI Bank Ltd.</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account Name:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">SAAMPARK TECHNOLOGY PVT LTD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Account Number:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">002105023910</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IFSC Code:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">ICIC0000021</strong>
                    </div>
                  </div>
                )}

                {clientPayMethod === "card" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                      defaultValue="4532 •••• •••• 8892"
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        defaultValue="•••"
                        className="px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Confirm Pay Button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setClientPayingInstallment(null)}
                    className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleClientPayNowSubmit}
                    isLoading={isClientPayProcessing}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Confirm Payment ({clientPayingInstallment.scheduleItem.formattedAmount})
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
