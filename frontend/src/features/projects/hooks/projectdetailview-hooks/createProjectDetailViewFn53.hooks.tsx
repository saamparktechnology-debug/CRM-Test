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

export function createProjectDetailViewFn53(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { msTitle, setIsSavingMilestone, editingMilestoneId, msStage, msStatus, msNotes, msCredentials, user, selectedProject, onSelectProject, setIsMilestoneModalOpen, setEditingMilestoneId, setMsTitle, setMsNotes, setMsCredentials } = getCtrl();
    const __fn: any = async () => {
    if (!msTitle.trim()) {
      alert("Please enter a milestone title (e.g. Frontend Done, Backend Done).")
      return
    }
    setIsSavingMilestone(true)
    try {
      const milestone: ProjectMilestone = {
        id: editingMilestoneId || `ms_${Date.now()}`,
        title: msTitle.trim(),
        stage: msStage,
        status: msStatus,
        notes: msNotes.trim() || undefined,
        credentials: msCredentials.trim() || undefined,
        updatedBy: user?.name || "Developer",
        updatedAt: new Date().toISOString(),
      }
      const updated = await addOrUpdateProjectMilestone(
        selectedProject.id,
        milestone,
        user?.name || "Developer"
      )
      onSelectProject(updated)
      setIsMilestoneModalOpen(false)
      setEditingMilestoneId(null)
      setMsTitle("")
      setMsNotes("")
      setMsCredentials("")
    } catch (err) {
      console.error("Error saving milestone:", err)
    } finally {
      setIsSavingMilestone(false)
    }
  };
    return __fn(...__args);
  };
}
