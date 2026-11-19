"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  FileText, Plus, Search, Edit, Trash2, X, Send, 
  Printer, UserCheck, Mail, Building2, Phone, Sparkles, ArrowRight,
  Calculator, Clock, CheckCircle2
} from "lucide-react"
import { useAuthStore, getCompanyFullName, getCompanyLogoUrl } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { EstimateService } from "@/services/salesService"
import { getClients } from "@/features/clients/services/clientService"
import { createNotification } from "@/services/notificationService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { sendEstimateDetailsEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayDate } from "@/lib/utils"
import { EstimatesSection1 } from "@/features/estimates/components/estimates-sections/EstimatesSection1"
import { EstimatesSection2 } from "@/features/estimates/components/estimates-sections/EstimatesSection2"
import { EstimatesSection3 } from "@/features/estimates/components/estimates-sections/EstimatesSection3"


import { type LineItem, type Estimate } from "@/features/estimates/components/estimates-sections/EstimatesHelpers"
export * from "@/features/estimates/components/estimates-sections/EstimatesHelpers"

export default function EstimatesMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches, companies } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  const isClientRole = user?.role === "Clients" || user?.role?.toLowerCase().includes("client")
  const canAdd = !isClientRole && canPerformAction(user, "Estimates", "add")
  const canEdit = !isClientRole && canPerformAction(user, "Estimates", "edit")
  const canDelete = !isClientRole && canPerformAction(user, "Estimates", "delete")

  const activeCompany = companies.find(c => c.id === activeCompanyId) || companies[0]
  const companyName = getCompanyFullName(activeCompany)
  const logoUrl = getCompanyLogoUrl(activeCompany)

  const [estimates, setEstimates] = React.useState<Estimate[]>([])
  const [clients, setClients] = React.useState<any[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Modals
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isStudioOpen, setIsStudioOpen] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<Estimate | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<Estimate | null>(null)
  const [viewingItem, setViewingItem] = React.useState<Estimate | null>(null)
  const [sendingItem, setSendingItem] = React.useState<Estimate | null>(null)
  const [sendEmail, setSendEmail] = React.useState("")
  const [sendMessage, setSendMessage] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)

  // Form state
  const [recipientMode, setRecipientMode] = React.useState<"client" | "custom">("client")
  const [selectedClientId, setSelectedClientId] = React.useState("")
  const [form, setForm] = React.useState({ 
    number: "", 
    customer: "", 
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    date: "", 
    validTill: "",
    notes: "Detailed project scope & commercial estimation.",
    terms: "1. Estimate valid for 30 calendar days.\n2. Scope changes subject to re-estimation.",
    status: "Draft" 
  })
  const [items, setItems] = React.useState<LineItem[]>([{ id: "1", name: "", quantity: 1, unitPrice: 0, total: 0 }])

  const loadData = React.useCallback(async () => {
    try { 
      const [eData, cData] = await Promise.all([
        EstimateService.getAll({}),
        getClients(activeCompanyId || "all").catch(() => [])
      ])
      setEstimates(Array.isArray(eData) ? eData : [])
      setClients(Array.isArray(cData) ? cData : [])
    } catch { }
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
    const branchObj = (freshBranches || []).find(b => b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase())
    const targetBranchId = String(branchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = branchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = freshSubBranch
    const subBranchObj = (freshSubBranches || []).find(sb => sb.id === targetSubBranch || sb.name.toLowerCase() === (targetSubBranch || "").toLowerCase())
    const targetSubBranchId = String(subBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = subBranchObj?.name?.toLowerCase().trim() || ""

    const result = estimates.filter(e => {
      // Company filter
      if (userComp && userComp !== "all") {
        const eComp = (e.companyId || "").toLowerCase().trim()
        if (eComp && eComp !== userComp) return false
        if (!eComp && userComp !== "tech") return false
      }
      // Branch filter (strict)
      if (targetBranch && targetBranch !== "all" && targetBranch !== "hq" && targetBranch !== "main" && targetBranchId !== "main" && targetBranchId !== "hq") {
        const eBranch = String((e as any).branchId || "").toLowerCase().trim()
        if (!eBranch) return false
        const match = eBranch === targetBranchId || (targetBranchName && eBranch === targetBranchName)
        if (!match) return false
      }
      // Sub-Branch filter (strict)
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "hq" && targetSubBranch !== "main" && targetSubBranchId !== "main" && targetSubBranchId !== "hq") {
        const eSub = String((e as any).subBranchId || "").toLowerCase().trim()
        if (!eSub) return false
        const match = eSub === targetSubBranchId || (targetSubBranchName && eSub === targetSubBranchName)
        if (!match) return false
      }
      // Search + status
      if (statusFilter !== "all" && e.status !== statusFilter) return false
      const match = e.number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.customerEmail && e.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()))
      return match
    })

    // Newly created estimates on top
    result.sort((a, b) => {
      const timeA = new Date((a as any).date || (a as any).createdAt || 0).getTime()
      const timeB = new Date((b as any).date || (b as any).createdAt || 0).getTime()
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
    })

    return result
  }, [estimates, activeCompanyId, activeBranchId, branches, searchQuery, statusFilter, user])

  const [taxScheme, setTaxScheme] = React.useState<"gst" | "nongst">("gst")
  const subtotal = items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0)
  const tax = taxScheme === "nongst" ? 0 : Math.round(subtotal * 0.18)
  const grandTotal = subtotal + tax

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(i => {
      if (i.id !== id) return i
      const updated = { ...i, [field]: value }
      if (field === "quantity" || field === "unitPrice") updated.total = (Number(updated.quantity) || 0) * (Number(updated.unitPrice) || 0)
      return updated
    }))
  }

  const addItem = () => setItems([...items, { id: String(Date.now()), name: "", quantity: 1, unitPrice: 0, total: 0 }])
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)) }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const selected = clients.find(c => String(c.id) === clientId)
    if (selected) {
      setForm(prev => ({
        ...prev,
        customer: selected.company_name || selected.primaryContact || "Valued Client",
        customerEmail: selected.email || "",
        customerPhone: selected.phone || "",
        customerAddress: selected.address || (selected.city ? `${selected.city}, ${selected.state || ''}` : ""),
      }))
    }
  }

  const openAddModal = () => { 
    setEditingItem(null)
    setTaxScheme("gst")
    setRecipientMode("client")
    setSelectedClientId("")
    setForm({ 
      number: `EST-${Date.now().toString().slice(-6)}`, 
      customer: "", 
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      date: new Date().toISOString().split("T")[0], 
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      notes: "Commercial project estimate and deliverables breakdown.",
      terms: "1. Estimate valid for 30 calendar days.\n2. Work commences upon clearance of advance retainer.",
      status: "Draft" 
    })
    setItems([{ id: "1", name: "", quantity: 1, unitPrice: 0, total: 0 }])
    setIsModalOpen(true) 
  }

  const openEditModal = (item: Estimate) => { 
    setEditingItem(item)
    setTaxScheme((item as any).taxType === "nongst" || (item as any).isNonGst ? "nongst" : "gst")
    setRecipientMode(item.customerEmail ? "client" : "custom")
    setForm({ 
      number: item.number, 
      customer: item.customer, 
      customerEmail: item.customerEmail || "",
      customerPhone: item.customerPhone || "",
      customerAddress: item.customerAddress || "",
      date: item.date, 
      validTill: item.validTill || "",
      notes: item.notes || "Commercial project estimate.",
      terms: item.terms || "1. Estimate valid for 30 days.",
      status: item.status 
    })
    setItems(item.items || [{ id: "1", name: "", quantity: 1, unitPrice: 0, total: 0 }])
    setIsModalOpen(true) 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.customer.trim()) return
    const data = { 
      ...form, 
      taxType: taxScheme,
      isNonGst: taxScheme === "nongst",
      items, 
      subtotal, 
      tax, 
      total: grandTotal, 
      companyId: activeCompanyId 
    }
    await executeWithFeedback(async () => {
      if (editingItem) { await EstimateService.update(editingItem.id, data) } else { await EstimateService.create(data) }
    }, { actionType: editingItem ? "update" : "create", successTitle: editingItem ? "Estimate Updated" : "Estimate Created" })
    setIsModalOpen(false)
    loadData()
  }

  const handleConvertToInvoice = async (estimate: Estimate) => {
    try {
      const isNonGst = Boolean((estimate as any).isNonGst || (estimate as any).taxType === "nongst")
      const invoiceData = {
        client: estimate.customer,
        clientEmail: estimate.customerEmail,
        clientPhone: estimate.customerPhone,
        clientAddress: estimate.customerAddress,
        totalInvoiced: estimate.total,
        paymentReceived: 0,
        due: estimate.total,
        paymentStatus: "Unpaid",
        invoiceDate: new Date().toISOString().split("T")[0],
        dueDate: estimate.validTill || new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0],
        taxType: isNonGst ? "nongst" : "gst",
        isNonGst: isNonGst,
        tax: estimate.tax || 0,
        items: (estimate.items || []).map(it => ({
          id: it.id,
          serviceName: it.name,
          qty: it.quantity,
          rate: it.unitPrice,
          totalAmount: it.total,
        })),
        companyId: estimate.companyId || activeCompanyId,
      }
      await addInvoice(invoiceData as any)
      alert(`✅ Converted Estimate ${estimate.number} to a new Sales Invoice successfully!`)
      setViewingItem(null)
    } catch (err: any) {
      console.error("Convert to invoice error:", err)
      alert("Failed to convert estimate to invoice: " + (err?.message || "Unknown error"))
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    await executeWithFeedback(async () => { await EstimateService.delete(deleteConfirm.id) }, { actionType: "delete", successTitle: "Estimate Deleted" })
    setDeleteConfirm(null)
    loadData()
  }

  const openSendModal = (item: Estimate) => {
    setSendingItem(item)
    setSendEmail(item.customerEmail || "")
    setSendMessage(`Dear ${item.customer},\n\nPlease find attached our detailed cost estimate ${item.number} amounting to ₹${(item.total || 0).toLocaleString("en-IN")}.\n\nPlease review the itemized breakdown and let us know if you would like to proceed.\n\nWarm regards,\n${companyName}`)
  }

  const handleSendEstimate = async () => {
    if (!sendingItem || !sendEmail.trim()) {
      alert("Please specify a valid recipient email.")
      return
    }
    setIsSending(true)
    try {
      await executeWithFeedback(async () => {
        // 1. Update status to Sent and save customer email
        await EstimateService.update(sendingItem.id, {
          ...sendingItem,
          customerEmail: sendEmail.trim(),
          status: "Sent"
        })

        // 2. Dispatch real interactive email with PDF download and Accept/Modify/Decline buttons
        await sendEstimateDetailsEmailNotification(
          { ...sendingItem, customerEmail: sendEmail.trim() },
          sendEmail.trim()
        )

        setSendingItem(null)
        loadData()
      }, {
        actionType: "sync",
        loadingTitle: "Dispatching Commercial Estimate...",
        loadingMsg: `Sending estimate #${sendingItem.number} with action buttons to ${sendEmail.trim()}...`,
        successTitle: "Estimate Delivered Successfully!",
        successMsg: `Estimate #${sendingItem.number} has been dispatched to client's email inbox.`,
        minLoadingMs: 650,
      })
    } catch (err) {
      console.error("Error sending estimate:", err)
    } finally {
      setIsSending(false)
    }
  }

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, companies, canPerformAction, isClientRole, canAdd, canEdit, canDelete, activeCompany, companyName, logoUrl, estimates, setEstimates, clients, setClients, searchQuery, setSearchQuery, statusFilter, setStatusFilter, isModalOpen, setIsModalOpen, isStudioOpen, setIsStudioOpen, editingItem, setEditingItem, deleteConfirm, setDeleteConfirm, viewingItem, setViewingItem, sendingItem, setSendingItem, sendEmail, setSendEmail, sendMessage, setSendMessage, isSending, setIsSending, recipientMode, setRecipientMode, selectedClientId, setSelectedClientId, form, setForm, items, setItems, loadData, loadDataRef, filtered, taxScheme, setTaxScheme, subtotal, tax, grandTotal, handleItemChange, addItem, removeItem, handleClientSelect, openAddModal, openEditModal, handleSubmit, handleConvertToInvoice, handleDelete, openSendModal, handleSendEstimate };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      <EstimatesSection1 ctrl={__ctrl} />
      <EstimatesSection2 ctrl={__ctrl} />

      <EstimatesSection3 ctrl={__ctrl} />

      {/* DELETE CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
              <h3 className="font-bold text-sm">Delete Estimate</h3>
              <p className="text-xs text-zinc-500">Are you sure you want to delete estimate <strong>{deleteConfirm.number}</strong>?</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs text-zinc-500 font-semibold cursor-pointer">Cancel</button>
                <button onClick={handleDelete} className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE SPLIT-SCREEN DOCUMENT STUDIO (ESTIMATE) */}
      <DocumentStudioModal
        isOpen={isStudioOpen}
        mode="estimate"
        initialData={editingItem}
        isMarketingMode={Boolean((editingItem as any)?.category === "Digital Marketing" || (editingItem as any)?.marketingPackage?.enabled)}
        onClose={() => {
          setIsStudioOpen(false)
          setEditingItem(null)
        }}
        onSaveSuccess={() => {
          setIsStudioOpen(false)
          setEditingItem(null)
          loadData()
        }}
      />
    </motion.div>
  )
}
