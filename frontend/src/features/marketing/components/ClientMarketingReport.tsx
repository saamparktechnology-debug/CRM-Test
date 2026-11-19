"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BarChart3, Calendar, RefreshCw, Eye, Plus, ArrowUpRight, 
  CheckCircle2, Clock, AlertTriangle, TrendingUp, Users, 
  Video, Image as ImageIcon, Sparkles, Share2, Layers, 
  ChevronRight, ExternalLink, Filter, Download, ArrowLeft,
  Building2, Search, CheckCircle, Target, FileText, Zap, Trash2, Edit2, BellRing
} from "lucide-react"
import { MarketingCampaign, MarketingPost, MarketingServiceQuota } from "../types"
import { MarketingService } from "../services/marketingService"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import ViewCreativeModal from "./ViewCreativeModal"
import AddDeliverablePostModal from "./AddDeliverablePostModal"
import CreateCampaignModal from "./CreateCampaignModal"
import { Button } from "@/components/ui/Button"
import { ClientMarketingReportSection1 } from "@/features/marketing/components/clientmarketingreport-sections/ClientMarketingReportSection1"
import { ClientMarketingReportSection2 } from "@/features/marketing/components/clientmarketingreport-sections/ClientMarketingReportSection2"
import { computeClientMarketingReportMemo50 } from "@/features/marketing/hooks/clientmarketingreport-hooks/computeClientMarketingReportMemo50.hooks"
import { computeClientMarketingReportMemo51 } from "@/features/marketing/hooks/clientmarketingreport-hooks/computeClientMarketingReportMemo51.hooks"



export default function ClientMarketingReport() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  const isAdmin = user?.role === "Super Admin" || user?.role === "Admin"
  const canAdd = isAdmin || canPerformAction(user, "Digital Marketing", "add")
  const canEdit = isAdmin || canPerformAction(user, "Digital Marketing", "edit")
  const canDelete = isAdmin || canPerformAction(user, "Digital Marketing", "delete")

  // Data states
  const [campaigns, setCampaigns] = React.useState<MarketingCampaign[]>([])
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string>("")
  const [posts, setPosts] = React.useState<MarketingPost[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState<"7D" | "30D" | "90D">("30D")

  // Client Directory filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [companyFilter, setCompanyFilter] = React.useState<string>("all")

  // Modal states
  const [viewingPost, setViewingPost] = React.useState<MarketingPost | null>(null)
  const [isAddPostOpen, setIsAddPostOpen] = React.useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = React.useState(false)

  // Load all campaigns and posts
  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const rLower = String(user?.role || "").toLowerCase().trim()
      const isClient = rLower === "clients" || rLower === "client" || rLower.includes("client") || Boolean((user as any)?.isClient)
      const isTeam = !isAdmin && !isClient
      const targetComp = (isClient || isTeam) ? "all" : (activeCompanyId || "all")

      const [campaignList, postsList] = await Promise.all([
        MarketingService.getCampaigns(targetComp),
        MarketingService.getPosts()
      ])
      setCampaigns(campaignList || [])
      setPosts(postsList || [])

      // If logged-in user is a Client, strictly auto-select their own campaign (never another client's)
      if (isClient && user) {
        const clientCamp = (campaignList || []).find(c => isRecordAssignedToClient(c, user))
        if (clientCamp) {
          setSelectedCampaignId(clientCamp.id)
        } else {
          setSelectedCampaignId("")
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, activeCompanyId, isAdmin])

  React.useEffect(() => {
    loadData()

    const handleSync = () => {
      loadData()
    }

    window.addEventListener("storage", handleSync)
    window.addEventListener("saampark_data_synced", handleSync)
    window.addEventListener("saampark_invoices_updated", handleSync)
    window.addEventListener("saampark_company_switched", handleSync)
    window.addEventListener("saampark_branch_switched", handleSync)
    window.addEventListener("saampark_subbranch_switched", handleSync)

    return () => {
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("saampark_data_synced", handleSync)
      window.removeEventListener("saampark_invoices_updated", handleSync)
      window.removeEventListener("saampark_company_switched", handleSync)
      window.removeEventListener("saampark_branch_switched", handleSync)
      window.removeEventListener("saampark_subbranch_switched", handleSync)
    }
  }, [loadData])

  // Strict Client Role Identification
  const roleNorm = String(user?.role || "").toLowerCase().trim()
  const isClientRole = roleNorm === "clients" || roleNorm === "client" || roleNorm.includes("client") || Boolean((user as any)?.isClient)

  // Check URL parameters on mount to auto-open client from invoice or deep-link
  React.useEffect(() => {
    if (typeof window !== "undefined" && campaigns.length > 0) {
      const sp = new URLSearchParams(window.location.search)
      const clientParam = sp.get("client") || sp.get("clientName")
      const campaignParam = sp.get("campaign") || sp.get("campaignId") || sp.get("id")
      const invoiceParam = sp.get("invoice")
      
      if (campaignParam && campaigns.some(c => c.id === campaignParam)) {
        if (isClientRole && user) {
          const uEmail = (user.email || "").toLowerCase().trim()
          const uName = (user.name || "").toLowerCase().trim()
          const uId = String(user.id || "").toLowerCase().trim()
          const matched = campaigns.find(c => 
            c.id === campaignParam && 
            ((uEmail && (c.clientEmail || "").toLowerCase().trim() === uEmail) ||
             (uName && (c.clientName || "").toLowerCase().trim().includes(uName)) ||
             (uId && String(c.clientId || "").toLowerCase().trim() === uId))
          )
          if (matched) setSelectedCampaignId(campaignParam)
        } else {
          setSelectedCampaignId(campaignParam)
        }
      } else if (clientParam && !isClientRole) {
        const found = campaigns.find(c => 
          c.clientName.toLowerCase().includes(clientParam.toLowerCase()) ||
          (c.clientEmail && c.clientEmail.toLowerCase() === clientParam.toLowerCase())
        )
        if (found) setSelectedCampaignId(found.id)
      } else if (invoiceParam && !isClientRole) {
        const found = campaigns.find(c => c.invoiceId === invoiceParam)
        if (found) setSelectedCampaignId(found.id)
      }
    }
  }, [campaigns, isClientRole, user])

  // Filtered campaigns for the Client Directory list (with role privacy scoping)
  const filteredCampaigns: any = React.useMemo(() => computeClientMarketingReportMemo50({ activeBranchId, branches, activeSubBranchId, subBranches, campaigns, activeCompanyId, isClientRole, user, isAdmin, searchQuery }), [campaigns, searchQuery, user, isAdmin, isClientRole, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches]);

  // Aggregate stats strictly based on filtered (authorized) campaigns
  const totalClientsCount = filteredCampaigns.length
  const pendingRetainersCount = filteredCampaigns.filter(c => {
    const posted = c.totalPosted || 0
    const total = c.totalCommitment || 1
    const stage = c.stage || (posted >= total ? "Completed" : posted > 0 ? "Action" : "Pending")
    return stage === "Pending"
  }).length
  const inActionRetainersCount = filteredCampaigns.filter(c => {
    const posted = c.totalPosted || 0
    const total = c.totalCommitment || 1
    const stage = c.stage || (posted >= total ? "Completed" : posted > 0 ? "Action" : "Pending")
    return stage === "Action" || stage === "In Progress" || stage === "Active"
  }).length
  const completedRetainersCount = filteredCampaigns.filter(c => {
    const posted = c.totalPosted || 0
    const total = c.totalCommitment || 1
    const stage = c.stage || (posted >= total ? "Completed" : posted > 0 ? "Action" : "Pending")
    return stage === "Completed"
  }).length

  const handleDeleteCampaign = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete the marketing retainer for "${name}"?`)) return
    await MarketingService.deleteCampaign(id)
    setCampaigns(prev => prev.filter(c => c.id !== id))
    if (selectedCampaignId === id) setSelectedCampaignId("")
  }

  const activeCampaign = campaigns.find(c => c && c.id === selectedCampaignId)
  const campaignPosts = React.useMemo(() => {
    if (!Array.isArray(posts)) return []
    return posts.filter(Boolean).filter(p => !activeCampaign || String(p.campaignId) === String(activeCampaign.id) || (activeCampaign.clientId && String(p.clientId) === String(activeCampaign.clientId)))
  }, [posts, activeCampaign])

  // Service Quotas
  const servicesList: any = React.useMemo(() => computeClientMarketingReportMemo51({ activeCampaign }), [activeCampaign?.services]);

  // 1st Post Date & Retainer Timeline Calculation (Starts on 1st published post)
  const calculatedFirstPostDate = React.useMemo(() => {
    if (!activeCampaign) return null
    if (activeCampaign.firstPostDate) return activeCampaign.firstPostDate
    if (campaignPosts && campaignPosts.length > 0) {
      const dates = campaignPosts.map(p => p.date).filter(Boolean).sort()
      if (dates.length > 0) return dates[0]
    }
    return null
  }, [activeCampaign, campaignPosts])

  const calculatedRetainerExpiry = React.useMemo(() => {
    if (!calculatedFirstPostDate || !activeCampaign) return null
    try {
      const durMonths = activeCampaign.packageDurationMonths || 1
      const d = new Date(calculatedFirstPostDate)
      if (isNaN(d.getTime())) return null
      d.setMonth(d.getMonth() + durMonths)
      if (isNaN(d.getTime())) return null
      return d.toISOString().split("T")[0]
    } catch {
      return null
    }
  }, [calculatedFirstPostDate, activeCampaign])

  const retainerRemainingDays = React.useMemo(() => {
    if (!calculatedRetainerExpiry) return null
    try {
      const exp = new Date(calculatedRetainerExpiry).getTime()
      if (isNaN(exp)) return null
      const now = new Date().getTime()
      return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
    } catch {
      return null
    }
  }, [calculatedRetainerExpiry])

  if (isLoading && campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-xs text-zinc-500 font-medium">Loading Client Marketing Intelligence...</p>
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // CLIENT ROLE DEDICATED SCOPING GUARD
  // ═════════════════════════════════════════════════════════════════════
  if (isClientRole && (!selectedCampaignId || !activeCampaign)) {
    if (filteredCampaigns.length > 0) {
      if (selectedCampaignId !== filteredCampaigns[0].id) {
        setSelectedCampaignId(filteredCampaigns[0].id)
      }
    } else {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Sparkles size={24} />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Digital Marketing Retainer Portal</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No active digital marketing retainer campaign was found linked to your client profile (<span className="font-semibold text-zinc-700 dark:text-zinc-300">{user?.email}</span>). Once your campaign is provisioned by the marketing team, your live creative deliverables, posters, reels, and analytics reports will appear here automatically.
            </p>
          </div>
        </div>
      )
    }
  }

  // ═════════════════════════════════════════════════════════════════════
  // VIEW 1: CLIENT MARKETING DIRECTORY LIST (Shown first before clicking)
  // ═════════════════════════════════════════════════════════════════════
  if (!selectedCampaignId || !activeCampaign) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-16">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 sm:px-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                Client Marketing Report
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Client Directory
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Select a client to view their live deliverables, creative assets, and ROI analytics across SAAMPARK Technology &amp; SAAMPARK Digital Marketing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              title="Refresh Directory"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {(isAdmin || canAdd) && (
              <Button
                onClick={() => setIsCreateCampaignOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Marketing Retainer</span>
              </Button>
            )}
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">Total Retainers</span>
              <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{totalClientsCount}</span>
              <span className="text-[10px] text-zinc-500 font-medium block">Client Campaign Contracts</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">Pending</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pendingRetainersCount}</span>
              <span className="text-[10px] text-zinc-500 font-medium block">Awaiting Kickoff / Content</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">In Action</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">{inActionRetainersCount}</span>
              <span className="text-[10px] text-zinc-500 font-medium block">Active Fulfillment & Ads</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 block">Completed</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedRetainersCount}</span>
              <span className="text-[10px] text-zinc-500 font-medium block">Deliverables 100% Fulfilled</span>
            </div>
          </div>
        </div>

        {/* Search & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 sm:px-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, package, or branch..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            Showing {filteredCampaigns.length} marketing {filteredCampaigns.length === 1 ? "retainer" : "retainers"}
          </div>
        </div>

        {/* Client Directory Line-by-Line List Table */}
        {filteredCampaigns.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <Sparkles className="w-12 h-12 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">
              {searchQuery ? "No Matching Clients Found" : "No Marketing Retainers Active"}
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-5">
              {searchQuery 
                ? "Try clearing your search query to view all marketing clients."
                : "Launch a digital marketing retainer contract for your clients with deliverable commitments."}
            </p>
            {(isAdmin || canAdd) && (
              <Button onClick={() => setIsCreateCampaignOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs cursor-pointer px-4 py-2">
                + Create Marketing Retainer
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/50 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Retainer Package</th>
                    <th className="py-3 px-4">Stage</th>
                    <th className="py-3 px-4">Deliverables Fulfillment</th>
                    <th className="py-3 px-4">Performance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800 text-xs">
                  {filteredCampaigns.map((camp) => {
                    const campCommitment = camp.totalCommitment || 1
                    const campPosted = camp.totalPosted || 0
                    const progressPct = Math.min(100, Math.round((campPosted / campCommitment) * 100))
                    const currentStage = camp.stage || (campPosted >= campCommitment ? "Completed" : (campPosted > 0 ? "Action" : "Pending"))

                    return (
                      <tr
                        key={camp.id}
                        onClick={() => setSelectedCampaignId(camp.id)}
                        className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                      >
                        {/* Client column */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 shrink-0">
                              <img
                                src={camp.clientAvatar || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=150&auto=format&fit=crop&q=80"}
                                alt={camp.clientName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-extrabold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                                {camp.clientName}
                              </div>
                              <div className="text-[11px] text-zinc-400">
                                {camp.clientEmail || camp.clientPhone || "Marketing Client"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Package Column */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200">
                            {camp.packageName}
                          </div>
                          <div className="text-[11px] text-zinc-400">
                            {camp.packageDurationMonths || 1} Month Retainer • {camp.startDate || "Ongoing"}
                          </div>
                        </td>

                        {/* Stage Column */}
                        <td className="py-3.5 px-4">
                          {currentStage === "Pending" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Clock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                          {(currentStage === "Action" || currentStage === "In Progress" || currentStage === "Active") && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Zap className="w-3 h-3 text-blue-600" />
                              <span>In Action</span>
                            </span>
                          )}
                          {currentStage === "Completed" && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Completed</span>
                            </span>
                          )}
                        </td>

                        {/* Deliverables fulfillment column */}
                        <td className="py-3.5 px-4 min-w-[180px]">
                          <div className="flex justify-between items-center text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            <span>{campPosted} / {campCommitment} Fulfilled</span>
                            <span className="font-mono text-indigo-600">{progressPct}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </td>

                        {/* Performance column */}
                        <td className="py-3.5 px-4">
                          <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">
                            +{camp.totalLeads || 0} Leads
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {campPosted} Creatives Live
                          </div>
                        </td>

                        {/* Actions column */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedCampaignId(camp.id)}
                              title="View Marketing Report & Creatives"
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Eye size={13} />
                              <span className="hidden sm:inline">View Report</span>
                            </button>
                            {(isAdmin || canDelete) && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCampaign(e, camp.id, camp.clientName)}
                                title="Delete Retainer"
                                className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isCreateCampaignOpen && (
          <CreateCampaignModal
            isOpen={isCreateCampaignOpen}
            onClose={() => setIsCreateCampaignOpen(false)}
            onCampaignCreated={loadData}
          />
        )}
      </div>
    )
  }

  // ═════════════════════════════════════════════════════════════════════
  // VIEW 2: CLIENT MARKETING REPORT OVERVIEW (Opened upon clicking client)
  // ═════════════════════════════════════════════════════════════════════

  // Safe Guard: If active campaign is not found or loaded yet
  if (!activeCampaign) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 font-sans">
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">Marketing retainer campaign not found or still loading...</p>
        <button
          onClick={() => setSelectedCampaignId("")}
          className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer"
        >
          Back to Campaigns List
        </button>
      </div>
    )
  }

  // Data Isolation Guard: If user is a Client, strictly verify this campaign belongs to them
  if (isClientRole && activeCampaign) {
    const uEmail = (user?.email || "").toLowerCase().trim()
    const uName = (user?.name || "").toLowerCase().trim()
    const cEmail = (activeCampaign.clientEmail || "").toLowerCase().trim()
    const cName = (activeCampaign.clientName || "").toLowerCase().trim()
    const cId = String(activeCampaign.clientId || "").toLowerCase().trim()
    const uId = String(user?.id || "").toLowerCase().trim()
    const isSelf = (uEmail && cEmail === uEmail) || (uName && cName.includes(uName)) || (uId && cId === uId)
    if (!isSelf) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-red-600">Access Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are only permitted to view your own organization's digital marketing campaigns.
            </p>
          </div>
        </div>
      )
    }
  }

  // Calculate Aggregates for Selected Client
  const totalCommitment = Number(activeCampaign?.totalCommitment) || 68
  const totalPosted = Number(activeCampaign?.totalPosted) || 0
  const totalDue = Math.max(0, totalCommitment - totalPosted)
  const fulfillmentPercentage = Math.round((totalPosted / (totalCommitment || 1)) * 100)

  
  __ctrl = { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, canPerformAction, isAdmin, canAdd, canEdit, canDelete, campaigns, setCampaigns, selectedCampaignId, setSelectedCampaignId, posts, setPosts, isLoading, setIsLoading, timeRange, setTimeRange, searchQuery, setSearchQuery, companyFilter, setCompanyFilter, viewingPost, setViewingPost, isAddPostOpen, setIsAddPostOpen, isCreateCampaignOpen, setIsCreateCampaignOpen, loadData, roleNorm, isClientRole, filteredCampaigns, totalClientsCount, pendingRetainersCount, inActionRetainersCount, completedRetainersCount, handleDeleteCampaign, activeCampaign, campaignPosts, servicesList, calculatedFirstPostDate, calculatedRetainerExpiry, retainerRemainingDays, totalCommitment, totalPosted, totalDue, fulfillmentPercentage };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-5 animate-in fade-in duration-200 font-sans pb-16">
      <ClientMarketingReportSection1 ctrl={__ctrl} />

      <ClientMarketingReportSection2 ctrl={__ctrl} />

      {/* Modals */}
      {viewingPost && (
        <ViewCreativeModal
          isOpen={Boolean(viewingPost)}
          onClose={() => setViewingPost(null)}
          post={viewingPost}
        />
      )}

      {isAddPostOpen && (
        <AddDeliverablePostModal
          isOpen={isAddPostOpen}
          onClose={() => setIsAddPostOpen(false)}
          campaign={activeCampaign}
          onPostAdded={loadData}
        />
      )}

      {isCreateCampaignOpen && (
        <CreateCampaignModal
          isOpen={isCreateCampaignOpen}
          onClose={() => setIsCreateCampaignOpen(false)}
          onCampaignCreated={loadData}
        />
      )}
    </div>
  )
}
