"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, ArrowRight, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, CheckCircle2,
  Download, Calculator, Clock, Check, AlertCircle, Eye, RefreshCw
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { QuotationService } from "@/services/salesService"
import { getClients, saveStoredClient } from "@/features/clients/services/clientService"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { OfficialQuotationDocument, QuotationData, QuotationLineItem } from "./components/OfficialQuotationDocument"
import { sendQuotationDetailsEmailNotification } from "@/services/emailNotificationService"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { formatDisplayDate } from "@/lib/utils"
import { QuotationsSection1 } from "@/features/quotations/components/quotations-sections/QuotationsSection1"
import { QuotationsSection2 } from "@/features/quotations/components/quotations-sections/QuotationsSection2"
import { QuotationsSection3 } from "@/features/quotations/components/quotations-sections/QuotationsSection3"
import { QuotationsSection4 } from "@/features/quotations/components/quotations-sections/QuotationsSection4"
import { createQuotationsHandler1 } from "@/features/quotations/hooks/quotations-hooks/createQuotationsHandler1.hooks"
import { createQuotationsHandler2 } from "@/features/quotations/hooks/quotations-hooks/createQuotationsHandler2.hooks"
import { createQuotationsHandler3 } from "@/features/quotations/hooks/quotations-hooks/createQuotationsHandler3.hooks"


export default function QuotationsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches, companies } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  
  const isClientUser = user?.role === "Clients" || user?.role?.toLowerCase().includes("client")
  const canAdd = !isClientUser && (canPerformAction(user, "Quotations", "add") || user?.role === "Super Admin")
  const canEdit = !isClientUser && (canPerformAction(user, "Quotations", "edit") || user?.role === "Super Admin")
  const canDelete = !isClientUser && (canPerformAction(user, "Quotations", "delete") || user?.role === "Super Admin")

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0]

  const [quotations, setQuotations] = React.useState<QuotationData[]>([])
  const [clients, setClients] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [disciplineFilter, setDisciplineFilter] = React.useState<"all" | "software" | "marketing">("all")

  // Modals
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isStudioOpen, setIsStudioOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<QuotationData | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<QuotationData | null>(null)
  const [viewingItem, setViewingItem] = React.useState<QuotationData | null>(null)
  const [sendingItem, setSendingItem] = React.useState<QuotationData | null>(null)
  const [sendEmail, setSendEmail] = React.useState("")
  const [sendMessage, setSendMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)

  // Estimate Studio from Quotation
  const [isEstimateStudioOpen, setIsEstimateStudioOpen] = React.useState(false)
  const [estimateInitialData, setEstimateInitialData] = React.useState<any>(null)

  // Form state
  const [recipientMode, setRecipientMode] = React.useState<"client" | "custom">("client")
  const [selectedClientId, setSelectedClientId] = React.useState("")
  const [formBranchId, setFormBranchId] = React.useState(user?.branchId || activeBranchId || "")
  
  const [form, setForm] = React.useState({ 
    number: "", 
    customer: "", 
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    clientGstin: "",
    date: "", 
    validTill: "",
    notes: "Thank you for your business interest. Looking forward to your approval.",
    terms: "1. Quotation valid for 30 calendar days from date of issue.\n2. 50% mobilization advance required before commencement.\n3. Applicable GST 18% billed as per statutory norms.",
    status: "Draft" 
  })
  
  const [items, setItems] = React.useState<QuotationLineItem[]>([
    { id: "1", name: "Custom Software Architecture & Development", description: "Full-stack enterprise application engineering", sac: "998311", quantity: 1, unitPrice: 75000, total: 75000 },
    { id: "2", name: "UI/UX Experience Design & Wireframing", description: "Design systems, interactive prototypes", sac: "998311", quantity: 1, unitPrice: 35000, total: 35000 }
  ])

  const loadData = React.useCallback(async () => {
    try { 
      const { fetchModuleDataFromDB } = await import("@/lib/storageSync")
      const [qData, appQuotes, cData] = await Promise.all([
        QuotationService.getAll({}).catch(() => []),
        fetchModuleDataFromDB<any[]>("quotations", [], "all").catch(() => []),
        getClients(activeCompanyId || "all").catch(() => [])
      ])

      const map = new Map<string, any>()
      // First populate from app_data
      if (Array.isArray(appQuotes)) {
        for (const item of appQuotes) {
          if (item && (item.id || item.number || item.quotation_number)) {
            const key = String(item.number || item.quotation_number || item.id).toLowerCase().trim()
            map.set(key, item)
          }
        }
      }
      // Then merge from backend REST API
      if (Array.isArray(qData)) {
        for (const item of qData) {
          if (item && (item.id || item.number || item.quotation_number)) {
            const key = String(item.number || item.quotation_number || item.id).toLowerCase().trim()
            map.set(key, { ...map.get(key), ...item })
          }
        }
      }

      const combinedRaw = Array.from(map.values())
      
      let list: QuotationData[] = combinedRaw.map((q: any) => ({
        ...q,
        id: String(q.id || q.number),
        number: q.number || q.quotation_number || `QT-${q.id}`,
        customer: q.customer || q.customer_name || q.client || "Client",
        customerEmail: q.customerEmail || q.customer_email || "",
        customerPhone: q.customerPhone || q.customer_phone || "",
        customerAddress: q.customerAddress || q.customer_address || "",
        total: Number(q.total || q.totalAmount) || 0,
        subtotal: Number(q.subtotal) || 0,
        tax: Number(q.tax || q.tax_amount) || 0,
        date: q.date || (q.created_at ? new Date(q.created_at).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB")),
        validTill: q.validTill || q.valid_till || "",
        status: q.status || "Draft",
        companyId: q.companyId || (q.company_id === "1" ? "tech" : (q.company_id === "2" ? "consultancy" : q.company_id)) || "tech",
        deliverables: (Array.isArray(q.deliverables) && q.deliverables.length > 0) 
          ? q.deliverables 
          : (Array.isArray(q.items) && q.items.length > 0 
              ? q.items.map((it: any, idx: number) => ({
                  id: it.id || `mod_${idx + 1}`,
                  title: it.name || it.serviceName || `Module ${idx + 1}`,
                  description: it.description || "",
                  duration: it.deliverableTime || it.duration || "1-2 Weeks",
                }))
              : []),
        items: (q.items && q.items.length > 0) ? q.items : [{ id: "1", name: q.title || "", description: q.description || "", quantity: 1, unitPrice: Number(q.total) || 0, total: Number(q.total) || 0 }]
      }))

      setQuotations(list)
      setClients(Array.isArray(cData) ? cData : [])
    } catch (err) { 
      console.warn("Quotation load warning:", err)
    }
  }, [activeCompanyId])

  const loadDataRef = React.useRef(loadData)
  React.useEffect(() => {
    loadDataRef.current = loadData
  }, [loadData])

  React.useEffect(() => {
    loadDataRef.current()
    let reloadTimer: any = null
    const handleReload = () => {
      if (reloadTimer) clearTimeout(reloadTimer)
      reloadTimer = setTimeout(() => {
        loadDataRef.current()
      }, 120)
    }
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    window.addEventListener("saampark_data_synced", handleReload)
    return () => {
      if (reloadTimer) clearTimeout(reloadTimer)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
      window.removeEventListener("saampark_data_synced", handleReload)
    }
  }, [activeCompanyId])

  const filtered = React.useMemo(() => {
    const { activeCompanyId: freshComp, activeBranchId: freshBranch, activeSubBranchId: freshSubBranch, branches: freshBranches, subBranches: freshSubBranches } = useAuthStore.getState()
    const userComp = (freshComp || user?.companyId || "").toLowerCase().trim()
    const targetBranch = freshBranch
    const branchObj = (freshBranches || []).find(b => 
      String(b.id) === String(targetBranch) || 
      String(b.name || "").toLowerCase() === String(targetBranch || "").toLowerCase()
    )
    const targetBranchId = String(branchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = branchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = freshSubBranch
    const subBranchObj = (freshSubBranches || []).find(sb => 
      String(sb.id) === String(targetSubBranch) || 
      String(sb.name || "").toLowerCase() === String(targetSubBranch || "").toLowerCase()
    )
    const targetSubBranchId = String(subBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = subBranchObj?.name?.toLowerCase().trim() || ""

    const result = quotations.filter(q => {
      // 1. Client Scoping: Client users strictly see all quotations created for them across their company (bypassing internal branch filter)
      if (isClientUser) {
        if (!isRecordAssignedToClient(q, user)) return false
        if (statusFilter !== "all" && q.status !== statusFilter) return false
        return q.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (q.customerEmail && q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // 2. Team Member Scoping: Team members only see quotations they created, are assigned to, or for their projects
      if (user?.role === "Teams" || (user?.role as string) === "Team") {
        if (!isRecordAssignedToTeamMember(q, user)) return false
      }

      // Company filter
      if (userComp && userComp !== "all") {
        const qCompRaw = String(q.companyId || (q as any).company_id || "").toLowerCase().trim()
        const normQComp = qCompRaw === "1" ? "tech" : (qCompRaw === "2" ? "consultancy" : qCompRaw)
        const normUserComp = userComp === "1" ? "tech" : (userComp === "2" ? "consultancy" : userComp)
        if (normQComp && normQComp !== normUserComp) return false
        if (!normQComp && normUserComp !== "tech") return false
      }
      // Branch filter (strict)
      if (targetBranch && targetBranch !== "all" && targetBranch !== "hq" && targetBranch !== "main" && targetBranchId !== "main" && targetBranchId !== "hq") {
        const qBranch = String((q as any).branchId || "").toLowerCase().trim()
        if (!qBranch) return false
        const match = qBranch === targetBranchId || (targetBranchName && qBranch === targetBranchName)
        if (!match) return false
      }
      // Sub-Branch filter (strict)
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "hq" && targetSubBranch !== "main" && targetSubBranchId !== "main" && targetSubBranchId !== "hq") {
        const qSub = String((q as any).subBranchId || "").toLowerCase().trim()
        if (!qSub) return false
        const match = qSub === targetSubBranchId || (targetSubBranchName && qSub === targetSubBranchName)
        if (!match) return false
      }
      // Discipline separation filter (Software vs Digital Marketing Retainer)
      const isMarketingQuote = (q as any).category === "Digital Marketing" || Boolean((q as any).marketingPackage?.enabled) || String((q as any).companyId).toLowerCase().includes("consult")
      if (disciplineFilter === "software" && isMarketingQuote) return false
      if (disciplineFilter === "marketing" && !isMarketingQuote) return false

      // Search + status filter
      if (statusFilter !== "all" && q.status !== statusFilter) return false
      const match = q.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.customerEmail && q.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      return match
    })

    // Newly created quotations on top
    result.sort((a, b) => {
      const timeA = new Date((a as any).date || (a as any).createdAt || 0).getTime()
      const timeB = new Date((b as any).date || (b as any).createdAt || 0).getTime()
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
    })

    return result
  }, [quotations, activeCompanyId, activeBranchId, branches, searchQuery, statusFilter, disciplineFilter, user, isClientUser])

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) * Number(i.unitPrice)), 0)
  const tax = Math.round(subtotal * 0.18)
  const grandTotal = subtotal + tax

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      if (field === "quantity" || field === "unitPrice") {
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0)
      }
      return updated
    }))
  }

  const addItem = () => setItems([...items, { id: String(Date.now()), name: "", description: "", sac: "998311", quantity: 1, unitPrice: 0, total: 0 }])
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const selected = clients.find(c => String(c.id) === clientId)
    if (selected) {
      setForm(prev => ({
        ...prev,
        customer: selected.company_name || selected.primaryContact || selected.name || "Valued Client",
        customerEmail: selected.email || "",
        customerPhone: selected.phone || "",
        customerAddress: selected.address || (selected.city ? `${selected.city}, ${selected.state || ''}` : ""),
        clientGstin: selected.gstin || "",
      }))
    }
  }

  const openAddModal = () => { 
    setEditingItem(null)
    setRecipientMode("client")
    setSelectedClientId("")
    setFormBranchId(user?.branchId || activeBranchId || "")
    setForm({ 
      number: `QT-${Date.now().toString().slice(-6)}`, 
      customer: "", 
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      clientGstin: "",
      date: new Date().toISOString().split("T")[0], 
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      notes: "Thank you for your business interest. Looking forward to your approval.",
      terms: "1. Quotation valid for 30 calendar days.\n2. 50% advance required before work begins.\n3. GST 18% as applicable.",
      status: "Draft" 
    })
    setItems([
      { id: "1", name: "", description: "", sac: "998311", quantity: 1, unitPrice: 0, total: 0 }
    ])
    setIsModalOpen(true)
  }

  const openEditModal = (item: QuotationData) => {
    setEditingItem(item)
    setRecipientMode("custom")
    setFormBranchId(item.branchId || "")
    setForm({
      number: item.number,
      customer: item.customer,
      customerEmail: item.customerEmail || "",
      customerPhone: item.customerPhone || "",
      customerAddress: item.customerAddress || "",
      clientGstin: item.clientGstin || "",
      date: item.date,
      validTill: item.validTill || "",
      notes: item.notes || "",
      terms: item.terms || "",
      status: item.status
    })
    setItems(item.items && item.items.length > 0 ? item.items : [{ id: "1", name: item.customer, quantity: 1, unitPrice: item.total, total: item.total }])
    setIsModalOpen(true)
  }

  const handleSubmit: any = createQuotationsHandler1(() => __ctrlRef.current);

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const secondConfirm = window.confirm(
      `⚠️ 2nd CONFIRMATION REQUIRED:\n\nAre you ABSOLUTELY sure you want to permanently delete quotation "${deleteConfirm.number}"?\n\nThis action cannot be undone.`
    )
    if (!secondConfirm) return

    await executeWithFeedback(async () => {
      await QuotationService.delete(deleteConfirm.id).catch(() => {})
      setQuotations(prev => prev.filter(q => q.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Quotation...",
      loadingMsg: `Removing ${deleteConfirm.number}...`,
      successTitle: "Quotation Deleted",
      successMsg: `Quotation ${deleteConfirm.number} removed.`,
    })
  }

  const [modifyingItem, setModifyingItem] = React.useState<QuotationData | null>(null)
  const [modifyNotes, setModifyNotes] = React.useState("")
  const [decliningItem, setDecliningItem] = React.useState<QuotationData | null>(null)
  const [declineReason, setDeclineReason] = React.useState("")

  const handleAcceptQuotation = async (quotation: QuotationData) => {
    const updated: QuotationData = {
      ...quotation,
      status: "Accepted",
      clientAccepted: true,
      acceptedAt: Date.now(),
      acceptedBy: quotation.customer || user?.name || "Client",
    }
    await QuotationService.update(quotation.id, updated).catch(() => {})
    setQuotations(prev => prev.map(q => q.id === quotation.id ? updated : q))
    if (viewingItem && viewingItem.id === quotation.id) {
      setViewingItem(updated)
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    }
  }

  const handleDeclineQuotation = async (quotation: QuotationData, reason?: string) => {
    const updated: QuotationData = {
      ...quotation,
      status: "Declined",
      clientAccepted: false,
      declinedAt: Date.now(),
      declinedBy: quotation.customer || user?.name || "Client",
      declineReason: reason || declineReason || "Declined by client",
    } as any
    await QuotationService.update(quotation.id, updated).catch(() => {})
    setQuotations(prev => prev.map(q => q.id === quotation.id ? updated : q))
    if (viewingItem && viewingItem.id === quotation.id) {
      setViewingItem(updated)
    }
    setDecliningItem(null)
    setDeclineReason("")
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    }
  }

  const handleRequestModifyQuotation = async (quotation: QuotationData, note: string) => {
    const updated: QuotationData = {
      ...quotation,
      status: "Modification Requested",
      clientNotes: note || "Client requested modifications.",
      requestedModifyAt: Date.now(),
      requestedModifyBy: quotation.customer || user?.name || "Client",
    } as any
    await QuotationService.update(quotation.id, updated).catch(() => {})
    setQuotations(prev => prev.map(q => q.id === quotation.id ? updated : q))
    if (viewingItem && viewingItem.id === quotation.id) {
      setViewingItem(updated)
    }
    setModifyingItem(null)
    setModifyNotes("")
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    }
  }

  const handleSendQuotation = async () => {
    if (!sendingItem || !sendEmail.trim()) {
      alert("Please specify a valid recipient email.")
      return
    }
    setIsSending(true)
    try {
      await executeWithFeedback(async () => {
        const updated: QuotationData = {
          ...sendingItem,
          customerEmail: sendEmail.trim(),
          status: "Sent" as const,
        }
        await QuotationService.update(sendingItem.id, updated).catch(() => {})
        setQuotations(prev => prev.map(q => q.id === sendingItem.id ? updated : q))

        await sendQuotationDetailsEmailNotification(
          { ...sendingItem, customerEmail: sendEmail.trim() },
          sendEmail.trim()
        )

        setSendingItem(null)
      }, {
        actionType: "sync",
        loadingTitle: "Dispatching Price Quotation...",
        loadingMsg: `Sending formal quotation #${sendingItem.number} with action buttons to ${sendEmail.trim()}...`,
        successTitle: "Quotation Delivered Successfully!",
        successMsg: `Quotation #${sendingItem.number} has been dispatched to client's email inbox.`,
        minLoadingMs: 650,
      })
    } catch (err) {
      console.error("Error sending quotation:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleConvertToInvoice: any = createQuotationsHandler2(() => __ctrlRef.current);

  const handleConvertToClient: any = createQuotationsHandler3(() => __ctrlRef.current);

  const handleCreateEstimateFromQuote = (quotation: QuotationData) => {
    setEstimateInitialData({
      customer: quotation.customer,
      clientName: quotation.customer,
      clientEmail: quotation.customerEmail,
      clientPhone: quotation.customerPhone,
      clientAddress: quotation.customerAddress,
      clientGst: quotation.clientGstin,
      projectTitle: `Estimate for ${quotation.customer} (${quotation.number})`,
      companyId: quotation.companyId || activeCompanyId || "tech",
      branchId: quotation.branchId,
      items: (quotation.items || []).map(it => ({
        id: `est_it_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        serviceName: it.name,
        sacCode: it.sac || "998313",
        qty: it.quantity || 1,
        unit: "Project",
        rate: it.unitPrice || 0,
        gstRate: 18,
        gstAmount: Math.round(((it.unitPrice || 0) * (it.quantity || 1)) * 0.18),
        totalAmount: Math.round(((it.unitPrice || 0) * (it.quantity || 1)) * 1.18),
      })),
      notes: quotation.notes || "Commercial estimate prepared for project execution.",
      terms: quotation.terms || "1. Estimate valid for 30 calendar days.\n2. Scope changes subject to re-estimation.",
    })
    setIsEstimateStudioOpen(true)
  }

  const totalPipeline = filtered.reduce((acc, q) => acc + (q.total || 0), 0)

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, companies, canPerformAction, isClientUser, canAdd, canEdit, canDelete, activeCompany, quotations, setQuotations, clients, setClients, searchQuery, setSearchQuery, statusFilter, setStatusFilter, disciplineFilter, setDisciplineFilter, isModalOpen, setIsModalOpen, isStudioOpen, setIsStudioOpen, editingItem, setEditingItem, deleteConfirm, setDeleteConfirm, viewingItem, setViewingItem, sendingItem, setSendingItem, sendEmail, setSendEmail, sendMessage, setSendMessage, isSending, setIsSending, isEstimateStudioOpen, setIsEstimateStudioOpen, estimateInitialData, setEstimateInitialData, recipientMode, setRecipientMode, selectedClientId, setSelectedClientId, formBranchId, setFormBranchId, form, setForm, items, setItems, loadData, loadDataRef, filtered, subtotal, tax, grandTotal, handleItemChange, addItem, removeItem, handleClientSelect, openAddModal, openEditModal, handleSubmit, handleDelete, modifyingItem, setModifyingItem, modifyNotes, setModifyNotes, decliningItem, setDecliningItem, declineReason, setDeclineReason, handleAcceptQuotation, handleDeclineQuotation, handleRequestModifyQuotation, handleSendQuotation, handleConvertToInvoice, handleConvertToClient, handleCreateEstimateFromQuote, totalPipeline };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }} 
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      {/* ── DASHBOARD VIEW (COMPLETELY HIDDEN DURING PRINTING) ── */}
      <div className="print:hidden space-y-6">
        <QuotationsSection1 ctrl={__ctrl} />

      <QuotationsSection2 ctrl={__ctrl} />
      </div>

      <QuotationsSection3 ctrl={__ctrl} />

      <QuotationsSection4 ctrl={__ctrl} />
    </motion.div>
  )
}
