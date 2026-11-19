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

export function computeClientMarketingReportMemo51(ctx: any) {
  const { activeCampaign } = ctx;
  const __fn: any = () => {
    if (!activeCampaign?.services) return []
    let rawList: any[] = []
    if (Array.isArray(activeCampaign.services)) {
      rawList = activeCampaign.services
    } else if (typeof activeCampaign.services === "object") {
      rawList = Object.values(activeCampaign.services)
    }
    return rawList.filter(Boolean).map((srv: any, idx: number) => {
      if (typeof srv === "string") {
        return {
          serviceKey: `srv_${idx}`,
          serviceName: srv,
          commitment: 10,
          posted: 0,
          views: 0,
          reach: 0,
          leads: 0,
        }
      }
      return {
        serviceKey: srv.serviceKey || srv.key || `srv_${idx}`,
        serviceName: srv.serviceName || srv.name || srv.title || "Marketing Service",
        commitment: Number(srv.commitment) || 0,
        posted: Number(srv.posted) || 0,
        views: Number(srv.views) || 0,
        reach: Number(srv.reach) || 0,
        leads: Number(srv.leads) || 0,
      }
    })
  };
  return __fn();
}
