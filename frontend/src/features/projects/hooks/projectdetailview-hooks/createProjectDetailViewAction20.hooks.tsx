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
import { ProjectDetailViewSection1 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection1";
import { ProjectDetailViewSection2 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection2";
import { ProjectDetailViewSection3 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection3";
import { ProjectDetailViewSection4 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection4";
import { ProjectDetailViewSection5 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection5";
import { ProjectDetailViewSection6 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection6";
import { createProjectDetailViewHandler1 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler1.hooks";
import { createProjectDetailViewHandler2 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler2.hooks";
import { createProjectDetailViewHandler3 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler3.hooks";
import { createProjectDetailViewHandler4 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler4.hooks";
import { createProjectDetailViewHandler5 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler5.hooks";
import { createProjectDetailViewHandler6 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler6.hooks";
import {
  type ProjectDetailViewProps,
  DONUT_COLORS,
} from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers";

export function createProjectDetailViewAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      statusValue,
      selectedProject,
      setIsUpdateProgressModalOpen,
      setIsCompletionModalOpen,
      setIsSavingProgress,
      progressValue,
      progressLogNote,
      user,
      onSelectProject,
      setProgressLogNote,
    } = getCtrl();
    const __fn: any = async () => {
      if (
        (statusValue === "Completed" || statusValue === "Finished") &&
        selectedProject.status !== "Completed" &&
        selectedProject.status !== "Finished"
      ) {
        setIsUpdateProgressModalOpen(false);
        setIsCompletionModalOpen(true);
        return;
      }

      setIsSavingProgress(true);
      try {
        const updatedProject = {
          ...selectedProject,
          progress: Number(progressValue),
          status: statusValue as any,
        };
        if (progressLogNote.trim()) {
          const newMs: ProjectMilestone = {
            id: `log_${Date.now()}`,
            stage: "Custom",
            title: `Progress Update: ${progressValue}% (${statusValue})`,
            notes: progressLogNote.trim(),
            status: progressValue >= 100 ? "Completed" : "In Progress",
            developer: user?.name || user?.email || "Team Member",
            date: new Date().toISOString().split("T")[0],
          };
          updatedProject.milestones = [
            newMs,
            ...(selectedProject.milestones || []),
          ];
        }
        onSelectProject(updatedProject);

        const { updateProject } =
          await import("@/features/projects/services/projectService");
        await updateProject(selectedProject.id, updatedProject);

        setIsUpdateProgressModalOpen(false);
        setProgressLogNote("");
      } catch (e) {
        console.error("Failed to update progress:", e);
      } finally {
        setIsSavingProgress(false);
      }
    };
    return __fn(...__args);
  };
}
