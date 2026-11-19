"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ClipboardList, Search, Building2, GitBranch, User, 
  FolderKanban, CreditCard, CheckCircle2, Clock, Filter, 
  ArrowLeft, Shield, Target, Briefcase, FileText, CheckSquare,
  RotateCcw, Sparkles, AlertCircle, Trash2, Calendar, Crown,
  UserCheck, ShieldAlert, Users, Layers, ExternalLink
} from "lucide-react"
import Link from "next/link"
import { useAuthStore, getCompanyFullName } from "@/store/useAuthStore"
import { ActivityLog, ActivityType } from "@/features/activity-logs/types"
import { useActivityLogsQuery, useClearActivityLogsMutation } from "@/features/activity-logs/hooks/useActivityLogs"
import { Button } from "@/components/ui/Button"

export function ActivityLogsSection2({ ctrl }: { ctrl: any }) {
  const { selectedActor, typeFilter, searchQuery, setSelectedActor, setTypeFilter, setSearchQuery, loading, filteredLogs, getTypeMeta, getActorRoleBadge, formatTime, formatExactTime } = ctrl;
  return (
    <>
      {/* Active Filter Indicators */}
      {(selectedActor !== "all" || typeFilter !== "all" || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
          <span className="font-semibold">Active Filters:</span>
          {selectedActor !== "all" && (
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 font-medium">
              Actor: {selectedActor === "__admins_only__" ? "All Admins" : selectedActor}
              <button onClick={() => setSelectedActor("all")} className="hover:text-primary/70 cursor-pointer ml-1">✕</button>
            </span>
          )}
          {typeFilter !== "all" && (
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 font-medium">
              Category: {typeFilter}
              <button onClick={() => setTypeFilter("all")} className="hover:text-primary/70 cursor-pointer ml-1">✕</button>
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 font-medium">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")} className="hover:text-primary/70 cursor-pointer ml-1">✕</button>
            </span>
          )}
          <button 
            onClick={() => { setSelectedActor("all"); setTypeFilter("all"); setSearchQuery("") }}
            className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer ml-2"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Activity Timeline List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">Loading system audit trail...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="py-16 text-center bg-card border border-border rounded-2xl space-y-3 p-6">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mx-auto text-muted-foreground">
            <ClipboardList size={24} />
          </div>
          <h3 className="text-sm font-bold text-foreground">No Activities Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || typeFilter !== "all" || selectedActor !== "all"
              ? "No activities matched your search criteria. Try resetting the filters."
              : "System actions such as creating leads, updating clients, modifying permissions, or billing will appear here automatically."}
          </p>
          {(searchQuery || typeFilter !== "all" || selectedActor !== "all") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => { setSearchQuery(""); setTypeFilter("all"); setSelectedActor("all") }}
              className="text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log, idx) => {
            const meta = getTypeMeta(log.type)
            const Icon = meta.icon

            return (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(idx * 0.02, 0.3) }}
                className="bg-card border border-border hover:border-primary/40 rounded-2xl p-4 transition-all hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${meta.bg}`}>
                    <Icon size={18} className={meta.color} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-foreground">
                        {log.action}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${meta.bg}`}>
                        {log.module || meta.label}
                      </span>
                      {log.companyName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground border border-border flex items-center gap-1">
                          <Building2 size={10} /> {log.companyName}
                        </span>
                      )}
                      {log.branchName && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-muted text-muted-foreground border border-border flex items-center gap-1">
                          <GitBranch size={10} /> {log.branchName}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {log.description}
                    </p>

                    {log.details && (
                      <div className="pt-1 text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-muted/50 p-2 rounded-lg border border-border/60">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actor (Who did what) & Timestamp */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border text-right gap-1">
                  <div 
                    onClick={() => {
                      if (log.userName) setSelectedActor(log.userName)
                    }}
                    title={`Click to filter only actions by ${log.userName || "this user"}`}
                    className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                      {(log.userName || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-foreground hover:underline">
                      {log.userName || "System"}
                    </span>
                    {getActorRoleBadge(log.userRole)}
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5" title={new Date(log.timestamp).toLocaleString()}>
                    <Clock size={11} />
                    <span>{formatTime(log.timestamp)}</span>
                    <span className="hidden sm:inline opacity-60">· {formatExactTime(log.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  );
}
