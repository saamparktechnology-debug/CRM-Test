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

export function createProjectDetailViewAction22(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { expAmount, expTitle, setIsSavingExpense, selectedProject, expCategory, expPayee, user, loadProjectExpenses, setIsExpenseModalOpen, setExpTitle, setExpAmount, setExpPayee } = getCtrl();
    const __fn: any = async () => {
    const amtNum = parseFloat(expAmount) || 0
    if (!expTitle.trim() || amtNum <= 0) {
      alert("Please enter an expense title and valid amount.")
      return
    }
    setIsSavingExpense(true)
    try {
      const comp = selectedProject.companyId || "tech"
      const allExp = await fetchModuleDataFromDB<any[]>("expenses", [], comp).catch(() => [])
      const expId = `EXP-${Date.now().toString().slice(-6)}`
      const newExp = {
        id: expId,
        expenseNumber: expId,
        title: expTitle.trim(),
        amount: `₹${amtNum.toLocaleString("en-IN")}`,
        amountNum: amtNum,
        category: expCategory,
        date: new Date().toLocaleDateString("en-GB"),
        member: expPayee.trim() || user?.name || "Admin",
        status: "Approved",
        projectId: selectedProject.id,
        projectName: selectedProject.title,
        isProjectExpense: true,
        companyId: comp,
      }
      const updated = [newExp, ...allExp]
      await saveModuleDataToDB("expenses", updated, comp)
      await loadProjectExpenses()
      setIsExpenseModalOpen(false)
      setExpTitle("")
      setExpAmount("")
      setExpPayee("")
    } catch (err) {
      console.error("Failed to save project expense:", err)
    } finally {
      setIsSavingExpense(false)
    }
  };
    return __fn(...__args);
  };
}
