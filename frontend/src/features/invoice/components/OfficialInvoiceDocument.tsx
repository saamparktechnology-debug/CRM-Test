"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  MapPin, Phone, Mail, Globe, Building2, Landmark, ShieldCheck, 
  Award, Sparkles, UserCheck, Briefcase, FileText, QrCode, CreditCard, 
  CheckCircle2, Layers, Check, Megaphone
} from "lucide-react"
import { InvoiceItem, InvoiceLineItem, parseCurrencyNumber } from "../services/invoiceService"
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
export * from "@/features/invoice/components/officialinvoicedocument-sections/OfficialInvoiceDocumentHelpers"
import { createOfficialInvoiceDocumentAction20 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/createOfficialInvoiceDocumentAction20.hooks"
import { computeOfficialInvoiceDocumentMemo50 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/computeOfficialInvoiceDocumentMemo50.hooks"
import { computeOfficialInvoiceDocumentMemo51 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/computeOfficialInvoiceDocumentMemo51.hooks"
import { computeOfficialInvoiceDocumentMemo52 } from "@/features/invoice/hooks/officialinvoicedocument-hooks/computeOfficialInvoiceDocumentMemo52.hooks"



export function OfficialInvoiceDocument({
  invoice,
  clientDetails,
  companyDetails,
  paySettings,
  interactive = false,
  allowTextEdit = false,
  logoPosition: propLogoPosition,
  onLogoPositionChange,
  logoScale: propLogoScale,
  onLogoScaleChange,
  stampPosition: propStampPosition,
  onStampPositionChange,
  stampScale: propStampScale,
  onStampScaleChange,
  signaturePosition: propSignaturePosition,
  onSignaturePositionChange,
  signatureScale: propSignatureScale,
  onSignatureScaleChange,
  customStamps: propCustomStamps,
  onCustomStampMove,
  onCustomStampUpdate,
  onRemoveCustomStamp,
  onAddCustomStamp,
  onFieldChange,
  overrideLogoUrl,
  overrideSignatureUrl,
  overrideStampUrl,
  overrideBankDetails,
  activeBranch: propActiveBranch,
  activeSubBranch: propActiveSubBranch,
}: OfficialInvoiceDocumentProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const isTextEditable = Boolean(interactive && allowTextEdit)

  const { 
    companies, 
    branches, 
    subBranches, 
    activeCompanyId, 
    activeBranchId,
    fetchCompanies, 
    fetchBranches, 
    fetchSubBranches 
  } = useAuthStore()

  // Ensure entities are fetched if not yet loaded
  React.useEffect(() => {
    if (!companies || companies.length === 0) fetchCompanies().catch(() => {})
    if (!branches || branches.length === 0) fetchBranches().catch(() => {})
    if (!subBranches || subBranches.length === 0) fetchSubBranches().catch(() => {})
  }, [companies, branches, subBranches, fetchCompanies, fetchBranches, fetchSubBranches])

  // 1. Resolve Company Details dynamically based on specific invoice company
  const activeCompany: any = React.useMemo(() => computeOfficialInvoiceDocumentMemo50({ companyDetails, invoice, activeCompanyId, companies }), [companyDetails, invoice.companyId, (invoice as any).company, (invoice as any).companyName, activeCompanyId, companies]);

  // Resolve Issuing Branch / Sub-Branch Details
  const activeBranch: any = React.useMemo(() => computeOfficialInvoiceDocumentMemo51({ propActiveBranch, invoice, branches }), [propActiveBranch, invoice.branchId, invoice.branchName, (invoice as any).branch_id, (invoice as any).branch_name, (invoice as any).branchCode, branches]);

  const activeSubBranch = React.useMemo(() => {
    if (propActiveSubBranch) return propActiveSubBranch
    const targetSbId = String(invoice.subBranchId || (invoice as any).sub_branch_id || "").toLowerCase().trim()
    const targetSbName = String(invoice.subBranchName || (invoice as any).sub_branch_name || "").toLowerCase().trim()

    if (!targetSbId && !targetSbName) return null

    return (subBranches || []).find(sb => {
      const sbId = String(sb.id || "").toLowerCase().trim()
      const sbName = String(sb.name || "").toLowerCase().trim()
      const sbCode = String(sb.code || "").toLowerCase().trim()
      return (targetSbId && (sbId === targetSbId || sbCode === targetSbId)) ||
             (targetSbName && (sbName === targetSbName || sbCode === targetSbName))
    }) || null
  }, [propActiveSubBranch, invoice.subBranchId, invoice.subBranchName, (invoice as any).sub_branch_id, (invoice as any).sub_branch_name, subBranches])

  // Resolve Parent Branch for Sub-Branch
  const resolvedParentBranch: Branch | null = React.useMemo(() => {
    if (propActiveBranch) return propActiveBranch
    if (activeBranch && !propActiveSubBranch) return activeBranch
    if (!activeSubBranch) return null
    const parentId = String(activeSubBranch.parentBranchId || (activeSubBranch as any).branch_id || (activeSubBranch as any).branchId || invoice.branchId || (invoice as any).branch_id || "").toLowerCase().trim()
    if (!parentId) return activeBranch || null
    return (branches || []).find(b => {
      const bId = String(b.id || "").toLowerCase().trim()
      const bCode = String(b.code || "").toLowerCase().trim()
      return bId === parentId || bCode === parentId
    }) || activeBranch || null
  }, [propActiveBranch, activeBranch, propActiveSubBranch, activeSubBranch, invoice.branchId, (invoice as any).branch_id, branches])

  const isSubBranchIssued = Boolean(activeSubBranch)
  const isBranchIssued = Boolean(activeBranch) && !isSubBranchIssued
  const activeEntity = isSubBranchIssued ? activeSubBranch : isBranchIssued ? activeBranch : activeCompany

  const entitySigPos = (activeEntity as any)?.signature_position
  const entityStampPos = (activeEntity as any)?.stamp_position
  const entityLogoPos = (activeEntity as any)?.logo_position
  const entityLogoScale = (activeEntity as any)?.logo_scale
  const entityStampScale = (activeEntity as any)?.stamp_scale
  const entitySigScale = (activeEntity as any)?.signature_scale
  const entityCustomStamps = (activeEntity as any)?.custom_stamps

  const logoPosition = propLogoPosition ?? entityLogoPos ?? { x: 0, y: 0 }
  const logoScale = propLogoScale ?? entityLogoScale ?? 1
  const stampPosition = propStampPosition ?? entityStampPos ?? { x: 0, y: 0 }
  const stampScale = propStampScale ?? entityStampScale ?? 1
  const signaturePosition = propSignaturePosition ?? entitySigPos ?? { x: 0, y: 0 }
  const signatureScale = propSignatureScale ?? entitySigScale ?? 1
  const customStamps: CustomTextStamp[] = (propCustomStamps && propCustomStamps.length > 0) ? propCustomStamps : (entityCustomStamps || [])

  // Corporate Entity Details (Corporate identity remains intact forever; branches/sub-branches appear in their designated hierarchy strip)
  const resolvedBrandName = companyDetails?.brand_name !== undefined ? companyDetails.brand_name : (activeCompany?.brand_name !== undefined ? activeCompany.brand_name : (activeCompany?.name || "SAAMPARK"))
  const resolvedDivisionName = companyDetails?.division_name !== undefined ? companyDetails.division_name : (activeCompany?.division_name || "")
  const resolvedSubtitle = companyDetails?.subtitle !== undefined ? companyDetails.subtitle : (activeCompany?.subtitle || "")
  const rawTm = companyDetails?.trademark_symbol !== undefined 
    ? companyDetails.trademark_symbol 
    : activeCompany?.trademark_symbol !== undefined 
    ? activeCompany.trademark_symbol 
    : (activeCompany as any)?.invoice_customization?.trademark_symbol
  const resolvedTrademarkSymbol = (!rawTm || rawTm.trim().toLowerCase() === "none" || rawTm.trim() === "")
    ? ""
    : rawTm.trim()
  const resolvedLogoUrl = overrideLogoUrl || getCompanyLogoUrl(activeCompany) || activeCompany?.logo_url || companyDetails?.logo_url || ""

  // Specific Entity Legal IDs (Strictly user-typed values; totally blank if not filled, NO fake examples)
  const resolvedCin = (companyDetails ? companyDetails.cin : activeCompany?.cin)?.trim() || ""
  const resolvedGstin = (companyDetails ? companyDetails.gstin : activeCompany?.gstin)?.trim() || ""
  const resolvedPan = (companyDetails ? companyDetails.pan : activeCompany?.pan)?.trim() || ""
  const resolvedMsme = (companyDetails?.msme_reg || (companyDetails as any)?.msme || activeCompany?.msme_reg || (activeCompany as any)?.msme || (activeCompany as any)?.udyam)?.trim() || ""

  // Address & Contact Information (Corporate entity defaults)
  const resolvedAddress = (companyDetails ? companyDetails.address : activeCompany?.address) || ""
  const resolvedCity = (companyDetails ? (companyDetails as any).city : activeCompany?.city) || ""
  const resolvedState = (companyDetails ? (companyDetails as any).state : activeCompany?.state) || ""
  const resolvedZip = (companyDetails ? ((companyDetails as any).zip || (companyDetails as any).pincode) : (activeCompany?.zip || (activeCompany as any)?.pincode)) || ""
  const resolvedCountry = (companyDetails ? (companyDetails as any).country : activeCompany?.country) || ""
  const resolvedPhone = (companyDetails ? companyDetails.phone : activeCompany?.phone)?.trim() || ""
  const resolvedEmail = (companyDetails ? companyDetails.email : activeCompany?.email)?.trim() || ""
  const resolvedWebsite = (companyDetails ? companyDetails.website : activeCompany?.website)?.trim() || ""

  // Formatted Full Office Address
  const fullAddressSegments = [
    resolvedAddress.trim(),
    resolvedCity.trim(),
    resolvedState.trim() ? (resolvedZip.trim() ? `${resolvedState.trim()} - ${resolvedZip.trim()}` : resolvedState.trim()) : (resolvedZip.trim() ? `PIN: ${resolvedZip.trim()}` : ""),
    resolvedCountry.trim()
  ].filter(Boolean)
  const resolvedFullOfficeAddress = fullAddressSegments.length > 0 
    ? fullAddressSegments.join(", ")
    : (resolvedAddress.trim() || "Kolkata, West Bengal, India")

  // 2. Determine if GST (>0%) or Non-GST / 0% GST Bill (Done early for Bank profile binding)
  const invIdStr = String(invoice?.id || (invoice as any)?.invoiceNumber || "").toUpperCase().trim()
  const isExplicitNonGst = 
    invIdStr.startsWith("NGINV") || 
    (invoice as any).invoiceType === "nongst" || 
    (invoice as any).type === "nongst" || 
    (invoice.gstRate === 0 && (!invoice.items || invoice.items.every(it => !it.gstRate || it.gstRate === 0))) ||
    (invoice.gstAmount === 0 && (!invoice.items || invoice.items.every(it => !it.gstAmount || it.gstAmount === 0)))
  
  const hasItemGst = Array.isArray(invoice.items) && invoice.items.length > 0
    ? invoice.items.some(it => (Number(it.gstRate) || 0) > 0 || (Number(it.gstAmount) || 0) > 0)
    : false

  const isGstInvoice = !isExplicitNonGst && Boolean(
    hasItemGst ||
    (typeof invoice.gstRate === "number" && invoice.gstRate > 0) ||
    (typeof invoice.gstAmount === "number" && invoice.gstAmount > 0)
  )

  // Full official company name resolution
  const fullRegisteredCompanyName = (
    companyDetails?.name || 
    (invoice as any).companyName ||
    activeCompany?.name || 
    `${resolvedBrandName} ${resolvedDivisionName}`.trim() || 
    resolvedBrandName ||
    "SAAMPARK"
  ).trim()

  // Split Corporate Brand & Division for Top Header Typography
  // Top line: SAAMPARK (with optional TM/R badge)
  // Second line: Header Line 2 (division_name) - strictly what user typed, no forced suffixes
  // Space is preserved as a letter/character exactly as typed by the user
  let headerBrandName = (resolvedBrandName !== undefined && resolvedBrandName !== null && resolvedBrandName !== ""
    ? String(resolvedBrandName)
    : "SAAMPARK").toUpperCase()
  let headerSecondaryLine = (resolvedDivisionName !== undefined && resolvedDivisionName !== null
    ? String(resolvedDivisionName)
    : (activeCompany?.division_name || "")).toUpperCase()

  // Helper to validate non-empty string fields (strictly ignores empty, null, and placeholder text)
  const isValidField = (val?: string | null): boolean => {
    if (!val) return false
    const s = String(val).trim().toLowerCase()
    return s !== "" && s !== "none" && s !== "-" && s !== "null" && s !== "undefined" && s !== "n/a" && s !== "na"
  }

  const isCustomCompany = Boolean(companyDetails)

  // Parent Company baseline values (Strictly read from companyDetails or activeCompany; NO hardcoded fallback values)
  const companyGstUpi = (
    isCustomCompany 
      ? (companyDetails?.gst_upi_id ?? (companyDetails as any)?.upi_id ?? "") 
      : (activeCompany?.gst_upi_id || activeCompany?.upi_id || "")
  )?.trim() || ""

  const companyNonGstUpi = (
    isCustomCompany 
      ? (companyDetails?.nongst_upi_id ?? "") 
      : (activeCompany?.nongst_upi_id || "")
  )?.trim() || ""

  const companyUpi = isGstInvoice ? companyGstUpi : companyNonGstUpi

  const companyGstHolder = (
    isCustomCompany 
      ? (companyDetails?.gst_account_holder ?? (companyDetails as any)?.account_holder ?? "") 
      : (activeCompany?.gst_account_holder || activeCompany?.account_holder || "")
  )?.trim() || ""

  const companyNonGstHolder = (
    isCustomCompany 
      ? (companyDetails?.nongst_account_holder ?? "") 
      : (activeCompany?.nongst_account_holder || "")
  )?.trim() || ""

  const companyHolder = isGstInvoice ? companyGstHolder : companyNonGstHolder

  const companyGstBank = (
    isCustomCompany 
      ? (companyDetails?.gst_bank_name ?? (companyDetails as any)?.bank_name ?? "") 
      : (activeCompany?.gst_bank_name || activeCompany?.bank_name || "")
  )?.trim() || ""

  const companyNonGstBank = (
    isCustomCompany 
      ? (companyDetails?.nongst_bank_name ?? "") 
      : (activeCompany?.nongst_bank_name || "")
  )?.trim() || ""

  const companyBank = isGstInvoice ? companyGstBank : companyNonGstBank

  const companyGstAccNum = (
    isCustomCompany 
      ? (companyDetails?.gst_account_number ?? (companyDetails as any)?.account_number ?? "") 
      : (activeCompany?.gst_account_number || activeCompany?.account_number || "")
  )?.trim() || ""

  const companyNonGstAccNum = (
    isCustomCompany 
      ? (companyDetails?.nongst_account_number ?? "") 
      : (activeCompany?.nongst_account_number || "")
  )?.trim() || ""

  const companyAccNum = isGstInvoice ? companyGstAccNum : companyNonGstAccNum

  const companyGstIfsc = (
    isCustomCompany 
      ? (companyDetails?.gst_ifsc_code ?? (companyDetails as any)?.ifsc_code ?? "") 
      : (activeCompany?.gst_ifsc_code || activeCompany?.ifsc_code || "")
  )?.trim() || ""

  const companyNonGstIfsc = (
    isCustomCompany 
      ? (companyDetails?.nongst_ifsc_code ?? "") 
      : (activeCompany?.nongst_ifsc_code || "")
  )?.trim() || ""

  const companyIfsc = isGstInvoice ? companyGstIfsc : companyNonGstIfsc

  const companyGstBranch = (
    isCustomCompany 
      ? (companyDetails?.gst_bank_branch ?? (companyDetails as any)?.bank_branch ?? "") 
      : (activeCompany?.gst_bank_branch || activeCompany?.bank_branch || "")
  )?.trim() || ""

  const companyNonGstBranch = (
    isCustomCompany 
      ? (companyDetails?.nongst_bank_branch ?? "") 
      : (activeCompany?.nongst_bank_branch || "")
  )?.trim() || ""

  const companyBranch = isGstInvoice ? companyGstBranch : companyNonGstBranch

  // Bank & UPI details resolved specifically for issuing entity. If left gap / blank, resolves cleanly to "" without fake fallbacks
  let resolvedUpiId = (
    overrideBankDetails?.upiId !== undefined
      ? overrideBankDetails.upiId
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_upi_id || activeSubBranch?.upi_id || activeBranch?.gst_upi_id || activeBranch?.upi_id || companyGstUpi) : (activeSubBranch?.nongst_upi_id || activeBranch?.nongst_upi_id || companyNonGstUpi))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_upi_id || activeBranch?.upi_id || companyGstUpi) : (activeBranch?.nongst_upi_id || companyNonGstUpi))
          : (isGstInvoice ? companyGstUpi : companyNonGstUpi)
        )
  )?.trim() || ""

  let resolvedAccountHolder = (
    overrideBankDetails?.accountHolder !== undefined
      ? overrideBankDetails.accountHolder
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_account_holder || activeSubBranch?.account_holder || activeBranch?.gst_account_holder || activeBranch?.account_holder || companyGstHolder) : (activeSubBranch?.nongst_account_holder || activeBranch?.nongst_account_holder || companyNonGstHolder))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_account_holder || activeBranch?.account_holder || companyGstHolder) : (activeBranch?.nongst_account_holder || companyNonGstHolder))
          : (isGstInvoice ? companyGstHolder : companyNonGstHolder)
        )
  )?.trim() || ""

  let resolvedBankName = (
    overrideBankDetails?.bankName !== undefined
      ? overrideBankDetails.bankName
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_bank_name || activeSubBranch?.bank_name || activeBranch?.gst_bank_name || activeBranch?.bank_name || companyGstBank) : (activeSubBranch?.nongst_bank_name || activeBranch?.nongst_bank_name || companyNonGstBank))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_bank_name || activeBranch?.bank_name || companyGstBank) : (activeBranch?.nongst_bank_name || companyNonGstBank))
          : (isGstInvoice ? companyGstBank : companyNonGstBank)
        )
  )?.trim() || ""

  let resolvedAccountNumber = (
    overrideBankDetails?.accountNumber !== undefined
      ? overrideBankDetails.accountNumber
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_account_number || activeSubBranch?.account_number || activeBranch?.gst_account_number || activeBranch?.account_number || companyGstAccNum) : (activeSubBranch?.nongst_account_number || activeBranch?.nongst_account_number || companyNonGstAccNum))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_account_number || activeBranch?.account_number || companyGstAccNum) : (activeBranch?.nongst_account_number || companyNonGstAccNum))
          : (isGstInvoice ? companyGstAccNum : companyNonGstAccNum)
        )
  )?.trim() || ""

  let resolvedIfscCode = (
    overrideBankDetails?.ifscCode !== undefined
      ? overrideBankDetails.ifscCode
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_ifsc_code || activeSubBranch?.ifsc_code || activeBranch?.gst_ifsc_code || activeBranch?.ifsc_code || companyGstIfsc) : (activeSubBranch?.nongst_ifsc_code || activeBranch?.nongst_ifsc_code || companyNonGstIfsc))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_ifsc_code || activeBranch?.ifsc_code || companyGstIfsc) : (activeBranch?.nongst_ifsc_code || companyNonGstIfsc))
          : (isGstInvoice ? companyGstIfsc : companyNonGstIfsc)
        )
  )?.trim() || ""

  let resolvedBankBranch = (
    overrideBankDetails?.bankBranch !== undefined
      ? overrideBankDetails.bankBranch
      : (isSubBranchIssued 
          ? (isGstInvoice ? (activeSubBranch?.gst_bank_branch || activeSubBranch?.bank_branch || activeBranch?.gst_bank_branch || activeBranch?.bank_branch || companyGstBranch) : (activeSubBranch?.nongst_bank_branch || activeBranch?.nongst_bank_branch || companyNonGstBranch))
          : isBranchIssued 
          ? (isGstInvoice ? (activeBranch?.gst_bank_branch || activeBranch?.bank_branch || companyGstBranch) : (activeBranch?.nongst_bank_branch || companyNonGstBranch))
          : (isGstInvoice ? companyGstBranch : companyNonGstBranch)
        )
  )?.trim() || ""

  // STRICT NON-GST PRIVACY GUARD: Non-GST invoices must NEVER display corporate GST bank details or GST QR
  if (!isGstInvoice) {
    const isAccNumSameAsGst = Boolean(companyGstAccNum && resolvedAccountNumber && resolvedAccountNumber.replace(/\s+/g, '') === companyGstAccNum.replace(/\s+/g, ''))
    const isUpiSameAsGst = Boolean(companyGstUpi && resolvedUpiId && resolvedUpiId.toLowerCase().trim() === companyGstUpi.toLowerCase().trim())
    if (isAccNumSameAsGst) {
      resolvedAccountNumber = ""
      resolvedBankName = ""
      resolvedIfscCode = ""
      resolvedAccountHolder = ""
      resolvedBankBranch = ""
    }
    if (isUpiSameAsGst) {
      resolvedUpiId = ""
    }
  }

  // Signatory & Stamp URLs (Strict to issuing entity with seamless cascade to parent Company)
  const companySignatureFallback = (
    (companyDetails as any)?.signature_image_url ||
    (companyDetails as any)?.signatureImageUrl ||
    (companyDetails as any)?.signature_url ||
    activeCompany?.signature_image_url ||
    (activeCompany as any)?.signatureImageUrl ||
    (activeCompany as any)?.signature_url ||
    ""
  )?.trim()

  const companyStampFallback = (
    (companyDetails as any)?.stamp_image_url ||
    (companyDetails as any)?.stampImageUrl ||
    (companyDetails as any)?.stamp_url ||
    activeCompany?.stamp_image_url ||
    (activeCompany as any)?.stampImageUrl ||
    (activeCompany as any)?.stamp_url ||
    ""
  )?.trim()

  const resolvedSignatureUrl = overrideSignatureUrl || (
    isSubBranchIssued 
      ? (activeSubBranch?.signature_image_url?.trim() || activeBranch?.signature_image_url?.trim() || companySignatureFallback)
      : isBranchIssued 
      ? (activeBranch?.signature_image_url?.trim() || companySignatureFallback)
      : companySignatureFallback
  ) || ""

  const resolvedStampUrl = overrideStampUrl || (
    isSubBranchIssued 
      ? (activeSubBranch?.stamp_image_url?.trim() || activeBranch?.stamp_image_url?.trim() || companyStampFallback)
      : isBranchIssued 
      ? (activeBranch?.stamp_image_url?.trim() || companyStampFallback)
      : companyStampFallback
  ) || ""

  const resolvedSignatoryName = (isSubBranchIssued 
    ? (activeSubBranch?.signatory_name || (activeSubBranch as any)?.partner_name || (activeSubBranch as any)?.partnerName || activeBranch?.signatory_name || (companyDetails as any)?.signatory_name || activeCompany?.signatory_name)
    : isBranchIssued 
    ? (activeBranch?.signatory_name || activeBranch?.managerName || (activeBranch as any)?.manager_name || (companyDetails as any)?.signatory_name || activeCompany?.signatory_name)
    : ((companyDetails as any)?.signatory_name || activeCompany?.signatory_name))?.trim() || "Authorized Signatory"

  const resolvedSignatoryDesignation = (isSubBranchIssued 
    ? (activeSubBranch?.signatory_designation || `${(activeSubBranch as any)?.partner_type || 'Franchise'} Partner` || activeBranch?.signatory_designation || (companyDetails as any)?.signatory_designation || activeCompany?.signatory_designation)
    : isBranchIssued 
    ? (activeBranch?.signatory_designation || "Branch Manager" || (companyDetails as any)?.signatory_designation || activeCompany?.signatory_designation)
    : ((companyDetails as any)?.signatory_designation || activeCompany?.signatory_designation))?.trim() || "Managing Director"

  // ISO / Quality Certification Badge text (Editable)
  const resolvedIsoCertification = (
    isValidField((companyDetails as any)?.iso_certification)
      ? String((companyDetails as any)?.iso_certification).trim()
      : isSubBranchIssued && isValidField((activeSubBranch as any)?.iso_certification)
      ? String((activeSubBranch as any)?.iso_certification).trim()
      : isBranchIssued && isValidField((activeBranch as any)?.iso_certification)
      ? String((activeBranch as any)?.iso_certification).trim()
      : isValidField((activeCompany as any)?.iso_certification)
      ? String((activeCompany as any)?.iso_certification).trim()
      : "An ISO 9001:2015 Certified Company"
  )

  // Terms & Conditions: Sub-Branch and Branch terms strictly OVERWRITE company terms
  const resolvedTermsAndNotes = (
    (isSubBranchIssued && activeSubBranch?.terms_conditions && activeSubBranch.terms_conditions.trim())
      ? activeSubBranch.terms_conditions
      : (isBranchIssued && activeBranch?.terms_conditions && activeBranch.terms_conditions.trim())
      ? activeBranch.terms_conditions
      : (companyDetails?.terms_conditions?.trim() ||
         activeCompany?.terms_conditions?.trim() ||
         (invoice as any)?.terms?.trim() ||
         "1. E. & O.E.\n2. Total payment due within due date to avoid suspension/cancellation.\n3. Please include invoice number in payment notes.\n4. All disputes subject to local jurisdiction.")
  )?.trim()

  // Theme configuration based on GST (Teal theme) vs Non-GST (Light Blue theme)
  const theme = isGstInvoice
    ? {
        name: "gst-teal",
        headerGradient: "bg-gradient-to-r from-[#005f69] via-[#007380] to-[#008a99]",
        cardHeaderGradient: "bg-gradient-to-br from-[#005f69] via-[#007380] to-[#008a99]",
        primaryBg: "bg-[#005f69]",
        primaryText: "text-[#005f69]",
        lightBg: "bg-teal-50/70 dark:bg-teal-950/30",
        lightBorder: "border-teal-200/80 dark:border-teal-800/60",
        tableHeaderBg: "bg-[#005f69] text-white",
        tableSubtotalBg: "bg-[#e0f7fa] text-[#005f69] dark:bg-[#005f69]/40 dark:text-teal-300",
        grandTotalBg: "bg-[#005f69] text-white",
        badgeBg: "bg-teal-50 text-teal-800 border-teal-300",
        accentRing: "ring-[#005f69]",
        sealColor: "text-[#005f69] border-[#005f69]",
        invoiceTypeLabel: "TAX INVOICE",
      }
    : {
        name: "non-gst-light-blue",
        headerGradient: "bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
        cardHeaderGradient: "bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]",
        primaryBg: "bg-[#0ea5e9]",
        primaryText: "text-[#0284c7]",
        lightBg: "bg-sky-50/80 dark:bg-sky-950/30",
        lightBorder: "border-sky-200/90 dark:border-sky-800/60",
        tableHeaderBg: "bg-[#0284c7] text-white",
        tableSubtotalBg: "bg-[#e0f2fe] text-[#0369a1] dark:bg-sky-950/40 dark:text-sky-300",
        grandTotalBg: "bg-[#0284c7] text-white",
        badgeBg: "bg-sky-50 text-sky-800 border-sky-300",
        accentRing: "ring-[#0ea5e9]",
        sealColor: "text-[#0284c7] border-[#0284c7]",
        invoiceTypeLabel: "INVOICE",
      }

  // 3. Financial Computations
  const gstRate = isGstInvoice ? (invoice.gstRate !== undefined && invoice.gstRate > 0 ? invoice.gstRate : 18) : 0
  const setupCharge = typeof invoice.setupCharge === "number" ? invoice.setupCharge : 0
  const discount = typeof invoice.discount === "number" 
    ? invoice.discount 
    : (invoice.discountsList ? invoice.discountsList.reduce((sum, d) => sum + (d.amount || 0), 0) : 0)
  
  const parsedInvoiced = parseCurrencyNumber(invoice.totalInvoiced)

  // 1. Line items resolution (Computed FIRST so financial summary perfectly matches the items table)
  const finalRenderedRows = (invoice.items && Array.isArray(invoice.items) && invoice.items.length > 0)
    ? invoice.items.filter(Boolean).map((it, idx) => {
        const itAny = it as any
        const rawRate = itAny?.rate ?? itAny?.unitPrice ?? itAny?.itemRate ?? itAny?.price ?? 0
        const itemRate = typeof rawRate === "number" ? rawRate : parseCurrencyNumber(rawRate)
        const itemQty = (itAny?.qty && itAny.qty > 0) ? itAny.qty : 1
        const itemCharges = Array.isArray(itAny?.charges) 
          ? itAny.charges.filter(Boolean).reduce((sum: number, c: any) => sum + (typeof c?.amount === "number" ? c.amount : parseCurrencyNumber(c?.amount || 0)), 0) 
          : 0
        const rowBase = (itemRate * itemQty) + itemCharges
        const rowTax = isGstInvoice ? Math.round(rowBase * ((Number(itAny?.gstRate) || gstRate) / 100)) : 0
        const rowTotal = isGstInvoice ? (Number(itAny?.totalAmount) || (rowBase + rowTax)) : rowBase
        return {
          ...it,
          id: itAny?.id || `row_${idx}`,
          serviceName: itAny?.serviceName || itAny?.name || invoice.project || invoice.primaryCategory || invoice.category || "Technology Services",
          itemRate,
          itemQty,
          unit: itAny?.unit || "Project",
          itemCharges,
          rowBase,
          rowTax,
          rowTotal,
        }
      })
    : [
        {
          id: "row_single_service",
          serviceName: invoice.project || (invoice as any).title || "Services",
          itemRate: (invoice.baseAmount && invoice.baseAmount > 0) ? invoice.baseAmount : (parsedInvoiced > 0 ? (parsedInvoiced + discount) : 0),
          itemQty: 1,
          unit: "Project",
          itemCharges: setupCharge,
          charges: setupCharge > 0 ? [{ id: "c1", name: "Platform / Setup Fee", amount: setupCharge }] : [],
          gstRate: isGstInvoice ? gstRate : 0,
          rowBase: ((invoice.baseAmount && invoice.baseAmount > 0) ? invoice.baseAmount : (parsedInvoiced > 0 ? (parsedInvoiced + discount) : 0)) + setupCharge,
          rowTax: 0,
          rowTotal: parsedInvoiced > 0 ? parsedInvoiced : ((invoice.baseAmount && invoice.baseAmount > 0) ? invoice.baseAmount : 0),
        }
      ]

  const totalTableQty = finalRenderedRows.reduce((sum, it) => sum + it.itemQty, 0)
  const totalTableBase = finalRenderedRows.reduce((sum, it) => sum + (it.itemRate * it.itemQty) + it.itemCharges, 0)
  const totalTableGst = isGstInvoice ? finalRenderedRows.reduce((sum, it) => sum + it.rowTax, 0) : 0
  const totalTableGross = isGstInvoice ? finalRenderedRows.reduce((sum, it) => sum + it.rowTotal, 0) : totalTableBase

  // 2. Gross Services Value before discounts (Strictly matches the total table base amount)
  let grossServicesValue = totalTableBase
  if (grossServicesValue <= 0) {
    if (invoice.baseAmount !== undefined && invoice.baseAmount > 0) {
      if (discount > 0 && Math.abs(invoice.baseAmount - parsedInvoiced) < 2) {
        grossServicesValue = invoice.baseAmount + discount
      } else {
        grossServicesValue = invoice.baseAmount
      }
    } else {
      grossServicesValue = parsedInvoiced > 0 ? (parsedInvoiced + discount) : 0
    }
  }

  // 3. Taxable Base Amount & Grand Total
  const taxableBase = Math.max(0, grossServicesValue + setupCharge - discount)

  const gstAmt = isGstInvoice && taxableBase > 0
    ? (invoice.gstAmount !== undefined && invoice.gstAmount > 0 ? invoice.gstAmount : (totalTableGst > 0 ? totalTableGst : Math.round(taxableBase * (gstRate / 100))))
    : 0

  const cgstAmt = Math.round(gstAmt / 2)
  const sgstAmt = gstAmt - cgstAmt
  const calculatedTotal = isGstInvoice ? (taxableBase + gstAmt) : taxableBase
  const totalVal = parsedInvoiced > 0 ? parsedInvoiced : Math.max(calculatedTotal, typeof (invoice as any).total === "number" ? (invoice as any).total : 0)

  const rawReceived = parseCurrencyNumber(invoice.paymentReceived)
  const parsedReceived = Math.min(rawReceived, totalVal)
  const parsedDue = invoice.due !== undefined 
    ? Math.min(parseCurrencyNumber(invoice.due), Math.max(0, totalVal - parsedReceived))
    : Math.max(0, totalVal - parsedReceived)

  const isFullyPaid = invoice.status === "Fully paid" || invoice.status === "Credited" || (parsedDue === 0 && parsedReceived > 0)
  const isPartPaid = invoice.status === "Partially paid" || (parsedReceived > 0 && parsedDue > 0)

  const statusBadgeText = isFullyPaid 
    ? "PAID IN FULL" 
    : isPartPaid 
    ? "PART PAID" 
    : "NOT PAID"

  // Resolve QR Code URL: 100% scanable high-res square modules with margin (Cascading from Sub-Branch -> Branch -> Parent Company)
  const companyGstQr = (isCustomCompany ? (companyDetails?.gst_payment_qr_url ?? (companyDetails as any)?.payment_qr_url ?? "") : (activeCompany?.gst_payment_qr_url || (activeCompany as any)?.payment_qr_url || ""))?.trim()
  const companyNonGstQr = (isCustomCompany ? (companyDetails?.nongst_payment_qr_url ?? "") : (activeCompany?.nongst_payment_qr_url || ""))?.trim()
  const companyQr = isGstInvoice ? (companyGstQr || companyNonGstQr) : companyNonGstQr

  // Helper to test if a value is an uploaded/custom image QR URL
  const isImageQrUrl = (url?: string | null): boolean => {
    if (!url || typeof url !== "string") return false
    const s = url.trim()
    return s !== "" && s !== "none" && (s.startsWith("http") || s.startsWith("data:") || s.startsWith("/"))
  }

  // QR Code Resolution: Strictly respects uploaded QR images; if cleared or deleted, NO QR is rendered
  let customPaymentQrUrl: string | null = null
  if (overrideBankDetails?.paymentQrUrl !== undefined) {
    customPaymentQrUrl = isImageQrUrl(overrideBankDetails.paymentQrUrl) ? overrideBankDetails.paymentQrUrl : null
  } else if (isSubBranchIssued) {
    const sbQr = isGstInvoice
      ? (activeSubBranch?.gst_payment_qr_url || activeSubBranch?.payment_qr_url)
      : activeSubBranch?.nongst_payment_qr_url
    const branchQr = isGstInvoice
      ? (activeBranch?.gst_payment_qr_url || activeBranch?.payment_qr_url)
      : activeBranch?.nongst_payment_qr_url
    if (isImageQrUrl(sbQr)) customPaymentQrUrl = sbQr!
    else if (isImageQrUrl(branchQr)) customPaymentQrUrl = branchQr!
    else if (isGstInvoice && isImageQrUrl(companyQr)) customPaymentQrUrl = companyQr
    else if (!isGstInvoice && isImageQrUrl(companyNonGstQr)) customPaymentQrUrl = companyNonGstQr
    else customPaymentQrUrl = null
  } else if (isBranchIssued) {
    const branchQr = isGstInvoice
      ? (activeBranch?.gst_payment_qr_url || activeBranch?.payment_qr_url)
      : activeBranch?.nongst_payment_qr_url
    if (isImageQrUrl(branchQr)) customPaymentQrUrl = branchQr!
    else if (isGstInvoice && isImageQrUrl(companyQr)) customPaymentQrUrl = companyQr
    else if (!isGstInvoice && isImageQrUrl(companyNonGstQr)) customPaymentQrUrl = companyNonGstQr
    else customPaymentQrUrl = null
  } else {
    const compQr = isGstInvoice ? companyQr : companyNonGstQr
    if (isImageQrUrl(compQr)) customPaymentQrUrl = compQr
    else customPaymentQrUrl = null
  }

  // Guard: If Non-GST, ensure payment QR URL is not accidentally the GST QR
  if (!isGstInvoice && customPaymentQrUrl && companyGstQr && customPaymentQrUrl.trim() === companyGstQr.trim()) {
    customPaymentQrUrl = null
  }

  // Generate Official Public Verification / View Online PDF QR Code against Invoice Number (Crisp 300x300 M-level ECC QR)
  const invoiceNumOrId = (invoice as any).invoiceNumber || (invoice as any).invoice_number || invoice.id || "INV"
  const originUrl = typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://saampark.com"
  const publicInvoiceViewUrl = `${originUrl}/public/invoice?id=${encodeURIComponent(String(invoice.id || invoiceNumOrId))}`
  const invoiceVerificationQrUrl = React.useMemo(() => {
    return getQrCodeDataUri(publicInvoiceViewUrl, 160) || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&ecc=M&data=${encodeURIComponent(publicInvoiceViewUrl)}`
  }, [publicInvoiceViewUrl])

  // Bottom Footer Text resolution (Customizable via Company Settings or Invoice Studio)
  const fallbackContactText = [
    resolvedEmail ? `Email: ${resolvedEmail}` : null,
    resolvedPhone ? `Tel: ${resolvedPhone}` : null,
    resolvedWebsite ? `Web: ${resolvedWebsite}` : null,
  ].filter(Boolean).join("  •  ") || fullRegisteredCompanyName

  const customFooterText = 
    (invoice as any)?.bottom_footer_text ||
    (companyDetails as any)?.bottom_footer_text ||
    (activeCompany as any)?.bottom_footer_text ||
    (companyDetails as any)?.footer_text ||
    (activeCompany as any)?.footer_text ||
    ""

  const resolvedBottomFooterText = customFooterText.trim()
    ? customFooterText.trim()
    : (fallbackContactText ? `OFFICIAL CONTACT & SUPPORT: ${fallbackContactText}` : fullRegisteredCompanyName)

  // 4. Strict A4 Pagination Engine (2 items per page: 2 products fit on 1 A4 page; 3rd creates page 2 with same invoice format)
  const ITEMS_PER_FIRST_PAGE = 2
  const ITEMS_PER_SUBSEQUENT_PAGE = 2

  const paginatedPages: any = React.useMemo(() => computeOfficialInvoiceDocumentMemo52({ finalRenderedRows, ITEMS_PER_FIRST_PAGE, ITEMS_PER_SUBSEQUENT_PAGE }), [finalRenderedRows]);

  const totalPages = paginatedPages.length

  const hasDue = parsedDue > 0
  const hasBankName = isValidField(resolvedBankName)
  const hasAccountNum = isValidField(resolvedAccountNumber)
  const hasIfsc = isValidField(resolvedIfscCode)
  const hasAccountHolder = isValidField(resolvedAccountHolder) && Boolean(hasAccountNum || hasBankName || hasIfsc)
  const hasBankBranch = isValidField(resolvedBankBranch) && Boolean(hasAccountNum || hasBankName || hasIfsc)
  const hasUpiId = isValidField(resolvedUpiId)
  const hasQr = Boolean(customPaymentQrUrl && customPaymentQrUrl.trim() && customPaymentQrUrl !== "none" && !customPaymentQrUrl.includes("undefined") && !customPaymentQrUrl.includes("null"))

  const hasAnyBankInfo = Boolean(hasAccountNum || hasBankName || hasIfsc)
  const hasUpiDetails = Boolean(hasUpiId)
  const hasAnyPaymentInfo = Boolean(hasAnyBankInfo || hasUpiDetails || hasQr)
  const hasBankDetails = hasAnyBankInfo

  const hasContactInfo = Boolean(isValidField(resolvedPhone) || isValidField(resolvedWebsite) || isValidField(resolvedEmail))
  const hasCin = isValidField(resolvedCin)
  const hasGstin = isGstInvoice && isValidField(resolvedGstin)
  const hasPan = isValidField(resolvedPan)
  const hasMsme = isValidField(resolvedMsme)
  const hasLegalIds = Boolean(hasCin || hasGstin || hasPan || hasMsme)



  const renderTopHeader: any = createOfficialInvoiceDocumentHandler1(() => __ctrlRef.current);

  const renderCompactSubsequentHeader = (pageNumber: number, totalPgs: number) => (
    <div className="flex justify-between items-center border-b border-zinc-200 pb-2 mb-2">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-black tracking-tight text-zinc-900 uppercase">
          {fullRegisteredCompanyName}
        </h2>
        <span className="text-[9.5px] text-zinc-500 font-mono">| Invoice: <strong>{invoiceNumOrId}</strong></span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2.5 py-0.5 rounded-md ${theme.primaryBg} text-white font-mono font-bold text-[9px] uppercase tracking-wider`}>
          Page {pageNumber} of {totalPgs}
        </span>
      </div>
    </div>
  )

  const renderEntityHierarchyStrip: any = createOfficialInvoiceDocumentHandler2(() => __ctrlRef.current);

  const renderInfoCards: any = createOfficialInvoiceDocumentHandler3(() => __ctrlRef.current);

  const renderTable: any = createOfficialInvoiceDocumentHandler4(() => __ctrlRef.current);

  const renderFinancialsAndFooter: any = createOfficialInvoiceDocumentAction20(() => __ctrlRef.current);

  const renderPageFooterOnly = (pageNumber: number, totalPgs: number) => (
    <div className="mt-auto shrink-0 pt-2 border-t border-zinc-200 space-y-1.5">
      <div className="flex justify-between items-center bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200 text-[8px] text-zinc-600">
        <span>Continued to Next Page...</span>
        <span className="font-mono font-bold text-zinc-800">Page {pageNumber} of {totalPgs}</span>
      </div>
      <div className={`rounded-lg ${theme.headerGradient} text-white px-2.5 py-1 text-[7.5px] sm:text-[8px] font-medium flex items-center justify-between gap-2 shadow-xs`}>
        <div className="flex-1 min-w-0 pr-2 text-white whitespace-pre-wrap break-words leading-tight">
          {resolvedBottomFooterText}
        </div>
        <div className="flex items-center gap-2 shrink-0 self-center">
          <span className="font-mono font-bold bg-black/20 px-1.5 py-0.2 rounded text-[7.5px] shrink-0">
            Page {pageNumber} of {totalPgs}
          </span>
        </div>
      </div>
    </div>
  )

  
  __ctrl = { invoice, clientDetails, companyDetails, paySettings, interactive, allowTextEdit, propLogoPosition, onLogoPositionChange, propLogoScale, onLogoScaleChange, propStampPosition, onStampPositionChange, propStampScale, onStampScaleChange, propSignaturePosition, onSignaturePositionChange, propSignatureScale, onSignatureScaleChange, propCustomStamps, onCustomStampMove, onCustomStampUpdate, onRemoveCustomStamp, onAddCustomStamp, onFieldChange, overrideLogoUrl, overrideSignatureUrl, overrideStampUrl, overrideBankDetails, propActiveBranch, propActiveSubBranch, isTextEditable, companies, branches, subBranches, activeCompanyId, activeBranchId, fetchCompanies, fetchBranches, fetchSubBranches, activeCompany, activeBranch, activeSubBranch, resolvedParentBranch, isSubBranchIssued, isBranchIssued, activeEntity, entitySigPos, entityStampPos, entityLogoPos, entityLogoScale, entityStampScale, entitySigScale, entityCustomStamps, logoPosition, logoScale, stampPosition, stampScale, signaturePosition, signatureScale, customStamps, resolvedBrandName, resolvedDivisionName, resolvedSubtitle, rawTm, resolvedTrademarkSymbol, resolvedLogoUrl, resolvedCin, resolvedGstin, resolvedPan, resolvedMsme, resolvedAddress, resolvedCity, resolvedState, resolvedZip, resolvedCountry, resolvedPhone, resolvedEmail, resolvedWebsite, fullAddressSegments, resolvedFullOfficeAddress, invIdStr, isExplicitNonGst, hasItemGst, isGstInvoice, fullRegisteredCompanyName, headerBrandName, headerSecondaryLine, isValidField, isCustomCompany, companyGstUpi, companyNonGstUpi, companyUpi, companyGstHolder, companyNonGstHolder, companyHolder, companyGstBank, companyNonGstBank, companyBank, companyGstAccNum, companyNonGstAccNum, companyAccNum, companyGstIfsc, companyNonGstIfsc, companyIfsc, companyGstBranch, companyNonGstBranch, companyBranch, resolvedUpiId, resolvedAccountHolder, resolvedBankName, resolvedAccountNumber, resolvedIfscCode, resolvedBankBranch, companySignatureFallback, companyStampFallback, resolvedSignatureUrl, resolvedStampUrl, resolvedSignatoryName, resolvedSignatoryDesignation, resolvedIsoCertification, resolvedTermsAndNotes, theme, gstRate, setupCharge, discount, parsedInvoiced, finalRenderedRows, totalTableQty, totalTableBase, totalTableGst, totalTableGross, grossServicesValue, taxableBase, gstAmt, cgstAmt, sgstAmt, calculatedTotal, totalVal, rawReceived, parsedReceived, parsedDue, isFullyPaid, isPartPaid, statusBadgeText, companyGstQr, companyNonGstQr, companyQr, isImageQrUrl, customPaymentQrUrl, invoiceNumOrId, originUrl, publicInvoiceViewUrl, invoiceVerificationQrUrl, fallbackContactText, customFooterText, resolvedBottomFooterText, ITEMS_PER_FIRST_PAGE, ITEMS_PER_SUBSEQUENT_PAGE, paginatedPages, totalPages, hasDue, hasBankName, hasAccountNum, hasIfsc, hasAccountHolder, hasBankBranch, hasUpiId, hasQr, hasAnyBankInfo, hasUpiDetails, hasAnyPaymentInfo, hasBankDetails, hasContactInfo, hasCin, hasGstin, hasPan, hasMsme, hasLegalIds, renderTopHeader, renderCompactSubsequentHeader, renderEntityHierarchyStrip, renderInfoCards, renderTable, renderFinancialsAndFooter, renderPageFooterOnly };
  __ctrlRef.current = __ctrl;
return (
    <div id="printable-invoice" className="w-full flex flex-col items-center gap-6 py-2 print:p-0 print:gap-0 print:m-0">
      <OfficialInvoiceDocumentSection1 ctrl={__ctrl} />
    </div>
  )
}
