"use client"
import { markGlobalItemDeleted } from "@/lib/storageSync"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  HeadphonesIcon, Plus, Search, CheckCircle2, AlertCircle, 
  Clock, ShieldAlert, Check, X, ArrowRight, Eye, Trash2,
  FileText, MessageSquare, Send, User, ExternalLink, Paperclip,
  Image as ImageIcon, Loader2, Download
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { DisputeTicket, TicketAttachment, TicketPriority, TicketStatus } from "./types"
import { useDeleteTicketMutation, useSaveTicketsMutation, useTicketsQuery } from "./hooks/useTickets"
import { uploadToImgBB } from "@/lib/imgbbUpload"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { TicketsSection1 } from "@/features/tickets/components/tickets-sections/TicketsSection1"
import { TicketsSection2 } from "@/features/tickets/components/tickets-sections/TicketsSection2"
import { TicketsSection3 } from "@/features/tickets/components/tickets-sections/TicketsSection3"


export default function TicketsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches } = useAuthStore()

  // Super Admin = ONLY role with full ticket visibility + status change power
  const roleLower = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleLower === "super admin" || roleLower === "superadmin" || roleLower.includes("super")

  const { canPerformAction } = usePermissionStore()

  // Granular action access permissions
  const canAddTicket = canPerformAction(user, "Tickets", "add") || isSuperAdmin
  const canResolveTicket = canPerformAction(user, "Tickets", "edit") || isSuperAdmin
  const canDeleteTicket = canPerformAction(user, "Tickets", "delete") || isSuperAdmin

  const currentUserEmail = (user?.email || "").toLowerCase().trim()
  const currentUserName = user?.name || "User"
  const targetComp = activeCompanyId || user?.companyId || "tech"

  const { data: tickets = [] } = useTicketsQuery(targetComp)
  const saveTicketsMutation = useSaveTicketsMutation(targetComp)
  const deleteTicketMutation = useDeleteTicketMutation(targetComp)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatusTab, setSelectedStatusTab] = React.useState<string>("all")
  const [selectedTicket, setSelectedTicket] = React.useState<DisputeTicket | null>(null)
  const [isRaiseModalOpen, setIsRaiseModalOpen] = React.useState(false)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Raise Ticket Form
  const [subject, setSubject] = React.useState("")
  const [category, setCategory] = React.useState("Project Deliverable & Scope")
  const [priority, setPriority] = React.useState<TicketPriority>("High")
  const [description, setDescription] = React.useState("")
  const [attachments, setAttachments] = React.useState<TicketAttachment[]>([])
  const [isUploadingFile, setIsUploadingFile] = React.useState(false)
  const ticketFileInputRef = React.useRef<HTMLInputElement>(null)

  // Admin Resolution State
  const [newStatus, setNewStatus] = React.useState<TicketStatus>("In Progress")
  const [resolutionInput, setResolutionInput] = React.useState("")
  const [resolutionAttachments, setResolutionAttachments] = React.useState<TicketAttachment[]>([])
  const [isUploadingResFile, setIsUploadingResFile] = React.useState(false)
  const resFileInputRef = React.useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Handle ImgBB file upload for Ticket Evidence
  const handleUploadTicketFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingFile(true)
    try {
      const uploadedList: TicketAttachment[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const res = await uploadToImgBB(file, `tkt_doc_${Date.now()}_${file.name}`)
        if (res.url) {
          uploadedList.push({
            name: file.name,
            url: res.url,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          })
        }
      }
      setAttachments((prev) => [...prev, ...uploadedList])
      showToast(`✅ ${uploadedList.length} file(s) uploaded via ImgBB!`)
    } catch (err) {
      alert("Failed to upload file to ImgBB. Please check connection.")
    } finally {
      setIsUploadingFile(false)
      if (ticketFileInputRef.current) ticketFileInputRef.current.value = ""
    }
  }

  // Handle ImgBB file upload for Admin Resolution
  const handleUploadResolutionFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingResFile(true)
    try {
      const uploadedList: TicketAttachment[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const res = await uploadToImgBB(file, `res_doc_${Date.now()}_${file.name}`)
        if (res.url) {
          uploadedList.push({
            name: file.name,
            url: res.url,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
          })
        }
      }
      setResolutionAttachments((prev) => [...prev, ...uploadedList])
      showToast(`✅ ${uploadedList.length} resolution attachment(s) uploaded!`)
    } catch (err) {
      alert("Failed to upload resolution document to ImgBB.")
    } finally {
      setIsUploadingResFile(false)
      if (resFileInputRef.current) resFileInputRef.current.value = ""
    }
  }

  

  // Access Control Rules:
  // Super Admin → sees ALL tickets across the company (scoped by branch if selected)
  // Everyone else (Admin, Team, Client) → sees ONLY tickets they personally raised
  const accessibleTickets = React.useMemo(() => {
    const { activeCompanyId: freshComp, activeBranchId: freshBranch, branches: freshBranches } = useAuthStore.getState()
    const userComp = (freshComp || user?.companyId || "").toLowerCase().trim()
    const targetBranch = freshBranch

    const checkBranch = (t: DisputeTicket) => {
      if (!targetBranch || targetBranch === "all" || targetBranch === "main" || targetBranch === "hq") return true
      const tBranch = String(t.branchId || "").toLowerCase().trim()
      if (!tBranch) return false // strict: if branch selected, ticket must have one
      const branchObj = (freshBranches || []).find(b => 
        String(b.id) === String(targetBranch) || 
        String(b.name || "").toLowerCase() === String(targetBranch || "").toLowerCase()
      )
      const targetBranchId = String(branchObj?.id || targetBranch).toLowerCase().trim()
      const targetBranchName = branchObj?.name?.toLowerCase().trim() || ""
      return tBranch === targetBranchId || (targetBranchName && tBranch === targetBranchName)
    }

    if (isSuperAdmin) {
      // Super Admin sees everything — filter by company + branch context
      return tickets.filter(t => {
        if (userComp && userComp !== "all") {
          const tComp = (t.companyId || "tech").toLowerCase().trim()
          if (tComp !== userComp && !(userComp === "tech" && !t.companyId)) return false
        }
        return checkBranch(t)
      })
    }

    // All other roles: only see their own tickets
    return tickets.filter(t => {
      const cEmail = (t.creatorEmail || "").toLowerCase().trim()
      const cName = (t.createdBy || "").toLowerCase().trim()
      return (
        (currentUserEmail && cEmail === currentUserEmail) ||
        (currentUserName && cName === currentUserName.toLowerCase().trim())
      )
    })
  }, [tickets, isSuperAdmin, user, currentUserEmail, currentUserName, activeCompanyId, activeBranchId, branches])

  const filteredTickets = React.useMemo(() => {
    return accessibleTickets.filter(t => {
      const matchSearch =
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.createdBy.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchSearch) return false
      if (selectedStatusTab === "all") return true
      return t.status === selectedStatusTab
    }).sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime()
      const timeB = new Date(b.createdAt || 0).getTime()
      if (timeA && timeB && timeA !== timeB) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""))
    })
  }, [accessibleTickets, searchQuery, selectedStatusTab])

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      alert("Please provide ticket subject and detailed description.")
      return
    }

    const maxNum = tickets.reduce((max, t) => {
      const num = parseInt(String(t.ticketNumber || "").replace(/[^0-9]/g, "")) || 0
      return Math.max(max, num)
    }, 100)

    const newTicket: DisputeTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT #${maxNum + 1}`,
      subject,
      category,
      priority,
      status: "New",
      description,
      attachments: attachments.length > 0 ? attachments : undefined,
      createdBy: currentUserName,
      creatorEmail: currentUserEmail,
      creatorRole: user?.role || "User",
      companyId: targetComp,
      branchId: user?.branchId || undefined,
      createdAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      assignedTo: "Company Admin & Super Admin",
      raisedTo: "Company Admin & Super Admin",
    }

    const updated = [newTicket, ...tickets]
    await saveTicketsMutation.mutateAsync(updated)
    showToast(`✅ Dispute Ticket ${newTicket.ticketNumber} submitted with ${attachments.length} attachment(s)!`)
    setIsRaiseModalOpen(false)
    setSubject("")
    setDescription("")
    setAttachments([])
  }

  const handleSaveResolution = async () => {
    if (!selectedTicket) return

    const isResolved = newStatus === "Resolved" || newStatus === "Closed"
    const updated = tickets.map(t => {
      if (t.id !== selectedTicket.id) return t
      return {
        ...t,
        status: newStatus,
        resolutionNote: resolutionInput || t.resolutionNote,
        resolutionAttachments: resolutionAttachments.length > 0 ? resolutionAttachments : t.resolutionAttachments,
        resolvedAt: isResolved ? new Date().toLocaleString("en-IN") : t.resolvedAt,
        resolvedBy: isResolved ? currentUserName : t.resolvedBy,
      }
    })

    await saveTicketsMutation.mutateAsync(updated)
    showToast(`✅ Ticket ${selectedTicket.ticketNumber} updated to ${newStatus}! Confirmation recorded.`)
    setSelectedTicket(null)
    setResolutionInput("")
    setResolutionAttachments([])
  }

  const handleDelete = async (id: string) => {
    const t = tickets.find(item => item.id === id)
    const label = t?.subject ? `#${t.ticketNumber || t.id} ("${t.subject}")` : `#${id}`
    if (await confirmTwoStepDelete(label, "ticket")) {
      await markGlobalItemDeleted(id, "tickets")
      const updated = tickets.filter(t => t.id !== id)
      await saveTicketsMutation.mutateAsync(updated)
      showToast("Ticket deleted.")
      if (selectedTicket?.id === id) setSelectedTicket(null)
    }
  }

  // Summary counts
  const newCount = accessibleTickets.filter(t => t.status === "New").length
  const progressCount = accessibleTickets.filter(t => t.status === "In Progress" || t.status === "Under Review" || t.status === "Open").length
  const resolvedCount = accessibleTickets.filter(t => t.status === "Resolved" || t.status === "Closed").length

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, roleLower, isSuperAdmin, canPerformAction, canAddTicket, canResolveTicket, canDeleteTicket, currentUserEmail, currentUserName, targetComp, tickets, saveTicketsMutation, deleteTicketMutation, searchQuery, setSearchQuery, selectedStatusTab, setSelectedStatusTab, selectedTicket, setSelectedTicket, isRaiseModalOpen, setIsRaiseModalOpen, toastMessage, setToastMessage, subject, setSubject, category, setCategory, priority, setPriority, description, setDescription, attachments, setAttachments, isUploadingFile, setIsUploadingFile, ticketFileInputRef, newStatus, setNewStatus, resolutionInput, setResolutionInput, resolutionAttachments, setResolutionAttachments, isUploadingResFile, setIsUploadingResFile, resFileInputRef, showToast, handleUploadTicketFiles, handleUploadResolutionFiles, accessibleTickets, filteredTickets, handleRaiseTicket, handleSaveResolution, handleDelete, newCount, progressCount, resolvedCount };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <TicketsSection1 ctrl={__ctrl} />

      <TicketsSection2 ctrl={__ctrl} />

      <TicketsSection3 ctrl={__ctrl} />
    </motion.div>
  )
}
