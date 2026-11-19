"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calculator, Plus, Search, Download, Trash2, CheckCircle2, 
  Clock, XCircle, FileText, Printer, X, Check, DollarSign,
  Briefcase, Users, TrendingUp, Percent, ArrowUpRight, ArrowDownRight,
  Receipt, Building2, Tag, Layers, CreditCard, ShieldAlert, Sparkles, User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems, markGlobalItemDeleted } from "@/lib/storageSync"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMember } from "@/features/projects/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { formatDisplayDate } from "@/lib/utils"
import { type ProjectExtraCharge, type ExpenseItem, type ExpenseTab } from "@/features/expenses/components/expenses-sections/ExpensesHelpers"

export function ExpensesSection4({ ctrl }: { ctrl: any }) {
  const { isAddModalOpen, setIsAddModalOpen, handleAddExpense, availableSubBranchesForForm, formCompanyId, setFormCompanyId, setFormBranchId, setFormSubBranchId, companies, formBranchId, availableBranchesForForm, formSubBranchId, isProjectScoped, setIsProjectScoped, formProjectId, setFormProjectId, projects, member, setMember, user, title, setTitle, category, setCategory, amount, setAmount, receiptUrl, setReceiptUrl } = ctrl;
  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: RECORD EXPENSE ─────────────────────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Calculator size={18} className="text-blue-600" />
                  <span>Record Operational Expense</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
                {/* Company, Branch & Sub-Branch Selection */}
                <div className={`p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 grid grid-cols-1 ${availableSubBranchesForForm.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-2.5`}>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">Company *</label>
                    <select
                      value={formCompanyId}
                      onChange={(e) => {
                        setFormCompanyId(e.target.value)
                        setFormBranchId("")
                        setFormSubBranchId("")
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    >
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.brand_name || c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">Branch Location</label>
                    <select
                      value={formBranchId}
                      onChange={(e) => {
                        setFormBranchId(e.target.value)
                        setFormSubBranchId("")
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                    >
                      <option value="">🏢 Company HQ (All Branches)</option>
                      {availableBranchesForForm.map(b => (
                        <option key={b.id} value={b.id}>📍 {b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  {availableSubBranchesForForm.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">Sub-Branch Partner</label>
                      <select
                        value={formSubBranchId}
                        onChange={(e) => setFormSubBranchId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 rounded-lg text-xs font-semibold"
                      >
                        <option value="">-- Direct Branch Expense --</option>
                        {availableSubBranchesForForm.map(sb => (
                          <option key={sb.id} value={sb.id}>🤝 {sb.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Project Association Toggle */}
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-blue-600" />
                      <span>Associate with Client Project?</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={isProjectScoped}
                      onChange={(e) => setIsProjectScoped(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                  {isProjectScoped && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">Select Project *</label>
                        <select
                          value={formProjectId}
                          onChange={(e) => setFormProjectId(e.target.value)}
                          required={isProjectScoped}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                        >
                          <option value="">Choose Project</option>
                          {projects.map((p) => (
                            <option key={p.id} value={p.id}>{p.title}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-600 dark:text-zinc-400 mb-0.5">Assigned Specialist</label>
                        <select
                          value={member}
                          onChange={(e) => setMember(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                        >
                          <option value={user?.name || "Admin"}>{user?.name || "Admin"} (Current User)</option>
                          {formProjectId && projects.find(p => p.id === formProjectId)?.members?.map(m => (
                            <option key={m.name} value={m.name}>{m.name} ({m.role || "Member"})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Expense Title / Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AWS Dedicated Database or Design Stock Assets"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    >
                      <option value="Cloud & Server Infrastructure">Cloud &amp; Server Infrastructure</option>
                      <option value="SaaS & Software Subscriptions">SaaS &amp; Software Subscriptions</option>
                      <option value="Subcontractor & Freelancer Fees">Subcontractor &amp; Freelancer Fees</option>
                      <option value="Design Assets & Stock Media">Design Assets &amp; Stock Media</option>
                      <option value="Office & Operational Utilities">Office &amp; Operational Utilities</option>
                      <option value="Marketing & Lead Acquisition">Marketing &amp; Lead Acquisition</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 18500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                {!isProjectScoped && (
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Paid By / Team Member</label>
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => setMember(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Receipt / Invoice Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                  >
                    Record Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
