"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HeadphonesIcon, Plus, Search, CheckCircle2, AlertCircle, 
  Clock, ShieldAlert, Check, X, ArrowRight, Eye, Trash2,
  FileText, MessageSquare, Send, User, ExternalLink, Paperclip,
  Image as ImageIcon, Loader2, Download
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { DisputeTicket, TicketAttachment, TicketPriority, TicketStatus } from "@/features/tickets/types"
import { useDeleteTicketMutation, useSaveTicketsMutation, useTicketsQuery } from "@/features/tickets/hooks/useTickets"
import { uploadToImgBB } from "@/lib/imgbbUpload"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export function TicketsSection1({ ctrl }: { ctrl: any }) {
  const { toastMessage, isSuperAdmin, setIsRaiseModalOpen, newCount, progressCount, resolvedCount, searchQuery, setSearchQuery, setSelectedStatusTab, selectedStatusTab, filteredTickets, setSelectedTicket, setNewStatus, setResolutionInput, handleDelete } = ctrl;
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
            <HeadphonesIcon className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Support & Dispute Tickets</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isSuperAdmin 
              ? "Analyze raised disputes, investigate technical & billing inquiries, and dispatch official resolution confirmations"
              : "Raise inquiries or dispute deliverables — only the Super Admin reviews and resolves your ticket"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRaiseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Raise Dispute / Ticket</span>
          </button>
        </div>
      </div>

      {/* ---------------- KPI CARDS ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">New Inquiries</p>
            <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{newCount}</h3>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
            <AlertCircle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Under Investigation</p>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{progressCount}</h3>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-lg">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 font-medium">Resolved & Confirmed</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{resolvedCount}</h3>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* ---------------- FILTER & SEARCH BAR ---------------- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tickets, subject, creator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {["all", "New", "In Progress", "Under Review", "Resolved", "Closed"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatusTab(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                selectedStatusTab === st 
                  ? "bg-blue-600 text-white shadow-xs" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- TICKETS TABLE ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
            <tr>
              <th className="py-3 px-4">Ticket ID</th>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Raised By</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-400">
                  No tickets found. Click "+ Raise Dispute / Ticket" to report an issue.
                </td>
              </tr>
            ) : (
              filteredTickets.map((t) => {
                let priorityBadge = "bg-zinc-100 text-zinc-700"
                if (t.priority === "Critical") priorityBadge = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold"
                if (t.priority === "High") priorityBadge = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold"
                if (t.priority === "Normal") priorityBadge = "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"

                let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200"
                if (t.status === "New") statusBadge = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                if (t.status === "In Progress" || t.status === "Under Review") statusBadge = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                if (t.status === "Resolved" || t.status === "Closed") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"

                return (
                  <tr key={t.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTicket(t)
                          setNewStatus(t.status)
                          setResolutionInput(t.resolutionNote || "")
                        }}
                        className="hover:underline text-left cursor-pointer"
                      >
                        {t.ticketNumber}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100 max-w-[220px] truncate">
                      {t.subject}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                      {t.category}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{t.createdBy}</div>
                      <div className="text-[10px] text-zinc-400">{t.creatorRole}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${priorityBadge}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{t.createdAt}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(t)
                            setNewStatus(t.status)
                            setResolutionInput(t.resolutionNote || "")
                          }}
                          className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>{isSuperAdmin ? "Analyze & Resolve" : "View Status"}</span>
                        </button>

                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(t.id)}
                            className="p-1 hover:text-rose-600 text-zinc-400 transition-colors"
                            title="Delete Ticket"
                          >
                            <Trash2 size={13} />
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
