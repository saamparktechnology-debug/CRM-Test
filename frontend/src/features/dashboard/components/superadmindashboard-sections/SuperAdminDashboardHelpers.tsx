"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  GitBranch,
  Users,
  Briefcase,
  IndianRupee,
  ChevronDown,
  Eye,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Plus,
  Clock,
  FileText,
  CreditCard,
  FolderKanban,
  Check,
  TrendingUp,
  ArrowUp,
  MapPin,
  Monitor,
  CheckSquare,
  Calendar,
  PieChart,
  AlertCircle,
  Bell,
  Grid,
  DollarSign,
  Sparkles,
  Layers
} from "lucide-react"
import Link from "next/link"
import { useAuthStore, getCompanyFullName, isMatchingCompany, isMatchingBranch, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getActivityLogs, ActivityLog } from "@/services/activityLogService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { Widget } from "@/features/dashboard/components/Widget"
import { KPICard } from "@/features/dashboard/components/KPICard"
import { DonutChart } from "@/features/dashboard/components/DonutChart"
import { getUserAvatar } from "@/features/users/services/userService"
import { taskService } from "@/features/tasks/services/taskService"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "@/features/tasks/types"
import { Project } from "@/features/projects/types"

export interface CompanyRow {
  id: string
  name: string
  branches: number
  users: number
  projects: number
  revenue: number
  outstanding: number
  percent: number
  color: string
}

export interface BranchRow {
  id: string
  name: string
  companyName: string
  users: number
  projects: number
  revenue: number
  outstanding: number
}

export function parseAmt(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val
  if (!val) return 0
  const clean = String(val).replace(/[^0-9.-]+/g, "")
  const parsed = parseFloat(clean)
  return isNaN(parsed) ? 0 : parsed
}

export function formatINR(val: any): string {
  const num = typeof val === "number" ? (isNaN(val) ? 0 : val) : parseAmt(val)
  return `₹${Math.round(num).toLocaleString("en-IN")}`
}

export function formatTime(secs: number): string {
  const s = Math.max(0, Number(secs) || 0)
  const h = Math.floor(s / 3600).toString().padStart(2, "0")
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0")
  const sec = (s % 60).toString().padStart(2, "0")
  return `${h}:${m}:${sec}`
}
