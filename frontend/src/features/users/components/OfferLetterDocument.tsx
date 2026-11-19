"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Building2, MapPin, Calendar, Mail, Phone, ShieldCheck, 
  Award, FileText, Download, Printer, Send, Sparkles, Check, 
  UserCheck, Briefcase, DollarSign, Clock, Shield, Globe, Plus, Trash2,
  Layers, ChevronRight, User, AlertCircle
} from "lucide-react"
import { UserItem } from "../types"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { printDocument } from "@/lib/printUtils"
import { OfferLetterDocumentSection1 } from "@/features/users/components/offerletterdocument-sections/OfferLetterDocumentSection1"
import { OfferLetterDocumentSection2 } from "@/features/users/components/offerletterdocument-sections/OfferLetterDocumentSection2"


import { DEFAULT_ROLE_RESPONSIBILITIES, getPresetResponsibilities, EditableOfferText, type OfferLetterDocumentProps } from "@/features/users/components/offerletterdocument-sections/OfferLetterDocumentHelpers"
export * from "@/features/users/components/offerletterdocument-sections/OfferLetterDocumentHelpers"

export function OfferLetterDocument({
  user,
  company,
  branch,
  subBranch,
  interactive = true,
  joiningDate: controlledJoiningDate,
  onJoiningDateChange,
  designation: controlledDesignation,
  onDesignationChange,
  ctc: controlledCtc,
  onCtcChange,
  monthlySalary: controlledMonthlySalary,
  onMonthlySalaryChange,
  department: controlledDepartment,
  onDepartmentChange,
  reportingManager: controlledReportingManager,
  onReportingManagerChange,
  probationPeriod: controlledProbationPeriod,
  onProbationPeriodChange,
  workingHours: controlledWorkingHours,
  onWorkingHoursChange,
  workMode: controlledWorkMode,
  onWorkModeChange,
  responsibilities: controlledResponsibilities,
  onResponsibilitiesChange,
  terms: controlledTerms,
  onTermsChange,
  onSendEmail,
  isSendingEmail = false,
  onFieldChange,
}: OfferLetterDocumentProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  // Local Editable States
  const [localJoiningDate, setLocalJoiningDate] = React.useState(controlledJoiningDate || user.joinedDate || "2026-10-01")
  const [localDesignation, setLocalDesignation] = React.useState(controlledDesignation || user.designation || user.role || "Senior Executive")
  const [localCtc, setLocalCtc] = React.useState(controlledCtc || (user as any).ctc || "₹4,80,000 per Annum (INR 4.8 LPA)")
  const [localMonthlySalary, setLocalMonthlySalary] = React.useState(controlledMonthlySalary || "₹40,000 / Month (Gross)")
  const [localDepartment, setLocalDepartment] = React.useState(controlledDepartment || user.department || "Operations & Technology")
  const [localReportingManager, setLocalReportingManager] = React.useState(controlledReportingManager || "Department Head / Branch Director")
  const [localProbationPeriod, setLocalProbationPeriod] = React.useState(controlledProbationPeriod || "3 Months from Date of Joining")
  const [localWorkingHours, setLocalWorkingHours] = React.useState(controlledWorkingHours || "Monday – Saturday (9:30 AM to 6:30 PM)")
  const [localWorkMode, setLocalWorkMode] = React.useState(controlledWorkMode || "Full-time On-site")
  const [localResponsibilities, setLocalResponsibilities] = React.useState<string[]>(
    controlledResponsibilities || getPresetResponsibilities(controlledDesignation || user.designation || user.role)
  )
  const [localTerms, setLocalTerms] = React.useState<string[]>(
    controlledTerms || [
      "Confidentiality & Non-Disclosure: You agree to maintain strict confidentiality regarding all proprietary systems, client records, and commercial data of Saampark Group.",
      "Intellectual Property: All inventions, code, designs, documentation, and materials produced during your tenure shall remain the sole exclusive property of the company.",
      "Notice Period: Post confirmation of probation, either party may terminate this employment with thirty (30) days written notice or gross salary in lieu thereof.",
      "Code of Conduct & Compliance: Compliance with workplace policies, security protocols, and operational guidelines is a mandatory condition of employment."
    ]
  )

  // Synchronize when controlled props change
  React.useEffect(() => {
    if (controlledJoiningDate) setLocalJoiningDate(controlledJoiningDate)
  }, [controlledJoiningDate])

  React.useEffect(() => {
    if (controlledDesignation) {
      setLocalDesignation(controlledDesignation)
      if (!controlledResponsibilities) {
        setLocalResponsibilities(getPresetResponsibilities(controlledDesignation))
      }
    }
  }, [controlledDesignation])

  React.useEffect(() => {
    if (controlledCtc) setLocalCtc(controlledCtc)
  }, [controlledCtc])

  React.useEffect(() => {
    if (controlledMonthlySalary) setLocalMonthlySalary(controlledMonthlySalary)
  }, [controlledMonthlySalary])

  React.useEffect(() => {
    if (controlledDepartment) setLocalDepartment(controlledDepartment)
  }, [controlledDepartment])

  React.useEffect(() => {
    if (controlledResponsibilities) setLocalResponsibilities(controlledResponsibilities)
  }, [controlledResponsibilities])

  const empId = user.employeeId || `SP-EMP-${String(user.id).replace(/[^0-9]/g, "").slice(-4).padStart(4, "0") || "1024"}`
  const fullCompanyName = company?.name || user.companyName || "SAAMPARK TECHNOLOGY PRIVATE LIMITED"
  const brandName = company?.brand_name || "SAAMPARK"
  const logoUrl = company?.logo_url || "/logo.png"
  const cin = company?.cin || "U72900WB2021PTC248901"
  const gstin = company?.gstin || "19ABCS1649D1ZY"
  const pan = company?.pan || "ABCS1649D"
  const companyAddress = company?.address || "Corporate Campus, Kolkata, West Bengal, India"
  const companyPhone = company?.phone || "+91 90915 18567"
  const companyEmail = company?.email || "careers@saampark.com"
  const companyWebsite = company?.website || "www.saampark.com"
  const isoCert = company?.iso_certification || "An ISO 9001:2015 Certified Company"

  const branchName = branch?.name || user.branchName || "Regional Operations Hub"
  const branchCity = branch?.city || branch?.state || "Kolkata"
  const subBranchName = subBranch?.name || user.subBranchName || (user as any).sub_branch_name

  const signatureUrl = company?.signature_image_url || branch?.signature_image_url
  const stampUrl = company?.stamp_image_url || branch?.stamp_image_url
  const signatoryName = company?.signatory_name || "Authorized Signatory"
  const signatoryDesignation = company?.signatory_designation || "Director & Head of Human Resources"

  const refNumber = `SP/HR/OL/${new Date().getFullYear()}/${empId}`
  const issueDateFormatted = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })

  // Handlers for dynamic Responsibilities
  const handleAddResponsibility = () => {
    const updated = [...localResponsibilities, "New assigned responsibility and project deliverable."]
    setLocalResponsibilities(updated)
    onResponsibilitiesChange?.(updated)
  }

  const handleUpdateResponsibility = (idx: number, text: string) => {
    const updated = [...localResponsibilities]
    updated[idx] = text
    setLocalResponsibilities(updated)
    onResponsibilitiesChange?.(updated)
  }

  const handleRemoveResponsibility = (idx: number) => {
    const updated = localResponsibilities.filter((_, i) => i !== idx)
    setLocalResponsibilities(updated)
    onResponsibilitiesChange?.(updated)
  }

  // Handlers for dynamic Terms
  const handleAddTerm = () => {
    const updated = [...localTerms, "Additional organizational clause or special incentive agreement."]
    setLocalTerms(updated)
    onTermsChange?.(updated)
  }

  const handleUpdateTerm = (idx: number, text: string) => {
    const updated = [...localTerms]
    updated[idx] = text
    setLocalTerms(updated)
    onTermsChange?.(updated)
  }

  const handleRemoveTerm = (idx: number) => {
    const updated = localTerms.filter((_, i) => i !== idx)
    setLocalTerms(updated)
    onTermsChange?.(updated)
  }

  const handleResetResponsibilitiesToPreset = () => {
    const preset = getPresetResponsibilities(localDesignation)
    setLocalResponsibilities(preset)
    onResponsibilitiesChange?.(preset)
  }

  
  __ctrl = { user, company, branch, subBranch, interactive, controlledJoiningDate, onJoiningDateChange, controlledDesignation, onDesignationChange, controlledCtc, onCtcChange, controlledMonthlySalary, onMonthlySalaryChange, controlledDepartment, onDepartmentChange, controlledReportingManager, onReportingManagerChange, controlledProbationPeriod, onProbationPeriodChange, controlledWorkingHours, onWorkingHoursChange, controlledWorkMode, onWorkModeChange, controlledResponsibilities, onResponsibilitiesChange, controlledTerms, onTermsChange, onSendEmail, isSendingEmail, onFieldChange, localJoiningDate, setLocalJoiningDate, localDesignation, setLocalDesignation, localCtc, setLocalCtc, localMonthlySalary, setLocalMonthlySalary, localDepartment, setLocalDepartment, localReportingManager, setLocalReportingManager, localProbationPeriod, setLocalProbationPeriod, localWorkingHours, setLocalWorkingHours, localWorkMode, setLocalWorkMode, localResponsibilities, setLocalResponsibilities, localTerms, setLocalTerms, empId, fullCompanyName, brandName, logoUrl, cin, gstin, pan, companyAddress, companyPhone, companyEmail, companyWebsite, isoCert, branchName, branchCity, subBranchName, signatureUrl, stampUrl, signatoryName, signatoryDesignation, refNumber, issueDateFormatted, handleAddResponsibility, handleUpdateResponsibility, handleRemoveResponsibility, handleAddTerm, handleUpdateTerm, handleRemoveTerm, handleResetResponsibilitiesToPreset };
  __ctrlRef.current = __ctrl;
return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Top Action Bar (Hides in Print) */}
      <div className="print:hidden w-full flex flex-wrap items-center justify-between gap-3 bg-surface border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <FileText size={16} className="text-primary" />
          <span>Interactive Offer Letter Studio</span>
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200">
            Click any text on the letter to edit live
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetResponsibilitiesToPreset}
            className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border text-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Auto-fill responsibilities based on designation"
          >
            <Sparkles size={12} className="text-amber-500" />
            <span>Load Role Presets</span>
          </button>

          {onSendEmail && (
            <button
              type="button"
              onClick={onSendEmail}
              disabled={isSendingEmail}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send size={13} className={isSendingEmail ? "animate-spin" : ""} />
              <span>{isSendingEmail ? "Dispatching..." : "Send Offer in Email"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => printDocument("printable-offer-letter", `Offer_Letter_${user?.name || "Official"}`)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer size={13} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Letterhead Document Container */}
      <div 
        id="printable-offer-letter"
        className="a4-page bg-white text-zinc-900 font-sans p-7 sm:p-9 shadow-2xl border border-zinc-200/90 rounded-2xl w-full max-w-[800px] min-h-[1120px] mx-auto relative flex flex-col justify-between gap-4 select-text print:w-[210mm] print:max-w-[210mm] print:p-[10mm_12mm] print:shadow-none print:border-none print:rounded-none page-break-after"
      >
        <OfferLetterDocumentSection1 ctrl={__ctrl} />
        <OfferLetterDocumentSection2 ctrl={__ctrl} />

        {/* SIGNATURES & OFFICIAL SEAL SECTION */}
        <div className="pt-3 border-t border-zinc-200 flex flex-row items-end justify-between gap-4 mt-auto">
          {/* Left: Company Authorized Signatory */}
          <div className="text-left space-y-1 min-w-[180px]">
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tight">
              FOR {fullCompanyName}
            </p>
            <div className="h-12 flex items-center justify-start">
              {signatureUrl ? (
                <img src={signatureUrl} alt="Signature" className="max-h-12 max-w-[150px] object-contain pointer-events-none" />
              ) : (
                <span className="font-serif italic font-extrabold text-base text-zinc-900">
                  {signatoryName}
                </span>
              )}
            </div>
            <div className="border-t-2 border-zinc-400 pt-0.5">
              <strong className="text-[9px] font-black uppercase text-zinc-900 block">
                <EditableOfferText value={signatoryName} interactive={interactive} />
              </strong>
              <span className="text-[7.5px] text-zinc-500 font-medium block">
                <EditableOfferText value={signatoryDesignation} interactive={interactive} />
              </span>
            </div>
          </div>

          {/* Center: Corporate Seal / Stamp (Only shown when stamp image is provided) */}
          <div className="shrink-0 text-center">
            {stampUrl ? (
              <div className="w-20 h-20 flex items-center justify-center p-0.5 bg-transparent border-0 shadow-none">
                <img src={stampUrl} alt="Official Stamp" className="max-h-20 max-w-20 object-contain drop-shadow-xs bg-transparent" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 pointer-events-none" />
            )}
          </div>

          {/* Right: Candidate Acceptance Signature */}
          <div className="text-right space-y-1 min-w-[180px]">
            <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tight">
              CANDIDATE ACCEPTANCE
            </p>
            <div className="h-12 flex items-end justify-end">
              {/* Space for physical or digital signing */}
            </div>
            <div className="border-t-2 border-zinc-400 pt-0.5">
              <strong className="text-[9px] font-black uppercase text-zinc-900 block">
                <EditableOfferText value={user.name} interactive={interactive} />
              </strong>
              <span className="text-[7.5px] text-zinc-500 font-medium block">Signature &amp; Date</span>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOTER BANNER */}
        <div className="bg-gradient-to-r from-[#005f69] to-[#008a99] text-white p-2 rounded-xl text-[8px] font-medium flex items-center justify-between shadow-xs">
          <p className="flex items-center gap-1">
            <Building2 size={10} />
            <span>{fullCompanyName} • Corporate HR Division</span>
          </p>
          <span className="font-mono text-teal-200">
            Regd Office: Kolkata • West Bengal • India
          </span>
        </div>
      </div>
    </div>
  )
}
