"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  FileText,
  Sparkles,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldCheck,
  BellRing,
  Check,
  Eye,
  Pencil,
  Trash2,
  User,
} from "lucide-react"
import {
  InvoiceItem,
  InvoiceStatus,
  parseCurrencyNumber,
  isInvoiceOverdue,
  getInvoiceDaysOverdue,
} from "../services/invoice.service"
import { formatDisplayDate } from "@/lib/utils"

interface InvoiceColumnsParams {
  user: any
  isClientRole: boolean
  canEditInvoice: boolean
  canDeleteInvoice: boolean
  setSelectedInvoice: (inv: InvoiceItem) => void
  setIsInvoiceModalOpen: (v: boolean) => void
  setClientPayNowInvoice: (inv: InvoiceItem | null) => void
  setClientUtr: (v: string) => void
  setClientPayNotes: (v: string) => void
  setClientPayError: (v: string | null) => void
  setVerifyingInvoice: (inv: InvoiceItem | null) => void
  setAdminVerifyNotes: (v: string) => void
  handleSendReminder: (inv: InvoiceItem) => void
  handleSendRetainerExpiry: (inv: InvoiceItem) => void
  setPaymentModalInvoice: (inv: InvoiceItem | null) => void
  handleOpenEditInvoice: (inv: InvoiceItem) => void
  handleDeleteInvoice: (id: string) => void
}

export function getInvoiceColumns(params: InvoiceColumnsParams): ColumnDef<InvoiceItem>[] {
  const {
    user,
    isClientRole,
    canEditInvoice,
    canDeleteInvoice,
    setSelectedInvoice,
    setIsInvoiceModalOpen,
    setClientPayNowInvoice,
    setClientUtr,
    setClientPayNotes,
    setClientPayError,
    setVerifyingInvoice,
    setAdminVerifyNotes,
    handleSendReminder,
    handleSendRetainerExpiry,
    setPaymentModalInvoice,
    handleOpenEditInvoice,
    handleDeleteInvoice,
  } = params

  const columns: ColumnDef<InvoiceItem>[] = [
    {
      accessorKey: "id",
      header: "Invoice ID",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => {
            setSelectedInvoice(row.original);
            setIsInvoiceModalOpen(true);
          }}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer text-left"
        >
          {row.getValue("id")}
        </button>
      ),
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">
            {row.getValue("client")}
          </div>
          <div className="text-[11px] text-zinc-400 font-normal">
            {row.original.clientEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => {
        const isMarketing = Boolean(
          row.original.primaryCategory === "Digital Marketing" ||
          (row.original as any)?.marketingPackage?.enabled ||
          row.original.project?.toLowerCase().includes("marketing") ||
          row.original.project?.toLowerCase().includes("retainer") ||
          (row.original.items || []).some(
            (it) =>
              (it.serviceName || "").toLowerCase().includes("marketing") ||
              (it.serviceName || "").toLowerCase().includes("poster"),
          ),
        );
        return (
          <div>
            <div className="text-zinc-700 dark:text-zinc-300 truncate max-w-[180px] font-semibold">
              {row.getValue("project")}
            </div>
            {isMarketing && (
              <a
                href={`/feature/marketing?client=${encodeURIComponent(row.original.client)}&invoice=${encodeURIComponent(row.original.id)}`}
                className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-300 dark:border-purple-800 transition-colors shadow-2xs"
                title="Direct link to Digital Marketing Retainer Hub for this client"
              >
                <span>📱 Marketing Hub →</span>
              </a>
            )}
            {row.original.assignedMemberName && (
              <div className="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                <User size={10} />
                <span>{row.original.assignedMemberName}</span>
                {row.original.memberPayoutType === "fixed" &&
                row.original.memberPayoutAmount ? (
                  <span>
                    (₹{row.original.memberPayoutAmount.toLocaleString("en-IN")})
                  </span>
                ) : row.original.memberSharePct ? (
                  <span>({row.original.memberSharePct}%)</span>
                ) : null}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "billDate",
      header: "Bill date",
      cell: ({ row }) => (
        <div className="text-zinc-500 text-xs font-mono">
          {formatDisplayDate(row.getValue("billDate"))}
        </div>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) => {
        const inv = row.original;
        const overdue = isInvoiceOverdue(inv);
        const days = overdue ? getInvoiceDaysOverdue(inv.dueDate) : 0;
        return (
          <div className="space-y-0.5">
            <div
              className={`text-xs font-mono font-bold ${overdue ? "text-rose-600 dark:text-rose-400" : "text-zinc-600 dark:text-zinc-400"}`}
            >
              {formatDisplayDate(inv.dueDate)}
            </div>
            {overdue && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Overdue ({days}d)
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalInvoiced",
      header: "Total Invoiced",
      cell: ({ row }) => (
        <div className="font-bold text-zinc-900 dark:text-zinc-100">
          {row.getValue("totalInvoiced")}
        </div>
      ),
    },
    {
      accessorKey: "paymentReceived",
      header: "Paid",
      cell: ({ row }) => {
        const inv = parseCurrencyNumber(row.original.totalInvoiced);
        const rec = parseCurrencyNumber(row.original.paymentReceived);
        const capped = Math.min(rec, inv);
        return (
          <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
            ₹{capped.toLocaleString("en-IN")}
          </div>
        );
      },
    },
    {
      accessorKey: "due",
      header: "Due",
      cell: ({ row }) => {
        const dueNum = parseCurrencyNumber(row.original.due);
        const hasDue = dueNum > 0;
        return (
          <div
            className={`font-semibold ${hasDue ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}`}
          >
            {hasDue ? `₹${dueNum.toLocaleString("en-IN")}` : "₹0"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const inv = row.original;
        const status = row.getValue("status") as InvoiceStatus;
        const overdue = isInvoiceOverdue(inv);
        let colorClass = "bg-zinc-100 text-zinc-600 border-zinc-200";
        if (status === "Fully paid")
          colorClass =
            "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
        if (status === "Not paid")
          colorClass =
            "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800";
        if (status === "Partially paid" || status === "Payment Pending")
          colorClass =
            "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
        if (status === "Pending Verification")
          colorClass =
            "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700";

        return (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colorClass} flex items-center gap-1`}
            >
              {status === "Pending Verification" && (
                <Clock size={10} className="animate-spin text-purple-600" />
              )}
              {status}
            </span>
            {inv.paymentProofUtr && (
              <span
                className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-mono text-[9.5px] font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-0.5"
                title={`Submitted UTR: ${inv.paymentProofUtr}`}
              >
                UTR: {inv.paymentProofUtr}
              </span>
            )}
            {inv.clientAccepted && (
              <span
                className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-0.5"
                title={`Accepted by client: ${inv.acceptedBy || inv.client || "Client"}${inv.acceptedAt ? ` on ${new Date(Number(inv.acceptedAt) || inv.acceptedAt).toLocaleDateString("en-IN")}` : ""}`}
              >
                ✓ Client Accepted
              </span>
            )}
            {overdue && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider bg-rose-600 text-white animate-pulse">
                Overdue
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const inv = row.original;
        const isUnpaid =
          inv.status !== "Fully paid" && inv.status !== "Credited";
        const isPendingVerification = inv.status === "Pending Verification";

        return (
          <div className="flex items-center gap-1.5">
            {/* Client View: "Pay Now" Button (UPI QR + Mandatory UTR) */}
            {isClientRole && isUnpaid && !isPendingVerification && (
              <button
                type="button"
                onClick={() => {
                  setClientPayNowInvoice(inv);
                  setClientUtr("");
                  setClientPayNotes("");
                  setClientPayError(null);
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                title="Pay Invoice Online via UPI QR"
              >
                <DollarSign size={13} />
                <span>Pay Now</span>
              </button>
            )}

            {/* Client View: UTR Submitted Status Badge */}
            {isClientRole && isPendingVerification && (
              <span className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-bold flex items-center gap-1 border border-purple-300 dark:border-purple-800">
                <Clock size={11} className="animate-spin" />
                <span>Verification Pending</span>
              </span>
            )}

            {/* Admin View: Verify UTR Button (when client submitted proof) */}
            {!isClientRole && isPendingVerification && (
              <button
                type="button"
                onClick={() => {
                  setVerifyingInvoice(inv);
                  setAdminVerifyNotes("");
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer animate-pulse"
                title="Verify Client's Submitted UTR and Confirm Payment"
              >
                <ShieldCheck size={13} />
                <span>Verify UTR</span>
              </button>
            )}

            {/* Admin View: Payment Reminder */}
            {!isClientRole && isUnpaid && !isPendingVerification && (
              <button
                type="button"
                onClick={() => handleSendReminder(inv)}
                className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100 text-[11px] font-semibold flex items-center gap-1 border border-amber-200/80 dark:border-amber-800 cursor-pointer"
                title={
                  inv.lastReminderSent
                    ? `Last sent: ${inv.lastReminderSent}`
                    : "Send Payment Reminder to client"
                }
              >
                <BellRing size={12} className="text-amber-600" />
                <span>Send Reminder</span>
              </button>
            )}

            {/* Admin View: Digital Marketing Retainer Expiry Alert */}
            {!isClientRole &&
              (inv.category === "Digital Marketing" ||
                (inv as any).isDigitalMarketing ||
                (inv as any).isMarketingRetainer ||
                String(inv.project || "")
                  .toLowerCase()
                  .includes("marketing")) && (
                <button
                  type="button"
                  onClick={() => handleSendRetainerExpiry(inv)}
                  className="px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-semibold flex items-center gap-1 border border-purple-200/80 dark:border-purple-800 cursor-pointer"
                  title={
                    (inv as any).lastRetainerExpiryReminderSent
                      ? `Last expiry alert: ${(inv as any).lastRetainerExpiryReminderSent}`
                      : "Send Retainer Expiry & Campaign Renewal alert to client"
                  }
                >
                  <Clock size={12} className="text-purple-600" />
                  <span>Retainer Expiry Alert</span>
                </button>
              )}

            {/* Admin View: Mark Payment Completed */}
            {!isClientRole && isUnpaid && !isPendingVerification && (
              <button
                type="button"
                onClick={() => setPaymentModalInvoice(inv)}
                className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[11px] font-semibold flex items-center gap-1 border border-emerald-200/80 dark:border-emerald-800 cursor-pointer"
                title="Mark Payment Completed & sync to Payments"
              >
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Mark Paid</span>
              </button>
            )}

            {canEditInvoice && (
              <button
                type="button"
                onClick={() => handleOpenEditInvoice(inv)}
                className="p-1 text-zinc-500 hover:text-amber-600 transition-colors cursor-pointer"
                title="Edit Invoice (Services, Rates, Client)"
              >
                <Pencil size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setSelectedInvoice(inv);
                setIsInvoiceModalOpen(true);
              }}
              className="p-1 text-zinc-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="View Invoice"
            >
              <Eye size={14} />
            </button>

            {canDeleteInvoice && (
              <button
                type="button"
                onClick={() => handleDeleteInvoice(inv.id)}
                className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                title="Delete Invoice"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        );
      },
    },
  ];


  return columns
}
