"use client"

import * as React from "react"
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface InvoiceKpiCardsProps {
  displayedCount: number
  totalInvoicedNum: number
  totalReceivedNum: number
  totalDueNum: number
  pendingCount: number
  overdueCount: number
}

export function InvoiceKpiCards({
  displayedCount,
  totalInvoicedNum,
  totalReceivedNum,
  totalDueNum,
  pendingCount,
  overdueCount,
}: InvoiceKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Total Billed Value</p>
          <p className="text-xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
            ₹{totalInvoicedNum.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{displayedCount} Total Invoices</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
          <FileText size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Payments Collected</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{totalReceivedNum.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Verified Receipts</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Outstanding Receivables</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{totalDueNum.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">{pendingCount} Open Bills</p>
        </div>
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
          <Clock size={20} />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500">Overdue Invoices</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">{overdueCount}</p>
          <p className="text-[11px] text-zinc-400 mt-0.5">Past Due Date</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
          <AlertCircle size={20} />
        </div>
      </div>
    </div>
  )
}
