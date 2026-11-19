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

export function CompanyBranchSettingsSection3({ ctrl }: { ctrl: any }) {
  const { isSubBranchModalOpen, editingSubBranch, setIsSubBranchModalOpen, setSubBranchModalTab, subBranchModalTab, handleSaveSubBranch, subBranchParentBranchId, setSubBranchParentBranchId, branches, setSubBranchCompanyId, subBranchName, setSubBranchName, subBranchCode, setSubBranchCode, subBranchRevenueSharePct, setSubBranchRevenueSharePct, subBranchPartnerName, setSubBranchPartnerName, subBranchPartnerPhone, setSubBranchPartnerPhone, subBranchPartnerType, setSubBranchPartnerType, subBranchLogoInputRef, handleSubBranchLogoUpload, subBranchLogoUrl, setSubBranchLogoUrl, subBranchGstin, setSubBranchGstin, subBranchPan, setSubBranchPan, subBranchCin, setSubBranchCin, subBranchMsmeReg, setSubBranchMsmeReg, subBranchAddress, setSubBranchAddress, subBranchCity, setSubBranchCity, subBranchState, setSubBranchState, subBranchZip, setSubBranchZip, subBranchEmail, setSubBranchEmail, subBranchPhone, setSubBranchPhone, setSubBranchBankProfileTab, subBranchBankProfileTab, handleCopySubBranchGstToNongst, subBranchGstBankName, setSubBranchGstBankName, setSubBranchBankName, subBranchGstAccountHolder, setSubBranchGstAccountHolder, setSubBranchAccountHolder, subBranchGstAccountNumber, setSubBranchGstAccountNumber, setSubBranchAccountNumber, subBranchGstIfscCode, setSubBranchGstIfscCode, setSubBranchIfscCode, subBranchGstBankBranch, setSubBranchGstBankBranch, setSubBranchBankBranch, subBranchGstUpiId, setSubBranchGstUpiId, setSubBranchUpiId, subBranchGstPaymentQrUrl, setSubBranchGstPaymentQrUrl, subBranchPaymentQrUrl, setSubBranchPaymentQrUrl, subBranchGstQrInputRef, handleSubBranchGstQrUpload, subBranchNongstBankName, setSubBranchNongstBankName, subBranchNongstAccountHolder, setSubBranchNongstAccountHolder, subBranchNongstAccountNumber, setSubBranchNongstAccountNumber, subBranchNongstIfscCode, setSubBranchNongstIfscCode, subBranchNongstBankBranch, setSubBranchNongstBankBranch, subBranchNongstUpiId, setSubBranchNongstUpiId, subBranchNongstPaymentQrUrl, setSubBranchNongstPaymentQrUrl, subBranchNongstQrInputRef, handleSubBranchNongstQrUpload, subBranchSignatoryName, setSubBranchSignatoryName, subBranchSignatoryDesignation, setSubBranchSignatoryDesignation, subBranchSignatureImageUrl, setSubBranchSignatureImageUrl, subBranchSignatureInputRef, handleSubBranchSignatureUpload, subBranchStampImageUrl, setSubBranchStampImageUrl, subBranchStampInputRef, handleSubBranchStampUpload, SUB_BRANCH_TABS_LIST } = ctrl;
  return (
    <>
      {isSubBranchModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-2xl bg-surface border border-border rounded-3xl p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    🌿
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      {editingSubBranch ? `Edit Sub-Branch: ${editingSubBranch.name}` : "Add Sub-Branch (Partner / Franchise Hub)"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Manage percentage revenue split, legal IDs, contacts, settlement bank details, and digital signatures
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSubBranchModalOpen(false)}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* 5 Tab Navigation Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-pressed/30 rounded-2xl border border-border/80 overflow-x-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setSubBranchModalTab("basic")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    subBranchModalTab === "basic"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 size={13} />
                  <span>1. Identity & Split</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubBranchModalTab("tax")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    subBranchModalTab === "tax"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={13} />
                  <span>2. Tax & Legal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubBranchModalTab("contact")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    subBranchModalTab === "contact"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin size={13} />
                  <span>3. Address</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubBranchModalTab("bank")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    subBranchModalTab === "bank"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>4. Payout & Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubBranchModalTab("signature")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    subBranchModalTab === "signature"
                      ? "bg-surface text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shield size={13} />
                  <span>5. Signature & Stamp</span>
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveSubBranch} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
                
                {/* ── TAB 1: IDENTITY & REVENUE SPLIT ── */}
                {subBranchModalTab === "basic" && (
                  <div className="space-y-3.5">
                    {/* Parent Branch Selection */}
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Parent Operating Branch *</label>
                      <select
                        value={subBranchParentBranchId}
                        onChange={(e) => {
                          setSubBranchParentBranchId(e.target.value)
                          const pb = branches.find(b => b.id === e.target.value)
                          if (pb) setSubBranchCompanyId(pb.companyId)
                        }}
                        required
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground focus:outline-hidden focus:border-primary"
                      >
                        <option value="" disabled>Select Parent Branch</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>
                            🏢 {b.name} {b.city ? `(${b.city})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Sub-Branch Name *</label>
                        <input
                          type="text"
                          required
                          value={subBranchName}
                          onChange={(e) => setSubBranchName(e.target.value)}
                          placeholder="e.g. Durgapur City Center Sub-Branch"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Sub-Branch Code *</label>
                        <input
                          type="text"
                          value={subBranchCode}
                          onChange={(e) => setSubBranchCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SB-DGP-01"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* ── PERCENTAGE REVENUE SPLIT SLIDER ── */}
                    <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                            <span>🪙 Revenue Share Split (% Wise)</span>
                          </span>
                          <p className="text-[10px] text-muted-foreground">
                            Sub-Branch operates as a percentage partner; earnings auto-calculated on each invoice
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {subBranchRevenueSharePct}% Partner
                          </span>
                          <span className="text-[10px] text-muted-foreground block">
                            / {100 - subBranchRevenueSharePct}% Company
                          </span>
                        </div>
                      </div>

                      {/* Slider Control */}
                      <div className="space-y-1">
                        <input
                          type="range"
                          min={1}
                          max={95}
                          step={1}
                          value={subBranchRevenueSharePct}
                          onChange={(e) => setSubBranchRevenueSharePct(Number(e.target.value))}
                          className="w-full accent-emerald-600 h-2 bg-emerald-200 dark:bg-emerald-900 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[9.5px] font-mono text-muted-foreground">
                          <span>1% (Referral)</span>
                          <span>30% (Franchise)</span>
                          <span>50% (50-50 JV)</span>
                          <span>90% (Principal)</span>
                        </div>
                      </div>

                      {/* Visual Split Bar */}
                      <div className="h-3 rounded-full overflow-hidden flex shadow-inner bg-zinc-200 dark:bg-zinc-800">
                        <div
                          style={{ width: `${subBranchRevenueSharePct}%` }}
                          className="bg-emerald-500 text-[9px] font-bold text-white flex items-center justify-center overflow-hidden transition-all"
                        >
                          {subBranchRevenueSharePct >= 15 ? `${subBranchRevenueSharePct}% Partner` : ""}
                        </div>
                        <div
                          style={{ width: `${100 - subBranchRevenueSharePct}%` }}
                          className="bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center overflow-hidden transition-all"
                        >
                          {100 - subBranchRevenueSharePct >= 15 ? `${100 - subBranchRevenueSharePct}% Company Retained` : ""}
                        </div>
                      </div>
                    </div>

                    {/* Partner Details */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner / Owner Name</label>
                        <input
                          type="text"
                          value={subBranchPartnerName}
                          onChange={(e) => setSubBranchPartnerName(e.target.value)}
                          placeholder="e.g. Subrata Mukherjee"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner Phone</label>
                        <input
                          type="text"
                          value={subBranchPartnerPhone}
                          onChange={(e) => setSubBranchPartnerPhone(e.target.value)}
                          placeholder="+91 98765 00000"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner Entity Type</label>
                        <select
                          value={subBranchPartnerType}
                          onChange={(e) => setSubBranchPartnerType(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        >
                          <option value="Franchise Partner">Franchise Partner</option>
                          <option value="Agency Partner">Agency Partner</option>
                          <option value="Satellite Office">Satellite Office</option>
                          <option value="Regional Associate">Regional Associate</option>
                        </select>
                      </div>
                    </div>

                    {/* Sub-Branch Partner Logo Upload */}
                    <div className="p-3.5 rounded-2xl bg-surface-hover/50 border border-border space-y-2">
                      <label className="block font-bold text-foreground text-xs">
                        Sub-Branch Partner Logo / Brand Mark
                      </label>
                      <input 
                        type="file" 
                        ref={subBranchLogoInputRef}
                        accept="image/*"
                        onChange={handleSubBranchLogoUpload}
                        className="hidden" 
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => subBranchLogoInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        >
                          <UploadCloud size={13} />
                          <span>Upload Partner Logo</span>
                        </button>
                        {subBranchLogoUrl && (
                          <button
                            type="button"
                            onClick={() => setSubBranchLogoUrl("")}
                            className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={subBranchLogoUrl}
                        onChange={(e) => setSubBranchLogoUrl(e.target.value)}
                        placeholder="Or paste direct image URL (e.g. https://...)"
                        className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                {/* ── TAB 2: TAX & LEGAL IDS ── */}
                {subBranchModalTab === "tax" && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Sub-Branch GSTIN</label>
                        <input
                          type="text"
                          value={subBranchGstin}
                          onChange={(e) => setSubBranchGstin(e.target.value.toUpperCase())}
                          placeholder="e.g. 19ABCDE1234F1Z5"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner PAN</label>
                        <input
                          type="text"
                          value={subBranchPan}
                          onChange={(e) => setSubBranchPan(e.target.value.toUpperCase())}
                          placeholder="e.g. ABCDE1234F"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">CIN / Registration No.</label>
                        <input
                          type="text"
                          value={subBranchCin}
                          onChange={(e) => setSubBranchCin(e.target.value)}
                          placeholder="e.g. U72200WB2023PTC123456"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">MSME Udyam No.</label>
                        <input
                          type="text"
                          value={subBranchMsmeReg}
                          onChange={(e) => setSubBranchMsmeReg(e.target.value)}
                          placeholder="e.g. UDYAM-WB-10-0012345"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 3: ADDRESS & CONTACTS ── */}
                {subBranchModalTab === "contact" && (
                  <div className="space-y-3.5">
                    <div>
                      <label className="block font-semibold text-foreground mb-1">Physical Address</label>
                      <input
                        type="text"
                        value={subBranchAddress}
                        onChange={(e) => setSubBranchAddress(e.target.value)}
                        placeholder="e.g. City Center Mall, Ground Floor, Durgapur"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">City / Region</label>
                        <input
                          type="text"
                          value={subBranchCity}
                          onChange={(e) => setSubBranchCity(e.target.value)}
                          placeholder="e.g. Durgapur"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">State</label>
                        <input
                          type="text"
                          value={subBranchState}
                          onChange={(e) => setSubBranchState(e.target.value)}
                          placeholder="e.g. West Bengal"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={subBranchZip}
                          onChange={(e) => setSubBranchZip(e.target.value)}
                          placeholder="713216"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner Email</label>
                        <input
                          type="email"
                          value={subBranchEmail}
                          onChange={(e) => setSubBranchEmail(e.target.value)}
                          placeholder="partner@saampark.in"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner Phone / Hotline</label>
                        <input
                          type="text"
                          value={subBranchPhone}
                          onChange={(e) => setSubBranchPhone(e.target.value)}
                          placeholder="+91 98765 00000"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── TAB 4: BANK & UPI PAY (DUAL GST & NON-GST PROFILES) ── */}
                {subBranchModalTab === "bank" && (
                  <div className="space-y-3.5">
                    {/* Dual Profile Switcher Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-surface-hover/60 border border-border">
                      <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border/80">
                        <button
                          type="button"
                          onClick={() => setSubBranchBankProfileTab("gst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            subBranchBankProfileTab === "gst"
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CreditCard size={13} />
                          <span>GST Invoice Bank Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubBranchBankProfileTab("nongst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            subBranchBankProfileTab === "nongst"
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
                        onClick={handleCopySubBranchGstToNongst}
                        className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        title="Copy details from GST profile into Non-GST profile"
                      >
                        <Sparkles size={12} className="text-primary" />
                        <span>Copy GST to Non-GST</span>
                      </button>
                    </div>

                    {/* Sub-Branch GST Profile */}
                    {subBranchBankProfileTab === "gst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                            Sub-Branch GST Invoices Bank Account & QR
                          </span>
                          <span className="text-[10px] text-muted-foreground">Used on GST Invoices from this Sub-Branch</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Name *</label>
                            <input
                              type="text"
                              value={subBranchGstBankName}
                              onChange={(e) => {
                                setSubBranchGstBankName(e.target.value)
                                setSubBranchBankName(e.target.value)
                              }}
                              placeholder="e.g. HDFC Bank Ltd."
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={subBranchGstAccountHolder}
                              onChange={(e) => {
                                setSubBranchGstAccountHolder(e.target.value)
                                setSubBranchAccountHolder(e.target.value)
                              }}
                              placeholder="Partner Account Name"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-semibold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block font-semibold text-foreground mb-1">Bank Account Number *</label>
                            <input
                              type="text"
                              value={subBranchGstAccountNumber}
                              onChange={(e) => {
                                setSubBranchGstAccountNumber(e.target.value)
                                setSubBranchAccountNumber(e.target.value)
                              }}
                              placeholder="Account Number"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={subBranchGstIfscCode}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase()
                                setSubBranchGstIfscCode(val)
                                setSubBranchIfscCode(val)
                              }}
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
                              value={subBranchGstBankBranch}
                              onChange={(e) => {
                                setSubBranchGstBankBranch(e.target.value)
                                setSubBranchBankBranch(e.target.value)
                              }}
                              placeholder="Local Branch"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Partner UPI ID</label>
                            <input
                              type="text"
                              value={subBranchGstUpiId}
                              onChange={(e) => {
                                setSubBranchGstUpiId(e.target.value)
                                setSubBranchUpiId(e.target.value)
                              }}
                              placeholder="partner@okhdfcbank"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Sub-Branch GST QR Code Upload */}
                        <div className="p-3.5 rounded-2xl bg-surface border border-border/70 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-foreground text-xs block">GST Payment QR Code</span>
                            <span className="text-[10px] text-muted-foreground block">
                              Upload a standalone payment QR code for GST billing.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {subBranchGstPaymentQrUrl && (
                              <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-border overflow-hidden shrink-0">
                                <img src={subBranchGstPaymentQrUrl} alt="QR Preview" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSubBranchGstPaymentQrUrl("")
                                    if (subBranchPaymentQrUrl === subBranchGstPaymentQrUrl) setSubBranchPaymentQrUrl("")
                                  }}
                                  className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full text-[8px]"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={subBranchGstQrInputRef}
                              onChange={handleSubBranchGstQrUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => subBranchGstQrInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                            >
                              Upload GST QR
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sub-Branch Non-GST Profile */}
                    {subBranchBankProfileTab === "nongst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                            Sub-Branch Non-GST Invoices Bank Account & QR
                          </span>
                          <span className="text-[10px] text-muted-foreground">Used on Non-GST Invoices from this Sub-Branch</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Name *</label>
                            <input
                              type="text"
                              value={subBranchNongstBankName}
                              onChange={(e) => setSubBranchNongstBankName(e.target.value)}
                              placeholder="e.g. State Bank of India"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={subBranchNongstAccountHolder}
                              onChange={(e) => setSubBranchNongstAccountHolder(e.target.value)}
                              placeholder="e.g. Partner Retail Account"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="block font-semibold text-foreground mb-1">Bank Account Number *</label>
                            <input
                              type="text"
                              value={subBranchNongstAccountNumber}
                              onChange={(e) => setSubBranchNongstAccountNumber(e.target.value)}
                              placeholder="Account Number"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={subBranchNongstIfscCode}
                              onChange={(e) => setSubBranchNongstIfscCode(e.target.value.toUpperCase())}
                              placeholder="SBIN0001234"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Bank Branch Location</label>
                            <input
                              type="text"
                              value={subBranchNongstBankBranch}
                              onChange={(e) => setSubBranchNongstBankBranch(e.target.value)}
                              placeholder="Local Branch Location"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <label className="block font-semibold text-foreground mb-1">Partner UPI ID</label>
                            <input
                              type="text"
                              value={subBranchNongstUpiId}
                              onChange={(e) => setSubBranchNongstUpiId(e.target.value)}
                              placeholder="partner.retail@oksbi"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>

                        {/* Sub-Branch Non-GST QR Code Upload */}
                        <div className="p-3.5 rounded-2xl bg-surface border border-border/70 flex items-center justify-between gap-4">
                          <div>
                            <span className="font-bold text-foreground text-xs block">Non-GST Payment QR Code</span>
                            <span className="text-[10px] text-muted-foreground block">
                              Upload a standalone payment QR code for Non-GST billing.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {subBranchNongstPaymentQrUrl && (
                              <div className="relative w-12 h-12 rounded-xl bg-white p-1 border border-border overflow-hidden shrink-0">
                                <img src={subBranchNongstPaymentQrUrl} alt="QR Preview" className="w-full h-full object-contain" />
                                <button
                                  type="button"
                                  onClick={() => setSubBranchNongstPaymentQrUrl("")}
                                  className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full text-[8px]"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              ref={subBranchNongstQrInputRef}
                              onChange={handleSubBranchNongstQrUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => subBranchNongstQrInputRef.current?.click()}
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

                {/* ── TAB 5: SIGNATURE & STAMP ── */}
                {subBranchModalTab === "signature" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Partner Signatory Name</label>
                        <input
                          type="text"
                          value={subBranchSignatoryName}
                          onChange={(e) => setSubBranchSignatoryName(e.target.value)}
                          placeholder="e.g. Subrata Mukherjee"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">Designation</label>
                        <input
                          type="text"
                          value={subBranchSignatoryDesignation}
                          onChange={(e) => setSubBranchSignatoryDesignation(e.target.value)}
                          placeholder="e.g. Managing Partner / Franchise Head"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      {/* Signature Upload */}
                      <div className="p-4 rounded-2xl bg-surface-pressed/30 border border-border/80 flex flex-col items-center justify-center text-center space-y-2">
                        <span className="font-bold text-xs text-foreground">Partner Signature</span>
                        <div className="w-full h-24 rounded-xl bg-surface border border-dashed border-border flex items-center justify-center p-2 relative overflow-hidden">
                          {subBranchSignatureImageUrl ? (
                            <>
                              <img src={subBranchSignatureImageUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setSubBranchSignatureImageUrl("")}
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
                          ref={subBranchSignatureInputRef}
                          onChange={handleSubBranchSignatureUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => subBranchSignatureInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                        >
                          Upload Signature
                        </button>
                      </div>

                      {/* Stamp Upload */}
                      <div className="p-4 rounded-2xl bg-surface-pressed/30 border border-border/80 flex flex-col items-center justify-center text-center space-y-2">
                        <span className="font-bold text-xs text-foreground">Partner Seal / Stamp</span>
                        <div className="w-full h-24 rounded-xl bg-surface border border-dashed border-border flex items-center justify-center p-2 relative overflow-hidden">
                          {subBranchStampImageUrl ? (
                            <>
                              <img src={subBranchStampImageUrl} alt="Stamp" className="max-h-full max-w-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setSubBranchStampImageUrl("")}
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
                          ref={subBranchStampInputRef}
                          onChange={handleSubBranchStampUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => subBranchStampInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 cursor-pointer shadow-xs"
                        >
                          Upload Seal
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                {(() => {
                  const currentSbTabIndex = SUB_BRANCH_TABS_LIST.indexOf(subBranchModalTab)
                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border/60 gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <Sparkles size={13} className="text-emerald-500 shrink-0" />
                        <span>Step {currentSbTabIndex + 1} of 5 • Partner Agreement Configuration</span>
                      </div>

                      <div className="flex items-center gap-2 justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsSubBranchModalOpen(false)}
                          className="px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground font-semibold cursor-pointer text-xs"
                        >
                          Cancel
                        </button>

                        {currentSbTabIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => setSubBranchModalTab(SUB_BRANCH_TABS_LIST[currentSbTabIndex - 1])}
                            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                            <span>Back</span>
                          </button>
                        )}

                        {currentSbTabIndex < SUB_BRANCH_TABS_LIST.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setSubBranchModalTab(SUB_BRANCH_TABS_LIST[currentSbTabIndex + 1])}
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
                          <span>{editingSubBranch ? "Save Sub-Branch" : "Register Sub-Branch"}</span>
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
