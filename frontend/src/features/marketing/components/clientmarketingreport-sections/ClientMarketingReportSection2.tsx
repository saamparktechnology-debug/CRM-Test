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

export function ClientMarketingReportSection2({ ctrl }: { ctrl: any }) {
  const { totalCommitment, totalPosted, fulfillmentPercentage, activeCampaign, totalDue, isAdmin, canAdd, setIsAddPostOpen, servicesList, isClientRole, campaignPosts, setViewingPost } = ctrl;
  return (
    <>
      {/* ── SUMMARY METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Total Commitment KPI */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block">Total Commitment</span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">{totalCommitment}</span>
            <span className="text-[10px] text-zinc-400 font-semibold block">Deliverables contracted</span>
          </div>
        </div>

        {/* Total Posted KPI */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block">Delivered So Far</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{totalPosted}</span>
            <span className="text-[10px] text-emerald-600 font-bold block">{fulfillmentPercentage}% fulfilled</span>
          </div>
        </div>

        {/* Total Leads KPI */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 block">Total Marketing Leads</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">+{activeCampaign.totalLeads || 0}</span>
            <span className="text-[10px] text-zinc-400 font-semibold block">Across Meta &amp; Ads</span>
          </div>
        </div>
      </div>

      {/* ── FULFILLMENT PROGRESS & REPUTATION BAR ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
              Contract Fulfillment Progress
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              {fulfillmentPercentage}% Completed
            </span>
          </div>
          <span className="text-xs text-zinc-500">
            <strong className="text-zinc-900 dark:text-zinc-100">{totalPosted}</strong> out of{" "}
            <strong className="text-zinc-900 dark:text-zinc-100">{totalCommitment}</strong> deliverables fulfilled ({totalDue} remaining)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fulfillmentPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* ── 4 SERVICE DELIVERABLE CARDS ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>Commitment vs Delivery Breakdown</span>
            <span className="text-[11px] font-normal text-zinc-400">(Form No - 9 Service Categories)</span>
          </h3>

          {(isAdmin || canAdd) && (
            <Button
              onClick={() => setIsAddPostOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 h-8 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Deliverable</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {servicesList.map((srv) => {
            const pct = Math.min(100, Math.round(((srv.posted || 0) / (srv.commitment || 1)) * 100))
            const due = Math.max(0, (srv.commitment || 0) - (srv.posted || 0))

            return (
              <div
                key={srv.serviceKey}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                      {srv.serviceName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {pct}%
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{srv.posted}</span>
                      <span className="text-xs text-zinc-400 font-semibold"> / {srv.commitment}</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      {due} Due
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden mb-3">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 text-center text-[10px]">
                  <div>
                    <span className="text-zinc-400 block font-medium">Views</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{(srv.views || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Reach</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{(srv.reach || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block font-medium">Leads</span>
                    <span className="font-bold text-emerald-600">+{srv.leads || 0}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RECENT DELIVERABLES TABLE & RECENT ACTIVITY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Deliverables Table */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                Recent Social Media Deliverables &amp; Creatives
              </h3>
              <p className="text-[11px] text-zinc-400">
                Creatives posted across Meta, Instagram, Facebook &amp; Google
              </p>
            </div>

            {(isAdmin || canAdd) && !isClientRole && (
              <Button
                onClick={() => setIsAddPostOpen(true)}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-2.5 rounded-lg cursor-pointer"
              >
                + Add Post
              </Button>
            )}
          </div>

          {campaignPosts.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No creatives recorded yet for this client campaign.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-400">
                    <th className="pb-2.5 font-bold">Creative / Post</th>
                    <th className="pb-2.5 font-bold">Category</th>
                    <th className="pb-2.5 font-bold">Platform</th>
                    <th className="pb-2.5 font-bold">Date &amp; Time</th>
                    <th className="pb-2.5 font-bold">Views / Likes</th>
                    <th className="pb-2.5 font-bold">Reach</th>
                    <th className="pb-2.5 font-bold">Status</th>
                    <th className="pb-2.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {campaignPosts.slice(0, 10).filter(Boolean).map((p) => (
                    <tr key={p.id || Math.random()} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="py-2.5 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={p.contentPreview || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"}
                              alt={p.title || "Creative"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 block truncate max-w-[180px]">
                              {p.title || "Untitled Creative"}
                            </span>
                            <span className="text-[10px] text-zinc-400 block truncate">
                              ID: {p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                          {p.service || "Marketing"}
                        </span>
                      </td>

                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          {p.platform || "Meta"}
                        </span>
                      </td>

                      <td className="py-2.5 pr-2 text-zinc-500 font-medium whitespace-nowrap">
                        {p.publishedAt || "-"}
                      </td>

                      <td className="py-2.5 pr-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <div>{(Number(p.views) || 0).toLocaleString()} 👁️</div>
                        {p.likes ? <div className="text-[10px] font-medium text-rose-600">+{p.likes} ❤️</div> : null}
                      </td>

                      <td className="py-2.5 pr-2 font-bold text-zinc-800 dark:text-zinc-200">
                        {(Number(p.reach) || 0).toLocaleString()}
                      </td>

                      <td className="py-2.5 pr-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800">
                          {p.status || "Posted"}
                        </span>
                      </td>

                      <td className="py-2.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {p.postUrl && (
                            <a
                              href={p.postUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 transition-colors cursor-pointer"
                              title="Open live link on Meta / Social Media"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => setViewingPost(p)}
                            className="px-2 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Campaign Timeline / Recent Activity */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mb-3">
              Campaign Delivery Timeline
            </h3>

            <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {campaignPosts.slice(0, 5).filter(Boolean).map((p) => (
                <div key={p.id || Math.random()} className="relative pl-6 text-xs">
                  <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white dark:ring-zinc-900" />
                  <span className="text-[10px] text-zinc-400 block font-medium">
                    {p.publishedAt || "-"}
                  </span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {p.service || "Marketing Deliverable"} Delivered
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    "{p.title || "Creative Post"}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-4">
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 block mb-0.5">
                Official Retainer Contract
              </span>
              <p className="text-[10px] text-purple-700 dark:text-purple-400">
                Commitments are locked under contract. Deliverables sync automatically upon upload.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
