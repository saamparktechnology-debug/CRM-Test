"use client"

import * as React from "react"
import { 
  Printer, Send, X, Building2, MapPin, Phone, Mail, Globe, 
  Shield, Calendar, Calculator, CheckCircle2, Clock, Landmark, 
  Stamp, FileCheck, ArrowRight, QrCode, FileText, UserCheck, Sparkles,
  Check, ChevronRight, Layers, Award, ShieldCheck, BadgeCheck, FileCode, CheckSquare, Megaphone,
  ListChecks, AlertCircle, Edit
} from "lucide-react"
import { useAuthStore, Company, Branch, DEFAULT_COMPANIES, getCompanyLogoUrl } from "@/store/useAuthStore"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { printDocument } from "@/lib/printUtils"
import { type QuotationLineItem, type QuotationData, type OfficialQuotationDocumentProps, formatQuotationDate, numberToIndianWords } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentHelpers"

export function OfficialQuotationDocumentSection3({ ctrl }: { ctrl: any }) {
  const { resolvedBrandName, resolvedDivisionName, quotation, theme, isNonGst, lineItems, subtotal, cgst, sgst, grandTotal, hasAnyPaymentInfo, hasBankName, resolvedBankName, hasAccountHolder, resolvedAccountHolder, hasAccountNum, resolvedAccountNumber, hasIfsc, resolvedIfscCode, hasBankBranch, resolvedBankBranch, hasUpi, resolvedUpiId, hasQr, resolvedPaymentQrUrl, activeSubBranch, activeBranch, activeCompany, resolvedSignatureUrl, resolvedStampUrl, resolvedSignatoryName, resolvedSignatoryDesignation, resolvedAddress } = ctrl;
  return (
    <>
      {/* ── END OF INTERMEDIATE PAGES ── */}

      {/* Visual Page Break Indicator on Screen (Hidden when printed) */}
      <div className="print:hidden flex items-center justify-center my-4 gap-3 select-none">
        <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
          📄 End of Page 2 • Commercial Settlement, Banking &amp; Signatures on Final Page
        </span>
        <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
      </div>

      {/* ── VERY LAST PAGE: Commercial Summary, Banking & Remittance Details, Terms, Dual Signatures ── */}
      <div 
        className="quotation-final-page break-before-page print:break-before-page block w-full bg-white text-zinc-900 font-sans p-5 sm:p-6 text-xs shadow-xl border border-zinc-200/90 rounded-lg space-y-4 print:p-[4mm_6mm] print:border-none print:shadow-none print:rounded-none min-h-[297mm] print:min-h-0 pt-4"
        style={{ breakBefore: 'page', pageBreakBefore: 'always' }}
      >
        {/* Running Corporate Header for Final Page */}
        <div className="avoid-break break-inside-avoid flex items-center justify-between border-b-2 border-zinc-900 pb-2 text-[9.5px]">
          <div className="flex items-center gap-2">
            <span className="font-black text-zinc-950 uppercase tracking-wider">{resolvedBrandName} {resolvedDivisionName}</span>
            <span className="text-zinc-300">|</span>
            <span className="font-mono text-zinc-600 font-bold">QUOTATION REF: {quotation.number}</span>
          </div>
          <span className="font-bold text-emerald-800 uppercase tracking-wider text-[9px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Section III: Commercial Settlement &amp; Mutual Sign-off
          </span>
        </div>
        {/* 6. Consolidated Commercial Summary Table */}
        <div className="avoid-break break-inside-avoid border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-2.5 bg-zinc-900 text-white flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Calculator size={13} className="text-teal-400" />
              <span>SECTION III: CONSOLIDATED COMMERCIAL SUMMARY &amp; TAXATION</span>
            </span>
            <span className="text-[8px] text-zinc-300">All prices in Indian National Rupee (INR)</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead className={`${theme.tableHeaderBg} uppercase text-[9.5px] tracking-wider`}>
              <tr>
                <th className="py-2.5 px-3 w-10 text-center font-bold">#</th>
                <th className="py-2.5 px-4 font-bold">Scope Summary &amp; Module List</th>
                <th className="py-2.5 px-3 text-center font-bold">SAC/HSN</th>
                <th className="py-2.5 px-3 text-center font-bold">Qty</th>
                <th className="py-2.5 px-3 text-right font-bold">Unit Price (₹)</th>
                <th className="py-2.5 px-3 text-right font-bold">Taxable Value (₹)</th>
                {!isNonGst && (
                  <>
                    <th className="py-2.5 px-3 text-right font-bold">CGST (9%)</th>
                    <th className="py-2.5 px-3 text-right font-bold">SGST (9%)</th>
                  </>
                )}
                <th className="py-2.5 px-4 text-right font-bold">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800 bg-white">
              {lineItems.map((it, idx) => {
                const itemBase = it.total || (it.unitPrice * it.quantity)
                const itemTax = isNonGst ? 0 : Math.round(itemBase * 0.18)
                const itemCgst = Math.round(itemTax / 2)
                const itemSgst = itemTax - itemCgst
                const itemGross = itemBase + itemTax

                return (
                  <tr key={it.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-zinc-500 font-bold">{idx + 1}</td>
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-zinc-950">{it.name || it.serviceName}</div>
                      <span className="font-mono text-[9px] text-teal-700">Sprint: {it.deliverableTime || "1-2 Weeks"}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-zinc-500">
                      {it.sac || it.sacCode || "998311"}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold">{it.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">₹{it.unitPrice.toLocaleString("en-IN")}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">₹{itemBase.toLocaleString("en-IN")}</td>
                    {!isNonGst && (
                      <>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600">₹{itemCgst.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-zinc-600">₹{itemSgst.toLocaleString("en-IN")}</td>
                      </>
                    )}
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-zinc-950">
                      ₹{itemGross.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-zinc-50 border-t border-zinc-200 font-semibold text-zinc-700">
              <tr>
                <td colSpan={3} className="py-2 px-4 font-bold uppercase text-[10px] text-zinc-600">Subtotal Scope Value</td>
                <td className="py-2 px-3 text-center font-mono">{lineItems.reduce((acc, it) => acc + (it.quantity || 1), 0)}</td>
                <td></td>
                <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</td>
                {!isNonGst && (
                  <>
                    <td className="py-2 px-3 text-right font-mono">₹{cgst.toLocaleString("en-IN")}</td>
                    <td className="py-2 px-3 text-right font-mono">₹{sgst.toLocaleString("en-IN")}</td>
                  </>
                )}
                <td className="py-2 px-4 text-right font-mono font-black text-teal-800">₹{grandTotal.toLocaleString("en-IN")}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 7. Computation, Words, Banking & Remittance Grid */}
        <div className="avoid-break break-inside-avoid grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
          {/* Left Column: Words & Payment Details */}
          <div className="sm:col-span-7 space-y-3">
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-xs">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-teal-900 block mb-0.5">
                Total Quotation Value in Words:
              </span>
              <p className="font-sans font-bold text-teal-950 text-xs leading-snug">
                {numberToIndianWords(grandTotal)}
              </p>
            </div>

            {/* Bank Remittance Details Box */}
            {hasAnyPaymentInfo && (
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70 space-y-1.5 text-[10.5px]">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1">
                  <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <Landmark size={12} className="text-teal-700" />
                    <span>Beneficiary Remittance &amp; Banking Details</span>
                  </span>
                  <span className="text-[9px] font-mono text-zinc-500">NEFT / RTGS / IMPS / UPI</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5 flex-1">
                    {hasBankName && (
                      <div className="flex justify-between"><span className="text-zinc-500">Bank Name:</span> <span className="font-semibold text-zinc-900">{resolvedBankName}</span></div>
                    )}
                    {hasAccountHolder && (
                      <div className="flex justify-between"><span className="text-zinc-500">Account Name:</span> <span className="font-semibold text-zinc-900">{resolvedAccountHolder}</span></div>
                    )}
                    {hasAccountNum && (
                      <div className="flex justify-between"><span className="text-zinc-500">Account Number:</span> <span className="font-mono font-bold text-zinc-900">{resolvedAccountNumber}</span></div>
                    )}
                    {hasIfsc && (
                      <div className="flex justify-between"><span className="text-zinc-500">IFSC Code:</span> <span className="font-mono font-bold text-teal-700">{resolvedIfscCode}</span></div>
                    )}
                    {hasBankBranch && (
                      <div className="flex justify-between"><span className="text-zinc-500">Branch:</span> <span className="font-semibold text-zinc-800">{resolvedBankBranch}</span></div>
                    )}
                    {hasUpi && (
                      <div className="flex justify-between"><span className="text-zinc-500">UPI ID:</span> <span className="font-mono font-bold text-emerald-700">{resolvedUpiId}</span></div>
                    )}
                  </div>

                  {hasQr && (
                    <div className="text-center shrink-0">
                      <img 
                        src={resolvedPaymentQrUrl!} 
                        alt="UPI QR" 
                        className="w-16 h-16 border border-zinc-200 rounded-lg p-1 bg-white mx-auto shadow-2xs" 
                      />
                      <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-tight block mt-0.5">Scan to Remit</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Calculations */}
          <div className="sm:col-span-5 space-y-2 text-xs">
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 space-y-1.5">
              <div className="flex justify-between text-zinc-600 text-[11px]">
                <span>{isNonGst ? "Commercial Scope Subtotal:" : "Taxable Value (Subtotal):"}</span>
                <span className="font-mono font-semibold text-zinc-900">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {!isNonGst && (
                <>
                  <div className="flex justify-between text-zinc-600 text-[11px]">
                    <span>Central GST (CGST 9%):</span>
                    <span className="font-mono font-semibold text-zinc-900">₹{cgst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600 text-[11px]">
                    <span>State GST (SGST 9%):</span>
                    <span className="font-mono font-semibold text-zinc-900">₹{sgst.toLocaleString("en-IN")}</span>
                  </div>
                </>
              )}
              <div className="border-t-2 border-teal-700 pt-1.5 flex justify-between items-center text-sm font-black text-zinc-950">
                <span className="uppercase text-xs tracking-wide">Total Quotation Value:</span>
                <span className="text-base text-teal-800 font-mono font-black">₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[9.5px] text-amber-900 leading-tight">
              <strong>Notice:</strong> This quotation is valid for 30 calendar days from issue date. Deliverables and sprints commence upon mobilization advance clearance.
            </div>
          </div>
        </div>

        {/* 8. Commercial Terms & Conditions */}
        <div className="avoid-break break-inside-avoid p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
          <div className="text-[9.5px] font-bold uppercase tracking-wider text-teal-900 flex items-center justify-between">
            <span>OFFICIAL TERMS &amp; CONDITIONS OF ENGAGEMENT:</span>
            <span className="text-zinc-400 font-normal text-[8.5px]">Standard Corporate Scope Policy</span>
          </div>
          <p className="text-[10px] text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
            {quotation.terms || activeSubBranch?.terms_conditions || activeBranch?.terms_conditions || activeCompany?.terms_conditions || "1. Quotation is valid for 30 days from date of issuance.\n2. 50% mobilization advance required before project kick-off.\n3. Applicable GST 18% billed as per statutory norms.\n4. All disputes subject to local jurisdiction only."}
          </p>
        </div>

        {/* 9. Official Dual Signatures & Acceptance Box */}
        <div className="avoid-break break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Customer Acceptance Sign */}
          <div className="p-3 border border-dashed border-zinc-300 rounded-xl space-y-3 bg-zinc-50/40">
            <div className="flex justify-between text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Client Acceptance &amp; Purchase Order</span>
              <span>
                {quotation.acceptedAt 
                  ? `Accepted: ${formatQuotationDate(quotation.acceptedAt)}` 
                  : "Date: ____________"}
              </span>
            </div>
            {quotation.status === "Accepted" || quotation.clientAccepted ? (
              <div className="py-1.5 px-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-center font-sans shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-emerald-700 flex items-center justify-center gap-1">
                  <span>✓ Digitally Accepted &amp; Confirmed</span>
                </div>
                <div className="text-[9px] text-zinc-600 font-mono mt-0.5">
                  Confirmed by: {quotation.acceptedBy || quotation.customer || "Client"}
                </div>
              </div>
            ) : (
              <div className="h-5" />
            )}
            <div className="pt-1.5 border-t border-zinc-300 text-center">
              <p className="font-bold text-zinc-900 text-xs">{quotation.customer}</p>
              <p className="text-[9.5px] text-zinc-400">
                {quotation.status === "Accepted" || quotation.clientAccepted ? "✓ Verified Online Acceptance" : "Authorized Signature & Company Seal"}
              </p>
            </div>
          </div>

          {/* Issuer Signature & Official Stamp */}
          <div className="p-3 border border-zinc-200 rounded-xl bg-zinc-50/60 flex flex-col items-center justify-center text-center relative">
            <div className="w-full text-left text-[9.5px] font-bold uppercase tracking-wider text-teal-900 mb-1">
              For {resolvedBrandName} {resolvedDivisionName}
            </div>

            <div className="flex items-center justify-center gap-4 my-1 min-h-[50px]">
              {resolvedSignatureUrl ? (
                <img src={resolvedSignatureUrl} alt="Signature" className="h-12 object-contain" />
              ) : (
                <div className="h-10 flex items-center justify-center font-sans font-semibold text-zinc-400 text-xs">
                  [Digitally Authorized]
                </div>
              )}

              {resolvedStampUrl && (
                <img src={resolvedStampUrl} alt="Stamp" className="h-14 w-14 object-contain opacity-90" />
              )}
            </div>

            <div className="w-full pt-1.5 border-t border-zinc-300">
              <p className="font-bold text-zinc-950 text-xs">{resolvedSignatoryName}</p>
              <p className="text-[9.5px] font-medium text-zinc-500">{resolvedSignatoryDesignation}</p>
              <p className="text-[8.5px] text-zinc-400 mt-0.5">This quotation constitutes a binding commercial offer upon receipt of confirmation.</p>
            </div>
          </div>
        </div>

        {/* 10. Dedicated Bottom Declarations & Terms Section */}
        <div className="avoid-break break-inside-avoid w-full rounded-md border border-zinc-200/90 bg-zinc-50/70 p-2 text-[8px] sm:text-[8.5px] text-zinc-600 leading-tight space-y-0.5">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-0.5">
            <span className="font-bold uppercase tracking-wider text-zinc-700 text-[8px] flex items-center gap-1">
              <span>⚖️ Statutory Declaration &amp; Legal Terms:</span>
            </span>
            <span className="text-[7.5px] text-zinc-500 font-medium">
              Subject to Kolkata Jurisdiction • Formal Corporate Commercial Quotation
            </span>
          </div>
          <p className="text-zinc-600 italic leading-relaxed">
            {(quotation as any).bottomNote || (quotation as any).bottomDetails || "We declare that this quotation shows the estimated price of the services described and that all particulars are true and correct. All disputes are subject to Kolkata jurisdiction."}
          </p>
        </div>

        {/* 11. Footer Jurisdiction Notice */}
        <div className="avoid-break break-inside-avoid text-center text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-200">
          Corporate Office: {resolvedAddress || "Kolkata, West Bengal"} • Registered under the Companies Act • All disputes subject to local jurisdiction only.
        </div>

        {/* Final Page Official Footer Banner */}
        <div className="mt-auto pt-2 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-500 font-medium">
          <span>Binding Corporate Engagement Agreement &amp; Remittance Dossier</span>
          <span className="font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">Page 3 of 3 (Final)</span>
        </div>
      </div>
    </>
  );
}
