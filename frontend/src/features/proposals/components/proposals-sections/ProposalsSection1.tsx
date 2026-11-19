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

export function ProposalsSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, isClientRole, selectedStatus, filteredProposals, canAddProposal, setIsCreateModalOpen, searchQuery, setSearchQuery, setSelectedStatus, setSelectedProposal, handleClientAccept, handleConvertToProject, canDeleteProposal, handleDelete } = ctrl;
  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[99999] bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-zinc-700"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- TOP HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <File className="text-blue-600 dark:text-blue-400" size={24} />
            <span>{isClientRole ? "My Project Proposals" : "Business Proposals"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isClientRole 
              ? "Review custom project proposals, scope roadmaps, and formal pricing terms."
              : "Draft comprehensive proposals, outline deliverable roadmaps, and track client approvals"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              exportToExcel({
                filename: "SAAMPARK_Proposals",
                title: "Business Proposals Report",
                subtitle: selectedStatus === "all" ? "All Proposals" : selectedStatus,
                headers: ["#", "Proposal #", "Title", "Client", "Amount (₹)", "Proposal Date", "Valid Until", "Status"],
                rows: filteredProposals.map((p, idx) => [
                  idx + 1,
                  p.proposalNumber,
                  p.title,
                  p.client,
                  `₹${p.amountNum.toLocaleString("en-IN")}`,
                  p.proposalDate,
                  p.validUntil,
                  p.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              printPDFReport({
                title: "Business Proposals Report",
                subtitle: selectedStatus === "all" ? "All Proposals" : selectedStatus,
                headers: ["#", "Proposal #", "Title", "Client", "Amount", "Date", "Valid Until", "Status"],
                rows: filteredProposals.map((p, idx) => [
                  idx + 1,
                  p.proposalNumber,
                  p.title,
                  p.client,
                  `₹${p.amountNum.toLocaleString("en-IN")}`,
                  p.proposalDate,
                  p.validUntil,
                  p.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer"
          >
            <Printer size={13} className="text-zinc-500" />
            <span>Print</span>
          </button>

          {canAddProposal && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>Create Proposal</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- FILTER & SEARCH BAR ---------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search proposals, client, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["all", "Sent", "Accepted", "Draft", "Declined"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedStatus === st 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- PROPOSALS TABLE ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Proposal Number</th>
              <th className="py-3 px-4">Scope / Title</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Proposal Date</th>
              <th className="py-3 px-4">Valid Until</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            {filteredProposals.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400">
                  No proposals found. Click "+ Create Proposal" to draft a new quote.
                </td>
              </tr>
            ) : (
              filteredProposals.map((p) => {
                let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200"
                if (p.status === "Accepted") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                if (p.status === "Sent") statusBadge = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                if (p.status === "Declined") statusBadge = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"

                return (
                  <tr key={p.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono">
                      <button
                        type="button"
                        onClick={() => setSelectedProposal(p)}
                        className="hover:underline text-left cursor-pointer"
                      >
                        {p.proposalNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100 max-w-[200px] truncate">
                      {p.title}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.client}</div>
                      <div className="text-[10px] text-zinc-400">{p.clientEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{formatDisplayDate(p.proposalDate)}</td>
                    <td className="py-3 px-4 text-red-600 dark:text-red-400 font-bold font-mono text-[11px]">{p.validUntil ? formatDisplayDate(p.validUntil) : "-"}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{p.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {isClientRole && p.status === "Sent" && (
                          <button
                            type="button"
                            onClick={() => handleClientAccept(p)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                            title="Accept Proposal"
                          >
                            <Check size={12} />
                            <span>Accept</span>
                          </button>
                        )}

                        {!isClientRole && p.status === "Accepted" && (
                          <button
                            type="button"
                            onClick={() => handleConvertToProject(p)}
                            className="px-2 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-semibold flex items-center gap-1"
                            title="Convert to Project & Invoice"
                          >
                            <ArrowRight size={12} />
                            <span>Convert</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedProposal(p)}
                          className="p-1 hover:text-blue-600 transition-colors"
                          title="View Proposal"
                        >
                          <Eye size={14} />
                        </button>

                        {canDeleteProposal && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id)}
                            className="p-1 hover:text-rose-600 transition-colors"
                            title="Delete Proposal"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
