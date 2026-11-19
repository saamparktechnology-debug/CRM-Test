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

export function PaymentsSection2({ ctrl }: { ctrl: any }) {
  const { isLoading, activeTab, filteredProfiles, projectEarnings, canAddPayout, setDisbursingProject, setCustomPayInitialAmount, setCustomPayProjectTitle, setCustomPayType, setPayingProfile, canEditBanking, setEditingBankingProfile, setViewingLedgerProfile, filteredProjectEarnings, filteredRecords, setViewingReceipt, handleResendReceipt, canDeletePayout, handleDeleteVoucher, filteredCustomAdjustments, handleDisburseCustomItem, handleDeleteCustomItem } = ctrl;
  return (
    <>
      {isLoading ? (
        <ThreeDotLoader text="Loading team payroll, project shares & payout history..." fullScreen={false} />
      ) : activeTab === "directory" ? (
        /* ── TAB 1: TEAM MEMBERS PAYROLL & BANKING DIRECTORY ── */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850/70 border-b border-zinc-200/80 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Team Member</th>
                  <th className="py-3.5 px-3">Role & Dept</th>
                  <th className="py-3.5 px-3">Bank & UPI Details</th>
                  <th className="py-3.5 px-3">Base Salary</th>
                  <th className="py-3.5 px-3">Subscription Share</th>
                  <th className="py-3.5 px-3">Assigned Projects & Earnings</th>
                  <th className="py-3.5 px-3">Total Need To Pay</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No team members match the search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => {
                    const b = p.bankingInfo || {}
                    return (
                      <tr key={p.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                        {/* Member Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 font-mono truncate">
                                {p.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role & Dept */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {p.role}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {p.department}
                            {p.branchName && ` • 📍 ${p.branchName}`}
                          </div>
                        </td>

                        {/* Bank & UPI Details */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            {b.accountNumber ? (
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">
                                <Building2 size={11} className="text-blue-500 shrink-0" />
                                <span>{b.bankName || "Bank"} (••••{b.accountNumber.slice(-4)})</span>
                              </div>
                            ) : (
                              <div className="text-[10.5px] text-zinc-400 italic">No bank a/c added</div>
                            )}

                            {b.upiId && (
                              <div className="flex items-center gap-1.5 text-[10.5px] text-teal-600 dark:text-teal-400 font-mono">
                                <QrCode size={10} className="shrink-0" />
                                <span>{b.upiId}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Base Salary */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-zinc-800 dark:text-zinc-200">
                            ₹{p.baseSalary.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-zinc-400">Fixed Monthly</div>
                        </td>

                        {/* Subscription Commission */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-indigo-600 dark:text-indigo-400">
                            +₹{p.subscriptionCommission.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[10px] text-indigo-500/80">
                            {p.activeSubscriptionsCount} Subscriptions
                          </div>
                        </td>

                        {/* Assigned Projects & Share Earnings */}
                        <td className="py-3.5 px-3 min-w-[230px]">
                          {(() => {
                            const memberProjects = projectEarnings.filter(
                              (pe) =>
                                pe.memberId === p.id ||
                                (pe.memberEmail && p.email && pe.memberEmail.toLowerCase() === p.email.toLowerCase())
                            )

                            return (
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1.5">
                                  <div className="font-bold text-purple-600 dark:text-purple-400">
                                    +₹{p.projectEarnings.toLocaleString("en-IN")}
                                  </div>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                    {memberProjects.length} Projects
                                  </span>
                                </div>

                                {memberProjects.length === 0 ? (
                                  <div className="text-[10.5px] text-zinc-400 italic">No assigned projects</div>
                                ) : (
                                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {memberProjects.map((proj) => (
                                      <div
                                        key={proj.id}
                                        className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/70 dark:border-zinc-700/60 text-[10.5px]"
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span
                                            className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]"
                                            title={proj.projectTitle}
                                          >
                                            {proj.projectTitle}
                                          </span>
                                          <span className="text-purple-600 dark:text-purple-400 font-bold shrink-0">
                                            ₹{proj.memberTotalEarned.toLocaleString("en-IN")}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[9.5px] text-zinc-500 mt-0.5">
                                          <span>Share: {proj.memberSharePercentage}%</span>
                                          <span>
                                            Due:{" "}
                                            <strong
                                              className={
                                                proj.memberPendingAmount > 0
                                                  ? "text-amber-600 dark:text-amber-400 font-semibold"
                                                  : "text-emerald-600 dark:text-emerald-400 font-normal"
                                              }
                                            >
                                              ₹{proj.memberPendingAmount.toLocaleString("en-IN")}
                                            </strong>
                                          </span>
                                        </div>
                                        {canAddPayout && proj.memberPendingAmount > 0 && (
                                          <div className="mt-1 pt-1 border-t border-zinc-200/40 dark:border-zinc-700/40 flex justify-end">
                                            <button
                                              type="button"
                                              onClick={() => setDisbursingProject(proj)}
                                              className="text-[9.5px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-0.5"
                                            >
                                              Pay Share →
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })()}
                        </td>

                        {/* Total Need To Pay */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                            ₹{p.remainingNeedToPay.toLocaleString("en-IN")}
                          </div>
                          {p.totalPaidThisMonth > 0 && (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              Paid: ₹{p.totalPaidThisMonth.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          {p.payoutStatus === "Paid" ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
                              <CheckCircle2 size={11} />
                              <span>Paid</span>
                            </span>
                          ) : p.payoutStatus === "Partial" ? (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold text-[10px] border border-amber-200 dark:border-amber-800 inline-flex items-center gap-1">
                              <Clock size={11} />
                              <span>Partial</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-200 dark:border-rose-800 inline-flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={11} />
                              <span>Need to Pay</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Pay Member Button */}
                            {canAddPayout && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomPayInitialAmount(undefined)
                                  setCustomPayProjectTitle(undefined)
                                  setCustomPayType(undefined)
                                  setPayingProfile(p)
                                }}
                                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                                title="Disburse salary and commission payout"
                              >
                                <DollarSign size={12} />
                                <span>Pay</span>
                              </button>
                            )}

                            {/* Pay Custom Amount Button */}
                            {canAddPayout && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomPayInitialAmount(p.remainingNeedToPay > 0 ? p.remainingNeedToPay : undefined)
                                  setCustomPayProjectTitle(undefined)
                                  setCustomPayType("Custom Amount")
                                  setPayingProfile(p)
                                }}
                                className="px-2 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Pay custom amount and generate receipt"
                              >
                                <Receipt size={11} />
                                <span>Pay Custom</span>
                              </button>
                            )}

                            {/* Edit Banking Button */}
                            {canEditBanking && (
                              <button
                                type="button"
                                onClick={() => setEditingBankingProfile(p)}
                                className="px-2 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                                title="Edit Bank and UPI details"
                              >
                                <Building2 size={11} />
                                <span>Bank/UPI</span>
                              </button>
                            )}

                            {/* Payout History Ledger */}
                            <button
                              type="button"
                              onClick={() => setViewingLedgerProfile(p)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                              title="View member payout ledger history"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "projects" ? (
        /* ── TAB 2: PROJECT-WISE USER EARNINGS & PAYOUTS ── */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850/70 border-b border-zinc-200/80 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Project & Client</th>
                  <th className="py-3.5 px-3">Team Member</th>
                  <th className="py-3.5 px-3">Project Value</th>
                  <th className="py-3.5 px-3">Client Payment</th>
                  <th className="py-3.5 px-3">Member Share %</th>
                  <th className="py-3.5 px-3">Total Earned</th>
                  <th className="py-3.5 px-3">Disbursed to Member</th>
                  <th className="py-3.5 px-3">Pending Share</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredProjectEarnings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No project earnings records found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredProjectEarnings.map((pe) => (
                    <tr key={pe.id} className="hover:bg-purple-50/20 dark:hover:bg-purple-950/10 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{pe.projectTitle}</div>
                        <div className="text-[11px] text-zinc-400">Client: <strong className="text-zinc-600 dark:text-zinc-300">{pe.clientName}</strong></div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-zinc-800 dark:text-zinc-200">{pe.memberName}</div>
                        <div className="text-[10px] text-zinc-400">{pe.memberRole}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-zinc-800 dark:text-zinc-200">
                        ₹{pe.projectTotalValue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{pe.clientPaymentReceived.toLocaleString("en-IN")}
                        </span>
                        <div className="text-[9.5px] text-zinc-400">{pe.clientPaymentStatus}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-bold text-[10.5px]">
                          {pe.memberSharePercentage}% Share
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-purple-700 dark:text-purple-300">
                        ₹{pe.memberTotalEarned.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{pe.memberPaidAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`text-sm font-black ${pe.memberPendingAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-zinc-400"}`}>
                          ₹{pe.memberPendingAmount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {canAddPayout && pe.memberPendingAmount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setDisbursingProject(pe)}
                            className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                          >
                            <DollarSign size={12} />
                            <span>Pay Share</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 size={12} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === "history" ? (
        /* ── TAB 3: UNIVERSAL PAYMENT HISTORY ── */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850/70 border-b border-zinc-200/80 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Voucher ID</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Beneficiary Member</th>
                  <th className="py-3.5 px-3">Period / Project</th>
                  <th className="py-3.5 px-3">Payout Category</th>
                  <th className="py-3.5 px-3">Payment Method</th>
                  <th className="py-3.5 px-3">Transaction UTR</th>
                  <th className="py-3.5 px-3 text-right">Net Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No payment vouchers found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {r.id}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500 font-medium whitespace-nowrap">
                        {r.paymentDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{r.memberName}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">{r.memberEmail}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{r.period}</div>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-[10px]">
                          {r.payoutType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-medium text-zinc-600 dark:text-zinc-300">{r.paymentMethod}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                        {r.transactionRef || "-"}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                        ₹{r.netAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Voucher */}
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(r)}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="View printable voucher"
                          >
                            <Eye size={12} />
                            <span>Voucher</span>
                          </button>

                          {/* Email Receipt */}
                          <button
                            type="button"
                            onClick={() => handleResendReceipt(r)}
                            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 cursor-pointer transition-colors"
                            title="Resend receipt email to member"
                          >
                            <Send size={12} />
                          </button>

                          {/* Delete */}
                          {canDeletePayout && (
                            <button
                              type="button"
                              onClick={() => handleDeleteVoucher(r.id)}
                              className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete voucher record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── TAB 4: CUSTOM SECTION (ADJUSTMENTS & ALLOWANCES) ── */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-850/70 border-b border-zinc-200/80 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Adjustment ID</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Team Member</th>
                  <th className="py-3.5 px-3">Compensation Category</th>
                  <th className="py-3.5 px-3">Type</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Description / Reason</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                {filteredCustomAdjustments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-zinc-400">
                      No custom allowances, reimbursements, or bonuses recorded yet. Click "+ Custom Allowance" to add one!
                    </td>
                  </tr>
                ) : (
                  filteredCustomAdjustments.map((ca) => (
                    <tr key={ca.id} className="hover:bg-amber-50/20 dark:hover:bg-amber-950/10 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {ca.id}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500 font-medium whitespace-nowrap">
                        {ca.createdDate}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{ca.memberName}</div>
                        <div className="text-[10px] text-zinc-400">{ca.role}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{ca.category}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          ca.type === "Credit" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}>
                          {ca.type === "Credit" ? "+ Addition" : "- Deduction"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-black text-sm text-zinc-900 dark:text-zinc-100">
                        ₹{ca.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400 max-w-[240px] truncate" title={ca.description}>
                        {ca.description}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          ca.status === "Disbursed" 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}>
                          {ca.status === "Disbursed" ? "✓ Disbursed" : "Approved / Pending"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canAddPayout && ca.status !== "Disbursed" && (
                            <button
                              type="button"
                              onClick={() => handleDisburseCustomItem(ca)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] cursor-pointer"
                            >
                              Disburse
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomItem(ca.id)}
                            className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
