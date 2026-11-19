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

export function TicketsSection2({ ctrl }: { ctrl: any }) {
  const { selectedTicket, setSelectedTicket, canResolveTicket, newStatus, setNewStatus, resolutionInput, setResolutionInput, resFileInputRef, handleUploadResolutionFiles, isUploadingResFile, resolutionAttachments, setResolutionAttachments, handleSaveResolution } = ctrl;
  return (
    <>
      {/* ---------------- DISPUTE ANALYSIS & RESOLUTION MODAL ---------------- */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                <div className="flex items-center gap-2">
                  <HeadphonesIcon className="text-blue-600" size={20} />
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">{selectedTicket.ticketNumber} — Dispute Dossier</h3>
                    <p className="text-[11px] text-zinc-400">{selectedTicket.subject}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {/* Meta details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Raised By</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedTicket.createdBy}</span>
                    <span className="text-zinc-400 block text-[10px]">{selectedTicket.creatorRole}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Category</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedTicket.category}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Priority</span>
                    <span className="font-bold text-rose-600 uppercase">{selectedTicket.priority}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Current Status</span>
                    <span className="font-bold text-blue-600 uppercase">{selectedTicket.status}</span>
                  </div>
                </div>

                {/* Dispute description */}
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] mb-1">Dispute Statement / Description</h4>
                  <p className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Evidence Attachments Display */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <Paperclip size={13} className="text-blue-600" />
                      <span>Attached Evidence & Files ({selectedTicket.attachments.length})</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedTicket.attachments.map((att, idx) => {
                        const isImage = att.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || att.name.match(/\.(jpeg|jpg|gif|png|webp)/i)
                        return (
                          <div key={idx} className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-3">
                            {isImage ? (
                              <img src={att.url} alt={att.name} className="w-12 h-12 rounded-lg object-cover border border-zinc-300 dark:border-zinc-700 shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                                <FileText size={20} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{att.name}</p>
                              {att.size && <span className="text-[10px] text-zinc-400">{att.size}</span>}
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5 font-semibold"
                              >
                                View in Full <ExternalLink size={10} />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Resolution confirmation block */}
                {selectedTicket.resolutionNote && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 text-xs">
                      <CheckCircle2 size={14} />
                      <span>Official Resolution & Action Taken Confirmation</span>
                    </div>
                    <p className="text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
                      {selectedTicket.resolutionNote}
                    </p>
                    {selectedTicket.resolutionAttachments && selectedTicket.resolutionAttachments.length > 0 && (
                      <div className="pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
                        <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Resolution Documents:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedTicket.resolutionAttachments.map((rAtt, rIdx) => (
                            <a
                              key={rIdx}
                              href={rAtt.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold flex items-center gap-1 hover:underline"
                            >
                              <Paperclip size={11} /> {rAtt.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 pt-1">
                      Confirmed by: <span className="font-semibold">{selectedTicket.resolvedBy || "Admin"}</span> • {selectedTicket.resolvedAt || "Resolved"}
                    </div>
                  </div>
                )}

                {/* Resolution Input Box */}
                {canResolveTicket && (
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <ShieldAlert size={14} className="text-blue-600" />
                      <span>Resolution & Status Investigation</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Update Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                        >
                          <option value="New">New</option>
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Resolved">Resolved (Confirm & Close)</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Official Resolution Confirmation Message</label>
                      <textarea
                        rows={3}
                        value={resolutionInput}
                        onChange={(e) => setResolutionInput(e.target.value)}
                        placeholder="Detail actions taken, bug patches, milestone corrections, or refunds..."
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                      />
                    </div>

                    {/* Admin ImgBB Resolution Attachments */}
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Attach Proof / Receipt Documents (ImgBB)</label>
                      <input
                        type="file"
                        multiple
                        ref={resFileInputRef}
                        onChange={handleUploadResolutionFiles}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => resFileInputRef.current?.click()}
                        disabled={isUploadingResFile}
                        className="px-3 py-1.5 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
                      >
                        {isUploadingResFile ? <Loader2 size={13} className="animate-spin" /> : <Paperclip size={13} />}
                        <span>{isUploadingResFile ? "Uploading to ImgBB..." : "Attach Resolution Document"}</span>
                      </button>

                      {resolutionAttachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {resolutionAttachments.map((f, fi) => (
                            <span key={fi} className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-semibold flex items-center gap-1.5">
                              <span>📄 {f.name}</span>
                              <button
                                type="button"
                                onClick={() => setResolutionAttachments(resolutionAttachments.filter((_, idx) => idx !== fi))}
                                className="text-zinc-400 hover:text-rose-500"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold cursor-pointer"
                >
                  Close
                </button>

                {canResolveTicket && (
                  <button
                    type="button"
                    onClick={handleSaveResolution}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>Confirm & Update Ticket</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
