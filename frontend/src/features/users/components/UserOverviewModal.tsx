import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Phone, Building2, MapPin, Shield, Calendar, 
  CheckCircle2, Clock, AlertCircle, XCircle, FileText, ExternalLink, 
  CreditCard, Landmark, Eye, Check, RefreshCw, Lock, Award, Send, 
  Printer, Sparkles, UserCheck, Briefcase, DollarSign, Layers,
  Camera, Users, Home, Copy
} from "lucide-react"
import { UserItem, KycStatus } from "../types"
import { recordUserAccount, updateUser } from "../services/userService"
import { api } from "@/lib/api"
import { saveModuleDataToDB } from "@/lib/storageSync"
import { useAuthStore, getSelectableCompanies, isMatchingCompany } from "@/store/useAuthStore"
import { createNotification } from "@/services/notificationService"
import { sendKycStatusEmailNotification } from "@/services/emailNotificationService"
import { OfferLetterDocument } from "./OfferLetterDocument"
import { IdentityCardDocument } from "./IdentityCardDocument"
import { UserOverviewModalSection1 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection1"
import { UserOverviewModalSection2 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection2"
import { UserOverviewModalSection3 } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalSection3"


import { type UserOverviewModalProps, KYC_BADGE_CONFIG } from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalHelpers"
export * from "@/features/users/components/useroverviewmodal-sections/UserOverviewModalHelpers"
import { createUserOverviewModalAction20 } from "@/features/users/hooks/useroverviewmodal-hooks/createUserOverviewModalAction20.hooks"
import { createUserOverviewModalAction21 } from "@/features/users/hooks/useroverviewmodal-hooks/createUserOverviewModalAction21.hooks"
import { createUserOverviewModalAction22 } from "@/features/users/hooks/useroverviewmodal-hooks/createUserOverviewModalAction22.hooks"
import { createUserOverviewModalAction23 } from "@/features/users/hooks/useroverviewmodal-hooks/createUserOverviewModalAction23.hooks"
import { createUserOverviewModalAction24 } from "@/features/users/hooks/useroverviewmodal-hooks/createUserOverviewModalAction24.hooks"


export function UserOverviewModal({
  isOpen,
  user,
  onClose,
  onEdit,
  onUserUpdated,
}: UserOverviewModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const currentUser = useAuthStore((state) => state.user)
  const companies = useAuthStore((state) => state.companies)
  const branches = useAuthStore((state) => state.branches)
  const subBranches = useAuthStore((state) => state.subBranches)
  const activeCompanyId = useAuthStore((state) => state.activeCompanyId)
  const canReviewKyc = 
    (currentUser?.role as any) === "Super Admin" || 
    (currentUser?.role as any) === "Admin" || 
    (currentUser?.role as any) === "Branch Admin" || 
    (currentUser?.role as any) === "Sub Branch Admin"

  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, currentUser, branches, subBranches)
  }, [companies, activeCompanyId, currentUser, branches, subBranches])

  const [activeTab, setActiveTab] = React.useState<"kyc" | "offer_letter" | "id_card">("kyc")
  const [previewDocUrl, setPreviewDocUrl] = React.useState<string | null>(null)
  const [isProcessingAction, setIsProcessingAction] = React.useState(false)
  const [rejectReason, setRejectReason] = React.useState("")
  const [showRejectInput, setShowRejectInput] = React.useState(false)

  // Entity selection & Document Customization state
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(() => {
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId
    return user?.companyId || "tech"
  })
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(user?.branchId || "")
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(user?.subBranchId || "")
  const [customJoiningDate, setCustomJoiningDate] = React.useState<string>(user?.joinedDate || "2026-10-01")
  const [customDesignation, setCustomDesignation] = React.useState<string>(user?.designation || user?.role || "Senior Executive")
  const [customCtc, setCustomCtc] = React.useState<string>((user as any)?.ctc || "₹4,80,000 per Annum (INR 4.8 LPA)")
  const [customMonthlySalary, setCustomMonthlySalary] = React.useState<string>("₹40,000 / Month (Gross)")
  const [customDepartment, setCustomDepartment] = React.useState<string>(user?.department || "Operations & Technology")
  const [customReportingManager, setCustomReportingManager] = React.useState<string>("Department Head / Branch Director")
  const [customProbationPeriod, setCustomProbationPeriod] = React.useState<string>("3 Months from Date of Joining")
  const [customWorkingHours, setCustomWorkingHours] = React.useState<string>("Monday – Saturday (9:30 AM to 6:30 PM)")
  const [customWorkMode, setCustomWorkMode] = React.useState<string>("Full-time On-site")
  const [isSendingEmail, setIsSendingEmail] = React.useState(false)
  const [emailStatusMsg, setEmailStatusMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isOpen) {
      useAuthStore.getState().fetchCompanies().catch(() => {})
      useAuthStore.getState().fetchBranches().catch(() => {})
    }
  }, [isOpen])

  const [liveUser, setLiveUser] = React.useState<UserItem>(user!)

  React.useEffect(() => {
    if (user) {
      setLiveUser(user)
      setSelectedCompanyId(user.companyId || (companies[0]?.id || "tech"))
      setSelectedBranchId(user.branchId || "")
      setSelectedSubBranchId(user.subBranchId || (user as any).sub_branch_id || "")
      setCustomJoiningDate(user.joinedDate || "2026-10-01")
      setCustomDesignation(user.designation || user.role || "Senior Executive")
      setCustomCtc((user as any).ctc || "₹4,80,000 per Annum (INR 4.8 LPA)")
      setCustomDepartment(user.department || "Operations & Technology")

      // Fetch fresh profile data directly from MySQL users table
      const identifier = user.id || user.email
      if (identifier) {
        api.get(`/users/${encodeURIComponent(identifier)}`)
          .then((res: any) => {
            const data = res?.data || res
            if (data && (data.id || data.email)) {
              let parsedKyc = data.kyc_data || data.kycData
              if (typeof parsedKyc === "string") {
                try { parsedKyc = JSON.parse(parsedKyc) } catch {}
              }
              setLiveUser((prev) => ({
                ...prev,
                ...data,
                name: data.full_name || data.name || prev.name,
                kycStatus: data.kyc_status || data.kycStatus || prev.kycStatus,
                kycData: parsedKyc || prev.kycData,
              }))
            }
          })
          .catch(() => {})
      }
    }
  }, [user, companies])

  if (!isOpen || !user) return null

  const activeUser = liveUser || user

  // Resolved entities
  const resolvedCompany = companies.find(c => 
    String(c.id).toLowerCase().trim() === String(selectedCompanyId).toLowerCase().trim() ||
    String(c.slug || "").toLowerCase().trim() === String(selectedCompanyId).toLowerCase().trim() ||
    String((c as any).numeric_id || "") === String(selectedCompanyId) ||
    isMatchingCompany(c, selectedCompanyId)
  ) || companies[0]

  const resolvedBranch = branches.find(b => 
    String(b.id) === String(selectedBranchId) || 
    (selectedCompanyId && String(b.company_id) === String(selectedCompanyId))
  ) || branches.find(b => String(b.company_id) === String(resolvedCompany?.id)) || branches[0]

  const resolvedSubBranch = subBranches?.find(sb => 
    String(sb.id) === String(selectedSubBranchId) ||
    (resolvedBranch && String((sb as any).branch_id || (sb as any).branchId) === String(resolvedBranch.id))
  )

  const rawKyc = activeUser.kycData || (activeUser as any).kyc_data
  let kyc: any = null
  if (rawKyc) {
    if (typeof rawKyc === "string") {
      try { kyc = JSON.parse(rawKyc) } catch { kyc = null }
    } else if (typeof rawKyc === "object") {
      kyc = rawKyc
    }
  }

  const kycStatus: KycStatus = (
    activeUser.kycStatus || 
    (activeUser as any).kyc_status || 
    (kyc?.docNumber ? "Processing" : "Pending")
  ) as KycStatus
  const kycConfig = KYC_BADGE_CONFIG[kycStatus] || KYC_BADGE_CONFIG.Pending
  const KycIcon = kycConfig.icon

  const handleApproveKyc: any = createUserOverviewModalAction20(() => __ctrlRef.current);

  const handleRejectKyc: any = createUserOverviewModalAction21(() => __ctrlRef.current);

  const handleApproveBankChange: any = createUserOverviewModalAction22(() => __ctrlRef.current);

  const handleRejectBankChange: any = createUserOverviewModalAction23(() => __ctrlRef.current);

  // Handle Dispatching Offer Letter or ID Card via Email
  const handleSendDocumentEmail: any = createUserOverviewModalAction24(() => __ctrlRef.current);

  // Handle Live Avatar Upload for Team Identity Badge
  const handleAvatarUpload = async (newAvatarUrl: string) => {
    if (!user) return
    const updatedUser: UserItem = {
      ...user,
      avatarUrl: newAvatarUrl,
      avatar: newAvatarUrl,
    }
    await recordUserAccount(updatedUser)
    try {
      const { cascadeUserAvatarChange } = await import("../services/userService")
      cascadeUserAvatarChange(user.name, user.email, newAvatarUrl).catch(() => {})
    } catch (e) {
      console.error(e)
    }
    onUserUpdated?.(updatedUser)
  }

  
  __ctrl = { isOpen, user, onClose, onEdit, onUserUpdated, currentUser, companies, branches, subBranches, activeCompanyId, canReviewKyc, selectableCompanies, activeTab, setActiveTab, previewDocUrl, setPreviewDocUrl, isProcessingAction, setIsProcessingAction, rejectReason, setRejectReason, showRejectInput, setShowRejectInput, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, customJoiningDate, setCustomJoiningDate, customDesignation, setCustomDesignation, customCtc, setCustomCtc, customMonthlySalary, setCustomMonthlySalary, customDepartment, setCustomDepartment, customReportingManager, setCustomReportingManager, customProbationPeriod, setCustomProbationPeriod, customWorkingHours, setCustomWorkingHours, customWorkMode, setCustomWorkMode, isSendingEmail, setIsSendingEmail, emailStatusMsg, setEmailStatusMsg, liveUser, setLiveUser, activeUser, resolvedCompany, resolvedBranch, resolvedSubBranch, rawKyc, kyc, kycStatus, kycConfig, KycIcon, handleApproveKyc, handleRejectKyc, handleApproveBankChange, handleRejectBankChange, handleSendDocumentEmail, handleAvatarUpload };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-5xl bg-surface border border-border shadow-2xl rounded-3xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        <UserOverviewModalSection3 ctrl={__ctrl} />
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* ═══════════════════════════════════════════════════════════════════
              TAB 1: PROFILE & KYC DOCUMENTS
             ═══════════════════════════════════════════════════════════════════ */}
          <UserOverviewModalSection1 ctrl={__ctrl} />

          <UserOverviewModalSection2 ctrl={__ctrl} />

          {/* ═══════════════════════════════════════════════════════════════════
              TAB 3: IDENTITY CARD (ID BADGE) STUDIO
             ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === "id_card" && (
            <div className="space-y-4">
              {/* Entity Selector Bar */}
              <div className="p-4 rounded-2xl bg-surface-hover/30 border border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Select Company */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Building2 size={12} className="text-primary" />
                      <span>Company on Card:</span>
                    </span>
                    {selectableCompanies.length <= 1 && (
                      <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                        🔒 Active Company
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    disabled={selectableCompanies.length <= 1}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden cursor-pointer disabled:opacity-85 disabled:cursor-not-allowed"
                  >
                    {selectableCompanies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.brand_name ? `(${c.brand_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Branch */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} className="text-primary" />
                    <span>Branch Hub on Card:</span>
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Default Headquarters</option>
                    {branches.filter(b => !selectedCompanyId || String(b.company_id) === String(selectedCompanyId)).map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} {b.city ? `(${b.city})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation / Role */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                    <Briefcase size={12} className="text-primary" />
                    <span>Designation on Card:</span>
                  </label>
                  <input
                    type="text"
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    placeholder="e.g. Technical Specialist"
                    className="w-full px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>

              {/* ID Card Graphic Canvas */}
              <div className="overflow-x-auto p-4 flex justify-center bg-zinc-100 dark:bg-zinc-950/60 rounded-3xl border border-border/80">
                <IdentityCardDocument
                  user={{
                    ...user,
                    designation: customDesignation,
                    joinedDate: customJoiningDate,
                  }}
                  company={resolvedCompany}
                  branch={resolvedBranch}
                  subBranch={resolvedSubBranch}
                  interactive={true}
                  onAvatarUpload={handleAvatarUpload}
                  onSendEmail={() => handleSendDocumentEmail("id_card")}
                  isSendingEmail={isSendingEmail}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/60 bg-surface-hover/30 flex justify-between items-center shrink-0 flex-wrap gap-2">
          <span className="text-[11px] text-muted-foreground">
            Saampark Group Human Capital &amp; Operations Studio
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-surface-hover border border-border text-foreground font-semibold text-xs hover:bg-surface-pressed transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </motion.div>

      {/* Fullscreen Document Preview Lightbox */}
      <AnimatePresence>
        {previewDocUrl && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPreviewDocUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] bg-surface rounded-2xl overflow-hidden p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewDocUrl(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
              >
                <X size={20} />
              </button>
              <img
                src={previewDocUrl}
                alt="Document Full Preview"
                className="max-h-[80vh] w-auto object-contain rounded-xl mx-auto"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
