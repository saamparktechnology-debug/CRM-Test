"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, Check, X, Eye, Clock, AlertTriangle, Search, Filter, 
  FileText, ShoppingCart, CreditCard, User, Building2, Calendar, 
  ArrowRight, ShieldAlert, Sparkles, RefreshCw, Trash2, CheckCircle2,
  XCircle, ChevronRight, Info, GitBranch
} from "lucide-react"
import { useAuthStore, getUserEntityScope, isMatchingCompany } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ApprovalRequest, ApprovalType, ApprovalStatus } from "@/features/approvals/types"
import { useApprovalsQuery, useApproveRequestMutation, useRejectRequestMutation, useDeleteApprovalMutation } from "@/features/approvals/hooks/useApprovals"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

export function ApprovalsSection1({ ctrl }: { ctrl: any }) {
  const { loadRequests, pendingCount, loading, pendingAmount, approvedCount, rejectedCount, requests, setStatusFilter, statusFilter, searchQuery, setSearchQuery, typeFilter, setTypeFilter } = ctrl;
  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
                Admin Approvals Center
                {pendingCount > 0 && (
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    {pendingCount} Pending
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Review, approve, or reject bills, quotations, and subscriptions created by operational team members.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-border bg-surface hover:bg-surface-hover text-foreground transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Awaiting Approval</p>
            <p className="text-2xl font-black text-foreground mt-1">{pendingCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Action required by Admin</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Clock size={22} className="animate-pulse" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pending Value</p>
            <p className="text-2xl font-black text-foreground mt-1">₹{pendingAmount.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Total unapproved pipeline</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <CreditCard size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved Items</p>
            <p className="text-2xl font-black text-foreground mt-1">{approvedCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Processed & activated</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Rejected Items</p>
            <p className="text-2xl font-black text-foreground mt-1">{rejectedCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Declined with feedback</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
          {[
            { id: "all", label: "All Requests", count: requests.length },
            { id: "pending", label: "Pending", count: pendingCount, highlight: true },
            { id: "approved", label: "Approved", count: approvedCount },
            { id: "rejected", label: "Rejected", count: rejectedCount },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-surface-hover/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                statusFilter === tab.id
                  ? "bg-white/20 text-white"
                  : tab.highlight && tab.count > 0 ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by doc #, client, or team member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface-hover border border-border text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-surface-hover border border-border text-foreground font-semibold focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="invoice">Bills / Invoices</option>
            <option value="quotation">Quotations</option>
            <option value="subscription">Subscriptions</option>
          </select>
        </div>
      </div>

      {/* APPROVALS TABLE */}
    </>
  );
}
