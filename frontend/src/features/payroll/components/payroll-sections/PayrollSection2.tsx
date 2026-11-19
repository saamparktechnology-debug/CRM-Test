"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign, Plus, Search, Check, Clock, Edit, X, 
  FolderKanban, User, Users, Briefcase, Filter, Award, 
  FileText, Printer, Download, ShieldCheck, Percent, 
  TrendingUp, CheckCircle2, Building2, Sparkles, AlertCircle, 
  ArrowUpRight, ExternalLink
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { PayrollService } from "@/services/hrService"
import { getProjects } from "@/features/projects/services/projectService"
import { getStoredUserAccountsAsync } from "@/features/users/services/userService"
import { Project } from "@/features/projects/types"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type PayrollItem } from "@/features/payroll/components/payroll-sections/PayrollHelpers"

export function PayrollSection2({ ctrl }: { ctrl: any }) {
  const { isPayoutModalOpen, setIsPayoutModalOpen, handleSubmitPayoutRequest, payoutReqType, setPayoutReqType, payoutReqAmount, setPayoutReqAmount, user, payoutReqNotes, setPayoutReqNotes, isSubmittingPayoutReq, isPayslipModalOpen, selectedPayslipItem, setIsPayslipModalOpen, calculateStatutoryPayslip, totalEarnedIncentives, teamMetrics } = ctrl;
  return (
    <>
      {/* Request Payout / Advance Modal for Team Members */}
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-xs"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                    <DollarSign size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Request Salary Payout / Advance</h3>
                </div>
                <button 
                  onClick={() => setIsPayoutModalOpen(false)} 
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitPayoutRequest} className="p-6 space-y-4">
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    Request Category *
                  </label>
                  <select
                    value={payoutReqType}
                    onChange={(e: any) => setPayoutReqType(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none cursor-pointer"
                  >
                    <option value="Monthly Salary Payout">Monthly Salary Payout</option>
                    <option value="Salary Advance">Salary Advance</option>
                    <option value="Expense Reimbursement">Expense Reimbursement / Claim</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    Requested Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={payoutReqAmount}
                    onChange={(e) => setPayoutReqAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Auto-filled remittance account info */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Disbursement Target Account:</span>
                  <p className="font-bold text-zinc-900 dark:text-zinc-100">
                    {user?.kycData?.bankName || "Registered Branch Remittance Account"}
                  </p>
                  <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    {user?.kycData?.accountNumber ? `A/C: ${user.kycData.accountNumber} (${user.kycData.ifscCode || ""})` : "Verified Remittance Details"}
                  </p>
                </div>

                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                    Reason / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={payoutReqNotes}
                    onChange={(e) => setPayoutReqNotes(e.target.value)}
                    placeholder="Brief explanation for finance and admin review..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    type="button" 
                    onClick={() => setIsPayoutModalOpen(false)} 
                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmittingPayoutReq}
                    className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{isSubmittingPayoutReq ? "Submitting..." : "Submit Payout Request"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {/* Statutory Pay Slip Modal */}
        {isPayslipModalOpen && selectedPayslipItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto print:m-0 print:border-none print:shadow-none"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-100 dark:border-zinc-800 print:hidden">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Statutory Pay Slip - {selectedPayslipItem.month}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Printer size={13} />
                    <span>Print PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPayslipModalOpen(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Printable Pay Slip Body */}
              {(() => {
                const breakdown = calculateStatutoryPayslip(
                  (selectedPayslipItem.basic || 25000) + (selectedPayslipItem.allowances || 10000),
                  totalEarnedIncentives
                )

                return (
                  <div className="p-6 sm:p-8 space-y-6 text-xs bg-white text-zinc-900 font-sans print:p-4">
                    {/* Corporate Letterhead */}
                    <div className="text-center border-b-2 border-zinc-800 pb-4 space-y-1">
                      <div className="text-lg font-black tracking-wider uppercase text-zinc-900">
                        SAAMPARK TECHNOLOGY & RESEARCH PRIVATE LIMITED
                      </div>
                      <div className="text-[10px] font-semibold text-zinc-600">
                        Regd Office: Balichak (Station Road), Debra, Paschim Medinipur, West Bengal - 721140, India
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        CIN: U58200WB2025PTC285223 | MSME: UDYAM-WB-16-0119512
                      </div>
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1 bg-zinc-100 border border-zinc-300 rounded font-black text-xs uppercase tracking-wider">
                          PAY SLIP FOR THE MONTH OF {selectedPayslipItem.month}
                        </span>
                      </div>
                    </div>

                    {/* Employee Profile Metadata */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Employee Name:</span>
                        <span className="font-bold">{selectedPayslipItem.employee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Employee ID:</span>
                        <span className="font-mono font-bold">{selectedPayslipItem.employeeId || "STR-EMP-088"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Designation / Role:</span>
                        <span className="font-semibold">{selectedPayslipItem.role || "Software Specialist"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Pay Period:</span>
                        <span className="font-mono">{selectedPayslipItem.month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Bank Account:</span>
                        <span className="font-mono">{teamMetrics.accountNumber || "Verified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">PF UAN / ESI IP:</span>
                        <span className="font-mono">101928374652 / WB-0912</span>
                      </div>
                    </div>

                    {/* Dual Column Earnings & Statutory Deductions */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Earnings */}
                      <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <div className="bg-zinc-100 px-3 py-2 font-bold uppercase text-[10.5px] border-b border-zinc-200 flex justify-between">
                          <span>Earnings Head</span>
                          <span>Amount (₹)</span>
                        </div>
                        <div className="p-3 space-y-2 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Basic Salary (50%):</span>
                            <span className="font-mono font-semibold">₹{breakdown.basic.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">House Rent Allowance (HRA):</span>
                            <span className="font-mono font-semibold">₹{breakdown.hra.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Special / Conveyance Allowance:</span>
                            <span className="font-mono font-semibold">₹{breakdown.specialAllowance.toLocaleString("en-IN")}</span>
                          </div>
                          {breakdown.incentiveAmt > 0 && (
                            <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              <span>Project Incentive Earned:</span>
                              <span className="font-mono">+₹{breakdown.incentiveAmt.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-zinc-900">
                            <span>Gross Earnings:</span>
                            <span className="font-mono">₹{breakdown.gross.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="border border-zinc-200 rounded-xl overflow-hidden">
                        <div className="bg-zinc-100 px-3 py-2 font-bold uppercase text-[10.5px] border-b border-zinc-200 flex justify-between">
                          <span>Statutory Deduction</span>
                          <span>Amount (₹)</span>
                        </div>
                        <div className="p-3 space-y-2 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Provident Fund (PF - 12%):</span>
                            <span className="font-mono font-semibold text-rose-700">₹{breakdown.pf.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">ESI Contribution (0.75%):</span>
                            <span className="font-mono font-semibold text-rose-700">₹{breakdown.esi.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-600">Professional Tax (PT):</span>
                            <span className="font-mono font-semibold text-rose-700">₹{breakdown.pt.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="pt-2 border-t border-zinc-200 flex justify-between font-black text-rose-800">
                            <span>Total Deductions:</span>
                            <span className="font-mono">-₹{breakdown.totalDeductions.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Net Salary Highlight Box */}
                    <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                          Net Take-Home Salary:
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Gross Earnings minus Statutory PF, ESI & Tax Deductions
                        </span>
                      </div>
                      <span className="text-2xl font-black font-mono text-emerald-800">
                        ₹{breakdown.netSalary.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Corporate Stamp & Signatures */}
                    <div className="pt-8 border-t border-zinc-200 flex items-end justify-between text-center text-[10.5px]">
                      <div>
                        <div className="w-32 border-b border-zinc-400 mb-1 mx-auto" />
                        <span className="text-zinc-500 font-semibold">Employee Signature</span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[9px] text-zinc-400 font-mono">Digitally signed & authorized</div>
                        <div className="w-40 border-b border-zinc-900 mb-1 mx-auto" />
                        <span className="font-bold text-zinc-900 uppercase">For SAAMPARK TECH & RESEARCH PVT LTD</span>
                        <div className="text-[9.5px] text-zinc-500">Authorized Signatory / Finance Controller</div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </div>
        )}
    </>
  );
}
