"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign, Plus, Search, Check, Clock, Edit, X, 
  FolderKanban, User, Users, Briefcase, Filter, Award, 
  FileText, Printer, Download, ShieldCheck, Percent, 
  TrendingUp, CheckCircle2, Building2, Sparkles, AlertCircle, 
  ArrowUpRight, ExternalLink
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { PayrollService } from "@/services/hrService"
import { getProjects } from "@/features/projects/services/projectService"
import { getStoredUserAccountsAsync } from "@/features/users/services/userService"
import { Project } from "@/features/projects/types"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

export interface PayrollItem { 
  id: string
  employee: string
  employeeId?: string
  projectId?: string
  projectName?: string
  month: string
  basic: number
  allowances: number
  deductions: number
  net: number
  status: string 
}
