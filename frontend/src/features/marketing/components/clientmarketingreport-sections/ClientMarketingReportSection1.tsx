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

export function ClientMarketingReportSection1({ ctrl }: { ctrl: any }) {
  const { isClientRole, setSelectedCampaignId, activeCampaign, campaigns, selectedCampaignId, calculatedFirstPostDate, calculatedRetainerExpiry, retainerRemainingDays, loadData, isLoading, isAdmin, canAdd, setIsCreateCampaignOpen, totalPosted, totalCommitment } = ctrl;
  return (
    <>
      {/* ── TOP NAV BAR WITH BACK BUTTON ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Back to Client List Button (Staff / Admin only) */}
          {!isClientRole && (
            <button
              onClick={() => setSelectedCampaignId("")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
              title="Return to Client List"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clients</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {activeCampaign.clientName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Marketing Overview
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live Deliverables, Quotas &amp; ROI Analytics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Switch Client Dropdown (Staff / Admin only) */}
          {!isClientRole && campaigns.length > 1 && (
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[11px] text-zinc-500 font-medium">Switch Client:</span>
              <select
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="bg-transparent font-bold text-xs text-zinc-900 dark:text-zinc-100 outline-none cursor-pointer pr-2"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.clientName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range & Retainer Countdown Badge (Starts on 1st Post) */}
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-1.5 shadow-2xs text-xs font-semibold text-purple-900 dark:text-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            {calculatedFirstPostDate ? (
              <span>
                1st Post: <strong>{calculatedFirstPostDate}</strong> → Expiry: <strong>{calculatedRetainerExpiry || ""}</strong>
                {retainerRemainingDays !== null && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    retainerRemainingDays <= 7 ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  }`}>
                    {retainerRemainingDays > 0 ? `${retainerRemainingDays}d left` : "Expired / Renewal Due"}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-300">
                ⏳ Awaiting 1st Post (Retainer countdown starts on 1st live post)
              </span>
            )}
          </div>

          {/* Send Retainer Expiry Alert Button (Staff / Admin only) */}
          {!isClientRole && calculatedFirstPostDate && (
            <button
              type="button"
              onClick={async () => {
                if (!activeCampaign.clientEmail) {
                  alert("Client email is required to send retainer expiry alert.")
                  return
                }
                const { sendRetainerExpiryEmailNotification } = await import("@/services/emailNotificationService")
                const res = await sendRetainerExpiryEmailNotification({
                  to: activeCampaign.clientEmail,
                  clientName: activeCampaign.clientName,
                  packageName: activeCampaign.packageName,
                  durationText: `${activeCampaign.packageDurationMonths || 1} Month Retainer`,
                  firstPostDate: calculatedFirstPostDate,
                  expiryDate: calculatedRetainerExpiry || "",
                  remainingDays: retainerRemainingDays !== null ? retainerRemainingDays : undefined,
                  companyId: (activeCampaign as any).companyId,
                })
                alert(res.message || "Retainer expiry alert dispatched!")
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Send Campaign Expiry & Renewal Reminder email to client"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Send Expiry Alert</span>
            </button>
          )}

          {/* Sync Button */}
          <button
            onClick={loadData}
            title="Sync Metrics"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Sync Now</span>
          </button>

          {(isAdmin || canAdd) && !isClientRole && (
            <Button
              onClick={() => setIsCreateCampaignOpen(true)}
              variant="outline"
              className="text-xs h-9 px-3 border-dashed border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Retainer</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── CLIENT META & SUMMARY KPI BAR ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Client Identity Card */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 shrink-0 shadow-2xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeCampaign.clientAvatar || "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=150&auto=format&fit=crop&q=80"}
              alt={activeCampaign.clientName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                {activeCampaign.clientName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {activeCampaign.status || "Active"}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
              Client ID : <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeCampaign.clientId}</span> | Package : <span className="font-semibold text-zinc-700 dark:text-zinc-300">{activeCampaign.packageName}</span>
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              ({activeCampaign.packageDurationMonths || 3} Months Retainer, Ends {activeCampaign.endDate || "Ongoing"})
            </p>
          </div>
        </div>

        {/* 3-Stage Lifecycle Stepper Widget */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              3-Stage Marketing Lifecycle
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
              (activeCampaign.stage || (totalPosted >= totalCommitment ? "Completed" : totalPosted > 0 ? "Action" : "Pending")) === "Pending"
                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                : (activeCampaign.stage || (totalPosted >= totalCommitment ? "Completed" : totalPosted > 0 ? "Action" : "Pending")) === "Action"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-emerald-600 text-white shadow-xs"
            }`}>
              Current Stage: {activeCampaign.stage || (totalPosted >= totalCommitment ? "Completed" : totalPosted > 0 ? "Action" : "Pending")}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2 rounded-xl border text-center transition-all ${
              (activeCampaign.stage || (totalPosted > 0 ? "Action" : "Pending")) === "Pending"
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60"
            }`}>
              <span className="text-[10px] font-bold block text-amber-700 dark:text-amber-300">Stage 1</span>
              <span className="text-xs font-black block text-zinc-900 dark:text-zinc-100">🕒 Pending</span>
              <span className="text-[9.5px] text-zinc-400 block mt-0.5">Awaiting 1st Post</span>
            </div>

            <div className={`p-2 rounded-xl border text-center transition-all ${
              (activeCampaign.stage || (totalPosted >= totalCommitment ? "Completed" : totalPosted > 0 ? "Action" : "Pending")) === "Action"
                ? "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 shadow-xs ring-2 ring-indigo-500/20"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60"
            }`}>
              <span className="text-[10px] font-bold block text-indigo-700 dark:text-indigo-300">Stage 2</span>
              <span className="text-xs font-black block text-zinc-900 dark:text-zinc-100">⚡ In Action</span>
              <span className="text-[9.5px] text-indigo-600 dark:text-indigo-400 font-semibold block mt-0.5">1st Post Delivered</span>
            </div>

            <div className={`p-2 rounded-xl border text-center transition-all ${
              (activeCampaign.stage || (totalPosted >= totalCommitment ? "Completed" : totalPosted > 0 ? "Action" : "Pending")) === "Completed"
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 shadow-xs"
                : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 opacity-60"
            }`}>
              <span className="text-[10px] font-bold block text-emerald-700 dark:text-emerald-300">Stage 3</span>
              <span className="text-xs font-black block text-zinc-900 dark:text-zinc-100">🏆 Completed</span>
              <span className="text-[9.5px] text-zinc-400 block mt-0.5">All Posts Finished</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
