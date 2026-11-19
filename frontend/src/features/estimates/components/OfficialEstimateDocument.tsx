"use client"

import * as React from "react"
import { 
  Printer, Download, Check, X, ArrowRight, Building2, MapPin, 
  Phone, Mail, Globe, Shield, Calendar, Calculator, CheckCircle2,
  Clock, AlertCircle, FileText, QrCode, Landmark, Stamp, FileCheck, Sparkles, Megaphone
} from "lucide-react"
import { EstimateItem } from "../services/estimateService"
import { useAuthStore, Company, Branch, DEFAULT_COMPANIES, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getQrCodeDataUri } from "@/lib/qrCode"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { printDocument } from "@/lib/printUtils"
import { OfficialEstimateDocumentSection1 } from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentSection1"
import { OfficialEstimateDocumentSection2 } from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentSection2"
import { OfficialEstimateDocumentSection3 } from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentSection3"


import { type OfficialEstimateDocumentProps, formatEstimateDate, numberToIndianWords } from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentHelpers"
export * from "@/features/estimates/components/officialestimatedocument-sections/OfficialEstimateDocumentHelpers"

export function OfficialEstimateDocument({
  estimate,
  onClose,
  onAccept,
  onDecline,
  onConvert,
  onConvertToClient,
  isClientRole = false,
}: OfficialEstimateDocumentProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

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

  const [isForm9Open, setIsForm9Open] = React.useState(false)

  // Resolve Company
  const activeCompany = React.useMemo(() => {
    const targetCompId = String(estimate.companyId || (estimate as any).company || activeCompanyId || "tech").toLowerCase().trim()
    const targetCompName = String((estimate as any).companyName || "").toLowerCase().trim()

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
  }, [estimate.companyId, (estimate as any).company, (estimate as any).companyName, activeCompanyId, companies])

  // Resolve Issuing Branch
  const activeBranch: Branch | null = React.useMemo(() => {
    const targetBranchId = String(estimate.branchId || (estimate as any).branch_id || "").toLowerCase().trim()
    const targetBranchName = String(estimate.branchName || (estimate as any).branch_name || "").toLowerCase().trim()

    if (!targetBranchId && !targetBranchName) return null

    const matched = (branches || []).find(b => {
      const bId = String(b.id || "").toLowerCase().trim()
      const bName = String(b.name || "").toLowerCase().trim()
      const bCode = String(b.code || "").toLowerCase().trim()
      return (targetBranchId && (bId === targetBranchId || bCode === targetBranchId)) ||
             (targetBranchName && (bName === targetBranchName || bCode === targetBranchName))
    })

    return matched || null
  }, [estimate.branchId, estimate.branchName, (estimate as any).branch_id, (estimate as any).branch_name, branches])

  // Resolve Issuing Sub-Branch (Partner)
  const activeSubBranch = React.useMemo(() => {
    const targetSbId = String((estimate as any).subBranchId || (estimate as any).sub_branch_id || "").toLowerCase().trim()
    const targetSbName = String((estimate as any).subBranchName || (estimate as any).sub_branch_name || "").toLowerCase().trim()

    if (!targetSbId && !targetSbName) return null

    return (subBranches || []).find(sb => {
      const sbId = String(sb.id || "").toLowerCase().trim()
      const sbName = String(sb.name || "").toLowerCase().trim()
      const sbCode = String(sb.code || "").toLowerCase().trim()
      return (targetSbId && (sbId === targetSbId || sbCode === targetSbId)) ||
             (targetSbName && (sbName === targetSbName || sbCode === targetSbName))
    }) || null
  }, [(estimate as any).subBranchId, (estimate as any).sub_branch_id, (estimate as any).subBranchName, (estimate as any).sub_branch_name, subBranches])

  const isSubBranchIssued = Boolean(activeSubBranch)
  const isBranchIssued = Boolean(activeBranch) && !isSubBranchIssued

  // Parent Company Corporate Details (Stay as is forever; branches/sub-branches appear in their own section)
  const isConsultancy = activeCompany?.id === 'digital' || activeCompany?.id === 'consultancy' || (estimate as any)?.company === 'consultancy' || estimate?.companyId === 'consultancy'

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

  // Bank details (Strictly real values or blank)
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
    (estimate as any).isNonGst || 
    (estimate as any).taxType === "nongst" || 
    (estimate.gstRate === 0 && (estimate.gstAmount === 0 || !estimate.gstAmount))
  )
  const subtotal = estimate.subtotal || 0
  const gstRate = isNonGst ? 0 : (estimate.gstRate !== undefined ? estimate.gstRate : 18)
  const gstAmount = isNonGst ? 0 : (estimate.gstAmount !== undefined ? estimate.gstAmount : Math.round(subtotal * (gstRate / 100)))
  const grandTotal = estimate.totalAmount || (subtotal + gstAmount)
  const cgst = Math.round(gstAmount / 2)
  const sgst = gstAmount - cgst

  // Scannable UPI QR
  const upiPayload = resolvedUpiId ? `upi://pay?pa=${resolvedUpiId}&pn=${encodeURIComponent(resolvedAccountHolder)}&am=${grandTotal}&cu=INR` : ""
  const resolvedPaymentQrUrl = activeSubBranch?.payment_qr_url || activeBranch?.payment_qr_url || activeCompany?.payment_qr_url || (
    upiPayload ? (getQrCodeDataUri(upiPayload, 300) || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&ecc=M&data=${encodeURIComponent(upiPayload)}`) : null
  )

  // Document Verification QR Code
  const docVerifyData = `SAAMPARK-ESTIMATE:${estimate.estimateNumber}|CLIENT:${estimate.client}|AMOUNT:INR${grandTotal}|DATE:${estimate.date}`
  const documentQrUrl = getQrCodeDataUri(docVerifyData, 300) || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=1&ecc=M&data=${encodeURIComponent(docVerifyData)}`

  const handlePrint = () => {
    printDocument("printable-estimate", `Estimate_${estimate.estimateNumber}`)
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

  const hasLegalIds = Boolean(resolvedCin || resolvedGstin || resolvedPan || resolvedMsme)
  const hasContactInfo = Boolean(resolvedPhone || resolvedWebsite || resolvedEmail)

  
  __ctrl = { estimate, onClose, onAccept, onDecline, onConvert, onConvertToClient, isClientRole, companies, branches, subBranches, activeCompanyId, fetchCompanies, fetchBranches, fetchSubBranches, isForm9Open, setIsForm9Open, activeCompany, activeBranch, activeSubBranch, isSubBranchIssued, isBranchIssued, isConsultancy, resolvedBrandName, resolvedDivisionName, resolvedSubtitle, resolvedTrademarkSymbol, resolvedLogoUrl, resolvedAddress, resolvedPhone, resolvedEmail, resolvedWebsite, resolvedCin, resolvedGstin, resolvedPan, resolvedMsme, resolvedBankName, resolvedAccountHolder, resolvedAccountNumber, resolvedIfscCode, resolvedBankBranch, resolvedUpiId, resolvedSignatoryName, resolvedSignatoryDesignation, resolvedSignatureUrl, resolvedStampUrl, isNonGst, subtotal, gstRate, gstAmount, grandTotal, cgst, sgst, upiPayload, resolvedPaymentQrUrl, docVerifyData, documentQrUrl, handlePrint, theme, hasLegalIds, hasContactInfo };
  __ctrlRef.current = __ctrl;
return (
    <div className="official-estimate-modal-root relative flex flex-col w-full max-w-4xl mx-auto my-2 sm:my-4 bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 print:border-none print:shadow-none print:my-0 print:max-w-none print:w-full">
      <OfficialEstimateDocumentSection3 ctrl={__ctrl} />
      <div className="w-full flex flex-col items-center gap-6 py-2 print:p-0 print:gap-0 print:m-0 overflow-x-auto">
        <div id="printable-estimate" className="a4-page bg-white text-zinc-900 font-sans p-5 sm:p-6 text-xs shadow-2xl border border-zinc-200/90 rounded-lg w-full max-w-[794px] min-h-[1080px] mx-auto relative flex flex-col justify-between gap-3 sm:gap-3.5 overflow-visible print:w-[210mm] print:max-w-[210mm] print:h-auto print:min-h-[282mm] print:max-h-none print:overflow-visible print:p-[6mm_8mm] print:gap-2 print:m-0 print:shadow-none print:border-none print:rounded-none">
        
        <OfficialEstimateDocumentSection1 ctrl={__ctrl} />

        <OfficialEstimateDocumentSection2 ctrl={__ctrl} />

        {/* 5. Scope of Deliverables & Commercial Notes */}
        {(estimate.notes || activeCompany?.quotation_notes || activeCompany?.terms_conditions) && (
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-1 text-[11px] text-zinc-600">
            <span className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider block">
              Deliverables Scope &amp; Commercial Terms:
            </span>
            <p className="whitespace-pre-line leading-relaxed">{estimate.notes || activeCompany?.quotation_notes || activeCompany?.terms_conditions}</p>
          </div>
        )}

        {/* 6. Official Dual Signatures & Acceptance Box */}
        <div className="pt-4 border-t-2 border-zinc-300 grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
          {/* Customer Acceptance Sign */}
          <div className="p-4 border border-dashed border-zinc-300 rounded-xl space-y-4 bg-zinc-50/40">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              <span>Client Acceptance &amp; Purchase Order</span>
              <span>
                {estimate.acceptedAt 
                  ? `Accepted: ${formatEstimateDate(estimate.acceptedAt)}` 
                  : "Date: ____________"}
              </span>
            </div>
            {estimate.status === "Accepted" || (estimate as any).clientAccepted ? (
              <div className="py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-center font-sans shadow-2xs">
                <div className="text-[10px] font-bold uppercase text-emerald-700 flex items-center justify-center gap-1">
                  <span>Digitally Accepted &amp; Confirmed</span>
                </div>
                <div className="text-[9px] text-zinc-600 font-mono mt-0.5">
                  Confirmed by: {(estimate as any).acceptedBy || estimate.client || "Client"}
                </div>
              </div>
            ) : (
              <div className="h-6" />
            )}
            <div className="pt-2 border-t border-zinc-300 text-center">
              <p className="font-bold text-zinc-900">{estimate.client}</p>
              <p className="text-[10px] text-zinc-400">
                {estimate.status === "Accepted" || (estimate as any).clientAccepted ? "Verified Online Acceptance" : "Authorized Signature & Company Seal"}
              </p>
            </div>
          </div>

          {/* Issuer Signature & Official Stamp */}
          <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50/60 flex flex-col items-center justify-center text-center relative">
            <div className="w-full text-left text-[10px] font-bold uppercase tracking-wider text-teal-900 mb-2">
              For {resolvedBrandName} {resolvedDivisionName}
            </div>

            <div className="flex items-center justify-center gap-6 my-2 min-h-[60px]">
              {resolvedSignatureUrl ? (
                <img src={resolvedSignatureUrl} alt="Signature" className="h-14 object-contain" />
              ) : (
                <div className="h-12 flex items-center justify-center font-sans font-semibold text-zinc-400">
                  [Digitally Authorized]
                </div>
              )}

              {resolvedStampUrl && (
                <img src={resolvedStampUrl} alt="Stamp" className="h-16 w-16 object-contain opacity-90" />
              )}
            </div>

            <div className="w-full pt-2 border-t border-zinc-300">
              <p className="font-bold text-zinc-950">{resolvedSignatoryName}</p>
              <p className="text-[10px] font-medium text-zinc-500">{resolvedSignatoryDesignation}</p>
              <p className="text-[9px] text-zinc-400 mt-0.5">This estimate constitutes a binding commercial quote upon formal client confirmation.</p>
            </div>
          </div>
        </div>

        {/* Dedicated Bottom Declarations & Terms Section */}
        <div className="w-full rounded-md border border-zinc-200/90 bg-zinc-50/70 p-2 text-[8px] sm:text-[8.5px] text-zinc-600 leading-tight space-y-1">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-1">
            <span className="font-bold uppercase tracking-wider text-zinc-700 text-[8px] flex items-center gap-1">
              <span>Statutory Declaration &amp; Legal Terms:</span>
            </span>
            <span className="text-[7.5px] text-zinc-500 font-medium">
              Subject to Kolkata Jurisdiction • Formal Corporate Commercial Estimate
            </span>
          </div>
          <p className="text-zinc-600 italic leading-relaxed">
            {(estimate as any).bottomNote || (estimate as any).bottomDetails || "We declare that this commercial estimate reflects the agreed technical scope and deliverables. All services and project deliverables are subject to standard enterprise terms and local jurisdiction."}
          </p>
        </div>

        {/* 7. Footer Jurisdiction Notice */}
        <div className="text-center text-[10px] text-zinc-400 pt-2 border-t border-zinc-200">
          Corporate Office: {resolvedAddress} • Registered under the Companies Act • All disputes subject to local jurisdiction only.
        </div>
      </div>
      {isForm9Open && estimate.marketingPackage && (
        <OfficialFormNo9Document
          pkg={estimate.marketingPackage}
          clientInfo={{
            name: estimate.client,
            businessName: estimate.client,
            phone: (estimate as any).clientPhone,
          }}
          onClose={() => setIsForm9Open(false)}
        />
      )}
    </div>
    </div>
  )
}
