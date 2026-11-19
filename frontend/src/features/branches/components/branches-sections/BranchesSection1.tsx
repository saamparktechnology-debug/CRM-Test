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

export function BranchesSection1({ ctrl }: { ctrl: any }) {
  const { isBranchModalOpen, editingBranch, setIsBranchModalOpen, setBranchTab, branchTab, handleSaveBranch, selectableCompanies, branchCompanyId, setBranchCompanyId, branchForm, setBranchForm, setBranchBankProfileTab, branchBankProfileTab, handleCopyBranchGstToNongst, isSaving } = ctrl;
  return (
    <>
      {isBranchModalOpen && (
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
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {editingBranch ? `Edit Branch: ${editingBranch.name}` : "Add Operational Branch"}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Configure branch legal, GSTIN, banking, and signatory settings
                    </p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsBranchModalOpen(false)} 
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* 5 Tab Navigation Header */}
                <div className="grid grid-cols-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 font-semibold text-center shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setBranchTab("basic")} 
                    className={`py-2.5 px-1 border-b-2 transition-colors flex items-center justify-center gap-1 text-[11px] ${
                      branchTab === "basic" 
                        ? "border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 font-bold" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <Building size={12} />
                    <span className="hidden sm:inline">1. Basic</span>
                    <span className="sm:hidden">1</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setBranchTab("address")} 
                    className={`py-2.5 px-1 border-b-2 transition-colors flex items-center justify-center gap-1 text-[11px] ${
                      branchTab === "address" 
                        ? "border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 font-bold" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <MapPin size={12} />
                    <span className="hidden sm:inline">2. Address</span>
                    <span className="sm:hidden">2</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setBranchTab("tax")} 
                    className={`py-2.5 px-1 border-b-2 transition-colors flex items-center justify-center gap-1 text-[11px] ${
                      branchTab === "tax" 
                        ? "border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 font-bold" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <Shield size={12} />
                    <span className="hidden sm:inline">3. Tax IDs</span>
                    <span className="sm:hidden">3</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setBranchTab("bank")} 
                    className={`py-2.5 px-1 border-b-2 transition-colors flex items-center justify-center gap-1 text-[11px] ${
                      branchTab === "bank" 
                        ? "border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 font-bold" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <CreditCard size={12} />
                    <span className="hidden sm:inline">4. Bank &amp; QR</span>
                    <span className="sm:hidden">4</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => setBranchTab("signatory")} 
                    className={`py-2.5 px-1 border-b-2 transition-colors flex items-center justify-center gap-1 text-[11px] ${
                      branchTab === "signatory" 
                        ? "border-blue-600 text-blue-600 bg-white dark:bg-zinc-900 font-bold" 
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <Stamp size={12} />
                    <span className="hidden sm:inline">5. Stamp &amp; Sig</span>
                    <span className="sm:hidden">5</span>
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSaveBranch} id="branchFormSubmit" className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-5 space-y-4 overflow-y-auto flex-1 max-h-[65vh]">
                    {/* Informational note about banking, signatory & terms inheritance */}
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                      <Landmark size={14} className="shrink-0 text-blue-600" />
                      <span>Optional Overrides: Any banking, signature, or stamp field left empty will inherit from the parent Company.</span>
                    </div>
                    
                    {/* ── TAB 1: BASIC & BRAND ── */}
                    {branchTab === "basic" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center justify-between">
                              <span>Company *</span>
                              {(selectableCompanies || []).length <= 1 && (
                                <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                                  🔒 Active Company
                                </span>
                              )}
                            </label>
                            <select 
                              required 
                              value={branchCompanyId} 
                              onChange={(e) => setBranchCompanyId(e.target.value)}
                              disabled={(selectableCompanies || []).length <= 1}
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium disabled:opacity-85 disabled:cursor-not-allowed"
                            >
                              {(selectableCompanies || []).filter(Boolean).map(c => (
                                <option key={c.id || Math.random()} value={c.id || ""}>{c.brand_name || c.name || "Company"}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Name *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. Kolkata Salt Lake Branch" 
                              value={branchForm.name} 
                              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Code *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. BR-KOL-01" 
                              value={branchForm.code} 
                              onChange={(e) => setBranchForm({ ...branchForm, code: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Status</label>
                            <select 
                              value={branchForm.status} 
                              onChange={(e) => setBranchForm({ ...branchForm, status: e.target.value as any })}
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Brand Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. SAAMPARK" 
                              value={branchForm.brand_name} 
                              onChange={(e) => setBranchForm({ ...branchForm, brand_name: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Division Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Technology & Software" 
                              value={branchForm.division_name} 
                              onChange={(e) => setBranchForm({ ...branchForm, division_name: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Subtitle / Operations Tagline</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Eastern Regional Operations & R&D Center" 
                              value={branchForm.subtitle} 
                              onChange={(e) => setBranchForm({ ...branchForm, subtitle: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Manager Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Amit Sen" 
                              value={branchForm.managerName} 
                              onChange={(e) => setBranchForm({ ...branchForm, managerName: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Manager Phone</label>
                            <input 
                              type="text" 
                              placeholder="+91 98765 43210" 
                              value={branchForm.managerPhone} 
                              onChange={(e) => setBranchForm({ ...branchForm, managerPhone: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                        </div>

                        {/* Branch Logo Upload */}
                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                          <ImageUploadField 
                            label="Branch Logo (Overrides Company Logo on Branch Invoices)"
                            value={branchForm.logo_url}
                            onChange={(url) => setBranchForm({ ...branchForm, logo_url: url })}
                            uploadNamePrefix="branch_logo"
                            helperText="Uploaded to ImgBB storage. Used on official invoices, quotations, and letters issued by this branch."
                          />
                        </div>
                      </div>
                    )}

                    {/* ── TAB 2: ADDRESS & CONTACT ── */}
                    {branchTab === "address" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Street Address</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Tower 3, 5th Floor, Salt Lake Sector V" 
                            value={branchForm.address} 
                            onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })} 
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">City</label>
                            <input 
                              type="text" 
                              value={branchForm.city} 
                              onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">State</label>
                            <input 
                              type="text" 
                              value={branchForm.state} 
                              onChange={(e) => setBranchForm({ ...branchForm, state: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">ZIP / PIN</label>
                            <input 
                              type="text" 
                              value={branchForm.zip} 
                              onChange={(e) => setBranchForm({ ...branchForm, zip: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Country</label>
                            <input 
                              type="text" 
                              value={branchForm.country} 
                              onChange={(e) => setBranchForm({ ...branchForm, country: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Official Phone</label>
                            <input 
                              type="text" 
                              placeholder="+91 33 2345 6789" 
                              value={branchForm.phone} 
                              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Official Email</label>
                            <input 
                              type="email" 
                              placeholder="kolkata@saampark.com" 
                              value={branchForm.email} 
                              onChange={(e) => setBranchForm({ ...branchForm, email: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Website URL</label>
                            <input 
                              type="text" 
                              placeholder="https://saampark.com" 
                              value={branchForm.website} 
                              onChange={(e) => setBranchForm({ ...branchForm, website: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── TAB 3: TAX & LEGAL IDS ── */}
                    {branchTab === "tax" && (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl flex items-start gap-2.5 text-blue-800 dark:text-blue-300">
                          <Info size={16} className="shrink-0 mt-0.5" />
                          <p className="text-[11px] leading-relaxed">
                            If this branch has a state-specific GST registration (GSTIN), provide it below. The tax engine automatically selects this GSTIN on invoices generated from this location.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch GSTIN (15 Digits)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 19AAECS1234F1Z5" 
                              value={branchForm.gstin} 
                              onChange={(e) => setBranchForm({ ...branchForm, gstin: e.target.value.toUpperCase() })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch PAN (10 Digits)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. AAECS1234F" 
                              value={branchForm.pan} 
                              onChange={(e) => setBranchForm({ ...branchForm, pan: e.target.value.toUpperCase() })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">CIN (Corporate Identification)</label>
                            <input 
                              type="text" 
                              placeholder="e.g. U72200WB2020PTC123456" 
                              value={branchForm.cin} 
                              onChange={(e) => setBranchForm({ ...branchForm, cin: e.target.value.toUpperCase() })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">MSME Registration No.</label>
                            <input 
                              type="text" 
                              placeholder="e.g. UDYAM-WB-01-0012345" 
                              value={branchForm.msme_reg} 
                              onChange={(e) => setBranchForm({ ...branchForm, msme_reg: e.target.value.toUpperCase() })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono uppercase" 
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">ISO / Quality Certification Tagline</label>
                            <input 
                              type="text" 
                              placeholder="e.g. An ISO 9001:2015 Certified Company (or leave blank to hide)" 
                              value={branchForm.iso_certification} 
                              onChange={(e) => setBranchForm({ ...branchForm, iso_certification: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                            <span className="text-[10.5px] text-zinc-500 mt-1 block">
                              Rendered as the golden certification badge in the branch invoice header.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── TAB 4: DUAL GST & NON-GST BANKING & PAYMENT QR ── */}
                    {branchTab === "bank" && (
                      <div className="space-y-4">
                        {/* Dual Profile Switcher Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                            <button
                              type="button"
                              onClick={() => setBranchBankProfileTab("gst")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                branchBankProfileTab === "gst"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                              }`}
                            >
                              <CreditCard size={13} />
                              <span>GST Bank Profile</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setBranchBankProfileTab("nongst")}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                                branchBankProfileTab === "nongst"
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
                            onClick={handleCopyBranchGstToNongst}
                            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                            title="Copy details from GST profile into Non-GST profile"
                          >
                            <Sparkles size={12} className="text-blue-600" />
                            <span>Copy GST to Non-GST</span>
                          </button>
                        </div>

                        {/* Branch GST Bank Profile */}
                        {branchBankProfileTab === "gst" && (
                          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 space-y-3.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                                Branch GST Invoicing Bank &amp; Settlement Account
                              </span>
                              <span className="text-[10px] text-zinc-500">Used for Official Branch GST Invoices</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block font-semibold mb-1">GST Bank Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. ICICI Bank Ltd" 
                                  value={branchForm.gst_bank_name} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_bank_name: e.target.value, bank_name: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Account Holder Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. SAAMPARK TECHNOLOGY - BRANCH" 
                                  value={branchForm.gst_account_holder} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_account_holder: e.target.value, account_holder: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">GST Account Number</label>
                                <input 
                                  type="text" 
                                  placeholder="Branch GST A/C number..." 
                                  value={branchForm.gst_account_number} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_account_number: e.target.value, account_number: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold" 
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">IFSC Code</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. ICIC0001234" 
                                  value={branchForm.gst_ifsc_code} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_ifsc_code: e.target.value.toUpperCase(), ifsc_code: e.target.value.toUpperCase() })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold uppercase" 
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Bank Branch Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Sector V Branch" 
                                  value={branchForm.gst_bank_branch} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_bank_branch: e.target.value, bank_branch: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">GST UPI ID / VPA</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. saampark.gst@icici" 
                                  value={branchForm.gst_upi_id} 
                                  onChange={e => setBranchForm({ ...branchForm, gst_upi_id: e.target.value, upi_id: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                                />
                              </div>
                            </div>
                            <div className="pt-2">
                              <ImageUploadField
                                label="GST Payment QR Code / Scanner"
                                value={branchForm.gst_payment_qr_url}
                                onChange={url => setBranchForm({ ...branchForm, gst_payment_qr_url: url, payment_qr_url: url })}
                                uploadNamePrefix="branch_gst_qr"
                                helperText="Official QR scanner image printed on Branch GST Tax Invoices."
                              />
                            </div>
                          </div>
                        )}

                        {/* Branch Non-GST Bank Profile */}
                        {branchBankProfileTab === "nongst" && (
                          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 space-y-3.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                                Branch Non-GST Invoicing Bank &amp; Settlement Account
                              </span>
                              <span className="text-[10px] text-zinc-500">Used for Non-GST / Direct Estimates &amp; Bills</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block font-semibold mb-1">Non-GST Bank Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. HDFC Bank Ltd" 
                                  value={branchForm.nongst_bank_name} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_bank_name: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Account Holder Name</label>
                                <input 
                                  type="text" 
                                  placeholder="Branch Non-GST Account Holder" 
                                  value={branchForm.nongst_account_holder} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_account_holder: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Non-GST Account Number</label>
                                <input 
                                  type="text" 
                                  placeholder="Branch Non-GST A/C number..." 
                                  value={branchForm.nongst_account_number} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_account_number: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold" 
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">IFSC Code</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. HDFC0000123" 
                                  value={branchForm.nongst_ifsc_code} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_ifsc_code: e.target.value.toUpperCase() })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono font-bold uppercase" 
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Bank Branch Name</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Salt Lake Main Branch" 
                                  value={branchForm.nongst_bank_branch} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_bank_branch: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                                />
                              </div>
                              <div>
                                <label className="block font-semibold mb-1">Non-GST UPI ID / VPA</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. branch.nongst@hdfcbank" 
                                  value={branchForm.nongst_upi_id} 
                                  onChange={e => setBranchForm({ ...branchForm, nongst_upi_id: e.target.value })} 
                                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono" 
                                />
                              </div>
                            </div>
                            <div className="pt-2">
                              <ImageUploadField
                                label="Non-GST Payment QR Code / Scanner"
                                value={branchForm.nongst_payment_qr_url}
                                onChange={url => setBranchForm({ ...branchForm, nongst_payment_qr_url: url })}
                                uploadNamePrefix="branch_nongst_qr"
                                helperText="Official QR scanner image printed on Branch Non-GST Direct Bills."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── TAB 5: SIGNATORY & OFFICIAL STAMP ── */}
                    {branchTab === "signatory" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Signatory Name</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Supriya Kumar (or blank for default)" 
                              value={branchForm.signatory_name} 
                              onChange={e => setBranchForm({ ...branchForm, signatory_name: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Signatory Designation</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Branch Head / Operations Manager" 
                              value={branchForm.signatory_designation} 
                              onChange={e => setBranchForm({ ...branchForm, signatory_designation: e.target.value })} 
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                            <ImageUploadField
                              label="Branch Authorized Signature"
                              value={branchForm.signature_image_url}
                              onChange={url => setBranchForm({ ...branchForm, signature_image_url: url })}
                              uploadNamePrefix="branch_sig"
                              helperText="If not uploaded, the parent Company's signature image is automatically used."
                            />
                          </div>
                          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                            <ImageUploadField
                              label="Branch Official Stamp / Seal"
                              value={branchForm.stamp_image_url}
                              onChange={url => setBranchForm({ ...branchForm, stamp_image_url: url })}
                              uploadNamePrefix="branch_stamp"
                              helperText="If not uploaded, the parent Company's corporate seal stamp is automatically used."
                            />
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Terms &amp; Conditions</label>
                            <textarea
                              rows={3}
                              placeholder="Branch specific terms &amp; conditions (applies on branch invoices)..."
                              value={branchForm.terms_conditions}
                              onChange={e => setBranchForm({ ...branchForm, terms_conditions: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Branch Invoice Notes / Payment Instructions</label>
                            <textarea
                              rows={2}
                              placeholder="Notes printed on branch invoices..."
                              value={branchForm.invoice_notes}
                              onChange={e => setBranchForm({ ...branchForm, invoice_notes: e.target.value })}
                              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 shrink-0">
                <div className="text-zinc-400 text-[11px]">
                  Step {branchTab === "basic" ? "1" : branchTab === "address" ? "2" : branchTab === "tax" ? "3" : branchTab === "bank" ? "4" : "5"} of 5
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsBranchModalOpen(false)} 
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    form="branchFormSubmit"
                    disabled={isSaving || !(branchForm?.name || "").trim()}
                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    {isSaving ? "Saving..." : (editingBranch ? "Update Branch" : "Create Branch")}
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
