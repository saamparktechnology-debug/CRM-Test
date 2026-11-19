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

export function computeOfficialInvoiceDocumentMemo51(ctx: any) {
  const { propActiveBranch, invoice, branches } = ctx;
  const __fn: any = () => {
    if (propActiveBranch) return propActiveBranch
    const targetBranchId = String(invoice.branchId || (invoice as any).branch_id || "").toLowerCase().trim()
    const targetBranchName = String(invoice.branchName || (invoice as any).branch_name || "").toLowerCase().trim()

    if (!targetBranchId && !targetBranchName) return null

    const matched = (branches || []).find(b => {
      const bId = String(b.id || "").toLowerCase().trim()
      const bName = String(b.name || "").toLowerCase().trim()
      const bCode = String(b.code || "").toLowerCase().trim()
      return (targetBranchId && (bId === targetBranchId || bCode === targetBranchId)) ||
             (targetBranchName && (bName === targetBranchName || bCode === targetBranchName))
    })

    if (matched) return matched

    if (targetBranchName) {
      return {
        id: targetBranchId || "branch",
        name: targetBranchName,
        code: (invoice as any).branchCode || "",
        companyId: invoice.companyId || "tech",
        status: "Active",
        city: "",
        address: "",
        phone: "",
        email: "",
      } as Branch
    }
    return null
  };
  return __fn();
}
