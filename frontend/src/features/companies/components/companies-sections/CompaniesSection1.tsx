"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function CompaniesSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { showCompanyModal, companyModalViewMode, editingCompany, setCompanyModalViewMode, setShowCompanyModal, setCompanyTab, companyTab, companyForm, setCompanyForm, setCompanyBankProfileTab, companyBankProfileTab, saveCompany, saving, setPreviewInvoiceType, previewInvoiceType, setCompanyZoom, companyZoom, addCustomStampTo, setCompanyCustomStamps, setCompanySignaturePos, setCompanyStampPos, previewSaveSuccess, companySignaturePos, companyStampPos, companyLogoPos, setCompanyLogoPos, companyLogoScale, setCompanyLogoScale, companyStampScale, setCompanyStampScale, companySignatureScale, setCompanySignatureScale, companyCustomStamps } = ctrl;
  return (
    <>
      {showCompanyModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
            <SafeModalBoundary>
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }} 
              className={`bg-surface rounded-2xl border border-border shadow-2xl w-full h-[94vh] max-h-[94vh] flex flex-col overflow-hidden text-xs transition-all ${
                companyModalViewMode === "split" 
                  ? "max-w-[97vw] 2xl:max-w-[1600px]" 
                  : companyModalViewMode === "preview" 
                  ? "max-w-5xl" 
                  : "max-w-4xl"
              }`}
            >
              {/* Top Modal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-foreground truncate">
                      {editingCompany ? `Edit Company: ${editingCompany.name}` : "Configure Company Details"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Split-screen live studio for corporate settings, bank accounts &amp; live document calibration
                    </p>
                  </div>
                </div>

                {/* Header Controls: View Mode Switcher + Close */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setCompanyModalViewMode("split")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        companyModalViewMode === "split" 
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
                      onClick={() => setCompanyModalViewMode("form")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        companyModalViewMode === "form" 
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
                      onClick={() => setCompanyModalViewMode("preview")}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        companyModalViewMode === "preview" 
                          ? "bg-blue-600 text-white shadow-xs" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                      title="Live Document Preview Studio Only"
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Preview Only</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setShowCompanyModal(false)}><X className="h-4 w-4" /></Button>
                </div>
              </div>

              {/* Modal Main Body (Split View or Single View) */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
                {/* Left Form Pane */}
                {(companyModalViewMode === "split" || companyModalViewMode === "form") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-surface ${
                    companyModalViewMode === "split" ? "w-full lg:w-[48%] xl:w-[45%] border-b lg:border-b-0 lg:border-r border-border shrink-0" : "w-full"
                  }`}>
                    {/* Form Tab Navigation */}
                    <div className="flex border-b border-border bg-muted/40 font-bold text-center shrink-0 overflow-x-auto">
                      <button type="button" onClick={() => setCompanyTab("identity")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "identity" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>1. Identity</button>
                      <button type="button" onClick={() => setCompanyTab("tax")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "tax" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>2. GST &amp; Legal</button>
                      <button type="button" onClick={() => setCompanyTab("contact")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "contact" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>3. Address</button>
                      <button type="button" onClick={() => setCompanyTab("branding")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "branding" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>4. Branding</button>
                      <button type="button" onClick={() => setCompanyTab("signatory")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "signatory" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>5. Stamp &amp; Sig</button>
                      <button type="button" onClick={() => setCompanyTab("bank")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "bank" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>6. Dual Bank &amp; QR</button>
                      <button type="button" onClick={() => setCompanyTab("terms")} className={`py-2.5 px-3 border-b-2 text-[10px] sm:text-[11px] font-bold transition-all whitespace-nowrap flex-1 ${companyTab === "terms" ? "border-primary text-primary bg-surface" : "border-transparent text-muted-foreground hover:text-foreground"}`}>7. Terms &amp; Notes</button>
                    </div>

                    {/* Active Tab Form Inputs */}
                    <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                      {companyTab === "identity" && (
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                                Registered / Legal Corporate Name (Company Name) *
                              </label>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                                {String(companyForm.name || "").toLowerCase().includes("consult") ? "Code: SCS" : "Code: STR"}
                              </span>
                            </div>
                            <Input 
                              placeholder="e.g. SAAMPARK CONSULTANCY SERVICES PRIVATE LIMITED" 
                              value={companyForm.name} 
                              onChange={e => {
                                const val = e.target.value
                                setCompanyForm(prev => ({ 
                                  ...prev, 
                                  name: val
                                }))
                              }} 
                              className="font-bold text-sm" 
                            />
                            <span className="text-[10px] text-muted-foreground block mt-1">
                              Full statutory registered corporate name displayed on company cards, tax filings, and invoices.
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                Top Brand Name (Header Line 1) *
                              </label>
                              <Input 
                                placeholder="e.g. SAAMPARK" 
                                value={companyForm.brand_name} 
                                onChange={e => {
                                  const val = e.target.value
                                  setCompanyForm(prev => ({ 
                                    ...prev, 
                                    brand_name: val,
                                    name: prev.name || val,
                                    slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                                  }))
                                }} 
                                className="font-bold text-sm" 
                              />
                              <span className="text-[10px] text-muted-foreground block mt-1">
                                Main brand title displayed on top of invoices, quotations &amp; estimates.
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                Bottom Secondary Name (Header Line 2)
                              </label>
                              <Input 
                                placeholder="e.g. TECHNOLOGY AND RESEARCH PRIVATE LIMITED" 
                                value={companyForm.division_name} 
                                onChange={e => {
                                  const val = e.target.value
                                  setCompanyForm(prev => ({ 
                                    ...prev, 
                                    division_name: val,
                                    subtitle: val
                                  }))
                                }} 
                                className="font-medium text-xs sm:text-sm"
                              />
                              <span className="text-[10px] text-muted-foreground block mt-1">
                                Division or corporate subtitle displayed directly below the main brand.
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                Trademark / Registered Symbol
                              </label>
                              <select 
                                value={companyForm.trademark_symbol} 
                                onChange={e => setCompanyForm({ ...companyForm, trademark_symbol: e.target.value })}
                                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                {(masterBundle?.options?.["trademark_type"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                              </select>
                              <span className="text-[10px] text-muted-foreground block mt-1">
                                Displayed in a circular red badge at the top-right of your brand name.
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1.5 uppercase tracking-wider">
                                Industry
                              </label>
                              <select 
                                value={companyForm.industry} 
                                onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} 
                                className="w-full px-3 py-2 rounded-md border border-border bg-surface text-foreground text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}

                      {companyTab === "tax" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                              Registered Legal Entity Name (Optional)
                            </label>
                            <Input 
                              placeholder="Full registered company name (if different from brand title)" 
                              value={companyForm.name} 
                              onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} 
                              className="font-bold text-xs sm:text-sm" 
                            />
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              Used in official legal contracts, banking records, and statutory declarations.
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                            <div><label className="block text-xs font-semibold mb-1">GSTIN</label><Input placeholder="GSTIN (Leave blank if not registered)" value={companyForm.gstin} onChange={e => setCompanyForm({ ...companyForm, gstin: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase text-xs" /></div>
                            <div><label className="block text-xs font-semibold mb-1">PAN Number</label><Input placeholder="PAN (Leave blank if none)" value={companyForm.pan} onChange={e => setCompanyForm({ ...companyForm, pan: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase text-xs" /></div>
                            <div><label className="block text-xs font-semibold mb-1">CIN (Corporate ID)</label><Input placeholder="CIN (Leave blank if none)" value={companyForm.cin} onChange={e => setCompanyForm({ ...companyForm, cin: e.target.value.toUpperCase() })} className="font-mono uppercase text-xs" /></div>
                            <div><label className="block text-xs font-semibold mb-1">MSME Registration Number</label><Input placeholder="MSME / Udyam (Leave blank if none)" value={companyForm.msme_reg} onChange={e => setCompanyForm({ ...companyForm, msme_reg: e.target.value })} className="font-mono text-xs" /></div>
                          </div>
                          <div><label className="block text-xs font-semibold mb-1">ISO / Quality Certification Badge</label><Input placeholder="e.g. An ISO 9001:2015 Certified Company (Optional)" value={companyForm.iso_certification} onChange={e => setCompanyForm({ ...companyForm, iso_certification: e.target.value })} className="text-xs" /></div>
                        </div>
                      )}

                      {companyTab === "contact" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block font-semibold text-xs mb-1.5 uppercase tracking-wider">Registered / Corporate Office Address *</label>
                            <textarea 
                              rows={2}
                              placeholder="Full registered corporate street address" 
                              value={companyForm.address} 
                              onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })} 
                              className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed whitespace-pre-wrap"
                            />
                            <span className="text-[10px] text-muted-foreground block mt-0.5">Corporate legal street address used in contracts, statutory records, and invoices.</span>
                          </div>
                          <div>
                            <label className="block font-semibold text-xs mb-1.5 uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              Custom Invoice Bottom Footer Text (Displayed in Bottom Banner)
                            </label>
                            <textarea 
                              rows={2}
                              placeholder="e.g. Registered Office: 123 Corporate Street, Kolkata - 700001 | Email: consultancy@saampark.in | Tel: +91 9901518570" 
                              value={companyForm.bottom_footer_text || ""} 
                              onChange={e => setCompanyForm({ ...companyForm, bottom_footer_text: e.target.value })} 
                              className="w-full px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed whitespace-pre-wrap font-medium"
                            />
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              This text displays directly inside the colored bottom banner of your official invoices and wraps across lines without cutting off with (...).
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div><label className="block font-semibold text-xs mb-1">City</label><Input value={companyForm.city} onChange={e => setCompanyForm({ ...companyForm, city: e.target.value })} className="text-xs" /></div>
                            <div><label className="block font-semibold text-xs mb-1">State</label><Input value={companyForm.state} onChange={e => setCompanyForm({ ...companyForm, state: e.target.value })} className="text-xs" /></div>
                            <div><label className="block font-semibold text-xs mb-1">PIN / Zip Code</label><Input placeholder="e.g. 700001" value={companyForm.zip} onChange={e => setCompanyForm({ ...companyForm, zip: e.target.value })} className="text-xs font-mono" /></div>
                            <div><label className="block font-semibold text-xs mb-1">Country</label><Input value={companyForm.country} onChange={e => setCompanyForm({ ...companyForm, country: e.target.value })} className="text-xs" /></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                            <div><label className="block font-semibold text-xs mb-1">Support / Contact Phone</label><Input placeholder="e.g. +91 90915 18567" value={companyForm.phone} onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })} className="text-xs" /></div>
                            <div><label className="block font-semibold text-xs mb-1">Official Support Email</label><Input placeholder="e.g. info@saampark.com" value={companyForm.email} onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })} className="text-xs" /></div>
                            <div><label className="block font-semibold text-xs mb-1">Official Website</label><Input placeholder="e.g. https://saampark.com" value={companyForm.website} onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })} className="text-xs" /></div>
                          </div>
                        </div>
                      )}

                      {companyTab === "branding" && (
                        <div className="space-y-4">
                          <div className="p-3.5 rounded-xl border border-border bg-muted/20">
                            <ImageUploadField
                              label="Primary Official Company Logo"
                              value={companyForm.logo_url}
                              onChange={url => setCompanyForm({ ...companyForm, logo_url: url })}
                              uploadNamePrefix="company_logo"
                              helperText="Shown on top of invoices, estimates, quotations, and official letters."
                            />
                          </div>
                        </div>
                      )}

                      {companyTab === "signatory" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div><label className="block font-semibold mb-1">Signatory Name</label><Input placeholder="e.g. Atanu De" value={companyForm.signatory_name} onChange={e => setCompanyForm({ ...companyForm, signatory_name: e.target.value })} /></div>
                            <div><label className="block font-semibold mb-1">Signatory Designation</label><Input placeholder="e.g. Managing Director" value={companyForm.signatory_designation} onChange={e => setCompanyForm({ ...companyForm, signatory_designation: e.target.value })} /></div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div className="p-3.5 rounded-2xl border border-border bg-surface space-y-3">
                              <ImageUploadField
                                label="Digital Signature Image"
                                value={companyForm.signature_image_url}
                                onChange={url => setCompanyForm({ ...companyForm, signature_image_url: url })}
                                uploadNamePrefix="company_signature"
                                aspectRatio="signature"
                                helperText="Rendered on the Authorised Signatory line on Invoices and Quotations."
                              />
                            </div>
                            <div className="p-3.5 rounded-2xl border border-border bg-surface space-y-3">
                              <ImageUploadField
                                label="Corporate Seal / Stamp Image"
                                value={companyForm.stamp_image_url}
                                onChange={url => setCompanyForm({ ...companyForm, stamp_image_url: url })}
                                uploadNamePrefix="company_stamp"
                                helperText="Rendered as the round official seal beside the signature."
                              />
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border space-y-3">
                            <span className="font-bold text-xs text-foreground block">Default Terms &amp; Conditions and Notes (Auto-inherited on all Documents)</span>
                            <div>
                              <label className="block font-semibold mb-1 text-[11px]">Default Terms &amp; Conditions</label>
                              <textarea
                                rows={3}
                                value={companyForm.terms_conditions}
                                onChange={e => setCompanyForm({ ...companyForm, terms_conditions: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Standard terms and conditions..."
                              />
                            </div>
                            <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[10.5px] text-blue-900 dark:text-blue-300">
                              ✓ <strong>Permanent Terms:</strong> These Terms & Conditions stay permanently active across all generated Invoices, Quotations & Estimates.
                            </div>
                          </div>
                        </div>
                      )}

                      {companyTab === "bank" && (
                        <div className="space-y-4">
                          {/* Dual Profile Switcher */}
                          <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-xl border border-border">
                            <button
                              type="button"
                              onClick={() => setCompanyBankProfileTab("gst")}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                companyBankProfileTab === "gst" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              GST Tax Invoices Bank Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => setCompanyBankProfileTab("nongst")}
                              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                companyBankProfileTab === "nongst" ? "bg-sky-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              Non-GST Invoices Bank Profile
                            </button>
                          </div>

                          {companyBankProfileTab === "gst" ? (
                            <div className="p-4 rounded-2xl border border-teal-500/20 bg-teal-50/20 dark:bg-teal-950/10 space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                                  GST Tax Invoices Bank &amp; UPI
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompanyForm(prev => ({
                                      ...prev,
                                      gst_bank_name: "Union Bank of India",
                                      gst_account_holder: prev.name || "SAAMPARK TECHNOLOGY AND RESEARCH PRIVATE LIMITED",
                                      gst_account_number: "130321010000212",
                                      gst_ifsc_code: "UBIN0913031",
                                      gst_bank_branch: "DEBRA BRANCH",
                                      gst_upi_id: "80638401@ubin"
                                    }))
                                  }}
                                  className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                >
                                  Fill Default GST Bank
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div><label className="block font-semibold mb-1">GST Bank Name</label><Input placeholder="e.g. HDFC Bank Ltd" value={companyForm.gst_bank_name} onChange={e => setCompanyForm({ ...companyForm, gst_bank_name: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">GST Account Holder</label><Input placeholder="e.g. Registered Company A/C" value={companyForm.gst_account_holder} onChange={e => setCompanyForm({ ...companyForm, gst_account_holder: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">GST Account Number</label><Input placeholder="e.g. 50200084920194" value={companyForm.gst_account_number} onChange={e => setCompanyForm({ ...companyForm, gst_account_number: e.target.value })} className="font-mono font-bold" /></div>
                                <div><label className="block font-semibold mb-1">GST IFSC Code</label><Input placeholder="e.g. HDFC0001234" value={companyForm.gst_ifsc_code} onChange={e => setCompanyForm({ ...companyForm, gst_ifsc_code: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase" /></div>
                                <div><label className="block font-semibold mb-1">GST Bank Branch</label><Input placeholder="e.g. Salt Lake Sector V" value={companyForm.gst_bank_branch} onChange={e => setCompanyForm({ ...companyForm, gst_bank_branch: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">GST UPI ID / VPA</label><Input placeholder="e.g. saamparkgst@hdfcbank" value={companyForm.gst_upi_id} onChange={e => setCompanyForm({ ...companyForm, gst_upi_id: e.target.value })} className="font-mono" /></div>
                              </div>
                              <div className="pt-2">
                                <ImageUploadField
                                  label="Company GST Payment Scanner / QR Code"
                                  value={companyForm.gst_payment_qr_url}
                                  onChange={url => setCompanyForm({ ...companyForm, gst_payment_qr_url: url })}
                                  uploadNamePrefix="company_gst_qr"
                                  helperText="Rendered on GST Tax Invoices for instant scan-to-pay settlement."
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 rounded-2xl border border-sky-500/20 bg-sky-50/20 dark:bg-sky-950/10 space-y-3.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">
                                  Non-GST Invoices Bank &amp; UPI
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompanyForm(prev => ({
                                      ...prev,
                                      nongst_bank_name: "ICICI Bank Ltd",
                                      nongst_account_holder: prev.brand_name || "SAAMPARK GROUP",
                                      nongst_account_number: "000201012345",
                                      nongst_ifsc_code: "ICIC0000002",
                                      nongst_bank_branch: "Kolkata Main Branch",
                                      nongst_upi_id: "saamparkcommercial@icici"
                                    }))
                                  }}
                                  className="text-[10px] text-sky-600 dark:text-sky-400 font-bold hover:underline"
                                >
                                  Fill Default Non-GST Bank
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div><label className="block font-semibold mb-1">Non-GST Bank Name</label><Input placeholder="e.g. ICICI Bank Ltd" value={companyForm.nongst_bank_name} onChange={e => setCompanyForm({ ...companyForm, nongst_bank_name: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">Non-GST Account Holder</label><Input placeholder="e.g. Operating Commercial A/C" value={companyForm.nongst_account_holder} onChange={e => setCompanyForm({ ...companyForm, nongst_account_holder: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">Non-GST Account Number</label><Input placeholder="e.g. 000201012345" value={companyForm.nongst_account_number} onChange={e => setCompanyForm({ ...companyForm, nongst_account_number: e.target.value })} className="font-mono font-bold" /></div>
                                <div><label className="block font-semibold mb-1">Non-GST IFSC Code</label><Input placeholder="e.g. ICIC0000002" value={companyForm.nongst_ifsc_code} onChange={e => setCompanyForm({ ...companyForm, nongst_ifsc_code: e.target.value.toUpperCase() })} className="font-mono font-bold uppercase" /></div>
                                <div><label className="block font-semibold mb-1">Non-GST Bank Branch</label><Input placeholder="e.g. Main Market Branch" value={companyForm.nongst_bank_branch} onChange={e => setCompanyForm({ ...companyForm, nongst_bank_branch: e.target.value })} /></div>
                                <div><label className="block font-semibold mb-1">Non-GST UPI ID / VPA</label><Input placeholder="e.g. saamparknongst@icici" value={companyForm.nongst_upi_id} onChange={e => setCompanyForm({ ...companyForm, nongst_upi_id: e.target.value })} className="font-mono" /></div>
                              </div>
                              <div className="pt-2">
                                <ImageUploadField
                                  label="Company Non-GST Payment Scanner / QR Code"
                                  value={companyForm.nongst_payment_qr_url}
                                  onChange={url => setCompanyForm({ ...companyForm, nongst_payment_qr_url: url })}
                                  uploadNamePrefix="company_nongst_qr"
                                  helperText="Used on commercial Non-GST Invoices."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {companyTab === "terms" && (
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                            <FileText size={15} className="shrink-0 text-blue-600" />
                            <span><strong>Permanent Terms &amp; Conditions:</strong> These terms are saved permanently in MySQL database and auto-inherited on all Invoices, Quotations, and Estimates issued by this company.</span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                                Default Terms &amp; Conditions *
                              </label>
                              <textarea
                                rows={6}
                                value={companyForm.terms_conditions}
                                onChange={e => setCompanyForm({ ...companyForm, terms_conditions: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                                placeholder="1. All disputes subject to local jurisdiction only.&#10;2. Goods/Services once delivered are non-refundable.&#10;3. Disputed items must be notified within 7 business days."
                              />
                              <span className="text-[10px] text-muted-foreground block mt-1">
                                Printed at the bottom of official invoices &amp; estimates.
                              </span>
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                                Invoice Notes / Remittance Instructions
                              </label>
                              <textarea
                                rows={3}
                                value={companyForm.invoice_notes}
                                onChange={e => setCompanyForm({ ...companyForm, invoice_notes: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Thank you for partnering with us. Please remit payment according to the stated terms."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                                Quotation &amp; Proposal Validity Notes
                              </label>
                              <textarea
                                rows={2}
                                value={companyForm.quotation_notes}
                                onChange={e => setCompanyForm({ ...companyForm, quotation_notes: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="This quotation is valid for 30 calendar days from the date of issuance."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">
                                Bottom Footer Legal Text
                              </label>
                              <Input
                                value={companyForm.bottom_footer_text}
                                onChange={e => setCompanyForm({ ...companyForm, bottom_footer_text: e.target.value })}
                                placeholder="e.g. Balichak (Station Road), Debra - 721124 | Support: info@saampark.com"
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Left Pane Footer Actions */}
                    <div className="flex items-center justify-between p-3.5 border-t border-border shrink-0 bg-muted/20">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[10px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Real-time live synced</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCompanyModal(false)}>Cancel</Button>
                        <Button size="sm" onClick={() => saveCompany(false)} disabled={saving || (!companyForm.name.trim() && !companyForm.brand_name.trim())} className="font-bold bg-blue-600 hover:bg-blue-700 text-white">
                          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
                          Update Company Details
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Live Document Preview Studio Pane */}
                {(companyModalViewMode === "split" || companyModalViewMode === "preview") && (
                  <div className={`flex flex-col h-full overflow-hidden bg-zinc-100 dark:bg-zinc-950/80 ${
                    companyModalViewMode === "split" ? "w-full lg:w-[52%] xl:w-[55%]" : "w-full"
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
                          onClick={() => setCompanyZoom(prev => Math.max(60, prev - 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom Out"
                        >
                          -
                        </button>
                        <span className="font-mono text-[10px] font-bold w-10 text-center">{companyZoom}%</span>
                        <button
                          type="button"
                          onClick={() => setCompanyZoom(prev => Math.min(150, prev + 10))}
                          className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-surface border border-border rounded hover:bg-muted"
                          title="Zoom In"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => setCompanyZoom(100)}
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
                          onClick={() => addCustomStampTo(setCompanyCustomStamps, "CUSTOM NOTE", "#2563eb", "badge")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 hover:bg-blue-200 cursor-pointer"
                          title="Add draggable text sticker with zoom in/out & styling"
                        >
                          + Text Note
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setCompanyCustomStamps, "PAID IN FULL", "#059669", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 hover:bg-emerald-200 cursor-pointer"
                        >
                          + PAID Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setCompanyCustomStamps, "OFFICIAL SEAL", "#0d9488", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 hover:bg-teal-200 cursor-pointer"
                        >
                          + SEAL Stamp
                        </button>
                        <button
                          type="button"
                          onClick={() => addCustomStampTo(setCompanyCustomStamps, "CONFIDENTIAL", "#dc2626", "stamp")}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 hover:bg-rose-200 cursor-pointer"
                        >
                          + CONFIDENTIAL
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCompanySignaturePos({ x: 0, y: 0 })
                            setCompanyStampPos({ x: 0, y: 0 })
                            setCompanyCustomStamps([])
                          }}
                          className="px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border rounded"
                        >
                          Reset Drag
                        </button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => saveCompany(true)}
                          disabled={saving}
                          className={`font-bold h-7 px-3 text-xs gap-1 shadow-sm shrink-0 ml-auto transition-all ${
                            previewSaveSuccess 
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                          title="Save preview layout, signature/stamp positions, and live canvas modifications"
                        >
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          {saving ? "Saving..." : previewSaveSuccess ? "Saved Successfully!" : "Save Preview"}
                        </Button>
                      </div>
                    </div>

                    {/* Interactive Placement & Live Edit Notice */}
                    <div className="px-3 py-1.5 bg-amber-50/90 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-900/50 text-[10px] text-amber-900 dark:text-amber-300 flex flex-wrap items-center justify-between gap-2 shrink-0">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className="flex items-center gap-1.5 font-medium"><Sparkles size={12} className="text-amber-600 dark:text-amber-400" /> <strong className="font-semibold">Interactive Studio:</strong> Direct document editing and dynamic positioning</span>
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
                        <span className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-200">
                          Sig: X:{companySignaturePos.x} Y:{companySignaturePos.y}
                        </span>
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-200">
                          Stamp: X:{companyStampPos.x} Y:{companyStampPos.y}
                        </span>
                      </div>
                    </div>

                    {/* Scrollable Live Canvas with Zoom */}
                    <div className="flex-1 overflow-y-auto overflow-x-auto p-4 flex justify-center items-start">
                      <div 
                        className="w-full max-w-[820px] shadow-xl rounded-2xl transition-transform duration-150 origin-top"
                        style={{ transform: `scale(${companyZoom / 100})`, transformOrigin: "top center" }}
                      >
                        <OfficialInvoiceDocument
                          invoice={{
                            id: "DEMO-INV-001",
                            invoiceNumber: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                            invoice_number: previewInvoiceType === "gst" ? "INV-29102026001" : "NG-29102026001",
                            date: "2026-09-18",
                            issueDate: "2026-09-18",
                            dueDate: "2026-10-03",
                            companyId: editingCompany?.id || companyForm.slug || "tech",
                            company_id: editingCompany?.id || companyForm.slug || "tech",
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
                            terms: companyForm.terms_conditions || "1. Payment is due within statutory terms.\n2. Goods & Services once delivered are subject to project sign-off.\n3. Disputed items must be notified within 7 days.",
                            notes: companyForm.invoice_notes || "Thank you for your business."
                          } as any}
                          companyDetails={companyForm as any}
                          interactive={true}
                          logoPosition={companyLogoPos}
                          onLogoPositionChange={setCompanyLogoPos}
                          logoScale={companyLogoScale}
                          onLogoScaleChange={setCompanyLogoScale}
                          stampPosition={companyStampPos}
                          onStampPositionChange={setCompanyStampPos}
                          stampScale={companyStampScale}
                          onStampScaleChange={setCompanyStampScale}
                          signaturePosition={companySignaturePos}
                          onSignaturePositionChange={setCompanySignaturePos}
                          signatureScale={companySignatureScale}
                          onSignatureScaleChange={setCompanySignatureScale}
                          customStamps={companyCustomStamps}
                          onCustomStampMove={(id, pos) => setCompanyCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...pos } : s))}
                          onCustomStampUpdate={(id, updates) => setCompanyCustomStamps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                          onRemoveCustomStamp={(id) => setCompanyCustomStamps(prev => prev.filter(s => s.id !== id))}
                          onAddCustomStamp={(s) => addCustomStampTo(setCompanyCustomStamps, s?.text || "NOTE", s?.color || "#0d9488", s?.bgStyle || "badge")}
                          onFieldChange={(field, val) => setCompanyForm(prev => ({ ...prev, [field]: val }))}
                        />
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
