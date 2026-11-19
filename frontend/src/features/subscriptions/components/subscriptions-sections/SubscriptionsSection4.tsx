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

export function SubscriptionsSection4({ ctrl }: { ctrl: any }) {
  const { renewingSubscription, setRenewingSubscription, handleRenewSubscriptionConfirm, activeReceipt, setActiveReceipt, clientPayingSub, setClientPayingSub, setClientPayMethod, clientPayMethod, handleClientPaySubscription, isClientPayProcessing } = ctrl;
  return (
    <>
      {/* ── MODAL 1: RENEW SUBSCRIPTION MODAL (ADMIN / STAFF) ── */}
      <RenewSubscriptionModal
        isOpen={Boolean(renewingSubscription)}
        subscription={renewingSubscription}
        onClose={() => setRenewingSubscription(null)}
        onConfirm={handleRenewSubscriptionConfirm}
      />

      {/* ── MODAL 1.5: RENEW RECEIPT MODAL ── */}
      <RenewReceiptModal
        isOpen={Boolean(activeReceipt)}
        receipt={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />

      {/* ── MODAL 2: CLIENT "PAY NOW / RENEW" INTERACTIVE MODAL ── */}
      <AnimatePresence>
        {clientPayingSub && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden my-8"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    🔄
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Renew Subscription Online</h3>
                    <p className="text-[11px] text-blue-100 truncate max-w-[280px]">
                      {clientPayingSub.planName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setClientPayingSub(null)}
                  className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-xs">
                {/* Amount Due Card */}
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-center">
                  <div className="text-[11px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Renewal Amount Due
                  </div>
                  <div className="text-3xl font-black text-blue-900 dark:text-blue-100 mt-1">
                    {clientPayingSub.amount}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Renewal Interval: {clientPayingSub.billingCycle} • Due on {clientPayingSub.nextBillingDate}
                  </div>
                </div>

                {/* Select Payment Method */}
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                    Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setClientPayMethod("upi")}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        clientPayMethod === "upi"
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
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
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <CreditCard size={18} />
                      <span className="text-[10.5px]">Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientPayMethod("bank")}
                      className={`p-3 rounded-xl border font-bold flex flex-col items-center gap-1.5 cursor-pointer transition-all ${
                        clientPayMethod === "bank"
                          ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20"
                          : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Building2 size={18} />
                      <span className="text-[10.5px]">Bank IMPS</span>
                    </button>
                  </div>
                </div>

                {/* Method Display */}
                {clientPayMethod === "upi" && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-center space-y-2">
                    <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl shadow-xs border border-zinc-200 flex items-center justify-center">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=saamparktechnology@icici%26pn=SAAMPARK%20GROUP%26am=${clientPayingSub.numericAmount || 25000}%26cu=INR`} 
                        alt="UPI QR Code" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                      Scan with any UPI App (GPay, PhonePe, Paytm)
                    </div>
                  </div>
                )}

                {clientPayMethod === "bank" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Bank:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">ICICI Bank Ltd.</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">A/C Name:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100">SAAMPARK TECHNOLOGY PVT LTD</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">A/C Number:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">002105023910</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">IFSC:</span>
                      <strong className="text-zinc-900 dark:text-zinc-100 font-mono">ICIC0000021</strong>
                    </div>
                  </div>
                )}

                {clientPayMethod === "card" && (
                  <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number"
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

                {/* Actions */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setClientPayingSub(null)}
                    className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleClientPaySubscription}
                    isLoading={isClientPayProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    <ShieldCheck size={14} className="mr-1.5" />
                    Pay & Renew ({clientPayingSub.amount})
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
