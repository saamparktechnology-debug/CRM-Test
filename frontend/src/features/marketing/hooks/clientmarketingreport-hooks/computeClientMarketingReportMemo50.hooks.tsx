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
import { MarketingCampaign, MarketingPost, MarketingServiceQuota } from "@/features/marketing/types"
import { MarketingService } from "@/features/marketing/services/marketingService"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import ViewCreativeModal from "@/features/marketing/components/ViewCreativeModal"
import AddDeliverablePostModal from "@/features/marketing/components/AddDeliverablePostModal"
import CreateCampaignModal from "@/features/marketing/components/CreateCampaignModal"
import { Button } from "@/components/ui/Button"
import { ClientMarketingReportSection1 } from "@/features/marketing/components/clientmarketingreport-sections/ClientMarketingReportSection1"
import { ClientMarketingReportSection2 } from "@/features/marketing/components/clientmarketingreport-sections/ClientMarketingReportSection2"

export function computeClientMarketingReportMemo50(ctx: any) {
  const { activeBranchId, branches, activeSubBranchId, subBranches, campaigns, activeCompanyId, isClientRole, user, isAdmin, searchQuery } = ctx;
  const __fn: any = () => {
    const targetBranch = activeBranchId
    const targetBranchObj = (branches || []).find(b => 
      b.id === targetBranch || 
      b.code === targetBranch || 
      b.name?.toLowerCase() === (targetBranch || "").toLowerCase()
    )
    const targetBranchId = String(targetBranchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchCode = String(targetBranchObj?.code || "").toLowerCase().trim()
    const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = activeSubBranchId
    const targetSubBranchObj = (subBranches || []).find(sb => 
      sb.id === targetSubBranch || 
      (sb as any).code === targetSubBranch ||
      (sb as any).name?.toLowerCase() === (targetSubBranch || "").toLowerCase()
    )
    const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchCode = String((targetSubBranchObj as any)?.code || "").toLowerCase().trim()
    const targetSubBranchName = (targetSubBranchObj as any)?.name?.toLowerCase().trim() || ""

    return campaigns.filter(c => {
      // 0. Company filter
      if (activeCompanyId && activeCompanyId !== "all") {
        if (!isMatchingCompany({ id: c.companyId || "consultancy", slug: c.companyId || "consultancy" } as any, activeCompanyId)) return false
      }

      // Branch filter (strict)
      if (targetBranch && targetBranch !== "all" && targetBranch !== "main" && targetBranch !== "hq") {
        const cBranch = String(c.branchId || "").toLowerCase().trim()
        const cBranchName = String(c.branchName || "").toLowerCase().trim()
        if (!cBranch && !cBranchName) return false
        const matchBranch = (targetBranchId && cBranch === targetBranchId) || 
                            (targetBranchCode && cBranch === targetBranchCode) ||
                            (targetBranchName && (cBranchName === targetBranchName || cBranch === targetBranchName))
        if (!matchBranch) return false
      }

      // Sub-Branch filter (strict)
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "main" && targetSubBranch !== "hq" && targetSubBranch !== "all_subbranches") {
        const cSubBranch = String(c.subBranchId || "").toLowerCase().trim()
        const cSubBranchName = String(c.subBranchName || "").toLowerCase().trim()
        if (!cSubBranch && !cSubBranchName) return false
        const matchSubBranch = (targetSubBranchId && cSubBranch === targetSubBranchId) || 
                               (targetSubBranchCode && cSubBranch === targetSubBranchCode) ||
                               (targetSubBranchName && (cSubBranchName === targetSubBranchName || cSubBranch === targetSubBranchName))
        if (!matchSubBranch) return false
      }

      // 1. Client role data isolation: client strictly sees their own campaign ONLY
      if (isClientRole) {
        if (!isRecordAssignedToClient(c, user)) return false
      }

      // 2. Team member data isolation: staff only sees campaigns assigned to or created by them
      if (!isAdmin && user && !isClientRole) {
        const uId = String(user.id || "").trim()
        const uEmail = (user.email || "").toLowerCase().trim()
        const isAssigned = c.assignedMemberId === uId || 
                           (c.assignedMemberEmail && c.assignedMemberEmail.toLowerCase().trim() === uEmail) ||
                           (c.createdBy && c.createdBy.toLowerCase().trim() === uEmail) ||
                           isRecordAssignedToTeamMember(c, user)
        if (!isAssigned) return false
      }

      // 3. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = c.clientName?.toLowerCase().includes(q)
        const matchEmail = c.clientEmail?.toLowerCase().includes(q)
        const matchPkg = c.packageName?.toLowerCase().includes(q)
        const matchBranch = c.branchName?.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchPkg && !matchBranch) return false
      }
      return true
    }).sort((a, b) => {
      const timeA = new Date(a.startDate || 0).getTime()
      const timeB = new Date(b.startDate || 0).getTime()
      if (timeA && timeB && timeA !== timeB) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""))
    })
  };
  return __fn();
}
