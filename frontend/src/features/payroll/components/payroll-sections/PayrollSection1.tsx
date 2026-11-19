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

export function PayrollSection1({ ctrl }: { ctrl: any }) {
  const { isModalOpen, setIsModalOpen, handleSubmit, setSelectionMode, setForm, selectionMode, selectedProjectId, handleProjectSelect, projects, selectedProjectMembers, form, handleMemberSelect, allUsers } = ctrl;
  return (
    <>
      {isModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600">
                    <DollarSign size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Generate Employee Payroll</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                {/* Mode Selector: Against Project vs Individual */}
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1.5">
                    Payroll Assignment Mode *
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionMode("project")
                        setForm(f => ({ ...f, employee: "", employeeId: "" }))
                      }}
                      className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        selectionMode === "project" 
                          ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs" 
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      <FolderKanban size={13} />
                      <span>Against a Project</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectionMode("individual")
                        setForm(f => ({ ...f, projectId: "", projectName: "", employee: "", employeeId: "" }))
                      }}
                      className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        selectionMode === "individual" 
                          ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-xs" 
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      <User size={13} />
                      <span>Individual Member</span>
                    </button>
                  </div>
                </div>

                {/* If Project Mode: Select Project First */}
                {selectionMode === "project" && (
                  <div className="space-y-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                    <div>
                      <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                        <FolderKanban size={13} className="text-blue-600" />
                        <span>Select Project *</span>
                      </label>
                      <select
                        required
                        value={selectedProjectId}
                        onChange={(e) => handleProjectSelect(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        <option value="">-- Choose a Project --</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.status})</option>
                        ))}
                      </select>
                    </div>

                    {selectedProjectId && (
                      <div>
                        <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1 flex items-center gap-1">
                          <Users size={13} className="text-blue-600" />
                          <span>Select Team Member against this Project *</span>
                        </label>
                        {selectedProjectMembers.length > 0 ? (
                          <select
                            required
                            value={form.employee}
                            onChange={(e) => handleMemberSelect(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="">-- Select Member --</option>
                            {selectedProjectMembers.map((m, idx) => (
                              <option key={m.id || idx} value={m.name}>
                                {m.name} {m.role ? `(${m.role})` : ""}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            No members assigned to this project yet. Please select another project or use Individual Member mode.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* If Individual Mode: Select from all team members directly */}
                {selectionMode === "individual" && (
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1 flex items-center gap-1">
                      <User size={13} className="text-blue-600" />
                      <span>Select Individual Team Member *</span>
                    </label>
                    <select
                      required
                      value={form.employee}
                      onChange={(e) => handleMemberSelect(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="">-- Select Employee --</option>
                      {allUsers.map((u, idx) => (
                        <option key={u.id || idx} value={u.name || u.email}>
                          {u.name || u.email} {u.role ? `(${u.role})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Month Picker */}
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                    Payroll Month *
                  </label>
                  <input 
                    type="month" 
                    required 
                    value={form.month} 
                    onChange={(e) => setForm({...form, month: e.target.value})} 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none cursor-pointer" 
                  />
                </div>

                {/* Salary Breakdown Inputs */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Basic Pay (₹)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      value={form.basic || ""} 
                      onChange={(e) => setForm({...form, basic: Number(e.target.value)})} 
                      placeholder="0"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Allowances (₹)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      value={form.allowances || ""} 
                      onChange={(e) => setForm({...form, allowances: Number(e.target.value)})} 
                      placeholder="0"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">
                      Deductions (₹)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      value={form.deductions || ""} 
                      onChange={(e) => setForm({...form, deductions: Number(e.target.value)})} 
                      placeholder="0"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none" 
                    />
                  </div>
                </div>

                {/* Net Total preview */}
                <div className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300 font-semibold">Net Calculated Salary:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-base font-mono">
                    ₹{(form.basic + form.allowances - form.deductions).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-4 py-2 text-xs text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                  >
                    Generate Payroll
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
    </>
  );
}
