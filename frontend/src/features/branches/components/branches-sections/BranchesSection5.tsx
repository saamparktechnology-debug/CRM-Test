"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, MapPin, Users, X, Check, 
  ChevronDown, Globe, CreditCard, FileText, QrCode, Sparkles, Lock, 
  UploadCloud, CheckCircle2, Shield, Eye, Phone, Mail, Building,
  AlertCircle, ExternalLink, Image as ImageIcon, Briefcase, Info,
  Landmark, Stamp, FileCheck
} from "lucide-react"
import { useAuthStore, Branch, SubBranch, Company, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { type Tab, type BranchModalTab, type SubBranchModalTab, cleanStr, cleanUpper , SafeModalBoundary } from "@/features/branches/components/branches-sections/BranchesHelpers"

export function BranchesSection5({ ctrl }: { ctrl: any }) {
  const { viewingItem, getCompanyName, setViewingItem, deleteConfirm, setDeleteConfirm, handleDelete } = ctrl;
  return (
    <>
      {/* ── VIEW DETAIL DRAWER / MODAL ──────────────────────────────── */}
      <AnimatePresence>
        {viewingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-xs"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-3">
                  {(viewingItem as any).logo_url ? (
                    <img src={(viewingItem as any).logo_url} alt={viewingItem.name} className="w-10 h-10 rounded-xl object-contain border border-zinc-200 dark:border-zinc-700 p-0.5" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {viewingItem.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{viewingItem.name}</h3>
                    <p className="text-[11px] text-zinc-400 font-mono">{viewingItem.code || "No Code"} • {getCompanyName((viewingItem as any).companyId)}</p>
                  </div>
                </div>
                <button onClick={() => setViewingItem(null)} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg hover:bg-zinc-100"><X size={16} /></button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {/* Status & Type Bar */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="font-semibold text-zinc-500">Status</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${viewingItem.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-zinc-200 text-zinc-600"}`}>
                    {viewingItem.status}
                  </span>
                </div>

                {/* Location & Contact */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"><MapPin size={13} className="text-blue-600" /> Location &amp; Address</h4>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <div><span className="text-zinc-400">Street:</span> <span className="font-medium text-zinc-800 dark:text-zinc-200">{(viewingItem as any).address || "-"}</span></div>
                    <div><span className="text-zinc-400">City / State:</span> <span className="font-medium text-zinc-800 dark:text-zinc-200">{viewingItem.city || "-"}, {viewingItem.state || "-"}</span></div>
                    <div><span className="text-zinc-400">Phone:</span> <span className="font-medium text-zinc-800 dark:text-zinc-200">{viewingItem.phone || "-"}</span></div>
                    <div><span className="text-zinc-400">Email:</span> <span className="font-medium text-zinc-800 dark:text-zinc-200">{viewingItem.email || "-"}</span></div>
                  </div>
                </div>

                {/* Tax & Compliance */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"><Shield size={13} className="text-amber-600" /> Tax &amp; Legal IDs</h4>
                  <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800 font-mono">
                    <div><span className="text-zinc-400 font-sans">GSTIN:</span> <span className="font-bold text-amber-600">{(viewingItem as any).gstin || "Inherits Company"}</span></div>
                    <div><span className="text-zinc-400 font-sans">PAN:</span> <span className="font-bold text-zinc-700 dark:text-zinc-300">{(viewingItem as any).pan || "-"}</span></div>
                  </div>
                </div>

                {/* Bank Account */}
                <div className="space-y-2">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5"><Landmark size={13} className="text-emerald-600" /> Banking &amp; UPI</h4>
                  <div className="p-3 bg-zinc-50/50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                    <div className="flex justify-between"><span className="text-zinc-400">Bank:</span> <span className="font-medium">{(viewingItem as any).bank_name || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Account:</span> <span className="font-mono">{(viewingItem as any).account_number || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">IFSC:</span> <span className="font-mono uppercase">{(viewingItem as any).ifsc_code || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">UPI ID:</span> <span className="font-mono text-blue-600">{(viewingItem as any).upi_id || "-"}</span></div>
                  </div>
                </div>

                {/* Visual Assets (Signature, Stamp, QR) */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                    <p className="text-[10px] font-bold text-zinc-500 mb-2">Signature</p>
                    {(viewingItem as any).signature_image_url ? (
                      <img src={(viewingItem as any).signature_image_url} alt="Signature" className="h-12 mx-auto object-contain" />
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">None</span>
                    )}
                  </div>

                  <div className="text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                    <p className="text-[10px] font-bold text-zinc-500 mb-2">Stamp / Seal</p>
                    {(viewingItem as any).stamp_image_url ? (
                      <img src={(viewingItem as any).stamp_image_url} alt="Stamp" className="h-12 mx-auto object-contain" />
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">None</span>
                    )}
                  </div>

                  <div className="text-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                    <p className="text-[10px] font-bold text-zinc-500 mb-2">Payment QR</p>
                    {(viewingItem as any).payment_qr_url ? (
                      <img src={(viewingItem as any).payment_qr_url} alt="UPI QR" className="h-12 mx-auto object-contain" />
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 shrink-0">
                <button onClick={() => setViewingItem(null)} className="px-4 py-1.5 text-xs font-bold text-zinc-600 bg-zinc-200 hover:bg-zinc-300 rounded-lg">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRMATION MODAL ───────────────────────────────── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Delete {deleteConfirm.type === "branch" ? "Branch" : "Sub-Branch"}
              </h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs text-zinc-500 font-semibold hover:bg-zinc-100 rounded-lg">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
