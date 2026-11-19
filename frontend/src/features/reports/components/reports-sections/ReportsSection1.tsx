"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, Download, Calendar, Filter, TrendingUp, Users, 
  DollarSign, CheckSquare, Target, PieChart, ArrowUpRight, ArrowDownRight, FileText,
  Receipt, ShieldCheck, AlertCircle, Building2, MapPin, Search, CheckCircle2, Clock, Landmark, Percent, Layers,
  Megaphone, Video, Image as ImageIcon, Sparkles, Printer
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, SubBranch, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, InvoiceItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { getPayments, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems, isGlobalItemDeleted } from "@/lib/storageSync"
import { getClients } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getLeads } from "@/features/leads/services/leadService"
import { Lead } from "@/features/leads/types"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, BillingCycle } from "@/features/subscriptions/types"
import { getProjects } from "@/features/projects/services/projectService"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { Repeat, Package, Zap, CalendarDays, RefreshCw } from "lucide-react"
import { resolveExportScope, exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { type ReportTab, type InvoiceFilterType, type SubscriptionFilterType } from "@/features/reports/components/reports-sections/ReportsHelpers"

export function ReportsSection1({ ctrl }: { ctrl: any }) {
  const { isSuperAdmin, allowedCompanies, selectedCompanyId, setSelectedCompanyId, setSelectedBranchId, companies, availableBranches, isTeamOrBranchAdmin, selectedBranchId, userAssignedBranchName, userAssignedBranchId, branchMap, handleExportCSV, scopedMarketingCampaigns, scopedSubscriptions, activeTab, setActiveTab } = ctrl;
  return (
    <>
      {/* ── TOP HEADER & MULTI-TIER SCOPING BAR ───────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs mb-1">
            <BarChart3 size={15} /> Business Intelligence & Tax Audit Reports
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <span>Billing & Financial Reports Studio</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            GST & Non-GST tax metrics, recurring subscriptions & MRR, payment dues, revenue realization, and branch-level analytics.
          </p>
        </div>

        {/* Global Filter Controls: Company & Branch Scope */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Company Scope (Super Admin & multi-company Admin) */}
          {(isSuperAdmin || allowedCompanies.length > 1) ? (
            <div className="flex items-center bg-surface border border-border rounded-xl px-2.5 py-1.5 gap-1.5 text-xs font-semibold shadow-2xs">
              <Building2 size={13} className="text-primary" />
              <select
                value={selectedCompanyId}
                onChange={(e) => {
                  setSelectedCompanyId(e.target.value)
                  setSelectedBranchId("all")
                }}
                className="bg-transparent text-foreground focus:outline-hidden cursor-pointer font-bold"
              >
                {isSuperAdmin && <option value="all">🏢 All Companies (Consolidated)</option>}
                {allowedCompanies.map((c) => (
                  <option key={c.id || c.slug} value={c.slug || c.id}>
                    🏢 {c.brand_name || c.name || c.division_name || "Company"}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold shadow-2xs">
              <Building2 size={13} />
              <span>
                {companies.find((c) => isMatchingCompany(c, selectedCompanyId))?.name || "Saampark Group"}
              </span>
            </div>
          )}

          {/* Branch Scope Dropdown (Super Admin & Admin with branch access) */}
          {availableBranches.length > 0 && !isTeamOrBranchAdmin ? (
            <div className="flex items-center bg-surface border border-border rounded-xl px-2.5 py-1.5 gap-1.5 text-xs font-semibold shadow-2xs">
              <MapPin size={13} className="text-blue-500" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-foreground focus:outline-hidden cursor-pointer font-semibold"
              >
                <option value="all">📍 All Branches ({availableBranches.length})</option>
                {availableBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.city ? `(${b.city})` : ""}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Branch Scoped Lock Badge for Branch Admin / Team Member */
            (userAssignedBranchName || userAssignedBranchId) && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold shadow-2xs">
                <MapPin size={13} />
                <span>Scoped Branch: {userAssignedBranchName || branchMap[userAssignedBranchId] || userAssignedBranchId}</span>
              </div>
            )
          )}

          {/* Export Action */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExportCSV}
            className="shadow-md shadow-primary/20 cursor-pointer font-bold"
          >
            Export Detailed CSV
          </Button>
        </div>
      </div>

      {/* ── REPORT NAVIGATION TABS ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-px overflow-x-auto">
        {[
          { id: "revenue", label: "Financial & Tax Overview", icon: DollarSign },
          { id: "digital_marketing", label: `📈 Digital Marketing & Ads (${scopedMarketingCampaigns.length})`, icon: Megaphone },
          { id: "subscriptions", label: `📦 Subscriptions & Retainers (${scopedSubscriptions.length})`, icon: Repeat },
          { id: "gst_analytics", label: "GST & Tax Slab Audit", icon: Landmark },
          { id: "sub_branches", label: "🌿 Sub-Branch Revenue Share (% Wise)", icon: Percent },
          { id: "leads", label: "Leads & Conversion", icon: Target },
          { id: "productivity", label: "Team Productivity", icon: CheckSquare },
          { id: "attendance", label: "Staff & Branch Directory", icon: Users },
          { id: "expenses", label: "Operational Expenses", icon: PieChart },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-primary text-primary bg-primary/5 shadow-2xs"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── TAB 1 & 2: REVENUE & GST BILLS OVERVIEW ────────────────────────── */}
    </>
  );
}
