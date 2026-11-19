"use client"

import * as React from "react"
import { 
  X, Check, Bold, Italic, Underline, List, ListOrdered, Table, Link2, Code, Sparkles, 
  Minus, Maximize2, Users, UserCheck, Search, Percent, ExternalLink, Globe, GitBranch, 
  Server, Layers, Megaphone, Video, Image as ImageIcon, Calendar, MapPin, Receipt, 
  RefreshCw, FileText, CheckCircle2, DollarSign, Clock
} from "lucide-react"
import { Project, ProjectMember, ProjectStatus, ProjectType, isMarketingProject } from "../types"
import { updateProject } from "../services/projectService"
import { getInvoices, updateInvoice } from "@/features/invoice/services/invoiceService"
import { getUsers } from "@/features/users/services/userService"
import { UserService } from "@/services/apiServices"
import { ProjectCompletionModal } from "./ProjectCompletionModal"
import { EditProjectModalSection1 } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalSection1"
import { EditProjectModalSection2 } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalSection2"
import { EditProjectModalSection3 } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalSection3"
import { EditProjectModalSection4 } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalSection4"
import { createEditProjectModalHandler1 } from "@/features/projects/hooks/editprojectmodal-hooks/createEditProjectModalHandler1.hooks"


import { type EditProjectModalProps, toDateInputValue } from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"
export * from "@/features/projects/components/editprojectmodal-sections/EditProjectModalHelpers"

export function EditProjectModal({
  isOpen,
  project,
  onClose,
  onProjectUpdated,
}: EditProjectModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const [title, setTitle] = React.useState("")
  const [projectType, setProjectType] = React.useState<ProjectType>("Client Project")
  const [projectCategory, setProjectCategory] = React.useState<"Technical Project" | "Digital Marketing Retainer">("Technical Project")
  const [client, setClient] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [labelsList, setLabelsList] = React.useState<string[]>([])
  const [newLabelInput, setNewLabelInput] = React.useState("")
  const [status, setStatus] = React.useState<ProjectStatus>("Open")
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([])
  const [memberShares, setMemberShares] = React.useState<Record<string, number>>({})
  const [memberPayoutTypes, setMemberPayoutTypes] = React.useState<Record<string, "percentage" | "fixed">>({})
  const [memberAmounts, setMemberAmounts] = React.useState<Record<string, number>>({})
  const [memberSearchQuery, setMemberSearchQuery] = React.useState("")
  const [teamMembers, setTeamMembers] = React.useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isCompletionModalOpen, setIsCompletionModalOpen] = React.useState(false)

  // Technical Project specific state
  const [techStack, setTechStack] = React.useState<string[]>([])
  const [newTechInput, setNewTechInput] = React.useState("")
  const [gitUrl, setGitUrl] = React.useState("")
  const [liveUrl, setLiveUrl] = React.useState("")
  const [hostingEnvironment, setHostingEnvironment] = React.useState("Dedicated Linux VPS")
  const [scopeDeliverables, setScopeDeliverables] = React.useState("")

  // Digital Marketing Retainer specific state
  const [planTier, setPlanTier] = React.useState("Grow")
  const [postersQuota, setPostersQuota] = React.useState(12)
  const [reelsQuota, setReelsQuota] = React.useState(2)
  const [shootDate, setShootDate] = React.useState("")
  const [shootLocation, setShootLocation] = React.useState("")
  const [targetGeo, setTargetGeo] = React.useState("")
  const [monthlyAdBudget, setMonthlyAdBudget] = React.useState(0)
  const [driveUrl, setDriveUrl] = React.useState("")

  // Attached invoice state
  const [attachedInvoice, setAttachedInvoice] = React.useState<any | null>(null)
  const [isLoadingInvoice, setIsLoadingInvoice] = React.useState(false)

  // Load team members reliably from both DB and API
  React.useEffect(() => {
    if (isOpen) {
      Promise.all([
        getUsers("all").catch(() => []),
        UserService.getTeamMembers().catch(() => []),
      ]).then(([dbUsers, apiUsers]) => {
        const combined = [
          ...(Array.isArray(dbUsers) ? dbUsers : []),
          ...(Array.isArray(apiUsers) ? apiUsers : []),
        ]
        const unique = new Map<string, any>()
        for (const u of combined) {
          if (!u) continue
          const role = (u.role || u.role_name || "").toLowerCase().trim()
          const email = String(u.email || "").toLowerCase().trim()
          const isClient = role.includes("client")
          const isAdmin = role.includes("admin") || role.includes("super") || email.includes("superadmin") || email === "saampark.official@gmail.com"
          const isInactive = u.status === "Inactive"
          const uId = String(u.id || u._id || u.email)
          if (!isClient && !isAdmin && !isInactive && !unique.has(uId.toLowerCase())) {
            unique.set(uId.toLowerCase(), {
              id: uId,
              name: u.name || u.full_name || "Team Member",
              role: u.role || u.role_name || u.department || "Developer",
              email: u.email || "",
              avatar: u.avatarUrl || u.avatar_url || u.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.name || u.full_name || uId}`,
            })
          }
        }
        setTeamMembers(Array.from(unique.values()))
      }).catch((err) => {
        console.error("Error loading team members in EditProjectModal:", err)
      })
    }
  }, [isOpen])

  // Initialize form when project prop changes
  React.useEffect(() => {
    if (project) {
      const isMkt = isMarketingProject(project)
      setProjectCategory(isMkt ? "Digital Marketing Retainer" : "Technical Project")

      setTitle(project.title || "")
      setProjectType(project.projectType || "Client Project")
      setClient(project.client || "")
      setDescription(project.description || "")
      setStartDate(project.startDate || "")
      setDeadline(project.deadline || "")
      setPrice(project.price || "")
      setLabelsList(project.labels || [])
      setStatus(project.status || "Open")

      // Tech details
      setTechStack(Array.isArray(project.techStack) && project.techStack.length > 0 ? project.techStack : ["Next.js", "React", "Node.js", "PostgreSQL"])
      setGitUrl(project.gitUrl || "")
      setLiveUrl(project.liveUrl || "")
      setHostingEnvironment(project.hostingEnvironment || "Dedicated Linux VPS")
      setScopeDeliverables(project.scopeDeliverables || "")

      // Marketing details
      const mkt = project.marketingRetainer || {}
      setPlanTier(mkt.planTier || project.marketingPackage?.planName || "Grow")
      setPostersQuota(mkt.postersQuota !== undefined ? mkt.postersQuota : (project.marketingPackage?.postersCount ?? 12))
      setReelsQuota(mkt.reelsQuota !== undefined ? mkt.reelsQuota : (project.marketingPackage?.reelsCount ?? 2))
      setShootDate(mkt.shootDate || "")
      setShootLocation(mkt.shootLocation || "")
      setTargetGeo(mkt.targetGeo || "")
      setMonthlyAdBudget(mkt.monthlyAdBudget || 0)
      setDriveUrl(mkt.driveUrl || "")

      // Fetch attached invoice
      setIsLoadingInvoice(true)
      getInvoices(project.companyId).then((invList) => {
        if (!Array.isArray(invList)) return
        const inv = invList.find((i: any) => 
          (project.invoiceId && (String(i.id) === String(project.invoiceId) || String(i.invoiceNumber) === String(project.invoiceId))) ||
          (project.invoiceNumber && (String(i.invoiceNumber) === String(project.invoiceNumber) || String(i.id) === String(project.invoiceNumber))) ||
          (String(i.project || "").trim().toLowerCase() === String(project.title || "").trim().toLowerCase() && 
           String(i.client || "").trim().toLowerCase() === String(project.client || "").trim().toLowerCase())
        )
        if (inv) {
          setAttachedInvoice(inv)
        }
      }).catch(console.error).finally(() => setIsLoadingInvoice(false))
      
      const numProjTotal = parseFloat(
        String(project.totalAmount ?? project.baseAmount ?? project.price ?? "0").replace(/[^0-9.]/g, "")
      ) || 0

      const initialShares: Record<string, number> = {}
      const initialTypes: Record<string, "percentage" | "fixed"> = {}
      const initialAmounts: Record<string, number> = {}
      const memberIds: string[] = []

      if (Array.isArray(project.members)) {
        project.members.forEach(m => {
          const mId = String(m.id)
          memberIds.push(mId)
          const share = typeof m.sharePercentage === "number" ? m.sharePercentage : 15
          initialShares[mId] = share
          initialTypes[mId] = m.payoutType || "percentage"
          initialAmounts[mId] = typeof m.payoutAmount === "number" ? m.payoutAmount : Math.round((numProjTotal * share) / 100)
        })
      }
      setSelectedMemberIds(memberIds)
      setMemberShares(initialShares)
      setMemberPayoutTypes(initialTypes)
      setMemberAmounts(initialAmounts)
    }
  }, [project])

  if (!isOpen || !project) return null

  // Calculate numeric project total for live commission preview
  const numericProjectTotal = parseFloat(
    String(project.totalAmount ?? project.baseAmount ?? price ?? project.price ?? "0").replace(/[^0-9.]/g, "")
  ) || 0

  // Effective client paid amount: derived from attached invoice or project payments
  const clientPaidAmount = attachedInvoice && typeof attachedInvoice.paidAmount === "number"
    ? attachedInvoice.paidAmount
    : (typeof project.paidAmount === "number"
      ? project.paidAmount
      : (project.paymentStatus === "Paid" || project.status === "Completed"
        ? numericProjectTotal
        : (typeof project.advanceAmount === "number" ? project.advanceAmount : 0)))

  const clientDueAmount = Math.max(0, numericProjectTotal - clientPaidAmount)
  const clientPaidRatio = numericProjectTotal > 0 ? Math.min(1, clientPaidAmount / numericProjectTotal) : 0
  const isSubscriptionProject = projectCategory === "Digital Marketing Retainer" || Boolean(project.subscriptionId) || String(project.title).toLowerCase().includes("package") || String(project.title).toLowerCase().includes("retainer")

  const handleToggleMember = (mem: any) => {
    const memId = String(mem.id)
    setSelectedMemberIds((prev) => {
      if (prev.includes(memId)) {
        return prev.filter((id) => id !== memId)
      } else {
        if (memberShares[memId] === undefined) {
          setMemberShares((s) => ({ ...s, [memId]: 15 }))
        }
        if (memberPayoutTypes[memId] === undefined) {
          setMemberPayoutTypes((t) => ({ ...t, [memId]: "percentage" }))
        }
        if (memberAmounts[memId] === undefined) {
          const defaultAmt = Math.round((numericProjectTotal * 15) / 100) || 5000
          setMemberAmounts((a) => ({ ...a, [memId]: defaultAmt }))
        }
        return [...prev, memId]
      }
    })
  }

  const handlePayoutTypeChange = (memId: string, type: "percentage" | "fixed") => {
    setMemberPayoutTypes((prev) => ({ ...prev, [memId]: type }))
    if (type === "fixed" && (!memberAmounts[memId] || memberAmounts[memId] === 0)) {
      const share = memberShares[memId] !== undefined ? memberShares[memId] : 15
      const computedAmt = Math.round((numericProjectTotal * share) / 100) || 5000
      setMemberAmounts((prev) => ({ ...prev, [memId]: computedAmt }))
    }
  }

  const handleAmountChange = (memId: string, amtVal: number) => {
    const clamped = isNaN(amtVal) ? 0 : Math.max(0, amtVal)
    setMemberAmounts((prev) => ({ ...prev, [memId]: clamped }))
    if (numericProjectTotal > 0) {
      const calcPct = Math.min(100, Math.round((clamped / numericProjectTotal) * 1000) / 10)
      setMemberShares((prev) => ({ ...prev, [memId]: calcPct }))
    }
  }

  const handleShareChange = (memId: string, shareVal: number) => {
    const clamped = isNaN(shareVal) ? 0 : Math.max(0, Math.min(100, shareVal))
    setMemberShares((prev) => ({
      ...prev,
      [memId]: clamped,
    }))
    if (numericProjectTotal > 0) {
      const calcAmt = Math.round((numericProjectTotal * clamped) / 100)
      setMemberAmounts((prev) => ({ ...prev, [memId]: calcAmt }))
    }
  }

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabelsList(labelsList.filter((l) => l !== labelToRemove))
  }

  const handleAddLabel = () => {
    if (newLabelInput.trim() && !labelsList.includes(newLabelInput.trim())) {
      setLabelsList([...labelsList, newLabelInput.trim()])
      setNewLabelInput("")
    }
  }

  const totalAssignedSharePct = selectedMemberIds.reduce(
    (acc, mId) => acc + (memberShares[mId] !== undefined ? memberShares[mId] : 15),
    0
  )

  const handleSave: any = createEditProjectModalHandler1(() => __ctrlRef.current);

  
  __ctrl = { isOpen, project, onClose, onProjectUpdated, title, setTitle, projectType, setProjectType, projectCategory, setProjectCategory, client, setClient, description, setDescription, startDate, setStartDate, deadline, setDeadline, price, setPrice, labelsList, setLabelsList, newLabelInput, setNewLabelInput, status, setStatus, selectedMemberIds, setSelectedMemberIds, memberShares, setMemberShares, memberPayoutTypes, setMemberPayoutTypes, memberAmounts, setMemberAmounts, memberSearchQuery, setMemberSearchQuery, teamMembers, setTeamMembers, isSubmitting, setIsSubmitting, isCompletionModalOpen, setIsCompletionModalOpen, techStack, setTechStack, newTechInput, setNewTechInput, gitUrl, setGitUrl, liveUrl, setLiveUrl, hostingEnvironment, setHostingEnvironment, scopeDeliverables, setScopeDeliverables, planTier, setPlanTier, postersQuota, setPostersQuota, reelsQuota, setReelsQuota, shootDate, setShootDate, shootLocation, setShootLocation, targetGeo, setTargetGeo, monthlyAdBudget, setMonthlyAdBudget, driveUrl, setDriveUrl, attachedInvoice, setAttachedInvoice, isLoadingInvoice, setIsLoadingInvoice, numericProjectTotal, clientPaidAmount, clientDueAmount, clientPaidRatio, isSubscriptionProject, handleToggleMember, handlePayoutTypeChange, handleAmountChange, handleShareChange, handleRemoveLabel, handleAddLabel, totalAssignedSharePct, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Edit Project
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
              projectCategory === "Digital Marketing Retainer"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
            }`}>
              {projectCategory === "Digital Marketing Retainer" ? "Digital Marketing Retainer" : "Technical Project"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Architecture Specification Pill Selector */}
        <div className="px-6 py-2.5 bg-zinc-50/90 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Architecture Type:
          </span>
          <div className="inline-flex rounded-xl p-0.5 bg-zinc-200/70 dark:bg-zinc-700/60 border border-zinc-300 dark:border-zinc-600 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setProjectCategory("Technical Project")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                projectCategory === "Technical Project"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
              }`}
            >
              <Code size={13} />
              <span>Normal / Tech Project</span>
            </button>
            <button
              type="button"
              onClick={() => setProjectCategory("Digital Marketing Retainer")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                projectCategory === "Digital Marketing Retainer"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900"
              }`}
            >
              <Megaphone size={13} />
              <span>Digital Marketing Retainer</span>
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <EditProjectModalSection1 ctrl={__ctrl} />

          <EditProjectModalSection2 ctrl={__ctrl} />
          <EditProjectModalSection3 ctrl={__ctrl} />

          <EditProjectModalSection4 ctrl={__ctrl} />

        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer"
          >
            <X size={14} />
            <span>Close</span>
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSave}
            className="flex items-center gap-1 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            <Check size={14} />
            <span>Save</span>
          </button>
        </div>

      </div>

      {isCompletionModalOpen && (
        <ProjectCompletionModal
          isOpen={isCompletionModalOpen}
          project={project}
          onClose={() => setIsCompletionModalOpen(false)}
          onConfirmComplete={async (completedData) => {
            const { sendProjectCompletionEmailNotification } = await import("@/services/emailNotificationService")

            const currentMembers: ProjectMember[] = selectedMemberIds.map((mId) => {
              const found = teamMembers.find(
                (t) => String(t.id).toLowerCase() === mId.toLowerCase()
              )
              const pType = memberPayoutTypes[mId] || "percentage"
              const sharePct = memberShares[mId] !== undefined ? Number(memberShares[mId]) : 15
              const manualAmt = memberAmounts[mId] !== undefined ? Number(memberAmounts[mId]) : Math.round((numericProjectTotal * sharePct) / 100)
              const finalPayoutAmt = pType === "fixed" ? manualAmt : Math.round((numericProjectTotal * sharePct) / 100)

              return {
                id: mId,
                name: found?.name || "Team Member",
                role: found?.role || "Developer",
                avatar: found?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${found?.name || mId}`,
                email: found?.email || "",
                payoutType: pType,
                payoutValue: pType === "fixed" ? manualAmt : sharePct,
                payoutAmount: finalPayoutAmt,
                sharePercentage: pType === "fixed" && numericProjectTotal > 0
                  ? Number(((manualAmt / numericProjectTotal) * 100).toFixed(1))
                  : sharePct,
              }
            })

            const updated = await updateProject(project.id, {
              title,
              projectType,
              client: projectType === "Client Project" ? client : "-",
              description,
              startDate,
              deadline,
              price,
              labels: labelsList,
              status: "Completed",
              members: currentMembers,
              progress: 100,
              completedAt: new Date().toISOString(),
              countdownStartDate: completedData.countdownStartDate,
              countdownEndDate: completedData.countdownEndDate,
              planDuration: completedData.planDuration,
              planType: completedData.planType as any,
              firstPostDate: completedData.firstPostDate,
              clientEmail: completedData.clientEmail,
            })

            onProjectUpdated(updated)
            setIsCompletionModalOpen(false)
            onClose()

            if (completedData.notifyClient && completedData.clientEmail) {
              await sendProjectCompletionEmailNotification(
                updated,
                completedData.clientEmail,
                client || project.client,
                {
                  planType: completedData.planType,
                  countdownDuration: completedData.planDuration,
                  countdownStartDate: completedData.countdownStartDate,
                  countdownEndDate: completedData.countdownEndDate,
                  countdownNotice: completedData.planType === "digital_marketing"
                    ? (completedData.firstPostDate 
                        ? `Campaign timeline started from 1st post on ${completedData.firstPostDate} and expires on ${completedData.countdownEndDate}.`
                        : "Campaign countdown paused until first creative post goes live.")
                    : `Your service & hosting countdown started today (${new Date().toLocaleDateString("en-IN")}) and remains active until ${completedData.countdownEndDate}.`,
                }
              )
            }
          }}
        />
      )}
    </div>
  )
}
