"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, Check, Users, Mail, ArrowRight, ArrowLeft, Send, Sparkles, 
  Building2, Calendar, FileText, CheckSquare, Search, AlertCircle, Shield
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { createAndSendLetter } from "../services/letterService"
import { LetterRecord, LetterType, LetterRecipient, LetterCustomFields } from "../types"
import { LetterComposerModalSection1 } from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalSection1"
import { LetterComposerModalSection2 } from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalSection2"


import { type LetterComposerModalProps, TEMPLATES } from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalHelpers"
export * from "@/features/letters/components/lettercomposermodal-sections/LetterComposerModalHelpers"

export function LetterComposerModal({ isOpen, onClose, onSuccess }: LetterComposerModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, companies } = useAuthStore()
  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0]
  const companyName = getCompanyFullName(activeCompany)
  const logoUrl = getCompanyLogoUrl(activeCompany)

  const [step, setStep] = React.useState<1 | 2 | 3>(1)
  const [templateType, setTemplateType] = React.useState<LetterType>("office_close")
  
  // Letter Header & Content
  const [title, setTitle] = React.useState("Notice: Office Closure for Upcoming Holiday")
  const [subject, setSubject] = React.useState("Temporary Office Closure Announcement")
  const [body, setBody] = React.useState("")
  const [signatoryName, setSignatoryName] = React.useState(activeCompany?.signatory_name || "Authorized Signatory")
  const [signatoryDesignation, setSignatoryDesignation] = React.useState(activeCompany?.signatory_designation || "Managing Director")
  
  // Custom Fields
  const [fields, setFields] = React.useState<LetterCustomFields>({
    candidateName: "",
    jobTitle: "Software Engineer",
    department: "Engineering",
    ctcAmount: "6,00,000 INR per annum",
    joiningDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    probationMonths: "3",
    workLocation: activeCompany?.city || "Kolkata, West Bengal",
    
    noticeTitle: "Office Closure Notice",
    closedFromDate: new Date().toISOString().split("T")[0],
    closedToDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
    resumptionDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
    occasion: "Durga Puja & Festive Holidays",
    emergencyContact: activeCompany?.phone || "+91 9901518567",
    isWorkFromHomeAllowed: true,
  })

  // Step 2: Recipients
  const [recipientFilter, setRecipientFilter] = React.useState<"all" | "team" | "client">("all")
  const [availableRecipients, setAvailableRecipients] = React.useState<LetterRecipient[]>([])
  const [selectedRecipientIds, setSelectedRecipientIds] = React.useState<Set<string>>(new Set())
  const [searchMember, setSearchMember] = React.useState("")
  const [isLoadingRecipients, setIsLoadingRecipients] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)

  // Load Team Members and Clients
  React.useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      setIsLoadingRecipients(true)
      try {
        const comp = activeCompanyId || "all"
        const [teamUsers, clientList] = await Promise.all([
          getUsers(comp).catch(() => []),
          getClients(comp).catch(() => [])
        ])

        const list: LetterRecipient[] = []

        // Team members (exclude clients)
        if (Array.isArray(teamUsers)) {
          teamUsers.forEach((u: any) => {
            const role = String(u.role || "").toLowerCase()
            if (!role.includes("client")) {
              list.push({
                id: `team_${u.id || u.email}`,
                name: u.name || u.full_name || u.email,
                email: u.email,
                role: u.role || "Team Member",
                type: "team",
                avatarUrl: u.avatarUrl || u.avatar,
                branchName: u.branchName,
                phone: u.phone,
              })
            }
          })
        }

        // Clients
        if (Array.isArray(clientList)) {
          clientList.forEach((c: any) => {
            list.push({
              id: `client_${c.id || c.email}`,
              name: c.company_name || c.primaryContact || "Valued Client",
              email: c.email,
              role: "Client",
              type: "client",
              phone: c.phone,
              companyName: c.company_name,
            })
          })
        }

        setAvailableRecipients(list)
      } catch (err) {
        console.warn("Failed to load recipients:", err)
      } finally {
        setIsLoadingRecipients(false)
      }
    }
    load()
  }, [isOpen, activeCompanyId])

  // Generate Body whenever template or fields change
  React.useEffect(() => {
    if (templateType === "office_close") {
      setTitle(`Notice: Office Closure for ${fields.occasion || "Upcoming Holiday"}`)
      setSubject(`Official Notice: Office Closed from ${fields.closedFromDate} to ${fields.closedToDate}`)
      setBody(
`Dear Team Members & Valued Clients,

Please be informed that the offices of ${companyName} will remain temporarily closed from ${fields.closedFromDate} to ${fields.closedToDate} on account of ${fields.occasion || "scheduled holidays"}.

Regular business operations and support will resume on ${fields.resumptionDate}.

${fields.isWorkFromHomeAllowed ? "• Essential technical & client emergency support will operate remotely via on-call duty." : ""}
• In case of any urgent operational query, please reach out to our emergency support line: ${fields.emergencyContact || "our official support desk"}.

We wish everyone a joyful and peaceful break!

Warm regards,
Management,
${companyName}`
      )
    } else if (templateType === "offer_letter") {
      setTitle(`Employment Offer Letter - ${fields.jobTitle || "Role"}`)
      setSubject(`Offer of Employment: ${fields.jobTitle || "Position"} at ${companyName}`)
      setBody(
`Dear ${fields.candidateName || "[Candidate Name]"},

We are pleased to extend an offer of employment with ${companyName} for the position of ${fields.jobTitle || "Software Engineer"} in our ${fields.department || "Operations"} Department.

KEY TERMS OF OFFER:
• Position: ${fields.jobTitle || "Software Engineer"}
• Total Annual CTC: ${fields.ctcAmount || "As discussed"}
• Proposed Date of Joining: ${fields.joiningDate || "Immediate"}
• Probation Period: ${fields.probationMonths || "3"} Months
• Location of Work: ${fields.workLocation || "Company Headquarters"}

You will be required to bring all original educational, identity, and previous relieving certificates at the time of joining.

Please sign and return the duplicate copy of this letter as confirmation of your acceptance.

Welcome to the ${companyName} family!

Sincerely,
${signatoryName}
${signatoryDesignation}, ${companyName}`
      )
    } else if (templateType === "appointment") {
      setTitle(`Appointment Letter - ${fields.candidateName || "Staff Member"}`)
      setSubject(`Official Appointment Letter: ${fields.jobTitle || "Employee"}`)
      setBody(
`Dear ${fields.candidateName || "[Staff Name]"},

Following your satisfactory completion of initial formalities, we are delighted to confirm your appointment at ${companyName} as ${fields.jobTitle || "Executive"} effective ${fields.joiningDate || "today"}.

You will be reporting to ${fields.reportingManager || "Department Head"}. You are expected to uphold the highest standards of professional integrity, client service, and confidentiality.

Detailed company policies, leave guidelines, and standard operating procedures are available on your CRM portal.

Congratulations and best wishes for a successful tenure!

Sincerely,
${signatoryName}
${signatoryDesignation}, ${companyName}`
      )
    } else if (templateType === "experience") {
      setTitle(`Experience & Relieving Certificate - ${fields.candidateName || "Staff Member"}`)
      setSubject(`Experience Certificate: ${fields.candidateName || "Staff Member"}`)
      setBody(
`TO WHOMSOEVER IT MAY CONCERN

This is to certify that ${fields.candidateName || "[Name]"} was employed with ${companyName} as ${fields.jobTitle || "[Designation]"} from ${fields.joiningDate || "[Start Date]"} to ${fields.relievingDate || "[End Date]"}.

During their tenure with us, we found them to be diligent, hardworking, and committed to their duties. Their conduct and performance were exemplary.

They are relieved from all active service responsibilities of the company with effect from close of business on ${fields.relievingDate || "[End Date]"}.

We wish them continued success in all their future endeavors.

Authorized Signatory,
${companyName}`
      )
    } else if (templateType === "warning") {
      setTitle(`Warning Letter: Performance & Policy Adherence Notice`)
      setSubject(`Confidential: Official Warning Notice`)
      setBody(
`Dear ${fields.candidateName || "[Employee Name]"},

This letter serves as an official formal warning regarding ${fields.violationReason || "unapproved absences and policy non-compliance observed recently"}.

Management has reviewed the incident recorded on ${fields.incidentDate || "recent dates"} and concluded that this behavior breaches standard company guidelines.

You are requested to rectify these issues within ${fields.remedialActionPeriod || "14 business days"}. Failure to maintain expected standards may result in further disciplinary measures up to termination of employment.

Please sign and acknowledge receipt of this notice.

Sincerely,
${signatoryName}
${signatoryDesignation}, ${companyName}`
      )
    } else if (templateType === "announcement") {
      setTitle(`Company Announcement & Circular`)
      setSubject(`Important Announcement from ${companyName}`)
      setBody(
`Dear Team Members and Valued Clients,

We are delighted to share an important announcement regarding our ongoing growth and operational updates at ${companyName}.

[Enter your detailed message and circular instructions here]

Thank you for your continued dedication, partnership, and collaboration.

Best regards,
${signatoryName}
${signatoryDesignation}, ${companyName}`
      )
    }
  }, [templateType, fields, companyName, signatoryName, signatoryDesignation])

  // Filtered recipients in Step 2
  const filteredRecipients = availableRecipients.filter(r => {
    if (recipientFilter === "team" && r.type !== "team") return false
    if (recipientFilter === "client" && r.type !== "client") return false
    if (searchMember) {
      const q = searchMember.toLowerCase().trim()
      const match = r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.branchName && r.branchName.toLowerCase().includes(q))
      if (!match) return false
    }
    return true
  })

  const toggleSelectRecipient = (id: string) => {
    setSelectedRecipientIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAllFiltered = () => {
    const allFilteredIds = filteredRecipients.map(r => r.id)
    const allSelected = allFilteredIds.every(id => selectedRecipientIds.has(id))
    setSelectedRecipientIds(prev => {
      const next = new Set(prev)
      if (allSelected) {
        allFilteredIds.forEach(id => next.delete(id))
      } else {
        allFilteredIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  const selectedCount = selectedRecipientIds.size
  const selectedRecipientsList = availableRecipients.filter(r => selectedRecipientIds.has(r.id))
  const teamCount = selectedRecipientsList.filter(r => r.type === "team").length
  const clientCount = selectedRecipientsList.filter(r => r.type === "client").length

  const handleSendLetter = async () => {
    if (selectedCount === 0) {
      alert("Please select at least one recipient to send the letter.")
      return
    }
    setIsSending(true)
    try {
      const refNum = `LTR-${activeCompanyId?.toUpperCase() || "SP"}-${Date.now().toString().slice(-6)}`
      const letterRecord: LetterRecord = {
        id: `ltr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        referenceNumber: refNum,
        companyId: activeCompanyId || "all",
        companyName,
        templateType,
        title,
        subject,
        body,
        customFields: fields,
        recipients: selectedRecipientsList,
        recipientType: teamCount > 0 && clientCount > 0 ? "both" : teamCount > 0 ? "team" : "client",
        signatoryName,
        signatoryDesignation,
        signatureUrl: activeCompany?.signature_image_url,
        stampUrl: activeCompany?.stamp_image_url,
        createdAt: new Date().toISOString(),
        createdBy: user?.name || "Admin",
        status: "Sent",
      }

      await createAndSendLetter(letterRecord, activeCompanyId || "all")
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Failed to send letter:", err)
      alert("Failed to dispatch letter. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  
  __ctrl = { isOpen, onClose, onSuccess, user, activeCompanyId, companies, activeCompany, companyName, logoUrl, step, setStep, templateType, setTemplateType, title, setTitle, subject, setSubject, body, setBody, signatoryName, setSignatoryName, signatoryDesignation, setSignatoryDesignation, fields, setFields, recipientFilter, setRecipientFilter, availableRecipients, setAvailableRecipients, selectedRecipientIds, setSelectedRecipientIds, searchMember, setSearchMember, isLoadingRecipients, setIsLoadingRecipients, isSending, setIsSending, filteredRecipients, toggleSelectRecipient, toggleSelectAllFiltered, selectedCount, selectedRecipientsList, teamCount, clientCount, handleSendLetter };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
              ✉️
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Compose & Send Official Letter</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-semibold">
                  Step {step} of 3
                </span>
              </h2>
              <p className="text-xs text-zinc-500">
                {step === 1 && "Select letter template and customize letterhead content"}
                {step === 2 && "Choose which Team Members and Clients will receive this letter"}
                {step === 3 && "Review finalized official document and dispatch"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold shrink-0">
          <button 
            onClick={() => setStep(1)} 
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-all ${step === 1 ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20" : "border-transparent text-zinc-500"}`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
            <span>1. Format & Content</span>
          </button>
          <button 
            onClick={() => setStep(2)} 
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-all ${step === 2 ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20" : "border-transparent text-zinc-500"}`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
            <span>2. Select Members ({selectedCount})</span>
          </button>
          <button 
            onClick={() => setStep(3)} 
            className={`py-2.5 flex items-center justify-center gap-2 border-b-2 transition-all ${step === 3 ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20" : "border-transparent text-zinc-500"}`}
          >
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
            <span>3. Letterhead & Send</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          <LetterComposerModalSection1 ctrl={__ctrl} />

          <LetterComposerModalSection2 ctrl={__ctrl} />
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && !body.trim()) {
                    alert("Please provide letter content.")
                    return
                  }
                  if (step === 2 && selectedCount === 0) {
                    alert("Please select at least one recipient to proceed.")
                    return
                  }
                  setStep((s) => (s + 1) as any)
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to {step === 1 ? "Select Members" : "Review & Send"}</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSending || selectedCount === 0}
                onClick={handleSendLetter}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                <span>{isSending ? "Dispatching Letters..." : `Dispatch & Send to ${selectedCount} Members`}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
