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
import { createOfficialInvoiceDocumentAction20 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentAction20.hooks"

export function computeOfficialInvoiceDocumentMemo50(ctx: any) {
  const { companyDetails, invoice, activeCompanyId, companies } = ctx;
  const __fn: any = () => {
    if (companyDetails) return companyDetails

    const targetCompId = String(invoice.companyId || (invoice as any).company || activeCompanyId || "tech").toLowerCase().trim()
    const targetCompName = String((invoice as any).companyName || "").toLowerCase().trim()

    const matched = companies.find(c => {
      if (targetCompId && isMatchingCompany(c, targetCompId)) return true
      const cId = String(c.id || "").toLowerCase().trim()
      const cSlug = String(c.slug || "").toLowerCase().trim()
      const cNum = String((c as any).numeric_id || "").toLowerCase().trim()
      const cName = String(c.name || "").toLowerCase().trim()
      const cBrand = String(c.brand_name || "").toLowerCase().trim()
      const cDivision = String(c.division_name || "").toLowerCase().trim()
      return (
        cId === targetCompId || 
        cSlug === targetCompId || 
        cNum === targetCompId ||
        cName === targetCompId ||
        (targetCompName && (cName === targetCompName || cBrand === targetCompName || `${cBrand} ${cDivision}`.trim() === targetCompName))
      )
    })
    if (matched) return matched

    if (activeCompanyId) {
      const activeMatch = companies.find(c => isMatchingCompany(c, activeCompanyId))
      if (activeMatch) return activeMatch
    }

    const defMatch = DEFAULT_COMPANIES.find(c => isMatchingCompany(c, targetCompId))
    return defMatch || companies[0] || DEFAULT_COMPANIES[0]
  };
  return __fn();
}
