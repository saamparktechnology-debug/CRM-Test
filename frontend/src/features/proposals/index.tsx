"use client"
import { markGlobalItemDeleted } from "@/lib/storageSync"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, File, Search, CheckCircle2, XCircle, 
  Clock, Eye, Trash2, Check, ArrowRight, Printer, X, Send 
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ProposalItem } from "./types"
import { useDeleteProposalMutation, useProposalsQuery, useSaveProposalsMutation } from "./hooks/useProposals"
import { getClients } from "@/features/clients/services/clientService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { formatDisplayDate } from "@/lib/utils"
import { ProposalsSection1 } from "@/features/proposals/components/proposals-sections/ProposalsSection1"
import { ProposalsSection2 } from "@/features/proposals/components/proposals-sections/ProposalsSection2"


export default function ProposalsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const canAddProposal = canPerformAction(user, "Proposals", "add")
  const canEditProposal = canPerformAction(user, "Proposals", "edit")
  const canDeleteProposal = canPerformAction(user, "Proposals", "delete")

  const targetComp = activeCompanyId || user?.companyId || "tech"

  const isClientRole = user?.role === "Clients"
  const clientEmailNorm = (user?.email || "").toLowerCase().trim()
  const clientNameNorm = (user?.name || "").toLowerCase().trim()

  const { data: proposals = [], refetch: loadProposals } = useProposalsQuery(targetComp)
  const saveProposalsMutation = useSaveProposalsMutation(targetComp)
  const deleteProposalMutation = useDeleteProposalMutation(targetComp)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedProposal, setSelectedProposal] = React.useState<ProposalItem | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Form states
  const [title, setTitle] = React.useState("")
  const [client, setClient] = React.useState("")
  const [clientEmail, setClientEmail] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [validUntil, setValidUntil] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [deliverablesInput, setDeliverablesInput] = React.useState("")
  const [availableClients, setAvailableClients] = React.useState<{ name: string; email: string }[]>([])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  

  React.useEffect(() => {
    if (isCreateModalOpen) {
      getClients().then((cList) => {
        setAvailableClients(cList.map(c => ({ name: c.name, email: c.email || "" })))
        if (cList.length > 0) {
          setClient(cList[0].name)
          setClientEmail(cList[0].email || "")
        }
      }).catch(() => {})
    }
  }, [isCreateModalOpen])

  // Filter by company, branch, and role
  const displayedProposals = React.useMemo(() => {
    const { activeCompanyId: freshComp, activeBranchId: freshBranch, activeSubBranchId: freshSubBranch, branches: freshBranches, subBranches: freshSubBranches } = useAuthStore.getState()
    const userComp = (freshComp || user?.companyId || "").toLowerCase().trim()
    const targetBranch = freshBranch
    const branchObj = (freshBranches || []).find(b => b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase())
    const targetBranchId = String(branchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = branchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = freshSubBranch
    const targetSubBranchObj = (freshSubBranches || []).find(sb => sb.id === targetSubBranch || (sb as any).name?.toLowerCase() === (targetSubBranch || "").toLowerCase())
    const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = targetSubBranchObj?.name?.toLowerCase().trim() || ""

    return proposals.filter((p) => {
      // Company filter
      if (userComp && userComp !== "all") {
        const pComp = ((p as any).companyId || "").toLowerCase().trim()
        if (pComp && pComp !== userComp) return false
        if (!pComp && userComp !== "tech") return false
      }
      // Branch filter (strict)
      if (targetBranch && targetBranch !== "all" && targetBranch !== "main" && targetBranch !== "hq") {
        const pBranch = String((p as any).branchId || "").toLowerCase().trim()
        if (!pBranch) return false
        const match = pBranch === targetBranchId || (targetBranchName && pBranch === targetBranchName)
        if (!match) return false
      }
      // Sub-Branch filter (strict)
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "main" && targetSubBranch !== "hq" && targetSubBranch !== "all_subbranches") {
        const pSubBranch = String((p as any).subBranchId || (p as any).sub_branch_id || "").toLowerCase().trim()
        if (!pSubBranch) return false
        const match = pSubBranch === targetSubBranchId || (targetSubBranchName && pSubBranch === targetSubBranchName)
        if (!match) return false
      }
      // Client role: only their own proposals
      if (isClientRole) return isRecordAssignedToClient(p, user)
      // Team role: only their assigned proposals
      if (user?.role === "Teams" || (user?.role as string) === "Team") return isRecordAssignedToTeamMember(p, user)
      return true
    })
  }, [proposals, isClientRole, user, activeCompanyId, activeBranchId, branches])

  const filteredProposals = React.useMemo(() => {
    return displayedProposals.filter((p) => {
      const matchSearch =
        p.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.amount.toLowerCase().includes(searchQuery.toLowerCase())

      if (selectedStatus === "all") return matchSearch
      return matchSearch && p.status === selectedStatus
    }).sort((a, b) => {
      const timeA = new Date(a.proposalDate || (a as any).createdAt || 0).getTime()
      const timeB = new Date(b.proposalDate || (b as any).createdAt || 0).getTime()
      if (timeA && timeB && timeA !== timeB) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""))
    })
  }, [displayedProposals, searchQuery, selectedStatus])

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !client.trim() || !amount.trim()) {
      alert("Please fill in title, client, and amount.")
      return
    }

    const numAmount = parseInt(amount.replace(/[^0-9]/g, "")) || 0
    const formattedAmount = `₹${numAmount.toLocaleString("en-IN")}`
    const maxNum = proposals.reduce((max, p) => {
      const num = parseInt(String(p.proposalNumber || "").replace(/[^0-9]/g, "")) || 0
      return Math.max(max, num)
    }, 100)

    const newProp: ProposalItem = {
      id: `prop_${Date.now()}`,
      proposalNumber: `PROP #${maxNum + 1}`,
      title,
      client,
      clientEmail: clientEmail || `${client.toLowerCase().replace(/\s+/g, "")}@example.com`,
      proposalDate: new Date().toLocaleDateString("en-GB"),
      validUntil: validUntil || new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-GB"),
      amount: formattedAmount,
      amountNum: numAmount,
      deliverables: deliverablesInput.split(",").map(d => d.trim()).filter(Boolean),
      description: description || "Comprehensive project proposal outlining solution architecture, roadmap, and pricing.",
      status: "Sent",
    }

    const updated = [newProp, ...proposals]
    await saveProposalsMutation.mutateAsync(updated)
    showToast(`✅ Proposal ${newProp.proposalNumber} dispatched to ${client}!`)
    setIsCreateModalOpen(false)
    setTitle("")
    setAmount("")
    setDescription("")
  }

  const handleClientAccept = async (prop: ProposalItem) => {
    const updated = proposals.map(p => p.id === prop.id ? { ...p, status: "Accepted" as const } : p)
    await saveProposalsMutation.mutateAsync(updated)
    showToast(`🎉 Accepted Proposal ${prop.proposalNumber}!`)
    setSelectedProposal(null)
  }

  const handleClientDecline = async (prop: ProposalItem) => {
    const updated = proposals.map(p => p.id === prop.id ? { ...p, status: "Declined" as const } : p)
    await saveProposalsMutation.mutateAsync(updated)
    showToast(`Proposal ${prop.proposalNumber} marked as declined.`)
    setSelectedProposal(null)
  }

  const handleConvertToProject = async (prop: ProposalItem) => {
    try {
      const baseAmount = Math.round(prop.amountNum / 1.18)
      const gstAmount = prop.amountNum - baseAmount
      const pTitle = prop.title

      await addProject({
        title: pTitle,
        client: prop.client,
        price: prop.amount,
        projectType: "Client Project",
        progress: 0,
        startDate: new Date().toLocaleDateString("en-GB"),
        deadline: prop.validUntil,
        status: "In Progress",
        members: [{ id: "1", name: "Admin", role: "Manager", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Admin" }],
        labels: ["From Proposal", prop.proposalNumber],
        description: prop.description,
        baseAmount,
        gstRate: 18,
        gstAmount,
        totalAmount: prop.amountNum,
      })

      const invoiceId = `INV #${Math.floor(100 + Math.random() * 900)}`
      await addInvoice({
        id: invoiceId,
        client: prop.client,
        clientEmail: prop.clientEmail,
        project: pTitle,
        billDate: new Date().toLocaleDateString("en-GB"),
        dueDate: prop.validUntil,
        baseAmount,
        gstRate: 18,
        gstAmount,
        totalInvoiced: prop.amount,
        paymentReceived: "₹0",
        due: prop.amount,
        status: "Not paid",
        billedBy: user?.name || "Admin",
      })

      await addOrder({
        client: prop.client,
        clientEmail: prop.clientEmail,
        project: pTitle,
        orderDate: new Date().toLocaleDateString("en-GB"),
        deliveryDate: prop.validUntil,
        itemsCount: prop.deliverables.length || 1,
        totalAmount: prop.amount,
        paymentStatus: "Unpaid",
        status: "Processing",
        notes: `Converted from Proposal ${prop.proposalNumber}`,
        invoiceId,
      })

      showToast(`🚀 Converted into active Project, Tax Invoice (${invoiceId}), and Order!`)
      setSelectedProposal(null)
      loadProposals()
    } catch (err: any) {
      alert(`Error converting: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    const prop = proposals.find(p => p.id === id)
    const label = prop?.title || id
    if (await confirmTwoStepDelete(label, "proposal")) {
      await markGlobalItemDeleted(id, "proposals")
      const updated = proposals.filter(p => p.id !== id)
      await saveProposalsMutation.mutateAsync(updated)
      showToast("Proposal removed.")
    }
  }

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, canPerformAction, canAddProposal, canEditProposal, canDeleteProposal, targetComp, isClientRole, clientEmailNorm, clientNameNorm, proposals, saveProposalsMutation, deleteProposalMutation, searchQuery, setSearchQuery, selectedStatus, setSelectedStatus, selectedProposal, setSelectedProposal, isCreateModalOpen, setIsCreateModalOpen, toastMessage, setToastMessage, title, setTitle, client, setClient, clientEmail, setClientEmail, amount, setAmount, validUntil, setValidUntil, description, setDescription, deliverablesInput, setDeliverablesInput, availableClients, setAvailableClients, showToast, displayedProposals, filteredProposals, handleCreateProposal, handleClientAccept, handleClientDecline, handleConvertToProject, handleDelete };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <ProposalsSection1 ctrl={__ctrl} />

      <ProposalsSection2 ctrl={__ctrl} />
    </motion.div>
  )
}
