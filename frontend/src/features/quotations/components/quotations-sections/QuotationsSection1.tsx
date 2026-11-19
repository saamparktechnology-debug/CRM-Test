"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, ArrowRight, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, CheckCircle2,
  Download, Calculator, Clock, Check, AlertCircle, Eye, RefreshCw
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { QuotationService } from "@/services/salesService"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { OfficialQuotationDocument, QuotationData, QuotationLineItem } from "@/features/quotations/components/OfficialQuotationDocument"
import { sendQuotationDetailsEmailNotification } from "@/services/emailNotificationService"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { formatDisplayDate } from "@/lib/utils"

export function QuotationsSection1({ ctrl }: { ctrl: any }) {
  const { statusFilter, filtered, canAdd, setEditingItem, setIsStudioOpen, setDisciplineFilter, disciplineFilter, quotations, totalPipeline } = ctrl;
  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
              <FileText size={22} />
            </div>
            <span>Commercial Quotations &amp; Price Tenders</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Generate formal corporate price quotes, configure line-item SAC/tax breakdowns, and print PDF quotations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportToExcel({
                filename: "SAAMPARK_Quotations",
                title: "Commercial Quotations Report",
                subtitle: statusFilter === "all" ? "All Quotations" : statusFilter,
                headers: ["#", "Quote #", "Customer Name", "Total Amount (₹)", "Date", "Valid Till", "Status"],
                rows: filtered.map((q, idx) => [
                  idx + 1,
                  q.number,
                  q.customer,
                  `₹${(q.total || 0).toLocaleString("en-IN")}`,
                  q.date,
                  q.validTill || "-",
                  q.status,
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
                title: "Commercial Quotations Report",
                subtitle: statusFilter === "all" ? "All Quotations" : statusFilter,
                headers: ["#", "Quote #", "Customer", "Total Amount", "Date", "Valid Till", "Status"],
                rows: filtered.map((q, idx) => [
                  idx + 1,
                  q.number,
                  q.customer,
                  `₹${(q.total || 0).toLocaleString("en-IN")}`,
                  q.date,
                  q.validTill || "-",
                  q.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={13} className="text-zinc-500" />
            <span>Print</span>
          </button>

          {canAdd && (
            <button 
              onClick={() => { setEditingItem(null); setIsStudioOpen(true) }} 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Create Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* ── DISCIPLINE SEPARATION SWITCHER (Software vs Digital Marketing Retainer) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2.5 sm:px-4 shadow-2xs">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setDisciplineFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              disciplineFilter === "all"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
            }`}
          >
            All Commercial Quotations ({quotations.length})
          </button>

          <button
            type="button"
            onClick={() => setDisciplineFilter("software")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              disciplineFilter === "software"
                ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-blue-600"
            }`}
          >
            <Building2 size={13} />
            <span>IT & Software Projects</span>
          </button>

          <button
            type="button"
            onClick={() => setDisciplineFilter("marketing")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              disciplineFilter === "marketing"
                ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-2xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-purple-600"
            }`}
          >
            <Sparkles size={13} className="text-purple-500" />
            <span>Digital Marketing Retainers</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <span>Independent Commercial Pipelines</span>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Quotations</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{filtered.length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>●</span> Active commercial proposals
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl">
            <FileText size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Pipeline Value</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">₹{totalPipeline.toLocaleString("en-IN")}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>₹</span> Cumulative tender value
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Calculator size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Sent &amp; Pending</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{filtered.filter(q => q.status === "Sent").length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
              <span>⏱</span> Under client evaluation
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Accepted</p>
            <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{filtered.filter(q => q.status === "Accepted").length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-1">
              <span>✓</span> Approved for execution
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>
    </>
  );
}
