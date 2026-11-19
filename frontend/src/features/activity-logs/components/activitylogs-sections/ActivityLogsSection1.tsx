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

export function ActivityLogsSection1({ ctrl }: { ctrl: any }) {
  const { loadLogs, isAuthorized, isSuperAdmin, isAdmin, user, loading, handleClearLogs, setTypeFilter, setSelectedActor, typeFilter, selectedActor, filteredLogs, stats, searchQuery, setSearchQuery, selectedCompany, setSelectedCompany, allowedCompanies, actorsList } = ctrl;
  return (
    <>
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/feature/dashboard" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
              <ArrowLeft size={13} /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2.5">
            <ClipboardList className="text-primary" size={24} />
            <span>{isAuthorized ? "Audit & Activity Logs" : "My Activity History"}</span>
            {isSuperAdmin ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                <Crown size={11} /> Super Admin Audit (All Activities)
              </span>
            ) : isAdmin ? (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                <Shield size={11} /> Admin Activity View
              </span>
            ) : (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <UserCheck size={11} /> Personal Audit Trail • {user?.name || "My Account"}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSuperAdmin 
              ? "Comprehensive audit trail tracking every action, admin event, permission change, lead, client, and financial transaction across all companies"
              : isAdmin
              ? "Audit trail for your assigned company and operational activities"
              : "Your verified personal activity audit trail tracking your logins, clock-ins, assigned task completions, and lead operations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => loadLogs()}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </Button>

          {isSuperAdmin && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              className="text-xs font-semibold gap-1.5 text-rose-500 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear History</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metric Cards Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div 
          onClick={() => { setTypeFilter("all"); setSelectedActor("all") }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "all" && selectedActor === "all" ? "bg-primary/5 border-primary shadow-xs" : "bg-card border-border hover:border-primary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">{isAuthorized ? "All Activities" : "My Actions"}</span>
            <ClipboardList size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{filteredLogs.length}</p>
        </div>

        {/* Admin Actions or My Operations Card */}
        {isAuthorized ? (
          <div 
            onClick={() => { setSelectedActor("__admins_only__"); setTypeFilter("all") }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedActor === "__admins_only__" ? "bg-purple-500/10 border-purple-500 shadow-xs" : "bg-card border-border hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Admin Actions</span>
              <Crown size={16} className="text-purple-500" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">{stats.adminActions}</p>
          </div>
        ) : (
          <div 
            onClick={() => setTypeFilter("operations")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              typeFilter === "operations" ? "bg-purple-500/10 border-purple-500 shadow-xs" : "bg-card border-border hover:border-purple-500/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">My Projects & Tasks</span>
              <Briefcase size={16} className="text-purple-500" />
            </div>
            <p className="text-2xl font-black text-foreground mt-2">{stats.operations}</p>
          </div>
        )}

        <div 
          onClick={() => { setTypeFilter("permission"); setSelectedActor("all") }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "permission" ? "bg-amber-500/10 border-amber-500 shadow-xs" : "bg-card border-border hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Permissions & RBAC</span>
            <Shield size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.permissions}</p>
        </div>

        <div 
          onClick={() => { setTypeFilter("lead"); setSelectedActor("all") }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "lead" ? "bg-blue-500/10 border-blue-500 shadow-xs" : "bg-card border-border hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Leads & Deals</span>
            <Target size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.leadsAndClients}</p>
        </div>

        <div 
          onClick={() => { setTypeFilter("finance"); setSelectedActor("all") }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "finance" ? "bg-emerald-500/10 border-emerald-500 shadow-xs" : "bg-card border-border hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Invoices & Billing</span>
            <CreditCard size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-foreground mt-2">{stats.billing}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by action, admin name, role, module, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Company Filter & Actor Filter (Admins only) */}
          {isAuthorized && (
            <>
              <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs">
                <Building2 size={13} className="text-muted-foreground" />
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="bg-transparent text-xs text-foreground font-medium focus:outline-none cursor-pointer"
                >
                  {isSuperAdmin && <option value="all">All Companies</option>}
                  {allowedCompanies.map(c => (
                    <option key={c.id} value={c.id}>
                      {getCompanyFullName(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2.5 py-1.5 text-xs">
                <UserCheck size={13} className="text-primary" />
                <select
                  value={selectedActor}
                  onChange={(e) => setSelectedActor(e.target.value)}
                  className="bg-transparent text-xs text-foreground font-medium focus:outline-none cursor-pointer max-w-[180px] truncate"
                >
                  <option value="all">All Actors</option>
                  <option value="__admins_only__">🛡️ All Admins Only</option>
                  {actorsList.map((a) => (
                    <option key={a.key} value={a.key}>
                      {a.role === "Super Admin" ? "👑 " : a.role === "Admin" ? "🛡️ " : "👤 "}
                      {a.name} ({a.role})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Category Type Filter Buttons */}
          <div className="flex items-center gap-1 bg-background border border-border rounded-xl p-1 overflow-x-auto text-[11px]">
            {[
              { key: "all", label: "All" },
              { key: "permission", label: "Permissions" },
              { key: "lead", label: "Leads" },
              { key: "client", label: "Clients" },
              { key: "finance", label: "Billing" },
              { key: "operations", label: "Operations" },
              { key: "user", label: "Users" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  typeFilter === tab.key
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
