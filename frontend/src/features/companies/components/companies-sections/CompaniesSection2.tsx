"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, 
  MapPin, Phone, Mail, Globe, Users, Briefcase, DollarSign, Building, 
  Loader2, AlertCircle, Shield, CreditCard, Award, CheckCircle2, Image,
  X, Sparkles, Eye, Landmark, QrCode, FileText, Check, ShieldCheck,
  Columns, Maximize2, Minimize2, Split, LayoutTemplate, Save, Copy, Layers
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CompanyApiService, BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { markGlobalItemDeleted, unmarkGlobalItemDeleted, fetchModuleDataFromDB, saveModuleDataToDB, syncGlobalDeletedIds, isGlobalItemDeleted, getLocalDeletedIds } from "@/lib/storageSync"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { OfficialInvoiceDocument, CustomTextStamp } from "@/features/invoice/components/OfficialInvoiceDocument"
import { InvoiceItem, InvoiceLineItem } from "@/features/invoice/services/invoiceService"
import { INDUSTRIES, CURRENCIES, PARTNER_TYPES, CANONICAL_COMPANIES, CANONICAL_BRANCHES, cleanStr, cleanUpper, isBranchDeleted , SafeModalBoundary } from "@/features/companies/components/companies-sections/CompaniesHelpers"

export function CompaniesSection2({ ctrl }: { ctrl: any }) {
  const { showBranchModal, branchModalViewMode, editingBranch, setBranchModalViewMode, handleCopyCompanyDetailsToBranch, branchCopiedNotice, setShowBranchModal, setBranchTab, branchTab, branchForm, setBranchForm, setBranchBankProfileTab, branchBankProfileTab, handleCopyBranchGstToNongst, saveBranch, saving, setPreviewInvoiceType, previewInvoiceType, setBranchZoom, branchZoom, addCustomStampTo, setBranchCustomStamps, setBranchSignaturePos, setBranchStampPos, branchPreviewSaveSuccess, branchSignaturePos, branchStampPos, companies, branchCompanyId, branchLogoPos, setBranchLogoPos, branchLogoScale, setBranchLogoScale, branchStampScale, setBranchStampScale, branchSignatureScale, setBranchSignatureScale, branchCustomStamps } = ctrl;
  return (
    <>
      {showBranchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <SafeModalBoundary>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className={`bg-surface rounded-2xl border border-border shadow-2xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden text-xs transition-all ${
                branchModalViewMode === "split" 
                  ? "max-w-[97vw] 2xl:max-w-[1600px]" 
                  : branchModalViewMode === "preview" 
                  ? "max-w-5xl" 
                  : "max-w-4xl"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <Building size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {editingBranch ? `Edit Branch: ${editingBranch.name}` : "Add Operational Branch"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Configure branch manager, stamp/signature overrides &amp; live document calibration
                    </p>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setBranchModalViewMode("split")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        branchModalViewMode === "split" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Split Screen: Side by Side Form & Live Preview"
                    >
                      <Split size={13} />
                      <span className="hidden sm:inline">Split Screen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchModalViewMode("form")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        branchModalViewMode === "form" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Form Controls Only"
                    >
                      <LayoutTemplate size={13} />
                      <span className="hidden sm:inline">Form Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchModalViewMode("preview")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        branchModalViewMode === "preview" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Live Document Preview Studio Only"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCompanyDetailsToBranch}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-muted hover:bg-muted/80 text-foreground border border-border"
                      title="Copy Bank, QR, Stamp, Signature, and Terms from Parent Company"
                    >
                      {branchCopiedNotice ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} className="text-primary" />
                          <span className="hidden sm:inline">Copy Company Details</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowBranchModal(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Main Body */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Form Pane */}
                {(branchModalViewMode === "split" || branchModalViewMode === "form") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-surface ${
                    branchModalViewMode === "split" ? "w-full lg:w-[48%] xl:w-[45%] border-b lg:border-b-0 lg:border-r border-border shrink-0" : "w-full"
                  }`}>
                    {/* Tab Navigation */}
                    <div className="grid grid-cols-5 border-b border-border bg-muted/40 font-bold text-center shrink-0">
                      <button type="button" onClick={() => setBranchTab("basic")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${branchTab === "basic" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>1. Info</button>
                      <button type="button" onClick={() => setBranchTab("tax")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${branchTab === "tax" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>2. Address</button>
                      <button type="button" onClick={() => setBranchTab("stamp")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${branchTab === "stamp" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>3. Stamp &amp; Sig</button>
                      <button type="button" onClick={() => setBranchTab("bank")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${branchTab === "bank" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>4. Bank &amp; QR</button>
                      <button type="button" onClick={() => setBranchTab("terms")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${branchTab === "terms" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>5. Terms &amp; Notes</button>
                    </div>

                    {/* Form Fields */}
                    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                      {/* Inheritance Notice */}
                      <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                        <Landmark size={14} className="shrink-0 text-blue-600" />
                        <span>Any field left empty below will automatically inherit its stamp, signature, bank account, and payment QR from the parent Company.</span>
                      </div>

                      {branchTab === "basic" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div><label className="block font-semibold mb-1">Branch Name *</label><Input placeholder="e.g. Kolkata Salt Lake Branch" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} className="font-bold" /></div>
                            <div><label className="block font-semibold mb-1">Branch Code *</label><Input placeholder="e.g. BR-KOL-01" value={branchForm.code} onChange={e => setBranchForm({ ...branchForm, code: e.target.value })} className="font-mono font-bold" /></div>
                            <div><label className="block font-semibold mb-1">Branch Manager Name</label><Input placeholder="e.g. Amit Sen" value={branchForm.managerName} onChange={e => setBranchForm({ ...branchForm, managerName: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Manager Phone</label><Input placeholder="+91 98765 43210" value={branchForm.managerPhone} onChange={e => setBranchForm({ ...branchForm, managerPhone: e.target.value })} /></div>
                          </div>
                          <div className="p-3.5 rounded-xl border border-border bg-muted/20 mt-3">
                            <ImageUploadField
                              label="Branch Logo (Overrides Company Logo on Branch Invoices)"
                              value={branchForm.logo_url}
                              onChange={url => setBranchForm({ ...branchForm, logo_url: url })}
                              uploadNamePrefix="branch_logo"
                              helperText="Leave empty to use the parent Company logo."
                            />
                          </div>
                        </div>
                      )}

                      {branchTab === "tax" && (
                        <div className="space-y-4">
                          <div><label className="block font-semibold mb-1">Branch Street Address</label><Input placeholder="Street address..." value={branchForm.address} onChange={e => setBranchForm({ ...branchForm, address: e.target.value })} /></div>
                          <div className="grid grid-cols-3 gap-3">
                            <div><label className="block font-semibold mb-1">City</label><Input value={branchForm.city} onChange={e => setBranchForm({ ...branchForm, city: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">State</label><Input value={branchForm.state} onChange={e => setBranchForm({ ...branchForm, state: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Country</label><Input value={branchForm.country} onChange={e => setBranchForm({ ...branchForm, country: e.target.value })} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block font-semibold mb-1">Branch Phone</label><Input value={branchForm.phone} onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Branch Email</label><Input value={branchForm.email} onChange={e => setBranchForm({ ...branchForm, email: e.target.value })} /></div>
                          </div>
                        </div>
                      )}

                      {branchTab === "stamp" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block font-semibold mb-1">Branch Signatory Name</label>
                              <Input placeholder="e.g. Supriya Kumar (Leave blank for Company default)" value={branchForm.signatory_name} onChange={e => setBranchForm({ ...branchForm, signatory_name: e.target.value })} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Signatory Designation</label>
                              <Input placeholder="e.g. Branch Head / Operations Manager" value={branchForm.signatory_designation} onChange={e => setBranchForm({ ...branchForm, signatory_designation: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                              <ImageUploadField
                                label="Branch Signature (Optional Override)"
                                value={branchForm.signature_image_url}
                                onChange={url => setBranchForm({ ...branchForm, signature_image_url: url })}
                                uploadNamePrefix="branch_sig"
                                helperText="If not uploaded, the parent Company's signature image is automatically used."
                              />
                            </div>
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                              <ImageUploadField
                                label="Branch Official Stamp / Seal (Optional Override)"
                                value={branchForm.stamp_image_url}
                                onChange={url => setBranchForm({ ...branchForm, stamp_image_url: url })}
                                uploadNamePrefix="branch_stamp"
                                helperText="If not uploaded, the parent Company's corporate seal stamp is automatically used."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {branchTab === "bank" && (
                        <div className="space-y-4">
                          {/* Dual Profile Switcher Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-surface border border-border">
                            <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-muted/40 border border-border/80">
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
                                <span>GST Bank Profile</span>
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
                                <span>Non-GST Bank Profile</span>
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

                          {/* GST BANK PROFILE */}
                          {branchBankProfileTab === "gst" && (
                            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                                  GST Invoicing Bank &amp; Settlement Account
                                </span>
                                <span className="text-[10px] text-muted-foreground">Used for Official GST Tax Invoices</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="block font-semibold mb-1">GST Bank Name</label>
                                  <Input 
                                    placeholder="e.g. ICICI Bank Ltd" 
                                    value={branchForm.gst_bank_name} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_bank_name: e.target.value, bank_name: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Account Holder Name</label>
                                  <Input 
                                    placeholder="e.g. Saampark Technology Pvt Ltd" 
                                    value={branchForm.gst_account_holder} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_account_holder: e.target.value, account_holder: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">GST Account Number</label>
                                  <Input 
                                    placeholder="Branch GST A/C number..." 
                                    value={branchForm.gst_account_number} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_account_number: e.target.value, account_number: e.target.value })} 
                                    className="font-mono font-bold" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">IFSC Code</label>
                                  <Input 
                                    placeholder="e.g. ICIC0001234" 
                                    value={branchForm.gst_ifsc_code} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_ifsc_code: e.target.value.toUpperCase(), ifsc_code: e.target.value.toUpperCase() })} 
                                    className="font-mono font-bold uppercase" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Bank Branch Name</label>
                                  <Input 
                                    placeholder="e.g. Sector V Branch" 
                                    value={branchForm.gst_bank_branch} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_bank_branch: e.target.value, bank_branch: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">GST UPI ID / VPA</label>
                                  <Input 
                                    placeholder="e.g. saampark.gst@icici" 
                                    value={branchForm.gst_upi_id} 
                                    onChange={e => setBranchForm({ ...branchForm, gst_upi_id: e.target.value, upi_id: e.target.value })} 
                                    className="font-mono" 
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

                          {/* NON-GST BANK PROFILE */}
                          {branchBankProfileTab === "nongst" && (
                            <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                                  Non-GST Invoicing Bank &amp; Settlement Account
                                </span>
                                <span className="text-[10px] text-muted-foreground">Used for Non-GST / Direct Estimates &amp; Bills</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="block font-semibold mb-1">Non-GST Bank Name</label>
                                  <Input 
                                    placeholder="e.g. HDFC Bank Ltd" 
                                    value={branchForm.nongst_bank_name} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_bank_name: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Account Holder Name</label>
                                  <Input 
                                    placeholder="Branch Non-GST Account Holder" 
                                    value={branchForm.nongst_account_holder} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_account_holder: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Non-GST Account Number</label>
                                  <Input 
                                    placeholder="Branch Non-GST A/C number..." 
                                    value={branchForm.nongst_account_number} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_account_number: e.target.value })} 
                                    className="font-mono font-bold" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">IFSC Code</label>
                                  <Input 
                                    placeholder="e.g. HDFC0000123" 
                                    value={branchForm.nongst_ifsc_code} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_ifsc_code: e.target.value.toUpperCase() })} 
                                    className="font-mono font-bold uppercase" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Bank Branch Name</label>
                                  <Input 
                                    placeholder="e.g. City Main Branch" 
                                    value={branchForm.nongst_bank_branch} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_bank_branch: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Non-GST UPI ID / VPA</label>
                                  <Input 
                                    placeholder="e.g. branch.nongst@hdfcbank" 
                                    value={branchForm.nongst_upi_id} 
                                    onChange={e => setBranchForm({ ...branchForm, nongst_upi_id: e.target.value })} 
                                    className="font-mono" 
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

                      {branchTab === "terms" && (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <Landmark size={14} className="shrink-0 text-blue-600" />
                            <span>Leave blank to automatically inherit parent Company's Terms &amp; Conditions and Invoice Notes.</span>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[11px]">Branch Terms &amp; Conditions (Override)</label>
                            <textarea
                              rows={4}
                              value={branchForm.terms_conditions}
                              onChange={e => setBranchForm({ ...branchForm, terms_conditions: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Enter branch-specific terms or leave empty to inherit from parent Company..."
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[11px]">Branch Invoice Notes (Override)</label>
                            <textarea
                              rows={3}
                              value={branchForm.invoice_notes}
                              onChange={e => setBranchForm({ ...branchForm, invoice_notes: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Enter branch-specific invoice notes or leave empty to inherit from parent Company..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Left Pane Footer Actions */}
                    <div className="flex items-center justify-between p-3.5 border-t border-border shrink-0 bg-muted/20">
                      <span className="text-blue-700 dark:text-blue-400 font-semibold text-[10px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span>Live synced with preview</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowBranchModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => saveBranch(false)} disabled={saving || !branchForm.name.trim()} className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                          {editingBranch ? "Update Branch" : "Create Branch"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Live Document Preview Studio Pane */}
                {(branchModalViewMode === "split" || branchModalViewMode === "preview") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950/80 ${
                    branchModalViewMode === "split" ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
                  }`}>
                    {/* Studio Header Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-surface border-b border-border shrink-0 text-xs">
                      {/* Scheme Switcher */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Scheme:</span>
                        <button
                          type="button"
                          onClick={() => setPreviewInvoiceType("gst")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            previewInvoiceType === "gst" ? "bg-teal-600 text-white shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          GST Tax (Teal)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewInvoiceType("nongst")}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            previewInvoiceType === "nongst" ? "bg-sky-600 text-white shadow-xs" : "bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Non-GST Direct (Sky)
                        </button>
                      </div>

                      {/* Zoom / Volume Controls */}
                      <div className="flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-lg border border-border">
                        <span className="text-[10px] font-bold text-muted-foreground mr-1">Zoom:</span>
                        <button
                          type="button"
                          onClick={() => setBranchZoom(prev => Math.max(60, prev - 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <span className="font-mono text-[10px] font-bold w-10 text-center">{branchZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setBranchZoom(prev => Math.min(150, prev + 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setBranchZoom(100)}
                          className="text-[9px] px-1 text-muted-foreground hover:text-foreground ml-0.5"
                          title="Reset to 100%"
                        >
                          100%
                        </button>
                      </div>

                      {/* Stamp Adders & Reset */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setBranchCustomStamps, "BRANCH NOTE", "#2563eb", "badge")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 hover:bg-blue-200 cursor-pointer"
                          title="Add draggable text sticker with zoom in/out & styling"
                        >
                          + Text Note
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setBranchCustomStamps, "PAID IN FULL", "#059669", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-200 cursor-pointer"
                        >
                          + PAID Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setBranchCustomStamps, "BRANCH SEAL", "#0d9488", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 hover:bg-teal-200 cursor-pointer"
                        >
                          + SEAL Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBranchSignaturePos({ x: 0, y: 0 })
                            setBranchStampPos({ x: 0, y: 0 })
                            setBranchCustomStamps([])
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded"
                        >
                          Reset Drag
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveBranch(true)}
                          disabled={saving}
                          className={`font-bold h-7 px-3 text-xs gap-1 shadow-sm shrink-0 ml-auto transition-all ${
                            branchPreviewSaveSuccess 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                          title="Save preview layout, signature/stamp positions, and live canvas modifications for this branch"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {saving ? "Saving..." : branchPreviewSaveSuccess ? "Saved Successfully!" : "Save Preview"}
                        </Button>
                      </div>
                    </div>

                    {/* Interactive Placement Coordinates */}
                    <div className="px-3 py-1.5 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/50 text-[10px] text-amber-900 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="flex items-center gap-1.5 font-medium"><Sparkles size={12} className="text-amber-600 dark:text-amber-400" /> <strong className="font-semibold">Interactive Studio:</strong> Direct document editing and dynamic positioning</span>
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
                        <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-200">
                          Sig: X:{branchSignaturePos.x} Y:{branchSignaturePos.y}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200">
                          Stamp: X:{branchStampPos.x} Y:{branchStampPos.y}
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Live Canvas with Zoom */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start">
                      <div 
                        className="w-full max-w-[820px] shadow-xl rounded-2xl transition-transform duration-150 origin-top"
                        style={{ transform: `scale(${branchZoom / 100})`, transformOrigin: "top center" }}
                      >
                        {(() => {
                          const pComp = companies.find(c => isMatchingCompany(c, branchCompanyId)) || companies[0] || CANONICAL_COMPANIES[0]
                          return (
                            <OfficialInvoiceDocument
                              invoice={{
                                id: "DEMO-BR-INV-001",
                                invoiceNumber: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                                invoice_number: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                                date: "2026-09-18",
                                issueDate: "2026-09-18",
                                dueDate: "2026-10-03",
                                companyId: pComp?.id || branchCompanyId || "tech",
                                company_id: pComp?.id || branchCompanyId || "tech",
                                branchId: editingBranch?.id || "branch-preview",
                                branch_id: editingBranch?.id || "branch-preview",
                                client: "Acme Corp",
                                clientName: "Acme Corp",
                                customer: "Acme Corp",
                                clientEmail: "billing@acmecorp.com",
                                clientPhone: "+91 90915 18567",
                                clientAddress: "Corporate Center, Paschim Medinipur, West Bengal",
                                clientGstin: "19ABASCS1649D1ZY",
                                projectTitle: "Custom Solution Project",
                                status: "Draft",
                                scheme: previewInvoiceType,
                                items: [
                                  {
                                    id: "item-1",
                                    description: "Custom Enterprise Consulting & Development",
                                    serviceName: "Custom Enterprise Consulting & Development",
                                    sacCode: "998313",
                                    sac: "998313",
                                    qty: 1,
                                    quantity: 1,
                                    rate: 15000,
                                    unitPrice: 15000,
                                    unit: "Project",
                                    gstRate: previewInvoiceType === "gst" ? 18 : 0,
                                    totalAmount: previewInvoiceType === "gst" ? 17700 : 15000,
                                    total: previewInvoiceType === "gst" ? 17700 : 15000,
                                  }
                                ],
                                subtotal: 15000,
                                taxableBase: 15000,
                                tax: previewInvoiceType === "gst" ? 2700 : 0,
                                taxAmount: previewInvoiceType === "gst" ? 2700 : 0,
                                total: previewInvoiceType === "gst" ? 17700 : 15000,
                                totalAmount: previewInvoiceType === "gst" ? 17700 : 15000,
                                paidAmount: 0,
                                received: 0,
                                due: previewInvoiceType === "gst" ? 17700 : 15000,
                                dueAmount: previewInvoiceType === "gst" ? 17700 : 15000,
                                terms: branchForm.terms_conditions || pComp?.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
                                notes: branchForm.invoice_notes || pComp?.invoice_notes || "Thank you for your business."
                              } as any}
                              companyDetails={pComp}
                              activeBranch={{
                                ...branchForm,
                                id: editingBranch?.id || "branch-preview",
                                company_id: branchCompanyId
                              } as any}
                              interactive={true}
                              logoPosition={branchLogoPos}
                              onLogoPositionChange={setBranchLogoPos}
                              logoScale={branchLogoScale}
                              onLogoScaleChange={setBranchLogoScale}
                              stampPosition={branchStampPos}
                              onStampPositionChange={setBranchStampPos}
                              stampScale={branchStampScale}
                              onStampScaleChange={setBranchStampScale}
                              signaturePosition={branchSignaturePos}
                              onSignaturePositionChange={setBranchSignaturePos}
                              signatureScale={branchSignatureScale}
                              onSignatureScaleChange={setBranchSignatureScale}
                              customStamps={branchCustomStamps}
                              onCustomStampMove={(id, pos) => setBranchCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...pos } : s))}
                              onCustomStampUpdate={(id, updates) => setBranchCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                              onRemoveCustomStamp={(id) => setBranchCustomStamps(prev => prev.filter(s => s.id !== id))}
                              onAddCustomStamp={(s) => addCustomStampTo(setBranchCustomStamps, s?.text || "NOTE", s?.color || "#0d9488", s?.bgStyle || "badge")}
                              onFieldChange={(field, val) => setBranchForm(prev => ({ ...prev, [field]: val }))}
                            />
                          )
                        })()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            </SafeModalBoundary>
          </div>
        )}
    </>
  );
}
