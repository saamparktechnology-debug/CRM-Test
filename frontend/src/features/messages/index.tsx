"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Search, Send, MessageSquare, User, Shield, UserCheck, 
  Briefcase, CheckCheck, Paperclip, Smile, MoreVertical, Trash2, Phone, Video, Lock,
  ChevronLeft, X, ArrowDown
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients } from "@/features/clients/services/clientService"
import { getLeads } from "@/features/leads/services/leadService"
import { getProjects } from "@/features/projects/services/projectService"
import { ChatContact, ChatMessage } from "./types"
import { useMessagesQuery, useSaveMessagesMutation } from "./hooks/useMessages"
import { messageFeatureService } from "./services/messageService"
import { MessagesSection1 } from "@/features/messages/components/messages-sections/MessagesSection1"


export default function MessagesMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, branches } = useAuthStore()
  const { canPerformAction, isModuleAllowed } = usePermissionStore()

  const currentUserEmail = (user?.email || "").toLowerCase().trim()
  const currentUserName = user?.name || "User"
  const currentUserRole = user?.role || "Teams"

  const canView = isModuleAllowed(user, "Messages")
  const canSend = canPerformAction(user, "Messages", "add")
  const canDelete = canPerformAction(user, "Messages", "delete")

  const [contacts, setContacts] = React.useState<ChatContact[]>([])
  const [selectedContact, setSelectedContact] = React.useState<ChatContact | null>(null)
  const msgCompanyKey = activeCompanyId || user?.companyId || "tech"
  const { data: messages = [] } = useMessagesQuery(msgCompanyKey)
  const saveMessagesMutation = useSaveMessagesMutation(msgCompanyKey)
  const [inputText, setInputText] = React.useState("")
  const [searchContact, setSearchContact] = React.useState("")
  const [mobileView, setMobileView] = React.useState<"contacts" | "chat">("contacts")
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchMessageQuery, setSearchMessageQuery] = React.useState("")

  const messagesContainerRef = React.useRef<HTMLDivElement>(null)
  const prevCountRef = React.useRef<number>(0)
  const activeContactRef = React.useRef<string>("")

  // 1. Load users & clients into contacts list with strict company and role scoping
  React.useEffect(() => {
    if (!user) return

    const loadDirectory = async () => {
      try {
        const targetComp = activeCompanyId || user.companyId || "tech"
        const targetNorm = targetComp.toLowerCase().trim()

        const [userList, clientList, leadList, projectList] = await Promise.all([
          getUsers(targetComp).catch(() => []),
          getClients(targetComp).catch(() => []),
          getLeads(targetComp).catch(() => []),
          getProjects(targetComp).catch(() => []),
        ])

        const contactMap = new Map<string, ChatContact>()

        const isSuperAdmin = currentUserRole === "Super Admin"
        const isCompanyAdmin = currentUserRole === "Admin"
        const isTeamMember = currentUserRole === "Teams"
        const isClient = currentUserRole === "Clients"

        // Helper to verify user belongs to the active company workspace
        const userBelongsToCompany = (u: any) => {
          if (!targetComp || targetComp === "all") return true
          if (u.role === "Super Admin") return true
          if (u.companyIds && Array.isArray(u.companyIds) && u.companyIds.length > 0) {
            const normIds = u.companyIds.map((id: any) => String(id).toLowerCase().trim())
            if (normIds.includes(targetNorm)) return true
          }
          const uComp = String(u.companyId || "tech").toLowerCase().trim()
          return uComp === targetNorm || (targetNorm === "tech" && !u.companyId)
        }

        // Helper to verify client belongs to the active company workspace
        const clientBelongsToCompany = (c: any) => {
          if (!targetComp || targetComp === "all") return true
          const cComp = String(c.companyId || (c as any).company || "tech").toLowerCase().trim()
          return cComp === targetNorm || (targetNorm === "tech" && !c.companyId)
        }

        // ── Team Member: Find assigned clients from leads & projects ───────
        const assignedClientEmails = new Set<string>()
        const assignedClientNames = new Set<string>()

        if (isTeamMember) {
          const normName = currentUserName.toLowerCase().trim()
          leadList.forEach((l) => {
            const caller = (l.caller || "").toLowerCase().trim()
            const owner = (l.owner || "").toLowerCase().trim()
            const assigned = (l.assignedTo || "").toLowerCase().trim()
            if (caller === normName || owner === normName || assigned === normName || caller.includes(normName)) {
              if (l.email) assignedClientEmails.add(l.email.toLowerCase().trim())
              if (l.name) assignedClientNames.add(l.name.toLowerCase().trim())
            }
          })
          projectList.forEach((p) => {
            const members = p.members || []
            const isMember = members.some((m) => {
              const mName = (m.name || "").toLowerCase().trim()
              const mEmail = (m.email || "").toLowerCase().trim()
              return mName === normName || mEmail === currentUserEmail || (normName && mName.includes(normName))
            })
            if (isMember && p.client) {
              assignedClientNames.add(p.client.toLowerCase().trim())
            }
          })
        }

        // ── Client: Find assigned team members from leads & projects ───────
        const assignedTeamEmails = new Set<string>()
        const assignedTeamNames = new Set<string>()

        if (isClient) {
          const normClientName = currentUserName.toLowerCase().trim()
          leadList.forEach((l) => {
            const lEmail = (l.email || "").toLowerCase().trim()
            const lName = (l.name || "").toLowerCase().trim()
            if (lEmail === currentUserEmail || lName === normClientName || (normClientName && lName.includes(normClientName))) {
              if (l.caller && l.caller !== "None") assignedTeamNames.add(l.caller.toLowerCase().trim())
              if (l.owner && l.owner !== "None") assignedTeamNames.add(l.owner.toLowerCase().trim())
              if (l.assignedTo && l.assignedTo !== "None") assignedTeamNames.add(l.assignedTo.toLowerCase().trim())
            }
          })
          projectList.forEach((p) => {
            const pClient = (p.client || "").toLowerCase().trim()
            if (pClient === normClientName || (normClientName && pClient.includes(normClientName))) {
              (p.members || []).forEach((m) => {
                if (m.email) assignedTeamEmails.add(m.email.toLowerCase().trim())
                if (m.name) assignedTeamNames.add(m.name.toLowerCase().trim())
              })
            }
          })
        }

        const resolveBranchName = (entity: any) => {
          return entity.branchName || (entity as any).branch || (entity as any).branch_name || (entity.branchId ? branches.find(b => b.id === entity.branchId)?.name : "") || (entity.role === "Super Admin" ? "Global HQ" : "Main Office")
        }

        // ── Process System Users Filtered by Active Company ───────────────
        userList.filter(userBelongsToCompany).forEach((u: any) => {
          const uEmail = (u.email || "").toLowerCase().trim()
          const uName = (u.name || "").toLowerCase().trim()
          if (!uEmail || uEmail === currentUserEmail) return

          const uRole = u.role || "Teams"
          const uBranch = resolveBranchName(u)

          // Super Admin can message everyone in the active company
          if (isSuperAdmin) {
            contactMap.set(uEmail, {
              id: String(u.id || uEmail),
              name: u.name || "User",
              email: uEmail,
              role: uRole,
              companyName: u.companyName || "SAAMPARK Group",
              branchName: uBranch,
              avatar: u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || "user"}`,
              status: "Online",
            })
            return
          }

          // Company Admin can message Super Admin, fellow Admins, and their company Team/Client members
          if (isCompanyAdmin) {
            contactMap.set(uEmail, {
              id: String(u.id || uEmail),
              name: u.name || "User",
              email: uEmail,
              role: uRole,
              companyName: u.companyName || "SAAMPARK Group",
              branchName: uBranch,
              avatar: u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || "user"}`,
              status: "Online",
            })
            return
          }

          // Team Member can message: Super Admin, Company Admin, peer Team members, and assigned clients
          if (isTeamMember) {
            if (uRole === "Super Admin" || uRole === "Admin" || uRole === "Teams") {
              contactMap.set(uEmail, {
                id: String(u.id || uEmail),
                name: u.name || "Colleague",
                email: uEmail,
                role: uRole,
                companyName: u.companyName || "SAAMPARK",
                branchName: uBranch,
                avatar: u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || "user"}`,
                status: "Online",
              })
            } else if (uRole === "Clients") {
              // Only message if client is assigned to this team member's leads or projects
              if (assignedClientEmails.has(uEmail) || assignedClientNames.has(uName)) {
                contactMap.set(uEmail, {
                  id: String(u.id || uEmail),
                  name: u.name || "Client",
                  email: uEmail,
                  role: "Clients",
                  companyName: u.companyName || "Client Account",
                  branchName: uBranch,
                  avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name || "client"}`,
                  status: "Online",
                })
              }
            }
            return
          }

          // Client can message: Super Admin, Company Admin, and team members assigned to their projects/leads
          if (isClient) {
            if (uRole === "Super Admin" || uRole === "Admin") {
              contactMap.set(uEmail, {
                id: String(u.id || uEmail),
                name: u.name || "Support Administrator",
                email: uEmail,
                role: uRole,
                companyName: u.companyName || "Management",
                branchName: uBranch,
                avatar: u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || "admin"}`,
                status: "Online",
              })
            } else if (uRole === "Teams") {
              if (assignedTeamEmails.has(uEmail) || assignedTeamNames.has(uName) || assignedTeamNames.size === 0) {
                contactMap.set(uEmail, {
                  id: String(u.id || uEmail),
                  name: u.name || "Project Specialist",
                  email: uEmail,
                  role: "Teams",
                  companyName: u.companyName || "SAAMPARK Team",
                  branchName: uBranch,
                  avatar: u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || "team"}`,
                  status: "Online",
                })
              }
            }
          }
        })

        // ── Process External Clients Filtered by Active Company ───────────
        clientList.filter(clientBelongsToCompany).forEach((c: any) => {
          const cEmail = (c.email || "").toLowerCase().trim()
          const cName = (c.name || "").toLowerCase().trim()
          if (!cEmail || cEmail === currentUserEmail) return
          const cBranch = resolveBranchName(c)

          // Super Admin and Company Admin can message all clients of this company
          if (isSuperAdmin || isCompanyAdmin) {
            if (!contactMap.has(cEmail)) {
              contactMap.set(cEmail, {
                id: String(c.id || cEmail),
                name: c.name || "Client",
                email: cEmail,
                role: "Clients",
                companyName: c.name || "Client Account",
                branchName: cBranch,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${c.name || "client"}`,
                status: "Online",
              })
            }
          } else if (isTeamMember) {
            // Team member can ONLY message clients assigned to their leads or projects
            if (assignedClientEmails.has(cEmail) || assignedClientNames.has(cName)) {
              if (!contactMap.has(cEmail)) {
                contactMap.set(cEmail, {
                  id: String(c.id || cEmail),
                  name: c.name || "Assigned Client",
                  email: cEmail,
                  role: "Clients",
                  companyName: c.name || "Client Account",
                  branchName: cBranch,
                  avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${c.name || "client"}`,
                  status: "Online",
                })
              }
            }
          }
        })

        const arr = Array.from(contactMap.values())
        setContacts(arr)
        if (arr.length > 0) {
          setSelectedContact((prev) => {
            if (!prev) return arr[0]
            const stillExists = arr.find((c) => c.email.toLowerCase() === prev.email.toLowerCase())
            return stillExists || arr[0]
          })
        } else {
          setSelectedContact(null)
        }
      } catch (err) {
        console.warn("Messages directory load error:", err)
      }
    }

    loadDirectory()
    window.addEventListener("storage", loadDirectory)
    window.addEventListener("saampark_data_synced", loadDirectory)
    window.addEventListener("saampark_company_switched", loadDirectory)
    return () => {
      window.removeEventListener("storage", loadDirectory)
      window.removeEventListener("saampark_data_synced", loadDirectory)
      window.removeEventListener("saampark_company_switched", loadDirectory)
    }
  }, [currentUserEmail, currentUserRole, currentUserName, activeCompanyId, user])

  // 2. Load and poll chat messages scoped by active company
  const targetComp = activeCompanyId || user?.companyId || "tech"
  const previousMessagesRef = React.useRef<ChatMessage[]>([])

  

  // Mark incoming messages as read when viewing contact conversation
  React.useEffect(() => {
    if (!selectedContact || !currentUserEmail) return
    const contactEmailNorm = selectedContact.email.toLowerCase().trim()

    let hasUnread = false
    const updated = messages.map((m) => {
      const isIncoming = m.recipientEmail.toLowerCase().trim() === currentUserEmail
      const isFromContact = m.senderEmail.toLowerCase().trim() === contactEmailNorm
      if (isIncoming && isFromContact && !m.read) {
        hasUnread = true
        return { ...m, read: true, readAt: new Date().toISOString() }
      }
      return m
    })

    if (hasUnread) {
      saveMessagesMutation.mutate(updated)
    }
  }, [selectedContact, messages, currentUserEmail, targetComp])

  // Safe, isolated auto scroll for messages container (does NOT scroll outer window on mobile)
  const scrollToBottom = React.useCallback((smooth = true) => {
    if (!messagesContainerRef.current) return
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    })
  }, [])

  // Filter messages between current user and selected contact
  const currentThread = React.useMemo(() => {
    if (!selectedContact) return []
    const contactEmailNorm = selectedContact.email.toLowerCase().trim()

    return messages.filter((m) => {
      const s = (m.senderEmail || "").toLowerCase().trim()
      const r = (m.recipientEmail || "").toLowerCase().trim()
      return (
        (s === currentUserEmail && r === contactEmailNorm) ||
        (s === contactEmailNorm && r === currentUserEmail)
      )
    })
  }, [messages, selectedContact, currentUserEmail])

  // Filtered by in-chat search query if user is searching
  const displayedThread = React.useMemo(() => {
    if (!searchMessageQuery.trim()) return currentThread
    const q = searchMessageQuery.toLowerCase().trim()
    return currentThread.filter((m) => m.text.toLowerCase().includes(q))
  }, [currentThread, searchMessageQuery])

  // Auto scroll only when switching contact or sending new message
  React.useEffect(() => {
    if (!messagesContainerRef.current) return
    const isContactSwitched = activeContactRef.current !== selectedContact?.email
    const isNewMessageAdded = currentThread.length > prevCountRef.current

    if (isContactSwitched) {
      // Instant jump to bottom for new contact
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    } else if (isNewMessageAdded) {
      // Smooth scroll to bottom on new message
      scrollToBottom(true)
    }

    activeContactRef.current = selectedContact?.email || ""
    prevCountRef.current = currentThread.length
  }, [currentThread.length, selectedContact?.email, scrollToBottom])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedContact || !canSend) return

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderEmail: currentUserEmail,
      senderName: currentUserName,
      recipientEmail: selectedContact.email,
      recipientName: selectedContact.name,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,
    }

    const updated = [...messages, newMsg]
    setInputText("")
    await saveMessagesMutation.mutateAsync(updated)
  }

  const handleDeleteMessage = async (msgId: string) => {
    if (!canDelete) return
    const filtered = messages.filter((m) => m.id !== msgId)
    await messageFeatureService.markDeleted(msgId)
    await saveMessagesMutation.mutateAsync(filtered)
  }

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.email.toLowerCase().includes(searchContact.toLowerCase()) ||
    c.role.toLowerCase().includes(searchContact.toLowerCase())
  )

  if (!canView) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-12">
        <div className="glass-panel p-10 rounded-3xl border border-border shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-3xl mx-auto">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            You do not have permission to view or participate in Messages. Please contact your System Administrator if you require access.
          </p>
        </div>
      </div>
    )
  }

  
  __ctrl = { user, activeCompanyId, branches, canPerformAction, isModuleAllowed, currentUserEmail, currentUserName, currentUserRole, canView, canSend, canDelete, contacts, setContacts, selectedContact, setSelectedContact, msgCompanyKey, messages, saveMessagesMutation, inputText, setInputText, searchContact, setSearchContact, mobileView, setMobileView, isSearchOpen, setIsSearchOpen, searchMessageQuery, setSearchMessageQuery, messagesContainerRef, prevCountRef, activeContactRef, targetComp, previousMessagesRef, scrollToBottom, currentThread, displayedThread, handleSendMessage, handleDeleteMessage, filteredContacts };
  __ctrlRef.current = __ctrl;
return (
    <div className="max-w-[1600px] mx-auto p-2 sm:p-4 md:p-6 h-[calc(100dvh-7.5rem)] md:h-[calc(100vh-6.5rem)] flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="text-blue-600" size={22} />
          <span>Real-Time Messenger</span>
        </h1>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">Live Synchronized with Database</span>
          <span className="sm:hidden">Live</span>
        </div>
      </div>

      <MessagesSection1 ctrl={__ctrl} />
    </div>
  )
}
