"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, CreditCard, RefreshCw, X, Send, 
  CheckCircle2, DollarSign, Clock, AlertCircle, Sparkles, 
  Calendar, Layers, FileText, ChevronRight, Package, Check,
  QrCode, Building2, ShieldCheck, ArrowUpRight, User, Percent, Pencil, Search, Bell
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { 
  Subscription, 
  BillingCycle, 
  SubscriptionKPIs, 
  SubscriptionType, 
  PRESET_PACKAGE_TIERS,
  PackageTier,
  calculateOverdueDetails
} from "./types"
import { 
  getSubscriptions, 
  addSubscription, 
  deleteSubscription, 
  renewSubscription, 
  sendSubscriptionReminder, 
  updateSubscription,
  calculateNextCycleDate,
  generateSubscriptionInvoice,
  checkAndSendSubscriptionOverdueReminders
} from "./services/subscriptionService"
import { SubscriptionList } from "./components/SubscriptionList"
import { RenewSubscriptionModal } from "./components/RenewSubscriptionModal"
import { RenewReceiptModal, RenewReceiptData } from "./components/RenewReceiptModal"
import { EditSubscriptionModal } from "./components/EditSubscriptionModal"
import { ClientSubscriptionLedgerModal } from "./components/ClientSubscriptionLedgerModal"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient } from "@/lib/clientScopeUtils"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { SubscriptionsSection1 } from "@/features/subscriptions/components/subscriptions-sections/SubscriptionsSection1"
import { SubscriptionsSection2 } from "@/features/subscriptions/components/subscriptions-sections/SubscriptionsSection2"
import { SubscriptionsSection3 } from "@/features/subscriptions/components/subscriptions-sections/SubscriptionsSection3"
import { SubscriptionsSection4 } from "@/features/subscriptions/components/subscriptions-sections/SubscriptionsSection4"
import { createSubscriptionsHandler1 } from "@/features/subscriptions/hooks/subscriptions-hooks/createSubscriptionsHandler1.hooks"


export default function SubscriptionsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { activeCompanyId, activeBranchId, branches, user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const roleLower = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleLower.includes("super") || roleLower === "super admin"
  const isAdmin = !isSuperAdmin && (
    roleLower.includes("admin") || 
    roleLower.includes("owner") || 
    roleLower.includes("manager") ||
    roleLower === "admin"
  )
  const isClient = roleLower.includes("client")

  const canAddSubscription = !isClient && (canPerformAction(user, "Subscriptions", "add") || isSuperAdmin)
  const canEditSubscription = !isClient && (canPerformAction(user, "Subscriptions", "edit") || isSuperAdmin)
  const canDeleteSubscription = !isClient && (canPerformAction(user, "Subscriptions", "delete") || isSuperAdmin)

  // Active View Tab: "all" | "package" | "regular" | "emi"
  const [activeTab, setActiveTab] = React.useState<"all" | "package" | "regular" | "emi">("all")

  // Data States
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [teamMembers, setTeamMembers] = React.useState<{ id: string; name: string; email: string; role?: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Modals
  const [isAddSubModalOpen, setIsAddSubModalOpen] = React.useState(false)
  const [selectedSubModelTab, setSelectedSubModelTab] = React.useState<SubscriptionType>("package")
  const [renewingSubscription, setRenewingSubscription] = React.useState<Subscription | null>(null)
  const [editingSubscription, setEditingSubscription] = React.useState<Subscription | null>(null)
  const [selectedLedgerClient, setSelectedLedgerClient] = React.useState<string | null>(null)
  const [selectedLedgerEmail, setSelectedLedgerEmail] = React.useState<string | undefined>(undefined)
  const [selectedViewInvoice, setSelectedViewInvoice] = React.useState<InvoiceItem | null>(null)

  // Client Pay / Renew Modal
  const [clientPayingSub, setClientPayingSub] = React.useState<Subscription | null>(null)
  const [clientPayMethod, setClientPayMethod] = React.useState<"upi" | "card" | "bank">("upi")
  const [isClientPayProcessing, setIsClientPayProcessing] = React.useState(false)

  // Form State: Client & Commons
  const [availableClients, setAvailableClients] = React.useState<{ name: string; email: string; phone?: string; company?: string }[]>([])
  const [clientSearchQuery, setClientSearchQuery] = React.useState("")
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false)
  const [newClientName, setNewClientName] = React.useState("")
  const [isCustomClient, setIsCustomClient] = React.useState(false)
  const [customClientEmail, setCustomClientEmail] = React.useState("")
  const [customClientPhone, setCustomClientPhone] = React.useState("")
  const [customClientCompany, setCustomClientCompany] = React.useState("")

  // Form State: Assigned Team Member & Revenue Share %
  const [assignedTeamMemberEmail, setAssignedTeamMemberEmail] = React.useState("")
  const [teamSharePctInput, setTeamSharePctInput] = React.useState<number | "">(10)

  // Form State: Package Wise
  const [selectedPackageId, setSelectedPackageId] = React.useState<string>("pkg_growth_erp")
  const [isCustomPackage, setIsCustomPackage] = React.useState(false)
  const [customPackageName, setCustomPackageName] = React.useState("")
  const [customPackagePrice, setCustomPackagePrice] = React.useState("30000")
  const [customPackageCycle, setCustomPackageCycle] = React.useState<BillingCycle>("Monthly")
  const [customDeliverablesText, setCustomDeliverablesText] = React.useState(
    "Custom Software Maintenance\nDedicated Support Desk\nMonthly Database Backups\nSecurity Patches"
  )

  // Form State: Regular Subscription
  const [regularPlanName, setRegularPlanName] = React.useState("Cloud Infrastructure Retainer")
  const [regularAmount, setRegularAmount] = React.useState("25000")
  const [regularCycle, setRegularCycle] = React.useState<BillingCycle>("Monthly")
  const [customDaysCount, setCustomDaysCount] = React.useState<number>(30)
  const [regularStartDate, setRegularStartDate] = React.useState(new Date().toISOString().split("T")[0])
  const [regularNextDate, setRegularNextDate] = React.useState("")

  // Form State: EMI Subscription
  const [emiPlanName, setEmiPlanName] = React.useState("Enterprise Custom SaaS on EMI")
  const [emiTotalAmount, setEmiTotalAmount] = React.useState("120000")
  const [emiDownPayment, setEmiDownPayment] = React.useState("20000")
  const [emiTenureMonths, setEmiTenureMonths] = React.useState<number>(6)
  const [isEmiCustomTenure, setIsEmiCustomTenure] = React.useState(false)
  const [emiStartDate, setEmiStartDate] = React.useState(new Date().toISOString().split("T")[0])

  // Tax & Overdue Late Fee Configuration
  const [subTaxType, setSubTaxType] = React.useState<"gst" | "nongst">("gst")
  const [dailyLateFeeInput, setDailyLateFeeInput] = React.useState<number | "">(0)
  const [activeReceipt, setActiveReceipt] = React.useState<RenewReceiptData | null>(null)
  const [isSendingOverdueReminders, setIsSendingOverdueReminders] = React.useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load subscriptions fresh from store
  const loadData = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const { activeCompanyId: freshCompanyId } = useAuthStore.getState()
      const subData = await getSubscriptions(freshCompanyId || "tech")
      setSubscriptions(subData || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData(true)
    
    // Load team members strictly excluding clients
    UserService.getTeamMembers().then((users: any[]) => {
      if (Array.isArray(users)) {
        const teamOnly = users
          .filter(u => {
            const r = (u.role || u.role_name || "").toLowerCase().trim()
            return !r.includes("client")
          })
          .map((u, idx) => ({
            id: String(u.id || u._id || idx),
            name: u.full_name || u.name || u.email || "Team Member",
            email: u.email || "",
            role: u.role_name || u.role || "Team Member",
          }))
        setTeamMembers(teamOnly)
      }
    }).catch(() => {})

    const handleReload = () => loadData(false)
    window.addEventListener("storage", handleReload)
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    window.addEventListener("saampark_data_synced", handleReload)

    return () => {
      window.removeEventListener("storage", handleReload)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
      window.removeEventListener("saampark_data_synced", handleReload)
    }
  }, [loadData])

  // Populate client list on modal open
  React.useEffect(() => {
    if (isAddSubModalOpen) {
      getClients().then((cList) => {
        const mapped = cList.map(c => ({
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          company: c.companyName || c.name,
        }))
        setAvailableClients(mapped)
        if (mapped.length > 0 && !newClientName) {
          setNewClientName(mapped[0].name)
        }
      }).catch(() => {})
    }
  }, [isAddSubModalOpen, newClientName])

  // Recalculate next billing date when regular subscription cycle changes
  React.useEffect(() => {
    if (regularStartDate) {
      const nextD = calculateNextCycleDate(regularStartDate, regularCycle, customDaysCount)
      setRegularNextDate(nextD)
    }
  }, [regularStartDate, regularCycle, customDaysCount])

  // ── Role Scoped Subscriptions ──
  const visibleSubscriptions = React.useMemo(() => {
    if (!user) return []

    const { activeCompanyId: freshCompId, activeBranchId: freshBranchId, branches: freshBranches, user: freshUser } = useAuthStore.getState()
    const userComp = (freshCompId || freshUser?.companyId || "").toLowerCase().trim()
    // Strict: activeBranchId takes precedence
    const targetBranch = freshBranchId

    const branchObj = freshBranches.find(b =>
      b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase()
    )
    const targetBranchId = String(branchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = branchObj?.name?.toLowerCase().trim() || ""

    const checkCompany = (sub: Subscription) => {
      if (!userComp || userComp === "all") return true
      const comp = (sub.companyId || "").toLowerCase().trim()
      if (!comp) return false // strict: unassigned company hidden when scoped
      return comp === userComp
    }

    const checkBranch = (sub: Subscription) => {
      if (!targetBranch || targetBranch === "all") return true
      const bId = String(sub.branchId || "").toLowerCase().trim()
      const bName = String(sub.branchName || "").toLowerCase().trim()
      // Strict: subscription MUST have a branch when filter is active
      if (!bId && !bName) return false
      return bId === targetBranchId ||
             (targetBranchName && bId === targetBranchName) ||
             bName === targetBranchName ||
             (targetBranchId && bName === targetBranchId)
    }

    // 1. Super Admin & Company Admin
    if (isSuperAdmin || isAdmin) {
      return subscriptions.filter(sub => checkCompany(sub) && checkBranch(sub))
    }

    const normName = (user.name || "").toLowerCase().trim()
    const normEmail = (user.email || "").toLowerCase().trim()
    const uId = String(user.id || "").toLowerCase().trim()

    // 2. Client role: strictly their own subscriptions
    if (isClient) {
      return subscriptions.filter((sub) => {
        if (!checkBranch(sub)) return false
        return isRecordAssignedToClient(sub, user)
      })
    }

    // 3. Team Member: assigned to them
    return subscriptions.filter((sub) => {
      if (!checkBranch(sub)) return false
      const assigned = (sub.assignedMembers || []).map(m => m.toLowerCase().trim())
      const assignedEmails = (sub.assignedMemberEmails || []).map(e => e.toLowerCase().trim())
      const billedBy = (sub.billedBy || "").toLowerCase().trim()
      const createdById = String(sub.createdById || "").toLowerCase().trim()

      if (uId && createdById === uId) return true
      if (normName && billedBy === normName) return true
      if (assigned.some(m => m === normName || (normName && m.includes(normName)) || (normName && normName.includes(m)))) return true
      if (normEmail && assignedEmails.some(e => e === normEmail)) return true

      return false
    })
  }, [subscriptions, user, isSuperAdmin, isAdmin, isClient, activeCompanyId, activeBranchId, branches])

  // Filtered by Option Tab (All vs Package vs Regular vs EMI)
  const tabFilteredSubscriptions = React.useMemo(() => {
    if (activeTab === "all") return visibleSubscriptions
    return visibleSubscriptions.filter(s => (s.subscriptionType || "regular") === activeTab)
  }, [visibleSubscriptions, activeTab])

  // Compute Subscription KPIs
  const kpis: SubscriptionKPIs = React.useMemo(() => {
    const activeSubs = visibleSubscriptions.filter(s => s.status === "Active")
    let totalMRR = 0
    let totalCollected = 0
    let renewalsDueCount = 0
    let renewalsDueAmount = 0
    let pkgCount = 0
    let regCount = 0
    let emiCount = 0

    visibleSubscriptions.forEach((s) => {
      const type = s.subscriptionType || "regular"
      if (type === "package") pkgCount++
      else if (type === "emi") emiCount++
      else regCount++

      let monthlyVal = s.numericAmount || parseInt(String(s.amount).replace(/[^0-9]/g, "")) || 0
      if (type === "emi") {
        monthlyVal = s.emiPerCycle || (s.totalTenureMonths ? Math.round(monthlyVal / s.totalTenureMonths) : monthlyVal)
      } else if (s.billingCycle === "Annually") {
        monthlyVal = Math.round(monthlyVal / 12)
      } else if (s.billingCycle === "Quarterly") {
        monthlyVal = Math.round(monthlyVal / 3)
      } else if (s.billingCycle === "Weekly") {
        monthlyVal = Math.round(monthlyVal * 4.33)
      } else if (s.billingCycle === "Daily") {
        monthlyVal = Math.round(monthlyVal * 30)
      }

      if (s.status === "Active") {
        totalMRR += monthlyVal
      }

      totalCollected += s.firstPaymentAmount ? Number(s.firstPaymentAmount) : (s.numericAmount || 0)

      if (s.status === "Expiring Soon" || s.status === "Past Due") {
        renewalsDueCount++
        renewalsDueAmount += (s.numericAmount || 0)
      }
    })

    return {
      totalMRR,
      totalARR: totalMRR * 12,
      activeSubscriptionsCount: activeSubs.length,
      packageSubscriptionsCount: pkgCount,
      regularSubscriptionsCount: regCount,
      emiSubscriptionsCount: emiCount,
      renewalsDueThisMonthCount: renewalsDueCount,
      renewalsDueThisMonthAmount: renewalsDueAmount,
      totalCollectedThisMonth: totalCollected,
    }
  }, [visibleSubscriptions])

  // ── Actions ──

  const handleCreateSubscriptionSubmit: any = createSubscriptionsHandler1(() => __ctrlRef.current);

  const handleEditSubscriptionSave = async (id: string, updates: Partial<Subscription>) => {
    const res = await updateSubscription(id, updates, activeCompanyId || "tech")
    if (res) {
      showToast("✅ Subscription successfully modified and updated!")
      loadData(false)
    }
  }

  const handleDeleteSubscription = async (id: string) => {
    if (isClient || !canDeleteSubscription) {
      alert("Permission Denied: Clients cannot delete subscriptions.")
      return
    }
    const sub = subscriptions.find(s => s.id === id)
    const label = sub ? `${sub.planName || "Subscription"} for ${sub.clientName || "Client"}` : id
    if (await confirmTwoStepDelete(label, "subscription")) {
      await deleteSubscription(id, activeCompanyId || "tech")
      setSubscriptions((prev) => prev.filter((s) => s.id !== id))
      showToast("Subscription removed.")
    }
  }

  const handleToggleAutoRenew = async (sub: Subscription) => {
    const updated = await updateSubscription(sub.id, { autoRenew: !sub.autoRenew }, activeCompanyId || "tech")
    if (updated) {
      setSubscriptions(prev => prev.map(s => s.id === sub.id ? updated : s))
      showToast(`Auto-renewal ${updated.autoRenew ? "enabled" : "disabled"} for ${sub.clientName}.`)
    }
  }

  const handleSendReminder = async (id: string) => {
    const ok = await sendSubscriptionReminder(id, activeCompanyId || "tech")
    if (ok) {
      showToast("📧 Renewal reminder email dispatched to client.")
      loadData(false)
    } else {
      alert("Could not send reminder. Please verify client email in settings.")
    }
  }

  const overdueSubscriptions = React.useMemo(() => {
    return subscriptions.filter(s => s.status !== "Canceled" && calculateOverdueDetails(s).isOverdue)
  }, [subscriptions])
  const overdueCount = overdueSubscriptions.length

  const handleAutoRemindOverdue = async () => {
    if (overdueCount === 0) {
      alert("No overdue subscriptions found for this view.")
      return
    }
    if (!confirm(`Send automated overdue renewal reminders to ${overdueCount} overdue subscriber(s)?`)) return

    setIsSendingOverdueReminders(true)
    try {
      const res = await checkAndSendSubscriptionOverdueReminders(activeCompanyId || "tech")
      showToast(`📢 Sent ${res.sentCount} overdue reminder(s) successfully!`)
      loadData(false)
    } catch (err) {
      alert("Failed to send overdue reminders.")
    } finally {
      setIsSendingOverdueReminders(false)
    }
  }

  const handleViewRenewReceipt = (sub: Subscription) => {
    const isNonGst = Boolean(sub.isNonGst || sub.taxType === "nongst" || sub.gstRate === 0)
    const numAmt = sub.numericAmount || (typeof sub.amount === "number" ? sub.amount : parseInt(String(sub.amount || "0").replace(/[^0-9]/g, ""))) || 0
    const gstAmt = isNonGst ? 0 : Math.round(numAmt * 0.18)
    const totalAmt = numAmt + gstAmt

    const receipt: RenewReceiptData = {
      receiptNumber: `REC-REN-${sub.id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase() || Date.now().toString().slice(-6)}`,
      date: sub.lastRenewedDate || sub.startDate || new Date().toISOString().split("T")[0],
      subscriptionId: sub.id,
      clientName: sub.clientName,
      clientEmail: sub.clientEmail,
      clientPhone: sub.clientPhone,
      clientAddress: (sub as any).clientAddress,
      planName: sub.planName,
      billingCycle: sub.billingCycle,
      periodStart: sub.startDate || new Date().toISOString().split("T")[0],
      periodEnd: sub.nextBillingDate,
      baseAmount: numAmt,
      taxAmount: gstAmt,
      totalAmount: totalAmt,
      isNonGst: isNonGst,
      paymentMethod: "UPI / Bank Remittance",
      companyId: sub.companyId || activeCompanyId || "tech",
    }
    setActiveReceipt(receipt)
  }

  const handleRenewSubscriptionConfirm = async (
    id: string,
    nextDate: string,
    generateInvoice: boolean,
    paymentDetails?: {
      isPaid: boolean
      paymentMethod: string
      transactionRef?: string
    }
  ) => {
    const res = await renewSubscription(id, nextDate, generateInvoice, activeCompanyId || "tech", paymentDetails)
    if (res) {
      showToast(`🎉 Contract renewed until ${nextDate}! ${generateInvoice ? "Tax Invoice generated." : ""}`)
      loadData(false)
      if ((res as any).receipt) {
        setActiveReceipt((res as any).receipt)
      }
    }
  }

  const handleGenerateSubscriptionInvoice = async (sub: Subscription) => {
    try {
      const inv = await generateSubscriptionInvoice(sub, activeCompanyId || "tech")
      showToast(`✅ Invoice #${inv?.id || ''} generated for ${sub.clientName}!`)
      loadData(false)
    } catch (err) {
      console.error("Error generating subscription invoice:", err)
      alert("Could not generate invoice. Please try again.")
    }
  }

  // Client Pay Now Simulation & Record
  const handleClientPaySubscription = async () => {
    if (!clientPayingSub) return
    setIsClientPayProcessing(true)
    try {
      const nextDate = calculateNextCycleDate(clientPayingSub.nextBillingDate, clientPayingSub.billingCycle, clientPayingSub.customDaysCount)
      const res = await renewSubscription(clientPayingSub.id, nextDate, true, activeCompanyId || "tech", {
        isPaid: true,
        paymentMethod: "Online Payment Checkout",
      })
      if (res) {
        showToast(`🎉 Payment of ${clientPayingSub.amount} received! Subscription renewed until ${nextDate}.`)
        setClientPayingSub(null)
        loadData(false)
        if ((res as any).receipt) {
          setActiveReceipt((res as any).receipt)
        }
      }
    } catch (err) {
      alert("Payment failed. Please try again.")
    } finally {
      setIsClientPayProcessing(false)
    }
  }

  
  __ctrl = { activeCompanyId, activeBranchId, branches, user, canPerformAction, roleLower, isSuperAdmin, isAdmin, isClient, canAddSubscription, canEditSubscription, canDeleteSubscription, activeTab, setActiveTab, subscriptions, setSubscriptions, teamMembers, setTeamMembers, isLoading, setIsLoading, toastMessage, setToastMessage, isAddSubModalOpen, setIsAddSubModalOpen, selectedSubModelTab, setSelectedSubModelTab, renewingSubscription, setRenewingSubscription, editingSubscription, setEditingSubscription, selectedLedgerClient, setSelectedLedgerClient, selectedLedgerEmail, setSelectedLedgerEmail, selectedViewInvoice, setSelectedViewInvoice, clientPayingSub, setClientPayingSub, clientPayMethod, setClientPayMethod, isClientPayProcessing, setIsClientPayProcessing, availableClients, setAvailableClients, clientSearchQuery, setClientSearchQuery, isClientDropdownOpen, setIsClientDropdownOpen, newClientName, setNewClientName, isCustomClient, setIsCustomClient, customClientEmail, setCustomClientEmail, customClientPhone, setCustomClientPhone, customClientCompany, setCustomClientCompany, assignedTeamMemberEmail, setAssignedTeamMemberEmail, teamSharePctInput, setTeamSharePctInput, selectedPackageId, setSelectedPackageId, isCustomPackage, setIsCustomPackage, customPackageName, setCustomPackageName, customPackagePrice, setCustomPackagePrice, customPackageCycle, setCustomPackageCycle, customDeliverablesText, setCustomDeliverablesText, regularPlanName, setRegularPlanName, regularAmount, setRegularAmount, regularCycle, setRegularCycle, customDaysCount, setCustomDaysCount, regularStartDate, setRegularStartDate, regularNextDate, setRegularNextDate, emiPlanName, setEmiPlanName, emiTotalAmount, setEmiTotalAmount, emiDownPayment, setEmiDownPayment, emiTenureMonths, setEmiTenureMonths, isEmiCustomTenure, setIsEmiCustomTenure, emiStartDate, setEmiStartDate, subTaxType, setSubTaxType, dailyLateFeeInput, setDailyLateFeeInput, activeReceipt, setActiveReceipt, isSendingOverdueReminders, setIsSendingOverdueReminders, showToast, loadData, visibleSubscriptions, tabFilteredSubscriptions, kpis, handleCreateSubscriptionSubmit, handleEditSubscriptionSave, handleDeleteSubscription, handleToggleAutoRenew, handleSendReminder, overdueSubscriptions, overdueCount, handleAutoRemindOverdue, handleViewRenewReceipt, handleRenewSubscriptionConfirm, handleGenerateSubscriptionInvoice, handleClientPaySubscription };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      
      <SubscriptionsSection2 ctrl={__ctrl} />

      <SubscriptionsSection3 ctrl={__ctrl} />

      <SubscriptionsSection4 ctrl={__ctrl} />

      {/* ── MODAL 3: CREATE NEW SUBSCRIPTION (3 OPTIONS + CUSTOM ENTRY) ── */}
      <AnimatePresence>
        <SubscriptionsSection1 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── MODAL 4: CLIENT SUBSCRIPTION & BILLING LEDGER MODAL ── */}
      <ClientSubscriptionLedgerModal
        isOpen={Boolean(selectedLedgerClient)}
        clientName={selectedLedgerClient}
        clientEmail={selectedLedgerEmail}
        subscriptions={subscriptions}
        onClose={() => {
          setSelectedLedgerClient(null)
          setSelectedLedgerEmail(undefined)
        }}
        onGenerateInvoice={handleGenerateSubscriptionInvoice}
        onRenewSubscription={(sub) => setRenewingSubscription(sub)}
        onViewInvoice={(inv) => setSelectedViewInvoice(inv)}
        onOpenCreateSub={(cName) => {
          setNewClientName(cName)
          setIsCustomClient(false)
          setIsAddSubModalOpen(true)
        }}
      />

      {/* ── MODAL 5: OFFICIAL TAX INVOICE PREVIEW / PRINT MODAL ── */}
      <InvoiceModal
        isOpen={Boolean(selectedViewInvoice)}
        invoice={selectedViewInvoice}
        onClose={() => setSelectedViewInvoice(null)}
      />

      {/* ── MODAL 6: MODIFY / EDIT SUBSCRIPTION CONTRACT MODAL ── */}
      <EditSubscriptionModal
        isOpen={Boolean(editingSubscription)}
        subscription={editingSubscription}
        teamMembers={teamMembers}
        onClose={() => setEditingSubscription(null)}
        onSave={handleEditSubscriptionSave}
      />

    </motion.div>
  )
}
