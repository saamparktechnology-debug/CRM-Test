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

export function ReportsSection6({ ctrl }: { ctrl: any }) {
  const { activeTab, scopedLeads, userProductivity, scopedUsers, branchMap, scopedExpenses } = ctrl;
  return (
    <>
      {/* ── TAB 3: LEADS & CONVERSION ────────────────────────────────────── */}
      {activeTab === "leads" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Total Inquiries & Leads</p>
              <p className="text-2xl font-black text-foreground">{scopedLeads.length}</p>
              <p className="text-[11px] text-muted-foreground pt-1">Active Pipeline Volume</p>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Qualified Opportunities</p>
              <p className="text-2xl font-black text-emerald-500">
                {scopedLeads.filter((l) => l.status === "Qualified" || l.status === "Discussion").length}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">High conversion propensity</p>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Deals Won</p>
              <p className="text-2xl font-black text-primary">
                {scopedLeads.filter((l) => l.status === "Won").length}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">Converted to client accounts</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-foreground">Pipeline Leads Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-4">Lead Name</th>
                    <th className="py-3 px-4">Primary Contact</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Service</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {scopedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No leads registered in this scope.
                      </td>
                    </tr>
                  ) : (
                    scopedLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{l.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l.primaryContact || "-"}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{l.phone || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l.service || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l.branchName || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{l.caller || l.owner || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: PRODUCTIVITY REPORT ──────────────────────────────────── */}
      {activeTab === "productivity" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-foreground">Team Member Performance Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-center">Assigned Tasks</th>
                    <th className="py-3 px-4 text-center">Completed Tasks</th>
                    <th className="py-3 px-4 text-center">Completion Rate</th>
                    <th className="py-3 px-4 text-right">Avg Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {userProductivity.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No team members registered yet.
                      </td>
                    </tr>
                  ) : (
                    userProductivity.map((up) => (
                      <tr key={up.name} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{up.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{up.role}</td>
                        <td className="py-3 px-4 text-muted-foreground">{up.department}</td>
                        <td className="py-3 px-4 text-muted-foreground">{up.branchName}</td>
                        <td className="py-3 px-4 text-center font-mono">{up.assigned}</td>
                        <td className="py-3 px-4 text-center font-mono text-emerald-500 font-bold">{up.completed}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-500">{up.rate}</td>
                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">{up.avgTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: STAFF & BRANCH DIRECTORY ─────────────────────────────── */}
      {activeTab === "attendance" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-foreground">Registered Personnel & Branch Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {scopedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No team members found for the selected company and branch scope.
                      </td>
                    </tr>
                  ) : (
                    scopedUsers.map((u) => (
                      <tr key={u.email} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${u.email}`}
                            alt={u.name}
                            className="w-6 h-6 rounded-full border shrink-0"
                          />
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{u.role}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.department || "Operations"}</td>
                        <td className="py-3 px-4 text-muted-foreground">{u.branchName || branchMap[u.branchId] || "-"}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-500">{u.status || "Active"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 6: OPERATIONAL EXPENSES ─────────────────────────────────── */}
      {activeTab === "expenses" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Total Operational Expenses</p>
              <p className="text-2xl font-black text-foreground">
                ₹
                {scopedExpenses
                  .reduce((sum, e) => sum + (e.amountNum || parseInt((e.amount || "0").replace(/[^0-9]/g, "")) || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">{scopedExpenses.length} Recorded Expense Receipts</p>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-black text-amber-500">
                {scopedExpenses.filter((e) => e.status === "Pending").length} Requests
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">Awaiting settlement</p>
            </div>
            <div className="p-5 rounded-2xl bg-surface border border-border space-y-1 shadow-2xs">
              <p className="text-xs font-semibold text-muted-foreground">Approved Settlements</p>
              <p className="text-2xl font-black text-emerald-500">
                {scopedExpenses.filter((e) => e.status === "Approved").length} Settled
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">Verified business costs</p>
            </div>
          </div>

          {/* Expenses Register Table */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <PieChart size={16} className="text-primary" />
              <span>Operational &amp; Project Expenses Register</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold bg-surface-hover/40">
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4">Expense Title</th>
                    <th className="py-3 px-4">Associated Project</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Paid By</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {scopedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">
                        No expense logs recorded for the selected scope.
                      </td>
                    </tr>
                  ) : (
                    scopedExpenses.map((exp) => (
                      <tr key={exp.id || Math.random()} className="hover:bg-surface-hover/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-primary">{exp.expenseNumber || "EXP"}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{exp.title}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {exp.projectName ? (
                            <span className="font-semibold text-blue-600 dark:text-blue-400">💼 {exp.projectName}</span>
                          ) : (
                            <span className="text-zinc-400 italic">General Overhead</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{exp.category}</td>
                        <td className="py-3 px-4 text-foreground">{exp.member || "Admin"}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-500">
                          {exp.amount || `₹${(exp.amountNum || 0).toLocaleString("en-IN")}`}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.status === "Approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {exp.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
