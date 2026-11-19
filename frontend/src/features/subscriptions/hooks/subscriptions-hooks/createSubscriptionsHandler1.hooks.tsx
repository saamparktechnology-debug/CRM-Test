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
} from "@/features/subscriptions/types"
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
} from "@/features/subscriptions/services/subscriptionService"
import { SubscriptionList } from "@/features/subscriptions/components/SubscriptionList"
import { RenewSubscriptionModal } from "@/features/subscriptions/components/RenewSubscriptionModal"
import { RenewReceiptModal, RenewReceiptData } from "@/features/subscriptions/components/RenewReceiptModal"
import { EditSubscriptionModal } from "@/features/subscriptions/components/EditSubscriptionModal"
import { ClientSubscriptionLedgerModal } from "@/features/subscriptions/components/ClientSubscriptionLedgerModal"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getClients } from "@/features/clients/services/clientService"
import { UserService } from "@/services/apiServices"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient } from "@/lib/clientScopeUtils"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"

export function createSubscriptionsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { newClientName, isCustomClient, customClientEmail, customClientPhone, customClientCompany, availableClients, teamMembers, assignedTeamMemberEmail, teamSharePctInput, selectedSubModelTab, isCustomPackage, customPackageName, customPackagePrice, customPackageCycle, customDeliverablesText, selectedPackageId, subTaxType, dailyLateFeeInput, activeCompanyId, showToast, regularPlanName, regularAmount, regularNextDate, regularStartDate, regularCycle, customDaysCount, emiPlanName, emiTotalAmount, emiDownPayment, emiTenureMonths, emiStartDate, setIsAddSubModalOpen, loadData } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()

    let clientName = newClientName
    let clientEmail = ""
    let clientPhone = ""
    let clientCompany = ""

    if (isCustomClient) {
      clientName = newClientName || "Custom Client"
      clientEmail = customClientEmail
      clientPhone = customClientPhone
      clientCompany = customClientCompany || clientName
    } else {
      const found = availableClients.find(c => c.name.toLowerCase().trim() === newClientName.toLowerCase().trim())
      clientEmail = found?.email || ""
      clientPhone = found?.phone || ""
      clientCompany = found?.company || clientName
    }

    if (!clientName.trim()) {
      alert("Please select or enter a client name.")
      return
    }

    const assignedMemberObj = teamMembers.find(m => m.email.toLowerCase() === assignedTeamMemberEmail.toLowerCase())
    const assignedMemberName = assignedMemberObj?.name
    const assignedMemberId = assignedMemberObj?.id
    const teamSharePercentage = typeof teamSharePctInput === "number" ? teamSharePctInput : 0

    // 1. Package Wise Subscription
    if (selectedSubModelTab === "package") {
      let planTitle = ""
      let numAmt = 0
      let cycle: BillingCycle = "Monthly"
      let deliverablesList: string[] = []

      if (isCustomPackage) {
        if (!customPackageName.trim()) {
          alert("Please enter a custom package title.")
          return
        }
        planTitle = customPackageName
        numAmt = parseInt(customPackagePrice.replace(/[^0-9]/g, "")) || 0
        cycle = customPackageCycle
        deliverablesList = customDeliverablesText.split("\n").map(s => s.trim()).filter(Boolean)
      } else {
        const pkg = PRESET_PACKAGE_TIERS.find(p => p.id === selectedPackageId) || PRESET_PACKAGE_TIERS[0]
        planTitle = pkg.name
        numAmt = pkg.price
        cycle = pkg.billingCycle
        deliverablesList = pkg.deliverables
      }

      const formattedAmount = `₹${numAmt.toLocaleString("en-IN")}`
      const startDate = new Date().toISOString().split("T")[0]
      const nextDate = calculateNextCycleDate(startDate, cycle)

      const isNonGst = subTaxType === "nongst"
      const dailyLateFee = typeof dailyLateFeeInput === "number" ? dailyLateFeeInput : 0

      await addSubscription({
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        planName: planTitle,
        status: "Active",
        amount: formattedAmount,
        numericAmount: numAmt,
        billingCycle: cycle,
        startDate,
        firstPaymentDate: startDate,
        firstPaymentAmount: numAmt,
        nextBillingDate: nextDate,
        autoRenew: true,
        subscriptionType: "package",
        deliverables: deliverablesList,
        isNonGst,
        taxType: subTaxType,
        gstRate: isNonGst ? 0 : 18,
        dailyLateFee,
        assignedMemberId,
        assignedMemberName,
        assignedMemberEmail: assignedTeamMemberEmail || undefined,
        assignedMembers: assignedTeamMemberEmail ? [assignedTeamMemberEmail] : [],
        teamSharePercentage,
      }, activeCompanyId || "tech")

      showToast(`✅ Package Subscription "${planTitle}" assigned to ${clientName}!`)
    }

    // 2. Regular Retainer Subscription
    else if (selectedSubModelTab === "regular") {
      if (!regularPlanName.trim()) {
        alert("Please enter plan title.")
        return
      }
      const numAmt = parseInt(regularAmount.replace(/[^0-9]/g, "")) || 0
      const formattedAmount = `₹${numAmt.toLocaleString("en-IN")}`
      const finalNextDate = regularNextDate || calculateNextCycleDate(regularStartDate, regularCycle, customDaysCount)
      const isNonGst = subTaxType === "nongst"
      const dailyLateFee = typeof dailyLateFeeInput === "number" ? dailyLateFeeInput : 0

      await addSubscription({
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        planName: regularPlanName,
        status: "Active",
        amount: formattedAmount,
        numericAmount: numAmt,
        billingCycle: regularCycle,
        customDaysCount: regularCycle === "Custom Days" ? customDaysCount : undefined,
        startDate: regularStartDate,
        firstPaymentDate: regularStartDate,
        firstPaymentAmount: numAmt,
        nextBillingDate: finalNextDate,
        autoRenew: true,
        subscriptionType: "regular",
        isNonGst,
        taxType: subTaxType,
        gstRate: isNonGst ? 0 : 18,
        dailyLateFee,
        assignedMemberId,
        assignedMemberName,
        assignedMemberEmail: assignedTeamMemberEmail || undefined,
        assignedMembers: assignedTeamMemberEmail ? [assignedTeamMemberEmail] : [],
        teamSharePercentage,
      }, activeCompanyId || "tech")

      showToast(`✅ Regular Subscription "${regularPlanName}" created for ${clientName}!`)
    }

    // 3. EMI Subscription
    else if (selectedSubModelTab === "emi") {
      if (!emiPlanName.trim()) {
        alert("Please enter subscription plan title.")
        return
      }
      const totalVal = parseInt(emiTotalAmount.replace(/[^0-9]/g, "")) || 0
      const downPay = parseInt(emiDownPayment.replace(/[^0-9]/g, "")) || 0
      const tenure = Math.max(1, emiTenureMonths)
      const balance = Math.max(0, totalVal - downPay)
      const monthlyEmi = Math.round(balance / tenure)
      const isNonGst = subTaxType === "nongst"
      const dailyLateFee = typeof dailyLateFeeInput === "number" ? dailyLateFeeInput : 0

      const formattedAmount = `₹${totalVal.toLocaleString("en-IN")}`
      const nextDate = calculateNextCycleDate(emiStartDate, "Monthly")

      await addSubscription({
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        planName: `${emiPlanName} (${tenure}M EMI)`,
        status: "Active",
        amount: formattedAmount,
        numericAmount: totalVal,
        billingCycle: "Monthly",
        startDate: emiStartDate,
        firstPaymentDate: emiStartDate,
        firstPaymentAmount: downPay > 0 ? downPay : monthlyEmi,
        nextBillingDate: nextDate,
        autoRenew: false,
        subscriptionType: "emi",
        totalTenureMonths: tenure,
        emiPerCycle: monthlyEmi,
        downPayment: downPay,
        paidInstallmentsCount: downPay > 0 ? 1 : 0,
        totalInstallmentsCount: tenure,
        isNonGst,
        taxType: subTaxType,
        gstRate: isNonGst ? 0 : 18,
        dailyLateFee,
        assignedMemberId,
        assignedMemberName,
        assignedMemberEmail: assignedTeamMemberEmail || undefined,
        assignedMembers: assignedTeamMemberEmail ? [assignedTeamMemberEmail] : [],
        teamSharePercentage,
      }, activeCompanyId || "tech")

      showToast(`✅ EMI Subscription (${tenure} Months @ ₹${monthlyEmi.toLocaleString("en-IN")}/mo) created for ${clientName}!`)
    }

    setIsAddSubModalOpen(false)
    loadData(false)
  };
    return __fn(...__args);
  };
}
