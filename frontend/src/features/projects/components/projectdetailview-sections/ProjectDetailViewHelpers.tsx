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

export interface ProjectDetailViewProps {
  projects: Project[]
  selectedProject: Project
  initialTab?: string
  hasMarketingAccess?: boolean
  onSelectProject: (project: Project) => void
  onBackToTable: () => void
  onOpenEditModal: (project: Project) => void
}

export const DONUT_COLORS = {
  todo: "#F59E0B",       // Orange
  inProgress: "#06B6D4", // Teal
  review: "#8B5CF6",     // Purple
  done: "#10B981",       // Green
}
