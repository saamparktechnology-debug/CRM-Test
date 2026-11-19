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

export function QuotationsSection2({ ctrl }: { ctrl: any }) {
  const { searchQuery, setSearchQuery, setStatusFilter, statusFilter, filtered, setViewingItem, handleCreateEstimateFromQuote, isClientUser, handleAcceptQuotation, setModifyingItem, setModifyNotes, setDecliningItem, setDeclineReason, handleConvertToClient, setSendingItem, setSendEmail, setSendMessage, user, canEdit, openEditModal, canDelete, setDeleteConfirm } = ctrl;
  return (
    <>
      {/* FILTER & SEARCH */}
      <div className="box-3d flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by quote #, client, email..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-9 pr-3 py-2 text-xs liquid-glass-input rounded-xl focus:outline-hidden" 
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["all", "Draft", "Sent", "Accepted", "Declined"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors ${
                statusFilter === st 
                  ? "bg-emerald-600 text-white shadow-xs" 
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="table-3d-wrapper rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Quote #</th>
                <th className="py-3 px-4">Client / Organization</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Valid Till</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-400">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold">No quotations found. Click "+ Create Quotation" to create one.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((q) => (
                  <tr key={q.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      <button 
                        type="button" 
                        onClick={() => setViewingItem(q)}
                        className="hover:underline text-left cursor-pointer"
                      >
                        {q.number}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{q.customer}</div>
                      {q.customerEmail && <div className="text-[10px] text-zinc-400 font-mono">{q.customerEmail}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{formatDisplayDate(q.date)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-rose-600 font-semibold">{q.validTill ? formatDisplayDate(q.validTill) : "-"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium">
                        {q.items?.length || 1} items
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-zinc-900 dark:text-zinc-100">
                      ₹{(q.total || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          q.status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800" :
                          q.status === "Sent" || q.status === "Pending Client Approval" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" :
                          q.status === "Declined" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                        }`}>
                          {q.status === "Pending Client Approval" ? "Pending Approval by Client" : q.status}
                        </span>
                        {(q.status === "Accepted" || (q as any).clientAccepted) ? (
                          <div className="mt-1 flex flex-col gap-1">
                            <span className="text-[9.5px] text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center gap-0.5">
                              ✓ Accepted
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCreateEstimateFromQuote(q)}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-bold hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                              title="Next step: Send Cost Estimate"
                            >
                              <span>Next: Send Estimate →</span>
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setViewingItem(q)}
                          className="p-1 hover:text-emerald-600 transition-colors cursor-pointer" 
                          title="View PDF Document"
                        >
                          <Eye size={14} />
                        </button>

                        {/* CLIENT SPECIFIC ACTIONS: Accept, Modify, Reject */}
                        {isClientUser ? (
                          <>
                            {q.status !== "Accepted" && q.status !== "Declined" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAcceptQuotation(q)}
                                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-colors flex items-center gap-0.5 cursor-pointer"
                                  title="Accept this quotation"
                                >
                                  <Check size={12} strokeWidth={2.5} />
                                  <span>Accept</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setModifyingItem(q)
                                    setModifyNotes("")
                                  }}
                                  className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold shadow-xs transition-colors flex items-center gap-0.5 cursor-pointer"
                                  title="Request modifications or adjustments"
                                >
                                  <Edit size={12} />
                                  <span>Modify</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDecliningItem(q)
                                    setDeclineReason("")
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-300 text-[10px] font-bold transition-colors cursor-pointer"
                                  title="Decline this quotation"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            )}
                            {q.status === "Accepted" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ Accepted
                              </span>
                            )}
                            {q.status === "Declined" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                ✕ Declined
                              </span>
                            )}
                            {q.status === "Modification Requested" && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                ✎ Modifying
                              </span>
                            )}
                          </>
                        ) : (
                          /* TEAM & ADMIN ACTIONS: Convert to Client, Create Estimate, Email, Edit, Delete */
                          <>
                            <button 
                              onClick={() => handleConvertToClient(q)}
                              className="p-1 hover:text-emerald-600 transition-colors cursor-pointer" 
                              title="Convert / Move to CRM Client"
                            >
                              <UserCheck size={14} className="text-emerald-600" />
                            </button>
                            <button 
                              onClick={() => handleCreateEstimateFromQuote(q)}
                              className="p-1 hover:text-blue-600 transition-colors cursor-pointer" 
                              title="Generate Estimate from Quotation"
                            >
                              <Sparkles size={14} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => {
                                setSendingItem(q)
                                setSendEmail(q.customerEmail || "")
                                setSendMessage(`Dear ${q.customer},\n\nPlease find attached our commercial quotation ${q.number} totaling ₹${(q.total || 0).toLocaleString("en-IN")}.\n\nBest regards,\n${user?.name || "SAAMPARK Group"}`)
                              }}
                              className="p-1 hover:text-blue-600 transition-colors cursor-pointer" 
                              title="Email Quotation"
                            >
                              <Send size={14} />
                            </button>
                            {canEdit && (
                              <button 
                                onClick={() => openEditModal(q)} 
                                className="p-1 hover:text-amber-600 transition-colors cursor-pointer" 
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                            )}
                            {canDelete && (
                              <button 
                                onClick={() => setDeleteConfirm(q)} 
                                className="p-1 hover:text-rose-600 transition-colors cursor-pointer" 
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
