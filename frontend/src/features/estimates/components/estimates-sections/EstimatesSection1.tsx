"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, ArrowRight,
  Calculator, Clock, CheckCircle2
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { EstimateService } from "@/services/salesService"
import { getClients } from "@/features/clients/services/clientService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { sendEstimateDetailsEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayDate } from "@/lib/utils"
import { type LineItem, type Estimate } from "@/features/estimates/components/estimates-sections/EstimatesHelpers"

export function EstimatesSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { canAdd, setEditingItem, setIsStudioOpen, filtered, searchQuery, setSearchQuery, statusFilter, setStatusFilter, openSendModal, setViewingItem, canEdit, openEditModal, canDelete, setDeleteConfirm } = ctrl;
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <FileText className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Estimate Management</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Create, email, print, and track commercial cost estimates for registered clients and custom recipients</p>
        </div>
        {canAdd && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditingItem(null); setIsStudioOpen(true) }} 
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>+ Create Estimate</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Estimates</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{filtered.length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
              <span>●</span> Projected cost proposals
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
            <FileText size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Total Value</p>
            <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">₹{filtered.reduce((acc, e) => acc + (e.total || 0), 0).toLocaleString("en-IN")}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
              <span>₹</span> Total estimate pipeline
            </span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl">
            <Calculator size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Sent &amp; Pending</p>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{filtered.filter(e => e.status === "Sent").length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
              <span>⏱</span> Awaiting review
            </span>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="kpi-card-premium flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-semibold">Approved</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{filtered.filter(e => e.status === "Approved").length}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              <span>✓</span> Confirmed by customer
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      <div className="box-3d flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search by number, customer, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs liquid-glass-input rounded-xl focus:outline-hidden" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-xs liquid-glass-input rounded-xl focus:outline-hidden cursor-pointer font-semibold">
          <option value="all">All Statuses</option>{(masterBundle?.options?.["estimate_status"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
        </select>
      </div>

      <div className="table-3d-wrapper rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Number</th>
                <th className="py-3 px-4">Customer & Recipient</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-zinc-400">No estimates found. Click "Create Estimate" to generate one.</td></tr>
              ) : (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 font-bold">{item.number}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.customer}</div>
                      {item.customerEmail && <div className="text-[10px] text-zinc-400 font-mono">{item.customerEmail}</div>}
                    </td>
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{item.date}</td>
                    <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">₹{(item.total || 0).toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.status === "Approved" || item.status === "Accepted" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : item.status === "Sent" ? "bg-blue-50 text-blue-700 border-blue-200" : item.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-zinc-100 text-zinc-600 border-zinc-200"}`}>
                          {item.status}
                        </span>
                        {(item.status === "Approved" || item.status === "Accepted" || (item as any).clientAccepted) && (
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                            ✓ Accepted by Client
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Send Action */}
                        <button
                          type="button"
                          onClick={() => openSendModal(item)}
                          className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Send Estimate via Email"
                        >
                          <Send size={12} />
                          <span>Send</span>
                        </button>

                        {/* View & Print Action */}
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="View & Print Official Estimate"
                        >
                          <Printer size={14} />
                        </button>

                        {canEdit && <button onClick={() => openEditModal(item)} className="p-1 hover:text-blue-600"><Edit size={14} /></button>}
                        {canDelete && <button onClick={() => setDeleteConfirm(item)} className="p-1 hover:text-rose-600"><Trash2 size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
    </>
  );
}
