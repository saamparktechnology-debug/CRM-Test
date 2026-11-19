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

export function createOfficialInvoiceDocumentHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isSubBranchIssued, activeSubBranch, resolvedParentBranch, activeBranch, interactive, isBranchIssued } = getCtrl();
    const __fn: any = () => {
    if (isSubBranchIssued && activeSubBranch) {
      const parentName = resolvedParentBranch?.name || activeBranch?.name || "Main Operational Branch"
      const parentCode = resolvedParentBranch?.code || activeBranch?.code
      const parentManager = resolvedParentBranch?.managerName || (resolvedParentBranch as any)?.manager_name || (activeBranch?.managerName || (activeBranch as any)?.manager_name)
      const parentCity = resolvedParentBranch?.city || activeBranch?.city
      const parentLogo = resolvedParentBranch?.logo_url || activeBranch?.logo_url

      const subName = activeSubBranch.name || "Franchise Sub-Branch"
      const subCode = activeSubBranch.code
      const partnerName = activeSubBranch.partner_name || (activeSubBranch as any)?.partnerName
      const partnerPhone = activeSubBranch.partner_phone || (activeSubBranch as any)?.partnerPhone || activeSubBranch.phone
      const partnerEmail = activeSubBranch.partner_email || (activeSubBranch as any)?.partnerEmail || activeSubBranch.email
      const subCity = activeSubBranch.city || activeSubBranch.state
      const subLogo = activeSubBranch.logo_url

      return (
        <div className="w-full rounded-lg bg-gradient-to-r from-blue-50/90 via-slate-50 to-emerald-50/90 border border-zinc-200/90 p-2.5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
            {/* Left: Parent Branch */}
            <div className="flex items-center gap-2.5 min-w-0 pr-0 sm:pr-2">
              {parentLogo ? (
                <img src={parentLogo} alt={parentName} className="w-7 h-7 rounded-md object-contain border border-blue-200 bg-white p-0.5 shrink-0" />
              ) : (
                <span className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 size={14} />
                </span>
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <EditableText
                    value="Branch:"
                    interactive={interactive}
                    className="text-[8.5px] uppercase font-black text-blue-700 tracking-wider"
                  />
                  <EditableText
                    value={parentName}
                    interactive={interactive}
                    className="font-bold text-zinc-900 text-[11px] truncate"
                  />
                  {parentCode && (
                    <span className="font-mono text-[8px] bg-blue-100 text-blue-950 font-bold px-1.5 py-0.2 rounded border border-blue-200">
                      {parentCode}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-zinc-600 mt-0.5 flex-wrap">
                  {parentManager && (
                    <span>Mgr: <strong className="text-zinc-800">{parentManager}</strong></span>
                  )}
                  {parentCity && (
                    <span className="flex items-center gap-1 text-zinc-500 font-medium">
                      <MapPin size={8.5} className="text-blue-600 shrink-0" />
                      <span>{parentCity}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Franchise Sub-Branch */}
            <div className="flex items-center gap-2.5 min-w-0 pt-2 sm:pt-0 pl-0 sm:pl-2">
              {subLogo ? (
                <img src={subLogo} alt={subName} className="w-7 h-7 rounded-md object-contain border border-emerald-200 bg-white p-0.5 shrink-0" />
              ) : (
                <span className="w-7 h-7 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <ShieldCheck size={14} />
                </span>
              )}
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <EditableText
                    value="Sub-Branch:"
                    interactive={interactive}
                    className="text-[8.5px] uppercase font-black text-emerald-700 tracking-wider"
                  />
                  <EditableText
                    value={subName}
                    interactive={interactive}
                    className="font-bold text-zinc-900 text-[11px] truncate"
                  />
                  {subCode && (
                    <span className="font-mono text-[8px] bg-emerald-100 text-emerald-950 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                      [{subCode}]
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[9px] text-zinc-600 mt-0.5 flex-wrap">
                  {partnerName && (
                    <span>Partner: <strong className="text-zinc-800">{partnerName}</strong></span>
                  )}
                  {partnerPhone && (
                    <span>• Tel: <strong className="text-zinc-800">{partnerPhone}</strong></span>
                  )}
                  {subCity && (
                    <span className="flex items-center gap-1 text-zinc-500 font-medium">
                      <MapPin size={8.5} className="text-emerald-600 shrink-0" />
                      <span>{subCity}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (isBranchIssued && activeBranch) {
      const branchName = activeBranch.name || "Regional Operations Branch"
      const branchCode = activeBranch.code
      const branchManager = activeBranch.managerName || (activeBranch as any)?.manager_name
      const branchLocation = [activeBranch.city, activeBranch.state].filter(Boolean).join(", ")
      const branchPhone = activeBranch.phone
      const branchEmail = activeBranch.email
      const managerPhone = activeBranch.managerPhone || (activeBranch as any)?.manager_phone
      const branchLogo = activeBranch.logo_url

      return (
        <div className="w-full rounded-lg bg-blue-50/80 border border-blue-200/90 p-2.5 shadow-2xs">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              {branchLogo ? (
                <img src={branchLogo} alt={branchName} className="w-7 h-7 rounded-md object-contain border border-blue-200 bg-white p-0.5 shrink-0" />
              ) : (
                <span className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Building2 size={14} />
                </span>
              )}
              <div className="min-w-0 leading-tight flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <EditableText
                    value="Branch:"
                    interactive={interactive}
                    className="text-[8.5px] uppercase font-black text-blue-700 tracking-wider"
                  />
                  <EditableText
                    value={branchName}
                    interactive={interactive}
                    className="text-zinc-900 text-[11px] font-bold"
                  />
                  {branchCode && (
                    <span className="font-mono text-[8px] bg-blue-200/80 text-blue-950 font-bold px-1.5 py-0.2 rounded border border-blue-300">
                      [{branchCode}]
                    </span>
                  )}
                  {branchManager && (
                    <span className="text-[9px] text-zinc-600">
                      • Manager: <strong className="text-zinc-800">{branchManager}</strong>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[8.5px] text-zinc-600 mt-0.5 flex-wrap">
                  {managerPhone && (
                    <span>Mgr Tel: <strong className="text-zinc-800 font-mono">{managerPhone}</strong></span>
                  )}
                  {branchPhone && (
                    <span>• Branch Tel: <strong className="text-zinc-800 font-mono">{branchPhone}</strong></span>
                  )}
                  {branchEmail && (
                    <span>• {branchEmail}</span>
                  )}
                </div>
              </div>
            </div>

            {branchLocation && (
              <div className="flex items-center gap-1 text-[9px] text-zinc-600 shrink-0 bg-white/80 px-2 py-0.5 rounded-md border border-blue-200">
                <MapPin size={8.5} className="text-blue-600 shrink-0" />
                <span className="font-medium">{branchLocation}</span>
              </div>
            )}
          </div>
        </div>
      )
    }

    return null
  };
    return __fn(...__args);
  };
}
