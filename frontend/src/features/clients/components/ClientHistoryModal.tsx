"use client"

import * as React from "react"
import { 
  X, Briefcase, FileText, CheckCircle2, Clock, Calendar, AlertCircle, 
  Eye, FolderPlus, Building2, Mail, Phone, MapPin, CreditCard, ShoppingBag,
  User, Receipt, Shield, Tag, DollarSign, Trash2
} from "lucide-react"
import { ClientItem } from "../types"
import { formatDisplayEmail } from "../services/clientService"
import { getProjects, deleteProject } from "@/features/projects/services/projectService"
import { Project } from "@/features/projects/types"
import { getInvoices, deleteInvoice, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getPayments, deletePayment, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { ClientHistoryModalSection1 } from "@/features/clients/components/clienthistorymodal-sections/ClientHistoryModalSection1"
import { ClientHistoryModalSection2 } from "@/features/clients/components/clienthistorymodal-sections/ClientHistoryModalSection2"


import { type ClientHistoryModalProps } from "@/features/clients/components/clienthistorymodal-sections/ClientHistoryModalHelpers"
export * from "@/features/clients/components/clienthistorymodal-sections/ClientHistoryModalHelpers"

export function ClientHistoryModal({
  isOpen,
  client,
  onClose,
  onSelectInvoice,
  onAddProjectForClient,
}: ClientHistoryModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const isSuperAdmin = user?.role === "Super Admin"
  const canDeleteProjects = isSuperAdmin || (user?.role === "Admin" && canPerformAction(user, "Projects", "delete"))
  const canDeleteInvoices = isSuperAdmin || (user?.role === "Admin" && (canPerformAction(user, "Sales", "delete") || canPerformAction(user, "Invoices", "delete")))
  const canDeleteOrders = isSuperAdmin || (user?.role === "Admin" && (canPerformAction(user, "Sales", "delete") || canPerformAction(user, "Orders", "delete")))
  const canDeletePayments = isSuperAdmin || (user?.role === "Admin" && (canPerformAction(user, "Sales", "delete") || canPerformAction(user, "Payments", "delete")))

  const [activeTab, setActiveTab] = React.useState<"projects" | "invoices" | "orders" | "payments">("projects")
  const [clientProjects, setClientProjects] = React.useState<Project[]>([])
  const [clientInvoices, setClientInvoices] = React.useState<InvoiceItem[]>([])
  const [clientOrders, setClientOrders] = React.useState<any[]>([])
  const [clientPayments, setClientPayments] = React.useState<PaymentItem[]>([])
  const [isLoading, setIsLoading] = React.useState(false)

  const loadHistory = React.useCallback(async () => {
    if (!client) return
    setIsLoading(true)
    const cId = (client.id || "").toLowerCase().trim()
    const cName = (client.name || "").toLowerCase().trim()
    const cEmail = (client.email || "").toLowerCase().trim()
    const cPrimary = (client.primaryContact || "").toLowerCase().trim()

    // Helper: strict matching - clientId exact > email exact > name exact (NO substring fuzzy matching)
    const matchesClient = (recordClientId: string, recordClient: string, recordEmail: string) => {
      if (cId && recordClientId && recordClientId === cId) return true
      if (cEmail && recordEmail && recordEmail === cEmail) return true
      if (cName && recordClient && recordClient === cName) return true
      if (cPrimary && recordClient && recordClient === cPrimary) return true
      return false
    }

    try {
      const [allProjects, allInvoices, allOrdersRaw, allPayments] = await Promise.all([
        getProjects("all").catch(() => []),
        getInvoices("all").catch(() => []),
        fetchModuleDataFromDB<any[]>("orders", [], "all").catch(() => []),
        getPayments("all").catch(() => []),
      ])
      const allOrders = Array.isArray(allOrdersRaw) ? filterGlobalDeletedItems(allOrdersRaw) : []

      // Pass 1: Direct matches
      let filteredProj = allProjects.filter((p) => {
        const pClient = (p.client || "").toLowerCase().trim()
        const pClientId = String(p.clientId || "").toLowerCase().trim()
        const pEmail = ((p as any).clientEmail || (p as any).createdByEmail || "").toLowerCase().trim()
        return matchesClient(pClientId, pClient, pEmail)
      })

      let filteredInv = allInvoices.filter((i) => {
        const iClient = (i.client || "").toLowerCase().trim()
        const iEmail = (i.clientEmail || "").toLowerCase().trim()
        const iClientId = String((i as any).clientId || "").toLowerCase().trim()
        return matchesClient(iClientId, iClient, iEmail)
      })

      // Pass 2: Bidirectional cross-linking by project title
      const initialProjTitles = new Set(filteredProj.map(p => (p.title || "").toLowerCase().trim()).filter(Boolean))

      // Expand invoices using direct matched project titles
      filteredInv = allInvoices.filter((i) => {
        const iClient = (i.client || "").toLowerCase().trim()
        const iEmail = (i.clientEmail || "").toLowerCase().trim()
        const iClientId = String((i as any).clientId || "").toLowerCase().trim()
        const iProject = (i.project || "").toLowerCase().trim()
        return (
          matchesClient(iClientId, iClient, iEmail) ||
          (iProject && initialProjTitles.has(iProject))
        )
      })

      const expandedInvTitles = new Set(filteredInv.map(i => (i.project || "").toLowerCase().trim()).filter(Boolean))

      // Expand projects using matched invoice project titles
      filteredProj = allProjects.filter((p) => {
        const pClient = (p.client || "").toLowerCase().trim()
        const pClientId = String(p.clientId || "").toLowerCase().trim()
        const pEmail = ((p as any).clientEmail || (p as any).createdByEmail || "").toLowerCase().trim()
        const pTitle = (p.title || "").toLowerCase().trim()
        return (
          matchesClient(pClientId, pClient, pEmail) ||
          (pTitle && expandedInvTitles.has(pTitle))
        )
      })

      const allMatchedProjectTitles = new Set([
        ...filteredProj.map(p => (p.title || "").toLowerCase().trim()).filter(Boolean),
        ...expandedInvTitles
      ])

      const filteredOrd = allOrders.filter((o) => {
        const oClient = (o.client || "").toLowerCase().trim()
        const oEmail = (o.clientEmail || "").toLowerCase().trim()
        const oClientId = String(o.clientId || "").toLowerCase().trim()
        const oProject = (o.project || "").toLowerCase().trim()
        const oInvId = (o.invoiceId || "").toLowerCase().trim()
        return (
          matchesClient(oClientId, oClient, oEmail) ||
          (oProject && allMatchedProjectTitles.has(oProject)) ||
          (oInvId && filteredInv.some(i => i.id.toLowerCase().trim() === oInvId))
        )
      })

      const filteredPay = allPayments.filter((pay) => {
        const payClient = (pay.client || "").toLowerCase().trim()
        const payEmail = (pay.clientEmail || "").toLowerCase().trim()
        const payProj = (pay.project || "").toLowerCase().trim()
        const payInvId = (pay.invoiceId || "").toLowerCase().trim()
        return (
          matchesClient("", payClient, payEmail) ||
          (payProj && allMatchedProjectTitles.has(payProj)) ||
          (payInvId && filteredInv.some(i => i.id.toLowerCase().trim() === payInvId))
        )
      })


      setClientProjects(filteredProj)
      setClientInvoices(filteredInv)
      setClientOrders(filteredOrd)
      setClientPayments(filteredPay)

    } finally {
      setIsLoading(false)
    }
  }, [client])

  React.useEffect(() => {
    if (isOpen && client) {
      loadHistory()
      window.addEventListener("saampark_data_synced", loadHistory)
      window.addEventListener("saampark_projects_updated", loadHistory)
      window.addEventListener("saampark_payments_updated", loadHistory)
      return () => {
        window.removeEventListener("saampark_data_synced", loadHistory)
        window.removeEventListener("saampark_projects_updated", loadHistory)
        window.removeEventListener("saampark_payments_updated", loadHistory)
      }
    }
  }, [isOpen, client, loadHistory])


  if (!isOpen || !client) return null

  // Delete handlers with permissions
  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (await confirmTwoStepDelete(projectTitle, "project")) {
      await deleteProject(projectId)
      loadHistory()
    }
  }

  const handleDeleteInvoice = async (invId: string) => {
    if (await confirmTwoStepDelete(invId, "invoice")) {
      await deleteInvoice(invId)
      loadHistory()
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (await confirmTwoStepDelete(orderId, "order")) {
      await markGlobalItemDeleted(String(orderId), "orders")
      const currentOrders = await fetchModuleDataFromDB<any[]>("orders", [])
      const updated = currentOrders.filter(o => String(o.id) !== String(orderId) && String(o.orderNumber) !== String(orderId))
      await saveModuleDataToDB("orders", updated)
      loadHistory()
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (await confirmTwoStepDelete(paymentId, "payment")) {
      await deletePayment(paymentId)
      loadHistory()
    }
  }

  // Calculate live financial numbers purely from active client records
  const calculatedInvoiced = clientInvoices.reduce((acc, inv) => {
    return acc + (parseInt((inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)

  const calculatedPaid = clientPayments.length > 0
    ? clientPayments.reduce((acc, pay) => {
        if (pay.status === "Failed" || pay.status === "Pending") return acc
        return acc + (pay.amountNum || parseInt((pay.amount || "0").replace(/[^0-9]/g, "")) || 0)
      }, 0)
    : clientInvoices.reduce((acc, inv) => {
        return acc + (parseInt((inv.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0)
      }, 0)

  const calculatedDue = Math.max(0, calculatedInvoiced - calculatedPaid)

  const displayInvoiced = `₹${calculatedInvoiced.toLocaleString("en-IN")}`
  const displayPaid = `₹${calculatedPaid.toLocaleString("en-IN")}`
  const displayDue = `₹${calculatedDue.toLocaleString("en-IN")}`

  
  __ctrl = { isOpen, client, onClose, onSelectInvoice, onAddProjectForClient, user, canPerformAction, isSuperAdmin, canDeleteProjects, canDeleteInvoices, canDeleteOrders, canDeletePayments, activeTab, setActiveTab, clientProjects, setClientProjects, clientInvoices, setClientInvoices, clientOrders, setClientOrders, clientPayments, setClientPayments, isLoading, setIsLoading, loadHistory, handleDeleteProject, handleDeleteInvoice, handleDeleteOrder, handleDeletePayment, calculatedInvoiced, calculatedPaid, calculatedDue, displayInvoiced, displayPaid, displayDue };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        <ClientHistoryModalSection1 ctrl={__ctrl} />
        <ClientHistoryModalSection2 ctrl={__ctrl} />
      </div>
    </div>
  )
}
