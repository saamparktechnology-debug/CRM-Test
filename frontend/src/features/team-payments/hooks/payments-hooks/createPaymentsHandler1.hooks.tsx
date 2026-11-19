"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Search, 
  RefreshCw, 
  Send, 
  Trash2, 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Shield, 
  Edit, 
  Plus, 
  Lock, 
  Filter,
  Download,
  Printer,
  Sparkles,
  Layers,
  FolderGit2,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Receipt
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { 
  TeamMemberPayoutProfile, 
  TeamPayoutRecord, 
  TeamPayrollKPIs,
  TeamMemberBankingInfo,
  ProjectUserEarningsRecord,
  CustomPaymentAdjustment,
  PayoutType
} from "@/features/team/types"
import { 
  getTeamPayoutProfiles, 
  getPayoutRecords, 
  updateMemberBankingDetails, 
  deletePayoutRecord, 
  sendTeamPaymentReceiptEmail,
  getProjectWiseUserEarnings,
  getCustomAdjustments,
  updateCustomAdjustmentStatus,
  deleteCustomAdjustment,
  recordTeamPayout
} from "@/features/team/services/teamPaymentService"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { EditMemberBankingModal } from "@/features/team/components/EditMemberBankingModal"
import { TeamPaymentReceiptModal } from "@/features/team/components/TeamPaymentReceiptModal"
import { MemberPayoutLedgerModal } from "@/features/team/components/MemberPayoutLedgerModal"
import { DisburseProjectShareModal } from "@/features/team/components/DisburseProjectShareModal"
import { AddCustomAdjustmentModal } from "@/features/team/components/AddCustomAdjustmentModal"
import { Button } from "@/components/ui/Button"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { exportToExcel } from "@/lib/exportUtils"

export function createPaymentsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { activeTab, filteredProfiles, filteredProjectEarnings, filteredCustomAdjustments, filteredRecords } = getCtrl();
    const __fn: any = () => {
    if (activeTab === "directory") {
      exportToExcel({
        filename: `Team_Payroll_Directory_${new Date().toISOString().split("T")[0]}`,
        title: "Team Members Payroll & Banking Directory",
        subtitle: `All Team Members (${filteredProfiles.length} Records)`,
        headers: ["Member Name", "Email", "Role", "Department", "Branch", "Base Salary", "Commission", "Project Earnings", "Total Gross Due", "Paid This Month", "Need To Pay", "Status", "Bank Name", "Account No", "IFSC", "UPI ID"],
        rows: filteredProfiles.map(p => [
          p.name,
          p.email,
          p.role,
          p.department,
          p.branchName || "HQ",
          p.baseSalary,
          p.subscriptionCommission,
          p.projectEarnings,
          p.totalDueThisMonth,
          p.totalPaidThisMonth,
          p.remainingNeedToPay,
          p.payoutStatus,
          p.bankingInfo?.bankName || "-",
          p.bankingInfo?.accountNumber || "-",
          p.bankingInfo?.ifscCode || "-",
          p.bankingInfo?.upiId || "-",
        ])
      })
    } else if (activeTab === "projects") {
      exportToExcel({
        filename: `Project_Wise_Earnings_${new Date().toISOString().split("T")[0]}`,
        title: "Project-Wise User Earnings & Milestone Shares",
        subtitle: `Project Shares (${filteredProjectEarnings.length} Records)`,
        headers: ["Project Title", "Client Name", "Team Member", "Member Role", "Project Total Value", "Client Paid", "Share %", "Member Earned", "Member Disbursed", "Pending Share"],
        rows: filteredProjectEarnings.map(pe => [
          pe.projectTitle,
          pe.clientName,
          pe.memberName,
          pe.memberRole,
          pe.projectTotalValue,
          pe.clientPaymentReceived,
          `${pe.memberSharePercentage}%`,
          pe.memberTotalEarned,
          pe.memberPaidAmount,
          pe.memberPendingAmount,
        ])
      })
    } else if (activeTab === "custom") {
      exportToExcel({
        filename: `Custom_Adjustments_${new Date().toISOString().split("T")[0]}`,
        title: "Custom Allowances & Reimbursements",
        subtitle: `Custom Items (${filteredCustomAdjustments.length} Records)`,
        headers: ["Voucher/ID", "Date", "Team Member", "Category", "Type", "Amount", "Description", "Status"],
        rows: filteredCustomAdjustments.map(ca => [
          ca.id,
          ca.createdDate,
          ca.memberName,
          ca.category,
          ca.type,
          ca.amount,
          ca.description,
          ca.status,
        ])
      })
    } else {
      exportToExcel({
        filename: `All_Payment_History_${new Date().toISOString().split("T")[0]}`,
        title: "Universal Team Payment Disbursement History",
        subtitle: `Disbursement Ledger (${filteredRecords.length} Records)`,
        headers: ["Voucher ID", "Payment Date", "Member Name", "Member Email", "Period / Project", "Payout Category", "Payment Method", "Transaction UTR", "Amount Paid"],
        rows: filteredRecords.map(r => [
          r.id,
          r.paymentDate,
          r.memberName,
          r.memberEmail,
          r.period,
          r.payoutType,
          r.paymentMethod,
          r.transactionRef || "-",
          r.netAmount,
        ])
      })
    }
  };
    return __fn(...__args);
  };
}
