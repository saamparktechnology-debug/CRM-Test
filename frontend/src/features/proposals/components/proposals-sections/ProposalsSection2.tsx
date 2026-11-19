"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, File, Search, CheckCircle2, XCircle, 
  Clock, Eye, Trash2, Check, ArrowRight, Printer, X, Send 
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ProposalItem } from "@/features/proposals/types"
import { useDeleteProposalMutation, useProposalsQuery, useSaveProposalsMutation } from "@/features/proposals/hooks/useProposals"
import { getClients } from "@/features/clients/services/clientService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { formatDisplayDate } from "@/lib/utils"

export function ProposalsSection2({ ctrl }: { ctrl: any }) {
  const { selectedProposal, setSelectedProposal, isClientRole, handleClientDecline, handleClientAccept, handleConvertToProject, isCreateModalOpen, setIsCreateModalOpen, handleCreateProposal, title, setTitle, client, setClient, availableClients, setClientEmail, amount, setAmount, deliverablesInput, setDeliverablesInput, description, setDescription } = ctrl;
  return (
    <>
      {/* ---------------- PROPOSAL PREVIEW MODAL ---------------- */}
      <AnimatePresence>
        {selectedProposal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center gap-2">
                  <File className="text-blue-600" size={20} />
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{selectedProposal.proposalNumber} — Proposal</h3>
                    <p className="text-[11px] text-zinc-400">{selectedProposal.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProposal(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Client</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedProposal.client}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Date</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatDisplayDate(selectedProposal.proposalDate)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Valid Until</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedProposal.validUntil ? formatDisplayDate(selectedProposal.validUntil) : "-"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Amount</span>
                    <span className="font-bold text-blue-600 text-sm">{selectedProposal.amount}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] mb-1">Scope & Roadmap</h4>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg">
                    {selectedProposal.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] mb-2">Key Deliverables</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProposal.deliverables?.map((d, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50"
                >
                  <Printer size={13} />
                  <span>Print Document</span>
                </button>

                <div className="flex items-center gap-2">
                  {isClientRole && selectedProposal.status === "Sent" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleClientDecline(selectedProposal)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => handleClientAccept(selectedProposal)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Check size={13} />
                        <span>Accept Proposal</span>
                      </button>
                    </>
                  )}

                  {!isClientRole && selectedProposal.status === "Accepted" && (
                    <button
                      type="button"
                      onClick={() => handleConvertToProject(selectedProposal)}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <ArrowRight size={13} />
                      <span>Convert to Project & Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- CREATE PROPOSAL MODAL ---------------- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <File size={18} className="text-blue-600" />
                  <span>Draft Business Proposal</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateProposal} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Proposal Title / Project Scope *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise Cloud ERP Migration & Custom Portal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Target Client *</label>
                    <select
                      value={client}
                      onChange={(e) => {
                        setClient(e.target.value)
                        const c = availableClients.find(item => item.name === e.target.value)
                        if (c) setClientEmail(c.email)
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                    >
                      {availableClients.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Total Pricing (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 150000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Deliverables (comma separated)</label>
                  <input
                    type="text"
                    value={deliverablesInput}
                    onChange={(e) => setDeliverablesInput(e.target.value)}
                    placeholder="e.g. System Design, Mobile App, Cloud Setup, 1-Year Support"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Proposal Overview & Terms</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide background, execution strategy, and milestone timelines..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1"
                  >
                    <Send size={13} />
                    <span>Send Proposal to Client</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
