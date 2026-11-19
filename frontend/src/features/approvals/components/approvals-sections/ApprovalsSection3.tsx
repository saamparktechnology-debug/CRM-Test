"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, Check, X, Eye, Clock, AlertTriangle, Search, Filter, 
  FileText, ShoppingCart, CreditCard, User, Building2, Calendar, 
  ArrowRight, ShieldAlert, Sparkles, RefreshCw, Trash2, CheckCircle2,
  XCircle, ChevronRight, Info, GitBranch
} from "lucide-react"
import { useAuthStore, getUserEntityScope, isMatchingCompany } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ApprovalRequest, ApprovalType, ApprovalStatus } from "@/features/approvals/types"
import { useApprovalsQuery, useApproveRequestMutation, useRejectRequestMutation, useDeleteApprovalMutation } from "@/features/approvals/hooks/useApprovals"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

export function ApprovalsSection3({ ctrl }: { ctrl: any }) {
  const { inspectItem, getTypeIcon, setInspectItem, handleApprove, rejectItem, rejectionReason, setRejectionReason, setRejectItem, handleRejectSubmit } = ctrl;
  return (
    <>
      {/* INSPECTION MODAL */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-3xl bg-surface border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {getTypeIcon(inspectItem.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{inspectItem.title}</h3>
                    <p className="text-[11px] text-muted-foreground">{inspectItem.documentNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/30 border border-border/60">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Submitter</p>
                    <p className="font-bold text-foreground mt-0.5">{inspectItem.submittedBy?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{inspectItem.submittedBy?.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Client / Target</p>
                    <p className="font-bold text-foreground mt-0.5">{inspectItem.clientName}</p>
                    <p className="text-[11px] text-muted-foreground">{inspectItem.clientEmail || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Monetary Value</p>
                    <p className="font-black text-foreground text-sm mt-0.5">{inspectItem.formattedAmount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Approval Status</p>
                    <p className="font-black mt-0.5 uppercase tracking-wider text-[11px] text-amber-500">
                      {inspectItem.status}
                    </p>
                  </div>
                </div>

                {inspectItem.rejectionReason && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                    <p className="font-bold text-xs flex items-center gap-1.5">
                      <XCircle size={14} /> Rejection Note:
                    </p>
                    <p className="text-[11px] mt-1">{inspectItem.rejectionReason}</p>
                  </div>
                )}

                {inspectItem.dataSnapshot && (
                  <div className="space-y-2">
                    <p className="font-bold text-foreground text-xs">Payload Snapshot Breakdown</p>
                    <div className="p-3 rounded-2xl bg-muted/40 border border-border max-h-48 overflow-y-auto font-mono text-[11px] text-muted-foreground">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(inspectItem.dataSnapshot, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border flex items-center justify-end gap-2 bg-muted/10">
                <button
                  type="button"
                  onClick={() => setInspectItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-hover text-foreground cursor-pointer"
                >
                  Close
                </button>
                {inspectItem.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = inspectItem
                      setInspectItem(null)
                      handleApprove(item)
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <Check size={14} /> Approve Now
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECTION MODAL */}
      <AnimatePresence>
        {rejectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-surface border border-border shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-foreground">Reject Submission</h3>
                  <p className="text-xs text-muted-foreground">{rejectItem.documentNumber} ({rejectItem.title})</p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Provide feedback for <strong>{rejectItem.submittedBy.name}</strong> explaining why this {rejectItem.type} cannot be approved.
              </p>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-1">
                  Rejection Reason / Notes
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incorrect tax rate applied, or client details need verification..."
                  className="w-full p-3 text-xs rounded-xl bg-surface-hover border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-surface-hover text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <X size={14} /> Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
