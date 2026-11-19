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

export interface QuotationLineItem {
  id: string
  name: string
  serviceName?: string
  description?: string
  deliverableTime?: string
  sac?: string
  sacCode?: string
  quantity: number
  unit?: string
  unitPrice: number
  rate?: number
  gstRate?: number
  gstAmount?: number
  total: number
}

export interface QuotationData {
  id: string
  number: string
  customer: string
  client?: string
  customerEmail?: string
  clientEmail?: string
  customerPhone?: string
  clientPhone?: string
  customerAddress?: string
  clientAddress?: string
  clientGstin?: string
  placeOfSupply?: string
  date: string
  validTill?: string
  notes?: string
  terms?: string
  subtotal?: number
  tax?: number
  total: number
  status: string
  clientAccepted?: boolean
  acceptedAt?: number | string
  acceptedBy?: string
  approvalStatus?: "pending" | "approved" | "rejected"
  items?: QuotationLineItem[]
  services?: any[]
  companyId?: string
  companyName?: string
  branchId?: string
  branchName?: string
  subBranchId?: string
  subBranchName?: string
  preparedBy?: string
  // Project Scope Details
  project?: string
  projectTitle?: string
  primaryCategory?: string
  category?: string
  overview?: string
  timeline?: string
  turnaroundTime?: string
  scopeInclusions?: string
  scopeExclusions?: string
  paymentMilestones?: Array<{ milestone: string; percentage: number; stage: string }>
  deliverables?: Array<{ id: string; title: string; description: string; duration: string }>
  // Client & Owner details
  contactPersonName?: string
  primaryContact?: string
  clientContactPerson?: string
  clientDesignation?: string
  clientPincode?: string
  clientCity?: string
  clientDistrict?: string
  clientState?: string
  // Payment structure details
  paymentPlan?: string
  paymentStructure?: string
  emiMonths?: number
  emiAdvanceAmount?: number
  emiMonthlyAmount?: number
  subscriptionCycle?: string
  subscriptionDurationMonths?: number
  subscriptionRate?: number
  marketingPackage?: any
}

export interface OfficialQuotationDocumentProps {
  quotation: QuotationData
  onClose?: () => void
  onAccept?: () => void
  onDecline?: () => void
  onRequestModify?: () => void
  onSendEmail?: () => void
  onConvertToInvoice?: () => void
  onConvertToProject?: () => void
  onConvertToClient?: () => void
  onSendEstimate?: () => void
  isClientRole?: boolean
}

export function formatQuotationDate(rawDate?: string | number | Date | null): string {
  if (!rawDate) return "-"
  const str = String(rawDate).trim()
  if (str === "-" || str === "") return "-"

  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[3]}`
  }

  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (ymdMatch) {
    return `${ymdMatch[3].padStart(2, "0")}-${ymdMatch[2].padStart(2, "0")}-${ymdMatch[1]}`
  }

  const d = new Date(str)
  if (isNaN(d.getTime())) return str

  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export function numberToIndianWords(num: number): string {
  if (num === 0) return "Zero Rupees Only"
  
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function inWords(n: number): string {
    if (n < 20) return a[n]
    const digit = n % 10
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "")
  }

  const str = ("000000000" + Math.round(num)).substr(-9)
  const crore = parseInt(str.substr(0, 2), 10)
  const lakh = parseInt(str.substr(2, 2), 10)
  const thousand = parseInt(str.substr(4, 2), 10)
  const hundred = parseInt(str.substr(6, 1), 10)
  const rest = parseInt(str.substr(7, 2), 10)

  let res = ""
  if (crore > 0) res += inWords(crore) + " Crore "
  if (lakh > 0) res += inWords(lakh) + " Lakh "
  if (thousand > 0) res += inWords(thousand) + " Thousand "
  if (hundred > 0) res += inWords(hundred) + " Hundred "
  if (rest > 0) {
    if (res !== "") res += "and "
    res += inWords(rest) + " "
  }

  return res.trim() + " Rupees Only"
}
