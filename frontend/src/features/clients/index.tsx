"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Tag, Upload, Plus, FolderPlus, Receipt } from "lucide-react"

import { ClientTabMode, ClientItem, ContactItem, ClientLabelItem } from "./types"
import { OverviewView } from "./components/OverviewView"
import { ClientsTableView } from "./components/ClientsTableView" // Updated without ID column
import { ContactsTableView } from "./components/ContactsTableView"
import { AddClientModal } from "./components/AddClientModal"
import { ManageClientLabelsModal } from "./components/ManageClientLabelsModal"
import { AddClientProjectModal } from "./components/AddClientProjectModal"
import { ClientHistoryModal } from "./components/ClientHistoryModal"
import { InvoiceModal } from "@/features/invoice/components/InvoiceModal"
import { DocumentStudioModal } from "@/components/documents/DocumentStudioModal"
import {
  getClients,
  saveStoredClient,
  deleteStoredClient,
  getStoredContacts,
  saveStoredContact,
  deleteStoredContact,
  getStoredClientLabels,
  saveStoredClientLabel,
  deleteStoredClientLabel,
  getClientTimestamp,
} from "./services/clientService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices } from "@/features/invoice/services/invoiceService"
import { getPayments } from "@/features/payments/services/paymentService"

import { getUsers } from "@/features/users/services/userService"
import { normalizeCompanyId } from "../leads/services/leadService"

import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { ClientsSection1 } from "@/features/clients/components/clients-sections/ClientsSection1"


export default function ClientsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, branches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const isClientRole = user?.role === "Clients" || user?.role?.toLowerCase().includes("client")
  const canAddClient = !isClientRole && canPerformAction(user, "Clients", "add")
  const canDeleteClient = !isClientRole && canPerformAction(user, "Clients", "delete")

  const [activeTab, setActiveTab] = React.useState<ClientTabMode>("overview")

  const [clients, setClients] = React.useState<ClientItem[]>([])
  const [contacts, setContacts] = React.useState<ContactItem[]>([])
  const [labels, setLabels] = React.useState<ClientLabelItem[]>([])

  const [isAddClientModalOpen, setIsAddClientModalOpen] = React.useState(false)
  const [isManageLabelsModalOpen, setIsManageLabelsModalOpen] = React.useState(false)
  const [selectedClientForEdit, setSelectedClientForEdit] = React.useState<ClientItem | null>(null)

  
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = React.useState(false)
  const [selectedClientForProject, setSelectedClientForProject] = React.useState<ClientItem | null>(null)
  const [initialCreationMode, setInitialCreationMode] = React.useState<"project_and_invoice" | "invoice_only">("project_and_invoice")
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = React.useState(false)
  const [selectedCreatedInvoice, setSelectedCreatedInvoice] = React.useState<any>(null)

  const [isStudioOpen, setIsStudioOpen] = React.useState(false)
  const [studioClient, setStudioClient] = React.useState<ClientItem | null>(null)

  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false)
  const [selectedClientForHistory, setSelectedClientForHistory] = React.useState<ClientItem | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // Sync real client users from userService with local client store
  const loadClientData = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      // Always read fresh from store — avoids stale closure after company/branch switch
      const { activeCompanyId: freshCompanyId, activeBranchId: freshBranchId, activeSubBranchId: freshSubBranchId, branches: freshBranches, subBranches: freshSubBranches, user: freshUser } = useAuthStore.getState()
      const targetComp = (freshCompanyId || freshUser?.companyId || "").toLowerCase().trim()
      const targetBranch = freshBranchId || (freshUser?.role !== "Super Admin" && freshUser?.role !== "Admin" ? freshUser?.branchId : null)
      const targetSubBranch = freshSubBranchId || (freshUser?.role !== "Super Admin" && freshUser?.role !== "Admin" ? freshUser?.subBranchId : null)

      const safeBranches = Array.isArray(freshBranches) ? freshBranches : []
      const targetBranchObj = safeBranches.find((b: any) => {
        if (!b) return false
        const target = String(targetBranch || "").toLowerCase().trim()
        return String(b.id || "").toLowerCase().trim() === target ||
               String(b.name || b.branch_name || b.code || "").toLowerCase().trim() === target
      })
      const targetBranchId = String(targetBranchObj?.id || targetBranch || "").toLowerCase().trim()
      const targetBranchName = String(targetBranchObj?.name || (targetBranchObj as any)?.branch_name || "").toLowerCase().trim()

      const checkBranch = (c: any) => {
        if (!targetBranch || targetBranch === "all" || targetBranch === "hq" || targetBranch === "main" || targetBranchId === "main" || targetBranchId === "hq") return true
        const cBranch = String(c.branchId || c.branch_id || "").toLowerCase().trim()
        const cBranchName = String(c.branchName || c.branch_name || "").toLowerCase().trim()
        const uBranchIds = (c.branchIds && c.branchIds.length > 0)
          ? c.branchIds.map((id: any) => String(id).toLowerCase().trim())
          : []
        if (!cBranch && !cBranchName && uBranchIds.length === 0) return false
        return (cBranch && (cBranch === targetBranchId || (targetBranchName && cBranch === targetBranchName))) ||
               (cBranchName && (cBranchName === targetBranchName || cBranchName === targetBranchId)) ||
               uBranchIds.includes(targetBranchId)
      }

      const safeSubBranches = Array.isArray(freshSubBranches) ? freshSubBranches : []
      const targetSubBranchObj = safeSubBranches.find((sb: any) => {
        if (!sb) return false
        const target = String(targetSubBranch || "").toLowerCase().trim()
        return String(sb.id || "").toLowerCase().trim() === target ||
               String(sb.name || sb.sub_branch_name || sb.code || "").toLowerCase().trim() === target
      })
      const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
      const targetSubBranchName = String(targetSubBranchObj?.name || (targetSubBranchObj as any)?.sub_branch_name || "").toLowerCase().trim()

      const checkSubBranch = (c: any) => {
        if (!targetSubBranch || targetSubBranch === "all" || targetSubBranch === "hq" || targetSubBranch === "main" || targetSubBranchId === "main" || targetSubBranchId === "hq") return true
        const cSubBranch = String(c.subBranchId || c.sub_branch_id || "").toLowerCase().trim()
        const cSubBranchName = String(c.subBranchName || c.sub_branch_name || "").toLowerCase().trim()
        const uSubBranchIds = (c.subBranchIds && c.subBranchIds.length > 0)
          ? c.subBranchIds.map((id: any) => String(id).toLowerCase().trim())
          : []
        if (!cSubBranch && !cSubBranchName && uSubBranchIds.length === 0) return false
        return (cSubBranch && (cSubBranch === targetSubBranchId || (targetSubBranchName && cSubBranch === targetSubBranchName))) ||
               (cSubBranchName && (cSubBranchName === targetSubBranchName || cSubBranchName === targetSubBranchId)) ||
               uSubBranchIds.includes(targetSubBranchId)
      }

      const allUsers = await getUsers("all")
      const clientUsers = allUsers.filter((u) => {
        if (u.role !== "Clients") return false
        if (targetComp && targetComp !== "all") {
          const canonTarget = normalizeCompanyId(targetComp)
          const uCompIds = (u.companyIds && u.companyIds.length > 0)
            ? u.companyIds.map(id => normalizeCompanyId(String(id)))
            : [normalizeCompanyId(String(u.companyId || "tech"))]
          if (!uCompIds.includes(canonTarget)) return false
        }
        if (targetBranch && !checkBranch(u)) {
          return false
        }
        if (targetSubBranch && !checkSubBranch(u)) {
          return false
        }
        return true
      })

      const [storedClientsRaw, storedContacts, storedLabels, allProjects, allInvoices, allPayments] = await Promise.all([
        getClients(targetComp && targetComp !== "all" ? targetComp : undefined),
        getStoredContacts(targetComp && targetComp !== "all" ? targetComp : undefined),
        getStoredClientLabels(targetComp && targetComp !== "all" ? targetComp : undefined),
        getProjects(targetComp && targetComp !== "all" ? targetComp : "all").catch(() => []),
        getInvoices(targetComp && targetComp !== "all" ? targetComp : "all").catch(() => []),
        getPayments(targetComp && targetComp !== "all" ? targetComp : "all").catch(() => []),
      ])

      let storedClients = storedClientsRaw
      if (targetComp && targetComp !== "all") {
        const canonTarget = normalizeCompanyId(targetComp)
        storedClients = storedClients.filter(c => {
          const cComp = normalizeCompanyId(c.companyId || (c as any).company)
          return cComp === canonTarget
        })
      }
      if (targetBranch && targetBranch !== "all") {
        storedClients = storedClients.filter(c => checkBranch(c))
      }
      if (targetSubBranch && targetSubBranch !== "all") {
        storedClients = storedClients.filter(c => checkSubBranch(c))
      }

      const userClientsMap = new Map<string, ClientItem>()

      // 1. Add stored clients first (primary source of truth)
      storedClients.forEach((sc) => {
        const idKey = sc.id.toLowerCase().trim()
        userClientsMap.set(idKey, sc)
        if (sc.email) userClientsMap.set(sc.email.toLowerCase().trim(), sc)
      })

      // 2. Add registered client users if not deleted & not already present
      clientUsers.forEach((cu) => {
        const emailKey = cu.email.toLowerCase().trim()
        const idKey = cu.id.toLowerCase().trim()

        if (!userClientsMap.has(emailKey) && !userClientsMap.has(idKey)) {
          const compName = (cu.companyName && cu.companyName !== "SAAMPARK Technology" && cu.companyName !== "SAAMPARK Group (All Companies)" && cu.companyName !== "Saampark Group")
            ? cu.companyName
            : cu.name

          userClientsMap.set(emailKey, {
            id: cu.id || `cli_${cu.email}`,
            name: compName,
            primaryContact: cu.name || "Primary Contact",
            email: cu.email,
            phone: cu.phone || "N/A",
            group: "VIP",
            label: "Potential",
            labelColor: "#3b82f6",
            projectsCount: 0,
            totalInvoiced: "₹0",
            paymentReceived: "₹0",
            due: "₹0",
          })
        }
      })

      // 3. Enrich each client with live projects count and financial ledger totals
      let mergedClients = Array.from(new Set(userClientsMap.values())).map(c => {
        const cId = (c.id || "").toLowerCase().trim()
        const cName = (c.name || "").toLowerCase().trim()
        const cEmail = (c.email || "").toLowerCase().trim()
        const cPrimary = (c.primaryContact || "").toLowerCase().trim()

        // Helper: does this invoice/project belong to this client?
        // Priority: clientId exact > email exact > name exact (NO substring fuzzy matching)
        const matchesClient = (recordClientId: string, recordClient: string, recordEmail: string) => {
          if (cId && recordClientId && recordClientId === cId) return true
          if (cEmail && recordEmail && recordEmail === cEmail) return true
          if (cName && recordClient && recordClient === cName) return true
          if (cPrimary && recordClient && recordClient === cPrimary) return true
          return false
        }

        // Pass 1: Direct matches
        let matchedProjects = allProjects.filter(p => {
          const pClient = (p.client || "").toLowerCase().trim()
          const pClientId = String(p.clientId || "").toLowerCase().trim()
          const pEmail = ((p as any).clientEmail || (p as any).createdByEmail || "").toLowerCase().trim()
          return matchesClient(pClientId, pClient, pEmail)
        })

        let matchedInvoices = allInvoices.filter(i => {
          const iClient = (i.client || "").toLowerCase().trim()
          const iEmail = (i.clientEmail || "").toLowerCase().trim()
          const iClientId = String((i as any).clientId || "").toLowerCase().trim()
          return matchesClient(iClientId, iClient, iEmail)
        })

        // Pass 2: Cross-link projects and invoices by project title (supports short names like 'App', 'SEO', 'CRM')
        const initialProjTitles = new Set(matchedProjects.map(p => (p.title || "").toLowerCase().trim()).filter(Boolean))
        const initialInvTitles = new Set(matchedInvoices.map(i => (i.project || "").toLowerCase().trim()).filter(Boolean))

        // Expand invoices if their project title matches an existing client project
        matchedInvoices = allInvoices.filter(i => {
          const iClient = (i.client || "").toLowerCase().trim()
          const iEmail = (i.clientEmail || "").toLowerCase().trim()
          const iClientId = String((i as any).clientId || "").toLowerCase().trim()
          const iProject = (i.project || "").toLowerCase().trim()
          return (
            matchesClient(iClientId, iClient, iEmail) ||
            (iProject && initialProjTitles.has(iProject))
          )
        })

        const expandedInvTitles = new Set(matchedInvoices.map(i => (i.project || "").toLowerCase().trim()).filter(Boolean))

        // Expand projects if their title matches a matched invoice project title
        matchedProjects = allProjects.filter(p => {
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
          ...matchedProjects.map(p => (p.title || "").toLowerCase().trim()).filter(Boolean),
          ...expandedInvTitles
        ])

        let totalInvoicedNum = 0
        let totalReceivedNum = 0

        matchedInvoices.forEach(i => {
          const invVal = parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
          const recVal = parseInt((i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
          totalInvoicedNum += invVal
          totalReceivedNum += recVal
        })

        const clientPays = allPayments.filter(pay => {
          const payClient = (pay.client || "").toLowerCase().trim()
          const payEmail = (pay.clientEmail || "").toLowerCase().trim()
          const payProj = (pay.project || "").toLowerCase().trim()
          const payInvId = (pay.invoiceId || "").toLowerCase().trim()
          return (
            matchesClient("", payClient, payEmail) ||
            (payProj && allMatchedProjectTitles.has(payProj)) ||
            (payInvId && matchedInvoices.some(i => i.id.toLowerCase().trim() === payInvId))
          )
        })

        const directPaidSum = clientPays.reduce((s, p) => (p.status !== "Failed" ? s + (p.amountNum || parseInt((p.amount || "0").replace(/[^0-9]/g, "")) || 0) : s), 0)
        const finalPaidNum = Math.max(totalReceivedNum, directPaidSum)
        const finalDueNum = Math.max(0, totalInvoicedNum - finalPaidNum)

        return {
          ...c,
          projectsCount: matchedProjects.length,
          totalInvoiced: `₹${totalInvoicedNum.toLocaleString("en-IN")}`,
          paymentReceived: `₹${finalPaidNum.toLocaleString("en-IN")}`,
          due: `₹${finalDueNum.toLocaleString("en-IN")}`,
        }
      })
.sort(
        (a, b) => getClientTimestamp(b) - getClientTimestamp(a)
      )
      const currentUser = freshUser
      const isClient = currentUser?.role === "Clients" || currentUser?.role?.toLowerCase().includes("client")
      const isTeam = currentUser?.role === "Teams" || (currentUser?.role as string) === "Team"

      if (isClient) {
        // Strictly filter to the client user's own company/profile
        mergedClients = mergedClients.filter(c => isRecordAssignedToClient(c, currentUser))
      } else if (isTeam) {
        // Team member: only see clients with projects/leads assigned to or created by this team member
        const teamAssignedProjects = (allProjects || []).filter(p => isRecordAssignedToTeamMember(p, currentUser))
        const teamClientNames = new Set(teamAssignedProjects.map(p => (p.client || "").toLowerCase().trim()).filter(Boolean))
        const teamClientIds = new Set(teamAssignedProjects.map(p => String(p.clientId || "").toLowerCase().trim()).filter(Boolean))
        mergedClients = mergedClients.filter(c => {
          const cId = String(c.id || "").toLowerCase().trim()
          const cName = (c.name || "").toLowerCase().trim()
          const cPrimary = (c.primaryContact || "").toLowerCase().trim()
          return teamClientNames.has(cName) || teamClientNames.has(cPrimary) || (cId && teamClientIds.has(cId))
        })
      }

      setClients(mergedClients)

      // Convert registered client users into ContactItem format
      const userContactsMap = new Map<string, ContactItem>()

      storedContacts.forEach((sc) => {
        userContactsMap.set(sc.id.toLowerCase().trim(), sc)
        if (sc.email) userContactsMap.set(sc.email.toLowerCase().trim(), sc)
      })

      clientUsers.forEach((cu) => {
        const emailKey = cu.email.toLowerCase().trim()
        const idKey = `cnt_${cu.id}`.toLowerCase().trim()

        if (!userContactsMap.has(emailKey) && !userContactsMap.has(idKey)) {
          userContactsMap.set(emailKey, {
            id: `cnt_${cu.id}`,
            name: cu.name,
            clientName: (cu.companyName && cu.companyName !== "SAAMPARK Technology" && cu.companyName !== "SAAMPARK Group (All Companies)" && cu.companyName !== "Saampark Group") ? cu.companyName : cu.name,
            jobTitle: "Primary Contact",
            email: cu.email,
            phone: cu.phone || "N/A",
            avatarSeed: cu.name,
          })
        }
      })

      let finalContacts = Array.from(new Set(userContactsMap.values()))
      if (isClient) {
        const allowedClientNames = new Set(mergedClients.map(c => c.name.toLowerCase().trim()))
        const allowedClientEmails = new Set(mergedClients.map(c => (c.email || "").toLowerCase().trim()).filter(Boolean))
        finalContacts = finalContacts.filter(cnt => 
          allowedClientNames.has(cnt.clientName.toLowerCase().trim()) || 
          (cnt.email && allowedClientEmails.has(cnt.email.toLowerCase().trim()))
        )
      } else if (isTeam) {
        const allowedClientNames = new Set(mergedClients.map(c => c.name.toLowerCase().trim()))
        finalContacts = finalContacts.filter(cnt => allowedClientNames.has(cnt.clientName.toLowerCase().trim()))
      }

      setContacts(finalContacts)
      setLabels(storedLabels)
    } catch (err) {
      console.warn("Client sync warning:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadClientData(true)
    const handleStorage = () => loadClientData(false)
    window.addEventListener("storage", handleStorage)
    window.addEventListener("saampark_data_synced", handleStorage)
    window.addEventListener("saampark_clients_updated", handleStorage)
    window.addEventListener("saampark_company_switched", handleStorage)
    window.addEventListener("saampark_branch_switched", handleStorage)
    window.addEventListener("saampark_sub_branch_switched", handleStorage)
    window.addEventListener("saampark_subbranch_switched", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("saampark_data_synced", handleStorage)
      window.removeEventListener("saampark_clients_updated", handleStorage)
      window.removeEventListener("saampark_company_switched", handleStorage)
      window.removeEventListener("saampark_branch_switched", handleStorage)
      window.removeEventListener("saampark_sub_branch_switched", handleStorage)
      window.removeEventListener("saampark_subbranch_switched", handleStorage)
    }
  }, [loadClientData])

  const handleSaveClient = async (newClient: ClientItem) => {
    const isEdit = clients.some((c) => c.id === newClient.id)
    await executeWithFeedback(async () => {
      const updated = await saveStoredClient(newClient)
      setClients(updated)
      loadClientData()
    }, {
      actionType: isEdit ? "update" : "create",
      loadingTitle: isEdit ? "Updating Client..." : "Adding New Client...",
      loadingMsg: isEdit ? `Saving updates for ${newClient.name}...` : `Registering ${newClient.name} into database...`,
      successTitle: isEdit ? "Client Updated!" : "Client Created!",
      successMsg: isEdit ? `${newClient.name} has been updated.` : `${newClient.name} was successfully registered.`,
      errorTitle: "Client Save Failed",
    })
  }

  const handleDeleteClient = async (id: string) => {
    if (!canDeleteClient) {
      useActionFeedbackStore.getState().showError({
        title: "Permission Denied",
        message: "You do not have permission to delete clients.",
        actionType: "delete",
      })
      return
    }
    const target = clients.find((c) => c.id === id)
    const clientName = target?.name || "Client"
    const email = target?.email

    await executeWithFeedback(async () => {
      await deleteStoredClient(id, email)
      await deleteStoredContact(id, email)
      await deleteStoredContact(`cnt_${id}`, email)

      setClients((prev) => prev.filter((c) => c.id !== id && (!email || c.email?.toLowerCase().trim() !== email.toLowerCase().trim())))
      setContacts((prev) => prev.filter((cnt) => cnt.id !== id && cnt.id !== `cnt_${id}` && (!email || cnt.email?.toLowerCase().trim() !== email.toLowerCase().trim())))
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Client...",
      loadingMsg: `Removing ${clientName} and associated records...`,
      successTitle: "Client Deleted",
      successMsg: `${clientName} was successfully deleted from records.`,
      errorTitle: "Delete Failed",
    })
  }

  const handleDeleteContact = async (id: string) => {
    await executeWithFeedback(async () => {
      const updated = await deleteStoredContact(id)
      setContacts(updated)
      loadClientData()
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Contact...",
      loadingMsg: "Removing contact from client directory...",
      successTitle: "Contact Removed",
      successMsg: "Contact was successfully removed.",
      errorTitle: "Delete Failed",
    })
  }

  const handleAddLabel = async (label: ClientLabelItem) => {
    await executeWithFeedback(async () => {
      const updated = await saveStoredClientLabel(label)
      setLabels(updated)
    }, {
      actionType: "create",
      loadingTitle: "Creating Tag Label...",
      loadingMsg: `Adding ${label.name} tag...`,
      successTitle: "Tag Added",
      successMsg: `Tag ${label.name} created successfully.`,
      errorTitle: "Tag Creation Failed",
    })
  }

  const handleDeleteLabel = async (id: string) => {
    await executeWithFeedback(async () => {
      const updated = await deleteStoredClientLabel(id)
      setLabels(updated)
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Tag Label...",
      loadingMsg: "Removing label from list...",
      successTitle: "Tag Removed",
      successMsg: "Tag label was removed.",
      errorTitle: "Delete Failed",
    })
  }

  
  __ctrl = { user, activeCompanyId, activeBranchId, branches, canPerformAction, isClientRole, canAddClient, canDeleteClient, activeTab, setActiveTab, clients, setClients, contacts, setContacts, labels, setLabels, isAddClientModalOpen, setIsAddClientModalOpen, isManageLabelsModalOpen, setIsManageLabelsModalOpen, selectedClientForEdit, setSelectedClientForEdit, isAddProjectModalOpen, setIsAddProjectModalOpen, selectedClientForProject, setSelectedClientForProject, initialCreationMode, setInitialCreationMode, isInvoiceModalOpen, setIsInvoiceModalOpen, selectedCreatedInvoice, setSelectedCreatedInvoice, isStudioOpen, setIsStudioOpen, studioClient, setStudioClient, isHistoryModalOpen, setIsHistoryModalOpen, selectedClientForHistory, setSelectedClientForHistory, isLoading, setIsLoading, loadClientData, handleSaveClient, handleDeleteClient, handleDeleteContact, handleAddLabel, handleDeleteLabel };
  __ctrlRef.current = __ctrl;
return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-[1600px] mx-auto p-2"
    >
      <ClientsSection1 ctrl={__ctrl} />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSave={handleSaveClient}
        initialData={selectedClientForEdit}
      />

      {/* Client Project & Invoice History Modal */}
      <ClientHistoryModal
        isOpen={isHistoryModalOpen}
        client={selectedClientForHistory}
        onClose={() => {
          setIsHistoryModalOpen(false)
          setSelectedClientForHistory(null)
        }}
        onSelectInvoice={(inv) => {
          setSelectedCreatedInvoice(inv)
          setIsInvoiceModalOpen(true)
        }}
        onAddProjectForClient={(client) => {
          setSelectedClientForProject(client)
          setInitialCreationMode("project_and_invoice")
          setIsAddProjectModalOpen(true)
        }}
      />

      {/* Add Client Project & Invoice Modal */}
      <AddClientProjectModal
        isOpen={isAddProjectModalOpen}
        client={selectedClientForProject}
        initialMode={initialCreationMode}
        onClose={() => {
          setIsAddProjectModalOpen(false)
          setSelectedClientForProject(null)
        }}
        onProjectCreated={loadClientData}
        onInvoiceCreated={(inv) => {
          setSelectedCreatedInvoice(inv)
          setIsInvoiceModalOpen(true)
        }}
      />

      {/* Generated Invoice View Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        invoice={selectedCreatedInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false)
          setSelectedCreatedInvoice(null)
        }}
      />

      {/* Interactive Split-Screen Live Document Studio */}
      <DocumentStudioModal
        isOpen={isStudioOpen}
        mode="invoice"
        prefilledClient={studioClient}
        onClose={() => {
          setIsStudioOpen(false)
          setStudioClient(null)
        }}
        onSaveSuccess={(inv) => {
          setIsStudioOpen(false)
          setStudioClient(null)
          setSelectedCreatedInvoice(inv)
          setIsInvoiceModalOpen(true)
          loadClientData()
        }}
      />

      {/* Manage Labels Modal */}
      <ManageClientLabelsModal
        isOpen={isManageLabelsModalOpen}
        onClose={() => setIsManageLabelsModalOpen(false)}
        labels={labels}
        onAddLabel={handleAddLabel}
        onDeleteLabel={handleDeleteLabel}
      />
    </motion.div>
  )
}
