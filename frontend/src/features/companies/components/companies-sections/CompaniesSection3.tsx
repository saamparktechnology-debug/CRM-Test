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

export function CompaniesSection3({ ctrl }: { ctrl: any }) {
  const { showSubBranchModal, subBranchModalViewMode, editingSubBranch, setSubBranchModalViewMode, handleCopyCompanyDetailsToSubBranch, subBranchCopiedNotice, setShowSubBranchModal, setSubBranchTab, subBranchTab, subBranchForm, setSubBranchForm, setSubBranchBankProfileTab, subBranchBankProfileTab, handleCopySubBranchGstToNongst, saveSubBranch, saving, setPreviewInvoiceType, previewInvoiceType, setSubBranchZoom, subBranchZoom, addCustomStampTo, setSubBranchCustomStamps, setSubBranchSignaturePos, setSubBranchStampPos, subBranchPreviewSaveSuccess, subBranchSignaturePos, subBranchStampPos, branches, subBranchBranchId, companies, subBranchCompanyId, subBranchLogoScale, setSubBranchLogoScale, subBranchStampScale, setSubBranchStampScale, subBranchSignatureScale, setSubBranchSignatureScale, subBranchCustomStamps } = ctrl;
  return (
    <>
      {showSubBranchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <SafeModalBoundary>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className={`bg-surface rounded-2xl border border-border shadow-2xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden text-xs transition-all ${
                subBranchModalViewMode === "split" 
                  ? "max-w-[97vw] 2xl:max-w-[1600px]" 
                  : subBranchModalViewMode === "preview" 
                  ? "max-w-5xl" 
                  : "max-w-4xl"
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {editingSubBranch ? `Edit Sub-Branch: ${editingSubBranch.name}` : "Add Sub-Branch (Partner & Revenue Share Hub)"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Partner percentage revenue share, custom seal/stamp &amp; live document calibration
                    </p>
                  </div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setSubBranchModalViewMode("split")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        subBranchModalViewMode === "split" 
                          ? "bg-emerald-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Split Screen: Side by Side Form & Live Preview"
                    >
                      <Split size={13} />
                      <span className="hidden sm:inline">Split Screen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubBranchModalViewMode("form")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        subBranchModalViewMode === "form" 
                          ? "bg-emerald-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Form Controls Only"
                    >
                      <LayoutTemplate size={13} />
                      <span className="hidden sm:inline">Form Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubBranchModalViewMode("preview")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        subBranchModalViewMode === "preview" 
                          ? "bg-emerald-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Live Document Preview Studio Only"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview Only</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCompanyDetailsToSubBranch}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all bg-muted hover:bg-muted/80 text-foreground border border-border"
                      title="Copy Bank, QR, Stamp, Signature, and Terms from Parent Company"
                    >
                      {subBranchCopiedNotice ? (
                        <>
                          <Check size={13} className="text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} className="text-emerald-600" />
                          <span className="hidden sm:inline">Copy Company Details</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowSubBranchModal(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Main Body */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Form Pane */}
                {(subBranchModalViewMode === "split" || subBranchModalViewMode === "form") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-surface ${
                    subBranchModalViewMode === "split" ? "w-full lg:w-[48%] xl:w-[45%] border-b lg:border-b-0 lg:border-r border-border shrink-0" : "w-full"
                  }`}>
                    {/* Tab Navigation */}
                    <div className="grid grid-cols-5 border-b border-border bg-muted/40 font-bold text-center shrink-0">
                      <button type="button" onClick={() => setSubBranchTab("partner")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${subBranchTab === "partner" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>1. Partner</button>
                      <button type="button" onClick={() => setSubBranchTab("location")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${subBranchTab === "location" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>2. Address</button>
                      <button type="button" onClick={() => setSubBranchTab("stamp")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${subBranchTab === "stamp" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>3. Stamp &amp; Sig</button>
                      <button type="button" onClick={() => setSubBranchTab("bank")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${subBranchTab === "bank" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>4. Bank &amp; QR</button>
                      <button type="button" onClick={() => setSubBranchTab("terms")} className={`py-2.5 border-b-2 text-[10px] sm:text-[11px] font-bold ${subBranchTab === "terms" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>5. Terms &amp; Notes</button>
                    </div>

                    {/* Form Fields */}
                    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                      {/* Inheritance Notice */}
                      <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                        <Landmark size={14} className="shrink-0 text-emerald-600" />
                        <span>Any field left empty below will automatically inherit its stamp, signature, bank account, and payment QR from the parent Company.</span>
                      </div>

                      {subBranchTab === "partner" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div><label className="block font-semibold mb-1">Sub-Branch Name *</label><Input placeholder="e.g. Regional Sub-Branch" value={subBranchForm.name} onChange={e => setSubBranchForm({ ...subBranchForm, name: e.target.value })} className="font-bold" /></div>
                            <div><label className="block font-semibold mb-1">Sub-Branch Code *</label><Input placeholder="e.g. SB-01" value={subBranchForm.code} onChange={e => setSubBranchForm({ ...subBranchForm, code: e.target.value })} className="font-mono font-bold" /></div>
                            <div><label className="block font-semibold mb-1">Partner / Associate Full Name *</label><Input placeholder="Partner person/entity name" value={subBranchForm.partner_name} onChange={e => setSubBranchForm({ ...subBranchForm, partner_name: e.target.value })} /></div>
                            <div>
                              <label className="block font-semibold mb-1">Partner Network Type</label>
                              <select value={subBranchForm.partner_type} onChange={e => setSubBranchForm({ ...subBranchForm, partner_type: e.target.value })} className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-xs">
                                {PARTNER_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                              </select>
                            </div>
                          </div>

                          {/* Revenue Share Percentage Slider / Input */}
                          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="font-bold text-indigo-900 dark:text-indigo-200">Partner Revenue Share Percentage (%)</label>
                              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{subBranchForm.revenue_share_pct}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={subBranchForm.revenue_share_pct}
                              onChange={e => setSubBranchForm({ ...subBranchForm, revenue_share_pct: Number(e.target.value) })}
                              className="w-full cursor-pointer accent-indigo-600"
                            />
                            <p className="text-[10px] text-muted-foreground">Earnings will automatically calculate: {subBranchForm.revenue_share_pct}% to Sub-Branch Partner, {100 - subBranchForm.revenue_share_pct}% to Headquarters.</p>
                          </div>
                        </div>
                      )}

                      {subBranchTab === "location" && (
                        <div className="space-y-4">
                          <div><label className="block font-semibold mb-1">Sub-Branch Address</label><Input value={subBranchForm.address} onChange={e => setSubBranchForm({ ...subBranchForm, address: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div><label className="block font-semibold mb-1">City</label><Input value={subBranchForm.city} onChange={e => setSubBranchForm({ ...subBranchForm, city: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">State</label><Input value={subBranchForm.state} onChange={e => setSubBranchForm({ ...subBranchForm, state: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Partner Phone</label><Input value={subBranchForm.phone} onChange={e => setSubBranchForm({ ...subBranchForm, phone: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Partner Email</label><Input value={subBranchForm.email} onChange={e => setSubBranchForm({ ...subBranchForm, email: e.target.value })} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                            <div><label className="block font-semibold mb-1">Sub-Branch GSTIN (Optional)</label><Input placeholder="19BBCCS5678G1Z2" value={subBranchForm.gstin} onChange={e => setSubBranchForm({ ...subBranchForm, gstin: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase" /></div>
                            <div><label className="block font-semibold mb-1">Sub-Branch PAN (Optional)</label><Input placeholder="BBCCS5678G" value={subBranchForm.pan} onChange={e => setSubBranchForm({ ...subBranchForm, pan: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase" /></div>
                          </div>
                        </div>
                      )}

                      {subBranchTab === "stamp" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                              <label className="block font-semibold mb-1">Partner Signatory Name</label>
                              <Input placeholder="e.g. Debabrata Mukherjee (Leave blank for Company default)" value={subBranchForm.signatory_name} onChange={e => setSubBranchForm({ ...subBranchForm, signatory_name: e.target.value })} />
                            </div>
                            <div>
                              <label className="block font-semibold mb-1">Partner Designation</label>
                              <Input placeholder="e.g. Franchise Partner / Director" value={subBranchForm.signatory_designation} onChange={e => setSubBranchForm({ ...subBranchForm, signatory_designation: e.target.value })} />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                              <ImageUploadField
                                label="Partner Signature (Optional Override)"
                                value={subBranchForm.signature_image_url}
                                onChange={url => setSubBranchForm({ ...subBranchForm, signature_image_url: url })}
                                uploadNamePrefix="subbranch_sig"
                                helperText="If not uploaded, the parent Company's signature is automatically used."
                              />
                            </div>
                            <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                              <ImageUploadField
                                label="Partner / Franchise Stamp (Optional Override)"
                                value={subBranchForm.stamp_image_url}
                                onChange={url => setSubBranchForm({ ...subBranchForm, stamp_image_url: url })}
                                uploadNamePrefix="subbranch_stamp"
                                helperText="If not uploaded, the parent Company's seal stamp is automatically used."
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {subBranchTab === "bank" && (
                        <div className="space-y-4">
                          {/* Dual Profile Switcher Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-2xl bg-surface border border-border">
                            <div className="flex items-center gap-1.5 p-0.5 rounded-xl bg-muted/40 border border-border/80">
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
                                <span>GST Bank Profile</span>
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
                                <span>Non-GST Bank Profile</span>
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

                          {/* GST BANK PROFILE */}
                          {subBranchBankProfileTab === "gst" && (
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
                                    placeholder="e.g. State Bank of India" 
                                    value={subBranchForm.gst_bank_name} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_bank_name: e.target.value, bank_name: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Account Holder Name</label>
                                  <Input 
                                    placeholder="e.g. Saampark Technology Pvt Ltd" 
                                    value={subBranchForm.gst_account_holder} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_account_holder: e.target.value, account_holder: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">GST Account Number</label>
                                  <Input 
                                    placeholder="Partner GST A/C number..." 
                                    value={subBranchForm.gst_account_number} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_account_number: e.target.value, account_number: e.target.value })} 
                                    className="font-mono font-bold" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">IFSC Code</label>
                                  <Input 
                                    placeholder="e.g. SBIN0001234" 
                                    value={subBranchForm.gst_ifsc_code} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_ifsc_code: e.target.value.toUpperCase(), ifsc_code: e.target.value.toUpperCase() })} 
                                    className="font-mono font-bold uppercase" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Bank Branch Name</label>
                                  <Input 
                                    placeholder="e.g. City Center Branch" 
                                    value={subBranchForm.gst_bank_branch} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_bank_branch: e.target.value, bank_branch: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">GST UPI ID / VPA</label>
                                  <Input 
                                    placeholder="e.g. saampark.gst@sbi" 
                                    value={subBranchForm.gst_upi_id} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, gst_upi_id: e.target.value, upi_id: e.target.value })} 
                                    className="font-mono" 
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <ImageUploadField
                                  label="GST Payment QR Code / Scanner"
                                  value={subBranchForm.gst_payment_qr_url}
                                  onChange={url => setSubBranchForm({ ...subBranchForm, gst_payment_qr_url: url, payment_qr_url: url })}
                                  uploadNamePrefix="subbranch_gst_qr"
                                  helperText="Official QR scanner image printed on GST Tax Invoices."
                                />
                              </div>
                            </div>
                          )}

                          {/* NON-GST BANK PROFILE */}
                          {subBranchBankProfileTab === "nongst" && (
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
                                    value={subBranchForm.nongst_bank_name} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_bank_name: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Account Holder Name</label>
                                  <Input 
                                    placeholder="e.g. Franchise Partner Name" 
                                    value={subBranchForm.nongst_account_holder} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_account_holder: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Non-GST Account Number</label>
                                  <Input 
                                    placeholder="Partner Non-GST A/C number..." 
                                    value={subBranchForm.nongst_account_number} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_account_number: e.target.value })} 
                                    className="font-mono font-bold" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">IFSC Code</label>
                                  <Input 
                                    placeholder="e.g. HDFC0001234" 
                                    value={subBranchForm.nongst_ifsc_code} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_ifsc_code: e.target.value.toUpperCase() })} 
                                    className="font-mono font-bold uppercase" 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Bank Branch Name</label>
                                  <Input 
                                    placeholder="e.g. Main Commercial Branch" 
                                    value={subBranchForm.nongst_bank_branch} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_bank_branch: e.target.value })} 
                                  />
                                </div>
                                <div>
                                  <label className="block font-semibold mb-1">Non-GST UPI ID / VPA</label>
                                  <Input 
                                    placeholder="e.g. partner.nongst@okhdfcbank" 
                                    value={subBranchForm.nongst_upi_id} 
                                    onChange={e => setSubBranchForm({ ...subBranchForm, nongst_upi_id: e.target.value })} 
                                    className="font-mono" 
                                  />
                                </div>
                              </div>
                              <div className="pt-2">
                                <ImageUploadField
                                  label="Non-GST Payment QR Code / Scanner"
                                  value={subBranchForm.nongst_payment_qr_url}
                                  onChange={url => setSubBranchForm({ ...subBranchForm, nongst_payment_qr_url: url })}
                                  uploadNamePrefix="subbranch_nongst_qr"
                                  helperText="Payment QR code scanner image printed on Non-GST Invoices."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {subBranchTab === "terms" && (
                        <div className="space-y-4">
                          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                            <Landmark size={14} className="shrink-0 text-emerald-600" />
                            <span>Leave blank to automatically inherit parent Company's Terms &amp; Conditions and Invoice Notes.</span>
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[11px]">Sub-Branch Terms &amp; Conditions (Override)</label>
                            <textarea
                              rows={4}
                              value={subBranchForm.terms_conditions}
                              onChange={e => setSubBranchForm({ ...subBranchForm, terms_conditions: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Enter sub-branch specific terms or leave empty to inherit from parent Company..."
                            />
                          </div>
                          <div>
                            <label className="block font-semibold mb-1 text-[11px]">Sub-Branch Invoice Notes (Override)</label>
                            <textarea
                              rows={3}
                              value={subBranchForm.invoice_notes}
                              onChange={e => setSubBranchForm({ ...subBranchForm, invoice_notes: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Enter sub-branch specific invoice notes or leave empty to inherit from parent Company..."
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Left Pane Footer Actions */}
                    <div className="flex items-center justify-between p-3.5 border-t border-border shrink-0 bg-muted/20">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live synced with preview</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowSubBranchModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => saveSubBranch(false)} disabled={saving || !subBranchForm.name.trim()} className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                          {editingSubBranch ? "Update Sub-Branch" : "Save Sub-Branch"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Live Document Preview Studio Pane */}
                {(subBranchModalViewMode === "split" || subBranchModalViewMode === "preview") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950/80 ${
                    subBranchModalViewMode === "split" ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
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
                          onClick={() => setSubBranchZoom(prev => Math.max(60, prev - 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <span className="font-mono text-[10px] font-bold w-10 text-center">{subBranchZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setSubBranchZoom(prev => Math.min(150, prev + 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubBranchZoom(100)}
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
                          onClick={() => addCustomStampTo(setSubBranchCustomStamps, "PARTNER NOTE", "#2563eb", "badge")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 hover:bg-blue-200 cursor-pointer"
                          title="Add draggable text sticker with zoom in/out & styling"
                        >
                          + Text Note
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setSubBranchCustomStamps, "PAID IN FULL", "#059669", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-200 cursor-pointer"
                        >
                          + PAID Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setSubBranchCustomStamps, "PARTNER SEAL", "#0d9488", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 hover:bg-teal-200 cursor-pointer"
                        >
                          + SEAL Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSubBranchSignaturePos({ x: 0, y: 0 })
                            setSubBranchStampPos({ x: 0, y: 0 })
                            setSubBranchCustomStamps([])
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded"
                        >
                          Reset Drag
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveSubBranch(true)}
                          disabled={saving}
                          className={`font-bold h-7 px-3 text-xs gap-1 shadow-sm shrink-0 ml-auto transition-all ${
                            subBranchPreviewSaveSuccess 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                          title="Save preview layout, signature/stamp positions, and live canvas modifications for this sub-branch"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {saving ? "Saving..." : subBranchPreviewSaveSuccess ? "Saved Successfully!" : "Save Preview"}
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
                          Sig: X:{subBranchSignaturePos.x} Y:{subBranchSignaturePos.y}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200">
                          Stamp: X:{subBranchStampPos.x} Y:{subBranchStampPos.y}
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Live Canvas with Zoom */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start">
                      <div 
                        className="w-full max-w-[820px] shadow-xl rounded-2xl transition-transform duration-150 origin-top"
                        style={{ transform: `scale(${subBranchZoom / 100})`, transformOrigin: "top center" }}
                      >
                        {(() => {
                          const pBranch = branches.find(b => String(b.id) === String(subBranchBranchId) || (b.code && b.code === subBranchBranchId))
                          const pComp = companies.find(c => isMatchingCompany(c, subBranchCompanyId) || (pBranch && isMatchingCompany(c, pBranch.company_id))) || companies[0] || CANONICAL_COMPANIES[0]
                          return (
                            <OfficialInvoiceDocument
                              invoice={{
                                id: "DEMO-SB-INV-001",
                                invoiceNumber: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                                invoice_number: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                                date: "2026-09-18",
                                issueDate: "2026-09-18",
                                dueDate: "2026-10-03",
                                companyId: pComp?.id || "tech",
                                company_id: pComp?.id || "tech",
                                branchId: pBranch?.id || subBranchBranchId,
                                branch_id: pBranch?.id || subBranchBranchId,
                                subBranchId: editingSubBranch?.id || "subbranch-preview",
                                sub_branch_id: editingSubBranch?.id || "subbranch-preview",
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
                                terms: subBranchForm.terms_conditions || pBranch?.terms_conditions || pComp?.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
                                notes: subBranchForm.invoice_notes || pBranch?.invoice_notes || pComp?.invoice_notes || "Thank you for your business."
                              } as any}
                              companyDetails={pComp}
                              activeBranch={pBranch}
                              activeSubBranch={{
                                ...subBranchForm,
                                id: editingSubBranch?.id || "subbranch-preview",
                                branch_id: subBranchBranchId,
                                company_id: subBranchCompanyId
                              } as any}
                              interactive={true}
                              logoScale={subBranchLogoScale}
                              onLogoScaleChange={setSubBranchLogoScale}
                              stampPosition={subBranchStampPos}
                              onStampPositionChange={setSubBranchStampPos}
                              stampScale={subBranchStampScale}
                              onStampScaleChange={setSubBranchStampScale}
                              signaturePosition={subBranchSignaturePos}
                              onSignaturePositionChange={setSubBranchSignaturePos}
                              signatureScale={subBranchSignatureScale}
                              onSignatureScaleChange={setSubBranchSignatureScale}
                              customStamps={subBranchCustomStamps}
                              onCustomStampMove={(id, pos) => setSubBranchCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...pos } : s))}
                              onCustomStampUpdate={(id, updates) => setSubBranchCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                              onRemoveCustomStamp={(id) => setSubBranchCustomStamps(prev => prev.filter(s => s.id !== id))}
                              onAddCustomStamp={(s) => addCustomStampTo(setSubBranchCustomStamps, s?.text || "NOTE", s?.color || "#0d9488", s?.bgStyle || "badge")}
                              onFieldChange={(field, val) => setSubBranchForm(prev => ({ ...prev, [field]: val }))}
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
