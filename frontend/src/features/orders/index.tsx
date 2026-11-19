"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Printer, 
  ShoppingBag, 
  Eye, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle,
  X,
  Check,
  Calendar,
  Building2,
  Receipt,
  BellRing,
  FileText,
  Users,
  Code2,
  Database,
  KeyRound,
  Layers,
  ArrowRight
} from "lucide-react"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { addInvoice, getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { addPayment } from "../payments/services/paymentService"
import { sendPaymentDueReminderEmailNotification } from "@/services/emailNotificationService"
import { getOrders, addOrder, updateOrder, deleteOrder } from "./services/orderService"

import { getClients } from "@/features/clients/services/clientService"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMilestone } from "@/features/projects/types"

import { exportToExcel, printPDFReport, exportToCSV } from "@/lib/exportUtils"
import { formatDisplayDate } from "@/lib/utils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { getUserAvatar } from "@/features/users/services/userService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"

import { usePermissionStore } from "@/store/usePermissionStore"
import { OrdersSection1 } from "@/features/orders/components/orders-sections/OrdersSection1"
import { OrdersSection2 } from "@/features/orders/components/orders-sections/OrdersSection2"
import { OrdersSection3 } from "@/features/orders/components/orders-sections/OrdersSection3"
import { OrdersSection4 } from "@/features/orders/components/orders-sections/OrdersSection4"


import { type OrderStatus, type PaymentStatus, type OrderItem, INITIAL_ORDERS } from "@/features/orders/components/orders-sections/OrdersHelpers"
export * from "@/features/orders/components/orders-sections/OrdersHelpers"

export default function OrderListPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const canViewOrder = canPerformAction(user, "Sales Orders", "view")
  const canAddOrder = canPerformAction(user, "Sales Orders", "add")
  const canEditOrder = canPerformAction(user, "Sales Orders", "edit")
  const canDeleteOrder = canPerformAction(user, "Sales Orders", "delete")

  const targetComp = activeCompanyId || user?.companyId || "tech"

  const isClientRole = user?.role === "Clients"
  const clientEmailNorm = (user?.email || "").toLowerCase().trim()
  const clientNameNorm = (user?.name || "").toLowerCase().trim()

  const [orders, setOrders] = React.useState<OrderItem[]>([])
  const [projectsList, setProjectsList] = React.useState<Project[]>([])
  const [invoicesList, setInvoicesList] = React.useState<InvoiceItem[]>([])
  const [activeTab, setActiveTab] = React.useState<"all" | OrderStatus>("all")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedOrder, setSelectedOrder] = React.useState<OrderItem | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Form states for new order
  const [client, setClient] = React.useState("")
  const [clientEmail, setClientEmail] = React.useState("")
  const [project, setProject] = React.useState("")
  const [totalAmount, setTotalAmount] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState("")
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>("Unpaid")
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus>("Pending")
  const [notes, setNotes] = React.useState("")

  const [availableClients, setAvailableClients] = React.useState<{ name: string; email: string }[]>([])
  const [availableProjects, setAvailableProjects] = React.useState<{ title: string; client: string }[]>([])

  // Direct Invoice Viewer Modal State
  const [selectedInvoice, setSelectedInvoice] = React.useState<InvoiceItem | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadOrders = React.useCallback(async () => {
    const [data, projs, invs] = await Promise.all([
      getOrders(targetComp).catch(() => []),
      getProjects(targetComp).catch(() => []),
      getInvoices(targetComp).catch(() => []),
    ])

    const safeProjs = Array.isArray(projs) ? projs : []
    setProjectsList(safeProjs)
    setInvoicesList(Array.isArray(invs) ? invs : [])

    const rawOrders = Array.isArray(data) ? filterGlobalDeletedItems(data) : []
    const projectMap = new Map<string, string>()
    safeProjs.forEach(p => {
      if (p.title) projectMap.set(p.title.toLowerCase().trim(), p.status || "In Progress")
      if (p.id) projectMap.set(String(p.id).toLowerCase().trim(), p.status || "In Progress")
    })

    const synced = rawOrders.map(ord => {
      const pTitle = (ord.project || "").toLowerCase().trim()
      const pStatus = projectMap.get(pTitle)
      if (pStatus) {
        let mapped: OrderStatus = ord.status
        const norm = pStatus.toLowerCase().trim()
        if (norm === "completed" || norm === "finished") mapped = "Completed"
        else if (norm === "canceled" || norm === "cancelled") mapped = "Cancelled"
        else if (norm === "on hold" || norm === "pending" || norm === "not started") mapped = "Pending"
        else mapped = "Processing"

        if (mapped !== ord.status) {
          return { ...ord, status: mapped }
        }
      }
      return ord
    })

    setOrders(synced)
  }, [targetComp])

  React.useEffect(() => {
    loadOrders()
    window.addEventListener("saampark_data_synced", loadOrders)
    window.addEventListener("saampark_orders_updated", loadOrders)
    window.addEventListener("saampark_projects_updated", loadOrders)
    window.addEventListener("saampark_company_switched", loadOrders)
    window.addEventListener("storage", loadOrders)
    return () => {
      window.removeEventListener("saampark_data_synced", loadOrders)
      window.removeEventListener("saampark_orders_updated", loadOrders)
      window.removeEventListener("saampark_projects_updated", loadOrders)
      window.removeEventListener("saampark_company_switched", loadOrders)
      window.removeEventListener("storage", loadOrders)
    }
  }, [loadOrders])

  React.useEffect(() => {
    if (isAddModalOpen) {
      getClients().then((clients) => {
        setAvailableClients(clients.map(c => ({ name: c.name, email: c.email || "" })))
        if (clients.length > 0) {
          setClient(clients[0].name)
          setClientEmail(clients[0].email || "")
        }
      }).catch(() => {})

      getProjects().then(projs => {
        setAvailableProjects(projs.map(p => ({ title: p.title, client: p.client })))
        if (projs.length > 0) setProject(projs[0].title)
      })
    }
  }, [isAddModalOpen])

  const displayedOrders = React.useMemo(() => {
    const userComp = (activeCompanyId || user?.companyId || "").toLowerCase().trim()
    const targetBranch = activeBranchId || (user?.role !== "Super Admin" && user?.role !== "Admin" ? user?.branchId : null)
    const targetSubBranch = activeSubBranchId || (user?.role !== "Super Admin" && user?.role !== "Admin" ? (user as any)?.subBranchId : null)

    const safeBranches = Array.isArray(branches) ? branches : []
    const targetBranchObj = safeBranches.find((b: any) => b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase())
    const targetBranchId = String(targetBranchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

    const safeSubBranches = Array.isArray(subBranches) ? subBranches : []
    const targetSubBranchObj = safeSubBranches.find((sb: any) => sb.id === targetSubBranch || sb.name.toLowerCase() === (targetSubBranch || "").toLowerCase())
    const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = targetSubBranchObj?.name?.toLowerCase().trim() || ""

    const checkBranch = (o: any) => {
      if (!targetBranch || targetBranch === "all" || targetBranch === "hq" || targetBranch === "main" || targetBranchId === "main" || targetBranchId === "hq") return true
      const oBranch = String(o.branchId || o.branch_id || "").toLowerCase().trim()
      const oBranchName = String(o.branchName || o.branch_name || "").toLowerCase().trim()
      if (!oBranch && !oBranchName) return false
      return (oBranch && (oBranch === targetBranchId || (targetBranchName && oBranch === targetBranchName))) ||
             (oBranchName && (oBranchName === targetBranchName || oBranchName === targetBranchId))
    }

    const checkSubBranch = (o: any) => {
      if (!targetSubBranch || targetSubBranch === "all" || targetSubBranch === "hq" || targetSubBranch === "main" || targetSubBranchId === "main" || targetSubBranchId === "hq") return true
      const oSub = String(o.subBranchId || o.sub_branch_id || "").toLowerCase().trim()
      const oSubName = String(o.subBranchName || o.sub_branch_name || "").toLowerCase().trim()
      if (!oSub && !oSubName) return false
      return (oSub && (oSub === targetSubBranchId || (targetSubBranchName && oSub === targetSubBranchName))) ||
             (oSubName && (oSubName === targetSubBranchName || oSubName === targetSubBranchId))
    }

    let filtered = orders
    if (isClientRole) {
      filtered = filtered.filter((o) => isRecordAssignedToClient(o, user))
    } else {
      if (user?.role === "Teams" || (user?.role as string) === "Team") {
        filtered = filtered.filter((o) => isRecordAssignedToTeamMember(o, user))
      }
      if (userComp && userComp !== "all") {
        filtered = filtered.filter((o) => {
          const oComp = (o.companyId || (o as any).company || "tech").toLowerCase().trim()
          return isMatchingCompany({ id: oComp, slug: oComp } as any, userComp)
        })
      }
      if (targetBranch && targetBranch !== "all" && targetBranch !== "hq" && targetBranch !== "main" && targetBranchId !== "main" && targetBranchId !== "hq") {
        filtered = filtered.filter((o) => checkBranch(o))
      }
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "hq" && targetSubBranch !== "main") {
        filtered = filtered.filter((o) => checkSubBranch(o))
      }
    }
    // Newly created orders on top
    filtered.sort((a, b) => {
      const timeA = new Date(a.orderDate || 0).getTime()
      const timeB = new Date(b.orderDate || 0).getTime()
      if (timeA !== timeB && !isNaN(timeA) && !isNaN(timeB)) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true })
    })
    return filtered
  }, [orders, isClientRole, user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches])

  const filteredOrders = React.useMemo(() => {
    return displayedOrders.filter((ord) => {
      const matchesSearch =
        ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.totalAmount.toLowerCase().includes(searchQuery.toLowerCase())

      if (activeTab === "all") return matchesSearch
      return matchesSearch && ord.status === activeTab
    })
  }, [displayedOrders, searchQuery, activeTab])

  const handleDeleteOrder = async (id: string) => {
    if (isClientRole || !canDeleteOrder) {
      alert("Permission Denied: Clients cannot delete orders assigned to them.")
      return
    }
    const ord = orders.find(o => String(o.id).toLowerCase().trim() === String(id).toLowerCase().trim())
    const ordNum = ord?.orderNumber || "Order"

    if (!await confirmTwoStepDelete(ordNum, "sales order")) return

    await executeWithFeedback(async () => {
      const strId = String(id).toLowerCase().trim()
      await markGlobalItemDeleted(strId, "orders")
      const updated = orders.filter((o) => String(o.id).toLowerCase().trim() !== strId)
      setOrders(updated)
      await saveModuleDataToDB("orders", updated)
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Order...",
      loadingMsg: `Removing ${ordNum} from database...`,
      successTitle: "Order Deleted",
      successMsg: `${ordNum} was removed successfully.`,
      errorTitle: "Delete Failed",
    })
  }

  const handleSendReminder = async (ord: OrderItem) => {
    await executeWithFeedback(async () => {
      const now = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
      const updated = orders.map(o => o.id === ord.id ? { ...o, lastReminderSent: now } : o)
      setOrders(updated)
      await saveModuleDataToDB("orders", updated)

      await sendPaymentDueReminderEmailNotification({
        id: ord.invoiceId || ord.orderNumber,
        client: ord.client,
        clientEmail: ord.clientEmail,
        project: ord.project,
        billDate: ord.orderDate,
        dueDate: ord.deliveryDate,
        totalInvoiced: ord.totalAmount,
        paymentReceived: "₹0",
        due: ord.totalAmount,
        status: "Not paid",
        billedBy: "Admin",
        items: [],
      }, ord.clientEmail).catch(() => null)
    }, {
      actionType: "process",
      loadingTitle: "Dispatching Reminder...",
      loadingMsg: `Sending payment reminder to ${ord.client}...`,
      successTitle: "Reminder Sent!",
      successMsg: `Payment reminder sent to ${ord.client} for ${ord.totalAmount}.`,
      errorTitle: "Reminder Failed",
    })
  }

  const handleMarkPaymentCompleted = async (ord: OrderItem) => {
    await executeWithFeedback(async () => {
      const updated = orders.map(o => o.id === ord.id ? { ...o, paymentStatus: "Paid" as PaymentStatus, status: "Completed" as OrderStatus } : o)
      setOrders(updated)
      await saveModuleDataToDB("orders", updated)

      const numAmount = parseInt(ord.totalAmount.replace(/[^0-9]/g, "")) || 0
      await addPayment({
        invoiceId: ord.invoiceId || ord.orderNumber,
        client: ord.client,
        clientEmail: ord.clientEmail,
        project: ord.project,
        paymentDate: new Date().toLocaleDateString("en-GB"),
        paymentMethod: "UPI / Net Banking",
        transactionRef: `ORD_PAY_${Date.now()}`,
        note: `Payment completed for ${ord.orderNumber}`,
        amount: ord.totalAmount,
        amountNum: numAmount,
        status: "Completed",
      }).catch(() => null)

      loadOrders()
    }, {
      actionType: "payment",
      loadingTitle: "Settling Order...",
      loadingMsg: `Recording full payment for ${ord.orderNumber}...`,
      successTitle: "Payment Completed!",
      successMsg: `Order ${ord.orderNumber} marked as Completed & Paid.`,
      errorTitle: "Settlement Failed",
    })
  }

  const handleViewInvoice = async (ord: OrderItem) => {
    try {
      const invs = await getInvoices()
      let match = invs.find(
        (i) =>
          (ord.invoiceId && i.id === ord.invoiceId) ||
          (i.project && i.project.toLowerCase().trim() === ord.project.toLowerCase().trim()) ||
          (i.client && i.client.toLowerCase().trim() === ord.client.toLowerCase().trim() && i.totalInvoiced === ord.totalAmount)
      )

      if (!match) {
        const rawTotal = parseInt(ord.totalAmount.replace(/[^0-9]/g, "")) || 50000
        const baseAmt = Math.round(rawTotal / 1.18)
        const gstAmt = rawTotal - baseAmt
        const isPaid = ord.paymentStatus === "Paid"
        const isPartiallyPaid = ord.paymentStatus === "Partially paid"

        match = await addInvoice({
          client: ord.client,
          clientEmail: ord.clientEmail,
          project: ord.project,
          billDate: ord.orderDate || new Date().toLocaleDateString("en-GB"),
          dueDate: ord.deliveryDate || "30-06-2026",
          baseAmount: baseAmt,
          gstRate: 18,
          gstAmount: gstAmt,
          totalInvoiced: ord.totalAmount,
          paymentReceived: isPaid ? ord.totalAmount : isPartiallyPaid ? `₹${Math.round(rawTotal * 0.4).toLocaleString("en-IN")}` : "₹0",
          due: isPaid ? "₹0" : isPartiallyPaid ? `₹${Math.round(rawTotal * 0.6).toLocaleString("en-IN")}` : ord.totalAmount,
          status: isPaid ? "Fully paid" : isPartiallyPaid ? "Partially paid" : "Not paid",
          billedBy: "Admin",
        })
      }

      setSelectedInvoice(match)
      setIsInvoiceModalOpen(true)
    } catch (err) {
      console.error("Error viewing invoice:", err)
      showToast("Error opening invoice details.")
    }
  }

  const handleGenerateInvoice = handleViewInvoice

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client.trim() || !project.trim() || !totalAmount.trim()) {
      alert("Please fill in client, project, and total amount fields.")
      return
    }

    const nextId = `ord_${Date.now()}`
    const orderNumber = `ORD #${Math.floor(1000 + Math.random() * 9000)}`
    const formattedAmount = totalAmount.startsWith("₹") ? totalAmount : `₹${totalAmount}`

    await executeWithFeedback(async () => {
      const newOrder: OrderItem = {
        id: nextId,
        orderNumber,
        client,
        clientEmail: clientEmail || `${client.toLowerCase().replace(/\s+/g, '')}@example.com`,
        project,
        orderDate: new Date().toLocaleDateString("en-GB"),
        deliveryDate: deliveryDate || new Date(Date.now() + 14 * 86400000).toLocaleDateString("en-GB"),
        itemsCount: 1,
        totalAmount: formattedAmount,
        paymentStatus,
        status: orderStatus,
        notes: notes || `Order generated for ${client}.`
      }

      const updated = [newOrder, ...orders]
      setOrders(updated)
      await saveModuleDataToDB("orders", updated)

      setClient("")
      setClientEmail("")
      setProject("")
      setTotalAmount("")
      setDeliveryDate("")
      setNotes("")
      setIsAddModalOpen(false)
    }, {
      actionType: "create",
      loadingTitle: "Creating Sales Order...",
      loadingMsg: `Creating ${orderNumber} for ${client}...`,
      successTitle: "Order Created!",
      successMsg: `Sales Order ${orderNumber} created successfully.`,
      errorTitle: "Order Creation Failed",
    })
  }

  const handleExportCSV = () => {
    exportToCSV({
      filename: "orders_export",
      title: "Sales Orders Directory",
      subtitle: `Orders Directory (${filteredOrders.length} records)`,
      headers: ["Order Number", "Client", "Project", "Order Date", "Delivery Date", "Total Amount", "Payment Status", "Order Status"],
      rows: filteredOrders.map((o) => [
        o.orderNumber,
        o.client,
        o.project,
        o.orderDate,
        o.deliveryDate,
        o.totalAmount,
        o.paymentStatus,
        o.status,
      ]),
    })
  }

  const totalValue = displayedOrders.reduce((sum, o) => {
    const num = parseInt(o.totalAmount.replace(/[^0-9]/g, "")) || 0
    return sum + num
  }, 0)

  const completedCount = displayedOrders.filter(o => o.status === "Completed").length
  const pendingCount = displayedOrders.filter(o => o.status === "Pending" || o.status === "Processing").length

  
  __ctrl = { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, canPerformAction, canViewOrder, canAddOrder, canEditOrder, canDeleteOrder, targetComp, isClientRole, clientEmailNorm, clientNameNorm, orders, setOrders, projectsList, setProjectsList, invoicesList, setInvoicesList, activeTab, setActiveTab, searchQuery, setSearchQuery, selectedOrder, setSelectedOrder, isDetailModalOpen, setIsDetailModalOpen, isAddModalOpen, setIsAddModalOpen, toastMessage, setToastMessage, client, setClient, clientEmail, setClientEmail, project, setProject, totalAmount, setTotalAmount, deliveryDate, setDeliveryDate, paymentStatus, setPaymentStatus, orderStatus, setOrderStatus, notes, setNotes, availableClients, setAvailableClients, availableProjects, setAvailableProjects, selectedInvoice, setSelectedInvoice, isInvoiceModalOpen, setIsInvoiceModalOpen, showToast, loadOrders, displayedOrders, filteredOrders, handleDeleteOrder, handleSendReminder, handleMarkPaymentCompleted, handleViewInvoice, handleGenerateInvoice, handleCreateOrder, handleExportCSV, totalValue, completedCount, pendingCount };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <OrdersSection1 ctrl={__ctrl} />
      <OrdersSection2 ctrl={__ctrl} />
      <OrdersSection3 ctrl={__ctrl} />

      <OrdersSection4 ctrl={__ctrl} />
    </motion.div>
  )
}
