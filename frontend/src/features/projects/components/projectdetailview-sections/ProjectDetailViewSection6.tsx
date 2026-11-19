"use client";

import * as React from "react";
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
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Project,
  ProjectMilestone,
  isMarketingProject,
} from "@/features/projects/types";
import { addOrUpdateProjectMilestone } from "@/features/projects/services/projectService";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserAvatar } from "@/features/users/services/userService";
import {
  getInvoices,
  addInvoice,
  generateInvoiceNumber,
  updateInvoiceStatus,
  InvoiceItem,
  InvoiceStatus,
} from "@/features/invoice/services/invoiceService";
import { taskService } from "@/features/tasks/services/taskService";
import {
  Task,
  TaskPriority,
  TaskStatus,
  getTaskCountdownChip,
} from "@/features/tasks/types";
import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  filterGlobalDeletedItems,
} from "@/lib/storageSync";
import { printPDFReport, exportToExcel } from "@/lib/exportUtils";
import { formatDisplayDate } from "@/lib/utils";
import { OfficialQuotationDocument } from "@/features/quotations/components/OfficialQuotationDocument";
import { OfficialEstimateDocument } from "@/features/estimates/components/OfficialEstimateDocument";
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal";
import {
  DigitalMarketingPackage,
  createDefaultMarketingPackage,
} from "@/types/digitalMarketing";
import {
  type ProjectDetailViewProps,
  DONUT_COLORS,
} from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers";

export function ProjectDetailViewSection6({ ctrl }: { ctrl: any }) {
  const {
    isUpdateProgressModalOpen,
    selectedProject,
    setIsUpdateProgressModalOpen,
    progressValue,
    setProgressValue,
    statusValue,
    setStatusValue,
    progressLogNote,
    setProgressLogNote,
    handleSaveProgress,
    isSavingProgress,
    viewingQuotation,
    setViewingQuotation,
    viewingEstimate,
    setViewingEstimate,
    isCompletionModalOpen,
    setIsCompletionModalOpen,
    onSelectProject,
  } = ctrl;
  return (
    <>
      {/* ── UPDATE PROJECT PROGRESS MODAL (FOR TEAM MEMBERS & ADMINS) ── */}
      {isUpdateProgressModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                    Update Project Progress
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate max-w-[260px]">
                    {selectedProject.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUpdateProgressModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress % Slider & Number */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <label className="text-zinc-700 dark:text-zinc-300">
                  Completion Percentage
                </label>
                <span className="font-mono text-blue-600 text-sm font-extrabold">
                  {progressValue}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressValue}
                onChange={(e) => setProgressValue(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Project Status
              </label>
              <select
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
              >
                <option value="Open">Open (Pending Kickoff)</option>
                <option value="In Progress">
                  In Progress (Active Development)
                </option>
                <option value="Under Review">Under Review (Client / QA)</option>
                <option value="Hold">On Hold</option>
                <option value="Completed">Completed (100% Delivered)</option>
              </select>
            </div>

            {/* Progress Log Note */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Work Log / Milestone Note (Optional)
              </label>
              <textarea
                rows={2}
                value={progressLogNote}
                onChange={(e) => setProgressLogNote(e.target.value)}
                placeholder="e.g. Completed frontend dashboard UI and linked authentication APIs..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsUpdateProgressModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProgress}
                disabled={isSavingProgress}
                className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSavingProgress ? "Saving..." : "Save Progress"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── OFFICIAL DOCUMENT VIEWERS (QUOTATION, ESTIMATE) ── */}
      {viewingQuotation && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <OfficialQuotationDocument
            quotation={viewingQuotation}
            onClose={() => setViewingQuotation(null)}
          />
        </div>
      )}

      {viewingEstimate && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <OfficialEstimateDocument
            estimate={viewingEstimate}
            onClose={() => setViewingEstimate(null)}
          />
        </div>
      )}

      {/* DUAL CONFIRMATION PROJECT COMPLETION MODAL */}
      {isCompletionModalOpen && (
        <ProjectCompletionModal
          isOpen={isCompletionModalOpen}
          project={selectedProject}
          onClose={() => setIsCompletionModalOpen(false)}
          onConfirmComplete={async (completedData) => {
            const { updateProject } =
              await import("@/features/projects/services/projectService");
            const { sendProjectCompletionEmailNotification } =
              await import("@/services/emailNotificationService");

            const updated = await updateProject(selectedProject.id, {
              status: "Completed",
              progress: 100,
              completedAt: new Date().toISOString(),
              countdownStartDate: completedData.countdownStartDate,
              countdownEndDate: completedData.countdownEndDate,
              planDuration: completedData.planDuration,
              planType: completedData.planType as any,
              firstPostDate: completedData.firstPostDate,
              clientEmail: completedData.clientEmail,
            });

            onSelectProject(updated);

            if (completedData.notifyClient && completedData.clientEmail) {
              await sendProjectCompletionEmailNotification(
                updated,
                completedData.clientEmail,
                selectedProject.client,
                {
                  planType: completedData.planType,
                  countdownDuration: completedData.planDuration,
                  countdownStartDate: completedData.countdownStartDate,
                  countdownEndDate: completedData.countdownEndDate,
                  countdownNotice:
                    completedData.planType === "digital_marketing"
                      ? completedData.firstPostDate
                        ? `Campaign timeline started from 1st post on ${completedData.firstPostDate} and expires on ${completedData.countdownEndDate}.`
                        : "Campaign countdown paused until first creative post goes live."
                      : `Your service & hosting countdown started today (${new Date().toLocaleDateString("en-IN")}) and remains active until ${completedData.countdownEndDate}.`,
                },
              );
            }
          }}
        />
      )}
    </>
  );
}
