export type BillingCycle = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Half-Yearly" | "Annually" | "Custom Days"

export type SubscriptionStatus = "Active" | "Expiring Soon" | "Past Due" | "Canceled" | "Cancelled" | "Trial" | "Pending Approval"

export type SubscriptionType = "package" | "regular" | "emi"

export type InstallmentStatus = "Paid" | "Pending" | "Overdue" | "Partially Paid"

export interface PackageTier {
  id: string
  name: string
  category: "Technology & Software" | "Digital Marketing" | "Cloud & Infrastructure" | "Creative & Branding" | "Custom"
  price: number
  billingCycle: BillingCycle
  description: string
  deliverables: string[]
  badge?: string
  popular?: boolean
  color?: string
}

export const PRESET_PACKAGE_TIERS: PackageTier[] = []

export interface InstallmentScheduleItem {
  installmentNumber: number
  amount: number
  formattedAmount: string
  dueDate: string
  status: InstallmentStatus
  paidDate?: string
  paidAmount?: number
  invoiceId?: string
  paymentMethod?: string
  reminderSentAt?: string
  notes?: string
}

export interface InstallmentItem {
  id: string
  projectId?: string
  invoiceId?: string
  contractId?: string
  clientId?: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientCompany?: string
  clientGst?: string
  projectTitle: string
  totalContractValue: number
  totalAdvancePaid: number
  totalPaid: number
  remainingBalance: number
  totalInstallments: number
  currentInstallmentNumber: number
  currentInstallmentAmount: number
  currentDueDate: string
  status: InstallmentStatus
  schedule: InstallmentScheduleItem[]
  companyId?: string
  branchId?: string
  branchName?: string
  assignedMembers?: string[]
  assignedMemberEmails?: string[]
  billedBy?: string
  createdById?: string
  createdAt?: string
  lastReminderSentAt?: string
}

export interface Subscription {
  id: string
  clientId?: string
  clientName: string
  clientEmail?: string
  clientPhone?: string
  clientCompany?: string
  planName: string
  description?: string
  status: SubscriptionStatus
  approvalStatus?: "pending" | "approved" | "rejected"
  amount: string
  numericAmount?: number
  billingCycle: BillingCycle
  customDaysCount?: number
  startDate?: string
  firstPaymentDate?: string
  firstPaymentAmount?: number | string
  nextBillingDate: string
  lastRenewedDate?: string
  autoRenew?: boolean
  reminderDaysBefore?: number
  lastReminderSentAt?: string
  companyId?: string
  branchId?: string
  branchName?: string
  assignedMembers?: string[]
  assignedMemberEmails?: string[]
  assignedMemberId?: string
  assignedMemberName?: string
  assignedMemberEmail?: string
  teamSharePercentage?: number // Revenue share % for assigned team member (e.g. 10%, 20%)
  billedBy?: string
  createdById?: string
  invoicesCount?: number
  createdProjectId?: string

  // 3 Subscription Models Support:
  subscriptionType?: SubscriptionType // "package" | "regular" | "emi"
  packageId?: string
  packageCategory?: string
  deliverables?: string[]
  totalTenureMonths?: number // For EMI Subscription (e.g. 3, 6, 12, 24)
  emiPerCycle?: number // Monthly / installment amount for EMI subscription
  downPayment?: number // Down payment if any
  paidInstallmentsCount?: number // Track progress of tenure
  totalInstallmentsCount?: number // Total installments in tenure

  // Non-GST / Tax Configuration
  isNonGst?: boolean
  taxType?: "gst" | "nongst"
  gstRate?: number

  // Overdue & Daily Late Fee / Added Payment Tracking
  dailyLateFee?: number // Daily added charge if overdue (e.g. ₹50/day)
  overdueDays?: number
  accumulatedLateFee?: number
  overduePaymentAdded?: number

  // Multi-Month & Prepaid Cycles Retainer Configuration
  totalDurationMonths?: number
  totalCycles?: number
  prepaidCycles?: number
  remainingCycles?: number
  advanceAmount?: number
  balanceDue?: number
  prepaidUntilDate?: string
  marketingPackage?: any
}

export interface SubscriptionKPIs {
  totalMRR: number
  totalARR: number
  activeSubscriptionsCount: number
  packageSubscriptionsCount: number
  regularSubscriptionsCount: number
  emiSubscriptionsCount: number
  renewalsDueThisMonthCount: number
  renewalsDueThisMonthAmount: number
  totalCollectedThisMonth: number
  overdueCount?: number
  overdueAmount?: number
}

export interface EMIKPIs {
  totalContractValue: number
  totalPaid: number
  totalRemainingBalance: number
  activeContractsCount: number
  upcomingInstallmentsDueCount: number
  upcomingInstallmentsDueAmount: number
  overdueInstallmentsCount: number
  overdueInstallmentsAmount: number
  collectionRatePercent: number
}

// ─────────────────────────────────────────────────────────────────────────────
// OVERDUE CALCULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function calculateOverdueDays(dueDateStr?: string): number {
  if (!dueDateStr) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Parse date string (handles YYYY-MM-DD or DD/MM/YYYY)
  let due: Date
  if (dueDateStr.includes("/")) {
    const [d, m, y] = dueDateStr.split("/").map(Number)
    due = new Date(y, m - 1, d)
  } else {
    due = new Date(dueDateStr)
  }

  if (isNaN(due.getTime())) return 0
  due.setHours(0, 0, 0, 0)
  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

export function calculateOverdueDetails(sub: Subscription): {
  isOverdue: boolean
  daysOverdue: number
  baseDue: number
  dailyLateFee: number
  accumulatedLateFee: number
  totalDueToday: number
} {
  const daysOverdue = calculateOverdueDays(sub.nextBillingDate)
  const isOverdue = daysOverdue > 0 && sub.status !== "Canceled"
  const baseDue = sub.numericAmount || parseInt(String(sub.amount).replace(/[^0-9]/g, "")) || 0
  const dailyLateFee = sub.dailyLateFee || 0
  const accumulatedLateFee = isOverdue ? daysOverdue * dailyLateFee : 0
  const totalDueToday = baseDue + accumulatedLateFee

  return {
    isOverdue,
    daysOverdue,
    baseDue,
    dailyLateFee,
    accumulatedLateFee,
    totalDueToday,
  }
}

export function calculateTeamRevenueShare(sub: Subscription): {
  sharePercentage: number
  cycleRevenue: number
  monthlyRevenue: number
  weeklyRevenue: number
  dailyRevenue: number
  annualRevenue: number
} {
  const baseAmt = sub.numericAmount || parseInt(String(sub.amount).replace(/[^0-9]/g, "")) || 0
  const pct = typeof sub.teamSharePercentage === "number" ? sub.teamSharePercentage : 0
  const cycleCut = Math.round((baseAmt * pct) / 100)
  
  let monthlyCut = cycleCut
  const cycleStr = String(sub.billingCycle || "").toLowerCase()
  if (cycleStr.includes("quarter")) monthlyCut = Math.round(cycleCut / 3)
  else if (cycleStr.includes("half") || cycleStr.includes("semi")) monthlyCut = Math.round(cycleCut / 6)
  else if (cycleStr.includes("annual") || cycleStr.includes("year")) monthlyCut = Math.round(cycleCut / 12)
  else if (cycleStr.includes("week")) monthlyCut = Math.round(cycleCut * 4.33)
  else if (sub.billingCycle === "Custom Days" && sub.customDaysCount) {
    monthlyCut = Math.round((cycleCut / Math.max(1, sub.customDaysCount)) * 30)
  }

  const dailyCut = Math.round(monthlyCut / 30)
  const weeklyCut = Math.round(monthlyCut / 4.33)
  const annualCut = monthlyCut * 12

  return {
    sharePercentage: pct,
    cycleRevenue: cycleCut,
    monthlyRevenue: monthlyCut,
    weeklyRevenue: weeklyCut,
    dailyRevenue: dailyCut,
    annualRevenue: annualCut,
  }
}


