"use client"

import * as React from "react"
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

export function PaymentsSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, isClientRole, payments, canAddPayment, setIsAddPaymentModalOpen, totalAmountNum, totalTransactions, avgPayment, activeTab, setActiveTab, columns, displayedPayments } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[99999] bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-zinc-700"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- TOP HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={24} />
            <span>{isClientRole ? "My Payment Receipts & Ledger" : "Payments Received"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isClientRole
              ? "Review your confirmed payment settlements and download official tax receipts."
              : "Real-time settlement history, transaction references, and payment receipts"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportToExcel({
                filename: "SAAMPARK_Payment_Receipts",
                title: "Payments Received Report",
                subtitle: "Settlement Ledger",
                headers: ["#", "Payment ID", "Invoice #", "Client Name", "Amount", "Payment Method", "Payment Date", "Transaction Ref", "Status"],
                rows: payments.map((p, idx) => [
                  idx + 1,
                  p.id,
                  p.invoiceId,
                  p.client,
                  p.amount,
                  p.paymentMethod,
                  p.paymentDate,
                  p.transactionRef || "-",
                  p.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              printPDFReport({
                title: "Payments Received Report",
                subtitle: "Settlement Ledger",
                headers: ["#", "Payment ID", "Invoice #", "Client Name", "Amount", "Method", "Date", "Transaction Ref", "Status"],
                rows: payments.map((p, idx) => [
                  idx + 1,
                  p.id,
                  p.invoiceId,
                  p.client,
                  p.amount,
                  p.paymentMethod,
                  p.paymentDate,
                  p.transactionRef || "-",
                  p.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={13} className="text-zinc-500" />
            <span>Print</span>
          </button>

          {canAddPayment && (
            <button
              type="button"
              onClick={() => setIsAddPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Record Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">{isClientRole ? "Total Amount Paid" : "Total Collections"}</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalAmountNum.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Total Transactions</p>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{totalTransactions}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
            <Receipt size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Average Ticket Size</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">₹{avgPayment.toLocaleString("en-IN")}</h3>
          </div>
          <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-lg">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* ---------------- TABS & TABLE ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-6 shadow-2xs">
        <Tabs 
          tabs={[{ id: 'list', label: 'List View' }, { id: 'chart', label: 'Analytics Chart' }]} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        
        {activeTab === 'list' ? (
          <>
            <DataTable 
              columns={columns} 
              data={displayedPayments} 
              searchKey="invoiceId"
              searchPlaceholder="Search by invoice number, client, project, txn ref..."
            />
            {/* Summary Footer */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 mt-4 pt-4 flex justify-end gap-12 pr-8 text-xs">
              <div className="text-zinc-500 font-semibold">{isClientRole ? "My Total Paid:" : "Total Settlements Received:"}</div>
              <div className="font-bold text-emerald-600 text-sm">₹{totalAmountNum.toLocaleString("en-IN")}</div>
            </div>
          </>
        ) : (
          <div className="py-8 space-y-6">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Payment Collections Breakdown</h3>
            <div className="space-y-3 max-w-xl">
              {displayedPayments.map((p) => {
                const percentage = totalAmountNum > 0 ? Math.round(((p.amountNum || 0) / totalAmountNum) * 100) : 0
                return (
                  <div key={p.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-700 dark:text-zinc-300">{p.client} ({p.paymentMethod})</span>
                      <span className="text-emerald-600">{p.amount} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
