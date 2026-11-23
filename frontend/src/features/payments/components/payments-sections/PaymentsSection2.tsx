"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Download, 
  CreditCard, 
  Search, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Trash2, 
  X, 
  Send, 
  Eye,
  TrendingUp,
  Receipt
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { formatDisplayDate } from "@/lib/utils"
import { Tabs } from "@/components/ui/Tabs"
import { useAuthStore } from "@/store/useAuthStore"
import { getPayments, addPayment, deletePayment, PaymentItem } from "@/features/payments/services/paymentService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { usePermissionStore } from "@/store/usePermissionStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export function PaymentsSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { isAddPaymentModalOpen, setIsAddPaymentModalOpen, handleCreatePayment, selectedInvoiceId, handleInvoiceChange, invoices, client, setClient, clientEmail, setClientEmail, project, setProject, amount, setAmount, paymentMethod, setPaymentMethod, transactionRef, setTransactionRef, paymentDate, setPaymentDate, note, setNote, selectedPayment, setSelectedPayment } = ctrl;
  return (
    <>
      {/* ---------------- RECORD PAYMENT MODAL ---------------- */}
      <AnimatePresence>
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Record New Payment</h3>
                <button type="button" onClick={() => setIsAddPaymentModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreatePayment} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Link to Tax Invoice (Optional)</label>
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => handleInvoiceChange(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">-- Direct Payment (No Invoice) --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.id} - {inv.client} (Total: {inv.totalInvoiced}, Due: {inv.due})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Client Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Corp"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Client Email</label>
                    <input
                      type="email"
                      placeholder="client@acme.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Project / Purpose</label>
                  <input
                    type="text"
                    placeholder="Project Title"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Amount Received (₹) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 25,000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                    >
                      {(masterBundle?.options?.["payment_method"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Transaction Ref / UTR</label>
                    <input
                      type="text"
                      placeholder="e.g. UTR891238491"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-500 font-medium mb-1">Payment Date</label>
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="Milestone clearance notes"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Save Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- RECEIPT VIEW MODAL ---------------- */}
      <AnimatePresence>
        {selectedPayment && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Payment Receipt #{selectedPayment.id}
                  </h3>
                </div>
                <button type="button" onClick={() => setSelectedPayment(null)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-3 text-xs">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold block text-[11px]">Payment Received</span>
                  <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{selectedPayment.amount}</h2>
                  <span className="text-[10px] text-emerald-600/80 font-mono mt-0.5 block">Status: Completed</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-zinc-600 dark:text-zinc-400 pt-2">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Client:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedPayment.client}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Payment Date:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{formatDisplayDate(selectedPayment.paymentDate)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Method:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedPayment.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Ref / UTR:</span>
                    <span className="font-mono text-zinc-800 dark:text-zinc-200">{selectedPayment.transactionRef || "N/A"}</span>
                  </div>
                </div>

                {selectedPayment.note && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="text-zinc-400 block text-[11px]">Notes:</span>
                    <p className="text-zinc-600 dark:text-zinc-300">{selectedPayment.note}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end px-6 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
