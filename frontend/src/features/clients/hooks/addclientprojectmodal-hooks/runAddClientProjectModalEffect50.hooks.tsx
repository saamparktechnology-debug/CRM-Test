"use client"

import * as React from "react"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt
} from "lucide-react"
import { useRouter } from "next/navigation"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice, getInvoices, generateInvoiceNumber, InvoiceLineItem, AppliedDiscount } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { addPayment } from "@/features/payments/services/paymentService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients, formatDisplayEmail } from "@/features/clients/services/clientService"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } from "@/services/emailNotificationService"
import { lookupPincode } from "@/lib/pincodeService"
import { AddClientProjectModalSection1 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection1"
import { AddClientProjectModalSection2 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection2"
import { AddClientProjectModalSection3 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection3"
import { AddClientProjectModalSection4 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection4"
import { AddClientProjectModalSection5 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection5"
import { AddClientProjectModalSection6 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection6"
import { AddClientProjectModalSection7 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection7"
import { type AddClientProjectModalProps, type ServiceFormItem, type FormDiscountItem, type AssignedMemberAllocation, SERVICE_PRESETS } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalHelpers"
import { createAddClientProjectModalAction20 } from "@/features/clients/hooks/addclientprojectmodal-hooks/createAddClientProjectModalAction20.hooks"

export function runAddClientProjectModalEffect50(getCtrl: () => any) {
  const { isOpen, setAllAvailableClients, client, setSelectedClient, setClientEmail, setClientPhone, setClientAddress, setClientCity, setClientState, setClientGst, setSelectedCompanyId, activeCompanyId, user, setSelectedBranchId, activeBranchId, setSelectedSubBranchId, setCreationMode, initialMode, setProjectTitle, setCategory, setCustomCategory, setIsCustomCategory, setAssignedAllocations, setDescription, setStartDate, setDeadline, setIsTeamDropdownOpen, setTeamSearchQuery, setIsClientSearchDropdownOpen, setClientSearchText, setServiceItems, setDiscountsList, setAdvanceAmount, setPartInitialPayment, setPaymentModel, setInstallmentsCount, setSubscriptionMonths, setPartPayTiming, setBillingCycle, setAutoCreateSubscription, setPaymentStatus, setBilledByAdmin, setAdminsList, setTeamsList, billedByAdmin, assignedAllocations } = getCtrl();
  const __fn: any = () => {
    if (isOpen) {
      getClients().then((cls) => {
        setAllAvailableClients(cls || [])
        let currentC = client
        if (!currentC && cls && cls.length > 0) {
          currentC = cls[0]
        }
        if (currentC) {
          setSelectedClient(currentC)
          setClientEmail(formatDisplayEmail(currentC.email) || "")
          setClientPhone(currentC.phone || "")
          setClientAddress(currentC.address || "")
          setClientCity(currentC.city || "")
          setClientState(currentC.state || "")
          setClientGst(currentC.gstNumber || currentC.vatNumber || "")
        }
      }).catch(() => {})

      setSelectedCompanyId(activeCompanyId || user?.companyId || "tech")
      setSelectedBranchId(activeBranchId || user?.branchId || "")
      setSelectedSubBranchId("")
      setCreationMode(initialMode || "project_and_invoice")
      setProjectTitle("Website Development")
      setCategory("Website Development")
      setCustomCategory("")
      setIsCustomCategory(false)
      setAssignedAllocations([])
      setDescription("")
      setStartDate(new Date().toISOString().split("T")[0])
      const nextMonth = new Date()
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      setDeadline(nextMonth.toISOString().split("T")[0])
      setIsTeamDropdownOpen(false)
      setTeamSearchQuery("")
      setIsClientSearchDropdownOpen(false)
      setClientSearchText("")
      setServiceItems([
        {
          id: `svc_${Date.now()}`,
          serviceName: "",
          sacCode: "998313",
          qty: 1,
          unit: "Project",
          rate: "",
          charges: [],
          gstRate: 18,
        }
      ])
      setDiscountsList([])
      setAdvanceAmount("")
      setPartInitialPayment("")
      setPaymentModel("advance")
      setInstallmentsCount(3)
      setSubscriptionMonths(3)
      setPartPayTiming("pay_now")
      setBillingCycle("Monthly")
      setAutoCreateSubscription(true)
      setPaymentStatus("Paid")
      if (user?.name) {
        setBilledByAdmin(user.name)
      }
      getUsers("all").then((users) => {
        let admins = users
          .filter(u => (u.role === "Super Admin" || u.role === "Admin") && u.status !== "Inactive")
          .map(u => ({ id: u.id, name: u.name }))
        
        if (user?.name && !admins.some(a => a.name.toLowerCase().trim() === user.name.toLowerCase().trim())) {
          admins.unshift({ id: String(user.id || 'curr'), name: user.name })
        }

        const teams = users
          .filter(u => {
            const r = (u.role || "").toLowerCase().trim()
            return !r.includes("admin") && !r.includes("super") && !r.includes("client") && r !== "owner" && u.status !== "Inactive"
          })
          .map(u => ({ 
            id: String(u.id), 
            name: u.name, 
            email: u.email || "",
            role: u.department || u.role || "Developer",
            avatar: (u as any).avatar || (u as any).avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name}`
          }))

        setAdminsList(admins)
        setTeamsList(teams)

        if (!billedByAdmin && admins.length > 0) {
          setBilledByAdmin(user?.name || admins[0].name)
        }
        if (assignedAllocations.length === 0 && teams.length > 0) {
          setAssignedAllocations([
            {
              id: String(teams[0].id),
              name: teams[0].name,
              email: teams[0].email || "",
              role: teams[0].role || "Developer",
              avatar: teams[0].avatar,
              payoutType: "percentage",
              payoutValue: "",
            }
          ])
        }
      })
    }
  };
  return __fn();
}
