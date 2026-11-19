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

export function createReportsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { activeTab, subBranchReportData, filteredTableInvoices, clientMap, filteredTableSubscriptions, getSubscriptionMRR, scopedLeads, userProductivity, scopedExpenses, scopedUsers, selectedCompanyId, selectedBranchId } = getCtrl();
    const __fn: any = () => {
    let rows: string[][] = []
    let filename = `saampark_billing_report_${new Date().toISOString().split("T")[0]}.csv`

    if (activeTab === "sub_branches") {
      filename = `saampark_subbranch_revenue_share_report_${new Date().toISOString().split("T")[0]}.csv`
      rows = [
        [
          "Sub-Branch Name",
          "Code",
          "Parent Branch",
          "Partner Name",
          "Partner Phone",
          "Partner Type",
          "Partner Share (%)",
          "Company Share (%)",
          "Invoices Count",
          "Total Invoiced Gross (INR)",
          "Company Retained (INR)",
          "Partner Total Accrued (INR)",
          "Partner Realized Payout (INR)",
          "Partner Pending Due (INR)",
          "Bank Account",
          "IFSC",
          "UPI ID",
          "Status"
        ],
        ...subBranchReportData.map((sb) => [
          sb.name,
          sb.code || "-",
          sb.parentBranchName,
          sb.partnerName || "-",
          sb.partnerPhone || "-",
          sb.partnerType || "Franchise Partner",
          `${sb.sharePct}%`,
          `${sb.companySharePct}%`,
          String(sb.invoicesCount),
          String(sb.totalInvoicedGross),
          String(sb.companyRetainedGross),
          String(sb.partnerEarnedGross),
          String(sb.partnerEarnedRealized),
          String(sb.partnerPendingPayout),
          sb.bankDetails?.accountNumber || "-",
          sb.bankDetails?.ifscCode || "-",
          sb.bankDetails?.upiId || "-",
          sb.status
        ])
      ]
    } else if (activeTab === "revenue" || activeTab === "gst_analytics") {
      rows = [
        [
          "Invoice Number",
          "Client Name",
          "Client GSTIN",
          "Project / Service",
          "Bill Type",
          "Base Taxable (INR)",
          "GST Rate (%)",
          "CGST 9% (INR)",
          "SGST 9% (INR)",
          "Total GST Tax (INR)",
          "Total Invoiced (INR)",
          "Payment Received (INR)",
          "Balance Due (INR)",
          "Bill Date",
          "Due Date",
          "Status",
          "Branch",
        ],
        ...filteredTableInvoices.map((inv) => {
          const isGst = (typeof inv.gstRate === "number" && inv.gstRate > 0) || (typeof inv.gstAmount === "number" && inv.gstAmount > 0) || Boolean(clientMap[inv.client.toLowerCase().trim()]?.gstNumber)
          const rate = inv.gstRate || (isGst ? 18 : 0)
          const totalNum = parseInt((inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
          const taxNum = typeof inv.gstAmount === "number" && inv.gstAmount > 0 
            ? inv.gstAmount 
            : rate > 0 ? Math.round(totalNum - totalNum / (1 + rate / 100)) : 0
          const baseNum = totalNum - taxNum
          const cgst = Math.round(taxNum / 2)
          const sgst = Math.round(taxNum / 2)
          const clientGst = clientMap[inv.client.toLowerCase().trim()]?.gstNumber || "N/A"
          const branchName = inv.branchName || clientMap[inv.client.toLowerCase().trim()]?.branchName || "-"

          return [
            inv.id,
            inv.client,
            clientGst,
            inv.project || "-",
            isGst ? `GST Invoice (${rate}%)` : "Non-GST Invoice",
            String(baseNum),
            `${rate}%`,
            String(cgst),
            String(sgst),
            String(taxNum),
            String(totalNum),
            inv.paymentReceived || "0",
            inv.due || "0",
            inv.billDate || "-",
            inv.dueDate || "-",
            inv.status,
            branchName,
          ]
        }),
      ]
    } else if (activeTab === "subscriptions") {
      rows = [
        [
          "Subscription ID",
          "Plan / Package Name",
          "Model Type",
          "Client Name",
          "Client Company",
          "Client Phone",
          "Billing Cycle",
          "Cycle Amount (INR)",
          "MRR Equivalent (INR)",
          "Start Date",
          "Next Renewal Date",
          "Status",
          "Branch",
          "Company",
        ],
        ...filteredTableSubscriptions.map((s) => [
          s.id,
          s.planName,
          s.subscriptionType === "package" ? "Package Wise" : s.subscriptionType === "emi" ? "EMI Subscription" : "Regular Retainer",
          s.clientName || "-",
          s.clientCompany || "-",
          s.clientPhone || "-",
          s.billingCycle || "Monthly",
          String(s.numericAmount || parseInt(String(s.amount || "0").replace(/[^0-9]/g, "")) || 0),
          String(getSubscriptionMRR(s)),
          s.startDate || "-",
          s.nextBillingDate || "-",
          s.status,
          s.branchName || "-",
          s.companyId || "tech",
        ]),
      ]
    } else if (activeTab === "leads") {
      rows = [
        ["Lead Name", "Primary Contact", "Phone", "Service", "Assigned Owner", "Branch", "Status"],
        ...scopedLeads.map((l) => [
          l.name,
          l.primaryContact || "-",
          l.phone || "-",
          l.service || "-",
          l.caller || l.owner || "-",
          l.branchName || "-",
          l.status,
        ]),
      ]
    } else if (activeTab === "productivity") {
      rows = [
        ["Team Member", "Role", "Department", "Branch", "Assigned Tasks", "Completed Tasks", "Completion Rate", "Avg Time"],
        ...userProductivity.map((up) => [
          up.name,
          up.role,
          up.department,
          up.branchName,
          String(up.assigned),
          String(up.completed),
          up.rate,
          up.avgTime,
        ]),
      ]
    } else if (activeTab === "expenses") {
      rows = [
        ["Expense Ref", "Expense Title", "Project", "Category", "Paid By", "Amount (INR)", "Status", "Branch"],
        ...scopedExpenses.map((e) => [
          e.expenseNumber || "EXP",
          e.title || "-",
          e.projectName || "Overhead",
          e.category || "General",
          e.member || "Admin",
          String(e.amountNum || parseInt(String(e.amount || "0").replace(/[^0-9]/g, "")) || 0),
          e.status || "Pending",
          e.branchName || "-",
        ]),
      ]
    } else {
      rows = [
        ["Employee", "Role", "Status", "Department", "Branch"],
        ...scopedUsers.map((u) => [u.name, u.role, u.status || "Active", u.department || "Operations", u.branchName || "-"]),
      ]
    }

    const scope = resolveExportScope(selectedCompanyId, selectedBranchId)
    const dateStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const headerMetaLines: string[] = [
      `"${scope.name.toUpperCase()} - BUSINESS INTELLIGENCE & AUDIT REPORT"`,
      `"Company: ${scope.name} | GSTIN: ${scope.gstin || 'N/A'} | CIN: ${scope.cin || 'N/A'}"`,
      scope.branchDisplay ? `"${scope.branchDisplay}"` : "",
      scope.subBranchDisplay ? `"${scope.subBranchDisplay}"` : "",
      `"Report Module: ${activeTab.toUpperCase()} | Generated On: ${dateStr}"`,
      `""`, // empty row
    ].filter(Boolean)

    const tableDataLines = rows.map((e) => e.map((val) => `"${String(val || '').replace(/"/g, '""')}"`).join(","))
    const csvContent = "data:text/csv;charset=utf-8," + [...headerMetaLines, ...tableDataLines].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    const cleanComp = scope.name.replace(/[^a-zA-Z0-9_-]/g, "_")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${cleanComp}_${filename}`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  };
    return __fn(...__args);
  };
}
