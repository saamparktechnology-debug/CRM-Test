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

export function QuotationsSection3({ ctrl }: { ctrl: any }) {
  const { viewingItem, setViewingItem, handleAcceptQuotation, setDecliningItem, setDeclineReason, setModifyingItem, setModifyNotes, handleCreateEstimateFromQuote, setSendingItem, setSendEmail, setSendMessage, user, handleConvertToInvoice, isClientUser, modifyingItem, modifyNotes, handleRequestModifyQuotation, decliningItem, declineReason, handleDeclineQuotation, isModalOpen, isStudioOpen, editingItem, setIsModalOpen, setIsStudioOpen, setEditingItem, loadData } = ctrl;
  return (
    <>
      {/* ── OFFICIAL PDF DOCUMENT VIEWER MODAL ───────────────────────── */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-6 py-6 sm:py-10 overflow-y-auto print:p-0 print:m-0 print:bg-white print:static print:overflow-visible print:block print:w-full">
            <OfficialQuotationDocument 
              quotation={viewingItem}
              onClose={() => setViewingItem(null)}
              onAccept={() => handleAcceptQuotation(viewingItem)}
              onDecline={() => {
                const target = viewingItem
                setViewingItem(null)
                setDecliningItem(target)
                setDeclineReason("")
              }}
              onRequestModify={() => {
                const target = viewingItem
                setViewingItem(null)
                setModifyingItem(target)
                setModifyNotes("")
              }}
              onSendEstimate={() => handleCreateEstimateFromQuote(viewingItem)}
              onSendEmail={() => {
                const target = viewingItem
                setViewingItem(null)
                setSendingItem(target)
                setSendEmail(target.customerEmail || "")
                setSendMessage(`Dear ${target.customer},\n\nPlease find attached our commercial quotation ${target.number} totaling ₹${(target.total || 0).toLocaleString("en-IN")}.\n\nBest regards,\n${user?.name || "SAAMPARK Group"}`)
              }}
              onConvertToInvoice={() => handleConvertToInvoice(viewingItem)}
              isClientRole={isClientUser}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── CLIENT QUOTATION MODIFICATION REQUEST MODAL ──────────────────── */}
      <AnimatePresence>
        {modifyingItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 flex items-center justify-center font-bold">
                    ✎
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Request Quotation Modification</h3>
                    <p className="text-[11px] text-zinc-400">Quote #{modifyingItem.number} for {modifyingItem.customer}</p>
                  </div>
                </div>
                <button onClick={() => setModifyingItem(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                  Describe what you would like modified or adjusted:
                </label>
                <textarea 
                  rows={4}
                  value={modifyNotes}
                  onChange={(e) => setModifyNotes(e.target.value)}
                  placeholder="e.g. Please adjust the timeline to 45 days, add an extra revision round for posters, and provide revised pricing..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-medium text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModifyingItem(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!modifyNotes.trim()}
                  onClick={() => handleRequestModifyQuotation(modifyingItem, modifyNotes.trim())}
                  className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Submit Modification Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CLIENT DECLINE QUOTATION CONFIRMATION MODAL ─────────────────── */}
      <AnimatePresence>
        {decliningItem && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 flex items-center justify-center font-bold">
                    ✕
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Decline Quotation</h3>
                    <p className="text-[11px] text-zinc-400">Quote #{decliningItem.number} (₹{(decliningItem.total || 0).toLocaleString("en-IN")})</p>
                  </div>
                </div>
                <button onClick={() => setDecliningItem(null)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 block mb-1.5">
                  Reason for declining (Optional):
                </label>
                <input 
                  type="text"
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="e.g. Budget constraints, opted for another option, deferred..."
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-zinc-800 dark:text-zinc-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDecliningItem(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeclineQuotation(decliningItem, declineReason.trim())}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── INTERACTIVE SPLIT-SCREEN DOCUMENT STUDIO (QUOTATION) ────────── */}
      <DocumentStudioModal
        isOpen={isModalOpen || isStudioOpen}
        mode="quotation"
        initialData={editingItem}
        isMarketingMode={Boolean(editingItem?.category === "Digital Marketing" || (editingItem as any)?.marketingPackage?.enabled)}
        onClose={() => {
          setIsModalOpen(false)
          setIsStudioOpen(false)
          setEditingItem(null)
        }}
        onSaveSuccess={() => {
          setIsModalOpen(false)
          setIsStudioOpen(false)
          setEditingItem(null)
          loadData()
        }}
      />
    </>
  );
}
