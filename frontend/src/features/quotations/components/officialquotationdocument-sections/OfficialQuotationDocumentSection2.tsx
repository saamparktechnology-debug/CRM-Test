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

export function OfficialQuotationDocumentSection2({ ctrl }: { ctrl: any }) {
  const { resolvedBrandName, resolvedDivisionName, quotation, lineItems, isNonGst, grandTotal } = ctrl;
  return (
    <>
      <div 
          className="quotation-middle-pages break-after-page print:break-after-page block w-full bg-white text-zinc-900 font-sans p-5 sm:p-6 text-xs shadow-xl border border-zinc-200/90 rounded-lg space-y-4 print:p-[4mm_6mm] print:border-none print:shadow-none print:rounded-none min-h-[297mm] print:min-h-0"
          style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
        >
          {/* Running Corporate Header for Intermediate Page */}
          <div className="avoid-break break-inside-avoid flex items-center justify-between border-b-2 border-zinc-900 pb-2 text-[9.5px]">
            <div className="flex items-center gap-2">
              <span className="font-black text-zinc-950 uppercase tracking-wider">{resolvedBrandName} {resolvedDivisionName}</span>
              <span className="text-zinc-300">|</span>
              <span className="font-mono text-zinc-600 font-bold">QUOTATION REF: {quotation.number}</span>
            </div>
            <span className="font-bold text-teal-800 uppercase tracking-wider text-[9px] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Section II: Technical Scope &amp; Functional Deliverables
            </span>
          </div>

        {/* 4. Project Modules Roadmap & Deliverables Index (Summary Table) */}
        <div className="avoid-break break-inside-avoid border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
          <div className="p-2.5 bg-zinc-900 text-white flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <ListChecks size={13} className="text-teal-400" />
              <span>PROJECT MODULES ROADMAP &amp; DELIVERABLES INDEX</span>
            </span>
            <span className="text-[8px] text-zinc-300 font-medium">Detailed specifications on following section</span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-zinc-100 text-zinc-700 uppercase text-[9.5px] tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-2 px-3 w-10 text-center font-bold">#</th>
                <th className="py-2 px-3 font-bold">MODULE NAME / ENGINEERING SCOPE</th>
                <th className="py-2 px-3 text-center font-bold w-36">ESTIMATED DURATION / SPRINT</th>
                <th className="py-2 px-3 text-right font-bold w-32">COMMERCIAL VALUE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-zinc-800 bg-white">
              {lineItems.map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-zinc-50/80 transition-colors">
                  <td className="py-2 px-3 text-center font-mono font-bold text-zinc-500">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-zinc-950 text-[11px]">{it.name || it.serviceName}</div>
                    {it.description && (
                      <p className="text-[9.5px] text-zinc-500 line-clamp-1 mt-0.5 leading-normal">{it.description}</p>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-[9px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
                      <Clock size={9} className="text-teal-600" /> {it.deliverableTime || "1-2 Weeks"}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-zinc-900 text-[11px]">
                    ₹{it.total.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Section II: Deliverables & Functional Scope Breakdown (Full Detailed Cards) */}
        <div className="space-y-3 w-full">
          <div className="avoid-break break-inside-avoid p-2.5 rounded-xl bg-gradient-to-r from-teal-900 via-teal-800 to-teal-950 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <FileCode size={14} className="text-teal-300" />
              <span className="text-xs font-black uppercase tracking-wider">
                SECTION II: DELIVERABLES &amp; FUNCTIONAL SCOPE BREAKDOWN
              </span>
            </div>
            <span className="text-[9px] font-bold text-teal-200 uppercase tracking-wider">
              Technical Module Specifications &amp; Deliverable Milestones
            </span>
          </div>

          {/* Module Breakdown Cards */}
          {lineItems.map((it, idx) => {
            const itemBase = it.total || (it.unitPrice * it.quantity)
            const itemTax = isNonGst ? 0 : Math.round(itemBase * 0.18)
            const itemGross = itemBase + itemTax

            return (
              <div 
                key={it.id || idx} 
                className="avoid-break break-inside-avoid rounded-xl border border-zinc-200 bg-white p-3.5 space-y-2.5 shadow-2xs hover:border-teal-300 transition-colors"
              >
                {/* Module Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-zinc-900 text-white tracking-wider">
                      MODULE #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <h4 className="font-black text-xs sm:text-[13px] text-zinc-950 uppercase tracking-tight">
                      {it.name || it.serviceName}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                      <Clock size={10} className="text-teal-600" /> Estimated Duration / Sprint: <strong className="font-bold">{it.deliverableTime || "1-2 Weeks"}</strong>
                    </span>
                    <span className="font-mono text-[9.5px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                      SAC/HSN: <strong>{it.sac || it.sacCode || "998311"}</strong>
                    </span>
                  </div>
                </div>

                {/* Scope Description & Technical Criteria */}
                <div className="space-y-1">
                  <span className="text-[8.5px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
                    <CheckSquare size={11} className="text-teal-700" />
                    <span>SCOPE DESCRIPTION &amp; TECHNICAL CRITERIA:</span>
                  </span>
                  <div className="text-[11px] text-zinc-800 leading-relaxed whitespace-pre-line bg-zinc-50/90 p-3 rounded-lg border border-zinc-200/90 font-sans">
                    {it.description || "Full functional engineering deliverable according to specifications, architecture design, test criteria, and production deployment."}
                  </div>
                </div>

                {/* Itemized Commercial & Delivery Specs Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] pt-0.5">
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">Quantity / Unit</span>
                    <strong className="text-zinc-900 font-mono text-[10.5px]">{it.quantity} {it.unit || "Nos"}</strong>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">Unit Price</span>
                    <strong className="text-zinc-900 font-mono text-[10.5px]">₹{it.unitPrice.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">Taxable Scope Value</span>
                    <strong className="text-zinc-900 font-mono text-[10.5px]">₹{itemBase.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                    <span className="text-zinc-500 block text-[7.5px] uppercase font-bold">Applicable Tax</span>
                    <strong className="text-zinc-900 font-mono text-[10.5px]">
                      {isNonGst ? "Exempt / Non-GST" : `₹${itemTax.toLocaleString("en-IN")} (18%)`}
                    </strong>
                  </div>
                  <div className="bg-teal-50/80 p-2 rounded-lg border border-teal-200">
                    <span className="text-teal-900 block text-[7.5px] uppercase font-bold">Total Scope Value</span>
                    <strong className="text-teal-900 font-mono font-black text-[11px]">₹{itemGross.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 5.5 Scope Inclusions & Exclusions (If present) */}
        {(quotation.scopeInclusions || quotation.scopeExclusions) && (
          <div className="avoid-break break-inside-avoid grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {quotation.scopeInclusions && (
              <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-1">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-600" />
                  <span>SCOPE INCLUSIONS &amp; ARCHITECTURAL COVERAGE</span>
                </span>
                <p className="text-[10px] text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
                  {quotation.scopeInclusions}
                </p>
              </div>
            )}
            {quotation.scopeExclusions && (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <AlertCircle size={12} className="text-amber-600" />
                  <span>SCOPE EXCLUSIONS &amp; CLIENT DEPENDENCIES</span>
                </span>
                <p className="text-[10px] text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
                  {quotation.scopeExclusions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 5.6 Payment Milestones Schedule (If present) */}
        {Array.isArray(quotation.paymentMilestones) && quotation.paymentMilestones.length > 0 && (
          <div className="avoid-break break-inside-avoid border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="p-2.5 bg-zinc-800 text-white flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Calendar size={13} className="text-teal-400" />
                <span>MILESTONE PAYMENT TERMS &amp; SPRINT SCHEDULE</span>
              </span>
              <span className="text-[8px] text-zinc-300">Phase-wise commercial disbursement schedule</span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-zinc-100 text-zinc-700 uppercase text-[9px] tracking-wider border-b border-zinc-200">
                <tr>
                  <th className="py-2 px-3 font-bold">Milestone / Deliverable Phase</th>
                  <th className="py-2 px-3 font-bold text-center w-24">Allocation</th>
                  <th className="py-2 px-3 font-bold">Sprint Stage Trigger</th>
                  <th className="py-2 px-3 font-bold text-right w-32">Phase Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800 bg-white text-[10.5px]">
                {quotation.paymentMilestones.map((pm, idx) => {
                  const mAmount = Math.round((grandTotal * (pm.percentage || 0)) / 100)
                  return (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-zinc-900">{pm.milestone}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-teal-800">{pm.percentage}%</td>
                      <td className="py-2 px-3 text-zinc-600">{pm.stage}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-zinc-950">₹{mAmount.toLocaleString("en-IN")}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 5.7 Digital Marketing Retainer Scope & Deliverables SLA (If present) */}
        {(quotation.marketingPackage || (quotation as any).isMarketingRetainer || quotation.primaryCategory === "Digital Marketing" || quotation.category === "Digital Marketing") && (() => {
          const mktg = quotation.marketingPackage || (quotation as any).marketingPackage || {}
          const planName = mktg.planName || mktg.packageName || quotation.primaryCategory || "Digital Marketing Retainer"
          const duration = mktg.packageDuration || (mktg.durationMonths ? `${mktg.durationMonths} Month Retainer` : "1 Month Retainer")
          const posters = mktg.postersCount ?? mktg.postersPerMonth ?? 12
          const videos = mktg.videosCount ?? mktg.videosPerMonth ?? 2
          const stories = mktg.storyCount ?? mktg.storiesCount ?? 12
          const locations = mktg.targetLocations || "Regional Business Network & Pan India"
          const targetProfile = mktg.bestFor || "Growing Commercial Enterprises & Brands"
          const modelShoot = mktg.hasRealModelShoot ? "Included (Studio / On-Site Model Shoot)" : "Optional Add-on"
          const totoBranding = mktg.hasTotoAds ? "Included (Route Campaign)" : "Optional Add-on"

          return (
            <div className="avoid-break break-inside-avoid p-4 rounded-xl border-2 border-purple-200 bg-purple-50/40 space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[9.5px] font-black bg-purple-700 text-white uppercase tracking-wider">
                    SAAMPARK DIGITAL RETAINER
                  </span>
                  <span className="text-xs font-black text-purple-950 uppercase">
                    Digital Marketing &amp; Social Media Campaign Specifications
                  </span>
                </div>
                <span className="text-[10.5px] font-bold text-purple-900 bg-purple-100 px-3 py-1 rounded-full border border-purple-300">
                  Plan: {planName} • {duration}
                </span>
              </div>

              {/* Deliverable Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Posters Deliverable</span>
                  <strong className="text-purple-950 text-xs block mt-0.5">{posters} Posters / Month</strong>
                  <span className="text-[8.5px] text-zinc-500">Custom Brand Creatives</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Video Reels / Shorts</span>
                  <strong className="text-purple-950 text-xs block mt-0.5">{videos} Reels / Month</strong>
                  <span className="text-[8.5px] text-zinc-500">Motion &amp; AI-Powered Video</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Story Updates</span>
                  <strong className="text-purple-950 text-xs block mt-0.5">{stories} Stories / Month</strong>
                  <span className="text-[8.5px] text-zinc-500">Daily/Weekly Audience Hooks</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-2xs">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Execution Window</span>
                  <strong className="text-purple-950 text-xs block mt-0.5">{duration}</strong>
                  <span className="text-[8.5px] text-emerald-600 font-semibold">Starts on 1st Live Post</span>
                </div>
              </div>

              {/* Marketing Specifics & Deliverables SLA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 space-y-1">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Target Geography &amp; Audience</span>
                  <p className="text-[10px] text-zinc-800 font-bold truncate">{locations}</p>
                  <p className="text-[9px] text-zinc-500">Profile: {targetProfile}</p>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100 space-y-1">
                  <span className="text-zinc-500 block text-[8px] uppercase font-bold">Special Campaign Add-ons</span>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-zinc-600">Model / Product Shoot:</span>
                    <strong className="text-purple-900">{modelShoot}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-zinc-600">Toto Route Branding:</span>
                    <strong className="text-purple-900">{totoBranding}</strong>
                  </div>
                </div>
              </div>

              {/* Retainer SLA Declaration */}
              <div className="p-2 bg-purple-100/60 rounded-lg text-[9px] text-purple-900 flex items-center justify-between">
                <span>✓ High-resolution source files &amp; scheduled Meta/Google ads distribution included.</span>
                <span className="font-mono font-bold text-purple-950">Monthly Performance Analytics SLA</span>
              </div>
            </div>
          )
        })()}

        {/* 5.7 Special Engagement Notes & Client Specifications (If present) */}
        {quotation.notes && quotation.notes.trim() !== "" && quotation.notes !== quotation.overview && (
          <div className="avoid-break break-inside-avoid p-3 rounded-xl border border-blue-200 bg-blue-50/40 space-y-1">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1">
              <FileText size={12} className="text-blue-600" />
              <span>SPECIAL ENGAGEMENT NOTES &amp; CLIENT SPECIFICATIONS</span>
            </span>
            <p className="text-[10px] text-zinc-700 whitespace-pre-line leading-relaxed font-sans">
              {quotation.notes}
            </p>
          </div>
        )}

        {/* Page 2 Official Footer Banner */}
        <div className="mt-auto pt-3 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-500 font-medium">
          <span>Technical Deliverable Architecture &amp; Engineering Specifications</span>
          <span className="font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">Page 2 of 3</span>
        </div>
      </div>
    </>
  );
}
