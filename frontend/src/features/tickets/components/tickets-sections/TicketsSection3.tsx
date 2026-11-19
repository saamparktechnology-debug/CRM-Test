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

export function TicketsSection3({ ctrl }: { ctrl: any }) {
  const { isRaiseModalOpen, setIsRaiseModalOpen, handleRaiseTicket, subject, setSubject, category, setCategory, priority, setPriority, description, setDescription, ticketFileInputRef, handleUploadTicketFiles, isUploadingFile, attachments, setAttachments } = ctrl;
  return (
    <>
      {/* ---------------- RAISE DISPUTE MODAL (WITH IMGBB ATTACHMENTS) ---------------- */}
      <AnimatePresence>
        {isRaiseModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <HeadphonesIcon size={18} className="text-blue-600" />
                  <span>Raise Support Dispute / Inquiry</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsRaiseModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRaiseTicket} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Subject / Issue Summary *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Scope discrepancy in Milestone 2 or Invoice calculation issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    >
                      <option value="Project Deliverable & Scope">Project Deliverable & Scope</option>
                      <option value="Billing & Invoicing Dispute">Billing & Invoicing Dispute</option>
                      <option value="Technical Issue / Bug">Technical Issue / Bug</option>
                      <option value="Account & Permissions">Account & Permissions</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TicketPriority)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden font-bold"
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical 🔥</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Detailed Description & Evidence *</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full context, affected project/invoice IDs, and expectations..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                  />
                </div>

                {/* ImgBB File & Screenshot Attachment Field */}
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Attach Screenshots / Documents (ImgBB Cloud)</label>
                  <input
                    type="file"
                    multiple
                    ref={ticketFileInputRef}
                    onChange={handleUploadTicketFiles}
                    className="hidden"
                  />
                  <div
                    onClick={() => ticketFileInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/60 dark:bg-zinc-800/40 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {isUploadingFile ? (
                      <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold py-2">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading files to ImgBB Free Cloud...</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 font-semibold">
                          <Paperclip size={14} className="text-blue-600" />
                          <span>Click to Upload Screenshots / Files</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">Supported: PNG, JPG, WEBP, GIF, PDF</p>
                      </div>
                    )}
                  </div>

                  {/* Attachment Thumbnails & Files List */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Attached Files ({attachments.length}):</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {attachments.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-base">📎</span>
                              <div className="truncate">
                                <p className="font-semibold text-[11px] text-zinc-800 dark:text-zinc-200 truncate">{att.name}</p>
                                {att.size && <p className="text-[9px] text-zinc-400">{att.size}</p>}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                              className="text-zinc-400 hover:text-rose-600 p-1"
                              title="Remove file"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confidential Routing Notice */}
                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-start gap-2.5">
                  <span className="text-sm">🛡️</span>
                  <div className="text-[11px] text-blue-900 dark:text-blue-300 leading-snug">
                    <p className="font-bold">Confidential Direct Routing</p>
                    <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
                      This ticket and uploaded evidence will be routed <strong>strictly to the Company Admin and Super Admin only</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsRaiseModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingFile}
                    className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>Submit Dispute Ticket</span>
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
