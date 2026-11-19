"use client"

import * as React from "react"
import {
  Plus,
  Download,
  FileText,
  Printer,
  BellRing,
  RefreshCw,
  FolderPlus,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { InvoiceItem } from "../types/invoice.types"
import { printPDFReport, exportToExcel } from "@/lib/exportUtils"

interface InvoiceHeaderProps {
  user: any
  canAddInvoice: boolean
  overdueCount: number
  isSendingOverdueBatch: boolean
  displayedInvoices: InvoiceItem[]
  onBatchOverdueReminders: () => void
  onOpenClientProjectModal: () => void
  onOpenNewInvoice: (isMarketing: boolean) => void
}

export function InvoiceHeader({
  user,
  canAddInvoice,
  overdueCount,
  isSendingOverdueBatch,
  displayedInvoices,
  onBatchOverdueReminders,
  onOpenClientProjectModal,
  onOpenNewInvoice,
}: InvoiceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
            <FileText size={22} />
          </div>
          <span>Tax Invoices &amp; Billing Ledger</span>
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          GST &amp; Non-GST billing, automated payment reminders, UTR verification, and milestone invoicing
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {user?.role !== "Clients" && overdueCount > 0 && (
          <Button
            variant="outline"
            onClick={onBatchOverdueReminders}
            disabled={isSendingOverdueBatch}
            className="h-9 text-xs gap-1.5 border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSendingOverdueBatch ? "animate-spin" : ""}`} />
            <BellRing className="w-3.5 h-3.5" />
            Remind Overdue ({overdueCount})
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() =>
            printPDFReport({
              title: "Invoices Financial Report",
              subtitle: `Total Bills: ${displayedInvoices.length}`,
              columns: [
                { header: "Invoice ID", accessorKey: "id" },
                { header: "Client", accessorKey: "client" },
                { header: "Project", accessorKey: "project" },
                { header: "Bill Date", accessorKey: "billDate" },
                { header: "Due Date", accessorKey: "dueDate" },
                { header: "Total Invoiced", accessorKey: "totalInvoiced" },
                { header: "Received", accessorKey: "paymentReceived" },
                { header: "Due", accessorKey: "due" },
                { header: "Status", accessorKey: "status" },
              ],
              data: displayedInvoices,
            })
          }
          className="h-9 text-xs gap-1.5 border-zinc-200 dark:border-zinc-800"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-500" /> Print PDF
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            exportToExcel(
              displayedInvoices.map((i) => ({
                "Invoice ID": i.id,
                Client: i.client,
                Project: i.project,
                "Bill Date": i.billDate,
                "Due Date": i.dueDate,
                "Total Invoiced": i.totalInvoiced,
                Received: i.paymentReceived,
                Due: i.due,
                Status: i.status,
              })),
              "Invoices_List"
            )
          }
          className="h-9 text-xs gap-1.5 border-zinc-200 dark:border-zinc-800"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" /> Excel
        </Button>

        {canAddInvoice && (
          <>
            <Button
              variant="outline"
              onClick={onOpenClientProjectModal}
              className="h-9 text-xs gap-1.5 border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 font-bold"
            >
              <FolderPlus className="w-3.5 h-3.5" /> + Client Project &amp; Bill
            </Button>

            <Button
              variant="outline"
              onClick={() => onOpenNewInvoice(true)}
              className="h-9 text-xs gap-1.5 border-purple-200 dark:border-purple-800 bg-purple-50/60 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" /> + Marketing Bill (Form-9)
            </Button>

            <Button
              onClick={() => onOpenNewInvoice(false)}
              className="h-9 text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Bill
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
