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

export function BranchesSection2({ ctrl }: { ctrl: any }) {
  const { isSubBranchModalOpen, editingSubBranch, setIsSubBranchModalOpen, setSubBranchTab, subBranchTab, handleSaveSubBranch, selectableCompanies, subBranchCompanyId, setSubBranchCompanyId, branches, setSubBranchParentBranchId, subBranchParentBranchId, subBranchForm, setSubBranchForm, setSubBranchBankProfileTab, subBranchBankProfileTab, handleCopySubBranchGstToNongst, isSaving } = ctrl;
  return (
    <>
      {isSubBranchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <SafeModalBoundary>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {editingSubBranch ? `Edit Sub-Branch: ${editingSubBranch.name}` : "Add Sub-Branch / Franchise Partner"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Satellite office with percentage-based revenue sharing and parent branch linking
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsSubBranchModalOpen(false)} 
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tab Navigation: 5 Tabs */}
              <div className="grid grid-cols-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 shrink-0 text-center font-semibold">
                <button
                  type="button"
                  onClick={() => setSubBranchTab("basic")}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 border-b-2 text-[11px] transition-colors ${
                    subBranchTab === "basic"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Building size={12} />
                  <span className="hidden sm:inline">1. Partner</span>
                  <span className="sm:hidden">1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubBranchTab("address")}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 border-b-2 text-[11px] transition-colors ${
                    subBranchTab === "address"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <MapPin size={12} />
                  <span className="hidden sm:inline">2. Address</span>
                  <span className="sm:hidden">2</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubBranchTab("tax")}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 border-b-2 text-[11px] transition-colors ${
                    subBranchTab === "tax"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Shield size={12} />
                  <span className="hidden sm:inline">3. Tax IDs</span>
                  <span className="sm:hidden">3</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubBranchTab("bank")}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 border-b-2 text-[11px] transition-colors ${
                    subBranchTab === "bank"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <CreditCard size={12} />
                  <span className="hidden sm:inline">4. Bank &amp; QR</span>
                  <span className="sm:hidden">4</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSubBranchTab("signatory")}
                  className={`flex items-center justify-center gap-1 py-2.5 px-1 border-b-2 text-[11px] transition-colors ${
                    subBranchTab === "signatory"
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-zinc-900"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  }`}
                >
                  <Stamp size={12} />
                  <span className="hidden sm:inline">5. Stamp &amp; Sig</span>
                  <span className="sm:hidden">5</span>
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-5">
                <form id="subBranchFormSubmit" onSubmit={handleSaveSubBranch}>
                  {/* Informational note */}
                  <div className="p-3 mb-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                    <Landmark size={14} className="shrink-0 text-emerald-600" />
                    <span>Sub-Branch / Franchise Partner: Any banking or signatory field left empty will inherit from the parent Company.</span>
                  </div>

                  {/* TAB 1: BASIC & ATTRIBUTION */}
                  {subBranchTab === "basic" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center justify-between">
                            <span>Parent Company *</span>
                            {(selectableCompanies || []).length <= 1 && (
                              <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                                🔒 Active Company
                              </span>
                            )}
                          </label>
                          <select 
                            value={subBranchCompanyId} 
                            onChange={(e) => {
                              const newCompId = e.target.value
                              setSubBranchCompanyId(newCompId)
                              const matchBranch = (branches || []).find(b => b && ((b as any).companyId === newCompId || String((b as any).company_id) === String(newCompId)))
                              setSubBranchParentBranchId(matchBranch?.id || "")
                            }}
                            disabled={(selectableCompanies || []).length <= 1}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium disabled:opacity-85 disabled:cursor-not-allowed"
                          >
                            {(selectableCompanies || []).filter(Boolean).map(c => (
                              <option key={c.id || Math.random()} value={c.id || ""}>{(c.name || "Company")} ({c.brand_name || "Co."})</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Parent Branch / Hub *</label>
                          <select 
                            value={subBranchParentBranchId} 
                            onChange={(e) => setSubBranchParentBranchId(e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium"
                          >
                            <option value="">-- Select Parent Branch --</option>
                            {(branches || [])
                              .filter(b => Boolean(b && b.id))
                              .filter(b => !subBranchCompanyId || isMatchingCompany({ id: (b as any).companyId || (b as any).company_id, slug: (b as any).companyId || (b as any).company_id } as any, subBranchCompanyId))
                              .map(b => (
                                <option key={b.id} value={b.id}>{b.name || "Branch"} ({b.code || "-"}) - {b.city || "Branch"}</option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch / Office Name *</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. Behala Satellite Hub" 
                            value={subBranchForm.name} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, name: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch Code</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SB-BHL" 
                            value={subBranchForm.code} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, code: e.target.value.toUpperCase() })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Partner / Manager Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Rahul Das" 
                            value={subBranchForm.partnerName} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, partnerName: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Partner Type</label>
                          <select 
                            value={subBranchForm.partnerType} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, partnerType: e.target.value as any })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium"
                          >
                            <option value="Franchise Partner">Franchise Partner</option>
                            <option value="Agency Partner">Agency Partner</option>
                            <option value="Satellite Office">Satellite Office</option>
                            <option value="Regional Associate">Regional Associate</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Revenue Share (%)</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              min="0"
                              max="100"
                              placeholder="30" 
                              value={subBranchForm.revenueSharePct} 
                              onChange={(e) => setSubBranchForm({ ...subBranchForm, revenueSharePct: Number(e.target.value) })} 
                              className="w-full pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold text-emerald-600" 
                            />
                            <span className="absolute right-3 top-2 text-zinc-400 font-bold">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Brand Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. SAAMPARK" 
                            value={subBranchForm.brand_name} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, brand_name: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Status</label>
                          <select 
                            value={subBranchForm.status} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: ADDRESS & CONTACT */}
                  {subBranchTab === "address" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Street Address</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 142/3 Diamond Harbour Road" 
                          value={subBranchForm.address} 
                          onChange={(e) => setSubBranchForm({ ...subBranchForm, address: e.target.value })} 
                          className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">City</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Kolkata" 
                            value={subBranchForm.city} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, city: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">State</label>
                          <input 
                            type="text" 
                            placeholder="e.g. West Bengal" 
                            value={subBranchForm.state} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, state: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">ZIP / PIN</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 700034" 
                            value={subBranchForm.zip} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, zip: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Country</label>
                          <input 
                            type="text" 
                            placeholder="e.g. India" 
                            value={subBranchForm.country} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, country: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Office Phone / WhatsApp</label>
                          <input 
                            type="text" 
                            placeholder="e.g. +91 98300 00000" 
                            value={subBranchForm.phone} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, phone: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Office Email</label>
                          <input 
                            type="email" 
                            placeholder="e.g. behala@saampark.com" 
                            value={subBranchForm.email} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, email: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Partner Direct Mobile</label>
                          <input 
                            type="text" 
                            placeholder="e.g. +91 98765 43210" 
                            value={subBranchForm.partnerPhone} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, partnerPhone: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Partner Direct Email</label>
                          <input 
                            type="email" 
                            placeholder="e.g. rahul.partner@gmail.com" 
                            value={subBranchForm.partnerEmail} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, partnerEmail: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: LEGAL & TAX IDS */}
                  {subBranchTab === "tax" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch GSTIN (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 19AAECS1234F1Z8" 
                            value={subBranchForm.gstin} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, gstin: e.target.value.toUpperCase() })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch PAN (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="e.g. AAECS1234F" 
                            value={subBranchForm.pan} 
                            onChange={(e) => setSubBranchForm({ ...subBranchForm, pan: e.target.value.toUpperCase() })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: DUAL GST & NON-GST BANKING & PAYMENT QR */}
                  {subBranchTab === "bank" && (
                    <div className="space-y-4">
                      {/* Dual Profile Switcher Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                          <button
                            type="button"
                            onClick={() => setSubBranchBankProfileTab("gst")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              subBranchBankProfileTab === "gst"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                            }`}
                          >
                            <CreditCard size={13} />
                            <span>GST Bank Profile</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSubBranchBankProfileTab("nongst")}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              subBranchBankProfileTab === "nongst"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                            }`}
                          >
                            <CreditCard size={13} />
                            <span>Non-GST Bank Profile</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleCopySubBranchGstToNongst}
                          className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                          title="Copy details from GST profile into Non-GST profile"
                        >
                          <Sparkles size={12} className="text-emerald-600" />
                          <span>Copy GST to Non-GST</span>
                        </button>
                      </div>

                      {/* Sub-Branch GST Bank Profile */}
                      {subBranchBankProfileTab === "gst" && (
                        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                              Sub-Branch GST Invoicing Bank &amp; Settlement Account
                            </span>
                            <span className="text-[10px] text-zinc-500">Used for Sub-Branch Official GST Invoices</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block font-semibold mb-1">GST Bank Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. State Bank of India" 
                                value={subBranchForm.gst_bank_name} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_bank_name: e.target.value, bank_name: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Account Holder Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Saampark Franchise Hub" 
                                value={subBranchForm.gst_account_holder} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_account_holder: e.target.value, account_holder: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">GST Account Number</label>
                              <input 
                                type="text" 
                                placeholder="Sub-Branch GST A/C number..." 
                                value={subBranchForm.gst_account_number} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_account_number: e.target.value, account_number: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold" 
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">IFSC Code</label>
                              <input 
                                type="text" 
                                placeholder="e.g. SBIN0001234" 
                                value={subBranchForm.gst_ifsc_code} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_ifsc_code: e.target.value.toUpperCase(), ifsc_code: e.target.value.toUpperCase() })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold uppercase" 
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Bank Branch Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. City Center Branch" 
                                value={subBranchForm.gst_bank_branch} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_bank_branch: e.target.value, bank_branch: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">GST UPI ID / VPA</label>
                              <input 
                                type="text" 
                                placeholder="e.g. saampark.sb@sbi" 
                                value={subBranchForm.gst_upi_id} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, gst_upi_id: e.target.value, upi_id: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                              />
                            </div>
                          </div>
                          <div className="pt-2">
                            <ImageUploadField
                              label="GST Payment QR Code / Scanner"
                              value={subBranchForm.gst_payment_qr_url}
                              onChange={url => setSubBranchForm({ ...subBranchForm, gst_payment_qr_url: url, payment_qr_url: url })}
                              uploadNamePrefix="subbranch_gst_qr"
                              helperText="Official QR scanner image printed on Sub-Branch GST Tax Invoices."
                            />
                          </div>
                        </div>
                      )}

                      {/* Sub-Branch Non-GST Bank Profile */}
                      {subBranchBankProfileTab === "nongst" && (
                        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                              Sub-Branch Non-GST Invoicing Bank &amp; Settlement Account
                            </span>
                            <span className="text-[10px] text-zinc-500">Used for Sub-Branch Non-GST / Direct Estimates &amp; Bills</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block font-semibold mb-1">Non-GST Bank Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. HDFC Bank Ltd" 
                                value={subBranchForm.nongst_bank_name} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_bank_name: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Account Holder Name</label>
                              <input 
                                type="text" 
                                placeholder="Sub-Branch Non-GST Account Holder" 
                                value={subBranchForm.nongst_account_holder} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_account_holder: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Non-GST Account Number</label>
                              <input 
                                type="text" 
                                placeholder="Sub-Branch Non-GST A/C number..." 
                                value={subBranchForm.nongst_account_number} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_account_number: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold" 
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">IFSC Code</label>
                              <input 
                                type="text" 
                                placeholder="e.g. HDFC0000123" 
                                value={subBranchForm.nongst_ifsc_code} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_ifsc_code: e.target.value.toUpperCase() })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold uppercase" 
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Bank Branch Name</label>
                              <input 
                                type="text" 
                                placeholder="e.g. Main Branch" 
                                value={subBranchForm.nongst_bank_branch} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_bank_branch: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Non-GST UPI ID / VPA</label>
                              <input 
                                type="text" 
                                placeholder="e.g. partner.sb@hdfcbank" 
                                value={subBranchForm.nongst_upi_id} 
                                onChange={e => setSubBranchForm({ ...subBranchForm, nongst_upi_id: e.target.value })} 
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                              />
                            </div>
                          </div>
                          <div className="pt-2">
                            <ImageUploadField
                              label="Non-GST Payment QR Code / Scanner"
                              value={subBranchForm.nongst_payment_qr_url}
                              onChange={url => setSubBranchForm({ ...subBranchForm, nongst_payment_qr_url: url })}
                              uploadNamePrefix="subbranch_nongst_qr"
                              helperText="Official QR scanner image printed on Sub-Branch Non-GST Direct Bills."
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: SIGNATORY & OFFICIAL STAMP */}
                  {subBranchTab === "signatory" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Signatory Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Rahul Das" 
                            value={subBranchForm.signatory_name} 
                            onChange={e => setSubBranchForm({ ...subBranchForm, signatory_name: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Signatory Designation</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Franchise Partner" 
                            value={subBranchForm.signatory_designation} 
                            onChange={e => setSubBranchForm({ ...subBranchForm, signatory_designation: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                          <ImageUploadField
                            label="Sub-Branch Authorized Signature"
                            value={subBranchForm.signature_image_url}
                            onChange={url => setSubBranchForm({ ...subBranchForm, signature_image_url: url })}
                            uploadNamePrefix="subbranch_sig"
                            helperText="If not uploaded, the parent Company's signature image is automatically used."
                          />
                        </div>
                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                          <ImageUploadField
                            label="Sub-Branch Official Stamp / Seal"
                            value={subBranchForm.stamp_image_url}
                            onChange={url => setSubBranchForm({ ...subBranchForm, stamp_image_url: url })}
                            uploadNamePrefix="subbranch_stamp"
                            helperText="If not uploaded, the parent Company's corporate seal stamp is automatically used."
                          />
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch Terms &amp; Conditions</label>
                          <textarea
                            rows={3}
                            placeholder="Sub-Branch specific terms &amp; conditions (applies on sub-branch invoices)..."
                            value={subBranchForm.terms_conditions}
                            onChange={e => setSubBranchForm({ ...subBranchForm, terms_conditions: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Sub-Branch Invoice Notes / Payment Instructions</label>
                          <textarea
                            rows={2}
                            placeholder="Notes printed on sub-branch invoices..."
                            value={subBranchForm.invoice_notes}
                            onChange={e => setSubBranchForm({ ...subBranchForm, invoice_notes: e.target.value })}
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 shrink-0">
                <div className="text-zinc-400 text-[11px]">
                  Step {subBranchTab === "basic" ? "1" : subBranchTab === "address" ? "2" : subBranchTab === "tax" ? "3" : subBranchTab === "bank" ? "4" : "5"} of 5
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsSubBranchModalOpen(false)} 
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="subBranchFormSubmit" 
                    disabled={isSaving || !(subBranchForm?.name || "").trim()} 
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    {isSaving ? "Saving..." : (editingSubBranch ? "Update Sub-Branch" : "Create Sub-Branch")}
                  </button>
                </div>
              </div>
            </motion.div>
            </SafeModalBoundary>
          </div>
        )}
    </>
  );
}
