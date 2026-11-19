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

export function ApprovalsSection2({ ctrl }: { ctrl: any }) {
  const { filteredRequests, statusFilter, getTypeIcon, setInspectItem, canApprove, handleApprove, setRejectItem, setRejectionReason, handleDelete } = ctrl;
  return (
    <>
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-bold text-foreground">No submissions found</p>
            <p className="text-xs text-muted-foreground">
              {statusFilter === "pending" ? "Great job! All team submissions have been reviewed." : "No records match the current filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Document / Type</th>
                  <th className="py-3 px-4">Submitted By</th>
                  <th className="py-3 px-4">Client / Entity</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4">Submitted On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRequests.map((req) => {
                  const isPending = req.status === "pending"
                  const isApproved = req.status === "approved"
                  const isRejected = req.status === "rejected"

                  return (
                    <tr key={req.id} className="hover:bg-muted/20 transition-colors group">
                      {/* Document info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-surface-hover border border-border shrink-0">
                            {getTypeIcon(req.type)}
                          </div>
                          <div>
                            <p className="font-bold text-foreground flex items-center gap-1.5">
                              <span>{req.documentNumber}</span>
                              <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                                {req.type}
                              </span>
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[220px]">
                              {req.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Submitter */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-foreground flex items-center gap-1">
                            <User size={12} className="text-primary" />
                            <span>{req.submittedBy?.name || "Team Member"}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">{req.submittedBy?.email}</p>
                        </div>
                      </td>

                      {/* Client & Entity Hierarchy */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-foreground">{req.clientName}</p>
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {req.subBranchName ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                <GitBranch size={9} />
                                <span>Sub-Branch: {req.subBranchName}</span>
                              </span>
                            ) : req.branchName ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                <Building2 size={9} />
                                <span>Branch: {req.branchName}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                                <Building2 size={9} />
                                <span>Company HQ Direct</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right font-black text-foreground">
                        {req.formattedAmount || `₹${(req.amount || 0).toLocaleString("en-IN")}`}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(req.submittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                            Pending Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <Check size={11} strokeWidth={3} />
                            Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <X size={11} strokeWidth={3} />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setInspectItem(req)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer"
                            title="Inspect Details"
                          >
                            <Eye size={15} />
                          </button>

                          {isPending && canApprove && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(req)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title="Approve this item"
                              >
                                <Check size={13} strokeWidth={2.5} />
                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRejectItem(req)
                                  setRejectionReason("")
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600/15 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-rose-600/30"
                                title="Reject this item"
                              >
                                <X size={13} strokeWidth={2.5} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDelete(req)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
