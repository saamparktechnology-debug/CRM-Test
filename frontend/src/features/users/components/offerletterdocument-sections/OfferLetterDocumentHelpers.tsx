"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  Building2, MapPin, Calendar, Mail, Phone, ShieldCheck, 
  Award, FileText, Download, Printer, Send, Sparkles, Check, 
  UserCheck, Briefcase, DollarSign, Clock, Shield, Globe, Plus, Trash2,
  Layers, ChevronRight, User, AlertCircle
} from "lucide-react"
import { UserItem } from "@/features/users/types"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { printDocument } from "@/lib/printUtils"

export const DEFAULT_ROLE_RESPONSIBILITIES: Record<string, string[]> = {
  "Software Engineer": [
    "Design, develop, test, and deploy high-performance web and enterprise applications.",
    "Collaborate with product designers and backend architects to deliver responsive user experiences.",
    "Maintain high code quality, test coverage, and participate in agile sprint reviews.",
    "Troubleshoot production incidents, optimize databases, and implement secure REST APIs."
  ],
  "Frontend Developer": [
    "Build responsive, modern web interfaces using React, Next.js, and TypeScript.",
    "Collaborate with UI/UX designers to translate wireframes into interactive, accessible components.",
    "Ensure cross-browser compatibility and maximize application rendering performance."
  ],
  "Backend Developer": [
    "Architect scalable microservices, RESTful APIs, and database schemas.",
    "Implement enterprise security protocols, JWT/OAuth authentication, and caching layers.",
    "Integrate payment gateways, third-party webhooks, and automated background workers."
  ],
  "UI/UX Designer": [
    "Create intuitive UI/UX design systems, wireframes, vector assets, and interactive prototypes.",
    "Produce high-impact marketing creatives, digital branding materials, and client collateral.",
    "Maintain consistent visual brand guidelines across all web, mobile, and print touchpoints."
  ],
  "Sales Manager": [
    "Identify, qualify, and convert enterprise client leads into long-term commercial contracts.",
    "Conduct solution demonstrations, prepare quotation proposals, and negotiate contract terms.",
    "Achieve monthly and quarterly revenue targets while managing the sales pipeline CRM."
  ],
  "Sales Executive": [
    "Engage prospective clients, generate outbound leads, and execute product walkthroughs.",
    "Prepare client estimates, follow up on pending invoices, and assist in customer onboarding.",
    "Maintain client relationship records and achieve assigned monthly conversion KPIs."
  ],
  "Operations Executive": [
    "Manage day-to-day administrative and branch operations in coordination with regional hubs.",
    "Ensure SLA adherence for customer deliverables and streamline operational workflows.",
    "Coordinate with procurement, vendors, and logistics to ensure seamless execution."
  ],
  "Accountant": [
    "Maintain general ledger accounts, process GST filings, reconciliation, and audit documentation.",
    "Generate accurate client tax invoices, track accounts receivable, and oversee vendor disbursements.",
    "Prepare monthly balance sheets, profit & loss summaries, and statutory compliance filings."
  ],
  "Branch Manager": [
    "Lead branch operations, team productivity, customer satisfaction, and revenue targets.",
    "Ensure full statutory and regulatory compliance with corporate policies and ISO standards.",
    "Supervise regional customer onboarding, key account management, and team performance appraisals."
  ],
  "Customer Support": [
    "Provide prompt, empathetic technical and billing support to enterprise clients.",
    "Log, escalate, and resolve customer tickets within defined service level agreements.",
    "Gather client feedback to help product teams improve system functionality and usability."
  ],
  "Digital Marketing Specialist": [
    "Execute SEO, SEM, social media, and multi-channel performance marketing campaigns.",
    "Analyze website traffic and lead acquisition metrics to optimize conversion rates.",
    "Create engaging content, email newsletters, and promotional campaigns for target audiences."
  ]
}

export function getPresetResponsibilities(designation?: string): string[] {
  if (!designation) return [
    "Execute assigned technical, operational, and commercial objectives in alignment with company goals.",
    "Collaborate across cross-functional teams to ensure high-quality, timely project deliverables.",
    "Adhere to organizational security protocols, coding guidelines, and standard operating procedures.",
    "Participate in team meetings, technical evaluations, and ongoing professional development."
  ]
  
  const lower = designation.toLowerCase()
  for (const [key, list] of Object.entries(DEFAULT_ROLE_RESPONSIBILITIES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return list
    }
  }

  if (lower.includes("develop") || lower.includes("program") || lower.includes("tech")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["Software Engineer"]
  }
  if (lower.includes("sale") || lower.includes("business") || lower.includes("bd")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["Sales Manager"]
  }
  if (lower.includes("design") || lower.includes("art") || lower.includes("ui") || lower.includes("ux")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["UI/UX Designer"]
  }
  if (lower.includes("account") || lower.includes("tax") || lower.includes("finance")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["Accountant"]
  }
  if (lower.includes("operat") || lower.includes("admin")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["Operations Executive"]
  }
  if (lower.includes("market")) {
    return DEFAULT_ROLE_RESPONSIBILITIES["Digital Marketing Specialist"]
  }

  return [
    `Execute core functions and responsibilities associated with the role of ${designation}.`,
    "Collaborate with senior management and team members to deliver exceptional business outcomes.",
    "Maintain strict adherence to quality standards, project milestones, and company operational policies.",
    "Represent the organization with professionalism, ethical integrity, and technical excellence."
  ]
}

export function EditableOfferText({
  value,
  onChange,
  className = "",
  placeholder = "",
  as = "span",
  interactive = true,
  multiline = false
}: {
  value?: string | null
  onChange?: (val: string) => void
  className?: string
  placeholder?: string
  as?: any
  interactive?: boolean
  multiline?: boolean
}) {
  const [internalVal, setInternalVal] = React.useState(value ?? "")

  React.useEffect(() => {
    setInternalVal(value ?? "")
  }, [value])

  if (!interactive) {
    const Component = as || "span"
    return <Component className={className}>{internalVal || placeholder}</Component>
  }

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const text = e.currentTarget.innerText.trim()
    setInternalVal(text)
    onChange?.(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault()
      e.currentTarget.blur()
    }
  }

  const Component = as || "span"

  return (
    <Component
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-hidden transition-all duration-150 hover:bg-amber-100/60 focus:bg-amber-100 focus:ring-1 focus:ring-amber-500 rounded px-1 -mx-1 cursor-text ${className}`}
      title="Click to edit text directly"
    >
      {internalVal || placeholder}
    </Component>
  )
}

export interface OfferLetterDocumentProps {
  user: UserItem
  company?: any
  branch?: any
  subBranch?: any
  interactive?: boolean
  joiningDate?: string
  onJoiningDateChange?: (date: string) => void
  designation?: string
  onDesignationChange?: (desig: string) => void
  ctc?: string
  onCtcChange?: (ctc: string) => void
  monthlySalary?: string
  onMonthlySalaryChange?: (sal: string) => void
  department?: string
  onDepartmentChange?: (dept: string) => void
  reportingManager?: string
  onReportingManagerChange?: (mgr: string) => void
  probationPeriod?: string
  onProbationPeriodChange?: (prob: string) => void
  workingHours?: string
  onWorkingHoursChange?: (hrs: string) => void
  workMode?: string
  onWorkModeChange?: (mode: string) => void
  responsibilities?: string[]
  onResponsibilitiesChange?: (res: string[]) => void
  terms?: string[]
  onTermsChange?: (terms: string[]) => void
  onSendEmail?: () => void
  isSendingEmail?: boolean
  onFieldChange?: (field: string, val: string) => void
}
