"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calculator, Plus, Search, Download, Trash2, CheckCircle2, 
  Clock, XCircle, FileText, Printer, X, Check, DollarSign,
  Briefcase, Users, TrendingUp, Percent, ArrowUpRight, ArrowDownRight,
  Receipt, Building2, Tag, Layers, CreditCard, ShieldAlert, Sparkles, User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems, markGlobalItemDeleted } from "@/lib/storageSync"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMember } from "@/features/projects/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { formatDisplayDate } from "@/lib/utils"

export interface ProjectExtraCharge {
  id: string
  projectId: string
  title: string
  amount: number
  category: string
  date: string
  payee?: string
  vendor?: string
  notes?: string
}

export interface ExpenseItem {
  id: string
  expenseNumber: string
  title: string
  amount: string
  amountNum: number
  category: string
  date: string
  member: string
  receiptUrl?: string
  status: "Approved" | "Pending" | "Rejected"
  notes?: string
  // Project-Wise Expense Attribution
  projectId?: string
  projectName?: string
  isProjectExpense?: boolean
  assignedMemberId?: string
  isExtraCharge?: boolean
  extraChargeCategory?: string
  companyId?: string
  branchId?: string
  branchName?: string
  subBranchId?: string
  subBranchName?: string
}

export type ExpenseTab = "all" | "project_wise"
