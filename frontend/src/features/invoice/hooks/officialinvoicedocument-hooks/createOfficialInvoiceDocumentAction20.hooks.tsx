"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  MapPin, Phone, Mail, Globe, Building2, Landmark, ShieldCheck, 
  Award, Sparkles, UserCheck, Briefcase, FileText, QrCode, CreditCard, 
  CheckCircle2, Layers, Check, Megaphone
} from "lucide-react"
import { InvoiceItem, InvoiceLineItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { CompanyPaymentSettings } from "@/features/settings/services/companyPaymentService"
import { ClientItem } from "@/features/clients/types"
import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getQrCodeDataUri } from "@/lib/qrCode"
import { OfficialInvoiceDocumentSection1 } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentSection1"
import { createOfficialInvoiceDocumentHandler1 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentHandler1.hooks"
import { createOfficialInvoiceDocumentHandler2 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentHandler2.hooks"
import { createOfficialInvoiceDocumentHandler3 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentHandler3.hooks"
import { createOfficialInvoiceDocumentHandler4 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentHandler4.hooks"
import { OfficialInvoiceDocumentSection2 } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentSection2"
import { type CustomTextStamp, TextEditContext, type OfficialInvoiceDocumentProps, EditableText, formatInvoiceDate, numberToIndianWords, safeFormatCurrency } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentHelpers"

export function createOfficialInvoiceDocumentAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { invoice, resolvedTermsAndNotes, interactive, onFieldChange, resolvedStampUrl, fullRegisteredCompanyName, isSubBranchIssued, activeSubBranch, isBranchIssued, activeBranch, resolvedSignatureUrl, resolvedSignatoryName, resolvedSignatoryDesignation, theme, resolvedBottomFooterText } = getCtrl();
    const __ctrl = getCtrl();
    const __fn: any = (pageNumber: number = 1, totalPgs: number = 1) => (
    <div className="flex-1 flex flex-col justify-between space-y-2.5 mt-auto pt-1">
      <OfficialInvoiceDocumentSection2 ctrl={__ctrl} />

      {/* DIGITAL MARKETING & SOCIAL MEDIA CAMPAIGN PACKAGE SPECIFICATIONS (FORM NO - 9) */}
      {Boolean((invoice as any)?.marketingPackage?.enabled || (invoice as any)?.marketingPackage?.planName || (invoice as any)?.primaryCategory === "Digital Marketing") && (
        <div className="p-3 sm:p-3.5 rounded-lg border border-purple-200 bg-purple-50/70 dark:bg-purple-950/30 text-xs space-y-2 shadow-2xs">
          <div className="flex items-center justify-between border-b border-purple-200/80 dark:border-purple-800/60 pb-1.5">
            <span className="font-extrabold text-purple-900 dark:text-purple-200 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Megaphone size={14} className="text-purple-700 dark:text-purple-400" />
              <span>DIGITAL MARKETING CAMPAIGN &amp; ADS PACKAGE ({(invoice as any).marketingPackage?.planName || "Grow - 2"})</span>
            </span>
            <span className="text-[9.5px] font-black px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100 uppercase tracking-wider">
              FORM NO - 9
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] sm:text-[11px] text-zinc-700 dark:text-zinc-300">
            <div>
              <span className="text-zinc-500 font-medium">Duration:</span>{" "}
              <strong className="text-purple-950 dark:text-purple-200">{(invoice as any).marketingPackage?.packageDuration || "1 month"}</strong>{" "}
              {(invoice as any).marketingPackage?.startDate && <span>({(invoice as any).marketingPackage.startDate} - {(invoice as any).marketingPackage.expireDate || "Ongoing"})</span>}
            </div>
            <div>
              <span className="text-zinc-500 font-medium">Deliverables:</span>{" "}
              <strong className="text-purple-950 dark:text-purple-200">{(invoice as any).marketingPackage?.postersCount || 12} Posters/Creatives</strong> •{" "}
              <strong className="text-purple-950 dark:text-purple-200">{(invoice as any).marketingPackage?.videosCount || 2} AI Video Reels</strong>
            </div>
            {(invoice as any).marketingPackage?.hasRealModelShoot && (
              <div className="col-span-1 sm:col-span-2 text-purple-800 dark:text-purple-300 font-semibold flex items-center gap-1">
                <span>📸 Real Model Shoot: {(invoice as any).marketingPackage.modelShootDate || "Scheduled"} ({(invoice as any).marketingPackage.modelShootNotes || "Included in Retainer"})</span>
              </div>
            )}
            {(invoice as any).marketingPackage?.targetLocations && (
              <div className="col-span-1 sm:col-span-2 text-zinc-600 dark:text-zinc-400 text-[10px]">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">🎯 Geo Audience &amp; Pin Codes:</span> {(invoice as any).marketingPackage.targetLocations}
              </div>
            )}
            {Array.isArray((invoice as any).assignedMembers) && (invoice as any).assignedMembers.length > 0 && (
              <div className="col-span-1 sm:col-span-2 text-[10px] text-purple-900 dark:text-purple-300 font-medium flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="font-bold">👥 Assigned Marketing Team:</span>
                {(invoice as any).assignedMembers.map((m: any, i: number) => (
                  <span key={i} className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-bold border border-purple-200">
                    {m.memberName} ({m.memberRole || "Specialist"})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TERMS & CONDITIONS (Enlarged, Clear & Permanent from Company Section) */}
      {(resolvedTermsAndNotes || interactive) && (
        <div className="p-3 sm:p-3.5 rounded-lg border border-zinc-300/90 dark:border-zinc-700 bg-zinc-50/90 dark:bg-zinc-900/60 text-[9.5px] sm:text-[10.5px] text-zinc-700 dark:text-zinc-300 space-y-1 shadow-2xs">
          <EditableText
            value="Terms & Conditions:"
            interactive={interactive}
            className="font-extrabold text-zinc-900 dark:text-zinc-100 uppercase text-[9px] sm:text-[9.5px] tracking-wider block"
          />
          <EditableText
            value={resolvedTermsAndNotes}
            onChange={(val) => onFieldChange?.("terms_conditions", val)}
            interactive={interactive}
            fieldKey="terms_conditions"
            placeholder="Click to add default terms and conditions..."
            className="whitespace-pre-line leading-relaxed font-normal block"
          />
        </div>
      )}

      {/* STICKY BOTTOM SECTION: SIGNATURES, OFFICIAL SEAL & FOOTER BANNER */}
      <div className="space-y-2 mt-auto pt-1">
        {/* SIGNATURES & OFFICIAL SEAL ROW */}
        <div className="flex flex-row justify-between items-end gap-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800">
          {/* Left: Customer Acceptance */}
          <div className="text-center space-y-1">
            <div className="h-12 flex flex-col items-center justify-end pb-1">
              {invoice.clientAccepted ? (
                <div className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-center font-sans shadow-2xs">
                  <div className="text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <span>✓ Accepted Online</span>
                  </div>
                  <div className="text-[7px] text-zinc-600 dark:text-zinc-400 font-mono truncate max-w-[150px]">
                    {invoice.acceptedBy || invoice.client || "Client"}
                  </div>
                  {invoice.acceptedAt && (
                    <div className="text-[6.5px] text-zinc-500 font-mono">
                      {new Date(Number(invoice.acceptedAt) || invoice.acceptedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="w-44 border-t-2 border-zinc-400 dark:border-zinc-600 pt-1">
              <EditableText
                value="CUSTOMER SIGNATURE"
                interactive={interactive}
                className="text-[9px] font-black uppercase text-zinc-700 dark:text-zinc-300 block"
              />
              <EditableText
                value={invoice.clientAccepted ? "✓ Digitally Accepted & Confirmed" : "Accepted & Confirmed"}
                interactive={interactive}
                className={`text-[7.5px] font-medium block ${invoice.clientAccepted ? "text-emerald-600 font-bold" : "text-zinc-500"}`}
              />
            </div>
          </div>

          {/* Right: Company Authorized Signatory & Official Stamp (Tightly paired together) */}
          <div className="flex items-end justify-end gap-3 shrink-0">
            {/* Official Stamp / Seal - positioned right close to the signature */}
            {resolvedStampUrl ? (
              <div className="w-18 h-18 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center p-0.5 select-none relative mb-1">
                <img 
                  src={resolvedStampUrl} 
                  alt="Official Company Seal" 
                  className="max-h-18 max-w-18 sm:max-h-20 sm:max-w-20 object-contain drop-shadow-xs pointer-events-none select-none" 
                />
              </div>
            ) : null}

            {/* Company Authorized Signatory */}
            <div className="text-center space-y-0.5 min-w-[160px] sm:min-w-[175px] select-none">
              <EditableText
                value={`For ${fullRegisteredCompanyName} ${isSubBranchIssued && activeSubBranch ? `(${activeSubBranch.name})` : isBranchIssued && activeBranch ? `(${activeBranch.name})` : ""}`}
                interactive={interactive}
                className="text-[8.5px] font-bold text-zinc-500 uppercase tracking-tight truncate max-w-[175px] block"
              />
              <div className="h-12 flex items-center justify-center">
                {resolvedSignatureUrl ? (
                  <img 
                    src={resolvedSignatureUrl} 
                    alt="Authorized Signature" 
                    className="max-h-12 max-w-[150px] object-contain drop-shadow-xs pointer-events-none select-none" 
                  />
                ) : (
                  /* Elegant Digital Calligraphic Signature Graphic */
                  <div className="flex flex-col items-center justify-center">
                    <EditableText
                      value={resolvedSignatoryName || "Authorized Signatory"}
                      interactive={interactive}
                      className="font-sans font-extrabold text-sm sm:text-base tracking-wide text-zinc-800 dark:text-zinc-200"
                    />
                    <EditableText
                      value="✓ Digitally Authorized"
                      interactive={interactive}
                      className="text-[6.5px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase flex items-center gap-0.5"
                    />
                  </div>
                )}
              </div>
              <div className="w-full border-t-2 border-zinc-400 dark:border-zinc-600 pt-1">
                <EditableText
                  value={resolvedSignatoryName || "Authorized Signatory"}
                  onChange={(val) => onFieldChange?.("signatory_name", val)}
                  interactive={interactive}
                  fieldKey="signatory_name"
                  placeholder="Signatory name..."
                  className="text-[9px] font-black uppercase text-zinc-800 dark:text-zinc-200 font-bold leading-tight block truncate"
                />
                <EditableText
                  value={resolvedSignatoryDesignation || "Managing Director"}
                  onChange={(val) => onFieldChange?.("signatory_designation", val)}
                  interactive={interactive}
                  fieldKey="signatory_designation"
                  placeholder="Designation..."
                  className="text-[7.5px] text-zinc-500 font-medium leading-tight block truncate"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BANNER WITH CUSTOM FOOTER / SUPPORT & CONTACT DETAILS & PAGE NUMBER */}
        <div className={`rounded-lg ${theme.headerGradient} text-white px-3 py-1.5 text-[8px] sm:text-[8.5px] font-medium flex items-center justify-between gap-2 shadow-xs`}>
          <div className="flex-1 min-w-0 pr-2">
            <EditableText
              value={resolvedBottomFooterText}
              onChange={(val) => onFieldChange?.("bottom_footer_text", val)}
              interactive={interactive}
              fieldKey="bottom_footer_text"
              placeholder="Official Contact & Support: Email • Tel • Web (or custom corporate office address)..."
              className="text-white text-[8px] sm:text-[8.5px] font-medium whitespace-pre-wrap break-words leading-relaxed"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0 self-center text-[8px] sm:text-[8.5px]">
            <span className="font-mono font-bold bg-black/25 px-2 py-0.5 rounded text-[8px] shrink-0">
              Page {pageNumber} of {totalPgs}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
    return __fn(...__args);
  };
}
