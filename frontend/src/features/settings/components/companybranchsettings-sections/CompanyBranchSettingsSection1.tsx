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

export function CompanyBranchSettingsSection1({ ctrl }: { ctrl: any }) {
  const { isCompanyModalOpen, isSuperAdmin, companyLogoUrl, companyLogo, editingCompany, setIsCompanyModalOpen, setCompanyModalTab, companyModalTab, handleSaveCompany, companyBrandName, companyDivisionName, companySubtitle, updateBrandOrDivision, setCompanySubtitle, logoFileInputRef, handleLogoUpload, setCompanyLogoUrl, companySlug, setCompanySlug, companyCurrency, setCompanyCurrency, companyCurrencySymbol, setCompanyCurrencySymbol, companySignatureImageUrl, companySignatoryName, companySignatoryDesignation, companyStampImageUrl, signatureFileInputRef, handleSignatureUpload, setCompanySignatureImageUrl, companyStampInputRef, handleCompanyStampUpload, setCompanyStampImageUrl, setCompanySignatoryName, setCompanySignatoryDesignation, companyTermsConditions, setCompanyTermsConditions, companyCin, setCompanyCin, companyGstin, setCompanyGstin, companyPan, setCompanyPan, companyAddress, setCompanyAddress, companyPhone, setCompanyPhone, companyEmail, setCompanyEmail, companyWebsite, setCompanyWebsite, setCompanyBankProfileTab, companyBankProfileTab, handleCopyCompanyGstToNongst, companyGstBankName, setCompanyGstBankName, setCompanyBankName, companyGstAccountHolder, setCompanyGstAccountHolder, setCompanyAccountHolder, companyGstAccountNumber, setCompanyGstAccountNumber, setCompanyAccountNumber, companyGstIfscCode, setCompanyGstIfscCode, setCompanyIfscCode, companyGstBankBranch, setCompanyGstBankBranch, setCompanyBankBranch, companyGstUpiId, setCompanyGstUpiId, setCompanyUpiId, companyGstPaymentQrUrl, companyGstQrInputRef, handleCompanyGstQrUpload, setCompanyGstPaymentQrUrl, companyPaymentQrUrl, setCompanyPaymentQrUrl, companyNongstBankName, setCompanyNongstBankName, companyNongstAccountHolder, setCompanyNongstAccountHolder, companyNongstAccountNumber, setCompanyNongstAccountNumber, companyNongstIfscCode, setCompanyNongstIfscCode, companyNongstBankBranch, setCompanyNongstBankBranch, companyNongstUpiId, setCompanyNongstUpiId, companyNongstPaymentQrUrl, companyNongstQrInputRef, handleCompanyNongstQrUpload, setCompanyNongstPaymentQrUrl, companyName, handleApplyCompanyPreset, companySmtpPreset, companySmtpHost, setCompanySmtpHost, companySmtpPort, setCompanySmtpPort, setCompanySmtpSecure, companySmtpSecure, companySmtpUser, setCompanySmtpUser, companySmtpFromEmail, setCompanySmtpFromEmail, companyTestEmail, setCompanyTestEmail, setShowCompanySmtpPass, showCompanySmtpPass, companySmtpPass, setCompanySmtpPass, companySmtpFromName, setCompanySmtpFromName, isTestingCompanySmtp, handleTestCompanySmtp, companySmtpTestResult, setCompanyEnabledModulesState, companyEnabledModulesState, COMPANY_TABS_LIST } = ctrl;
  return (
    <>
      {isCompanyModalOpen && isSuperAdmin && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-surface p-6 rounded-3xl border border-border shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 border border-border flex items-center justify-center text-xl shrink-0 overflow-hidden">
                    {companyLogoUrl ? (
                      <img src={companyLogoUrl} alt="Logo" className="w-7 h-7 object-contain" />
                    ) : (
                      companyLogo || "🏢"
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">
                      {editingCompany ? `Configure Entity: ${editingCompany.name}` : "Configure Company Details"}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Customize branding names (e.g. SAAMPARK + Technology/Consultancy), upload official signatures & stamps, and invoice settings.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-hover rounded-2xl border border-border shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCompanyModalTab("basic")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "basic"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 size={13} />
                  <span>1. Brand & Division Names</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalTab("invoice")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "invoice"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={13} />
                  <span>2. Signature & Stamp Upload</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalTab("tax")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "tax"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shield size={13} />
                  <span>3. Legal & Tax IDs</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalTab("contact")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "contact"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin size={13} />
                  <span>4. Address & Contacts</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalTab("bank")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "bank"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard size={13} />
                  <span>5. Bank & UPI Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCompanyModalTab("smtp")}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    companyModalTab === "smtp"
                      ? "bg-surface text-primary shadow-xs border border-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail size={13} />
                  <span>6. SMTP Email Dispatch</span>
                </button>

                {isSuperAdmin && (
                  <button
                    type="button"
                    onClick={() => setCompanyModalTab("modules")}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                      companyModalTab === "modules"
                        ? "bg-surface text-primary shadow-xs border border-primary/20"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Layers size={13} />
                    <span>7. Enabled Modules (Super Admin)</span>
                  </button>
                )}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveCompany} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
                {/* TAB 1: BRANDING & STRUCTURED NAME */}
                {companyModalTab === "basic" && (
                  <div className="space-y-4">
                    {/* Live Brand Header Preview Box */}
                    <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                        Live Invoice Header Preview:
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-800 border border-border flex items-center justify-center text-xl overflow-hidden shrink-0">
                          {companyLogoUrl ? (
                            <img src={companyLogoUrl} alt="Logo" className="w-9 h-9 object-contain" />
                          ) : (
                            companyLogo || "🏢"
                          )}
                        </div>
                        <div>
                          <div className="text-base font-black tracking-tight leading-none text-foreground flex items-center gap-1.5 flex-wrap">
                            <span className="text-primary">{companyBrandName || "SAAMPARK"}</span>
                            {companyDivisionName?.trim() && (
                              <span className="text-foreground">{companyDivisionName.trim()}</span>
                            )}
                          </div>
                          {companySubtitle?.trim() && (
                            <div className="text-[11px] font-bold text-muted-foreground tracking-wider mt-1">
                              {companySubtitle.trim()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-foreground mb-1">
                          Main Brand Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={companyBrandName}
                          onChange={(e) => updateBrandOrDivision(e.target.value, companyDivisionName)}
                          placeholder="e.g. SAAMPARK or Saampark"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs focus:outline-hidden focus:border-primary font-bold text-foreground"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Brand prefix (e.g. SAAMPARK, Saampark, etc.)</p>
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">
                          Division / Business Unit (Optional)
                        </label>
                        <input
                          type="text"
                          value={companyDivisionName}
                          onChange={(e) => updateBrandOrDivision(companyBrandName, e.target.value)}
                          placeholder="e.g. Technology, Consultancy, Digital Marketing (Optional)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs focus:outline-hidden focus:border-primary font-bold text-foreground"
                        />
                        <p className="text-[10px] text-muted-foreground mt-0.5">Leave blank if this company has no separate division</p>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-foreground mb-1">
                          Legal Suffix / Tagline (Appears under title in Invoice)
                        </label>
                        <input
                          type="text"
                          value={companySubtitle}
                          onChange={(e) => setCompanySubtitle(e.target.value)}
                          placeholder="e.g. AND RESEARCH PRIVATE LIMITED or Consultancy Services (Leave blank if none)"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      {/* Logo File Upload Section */}
                      <div className="sm:col-span-2 p-3 rounded-2xl bg-surface-hover/50 border border-border space-y-2">
                        <label className="block font-bold text-foreground">
                          Company Logo / Crest Image
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                            {companyLogoUrl ? (
                              <img src={companyLogoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                            ) : (
                              <span className="text-2xl">{companyLogo || "🏢"}</span>
                            )}
                          </div>
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <input 
                              type="file" 
                              ref={logoFileInputRef}
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden" 
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => logoFileInputRef.current?.click()}
                                className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                              >
                                <UploadCloud size={13} />
                                <span>Upload Logo Image</span>
                              </button>
                              {companyLogoUrl && (
                                <button
                                  type="button"
                                  onClick={() => setCompanyLogoUrl("")}
                                  className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                                >
                                  Clear Image
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={companyLogoUrl}
                              onChange={(e) => setCompanyLogoUrl(e.target.value)}
                              placeholder="Or paste direct image URL (e.g. /saampark-logo.png)"
                              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">Company Slug / Identifier</label>
                        <input
                          type="text"
                          value={companySlug}
                          onChange={(e) => setCompanySlug(e.target.value)}
                          placeholder="e.g. consultancy, tech"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-foreground mb-1">Currency Code</label>
                          <input
                            type="text"
                            value={companyCurrency}
                            onChange={(e) => setCompanyCurrency(e.target.value)}
                            placeholder="INR"
                            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs text-center font-bold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-foreground mb-1">Currency Symbol</label>
                          <input
                            type="text"
                            value={companyCurrencySymbol}
                            onChange={(e) => setCompanyCurrencySymbol(e.target.value)}
                            placeholder="₹"
                            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: SIGNATURE & STAMP UPLOAD */}
                {companyModalTab === "invoice" && (
                  <div className="space-y-4">
                    {/* Live Signature & Stamp Preview Card */}
                    <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
                      <span className="text-[10.5px] font-bold text-primary uppercase tracking-wider block">
                        Official Company Signature & Stamp Preview:
                      </span>
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 gap-4 flex-wrap">
                        <div className="flex items-center gap-6">
                          {/* Signature Line */}
                          <div className="text-center space-y-1">
                            <div className="h-12 flex items-end justify-center">
                              {companySignatureImageUrl ? (
                                <img 
                                  src={companySignatureImageUrl} 
                                  alt="Signature" 
                                  className="max-h-12 max-w-[150px] object-contain drop-shadow-sm" 
                                />
                              ) : (
                                <span className="font-serif italic text-zinc-400 text-xs">
                                  No Signature Uploaded
                                </span>
                              )}
                            </div>
                            <div className="w-40 border-t border-zinc-400 pt-0.5">
                              <p className="text-[8.5px] font-black uppercase text-zinc-800">
                                {companySignatoryName || "AUTHORISED SIGNATORY"}
                              </p>
                              {companySignatoryDesignation && (
                                <p className="text-[8px] text-zinc-500 font-medium">
                                  {companySignatoryDesignation}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Stamp Preview */}
                          <div className="text-center space-y-1 border-l border-border/60 pl-6">
                            <div className="h-12 flex items-center justify-center">
                              {companyStampImageUrl ? (
                                <img 
                                  src={companyStampImageUrl} 
                                  alt="Seal" 
                                  className="max-h-12 max-w-[80px] object-contain drop-shadow-sm" 
                                />
                              ) : (
                                <span className="font-serif italic text-zinc-400 text-xs">
                                  No Seal Uploaded
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] text-zinc-400 uppercase font-semibold">Official Seal</p>
                          </div>
                        </div>

                        <div className="text-[11px] text-muted-foreground max-w-[260px]">
                          <p>Configured at Company level. Automatically stamped on all official invoices, quotations, and corporate documents.</p>
                        </div>
                      </div>
                    </div>

                    {/* Signature & Stamp Upload Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Signature Upload */}
                      <div className="p-3.5 rounded-2xl bg-surface-hover/50 border border-border space-y-2">
                        <label className="block font-bold text-foreground text-xs">
                          Company Authorized Signature
                        </label>
                        <input 
                          type="file" 
                          ref={signatureFileInputRef}
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden" 
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => signatureFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <UploadCloud size={13} />
                            <span>Upload Signature</span>
                          </button>
                          {companySignatureImageUrl && (
                            <button
                              type="button"
                              onClick={() => setCompanySignatureImageUrl("")}
                              className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={companySignatureImageUrl}
                          onChange={(e) => setCompanySignatureImageUrl(e.target.value)}
                          placeholder="Or paste direct image link..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                        />
                      </div>

                      {/* Stamp Upload */}
                      <div className="p-3.5 rounded-2xl bg-surface-hover/50 border border-border space-y-2">
                        <label className="block font-bold text-foreground text-xs">
                          Company Official Stamp / Seal
                        </label>
                        <input 
                          type="file" 
                          ref={companyStampInputRef}
                          accept="image/*"
                          onChange={handleCompanyStampUpload}
                          className="hidden" 
                        />
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => companyStampInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <UploadCloud size={13} />
                            <span>Upload Seal / Stamp</span>
                          </button>
                          {companyStampImageUrl && (
                            <button
                              type="button"
                              onClick={() => setCompanyStampImageUrl("")}
                              className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={companyStampImageUrl}
                          onChange={(e) => setCompanyStampImageUrl(e.target.value)}
                          placeholder="Or paste direct image link..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-foreground mb-1">Company Signatory Name / Title</label>
                        <input
                          type="text"
                          value={companySignatoryName}
                          onChange={(e) => setCompanySignatoryName(e.target.value)}
                          placeholder="e.g. Authorized Signatory"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">Signatory Designation</label>
                        <input
                          type="text"
                          value={companySignatoryDesignation}
                          onChange={(e) => setCompanySignatoryDesignation(e.target.value)}
                          placeholder="e.g. Managing Director / CEO"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-foreground mb-1">Default Terms & Conditions (Multiline)</label>
                        <textarea
                          rows={3}
                          value={companyTermsConditions}
                          onChange={(e) => setCompanyTermsConditions(e.target.value)}
                          placeholder="1. E.& O.E.&#10;2. Payment due within invoice due date.&#10;3. All disputes subject to jurisdiction."
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: LEGAL & TAX CREDENTIALS */}
                {companyModalTab === "tax" && (
                  <div className="space-y-3">
                    <p className="text-[11px] text-muted-foreground">
                      These numbers appear on official tax invoices. If left empty, that specific badge/row will remain completely blank.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-foreground mb-1">CIN (Corporate Identification Number)</label>
                        <input
                          type="text"
                          value={companyCin}
                          onChange={(e) => setCompanyCin(e.target.value)}
                          placeholder="e.g. U72900WB2024PTC271234 (Leave blank if none)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-mono uppercase focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">GSTIN / Tax ID Number</label>
                        <input
                          type="text"
                          value={companyGstin}
                          onChange={(e) => setCompanyGstin(e.target.value)}
                          placeholder="e.g. 19ABFCS1234D1ZS (Leave blank if none)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-mono uppercase focus:outline-hidden focus:border-primary"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-foreground mb-1">PAN Number</label>
                        <input
                          type="text"
                          value={companyPan}
                          onChange={(e) => setCompanyPan(e.target.value)}
                          placeholder="e.g. ABFCS1234D (Leave blank if none)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border text-xs font-mono uppercase focus:outline-hidden focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: REGISTERED OFFICE & CONTACTS */}
                {companyModalTab === "contact" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block font-bold text-foreground mb-1">Registered Office Address (Printed on Invoice Header)</label>
                      <textarea
                        rows={2}
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="e.g. Madinipur, Kolkata, Durgapur, West Bengal, India - 721101 (Leave blank to omit address block)"
                        className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-foreground mb-1">Support / Billing Phone(s)</label>
                        <input
                          type="text"
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value)}
                          placeholder="+91 9901518567 / +91 9901518569"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">Official Email Address</label>
                        <input
                          type="email"
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="info@saamparktechnology.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-bold text-foreground mb-1">Company Website URL</label>
                        <input
                          type="text"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="www.saamparktechnology.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: BANKING & DIGITAL UPI PAY (DUAL GST & NON-GST PROFILES) */}
                {companyModalTab === "bank" && (
                  <div className="space-y-3.5">
                    {/* Dual Profile Switcher Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-surface-hover/60 border border-border">
                      <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-surface border border-border/80">
                        <button
                          type="button"
                          onClick={() => setCompanyBankProfileTab("gst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companyBankProfileTab === "gst"
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <CreditCard size={13} />
                          <span>GST Invoice Bank Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompanyBankProfileTab("nongst")}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companyBankProfileTab === "nongst"
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
                        onClick={handleCopyCompanyGstToNongst}
                        className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                        title="Copy details from GST profile into Non-GST profile"
                      >
                        <Sparkles size={12} className="text-primary" />
                        <span>Copy GST to Non-GST</span>
                      </button>
                    </div>

                    {/* GST Profile Form */}
                    {companyBankProfileTab === "gst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                            GST Invoices Bank Account & QR (Tax B2B / B2C)
                          </span>
                          <span className="text-[10px] text-muted-foreground">Auto-attached to all GST tax invoices</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-foreground mb-1">Bank Name *</label>
                            <input
                              type="text"
                              value={companyGstBankName}
                              onChange={(e) => {
                                setCompanyGstBankName(e.target.value)
                                setCompanyBankName(e.target.value)
                              }}
                              placeholder="e.g. State Bank of India / HDFC Bank"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={companyGstAccountHolder}
                              onChange={(e) => {
                                setCompanyGstAccountHolder(e.target.value)
                                setCompanyAccountHolder(e.target.value)
                              }}
                              placeholder="e.g. Saampark Technology & Research Pvt Ltd"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Account Number *</label>
                            <input
                              type="text"
                              value={companyGstAccountNumber}
                              onChange={(e) => {
                                setCompanyGstAccountNumber(e.target.value)
                                setCompanyAccountNumber(e.target.value)
                              }}
                              placeholder="e.g. 40912384759"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={companyGstIfscCode}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase()
                                setCompanyGstIfscCode(val)
                                setCompanyIfscCode(val)
                              }}
                              placeholder="e.g. SBIN0001234"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Bank Branch Location</label>
                            <input
                              type="text"
                              value={companyGstBankBranch}
                              onChange={(e) => {
                                setCompanyGstBankBranch(e.target.value)
                                setCompanyBankBranch(e.target.value)
                              }}
                              placeholder="e.g. Sector V Kolkata Branch"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">UPI ID (VPA)</label>
                            <input
                              type="text"
                              value={companyGstUpiId}
                              onChange={(e) => {
                                setCompanyGstUpiId(e.target.value)
                                setCompanyUpiId(e.target.value)
                              }}
                              placeholder="e.g. saampark@sbi"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>

                          {/* GST Payment QR Code */}
                          <div className="sm:col-span-2 p-3 rounded-2xl bg-surface border border-border space-y-2">
                            <label className="block font-bold text-foreground">
                              GST Payment QR Code Image (Standalone Bank QR)
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {companyGstPaymentQrUrl ? (
                                  <img src={companyGstPaymentQrUrl} alt="GST QR" className="w-14 h-14 object-contain" />
                                ) : (
                                  <QrCode size={28} className="text-muted-foreground" />
                                )}
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <input 
                                  type="file" 
                                  ref={companyGstQrInputRef}
                                  accept="image/*"
                                  onChange={handleCompanyGstQrUpload}
                                  className="hidden" 
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => companyGstQrInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                                  >
                                    <UploadCloud size={13} />
                                    <span>Upload GST QR Image</span>
                                  </button>
                                  {companyGstPaymentQrUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCompanyGstPaymentQrUrl("")
                                        if (companyPaymentQrUrl === companyGstPaymentQrUrl) setCompanyPaymentQrUrl("")
                                      }}
                                      className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                                    >
                                      Clear Image
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={companyGstPaymentQrUrl}
                                  onChange={(e) => {
                                    setCompanyGstPaymentQrUrl(e.target.value)
                                    setCompanyPaymentQrUrl(e.target.value)
                                  }}
                                  placeholder="Or paste direct image URL (e.g. /gst-qr.png or https://...)"
                                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Non-GST Profile Form */}
                    {companyBankProfileTab === "nongst" && (
                      <div className="space-y-3 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                            Non-GST Invoices Bank Account & QR (Retail / Estimates / Non-Tax)
                          </span>
                          <span className="text-[10px] text-muted-foreground">Auto-attached to all Non-GST invoices & estimates</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-foreground mb-1">Non-GST Bank Name *</label>
                            <input
                              type="text"
                              value={companyNongstBankName}
                              onChange={(e) => setCompanyNongstBankName(e.target.value)}
                              placeholder="e.g. State Bank of India / HDFC Bank"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden font-bold"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Account Holder Name *</label>
                            <input
                              type="text"
                              value={companyNongstAccountHolder}
                              onChange={(e) => setCompanyNongstAccountHolder(e.target.value)}
                              placeholder="e.g. Saampark Enterprise"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Account Number *</label>
                            <input
                              type="text"
                              value={companyNongstAccountNumber}
                              onChange={(e) => setCompanyNongstAccountNumber(e.target.value)}
                              placeholder="e.g. 501004928172"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">IFSC Code *</label>
                            <input
                              type="text"
                              value={companyNongstIfscCode}
                              onChange={(e) => setCompanyNongstIfscCode(e.target.value.toUpperCase())}
                              placeholder="e.g. HDFC0001234"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">Bank Branch Location</label>
                            <input
                              type="text"
                              value={companyNongstBankBranch}
                              onChange={(e) => setCompanyNongstBankBranch(e.target.value)}
                              placeholder="e.g. Main Market Branch"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                            />
                          </div>

                          <div>
                            <label className="block font-bold text-foreground mb-1">UPI ID (VPA)</label>
                            <input
                              type="text"
                              value={companyNongstUpiId}
                              onChange={(e) => setCompanyNongstUpiId(e.target.value)}
                              placeholder="e.g. saampark.retail@okhdfcbank"
                              className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold focus:outline-hidden"
                            />
                          </div>

                          {/* Non-GST Payment QR Code */}
                          <div className="sm:col-span-2 p-3 rounded-2xl bg-surface border border-border space-y-2">
                            <label className="block font-bold text-foreground">
                              Non-GST Payment QR Code Image (Standalone Bank / UPI QR)
                            </label>
                            <div className="flex items-center gap-3">
                              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                                {companyNongstPaymentQrUrl ? (
                                  <img src={companyNongstPaymentQrUrl} alt="Non-GST QR" className="w-14 h-14 object-contain" />
                                ) : (
                                  <QrCode size={28} className="text-muted-foreground" />
                                )}
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <input 
                                  type="file" 
                                  ref={companyNongstQrInputRef}
                                  accept="image/*"
                                  onChange={handleCompanyNongstQrUpload}
                                  className="hidden" 
                                />
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => companyNongstQrInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-amber-700 transition-all cursor-pointer shadow-xs"
                                  >
                                    <UploadCloud size={13} />
                                    <span>Upload Non-GST QR</span>
                                  </button>
                                  {companyNongstPaymentQrUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setCompanyNongstPaymentQrUrl("")}
                                      className="px-2.5 py-1.5 rounded-xl border border-border text-rose-600 hover:bg-rose-50 font-semibold text-xs cursor-pointer"
                                    >
                                      Clear Image
                                    </button>
                                  )}
                                </div>
                                <input
                                  type="text"
                                  value={companyNongstPaymentQrUrl}
                                  onChange={(e) => setCompanyNongstPaymentQrUrl(e.target.value)}
                                  placeholder="Or paste direct image URL (e.g. /nongst-qr.png or https://...)"
                                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-border text-[11px] font-mono focus:outline-hidden"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 6: DEDICATED COMPANY SMTP EMAIL DISPATCH */}
                {companyModalTab === "smtp" && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-2.5">
                      <Mail size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-blue-950 dark:text-blue-100 text-xs">
                          Company-Dedicated Email Dispatch (Google / Custom SMTP)
                        </h4>
                        <p className="text-[11px] text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
                          Invoices, project completions, payment receipts, and reminders for <strong>{companyName || "this company"}</strong> will be dispatched directly through this company's authenticated email account.
                        </p>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-1.5">
                      <label className="block font-bold text-foreground text-[11px]">Choose Mail Provider Preset:</label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleApplyCompanyPreset("gmail")}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companySmtpPreset === "gmail"
                              ? "bg-red-600 text-white shadow-sm"
                              : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          <span>Gmail / Google Workspace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCompanyPreset("zoho")}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companySmtpPreset === "zoho"
                              ? "bg-amber-600 text-white shadow-sm"
                              : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          <span>Zoho Mail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCompanyPreset("outlook")}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companySmtpPreset === "outlook"
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          <span>Outlook / Microsoft 365</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyCompanyPreset("custom")}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                            companySmtpPreset === "custom"
                              ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 shadow-sm"
                              : "bg-surface border border-border text-foreground hover:bg-surface-hover"
                          }`}
                        >
                          <span>Custom SMTP Server</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-foreground mb-1">SMTP Host</label>
                        <input
                          type="text"
                          value={companySmtpHost}
                          onChange={(e) => setCompanySmtpHost(e.target.value)}
                          placeholder="e.g. smtp.gmail.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-foreground mb-1">Port</label>
                          <input
                            type="text"
                            value={companySmtpPort}
                            onChange={(e) => {
                              const p = e.target.value
                              setCompanySmtpPort(p)
                              if (p === "465") setCompanySmtpSecure(true)
                              if (p === "587") setCompanySmtpSecure(false)
                            }}
                            placeholder="587 / 465"
                            className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-foreground mb-1">Encryption</label>
                          <select
                            value={companySmtpSecure ? "ssl" : "tls"}
                            onChange={(e) => setCompanySmtpSecure(e.target.value === "ssl")}
                            className="w-full px-2.5 py-2 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden cursor-pointer"
                          >
                            <option value="tls">STARTTLS (587)</option>
                            <option value="ssl">SSL / TLS (465)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">SMTP Username / Email *</label>
                        <input
                          type="email"
                          value={companySmtpUser}
                          onChange={(e) => {
                            setCompanySmtpUser(e.target.value)
                            if (!companySmtpFromEmail) setCompanySmtpFromEmail(e.target.value)
                            if (!companyTestEmail) setCompanyTestEmail(e.target.value)
                          }}
                          placeholder="e.g. accounts@saamparktechnology.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-foreground">App Password / Auth Key *</label>
                          <button
                            type="button"
                            onClick={() => setShowCompanySmtpPass(!showCompanySmtpPass)}
                            className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                          >
                            {showCompanySmtpPass ? "Hide" : "Show"}
                          </button>
                        </div>
                        <input
                          type={showCompanySmtpPass ? "text" : "password"}
                          value={companySmtpPass}
                          onChange={(e) => setCompanySmtpPass(e.target.value)}
                          placeholder="16-character Google App Password"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">Sender Display Name</label>
                        <input
                          type="text"
                          value={companySmtpFromName}
                          onChange={(e) => setCompanySmtpFromName(e.target.value)}
                          placeholder="e.g. SAAMPARK TECHNOLOGY Invoicing"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-foreground mb-1">Sender From Email (Header)</label>
                        <input
                          type="email"
                          value={companySmtpFromEmail}
                          onChange={(e) => setCompanySmtpFromEmail(e.target.value)}
                          placeholder="e.g. billing@saamparktechnology.com"
                          className="w-full px-3.5 py-2 rounded-xl bg-surface border border-border text-xs font-mono focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Google App Password Help Banner */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <span>💡 How to generate a Google App Password:</span>
                      </p>
                      <p className="text-muted-foreground leading-relaxed">
                        Go to your <strong>Google Account ➔ Security ➔ 2-Step Verification ➔ App passwords</strong>. Create a new App Password (name it "CRM") and paste the 16-character key above. Regular account passwords with 2FA will be rejected by Google SMTP.
                      </p>
                    </div>

                    {/* Live Test Connection Tool */}
                    <div className="p-3.5 bg-surface-hover/60 border border-border rounded-2xl space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-foreground text-xs block">Verify SMTP Connection & Send Test Email</span>
                          <span className="text-[10px] text-muted-foreground">Test your credentials in real-time before saving.</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="email"
                            value={companyTestEmail}
                            onChange={(e) => setCompanyTestEmail(e.target.value)}
                            placeholder="Recipient email..."
                            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-mono w-44 focus:outline-hidden"
                          />
                          <button
                            type="button"
                            disabled={isTestingCompanySmtp || !companySmtpUser || !companySmtpPass}
                            onClick={handleTestCompanySmtp}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Sparkles size={13} className={isTestingCompanySmtp ? "animate-spin" : ""} />
                            <span>{isTestingCompanySmtp ? "Testing..." : "⚡ Test SMTP"}</span>
                          </button>
                        </div>
                      </div>

                      {companySmtpTestResult && (
                        <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          companySmtpTestResult.success
                            ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}>
                          {companySmtpTestResult.success ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                          <span>{companySmtpTestResult.message}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 7: COMPANY-LEVEL ENABLED MODULES (SUPER ADMIN ONLY) */}
                {companyModalTab === "modules" && isSuperAdmin && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-black text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <Shield size={14} className="text-amber-600" />
                            <span>Company Module Access Control (Super Admin Only)</span>
                          </h4>
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                            Configure which CRM modules are enabled for <strong>{companyName || "this company"}</strong>. When users or admins switch into this company, only the selected modules will be visible.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setCompanyEnabledModulesState([...ALL_APP_MODULES])}
                            className="px-2.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-[10.5px] font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
                          >
                            Select All Modules
                          </button>
                          <button
                            type="button"
                            onClick={() => setCompanyEnabledModulesState(["Dashboard", "Settings"])}
                            className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-foreground text-[10.5px] font-bold hover:bg-surface-hover transition-all cursor-pointer"
                          >
                            Reset to Minimal
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(CLEAN_MODULE_CATEGORIES).map(([catKey, cat]) => (
                        <div key={catKey} className="p-3.5 rounded-2xl bg-surface border border-border space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-border/40 pb-2">
                            <span className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-2">
                              <span>{cat.label}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-hover font-mono text-muted-foreground">
                                {cat.modules.filter(m => companyEnabledModulesState.includes(m.key)).length}/{cat.modules.length} enabled
                              </span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  const catKeys = cat.modules.map(m => m.key)
                                  setCompanyEnabledModulesState(prev => Array.from(new Set([...prev, ...catKeys])))
                                }}
                                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                              >
                                Enable All
                              </button>
                              <span className="text-muted-foreground text-xs">•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const catKeys = cat.modules.map(m => m.key)
                                  setCompanyEnabledModulesState(prev => prev.filter(k => !catKeys.includes(k)))
                                }}
                                className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                              >
                                Disable All
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {cat.modules.map(mod => {
                              const isChecked = companyEnabledModulesState.includes(mod.key)
                              const isLockedCore = mod.key === "Dashboard"
                              return (
                                <label
                                  key={mod.key}
                                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                    isChecked
                                      ? "bg-primary/5 border-primary/40 text-foreground shadow-2xs ring-1 ring-primary/20"
                                      : "bg-surface-hover/30 border-border/50 text-muted-foreground opacity-60"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    disabled={isLockedCore}
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (isLockedCore) return
                                      if (e.target.checked) {
                                        setCompanyEnabledModulesState(prev => [...prev, mod.key])
                                      } else {
                                        setCompanyEnabledModulesState(prev => prev.filter(k => k !== mod.key))
                                      }
                                    }}
                                    className="mt-0.5 rounded text-primary focus:ring-primary h-4 w-4 shrink-0"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="font-bold text-xs leading-tight flex items-center gap-1.5">
                                      <span>{mod.name}</span>
                                      {isLockedCore && (
                                        <span className="text-[9px] font-semibold text-muted-foreground bg-surface-pressed px-1 rounded">Core</span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">{mod.description}</div>
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Action Buttons */}
                {(() => {
                  const currentCompanyTabIndex = COMPANY_TABS_LIST.indexOf(companyModalTab)
                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border/60 gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground w-full sm:w-auto">
                        <Sparkles size={13} className="text-teal-500 shrink-0" />
                        <span>Step {currentCompanyTabIndex + 1} of {COMPANY_TABS_LIST.length} • Dynamic Multi-Company Sync</span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                        <button
                          type="button"
                          onClick={() => setIsCompanyModalOpen(false)}
                          className="px-3.5 py-2 rounded-xl border border-border text-muted-foreground hover:text-foreground font-semibold cursor-pointer text-xs transition-colors"
                        >
                          Cancel
                        </button>

                        {currentCompanyTabIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => setCompanyModalTab(COMPANY_TABS_LIST[currentCompanyTabIndex - 1])}
                            className="px-3.5 py-2 rounded-xl bg-surface border border-border text-foreground hover:bg-surface-hover font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <ChevronLeft size={14} />
                            <span>Back</span>
                          </button>
                        )}

                        {currentCompanyTabIndex < COMPANY_TABS_LIST.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setCompanyModalTab(COMPANY_TABS_LIST[currentCompanyTabIndex + 1])}
                            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-1 shadow-xs hover:bg-primary/90 cursor-pointer transition-all"
                          >
                            <span>Next</span>
                            <ChevronRight size={14} />
                          </button>
                        )}

                        <button
                          type="submit"
                          className="px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Check size={14} />
                          <span>{editingCompany ? "Save Entity & Signature" : "Create Company Entity"}</span>
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
