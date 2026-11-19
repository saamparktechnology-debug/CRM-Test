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

export interface CustomTextStamp {
  id: string
  text: string
  color?: string
  bgStyle?: "stamp" | "badge" | "clean" | "watermark"
  fontSize?: number
  isBold?: boolean
  isItalic?: boolean
  rotation?: number
  x: number
  y: number
}

export const TextEditContext = React.createContext<boolean>(false)

export interface OfficialInvoiceDocumentProps {
  invoice: InvoiceItem
  clientDetails?: ClientItem | null
  companyDetails?: Company | null
  paySettings?: CompanyPaymentSettings
  interactive?: boolean
  allowTextEdit?: boolean
  logoPosition?: { x: number; y: number }
  onLogoPositionChange?: (pos: { x: number; y: number }) => void
  logoScale?: number
  onLogoScaleChange?: (scale: number) => void
  stampPosition?: { x: number; y: number }
  onStampPositionChange?: (pos: { x: number; y: number }) => void
  stampScale?: number
  onStampScaleChange?: (scale: number) => void
  signaturePosition?: { x: number; y: number }
  onSignaturePositionChange?: (pos: { x: number; y: number }) => void
  signatureScale?: number
  onSignatureScaleChange?: (scale: number) => void
  customStamps?: CustomTextStamp[]
  onCustomStampMove?: (id: string, pos: { x: number; y: number }) => void
  onCustomStampUpdate?: (id: string, updates: Partial<CustomTextStamp>) => void
  onRemoveCustomStamp?: (id: string) => void
  onAddCustomStamp?: (stamp?: Partial<CustomTextStamp>) => void
  onFieldChange?: (field: string, value: string) => void
  overrideLogoUrl?: string
  overrideSignatureUrl?: string
  overrideStampUrl?: string
  overrideBankDetails?: {
    bankName?: string
    accountHolder?: string
    accountNumber?: string
    ifscCode?: string
    bankBranch?: string
    upiId?: string
    paymentQrUrl?: string
  }
  activeBranch?: Branch | any | null
  activeSubBranch?: SubBranch | any | null
}

export function EditableText({
  value,
  onChange,
  className = "",
  placeholder = "",
  as = "span",
  interactive: propInteractive,
  fieldKey,
}: {
  value?: string | null
  onChange?: (val: string) => void
  className?: string
  placeholder?: string
  as?: any
  interactive?: boolean
  fieldKey?: string
}) {
  const contextAllowTextEdit = React.useContext(TextEditContext)
  const isActuallyInteractive = (propInteractive ?? false) && contextAllowTextEdit

  const [internalVal, setInternalVal] = React.useState(value ?? "")
  React.useEffect(() => {
    setInternalVal(value ?? "")
  }, [value])

  if (!isActuallyInteractive) {
    const Tag = as
    return <Tag className={className}>{value || ""}</Tag>
  }

  const Tag = as
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      className={`${className} outline-none transition-all rounded px-0.5 -mx-0.5 hover:bg-blue-100/70 hover:ring-1 hover:ring-blue-400 focus:bg-white focus:text-zinc-950 focus:ring-2 focus:ring-blue-600 focus:shadow-xs cursor-text inline-block min-w-[12px]`}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        const text = (e.currentTarget.textContent || "").replace(/\r?\n|\r/g, "")
        setInternalVal(text)
        if (onChange) onChange(text)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter" && as !== "div" && as !== "p") {
          e.preventDefault()
          ;(e.target as HTMLElement).blur()
        }
      }}
      title="Click or touch to edit this text directly"
    >
      {internalVal || placeholder}
    </Tag>
  )
}

export function formatInvoiceDate(rawDate?: string | number | Date | null): string {
  if (!rawDate) return "-"
  const str = String(rawDate).trim()
  if (str === "-" || str === "") return "-"

  // Check if already in DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dmyMatch) {
    return `${dmyMatch[1].padStart(2, "0")}-${dmyMatch[2].padStart(2, "0")}-${dmyMatch[3]}`
  }

  // Check if in YYYY-MM-DD or YYYY/MM/DD
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

  const str = ("000000000" + num).substr(-9)
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

export function safeFormatCurrency(val: any, decimals: number = 2): string {
  if (val === undefined || val === null || val === "") return "0.00"
  const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""))
  if (isNaN(num)) return "0.00"
  return num.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
