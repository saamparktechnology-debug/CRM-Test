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
import { OfficialQuotationDocumentSection1 } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentSection1"
import { OfficialQuotationDocumentSection2 } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentSection2"
import { OfficialQuotationDocumentSection3 } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentSection3"
import { OfficialQuotationDocumentSection4 } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentSection4"


import { type QuotationLineItem, type QuotationData, type OfficialQuotationDocumentProps, formatQuotationDate, numberToIndianWords } from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentHelpers"
export * from "@/features/quotations/components/officialquotationdocument-sections/OfficialQuotationDocumentHelpers"

export function OfficialQuotationDocument({
  quotation,
  onClose,
  onAccept,
  onDecline,
  onRequestModify,
  onSendEmail,
  onConvertToInvoice,
  onConvertToProject,
  onConvertToClient,
  onSendEstimate,
  isClientRole = false,
}: OfficialQuotationDocumentProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const [isForm9Open, setIsForm9Open] = React.useState(false)
  const { 
    companies, 
    branches, 
    subBranches, 
    activeCompanyId, 
    fetchCompanies, 
    fetchBranches, 
    fetchSubBranches 
  } = useAuthStore()

  React.useEffect(() => {
    if (!companies || companies.length === 0) fetchCompanies().catch(() => {})
    if (!branches || branches.length === 0) fetchBranches().catch(() => {})
    if (!subBranches || subBranches.length === 0) fetchSubBranches().catch(() => {})
  }, [companies, branches, subBranches, fetchCompanies, fetchBranches, fetchSubBranches])

  // Resolve Parent Company
  const activeCompany = React.useMemo(() => {
    const targetCompId = String(quotation.companyId || (quotation as any).company || activeCompanyId || "tech").toLowerCase().trim()
    const targetCompName = String(quotation.companyName || "").toLowerCase().trim()

    const matched = companies.find(c => {
      const cId = String(c.id || "").toLowerCase().trim()
      const cSlug = String(c.slug || "").toLowerCase().trim()
      const cName = String(c.name || "").toLowerCase().trim()
      const cBrand = String(c.brand_name || "").toLowerCase().trim()
      return (
        cId === targetCompId || 
        cSlug === targetCompId || 
        cName === targetCompId ||
        (targetCompName && (cName === targetCompName || cBrand === targetCompName))
      )
    })
    if (matched) return matched
    const defMatch = DEFAULT_COMPANIES.find(c => String(c.id || "").toLowerCase() === targetCompId || String(c.slug || "").toLowerCase() === targetCompId)
    return defMatch || companies[0] || DEFAULT_COMPANIES[0]
  }, [quotation.companyId, (quotation as any).company, quotation.companyName, activeCompanyId, companies])

  // Resolve Issuing Branch
  const activeBranch: Branch | null = React.useMemo(() => {
    const targetBranchId = String(quotation.branchId || (quotation as any).branch_id || "").toLowerCase().trim()
    const targetBranchName = String(quotation.branchName || (quotation as any).branch_name || "").toLowerCase().trim()

    if (!targetBranchId && !targetBranchName) return null

    const matched = (branches || []).find(b => {
      const bId = String(b.id || "").toLowerCase().trim()
      const bName = String(b.name || "").toLowerCase().trim()
      const bCode = String(b.code || "").toLowerCase().trim()
      return (targetBranchId && (bId === targetBranchId || bCode === targetBranchId)) ||
             (targetBranchName && (bName === targetBranchName || bCode === targetBranchName))
    })

    return matched || null
  }, [quotation.branchId, (quotation as any).branch_id, quotation.branchName, (quotation as any).branch_name, branches])

  // Resolve Issuing Sub-Branch (Partner)
  const activeSubBranch = React.useMemo(() => {
    const targetSbId = String(quotation.subBranchId || (quotation as any).sub_branch_id || "").toLowerCase().trim()
    const targetSbName = String(quotation.subBranchName || (quotation as any).sub_branch_name || "").toLowerCase().trim()

    if (!targetSbId && !targetSbName) return null

    return (subBranches || []).find(sb => {
      const sbId = String(sb.id || "").toLowerCase().trim()
      const sbName = String(sb.name || "").toLowerCase().trim()
      const sbCode = String(sb.code || "").toLowerCase().trim()
      return (targetSbId && (sbId === targetSbId || sbCode === targetSbId)) ||
             (targetSbName && (sbName === targetSbName || sbCode === targetSbName))
    }) || null
  }, [quotation.subBranchId, (quotation as any).sub_branch_id, quotation.subBranchName, (quotation as any).sub_branch_name, subBranches])

  const isSubBranchIssued = Boolean(activeSubBranch)
  const isBranchIssued = Boolean(activeBranch) && !isSubBranchIssued

  // Parent Company Corporate Details
  const resolvedBrandName = activeCompany?.brand_name || activeCompany?.name || "SAAMPARK"
  const resolvedDivisionName = activeCompany?.division_name !== undefined ? activeCompany.division_name : ""
  const resolvedSubtitle = activeCompany?.subtitle || ""
  const resolvedTrademarkSymbol = (activeCompany?.trademark_symbol || (activeCompany as any)?.invoice_customization?.trademark_symbol || "®").trim()
  const resolvedLogoUrl = getCompanyLogoUrl(activeCompany) || activeCompany?.logo_url || ""

  const resolvedAddress = activeCompany?.address?.trim() || ""
  const resolvedPhone = activeCompany?.phone?.trim() || ""
  const resolvedEmail = activeCompany?.email?.trim() || ""
  const resolvedWebsite = activeCompany?.website?.trim() || ""

  const resolvedCin = activeCompany?.cin?.trim() || ""
  const resolvedGstin = activeCompany?.gstin?.trim() || ""
  const resolvedPan = activeCompany?.pan?.trim() || ""
  const resolvedMsme = ((activeCompany as any)?.msme_reg || (activeCompany as any)?.msme || (activeCompany as any)?.udyam)?.trim() || ""

  // Banking details
  const resolvedBankName = (isSubBranchIssued 
    ? (activeSubBranch?.bank_name || (activeSubBranch as any)?.bankDetails?.bankName) 
    : isBranchIssued 
    ? activeBranch?.bank_name 
    : activeCompany?.bank_name)?.trim() || ""

  const resolvedAccountHolder = (isSubBranchIssued 
    ? (activeSubBranch?.account_holder || (activeSubBranch as any)?.bankDetails?.accountHolder) 
    : isBranchIssued 
    ? activeBranch?.account_holder 
    : activeCompany?.account_holder)?.trim() || ""

  const resolvedAccountNumber = (isSubBranchIssued 
    ? (activeSubBranch?.account_number || (activeSubBranch as any)?.bankDetails?.accountNumber) 
    : isBranchIssued 
    ? activeBranch?.account_number 
    : activeCompany?.account_number)?.trim() || ""

  const resolvedIfscCode = (isSubBranchIssued 
    ? (activeSubBranch?.ifsc_code || (activeSubBranch as any)?.bankDetails?.ifscCode) 
    : isBranchIssued 
    ? activeBranch?.ifsc_code 
    : activeCompany?.ifsc_code)?.trim() || ""

  const resolvedBankBranch = (isSubBranchIssued 
    ? activeSubBranch?.bank_branch 
    : isBranchIssued 
    ? activeBranch?.bank_branch 
    : activeCompany?.bank_branch)?.trim() || ""

  const resolvedUpiId = (isSubBranchIssued 
    ? (activeSubBranch?.upi_id || (activeSubBranch as any)?.bankDetails?.upiId) 
    : isBranchIssued 
    ? activeBranch?.upi_id 
    : activeCompany?.upi_id)?.trim() || ""

  // Signatory & Stamp
  const resolvedSignatoryName = (isSubBranchIssued 
    ? activeSubBranch?.signatory_name 
    : isBranchIssued 
    ? activeBranch?.signatory_name 
    : activeCompany?.signatory_name)?.trim() || "Authorized Signatory"

  const resolvedSignatoryDesignation = (isSubBranchIssued 
    ? activeSubBranch?.signatory_designation 
    : isBranchIssued 
    ? activeBranch?.signatory_designation 
    : activeCompany?.signatory_designation)?.trim() || (isBranchIssued ? "Branch Manager" : "Managing Director")

  const resolvedSignatureUrl = (isSubBranchIssued 
    ? activeSubBranch?.signature_image_url 
    : isBranchIssued 
    ? activeBranch?.signature_image_url 
    : activeCompany?.signature_image_url)?.trim() || ""

  const resolvedStampUrl = (isSubBranchIssued 
    ? activeSubBranch?.stamp_image_url 
    : isBranchIssued 
    ? activeBranch?.stamp_image_url 
    : activeCompany?.stamp_image_url)?.trim() || ""

  // Financial Computations
  const isNonGst = Boolean(
    (quotation as any).isNonGst || 
    (quotation as any).taxType === "nongst" || 
    ((quotation.tax === 0 || (quotation as any).taxType === "nongst") && quotation.subtotal && quotation.subtotal === quotation.total)
  )
  const grandTotal = quotation.total || 0
  const subtotal = quotation.subtotal !== undefined ? quotation.subtotal : (isNonGst ? grandTotal : Math.round(grandTotal / 1.18))
  const gstAmount = isNonGst ? 0 : (quotation.tax !== undefined ? quotation.tax : (grandTotal - subtotal))
  const cgst = Math.round(gstAmount / 2)
  const sgst = gstAmount - cgst

  // Resolved line items / deliverable modules with priority to deliverables if user specified modules
  const rawDeliverables: any[] = Array.isArray(quotation.deliverables) && quotation.deliverables.length > 0
    ? quotation.deliverables
    : []

  const rawItems: any[] = Array.isArray(quotation.items) && quotation.items.length > 0
    ? quotation.items
    : (Array.isArray(quotation.services) && quotation.services.length > 0 ? quotation.services : [])

  let lineItems: QuotationLineItem[] = []

  if (rawDeliverables.length > 0) {
    // User explicitly defined deliverables/modules (e.g. 5-6 modules in Document Studio)
    const count = rawDeliverables.length
    const hasPerItemPricing = rawItems.length === count && rawItems.some(it => (it.total || it.unitPrice || it.rate) > 0)
    const baseSharePerModule = count > 0 ? Math.floor(subtotal / count) : subtotal
    const remainder = subtotal - (baseSharePerModule * count)

    lineItems = rawDeliverables.map((d: any, idx: number) => {
      const matchedItem = rawItems.find((it: any) => 
        (it.id && d.id && String(it.id) === String(d.id)) ||
        (it.name && d.title && it.name.toLowerCase().trim() === d.title.toLowerCase().trim())
      ) || (rawItems.length === count ? rawItems[idx] : null)

      const title = d.title || d.name || matchedItem?.name || matchedItem?.serviceName || `Module ${idx + 1}`
      const description = d.description || matchedItem?.description || ""
      const duration = d.duration || matchedItem?.deliverableTime || matchedItem?.duration || "1-2 Weeks"
      const sac = matchedItem?.sac || matchedItem?.sacCode || rawItems[0]?.sac || "998311"
      const qty = matchedItem?.quantity || matchedItem?.qty || 1
      const unit = matchedItem?.unit || "Module"

      let itemBase = 0
      if (hasPerItemPricing && matchedItem) {
        itemBase = matchedItem.total || ((matchedItem.unitPrice || matchedItem.rate || 0) * qty)
      } else if (rawItems.length === 1 && (rawItems[0].total || rawItems[0].unitPrice)) {
        itemBase = idx === count - 1 ? (baseSharePerModule + remainder) : baseSharePerModule
      } else {
        itemBase = idx === count - 1 ? (baseSharePerModule + remainder) : baseSharePerModule
      }

      const unitPrice = qty > 0 ? Math.round(itemBase / qty) : itemBase

      return {
        id: d.id || `mod_${idx + 1}`,
        name: title,
        serviceName: title,
        description: description,
        deliverableTime: duration,
        sac: sac,
        quantity: qty,
        unit: unit,
        unitPrice: unitPrice,
        total: itemBase,
      }
    })
  } else if (rawItems.length > 0) {
    lineItems = rawItems.map((it: any, idx: number) => {
      const name = it.name || it.serviceName || it.title || `Module ${idx + 1}`
      const qty = it.quantity || it.qty || 1
      const unitPrice = it.unitPrice || it.rate || (it.total ? Math.round(it.total / qty) : 0)
      const total = it.total || it.totalAmount || (unitPrice * qty)
      return {
        ...it,
        id: it.id || `mod_${idx + 1}`,
        name: name,
        serviceName: name,
        description: it.description || "",
        deliverableTime: it.deliverableTime || it.duration || it.turnaround || "1-2 Weeks",
        sac: it.sac || it.sacCode || "998311",
        quantity: qty,
        unit: it.unit || "Nos",
        unitPrice: unitPrice,
        total: total,
      }
    })
  } else {
    // Fallback single default module
    lineItems = [
      {
        id: "mod_1",
        name: quotation.project || quotation.projectTitle || "Enterprise Solution & Engineering Scope",
        serviceName: quotation.project || quotation.projectTitle || "Enterprise Solution & Engineering Scope",
        description: quotation.overview || quotation.notes || "Complete custom architecture, database engineering, deployment & operational support.",
        deliverableTime: quotation.timeline || quotation.turnaroundTime || "4-6 Weeks",
        sac: "998311",
        quantity: 1,
        unit: "Project",
        unitPrice: subtotal,
        total: subtotal
      }
    ]
  }

  // Scannable UPI QR: Strictly respects uploaded QR images; if cleared or deleted, NO QR is rendered
  const isImageQrUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== "string") return false
    const s = url.trim()
    return s !== "" && s !== "none" && (s.startsWith("http") || s.startsWith("data:") || s.startsWith("/"))
  }

  const rawCandidateQr = isSubBranchIssued
    ? (isNonGst ? (activeSubBranch?.nongst_payment_qr_url || activeSubBranch?.payment_qr_url) : (activeSubBranch?.gst_payment_qr_url || activeSubBranch?.payment_qr_url))
    : isBranchIssued
    ? (isNonGst ? (activeBranch?.nongst_payment_qr_url || activeBranch?.payment_qr_url) : (activeBranch?.gst_payment_qr_url || activeBranch?.payment_qr_url))
    : (isNonGst ? (activeCompany?.nongst_payment_qr_url || activeCompany?.payment_qr_url) : (activeCompany?.gst_payment_qr_url || activeCompany?.payment_qr_url))

  const resolvedPaymentQrUrl = isImageQrUrl(rawCandidateQr) ? rawCandidateQr : null

  const handlePrint = () => {
    printDocument("printable-quotation", `Quotation_${quotation.number}`)
  }

  // Theme matching corporate palette (GST Teal vs Non-GST Sky Blue)
  const theme = isNonGst
    ? {
        cardHeaderGradient: "bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
        tableHeaderBg: "bg-[#0284c7] text-white",
        primaryText: "text-[#0284c7]",
        primaryBg: "bg-[#0ea5e9]",
        grandTotalBg: "bg-[#0284c7] text-white",
        lightBg: "bg-sky-50/80",
        lightBorder: "border-sky-200",
      }
    : {
        cardHeaderGradient: "bg-gradient-to-r from-[#005f69] via-[#007380] to-[#008a99]",
        tableHeaderBg: "bg-[#005f69] text-white",
        primaryText: "text-[#005f69]",
        primaryBg: "bg-[#005f69]",
        grandTotalBg: "bg-[#005f69] text-white",
        lightBg: "bg-teal-50/70",
        lightBorder: "border-teal-200",
      }

  const isValidField = (val: any) => {
    if (val === null || val === undefined) return false
    const s = String(val).trim()
    return s !== "" && s !== "-" && s !== "N/A" && s !== "null" && s !== "undefined"
  }

  const hasBankName = isValidField(resolvedBankName)
  const hasAccountHolder = isValidField(resolvedAccountHolder)
  const hasAccountNum = isValidField(resolvedAccountNumber)
  const hasIfsc = isValidField(resolvedIfscCode)
  const hasBankBranch = isValidField(resolvedBankBranch)
  const hasUpi = isValidField(resolvedUpiId)
  const hasQr = Boolean(resolvedPaymentQrUrl)
  const hasAnyBankInfo = Boolean(hasBankName || hasAccountHolder || hasAccountNum || hasIfsc || hasBankBranch)
  const hasAnyPaymentInfo = Boolean(hasAnyBankInfo || hasUpi || hasQr)

  const hasCin = isValidField(resolvedCin)
  const hasGstin = isValidField(resolvedGstin)
  const hasPan = isValidField(resolvedPan)
  const hasMsme = isValidField(resolvedMsme)
  const hasLegalIds = Boolean(hasCin || hasGstin || hasPan || hasMsme)

  const hasPhone = isValidField(resolvedPhone)
  const hasWebsite = isValidField(resolvedWebsite)
  const hasEmail = isValidField(resolvedEmail)
  const hasContactInfo = Boolean(hasPhone || hasWebsite || hasEmail)

  const resolvedProjectTitle = quotation.project || quotation.projectTitle || "Enterprise Engineering & Technical Scope"
  const resolvedCategory = quotation.category || quotation.primaryCategory || "Software & Technology"
  const resolvedOverview = quotation.overview || quotation.notes || ""
  const resolvedTimeline = quotation.timeline || "4-6 Weeks"
  const resolvedTurnaround = quotation.turnaroundTime || "1-2 Weeks"

  
  __ctrl = { quotation, onClose, onAccept, onDecline, onRequestModify, onSendEmail, onConvertToInvoice, onConvertToProject, onConvertToClient, onSendEstimate, isClientRole, isForm9Open, setIsForm9Open, companies, branches, subBranches, activeCompanyId, fetchCompanies, fetchBranches, fetchSubBranches, activeCompany, activeBranch, activeSubBranch, isSubBranchIssued, isBranchIssued, resolvedBrandName, resolvedDivisionName, resolvedSubtitle, resolvedTrademarkSymbol, resolvedLogoUrl, resolvedAddress, resolvedPhone, resolvedEmail, resolvedWebsite, resolvedCin, resolvedGstin, resolvedPan, resolvedMsme, resolvedBankName, resolvedAccountHolder, resolvedAccountNumber, resolvedIfscCode, resolvedBankBranch, resolvedUpiId, resolvedSignatoryName, resolvedSignatoryDesignation, resolvedSignatureUrl, resolvedStampUrl, isNonGst, grandTotal, subtotal, gstAmount, cgst, sgst, rawDeliverables, rawItems, lineItems, isImageQrUrl, rawCandidateQr, resolvedPaymentQrUrl, handlePrint, theme, isValidField, hasBankName, hasAccountHolder, hasAccountNum, hasIfsc, hasBankBranch, hasUpi, hasQr, hasAnyBankInfo, hasAnyPaymentInfo, hasCin, hasGstin, hasPan, hasMsme, hasLegalIds, hasPhone, hasWebsite, hasEmail, hasContactInfo, resolvedProjectTitle, resolvedCategory, resolvedOverview, resolvedTimeline, resolvedTurnaround };
  __ctrlRef.current = __ctrl;
return (
    <div className="official-quotation-modal-root relative flex flex-col w-full max-w-4xl mx-auto my-2 sm:my-4 bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 print:border-none print:shadow-none print:my-0 print:max-w-none print:w-full">
      <OfficialQuotationDocumentSection4 ctrl={__ctrl} />
      <div className="w-full flex flex-col items-center py-2 print:p-0 print:m-0 overflow-x-auto">
        <div 
          id="printable-quotation" 
          className="a4-page block w-full max-w-[820px] mx-auto overflow-visible p-0 bg-transparent space-y-6 print:space-y-0 print:p-0 print:m-0 print:w-[210mm] print:max-w-[210mm]"
        >
        
        {/* ── PAGE 1 CONTAINER: Header, Customer Details & Project Details Only ── */}
        <OfficialQuotationDocumentSection1 ctrl={__ctrl} />
        {/* ── END OF PAGE 1 ── */}

        {/* Visual Page Break Indicator on Screen (Hidden when printed) */}
        <div className="print:hidden flex items-center justify-center my-4 gap-3 select-none">
          <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center gap-1.5 shadow-2xs">
            📄 End of Page 1 • Detailed Technical Specifications Follow on Page 2
          </span>
          <div className="flex-1 border-t-2 border-dashed border-zinc-300 dark:border-zinc-700" />
        </div>

        {/* ── INTERMEDIATE PAGES: Modules Roadmap, Scope Breakdown Cards & Specifications ── */}
        <OfficialQuotationDocumentSection2 ctrl={__ctrl} />
      <OfficialQuotationDocumentSection3 ctrl={__ctrl} />
      {/* ── END OF VERY LAST PAGE ── */}
      </div>
    </div>

    {/* Form No. 9 Modal Viewer */}
    {isForm9Open && quotation.marketingPackage && (
      <OfficialFormNo9Document
        pkg={quotation.marketingPackage}
        clientInfo={{
          name: quotation.customer,
          businessName: quotation.customer,
          phone: quotation.customerPhone,
          address: quotation.customerAddress,
          category: quotation.category || quotation.primaryCategory,
        }}
        branchInfo={{
          branchName: activeBranch?.name || activeSubBranch?.name || "Balichak",
          branchCode: activeBranch?.code || activeSubBranch?.code || "B-2501",
        }}
        onClose={() => setIsForm9Open(false)}
      />
    )}
  </div>
  )
}
