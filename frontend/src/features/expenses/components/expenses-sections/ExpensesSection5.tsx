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

export function ExpensesSection5({ ctrl }: { ctrl: any }) {
  const { isAddExtraChargeModalOpen, currentProject, setIsAddExtraChargeModalOpen, handleAddExtraCharge, extraChargeTitle, setExtraChargeTitle, extraChargeCategory, setExtraChargeCategory, extraChargeAmount, setExtraChargeAmount, extraChargeVendor, setExtraChargeVendor, extraChargeNotes, setExtraChargeNotes } = ctrl;
  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── MODAL: ADD CUSTOM PROJECT EXTRA CHARGE ─────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddExtraChargeModalOpen && currentProject && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Tag size={18} className="text-purple-600" />
                  <span>Add Direct Project Extra Charge</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddExtraChargeModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddExtraCharge} className="p-6 space-y-4 text-xs">
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-[11px] text-purple-700 dark:text-purple-300 font-bold block">
                    Target Project: {currentProject.title}
                  </span>
                  <span className="text-[10px] text-zinc-500">Client: {currentProject.client}</span>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Charge Title / Item *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Subcontractor Mobile App Developer Fees"
                    value={extraChargeTitle}
                    onChange={(e) => setExtraChargeTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Charge Category</label>
                    <select
                      value={extraChargeCategory}
                      onChange={(e) => setExtraChargeCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    >
                      <option value="Subcontractor & Specialist Fees">Subcontractor &amp; Specialist Fees</option>
                      <option value="Material & Direct Supply">Material &amp; Direct Supply</option>
                      <option value="Dedicated Cloud VM & Hosting">Dedicated Cloud VM &amp; Hosting</option>
                      <option value="Domain & SSL Certificates">Domain &amp; SSL Certificates</option>
                      <option value="Third-Party API Licenses">Third-Party API Licenses</option>
                      <option value="Hardware / Equipment Rental">Hardware / Equipment Rental</option>
                      <option value="Logistics & Travel">Logistics &amp; Travel</option>
                      <option value="Other Project Cost">Other Project Cost</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 12000"
                      value={extraChargeAmount}
                      onChange={(e) => setExtraChargeAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Payee / Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CloudTech Solutions Ltd / Rajib Sen"
                    value={extraChargeVendor}
                    onChange={(e) => setExtraChargeVendor(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Notes / Scope Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Milestone 2 backend API development fees"
                    value={extraChargeNotes}
                    onChange={(e) => setExtraChargeNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddExtraChargeModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                  >
                    Apply Extra Charge
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
