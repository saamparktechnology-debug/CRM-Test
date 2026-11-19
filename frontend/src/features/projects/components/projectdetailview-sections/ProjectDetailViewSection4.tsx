"use client"

import * as React from "react"
import {
  ArrowLeft,
  Star,
  Clock,
  Settings,
  Zap,
  Play,
  Pause,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Mail,
  X,
  MoreVertical,
  Layers,
  CheckCircle2,
  Code2,
  Database,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  FileText,
  Printer,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Check,
  User as UserIcon,
  Trash2,
  Download,
  CreditCard,
  Briefcase,
  Megaphone,
  Video,
  Image as ImageIcon,
  CheckSquare,
  Eye,
  FileCheck,
  Users,
  MapPin,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Project, ProjectMilestone, isMarketingProject } from "@/features/projects/types"
import { addOrUpdateProjectMilestone } from "@/features/projects/services/projectService"
import { useAuthStore } from "@/store/useAuthStore"
import { getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, addInvoice, generateInvoiceNumber, updateInvoiceStatus, InvoiceItem, InvoiceStatus } from "@/features/invoice/services/invoiceService"
import { taskService } from "@/features/tasks/services/taskService"
import { Task, TaskPriority, TaskStatus, getTaskCountdownChip } from "@/features/tasks/types"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { printPDFReport, exportToExcel } from "@/lib/exportUtils"
import { formatDisplayDate } from "@/lib/utils"
import { OfficialQuotationDocument } from "@/features/quotations/components/OfficialQuotationDocument"
import { OfficialEstimateDocument } from "@/features/estimates/components/OfficialEstimateDocument"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { type ProjectDetailViewProps, DONUT_COLORS } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"

export function ProjectDetailViewSection4({ ctrl }: { ctrl: any }) {
  const { isMilestoneModalOpen, editingMilestoneId, setIsMilestoneModalOpen, msTitle, setMsTitle, msStage, setMsStage, msStatus, setMsStatus, msNotes, setMsNotes, msCredentials, setMsCredentials, isSavingMilestone, handleSaveMilestone, isInvoiceModalOpen, setIsInvoiceModalOpen, selectedProject, invDescription, setInvDescription, invAmount, setInvAmount, invGstRate, setInvGstRate, invDate, setInvDate, invDueDate, setInvDueDate, invStatus, setInvStatus, isSavingInvoice, handleSaveProjectInvoice } = ctrl;
  return (
    <>
      {/* ---------------- DEVELOPER MILESTONE / UPDATE MODAL ---------------- */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Code2 size={16} className="text-blue-600" />
                <span>{editingMilestoneId ? "Edit Progress Update" : "Record Developer Progress"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-zinc-500 font-medium mb-1">Update Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Done, Backend API Implemented, Staging Release"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Development Stage</label>
                  <select
                    value={msStage}
                    onChange={(e) => setMsStage(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="Frontend">Frontend Development</option>
                    <option value="Backend">Backend & Database</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Testing">Testing & QA</option>
                    <option value="Deployment">Live Deployment</option>
                    <option value="Credentials">Credentials & Access</option>
                    <option value="Custom">Custom Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Status</label>
                  <select
                    value={msStatus}
                    onChange={(e) => setMsStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold"
                  >
                    <option value="Completed">Completed ✅</option>
                    <option value="In Progress">In Progress ⏳</option>
                    <option value="Pending">Pending ⏸️</option>
                    <option value="Hold">On Hold 🛑</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Progress Details & Developer Notes</label>
                <textarea
                  rows={3}
                  placeholder="Explain details of completed work (e.g. Added auth tokens, responsive layout, Stripe webhook)..."
                  value={msNotes}
                  onChange={(e) => setMsNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1 flex items-center gap-1">
                  <KeyRound size={12} className="text-amber-500" />
                  <span>Deployment URLs / Server & DB Credentials (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Staging URL: https://staging.example.com | Admin User: dev@example.com"
                  value={msCredentials}
                  onChange={(e) => setMsCredentials(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsMilestoneModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingMilestone}
                onClick={handleSaveMilestone}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingMilestone ? "Saving..." : "Save Progress Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PROJECT INVOICE GENERATOR MODAL ---------------- */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Receipt size={16} className="text-emerald-600" />
                <span>Generate Tax Invoice for Project</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-zinc-600 dark:text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Project:</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-100">{selectedProject.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Client:</span>
                  <span className="font-bold text-blue-600">{selectedProject.client}</span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-500 font-medium mb-1">Deliverable / Line Item Description *</label>
                <input
                  type="text"
                  value={invDescription}
                  onChange={(e) => setInvDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Base Amount (₹) *</label>
                  <input
                    type="number"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">GST Rate (%)</label>
                  <select
                    value={invGstRate}
                    onChange={(e) => setInvGstRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200"
                  >
                    <option value={0}>0% (Non-GST / Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% Standard GST</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-500 font-medium">Invoice Date *</label>
                    <span className="text-[10px] text-emerald-600 font-bold">Today</span>
                  </div>
                  <input
                    type="date"
                    value={invDate}
                    onChange={(e) => setInvDate(e.target.value)}
                    title="Invoice Date (Default: Today. Select any past or future date)"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs font-bold"
                  />
                  <div className="flex items-center gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setInvDate(new Date().toISOString().split("T")[0])}
                      className="text-[9px] font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Today
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        const y = new Date()
                        y.setDate(y.getDate() - 1)
                        setInvDate(y.toISOString().split("T")[0])
                      }}
                      className="text-[9px] font-bold text-zinc-500 hover:underline cursor-pointer"
                    >
                      Yesterday
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-zinc-500 font-medium mb-1">Status</label>
                  <select
                    value={invStatus}
                    onChange={(e) => setInvStatus(e.target.value as InvoiceStatus)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold text-xs"
                  >
                    <option value="Payment Pending">Payment Pending</option>
                    <option value="Draft">Draft</option>
                    <option value="Partially paid">Partially Paid</option>
                    <option value="Fully paid">Fully Paid</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                  <span>Base Amount:</span>
                  <span>₹{(parseFloat(invAmount) || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                  <span>GST ({invGstRate}%):</span>
                  <span>₹{(((parseFloat(invAmount) || 0) * invGstRate) / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-300 text-sm border-t border-emerald-200 dark:border-emerald-800 pt-1">
                  <span>Total Invoice Value:</span>
                  <span>₹{Math.round((parseFloat(invAmount) || 0) + (((parseFloat(invAmount) || 0) * invGstRate) / 100)).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingInvoice}
                onClick={handleSaveProjectInvoice}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSavingInvoice ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
