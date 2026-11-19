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
import { type CustomTextStamp, TextEditContext, type OfficialInvoiceDocumentProps, EditableText, formatInvoiceDate, numberToIndianWords, safeFormatCurrency } from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentHelpers"

export function createOfficialInvoiceDocumentHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { resolvedLogoUrl, resolvedBrandName, resolvedDivisionName, headerBrandName, onFieldChange, interactive, resolvedTrademarkSymbol, headerSecondaryLine, resolvedIsoCertification, hasLegalIds, hasCin, resolvedCin, hasGstin, resolvedGstin, hasPan, resolvedPan, hasMsme, resolvedMsme, theme, statusBadgeText, isFullyPaid, isPartPaid, invoiceNumOrId, invoice, hasDue, isValidField, resolvedAddress, hasContactInfo, resolvedFullOfficeAddress, resolvedPhone, resolvedEmail, resolvedWebsite } = getCtrl();
    const __fn: any = (pageNumber: number = 1, totalPgs: number = 1) => (
    <div className="flex flex-col gap-2.5 border-b border-zinc-200 pb-2.5">
      {/* 3-Column Top Identity Grid: Left = Logo, Center = Big SAAMPARK & Division/Subtitle, Right = Invoice Card */}
      <div 
        className="flex flex-row justify-between items-start gap-3 w-full print:flex-row print:justify-between print:items-start print-doc-header-row"
        style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'nowrap' }}
      >
        {/* Top-Left Logo Card: PERMANENTLY FIXED (No move, no drag, no scale increase/decrease) */}
        {resolvedLogoUrl ? (
          <div 
            className="relative w-28 h-28 sm:w-[120px] sm:h-[120px] rounded-2xl overflow-hidden shadow-2xs shrink-0 border border-zinc-200 bg-white flex items-center justify-center p-1.5 print:w-[115px] print:h-[115px] print:shrink-0 print-doc-header-logo select-none"
            style={{ width: '120px', height: '120px', minWidth: '120px', minHeight: '120px', flexShrink: 0 }}
          >
            <img 
              src={resolvedLogoUrl} 
              alt={resolvedBrandName || "Entity Logo"} 
              className="max-w-full max-h-full object-contain mx-auto print:max-w-full print:max-h-full select-none" 
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        ) : (
          <div 
            className="relative w-28 h-28 sm:w-[120px] sm:h-[120px] rounded-2xl overflow-hidden shadow-md shrink-0 border border-teal-900/30 bg-gradient-to-b from-[#004e59] via-[#005c68] to-[#003840] flex flex-col items-center justify-center p-2 text-white text-center print:w-[115px] print:h-[115px] print:shrink-0 print-doc-header-logo select-none"
            style={{ width: '120px', height: '120px', minWidth: '120px', minHeight: '120px', flexShrink: 0 }}
          >
            <Sparkles className="w-5 h-5 mb-1 text-teal-200 drop-shadow-sm" />
            <div className="font-black text-[11px] tracking-wider uppercase leading-tight font-sans whitespace-pre-wrap">
              {resolvedBrandName}
            </div>
            <div className="text-[7px] font-bold text-teal-200 tracking-widest uppercase mt-0.5 whitespace-pre-wrap">
              {resolvedDivisionName || "ENTERPRISE"}
            </div>
          </div>
        )}

        {/* Center: BIG SAAMPARK and in below BIGGER SECONDARY LINE (TECHNOLOGY AND RESEARCH PVT LTD / CONSULTANCY SERVICES) */}
        <div 
          className="flex-1 flex flex-col items-center justify-center text-center min-w-[280px] px-2 sm:px-4 shrink print:min-w-[320px] print:flex-1 print-doc-header-center"
          style={{ flex: '1 1 auto', minWidth: '280px', textAlign: 'center' }}
        >
          <div className="flex items-center justify-center gap-0.5 flex-wrap">
            <EditableText
              as="h1"
              value={headerBrandName}
              onChange={(val) => onFieldChange?.("brand_name", val)}
              interactive={interactive}
              fieldKey="brand_name"
              className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-widest sm:tracking-[0.2em] leading-none text-zinc-950 uppercase font-sans text-center drop-shadow-2xs whitespace-pre-wrap break-words print:whitespace-pre-wrap"
            />
            {resolvedTrademarkSymbol && resolvedTrademarkSymbol !== "none" ? (
              resolvedTrademarkSymbol === "TM" || resolvedTrademarkSymbol === "™" ? (
                <span 
                  className="inline-flex items-center justify-center w-[21px] h-[21px] min-w-[21px] min-h-[21px] rounded-full border-[1.5px] border-[#0a194e] text-[#0a194e] bg-white font-bold text-[8.5px] tracking-tight leading-none shrink-0 -translate-y-3.5 sm:-translate-y-4 -ml-2 shadow-xs select-none"
                  title="Trademark"
                >
                  TM
                </span>
              ) : (
                <span 
                  className="inline-flex items-center justify-center w-[19px] h-[19px] min-w-[19px] min-h-[19px] rounded-full border-[1.5px] border-[#0a194e] text-[#0a194e] bg-white font-black text-[10px] leading-none shrink-0 -translate-y-3.5 sm:-translate-y-4 -ml-2 shadow-xs select-none"
                  title="Registered Trademark"
                >
                  ®
                </span>
              )
            ) : null}
          </div>

          {/* Secondary Line (Header Line 2): Cleanly renders when provided, stays blank when cleared */}
          {(headerSecondaryLine || interactive) ? (
            <div className="max-w-[480px] mx-auto text-center w-full">
              <EditableText
                as="h2"
                value={headerSecondaryLine}
                onChange={(val) => onFieldChange?.("division_name", val)}
                interactive={interactive}
                fieldKey="division_name"
                placeholder="CORPORATE SUBTITLE / DIVISION (OPTIONAL)"
                className="text-xs sm:text-sm md:text-[14px] font-black tracking-wider text-zinc-800 uppercase font-sans mt-1.5 block leading-tight text-center whitespace-pre-wrap break-words print:text-[13px] print:whitespace-pre-wrap"
              />
            </div>
          ) : null}

          {/* Editable ISO Certification Badge */}
          {(resolvedIsoCertification || interactive) && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase shadow-2xs mt-1.5">
              <Award size={12} className="text-amber-600 shrink-0" />
              <EditableText
                value={resolvedIsoCertification}
                onChange={(val) => onFieldChange?.("iso_certification", val)}
                interactive={interactive}
                fieldKey="iso_certification"
                placeholder="Quality certification..."
              />
            </div>
          )}

          {/* Legal IDs: CIN, GSTIN, PAN, MSME centered */}
          {hasLegalIds && (
            <p className="text-[10px] sm:text-[10.5px] font-semibold text-zinc-600 font-mono pt-1.5 flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
              {hasCin && (
                <span className="inline-flex items-center gap-1">
                  <EditableText value="CIN:" interactive={interactive} className="text-zinc-500 font-sans text-[9.5px] font-bold" />
                  <EditableText value={resolvedCin} onChange={(val) => onFieldChange?.("cin", val)} interactive={interactive} fieldKey="cin" placeholder="CIN Number..." className="text-zinc-800 font-bold" />
                </span>
              )}
              {hasGstin && (
                <span className="inline-flex items-center gap-1">
                  {hasCin ? <span className="text-zinc-300 mr-0.5">|</span> : null}
                  <EditableText value="GSTIN:" interactive={interactive} className="text-zinc-500 font-sans text-[9.5px] font-bold" />
                  <EditableText value={resolvedGstin} onChange={(val) => onFieldChange?.("gstin", val)} interactive={interactive} fieldKey="gstin" placeholder="GSTIN..." className="text-zinc-900 font-black" />
                </span>
              )}
              {hasPan && (
                <span className="inline-flex items-center gap-1">
                  {(hasCin || hasGstin) ? <span className="text-zinc-300 mr-0.5">|</span> : null}
                  <EditableText value="PAN:" interactive={interactive} className="text-zinc-500 font-sans text-[9.5px] font-bold" />
                  <EditableText value={resolvedPan} onChange={(val) => onFieldChange?.("pan", val)} interactive={interactive} fieldKey="pan" placeholder="PAN..." className="text-zinc-900 font-black" />
                </span>
              )}
              {hasMsme && (
                <span className="inline-flex items-center gap-1">
                  {(hasCin || hasGstin || hasPan) ? <span className="text-zinc-300 mr-0.5">|</span> : null}
                  <EditableText value="MSME:" interactive={interactive} className="text-zinc-500 font-sans text-[9.5px] font-bold" />
                  <EditableText value={resolvedMsme} onChange={(val) => onFieldChange?.("msme_reg", val)} interactive={interactive} fieldKey="msme_reg" placeholder="MSME Reg..." className="text-zinc-900 font-semibold" />
                </span>
              )}
            </p>
          )}
        </div>

        {/* Right: Header Card with Status Badge & Dates */}
        <div 
          className={`w-52 min-w-[200px] max-w-[210px] rounded-lg ${theme.cardHeaderGradient} text-white p-3 shadow-md shrink-0 flex flex-col self-start space-y-1.5 print:w-[200px] print:min-w-[200px] print:shrink-0 print-doc-header-card`}
          style={{ width: '200px', minWidth: '200px', maxWidth: '210px', flexShrink: 0 }}
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-1">
            <EditableText
              value={theme.invoiceTypeLabel + (totalPgs > 1 ? ` (P.${pageNumber}/${totalPgs})` : '')}
              interactive={interactive}
              className="font-black text-[11px] tracking-wider uppercase text-white"
            />
            <EditableText
              value={statusBadgeText}
              interactive={interactive}
              className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-wider uppercase ${
                isFullyPaid ? "bg-white text-emerald-800" : isPartPaid ? "bg-white text-amber-800" : "bg-white text-rose-800"
              }`}
            />
          </div>

          <div className="space-y-1 text-[10px]">
            <div>
              <EditableText value="INVOICE NO:" interactive={interactive} className="text-white/80 text-[8px] uppercase tracking-wider font-semibold block" />
              <EditableText value={invoiceNumOrId} interactive={interactive} className="font-mono text-white text-[12.5px] font-black break-all leading-tight block" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <EditableText value="DATE:" interactive={interactive} className="text-white/80 text-[8px] uppercase font-bold tracking-wider shrink-0 w-8" />
              <EditableText value={formatInvoiceDate(invoice.billDate)} interactive={interactive} className="text-white font-mono text-[9.5px] font-bold" />
            </div>
            <div className="flex items-center gap-2">
              <EditableText value="DUE:" interactive={interactive} className="text-white/80 text-[8px] uppercase font-bold tracking-wider shrink-0 w-8" />
              <EditableText value={hasDue ? formatInvoiceDate(invoice.dueDate) : "-"} interactive={interactive} className="text-white font-mono text-[9.5px] font-bold" />
            </div>
          </div>
        </div>
      </div>

      {/* Address & Contact Row */}
      {(isValidField(resolvedAddress) || hasContactInfo) && (
        <div className="w-full pt-1.5 border-t border-zinc-100 text-[9.5px] text-zinc-700">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            {isValidField(resolvedFullOfficeAddress || resolvedAddress) && (
              <div className="flex items-center gap-1.5 flex-grow basis-auto min-w-[280px]">
                <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                  <MapPin size={8} />
                </span>
                <span className="text-zinc-900 font-bold text-[9px] shrink-0">Office:</span>
                <EditableText
                  value={resolvedFullOfficeAddress || resolvedAddress}
                  onChange={(val) => onFieldChange?.("address", val)}
                  interactive={interactive}
                  fieldKey="address"
                  placeholder="Company address..."
                  className="text-zinc-700 text-[9px] leading-snug font-medium"
                />
              </div>
            )}

            {hasContactInfo && (
              <div className="flex items-center gap-3 flex-wrap justify-end text-[9px] flex-grow-0 ml-auto">
                {isValidField(resolvedPhone) && (
                  <p className="flex items-center gap-1 shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                      <Phone size={7.5} />
                    </span>
                    <EditableText value={resolvedPhone} onChange={(val) => onFieldChange?.("phone", val)} interactive={interactive} fieldKey="phone" placeholder="+91..." className="font-mono text-zinc-800 font-semibold" />
                  </p>
                )}
                {isValidField(resolvedEmail) && (
                  <p className="flex items-center gap-1 shrink-0">
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                      <Mail size={7.5} />
                    </span>
                    <EditableText value={resolvedEmail} onChange={(val) => onFieldChange?.("email", val)} interactive={interactive} fieldKey="email" placeholder="Email..." className="text-zinc-700" />
                  </p>
                )}
                {isValidField(resolvedWebsite) && (
                  <p className="flex items-center gap-1 max-w-[220px] truncate">
                    <span className={`w-3.5 h-3.5 rounded-full ${theme.primaryBg} text-white flex items-center justify-center shrink-0`}>
                      <Globe size={7.5} />
                    </span>
                    <EditableText value={resolvedWebsite} onChange={(val) => onFieldChange?.("website", val)} interactive={interactive} fieldKey="website" placeholder="Website..." className="text-zinc-700 truncate" />
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
    return __fn(...__args);
  };
}
