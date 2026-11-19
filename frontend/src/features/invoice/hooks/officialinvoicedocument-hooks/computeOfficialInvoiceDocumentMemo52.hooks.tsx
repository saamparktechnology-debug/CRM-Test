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

export function computeOfficialInvoiceDocumentMemo52(ctx: any) {
  const { finalRenderedRows, ITEMS_PER_FIRST_PAGE, ITEMS_PER_SUBSEQUENT_PAGE } = ctx;
  const __fn: any = () => {
    if (finalRenderedRows.length <= ITEMS_PER_FIRST_PAGE) {
      return [{
        pageNumber: 1,
        items: finalRenderedRows,
        startIndex: 0,
        isFirstPage: true,
        isLastPage: true,
      }]
    }

    const pages: Array<{
      pageNumber: number
      items: typeof finalRenderedRows
      startIndex: number
      isFirstPage: boolean
      isLastPage: boolean
    }> = []

    // Page 1: first 3 items
    pages.push({
      pageNumber: 1,
      items: finalRenderedRows.slice(0, ITEMS_PER_FIRST_PAGE),
      startIndex: 0,
      isFirstPage: true,
      isLastPage: false,
    })

    // Subsequent pages
    let currentIndex = ITEMS_PER_FIRST_PAGE
    let pageNum = 2

    while (currentIndex < finalRenderedRows.length) {
      const nextItems = finalRenderedRows.slice(currentIndex, currentIndex + ITEMS_PER_SUBSEQUENT_PAGE)
      const isLast = (currentIndex + ITEMS_PER_SUBSEQUENT_PAGE) >= finalRenderedRows.length
      pages.push({
        pageNumber: pageNum,
        items: nextItems,
        startIndex: currentIndex,
        isFirstPage: false,
        isLastPage: isLast,
      })
      currentIndex += ITEMS_PER_SUBSEQUENT_PAGE
      pageNum++
    }

    return pages
  };
  return __fn();
}
