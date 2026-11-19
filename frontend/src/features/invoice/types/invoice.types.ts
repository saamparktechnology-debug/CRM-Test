export type InvoiceStatus =
  | "Draft"
  | "Partially paid"
  | "Fully paid"
  | "Not paid"
  | "Credited"
  | "Payment Pending"
  | "Pending Approval"
  | "Rejected"
  | "Pending Verification"

export interface InvoiceLineCharge {
  id: string
  name: string
  amount: number
}

export interface InvoiceLineItem {
  id: string
  serviceName: string
  description?: string
  deliverableTime?: string
  sacCode?: string
  qty: number
  unit: string
  rate: number
  charges?: InvoiceLineCharge[]
  gstRate: number
  gstAmount: number
  totalAmount: number
}

export interface AppliedDiscount {
  id: string
  name: string
  amount: number
}

export interface AssignedMemberAttribution {
  memberId: string
  memberName: string
  memberRole?: string
  memberAvatar?: string
  payoutType: "percentage" | "fixed"
  payoutValue: number
  sharePct?: number
  payoutAmount?: number
}

export interface InvoiceItem {
  id: string
  client: string
  date?: string
  invoiceNumber?: string
  contactPersonName?: string
  primaryContact?: string
  clientContactPerson?: string
  clientDesignation?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  clientDistrict?: string
  clientCity?: string
  clientState?: string
  clientGstin?: string
  clientId?: string
  creditDeduction?: number
  appliedCreditNotes?: string[]
  creditNoteNumber?: string
  project: string
  category?: string
  primaryCategory?: string
  paymentPlan?: string
  paymentStructure?: string
  invoiceType?: "gst" | "nongst"
  companyName?: string
  notes?: string
  terms?: string
  billDate: string
  invoiceDate?: string
  billTime?: string
  createdAt?: number | string
  dueDate: string
  baseAmount?: number
  setupCharge?: number
  discount?: number
  gstRate?: number
  gstAmount?: number
  totalInvoiced: string
  paymentReceived: string
  due: string
  status: InvoiceStatus
  paymentProofUtr?: string
  paymentProofMethod?: string
  paymentProofAmount?: number
  paymentProofDate?: string
  paymentProofNotes?: string
  paymentProofSubmittedBy?: string
  clientAccepted?: boolean
  acceptedAt?: number | string
  acceptedBy?: string
  clientAcceptNotes?: string
  approvalStatus?: "pending" | "approved" | "rejected"
  rejectionReason?: string
  billedBy?: string
  lastReminderSent?: string
  companyId?: string
  branchId?: string
  branchName?: string
  branchCode?: string
  subBranchId?: string
  subBranchName?: string
  subBranchCode?: string
  subBranchSharePct?: number
  subBranchPayoutType?: "percentage" | "fixed"
  subBranchShareAmount?: number
  assignedMembers?: AssignedMemberAttribution[]
  assignedMemberId?: string
  assignedMemberName?: string
  assignedMemberRole?: string
  assignedMemberAvatar?: string
  memberPayoutType?: "percentage" | "fixed"
  memberPayoutValue?: number
  memberPayoutAmount?: number
  memberSharePct?: number
  createdByName?: string
  createdByRole?: string
  items?: InvoiceLineItem[]
  discountsList?: AppliedDiscount[]
  companyDetails?: any
  overrideBankDetails?: any
  overrideLogoUrl?: string
  overrideSignatureUrl?: string
  overrideStampUrl?: string
  logoPosition?: { x: number; y: number }
  signaturePosition?: { x: number; y: number }
  customStamps?: any[]
  marketingPackage?: any
}

export type ModuleCategoryFilter = "all" | "software" | "marketing"
export type InvoiceFilterTab = "all" | InvoiceStatus | "overdue"
