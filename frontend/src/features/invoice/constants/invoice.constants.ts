import { InvoiceStatus } from "../types/invoice.types"

export const INITIAL_INVOICES = [] as const

export const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  "Fully paid":
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
  "Partially paid":
    "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
  "Not paid":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
  "Payment Pending":
    "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
  "Pending Verification":
    "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
  "Pending Approval":
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
  Rejected:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
  Draft:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  Credited:
    "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200 dark:border-teal-800/60",
}

export const INVOICE_PAYMENT_METHODS = [
  "UPI / Net Banking",
  "NEFT / RTGS / IMPS",
  "Bank Cheque",
  "Cash Deposit",
  "Credit / Debit Card",
] as const

export const CLIENT_PAYMENT_METHODS = [
  "UPI / PhonePe / GPay",
  "NEFT / RTGS / IMPS Bank Transfer",
  "Net Banking",
  "Cheque Deposit",
] as const
