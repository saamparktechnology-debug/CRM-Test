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

export function createProjectDetailViewAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { invAmount, setIsSavingInvoice, selectedProject, invDate, invGstRate, invDueDate, invStatus, user, invDescription, loadProjectInvoices, setIsInvoiceModalOpen } = getCtrl();
    const __fn: any = async () => {
    const amtNum = parseFloat(invAmount) || 0
    if (amtNum <= 0) {
      alert("Please enter a valid invoice amount.")
      return
    }
    setIsSavingInvoice(true)
    try {
      const comp = selectedProject.companyId || "tech"
      const allInvs = await getInvoices(comp)
      const invId = generateInvoiceNumber(allInvs, invDate || new Date(), invGstRate === 0)
      const gstAmt = (amtNum * invGstRate) / 100
      const totalAmt = amtNum + gstAmt

      const newInv: InvoiceItem = {
        id: invId,
        client: selectedProject.client,
        project: selectedProject.title,
        billDate: invDate || new Date().toISOString().split("T")[0],
        invoiceDate: invDate || new Date().toISOString().split("T")[0],
        dueDate: invDueDate || selectedProject.deadline || new Date().toISOString().split("T")[0],
        baseAmount: amtNum,
        gstRate: invGstRate,
        gstAmount: gstAmt,
        totalInvoiced: `₹${Math.round(totalAmt).toLocaleString("en-IN")}`,
        paymentReceived: "₹0",
        due: `₹${Math.round(totalAmt).toLocaleString("en-IN")}`,
        status: invStatus,
        billedBy: user?.name || "Admin",
        companyId: comp,
        items: [
          {
            id: `line_${Date.now()}`,
            serviceName: invDescription || `Deliverable for ${selectedProject.title}`,
            qty: 1,
            unit: "Job",
            rate: amtNum,
            gstRate: invGstRate,
            gstAmount: gstAmt,
            totalAmount: totalAmt,
          },
        ],
      }

      await addInvoice(newInv, comp)
      await loadProjectInvoices()
      setIsInvoiceModalOpen(false)
    } catch (err) {
      console.error("Error creating project invoice:", err)
      alert("Failed to create invoice. Please try again.")
    } finally {
      setIsSavingInvoice(false)
    }
  };
    return __fn(...__args);
  };
}
