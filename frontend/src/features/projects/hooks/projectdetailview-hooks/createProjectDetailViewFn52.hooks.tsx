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
import { ProjectDetailViewSection1 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection1"
import { ProjectDetailViewSection2 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection2"
import { ProjectDetailViewSection3 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection3"
import { ProjectDetailViewSection4 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection4"
import { ProjectDetailViewSection5 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection5"
import { ProjectDetailViewSection6 } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewSection6"
import { createProjectDetailViewHandler1 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler1.hooks"
import { createProjectDetailViewHandler2 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler2.hooks"
import { createProjectDetailViewHandler3 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler3.hooks"
import { createProjectDetailViewHandler4 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler4.hooks"
import { createProjectDetailViewHandler5 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler5.hooks"
import { createProjectDetailViewHandler6 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewHandler6.hooks"
import { type ProjectDetailViewProps, DONUT_COLORS } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"
import { createProjectDetailViewAction20 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction20.hooks"
import { createProjectDetailViewAction21 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction21.hooks"
import { createProjectDetailViewAction22 } from "@/features/projects/hooks/projectdetailview-hooks/createProjectDetailViewAction22.hooks"

export function createProjectDetailViewFn52(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { taskTitle, setIsSavingTask, selectedProject, taskDeadline, taskAssignedTo, user, taskPriority, loadProjectTasks, setIsTaskModalOpen, setTaskTitle, setTaskDeadline } = getCtrl();
    const __fn: any = async () => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.")
      return
    }
    setIsSavingTask(true)
    try {
      const comp = selectedProject.companyId || "tech"
      await taskService.addTask({
        title: taskTitle.trim(),
        deadline: taskDeadline || selectedProject.deadline || "None",
        relatedTo: selectedProject.title,
        projectName: selectedProject.title,
        client: selectedProject.client,
        source: "projects",
        sourceId: selectedProject.id,
        assignedTo: taskAssignedTo || (selectedProject.members?.[0]?.name || user?.name || "Developer"),
        priority: taskPriority,
        status: "To do",
        companyId: comp,
      }, comp)
      await loadProjectTasks()
      setIsTaskModalOpen(false)
      setTaskTitle("")
      setTaskDeadline("")
    } catch (err) {
      console.error("Failed to add project task:", err)
    } finally {
      setIsSavingTask(false)
    }
  };
    return __fn(...__args);
  };
}
