"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Pencil, Trash2, Shield, MapPin, Phone, Mail, 
  User, Check, X, AlertTriangle, Layers, ChevronDown, ChevronRight, ChevronLeft,
  Globe, CreditCard, FileText, QrCode, Sparkles, Lock, UploadCloud,
  Image as ImageIcon, CheckCircle2
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyFullName, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { usePermissionStore, ALL_APP_MODULES, CLEAN_MODULE_CATEGORIES } from "@/store/usePermissionStore"

export function CompanyBranchSettingsSection2({ ctrl }: { ctrl: any }) {
  const { isBranchModalOpen, editingBranch, setIsBranchModalOpen, setBranchModalTab, branchModalTab, handleSaveBranch, isSuperAdmin, targetCompanyIdForBranch, setTargetCompanyIdForBranch, companies, visibleCompanies, branchName, setBranchName, branchCode, setBranchCode, branchBrandName, setBranchBrandName, branchDivisionName, setBranchDivisionName, branchSubtitle, setBranchSubtitle, branchManager, setBranchManager, branchManagerPhone, setBranchManagerPhone, branchStatus, setBranchStatus, branchGstin, setBranchGstin, branchPan, setBranchPan, branchCin, setBranchCin, branchMsmeReg, setBranchMsmeReg, branchAddress, setBranchAddress, branchCity, setBranchCity, branchState, setBranchState, branchZip, setBranchZip, branchPhone, setBranchPhone, branchEmail, setBranchEmail, branchWebsite, setBranchWebsite, setBranchBankProfileTab, branchBankProfileTab, handleCopyBranchGstToNongst, branchGstBankName, setBranchGstBankName, setBranchBankName, branchGstAccountHolder, setBranchGstAccountHolder, setBranchAccountHolder, branchGstAccountNumber, setBranchGstAccountNumber, setBranchAccountNumber, branchGstIfscCode, setBranchGstIfscCode, setBranchIfscCode, branchGstBankBranch, setBranchGstBankBranch, setBranchBankBranch, branchGstUpiId, setBranchGstUpiId, setBranchUpiId, branchGstPaymentQrUrl, setBranchGstPaymentQrUrl, branchPaymentQrUrl, setBranchPaymentQrUrl, branchGstQrInputRef, handleBranchGstQrUpload, branchNongstBankName, setBranchNongstBankName, branchNongstAccountHolder, setBranchNongstAccountHolder, branchNongstAccountNumber, setBranchNongstAccountNumber, branchNongstIfscCode, setBranchNongstIfscCode, branchNongstBankBranch, setBranchNongstBankBranch, branchNongstUpiId, setBranchNongstUpiId, branchNongstPaymentQrUrl, setBranchNongstPaymentQrUrl, branchNongstQrInputRef, handleBranchNongstQrUpload, branchSignatoryName, setBranchSignatoryName, branchSignatoryDesignation, setBranchSignatoryDesignation, branchSignatureImageUrl, setBranchSignatureImageUrl, branchSignatureInputRef, handleBranchSignatureUpload, branchStampImageUrl, setBranchStampImageUrl, branchStampInputRef, handleBranchStampUpload, BRANCH_TABS_LIST } = ctrl;
  return (
    <>
      {isBranchModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xs font-bold">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      {editingBranch ? `Edit Branch: ${editingBranch.name}` : "Create New Branch Hub"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Configure branch branding, legal tax IDs, addresses, custom banking, and digital signature/stamp
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 5 Tab Navigation Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-pressed/30 rounded-2xl border border-border/80 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setBranchModalTab("basic")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    branchModalTab === "basic"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 size={13} />
                  <span>1. Identity</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBranchModalTab("tax")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    branchModalTab === "tax"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={13} />
                  <span>2. Tax & Legal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBranchModalTab("contact")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    branchModalTab === "contact"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin size={13} />
                  <span>3. Address</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBranchModalTab("bank")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    branchModalTab === "bank"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>4. Bank & UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBranchModalTab("signature")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    branchModalTab === "signature"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shield size={13} />
                  <span>5. Signature & Stamp</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveBranch} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
                
                {/* ── TAB 1: IDENTITY & BRANDING ── */}
                {branchModalTab === "basic" && (
                  <div className="space-y-3.5">
                    {/* Target Company */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Target Parent Company *</label>
                      {isSuperAdmin ? (
                        <select
                          value={targetCompanyIdForBranch}
                          onChange={(e) => setTargetCompanyIdForBranch(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-semibold text-foreground"
                        >
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.logo || "🏢"} {c.name} ({c.slug || c.id})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-surface-pressed/30 border border-border text-xs font-semibold text-foreground">
                          <div className="flex items-center gap-2">
                            <span>{visibleCompanies[0]?.logo || "🏢"}</span>
                            <span>{visibleCompanies[0]?.name || "Assigned Company"}</span>
                          </div>
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">Assigned</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Operating Name *</label>
                        <input
                          type="text"
                          required
                          value={branchName}
                          onChange={(e) => setBranchName(e.target.value)}
                          placeholder="e.g. Kolkata Salt Lake City Center"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Code (Invoice ID Prefix) *</label>
                        <input
                          type="text"
                          required
                          value={branchCode}
                          onChange={(e) => setBranchCode(e.target.value.toUpperCase())}
                          placeholder="e.g. KOL-01, BLR-HQ"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Brand & Division Custom Overrides */}
                    <div className="p-3 rounded-2xl bg-surface-pressed/30 border border-border/70 space-y-2.5">
                      <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                        <Sparkles size={13} className="text-primary" />
                        <span>Branch Custom Brand & Division Header (Optional Overrides)</span>
                      </span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[10.5px] text-muted-foreground mb-1">Brand Name Override</label>
                          <input
                            type="text"
                            value={branchBrandName}
                            onChange={(e) => setBranchBrandName(e.target.value)}
                            placeholder="Defaults to Company Brand (e.g. SAAMPARK)"
                            className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[10.5px] text-muted-foreground mb-1">Division Name Override</label>
                          <input
                            type="text"
                            value={branchDivisionName}
                            onChange={(e) => setBranchDivisionName(e.target.value)}
                            placeholder="e.g. TECHNOLOGY - EAST INDIA"
                            className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10.5px] text-muted-foreground mb-1">Branch Subtitle / Tagline</label>
                        <input
                          type="text"
                          value={branchSubtitle}
                          onChange={(e) => setBranchSubtitle(e.target.value)}
                          placeholder="e.g. Regional Development & Enterprise Support Center"
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Manager & Operational Status */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Manager</label>
                        <input
                          type="text"
                          value={branchManager}
                          onChange={(e) => setBranchManager(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Manager Phone</label>
                        <input
                          type="text"
                          value={branchManagerPhone}
                          onChange={(e) => setBranchManagerPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Status</label>
                        <select
                          value={branchStatus}
                          onChange={(e) => setBranchStatus(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 2: LEGAL & TAX IDS ── */}
                {branchModalTab === "tax" && (
                  <div className="space-y-3.5">
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[11px] text-blue-900 dark:text-blue-200">
                      💡 <strong>State-Specific GSTIN:</strong> In India, businesses with multi-state operations have distinct state GSTINs per branch. Enter the branch-specific GSTIN below to appear on invoices issued from this branch.
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch State GSTIN</label>
                        <input
                          type="text"
                          value={branchGstin}
                          onChange={(e) => setBranchGstin(e.target.value.toUpperCase())}
                          placeholder="e.g. 19ABCDE1234F1Z5"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch PAN</label>
                        <input
                          type="text"
                          value={branchPan}
                          onChange={(e) => setBranchPan(e.target.value.toUpperCase())}
                          placeholder="e.g. ABCDE1234F"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch CIN / Registration No.</label>
                        <input
                          type="text"
                          value={branchCin}
                          onChange={(e) => setBranchCin(e.target.value)}
                          placeholder="e.g. U72200WB2023PTC123456"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">MSME / Udyam Reg No.</label>
                        <input
                          type="text"
                          value={branchMsmeReg}
                          onChange={(e) => setBranchMsmeReg(e.target.value)}
                          placeholder="e.g. UDYAM-WB-10-0012345"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: ADDRESS & CONTACTS ── */}
                {branchModalTab === "contact" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Physical Street Address *</label>
                      <input
                        type="text"
                        value={branchAddress}
                        onChange={(e) => setBranchAddress(e.target.value)}
                        placeholder="e.g. Plot 12, Block EP & GP, Sector V, Salt Lake"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">City / Hub</label>
                        <input
                          type="text"
                          value={branchCity}
                          onChange={(e) => setBranchCity(e.target.value)}
                          placeholder="e.g. Kolkata"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">State / Province</label>
                        <input
                          type="text"
                          value={branchState}
                          onChange={(e) => setBranchState(e.target.value)}
                          placeholder="e.g. West Bengal"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">PIN / Zip Code</label>
                        <input
                          type="text"
                          value={branchZip}
                          onChange={(e) => setBranchZip(e.target.value)}
                          placeholder="700091"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Direct Phone</label>
                        <input
                          type="text"
                          value={branchPhone}
                          onChange={(e) => setBranchPhone(e.target.value)}
                          placeholder="+91 33 2345 6789"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Invoicing Email</label>
                        <input
                          type="email"
                          value={branchEmail}
                          onChange={(e) => setBranchEmail(e.target.value)}
                          placeholder="kolkata.billing@saampark.in"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Website / Portal</label>
                        <input
                          type="text"
                          value={branchWebsite}
                          onChange={(e) => setBranchWebsite(e.target.value)}
                          placeholder="https://saampark.com/kolkata"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: BANK & UPI PAY (DUAL GST & NON-GST PROFILES) ── */}
                {branchModalTab === "bank" && (
                  <div className="space-y-3.5">
                    {/* Dual Profile Switcher Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-surface-hover/60 border border-border">
                      <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border/80">
                        <button
                          type="button"
                          onClick={() => setBranchBankProfileTab("gst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            branchBankProfileTab === "gst"
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CreditCard size={13} />
                          <span>GST Invoice Bank Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBranchBankProfileTab("nongst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            branchBankProfileTab === "nongst"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CreditCard size={13} />
                          <span>Non-GST Invoice Bank Profile</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyBranchGstToNongst}
                        className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        title="Copy details from GST profile into Non-GST profile"
                      >
                        <Sparkles size={12} className="text-primary" />
                        <span>Copy GST to Non-GST</span>
                      </button>
                    </div>

                    {/* Branch GST Profile */}
                    {branchBankProfileTab === "gst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                            Branch GST Invoices Bank Account & QR
                          </span>
                          <span className="text-[10px] text-muted-foreground">Used on GST Invoices from this Branch</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Name *</label>
                            <input
                              type="text"
                              value={branchGstBankName}
                              onChange={(e) => {
                                setBranchGstBankName(e.target.value)
                                setBranchBankName(e.target.value)
                              }}
                              placeholder="e.g. ICICI Bank Ltd."
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={branchGstAccountHolder}
                              onChange={(e) => {
                                setBranchGstAccountHolder(e.target.value)
                                setBranchAccountHolder(e.target.value)
                              }}
                              placeholder="e.g. SAAMPARK TECHNOLOGY PVT LTD"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block font-semibold text-foreground mb-1">Bank Account Number *</label>
                            <input
                              type="text"
                              value={branchGstAccountNumber}
                              onChange={(e) => {
                                setBranchGstAccountNumber(e.target.value)
                                setBranchAccountNumber(e.target.value)
                              }}
                              placeholder="002105023910"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={branchGstIfscCode}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase()
                                setBranchGstIfscCode(val)
                                setBranchIfscCode(val)
                              }}
                              placeholder="ICIC0000021"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Branch Location</label>
                            <input
                              type="text"
                              value={branchGstBankBranch}
                              onChange={(e) => {
                                setBranchGstBankBranch(e.target.value)
                                setBranchBankBranch(e.target.value)
                              }}
                              placeholder="Salt Lake Sector V Branch"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Branch UPI VPA ID</label>
                            <input
                              type="text"
                              value={branchGstUpiId}
                              onChange={(e) => {
                                setBranchGstUpiId(e.target.value)
                                setBranchUpiId(e.target.value)
                              }}
                              placeholder="saampark.kolkata@icici"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* GST QR Code Upload */}
                        <div className="p-3.5 rounded-2xl bg-surface border border-border/70 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-foreground text-xs block">GST Payment QR Code</span>
                            <span className="text-[10px] text-muted-foreground block">
                              Upload a standalone payment QR code for GST billing.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {branchGstPaymentQrUrl && (
                              <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-border overflow-hidden shrink-0">
                                <img src={branchGstPaymentQrUrl} alt="QR Preview" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBranchGstPaymentQrUrl("")
                                    if (branchPaymentQrUrl === branchGstPaymentQrUrl) setBranchPaymentQrUrl("")
                                  }}
                                  className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full text-[8px]"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={branchGstQrInputRef}
                              onChange={handleBranchGstQrUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => branchGstQrInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                            >
                              Upload GST QR
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Branch Non-GST Profile */}
                    {branchBankProfileTab === "nongst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                            Branch Non-GST Invoices Bank Account & QR
                          </span>
                          <span className="text-[10px] text-muted-foreground">Used on Non-GST Invoices from this Branch</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Name *</label>
                            <input
                              type="text"
                              value={branchNongstBankName}
                              onChange={(e) => setBranchNongstBankName(e.target.value)}
                              placeholder="e.g. ICICI Bank Ltd."
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={branchNongstAccountHolder}
                              onChange={(e) => setBranchNongstAccountHolder(e.target.value)}
                              placeholder="e.g. SAAMPARK ENTERPRISE"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block font-semibold text-foreground mb-1">Bank Account Number *</label>
                            <input
                              type="text"
                              value={branchNongstAccountNumber}
                              onChange={(e) => setBranchNongstAccountNumber(e.target.value)}
                              placeholder="501004928172"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={branchNongstIfscCode}
                              onChange={(e) => setBranchNongstIfscCode(e.target.value.toUpperCase())}
                              placeholder="HDFC0001234"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Branch Location</label>
                            <input
                              type="text"
                              value={branchNongstBankBranch}
                              onChange={(e) => setBranchNongstBankBranch(e.target.value)}
                              placeholder="Main Market Branch"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Branch UPI VPA ID</label>
                            <input
                              type="text"
                              value={branchNongstUpiId}
                              onChange={(e) => setBranchNongstUpiId(e.target.value)}
                              placeholder="saampark.retail@okhdfcbank"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Non-GST QR Code Upload */}
                        <div className="p-3.5 rounded-2xl bg-surface border border-border/70 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-foreground text-xs block">Non-GST Payment QR Code</span>
                            <span className="text-[10px] text-muted-foreground block">
                              Upload a standalone payment QR code for Non-GST billing.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {branchNongstPaymentQrUrl && (
                              <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-border overflow-hidden shrink-0">
                                <img src={branchNongstPaymentQrUrl} alt="QR Preview" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => setBranchNongstPaymentQrUrl("")}
                                  className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full text-[8px]"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={branchNongstQrInputRef}
                              onChange={handleBranchNongstQrUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => branchNongstQrInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 cursor-pointer shadow-xs"
                            >
                              Upload Non-GST QR
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TAB 5: SIGNATURE & STAMP UPLOAD ── */}
                {branchModalTab === "signature" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Branch Signatory Name</label>
                        <input
                          type="text"
                          value={branchSignatoryName}
                          onChange={(e) => setBranchSignatoryName(e.target.value)}
                          placeholder="e.g. Subir Karmakar"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Signatory Designation</label>
                        <input
                          type="text"
                          value={branchSignatoryDesignation}
                          onChange={(e) => setBranchSignatoryDesignation(e.target.value)}
                          placeholder="e.g. Branch Head & Authorized Signatory"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Signature Upload Card */}
                      <div className="p-4 rounded-2xl bg-surface-pressed/30 border border-border/80 flex flex-col items-center justify-center text-center space-y-2">
                        <span className="font-bold text-xs text-foreground">Digital Signature</span>
                        <div className="w-full h-24 rounded-xl bg-surface border border-dashed border-border flex items-center justify-center p-2 relative overflow-hidden">
                          {branchSignatureImageUrl ? (
                            <>
                              <img src={branchSignatureImageUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setBranchSignatureImageUrl("")}
                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full cursor-pointer shadow-xs"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No signature uploaded</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={branchSignatureInputRef}
                          onChange={handleBranchSignatureUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => branchSignatureInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                        >
                          Upload Signature Image
                        </button>
                      </div>

                      {/* Stamp Upload Card */}
                      <div className="p-4 rounded-2xl bg-surface-pressed/30 border border-border/80 flex flex-col items-center justify-center text-center space-y-2">
                        <span className="font-bold text-xs text-foreground">Branch Official Stamp / Seal</span>
                        <div className="w-full h-24 rounded-xl bg-surface border border-dashed border-border flex items-center justify-center p-2 relative overflow-hidden">
                          {branchStampImageUrl ? (
                            <>
                              <img src={branchStampImageUrl} alt="Stamp" className="max-h-full max-w-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setBranchStampImageUrl("")}
                                className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full cursor-pointer shadow-xs"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No seal uploaded</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={branchStampInputRef}
                          onChange={handleBranchStampUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => branchStampInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                        >
                          Upload Official Seal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                {(() => {
                  const currentBranchTabIndex = BRANCH_TABS_LIST.indexOf(branchModalTab)
                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border/60 gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Sparkles size={13} className="text-amber-500 shrink-0" />
                        <span>Step {currentBranchTabIndex + 1} of 5 • Branch Profile Configuration</span>
                      </div>

                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsBranchModalOpen(false)}
                          className="px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground font-semibold cursor-pointer text-xs"
                        >
                          Cancel
                        </button>

                        {currentBranchTabIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => setBranchModalTab(BRANCH_TABS_LIST[currentBranchTabIndex - 1])}
                            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                            <span>Back</span>
                          </button>
                        )}

                        {currentBranchTabIndex < BRANCH_TABS_LIST.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setBranchModalTab(BRANCH_TABS_LIST[currentBranchTabIndex + 1])}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-primary/90 cursor-pointer"
                          >
                            <span>Next</span>
                            <ChevronRight size={14} />
                          </button>
                        )}

                        <button
                          type="submit"
                          className="px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>{editingBranch ? "Save Branch Hub" : "Create Branch Hub"}</span>
                        </button>
                      </div>
                    </div>
                  )
                })()}
              </form>
            </motion.div>
          </div>
        )}
    </>
  );
}
