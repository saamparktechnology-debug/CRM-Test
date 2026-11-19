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

export function OfficialQuotationDocumentSection1({ ctrl }: { ctrl: any }) {
  const { resolvedLogoUrl, resolvedBrandName, resolvedDivisionName, resolvedTrademarkSymbol, resolvedSubtitle, hasLegalIds, resolvedCin, resolvedGstin, resolvedPan, resolvedMsme, theme, isNonGst, quotation, resolvedAddress, hasContactInfo, resolvedPhone, resolvedEmail, resolvedWebsite, activeBranch, activeSubBranch, resolvedCategory, resolvedProjectTitle, resolvedOverview, resolvedTimeline, resolvedTurnaround, lineItems } = ctrl;
  return (
    <>
      <div 
          className="quotation-page-1 break-after-page print:break-after-page block w-full bg-white text-zinc-900 font-sans p-5 sm:p-6 text-xs shadow-xl border border-zinc-200/90 rounded-lg space-y-3.5 print:p-[4mm_6mm] print:border-none print:shadow-none print:rounded-none min-h-[297mm] print:min-h-0"
          style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
        >
          {/* 1. Top Header: Company Brand, Logo, Statutory IDs & Document Header Card */}
          <div className="avoid-break break-inside-avoid flex flex-col gap-2.5 border-b-2 border-zinc-900 pb-3">
            <div 
              className="flex flex-row justify-between items-start gap-4 w-full print:flex-row print:justify-between print:items-start print-doc-header-row"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'nowrap' }}
            >
              {/* Logo Card */}
              {resolvedLogoUrl ? (
                <div 
                  className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xs shrink-0 border border-zinc-200 bg-white flex items-center justify-center p-1.5 print:w-24 print:h-24 print:shrink-0"
                  style={{ width: '96px', height: '96px', minWidth: '96px', minHeight: '96px', flexShrink: 0 }}
                >
                  <img 
                    src={resolvedLogoUrl} 
                    alt={resolvedBrandName} 
                    className="max-w-full max-h-full object-contain mx-auto print:max-w-full print:max-h-full" 
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div 
                  className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md shrink-0 border border-teal-900/30 bg-gradient-to-b from-[#004e59] via-[#005c68] to-[#003840] flex flex-col items-center justify-center p-2 text-white text-center print:w-24 print:h-24 print:shrink-0"
                  style={{ width: '96px', height: '96px', minWidth: '96px', minHeight: '96px', flexShrink: 0 }}
                >
                  <Sparkles className="w-5 h-5 mb-1 text-teal-200 drop-shadow-sm" />
                  <div className="font-black text-[11px] tracking-wider uppercase leading-tight font-sans">{resolvedBrandName}</div>
                  <div className="text-[7px] font-bold text-teal-200 tracking-widest uppercase mt-0.5">{resolvedDivisionName || "ENTERPRISE"}</div>
                </div>
              )}

              {/* Center: BIG SAAMPARK and in below SECONDARY LINE */}
              <div 
                className="flex-1 flex flex-col items-center justify-center text-center min-w-[280px] px-2 sm:px-4 shrink print:min-w-[320px] print:flex-1 print-doc-header-center"
                style={{ flex: '1 1 auto', textAlign: 'center', minWidth: '280px', padding: '0 8px' }}
              >
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-wider leading-none text-zinc-950 uppercase font-sans text-center drop-shadow-2xs whitespace-pre-wrap break-words print:whitespace-pre-wrap">
                    {resolvedBrandName}
                  </h1>
                  {resolvedTrademarkSymbol && resolvedTrademarkSymbol !== "none" ? (
                    resolvedTrademarkSymbol === "TM" || resolvedTrademarkSymbol === "™" ? (
                      <span 
                        className="inline-flex items-center justify-center w-[23px] h-[23px] min-w-[23px] min-h-[23px] rounded-full border-[1.5px] border-red-600 text-red-600 bg-white font-bold text-[9px] tracking-tight leading-none shrink-0 -translate-y-2 ml-1 shadow-xs select-none"
                        title="Trademark"
                      >
                        TM
                      </span>
                    ) : (
                      <span 
                        className="inline-flex items-center justify-center w-[20px] h-[20px] min-w-[20px] min-h-[20px] rounded-full border-[1.5px] border-red-600 text-red-600 bg-white font-black text-[11px] leading-none shrink-0 -translate-y-2 ml-1 shadow-xs select-none"
                        title="Registered Trademark"
                      >
                        R
                      </span>
                    )
                  ) : null}
                </div>

                {/* Secondary Line */}
                {resolvedDivisionName ? (
                  <h2 className="text-xs sm:text-sm md:text-[15px] font-black tracking-widest text-zinc-800 uppercase font-sans mt-1.5 block leading-tight text-center whitespace-pre-wrap break-words print:text-[13px] print:whitespace-pre-wrap">
                    {resolvedDivisionName}
                  </h2>
                ) : null}

                {resolvedSubtitle && (
                  <p className="text-[8.5px] sm:text-[9px] font-semibold text-zinc-500 tracking-wider uppercase mt-0.5 text-center">
                    {resolvedSubtitle}
                  </p>
                )}

                {/* Legal IDs: CIN, GSTIN, PAN, MSME centered */}
                {hasLegalIds && (
                  <p className="text-[10px] sm:text-[10.5px] font-semibold text-zinc-600 font-mono pt-1.5 flex items-center justify-center gap-2.5 flex-wrap">
                    {resolvedCin && <span>CIN: <strong className="text-zinc-900 font-bold">{resolvedCin}</strong></span>}
                    {resolvedGstin && <span>{resolvedCin ? "| " : ""}GSTIN: <strong className="text-zinc-900 font-black">{resolvedGstin}</strong></span>}
                    {resolvedPan && <span>{(resolvedCin || resolvedGstin) ? "| " : ""}PAN: <strong className="text-zinc-900 font-black">{resolvedPan}</strong></span>}
                    {resolvedMsme && <span>| MSME: <strong className="text-zinc-900 font-semibold">{resolvedMsme}</strong></span>}
                  </p>
                )}
              </div>

              {/* Right: Header Card with Status Badge & Dates */}
              <div 
                className={`w-56 min-w-[210px] max-w-[224px] rounded-xl ${theme.cardHeaderGradient} text-white p-3.5 shadow-md shrink-0 flex flex-col self-start space-y-2 print:w-56 print:min-w-[210px] print:shrink-0 print-doc-header-card`}
                style={{ width: '224px', minWidth: '210px', maxWidth: '224px', flexShrink: 0 }}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                  <span className="font-black text-[11px] tracking-wider uppercase">
                    {isNonGst ? "COMMERCIAL QUOTATION" : "TAX QUOTATION"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase ${
                    quotation.status === "Accepted" 
                      ? "bg-white text-emerald-800" 
                      : quotation.status === "Sent" 
                      ? "bg-white text-blue-800" 
                      : quotation.status === "Declined"
                      ? "bg-white text-rose-800"
                      : "bg-white text-zinc-800"
                  }`}>
                    {quotation.status}
                  </span>
                </div>

                <div className="space-y-1 text-[10px]">
                  <div>
                    <span className="text-white/80 text-[8px] uppercase tracking-wider font-semibold block">QUOTATION NO:</span>
                    <strong className="font-mono text-amber-300 text-[12.5px] font-black break-all leading-tight block">
                      {quotation.number}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="text-white/80 text-[8px] uppercase font-bold tracking-wider shrink-0 w-12">DATE:</span>
                    <strong className="text-white font-mono text-[9.5px]">
                      {formatQuotationDate(quotation.date)}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-[8px] uppercase font-bold tracking-wider shrink-0 w-12">VALID TILL:</span>
                    <strong className="text-amber-200 font-mono text-[9.5px]">
                      {formatQuotationDate(quotation.validTill)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Contact Row (Full Address with wrap) */}
            {(resolvedAddress || hasContactInfo) && (
              <div className="w-full pt-1.5 border-t border-zinc-100 text-[9.5px] text-zinc-700">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
                  {resolvedAddress && (
                    <div className="flex items-center gap-1.5 flex-grow basis-auto min-w-[280px]">
                      <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                        <MapPin size={8} />
                      </span>
                      <strong className="text-zinc-900 text-[9px] shrink-0">Registered Office:</strong>
                      <span className="text-zinc-700 text-[9px] leading-snug font-medium">{resolvedAddress}</span>
                    </div>
                  )}

                  {hasContactInfo && (
                    <div className="flex items-center gap-3 flex-wrap justify-end text-[9px] flex-grow-0 ml-auto">
                      {resolvedPhone && (
                        <p className="flex items-center gap-1 shrink-0">
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                            <Phone size={7.5} />
                          </span>
                          <span className="font-mono text-zinc-800 font-semibold">{resolvedPhone}</span>
                        </p>
                      )}
                      {resolvedEmail && (
                        <p className="flex items-center gap-1 shrink-0">
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                            <Mail size={7.5} />
                          </span>
                          <span className="text-zinc-700">{resolvedEmail}</span>
                        </p>
                      )}
                      {resolvedWebsite && (
                        <p className="flex items-center gap-1 max-w-[220px] truncate">
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                            <Globe size={7.5} />
                          </span>
                          <span className="text-zinc-700 truncate">{resolvedWebsite}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issuing Branch / Operating Unit Card */}
            {(activeBranch || activeSubBranch) && (
              <div className="mt-1 p-2 rounded-xl bg-gradient-to-r from-teal-50 to-zinc-50 border border-teal-200/80 text-[9px] text-zinc-700">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-zinc-900 flex items-center gap-1">
                    <Building2 size={12} className="text-teal-700" />
                    <span>Issuing Branch:</span>
                    <span className="text-teal-800 font-black">{activeBranch?.name || activeSubBranch?.name}</span>
                  </span>
                  {(activeBranch?.code || activeSubBranch?.code) && (
                    <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-bold border border-teal-200">
                      Code: {(activeBranch?.code || activeSubBranch?.code || '').toUpperCase()}
                    </span>
                  )}
                  {activeSubBranch && (
                    <span className="font-mono text-[8px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      🌿 Sub-Branch Partner ({activeSubBranch.revenueSharePct}% Share)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Customer / Bill-To Section (Card Style with Proprietor Details) */}
          <div className="avoid-break break-inside-avoid p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/70">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-900 mb-2 flex items-center justify-between border-b border-zinc-200/80 pb-1">
              <span className="flex items-center gap-1">
                <UserCheck size={12} className="text-teal-700" />
                <span>PREPARED EXCLUSIVELY FOR CLIENT &amp; PROPRIETOR / BUSINESS OWNER:</span>
              </span>
              <span className="text-emerald-700 font-bold text-[9px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Verified Commercial Entity
              </span>
            </div>

            <div 
              className="grid grid-cols-2 gap-4 text-xs print:grid-cols-2"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              <div className="space-y-1">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">CLIENT / ENTERPRISE NAME:</span>
                  <h3 className="text-sm font-black text-zinc-950 uppercase leading-snug">{quotation.customer || quotation.client || "Client"}</h3>
                </div>

                {(quotation.contactPersonName || quotation.clientContactPerson || quotation.primaryContact) && (
                  <div className="pt-0.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">OWNER / AUTHORIZED PERSON:</span>
                    <p className="text-zinc-800 font-semibold text-[11px]">
                      {quotation.contactPersonName || quotation.clientContactPerson || quotation.primaryContact}
                      <span className="ml-1 text-[9.5px] font-normal text-zinc-500 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-200">
                        {quotation.clientDesignation || "Proprietor"}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[10.5px]">
                  {(quotation.customerEmail || quotation.clientEmail) && (
                    <p className="text-zinc-600 font-mono flex items-center gap-1">
                      <Mail size={10} className="text-zinc-400" />
                      <span>{quotation.customerEmail || quotation.clientEmail}</span>
                    </p>
                  )}
                  {(quotation.customerPhone || quotation.clientPhone) && (
                    <p className="text-zinc-600 font-mono flex items-center gap-1">
                      <Phone size={10} className="text-zinc-400" />
                      <span>{quotation.customerPhone || quotation.clientPhone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-zinc-600 space-y-1 sm:text-right">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">OFFICIAL BILLING DESTINATION:</span>
                  <p className="leading-snug text-zinc-800 break-words whitespace-normal font-medium">
                    {quotation.customerAddress || quotation.clientAddress || "Client Registered Address"}
                  </p>
                </div>

                <div className="pt-0.5 space-y-0.5">
                  {quotation.clientGstin ? (
                    <p>
                      <span className="text-zinc-400 text-[9px] uppercase font-bold mr-1">Client GSTIN:</span>
                      <strong className="font-mono font-black text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">
                        {quotation.clientGstin}
                      </strong>
                    </p>
                  ) : (
                    <p className="text-zinc-400 text-[10px]">Unregistered Commercial Entity (B2C / Non-GST)</p>
                  )}

                  <p>
                    <span className="text-zinc-400 text-[9px] uppercase font-bold mr-1">Place of Supply:</span>
                    <strong className="text-zinc-800 font-semibold">{quotation.placeOfSupply || "West Bengal (Code 19)"}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Project Profile & Executive Technical Scope */}
          <div className="avoid-break break-inside-avoid p-3.5 rounded-xl border border-zinc-200 bg-white shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-teal-900 text-[10px]">
                <Layers size={13} className="text-teal-700" />
                <span>PROJECT PROFILE &amp; EXECUTIVE TECHNICAL SCOPE:</span>
              </div>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Category: {resolvedCategory}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">PROJECT TITLE / ENGAGEMENT SCOPE:</span>
              <h4 className="text-xs sm:text-sm font-black text-zinc-950 uppercase font-mono tracking-tight">
                {resolvedProjectTitle}
              </h4>
            </div>

            {resolvedOverview && (
              <div className="space-y-0.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block">EXECUTIVE SCOPE STATEMENT:</span>
                <p className="text-[10.5px] text-zinc-700 leading-relaxed whitespace-pre-line bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100">
                  {resolvedOverview}
                </p>
              </div>
            )}

            {/* 3 Summary Stat Cards */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                <span className="text-zinc-400 block text-[7.5px] uppercase font-bold tracking-wider">OVERALL ESTIMATED TIMELINE</span>
                <strong className="text-zinc-900 text-[11px] font-mono font-bold">{resolvedTimeline}</strong>
              </div>
              <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                <span className="text-zinc-400 block text-[7.5px] uppercase font-bold tracking-wider">SPRINT VELOCITY / TURNAROUND</span>
                <strong className="text-zinc-900 text-[11px] font-mono font-bold">{resolvedTurnaround}</strong>
              </div>
              <div className="bg-teal-50/80 p-2 rounded-lg border border-teal-200">
                <span className="text-teal-800 block text-[7.5px] uppercase font-bold tracking-wider">TOTAL DELIVERABLE MODULES</span>
                <strong className="text-teal-900 text-[11px] font-black">{lineItems.length} Specialized Modules</strong>
              </div>
            </div>
          </div>

          {/* Page 1 Official Footer Banner */}
          <div className="mt-auto pt-3 border-t border-zinc-200 flex items-center justify-between text-[9px] text-zinc-500 font-medium">
            <span>Corporate Project Specification &amp; Client Identity Dossier</span>
            <span className="font-mono font-bold text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">Page 1 of 3</span>
          </div>
        </div>
    </>
  );
}
