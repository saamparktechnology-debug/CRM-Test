"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, Users, Mail, ArrowRight, ArrowLeft, Send, Sparkles, 
  Building2, Calendar, FileText, CheckSquare, Search, AlertCircle, Shield
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { createAndSendLetter } from "@/features/letters/services/letterService"
import { LetterRecord, LetterType, LetterRecipient, LetterCustomFields } from "@/features/letters/types"
import { type LetterComposerModalProps, TEMPLATES } from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalHelpers"

export function LetterComposerModalSection2({ ctrl }: { ctrl: any }) {
  const { step, setRecipientFilter, recipientFilter, availableRecipients, searchMember, setSearchMember, toggleSelectAllFiltered, filteredRecipients, selectedCount, teamCount, clientCount, isLoadingRecipients, selectedRecipientIds, toggleSelectRecipient, logoUrl, companyName, activeCompany, activeCompanyId, title, subject, body, signatoryName, signatoryDesignation } = ctrl;
  return (
    <>
      {/* ──────── STEP 2: SELECT RECIPIENTS ──────── */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRecipientFilter("all")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${recipientFilter === "all" ? "bg-blue-600 text-white shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                  >
                    All ({availableRecipients.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientFilter("team")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${recipientFilter === "team" ? "bg-blue-600 text-white shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                  >
                    Team Members ({availableRecipients.filter(r => r.type === "team").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientFilter("client")}
                    className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${recipientFilter === "client" ? "bg-blue-600 text-white shadow-xs" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
                  >
                    Clients ({availableRecipients.filter(r => r.type === "client").length})
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search name, email, branch..."
                    value={searchMember}
                    onChange={e => setSearchMember(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs"
                  />
                </div>
              </div>

              {/* Status and Select All Header */}
              <div className="flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSelectAllFiltered}
                    className="flex items-center gap-1.5 font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    <CheckSquare size={14} />
                    <span>Select All in Filter ({filteredRecipients.length})</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 font-bold text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    Selected: {selectedCount} recipients
                  </span>
                  {selectedCount > 0 && (
                    <span className="text-[11px] text-zinc-500">
                      ({teamCount} Team, {clientCount} Clients)
                    </span>
                  )}
                </div>
              </div>

              {/* Recipients List Table */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
                {isLoadingRecipients ? (
                  <div className="py-12 text-center text-zinc-400">Loading members and clients...</div>
                ) : filteredRecipients.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400">No members or clients found matching your search.</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold sticky top-0 z-10">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={filteredRecipients.length > 0 && filteredRecipients.every(r => selectedRecipientIds.has(r.id))}
                            onChange={toggleSelectAllFiltered}
                            className="cursor-pointer"
                          />
                        </th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email Address</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3">Branch / Phone</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {filteredRecipients.map(r => {
                        const isSelected = selectedRecipientIds.has(r.id)
                        return (
                          <tr 
                            key={r.id} 
                            onClick={() => toggleSelectRecipient(r.id)}
                            className={`cursor-pointer transition-colors ${isSelected ? "bg-blue-50/70 dark:bg-blue-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"}`}
                          >
                            <td className="py-2.5 px-3 text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleSelectRecipient(r.id)}
                                className="cursor-pointer"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                              {r.avatarUrl ? (
                                <img src={r.avatarUrl} alt="" className="w-6 h-6 rounded-full object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                  {r.name.charAt(0)}
                                </div>
                              )}
                              <span>{r.name}</span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">{r.email}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.type === "team" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300" : "bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300"}`}>
                                {r.type === "team" ? `Team (${r.role || "Staff"})` : "Client"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-zinc-500 text-[11px]">
                              {r.branchName || r.phone || "-"}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ──────── STEP 3: PREVIEW & SEND ──────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Summary Alert */}
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-600" />
                  <span className="font-bold text-blue-900 dark:text-blue-200">
                    Ready to dispatch to {selectedCount} recipient(s) ({teamCount} Team Members, {clientCount} Clients)
                  </span>
                </div>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-semibold">
                  Via In-App Notifications & Email
                </span>
              </div>

              {/* Formal Letterhead Document Preview Container */}
              <div className="border border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 bg-white dark:bg-zinc-950 shadow-inner space-y-6">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-zinc-900 dark:border-zinc-100 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt={companyName} className="h-12 max-w-[140px] object-contain" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xl">
                        🏢
                      </div>
                    )}
                    <div>
                      <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{companyName}</h1>
                      <p className="text-[10px] text-zinc-500 max-w-sm">{activeCompany?.address || "Official Corporate Headquarters"}</p>
                      {activeCompany?.gstin && <p className="text-[10px] text-zinc-400 font-mono">GSTIN: {activeCompany.gstin}</p>}
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-zinc-500 space-y-0.5">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100">Date: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                    <p className="font-mono">Ref: LTR-{activeCompanyId?.toUpperCase() || "SP"}-{Date.now().toString().slice(-6)}</p>
                  </div>
                </div>

                {/* Letter Subject */}
                <div className="space-y-1">
                  <p className="font-black text-sm text-zinc-900 dark:text-zinc-100 underline uppercase tracking-wide">
                    {title}
                  </p>
                  <p className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                    Subject: {subject}
                  </p>
                </div>

                {/* Letter Body */}
                <div className="whitespace-pre-line text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed font-serif">
                  {body}
                </div>

                {/* Official Stamp & Signatory Footer */}
                <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex items-end justify-between">
                  <div>
                    {activeCompany?.stamp_image_url ? (
                      <img src={activeCompany.stamp_image_url} alt="Official Seal" className="w-20 h-20 object-contain opacity-80" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border border-dashed border-zinc-400 flex items-center justify-center text-[10px] text-zinc-400 uppercase font-bold text-center p-1">
                        Official Seal
                      </div>
                    )}
                  </div>

                  <div className="text-right space-y-1">
                    {activeCompany?.signature_image_url && (
                      <img src={activeCompany.signature_image_url} alt="Signature" className="h-10 max-w-[120px] object-contain ml-auto" />
                    )}
                    <div className="border-t border-zinc-400 dark:border-zinc-600 pt-1">
                      <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{signatoryName}</p>
                      <p className="text-[10px] text-zinc-500">{signatoryDesignation}</p>
                      <p className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-400">{companyName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
    </>
  );
}
