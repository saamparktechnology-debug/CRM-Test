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

export function QuotationsSection4({ ctrl }: { ctrl: any }) {
  const { isEstimateStudioOpen, estimateInitialData, setIsEstimateStudioOpen, setEstimateInitialData, sendingItem, setSendingItem, sendEmail, setSendEmail, isSending, handleSendQuotation, deleteConfirm, setDeleteConfirm, handleDelete } = ctrl;
  return (
    <>
      {/* ── INTERACTIVE SPLIT-SCREEN DOCUMENT STUDIO (ESTIMATE FROM QUOTE) ── */}
      <DocumentStudioModal
        isOpen={isEstimateStudioOpen}
        mode="estimate"
        initialData={estimateInitialData}
        onClose={() => {
          setIsEstimateStudioOpen(false)
          setEstimateInitialData(null)
        }}
        onSaveSuccess={() => {
          setIsEstimateStudioOpen(false)
          setEstimateInitialData(null)
        }}
      />

      {/* SEND QUOTATION EMAIL MODAL */}
      <AnimatePresence>
        {sendingItem && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Send size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Send Commercial Quotation</h3>
                    <p className="text-[11px] text-zinc-400">Recipient will receive official PDF and direct action buttons (Accept, Modify, Decline)</p>
                  </div>
                </div>
                <button onClick={() => setSendingItem(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Recipient Email Address *</label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Quotation No:</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{sendingItem.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Client:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{sendingItem.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Total Tender Value:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{(sendingItem.total || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSendingItem(null)}
                  className="px-3 py-2 text-zinc-500 hover:text-zinc-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSending || !sendEmail.trim()}
                  onClick={handleSendQuotation}
                  className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>{isSending ? "Sending..." : "Dispatch Email"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Delete Quotation</h3>
              <p className="text-zinc-500">Are you sure you want to delete quotation <strong>{deleteConfirm.number}</strong>? This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-zinc-500 font-semibold">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-1.5 font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
